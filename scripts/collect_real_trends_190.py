"""
MONTRA - Weekly Trends Collector for 190 Countries

Goal:
- collect weekly Google Trends signals for every country in scripts/config/supabase_ids.json
- map them into MONTRA categories:
  fashion, products, food, brands, challenges
- save resumable JSON progress and a SQL file ready for Supabase upload

Notes:
- This is a scalable baseline collector. It relies on Google Trends 7-day rising/top queries.
- Challenge coverage is best-effort through challenge-related keyword seeds.
- Use --max-countries for smoke tests before a full run.

Examples:
  py scripts/collect_real_trends_190.py --max-countries 3 --delay-min 0 --delay-max 0
  py scripts/collect_real_trends_190.py --countries KR,JP,US
  py scripts/collect_real_trends_190.py --from-json scripts/output/real_trends_190_latest.json
"""

from __future__ import annotations

import argparse
import io
import json
import random
import re
import signal
import sys
import time
from datetime import datetime, timezone
from pathlib import Path

try:
    from pytrends.request import TrendReq
except ImportError:
    print("ERROR: pytrends is required. Install with: pip install pytrends")
    sys.exit(1)

try:
    sys.stdout.reconfigure(encoding="utf-8", errors="replace")
except Exception:
    sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding="utf-8", errors="replace")


SCRIPT_DIR = Path(__file__).parent
CONFIG_PATH = SCRIPT_DIR / "config" / "supabase_ids.json"
OUTPUT_DIR = SCRIPT_DIR / "output"
OUTPUT_DIR.mkdir(exist_ok=True)

CHALLENGES_CATEGORY_ID = "395a5576-8c5e-40a6-a965-28ead697a232"

QUERY_CONFIGS = [
    {"name": "fashion", "type": "category", "cat_id": 185, "default_category": "fashion"},
    {"name": "food", "type": "category", "cat_id": 71, "default_category": "food"},
    {"name": "shopping", "type": "category", "cat_id": 18, "default_category": "products"},
    {"name": "dance_challenge", "type": "keyword", "keyword": "dance challenge", "default_category": "challenges"},
    {"name": "viral_song", "type": "keyword", "keyword": "viral song", "default_category": "challenges"},
]

BRAND_INDICATORS = {
    "nike", "adidas", "zara", "uniqlo", "h&m", "hm", "shein", "temu",
    "apple", "samsung", "huawei", "xiaomi", "sony", "tesla", "rhode",
    "fenty", "sephora", "loreal", "maybelline", "dior", "chanel",
    "starbucks", "mcdonald", "kfc", "subway", "coca cola", "pepsi",
    "netflix", "spotify", "tiktok", "instagram", "amazon", "walmart",
    "ikea", "costco", "olay", "cerave", "shopee", "zalando",
}

FASHION_KEYWORDS = {
    "outfit", "dress", "shirt", "pants", "shoes", "sneaker", "bag", "jacket",
    "hoodie", "skirt", "jeans", "boots", "hat", "style", "fashion", "ootd",
    "coat", "blazer", "slacks", "outer", "wear", "apparel",
}

FOOD_KEYWORDS = {
    "recipe", "food", "cook", "eat", "drink", "coffee", "tea", "cake", "pizza",
    "burger", "sushi", "ramen", "noodle", "bread", "dessert", "restaurant",
    "snack", "fruit", "chocolate", "candy", "cookie", "ice cream", "bibimbap",
}

CHALLENGE_KEYWORDS = {
    "challenge", "dance", "song", "trend", "viral song", "reels", "tiktok",
}

GENERIC_EXACT_QUERIES = {
    "fashion", "food", "shopping", "products", "brands", "brand",
    "challenge", "dance challenge", "viral song",
}

NOISE_TERMS = {
    "vs", "death", "obituary", "score", "weather", "earthquake", "shooting",
    "election", "polls", "lottery",
}

NOISE_SUBSTRINGS = {
    " 대 ",
    " vs ",
    " v ",
}


def utc_now() -> str:
    return datetime.now(timezone.utc).replace(microsecond=0).isoformat().replace("+00:00", "Z")


