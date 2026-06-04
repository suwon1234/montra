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
const WINDOW_END_AT = `${WINDOW_DATE}T23:59:59+09:00`;
const args = new Set(process.argv.slice(2));
const applyToDb = args.has('--apply');

function readArg(name, fallback = '') {
  const match = process.argv.find((arg) => arg.startsWith(`--${name}=`));
  return match ? match.split('=').slice(1).join('=').trim() : fallback;
}

const inputJson = path.resolve(rootDir, readArg('input-json', path.join('scripts', 'output', `focus25_real_trends_${WINDOW_DATE}.json`)));
const outputJson = path.join(outputDir, `verified_focus_market_trends_${WINDOW_DATE}.json`);
const outputMd = path.join(outputDir, `verified_focus_market_trends_${WINDOW_DATE}.md`);

const COUNTRY_LOCALES = {
  KR: { gl: 'KR', hl: 'ko', ceid: 'KR:ko' },
  JP: { gl: 'JP', hl: 'ja', ceid: 'JP:ja' },
  US: { gl: 'US', hl: 'en-US', ceid: 'US:en' },
  CN: { gl: 'CN', hl: 'zh-CN', ceid: 'CN:zh-Hans' },
  GB: { gl: 'GB', hl: 'en-GB', ceid: 'GB:en' },
  BR: { gl: 'BR', hl: 'pt-BR', ceid: 'BR:pt-419' },
  MX: { gl: 'MX', hl: 'es-419', ceid: 'MX:es-419' },
  ID: { gl: 'ID', hl: 'id', ceid: 'ID:id' },
  TH: { gl: 'TH', hl: 'th', ceid: 'TH:th' },
  VN: { gl: 'VN', hl: 'vi', ceid: 'VN:vi' },
  PH: { gl: 'PH', hl: 'en', ceid: 'PH:en' },
  SG: { gl: 'SG', hl: 'en-SG', ceid: 'SG:en' },
  TW: { gl: 'TW', hl: 'zh-TW', ceid: 'TW:zh-Hant' },
  HK: { gl: 'HK', hl: 'zh-TW', ceid: 'HK:zh-Hant' },
  FR: { gl: 'FR', hl: 'fr', ceid: 'FR:fr' },
  DE: { gl: 'DE', hl: 'de', ceid: 'DE:de' },
  IT: { gl: 'IT', hl: 'it', ceid: 'IT:it' },
  ES: { gl: 'ES', hl: 'es', ceid: 'ES:es' },
  CA: { gl: 'CA', hl: 'en-CA', ceid: 'CA:en' },
  AU: { gl: 'AU', hl: 'en-AU', ceid: 'AU:en' },
  IN: { gl: 'IN', hl: 'en-IN', ceid: 'IN:en' },
  MY: { gl: 'MY', hl: 'ms', ceid: 'MY:ms' },
  AE: { gl: 'AE', hl: 'ar', ceid: 'AE:ar' },
  SA: { gl: 'SA', hl: 'ar', ceid: 'SA:ar' },
  TR: { gl: 'TR', hl: 'tr', ceid: 'TR:tr' },
};

const GENERIC_REJECT_EXACT = new Set([
  'amazon',
  'disney',
  'disney plus',
  'disney+',
  'espn',
  'restaurant',
  'koura',
]);

const REJECT_TERMS = [
  'vs',
  ' stock',
  '株価',
  'resultado',
  'score',
  'weather',
  'tiempo',
  'rain',
  'match',
  'football',
  'soccer',
  'baseball',
  'basketball',
  'arsenal',
  'al-nassr',
  'atletico',
  'odds',
  'bet365',
  'live stream',
  'programa',
  'program',
];

const BRAND_HINTS = [
  'apple', 'iphone', 'samsung', 'galaxy', 'tesla', 'mcdonald', 'costco',
  'dior', 'chanel', 'louis vuitton', 'fitbit', 'toyota', 'ikea', 'uniqlo', 'zara', 'nike', 'adidas',
  'fashion nova', 'genshin', 'steam', 'iqos', 'mcdonalds',
];

