import fs from 'fs';
import path from 'path';

function defaultWindowDate() {
  return new Intl.DateTimeFormat('sv-SE', { timeZone: 'Asia/Seoul' }).format(new Date());
}

const WINDOW_DATE = process.env.WINDOW_DATE ?? defaultWindowDate();
const inputPath = path.join('scripts', 'output', `global_all_country_signals_${WINDOW_DATE}.json`);
const outputPath = path.join('scripts', 'output', `focus25_real_trends_${WINDOW_DATE}.json`);

const FOCUS_MARKET_CODES = new Set([
  'KR', 'JP', 'US', 'CN', 'GB', 'BR', 'MX', 'ID', 'TH', 'VN',
  'PH', 'SG', 'TW', 'HK', 'FR', 'DE', 'IT', 'ES', 'CA', 'AU',
  'IN', 'MY', 'AE', 'SA', 'TR',
]);

const BRAND_INDICATORS = new Set([
  'nike', 'adidas', 'zara', 'uniqlo', 'h&m', 'hm', 'shein', 'temu',
  'apple', 'iphone', 'samsung', 'galaxy', 'hyundai', 'ioniq', 'huawei', 'xiaomi', 'sony', 'tesla', 'rhode',
  'fenty', 'sephora', 'loreal', 'maybelline', 'dior', 'chanel', 'prada', 'gucci',
  'louis vuitton',
  'starbucks', 'mcdonald', 'kfc', 'subway', 'coca cola', 'pepsi',
  'netflix', 'spotify', 'tiktok', 'instagram', 'amazon', 'walmart',
  'ikea', 'costco', 'olay', 'cerave', 'shopee', 'zalando', 'google', 'primark',
]);

const FASHION_KEYWORDS = new Set([
  'outfit', 'dress', 'shirt', 'pants', 'shoes', 'sneaker', 'bag', 'jacket',
  'hoodie', 'skirt', 'jeans', 'boots', 'hat', 'style', 'fashion', 'ootd',
  'coat', 'blazer', 'slacks', 'outer', 'wear', 'apparel', 'loafer', 'lip', 'makeup',
  'beauty', 'skincare', 'fragrance', 'perfume',
]);

const FOOD_KEYWORDS = new Set([
  'recipe', 'food', 'cook', 'eat', 'drink', 'coffee', 'tea', 'cake', 'pizza',
  'burger', 'sushi', 'ramen', 'noodle', 'bread', 'dessert', 'restaurant',
  'snack', 'fruit', 'chocolate', 'candy', 'cookie', 'ice cream', 'milk tea', 'latte',
]);

const PRODUCT_KEYWORDS = new Set([
  'phone', 'battery', 'console', 'device', 'laptop', 'camera', 'earbuds', 'watch',
  'controller', 'charger', 'drone', 'vacuum', 'robot', 'tablet', 'keyboard', 'ev', 'electric car',
  'one ui', 'foldable', 'iphone fold', 'iphone ultra',
]);

const CHALLENGE_KEYWORDS = new Set([
  'challenge', 'dance', 'trend', 'viral song', 'reels', 'tiktok', 'spotify', 'lyrics',
]);

const GENERIC_EXACT_QUERIES = new Set([
  'fashion', 'food', 'shopping', 'products', 'brands', 'brand',
  'challenge', 'dance challenge', 'viral song', 'restaurant', 'google', 'amazon',
]);

const NOISE_TERMS = new Set([
  'vs', 'death', 'obituary', 'score', 'weather', 'earthquake', 'shooting',
  'election', 'polls', 'lottery', 'stock', 'share price', 'match', 'playoffs',
  'lakers', 'thunder', 'cavaliers', 'pistons', 'ucla', 'micron technology',
  'samsung card', '주가', '증권', '축구', '야구', '농구',
]);

const NOISE_SUBSTRINGS = [' vs ', ' v ', ' 대 '];

function normalizeQuery(queryText) {
  return String(queryText || '')
    .normalize('NFKC')
    .toLowerCase()
    .replace(/\s+/g, ' ')
    .trim();
}

function containsTerm(queryText, term) {
  const normalizedQuery = normalizeQuery(queryText);
  const normalizedTerm = normalizeQuery(term);
  if (!normalizedTerm) return false;
  if (/[^\x00-\x7F]/.test(normalizedTerm)) return normalizedQuery.includes(normalizedTerm);
  if (normalizedTerm.includes(' ')) return normalizedQuery.includes(normalizedTerm);
  return new RegExp(`(?<![a-z0-9])${normalizedTerm.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}(?![a-z0-9])`, 'i').test(normalizedQuery);
}

