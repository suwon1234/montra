import { readFileSync, writeFileSync } from 'fs';
import pg from 'pg';

const WINDOW_DATE = '2026-04-16';
const UPDATE_SQL = 'scripts/output/verified_4countries_concrete_ko_2026-04-16.update.sql';
const FULL_SQL = 'scripts/output/verified_4countries_concrete_ko_2026-04-16.sql';
const TARGET_COUNTRIES = ['KR', 'JP', 'US', 'CA'];

function loadEnv() {
  const env = {};
  for (const line of readFileSync('.env.local', 'utf8').split(/\r?\n/)) {
    const index = line.indexOf('=');
    if (index <= 0) continue;
    env[line.slice(0, index).trim()] = line.slice(index + 1).trim();
  }
  return env;
}

function q(value) {
  if (value === null || value === undefined) return 'NULL';
  return `'${String(value).replace(/'/g, "''")}'`;
}

function arr(values) {
  if (!Array.isArray(values)) return 'NULL';
  return `ARRAY[${values.map(q).join(',')}]`;
}

function sqlDate(value) {
  return value instanceof Date ? value.toISOString() : new Date(value).toISOString();
}

const updates = [
  {
    country: 'KR',
    category: 'food',
    matchName: '버터떡 편의점 확산',
    name: 'GS25 쫀득버터떡빵',
    nameLocal: 'GS25 쫀득버터떡빵',
    description: 'GS25가 버터떡 유행을 바로 편의점 상품으로 만든 디저트입니다. 우리동네GS 사전예약 물량이 빠르게 소진됐고, 겉은 바삭하고 속은 쫀득한 식감이 포인트예요.',
    tags: ['kr', 'weekly-research', 'verified', 'food', 'dessert', 'gs25', 'butter-tteok', 'product'],
    sourceUrls: ['https://www.etnews.com/20260403000101', 'https://zdnet.co.kr/view/?no=20260403085247'],
  },
  {
    country: 'KR',
    category: 'food',
    matchName: '양지감로 디저트',
    name: '스타벅스 우베 바스크 치즈케이크',
    nameLocal: '스타벅스 우베 바스크 치즈케이크',
    description: '우베 열풍이 카페 디저트로 넘어온 대표 상품입니다. 스타벅스가 4월 14일부터 한정 출시한 보랏빛 치즈케이크라 화면에서 바로 “무슨 디저트인지” 보이기 좋습니다.',
    tags: ['kr', 'weekly-research', 'verified', 'food', 'dessert', 'starbucks', 'ube', 'product'],
    sourceUrls: ['https://www.donga.com/news/article/all/20260414/133737423/2', 'https://mobile.newsis.com/view/NISX20260413_0003588420'],
  },
  {
    country: 'KR',
    category: 'food',
    matchName: '편의점 SNS 디저트 출시',
    name: '이마트24 겉바속쫀버터떡빵',
    nameLocal: '이마트24 겉바속쫀버터떡빵',
    description: '이마트24가 SNS 버터떡 흐름을 편의점 빵으로 만든 상품입니다. 국산 찹쌀과 뉴질랜드산 버터를 넣어 “떡 같은 빵” 식감을 앞세운 4월 신상이에요.',
    tags: ['kr', 'weekly-research', 'verified', 'food', 'dessert', 'emart24', 'butter-tteok', 'product'],
    sourceUrls: ['https://www.hankyung.com/article/202603318296i', 'https://www.viva100.com/article/20260413500357'],
  },
  {
    country: 'KR',
    category: 'food',
    matchName: '우베 디저트 음료',
    name: '투썸플레이스 투썸 우베 라떼',
    nameLocal: '투썸플레이스 투썸 우베 라떼',
    description: '투썸플레이스 우베 음료 3종 중 대표로 잡힌 메뉴입니다. 출시 3일 기준 비커피 음료 판매 상위권으로 언급돼 보라색 인증샷 흐름을 설명하기 좋습니다.',
    tags: ['kr', 'weekly-research', 'verified', 'food', 'drink', 'twosome-place', 'ube', 'product'],
    sourceUrls: ['https://www.etnews.com/20260401000333', 'https://m.news.nate.com/view/20260410n15860'],
  },
  {
    country: 'KR',
    category: 'food',
    matchName: '쫀득 식감 디저트',
    name: '노티드 우베 밀키크림 도넛',
    nameLocal: '노티드 우베 밀키크림 도넛',
    description: '노티드가 4월 10일 공개한 우베 신메뉴 중 도넛 대표 상품입니다. 우베 커스터드와 생크림을 채운 보라색 도넛이라 썸네일과 상품명이 함께 살아납니다.',
    tags: ['kr', 'weekly-research', 'verified', 'food', 'dessert', 'knotted', 'ube', 'product'],
    sourceUrls: ['https://www.hankyung.com/article/202604101101P', 'https://m.news.nate.com/view/20260410n09860'],
  },

  {
    country: 'KR',
    category: 'fashion',
    matchName: '봄 신발 교체',
    name: '페이즈 Leather String Flat / Cheese',
    nameLocal: 'PAES Leather String Flat / Cheese',
    description: '29CM 봄 슈즈 기획전에서 잡힌 페이즈 치즈 컬렉션 플랫입니다. “봄 신발”이 아니라 타비형 스트링 플랫이라는 실제 모델명까지 보여줄 수 있습니다.',
    tags: ['kr', 'weekly-research', 'verified', 'fashion', 'shoes', 'paes', 'product'],
    sourceUrls: ['https://www.29cm.co.kr/content/brand-event/2026/04/07/2nd?cache=true', 'https://p-aes.com/product/leather-string-flat-cheese/257/'],
  },
  {
    country: 'KR',
    category: 'fashion',
    matchName: '가벼운 레이어드',
    name: '아트 이프 액츠 Wholegarment Round Neck Cardigan',
    nameLocal: 'ARTIFACTS Wholegarment Round Neck Cardigan',
    description: '29CM 라이징 브랜드 하이라이트에서 추천된 얇은 홀가먼트 가디건입니다. 추상적인 “가벼운 레이어드” 대신 바로 입을 수 있는 봄 가디건 상품으로 보여줍니다.',
    tags: ['kr', 'weekly-research', 'verified', 'fashion', 'cardigan', 'artifacts', 'product'],
    sourceUrls: ['https://www.29cm.co.kr/content/highlight/2026/04/08/1st?cache=true'],
  },
  {
    country: 'KR',
    category: 'fashion',
    matchName: '봄 액티브웨어',
    name: 'KEEN x EARTH THE ARCHIVE Sport Biker Shorts',
    nameLocal: 'KEEN x EARTH THE ARCHIVE Sport Biker Shorts',
    description: '4월 16일 29CM 한정 오더에 올라온 킨 x 얼스디아카이브 협업 액티브웨어입니다. 운동복 느낌만 말하는 게 아니라 실제 바이커 쇼츠 상품으로 잡았습니다.',
    tags: ['kr', 'weekly-research', 'verified', 'fashion', 'activewear', 'keen', 'earth-the-archive', 'product'],
    sourceUrls: ['https://www.29cm.co.kr/content/29-limited-order/2026/04/earththearchive-keen?cache=true'],
  },
  {
    country: 'KR',
    category: 'fashion',
    matchName: '글로벌 캐주얼 브랜드 픽',
    name: '키에레이 LUCID WEDGE MULE [C5S12]',
    nameLocal: 'CHIELEI LUCID WEDGE MULE [C5S12]',
    description: '29CM 단독 빠른배송으로 걸린 키에레이 웨지 뮬입니다. 봄 캐주얼 슈즈 흐름을 “브랜드 픽”으로 뭉개지 않고 모델명과 형태가 보이게 바꿨습니다.',
    tags: ['kr', 'weekly-research', 'verified', 'fashion', 'shoes', 'chielei', 'product'],
    sourceUrls: ['https://product.29cm.co.kr/catalog/3183503?id=3311484', 'https://www.29cm.co.kr/content/brand-event/2026/04/07/2nd?cache=true'],
  },
  {
    country: 'KR',
    category: 'fashion',
    matchName: '봄 아웃도어룩',
    name: 'KEEN x EARTH THE ARCHIVE NEWPORT H2 Little Explorer Set',
    nameLocal: 'KEEN x EARTH THE ARCHIVE NEWPORT H2 Little Explorer Set',
    description: '29CM에서 4월 16일 단독 선오픈한 킨 x 얼스디아카이브 뉴포트 H2 세트입니다. “아웃도어룩” 대신 샌들 중심 협업 상품으로 보여줄 수 있습니다.',
    tags: ['kr', 'weekly-research', 'verified', 'fashion', 'outdoor', 'shoes', 'keen', 'product'],
    sourceUrls: ['https://www.29cm.co.kr/content/29-limited-order/2026/04/earththearchive-keen?cache=true'],
  },

  {
    country: 'US',
    category: 'fashion',
    matchName: '스니커리나',
    name: 'Puma Speedcat Ballet Sneaker',
    nameLocal: 'Puma Speedcat Ballet Sneaker',
    description: '미국에서 “스니커리나”라고 뭉뚱그려 말할 때 대표로 보여주기 좋은 실제 모델입니다. 발레 플랫 느낌과 스니커즈 착화감을 섞은 푸마 스피드캣 라인입니다.',
    tags: ['us', 'weekly-research', 'verified', 'fashion', 'shoes', 'puma', 'product'],
    sourceUrls: ['https://www.instyle.com/how-to-wear-ballet-sneakers-11950027'],
  },
  {
    country: 'US',
    category: 'fashion',
    matchName: '플로럴 드레스',
    name: 'Chloe Retro Rose Floral Dress',
    nameLocal: 'Chloe Retro Rose Floral Dress',
    description: 'Vogue가 2026 봄 플로럴 드레스 흐름에서 클로에의 80년대풍 장미 드레스를 대표 사례로 짚었습니다. “플로럴 드레스”보다 훨씬 구체적인 화면용 이름입니다.',
    tags: ['us', 'weekly-research', 'verified', 'fashion', 'dress', 'chloe', 'product'],
    sourceUrls: ['https://www.vogue.com/article/floral-dresses-spring-runways'],
  },
  {
    country: 'US',
    category: 'fashion',
    matchName: '2026 봄 핸드백 트렌드',
    name: 'Staud Lila Mini Bag',
    nameLocal: 'Staud Lila Mini Bag',
    description: 'Vogue 2026 봄 핸드백 가이드의 “petite pouch” 대표 상품입니다. 작은 새틴 백 흐름을 실제 구매 가능한 미니백 이름으로 보여줍니다.',
    tags: ['us', 'weekly-research', 'verified', 'fashion', 'bag', 'staud', 'product'],
    sourceUrls: ['https://www.vogue.com/article/spring-2026-handbag-trends'],
  },
  {
    country: 'US',
    category: 'fashion',
    matchName: '봄 슈즈 컬러',
    name: 'Vivaia Jogger Re-Nylon Sneakerinas',
    nameLocal: 'Vivaia Jogger Re-Nylon Sneakerinas',
    description: 'Vogue 2026 봄 슈즈 트렌드에서 슬림 스니커즈 사례로 잡힌 상품입니다. 컬러 이야기보다 “발레 스니커즈형 저상 스니커즈”라는 제품 형태가 선명합니다.',
    tags: ['us', 'weekly-research', 'verified', 'fashion', 'shoes', 'vivaia', 'product'],
    sourceUrls: ['https://www.vogue.com/article/spring-2026-shoe-trends'],
  },
  {
    country: 'US',
    category: 'fashion',
    matchName: '브로치 리바이벌',
    name: 'Black Suede Studio Gabby Loafers',
    nameLocal: 'Black Suede Studio Gabby Loafers',
    description: 'Vogue 2026 봄 슈즈 트렌드에서 백리스 로퍼 대표 상품으로 잡힌 모델입니다. 액세서리 키워드보다 실제 봄 신발 상품을 보여주는 쪽이 더 정확합니다.',
    tags: ['us', 'weekly-research', 'verified', 'fashion', 'shoes', 'loafers', 'product'],
    sourceUrls: ['https://www.vogue.com/article/spring-2026-shoe-trends', 'https://www.vogue.com/article/backless-loafers'],
  },
  {
    country: 'US',
    category: 'food',
    matchName: '택스데이 푸드 딜',
    name: 'Krispy Kreme Original Glazed Dozen Tax Day BOGO',
    nameLocal: 'Krispy Kreme Original Glazed Dozen Tax Day BOGO',
    description: '미국 Tax Day 딜 중 실제로 보여주기 쉬운 상품형 프로모션입니다. 4월 15일에 도넛 한 더즌 구매 시 Original Glazed 한 더즌을 추가로 주는 구성입니다.',
    tags: ['us', 'weekly-research', 'verified', 'food', 'dessert', 'krispy-kreme', 'tax-day', 'product'],
    sourceUrls: ['https://www.qsrmagazine.com/news/krispy-kreme-to-offer-bogo-dozen-doughnuts-on-tax-day/', 'https://www.kiplinger.com/taxes/tax-day-deals-2026'],
  },
  {
    country: 'US',
    category: 'food',
    matchName: '벤앤제리스 프리콘데이',
    name: 'Ben & Jerry’s Free Cone Day Scoop',
    nameLocal: 'Ben & Jerry’s Free Cone Day Scoop',
    description: '4월 14일 진행된 벤앤제리스 프리콘데이의 실제 제공 상품입니다. 이벤트명만 두지 않고 “스쿱 아이스크림 컵/콘”으로 바로 이해되게 정리했습니다.',
    tags: ['us', 'weekly-research', 'verified', 'food', 'ice-cream', 'ben-jerrys', 'free-cone-day', 'product'],
    sourceUrls: ['https://www.prnewswire.com/news-releases/today-is-ben--jerrys-free-cone-day-302741172.html', 'https://www.benjerry.com/scoop-shops/free-cone-day'],
  },

  {
    country: 'CA',
    category: 'fashion',
    matchName: '원색 컬러 코디',
    name: 'Babaton Synergy Bomber',
    nameLocal: 'Babaton Synergy Bomber',
    description: 'Global News의 캐나다 봄 패션 추천에 오른 아리치아 보머 재킷입니다. “컬러 코디”가 아니라 chocolatier brown 컬러의 실제 봄 아우터로 보여줄 수 있습니다.',
    tags: ['ca', 'weekly-research', 'verified', 'fashion', 'jacket', 'aritzia', 'product'],
    sourceUrls: ['https://globalnews.ca/the-curator/11707624/spring-2026-fashion-trends/', 'https://www.aritzia.com/us/en/product/synergy-bomber/122310.html'],
  },
  {
    country: 'CA',
    category: 'fashion',
    matchName: '깃털 디테일',
    name: 'Mancino Turquoise-Accent Brown Bandana',
    nameLocal: 'Mancino Turquoise-Accent Brown Bandana',
    description: '캐나다 봄 스타일에서 반다나를 가장 쉬운 스트리트 포인트로 소개하며 함께 제시된 Simons 상품입니다. 화면에는 “갈색 반다나 + 터키석 포인트”로 바로 보입니다.',
    tags: ['ca', 'weekly-research', 'verified', 'fashion', 'accessory', 'bandana', 'simons', 'product'],
    sourceUrls: ['https://globalnews.ca/the-curator/11707624/spring-2026-fashion-trends/'],
  },
  {
    country: 'CA',
    category: 'fashion',
    matchName: '1920년대풍 드레싱',
    name: 'The Sonia Medium Slouchy Tote Bag',
    nameLocal: 'The Sonia Medium Slouchy Tote Bag',
    description: '캐나다 봄 컬러 흐름 중 아이시 블루 계열 소프트 백으로 추천된 Anthropologie 토트입니다. 추상적인 드레싱 키워드보다 실제 가방 상품명이 더 명확합니다.',
    tags: ['ca', 'weekly-research', 'verified', 'fashion', 'bag', 'anthropologie', 'product'],
    sourceUrls: ['https://globalnews.ca/the-curator/11707624/spring-2026-fashion-trends/'],
  },
  {
    country: 'CA',
    category: 'fashion',
    matchName: '존재감 있는 스커트',
    name: 'Wilfred Henrietta Satin Skirt',
    nameLocal: 'Wilfred Henrietta Satin Skirt',
    description: 'Global News가 2026 봄 란제리 드레싱 흐름에서 찍은 Aritzia 새틴 스커트입니다. 레이스 트림이 있는 미디 슬립 스커트라 실제 상품 이미지가 떠오릅니다.',
    tags: ['ca', 'weekly-research', 'verified', 'fashion', 'skirt', 'aritzia', 'product'],
    sourceUrls: ['https://globalnews.ca/the-curator/11707624/spring-2026-fashion-trends/', 'https://www.aritzia.com/us/en/product/henrietta-satin-skirt/128560.html'],
  },
  {
    country: 'CA',
    category: 'fashion',
    matchName: '북시크 스타일',
    name: 'Jeffrey Campbell Trustee Chocolate Leather Ballet Flats',
    nameLocal: 'Jeffrey Campbell Trustee Chocolate Leather Ballet Flats',
    description: '캐나다 봄 플랫 슈즈 흐름에서 Simons 상품으로 제시된 초콜릿 컬러 가죽 발레 플랫입니다. “북시크” 같은 무드어 대신 실제 신발명을 보여줍니다.',
    tags: ['ca', 'weekly-research', 'verified', 'fashion', 'shoes', 'ballet-flats', 'simons', 'product'],
    sourceUrls: ['https://globalnews.ca/the-curator/11707624/spring-2026-fashion-trends/', 'https://www.simons.ca/en/women-footwear/all-our-shoes/trustee-chocolate-leather-ballet-flats--19147-26100'],
  },
];

