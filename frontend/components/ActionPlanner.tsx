"use client";

import React, { useState } from "react";
import {
  CheckSquare,
  Square,
  Copy,
  Check,
  Scale,
  Lightbulb,
  UserCheck,
  FileEdit,
} from "lucide-react";
import { ActionPlanItem, ActionPlanKind, CitationMetadata, SupportedLanguage } from "@/lib/types";
import { CitationChip, formatShortLocator } from "./CitationChip";
import { UI_COPY } from "@/lib/i18n";

interface ActionPlannerProps {
  actionPlan: ActionPlanItem[];
  citationDetails: Record<string, CitationMetadata>;
  language?: SupportedLanguage;
  onOpenPassage: (chunkId: string) => void;
  userQuestion?: string;
}

const KIND_META: Record<
  ActionPlanKind,
  { label: string; badgeClass: string; icon: React.ReactNode }
> = {
  legal_requirement: {
    label: "Law / Statutory Provision",
    badgeClass: "bg-accent-soft text-accent border border-accent/25",
    icon: <Scale className="h-3 w-3" />,
  },
  conditional_requirement: {
    label: "Conditional Requirement",
    badgeClass: "bg-navy-soft text-navy border border-navy/25",
    icon: <Scale className="h-3 w-3" />,
  },
  practical_suggestion: {
    label: "Practical Suggestion (Advice)",
    badgeClass: "bg-amber-100 text-amber-700 border border-amber-700/25",
    icon: <Lightbulb className="h-3 w-3" />,
  },
  professional_confirmation: {
    label: "Confirm with Authority / Advocate",
    badgeClass: "bg-surface-muted text-ink-muted border border-border-subtle",
    icon: <UserCheck className="h-3 w-3" />,
  },
};

const READINESS_ITEMS = [
  { id: "parties", label: "Opposite party details (seller/brand/platform legal name & contact)" },
  { id: "invoice", label: "Invoice, order ID, or payment receipt (avoid uploading full card numbers)" },
  { id: "chronology", label: "Date of purchase, delivery, and when defect/deficiency appeared" },
  { id: "amount", label: "Exact consideration paid (determines Consumer Commission pecuniary tier)" },
  { id: "evidence", label: "Photos/videos of defect or written service failure communications" },
  { id: "attempts", label: "Copies of prior emails/tickets to seller, Grievance Officer, or NCH (1915)" },
];

