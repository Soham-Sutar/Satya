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


def test_continuous_followup_context():
    # Step 1: missing amount triggers clarification
    r1 = client.post("/api/chat", json={"message": "Which Consumer Commission should I file my complaint in?"}).json()
    assert r1["status"] == "needs_clarification"

    # Step 2: follow-up supplies only the amount; must inherit commission question from history!
    r2 = client.post(
        "/api/chat",
        json={
            "message": "I paid ₹35 lakh for it.",
            "history": [
                {"role": "user", "content": "Which Consumer Commission should I file my complaint in?"},
                {"role": "assistant", "content": r1["answer_markdown"]},
            ],
        },
    ).json()
    assert r2["status"] == "verified"
    cited_sources = {m["source_id"] for m in r2["citation_details"].values()}
    assert "jurisdiction_rules_2021" in cited_sources

    # Step 3: follow-up about non-response after damaged phone online
    r3 = client.post(
        "/api/chat",
        json={
            "message": "What if they do not reply within 48 hours?",
            "history": [
                {"role": "user", "content": "I bought a phone online and it arrived with a damaged screen."},
                {"role": "assistant", "content": "You have rights under the Consumer Protection Act, 2019 and E-Commerce Rules, 2020."},
            ],
        },
    ).json()
    assert r3["status"] in ("verified", "partially_verified")
    assert len(r3["claims"]) >= 1


def test_multilingual_kannada_and_hindi():
    kn_res = client.post(
        "/api/chat",
        json={
            "message": "ನಾನು ಆನ್‌ಲೈನ್‌ನಲ್ಲಿ ಫೋನ್ ಖರೀದಿಸಿದೆ ಮತ್ತು ಅದು ಹಾನಿಗೊಳಗಾದ ಪರದೆಯೊಂದಿಗೆ ಬಂದಿದೆ. ನಾನು ಏನು ಮಾಡಬಹುದು?",
            "language": "kn",
        },
    ).json()
    assert kn_res["language"] == "kn"
    assert kn_res["status"] in ("verified", "partially_verified")
    assert len(kn_res["citation_details"]) >= 1

    hi_res = client.post(
        "/api/chat",
        json={
            "message": "₹35 लाख से जुड़े दावे के लिए मुझे किस उपभोक्ता आयोग में जाना चाहिए?",
            "language": "hi",
        },
    ).json()
    assert hi_res["language"] == "hi"
    assert hi_res["status"] in ("verified", "partially_verified")
    assert any(m["source_id"] == "jurisdiction_rules_2021" for m in hi_res["citation_details"].values())

    # Out-of-scope check in Hindi & Kannada must still be blocked!
    hi_oos = client.post(
        "/api/chat",
        json={"message": "भारतीय पासपोर्ट नवीनीकरण के लिए आवेदन कैसे करें?", "language": "hi"},
    ).json()
    assert hi_oos["status"] == "out_of_scope"
    assert hi_oos["language"] == "hi"


def test_translate_response_preserves_citations():
    en_res = client.post(
        "/api/chat",
        json={"message": "Show me the exact section that defines deficiency in service.", "language": "en"},
    ).json()
    assert en_res["status"] == "verified"
    en_cites = set(en_res["citation_details"].keys())

    tr_res = client.post(
        "/api/translate-response",
        json={"response": en_res, "question": "Show me the exact section that defines deficiency in service.", "target_language": "kn"},
    )
    assert tr_res.status_code == 200
    body = tr_res.json()
    assert set(body["response"]["citation_details"].keys()) == en_cites
    assert body["response"]["status"] == en_res["status"]

    batch_res = client.post(
        "/api/translate-thread",
        json={
            "items": [
                {
                    "id": "t1",
                    "question": "Show me the exact section that defines deficiency in service.",
                    "response": en_res,
                }
            ],
            "target_language": "hi",
        },
    )
    assert batch_res.status_code == 200
    batch_body = batch_res.json()
    assert len(batch_body["items"]) == 1
    assert set(batch_body["items"][0]["response"]["citation_details"].keys()) == en_cites


def test_policy_topic_search():
    res = client.get("/api/policies/search", params={"q": "ecommerce grievance officer"})
    assert res.status_code == 200
    body = res.json()
    assert body["in_scope"] is True
    assert body["total_laws_matched"] >= 2
    source_ids = {law["source_id"] for law in body["laws"]}
    assert "ecommerce_rules_2020" in source_ids

    oos = client.get("/api/policies/search", params={"q": "Indian passport renewal"})
    assert oos.status_code == 200
    oos_body = oos.json()
    assert oos_body["in_scope"] is False
    assert oos_body["total_laws_matched"] == 0

