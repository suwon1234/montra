"""
MONTRA SerpAPI 수집기
Google Shopping에서 국가별/카테고리별 실제 트렌드 상품을 수집하여 SQL로 출력.

사용법: py scripts/collect_serpapi.py
출력: scripts/output/serpapi_trends.sql
"""

import sys
import io
import os
import json
import time
import urllib.request
import urllib.parse
import random
from datetime import datetime, timezone, timedelta
from pathlib import Path

sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8', errors='replace')

SCRIPT_DIR = Path(__file__).parent
OUTPUT_DIR = SCRIPT_DIR / "output"
OUTPUT_DIR.mkdir(exist_ok=True)

# SerpAPI 키 — 환경변수 우선, 없으면 .env.local 의 SERPAPI_KEY= 라인에서 읽음
ENV_PATH = SCRIPT_DIR.parent / ".env.local"
API_KEY = os.environ.get("SERPAPI_KEY", "")
if not API_KEY and ENV_PATH.exists():
    for line in ENV_PATH.read_text(encoding="utf-8").split("\n"):
        if line.startswith("SERPAPI_KEY="):
            API_KEY = line.split("=", 1)[1].strip()
            break
if not API_KEY:
    print("ERROR: SERPAPI_KEY is missing in environment or .env.local")
    sys.exit(1)

# 6개국
COUNTRIES = [
    {"code": "KR", "gl": "kr", "hl": "ko", "name_ko": "한국", "name_en": "South Korea"},
    {"code": "US", "gl": "us", "hl": "en", "name_ko": "미국", "name_en": "United States"},
    {"code": "JP", "gl": "jp", "hl": "ja", "name_ko": "일본", "name_en": "Japan"},
    {"code": "CN", "gl": "cn", "hl": "zh-cn", "name_ko": "중국", "name_en": "China"},
    {"code": "GB", "gl": "uk", "hl": "en", "name_ko": "영국", "name_en": "United Kingdom"},
    {"code": "FR", "gl": "fr", "hl": "fr", "name_ko": "프랑스", "name_en": "France"},
]

# 4개 카테고리 + 국가별 검색어
CATEGORIES = {
    "fashion": {
        "name_ko": "옷", "name_en": "Fashion", "emoji": "👗",
        "queries": {
            "KR": "2026 인기 패션 트렌드 옷",
            "US": "trending fashion clothes 2026",
            "JP": "2026 トレンド ファッション 服",
            "CN": "2026 流行服装 时尚",
            "GB": "trending fashion clothes UK 2026",
            "FR": "tendance mode vêtements 2026",
        }
    },
    "products": {
        "name_ko": "상품", "name_en": "Products", "emoji": "🛍️",
        "queries": {
            "KR": "2026 인기 상품 핫템 추천",
            "US": "trending products viral 2026",
            "JP": "2026 人気商品 トレンド おすすめ",
            "CN": "2026 热门商品 爆款",
            "GB": "trending products UK viral 2026",
            "FR": "produits tendance populaire 2026",
        }
    },
    "food": {
        "name_ko": "음식", "name_en": "Food", "emoji": "🍽️",
        "queries": {
            "KR": "2026 인기 음식 디저트 간식 트렌드",
            "US": "trending food snacks dessert 2026",
            "JP": "2026 人気 スイーツ お菓子 トレンド",
            "CN": "2026 网红美食 零食 甜品",
            "GB": "trending food snacks UK 2026",
            "FR": "tendance nourriture dessert snack 2026",
        }
    },
    "entertainment": {
        "name_ko": "놀이", "name_en": "Entertainment", "emoji": "🎮",
        "queries": {
            "KR": "2026 인기 굿즈 게임 장난감 취미",
            "US": "trending toys games gadgets hobby 2026",
            "JP": "2026 人気 グッズ ゲーム おもちゃ",
            "CN": "2026 热门玩具 游戏 周边",
            "GB": "trending toys games gadgets UK 2026",
            "FR": "tendance jouets jeux gadgets 2026",
        }
    },
}


def log(msg: str):
    print(f"[{datetime.now().strftime('%H:%M:%S')}] {msg}")


