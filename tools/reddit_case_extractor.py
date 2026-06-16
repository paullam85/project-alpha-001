#!/usr/bin/env python3
"""Manual Reddit link intake workflow for Roof AI validation cases.

Rules this script follows:
- It only processes URLs explicitly listed in validation/cases/input_urls.txt.
- It does not crawl subreddits, search Reddit, or follow recommendation feeds.
- It uses public post JSON when available and stops gracefully when Reddit blocks access.
- When blocked, it creates a paste template so visible text can be added manually.
"""

from __future__ import annotations

import csv
import json
import re
import sys
import textwrap
import urllib.error
import urllib.parse
import urllib.request
from dataclasses import dataclass
from datetime import date
from pathlib import Path
from typing import Dict, Iterable, List, Optional, Tuple

ROOT = Path(__file__).resolve().parents[1]
CASES_DIR = ROOT / "validation" / "cases"
INPUT_FILE = CASES_DIR / "input_urls.txt"
CSV_FILE = CASES_DIR / "reddit_cases.csv"
SUMMARY_FILE = CASES_DIR / "case_batch_summary.md"
PASTE_TEMPLATE_FILE = CASES_DIR / "reddit_paste_template.md"
USER_AGENT = "RoofAIValidationCaseExtractor/1.0 (manual URL intake; contact: project owner)"
MAX_COMMENTS = 20
CSV_FIELDS = [
    "case_id",
    "date_added",
    "subreddit",
    "post_title",
    "post_url",
    "case_theme",
    "homeowner_problem",
    "roof_context",
    "attic_context",
    "insurance_context",
    "contractor_context",
    "key_comments_summary",
    "observed_pain_point",
    "likely_user_intent",
    "suggested_solution_categories",
    "product_module",
    "validation_signal",
    "priority",
    "notes",
]
THEME_KEYWORDS: Dict[str, List[str]] = {
    "Ventilation": ["vent", "ridge", "soffit", "baffle", "airflow", "attic fan", "exhaust"],
    "Attic Heat": ["attic", "hot", "heat", "temperature", "radiant"],
    "Insurance Anxiety": ["insurance", "claim", "deductible", "premium", "adjuster", "hail", "storm"],
    "Contractor Trust": ["contractor", "roofer", "quote", "estimate", "scam", "trust", "sales"],
    "Quote Comparison": ["quote", "bid", "price", "estimate", "cost", "scope"],
    "Repair vs Replace": ["repair", "replace", "replacement", "patch", "leak"],
    "Roof Age Anxiety": ["old", "age", "years", "life left", "lifespan"],
    "Documentation": ["photo", "document", "warranty", "permit", "invoice", "record"],
    "Decking / OSB": ["decking", "osb", "plywood", "sheathing", "rotten"],
    "Solar Readiness": ["solar", "panel", "panels"],
}
MODULE_MAP: Dict[str, str] = {
    "Ventilation": "Ventilation Diagnostic Engine",
    "Attic Heat": "Attic Heat Analyzer",
    "Insurance Anxiety": "Insurance Claim Risk Analyzer",
    "Contractor Trust": "Roof Recommendation Confidence Score",
    "Quote Comparison": "Quote Scope Validation Engine",
    "Repair vs Replace": "Repair vs Replace Advisor",
    "Roof Age Anxiety": "Roof Remaining Life Estimator",
    "Documentation": "Roof Replacement Document Checklist",
    "Decking / OSB": "Decking Risk Estimate",
    "Solar Readiness": "Solar Readiness Check",
}


@dataclass
class RedditCase:
    case_id: str
    subreddit: str
    title: str
    url: str
    score: str
    comment_count: str
    body: str
    comments: List[str]
    themes: List[str]


def normalize_url(raw_url: str) -> str:
    url = raw_url.strip().lstrip("\ufeff")
    if not url or url.startswith("#"):
        return ""
    parsed = urllib.parse.urlparse(url)
    if not parsed.scheme:
        url = "https://" + url
    return url


