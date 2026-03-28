"""
MONTRA - Real Trends Collector v2
Google Trends에서 실제 급상승 검색어 + TikTok/Instagram 챌린지 수집
190개국 × 5쿼리 (Fashion/Food/Shopping/TikTok/Instagram)

사용법: py scripts/collect_real_trends_v2.py
출력: scripts/output/real_trends_v2.json
"""

import json
import time
import random
import sys
import signal
from datetime import datetime
from pathlib import Path

try:
    from pytrends.request import TrendReq
except ImportError:
    print("ERROR: pip install pytrends")
    sys.exit(1)

import warnings
warnings.filterwarnings("ignore")

SCRIPT_DIR = Path(__file__).parent
CONFIG_PATH = SCRIPT_DIR / "config" / "supabase_ids.json"
OUTPUT_DIR = SCRIPT_DIR / "output"
OUTPUT_DIR.mkdir(exist_ok=True)

# Google Trends 카테고리 (검색량 실데이터) + 브랜드
# TikTok/Instagram 트렌드는 WebSearch로 별도 수집 (언어 문제 없음)
QUERIES = [
    {"name": "fashion", "type": "category", "cat_id": 185, "our_category": "fashion"},
    {"name": "food", "type": "category", "cat_id": 71, "our_category": "food"},
    {"name": "shopping", "type": "category", "cat_id": 18, "our_category": "products"},
    {"name": "brands", "type": "category", "cat_id": 18, "our_category": "brands"},  # Shopping에서 브랜드 추출
]

# Brand detection keywords
BRAND_INDICATORS = [
    # Known global brands
    "nike", "adidas", "zara", "uniqlo", "h&m", "shein", "temu",
    "apple", "samsung", "huawei", "xiaomi", "sony",
    "starbucks", "mcdonald", "kfc", "subway",
    "coca cola", "pepsi", "nestle",
    "l'oreal", "maybelline", "fenty", "rhode", "dior", "chanel",
    "netflix", "disney", "spotify", "tiktok", "instagram",
    "amazon", "walmart", "costco", "ikea",
]

# Category classification keywords
FASHION_KEYWORDS = [
    "outfit", "dress", "shirt", "pants", "shoes", "sneaker", "bag", "jacket",
    "hoodie", "skirt", "jeans", "boots", "hat", "wear", "style", "fashion",
    "ootd", "clothing", "apparel", "accessori",
]
FOOD_KEYWORDS = [
    "recipe", "food", "cook", "eat", "drink", "coffee", "tea", "cake",
    "pizza", "burger", "sushi", "ramen", "noodle", "bread", "dessert",
    "restaurant", "snack", "fruit", "chocolate", "candy",
]

MIN_DELAY = 12
MAX_DELAY = 20
THROTTLE_DELAY = 90
MAX_RETRIES = 5

# Load country IDs
with open(CONFIG_PATH, "r") as f:
    config = json.load(f)

# 주요 30개국 (나머지는 추후 수집하여 업데이트)
PRIORITY_COUNTRIES = [
    # Asia (10)
    "KR", "JP", "CN", "IN", "TH", "VN", "TW", "SG", "ID", "PH",
    # Europe (8)
    "GB", "FR", "DE", "IT", "ES", "NL", "SE", "PL",
    # Americas (6)
    "US", "CA", "MX", "BR", "AR", "CO",
    # Middle East (3)
    "AE", "SA", "TR",
    # Africa (2)
    "NG", "ZA",
    # Oceania (1)
    "AU",
]
COUNTRY_CODES = PRIORITY_COUNTRIES
CATEGORY_IDS = config["categories"]

# Progress
PROGRESS_FILE = OUTPUT_DIR / "real_trends_v2_progress.json"
OUTPUT_FILE = OUTPUT_DIR / "real_trends_v2.json"


def classify_query(query_text):
    """Classify a search query into our categories."""
    q = query_text.lower()

    # Check brand first
    for brand in BRAND_INDICATORS:
        if brand in q:
            return "brands"

    # Check fashion
    for kw in FASHION_KEYWORDS:
        if kw in q:
            return "fashion"

    # Check food
    for kw in FOOD_KEYWORDS:
        if kw in q:
            return "food"

    # Default to products
    return "products"


def collect_rising_queries(pytrends, query_config, geo, retries=0):
    """Get rising queries for a category or keyword in a country."""
    try:
        if query_config["type"] == "category":
            pytrends.build_payload(
                [""],
                timeframe="now 7-d",
                geo=geo,
                cat=query_config["cat_id"],
            )
        else:
            pytrends.build_payload(
                [query_config["keyword"]],
                timeframe="now 7-d",
                geo=geo,
            )

        related = pytrends.related_queries()

        results = []
        # Get the key ('' for category, keyword for keyword search)
        key = "" if query_config["type"] == "category" else query_config["keyword"]

        if key not in related:
            return results

        # Rising queries (급상승)
        rising = related[key].get("rising")
        if rising is not None and not rising.empty:
            for _, row in rising.head(10).iterrows():
                query_text = str(row["query"])
                value = int(row["value"]) if row["value"] != "Breakout" else 5000

                if query_config["our_category"] == "auto":
                    category = classify_query(query_text)
                else:
                    category = query_config["our_category"]

                results.append({
                    "query": query_text,
                    "value": value,
                    "type": "rising",
                    "category": category,
                    "source": query_config["name"],
                })

        # Top queries (인기)
        top = related[key].get("top")
        if top is not None and not top.empty:
            for _, row in top.head(5).iterrows():
                query_text = str(row["query"])
                value = int(row["value"])

                if query_config["our_category"] == "auto":
                    category = classify_query(query_text)
                else:
                    category = query_config["our_category"]

                results.append({
                    "query": query_text,
                    "value": value,
                    "type": "top",
                    "category": category,
                    "source": query_config["name"],
                })

        return results

    except Exception as e:
        err = str(e)
        if ("429" in err or "Too Many" in err) and retries < MAX_RETRIES:
            wait = THROTTLE_DELAY * (retries + 1)
            print(f"    Rate limited. Waiting {wait}s...")
            time.sleep(wait)
            return collect_rising_queries(pytrends, query_config, geo, retries + 1)
        elif retries < MAX_RETRIES:
            time.sleep(15)
            return collect_rising_queries(pytrends, query_config, geo, retries + 1)
        return []


