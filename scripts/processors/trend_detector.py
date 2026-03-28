"""
트렌드 상태 감지기 (Trend Status Detector)

heat_score의 변동 추이를 분석하여 트렌드 상태(heat_status)를 판정한다.
AI 없이 순수 규칙 기반으로 동작한다.

상태 정의:
  - new:     최초 감지 3일 이내 (first_detected_days_ago <= 3)
  - rising:  7일 대비 +15 이상 상승 (current - previous >= 15)
  - steady:  변동폭 ±15 이내 (abs(current - previous) < 15)
  - cooling: 7일 대비 -15 이상 하락 (current - previous <= -15)

주요 기능:
  - 단일 트렌드 상태 판정
  - 배치 상태 판정 (여러 트렌드 한번에)
  - 상태 변경 이력 추적
"""

from datetime import datetime
from typing import Optional


def _log(message: str) -> None:
    """타임스탬프 로그 출력 (Timestamped log output)"""
    timestamp = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
    try:
        print(f"[TrendDetect {timestamp}] {message}")
    except UnicodeEncodeError:
        # Windows cp949 인코딩에서 이모지 출력 실패 시 대체 문자로 출력
        safe_msg = message.encode("ascii", errors="replace").decode("ascii")
        print(f"[TrendDetect {timestamp}] {safe_msg}")


# ──────────────────────────────────────────────
# 상태 판정 임계값 (Status Detection Thresholds)
# ──────────────────────────────────────────────
THRESHOLDS = {
    "new_days": 3,           # "new" 상태 유지 일수
    "rising_delta": 15,      # 상승 판정 최소 변동폭
    "cooling_delta": -15,    # 하락 판정 최소 변동폭
}

# 유효한 상태값 (Valid status values)
VALID_STATUSES = {"new", "rising", "steady", "cooling"}


def detect_status(
    current_score: float,
    previous_score: Optional[float],
    first_detected_days_ago: int,
) -> str:
    """
    heat_status를 판정한다.
    Determine the heat_status of a trend.

    판정 로직 (우선순위 순):
      1. 최초 감지 3일 이내 → "new"
      2. 이전 점수 없음 → "new"
      3. 7일 대비 +15 이상 → "rising"
      4. 7일 대비 -15 이상 → "cooling"
      5. 변동폭 ±15 미만 → "steady"

    Args:
        current_score:  현재 Heat Score (0~100)
        previous_score: 7일 전 Heat Score (0~100, 없으면 None)
        first_detected_days_ago: 최초 감지 후 경과 일수

    Returns:
        "new" | "rising" | "steady" | "cooling"
    """
    # ── 1. 최초 감지 3일 이내 → new ──
    if first_detected_days_ago <= THRESHOLDS["new_days"]:
        return "new"

    # ── 2. 이전 점수 없음 → new (비교 불가) ──
    if previous_score is None:
        return "new"

    # ── 3. 변동폭 계산 ──
    delta = current_score - previous_score

    # ── 4. 상승 판정: +15 이상 ──
    if delta >= THRESHOLDS["rising_delta"]:
        return "rising"

    # ── 5. 하락 판정: -15 이상 ──
    if delta <= THRESHOLDS["cooling_delta"]:
        return "cooling"

    # ── 6. 나머지: 안정 ──
    return "steady"


def detect_batch_statuses(
    trends: list[dict],
    previous_scores: Optional[dict[str, float]] = None,
) -> list[dict]:
    """
    여러 트렌드의 상태를 배치로 판정한다.
    Batch detect statuses for multiple trends.

    Args:
        trends: 현재 트렌드 데이터 리스트
                각 항목: { keyword, heat_score, country_code, first_detected_days_ago?, ... }
        previous_scores: 7일 전 점수 매핑
                         { "keyword|country_code": previous_heat_score }
                         없으면 모든 항목이 new로 판정됨

    Returns:
        상태가 추가된 트렌드 리스트 (각 항목에 heat_status 필드 추가)
    """
    _log(f"배치 상태 판정 시작: {len(trends)}개 트렌드")

    if previous_scores is None:
        previous_scores = {}

    status_counts = {"new": 0, "rising": 0, "steady": 0, "cooling": 0}

    for trend in trends:
        keyword = trend.get("keyword", "")
        country_code = trend.get("country_code", "")
        current_score = trend.get("heat_score", 0)
        first_detected = trend.get("first_detected_days_ago", 0)

        # ── 이전 점수 조회 (keyword|country_code 조합) ──
        lookup_key = f"{keyword}|{country_code}"
        prev_score = previous_scores.get(lookup_key)

        # ── 상태 판정 ──
        status = detect_status(current_score, prev_score, first_detected)
        trend["heat_status"] = status

        # ── 변동폭 기록 ──
        if prev_score is not None:
            trend["score_delta"] = round(current_score - prev_score, 1)
        else:
            trend["score_delta"] = 0

        status_counts[status] += 1

    _log(f"배치 판정 완료: new={status_counts['new']}, rising={status_counts['rising']}, "
         f"steady={status_counts['steady']}, cooling={status_counts['cooling']}")

    return trends


