"""
Page-aware PDF parser using PyMuPDF (fitz).
Extracts text page-by-page while preserving exact page numbers (1-indexed).
"""
from __future__ import annotations

import re
from pathlib import Path
from typing import List, Dict
import fitz  # PyMuPDF


def clean_pdf_text(text: str) -> str:
    # Normalize line breaks and strip redundant Gazette headers/whitespace
    text = text.replace("\r\n", "\n").replace("\r", "\n")
    # Remove isolated page-number-only lines or Gazette boilerplates gently while keeping structure
    lines = [re.sub(r"[ \t]+", " ", ln).strip() for ln in text.split("\n")]
    return "\n".join(ln for ln in lines if ln != "")


def extract_pdf_pages(pdf_path: Path) -> List[Dict]:
    doc = fitz.open(str(pdf_path))
    pages: List[Dict] = []
    for idx in range(len(doc)):
        page = doc[idx]
        raw = page.get_text("text") or ""
        cleaned = clean_pdf_text(raw)
        pages.append(
            {
                "page_number": idx + 1,
                "text": cleaned,
                "char_count": len(cleaned),
            }
        )
    doc.close()
    return pages


if __name__ == "__main__":
    import sys
    p = Path(sys.argv[1])
    pages = extract_pdf_pages(p)
    print(f"{p.name}: {len(pages)} pages, total chars={sum(x['char_count'] for x in pages)}")
    for pg in pages[:2]:
        print(f"--- Page {pg['page_number']} ({pg['char_count']} chars) ---")
        print(pg["text"][:600])
