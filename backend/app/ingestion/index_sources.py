"""
Index all sources from data/source_manifest.json into:
1. data/processed/chunks.json (canonical structured chunks for BM25 + citation lookup)
2. data/vector_store/ (ChromaDB persistent collection using deterministic TF-IDF/LSA embeddings
   or API embeddings when configured)
"""
from __future__ import annotations

import json
import sys
from pathlib import Path
from typing import List

# Allow running directly as a script
BACKEND_DIR = Path(__file__).resolve().parents[2]
if str(BACKEND_DIR) not in sys.path:
    sys.path.insert(0, str(BACKEND_DIR))

from app.config import settings
from app.models.schemas import ChunkRecord, SourceManifestRecord
from app.ingestion.chunker import (
    chunk_citizen_charter,
    chunk_consumer_protection_act,
    chunk_gazette_rules_pdf,
    chunk_nch_html,
)


ENGLISH_MARKER_BY_SOURCE = {
    "cp_act_2019_commencement": ("MINISTRY OF CONSUMER AFFAIRS", "cp_act_commencement", "Notification"),
    "jurisdiction_rules_2021": ("MINISTRY OF CONSUMER AFFAIRS", "jurisdiction_2021", "Rule"),
    "ecommerce_rules_2020": ("MINISTRY OF CONSUMER AFFAIRS", "ecommerce_2020", "Rule"),
    "ecommerce_amendment_rules_2021": ("MINISTRY OF CONSUMER AFFAIRS", "ecommerce_amend_2021", "Rule"),
    "ecommerce_amendment_rules_2026": ("MINISTRY OF CONSUMER AFFAIRS", "ecommerce_amend_2026", "Rule"),
    "cdrc_rules_2020": ("MINISTRY OF CONSUMER AFFAIRS", "cdrc_2020", "Rule"),
    "cdrc_amendment_rules_2023": ("MINISTRY OF CONSUMER AFFAIRS", "cdrc_amend_2023", "Rule"),
    "mediation_rules_2020": ("MINISTRY OF CONSUMER AFFAIRS", "mediation_2020", "Rule"),
    "commission_procedure_regulations_2020": ("NATIONAL CONSUMER DISPUTES REDRESSAL COMMISSION", "proc_reg_2020", "Regulation"),
    "ccpa_misleading_ads_guidelines_2022": ("CENTRAL CONSUMER PROTECTION AUTHORITY", "ccpa_ads_2022", "Guideline"),
    "ccpa_dark_patterns_guidelines_2023": ("CENTRAL CONSUMER PROTECTION AUTHORITY", "ccpa_dark_2023", "Guideline"),
}


def build_chunks() -> List[ChunkRecord]:
    manifest_raw = json.loads(settings.SOURCE_MANIFEST_PATH.read_text(encoding="utf-8"))
    manifest = [SourceManifestRecord(**item) for item in manifest_raw]
    all_chunks: List[ChunkRecord] = []

    for src in manifest:
        if not src.local_file:
            continue
        file_path = settings.DATA_DIR.parent / src.local_file
        if not file_path.exists():
            print(f"[WARN] Missing local file for {src.source_id}: {file_path}")
            continue

        if src.source_id == "consumer_protection_act_2019":
            chunks = chunk_consumer_protection_act(src, file_path)
        elif src.source_id == "doca_citizen_charter_2025_26":
            chunks = chunk_citizen_charter(src, file_path)
        elif src.source_id == "nch_official_portal":
            chunks = chunk_nch_html(src, file_path)
        elif src.source_id in ENGLISH_MARKER_BY_SOURCE:
            marker, prefix, unit = ENGLISH_MARKER_BY_SOURCE[src.source_id]
            chunks = chunk_gazette_rules_pdf(src, file_path, marker, prefix, unit)
        else:
            chunks = []

        print(f"  Indexed {src.source_id} ({src.status}): {len(chunks)} chunks")
        all_chunks.extend(chunks)

    settings.PROCESSED_DIR.mkdir(parents=True, exist_ok=True)
    settings.CHUNKS_PATH.write_text(
        json.dumps([c.model_dump() for c in all_chunks], indent=2, ensure_ascii=False),
        encoding="utf-8",
    )
    print(f"Total chunks written to {settings.CHUNKS_PATH}: {len(all_chunks)}")
    return all_chunks


def build_chroma_index(chunks: List[ChunkRecord]) -> None:
    """Persist approved + manifest chunks into ChromaDB using dense TF-IDF+SVD vectors."""
    import chromadb
    from sklearn.feature_extraction.text import TfidfVectorizer
    from sklearn.decomposition import TruncatedSVD
    from sklearn.preprocessing import normalize
    import pickle

    settings.VECTOR_DB_PATH.mkdir(parents=True, exist_ok=True)
    texts = [f"{c.heading or ''}\n{c.text}" for c in chunks]
    vectorizer = TfidfVectorizer(max_features=8000, ngram_range=(1, 2), stop_words="english")
    tfidf = vectorizer.fit_transform(texts)
    n_comp = min(256, tfidf.shape[1] - 1, tfidf.shape[0] - 1)
    svd = TruncatedSVD(n_components=n_comp, random_state=42)
    embeddings = normalize(svd.fit_transform(tfidf)).tolist()

    # Save vectorizer + svd for query-time embedding (deterministic, zero external rate limits)
    with open(settings.VECTOR_DB_PATH / "embedder.pkl", "wb") as f:
        pickle.dump({"vectorizer": vectorizer, "svd": svd}, f)

    client = chromadb.PersistentClient(path=str(settings.VECTOR_DB_PATH / "chroma"))
    try:
        client.delete_collection("satya_consumer_rights")
    except Exception:
        pass
    col = client.create_collection(
        name="satya_consumer_rights",
        metadata={"hnsw:space": "cosine", "domain": "consumer_rights_india"},
    )

    batch_size = 100
    for i in range(0, len(chunks), batch_size):
        batch = chunks[i : i + batch_size]
        col.add(
            ids=[c.chunk_id for c in batch],
            embeddings=embeddings[i : i + batch_size],
            documents=[c.text for c in batch],
            metadatas=[
                {
                    "source_id": c.source_id,
                    "domain": c.domain,
                    "source_status": c.source_status,
                    "topic_tags": ",".join(c.topic_tags),
                    "section": c.section or "",
                    "rule": c.rule or "",
                    "heading": c.heading or "",
                }
                for c in batch
            ],
        )
    print(f"ChromaDB collection 'satya_consumer_rights' populated with {col.count()} chunks.")


if __name__ == "__main__":
    all_chunks = build_chunks()
    if all_chunks:
        build_chroma_index(all_chunks)
