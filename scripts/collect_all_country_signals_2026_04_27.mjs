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
const OUTPUT_JSON = path.join(outputDir, `global_all_country_signals_${WINDOW_DATE}.json`);
const OUTPUT_MD = path.join(outputDir, `global_all_country_signals_${WINDOW_DATE}.md`);

const args = new Set(process.argv.slice(2));
const applyToDb = args.has('--apply');
const skipTikTok = args.has('--skip-tiktok');
const skipGoogle = args.has('--skip-google');
const includeAllCountries = args.has('--all-countries');
const fromJsonArg = process.argv.find((arg) => arg.startsWith('--from-json='));
const fromJsonPath = fromJsonArg ? path.resolve(rootDir, fromJsonArg.split('=')[1]) : null;

const FOCUS_MARKET_CODES = [
  'KR', 'JP', 'US', 'CN', 'GB', 'BR', 'MX', 'ID', 'TH', 'VN', 'PH', 'SG', 'TW', 'HK',
  'FR', 'DE', 'IT', 'ES', 'CA', 'AU', 'IN', 'MY', 'AE', 'SA', 'TR',
];

function readNumberArg(name, fallback) {
  const match = process.argv.find((arg) => arg.startsWith(`--${name}=`));
  return match ? Number(match.split('=')[1]) : fallback;
}

function readStringArg(name, fallback = '') {
  const match = process.argv.find((arg) => arg.startsWith(`--${name}=`));
  return match ? match.split('=').slice(1).join('=').trim() : fallback;
}

const delayMs = readNumberArg('delay-ms', 100);
const googleLimit = readNumberArg('google-limit', 8);
const tiktokLimit = readNumberArg('tiktok-limit', 5);
const trendsPerCountryLimit = readNumberArg('trends-per-country', 12);
const tiktokDuplicateCountryCap = readNumberArg('tiktok-duplicate-country-cap', 25);
const requestedCountries = readStringArg('countries')
  .split(',')
  .map((code) => code.trim().toUpperCase())
  .filter(Boolean);
const allowedCountries = requestedCountries.length
  ? new Set(requestedCountries)
  : includeAllCountries
    ? null
    : new Set(FOCUS_MARKET_CODES);

const CATEGORY_KEYWORDS = {
  food: [
    'food', 'recipe', 'restaurant', 'cafe', 'coffee', 'tea', 'drink', 'snack',
    'cake', 'cookie', 'chocolate', 'candy', 'ramen', 'noodle', 'pizza', 'burger',
    'sushi', 'dessert', 'ice cream', 'bread', 'latte', 'matcha', 'spicy',
  ],
  fashion: [
    'fashion', 'outfit', 'style', 'dress', 'shirt', 'pants', 'shoes', 'sneaker',
    'bag', 'jacket', 'hoodie', 'skirt', 'jeans', 'boots', 'hat', 'makeup',
    'beauty', 'skincare', 'serum', 'lip', 'sunscreen', 'perfume',
  ],
  products: [
    'product', 'phone', 'laptop', 'camera', 'toy', 'game', 'charger', 'vacuum',
    'robot', 'device', 'gadget', 'headphone', 'earbuds', 'keyboard', 'bag',
    'watch', 'car', 'ev', 'drone', 'mask', 'cream', 'serum', 'supplement',
  ],
  challenge: [
    'challenge', 'dance', 'song', 'music', 'lyrics', 'tiktok', 'reels', 'viral',
    'trend', 'meme', 'shorts', 'spotify', 'artist', 'album',
  ],
};

const BRAND_HINTS = [
  'nike', 'adidas', 'zara', 'uniqlo', 'shein', 'temu', 'apple', 'samsung',
  'huawei', 'xiaomi', 'sony', 'tesla', 'rhode', 'sephora', 'dior', 'chanel',
  'starbucks', 'mcdonald', 'kfc', 'coca cola', 'pepsi', 'netflix', 'spotify',
  'amazon', 'walmart', 'ikea', 'costco', 'tiktok', 'instagram', 'google',
  'puma', 'kiehl', 'barilla', 'nestle', 'nintendo', 'playstation',
];

