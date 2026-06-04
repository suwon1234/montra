import fs from 'fs';
import path from 'path';
import { spawnSync } from 'child_process';

function defaultWindowDate() {
  return new Intl.DateTimeFormat('sv-SE', { timeZone: 'Asia/Seoul' }).format(new Date());
}

function readArg(name, fallback = '') {
  const match = process.argv.find((arg) => arg.startsWith(`--${name}=`));
  return match ? match.split('=').slice(1).join('=').trim() : fallback;
}

function hasFlag(flag) {
  return process.argv.includes(flag);
}

const rootDir = process.cwd();
const windowDate = readArg('date', process.env.WINDOW_DATE || defaultWindowDate());
const skipTikTok = hasFlag('--skip-tiktok');
const skipSourceCollection = hasFlag('--skip-source-collection');
const tiktokCountries = readArg('tiktok-countries', 'KR');
const tiktokPeriod = readArg('tiktok-period', '7');
const tiktokWaitMs = readArg('tiktok-wait-ms', '7000');
const tiktokProfile = readArg('tiktok-profile', '.cache/tiktok-creative-center-fresh');
const tiktokHeaded = !hasFlag('--tiktok-headless');

function runNode(scriptPath, args = []) {
  const env = { ...process.env, WINDOW_DATE: windowDate };
  const result = spawnSync(process.execPath, [scriptPath, ...args], {
    cwd: rootDir,
    env,
    stdio: 'inherit',
  });

  if (result.status !== 0) {
    throw new Error(`Command failed: node ${scriptPath} ${args.join(' ')}`.trim());
  }
}

function readJson(relativePath) {
  const absolutePath = path.join(rootDir, relativePath);
  if (!fs.existsSync(absolutePath)) return null;
  return JSON.parse(fs.readFileSync(absolutePath, 'utf8'));
}

function main() {
  console.log(`[refresh] window_date=${windowDate}`);

  if (!skipSourceCollection) {
    runNode('scripts/collect_all_country_signals_2026_04_27.mjs', ['--apply', '--skip-tiktok', '--delay-ms=0']);
  }
  runNode('scripts/build_focus25_candidates_from_signals.mjs');

  if (!skipTikTok) {
    const tiktokArgs = [
      '--apply',
      `--countries=${tiktokCountries}`,
      `--period=${tiktokPeriod}`,
      `--wait-ms=${tiktokWaitMs}`,
      `--profile=${tiktokProfile}`,
    ];
    if (tiktokHeaded) {
      tiktokArgs.push('--headed');
    }
    runNode('scripts/collect_tiktok_creative_center_official.mjs', tiktokArgs);
  }

  runNode('scripts/collect_focus_market_support_signals.mjs', [
    '--apply',
    `--input-json=scripts/output/focus25_real_trends_${windowDate}.json`,
  ]);
  runNode('scripts/verify_focus_market_trends.mjs', [
    `--input-json=scripts/output/focus25_real_trends_${windowDate}.json`,
    '--apply',
  ]);
  runNode('scripts/apply_focus_market_carry_forward.mjs', ['--apply']);

  const raw = readJson(`scripts/output/global_all_country_signals_${windowDate}.json`);
  const candidates = readJson(`scripts/output/focus25_real_trends_${windowDate}.json`);
  const tiktok = readJson(`scripts/output/tiktok_creative_center_official_${windowDate}.json`);
  const support = readJson(`scripts/output/focus25_support_signals_${windowDate}.json`);
  const verified = readJson(`scripts/output/verified_focus_market_trends_${windowDate}.json`);
  const carryForward = readJson(`scripts/output/focus25_carry_forward_${windowDate}.json`);

  const candidateCount = candidates
    ? Object.values(candidates).reduce((sum, items) => sum + (Array.isArray(items) ? items.length : 0), 0)
    : 0;

  const finalRowCount = carryForward?.final_counts
    ? carryForward.final_counts.reduce((sum, row) => sum + Number(row.cnt || 0), 0)
    : 0;

  console.log('');
  console.log('[refresh] summary');
  console.log(`- raw signals: ${raw?.signals_collected ?? 0}`);
  console.log(`- candidate countries: ${candidates ? Object.keys(candidates).length : 0}`);
  console.log(`- candidate items: ${candidateCount}`);
  console.log(`- tiktok signals: ${tiktok?.signals?.length ?? 0}`);
  console.log(`- support signals: ${support?.signals?.length ?? 0}`);
  console.log(`- verified today: ${verified?.verified?.length ?? 0}`);
  console.log(`- final countries: ${carryForward?.final_country_count ?? 0}`);
  console.log(`- final rows: ${finalRowCount}`);
}

main();
