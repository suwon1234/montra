export type MarketTier = 1 | 2;

export interface FocusMarket {
  code: string;
  tier: MarketTier;
  name_ko: string;
  name_en: string;
  signal: string;
  lane: string;
}

export const FOCUS_MARKETS: FocusMarket[] = [
  { code: 'KR', tier: 1, name_ko: '한국', name_en: 'South Korea', signal: '수출 기준점', lane: 'K-출발지' },
  { code: 'JP', tier: 1, name_ko: '일본', name_en: 'Japan', signal: '취향 소비', lane: '취향' },
  { code: 'US', tier: 1, name_ko: '미국', name_en: 'United States', signal: '대중 확산', lane: '대중 시장' },
  { code: 'CN', tier: 1, name_ko: '중국', name_en: 'China', signal: '초대형 커머스', lane: '커머스' },
  { code: 'GB', tier: 1, name_ko: '영국', name_en: 'United Kingdom', signal: '컬처 반응', lane: '컬처' },
  { code: 'BR', tier: 1, name_ko: '브라질', name_en: 'Brazil', signal: '남미 바이럴', lane: '바이럴' },
  { code: 'MX', tier: 1, name_ko: '멕시코', name_en: 'Mexico', signal: '라틴 진입', lane: '라틴' },
  { code: 'ID', tier: 1, name_ko: '인도네시아', name_en: 'Indonesia', signal: '소셜 커머스', lane: '소셜' },
  { code: 'TH', tier: 1, name_ko: '태국', name_en: 'Thailand', signal: '푸드/뷰티', lane: '라이프스타일' },
  { code: 'VN', tier: 1, name_ko: '베트남', name_en: 'Vietnam', signal: '성장 소비', lane: '성장' },
  { code: 'PH', tier: 1, name_ko: '필리핀', name_en: 'Philippines', signal: '숏폼 확산', lane: '숏폼' },
  { code: 'SG', tier: 1, name_ko: '싱가포르', name_en: 'Singapore', signal: '프리미엄 허브', lane: '허브' },
  { code: 'TW', tier: 1, name_ko: '대만', name_en: 'Taiwan', signal: 'K-제품 반응', lane: 'K-적합' },
  { code: 'HK', tier: 1, name_ko: '홍콩', name_en: 'Hong Kong', signal: '중화권 테스트', lane: '관문' },
  { code: 'FR', tier: 2, name_ko: '프랑스', name_en: 'France', signal: '럭셔리/뷰티', lane: '럭셔리' },
  { code: 'DE', tier: 2, name_ko: '독일', name_en: 'Germany', signal: '실용 소비', lane: '실용' },
  { code: 'IT', tier: 2, name_ko: '이탈리아', name_en: 'Italy', signal: '디자인/푸드', lane: '디자인' },
  { code: 'ES', tier: 2, name_ko: '스페인', name_en: 'Spain', signal: '라이프스타일', lane: '라이프스타일' },
  { code: 'CA', tier: 2, name_ko: '캐나다', name_en: 'Canada', signal: '북미 보조 신호', lane: '북미 보조' },
  { code: 'AU', tier: 2, name_ko: '호주', name_en: 'Australia', signal: '시즌 반전', lane: '시즌' },
  { code: 'IN', tier: 2, name_ko: '인도', name_en: 'India', signal: '대형 성장 시장', lane: '대중 시장' },
  { code: 'MY', tier: 2, name_ko: '말레이시아', name_en: 'Malaysia', signal: '할랄/뷰티', lane: '동남아' },
  { code: 'AE', tier: 2, name_ko: '아랍에미리트', name_en: 'United Arab Emirates', signal: '럭셔리 소비', lane: '걸프' },
  { code: 'SA', tier: 2, name_ko: '사우디아라비아', name_en: 'Saudi Arabia', signal: '프리미엄 성장', lane: '걸프' },
  { code: 'TR', tier: 2, name_ko: '튀르키예', name_en: 'Turkey', signal: '유라시아 관문', lane: '다리' },
];

export const FOCUS_MARKET_CODES = FOCUS_MARKETS.map((market) => market.code);
export const FOCUS_MARKET_CODE_SET = new Set(FOCUS_MARKET_CODES);
export const marketOrder = new Map(FOCUS_MARKETS.map((market, index) => [market.code, index]));

export function getFocusMarket(code: string) {
  return FOCUS_MARKETS.find((market) => market.code === code.toUpperCase());
}

// ─── MONTRA 메인페이지 (Maxima 디자인) 데이터 ───────────────────────────
// 25개국 — 매주 보는 14곳 + 신호가 뜰 때 11곳
// 영어 등급 표현 절대 금지, 자연스러운 한국어 분류
export interface MontraMarket {
  code: string;
  name_ko: string;
  name_en: string;
  signal: string;
  lane: string;
  verified: number;
  investigated?: number;
  rising: number;
  headline: string;
}

