"""
MONTRA - TikTok 국가별 트렌드 수집기
TikTok-Api로 각 국가별 해시태그 조회수를 확인하여 실제 유행 상품 파악

사용법: py scripts/collect_tiktok_trends.py
"""

import asyncio
import json
import sys
from pathlib import Path
from datetime import datetime

try:
    from TikTokApi import TikTokApi
except ImportError:
    print("ERROR: pip install TikTokApi")
    sys.exit(1)

SCRIPT_DIR = Path(__file__).parent
OUTPUT_DIR = SCRIPT_DIR / "output"
OUTPUT_DIR.mkdir(exist_ok=True)

# 52개 활성 국가별 해시태그 (food/fashion/brands/products/challenge)
COUNTRY_HASHTAGS = {
    "KR": {
        "food": ["kfood", "koreanfood", "tteokbokki", "buldak", "dujjonku", "tanghulu", "hotteok", "kimchi", "koreanramen", "yakgwa"],
        "fashion": ["koreanfashion", "kfashion", "kbeauty", "ulzzang", "hanbok"],
        "brands": ["oliveyoung", "fwee", "clio", "innisfree", "musinsa"],
        "products": ["kbeautyviral", "koreanskincare"],
        "challenge": ["kpopchallenge", "koreachallenge"],
    },
    "JP": {
        "food": ["japanfood", "japanstreetfood", "japanesesnack", "onigiri", "takoyaki", "mochi", "japanesecheesecake", "matcha"],
        "fashion": ["japanesefashion", "harajuku", "gyaru", "dreamcoreaesthetic"],
        "brands": ["uniqlo", "muji", "shiseido", "itsu"],
        "products": ["japanbeauty", "japangadget"],
        "challenge": ["jetjetdance"],
    },
    "CN": {
        "food": ["chinesefood", "chinesestreetfood", "hotpot", "boba", "dimsum", "mooncake"],
        "fashion": ["chinesefashion", "hanfu", "guochao"],
        "brands": ["shein", "temu", "kans", "proya", "funnyelves"],
        "products": ["douyinviral"],
        "challenge": [],
    },
    "US": {
        "food": ["tiktokmademebuyit", "pickledip", "mushroomcoffee", "proteinrecipe", "airfryerrecipe", "crumblcookies"],
        "fashion": ["coquette", "oldmoney", "quietluxury", "balletcore", "streetwear", "y2kfashion", "mobwife"],
        "brands": ["rhode", "fentybeauty", "stanleycup", "dyson", "lululemon"],
        "products": ["amazonfinds", "viralproducts", "galaxyprojector", "tiktokmademebuyit2026"],
        "challenge": ["the10game", "squareupchallenge", "dancechallenge2026", "outfitchallenge", "makeupchallenge"],
    },
    "GB": {
        "food": ["ukfood", "britishfood", "donerkebab", "biscoff", "greggs"],
        "fashion": ["ukfashion", "primark", "britishstyle"],
        "brands": ["greggs", "primark", "marksandspencer"],
        "products": ["drdent", "umay"],
        "challenge": [],
    },
    "FR": {
        "food": ["frenchfood", "croissant", "frenchpastry", "pistachio"],
        "fashion": ["frenchfashion", "parisianstyle", "jacquemus"],
        "brands": ["jacquemus", "dior", "loreal"],
        "products": ["moulinex"],
        "challenge": [],
    },
    "DE": {
        "food": ["germanfood", "pretzel", "currywurst", "doner"],
        "fashion": ["germanfashion", "berlinstreetfashion"],
        "brands": ["lidl", "aldi", "nivea", "philips"],
        "products": ["jonrvacuum"],
        "challenge": [],
    },
    "IT": {
        "food": ["italianfood", "pasta", "pizza", "gelato", "aperolspritz", "pistachio"],
        "fashion": ["italianfashion", "madeinitaly", "milanfashion"],
        "brands": ["lavazza", "aperol", "diesel", "loewe"],
        "products": [],
        "challenge": [],
    },
    "ES": {
        "food": ["spanishfood", "tapas", "churros", "paella"],
        "fashion": ["spanishfashion", "zarastyle"],
        "brands": ["zara", "mango", "mercadona"],
        "products": [],
        "challenge": [],
    },
    "IN": {
        "food": ["indianfood", "indianstreetfood", "biryani", "chai", "panipuri", "dosa"],
        "fashion": ["indianfashion", "saree", "lehengacholi"],
        "brands": ["nykaa", "mamaearth", "tata"],
        "products": ["indianbeauty"],
        "challenge": ["bollywooddance", "punjabidancechallenge"],
    },
    "TH": {
        "food": ["thaifood", "padthai", "tomyum", "mangostickyrice", "thaistreetfood"],
        "fashion": ["thaifashion"],
        "brands": ["mistine"],
        "products": ["thaibeauty", "thaiskincre"],
        "challenge": [],
    },
    "VN": {
        "food": ["vietnamesefood", "pho", "banhmifood", "eggcoffee", "vietnamesecoffe"],
        "fashion": ["vietnamesefashion", "aodai"],
        "brands": [],
        "products": [],
        "challenge": [],
    },
    "ID": {
        "food": ["indonesianfood", "nasigoreng", "indomie", "rendang", "satay"],
        "fashion": ["hijabfashion", "indonesianfashion", "modestfashion"],
        "brands": ["wardah", "somethinc", "shopee"],
        "products": [],
        "challenge": [],
    },
    "PH": {
        "food": ["filipinofood", "adobo", "lechon", "halo halo", "sisig"],
        "fashion": ["filipinafashion", "modernfilipiniana"],
        "brands": ["sunniesface", "jollibee"],
        "products": [],
        "challenge": ["hawakmoangbeat"],
    },
    "MY": {
        "food": ["malaysianfood", "nasilemak", "tehtarik", "rendang", "rotikanai"],
        "fashion": ["malaysianfashion", "hijabmalaysia"],
        "brands": [],
        "products": [],
        "challenge": [],
    },
    "BR": {
        "food": ["brazilianfood", "acaibowl", "brigadeiro", "coxinha", "feijoada"],
        "fashion": ["brazilianfashion", "havaianas"],
        "brands": ["natura", "oboticario", "havaianas"],
        "products": [],
        "challenge": ["braziliandance", "samba", "funkbrasil"],
    },
    "MX": {
        "food": ["mexicanfood", "tacos", "birria", "elote", "tamales", "churros"],
        "fashion": ["mexicanfashion"],
        "brands": ["bimbo", "corona"],
        "products": [],
        "challenge": [],
    },
    "AE": {
        "food": ["dubaifood", "dubaichocolate", "kunafa", "shawarma", "arabicfood"],
        "fashion": ["dubaifashion", "abaya", "modestfashion"],
        "brands": ["gissah", "hudabeauty"],
        "products": [],
        "challenge": [],
    },
    "SA": {
        "food": ["saudifood", "kabsa", "dates", "arabiccoffee"],
        "fashion": ["saudifashion", "modestfashion"],
        "brands": ["gissah"],
        "products": [],
        "challenge": [],
    },
    "AU": {
        "food": ["australianfood", "flatwhite", "vegemite", "timtam", "meatpie", "pavlova"],
        "fashion": ["australianfashion", "surfwear"],
        "brands": ["aesop", "cottonon"],
        "products": [],
        "challenge": [],
    },
    "TR": {
        "food": ["turkishfood", "kebab", "baklava", "dondurma", "kunefe", "turkishcoffee"],
        "fashion": ["turkishfashion"],
        "brands": ["lcwaikiki"],
        "products": [],
        "challenge": [],
    },
    "AR": {
        "food": ["argentinefood", "asado", "empanadas", "dulcedeleche", "alfajor"],
        "fashion": [],
        "brands": [],
        "products": [],
        "challenge": ["cumbiaremix"],
    },
    "CO": {
        "food": ["colombianfood", "arepa", "bandejpaisa"],
        "fashion": [],
        "brands": [],
        "products": [],
        "challenge": ["cumbiaremix"],
    },
    "NG": {
        "food": ["nigerianfood", "jollofrice", "suya", "puffpuff", "egusisoup"],
        "fashion": ["ankarafashion", "africanfashion"],
        "brands": [],
        "products": [],
        "challenge": [],
    },
    "ZA": {
        "food": ["southafricanfood", "braai", "biltong", "bobotie"],
        "fashion": ["southafricanfashion"],
        "brands": [],
        "products": [],
        "challenge": ["amapiano", "amapianodance"],
    },
    "KE": {
        "food": ["kenyanfood", "ugali", "nyamachoma", "chapati"],
        "fashion": [],
        "brands": [],
        "products": [],
        "challenge": [],
    },
    "IL": {
        "food": ["israelifood", "falafel", "hummus", "shakshuka", "sabich"],
        "fashion": [],
        "brands": [],
        "products": [],
        "challenge": [],
    },
    "NL": {
        "food": ["dutchfood", "stroopwafel", "bitterballen", "poffertjes"],
        "fashion": ["dutchfashion"],
        "brands": [],
        "products": [],
        "challenge": [],
    },
    "CA": {
        "food": ["canadianfood", "poutine", "maplesyrup", "beavertails"],
        "fashion": [],
        "brands": [],
        "products": ["koreanskincare"],
        "challenge": [],
    },
    "PK": {
        "food": ["pakistanifood", "biryani", "nihari", "seekhkebab", "paratha"],
        "fashion": ["pakistanifashion", "lehengacholi"],
        "brands": [],
        "products": [],
        "challenge": [],
    },
    "TW": {
        "food": ["taiwanesefood", "bubbletea", "beefnoodle", "pineapplecake", "xiaolongbao"],
        "fashion": [],
        "brands": [],
        "products": [],
        "challenge": [],
    },
    "SG": {
        "food": ["singaporefood", "chickennoodle", "laksa", "kayatoast", "chilicrab"],
        "fashion": [],
        "brands": ["grab"],
        "products": [],
        "challenge": [],
    },
}