def load_ids() -> tuple[dict[str, str], dict[str, str]]:
    raw = json.loads(CONFIG_PATH.read_text(encoding="utf-8"))
    categories = dict(raw["categories"])
    categories.setdefault("challenges", CHALLENGES_CATEGORY_ID)
    countries = dict(raw["countries"])
    return countries, categories


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser()
    parser.add_argument("--countries", help="Comma-separated country codes to run")
    parser.add_argument("--max-countries", type=int, help="Only process the first N countries")
    parser.add_argument("--delay-min", type=float, default=6.0)
    parser.add_argument("--delay-max", type=float, default=10.0)
    parser.add_argument("--limit-per-category", type=int, default=3)
    parser.add_argument("--from-json", help="Skip collection and generate SQL from an existing JSON file")
    parser.add_argument("--prefix", default="real_trends_190")
    return parser.parse_args()


def contains_term(query_text: str, term: str) -> bool:
    if any(ord(ch) > 127 for ch in term):
        return term in query_text
    if " " in term:
        return term in query_text
    return re.search(rf"(?<![a-z0-9]){re.escape(term)}(?![a-z0-9])", query_text) is not None


def has_any_term(query_text: str, terms: set[str]) -> bool:
    return any(contains_term(query_text, term) for term in terms)


def classify_query(query_text: str, source_name: str, default_category: str) -> tuple[str, bool]:
    q = query_text.lower()

    if default_category == "challenges":
        return "challenges", True

    if has_any_term(q, BRAND_INDICATORS):
        return "brands", True

    if has_any_term(q, CHALLENGE_KEYWORDS):
        return "challenges", True

    if has_any_term(q, FASHION_KEYWORDS):
        return "fashion", True

    if has_any_term(q, FOOD_KEYWORDS):
        return "food", True

    if source_name == "shopping":
        return "products", False

    return default_category, False


def normalize_query(query_text: str) -> str:
    return " ".join(query_text.lower().split())


def source_rank(source_name: str) -> int:
    ordering = {
        "dance_challenge": 0,
        "viral_song": 1,
        "fashion": 2,
        "food": 3,
        "shopping": 4,
    }
    return ordering.get(source_name, 9)


def item_rank(item: dict) -> tuple[int, int, int, int, str]:
    return (
        0 if item["explicit_category"] else 1,
        0 if item["query_type"] == "rising" else 1,
        -item["value"],
        source_rank(item["source"]),
        normalize_query(item["query"]),
    )


def is_generic_noise(query_text: str, explicit_category: bool) -> bool:
    q = normalize_query(query_text)

    if q in GENERIC_EXACT_QUERIES:
        return True
    if explicit_category:
        return False
    if any(token in q for token in NOISE_SUBSTRINGS):
        return True
    if has_any_term(q, NOISE_TERMS):
        return True
    return False


def collect_related_queries(pytrends: TrendReq, query_config: dict, geo: str, retries: int = 0) -> list[dict]:
    try:
        if query_config["type"] == "category":
            pytrends.build_payload([""], timeframe="now 7-d", geo=geo, cat=query_config["cat_id"])
            key = ""
        else:
            pytrends.build_payload([query_config["keyword"]], timeframe="now 7-d", geo=geo)
            key = query_config["keyword"]

        related = pytrends.related_queries()
        if key not in related:
            return []

        results: list[dict] = []
        rising = related[key].get("rising")
        top = related[key].get("top")

        if rising is not None and not rising.empty:
            for _, row in rising.head(10).iterrows():
                raw_value = row["value"]
                value = 100 if raw_value == "Breakout" else min(int(raw_value), 100)
                text = str(row["query"]).strip()
                if not text:
                    continue
                category, explicit = classify_query(text, query_config["name"], query_config["default_category"])
                if is_generic_noise(text, explicit):
                    continue
                results.append(
                    {
                        "query": text,
                        "value": value,
                        "raw_value": str(raw_value),
                        "query_type": "rising",
                        "source": query_config["name"],
                        "category": category,
                        "explicit_category": explicit,
                    }
                )

        if top is not None and not top.empty:
            for _, row in top.head(5).iterrows():
                text = str(row["query"]).strip()
                if not text:
                    continue
                value = min(int(row["value"]), 100)
                category, explicit = classify_query(text, query_config["name"], query_config["default_category"])
                if is_generic_noise(text, explicit):
                    continue
                results.append(
                    {
                        "query": text,
                        "value": value,
                        "raw_value": str(row["value"]),
                        "query_type": "top",
                        "source": query_config["name"],
                        "category": category,
                        "explicit_category": explicit,
                    }
                )

        return results
    except Exception:
        if retries >= 3:
            return []
        time.sleep(20 * (retries + 1))
        return collect_related_queries(pytrends, query_config, geo, retries + 1)


