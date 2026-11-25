"""
Hybrid retrieval engine (BM25 + ChromaDB semantic search + metadata filtering).
Strictly restricts verified-answer retrieval to domain='consumer_rights_india'
and source_status='approved'. Also surfaces pending_review/superseded notices.
"""
from __future__ import annotations

import json
import pickle
import re
from dataclasses import dataclass
from typing import Dict, List, Optional, Tuple

import chromadb
from rank_bm25 import BM25Okapi
from sklearn.preprocessing import normalize

from app.config import settings
from app.models.schemas import ChunkRecord, ConsumerIssueCategory, SourceManifestRecord


def _tokenize(text: str) -> List[str]:
    return re.findall(r"[a-z0-9]+", text.lower())


def _expand_legal_query(query: str, issue_category: ConsumerIssueCategory) -> str:
    """
    Deterministic consumer-symptom-to-statutory-vocabulary expansion (stays strictly
    within consumer protection terminology, never injects legal conclusions).
    """
    low = query.lower()
    extra: List[str] = []
    if any(w in low for w in ["damaged", "broken", "cracked", "faulty", "stopped working", "defect", "defective"]):
        extra.extend(["defect", "defective", "goods", "remove", "replace", "return price", "compensation", "section 39"])
    if any(w in low for w in ["online", "amazon", "flipkart", "website", "app", "e-commerce", "ecommerce", "marketplace"]):
        extra.extend(["e-commerce", "grievance officer", "forty-eight hours", "one month", "rule 4", "rule 5"])
    if any(w in low for w in ["not responded", "no response", "escalate", "helpline", "nch"]):
        extra.extend(["national consumer helpline", "1915", "grievance officer", "consumer commission"])
    if any(w in low for w in ["refund", "replace", "replacement", "repair", "remedy", "remedies"]):
        extra.extend(["section 39", "remove the defect", "replace the goods", "return to the complainant"])
    if any(w in low for w in ["how long", "time limit", "limitation", "years", "deadline"]):
        extra.extend(["limitation", "two years", "section 69", "sufficient cause"])
    if any(w in low for w in ["which commission", "lakh", "crore", "jurisdiction", "pecuniary"]):
        extra.extend(["district commission", "state commission", "national commission", "fifty lakh", "two crore", "consideration"])
    if any(w in low for w in ["defines", "definition", "meaning of", "who is a consumer"]):
        extra.extend(["definitions", "section 2"])
    extra.append(issue_category.replace("_", " "))
    return f"{query} {' '.join(extra)}"


@dataclass
class RetrievedPassage:
    chunk: ChunkRecord
    source: SourceManifestRecord
    score: float
    bm25_rank: Optional[int] = None
    vector_rank: Optional[int] = None


