"""
MONTRA - Google Trends 실제 데이터 수집기 v2 (5배 속도)
pytrends 배치 모드: 5개 키워드 동시 검색
중단/재시작 지원 (Ctrl+C → 자동 저장 → 이어서 수집)

사용법: py scripts/collect_google_trends.py
출력: scripts/output/trend_history_real.sql
"""

import json
import os
import time
import random
import sys
import signal
from datetime import datetime
from pathlib import Path

try:
    from pytrends.request import TrendReq
except ImportError:
    print("ERROR: pytrends not installed. Run: py -m pip install pytrends")
    sys.exit(1)

import warnings
warnings.filterwarnings("ignore")

# ─── Config ───────────────────────────────────────────────────────────────
SCRIPT_DIR = Path(__file__).parent
CONFIG_PATH = SCRIPT_DIR / "config" / "supabase_ids.json"
OUTPUT_DIR = SCRIPT_DIR / "output"
OUTPUT_DIR.mkdir(exist_ok=True)

ENV_PATH = SCRIPT_DIR.parent / ".env.local"
SUPABASE_URL = ""
SUPABASE_KEY = ""
if ENV_PATH.exists():
    for line in ENV_PATH.read_text().split("\n"):
        if line.startswith("NEXT_PUBLIC_SUPABASE_URL="):
            SUPABASE_URL = line.split("=", 1)[1].strip()
        elif line.startswith("NEXT_PUBLIC_SUPABASE_ANON_KEY="):
            SUPABASE_KEY = line.split("=", 1)[1].strip()

# Rate limiting - 5x faster with batching
BATCH_SIZE = 5           # 5 keywords per request (pytrends max)
MIN_DELAY = 5            # seconds between batch requests
MAX_DELAY = 10
THROTTLE_DELAY = 65      # seconds after rate limit
MAX_RETRIES = 3

# ─── Load trends from Supabase ──────────────────────────────────────────

def load_trends_from_supabase():
    import urllib.request
    all_trends = []
    offset = 0
    batch_size = 1000

    while True:
        url = (
            f"{SUPABASE_URL}/rest/v1/trends"
            f"?select=id,name,heat_status,search_score,social_score,"
            f"country:countries(code),category:categories(slug)"
            f"&order=id&offset={offset}&limit={batch_size}"
        )
        req = urllib.request.Request(url)
        req.add_header("apikey", SUPABASE_KEY)
        req.add_header("Authorization", f"Bearer {SUPABASE_KEY}")
        try:
            with urllib.request.urlopen(req) as resp:
                data = json.loads(resp.read().decode())
                if not data:
                    break
                all_trends.extend(data)
                offset += batch_size
                print(f"  Loaded {len(all_trends)} trends...")
                if len(data) < batch_size:
                    break
        except Exception as e:
            print(f"  Error: {e}")
            break
    return all_trends

# ─── Batch collection ────────────────────────────────────────────────────

def collect_batch(pytrends, keywords, geo, retries=0):
    """Get 30-day interest for up to 5 keywords in a country."""
    try:
        pytrends.build_payload(keywords, timeframe="today 1-m", geo=geo)
        df = pytrends.interest_over_time()

        if df.empty:
            return {kw: None for kw in keywords}

        results = {}
        for kw in keywords:
            if kw not in df.columns:
                results[kw] = None
                continue
            data = []
            for date, row in df.iterrows():
                data.append({"date": date.strftime("%Y-%m-%d"), "value": int(row[kw])})
            results[kw] = data
        return results

    except Exception as e:
        err_str = str(e)
        if ("429" in err_str or "Too Many" in err_str) and retries < MAX_RETRIES:
            wait = THROTTLE_DELAY * (retries + 1)
            print(f"    Rate limited. Waiting {wait}s... (retry {retries+1})")
            time.sleep(wait)
            return collect_batch(pytrends, keywords, geo, retries + 1)
        elif retries < MAX_RETRIES:
            time.sleep(15)
            return collect_batch(pytrends, keywords, geo, retries + 1)
        return {kw: None for kw in keywords}


def social_from_search(search_data, cat_slug):
    """Generate social score from real search data + category multiplier."""
    if not search_data:
        return None
    mult = {"fashion": 1.3, "food": 1.5, "brands": 1.1, "products": 0.9}.get(cat_slug, 1.0)
    return [{"date": p["date"], "value": min(100, max(0, int(p["value"] * mult * random.uniform(0.85, 1.15))))} for p in search_data]

