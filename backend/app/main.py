"""
Satya FastAPI Backend — Single Domain: Indian Consumer Rights & Protection.
"""
from __future__ import annotations

import json
import logging
import time
import uuid
from datetime import datetime, timezone
from typing import List

from fastapi import Depends, FastAPI, Header, HTTPException
from fastapi.middleware.cors import CORSMiddleware

from app.config import settings
from app.models.schemas import (
    ChatRequest,
    ChatResponse,
    ChunkRecord,
    CoverageResponse,
    FeedbackRequest,
    SourceManifestRecord,
)
from app.services.answer import generate_grounded_response
from app.services.citation_validator import validate_and_hydrate_response
from app.services.evidence_gate import evaluate_evidence
from app.services.issue_classifier import classify_query
from app.services.retrieval import HybridRetriever

logging.basicConfig(level=logging.INFO, format="%(asctime)s %(levelname)s %(message)s")
logger = logging.getLogger("satya")

app = FastAPI(
    title=settings.APP_NAME,
    version="1.0.0",
    description="Single-domain source-grounded AI assistant for Indian Consumer Rights & Protection.",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[settings.FRONTEND_ORIGIN, "http://127.0.0.1:3000", "http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

retriever = HybridRetriever()


@app.get("/api/health")
def health() -> dict:
    return {
        "status": "ok",
        "domain": settings.DOMAIN,
        "approved_sources": sum(1 for s in retriever.manifest.values() if s.status == "approved"),
        "total_sources": len(retriever.manifest),
        "approved_chunks": len(retriever.approved_chunks),
        "total_chunks": len(retriever.chunks),
        "llm_configured": bool(settings.LLM_API_KEY),
    }


@app.get("/api/coverage", response_model=CoverageResponse)
def get_coverage() -> CoverageResponse:
    return CoverageResponse(
        supported_topics=[
            "Definition of 'consumer' and commercial-purpose exclusions (Consumer Protection Act, 2019, Sec. 2(7))",
            "Core consumer rights (Sec. 2(9))",
            "Defective goods & deficiency in services (Sec. 2(10), 2(11), 39)",
            "Unfair trade practices, unfair contracts & dark patterns (Sec. 2(46), 2(47); CCPA Dark Patterns Guidelines, 2023)",
            "Misleading advertisements & endorsements (Sec. 2(28); CCPA Misleading Ads Guidelines, 2022)",
            "E-commerce entity, marketplace & seller duties, Grievance Officer timelines (E-Commerce Rules, 2020 & 2021 Amendment)",
            "Product liability basics (Chapter VI, Sec. 82–87)",
            "Consumer Commission pecuniary jurisdiction & filing fees (Jurisdiction Rules, 2021; CDRC Amendment Rules, 2023)",
            "Limitation period & delay condonation (Sec. 69)",
            "Mediation & fee refund on settlement (Sec. 74–81; Mediation Rules, 2020)",
            "National Consumer Helpline (NCH 1915) vs Consumer Commissions & e-Jagriti filing portal",
        ],
        out_of_scope_examples=[
            "Criminal law, FIRs, bail, or police investigation",
            "Passport, visa, or immigration services",
            "Property title registration, stamp duty, or land disputes",
            "Family law, divorce, custody, or succession",
            "Income tax, GST compliance, or employment labour disputes",
            "Guaranteed refund amounts or predictions of winning a case",
        ],
        known_limitations=[
            "Provides grounded legal information only, not legal representation or formal legal advice.",
            "Sector-specific regulators/ombudsmen (RBI, SEBI, IRDAI, TRAI, RERA) are not separately indexed.",
            "The E-Commerce (Amendment) Rules, 2026 PDF is tracked in the manifest as 'pending_review' and excluded from current-law verified claims pending verified commencement.",
            "Does not perform live automated complaint filing or check real-time court case status.",
        ],
        approved_source_count=sum(1 for s in retriever.manifest.values() if s.status == "approved"),
        total_chunk_count=len(retriever.approved_chunks),
    )


@app.get("/api/sources", response_model=List[SourceManifestRecord])
def list_sources() -> List[SourceManifestRecord]:
    return list(retriever.manifest.values())


@app.get("/api/sources/{source_id}", response_model=SourceManifestRecord)
def get_source(source_id: str) -> SourceManifestRecord:
    src = retriever.manifest.get(source_id)
    if not src:
        raise HTTPException(status_code=404, detail="Source not found")
    return src


@app.get("/api/chunks/{chunk_id}")
def get_chunk(chunk_id: str) -> dict:
    chunk = retriever.chunks.get(chunk_id)
    if not chunk:
        raise HTTPException(status_code=404, detail="Chunk not found")
    src = retriever.manifest.get(chunk.source_id)
    return {
        "chunk": chunk.model_dump(),
        "source": src.model_dump() if src else None,
    }


@app.post("/api/chat", response_model=ChatResponse)
def chat(req: ChatRequest) -> ChatResponse:
    t0 = time.perf_counter()
    request_id = str(uuid.uuid4())[:12]

    # 1. Classify consumer issue & check scope / missing material facts
    classification = classify_query(req.message, req.session_context)

    # 2. Retrieve from approved consumer-protection corpus only
    passages = []
    relevant_pending = []
    if not classification.is_out_of_scope and not classification.is_prompt_injection:
        passages, relevant_pending = retriever.retrieve(
            query=req.message,
            issue_category=classification.issue_category,
            secondary_categories=classification.secondary_categories,
            top_k=7,
        )

    # 3. Evidence sufficiency, freshness & conflict gate
    gate = evaluate_evidence(
        query=req.message,
        classification=classification,
        passages=passages,
        relevant_pending=relevant_pending,
    )

    # 4. Grounded answer generation (LLM if configured, otherwise deterministic extractive synthesis)
    raw_resp = generate_grounded_response(
        request_id=request_id,
        query=req.message,
        classification=classification,
        gate=gate,
        session_context=req.session_context,
        history=req.history,
    )

    # 5. Server-side citation & claim validation + metadata hydration
    if gate.allow_generation:
        final_resp = validate_and_hydrate_response(raw_resp, passages)
    else:
        final_resp = raw_resp

    latency_ms = int((time.perf_counter() - t0) * 1000)
    final_resp.latency_ms = latency_ms

    # NFR-11 Observability (log metadata without full PII narratives)
    logger.info(
        "request_id=%s status=%s category=%s retrieved=%d cited=%d latency_ms=%d abstention=%s",
        request_id,
        final_resp.status,
        final_resp.issue_category,
        len(passages),
        len(final_resp.citation_details),
        latency_ms,
        final_resp.abstention_reason.category if final_resp.abstention_reason else "none",
    )
    return final_resp


@app.post("/api/feedback")
def submit_feedback(req: FeedbackRequest) -> dict:
    settings.FEEDBACK_LOG_PATH.parent.mkdir(parents=True, exist_ok=True)
    entry = {
        "timestamp": datetime.now(timezone.utc).isoformat(),
        "request_id": req.request_id,
        "chunk_id": req.chunk_id,
        "feedback_type": req.feedback_type,
        "comment": req.comment,
    }
    with open(settings.FEEDBACK_LOG_PATH, "a", encoding="utf-8") as f:
        f.write(json.dumps(entry, ensure_ascii=False) + "\n")
    return {"status": "recorded", "entry": entry}


def _verify_admin(x_admin_token: str = Header(default="")) -> None:
    if x_admin_token != settings.ADMIN_TOKEN:
        raise HTTPException(status_code=403, detail="Unauthorized admin operation")


@app.post("/api/admin/ingest", dependencies=[Depends(_verify_admin)])
def admin_reingest() -> dict:
    from app.ingestion.index_sources import build_chunks, build_chroma_index

    chunks = build_chunks()
    if chunks:
        build_chroma_index(chunks)
    retriever.reload()
    return {
        "status": "reindexed",
        "total_chunks": len(chunks),
        "approved_chunks": len(retriever.approved_chunks),
    }
