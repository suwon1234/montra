"""
MONTRA - Verified Trends SQL Generator

Turn manually reviewed, evidence-backed trend records into SQL inserts.

This script is intentionally strict:
- confidence must be >= 4
- at least 2 evidence items are required
- evidence must come from at least 2 source families
- every record must include timestamps and URLs

Use this after country-by-country manual verification.
"""

from __future__ import annotations

import argparse
import json
from collections import Counter
from datetime import datetime, timezone
from pathlib import Path


SCRIPT_DIR = Path(__file__).parent
CONFIG_PATH = SCRIPT_DIR / "config" / "supabase_ids.json"
OUTPUT_DIR = SCRIPT_DIR / "output"
OUTPUT_DIR.mkdir(exist_ok=True)

CHALLENGES_CATEGORY_ID = "395a5576-8c5e-40a6-a965-28ead697a232"
GENERIC_NAMES = {"fashion", "food", "shopping", "products", "brands", "challenge", "trend"}
ABSTRACT_KO_NAMES = {
    "쫀득 식감 디저트",
    "편의점 sns 디저트",
    "편의점 SNS 디저트",
    "우베 디저트 음료",
    "버터떡 유행",
    "버터떡 편의점 확산",
    "봄 신발 교체",
    "가벼운 레이어드",
    "봄 액티브웨어",
    "글로벌 캐주얼 브랜드 픽",
    "봄 아웃도어룩",
    "원색 컬러 코디",
    "깃털 디테일",
    "1920년대풍 드레싱",
    "존재감 있는 스커트",
    "북시크 스타일",
}
ABSTRACT_CATEGORY_WORDS = {
    "디저트",
    "음료",
    "간식",
    "신발",
    "코디",
    "스타일",
    "트렌드",
    "챌린지",
}


def utc_now() -> str:
    return datetime.now(timezone.utc).replace(microsecond=0).isoformat().replace("+00:00", "Z")


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser()
    parser.add_argument("input", help="Path to a verified JSON file")
    parser.add_argument("--output", help="Optional SQL output path")
    return parser.parse_args()


def load_ids() -> tuple[dict[str, str], dict[str, str]]:
    raw = json.loads(CONFIG_PATH.read_text(encoding="utf-8"))
    categories = dict(raw["categories"])
    categories.setdefault("challenges", CHALLENGES_CATEGORY_ID)
    countries = dict(raw["countries"])
    return countries, categories


def load_records(path: Path) -> list[dict]:
    payload = json.loads(path.read_text(encoding="utf-8-sig"))
    if isinstance(payload, list):
        return payload
    if isinstance(payload, dict) and isinstance(payload.get("records"), list):
        return payload["records"]
    if isinstance(payload, dict) and payload.get("country_code"):
        return [payload]
    raise ValueError("Input JSON must be a list or an object with a records array.")


def sql_escape(value: str) -> str:
    return value.replace("'", "''")


def sql_array(items: list[str]) -> str:
    if not items:
        return "ARRAY[]::text[]"
    return "ARRAY[" + ",".join("'" + sql_escape(item) + "'" for item in items) + "]"


def normalize_category(category: str) -> str:
    normalized = category.strip().lower()
    if normalized == "challenge":
        return "challenges"
    return normalized


def unique_in_order(items: list[str]) -> list[str]:
    seen: set[str] = set()
    result: list[str] = []
    for item in items:
        if item in seen:
            continue
        seen.add(item)
        result.append(item)
    return result


def validate_record(record: dict, country_ids: dict[str, str], category_ids: dict[str, str]) -> list[str]:
    errors: list[str] = []

    required_fields = [
        "country_code",
        "category",
        "canonical_name",
        "why_now",
        "evidence",
        "confidence",
        "first_detected_at",
        "last_updated_at",
    ]
    for field in required_fields:
        if field not in record:
            errors.append(f"missing field: {field}")

    if errors:
        return errors

    country_code = str(record["country_code"]).strip().upper()
    category = normalize_category(str(record["category"]))
    canonical_name = str(record["canonical_name"]).strip()
    why_now = str(record["why_now"]).strip()
    evidence = record["evidence"]
    confidence = int(record["confidence"])

    if country_code not in country_ids:
        errors.append(f"unknown country_code: {country_code}")
    if category not in category_ids:
        errors.append(f"unknown category: {category}")
    if not canonical_name:
        errors.append("canonical_name is empty")
    if canonical_name.lower() in GENERIC_NAMES:
        errors.append("canonical_name is too generic")
    if canonical_name in ABSTRACT_KO_NAMES:
        errors.append("canonical_name is an abstract Korean trend label, not a concrete item")
    if category in {"food", "fashion", "products"} and canonical_name in ABSTRACT_CATEGORY_WORDS:
        errors.append("canonical_name must be a concrete product/menu/item name")
    if category == "food" and not any(char.isdigit() or char.isalpha() for char in canonical_name):
        errors.append("food canonical_name should include an identifiable brand/store/menu name, not only a mood word")
    if len(why_now) < 20:
        errors.append("why_now is too short")
    if not any("\uac00" <= char <= "\ud7a3" for char in why_now):
        errors.append("why_now must be written in natural Korean for user-facing SQL")
    if confidence < 4:
        errors.append("confidence must be >= 4 for verified SQL")

    if not isinstance(evidence, list) or len(evidence) < 2:
        errors.append("at least 2 evidence items are required")
        return errors

    families: set[str] = set()
    for index, item in enumerate(evidence):
        if not isinstance(item, dict):
            errors.append(f"evidence[{index}] must be an object")
            continue
        for field in ["source_family", "url", "captured_at"]:
            if not str(item.get(field, "")).strip():
                errors.append(f"evidence[{index}] missing {field}")
        family = str(item.get("source_family", "")).strip().lower()
        if family:
            families.add(family)

    if len(families) < 2:
        errors.append("verified SQL requires at least 2 source families")

    return errors