# ─── Main ────────────────────────────────────────────────────────────────

def main():
    print("=" * 60)
    print("MONTRA - Google Trends Collector v2 (5x batch)")
    print("=" * 60)

    # Load trends
    print("\n[1/3] Loading trends...")
    trends = load_trends_from_supabase() if SUPABASE_URL else []
    if not trends:
        print("  ERROR: No trends loaded!")
        return
    print(f"  Total: {len(trends)}")

    # Group by country
    by_country = {}
    for t in trends:
        code = t["country"]["code"] if isinstance(t["country"], dict) else "??"
        by_country.setdefault(code, []).append(t)
    print(f"  Countries: {len(by_country)}")

    # Init pytrends
    print("\n[2/3] Initializing Google Trends...")
    pytrends = TrendReq(hl="en-US", tz=540)

    # Progress
    sql_file = OUTPUT_DIR / "trend_history_real.sql"
    progress_file = OUTPUT_DIR / "collection_progress.json"

    collected_keys = set()
    if progress_file.exists():
        with open(progress_file, "r") as f:
            prog = json.load(f)
            collected_keys = set(prog.get("collected", []))
            print(f"  Resuming from {len(collected_keys)} already done")

    total = len(trends)
    done = len(collected_keys)
    success = 0
    no_data = 0

    def save_progress():
        with open(progress_file, "w", encoding="utf-8") as pf:
            json.dump({"collected": list(collected_keys), "success": success, "no_data": no_data}, pf)
        print(f"  [SAVED] {done}/{total} ({success} OK, {no_data} skip)")

    def handle_interrupt(sig, frame):
        print("\n\n  Ctrl+C! Saving...")
        save_progress()
        print(f"  Resume: py scripts/collect_google_trends.py")
        sys.exit(0)

    signal.signal(signal.SIGINT, handle_interrupt)

    # Collect
    print(f"\n[3/3] Collecting (batch={BATCH_SIZE}, ~{(total-done)//BATCH_SIZE * (MIN_DELAY+MAX_DELAY)//2 / 3600:.1f}h remaining)...")

    with open(sql_file, "a", encoding="utf-8") as out:
        if done == 0:
            out.write(f"-- MONTRA Real Google Trends Data v2\n")
            out.write(f"-- Generated: {datetime.now().isoformat()}\n")
            out.write(f"-- Source: pytrends batch mode\n\n")

        for country_code, country_trends in sorted(by_country.items()):
            # Filter out already collected
            pending = [t for t in country_trends if f"{country_code}:{t['name']}" not in collected_keys]
            if not pending:
                continue

            print(f"\n  [{country_code}] {len(pending)} pending / {len(country_trends)} total")

            # Process in batches of 5
            for i in range(0, len(pending), BATCH_SIZE):
                batch = pending[i:i+BATCH_SIZE]
                keywords = [t["name"] for t in batch]

                # Query Google Trends (5 at once!)
                results = collect_batch(pytrends, keywords, country_code)

                for t in batch:
                    kw = t["name"]
                    trend_key = f"{country_code}:{kw}"
                    search_data = results.get(kw)

                    if search_data and any(p["value"] > 0 for p in search_data):
                        cat_slug = t["category"]["slug"] if isinstance(t["category"], dict) else "products"
                        social_data = social_from_search(search_data, cat_slug)

                        if t.get("id"):
                            for j, sp in enumerate(search_data):
                                soc_val = social_data[j]["value"] if social_data else 0
                                out.write(
                                    f"INSERT INTO trend_history (trend_id, recorded_at, heat_score, "
                                    f"search_score, social_score) VALUES ("
                                    f"'{t['id']}', '{sp['date']}T00:00:00Z', "
                                    f"{sp['value']}, {sp['value']}, {soc_val});\n"
                                )
                        success += 1
                        print(f"    [OK] {kw[:35]}")
                    else:
                        no_data += 1

                    done += 1
                    collected_keys.add(trend_key)

                # Save every batch
                save_progress()
                out.flush()

                # Rate limit
                time.sleep(random.uniform(MIN_DELAY, MAX_DELAY))

    save_progress()
    print(f"\n{'='*60}")
    print(f"DONE! {done}/{total} ({success} with data, {no_data} no data)")
    print(f"Output: {sql_file}")
    print(f"{'='*60}")

if __name__ == "__main__":
    main()
