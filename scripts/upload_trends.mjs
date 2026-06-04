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
process.env.SUPABASE_SERVICE_KEY = env.SUPABASE_SERVICE_KEY;
process.env.SUPABASE_SERVICE_ROLE_KEY = env.SUPABASE_SERVICE_ROLE_KEY;

const supabaseKey =
  process.env.SUPABASE_SERVICE_KEY ||
  process.env.SUPABASE_SERVICE_ROLE_KEY ||
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  supabaseKey
);

const DEFAULT_SQL_FILES = [
  'scripts/output/trends_v3_part6_oceania.sql',
  'scripts/output/trends_v3_part2_middle_east.sql',
  'scripts/output/trends_v3_part1_asia.sql',
  'scripts/output/trends_v3_part5_americas.sql',
  'scripts/output/trends_v3_part3_europe.sql',
  'scripts/output/trends_v3_part4_africa.sql',
];

const cliArgs = process.argv.slice(2);
const DRY_RUN = cliArgs.includes('--dry-run');
const filesToProcess = cliArgs.filter((arg) => arg !== '--dry-run');
const SQL_FILES = filesToProcess.length > 0 ? filesToProcess : DEFAULT_SQL_FILES;

function parseRowValues(valStr) {
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
  return values;
}

function splitInsertTuples(valuesBlock) {
  const tuples = [];
  let current = '';
  let inString = false;
  let depth = 0;

  for (let i = 0; i < valuesBlock.length; i++) {
    const ch = valuesBlock[i];

    if (ch === "'" && !inString) {
      inString = true;
      if (depth > 0) current += ch;
    } else if (ch === "'" && inString) {
      if (valuesBlock[i + 1] === "'") {
        if (depth > 0) current += "''";
        i++;
      } else {
        inString = false;
        if (depth > 0) current += ch;
      }
    } else if (ch === '(' && !inString) {
      if (depth > 0) current += ch;
      depth++;
    } else if (ch === ')' && !inString) {
      depth--;
      if (depth === 0) {
        tuples.push(current.trim());
        current = '';
      } else {
        current += ch;
      }
    } else if (depth > 0) {
      current += ch;
    }
  }

  return tuples;
}

function cleanValue(value) {
  if (value === undefined || value === null || value === 'NULL') return null;
  if (value === 'ARRAY[]::text[]') return [];
  if (value.startsWith("'") && value.endsWith("'")) {
    return value.slice(1, -1).replace(/''/g, "'");
  }
  if (value.startsWith('ARRAY[')) {
    const inner = value
      .replace(/^ARRAY\[/, '')
      .replace(/\]::text\[\]$/, '')
      .replace(/\]$/, '');
    if (!inner) return [];
    return inner
      .split(',')
      .map((part) => part.trim())
      .filter(Boolean)
      .map((part) => part.replace(/^'|'$/g, '').replace(/''/g, "'"));
  }

  const num = Number(value);
  if (!Number.isNaN(num)) return num;
  return value;
}

function parseSqlInserts(sql) {
  const rows = [];
  const statements = [...sql.matchAll(/INSERT INTO trends\s*\(([\s\S]+?)\)\s*VALUES\s*([\s\S]+?);/g)];

  for (const statement of statements) {
    const columns = statement[1].split(',').map((column) => column.trim());
    const tuples = splitInsertTuples(statement[2]);

    for (const tuple of tuples) {
      const values = parseRowValues(tuple);
      if (columns.length !== values.length) continue;

      const row = Object.fromEntries(
        columns.map((column, index) => [column, cleanValue(values[index])])
      );

      delete row.price;

      rows.push({
        ...row,
        tags: Array.isArray(row.tags) ? row.tags : [],
        source_urls: Array.isArray(row.source_urls) ? row.source_urls : [],
      });
    }
  }

  return { rows, statementCount: statements.length };
}

async function uploadFile(filePath) {
  console.log(`\nProcessing: ${filePath}`);
  const sql = readFileSync(filePath, 'utf-8');
  const { rows, statementCount } = parseSqlInserts(sql);
  console.log(`   Found ${statementCount} INSERT statements`);
  console.log(`   Parsed ${rows.length} trends`);

  if (DRY_RUN) {
    console.log('   DRY RUN enabled, skipping upload');
    return { uploaded: rows.length, errors: 0, total: rows.length };
  }

  const BATCH_SIZE = 100;
  let uploaded = 0;
  let errors = 0;

  for (let i = 0; i < rows.length; i += BATCH_SIZE) {
    const batch = rows.slice(i, i + BATCH_SIZE);
    const { error } = await supabase.from('trends').insert(batch);

    if (error) {
      console.error(`   Batch ${Math.floor(i / BATCH_SIZE) + 1} error: ${error.message}`);

      for (const row of batch) {
        const { error: singleError } = await supabase.from('trends').insert(row);
        if (singleError) {
          errors++;
          if (errors <= 3) {
            console.error(`   Row error: ${row.name} - ${singleError.message}`);
          }
        } else {
          uploaded++;
        }
      }
    } else {
      uploaded += batch.length;
    }

    process.stdout.write(`   ${uploaded}/${rows.length} uploaded (${errors} errors)\r`);
  }

  console.log(`   ${uploaded}/${rows.length} uploaded (${errors} errors)`);
  return { uploaded, errors, total: rows.length };
}

async function main() {
  console.log('MONTRA Trend Upload');
  console.log('===================\n');

  let totalUploaded = 0;
  let totalErrors = 0;
  let totalTrends = 0;

  for (const file of SQL_FILES) {
    const result = await uploadFile(file);
    totalUploaded += result.uploaded;
    totalErrors += result.errors;
    totalTrends += result.total;
  }

  console.log('\n===================');
  console.log(`Total: ${totalUploaded}/${totalTrends} uploaded (${totalErrors} errors)`);
}

main().catch(console.error);
