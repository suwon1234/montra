import fs from 'fs';
import pg from 'pg';

function loadEnv() {
  if (!fs.existsSync('.env.local')) return {};
  return Object.fromEntries(
    fs.readFileSync('.env.local', 'utf8')
      .split(/\r?\n/)
      .map((line) => line.trim())
      .filter((line) => line && !line.startsWith('#') && line.includes('='))
      .map((line) => {
        const index = line.indexOf('=');
        return [line.slice(0, index).trim(), line.slice(index + 1).trim()];
      })
  );
}

const env = loadEnv();
const databaseUrl = process.env.DATABASE_URL ?? env.DATABASE_URL;
if (!databaseUrl) throw new Error('DATABASE_URL is missing.');

const client = new pg.Client({ connectionString: databaseUrl });
await client.connect();

const trends = await client.query(`
    SELECT
      COUNT(*)::int AS total,
      COUNT(*) FILTER (WHERE tags @> ARRAY['verified'])::int AS verified,
      COUNT(*) FILTER (WHERE tags @> ARRAY['raw-global-signal'])::int AS raw_global_signal,
      COUNT(DISTINCT country_id)::int AS countries
    FROM trends
  `);
const signals = await client.query(`
    SELECT
      COUNT(*)::int AS total,
      COUNT(DISTINCT country_code)::int AS countries
    FROM global_trend_signals
    WHERE window_date = $1::date
  `, ['2026-04-27']);
const reviews = await client.query(`
    SELECT
      COUNT(*)::int AS total,
      COUNT(*) FILTER (WHERE decision = 'verified')::int AS verified,
      COUNT(*) FILTER (WHERE decision LIKE 'needs%')::int AS needs_more_evidence
    FROM trend_validation_reviews
    WHERE window_date = $1::date
  `, ['2026-04-27']);
const reviewDecisions = await client.query(`
    SELECT decision, COUNT(*)::int AS count
    FROM trend_validation_reviews
    WHERE window_date = $1::date
    GROUP BY decision
    ORDER BY count DESC, decision
  `, ['2026-04-27']);
const signalSources = await client.query(`
    SELECT source_family, COUNT(*)::int AS count, COUNT(DISTINCT country_code)::int AS countries
    FROM global_trend_signals
    WHERE window_date = $1::date
    GROUP BY source_family
    ORDER BY count DESC, source_family
  `, ['2026-04-27']);

await client.end();

console.log(JSON.stringify({
  trends: trends.rows[0],
  global_trend_signals_2026_04_27: signals.rows[0],
  trend_validation_reviews_2026_04_27: reviews.rows[0],
  review_decisions: reviewDecisions.rows,
  signal_sources: signalSources.rows,
}, null, 2));
