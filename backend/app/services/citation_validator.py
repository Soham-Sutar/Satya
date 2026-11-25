"""
Server-side deterministic citation and claim validation.
Never lets the LLM manufacture citation metadata, URLs, section numbers, or page numbers.
Hydrates all CitationMetadata from stored ChunkRecord + SourceManifestRecord.
"""
from __future__ import annotations

from typing import Dict, List

from app.models.schemas import (
    AbstentionDetail,
    ActionPlanItem,
    ChatResponse,
    CitationMetadata,
    ClaimItem,
    EvidenceCoverage,
    OfficialLink,
)
from app.services.retrieval import RetrievedPassage


def build_citation_metadata(p: RetrievedPassage) -> CitationMetadata:
    c = p.chunk
    s = p.source
    return CitationMetadata(
        chunk_id=c.chunk_id,
        source_id=s.source_id,
        source_title=s.title,
        issuing_authority=s.issuing_authority,
        authority_type=s.authority_type,
        section=c.section,
        subsection=c.subsection,
        rule=c.rule,
        paragraph=c.paragraph,
        heading=c.heading,
        page_start=c.page_start,
        page_end=c.page_end,
        publication_date=s.publication_date,
        effective_from=s.effective_from,
        retrieved_at=s.retrieved_at,
        version_label=s.version_label,
        source_status=s.status,
        official_url=s.official_url,
        exact_passage=c.text,
    )


def validate_and_hydrate_response(
    raw_response: ChatResponse,
    passages: List[RetrievedPassage],
) -> ChatResponse:
    """
    Validates every citation ID against the retrieved approved passages for this request.
    - Removes any citation ID not in `passages` or not `approved`.
    - Marks any claim left without valid citations as `unsupported`.
    - Ensures legal_requirement / conditional_requirement action plan items have valid citations.
    - Hydrates `citation_details` strictly from stored metadata.
    - Computes `evidence_coverage`.
    """
    passage_by_id: Dict[str, RetrievedPassage] = {
        p.chunk.chunk_id: p
        for p in passages
        if p.source.status == "approved" and p.chunk.domain == "consumer_rights_india"
    }

    validated_claims: List[ClaimItem] = []
    used_citation_ids: set[str] = set()

    for idx, claim in enumerate(raw_response.claims, 1):
        valid_cits = [cid for cid in claim.citations if cid in passage_by_id]
        # Deduplicate preserving order
        valid_cits = list(dict.fromkeys(valid_cits))
        if not valid_cits:
            validated_claims.append(
                ClaimItem(
                    claim_id=claim.claim_id or f"c{idx}",
                    text=claim.text,
                    evidence_status="unsupported",
                    citations=[],
                )
            )
        else:
            status = claim.evidence_status if claim.evidence_status in ("supported", "partial") else "supported"
            validated_claims.append(
                ClaimItem(
                    claim_id=claim.claim_id or f"c{idx}",
                    text=claim.text,
                    evidence_status=status,
                    citations=valid_cits,
                )
            )
            used_citation_ids.update(valid_cits)

    validated_actions: List[ActionPlanItem] = []
    for item in raw_response.action_plan:
        valid_cits = list(dict.fromkeys(cid for cid in item.citations if cid in passage_by_id))
        if item.kind in ("legal_requirement", "conditional_requirement") and not valid_cits:
            # Downgrade uncited legal requirement to professional_confirmation rather than presenting ungrounded law
            validated_actions.append(
                ActionPlanItem(
                    text=item.text,
                    kind="professional_confirmation",
                    citations=[],
                )
            )
        else:
            validated_actions.append(
                ActionPlanItem(
                    text=item.text,
                    kind=item.kind,
                    citations=valid_cits,
                )
            )
            used_citation_ids.update(valid_cits)

    # Hydrate citation metadata exclusively from stored chunks & manifest
    citation_details: Dict[str, CitationMetadata] = {
        cid: build_citation_metadata(passage_by_id[cid])
        for cid in sorted(used_citation_ids)
    }

    # Rebuild official links from cited sources (no LLM-invented URLs!)
    seen_urls = set()
    official_links: List[OfficialLink] = []
    for cid in used_citation_ids:
        src = passage_by_id[cid].source
        if src.official_url not in seen_urls:
            seen_urls.add(src.official_url)
            official_links.append(
                OfficialLink(
                    title=src.title,
                    url=src.official_url,
                    authority=src.issuing_authority,
                )
            )

    # Recompute overall answer status conservatively
    supported_count = sum(1 for c in validated_claims if c.evidence_status == "supported")
    partial_count = sum(1 for c in validated_claims if c.evidence_status == "partial")
    unsupported_count = sum(1 for c in validated_claims if c.evidence_status == "unsupported")
    total_claims = len(validated_claims)

    final_status = raw_response.status
    abstention = raw_response.abstention_reason

    if final_status in ("verified", "partially_verified"):
        if total_claims == 0 or (supported_count == 0 and partial_count == 0):
            final_status = "cannot_verify"
            abstention = AbstentionDetail(
                category="unsupported_claim",
                summary="Generated claims could not be verified against retrieved approved chunks.",
                what_was_found=f"Retrieved {len(passages)} approved chunks, but no claims passed deterministic citation validation.",
                what_is_missing="Direct chunk-level citation support for the generated statements.",
                suggested_next_step="Try rephrasing your question or inspect the official Department of Consumer Affairs sources directly.",
                official_verification_url="https://consumeraffairs.gov.in/pages/consumer-protection-act",
            )
        elif unsupported_count > 0 or partial_count > 0:
            final_status = "partially_verified"

    approved_sources_used = len({citation_details[cid].source_id for cid in citation_details})

    raw_response.status = final_status
    raw_response.claims = validated_claims
    raw_response.citation_details = citation_details
    raw_response.action_plan = validated_actions
    raw_response.official_links = official_links
    raw_response.abstention_reason = abstention
    raw_response.evidence_coverage = EvidenceCoverage(
        supported_claims=supported_count,
        total_claims=total_claims,
        retrieved_chunks_count=len(passages),
        approved_sources_used=approved_sources_used,
        description=(
            f"Evidence coverage: {supported_count} of {total_claims} material claims are directly supported "
            f"across {approved_sources_used} approved official Indian consumer-protection source(s). "
            "This measures source traceability, not a legal outcome prediction."
        ),
    )
    return raw_response