def score_fields(category: str, search_score: int) -> tuple[int, int, int, int]:
    if category == "challenges":
        social = min(100, round(search_score * 0.9))
        return search_score, social, 0, round(search_score * 0.2)
    if category == "brands":
        social = min(100, round(search_score * 0.55))
        ecommerce = min(100, round(search_score * 0.35))
        return search_score, social, ecommerce, round(search_score * 0.15)
    if category == "products":
        social = min(100, round(search_score * 0.25))
        ecommerce = min(100, round(search_score * 0.65))
        return search_score, social, ecommerce, round(search_score * 0.1)
    if category == "fashion":
        social = min(100, round(search_score * 0.6))
        return search_score, social, round(search_score * 0.15), round(search_score * 0.1)
    if category == "food":
        social = min(100, round(search_score * 0.5))
        return search_score, social, round(search_score * 0.1), round(search_score * 0.15)
    return search_score, 0, 0, 0


def heat_score(search_score: int, social_score: int, ecommerce_score: int, news_score: int) -> int:
    return round(search_score * 0.4 + social_score * 0.35 + ecommerce_score * 0.2 + news_score * 0.05)


def sql_escape(value: str) -> str:
    return value.replace("'", "''")


def sql_array(items: list[str]) -> str:
    if not items:
        return "ARRAY[]::text[]"
    return "ARRAY[" + ",".join("'" + sql_escape(item) + "'" for item in items) + "]"


def write_sql(data: dict[str, list[dict]], country_ids: dict[str, str], category_ids: dict[str, str], output_path: Path) -> int:
    lines = [
        f"-- MONTRA 190-country weekly trends",
        f"-- Generated at {utc_now()}",
        "-- Source: Google Trends 7-day related queries",
        "",
    ]
    count = 0

    for country_code in sorted(data.keys()):
        trends = data[country_code]
        if not trends or country_code not in country_ids:
            continue

        lines.append(f"-- {country_code}")
        for item in trends:
            category = item["category"]
            category_id = category_ids.get(category)
            if not category_id:
                continue

            search_score, social_score, ecommerce_score, news_score = score_fields(category, item["value"])
            heat = heat_score(search_score, social_score, ecommerce_score, news_score)
            name = item["query"]
            has_non_ascii = any(ord(ch) > 127 for ch in name)
            name_local = name if has_non_ascii else None
            desc = (
                f"Google Trends 7-day {item['query_type']} query in {country_code}. "
                f"Source bucket: {item['source']}. Raw value: {item['raw_value']}."
            )
            tags = [
                "google-trends",
                "weekly-7d",
                country_code.lower(),
                item["source"],
                category,
            ]
            source_urls = ["https://trends.google.com/trends/"]
            first_detected_at = utc_now()
            last_updated_at = first_detected_at

            line = (
                "INSERT INTO trends "
                "(country_id, category_id, name, name_local, description, heat_score, heat_status, "
                "search_score, social_score, ecommerce_score, news_score, tags, source_urls, first_detected_at, last_updated_at) "
                f"VALUES ('{country_ids[country_code]}', '{category_id}', '{sql_escape(name)}', "
                + (f"'{sql_escape(name_local)}'" if name_local else "NULL")
                + f", '{sql_escape(desc)}', {heat}, 'rising', {search_score}, {social_score}, {ecommerce_score}, {news_score}, "
                f"{sql_array(tags)}, {sql_array(source_urls)}, '{first_detected_at}', '{last_updated_at}');"
            )
            lines.append(line)
            count += 1

        lines.append("")

    output_path.write_text("\n".join(lines), encoding="utf-8")
    return count


