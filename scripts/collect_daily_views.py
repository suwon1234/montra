"""
MONTRA - TikTok 일간 조회수 수집기
매일 실행하여 해시태그 조회수를 기록 → 일간/주간 증가량 계산

사용법: py scripts/collect_daily_views.py
매일 1회 실행 → scripts/output/daily_views/ 에 날짜별 저장
"""
import asyncio
import json
import sys
from pathlib import Path
from datetime import datetime

try:
    from TikTokApi import TikTokApi
except:
    print("pip install TikTokApi")
    sys.exit(1)

SCRIPT_DIR = Path(__file__).parent
OUTPUT_DIR = SCRIPT_DIR / "output" / "daily_views"
OUTPUT_DIR.mkdir(parents=True, exist_ok=True)

# 국가별 추적할 해시태그 (구체적 상품명만)
HASHTAGS = {
    # ─── 글로벌 추적 (상품/패션/챌린지 TOP) ───
    "GLOBAL": {
        "products": [
            "sunscreen","lipgloss","iphone16","airfryer","smartwatch",
            "heatlesscurls","niacinamide","dysonairwrap","lipoil","hyaluronicacid",
            "airpodspro","stanleytumbler","vitamincserum","snailmucin","ringlight",
            "retinolserum","wirelesscharger","robotvacuum","massagegun","noisecancelling",
            "ledmask","galaxyprojector","portableblender","minikaraoke","pethairremover",
            "beautysponge","makeupbrush","steamermop","magneticphone","portablevacuum",
        ],
        "fashion": [
            "streetwear","coquette","oldmoney","totebag","cleangirlaesthetic",
            "cargopants","y2kfashion","balletcore","gorpcore","downtowngirl",
            "adidassamba","miniSkirt","crossbodybag","nikedunk","widelegpants",
            "matchingset","blazeroutfit","athleisure","leatherjacket","birkenstock",
            "oversizedhoodie","platformshoes","baseballcap","denimjacket","bohostyle",
            "coastalcowgirl","mobwife","quietluxury","layeredlook","cropTop",
        ],
        "challenges": [
            "grwm","glowup","transformation","dayinmylife","beforeandafter",
            "getreadywithme","makeupchallenge","trynottolaugh","coupleChallenge",
            "outfitchallenge","bombardirocrocodilo","pushupchallenge","plankchallenge",
            "bottlecapchallenge","whatiwore","bestfriendcheck","fliptheswitchchallenge",
            "the10game","squareupchallenge","dancechallenge2026",
        ],
        "food": [],
        "brands": [],
    },
    # ─── 국가별 추적 ───
    "KR": {
        "food": ["tteokbokki","buldak","tanghulu","kimchi","gimbap","hotteok","koreanramen",
                 "yakgwa","samgyeopsal","jjajangmyeon","chimaek","bungeoppang"],
        "fashion": ["ulzzang","hanbok"],
        "brands": ["oliveyoung","fwee","clio","innisfree","musinsa","gentlemonster"],
        "products": ["koreanskincare"],
        "challenges": ["kpopchallenge"],
    },
    "JP": {
        "food": ["matcha","mochi","ramen","sushi","onigiri","takoyaki","japanesecheesecake","taiyaki","gyudon"],
        "fashion": ["gyaru","harajuku","dreamcoreaesthetic"],
        "brands": ["uniqlo","muji","shiseido","daiso"],
        "products": [],
        "challenges": [],
    },
    "US": {
        "food": ["pickledip","mushroomcoffee","crumblcookies","cottagecheese","pistachio","smashburger","birria","acaibowl"],
        "fashion": ["coquette","oldmoney","quietluxury","balletcore","y2kfashion","gorpcore","mobwife"],
        "brands": ["rhode","fentybeauty","stanleycup","dyson","lululemon"],
        "products": ["amazonfinds","galaxyprojector"],
        "challenges": ["the10game","squareupchallenge","makeupchallenge","outfitchallenge"],
    },
    "CN": {
        "food": ["hotpot","boba","dimsum","malatang","xiaolongbao"],
        "fashion": ["hanfu"],
        "brands": ["shein","temu"],
        "products": [],
        "challenges": [],
    },
    "GB": {
        "food": ["donerkebab","biscoff","fishchips","fullenglish"],
        "fashion": ["primark"],
        "brands": ["greggs","marksandspencer","drdent"],
        "products": [],
        "challenges": [],
    },
    "FR": {
        "food": ["croissant","macaron","baguette","crepe"],
        "fashion": ["parisianstyle","jacquemus"],
        "brands": ["dior","loreal"],
        "products": [],
        "challenges": [],
    },
    "IN": {
        "food": ["biryani","chai","panipuri","dosa","samosa","butterchicken"],
        "fashion": ["saree"],
        "brands": ["nykaa"],
        "products": [],
        "challenges": ["bollywooddance"],
    },
    "TH": {
        "food": ["padthai","tomyum","mangostickyrice","somtam"],
        "brands": ["mistine"],
        "fashion": [], "products": [], "challenges": [],
    },
    "BR": {
        "food": ["acaibowl","brigadeiro","coxinha","feijoada","picanha"],
        "brands": ["natura","oboticario"],
        "fashion": ["havaianas"],
        "products": [],
        "challenges": ["samba","funkbrasil"],
    },
    "MX": {
        "food": ["tacos","birria","elote","tamales","churros","guacamole"],
        "brands": ["corona"],
        "fashion": [], "products": [], "challenges": [],
    },
    "IT": {
        "food": ["pasta","pizza","gelato","tiramisu","carbonara","aperolspritz"],
        "fashion": ["madeinitaly"],
        "brands": ["diesel","loewe","lavazza"],
        "products": [], "challenges": [],
    },
    "DE": {
        "food": ["pretzel","currywurst","doner","schnitzel"],
        "brands": ["lidl","aldi","nivea"],
        "fashion": [], "products": [], "challenges": [],
    },
    "ES": {
        "food": ["tapas","churros","paella"],
        "brands": ["zara","mango","mercadona"],
        "fashion": [], "products": [], "challenges": [],
    },
    "AE": {
        "food": ["dubaichocolate","kunafa","shawarma"],
        "brands": ["gissah","hudabeauty"],
        "fashion": ["abaya"],
        "products": [], "challenges": [],
    },
    "AU": {
        "food": ["flatwhite","vegemite","timtam","pavlova","meatpie"],
        "brands": ["aesop","cottonon"],
        "fashion": [], "products": [], "challenges": [],
    },
    "ID": {
        "food": ["nasigoreng","indomie","rendang","satay"],
        "brands": ["wardah","somethinc","shopee"],
        "fashion": ["hijabfashion"],
        "products": [], "challenges": [],
    },
    "PH": {
        "food": ["adobo","lechon","sisig","halohalo","lumpia"],
        "brands": ["jollibee"],
        "fashion": [],
        "products": [], "challenges": [],
    },
    "TR": {
        "food": ["kebab","baklava","dondurma","turkishcoffee"],
        "brands": ["lcwaikiki"],
        "fashion": [], "products": [], "challenges": [],
    },
    "ZA": {
        "food": ["braai","biltong"],
        "challenges": ["amapiano","amapianodance"],
        "fashion": [], "brands": [], "products": [],
    },
    "NG": {
        "food": ["jollofrice","suya","puffpuff"],
        "fashion": ["ankarafashion"],
        "brands": [], "products": [], "challenges": [],
    },
}


