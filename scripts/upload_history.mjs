import { readFileSync } from 'fs';
import { createClient } from '@supabase/supabase-js';

const envContent = readFileSync('.env.local', 'utf-8');
const env = {};
for (const line of envContent.split('\n')) {
  const [key, ...rest] = line.split('=');
  if (key && rest.length) env[key.trim()] = rest.join('=').trim();
}

const supabase = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.NEXT_PUBLIC_SUPABASE_ANON_KEY);

async function main() {
  console.log('Loading SQL...');
  const sql = readFileSync('scripts/output/trend_history_real.sql', 'utf-8');
  const lines = sql.split('\n').map(l => l.replace(/\r$/, '')).filter(l => l.startsWith('INSERT'));
  console.log(`Parsed ${lines.length} INSERT statements`);

  // Parse each INSERT into a row object
  const rows = [];
  for (const line of lines) {
    const m = line.match(/VALUES \('([^']+)', '([^']+)', (\d+), (\d+), (\d+)\)/);
    if (!m) continue;
    rows.push({
      trend_id: m[1],
      recorded_at: m[2],
      heat_score: parseInt(m[3]),
      search_score: parseInt(m[4]),
      social_score: parseInt(m[5]),
    });
  }
  console.log(`Parsed ${rows.length} rows`);

  // Upload in batches
  const BATCH = 500;
  let uploaded = 0;
  let errors = 0;

  for (let i = 0; i < rows.length; i += BATCH) {
    const batch = rows.slice(i, i + BATCH);
    const { error } = await supabase.from('trend_history').insert(batch);
    if (error) {
      console.error(`Batch ${Math.floor(i/BATCH)+1} error: ${error.message}`);
      errors += batch.length;
    } else {
      uploaded += batch.length;
    }
    process.stdout.write(`\r  ${uploaded}/${rows.length} uploaded (${errors} errors)`);
  }

  console.log(`\n\nDone! ${uploaded}/${rows.length} uploaded (${errors} errors)`);
}

main().catch(console.error);
