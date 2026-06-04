import fs from 'fs';
import path from 'path';
import pg from 'pg';

const { Client } = pg;

const WINDOW_DATE = '2026-04-30';
const WINDOW_AT = `${WINDOW_DATE}T00:00:00+09:00`;
const OUTPUT_JSON = path.join('scripts', 'output', `focus25_gapfill_${WINDOW_DATE}.json`);
const OUTPUT_MD = path.join('scripts', 'output', `focus25_gapfill_${WINDOW_DATE}.md`);

const args = new Set(process.argv.slice(2));
const applyToDb = args.has('--apply');

const PROMOTE_EXISTING = [
  {
    country_code: 'JP',
    category: 'fashion',
    name: 'adidas Originals Handball Spezial',
    why: '4월 24일자 검증행이 이미 있었지만 4월 30일 리프레시 태그가 빠져 있던 케이스',
  },
  {
    country_code: 'DE',
    category: 'food',
    name: 'Desperados Tropical Daiquiri',
    why: '4월 24일자 검증행이 이미 있었지만 4월 30일 리프레시 태그가 빠져 있던 케이스',
  },
  {
    country_code: 'HK',
    category: 'brands',
    name: 'Longines',
    why: '4월 24일자 검증행이 이미 있었지만 4월 30일 리프레시 태그가 빠져 있던 케이스',
  },
];

const NEW_RECORDS = [
  {
    country_code: 'CN',
    category: 'products',
    name: 'DeepSeek V4',
    name_local: 'DeepSeek V4',
    description:
      '중국에서는 이번 주 DeepSeek의 새 모델 V4가 다시 강하게 붙었습니다. 검색 급등 신호와 함께 4월 24일 공개, 화웨이 칩 지원, 성능 비교 이슈가 같은 주 기사로 이어져 기술 소비 트렌드이자 AI 관심 신호로 볼 수 있습니다.',
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
    evidence_summary: [
      'AP: 4월 24일 DeepSeek V4 공개와 화웨이 칩 지원 보도',
      'Reuters/Investing: 4월 24일 V4 사양과 중국 자립형 AI 생태계 포인트 정리',
    ],
  },
  {
    country_code: 'MY',
    category: 'brands',
    name: "Dior J'adore Intense Pop-up",
    name_local: "디올 자도르 인텐스 팝업",
    description:
      '말레이시아에서는 4월 중순부터 쿠알라룸푸르 미드밸리 메가몰의 디올 자도르 인텐스 팝업이 강하게 노출됐습니다. 공식 팝업 페이지와 쇼핑몰 행사 캘린더가 같은 기간을 확인해 주고 있어, 향수/뷰티 럭셔리 브랜드 체험형 트렌드로 반영할 만합니다.',
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
    evidence_summary: [
      'Dior MY: Mid Valley Megamall 팝업 일정 4월 14일~26일 명시',
      'Mid Valley Megamall: 같은 기간 행사 캘린더에 DIOR BEAUTY JADORE POP-UP 등록',
    ],
  },
  {
    country_code: 'AE',
    category: 'brands',
    name: 'Primark UAE Expansion',
    name_local: '프라이마크 UAE 확장',
    description:
      'UAE에서는 프라이마크의 두바이 확장이 이번 주에도 강하게 이어졌습니다. 현지 매체가 몰 오브 더 에미리트 3호점 오픈 일정을 새로 다뤘고, UAE 첫 진출 이후 연달아 점포를 늘리는 흐름이 확인돼 패션 유통 트렌드로 넣을 만합니다.',
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
    evidence_summary: [
      "What's On Dubai: 4월 27일 몰 오브 더 에미리트 3호점 일정 보도",
      'Scene Now UAE: 같은 날 UAE 내 세 번째 매장 확장 흐름 보도',
    ],
  },
  {
    country_code: 'SA',
    category: 'brands',
    name: 'NEOUS Saudi Launch',
    name_local: '네오우스 사우디 런칭',
    description:
      '사우디에서는 컨템퍼러리 슈즈·백 브랜드 NEOUS가 현지 반응을 얻는 흐름이 이번 주에도 확인됐습니다. Arab News가 사우디 여성 고객 반응을 직접 전했고, 브랜드 공식 제품군도 함께 열려 있어 럭셔리 액세서리 관심도 신호로 반영했습니다.',
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
    evidence_summary: [
      'Arab News: 4월 23일 사우디 런칭 반응과 현지 고객 수요 보도',
      'NEOUS 공식 페이지: 대표 숄더백 제품군과 판매 구성을 확인',
    ],
  },
];

