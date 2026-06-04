import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import pg from 'pg';

const { Client } = pg;

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');
const outputDir = path.join(rootDir, 'scripts', 'output');

const WINDOW_DATE = process.env.WINDOW_DATE ?? '2026-04-27';
const WINDOW_AT = `${WINDOW_DATE}T00:00:00+09:00`;
const args = new Set(process.argv.slice(2));
const applyToDb = args.has('--apply');
const deleteRawMain = args.has('--delete-raw-main');

const reportJson = path.join(outputDir, `verified_global_promotion_${WINDOW_DATE}.json`);
const reportMd = path.join(outputDir, `verified_global_promotion_${WINDOW_DATE}.md`);

const OFFICIAL_SOURCE_FAMILIES = new Set([
  'google-trends',
  'tiktok-official-hashtag',
  'tiktok-official-song',
  'tiktok-official-product',
  'youtube',
  'pinterest',
  'instagram',
  'retailer',
  'news',
]);

const TIKTOK_OFFICIAL_FAMILIES = new Set([
  'tiktok-official-hashtag',
  'tiktok-official-song',
  'tiktok-official-product',
]);

const CATEGORY_FALLBACK = 'brands';

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

function normalizeKey(value) {
  return String(value || '')
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/^#/, '')
    .replace(/&/g, ' and ')
    .replace(/[^a-z0-9가-힣ぁ-んァ-ヶ一-龠]+/g, ' ')
    .split(/\s+/)
    .filter((token) => token.length >= 2)
    .slice(0, 6)
    .join(' ')
    .trim();
}

function clamp(value, min = 0, max = 100) {
  return Math.max(min, Math.min(max, value));
}

function parseMetricNumber(value) {
  const raw = String(value || '').toUpperCase().replace(/,/g, '').replace(/\+/g, '').trim();
  const match = raw.match(/([\d.]+)\s*([KMB]?)/);
  if (!match) return 0;
  const base = Number(match[1]);
  if (!Number.isFinite(base)) return 0;
  if (match[2] === 'B') return Math.round(base * 1_000_000_000);
  if (match[2] === 'M') return Math.round(base * 1_000_000);
  if (match[2] === 'K') return Math.round(base * 1_000);
  return Math.round(base);
}

function scoreSignal(signal) {
  if (signal.source_family === 'google-trends') {
    const traffic = parseMetricNumber(signal.metric_value);
    return clamp(Math.round((Math.log10(traffic + 10) / 7) * 100), 35, 100);
  }

  if (signal.source_family === 'tiktok-official-product') {
    const post = Number(signal.payload?.post || 0);
    const impression = Number(signal.payload?.impression || 0);
    return clamp(Math.round(Math.log10(post + impression + 10) * 18), 45, 100);
  }

  if (signal.source_family.startsWith('tiktok-official')) {
    const views = Number(signal.payload?.video_views || signal.payload?.views || 0);
    const posts = Number(signal.payload?.publish_count || signal.payload?.publish_cnt || signal.payload?.post || 0);
    return clamp(Math.round(Math.log10(views + posts + 10) * 13), 45, 100);
  }

  return 45;
}

function heatFromEvidence(signals, sourceFamilies) {
  const signalAverage = signals.reduce((sum, signal) => sum + scoreSignal(signal), 0) / Math.max(signals.length, 1);
  const diversityBonus = Math.min(sourceFamilies.length * 7, 20);
  const tiktokBonus = signals.some((signal) => TIKTOK_OFFICIAL_FAMILIES.has(signal.source_family)) ? 8 : 0;
  return clamp(Math.round(signalAverage + diversityBonus + tiktokBonus), 50, 100);
}

function signalHasLinkedNews(signal) {
  if (signal.source_family !== 'google-trends') return false;
  const evidenceUrls = Array.isArray(signal.evidence_urls) ? signal.evidence_urls.filter(Boolean) : [];
  const payloadNews = Array.isArray(signal.payload?.news) ? signal.payload.news.filter((entry) => entry?.url) : [];
  return evidenceUrls.length > 0 || payloadNews.length > 0;
}

function deriveSourceFamilies(signals) {
  const families = new Set();
  for (const signal of signals) {
    if (!OFFICIAL_SOURCE_FAMILIES.has(signal.source_family)) continue;
    families.add(signal.source_family);
    if (signalHasLinkedNews(signal)) families.add('news');
  }
  return [...families];
}

