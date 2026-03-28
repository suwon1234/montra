"""
Google Trends 데이터 수집기 (Google Trends Data Collector)

pytrends 라이브러리를 사용하여 국가별/카테고리별 인기 검색어를 수집한다.
Google Trends는 공개 API이므로 별도 API 키가 필요 없다.

주요 기능:
  - 국가별 카테고리별 인기 검색어 수집
  - Rate limit 핸들링 (configurable delay)
  - 429 에러 시 exponential backoff 재시도
  - 관련 검색어(related queries) 수집

반환 형식:
  [{ keyword, interest, related_queries, country_code, category }]
"""

import time
import random
import json
import os
from datetime import datetime, timezone
from typing import Optional

try:
    from pytrends.request import TrendReq
    PYTRENDS_AVAILABLE = True
except ImportError:
    PYTRENDS_AVAILABLE = False


# ──────────────────────────────────────────────
# 카테고리 → Google Trends 시드 키워드 매핑
# Category → Google Trends seed keyword mapping
# ──────────────────────────────────────────────
CATEGORY_SEEDS: dict[str, dict[str, list[str]]] = {
    "fashion": {
        "DEFAULT": ["fashion trend", "outfit ideas", "streetwear", "sneaker trend", "clothing haul"],
        "KR": ["패션 트렌드", "옷 추천", "스트릿 패션", "코디 추천", "신발 트렌드"],
        "US": ["fashion trend", "outfit ideas", "streetwear", "sneaker trend", "clothing haul"],
        "JP": ["ファッション トレンド", "コーディネート", "ストリート ファッション", "靴 トレンド", "服 おすすめ"],
        "CN": ["时尚趋势", "穿搭推荐", "街头时尚", "鞋子趋势", "服装推荐"],
        "GB": ["fashion trend UK", "outfit ideas", "streetwear UK", "trainers trend", "clothing haul"],
        "FR": ["tendance mode", "idées tenues", "streetwear France", "chaussures tendance", "mode 2024"],
    },
    "beauty": {
        "DEFAULT": ["beauty trend", "skincare routine", "makeup tutorial", "hair trend", "cosmetics"],
        "KR": ["뷰티 트렌드", "화장품 추천", "스킨케어", "메이크업", "헤어 트렌드"],
        "US": ["beauty trend", "skincare routine", "makeup tutorial", "hair trend", "cosmetics"],
        "JP": ["ビューティー トレンド", "スキンケア", "メイク", "コスメ おすすめ", "ヘアスタイル"],
        "CN": ["美妆趋势", "护肤推荐", "化妆教程", "发型趋势", "美容产品"],
        "GB": ["beauty trend UK", "skincare routine", "makeup tutorial", "hair trend UK", "cosmetics UK"],
        "FR": ["tendance beauté", "routine soin", "tutoriel maquillage", "tendance coiffure", "cosmétiques"],
    },
    "food": {
        "DEFAULT": ["food trend", "recipe viral", "restaurant trend", "dessert trend", "cooking hack"],
        "KR": ["맛집 추천", "음식 트렌드", "레시피", "카페 추천", "디저트 트렌드"],
        "US": ["food trend", "recipe viral", "restaurant trend", "dessert trend", "cooking hack"],
        "JP": ["グルメ トレンド", "レシピ 人気", "カフェ おすすめ", "スイーツ トレンド", "料理"],
        "CN": ["美食趋势", "网红美食", "食谱推荐", "甜品趋势", "餐厅推荐"],
        "GB": ["food trend UK", "recipe viral", "restaurant trend UK", "dessert trend", "cooking hack"],
        "FR": ["tendance food", "recette virale", "restaurant tendance", "dessert tendance", "cuisine"],
    },
    "tech": {
        "DEFAULT": ["tech trend", "gadget review", "AI trend", "smartphone", "app trend"],
        "KR": ["IT 트렌드", "가젯 추천", "AI 트렌드", "스마트폰 추천", "앱 추천"],
        "US": ["tech trend", "gadget review", "AI trend", "smartphone", "app trend"],
        "JP": ["テック トレンド", "ガジェット おすすめ", "AI トレンド", "スマホ", "アプリ おすすめ"],
        "CN": ["科技趋势", "数码产品", "AI趋势", "手机推荐", "应用推荐"],
        "GB": ["tech trend UK", "gadget review", "AI trend UK", "smartphone UK", "app trend"],
        "FR": ["tendance tech", "gadget test", "tendance IA", "smartphone", "application tendance"],
    },
    "lifestyle": {
        "DEFAULT": ["lifestyle trend", "home decor", "fitness trend", "travel trend", "hobby trend"],
        "KR": ["라이프스타일 트렌드", "인테리어", "운동 추천", "여행 추천", "취미 추천"],
        "US": ["lifestyle trend", "home decor", "fitness trend", "travel trend", "hobby trend"],
        "JP": ["ライフスタイル トレンド", "インテリア", "フィットネス", "旅行 おすすめ", "趣味"],
        "CN": ["生活方式趋势", "家居装饰", "健身趋势", "旅游推荐", "兴趣爱好"],
        "GB": ["lifestyle trend UK", "home decor UK", "fitness trend", "travel trend UK", "hobby trend"],
        "FR": ["tendance lifestyle", "décoration", "fitness tendance", "voyage tendance", "loisirs"],
    },
}


