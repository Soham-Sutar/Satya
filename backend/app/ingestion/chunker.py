"""
Structural chunker for Indian consumer-protection legislation, rules, regulations,
guidelines, and official portal pages.
Preserves exact section/subsection/rule/regulation/heading and page locators.
"""
from __future__ import annotations

import re
from pathlib import Path
from typing import Dict, List, Optional

import pymupdf
from bs4 import BeautifulSoup

from app.models.schemas import ChunkRecord, SourceManifestRecord

# Gazette running-header lines to strip without altering substantive statutory text
RUNNING_HEADER_PATTERNS = [
    re.compile(r"^\d+\s*$"),
    re.compile(r"^THE GAZETTE OF INDIA\s*:?\s*EXTRAORDINARY.*$", re.I),
    re.compile(r"^\[PART\s+[IVX]+—.*$", re.I),
    re.compile(r"^SEC\.\s*\d+\]\s*THE GAZETTE OF INDIA.*$", re.I),
    re.compile(r"^\[भाग\s*.*भारत का राजपत्र.*$", re.I),
    re.compile(r"^भारत का राजपत्र.*$", re.I),
]


def _is_devanagari_line(line: str) -> bool:
    dev_chars = sum(1 for ch in line if "\u0900" <= ch <= "\u097f")
    return dev_chars > max(3, len(line) * 0.25)


def _clean_lines(raw_text: str, strip_hindi: bool = True) -> str:
    lines: List[str] = []
    for ln in raw_text.replace("\r\n", "\n").replace("\r", "\n").split("\n"):
        s = re.sub(r"[ \t]+", " ", ln).strip()
        if not s:
            continue
        if any(pat.match(s) for pat in RUNNING_HEADER_PATTERNS):
            continue
        if strip_hindi and _is_devanagari_line(s):
            continue
        lines.append(s)
    return "\n".join(lines)


def _infer_topic_tags(text: str, default_tags: List[str]) -> List[str]:
    low = text.lower()
    tags = set()
    rules = [
        ("defective_goods", ["defect", "defective", "goods", "spurious", "hazardous", "sample", "laboratory"]),
        ("deficiency_in_service", ["deficiency", "service", "negligence", "imperfection", "shortcoming"]),
        ("unfair_trade_practice", ["unfair trade practice", "unfair contract", "restrictive trade"]),
        ("misleading_advertisement", ["misleading advertisement", "endorser", "bait advertisement", "surrogate", "advertisement"]),
        ("ecommerce_grievance", ["e-commerce", "ecommerce", "electronic commerce", "marketplace", "grievance officer", "dark pattern"]),
        ("product_liability", ["product liability", "product manufacturer", "product seller", "product service provider", "harm"]),
        ("consumer_status_and_rights", ['"consumer"', "consumer rights", "commercial purpose", "livelihood", "self-employment"]),
        ("refund_replacement_repair", ["refund", "replace", "replacement", "return the price", "remove the defect", "compensation"]),
        ("consumer_commission_filing", ["complaint", "district commission", "state commission", "national commission", "fee", "appeal", "e-jagriti"]),
        ("jurisdiction_and_limitation", ["jurisdiction", "limitation", "two years", "sufficient cause", "fifty lakh", "two crore", "pecuniary"]),
        ("mediation", ["mediation", "mediator", "settlement", "mediation cell"]),
        ("helpline_and_escalation", ["helpline", "1915", "ingram", "8800001915", "grievance redressal", "convergence"]),
    ]
    for tag, kws in rules:
        if any(kw in low for kw in kws):
            tags.add(tag)
    if not tags:
        tags.update(default_tags[:3])
    return sorted(tags)


def _extract_english_pages(pdf_path: Path, start_marker: Optional[str] = None) -> List[Dict]:
    doc = pymupdf.open(str(pdf_path))
    pages: List[Dict] = []
    started = start_marker is None
    for idx, page in enumerate(doc, 1):
        raw = page.get_text("text") or ""
        if not started and start_marker:
            pos = raw.find(start_marker)
            if pos != -1:
                started = True
                raw = raw[pos:]
            else:
                continue
        cleaned = _clean_lines(raw, strip_hindi=True)
        if len(cleaned) >= 40:
            pages.append({"page": idx, "text": cleaned})
    doc.close()
    return pages


