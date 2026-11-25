"use client";

import React, { useEffect, useState } from "react";
import {
  Scale,
  Database,
  FileSearch,
  ListChecks,
  ShieldCheck,
  PhoneCall,
  ExternalLink,
  History,
  Globe,
  Plus,
} from "lucide-react";
import {
  ChatTurn,
  CitationMetadata,
  CoverageResponse,
  SessionContext,
  SourceManifestRecord,
  SupportedLanguage,
} from "@/lib/types";
import { LANGUAGE_OPTIONS, UI_COPY } from "@/lib/i18n";
import { fetchCoverage, fetchSources, sendChatMessage, translateResponse } from "@/lib/api";
import { ChatPanel, ConversationEntry } from "@/components/ChatPanel";
import { EvidenceLedger } from "@/components/EvidenceLedger";
import { ActionPlanner } from "@/components/ActionPlanner";
import { SourceViewer } from "@/components/SourceViewer";
import { SourceCoverageModal } from "@/components/SourceCoverageModal";
import { ChatThread, HistorySidebar } from "@/components/HistorySidebar";

const THREADS_STORAGE_KEY = "satya_chat_threads_v1";
const LANGUAGE_STORAGE_KEY = "satya_language_v1";

export default function SatyaHomePage() {
  const [language, setLanguage] = useState<SupportedLanguage>("en");
  const [threads, setThreads] = useState<ChatThread[]>([]);
  const [activeThreadId, setActiveThreadId] = useState<string | null>(null);
  const [draftSessionContext, setDraftSessionContext] = useState<SessionContext>({});
  const [selectedEntryId, setSelectedEntryId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<"ledger" | "planner">("ledger");
  const [loading, setLoading] = useState(false);
  const [translating, setTranslating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [historyDrawerOpen, setHistoryDrawerOpen] = useState(false);
  const [viewerCitation, setViewerCitation] = useState<CitationMetadata | null>(null);
  const [coverageOpen, setCoverageOpen] = useState(false);
  const [coverage, setCoverage] = useState<CoverageResponse | null>(null);
  const [sources, setSources] = useState<SourceManifestRecord[]>([]);
  const [hydrated, setHydrated] = useState(false);

  // Hydrate language & chat history from localStorage on mount
  useEffect(() => {
    try {
      const savedLang = localStorage.getItem(LANGUAGE_STORAGE_KEY) as SupportedLanguage | null;
      if (savedLang && (savedLang === "en" || savedLang === "kn" || savedLang === "hi")) {
        setLanguage(savedLang);
      }
      const savedThreads = localStorage.getItem(THREADS_STORAGE_KEY);
      if (savedThreads) {
        const parsed: ChatThread[] = JSON.parse(savedThreads);
        if (Array.isArray(parsed)) {
          setThreads(parsed);
        }
      }
    } catch {
      // ignore storage errors
    }
    setHydrated(true);

    fetchCoverage().then(setCoverage).catch(() => {});
    fetchSources().then(setSources).catch(() => {});
  }, []);

  // Persist threads & language
  useEffect(() => {
    if (!hydrated) return;
    try {
      localStorage.setItem(THREADS_STORAGE_KEY, JSON.stringify(threads));
    } catch {
      // ignore quota errors
    }
  }, [threads, hydrated]);

  useEffect(() => {
    if (!hydrated) return;
    try {
      localStorage.setItem(LANGUAGE_STORAGE_KEY, language);
    } catch {
      // ignore
    }
  }, [language, hydrated]);

  const activeThread = threads.find((th) => th.id === activeThreadId) || null;
  const entries = activeThread ? activeThread.entries : [];
  const currentSessionContext = activeThread
    ? activeThread.sessionContext
    : draftSessionContext;

  const t = UI_COPY[language];

  const handleNewChat = () => {
    setActiveThreadId(null);
    setSelectedEntryId(null);
    setDraftSessionContext({});
    setError(null);
  };

  const handleSelectThread = async (threadId: string) => {
    const found = threads.find((th) => th.id === threadId);
    if (!found) return;
    setActiveThreadId(found.id);
    const lastEntry = found.entries[found.entries.length - 1];
    setSelectedEntryId(lastEntry ? lastEntry.id : null);
    setError(null);
    // If thread entries aren't yet in current UI language, auto-refresh them
    await refreshThreadLanguage(found.id, found.entries, language);
  };

  const refreshThreadLanguage = async (
    threadId: string,
    threadEntries: ConversationEntry[],
    targetLang: SupportedLanguage
  ) => {
    if (!threadEntries.length) return;
    const needsWork = threadEntries.some(
      (e) =>
        (e.response.language || "en") !== targetLang &&
        !e.translations?.[targetLang]
    );

    // Apply any already-cached translations immediately
    const withCached = threadEntries.map((e) => {
      const cached = e.translations?.[targetLang];
      if (cached) {
        return { ...e, response: cached };
      }
      return e;
    });

    setThreads((prev) =>
      prev.map((th) =>
        th.id === threadId ? { ...th, language: targetLang, entries: withCached } : th
      )
    );

    if (!needsWork) return;

    setTranslating(true);
    try {
      const translatedEntries = await Promise.all(
        withCached.map(async (entry) => {
          const baseLang = (entry.response.language || "en") as SupportedLanguage;
          const existingTranslations: Partial<Record<SupportedLanguage, typeof entry.response>> = {
            ...(entry.translations || {}),
            [baseLang]: entry.response,
          };
          if (existingTranslations[targetLang]) {
            return {
              ...entry,
              response: existingTranslations[targetLang]!,
              translations: existingTranslations,
            };
          }
          try {
            const translated = await translateResponse(entry.response, targetLang);
            return {
              ...entry,
              response: translated,
              translations: {
                ...existingTranslations,
                [targetLang]: translated,
              },
            };
          } catch {
            return entry;
          }
        })
      );

      setThreads((prev) =>
        prev.map((th) =>
          th.id === threadId
            ? { ...th, language: targetLang, entries: translatedEntries }
            : th
        )
      );
    } finally {
      setTranslating(false);
    }
  };

  const handleLanguageChange = async (newLang: SupportedLanguage) => {
    setLanguage(newLang);
    if (activeThread) {
      await refreshThreadLanguage(activeThread.id, activeThread.entries, newLang);
    }
  };

  const handleDeleteThread = (threadId: string) => {
    setThreads((prev) => prev.filter((th) => th.id !== threadId));
    if (activeThreadId === threadId) {
      setActiveThreadId(null);
      setSelectedEntryId(null);
    }
  };

  const handleClearAllHistory = () => {
    setThreads([]);
    setActiveThreadId(null);
    setSelectedEntryId(null);
  };

  const handleChangeSessionContext = (ctx: SessionContext) => {
    if (activeThread) {
      setThreads((prev) =>
        prev.map((th) =>
          th.id === activeThread.id ? { ...th, sessionContext: ctx } : th
        )
      );
    } else {
      setDraftSessionContext(ctx);
    }
  };

  const handleSend = async (
    message: string,
    sessionContext: SessionContext,
    history: ChatTurn[]
  ) => {
    setLoading(true);
    setError(null);
    try {
      const response = await sendChatMessage(message, sessionContext, history, language);
      const entryId = response.request_id || String(Date.now());
      const newEntry: ConversationEntry = {
        id: entryId,
        question: message,
        response,
        translations: { [language]: response },
      };
      const nowIso = new Date().toISOString();

      if (activeThread) {
        setThreads((prev) => {
          const updated = prev.map((th) =>
            th.id === activeThread.id
              ? {
                  ...th,
                  updatedAt: nowIso,
                  language,
                  sessionContext,
                  entries: [...th.entries, newEntry],
                }
              : th
          );
          // Move active thread to top of history
          return updated.sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
        });
      } else {
        const newThreadId = `thread_${Date.now()}`;
        const title =
          message.length > 56 ? `${message.slice(0, 56).trim()}…` : message;
        const created: ChatThread = {
          id: newThreadId,
          title,
          createdAt: nowIso,
          updatedAt: nowIso,
          language,
          sessionContext,
          entries: [newEntry],
        };
        setThreads((prev) => [created, ...prev]);
        setActiveThreadId(newThreadId);
      }

      setSelectedEntryId(entryId);
      if (response.claims.length > 0) {
        setActiveTab("ledger");
      } else if (response.action_plan.length > 0) {
        setActiveTab("planner");
      }
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Unable to reach the Satya verification backend. Ensure FastAPI is running on port 8000."
      );
    } finally {
      setLoading(false);
    }
  };

  const selectedEntry =
    entries.find((e) => e.id === selectedEntryId) ||
    entries[entries.length - 1] ||
    null;

  const handleOpenPassage = (
    chunkId: string,
    details: Record<string, CitationMetadata>
  ) => {
    const found =
      details[chunkId] || selectedEntry?.response.citation_details?.[chunkId];
    if (found) setViewerCitation(found);
  };

  return (
    <div className="min-h-screen flex flex-col bg-canvas text-ink">
      {/* Top Navigation & Single-Domain Header */}
      <header className="sticky top-0 z-30 border-b border-border-subtle bg-surface/95 backdrop-blur-sm">
        <div className="mx-auto flex max-w-[1440px] flex-wrap items-center justify-between gap-3 px-4 py-3 sm:px-6">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setHistoryDrawerOpen(true)}
              className="lg:hidden rounded-md border border-border-subtle bg-canvas p-2 text-ink hover:bg-surface-muted"
              aria-label={t.historyTitle}
            >
              <History className="h-4 w-4" />
            </button>
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-accent text-white shadow-sm">
              <Scale className="h-5 w-5" />
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="font-serif text-lg sm:text-xl font-bold tracking-tight text-ink">
                  {t.brandName}
                </h1>
                <span className="inline-flex items-center gap-1 rounded-full border border-accent/25 bg-accent-soft px-2.5 py-0.5 text-[11px] font-semibold text-accent">
                  <ShieldCheck className="h-3 w-3" />
                  {t.domainBadge}
                </span>
              </div>
              <p className="text-xs text-ink-muted">{t.tagline}</p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {/* Multi-lingual Switcher: English / Kannada / Hindi */}
            <div
              className="inline-flex items-center rounded-lg border border-border-subtle bg-canvas p-0.5"
              role="group"
              aria-label="Language selector"
            >
              <Globe className="ml-2 mr-1 h-3.5 w-3.5 text-ink-muted hidden sm:block" />
              {LANGUAGE_OPTIONS.map((opt) => {
                const active = language === opt.code;
                return (
                  <button
                    key={opt.code}
                    type="button"
                    onClick={() => handleLanguageChange(opt.code)}
                    className={`rounded-md px-2.5 py-1 text-xs font-medium transition-colors ${
                      active
                        ? "bg-accent text-white shadow-sm"
                        : "text-ink-muted hover:text-ink"
                    }`}
                  >
                    {opt.nativeLabel}
                  </button>
                );
              })}
            </div>

            {translating && (
              <span className="text-[11px] font-medium text-accent animate-pulse">
                {language === "kn"
                  ? "ಕನ್ನಡಕ್ಕೆ ಬದಲಾಯಿಸಲಾಗುತ್ತಿದೆ..."
                  : language === "hi"
                  ? "हिन्दी में बदला जा रहा है..."
                  : "Refreshing in English..."}
              </span>
            )}

            <button
              type="button"
              onClick={handleNewChat}
              className="inline-flex items-center gap-1 rounded-md border border-border-subtle bg-canvas px-2.5 py-1.5 text-xs font-medium text-ink hover:bg-surface-muted lg:hidden"
            >
              <Plus className="h-3.5 w-3.5" />
              <span>{t.newChatBtn}</span>
            </button>

            <a
              href="https://consumerhelpline.gov.in/public/"
              target="_blank"
              rel="noopener noreferrer"
              className="hidden xl:inline-flex items-center gap-1.5 rounded-md border border-border-subtle bg-canvas px-3 py-1.5 text-xs font-medium text-ink hover:bg-surface-muted"
            >
              <PhoneCall className="h-3.5 w-3.5 text-accent" />
              <span>NCH 1915</span>
              <ExternalLink className="h-3 w-3 text-ink-muted" />
            </a>
            <a
              href="https://e-jagriti.gov.in/"
              target="_blank"
              rel="noopener noreferrer"
              className="hidden xl:inline-flex items-center gap-1.5 rounded-md border border-border-subtle bg-canvas px-3 py-1.5 text-xs font-medium text-ink hover:bg-surface-muted"
            >
              <span>e-Jagriti</span>
              <ExternalLink className="h-3 w-3 text-ink-muted" />
            </a>
            <button
              type="button"
              onClick={() => setCoverageOpen(true)}
              className="inline-flex items-center gap-1.5 rounded-md border border-accent/30 bg-accent-soft px-3 py-1.5 text-xs font-semibold text-accent hover:bg-accent hover:text-white transition-colors"
            >
              <Database className="h-3.5 w-3.5" />
              <span>
                {t.officialSourcesBtn} ({coverage ? coverage.approved_source_count : "13"})
              </span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Three-Pane Legal-Tech Workspace: History | Continuous Chat | Evidence & Action Plan */}
      <main className="mx-auto w-full max-w-[1440px] flex-1 px-4 py-5 sm:px-6">
        <div className="grid grid-cols-1 gap-5 lg:grid-cols-12 items-start">
          {/* Left Column: Persistent Chat History Section */}
          <HistorySidebar
            threads={threads}
            activeThreadId={activeThreadId}
            language={language}
            mobileOpen={historyDrawerOpen}
            onCloseMobile={() => setHistoryDrawerOpen(false)}
            onSelectThread={handleSelectThread}
            onNewChat={handleNewChat}
            onDeleteThread={handleDeleteThread}
            onClearAll={handleClearAllHistory}
          />

          {/* Center Column: Continuous Consumer Chat & Follow-ups */}
          <section className="lg:col-span-5" aria-label="Consumer Rights Consultation">
            <ChatPanel
              entries={entries}
              selectedEntryId={selectedEntry?.id || null}
              sessionContext={currentSessionContext}
              language={language}
              onChangeSessionContext={handleChangeSessionContext}
              onSelectEntry={setSelectedEntryId}
              onSend={handleSend}
              loading={loading}
              error={error}
              onOpenPassage={handleOpenPassage}
            />
          </section>

          {/* Right Column: Evidence Ledger & Action Planner */}
          <aside
            className="lg:col-span-4 lg:sticky lg:top-20 rounded-xl border border-border-subtle bg-surface shadow-sm overflow-hidden"
            aria-label="Evidence Ledger and Action Planner"
          >
            <div className="flex border-b border-border-subtle bg-canvas">
              <button
                type="button"
                onClick={() => setActiveTab("ledger")}
                className={`flex flex-1 items-center justify-center gap-2 px-4 py-3 text-xs font-semibold transition-colors border-b-2 ${
                  activeTab === "ledger"
                    ? "border-accent bg-surface text-accent"
                    : "border-transparent text-ink-muted hover:text-ink"
                }`}
              >
                <FileSearch className="h-4 w-4" />
                <span>
                  {t.tabLedger}
                  {selectedEntry ? ` (${selectedEntry.response.claims.length})` : ""}
                </span>
              </button>
              <button
                type="button"
                onClick={() => setActiveTab("planner")}
                className={`flex flex-1 items-center justify-center gap-2 px-4 py-3 text-xs font-semibold transition-colors border-b-2 ${
                  activeTab === "planner"
                    ? "border-accent bg-surface text-accent"
                    : "border-transparent text-ink-muted hover:text-ink"
                }`}
              >
                <ListChecks className="h-4 w-4" />
                <span>
                  {t.tabPlanner}
                  {selectedEntry && selectedEntry.response.action_plan.length > 0
                    ? ` (${selectedEntry.response.action_plan.length})`
                    : ""}
                </span>
              </button>
            </div>

            <div className="max-h-[calc(100vh-11rem)] overflow-y-auto p-5">
              {!selectedEntry ? (
                <div className="space-y-4 text-xs text-ink-muted">
                  <p className="font-serif text-sm font-medium text-ink">
                    {activeTab === "ledger"
                      ? t.emptyRightTitleLedger
                      : t.emptyRightTitlePlanner}
                  </p>
                  <p className="leading-relaxed">
                    {activeTab === "ledger"
                      ? t.emptyRightDescLedger
                      : t.emptyRightDescPlanner}
                  </p>
                  <div className="rounded-lg border border-border-subtle bg-canvas p-4 space-y-1.5">
                    <div className="font-semibold text-ink">{t.promiseHeading}</div>
                    <p>{t.promiseQuote}</p>
                  </div>
                </div>
              ) : activeTab === "ledger" ? (
                <EvidenceLedger
                  requestId={selectedEntry.response.request_id}
                  claims={selectedEntry.response.claims}
                  citationDetails={selectedEntry.response.citation_details}
                  evidenceCoverage={selectedEntry.response.evidence_coverage}
                  language={language}
                  onOpenPassage={(cid) =>
                    handleOpenPassage(cid, selectedEntry.response.citation_details)
                  }
                />
              ) : (
                <ActionPlanner
                  actionPlan={selectedEntry.response.action_plan}
                  citationDetails={selectedEntry.response.citation_details}
                  language={language}
                  onOpenPassage={(cid) =>
                    handleOpenPassage(cid, selectedEntry.response.citation_details)
                  }
                  userQuestion={selectedEntry.question}
                />
              )}
            </div>
          </aside>
        </div>
      </main>

      {/* Footer Disclaimer */}
      <footer className="border-t border-border-subtle bg-surface px-4 py-4 text-xs text-ink-muted sm:px-6">
        <div className="mx-auto flex max-w-[1440px] flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
          <p>
            <strong className="font-semibold text-ink">{t.disclaimerLabel}</strong>{" "}
            {t.disclaimerBody}
          </p>
          <p className="shrink-0">{t.privacyFooterNote}</p>
        </div>
      </footer>

      {/* Exact Passage Source Viewer Drawer */}
      <SourceViewer
        citation={viewerCitation}
        language={language}
        onClose={() => setViewerCitation(null)}
      />

      {/* Official Source Coverage Modal */}
      <SourceCoverageModal
        open={coverageOpen}
        onClose={() => setCoverageOpen(false)}
        coverage={coverage}
        sources={sources}
      />
    </div>
  );
}
