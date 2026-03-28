"""
Heat Score 계산기 (Heat Score Calculator)

수식 기반으로 Heat Score를 계산한다. AI/ML 없이 가중 평균 방식으로 동작.

수식:
  Heat Score = search_growth × 0.30 + social_mentions × 0.40
             + ecommerce_rank × 0.20 + cross_country × 0.10

점수 범위: 0 ~ 100 (정수)

주요 기능:
  - 개별 트렌드 항목의 Heat Score 계산
  - Google Trends interest → search_score 정규화
  - TikTok views/publish_count → social_score 정규화
  - Cross-country 출현 빈도 → cross_country_score 계산
  - 배치 계산 (여러 트렌드 항목 한번에 처리)
"""

import math
from datetime import datetime, timezone
from typing import Optional


def _log(message: str) -> None:
    """타임스탬프 로그 출력 (Timestamped log output)"""
    timestamp = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
    print(f"[ScoreCalc {timestamp}] {message}")


# ──────────────────────────────────────────────
# 가중치 설정 (Weights Configuration)
# ──────────────────────────────────────────────
WEIGHTS = {
    "search": 0.30,      # Google Trends 검색량
    "social": 0.40,      # TikTok 소셜 언급량
    "ecommerce": 0.20,   # 이커머스 순위 (Phase 2)
    "cross_country": 0.10,  # 다국가 동시 트렌드
}


def calculate_heat_score(
    search_score: float,
    social_score: float,
    ecommerce_score: float = 0.0,
    cross_country_score: float = 0.0,
) -> int:
    """
    수식 기반 Heat Score 계산.
    Calculate Heat Score using weighted formula (no AI).

    Args:
        search_score: 검색 트렌드 점수 (0~100)
                      Google Trends interest 기반 정규화 값
        social_score: 소셜 언급 점수 (0~100)
                      TikTok views/publish_count 기반 정규화 값
        ecommerce_score: 이커머스 순위 점수 (0~100, Phase 2에서 구현)
                         현재는 기본값 0
        cross_country_score: 다국가 출현 점수 (0~100)
                             여러 국가에서 동시에 뜨는 정도

    Returns:
        Heat Score (0~100 정수)
    """
    final = (
        search_score * WEIGHTS["search"]
        + social_score * WEIGHTS["social"]
        + ecommerce_score * WEIGHTS["ecommerce"]
        + cross_country_score * WEIGHTS["cross_country"]
    )
    return max(0, min(100, round(final)))


def normalize_search_score(interest: float) -> float:
    """
    Google Trends interest 값을 0~100 점수로 정규화.
    Normalize Google Trends interest value to 0~100 score.

    Google Trends interest는 이미 0~100 범위이므로 그대로 사용.
    변동 폭이 클수록 보너스 점수 부여 가능 (추후 확장).

    Args:
        interest: Google Trends 평균 interest (0~100)

    Returns:
        정규화된 검색 점수 (0~100)
    """
    if interest <= 0:
        return 0.0
    # Google Trends interest는 이미 0~100이므로 클램핑만 수행
    return max(0.0, min(100.0, float(interest)))


def normalize_social_score(
    views: int,
    publish_count: int,
    max_views: int = 10_000_000,
    max_publish: int = 10_000,
) -> float:
    """
    TikTok 조회수/게시물 수를 0~100 점수로 정규화.
    Normalize TikTok views and publish count to 0~100 score.

    로그 스케일로 정규화하여 극단값의 영향을 줄인다.

    Args:
        views: 해시태그 총 조회수
        publish_count: 해시태그 총 게시물 수
        max_views: 정규화 기준 최대 조회수 (기본 1천만)
        max_publish: 정규화 기준 최대 게시물 수 (기본 1만)

    Returns:
        정규화된 소셜 점수 (0~100)
    """
    if views <= 0 and publish_count <= 0:
        return 0.0

    # 로그 스케일 정규화 (Log-scale normalization)
    # log(1) = 0, log(max_views) = cap
    view_score = 0.0
    if views > 0:
        view_score = min(100.0, (math.log10(views + 1) / math.log10(max_views + 1)) * 100)

    publish_score = 0.0
    if publish_count > 0:
        publish_score = min(100.0, (math.log10(publish_count + 1) / math.log10(max_publish + 1)) * 100)

    # 조회수 70% + 게시물수 30% 가중 평균
    combined = view_score * 0.7 + publish_score * 0.3
    return max(0.0, min(100.0, round(combined, 1)))


