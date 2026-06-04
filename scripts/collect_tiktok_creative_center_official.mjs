import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import pg from 'pg';
import { chromium } from 'playwright';

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
const headed = args.has('--headed');

function readArg(name, fallback) {
  const match = process.argv.find((arg) => arg.startsWith(`--${name}=`));
  return match ? match.split('=').slice(1).join('=') : fallback;
}

const countries = readArg('countries', 'KR').split(',').map((code) => code.trim().toUpperCase()).filter(Boolean);
const period = Number(readArg('period', '7'));
const profileDir = path.resolve(rootDir, readArg('profile', path.join('.cache', 'tiktok-creative-center')));
const waitMs = Number(readArg('wait-ms', '7000'));

const outputJson = path.join(outputDir, `tiktok_creative_center_official_${WINDOW_DATE}.json`);
const outputMd = path.join(outputDir, `tiktok_creative_center_official_${WINDOW_DATE}.md`);

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

function queryParam(url, name) {
  try {
    return new URL(url).searchParams.get(name);
  } catch {
    return null;
  }
}

function normalizeIndustry(industry = '') {
  const q = String(industry).toLowerCase();
  if (q.includes('food') || q.includes('beverage')) return 'food';
  if (q.includes('apparel') || q.includes('accessor') || q.includes('beauty') || q.includes('personal care')) return 'fashion';
  if (q.includes('electronic') || q.includes('home') || q.includes('health') || q.includes('toy')) return 'products';
  if (q.includes('news') || q.includes('entertainment') || q.includes('game') || q.includes('sport')) return 'challenge';
  return 'challenge';
}

function normalizeProductCategory(item = {}) {
  const category = [
    item.first_ecom_category?.value,
    item.second_ecom_category?.value,
    item.third_ecom_category?.value,
    item.url_title,
  ].filter(Boolean).join(' ').toLowerCase();

  if (category.includes('food') || category.includes('beverage')) return 'food';
  if (category.includes('wear') || category.includes('fashion') || category.includes('beauty') || category.includes('makeup') || category.includes('perfume')) return 'fashion';
  return 'products';
}

function normalizeHashtag(item) {
  return {
    rank: item.rank,
    hashtag: item.hashtag_name,
    industry: item.industry_info?.value || item.industry_info?.label || '',
    publish_count: Number(item.publish_cnt || 0),
    video_views: Number(item.video_views || 0),
    rank_diff: item.rank_diff,
    rank_diff_type: item.rank_diff_type,
    tiktok_url: item.hashtag_name ? `https://www.tiktok.com/tag/${encodeURIComponent(item.hashtag_name)}` : '',
    raw: item,
  };
}

function normalizeSound(item) {
  return {
    rank: item.rank,
    title: item.title || item.sound_title || item.track || item.music_title || item.name || 'Unknown',
    author: item.author || item.artist || item.creator || '',
    rank_diff: item.rank_diff,
    rank_diff_type: item.rank_diff_type,
    tiktok_url: item.link || item.url || '',
    raw: item,
  };
}

function normalizeProduct(item, index) {
  const category = item.third_ecom_category?.value || item.second_ecom_category?.value || item.first_ecom_category?.value || item.url_title || 'Product';
  return {
    rank: index + 1,
    name: category,
    post: Number(item.post || 0),
    post_change: Number(item.post_change || 0),
    impression: Number(item.impression || 0),
    ctr: Number(item.ctr || 0),
    cvr: Number(item.cvr || 0),
    cpa: Number(item.cpa || 0),
    cost: Number(item.cost || 0),
    categories: [
      item.first_ecom_category?.value,
      item.second_ecom_category?.value,
      item.third_ecom_category?.value,
    ].filter(Boolean),
    raw: item,
  };
}

function listFromPayload(payload, type) {
  const data = payload?.data?.list || payload?.data?.data?.list || [];
  if (!Array.isArray(data)) return [];
  if (type === 'hashtag') return data.map(normalizeHashtag).filter((item) => item.hashtag);
  if (type === 'sound') return data.map(normalizeSound).filter((item) => item.title);
  return data.map(normalizeProduct).filter((item) => item.name);
}

async function capturePage(page, country, type) {
  const captures = [];
  const endpointMarker = {
    hashtag: '/popular_trend/hashtag/list',
    sound: '/popular_trend/sound/rank_list',
    product: '/product/list',
  }[type];
  const url = {
    hashtag: `https://ads.tiktok.com/business/creativecenter/inspiration/popular/hashtag/pc/en?countryCode=${country}&period=${period}`,
    sound: `https://ads.tiktok.com/business/creativecenter/inspiration/popular/music/pc/en?countryCode=${country}&period=${period}`,
    product: `https://ads.tiktok.com/business/creativecenter/top-products/pc/en?countryCode=${country}&period=${period}`,
  }[type];

  const handler = async (response) => {
    const responseUrl = response.url();
    if (!responseUrl.includes(endpointMarker)) return;
    try {
      const text = await response.text();
      const payload = JSON.parse(text);
      const actualCountry = queryParam(responseUrl, 'country_code') || queryParam(responseUrl, 'countryCode');
      captures.push({
        type,
        requested_country: country,
        actual_country: actualCountry,
        trusted_country_match: actualCountry === country,
        status: response.status(),
        url: responseUrl,
        payload,
        items: listFromPayload(payload, type),
      });
    } catch (error) {
      captures.push({
        type,
        requested_country: country,
        actual_country: null,
        trusted_country_match: false,
        status: response.status(),
        url: responseUrl,
        error: error.message,
        items: [],
      });
    }
  };

  page.on('response', handler);
  await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 60000 }).catch(() => {});
  await page.waitForTimeout(waitMs);
  page.off('response', handler);

  return captures;
}

