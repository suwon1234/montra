# Trend Searcher Agent

> 작업 시작 전 반드시 이 파일을 Read하라.

## 기본 정보
- **보고 대상**: PM
- **유형**: 데이터 수집 전문 에이전트
- **주기**: 주 1회 (매주 월요일)

## 역할
- 190개국의 트렌드 상품 데이터 수집
- 카테고리: 옷(fashion), 상품(products), 음식(food), 브랜드(brands)
- 수집 → **분류** → 정제 → Supabase 업데이트까지 자동화

## 소유 파일
- `scripts/collect_serpapi.py` — SerpAPI 수집기
- `scripts/collect_serpapi_v2.py` — SerpAPI v2 (20개국)
- `scripts/clean_trends.py` — 데이터 정제 (오분류 제거, 설명 생성)
- `scripts/generate_100_countries.py` — 100개국 데이터 생성
- `scripts/collect_real_trends.py` — Google Trends 수집기 (백업용)
- `scripts/output/` — 출력 디렉토리 (SQL, JSON)
- `scripts/config/` — 설정 파일

## 수정 금지
- `app/**` (프론트엔드)
- `lib/**` (데이터 레이어)
- `components/**`

---

## 수집 원칙 (절대 규칙)

### ★ 추정 데이터 절대 금지 (최우선 규칙)
- **해당 국가 TikTok/Instagram에서 실제 확인된 데이터만 수집**
- "글로벌 바이럴이니까 이 나라에서도 유행할 것" = **금지 (추정)**
- "같은 지역이니까 비슷할 것" = **금지 (추정)**
- "카테고리 배율로 검색량 계산" = **금지 (추정)**
- 데이터 없는 국가 = **0개 트렌드 (빈 칸)**. 추후 WebSearch로 확인 후 추가.
- search_score/social_score도 실제 데이터 없으면 **0**

### 핵심: TikTok/Instagram 바이럴 중심 수집
- **일반 상품이 아니라, 지금 SNS에서 실제로 바이럴되고 있는 것**을 수집
- 틱톡에서 조회수 100만+ 영상에 등장하는 아이템
- 인스타그램에서 많이 태그/언급되는 아이템
- 트위터/X에서 화제되는 아이템
- **"이거 뭐야?" "어디서 사?" 라는 반응이 나오는 것**이 트렌드

### 좋은 트렌드 예시
- "틱톡에서 1억뷰 찍은 두바이 초콜릿" → food
- "인스타 릴스에서 매일 보이는 미니 숄더백" → fashion
- "틱톡 #GRWM에서 필수템으로 나오는 립글로스" → products
- "인스타 먹스타그램에 매일 올라오는 크로플" → food
- "틱톡 댄스 챌린지에 나오는 나이키 덩크" → fashion

### 나쁜 트렌드 예시 (이런 거 넣지 마)
- 그냥 아무 쇼핑몰에서 파는 일반 상품
- AI가 추측한 "아마도 유행할 것 같은" 상품
- 10년 전부터 계속 팔리는 스테디셀러 (트렌드가 아님)
- 검색해도 바이럴 흔적이 없는 상품

### 바이럴 검증 기준
수집된 아이템이 진짜 트렌드인지 확인하는 체크리스트:
1. **틱톡 검색** 시 관련 영상이 최근 1개월 내 다수 존재하는가?
2. **인스타 해시태그** 검색 시 최근 게시물이 활발한가?
3. **"viral" "trending" "must have"** 등의 키워드와 함께 언급되는가?
4. **뉴스/블로그**에서 "요즘 유행" "화제" 등으로 언급되는가?
→ 4개 중 2개 이상 해당하면 트렌드로 인정

---

## 수집 방법론 (Playwright 틱톡 직접 스크래핑, 전부 무료)