def search_google_shopping(query: str, gl: str, hl: str, num: int = 20) -> list[dict]:
    """SerpAPI Google Shopping 검색"""
    params = urllib.parse.urlencode({
        "engine": "google_shopping",
        "q": query,
        "gl": gl,
        "hl": hl,
        "num": num,
        "api_key": API_KEY,
    })
    url = f"https://serpapi.com/search.json?{params}"

    try:
        req = urllib.request.Request(url)
        resp = urllib.request.urlopen(req, timeout=30)
        data = json.loads(resp.read().decode("utf-8"))
        return data.get("shopping_results", [])
    except Exception as e:
        log(f"    API Error: {e}")
        return []


def escape_sql(s: str) -> str:
    if not s:
        return ""
    return s.replace("'", "''").replace("\\", "\\\\")


def calculate_heat_score(position: int, rating: float, reviews: int, price_str: str) -> int:
    """상품 위치, 평점, 리뷰 수 기반 heat score 계산"""
    # 위치 점수 (1위=100, 20위=50)
    position_score = max(100 - (position - 1) * 2.5, 30)

    # 평점 보너스
    rating_bonus = (rating - 3.0) * 10 if rating > 0 else 0

    # 리뷰 수 보너스 (로그 스케일)
    import math
    review_bonus = min(math.log10(max(reviews, 1)) * 5, 20)

    score = position_score + rating_bonus + review_bonus
    return max(0, min(100, int(score)))


def determine_heat_status(score: int, position: int) -> str:
    if position <= 5 and score >= 80:
        return "rising"
    elif score >= 60:
        return "steady"
    elif score >= 40:
        return "new"
    else:
        return "cooling"


