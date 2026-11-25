"""
Fetch official Indian consumer protection source documents into data/sources/.
Uses verified official Department of Consumer Affairs (consumeraffairs.gov.in),
National Consumer Helpline (consumerhelpline.gov.in), and e-Jagriti (e-jagriti.gov.in) URLs.
"""
from __future__ import annotations

import json
from datetime import date
from pathlib import Path
import requests

REPO_ROOT = Path(__file__).resolve().parents[3]
SOURCES_DIR = REPO_ROOT / "data" / "sources"

OFFICIAL_SOURCES = [
    {
        "source_id": "consumer_protection_act_2019",
        "subdir": "legislation",
        "filename": "ConsumerProtectionAct2019.pdf",
        "urls": [
            "https://consumeraffairs.gov.in/public/upload/files/CP%20Act%202019_1732700731.pdf",
        ],
    },
    {
        "source_id": "cp_act_2019_commencement",
        "subdir": "notifications_guidelines",
        "filename": "CP_Act_2019_Commencement.pdf",
        "urls": [
            "https://consumeraffairs.gov.in/public/upload/files/Act%20into%20force_1732702865.pdf",
        ],
    },
    {
        "source_id": "ecommerce_rules_2020",
        "subdir": "rules",
        "filename": "ECommerce_Rules_2020.pdf",
        "urls": [
            "https://consumeraffairs.gov.in/public/upload/files/E%20commerce%20rules_1732703966.pdf",
        ],
    },
    {
        "source_id": "ecommerce_amendment_rules_2021",
        "subdir": "rules",
        "filename": "ECommerce_Amendment_Rules_2021.pdf",
        "urls": [
            "https://consumeraffairs.gov.in/public/upload/files/Consumer%20Protection%20(E-Commerce)%20(Amendment)%20Rules,%202021_1732704241.pdf",
        ],
    },
    {
        "source_id": "ecommerce_amendment_rules_2026",
        "subdir": "rules",
        "filename": "ECommerce_Amendment_Rules_2026.pdf",
        "urls": [
            "https://consumeraffairs.gov.in/public/upload/files/E%20Commerce%20Amendment%20Rules%202026_1789127949.pdf",
        ],
    },
    {
        "source_id": "jurisdiction_rules_2021",
        "subdir": "rules",
        "filename": "Jurisdiction_Rules_2021.pdf",
        "urls": [
            "https://consumeraffairs.gov.in/public/upload/files/232278_1732705029.pdf",
        ],
    },
    {
        "source_id": "cdrc_rules_2020",
        "subdir": "rules",
        "filename": "CDRC_Rules_2020.pdf",
        "urls": [
            "https://consumeraffairs.gov.in/public/upload/files/Consumer%20Commission%20Rules%20&%20General%20Rules_1732703661.pdf",
        ],
    },
    {
        "source_id": "mediation_rules_2020",
        "subdir": "rules",
        "filename": "Mediation_Rules_2020.pdf",
        "urls": [
            "https://consumeraffairs.gov.in/public/upload/files/Mediation%20Rules_1732703912.pdf",
        ],
    },
    {
        "source_id": "commission_procedure_regulations_2020",
        "subdir": "rules",
        "filename": "Commission_Procedure_Regulations_2020.pdf",
        "urls": [
            "https://consumeraffairs.gov.in/public/upload/files/220667_1732707483.pdf",
        ],
    },
    {
        "source_id": "ccpa_misleading_ads_guidelines_2022",
        "subdir": "notifications_guidelines",
        "filename": "CCPA_Misleading_Ads_Guidelines_2022.pdf",
        "urls": [
            "https://consumeraffairs.gov.in/public/upload/files/CCPA_Notification_1732707665.pdf",
        ],
    },
    {
        "source_id": "ccpa_dark_patterns_guidelines_2023",
        "subdir": "notifications_guidelines",
        "filename": "CCPA_Dark_Patterns_Guidelines_2023.pdf",
        "urls": [
            "https://consumeraffairs.gov.in/public/upload/files/The%20Guidelines%20for%20Prevention%20and%20Regulation%20of%20Dark%20Patterns,%202023_1732707717.pdf",
        ],
    },
    {
        "source_id": "nch_official_portal",
        "subdir": "official_portals",
        "filename": "nch_about.html",
        "urls": [
            "https://consumerhelpline.gov.in/public/",
        ],
    },
    {
        "source_id": "ejagriti_official_portal",
        "subdir": "official_portals",
        "filename": "ejagriti_home.html",
        "urls": [
            "https://e-jagriti.gov.in/",
        ],
    },
]


def fetch_all() -> dict:
    headers = {
        "User-Agent": "Mozilla/5.0 (compatible; SatyaResearch/1.0)"
    }
    results = {}
    for item in OFFICIAL_SOURCES:
        dest_dir = SOURCES_DIR / item["subdir"]
        dest_dir.mkdir(parents=True, exist_ok=True)
        dest_path = dest_dir / item["filename"]
        fetched = False
        used_url = None
        last_err = None
        for url in item["urls"]:
            try:
                resp = requests.get(url, headers=headers, timeout=40, allow_redirects=True)
                if resp.status_code == 200 and len(resp.content) > 500:
                    dest_path.write_bytes(resp.content)
                    fetched = True
                    used_url = resp.url
                    break
                last_err = f"HTTP {resp.status_code} len={len(resp.content)}"
            except Exception as exc:
                last_err = str(exc)
        results[item["source_id"]] = {
            "fetched": fetched,
            "path": str(dest_path) if fetched else None,
            "size": dest_path.stat().st_size if fetched else 0,
            "url": used_url,
            "error": None if fetched else last_err,
            "retrieved_at": date.today().isoformat(),
        }
    return results


if __name__ == "__main__":
    summary = fetch_all()
    print(json.dumps(summary, indent=2))