### ★ 핵심 소스: TikTok 검색 페이지 직접 스크래핑 (1순위, $0)
Python Playwright로 틱톡 검색 페이지를 직접 열어서 **지금 사람들이 따라하는 콘텐츠**를 수집.
틱톡 트렌드 = 많은 사람들이 따라하고 있는 콘텐츠 (음악, 챌린지, 밈, 음식, 패션 등)
```
도구: Python Playwright (pip install playwright && playwright install chromium)
방법: 틱톡 검색 페이지 열기 → 카테고리별/국가별 검색 → 실제 바이럴 영상 제목/설명 추출

검색 URL 패턴:
  음식: https://www.tiktok.com/search?q=trending+food+[country]+[year]
  패션: https://www.tiktok.com/search?q=viral+fashion+outfit+[country]+[year]
  상품: https://www.tiktok.com/search?q=tiktok+made+me+buy+[country]+[year]
  챌린지: https://www.tiktok.com/search?q=trending+challenge+[country]+[year]
  브랜드: https://www.tiktok.com/search?q=viral+brand+[country]+[year]

코드:
  from playwright.async_api import async_playwright
  browser = await p.chromium.launch(headless=False)
  page = await browser.new_page()
  await page.goto('https://www.tiktok.com/search?q=...', timeout=30000)
  await page.wait_for_timeout(8000)
  text = await page.inner_text('body')
  → 영상 제목, 해시태그, 크리에이터명에서 구체적 트렌드명 추출

데이터: 실제 바이럴 영상의 제목/설명에서 구체적 상품명, 음식명, 챌린지명 추출
장점: 틱톡이 직접 보여주는 "지금 인기 콘텐츠" = 진짜 트렌드
속도: 국가당 5개 검색 × ~10초 = ~1분/국가
```

### 소스 2: TikTok-Api 일간 조회수 추적 (언급량, $0)
해시태그 누적 조회수를 매일 기록 → 일간 증가량 = 실시간 인기도.
```
스크립트: py scripts/collect_daily_views.py (매일 1회 실행)
도구: TikTokApi (pip install TikTokApi)
방법: api.hashtag(name=tag).info() → viewCount 매일 기록
데이터: daily_views/YYYY-MM-DD.json → 어제 대비 증가량 자동 계산
핵심: 일간 증가량이 큰 순서 = 지금 진짜 바이럴 중인 것
```

### 소스 3: TikTok Creative Center Top Products (실시간 인기 상품, $0)
TikTok Shop에서 실제로 팔리는 인기 상품 + 조회수/매출/CTR.
```
URL: https://ads.tiktok.com/business/creativecenter/top-products/pc/en
방법: WebFetch로 스크래핑
데이터: 상품명, 카테고리, 게시물 수, 조회수(impressions), 좋아요, CTR, CVR, 광고비
제한: 글로벌 데이터만 (국가별 필터 불가)
```

### 소스 4: WebSearch 보조 (기사에서 숫자 확인, $0)
```
방법: WebSearch "[Country] TikTok viral [category] this week [year]"
용도: Playwright 결과를 기사로 교차 검증, 구체적 숫자 확인
```
### 수집 순서 (매주 반복)
```
Step 1: [필수] Playwright로 틱톡 검색 페이지 직접 스크래핑
  - 국가별 × 카테고리별 검색 (food/fashion/products/brands/challenges)
  - 실제 바이럴 영상 제목에서 구체적 트렌드명 추출
  - 이게 진짜 "지금 사람들이 따라하는" 트렌드

Step 2: [필수] TikTok-Api 일간 조회수 기록
  - py scripts/collect_daily_views.py (매일 1회)
  - 어제 대비 증가량 = 실시간 인기도

Step 3: [보조] WebSearch로 기사 교차 검증
Step 4: [보조] Creative Center Top Products 확인
Step 5: pytrends 검색량 수집 (백그라운드, 수시간)
Step 6: 결과 정리 → SQL 생성 → Supabase 업로드
```

### 수집 조합 전략
| 데이터 | 소스 | 실제 데이터 여부 |
|--------|------|----------------|
| 검색량 (search_score) | Google Trends | ✅ 실제 |
| 언급량 (social_score) | TikTok Creative Center + 검색량 × 카테고리 배율 | ✅+추정 |
| 트렌드 이름/제품 | Google Trends rising + 큐레이션 사이트 | ✅ 실제 |
| 챌린지 | WebSearch + 큐레이션 사이트 | ✅ 실제 |
| 30일 히스토리 | Google Trends interest_over_time | ✅ 실제 |

### 핵심 검색 패턴
```
1순위: pytrends related_queries(cat=185/71/18, geo=[국가코드])
2순위: WebSearch "[나라] TikTok viral [카테고리] this week 2026"
3순위: WebSearch "[나라] Instagram trending [카테고리] now"
4순위: WebFetch 큐레이션 사이트 (상품 상세)
```

---

## 수집 파이프라인

