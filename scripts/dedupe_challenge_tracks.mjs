import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import pg from 'pg';

const { Client } = pg;

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');

const args = new Set(process.argv.slice(2));
const applyToDb = args.has('--apply');

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

function normalizeText(value) {
  return String(value || '')
    .normalize('NFKC')
    .toLowerCase()
    .replace(/[(){}\[\]!?,.:'"`~]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function signature(name) {
  const parts = String(name || '')
    .split(/\s+-\s+/)
    .map((part) => normalizeText(part))
    .filter(Boolean);
  if (parts.length !== 2) return null;
  return parts.sort().join(' :: ');
}

function compareRows(a, b) {
  const aUpdated = Date.parse(a.last_updated_at || a.created_at || '');
  const bUpdated = Date.parse(b.last_updated_at || b.created_at || '');
  if (Number.isFinite(aUpdated) && Number.isFinite(bUpdated) && aUpdated !== bUpdated) {
    return bUpdated - aUpdated;
  }
  if (a.heat_score !== b.heat_score) return b.heat_score - a.heat_score;
  return String(a.id).localeCompare(String(b.id));
}

async function main() {
  const env = loadEnv();
  const databaseUrl = process.env.DATABASE_URL ?? env.DATABASE_URL;
  if (!databaseUrl) throw new Error('DATABASE_URL is missing.');

  const client = new Client({ connectionString: databaseUrl });
  await client.connect();

  const { rows } = await client.query(`
    SELECT t.id, t.name, t.tags, t.source_urls, t.heat_score, t.last_updated_at, t.created_at,
           c.code AS country_code, cat.slug AS category_slug
    FROM trends t
    JOIN countries c ON c.id = t.country_id
    JOIN categories cat ON cat.id = t.category_id
    WHERE cat.slug = 'challenge'
  `);

  const groups = new Map();
  for (const row of rows) {
    const key = signature(row.name);
    if (!key) continue;
    const groupKey = `${row.country_code}|${row.category_slug}|${key}`;
    if (!groups.has(groupKey)) groups.set(groupKey, []);
    groups.get(groupKey).push(row);
  }

  const duplicates = [...groups.entries()]
    .filter(([, items]) => items.length > 1)
    .map(([key, items]) => ({
      key,
      items: items.sort(compareRows),
    }));

  if (applyToDb) {
    for (const group of duplicates) {
      const [keeper, ...removals] = group.items;
      const mergedTags = [...new Set(group.items.flatMap((item) => item.tags || []))];
      const mergedSourceUrls = [...new Set(group.items.flatMap((item) => item.source_urls || []))];

      await client.query(
        'UPDATE trends SET tags = $2::text[], source_urls = $3::text[] WHERE id = $1',
        [keeper.id, mergedTags, mergedSourceUrls]
      );

      if (removals.length > 0) {
        await client.query('DELETE FROM trends WHERE id = ANY($1::uuid[])', [removals.map((item) => item.id)]);
      }
    }
  }

  await client.end();

  console.log(JSON.stringify({
    applied: applyToDb,
    duplicate_groups: duplicates.map((group) => ({
      key: group.key,
      keeper: group.items[0]?.id || null,
      removed: group.items.slice(1).map((item) => item.id),
      names: group.items.map((item) => item.name),
    })),
  }, null, 2));
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