def json_url_for_post(url: str) -> str:
    parsed = urllib.parse.urlparse(url)
    path = parsed.path.rstrip("/")
    return urllib.parse.urlunparse((parsed.scheme, parsed.netloc, path + ".json", "", "limit=20&sort=top", ""))


def fetch_json(url: str) -> object:
    req = urllib.request.Request(json_url_for_post(url), headers={"User-Agent": USER_AGENT})
    with urllib.request.urlopen(req, timeout=20) as response:
        content_type = response.headers.get("content-type", "")
        body = response.read().decode("utf-8", errors="replace")
        if "json" not in content_type.lower() and body.lstrip().startswith("<"):
            raise RuntimeError("Reddit returned HTML instead of JSON; manual paste required.")
        return json.loads(body)


def flatten_comments(children: Iterable[dict], limit: int = MAX_COMMENTS) -> List[str]:
    comments: List[str] = []
    for child in children:
        if len(comments) >= limit:
            break
        data = child.get("data", {}) if isinstance(child, dict) else {}
        body = clean_text(data.get("body", ""))
        if body and body not in ("[deleted]", "[removed]"):
            comments.append(body)
        replies = data.get("replies")
        if isinstance(replies, dict):
            reply_children = replies.get("data", {}).get("children", [])
            comments.extend(flatten_comments(reply_children, limit - len(comments)))
    return comments[:limit]


def clean_text(value: object) -> str:
    text = str(value or "")
    text = re.sub(r"\s+", " ", text).strip()
    return text


def slugify(title: str) -> str:
    slug = re.sub(r"[^a-z0-9]+", "-", title.lower()).strip("-")
    return slug[:70] or "reddit-case"


def read_existing_case_ids() -> List[str]:
    if not CSV_FILE.exists():
        return []
    with CSV_FILE.open("r", newline="", encoding="utf-8-sig") as handle:
        reader = csv.DictReader(handle)
        return [row.get("case_id", "") for row in reader if row.get("case_id")]


def next_case_id(existing_ids: List[str]) -> str:
    max_id = 0
    for case_id in existing_ids:
        match = re.match(r"CASE-(\d+)", case_id)
        if match:
            max_id = max(max_id, int(match.group(1)))
    return f"CASE-{max_id + 1:03d}"


def detect_themes(title: str, body: str, comments: List[str]) -> List[str]:
    haystack = " ".join([title, body] + comments).lower()
    hits = []
    for theme, keywords in THEME_KEYWORDS.items():
        if any(keyword in haystack for keyword in keywords):
            hits.append(theme)
    return hits or ["Manual Review Needed"]


def summarize_comments(comments: List[str]) -> str:
    if not comments:
        return "No visible comments extracted. Manual review recommended."
    snippets = []
    for comment in comments[:5]:
        snippets.append(comment[:180] + ("..." if len(comment) > 180 else ""))
    return " | ".join(snippets)


def infer_homeowner_problem(title: str, body: str, themes: List[str]) -> str:
    if body:
        return body[:260] + ("..." if len(body) > 260 else "")
    return f"Homeowner discussion around: {title}. Themes detected: {', '.join(themes)}."


def infer_intent(themes: List[str]) -> str:
    if "Quote Comparison" in themes:
        return "Compare roof quotes and understand whether scope and pricing are reasonable."
    if "Insurance Anxiety" in themes:
        return "Decide whether insurance claim involvement is worth the risk."
    if "Repair vs Replace" in themes or "Roof Age Anxiety" in themes:
        return "Decide whether to repair, replace, or monitor the roof."
    if "Ventilation" in themes or "Attic Heat" in themes:
        return "Diagnose whether roof or attic conditions need improvement before spending money."
    return "Understand roof decision risk and next best action."


def priority_for_case(score: str, comment_count: str, themes: List[str]) -> Tuple[str, str]:
    try:
        comments = int(comment_count)
    except ValueError:
        comments = 0
    high_signal = {"Insurance Anxiety", "Contractor Trust", "Quote Comparison", "Repair vs Replace", "Ventilation"}
    if comments >= 25 or any(theme in high_signal for theme in themes):
        return "A", "Green"
    if comments >= 5:
        return "B", "Yellow"
    return "C", "Yellow"


