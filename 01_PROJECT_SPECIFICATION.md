# SATYA — Project Specification & Requirements

**Product:** Satya — Trustworthy AI for Indian Consumer Rights & Protection  
**Hackathon:** 24-hour prototype  
**Domain:** Indian Consumer Rights and Protection only  
**Core promise:** Every material legal or procedural claim is backed by an exact, inspectable source passage. If Satya cannot verify a claim from approved sources, it says so instead of guessing.

---

## 1. Product overview

Satya is a single-domain, source-grounded AI assistant that helps Indian consumers understand their rights, identify possible consumer-protection remedies, prepare for a complaint, and find the correct official channel.

Satya is **not** a general legal chatbot. It must not contain separate workspaces or modes for passports, criminal law, property registration, or unrelated legal domains. All product navigation, retrieval, examples, prompts, and data must be centred on **Consumer Rights and Protection in India**.

### Product positioning

**“Know your consumer rights. See the law. Take the next step.”**

### Problem being addressed

Consumers often struggle to understand:
- Whether a product/service issue may amount to a consumer grievance.
- What remedies may be available for defective goods, deficient services, unfair trade practices, misleading advertisements, or e-commerce problems.
- What evidence and documents to preserve.
- How to approach a seller/service provider, the National Consumer Helpline, or the appropriate Consumer Commission.
- Which Consumer Commission has jurisdiction and how to initiate a complaint.
- What the law actually says, rather than relying on unverified online advice.

General-purpose LLMs can invent legal sections, overstate entitlements, give outdated monetary limits, confuse grievance channels with adjudicatory forums, and promise refunds or compensation without sufficient facts. Satya addresses this through curated official sources, exact citations, jurisdiction-aware retrieval, and explicit abstention.

---

## 2. 24-hour feasibility assessment

A useful prototype is achievable in 24 hours if the scope is kept narrow and the knowledge base is curated.

### MVP should demonstrate

1. One consumer-rights assistant, not multiple legal domains.
2. A focused set of high-value consumer scenarios.
3. Official-source ingestion and paragraph/section-level retrieval.
4. Answers with citations tied to individual claims.
5. A strict evidence gate and “cannot verify” behaviour.
6. A practical complaint-preparation checklist.
7. A source viewer that opens the exact cited passage.

### Recommended scenario coverage

Prioritise these scenarios:
- Defective product / product not as described.
- Deficiency in service (for example, a service not delivered as promised).
- Refund, replacement, repair or compensation questions, with no guaranteed outcome.
- Unfair trade practices and misleading advertisements.
- E-commerce complaints: seller/platform disclosures, grievance officer and grievance process, where supported by current rules.
- Consumer complaint filing: basic eligibility, limitation, jurisdiction and filing process.
- National Consumer Helpline and Consumer Commission distinction.
- Product liability at a high level, with careful factual qualification.

### Do not promise in the prototype

- A definitive legal opinion or guaranteed case outcome.
- Guaranteed refund, replacement, compensation or success.
- Automatic filing, payment, mediation, or representation.
- Real-time status from government systems unless an authorised integration exists.
- Exhaustive coverage of every sector-specific regulation (banking, insurance, telecom, electricity, real estate, securities, medical negligence, etc.).
- A final determination that a person legally qualifies as a “consumer” without reviewing all facts and applicable exclusions.
- An exact filing-fee calculation unless current official fee rules and inputs are verified.

---

## 3. Scope and legal boundaries

### 3.1 In scope

**A. Consumer status and basic rights**
- Explain the general meaning of “consumer” under the Consumer Protection Act, 2019.
- Explain relevant exclusions and caveats, including the distinction between personal use and commercial purpose, without making a definitive classification from incomplete facts.
- Explain core consumer rights using the Act and official materials.

**B. Common consumer grievances**
- Defective goods.
- Deficiency in service.
- Unfair trade practices.
- Misleading advertisements.
- Unfair contracts, where the relevant statutory provisions are available.
- E-commerce grievances under the Consumer Protection (E-Commerce) Rules, 2020 and applicable amendments/notifications.
- Product liability basics.

**C. Remedies and complaint preparation**
- Explain possible statutory remedies under the Act, such as repair, replacement, refund, compensation, discontinuance of unfair practices or other relief, only where relevant and properly qualified.
- Help users create a factual chronology.
- Generate a document/evidence checklist.
- Draft a neutral complaint summary for the user to review; do not submit it automatically.
- Explain the difference between the National Consumer Helpline (pre-litigation grievance assistance) and Consumer Commissions (adjudicatory forums).

