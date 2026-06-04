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
const args = new Set(process.argv.slice(2));
const applyToDb = args.has('--apply');

function readArg(name, fallback = '') {
  const match = process.argv.find((arg) => arg.startsWith(`--${name}=`));
  return match ? match.split('=').slice(1).join('=').trim() : fallback;
}

const inputJson = path.resolve(rootDir, readArg('input-json', path.join('scripts', 'output', `focus25_real_trends_${WINDOW_DATE}.json`)));
const outputJson = path.join(outputDir, `focus25_support_signals_${WINDOW_DATE}.json`);
const outputMd = path.join(outputDir, `focus25_support_signals_${WINDOW_DATE}.md`);
const requestedCountries = readArg('countries')
  .split(',')
  .map((code) => code.trim().toUpperCase())
  .filter(Boolean);
const requestedQueries = readArg('queries')
  .split(',')
  .map((query) => query.trim().toLowerCase())
  .filter(Boolean);

const COUNTRY_LOCALES = {
  KR: { gl: 'kr', hl: 'ko' },
  JP: { gl: 'jp', hl: 'ja' },
  US: { gl: 'us', hl: 'en' },
  CN: { gl: 'cn', hl: 'zh-cn' },
  GB: { gl: 'uk', hl: 'en-gb' },
  BR: { gl: 'br', hl: 'pt-br' },
  MX: { gl: 'mx', hl: 'es-419' },
  ID: { gl: 'id', hl: 'id' },
  TH: { gl: 'th', hl: 'th' },
  VN: { gl: 'vn', hl: 'vi' },
  PH: { gl: 'ph', hl: 'en' },
  SG: { gl: 'sg', hl: 'en-sg' },
  TW: { gl: 'tw', hl: 'zh-tw' },
  HK: { gl: 'hk', hl: 'zh-tw' },
  FR: { gl: 'fr', hl: 'fr' },
  DE: { gl: 'de', hl: 'de' },
  IT: { gl: 'it', hl: 'it' },
  ES: { gl: 'es', hl: 'es' },
  CA: { gl: 'ca', hl: 'en-ca' },
  AU: { gl: 'au', hl: 'en-au' },
  IN: { gl: 'in', hl: 'en-in' },
  MY: { gl: 'my', hl: 'ms' },
  AE: { gl: 'ae', hl: 'ar' },
  SA: { gl: 'sa', hl: 'ar' },
  TR: { gl: 'tr', hl: 'tr' },
};

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

function uniq(items) {
  return [...new Set(items.filter(Boolean))];
}

function normalizeKey(value) {
  return String(value || '')
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/^#/, '')
    .replace(/&/g, ' and ')
    .replace(/[^\p{L}\p{N}\s]+/gu, ' ')
    .split(/\s+/)
    .filter((token) => token.length >= 2)
    .slice(0, 6)
    .join(' ')
    .trim();
}

