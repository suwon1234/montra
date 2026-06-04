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
const OUTPUT_JSON = path.join(outputDir, `focus25_carry_forward_${WINDOW_DATE}.json`);
const OUTPUT_MD = path.join(outputDir, `focus25_carry_forward_${WINDOW_DATE}.md`);
const ARCHIVE_VERIFIED_JSON = path.join(outputDir, 'verified_focus_market_trends_2026-04-30.json');
const args = new Set(process.argv.slice(2));
const applyToDb = args.has('--apply');

const FOCUS_MARKET_CODES = [
  'KR', 'JP', 'US', 'CN', 'GB', 'BR', 'MX', 'ID', 'TH', 'VN',
  'PH', 'SG', 'TW', 'HK', 'FR', 'DE', 'IT', 'ES', 'CA', 'AU',
  'IN', 'MY', 'AE', 'SA', 'TR',
];

const MANUAL_GAPFILL_ROWS = [
  {
    country_code: 'CN',
    category: 'products',
    name: 'DeepSeek V4',
    name_local: 'DeepSeek V4',
    description: '중국에서는 이번 주 DeepSeek의 모델 V4가 다시 강하게 붙었습니다. 공개 직후 성능 비교와 중국 AI 생태계 기사들이 같은 주에 이어져 기술 제품 관심 신호로 볼 수 있습니다.',
    heat_score: 87,
    heat_status: 'rising',
    search_score: 92,
    social_score: 83,
    ecommerce_score: 61,
    news_score: 88,
    source_urls: [
      'https://apnews.com/article/deepseek-ai-china-gpt-v4-d2ed33f2521917193616e061674d5f92',
      'https://www.investing.com/news/economy-news/factboxdeepseekv4-the-chinese-ai-model-adapted-for-huawei-chips-4636025',
    ],
    first_detected_at: '2026-04-24T09:59:00+08:00',
    last_updated_at: '2026-04-29T07:00:00+08:00',
  },
  {
    country_code: 'MY',
    category: 'brands',
    name: "Dior J'adore Intense Pop-up",
    name_local: "디오르 자도르 인텐스 팝업",
    description: '말레이시아에서는 4월 중순부터 쿠알라룸푸르 미드밸리 메가몰의 디오르 자도르 인텐스 팝업이 강하게 노출됐습니다. 공식 팝업 페이지와 쇼핑몰 행사 캘린더가 같은 기간을 확인해 줘서 뷰티 체험형 브랜드 트렌드로 반영할 만합니다.',
    heat_score: 82,
    heat_status: 'rising',
    search_score: 78,
    social_score: 84,
    ecommerce_score: 73,
    news_score: 74,
    source_urls: [
      'https://www.dior.com/en_my/beauty/page/event-page.html',
      'https://www.midvalley.com.my/whats-on/this-week/',
    ],
    first_detected_at: '2026-04-14T10:00:00+08:00',
    last_updated_at: '2026-04-26T22:00:00+08:00',
  },
  {
    country_code: 'AE',
    category: 'brands',
    name: 'Primark UAE Expansion',
    name_local: '프라이마크 UAE 확장',
    description: 'UAE에서는 프라이마크의 두바이 확장이 이번 주에도 강하게 이어졌습니다. 현지 매체가 몰 오브 더 에미리트 3호점 오픈 일정을 새로 다뤘고, 첫 진출 이후 점포를 늘리는 흐름이 확인돼 패션 유통 트렌드로 볼 수 있습니다.',
    heat_score: 85,
    heat_status: 'rising',
    search_score: 81,
    social_score: 80,
    ecommerce_score: 86,
    news_score: 82,
    source_urls: [
      'https://whatson.ae/2026/04/primark-announces-opening-date-for-mall-of-the-emirates-store/',
      'https://www.scenenow.com/News/Primark-to-Open-Mall-of-the-Emirates-Store-on-May-21st',
    ],
    first_detected_at: '2026-04-27T15:00:00+04:00',
    last_updated_at: '2026-04-27T18:00:00+04:00',
  },
  {
    country_code: 'SA',
    category: 'brands',
    name: 'NEOUS Saudi Launch',
    name_local: '네오어스 사우디 론칭',
    description: '사우디에서는 컨템포러리 럭셔리 브랜드 NEOUS가 현지 반응을 얻는 흐름이 같은 주 기사와 상품 페이지에서 확인됐습니다. 고가 액세서리와 럭셔리 소비 관심을 보여주는 브랜드 신호로 볼 수 있습니다.',
    heat_score: 78,
    heat_status: 'rising',
    search_score: 70,
    social_score: 76,
    ecommerce_score: 79,
    news_score: 80,
    source_urls: [
      'https://www.arabnews.com/node/2641006/lifestyle',
      'https://www.neous.co.uk/collections/shoulder-bags/products/berenices-east-west-burgundy',
    ],
    first_detected_at: '2026-04-23T17:01:00+03:00',
    last_updated_at: '2026-04-23T17:01:00+03:00',
  },
];

