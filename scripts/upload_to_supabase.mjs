#!/usr/bin/env node
/**
 * Parse kr_weekly_research SQL and upload to Supabase via REST API
 */
import { readFileSync } from 'fs';

const SUPABASE_URL = 'https://fkibhjdpsjqzwkcvrgym.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZraWJoamRwc2pxendrY3ZyZ3ltIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3MzcwNjE3MywiZXhwIjoyMDg5MjgyMTczfQ.LjwfoU5aCIfUCDJCzCvpTcDy_SeA5X64jqwvq-7w5A8';

const sqlFile = process.argv[2] || 'D:/prototypes/montra/scripts/output/kr_weekly_research_2026-04-05.sql';
const sql = readFileSync(sqlFile, 'utf8');
console.log(`Reading: ${sqlFile}`);

function parseSqlValues(valStr) {
  const values = [];
  let current = '';
  let inSingleQuote = false;
  let arrayDepth = 0;

  for (let i = 0; i < valStr.length; i++) {
    const ch = valStr[i];
    const next = valStr[i + 1];

    // Handle escaped single quotes ''
    if (ch === "'" && next === "'" && inSingleQuote) {
      current += "'";
      i++; // skip next quote
      continue;
    }

    if (ch === "'" && arrayDepth === 0) {
      inSingleQuote = !inSingleQuote;
      current += ch;
      continue;
    }

    if (ch === "'" && arrayDepth > 0) {
      // inside ARRAY literal
      current += ch;
      continue;
    }

    if (!inSingleQuote) {
      if (ch === 'A' && valStr.substring(i, i + 6) === 'ARRAY[') {
        arrayDepth++;
        current += 'ARRAY[';
        i += 5;
        continue;
      }
      if (ch === '[') {
        arrayDepth++;
        current += ch;
        continue;
      }
      if (ch === ']') {
        arrayDepth--;
        current += ch;
        continue;
      }
      if (ch === ',' && arrayDepth === 0) {
        values.push(current.trim());
        current = '';
        continue;
      }
    }

    current += ch;
  }
  if (current.trim()) values.push(current.trim());
  return values;
}

function cleanValue(v) {
  if (!v || v === 'NULL' || v === 'null') return null;
  // String
  if (v.startsWith("'") && v.endsWith("'")) {
    return v.slice(1, -1);
  }
  // Array
  if (v.startsWith('ARRAY[')) {
    const inner = v.slice(6, -1); // remove ARRAY[ and ]
    return inner.split(',').map(s => s.trim().replace(/^'|'$/g, ''));
  }
  // Number
  if (!isNaN(v) && v !== '') return Number(v);
  return v;
}

// Extract all INSERT VALUES
const regex = /VALUES \((.+?)\);/gs;
const rows = [];
let match;

while ((match = regex.exec(sql)) !== null) {
  const rawValues = parseSqlValues(match[1]);

  const cols = [
    'country_id', 'category_id', 'name', 'name_local', 'description',
    'heat_score', 'heat_status', 'search_score', 'social_score',
    'ecommerce_score', 'news_score', 'tags', 'source_urls',
    'first_detected_at', 'last_updated_at'
  ];

  const row = {};
  for (let i = 0; i < cols.length; i++) {
    row[cols[i]] = cleanValue(rawValues[i]);
  }
  rows.push(row);
}

console.log(`Parsed ${rows.length} rows`);
console.log(`Categories: food=${rows.filter(r=>r.tags?.includes('food')).length}, fashion=${rows.filter(r=>r.tags?.includes('fashion')).length}, brands=${rows.filter(r=>r.tags?.includes('brands')).length}, challenge=${rows.filter(r=>r.tags?.includes('challenge')).length}`);
console.log('\nSample row:');
console.log(JSON.stringify(rows[0], null, 2));

// Upload to Supabase
async function upload() {
  console.log('\nUploading to Supabase...');

  const res = await fetch(`${SUPABASE_URL}/rest/v1/trends`, {
    method: 'POST',
    headers: {
      'apikey': SUPABASE_KEY,
      'Authorization': `Bearer ${SUPABASE_KEY}`,
      'Content-Type': 'application/json',
      'Prefer': 'return=representation',
    },
    body: JSON.stringify(rows),
  });

  if (res.ok) {
    const data = await res.json();
    console.log(`\n✅ SUCCESS: ${data.length} rows inserted into Supabase trends table`);
  } else {
    const err = await res.text();
    console.log(`\n❌ ERROR ${res.status}: ${err}`);

    // If bulk insert fails, try one by one
    if (res.status === 400 || res.status === 409) {
      console.log('\nRetrying one by one...');
      let ok = 0, fail = 0;
      for (const row of rows) {
        const r = await fetch(`${SUPABASE_URL}/rest/v1/trends`, {
          method: 'POST',
          headers: {
            'apikey': SUPABASE_KEY,
            'Authorization': `Bearer ${SUPABASE_KEY}`,
            'Content-Type': 'application/json',
            'Prefer': 'return=minimal',
          },
          body: JSON.stringify(row),
        });
        if (r.ok) {
          ok++;
        } else {
          fail++;
          const e = await r.text();
          console.log(`  FAIL [${row.name}]: ${e.slice(0, 200)}`);
        }
      }
      console.log(`\nResult: ${ok} inserted, ${fail} failed`);
    }
  }
}

upload();
