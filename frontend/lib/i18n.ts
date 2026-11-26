import { ActionPlanKind, AnswerStatus, SupportedLanguage } from "./types";

export interface UIStrings {
  brandName: string;
  brandSubtitle: string;
  tagline: string;
  domainBadge: string;
  satyaReadyLabel: string;
  officialSourcesBtn: string;
  newChatBtn: string;
  clearChatBtn: string;
  historyTitle: string;
  historyEmpty: string;
  clearHistoryBtn: string;
  groupToday: string;
  groupYesterday: string;
  groupPrevious: string;
  renameAction: string;
  deleteAction: string;
  saveAction: string;
  cancelAction: string;
  collapseSidebar: string;
  expandSidebar: string;
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
  retrievingNotice: string;
  copyResponseBtn: string;
  copiedResponseBtn: string;
  aiExplanationLabel: string;
  officialEvidenceLabel: string;
  examplesLabel: string;
  welcomeBadge: string;
  emptyHeroTitle: string;
  emptyHeroDesc: string;
  welcomeGroundingNote: string;
  verifiedCitationsLabel: string;
  officialPortalsLabel: string;
  inspectingNote: string;
  clickToInspectNote: string;
  tabLedger: string;
  tabPlanner: string;
  mobileChatTab: string;
  mobileEvidenceTab: string;
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
  samplePrompts: { label: string; description: string; prompt: string }[];
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
    brandSubtitle: "Consumer Rights AI",
    tagline: "Know your consumer rights. See the law. Take the next step.",
    domainBadge: "Indian Consumer Rights & Protection",
    satyaReadyLabel: "Satya Ready",
    officialSourcesBtn: "Official Sources",
    newChatBtn: "New Chat",
    clearChatBtn: "Clear chat",
    historyTitle: "Conversations",
    historyEmpty: "No saved conversations yet. Your consumer queries and verified legal briefs will appear here.",
    clearHistoryBtn: "Clear all",
    groupToday: "Today",
    groupYesterday: "Yesterday",
    groupPrevious: "Previous conversations",
    renameAction: "Rename",
    deleteAction: "Delete",
    saveAction: "Save",
    cancelAction: "Cancel",
    collapseSidebar: "Collapse sidebar",
    expandSidebar: "Expand sidebar",
    turnsLabel: "turns",
    askTitle: "Describe your consumer issue",
    followupHint: "Continuous conversation — ask follow-up questions with full case context",
    factsBtn: "Transaction facts",
    factsActiveBtn: "Facts added",
    factsPrivacyNote: "Optional Non-Sensitive Details (never enter OTPs, Aadhaar, or card numbers)",
    clearFactsBtn: "Clear facts",
    statePlaceholder: "State (e.g. Karnataka)",
    channelAny: "Channel (any)",
    channelEcommerce: "E-commerce / Online",
    channelRetail: "In-store Retail",
    channelService: "Service Provider",
    amountPlaceholder: "Amount paid (₹)",
    placeholderMain: "Describe your consumer issue...",
    placeholderFollowup:
      "Ask a follow-up question (e.g., 'What if they do not reply within 48 hours?')...",
    askButton: "Send",
    verifyingButton: "Verifying...",
    retrievingNotice: "Retrieving and verifying official Indian consumer protection laws...",
    copyResponseBtn: "Copy response",
    copiedResponseBtn: "Copied",
    aiExplanationLabel: "AI Grounded Explanation",
    officialEvidenceLabel: "Supporting Official Legal Evidence",
    examplesLabel: "Common consumer situations — select one to begin",
    welcomeBadge: "Official Indian Consumer Protection AI",
    emptyHeroTitle: "Know your consumer rights.",
    emptyHeroDesc: "Understand the law. Find the right steps. Make informed decisions.",
    welcomeGroundingNote:
      "Satya provides source-grounded information exclusively from official Indian consumer protection laws, rules, CCPA guidelines, and government portals. When evidence is missing or out of scope, Satya abstains rather than guessing.",
    verifiedCitationsLabel: "Inspectable Statutory Citations",
    officialPortalsLabel: "Official Portals & Texts:",
    inspectingNote: "Inspecting Evidence Ledger & Action Plan →",
    clickToInspectNote: "Select to view full Evidence Ledger & Action Plan",
    tabLedger: "Evidence Ledger",
    tabPlanner: "Action Planner",
    mobileChatTab: "Consultation",
    mobileEvidenceTab: "Evidence & Plan",
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
      "Satya provides source-grounded legal information strictly for Indian Consumer Rights & Protection. It is not formal legal advice, representation, or a guarantee of outcome.",
    privacyFooterNote: "Use synthetic scenarios · Never share OTPs, passwords, or Aadhaar/card details.",
    statusLabels: {
      verified: "Verified from Official Sources",
      partially_verified: "Partially Verified",
      cannot_verify: "Why Satya Won't Answer",
      needs_clarification: "Clarification Needed",
      out_of_scope: "Outside Scope",
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
    openExactPassage: "Inspect passage",
    sourceViewerHeading: "Exact Official Source Passage",
    exactLocatorLabel: "Exact Locator",
    sourceCurrencyLabel: "Source Currency & Approval",
    approvedOfficialBadge: "Approved Official Source",
    verbatimTextLabel: "Verbatim Extracted Statutory Text",
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
    navAskSatya: "Consultation",
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
        label: "My online order was never delivered.",
        description: "Check e-commerce duties, grievance timelines, and escalation paths.",
        prompt: "My online order was never delivered even after payment. What are my consumer rights and grievance steps?",
      },
      {
        label: "I received a defective product.",
        description: "Explore repair, replacement, and refund provisions under CPA 2019.",
        prompt: "I received a defective product. What remedies are available under Indian consumer law?",
      },
      {
        label: "A company is refusing my refund.",
        description: "Review marketplace obligations and unfair trade practice rules.",
        prompt: "A company is refusing my refund for a faulty item. What does consumer protection law say?",
      },
      {
        label: "I am facing an issue with an e-commerce platform.",
        description: "See Grievance Officer 48-hour acknowledgement & 1-month redressal duties.",
        prompt: "I am facing an issue with an e-commerce platform that is not resolving my complaint. What are their legal duties?",
      },
      {
        label: "I want to report misleading advertisements.",
        description: "Inspect CCPA Misleading Ads Guidelines, 2022 & endorsement rules.",
        prompt: "I want to report misleading advertisements. What rules and remedies apply under CCPA guidelines?",
      },
      {
        label: "Which Consumer Commission handles a ₹35 lakh claim?",
        description: "Check District, State, and National pecuniary jurisdiction tiers.",
        prompt: "Which Consumer Commission should I approach for a claim involving ₹35 lakh?",
      },
    ],
    followupSuggestions: [
      { label: "Time limit to file?", prompt: "How long do I have to file a consumer complaint?" },
      { label: "What if they don't reply?", prompt: "What if the seller or platform does not respond?" },
      { label: "Is mediation available?", prompt: "Can this dispute be resolved through mediation?" },
    ],
  },

  kn: {
    brandName: "ಸತ್ಯ (Satya)",
    brandSubtitle: "ಗ್ರಾಹಕ ಹಕ್ಕುಗಳ AI",
    tagline: "ನಿಮ್ಮ ಗ್ರಾಹಕ ಹಕ್ಕುಗಳನ್ನು ತಿಳಿಯಿರಿ. ಕಾನೂನನ್ನು ನೋಡಿ. ಮುಂದಿನ ಹೆಜ್ಜೆ ಇಡಿ.",
    domainBadge: "ಭಾರತೀಯ ಗ್ರಾಹಕ ಹಕ್ಕುಗಳು ಮತ್ತು ರಕ್ಷಣೆ",
    satyaReadyLabel: "ಸತ್ಯ ಸಿದ್ಧವಾಗಿದೆ",
    officialSourcesBtn: "ಅಧಿಕೃತ ಮೂಲಗಳು",
    newChatBtn: "ಹೊಸ ಚಾಟ್",
    clearChatBtn: "ಚಾಟ್ ತೆರವುಗೊಳಿಸಿ",
    historyTitle: "ಸಂಭಾಷಣೆಗಳು",
    historyEmpty: "ಇನ್ನೂ ಯಾವುದೇ ಉಳಿಸಿದ ಸಂಭಾಷಣೆಗಳಿಲ್ಲ. ನಿಮ್ಮ ಪ್ರಶ್ನೆಗಳು ಮತ್ತು ಉತ್ತರಗಳು ಇಲ್ಲಿ ಕಾಣಿಸುತ್ತವೆ.",
    clearHistoryBtn: "ಎಲ್ಲಾ ಅಳಿಸಿ",
    groupToday: "ಇಂದು",
    groupYesterday: "ನಿನ್ನೆ",
    groupPrevious: "ಹಿಂದಿನ ಸಂಭಾಷಣೆಗಳು",
    renameAction: "ಹೆಸರು ಬದಲಿಸಿ",
    deleteAction: "ಅಳಿಸಿ",
    saveAction: "ಉಳಿಸಿ",
    cancelAction: "ರದ್ದುಮಾಡಿ",
    collapseSidebar: "ಸೈಡ್‌ಬಾರ್ ಕುಗ್ಗಿಸಿ",
    expandSidebar: "ಸೈಡ್‌ಬಾರ್ ವಿಸ್ತರಿಸಿ",
    turnsLabel: "ಸಂದೇಶಗಳು",
    askTitle: "ನಿಮ್ಮ ಗ್ರಾಹಕ ಸಮಸ್ಯೆಯನ್ನು ವಿವರಿಸಿ",
    followupHint: "ನಿರಂತರ ಚಾಟ್ ಸಕ್ರಿಯವಾಗಿದೆ — ಹಿಂದಿನ ಸಂದರ್ಭದೊಂದಿಗೆ ಮುಂದುವರಿದ ಪ್ರಶ್ನೆಗಳನ್ನು ಕೇಳಿ",
    factsBtn: "ವಹಿವಾಟು ವಿವರಗಳು",
    factsActiveBtn: "ವಿವರಗಳು ಸಕ್ರಿಯ",
    factsPrivacyNote: "ಸೂಕ್ಷ್ಮವಲ್ಲದ ವಿವರಗಳು (OTP, ಆಧಾರ್, ಅಥವಾ ಕಾರ್ಡ್ ಸಂಖ್ಯೆಗಳನ್ನು ಎಂದಿಗೂ ಹಂಚಿಕೊಳ್ಳಬೇಡಿ)",
    clearFactsBtn: "ವಿವರ ಅಳಿಸಿ",
    statePlaceholder: "ರಾಜ್ಯ (ಉದಾ. ಕರ್ನಾಟಕ)",
    channelAny: "ಖರೀದಿ ಮಾಧ್ಯಮ",
    channelEcommerce: "ಇ-ಕಾಮರ್ಸ್ / ಆನ್‌ಲೈನ್",
    channelRetail: "ಅಂಗಡಿ ಖರೀದಿ",
    channelService: "ಸೇವಾ ಪೂರೈಕೆದಾರ",
    amountPlaceholder: "ಪಾವತಿಸಿದ ಮೊತ್ತ (₹)",
    placeholderMain: "ನಿಮ್ಮ ಗ್ರಾಹಕ ಸಮಸ್ಯೆಯನ್ನು ವಿವರಿಸಿ...",
    placeholderFollowup:
      "ಮುಂದುವರಿದ ಪ್ರಶ್ನೆ ಕೇಳಿ (ಉದಾ., '48 ಗಂಟೆಗಳಲ್ಲಿ ಪ್ರತಿಕ್ರಿಯಿಸದಿದ್ದರೆ ಏನು ಮಾಡಬೇಕು?')...",
    askButton: "ಕಳುಹಿಸಿ",
    verifyingButton: "ಪರಿಶೀಲಿಸಲಾಗುತ್ತಿದೆ...",
    retrievingNotice: "ಭಾರತೀಯ ಗ್ರಾಹಕ ರಕ್ಷಣಾ ಕಾನೂನುಗಳನ್ನು ಪರಿಶೀಲಿಸಲಾಗುತ್ತಿದೆ...",
    copyResponseBtn: "ಉತ್ತರ ನಕಲಿಸಿ",
    copiedResponseBtn: "ನಕಲಿಸಲಾಗಿದೆ",
    aiExplanationLabel: "AI ಆಧಾರಿತ ವಿವರಣೆ",
    officialEvidenceLabel: "ಅಧಿಕೃತ ಕಾನೂನು ಸಾಕ್ಷ್ಯಗಳು",
    examplesLabel: "ಸಾಮಾನ್ಯ ಗ್ರಾಹಕ ಸಮಸ್ಯೆಗಳು — ಪ್ರಾರಂಭಿಸಲು ಒಂದನ್ನು ಆಯ್ಕೆಮಾಡಿ",
    welcomeBadge: "ಭಾರತೀಯ ಗ್ರಾಹಕ ರಕ್ಷಣಾ ಕಾನೂನು AI",
    emptyHeroTitle: "ನಿಮ್ಮ ಗ್ರಾಹಕ ಹಕ್ಕುಗಳನ್ನು ತಿಳಿಯಿರಿ.",
    emptyHeroDesc: "ಕಾನೂನನ್ನು ಅರ್ಥಮಾಡಿಕೊಳ್ಳಿ. ಸರಿಯಾದ ಹಂತಗಳನ್ನು ಕಂಡುಕೊಳ್ಳಿ. ತಿಳುವಳಿಕೆಯುಳ್ಳ ನಿರ್ಧಾರಗಳನ್ನು ತೆಗೆದುಕೊಳ್ಳಿ.",
    welcomeGroundingNote:
      "ಸತ್ಯವು ಭಾರತ ಸರ್ಕಾರದ ಅಧಿಕೃತ ಗ್ರಾಹಕ ರಕ್ಷಣಾ ಕಾಯ್ದೆಗಳು, ನಿಯಮಗಳು, CCPA ಮಾರ್ಗಸೂಚಿಗಳು ಮತ್ತು ಸರ್ಕಾರಿ ಪೋರ್ಟಲ್‌ಗಳ ಆಧಾರದ ಮೇಲೆ ಮಾಹಿತಿಯನ್ನು ನೀಡುತ್ತದೆ. ಸಾಕ್ಷ್ಯವಿಲ್ಲದಿದ್ದಾಗ ಅಥವಾ ವ್ಯಾಪ್ತಿಯ ಹೊರಗಿದ್ದಾಗ ಅದು ಊಹಿಸದೆ ಸ್ಪಷ್ಟವಾಗಿ ತಿಳಿಸುತ್ತದೆ.",
    verifiedCitationsLabel: "ದೃಢೀಕೃತ ಶಾಸನಬದ್ಧ ಉಲ್ಲೇಖಗಳು",
    officialPortalsLabel: "ಅಧಿಕೃತ ಪೋರ್ಟಲ್‌ಗಳು ಮತ್ತು ದಾಖಲೆಗಳು:",
    inspectingNote: "ಸಾಕ್ಷ್ಯ ಲೆಡ್ಜರ್ ಮತ್ತು ಕ್ರಿಯಾ ಯೋಜನೆಯನ್ನು ನೋಡಲಾಗುತ್ತಿದೆ →",
    clickToInspectNote: "ಪೂರ್ಣ ಸಾಕ್ಷ್ಯ ಲೆಡ್ಜರ್ ಮತ್ತು ಕ್ರಿಯಾ ಯೋಜನೆ ನೋಡಲು ಆಯ್ಕೆಮಾಡಿ",
    tabLedger: "ಸಾಕ್ಷ್ಯ ಲೆಡ್ಜರ್",
    tabPlanner: "ಕ್ರಿಯಾ ಯೋಜನೆ",
    mobileChatTab: "ಸಮಾಲೋಚನೆ",
    mobileEvidenceTab: "ಸಾಕ್ಷ್ಯ ಮತ್ತು ಯೋಜನೆ",
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
      cannot_verify: "ಸತ್ಯ ಏಕೆ ಉತ್ತರಿಸುವುದಿಲ್ಲ",
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
    openExactPassage: "ಪಠ್ಯ ನೋಡಿ",
    sourceViewerHeading: "ನಿಖರವಾದ ಅಧಿಕೃತ ಮೂಲ ಪಠ್ಯ",
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
    navAskSatya: "ಸಮಾಲೋಚನೆ",
    navLawsPolicies: "ಕಾಯ್ದೆಗಳು ಮತ್ತು ನೀತಿ",
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
        label: "ನನ್ನ ಆನ್‌ಲೈನ್ ಆರ್ಡರ್ ತಲುಪಿಲ್ಲ.",
        description: "ಇ-ಕಾಮರ್ಸ್ ಕರ್ತವ್ಯಗಳು ಮತ್ತು ದೂರು ಪರಿಹಾರ ಹಂತಗಳನ್ನು ಪರಿಶೀಲಿಸಿ.",
        prompt: "ನಾನು ಪಾವತಿ ಮಾಡಿದರೂ ನನ್ನ ಆನ್‌ಲೈನ್ ಆರ್ಡರ್ ಇನ್ನೂ ತಲುಪಿಲ್ಲ. ನನ್ನ ಗ್ರಾಹಕ ಹಕ್ಕುಗಳು ಮತ್ತು ದೂರು ಹಂತಗಳು ಏನು?",
      },
      {
        label: "ನನಗೆ ದೋಷಪೂರಿತ ಉತ್ಪನ್ನ ಸಿಕ್ಕಿದೆ.",
        description: "CPA 2019 ಅಡಿಯಲ್ಲಿ ದುರಸ್ತಿ, ಬದಲಾವಣೆ ಮತ್ತು ಮರುಪಾವತಿ ನಿಯಮಗಳನ್ನು ನೋಡಿ.",
        prompt: "ನನಗೆ ದೋಷಪೂರಿತ ಉತ್ಪನ್ನ ಸಿಕ್ಕಿದೆ. ಭಾರತೀಯ ಗ್ರಾಹಕ ಕಾನೂನಿನಡಿ ಯಾವ ಪರಿಹಾರಗಳು ಲಭ್ಯವಿವೆ?",
      },
      {
        label: "ಕಂಪನಿಯು ನನ್ನ ಹಣ ಮರುಪಾವತಿ ಮಾಡಲು ನಿರಾಕರಿಸುತ್ತಿದೆ.",
        description: "ಅನ್ಯಾಯದ ವ್ಯಾಪಾರ ಪದ್ಧತಿ ಮತ್ತು ಮರುಪಾವತಿ ನಿಯಮಗಳನ್ನು ಪರಿಶೀಲಿಸಿ.",
        prompt: "ದೋಷಪೂರಿತ ವಸ್ತುವಿಗೆ ಕಂಪನಿಯು ನನ್ನ ಹಣವನ್ನು ಮರುಪಾವತಿ ಮಾಡಲು ನಿರಾಕರಿಸುತ್ತಿದೆ. ಗ್ರಾಹಕ ರಕ್ಷಣಾ ಕಾನೂನು ಏನು ಹೇಳುತ್ತದೆ?",
      },
      {
        label: "ಇ-ಕಾಮರ್ಸ್ ವೇದಿಕೆಯಲ್ಲಿ ನನಗೆ ಸಮಸ್ಯೆಯಾಗಿದೆ.",
        description: "ಕುಂದುಕೊರತೆ ಅಧಿಕಾರಿಯ 48 ಗಂಟೆ ಮತ್ತು 1 ತಿಂಗಳ ಕಾಲಮಿತಿ ನೋಡಿ.",
        prompt: "ಇ-ಕಾಮರ್ಸ್ ವೇದಿಕೆ ನನ್ನ ದೂರಿಗೆ ಪ್ರತಿಕ್ರಿಯಿಸಿಲ್ಲ. ಕುಂದುಕೊರತೆ ಪರಿಹಾರದ ನಿಯಮ ಏನು ಹೇಳುತ್ತದೆ?",
      },
      {
        label: "ತಪ್ಪುದಾರಿಗೆಳೆಯುವ ಜಾಹೀರಾತುಗಳ ಬಗ್ಗೆ ದೂರು ನೀಡಬೇಕು.",
        description: "CCPA ಜಾಹೀರಾತು ಮಾರ್ಗಸೂಚಿಗಳು, 2022 ಅನ್ನು ಪರಿಶೀಲಿಸಿ.",
        prompt: "ತಪ್ಪುದಾರಿಗೆಳೆಯುವ ಜಾಹೀರಾತುಗಳ ಬಗ್ಗೆ ದೂರು ನೀಡಲು CCPA ಮಾರ್ಗಸೂಚಿಗಳು ಮತ್ತು ನಿಯಮಗಳು ಏನು ಹೇಳುತ್ತವೆ?",
      },
      {
        label: "₹35 ಲಕ್ಷ ದಾವೆ — ಯಾವ ಗ್ರಾಹಕ ಆಯೋಗ?",
        description: "ಜಿಲ್ಲಾ, ರಾಜ್ಯ ಮತ್ತು ರಾಷ್ಟ್ರೀಯ ಆಯೋಗದ ನ್ಯಾಯವ್ಯಾಪ್ತಿ ನೋಡಿ.",
        prompt: "₹35 ಲಕ್ಷ ಮೊತ್ತದ ದೂರಿಗೆ ನಾನು ಯಾವ ಗ್ರಾಹಕ ಆಯೋಗವನ್ನು ಸಂಪರ್ಕಿಸಬೇಕು?",
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
    brandSubtitle: "उपभोक्ता अधिकार AI",
    tagline: "अपने उपभोक्ता अधिकार जानें। कानून देखें। अगला कदम उठाएं।",
    domainBadge: "भारतीय उपभोक्ता अधिकार एवं संरक्षण",
    satyaReadyLabel: "सत्य तैयार है",
    officialSourcesBtn: "आधिकारिक स्रोत",
    newChatBtn: "नई चैट",
    clearChatBtn: "चैट साफ़ करें",
    historyTitle: "बातचीत इतिहास",
    historyEmpty: "अभी तक कोई सहेजी गई बातचीत नहीं है। आपके प्रश्न और प्रमाणित उत्तर यहाँ दिखेंगे।",
    clearHistoryBtn: "सभी हटाएं",
    groupToday: "आज",
    groupYesterday: "कल",
    groupPrevious: "पिछली बातचीत",
    renameAction: "नाम बदलें",
    deleteAction: "हटाएं",
    saveAction: "सहेजें",
    cancelAction: "रद्द करें",
    collapseSidebar: "साइडबार समेटें",
    expandSidebar: "साइडबार खोलें",
    turnsLabel: "संदेश",
    askTitle: "अपनी उपभोक्ता समस्या बताएं",
    followupHint: "निरंतर चैट सक्रिय है — पिछले संदर्भ के साथ आगे के प्रश्न पूछें",
    factsBtn: "लेन-देन विवरण",
    factsActiveBtn: "विवरण सक्रिय",
    factsPrivacyNote: "वैकल्पिक गैर-संवेदनशील तथ्य (OTP, आधार या कार्ड नंबर कभी न डालें)",
    clearFactsBtn: "विवरण हटाएं",
    statePlaceholder: "राज्य (जैसे कर्नाटक)",
    channelAny: "माध्यम (कोई भी)",
    channelEcommerce: "ई-कॉमर्स / ऑनलाइन",
    channelRetail: "दुकान से खरीद",
    channelService: "सेवा प्रदाता",
    amountPlaceholder: "भुगतान राशि (₹)",
    placeholderMain: "अपनी उपभोक्ता समस्या बताएं...",
    placeholderFollowup:
      "आगे का प्रश्न पूछें (जैसे '48 घंटे में जवाब न मिले तो क्या करें?')...",
    askButton: "भेजें",
    verifyingButton: "सत्यापित हो रहा है...",
    retrievingNotice: "भारतीय उपभोक्ता संरक्षण कानूनों की जांच और सत्यापन हो रहा है...",
    copyResponseBtn: "उत्तर कॉपी करें",
    copiedResponseBtn: "कॉपी हो गया",
    aiExplanationLabel: "AI आधारित व्याख्या",
    officialEvidenceLabel: "सहायक आधिकारिक कानूनी साक्ष्य",
    examplesLabel: "सामान्य उपभोक्ता समस्याएं — शुरू करने के लिए चुनें",
    welcomeBadge: "आधिकारिक भारतीय उपभोक्ता संरक्षण AI",
    emptyHeroTitle: "अपने उपभोक्ता अधिकार जानें।",
    emptyHeroDesc: "कानून को समझें। सही कदम जानें। सोच-समझकर निर्णय लें।",
    welcomeGroundingNote:
      "सत्य केवल भारत सरकार के आधिकारिक उपभोक्ता संरक्षण कानूनों, नियमों, CCPA दिशानिर्देशों और सरकारी पोर्टलों पर आधारित जानकारी देता है। पर्याप्त प्रमाण न होने या दायरे से बाहर होने पर यह अनुमान लगाने के बजाय स्पष्ट रूप से मना करता है।",
    verifiedCitationsLabel: "प्रमाणित वैधानिक उद्धरण",
    officialPortalsLabel: "आधिकारिक पोर्टल और दस्तावेज़:",
    inspectingNote: "साक्ष्य बही और कार्य योजना देख रहे हैं →",
    clickToInspectNote: "पूरी साक्ष्य बही और कार्य योजना देखने के लिए चुनें",
    tabLedger: "साक्ष्य बही",
    tabPlanner: "कार्य योजना",
    mobileChatTab: "परामर्श",
    mobileEvidenceTab: "साक्ष्य और योजना",
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
      cannot_verify: "सत्य उत्तर क्यों नहीं दे सकता",
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
    openExactPassage: "अंश देखें",
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
    navAskSatya: "परामर्श",
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
        label: "मेरा ऑनलाइन ऑर्डर डिलीवर नहीं हुआ।",
        description: "ई-कॉमर्स नियमों, शिकायत समय-सीमा और निवारण प्रक्रिया देखें।",
        prompt: "भुगतान के बाद भी मेरा ऑनलाइन ऑर्डर डिलीवर नहीं हुआ। मेरे उपभोक्ता अधिकार और शिकायत के कदम क्या हैं?",
      },
      {
        label: "मुझे दोषपूर्ण उत्पाद मिला है।",
        description: "उपभोक्ता संरक्षण अधिनियम 2019 के तहत मरम्मत, बदलाव और रिफंड नियम देखें।",
        prompt: "मुझे दोषपूर्ण उत्पाद मिला है। भारतीय उपभोक्ता कानून के तहत क्या उपचार उपलब्ध हैं?",
      },
      {
        label: "कंपनी मेरा रिफंड देने से मना कर रही है।",
        description: "ई-कॉमर्स दायित्व और अनुचित व्यापार प्रथा के नियम देखें।",
        prompt: "दोषपूर्ण उत्पाद के लिए कंपनी मेरा रिफंड देने से मना कर रही है। उपभोक्ता संरक्षण कानून क्या कहता है?",
      },
      {
        label: "मुझे ई-कॉमर्स प्लेटफॉर्म से समस्या आ रही है।",
        description: "शिकायत अधिकारी की 48 घंटे और 1 महीने की समय-सीमा देखें।",
        prompt: "एक ई-कॉमर्स प्लेटफॉर्म मेरी शिकायत का समाधान नहीं कर रहा है। शिकायत निवारण के क्या नियम हैं?",
      },
      {
        label: "मैं भ्रामक विज्ञापनों की रिपोर्ट करना चाहता हूँ।",
        description: "CCPA भ्रामक विज्ञापन दिशानिर्देश, 2022 देखें।",
        prompt: "मैं भ्रामक विज्ञापनों की शिकायत करना चाहता हूँ। CCPA दिशानिर्देशों के तहत क्या नियम और उपाय लागू होते हैं?",
      },
      {
        label: "₹35 लाख के दावे के लिए कौन सा उपभोक्ता आयोग?",
        description: "जिला, राज्य और राष्ट्रीय आयोग के आर्थिक क्षेत्राधिकार देखें।",
        prompt: "₹35 लाख से जुड़े दावे के लिए मुझे किस उपभोक्ता आयोग में जाना चाहिए?",
      },
    ],
    followupSuggestions: [
      { label: "शिकायत की समय सीमा क्या है?", prompt: "उपभोक्ता शिकायत दर्ज करने की समय सीमा कितनी है?" },
      { label: "वे जवाब न दें तो क्या करें?", prompt: "यदि विक्रेता या प्लेटफॉर्म जवाब न दे तो क्या करें?" },
      { label: "क्या मध्यस्थता उपलब्ध है?", prompt: "क्या इस विवाद को मध्यस्थता (mediation) से सुलझाया जा सकता है?" },
    ],
  },
};
