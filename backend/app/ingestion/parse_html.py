"""
Heading- and paragraph-aware HTML parser using BeautifulSoup.
"""
from __future__ import annotations

import re
from pathlib import Path
from typing import List, Dict
from bs4 import BeautifulSoup


def extract_html_sections(html_path: Path) -> List[Dict]:
    raw_html = html_path.read_text(encoding="utf-8", errors="ignore")
    soup = BeautifulSoup(raw_html, "html.parser")
    for tag in soup(["script", "style", "noscript", "svg"]):
        tag.decompose()

    sections: List[Dict] = []
    current_heading = soup.title.get_text(strip=True) if soup.title else html_path.stem
    current_lines: List[str] = []

    for el in soup.find_all(["h1", "h2", "h3", "h4", "p", "li"]):
        txt = re.sub(r"\s+", " ", el.get_text(" ", strip=True)).strip()
        if not txt or len(txt) < 15:
            continue
        if el.name in ("h1", "h2", "h3", "h4"):
            if current_lines:
                sections.append(
                    {
                        "heading": current_heading,
                        "text": "\n".join(current_lines),
                    }
                )
                current_lines = []
            current_heading = txt
        else:
            current_lines.append(txt)

    if current_lines:
        sections.append(
            {
                "heading": current_heading,
                "text": "\n".join(current_lines),
            }
        )
    return sections
