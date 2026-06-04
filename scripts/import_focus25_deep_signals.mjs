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

const WINDOW_DATE = process.env.WINDOW_DATE ?? defaultWindowDate();
const WINDOW_AT = `${WINDOW_DATE}T00:00:00+09:00`;
const APPLY = process.argv.includes('--apply');

function readArg(name, fallback = '') {
  const match = process.argv.find((arg) => arg.startsWith(`--${name}=`));
  return match ? match.split('=').slice(1).join('=').trim() : fallback;
}

const INPUT_JSON = path.resolve(
  rootDir,
  readArg('input-json', path.join('scripts', 'output', `focus25_deep_${WINDOW_DATE}.json`)),
);
const SOURCE_FAMILY = readArg('source-family', 'google-trends-related-query');
const OUTPUT_JSON = path.join(outputDir, `focus25_deep_signals_${WINDOW_DATE}.json`);
const OUTPUT_MD = path.join(outputDir, `focus25_deep_signals_${WINDOW_DATE}.md`);

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
      }),
  );
}

function normalizeKey(value) {
  return String(value || '')
    .normalize('NFKC')
    .toLowerCase()
    .replace(/\s+/g, ' ')
    .trim();
}

function mapCategory(category) {
  return category === 'challenges' ? 'challenge' : category;
}

function buildSourceUrl(countryCode, query) {
  return `https://trends.google.com/trends/explore?geo=${encodeURIComponent(countryCode)}&date=now%207-d&q=${encodeURIComponent(query)}`;
}

function readSignals() {
  if (!fs.existsSync(INPUT_JSON)) {
    throw new Error(`Input JSON not found: ${INPUT_JSON}`);
  }

  const payload = JSON.parse(fs.readFileSync(INPUT_JSON, 'utf8'));
  const rows = [];

  for (const [countryCode, items] of Object.entries(payload)) {
    const seen = new Set();
    for (const [index, item] of (items || []).entries()) {
      const query = String(item.query || '').trim();
      if (!query) continue;

      const dedupeKey = `${countryCode}:${normalizeKey(query)}`;
      if (seen.has(dedupeKey)) continue;
      seen.add(dedupeKey);

      const sourceUrl = buildSourceUrl(countryCode, query);
      rows.push({
        country_code: countryCode,
        source_family: SOURCE_FAMILY,
        source_name: `Google Trends ${item.query_type || 'related'} / ${item.source || 'mixed'}`.slice(0, 120),
        category_slug: mapCategory(String(item.category || 'products')),
        raw_title: query,
        canonical_name: query,
        metric_label: item.query_type === 'top' ? 'top_score' : 'rising_score',
        metric_value: String(item.raw_value ?? item.value ?? ''),
        rank: index + 1,
        source_url: sourceUrl,
        evidence_urls: [sourceUrl],
        payload: {
          value: item.value ?? null,
          raw_value: item.raw_value ?? null,
          query_type: item.query_type ?? null,
          source: item.source ?? null,
          explicit_category: Boolean(item.explicit_category),
          imported_from: path.relative(rootDir, INPUT_JSON),
        },
      });
    }
  }

  return rows;
}

async function ensureSignalsSchema(client) {
  await client.query('CREATE EXTENSION IF NOT EXISTS "uuid-ossp"');
  await client.query(`
    CREATE TABLE IF NOT EXISTS global_trend_signals (
      id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
      country_id UUID REFERENCES countries(id) ON DELETE CASCADE,
      country_code VARCHAR(2) NOT NULL,
      source_family VARCHAR(40) NOT NULL,
      source_name VARCHAR(120) NOT NULL,
      category_slug VARCHAR(30),
      raw_title TEXT NOT NULL,
      canonical_name TEXT NOT NULL,
      metric_label TEXT,
      metric_value TEXT,
      rank INTEGER,
      source_url TEXT,
      evidence_urls TEXT[] DEFAULT '{}',
      payload JSONB DEFAULT '{}'::jsonb,
      collected_at TIMESTAMPTZ NOT NULL,
      window_date DATE NOT NULL,
      created_at TIMESTAMPTZ DEFAULT NOW(),
      UNIQUE (country_code, source_family, canonical_name, window_date, source_url)
    )
  `);
  await client.query('CREATE INDEX IF NOT EXISTS idx_global_trend_signals_country ON global_trend_signals(country_code)');
  await client.query('CREATE INDEX IF NOT EXISTS idx_global_trend_signals_window ON global_trend_signals(window_date DESC)');
  await client.query('CREATE INDEX IF NOT EXISTS idx_global_trend_signals_source ON global_trend_signals(source_family)');
}