# 나머지 국가 (기본 해시태그만)
for code in ["ET","GH","GT","HN","LB","UA","BD","DO","JM","IS","RS","MM","KZ","HK","RU","GR",
             "FJ","WS","TO","NZ","MA"]:
    if code not in COUNTRY_HASHTAGS:
        COUNTRY_HASHTAGS[code] = {"food":[],"fashion":[],"brands":[],"products":[],"challenge":[]}


def views_to_score(views):
    if views >= 10_000_000_000: return 100
    if views >= 1_000_000_000: return 95
    if views >= 500_000_000: return 90
    if views >= 100_000_000: return 80
    if views >= 50_000_000: return 70
    if views >= 10_000_000: return 60
    if views >= 1_000_000: return 45
    if views >= 100_000: return 30
    if views >= 10_000: return 15
    return 5 if views > 0 else 0


CATEGORY_MAP = {
    "food": "989c0361-82f8-4805-a4b1-285a7ee420de",
    "fashion": "98561c59-d4db-41d7-b7e6-545614e37e87",
    "brands": "47d77b6d-3c38-4861-ac3a-1dfe04277da5",
    "products": "faba0b6a-bbbe-4eb6-8035-23c7e5b2a61b",
    "challenge": "faba0b6a-bbbe-4eb6-8035-23c7e5b2a61b",
}


