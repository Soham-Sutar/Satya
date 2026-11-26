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
  Copy,
  Check,
  ArrowRight,
  ChevronDown,
  ChevronUp,
  BookOpen,
  RotateCcw,
  Sparkles,
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
import { CitationChip, formatShortLocator } from "./CitationChip";
import { AbstentionCard } from "./AbstentionCard";

export interface ConversationEntry {
  id: string;
  question: string;
  response: ChatResponse;
  translations?: Partial<
    Record<SupportedLanguage, { question: string; response: ChatResponse }>
  >;
}

interface ChatPanelProps {
  entries: ConversationEntry[];
  selectedEntryId: string | null;
  sessionContext: SessionContext;
  language: SupportedLanguage;
  onChangeSessionContext: (ctx: SessionContext) => void;
  onSelectEntry: (id: string) => void;
  onSend: (message: string, ctx: SessionContext, history: ChatTurn[]) => Promise<void>;
  onNewChat: () => void;
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

function renderInlineTokens(
  text: string,
  citationDetails: Record<string, CitationMetadata>,
  onOpenPassage: (cid: string, details: Record<string, CitationMetadata>) => void
) {
  const tokens = text.split(/(`[^`]+`|\[[a-zA-Z0-9_]+\]|\*\*[^*]+\*\*)/g);
  return tokens.map((tok, idx) => {
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
}

function renderAnswerParagraphs(
  markdown: string,
  citationDetails: Record<string, CitationMetadata>,
  onOpenPassage: (cid: string, details: Record<string, CitationMetadata>) => void
) {
  const lines = markdown.split("\n").filter((l) => l.trim() !== "");
  return lines.map((line, i) => {
    const trimmed = line.trim();
    if (trimmed.startsWith("### ")) {
      return (
        <h4
          key={i}
          className="pt-2 font-serif text-sm font-semibold text-accent"
        >
          {renderInlineTokens(trimmed.slice(4), citationDetails, onOpenPassage)}
        </h4>
      );
    }
    if (trimmed.startsWith("## ")) {
      return (
        <h3
          key={i}
          className="pt-2 font-serif text-base font-semibold text-ink"
        >
          {renderInlineTokens(trimmed.slice(3), citationDetails, onOpenPassage)}
        </h3>
      );
    }
    const isBullet = trimmed.startsWith("- ") || trimmed.startsWith("* ");
    const cleanLine = isBullet ? trimmed.slice(2) : line;
    const rendered = renderInlineTokens(cleanLine, citationDetails, onOpenPassage);

    if (isBullet) {
      return (
        <li
          key={i}
          className="ml-4 list-disc text-sm leading-relaxed text-ink marker:text-sage"
        >
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

function formatCitationLocator(meta: CitationMetadata): string {
  const parts: string[] = [];
  if (meta.section) parts.push(`Section ${meta.section}${meta.subsection || ""}`);
  if (meta.rule) parts.push(`Rule ${meta.rule}`);
  if (meta.paragraph) parts.push(meta.paragraph);
  if (meta.page_start) parts.push(`p. ${meta.page_start}`);
  return parts.join(" · ") || meta.heading || meta.chunk_id;
}

export function ChatPanel({
  entries,
  selectedEntryId,
  sessionContext,
  language,
  onChangeSessionContext,
  onSelectEntry,
  onSend,
  onNewChat,
  loading,
  error,
  onOpenPassage,
}: ChatPanelProps) {
  const t = UI_COPY[language];
  const [input, setInput] = useState("");
  const [showFacts, setShowFacts] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [expandedEvidenceIds, setExpandedEvidenceIds] = useState<Record<string, boolean>>({});
  const bottomRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (entries.length > 0 || loading) {
      bottomRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
    }
  }, [entries.length, loading]);

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

  const handleCopyResponse = async (entry: ConversationEntry) => {
    const r = entry.response;
    const cited = Object.values(r.citation_details || {});
    const lines = [
      `Q: ${entry.question}`,
      "",
      `[${t.statusLabels[r.status]}]`,
      r.answer_markdown,
      "",
      ...(cited.length > 0
        ? [
            "Official Sources:",
            ...cited.map(
              (m) =>
                `- ${formatShortLocator(m.chunk_id, m)}: ${m.source_title} (${m.official_url})`
            ),
          ]
        : []),
    ];
    try {
      await navigator.clipboard.writeText(lines.join("\n"));
      setCopiedId(entry.id);
      setTimeout(() => setCopiedId((prev) => (prev === entry.id ? null : prev)), 2000);
    } catch {
      // ignore clipboard errors
    }
  };

  const toggleEvidencePreview = (key: string) => {
    setExpandedEvidenceIds((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const hasFacts = Object.values(sessionContext).some(
    (v) => v !== undefined && v !== ""
  );

  return (
    <div className="flex flex-col gap-5">
      {/* Welcome Screen when starting a fresh conversation */}
      {entries.length === 0 && !loading ? (
        <div className="mx-auto w-full max-w-3xl py-4 sm:py-6 animate-satya-in">
          <div className="rounded-2xl border border-border-subtle bg-surface p-6 sm:p-8 shadow-card space-y-6">
            <div className="space-y-3">
              <span className="inline-flex items-center gap-1.5 rounded-full border border-gold/40 bg-gold-soft px-3 py-1 text-[11px] font-semibold text-accent">
                <Scale className="h-3.5 w-3.5 text-gold" />
                <span>{t.welcomeBadge}</span>
              </span>
              <h2 className="font-serif text-2xl sm:text-3xl font-bold tracking-tight text-ink">
                {t.emptyHeroTitle}
              </h2>
              <p className="text-sm sm:text-base leading-relaxed text-ink-muted">
                {t.emptyHeroDesc}
              </p>
            </div>

            <div className="space-y-3 pt-2 border-t border-border-subtle/80">
              <div className="text-[11px] font-semibold uppercase tracking-wider text-ink-muted">
                {t.examplesLabel}
              </div>
              <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2">
                {t.samplePrompts.map((q) => (
                  <button
                    key={q.label}
                    type="button"
                    disabled={loading}
                    onClick={() => handleQuickPrompt(q.prompt)}
                    className="group flex items-start justify-between gap-3 rounded-xl border border-border-subtle bg-canvas/75 p-3.5 text-left transition-all duration-150 hover:border-accent/45 hover:bg-accent-soft/45 hover:shadow-soft active:scale-[0.99] disabled:opacity-50"
                  >
                    <div className="space-y-1 min-w-0">
                      <div className="text-xs sm:text-[13px] font-semibold text-ink group-hover:text-accent transition-colors">
                        {q.label}
                      </div>
                      <p className="text-[11px] leading-relaxed text-ink-muted line-clamp-2">
                        {q.description}
                      </p>
                    </div>
                    <ArrowRight className="mt-0.5 h-4 w-4 shrink-0 text-sage transition-transform duration-150 group-hover:translate-x-0.5 group-hover:text-accent" />
                  </button>
                ))}
              </div>
            </div>

            <div className="flex items-start gap-2.5 rounded-xl border border-border-subtle bg-canvas px-4 py-3 text-xs leading-relaxed text-ink-muted">
              <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-accent" />
              <p>{t.welcomeGroundingNote}</p>
            </div>
          </div>
        </div>
      ) : (
        /* Continuous Chronological Conversation Thread */
        <div className="mx-auto w-full max-w-3xl space-y-5">
          {entries.map((entry, idx) => {
            const r = entry.response;
            const style = STATUS_STYLE[r.status];
            const isSelected = entry.id === selectedEntryId;
            const citedList = Object.values(r.citation_details || {});
            const isEvidenceOpen = expandedEvidenceIds[entry.id] ?? citedList.length <= 3;

            return (
              <div key={entry.id} className="space-y-3 animate-satya-in">
                {/* User Turn Bubble */}
                <div className="flex justify-end">
                  <div className="max-w-[88%] sm:max-w-[80%] rounded-2xl rounded-tr-sm bg-accent px-4 py-3 text-canvas shadow-soft">
                    <div className="mb-1 flex items-center justify-between gap-3 text-[10px] font-medium uppercase tracking-wider text-beige/80">
                      <span>#{idx + 1}</span>
                    </div>
                    <p className="text-sm leading-relaxed">{entry.question}</p>
                  </div>
                </div>

                {/* Satya Grounded Reply Card */}
                <article
                  onClick={() => onSelectEntry(entry.id)}
                  className={`cursor-pointer rounded-2xl border bg-surface p-5 sm:p-6 shadow-soft transition-all duration-150 ${
                    isSelected
                      ? "border-accent/55 ring-1 ring-accent/25 shadow-card"
                      : "border-border-subtle hover:border-sage"
                  }`}
                >
                  {/* Card Status Header */}
                  <div className="mb-4 flex flex-wrap items-center justify-between gap-2 border-b border-border-subtle pb-3">
                    <div className="flex flex-wrap items-center gap-2">
                      <span
                        className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-[11px] font-semibold ${style.cls}`}
                      >
                        {style.icon}
                        <span>{t.statusLabels[r.status]}</span>
                      </span>
                      <span className="rounded-md border border-border-subtle bg-canvas px-2 py-0.5 text-[11px] font-medium capitalize text-ink-muted">
                        {r.issue_category.replace(/_/g, " ")}
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className="font-mono text-[11px] text-ink-muted">
                        {r.latency_ms}ms
                      </span>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleCopyResponse(entry);
                        }}
                        className="inline-flex items-center gap-1 rounded-lg border border-border-subtle bg-canvas px-2.5 py-1 text-[11px] font-medium text-ink transition-colors hover:border-accent/40 hover:bg-accent-soft hover:text-accent"
                        title={t.copyResponseBtn}
                      >
                        {copiedId === entry.id ? (
                          <>
                            <Check className="h-3 w-3 text-accent" />
                            <span className="text-accent">{t.copiedResponseBtn}</span>
                          </>
                        ) : (
                          <>
                            <Copy className="h-3 w-3" />
                            <span>{t.copyResponseBtn}</span>
                          </>
                        )}
                      </button>
                    </div>
                  </div>

                  {/* Abstention / Clarification Callout */}
                  {r.abstention_reason && (
                    <div className="mb-4">
                      <AbstentionCard
                        status={r.status}
                        detail={r.abstention_reason}
                        language={language}
                      />
                    </div>
                  )}

                  {/* AI-Generated Grounded Explanation (visually distinct from raw statutory evidence) */}
                  <div className="space-y-2.5">
                    <div className="flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wider text-sage">
                      <Sparkles className="h-3.5 w-3.5 text-gold" />
                      <span>{t.aiExplanationLabel}</span>
                    </div>
                    <div className="satya-prose space-y-2 text-ink">
                      {renderAnswerParagraphs(
                        r.answer_markdown,
                        r.citation_details || {},
                        onOpenPassage
                      )}
                    </div>
                  </div>

                  {/* Supporting Official Legal Evidence Panel */}
                  {citedList.length > 0 && (
                    <div
                      onClick={(e) => e.stopPropagation()}
                      className="mt-5 rounded-xl border border-border-subtle bg-canvas/85 p-3.5 sm:p-4 space-y-3"
                    >
                      <div className="flex items-center justify-between gap-2">
                        <div className="flex items-center gap-2">
                          <BookOpen className="h-4 w-4 text-accent" />
                          <span className="text-xs font-semibold text-ink">
                            {t.officialEvidenceLabel}
                          </span>
                          <span className="rounded-full bg-accent-soft px-2 py-0.5 text-[10px] font-semibold text-accent">
                            {citedList.length}
                          </span>
                        </div>
                        <button
                          type="button"
                          onClick={() => toggleEvidencePreview(entry.id)}
                          className="inline-flex items-center gap-1 text-[11px] font-medium text-accent hover:underline"
                        >
                          <span>{isEvidenceOpen ? "Hide" : "Expand"}</span>
                          {isEvidenceOpen ? (
                            <ChevronUp className="h-3.5 w-3.5" />
                          ) : (
                            <ChevronDown className="h-3.5 w-3.5" />
                          )}
                        </button>
                      </div>

                      {!isEvidenceOpen ? (
                        <div className="flex flex-wrap gap-1.5">
                          {citedList.map((meta) => (
                            <CitationChip
                              key={meta.chunk_id}
                              chunkId={meta.chunk_id}
                              meta={meta}
                              onOpen={(cid) => onOpenPassage(cid, r.citation_details)}
                            />
                          ))}
                        </div>
                      ) : (
                        <div className="space-y-2">
                          {citedList.map((meta) => (
                            <div
                              key={meta.chunk_id}
                              className="rounded-lg border border-border-subtle bg-surface p-3 space-y-1.5 transition-colors hover:border-sage"
                            >
                              <div className="flex flex-wrap items-start justify-between gap-2">
                                <div className="min-w-0 flex-1">
                                  <div className="text-xs font-semibold text-ink">
                                    {meta.source_title}
                                  </div>
                                  <div className="text-[11px] font-medium text-accent">
                                    {formatCitationLocator(meta)}
                                  </div>
                                </div>
                                <div className="flex items-center gap-2 shrink-0">
                                  <button
                                    type="button"
                                    onClick={() =>
                                      onOpenPassage(meta.chunk_id, r.citation_details)
                                    }
                                    className="rounded-md border border-accent/25 bg-accent-soft px-2 py-1 text-[11px] font-semibold text-accent transition-colors hover:bg-accent hover:text-canvas"
                                  >
                                    {t.openExactPassage}
                                  </button>
                                  <a
                                    href={meta.official_url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="inline-flex items-center gap-1 text-[11px] font-medium text-ink-muted hover:text-accent"
                                    title={meta.issuing_authority}
                                  >
                                    <ExternalLink className="h-3.5 w-3.5" />
                                  </a>
                                </div>
                              </div>
                              <p className="font-serif text-xs leading-relaxed text-ink-muted line-clamp-2">
                                “{meta.exact_passage}”
                              </p>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}

                  {/* Limitations & Official Portals */}
                  {(r.limitations.length > 0 || r.official_links.length > 0) && (
                    <div className="mt-4 rounded-xl border border-border-subtle/80 bg-canvas/60 px-3.5 py-3 text-xs space-y-2">
                      {r.limitations.length > 0 && (
                        <ul className="space-y-1 text-ink-muted">
                          {r.limitations.map((lim, i) => (
                            <li key={i}>• {lim}</li>
                          ))}
                        </ul>
                      )}
                      {r.official_links.length > 0 && (
                        <div className="flex flex-wrap items-center gap-x-3 gap-y-1.5 pt-1 border-t border-border-subtle/60">
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
                              className="inline-flex items-center gap-1 font-medium text-accent hover:underline"
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
                    <span className={isSelected ? "font-medium text-accent" : ""}>
                      {isSelected ? t.inspectingNote : t.clickToInspectNote}
                    </span>
                    <span className="font-mono">req:{r.request_id}</span>
                  </div>
                </article>
              </div>
            );
          })}

          {/* Animated Typing / Verification Indicator */}
          {loading && (
            <div className="flex justify-start animate-satya-in">
              <div className="flex items-center gap-3 rounded-2xl rounded-tl-sm border border-border-subtle bg-surface px-4 py-3.5 shadow-soft">
                <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-accent text-canvas">
                  <Scale className="h-3.5 w-3.5" />
                </div>
                <div className="flex items-center gap-2.5">
                  <div className="flex items-center gap-1">
                    <span className="h-2 w-2 rounded-full bg-accent typing-dot typing-dot-1" />
                    <span className="h-2 w-2 rounded-full bg-accent typing-dot typing-dot-2" />
                    <span className="h-2 w-2 rounded-full bg-accent typing-dot" />
                  </div>
                  <span className="text-xs font-medium text-ink-muted">
                    {t.retrievingNotice}
                  </span>
                </div>
              </div>
            </div>
          )}

          <div ref={bottomRef} />
        </div>
      )}

      {error && (
        <div className="mx-auto w-full max-w-3xl rounded-xl border border-crimson-700/30 bg-crimson-100 px-4 py-3 text-xs font-medium text-crimson-700 animate-satya-in">
          {error}
        </div>
      )}

      {/* Professional Chat Input Composer */}
      <div className="mx-auto w-full max-w-3xl">
        <div className="rounded-2xl border border-border-subtle bg-surface p-3.5 sm:p-4 shadow-card transition-colors focus-within:border-accent/55">
          <div className="mb-2.5 flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <Scale className="h-4 w-4 text-accent" />
              <span className="text-xs font-semibold text-ink">
                {entries.length > 0 ? t.followupHint : t.askTitle}
              </span>
            </div>

            <div className="flex items-center gap-2">
              {entries.length > 0 && (
                <button
                  type="button"
                  onClick={onNewChat}
                  disabled={loading}
                  className="inline-flex items-center gap-1 rounded-lg border border-border-subtle bg-canvas px-2.5 py-1 text-xs font-medium text-ink-muted transition-colors hover:border-sage hover:text-ink disabled:opacity-50"
                  title={t.clearChatBtn}
                >
                  <RotateCcw className="h-3 w-3" />
                  <span>{t.clearChatBtn}</span>
                </button>
              )}
              <button
                type="button"
                onClick={() => setShowFacts((v) => !v)}
                className={`inline-flex items-center gap-1.5 rounded-lg border px-2.5 py-1 text-xs font-medium transition-colors ${
                  hasFacts
                    ? "border-accent/40 bg-accent-soft text-accent"
                    : "border-border-subtle bg-canvas text-ink-muted hover:border-sage hover:text-ink"
                }`}
              >
                <SlidersHorizontal className="h-3.5 w-3.5" />
                <span>{hasFacts ? t.factsActiveBtn : t.factsBtn}</span>
              </button>
            </div>
          </div>

          {showFacts && (
            <div className="mb-3 rounded-xl border border-border-subtle bg-canvas/85 p-3.5 space-y-2.5 animate-satya-in">
              <div className="flex items-center justify-between gap-2">
                <span className="text-[11px] font-semibold uppercase tracking-wide text-ink-muted">
                  {t.factsPrivacyNote}
                </span>
                {hasFacts && (
                  <button
                    type="button"
                    onClick={() => onChangeSessionContext({})}
                    className="inline-flex items-center gap-1 text-[11px] font-medium text-crimson-700 hover:underline"
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
                  className="rounded-lg border border-border-subtle bg-surface px-2.5 py-1.5 text-xs text-ink placeholder:text-ink-muted/70 focus:border-accent focus:outline-none"
                />
                <select
                  value={sessionContext.purchase_channel || ""}
                  onChange={(e) =>
                    onChangeSessionContext({
                      ...sessionContext,
                      purchase_channel: e.target.value || undefined,
                    })
                  }
                  className="rounded-lg border border-border-subtle bg-surface px-2.5 py-1.5 text-xs text-ink focus:border-accent focus:outline-none"
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
                      purchase_amount: e.target.value
                        ? Number(e.target.value)
                        : undefined,
                    })
                  }
                  className="rounded-lg border border-border-subtle bg-surface px-2.5 py-1.5 text-xs text-ink placeholder:text-ink-muted/70 focus:border-accent focus:outline-none"
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
                  className="rounded-lg border border-border-subtle bg-surface px-2.5 py-1.5 text-xs text-ink focus:border-accent focus:outline-none"
                />
              </div>
            </div>
          )}

          {/* Follow-up Quick Chips when inside an active conversation */}
          {entries.length > 0 && (
            <div className="mb-2.5 flex flex-wrap items-center gap-1.5">
              <CornerDownRight className="h-3.5 w-3.5 text-sage" />
              {t.followupSuggestions.map((f) => (
                <button
                  key={f.label}
                  type="button"
                  disabled={loading}
                  onClick={() => handleQuickPrompt(f.prompt)}
                  className="rounded-full border border-border-subtle bg-canvas px-2.5 py-1 text-[11px] font-medium text-ink transition-colors hover:border-accent/40 hover:bg-accent-soft hover:text-accent disabled:opacity-50"
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
                placeholder={
                  entries.length > 0 ? t.placeholderFollowup : t.placeholderMain
                }
                className="w-full resize-none rounded-xl border border-border-subtle bg-canvas/85 px-4 py-3 pr-28 text-sm text-ink placeholder:text-ink-muted/75 focus:border-accent focus:bg-surface focus:outline-none"
              />
              <button
                type="submit"
                disabled={loading || !input.trim()}
                className="absolute bottom-2.5 right-2.5 inline-flex items-center gap-1.5 rounded-xl bg-accent px-4 py-2 text-xs font-semibold text-canvas shadow-soft transition-all duration-150 hover:bg-accent-hover active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-45"
              >
                {loading ? (
                  <>
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                    <span>{t.verifyingButton}</span>
                  </>
                ) : (
                  <>
                    <span>{t.askButton}</span>
                    <Send className="h-3.5 w-3.5 text-gold" />
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
