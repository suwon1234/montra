import { existsSync, readFileSync, writeFileSync } from 'fs';

const WINDOW_DATE = '2026-04-16';
const OUTPUT_JSON = `scripts/output/global_rss_candidates_${WINDOW_DATE}.json`;
const OUTPUT_SUMMARY = `scripts/output/global_rss_candidates_${WINDOW_DATE}.summary.md`;
const args = new Set(process.argv.slice(2));
const retryFailed = args.has('--retry-failed');
const delayArg = process.argv.find((arg) => arg.startsWith('--delay-ms='));
const delayMs = delayArg ? Number(delayArg.split('=')[1]) : 250;

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

function parseRss(xml) {
  return allBlocks(xml, 'item').map((item) => {
    const news = allBlocks(item, 'ht:news_item').map((newsItem) => ({
      title: firstTag(newsItem, 'ht:news_item_title'),
      url: firstTag(newsItem, 'ht:news_item_url'),
      source: firstTag(newsItem, 'ht:news_item_source'),
    })).filter((entry) => entry.url);

    return {
      title: firstTag(item, 'title'),
      approx_traffic: firstTag(item, 'ht:approx_traffic'),
      pub_date: firstTag(item, 'pubDate'),
      picture: firstTag(item, 'ht:picture'),
      picture_source: firstTag(item, 'ht:picture_source'),
      news,
    };
  }).filter((item) => item.title);
}

function loadCountries() {
  const raw = JSON.parse(readFileSync('scripts/config/supabase_ids.json', 'utf8'));
  return Object.keys(raw.countries).sort();
}

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function fetchCountry(code) {
  const url = `https://trends.google.com/trending/rss?geo=${encodeURIComponent(code)}`;
  const response = await fetch(url, {
    headers: {
      'user-agent': 'Mozilla/5.0 MONTRA trend research bot',
      accept: 'application/rss+xml,text/xml,*/*',
    },
  });
  const text = await response.text();
  return {
    code,
    url,
    status: response.status,
    items: response.ok ? parseRss(text) : [],
    error: response.ok ? null : text.slice(0, 240),
  };
}

const countries = loadCountries();
let results = [];
if (retryFailed && existsSync(OUTPUT_JSON)) {
  const previous = JSON.parse(readFileSync(OUTPUT_JSON, 'utf8'));
  results = previous.countries ?? [];
}
const previousByCode = new Map(results.map((result) => [result.code, result]));
const queue = retryFailed
  ? countries.filter((code) => !previousByCode.get(code)?.items?.length)
  : countries;

for (const [index, code] of queue.entries()) {
  try {
    const result = await fetchCountry(code);
    previousByCode.set(code, result);
    console.log(`[${index + 1}/${queue.length}] ${code}: ${result.status}, ${result.items.length} items`);
  } catch (error) {
    previousByCode.set(code, {
      code,
      url: `https://trends.google.com/trending/rss?geo=${code}`,
      status: 0,
      items: [],
      error: error.message,
    });
    console.log(`[${index + 1}/${queue.length}] ${code}: failed - ${error.message}`);
  }
  await sleep(delayMs);
}

results = countries.map((code) => previousByCode.get(code)).filter(Boolean);

const payload = {
  generated_at: new Date().toISOString(),
  window_date: WINDOW_DATE,
  source: 'Google Trends Daily Search Trends RSS',
  note_ko: '최종 트렌드 SQL이 아니라 전 국가 후보 수집본입니다. 실제 상품명/메뉴명/곡명 검증 후에만 SQL로 승격합니다.',
  countries: results,
};

writeFileSync(OUTPUT_JSON, JSON.stringify(payload, null, 2), 'utf8');

const available = results.filter((result) => result.items.length > 0);
const failed = results.filter((result) => result.items.length === 0);
const lines = [
  `# Global RSS Candidates ${WINDOW_DATE}`,
  '',
  '- 용도: 전 국가 최신 후보 수집 베이스라인',
  '- 주의: 이 파일은 최종 SQL이 아니며, 실제 상품명/메뉴명/곡명 검증 후에만 사용',
  `- 전체 국가: ${results.length}`,
  `- 후보 있음: ${available.length}`,
  `- 후보 없음/실패: ${failed.length}`,
  '',
  '## 후보 있음',
  ...available.map((result) => `- ${result.code}: ${result.items.length}개`),
  '',
  '## 후보 없음/실패',
  ...failed.map((result) => `- ${result.code}: status ${result.status}${result.error ? `, ${result.error}` : ''}`),
  '',
];
writeFileSync(OUTPUT_SUMMARY, lines.join('\n'), 'utf8');

console.log(`JSON: ${OUTPUT_JSON}`);
console.log(`SUMMARY: ${OUTPUT_SUMMARY}`);