export function ActionPlanner({
  actionPlan,
  citationDetails,
  language = "en",
  onOpenPassage,
  userQuestion,
}: ActionPlannerProps) {
  const t = UI_COPY[language];
  const [checked, setChecked] = useState<Record<string, boolean>>({});
  const [copied, setCopied] = useState(false);
  const [showDraft, setShowDraft] = useState(false);
  const [draftPlatform, setDraftPlatform] = useState("");
  const [draftDate, setDraftDate] = useState("");
  const [draftAmount, setDraftAmount] = useState("");
  const [draftRelief, setDraftRelief] = useState("Repair / Replacement / Refund as applicable");

  const toggle = (id: string) => setChecked((prev) => ({ ...prev, [id]: !prev[id] }));
  const completedCount = READINESS_ITEMS.filter((i) => checked[i.id]).length;

  const handleCopy = async () => {
    const lines = [
      "SATYA — CONSUMER ACTION PLAN (Indian Consumer Rights & Protection)",
      userQuestion ? `Query: ${userQuestion}` : "",
      "",
      ...actionPlan.map((step, i) => {
        const kindLabel = KIND_META[step.kind].label;
        const cites = step.citations
          .map((cid) => `[${formatShortLocator(cid, citationDetails[cid])}]`)
          .join(" ");
        return `${i + 1}. [${kindLabel}] ${step.text} ${cites}`.trim();
      }),
      "",
      "Disclaimer: Legal information grounded in official Indian consumer-protection sources; not formal legal advice or a guarantee of outcome.",
    ];
    try {
      await navigator.clipboard.writeText(lines.filter(Boolean).join("\n"));
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // ignore clipboard errors
    }
  };

  return (
    <div className="space-y-5">
      {/* Action Plan Steps */}
      <div className="space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div>
            <h3 className="font-serif text-base font-semibold text-ink">
              {t.actionPlanTitle}
            </h3>
            <p className="text-xs text-ink-muted">
              {t.actionPlanSubtitle}
            </p>
          </div>
          {actionPlan.length > 0 && (
            <button
              type="button"
              onClick={handleCopy}
              className="inline-flex items-center gap-1.5 rounded-lg border border-border-subtle bg-canvas px-3 py-1.5 text-xs font-medium text-ink transition-colors hover:border-accent/40 hover:bg-accent-soft hover:text-accent"
            >
              {copied ? <Check className="h-3.5 w-3.5 text-accent" /> : <Copy className="h-3.5 w-3.5" />}
              <span>{copied ? t.copiedPlanBtn : t.copyPlanBtn}</span>
            </button>
          )}
        </div>

        {actionPlan.length === 0 ? (
          <div className="rounded-xl border border-border-subtle bg-canvas/75 p-5 text-xs leading-relaxed text-ink-muted">
            {t.emptyRightDescPlanner}
          </div>
        ) : (
          <ol className="space-y-2.5">
            {actionPlan.map((step, idx) => {
              const km = KIND_META[step.kind];
              return (
                <li
                  key={idx}
                  className="rounded-xl border border-border-subtle bg-canvas/60 p-4 transition-colors hover:border-sage"
                >
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <span
                      className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[11px] font-semibold ${km.badgeClass}`}
                    >
                      {km.icon}
                      <span>{t.actionKinds[step.kind]}</span>
                    </span>
                    <span className="font-mono text-[11px] text-ink-muted">Step {idx + 1}</span>
                  </div>
                  <p className="mt-2 text-sm leading-relaxed text-ink">{step.text}</p>
                  {step.citations.length > 0 && (
                    <div className="mt-2.5 flex flex-wrap gap-1.5">
                      {step.citations.map((cid) => (
                        <CitationChip
                          key={cid}
                          chunkId={cid}
                          meta={citationDetails[cid]}
                          onOpen={onOpenPassage}
                        />
                      ))}
                    </div>
                  )}
                </li>
              );
            })}
          </ol>
        )}
      </div>

      {/* Complaint Readiness Checker (Non-adjudicative) */}
      <div className="rounded-xl border border-border-subtle bg-canvas p-4 space-y-3.5">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div>
            <h4 className="font-serif text-sm font-semibold text-ink">
              {t.readinessTitle}
            </h4>
            <p className="text-xs text-ink-muted">
              {t.readinessSubtitle}
            </p>
          </div>
          <span className="rounded-full border border-accent/25 bg-accent-soft px-2.5 py-0.5 text-xs font-semibold text-accent">
            {completedCount}/{READINESS_ITEMS.length} ready
          </span>
        </div>

        <ul className="space-y-1.5">
          {READINESS_ITEMS.map((item) => {
            const isDone = !!checked[item.id];
            return (
              <li key={item.id}>
                <button
                  type="button"
                  onClick={() => toggle(item.id)}
                  className="flex w-full items-start gap-2.5 rounded-lg border border-border-subtle bg-surface px-3 py-2 text-left text-xs transition-colors hover:border-sage"
                >
                  {isDone ? (
                    <CheckSquare className="mt-0.5 h-4 w-4 shrink-0 text-accent" />
                  ) : (
                    <Square className="mt-0.5 h-4 w-4 shrink-0 text-sage" />
                  )}
                  <span className={isDone ? "text-ink-muted line-through" : "text-ink"}>
                    {item.label}
                  </span>
                </button>
              </li>
            );
          })}
        </ul>

        {/* Neutral Draft Complaint Summary */}
        <div className="border-t border-border-subtle pt-3">
          <button
            type="button"
            onClick={() => setShowDraft((v) => !v)}
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-accent hover:underline"
          >
            <FileEdit className="h-3.5 w-3.5" />
            <span>
              {showDraft ? t.draftToggleHide : t.draftToggleShow}
            </span>
          </button>

          {showDraft && (
            <div className="mt-3 space-y-3 rounded-xl border border-border-subtle bg-surface p-4 text-xs animate-satya-in">
              <div className="rounded-lg bg-amber-100 px-3 py-2 text-[11px] text-amber-700">
                <strong>Draft Notice:</strong> This neutral summary is for your own review and offline editing. Satya never submits complaints automatically and this draft is not legal advice. Do not enter OTPs, passwords, Aadhaar, or full card numbers.
              </div>
              <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
                <input
                  type="text"
                  value={draftPlatform}
                  onChange={(e) => setDraftPlatform(e.target.value)}
                  placeholder="Seller / Platform name"
                  className="rounded-lg border border-border-subtle bg-canvas px-2.5 py-1.5 text-xs text-ink focus:border-accent focus:outline-none"
                />
                <input
                  type="text"
                  value={draftDate}
                  onChange={(e) => setDraftDate(e.target.value)}
                  placeholder="Purchase / Issue date"
                  className="rounded-lg border border-border-subtle bg-canvas px-2.5 py-1.5 text-xs text-ink focus:border-accent focus:outline-none"
                />
                <input
                  type="text"
                  value={draftAmount}
                  onChange={(e) => setDraftAmount(e.target.value)}
                  placeholder="Amount paid (₹)"
                  className="rounded-lg border border-border-subtle bg-canvas px-2.5 py-1.5 text-xs text-ink focus:border-accent focus:outline-none"
                />
              </div>
              <input
                type="text"
                value={draftRelief}
                onChange={(e) => setDraftRelief(e.target.value)}
                placeholder="Requested resolution"
                className="w-full rounded-lg border border-border-subtle bg-canvas px-2.5 py-1.5 text-xs text-ink focus:border-accent focus:outline-none"
              />
              <pre className="whitespace-pre-wrap rounded-lg border border-border-subtle bg-canvas p-3 font-sans text-xs leading-relaxed text-ink">
{`DRAFT CONSUMER GRIEVANCE SUMMARY (FOR USER REVIEW ONLY)
Opposite Party / Seller / Platform: ${draftPlatform || "[Seller / Service Provider Name]"}
Date of Transaction / Cause of Action: ${draftDate || "[Date]"}
Consideration Paid: ${draftAmount ? `₹${draftAmount}` : "[Amount in ₹]"}
Issue Summary: ${userQuestion || "[Describe defect in goods or deficiency in service chronologically]"}
Prior Resolution Attempts: [List ticket numbers / dates sent to Seller Grievance Officer / NCH 1915]
Resolution Requested for Consideration: ${draftRelief}
Supporting Records Attached: Invoice/receipt, communications, photos/videos of defect.`}
              </pre>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
