// ============================================================
// MONTRA 데이터 레이어
// Supabase 연결 시 → 실제 DB 쿼리
// Supabase 미연결 시 → mock-data fallback
// ============================================================

import { getSupabaseClient } from './supabase';
import {
  filterMockTrends,
  getMockCountriesWithStats,
  getMockTrendsWithDetails,
  getMockHistoryForTrend,
  getMockBatchHistory,
  MOCK_CATEGORIES,
  MOCK_COUNTRIES,
  MOCK_TRENDS,
} from './mock-data';
import type {
  Category,
  CategorySlug,
  Country,
  CountryWithStats,
  HeatStatus,
  Trend,
  TrendHistory,
  TrendWithDetails,
} from './types';

// ============================================================
// 트렌드 목록 (필터/정렬/페이징)
// ============================================================
export async function getTrends(options?: {
  countryCode?: string;
  categorySlug?: CategorySlug;
  heatStatus?: HeatStatus;
  search?: string;
  sortBy?: 'heat_score' | 'first_detected_at' | 'last_updated_at';
  sortOrder?: 'asc' | 'desc';
  limit?: number;
}): Promise<TrendWithDetails[]> {
  const supabase = getSupabaseClient();

  if (!supabase) {
    return filterMockTrends({
      countryCode: options?.countryCode,
      categorySlug: options?.categorySlug,
      heatStatus: options?.heatStatus,
      search: options?.search,
      sortBy: options?.sortBy,
      sortOrder: options?.sortOrder,
      limit: options?.limit,
    });
  }

  try {
    let query = supabase
      .from('trends')
      .select('*, countries(*), categories(*)');

    // 국가 코드 필터: countries 테이블의 code로 필터링
    if (options?.countryCode) {
      // Supabase에서 관계 필터: countries.code로 필터링하려면
      // 먼저 country_id를 찾아야 하므로 별도 서브쿼리 방식 대신
      // PostgREST의 inner join 필터 사용
      const { data: countryData } = await supabase
        .from('countries')
        .select('id')
        .eq('code', options.countryCode.toUpperCase())
        .single();

      if (countryData) {
        query = query.eq('country_id', countryData.id);
      } else {
        // 해당 국가 없음 → 빈 배열 반환
        return [];
      }
    }

    // 카테고리 슬러그 필터
    if (options?.categorySlug) {
      const { data: categoryData } = await supabase
        .from('categories')
        .select('id')
        .eq('slug', options.categorySlug)
        .single();

      if (categoryData) {
        query = query.eq('category_id', categoryData.id);
      } else {
        return [];
      }
    }

    // 열기 상태 필터
    if (options?.heatStatus) {
      query = query.eq('heat_status', options.heatStatus);
    }

    // 검색
    if (options?.search) {
      const searchTerm = `%${options.search}%`;
      query = query.or(
        `name.ilike.${searchTerm},description.ilike.${searchTerm}`
      );
    }

    // 정렬
    const sortBy = options?.sortBy ?? 'heat_score';
    const sortOrder = options?.sortOrder ?? 'desc';
    query = query.order(sortBy, { ascending: sortOrder === 'asc' });

    // 제한
    if (options?.limit) {
      query = query.limit(options.limit);
    }

    const { data, error } = await query;

    if (error) {
      console.error('[Supabase] getTrends 쿼리 실패, mock fallback:', error.message);
      return filterMockTrends({
        countryCode: options?.countryCode,
        categorySlug: options?.categorySlug,
        heatStatus: options?.heatStatus,
        search: options?.search,
        sortBy: options?.sortBy,
        sortOrder: options?.sortOrder,
        limit: options?.limit,
      });
    }

    return (data ?? []).map(mapSupabaseTrendToTrendWithDetails);
  } catch (err) {
    console.error('[Supabase] getTrends 예외, mock fallback:', err);
    return filterMockTrends({
      countryCode: options?.countryCode,
      categorySlug: options?.categorySlug,
      heatStatus: options?.heatStatus,
      search: options?.search,
      sortBy: options?.sortBy,
      sortOrder: options?.sortOrder,
      limit: options?.limit,
    });
  }
}

