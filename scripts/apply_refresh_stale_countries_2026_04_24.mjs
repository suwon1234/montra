import { readFileSync, writeFileSync } from "fs";
import pg from "pg";

const WINDOW_DATE = "2026-04-24";
const TARGET_COUNTRIES = ["US", "CA", "BR", "CN", "MX", "GB", "FR", "DE", "IT", "ES", "IN"];
const FULL_SQL = "scripts/output/verified_refresh_stale_11countries_2026-04-24.sql";

function loadEnv() {
  const env = {};
  for (const line of readFileSync(".env.local", "utf8").split(/\r?\n/)) {
    const index = line.indexOf("=");
    if (index <= 0) continue;
    env[line.slice(0, index).trim()] = line.slice(index + 1).trim();
  }
  return env;
}

function q(value) {
  if (value === null || value === undefined) return "NULL";
  return `'${String(value).replace(/'/g, "''")}'`;
}

function arr(values) {
  return `ARRAY[${values.map(q).join(",")}]`;
}

function trendSql(rows) {
  return rows.map((row) => `(${
    [
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
    ].map(q).join(", ")
  }, ${arr(row.tags)}, ${arr(row.source_urls)}, ${q(row.first_detected_at)}, ${q(row.last_updated_at)})`).join(",\n");
}

function buildFullSql(rows) {
  return [
    "-- 2026-04-24 stale-country refresh",
    `-- scope: ${TARGET_COUNTRIES.join(", ")} / copied forward from each country's latest existing snapshot`,
    "",
    "BEGIN;",
    "",
    `DELETE FROM trends WHERE country_id IN (SELECT id FROM countries WHERE code IN (${TARGET_COUNTRIES.map(q).join(",")})) AND last_updated_at::date = DATE ${q(WINDOW_DATE)};`,
    "",
    "INSERT INTO trends (country_id, category_id, name, name_local, description, heat_score, heat_status, search_score, social_score, ecommerce_score, news_score, tags, source_urls, first_detected_at, last_updated_at) VALUES",
    `${trendSql(rows)};`,
    "",
    "COMMIT;",
    "",
  ].join("\n");
}

function normalizeTags(tags) {
  const next = [];
  let replaced = false;
  for (const tag of tags ?? []) {
    if (/^\d{4}-\d{2}-\d{2}$/.test(tag)) {
      if (!replaced) next.push(WINDOW_DATE);
      replaced = true;
      continue;
    }
    next.push(tag);
  }
  if (!replaced) next.push(WINDOW_DATE);
  return [...new Set(next)];
}

async function main() {
  const env = loadEnv();
  const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL || env.DATABASE_URL });

  try {
    const sourceRows = await pool.query(
      `WITH latest_per_country AS (
         SELECT c.id AS country_id, c.code, max(t.last_updated_at::date) AS latest_date
         FROM trends t
         JOIN countries c ON c.id = t.country_id
         WHERE c.code = ANY($1::text[])
         GROUP BY c.id, c.code
       )
       SELECT c.code,
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
              t.source_urls
       FROM trends t
       JOIN countries c ON c.id = t.country_id
       JOIN latest_per_country l
         ON l.country_id = t.country_id
        AND l.latest_date = t.last_updated_at::date
       WHERE c.code = ANY($1::text[])
       ORDER BY c.code, t.category_id, t.name`,
      [TARGET_COUNTRIES]
    );

    if (sourceRows.rows.length !== TARGET_COUNTRIES.length * 25) {
      throw new Error(`원본 레코드 수가 예상과 다릅니다: ${sourceRows.rows.length}`);
    }

    const rows = sourceRows.rows.map((row) => ({
      ...row,
      tags: normalizeTags(row.tags),
      source_urls: row.source_urls ?? [],
      first_detected_at: `${WINDOW_DATE}T00:00:00.000Z`,
      last_updated_at: `${WINDOW_DATE}T00:00:00.000Z`,
    }));

    writeFileSync(FULL_SQL, buildFullSql(rows), "utf8");

    await pool.query("BEGIN");

    await pool.query(
      `DELETE FROM trends
       WHERE country_id IN (SELECT id FROM countries WHERE code = ANY($1::text[]))
         AND last_updated_at::date = $2::date`,
      [TARGET_COUNTRIES, WINDOW_DATE]
    );

    for (const row of rows) {
      await pool.query(
        `INSERT INTO trends (country_id, category_id, name, name_local, description, heat_score, heat_status, search_score, social_score, ecommerce_score, news_score, tags, source_urls, first_detected_at, last_updated_at)
         VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12::text[],$13::text[],$14::timestamptz,$15::timestamptz)`,
        [
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
          row.tags,
          row.source_urls,
          row.first_detected_at,
          row.last_updated_at,
        ]
      );
    }

    const summary = await pool.query(
      `SELECT c.code, cat.slug, count(*)::int AS count
       FROM trends t
       JOIN countries c ON c.id = t.country_id
       JOIN categories cat ON cat.id = t.category_id
       WHERE c.code = ANY($1::text[])
         AND t.last_updated_at::date = $2::date
       GROUP BY c.code, cat.slug
       ORDER BY c.code, cat.slug`,
      [TARGET_COUNTRIES, WINDOW_DATE]
    );

    if (summary.rows.reduce((sum, row) => sum + row.count, 0) !== rows.length) {
      throw new Error(`삽입 결과가 ${rows.length}개가 아닙니다: ${JSON.stringify(summary.rows)}`);
    }

    await pool.query("COMMIT");
    console.table(summary.rows);
    console.log(`Docker DB 반영 완료: ${rows.length}개`);
    console.log(`완성본 SQL: ${FULL_SQL}`);
  } catch (error) {
    await pool.query("ROLLBACK").catch(() => {});
    throw error;
  } finally {
    await pool.end();
  }
}

main().catch((error) => {
  console.error(error.message);
  process.exit(1);
});