def calculate_cross_country_score(
    keyword: str,
    all_trends: list[dict],
    total_countries: int = 6,
) -> float:
    """
    다국가 동시 출현 점수 계산.
    Calculate cross-country presence score.

    같은 키워드/해시태그가 여러 국가에서 동시에 트렌딩되면 점수가 높아진다.

    Args:
        keyword: 검색할 키워드 또는 해시태그
        all_trends: 전체 수집 데이터 목록
        total_countries: Phase 1 대상 국가 수 (기본 6)

    Returns:
        다국가 출현 점수 (0~100)
    """
    if not all_trends or not keyword:
        return 0.0

    keyword_lower = keyword.lower()

    # 해당 키워드가 출현한 국가 코드 수집
    appearing_countries: set[str] = set()
    for trend in all_trends:
        trend_keyword = trend.get("keyword", trend.get("hashtag", "")).lower()
        if trend_keyword == keyword_lower:
            country = trend.get("country_code", trend.get("country", ""))
            if country:
                appearing_countries.add(country)

    # 출현 국가 비율 → 점수 (1개국=0, 2개국=40, 3개국=60, 4개국=75, 5개국=90, 6개국=100)
    count = len(appearing_countries)
    if count <= 1:
        return 0.0

    # 비율 기반 계산 (비선형: 2개국 이상부터 가치가 급격히 올라감)
    ratio = count / total_countries
    score = ratio * 100 * 1.2  # 1.2배 부스트 (다국가 출현의 가치를 높임)
    return max(0.0, min(100.0, round(score, 1)))


def calculate_batch_scores(
    google_data: list[dict],
    tiktok_data: list[dict],
) -> list[dict]:
    """
    수집된 Google Trends + TikTok 데이터를 합산하여 Heat Score를 배치 계산.
    Batch calculate Heat Scores from collected Google Trends + TikTok data.

    동일 키워드는 하나로 합산하고, 서로 다른 소스의 점수를 결합한다.

    Args:
        google_data: Google Trends 수집 결과 리스트
        tiktok_data: TikTok 수집 결과 리스트

    Returns:
        [{ keyword, heat_score, search_score, social_score, ecommerce_score,
           cross_country_score, country_code, category, source, collected_at }]
    """
    _log(f"배치 계산 시작: Google={len(google_data)}개, TikTok={len(tiktok_data)}개")

    # ── 전체 트렌드 데이터 합침 (cross-country 계산용) ──
    all_trends = google_data + tiktok_data

    results: list[dict] = []

    # ── Google Trends 데이터 처리 ──
    for item in google_data:
        keyword = item.get("keyword", "")
        interest = item.get("interest", 0)
        country_code = item.get("country_code", "")
        category = item.get("category", "")

        search_score = normalize_search_score(interest)

        # 같은 키워드의 TikTok 데이터 찾기 (fuzzy match)
        social_score = _find_matching_social_score(keyword, tiktok_data, country_code)

        cross_country = calculate_cross_country_score(keyword, all_trends)

        heat_score = calculate_heat_score(
            search_score=search_score,
            social_score=social_score,
            ecommerce_score=0.0,  # Phase 2
            cross_country_score=cross_country,
        )

        results.append({
            "keyword": keyword,
            "heat_score": heat_score,
            "search_score": round(search_score, 1),
            "social_score": round(social_score, 1),
            "ecommerce_score": 0.0,
            "cross_country_score": round(cross_country, 1),
            "country_code": country_code,
            "category": category,
            "source": "google_trends",
            "collected_at": datetime.now(timezone.utc).isoformat(),
        })

    # ── TikTok 전용 데이터 처리 (Google에 없는 해시태그) ──
    google_keywords = {item.get("keyword", "").lower() for item in google_data}

    for item in tiktok_data:
        hashtag = item.get("hashtag", "")
        if hashtag.lower() in google_keywords:
            continue  # Google 데이터와 중복 → 이미 처리됨

        views = item.get("views", 0)
        publish_count = item.get("publish_count", 0)
        country = item.get("country", "")
        category = item.get("industry", "")

        social_score = normalize_social_score(views, publish_count)
        cross_country = calculate_cross_country_score(hashtag, all_trends)

        heat_score = calculate_heat_score(
            search_score=0.0,  # Google 데이터 없음
            social_score=social_score,
            ecommerce_score=0.0,
            cross_country_score=cross_country,
        )

        results.append({
            "keyword": hashtag,
            "heat_score": heat_score,
            "search_score": 0.0,
            "social_score": round(social_score, 1),
            "ecommerce_score": 0.0,
            "cross_country_score": round(cross_country, 1),
            "country_code": country,
            "category": category,
            "source": "tiktok",
            "collected_at": datetime.now(timezone.utc).isoformat(),
        })

    # ── Heat Score 내림차순 정렬 ──
    results.sort(key=lambda x: x["heat_score"], reverse=True)

    _log(f"배치 계산 완료: {len(results)}개 트렌드, "
         f"최고 점수: {results[0]['heat_score'] if results else 0}")

    return results


