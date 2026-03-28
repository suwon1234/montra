"""
MONTRA 데이터 수집 & Heat Score 계산 메인 스크립트
(MONTRA Data Collection & Heat Score Calculation Main Script)

사용법 (Usage):
  python main.py --task=collect    # 데이터 수집만 실행
  python main.py --task=score      # Heat Score 계산만 실행
  python main.py --task=all        # 전체 실행 (수집 → 계산)

환경변수 (.env 파일에 설정):
  NEXT_PUBLIC_SUPABASE_URL=       # Supabase 프로젝트 URL
  NEXT_PUBLIC_SUPABASE_ANON_KEY=  # Supabase anon key
  SUPABASE_SERVICE_ROLE_KEY=      # Supabase service role key (DB 쓰기용)
  APIFY_API_TOKEN=                # Apify API 토큰 (TikTok 수집용)

동작 방식:
  1. collect: Google Trends + TikTok 데이터 수집 → Supabase 또는 로컬 JSON 저장
  2. score:   수집 데이터 기반 Heat Score 계산 → trends 테이블 업데이트
  3. all:     collect → score 순서로 전체 실행

Supabase 연결이 없으면 scripts/output/ 디렉토리에 JSON 파일로 로컬 저장 (fallback).
"""

import argparse
import json
import os
import sys
from datetime import datetime, timezone
from pathlib import Path

# ── 프로젝트 루트를 sys.path에 추가 ──
SCRIPT_DIR = Path(__file__).parent
sys.path.insert(0, str(SCRIPT_DIR))

from dotenv import load_dotenv

# ── 수집기/처리기 임포트 ──
from collectors.google_trends import collect_google_trends
from collectors.tiktok_trending import collect_tiktok_trending
from processors.score_calculator import calculate_batch_scores
from processors.trend_detector import detect_batch_statuses, summarize_trends

# ── Supabase 클라이언트 (선택적) ──
try:
    from supabase import create_client, Client as SupabaseClient
    SUPABASE_AVAILABLE = True
except ImportError:
    SUPABASE_AVAILABLE = False


# ──────────────────────────────────────────────
# 로깅 (Logging)
# ──────────────────────────────────────────────
def _log(message: str) -> None:
    """타임스탬프 로그 출력 (Timestamped log output)"""
    timestamp = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
    print(f"[MONTRA {timestamp}] {message}")


# ──────────────────────────────────────────────
# 설정 로드 (Config Loading)
# ──────────────────────────────────────────────
def load_config() -> tuple[list[dict], dict]:
    """
    countries.json과 sources.json을 로드한다.
    Load countries.json and sources.json configuration files.

    Returns:
        (countries, sources_config) 튜플
    """
    config_dir = SCRIPT_DIR / "config"

    # ── countries.json ──
    countries_path = config_dir / "countries.json"
    if not countries_path.exists():
        _log(f"ERROR: {countries_path} 파일이 없습니다")
        sys.exit(1)

    with open(countries_path, "r", encoding="utf-8") as f:
        countries = json.load(f)

    # ── sources.json ──
    sources_path = config_dir / "sources.json"
    if not sources_path.exists():
        _log(f"ERROR: {sources_path} 파일이 없습니다")
        sys.exit(1)

    with open(sources_path, "r", encoding="utf-8") as f:
        sources_config = json.load(f)

    _log(f"설정 로드 완료: {len(countries)}개국, {len(sources_config)}개 소스")
    return countries, sources_config


# ──────────────────────────────────────────────
# Supabase 연결 (Supabase Connection)
# ──────────────────────────────────────────────
def get_supabase_client() -> "SupabaseClient | None":
    """
    Supabase 클라이언트를 생성한다. 연결 불가 시 None 반환.
    Create Supabase client. Returns None if connection is unavailable.

    Returns:
        SupabaseClient 또는 None (fallback to local JSON)
    """
    if not SUPABASE_AVAILABLE:
        _log("WARNING: supabase 패키지 미설치. pip install supabase 필요.")
        _log("  → 로컬 JSON 파일로 fallback 저장합니다.")
        return None

    url = os.getenv("NEXT_PUBLIC_SUPABASE_URL")
    key = os.getenv("SUPABASE_SERVICE_ROLE_KEY") or os.getenv("NEXT_PUBLIC_SUPABASE_ANON_KEY")

    if not url or not key:
        _log("WARNING: Supabase 환경변수 미설정.")
        _log("  → NEXT_PUBLIC_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY 필요")
        _log("  → 로컬 JSON 파일로 fallback 저장합니다.")
        return None

    try:
        client = create_client(url, key)
        _log(f"Supabase 연결 성공: {url[:30]}...")
        return client
    except Exception as e:
        _log(f"WARNING: Supabase 연결 실패: {e}")
        _log("  → 로컬 JSON 파일로 fallback 저장합니다.")
        return None


