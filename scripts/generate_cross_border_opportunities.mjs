import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import pg from 'pg';

const { Client } = pg;

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');
const outputDir = path.join(rootDir, 'scripts', 'output');

const WINDOW_DATE = process.env.OPPORTUNITY_DATE ?? new Date().toISOString().slice(0, 10);
const jsonOutput = path.join(outputDir, `cross_border_opportunities_${WINDOW_DATE}.json`);
const mdOutput = path.join(outputDir, `cross_border_opportunities_${WINDOW_DATE}.md`);

const COMMERCIALITY = {
  products: 96,
  food: 90,
  fashion: 84,
  brands: 74,
  challenge: 42,
};

const INBOUND_KOREA_FIT = {
  JP: 95, TW: 92, HK: 90, SG: 88, US: 86, GB: 82, FR: 80, IT: 80,
  DE: 78, CA: 78, TH: 76, VN: 75, ID: 74, PH: 74, MY: 73, CN: 72,
  AU: 70, MX: 64, BR: 62, ES: 62, IN: 60,
};

const OUTBOUND_TARGETS = {
  products: ['JP', 'TW', 'HK', 'SG', 'US', 'TH', 'VN', 'ID', 'PH', 'MY'],
  food: ['JP', 'TW', 'HK', 'SG', 'US', 'TH', 'VN', 'ID', 'PH', 'MY'],
  fashion: ['JP', 'TW', 'HK', 'SG', 'US', 'FR', 'GB', 'TH', 'VN', 'ID'],
  brands: ['JP', 'TW', 'HK', 'SG', 'US', 'TH', 'VN', 'ID', 'PH', 'MY'],
  challenge: ['JP', 'TW', 'HK', 'SG', 'US', 'TH', 'VN', 'ID', 'PH', 'MY'],
};

const TARGET_FIT = {
  JP: 95, TW: 94, HK: 92, SG: 90, US: 86, TH: 84, VN: 82, ID: 81,
  PH: 80, MY: 80, CN: 76, GB: 75, FR: 74, CA: 74, AU: 72,
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

function freshness(lastUpdatedAt) {
  const updated = new Date(lastUpdatedAt);
  const now = new Date(`${WINDOW_DATE}T23:59:59+09:00`);
  const days = Math.max(0, (now.getTime() - updated.getTime()) / 86_400_000);
  if (days <= 7) return 100;
  if (days <= 14) return 82;
  if (days <= 30) return 60;
  return 35;
}

function evidenceScore(row) {
  const count = row.source_count || 0;
  const tags = row.tags || [];
  return clamp(count * 25 + (tags.includes('verified') ? 12 : 0) + (tags.includes('weekly-research') ? 8 : 0));
}

function signalScore(row) {
  return clamp(
    row.heat_score * 0.34
    + row.search_score * 0.18
    + row.social_score * 0.18
    + row.ecommerce_score * 0.18
    + row.news_score * 0.12
  );
}

function qualityAdjust(row) {
  const tags = row.tags || [];
  let adjust = 0;
  if (tags.includes('raw-global-signal')) adjust -= 18;
  if (tags.includes('verified')) adjust += 8;
  if (tags.includes('ko-copy')) adjust += 4;
  return adjust;
}

function normalizeKey(name) {
  return String(name || '')
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9가-힣一-龥ぁ-んァ-ン]+/g, ' ')
    .split(/\s+/)
    .filter((token) => token.length >= 3)
    .slice(0, 5)
    .join(' ');
}

function shortReason(row, scoreParts, direction) {
  const bits = [];
  if (scoreParts.commerciality >= 85) bits.push('상품화가 빠름');
  if (scoreParts.market_fit >= 85) bits.push(direction === 'inbound' ? '한국 적용성이 높음' : '우선 진출 시장 적합도가 높음');
  if (scoreParts.evidence >= 60) bits.push('근거 URL/검증 태그가 있음');
  if ((row.tags || []).includes('raw-global-signal')) bits.push('raw 신호라 추가 검증 필요');
  return bits.slice(0, 3).join(', ');
}

function scoreInbound(row) {
  const parts = {
    signal: signalScore(row),
    commerciality: COMMERCIALITY[row.category_slug] || 50,
    market_fit: INBOUND_KOREA_FIT[row.country_code] || 55,
    freshness: freshness(row.last_updated_at),
    evidence: evidenceScore(row),
  };
  const score = Math.round(clamp(
    parts.signal * 0.28
    + parts.commerciality * 0.24
    + parts.market_fit * 0.20
    + parts.freshness * 0.14
    + parts.evidence * 0.14
    + qualityAdjust(row)
  ));
  return { score, parts };
}