const NOISE_TERMS = [
  'death', 'died', 'obituary', 'shooting', 'earthquake', 'war', 'election',
  'poll', 'weather', 'lottery', 'score', 'vs', 'murder', 'court', 'arrest',
  'crash', 'accident', 'stock price', 'exchange rate', '株価', '股價',
  '地震', '공휴일', '법정 공휴일', '對', '対', 'vs.', 'league',
  'leaderboard', 'football', 'futbol', 'liga', 'rockets', 'lakers',
  'sevilla', 'osasuna', 'galatasaray', 'fenerbahce', 'fenerbahçe',
  'manchester city', 'lpga', 'imdb', 'wordle answers',
];

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

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

function loadCountryIds() {
  const idsPath = path.join(rootDir, 'scripts', 'config', 'supabase_ids.json');
  return JSON.parse(fs.readFileSync(idsPath, 'utf8')).countries;
}

function loadCountryMetadata() {
  const source = fs.readFileSync(path.join(rootDir, 'scripts', 'generate_190_countries.py'), 'utf8');
  const start = source.indexOf('ALL_COUNTRIES = [');
  const end = source.indexOf('\n]\n', start);
  if (start < 0 || end < 0) throw new Error('Could not locate ALL_COUNTRIES in generate_190_countries.py');

  const block = source.slice(start, end);
  const rowPattern = /\("([A-Z]{2})",\s*"([^"]*)",\s*"([^"]*)",\s*"([^"]*)",\s*"([^"]*)",\s*"([^"]*)"\)/g;
  const countries = [];
  for (const match of block.matchAll(rowPattern)) {
    countries.push({
      code: match[1],
      name_ko: match[2],
      name_en: match[3],
      flag_emoji: match[4],
      region: match[5],
      sub_region: match[6],
    });
  }
  return countries;
}

