import {
  ChatResponse,
  ChatTurn,
  CoverageResponse,
  PolicySearchResponse,
  SessionContext,
  SourceManifestRecord,
  SupportedLanguage,
  TranslateThreadItem,
  TranslateThreadResponse,
} from "./types";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

export async function sendChatMessage(
  message: string,
  sessionContext?: SessionContext,
  history: ChatTurn[] = [],
  language: SupportedLanguage = "en"
): Promise<ChatResponse> {
  const res = await fetch(`${API_BASE}/api/chat`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      message,
      language,
      session_context: sessionContext,
      history,
    }),
  });
  if (!res.ok) {
    const errText = await res.text();
    throw new Error(`Satya backend error (${res.status}): ${errText}`);
  }
  return res.json();
}

export async function translateThread(
  items: TranslateThreadItem[],
  targetLanguage: SupportedLanguage
): Promise<TranslateThreadResponse> {
  const res = await fetch(`${API_BASE}/api/translate-thread`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      items,
      target_language: targetLanguage,
    }),
  });
  if (!res.ok) {
    throw new Error(`Thread translation failed (${res.status})`);
  }
  return res.json();
}

export async function searchPolicies(
  query: string,
  language: SupportedLanguage = "en"
): Promise<PolicySearchResponse> {
  const params = new URLSearchParams({ q: query, language });
  const res = await fetch(`${API_BASE}/api/policies/search?${params.toString()}`);
  if (!res.ok) {
    throw new Error(`Policy search failed (${res.status})`);
  }
  return res.json();
}

export async function fetchCoverage(): Promise<CoverageResponse> {
  const res = await fetch(`${API_BASE}/api/coverage`);
  if (!res.ok) throw new Error("Failed to load coverage");
  return res.json();
}

export async function fetchSources(): Promise<SourceManifestRecord[]> {
  const res = await fetch(`${API_BASE}/api/sources`);
  if (!res.ok) throw new Error("Failed to load sources");
  return res.json();
}

export async function submitFeedback(payload: {
  request_id?: string;
  chunk_id?: string;
  feedback_type:
    | "unsupported_answer"
    | "wrong_citation"
    | "outdated_source"
    | "unclear_answer"
    | "helpful";
  comment?: string;
}): Promise<void> {
  await fetch(`${API_BASE}/api/feedback`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
}
