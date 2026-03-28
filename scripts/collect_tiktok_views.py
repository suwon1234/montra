"""
MONTRA - TikTok 실제 조회수 수집기
TikTok-Api로 각 트렌드 해시태그의 실제 조회수를 수집하여 social_score 업데이트

사용법: py scripts/collect_tiktok_views.py
"""

import asyncio
import json
import sys
import urllib.request
from pathlib import Path

try:
    from TikTokApi import TikTokApi
except ImportError:
    print("ERROR: pip install TikTokApi")
    sys.exit(1)

SCRIPT_DIR = Path(__file__).parent
ENV_PATH = SCRIPT_DIR.parent / ".env.local"

SUPABASE_URL = ""
SUPABASE_KEY = ""
if ENV_PATH.exists():
    for line in ENV_PATH.read_text().split("\n"):
        if line.startswith("NEXT_PUBLIC_SUPABASE_URL="):
            SUPABASE_URL = line.split("=", 1)[1].strip()
        elif line.startswith("NEXT_PUBLIC_SUPABASE_ANON_KEY="):
            SUPABASE_KEY = line.split("=", 1)[1].strip()


def load_trends():
    """Supabase에서 트렌드 목록 로드"""
    all_trends = []
    offset = 0
    while True:
        url = (
            f"{SUPABASE_URL}/rest/v1/trends"
            f"?select=id,name,tags,social_score"
            f"&order=id&offset={offset}&limit=1000"
        )
        req = urllib.request.Request(url)
        req.add_header("apikey", SUPABASE_KEY)
        req.add_header("Authorization", f"Bearer {SUPABASE_KEY}")
        with urllib.request.urlopen(req) as resp:
            data = json.loads(resp.read().decode())
            if not data:
                break
            all_trends.extend(data)
            offset += 1000
            if len(data) < 1000:
                break
    return all_trends


def name_to_hashtag(name):
    """트렌드 이름을 해시태그로 변환"""
    # 특수문자 제거, 공백 제거, 소문자
    clean = name.lower()
    # 한국어/일본어/중국어는 그대로
    # 영어는 공백 제거
    clean = clean.replace(" ", "").replace("-", "").replace("'", "").replace(".", "")
    clean = clean.replace("(", "").replace(")", "").replace("/", "")
    clean = clean.replace("#", "").replace("&", "and")
    clean = clean.replace("'", "").replace("+", "")
    return clean


def views_to_score(views):
    """조회수를 0-100 점수로 변환"""
    if views <= 0:
        return 0
    if views >= 10_000_000_000:  # 100억+
        return 100
    if views >= 1_000_000_000:   # 10억+
        return 90 + int((views - 1_000_000_000) / 1_000_000_000 * 10)
    if views >= 100_000_000:     # 1억+
        return 75 + int((views - 100_000_000) / 100_000_000 * 15)
    if views >= 10_000_000:      # 1000만+
        return 60 + int((views - 10_000_000) / 10_000_000 * 15)
    if views >= 1_000_000:       # 100만+
        return 40 + int((views - 1_000_000) / 1_000_000 * 20)
    if views >= 100_000:         # 10만+
        return 20 + int((views - 100_000) / 100_000 * 20)
    if views >= 10_000:          # 1만+
        return 10 + int((views - 10_000) / 10_000 * 10)
    return max(1, int(views / 10_000 * 10))


async def main():
    print("=" * 60)
    print("MONTRA - TikTok Real View Count Collector")
    print("=" * 60)

    # 트렌드 로드
    print("\n[1/3] Loading trends from Supabase...")
    trends = load_trends()
    print(f"  Loaded {len(trends)} trends")

    # TikTok API 세션
    print("\n[2/3] Connecting to TikTok...")
    results = []

    async with TikTokApi() as api:
        await api.create_sessions(num_sessions=1, sleep_after=5, headless=True, browser='webkit')

        print(f"\n[3/3] Collecting view counts...")
        for i, trend in enumerate(trends):
            name = trend["name"]
            hashtag = name_to_hashtag(name)

            try:
                tag = api.hashtag(name=hashtag)
                info = await tag.info()
                stats = info.get("challengeInfo", {}).get("stats", {})
                views = stats.get("viewCount", 0)
                score = views_to_score(views)

                results.append({
                    "id": trend["id"],
                    "name": name,
                    "hashtag": hashtag,
                    "views": views,
                    "score": score,
                })

                if views > 0:
                    print(f"  [{i+1}/{len(trends)}] #{hashtag}: {views:,} views -> score {score}")
                else:
                    print(f"  [{i+1}/{len(trends)}] #{hashtag}: no data")

                await asyncio.sleep(1.5)

            except Exception as e:
                err = str(e)[:60]
                print(f"  [{i+1}/{len(trends)}] #{hashtag}: error - {err}")
                results.append({
                    "id": trend["id"],
                    "name": name,
                    "hashtag": hashtag,
                    "views": 0,
                    "score": 0,
                })
                await asyncio.sleep(3)

    # 결과 저장
    output_path = SCRIPT_DIR / "output" / "tiktok_views.json"
    with open(output_path, "w", encoding="utf-8") as f:
        json.dump(results, f, ensure_ascii=False, indent=2)

    # SQL 업데이트문 생성
    sql_path = SCRIPT_DIR / "output" / "update_social_scores.sql"
    with open(sql_path, "w", encoding="utf-8") as f:
        f.write("-- TikTok Real View Count -> social_score update\n")
        f.write(f"-- Generated: {__import__('datetime').datetime.now().isoformat()}\n\n")
        for r in results:
            if r["views"] > 0:
                f.write(f"UPDATE trends SET social_score = {r['score']} WHERE id = '{r['id']}'; -- #{r['hashtag']} {r['views']:,} views\n")

    success = sum(1 for r in results if r["views"] > 0)
    print(f"\n{'=' * 60}")
    print(f"Done! {success}/{len(trends)} with TikTok data")
    print(f"  Output: {output_path}")
    print(f"  SQL: {sql_path}")
    print(f"{'=' * 60}")


if __name__ == "__main__":
    asyncio.run(main())