function filterCountriesByScope(countries) {
  return countries.filter((country) => !allowedCountries || allowedCountries.has(country.code));
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

function parseGoogleRss(xml) {
  return allBlocks(xml, 'item').map((item, index) => {
    const news = allBlocks(item, 'ht:news_item').map((newsItem) => ({
      title: firstTag(newsItem, 'ht:news_item_title'),
      url: firstTag(newsItem, 'ht:news_item_url'),
      source: firstTag(newsItem, 'ht:news_item_source'),
    })).filter((entry) => entry.url);

    return {
      rank: index + 1,
      title: firstTag(item, 'title'),
      approx_traffic: firstTag(item, 'ht:approx_traffic'),
      pub_date: firstTag(item, 'pubDate'),
      source_url: news[0]?.url || '',
      evidence_urls: news.map((entry) => entry.url),
      news,
    };
  }).filter((item) => item.title);
}

function normalizeText(value) {
  return String(value || '').toLowerCase().replace(/\s+/g, ' ').trim();
}

function includesTerm(text, term) {
  const normalizedTerm = normalizeText(term);
  if (!normalizedTerm) return false;
  if (/[^\x00-\x7F]/.test(normalizedTerm)) return text.includes(normalizedTerm);
  if (normalizedTerm.includes(' ')) {
    return new RegExp(`(^|[^a-z0-9])${normalizedTerm.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}([^a-z0-9]|$)`, 'i').test(text);
  }
  return new RegExp(`(^|[^a-z0-9])${normalizedTerm.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}([^a-z0-9]|$)`, 'i').test(text);
}

function classify(text, fallback = 'brands', minScore = 1) {
  const q = normalizeText(text);
  if (!q) return null;
  if (NOISE_TERMS.some((term) => includesTerm(q, term))) return null;
  if (BRAND_HINTS.some((term) => includesTerm(q, term))) return 'brands';

  const scores = Object.entries(CATEGORY_KEYWORDS).map(([slug, words]) => ({
    slug,
    score: words.reduce((sum, word) => sum + (includesTerm(q, word) ? 1 : 0), 0),
  })).sort((a, b) => b.score - a.score);

  if (scores[0]?.score >= minScore) return scores[0].slug;
  return fallback;
}

function parseTraffic(value) {
  const raw = String(value || '').toUpperCase().replace(/,/g, '').replace(/\+/g, '').trim();
  const match = raw.match(/([\d.]+)\s*([KMB]?)/);
  if (!match) return 0;
  const base = Number(match[1]);
  const unit = match[2];
  if (unit === 'B') return Math.round(base * 1_000_000_000);
  if (unit === 'M') return Math.round(base * 1_000_000);
  if (unit === 'K') return Math.round(base * 1_000);
  return Math.round(base);
}

function trafficScore(traffic) {
  if (!traffic) return 35;
  return Math.max(35, Math.min(100, Math.round((Math.log10(traffic + 10) / 7) * 100)));
}

function socialScoreFromViews(views = 0, posts = 0) {
  const viewScore = views ? Math.min(100, Math.round((Math.log10(Number(views) + 10) / 9) * 100)) : 0;
  const postScore = posts ? Math.min(100, Math.round((Math.log10(Number(posts) + 10) / 7) * 100)) : 0;
  return Math.max(viewScore, Math.round(viewScore * 0.7 + postScore * 0.3), 45);
}

function heatScore(searchScore, socialScore, ecommerceScore, newsScore) {
  return Math.round(searchScore * 0.34 + socialScore * 0.34 + ecommerceScore * 0.18 + newsScore * 0.14);
}

function trendScores(signal) {
  if (signal.source_family === 'google-trends') {
    const score = trafficScore(parseTraffic(signal.metric_value));
    const ecommerce = ['products', 'food', 'fashion'].includes(signal.category_slug) ? Math.round(score * 0.45) : 10;
    return {
      search_score: score,
      social_score: signal.category_slug === 'challenge' ? Math.round(score * 0.55) : Math.round(score * 0.25),
      ecommerce_score: ecommerce,
      news_score: Math.max(45, Math.round(score * 0.75)),
    };
  }

  if (signal.source_family === 'tiktok-hashtag') {
    const score = socialScoreFromViews(signal.payload.video_views, signal.payload.publish_count);
    const ecommerce = ['products', 'food', 'fashion'].includes(signal.category_slug) ? Math.round(score * 0.35) : 8;
    return {
      search_score: 0,
      social_score: score,
      ecommerce_score: ecommerce,
      news_score: 12,
    };
  }

  const rankScore = Math.max(55, 98 - (signal.rank || 1) * 5);
  return {
    search_score: 0,
    social_score: rankScore,
    ecommerce_score: 5,
    news_score: 15,
  };
}

async function fetchGoogle(country) {
  const url = `https://trends.google.com/trending/rss?geo=${encodeURIComponent(country.code)}`;
  const response = await fetch(url, {
    headers: {
      'user-agent': 'Mozilla/5.0 MONTRA global trend research bot',
      accept: 'application/rss+xml,text/xml,*/*',
    },
  });
  const text = await response.text();
  const items = response.ok ? parseGoogleRss(text).slice(0, googleLimit) : [];
  return {
    code: country.code,
    status: response.status,
    url,
    items,
    error: response.ok ? null : text.slice(0, 240),
  };
}

async function fetchTikTokEndpoint(endpoint, country) {
  const url = `https://tiktok-discover-api.vercel.app/api?endpoint=${endpoint}&country=${country.code}&page=1&limit=${tiktokLimit}&period=7`;
  const response = await fetch(url, { headers: { accept: 'application/json' } });
  const text = await response.text();
  let payload = null;
  try {
    payload = text ? JSON.parse(text) : null;
  } catch {
    payload = { raw: text.slice(0, 300) };
  }
  return { url, status: response.status, payload };
}

function normalizeTikTokSongs(payload) {
  const list = payload?.data?.sound_list ?? [];
  return list.map((song) => ({
    rank: song.rank,
    title: song.title || song.track || song.sound_title || 'Unknown',
    author: song.author || song.artist || '',
    tiktok_url: song.link || '',
    rank_diff: song.rank_diff,
  })).filter((song) => song.title);
}

function normalizeTikTokHashtags(payload) {
  const list = payload?.data?.list ?? [];
  return list.map((tag) => ({
    rank: tag.rank,
    hashtag: tag.hashtag_name,
    industry: tag.industry_info?.value || tag.industry_info?.label || '',
    publish_count: Number(tag.publish_cnt || 0),
    video_views: Number(tag.video_views || 0),
    rank_diff_type: tag.rank_diff_type,
    tiktok_url: tag.hashtag_name ? `https://www.tiktok.com/tag/${encodeURIComponent(tag.hashtag_name)}` : '',
  })).filter((tag) => tag.hashtag);
}

async function fetchTikTok(country) {
  const songs = await fetchTikTokEndpoint('getTrendingSongs', country);
  await sleep(delayMs);
  const hashtags = await fetchTikTokEndpoint('getTrendingHastag', country);
  return {
    code: country.code,
    songs_status: songs.status,
    hashtags_status: hashtags.status,
    songs_url: songs.url,
    hashtags_url: hashtags.url,
    songs: normalizeTikTokSongs(songs.payload),
    hashtags: normalizeTikTokHashtags(hashtags.payload),
  };
}

function toSignals(country, googleResult, tiktokResult) {
  const signals = [];

  for (const item of googleResult?.items ?? []) {
    const category = classify(`${item.title} ${item.news?.map((entry) => entry.title).join(' ')}`, null, 2);
    signals.push({
      country_code: country.code,
      source_family: 'google-trends',
      source_name: 'Google Trends RSS',
      category_slug: category,
      canonical_name: item.title,
      raw_title: item.title,
      metric_label: 'approx_traffic',
      metric_value: item.approx_traffic,
      rank: item.rank,
      source_url: item.source_url || googleResult.url,
      evidence_urls: item.evidence_urls?.length ? item.evidence_urls : [googleResult.url],
      payload: item,
    });
  }

  for (const tag of tiktokResult?.hashtags ?? []) {
    const category = classify(`${tag.hashtag} ${tag.industry}`, 'challenge') ?? 'challenge';
    signals.push({
      country_code: country.code,
      source_family: 'tiktok-hashtag',
      source_name: 'TikTok Creative Center wrapper',
      category_slug: category,
      canonical_name: `#${tag.hashtag}`,
      raw_title: tag.hashtag,
      metric_label: 'video_views',
      metric_value: String(tag.video_views || ''),
      rank: tag.rank,
      source_url: tag.tiktok_url || tiktokResult.hashtags_url,
      evidence_urls: [tag.tiktok_url || tiktokResult.hashtags_url],
      payload: tag,
    });
  }

  for (const song of tiktokResult?.songs ?? []) {
    const name = `${song.title}${song.author ? ` - ${song.author}` : ''}`;
    signals.push({
      country_code: country.code,
      source_family: 'tiktok-song',
      source_name: 'TikTok Creative Center wrapper',
      category_slug: 'challenge',
      canonical_name: name,
      raw_title: name,
      metric_label: 'rank',
      metric_value: String(song.rank || ''),
      rank: song.rank,
      source_url: song.tiktok_url || tiktokResult.songs_url,
      evidence_urls: [song.tiktok_url || tiktokResult.songs_url],
      payload: song,
    });
  }

  return signals;
}

function pickTrendsForMainTable(signals) {
  const byCountry = new Map();
  for (const signal of signals.filter((entry) => entry.category_slug)) {
    if (!byCountry.has(signal.country_code)) byCountry.set(signal.country_code, []);
    byCountry.get(signal.country_code).push(signal);
  }

  const picked = [];
  for (const countrySignals of byCountry.values()) {
    const sorted = countrySignals
      .map((signal) => ({ signal, scores: trendScores(signal) }))
      .map((entry) => ({
        ...entry,
        heat: heatScore(
          entry.scores.search_score,
          entry.scores.social_score,
          entry.scores.ecommerce_score,
          entry.scores.news_score
        ),
      }))
      .sort((a, b) => b.heat - a.heat || (a.signal.rank || 99) - (b.signal.rank || 99));

    const counts = new Map();
    for (const entry of sorted) {
      const category = entry.signal.category_slug;
      if ((counts.get(category) || 0) >= 4) continue;
      counts.set(category, (counts.get(category) || 0) + 1);
      picked.push(entry);
      if (counts.size >= 4 && [...counts.values()].reduce((a, b) => a + b, 0) >= trendsPerCountryLimit) break;
      if ([...counts.values()].reduce((a, b) => a + b, 0) >= trendsPerCountryLimit) break;
    }
  }
  return picked;
}

function removeNonLocalTikTokRepeats(signals) {
  const countriesBySignal = new Map();
  for (const signal of signals) {
    if (!signal.source_family.startsWith('tiktok')) continue;
    const key = `${signal.source_family}:${normalizeText(signal.canonical_name)}`;
    if (!countriesBySignal.has(key)) countriesBySignal.set(key, new Set());
    countriesBySignal.get(key).add(signal.country_code);
  }

  const filtered = [];
  const dropped = [];
  for (const signal of signals) {
    if (!signal.source_family.startsWith('tiktok')) {
      filtered.push(signal);
      continue;
    }
    const key = `${signal.source_family}:${normalizeText(signal.canonical_name)}`;
    const countryCount = countriesBySignal.get(key)?.size ?? 0;
    if (countryCount > tiktokDuplicateCountryCap) {
      dropped.push({ ...signal, duplicate_country_count: countryCount });
    } else {
      filtered.push(signal);
    }
  }

  return { filtered, dropped };
}

async function ensureSchema(client) {
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

async function upsertCountries(client, countries, countryIds) {
  for (const country of countries) {
    const id = countryIds[country.code];
    if (!id) continue;
    await client.query(`
      INSERT INTO countries (id, code, name_ko, name_en, name_local, flag_emoji, region, sub_region, is_active)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, true)
      ON CONFLICT (code) DO UPDATE SET
        name_ko = EXCLUDED.name_ko,
        name_en = EXCLUDED.name_en,
        name_local = EXCLUDED.name_local,
        flag_emoji = EXCLUDED.flag_emoji,
        region = EXCLUDED.region,
        sub_region = EXCLUDED.sub_region,
        is_active = true
    `, [
      id,
      country.code,
      country.name_ko,
      country.name_en,
      country.name_ko,
      country.flag_emoji,
      country.region,
      country.sub_region,
    ]);
  }
}

async function applySignals(client, signals, countryIds) {
  await client.query('DELETE FROM global_trend_signals WHERE window_date = $1::date', [WINDOW_DATE]);

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
      signal.rank || null,
      signal.source_url,
      signal.evidence_urls,
      JSON.stringify(signal.payload || {}),
      WINDOW_AT,
      WINDOW_DATE,
    ]);
  }
}

