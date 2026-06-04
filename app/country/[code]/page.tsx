/* 국가 상세 페이지 — 보물상자 디자인 전면 교체
   서버 컴포넌트: lib/data.ts로 DB 조회 → CountryShell(client)로 렌더 위임. */
import { notFound } from 'next/navigation';
import { MONTRA_FOCUS_MARKETS, type MontraMarket } from '@/lib/focus-markets';
import { getTrends, getCountriesWithStats } from '@/lib/data';
import type { TrendWithDetails } from '@/lib/types';
import CountryShell from '@/components/country/CountryShell';
import type { CountryTrendCard } from '@/components/country/TrendCard';
import type { RaonNote } from '@/components/country/CountryHero';
import './country.css';

export const revalidate = 10;

interface PageProps {
  params: Promise<{ code: string }>;
}

// 라온이 한 마디 — 원본 country-page.jsx의 RAON_NOTES 그대로
const RAON_NOTES: Record<string, RaonNote> = {
  kr: {
    msg: 'K-출발지! 모든 트렌드가 여기서 시작돼요. 라온이 본가도 여기랍니다 🦊',
    mood: 'excited',
  },
  jp: {
    msg: '한국 음식이 일상에 스며드는 중. 김밥은 이제 동네 마트에도!',
    mood: 'happy',
  },
  us: {
    msg: '대중 시장 진입 단계. 체인 매장 확장 속도가 무서워요.',
    mood: 'surprised',
  },
  cn: {
    msg: '초대형 커머스의 힘. 1+1 프로모션이 트렌드를 만들어요.',
    mood: 'thinking',
  },
};
const DEFAULT_RAON_NOTE: RaonNote = {
  msg: '이 나라는 라온이가 매주 챙겨보고 있어요. 신호 변화 놓치지 마세요!',
  mood: 'happy',
};

const DEFAULT_KEYWORDS = ['K-POP', '한식', 'K-뷰티', '드라마', '편의점', '치킨'];

// 카테고리 슬러그(DB) → 한국어 라벨 (FilterBar 한국어 라벨과 정확히 매칭)
const CATEGORY_SLUG_TO_KO: Record<
  'fashion' | 'products' | 'food' | 'brands' | 'challenge',
  string
> = {
  fashion: '옷',
  products: '상품',
  food: '음식',
  brands: '브랜드',
  challenge: '챌린지',
};

function categorySlugToKo(slug: string): string {
  return (
    CATEGORY_SLUG_TO_KO[slug as keyof typeof CATEGORY_SLUG_TO_KO] ?? '상품'
  );
}

function isValidCategorySlug(
  slug: string
): slug is 'fashion' | 'products' | 'food' | 'brands' | 'challenge' {
  return slug in CATEGORY_SLUG_TO_KO;
}

// DB가 비어있을 때 사용할 fallback 트렌드 — 한국어 tags + categorySlug/heatStatus 부여
function generateFallbackTrends(market: MontraMarket): CountryTrendCard[] {
  const baseTopics: Array<{
    title: string;
    desc: string;
    categorySlug: 'fashion' | 'products' | 'food' | 'brands' | 'challenge';
    heatStatus: 'rising' | 'steady' | 'cooling' | 'new';
    growth: string;
  }> = [
    {
      title: market.headline,
      desc: '현지 검색·SNS·커머스 데이터에서 동시에 신호 포착. 첫 번째 인기 트렌드.',
      categorySlug: 'food',
      heatStatus: 'rising',
      growth: '+34%',
    },
    {
      title: '한국식 매운맛 라인',
      desc: '현지 PB 브랜드가 한국 매운맛을 모티브로 신제품 출시. 편의점 점유율 상승 중.',
      categorySlug: 'food',
      heatStatus: 'rising',
      growth: '+28%',
    },
    {
      title: 'K-뷰티 미니멀 스킨케어',
      desc: '성분 단순화·가격 합리화 라인이 현지 드럭스토어 진입. 후기 폭발.',
      categorySlug: 'products',
      heatStatus: 'rising',
      growth: '+22%',
    },
    {
      title: '한국식 디저트 카페',
      desc: '약과·인절미·흑임자 활용한 디저트 카페가 현지 인디 신에서 화제.',
      categorySlug: 'food',
      heatStatus: 'steady',
      growth: '+19%',
    },
    {
      title: 'K-패션 인디 편집숍',
      desc: '한국 신진 디자이너 브랜드가 현지 편집숍에 입점. 가격대 고가 라인 중심.',
      categorySlug: 'fashion',
      heatStatus: 'steady',
      growth: '+15%',
    },
    {
      title: '한국 캐릭터 굿즈 콜라보',
      desc: '라이언·잔망루피 등 한국 캐릭터 IP가 현지 브랜드와 콜라보. 굿즈 매진.',
      categorySlug: 'brands',
      heatStatus: 'steady',
      growth: '+12%',
    },
  ];
  return baseTopics.map((t, i) => {
    const tags: string[] = [];
    if (t.heatStatus === 'rising') tags.push('상승');
    tags.push(categorySlugToKo(t.categorySlug));
    return {
      rank: i + 1,
      title: t.title,
      desc: t.desc,
      tags,
      categorySlug: t.categorySlug,
      heatStatus: t.heatStatus,
      growth: t.growth,
      score: 95 - i * 4,
      verified: Math.max(8, Math.floor(market.verified * (0.18 - i * 0.025))),
      raon:
        i === 0
          ? '이번 주 진짜 뜨거워요!'
          : i === 1
            ? '라온이가 직접 먹어봤어요'
            : null,
    };
  });
}

