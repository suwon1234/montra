import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import pg from 'pg';

const { Client } = pg;

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');
const outputDir = path.join(rootDir, 'scripts', 'output');

function defaultWindowDate() {
  return new Intl.DateTimeFormat('sv-SE', { timeZone: 'Asia/Seoul' }).format(new Date());
}

function readArg(name, fallback = '') {
  const match = process.argv.find((arg) => arg.startsWith(`--${name}=`));
  return match ? match.split('=').slice(1).join('=').trim() : fallback;
}

const applyToDb = process.argv.includes('--apply');
const batchDate = readArg('batch-date', process.env.WINDOW_DATE || defaultWindowDate());
const startDate = readArg('start-date', '2026-05-11');
const endDate = readArg('end-date', batchDate);
const replaceRange = process.argv.includes('--replace-range');
const snapshotDates = [...new Set(
  readArg('snapshot-dates', batchDate)
    .split(',')
    .map((value) => value.trim())
    .filter(Boolean)
)].sort();
const outputJson = path.join(outputDir, `focus25_trend_history_backfill_${startDate}_to_${endDate}.json`);
const outputMd = path.join(outputDir, `focus25_trend_history_backfill_${startDate}_to_${endDate}.md`);

function loadEnv() {
  const envPath = path.join(rootDir, '.env.local');
  if (!fs.existsSync(envPath)) return {};

  return Object.fromEntries(
    fs.readFileSync(envPath, 'utf8')
      .split(/\r?\n/)
      .map((line) => line.trim())
      .filter((line) => line && !line.startsWith('#') && line.includes('='))
      .map((line) => {
        const index = line.indexOf('=');
        return [line.slice(0, index).trim(), line.slice(index + 1).trim()];
      })
  );
}

function enumerateDates(start, end) {
  const dates = [];
  let cursor = new Date(`${start}T00:00:00+09:00`);
  const limit = new Date(`${end}T00:00:00+09:00`);
  while (cursor <= limit) {
    dates.push(new Intl.DateTimeFormat('sv-SE', { timeZone: 'Asia/Seoul' }).format(cursor));
    cursor.setUTCDate(cursor.getUTCDate() + 1);
  }
  return dates;
}

async function ensureHistorySchema(client) {
  await client.query('CREATE EXTENSION IF NOT EXISTS "uuid-ossp"');
  await client.query(`
    CREATE TABLE IF NOT EXISTS trend_history (
      id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
      trend_id UUID NOT NULL REFERENCES trends(id) ON DELETE CASCADE,
      recorded_at TIMESTAMPTZ NOT NULL,
      heat_score INTEGER NOT NULL,
      search_score INTEGER,
      social_score INTEGER,
      ecommerce_score INTEGER,
      news_score INTEGER,
      source_batch_date DATE,
      source_mode TEXT,
      created_at TIMESTAMPTZ DEFAULT NOW()
    )
  `);
  await client.query(`
    ALTER TABLE trend_history
    ADD COLUMN IF NOT EXISTS source_batch_date DATE
  `);
  await client.query(`
    ALTER TABLE trend_history
    ADD COLUMN IF NOT EXISTS source_mode TEXT
  `);
  await client.query(`
    CREATE UNIQUE INDEX IF NOT EXISTS idx_trend_history_unique_point
    ON trend_history (trend_id, recorded_at)
  `);
}

async function loadFocusRowsForSnapshot(client, snapshotDate) {
  const { rows } = await client.query(`
    SELECT
      t.id,
      t.name,
      t.heat_score,
      t.search_score,
      t.social_score,
      t.ecommerce_score,
      t.news_score,
      c.code AS country_code,
      cat.slug AS category_slug
    FROM trends t
    JOIN countries c ON c.id = t.country_id
    JOIN categories cat ON cat.id = t.category_id
    WHERE $1 = ANY(t.tags)
      AND 'focus-market-verified-refresh' = ANY(t.tags)
    ORDER BY c.code, cat.slug, t.name
  `, [snapshotDate]);
  return rows.map((row) => ({ ...row, source_batch_date: snapshotDate }));
}

function selectSnapshotForDate(date, availableSnapshotDates) {
  let selected = null;
  for (const snapshotDate of availableSnapshotDates) {
    if (snapshotDate <= date) selected = snapshotDate;
    if (snapshotDate > date) break;
  }
  return selected;
}

function buildDateAssignments(dates, snapshotMap) {
  const availableSnapshotDates = [...snapshotMap.keys()]
    .filter((date) => (snapshotMap.get(date) || []).length > 0)
    .sort();

  return dates.map((date) => {
    const sourceBatchDate = selectSnapshotForDate(date, availableSnapshotDates);
    if (!sourceBatchDate) {
      return {
        recorded_date: date,
        source_batch_date: null,
        source_mode: 'unmapped',
        row_count: 0,
      };
    }

    return {
      recorded_date: date,
      source_batch_date: sourceBatchDate,
      source_mode: date === sourceBatchDate ? 'snapshot-direct' : 'snapshot-carry-forward',
      row_count: (snapshotMap.get(sourceBatchDate) || []).length,
    };
  });
}

