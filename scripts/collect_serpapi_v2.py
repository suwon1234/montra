"""
MONTRA SerpAPI 수집기 v2
- 검색어 개선 (2026 제거, 현재형 키워드)
- 20개국 확장
- Google Shopping 실제 상품 수집

사용법: py scripts/collect_serpapi_v2.py
출력: scripts/output/serpapi_trends_v2.sql
"""

import sys
import io
import json
import math
import time
import urllib.request
import urllib.parse
from datetime import datetime, timezone
from pathlib import Path

sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8', errors='replace')

SCRIPT_DIR = Path(__file__).parent
OUTPUT_DIR = SCRIPT_DIR / "output"
OUTPUT_DIR.mkdir(exist_ok=True)

API_KEY = "089e7900f4532e1d90544d3be57e126b3c99b46436c445a4a716d50b5316db5e"

# 20개국 (Google Shopping 지원 국가)
COUNTRIES = [
    # 동아시아
    {"code": "KR", "gl": "kr", "hl": "ko", "name_ko": "한국", "name_en": "South Korea", "flag": "🇰🇷", "region": "asia", "sub": "east_asia"},
    {"code": "JP", "gl": "jp", "hl": "ja", "name_ko": "일본", "name_en": "Japan", "flag": "🇯🇵", "region": "asia", "sub": "east_asia"},
    {"code": "TW", "gl": "tw", "hl": "zh-tw", "name_ko": "대만", "name_en": "Taiwan", "flag": "🇹🇼", "region": "asia", "sub": "east_asia"},
    # 동남아
    {"code": "SG", "gl": "sg", "hl": "en", "name_ko": "싱가포르", "name_en": "Singapore", "flag": "🇸🇬", "region": "asia", "sub": "southeast_asia"},
    {"code": "TH", "gl": "th", "hl": "th", "name_ko": "태국", "name_en": "Thailand", "flag": "🇹🇭", "region": "asia", "sub": "southeast_asia"},
    {"code": "VN", "gl": "vn", "hl": "vi", "name_ko": "베트남", "name_en": "Vietnam", "flag": "🇻🇳", "region": "asia", "sub": "southeast_asia"},
    # 남아시아
    {"code": "IN", "gl": "in", "hl": "en", "name_ko": "인도", "name_en": "India", "flag": "🇮🇳", "region": "asia", "sub": "south_asia"},
    # 북미
    {"code": "US", "gl": "us", "hl": "en", "name_ko": "미국", "name_en": "United States", "flag": "🇺🇸", "region": "americas", "sub": "north_america"},
    {"code": "CA", "gl": "ca", "hl": "en", "name_ko": "캐나다", "name_en": "Canada", "flag": "🇨🇦", "region": "americas", "sub": "north_america"},
    {"code": "MX", "gl": "mx", "hl": "es", "name_ko": "멕시코", "name_en": "Mexico", "flag": "🇲🇽", "region": "americas", "sub": "latin_america"},
    # 남미
    {"code": "BR", "gl": "br", "hl": "pt", "name_ko": "브라질", "name_en": "Brazil", "flag": "🇧🇷", "region": "americas", "sub": "latin_america"},
    # 유럽
    {"code": "GB", "gl": "uk", "hl": "en", "name_ko": "영국", "name_en": "United Kingdom", "flag": "🇬🇧", "region": "europe", "sub": "west_europe"},
    {"code": "FR", "gl": "fr", "hl": "fr", "name_ko": "프랑스", "name_en": "France", "flag": "🇫🇷", "region": "europe", "sub": "west_europe"},
    {"code": "DE", "gl": "de", "hl": "de", "name_ko": "독일", "name_en": "Germany", "flag": "🇩🇪", "region": "europe", "sub": "west_europe"},
    {"code": "IT", "gl": "it", "hl": "it", "name_ko": "이탈리아", "name_en": "Italy", "flag": "🇮🇹", "region": "europe", "sub": "west_europe"},
    {"code": "ES", "gl": "es", "hl": "es", "name_ko": "스페인", "name_en": "Spain", "flag": "🇪🇸", "region": "europe", "sub": "west_europe"},
    {"code": "SE", "gl": "se", "hl": "sv", "name_ko": "스웨덴", "name_en": "Sweden", "flag": "🇸🇪", "region": "europe", "sub": "north_europe"},
    # 오세아니아
    {"code": "AU", "gl": "au", "hl": "en", "name_ko": "호주", "name_en": "Australia", "flag": "🇦🇺", "region": "oceania", "sub": "oceania"},
    # 중동
    {"code": "AE", "gl": "ae", "hl": "en", "name_ko": "UAE", "name_en": "United Arab Emirates", "flag": "🇦🇪", "region": "middle_east", "sub": "middle_east"},
    # 아프리카
    {"code": "ZA", "gl": "za", "hl": "en", "name_ko": "남아공", "name_en": "South Africa", "flag": "🇿🇦", "region": "africa", "sub": "africa"},
]

