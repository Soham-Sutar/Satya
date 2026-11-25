"""
Repeatable evaluation and safety suite for Satya (Indian Consumer Rights & Protection).
Tests:
- 12 answerable / qualified consumer-law queries
- 7 out-of-scope, unsupported, prompt-injection, and clarification queries
- Citation validity, single-domain constraint, pending_review exclusion, and Action Plan labelling.
"""
from __future__ import annotations

import json
import sys
from pathlib import Path

import pytest
from fastapi.testclient import TestClient

REPO_ROOT = Path(__file__).resolve().parents[2]
sys.path.insert(0, str(REPO_ROOT / "backend"))

from app.main import app, retriever  # noqa: E402
from app.models.schemas import ChatResponse  # noqa: E402
from app.services.citation_validator import validate_and_hydrate_response  # noqa: E402

client = TestClient(app)
EVAL_CASES = json.loads((REPO_ROOT / "data" / "eval" / "test_cases.json").read_text(encoding="utf-8"))


def test_health_and_single_domain():
    res = client.get("/api/health")
    assert res.status_code == 200
    body = res.json()
    assert body["domain"] == "consumer_rights_india"
    assert body["approved_sources"] >= 10
    assert body["approved_chunks"] >= 200


def test_pending_review_source_excluded_from_verified_retrieval():
    passages, pending = retriever.retrieve(
        query="e-commerce amendment rules grievance officer",
        issue_category="ecommerce_grievance",
        top_k=10,
    )
    assert all(p.source.status == "approved" for p in passages)
    assert all(p.chunk.source_id != "ecommerce_amendment_rules_2026" for p in passages)
    assert any(s.source_id == "ecommerce_amendment_rules_2026" for s in pending)


def test_citation_validator_rejects_fabricated_chunk_ids():
    passages, _ = retriever.retrieve(
        query="deficiency in service",
        issue_category="deficiency_in_service",
        top_k=4,
    )
    real_id = passages[0].chunk.chunk_id
    fake_resp = ChatResponse(
        request_id="test_val",
        status="verified",
        issue_category="deficiency_in_service",
        answer_markdown="Test",
        claims=[
            {
                "claim_id": "c1",
                "text": "Supported claim",
                "evidence_status": "supported",
                "citations": [real_id, "fabricated_section_999"],
            },
            {
                "claim_id": "c2",
                "text": "Fabricated claim",
                "evidence_status": "supported",
                "citations": ["invented_chunk_id"],
            },
        ],
        action_plan=[
            {
                "text": "Uncited legal claim",
                "kind": "legal_requirement",
                "citations": ["invented_chunk_id"],
            }
        ],
    )
    validated = validate_and_hydrate_response(fake_resp, passages)
    assert validated.claims[0].citations == [real_id]
    assert validated.claims[1].evidence_status == "unsupported"
    assert validated.claims[1].citations == []
    assert "fabricated_section_999" not in validated.citation_details
    assert validated.status == "partially_verified"
    # Legal requirement with invalid citation is downgraded to professional_confirmation
    assert validated.action_plan[0].kind == "professional_confirmation"


@pytest.mark.parametrize("case", EVAL_CASES, ids=[c["id"] for c in EVAL_CASES])
def test_eval_suite(case):
    res = client.post("/api/chat", json={"message": case["query"]})
    assert res.status_code == 200
    body = res.json()

    assert body["domain"] == "consumer_rights_india"
    assert body["status"] in case["expected_statuses"], (
        f"{case['id']} returned {body['status']}, expected {case['expected_statuses']}"
    )

    # Every citation in claims and action_plan must exist in citation_details and be approved
    cited_ids = set(body["citation_details"].keys())
    for cid, meta in body["citation_details"].items():
        assert meta["source_status"] == "approved"
        assert len(meta["exact_passage"]) > 10
        assert meta["official_url"].startswith("https://")

    for claim in body["claims"]:
        if claim["evidence_status"] in ("supported", "partial"):
            assert len(claim["citations"]) >= 1
            for cid in claim["citations"]:
                assert cid in cited_ids

    for step in body["action_plan"]:
        if step["kind"] in ("legal_requirement", "conditional_requirement"):
            assert len(step["citations"]) >= 1

    if "expected_chunk_ids" in case:
        assert any(cid in cited_ids for cid in case["expected_chunk_ids"]), (
            f"{case['id']} missing expected chunks {case['expected_chunk_ids']}, got {cited_ids}"
        )

    if "expected_source_ids" in case:
        cited_sources = {m["source_id"] for m in body["citation_details"].values()}
        assert any(sid in cited_sources for sid in case["expected_source_ids"]), (
            f"{case['id']} missing expected sources {case['expected_source_ids']}, got {cited_sources}"
        )

    if body["status"] in ("cannot_verify", "out_of_scope", "needs_clarification"):
        assert body["abstention_reason"] is not None
