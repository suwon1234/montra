# 현재 작업 상황 (자동 복구용)

## 마지막 갱신
- 날짜: 2026-03-23
- PDCA 단계: Do (진행 중)

---

## DB 현황 (v4)
- trends: **244개** (32개국 실제 TikTok/Instagram 바이럴)
- trend_history: **수집 중** (pytrends 백그라운드)
- 카테고리: fashion(59), products(63), food(68), brands(54)

## 백그라운드
- **pytrends 검색량 수집**: 8/244 진행 중
- 멈추면 재시작: `py scripts/collect_google_trends.py`
- progress: `scripts/output/collection_progress.json`

## 다음 할 일
1. pytrends 완료 → trend_history SQL 업로드
2. 수집 안 된 160개국 추후 추가
3. npm run dev 브라우저 확인
4. 커밋
