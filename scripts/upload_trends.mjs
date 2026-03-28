import { readFileSync } from 'fs';
import { createClient } from '@supabase/supabase-js';

// Read .env.local manually
const envContent = readFileSync('.env.local', 'utf-8');
const env = {};
for (const line of envContent.split('\n')) {
  const [key, ...rest] = line.split('=');
  if (key && rest.length) env[key.trim()] = rest.join('=').trim();
}
process.env.NEXT_PUBLIC_SUPABASE_URL = env.NEXT_PUBLIC_SUPABASE_URL;
process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

const SQL_FILES = [
  'scripts/output/trends_v3_part6_oceania.sql',
  'scripts/output/trends_v3_part2_middle_east.sql',
  'scripts/output/trends_v3_part1_asia.sql',
  'scripts/output/trends_v3_part5_americas.sql',
  'scripts/output/trends_v3_part3_europe.sql',
  'scripts/output/trends_v3_part4_africa.sql',
];

function parseSqlInserts(sql) {
  const rows = [];
  const lines = sql.split('\n').map(l => l.replace(/\r$/, '')).filter(l => l.startsWith('INSERT INTO trends'));

  for (const line of lines) {
    const valuesMatch = line.match(/VALUES\s*\((.+)\);$/);
    if (!valuesMatch) continue;

    const valStr = valuesMatch[1];

    // Parse values using a state machine approach
    const values = [];
    let current = '';
    let inString = false;
    let depth = 0;

    for (let i = 0; i < valStr.length; i++) {
      const ch = valStr[i];

      if (ch === "'" && !inString) {
        inString = true;
        current += ch;
      } else if (ch === "'" && inString) {
        if (valStr[i + 1] === "'") {
          current += "''";
          i++;
        } else {
          inString = false;
          current += ch;
        }
      } else if ((ch === '(' || ch === '[') && !inString) {
        depth++;
        current += ch;
      } else if ((ch === ')' || ch === ']') && !inString) {
        depth--;
        current += ch;
      } else if (ch === ',' && !inString && depth === 0) {
        values.push(current.trim());
        current = '';
      } else {
        current += ch;
      }
    }
    if (current.trim()) values.push(current.trim());

    // Map values to columns
    const clean = (v) => {
      if (v === 'NULL') return null;
      if (v.startsWith("'") && v.endsWith("'")) return v.slice(1, -1).replace(/''/g, "'");
      if (v.startsWith('ARRAY[')) {
        const inner = v.slice(6, -1);
        if (!inner) return [];
        return inner.split(',').map(s => s.trim().replace(/^'|'$/g, '').replace(/''/g, "'"));
      }
      if (v === "ARRAY[]::text[]") return [];
      const num = Number(v);
      if (!isNaN(num)) return num;
      return v;
    };

    if (values.length >= 16) {
      rows.push({
        country_id: clean(values[0]),
        category_id: clean(values[1]),
        name: clean(values[2]),
        name_local: clean(values[3]),
        description: clean(values[4]),
        heat_score: clean(values[5]),
        heat_status: clean(values[6]),
        search_score: clean(values[7]),
        social_score: clean(values[8]),
        ecommerce_score: clean(values[9]),
        news_score: clean(values[10]),
        tags: clean(values[11]),
        image_url: clean(values[12]),
        // price: clean(values[13]), -- column doesn't exist in DB
        source_urls: clean(values[14]),
        first_detected_at: clean(values[15]),
        last_updated_at: clean(values[16]),
      });
    }
  }

  return { rows, lineCount: lines.length, firstLine: lines[0] || '' };
}

async function uploadFile(filePath) {
  console.log(`\n📂 Processing: ${filePath}`);
  const sql = readFileSync(filePath, 'utf-8');
  const { rows, lineCount, firstLine } = parseSqlInserts(sql);
  console.log(`   Found ${lineCount} INSERT lines`);
  if (lineCount > 0 && rows.length === 0) {
    const m = firstLine.match(/VALUES\s*\((.+)\);$/);
    console.log(`   DEBUG: regex match = ${!!m}, ends: "${firstLine.slice(-30)}"`);
  }
  console.log(`   Parsed ${rows.length} trends`);

  const BATCH_SIZE = 100;
  let uploaded = 0;
  let errors = 0;

  for (let i = 0; i < rows.length; i += BATCH_SIZE) {
    const batch = rows.slice(i, i + BATCH_SIZE);
    const { error } = await supabase.from('trends').insert(batch);

    if (error) {
      console.error(`   ❌ Batch ${Math.floor(i/BATCH_SIZE)+1} error: ${error.message}`);
      // Try one by one for failed batch
      for (const row of batch) {
        const { error: singleError } = await supabase.from('trends').insert(row);
        if (singleError) {
          errors++;
          if (errors <= 3) console.error(`   ⚠️ Row error: ${row.name} - ${singleError.message}`);
        } else {
          uploaded++;
        }
      }
    } else {
      uploaded += batch.length;
    }

    process.stdout.write(`   ✅ ${uploaded}/${rows.length} uploaded (${errors} errors)\r`);
  }

  console.log(`   ✅ ${uploaded}/${rows.length} uploaded (${errors} errors)`);
  return { uploaded, errors, total: rows.length };
}

async function main() {
  console.log('🚀 MONTRA Trend Upload v3');
  console.log('========================\n');

  let totalUploaded = 0;
  let totalErrors = 0;
  let totalTrends = 0;

  for (const file of SQL_FILES) {
    const result = await uploadFile(file);
    totalUploaded += result.uploaded;
    totalErrors += result.errors;
    totalTrends += result.total;
  }

  console.log('\n========================');
  console.log(`📊 Total: ${totalUploaded}/${totalTrends} uploaded (${totalErrors} errors)`);
}

main().catch(console.error);
