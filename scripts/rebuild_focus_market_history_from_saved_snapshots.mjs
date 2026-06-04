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
const replaceRange = process.argv.includes('--replace-range');
const batchDate = readArg('batch-date', process.env.WINDOW_DATE || defaultWindowDate());
const startDate = readArg('start-date', '2026-05-11');
const endDate = readArg('end-date', batchDate);
const outputJson = path.join(outputDir, `focus25_trend_history_rebuilt_${startDate}_to_${endDate}.json`);
const outputMd = path.join(outputDir, `focus25_trend_history_rebuilt_${startDate}_to_${endDate}.md`);

const SNAPSHOT_430_JSON = path.join(outputDir, 'verified_focus_market_trends_2026-04-30.json');
const SNAPSHOT_511_CARRY_JSON = path.join(outputDir, 'focus25_carry_forward_2026-05-11.json');
const SNAPSHOT_511_VERIFIED_JSON = path.join(outputDir, 'verified_focus_market_trends_2026-05-11.json');
const SNAPSHOT_424_SQL_FILES = [
  path.join(outputDir, 'verified_KRJP_full_ko_2026-04-24.sql'),
  path.join(outputDir, 'verified_IDPHSGTWHK_full_ko_2026-04-24.sql'),
  path.join(outputDir, 'verified_refresh_stale_11countries_2026-04-24.sql'),
];

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

function buildKey(countryCode, categorySlug, name) {
  return `${countryCode}|${categorySlug}|${name}`;
}

function scoreFields(category, searchScore) {
  if (category === 'challenge') {
    const social = Math.min(100, Math.round(searchScore * 0.9));
    return { search: searchScore, social, ecommerce: 0, news: Math.round(searchScore * 0.2) };
  }
  if (category === 'brands') {
    return {
      search: searchScore,
      social: Math.min(100, Math.round(searchScore * 0.55)),
      ecommerce: Math.min(100, Math.round(searchScore * 0.35)),
      news: Math.round(searchScore * 0.15),
    };
  }
  if (category === 'products') {
    return {
      search: searchScore,
      social: Math.min(100, Math.round(searchScore * 0.25)),
      ecommerce: Math.min(100, Math.round(searchScore * 0.65)),
      news: Math.round(searchScore * 0.1),
    };
  }
  if (category === 'fashion') {
    return {
      search: searchScore,
      social: Math.min(100, Math.round(searchScore * 0.6)),
      ecommerce: Math.round(searchScore * 0.15),
      news: Math.round(searchScore * 0.1),
    };
  }
  if (category === 'food') {
    return {
      search: searchScore,
      social: Math.min(100, Math.round(searchScore * 0.5)),
      ecommerce: Math.round(searchScore * 0.1),
      news: Math.round(searchScore * 0.15),
    };
  }
  return { search: searchScore, social: 0, ecommerce: 0, news: 0 };
}

function heatScore(scores) {
  return Math.round(scores.search * 0.4 + scores.social * 0.35 + scores.ecommerce * 0.2 + scores.news * 0.05);
}

function ensureArray(value) {
  return Array.isArray(value) ? value : [];
}

function mapVerifiedJsonRow(row, snapshotDate) {
  const categorySlug = row.category === 'challenges' ? 'challenge' : row.category;
  const scores = scoreFields(categorySlug, Number(row.search_score || 0));
  return {
    country_code: row.country_code,
    category_slug: categorySlug,
    name: row.name,
    name_local: row.name_local || null,
    description: row.description || null,
    heat_score: heatScore(scores),
    search_score: scores.search,
    social_score: scores.social,
    ecommerce_score: scores.ecommerce,
    news_score: Math.max(scores.news, 55),
    source_urls: [...new Set(ensureArray(row.evidence).map((item) => item?.url).filter(Boolean))],
    first_detected_at: row.first_detected_at,
    last_updated_at: row.last_updated_at,
    snapshot_date: snapshotDate,
  };
}

function buildRowMap(rows) {
  return new Map(rows.map((row) => [buildKey(row.country_code, row.category_slug, row.name), row]));
}

function parseQuotedString(token) {
  if (token === 'NULL') return null;
  if (token.startsWith("'") && token.endsWith("'")) {
    return token.slice(1, -1).replace(/''/g, "'");
  }
  return token;
}