def main():
    log("=" * 60)
    log("MONTRA SerpAPI 실제 상품 수집 시작")
    log(f"카테고리: {', '.join(CATEGORIES.keys())}")
    log(f"국가: {', '.join(c['code'] for c in COUNTRIES)}")
    log("=" * 60)

    all_trends = []
    now = datetime.now(timezone.utc)
    api_calls = 0

    for country in COUNTRIES:
        code = country["code"]
        log(f"\n[{code}] {country['name_ko']} 수집 중...")

        for cat_slug, cat_info in CATEGORIES.items():
            query = cat_info["queries"].get(code, cat_info["queries"]["US"])
            log(f"  [{cat_slug}] 검색: {query}")

            results = search_google_shopping(query, country["gl"], country["hl"], num=20)
            api_calls += 1
            log(f"  [{cat_slug}] 결과: {len(results)}개 상품")

            for i, item in enumerate(results[:15]):  # 카테고리당 최대 15개
                title = item.get("title", "")
                price = item.get("price", "")
                source = item.get("source", "")
                rating = item.get("rating", 0) or 0
                reviews = item.get("reviews", 0) or 0
                thumbnail = item.get("thumbnail", "")
                link = item.get("link", "")
                product_link = item.get("product_link", "")

                if not title:
                    continue

                position = item.get("position", i + 1)
                score = calculate_heat_score(position, float(rating), int(reviews), price)
                status = determine_heat_status(score, position)

                # 태그 생성
                tags = []
                if source:
                    tags.append(source)
                if price:
                    tags.append(price)
                if rating > 0:
                    tags.append(f"★{rating}")

                # 설명 생성
                desc_parts = []
                if source:
                    desc_parts.append(f"판매처: {source}")
                if price:
                    desc_parts.append(f"가격: {price}")
                if rating > 0:
                    desc_parts.append(f"평점: {rating}")
                if reviews > 0:
                    desc_parts.append(f"리뷰: {reviews:,}개")
                description = " | ".join(desc_parts) if desc_parts else title

                all_trends.append({
                    "country_code": code,
                    "category_slug": cat_slug,
                    "name": title[:200],
                    "description": description[:500],
                    "image_url": thumbnail,
                    "heat_score": score,
                    "heat_status": status,
                    "search_score": max(score - 5, 0),
                    "social_score": max(score - 15, 0),
                    "ecommerce_score": score,
                    "news_score": max(score - 25, 0),
                    "tags": tags[:5],
                    "source_urls": [product_link or link] if (product_link or link) else [],
                    "first_detected_at": now.isoformat(),
                    "last_updated_at": now.isoformat(),
                })

                if i < 3:
                    log(f"    {position}. {title[:40]} | {price} | score={score}")

            # Rate limit 존중
            time.sleep(1)

    log(f"\n수집 완료: 총 {len(all_trends)}개 상품, API 호출 {api_calls}회")

    # SQL 생성
    sql_lines = []
    sql_lines.append("-- MONTRA 실제 상품 데이터 (SerpAPI Google Shopping)")
    sql_lines.append(f"-- 생성일: {now.strftime('%Y-%m-%d %H:%M:%S UTC')}")
    sql_lines.append(f"-- 총 {len(all_trends)}개 상품, API 호출 {api_calls}회\n")

    # 카테고리 업데이트 (4개로 변경)
    sql_lines.append("-- 기존 카테고리 삭제 + 새 4개 카테고리")
    sql_lines.append("TRUNCATE trend_history CASCADE;")
    sql_lines.append("TRUNCATE trends CASCADE;")
    sql_lines.append("DELETE FROM categories;")
    sql_lines.append("")
    for sort_order, (slug, info) in enumerate(CATEGORIES.items(), 1):
        sql_lines.append(
            f"INSERT INTO categories (slug, name_ko, name_en, emoji, sort_order) "
            f"VALUES ('{slug}', '{info['name_ko']}', '{info['name_en']}', '{info['emoji']}', {sort_order});"
        )

    # categories 테이블의 slug CHECK 제약 업데이트
    sql_lines.append("")
    sql_lines.append("-- slug CHECK 제약 업데이트")
    sql_lines.append("ALTER TABLE categories DROP CONSTRAINT IF EXISTS categories_slug_check;")
    sql_lines.append("ALTER TABLE categories ADD CONSTRAINT categories_slug_check CHECK (slug IN ('fashion', 'products', 'food', 'entertainment'));")

    sql_lines.append("")

    # 트렌드 삽입
    for t in all_trends:
        tags_sql = "ARRAY[" + ",".join(f"'{escape_sql(tag)}'" for tag in t["tags"]) + "]"
        source_urls_sql = "ARRAY[" + ",".join(f"'{escape_sql(u)}'" for u in t["source_urls"]) + "]" if t["source_urls"] else "ARRAY[]::text[]"
        image_sql = f"'{escape_sql(t['image_url'])}'" if t["image_url"] else "NULL"

        sql = (
            f"INSERT INTO trends (country_id, category_id, name, description, image_url, "
            f"heat_score, heat_status, search_score, social_score, ecommerce_score, news_score, "
            f"tags, source_urls, first_detected_at, last_updated_at) VALUES (\n"
            f"  (SELECT id FROM countries WHERE code='{t['country_code']}'),\n"
            f"  (SELECT id FROM categories WHERE slug='{t['category_slug']}'),\n"
            f"  '{escape_sql(t['name'])}', '{escape_sql(t['description'])}', {image_sql},\n"
            f"  {t['heat_score']}, '{t['heat_status']}',\n"
            f"  {t['search_score']}, {t['social_score']}, {t['ecommerce_score']}, {t['news_score']},\n"
            f"  {tags_sql}, {source_urls_sql},\n"
            f"  '{t['first_detected_at']}', '{t['last_updated_at']}'\n"
            f");"
        )
        sql_lines.append(sql)

    # SQL 파일 저장
    sql_path = OUTPUT_DIR / "serpapi_trends.sql"
    with open(sql_path, "w", encoding="utf-8") as f:
        f.write("\n".join(sql_lines))

    log(f"\nSQL 파일 생성: {sql_path}")

    # JSON 백업
    json_path = OUTPUT_DIR / "serpapi_trends.json"
    with open(json_path, "w", encoding="utf-8") as f:
        json.dump(all_trends, f, ensure_ascii=False, indent=2)

    log(f"JSON 백업: {json_path}")
    log(f"\nSupabase SQL Editor에서 {sql_path} 내용을 실행하세요.")


if __name__ == "__main__":
    main()
