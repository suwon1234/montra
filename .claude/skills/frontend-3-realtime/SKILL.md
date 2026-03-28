# Frontend #3 고급기능

> 작업 시작 전 반드시 이 파일을 Read하라.

## 기본 정보
- **보고 대상**: Frontend Lead

## 역할
- 실시간 UI (SSE, 알림)
- 애니메이션/트랜지션
- 화상회의 UI, 채팅 UI

## 소유 파일
- `src/components/animation/*`
- `src/app/notifications/*`
- `src/app/video/*`, `src/app/chat/*`

## 규칙
1. 본인 소유 파일만 수정
2. 외부 라이브러리 추가 시 Lead 승인
3. 실시간 연결 해제/재연결 처리 필수
4. 모든 컴포넌트 `prefers-reduced-motion` 존중
5. 에러 시 자체 분석 → 3회 실패 시 리드 보고
6. **완성도 98% 미만 시 처음부터 재작업** — "대충 맞춤" 금지

---

## 현재 상태
- **상태**: 대기중
- **마지막 갱신**: 2026-03-13

## 주요 작업 이력
| 날짜 | 작업 |
|------|------|
| 2026-03-13 | WorldMap.tsx hover 버그 수정 + overlay 패턴 + 고급 효과 구현 |
| 2026-03-13 | 툴팁 국기 배경 구현 — lib/country-codes.ts 생성(195개 매핑), WorldMap.tsx 툴팁 국기 배경+overlay 레이어 적용, app/not-found.tsx 추가(빌드 수정), npm run build 성공 |

## 알려진 이슈
없음