function trendDescription(signal) {
  if (signal.source_family === 'google-trends') {
    return `${signal.country_code} Google Trends RSS에서 이번 주 급상승 검색 후보로 잡힌 항목입니다. 원문 제목은 "${signal.raw_title}"이고, 현재 단계에서는 원본 신호 기반의 raw 후보로 분류했습니다.`;
  }
  if (signal.source_family === 'tiktok-hashtag') {
    return `${signal.country_code} TikTok 7일 트렌드에서 잡힌 해시태그 후보입니다. 영상 조회수와 게시물 수는 원본 payload에 보존했고, 현재 단계에서는 바이럴 후보로 분류했습니다.`;
  }
  return `${signal.country_code} TikTok 7일 트렌드에서 잡힌 음원/챌린지 후보입니다. 숏폼 콘텐츠 확산 가능성을 보기 위한 raw 후보입니다.`;
}

async function applyMainTrends(client, picked, countryIds, categoryIds) {
  await client.query("DELETE FROM trends WHERE $1 = ANY(tags) AND 'raw-global-signal' = ANY(tags)", [WINDOW_DATE]);

  for (const { signal, scores, heat } of picked) {
    const countryId = countryIds[signal.country_code];
    const categoryId = categoryIds[signal.category_slug];
    if (!countryId || !categoryId) continue;

    await client.query(`
      INSERT INTO trends (
        country_id, category_id, name, name_local, description, heat_score, heat_status,
        search_score, social_score, ecommerce_score, news_score, tags, source_urls,
        first_detected_at, last_updated_at
      )
      VALUES ($1, $2, $3, NULL, $4, $5, 'rising', $6, $7, $8, $9, $10, $11, $12::timestamptz, $12::timestamptz)
      ON CONFLICT (country_id, name) DO NOTHING
    `, [
      countryId,
      categoryId,
      signal.canonical_name.slice(0, 200),
      trendDescription(signal),
      heat,
      scores.search_score,
      scores.social_score,
      scores.ecommerce_score,
      scores.news_score,
      ['raw-global-signal', WINDOW_DATE, signal.country_code.toLowerCase(), signal.source_family, signal.category_slug],
      signal.evidence_urls?.length ? signal.evidence_urls : [signal.source_url].filter(Boolean),
      WINDOW_AT,
    ]);
  }
}

