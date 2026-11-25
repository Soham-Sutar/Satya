"""
Conservative consumer-issue classifier, out-of-scope gate, prompt-injection guard,
and material-fact extractor for Indian Consumer Rights & Protection.
"""
from __future__ import annotations

import re
from dataclasses import dataclass, field
from typing import List, Optional, Tuple

from app.models.schemas import ConsumerIssueCategory, SessionContext


OUT_OF_SCOPE_PATTERNS: List[Tuple[str, re.Pattern]] = [
    (
        "criminal law / police / FIR / bail / homicide",
        re.compile(
            r"\b(murder|homicide|culpable homicide|ipc\b|bns\b|crpc\b|bnss\b|fir\b|anticipatory bail|bail application|criminal defence|criminal trial|dowry|assault|kidnapping|theft|robbery)\b",
            re.I,
        ),
    ),
    (
        "passport / visa / immigration services",
        re.compile(
            r"\b(passport|visa|immigration|emigration|citizenship|oci card|frro|consulate)\b",
            re.I,
        ),
    ),
    (
        "property registration / stamp duty / land mutation",
        re.compile(
            r"\b(property registration|sale deed registration|stamp duty|sub-registrar|land mutation|khata|patta|encumbrance certificate|rera registration of title|ancestral property|partition suit)\b",
            re.I,
        ),
    ),
    (
        "family law (divorce / custody / alimony / succession)",
        re.compile(
            r"\b(divorce|alimony|child custody|maintenance under 125|hindu marriage act|muslim personal law|will probate|succession certificate)\b",
            re.I,
        ),
    ),
    (
        "income tax / GST filing / employment labour dispute",
        re.compile(
            r"\b(income tax return|itr filing|section 80c|tds refund|wrongful termination|epf withdrawal|labour court|industrial disputes act)\b",
            re.I,
        ),
    ),
    (
        "general non-consumer topic",
        re.compile(
            r"\b(write a poem|python code|javascript code|recipe for|cricket score|weather today|stock market tip|medical diagnosis)\b",
            re.I,
        ),
    ),
]

PROMPT_INJECTION_RE = re.compile(
    r"(ignore (?:all |previous |above )?(?:rules|instructions)|pretend (?:section|rule)|fabricate a section|make up a citation|bypass|override system prompt|act as a general legal)",
    re.I,
)

# Queries asking for impossible/unsupported things within consumer law
UNSUPPORTED_REQUEST_RE = re.compile(
    r"(automatically entitle|guarantee(?:d)?\s+(?:me\s+|that\s+i\s+will\s+)?(?:a\s+)?(?:refund|replacement|compensation|win|success)|how much exact compensation will (?:i get|the commission award)|predict (?:if i will win|outcome)|section 999|section 420 of consumer)",
    re.I,
)

SECTOR_SPECIFIC_RE = re.compile(
    r"\b(rbi ombudsman|banking ombudsman|upi chargeback|sebi|irdai|insurance ombudsman|telecom regulatory|trai|montreal convention|dgca compensation|rera authority)\b",
    re.I,
)


@dataclass
class ClassificationResult:
    issue_category: ConsumerIssueCategory
    secondary_categories: List[ConsumerIssueCategory] = field(default_factory=list)
    is_out_of_scope: bool = False
    out_of_scope_reason: Optional[str] = None
    is_prompt_injection: bool = False
    asks_for_guarantee_or_unsupported: bool = False
    needs_clarification: bool = False
    clarifying_questions: List[str] = field(default_factory=list)
    extracted_amount_inr: Optional[float] = None
    has_date_fact: bool = False


