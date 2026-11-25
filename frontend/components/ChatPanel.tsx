"use client";

import React, { useEffect, useRef, useState } from "react";
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
  CornerDownRight,
} from "lucide-react";
import {
  AnswerStatus,
  ChatResponse,
  ChatTurn,
  CitationMetadata,
  SessionContext,
  SupportedLanguage,
} from "@/lib/types";
import { UI_COPY } from "@/lib/i18n";
import { CitationChip } from "./CitationChip";
import { AbstentionCard } from "./AbstentionCard";

export interface ConversationEntry {
  id: string;
  question: string;
  response: ChatResponse;
  translations?: Partial<Record<SupportedLanguage, ChatResponse>>;
}

interface ChatPanelProps {
  entries: ConversationEntry[];
  selectedEntryId: string | null;
  sessionContext: SessionContext;
  language: SupportedLanguage;
  onChangeSessionContext: (ctx: SessionContext) => void;
  onSelectEntry: (id: string) => void;
  onSend: (message: string, ctx: SessionContext, history: ChatTurn[]) => Promise<void>;
  loading: boolean;
  error: string | null;
  onOpenPassage: (cid: string, details: Record<string, CitationMetadata>) => void;
}

const STATUS_STYLE: Record<
  AnswerStatus,
  { cls: string; icon: React.ReactNode }