async def main():
    print("=" * 60)
    print("MONTRA - TikTok Country Trends Collector")
    print("=" * 60)

    # Load country IDs
    with open(SCRIPT_DIR / "config" / "supabase_ids.json", "r") as f:
        config = json.load(f)

    all_results = {}

    async with TikTokApi() as api:
        await api.create_sessions(num_sessions=1, sleep_after=5, headless=True, browser='webkit')

        total_tags = sum(sum(len(v) for v in cats.values()) for cats in COUNTRY_HASHTAGS.values())
        done = 0

        for country_code, categories in sorted(COUNTRY_HASHTAGS.items()):
            country_id = config["countries"].get(country_code)
            if not country_id:
                continue

            country_results = []
            print(f"\n[{country_code}]")

            for category, hashtags in categories.items():
                for tag_name in hashtags:
                    done += 1
                    try:
                        tag = api.hashtag(name=tag_name)
                        info = await tag.info()
                        stats = info.get("challengeInfo", {}).get("stats", {})
                        views = stats.get("viewCount", 0)

                        if views > 0:
                            score = views_to_score(views)
                            country_results.append({
                                "hashtag": tag_name,
                                "category": category,
                                "views": views,
                                "score": score,
                                "country_id": country_id,
                                "category_id": CATEGORY_MAP[category],
                            })
                            print(f"  [{done}/{total_tags}] #{tag_name} ({category}): {views:,} views")

                        await asyncio.sleep(1.2)
                    except Exception as e:
                        await asyncio.sleep(2)

            all_results[country_code] = country_results

    # Save JSON
    json_path = OUTPUT_DIR / "tiktok_country_trends.json"
    with open(json_path, "w", encoding="utf-8") as f:
        json.dump(all_results, f, ensure_ascii=False, indent=2)

    # Generate SQL
    sql_path = OUTPUT_DIR / "tiktok_trends_verified.sql"
    trend_count = 0
    with open(sql_path, "w", encoding="utf-8") as f:
        f.write(f"-- MONTRA TikTok Verified Trends\n")
        f.write(f"-- Generated: {datetime.now().isoformat()}\n")
        f.write(f"-- Source: TikTok-Api real view counts\n\n")

        for country_code, results in sorted(all_results.items()):
            for r in results:
                tags_arr = f"ARRAY['{r['category']}','tiktok','viral']"
                if r["category"] == "challenge":
                    tags_arr = f"ARRAY['challenge','tiktok','viral']"

                desc = f"틱톡에서 #{r['hashtag']} 해시태그 {r['views']:,} 조회수 바이럴."
                name = f"#{r['hashtag']}"

                f.write(
                    f"INSERT INTO trends (country_id, category_id, name, description, "
                    f"heat_score, heat_status, search_score, social_score, ecommerce_score, news_score, "
                    f"tags, source_urls, first_detected_at, last_updated_at) VALUES ("
                    f"'{r['country_id']}', '{r['category_id']}', '{name}', '{desc}', "
                    f"{r['score']}, 'rising', 0, {r['score']}, 0, 0, "
                    f"{tags_arr}, ARRAY[]::text[], "
                    f"'2026-03-01T00:00:00Z', '2026-03-24T00:00:00Z');\n"
                )
                trend_count += 1

    total_with_data = sum(1 for r in all_results.values() if r)
    print(f"\n{'=' * 60}")
    print(f"Done!")
    print(f"  Countries with data: {total_with_data}")
    print(f"  Total trends: {trend_count}")
    print(f"  JSON: {json_path}")
    print(f"  SQL: {sql_path}")
    print(f"{'=' * 60}")


if __name__ == "__main__":
    asyncio.run(main())