def _extract_inr_amount(text: str, ctx: Optional[SessionContext]) -> Optional[float]:
    if ctx and ctx.purchase_amount is not None:
        return float(ctx.purchase_amount)
    low = text.lower().replace(",", "")
    m_cr = re.search(r"(?:rs\.?|inr|₹)?\s*(\d+(?:\.\d+)?)\s*(?:crore|crores|cr)\b", low)
    if m_cr:
        return float(m_cr.group(1)) * 10_000_000
    m_lk = re.search(r"(?:rs\.?|inr|₹)?\s*(\d+(?:\.\d+)?)\s*(?:lakh|lakhs|lac|lacs)\b", low)
    if m_lk:
        return float(m_lk.group(1)) * 100_000
    m_k = re.search(r"(?:rs\.?|inr|₹)\s*(\d+(?:\.\d+)?)\b", low)
    if m_k:
        return float(m_k.group(1))
    return None


def classify_query(
    message: str, session_context: Optional[SessionContext] = None
) -> ClassificationResult:
    msg = message.strip()
    low = msg.lower()

    if PROMPT_INJECTION_RE.search(msg):
        return ClassificationResult(
            issue_category="out_of_scope",
            is_prompt_injection=True,
            is_out_of_scope=False,
        )

    # Check out-of-scope legal domains first (unless clearly consumer housing construction / service)
    consumer_anchor = bool(
        re.search(
            r"\b(consumer|defective|deficiency|e-commerce|ecommerce|seller|buyer|refund|replacement|warranty|misleading ad|grievance officer|consumer commission|consumer helpline|1915|e-jagriti|product liability)\b",
            low,
        )
    )
    for label, pat in OUT_OF_SCOPE_PATTERNS:
        if pat.search(msg) and not consumer_anchor:
            return ClassificationResult(
                issue_category="out_of_scope",
                is_out_of_scope=True,
                out_of_scope_reason=label,
            )

    # Extract key facts
    amount_inr = _extract_inr_amount(msg, session_context)
    has_date = bool(
        (session_context and session_context.purchase_date)
        or re.search(
            r"\b(\d{4}-\d{2}-\d{2}|\d{1,2}[/-]\d{1,2}[/-]\d{2,4}|yesterday|last week|last month|days? ago|months? ago|years? ago|20\d{2}|jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)\b",
            low,
        )
    )

    asks_guarantee = bool(UNSUPPORTED_REQUEST_RE.search(msg))

    # Score consumer issue categories
    scores: dict[ConsumerIssueCategory, int] = {
        "defective_goods": 0,
        "deficiency_in_service": 0,
        "unfair_trade_practice": 0,
        "misleading_advertisement": 0,
        "ecommerce_grievance": 0,
        "product_liability": 0,
        "consumer_status_and_rights": 0,
        "refund_replacement_repair": 0,
        "consumer_commission_filing": 0,
        "jurisdiction_and_limitation": 0,
        "mediation": 0,
        "helpline_and_escalation": 0,
    }

    kw_map: dict[ConsumerIssueCategory, List[str]] = {
        "defective_goods": ["defect", "defective", "damaged", "broken", "cracked", "faulty", "not working", "stopped working", "quality", "spurious"],
        "deficiency_in_service": ["deficiency", "service", "delivered as promised", "courier", "repair service", "installation", "delay", "poor service", "negligence"],
        "unfair_trade_practice": ["unfair trade", "unfair contract", "hidden charge", "dark pattern", "false representation", "refusing bill", "basket sneaking"],
        "misleading_advertisement": ["misleading ad", "advertisement", "endorsement", "influencer", "celebrity", "bait", "surrogate", "false claim", "ccpa"],
        "ecommerce_grievance": ["online", "e-commerce", "ecommerce", "flipkart", "amazon", "marketplace", "grievance officer", "platform", "website", "app order", "48 hours", "nodal officer"],
        "product_liability": ["product liability", "injury", "harm", "exploded", "burn", "manufacturer liable", "product seller", "compensation for harm"],
        "consumer_status_and_rights": ["who is a consumer", "definition of consumer", "section 2(7)", "commercial purpose", "livelihood", "self-employment", "consumer rights", "section 2(9)", "resale"],
        "refund_replacement_repair": ["refund", "replace", "replacement", "repair", "return", "money back", "guarantee", "compensation", "remedy", "remedies"],
        "consumer_commission_filing": ["file a complaint", "consumer commission", "consumer forum", "consumer court", "e-jagriti", "ejagriti", "fee", "filing fee", "district commission", "state commission", "national commission"],
        "jurisdiction_and_limitation": ["which commission", "jurisdiction", "pecuniary", "territorial", "how long", "time limit", "limitation", "two years", "condonation", "delay", "lakh", "crore"],
        "mediation": ["mediation", "mediator", "settlement", "settle out of court"],
        "helpline_and_escalation": ["helpline", "national consumer helpline", "nch", "1915", "ingram", "difference between", "grievance route", "escalate", "not responded"],
    }

    for cat, kws in kw_map.items():
        for kw in kws:
            if kw in low:
                scores[cat] += 2 if len(kw.split()) > 1 else 1

    if session_context and session_context.purchase_channel == "ecommerce":
        scores["ecommerce_grievance"] += 1

    ranked = sorted(scores.items(), key=lambda x: x[1], reverse=True)
    top_cat, top_score = ranked[0]
    secondary = [c for c, s in ranked[1:4] if s > 0]

    if top_score == 0:
        # Check if it's genuinely consumer-related or sector-specific consumer regime (handled by evidence_gate -> cannot_verify)
        if SECTOR_SPECIFIC_RE.search(msg) or consumer_anchor or any(w in low for w in ["shop", "store", "product", "goods", "bought", "purchased", "paid", "bill", "invoice", "warranty"]):
            top_cat = "other_consumer_issue"
        else:
            return ClassificationResult(
                issue_category="out_of_scope",
                is_out_of_scope=True,
                out_of_scope_reason="outside Indian Consumer Rights & Protection",
            )

    # Material-fact clarification checks (only ask when a material fact is missing and changes the answer!)
    clarifying_questions: List[str] = []
    needs_clarification = False

    # Case 1: User specifically asks WHICH Consumer Commission (pecuniary/territorial) or exact filing fee, without an amount!
    asks_specific_commission = bool(
        re.search(r"\b(which|what)\s+(?:consumer\s+)?(?:commission|forum|court)\b", low)
        or re.search(r"\b(?:how much|what is the)\s+(?:filing\s+)?fee\b", low)
    )
    if asks_specific_commission and amount_inr is None:
        needs_clarification = True
        clarifying_questions.append(
            "What was the value of the goods or services paid as consideration (in ₹), and in which district/state do you reside or did the cause of action arise?"
        )

    # Case 2: User specifically asks "Am I still within time / is my complaint time-barred?" without any date/timeframe!
    asks_own_limitation = bool(
        re.search(r"\b(am i|is my|still within time|time[- ]?barred|too late to file|can i still file)\b", low)
    )
    if asks_own_limitation and not has_date:
        needs_clarification = True
        clarifying_questions.append(
            "Approximately when did the defect, deficiency, or dispute arise (month and year), so we can assess it against the statutory limitation period?"
        )

    # Case 3: Ambiguous generic "what can I do?" with no product/service/issue details at all
    if top_cat == "other_consumer_issue" and len(msg.split()) < 8 and not consumer_anchor:
        needs_clarification = True
        clarifying_questions.append(
            "Could you briefly describe the consumer issue (for example, defective goods, deficiency in service, or an online order dispute), approximate amount paid, and whether you bought it for personal use?"
        )

    return ClassificationResult(
        issue_category=top_cat,
        secondary_categories=secondary,
        is_out_of_scope=False,
        is_prompt_injection=False,
        asks_for_guarantee_or_unsupported=asks_guarantee,
        needs_clarification=needs_clarification,
        clarifying_questions=clarifying_questions,
        extracted_amount_inr=amount_inr,
        has_date_fact=has_date,
    )
