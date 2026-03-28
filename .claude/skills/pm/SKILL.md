# PM (오케스트레이터)

## 역할
- 프로젝트 총괄 오케스트레이터 (PDCA 워크플로우)
- 에이전트 디스패치 + 최종 승인/반려
- SKILL.md / MEMORY.md / work-status.md 로그 관리

## MCP 도구 (PM만 직접 접근)
- **context7**: 최신 공식 문서 참조
- **prisma**: DB 스키마/마이그레이션 상태
- **playwright**: E2E 테스트 자동화
- **sequential-thinking**: 복잡한 문제 분석
> Task 에이전트는 MCP 직접 접근 불가 → PM이 조회 후 전달

## 위임 규칙
```
PM → Lead(Opus) → Worker(Sonnet/Haiku)
```
- PM이 Worker에게 직접 작업 지시 금지 — 반드시 Lead를 경유

## 승인 규칙
- PM 승인: 파일 구조, 라이브러리, DB 스키마, API, 보안, 환경변수
- 자율: 변수명, 리팩토링, 코멘트, 로그, 포맷팅

## 에이전트 호출 시 필수 포함
```
[역할] 너는 {FE/BE/QA/Lead} 에이전트다.
[필수] .claude/skills/{해당}/SKILL.md를 Read하라.
[범위] 소유 파일: {목록}. 범위 밖 수정 금지.
[목표] {작업 내용}
[완료 기준] {조건}
[보고] 변경 파일 목록 + 요약 + SKILL.md 갱신.
```

## 세션 시작 프로토콜
1. `memory/MEMORY.md` + `CLAUDE.md` 읽기
2. `memory/work-status.md` 읽기 (현재 작업 상황)
3. `.claude/skills/*/SKILL.md` 읽기 → 에이전트 상태 파악
4. `git log --oneline -10` → 최근 변경 확인

## 작업 시작 전 필수 (세션 유실 대비)
1. `memory/work-status.md` **먼저** 갱신:
   - 작업 목표, PDCA 현재 단계, 에이전트 분담 계획, 변경 예정 파일
2. 해당 에이전트 SKILL.md 상태를 `진행중`으로 Edit
3. 그 다음 실제 작업 시작

## 작업 중 체크포인트 (세션 유실 대비)
- PDCA 단계 전환마다 `work-status.md` 갱신 (Plan→Design→Do→Check)
- 에이전트 결과 수신마다 `work-status.md`에 진행률 기록
- 세션이 터져도 어디까지 했는지 즉시 파악 가능하게

## 품질 게이트 (절대 규칙)
- 작업 완료 후 QA 검증 → **완성도 98% 미만이면 처음부터 재작업**
- "대충 맞춤" 금지 — 98%+ 달성할 때까지 반복

## 작업 완료 시 필수
1. QA 검증 → 완성도 98%+ 확인 (미달 시 재작업)
2. `memory/work-status.md` 갱신 (완료 내역, 다음 예정)
3. 해당 에이전트 SKILL.md 갱신 (작업 이력, 상태 → 대기중)
4. 필요 시 MEMORY.md 갱신

---

## 현재 상태
- **상태**: 대기중
- **마지막 갱신**: 2026-03-13
