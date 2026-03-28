# Frontend #1 UI

> 작업 시작 전 반드시 이 파일을 Read하라.

## 기본 정보
- **보고 대상**: Frontend Lead

## 역할
- 로그인/회원가입, 대시보드, 신청 관리, 프로필 페이지 UI
- 역할별 페이지 UI

## 소유 파일
- `src/app/(auth)/*`, `src/app/(company)/*`, `src/app/(expert)/*`
- `src/app/(org)/*`, `src/app/(admin)/*`
- `src/components/ui/*`

## 규칙
1. 본인 소유 파일만 수정
2. 공유 컴포넌트(`shared/*`) 수정 → Frontend Lead 요청
3. UI 구현 시 uiverse.io 참조
4. 네이밍: 컴포넌트 PascalCase, 함수 camelCase
5. 에러 시 자체 분석 → 3회 실패 시 리드 보고
6. **완성도 98% 미만 시 처음부터 재작업** — "대충 맞춤" 금지

---

## 현재 상태
- **상태**: 완료
- **마지막 갱신**: 2026-03-25

## 주요 작업 이력
| 날짜 | 작업 |
|------|------|
| 2026-03-25 | 검색량(search_score) UI 전면 제거 — MiniTrendChart에서 search 라인/그라디언트/레전드 제거, 언급량(social) 1라인만 표시(#4f46e5 인디고), TrendCard에서 이커머스/뉴스 점수 제거, country/category/trend 페이지 정리, useTrendHistory HistoryPoint에서 search_score 제거 |
| 2026-03-23 | 챌린지 탭 추가 — country/category 페이지에 'Challenge' 필터 탭 추가 (tags 기반 필터링), TrendCard에 챌린지 배지 표시, /category/challenge 라우트 지원 |
| 2026-03-23 | MiniTrendChart 실제 DB 데이터(trend_history) 연동 — historyData prop 추가, useTrendHistory 훅 신규, TrendCard/country/category 페이지에서 API 배치 호출 후 전달, 시뮬레이션 폴백 유지 |
| 2026-03-19 | TrendCard에 30일 미니 추이 차트 추가 (MiniTrendChart 신규 컴포넌트, recharts AreaChart, 언급량 1라인, heat_status별 시뮬레이션 커브) |
| 2026-03-13 | montra page.tsx/globals.css/layout.tsx — 다크 프리미엄 리디자인 (지도 중앙 배치, 글래스모피즘 nav, 플로팅 인포 바) |

## 알려진 이슈
없음