async function deleteHistoryRange(client, rangeStart, rangeEnd) {
  await client.query(`
    DELETE FROM trend_history th
    USING trends t
    WHERE th.trend_id = t.id
      AND 'focus-market-verified-refresh' = ANY(t.tags)
      AND th.recorded_at >= $1::timestamptz
      AND th.recorded_at < ($2::date + INTERVAL '1 day')
  `, [`${rangeStart}T00:00:00+09:00`, rangeEnd]);
}

async function applyHistory(client, snapshotMap, assignments) {
  let inserted = 0;
  for (const assignment of assignments) {
    const rows = snapshotMap.get(assignment.source_batch_date) || [];
    if (rows.length === 0) continue;

    for (const row of rows) {
      const recordedAt = `${assignment.recorded_date}T00:00:00+09:00`;
      const result = await client.query(`
        INSERT INTO trend_history (
          trend_id, recorded_at, heat_score, search_score, social_score, ecommerce_score, news_score,
          source_batch_date, source_mode
        )
        VALUES ($1, $2::timestamptz, $3, $4, $5, $6, $7, $8::date, $9)
        ON CONFLICT (trend_id, recorded_at) DO UPDATE SET
          heat_score = EXCLUDED.heat_score,
          search_score = EXCLUDED.search_score,
          social_score = EXCLUDED.social_score,
          ecommerce_score = EXCLUDED.ecommerce_score,
          news_score = EXCLUDED.news_score,
          source_batch_date = EXCLUDED.source_batch_date,
          source_mode = EXCLUDED.source_mode
        RETURNING id
      `, [
        row.id,
        recordedAt,
        row.heat_score,
        row.search_score,
        row.social_score,
        row.ecommerce_score,
        row.news_score,
        assignment.source_batch_date,
        assignment.source_mode,
      ]);
      if (result.rowCount > 0) inserted += 1;
    }
  }
  return inserted;
}

function writeSummary(payload) {
  fs.mkdirSync(outputDir, { recursive: true });
  fs.writeFileSync(outputJson, `${JSON.stringify(payload, null, 2)}\n`, 'utf8');

  const lines = [
    `# Focus 25 Trend History Backfill ${startDate} to ${endDate}`,
    '',
    `- Batch date source: ${batchDate}`,
    `- Snapshot dates used: ${payload.snapshot_dates.join(', ') || 'none'}`,
    `- Focus trends across snapshots: ${payload.focus_trend_count}`,
    `- Dates filled: ${payload.date_count}`,
    `- History points written: ${payload.history_points_written}`,
    `- Range replaced first: ${payload.replace_range}`,
    '',
    '## Date Sources',
    ...payload.date_sources.map((row) => `- ${row.recorded_date}: ${row.source_batch_date || 'none'} (${row.source_mode}, ${row.row_count})`),
    '',
    '## By Country',
    ...payload.by_country.map((row) => `- ${row.country_code}: ${row.count}`),
    '',
  ];

  fs.writeFileSync(outputMd, `${lines.join('\n')}\n`, 'utf8');
}

async function main() {
  const env = loadEnv();
  const databaseUrl = process.env.DATABASE_URL ?? env.DATABASE_URL;
  if (!databaseUrl) throw new Error('DATABASE_URL is missing.');

  const client = new Client({ connectionString: databaseUrl });
  await client.connect();
  await ensureHistorySchema(client);

  const dates = enumerateDates(startDate, endDate);
  const snapshotEntries = [];
  for (const snapshotDate of snapshotDates) {
    snapshotEntries.push([snapshotDate, await loadFocusRowsForSnapshot(client, snapshotDate)]);
  }
  const snapshotMap = new Map(snapshotEntries);
  const assignments = buildDateAssignments(dates, snapshotMap);
  const focusRows = [...new Map(
    [...snapshotMap.values()]
      .flat()
      .map((row) => [row.id, row])
  ).values()];

  let historyPointsWritten = 0;
  if (applyToDb) {
    if (replaceRange) {
      await deleteHistoryRange(client, startDate, endDate);
    }
    historyPointsWritten = await applyHistory(client, snapshotMap, assignments);
  }

  const byCountryMap = new Map();
  for (const row of focusRows) {
    byCountryMap.set(row.country_code, (byCountryMap.get(row.country_code) || 0) + 1);
  }

  await client.end();

  const payload = {
    batch_date: batchDate,
    start_date: startDate,
    end_date: endDate,
    snapshot_dates: snapshotDates,
    replace_range: replaceRange,
    focus_trend_count: focusRows.length,
    date_count: dates.length,
    history_points_written: historyPointsWritten,
    date_sources: assignments,
    by_country: [...byCountryMap.entries()]
      .map(([country_code, count]) => ({ country_code, count }))
      .sort((a, b) => a.country_code.localeCompare(b.country_code)),
  };

  writeSummary(payload);
  console.log(`JSON: ${path.relative(rootDir, outputJson)}`);
  console.log(`MD: ${path.relative(rootDir, outputMd)}`);
  console.log(`focus_trends: ${focusRows.length}, dates: ${dates.length}, history_points_written: ${historyPointsWritten}, applied: ${applyToDb}`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