function splitSqlTopLevel(text, delimiter) {
  const parts = [];
  let current = '';
  let inQuote = false;
  let bracketDepth = 0;

  for (let index = 0; index < text.length; index += 1) {
    const char = text[index];
    const next = text[index + 1];

    if (char === "'" && next === "'") {
      current += "''";
      index += 1;
      continue;
    }

    if (char === "'") {
      inQuote = !inQuote;
      current += char;
      continue;
    }

    if (!inQuote) {
      if (char === '[') bracketDepth += 1;
      if (char === ']') bracketDepth -= 1;
      if (char === delimiter && bracketDepth === 0) {
        parts.push(current.trim());
        current = '';
        continue;
      }
    }

    current += char;
  }

  if (current.trim()) parts.push(current.trim());
  return parts;
}

function extractSqlTuples(sql) {
  const valuesIndex = sql.indexOf('VALUES');
  if (valuesIndex < 0) return [];

  const text = sql.slice(valuesIndex + 'VALUES'.length);
  const tuples = [];
  let current = '';
  let inQuote = false;
  let bracketDepth = 0;
  let tupleDepth = 0;

  for (let index = 0; index < text.length; index += 1) {
    const char = text[index];
    const next = text[index + 1];

    if (char === "'" && next === "'") {
      if (tupleDepth > 0) current += "''";
      index += 1;
      continue;
    }

    if (char === "'") {
      inQuote = !inQuote;
      if (tupleDepth > 0) current += char;
      continue;
    }

    if (!inQuote) {
      if (char === '[') bracketDepth += 1;
      if (char === ']') bracketDepth -= 1;
      if (char === '(' && bracketDepth === 0) {
        tupleDepth += 1;
        if (tupleDepth === 1) {
          current = '';
          continue;
        }
      }
      if (char === ')' && bracketDepth === 0) {
        tupleDepth -= 1;
        if (tupleDepth === 0) {
          tuples.push(current.trim());
          current = '';
          continue;
        }
      }
      if (char === ';' && tupleDepth === 0) break;
    }

    if (tupleDepth > 0) current += char;
  }

  return tuples;
}

function parseSqlArray(token) {
  if (!token.startsWith('ARRAY[') || !token.endsWith(']')) return [];
  const inner = token.slice(6, -1).trim();
  if (!inner) return [];
  return splitSqlTopLevel(inner, ',').map((part) => parseQuotedString(part)).filter(Boolean);
}

