import { readFileSync } from 'fs';
import pg from 'pg';

const env = {};
for (const line of readFileSync('.env.local', 'utf8').split(/\r?\n/)) {
  const index = line.indexOf('=');
  if (index <= 0) continue;
  env[line.slice(0, index).trim()] = line.slice(index + 1).trim();
}

const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL || env.DATABASE_URL });

try {
  const rows = await pool.query(`
    select c.code,
      cat.slug,
      t.name,
      t.name_local,
      left(t.description, 90) as description,
      t.last_updated_at
    from trends t
    join countries c on c.id = t.country_id
    join categories cat on cat.id = t.category_id
    order by t.created_at desc
    limit 20
  `);
  console.table(rows.rows);
} finally {
  await pool.end();
}
