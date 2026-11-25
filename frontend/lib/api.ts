import {
  ChatResponse,
  ChatTurn,
  CoverageResponse,
  SessionContext,
  SourceManifestRecord,
  SupportedLanguage,
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

export async function translateResponse(
  response: ChatResponse,
  targetLanguage: SupportedLanguage
): Promise<ChatResponse> {
  const res = await fetch(`${API_BASE}/api/translate-response`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      response,
      target_language: targetLanguage,
    }),
  });
  if (!res.ok) {
    throw new Error(`Translation failed (${res.status})`);
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
