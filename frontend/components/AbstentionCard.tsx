"use client";

import React from "react";
import { ShieldAlert, HelpCircle, Ban, ExternalLink } from "lucide-react";
import { AbstentionDetail, AnswerStatus, SupportedLanguage } from "@/lib/types";

interface AbstentionCardProps {
  status: AnswerStatus;
  detail: AbstentionDetail;
  language?: SupportedLanguage;
}

const CARD_COPY: Record<
  SupportedLanguage,
  {
    clarificationTitle: string;
    outOfScopeTitle: string;
    cannotVerifyTitle: string;
    foundLabel: string;
    missingLabel: string;
    nextStepLabel: string;
    verifyPortalLabel: string;
  }
> = {
  en: {
    clarificationTitle: "Clarification Needed Before Answering",
    outOfScopeTitle: "Outside Satya’s Consumer-Protection Scope",
    cannotVerifyTitle: "Why Satya Won’t Answer",
    foundLabel: "What Was Found",
    missingLabel: "What Is Missing or Uncertain",
    nextStepLabel: "Next step:",
    verifyPortalLabel: "Verify on official portal",
  },
  kn: {
    clarificationTitle: "ಉತ್ತರಿಸುವ ಮೊದಲು ಸ್ಪಷ್ಟೀಕರಣದ ಅಗತ್ಯವಿದೆ",
    outOfScopeTitle: "ಸತ್ಯದ ಗ್ರಾಹಕ-ರಕ್ಷಣಾ ವ್ಯಾಪ್ತಿಯ ಹೊರಗಿದೆ",
    cannotVerifyTitle: "ಸತ್ಯ ಏಕೆ ಉತ್ತರಿಸುವುದಿಲ್ಲ",
    foundLabel: "ಏನು ಕಂಡುಬಂದಿದೆ",
    missingLabel: "ಏನು ಕೊರತೆಯಿದೆ ಅಥವಾ ಅನಿಶ್ಚಿತವಾಗಿದೆ",
    nextStepLabel: "ಮುಂದಿನ ಹಂತ:",
    verifyPortalLabel: "ಅಧಿಕೃತ ಪೋರ್ಟಲ್‌ನಲ್ಲಿ ಪರಿಶೀಲಿಸಿ",
  },
  hi: {
    clarificationTitle: "उत्तर देने से पहले स्पष्टीकरण आवश्यक है",
    outOfScopeTitle: "सत्य के उपभोक्ता-संरक्षण दायरे से बाहर",
    cannotVerifyTitle: "सत्य उत्तर क्यों नहीं दे सकता",
    foundLabel: "क्या पाया गया",
    missingLabel: "क्या गायब या अनिश्चित है",
    nextStepLabel: "अगला कदम:",
    verifyPortalLabel: "आधिकारिक पोर्टल पर सत्यापित करें",
  },
};

export function AbstentionCard({
  status,
  detail,
  language = "en",
}: AbstentionCardProps) {
  const isClarification = status === "needs_clarification";
  const isOutOfScope = status === "out_of_scope";
  const c = CARD_COPY[language];

  const title = isClarification
    ? c.clarificationTitle
    : isOutOfScope
    ? c.outOfScopeTitle
    : c.cannotVerifyTitle;

  const borderClass = isClarification
    ? "border-navy/30 bg-navy-soft/45"
    : isOutOfScope
    ? "border-border-subtle bg-surface-muted/70"
    : "border-crimson-700/30 bg-crimson-100/50";

  const icon = isClarification ? (
    <HelpCircle className="h-5 w-5 text-navy shrink-0" />
  ) : isOutOfScope ? (
    <Ban className="h-5 w-5 text-ink-muted shrink-0" />
  ) : (
    <ShieldAlert className="h-5 w-5 text-crimson-700 shrink-0" />
  );

  return (
    <div className={`rounded-lg border p-5 ${borderClass}`}>
      <div className="flex items-start gap-3">
        {icon}
        <div className="space-y-3 flex-1">
          <div>
            <h3 className="font-serif text-base font-semibold text-ink">{title}</h3>
            <p className="mt-1 text-sm text-ink">{detail.summary}</p>
          </div>

          <dl className="grid grid-cols-1 gap-3 rounded-md border border-border-subtle bg-surface p-3.5 text-xs sm:grid-cols-2">
            <div>
              <dt className="font-semibold uppercase tracking-wide text-ink-muted">
                {c.foundLabel}
              </dt>
              <dd className="mt-1 text-ink leading-relaxed">{detail.what_was_found}</dd>
            </div>
            <div>
              <dt className="font-semibold uppercase tracking-wide text-ink-muted">
                {c.missingLabel}
              </dt>
              <dd className="mt-1 text-ink leading-relaxed">{detail.what_is_missing}</dd>
            </div>
          </dl>

          <div className="flex flex-wrap items-center justify-between gap-3 pt-1 text-xs">
            <p className="text-ink-muted">
              <strong className="font-semibold text-ink">{c.nextStepLabel}</strong>{" "}
              {detail.suggested_next_step}
            </p>
            {detail.official_verification_url && (
              <a
                href={detail.official_verification_url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 font-medium text-accent hover:underline"
              >
                <span>{c.verifyPortalLabel}</span>
                <ExternalLink className="h-3 w-3" />
              </a>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