function readCandidates() {
  if (!fs.existsSync(inputJson)) throw new Error(`Input JSON not found: ${inputJson}`);
  const payload = JSON.parse(fs.readFileSync(inputJson, 'utf8'));
  const candidates = [];

  for (const [countryCode, items] of Object.entries(payload)) {
    for (const item of items || []) {
      const query = String(item.query || '').trim();
      if (!query) continue;
      candidates.push({
        country_code: countryCode,
        category: item.category || 'brands',
        query,
      });
    }
  }

  const seen = new Set();
  return candidates.filter((item) => {
    if (requestedCountries.length > 0 && !requestedCountries.includes(item.country_code)) return false;
    if (requestedQueries.length > 0 && !requestedQueries.includes(item.query.toLowerCase())) return false;
    const key = `${item.country_code}:${normalizeKey(item.query)}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

async function serpApiFetch(apiKey, params) {
  const query = new URLSearchParams({ ...params, api_key: apiKey });
  const url = `https://serpapi.com/search.json?${query.toString()}`;
  const response = await fetch(url, { headers: { accept: 'application/json' } });
  const payload = await response.json();
  return { url, status: response.status, payload };
}

function buildOrganicSignal(candidate, family, response) {
  const results = Array.isArray(response.payload?.organic_results) ? response.payload.organic_results : [];
  const picked = results.find((item) => item?.link && item?.title);
  if (!picked) return null;

  return {
    country_code: candidate.country_code,
    source_family: family,
    source_name: family === 'instagram' ? 'Instagram site search' : 'Pinterest site search',
    category_slug: candidate.category,
    raw_title: candidate.query,
    canonical_name: candidate.query,
    metric_label: 'organic_rank',
    metric_value: String(picked.position || 1),
    rank: Number(picked.position || 1),
    source_url: picked.link,
    evidence_urls: [picked.link],
    payload: {
      title: picked.title || '',
      snippet: picked.snippet || '',
      source: picked.source || '',
      query_url: response.url,
    },
  };
}

function buildRetailerSignal(candidate, response) {
  const results = Array.isArray(response.payload?.shopping_results) ? response.payload.shopping_results : [];
  const picked = results.find((item) => item?.link && item?.title);
  if (!picked) return null;

  return {
    country_code: candidate.country_code,
    source_family: 'retailer',
    source_name: picked.source || 'Google Shopping',
    category_slug: candidate.category,
    raw_title: candidate.query,
    canonical_name: candidate.query,
    metric_label: 'shopping_rank',
    metric_value: '1',
    rank: 1,
    source_url: picked.link,
    evidence_urls: [picked.link],
    payload: {
      title: picked.title || '',
      price: picked.price || '',
      source: picked.source || '',
      thumbnail: picked.thumbnail || '',
      query_url: response.url,
    },
  };
}

async function collectCandidateSupport(apiKey, candidate) {
  const locale = COUNTRY_LOCALES[candidate.country_code] || { gl: candidate.country_code.toLowerCase(), hl: 'en' };
  const signals = [];

  const instagramResponse = await serpApiFetch(apiKey, {
    engine: 'google',
    q: `"${candidate.query}" site:instagram.com`,
    gl: locale.gl,
    hl: locale.hl,
    num: '5',
    tbs: 'qdr:w',
  });
  const instagramSignal = buildOrganicSignal(candidate, 'instagram', instagramResponse);
  if (instagramSignal) signals.push(instagramSignal);

  const pinterestResponse = await serpApiFetch(apiKey, {
    engine: 'google',
    q: `"${candidate.query}" site:pinterest.com`,
    gl: locale.gl,
    hl: locale.hl,
    num: '5',
    tbs: 'qdr:w',
  });
  const pinterestSignal = buildOrganicSignal(candidate, 'pinterest', pinterestResponse);
  if (pinterestSignal) signals.push(pinterestSignal);

  const retailerResponse = await serpApiFetch(apiKey, {
    engine: 'google_shopping',
    q: candidate.query,
    gl: locale.gl,
    hl: locale.hl,
    num: '5',
  });
  const retailerSignal = buildRetailerSignal(candidate, retailerResponse);
  if (retailerSignal) signals.push(retailerSignal);

  return signals;
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
}

async function applySignals(signals, databaseUrl) {
  const client = new Client({ connectionString: databaseUrl });
  await client.connect();
  await ensureSignalsSchema(client);
  const countryRows = await client.query('SELECT id, code FROM countries');
  const countryIds = Object.fromEntries(countryRows.rows.map((row) => [row.code, row.id]));

  for (const signal of signals) {
    await client.query(`
      INSERT INTO global_trend_signals (
        country_id, country_code, source_family, source_name, category_slug, raw_title,
        canonical_name, metric_label, metric_value, rank, source_url, evidence_urls,
        payload, collected_at, window_date
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13::jsonb, $14::timestamptz, $15::date)
      ON CONFLICT (country_code, source_family, canonical_name, window_date, source_url) DO UPDATE SET
        category_slug = EXCLUDED.category_slug,
        metric_label = EXCLUDED.metric_label,
        metric_value = EXCLUDED.metric_value,
        rank = EXCLUDED.rank,
        evidence_urls = EXCLUDED.evidence_urls,
        payload = EXCLUDED.payload,
        collected_at = EXCLUDED.collected_at
    `, [
      countryIds[signal.country_code],
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
    ]);
  }

  await client.end();
}

function writeSummary(payload) {
  fs.mkdirSync(outputDir, { recursive: true });
  fs.writeFileSync(outputJson, `${JSON.stringify(payload, null, 2)}\n`, 'utf8');

  const counts = payload.signals.reduce((acc, signal) => {
    acc[signal.source_family] = (acc[signal.source_family] || 0) + 1;
    return acc;
  }, {});

  const lines = [
    `# Focus 25 Support Signals ${WINDOW_DATE}`,
    '',
    `- Candidates scanned: ${payload.candidates_scanned}`,
    `- Support signals collected: ${payload.signals.length}`,
    ...Object.entries(counts).map(([family, count]) => `- ${family}: ${count}`),
    '',
    '## Sample',
    ...payload.signals.slice(0, 30).map((signal, index) => `${index + 1}. ${signal.country_code} / ${signal.source_family} / ${signal.canonical_name}`),
    '',
  ];

  fs.writeFileSync(outputMd, `${lines.join('\n')}\n`, 'utf8');
}

async function main() {
  const env = loadEnv();
  const apiKey = process.env.SERPAPI_KEY ?? env.SERPAPI_KEY;
  if (!apiKey) throw new Error('SERPAPI_KEY is missing.');

  const candidates = readCandidates();
  const signals = [];

  for (const candidate of candidates) {
    const result = await collectCandidateSupport(apiKey, candidate);
    signals.push(...result);
    console.log(`${candidate.country_code} / ${candidate.query}: ${result.map((item) => item.source_family).join(', ') || 'none'}`);
  }

  const databaseUrl = process.env.DATABASE_URL ?? env.DATABASE_URL;
  if (applyToDb) {
    if (!databaseUrl) throw new Error('DATABASE_URL is missing.');
    await applySignals(signals, databaseUrl);
  }

  const payload = {
    generated_at: new Date().toISOString(),
    window_date: WINDOW_DATE,
    candidates_scanned: candidates.length,
    applied: applyToDb,
    signals,
  };

  writeSummary(payload);
  console.log(`JSON: ${path.relative(rootDir, outputJson)}`);
  console.log(`MD: ${path.relative(rootDir, outputMd)}`);
  console.log(`signals: ${signals.length}, applied: ${applyToDb}`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