function loadSqlSnapshotRows(filePath, countryIds, categoryIds) {
  if (!fs.existsSync(filePath)) return [];
  const sql = fs.readFileSync(filePath, 'utf8');
  const tuples = extractSqlTuples(sql);

  return tuples.map((tuple) => {
    const fields = splitSqlTopLevel(tuple, ',');
    if (fields.length < 15) return null;

    const countryId = parseQuotedString(fields[0]);
    const categoryId = parseQuotedString(fields[1]);
    const countryCode = countryIds[countryId];
    const categorySlug = categoryIds[categoryId];
    if (!countryCode || !categorySlug) return null;

    return {
      country_code: countryCode,
      category_slug: categorySlug,
      name: parseQuotedString(fields[2]),
      name_local: parseQuotedString(fields[3]),
      description: parseQuotedString(fields[4]),
      heat_score: Number(parseQuotedString(fields[5]) || 0),
      search_score: Number(parseQuotedString(fields[7]) || 0),
      social_score: Number(parseQuotedString(fields[8]) || 0),
      ecommerce_score: Number(parseQuotedString(fields[9]) || 0),
      news_score: Number(parseQuotedString(fields[10]) || 0),
      source_urls: parseSqlArray(fields[12]),
      first_detected_at: parseQuotedString(fields[13]),
      last_updated_at: parseQuotedString(fields[14]),
      snapshot_date: '2026-04-24',
    };
  }).filter(Boolean);
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

async function loadDimensionMaps(client) {
  const countries = await client.query('SELECT id, code FROM countries');
  const categories = await client.query('SELECT id, slug FROM categories');

  return {
    countryIdToCode: Object.fromEntries(countries.rows.map((row) => [row.id, row.code])),
    countryCodeToId: Object.fromEntries(countries.rows.map((row) => [row.code, row.id])),
    categoryIdToSlug: Object.fromEntries(categories.rows.map((row) => [row.id, row.slug])),
    categorySlugToId: Object.fromEntries(categories.rows.map((row) => [row.slug, row.id])),
  };
}

async function loadCurrentFocusSnapshot(client, snapshotDate) {
  const { rows } = await client.query(`
    SELECT
      c.code AS country_code,
      cat.slug AS category_slug,
      t.name,
      t.name_local,
      t.description,
      t.heat_score,
      t.search_score,
      t.social_score,
      t.ecommerce_score,
      t.news_score,
      t.source_urls,
      t.first_detected_at,
      t.last_updated_at
    FROM trends t
    JOIN countries c ON c.id = t.country_id
    JOIN categories cat ON cat.id = t.category_id
    WHERE 'focus-market-verified-refresh' = ANY(t.tags)
      AND $1 = ANY(t.tags)
    ORDER BY c.code, cat.slug, t.name
  `, [snapshotDate]);

  return rows.map((row) => ({ ...row, snapshot_date: snapshotDate }));
}

async function deleteHistoryRange(client, rangeStart, rangeEnd) {
  await client.query(`
    DELETE FROM trend_history th
    USING trends t
    WHERE th.trend_id = t.id
      AND th.recorded_at >= $1::timestamptz
      AND th.recorded_at < ($2::date + INTERVAL '1 day')
  `, [`${rangeStart}T00:00:00+09:00`, rangeEnd]);
}

async function ensureTrendRow(client, row, countryCodeToId, categorySlugToId, sourceBatchDate) {
  const countryId = countryCodeToId[row.country_code];
  const categoryId = categorySlugToId[row.category_slug];
  if (!countryId || !categoryId) return null;

  const existing = await client.query(`
    SELECT id
    FROM trends
    WHERE country_id = $1
      AND category_id = $2
      AND name = $3
    LIMIT 1
  `, [countryId, categoryId, row.name]);
  if (existing.rowCount > 0) return existing.rows[0].id;

  const inserted = await client.query(`
    INSERT INTO trends (
      country_id, category_id, name, name_local, description, heat_score, heat_status,
      search_score, social_score, ecommerce_score, news_score, tags, source_urls,
      first_detected_at, last_updated_at
    )
    VALUES (
      $1, $2, $3, $4, $5, $6, 'rising', $7, $8, $9, $10, $11::text[], $12::text[],
      $13::timestamptz, $14::timestamptz
    )
    RETURNING id
  `, [
    countryId,
    categoryId,
    row.name,
    row.name_local,
    row.description,
    row.heat_score,
    row.search_score,
    row.social_score,
    row.ecommerce_score,
    row.news_score,
    [
      'historical-snapshot',
      'focus-market-history-source',
      sourceBatchDate,
      row.country_code.toLowerCase(),
      row.category_slug,
    ],
    row.source_urls || [],
    row.first_detected_at,
    row.last_updated_at,
  ]);

  return inserted.rows[0]?.id || null;
}

async function upsertHistoryRows(client, rows, recordedDate, sourceBatchDate, sourceMode, countryCodeToId, categorySlugToId) {
  let written = 0;
  const recordedAt = `${recordedDate}T00:00:00+09:00`;

  for (const row of rows) {
    const trendId = await ensureTrendRow(client, row, countryCodeToId, categorySlugToId, sourceBatchDate);
    if (!trendId) continue;

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
      trendId,
      recordedAt,
      row.heat_score,
      row.search_score,
      row.social_score,
      row.ecommerce_score,
      row.news_score,
      sourceBatchDate,
      sourceMode,
    ]);
    if (result.rowCount > 0) written += 1;
  }

  return written;
}

function loadJsonFile(filePath, fallback) {
  if (!fs.existsSync(filePath)) return fallback;
  return JSON.parse(fs.readFileSync(filePath, 'utf8'));
}

