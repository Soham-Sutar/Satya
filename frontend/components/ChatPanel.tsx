"use client";

import React, { useState } from "react";
import {
  Send,
  ShieldCheck,
  AlertTriangle,
  HelpCircle,
  Ban,
  ShieldAlert,
  ExternalLink,
  SlidersHorizontal,
  Trash2,
  Loader2,
  Scale,
} from "lucide-react";
import {
  AnswerStatus,
  ChatResponse,
  ChatTurn,
  CitationMetadata,
  SessionContext,
} from "@/lib/types";
import { CitationChip } from "./CitationChip";
import { AbstentionCard } from "./AbstentionCard";

export interface ConversationEntry {
  id: string;
  question: string;
  response: ChatResponse;
}

interface ChatPanelProps {
  entries: ConversationEntry[];
  selectedEntryId: string | null;
  onSelectEntry: (id: string) => void;
  onSend: (message: string, ctx: SessionContext, history: ChatTurn[]) => Promise<void>;
  loading: boolean;
  error: string | null;
  onOpenPassage: (cid: string, details: Record<string, CitationMetadata>) => void;
}

const SAMPLE_QUESTIONS = [
  {
    label: "Damaged phone bought online",
    prompt: "I bought a phone online and it arrived with a damaged screen. What can I do?",
  },
  {
    label: "E-commerce not responding",
    prompt: "An e-commerce platform has not responded to my complaint. What does the rule say about grievance handling?",
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
    label: "Does defect guarantee a refund?",
    prompt: "Does every defective product automatically entitle me to a guaranteed refund and compensation?",
  },
  {
    label: "Test abstention (unsupported)",
    prompt: "Tell me what Section 999 of the Consumer Protection Act says about instant payouts.",
  },
  {
    label: "Test scope gate (out of scope)",
    prompt: "How do I apply for an Indian passport renewal?",
  },
];

const STATUS_BADGE: Record<
  AnswerStatus,
  { label: string; cls: string; icon: React.ReactNode }
> = {
  verified: {
    label: "Verified from Official Sources",
    cls: "bg-accent-soft text-accent border border-accent/25",
    icon: <ShieldCheck className="h-3.5 w-3.5" />,
  },
  partially_verified: {
    label: "Partially Verified",
    cls: "bg-amber-100 text-amber-700 border border-amber-700/25",
    icon: <AlertTriangle className="h-3.5 w-3.5" />,
  },
  cannot_verify: {
    label: "Cannot Verify",
    cls: "bg-crimson-100 text-crimson-700 border border-crimson-700/25",
    icon: <ShieldAlert className="h-3.5 w-3.5" />,
  },
  needs_clarification: {
    label: "Needs Clarification",
    cls: "bg-navy-soft text-navy border border-navy/25",
    icon: <HelpCircle className="h-3.5 w-3.5" />,
  },
  out_of_scope: {
    label: "Out of Scope",
    cls: "bg-surface-muted text-ink-muted border border-border-subtle",
    icon: <Ban className="h-3.5 w-3.5" />,
  },
};