function buildUpdateStatement(item) {
  return `UPDATE trends t SET
  name = ${q(item.name)},
  name_local = ${q(item.nameLocal)},
  description = ${q(item.description)},
  tags = ${arr(item.tags)},
  source_urls = ${arr(item.sourceUrls)}
WHERE t.country_id = (SELECT id FROM countries WHERE code = ${q(item.country)})
  AND t.category_id = (SELECT id FROM categories WHERE slug = ${q(item.category)})
  AND (t.name = ${q(item.matchName)} OR t.name_local = ${q(item.matchName)} OR t.name = ${q(item.name)})
  AND t.last_updated_at::date = DATE ${q(WINDOW_DATE)};`;
}

function buildInsertSql(rows) {
  const values = rows.map((row) => {
    const fields = [
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
    ];
    return `(${fields.map(q).join(', ')}, ${arr(row.tags)}, ${arr(row.source_urls)}, ${q(sqlDate(row.first_detected_at))}, ${q(sqlDate(row.last_updated_at))})`;
  });

  return [
    '-- 2026-04-16 실제 상품명 중심 한국어 트렌드 완성본',
    '-- 범위: KR, JP, US, CA / 국가별 25개 / 총 100개',
    '-- 원칙: 추상 키워드 대신 상품명, 메뉴명, 브랜드명, 곡명 단위로 표시',
    '',
    'BEGIN;',
    '',
    `DELETE FROM trends WHERE country_id IN (SELECT id FROM countries WHERE code IN (${TARGET_COUNTRIES.map(q).join(',')})) AND last_updated_at::date = DATE ${q(WINDOW_DATE)};`,
    '',
    'INSERT INTO trends (country_id, category_id, name, name_local, description, heat_score, heat_status, search_score, social_score, ecommerce_score, news_score, tags, source_urls, first_detected_at, last_updated_at) VALUES',
    `${values.join(',\n')};`,
    '',
    'COMMIT;',
    '',
  ].join('\n');
}