def pick_name_local(record: dict) -> str | None:
    raw_labels = record.get("raw_labels") or []
    for label in raw_labels:
        if not isinstance(label, str):
            continue
        stripped = label.strip()
        if not stripped:
            continue
        if any(ord(ch) > 127 for ch in stripped):
            return stripped

    canonical_name = str(record["canonical_name"]).strip()
    if any(ord(ch) > 127 for ch in canonical_name):
        return canonical_name
    return None


def derive_scores(record: dict) -> tuple[int, int, int, int, int]:
    category = normalize_category(str(record["category"]))
    confidence = int(record["confidence"])
    families = {str(item.get("source_family", "")).strip().lower() for item in record["evidence"]}

    base_search = 80 if "google-trends" in families else 55
    base_social = 80 if {"tiktok", "instagram", "youtube"} & families else 40
    base_ecommerce = 60 if {"pinterest", "shopping", "tiktok-products"} & families else 20
    base_news = 45 if {"news", "press", "media"} & families else 15

    bonus = 10 if confidence >= 5 else 0

    if category == "food":
        search = min(100, base_search + 5 + bonus)
        social = min(100, base_social + 5 + bonus)
        ecommerce = min(100, base_ecommerce)
        news = min(100, base_news + 5)
    elif category == "fashion":
        search = min(100, base_search + bonus)
        social = min(100, base_social + 10 + bonus)
        ecommerce = min(100, base_ecommerce + 5)
        news = min(100, base_news)
    elif category == "brands":
        search = min(100, base_search + 5 + bonus)
        social = min(100, base_social + 5 + bonus)
        ecommerce = min(100, base_ecommerce + 15)
        news = min(100, base_news + 10)
    elif category == "products":
        search = min(100, base_search + bonus)
        social = min(100, base_social)
        ecommerce = min(100, base_ecommerce + 20 + bonus)
        news = min(100, base_news)
    else:
        search = min(100, base_search + bonus)
        social = min(100, base_social + 15 + bonus)
        ecommerce = 0
        news = min(100, base_news + 5)

    heat = round(search * 0.4 + social * 0.35 + ecommerce * 0.2 + news * 0.05)
    return heat, search, social, ecommerce, news


def build_sql_line(record: dict, country_ids: dict[str, str], category_ids: dict[str, str]) -> str:
    country_code = str(record["country_code"]).strip().upper()
    category = normalize_category(str(record["category"]))
    name = str(record["canonical_name"]).strip()
    name_local = pick_name_local(record)
    description = str(record["why_now"]).strip()
    heat, search, social, ecommerce, news = derive_scores(record)
    evidence = record["evidence"]
    source_urls = unique_in_order([str(item["url"]).strip() for item in evidence if str(item.get("url", "")).strip()])
    source_families = unique_in_order([str(item["source_family"]).strip().lower() for item in evidence if str(item.get("source_family", "")).strip()])
    tags = [
        "manual-verified",
        "weekly-7d",
        country_code.lower(),
        category,
        f"confidence-{int(record['confidence'])}",
        *source_families,
    ]

    line = (
        "INSERT INTO trends "
        "(country_id, category_id, name, name_local, description, heat_score, heat_status, "
        "search_score, social_score, ecommerce_score, news_score, tags, source_urls, first_detected_at, last_updated_at) "
        f"VALUES ('{country_ids[country_code]}', '{category_ids[category]}', '{sql_escape(name)}', "
        + (f"'{sql_escape(name_local)}'" if name_local else "NULL")
        + f", '{sql_escape(description)}', {heat}, 'verified', {search}, {social}, {ecommerce}, {news}, "
        f"{sql_array(tags)}, {sql_array(source_urls)}, '{record['first_detected_at']}', '{record['last_updated_at']}');"
    )
    return line


def main() -> None:
    args = parse_args()
    input_path = Path(args.input)
    records = load_records(input_path)
    country_ids, category_ids = load_ids()

    valid_records: list[dict] = []
    rejected: list[dict] = []

    for record in records:
        errors = validate_record(record, country_ids, category_ids)
        if errors:
            rejected.append(
                {
                    "country_code": record.get("country_code"),
                    "category": record.get("category"),
                    "canonical_name": record.get("canonical_name"),
                    "errors": errors,
                }
            )
            continue
        valid_records.append(record)

    output_path = Path(args.output) if args.output else OUTPUT_DIR / f"{input_path.stem}.sql"
    rejected_path = OUTPUT_DIR / f"{input_path.stem}.rejected.json"

    lines = [
        "-- MONTRA verified weekly trends",
        f"-- Generated at {utc_now()}",
        f"-- Source input: {input_path.name}",
        "",
    ]

    by_country = Counter()
    for record in sorted(valid_records, key=lambda item: (str(item["country_code"]).upper(), normalize_category(str(item["category"])), str(item["canonical_name"]).lower())):
        by_country[str(record["country_code"]).upper()] += 1
        lines.append(build_sql_line(record, country_ids, category_ids))

    output_path.write_text("\n".join(lines) + "\n", encoding="utf-8")
    rejected_path.write_text(json.dumps(rejected, ensure_ascii=False, indent=2), encoding="utf-8")

    print(f"Verified records: {len(valid_records)}")
    print(f"Rejected records: {len(rejected)}")
    print(f"SQL: {output_path}")
    print(f"Rejected report: {rejected_path}")
    if by_country:
        print("By country:")
        for country_code, count in sorted(by_country.items()):
            print(f"  {country_code}: {count}")


if __name__ == "__main__":
    main()