# 4카테고리 - 개선된 검색어 (2026 제거, 현재형)
CATEGORIES = {
    "fashion": {
        "name_ko": "옷", "name_en": "Fashion", "emoji": "👗",
        "queries": {
            "DEFAULT": "best selling clothes fashion trending now",
            "KR": "요즘 인기 옷 잘팔리는 패션 핫한",
            "JP": "今 人気 売れ筋 服 ファッション おすすめ",
            "TW": "現在 熱賣 流行 服裝 穿搭",
            "TH": "เสื้อผ้าแฟชั่น ยอดนิยม ขายดี",
            "VN": "quần áo thời trang bán chạy nhất",
            "IN": "best selling trending clothes fashion India",
            "MX": "ropa de moda más vendida tendencia",
            "BR": "roupas mais vendidas moda tendência",
            "FR": "vêtements tendance les plus vendus mode",
            "DE": "meistverkaufte Kleidung Mode Trend",
            "IT": "vestiti più venduti moda tendenza",
            "ES": "ropa más vendida moda tendencia",
            "SE": "populära kläder mode trend bästsäljare",
        }
    },
    "products": {
        "name_ko": "상품", "name_en": "Products", "emoji": "🛍️",
        "queries": {
            "DEFAULT": "best selling viral products trending gadgets",
            "KR": "요즘 핫한 인기템 잘팔리는 상품 가젯",
            "JP": "今 売れ筋 人気商品 おすすめ ガジェット",
            "TW": "熱賣 人氣商品 必買 好物推薦",
            "TH": "สินค้ายอดนิยม ขายดี แกดเจ็ต",
            "VN": "sản phẩm bán chạy nhất xu hướng",
            "IN": "best selling trending products gadgets India",
            "MX": "productos más vendidos tendencia gadgets",
            "BR": "produtos mais vendidos tendência gadgets",
            "FR": "produits les plus vendus tendance gadgets",
            "DE": "meistverkaufte Produkte Trend Gadgets",
            "IT": "prodotti più venduti tendenza gadget",
            "ES": "productos más vendidos tendencia gadgets",
            "SE": "mest sålda produkter trender prylar",
        }
    },
    "food": {
        "name_ko": "음식", "name_en": "Food", "emoji": "🍽️",
        "queries": {
            "DEFAULT": "best selling popular snacks dessert food trending",
            "KR": "요즘 인기 간식 디저트 맛있는 과자 음식",
            "JP": "今 人気 お菓子 スイーツ おすすめ 売れ筋",
            "TW": "熱賣 零食 甜點 人氣美食 必買",
            "TH": "ขนม อาหาร ยอดนิยม ขายดี ของกิน",
            "VN": "đồ ăn vặt bánh kẹo bán chạy nhất",
            "IN": "best selling popular snacks sweets food India",
            "MX": "dulces comida snacks más vendidos popular",
            "BR": "doces salgadinhos comida mais vendidos popular",
            "FR": "snacks desserts nourriture les plus vendus",
            "DE": "meistverkaufte Snacks Süßigkeiten Essen beliebt",
            "IT": "snack dolci cibo più venduti popolare",
            "ES": "snacks dulces comida más vendidos popular",
            "SE": "populära snacks godis mat bästsäljare",
        }
    },
    "entertainment": {
        "name_ko": "놀이", "name_en": "Entertainment", "emoji": "🎮",
        "queries": {
            "DEFAULT": "best selling toys games gadgets hobby trending",
            "KR": "요즘 인기 장난감 게임 굿즈 취미용품",
            "JP": "今 人気 おもちゃ ゲーム グッズ 売れ筋",
            "TW": "熱賣 玩具 遊戲 周邊商品 人氣",
            "TH": "ของเล่น เกม ยอดนิยม ขายดี",
            "VN": "đồ chơi game phụ kiện bán chạy nhất",
            "IN": "best selling toys games hobby gadgets India",
            "MX": "juguetes juegos gadgets más vendidos",
            "BR": "brinquedos jogos gadgets mais vendidos",
            "FR": "jouets jeux gadgets les plus vendus",
            "DE": "meistverkaufte Spielzeug Spiele Gadgets",
            "IT": "giocattoli giochi gadget più venduti",
            "ES": "juguetes juegos gadgets más vendidos",
            "SE": "populära leksaker spel prylar bästsäljare",
        }
    },
}