const PRODUCT_HINTS = [
  'code', 'redeem', 'boots', 'shoes', 'sneaker', 'bag', 'jeans', 'ticket', 'controller',
  'phone', 'laptop', 'earbuds', 'skincare', 'device', 'console', 'one ui', 'foldable',
  'iphone fold', 'iphone ultra', 'fsd',
];

const FASHION_HINTS = [
  'fashion', 'dress', 'shirt', 'pants', 'shoes', 'sneaker', 'bag', 'jacket',
  'hoodie', 'skirt', 'jeans', 'boots', 'hat', 'style', 'ootd', 'coat', 'blazer',
  'slacks', 'outer', 'wear', 'apparel', 'beauty', 'skincare', 'perfume',
];

const FOOD_HINTS = [
  'food', 'recipe', 'restaurant', 'cafe', 'coffee', 'tea', 'drink', 'snack',
  'cake', 'cookie', 'chocolate', 'candy', 'ramen', 'noodle', 'pizza', 'burger',
  'sushi', 'dessert', 'ice cream', 'bread', 'latte', 'matcha',
];

const CHALLENGE_HINTS = [
  'challenge', 'dance', 'song', 'music', 'lyrics', 'tiktok', 'reels', 'viral', 'trend',
];

const NEGATIVE_EVIDENCE_TERMS = [
  'death', 'killed', 'killing', 'funeral', 'obituary', 'coma', 'hospital', 'injury',
  'lawsuit', 'sues', 'suing', 'budget deficit', 'weather', 'forecast', 'election',
  'poll', 'war', 'shooting', 'earthquake', 'storm', 'spoiler', 'killer', 'murder',
];

const ENTERTAINMENT_REJECT_TERMS = [
  'season', 'episode', 'streaming', 'series', 'trailer',
];

const SUPPORT_SOURCE_FAMILIES = [
  'tiktok-official-hashtag',
  'tiktok-official-song',
  'tiktok-official-product',
  'instagram',
  'pinterest',
  'retailer',
  'youtube',
];

const TIKTOK_OFFICIAL_FAMILIES = new Set([
  'tiktok-official-hashtag',
  'tiktok-official-song',
  'tiktok-official-product',
]);

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

function decodeXml(value = '') {
  return value
    .replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g, '$1')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .trim();
}

function firstTag(block, tag) {
  const match = block.match(new RegExp(`<${tag}[^>]*>([\\s\\S]*?)<\\/${tag}>`, 'i'));
  return match ? decodeXml(match[1]) : '';
}

function allBlocks(block, tag) {
  return [...block.matchAll(new RegExp(`<${tag}[^>]*>([\\s\\S]*?)<\\/${tag}>`, 'gi'))].map((match) => match[1]);
}

