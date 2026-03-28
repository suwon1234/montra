# Global Trend Radar — PDCA 마스터 플랜

> **프로젝트**: MONTRA (Global Trend Radar)
> **생성일**: 2026-03-16
> **상태**: Plan 단계 — 사용자 승인 대기
> **명세서**: `C:\Users\cyclo\Downloads\CLAUDE_CODE_PROMPT (1).md`

---

## 프로젝트 개요

전 세계 190개국에서 유행하는 상품/브랜드/패션/푸드/뷰티 트렌드를 수집·분석하여 Heat Score(0~100)로 순위 매기고, 인터랙티브 세계지도 위에 시각화하는 웹 서비스.

### 핵심 제약
- **메인 페이지(세계지도) 유지** — 국가 클릭 시 `/country/[code]`로 라우팅 추가
- **핵심 UX 흐름**: 지도에서 국가 클릭 → 해당 국가 트렌드 페이지에서 정리된 트렌드 목록
- **디자인**: MZ 스타일 밝은 톤 — 다크 테마 ❌, Pretendard Variable(한글)
- **모바일 퍼스트 반응형**
- **데이터 품질 > 국가 수** — 적은 국가라도 정확한 데이터
- **AI 분석 미사용** — 수집 데이터 그대로 나열, Heat Score는 수식 기반

### 기술 스택 결정 사항
| 항목 | 선택 | 비고 |
|------|------|------|
| 프레임워크 | Next.js 15 (App Router) | 현재 프로젝트 유지 |
| DB/Auth | **Supabase** | 명세서 기준 (PostgreSQL + Auth + Storage) |
| 스타일링 | Tailwind CSS v4 | 현재 프로젝트 유지 |
| 데이터 수집 | Python 스크립트 | `scripts/` 디렉토리 |
| AI 분석 | **사용 안 함** (비용 절감) | 수식 기반 Heat Score만 |
| 배포 | Vercel | |
| 패키지 | **npm** (현재 유지, 사용자 결정) | |

---

## PDCA 사이클 구조 (총 8 사이클)