# ──────────────────────────────────────────────
# 로컬 JSON Fallback 저장 (Local JSON Fallback)
# ──────────────────────────────────────────────
def save_to_local_json(data: list[dict], filename: str) -> str:
    """
    데이터를 로컬 JSON 파일로 저장한다.
    Save data to local JSON file as fallback.

    Args:
        data: 저장할 데이터 리스트
        filename: 파일명 (확장자 제외)

    Returns:
        저장된 파일 경로
    """
    output_dir = SCRIPT_DIR / "output"
    output_dir.mkdir(exist_ok=True)

    timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
    filepath = output_dir / f"{filename}_{timestamp}.json"

    with open(filepath, "w", encoding="utf-8") as f:
        json.dump(data, f, ensure_ascii=False, indent=2)

    _log(f"로컬 저장 완료: {filepath} ({len(data)}개 항목)")
    return str(filepath)


# ──────────────────────────────────────────────
# Supabase 데이터 저장 (Supabase Data Storage)
# ──────────────────────────────────────────────
def save_to_supabase(
    client: "SupabaseClient",
    data: list[dict],
    table: str,
) -> bool:
    """
    데이터를 Supabase 테이블에 저장한다.
    Save data to Supabase table.

    Args:
        client: Supabase 클라이언트
        data: 저장할 데이터 리스트
        table: 대상 테이블명

    Returns:
        성공 여부
    """
    if not data:
        _log(f"  [{table}] 저장할 데이터 없음")
        return True

    try:
        # ── 배치 크기 제한 (Supabase는 1000개씩 권장) ──
        batch_size = 500
        total_saved = 0

        for i in range(0, len(data), batch_size):
            batch = data[i:i + batch_size]
            result = client.table(table).upsert(batch).execute()
            total_saved += len(batch)
            _log(f"  [{table}] {total_saved}/{len(data)} 저장 완료")

        _log(f"  [{table}] 전체 저장 완료: {total_saved}개")
        return True

    except Exception as e:
        _log(f"  [{table}] Supabase 저장 실패: {e}")
        return False


def load_previous_scores(client: "SupabaseClient | None") -> dict[str, float]:
    """
    7일 전 Heat Score를 로드한다 (trend_detector용).
    Load previous Heat Scores for trend detection comparison.

    Args:
        client: Supabase 클라이언트 (없으면 빈 dict)

    Returns:
        { "keyword|country_code": previous_heat_score }
    """
    if client is None:
        # ── 로컬 JSON에서 가장 최근 scores 파일 로드 ──
        output_dir = SCRIPT_DIR / "output"
        if not output_dir.exists():
            return {}

        score_files = sorted(output_dir.glob("scores_*.json"), reverse=True)
        if not score_files:
            return {}

        try:
            with open(score_files[0], "r", encoding="utf-8") as f:
                prev_data = json.load(f)

            prev_scores = {}
            for item in prev_data:
                key = f"{item.get('keyword', '')}|{item.get('country_code', '')}"
                prev_scores[key] = item.get("heat_score", 0)

            _log(f"이전 점수 로드 (로컬): {len(prev_scores)}개 ({score_files[0].name})")
            return prev_scores
        except Exception as e:
            _log(f"이전 점수 로드 실패: {e}")
            return {}

    try:
        # ── Supabase에서 최신 트렌드 데이터 조회 ──
        result = client.table("trends").select("keyword, country_code, heat_score").execute()
        prev_scores = {}
        for item in result.data:
            key = f"{item['keyword']}|{item['country_code']}"
            prev_scores[key] = item.get("heat_score", 0)

        _log(f"이전 점수 로드 (Supabase): {len(prev_scores)}개")
        return prev_scores
    except Exception as e:
        _log(f"이전 점수 로드 실패: {e}")
        return {}