function toSignals(capture) {
  if (!capture.trusted_country_match || capture.status !== 200) return [];
  const capturedAt = new Date().toISOString();

  if (capture.type === 'hashtag') {
    return capture.items.map((item) => ({
      country_code: capture.requested_country,
      source_family: 'tiktok-official-hashtag',
      source_name: 'TikTok Creative Center Hashtags',
      category_slug: normalizeIndustry(item.industry),
      raw_title: item.hashtag,
      canonical_name: `#${item.hashtag}`,
      metric_label: 'video_views',
      metric_value: String(item.video_views || ''),
      rank: item.rank || null,
      source_url: item.tiktok_url || capture.url,
      evidence_urls: [item.tiktok_url || capture.url],
      payload: { ...item, captured_at: capturedAt, api_url: capture.url },
    }));
  }

  if (capture.type === 'sound') {
    return capture.items.map((item) => ({
      country_code: capture.requested_country,
      source_family: 'tiktok-official-song',
      source_name: 'TikTok Creative Center Songs',
      category_slug: 'challenge',
      raw_title: item.author ? `${item.title} - ${item.author}` : item.title,
      canonical_name: item.author ? `${item.title} - ${item.author}` : item.title,
      metric_label: 'rank',
      metric_value: String(item.rank || ''),
      rank: item.rank || null,
      source_url: item.tiktok_url || capture.url,
      evidence_urls: [item.tiktok_url || capture.url],
      payload: { ...item, captured_at: capturedAt, api_url: capture.url },
    }));
  }

  return capture.items.map((item) => ({
    country_code: capture.requested_country,
    source_family: 'tiktok-official-product',
    source_name: 'TikTok Creative Center Top Products',
    category_slug: normalizeProductCategory(item.raw),
    raw_title: item.name,
    canonical_name: item.name,
    metric_label: 'posts_7d',
    metric_value: String(item.post || ''),
    rank: item.rank || null,
    source_url: capture.url,
    evidence_urls: [capture.url],
    payload: { ...item, captured_at: capturedAt, api_url: capture.url },
  }));
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

async function applySignals(signals) {
  const env = loadEnv();
  const databaseUrl = process.env.DATABASE_URL ?? env.DATABASE_URL;
  if (!databaseUrl) throw new Error('DATABASE_URL is missing.');

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

  const lines = [
    `# TikTok Creative Center Official ${WINDOW_DATE}`,
    '',
    '- Source: TikTok Creative Center official web/API responses captured through Playwright.',
    '- Use this as TikTok evidence only when requested_country equals actual_country.',
    '- If the site falls back to the local/default country, the capture is kept in the report but not inserted as trusted evidence.',
    `- Countries requested: ${payload.countries_requested.join(', ')}`,
    `- Trusted signals: ${payload.signals.length}`,
    `- Mismatched captures: ${payload.mismatched_captures.length}`,
    '',
    '## Trusted Signal Sample',
    ...payload.signals.slice(0, 30).map((signal, index) => `${index + 1}. ${signal.country_code} / ${signal.source_family} / ${signal.canonical_name} / ${signal.metric_label}: ${signal.metric_value}`),
    '',
    '## Mismatches',
    ...payload.mismatched_captures.slice(0, 30).map((capture) => `- requested ${capture.requested_country}, actual ${capture.actual_country || 'unknown'}, type ${capture.type}`),
    '',
  ];
  fs.writeFileSync(outputMd, `${lines.join('\n')}\n`, 'utf8');
}

async function main() {
  fs.mkdirSync(outputDir, { recursive: true });
  fs.mkdirSync(profileDir, { recursive: true });

  const context = await chromium.launchPersistentContext(profileDir, {
    headless: !headed,
    viewport: { width: 1440, height: 1000 },
  });
  const page = context.pages()[0] || await context.newPage();

  const captures = [];
  for (const country of countries) {
    for (const type of ['hashtag', 'sound', 'product']) {
      const result = await capturePage(page, country, type);
      captures.push(...result);
      console.log(`${country} ${type}: ${result.map((entry) => `${entry.items.length}/${entry.actual_country || '?'}`).join(', ') || 'no capture'}`);
    }
  }

  await context.close();

  const signals = captures.flatMap(toSignals);
  if (applyToDb) await applySignals(signals);

  const payload = {
    generated_at: new Date().toISOString(),
    window_date: WINDOW_DATE,
    countries_requested: countries,
    period,
    applied: applyToDb,
    captures,
    mismatched_captures: captures.filter((capture) => !capture.trusted_country_match),
    signals,
  };

  writeSummary(payload);
  console.log(`JSON: ${path.relative(rootDir, outputJson)}`);
  console.log(`MD: ${path.relative(rootDir, outputMd)}`);
  console.log(`trusted_signals: ${signals.length}, applied: ${applyToDb}`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