def chunk_consumer_protection_act(
    source: SourceManifestRecord, pdf_path: Path
) -> List[ChunkRecord]:
    """Chunk Consumer Protection Act, 2019 by Section and Definition clause."""
    pages = _extract_english_pages(pdf_path, start_marker=None)
    # Build line-level stream with page tracking
    stream: List[tuple[int, str]] = []
    for pg in pages:
        for ln in pg["text"].split("\n"):
            stream.append((pg["page"], ln))

    # Locate Sections: lines starting with `1. `, `2. `, ..., `107. `
    # Skip preamble before `CHAPTER I`
    start_idx = 0
    for i, (_, ln) in enumerate(stream):
        if ln.startswith("CHAPTER I"):
            start_idx = i
            break

    section_re = re.compile(r"^(\d{1,3})\.\s+\(?(?:1\)|In this Act|The |Every |No |Subject |Where |Save |If |A |An |Any |All |For |On |Without |Nothing )")
    # Also catch `10. (1)` or `34. (1)` or `2. In this Act` or `69. (1)` or `39. (1)`
    generic_sec_re = re.compile(r"^(\d{1,3})\.\s+(.*)$")

    sections: List[Dict] = []
    current_sec: Optional[str] = None
    current_chapter = "CHAPTER I - PRELIMINARY"
    current_lines: List[tuple[int, str]] = []
    expected_num = 1

    for page_num, ln in stream[start_idx:]:
        if re.match(r"^CHAPTER\s+[IVXLC]+", ln):
            current_chapter = ln
            continue
        m = generic_sec_re.match(ln)
        if m:
            num = int(m.group(1))
            rest = m.group(2)
            # Ensure sequential section numbers (1..107) and avoid marginalia/list items
            if num == expected_num and (
                rest.startswith("(")
                or rest[0].isupper()
            ):
                if current_sec is not None and current_lines:
                    sections.append(
                        {
                            "section": current_sec,
                            "chapter": current_chapter,
                            "lines": current_lines,
                        }
                    )
                current_sec = str(num)
                current_lines = [(page_num, ln)]
                expected_num += 1
                continue
        if current_sec is not None:
            current_lines.append((page_num, ln))

    if current_sec is not None and current_lines:
        sections.append(
            {"section": current_sec, "chapter": current_chapter, "lines": current_lines}
        )

    chunks: List[ChunkRecord] = []
    for sec in sections:
        sec_num = sec["section"]
        lines = sec["lines"]
        if sec_num == "2":
            # Split Section 2 definitions by `(1) "`, `(2) "`, ..., `(47) "`
            def_re = re.compile(r'^\((\d{1,2})\)\s+"([^"]+)"')
            cur_sub: Optional[str] = None
            cur_term: Optional[str] = None
            cur_buf: List[tuple[int, str]] = []
            for pg, ln in lines:
                dm = def_re.match(ln)
                if dm:
                    if cur_sub and cur_buf:
                        txt = "\n".join(x[1] for x in cur_buf)
                        chunks.append(
                            ChunkRecord(
                                chunk_id=f"cpa_2019_s2_{cur_sub}",
                                source_id=source.source_id,
                                domain=source.domain,
                                topic_tags=_infer_topic_tags(txt, source.topic_tags),
                                jurisdiction=source.jurisdiction,
                                section="2",
                                subsection=f"({cur_sub})",
                                heading=f'Section 2({cur_sub}) — Definition of "{cur_term}"',
                                page_start=cur_buf[0][0],
                                page_end=cur_buf[-1][0],
                                text=txt,
                                effective_from=source.effective_from,
                                effective_to=source.effective_to,
                                source_status=source.status,
                                official_url=source.official_url,
                            )
                        )
                    cur_sub = dm.group(1)
                    cur_term = dm.group(2)
                    cur_buf = [(pg, ln)]
                elif cur_sub is not None:
                    cur_buf.append((pg, ln))
            if cur_sub and cur_buf:
                txt = "\n".join(x[1] for x in cur_buf)
                chunks.append(
                    ChunkRecord(
                        chunk_id=f"cpa_2019_s2_{cur_sub}",
                        source_id=source.source_id,
                        domain=source.domain,
                        topic_tags=_infer_topic_tags(txt, source.topic_tags),
                        jurisdiction=source.jurisdiction,
                        section="2",
                        subsection=f"({cur_sub})",
                        heading=f'Section 2({cur_sub}) — Definition of "{cur_term}"',
                        page_start=cur_buf[0][0],
                        page_end=cur_buf[-1][0],
                        text=txt,
                        effective_from=source.effective_from,
                        effective_to=source.effective_to,
                        source_status=source.status,
                        official_url=source.official_url,
                    )
                )
        else:
            full_txt = "\n".join(x[1] for x in lines)
            if len(full_txt) <= 2800:
                chunks.append(
                    ChunkRecord(
                        chunk_id=f"cpa_2019_s{sec_num}",
                        source_id=source.source_id,
                        domain=source.domain,
                        topic_tags=_infer_topic_tags(full_txt, source.topic_tags),
                        jurisdiction=source.jurisdiction,
                        section=sec_num,
                        subsection=None,
                        heading=f"Section {sec_num} ({sec['chapter']})",
                        page_start=lines[0][0],
                        page_end=lines[-1][0],
                        text=full_txt,
                        effective_from=source.effective_from,
                        effective_to=source.effective_to,
                        source_status=source.status,
                        official_url=source.official_url,
                    )
                )
            else:
                # Split large section by subsection `(1)`, `(2)`, ... keeping prefix context
                sub_re = re.compile(r"^(?:\d+\.\s+)?\((\d{1,2})\)\s+")
                parts: List[tuple[str, List[tuple[int, str]]]] = []
                cur_s = "1"
                buf: List[tuple[int, str]] = []
                for pg, ln in lines:
                    sm = sub_re.match(ln)
                    if sm and buf and sm.group(1) != cur_s:
                        parts.append((cur_s, buf))
                        cur_s = sm.group(1)
                        buf = [(pg, ln)]
                    else:
                        if sm:
                            cur_s = sm.group(1)
                        buf.append((pg, ln))
                if buf:
                    parts.append((cur_s, buf))
                for idx_p, (sub_id, p_lines) in enumerate(parts, 1):
                    txt = "\n".join(x[1] for x in p_lines)
                    chunks.append(
                        ChunkRecord(
                            chunk_id=f"cpa_2019_s{sec_num}_{sub_id}_{idx_p}",
                            source_id=source.source_id,
                            domain=source.domain,
                            topic_tags=_infer_topic_tags(txt, source.topic_tags),
                            jurisdiction=source.jurisdiction,
                            section=sec_num,
                            subsection=f"({sub_id})",
                            heading=f"Section {sec_num}({sub_id}) ({sec['chapter']})",
                            page_start=p_lines[0][0],
                            page_end=p_lines[-1][0],
                            text=txt,
                            effective_from=source.effective_from,
                            effective_to=source.effective_to,
                            source_status=source.status,
                            official_url=source.official_url,
                        )
                    )
    return chunks


