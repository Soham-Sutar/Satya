export type SupportedLanguage = "en" | "kn" | "hi";

export type AnswerStatus =
  | "verified"
  | "partially_verified"
  | "cannot_verify"
  | "needs_clarification"
  | "out_of_scope";

export type ActionPlanKind =
  | "legal_requirement"
  | "conditional_requirement"
  | "practical_suggestion"
  | "professional_confirmation";

export type SourceStatus =
  | "pending_review"
  | "approved"
  | "superseded"
  | "withdrawn"
  | "unknown_currency";

export interface SessionContext {
  state?: string;
  purchase_date?: string;
  purchase_amount?: number;
  purchase_channel?: string;
  complaint_filed_to_seller?: boolean;
  personal_or_commercial?: string;
}

export interface ChatTurn {
  role: "user" | "assistant";
  content: string;
}

export interface CitationMetadata {
  chunk_id: string;
  source_id: string;
  source_title: string;
  issuing_authority: string;
  authority_type: string;
  section?: string | null;
  subsection?: string | null;
  rule?: string | null;
  paragraph?: string | null;
  heading?: string | null;
  page_start?: number | null;
  page_end?: number | null;
  publication_date?: string | null;
  effective_from?: string | null;
  retrieved_at?: string | null;
  version_label?: string | null;
  source_status: SourceStatus;
  official_url: string;
  exact_passage: string;
}

export interface ClaimItem {
  claim_id: string;
  text: string;
  evidence_status: "supported" | "partial" | "unsupported";
  citations: string[];
}

export interface ActionPlanItem {
  text: string;
  kind: ActionPlanKind;
  citations: string[];
}

export interface OfficialLink {
  title: string;
  url: string;
  authority: string;
}

export interface AbstentionDetail {
  category:
    | "missing_facts"
    | "missing_source"
    | "outdated_source"
    | "source_conflict"
    | "out_of_scope"
    | "unsupported_claim";
  summary: string;
  what_was_found: string;
  what_is_missing: string;
  suggested_next_step: string;
  official_verification_url?: string | null;
}

export interface EvidenceCoverage {
  supported_claims: number;
  total_claims: number;
  retrieved_chunks_count: number;
  approved_sources_used: number;
  description: string;
}

export interface ChatResponse {
  request_id: string;
  domain: "consumer_rights_india";
  language?: SupportedLanguage;
  status: AnswerStatus;
  issue_category: string;
  answer_markdown: string;
  claims: ClaimItem[];
  citation_details: Record<string, CitationMetadata>;
  action_plan: ActionPlanItem[];
  clarifying_questions: string[];
  limitations: string[];
  official_links: OfficialLink[];
  abstention_reason?: AbstentionDetail | null;
  evidence_coverage?: EvidenceCoverage | null;
  latency_ms: number;
}

export interface SourceManifestRecord {
  source_id: string;
  title: string;
  issuing_authority: string;
  authority_type: string;
  domain: "consumer_rights_india";
  topic_tags: string[];
  jurisdiction: string;
  document_type: string;
  official_url: string;
  local_file?: string | null;
  publication_date?: string | null;
  effective_from?: string | null;
  effective_to?: string | null;
  retrieved_at: string;
  version_label: string;
  status: SourceStatus;
  supersedes?: string | null;
  notes?: string | null;
}

export interface CoverageResponse {
  domain: string;
  tagline: string;
  supported_topics: string[];
  out_of_scope_examples: string[];
  known_limitations: string[];
  approved_source_count: number;
  total_chunk_count: number;
}
