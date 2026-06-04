import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import pg from 'pg';

const { Client } = pg;

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');
const outputDir = path.join(rootDir, 'scripts', 'output');

const TODAY = process.env.OPPORTUNITY_DATE ?? new Date().toISOString().slice(0, 10);
const jsonOutput = path.join(outputDir, `opportunity_scores_${TODAY}.json`);
const mdOutput = path.join(outputDir, `opportunity_scores_${TODAY}.md`);

const CATEGORY_COMMERCIALITY = {
  products: 92,
  food: 88,
  fashion: 82,
  brands: 76,
  challenge: 48,
};

const COUNTRY_KOREA_FIT = {
  KR: 100,
  JP: 94,
  TW: 90,
  HK: 88,
  SG: 86,
  US: 84,
  GB: 80,
  FR: 78,
  IT: 78,
  DE: 76,
  CA: 76,
  ID: 74,
  PH: 74,
  TH: 74,
  VN: 73,
  MY: 73,
  CN: 70,
  AU: 70,
  MX: 64,
  BR: 62,
  ES: 62,
  IN: 60,
};

const CATEGORY_OFFERS = {
  products: '상품 소싱/상세페이지/숏폼 광고 소재 후보',
  food: '신메뉴, 팝업, 편의점/카페 콜라보 후보',
  fashion: '룩북, 구매 키워드, 셀렉션/입점 후보',
  brands: '브랜드 협업, 캠페인 레퍼런스, 벤치마크 후보',
  challenge: '숏폼 콘텐츠, 음원/밈/챌린지 운영 후보',
};

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

function clamp(value, min = 0, max = 100) {
  return Math.max(min, Math.min(max, value));
}

function scoreEvidence(sourceCount, tags = []) {
  const sourceScore = clamp((sourceCount || 0) * 28, 0, 84);
  const verifiedBoost = tags.includes('verified') ? 10 : 0;
  const weeklyBoost = tags.includes('weekly-research') ? 6 : 0;
  return clamp(sourceScore + verifiedBoost + weeklyBoost);
}

function scoreFreshness(lastUpdatedAt) {
  if (!lastUpdatedAt) return 35;
  const updated = new Date(lastUpdatedAt);
  const now = new Date(`${TODAY}T23:59:59.000Z`);
  const days = Math.max(0, (now.getTime() - updated.getTime()) / 86_400_000);

  if (days <= 7) return 100;
  if (days <= 14) return 82;
  if (days <= 30) return 58;
  return 35;
}

function scoreWhiteSpace(heatScore, heatStatus, categorySlug) {
  const base = heatScore >= 92 ? 64 : heatScore >= 80 ? 86 : heatScore >= 65 ? 78 : 58;
  const risingBoost = heatStatus === 'rising' || heatStatus === 'new' ? 8 : 0;
  const challengePenalty = categorySlug === 'challenge' && heatScore >= 90 ? -10 : 0;
  return clamp(base + risingBoost + challengePenalty);
}

function buildGroupKey(name) {
  return String(name || '')
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9가-힣一-龥ぁ-んァ-ン]+/g, ' ')
    .split(/\s+/)
    .filter((token) => token.length >= 3)
    .filter((token) => !['the', 'and', 'with', 'for', 'from', 'official'].includes(token))
    .slice(0, 4)
    .join(' ');
}

function computeSpread(rows) {
  const groups = new Map();
  for (const row of rows) {
    const key = buildGroupKey(row.name);
    if (!key) continue;
    if (!groups.has(key)) groups.set(key, new Set());
    groups.get(key).add(row.country_code);
  }
  return groups;
}

function scoreSpread(row, groups) {
  const key = buildGroupKey(row.name);
  const count = groups.get(key)?.size ?? 1;
  if (count >= 5) return 100;
  if (count === 4) return 86;
  if (count === 3) return 72;
  if (count === 2) return 58;
  return 38;
}

function explain(row, scores) {
  const reasons = [];
  if (scores.commerciality >= 85) reasons.push('상품화가 빠른 카테고리');
  if (scores.koreaFit >= 85) reasons.push('한국 시장과 문화적 거리가 가까움');
  if (scores.freshness >= 90) reasons.push('이번 주 데이터로 갱신됨');
  if (scores.whiteSpace >= 80) reasons.push('관심도는 높지만 아직 실행 여지가 있음');
  if (scores.evidence >= 70) reasons.push('출처와 검증 태그가 확보됨');
  if (row.category_slug === 'challenge') reasons.push('콘텐츠 확산용으로 먼저 테스트 권장');
  return reasons.slice(0, 3).join(', ');
}