async function main() {
  const env = loadEnv();
  const databaseUrl = process.env.DATABASE_URL ?? env.DATABASE_URL;
  if (!databaseUrl) throw new Error('DATABASE_URL is missing.');

  const client = new Client({ connectionString: databaseUrl });
  await client.connect();
  await ensureHistorySchema(client);

  const dimensions = await loadDimensionMaps(client);
  const current603Rows = await loadCurrentFocusSnapshot(client, '2026-06-03');

  const verified430Payload = loadJsonFile(SNAPSHOT_430_JSON, { verified: [] });
  const verified430Rows = ensureArray(verified430Payload.verified).map((row) => mapVerifiedJsonRow(row, '2026-04-30'));
  const verified430Map = buildRowMap(verified430Rows);

  const sql424Rows = SNAPSHOT_424_SQL_FILES.flatMap((filePath) =>
    loadSqlSnapshotRows(filePath, dimensions.countryIdToCode, dimensions.categoryIdToSlug)
  );
  const sql424Map = buildRowMap(sql424Rows);

  const current603Map = buildRowMap(current603Rows);

  const carry511Payload = loadJsonFile(SNAPSHOT_511_CARRY_JSON, { carried_rows: [] });
  const verified511Payload = loadJsonFile(SNAPSHOT_511_VERIFIED_JSON, { verified: [] });
  const verified511Rows = ensureArray(verified511Payload.verified).map((row) => mapVerifiedJsonRow(row, '2026-05-11'));
  const verified511Map = buildRowMap(verified511Rows);

  const reconstructed511 = [];
  const missingRows = [];

  for (const item of ensureArray(carry511Payload.carried_rows)) {
    const key = buildKey(item.country_code, item.category, item.name);
    const sourceRow =
      verified430Map.get(key) ||
      sql424Map.get(key) ||
      current603Map.get(key) ||
      verified511Map.get(key);

    if (!sourceRow) {
      missingRows.push(item);
      continue;
    }

    reconstructed511.push({
      ...sourceRow,
      snapshot_date: '2026-05-11',
    });
  }

  for (const row of verified511Rows) {
    reconstructed511.push(row);
  }

  const snapshot511Rows = [...new Map(
    reconstructed511.map((row) => [buildKey(row.country_code, row.category_slug, row.name), row])
  ).values()];

  const dates = enumerateDates(startDate, endDate);
  const assignments = dates.map((date) => (
    date === '2026-06-03'
      ? { recorded_date: date, source_batch_date: '2026-06-03', source_mode: 'snapshot-direct', row_count: current603Rows.length }
      : { recorded_date: date, source_batch_date: '2026-05-11', source_mode: date === '2026-05-11' ? 'snapshot-direct' : 'snapshot-carry-forward', row_count: snapshot511Rows.length }
  ));

  let historyPointsWritten = 0;
  if (applyToDb) {
    if (replaceRange) {
      await deleteHistoryRange(client, startDate, endDate);
    }

    for (const assignment of assignments) {
      const sourceRows = assignment.source_batch_date === '2026-06-03' ? current603Rows : snapshot511Rows;
      historyPointsWritten += await upsertHistoryRows(
        client,
        sourceRows,
        assignment.recorded_date,
        assignment.source_batch_date,
        assignment.source_mode,
        dimensions.countryCodeToId,
        dimensions.categorySlugToId
      );
    }
  }

  const historyCheck = await client.query(`
    SELECT
      source_batch_date,
      COUNT(*)::int AS count
    FROM trend_history
    WHERE recorded_at >= $1::timestamptz
      AND recorded_at < ($2::date + INTERVAL '1 day')
    GROUP BY source_batch_date
    ORDER BY source_batch_date
  `, [`${startDate}T00:00:00+09:00`, endDate]);

  await client.end();

  const payload = {
    batch_date: batchDate,
    start_date: startDate,
    end_date: endDate,
    replace_range: replaceRange,
    applied: applyToDb,
    snapshot_511_row_count: snapshot511Rows.length,
    snapshot_603_row_count: current603Rows.length,
    history_points_written: historyPointsWritten,
    date_sources: assignments,
    history_counts_by_source_batch: historyCheck.rows,
    missing_rows: missingRows,
  };

  fs.mkdirSync(outputDir, { recursive: true });
  fs.writeFileSync(outputJson, `${JSON.stringify(payload, null, 2)}\n`, 'utf8');

  const lines = [
    `# Focus 25 Trend History Rebuilt ${startDate} to ${endDate}`,
    '',
    `- Replaced range first: ${replaceRange}`,
    `- Applied to DB: ${applyToDb}`,
    `- Reconstructed 2026-05-11 rows: ${snapshot511Rows.length}`,
    `- Current 2026-06-03 rows: ${current603Rows.length}`,
    `- History points written: ${historyPointsWritten}`,
    '',
    '## Date Sources',
    ...assignments.map((row) => `- ${row.recorded_date}: ${row.source_batch_date} (${row.source_mode}, ${row.row_count})`),
    '',
    '## History Counts By Source Batch',
    ...historyCheck.rows.map((row) => `- ${row.source_batch_date}: ${row.count}`),
    '',
    missingRows.length > 0 ? '## Missing Rows' : '## Missing Rows\n- none',
    ...missingRows.map((row) => `- ${row.country_code} / ${row.category} / ${row.name} / ${row.carry_from_date}`),
    '',
  ];

  fs.writeFileSync(outputMd, `${lines.join('\n')}\n`, 'utf8');

  console.log(`JSON: ${path.relative(rootDir, outputJson)}`);
  console.log(`MD: ${path.relative(rootDir, outputMd)}`);
  console.log(`snapshot_511_rows: ${snapshot511Rows.length}, snapshot_603_rows: ${current603Rows.length}, history_points_written: ${historyPointsWritten}, missing_rows: ${missingRows.length}`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