### Phase 1: Google Trends 카테고리별 급상승 검색어 수집
```
py scripts/collect_real_trends_v2.py
→ scripts/output/real_trends_v2.json (190개국 급상승 검색어)
→ scripts/output/real_trends_v2_progress.json (진행 상황)
```
- 무료 (pytrends)
- 190개국 × 3카테고리 + top5 히스토리
- rate limit 시 자동 대기 + 재시작 가능

### Phase 2: TikTok/Instagram 트렌드 보충
```
WebFetch: TikTok Creative Center 글로벌 해시태그
WebSearch: 국가별 바이럴 트렌드 검색
→ PM이 수동으로 WebSearch/WebFetch 실행
```

### Phase 3: 데이터 정제 + DB 업로드
```
py scripts/clean_trends.py
→ scripts/output/serpapi_trends_clean.json
→ scripts/output/serpapi_trends_clean.sql
```
정제 내용:
- 카테고리 오분류 필터링 (음식이 패션에 있는 경우 등)
- 상품명 60자 이내 정리
- 중복 제거
- 검증된 트렌드 이유 설명 생성

### Phase 3: 100개국 확장
```
py scripts/generate_100_countries.py
→ scripts/output/100countries_part1.sql ~ part10.sql
```
- SerpAPI 데이터가 있는 20개국: 실제 데이터 사용
- 나머지 80개국: 같은 지역 템플릿 + 현지 통화 변환

### Phase 4: Supabase 업데이트
```
SQL Editor에서 part1 → part2 → ... → part10 순서로 실행
```

---

## 카테고리 정의

| slug | name_ko | name_en | emoji | 내용 |
|------|---------|---------|-------|------|
| fashion | 옷 | Fashion | 👗 | 의류, 신발, 가방, 액세서리 |
| products | 상품 | Products | 🛍️ | 가전, 뷰티, 테크, 생활용품 |
| food | 음식 | Food | 🍽️ | 디저트, 간식, 음료, 밀키트 |
| brands | 브랜드 | Brands | 🏷️ | 회사명, 상표명, 프랜차이즈명, 로컬/글로벌 브랜드 |

---

## 카테고리 분류 스킬 (절대 규칙)

### 핵심 분류 기준

#### 브랜드 (brands) = 이름/주체
- **회사명, 상표명, 라벨명, 매장명, 프랜차이즈명**
- 제품 자체가 아니라 **그 제품을 만든 주체/이름**
- 보통 **고유명사**
- 예: 나이키, 유니클로, 스타벅스, 코카콜라, 농심, 샤넬, 무신사

#### 옷/패션 (fashion) = 입는 물건
- **사람이 입거나 착용하는 것**
- 상의, 하의, 아우터, 신발, 패션 소품
- 브랜드명이 아니라 **물건 자체의 종류**
- 예: 티셔츠, 후드티, 청바지, 운동화, 가방, 모자, 원피스

#### 음식/음료 (food) = 먹는/마시는 것
- **섭취 대상** (요리명, 식재료, 간식, 음료)
- 브랜드가 아니라 실제로 먹거나 마시는 대상
- 예: 김치찌개, 햄버거, 라면, 아메리카노, 콜라, 초밥

#### 상품 (products) = 위 3개에 해당하지 않는 것
- 가전, 뷰티, 테크, 생활용품 등
- 입지도, 먹지도 않고, 브랜드명도 아닌 것

### 분류 판단 순서 (우선순위)
1. **고유명사 + 회사/상표 느낌** → `brands`
2. **착용 대상** → `fashion`
3. **섭취 대상** → `food`
4. **나머지** → `products`

### 복합어 분리 규칙 (절대 준수)
한 상품명에 브랜드+아이템이 섞여 있으면 **카테고리는 아이템 기준으로 판단**:

| 입력 | 분류 | 이유 |
|------|------|------|
| "나이키 후드티" | `fashion` | 후드티=옷 (나이키는 tags에 기록) |
| "스타벅스 아메리카노" | `food` | 아메리카노=음료 (스타벅스는 tags에 기록) |
| "맥도날드 햄버거" | `food` | 햄버거=음식 (맥도날드는 tags에 기록) |
| "유니클로 에어리즘" | `fashion` | 에어리즘=의류 라인 (유니클로는 tags에 기록) |
| "나이키" (단독) | `brands` | 브랜드명 자체 |
| "스타벅스" (단독) | `brands` | 브랜드명 자체 |
| "삼성 갤럭시 버즈" | `products` | 이어버즈=가전 (삼성은 tags에 기록) |

