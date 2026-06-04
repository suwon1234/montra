// ============================================================
// MONTRA DB 타입 정의
// Supabase 테이블 스키마와 1:1 대응
// ============================================================

/** 지역 구분 */
export type Region =
  | 'asia'
  | 'europe'
  | 'americas'
  | 'middle_east'
  | 'africa'
  | 'oceania';

/** 카테고리 슬러그 (Docker PostgreSQL DB 기준) */
export type CategorySlug =
  | 'fashion'
  | 'products'
  | 'food'
  | 'brands'
  | 'challenge';

/** 트렌드 열기 상태 */
export type HeatStatus = 'rising' | 'steady' | 'cooling' | 'new';

// ------------------------------------------------------------
// countries 테이블
// ------------------------------------------------------------
export interface Country {
  id: string;
  code: string; // ISO 3166-1 alpha-2
  name_ko: string;
  name_en: string;
  name_local?: string;
  flag_emoji: string;
  region: Region;
  sub_region?: string;
  timezone?: string;
  primary_language?: string;
  primary_ecommerce_platform?: string;
  primary_social_platform?: string;
  population?: number;
  internet_penetration?: number; // 0~100
  description?: string;
  is_active: boolean;
  created_at: string;
}

// ------------------------------------------------------------
// categories 테이블
// ------------------------------------------------------------
export interface Category {
  id: string;
  slug: CategorySlug;
  name_ko: string;
  name_en: string;
  emoji: string;
  sort_order: number;
}

// ------------------------------------------------------------
// trends 테이블 (핵심)
// ------------------------------------------------------------
export interface Trend {
  id: string;
  country_id: string;
  category_id: string;
  name: string;
  name_local?: string;
  description?: string;
  heat_score: number; // 0~100
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
}

// ------------------------------------------------------------
// trend_history 테이블
// ------------------------------------------------------------
export interface TrendHistory {
  id: string;
  trend_id: string;
  recorded_at: string;
  heat_score: number;
  search_score?: number;
  social_score?: number;
  ecommerce_score?: number;
  news_score?: number;
}

// ------------------------------------------------------------
// API 응답용 조인된 타입
// ------------------------------------------------------------
export interface TrendWithDetails extends Trend {
  country: Pick<Country, 'code' | 'name_ko' | 'name_en' | 'flag_emoji'>;
  category: Pick<Category, 'slug' | 'name_ko' | 'name_en' | 'emoji'>;
}

export interface CountryWithStats extends Country {
  rising_count: number;
  total_trends: number;
  investigated_count: number;
  top_trend?: string;
}

export interface FocusMarketRefreshSummary {
  batch_date: string;
  country_count: number;
  trend_count: number;
  latest_signal_at?: string | null;
}

// ------------------------------------------------------------
// 필터/쿼리 파라미터 타입
// ------------------------------------------------------------
export interface TrendFilters {
  country_id?: string;
  category_slug?: CategorySlug;
  heat_status?: HeatStatus;
  min_heat_score?: number;
  search?: string;
  sort_by?: 'heat_score' | 'first_detected_at' | 'last_updated_at';
  sort_order?: 'asc' | 'desc';
  limit?: number;
  offset?: number;
}
