import { readFileSync, writeFileSync } from 'fs';

const WINDOW_DATE = '2026-04-16';
const VERIFIED_DONE = new Set(['KR', 'JP', 'US', 'CA']);
const OUTPUT_JSON = `scripts/output/remaining_country_queue_${WINDOW_DATE}.json`;
const OUTPUT_MD = `scripts/output/remaining_country_queue_${WINDOW_DATE}.md`;

const ids = JSON.parse(readFileSync('scripts/config/supabase_ids.json', 'utf8'));
const rss = JSON.parse(readFileSync(`scripts/output/global_rss_candidates_${WINDOW_DATE}.json`, 'utf8'));
const rssByCode = new Map(rss.countries.map((country) => [country.code, country]));

const priority = [
  'BR', 'CN', 'MX', 'GB', 'FR', 'DE', 'IT', 'ES', 'IN', 'ID',
  'PH', 'SG', 'TW', 'HK', 'TH', 'VN', 'MY', 'AU', 'NZ', 'TR',
  'AE', 'SA', 'ZA', 'NG', 'KE', 'NL', 'SE', 'NO', 'DK', 'FI',
];

const allCountries = Object.keys(ids.countries).sort().filter((code) => !VERIFIED_DONE.has(code));
const rows = allCountries.map((code) => {
  const candidate = rssByCode.get(code);
  const candidateCount = candidate?.items?.length ?? 0;
  return {
    code,
    country_id: ids.countries[code],
    rss_status: candidate?.status ?? null,
    rss_candidate_count: candidateCount,
    priority_rank: priority.includes(code) ? priority.indexOf(code) + 1 : 999,
    status: candidateCount > 0 ? 'ready_for_manual_verification' : 'needs_alternate_sources',
    next_step_ko: candidateCount > 0
      ? 'RSS 후보에서 스포츠/정치/날씨를 제거하고, 음식·패션·상품·브랜드·챌린지별 실제 항목을 검증한다.'
      : 'Google Trends RSS 후보가 없으므로 TikTok, Instagram, YouTube, 현지 매체/리테일러 링크로 별도 조사한다.',
  };
}).sort((a, b) => a.priority_rank - b.priority_rank || b.rss_candidate_count - a.rss_candidate_count || a.code.localeCompare(b.code));

writeFileSync(OUTPUT_JSON, JSON.stringify({
  generated_at: new Date().toISOString(),
  window_date: WINDOW_DATE,
  already_verified: [...VERIFIED_DONE].sort(),
  remaining_count: rows.length,
  rows,
}, null, 2), 'utf8');

const ready = rows.filter((row) => row.status === 'ready_for_manual_verification');
const alternate = rows.filter((row) => row.status === 'needs_alternate_sources');
const lines = [
  `# Remaining Country Queue ${WINDOW_DATE}`,
  '',
  `- 이미 완료: ${[...VERIFIED_DONE].sort().join(', ')}`,
  `- 남은 국가: ${rows.length}`,
  `- RSS 후보 있음: ${ready.length}`,
  `- 대체 소스 필요: ${alternate.length}`,
  '',
  '## 우선 조사',
  ...rows.slice(0, 40).map((row, index) => `${index + 1}. ${row.code} - ${row.status}, RSS 후보 ${row.rss_candidate_count}개`),
  '',
  '## 대체 소스 필요',
  ...alternate.map((row) => `- ${row.code} - RSS status ${row.rss_status}`),
  '',
];
writeFileSync(OUTPUT_MD, lines.join('\n'), 'utf8');

console.log(`JSON: ${OUTPUT_JSON}`);
console.log(`MD: ${OUTPUT_MD}`);
console.log(`remaining: ${rows.length}, ready: ${ready.length}, alternate: ${alternate.length}`);