const env = loadEnv();
const databaseUrl = process.env.DATABASE_URL || env.DATABASE_URL;
if (!databaseUrl) {
  console.error('DATABASE_URL이 없습니다.');
  process.exit(1);
}

writeFileSync(
  UPDATE_SQL,
  [
    '-- 2026-04-16 concrete product-name refresh',
    `-- rows: ${updates.length}`,
    'BEGIN;',
    ...updates.map(buildUpdateStatement),
    'COMMIT;',
    '',
  ].join('\n\n'),
  'utf8'
);

const pool = new pg.Pool({ connectionString: databaseUrl });
try {
  await pool.query('BEGIN');
  let changed = 0;
  const missed = [];
  for (const item of updates) {
    const result = await pool.query(
      `UPDATE trends t
       SET name = $1,
         name_local = $2,
         description = $3,
         tags = $4::text[],
         source_urls = $5::text[]
       WHERE t.country_id = (SELECT id FROM countries WHERE code = $6)
         AND t.category_id = (SELECT id FROM categories WHERE slug = $7)
         AND (t.name = $8 OR t.name_local = $8 OR t.name = $1)
         AND t.last_updated_at::date = $9::date`,
      [
        item.name,
        item.nameLocal,
        item.description,
        item.tags,
        item.sourceUrls,
        item.country,
        item.category,
        item.matchName,
        WINDOW_DATE,
      ]
    );
    changed += result.rowCount;
    if (result.rowCount !== 1) missed.push(`${item.country}/${item.category}/${item.matchName}: ${result.rowCount}`);
  }
  if (missed.length) throw new Error(`업데이트 누락 또는 중복: ${missed.join(', ')}`);
  await pool.query('COMMIT');

  const exported = await pool.query(
    `SELECT t.country_id,
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
      c.code,
      cat.slug
    FROM trends t
    JOIN countries c ON c.id = t.country_id
    JOIN categories cat ON cat.id = t.category_id
    WHERE c.code = ANY($1::text[])
      AND t.last_updated_at::date = $2::date
    ORDER BY c.code, cat.slug, t.heat_score DESC, t.name`,
    [TARGET_COUNTRIES, WINDOW_DATE]
  );

  if (exported.rowCount !== 100) throw new Error(`내보낸 행 수가 100개가 아닙니다: ${exported.rowCount}`);
  writeFileSync(FULL_SQL, buildInsertSql(exported.rows), 'utf8');
  console.log(`Docker DB 업데이트 완료: ${changed}개`);
  console.log(`업데이트 SQL: ${UPDATE_SQL}`);
  console.log(`완성본 SQL: ${FULL_SQL}`);
} catch (error) {
  await pool.query('ROLLBACK').catch(() => {});
  console.error(error.message);
  process.exit(1);
} finally {
  await pool.end();
}