function hasAnyTerm(queryText, terms) {
  for (const term of terms) {
    if (containsTerm(queryText, term)) return true;
  }
  return false;
}

function classifyQuery(queryText) {
  if (hasAnyTerm(queryText, BRAND_INDICATORS)) return { category: 'brands', explicit: true, source: 'shopping' };
  if (hasAnyTerm(queryText, CHALLENGE_KEYWORDS)) return { category: 'challenges', explicit: true, source: 'dance_challenge' };
  if (hasAnyTerm(queryText, FASHION_KEYWORDS)) return { category: 'fashion', explicit: true, source: 'fashion' };
  if (hasAnyTerm(queryText, FOOD_KEYWORDS)) return { category: 'food', explicit: true, source: 'food' };
  if (hasAnyTerm(queryText, PRODUCT_KEYWORDS)) return { category: 'products', explicit: true, source: 'shopping' };
  return { category: null, explicit: false, source: null };
}

function isGenericNoise(queryText, explicitCategory) {
  const q = normalizeQuery(queryText);
  if (!q) return true;
  if (GENERIC_EXACT_QUERIES.has(q)) return true;
  if (explicitCategory) return false;
  if (NOISE_SUBSTRINGS.some((token) => q.includes(token))) return true;
  return hasAnyTerm(q, NOISE_TERMS);
}

function scoreValue(metricValue) {
  const raw = String(metricValue || '').toUpperCase().replace(/,/g, '').replace(/\+/g, '').trim();
  if (raw === 'BREAKOUT') return { value: 100, raw: raw };
  const match = raw.match(/([\d.]+)/);
  if (!match) return { value: 50, raw };
  const numeric = Number(match[1]);
  if (!Number.isFinite(numeric)) return { value: 50, raw };
  return { value: Math.max(20, Math.min(100, Math.round(numeric))), raw };
}

function dedupeAndLimit(items, limitPerCountry = 4) {
  const byKey = new Map();
  for (const item of items) {
    const key = `${normalizeQuery(item.query)}|${item.category}`;
    const current = byKey.get(key);
    if (!current) {
      byKey.set(key, item);
      continue;
    }
    const nextRank = (item.explicit_category ? 0 : 1) * 1000 - item.value;
    const currentRank = (current.explicit_category ? 0 : 1) * 1000 - current.value;
    if (nextRank < currentRank) byKey.set(key, item);
  }

  return [...byKey.values()]
    .sort((a, b) => {
      if (a.explicit_category !== b.explicit_category) return a.explicit_category ? -1 : 1;
      if (a.query_type !== b.query_type) return a.query_type === 'rising' ? -1 : 1;
      return b.value - a.value;
    })
    .slice(0, limitPerCountry);
}

function main() {
  if (!fs.existsSync(inputPath)) {
    throw new Error(`Input not found: ${inputPath}`);
  }

  const payload = JSON.parse(fs.readFileSync(inputPath, 'utf8'));
  const byCountry = {};

  for (const signal of payload.signals || []) {
    if (signal.source_family !== 'google-trends') continue;
    if (!FOCUS_MARKET_CODES.has(String(signal.country_code || '').toUpperCase())) continue;
    const query = String(signal.canonical_name || signal.raw_title || '').trim();
    if (!query) continue;

    const contextText = [
      query,
      signal.source_url || '',
      ...(Array.isArray(signal.payload?.news) ? signal.payload.news.map((entry) => entry?.title || '') : []),
    ].filter(Boolean).join(' | ');

    const { category, explicit, source } = classifyQuery(contextText);
    if (!explicit || !category || !source) continue;
    if (isGenericNoise(query, explicit)) continue;
    const scored = scoreValue(signal.metric_value);

    const item = {
      query,
      value: scored.value,
      raw_value: scored.raw,
      query_type: 'rising',
      source,
      category,
      explicit_category: explicit,
      context_text: contextText,
    };

    if (!byCountry[signal.country_code]) byCountry[signal.country_code] = [];
    byCountry[signal.country_code].push(item);
  }

  for (const countryCode of Object.keys(byCountry)) {
    byCountry[countryCode] = dedupeAndLimit(byCountry[countryCode]);
  }

  fs.writeFileSync(outputPath, `${JSON.stringify(byCountry, null, 2)}\n`, 'utf8');
  const countryCount = Object.values(byCountry).filter((items) => Array.isArray(items) && items.length > 0).length;
  const itemCount = Object.values(byCountry).reduce((sum, items) => sum + items.length, 0);
  console.log(`JSON: ${outputPath}`);
  console.log(`countries: ${countryCount}, items: ${itemCount}`);
}

main();