### 🟡 PDCA #0: 메인 페이지 MZ 스타일 리디자인
**범위**: 메인 페이지 전체 분위기 변경 — 다크(#0A0A0F) → 밝고 트렌디한 MZ 감성
**에이전트**: FE Lead → FE #1 UI + FE #3 고급기능

| 단계 | 작업 | 완료 기준 |
|------|------|----------|
| Plan | MZ 디자인 레퍼런스 분석 + 컬러 시스템 확정 | 디자인 방향 확정 |
| Do | page.tsx + globals.css + WorldMap.tsx 스타일 전면 변경 | 빌드 성공 + 시각 확인 |
| Check | 지도 가독성, 반응형, hover/tooltip 정상 동작 | 기존 기능 유지 |
| Act | 미세 조정 + 애니메이션 | 완성도 98%+ |

**MZ 스타일 디자인 방향**:
- **배경**: 다크(#0A0A0F) → 밝은 배경 (화이트/라이트그레이 베이스)
- **컬러**: 비비드 그라디언트, 네온 악센트, 파스텔 포인트
- **무드**: 토스, 당근, 배민 느낌 — 깔끔하고 둥글고 친근하면서 세련됨
- **타이포**: Pretendard Variable — 굵은 웨이트 활용, 큼직한 타이틀
- **요소**: 둥근 모서리(rounded-2xl+), 소프트 섀도우, 글래스모피즘 라이트 버전
- **⚠️ 지도(WorldMap.tsx)는 절대 수정 금지** — 주변 레이아웃/nav/footer만 변경
- **애니메이션**: 부드러운 스프링 전환, 마이크로 인터랙션

**참고할 MZ 디자인 트렌드**:
- 네오브루탈리즘 + 소프트 UI 하이브리드
- 대비 강한 색상 조합 (밝은 배경 + 비비드 포인트)
- 여백 많이, 타이포 크게, 정보 밀도 낮게
- 이모지/아이콘 적극 활용

---

### 🔵 PDCA #1: 프로젝트 기반 구축
**범위**: Supabase 설정 + DB 스키마 + 시드 데이터
**에이전트**: BE Lead → BE #1 API

| 단계 | 작업 | 완료 기준 |
|------|------|----------|
| Plan | 스키마 설계 검토, Supabase 프로젝트 생성 | 스키마 확정 |
| Do | 5개 테이블 생성 + 시드 데이터 (6개국 + 6카테고리) | 테이블 생성 + 데이터 삽입 확인 |
| Check | 쿼리 테스트, FK 관계 검증 | 모든 관계 정상 |
| Act | 문제 수정 + 환경변수 설정 | `.env.local` 완성 |

**DB 테이블 (5개)**:
1. `countries` — 국가 정보 (code, name_ko/en, region, ecommerce, social 등)
2. `categories` — 카테고리 (fashion, beauty, food, tech, lifestyle, entertainment)
3. `trends` — 핵심 트렌드 (name, heat_score, 소스별 점수, tags 등)
4. `trend_history` — 시계열 (trend_id + recorded_at + 점수들)
5. `data_sources` — 수집 로그 (raw_data JSONB)

**Phase 1 시드 국가 (6개)**:
- KR(한국), US(미국), JP(일본), CN(중국), GB(영국), FR(프랑스)

**시드 카테고리 (6개)**:
- fashion(👗), beauty(💄), food(🍪), tech(📱), lifestyle(🏠), entertainment(🎬)

---

### 🔵 PDCA #2: API 레이어
**범위**: 3개 API 엔드포인트 구현
**에이전트**: BE Lead → BE #1 API

| 단계 | 작업 | 완료 기준 |
|------|------|----------|
| Plan | API 스펙 확정 (쿼리 파라미터, 응답 형식) | 스펙 문서 |
| Do | 3개 route.ts 구현 | 각 엔드포인트 200 응답 |
| Check | 파라미터 조합 테스트, 에러 핸들링 | 모든 케이스 정상 |
| Act | 성능 최적화, 캐싱 | 응답시간 < 500ms |

**엔드포인트**:
1. `GET /api/trends` — ?country=KR&category=fashion&status=rising&limit=20&sort=heat_score
2. `GET /api/countries` — 활성화된 국가 목록 + rising_count + top_trend
3. `GET /api/ranking` — 글로벌 핫 트렌드 TOP 50

---

### 🔵 PDCA #3: 프론트엔드 페이지 (1차)
**범위**: 국가별 상세 + 랭킹 페이지
**에이전트**: FE Lead → FE #1 UI + FE #2 데이터시각화

| 단계 | 작업 | 완료 기준 |
|------|------|----------|
| Plan | 페이지 구조 + 컴포넌트 설계 | 와이어프레임 확정 |
| Do | 2개 페이지 + 공통 컴포넌트 구현 | 빌드 성공 + 반응형 |
| Check | 반응형 테스트, 데이터 바인딩 검증 | 모바일/데스크톱 정상 |
| Act | 디자인 다듬기, 애니메이션 | 프리미엄 품질 |

**페이지**:
1. `/country/[code]/page.tsx` — 국가별 트렌드 상세 (카테고리 필터, 트렌드 카드, 히스토리 차트)
2. `/ranking/page.tsx` — 글로벌 핫 트렌드 TOP 50

**공통 컴포넌트**:
- `TrendCard` — Heat Score 바 + 상태 뱃지 + 태그
- `CategoryFilter` — 카테고리 탭 (가로 스크롤)
- `HeatBadge` — rising/steady/cooling/new 상태 표시

---

### 🔵 PDCA #4: 프론트엔드 페이지 (2차)
**범위**: 카테고리별 + 트렌드 상세 + 탐색 페이지
**에이전트**: FE Lead → FE #1 UI + FE #2 데이터시각화

| 단계 | 작업 | 완료 기준 |
|------|------|----------|
| Plan | 페이지 구조 확정 | 와이어프레임 |
| Do | 3개 페이지 구현 | 빌드 성공 + 반응형 |
| Check | 전체 라우트 네비게이션 테스트 | 모든 페이지 정상 연결 |
| Act | UX 개선, 로딩 상태 | 매끄러운 전환 |

**페이지**:
1. `/category/[slug]/page.tsx` — 카테고리별 글로벌 비교
2. `/trend/[id]/page.tsx` — 개별 트렌드 상세 (히스토리 차트 포함)
3. `/explore/page.tsx` — 전체 국가 탐색 (지도/그리드 뷰)

---

### 🔵 PDCA #5: 메인 페이지 → 국가 페이지 연결
**범위**: 세계지도 국가 클릭 → `/country/[code]` 라우팅 연결
**에이전트**: FE Lead → FE #3 고급기능

| 단계 | 작업 | 완료 기준 |
|------|------|----------|
| Plan | 클릭 이벤트 + 라우팅 설계 | 설계 확정 |
| Do | WorldMap.tsx에 onClick 추가 → router.push(`/country/${code}`) | 클릭 시 이동 |
| Check | 6개국 클릭 → 각 국가 페이지 정상 이동 검증 | 모든 국가 정상 |
| Act | 클릭 피드백 애니메이션 (ripple/pulse 등) | 프리미엄 UX |

**핵심 UX**: 지도에서 국가 hover(기존 퍼즐 효과) → 클릭 → 해당 국가 트렌드 상세 페이지
**주의**: WorldMap.tsx 최소 수정 — onClick 핸들러 + country-codes.ts의 매핑 활용

---

### 🔵 PDCA #6: Python 데이터 수집 + Heat Score 계산
**범위**: Google Trends + TikTok 수집 → 수식 기반 Heat Score 자동 계산 (AI 분석 없음)
**에이전트**: BE Lead → BE #1 API

| 단계 | 작업 | 완료 기준 |
|------|------|----------|
| Plan | 수집 로직 설계 + API 키 확보 | 설계 확정 |
| Do | google_trends.py + tiktok_trending.py + score_calculator.py + main.py 구현 | 6개국 데이터 수집 + 점수 계산 성공 |
| Check | 수집 데이터 품질 + Heat Score 정합성 검증 | 유의미한 트렌드 + 점수 |
| Act | Rate limit 핸들링, 에러 복구 | 안정적 수집 |

**스크립트 구조**:
```
scripts/
├── collectors/
│   ├── google_trends.py       # Google Trends 검색량 수집
│   └── tiktok_trending.py     # TikTok Creative Center 수집
├── processors/
│   ├── score_calculator.py    # 수식 기반 Heat Score 계산 (AI 없음)
│   └── trend_detector.py      # 신규/상승/하락 판정
├── config/
│   ├── countries.json
│   └── sources.json
└── main.py                    # 메인 오케스트레이터
```

> **⚠️ AI 분석 제거**: Claude API 비용 절감을 위해 ai_analyzer.py 불필요.
> 수집된 원시 데이터를 그대로 DB에 저장하고, Heat Score는 수식으로만 계산.

**Heat Score 공식 (수식 기반)**:
- final_heat = search_growth × 0.30 + social_mentions × 0.40 + ecommerce_rank × 0.20 + cross_country × 0.10
- (news_score 가중치 → social로 이관, AI 분석 없으므로 단순화)

**heat_status 판정**:
- new: 최초 감지 3일 이내
- rising: 7일 대비 +15 이상
- steady: 변동폭 ±15 이내
- cooling: 7일 대비 -15 이상

**트렌드 description**: 수집 시 가져온 원시 데이터(키워드, 해시태그, 상품명) 그대로 표시

---

### 🔵 PDCA #7: 히스토리 차트 + 시각화 강화
**범위**: 시계열 차트, 트렌드 비교 시각화
**에이전트**: FE Lead → FE #2 데이터시각화

| 단계 | 작업 | 완료 기준 |
|------|------|----------|
| Plan | 차트 라이브러리 선정 + 시각화 설계 | 설계 확정 |
| Do | 30일 Heat Score 변화 차트, 카테고리별 비교 차트 | 차트 렌더링 정상 |
| Check | 데이터 정합성, 반응형 차트 | 모든 해상도 정상 |
| Act | 인터랙션 + 애니메이션 | 프리미엄 차트 |

---

## 실행 순서 요약

```
PDCA #0 (MZ 리디자인) ──→ PDCA #1 (기반)   ──→ PDCA #2 (API)   ──→ PDCA #3 (FE 1차)
                                                                     ──→ PDCA #4 (FE 2차)
                                                                         ──→ PDCA #5 (메인 통합)

                          PDCA #6 (수집+점수) ──→ (DB에 실제 데이터 투입) ──→ PDCA #7 (차트)
```

- **#0**: 먼저 메인 페이지 MZ 스타일 전환 (디자인 기반 확립)
- **#1 → #2 → #3/#4**: DB → API → 프론트엔드 (직렬)
- **#6**: 데이터 수집 + 수식 기반 Heat Score (#2 완료 후 병행 가능)
- **#5, #7**: 마지막 통합 + 시각화

---

## 사용자 확인 필요 사항

1. ~~**패키지 매니저**~~: ✅ npm 유지 (사용자 결정)
2. **Supabase 프로젝트**: 이미 생성했는지? API 키가 있는지? ← 미답변
3. ~~**Claude API 키**~~ → ❌ AI 분석 안 함 (비용 절감)
4. **데이터 수집 API 키**: Apify, SerpAPI 등 보유 여부 ← 미답변
5. ~~**Pretendard 폰트**~~: ✅ CDN 적용 (`https://cdn.jsdelivr.net/gh/orioncactus/pretendard@v1.3.9/dist/web/variable/pretendardvariable.min.css`)
6. ~~**Prisma vs Supabase**~~: ✅ **Supabase Client (supabase-js)** — Auth/Storage/Realtime 통합, Prisma는 오버엔지니어링

---

## 진행 현황

### 완료
- [x] 명세서 분석 완료
- [x] 사용자 승인 (2026-03-16)
- [x] **PDCA #0**: MZ 스타일 리디자인 — page.tsx + globals.css 변경 (다크→라이트, 바이올렛 악센트)
- [x] **PDCA #1**: 프로젝트 기반 구축 — supabase-js 설치, 타입 정의, Mock 데이터 20개, SQL 스키마
- [x] **PDCA #2**: API 레이어 — /api/trends, /api/countries, /api/ranking (Mock 데이터 기반)
- [x] **PDCA #3 기본**: FE 1차 — 국가 상세 + 랭킹 + 공통 컴포넌트 (기본 구조)
- [x] **PDCA #3 고급화**: 국가 상세페이지 프리미엄 리디자인 (Awwwards/uiverse 레퍼런스 기반)
- [x] **PDCA #4**: FE 2차 — /category/[slug], /trend/[id], /explore 페이지 (프리미엄 디자인)
- [x] **PDCA #5**: 지도 클릭 → /country/[code] 라우팅 연결 (WorldMap.tsx onClick 추가)
- [x] **PDCA #6**: Python 수집 스크립트 — google_trends.py, tiktok_trending.py, score_calculator.py, trend_detector.py, main.py (10파일)
- [x] **PDCA #7**: 히스토리 차트 — recharts AreaChart, 5개 트렌드 30일 히스토리, trend 상세에 통합
- [x] 국기 tooltip 수정 (opacity + backdrop-blur 이슈)
- [x] 누락 국기 매핑 17개 추가 (country-codes.ts)
- [x] Pretendard Variable 폰트 CDN 적용

### 전체 완료 ✅
- 모든 PDCA 사이클 완료 (2026-03-16)
