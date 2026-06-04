import { NextResponse } from 'next/server';

import { getPool } from '@/lib/db';
import { FOCUS_MARKETS, marketOrder } from '@/lib/focus-markets';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

function flagEmoji(code: string) {
  return code
    .toUpperCase()
    .replace(/./g, (char) => String.fromCodePoint(127397 + char.charCodeAt(0)));
}

export async function GET() {
  const pool = getPool();
  const codes = FOCUS_MARKETS.map((market) => market.code);
  const statsByCode = new Map<string, any>();

  if (pool) {
    try {
      const { rows } = await pool.query(
        `
          WITH latest_batch AS (
            SELECT MAX(tag.batch_date) AS batch_date
            FROM trends t
            CROSS JOIN LATERAL unnest(t.tags) AS tag(batch_date)
            WHERE 'focus-market-verified-refresh' = ANY(t.tags)
              AND tag.batch_date ~ '^\\d{4}-\\d{2}-\\d{2}$'
          ),
          scoped_trends AS (
            SELECT t.*
            FROM trends t
            JOIN latest_batch lb
              ON lb.batch_date IS NOT NULL
             AND lb.batch_date = ANY(t.tags)
            WHERE 'focus-market-verified-refresh' = ANY(t.tags)
          ),
          latest_signal AS (
            SELECT MAX(window_date)::text AS window_date
            FROM global_trend_signals
            WHERE country_code = ANY($1::text[])
          ),
          scoped_signals AS (
            SELECT
              country_code,
              COUNT(*)::int AS investigated_count
            FROM global_trend_signals
            WHERE country_code = ANY($1::text[])
              AND (SELECT window_date FROM latest_signal) IS NOT NULL
              AND window_date = (SELECT window_date FROM latest_signal)::date
            GROUP BY country_code
          )
          SELECT
            c.code,
            c.name_ko,
            c.name_en,
            c.flag_emoji,
            c.region,
            COUNT(t.id)::int AS total_trends,
            COUNT(CASE WHEN t.heat_status = 'rising' THEN 1 END)::int AS rising_count,
            COALESCE(ss.investigated_count, 0)::int AS investigated_count,
            (
              SELECT t2.name
              FROM scoped_trends t2
              WHERE t2.country_id = c.id
              ORDER BY t2.heat_score DESC, t2.last_updated_at DESC
              LIMIT 1
            ) AS top_trend
          FROM countries c
          LEFT JOIN scoped_trends t ON t.country_id = c.id
          LEFT JOIN scoped_signals ss ON ss.country_code = c.code
          WHERE c.is_active = true
            AND c.code = ANY($1::text[])
          GROUP BY c.id, ss.investigated_count
        `,
        [codes]
      );

      for (const row of rows) {
        statsByCode.set(row.code, row);
      }
    } catch (error) {
      console.error('[api/countries] focus market query failed:', error);
    }
  }

  const data = FOCUS_MARKETS
    .map((market) => {
      const stats = statsByCode.get(market.code);
      return {
        code: market.code,
        name_ko: stats?.name_ko ?? market.name_ko,
        name_en: stats?.name_en ?? market.name_en,
        flag_emoji: stats?.flag_emoji ?? flagEmoji(market.code),
        region: stats?.region ?? 'global',
        focus_tier: market.tier,
        focus_signal: market.signal,
        rising_count: stats?.rising_count ?? 0,
        total_trends: stats?.total_trends ?? 0,
        investigated_count: stats?.investigated_count ?? 0,
        top_trend: stats?.top_trend,
      };
    })
    .sort((a, b) => (marketOrder.get(a.code) ?? 999) - (marketOrder.get(b.code) ?? 999));

  return NextResponse.json({ data });
}