def get_interest_over_time(pytrends, keyword, geo, retries=0):
    """Get 30-day search interest for a specific keyword."""
    try:
        pytrends.build_payload([keyword], timeframe="today 1-m", geo=geo)
        df = pytrends.interest_over_time()
        if df.empty:
            return None
        return [{"date": d.strftime("%Y-%m-%d"), "value": int(row[keyword])} for d, row in df.iterrows()]
    except Exception as e:
        if ("429" in str(e) or "Too Many" in str(e)) and retries < MAX_RETRIES:
            time.sleep(THROTTLE_DELAY * (retries + 1))
            return get_interest_over_time(pytrends, keyword, geo, retries + 1)
        elif retries < MAX_RETRIES:
            time.sleep(10)
            return get_interest_over_time(pytrends, keyword, geo, retries + 1)
        return None


def main():
    print("=" * 60)
    print("MONTRA - Real Trends Collector v2")
    print("Google Trends + TikTok/Instagram Challenges")
    print("=" * 60)

    pytrends = TrendReq(hl="en-US", tz=540)

    # Load progress
    collected_countries = set()
    all_trends = {}
    if PROGRESS_FILE.exists():
        with open(PROGRESS_FILE, "r", encoding="utf-8") as f:
            prog = json.load(f)
            collected_countries = set(prog.get("done_countries", []))
            all_trends = prog.get("trends", {})
        print(f"  Resuming: {len(collected_countries)} countries done")

    total_countries = len(COUNTRY_CODES)
    done = len(collected_countries)

    def save_progress():
        with open(PROGRESS_FILE, "w", encoding="utf-8") as f:
            json.dump({
                "done_countries": list(collected_countries),
                "trends": all_trends,
                "last_saved": datetime.now().isoformat(),
            }, f, ensure_ascii=False, indent=2)
        print(f"  [SAVED] {done}/{total_countries} countries")

    def handle_interrupt(sig, frame):
        print("\n\n  Ctrl+C! Saving...")
        save_progress()
        # Also save current results as JSON
        with open(OUTPUT_FILE, "w", encoding="utf-8") as f:
            json.dump(all_trends, f, ensure_ascii=False, indent=2)
        print(f"  Resume: py scripts/collect_real_trends_v2.py")
        sys.exit(0)

    signal.signal(signal.SIGINT, handle_interrupt)

    print(f"\n  Countries: {total_countries}")
    print(f"  Queries per country: {len(QUERIES)}")
    print(f"  Est. time: ~{(total_countries - done) * len(QUERIES) * (MIN_DELAY + MAX_DELAY) / 2 / 3600:.1f}h")

    for country_code in COUNTRY_CODES:
        if country_code in collected_countries:
            continue

        done += 1
        country_trends = []

        print(f"\n  [{done}/{total_countries}] {country_code}")

        for q in QUERIES:
            results = collect_rising_queries(pytrends, q, country_code)
            if results:
                country_trends.extend(results)
                print(f"    [{q['name']}] {len(results)} queries found")
            else:
                print(f"    [{q['name']}] no data")

            time.sleep(random.uniform(MIN_DELAY, MAX_DELAY))

        # Deduplicate by query text
        seen = set()
        unique_trends = []
        for t in country_trends:
            if t["query"].lower() not in seen:
                seen.add(t["query"].lower())
                unique_trends.append(t)

        all_trends[country_code] = unique_trends
        collected_countries.add(country_code)

        # Now get 30-day history for top 5 rising queries
        top_rising = sorted(
            [t for t in unique_trends if t["type"] == "rising"],
            key=lambda x: x["value"],
            reverse=True,
        )[:5]

        for t in top_rising:
            history = get_interest_over_time(pytrends, t["query"], country_code)
            if history:
                t["history"] = history
                print(f"    [history] {t['query'][:30]} - {len(history)} days")
            time.sleep(random.uniform(MIN_DELAY, MAX_DELAY))

        # Save every country
        save_progress()

    # Final save
    save_progress()
    with open(OUTPUT_FILE, "w", encoding="utf-8") as f:
        json.dump(all_trends, f, ensure_ascii=False, indent=2)

    # Stats
    total_trends = sum(len(v) for v in all_trends.values())
    countries_with_data = sum(1 for v in all_trends.values() if v)
    print(f"\n{'=' * 60}")
    print(f"DONE!")
    print(f"  Countries with data: {countries_with_data}/{total_countries}")
    print(f"  Total trends collected: {total_trends}")
    print(f"  Output: {OUTPUT_FILE}")
    print(f"{'=' * 60}")


if __name__ == "__main__":
    main()