// ============================================================
// 국가 목록 (통계 포함)
// ============================================================
export async function getCountriesWithStats(): Promise<CountryWithStats[]> {
  const supabase = getSupabaseClient();

  if (!supabase) {
    return getMockCountriesWithStats();
  }

  try {
    // 활성 국가 목록 조회
    const { data: countries, error: countriesError } = await supabase
      .from('countries')
      .select('*')
      .eq('is_active', true);

    if (countriesError || !countries) {
      console.error('[Supabase] getCountriesWithStats 쿼리 실패, mock fallback:', countriesError?.message);
      return getMockCountriesWithStats();
    }

    // 모든 트렌드 조회 (국가별 통계 계산용)
    const { data: trends, error: trendsError } = await supabase
      .from('trends')
      .select('country_id, heat_status, heat_score, name');

    if (trendsError || !trends) {
      console.error('[Supabase] getCountriesWithStats 트렌드 조회 실패, mock fallback:', trendsError?.message);
      return getMockCountriesWithStats();
    }

    return countries.map((country) => {
      const countryTrends = trends.filter(
        (t) => t.country_id === country.id
      );
      const risingCount = countryTrends.filter(
        (t) => t.heat_status === 'rising'
      ).length;
      const topTrend = countryTrends.sort(
        (a, b) => b.heat_score - a.heat_score
      )[0];

      return {
        ...(country as Country),
        rising_count: risingCount,
        total_trends: countryTrends.length,
        top_trend: topTrend?.name,
      };
    });
  } catch (err) {
    console.error('[Supabase] getCountriesWithStats 예외, mock fallback:', err);
    return getMockCountriesWithStats();
  }
}

// ============================================================
// 카테고리 목록
// ============================================================
export async function getCategories(): Promise<Category[]> {
  const supabase = getSupabaseClient();

  if (!supabase) {
    return MOCK_CATEGORIES;
  }

  try {
    const { data, error } = await supabase
      .from('categories')
      .select('*')
      .order('sort_order', { ascending: true });

    if (error || !data) {
      console.error('[Supabase] getCategories 쿼리 실패, mock fallback:', error?.message);
      return MOCK_CATEGORIES;
    }

    return data as Category[];
  } catch (err) {
    console.error('[Supabase] getCategories 예외, mock fallback:', err);
    return MOCK_CATEGORIES;
  }
}

// ============================================================
// 개별 트렌드 상세
// ============================================================
export async function getTrendById(id: string): Promise<TrendWithDetails | null> {
  const supabase = getSupabaseClient();

  if (!supabase) {
    const allTrends = getMockTrendsWithDetails();
    return allTrends.find((t) => t.id === id) ?? null;
  }

  try {
    const { data, error } = await supabase
      .from('trends')
      .select('*, countries(*), categories(*)')
      .eq('id', id)
      .single();

    if (error || !data) {
      console.error('[Supabase] getTrendById 쿼리 실패, mock fallback:', error?.message);
      const allTrends = getMockTrendsWithDetails();
      return allTrends.find((t) => t.id === id) ?? null;
    }

    return mapSupabaseTrendToTrendWithDetails(data);
  } catch (err) {
    console.error('[Supabase] getTrendById 예외, mock fallback:', err);
    const allTrends = getMockTrendsWithDetails();
    return allTrends.find((t) => t.id === id) ?? null;
  }
}

// ============================================================
// 트렌드 히스토리
// ============================================================
export async function getHistoryForTrend(trendId: string): Promise<TrendHistory[]> {
  const supabase = getSupabaseClient();

  if (!supabase) {
    return getMockHistoryForTrend(trendId);
  }

  try {
    const { data, error } = await supabase
      .from('trend_history')
      .select('*')
      .eq('trend_id', trendId)
      .order('recorded_at', { ascending: true });

    if (error || !data) {
      console.error('[Supabase] getHistoryForTrend 쿼리 실패, mock fallback:', error?.message);
      return getMockHistoryForTrend(trendId);
    }

    return data as TrendHistory[];
  } catch (err) {
    console.error('[Supabase] getHistoryForTrend 예외, mock fallback:', err);
    return getMockHistoryForTrend(trendId);
  }
}

// ============================================================
// 트렌드 히스토리 배치 조회 (여러 trend_id 한 번에)
// ============================================================
export async function getBatchHistoryForTrends(
  trendIds: string[]
): Promise<Record<string, TrendHistory[]>> {
  const supabase = getSupabaseClient();

  if (!supabase) {
    return getMockBatchHistory(trendIds);
  }

  try {
    const { data, error } = await supabase
      .from('trend_history')
      .select('*')
      .in('trend_id', trendIds)
      .order('recorded_at', { ascending: true });

    if (error || !data) {
      console.error(
        '[Supabase] getBatchHistoryForTrends 쿼리 실패, mock fallback:',
        error?.message
      );
      return getMockBatchHistory(trendIds);
    }

    // trend_id별로 그룹핑
    const result: Record<string, TrendHistory[]> = {};
    for (const id of trendIds) {
      result[id] = [];
    }
    for (const row of data as TrendHistory[]) {
      if (result[row.trend_id]) {
        result[row.trend_id].push(row);
      }
    }

    return result;
  } catch (err) {
    console.error(
      '[Supabase] getBatchHistoryForTrends 예외, mock fallback:',
      err
    );
    return getMockBatchHistory(trendIds);
  }
}