function loadEnv() {
  const envPath = path.join('.env.local');
  const env = {};
  for (const rawLine of fs.readFileSync(envPath, 'utf8').split(/\r?\n/)) {
    const line = rawLine.trim();
    if (!line || line.startsWith('#') || !line.includes('=')) continue;
    const index = line.indexOf('=');
    env[line.slice(0, index).trim()] = line.slice(index + 1).trim();
  }
  return env;
}

function uniq(values) {
  return [...new Set(values.filter(Boolean))];
}

function buildTags(countryCode, category, extra = []) {
  return uniq([
    'weekly-research',
    'verified',
    'verified-without-tiktok',
    'focus-market-verified-refresh',
    'manual-gapfill',
    WINDOW_DATE,
    countryCode.toLowerCase(),
    category,
    ...extra,
  ]);
}

function summarize(actions, finalCounts) {
  fs.mkdirSync(path.join('scripts', 'output'), { recursive: true });

  fs.writeFileSync(
    OUTPUT_JSON,
    `${JSON.stringify({ window_date: WINDOW_DATE, actions, final_counts: finalCounts }, null, 2)}\n`,
    'utf8'
  );

  const lines = [
    `# Focus 25 Gapfill ${WINDOW_DATE}`,
    '',
    `- 승격 처리: ${actions.filter((item) => item.type === 'promote').length}건`,
    `- 신규 삽입: ${actions.filter((item) => item.type === 'insert').length}건`,
    '',
    '## 처리 내역',
    ...actions.map((item, index) => {
      const detail = item.type === 'promote'
        ? `${item.country_code} / ${item.category} / ${item.name} / 기존 검증행 승격`
        : `${item.country_code} / ${item.category} / ${item.name} / 신규 검증행 삽입`;
      return `${index + 1}. ${detail}`;
    }),
    '',
    '## 2026-04-30 리프레시 국가별 건수',
    ...finalCounts.map((row) => `- ${row.code}: ${row.cnt}`),
    '',
  ];

  fs.writeFileSync(OUTPUT_MD, `${lines.join('\n')}\n`, 'utf8');
}

async function loadIds(client) {
  const countries = await client.query('SELECT id, code FROM countries');
  const categories = await client.query('SELECT id, slug FROM categories');
  return {
    countryIds: Object.fromEntries(countries.rows.map((row) => [row.code, row.id])),
    categoryIds: Object.fromEntries(categories.rows.map((row) => [row.slug, row.id])),
  };
}

async function promoteExistingRows(client) {
  const actions = [];

  for (const item of PROMOTE_EXISTING) {
    const result = await client.query(
      `SELECT t.id, t.tags
       FROM trends t
       JOIN countries c ON c.id = t.country_id
       JOIN categories cat ON cat.id = t.category_id
       WHERE c.code = $1
         AND cat.slug = $2
         AND t.name = $3
       ORDER BY t.last_updated_at DESC
       LIMIT 1`,
      [item.country_code, item.category, item.name]
    );

    if (result.rows.length === 0) {
      throw new Error(`승격 대상 행을 찾지 못했습니다: ${item.country_code} / ${item.category} / ${item.name}`);
    }

    const row = result.rows[0];
    const nextTags = uniq([
      ...(row.tags ?? []),
      ...buildTags(item.country_code, item.category),
    ]);

    await client.query('UPDATE trends SET tags = $1::text[] WHERE id = $2', [nextTags, row.id]);

    actions.push({
      type: 'promote',
      country_code: item.country_code,
      category: item.category,
      name: item.name,
      row_id: row.id,
      why: item.why,
    });
  }

  return actions;
}