def build_csv_row(case: RedditCase) -> Dict[str, str]:
    primary_theme = case.themes[0]
    modules = [MODULE_MAP.get(theme, "Manual Case Review") for theme in case.themes]
    priority, signal = priority_for_case(case.score, case.comment_count, case.themes)
    return {
        "case_id": case.case_id,
        "date_added": date.today().isoformat(),
        "subreddit": case.subreddit,
        "post_title": case.title,
        "post_url": case.url,
        "case_theme": primary_theme,
        "homeowner_problem": infer_homeowner_problem(case.title, case.body, case.themes),
        "roof_context": "Extracted from manually provided Reddit URL; review full post for roof-specific details.",
        "attic_context": "Theme detected." if any(t in case.themes for t in ["Ventilation", "Attic Heat"]) else "Not clearly visible in extracted text.",
        "insurance_context": "Theme detected." if "Insurance Anxiety" in case.themes else "Not clearly visible in extracted text.",
        "contractor_context": "Theme detected." if "Contractor Trust" in case.themes or "Quote Comparison" in case.themes else "Not clearly visible in extracted text.",
        "key_comments_summary": summarize_comments(case.comments),
        "observed_pain_point": f"Homeowner uncertainty around {', '.join(case.themes)}.",
        "likely_user_intent": infer_intent(case.themes),
        "suggested_solution_categories": "; ".join(case.themes),
        "product_module": "; ".join(dict.fromkeys(modules)),
        "validation_signal": signal,
        "priority": priority,
        "notes": f"Manual URL intake. Score/upvotes: {case.score}. Comment count: {case.comment_count}. Review before using as product evidence.",
    }


def append_rows(rows: List[Dict[str, str]]) -> None:
    if not rows:
        return
    file_exists = CSV_FILE.exists()
    with CSV_FILE.open("a", newline="", encoding="utf-8") as handle:
        writer = csv.DictWriter(handle, fieldnames=CSV_FIELDS)
        if not file_exists:
            writer.writeheader()
        for row in rows:
            writer.writerow({field: row.get(field, "") for field in CSV_FIELDS})


def write_markdown_case(case: RedditCase, row: Dict[str, str]) -> Path:
    path = CASES_DIR / f"{case.case_id.lower()}-{slugify(case.title)}.md"
    comments_md = "\n".join(f"{idx + 1}. {comment}" for idx, comment in enumerate(case.comments)) or "No visible comments extracted."
    content = f"""# {case.case_id}: {case.title}

Source: Reddit - {case.subreddit}
URL: {case.url}
Date added: {date.today().isoformat()}
Score/upvotes visible: {case.score}
Comment count visible: {case.comment_count}

## Extracted Post Body

{case.body or 'No visible post body extracted.'}

## Top Visible Comments

{comments_md}

## Repeated Themes

{', '.join(case.themes)}

## Homeowner Pain Points

{row['observed_pain_point']}

## Product Feature Opportunities

{row['product_module']}

## Structured CSV Summary

| Field | Value |
|---|---|
| Case Theme | {row['case_theme']} |
| Likely User Intent | {row['likely_user_intent']} |
| Validation Signal | {row['validation_signal']} |
| Priority | {row['priority']} |
| Notes | {row['notes']} |

## Manual Review Notes

- Confirm extracted themes against the original visible Reddit thread.
- Add direct evidence quotes only when manually verified.
- Do not treat this as a scraped dataset; it is a curated validation case.
"""
    path.write_text(content, encoding="utf-8")
    return path