def _log(message: str) -> None:
    """타임스탬프 로그 출력 (Timestamped log output)"""
    timestamp = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
    print(f"[GoogleTrends {timestamp}] {message}")


def _get_seed_keywords(category: str, country_code: str, max_keywords: int = 5) -> list[str]:
    """
    카테고리 + 국가 조합으로 시드 키워드 반환
    Get seed keywords for a given category and country
    """
    cat_seeds = CATEGORY_SEEDS.get(category, {})
    keywords = cat_seeds.get(country_code, cat_seeds.get("DEFAULT", cat_seeds.get("US", [])))
    return keywords[:max_keywords]


def collect_google_trends(
    countries: list[dict],
    sources_config: dict,
    max_keywords_per_category: Optional[int] = None,
) -> list[dict]:
    """
    Google Trends에서 국가별/카테고리별 인기 검색어를 수집한다.
    Collect trending keywords from Google Trends per country/category.

    Args:
        countries: countries.json에서 로드한 국가 목록
        sources_config: sources.json의 google_trends 설정
        max_keywords_per_category: 카테고리당 최대 키워드 수 (override)

    Returns:
        [{ keyword, interest, related_queries, country_code, category, collected_at }]
    """
    # ── pytrends 사용 가능 여부 확인 ──
    if not PYTRENDS_AVAILABLE:
        _log("WARNING: pytrends 미설치. pip install pytrends 필요. 빈 결과 반환.")
        return []

    # ── 설정 로드 ──
    gt_config = sources_config.get("google_trends", {})
    if not gt_config.get("enabled", True):
        _log("Google Trends 수집 비활성화됨 (sources.json: enabled=false)")
        return []

    rate_limit_delay = gt_config.get("rate_limit_delay", 3)
    max_kw = max_keywords_per_category or gt_config.get("max_keywords_per_category", 5)

    results: list[dict] = []
    enabled_countries = [c for c in countries if c.get("enabled", True)]

    _log(f"수집 시작: {len(enabled_countries)}개국, 카테고리당 최대 {max_kw}개 키워드")

    for country in enabled_countries:
        country_code = country["code"]
        geo = country.get("google_trends_geo", country_code)
        categories = country.get("categories", [])

        _log(f"  [{country_code}] {country['name']} — {len(categories)}개 카테고리")

        for category in categories:
            seed_keywords = _get_seed_keywords(category, country_code, max_kw)

            if not seed_keywords:
                _log(f"    [{category}] 시드 키워드 없음, 건너뜀")
                continue

            _log(f"    [{category}] 시드 키워드 {len(seed_keywords)}개: {seed_keywords}")

            try:
                category_results = _fetch_trends_with_retry(
                    keywords=seed_keywords,
                    geo=geo,
                    category_name=category,
                    country_code=country_code,
                    rate_limit_delay=rate_limit_delay,
                )
                results.extend(category_results)

            except Exception as e:
                _log(f"    [{category}] 수집 실패: {e}")
                continue

    _log(f"수집 완료: 총 {len(results)}개 트렌드 항목")
    return results