**D. Consumer Commission process**
- Explain the general process for filing before a Consumer Commission.
- Explain territorial and pecuniary jurisdiction based on current official law/rules.
- Explain limitation periods and the possibility/conditions for delay condonation only with exact citations.
- Explain e-filing through the current official platform only after confirming the current platform and official guidance.
- Explain mediation where supported by the Act/rules.

**E. Official support channels**
- National Consumer Helpline (NCH).
- e-Jagriti / official Consumer Commission e-filing platform, after verifying current official portal and process.
- Department of Consumer Affairs.
- Consumer Commissions and official directories.

### 3.2 Out of scope

- Other legal domains or separate domain workspaces.
- Criminal defence, criminal investigation, family law, property registration, passport services, immigration, taxation, employment disputes, or general legal Q&A.
- Sector-specific legal advice unless a source pack is explicitly added and clearly marked as an extension (for example, banking/insurance/telecom-specific ombudsman regimes).
- Court strategy, prediction of outcomes, or representation.
- Determining fraud/criminal guilt.
- Guaranteeing that a user will receive a refund or compensation.
- Legal review of complex contracts or high-value disputes.
- Automated filing or submission of complaints in the MVP.

### 3.3 Scope gate

If the user asks about something outside Indian consumer rights and protection:
- Do not answer as a general legal assistant.
- Explain that Satya currently supports Indian consumer-rights and consumer-protection information only.
- If there is a consumer-protection angle, ask one focused question to bring the request within scope.
- Otherwise direct the user to an appropriate qualified professional or official authority, without inventing contact details.

---

## 4. User personas and use cases

| Persona | Need | Satya outcome |
|---|---|---|
| Online shopper | Product arrived damaged or materially different | Understand possible consumer remedies and preserve evidence |
| Service customer | Paid service was not delivered as promised | Understand deficiency-in-service concepts and complaint route |
| E-commerce buyer | Seller/platform has not resolved grievance | Understand official grievance mechanism and escalation options |
| Consumer facing misleading advertising | Wants to know what rules may apply | Find applicable statutory/rule/guideline passage |
| First-time complainant | Unsure how to file a consumer complaint | Jurisdiction-aware filing checklist and official portal links |
| Consumer researcher | Wants to verify a section or legal claim | Exact statutory source and passage |

### Example demo questions

1. “I bought a phone online and it arrived with a damaged screen. What can I do?”
2. “The seller is refusing to replace a defective product. What remedies does the Consumer Protection Act mention?”
3. “An e-commerce platform has not responded to my complaint. What does the rule say about grievance handling?”
4. “What is the difference between the National Consumer Helpline and a Consumer Commission?”
5. “Which Consumer Commission should I approach for a claim involving ₹35 lakh?”
6. “How long do I have to file a consumer complaint?”
7. “Does every defective product automatically entitle me to compensation?”
8. “Show me the exact section that defines deficiency in service.”

Use synthetic scenarios for the demo. Do not ask participants to upload real bills, identity documents, phone numbers, addresses, or sensitive complaint records.

---

## 5. Functional requirements

Priority: **P0 = essential for hackathon demo**, **P1 = valuable if time permits**, **P2 = future enhancement**.

| ID | Functional requirement | Priority |
|---|---|---|
| FR-01 | Single-domain experience focused exclusively on Indian Consumer Rights & Protection | P0 |
| FR-02 | Natural-language consumer query input and conversational follow-ups | P0 |
| FR-03 | Detect consumer issue category (defect, deficiency, e-commerce, misleading ad, filing process, etc.) | P0 |
| FR-04 | Ask for material missing facts such as purchase date, seller/platform, state, amount paid and desired remedy only when needed | P0 |
| FR-05 | Retrieve only from the approved consumer-protection source corpus | P0 |
| FR-06 | Provide paragraph/section-level citations for every material legal or procedural claim | P0 |
| FR-07 | Map individual answer claims to the exact supporting source passage | P0 |
| FR-08 | Evidence sufficiency gate: abstain if evidence does not directly support the claim | P0 |
| FR-09 | Support verified, partially verified, cannot verify, needs clarification and out-of-scope statuses | P0 |
| FR-10 | Detect source version/date and warn when a source may be outdated or superseded | P0 |
| FR-11 | Source viewer that opens the exact cited section/paragraph/page | P0 |
| FR-12 | Generate a consumer complaint preparation checklist with cited legal requirements separated from practical suggestions | P0 |
| FR-13 | Explain and link to official consumer grievance channels using verified official URLs | P0 |
| FR-14 | Basic jurisdiction and limitation guidance, only where current official sources are indexed | P0 |
| FR-15 | Retain non-sensitive facts within the current session and allow user correction/clearing | P1 |
| FR-16 | Generate a neutral complaint-summary draft for user review, clearly marked as a draft and not legal advice | P1 |
| FR-17 | Feedback controls: unsupported answer, wrong citation, outdated source, unclear answer | P1 |
| FR-18 | Admin workflow to add, review, approve, supersede or withdraw source documents | P1 |
| FR-19 | Export/copy checklist with citations | P2 |
| FR-20 | Multilingual support (Hindi and regional languages) after legal terminology validation | P2 |

