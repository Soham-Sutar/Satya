import { ActionPlanKind, AnswerStatus, SupportedLanguage } from "./types";

export interface UIStrings {
  brandName: string;
  tagline: string;
  domainBadge: string;
  officialSourcesBtn: string;
  newChatBtn: string;
  historyTitle: string;
  historyEmpty: string;
  clearHistoryBtn: string;
  turnsLabel: string;
  askTitle: string;
  followupHint: string;
  factsBtn: string;
  factsActiveBtn: string;
  factsPrivacyNote: string;
  clearFactsBtn: string;
  statePlaceholder: string;
  channelAny: string;
  channelEcommerce: string;
  channelRetail: string;
  channelService: string;
  amountPlaceholder: string;
  placeholderMain: string;
  placeholderFollowup: string;
  askButton: string;
  verifyingButton: string;
  examplesLabel: string;
  emptyHeroTitle: string;
  emptyHeroDesc: string;
  verifiedCitationsLabel: string;
  officialPortalsLabel: string;
  inspectingNote: string;
  clickToInspectNote: string;
  tabLedger: string;
  tabPlanner: string;
  emptyRightTitleLedger: string;
  emptyRightTitlePlanner: string;
  emptyRightDescLedger: string;
  emptyRightDescPlanner: string;
  promiseHeading: string;
  promiseQuote: string;
  disclaimerLabel: string;
  disclaimerBody: string;
  privacyFooterNote: string;
  statusLabels: Record<AnswerStatus, string>;
  actionKinds: Record<ActionPlanKind, string>;
  ledgerNoClaims: string;
  ledgerCoveragePrefix: string;
  ledgerClaimPrefix: string;
  ledgerSupported: string;
  ledgerPartial: string;
  ledgerUnsupported: string;
  openExactPassage: string;
  sourceViewerHeading: string;
  exactLocatorLabel: string;
  sourceCurrencyLabel: string;
  approvedOfficialBadge: string;
  verbatimTextLabel: string;
  sourceViewerEnglishNote: string;
  openOfficialGovSource: string;
  actionPlanTitle: string;
  actionPlanSubtitle: string;
  copyPlanBtn: string;
  copiedPlanBtn: string;
  readinessTitle: string;
  readinessSubtitle: string;
  draftToggleShow: string;
  draftToggleHide: string;
  navAskSatya: string;
  navLawsPolicies: string;
  policySearchTitle: string;
  policySearchSubtitle: string;
  policySearchPlaceholder: string;
  policySearchBtn: string;
  policyShowAllBtn: string;
  policyMatchedProvisions: string;
  policyNoMatch: string;
  policyTopics: { label: string; query: string }[];
  samplePrompts: { label: string; prompt: string }[];
  followupSuggestions: { label: string; prompt: string }[];
}

export const LANGUAGE_OPTIONS: { code: SupportedLanguage; nativeLabel: string; shortLabel: string }[] = [
  { code: "en", nativeLabel: "English", shortLabel: "EN" },
  { code: "kn", nativeLabel: "ಕನ್ನಡ", shortLabel: "ಕನ್ನಡ" },
  { code: "hi", nativeLabel: "हिन्दी", shortLabel: "हिन्दी" },
];