// ============================================================
// 국가 정보 (코드로 조회)
// ============================================================
export async function getCountryByCode(code: string): Promise<Country | null> {
  const supabase = getSupabaseClient();

  if (!supabase) {
    return MOCK_COUNTRIES.find((c) => c.code === code.toUpperCase()) ?? null;
  }

  try {
    const { data, error } = await supabase
      .from('countries')
      .select('*')
      .eq('code', code.toUpperCase())
      .single();

    if (error || !data) {
      console.error('[Supabase] getCountryByCode 쿼리 실패, mock fallback:', error?.message);
      return MOCK_COUNTRIES.find((c) => c.code === code.toUpperCase()) ?? null;
    }

    return data as Country;
  } catch (err) {
    console.error('[Supabase] getCountryByCode 예외, mock fallback:', err);
    return MOCK_COUNTRIES.find((c) => c.code === code.toUpperCase()) ?? null;
  }
}

// ============================================================
// 글로벌 랭킹
// ============================================================
export async function getGlobalRanking(limit?: number): Promise<TrendWithDetails[]> {
  const supabase = getSupabaseClient();

  if (!supabase) {
    const allTrends = getMockTrendsWithDetails();
    allTrends.sort((a, b) => b.heat_score - a.heat_score);
    return limit ? allTrends.slice(0, limit) : allTrends;
  }

  try {
    let query = supabase
      .from('trends')
      .select('*, countries(*), categories(*)')
      .order('heat_score', { ascending: false });

    if (limit) {
      query = query.limit(limit);
    }

    const { data, error } = await query;

    if (error || !data) {
      console.error('[Supabase] getGlobalRanking 쿼리 실패, mock fallback:', error?.message);
      const allTrends = getMockTrendsWithDetails();
      allTrends.sort((a, b) => b.heat_score - a.heat_score);
      return limit ? allTrends.slice(0, limit) : allTrends;
    }

    return (data ?? []).map(mapSupabaseTrendToTrendWithDetails);
  } catch (err) {
    console.error('[Supabase] getGlobalRanking 예외, mock fallback:', err);
    const allTrends = getMockTrendsWithDetails();
    allTrends.sort((a, b) => b.heat_score - a.heat_score);
    return limit ? allTrends.slice(0, limit) : allTrends;
  }
}

// ============================================================
// 내부 헬퍼: Supabase JOIN 결과 → TrendWithDetails 변환
// ============================================================

// Supabase가 select('*, countries(*), categories(*)') 으로 반환하는 raw 타입
interface SupabaseTrendRow {
  id: string;
  country_id: string;
  category_id: string;
  name: string;
  name_local?: string;
  description?: string;
  heat_score: number;
  heat_status: HeatStatus;
  search_score: number;
  social_score: number;
  ecommerce_score: number;
  news_score: number;
  tags: string[];
  image_url?: string;
  price?: string;
  source_urls: string[];
  first_detected_at: string;
  last_updated_at: string;
  peak_date?: string;
  created_at: string;
  countries: {
    code: string;
    name_ko: string;
    name_en: string;
    flag_emoji: string;
    [key: string]: unknown;
  };
  categories: {
    slug: CategorySlug;
    name_ko: string;
    name_en: string;
    emoji: string;
    [key: string]: unknown;
  };
}

function mapSupabaseTrendToTrendWithDetails(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  row: any
): TrendWithDetails {
  const r = row as SupabaseTrendRow;
  return {
    id: r.id,
    country_id: r.country_id,
    category_id: r.category_id,
    name: r.name,
    name_local: r.name_local,
    description: r.description,
    heat_score: r.heat_score,
    heat_status: r.heat_status,
    search_score: r.search_score,
    social_score: r.social_score,
    ecommerce_score: r.ecommerce_score,
    news_score: r.news_score,
    tags: r.tags ?? [],
    image_url: r.image_url,
    price: r.price,
    source_urls: r.source_urls ?? [],
    first_detected_at: r.first_detected_at,
    last_updated_at: r.last_updated_at,
    peak_date: r.peak_date,
    created_at: r.created_at,
    country: {
      code: r.countries.code,
      name_ko: r.countries.name_ko,
      name_en: r.countries.name_en,
      flag_emoji: r.countries.flag_emoji,
    },
    category: {
      slug: r.categories.slug,
      name_ko: r.categories.name_ko,
      name_en: r.categories.name_en,
      emoji: r.categories.emoji,
    },
  };
}