def _fetch_trends_with_retry(
    keywords: list[str],
    geo: str,
    category_name: str,
    country_code: str,
    rate_limit_delay: float = 3.0,
    max_retries: int = 3,
) -> list[dict]:
    """
    Exponential backoff으로 Google Trends 데이터를 가져온다.
    Fetch Google Trends data with exponential backoff retry on 429 errors.

    Args:
        keywords: 검색할 키워드 목록 (최대 5개)
        geo: Google Trends 지역 코드
        category_name: 카테고리 이름
        country_code: 국가 코드
        rate_limit_delay: 요청 간 기본 딜레이 (초)
        max_retries: 최대 재시도 횟수

    Returns:
        트렌드 데이터 리스트
    """
    results: list[dict] = []

    for attempt in range(max_retries):
        try:
            # ── pytrends 초기화 ──
            pytrends = TrendReq(
                hl="en-US",
                tz=540,  # KST (UTC+9)
                timeout=(10, 25),
                retries=2,
                backoff_factor=0.5,
            )

            # ── 요청 빌드 (최대 5개 키워드) ──
            batch = keywords[:5]
            pytrends.build_payload(
                kw_list=batch,
                timeframe="today 3-m",  # 최근 3개월
                geo=geo,
            )

            # ── Interest over time 수집 ──
            interest_df = pytrends.interest_over_time()

            if interest_df.empty:
                _log(f"      결과 없음 (geo={geo}, keywords={batch})")
                return []

            # ── 키워드별 평균 관심도 계산 ──
            for keyword in batch:
                if keyword not in interest_df.columns:
                    continue

                avg_interest = float(interest_df[keyword].mean())

                # ── 관련 검색어 수집 ──
                related = _get_related_queries_safe(pytrends, keyword)

                results.append({
                    "keyword": keyword,
                    "interest": round(avg_interest, 1),
                    "related_queries": related,
                    "country_code": country_code,
                    "category": category_name,
                    "source": "google_trends",
                    "collected_at": datetime.now(timezone.utc).isoformat(),
                })

            # ── Rate limit 딜레이 ──
            jitter = random.uniform(0.5, 1.5)
            time.sleep(rate_limit_delay + jitter)

            return results

        except Exception as e:
            error_str = str(e).lower()

            # ── 429 Too Many Requests → exponential backoff ──
            if "429" in error_str or "too many" in error_str:
                backoff = (2 ** attempt) * rate_limit_delay + random.uniform(1, 3)
                _log(f"      429 에러 (시도 {attempt + 1}/{max_retries}), {backoff:.1f}초 대기 후 재시도...")
                time.sleep(backoff)
                continue

            # ── 기타 에러 ──
            _log(f"      에러 (시도 {attempt + 1}/{max_retries}): {e}")
            if attempt == max_retries - 1:
                raise

            time.sleep(rate_limit_delay)

    return results


def _get_related_queries_safe(pytrends: "TrendReq", keyword: str) -> list[str]:
    """
    관련 검색어를 안전하게 가져온다. 실패 시 빈 리스트 반환.
    Safely fetch related queries. Returns empty list on failure.
    """
    try:
        related_data = pytrends.related_queries()
        if keyword in related_data and related_data[keyword].get("top") is not None:
            top_df = related_data[keyword]["top"]
            return top_df["query"].tolist()[:10]  # 상위 10개
    except Exception:
        pass
    return []


# ──────────────────────────────────────────────
# 독립 실행 테스트 (Standalone test)
# ──────────────────────────────────────────────
if __name__ == "__main__":
    _log("=== Google Trends 수집기 독립 테스트 ===")

    # 테스트용 최소 설정
    test_countries = [
        {
            "code": "KR",
            "name": "South Korea",
            "google_trends_geo": "KR",
            "categories": ["fashion"],
            "enabled": True,
        }
    ]
    test_config = {
        "google_trends": {
            "enabled": True,
            "rate_limit_delay": 3,
            "max_keywords_per_category": 2,
        }
    }

    data = collect_google_trends(test_countries, test_config, max_keywords_per_category=2)
    _log(f"수집 결과: {len(data)}개 항목")
    for item in data:
        _log(f"  {item['keyword']}: interest={item['interest']}, related={len(item['related_queries'])}개")