### Required answer outcomes

- **Verified:** Directly supported by current approved evidence.
- **Partially verified:** Only part of the requested answer is supported; clearly separate supported and unsupported parts.
- **Cannot verify:** No sufficient approved evidence, source conflict, or current applicability cannot be established.
- **Needs clarification:** A material fact is missing.
- **Out of scope:** The question is not about Indian consumer rights/protection.

---

## 6. Non-functional requirements

| ID | Requirement | Expected behaviour |
|---|---|---|
| NFR-01 | Grounded accuracy | No legal claim generated solely from model pretraining |
| NFR-02 | Traceability | Answer claim → chunk → source/version → official URL |
| NFR-03 | Reliability | Fail safely if LLM, retrieval or database is unavailable |
| NFR-04 | Performance | Target under 10 seconds for a typical indexed query |
| NFR-05 | Privacy | Avoid collecting unnecessary personal or financial identifiers |
| NFR-06 | Security | Keep API keys server-side; validate uploads and inputs |
| NFR-07 | Maintainability | Modular ingestion, retrieval, answer and validation services |
| NFR-08 | Extensibility | Add further consumer-protection source packs without changing core pipeline |
| NFR-09 | Usability | Responsive, accessible UI with readable citations |
| NFR-10 | Currency | Store publication/effective/retrieval dates and source status |
| NFR-11 | Observability | Log request ID, retrieved chunk IDs, source versions, latency and abstention reason |
| NFR-12 | Testability | Repeatable answer, citation, abstention and out-of-scope tests |

---

## 7. Stand-out features

Prioritise the first three. Do not build all features at the expense of a reliable core.

### Feature A — Evidence Ledger (must-have differentiator)
Display each material claim beside:
- Supported / partial / unsupported status.
- Source title and issuing authority.
- Exact Act section, rule, paragraph, page or official FAQ heading.
- Publication/effective date.
- “Open exact passage” action.

### Feature B — “Why Satya Won’t Answer”
When evidence is insufficient, explain:
- What the user asked.
- What evidence was found.
- What is missing or uncertain.
- Which additional fact or official source would resolve it.
- Where the user can verify the matter.

Make abstention helpful rather than a dead end.

### Feature C — Consumer Action Planner
Turn a supported answer into a simple sequence:
1. Preserve invoice/order confirmation/payment proof.
2. Preserve product/service evidence and communications.
3. Contact seller/service provider through an official channel where appropriate.
4. Use the National Consumer Helpline or other applicable grievance mechanism.
5. Consider the appropriate Consumer Commission if unresolved, subject to eligibility, jurisdiction and limitation.

Every item that states a legal obligation or entitlement must be cited. Practical evidence-preservation tips must be labelled as suggestions.

### Feature D — Complaint Readiness Checker
A guided, non-adjudicative checklist that checks whether the user has basic information commonly needed to prepare a complaint: parties, transaction details, chronology, amount paid, issue, attempts to resolve, and supporting documents. It must not say that a complaint is legally valid or guaranteed to succeed.

### Feature E — “Law vs Practical Advice” labels
Clearly distinguish:
- What the statute/rule says.
- What an official portal instructs.
- What is a practical suggestion.
- What needs confirmation from a qualified professional or authority.

### Feature F — Source Freshness Indicator
Show source version, date last checked and review status. Mark uncertain or superseded material so it cannot silently support a current-law answer.

---

## 8. Suggested screens

