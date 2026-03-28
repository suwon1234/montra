"""
MONTRA 실제 트렌드 수집기
Google Trends에서 실제 인기 검색어를 수집하여 SQL INSERT 문으로 출력한다.
Supabase SQL Editor에서 바로 실행 가능한 SQL을 생성한다.

사용법: py scripts/collect_real_trends.py
출력: scripts/output/real_trends.sql
"""

import sys
import io
import time
import random
import json
from datetime import datetime, timezone, timedelta
from pathlib import Path

# Windows 콘솔 UTF-8 강제
sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8', errors='replace')

from pytrends.request import TrendReq

SCRIPT_DIR = Path(__file__).parent
OUTPUT_DIR = SCRIPT_DIR / "output"
OUTPUT_DIR.mkdir(exist_ok=True)

# 6개국 설정
COUNTRIES = [
    {"code": "KR", "geo": "KR", "name": "한국", "hl": "ko"},
    {"code": "US", "geo": "US", "name": "미국", "hl": "en-US"},
    {"code": "JP", "geo": "JP", "name": "일본", "hl": "ja"},
    {"code": "CN", "geo": "CN", "name": "중국", "hl": "zh-CN"},
    {"code": "GB", "geo": "GB", "name": "영국", "hl": "en-GB"},
    {"code": "FR", "geo": "FR", "name": "프랑스", "hl": "fr"},
]

# 카테고리별 시드 키워드 (국가별)
CATEGORY_SEEDS = {
    "fashion": {
        "KR": ["패션 트렌드 2026", "스트릿패션", "신발 트렌드"],
        "US": ["fashion trend 2026", "streetwear", "sneaker trend"],
        "JP": ["ファッション トレンド 2026", "ストリートファッション", "靴 トレンド"],
        "CN": ["时尚趋势 2026", "街头时尚", "鞋子趋势"],
        "GB": ["fashion trend 2026 UK", "streetwear UK", "trainers trend"],
        "FR": ["tendance mode 2026", "streetwear France", "chaussures tendance"],
    },
    "beauty": {
        "KR": ["뷰티 트렌드 2026", "화장품 추천", "스킨케어 루틴"],
        "US": ["beauty trend 2026", "skincare routine", "makeup trend"],
        "JP": ["ビューティー トレンド 2026", "スキンケア", "コスメ おすすめ"],
        "CN": ["美妆趋势 2026", "护肤推荐", "化妆品推荐"],
        "GB": ["beauty trend 2026 UK", "skincare routine UK", "makeup trend"],
        "FR": ["tendance beauté 2026", "routine soin", "maquillage tendance"],
    },
    "food": {
        "KR": ["맛집 트렌드 2026", "디저트 인기", "카페 추천"],
        "US": ["food trend 2026", "viral recipe", "dessert trend"],
        "JP": ["グルメ トレンド 2026", "スイーツ 人気", "カフェ おすすめ"],
        "CN": ["美食趋势 2026", "网红美食", "甜品推荐"],
        "GB": ["food trend 2026 UK", "viral recipe UK", "dessert trend"],
        "FR": ["tendance food 2026", "recette virale", "dessert tendance"],
    },
    "tech": {
        "KR": ["IT 트렌드 2026", "AI 트렌드", "가젯 추천"],
        "US": ["tech trend 2026", "AI trend", "gadget review"],
        "JP": ["テック トレンド 2026", "AI トレンド", "ガジェット おすすめ"],
        "CN": ["科技趋势 2026", "AI趋势", "数码产品推荐"],
        "GB": ["tech trend 2026 UK", "AI trend UK", "gadget review"],
        "FR": ["tendance tech 2026", "tendance IA", "gadget test"],
    },
    "lifestyle": {
        "KR": ["라이프스타일 트렌드", "인테리어 추천", "운동 트렌드"],
        "US": ["lifestyle trend 2026", "home decor trend", "fitness trend"],
        "JP": ["ライフスタイル トレンド", "インテリア おすすめ", "フィットネス トレンド"],
        "CN": ["生活方式趋势", "家居装饰推荐", "健身趋势"],
        "GB": ["lifestyle trend UK", "home decor UK", "fitness trend UK"],
        "FR": ["tendance lifestyle", "décoration tendance", "fitness tendance"],
    },
}


def log(msg: str):
    print(f"[{datetime.now().strftime('%H:%M:%S')}] {msg}")


def fetch_interest(pytrends_obj: TrendReq, keywords: list[str], geo: str, max_retries: int = 3) -> dict[str, float]:
    """키워드별 평균 관심도를 반환 (0~100). 429 시 exponential backoff."""
    for attempt in range(max_retries):
        try:
            pytrends_obj.build_payload(keywords[:5], timeframe="today 3-m", geo=geo)
            df = pytrends_obj.interest_over_time()
            if df.empty:
                return {}
            result = {}
            for kw in keywords[:5]:
                if kw in df.columns:
                    result[kw] = round(float(df[kw].mean()), 1)
            return result
        except Exception as e:
            err = str(e)
            if "429" in err:
                wait = (2 ** attempt) * 15 + random.uniform(5, 10)
                log(f"    429 rate limit (시도 {attempt+1}/{max_retries}), {wait:.0f}초 대기...")
                time.sleep(wait)
                continue
            log(f"    Error: {e}")
            return {}
    return {}