def chunk_gazette_rules_pdf(
    source: SourceManifestRecord,
    pdf_path: Path,
    english_marker: str,
    prefix: str,
    unit_label: str = "Rule",
) -> List[ChunkRecord]:
    """Chunk bilingual Gazette Rules / Regulations / Guidelines PDF starting at the English notification."""
    pages = _extract_english_pages(pdf_path, start_marker=english_marker)
    if not pages:
        pages = _extract_english_pages(pdf_path, start_marker=None)

    stream: List[tuple[int, str]] = []
    for pg in pages:
        for ln in pg["text"].split("\n"):
            # Skip Government of India Press footer
            if ln.startswith("Uploaded by Dte.") or ln.startswith("and Published by the Controller"):
                continue
            stream.append((pg["page"], ln))

    rule_re = re.compile(r"^(\d{1,2})\.\s+([A-Z\"\(].*)$")
    items: List[Dict] = []
    cur_num = "0"
    cur_title = "Notification & Preamble"
    cur_lines: List[tuple[int, str]] = []

    for pg, ln in stream:
        rm = rule_re.match(ln)
        if rm:
            num = rm.group(1)
            # Avoid matching years or table serial numbers
            if int(num) <= 45 and (len(rm.group(2)) > 8):
                if cur_lines:
                    items.append({"num": cur_num, "title": cur_title, "lines": cur_lines})
                cur_num = num
                heading_part = rm.group(2).split("—")[0].split(".-")[0].split("–")[0][:90].strip()
                cur_title = f"{unit_label} {num} — {heading_part}"
                cur_lines = [(pg, ln)]
                continue
        cur_lines.append((pg, ln))

    if cur_lines:
        items.append({"num": cur_num, "title": cur_title, "lines": cur_lines})

    chunks: List[ChunkRecord] = []
    for idx, item in enumerate(items, 1):
        full_txt = "\n".join(x[1] for x in item["lines"])
        if len(full_txt) < 60:
            continue
        # If very large (e.g. > 2800 chars), split at paragraph/sub-rule boundary
        if len(full_txt) <= 2800:
            chunks.append(
                ChunkRecord(
                    chunk_id=f"{prefix}_{unit_label.lower()}_{item['num']}_{idx}",
                    source_id=source.source_id,
                    domain=source.domain,
                    topic_tags=_infer_topic_tags(full_txt, source.topic_tags),
                    jurisdiction=source.jurisdiction,
                    rule=item["num"] if unit_label in ("Rule", "Regulation") else None,
                    paragraph=item["num"] if unit_label in ("Clause", "Paragraph", "Guideline") else None,
                    heading=item["title"],
                    page_start=item["lines"][0][0],
                    page_end=item["lines"][-1][0],
                    text=full_txt,
                    effective_from=source.effective_from,
                    effective_to=source.effective_to,
                    source_status=source.status,
                    official_url=source.official_url,
                )
            )
        else:
            # Split into ~2000 char chunks along line boundaries
            part_lines: List[tuple[int, str]] = []
            part_len = 0
            part_idx = 1
            for pg, ln in item["lines"]:
                if part_len + len(ln) > 2100 and part_lines and re.match(r"^\(\d+\)|^\([a-z]\)", ln):
                    txt = "\n".join(x[1] for x in part_lines)
                    chunks.append(
                        ChunkRecord(
                            chunk_id=f"{prefix}_{unit_label.lower()}_{item['num']}_{idx}_p{part_idx}",
                            source_id=source.source_id,
                            domain=source.domain,
                            topic_tags=_infer_topic_tags(txt, source.topic_tags),
                            jurisdiction=source.jurisdiction,
                            rule=item["num"] if unit_label in ("Rule", "Regulation") else None,
                            paragraph=item["num"] if unit_label in ("Clause", "Paragraph", "Guideline") else None,
                            heading=f"{item['title']} (Part {part_idx})",
                            page_start=part_lines[0][0],
                            page_end=part_lines[-1][0],
                            text=txt,
                            effective_from=source.effective_from,
                            effective_to=source.effective_to,
                            source_status=source.status,
                            official_url=source.official_url,
                        )
                    )
                    part_idx += 1
                    part_lines = [(pg, ln)]
                    part_len = len(ln)
                else:
                    part_lines.append((pg, ln))
                    part_len += len(ln) + 1
            if part_lines:
                txt = "\n".join(x[1] for x in part_lines)
                chunks.append(
                    ChunkRecord(
                        chunk_id=f"{prefix}_{unit_label.lower()}_{item['num']}_{idx}_p{part_idx}",
                        source_id=source.source_id,
                        domain=source.domain,
                        topic_tags=_infer_topic_tags(txt, source.topic_tags),
                        jurisdiction=source.jurisdiction,
                        rule=item["num"] if unit_label in ("Rule", "Regulation") else None,
                        paragraph=item["num"] if unit_label in ("Clause", "Paragraph", "Guideline") else None,
                        heading=f"{item['title']} (Part {part_idx})" if part_idx > 1 else item["title"],
                        page_start=part_lines[0][0],
                        page_end=part_lines[-1][0],
                        text=txt,
                        effective_from=source.effective_from,
                        effective_to=source.effective_to,
                        source_status=source.status,
                        official_url=source.official_url,
                    )
                )
    return chunks