function decide(group) {
  const official = group.signals.filter((signal) => OFFICIAL_SOURCE_FAMILIES.has(signal.source_family));
  const sourceFamilies = deriveSourceFamilies(official);
  const hasTikTokOfficial = sourceFamilies.some((family) => TIKTOK_OFFICIAL_FAMILIES.has(family));
  const hasGoogle = sourceFamilies.includes('google-trends');
  const category = group.category_slug || CATEGORY_FALLBACK;

  if (hasTikTokOfficial && hasGoogle) {
    return {
      decision: 'verified',
      confidence: 5,
      rejection_reason: null,
      sourceFamilies,
      category,
    };
  }

  if (sourceFamilies.length >= 2 && hasTikTokOfficial) {
    return {
      decision: 'verified',
      confidence: 5,
      rejection_reason: null,
      sourceFamilies,
      category,
    };
  }

  if (sourceFamilies.length >= 2) {
    return {
      decision: 'verified_without_tiktok',
      confidence: 4,
      rejection_reason: 'Passes two-source rule, but lacks official TikTok evidence.',
      sourceFamilies,
      category,
    };
  }

  if (hasTikTokOfficial) {
    return {
      decision: 'needs_second_source',
      confidence: 3,
      rejection_reason: 'Official TikTok signal exists, but it needs Google, news, retailer, Instagram, Pinterest, or YouTube confirmation.',
      sourceFamilies,
      category,
    };
  }

  if (hasGoogle) {
    return {
      decision: 'needs_tiktok_or_second_source',
      confidence: 3,
      rejection_reason: 'Google Trends signal exists, but it needs TikTok or another same-week source before becoming a completed trend.',
      sourceFamilies,
      category,
    };
  }

  return {
    decision: 'rejected',
    confidence: 1,
    rejection_reason: 'No accepted official source family for completed trend promotion.',
    sourceFamilies,
    category,
  };
}

function evidenceFromSignals(signals) {
  const evidence = [];
  for (const signal of signals) {
    evidence.push({
      source_family: signal.source_family,
      source_name: signal.source_name,
      url: signal.source_url,
      evidence_urls: signal.evidence_urls || [],
      captured_at: signal.collected_at,
      metric_label: signal.metric_label,
      metric_value: signal.metric_value,
      rank: signal.rank,
    });

    if (signalHasLinkedNews(signal)) {
      const payloadNews = Array.isArray(signal.payload?.news) ? signal.payload.news.filter((entry) => entry?.url) : [];
      const linked = payloadNews[0];
      if (linked) {
        evidence.push({
          source_family: 'news',
          source_name: linked.source || 'Linked news',
          url: linked.url,
          evidence_urls: [],
          captured_at: signal.collected_at,
          metric_label: 'same-week coverage',
          metric_value: linked.title || signal.raw_title,
          rank: signal.rank,
        });
      } else if ((signal.evidence_urls || []).length > 0) {
        evidence.push({
          source_family: 'news',
          source_name: 'Linked news',
          url: signal.evidence_urls[0],
          evidence_urls: [],
          captured_at: signal.collected_at,
          metric_label: 'same-week coverage',
          metric_value: signal.raw_title,
          rank: signal.rank,
        });
      }
    }
  }
  return evidence;
}

function descriptionFor(group, review) {
  const families = review.source_families || review.sourceFamilies || [];
  const hasTikTok = families.some((family) => TIKTOK_OFFICIAL_FAMILIES.has(family));
  const hasNews = families.includes('news');
  const sourceText = families
    .map((family) => ({
      'google-trends': 'Google Trends',
      'tiktok-official-hashtag': 'TikTok 공식 해시태그',
      'tiktok-official-song': 'TikTok 공식 음원',
      'tiktok-official-product': 'TikTok 공식 상품',
      news: '기사 근거',
      retailer: '리테일 근거',
      instagram: '인스타그램',
      youtube: '유튜브',
      pinterest: '핀터레스트',
    }[family] || family))
    .join(', ');

  if (hasTikTok) {
    return `${group.country_code}에서 이번 주 "${group.canonical_name}" 관련 신호가 ${sourceText}에서 함께 확인됐습니다. Google Trends와 TikTok 공식 신호를 함께 통과한 검증 완료 기록입니다.`;
  }

  if (hasNews) {
    return `${group.country_code}에서 이번 주 "${group.canonical_name}"가 Google Trends 급상승과 같은 주 기사 근거로 함께 확인됐습니다. 틱톡 없이도 2중 근거를 충족한 검증 완료 기록입니다.`;
  }

  return `${group.country_code}에서 이번 주 "${group.canonical_name}" 관련 신호가 ${sourceText}에서 함께 확인됐습니다. 2개 이상의 독립 근거를 통과한 검증 완료 기록입니다.`;
}