function normalizeText(value) {
  return String(value || '')
    .normalize('NFKC')
    .toLowerCase()
    .replace(/\s+/g, ' ')
    .trim();
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

function tokenize(value) {
  return normalizeText(value)
    .replace(/[^\p{L}\p{N}\s]+/gu, ' ')
    .split(/\s+/)
    .filter((token) => token.length >= 2);
}

function shouldRejectQuery(query) {
  const normalized = normalizeText(query);
  if (!normalized) return true;
  if (GENERIC_REJECT_EXACT.has(normalized)) return true;
  return REJECT_TERMS.some((term) => normalized.includes(term));
}

function overlapsEnough(query, title) {
  const queryTokens = tokenize(query);
  const titleTokens = new Set(tokenize(title));
  if (queryTokens.length === 0 || titleTokens.size === 0) return false;
  const overlap = queryTokens.filter((token) => titleTokens.has(token));
  if (queryTokens.length === 1) return overlap.length === 1;
  return overlap.length >= Math.min(2, queryTokens.length);
}

function hasHint(normalized, hints) {
  return hints.some((hint) => normalized.includes(hint));
}

function hasNegativeEvidence(title) {
  const normalized = normalizeText(title);
  return NEGATIVE_EVIDENCE_TERMS.some((term) => normalized.includes(term));
}

function hasEntertainmentOnlyEvidence(title) {
  const normalized = normalizeText(title);
  return ENTERTAINMENT_REJECT_TERMS.some((term) => normalized.includes(term));
}

async function loadSupportSignalsMap(databaseUrl) {
  if (!databaseUrl) return new Map();

  const client = new Client({ connectionString: databaseUrl });
  await client.connect();
  const { rows } = await client.query(`
    SELECT
      country_code,
      source_family,
      source_name,
      canonical_name,
      raw_title,
      metric_label,
      metric_value,
      rank,
      source_url,
      evidence_urls,
      payload,
      collected_at
    FROM global_trend_signals
    WHERE window_date = $1::date
      AND source_family = ANY($2::text[])
  `, [WINDOW_DATE, SUPPORT_SOURCE_FAMILIES]);
  await client.end();

  const map = new Map();
  for (const row of rows) {
    const key = `${row.country_code}:${normalizeKey(row.canonical_name || row.raw_title)}`;
    if (!key.split(':')[1]) continue;
    const current = map.get(key) || [];
    current.push(row);
    map.set(key, current);
  }
  return map;
}

function supportSignalEvidence(signal) {
  return {
    source_family: signal.source_family,
    source_name: signal.source_name,
    url: signal.source_url,
    captured_at: signal.collected_at || WINDOW_AT,
    metric_label: signal.metric_label || 'support',
    metric_value: signal.metric_value || signal.raw_title || signal.canonical_name || '',
  };
}

function latestTimestamp(values) {
  const timestamps = values
    .map((value) => Date.parse(value || ''))
    .filter((value) => Number.isFinite(value));
  if (timestamps.length === 0) return WINDOW_AT;
  return new Date(Math.max(...timestamps)).toISOString();
}

function parseNewsRss(xml) {
  return allBlocks(xml, 'item').map((item) => ({
    title: firstTag(item, 'title'),
    url: firstTag(item, 'link'),
    pub_date: firstTag(item, 'pubDate'),
    source: firstTag(item, 'source'),
  })).filter((item) => item.title && item.url);
}

function isSameWeek(pubDate) {
  const published = Date.parse(pubDate || '');
  const windowEnd = Date.parse(WINDOW_END_AT);
  const windowStart = windowEnd - (7 * 24 * 60 * 60 * 1000);
  return Number.isFinite(published) && published >= windowStart && published <= windowEnd;
}

async function fetchNewsEvidence(countryCode, query) {
  const locale = COUNTRY_LOCALES[countryCode] || { gl: countryCode, hl: 'en', ceid: `${countryCode}:en` };
  const searchUrl = `https://news.google.com/rss/search?q=${encodeURIComponent(query)}&hl=${encodeURIComponent(locale.hl)}&gl=${encodeURIComponent(locale.gl)}&ceid=${encodeURIComponent(locale.ceid)}`;
  const response = await fetch(searchUrl, {
    headers: {
      'user-agent': 'Mozilla/5.0 MONTRA focus market verifier',
      accept: 'application/rss+xml,text/xml,*/*',
    },
  });
  const text = await response.text();
  const items = response.ok ? parseNewsRss(text) : [];
  return {
    search_url: searchUrl,
    status: response.status,
    items,
  };
}

function mapCategory(category) {
  if (category === 'challenges') return 'challenge';
  return category;
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

function buildDescription(countryCode, item, sourceFamilies = []) {
  const labels = sourceFamilies
    .filter((family) => family !== 'google-trends')
    .map((family) => ({
      news: '같은 주 기사',
      instagram: 'Instagram',
      pinterest: 'Pinterest',
      retailer: '리테일',
      youtube: 'YouTube',
      'tiktok-official-hashtag': 'TikTok 공식 해시태그',
      'tiktok-official-song': 'TikTok 공식 음원',
      'tiktok-official-product': 'TikTok 공식 상품',
    }[family] || family));

  const evidenceText = labels.length > 0 ? labels.join(', ') : '같은 주 기사';
  if (sourceFamilies.some((family) => TIKTOK_OFFICIAL_FAMILIES.has(family))) {
    return `${countryCode}에서 이번 주 "${item.query}"가 Google Trends와 ${evidenceText}에서 함께 확인됐습니다. ${item.category} 흐름으로 묶을 수 있는 TikTok 포함 검증 기록입니다.`;
  }
  return `${countryCode}에서 이번 주 "${item.query}"가 Google Trends와 ${evidenceText}에서 함께 확인됐습니다. ${item.category} 흐름으로 묶을 수 있는 최신 검증 기록입니다.`;
}

async function ensureSchema(client) {
  await client.query('CREATE EXTENSION IF NOT EXISTS "uuid-ossp"');
}

async function applyVerifiedRows(client, rows) {
  const categoryRows = await client.query('SELECT id, slug FROM categories');
  const categoryIds = Object.fromEntries(categoryRows.rows.map((row) => [row.slug, row.id]));
  const countryRows = await client.query('SELECT id, code FROM countries');
  const countryIds = Object.fromEntries(countryRows.rows.map((row) => [row.code, row.id]));

  await client.query(`
    DELETE FROM trends
    WHERE $1 = ANY(tags)
      AND (
        'focus-market-verified-refresh' = ANY(tags)
        OR 'auto-verified-global' = ANY(tags)
      )
  `, [WINDOW_DATE]);

  for (const row of rows) {
    const countryId = countryIds[row.country_code];
    const categoryId = categoryIds[row.category];
    if (!countryId || !categoryId) continue;

    const scores = scoreFields(row.category, row.search_score);
    const heat = heatScore(scores);
    const sourceUrls = [...new Set(row.evidence.map((item) => item.url).filter(Boolean))];
    const nextTags = [
      'weekly-research',
      'verified',
      row.verification_tag || 'verified-without-tiktok',
      'focus-market-verified-refresh',
      WINDOW_DATE,
      row.country_code.toLowerCase(),
      row.category,
    ];

    const updated = await client.query(`
      UPDATE trends
      SET
        category_id = $1,
        name_local = $2,
        description = $3,
        heat_score = $4,
        heat_status = 'rising',
        search_score = $5,
        social_score = $6,
        ecommerce_score = $7,
        news_score = $8,
        tags = $9::text[],
        source_urls = $10::text[],
        first_detected_at = $11::timestamptz,
        last_updated_at = $12::timestamptz
      WHERE country_id = $13
        AND name = $14
      RETURNING id
    `, [
      categoryId,
      row.name_local,
      row.description,
      heat,
      scores.search,
      scores.social,
      scores.ecommerce,
      Math.max(scores.news, 55),
      nextTags,
      sourceUrls,
      row.first_detected_at,
      row.last_updated_at,
      countryId,
      row.name,
    ]);

    if (updated.rowCount > 0) continue;

    await client.query(`
      INSERT INTO trends (
        country_id, category_id, name, name_local, description, heat_score, heat_status,
        search_score, social_score, ecommerce_score, news_score, tags, source_urls,
        first_detected_at, last_updated_at
      )
      VALUES ($1, $2, $3, $4, $5, $6, 'rising', $7, $8, $9, $10, $11, $12, $13::timestamptz, $14::timestamptz)
    `, [
      countryId,
      categoryId,
      row.name,
      row.name_local,
      row.description,
      heat,
      scores.search,
      scores.social,
      scores.ecommerce,
      Math.max(scores.news, 55),
      nextTags,
      sourceUrls,
      row.first_detected_at,
      row.last_updated_at,
    ]);
  }
}

async function main() {
  if (!fs.existsSync(inputJson)) {
    throw new Error(`Input JSON not found: ${inputJson}`);
  }

  const payload = JSON.parse(fs.readFileSync(inputJson, 'utf8'));
  const verified = [];
  const rejected = [];
  const env = loadEnv();
  const databaseUrl = process.env.DATABASE_URL ?? env.DATABASE_URL;

  let supportSignalMap = new Map();
  try {
    supportSignalMap = await loadSupportSignalsMap(databaseUrl);
  } catch (error) {
    console.warn(`Support signal load skipped: ${error.message}`);
  }

  for (const [countryCode, items] of Object.entries(payload)) {
    for (const item of items) {
      const category = mapCategory(item.category);
      if (!category || shouldRejectQuery(item.query)) {
        rejected.push({ country_code: countryCode, query: item.query, reason: 'Rejected by scope/noise filter.' });
        continue;
      }

      const queryTokens = tokenize(item.query);
      const normalizedQuery = normalizeText(item.query);
      const normalizedContext = normalizeText(item.context_text || '');
      const combinedText = normalizeText([item.query, item.context_text || ''].filter(Boolean).join(' '));

      if (
        (category === 'products' || category === 'brands') &&
        queryTokens.length === 1 &&
        /^[a-z0-9-]+$/i.test(normalizedQuery) &&
        !hasHint(normalizedContext, BRAND_HINTS) &&
        !hasHint(normalizedContext, PRODUCT_HINTS)
      ) {
        rejected.push({ country_code: countryCode, query: item.query, reason: 'Rejected generic single-token product/brand query.' });
        continue;
      }

      if (category === 'brands' && !hasHint(combinedText || normalizedQuery, BRAND_HINTS)) {
        rejected.push({ country_code: countryCode, query: item.query, reason: 'Rejected weak brand query without brand hint.' });
        continue;
      }

      if (category === 'products' && !hasHint(combinedText || normalizedQuery, PRODUCT_HINTS) && !hasHint(combinedText || normalizedQuery, BRAND_HINTS)) {
        rejected.push({ country_code: countryCode, query: item.query, reason: 'Rejected weak product query without product hint.' });
        continue;
      }

      const supportSignals = supportSignalMap.get(`${countryCode}:${normalizeKey(item.query)}`) || [];
      const supportFamilies = new Set(supportSignals.map((signal) => signal.source_family));

      if (
        (category === 'brands' || category === 'products') &&
        ENTERTAINMENT_REJECT_TERMS.some((term) => combinedText.includes(term)) &&
        !supportFamilies.has('retailer')
      ) {
        rejected.push({ country_code: countryCode, query: item.query, reason: 'Rejected entertainment-led brand/product query without retailer support.' });
        continue;
      }

      if (
        category === 'fashion' &&
        (
          !hasHint(combinedText, FASHION_HINTS) ||
          (
            !hasHint(normalizedQuery, FASHION_HINTS) &&
            (
              (
                queryTokens.length <= 3 &&
                !hasHint(normalizedQuery, BRAND_HINTS) &&
                !supportFamilies.has('retailer')
              ) ||
              (
                !hasHint(normalizedContext, BRAND_HINTS) &&
                !supportFamilies.has('retailer') &&
                !supportFamilies.has('pinterest')
              )
            )
          )
        )
      ) {
        rejected.push({ country_code: countryCode, query: item.query, reason: 'Rejected weak fashion query without productized context.' });
        continue;
      }

      if (
        category === 'food' &&
        (
          !hasHint(combinedText, FOOD_HINTS) ||
          (
            !hasHint(normalizedQuery, FOOD_HINTS) &&
            !supportFamilies.has('retailer') &&
            !supportFamilies.has('pinterest')
          )
        )
      ) {
        rejected.push({ country_code: countryCode, query: item.query, reason: 'Rejected weak food query without productized context.' });
        continue;
      }

      if (
        category === 'challenge' &&
        !hasHint(normalizedQuery, CHALLENGE_HINTS) &&
        ![...supportFamilies].some((family) => TIKTOK_OFFICIAL_FAMILIES.has(family) || family === 'youtube')
      ) {
        rejected.push({ country_code: countryCode, query: item.query, reason: 'Rejected weak challenge query without social platform support.' });
        continue;
      }

      const sourceFamilies = new Set(['google-trends']);
      const evidence = [
        {
          source_family: 'google-trends',
          source_name: 'Google Trends related queries',
          url: 'https://trends.google.com/trends/',
          captured_at: WINDOW_AT,
          metric_label: `${item.source}_${item.query_type}`,
          metric_value: String(item.raw_value || item.value || ''),
        },
      ];

      const news = await fetchNewsEvidence(countryCode, item.query);
      const sameWeek = news.items.filter((entry) => isSameWeek(entry.pub_date));
      const newsSupport = sameWeek.find((entry) => overlapsEnough(item.query, entry.title));

      if (newsSupport && !hasNegativeEvidence(newsSupport.title) && !hasEntertainmentOnlyEvidence(newsSupport.title)) {
        sourceFamilies.add('news');
        evidence.push({
          source_family: 'news',
          source_name: newsSupport.source || 'Google News',
          url: newsSupport.url,
          captured_at: newsSupport.pub_date ? new Date(newsSupport.pub_date).toISOString() : WINDOW_AT,
          metric_label: 'same-week coverage',
          metric_value: newsSupport.title,
        });
      }

      for (const signal of supportSignals) {
        sourceFamilies.add(signal.source_family);
        evidence.push(supportSignalEvidence(signal));
      }

      if (sourceFamilies.size < 2) {
        rejected.push({ country_code: countryCode, query: item.query, reason: 'No same-week second source beyond Google Trends.' });
        continue;
      }

      const name = String(item.query || '').trim();
      const hasNonAscii = [...name].some((ch) => ch.charCodeAt(0) > 127);
      const familyList = [...sourceFamilies];
      const verificationTag = familyList.some((family) => TIKTOK_OFFICIAL_FAMILIES.has(family))
        ? 'verified-with-tiktok'
        : 'verified-without-tiktok';

      verified.push({
        country_code: countryCode,
        category,
        name,
        name_local: hasNonAscii ? name : null,
        description: buildDescription(countryCode, { ...item, category }, familyList),
        confidence: verificationTag === 'verified-with-tiktok' ? 5 : familyList.length >= 3 ? 5 : 4,
        search_score: Math.min(100, Number(item.value || 0)),
        first_detected_at: WINDOW_AT,
        last_updated_at: latestTimestamp([
          newsSupport?.pub_date ? new Date(newsSupport.pub_date).toISOString() : '',
          ...supportSignals.map((signal) => signal.collected_at),
          WINDOW_AT,
        ]),
        verification_tag: verificationTag,
        evidence,
      });
    }
  }

  fs.mkdirSync(outputDir, { recursive: true });
  fs.writeFileSync(outputJson, `${JSON.stringify({ window_date: WINDOW_DATE, verified, rejected }, null, 2)}\n`, 'utf8');

  const byCountry = verified.reduce((acc, row) => {
    acc[row.country_code] = (acc[row.country_code] || 0) + 1;
    return acc;
  }, {});

  const lines = [
    `# Verified Focus Market Trends ${WINDOW_DATE}`,
    '',
    `- Input: ${path.relative(rootDir, inputJson)}`,
    `- Verified rows: ${verified.length}`,
    `- Rejected rows: ${rejected.length}`,
    '',
    '## Verified by Country',
    ...Object.entries(byCountry).sort((a, b) => a[0].localeCompare(b[0])).map(([code, count]) => `- ${code}: ${count}`),
    '',
    '## Sample Verified Rows',
    ...verified.slice(0, 40).map((row, index) => `${index + 1}. ${row.country_code} / ${row.category} / ${row.name} / ${row.verification_tag}`),
    '',
  ];
  fs.writeFileSync(outputMd, `${lines.join('\n')}\n`, 'utf8');

  if (applyToDb) {
    if (!databaseUrl) throw new Error('DATABASE_URL is missing.');
    const client = new Client({ connectionString: databaseUrl });
    await client.connect();
    await ensureSchema(client);
    await applyVerifiedRows(client, verified);
    await client.end();
  }

  console.log(`JSON: ${path.relative(rootDir, outputJson)}`);
  console.log(`MD: ${path.relative(rootDir, outputMd)}`);
  console.log(`verified: ${verified.length}, rejected: ${rejected.length}, applied: ${applyToDb}`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
