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
} from "lucide-react";
import {
  ChatTurn,
  CitationMetadata,
  CoverageResponse,
  SessionContext,
  SourceManifestRecord,
} from "@/lib/types";
import { fetchCoverage, fetchSources, sendChatMessage } from "@/lib/api";
import { ChatPanel, ConversationEntry } from "@/components/ChatPanel";
import { EvidenceLedger } from "@/components/EvidenceLedger";
import { ActionPlanner } from "@/components/ActionPlanner";
import { SourceViewer } from "@/components/SourceViewer";
import { SourceCoverageModal } from "@/components/SourceCoverageModal";

export default function SatyaHomePage() {
  const [entries, setEntries] = useState<ConversationEntry[]>([]);
  const [selectedEntryId, setSelectedEntryId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<"ledger" | "planner">("ledger");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [viewerCitation, setViewerCitation] = useState<CitationMetadata | null>(null);
  const [coverageOpen, setCoverageOpen] = useState(false);
  const [coverage, setCoverage] = useState<CoverageResponse | null>(null);
  const [sources, setSources] = useState<SourceManifestRecord[]>([]);

  useEffect(() => {
    fetchCoverage().then(setCoverage).catch(() => {});
    fetchSources().then(setSources).catch(() => {});
  }, []);

  const handleSend = async (
    message: string,
    sessionContext: SessionContext,
    history: ChatTurn[]
  ) => {
    setLoading(true);
    setError(null);
    try {
      const response = await sendChatMessage(message, sessionContext, history);
      const id = response.request_id || String(Date.now());
      const newEntry: ConversationEntry = { id, question: message, response };
      setEntries((prev) => [newEntry, ...prev]);
      setSelectedEntryId(id);
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
    entries.find((e) => e.id === selectedEntryId) || entries[0] || null;

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
        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-4 px-4 py-3.5 sm:px-6">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-accent text-white shadow-sm">
              <Scale className="h-5 w-5" />
            </div>
            <div>
              <div className="flex items-center gap-2.5">
                <h1 className="font-serif text-xl font-bold tracking-tight text-ink">
                  Satya
                </h1>
                <span className="inline-flex items-center gap-1 rounded-full border border-accent/25 bg-accent-soft px-2.5 py-0.5 text-[11px] font-semibold text-accent">
                  <ShieldCheck className="h-3 w-3" />
                  Indian Consumer Rights & Protection
                </span>
              </div>
              <p className="text-xs text-ink-muted">
                Know your consumer rights. See the law. Take the next step.
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            <a
              href="https://consumerhelpline.gov.in/public/"
              target="_blank"
              rel="noopener noreferrer"
              className="hidden sm:inline-flex items-center gap-1.5 rounded-md border border-border-subtle bg-canvas px-3 py-1.5 text-xs font-medium text-ink hover:bg-surface-muted"
            >
              <PhoneCall className="h-3.5 w-3.5 text-accent" />
              <span>NCH 1915</span>
              <ExternalLink className="h-3 w-3 text-ink-muted" />
            </a>
            <a
              href="https://e-jagriti.gov.in/"
              target="_blank"
              rel="noopener noreferrer"
              className="hidden sm:inline-flex items-center gap-1.5 rounded-md border border-border-subtle bg-canvas px-3 py-1.5 text-xs font-medium text-ink hover:bg-surface-muted"
            >
              <span>e-Jagriti Filing</span>
              <ExternalLink className="h-3 w-3 text-ink-muted" />
            </a>
            <button
              type="button"
              onClick={() => setCoverageOpen(true)}
              className="inline-flex items-center gap-1.5 rounded-md border border-accent/30 bg-accent-soft px-3 py-1.5 text-xs font-semibold text-accent hover:bg-accent hover:text-white transition-colors"
            >
              <Database className="h-3.5 w-3.5" />
              <span>
                Official Sources ({coverage ? coverage.approved_source_count : "13"})
              </span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Two-Column Legal-Tech Workspace */}
      <main className="mx-auto w-full max-w-7xl flex-1 px-4 py-6 sm:px-6">
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-12 items-start">
          {/* Left Column: Consumer Query & Grounded Response */}
          <section className="lg:col-span-7" aria-label="Consumer Rights Consultation">
            <ChatPanel
              entries={entries}
              selectedEntryId={selectedEntry?.id || null}
              onSelectEntry={setSelectedEntryId}
              onSend={handleSend}
              loading={loading}
              error={error}
              onOpenPassage={handleOpenPassage}
            />
          </section>

          {/* Right Column: Evidence Ledger & Action Planner */}
          <aside
            className="lg:col-span-5 lg:sticky lg:top-20 rounded-xl border border-border-subtle bg-surface shadow-sm overflow-hidden"
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
                  Evidence Ledger
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
                  Action Planner
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
                      ? "Claim-by-Claim Evidence Verification"
                      : "Consumer Action Planner & Readiness"}
                  </p>
                  <p className="leading-relaxed">
                    {activeTab === "ledger"
                      ? "Ask a question to inspect each legal or procedural claim alongside its exact statutory section, rule, page number, and clickable official passage."
                      : "Once Satya retrieves approved consumer-protection evidence, it generates a step-by-step Action Plan separating statutory obligations from practical evidence-preservation tips."}
                  </p>
                  <div className="rounded-lg border border-border-subtle bg-canvas p-4 space-y-1.5">
                    <div className="font-semibold text-ink">Core Verification Promise</div>
                    <p>
                      “Satya does not measure success by how many questions it answers. It measures success by how many answers it can prove.”
                    </p>
                  </div>
                </div>
              ) : activeTab === "ledger" ? (
                <EvidenceLedger
                  requestId={selectedEntry.response.request_id}
                  claims={selectedEntry.response.claims}
                  citationDetails={selectedEntry.response.citation_details}
                  evidenceCoverage={selectedEntry.response.evidence_coverage}
                  onOpenPassage={(cid) =>
                    handleOpenPassage(cid, selectedEntry.response.citation_details)
                  }
                />
              ) : (
                <ActionPlanner
                  actionPlan={selectedEntry.response.action_plan}
                  citationDetails={selectedEntry.response.citation_details}
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
        <div className="mx-auto flex max-w-7xl flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
          <p>
            <strong className="font-semibold text-ink">Disclaimer:</strong> Satya provides source-grounded legal information strictly for{" "}
            <strong className="font-medium text-ink">Indian Consumer Rights & Protection</strong>. It is not formal legal advice, representation, or a guarantee of refund, replacement, or compensation.
          </p>
          <p className="shrink-0">
            Use synthetic scenarios · Never share OTPs, passwords, or Aadhaar/card details.
          </p>
        </div>
      </footer>

      {/* Exact Passage Source Viewer Drawer */}
      <SourceViewer
        citation={viewerCitation}
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
