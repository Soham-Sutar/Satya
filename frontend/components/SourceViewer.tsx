"use client";

import React from "react";
import { X, ExternalLink, FileText, Calendar, ShieldCheck, AlertTriangle } from "lucide-react";
import { CitationMetadata, SupportedLanguage } from "@/lib/types";
import { UI_COPY } from "@/lib/i18n";

interface SourceViewerProps {
  citation: CitationMetadata | null;
  language?: SupportedLanguage;
  onClose: () => void;
}

export function SourceViewer({ citation, language = "en", onClose }: SourceViewerProps) {
  if (!citation) return null;
  const t = UI_COPY[language];

  const locatorParts: string[] = [];
  if (citation.section) locatorParts.push(`Section ${citation.section}${citation.subsection || ""}`);
  if (citation.rule) locatorParts.push(`Rule ${citation.rule}`);
  if (citation.paragraph) locatorParts.push(citation.paragraph);
  if (citation.page_start) {
    locatorParts.push(
      citation.page_end && citation.page_end !== citation.page_start
        ? `Pages ${citation.page_start}–${citation.page_end}`
        : `Page ${citation.page_start}`
    );
  }

  const isApproved = citation.source_status === "approved";

  return (
    <div
      className="fixed inset-0 z-50 flex justify-end bg-ink/35 backdrop-blur-[1px]"
      role="dialog"
      aria-modal="true"
      aria-label="Official Source Passage Viewer"
      onClick={onClose}
    >
      <div
        className="flex h-full w-full max-w-2xl flex-col border-l border-border-subtle bg-surface shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start justify-between gap-4 border-b border-border-subtle bg-canvas px-6 py-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-accent">
              <FileText className="h-3.5 w-3.5" />
              <span>{t.sourceViewerHeading}</span>
            </div>
            <h2 className="font-serif text-lg font-semibold text-ink">{citation.source_title}</h2>
            <p className="text-xs text-ink-muted">{citation.issuing_authority}</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-md border border-border-subtle bg-surface p-1.5 text-ink-muted hover:bg-surface-muted hover:text-ink"
            aria-label="Close source viewer"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-6 py-5 space-y-5">
          {/* Exact Locator & Freshness Badges */}
          <div className="grid grid-cols-1 gap-3 rounded-lg border border-border-subtle bg-canvas p-4 sm:grid-cols-2">
            <div>
              <div className="text-[11px] font-semibold uppercase tracking-wide text-ink-muted">
                {t.exactLocatorLabel}
              </div>
              <div className="mt-1 text-sm font-medium text-ink">
                {locatorParts.join(" · ") || citation.heading || citation.chunk_id}
              </div>
              {citation.heading && (
                <div className="mt-0.5 text-xs text-ink-muted">{citation.heading}</div>
              )}
            </div>

            <div>
              <div className="text-[11px] font-semibold uppercase tracking-wide text-ink-muted">
                {t.sourceCurrencyLabel}
              </div>
              <div className="mt-1 flex items-center gap-1.5">
                {isApproved ? (
                  <span className="inline-flex items-center gap-1 rounded-full bg-accent-soft px-2.5 py-0.5 text-xs font-medium text-accent">
                    <ShieldCheck className="h-3.5 w-3.5" />
                    {t.approvedOfficialBadge}
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 rounded-full bg-amber-100 px-2.5 py-0.5 text-xs font-medium text-amber-700">
                    <AlertTriangle className="h-3.5 w-3.5" />
                    {citation.source_status}
                  </span>
                )}
              </div>
              <div className="mt-1.5 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-ink-muted">
                {citation.publication_date && (
                  <span className="inline-flex items-center gap-1">
                    <Calendar className="h-3 w-3" /> Published: {citation.publication_date}
                  </span>
                )}
                {citation.effective_from && (
                  <span>Effective: {citation.effective_from}</span>
                )}
                {citation.retrieved_at && <span>Verified: {citation.retrieved_at}</span>}
              </div>
            </div>
          </div>

          {/* Verbatim Extracted Statutory Text */}
          <div>
            <div className="mb-2 flex items-center justify-between">
              <span className="text-xs font-semibold uppercase tracking-wide text-ink-muted">
                {t.verbatimTextLabel}
              </span>
              <span className="font-mono text-[11px] text-ink-muted">ID: {citation.chunk_id}</span>
            </div>
            <blockquote className="whitespace-pre-wrap rounded-lg border border-border-subtle bg-surface p-5 font-serif text-[15px] leading-relaxed text-ink shadow-sm">
              {citation.exact_passage}
            </blockquote>
          </div>

          {citation.version_label && (
            <p className="text-xs text-ink-muted">
              <strong className="font-medium text-ink">Version note:</strong> {citation.version_label}
            </p>
          )}
        </div>

        <div className="flex items-center justify-between gap-3 border-t border-border-subtle bg-canvas px-6 py-3.5">
          <span className="text-xs text-ink-muted">
            {t.sourceViewerEnglishNote}
          </span>
          <a
            href={citation.official_url}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex shrink-0 items-center gap-1.5 rounded-md bg-accent px-3.5 py-2 text-xs font-medium text-white transition-colors hover:bg-accent-hover"
          >
            <span>{t.openOfficialGovSource}</span>
            <ExternalLink className="h-3.5 w-3.5" />
          </a>
        </div>
      </div>
    </div>
  );
}
