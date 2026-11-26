"use client";

import React, { useEffect, useState } from "react";
import {
  Search,
  BookMarked,
  ShieldCheck,
  AlertTriangle,
  ExternalLink,
  BookOpen,
  Loader2,
  Ban,
} from "lucide-react";
import {
  CitationMetadata,
  PolicyLawMatch,
  PolicyProvisionMatch,
  PolicySearchResponse,
  SupportedLanguage,
} from "@/lib/types";
import { searchPolicies } from "@/lib/api";
import { UI_COPY } from "@/lib/i18n";

interface PolicyExplorerProps {
  language: SupportedLanguage;
  onOpenPassage: (citation: CitationMetadata) => void;
}

const AUTHORITY_LABELS: Record<string, string> = {
  central_legislation: "Central Act (Parliament)",
  central_rules: "Central Rules",
  central_regulations: "NCDRC Regulations",
  ccpa_guidelines: "CCPA Guidelines",
  gazette_notification: "Gazette Notification",
  official_portal_guidance: "Official Portal / Policy",
};

function provisionToCitation(
  law: PolicyLawMatch,
  prov: PolicyProvisionMatch
): CitationMetadata {
  return {
    chunk_id: prov.chunk_id,
    source_id: law.source_id,
    source_title: law.title,
    issuing_authority: law.issuing_authority,
    authority_type: law.authority_type,
    section: prov.section,
    subsection: prov.subsection,
    rule: prov.rule,
    paragraph: prov.paragraph,
    heading: prov.heading,
    page_start: prov.page_start,
    page_end: prov.page_end,
    publication_date: law.publication_date,
    effective_from: law.effective_from,
    retrieved_at: law.retrieved_at,
    version_label: law.version_label,
    source_status: law.status,
    official_url: law.official_url,
    exact_passage: prov.exact_passage,
  };
}

