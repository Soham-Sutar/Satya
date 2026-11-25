# Satya — Trustworthy AI for Indian Consumer Rights & Protection

> **“Know your consumer rights. See the law. Take the next step.”**  
> **“Satya does not measure success by how many questions it answers. It measures success by how many answers it can prove.”**

Satya is a single-domain, source-grounded AI assistant exclusively for **Indian Consumer Rights & Protection**. Every material legal or procedural claim is backed by an exact, inspectable Government of India statutory or portal passage, validated server-side against retrieved chunk IDs, with explicit abstention (`Why Satya Won't Answer`) whenever evidence is missing, unapproved, or out of scope.

---

## Architecture & Tech Stack

- **Frontend:** Next.js 15 (App Router), React, TypeScript, Tailwind CSS (`frontend/`)
- **Backend:** FastAPI, Pydantic, PyMuPDF (`pymupdf`), BeautifulSoup4, `rank-bm25`, ChromaDB, scikit-learn (`backend/`)
- **Single-Domain Pipeline:**
  1. **Issue Classifier & Scope Gate** ([issue_classifier.py](backend/app/services/issue_classifier.py)) — routes within 13 Indian consumer-law topics, extracts transaction facts (amount in ₹, dates), rejects out-of-scope domains (criminal law, passport, property registration, family law, etc.) and prompt injection, and triggers `needs_clarification` when a material fact is missing.
  2. **Hybrid Retrieval** ([retrieval.py](backend/app/services/retrieval.py)) — combines BM25 exact legal-term search with ChromaDB vector similarity, filtered strictly to `domain=consumer_rights_india` and `status=approved`.
  3. **Evidence Sufficiency & Freshness Gate** ([evidence_gate.py](backend/app/services/evidence_gate.py)) — verifies direct relevance, surfaces currency notices for `pending_review` or amended rules, and abstains safely when support is insufficient.
  4. **Grounded Answer & Server-Side Citation Validator** ([answer.py](backend/app/services/answer.py), [citation_validator.py](backend/app/services/citation_validator.py)) — supports server-side Gemini / OpenAI structured JSON generation with deterministic extractive fallback when no API key is set, strips any non-retrieved citation IDs, and hydrates all `CitationMetadata` strictly from stored official manifest/chunk data.

---

## Indexed Official Indian Government Corpus

All source documents live in `data/sources/` and are governed by [data/source_manifest.json](data/source_manifest.json):

- **The Consumer Protection Act, 2019** (Act No. 35 of 2019; commenced 20 July 2020 via S.O. 2351(E))
- **Consumer Protection (Jurisdiction of the District Commission, the State Commission and the National Commission) Rules, 2021** (G.S.R. 912(E), 30 Dec 2021)
- **Consumer Protection (E-Commerce) Rules, 2020** & **2021 Amendment** *(Note: E-Commerce Amendment Rules, 2026 is tracked in the manifest as `pending_review` and excluded from verified current-law claims pending verified commencement)*
- **Consumer Protection (Consumer Disputes Redressal Commissions) Rules, 2020** & **2023 Amendment Rules** (G.S.R. 606(E), 17 Aug 2023 — updated filing fee schedule)
- **Consumer Protection (Mediation) Rules, 2020**
- **Consumer Protection (Consumer Commission Procedure) Regulations, 2020**
- **CCPA Guidelines for Prevention of Misleading Advertisements and Endorsements, 2022**
- **CCPA Guidelines for Prevention and Regulation of Dark Patterns, 2023**
- **Department of Consumer Affairs Citizen's Charter (2025-26)** & **National Consumer Helpline (NCH 2.0 / INGRAM)**

---

## Quick Start

### 1. Environment Configuration

```bash
cp .env.example .env
```

Optionally set `LLM_API_KEY` (Gemini `AIza...` or OpenAI `sk-...`) in `.env`. If omitted, Satya operates in zero-hallucination deterministic extractive mode grounded directly in retrieved official chunks.

#### Optional Dedicated Translation Provider (English / Kannada / Hindi)

For instant language conversion and auto-refresh without waiting on Gemini free-tier rate limits, Satya supports dedicated translation providers in `.env` in this priority order:

```env
# Option A: Local Ollama (auto-detected if running on port 11434)
OLLAMA_BASE_URL=http://127.0.0.1:11434
OLLAMA_MODEL=qwen2.5:3b

# Option B: Groq (ultra-fast)
GROQ_API_KEY=gsk_...

# Option C: xAI Grok
XAI_API_KEY=xai-...

# Option D: OpenAI (or any OpenAI-compatible endpoint)
OPENAI_API_KEY=sk-...
# Optional overrides: TRANSLATION_PROVIDER=groq|grok|openai|ollama|gemini|auto
```

If none of the above are configured, Satya automatically uses its fast built-in neural translator fallback (~1s) while preserving all statutory `chunk_id` citations verbatim.

### 2. Run Backend (FastAPI on port 8000)

```bash
python -m pip install -r backend/requirements.txt
# Optional re-index from local official PDFs/HTMLs:
python backend/app/ingestion/index_sources.py

# Start API server:
uvicorn app.main:app --app-dir backend --reload --port 8000
```

### 3. Run Frontend (Next.js on port 3000)

```bash
cd frontend
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

### 4. Run Evaluation & Safety Tests

```bash
pytest backend/tests/test_satya_eval.py -v
```

Includes 12 answerable/qualified consumer-law tests and 7 out-of-scope, prompt-injection, unsupported-section, unindexed-sector, and clarification tests.

---

## Disclaimer

Satya provides source-grounded legal information strictly for **Indian Consumer Rights & Protection**. It does not provide formal legal advice, legal representation, or guaranteed outcomes. Use synthetic facts during demos and never enter OTPs, passwords, Aadhaar numbers, or full payment-card details.