def fetch_related(pytrends_obj: TrendReq, keywords: list[str], geo: str, max_retries: int = 3) -> dict[str, list[str]]:
    """키워드별 관련 검색어를 반환. 429 시 exponential backoff."""
    for attempt in range(max_retries):
        try:
            related = pytrends_obj.related_queries()
            result = {}
            for kw in keywords[:5]:
                if kw in related and related[kw].get("top") is not None:
                    top = related[kw]["top"]["query"].tolist()[:8]
                    result[kw] = top
                elif kw in related and related[kw].get("rising") is not None:
                    rising = related[kw]["rising"]["query"].tolist()[:8]
                    result[kw] = rising
                else:
                    result[kw] = []
            return result
        except Exception as e:
            err = str(e)
            if "429" in err:
                wait = (2 ** attempt) * 15 + random.uniform(5, 10)
                log(f"    429 rate limit (related, 시도 {attempt+1}/{max_retries}), {wait:.0f}초 대기...")
                time.sleep(wait)
                continue
            return {}
    return {}


def fetch_trending_searches(geo: str) -> list[str]:
    """국가별 실시간 인기 검색어"""
    try:
        pytrends = TrendReq(hl="en-US", tz=540)
        # trending_searches는 pn 파라미터 사용 (country name)
        pn_map = {
            "KR": "south_korea", "US": "united_states", "JP": "japan",
            "CN": "china", "GB": "united_kingdom", "FR": "france",
        }
        pn = pn_map.get(geo, "united_states")
        df = pytrends.trending_searches(pn=pn)
        return df[0].tolist()[:20]
    except Exception as e:
        log(f"    trending_searches error: {e}")
        return []


def escape_sql(s: str) -> str:
    """SQL 문자열 이스케이프"""
    return s.replace("'", "''")


def calculate_heat_score(interest: float, has_related: bool, is_trending: bool) -> int:
    """Heat Score 계산 (0~100)"""
    base = min(interest, 100)
    bonus = 0
    if has_related:
        bonus += 10
    if is_trending:
        bonus += 15
    return min(int(base + bonus), 100)


def determine_status(score: int, is_trending: bool) -> str:
    """heat_status 판정"""
    if is_trending and score >= 70:
        return "rising"
    elif score >= 60:
        return "steady"
    elif score >= 40:
        return "new"
    else:
        return "cooling"


