"use client";

import React, { useState } from "react";
import { CheckCircle2, AlertCircle, XCircle, ExternalLink, Flag } from "lucide-react";
import { CitationMetadata, ClaimItem, EvidenceCoverage } from "@/lib/types";
import { CitationChip } from "./CitationChip";
import { submitFeedback } from "@/lib/api";

interface EvidenceLedgerProps {
  requestId: string;
  claims: ClaimItem[];
  citationDetails: Record<string, CitationMetadata>;
  evidenceCoverage?: EvidenceCoverage | null;
  onOpenPassage: (chunkId: string) => void;
}

export function EvidenceLedger({
  requestId,
  claims,
  citationDetails,
  evidenceCoverage,
  onOpenPassage,
}: EvidenceLedgerProps) {
  const [flagged, setFlagged] = useState<Record<string, string>>({});

  if (!claims.length) {
    return (
      <div className="rounded-lg border border-border-subtle bg-surface p-6 text-sm text-ink-muted">
        No verified material legal claims were emitted for this response. Inspect the abstention or clarification notice for details.
      </div>
    );
  }

  const handleFeedback = async (
    chunkId: string,
    type: "wrong_citation" | "outdated_source" | "unsupported_answer"
  ) => {
    setFlagged((prev) => ({ ...prev, [chunkId]: type }));
    try {
      await submitFeedback({ request_id: requestId, chunk_id: chunkId, feedback_type: type });
    } catch {
      // non-blocking
    }
  };

  return (
    <div className="space-y-4">
      {evidenceCoverage && (
        <div className="flex flex-wrap items-center justify-between gap-2 rounded-lg border border-border-subtle bg-canvas px-4 py-3 text-xs text-ink-muted">
          <span>
            <strong className="font-semibold text-ink">Evidence Coverage:</strong>{" "}
            {evidenceCoverage.description}
          </span>
          <span className="rounded bg-surface px-2 py-0.5 font-mono text-[11px] text-ink border border-border-subtle">
            {evidenceCoverage.supported_claims}/{evidenceCoverage.total_claims} claims cited
          </span>
        </div>
      )}

      <div className="space-y-3">
        {claims.map((claim, idx) => {
          const primaryMeta = claim.citations[0] ? citationDetails[claim.citations[0]] : undefined;

          return (
            <div
              key={claim.claim_id || idx}
              className="rounded-lg border border-border-subtle bg-surface p-4 shadow-sm"
            >
              <div className="flex flex-wrap items-start justify-between gap-2">
                <div className="flex items-center gap-2">
                  <span className="rounded bg-surface-muted px-2 py-0.5 font-mono text-[11px] font-semibold text-ink">
                    Claim {idx + 1}
                  </span>
                  {claim.evidence_status === "supported" && (
                    <span className="inline-flex items-center gap-1 rounded-full bg-accent-soft px-2.5 py-0.5 text-xs font-medium text-accent">
                      <CheckCircle2 className="h-3.5 w-3.5" /> Supported
                    </span>
                  )}
                  {claim.evidence_status === "partial" && (
                    <span className="inline-flex items-center gap-1 rounded-full bg-amber-100 px-2.5 py-0.5 text-xs font-medium text-amber-700">
                      <AlertCircle className="h-3.5 w-3.5" /> Partial
                    </span>
                  )}
                  {claim.evidence_status === "unsupported" && (
                    <span className="inline-flex items-center gap-1 rounded-full bg-crimson-100 px-2.5 py-0.5 text-xs font-medium text-crimson-700">
                      <XCircle className="h-3.5 w-3.5" /> Unsupported
                    </span>
                  )}
                </div>

                {primaryMeta && (
                  <button
                    type="button"
                    onClick={() => onOpenPassage(primaryMeta.chunk_id)}
                    className="inline-flex items-center gap-1 text-xs font-semibold text-accent hover:underline"
                  >
                    <span>Open exact passage</span>
                    <ExternalLink className="h-3 w-3" />
                  </button>
                )}
              </div>

              <p className="mt-2.5 text-sm leading-relaxed text-ink">{claim.text}</p>

              {claim.citations.length > 0 && (
                <div className="mt-3 space-y-2 border-t border-border-subtle pt-3">
                  <div className="flex flex-wrap gap-1.5">
                    {claim.citations.map((cid) => (
                      <CitationChip
                        key={cid}
                        chunkId={cid}
                        meta={citationDetails[cid]}
                        onOpen={onOpenPassage}
                      />
                    ))}
                  </div>

                  {primaryMeta && (
                    <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-ink-muted">
                      <div>
                        <span className="font-medium text-ink">{primaryMeta.source_title}</span>
                        {" · "}
                        <span>{primaryMeta.issuing_authority}</span>
                        {primaryMeta.effective_from && (
                          <span> · Effective {primaryMeta.effective_from}</span>
                        )}
                        {primaryMeta.publication_date && !primaryMeta.effective_from && (
                          <span> · Published {primaryMeta.publication_date}</span>
                        )}
                      </div>

                      <div className="flex items-center gap-2">
                        <Flag className="h-3 w-3 text-ink-muted" />
                        {flagged[primaryMeta.chunk_id] ? (
                          <span className="text-[11px] font-medium text-accent">
                            Feedback logged ({flagged[primaryMeta.chunk_id].replace("_", " ")})
                          </span>
                        ) : (
                          <>
                            <button
                              type="button"
                              onClick={() => handleFeedback(primaryMeta.chunk_id, "wrong_citation")}
                              className="text-[11px] hover:text-ink underline"
                            >
                              Wrong citation
                            </button>
                            <button
                              type="button"
                              onClick={() => handleFeedback(primaryMeta.chunk_id, "outdated_source")}
                              className="text-[11px] hover:text-ink underline"
                            >
                              Outdated
                            </button>
                          </>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
