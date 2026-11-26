"use client";

import React from "react";
import { BookOpen } from "lucide-react";
import { CitationMetadata } from "@/lib/types";

interface CitationChipProps {
  chunkId: string;
  meta?: CitationMetadata;
  onOpen: (chunkId: string) => void;
}

export function formatShortLocator(chunkId: string, meta?: CitationMetadata): string {
  if (!meta) return chunkId;
  let shortTitle = meta.source_title;
  if (meta.source_id === "consumer_protection_act_2019") shortTitle = "CPA 2019";
  else if (meta.source_id === "ecommerce_rules_2020") shortTitle = "E-Commerce Rules 2020";
  else if (meta.source_id === "ecommerce_amendment_rules_2021") shortTitle = "E-Commerce Amend. 2021";
  else if (meta.source_id === "jurisdiction_rules_2021") shortTitle = "Jurisdiction Rules 2021";
  else if (meta.source_id === "cdrc_amendment_rules_2023") shortTitle = "CDRC Amend. Rules 2023";
  else if (meta.source_id === "cdrc_rules_2020") shortTitle = "CDRC Rules 2020";
  else if (meta.source_id === "mediation_rules_2020") shortTitle = "Mediation Rules 2020";
  else if (meta.source_id === "commission_procedure_regulations_2020") shortTitle = "Procedure Reg. 2020";
  else if (meta.source_id === "ccpa_misleading_ads_guidelines_2022") shortTitle = "CCPA Ads Guidelines 2022";
  else if (meta.source_id === "ccpa_dark_patterns_guidelines_2023") shortTitle = "Dark Patterns Guidelines 2023";
  else if (meta.source_id === "doca_citizen_charter_2025_26") shortTitle = "DoCA Citizen Charter";
  else if (meta.source_id === "nch_official_portal") shortTitle = "NCH Portal";

  const loc = meta.section
    ? `§${meta.section}${meta.subsection || ""}`
    : meta.rule
    ? `Rule ${meta.rule}`
    : meta.paragraph
    ? meta.paragraph
    : "Passage";

  const pg = meta.page_start ? `, p.${meta.page_start}` : "";
  return `${shortTitle} · ${loc}${pg}`;
}

export function CitationChip({ chunkId, meta, onOpen }: CitationChipProps) {
  return (
    <button
      type="button"
      onClick={(e) => {
        e.stopPropagation();
        onOpen(chunkId);
      }}
      className="inline-flex items-center gap-1.5 rounded-md border border-accent/25 bg-accent-soft px-2 py-0.5 text-[11px] font-medium text-accent transition-all duration-150 hover:border-accent hover:bg-accent hover:text-canvas active:scale-[0.98]"
      title={`Inspect official passage: ${meta?.heading || chunkId}`}
    >
      <BookOpen className="h-3 w-3 shrink-0" />
      <span>{formatShortLocator(chunkId, meta)}</span>
    </button>
  );
}
