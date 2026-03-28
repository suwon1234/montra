"""
MONTRA - TikTok 구체적 상품명 수집기
제네릭(#koreanfood) 아닌 구체적 상품(#tteokbokki, #buldak) 조회수만 수집
"""
import asyncio, json, sys
from pathlib import Path
from datetime import datetime
try:
    from TikTokApi import TikTokApi
except:
    print("pip install TikTokApi"); sys.exit(1)

SCRIPT_DIR = Path(__file__).parent

ITEMS = {
    "KR": {
        "food": ["tteokbokki","buldak","dujjonku","tanghulu","hotteok","kimchi","yakgwa","gimbap","bungeoppang","chimaek","sojubomb","koreanramen"],
        "fashion": ["ulzzang","hanbok"],
        "brands": ["oliveyoung","fwee","clio","innisfree","musinsa","gentlemonster","sulwhasoo"],
        "products": ["snailmucin","ledmask","koreanskincare"],
        "challenge": ["kpopchallenge"],
    },
    "JP": {
        "food": ["onigiri","takoyaki","mochi","matcha","japanesecheesecake","ramen","sushi","taiyaki","dango","gyudon","okonomiyaki","furikake"],
        "fashion": ["gyaru","harajuku","dreamcoreaesthetic"],
        "brands": ["uniqlo","muji","shiseido","itsu","daiso"],
        "products": [],
        "challenge": [],
    },
    "CN": {
        "food": ["hotpot","boba","dimsum","mooncake","malatang","jianbing","xiaolongbao","tangyuan","congee"],
        "fashion": ["hanfu"],
        "brands": ["shein","temu","kans","proya","funnyelves"],
        "products": [],
        "challenge": [],
    },
    "US": {
        "food": ["pickledip","mushroomcoffee","crumblcookies","airfryerrecipe","birria","acaibowl","smashburger","pistachio","cottagecheese"],
        "fashion": ["coquette","oldmoney","quietluxury","balletcore","y2kfashion","mobwife","gorpcore"],
        "brands": ["rhode","fentybeauty","stanleycup","dyson","lululemon"],
        "products": ["amazonfinds","galaxyprojector"],
        "challenge": ["the10game","squareupchallenge","dancechallenge2026","outfitchallenge","makeupchallenge"],
    },
    "GB": {
        "food": ["donerkebab","biscoff","fullenglish","cornishpasty","fishchips","crumpets"],
        "fashion": ["primark"],
        "brands": ["greggs","primark","marksandspencer","drdent"],
        "products": [],
        "challenge": [],
    },
    "FR": {
        "food": ["croissant","pistachio","crepe","macaron","baguette","painauchocolat","quiche"],
        "fashion": ["parisianstyle","jacquemus"],
        "brands": ["jacquemus","dior","loreal"],
        "products": ["moulinex"],
        "challenge": [],
    },
    "DE": {
        "food": ["pretzel","currywurst","doner","schnitzel","bratwurst","spaetzle"],
        "fashion": [],
        "brands": ["lidl","aldi","nivea","philips"],
        "products": [],
        "challenge": [],
    },
    "IT": {
        "food": ["pasta","pizza","gelato","aperolspritz","tiramisu","risotto","carbonara","lasagna","bruschetta"],
        "fashion": ["madeinitaly"],
        "brands": ["lavazza","aperol","diesel","loewe"],
        "products": [],
        "challenge": [],
    },
    "ES": {
        "food": ["tapas","churros","paella","gazpacho","jamon","croquetas","tortillaespanola"],
        "fashion": ["zarastyle"],
        "brands": ["zara","mango","mercadona"],
        "products": [],
        "challenge": [],
    },
    "IN": {
        "food": ["biryani","chai","panipuri","dosa","samosa","butterchicken","gulabjamun","naan","tandoori"],
        "fashion": ["saree","lehengacholi"],
        "brands": ["nykaa","mamaearth"],
        "products": [],
        "challenge": ["bollywooddance"],
    },
    "TH": {
        "food": ["padthai","tomyum","mangostickyrice","somtam","greencurry","tomkha"],
        "brands": ["mistine"],
        "fashion": [], "products": [], "challenge": [],
    },
    "VN": {
        "food": ["pho","eggcoffee","springrolls","buncha","bahnmi"],
        "fashion": ["aodai"],
        "brands": [], "products": [], "challenge": [],
    },
    "ID": {
        "food": ["nasigoreng","indomie","rendang","satay","martabak","bakso"],
        "fashion": ["hijabfashion","modestfashion"],
        "brands": ["wardah","somethinc","shopee"],
        "products": [], "challenge": [],
    },
    "PH": {
        "food": ["adobo","lechon","sisig","halohalo","lumpia","sinigang"],
        "fashion": ["modernfilipiniana"],
        "brands": ["jollibee","sunniesface"],
        "products": [], "challenge": ["hawakmoangbeat"],
    },
    "MY": {
        "food": ["nasilemak","tehtarik","rendang","satay","cendol","rojak"],
        "fashion": ["hijabmalaysia"],
        "brands": [], "products": [], "challenge": [],
    },
    "BR": {
        "food": ["acaibowl","brigadeiro","coxinha","feijoada","picanha","pastel"],
        "fashion": ["havaianas"],
        "brands": ["natura","oboticario"],
        "products": [], "challenge": ["samba","funkbrasil"],
    },
    "MX": {
        "food": ["tacos","birria","elote","tamales","churros","guacamole","pozole"],
        "brands": ["corona","bimbo"],
        "fashion": [], "products": [], "challenge": [],
    },
    "AE": {
        "food": ["dubaichocolate","kunafa","shawarma","falafel","manakish"],
        "fashion": ["abaya"],
        "brands": ["gissah","hudabeauty"],
        "products": [], "challenge": [],
    },
    "TR": {
        "food": ["kebab","baklava","dondurma","kunefe","turkishcoffee","lahmacun","pide"],
        "brands": ["lcwaikiki"],
        "fashion": [], "products": [], "challenge": [],
    },
    "AU": {
        "food": ["flatwhite","vegemite","timtam","meatpie","pavlova","lamington"],
        "fashion": ["surfwear"],
        "brands": ["aesop","cottonon"],
        "products": [], "challenge": [],
    },
    "AR": {
        "food": ["asado","empanadas","dulcedeleche","alfajor","choripan","medialunas"],
        "challenge": ["cumbiaremix"],
        "fashion": [], "brands": [], "products": [],
    },
    "NG": {
        "food": ["jollofrice","suya","puffpuff","egusisoup","akara"],
        "fashion": ["ankarafashion","africanfashion"],
        "brands": [], "products": [], "challenge": [],
    },
    "ZA": {
        "food": ["braai","biltong","bobotie","bunnychow"],
        "challenge": ["amapiano","amapianodance"],
        "fashion": [], "brands": [], "products": [],
    },
    "SA": {
        "food": ["kabsa","dates","arabiccoffee","kunafa","mandi"],
        "brands": ["gissah"],
        "fashion": [], "products": [], "challenge": [],
    },
    "TW": {
        "food": ["bubbletea","xiaolongbao","pineapplecake","beefnoodle","oysteromelet"],
        "fashion": [], "brands": [], "products": [], "challenge": [],
    },
    "CA": {
        "food": ["poutine","maplesyrup","beavertails"],
        "products": ["koreanskincare"],
        "fashion": [], "brands": [], "challenge": [],
    },
    "IL": {
        "food": ["falafel","hummus","shakshuka","sabich"],
        "fashion": [], "brands": [], "products": [], "challenge": [],
    },
    "NL": {
        "food": ["stroopwafel","bitterballen","poffertjes","kroket"],
        "fashion": [], "brands": [], "products": [], "challenge": [],
    },
    "PK": {
        "food": ["biryani","nihari","seekhkebab","paratha","haleem"],
        "fashion": ["pakistanifashion","lehengacholi"],
        "brands": [], "products": [], "challenge": [],
    },
    "SG": {
        "food": ["laksa","kayatoast","chilicrab","hainanesechickenrice"],
        "brands": ["grab"],
        "fashion": [], "products": [], "challenge": [],
    },
    "KE": {
        "food": ["ugali","nyamachoma","chapati","mandazi"],
        "fashion": [], "brands": [], "products": [], "challenge": [],
    },
    "CO": {
        "food": ["arepa","empanadas","ajiaco"],
        "challenge": ["cumbiaremix"],
        "fashion": [], "brands": [], "products": [],
    },
}

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