function isDateTag(tag) {
  return /^\d{4}-\d{2}-\d{2}$/.test(String(tag || ''));
}

function uniq(values) {
  return [...new Set((values || []).filter(Boolean))];
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

function buildCarryForwardTags(tags, carryFromDate, countryCode, category) {
  return uniq([
    ...(tags || []).filter((tag) => !isDateTag(tag) && tag !== 'carry-forward' && tag !== 'manual-gapfill'),
    'weekly-research',
    'verified',
    'verified-without-tiktok',
    'focus-market-verified-refresh',
    'carry-forward',
    `carry-forward-from-${carryFromDate}`,
    WINDOW_DATE,
    String(countryCode || '').toLowerCase(),
    category,
  ]);
}

function archivedScoreFields(category, searchScore) {
  if (category === 'challenge') return { social: Math.min(100, Math.round(searchScore * 0.9)), ecommerce: 0, news: Math.round(searchScore * 0.2) };
  if (category === 'brands') return { social: Math.min(100, Math.round(searchScore * 0.55)), ecommerce: Math.min(100, Math.round(searchScore * 0.35)), news: Math.round(searchScore * 0.15) };
  if (category === 'products') return { social: Math.min(100, Math.round(searchScore * 0.25)), ecommerce: Math.min(100, Math.round(searchScore * 0.65)), news: Math.round(searchScore * 0.1) };
  if (category === 'fashion') return { social: Math.min(100, Math.round(searchScore * 0.6)), ecommerce: Math.round(searchScore * 0.15), news: Math.round(searchScore * 0.1) };
  if (category === 'food') return { social: Math.min(100, Math.round(searchScore * 0.5)), ecommerce: Math.round(searchScore * 0.1), news: Math.round(searchScore * 0.15) };
  return { social: 0, ecommerce: 0, news: 0 };
}

function archivedHeatScore(searchScore, socialScore, ecommerceScore, newsScore) {
  return Math.round(searchScore * 0.4 + socialScore * 0.35 + ecommerceScore * 0.2 + newsScore * 0.05);
}

function loadArchivedRows() {
  if (!fs.existsSync(ARCHIVE_VERIFIED_JSON)) return [];
  const payload = JSON.parse(fs.readFileSync(ARCHIVE_VERIFIED_JSON, 'utf8'));
  return (payload.verified || []).map((item) => {
    const category = item.category;
    const searchScore = Math.min(100, Number(item.search_score || 70));
    const derived = archivedScoreFields(category, searchScore);
    return {
      country_id: null,
      category_id: null,
      country_code: item.country_code,
      category,
      name: item.name,
      name_local: item.name_local,
      description: item.description,
      heat_score: archivedHeatScore(searchScore, derived.social, derived.ecommerce, Math.max(derived.news, 55)),
      heat_status: 'rising',
      search_score: searchScore,
      social_score: derived.social,
      ecommerce_score: derived.ecommerce,
      news_score: Math.max(derived.news, 55),
      tags: ['weekly-research', 'verified', 'verified-without-tiktok', 'focus-market-verified-refresh', 'archived-source', '2026-04-30', item.country_code.toLowerCase(), category],
      source_urls: [...new Set((item.evidence || []).map((evidence) => evidence.url).filter(Boolean))],
      first_detected_at: item.first_detected_at,
      last_updated_at: item.last_updated_at,
      window_tag: '2026-04-30',
    };
  });
}

function loadManualGapfillRows() {
  return MANUAL_GAPFILL_ROWS.map((item) => ({
    country_id: null,
    category_id: null,
    country_code: item.country_code,
    category: item.category,
    name: item.name,
    name_local: item.name_local,
    description: item.description,
    heat_score: item.heat_score,
    heat_status: item.heat_status,
    search_score: item.search_score,
    social_score: item.social_score,
    ecommerce_score: item.ecommerce_score,
    news_score: item.news_score,
    tags: ['weekly-research', 'verified', 'verified-without-tiktok', 'focus-market-verified-refresh', 'manual-gapfill', '2026-04-30', item.country_code.toLowerCase(), item.category],
    source_urls: item.source_urls,
    first_detected_at: item.first_detected_at,
    last_updated_at: item.last_updated_at,
    window_tag: '2026-04-30',
  }));
}

async function resolveArchivedIds(client, rows) {
  if (!rows.length) return rows;

  const countryResult = await client.query(`
    SELECT id, code
    FROM countries
    WHERE code = ANY($1::text[])
  `, [[...new Set(rows.map((row) => row.country_code).filter(Boolean))]]);
  const countryIds = Object.fromEntries(countryResult.rows.map((row) => [row.code, row.id]));

  const categoryResult = await client.query(`
    SELECT id, slug
    FROM categories
    WHERE slug = ANY($1::text[])
  `, [[...new Set(rows.map((row) => row.category).filter(Boolean))]]);
  const categoryIds = Object.fromEntries(categoryResult.rows.map((row) => [row.slug, row.id]));

  return rows.map((row) => ({
    ...row,
    country_id: row.country_id || countryIds[row.country_code] || null,
    category_id: row.category_id || categoryIds[row.category] || null,
  }));
}

async function fetchFocusRows(client, includeToday) {
  const result = await client.query(`
    SELECT
      t.country_id,
      t.category_id,
      t.name,
      t.name_local,
      t.description,
      t.heat_score,
      t.heat_status,
      t.search_score,
      t.social_score,
      t.ecommerce_score,
      t.news_score,
      t.tags,
      t.source_urls,
      t.first_detected_at,
      t.last_updated_at,
      c.code AS country_code,
      cat.slug AS category
    FROM trends t
    JOIN countries c ON c.id = t.country_id
    JOIN categories cat ON cat.id = t.category_id
    WHERE 'focus-market-verified-refresh' = ANY(t.tags)
      AND c.code = ANY($1::text[])
      AND ($2::boolean = ('${WINDOW_DATE}' = ANY(t.tags)))
    ORDER BY c.code, cat.slug, t.heat_score DESC, t.last_updated_at DESC
  `, [FOCUS_MARKET_CODES, includeToday]);

  return result.rows.map((row) => {
    const dateTag = (row.tags || []).find(isDateTag) || null;
    return { ...row, window_tag: dateTag };
  });
}

async function fetchFallbackVerifiedRows(client) {
  const result = await client.query(`
    SELECT
      t.country_id,
      t.category_id,
      t.name,
      t.name_local,
      t.description,
      t.heat_score,
      t.heat_status,
      t.search_score,
      t.social_score,
      t.ecommerce_score,
      t.news_score,
      t.tags,
      t.source_urls,
      t.first_detected_at,
      t.last_updated_at,
      c.code AS country_code,
      cat.slug AS category
    FROM trends t
    JOIN countries c ON c.id = t.country_id
    JOIN categories cat ON cat.id = t.category_id
    WHERE 'verified' = ANY(t.tags)
      AND c.code = ANY($1::text[])
      AND NOT ($2 = ANY(t.tags))
      AND NOT ('auto-verified-global' = ANY(t.tags))
    ORDER BY c.code, t.heat_score DESC, t.last_updated_at DESC
  `, [FOCUS_MARKET_CODES, WINDOW_DATE]);

  return result.rows.map((row) => {
    const dateTag = (row.tags || []).find(isDateTag) || String(row.last_updated_at || '').slice(0, 10);
    return { ...row, window_tag: dateTag };
  });
}

function selectCarryForwardRows(todayRows, priorRows, fallbackRows, archivedRows) {
  const todayKeys = new Set(todayRows.map((row) => `${row.country_code}|${row.category}`));
  const latestByCountry = {};

  for (const row of priorRows) {
    if (!row.window_tag) continue;
    if (!latestByCountry[row.country_code] || row.window_tag > latestByCountry[row.country_code]) {
      latestByCountry[row.country_code] = row.window_tag;
    }
  }

  const carryRows = [];
  const unresolvedCountries = [];

  for (const countryCode of FOCUS_MARKET_CODES) {
    const latestDate = latestByCountry[countryCode];
    if (latestDate) {
      const countryRows = priorRows.filter((row) => row.country_code === countryCode && row.window_tag === latestDate);
      for (const row of countryRows) {
        const key = `${row.country_code}|${row.category}`;
        if (todayKeys.has(key)) continue;
        carryRows.push({ ...row, carry_from_date: latestDate });
      }
      continue;
    }

    const archivedCountryRows = archivedRows.filter((row) => row.country_code === countryCode);
    if (archivedCountryRows.length > 0) {
      latestByCountry[countryCode] = archivedCountryRows[0].window_tag || '2026-04-30';
      for (const row of archivedCountryRows) {
        const key = `${row.country_code}|${row.category}`;
        if (todayKeys.has(key)) continue;
        carryRows.push({ ...row, carry_from_date: row.window_tag || '2026-04-30' });
      }
      continue;
    }

    const fallbackCountryRows = fallbackRows.filter((row) => row.country_code === countryCode).slice(0, 2);
    if (fallbackCountryRows.length > 0) {
      latestByCountry[countryCode] = fallbackCountryRows[0].window_tag || String(fallbackCountryRows[0].last_updated_at || '').slice(0, 10);
      for (const row of fallbackCountryRows) {
        const key = `${row.country_code}|${row.category}`;
        if (todayKeys.has(key)) continue;
        carryRows.push({ ...row, carry_from_date: row.window_tag || String(row.last_updated_at || '').slice(0, 10) });
      }
      continue;
    }

    unresolvedCountries.push(countryCode);
  }

  return { carryRows, latestByCountry, unresolvedCountries };
}

async function applyCarryForwardRows(client, rows) {
  for (const row of rows) {
    if (!row.country_id || !row.category_id) continue;
    const nextTags = buildCarryForwardTags(row.tags, row.carry_from_date, row.country_code, row.category);
    const updated = await client.query(`
      UPDATE trends
      SET tags = $1::text[]
      WHERE country_id = $2
        AND name = $3
      RETURNING id
    `, [nextTags, row.country_id, row.name]);

    if (updated.rowCount > 0) continue;

    await client.query(`
      INSERT INTO trends (
        country_id,
        category_id,
        name,
        name_local,
        description,
        heat_score,
        heat_status,
        search_score,
        social_score,
        ecommerce_score,
        news_score,
        tags,
        source_urls,
        first_detected_at,
        last_updated_at
      )
      VALUES (
        $1, $2, $3, $4, $5, $6, $7,
        $8, $9, $10, $11, $12, $13,
        $14::timestamptz, $15::timestamptz
      )
    `, [
      row.country_id,
      row.category_id,
      row.name,
      row.name_local,
      row.description,
      row.heat_score,
      row.heat_status,
      row.search_score,
      row.social_score,
      row.ecommerce_score,
      row.news_score,
      nextTags,
      row.source_urls || [],
      row.first_detected_at,
      row.last_updated_at,
    ]);
  }
}

async function fetchFinalCounts(client) {
  const result = await client.query(`
    SELECT c.code, COUNT(*)::int AS cnt
    FROM trends t
    JOIN countries c ON c.id = t.country_id
    WHERE 'focus-market-verified-refresh' = ANY(t.tags)
      AND $1 = ANY(t.tags)
      AND c.code = ANY($2::text[])
    GROUP BY c.code
    ORDER BY c.code
  `, [WINDOW_DATE, FOCUS_MARKET_CODES]);
  return result.rows;
}

function writeSummary(payload) {
  fs.mkdirSync(outputDir, { recursive: true });
  fs.writeFileSync(OUTPUT_JSON, `${JSON.stringify(payload, null, 2)}\n`, 'utf8');

  const lines = [
    `# Focus 25 Carry Forward ${WINDOW_DATE}`,
    '',
    `- Today's fresh focus rows: ${payload.today_rows}`,
    `- Carry-forward rows inserted: ${payload.carry_forward_rows}`,
    `- Final covered countries: ${payload.final_country_count}`,
    payload.unresolved_countries.length > 0
      ? `- Unresolved countries: ${payload.unresolved_countries.join(', ')}`
      : '- Unresolved countries: none',
    '',
    '## Carry Forward Sources',
    ...FOCUS_MARKET_CODES.map((code) => `- ${code}: ${payload.latest_by_country[code] || 'none'}`),
    '',
    '## Final Row Counts',
    ...payload.final_counts.map((row) => `- ${row.code}: ${row.cnt}`),
    '',
  ];

  fs.writeFileSync(OUTPUT_MD, `${lines.join('\n')}\n`, 'utf8');
}

async function main() {
  const env = loadEnv();
  const databaseUrl = process.env.DATABASE_URL ?? env.DATABASE_URL;
  if (!databaseUrl) throw new Error('DATABASE_URL is missing.');

  const client = new Client({ connectionString: databaseUrl });
  await client.connect();

  const todayRows = await fetchFocusRows(client, true);
  const priorRows = await fetchFocusRows(client, false);
  const fallbackRows = await fetchFallbackVerifiedRows(client);
  const archivedRows = await resolveArchivedIds(client, [...loadArchivedRows(), ...loadManualGapfillRows()]);
  const { carryRows, latestByCountry, unresolvedCountries } = selectCarryForwardRows(todayRows, priorRows, fallbackRows, archivedRows);

  if (applyToDb) {
    await applyCarryForwardRows(client, carryRows);
  }

  const finalCounts = applyToDb ? await fetchFinalCounts(client) : [];
  await client.end();

  const payload = {
    window_date: WINDOW_DATE,
    today_rows: todayRows.length,
    carry_forward_rows: carryRows.length,
    final_country_count: finalCounts.length,
    unresolved_countries: unresolvedCountries,
    latest_by_country: latestByCountry,
    carried_rows: carryRows.map((row) => ({
      country_code: row.country_code,
      category: row.category,
      name: row.name,
      carry_from_date: row.carry_from_date,
    })),
    final_counts: finalCounts,
  };

  writeSummary(payload);

  console.log(`JSON: ${path.relative(rootDir, OUTPUT_JSON)}`);
  console.log(`MD: ${path.relative(rootDir, OUTPUT_MD)}`);
  console.log(`today_rows: ${todayRows.length}, carry_forward_rows: ${carryRows.length}, final_country_count: ${finalCounts.length}, applied: ${applyToDb}`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
