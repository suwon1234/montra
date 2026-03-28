"""
TikTok 트렌딩 해시태그 수집기 (TikTok Trending Hashtag Collector)

Apify TikTok scraper를 사용하여 국가별 인기 해시태그를 수집한다.
APIFY_API_TOKEN이 없으면 빈 결과를 반환하고 로그를 출력한다.

주요 기능:
  - 국가별 인기 해시태그 수집
  - Apify TikTok Hashtag Scraper Actor 사용
  - 토큰 없을 시 graceful fallback (빈 결과 + 경고)
  - 해시태그별 조회수, 게시물 수, 트렌드 방향 반환

반환 형식:
  [{ hashtag, views, publish_count, trend_direction, country, industry, source, collected_at }]

환경변수:
  APIFY_API_TOKEN — Apify API 토큰 (https://apify.com에서 발급)
"""

import os
import json
import time
from datetime import datetime, timezone
from typing import Optional

try:
    from apify_client import ApifyClient
    APIFY_AVAILABLE = True
except ImportError:
    APIFY_AVAILABLE = False


# ──────────────────────────────────────────────
# Apify Actor ID (TikTok 해시태그 스크래퍼)
# ──────────────────────────────────────────────
TIKTOK_HASHTAG_ACTOR = "clockworks/free-tiktok-scraper"


# ──────────────────────────────────────────────
# 카테고리별 TikTok 해시태그 시드
# Category-specific TikTok hashtag seeds
# ──────────────────────────────────────────────
TIKTOK_CATEGORY_HASHTAGS: dict[str, list[str]] = {
    "fashion": [
        "fashion", "ootd", "streetwear", "fashiontok", "outfitinspo",
        "stylecheck", "grwm", "fashiontrend", "mensfashion", "womensfashion",
    ],
    "beauty": [
        "beauty", "makeup", "skincare", "beautytok", "grwm",
        "makeuptutorial", "skincareroutine", "beautyhacks", "glowup", "cosmetics",
    ],
    "food": [
        "food", "foodtok", "recipe", "cooking", "mukbang",
        "foodtrend", "whatieatinaday", "homecooking", "streetfood", "dessert",
    ],
    "tech": [
        "tech", "techtok", "gadgets", "smartphone", "ai",
        "techreview", "unboxing", "coding", "apps", "techtrend",
    ],
    "lifestyle": [
        "lifestyle", "dayinmylife", "lifehack", "minimalism", "aesthetic",
        "homedecor", "fitness", "travel", "productivity", "wellness",
    ],
}


def _log(message: str) -> None:
    """타임스탬프 로그 출력 (Timestamped log output)"""
    timestamp = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
    print(f"[TikTok {timestamp}] {message}")


def _get_apify_token() -> Optional[str]:
    """
    환경변수에서 Apify API 토큰을 가져온다.
    Get Apify API token from environment variable.
    """
    token = os.getenv("APIFY_API_TOKEN")
    if not token:
        return None
    return token.strip()


def collect_tiktok_trending(
    countries: list[dict],
    sources_config: dict,
) -> list[dict]:
    """
    TikTok에서 국가별 인기 해시태그를 수집한다.
    Collect trending hashtags from TikTok per country.

    Args:
        countries: countries.json에서 로드한 국가 목록
        sources_config: sources.json의 tiktok 설정

    Returns:
        [{ hashtag, views, publish_count, trend_direction, country, industry, source, collected_at }]
    """
    # ── 설정 확인 ──
    tiktok_config = sources_config.get("tiktok", {})
    if not tiktok_config.get("enabled", True):
        _log("TikTok 수집 비활성화됨 (sources.json: enabled=false)")
        return []

    # ── apify-client 설치 여부 확인 ──
    if not APIFY_AVAILABLE:
        _log("WARNING: apify-client 미설치. pip install apify-client 필요. 빈 결과 반환.")
        return []

    # ── API 토큰 확인 ──
    token = _get_apify_token()
    if not token:
        _log("WARNING: APIFY_API_TOKEN 환경변수 미설정. 빈 결과 반환.")
        _log("  → Apify 계정 생성 후 토큰 발급: https://apify.com")
        _log("  → .env 파일에 APIFY_API_TOKEN=<your_token> 추가")
        return []

    use_apify = tiktok_config.get("use_apify", True)
    if not use_apify:
        _log("Apify 사용 비활성화됨. 빈 결과 반환.")
        return []

    max_results = tiktok_config.get("max_results_per_country", 50)
    periods = tiktok_config.get("periods", ["7d", "30d"])

    results: list[dict] = []
    enabled_countries = [c for c in countries if c.get("enabled", True)]

    _log(f"수집 시작: {len(enabled_countries)}개국, 기간: {periods}")

    # ── Apify 클라이언트 초기화 ──
    client = ApifyClient(token)

    for country in enabled_countries:
        country_code = country["code"]
        categories = country.get("categories", [])

        _log(f"  [{country_code}] {country['name']} — {len(categories)}개 카테고리")

        for category in categories:
            hashtags = TIKTOK_CATEGORY_HASHTAGS.get(category, [])
            if not hashtags:
                _log(f"    [{category}] 해시태그 시드 없음, 건너뜀")
                continue

            _log(f"    [{category}] 해시태그 {len(hashtags)}개 조회")

            try:
                category_results = _fetch_tiktok_hashtags(
                    client=client,
                    hashtags=hashtags,
                    country_code=country_code,
                    category=category,
                    max_results=max_results,
                )
                results.extend(category_results)

            except Exception as e:
                _log(f"    [{category}] 수집 실패: {e}")
                continue

    _log(f"수집 완료: 총 {len(results)}개 해시태그 항목")
    return results