# ──────────────────────────────────────────────
# 메인 태스크 (Main Tasks)
# ──────────────────────────────────────────────
def task_collect(countries: list[dict], sources_config: dict) -> tuple[list[dict], list[dict]]:
    """
    데이터 수집 태스크: Google Trends + TikTok.
    Data collection task: Google Trends + TikTok.

    Args:
        countries: 국가 설정
        sources_config: 소스 설정

    Returns:
        (google_data, tiktok_data) 튜플
    """
    _log("=" * 60)
    _log("TASK: 데이터 수집 시작 (Data Collection)")
    _log("=" * 60)

    # ── Google Trends 수집 ──
    _log("\n--- Google Trends 수집 ---")
    google_data = collect_google_trends(countries, sources_config)
    _log(f"Google Trends 수집 결과: {len(google_data)}개 항목")

    # ── TikTok 트렌딩 수집 ──
    _log("\n--- TikTok 트렌딩 수집 ---")
    tiktok_data = collect_tiktok_trending(countries, sources_config)
    _log(f"TikTok 수집 결과: {len(tiktok_data)}개 항목")

    _log(f"\n수집 총계: Google={len(google_data)}, TikTok={len(tiktok_data)}, "
         f"합계={len(google_data) + len(tiktok_data)}개")

    return google_data, tiktok_data


def task_score(
    google_data: list[dict],
    tiktok_data: list[dict],
    previous_scores: dict[str, float],
) -> list[dict]:
    """
    Heat Score 계산 태스크.
    Heat Score calculation task.

    Args:
        google_data: Google Trends 수집 데이터
        tiktok_data: TikTok 수집 데이터
        previous_scores: 이전 점수 데이터

    Returns:
        Heat Score + heat_status가 포함된 트렌드 리스트
    """
    _log("=" * 60)
    _log("TASK: Heat Score 계산 시작 (Score Calculation)")
    _log("=" * 60)

    # ── Heat Score 배치 계산 ──
    scored_trends = calculate_batch_scores(google_data, tiktok_data)
    _log(f"Heat Score 계산 완료: {len(scored_trends)}개 트렌드")

    # ── 트렌드 상태 판정 ──
    # first_detected_days_ago 기본값 설정 (새 데이터 = 0일)
    for trend in scored_trends:
        if "first_detected_days_ago" not in trend:
            lookup_key = f"{trend.get('keyword', '')}|{trend.get('country_code', '')}"
            if lookup_key in previous_scores:
                trend["first_detected_days_ago"] = 7  # 이전에 존재했으므로 최소 7일
            else:
                trend["first_detected_days_ago"] = 0  # 최초 감지

    scored_trends = detect_batch_statuses(scored_trends, previous_scores)

    # ── 요약 출력 ──
    summary = summarize_trends(scored_trends)
    _log(f"\n--- 트렌드 요약 ---")
    _log(f"전체: {summary['total']}개, 평균 Heat Score: {summary['avg_score']}")
    _log(f"상태별: new={summary['by_status']['new']}, "
         f"rising={summary['by_status']['rising']}, "
         f"steady={summary['by_status']['steady']}, "
         f"cooling={summary['by_status']['cooling']}")

    if summary["top_trends"]:
        _log(f"\nTop 5 트렌드:")
        for i, t in enumerate(summary["top_trends"], 1):
            _log(f"  {i}. {t['keyword']} (Score: {t['heat_score']}, "
                 f"Status: {t['heat_status']}, Country: {t['country_code']})")

    return scored_trends


