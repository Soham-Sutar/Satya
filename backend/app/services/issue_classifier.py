"""
Conservative consumer-issue classifier, out-of-scope gate, prompt-injection guard,
multi-turn follow-up context handler, and material-fact extractor for
Indian Consumer Rights & Protection (English, Kannada, Hindi).
"""
from __future__ import annotations

import re
from dataclasses import dataclass, field
from typing import List, Optional, Tuple

from app.config import settings
from app.models.schemas import ChatMessageTurn, ConsumerIssueCategory, SessionContext


OUT_OF_SCOPE_PATTERNS: List[Tuple[str, re.Pattern]] = [
    (
        "criminal law / police / FIR / bail / homicide",
        re.compile(
            r"\b(murder|homicide|culpable homicide|ipc\b|bns\b|crpc\b|bnss\b|fir\b|anticipatory bail|bail application|criminal defence|criminal trial|dowry|assault|kidnapping|theft|robbery)\b|(?:हत्या|जमानत|पुलिस एफआईआर|अपराध|ಕೊಲೆ|ಜಾಮೀನು|ಪೊಲೀಸ್ ಎಫ್‌ಐಆರ್)",
            re.I,
        ),
    ),
    (
        "passport / visa / immigration services",
        re.compile(
            r"\b(passport|visa|immigration|emigration|citizenship|oci card|frro|consulate)\b|(?:पासपोर्ट|वीज़ा|वीजा|ಪಾಸ್‌ಪೋರ್ಟ್|ವೀಸಾ)",
            re.I,
        ),
    ),
    (
        "property registration / stamp duty / land mutation",
        re.compile(
            r"\b(property registration|sale deed registration|stamp duty|sub-registrar|land mutation|khata|patta|encumbrance certificate|rera registration of title|ancestral property|partition suit)\b|(?:संपत्ति पंजीकरण|रजिस्ट्री|स्टांप ड्यूटी|ಆಸ್ತಿ ನೋಂದಣಿ|ಸ್ಟ್ಯಾಂಪ್ ಡ್ಯೂಟಿ)",
            re.I,
        ),
    ),
    (
        "family law (divorce / custody / alimony / succession)",
        re.compile(
            r"\b(divorce|alimony|child custody|maintenance under 125|hindu marriage act|muslim personal law|will probate|succession certificate)\b|(?:तलाक|गुजारा भत्ता|ವಿಚ್ಛೇದನ|ಜೀವನಾಂಶ)",
            re.I,
        ),
    ),
    (
        "income tax / GST filing / employment labour dispute",
        re.compile(
            r"\b(income tax return|itr filing|section 80c|tds refund|wrongful termination|epf withdrawal|labour court|industrial disputes act)\b|(?:आयकर रिटर्न|आदಾಯ ತೆರಿಗೆ)",
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

UNSUPPORTED_REQUEST_RE = re.compile(
    r"(automatically entitle|guarantee(?:d)?\s+(?:me\s+|that\s+i\s+will\s+)?(?:a\s+)?(?:refund|replacement|compensation|win|success)|how much exact compensation will (?:i get|the commission award)|predict (?:if i will win|outcome)|section 999|section 420 of consumer)",
    re.I,
)

SECTOR_SPECIFIC_RE = re.compile(
    r"\b(rbi ombudsman|banking ombudsman|upi chargeback|sebi|irdai|insurance ombudsman|telecom regulatory|trai|montreal convention|dgca compensation|rera authority)\b",
    re.I,
)

# Common Kannada & Hindi consumer-law terms mapped to English equivalents for deterministic classification & retrieval
MULTILINGUAL_GLOSSARY: List[Tuple[str, str]] = [
    # Hindi
    ("उपभोक्ता", "consumer"),
    ("दोषपूर्ण", "defective"),
    ("खराब", "defective damaged"),
    ("टूटा", "broken damaged"),
    ("सेवा में कमी", "deficiency in service"),
    ("सेवा", "service"),
    ("रिफंड", "refund"),
    ("पैसे वापस", "refund"),
    ("बदलने", "replacement replace"),
    ("मरम्मत", "repair"),
    ("ई-कॉमर्स", "e-commerce online"),
    ("ऑनलाइन", "online e-commerce"),
    ("शिकायत अधिकारी", "grievance officer"),
    ("शिकायत", "complaint grievance"),
    ("भ्रामक विज्ञापन", "misleading advertisement"),
    ("विज्ञापन", "advertisement"),
    ("अनुचित व्यापार", "unfair trade practice"),
    ("उपभोक्ता आयोग", "consumer commission"),
    ("आयोग", "commission"),
    ("जिला आयोग", "district commission"),
    ("राज्य आयोग", "state commission"),
    ("राष्ट्रीय आयोग", "national commission"),
    ("हेल्पलाइन", "helpline 1915"),
    ("मध्यस्थता", "mediation"),
    ("समय सीमा", "limitation two years"),
    ("क्षेत्राधिकार", "jurisdiction"),
    ("लाख", "lakh"),
    ("करोड़", "crore"),
    ("मुआवजा", "compensation"),
    ("वारंटी", "warranty"),
    # Kannada
    ("ಗ್ರಾಹಕ", "consumer"),
    ("ದೋಷಪೂರಿತ", "defective"),
    ("ಹಾನಿಗೊಳಗಾದ", "damaged"),
    ("ಕೆಟ್ಟ", "defective faulty"),
    ("ಸೇವೆಯಲ್ಲಿ ಕೊರತೆ", "deficiency in service"),
    ("ಸೇವೆ", "service"),
    ("ಮರುಪಾವತಿ", "refund"),
    ("ಹಣ ವಾಪಸ್", "refund"),
    ("ಬದಲಾವಣೆ", "replacement replace"),
    ("ದುರಸ್ತಿ", "repair"),
    ("ಇ-ಕಾಮರ್ಸ್", "e-commerce online"),
    ("ಆನ್‌ಲೈನ್", "online e-commerce"),
    ("ಕುಂದುಕೊರತೆ ಅಧಿಕಾರಿ", "grievance officer"),
    ("ದೂರು", "complaint grievance"),
    ("ತಪ್ಪುದಾರಿಗೆಳೆಯುವ ಜಾಹೀರಾತು", "misleading advertisement"),
    ("ಜಾಹೀರಾತು", "advertisement"),
    ("ಅನ್ಯಾಯದ ವ್ಯಾಪಾರ", "unfair trade practice"),
    ("ಗ್ರಾಹಕ ಆಯೋಗ", "consumer commission"),
    ("ಆಯೋಗ", "commission"),
    ("ಜಿಲ್ಲಾ ಆಯೋಗ", "district commission"),
    ("ರಾಜ್ಯ ಆಯೋಗ", "state commission"),
    ("ರಾಷ್ಟ್ರೀಯ ಆಯೋಗ", "national commission"),
    ("ಸಹಾಯವಾಣಿ", "helpline 1915"),
    ("ಮಧ್ಯಸ್ಥಿಕೆ", "mediation"),
    ("ಕಾಲಮಿತಿ", "limitation two years"),
    ("ನ್ಯಾಯವ್ಯಾಪ್ತಿ", "jurisdiction"),
    ("ಲಕ್ಷ", "lakh"),
    ("ಕೋಟಿ", "crore"),
    ("ಪರಿಹಾರ", "compensation"),
    ("ವಾರಂಟಿ", "warranty"),
]


def translate_or_normalize_for_search(text: str) -> str:
    """
    Produces an English-augmented search/classification string for Kannada/Hindi inputs
    while keeping English inputs untouched. Uses glossary mapping plus optional Gemini
    translation when non-ASCII script is present.
    """
    has_non_ascii = any(ord(ch) > 127 and not ch == "₹" for ch in text)
    if not has_non_ascii:
        return text

    mapped_terms: List[str] = []
    for src_term, en_term in MULTILINGUAL_GLOSSARY:
        if src_term in text:
            mapped_terms.append(en_term)

    translated = ""
    if not settings.DISABLE_LLM and (
        settings.GEMINI_API_KEY or (settings.LLM_API_KEY and settings.LLM_API_KEY.startswith("AIza"))
    ):
        try:
            from google import genai
            from google.genai import types

            api_key = settings.GEMINI_API_KEY or settings.LLM_API_KEY
            client = genai.Client(
                api_key=api_key,
                http_options=types.HttpOptions(timeout=10000),
            )
            candidates = list(dict.fromkeys([
                settings.LLM_MODEL or "gemini-3.5-flash",
                "gemini-3.5-flash",
                "gemini-3.5-flash-lite",
                "gemini-3.6-flash",
            ]))
            for model_name in candidates:
                try:
                    resp = client.models.generate_content(
                        model=model_name,
                        contents=(
                            "Translate the following Indian consumer query into concise, literal English "
                            "without adding any legal advice or extra facts:\n" + text
                        ),
                        config=types.GenerateContentConfig(temperature=0.0, max_output_tokens=160),
                    )
                    if resp and resp.text:
                        translated = resp.text.strip()
                        break
                except Exception:
                    continue
        except Exception:
            translated = ""

    parts = [text]
    if translated:
        parts.append(translated)
    if mapped_terms:
        parts.append(" ".join(mapped_terms))
    return " ".join(parts)


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
    normalized_query: str = ""
    normalized_history_query: str = ""
    is_followup: bool = False


def _extract_inr_amount(text: str, ctx: Optional[SessionContext]) -> Optional[float]:
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
    if ctx and ctx.purchase_amount is not None:
        return float(ctx.purchase_amount)
    return None


def _score_categories(low: str, session_context: Optional[SessionContext]) -> List[Tuple[ConsumerIssueCategory, int]]:
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

    return sorted(scores.items(), key=lambda x: x[1], reverse=True)


def classify_query(
    message: str,
    session_context: Optional[SessionContext] = None,
    history: Optional[List[ChatMessageTurn]] = None,
) -> ClassificationResult:
    msg = message.strip()
    norm_msg = translate_or_normalize_for_search(msg)
    low = norm_msg.lower()

    if PROMPT_INJECTION_RE.search(norm_msg):
        return ClassificationResult(
            issue_category="out_of_scope",
            is_prompt_injection=True,
            is_out_of_scope=False,
            normalized_query=norm_msg,
        )

    consumer_anchor = bool(
        re.search(
            r"\b(consumer|defective|deficiency|e-commerce|ecommerce|seller|buyer|refund|replacement|warranty|misleading ad|grievance officer|consumer commission|consumer helpline|1915|e-jagriti|product liability)\b",
            low,
        )
    )
    for label, pat in OUT_OF_SCOPE_PATTERNS:
        if pat.search(norm_msg) and not consumer_anchor:
            return ClassificationResult(
                issue_category="out_of_scope",
                is_out_of_scope=True,
                out_of_scope_reason=label,
                normalized_query=norm_msg,
            )

    # Extract amount & date from current turn or prior user turns in history
    history_user_text = " ".join(
        t.content for t in (history or []) if t.role == "user"
    )
    norm_history_user = translate_or_normalize_for_search(history_user_text) if history_user_text else ""

    amount_inr = _extract_inr_amount(norm_msg, None)
    if amount_inr is None and norm_history_user:
        amount_inr = _extract_inr_amount(norm_history_user, session_context)
    elif amount_inr is None and session_context and session_context.purchase_amount is not None:
        amount_inr = float(session_context.purchase_amount)

    combined_low = f"{norm_history_user} {norm_msg}".lower()
    has_date = bool(
        (session_context and session_context.purchase_date)
        or re.search(
            r"\b(\d{4}-\d{2}-\d{2}|\d{1,2}[/-]\d{1,2}[/-]\d{2,4}|yesterday|last week|last month|days? ago|months? ago|years? ago|20\d{2}|jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)\b",
            combined_low,
        )
    )

    asks_guarantee = bool(UNSUPPORTED_REQUEST_RE.search(norm_msg))

    ranked = _score_categories(low, session_context)
    top_cat, top_score = ranked[0]
    secondary = [c for c, s in ranked[1:4] if s > 0]

    # Follow-up detection: if user has prior turns and current message has low standalone score
    # or uses anaphoric follow-up phrasing ("what if", "they", "it", "how long", "what about")
    has_history = bool(history and len(history) > 0)
    is_anaphoric = bool(
        has_history
        and (
            top_score == 0
            or re.search(r"\b(what if|and what|what about|then how|in that case|they|them|it|that|this|still|already)\b", low)
        )
    )

    if top_score == 0:
        if SECTOR_SPECIFIC_RE.search(norm_msg) or consumer_anchor or any(
            w in low for w in ["shop", "store", "product", "goods", "bought", "purchased", "paid", "bill", "invoice", "warranty"]
        ):
            top_cat = "other_consumer_issue"
        elif has_history and norm_history_user:
            # Inherit consumer topic from conversation history if prior context was consumer-related
            hist_ranked = _score_categories(norm_history_user.lower(), session_context)
            if hist_ranked[0][1] > 0 or amount_inr is not None:
                top_cat = hist_ranked[0][0] if hist_ranked[0][1] > 0 else "other_consumer_issue"
                secondary = [c for c, s in hist_ranked[1:4] if s > 0]
                is_anaphoric = True
            else:
                return ClassificationResult(
                    issue_category="out_of_scope",
                    is_out_of_scope=True,
                    out_of_scope_reason="outside Indian Consumer Rights & Protection",
                    normalized_query=norm_msg,
                )
        else:
            return ClassificationResult(
                issue_category="out_of_scope",
                is_out_of_scope=True,
                out_of_scope_reason="outside Indian Consumer Rights & Protection",
                normalized_query=norm_msg,
            )

    clarifying_questions: List[str] = []
    needs_clarification = False

    asks_specific_commission = bool(
        re.search(r"\b(which|what)\s+(?:consumer\s+)?(?:commission|forum|court)\b", combined_low if is_anaphoric else low)
        or re.search(r"\b(?:how much|what is the)\s+(?:filing\s+)?fee\b", low)
    )
    if asks_specific_commission and amount_inr is None:
        needs_clarification = True
        clarifying_questions.append(
            "What was the value of the goods or services paid as consideration (in ₹), and in which district/state do you reside or did the cause of action arise?"
        )

    asks_own_limitation = bool(
        re.search(r"\b(am i|is my|still within time|time[- ]?barred|too late to file|can i still file)\b", low)
    )
    if asks_own_limitation and not has_date:
        needs_clarification = True
        clarifying_questions.append(
            "Approximately when did the defect, deficiency, or dispute arise (month and year), so we can assess it against the statutory limitation period?"
        )

    if top_cat == "other_consumer_issue" and len(norm_msg.split()) < 8 and not consumer_anchor and not is_anaphoric:
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
        normalized_query=norm_msg,
        normalized_history_query=norm_history_user,
        is_followup=is_anaphoric,
    )