def reduce_country_results(results: list[dict], limit_per_category: int) -> list[dict]:
    query_groups: dict[str, list[dict]] = {}
    category_counts: dict[str, int] = {}

    for item in results:
        query_groups.setdefault(normalize_query(item["query"]), []).append(item)

    canonical: list[dict] = []

    for group in query_groups.values():
        categories = {item["category"] for item in group}
        explicit_items = [item for item in group if item["explicit_category"]]

        if explicit_items:
            winner = sorted(explicit_items, key=item_rank)[0]
        elif len(categories) == 1:
            winner = sorted(group, key=item_rank)[0]
        else:
            # If a generic query lands in multiple buckets without explicit evidence,
            # it is usually broad news noise rather than a usable commerce/culture trend.
            continue
        canonical.append(winner)

    deduped: list[dict] = []
    for item in sorted(canonical, key=item_rank):
        if category_counts.get(item["category"], 0) >= limit_per_category:
            continue
        category_counts[item["category"]] = category_counts.get(item["category"], 0) + 1
        deduped.append(item)

    return deduped


def main() -> None:
    args = parse_args()
    country_ids, category_ids = load_ids()

    if args.from_json:
        source_path = Path(args.from_json)
        payload = json.loads(source_path.read_text(encoding="utf-8"))
        sql_path = OUTPUT_DIR / f"{args.prefix}_{datetime.now().strftime('%Y-%m-%d')}.sql"
        count = write_sql(payload, country_ids, category_ids, sql_path)
        print(f"SQL written: {sql_path} ({count} rows)")
        return

    country_codes = sorted(country_ids.keys())
    if args.countries:
        requested = [code.strip().upper() for code in args.countries.split(",") if code.strip()]
        country_codes = [code for code in requested if code in country_ids]
    if args.max_countries:
        country_codes = country_codes[: args.max_countries]

    date_slug = datetime.now().strftime("%Y-%m-%d")
    progress_path = OUTPUT_DIR / f"{args.prefix}_{date_slug}_progress.json"
    json_path = OUTPUT_DIR / f"{args.prefix}_{date_slug}.json"
    sql_path = OUTPUT_DIR / f"{args.prefix}_{date_slug}.sql"

    if progress_path.exists():
        payload = json.loads(progress_path.read_text(encoding="utf-8"))
        done_countries = set(payload.get("done_countries", []))
        all_trends = payload.get("trends", {})
    else:
        done_countries = set()
        all_trends: dict[str, list[dict]] = {}

    pytrends = TrendReq(hl="en-US", tz=540, timeout=(10, 25))

    def save_progress() -> None:
        progress = {
            "done_countries": sorted(done_countries),
            "trends": all_trends,
            "last_saved": utc_now(),
        }
        progress_path.write_text(json.dumps(progress, ensure_ascii=False, indent=2), encoding="utf-8")
        json_path.write_text(json.dumps(all_trends, ensure_ascii=False, indent=2), encoding="utf-8")
        row_count = write_sql(all_trends, country_ids, category_ids, sql_path)
        print(f"  [saved] {len(done_countries)}/{len(country_codes)} countries, {row_count} rows")

    def handle_interrupt(_sig, _frame) -> None:
        print("\nInterrupted. Saving progress...")
        save_progress()
        sys.exit(0)

    signal.signal(signal.SIGINT, handle_interrupt)

    print("=" * 60)
    print("MONTRA - Weekly Trends Collector for 190 Countries")
    print("=" * 60)
    print(f"Countries queued: {len(country_codes)}")
    print(f"Delay: {args.delay_min:.1f}s - {args.delay_max:.1f}s")
    print(f"Limit per category: {args.limit_per_category}")

    for index, country_code in enumerate(country_codes, start=1):
        if country_code in done_countries:
            continue

        print(f"\n[{index}/{len(country_codes)}] {country_code}")
        collected: list[dict] = []

        for query_config in QUERY_CONFIGS:
            batch = collect_related_queries(pytrends, query_config, country_code)
            collected.extend(batch)
            print(f"  {query_config['name']}: {len(batch)}")
            time.sleep(random.uniform(args.delay_min, args.delay_max))

        all_trends[country_code] = reduce_country_results(collected, args.limit_per_category)
        done_countries.add(country_code)
        print(f"  kept: {len(all_trends[country_code])}")
        save_progress()

    total_rows = write_sql(all_trends, country_ids, category_ids, sql_path)
    print("\nDone")
    print(f"JSON: {json_path}")
    print(f"SQL:  {sql_path}")
    print(f"Rows: {total_rows}")


if __name__ == "__main__":
    main()