CAT_IDS = {
    "food": "989c0361-82f8-4805-a4b1-285a7ee420de",
    "fashion": "98561c59-d4db-41d7-b7e6-545614e37e87",
    "brands": "47d77b6d-3c38-4861-ac3a-1dfe04277da5",
    "products": "faba0b6a-bbbe-4eb6-8035-23c7e5b2a61b",
    "challenge": "faba0b6a-bbbe-4eb6-8035-23c7e5b2a61b",
}

async def main():
    with open(SCRIPT_DIR / "config" / "supabase_ids.json") as f:
        config = json.load(f)

    results = {}
    async with TikTokApi() as api:
        await api.create_sessions(num_sessions=1, sleep_after=5, headless=True, browser="webkit")

        total = sum(sum(len(v) for v in c.values()) for c in ITEMS.values())
        done = 0

        for country, cats in sorted(ITEMS.items()):
            cid = config["countries"].get(country)
            if not cid: continue
            data = []
            for cat, tags in cats.items():
                for tag in tags:
                    done += 1
                    try:
                        t = api.hashtag(name=tag)
                        info = await t.info()
                        views = info.get("challengeInfo",{}).get("stats",{}).get("viewCount",0)
                        if views > 0:
                            data.append({"tag":tag,"cat":cat,"views":views,"score":views_to_score(views),"cid":cid,"cat_id":CAT_IDS[cat]})
                        await asyncio.sleep(1)
                    except:
                        await asyncio.sleep(2)
            results[country] = data
            ok = len(data)
            if ok: print(f"  {country}: {ok} specific items")

    # Save JSON
    with open(SCRIPT_DIR / "output" / "tiktok_specific_items.json", "w") as f:
        json.dump(results, f, ensure_ascii=False, indent=2)

    # Generate SQL
    sql_path = SCRIPT_DIR / "output" / "tiktok_specific_trends.sql"
    cnt = 0
    with open(sql_path, "w", encoding="utf-8") as f:
        f.write(f"-- MONTRA TikTok Specific Items\n-- {datetime.now().isoformat()}\n\n")
        for country, data in sorted(results.items()):
            for d in data:
                tags = f"ARRAY['{d['cat']}','tiktok','viral']"
                if d["cat"] == "challenge":
                    tags = f"ARRAY['challenge','tiktok','viral']"
                desc = f"틱톡에서 #{d['tag']} {d['views']:,} 조회수 바이럴."
                name = d["tag"]
                f.write(
                    f"INSERT INTO trends (country_id, category_id, name, description, "
                    f"heat_score, heat_status, search_score, social_score, ecommerce_score, news_score, "
                    f"tags, source_urls, first_detected_at, last_updated_at) VALUES ("
                    f"'{d['cid']}', '{d['cat_id']}', '{name}', '{desc}', "
                    f"{d['score']}, 'rising', 0, {d['score']}, 0, 0, "
                    f"{tags}, ARRAY[]::text[], "
                    f"'2026-03-01T00:00:00Z', '2026-03-24T00:00:00Z');\n"
                )
                cnt += 1

    total_countries = sum(1 for v in results.values() if v)
    print(f"\nDone! {cnt} specific items from {total_countries} countries")
    print(f"SQL: {sql_path}")

asyncio.run(main())