function scoreOutbound(row, targetCode) {
  const parts = {
    signal: signalScore(row),
    commerciality: COMMERCIALITY[row.category_slug] || 50,
    market_fit: TARGET_FIT[targetCode] || 55,
    freshness: freshness(row.last_updated_at),
    evidence: evidenceScore(row),
  };
  const score = Math.round(clamp(
    parts.signal * 0.30
    + parts.commerciality * 0.22
    + parts.market_fit * 0.22
    + parts.freshness * 0.14
    + parts.evidence * 0.12
    + qualityAdjust(row)
  ));
  return { score, parts };
}

function toMarkdown(payload) {
  const lines = [
    `# Cross-Border Opportunities ${WINDOW_DATE}`,
    '',
    '해외에서 한국으로 가져올 후보와 한국에서 해외로 보낼 후보를 분리한 내부 리포트입니다.',
    '점수는 실제 매출 예측값이 아니라 MONTRA 내부 우선순위 점수입니다.',
    '',
    '## Inbound: 해외 -> 한국',
    '',
    '| Rank | Score | From | Category | Trend | Reason |',
    '|---:|---:|---|---|---|---|',
    ...payload.inbound.slice(0, 40).map((item, index) => (
      `| ${index + 1} | ${item.score} | ${item.country_code} | ${item.category_slug} | ${String(item.name).replace(/\|/g, '/')} | ${item.reason} |`
    )),
    '',
    '## Outbound: 한국 -> 해외',
    '',
    '| Rank | Score | Target | Category | Korean Trend | Reason |',
    '|---:|---:|---|---|---|---|',
    ...payload.outbound.slice(0, 40).map((item, index) => (
      `| ${index + 1} | ${item.score} | ${item.target_country} | ${item.category_slug} | ${String(item.name).replace(/\|/g, '/')} | ${item.reason} |`
    )),
    '',
  ];
  return `${lines.join('\n')}\n`;
}

async function main() {
  fs.mkdirSync(outputDir, { recursive: true });
  const env = loadEnv();
  const databaseUrl = process.env.DATABASE_URL ?? env.DATABASE_URL;
  if (!databaseUrl) throw new Error('DATABASE_URL is missing.');

  const client = new Client({ connectionString: databaseUrl });
  await client.connect();
  const { rows } = await client.query(`
    SELECT
      t.id,
      c.code AS country_code,
      c.name_ko AS country_name_ko,
      cat.slug AS category_slug,
      t.name,
      t.description,
      t.heat_score,
      t.search_score,
      t.social_score,
      t.ecommerce_score,
      t.news_score,
      t.tags,
      COALESCE(array_length(t.source_urls, 1), 0) AS source_count,
      t.source_urls,
      t.last_updated_at
    FROM trends t
    JOIN countries c ON c.id = t.country_id
    JOIN categories cat ON cat.id = t.category_id
    WHERE t.last_updated_at >= $1::date - INTERVAL '45 days'
      AND t.tags @> ARRAY['verified']
  `, [WINDOW_DATE]);
  await client.end();

  const seen = new Set();
  const inbound = rows
    .filter((row) => row.country_code !== 'KR')
    .filter((row) => ['products', 'food', 'fashion', 'brands'].includes(row.category_slug))
    .map((row) => {
      const scored = scoreInbound(row);
      return {
        ...row,
        score: scored.score,
        parts: scored.parts,
        reason: shortReason(row, scored.parts, 'inbound'),
      };
    })
    .sort((a, b) => b.score - a.score)
    .filter((row) => {
      const key = `${row.country_code}:${row.category_slug}:${normalizeKey(row.name)}`;
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });

  const outbound = [];
  for (const row of rows.filter((entry) => entry.country_code === 'KR')) {
    const targets = OUTBOUND_TARGETS[row.category_slug] || [];
    for (const target of targets.slice(0, 6)) {
      const scored = scoreOutbound(row, target);
      outbound.push({
        ...row,
        target_country: target,
        score: scored.score,
        parts: scored.parts,
        reason: shortReason(row, scored.parts, 'outbound'),
      });
    }
  }
  outbound.sort((a, b) => b.score - a.score);

  const payload = {
    generated_at: new Date().toISOString(),
    window_date: WINDOW_DATE,
    engine: 'MONTRA Cross-Border Opportunity Engine v1',
    inbound,
    outbound,
  };

  fs.writeFileSync(jsonOutput, `${JSON.stringify(payload, null, 2)}\n`, 'utf8');
  fs.writeFileSync(mdOutput, toMarkdown(payload), 'utf8');

  console.table({
    inbound: inbound.length,
    outbound: outbound.length,
  });
  console.log(`JSON: ${path.relative(rootDir, jsonOutput)}`);
  console.log(`Markdown: ${path.relative(rootDir, mdOutput)}`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