function computeOpportunity(row, groups) {
  const signal = clamp(
    row.heat_score * 0.42
    + row.search_score * 0.18
    + row.social_score * 0.18
    + row.ecommerce_score * 0.12
    + row.news_score * 0.10
  );
  const commerciality = CATEGORY_COMMERCIALITY[row.category_slug] ?? 60;
  const koreaFit = COUNTRY_KOREA_FIT[row.country_code] ?? 58;
  const evidence = scoreEvidence(row.source_count, row.tags ?? []);
  const freshness = scoreFreshness(row.last_updated_at);
  const spread = scoreSpread(row, groups);
  const whiteSpace = scoreWhiteSpace(row.heat_score, row.heat_status, row.category_slug);

  const opportunityScore = Math.round(clamp(
    signal * 0.24
    + commerciality * 0.20
    + koreaFit * 0.16
    + whiteSpace * 0.14
    + freshness * 0.10
    + evidence * 0.10
    + spread * 0.06
  ));

  return {
    opportunity_score: opportunityScore,
    signal: Math.round(signal),
    commerciality,
    korea_fit: koreaFit,
    white_space: whiteSpace,
    freshness,
    evidence,
    spread,
  };
}

function toMarkdown(items) {
  const topItems = items.slice(0, 30);
  const lines = [
    `# MONTRA Opportunity Scores (${TODAY})`,
    '',
    '이 파일은 기존 trend DB를 바탕으로 사업화 우선순위를 계산한 내부 랭킹입니다.',
    '점수는 실제 매출이나 언급량이 아니라, MONTRA Opportunity Engine v1의 내부 기회점수입니다.',
    '',
    '| Rank | Score | Country | Category | Trend | Offer | Reason |',
    '|---:|---:|---|---|---|---|---|',
  ];

  topItems.forEach((item, index) => {
    lines.push(
      `| ${index + 1} | ${item.opportunity_score} | ${item.country_code} | ${item.category_slug} | ${item.name.replace(/\|/g, '/')} | ${item.recommended_offer} | ${item.reason} |`
    );
  });

  lines.push('');
  lines.push('## Formula');
  lines.push('');
  lines.push('- signal: heat/search/social/ecommerce/news 점수의 가중 합');
  lines.push('- commerciality: 상품/메뉴/패션/브랜드/챌린지별 사업화 난이도');
  lines.push('- korea_fit: 한국 시장으로 가져오기 쉬운 국가/문화권 가중치');
  lines.push('- white_space: 너무 늦지 않았는지 보는 실행 여지');
  lines.push('- freshness: 최신 스냅샷 여부');
  lines.push('- evidence: 출처 수와 검증 태그');
  lines.push('- spread: 같은 이름/키워드의 다국가 확산성');

  return `${lines.join('\n')}\n`;
}

async function main() {
  fs.mkdirSync(outputDir, { recursive: true });

  const env = loadEnv();
  const databaseUrl = process.env.DATABASE_URL ?? env.DATABASE_URL;
  if (!databaseUrl) {
    throw new Error('DATABASE_URL is missing. Set it in .env.local or the shell environment.');
  }

  const client = new Client({ connectionString: databaseUrl });
  await client.connect();

  const { rows } = await client.query(`
    SELECT
      t.id,
      c.code AS country_code,
      c.name_ko AS country_name_ko,
      cat.slug AS category_slug,
      cat.name_ko AS category_name_ko,
      t.name,
      t.description,
      t.heat_score,
      t.heat_status,
      t.search_score,
      t.social_score,
      t.ecommerce_score,
      t.news_score,
      t.tags,
      COALESCE(array_length(t.source_urls, 1), 0) AS source_count,
      t.source_urls,
      t.first_detected_at,
      t.last_updated_at
    FROM trends t
    JOIN countries c ON c.id = t.country_id
    JOIN categories cat ON cat.id = t.category_id
    WHERE t.last_updated_at >= $1::date - INTERVAL '30 days'
      AND t.tags @> ARRAY['verified']
    ORDER BY t.last_updated_at DESC, t.heat_score DESC
  `, [TODAY]);

  await client.end();

  const groups = computeSpread(rows);
  const items = rows
    .map((row) => {
      const scores = computeOpportunity(row, groups);
      return {
        ...row,
        ...scores,
        recommended_offer: CATEGORY_OFFERS[row.category_slug] ?? '시장 반응 테스트 후보',
        reason: explain(row, scores),
      };
    })
    .sort((a, b) => b.opportunity_score - a.opportunity_score);

  const payload = {
    generated_at: new Date().toISOString(),
    engine: 'MONTRA Opportunity Engine v1',
    record_count: items.length,
    top_30: items.slice(0, 30),
    items,
  };

  fs.writeFileSync(jsonOutput, `${JSON.stringify(payload, null, 2)}\n`, 'utf8');
  fs.writeFileSync(mdOutput, toMarkdown(items), 'utf8');

  console.table(items.slice(0, 15).map((item, index) => ({
    rank: index + 1,
    score: item.opportunity_score,
    country: item.country_code,
    category: item.category_slug,
    name: item.name,
  })));
  console.log(`JSON: ${path.relative(rootDir, jsonOutput)}`);
  console.log(`Markdown: ${path.relative(rootDir, mdOutput)}`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