export const MONTRA_FOCUS_MARKETS: { weekly: MontraMarket[]; watch: MontraMarket[] } = {
  weekly: [
    { code: 'kr', name_ko: '한국', name_en: 'South Korea', signal: '출발지', lane: 'K-출발지', verified: 142, rising: 12, headline: '마라샹궈 인스턴트 라인업' },
    { code: 'jp', name_ko: '일본', name_en: 'Japan', signal: '취향 소비', lane: '취향', verified: 98, rising: 8, headline: '한국식 김밥 도시락 점유' },
    { code: 'us', name_ko: '미국', name_en: 'United States', signal: '대중 확산', lane: '대중 시장', verified: 87, rising: 14, headline: '한국 떡볶이 컵누들' },
    { code: 'cn', name_ko: '중국', name_en: 'China', signal: '초대형 커머스', lane: '커머스', verified: 76, rising: 9, headline: '콜드브루 농축액 1+1' },
    { code: 'gb', name_ko: '영국', name_en: 'United Kingdom', signal: '취향 소비', lane: '취향', verified: 41, rising: 5, headline: '한식 양념 핫소스' },
    { code: 'br', name_ko: '브라질', name_en: 'Brazil', signal: '대중 확산', lane: '대중 시장', verified: 38, rising: 7, headline: 'K-뷰티 마스크팩 묶음' },
    { code: 'mx', name_ko: '멕시코', name_en: 'Mexico', signal: '대중 확산', lane: '대중 시장', verified: 33, rising: 6, headline: '한국 라면 매운맛 챌린지' },
    { code: 'id', name_ko: '인도네시아', name_en: 'Indonesia', signal: '대중 확산', lane: '대중 시장', verified: 52, rising: 11, headline: '할랄 한식 간편식' },
    { code: 'th', name_ko: '태국', name_en: 'Thailand', signal: '취향 소비', lane: '취향', verified: 47, rising: 8, headline: '한국식 카페 디저트 메뉴' },
    { code: 'vn', name_ko: '베트남', name_en: 'Vietnam', signal: '대중 확산', lane: '대중 시장', verified: 49, rising: 10, headline: '한국 치킨 브랜드 매장' },
    { code: 'ph', name_ko: '필리핀', name_en: 'Philippines', signal: '대중 확산', lane: '대중 시장', verified: 36, rising: 6, headline: '한국 편의점 도시락 라인' },
    { code: 'sg', name_ko: '싱가포르', name_en: 'Singapore', signal: '취향 소비', lane: '허브', verified: 28, rising: 4, headline: '한국식 모던 다이닝' },
    { code: 'tw', name_ko: '대만', name_en: 'Taiwan', signal: '취향 소비', lane: '취향', verified: 31, rising: 5, headline: '한국 캐릭터 굿즈 콜라보' },
    { code: 'hk', name_ko: '홍콩', name_en: 'Hong Kong', signal: '취향 소비', lane: '허브', verified: 17, rising: 3, headline: '한국식 베이커리 페이스트리' },
  ],
  watch: [
    { code: 'fr', name_ko: '프랑스', name_en: 'France', signal: '취향 소비', lane: '취향', verified: 14, rising: 2, headline: '한국 자연주의 스킨케어' },
    { code: 'de', name_ko: '독일', name_en: 'Germany', signal: '취향 소비', lane: '취향', verified: 12, rising: 1, headline: '한식 비건 라인' },
    { code: 'it', name_ko: '이탈리아', name_en: 'Italy', signal: '취향 소비', lane: '취향', verified: 8, rising: 0, headline: '한국 인디 패션 편집숍' },
    { code: 'es', name_ko: '스페인', name_en: 'Spain', signal: '대중 확산', lane: '대중 시장', verified: 9, rising: 1, headline: '한국식 핫도그 푸드트럭' },
    { code: 'ca', name_ko: '캐나다', name_en: 'Canada', signal: '취향 소비', lane: '취향', verified: 11, rising: 2, headline: '한국 베이커리 체인' },
    { code: 'au', name_ko: '호주', name_en: 'Australia', signal: '취향 소비', lane: '취향', verified: 13, rising: 2, headline: '한국식 BBQ 다이닝' },
    { code: 'in', name_ko: '인도', name_en: 'India', signal: '대중 확산', lane: '대중 시장', verified: 16, rising: 4, headline: '한국 라면 채식 라인' },
    { code: 'my', name_ko: '말레이시아', name_en: 'Malaysia', signal: '대중 확산', lane: '대중 시장', verified: 19, rising: 3, headline: '할랄 한식 도시락' },
    { code: 'ae', name_ko: 'UAE', name_en: 'U.A.E.', signal: '취향 소비', lane: '허브', verified: 7, rising: 1, headline: '두바이 한식 파인다이닝' },
    { code: 'sa', name_ko: '사우디', name_en: 'Saudi Arabia', signal: '대중 확산', lane: '대중 시장', verified: 6, rising: 1, headline: '한국 컵라면 진출 라인' },
    { code: 'tr', name_ko: '튀르키예', name_en: 'Türkiye', signal: '취향 소비', lane: '취향', verified: 9, rising: 2, headline: '한국 스킨케어 인플루언서' },
  ],
};

// 합계: 14 + 11 = 25개국. 검증 트렌드 카피 숫자는 775로 고정.
export const MONTRA_STATS = {
  weeklyCount: 14,
  watchCount: 11,
  verified: 775,
};