# ──────────────────────────────────────────────
# 메인 실행 (Main Execution)
# ──────────────────────────────────────────────
def main():
    """
    메인 진입점. CLI 인자에 따라 작업을 수행한다.
    Main entry point. Execute tasks based on CLI arguments.
    """
    parser = argparse.ArgumentParser(
        description="MONTRA 트렌드 데이터 수집 & Heat Score 계산",
        formatter_class=argparse.RawDescriptionHelpFormatter,
        epilog="""
사용 예시:
  python main.py --task=collect    # 데이터 수집만
  python main.py --task=score      # Heat Score 계산만
  python main.py --task=all        # 전체 실행

환경변수 (.env 파일):
  NEXT_PUBLIC_SUPABASE_URL         Supabase 프로젝트 URL
  NEXT_PUBLIC_SUPABASE_ANON_KEY    Supabase anon key
  SUPABASE_SERVICE_ROLE_KEY        Supabase service role key
  APIFY_API_TOKEN                  Apify API 토큰 (TikTok용)
        """,
    )
    parser.add_argument(
        "--task",
        type=str,
        choices=["collect", "score", "all"],
        default="all",
        help="실행할 태스크 (기본: all)",
    )
    parser.add_argument(
        "--dry-run",
        action="store_true",
        help="DB 저장 없이 결과만 출력 (테스트용)",
    )

    args = parser.parse_args()

    # ── 환경변수 로드 ──
    # 프로젝트 루트의 .env 파일 우선, 없으면 scripts/.env
    project_env = SCRIPT_DIR.parent / ".env"
    scripts_env = SCRIPT_DIR / ".env"

    if project_env.exists():
        load_dotenv(project_env)
        _log(f".env 로드: {project_env}")
    elif scripts_env.exists():
        load_dotenv(scripts_env)
        _log(f".env 로드: {scripts_env}")
    else:
        _log("WARNING: .env 파일 없음. 환경변수가 직접 설정되어야 합니다.")

    _log("=" * 60)
    _log(f"MONTRA 데이터 파이프라인 시작 (task={args.task})")
    _log("=" * 60)

    # ── 설정 로드 ──
    countries, sources_config = load_config()

    # ── Supabase 클라이언트 ──
    supabase = None
    if not args.dry_run:
        supabase = get_supabase_client()

    # ── 이전 점수 로드 (score/all 태스크용) ──
    previous_scores: dict[str, float] = {}
    if args.task in ("score", "all"):
        previous_scores = load_previous_scores(supabase)

    # ── 태스크 실행 ──
    google_data: list[dict] = []
    tiktok_data: list[dict] = []
    scored_trends: list[dict] = []

    if args.task in ("collect", "all"):
        google_data, tiktok_data = task_collect(countries, sources_config)

        # ── 수집 데이터 저장 ──
        if not args.dry_run:
            all_collected = []
            for item in google_data:
                all_collected.append({
                    "source": "google_trends",
                    "keyword": item.get("keyword", ""),
                    "country_code": item.get("country_code", ""),
                    "category": item.get("category", ""),
                    "raw_data": item,
                    "collected_at": item.get("collected_at", datetime.now(timezone.utc).isoformat()),
                })
            for item in tiktok_data:
                all_collected.append({
                    "source": "tiktok",
                    "keyword": item.get("hashtag", ""),
                    "country_code": item.get("country", ""),
                    "category": item.get("industry", ""),
                    "raw_data": item,
                    "collected_at": item.get("collected_at", datetime.now(timezone.utc).isoformat()),
                })

            if supabase:
                save_to_supabase(supabase, all_collected, "data_sources")
            else:
                save_to_local_json(all_collected, "collected")

    if args.task in ("score", "all"):
        # ── score 태스크만 실행 시 로컬 데이터 로드 ──
        if args.task == "score" and not google_data and not tiktok_data:
            google_data, tiktok_data = _load_latest_collected_data()

        scored_trends = task_score(google_data, tiktok_data, previous_scores)

        # ── 점수 데이터 저장 ──
        if not args.dry_run:
            if supabase:
                # Supabase trends 테이블에 upsert
                supabase_records = []
                for trend in scored_trends:
                    supabase_records.append({
                        "keyword": trend.get("keyword", ""),
                        "country_code": trend.get("country_code", ""),
                        "category": trend.get("category", ""),
                        "heat_score": trend.get("heat_score", 0),
                        "heat_status": trend.get("heat_status", "new"),
                        "search_score": trend.get("search_score", 0),
                        "social_score": trend.get("social_score", 0),
                        "ecommerce_score": trend.get("ecommerce_score", 0),
                        "cross_country_score": trend.get("cross_country_score", 0),
                        "source": trend.get("source", ""),
                        "updated_at": datetime.now(timezone.utc).isoformat(),
                    })
                save_to_supabase(supabase, supabase_records, "trends")
            else:
                save_to_local_json(scored_trends, "scores")

    _log("\n" + "=" * 60)
    _log("MONTRA 데이터 파이프라인 완료")
    _log("=" * 60)


def _load_latest_collected_data() -> tuple[list[dict], list[dict]]:
    """
    가장 최근 수집 데이터를 로컬 JSON에서 로드한다.
    Load the most recent collected data from local JSON files.

    Returns:
        (google_data, tiktok_data) 튜플
    """
    output_dir = SCRIPT_DIR / "output"
    if not output_dir.exists():
        _log("WARNING: output/ 디렉토리 없음. 빈 데이터로 진행.")
        return [], []

    collected_files = sorted(output_dir.glob("collected_*.json"), reverse=True)
    if not collected_files:
        _log("WARNING: 수집 데이터 파일 없음. 먼저 --task=collect을 실행하세요.")
        return [], []

    try:
        with open(collected_files[0], "r", encoding="utf-8") as f:
            all_data = json.load(f)

        google_data = []
        tiktok_data = []
        for item in all_data:
            raw = item.get("raw_data", item)
            if item.get("source") == "google_trends":
                google_data.append(raw)
            elif item.get("source") == "tiktok":
                tiktok_data.append(raw)

        _log(f"로컬 데이터 로드: {collected_files[0].name} "
             f"(Google={len(google_data)}, TikTok={len(tiktok_data)})")
        return google_data, tiktok_data

    except Exception as e:
        _log(f"데이터 로드 실패: {e}")
        return [], []


if __name__ == "__main__":
    main()
