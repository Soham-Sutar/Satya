"use client";

import React, { useEffect, useRef, useState } from "react";
import {
  MessageSquare,
  Plus,
  Trash2,
  X,
  Scale,
  PanelLeftClose,
  PanelLeftOpen,
  MoreHorizontal,
  Pencil,
  Check,
  Database,
} from "lucide-react";
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
  collapsed: boolean;
  onToggleCollapse: () => void;
  mobileOpen: boolean;
  onCloseMobile: () => void;
  onSelectThread: (threadId: string) => void;
  onNewChat: () => void;
  onRenameThread: (threadId: string, newTitle: string) => void;
  onDeleteThread: (threadId: string) => void;
  onClearAll: () => void;
  onOpenSources: () => void;
  approvedSourceCount: number | string;
}

type ThreadGroupKey = "today" | "yesterday" | "previous";

function getThreadGroup(iso: string): ThreadGroupKey {
  try {
    const d = new Date(iso);
    const now = new Date();
    const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
    const startOfYesterday = startOfToday - 24 * 60 * 60 * 1000;
    const t = d.getTime();
    if (t >= startOfToday) return "today";
    if (t >= startOfYesterday) return "yesterday";
    return "previous";
  } catch {
    return "previous";
  }
}

function formatShortTime(iso: string): string {
  try {
    const d = new Date(iso);
    const group = getThreadGroup(iso);
    if (group === "today") {
      return d.toLocaleTimeString(undefined, { hour: "2-digit", minute: "2-digit" });
    }
    return d.toLocaleDateString(undefined, { month: "short", day: "numeric" });
  } catch {
    return "";
  }
}

