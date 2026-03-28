# MONTRA 프로젝트 메모리

## 프로젝트 현황
- Supabase 연동 완료
- 190개국 5,532개 트렌드 데이터 수집 완료 (v3, 2026-03-19)
- 카테고리 4개: 옷(fashion), 상품(products), 음식(food), 브랜드(brands)
- SKILL.md 기반 TikTok/Instagram 바이럴 트렌드 중심 수집
- types.ts/mock-data.ts DB 카테고리 일치 완료

## 사용자 규칙
- 한국어로 소통
- **지시사항 즉시 메모리 저장** — 세션 만료 시 컨텍스트 소실 방지
- **"메모리 읽어" 지시 시 MEMORY.md + CLAUDE.md 둘 다 반드시 읽기**
- **에이전트 분담 현황 반드시 표시** — 위임 시 트리 형태로 PM→에이전트 구조 표시
- **MCP 무조건 사용** — Supabase/DuckDuckGo/Playwright MCP 활용
- **작업 상황 자동 저장** — 작업 시작/완료 시 `memory/work-status.md` 갱신
- **완성도 98% 미만 시 재작업** — "대충 맞춤" 금지
- **PDCA 필수** — 모든 작업은 반드시 PDCA로 수행
- **트렌드 설명에 비검증 정보 금지** — 타겟층, 순위 등 실제 데이터 없으면 넣지 말 것
- **트렌드 검색 패턴**: `[나라명] + viral + [카테고리] + this week + TikTok`

## 에이전트 스킬 구조 (13개)
```
.claude/skills/
├── pm/SKILL.md              — PM 오케스트레이터
├── trend-searcher/SKILL.md  — ★ 트렌드 수집 에이전트 (주 1회)
├── frontend-lead/SKILL.md   — FE Lead
├── frontend-1-ui/SKILL.md   — FE #1 UI
├── frontend-2-data/SKILL.md — FE #2 데이터시각화
├── frontend-3-realtime/SKILL.md — FE #3 고급기능
├── backend-lead/SKILL.md    — BE Lead
├── backend-1-api/SKILL.md   — BE #1 API
├── backend-2-ai/SKILL.md    — BE #2 AI통합
├── backend-3-realtime/SKILL.md — BE #3 실시간
├── code-reviewer/SKILL.md   — 코드 리뷰어
├── qa-strategist/SKILL.md   — QA 전략
└── tc-sheet-agent/SKILL.md  — TC 시트
```

## MCP 연결 상태
| MCP | 상태 | 용도 |
|-----|------|------|
| Supabase | ✅ 연결됨 | DB 직접 접근 |
| DuckDuckGo | ✅ 연결됨 | 무료 웹검색 |
| Playwright | ✅ 연결됨 | 웹 스크래핑 |

## 데이터 인프라
- **DB**: Supabase PostgreSQL
- **수집 도구**: SerpAPI (Google Shopping) + WebSearch + DuckDuckGo MCP
- **데이터**: 190개국, 4카테고리, 5,532개 트렌드 (v3)
- **SerpAPI**: 무료 100회/월 (2026-03 사용: 80회)
- **수집 스크립트**: `scripts/generate_trends_v3.py` (최신), `scripts/upload_trends.mjs`
- **SQL 파일**: `scripts/output/trends_v3_part{1..6}.sql` (지역별 6파일)

## 다음 세션 할 일
1. ~~Supabase MCP 브라우저 인증~~ ✅ 완료
2. ~~트렌드 데이터 재수집 (v3, 5,532개)~~ ✅ 완료
3. **BE/FE TypeScript 에러 수정** — route.ts, country-templates.ts, page.tsx
4. **브라우저에서 전체 동작 확인** — npm run dev
5. 주간 자동 수집 설정 (GitHub Actions)

## 참조 파일
- 프로젝트 규칙: `CLAUDE.md`
- 에이전트 스킬: `.claude/skills/*/SKILL.md`
- 작업 상황: `memory/work-status.md`
- 트렌드 검색 방법론: `memory/feedback_search_method.md`
- 트렌드 검증 출처: `.claude/skills/trend-searcher/SKILL.md` 하단
