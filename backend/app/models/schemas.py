from __future__ import annotations

from typing import Dict, List, Literal, Optional
from pydantic import BaseModel, Field

ConsumerIssueCategory = Literal[
    "defective_goods",
    "deficiency_in_service",
    "unfair_trade_practice",
    "misleading_advertisement",
    "ecommerce_grievance",
    "product_liability",
    "consumer_status_and_rights",
    "refund_replacement_repair",
    "consumer_commission_filing",
    "jurisdiction_and_limitation",
    "mediation",
    "helpline_and_escalation",
    "other_consumer_issue",
    "out_of_scope",
]

AnswerStatus = Literal[
    "verified",
    "partially_verified",
    "cannot_verify",
    "needs_clarification",
    "out_of_scope",
]

ActionPlanKind = Literal[
    "legal_requirement",
    "conditional_requirement",
    "practical_suggestion",
    "professional_confirmation",
]

SourceStatus = Literal[
    "pending_review",
    "approved",
    "superseded",
    "withdrawn",
    "unknown_currency",
]


class SessionContext(BaseModel):
    state: Optional[str] = None
    purchase_date: Optional[str] = None
    purchase_amount: Optional[float] = None
    purchase_channel: Optional[str] = None  # e.g., ecommerce, retail, service_provider
    complaint_filed_to_seller: Optional[bool] = None
    personal_or_commercial: Optional[str] = None


class ChatMessageTurn(BaseModel):
    role: Literal["user", "assistant"]
    content: str


class ChatRequest(BaseModel):
    message: str = Field(..., min_length=1, max_length=3000)
    session_context: Optional[SessionContext] = None
    history: List[ChatMessageTurn] = Field(default_factory=list)


class SourceManifestRecord(BaseModel):
    source_id: str
    title: str
    issuing_authority: str
    authority_type: str
    domain: Literal["consumer_rights_india"] = "consumer_rights_india"
    topic_tags: List[str] = Field(default_factory=list)
    jurisdiction: str = "IN"
    document_type: str
    official_url: str
    local_file: Optional[str] = None
    publication_date: Optional[str] = None
    effective_from: Optional[str] = None
    effective_to: Optional[str] = None
    retrieved_at: str
    version_label: str
    status: SourceStatus
    supersedes: Optional[str] = None
    notes: Optional[str] = None


class ChunkRecord(BaseModel):
    chunk_id: str
    source_id: str
    domain: Literal["consumer_rights_india"] = "consumer_rights_india"
    topic_tags: List[str] = Field(default_factory=list)
    jurisdiction: str = "IN"
    section: Optional[str] = None
    subsection: Optional[str] = None
    rule: Optional[str] = None
    paragraph: Optional[str] = None
    heading: Optional[str] = None
    page_start: Optional[int] = None
    page_end: Optional[int] = None
    text: str
    effective_from: Optional[str] = None
    effective_to: Optional[str] = None
    source_status: SourceStatus = "approved"
    official_url: str


class CitationMetadata(BaseModel):
    chunk_id: str
    source_id: str
    source_title: str
    issuing_authority: str
    authority_type: str
    section: Optional[str] = None
    subsection: Optional[str] = None
    rule: Optional[str] = None
    paragraph: Optional[str] = None
    heading: Optional[str] = None
    page_start: Optional[int] = None
    page_end: Optional[int] = None
    publication_date: Optional[str] = None
    effective_from: Optional[str] = None
    retrieved_at: Optional[str] = None
    version_label: Optional[str] = None
    source_status: SourceStatus = "approved"
    official_url: str
    exact_passage: str


class ClaimItem(BaseModel):
    claim_id: str
    text: str
    evidence_status: Literal["supported", "partial", "unsupported"]
    citations: List[str] = Field(default_factory=list)


class ActionPlanItem(BaseModel):
    text: str
    kind: ActionPlanKind
    citations: List[str] = Field(default_factory=list)


class OfficialLink(BaseModel):
    title: str
    url: str
    authority: str


class AbstentionDetail(BaseModel):
    category: Literal[
        "missing_facts",
        "missing_source",
        "outdated_source",
        "source_conflict",
        "out_of_scope",
        "unsupported_claim",
    ]
    summary: str
    what_was_found: str
    what_is_missing: str
    suggested_next_step: str
    official_verification_url: Optional[str] = None


class EvidenceCoverage(BaseModel):
    supported_claims: int
    total_claims: int
    retrieved_chunks_count: int
    approved_sources_used: int
    description: str


class ChatResponse(BaseModel):
    request_id: str
    domain: Literal["consumer_rights_india"] = "consumer_rights_india"
    status: AnswerStatus
    issue_category: ConsumerIssueCategory
    answer_markdown: str
    claims: List[ClaimItem] = Field(default_factory=list)
    citation_details: Dict[str, CitationMetadata] = Field(default_factory=dict)
    action_plan: List[ActionPlanItem] = Field(default_factory=list)
    clarifying_questions: List[str] = Field(default_factory=list)
    limitations: List[str] = Field(default_factory=list)
    official_links: List[OfficialLink] = Field(default_factory=list)
    abstention_reason: Optional[AbstentionDetail] = None
    evidence_coverage: Optional[EvidenceCoverage] = None
    latency_ms: int = 0


class FeedbackRequest(BaseModel):
    request_id: Optional[str] = None
    chunk_id: Optional[str] = None
    feedback_type: Literal[
        "unsupported_answer",
        "wrong_citation",
        "outdated_source",
        "unclear_answer",
        "helpful",
    ]
    comment: Optional[str] = Field(default=None, max_length=1000)


class CoverageResponse(BaseModel):
    domain: str = "Indian Consumer Rights & Protection"
    tagline: str = "Know your consumer rights. See the law. Take the next step."
    supported_topics: List[str]
    out_of_scope_examples: List[str]
    known_limitations: List[str]
    approved_source_count: int
    total_chunk_count: int