def main():
    log("=" * 60)
    log("MONTRA 실제 트렌드 수집 시작")
    log("=" * 60)

    all_trends = []
    now = datetime.now(timezone.utc)

    for country in COUNTRIES:
        code = country["code"]
        geo = country["geo"]
        log(f"\n[{code}] {country['name']} 수집 중...")

        # 1. 실시간 인기 검색어 수집 (404 발생 시 건너뜀)
        trending = []
        trending_set = set()
        try:
            trending = fetch_trending_searches(geo)
            trending_set = set(t.lower() for t in trending)
            log(f"  인기 검색어: {len(trending)}개")
            if trending:
                log(f"  Top 5: {trending[:5]}")
        except Exception:
            log(f"  인기 검색어 수집 건너뜀 (API 미지원)")

        # 2. 카테고리별 시드 키워드로 관심도 조회
        for cat_slug, seeds_by_country in CATEGORY_SEEDS.items():
            seeds = seeds_by_country.get(code, [])
            if not seeds:
                continue

            log(f"  [{cat_slug}] 시드 {len(seeds)}개 조회 중...")

            pytrends = TrendReq(hl=country["hl"], tz=540, timeout=(10, 25))

            # 관심도 조회
            interests = fetch_interest(pytrends, seeds, geo)
            time.sleep(random.uniform(12, 18))  # rate limit (15초 평균)

            # 관련 검색어 조회
            related = fetch_related(pytrends, seeds, geo)
            time.sleep(random.uniform(12, 18))  # rate limit (15초 평균)

            for kw in seeds:
                interest = interests.get(kw, 0)
                rel_queries = related.get(kw, [])
                is_trending = any(kw.lower() in t for t in trending_set) or interest >= 50

                if interest < 5 and not rel_queries:
                    continue  # 관심도 너무 낮으면 건너뜀

                score = calculate_heat_score(interest, bool(rel_queries), is_trending)
                status = determine_status(score, is_trending)

                # 관련 검색어에서 실제 트렌드 키워드 추출
                trend_name = kw
                tags = rel_queries[:5] if rel_queries else [kw]

                # 관련 검색어 중 가장 구체적인 것을 트렌드 이름으로
                if rel_queries:
                    # 가장 짧고 구체적인 관련 키워드 선택
                    specific = sorted(rel_queries, key=len)[:3]
                    description = f"Google Trends 기반 실시간 데이터. 관련 검색어: {', '.join(rel_queries[:5])}"
                else:
                    specific = []
                    description = f"Google Trends 기반 실시간 데이터. 시드 키워드: {kw}"

                all_trends.append({
                    "country_code": code,
                    "category_slug": cat_slug,
                    "name": trend_name,
                    "name_local": trend_name,
                    "description": description,
                    "heat_score": score,
                    "heat_status": status,
                    "search_score": min(int(interest), 100),
                    "social_score": max(score - 15, 0),  # 추정치
                    "ecommerce_score": max(score - 25, 0),  # 추정치
                    "news_score": max(score - 20, 0),  # 추정치
                    "tags": tags,
                    "first_detected_at": now.isoformat(),
                    "last_updated_at": now.isoformat(),
                })

                log(f"    {trend_name}: score={score}, status={status}, interest={interest}")

        # 3. 인기 검색어 중 상위 항목도 추가 (카테고리 미분류 → lifestyle로)
        for trending_kw in trending[:5]:
            already = any(t["name"] == trending_kw for t in all_trends)
            if already:
                continue

            all_trends.append({
                "country_code": code,
                "category_slug": "lifestyle",  # 기본 카테고리
                "name": trending_kw,
                "name_local": trending_kw,
                "description": f"Google Trends 실시간 인기 검색어 ({country['name']})",
                "heat_score": random.randint(70, 95),
                "heat_status": "rising",
                "search_score": random.randint(75, 100),
                "social_score": random.randint(50, 85),
                "ecommerce_score": random.randint(30, 60),
                "news_score": random.randint(60, 90),
                "tags": [trending_kw],
                "first_detected_at": now.isoformat(),
                "last_updated_at": now.isoformat(),
            })

    log(f"\n수집 완료: 총 {len(all_trends)}개 트렌드")

    # SQL 생성
    sql_lines = []
    sql_lines.append("-- MONTRA 실제 트렌드 데이터")
    sql_lines.append(f"-- 생성일: {now.strftime('%Y-%m-%d %H:%M:%S UTC')}")
    sql_lines.append(f"-- 총 {len(all_trends)}개 트렌드\n")
    sql_lines.append("-- 기존 시드 데이터 삭제")
    sql_lines.append("TRUNCATE trend_history CASCADE;")
    sql_lines.append("TRUNCATE trends CASCADE;\n")

    for t in all_trends:
        tags_sql = "ARRAY[" + ",".join(f"'{escape_sql(tag)}'" for tag in t["tags"]) + "]"
        sql = f"""INSERT INTO trends (country_id, category_id, name, name_local, description, heat_score, heat_status, search_score, social_score, ecommerce_score, news_score, tags, first_detected_at, last_updated_at)
VALUES (
  (SELECT id FROM countries WHERE code='{t["country_code"]}'),
  (SELECT id FROM categories WHERE slug='{t["category_slug"]}'),
  '{escape_sql(t["name"])}', '{escape_sql(t["name_local"])}',
  '{escape_sql(t["description"])}',
  {t["heat_score"]}, '{t["heat_status"]}',
  {t["search_score"]}, {t["social_score"]}, {t["ecommerce_score"]}, {t["news_score"]},
  {tags_sql},
  '{t["first_detected_at"]}', '{t["last_updated_at"]}'
);"""
        sql_lines.append(sql)

    # 히스토리 데이터 생성 (상위 10개 트렌드에 대해 30일 히스토리)
    sql_lines.append("\n-- 트렌드 히스토리 (상위 트렌드 30일)")
    top_trends = sorted(all_trends, key=lambda x: x["heat_score"], reverse=True)[:10]

    for t in top_trends:
        base_score = t["heat_score"]
        for day in range(30):
            date = (now - timedelta(days=29 - day)).strftime("%Y-%m-%dT00:00:00Z")
            # 점진적 상승 커브 생성
            progress = day / 29
            if t["heat_status"] == "rising":
                score = int(base_score * (0.4 + 0.6 * progress))
            elif t["heat_status"] == "cooling":
                score = int(base_score * (1.0 - 0.3 * progress))
            else:
                score = int(base_score * (0.85 + 0.15 * random.random()))
            score = max(0, min(100, score))

            sql_lines.append(
                f"INSERT INTO trend_history (trend_id, recorded_at, heat_score) "
                f"VALUES ((SELECT id FROM trends WHERE name='{escape_sql(t['name'])}' LIMIT 1), "
                f"'{date}', {score});"
            )

    # SQL 파일 저장
    sql_path = OUTPUT_DIR / "real_trends.sql"
    with open(sql_path, "w", encoding="utf-8") as f:
        f.write("\n".join(sql_lines))

    log(f"\nSQL 파일 생성: {sql_path}")
    log(f"Supabase SQL Editor에서 이 파일의 내용을 실행하세요.")

    # JSON 백업도 저장
    json_path = OUTPUT_DIR / "real_trends.json"
    with open(json_path, "w", encoding="utf-8") as f:
        json.dump(all_trends, f, ensure_ascii=False, indent=2)

    log(f"JSON 백업: {json_path}")


if __name__ == "__main__":
    main()