function renderAnswerParagraphs(
  markdown: string,
  citationDetails: Record<string, CitationMetadata>,
  onOpenPassage: (cid: string, details: Record<string, CitationMetadata>) => void
) {
  const lines = markdown.split("\n").filter((l) => l.trim() !== "");
  return lines.map((line, i) => {
    const isBullet = line.trim().startsWith("- ");
    const cleanLine = isBullet ? line.trim().slice(2) : line;

    // Split on inline `chunk_id` or [chunk_id] tokens that exist in citationDetails, and bold **...**
    const tokens = cleanLine.split(/(`[^`]+`|\[[a-zA-Z0-9_]+\]|\*\*[^*]+\*\*)/g);
    const rendered = tokens.map((tok, idx) => {
      if (tok.startsWith("**") && tok.endsWith("**")) {
        return (
          <strong key={idx} className="font-semibold text-ink">
            {tok.slice(2, -2)}
          </strong>
        );
      }
      const rawId =
        (tok.startsWith("`") && tok.endsWith("`")) ||
        (tok.startsWith("[") && tok.endsWith("]"))
          ? tok.slice(1, -1)
          : null;
      if (rawId && citationDetails[rawId]) {
        return (
          <span key={idx} className="mx-0.5 inline-block align-baseline">
            <CitationChip
              chunkId={rawId}
              meta={citationDetails[rawId]}
              onOpen={(cid) => onOpenPassage(cid, citationDetails)}
            />
          </span>
        );
      }
      return <React.Fragment key={idx}>{tok}</React.Fragment>;
    });

    if (isBullet) {
      return (
        <li key={i} className="ml-4 list-disc text-sm leading-relaxed text-ink">
          {rendered}
        </li>
      );
    }
    return (
      <p key={i} className="text-sm leading-relaxed text-ink">
        {rendered}
      </p>
    );
  });
}

export function ChatPanel({
  entries,
  selectedEntryId,
  onSelectEntry,
  onSend,
  loading,
  error,
  onOpenPassage,
}: ChatPanelProps) {
  const [input, setInput] = useState("");
  const [showFacts, setShowFacts] = useState(false);
  const [sessionContext, setSessionContext] = useState<SessionContext>({});

  const buildHistory = (): ChatTurn[] => {
    const turns: ChatTurn[] = [];
    for (const e of entries.slice(-4)) {
      turns.push({ role: "user", content: e.question });
      turns.push({ role: "assistant", content: e.response.answer_markdown });
    }
    return turns;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const q = input.trim();
    if (!q || loading) return;
    setInput("");
    await onSend(q, sessionContext, buildHistory());
  };

  const handleQuickPrompt = async (prompt: string) => {
    if (loading) return;
    await onSend(prompt, sessionContext, buildHistory());
  };

  const hasFacts = Object.values(sessionContext).some(
    (v) => v !== undefined && v !== ""
  );

  return (
    <div className="flex flex-col gap-4">
      {/* Query Composer Card */}
      <div className="rounded-xl border border-border-subtle bg-surface p-5 shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
          <div className="flex items-center gap-2">
            <Scale className="h-4 w-4 text-accent" />
            <h2 className="font-serif text-base font-semibold text-ink">
              Ask about Indian Consumer Rights & Protection
            </h2>
          </div>
          <button
            type="button"
            onClick={() => setShowFacts((v) => !v)}
            className={`inline-flex items-center gap-1.5 rounded-md border px-2.5 py-1 text-xs font-medium transition-colors ${
              hasFacts
                ? "border-accent/40 bg-accent-soft text-accent"
                : "border-border-subtle bg-canvas text-ink-muted hover:text-ink"
            }`}
          >
            <SlidersHorizontal className="h-3.5 w-3.5" />
            <span>{hasFacts ? "Transaction facts active" : "Optional transaction facts"}</span>
          </button>
        </div>

        {showFacts && (
          <div className="mb-3 rounded-lg border border-border-subtle bg-canvas p-3.5 space-y-2.5">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-semibold uppercase tracking-wide text-ink-muted">
                Non-sensitive Session Facts (never share OTPs, Aadhaar, or card numbers)
              </span>
              {hasFacts && (
                <button
                  type="button"
                  onClick={() => setSessionContext({})}
                  className="inline-flex items-center gap-1 text-[11px] text-crimson-700 hover:underline"
                >
                  <Trash2 className="h-3 w-3" /> Clear facts
                </button>
              )}
            </div>
            <div className="grid grid-cols-1 gap-2 sm:grid-cols-4">
              <input
                type="text"
                placeholder="State (e.g. Karnataka)"
                value={sessionContext.state || ""}
                onChange={(e) =>
                  setSessionContext((s) => ({ ...s, state: e.target.value || undefined }))
                }
                className="rounded-md border border-border-subtle bg-surface px-2.5 py-1.5 text-xs text-ink"
              />
              <select
                value={sessionContext.purchase_channel || ""}
                onChange={(e) =>
                  setSessionContext((s) => ({
                    ...s,
                    purchase_channel: e.target.value || undefined,
                  }))
                }
                className="rounded-md border border-border-subtle bg-surface px-2.5 py-1.5 text-xs text-ink"
                aria-label="Purchase channel"
              >
                <option value="">Channel (any)</option>
                <option value="ecommerce">E-commerce / Online</option>
                <option value="retail">In-store Retail</option>
                <option value="service_provider">Service Provider</option>
              </select>
              <input
                type="number"
                placeholder="Amount paid (₹)"
                value={sessionContext.purchase_amount ?? ""}
                onChange={(e) =>
                  setSessionContext((s) => ({
                    ...s,
                    purchase_amount: e.target.value ? Number(e.target.value) : undefined,
                  }))
                }
                className="rounded-md border border-border-subtle bg-surface px-2.5 py-1.5 text-xs text-ink"
              />
              <input
                type="date"
                value={sessionContext.purchase_date || ""}
                onChange={(e) =>
                  setSessionContext((s) => ({
                    ...s,
                    purchase_date: e.target.value || undefined,
                  }))
                }
                aria-label="Approximate purchase or issue date"
                className="rounded-md border border-border-subtle bg-surface px-2.5 py-1.5 text-xs text-ink"
              />
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-3">
          <div className="relative">
            <textarea
              rows={3}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  handleSubmit(e);
                }
              }}
              placeholder="Describe your consumer issue or ask about the Consumer Protection Act, 2019, E-Commerce Rules, Jurisdiction, NCH (1915), or e-Jagriti..."
              className="w-full resize-none rounded-lg border border-border-subtle bg-canvas px-4 py-3 pr-28 text-sm text-ink placeholder:text-ink-muted/75 focus:border-accent focus:bg-surface focus:outline-none"
            />
            <button
              type="submit"
              disabled={loading || !input.trim()}
              className="absolute bottom-3 right-3 inline-flex items-center gap-1.5 rounded-lg bg-accent px-4 py-2 text-xs font-semibold text-white transition-colors hover:bg-accent-hover disabled:cursor-not-allowed disabled:opacity-50"
            >
              {loading ? (
                <>
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  <span>Verifying...</span>
                </>
              ) : (
                <>
                  <span>Ask Satya</span>
                  <Send className="h-3.5 w-3.5" />
                </>
              )}
            </button>
          </div>
        </form>

        {/* Sample Demo Questions */}
        <div className="mt-3 pt-3 border-t border-border-subtle">
          <div className="mb-2 text-[11px] font-semibold uppercase tracking-wide text-ink-muted">
            Example consumer scenarios & verification tests
          </div>
          <div className="flex flex-wrap gap-1.5">
            {SAMPLE_QUESTIONS.map((q) => (
              <button
                key={q.label}
                type="button"
                disabled={loading}
                onClick={() => handleQuickPrompt(q.prompt)}
                className="rounded-full border border-border-subtle bg-canvas px-3 py-1 text-xs text-ink transition-colors hover:border-accent/40 hover:bg-accent-soft hover:text-accent disabled:opacity-50"
              >
                {q.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {error && (
        <div className="rounded-lg border border-crimson-700/30 bg-crimson-100 px-4 py-3 text-xs text-crimson-700">
          {error}
        </div>
      )}

      {/* Conversation Feed */}
      {entries.length === 0 ? (
        <div className="rounded-xl border border-dashed border-border-subtle bg-surface/70 p-8 text-center space-y-2">
          <p className="font-serif text-lg font-medium text-ink">
            Every material legal claim backed by an inspectable Government of India source passage.
          </p>
          <p className="mx-auto max-w-xl text-xs leading-relaxed text-ink-muted">
            Select an example above or ask your own Indian consumer-protection question. Satya inspects approved statutes, Gazette rules, CCPA guidelines, and official portals—and explicitly tells you when evidence is missing.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {entries.map((entry) => {
            const r = entry.response;
            const badge = STATUS_BADGE[r.status];
            const isSelected = entry.id === selectedEntryId;
            const citedList = Object.values(r.citation_details || {});

            return (
              <article
                key={entry.id}
                onClick={() => onSelectEntry(entry.id)}
                className={`cursor-pointer rounded-xl border bg-surface p-5 shadow-sm transition-all ${
                  isSelected
                    ? "border-accent ring-1 ring-accent/30"
                    : "border-border-subtle hover:border-ink-muted/40"
                }`}
              >
                {/* User Question Header */}
                <div className="mb-3 flex flex-wrap items-center justify-between gap-2 border-b border-border-subtle pb-3">
                  <p className="font-medium text-sm text-ink">“{entry.question}”</p>
                  <div className="flex items-center gap-2">
                    <span className="rounded bg-surface-muted px-2 py-0.5 text-[11px] font-medium text-ink-muted">
                      {r.issue_category.replace(/_/g, " ")}
                    </span>
                    <span
                      className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[11px] font-semibold ${badge.cls}`}
                    >
                      {badge.icon}
                      <span>{badge.label}</span>
                    </span>
                  </div>
                </div>

                {/* Abstention / Clarification Card if triggered */}
                {r.abstention_reason && (
                  <div className="mb-4">
                    <AbstentionCard status={r.status} detail={r.abstention_reason} />
                  </div>
                )}

                {/* Grounded Answer Markdown */}
                <div className="satya-prose space-y-2">
                  {renderAnswerParagraphs(
                    r.answer_markdown,
                    r.citation_details || {},
                    onOpenPassage
                  )}
                </div>

                {/* Inline Quick Citation Strip */}
                {citedList.length > 0 && (
                  <div className="mt-4 flex flex-wrap items-center gap-1.5 border-t border-border-subtle pt-3">
                    <span className="text-[11px] font-semibold uppercase tracking-wide text-ink-muted mr-1">
                      Verified Citations:
                    </span>
                    {citedList.map((meta) => (
                      <CitationChip
                        key={meta.chunk_id}
                        chunkId={meta.chunk_id}
                        meta={meta}
                        onOpen={(cid) => onOpenPassage(cid, r.citation_details)}
                      />
                    ))}
                  </div>
                )}

                {/* Limitations & Official Links */}
                {(r.limitations.length > 0 || r.official_links.length > 0) && (
                  <div className="mt-3 rounded-lg bg-canvas p-3 text-xs space-y-2 border border-border-subtle">
                    {r.limitations.length > 0 && (
                      <ul className="space-y-1 text-ink-muted">
                        {r.limitations.map((lim, idx) => (
                          <li key={idx}>• {lim}</li>
                        ))}
                      </ul>
                    )}
                    {r.official_links.length > 0 && (
                      <div className="flex flex-wrap items-center gap-3 pt-1">
                        <span className="font-semibold text-ink">Official portals & texts:</span>
                        {r.official_links.map((lk) => (
                          <a
                            key={lk.url}
                            href={lk.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            onClick={(e) => e.stopPropagation()}
                            className="inline-flex items-center gap-1 text-accent hover:underline font-medium"
                          >
                            <span>{lk.title}</span>
                            <ExternalLink className="h-3 w-3" />
                          </a>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                <div className="mt-3 flex items-center justify-between text-[11px] text-ink-muted">
                  <span>
                    {isSelected
                      ? "Inspecting Evidence Ledger & Action Plan on right →"
                      : "Click to inspect Evidence Ledger & Action Plan"}
                  </span>
                  <span className="font-mono">
                    req:{r.request_id} · {r.latency_ms}ms
                  </span>
                </div>
              </article>
            );
          })}
        </div>
      )}
    </div>
  );
}