CATEGORY_IMAGES = {
    "fashion": "https://images.unsplash.com/photo-1445205170230-053b83016050?auto=format&fit=crop&q=80&w=800",
    "products": "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&q=80&w=800",
    "food": "https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&q=80&w=800",
    "entertainment": "https://images.unsplash.com/photo-1603190287605-e6ade32fa852?auto=format&fit=crop&q=80&w=800",
}


def log(msg: str):
    print(f"[{datetime.now().strftime('%H:%M:%S')}] {msg}")


def search_shopping(query: str, gl: str, hl: str, num: int = 15) -> list[dict]:
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


def calc_score(position: int, rating: float, reviews: int) -> int:
    pos_score = max(100 - (position - 1) * 3, 30)
    rat_bonus = (rating - 3.0) * 8 if rating > 0 else 0
    rev_bonus = min(math.log10(max(reviews, 1)) * 5, 15)
    return max(0, min(100, int(pos_score + rat_bonus + rev_bonus)))


def heat_status(score: int, position: int) -> str:
    if position <= 5 and score >= 75:
        return "rising"
    elif score >= 55:
        return "steady"
    elif score >= 35:
        return "new"
    return "cooling"


def main():
    log("=" * 60)
    log("MONTRA SerpAPI v2 — 20개국 실제 상품 수집")
    log("=" * 60)

    all_trends = []
    now = datetime.now(timezone.utc)
    api_calls = 0

    for country in COUNTRIES:
        code = country["code"]
        log(f"\n{country['flag']} [{code}] {country['name_ko']} 수집 중...")

        for cat_slug, cat_info in CATEGORIES.items():
            query = cat_info["queries"].get(code, cat_info["queries"]["DEFAULT"])
            log(f"  [{cat_slug}] {query[:40]}...")

            results = search_shopping(query, country["gl"], country["hl"], num=15)
            api_calls += 1
            log(f"  [{cat_slug}] → {len(results)}개")

            for i, item in enumerate(results[:10]):
                title = item.get("title", "")
                if not title:
                    continue

                price = item.get("price", "")
                source = item.get("source", "")
                rating = float(item.get("rating", 0) or 0)
                reviews = int(item.get("reviews", 0) or 0)
                thumbnail = item.get("thumbnail", "")
                link = item.get("product_link", "") or item.get("link", "")
                position = item.get("position", i + 1)

                score = calc_score(position, rating, reviews)
                status = heat_status(score, position)

                tags = [t for t in [source, price, f"★{rating}" if rating > 0 else ""] if t]
                desc_parts = [f"판매: {source}" if source else "", f"가격: {price}" if price else "",
                              f"평점: {rating}" if rating > 0 else "", f"리뷰: {reviews:,}개" if reviews > 0 else ""]
                description = " | ".join(p for p in desc_parts if p) or title

                all_trends.append({
                    "country_code": code, "category_slug": cat_slug,
                    "name": title[:200], "description": description[:500],
                    "image_url": thumbnail or CATEGORY_IMAGES.get(cat_slug, ""),
                    "heat_score": score, "heat_status": status,
                    "search_score": max(score - 5, 0), "social_score": max(score - 15, 0),
                    "ecommerce_score": score, "news_score": max(score - 25, 0),
                    "tags": tags[:5],
                    "source_urls": [link] if link else [],
                    "first_detected_at": now.isoformat(), "last_updated_at": now.isoformat(),
                })

                if i < 2:
                    log(f"    {position}. {title[:45]} | {price}")

            time.sleep(0.5)

    log(f"\n{'='*60}")
    log(f"수집 완료: {len(all_trends)}개 상품, API {api_calls}회 호출")
    log(f"{'='*60}")

    # === SQL 생성 ===
    sql = []
    sql.append(f"-- MONTRA 실제 상품 데이터 (SerpAPI v2)")
    sql.append(f"-- {now.strftime('%Y-%m-%d %H:%M UTC')} | {len(all_trends)}개 상품 | {api_calls} API calls\n")

    # 기존 데이터 정리
    sql.append("TRUNCATE trend_history CASCADE;")
    sql.append("TRUNCATE trends CASCADE;")
    sql.append("DELETE FROM categories;")
    sql.append("DELETE FROM countries;\n")

    # CHECK 제약 제거
    sql.append("ALTER TABLE categories DROP CONSTRAINT IF EXISTS categories_slug_check;")
    sql.append("ALTER TABLE countries DROP CONSTRAINT IF EXISTS countries_region_check;")
    sql.append("")

    # 카테고리 삽입
    for i, (slug, info) in enumerate(CATEGORIES.items(), 1):
        sql.append(f"INSERT INTO categories (slug, name_ko, name_en, emoji, sort_order) "
                   f"VALUES ('{slug}', '{info['name_ko']}', '{info['name_en']}', '{info['emoji']}', {i});")
    sql.append("")

    # 국가 삽입
    for c in COUNTRIES:
        sql.append(
            f"INSERT INTO countries (code, name_ko, name_en, flag_emoji, region, sub_region, is_active) "
            f"VALUES ('{c['code']}', '{c['name_ko']}', '{c['name_en']}', '{c['flag']}', "
            f"'{c['region']}', '{c['sub']}', true);"
        )
    sql.append("")

    # region CHECK 재추가 (확장)
    sql.append("ALTER TABLE categories ADD CONSTRAINT categories_slug_check CHECK (slug IN ('fashion','products','food','entertainment'));")
    sql.append("ALTER TABLE countries ADD CONSTRAINT countries_region_check CHECK (region IN ('asia','europe','americas','middle_east','africa','oceania'));")
    sql.append("")

    # 트렌드 삽입
    for t in all_trends:
        tags_sql = "ARRAY[" + ",".join(f"'{escape_sql(tg)}'" for tg in t["tags"]) + "]"
        src_sql = "ARRAY[" + ",".join(f"'{escape_sql(u)}'" for u in t["source_urls"]) + "]" if t["source_urls"] else "ARRAY[]::text[]"
        img_sql = f"'{escape_sql(t['image_url'])}'" if t["image_url"] else "NULL"

        sql.append(
            f"INSERT INTO trends (country_id, category_id, name, description, image_url, "
            f"heat_score, heat_status, search_score, social_score, ecommerce_score, news_score, "
            f"tags, source_urls, first_detected_at, last_updated_at) VALUES ("
            f"(SELECT id FROM countries WHERE code='{t['country_code']}'), "
            f"(SELECT id FROM categories WHERE slug='{t['category_slug']}'), "
            f"'{escape_sql(t['name'])}', '{escape_sql(t['description'])}', {img_sql}, "
            f"{t['heat_score']}, '{t['heat_status']}', "
            f"{t['search_score']}, {t['social_score']}, {t['ecommerce_score']}, {t['news_score']}, "
            f"{tags_sql}, {src_sql}, "
            f"'{t['first_detected_at']}', '{t['last_updated_at']}');"
        )

    # 저장
    sql_path = OUTPUT_DIR / "serpapi_trends_v2.sql"
    with open(sql_path, "w", encoding="utf-8") as f:
        f.write("\n".join(sql))
    log(f"SQL: {sql_path}")

    json_path = OUTPUT_DIR / "serpapi_trends_v2.json"
    with open(json_path, "w", encoding="utf-8") as f:
        json.dump(all_trends, f, ensure_ascii=False, indent=2)
    log(f"JSON: {json_path}")


if __name__ == "__main__":
    main()