def parse_reddit_payload(url: str, payload: object, case_id: str) -> RedditCase:
    if not isinstance(payload, list) or len(payload) < 1:
        raise RuntimeError("Unexpected Reddit JSON shape; manual paste required.")
    post_children = payload[0].get("data", {}).get("children", [])
    if not post_children:
        raise RuntimeError("No post data found; manual paste required.")
    post = post_children[0].get("data", {})
    title = clean_text(post.get("title", "Untitled Reddit case"))
    subreddit = "r/" + clean_text(post.get("subreddit", "unknown"))
    body = clean_text(post.get("selftext", ""))
    score = str(post.get("score", "unknown"))
    comment_count = str(post.get("num_comments", "unknown"))
    comments_children = []
    if len(payload) > 1:
        comments_children = payload[1].get("data", {}).get("children", [])
    comments = flatten_comments(comments_children)
    themes = detect_themes(title, body, comments)
    return RedditCase(case_id, subreddit, title, url, score, comment_count, body, comments, themes)


def write_paste_template(failed_urls: List[Tuple[str, str]]) -> None:
    if not failed_urls:
        return
    blocks = []
    for url, reason in failed_urls:
        blocks.append(f"""## Paste Template For Manual Intake

URL: {url}
Reason automatic extraction stopped: {reason}

### Post Title


### Subreddit


### Score / Upvotes Visible


### Comment Count Visible


### Post Body


### Top Visible Comments

1. 
2. 
3. 
4. 
5. 

### Repeated Themes


### Homeowner Pain Points


### Product Feature Opportunities


""")
    PASTE_TEMPLATE_FILE.write_text("\n---\n\n".join(blocks), encoding="utf-8")


def write_summary(created: List[Path], failed: List[Tuple[str, str]], skipped: List[str]) -> None:
    created_lines = "\n".join(f"- {path.name}" for path in created) or "- None"
    failed_lines = "\n".join(f"- {url}: {reason}" for url, reason in failed) or "- None"
    skipped_lines = "\n".join(f"- {url}" for url in skipped) or "- None"
    content = f"""# Reddit Case Batch Summary

Generated: {date.today().isoformat()}

## Created Markdown Cases

{created_lines}

## Failed / Manual Paste Required

{failed_lines}

## Skipped URLs

{skipped_lines}

## Next Steps

- Review each generated case file manually before treating it as customer evidence.
- If Reddit blocked access, use `validation/cases/reddit_paste_template.md` and paste visible text manually.
- Commit only curated case outputs; do not mass scrape or crawl Reddit.
"""
    SUMMARY_FILE.write_text(content, encoding="utf-8")


def load_urls() -> List[str]:
    if not INPUT_FILE.exists():
        INPUT_FILE.write_text("# Add one manually selected Reddit post URL per line.\n", encoding="utf-8")
        return []
    urls = []
    for line in INPUT_FILE.read_text(encoding="utf-8-sig").splitlines():
        url = normalize_url(line)
        if url:
            urls.append(url)
    return urls


def main() -> int:
    CASES_DIR.mkdir(parents=True, exist_ok=True)
    urls = load_urls()
    if not urls:
        write_summary([], [], ["No URLs found in validation/cases/input_urls.txt"])
        print("No URLs found. Add manually selected Reddit post URLs to validation/cases/input_urls.txt.")
        return 0

    existing_ids = read_existing_case_ids()
    rows: List[Dict[str, str]] = []
    created: List[Path] = []
    failed: List[Tuple[str, str]] = []
    skipped: List[str] = []

    for url in urls:
        if not re.search(r"reddit\.com|redd\.it", url):
            skipped.append(f"{url} (not a Reddit URL)")
            continue
        case_id = next_case_id(existing_ids + [row["case_id"] for row in rows])
        try:
            payload = fetch_json(url)
            case = parse_reddit_payload(url, payload, case_id)
            row = build_csv_row(case)
            rows.append(row)
            created.append(write_markdown_case(case, row))
        except (urllib.error.HTTPError, urllib.error.URLError, TimeoutError, RuntimeError, json.JSONDecodeError) as exc:
            failed.append((url, str(exc)))

    append_rows(rows)
    write_paste_template(failed)
    write_summary(created, failed, skipped)
    print(f"Created {len(created)} case file(s), failed {len(failed)}, skipped {len(skipped)}.")
    return 0


if __name__ == "__main__":
    sys.exit(main())