> = {
  verified: {
    cls: "bg-accent-soft text-accent border border-accent/25",
    icon: <ShieldCheck className="h-3.5 w-3.5" />,
  },
  partially_verified: {
    cls: "bg-amber-100 text-amber-700 border border-amber-700/25",
    icon: <AlertTriangle className="h-3.5 w-3.5" />,
  },
  cannot_verify: {
    cls: "bg-crimson-100 text-crimson-700 border border-crimson-700/25",
    icon: <ShieldAlert className="h-3.5 w-3.5" />,
  },
  needs_clarification: {
    cls: "bg-navy-soft text-navy border border-navy/25",
    icon: <HelpCircle className="h-3.5 w-3.5" />,
  },
  out_of_scope: {
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
  sessionContext,
  language,
  onChangeSessionContext,
  onSelectEntry,
  onSend,
  loading,
  error,
  onOpenPassage,
}: ChatPanelProps) {
  const t = UI_COPY[language];
  const [input, setInput] = useState("");
  const [showFacts, setShowFacts] = useState(false);
  const bottomRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (entries.length > 0) {
      bottomRef.current?.scrollIntoView({ behavior: "smooth", block: "nearest" });
    }
  }, [entries.length]);

  const buildHistory = (): ChatTurn[] => {
    const turns: ChatTurn[] = [];
    for (const e of entries.slice(-6)) {
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
      {/* Empty Welcome + Sample Scenarios when starting a fresh thread */}
      {entries.length === 0 ? (
        <div className="rounded-xl border border-dashed border-border-subtle bg-surface/85 p-6 space-y-4">
          <div className="space-y-1.5">
            <p className="font-serif text-lg font-medium text-ink">
              {t.emptyHeroTitle}
            </p>
            <p className="text-xs leading-relaxed text-ink-muted">
              {t.emptyHeroDesc}
            </p>
          </div>
          <div className="pt-2 border-t border-border-subtle">
            <div className="mb-2 text-[11px] font-semibold uppercase tracking-wide text-ink-muted">
              {t.examplesLabel}
            </div>
            <div className="flex flex-wrap gap-1.5">
              {t.samplePrompts.map((q) => (
                <button
                  key={q.label}
                  type="button"
                  disabled={loading}
                  onClick={() => handleQuickPrompt(q.prompt)}
                  className="rounded-full border border-border-subtle bg-canvas px-3 py-1.5 text-xs text-ink transition-colors hover:border-accent/40 hover:bg-accent-soft hover:text-accent disabled:opacity-50"
                >
                  {q.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      ) : (
        /* Continuous Chronological Conversation Thread */
        <div className="space-y-4">
          {entries.map((entry, idx) => {
            const r = entry.response;
            const style = STATUS_STYLE[r.status];
            const isSelected = entry.id === selectedEntryId;
            const citedList = Object.values(r.citation_details || {});

            return (
              <div key={entry.id} className="space-y-2.5">
                {/* User Turn Bubble */}
                <div className="flex justify-end">
                  <div className="max-w-[88%] rounded-xl rounded-tr-sm border border-accent/20 bg-accent text-white px-4 py-2.5 shadow-sm">
                    <div className="flex items-center gap-2 text-[10px] uppercase tracking-wider text-white/75 mb-0.5">
                      <span>#{idx + 1}</span>
                    </div>
                    <p className="text-sm leading-relaxed">{entry.question}</p>
                  </div>
                </div>

                {/* Satya Grounded Reply Card */}
                <article
                  onClick={() => onSelectEntry(entry.id)}
                  className={`cursor-pointer rounded-xl border bg-surface p-5 shadow-sm transition-all ${
                    isSelected
                      ? "border-accent ring-1 ring-accent/30"
                      : "border-border-subtle hover:border-ink-muted/40"
                  }`}
                >
                  <div className="mb-3 flex flex-wrap items-center justify-between gap-2 border-b border-border-subtle pb-2.5">
                    <div className="flex items-center gap-2">
                      <span
                        className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[11px] font-semibold ${style.cls}`}
                      >
                        {style.icon}
                        <span>{t.statusLabels[r.status]}</span>
                      </span>
                      <span className="rounded bg-surface-muted px-2 py-0.5 text-[11px] font-medium text-ink-muted">
                        {r.issue_category.replace(/_/g, " ")}
                      </span>
                    </div>
                    <span className="font-mono text-[11px] text-ink-muted">
                      {r.latency_ms}ms
                    </span>
                  </div>

                  {r.abstention_reason && (
                    <div className="mb-4">
                      <AbstentionCard
                        status={r.status}
                        detail={r.abstention_reason}
                        language={language}
                      />
                    </div>
                  )}

                  <div className="satya-prose space-y-2">
                    {renderAnswerParagraphs(
                      r.answer_markdown,
                      r.citation_details || {},
                      onOpenPassage
                    )}
                  </div>

                  {citedList.length > 0 && (
                    <div className="mt-4 flex flex-wrap items-center gap-1.5 border-t border-border-subtle pt-3">
                      <span className="text-[11px] font-semibold uppercase tracking-wide text-ink-muted mr-1">
                        {t.verifiedCitationsLabel}
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

                  {(r.limitations.length > 0 || r.official_links.length > 0) && (
                    <div className="mt-3 rounded-lg bg-canvas p-3 text-xs space-y-2 border border-border-subtle">
                      {r.limitations.length > 0 && (
                        <ul className="space-y-1 text-ink-muted">
                          {r.limitations.map((lim, i) => (
                            <li key={i}>• {lim}</li>
                          ))}
                        </ul>
                      )}
                      {r.official_links.length > 0 && (
                        <div className="flex flex-wrap items-center gap-3 pt-1">
                          <span className="font-semibold text-ink">
                            {t.officialPortalsLabel}
                          </span>
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
                    <span>{isSelected ? t.inspectingNote : t.clickToInspectNote}</span>
                    <span className="font-mono">req:{r.request_id}</span>
                  </div>
                </article>
              </div>
            );
          })}
          <div ref={bottomRef} />
        </div>
      )}

      {error && (
        <div className="rounded-lg border border-crimson-700/30 bg-crimson-100 px-4 py-3 text-xs text-crimson-700">
          {error}
        </div>
      )}

      {/* Continuous Composer Card (Bottom) */}
      <div className="rounded-xl border border-border-subtle bg-surface p-4 shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-2 mb-2.5">
          <div className="flex items-center gap-2">
            <Scale className="h-4 w-4 text-accent" />
            <span className="text-xs font-semibold text-ink">
              {entries.length > 0 ? t.followupHint : t.askTitle}
            </span>
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
            <span>{hasFacts ? t.factsActiveBtn : t.factsBtn}</span>
          </button>
        </div>

        {showFacts && (
          <div className="mb-3 rounded-lg border border-border-subtle bg-canvas p-3.5 space-y-2.5">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-semibold uppercase tracking-wide text-ink-muted">
                {t.factsPrivacyNote}
              </span>
              {hasFacts && (
                <button
                  type="button"
                  onClick={() => onChangeSessionContext({})}
                  className="inline-flex items-center gap-1 text-[11px] text-crimson-700 hover:underline"
                >
                  <Trash2 className="h-3 w-3" /> {t.clearFactsBtn}
                </button>
              )}
            </div>
            <div className="grid grid-cols-1 gap-2 sm:grid-cols-4">
              <input
                type="text"
                placeholder={t.statePlaceholder}
                value={sessionContext.state || ""}
                onChange={(e) =>
                  onChangeSessionContext({
                    ...sessionContext,
                    state: e.target.value || undefined,
                  })
                }
                className="rounded-md border border-border-subtle bg-surface px-2.5 py-1.5 text-xs text-ink"
              />
              <select
                value={sessionContext.purchase_channel || ""}
                onChange={(e) =>
                  onChangeSessionContext({
                    ...sessionContext,
                    purchase_channel: e.target.value || undefined,
                  })
                }
                className="rounded-md border border-border-subtle bg-surface px-2.5 py-1.5 text-xs text-ink"
                aria-label="Purchase channel"
              >
                <option value="">{t.channelAny}</option>
                <option value="ecommerce">{t.channelEcommerce}</option>
                <option value="retail">{t.channelRetail}</option>
                <option value="service_provider">{t.channelService}</option>
              </select>
              <input
                type="number"
                placeholder={t.amountPlaceholder}
                value={sessionContext.purchase_amount ?? ""}
                onChange={(e) =>
                  onChangeSessionContext({
                    ...sessionContext,
                    purchase_amount: e.target.value ? Number(e.target.value) : undefined,
                  })
                }
                className="rounded-md border border-border-subtle bg-surface px-2.5 py-1.5 text-xs text-ink"
              />
              <input
                type="date"
                value={sessionContext.purchase_date || ""}
                onChange={(e) =>
                  onChangeSessionContext({
                    ...sessionContext,
                    purchase_date: e.target.value || undefined,
                  })
                }
                aria-label="Approximate purchase or issue date"
                className="rounded-md border border-border-subtle bg-surface px-2.5 py-1.5 text-xs text-ink"
              />
            </div>
          </div>
        )}

        {/* Follow-up Quick Chips when inside an active conversation */}
        {entries.length > 0 && (
          <div className="mb-2.5 flex flex-wrap items-center gap-1.5">
            <CornerDownRight className="h-3.5 w-3.5 text-ink-muted" />
            {t.followupSuggestions.map((f) => (
              <button
                key={f.label}
                type="button"
                disabled={loading}
                onClick={() => handleQuickPrompt(f.prompt)}
                className="rounded-full border border-border-subtle bg-canvas px-2.5 py-1 text-[11px] text-ink transition-colors hover:border-accent/40 hover:bg-accent-soft hover:text-accent disabled:opacity-50"
              >
                {f.label}
              </button>
            ))}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="relative">
            <textarea
              rows={2}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  handleSubmit(e);
                }
              }}
              placeholder={entries.length > 0 ? t.placeholderFollowup : t.placeholderMain}
              className="w-full resize-none rounded-lg border border-border-subtle bg-canvas px-4 py-3 pr-32 text-sm text-ink placeholder:text-ink-muted/75 focus:border-accent focus:bg-surface focus:outline-none"
            />
            <button
              type="submit"
              disabled={loading || !input.trim()}
              className="absolute bottom-2.5 right-2.5 inline-flex items-center gap-1.5 rounded-lg bg-accent px-4 py-2 text-xs font-semibold text-white transition-colors hover:bg-accent-hover disabled:cursor-not-allowed disabled:opacity-50"
            >
              {loading ? (
                <>
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  <span>{t.verifyingButton}</span>
                </>
              ) : (
                <>
                  <span>{t.askButton}</span>
                  <Send className="h-3.5 w-3.5" />
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
