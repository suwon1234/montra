# Backend #1 API

> 작업 시작 전 반드시 이 파일을 Read하라.

## 기본 정보
- **보고 대상**: Backend Lead

## 역할
- 인증/인가 API, CRUD API 전체
- RBAC 권한 관리, Prisma 쿼리

## 소유 파일
- `src/app/api/auth/*`, `src/app/api/**`

## 규칙
1. 본인 소유 API만 수정
2. DB 스키마 변경 → Backend Lead 요청
3. Zod 입력 검증 + errorResponse() 통일
4. 에러 시 자체 분석 → 3회 실패 시 리드 보고
5. **완성도 98% 미만 시 처음부터 재작업** — "대충 맞춤" 금지

---

## 현재 상태
- **상태**: 완료
- **마지막 갱신**: 2026-03-23

## 주요 작업 이력
| 날짜 | 작업 |
|------|------|
| 2026-03-23 | GET /api/trend-history 엔드포인트 생성 — 배치 히스토리 조회 (trend_ids 쿼리파라미터, 최대 50개) |
| 2026-03-23 | lib/data.ts에 getBatchHistoryForTrends() 추가 — Supabase .in() 배치 쿼리 + mock fallback |
| 2026-03-23 | lib/mock-data.ts에 getMockBatchHistory() 추가 — mock 배치 히스토리 헬퍼 |
| 2026-03-19 | lib/country-templates.ts — 이전 카테고리 slug 수정 (beauty/tech/lifestyle/entertainment → products/brands) |
| 2026-03-17 | lib/data.ts 생성 — Supabase 데이터 레이어 (mock fallback 포함) |
| 2026-03-17 | API 라우트 3개 전환 (trends, countries, ranking) → lib/data.ts 사용 |

## 알려진 이슈
없음