async function applySignals(signals, databaseUrl) {
  const client = new Client({ connectionString: databaseUrl });
  await client.connect();
  await ensureSignalsSchema(client);

  const countryRows = await client.query('SELECT id, code FROM countries');
  const countryIds = Object.fromEntries(countryRows.rows.map((row) => [row.code, row.id]));
  const countryCodes = [...new Set(signals.map((signal) => signal.country_code))];

  await client.query(
    `
      DELETE FROM global_trend_signals
      WHERE window_date = $1::date
        AND source_family = $2
        AND country_code = ANY($3::text[])
    `,
    [WINDOW_DATE, SOURCE_FAMILY, countryCodes],
  );

  for (const signal of signals) {
    await client.query(
      `
        INSERT INTO global_trend_signals (
          country_id, country_code, source_family, source_name, category_slug, raw_title,
          canonical_name, metric_label, metric_value, rank, source_url, evidence_urls,
          payload, collected_at, window_date
        )
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13::jsonb, $14::timestamptz, $15::date)
        ON CONFLICT (country_code, source_family, canonical_name, window_date, source_url) DO UPDATE SET
          source_name = EXCLUDED.source_name,
          category_slug = EXCLUDED.category_slug,
          metric_label = EXCLUDED.metric_label,
          metric_value = EXCLUDED.metric_value,
          rank = EXCLUDED.rank,
          evidence_urls = EXCLUDED.evidence_urls,
          payload = EXCLUDED.payload,
          collected_at = EXCLUDED.collected_at
      `,
      [
        countryIds[signal.country_code] ?? null,
        signal.country_code,
        signal.source_family,
        signal.source_name,
        signal.category_slug,
        signal.raw_title,
        signal.canonical_name,
        signal.metric_label,
        signal.metric_value,
        signal.rank,
        signal.source_url,
        signal.evidence_urls,
        JSON.stringify(signal.payload || {}),
        WINDOW_AT,
        WINDOW_DATE,
      ],
    );
  }

  await client.end();
}

function writeSummary(signals) {
  fs.mkdirSync(outputDir, { recursive: true });

  const byCountry = signals.reduce((acc, signal) => {
    acc[signal.country_code] = (acc[signal.country_code] || 0) + 1;
    return acc;
  }, {});

  const payload = {
    generated_at: new Date().toISOString(),
    window_date: WINDOW_DATE,
    source_family: SOURCE_FAMILY,
    input_json: path.relative(rootDir, INPUT_JSON),
    total_signals: signals.length,
    countries: byCountry,
    applied: APPLY,
  };

  fs.writeFileSync(OUTPUT_JSON, `${JSON.stringify(payload, null, 2)}\n`, 'utf8');

  const lines = [
    `# Focus 25 Deep Signals ${WINDOW_DATE}`,
    '',
    `- Input: ${path.relative(rootDir, INPUT_JSON)}`,
    `- Source family: ${SOURCE_FAMILY}`,
    `- Total signals: ${signals.length}`,
    `- Countries covered: ${Object.keys(byCountry).length}`,
    `- Applied: ${APPLY}`,
    '',
    '## Count by country',
    ...Object.entries(byCountry)
      .sort((a, b) => a[0].localeCompare(b[0]))
      .map(([code, count]) => `- ${code}: ${count}`),
    '',
  ];

  fs.writeFileSync(OUTPUT_MD, `${lines.join('\n')}\n`, 'utf8');
}

async function main() {
  const signals = readSignals();
  const env = loadEnv();
  const databaseUrl = process.env.DATABASE_URL ?? env.DATABASE_URL;

  if (APPLY) {
    if (!databaseUrl) {
      throw new Error('DATABASE_URL is missing.');
    }
    await applySignals(signals, databaseUrl);
  }

  writeSummary(signals);
  console.log(`JSON: ${path.relative(rootDir, OUTPUT_JSON)}`);
  console.log(`MD: ${path.relative(rootDir, OUTPUT_MD)}`);
  console.log(`signals: ${signals.length}, applied: ${APPLY}`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