export function PolicyExplorer({ language, onOpenPassage }: PolicyExplorerProps) {
  const t = UI_COPY[language];
  const [query, setQuery] = useState("");
  const [result, setResult] = useState<PolicySearchResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const runSearch = async (q: string) => {
    setLoading(true);
    setError(null);
    try {
      const data = await searchPolicies(q, language);
      setResult(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to search policies.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    runSearch(query);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [language]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    runSearch(query);
  };

  return (
    <div className="space-y-5">
      {/* Search Bar & Topic Chips */}
      <div className="rounded-xl border border-border-subtle bg-surface p-6 shadow-sm space-y-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-accent">
            <BookMarked className="h-5 w-5" />
            <h2 className="font-serif text-lg font-semibold text-ink">
              {t.policySearchTitle}
            </h2>
          </div>
          <p className="text-xs leading-relaxed text-ink-muted">
            {t.policySearchSubtitle}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-2 sm:flex-row">
          <div className="relative flex-1">
            <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-muted" />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder={t.policySearchPlaceholder}
              className="w-full rounded-lg border border-border-subtle bg-canvas py-2.5 pl-10 pr-4 text-sm text-ink placeholder:text-ink-muted/75 focus:border-accent focus:bg-surface focus:outline-none"
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="inline-flex items-center justify-center gap-1.5 rounded-xl bg-accent px-5 py-2.5 text-xs font-semibold text-canvas transition-colors hover:bg-accent-hover disabled:opacity-50"
          >
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Search className="h-4 w-4" />}
            <span>{t.policySearchBtn}</span>
          </button>
          <button
            type="button"
            disabled={loading}
            onClick={() => {
              setQuery("");
              runSearch("");
            }}
            className="rounded-lg border border-border-subtle bg-canvas px-4 py-2.5 text-xs font-medium text-ink hover:bg-surface-muted"
          >
            {t.policyShowAllBtn}
          </button>
        </form>

        <div className="flex flex-wrap gap-1.5 pt-1">
          {t.policyTopics.map((topic) => (
            <button
              key={topic.label}
              type="button"
              disabled={loading}
              onClick={() => {
                setQuery(topic.query);
                runSearch(topic.query);
              }}
              className="rounded-full border border-border-subtle bg-canvas px-3 py-1 text-xs text-ink transition-colors hover:border-accent/40 hover:bg-accent-soft hover:text-accent"
            >
              {topic.label}
            </button>
          ))}
        </div>
      </div>

      {error && (
        <div className="rounded-lg border border-crimson-700/30 bg-crimson-100 px-4 py-3 text-xs text-crimson-700">
          {error}
        </div>
      )}

      {/* Out of Scope Guard for Policy Search */}
      {result && !result.in_scope && (
        <div className="rounded-xl border border-border-subtle bg-surface-muted/70 p-6 flex items-start gap-3">
          <Ban className="h-5 w-5 text-ink-muted shrink-0 mt-0.5" />
          <div className="space-y-1">
            <h3 className="font-serif text-base font-semibold text-ink">
              {t.statusLabels.out_of_scope}
            </h3>
            <p className="text-sm text-ink-muted">{result.out_of_scope_message}</p>
          </div>
        </div>
      )}

      {/* Results List Grouped by Act / Rules / Guidelines / Policy */}
      {result && result.in_scope && (
        <div className="space-y-4">
          <div className="flex items-center justify-between text-xs text-ink-muted px-1">
            <span>
              {result.total_laws_matched} official Indian consumer-protection laws/policies matched
              {result.query ? ` for “${result.query}”` : ""}
            </span>
          </div>

          {result.laws.length === 0 ? (
            <div className="rounded-xl border border-border-subtle bg-surface p-8 text-center text-sm text-ink-muted">
              {t.policyNoMatch}
            </div>
          ) : (
            <div className="space-y-4">
              {result.laws.map((law) => {
                const approved = law.status === "approved";
                return (
                  <article
                    key={law.source_id}
                    className="rounded-xl border border-border-subtle bg-surface p-5 shadow-sm space-y-4"
                  >
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <div className="space-y-1.5 flex-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="rounded bg-navy-soft px-2.5 py-0.5 text-[11px] font-semibold text-navy">
                            {AUTHORITY_LABELS[law.authority_type] || law.document_type}
                          </span>
                          {approved ? (
                            <span className="inline-flex items-center gap-1 rounded-full bg-accent-soft px-2.5 py-0.5 text-[11px] font-medium text-accent">
                              <ShieldCheck className="h-3 w-3" /> {t.approvedOfficialBadge}
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 rounded-full bg-amber-100 px-2.5 py-0.5 text-[11px] font-medium text-amber-700">
                              <AlertTriangle className="h-3 w-3" /> {law.status}
                            </span>
                          )}
                        </div>
                        <h3 className="font-serif text-base font-semibold text-ink">
                          {law.title}
                        </h3>
                        <div className="flex flex-wrap gap-x-3 gap-y-1 text-xs text-ink-muted">
                          <span>{law.issuing_authority}</span>
                          {law.publication_date && <span>· Published: {law.publication_date}</span>}
                          {law.effective_from && <span>· Effective: {law.effective_from}</span>}
                          <span>· {law.version_label}</span>
                        </div>
                        {law.notes && (
                          <p className="text-xs text-ink-muted italic">{law.notes}</p>
                        )}
                      </div>

                      <a
                        href={law.official_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex shrink-0 items-center gap-1.5 rounded-md border border-border-subtle bg-canvas px-3 py-1.5 text-xs font-medium text-accent hover:bg-accent-soft"
                      >
                        <span>{t.openOfficialGovSource}</span>
                        <ExternalLink className="h-3.5 w-3.5" />
                      </a>
                    </div>

                    {law.matching_provisions.length > 0 && (
                      <div className="border-t border-border-subtle pt-3 space-y-2">
                        <div className="text-[11px] font-semibold uppercase tracking-wide text-ink-muted">
                          {t.policyMatchedProvisions} ({law.matching_provisions.length})
                        </div>
                        <div className="grid grid-cols-1 gap-2.5 md:grid-cols-2">
                          {law.matching_provisions.map((prov) => {
                            const loc = prov.section
                              ? `Section ${prov.section}${prov.subsection || ""}`
                              : prov.rule
                              ? `Rule ${prov.rule}`
                              : prov.paragraph || prov.heading || prov.chunk_id;
                            return (
                              <button
                                key={prov.chunk_id}
                                type="button"
                                onClick={() => onOpenPassage(provisionToCitation(law, prov))}
                                className="rounded-lg border border-border-subtle bg-canvas p-3 text-left transition-colors hover:border-accent/40 hover:bg-accent-soft/35"
                              >
                                <div className="flex items-center justify-between gap-2 text-xs font-semibold text-accent">
                                  <span className="inline-flex items-center gap-1.5">
                                    <BookOpen className="h-3.5 w-3.5 shrink-0" />
                                    <span>{loc}</span>
                                  </span>
                                  {prov.page_start && (
                                    <span className="font-mono text-[10px] text-ink-muted">
                                      p.{prov.page_start}
                                    </span>
                                  )}
                                </div>
                                {prov.heading && (
                                  <div className="mt-1 text-[11px] font-medium text-ink truncate">
                                    {prov.heading}
                                  </div>
                                )}
                                <p className="mt-1 text-xs leading-relaxed text-ink-muted line-clamp-3">
                                  {prov.snippet}
                                </p>
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    )}
                  </article>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
