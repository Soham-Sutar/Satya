import {
  ChatResponse,
  ChatTurn,
  CoverageResponse,
  SessionContext,
  SourceManifestRecord,
} from "./types";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

export async function sendChatMessage(
  message: string,
  sessionContext?: SessionContext,
  history: ChatTurn[] = []
): Promise<ChatResponse> {
  const res = await fetch(`${API_BASE}/api/chat`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      message,
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