def get_status_emoji(status: str) -> str:
    """
    상태별 이모지 반환 (로그/UI 표시용).
    Get emoji for status display.

    Args:
        status: heat_status 값

    Returns:
        상태 이모지
    """
    emoji_map = {
        "new": "🆕",
        "rising": "🔥",
        "steady": "➡️",
        "cooling": "❄️",
    }
    return emoji_map.get(status, "❓")


def get_status_description(status: str) -> str:
    """
    상태별 한국어 설명 반환.
    Get Korean description for a status.

    Args:
        status: heat_status 값

    Returns:
        상태 설명 문자열
    """
    descriptions = {
        "new": "신규 트렌드 (3일 이내 최초 감지)",
        "rising": "급상승 (7일 대비 +15 이상)",
        "steady": "안정세 (변동폭 ±15 이내)",
        "cooling": "하락세 (7일 대비 -15 이상 하락)",
    }
    return descriptions.get(status, "알 수 없음")


def summarize_trends(trends: list[dict]) -> dict:
    """
    트렌드 데이터 요약 통계를 반환한다.
    Return summary statistics for trend data.

    Args:
        trends: heat_status가 포함된 트렌드 리스트

    Returns:
        {
            total: 전체 수,
            by_status: { new: N, rising: N, steady: N, cooling: N },
            avg_score: 평균 Heat Score,
            top_trends: 상위 5개 트렌드,
        }
    """
    if not trends:
        return {
            "total": 0,
            "by_status": {"new": 0, "rising": 0, "steady": 0, "cooling": 0},
            "avg_score": 0,
            "top_trends": [],
        }

    by_status = {"new": 0, "rising": 0, "steady": 0, "cooling": 0}
    total_score = 0

    for t in trends:
        status = t.get("heat_status", "new")
        if status in by_status:
            by_status[status] += 1
        total_score += t.get("heat_score", 0)

    avg_score = round(total_score / len(trends), 1) if trends else 0

    # 상위 5개 (Heat Score 기준 내림차순)
    sorted_trends = sorted(trends, key=lambda x: x.get("heat_score", 0), reverse=True)
    top_5 = []
    for t in sorted_trends[:5]:
        top_5.append({
            "keyword": t.get("keyword", ""),
            "heat_score": t.get("heat_score", 0),
            "heat_status": t.get("heat_status", "new"),
            "country_code": t.get("country_code", ""),
        })

    return {
        "total": len(trends),
        "by_status": by_status,
        "avg_score": avg_score,
        "top_trends": top_5,
    }


# ──────────────────────────────────────────────
# 독립 실행 테스트 (Standalone test)
# ──────────────────────────────────────────────
if __name__ == "__main__":
    _log("=== 트렌드 상태 감지기 독립 테스트 ===")

    # ── 단일 판정 테스트 ──
    test_cases = [
        # (current, previous, days_ago, expected)
        (80, None, 1, "new"),         # 최초 감지 1일 → new
        (80, None, 5, "new"),         # 이전 점수 없음 → new
        (80, 50, 10, "rising"),       # +30 → rising
        (50, 80, 10, "cooling"),      # -30 → cooling
        (75, 70, 10, "steady"),       # +5 → steady
        (60, 60, 10, "steady"),       # ±0 → steady
        (30, 45, 7, "cooling"),       # -15 → cooling (경계값)
        (65, 50, 7, "rising"),        # +15 → rising (경계값)
        (90, 80, 2, "new"),           # 2일차 → new (days가 우선)
    ]

    _log("\n--- 단일 판정 테스트 ---")
    all_passed = True
    for current, previous, days_ago, expected in test_cases:
        result = detect_status(current, previous, days_ago)
        status_mark = "PASS" if result == expected else "FAIL"
        if result != expected:
            all_passed = False
        _log(f"  [{status_mark}] current={current}, prev={previous}, days={days_ago} "
             f"→ {result} (expected: {expected})")

    _log(f"\n단일 판정 테스트: {'ALL PASSED' if all_passed else 'SOME FAILED'}")

    # ── 배치 판정 테스트 ──
    _log("\n--- 배치 판정 테스트 ---")
    test_trends = [
        {"keyword": "fashion trend", "heat_score": 85, "country_code": "KR", "first_detected_days_ago": 1},
        {"keyword": "skincare", "heat_score": 70, "country_code": "KR", "first_detected_days_ago": 10},
        {"keyword": "mukbang", "heat_score": 45, "country_code": "KR", "first_detected_days_ago": 15},
        {"keyword": "AI trend", "heat_score": 92, "country_code": "US", "first_detected_days_ago": 5},
    ]

    prev_scores = {
        "skincare|KR": 50,       # +20 → rising
        "mukbang|KR": 60,        # -15 → cooling
        "AI trend|US": 85,       # +7 → steady
    }

    results = detect_batch_statuses(test_trends, prev_scores)
    for r in results:
        emoji = get_status_emoji(r["heat_status"])
        desc = get_status_description(r["heat_status"])
        _log(f"  {emoji} {r['keyword']}: score={r['heat_score']}, "
             f"status={r['heat_status']}, delta={r.get('score_delta', 0)} — {desc}")

    # ── 요약 테스트 ──
    summary = summarize_trends(results)
    _log(f"\n요약: total={summary['total']}, avg={summary['avg_score']}")
    _log(f"  상태별: {summary['by_status']}")
    _log(f"  Top 트렌드: {[t['keyword'] for t in summary['top_trends']]}")