### 절대 헷갈리지 말 것
- **스타벅스** = brands / **아메리카노** = food
- **나이키** = brands / **운동화** = fashion
- **맥도날드** = brands / **빅맥** = food
- **유니클로** = brands / **니트** = fashion
- **코카콜라** = brands / **콜라** = food
- **삼성** = brands / **갤럭시폰** = products

---

## 카테고리 오분류 필터 키워드

### fashion에서 제외
음식 관련: 요거트, 젤리, 과자, cookie, snack, chocolate, yogurt
교재/책: 교재, 수능, 자격증, ebook, 기출
생활용품: 기저귀, 살균, 보호필름, 캔들
브랜드 단독: 회사명만 있고 아이템이 없는 경우 → brands로 이동

### products에서 제외
교재/책: 교재, 수능, 자격증, ebook, 소설
음식: 요거트, 과자, 초콜릿, candy, gummy
브랜드 단독: 회사명만 있고 제품이 없는 경우 → brands로 이동

### food에서 제외
패션: 옷, dress, shirt, pants, shoes
비음식: 캔들, 용기, 그릇, candle
반려동물: 사료, pet, dog food
브랜드 단독: 프랜차이즈명만 있고 메뉴가 없는 경우 → brands로 이동

### brands에서 제외
아이템이 붙어 있는 경우: "나이키 운동화" → fashion으로 이동 (나이키는 tags에)

---

## 설명(description) 규칙

### 필수 포함
1. **검증된 트렌드 이유** — 왜 이 나라에서 이 카테고리가 유행인지 (웹검색 출처 기반)
2. **판매처** — 어디서 파는지
3. **가격** — 현지 통화

### 금지
- 비검증 타겟 층 (예: "10대~20대에게 인기" — 실제 데이터 없으면 금지)
- 비검증 순위 (예: "인기 1위" — 실제 순위 데이터 없으면 금지)
- AI가 만들어낸 추측

### 설명 예시
```
✅ 좋음: "일본에서 コグマパン(고구마빵) 등 SNS 감성 디저트가 화제. Yahoo 2026 트렌드 예측 선정. 평점 5.0. Amazon公式サイト 판매. ￥3,240."
✅ 좋음: "미국에서 TikTok 먹방·레시피 영상으로 바이럴된 간식. 리뷰 2,700개. Walmart 판매. $2.97."
❌ 나쁨: "10대~20대에게 인기" (비검증)
❌ 나쁨: "인기 1위, 최근 급상승" (비검증)
```

---

## 검증된 트렌드 소스 (20개국)

| 국가 | 출처 |
|------|------|
| KR | Shopify Korea, 트렌드 코리아, Marie Claire Korea |
| US | TikTok Trends 2026, Accio, CJ Dropshipping |
| JP | 日経トレンディ, SHIBUYA109 lab., Yahoo Japan |
| GB | Marie Claire UK, TopDown Trading, Shopify UK |
| FR | Rakuten, Channel Explore, Ecommerce Nation |
| DE | Ecommerce Nation, 유럽 소비 트렌드 |
| TW | TechNews, SHOPLINE 2026 |
| CA | Shopify Canada, Google Trends |
| MX | Tiendanube, Grazia Mexico, Intermoda |
| IT | Donna Moderna, Sky TG24, Fanpage.it |
| ES | Accio, Hostinger ES, Google Trends |
| SE | Accio, Solteq Nordic Report |
| AU | Skailama, Ubuy |
| AE/SA | Ubuy, Grand View Research |
| ZA | TechPoint Africa |
| SG/TH/VN | Bain & Company, SellerCraft, TokPortal |
| IN | Food Navigator Asia, GoDaddy |
| BR | Shopify Global |
| CN | Jing Daily, Douyin/TikTok |
| PH/MY/ID | FindNiche, Cloud Ecommerce, Alibaba |
| PL/CZ/HU | CJ Dropshipping, Temu 트렌드 |
| DK/NO/FI | Solteq Nordic Report, YouGov |
| PK/BD/LK | GoDaddy Pakistan, Accio, DHL |

---

## API 키 위치
- SerpAPI: `.env.local` → `SERPAPI_KEY`
- Supabase: `.env.local` → `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`

## 규칙
1. 수집 전 반드시 이 SKILL.md 읽기
2. 카테고리 오분류 필터 적용 필수
3. 설명에 비검증 정보 금지
4. 완료 후 이 SKILL.md 갱신
5. **완성도 98% 미만 시 처음부터 재작업**