def chunk_citizen_charter(source: SourceManifestRecord, pdf_path: Path) -> List[ChunkRecord]:
    pages = _extract_english_pages(pdf_path, start_marker=None)
    chunks: List[ChunkRecord] = []
    for pg in pages:
        txt = pg["text"]
        if len(txt) < 80 or pg["page"] == 2:
            continue
        first_ln = txt.split("\n")[0][:80]
        chunks.append(
            ChunkRecord(
                chunk_id=f"doca_charter_p{pg['page']}",
                source_id=source.source_id,
                domain=source.domain,
                topic_tags=_infer_topic_tags(txt, source.topic_tags),
                jurisdiction=source.jurisdiction,
                paragraph=f"Page {pg['page']}",
                heading=f"DoCA Citizen's Charter (2025-26) — {first_ln}",
                page_start=pg["page"],
                page_end=pg["page"],
                text=txt,
                effective_from=source.effective_from,
                effective_to=source.effective_to,
                source_status=source.status,
                official_url=source.official_url,
            )
        )
    return chunks


def chunk_nch_html(source: SourceManifestRecord, html_path: Path) -> List[ChunkRecord]:
    raw_html = html_path.read_text(encoding="utf-8", errors="ignore")
    soup = BeautifulSoup(raw_html, "html.parser")
    for tag in soup(["script", "style", "noscript", "svg", "nav", "footer"]):
        tag.decompose()
    text = re.sub(r"\s+", " ", soup.get_text(" ", strip=True)).strip()
    # Extract meaningful segments by key portal sections
    chunks: List[ChunkRecord] = []
    # Split into ~1200-char coherent paragraphs from headings/blocks
    blocks: List[tuple[str, str]] = []
    cur_h = "National Consumer Helpline (NCH 2.0) — Overview & Channels"
    cur_t: List[str] = []
    for el in soup.find_all(["h1", "h2", "h3", "h4", "p", "li"]):
        s = re.sub(r"\s+", " ", el.get_text(" ", strip=True)).strip()
        if len(s) < 15:
            continue
        if el.name in ("h1", "h2", "h3", "h4"):
            if cur_t and len(" ".join(cur_t)) > 60:
                blocks.append((cur_h, "\n".join(cur_t)))
                cur_t = []
            cur_h = s[:90]
        else:
            if s not in cur_t:
                cur_t.append(s)
    if cur_t and len(" ".join(cur_t)) > 60:
        blocks.append((cur_h, "\n".join(cur_t)))

    if not blocks and text:
        blocks = [("National Consumer Helpline (NCH 2.0)", text[:2000])]

    for idx, (heading, body) in enumerate(blocks[:12], 1):
        chunks.append(
            ChunkRecord(
                chunk_id=f"nch_portal_sec_{idx}",
                source_id=source.source_id,
                domain=source.domain,
                topic_tags=_infer_topic_tags(heading + " " + body, source.topic_tags),
                jurisdiction=source.jurisdiction,
                paragraph=f"Section {idx}",
                heading=heading,
                page_start=None,
                page_end=None,
                text=f"{heading}\n{body[:1800]}",
                effective_from=source.effective_from,
                effective_to=source.effective_to,
                source_status=source.status,
                official_url=source.official_url,
            )
        )
    return chunks