async function insertNewRows(client, ids) {
  const actions = [];

  for (const item of NEW_RECORDS) {
    const countryId = ids.countryIds[item.country_code];
    const categoryId = ids.categoryIds[item.category];
    if (!countryId || !categoryId) {
      throw new Error(`국가/카테고리 ID를 찾지 못했습니다: ${item.country_code} / ${item.category}`);
    }

    await client.query(
      `DELETE FROM trends
       WHERE country_id = $1
         AND category_id = $2
         AND name = $3
         AND 'manual-gapfill' = ANY(tags)
         AND $4 = ANY(tags)`,
      [countryId, categoryId, item.name, WINDOW_DATE]
    );

    const tags = buildTags(item.country_code, item.category, ['fresh-verified']);
    const insert = await client.query(
      `INSERT INTO trends (
        country_id, category_id, name, name_local, description, heat_score, heat_status,
        search_score, social_score, ecommerce_score, news_score, tags, source_urls,
        first_detected_at, last_updated_at
      )
      VALUES (
        $1, $2, $3, $4, $5, $6, $7,
        $8, $9, $10, $11, $12::text[], $13::text[],
        $14::timestamptz, $15::timestamptz
      )
      RETURNING id`,
      [
        countryId,
        categoryId,
        item.name,
        item.name_local,
        item.description,
        item.heat_score,
        item.heat_status,
        item.search_score,
        item.social_score,
        item.ecommerce_score,
        item.news_score,
        tags,
        item.source_urls,
        item.first_detected_at,
        item.last_updated_at,
      ]
    );

    actions.push({
      type: 'insert',
      country_code: item.country_code,
      category: item.category,
      name: item.name,
      row_id: insert.rows[0].id,
      source_urls: item.source_urls,
      evidence_summary: item.evidence_summary,
    });
  }

  return actions;
}

async function fetchFinalCounts(client) {
  const result = await client.query(
    `SELECT c.code, COUNT(*)::int AS cnt
     FROM trends t
     JOIN countries c ON c.id = t.country_id
     WHERE 'focus-market-verified-refresh' = ANY(t.tags)
       AND $1 = ANY(t.tags)
     GROUP BY c.code
     ORDER BY c.code`,
    [WINDOW_DATE]
  );
  return result.rows;
}

async function main() {
  const env = loadEnv();
  const client = new Client({ connectionString: process.env.DATABASE_URL ?? env.DATABASE_URL });
  const actions = [];

  try {
    await client.connect();

    if (applyToDb) {
      await client.query('BEGIN');
      const ids = await loadIds(client);
      actions.push(...await promoteExistingRows(client));
      actions.push(...await insertNewRows(client, ids));
      const finalCounts = await fetchFinalCounts(client);
      await client.query('COMMIT');
      summarize(actions, finalCounts);
      console.log(`applied: ${actions.length}`);
      console.log(`json: ${OUTPUT_JSON}`);
      console.log(`md: ${OUTPUT_MD}`);
      return;
    }

    actions.push(
      ...PROMOTE_EXISTING.map((item) => ({
        type: 'promote',
        country_code: item.country_code,
        category: item.category,
        name: item.name,
        why: item.why,
      })),
      ...NEW_RECORDS.map((item) => ({
        type: 'insert',
        country_code: item.country_code,
        category: item.category,
        name: item.name,
        source_urls: item.source_urls,
        evidence_summary: item.evidence_summary,
      }))
    );
    summarize(actions, []);
    console.log(`planned: ${actions.length}`);
    console.log(`json: ${OUTPUT_JSON}`);
    console.log(`md: ${OUTPUT_MD}`);
  } finally {
    await client.end().catch(() => {});
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
