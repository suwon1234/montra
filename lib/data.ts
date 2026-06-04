// ============================================================
// MONTRA 데이터 레이어
// Docker PostgreSQL 연결 시 → 실제 DB 쿼리
// 연결 실패 시 → mock-data fallback
// ============================================================

import { getPool } from './db';
import {
  filterMockTrends,
  getMockCountriesWithStats,
  getMockTrendsWithDetails,
  getMockHistoryForTrend,
  getMockBatchHistory,
  MOCK_CATEGORIES,
  MOCK_COUNTRIES,
} from './mock-data';
import { FOCUS_MARKET_CODES } from './focus-markets';
import type {
  Category,
  CategorySlug,
  Country,
  CountryWithStats,
  FocusMarketRefreshSummary,
  HeatStatus,
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

  // DB 미연결/실패 → mock fallback
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

  return getMockCountriesWithStats();
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

  return MOCK_CATEGORIES;
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

  const allTrends = getMockTrendsWithDetails();
  return allTrends.find((t) => t.id === id) ?? null;
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

  return getMockHistoryForTrend(trendId);
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

  return getMockBatchHistory(trendIds);
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

  return MOCK_COUNTRIES.find((c) => c.code === code.toUpperCase()) ?? null;
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

  const allTrends = getMockTrendsWithDetails();
  allTrends.sort((a, b) => b.heat_score - a.heat_score);
  return limit ? allTrends.slice(0, limit) : allTrends;
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

  return null;
}

// ============================================================
// 내부 헬퍼: PG row → TrendWithDetails 변환
// ============================================================

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