async def main():
    today = datetime.now().strftime("%Y-%m-%d")
    print(f"=== MONTRA Daily Views Collector ({today}) ===\n")

    async with TikTokApi() as api:
        await api.create_sessions(num_sessions=1, sleep_after=5, headless=True, browser="webkit")

        all_data = {}
        total = sum(sum(len(v) for v in cats.values()) for cats in HASHTAGS.values())
        done = 0

        for country, cats in sorted(HASHTAGS.items()):
            country_data = {}
            for cat, tags in cats.items():
                for tag in tags:
                    done += 1
                    try:
                        t = api.hashtag(name=tag)
                        info = await t.info()
                        views = info.get("challengeInfo", {}).get("stats", {}).get("viewCount", 0)
                        if views > 0:
                            country_data[tag] = {"views": views, "cat": cat}
                        await asyncio.sleep(1)
                    except:
                        await asyncio.sleep(2)

            all_data[country] = country_data
            if country_data:
                print(f"  {country}: {len(country_data)} tags collected")

    # 오늘 데이터 저장
    today_file = OUTPUT_DIR / f"{today}.json"
    with open(today_file, "w", encoding="utf-8") as f:
        json.dump({"date": today, "data": all_data}, f, ensure_ascii=False, indent=2)
    print(f"\nSaved: {today_file}")

    # 어제 데이터와 비교
    from datetime import timedelta
    yesterday = (datetime.now() - timedelta(days=1)).strftime("%Y-%m-%d")
    yesterday_file = OUTPUT_DIR / f"{yesterday}.json"

    if yesterday_file.exists():
        with open(yesterday_file, "r") as f:
            yesterday_data = json.load(f)["data"]

        print(f"\n=== Daily Growth (vs {yesterday}) ===\n")
        growth_list = []
        for country, tags in all_data.items():
            y_tags = yesterday_data.get(country, {})
            for tag, info in tags.items():
                y_views = y_tags.get(tag, {}).get("views", 0)
                if y_views > 0:
                    diff = info["views"] - y_views
                    pct = (diff / y_views * 100) if y_views else 0
                    if diff > 0:
                        growth_list.append((country, tag, info["cat"], diff, pct, info["views"]))

        growth_list.sort(key=lambda x: x[3], reverse=True)
        print(f"{'Country':6s} {'Tag':25s} {'Cat':12s} {'Daily Growth':>15s} {'%':>8s}")
        print("-" * 75)
        for country, tag, cat, diff, pct, total in growth_list[:30]:
            print(f"{country:6s} #{tag:24s} {cat:12s} +{diff:>13,} {pct:>7.1f}%")

        # 성장률 JSON 저장
        growth_file = OUTPUT_DIR / f"growth_{today}.json"
        with open(growth_file, "w", encoding="utf-8") as f:
            json.dump([
                {"country": c, "tag": t, "cat": cat, "daily_growth": d, "pct": round(p, 2), "total": total}
                for c, t, cat, d, p, total in growth_list
            ], f, ensure_ascii=False, indent=2)
        print(f"\nGrowth saved: {growth_file}")
    else:
        print(f"\nNo yesterday data ({yesterday}). Run again tomorrow to see daily growth!")

    total_tags = sum(len(v) for v in all_data.values())
    print(f"\nTotal: {total_tags} hashtags from {len([c for c in all_data if all_data[c]])} countries")


if __name__ == "__main__":
    asyncio.run(main())