async function ensureReviewSchema(client) {
  await client.query('CREATE EXTENSION IF NOT EXISTS "uuid-ossp"');
  await client.query(`
    CREATE TABLE IF NOT EXISTS trend_validation_reviews (
      id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
      country_code VARCHAR(2) NOT NULL,
      window_date DATE NOT NULL,
      normalized_key TEXT NOT NULL,
      canonical_name TEXT NOT NULL,
      category_slug VARCHAR(30),
      decision VARCHAR(40) NOT NULL,
      confidence INTEGER NOT NULL,
      source_families TEXT[] DEFAULT '{}',
      evidence JSONB DEFAULT '[]'::jsonb,
      rejection_reason TEXT,
      created_at TIMESTAMPTZ DEFAULT NOW(),
      UNIQUE (country_code, window_date, normalized_key)
    )
  `);
  await client.query('CREATE INDEX IF NOT EXISTS idx_trend_validation_reviews_window ON trend_validation_reviews(window_date DESC)');
  await client.query('CREATE INDEX IF NOT EXISTS idx_trend_validation_reviews_decision ON trend_validation_reviews(decision)');
}

async function loadSignals(client) {
  const { rows } = await client.query(`
    SELECT
      country_code,
      source_family,
      source_name,
      category_slug,
      raw_title,
      canonical_name,
      metric_label,
      metric_value,
      rank,
      source_url,
      evidence_urls,
      payload,
      collected_at
    FROM global_trend_signals
    WHERE window_date = $1::date
  `, [WINDOW_DATE]);
  return rows;
}

function groupSignals(signals) {
  const groups = new Map();

  for (const signal of signals) {
    const key = normalizeKey(signal.canonical_name || signal.raw_title);
    if (!key) continue;
    const groupKey = `${signal.country_code}:${key}`;
    if (!groups.has(groupKey)) {
      groups.set(groupKey, {
        country_code: signal.country_code,
        normalized_key: key,
        canonical_name: signal.canonical_name,
        category_slug: signal.category_slug,
        signals: [],
      });
    }
    const group = groups.get(groupKey);
    group.signals.push(signal);
    if (!group.category_slug && signal.category_slug) group.category_slug = signal.category_slug;
    if ((signal.rank || 999) < Math.min(...group.signals.map((entry) => entry.rank || 999))) {
      group.canonical_name = signal.canonical_name;
    }
  }

  return [...groups.values()];
}

async function writeReviews(client, reviews) {
  await client.query('DELETE FROM trend_validation_reviews WHERE window_date = $1::date', [WINDOW_DATE]);
  for (const review of reviews) {
    await client.query(`
      INSERT INTO trend_validation_reviews (
        country_code, window_date, normalized_key, canonical_name, category_slug,
        decision, confidence, source_families, evidence, rejection_reason
      )
      VALUES ($1, $2::date, $3, $4, $5, $6, $7, $8::text[], $9::jsonb, $10)
      ON CONFLICT (country_code, window_date, normalized_key) DO UPDATE SET
        canonical_name = EXCLUDED.canonical_name,
        category_slug = EXCLUDED.category_slug,
        decision = EXCLUDED.decision,
        confidence = EXCLUDED.confidence,
        source_families = EXCLUDED.source_families,
        evidence = EXCLUDED.evidence,
        rejection_reason = EXCLUDED.rejection_reason
    `, [
      review.country_code,
      WINDOW_DATE,
      review.normalized_key,
      review.canonical_name,
      review.category_slug,
      review.decision,
      review.confidence,
      review.source_families,
      JSON.stringify(review.evidence),
      review.rejection_reason,
    ]);
  }
}

async function deleteRawMainRows(client) {
  const result = await client.query(`
    DELETE FROM trends
    WHERE tags @> ARRAY['raw-global-signal']
    RETURNING id
  `);
  return result.rowCount;
}

async function promoteVerified(client, reviews) {
  const categoryRows = await client.query('SELECT id, slug FROM categories');
  const categoryIds = Object.fromEntries(categoryRows.rows.map((row) => [row.slug, row.id]));
  const countryRows = await client.query('SELECT id, code FROM countries');
  const countryIds = Object.fromEntries(countryRows.rows.map((row) => [row.code, row.id]));

  let inserted = 0;
  const promotable = reviews.filter((review) => review.decision === 'verified' || review.decision === 'verified_without_tiktok');

  await client.query("DELETE FROM trends WHERE $1 = ANY(tags) AND 'auto-verified-global' = ANY(tags)", [WINDOW_DATE]);

  for (const review of promotable) {
    const countryId = countryIds[review.country_code];
    const categoryId = categoryIds[review.category_slug];
    if (!countryId || !categoryId) continue;

    const scores = {
      heat: heatFromEvidence(review.raw_signals, review.source_families),
      search: review.source_families.includes('google-trends') ? 78 : 45,
      social: review.source_families.some((family) => TIKTOK_OFFICIAL_FAMILIES.has(family)) ? 84 : 58,
      ecommerce: review.category_slug === 'products' ? 82 : review.category_slug === 'food' || review.category_slug === 'fashion' ? 72 : 45,
      news: review.source_families.includes('news') ? 78 : 45,
    };
    const verificationTag = review.source_families.some((family) => TIKTOK_OFFICIAL_FAMILIES.has(family))
      ? 'verified-with-tiktok'
      : 'verified-without-tiktok';

    await client.query(`
      INSERT INTO trends (
        country_id, category_id, name, name_local, description, heat_score, heat_status,
        search_score, social_score, ecommerce_score, news_score, tags, source_urls,
        first_detected_at, last_updated_at
      )
      VALUES ($1, $2, $3, NULL, $4, $5, 'rising', $6, $7, $8, $9, $10, $11, $12::timestamptz, $12::timestamptz)
    `, [
      countryId,
      categoryId,
      review.canonical_name.slice(0, 200),
      descriptionFor(review, review),
      scores.heat,
      scores.search,
      scores.social,
      scores.ecommerce,
      scores.news,
      ['weekly-research', 'verified', verificationTag, 'auto-verified-global', WINDOW_DATE, review.country_code.toLowerCase(), review.category_slug],
      [...new Set(review.evidence.flatMap((entry) => [entry.url, ...(entry.evidence_urls || [])]).filter(Boolean))],
      WINDOW_AT,
    ]);
    inserted += 1;
  }

  return inserted;
}