def _fetch_tiktok_hashtags(
    client: "ApifyClient",
    hashtags: list[str],
    country_code: str,
    category: str,
    max_results: int = 50,
    max_retries: int = 2,
) -> list[dict]:
    """
    Apify Actor를 통해 TikTok 해시태그 데이터를 수집한다.
    Fetch TikTok hashtag data via Apify Actor.

    Args:
        client: Apify 클라이언트
        hashtags: 조회할 해시태그 목록
        country_code: 국가 코드
        category: 카테고리 이름
        max_results: 최대 결과 수
        max_retries: 최대 재시도 횟수

    Returns:
        수집된 해시태그 데이터 리스트
    """
    results: list[dict] = []

    for attempt in range(max_retries):
        try:
            # ── Apify Actor 실행 입력 ──
            run_input = {
                "hashtags": hashtags[:10],  # Actor 제한에 맞춤
                "resultsPerPage": min(max_results, 50),
                "shouldDownloadVideos": False,
                "shouldDownloadCovers": False,
            }

            _log(f"      Apify Actor 실행 중... (해시태그 {len(run_input['hashtags'])}개)")

            # ── Actor 실행 및 결과 대기 ──
            run = client.actor(TIKTOK_HASHTAG_ACTOR).call(run_input=run_input)

            if not run:
                _log("      Actor 실행 실패 (run 결과 없음)")
                return []

            # ── 결과 수집 ──
            dataset_items = list(client.dataset(run["defaultDatasetId"]).iterate_items())

            _log(f"      Apify 결과: {len(dataset_items)}개 항목")

            for item in dataset_items:
                hashtag_name = item.get("hashtag", item.get("name", ""))
                if not hashtag_name:
                    continue

                # ── 해시태그 앞의 # 제거 ──
                if hashtag_name.startswith("#"):
                    hashtag_name = hashtag_name[1:]

                results.append({
                    "hashtag": hashtag_name,
                    "views": item.get("viewCount", item.get("views", 0)),
                    "publish_count": item.get("videoCount", item.get("publishCount", 0)),
                    "trend_direction": _infer_trend_direction(item),
                    "country": country_code,
                    "industry": category,
                    "source": "tiktok",
                    "collected_at": datetime.now(timezone.utc).isoformat(),
                })

            return results

        except Exception as e:
            _log(f"      Apify 에러 (시도 {attempt + 1}/{max_retries}): {e}")
            if attempt < max_retries - 1:
                time.sleep(5 * (attempt + 1))
                continue
            return []

    return results


def _infer_trend_direction(item: dict) -> str:
    """
    TikTok 데이터에서 트렌드 방향을 추론한다.
    Infer trend direction from TikTok data.

    현재는 단순 규칙 기반:
    - views 1M 이상 + 최근 게시물 많으면 → "rising"
    - views 100K 이상이면 → "steady"
    - 나머지 → "emerging"

    Returns:
        "rising" | "steady" | "emerging"
    """
    views = item.get("viewCount", item.get("views", 0))
    video_count = item.get("videoCount", item.get("publishCount", 0))

    if views >= 1_000_000 and video_count >= 100:
        return "rising"
    elif views >= 100_000:
        return "steady"
    else:
        return "emerging"


# ──────────────────────────────────────────────
# 독립 실행 테스트 (Standalone test)
# ──────────────────────────────────────────────
if __name__ == "__main__":
    from dotenv import load_dotenv
    load_dotenv()

    _log("=== TikTok 트렌딩 수집기 독립 테스트 ===")

    test_countries = [
        {
            "code": "KR",
            "name": "South Korea",
            "tiktok_country": "KR",
            "categories": ["fashion"],
            "enabled": True,
        }
    ]
    test_config = {
        "tiktok": {
            "enabled": True,
            "use_apify": True,
            "max_results_per_country": 10,
            "periods": ["7d"],
        }
    }

    data = collect_tiktok_trending(test_countries, test_config)
    _log(f"수집 결과: {len(data)}개 항목")
    for item in data:
        _log(f"  #{item['hashtag']}: views={item['views']}, direction={item['trend_direction']}")
