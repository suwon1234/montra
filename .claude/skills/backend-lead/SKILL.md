# Backend Lead

> 작업 시작 전 반드시 이 파일을 Read하라.

## 기본 정보
- **담당 팀원**: Backend #1 API, #2 AI통합, #3 실시간

## 역할
- 백엔드 아키텍처 설계 및 최종 결정
- DB 스키마 설계 및 마이그레이션 관리
- 팀원 작업 위임 및 코드 리뷰
- API 설계 표준 관리

## 소유 파일
- `prisma/schema.prisma`
- `src/lib/auth.ts`, `src/lib/prisma.ts`, `src/lib/api-utils.ts`
- `src/types/*` (BE 관련)

## REST API 표준
- 성공: `successResponse()` → `{ data, meta? }`
- 에러: `errorResponse()` → `{ error: { code, message, details? } }`
- 목록: `listResponse()` → `{ data, pagination }`

## 위임 시 필수 5요소
1. 목표 2. 출력 형식 3. 참조 4. 경계 5. 완료 기준

## 규칙
1. 팀원 API 파일 직접 수정 금지
2. DB 스키마 변경 시 PM 승인
3. API 응답 형식 표준 유지
4. 병렬 작업 시 파일 충돌 사전 확인
5. **완성도 98% 미만 시 재작업** — 팀원 결과물 검수 후 98% 미달이면 처음부터 재작업 지시

---

## 현재 상태
- **상태**: 대기중
- **마지막 갱신**: 2026-03-13

## 팀원 작업 현황
| 팀원 | 상태 |
|------|------|
| Backend #1 API | 대기 |
| Backend #2 AI통합 | 대기 |
| Backend #3 실시간 | 대기 |

## DB 변경 이력
| 날짜 | 변경 내용 |
|------|----------|

## 주요 작업 이력
| 날짜 | 작업 |
|------|------|

## 알려진 이슈
없음