function writeReport(payload) {
  fs.mkdirSync(outputDir, { recursive: true });
  fs.writeFileSync(reportJson, `${JSON.stringify(payload, null, 2)}\n`, 'utf8');

  const lines = [
    `# Verified Global Promotion ${WINDOW_DATE}`,
    '',
    '- Rule: completed trends require either official TikTok plus a second same-week source, or Google Trends plus same-week supporting evidence such as linked news.',
    '- Wrapper-only TikTok data is not accepted as completed trend evidence.',
    `- Raw main rows deleted: ${payload.raw_main_rows_deleted}`,
    `- Signal groups reviewed: ${payload.reviewed}`,
    `- Promoted verified trends: ${payload.promoted}`,
    '',
    '## Decision Counts',
    ...Object.entries(payload.decision_counts).map(([decision, count]) => `- ${decision}: ${count}`),
    '',
    '## Why This Matters',
    '',
    'The main trends table should represent completed, evidence-backed trend records. Raw discovery remains useful, but it must stay outside the finished product layer until at least two independent same-week signals confirm the same country/topic.',
    '',
    '## Needs TikTok / Second Source Sample',
    ...payload.samples.needs_verification.map((item, index) => `${index + 1}. ${item.country_code} / ${item.canonical_name} / ${item.rejection_reason}`),
    '',
  ];

  fs.writeFileSync(reportMd, `${lines.join('\n')}\n`, 'utf8');
}

async function main() {
  const env = loadEnv();
  const databaseUrl = process.env.DATABASE_URL ?? env.DATABASE_URL;
  if (!databaseUrl) throw new Error('DATABASE_URL is missing.');

  const client = new Client({ connectionString: databaseUrl });
  await client.connect();
  await ensureReviewSchema(client);

  const signals = await loadSignals(client);
  const groups = groupSignals(signals);
  const reviews = groups.map((group) => {
    const review = decide(group);
    return {
      ...group,
      category_slug: review.category,
      decision: review.decision,
      confidence: review.confidence,
      source_families: review.sourceFamilies,
      evidence: evidenceFromSignals(group.signals),
      rejection_reason: review.rejection_reason,
      raw_signals: group.signals,
    };
  });

  let rawMainRowsDeleted = 0;
  let promoted = 0;
  if (applyToDb) {
    await writeReviews(client, reviews);
    if (deleteRawMain) rawMainRowsDeleted = await deleteRawMainRows(client);
    promoted = await promoteVerified(client, reviews);
  }

  await client.end();

  const decisionCounts = reviews.reduce((acc, review) => {
    acc[review.decision] = (acc[review.decision] || 0) + 1;
    return acc;
  }, {});

  const payload = {
    generated_at: new Date().toISOString(),
    window_date: WINDOW_DATE,
    applied: applyToDb,
    raw_main_rows_deleted: rawMainRowsDeleted,
    reviewed: reviews.length,
    promoted,
    decision_counts: decisionCounts,
    samples: {
      verified: reviews.filter((review) => review.decision === 'verified').slice(0, 20),
      needs_verification: reviews.filter((review) => review.decision !== 'verified').slice(0, 40),
    },
  };

  writeReport(payload);
  console.log(`JSON: ${path.relative(rootDir, reportJson)}`);
  console.log(`MD: ${path.relative(rootDir, reportMd)}`);
  console.log(`reviewed: ${reviews.length}, promoted: ${promoted}, raw_main_rows_deleted: ${rawMainRowsDeleted}, applied: ${applyToDb}`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
