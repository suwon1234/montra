// ============================================================
// MONTRA 데이터 레이어
// Supabase 연결 시 → 실제 DB 쿼리
// Supabase 미연결 시 → mock-data fallback
// ============================================================

import { getSupabaseClient } from './supabase';
import { getPool } from './db';
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
import { FOCUS_MARKET_CODES } from './focus-markets';
import type {
  Category,
  CategorySlug,
  Country,
  CountryWithStats,
  FocusMarketRefreshSummary,
  HeatStatus,
  Trend,
  TrendHistory,
  TrendWithDetails,
} from './types';

function normalizeTrendText(value: string | null | undefined): string {
  return String(value || '')
    .normalize('NFKC')
    .toLowerCase()
    .replace(/[(){}\[\]!?,.:'"`~]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function dedupeNameKey(name: string): string {
  const normalized = normalizeTrendText(name);
  const parts = normalized
    .split(/\s+-\s+/)
    .map((part) => part.trim())
    .filter(Boolean);
  if (parts.length === 2) {
    return parts.sort().join(' :: ');
  }
  return normalized;
}

function trendDedupKey(trend: TrendWithDetails): string {
  const name = trend.name_local || trend.name;
  if (trend.category.slug === 'challenge') {
    return `${trend.country.code}|${trend.category.slug}|${dedupeNameKey(name)}`;
  }
  return `${trend.country.code}|${trend.category.slug}|${normalizeTrendText(name)}`;
}

function isPreferredTrend(next: TrendWithDetails, current: TrendWithDetails): boolean {
  const nextUpdated = Date.parse(next.last_updated_at || next.created_at || '');
  const currentUpdated = Date.parse(current.last_updated_at || current.created_at || '');
  if (Number.isFinite(nextUpdated) && Number.isFinite(currentUpdated) && nextUpdated !== currentUpdated) {
    return nextUpdated > currentUpdated;
  }
  if (next.heat_score !== current.heat_score) {
    return next.heat_score > current.heat_score;
  }
  if ((next.source_urls?.length || 0) !== (current.source_urls?.length || 0)) {
    return (next.source_urls?.length || 0) > (current.source_urls?.length || 0);
  }
  return next.id > current.id;
}

function dedupeTrendRows(rows: TrendWithDetails[]): TrendWithDetails[] {
  const seen = new Map<string, TrendWithDetails>();
  for (const row of rows) {
    const key = trendDedupKey(row);
    const current = seen.get(key);
    if (!current || isPreferredTrend(row, current)) {
      seen.set(key, row);
    }
  }
  return [...seen.values()];
}

function extractBatchDate(tags: string[] | null | undefined): string | null {
  return (tags ?? []).find((tag) => /^\d{4}-\d{2}-\d{2}$/.test(tag)) ?? null;
}

async function getLatestFocusBatchDateFromPool(pool: { query: (sql: string, params?: unknown[]) => Promise<{ rows: Array<{ batch_date: string }> }> }): Promise<string | null> {
  const { rows } = await pool.query(`
    WITH tagged AS (
      SELECT tag.batch_date
      FROM trends t
      CROSS JOIN LATERAL unnest(t.tags) AS tag(batch_date)
      WHERE 'focus-market-verified-refresh' = ANY(t.tags)
        AND tag.batch_date ~ '^\\d{4}-\\d{2}-\\d{2}$'
    )
    SELECT MAX(batch_date) AS batch_date
    FROM tagged
  `);
  return rows[0]?.batch_date ?? null;
}

async function getLatestSignalWindowDateFromPool(
  pool: { query: (sql: string, params?: unknown[]) => Promise<{ rows: Array<{ window_date: string }> }> },
  countryCodes: string[],
): Promise<string | null> {
  const { rows } = await pool.query(`
    SELECT MAX(window_date)::text AS window_date
    FROM global_trend_signals
    WHERE country_code = ANY($1::text[])
  `, [countryCodes]);
  return rows[0]?.window_date ?? null;
}

function filterToLatestFocusBatch<T extends { tags: string[] }>(rows: T[]): T[] {
  const tagged = rows
    .filter((row) => row.tags.includes('focus-market-verified-refresh'))
    .map((row) => ({ row, batchDate: extractBatchDate(row.tags) }))
    .filter((item): item is { row: T; batchDate: string } => Boolean(item.batchDate));

  if (tagged.length === 0) return rows;

  const latestBatchDate = tagged
    .map((item) => item.batchDate)
    .sort((a, b) => b.localeCompare(a))[0];

  return tagged
    .filter((item) => item.batchDate === latestBatchDate)
    .map((item) => item.row);
}

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
  latestFocusBatchOnly?: boolean;
}): Promise<TrendWithDetails[]> {
  const latestFocusBatchOnly = options?.latestFocusBatchOnly ?? true;
  // 1) Docker PostgreSQL 직접 연결
  const pool = getPool();
  if (pool) {
    try {
      const conditions: string[] = [];
      const params: unknown[] = [];
      let idx = 1;

      if (latestFocusBatchOnly) {
        const latestBatchDate = await getLatestFocusBatchDateFromPool(pool);
        if (latestBatchDate) {
          conditions.push(`'focus-market-verified-refresh' = ANY(t.tags)`);
          conditions.push(`$${idx++} = ANY(t.tags)`);
          params.push(latestBatchDate);
        }
      }

      if (options?.countryCode) {
        conditions.push(`c.code = $${idx++}`);
        params.push(options.countryCode.toUpperCase());
      }
      if (options?.categorySlug) {
        conditions.push(`cat.slug = $${idx++}`);
        params.push(options.categorySlug);
      }
      if (options?.heatStatus) {
        conditions.push(`t.heat_status = $${idx++}`);
        params.push(options.heatStatus);
      }
      if (options?.search) {
        conditions.push(`(t.name ILIKE $${idx} OR t.description ILIKE $${idx})`);
        params.push(`%${options.search}%`);
        idx++;
      }

      const where = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';
      const sortBy = options?.sortBy ?? 'heat_score';
      const sortOrder = options?.sortOrder === 'asc' ? 'ASC' : 'DESC';
      const fetchLimit = options?.limit ? Math.min(options.limit * 4, 400) : null;
      const limitClause = fetchLimit ? `LIMIT ${fetchLimit}` : '';

      const sql = `
        SELECT t.*,
          json_build_object('code', c.code, 'name_ko', c.name_ko, 'name_en', c.name_en, 'flag_emoji', c.flag_emoji) as country,
          json_build_object('slug', cat.slug, 'name_ko', cat.name_ko, 'name_en', cat.name_en, 'emoji', cat.emoji) as category
        FROM trends t
        JOIN countries c ON t.country_id = c.id
        JOIN categories cat ON t.category_id = cat.id
        ${where}
        ORDER BY t.${sortBy} ${sortOrder}
        ${limitClause}
      `;

      const { rows } = await pool.query(sql, params);
      const deduped = dedupeTrendRows(rows.map(mapPgRowToTrendWithDetails));
      return options?.limit ? deduped.slice(0, options.limit) : deduped;
    } catch (err) {
      console.error('[PG] getTrends 예외:', err);
    }
  }

  // 2) Supabase fallback
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

    if (options?.countryCode) {
      const { data: countryData } = await supabase
        .from('countries')
        .select('id')
        .eq('code', options.countryCode.toUpperCase())
        .single();

      if (countryData) {
        query = query.eq('country_id', countryData.id);
      } else {
        return [];
      }
    }

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

    if (options?.heatStatus) {
      query = query.eq('heat_status', options.heatStatus);
    }

    if (options?.search) {
      const searchTerm = `%${options.search}%`;
      query = query.or(
        `name.ilike.${searchTerm},description.ilike.${searchTerm}`
      );
    }

    const sortBy = options?.sortBy ?? 'heat_score';
    const sortOrder = options?.sortOrder ?? 'desc';
    query = query.order(sortBy, { ascending: sortOrder === 'asc' });

    if (options?.limit) {
      query = query.limit(Math.min(options.limit * 4, 400));
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

    let mapped = (data ?? []).map(mapSupabaseTrendToTrendWithDetails);
    if (latestFocusBatchOnly) {
      mapped = filterToLatestFocusBatch(mapped);
    }
    const deduped = dedupeTrendRows(mapped);
    return options?.limit ? deduped.slice(0, options.limit) : deduped;
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
  const pool = getPool();
  if (pool) {
    try {
      const latestBatchDate = await getLatestFocusBatchDateFromPool(pool);
      const latestSignalDate = await getLatestSignalWindowDateFromPool(pool, FOCUS_MARKET_CODES);
      const { rows } = await pool.query(`
        WITH scoped_trends AS (
          SELECT *
          FROM trends
          WHERE 'focus-market-verified-refresh' = ANY(tags)
            AND ($1::text IS NULL OR $1 = ANY(tags))
        ),
        scoped_signals AS (
          SELECT
            country_code,
            COUNT(*)::int as investigated_count
          FROM global_trend_signals
          WHERE country_code = ANY($2::text[])
            AND ($3::text IS NOT NULL AND window_date = $3::date)
          GROUP BY country_code
        )
        SELECT c.*,
          COUNT(t.id)::int as total_trends,
          COUNT(CASE WHEN t.heat_status = 'rising' THEN 1 END)::int as rising_count,
          COALESCE(ss.investigated_count, 0)::int as investigated_count,
          (
            SELECT st.name
            FROM scoped_trends st
            WHERE st.country_id = c.id
            ORDER BY st.heat_score DESC, st.last_updated_at DESC
            LIMIT 1
          ) as top_trend
        FROM countries c
        LEFT JOIN scoped_trends t ON t.country_id = c.id
        LEFT JOIN scoped_signals ss ON ss.country_code = c.code
        WHERE c.is_active = true
        GROUP BY c.id, ss.investigated_count
        ORDER BY investigated_count DESC, total_trends DESC
      `, [latestBatchDate, FOCUS_MARKET_CODES, latestSignalDate]);
      return rows as CountryWithStats[];
    } catch (err) {
      console.error('[PG] getCountriesWithStats 예외:', err);
    }
  }

  const supabase = getSupabaseClient();

  if (!supabase) {
    return getMockCountriesWithStats();
  }

  try {
    const { data: countries, error: countriesError } = await supabase
      .from('countries')
      .select('*')
      .eq('is_active', true);

    if (countriesError || !countries) {
      console.error('[Supabase] getCountriesWithStats 쿼리 실패, mock fallback:', countriesError?.message);
      return getMockCountriesWithStats();
    }

    const { data: trends, error: trendsError } = await supabase
      .from('trends')
      .select('country_id, heat_status, heat_score, name, tags, last_updated_at');

    if (trendsError || !trends) {
      console.error('[Supabase] getCountriesWithStats 트렌드 조회 실패, mock fallback:', trendsError?.message);
      return getMockCountriesWithStats();
    }

    const scopedTrends = filterToLatestFocusBatch(trends as Array<{ country_id: string; heat_status: string; heat_score: number; name: string; tags: string[]; last_updated_at?: string }>);

    return countries.map((country) => {
      const countryTrends = scopedTrends.filter(
        (t) => t.country_id === country.id
      );
      const risingCount = countryTrends.filter(
        (t) => t.heat_status === 'rising'
      ).length;
      const topTrend = [...countryTrends].sort(
        (a, b) => b.heat_score - a.heat_score || Date.parse(b.last_updated_at ?? '') - Date.parse(a.last_updated_at ?? '')
      )[0];

      return {
        ...(country as Country),
        rising_count: risingCount,
        total_trends: countryTrends.length,
        investigated_count: 0,
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
  const pool = getPool();
  if (pool) {
    try {
      const { rows } = await pool.query('SELECT * FROM categories ORDER BY sort_order ASC');
      return rows as Category[];
    } catch (err) {
      console.error('[PG] getCategories 예외:', err);
    }
  }

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
  const pool = getPool();
  if (pool) {
    try {
      const { rows } = await pool.query(`
        SELECT t.*,
          json_build_object('code', c.code, 'name_ko', c.name_ko, 'name_en', c.name_en, 'flag_emoji', c.flag_emoji) as country,
          json_build_object('slug', cat.slug, 'name_ko', cat.name_ko, 'name_en', cat.name_en, 'emoji', cat.emoji) as category
        FROM trends t
        JOIN countries c ON t.country_id = c.id
        JOIN categories cat ON t.category_id = cat.id
        WHERE t.id = $1
      `, [id]);
      if (rows.length > 0) return mapPgRowToTrendWithDetails(rows[0]);
      return null;
    } catch (err) {
      console.error('[PG] getTrendById 예외:', err);
    }
  }

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
  const pool = getPool();
  if (pool) {
    try {
      const { rows } = await pool.query(
        'SELECT * FROM trend_history WHERE trend_id = $1 ORDER BY recorded_at ASC',
        [trendId]
      );
      return rows as TrendHistory[];
    } catch (err) {
      console.error('[PG] getHistoryForTrend 예외:', err);
    }
  }

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
  const pool = getPool();
  if (pool && trendIds.length > 0) {
    try {
      const placeholders = trendIds.map((_, i) => `$${i + 1}`).join(',');
      const { rows } = await pool.query(
        `SELECT * FROM trend_history WHERE trend_id IN (${placeholders}) ORDER BY recorded_at ASC`,
        trendIds
      );
      const result: Record<string, TrendHistory[]> = {};
      for (const id of trendIds) result[id] = [];
      for (const row of rows as TrendHistory[]) {
        if (result[row.trend_id]) result[row.trend_id].push(row);
      }
      return result;
    } catch (err) {
      console.error('[PG] getBatchHistoryForTrends 예외:', err);
    }
  }

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
  const pool = getPool();
  if (pool) {
    try {
      const { rows } = await pool.query(
        'SELECT * FROM countries WHERE code = $1',
        [code.toUpperCase()]
      );
      if (rows.length > 0) return rows[0] as Country;
      return null;
    } catch (err) {
      console.error('[PG] getCountryByCode 예외:', err);
    }
  }

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
  const pool = getPool();
  if (pool) {
    try {
      const limitClause = limit ? `LIMIT ${limit}` : '';
      const { rows } = await pool.query(`
        SELECT t.*,
          json_build_object('code', c.code, 'name_ko', c.name_ko, 'name_en', c.name_en, 'flag_emoji', c.flag_emoji) as country,
          json_build_object('slug', cat.slug, 'name_ko', cat.name_ko, 'name_en', cat.name_en, 'emoji', cat.emoji) as category
        FROM trends t
        JOIN countries c ON t.country_id = c.id
        JOIN categories cat ON t.category_id = cat.id
        ORDER BY t.heat_score DESC
        ${limitClause}
      `);
      return rows.map(mapPgRowToTrendWithDetails);
    } catch (err) {
      console.error('[PG] getGlobalRanking 예외:', err);
    }
  }

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

export async function getLatestFocusMarketRefreshSummary(): Promise<FocusMarketRefreshSummary | null> {
  const pool = getPool();
  if (pool) {
    try {
      const { rows } = await pool.query(`
        WITH tagged AS (
          SELECT
            t.country_id,
            t.last_updated_at,
            tag.batch_date
          FROM trends t
          CROSS JOIN LATERAL unnest(t.tags) AS tag(batch_date)
          WHERE 'focus-market-verified-refresh' = ANY(t.tags)
            AND tag.batch_date ~ '^\\d{4}-\\d{2}-\\d{2}$'
        ),
        latest AS (
          SELECT MAX(batch_date) AS batch_date
          FROM tagged
        )
        SELECT
          latest.batch_date,
          COUNT(*)::int AS trend_count,
          COUNT(DISTINCT tagged.country_id)::int AS country_count,
          MAX(tagged.last_updated_at) AS latest_signal_at
        FROM latest
        JOIN tagged
          ON tagged.batch_date = latest.batch_date
        GROUP BY latest.batch_date
      `);

      if (rows.length > 0) {
        return rows[0] as FocusMarketRefreshSummary;
      }
      return null;
    } catch (err) {
      console.error('[PG] getLatestFocusMarketRefreshSummary 예외:', err);
    }
  }

  try {
    const trends = await getTrends();
    const tagged = trends
      .filter((trend) => trend.tags.includes('focus-market-verified-refresh'))
      .map((trend) => {
        const batchDate = trend.tags.find((tag) => /^\d{4}-\d{2}-\d{2}$/.test(tag));
        return batchDate
          ? {
              batch_date: batchDate,
              country_code: trend.country.code,
              last_updated_at: trend.last_updated_at,
            }
          : null;
      })
      .filter(Boolean) as Array<{
        batch_date: string;
        country_code: string;
        last_updated_at: string;
      }>;

    if (tagged.length === 0) return null;

    const latestBatchDate = tagged
      .map((item) => item.batch_date)
      .sort((a, b) => b.localeCompare(a))[0];

    const latestBatchRows = tagged.filter((item) => item.batch_date === latestBatchDate);
    const latestSignalAt =
      latestBatchRows
        .map((item) => item.last_updated_at)
        .sort((a, b) => Date.parse(b) - Date.parse(a))[0] ?? null;

    return {
      batch_date: latestBatchDate,
      country_count: new Set(latestBatchRows.map((item) => item.country_code)).size,
      trend_count: latestBatchRows.length,
      latest_signal_at: latestSignalAt,
    };
  } catch (err) {
    console.error('[Fallback] getLatestFocusMarketRefreshSummary 예외:', err);
    return null;
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

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function mapPgRowToTrendWithDetails(row: any): TrendWithDetails {
  return {
    id: row.id,
    country_id: row.country_id,
    category_id: row.category_id,
    name: row.name,
    name_local: row.name_local,
    description: row.description,
    heat_score: row.heat_score,
    heat_status: row.heat_status,
    search_score: row.search_score,
    social_score: row.social_score,
    ecommerce_score: row.ecommerce_score,
    news_score: row.news_score,
    tags: row.tags ?? [],
    image_url: row.image_url,
    price: row.price,
    source_urls: row.source_urls ?? [],
    first_detected_at: row.first_detected_at,
    last_updated_at: row.last_updated_at,
    peak_date: row.peak_date,
    created_at: row.created_at,
    country: row.country,
    category: row.category,
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
