import { existsSync, readFileSync, writeFileSync } from 'fs';

const WINDOW_DATE = '2026-04-16';
const OUTPUT_JSON = `scripts/output/tiktok_country_candidates_${WINDOW_DATE}.json`;
const OUTPUT_SUMMARY = `scripts/output/tiktok_country_candidates_${WINDOW_DATE}.summary.md`;

const args = new Set(process.argv.slice(2));
const limitArg = process.argv.find((arg) => arg.startsWith('--limit='));
const limit = limitArg ? Number(limitArg.split('=')[1]) : 10;
const delayArg = process.argv.find((arg) => arg.startsWith('--delay-ms='));
const delayMs = delayArg ? Number(delayArg.split('=')[1]) : 800;
const resume = args.has('--resume');
const songsOnly = args.has('--songs-only');

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function loadCountryCodes() {
  const ids = JSON.parse(readFileSync('scripts/config/supabase_ids.json', 'utf8'));
  const all = Object.keys(ids.countries).sort();
  const codesArg = process.argv.find((arg) => arg.startsWith('--countries='));
  if (!codesArg) return all;
  const requested = new Set(codesArg.split('=')[1].split(',').map((code) => code.trim().toUpperCase()).filter(Boolean));
  return all.filter((code) => requested.has(code));
}

async function fetchEndpoint(endpoint, country) {
  const url = `https://tiktok-discover-api.vercel.app/api?endpoint=${endpoint}&country=${country}&page=1&limit=${limit}&period=7`;
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

function normalizeSongs(payload) {
  const list = payload?.data?.sound_list ?? [];
  return list.map((song) => ({
    rank: song.rank,
    title: song.title || song.track || song.sound_title || 'Unknown',
    author: song.author || song.artist || '',
    tiktok_url: song.link || '',
    country_code: song.country_code,
    rank_diff: song.rank_diff,
    related_video_count: Array.isArray(song.related_items) ? song.related_items.length : 0,
  })).filter((song) => song.title && song.tiktok_url);
}

function normalizeHashtags(payload) {
  const list = payload?.data?.list ?? [];
  return list.map((tag) => ({
    rank: tag.rank,
    hashtag: tag.hashtag_name,
    industry: tag.industry_info?.value || tag.industry_info?.label || '',
    publish_count: tag.publish_cnt,
    video_views: tag.video_views,
    rank_diff_type: tag.rank_diff_type,
    tiktok_url: tag.hashtag_name ? `https://www.tiktok.com/tag/${encodeURIComponent(tag.hashtag_name)}` : '',
  })).filter((tag) => tag.hashtag);
}

const codes = loadCountryCodes();
let countries = [];

if (resume && existsSync(OUTPUT_JSON)) {
  const previous = JSON.parse(readFileSync(OUTPUT_JSON, 'utf8'));
  countries = previous.countries ?? [];
}

const byCode = new Map(countries.map((country) => [country.code, country]));

function saveJson() {
  const ordered = codes.map((code) => byCode.get(code)).filter(Boolean);
  writeFileSync(OUTPUT_JSON, JSON.stringify({
    generated_at: new Date().toISOString(),
    window_date: WINDOW_DATE,
    source: 'TikTok Creative Center wrapper, discovery only',
    note_ko: '챌린지/해시태그 후보 수집본입니다. 최종 SQL은 추가 검증 후 생성합니다.',
    countries: ordered,
  }, null, 2), 'utf8');
}

for (const [index, code] of codes.entries()) {
  if (resume && (byCode.get(code)?.songs?.length || byCode.get(code)?.hashtags?.length)) continue;

  try {
    const songs = await fetchEndpoint('getTrendingSongs', code);
    await sleep(delayMs);
    const hashtags = songsOnly ? null : await fetchEndpoint('getTrendingHastag', code);
    byCode.set(code, {
      code,
      songs_status: songs.status,
      hashtags_status: hashtags?.status ?? null,
      songs: normalizeSongs(songs.payload),
      hashtags: hashtags ? normalizeHashtags(hashtags.payload) : [],
      source_urls: [
        songs.url,
        ...(hashtags ? [hashtags.url] : []),
      ],
    });
    const current = byCode.get(code);
    console.log(`[${index + 1}/${codes.length}] ${code}: songs ${current.songs.length}, hashtags ${current.hashtags.length}`);
  } catch (error) {
    byCode.set(code, {
      code,
      songs_status: 0,
      hashtags_status: 0,
      songs: [],
      hashtags: [],
      error: error.message,
      source_urls: [],
    });
    console.log(`[${index + 1}/${codes.length}] ${code}: failed - ${error.message}`);
  }

  saveJson();
  await sleep(delayMs);
}

countries = codes.map((code) => byCode.get(code)).filter(Boolean);
saveJson();

const withSongs = countries.filter((country) => country.songs.length > 0);
const withTags = countries.filter((country) => country.hashtags.length > 0);
const lines = [
  `# TikTok Country Candidates ${WINDOW_DATE}`,
  '',
  `- 조사 국가: ${countries.length}`,
  `- 노래 후보 있음: ${withSongs.length}`,
  `- 해시태그 후보 있음: ${withTags.length}`,
  '',
  '## 노래 후보 있음',
  ...withSongs.map((country) => `- ${country.code}: ${country.songs.slice(0, 5).map((song) => `${song.title}${song.author ? ` - ${song.author}` : ''}`).join(' / ')}`),
  '',
];
writeFileSync(OUTPUT_SUMMARY, lines.join('\n'), 'utf8');

console.log(`JSON: ${OUTPUT_JSON}`);
console.log(`SUMMARY: ${OUTPUT_SUMMARY}`);