// DB heat_status → growth 문자열 (DB에 별도 growth 필드 없음 → status 기반 추정)
function heatStatusToGrowth(status: string, score: number): string {
  if (status === 'rising') return `+${Math.max(15, Math.round(score * 0.4))}%`;
  if (status === 'new') return `+${Math.max(8, Math.round(score * 0.2))}%`;
  if (status === 'cooling') return `-${Math.max(3, Math.round(score * 0.1))}%`;
  return `+${Math.max(2, Math.round(score * 0.05))}%`;
}

function dbTrendToCard(t: TrendWithDetails, rank: number): CountryTrendCard {
  const slug = t.category.slug;
  const categorySlug: 'fashion' | 'products' | 'food' | 'brands' | 'challenge' =
    isValidCategorySlug(slug) ? slug : 'products';

  // tags 구성: '상승'(heat_status === 'rising') + 카테고리 한국어 라벨 + 사용자 태그 1개
  const tags: string[] = [];
  if (t.heat_status === 'rising') tags.push('상승');
  tags.push(categorySlugToKo(categorySlug));

  // 사용자 태그 중 의미 있는 것 1개 추가 (가격/심볼 제외, 중복 제외)
  const meaningfulTag = (t.tags || []).find(
    (tag) =>
      !/^[$€£¥₩฿₹]|AED|R\$|kr|R\s/.test(tag) &&
      !tag.startsWith('★') &&
      !tags.includes(tag) &&
      tag.length <= 14
  );
  if (meaningfulTag) tags.push(meaningfulTag);

  return {
    rank,
    title: t.name,
    desc:
      t.description ??
      '현지 검색·SNS·커머스 데이터에서 신호 포착. 라온이가 검수한 트렌드.',
    tags: tags.slice(0, 3),
    categorySlug,
    heatStatus: t.heat_status,
    score: t.heat_score,
    growth: heatStatusToGrowth(t.heat_status, t.heat_score),
    verified: Math.max(
      6,
      Math.round((t.social_score || t.search_score || t.heat_score) / 6)
    ),
    raon:
      rank === 1
        ? '이번 주 진짜 뜨거워요!'
        : rank === 2
          ? '라온이가 직접 골라봤어요'
          : null,
  };
}

function findMarket(code: string): MontraMarket | null {
  const lower = code.toLowerCase();
  const all = [
    ...MONTRA_FOCUS_MARKETS.weekly,
    ...MONTRA_FOCUS_MARKETS.watch,
  ];
  return all.find((m) => m.code === lower) ?? null;
}

export default async function CountryPage({ params }: PageProps) {
  const { code: rawCode } = await params;
  const code = rawCode.toLowerCase();
  const market = findMarket(code);

  if (!market) {
    notFound();
  }

  // 1) DB 조회 — 실패해도 throw 안 함 (lib/data.ts가 mock fallback 처리)
  let dbTrends: TrendWithDetails[] = [];
  try {
    dbTrends = await getTrends({
      countryCode: code.toUpperCase(),
      sortBy: 'heat_score',
      sortOrder: 'desc',
      limit: 30,
    });
  } catch (err) {
    console.error('[CountryPage] getTrends 예외:', err);
  }

  // 2) 트렌드 카드 목록 구성
  const trendCards: CountryTrendCard[] =
    dbTrends.length > 0
      ? dbTrends.map((t, i) => dbTrendToCard(t, i + 1))
      : generateFallbackTrends(market);

  // 3) DB의 country stats로 market.verified/rising 덮어쓰기 (선택적)
  let verified = market.verified;
  let rising = market.rising;
  try {
    const stats = await getCountriesWithStats();
    const found = stats.find(
      (s) => s.code.toUpperCase() === code.toUpperCase()
    );
    if (found) {
      if (typeof found.total_trends === 'number' && found.total_trends > 0) {
        verified = found.total_trends;
      }
      if (typeof found.rising_count === 'number') {
        rising = found.rising_count;
      }
    }
  } catch (err) {
    console.error('[CountryPage] getCountriesWithStats 예외:', err);
  }

  // 4) Raon note + keywords
  const note = RAON_NOTES[code] ?? DEFAULT_RAON_NOTE;
  const keywords = DEFAULT_KEYWORDS;

  // 5) 통계
  const totalTrends = trendCards.length;
  const totalRising = trendCards.filter((t) => t.heatStatus === 'rising').length;
  const avgScore =
    trendCards.length > 0
      ? Math.round(
          trendCards.reduce((sum, t) => sum + t.score, 0) / trendCards.length
        )
      : 0;

  // verified/rising은 hero 통계 카드에 사용 — DB 통계 우선, 없으면 카드 기반 fallback
  const heroVerified = verified > 0 ? verified : totalTrends;
  const heroRising = rising > 0 ? rising : totalRising;

  return (
    <div className="c-page">
      <CountryShell
        market={market}
        trends={trendCards}
        keywords={keywords}
        note={note}
        totalTrends={heroVerified}
        totalRising={heroRising}
        avgScore={avgScore}
      />
    </div>
  );
}
