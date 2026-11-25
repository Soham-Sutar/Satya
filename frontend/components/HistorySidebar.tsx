"use client";

import React from "react";
import { MessageSquare, Plus, Trash2, Clock, X } from "lucide-react";
import { SessionContext, SupportedLanguage } from "@/lib/types";
import { UI_COPY } from "@/lib/i18n";
import { ConversationEntry } from "./ChatPanel";

export interface ChatThread {
  id: string;
  title: string;
  createdAt: string;
  updatedAt: string;
  language: SupportedLanguage;
  sessionContext: SessionContext;
  entries: ConversationEntry[];
}

interface HistorySidebarProps {
  threads: ChatThread[];
  activeThreadId: string | null;
  language: SupportedLanguage;
  mobileOpen: boolean;
  onCloseMobile: () => void;
  onSelectThread: (threadId: string) => void;
  onNewChat: () => void;
  onDeleteThread: (threadId: string) => void;
  onClearAll: () => void;
}

function formatRelativeDate(iso: string): string {
  try {
    const d = new Date(iso);
    return d.toLocaleString(undefined, {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return "";
  }
}

export function HistorySidebar({
  threads,
  activeThreadId,
  language,
  mobileOpen,
  onCloseMobile,
  onSelectThread,
  onNewChat,
  onDeleteThread,
  onClearAll,
}: HistorySidebarProps) {
  const t = UI_COPY[language];

  const listContent = (
    <div className="flex h-full flex-col bg-surface">
      <div className="flex items-center justify-between border-b border-border-subtle bg-canvas px-4 py-3">
        <div className="flex items-center gap-2">
          <Clock className="h-4 w-4 text-accent" />
          <h2 className="font-serif text-sm font-semibold text-ink">{t.historyTitle}</h2>
        </div>
        <div className="flex items-center gap-1.5">
          {threads.length > 0 && (
            <button
              type="button"
              onClick={onClearAll}
              className="text-[11px] font-medium text-ink-muted hover:text-crimson-700"
              title={t.clearHistoryBtn}
            >
              {t.clearHistoryBtn}
            </button>
          )}
          <button
            type="button"
            onClick={onCloseMobile}
            className="lg:hidden rounded p-1 text-ink-muted hover:bg-surface-muted"
            aria-label="Close history"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      </div>

      <div className="p-3 border-b border-border-subtle">
        <button
          type="button"
          onClick={() => {
            onNewChat();
            onCloseMobile();
          }}
          className="flex w-full items-center justify-center gap-1.5 rounded-lg bg-accent px-3 py-2 text-xs font-semibold text-white transition-colors hover:bg-accent-hover"
        >
          <Plus className="h-3.5 w-3.5" />
          <span>{t.newChatBtn}</span>
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-2.5 space-y-1.5">
        {threads.length === 0 ? (
          <p className="px-2 py-6 text-center text-xs leading-relaxed text-ink-muted">
            {t.historyEmpty}
          </p>
        ) : (
          threads.map((thread) => {
            const active = thread.id === activeThreadId;
            const lastStatus =
              thread.entries[thread.entries.length - 1]?.response.status;
            return (
              <div
                key={thread.id}
                className={`group relative rounded-lg border transition-colors ${
                  active
                    ? "border-accent/40 bg-accent-soft/60"
                    : "border-transparent bg-canvas/60 hover:border-border-subtle hover:bg-canvas"
                }`}
              >
                <button
                  type="button"
                  onClick={() => {
                    onSelectThread(thread.id);
                    onCloseMobile();
                  }}
                  className="w-full p-2.5 pr-8 text-left"
                >
                  <div className="flex items-start gap-2">
                    <MessageSquare
                      className={`mt-0.5 h-3.5 w-3.5 shrink-0 ${
                        active ? "text-accent" : "text-ink-muted"
                      }`}
                    />
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-xs font-medium text-ink">
                        {thread.title}
                      </p>
                      <div className="mt-1 flex flex-wrap items-center gap-1.5 text-[10px] text-ink-muted">
                        <span>{formatRelativeDate(thread.updatedAt)}</span>
                        <span>·</span>
                        <span>
                          {thread.entries.length} {t.turnsLabel}
                        </span>
                        <span className="rounded bg-surface px-1 py-0.2 border border-border-subtle uppercase">
                          {thread.language}
                        </span>
                        {lastStatus && (
                          <span className="truncate text-accent font-medium">
                            · {lastStatus.replace(/_/g, " ")}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </button>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    onDeleteThread(thread.id);
                  }}
                  aria-label="Delete conversation"
                  className="absolute right-2 top-2.5 rounded p-1 text-ink-muted opacity-0 transition-opacity hover:bg-surface hover:text-crimson-700 group-hover:opacity-100 focus:opacity-100"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              </div>
            );
          })
        )}
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop persistent sidebar */}
      <aside
        className="hidden lg:block lg:col-span-3 lg:sticky lg:top-20 h-[calc(100vh-6.5rem)] rounded-xl border border-border-subtle overflow-hidden shadow-sm"
        aria-label={t.historyTitle}
      >
        {listContent}
      </aside>

      {/* Mobile slide-over history drawer */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-50 flex lg:hidden bg-ink/35 backdrop-blur-[1px]"
          onClick={onCloseMobile}
        >
          <div
            className="h-full w-80 max-w-[85vw] border-r border-border-subtle shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            {listContent}
          </div>
        </div>
      )}
    </>
  );
}