export function HistorySidebar({
  threads,
  activeThreadId,
  language,
  collapsed,
  onToggleCollapse,
  mobileOpen,
  onCloseMobile,
  onSelectThread,
  onNewChat,
  onRenameThread,
  onDeleteThread,
  onClearAll,
  onOpenSources,
  approvedSourceCount,
}: HistorySidebarProps) {
  const t = UI_COPY[language];
  const [menuThreadId, setMenuThreadId] = useState<string | null>(null);
  const [editingThreadId, setEditingThreadId] = useState<string | null>(null);
  const [draftTitle, setDraftTitle] = useState("");
  const editInputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    if (editingThreadId) {
      editInputRef.current?.focus();
      editInputRef.current?.select();
    }
  }, [editingThreadId]);

  useEffect(() => {
    const handleDocClick = () => setMenuThreadId(null);
    if (menuThreadId) {
      document.addEventListener("click", handleDocClick);
      return () => document.removeEventListener("click", handleDocClick);
    }
  }, [menuThreadId]);

  const startRename = (thread: ChatThread) => {
    setMenuThreadId(null);
    setEditingThreadId(thread.id);
    setDraftTitle(thread.title);
  };

  const commitRename = (threadId: string) => {
    const clean = draftTitle.trim();
    if (clean) {
      onRenameThread(threadId, clean);
    }
    setEditingThreadId(null);
  };

  const grouped: Record<ThreadGroupKey, ChatThread[]> = {
    today: [],
    yesterday: [],
    previous: [],
  };
  for (const th of threads) {
    grouped[getThreadGroup(th.updatedAt)].push(th);
  }

  const groupMeta: { key: ThreadGroupKey; label: string }[] = [
    { key: "today", label: t.groupToday },
    { key: "yesterday", label: t.groupYesterday },
    { key: "previous", label: t.groupPrevious },
  ];

  const renderExpandedContent = (isMobileDrawer: boolean) => (
    <div className="flex h-full flex-col bg-surface text-ink">
      {/* Brand Header */}
      <div className="flex items-center justify-between gap-2 border-b border-border-subtle px-4 py-3.5">
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-accent text-canvas shadow-soft ring-1 ring-gold/40">
            <Scale className="h-4.5 w-4.5" />
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-1.5">
              <span className="font-serif text-base font-bold tracking-tight text-ink truncate">
                {t.brandName}
              </span>
            </div>
            <p className="text-[11px] font-medium text-ink-muted truncate">
              {t.brandSubtitle}
            </p>
          </div>
        </div>

        {isMobileDrawer ? (
          <button
            type="button"
            onClick={onCloseMobile}
            className="rounded-lg p-1.5 text-ink-muted transition-colors hover:bg-surface-muted hover:text-ink"
            aria-label="Close navigation"
          >
            <X className="h-4 w-4" />
          </button>
        ) : (
          <button
            type="button"
            onClick={onToggleCollapse}
            className="rounded-lg p-1.5 text-ink-muted transition-colors hover:bg-surface-muted hover:text-ink"
            title={t.collapseSidebar}
            aria-label={t.collapseSidebar}
          >
            <PanelLeftClose className="h-4 w-4" />
          </button>
        )}
      </div>

      {/* Primary New Chat CTA */}
      <div className="p-3 border-b border-border-subtle/70">
        <button
          type="button"
          onClick={() => {
            onNewChat();
            if (isMobileDrawer) onCloseMobile();
          }}
          className="flex w-full items-center justify-center gap-2 rounded-xl bg-accent px-3.5 py-2.5 text-xs font-semibold text-canvas shadow-soft transition-all duration-150 hover:bg-accent-hover active:scale-[0.99]"
        >
          <Plus className="h-4 w-4 text-gold" />
          <span>{t.newChatBtn}</span>
        </button>
      </div>

      {/* Grouped History List */}
      <div className="flex-1 overflow-y-auto px-2.5 py-3 space-y-4">
        {threads.length === 0 ? (
          <div className="rounded-xl border border-dashed border-border-subtle bg-canvas/60 px-3.5 py-6 text-center">
            <MessageSquare className="mx-auto mb-2 h-5 w-5 text-sage" />
            <p className="text-xs leading-relaxed text-ink-muted">{t.historyEmpty}</p>
          </div>
        ) : (
          groupMeta.map(({ key, label }) => {
            const items = grouped[key];
            if (items.length === 0) return null;
            return (
              <div key={key} className="space-y-1">
                <div className="px-2 pb-1 text-[10px] font-semibold uppercase tracking-wider text-ink-muted/80">
                  {label}
                </div>
                {items.map((thread) => {
                  const active = thread.id === activeThreadId;
                  const isEditing = editingThreadId === thread.id;
                  const isMenuOpen = menuThreadId === thread.id;

                  return (
                    <div
                      key={thread.id}
                      className={`group relative rounded-xl border transition-all duration-150 ${active
                          ? "border-accent/35 bg-accent-soft shadow-sm"
                          : "border-transparent hover:border-border-subtle hover:bg-canvas/80"
                        }`}
                    >
                      {active && (
                        <span
                          className="absolute left-0 top-2.5 bottom-2.5 w-[3px] rounded-r-full bg-accent"
                          aria-hidden="true"
                        />
                      )}

                      {isEditing ? (
                        <div className="flex items-center gap-1 p-2">
                          <input
                            ref={editInputRef}
                            type="text"
                            value={draftTitle}
                            onChange={(e) => setDraftTitle(e.target.value)}
                            onKeyDown={(e) => {
                              if (e.key === "Enter") commitRename(thread.id);
                              if (e.key === "Escape") setEditingThreadId(null);
                            }}
                            className="min-w-0 flex-1 rounded-lg border border-accent/40 bg-surface px-2 py-1 text-xs text-ink focus:outline-none"
                          />
                          <button
                            type="button"
                            onClick={() => commitRename(thread.id)}
                            className="rounded-md bg-accent p-1 text-canvas hover:bg-accent-hover"
                            title={t.saveAction}
                            aria-label={t.saveAction}
                          >
                            <Check className="h-3.5 w-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => setEditingThreadId(null)}
                            className="rounded-md p-1 text-ink-muted hover:bg-surface-muted"
                            title={t.cancelAction}
                            aria-label={t.cancelAction}
                          >
                            <X className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      ) : (
                        <>
                          <button
                            type="button"
                            onClick={() => {
                              onSelectThread(thread.id);
                              if (isMobileDrawer) onCloseMobile();
                            }}
                            className="w-full px-3 py-2.5 pr-9 text-left"
                          >
                            <div className="flex items-start gap-2">
                              <MessageSquare
                                className={`mt-0.5 h-3.5 w-3.5 shrink-0 transition-colors ${active
                                    ? "text-accent"
                                    : "text-sage group-hover:text-accent"
                                  }`}
                              />
                              <div className="min-w-0 flex-1">
                                <p
                                  className={`truncate text-xs font-medium ${active ? "text-accent font-semibold" : "text-ink"
                                    }`}
                                >
                                  {thread.title}
                                </p>
                                <div className="mt-1 flex items-center gap-1.5 text-[10px] text-ink-muted">
                                  <span>{formatShortTime(thread.updatedAt)}</span>
                                  <span>·</span>
                                  <span>
                                    {thread.entries.length} {t.turnsLabel}
                                  </span>
                                  <span className="rounded border border-border-subtle bg-canvas px-1 text-[9px] font-medium uppercase">
                                    {thread.language}
                                  </span>
                                </div>
                              </div>
                            </div>
                          </button>

                          {/* Conversation Actions Menu Trigger */}
                          <div className="absolute right-1.5 top-2">
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                setMenuThreadId(isMenuOpen ? null : thread.id);
                              }}
                              aria-label="Conversation actions"
                              className={`rounded-lg p-1 text-ink-muted transition-opacity hover:bg-surface-muted hover:text-ink ${isMenuOpen || active
                                  ? "opacity-100"
                                  : "opacity-0 group-hover:opacity-100 focus:opacity-100"
                                }`}
                            >
                              <MoreHorizontal className="h-3.5 w-3.5" />
                            </button>

                            {isMenuOpen && (
                              <div
                                onClick={(e) => e.stopPropagation()}
                                className="absolute right-0 top-7 z-30 w-36 rounded-xl border border-border-subtle bg-surface p-1 shadow-card animate-satya-in"
                              >
                                <button
                                  type="button"
                                  onClick={() => startRename(thread)}
                                  className="flex w-full items-center gap-2 rounded-lg px-2.5 py-1.5 text-left text-xs text-ink transition-colors hover:bg-canvas"
                                >
                                  <Pencil className="h-3.5 w-3.5 text-ink-muted" />
                                  <span>{t.renameAction}</span>
                                </button>
                                <button
                                  type="button"
                                  onClick={() => {
                                    setMenuThreadId(null);
                                    onDeleteThread(thread.id);
                                  }}
                                  className="flex w-full items-center gap-2 rounded-lg px-2.5 py-1.5 text-left text-xs text-crimson-700 transition-colors hover:bg-crimson-100"
                                >
                                  <Trash2 className="h-3.5 w-3.5" />
                                  <span>{t.deleteAction}</span>
                                </button>
                              </div>
                            )}
                          </div>
                        </>
                      )}
                    </div>
                  );
                })}
              </div>
            );
          })
        )}
      </div>

      {/* Bottom Trust & Clear Controls */}
      <div className="border-t border-border-subtle bg-canvas/60 p-3 space-y-2">
        <button
          type="button"
          onClick={() => {
            onOpenSources();
            if (isMobileDrawer) onCloseMobile();
          }}
          className="flex w-full items-center justify-between rounded-xl border border-border-subtle bg-surface px-3 py-2 text-xs font-medium text-ink transition-colors hover:border-accent/40 hover:bg-accent-soft/50"
        >
          <span className="inline-flex items-center gap-2">
            <Database className="h-3.5 w-3.5 text-accent" />
            <span>{t.officialSourcesBtn}</span>
          </span>
          <span className="rounded-full bg-accent-soft px-2 py-0.5 text-[10px] font-semibold text-accent">
            {approvedSourceCount}
          </span>
        </button>

        {threads.length > 0 && (
          <button
            type="button"
            onClick={onClearAll}
            className="flex w-full items-center justify-center gap-1.5 rounded-lg px-2 py-1.5 text-[11px] font-medium text-ink-muted transition-colors hover:bg-crimson-100/70 hover:text-crimson-700"
          >
            <Trash2 className="h-3 w-3" />
            <span>{t.clearHistoryBtn}</span>
          </button>
        )}
      </div>
    </div>
  );

  const renderCollapsedRail = () => (
    <div className="flex h-full flex-col items-center bg-surface py-3.5 text-ink">
      {/* Brand Emblem */}
      <button
        type="button"
        onClick={onToggleCollapse}
        title={t.expandSidebar}
        aria-label={t.expandSidebar}
        className="flex h-9 w-9 items-center justify-center rounded-xl bg-accent text-canvas shadow-soft ring-1 ring-gold/40 transition-transform hover:scale-105"
      >
        <Scale className="h-4.5 w-4.5" />
      </button>

      {/* Expand Toggle */}
      <button
        type="button"
        onClick={onToggleCollapse}
        title={t.expandSidebar}
        aria-label={t.expandSidebar}
        className="mt-2.5 rounded-lg p-2 text-ink-muted transition-colors hover:bg-surface-muted hover:text-ink"
      >
        <PanelLeftOpen className="h-4 w-4" />
      </button>

      {/* New Chat Icon */}
      <button
        type="button"
        onClick={onNewChat}
        title={t.newChatBtn}
        aria-label={t.newChatBtn}
        className="mt-3 flex h-9 w-9 items-center justify-center rounded-xl bg-accent text-canvas shadow-soft transition-colors hover:bg-accent-hover"
      >
        <Plus className="h-4 w-4 text-gold" />
      </button>

      <div className="my-3 h-px w-8 bg-border-subtle" />

      {/* Compact Recent Conversation Icons */}
      <div className="flex-1 w-full overflow-y-auto px-2 space-y-1.5 flex flex-col items-center">
        {threads.slice(0, 12).map((thread) => {
          const active = thread.id === activeThreadId;
          return (
            <button
              key={thread.id}
              type="button"
              onClick={() => onSelectThread(thread.id)}
              title={thread.title}
              aria-label={thread.title}
              className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border transition-all ${active
                  ? "border-accent/40 bg-accent-soft text-accent shadow-sm"
                  : "border-transparent text-ink-muted hover:border-border-subtle hover:bg-canvas hover:text-ink"
                }`}
            >
              <MessageSquare className="h-4 w-4" />
            </button>
          );
        })}
      </div>

      {/* Bottom Official Sources Icon */}
      <div className="pt-2 border-t border-border-subtle w-full flex justify-center">
        <button
          type="button"
          onClick={onOpenSources}
          title={`${t.officialSourcesBtn} (${approvedSourceCount})`}
          aria-label={t.officialSourcesBtn}
          className="flex h-9 w-9 items-center justify-center rounded-xl border border-border-subtle bg-canvas text-accent transition-colors hover:bg-accent-soft"
        >
          <Database className="h-4 w-4" />
        </button>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Collapsible Sidebar */}
      <aside
        className={`hidden lg:flex lg:flex-col shrink-0 border-r border-border-subtle bg-surface transition-[width] duration-300 ease-in-out ${collapsed ? "w-[68px]" : "w-72"
          }`}
        aria-label={t.historyTitle}
      >
        {collapsed ? renderCollapsedRail() : renderExpandedContent(false)}
      </aside>

      {/* Mobile & Tablet Slide-Out Drawer */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-50 flex lg:hidden bg-ink/40 backdrop-blur-[2px] animate-satya-in"
          onClick={onCloseMobile}
        >
          <div
            className="h-full w-80 max-w-[85vw] border-r border-border-subtle bg-surface shadow-card"
            onClick={(e) => e.stopPropagation()}
          >
            {renderExpandedContent(true)}
          </div>
        </div>
      )}
    </>
  );
}