export const UI_COPY: Record<SupportedLanguage, UIStrings> = {
  en: {
    brandName: "Satya",
    tagline: "Know your consumer rights. See the law. Take the next step.",
    domainBadge: "Indian Consumer Rights & Protection",
    officialSourcesBtn: "Official Sources",
    newChatBtn: "New Chat",
    historyTitle: "Chat History",
    historyEmpty: "No saved conversations yet. Your questions and verified answers will appear here.",
    clearHistoryBtn: "Clear all",
    turnsLabel: "turns",
    askTitle: "Ask about Indian Consumer Rights & Protection",
    followupHint: "Continuous chat active — ask follow-up questions with full context",
    factsBtn: "Optional transaction facts",
    factsActiveBtn: "Transaction facts active",
    factsPrivacyNote: "Non-sensitive Session Facts (never share OTPs, Aadhaar, or card numbers)",
    clearFactsBtn: "Clear facts",
    statePlaceholder: "State (e.g. Karnataka)",
    channelAny: "Channel (any)",
    channelEcommerce: "E-commerce / Online",
    channelRetail: "In-store Retail",
    channelService: "Service Provider",
    amountPlaceholder: "Amount paid (₹)",
    placeholderMain:
      "Describe your consumer issue or ask about the Consumer Protection Act, 2019, E-Commerce Rules, Jurisdiction, NCH (1915), or e-Jagriti...",
    placeholderFollowup:
      "Ask a follow-up question (e.g., 'What if they don't reply in 48 hours?' or 'Which Consumer Commission applies?')...",
    askButton: "Ask Satya",
    verifyingButton: "Verifying...",
    examplesLabel: "Example consumer scenarios & verification tests",
    emptyHeroTitle:
      "Every material legal claim backed by an inspectable Government of India source passage.",
    emptyHeroDesc:
      "Select an example above or ask your own Indian consumer-protection question. You can ask follow-up questions continuously, switch between English, ಕನ್ನಡ, and हिन्दी, and revisit past chats anytime.",
    verifiedCitationsLabel: "Verified Citations:",
    officialPortalsLabel: "Official portals & texts:",
    inspectingNote: "Inspecting Evidence Ledger & Action Plan on right →",
    clickToInspectNote: "Click to inspect Evidence Ledger & Action Plan",
    tabLedger: "Evidence Ledger",
    tabPlanner: "Action Planner",
    emptyRightTitleLedger: "Claim-by-Claim Evidence Verification",
    emptyRightTitlePlanner: "Consumer Action Planner & Readiness",
    emptyRightDescLedger:
      "Ask a question to inspect each legal or procedural claim alongside its exact statutory section, rule, page number, and clickable official passage.",
    emptyRightDescPlanner:
      "Once Satya retrieves approved consumer-protection evidence, it generates a step-by-step Action Plan separating statutory obligations from practical evidence-preservation tips.",
    promiseHeading: "Core Verification Promise",
    promiseQuote:
      "“Satya does not measure success by how many questions it answers. It measures success by how many answers it can prove.”",
    disclaimerLabel: "Disclaimer:",
    disclaimerBody:
      "Satya provides source-grounded legal information strictly for Indian Consumer Rights & Protection. It is not formal legal advice, representation, or a guarantee of refund, replacement, or compensation.",
    privacyFooterNote: "Use synthetic scenarios · Never share OTPs, passwords, or Aadhaar/card details.",
    statusLabels: {
      verified: "Verified from Official Sources",
      partially_verified: "Partially Verified",
      cannot_verify: "Cannot Verify",
      needs_clarification: "Needs Clarification",
      out_of_scope: "Out of Scope",
    },
    actionKinds: {
      legal_requirement: "Law / Statutory Provision",
      conditional_requirement: "Conditional Requirement",
      practical_suggestion: "Practical Suggestion (Advice)",
      professional_confirmation: "Confirm with Authority / Advocate",
    },
    ledgerNoClaims:
      "No verified material legal claims were emitted for this response. Inspect the abstention or clarification notice for details.",
    ledgerCoveragePrefix: "Evidence Coverage:",
    ledgerClaimPrefix: "Claim",
    ledgerSupported: "Supported",
    ledgerPartial: "Partial",
    ledgerUnsupported: "Unsupported",
    openExactPassage: "Open exact passage",
    sourceViewerHeading: "Exact Source Passage",
    exactLocatorLabel: "Exact Locator",
    sourceCurrencyLabel: "Source Currency & Approval",
    approvedOfficialBadge: "Approved Official Source",
    verbatimTextLabel: "Verbatim Extracted Text",
    sourceViewerEnglishNote:
      "Displayed verbatim from the official Government of India Gazette / portal text.",
    openOfficialGovSource: "Open Official Government Source",
    actionPlanTitle: "Consumer Action Plan",
    actionPlanSubtitle:
      "Statutory requirements are cited; practical preservation tips are labelled separately as advice.",
    copyPlanBtn: "Copy plan",
    copiedPlanBtn: "Copied with citations",
    readinessTitle: "Complaint Readiness Checklist",
    readinessSubtitle:
      "Self-check of information commonly needed before approaching NCH (1915) or filing via e-Jagriti. Does not determine legal validity or outcome.",
    draftToggleShow: "Prepare neutral complaint summary draft (for your review)",
    draftToggleHide: "Hide neutral complaint summary draft",
    navAskSatya: "Ask Satya (Chat)",
    navLawsPolicies: "Laws & Policies",
    policySearchTitle: "Consumer Laws, Rules & Policies Explorer",
    policySearchSubtitle:
      "Search any topic within Indian Consumer Rights & Protection to view all applicable Acts, Rules, Regulations, CCPA Guidelines, and official Government policies.",
    policySearchPlaceholder:
      "Search topic (e.g. e-commerce, defective goods, dark patterns, misleading ads, jurisdiction, mediation, refund)...",
    policySearchBtn: "Search Laws",
    policyShowAllBtn: "Show All Indexed Laws",
    policyMatchedProvisions: "Matching Sections / Rules / Clauses",
    policyNoMatch: "No indexed consumer-protection policies matched that query.",
    policyTopics: [
      { label: "E-Commerce & Grievance Officer", query: "ecommerce grievance officer" },
      { label: "Defective Goods & Remedies", query: "defective goods remove replace refund" },
      { label: "Deficiency in Service", query: "deficiency in service" },
      { label: "Misleading Ads & Endorsements", query: "misleading advertisement endorsement" },
      { label: "Dark Patterns", query: "dark patterns" },
      { label: "Jurisdiction & Filing Fees", query: "jurisdiction fee district state national commission" },
      { label: "Product Liability", query: "product liability" },
      { label: "Mediation & NCH Helpline", query: "mediation helpline 1915" },
    ],
    samplePrompts: [
      {
        label: "Damaged phone bought online",
        prompt: "I bought a phone online and it arrived with a damaged screen. What can I do?",
      },
      {
        label: "E-commerce not responding",
        prompt:
          "An e-commerce platform has not responded to my complaint. What does the rule say about grievance handling?",
      },
      {
        label: "₹35 lakh claim jurisdiction",
        prompt: "Which Consumer Commission should I approach for a claim involving ₹35 lakh?",
      },
      {
        label: "NCH vs Consumer Commission",
        prompt: "What is the difference between the National Consumer Helpline and a Consumer Commission?",
      },
      {
        label: "Define deficiency in service",
        prompt: "Show me the exact section that defines deficiency in service.",
      },
      {
        label: "Test abstention (unsupported)",
        prompt: "Tell me what Section 999 of the Consumer Protection Act says about instant payouts.",
      },
      {
        label: "Test scope gate (out of scope)",
        prompt: "How do I apply for an Indian passport renewal?",
      },
    ],
    followupSuggestions: [
      { label: "What is the time limit to file?", prompt: "How long do I have to file a consumer complaint?" },
      { label: "What if they don't reply?", prompt: "What if the seller or platform does not respond?" },
      { label: "Is mediation available?", prompt: "Can this dispute be resolved through mediation?" },
    ],
  },

  kn: {
    brandName: "ಸತ್ಯ (Satya)",
    tagline: "ನಿಮ್ಮ ಗ್ರಾಹಕ ಹಕ್ಕುಗಳನ್ನು ತಿಳಿಯಿರಿ. ಕಾನೂನನ್ನು ನೋಡಿ. ಮುಂದಿನ ಹೆಜ್ಜೆ ಇಡಿ.",
    domainBadge: "ಭಾರತೀಯ ಗ್ರಾಹಕ ಹಕ್ಕುಗಳು ಮತ್ತು ರಕ್ಷಣೆ",
    officialSourcesBtn: "ಅಧಿಕೃತ ಮೂಲಗಳು",
    newChatBtn: "ಹೊಸ ಚಾಟ್",
    historyTitle: "ಚಾಟ್ ಇತಿಹಾಸ",
    historyEmpty: "ಇನ್ನೂ ಯಾವುದೇ ಉಳಿಸಿದ ಸಂಭಾಷಣೆಗಳಿಲ್ಲ. ನಿಮ್ಮ ಪ್ರಶ್ನೆಗಳು ಮತ್ತು ಉತ್ತರಗಳು ಇಲ್ಲಿ ಕಾಣಿಸುತ್ತವೆ.",
    clearHistoryBtn: "ಎಲ್ಲಾ ಅಳಿಸಿ",
    turnsLabel: "ಸಂದೇಶಗಳು",
    askTitle: "ಭಾರತೀಯ ಗ್ರಾಹಕ ಹಕ್ಕುಗಳು ಮತ್ತು ರಕ್ಷಣೆಯ ಬಗ್ಗೆ ಕೇಳಿ",
    followupHint: "ನಿರಂತರ ಚಾಟ್ ಸಕ್ರಿಯವಾಗಿದೆ — ಹಿಂದಿನ ಸಂದರ್ಭದೊಂದಿಗೆ ಮುಂದುವರಿದ ಪ್ರಶ್ನೆಗಳನ್ನು ಕೇಳಿ",
    factsBtn: "ಐಚ್ಛಿಕ ವಹಿವಾಟು ವಿವರಗಳು",
    factsActiveBtn: "ವಹಿವಾಟು ವಿವರಗಳು ಸಕ್ರಿಯವಾಗಿವೆ",
    factsPrivacyNote: "ಸೂಕ್ಷ್ಮವಲ್ಲದ ವಿವರಗಳು (OTP, ಆಧಾರ್, ಅಥವಾ ಕಾರ್ಡ್ ಸಂಖ್ಯೆಗಳನ್ನು ಎಂದಿಗೂ ಹಂಚಿಕೊಳ್ಳಬೇಡಿ)",
    clearFactsBtn: "ವಿವರ ಅಳಿಸಿ",
    statePlaceholder: "ರಾಜ್ಯ (ಉದಾ. ಕರ್ನಾಟಕ)",
    channelAny: "ಖರೀದಿ ಮಾಧ್ಯಮ",
    channelEcommerce: "ಇ-ಕಾಮರ್ಸ್ / ಆನ್‌ಲೈನ್",
    channelRetail: "ಅಂಗಡಿ ಖರೀದಿ",
    channelService: "ಸೇವಾ ಪೂರೈಕೆದಾರ",
    amountPlaceholder: "ಪಾವತಿಸಿದ ಮೊತ್ತ (₹)",
    placeholderMain:
      "ನಿಮ್ಮ ಗ್ರಾಹಕ ಸಮಸ್ಯೆಯನ್ನು ವಿವರಿಸಿ ಅಥವಾ ಗ್ರಾಹಕ ರಕ್ಷಣಾ ಕಾಯ್ದೆ 2019, ಇ-ಕಾಮರ್ಸ್ ನಿಯಮಗಳು, NCH (1915), ಅಥವಾ e-Jagriti ಬಗ್ಗೆ ಕೇಳಿ...",
    placeholderFollowup:
      "ಮುಂದುವರಿದ ಪ್ರಶ್ನೆ ಕೇಳಿ (ಉದಾ., '48 ಗಂಟೆಗಳಲ್ಲಿ ಪ್ರತಿಕ್ರಿಯಿಸದಿದ್ದರೆ ಏನು ಮಾಡಬೇಕು?' ಅಥವಾ 'ಯಾವ ಗ್ರಾಹಕ ಆಯೋಗಕ್ಕೆ ಹೋಗಬೇಕು?')...",
    askButton: "ಸತ್ಯವನ್ನು ಕೇಳಿ",
    verifyingButton: "ಪರಿಶೀಲಿಸಲಾಗುತ್ತಿದೆ...",
    examplesLabel: "ಉದಾಹರಣೆ ಗ್ರಾಹಕ ಪ್ರಶ್ನೆಗಳು ಮತ್ತು ಪರಿಶೀಲನಾ ಪರೀಕ್ಷೆಗಳು",
    emptyHeroTitle:
      "ಪ್ರತಿಯೊಂದು ಕಾನೂನುಬದ್ಧ ಮಾಹಿತಿಯೂ ಭಾರತ ಸರ್ಕಾರದ ಅಧಿಕೃತ ಮೂಲ ಪಠ್ಯದಿಂದ ಆಧಾರಿತವಾಗಿದೆ.",
    emptyHeroDesc:
      "ಮೇಲಿನ ಉದಾಹರಣೆಯನ್ನು ಆಯ್ಕೆಮಾಡಿ ಅಥವಾ ಕನ್ನಡ, ಇಂಗ್ಲಿಷ್ ಅಥವಾ ಹಿಂದಿಯಲ್ಲಿ ಪ್ರಶ್ನೆ ಕೇಳಿ. ನೀವು ನಿರಂತರವಾಗಿ ಮುಂದುವರಿದ ಪ್ರಶ್ನೆಗಳನ್ನು ಕೇಳಬಹುದು ಮತ್ತು ಚಾಟ್ ಇತಿಹಾಸಕ್ಕೆ ಹಿಂತಿರುಗಬಹುದು.",
    verifiedCitationsLabel: "ದೃಢೀಕೃತ ಉಲ್ಲೇಖಗಳು:",
    officialPortalsLabel: "ಅಧಿಕೃತ ಪೋರ್ಟಲ್‌ಗಳು ಮತ್ತು ದಾಖಲೆಗಳು:",
    inspectingNote: "ಬಲಭಾಗದಲ್ಲಿ ಸಾಕ್ಷ್ಯ ಲೆಡ್ಜರ್ ಮತ್ತು ಕ್ರಿಯಾ ಯೋಜನೆಯನ್ನು ನೋಡಲಾಗುತ್ತಿದೆ →",
    clickToInspectNote: "ಸಾಕ್ಷ್ಯ ಲೆಡ್ಜರ್ ಮತ್ತು ಕ್ರಿಯಾ ಯೋಜನೆ ನೋಡಲು ಕ್ಲಿಕ್ ಮಾಡಿ",
    tabLedger: "ಸಾಕ್ಷ್ಯ ಲೆಡ್ಜರ್",
    tabPlanner: "ಕ್ರಿಯಾ ಯೋಜನೆ",
    emptyRightTitleLedger: "ಹಕ್ಕು-ವಾರು ಸಾಕ್ಷ್ಯ ಪರಿಶೀಲನೆ",
    emptyRightTitlePlanner: "ಗ್ರಾಹಕ ಕ್ರಿಯಾ ಯೋಜನೆ ಮತ್ತು ಸಿದ್ಧತೆ",
    emptyRightDescLedger:
      "ನಿಖರವಾದ ಕಾಯ್ದೆಯ ಸೆಕ್ಷನ್, ನಿಯಮ, ಪುಟ ಸಂಖ್ಯೆ ಮತ್ತು ಅಧಿಕೃತ ಪಠ್ಯವನ್ನು ನೋಡಲು ಪ್ರಶ್ನೆ ಕೇಳಿ.",
    emptyRightDescPlanner:
      "ಸತ್ಯ ಅಧಿಕೃತ ದಾಖಲೆಗಳನ್ನು ಪರಿಶೀಲಿಸಿದ ನಂತರ ಕಾನೂನುಬದ್ಧ ಹಂತಗಳು ಮತ್ತು ಪ್ರಾಯೋಗಿಕ ಸಲಹೆಗಳನ್ನು ಪ್ರತ್ಯೇಕಿಸಿ ತೋರಿಸುತ್ತದೆ.",
    promiseHeading: "ಮುಖ್ಯ ಭರವಸೆ",
    promiseQuote:
      "“ಸತ್ಯವು ಎಷ್ಟು ಪ್ರಶ್ನೆಗಳಿಗೆ ಉತ್ತರಿಸುತ್ತದೆ ಎಂಬುದರಿಂದ ಯಶಸ್ಸನ್ನು ಅಳೆಯುವುದಿಲ್ಲ; ಎಷ್ಟು ಉತ್ತರಗಳನ್ನು ಸಾಬೀತುಪಡಿಸಬಹುದು ಎಂಬುದರಿಂದ ಅಳೆಯುತ್ತದೆ.”",
    disclaimerLabel: "ಹಕ್ಕುತ್ಯಾಗ:",
    disclaimerBody:
      "ಸತ್ಯವು ಭಾರತೀಯ ಗ್ರಾಹಕ ಹಕ್ಕುಗಳು ಮತ್ತು ರಕ್ಷಣೆಗೆ ಮಾತ್ರ ಆಧಾರಿತ ಕಾನೂನು ಮಾಹಿತಿಯನ್ನು ನೀಡುತ್ತದೆ. ಇದು ಔಪಚಾರಿಕ ಕಾನೂನು ಸಲಹೆ ಅಥವಾ ಮರುಪಾವತಿಯ ಖಾತರಿಯಲ್ಲ.",
    privacyFooterNote: "OTP, ಪಾಸ್‌ವರ್ಡ್, ಆಧಾರ್ ಅಥವಾ ಕಾರ್ಡ್ ವಿವರಗಳನ್ನು ಹಂಚಿಕೊಳ್ಳಬೇಡಿ.",
    statusLabels: {
      verified: "ಅಧಿಕೃತ ಮೂಲಗಳಿಂದ ದೃಢೀಕರಿಸಲಾಗಿದೆ",
      partially_verified: "ಭಾಗಶಃ ದೃಢೀಕರಿಸಲಾಗಿದೆ",
      cannot_verify: "ದೃಢೀಕರಿಸಲು ಸಾಧ್ಯವಾಗಲಿಲ್ಲ",
      needs_clarification: "ಸ್ಪಷ್ಟೀಕರಣದ ಅಗತ್ಯವಿದೆ",
      out_of_scope: "ವ್ಯಾಪ್ತಿಯ ಹೊರಗಿದೆ",
    },
    actionKinds: {
      legal_requirement: "ಕಾನೂನು / ಶಾಸನಬದ್ಧ ನಿಯಮ",
      conditional_requirement: "ಷರತ್ತುಬದ್ಧ ಅಗತ್ಯ",
      practical_suggestion: "ಪ್ರಾಯೋಗಿಕ ಸಲಹೆ",
      professional_confirmation: "ಪ್ರಾಧಿಕಾರ / ವಕೀಲರೊಂದಿಗೆ ದೃಢೀಕರಿಸಿ",
    },
    ledgerNoClaims: "ಈ ಪ್ರತಿಕ್ರಿಯೆಗೆ ಯಾವುದೇ ದೃಢೀಕೃತ ಕಾನೂನು ಹಕ್ಕುಗಳು ಲಭ್ಯವಿಲ್ಲ.",
    ledgerCoveragePrefix: "ಸಾಕ್ಷ್ಯ ವ್ಯಾಪ್ತಿ:",
    ledgerClaimPrefix: "ಹೇಳಿಕೆ",
    ledgerSupported: "ಬೆಂಬಲಿತ",
    ledgerPartial: "ಭಾಗಶಃ",
    ledgerUnsupported: "ಬೆಂಬಲವಿಲ್ಲ",
    openExactPassage: "ನಿಖರ ಪಠ್ಯ ತೆರೆಯಿರಿ",
    sourceViewerHeading: "ನಿಖರವಾದ ಮೂಲ ಪಠ್ಯ",
    exactLocatorLabel: "ನಿಖರ ಸ್ಥಳ",
    sourceCurrencyLabel: "ಮೂಲದ ಸಿಂಧುತ್ವ ಮತ್ತು ಅನುಮೋದನೆ",
    approvedOfficialBadge: "ಅನುಮೋದಿತ ಅಧಿಕೃತ ಮೂಲ",
    verbatimTextLabel: "ಮೂಲ ಪಠ್ಯದ ಯಥಾವತ್ ಭಾಗ",
    sourceViewerEnglishNote:
      "ಕಾನೂನು ನಿಖರತೆಗಾಗಿ ಭಾರತ ಸರ್ಕಾರದ ಅಧಿಕೃತ ಗೆಜೆಟ್ / ಪೋರ್ಟಲ್ ಪಠ್ಯವನ್ನು ಮೂಲ ಇಂಗ್ಲಿಷ್‌ನಲ್ಲಿ ತೋರಿಸಲಾಗಿದೆ.",
    openOfficialGovSource: "ಅಧಿಕೃತ ಸರ್ಕಾರಿ ಮೂಲವನ್ನು ತೆರೆಯಿರಿ",
    actionPlanTitle: "ಗ್ರಾಹಕ ಕ್ರಿಯಾ ಯೋಜನೆ",
    actionPlanSubtitle:
      "ಶಾಸನಬದ್ಧ ನಿಯಮಗಳಿಗೆ ಉಲ್ಲೇಖಗಳಿವೆ; ಪ್ರಾಯೋಗಿಕ ಸಲಹೆಗಳನ್ನು ಪ್ರತ್ಯೇಕವಾಗಿ ಗುರುತಿಸಲಾಗಿದೆ.",
    copyPlanBtn: "ಯೋಜನೆ ನಕಲಿಸಿ",
    copiedPlanBtn: "ಉಲ್ಲೇಖಗಳೊಂದಿಗೆ ನಕಲಿಸಲಾಗಿದೆ",
    readinessTitle: "ದೂರು ಸಿದ್ಧತಾ ಪರಿಶೀಲನಾ ಪಟ್ಟಿ",
    readinessSubtitle:
      "NCH (1915) ಅಥವಾ e-Jagriti ಮೂಲಕ ದೂರು ಸಲ್ಲಿಸುವ ಮೊದಲು ಸಾಮಾನ್ಯವಾಗಿ ಬೇಕಾಗುವ ದಾಖಲೆಗಳ ಸ್ವಯಂ-ಪರಿಶೀಲನೆ.",
    draftToggleShow: "ತಟಸ್ಥ ದೂರು ಸಾರಾಂಶದ ಕರಡು ಸಿದ್ಧಪಡಿಸಿ",
    draftToggleHide: "ದೂರು ಸಾರಾಂಶ ಕರಡು ಮರೆಮಾಡಿ",
    navAskSatya: "ಸತ್ಯವನ್ನು ಕೇಳಿ (ಚಾಟ್)",
    navLawsPolicies: "ಕಾಯ್ದೆಗಳು ಮತ್ತು ನೀತಿಗಳು",
    policySearchTitle: "ಗ್ರಾಹಕ ಕಾಯ್ದೆಗಳು, ನಿಯಮಗಳು ಮತ್ತು ನೀತಿಗಳ ಶೋಧಕ",
    policySearchSubtitle:
      "ಭಾರತೀಯ ಗ್ರಾಹಕ ಹಕ್ಕುಗಳು ಮತ್ತು ರಕ್ಷಣೆಗೆ ಸಂಬಂಧಿಸಿದ ಯಾವುದೇ ವಿಷಯವನ್ನು ಹುಡುಕಿ, ಸಂಬಂಧಿತ ಕಾಯ್ದೆಗಳು, ನಿಯಮಗಳು ಮತ್ತು CCPA ಮಾರ್ಗಸೂಚಿಗಳನ್ನು ನೋಡಿ.",
    policySearchPlaceholder:
      "ವಿಷಯ ಹುಡುಕಿ (ಉದಾ. ಇ-ಕಾಮರ್ಸ್, ದೋಷಪೂರಿತ ಸರಕು, ಜಾಹೀರಾತು, ನ್ಯಾಯವ್ಯಾಪ್ತಿ, ಮಧ್ಯಸ್ಥಿಕೆ)...",
    policySearchBtn: "ಕಾಯ್ದೆ ಹುಡುಕಿ",
    policyShowAllBtn: "ಎಲ್ಲಾ ಕಾಯ್ದೆಗಳನ್ನು ತೋರಿಸಿ",
    policyMatchedProvisions: "ಸಂಬಂಧಿತ ಸೆಕ್ಷನ್‌ಗಳು / ನಿಯಮಗಳು",
    policyNoMatch: "ಈ ವಿಷಯಕ್ಕೆ ಸಂಬಂಧಿಸಿದ ಅನುಮೋದಿತ ಗ್ರಾಹಕ-ರಕ್ಷಣಾ ಕಾಯ್ದೆಗಳು ಕಂಡುಬಂದಿಲ್ಲ.",
    policyTopics: [
      { label: "ಇ-ಕಾಮರ್ಸ್ ನಿಯಮಗಳು", query: "ecommerce grievance officer" },
      { label: "ದೋಷಪೂರಿತ ಸರಕುಗಳು", query: "defective goods remove replace refund" },
      { label: "ಸೇವೆಯಲ್ಲಿ ಕೊರತೆ", query: "deficiency in service" },
      { label: "ತಪ್ಪುದಾರಿಗೆಳೆಯುವ ಜಾಹೀರಾತು", query: "misleading advertisement endorsement" },
      { label: "ಡಾರ್ಕ್ ಪ್ಯಾಟರ್ನ್‌ಗಳು", query: "dark patterns" },
      { label: "ಆಯೋಗದ ನ್ಯಾಯವ್ಯಾಪ್ತಿ ಮತ್ತು ಶುಲ್ಕ", query: "jurisdiction fee district state national commission" },
      { label: "ಉತ್ಪನ್ನ ಹೊಣೆಗಾರಿಕೆ", query: "product liability" },
      { label: "ಮಧ್ಯಸ್ಥಿಕೆ ಮತ್ತು NCH ಸಹಾಯವಾಣಿ", query: "mediation helpline 1915" },
    ],
    samplePrompts: [
      {
        label: "ಆನ್‌ಲೈನ್‌ನಲ್ಲಿ ಹಾನಿಗೊಳಗಾದ ಫೋನ್",
        prompt: "ನಾನು ಆನ್‌ಲೈನ್‌ನಲ್ಲಿ ಫೋನ್ ಖರೀದಿಸಿದೆ ಮತ್ತು ಅದು ಹಾನಿಗೊಳಗಾದ ಪರದೆಯೊಂದಿಗೆ ಬಂದಿದೆ. ನಾನು ಏನು ಮಾಡಬಹುದು?",
      },
      {
        label: "ಇ-ಕಾಮರ್ಸ್ ಪ್ರತಿಕ್ರಿಯಿಸದಿದ್ದರೆ",
        prompt: "ಇ-ಕಾಮರ್ಸ್ ವೇದಿಕೆ ನನ್ನ ದೂರಿಗೆ ಪ್ರತಿಕ್ರಿಯಿಸಿಲ್ಲ. ಕುಂದುಕೊರತೆ ಪರಿಹಾರದ ನಿಯಮ ಏನು ಹೇಳುತ್ತದೆ?",
      },
      {
        label: "₹35 ಲಕ್ಷ ದಾವೆ — ಯಾವ ಆಯೋಗ?",
        prompt: "₹35 ಲಕ್ಷ ಮೊತ್ತದ ದೂರಿಗೆ ನಾನು ಯಾವ ಗ್ರಾಹಕ ಆಯೋಗವನ್ನು ಸಂಪರ್ಕಿಸಬೇಕು?",
      },
      {
        label: "NCH ಮತ್ತು ಗ್ರಾಹಕ ಆಯೋಗದ ವ್ಯತ್ಯಾಸ",
        prompt: "ರಾಷ್ಟ್ರೀಯ ಗ್ರಾಹಕ ಸಹಾಯವಾಣಿ (NCH) ಮತ್ತು ಗ್ರಾಹಕ ಆಯೋಗದ ನಡುವಿನ ವ್ಯತ್ಯಾಸವೇನು?",
      },
      {
        label: "ಸೇವೆಯಲ್ಲಿ ಕೊರತೆ ವ್ಯಾಖ್ಯಾನ",
        prompt: "ಸೇವೆಯಲ್ಲಿ ಕೊರತೆ (deficiency in service) ವ್ಯಾಖ್ಯಾನಿಸುವ ನಿಖರವಾದ ಸೆಕ್ಷನ್ ತೋರಿಸಿ.",
      },
      {
        label: "ವ್ಯಾಪ್ತಿ ಹೊರಗಿನ ಪರೀಕ್ಷೆ (ಪಾಸ್‌ಪೋರ್ಟ್)",
        prompt: "ಭಾರತೀಯ ಪಾಸ್‌ಪೋರ್ಟ್ ನವೀಕರಣಕ್ಕೆ ಹೇಗೆ ಅರ್ಜಿ ಸಲ್ಲಿಸಬೇಕು?",
      },
    ],
    followupSuggestions: [
      { label: "ದೂರು ಸಲ್ಲಿಸಲು ಕಾಲಮಿತಿ ಎಷ್ಟು?", prompt: "ಗ್ರಾಹಕ ದೂರು ಸಲ್ಲಿಸಲು ಎಷ್ಟು ಸಮಯ ಮಿತಿ ಇದೆ?" },
      { label: "ಅವರು ಉತ್ತರಿಸದಿದ್ದರೆ ಏನು?", prompt: "ಮಾರಾಟಗಾರರು ಅಥವಾ ವೇದಿಕೆ ಪ್ರತಿಕ್ರಿಯಿಸದಿದ್ದರೆ ಏನು ಮಾಡಬೇಕು?" },
      { label: "ಮಧ್ಯಸ್ಥಿಕೆ ಲಭ್ಯವಿದೆಯೇ?", prompt: "ಈ ವಿವಾದವನ್ನು ಮಧ್ಯಸ್ಥಿಕೆ (mediation) ಮೂಲಕ ಬಗೆಹರಿಸಬಹುದೇ?" },
    ],
  },

  hi: {
    brandName: "सत्य (Satya)",
    tagline: "अपने उपभोक्ता अधिकार जानें। कानून देखें। अगला कदम उठाएं।",
    domainBadge: "भारतीय उपभोक्ता अधिकार एवं संरक्षण",
    officialSourcesBtn: "आधिकारिक स्रोत",
    newChatBtn: "नई चैट",
    historyTitle: "चैट इतिहास",
    historyEmpty: "अभी तक कोई सहेजी गई बातचीत नहीं है। आपके प्रश्न और प्रमाणित उत्तर यहाँ दिखेंगे।",
    clearHistoryBtn: "सभी हटाएं",
    turnsLabel: "संदेश",
    askTitle: "भारतीय उपभोक्ता अधिकार और संरक्षण के बारे में पूछें",
    followupHint: "निरंतर चैट सक्रिय है — पिछले संदर्भ के साथ आगे के प्रश्न पूछें",
    factsBtn: "वैकल्पिक लेन-देन विवरण",
    factsActiveBtn: "लेन-देन विवरण सक्रिय हैं",
    factsPrivacyNote: "गैर-संवेदनशील तथ्य (OTP, आधार या पूरा कार्ड नंबर कभी न डालें)",
    clearFactsBtn: "विवरण हटाएं",
    statePlaceholder: "राज्य (जैसे कर्नाटक)",
    channelAny: "माध्यम (कोई भी)",
    channelEcommerce: "ई-कॉमर्स / ऑनलाइन",
    channelRetail: "दुकान से खरीद",
    channelService: "सेवा प्रदाता",
    amountPlaceholder: "भुगतान राशि (₹)",
    placeholderMain:
      "अपनी उपभोक्ता समस्या बताएं या उपभोक्ता संरक्षण अधिनियम 2019, ई-कॉमर्स नियम, NCH (1915), या e-Jagriti के बारे में पूछें...",
    placeholderFollowup:
      "आगे का प्रश्न पूछें (जैसे '48 घंटे में जवाब न मिले तो क्या करें?' या 'किस आयोग में शिकायत दर्ज करें?')...",
    askButton: "सत्य से पूछें",
    verifyingButton: "सत्यापित हो रहा है...",
    examplesLabel: "उदाहरण उपभोक्ता प्रश्न एवं सत्यापन परीक्षण",
    emptyHeroTitle:
      "हर कानूनी दावा भारत सरकार के प्रमाणित आधिकारिक स्रोत अंश द्वारा समर्थित है।",
    emptyHeroDesc:
      "ऊपर से कोई उदाहरण चुनें या हिन्दी, कन्नड़ या अंग्रेज़ी में अपना प्रश्न पूछें। आप लगातार फॉलो-अप सवाल पूछ सकते हैं और पुरानी चैट पर वापस जा सकते हैं।",
    verifiedCitationsLabel: "प्रमाणित उद्धरण:",
    officialPortalsLabel: "आधिकारिक पोर्टल और दस्तावेज़:",
    inspectingNote: "दाईं ओर साक्ष्य बही (Evidence Ledger) और कार्य योजना देख रहे हैं →",
    clickToInspectNote: "साक्ष्य बही और कार्य योजना देखने के लिए क्लिक करें",
    tabLedger: "साक्ष्य बही",
    tabPlanner: "कार्य योजना",
    emptyRightTitleLedger: "दावा-दर-दावा साक्ष्य सत्यापन",
    emptyRightTitlePlanner: "उपभोक्ता कार्य योजना एवं तैयारी",
    emptyRightDescLedger:
      "सटीक अधिनियम धारा, नियम, पृष्ठ संख्या और आधिकारिक अंश देखने के लिए कोई प्रश्न पूछें।",
    emptyRightDescPlanner:
      "सत्य अनुमोदित स्रोतों की जांच के बाद कानूनी आवश्यकताओं को व्यावहारिक सुझावों से अलग दिखाते हुए कार्य योजना बनाता है।",
    promiseHeading: "मुख्य सत्यापन सिद्धांत",
    promiseQuote:
      "“सत्य सफलता को इस बात से नहीं मापता कि वह कितने सवालों का जवाब देता है, बल्कि इससे मापता है कि वह कितने जवाब प्रमाणित कर सकता है।”",
    disclaimerLabel: "अस्वीकरण:",
    disclaimerBody:
      "सत्य केवल भारतीय उपभोक्ता अधिकार एवं संरक्षण के लिए स्रोत-आधारित कानूनी जानकारी प्रदान करता है। यह औपचारिक कानूनी सलाह या रिफंड/मुआवज़े की गारंटी नहीं है।",
    privacyFooterNote: "कृपया OTP, पासवर्ड, आधार या कार्ड विवरण साझा न करें।",
    statusLabels: {
      verified: "आधिकारिक स्रोतों से प्रमाणित",
      partially_verified: "आंशिक रूप से प्रमाणित",
      cannot_verify: "पुष्टि नहीं हो सकी",
      needs_clarification: "स्पष्टीकरण आवश्यक है",
      out_of_scope: "कार्यक्षेत्र से बाहर",
    },
    actionKinds: {
      legal_requirement: "कानूनी / वैधानिक प्रावधान",
      conditional_requirement: "शर्त-आधारित आवश्यकता",
      practical_suggestion: "व्यावहारिक सुझाव (सलाह)",
      professional_confirmation: "प्राधिकरण / अधिवक्ता से पुष्टि करें",
    },
    ledgerNoClaims: "इस उत्तर के लिए कोई प्रमाणित कानूनी दावा उत्पन्न नहीं हुआ।",
    ledgerCoveragePrefix: "साक्ष्य कवरेज:",
    ledgerClaimPrefix: "दावा",
    ledgerSupported: "समर्थित",
    ledgerPartial: "आंशिक",
    ledgerUnsupported: "असमर्थित",
    openExactPassage: "सटीक अंश खोलें",
    sourceViewerHeading: "सटीक आधिकारिक स्रोत अंश",
    exactLocatorLabel: "सटीक स्थान",
    sourceCurrencyLabel: "स्रोत की वैधता एवं अनुमोदन",
    approvedOfficialBadge: "अनुमोदित आधिकारिक स्रोत",
    verbatimTextLabel: "मूल आधिकारिक पाठ (अक्षरशः)",
    sourceViewerEnglishNote:
      "कानूनी सटीकता बनाए रखने के लिए भारत सरकार के राजपत्र / पोर्टल का मूल अंग्रेज़ी पाठ यहाँ दिखाया गया है।",
    openOfficialGovSource: "आधिकारिक सरकारी स्रोत खोलें",
    actionPlanTitle: "उपभोक्ता कार्य योजना",
    actionPlanSubtitle:
      "कानूनी प्रावधान उद्धृत हैं; व्यावहारिक सुझाव अलग से चिह्नित किए गए हैं।",
    copyPlanBtn: "योजना कॉपी करें",
    copiedPlanBtn: "उद्धरणों सहित कॉपी हो गया",
    readinessTitle: "शिकायत तैयारी जांच सूची",
    readinessSubtitle:
      "NCH (1915) या e-Jagriti पर शिकायत से पहले आवश्यक सामान्य जानकारी की स्व-जांच।",
    draftToggleShow: "तटस्थ शिकायत सारांश ड्राफ्ट तैयार करें (समीक्षा हेतु)",
    draftToggleHide: "शिकायत सारांश ड्राफ्ट छिपाएं",
    navAskSatya: "सत्य से पूछें (चैट)",
    navLawsPolicies: "कानून और नीतियां",
    policySearchTitle: "उपभोक्ता कानून, नियम एवं नीतियां खोजें",
    policySearchSubtitle:
      "भारतीय उपभोक्ता अधिकार और संरक्षण से जुड़ा कोई भी विषय खोजें और उससे संबंधित सभी अधिनियम, नियम, CCPA दिशानिर्देश और आधिकारिक नीतियां देखें।",
    policySearchPlaceholder:
      "विषय खोजें (जैसे ई-कॉमर्स, दोषपूर्ण उत्पाद, भ्रामक विज्ञापन, क्षेत्राधिकार, मध्यस्थता, रिफंड)...",
    policySearchBtn: "कानून खोजें",
    policyShowAllBtn: "सभी अनुमोदित कानून दिखाएं",
    policyMatchedProvisions: "संबंधित धाराएं / नियम / खंड",
    policyNoMatch: "इस विषय से संबंधित कोई अनुमोदित उपभोक्ता-संरक्षण नीति नहीं मिली।",
    policyTopics: [
      { label: "ई-कॉमर्स और शिकायत अधिकारी", query: "ecommerce grievance officer" },
      { label: "दोषपूर्ण वस्तुएं एवं उपचार", query: "defective goods remove replace refund" },
      { label: "सेवा में कमी", query: "deficiency in service" },
      { label: "भ्रामक विज्ञापन", query: "misleading advertisement endorsement" },
      { label: "डार्क पैटर्न दिशानिर्देश", query: "dark patterns" },
      { label: "आयोग क्षेत्राधिकार और शुल्क", query: "jurisdiction fee district state national commission" },
      { label: "उत्पाद दायित्व", query: "product liability" },
      { label: "मध्यस्थता और NCH 1915", query: "mediation helpline 1915" },
    ],
    samplePrompts: [
      {
        label: "ऑनलाइन खरीदा टूटा फोन",
        prompt: "मैंने ऑनलाइन फोन खरीदा था और उसकी स्क्रीन टूटी हुई आई है। मैं क्या कर सकता हूँ?",
      },
      {
        label: "ई-कॉमर्स जवाब न दे तो",
        prompt: "एक ई-कॉमर्स प्लेटफॉर्म ने मेरी शिकायत का जवाब नहीं दिया है। शिकायत निवारण का नियम क्या कहता है?",
      },
      {
        label: "₹35 लाख दावा — कौन सा आयोग?",
        prompt: "₹35 लाख से जुड़े दावे के लिए मुझे किस उपभोक्ता आयोग में जाना चाहिए?",
      },
      {
        label: "NCH बनाम उपभोक्ता आयोग",
        prompt: "राष्ट्रीय उपभोक्ता हेल्पलाइन (NCH) और उपभोक्ता आयोग में क्या अंतर है?",
      },
      {
        label: "सेवा में कमी की परिभाषा",
        prompt: "सेवा में कमी (deficiency in service) को परिभाषित करने वाली सटीक धारा दिखाएं।",
      },
      {
        label: "दायरे से बाहर जांच (पासपोर्ट)",
        prompt: "भारतीय पासपोर्ट नवीनीकरण के लिए आवेदन कैसे करें?",
      },
    ],
    followupSuggestions: [
      { label: "शिकायत की समय सीमा क्या है?", prompt: "उपभोक्ता शिकायत दर्ज करने की समय सीमा कितनी है?" },
      { label: "वे जवाब न दें तो क्या करें?", prompt: "यदि विक्रेता या प्लेटफॉर्म जवाब न दे तो क्या करें?" },
      { label: "क्या मध्यस्थता उपलब्ध है?", prompt: "क्या इस विवाद को मध्यस्थता (mediation) से सुलझाया जा सकता है?" },
    ],
  },
};