1. **Home:** Satya brand, single consumer-rights domain, sample questions, coverage and disclaimer.
2. **Chat:** consumer question, response, clarifying prompts and status.
3. **Evidence Ledger:** claim-to-citation mapping.
4. **Source viewer:** exact cited passage with document metadata and original link.
5. **Action Planner:** complaint-preparation checklist and next steps.
6. **Source coverage:** indexed official sources, version dates and known limitations.

There must be no separate domain selector for unrelated legal areas.

---

## 9. 24-hour development approach

Avoid too many phases. Build one end-to-end vertical slice first.

### Build block 1 — Core application (approximately hours 0–4)
- Inspect/create project.
- Build the single-domain UI.
- Configure backend, LLM and environment variables.
- Define response schema and source metadata model.

### Build block 2 — Knowledge + grounded answer engine (approximately hours 4–12)
- Collect a small set of official consumer-protection sources.
- Extract and chunk by section/rule/paragraph.
- Index with vector + keyword retrieval.
- Implement consumer issue routing and clarification.
- Generate structured answers from retrieved evidence only.
- Validate citation IDs and abstain when unsupported.

### Build block 3 — Demo differentiators + hardening (approximately hours 12–20)
- Evidence Ledger and source viewer.
- Consumer Action Planner.
- Source freshness labels.
- Run known-answer, unsupported and out-of-scope tests.
- Fix retrieval and citation failures.

### Final buffer — demo readiness (approximately hours 20–24)
- Remove mock legal content.
- Verify official links and citations.
- Test responsive UI and error states.
- Prepare a short demo and README.

**Fastest safe shortcut:** Manually curate and pre-index a small official corpus rather than building a sophisticated automatic web crawler. A reliable small corpus is better than a large unreviewed one.

---

## 10. Acceptance criteria

- [ ] The application has only one domain: Indian Consumer Rights & Protection.
- [ ] No passport, homicide, property-registration or unrelated legal workspace remains.
- [ ] The user can ask consumer-rights questions in natural language.
- [ ] The system identifies the consumer issue category.
- [ ] The system asks for material missing facts instead of assuming them.
- [ ] Answers use only approved consumer-protection sources.
- [ ] Every material legal/procedural claim has a valid exact citation.
- [ ] Citations open the actual passage, not merely a generic website.
- [ ] Unsupported questions trigger a useful abstention.
- [ ] Out-of-domain questions are declined politely.
- [ ] The Action Planner distinguishes legal requirements from practical suggestions.
- [ ] At least 10 answerable and 5 unanswerable/out-of-scope tests are run.
- [ ] No invented fee, deadline, section, remedy or compensation promise remains.
- [ ] API keys are not exposed in client code or Git.
- [ ] The demo uses synthetic facts and displays a legal-information disclaimer.

---

## 11. Official source catalogue — starting points

Use primary and official sources first. Verify the latest consolidated text, amendments, commencement notifications and portal process before indexing. These URLs are starting points and must be checked at implementation time.

### Core legislation and rules
- Consumer Protection Act, 2019 — India Code: https://www.indiacode.nic.in/
- Consumer Protection (E-Commerce) Rules, 2020 and amendments — Department of Consumer Affairs: https://consumeraffairs.nic.in/
- Consumer Protection (Jurisdiction of the District Commission, the State Commission and the National Commission) Rules, 2021 — verify official current text and amendments through India Code / Department of Consumer Affairs.
- Consumer Protection (Mediation) Rules, 2020 — verify current official text.
- Consumer Protection (Consumer Commission Procedure) Regulations, 2020 — verify current official text and amendments.
- Guidelines issued by the Central Consumer Protection Authority (CCPA), including misleading advertisements and endorsements — official Department of Consumer Affairs / CCPA pages.

### Official grievance and filing channels
- Department of Consumer Affairs: https://consumeraffairs.nic.in/
- National Consumer Helpline: https://consumerhelpline.gov.in/
- Consumer Commission portal / current e-filing platform: verify the current official portal and migration status before linking. Do not assume an old e-Daakhil URL remains the active platform.
- India Code: https://www.indiacode.nic.in/

### Source hierarchy
1. Gazette-notified Act, rules, regulations and amendments.
2. Official government notifications and CCPA orders/guidelines.
3. Official Consumer Affairs / National Consumer Helpline / Consumer Commission portal instructions.
4. Official handbooks and FAQs.
5. Reputable secondary commentary for background only, never as the sole basis for a legal conclusion.

Do not treat a portal FAQ as overriding an Act or rule. Record the source type and date for every item.