class HybridRetriever:
    def __init__(self) -> None:
        self.manifest: Dict[str, SourceManifestRecord] = {}
        self.chunks: Dict[str, ChunkRecord] = {}
        self.approved_chunks: List[ChunkRecord] = []
        self.pending_sources: List[SourceManifestRecord] = []
        self.bm25: Optional[BM25Okapi] = None
        self.vectorizer = None
        self.svd = None
        self.chroma_collection = None
        self._load()

    def _load(self) -> None:
        if settings.SOURCE_MANIFEST_PATH.exists():
            raw_m = json.loads(settings.SOURCE_MANIFEST_PATH.read_text(encoding="utf-8"))
            for item in raw_m:
                rec = SourceManifestRecord(**item)
                self.manifest[rec.source_id] = rec
                if rec.status in ("pending_review", "unknown_currency", "superseded"):
                    self.pending_sources.append(rec)

        if settings.CHUNKS_PATH.exists():
            raw_c = json.loads(settings.CHUNKS_PATH.read_text(encoding="utf-8"))
            for item in raw_c:
                c = ChunkRecord(**item)
                self.chunks[c.chunk_id] = c
                if c.domain == settings.DOMAIN and c.source_status == "approved":
                    self.approved_chunks.append(c)

        if self.approved_chunks:
            corpus_tokens = [
                _tokenize(f"{c.heading or ''} {c.section or ''} {c.subsection or ''} {c.rule or ''} {c.text}")
                for c in self.approved_chunks
            ]
            self.bm25 = BM25Okapi(corpus_tokens)

        embedder_path = settings.VECTOR_DB_PATH / "embedder.pkl"
        chroma_path = settings.VECTOR_DB_PATH / "chroma"
        if embedder_path.exists() and chroma_path.exists():
            try:
                with open(embedder_path, "rb") as f:
                    emb = pickle.load(f)
                self.vectorizer = emb["vectorizer"]
                self.svd = emb["svd"]
                client = chromadb.PersistentClient(path=str(chroma_path))
                self.chroma_collection = client.get_collection("satya_consumer_rights")
            except Exception:
                self.chroma_collection = None

    def reload(self) -> None:
        self.manifest.clear()
        self.chunks.clear()
        self.approved_chunks.clear()
        self.pending_sources.clear()
        self._load()

    def retrieve(
        self,
        query: str,
        issue_category: ConsumerIssueCategory,
        secondary_categories: Optional[List[ConsumerIssueCategory]] = None,
        top_k: int = 6,
    ) -> Tuple[List[RetrievedPassage], List[SourceManifestRecord]]:
        if not self.approved_chunks:
            return [], []

        low = query.lower()
        expanded_query = _expand_legal_query(query, issue_category)
        # 1. BM25 retrieval over approved consumer-rights chunks
        q_tokens = _tokenize(expanded_query)
        bm25_scores = self.bm25.get_scores(q_tokens) if self.bm25 else [0.0] * len(self.approved_chunks)
        bm25_ranked = sorted(
            range(len(self.approved_chunks)),
            key=lambda i: bm25_scores[i],
            reverse=True,
        )[:20]
        bm25_rank_map = {
            self.approved_chunks[idx].chunk_id: rank + 1
            for rank, idx in enumerate(bm25_ranked)
            if bm25_scores[idx] > 0
        }

        # 2. Vector retrieval via ChromaDB (filtered to approved + domain)
        vector_rank_map: Dict[str, int] = {}
        if self.chroma_collection is not None and self.vectorizer is not None and self.svd is not None:
            try:
                q_tfidf = self.vectorizer.transform([expanded_query])
                q_emb = normalize(self.svd.transform(q_tfidf)).tolist()
                res = self.chroma_collection.query(
                    query_embeddings=q_emb,
                    n_results=min(20, len(self.approved_chunks)),
                    where={
                        "$and": [
                            {"domain": {"$eq": settings.DOMAIN}},
                            {"source_status": {"$eq": "approved"}},
                        ]
                    },
                )
                for rank, cid in enumerate(res.get("ids", [[]])[0], 1):
                    vector_rank_map[cid] = rank
            except Exception:
                pass

        # 3. Reciprocal Rank Fusion + explicit legal locator / topic-tag boosts
        target_tags = {issue_category}
        if secondary_categories:
            target_tags.update(secondary_categories)

        # Detect explicit section / rule mentions like "section 2(11)", "section 39", "section 69"
        sec_matches = re.findall(r"section\s+(\d{1,3})(?:\s*\((\d{1,2})\))?", low)
        rule_matches = re.findall(r"rule\s+(\d{1,2})", low)

        scored: List[Tuple[float, ChunkRecord]] = []
        for c in self.approved_chunks:
            rrf = 0.0
            if c.chunk_id in bm25_rank_map:
                rrf += 1.0 / (20 + bm25_rank_map[c.chunk_id])
            if c.chunk_id in vector_rank_map:
                rrf += 1.0 / (20 + vector_rank_map[c.chunk_id])

            # Topic tag alignment boost
            overlap_tags = len(target_tags.intersection(set(c.topic_tags)))
            if overlap_tags > 0:
                rrf += 0.015 * overlap_tags

            # Exact statutory section/subsection boost
            for sec_num, sub_num in sec_matches:
                if c.section == sec_num:
                    if sub_num and c.subsection == f"({sub_num})":
                        rrf += 0.12
                    elif not sub_num:
                        rrf += 0.06

            for r_num in rule_matches:
                if c.rule == r_num:
                    rrf += 0.06

            # Statutory hierarchy preference: Act / Central Rules / CCPA Guidelines > Charter/Portal
            src = self.manifest.get(c.source_id)
            if src:
                if src.authority_type == "central_legislation":
                    rrf += 0.008
                elif src.authority_type in ("central_rules", "ccpa_guidelines"):
                    rrf += 0.006

            # Specific domain-critical adjustments:
            # - Definition queries prioritize Section 2 definitions
            if any(k in low for k in ["define", "defines", "definition", "meaning of", "who is a consumer"]):
                if c.source_id == "consumer_protection_act_2019" and c.section == "2":
                    rrf += 0.06
            # - Defective goods / remedies prioritize Section 2(10), Section 39(1), and E-Commerce Rule 4/5 if online
            if issue_category in ("defective_goods", "refund_replacement_repair"):
                if c.chunk_id in ("cpa_2019_s2_10", "cpa_2019_s39_1_1", "cpa_2019_s2_7"):
                    rrf += 0.055
            # - Limitation queries prioritize Section 69
            if any(k in low for k in ["how long", "limitation", "time limit", "two years", "condonation", "delay"]):
                if c.chunk_id == "cpa_2019_s69":
                    rrf += 0.09
            # - If query asks about jurisdiction / lakh / crore, boost Jurisdiction Rules 2021!
            if any(k in low for k in ["jurisdiction", "lakh", "crore", "which commission", "pecuniary", "35 lakh", "50 lakh", "2 crore"]):
                if c.source_id == "jurisdiction_rules_2021":
                    rrf += 0.07
            # - If query asks about filing fees, boost CDRC Amendment Rules 2023 over 2020 table!
            if any(k in low for k in ["fee", "fees", "cost to file", "how much to file"]):
                if c.source_id == "cdrc_amendment_rules_2023":
                    rrf += 0.08
            # - If query asks about NCH vs Commission or grievance route, boost Citizen Charter + NCH portal + Sec 34/35
            if any(k in low for k in ["helpline", "nch", "1915", "difference between", "grievance route", "not responded", "escalate"]):
                if c.source_id in ("doca_citizen_charter_2025_26", "nch_official_portal"):
                    rrf += 0.05
                if c.chunk_id in ("cpa_2019_s34_1_1", "cpa_2019_s35_1_1"):
                    rrf += 0.04
            # - Dark patterns queries prioritize CCPA Dark Patterns Guidelines 2023
            if any(k in low for k in ["dark pattern", "dark patterns", "basket sneaking", "confirm shaming", "false urgency"]):
                if c.source_id == "ccpa_dark_patterns_guidelines_2023":
                    rrf += 0.10
            # - If query asks about e-commerce grievance, boost E-Commerce Rules 2020 Rule 4 & 5
            if any(k in low for k in ["e-commerce", "ecommerce", "online", "platform", "grievance officer", "marketplace"]) and "dark pattern" not in low:
                if c.source_id == "ecommerce_rules_2020" and c.rule in ("4", "5", "6"):
                    rrf += 0.07

            if rrf > 0:
                scored.append((rrf, c))

        scored.sort(key=lambda x: x[0], reverse=True)
        top_chunks = scored[:top_k]

        passages: List[RetrievedPassage] = []
        for s, ch in top_chunks:
            src = self.manifest[ch.source_id]
            passages.append(
                RetrievedPassage(
                    chunk=ch,
                    source=src,
                    score=round(s, 5),
                    bm25_rank=bm25_rank_map.get(ch.chunk_id),
                    vector_rank=vector_rank_map.get(ch.chunk_id),
                )
            )

        # Check if any pending_review / non-approved sources are relevant to the query (freshness notice)
        relevant_pending: List[SourceManifestRecord] = []
        for p_src in self.pending_sources:
            if any(t in target_tags for t in p_src.topic_tags) or (
                "e-commerce" in low or "ecommerce" in low or "online" in low
            ) and "ecommerce" in p_src.source_id:
                relevant_pending.append(p_src)

        return passages, relevant_pending

    def search_policies_by_topic(
        self,
        query: str,
        top_provisions_per_law: int = 4,
    ) -> List[Tuple[SourceManifestRecord, List[ChunkRecord], float]]:
        """
        Searches all indexed Indian consumer-protection laws, rules, regulations,
        guidelines, and official policies relevant to a consumer-rights topic.
        Groups matching sections/rules/clauses under each parent official Act/Policy.
        """
        authority_rank = {
            "central_legislation": 0,
            "central_rules": 1,
            "central_regulations": 2,
            "ccpa_guidelines": 3,
            "gazette_notification": 4,
            "official_portal_guidance": 5,
        }

        clean_q = query.strip()
        if not clean_q:
            # Return full catalog grouped by authority hierarchy with representative provisions
            results: List[Tuple[SourceManifestRecord, List[ChunkRecord], float]] = []
            for src in sorted(
                self.manifest.values(),
                key=lambda s: (0 if s.status == "approved" else 1, authority_rank.get(s.authority_type, 9), s.title),
            ):
                src_chunks = [c for c in self.chunks.values() if c.source_id == src.source_id][:top_provisions_per_law]
                results.append((src, src_chunks, 1.0))
            return results

        q_tokens = _tokenize(clean_q)
        low = clean_q.lower()

        # Score chunks using BM25 + semantic vector + exact title/tag match
        bm25_scores = self.bm25.get_scores(q_tokens) if self.bm25 else [0.0] * len(self.approved_chunks)
        chunk_score: Dict[str, float] = {}
        for idx, c in enumerate(self.approved_chunks):
            sc = float(bm25_scores[idx])
            if sc > 0:
                chunk_score[c.chunk_id] = sc

        if self.chroma_collection is not None and self.vectorizer is not None and self.svd is not None:
            try:
                q_tfidf = self.vectorizer.transform([clean_q])
                q_emb = normalize(self.svd.transform(q_tfidf)).tolist()
                res = self.chroma_collection.query(
                    query_embeddings=q_emb,
                    n_results=min(35, len(self.approved_chunks)),
                    where={"domain": {"$eq": settings.DOMAIN}},
                )
                for rank, cid in enumerate(res.get("ids", [[]])[0], 1):
                    chunk_score[cid] = chunk_score.get(cid, 0.0) + (2.5 / (10 + rank))
            except Exception:
                pass

        # Group matching chunks by source_id
        grouped_chunks: Dict[str, List[Tuple[float, ChunkRecord]]] = {}
        for cid, sc in chunk_score.items():
            c = self.chunks.get(cid)
            if not c:
                continue
            # Also require some meaningful overlap or high vector rank
            text_low = f"{c.heading or ''} {c.text}".lower()
            token_hits = sum(1 for t in q_tokens if len(t) > 2 and t in text_low)
            if token_hits == 0 and sc < 0.20:
                continue
            grouped_chunks.setdefault(c.source_id, []).append((sc + token_hits * 0.6, c))

        # Also check manifest metadata (title, topic_tags, notes) for all sources (including pending_review!)
        law_results: List[Tuple[SourceManifestRecord, List[ChunkRecord], float]] = []
        for src in self.manifest.values():
            meta_blob = f"{src.title} {' '.join(src.topic_tags)} {src.notes or ''} {src.issuing_authority}".lower()
            meta_hits = sum(1 for t in q_tokens if len(t) > 2 and t in meta_blob)
            if any(t.replace("_", " ") in low or low in t.replace("_", " ") for t in src.topic_tags):
                meta_hits += 3

            matched_c = sorted(grouped_chunks.get(src.source_id, []), key=lambda x: x[0], reverse=True)
            if not matched_c and meta_hits == 0:
                continue

            if not matched_c and meta_hits > 0:
                # Include representative chunks from that Act/Policy when matched via title/topic tags
                fallback_chunks = [c for c in self.chunks.values() if c.source_id == src.source_id][:top_provisions_per_law]
                top_chunks = fallback_chunks
                total_score = float(meta_hits)
            else:
                top_chunks = [c for _, c in matched_c[:top_provisions_per_law]]
                total_score = matched_c[0][0] + meta_hits * 1.5

            law_results.append((src, top_chunks, round(total_score, 3)))

        law_results.sort(
            key=lambda item: (
                0 if item[0].status == "approved" else 1,
                -item[2],
                authority_rank.get(item[0].authority_type, 9),
            )
        )
        return law_results
