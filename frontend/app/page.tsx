"use client";

import React, { useEffect, useState } from "react";
import {
  Database,
  FileSearch,
  ListChecks,
  PhoneCall,
  ExternalLink,
  Menu,
  Globe,
  BookMarked,
  MessageSquare,
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
import { fetchCoverage, fetchSources, sendChatMessage, translateThread } from "@/lib/api";
import { ChatPanel, ConversationEntry } from "@/components/ChatPanel";
import { EvidenceLedger } from "@/components/EvidenceLedger";
import { ActionPlanner } from "@/components/ActionPlanner";
import { SourceViewer } from "@/components/SourceViewer";
import { SourceCoverageModal } from "@/components/SourceCoverageModal";
import { ChatThread, HistorySidebar } from "@/components/HistorySidebar";
import { PolicyExplorer } from "@/components/PolicyExplorer";

const THREADS_STORAGE_KEY = "satya_chat_threads_v1";
const LANGUAGE_STORAGE_KEY = "satya_language_v1";

function hasTargetScriptClient(text: string, lang: SupportedLanguage): boolean {
  if (lang === "kn") return /[\u0C80-\u0CFF]/.test(text);
  if (lang === "hi") return /[\u0900-\u097F]/.test(text);
  return !/[\u0C80-\u0CFF\u0900-\u097F]/.test(text);
}

function responseMatchesLanguageClient(
  resp: ConversationEntry["response"],
  lang: SupportedLanguage
): boolean {
  if ((resp.language || "en") !== lang) return false;
  if (resp.answer_markdown.trim() && !hasTargetScriptClient(resp.answer_markdown, lang)) {
    return false;
  }
  if (lang === "kn" || lang === "hi") {
    if (resp.claims.length > 0 && !resp.claims.some((c) => hasTargetScriptClient(c.text, lang))) {
      return false;
    }
    if (
      resp.action_plan.length > 0 &&
      !resp.action_plan.some((a) => hasTargetScriptClient(a.text, lang))
    ) {
      return false;
    }
  } else {
    if (resp.claims.some((c) => !hasTargetScriptClient(c.text, "en"))) {
      return false;
    }
  }
  return true;
}

export default function SatyaHomePage() {
  const [language, setLanguage] = useState<SupportedLanguage>("en");
  const [threads, setThreads] = useState<ChatThread[]>([]);
  const [activeThreadId, setActiveThreadId] = useState<string | null>(null);
  const [draftSessionContext, setDraftSessionContext] = useState<SessionContext>({});
  const [selectedEntryId, setSelectedEntryId] = useState<string | null>(null);
  const [workspaceMode, setWorkspaceMode] = useState<"chat" | "policies">("chat");
  const [activeTab, setActiveTab] = useState<"ledger" | "planner">("ledger");
  const [mobilePanel, setMobilePanel] = useState<"chat" | "evidence">("chat");
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
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
    setWorkspaceMode("chat");
    setActiveThreadId(null);
    setSelectedEntryId(null);
    setDraftSessionContext({});
    setMobilePanel("chat");
    setError(null);
  };

  const handleSelectThread = async (threadId: string) => {
    const found = threads.find((th) => th.id === threadId);
    if (!found) return;
    setWorkspaceMode("chat");
    setActiveThreadId(found.id);
    const lastEntry = found.entries[found.entries.length - 1];
    setSelectedEntryId(lastEntry ? lastEntry.id : null);
    setMobilePanel("chat");
    setError(null);
    await refreshThreadLanguage(found.id, found.entries, language);
  };

  const refreshThreadLanguage = async (
    threadId: string,
    threadEntries: ConversationEntry[],
    targetLang: SupportedLanguage
  ) => {
    if (!threadEntries.length) return;

    const withCached = threadEntries.map((e) => {
      const cached = e.translations?.[targetLang];
      if (
        cached &&
        hasTargetScriptClient(cached.question, targetLang) &&
        responseMatchesLanguageClient(cached.response, targetLang)
      ) {
        return {
          ...e,
          question: cached.question,
          response: cached.response,
        };
      }
      return e;
    });

    const toTranslate = withCached.filter(
      (e) =>
        !(
          responseMatchesLanguageClient(e.response, targetLang) &&
          hasTargetScriptClient(e.question, targetLang)
        )
    );

    setThreads((prev) =>
      prev.map((th) =>
        th.id === threadId
          ? {
              ...th,
              language: targetLang,
              entries: withCached,
            }
          : th
      )
    );

    if (toTranslate.length === 0) return;

    setTranslating(true);
    setError(null);
    try {
      const batchRes = await translateThread(
        toTranslate.map((e) => ({
          id: e.id,
          question: e.question,
          response: e.response,
        })),
        targetLang
      );

      const translatedMap = new Map(batchRes.items.map((it) => [it.id, it]));
      const updatedEntries = withCached.map((entry) => {
        const item = translatedMap.get(entry.id);
        if (!item) return entry;

        const baseLang = (entry.response.language || "en") as SupportedLanguage;
        const nextCache = {
          ...(entry.translations || {}),
          [baseLang]: { question: entry.question, response: entry.response },
        };

        const validResult =
          batchRes.translated &&
          responseMatchesLanguageClient(item.response, targetLang);

        if (validResult) {
          nextCache[targetLang] = {
            question: item.question,
            response: item.response,
          };
          return {
            ...entry,
            question: item.question,
            response: item.response,
            translations: nextCache,
          };
        }
        return entry;
      });

      setThreads((prev) =>
        prev.map((th) =>
          th.id === threadId
            ? {
                ...th,
                language: targetLang,
                entries: updatedEntries,
              }
            : th
        )
      );

      if (!batchRes.translated) {
        setError(
          targetLang === "kn"
            ? "ಅನುವಾದ ಸೇವೆಯು ತಾತ್ಕಾಲಿಕವಾಗಿ ಕಾರ್ಯನಿರತವಾಗಿದೆ. ದಯವಿಟ್ಟು ಕೆಲವು ಸೆಕೆಂಡುಗಳ ನಂತರ ಮತ್ತೆ ಪ್ರಯತ್ನಿಸಿ."
            : targetLang === "hi"
            ? "अनुवाद सेवा अस्थायी रूप से व्यस्त है। कृपया कुछ सेकंड बाद पुनः प्रयास करें।"
            : "Translation service is temporarily busy. Please try again in a few seconds."
        );
      }
    } catch {
      setError("Could not refresh conversation language. Please retry.");
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

  const handleRenameThread = (threadId: string, newTitle: string) => {
    setThreads((prev) =>
      prev.map((th) => (th.id === threadId ? { ...th, title: newTitle } : th))
    );
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
      let response = await sendChatMessage(message, sessionContext, history, language);
      let displayQuestion = message;
      const entryId = response.request_id || String(Date.now());
      const baseLang = (response.language || "en") as SupportedLanguage;
      const translationsCache: ConversationEntry["translations"] = responseMatchesLanguageClient(
        response,
        baseLang
      )
        ? { [baseLang]: { question: message, response } }
        : undefined;

      if (!responseMatchesLanguageClient(response, language)) {
        try {
          const tr = await translateThread(
            [{ id: entryId, question: message, response }],
            language
          );
          const translatedItem = tr.items[0];
          if (
            tr.translated &&
            translatedItem &&
            responseMatchesLanguageClient(translatedItem.response, language)
          ) {
            displayQuestion = translatedItem.question || message;
            response = translatedItem.response;
          }
        } catch {
          // keep fallback response
        }
      }

      const newEntry: ConversationEntry = {
        id: entryId,
        question: displayQuestion,
        response,
        translations: {
          ...(translationsCache || {}),
          ...(responseMatchesLanguageClient(response, language)
            ? { [language]: { question: displayQuestion, response } }
            : {}),
        },
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
          return updated.sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
        });
      } else {
        const newThreadId = `thread_${Date.now()}`;
        const title =
          displayQuestion.length > 56
            ? `${displayQuestion.slice(0, 56).trim()}…`
            : displayQuestion;
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
    <div className="min-h-screen lg:h-screen flex bg-canvas text-ink lg:overflow-hidden">
      {/* Left Collapsible Chat History Sidebar */}
      <HistorySidebar
        threads={threads}
        activeThreadId={activeThreadId}
        language={language}
        collapsed={sidebarCollapsed}
        onToggleCollapse={() => setSidebarCollapsed((c) => !c)}
        mobileOpen={historyDrawerOpen}
        onCloseMobile={() => setHistoryDrawerOpen(false)}
        onSelectThread={handleSelectThread}
        onNewChat={handleNewChat}
        onRenameThread={handleRenameThread}
        onDeleteThread={handleDeleteThread}
        onClearAll={handleClearAllHistory}
        onOpenSources={() => setCoverageOpen(true)}
        approvedSourceCount={coverage ? coverage.approved_source_count : "13"}
      />

      {/* Right Main Column (Header + Workspace + Footer) */}
      <div className="flex min-w-0 flex-1 flex-col">
        {/* Top Bar (fixed single-row layout across all languages) */}
        <header className="sticky top-0 z-30 relative border-b border-border-subtle bg-surface/95 backdrop-blur-sm">
          <div className="flex h-14 items-center justify-between gap-2 px-3 sm:px-5">
            <div className="flex min-w-0 items-center gap-2.5">
              <button
                type="button"
                onClick={() => setHistoryDrawerOpen(true)}
                className="lg:hidden shrink-0 rounded-lg border border-border-subtle bg-canvas p-2 text-ink transition-colors hover:bg-surface-muted"
                aria-label={t.historyTitle}
              >
                <Menu className="h-4 w-4" />
              </button>

              {/* Workspace Mode Switcher (fixed button widths prevent horizontal shift on language change) */}
              <div className="inline-flex shrink-0 items-center rounded-xl border border-border-subtle bg-canvas p-0.5">
                <button
                  type="button"
                  onClick={() => setWorkspaceMode("chat")}
                  className={`inline-flex h-8 items-center justify-center gap-1.5 rounded-lg px-2.5 sm:px-3 sm:w-[126px] whitespace-nowrap text-xs font-semibold leading-normal transition-colors ${
                    workspaceMode === "chat"
                      ? "bg-accent text-canvas shadow-sm"
                      : "text-ink-muted hover:text-ink"
                  }`}
                >
                  <MessageSquare className="h-3.5 w-3.5 shrink-0" />
                  <span className="truncate">{t.navAskSatya}</span>
                </button>
                <button
                  type="button"
                  onClick={() => setWorkspaceMode("policies")}
                  className={`inline-flex h-8 items-center justify-center gap-1.5 rounded-lg px-2.5 sm:px-3 sm:w-[162px] whitespace-nowrap text-xs font-semibold leading-normal transition-colors ${
                    workspaceMode === "policies"
                      ? "bg-accent text-canvas shadow-sm"
                      : "text-ink-muted hover:text-ink"
                  }`}
                >
                  <BookMarked className="h-3.5 w-3.5 shrink-0" />
                  <span className="truncate">{t.navLawsPolicies}</span>
                </button>
              </div>

              {/* Subtle Animated Ready / Grounding Status Indicator */}
              <button
                type="button"
                onClick={() => setCoverageOpen(true)}
                className="hidden xl:inline-flex h-8 w-[142px] shrink-0 items-center justify-center gap-2 rounded-full border border-border-subtle bg-canvas px-3 whitespace-nowrap text-[11px] font-medium leading-normal text-ink-muted transition-colors hover:border-accent/40 hover:text-ink"
                title={`${t.satyaReadyLabel} · ${t.officialSourcesBtn}`}
              >
                <span className="relative flex h-2 w-2 shrink-0">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-sage opacity-75" />
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-accent" />
                </span>
                <span className="truncate">{t.satyaReadyLabel}</span>
              </button>
            </div>

            <div className="flex shrink-0 items-center gap-2">
              {/* Multi-lingual Switcher */}
              <div
                className="inline-flex shrink-0 items-center rounded-xl border border-border-subtle bg-canvas p-0.5"
                role="group"
                aria-label="Language selector"
              >
                <Globe className="ml-2 mr-1 h-3.5 w-3.5 shrink-0 text-sage hidden sm:block" />
                {LANGUAGE_OPTIONS.map((opt) => {
                  const active = language === opt.code;
                  return (
                    <button
                      key={opt.code}
                      type="button"
                      onClick={() => handleLanguageChange(opt.code)}
                      className={`inline-flex h-7 items-center justify-center rounded-lg px-2.5 whitespace-nowrap text-xs font-medium leading-normal transition-colors ${
                        active
                          ? "bg-accent text-canvas shadow-sm"
                          : "text-ink-muted hover:text-ink"
                      }`}
                    >
                      {opt.nativeLabel}
                    </button>
                  );
                })}
              </div>

              <a
                href="https://consumerhelpline.gov.in/public/"
                target="_blank"
                rel="noopener noreferrer"
                className="hidden 2xl:inline-flex h-8 shrink-0 items-center gap-1.5 rounded-lg border border-border-subtle bg-canvas px-2.5 whitespace-nowrap text-xs font-medium text-ink transition-colors hover:border-sage hover:bg-surface-muted"
              >
                <PhoneCall className="h-3.5 w-3.5 text-accent" />
                <span>NCH 1915</span>
                <ExternalLink className="h-3 w-3 text-ink-muted" />
              </a>
              <a
                href="https://e-jagriti.gov.in/"
                target="_blank"
                rel="noopener noreferrer"
                className="hidden 2xl:inline-flex h-8 shrink-0 items-center gap-1.5 rounded-lg border border-border-subtle bg-canvas px-2.5 whitespace-nowrap text-xs font-medium text-ink transition-colors hover:border-sage hover:bg-surface-muted"
              >
                <span>e-Jagriti</span>
                <ExternalLink className="h-3 w-3 text-ink-muted" />
              </a>
              <button
                type="button"
                onClick={() => setCoverageOpen(true)}
                className="inline-flex h-8 shrink-0 items-center justify-center gap-1.5 rounded-lg border border-accent/30 bg-accent-soft px-2.5 sm:px-3 sm:w-[162px] whitespace-nowrap text-xs font-semibold leading-normal text-accent transition-colors hover:bg-accent hover:text-canvas"
              >
                <Database className="h-3.5 w-3.5 shrink-0" />
                <span className="hidden sm:inline truncate">{t.officialSourcesBtn}</span>
                <span className="font-mono text-[11px] shrink-0">
                  ({coverage ? coverage.approved_source_count : "13"})
                </span>
              </button>
            </div>
          </div>

          {/* Non-shifting translation indicator bar & floating pill */}
          {translating && (
            <>
              <div className="absolute inset-x-0 bottom-0 h-0.5 overflow-hidden bg-accent-soft">
                <div className="h-full w-1/2 bg-accent animate-pulse" />
              </div>
              <div className="pointer-events-none absolute left-1/2 top-full z-40 mt-2 -translate-x-1/2">
                <div className="rounded-full border border-accent/30 bg-surface px-3.5 py-1 text-[11px] font-semibold text-accent shadow-soft whitespace-nowrap animate-satya-in">
                  {language === "kn"
                    ? "ಕನ್ನಡಕ್ಕೆ ಬದಲಾಯಿಸಲಾಗುತ್ತಿದೆ..."
                    : language === "hi"
                    ? "हिन्दी में बदला जा रहा है..."
                    : "Refreshing in English..."}
                </div>
              </div>
            </>
          )}

          {/* Tablet/Mobile Panel Switcher when viewing an active conversation */}
          {workspaceMode === "chat" && entries.length > 0 && (
            <div className="flex xl:hidden border-t border-border-subtle bg-canvas/70 px-4 py-1.5 gap-2">
              <button
                type="button"
                onClick={() => setMobilePanel("chat")}
                className={`flex-1 rounded-lg py-1.5 text-xs font-semibold transition-colors ${
                  mobilePanel === "chat"
                    ? "bg-accent text-canvas shadow-sm"
                    : "text-ink-muted hover:text-ink"
                }`}
              >
                {t.mobileChatTab} ({entries.length})
              </button>
              <button
                type="button"
                onClick={() => setMobilePanel("evidence")}
                className={`flex-1 rounded-lg py-1.5 text-xs font-semibold transition-colors ${
                  mobilePanel === "evidence"
                    ? "bg-accent text-canvas shadow-sm"
                    : "text-ink-muted hover:text-ink"
                }`}
              >
                {t.mobileEvidenceTab}
                {selectedEntry ? ` (${selectedEntry.response.claims.length})` : ""}
              </button>
            </div>
          )}
        </header>

        {/* Main Workspace Body */}
        <main className="flex-1 min-h-0 flex flex-col lg:overflow-hidden">
          {workspaceMode === "policies" ? (
            <div className="flex-1 overflow-y-auto px-4 py-5 sm:px-6">
              <div className="mx-auto max-w-5xl">
                <PolicyExplorer
                  language={language}
                  onOpenPassage={(cit) => setViewerCitation(cit)}
                />
              </div>
            </div>
          ) : (
            <div className="flex-1 min-h-0 flex flex-col xl:flex-row">
              {/* Primary Chat Interface */}
              <section
                className={`flex-1 min-w-0 overflow-y-auto px-4 py-5 sm:px-6 ${
                  entries.length > 0 && mobilePanel === "evidence"
                    ? "hidden xl:block"
                    : "block"
                }`}
                aria-label="Consumer Rights Consultation"
              >
                <ChatPanel
                  entries={entries}
                  selectedEntryId={selectedEntry?.id || null}
                  sessionContext={currentSessionContext}
                  language={language}
                  onChangeSessionContext={handleChangeSessionContext}
                  onSelectEntry={setSelectedEntryId}
                  onSend={handleSend}
                  onNewChat={handleNewChat}
                  loading={loading}
                  error={error}
                  onOpenPassage={handleOpenPassage}
                />
              </section>

              {/* Right Evidence Ledger & Action Planner (shown cleanly once conversation begins) */}
              {entries.length > 0 && selectedEntry && (
                <aside
                  className={`xl:w-[400px] 2xl:w-[430px] shrink-0 border-t xl:border-t-0 xl:border-l border-border-subtle bg-surface flex flex-col min-h-0 ${
                    mobilePanel === "evidence" ? "flex-1 flex" : "hidden xl:flex"
                  }`}
                  aria-label="Evidence Ledger and Action Planner"
                >
                  <div className="flex border-b border-border-subtle bg-canvas/80">
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
                        {t.tabLedger} ({selectedEntry.response.claims.length})
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
                        {selectedEntry.response.action_plan.length > 0
                          ? ` (${selectedEntry.response.action_plan.length})`
                          : ""}
                      </span>
                    </button>
                  </div>

                  <div className="flex-1 overflow-y-auto p-4 sm:p-5">
                    {activeTab === "ledger" ? (
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
              )}
            </div>
          )}
        </main>

        {/* Subtle Trust & Legal Disclaimer Footer */}
        <footer className="border-t border-border-subtle bg-surface/90 px-4 py-2.5 text-[11px] text-ink-muted sm:px-6">
          <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
            <p>
              <strong className="font-semibold text-ink">{t.disclaimerLabel}</strong>{" "}
              {t.disclaimerBody}
            </p>
            <p className="shrink-0">{t.privacyFooterNote}</p>
          </div>
        </footer>
      </div>

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