function writeSummary(payload, picked) {
  fs.writeFileSync(OUTPUT_JSON, `${JSON.stringify(payload, null, 2)}\n`, 'utf8');

  const bySource = payload.signals.reduce((acc, signal) => {
    acc[signal.source_family] = (acc[signal.source_family] || 0) + 1;
    return acc;
  }, {});
  const byCountry = new Map();
  for (const signal of payload.signals) {
    byCountry.set(signal.country_code, (byCountry.get(signal.country_code) || 0) + 1);
  }

  const lines = [
    `# Global All-Country Signals ${WINDOW_DATE}`,
    '',
    '- Purpose: all possible country-level weekly trend and viral candidates.',
    '- Level: raw/global signal. This is not the same as manually verified trend records.',
    `- Countries scanned: ${payload.countries.length}`,
    `- Countries with signals: ${[...byCountry.values()].filter((count) => count > 0).length}`,
    `- Raw signals before filtering: ${payload.raw_signal_count_before_filter}`,
    `- Dropped non-local TikTok repeats: ${payload.dropped_nonlocal_tiktok_repeats}`,
    `- Raw signals: ${payload.signals.length}`,
    `- Main trends prepared: ${picked.length}`,
    '',
    '## Source Counts',
    ...Object.entries(bySource).map(([source, count]) => `- ${source}: ${count}`),
    '',
    '## Top Countries By Signal Count',
    ...[...byCountry.entries()].sort((a, b) => b[1] - a[1]).slice(0, 30).map(([code, count]) => `- ${code}: ${count}`),
    '',
    '## Main Table Sample',
    ...picked.slice(0, 40).map((entry, index) => `${index + 1}. ${entry.signal.country_code} / ${entry.signal.category_slug} / ${entry.heat} - ${entry.signal.canonical_name}`),
    '',
  ];
  fs.writeFileSync(OUTPUT_MD, `${lines.join('\n')}\n`, 'utf8');
}

