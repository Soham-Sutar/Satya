"""
Evidence sufficiency, freshness, conflict, and domain-boundary gate.
Determines whether retrieved passages are strong enough to generate a verified answer,
or whether Satya must abstain with a helpful 'Why Satya Won't Answer' card.
"""
from __future__ import annotations

import re
from dataclasses import dataclass, field
from typing import List, Optional, Tuple

from app.models.schemas import AbstentionDetail, SourceManifestRecord
from app.services.issue_classifier import ClassificationResult
from app.services.retrieval import RetrievedPassage, _tokenize


@dataclass
class GateDecision:
    allow_generation: bool
    status_override: Optional[str] = None
    abstention_detail: Optional[AbstentionDetail] = None
    freshness_warnings: List[str] = field(default_factory=list)
    filtered_passages: List[RetrievedPassage] = field(default_factory=list)


def evaluate_evidence(
    query: str,
    classification: ClassificationResult,
    passages: List[RetrievedPassage],
    relevant_pending: List[SourceManifestRecord],
) -> GateDecision:
    freshness_warnings: List[str] = []

    # Check if any non-approved pending_review sources relate to this topic
    for p_src in relevant_pending:
        freshness_warnings.append(
            f"Currency notice: '{p_src.title}' ({p_src.version_label}) has status '{p_src.status}' and is excluded from verified current-law claims. {p_src.notes or ''}".strip()
        )

    # Note superseded fee table if CDRC 2020 Rule 7 appears alongside 2023 Amendment
    source_ids_present = {p.source.source_id for p in passages}
    if "cdrc_rules_2020" in source_ids_present and "cdrc_amendment_rules_2023" in source_ids_present:
        freshness_warnings.append(
            "Amendment note: The complaint filing fee table in CDRC Rules, 2020 (Rule 7) was substituted by the CDRC (Amendment) Rules, 2023 (G.S.R. 606(E), effective 17 August 2023)."
        )
    if "consumer_protection_act_2019" in source_ids_present and "jurisdiction_rules_2021" in source_ids_present:
        freshness_warnings.append(
            "Jurisdiction update: Pecuniary jurisdiction thresholds under Sections 34, 47, and 58 of the Consumer Protection Act, 2019 were revised by the Jurisdiction Rules, 2021 (G.S.R. 912(E), effective 30 December 2021)."
        )

    # 1. Prompt injection or unsupported section/guarantee check
    if classification.is_prompt_injection:
        return GateDecision(
            allow_generation=False,
            status_override="cannot_verify",
            abstention_detail=AbstentionDetail(
                category="unsupported_claim",
                summary="Satya cannot fabricate statutory sections, rules, or legal conclusions.",
                what_was_found="Your prompt appears to ask the system to ignore evidence rules or invent a citation.",
                what_is_missing="Approved official Indian consumer-protection text supporting the requested claim.",
                suggested_next_step="Ask a factual question about Indian consumer rights, defective goods, deficiency in service, e-commerce rules, or Consumer Commission procedure.",
                official_verification_url="https://consumeraffairs.gov.in/pages/consumer-protection-act",
            ),
            freshness_warnings=freshness_warnings,
        )

    # 2. Out-of-scope domain check
    if classification.is_out_of_scope:
        reason = classification.out_of_scope_reason or "an area outside Indian consumer rights and protection"
        return GateDecision(
            allow_generation=False,
            status_override="out_of_scope",
            abstention_detail=AbstentionDetail(
                category="out_of_scope",
                summary=f"This question relates to {reason}, which is outside Satya's scope.",
                what_was_found="Satya covers only Indian Consumer Rights & Protection (Consumer Protection Act, 2019 and related Rules/Guidelines).",
                what_is_missing="A consumer-protection dispute involving goods or services bought/hired for consideration in India.",
                suggested_next_step="If your issue involves a paid consumer product or service (such as a defective product or deficient service), rephrase with those details; otherwise consult a qualified advocate or the relevant government authority.",
                official_verification_url="https://consumeraffairs.gov.in/",
            ),
            freshness_warnings=freshness_warnings,
        )

    # 3. Missing material facts check
    if classification.needs_clarification:
        return GateDecision(
            allow_generation=False,
            status_override="needs_clarification",
            abstention_detail=AbstentionDetail(
                category="missing_facts",
                summary="Satya needs one material transaction fact before answering accurately.",
                what_was_found=f"Identified consumer topic: {classification.issue_category.replace('_', ' ')}.",
                what_is_missing="; ".join(classification.clarifying_questions),
                suggested_next_step="Provide the missing detail in your next message (without sharing sensitive IDs, OTPs, or full card/bank numbers).",
                official_verification_url="https://consumerhelpline.gov.in/public/",
            ),
            freshness_warnings=freshness_warnings,
            filtered_passages=passages,
        )

    # 4. Explicit request for nonexistent section or sector-specific ombudsman outside corpus
    q_low = query.lower()
    sec_num_asked = re.findall(r"\bsection\s+(\d{3,4})\b", q_low)
    if sec_num_asked:
        # Consumer Protection Act 2019 only has Sections 1 to 107!
        asked_nums = [int(n) for n in sec_num_asked]
        if any(n > 107 for n in asked_nums):
            return GateDecision(
                allow_generation=False,
                status_override="cannot_verify",
                abstention_detail=AbstentionDetail(
                    category="missing_source",
                    summary=f"Section {', '.join(sec_num_asked)} was not found in the Consumer Protection Act, 2019.",
                    what_was_found="The indexed Consumer Protection Act, 2019 contains Sections 1 to 107 only.",
                    what_is_missing=f"Any official consumer-protection provision numbered Section {', '.join(sec_num_asked)}.",
                    suggested_next_step="Verify the exact section number from the official Consumer Protection Act, 2019 text on India Code / Department of Consumer Affairs.",
                    official_verification_url="https://consumeraffairs.gov.in/pages/consumer-protection-act",
                ),
                freshness_warnings=freshness_warnings,
            )

    # Check if user asks about sector-specific regimes (banking/RBI, SEBI, IRDAI, Montreal Convention) not indexed
    sector_specific = re.search(
        r"\b(rbi ombudsman|banking ombudsman|sebi|irdai|insurance ombudsman|telecom regulatory|trai|montreal convention|dgca compensation|rera authority)\b",
        q_low,
    )
    if sector_specific:
        return GateDecision(
            allow_generation=False,
            status_override="cannot_verify",
            abstention_detail=AbstentionDetail(
                category="missing_source",
                summary=f"Sector-specific rules for '{sector_specific.group(0)}' are not indexed in Satya's approved corpus.",
                what_was_found="Satya indexes general Indian consumer-protection law (Consumer Protection Act, 2019, E-Commerce Rules, Jurisdiction Rules, Mediation Rules, CCPA Guidelines, NCH).",
                what_is_missing=f"Approved official regulatory source pack for {sector_specific.group(0)}.",
                suggested_next_step="Check the official sector regulator portal or consult a qualified legal professional; general Consumer Protection Act remedies may still be checked separately.",
                official_verification_url="https://consumeraffairs.gov.in/",
            ),
            freshness_warnings=freshness_warnings,
        )

    # 5. Relevance & lexical support check on retrieved passages
    if not passages:
        return GateDecision(
            allow_generation=False,
            status_override="cannot_verify",
            abstention_detail=AbstentionDetail(
                category="missing_source",
                summary="No approved Indian consumer-protection passages matched your question sufficiently.",
                what_was_found="0 approved passages met the relevance threshold.",
                what_is_missing="Direct official statutory or portal evidence addressing your exact question.",
                suggested_next_step="Rephrase your question around a consumer product/service issue or consult the National Consumer Helpline (1915) / Department of Consumer Affairs.",
                official_verification_url="https://consumerhelpline.gov.in/public/",
            ),
            freshness_warnings=freshness_warnings,
        )

    # Check lexical/semantic sanity: ensure at least 1 retrieved passage has meaningful token overlap or high score
    q_tokens = {t for t in _tokenize(query) if len(t) > 2}
    best_overlap = 0
    for p in passages:
        p_tokens = set(_tokenize(f"{p.chunk.heading or ''} {p.chunk.text}"))
        best_overlap = max(best_overlap, len(q_tokens.intersection(p_tokens)))

    if best_overlap == 0 and passages[0].score < 0.03:
        return GateDecision(
            allow_generation=False,
            status_override="cannot_verify",
            abstention_detail=AbstentionDetail(
                category="missing_source",
                summary="Retrieved consumer-protection sources do not directly address the terms in your query.",
                what_was_found=f"Searched {len(passages)} approved chunks, but none directly matched the query terms.",
                what_is_missing="An approved statutory or official portal passage directly covering this specific question.",
                suggested_next_step="Check the Department of Consumer Affairs portal or clarify which consumer product, service, or rule you are asking about.",
                official_verification_url="https://consumeraffairs.gov.in/pages/consumer-protection-act",
            ),
            freshness_warnings=freshness_warnings,
        )

    return GateDecision(
        allow_generation=True,
        freshness_warnings=freshness_warnings,
        filtered_passages=passages,
    )