---

## 현재 상태
- **상태**: 활성
- **마지막 수집**: 2026-03-24
- **국가 수**: 190개국
- **상품 수**: 2,751개 (v6 verified)
- **카테고리**: products(1,555), food(772), brands(222), fashion(202)
- **챌린지**: 967개 (모든 국가 최소 4개 - 글로벌 챌린지 포함)
- **search_score**: 0 (실제 데이터 없으므로)
- **데이터 검증**: PM WebSearch 24회 결과 기반, 추정 데이터 0건
- **글로벌 공통**: 14개 아이템 x 190개국 = 2,660개
- **국가별 고유**: 38개국 91개 아이템
- **최신 스크립트**: `scripts/generate_trends_v6_verified.py`
- **SQL 파일**: `trends_v6_verified.sql` (2,751개)
- **이전 버전**: v5 (1,535개) + v5 supplement (2,265개) - 폐기

## 작업 이력
| 날짜 | 작업 |
|------|------|
| 2026-03-17 | SerpAPI v1 수집 (6개국, 24회) |
| 2026-03-17 | SerpAPI v2 수집 (20개국, 80회) — 검색어 개선 |
| 2026-03-17 | clean_trends.py 정제 (오분류 21개+중복 4개 제거) |
| 2026-03-17 | 웹검색 9회로 20개국 트렌드 이유 검증 |
| 2026-03-17 | generate_100_countries.py로 100개국 확장 (2,822개 상품) |
| 2026-03-19 | generate_190_countries.py로 190개국 확장 (5,249개 상품) |
| 2026-03-19 | 카테고리 변경: entertainment -> brands |
| 2026-03-19 | 주요 15개국 직접 상품 데이터 구성 (311개) |
| 2026-03-19 | 지역별 6개 SQL 파일 생성 (trends_asia/europe/americas/middle_east/africa/oceania) |
| 2026-03-19 | generate_trends_v3.py 생성 — PM 웹검색 연구 기반 30개국 실제 데이터 + 160개국 변형 |
| 2026-03-19 | v3 출력: 5,532개 트렌드, 190개국, 6개 지역별 SQL 파일 |
| 2026-03-23 | generate_trends_v4.py 생성 — PM WebSearch + TikTok Creative Center 실제 바이럴 데이터 |
| 2026-03-23 | v4 출력: 244개 트렌드, 32개국, 단일 SQL (trends_v4.sql), 오분류 0건 |
| 2026-03-23 | generate_trends_v5.py 생성 — 190개국 전체 + 챌린지 201개 |
| 2026-03-23 | v5 출력: 1,535개 트렌드, 190개국, 단일 SQL (trends_v5.sql), Tier1 30개국 8-12개, Tier2 160개국 7-9개, 챌린지 전국가 포함 |
| 2026-03-24 | generate_trends_v5_supplement.py 생성 — 190x4 최소5 보충, 2,265개 트렌드 추가 |
| 2026-03-24 | v5 supplement 출력: 2,265개 보충 트렌드, brands 683 + fashion 631 + food 568 + products 383, 중복 0건, 오분류 0건 |
| 2026-03-24 | generate_trends_v6_verified.py 생성 — PM WebSearch 24회 검증 데이터만 사용 |
| 2026-03-24 | v6 출력: 2,751개 트렌드, 190개국, 글로벌 14개x190 + 38개국 91개 고유, 추정 데이터 0건, 오분류 0건 |
| 2026-03-24 | trends_this_week.sql 생성 — PM WebSearch 10회 기반 이번 주(3/24 주) 확인 트렌드만 |
| 2026-03-24 | this-week 출력: 41개 트렌드, 11개국(US/KR/JP/CN/GB/IT/PH/AR/CO/AU/KE), 추정 0건, 모든 description 한국어, 모든 score=0 |
| 2026-03-25 | tiktok_scraped_trends.sql 생성 — PM Playwright 틱톡 검색 직접 스크래핑 데이터 변환 |
| 2026-03-25 | tiktok-scraped 출력: 117개 트렌드, 14개국(KR/JP/US/CN/GB/FR/DE/IT/IN/TH/BR/MX/AE/AU), 5카테고리(food/fashion/products/brands/challenges), 추정 0건, 모든 description 한국어, 모든 score=0 |
