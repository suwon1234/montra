import { readFileSync } from 'fs';
import pg from 'pg';

function loadEnv() {
  const env = {};
  const content = readFileSync('.env.local', 'utf8');
  for (const line of content.split(/\r?\n/)) {
    const index = line.indexOf('=');
    if (index <= 0) continue;
    env[line.slice(0, index).trim()] = line.slice(index + 1).trim();
  }
  return env;
}

const env = loadEnv();
const databaseUrl = process.env.DATABASE_URL || env.DATABASE_URL;

if (!databaseUrl) {
  console.error('DATABASE_URL이 없습니다.');
  process.exit(1);
}

const { Pool } = pg;
const pool = new Pool({ connectionString: databaseUrl });

try {
  const tables = await pool.query(
    "select table_name from information_schema.tables where table_schema = 'public' order by table_name"
  );
  console.log('tables:', tables.rows.map((row) => row.table_name).join(', '));

  const categories = await pool.query(
    'select id, slug, name_ko, name_en from categories order by slug'
  );
  console.log('categories:');
  console.table(categories.rows);

  const countries = await pool.query(
    "select code, id, name_ko from countries where code in ('KR','JP','US','CA') order by code"
  );
  console.log('countries:');
  console.table(countries.rows);

  const count = await pool.query('select count(*)::int as count from trends');
  console.log('trends_count:', count.rows[0].count);
} finally {
  await pool.end();
}
