# MONTRA 프로젝트 규칙

## 기술 스택
Next.js (App Router), TypeScript (strict), Tailwind CSS v4, shadcn/ui, Prisma, PostgreSQL, GSAP (ScrollTrigger, @gsap/react), Lenis, Playwright, Zod

## 핵심 원칙
1. 단순함 우선 — 가장 단순한 방법으로 해결
2. 점진적 진행 — 기능 단위로 구현 -> 검증 -> 커밋 반복
3. 컨텍스트 보존 — 모든 상태는 파일에 기록 (대화에만 보고 금지)
4. UI 참조: uiverse.io (컴포넌트), awwwards.com (디자인 트렌드)

## 에이전트 디스패치 (5-에이전트 패턴)
```
PM (오케스트레이터)
+-- [FE] Frontend  -> page.tsx, 컴포넌트, 스타일링
+-- [BE] Backend   -> route.ts, API, Prisma, 미들웨어
+-- [TS] Trend Searcher -> 트렌드 수집, SerpAPI, 데이터 정제 (주 1회)
+-- [QA] QA        -> 코드 분석, Playwright, 버그 검출
+-- [Lead] Lead    -> 코드 리뷰, 결과 취합 (수정 금지, 리뷰만)
```

### 파일 소유권 (충돌 방지)
| 에이전트 | 소유 범위 | 수정 금지 |
|---------|----------|----------|
| PM | `CLAUDE.md`, `MEMORY.md`, `memory/*.md`, `work-status.md` | **앱 소스코드 전체 (Read만 가능, Edit/Write 금지)** |
| FE | `app/**/page.tsx`, `components/**` | `app/api/**`, `lib/**` |
| BE | `app/api/**`, `lib/**`, `supabase/**` | `app/**/page.tsx`, `components/**` |
| TS | `scripts/**`, `.claude/skills/trend-searcher/**` | 앱 소스코드 전체 (수집 스크립트만) |
| QA | `e2e/**`, `docs/QA_REPORT.md` | 앱 소스코드 (읽기만) |

### PM 직접 수정 금지 (절대 규칙)
- **PM은 오케스트레이터다. 코드를 직접 수정하지 않는다.**
- 1줄 수정이라도 반드시 해당 에이전트(FE/BE)에게 디스패치
- "간단하니까 직접 하자"는 합리화 금지 — 예외 없음
- 컨텍스트 압축 후에도 이 규칙을 반드시 먼저 확인
- 파일 Edit/Write 전 자기 점검: **"이 파일의 소유자는 누구인가?"**

### 실행 순서
Phase 1 (병렬): FE + BE -> Phase 2 (직렬): QA -> Phase 3: Lead -> Phase 4: PM 취합

### 디스패치 시 필수 포함
```
[역할] 너는 {FE/BE/QA/Lead} 에이전트다.
[필수] .claude/skills/{해당}/SKILL.md를 Read하라.
[범위] 소유 파일: {목록}. 범위 밖 수정 금지.
[목표] {작업 내용}
[완료 기준] {조건}
[보고] 변경 파일 목록 + 요약 출력 + SKILL.md 갱신.
```

## PDCA 워크플로우 (절대 규칙)
- **모든 작업은 반드시 PDCA로 수행** — 예외 없음
```
Plan   → PM이 Plan 작성 → 사용자 승인 (승인 없이 진행 금지!)
Design → Lead 아키텍처 설계
Do     → 팀원 병렬 구현 (한 번에 하나의 기능만)
Check  → Code Reviewer → QA (완성도 98%+ 필수)
Act    → 리드 분석 → PM 보고 → 승인/반려
```

## 품질 게이트 (절대 규칙)
- **완성도 98% 미만 시 처음부터 재작업** — "대충 맞춤" 금지
- 98%+ 달성할 때까지 반복, 기존 결과 폐기하고 다시 수행

## 컨텍스트 초과 방지
- 에이전트 결과: FE/BE -> SKILL.md, QA -> QA_REPORT.md, Lead -> code-reviewer/SKILL.md
- PM 체크포인트: 작업시작/Phase완료/커밋 후 MEMORY.md 갱신
- 한 세션 최대 1개 기능 — 대규모 작업은 세션 분할
- 새 세션 복구: MEMORY.md -> CLAUDE.md -> SKILL.md -> git log 순서로 읽기

## 승인 규칙
- PM 승인 필요: 파일 구조, 라이브러리, DB 스키마, API, 보안, 환경변수 변경
- 자율: 변수명, 리팩토링, 코멘트, 로그, 포맷팅

## MCP 서버 (PM만 직접 접근, Task 에이전트는 PM 경유)
- context7: 최신 문서 참조 / prisma: DB 스키마 / playwright: E2E / sequential-thinking: 분석

## 참조 문서 (필요 시 Read)
- 배포: `docs/DEPLOY_GUIDE.md`
- QA/TC 규칙: `docs/QA_RULES.md`
- 에이전트 팀 상세: `docs/AGENT_TEAM.md`
- 에이전트 스킬: `.claude/skills/*/SKILL.md`