async function main() {
  fs.mkdirSync(outputDir, { recursive: true });

  const countryIds = loadCountryIds();
  let countries = loadCountryMetadata()
    .filter((country) => countryIds[country.code])
    .filter((country) => !allowedCountries || allowedCountries.has(country.code));
  let googleResults = [];
  let tiktokResults = [];

  if (fromJsonPath) {
    const previous = JSON.parse(fs.readFileSync(fromJsonPath, 'utf8'));
    countries = filterCountriesByScope(previous.countries ?? countries);
    googleResults = previous.google_results ?? [];
    tiktokResults = previous.tiktok_results ?? [];
    console.log(`Loaded existing collection: ${path.relative(rootDir, fromJsonPath)}`);
  } else {
    for (const [index, country] of countries.entries()) {
      let google = null;
      let tiktok = null;

      if (!skipGoogle) {
        try {
          google = await fetchGoogle(country);
        } catch (error) {
          google = { code: country.code, status: 0, url: `https://trends.google.com/trending/rss?geo=${country.code}`, items: [], error: error.message };
        }
        googleResults.push(google);
        await sleep(delayMs);
      }

      if (!skipTikTok) {
        try {
          tiktok = await fetchTikTok(country);
        } catch (error) {
          tiktok = { code: country.code, songs_status: 0, hashtags_status: 0, songs: [], hashtags: [], error: error.message };
        }
        tiktokResults.push(tiktok);
        await sleep(delayMs);
      }

      const googleCount = google?.items?.length ?? 0;
      const tagCount = tiktok?.hashtags?.length ?? 0;
      const songCount = tiktok?.songs?.length ?? 0;
      console.log(`[${index + 1}/${countries.length}] ${country.code}: google ${googleCount}, tags ${tagCount}, songs ${songCount}`);
    }
  }

  const googleByCode = new Map(googleResults.map((result) => [result.code, result]));
  const tiktokByCode = new Map(tiktokResults.map((result) => [result.code, result]));
  const rawSignals = countries.flatMap((country) => toSignals(country, googleByCode.get(country.code), tiktokByCode.get(country.code)));
  const { filtered: signals, dropped } = removeNonLocalTikTokRepeats(rawSignals);
  const picked = pickTrendsForMainTable(signals);

  const payload = {
    generated_at: new Date().toISOString(),
    window_date: WINDOW_DATE,
    level: 'raw-global-signal',
    country_scope: includeAllCountries ? 'all-countries' : requestedCountries.length ? 'custom' : 'focus-markets',
    focus_market_codes: FOCUS_MARKET_CODES,
    countries,
    google_results: googleResults,
    tiktok_results: tiktokResults,
    raw_signal_count_before_filter: rawSignals.length,
    dropped_nonlocal_tiktok_repeats: dropped.length,
    tiktok_duplicate_country_cap: tiktokDuplicateCountryCap,
    signals,
    dropped_signal_sample: dropped.slice(0, 50),
    main_trend_candidates: picked.map((entry) => ({
      ...entry.signal,
      heat_score: entry.heat,
      ...entry.scores,
    })),
  };

  if (applyToDb) {
    const env = loadEnv();
    const databaseUrl = process.env.DATABASE_URL ?? env.DATABASE_URL;
    if (!databaseUrl) throw new Error('DATABASE_URL is missing.');
    const client = new Client({ connectionString: databaseUrl });
    await client.connect();
    const categories = await client.query('SELECT id, slug FROM categories');
    const categoryIds = Object.fromEntries(categories.rows.map((row) => [row.slug, row.id]));
    await ensureSchema(client);
    await upsertCountries(client, countries, countryIds);
    await applySignals(client, signals, countryIds);
    await applyMainTrends(client, picked, countryIds, categoryIds);
    await client.end();
  }

  writeSummary(payload, picked);
  console.log(`JSON: ${path.relative(rootDir, OUTPUT_JSON)}`);
  console.log(`MD: ${path.relative(rootDir, OUTPUT_MD)}`);
  console.log(`countries: ${countries.length}, signals: ${signals.length}, main_trends: ${picked.length}, applied: ${applyToDb}`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
