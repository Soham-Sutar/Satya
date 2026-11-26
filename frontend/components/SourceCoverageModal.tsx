"use client";

import React from "react";
import { X, ShieldCheck, AlertTriangle, ExternalLink, Database } from "lucide-react";
import { CoverageResponse, SourceManifestRecord } from "@/lib/types";

interface SourceCoverageModalProps {
  open: boolean;
  onClose: () => void;
  coverage: CoverageResponse | null;
  sources: SourceManifestRecord[];
}

export function SourceCoverageModal({
  open,
  onClose,
  coverage,
  sources,
}: SourceCoverageModalProps) {
  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-ink/35 p-4 backdrop-blur-[1px]"
      role="dialog"
      aria-modal="true"
      aria-label="Approved Official Source Coverage"
      onClick={onClose}
    >
      <div
        className="flex max-h-[88vh] w-full max-w-4xl flex-col rounded-xl border border-border-subtle bg-surface shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between border-b border-border-subtle bg-canvas px-6 py-4 rounded-t-2xl">
          <div className="flex items-center gap-2.5">
            <Database className="h-5 w-5 text-accent" />
            <div>
              <h2 className="font-serif text-lg font-semibold text-ink">
                Official Source Coverage & Freshness Ledger
              </h2>
              <p className="text-xs text-ink-muted">
                Domain: Indian Consumer Rights & Protection only ({coverage?.approved_source_count || 0} approved official sources · {coverage?.total_chunk_count || 0} indexed sections/rules)
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg border border-border-subtle bg-surface p-1.5 text-ink-muted hover:bg-surface-muted hover:text-ink"
            aria-label="Close source coverage modal"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-6 py-5 space-y-6">
          {coverage && (
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div className="rounded-lg border border-border-subtle bg-canvas p-4">
                <h3 className="text-xs font-semibold uppercase tracking-wide text-accent">
                  Supported Topics (In Scope)
                </h3>
                <ul className="mt-2 space-y-1.5 text-xs text-ink">
                  {coverage.supported_topics.map((t, i) => (
                    <li key={i} className="flex items-start gap-1.5">
                      <span className="mt-1 h-1.5 w-1.5 rounded-full bg-accent shrink-0" />
                      <span>{t}</span>
                    </li>
                  ))}
                </ul>
              </div>
              <div className="rounded-lg border border-border-subtle bg-canvas p-4 space-y-4">
                <div>
                  <h3 className="text-xs font-semibold uppercase tracking-wide text-crimson-700">
                    Declined Topics (Out of Scope)
                  </h3>
                  <ul className="mt-2 space-y-1 text-xs text-ink-muted">
                    {coverage.out_of_scope_examples.map((t, i) => (
                      <li key={i}>• {t}</li>
                    ))}
                  </ul>
                </div>
                <div>
                  <h3 className="text-xs font-semibold uppercase tracking-wide text-amber-700">
                    Known Prototype Limitations
                  </h3>
                  <ul className="mt-2 space-y-1 text-xs text-ink-muted">
                    {coverage.known_limitations.map((t, i) => (
                      <li key={i}>• {t}</li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          )}

          <div>
            <h3 className="mb-3 text-xs font-semibold uppercase tracking-wide text-ink-muted">
              Curated Official Source Manifest ({sources.length} documents)
            </h3>
            <div className="divide-y divide-border-subtle rounded-lg border border-border-subtle bg-surface">
              {sources.map((src) => {
                const approved = src.status === "approved";
                return (
                  <div key={src.source_id} className="p-4 flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                    <div className="space-y-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="font-medium text-sm text-ink">{src.title}</span>
                        {approved ? (
                          <span className="inline-flex items-center gap-1 rounded-full bg-accent-soft px-2 py-0.5 text-[11px] font-medium text-accent">
                            <ShieldCheck className="h-3 w-3" /> Approved
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 rounded-full bg-amber-100 px-2 py-0.5 text-[11px] font-medium text-amber-700">
                            <AlertTriangle className="h-3 w-3" /> {src.status}
                          </span>
                        )}
                      </div>
                      <div className="text-xs text-ink-muted">
                        {src.issuing_authority} · {src.version_label}
                      </div>
                      <div className="flex flex-wrap gap-3 text-[11px] text-ink-muted">
                        {src.publication_date && <span>Published: {src.publication_date}</span>}
                        {src.effective_from && <span>Effective: {src.effective_from}</span>}
                        <span>Retrieved: {src.retrieved_at}</span>
                      </div>
                      {src.notes && <p className="text-[11px] text-ink-muted italic">{src.notes}</p>}
                    </div>
                    <a
                      href={src.official_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex shrink-0 items-center gap-1 rounded border border-border-subtle px-2.5 py-1 text-xs font-medium text-accent hover:bg-accent-soft"
                    >
                      <span>Official link</span>
                      <ExternalLink className="h-3 w-3" />
                    </a>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
