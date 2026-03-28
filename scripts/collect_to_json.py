"""
MONTRA 간소화 수집 스크립트 — pytrends만 사용, public/data/trends.json에 저장

사용법:
  py scripts/collect_to_json.py                        # 전체 50개국
  py scripts/collect_to_json.py --countries=KR,US,JP   # 특정 국가만
  py scripts/collect_to_json.py --dry-run              # 테스트 (수집 없이)
  py scripts/collect_to_json.py --limit=2              # 카테고리당 키워드 2개
"""
import argparse
import json
import time
import random
import sys
from datetime import datetime, timezone
from pathlib import Path

SCRIPT_DIR = Path(__file__).parent
PROJECT_ROOT = SCRIPT_DIR.parent

try:
    from pytrends.request import TrendReq
    PYTRENDS_OK = True
except ImportError:
    PYTRENDS_OK = False

# CATEGORY_SEEDS import
sys.path.insert(0, str(SCRIPT_DIR))
from collectors.google_trends import CATEGORY_SEEDS

def log(msg):
    print(f"[MONTRA {datetime.now().strftime('%H:%M:%S')}] {msg}")

def get_seeds(category, country_code, limit=5):
    cat = CATEGORY_SEEDS.get(category, {})
    kws = cat.get(country_code, cat.get("DEFAULT", cat.get("US", [])))
    return kws[:limit]

def collect_country(pytrends_obj, country_code, geo, categories, limit=5, delay=5):
    results = []
    for cat in categories:
        seeds = get_seeds(cat, country_code, limit)
        if not seeds:
            continue
        try:
            pytrends_obj.build_payload(seeds[:5], timeframe='today 3-m', geo=geo)
            df = pytrends_obj.interest_over_time()
            if df.empty:
                log(f"  [{country_code}/{cat}] 결과 없음")
                continue
            for kw in seeds[:5]:
                if kw not in df.columns:
                    continue
                avg = float(df[kw].mean())
                # related queries
                related = []
                try:
                    rq = pytrends_obj.related_queries()
                    if kw in rq and rq[kw].get('top') is not None:
                        related = rq[kw]['top']['query'].tolist()[:8]
                except:
                    pass

                heat_score = max(0, min(100, round(avg)))
                status = 'rising' if avg > 60 else ('steady' if avg > 30 else 'new')

                results.append({
                    'keyword': kw,
                    'category': cat,
                    'heat_score': heat_score,
                    'heat_status': status,
                    'search_score': round(avg, 1),
                    'social_score': 0,
                    'related_queries': related,
                    'collected_at': datetime.now(timezone.utc).isoformat()
                })
                log(f"  [{country_code}/{cat}] {kw}: score={heat_score}")
        except Exception as e:
            if '429' in str(e).lower():
                wait = delay * 3 + random.uniform(5, 15)
                log(f"  [{country_code}/{cat}] 429 에러, {wait:.0f}초 대기...")
                time.sleep(wait)
            else:
                log(f"  [{country_code}/{cat}] 에러: {e}")

        time.sleep(delay + random.uniform(1, 3))
    return results

def main():
    parser = argparse.ArgumentParser(description='MONTRA pytrends 수집 → trends.json')
    parser.add_argument('--countries', type=str, help='수집할 국가 (쉼표 구분, 예: KR,US,JP)')
    parser.add_argument('--limit', type=int, default=3, help='카테고리당 키워드 수 (기본: 3)')
    parser.add_argument('--delay', type=float, default=5, help='요청 간 딜레이 초 (기본: 5)')
    parser.add_argument('--dry-run', action='store_true', help='수집 없이 설정만 확인')
    args = parser.parse_args()

    # 설정 로드
    config_path = SCRIPT_DIR / 'config' / 'countries.json'
    with open(config_path, 'r', encoding='utf-8') as f:
        all_countries = json.load(f)

    # 국가 필터
    if args.countries:
        codes = [c.strip().upper() for c in args.countries.split(',')]
        countries = [c for c in all_countries if c['code'] in codes and c.get('enabled', True)]
    else:
        countries = [c for c in all_countries if c.get('enabled', True)]

    log(f"대상: {len(countries)}개국, 키워드/카테고리: {args.limit}개, 딜레이: {args.delay}초")

    if args.dry_run:
        for c in countries:
            log(f"  {c['code']} ({c['name']}) — {len(c['categories'])}개 카테고리")
        log("Dry run 완료. 실제 수집하려면 --dry-run 제거.")
        return

    if not PYTRENDS_OK:
        log("ERROR: pytrends 미설치. 실행: py -m pip install pytrends")
        sys.exit(1)

    # 수집 시작
    output = {'last_updated': datetime.now(timezone.utc).isoformat(), 'countries': {}}

    # 기존 데이터 로드 (있으면 merge)
    output_path = PROJECT_ROOT / 'public' / 'data' / 'trends.json'
    if output_path.exists():
        try:
            with open(output_path, 'r', encoding='utf-8') as f:
                output = json.load(f)
            log(f"기존 데이터 로드: {len(output.get('countries', {}))}개국")
        except:
            pass

    pytrends = TrendReq(hl='en-US', tz=0, timeout=(10, 25), retries=2, backoff_factor=0.5)

    total = len(countries)
    for idx, country in enumerate(countries, 1):
        code = country['code']
        geo = country.get('google_trends_geo', code)
        cats = country.get('categories', ['fashion', 'food', 'tech'])

        log(f"\n[{idx}/{total}] {code} ({country['name']}) 수집 중...")

        trends = collect_country(pytrends, code, geo, cats, args.limit, args.delay)

        if trends:
            output['countries'][code] = {
                'name': country['name'],
                'trends': trends
            }
            output['last_updated'] = datetime.now(timezone.utc).isoformat()

            # 매 국가 수집 후 중간 저장
            output_path.parent.mkdir(parents=True, exist_ok=True)
            with open(output_path, 'w', encoding='utf-8') as f:
                json.dump(output, f, ensure_ascii=False, indent=2)
            log(f"  → {len(trends)}개 트렌드 저장 (누적 {len(output['countries'])}개국)")

        # 국가 간 딜레이
        if idx < total:
            wait = args.delay * 2 + random.uniform(2, 5)
            log(f"  다음 국가까지 {wait:.0f}초 대기...")
            time.sleep(wait)

    log(f"\n완료! {len(output['countries'])}개국 데이터 → {output_path}")

if __name__ == '__main__':
    main()