def _find_matching_social_score(
    keyword: str,
    tiktok_data: list[dict],
    country_code: str,
) -> float:
    """
    Google Trends 키워드에 대응하는 TikTok 소셜 점수를 찾는다.
    Find matching TikTok social score for a Google Trends keyword.

    정확 매치 → 부분 매치 → 0점 순서로 탐색.

    Args:
        keyword: Google Trends 키워드
        tiktok_data: TikTok 수집 데이터
        country_code: 국가 코드

    Returns:
        소셜 점수 (0~100)
    """
    if not tiktok_data or not keyword:
        return 0.0

    keyword_lower = keyword.lower()

    # ── 1차: 정확 매치 (같은 국가) ──
    for item in tiktok_data:
        hashtag = item.get("hashtag", "").lower()
        country = item.get("country", "")
        if hashtag == keyword_lower and country == country_code:
            return normalize_social_score(
                item.get("views", 0),
                item.get("publish_count", 0),
            )

    # ── 2차: 부분 매치 (키워드가 해시태그에 포함) ──
    for item in tiktok_data:
        hashtag = item.get("hashtag", "").lower()
        country = item.get("country", "")
        if country == country_code and (keyword_lower in hashtag or hashtag in keyword_lower):
            return normalize_social_score(
                item.get("views", 0),
                item.get("publish_count", 0),
            )

    return 0.0


# ──────────────────────────────────────────────
# 독립 실행 테스트 (Standalone test)
# ──────────────────────────────────────────────
if __name__ == "__main__":
    _log("=== Heat Score 계산기 독립 테스트 ===")

    # ── 단일 계산 테스트 ──
    score1 = calculate_heat_score(search_score=80, social_score=90, ecommerce_score=0, cross_country_score=60)
    _log(f"테스트 1 (search=80, social=90, ecom=0, cross=60): Heat Score = {score1}")
    # 예상: 80*0.3 + 90*0.4 + 0*0.2 + 60*0.1 = 24 + 36 + 0 + 6 = 66

    score2 = calculate_heat_score(search_score=50, social_score=50, ecommerce_score=50, cross_country_score=50)
    _log(f"테스트 2 (모두 50): Heat Score = {score2}")
    # 예상: 50*0.3 + 50*0.4 + 50*0.2 + 50*0.1 = 15 + 20 + 10 + 5 = 50

    score3 = calculate_heat_score(search_score=100, social_score=100, ecommerce_score=100, cross_country_score=100)
    _log(f"테스트 3 (모두 100): Heat Score = {score3}")
    # 예상: 100

    # ── 정규화 테스트 ──
    _log(f"검색 정규화 (interest=75): {normalize_search_score(75)}")
    _log(f"소셜 정규화 (views=5M, publish=5K): {normalize_social_score(5_000_000, 5_000)}")
    _log(f"소셜 정규화 (views=100, publish=10): {normalize_social_score(100, 10)}")

    # ── 배치 계산 테스트 ──
    test_google = [
        {"keyword": "fashion trend", "interest": 85, "country_code": "KR", "category": "fashion", "related_queries": []},
        {"keyword": "skincare", "interest": 70, "country_code": "KR", "category": "beauty", "related_queries": []},
    ]
    test_tiktok = [
        {"hashtag": "fashion", "views": 5_000_000, "publish_count": 3000, "country": "KR", "industry": "fashion"},
        {"hashtag": "skincare", "views": 2_000_000, "publish_count": 1500, "country": "KR", "industry": "beauty"},
        {"hashtag": "mukbang", "views": 8_000_000, "publish_count": 5000, "country": "KR", "industry": "food"},
    ]

    batch_results = calculate_batch_scores(test_google, test_tiktok)
    _log(f"\n배치 결과 ({len(batch_results)}개):")
    for r in batch_results:
        _log(f"  {r['keyword']}: heat={r['heat_score']}, "
             f"search={r['search_score']}, social={r['social_score']}, "
             f"cross={r['cross_country_score']}")
