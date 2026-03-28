"""
190개국 × 4카테고리 보충 트렌드 SQL 생성 (v5 supplement)
- 기존 v5 SQL 파싱 → 국가-카테고리별 트렌드 수 파악
- 5개 미만인 조합에 대해 부족분만 생성
- 지역별 대표 트렌드 풀에서 해당 국가에 맞게 변형
- 기존 트렌드 이름과 중복 없음
- 출력: scripts/output/trends_v5_supplement.sql
"""

import sys
import io
import json
import re
import random
import hashlib
from datetime import datetime, timezone
from pathlib import Path

try:
    sys.stdout.reconfigure(encoding='utf-8', errors='replace')
except Exception:
    sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8', errors='replace')

SCRIPT_DIR = Path(__file__).parent
CONFIG_DIR = SCRIPT_DIR / "config"
OUTPUT_DIR = SCRIPT_DIR / "output"
OUTPUT_DIR.mkdir(exist_ok=True)

with open(CONFIG_DIR / "supabase_ids.json", "r", encoding="utf-8") as f:
    SUPABASE_IDS = json.load(f)

CATEGORY_IDS = SUPABASE_IDS["categories"]
COUNTRY_IDS = SUPABASE_IDS["countries"]

NOW = "2026-03-24T12:00:00Z"
FIRST_DETECTED = "2026-03-01T00:00:00Z"

CATEGORIES = ["fashion", "products", "food", "brands"]
TARGET_MIN = 5

# ================================================================
# Seed for reproducibility
# ================================================================
random.seed(42)

# ================================================================
# Country metadata
# ================================================================
COUNTRY_NAMES = {
    "AO": "Angola", "BF": "Burkina Faso", "BI": "Burundi", "BJ": "Benin",
    "BW": "Botswana", "CD": "DR Congo", "CF": "Central African Republic",
    "CG": "Congo", "CI": "Ivory Coast", "CM": "Cameroon", "CV": "Cape Verde",
    "DJ": "Djibouti", "DZ": "Algeria", "EG": "Egypt", "ER": "Eritrea",
    "ET": "Ethiopia", "GA": "Gabon", "GH": "Ghana", "GM": "Gambia",
    "GN": "Guinea", "GQ": "Equatorial Guinea", "GW": "Guinea-Bissau",
    "KE": "Kenya", "KM": "Comoros", "LR": "Liberia", "LS": "Lesotho",
    "LY": "Libya", "MA": "Morocco", "MG": "Madagascar", "ML": "Mali",
    "MR": "Mauritania", "MU": "Mauritius", "MW": "Malawi", "MZ": "Mozambique",
    "NA": "Namibia", "NE": "Niger", "NG": "Nigeria", "RW": "Rwanda",
    "SC": "Seychelles", "SD": "Sudan", "SL": "Sierra Leone", "SN": "Senegal",
    "SO": "Somalia", "SS": "South Sudan", "ST": "São Tomé and Príncipe",
    "SZ": "Eswatini", "TD": "Chad", "TG": "Togo", "TN": "Tunisia",
    "TZ": "Tanzania", "UG": "Uganda", "ZA": "South Africa", "ZM": "Zambia",
    "ZW": "Zimbabwe",
    "AG": "Antigua and Barbuda", "AR": "Argentina", "BB": "Barbados",
    "BO": "Bolivia", "BR": "Brazil", "BS": "Bahamas", "BZ": "Belize",
    "CA": "Canada", "CL": "Chile", "CO": "Colombia", "CR": "Costa Rica",
    "CU": "Cuba", "DM": "Dominica", "DO": "Dominican Republic",
    "EC": "Ecuador", "GD": "Grenada", "GT": "Guatemala", "GY": "Guyana",
    "HN": "Honduras", "HT": "Haiti", "JM": "Jamaica", "MX": "Mexico",
    "NI": "Nicaragua", "PA": "Panama", "PE": "Peru", "PR": "Puerto Rico",
    "PY": "Paraguay", "SR": "Suriname", "SV": "El Salvador",
    "TT": "Trinidad and Tobago", "US": "United States", "UY": "Uruguay",
    "VE": "Venezuela",
    "AF": "Afghanistan", "BD": "Bangladesh", "BN": "Brunei", "BT": "Bhutan",
    "CN": "China", "HK": "Hong Kong", "ID": "Indonesia", "IN": "India",
    "JP": "Japan", "KG": "Kyrgyzstan", "KH": "Cambodia", "KR": "South Korea",
    "KZ": "Kazakhstan", "LA": "Laos", "LK": "Sri Lanka", "MM": "Myanmar",
    "MN": "Mongolia", "MV": "Maldives", "MY": "Malaysia", "NP": "Nepal",
    "PH": "Philippines", "PK": "Pakistan", "SG": "Singapore", "TH": "Thailand",
    "TJ": "Tajikistan", "TL": "Timor-Leste", "TM": "Turkmenistan",
    "TW": "Taiwan", "UZ": "Uzbekistan", "VN": "Vietnam",
    "AL": "Albania", "AM": "Armenia", "AT": "Austria", "AZ": "Azerbaijan",
    "BA": "Bosnia and Herzegovina", "BE": "Belgium", "BG": "Bulgaria",
    "BY": "Belarus", "CH": "Switzerland", "CY": "Cyprus", "CZ": "Czech Republic",
    "DE": "Germany", "DK": "Denmark", "EE": "Estonia", "ES": "Spain",
    "FI": "Finland", "FR": "France", "GB": "United Kingdom", "GE": "Georgia",
    "GR": "Greece", "HR": "Croatia", "HU": "Hungary", "IE": "Ireland",
    "IS": "Iceland", "IT": "Italy", "LT": "Lithuania", "LU": "Luxembourg",
    "LV": "Latvia", "MD": "Moldova", "ME": "Montenegro",
    "MK": "North Macedonia", "MT": "Malta", "NL": "Netherlands",
    "NO": "Norway", "PL": "Poland", "PT": "Portugal", "RO": "Romania",
    "RS": "Serbia", "RU": "Russia", "SE": "Sweden", "SI": "Slovenia",
    "SK": "Slovakia", "UA": "Ukraine", "XK": "Kosovo",
    "AE": "United Arab Emirates", "BH": "Bahrain", "IL": "Israel",
    "IQ": "Iraq", "IR": "Iran", "JO": "Jordan", "KW": "Kuwait",
    "LB": "Lebanon", "OM": "Oman", "PS": "Palestine", "QA": "Qatar",
    "SA": "Saudi Arabia", "SY": "Syria", "TR": "Turkey", "YE": "Yemen",
    "AU": "Australia", "FJ": "Fiji", "FM": "Micronesia", "KI": "Kiribati",
    "MH": "Marshall Islands", "NR": "Nauru", "NZ": "New Zealand",
    "PG": "Papua New Guinea", "PW": "Palau", "SB": "Solomon Islands",
    "TO": "Tonga", "TV": "Tuvalu", "VU": "Vanuatu", "WS": "Samoa",
}

# ================================================================
# Region assignment
# ================================================================
REGION_MAP = {}

_EAST_ASIA = ["KR", "JP", "CN", "TW", "HK", "MN"]
_CENTRAL_ASIA = ["KZ", "KG", "UZ", "TJ", "TM"]
_SOUTHEAST_ASIA = ["TH", "VN", "ID", "PH", "MY", "SG", "KH", "LA", "MM", "BN", "TL"]
_SOUTH_ASIA = ["IN", "PK", "BD", "LK", "NP", "BT", "MV", "AF"]
_WESTERN_EUROPE = ["GB", "FR", "DE", "NL", "BE", "CH", "AT", "IE", "LU", "PT"]
_NORDIC = ["SE", "DK", "NO", "FI", "IS"]
_SOUTHERN_EUROPE = ["ES", "IT", "GR", "CY", "MT", "SI"]
_EASTERN_EUROPE = ["PL", "CZ", "HU", "RO", "BG", "SK", "HR", "RS", "BA", "AL", "MK", "ME", "XK", "MD", "UA", "BY"]
_BALTIC = ["EE", "LV", "LT"]
_RUSSIA_CAUCASUS = ["RU", "GE", "AM", "AZ"]
_MIDDLE_EAST = ["AE", "SA", "TR", "IL", "IQ", "IR", "JO", "KW", "LB", "OM", "PS", "QA", "BH", "SY", "YE"]
_NORTH_AFRICA = ["EG", "DZ", "MA", "TN", "LY"]
_WEST_AFRICA = ["NG", "GH", "SN", "CI", "CM", "ML", "BF", "GN", "GM", "GW", "SL", "LR", "CV", "MR", "NE", "BJ", "TG", "TD"]
_EAST_AFRICA = ["KE", "ET", "TZ", "UG", "RW", "BI", "SO", "DJ", "ER", "SS", "SD", "KM", "SC", "MU", "MG", "MW", "MZ"]
_CENTRAL_SOUTH_AFRICA = ["CD", "CG", "CF", "GA", "GQ", "ST", "AO", "ZM", "ZW", "BW", "NA", "SZ", "LS", "ZA"]
_NORTH_AMERICA = ["US", "CA", "MX"]
_CENTRAL_AMERICA = ["GT", "HN", "SV", "NI", "CR", "PA", "BZ"]
_CARIBBEAN = ["CU", "JM", "HT", "DO", "TT", "BB", "BS", "AG", "DM", "GD", "PR"]
_SOUTH_AMERICA = ["BR", "AR", "CO", "PE", "CL", "EC", "BO", "PY", "UY", "VE", "GY", "SR"]
_OCEANIA = ["AU", "NZ", "FJ", "PG", "SB", "VU", "TO", "WS", "KI", "MH", "FM", "TV", "NR", "PW"]

for region_name, codes in [
    ("east_asia", _EAST_ASIA), ("central_asia", _CENTRAL_ASIA),
    ("southeast_asia", _SOUTHEAST_ASIA), ("south_asia", _SOUTH_ASIA),
    ("western_europe", _WESTERN_EUROPE), ("nordic", _NORDIC),
    ("southern_europe", _SOUTHERN_EUROPE), ("eastern_europe", _EASTERN_EUROPE),
    ("baltic", _BALTIC), ("russia_caucasus", _RUSSIA_CAUCASUS),
    ("middle_east", _MIDDLE_EAST), ("north_africa", _NORTH_AFRICA),
    ("west_africa", _WEST_AFRICA), ("east_africa", _EAST_AFRICA),
    ("central_south_africa", _CENTRAL_SOUTH_AFRICA),
    ("north_america", _NORTH_AMERICA), ("central_america", _CENTRAL_AMERICA),
    ("caribbean", _CARIBBEAN), ("south_america", _SOUTH_AMERICA),
    ("oceania", _OCEANIA),
]:
    for c in codes:
        REGION_MAP[c] = region_name

# ================================================================
# Tier classification (Tier1 = higher scores)
# ================================================================
TIER1_COUNTRIES = {
    "KR", "JP", "CN", "US", "IN", "TH", "VN", "ID", "PH", "MY",
    "SG", "TW", "HK", "GB", "FR", "DE", "ES", "IT", "NL", "SE",
    "PL", "BR", "AR", "MX", "CO", "CA", "AU", "AE", "SA", "TR",
    "NG", "ZA", "EG", "KE", "RU", "NZ",
}

# ================================================================
# Currency by country
# ================================================================
CURRENCY = {
    "KR": "₩", "US": "$", "JP": "¥", "CN": "¥", "GB": "£",
    "FR": "€", "DE": "€", "ES": "€", "IT": "€", "NL": "€",
    "BE": "€", "AT": "€", "IE": "€", "LU": "€", "PT": "€",
    "FI": "€", "GR": "€", "CY": "€", "MT": "€", "SI": "€",
    "SK": "€", "EE": "€", "LV": "€", "LT": "€",
    "TH": "฿", "VN": "₫", "IN": "₹", "BR": "R$", "MX": "MX$",
    "AE": "AED", "AU": "A$", "TR": "₺", "NG": "₦", "ZA": "ZAR",
    "EG": "E£", "SA": "SAR", "RU": "₽", "PK": "Rs", "PH": "₱",
    "MY": "RM", "ID": "Rp", "SG": "S$", "TW": "NT$",
    "CA": "C$", "NZ": "NZ$", "SE": "kr", "DK": "DKK", "NO": "NOK",
    "PL": "zł", "CZ": "Kč", "HU": "Ft", "RO": "RON", "BG": "лв",
    "HR": "€", "RS": "RSD", "BA": "KM", "AL": "ALL", "MK": "MKD",
    "UA": "₴", "BY": "BYN", "GE": "₾", "AM": "AMD", "AZ": "AZN",
    "IL": "₪", "IQ": "IQD", "IR": "IRR", "JO": "JOD", "KW": "KWD",
    "LB": "L£", "OM": "OMR", "QA": "QAR", "BH": "BHD",
    "AR": "ARS", "CO": "COP", "CL": "CLP", "PE": "PEN",
    "BD": "৳", "LK": "Rs", "NP": "NPR", "KH": "KHR", "LA": "₭",
    "MM": "MMK", "MN": "₮", "KZ": "₸", "KG": "сом", "UZ": "сум",
    "TJ": "сом", "TM": "TMT", "BN": "B$",
    "KE": "KES", "ET": "ETB", "TZ": "TZS", "UG": "UGX", "RW": "RWF",
    "GH": "GHS", "SN": "XOF", "CI": "XOF", "CM": "XAF", "DZ": "DZD",
    "MA": "MAD", "TN": "TND",
    "JM": "J$", "DO": "DOP", "TT": "TTD", "CU": "CUP",
    "GT": "GTQ", "HN": "HNL", "CR": "CRC", "PA": "PAB",
    "EC": "USD", "BO": "BOB", "PY": "PYG", "UY": "UYU", "VE": "VES",
    "FJ": "FJD", "PG": "PGK",
}

# ================================================================
# Regional price examples
# ================================================================
def get_price(cc, cat):
    """Return a representative price string for the country/category."""
    cur = CURRENCY.get(cc, "$")
    region = REGION_MAP.get(cc, "")

    price_map = {
        "fashion": {
            "east_asia": f"{cur}39,000" if cc == "KR" else f"{cur}299" if cc in ("CN","TW","HK") else f"{cur}4,990" if cc == "JP" else f"{cur}49",
            "central_asia": f"{cur}3,500",
            "southeast_asia": f"{cur}599" if cc == "TH" else f"{cur}199,000" if cc == "ID" else f"{cur}450,000" if cc == "VN" else f"{cur}299" if cc == "PH" else f"{cur}99" if cc == "MY" else f"{cur}49",
            "south_asia": f"{cur}1,999" if cc == "IN" else f"{cur}2,500" if cc == "PK" else f"{cur}3,500" if cc == "BD" else f"{cur}2,000",
            "western_europe": f"{cur}59",
            "nordic": f"{cur}499" if cc == "SE" else f"{cur}399",
            "southern_europe": f"{cur}49",
            "eastern_europe": f"{cur}149" if cc == "PL" else f"{cur}99",
            "baltic": f"{cur}39",
            "russia_caucasus": f"{cur}3,999" if cc == "RU" else f"{cur}89",
            "middle_east": f"AED199" if cc == "AE" else f"SAR149" if cc == "SA" else f"{cur}299" if cc == "TR" else f"{cur}49",
            "north_africa": f"{cur}499" if cc == "EG" else f"{cur}299",
            "west_africa": f"{cur}5,000" if cc == "NG" else f"{cur}9,500",
            "east_africa": f"{cur}2,500" if cc == "KE" else f"{cur}1,500",
            "central_south_africa": f"ZAR499" if cc == "ZA" else f"{cur}3,000",
            "north_america": f"$39" if cc == "US" else f"C$49" if cc == "CA" else f"MX$599",
            "central_america": f"{cur}199",
            "caribbean": f"{cur}35",
            "south_america": f"R$129" if cc == "BR" else f"ARS8,000" if cc == "AR" else f"{cur}99",
            "oceania": f"A$59" if cc == "AU" else f"NZ$49" if cc == "NZ" else f"{cur}49",
        },
        "products": {
            "east_asia": f"{cur}29,000" if cc == "KR" else f"{cur}199" if cc in ("CN","TW","HK") else f"{cur}2,980" if cc == "JP" else f"{cur}35",
            "central_asia": f"{cur}2,500",
            "southeast_asia": f"{cur}399" if cc == "TH" else f"{cur}149,000" if cc == "ID" else f"{cur}350,000" if cc == "VN" else f"{cur}499" if cc == "PH" else f"{cur}79" if cc == "MY" else f"{cur}29",
            "south_asia": f"{cur}999" if cc == "IN" else f"{cur}1,500" if cc == "PK" else f"{cur}2,000" if cc == "BD" else f"{cur}1,200",
            "western_europe": f"{cur}39",
            "nordic": f"{cur}349" if cc == "SE" else f"{cur}299",
            "southern_europe": f"{cur}29",
            "eastern_europe": f"{cur}99" if cc == "PL" else f"{cur}69",
            "baltic": f"{cur}25",
            "russia_caucasus": f"{cur}2,499" if cc == "RU" else f"{cur}59",
            "middle_east": f"AED149" if cc == "AE" else f"SAR99" if cc == "SA" else f"{cur}199" if cc == "TR" else f"{cur}35",
            "north_africa": f"{cur}349" if cc == "EG" else f"{cur}199",
            "west_africa": f"{cur}3,500" if cc == "NG" else f"{cur}7,500",
            "east_africa": f"{cur}1,500" if cc == "KE" else f"{cur}1,000",
            "central_south_africa": f"ZAR349" if cc == "ZA" else f"{cur}2,000",
            "north_america": f"$24" if cc == "US" else f"C$29" if cc == "CA" else f"MX$399",
            "central_america": f"{cur}149",
            "caribbean": f"{cur}25",
            "south_america": f"R$89" if cc == "BR" else f"ARS5,000" if cc == "AR" else f"{cur}69",
            "oceania": f"A$39" if cc == "AU" else f"NZ$35" if cc == "NZ" else f"{cur}29",
        },
        "food": {
            "east_asia": f"{cur}8,500" if cc == "KR" else f"{cur}35" if cc in ("CN","TW","HK") else f"{cur}780" if cc == "JP" else f"{cur}12",
            "central_asia": f"{cur}1,200",
            "southeast_asia": f"{cur}120" if cc == "TH" else f"{cur}35,000" if cc == "ID" else f"{cur}55,000" if cc == "VN" else f"{cur}150" if cc == "PH" else f"{cur}15" if cc == "MY" else f"{cur}8",
            "south_asia": f"{cur}250" if cc == "IN" else f"{cur}500" if cc == "PK" else f"{cur}350" if cc == "BD" else f"{cur}300",
            "western_europe": f"{cur}8",
            "nordic": f"{cur}89" if cc == "SE" else f"{cur}79",
            "southern_europe": f"{cur}7",
            "eastern_europe": f"{cur}25" if cc == "PL" else f"{cur}15",
            "baltic": f"{cur}6",
            "russia_caucasus": f"{cur}450" if cc == "RU" else f"{cur}15",
            "middle_east": f"AED35" if cc == "AE" else f"SAR25" if cc == "SA" else f"{cur}65" if cc == "TR" else f"{cur}8",
            "north_africa": f"{cur}80" if cc == "EG" else f"{cur}50",
            "west_africa": f"{cur}1,500" if cc == "NG" else f"{cur}2,500",
            "east_africa": f"{cur}500" if cc == "KE" else f"{cur}300",
            "central_south_africa": f"ZAR89" if cc == "ZA" else f"{cur}500",
            "north_america": f"$8" if cc == "US" else f"C$10" if cc == "CA" else f"MX$99",
            "central_america": f"{cur}45",
            "caribbean": f"{cur}12",
            "south_america": f"R$25" if cc == "BR" else f"ARS2,500" if cc == "AR" else f"{cur}25",
            "oceania": f"A$12" if cc == "AU" else f"NZ$10" if cc == "NZ" else f"{cur}8",
        },
    }

    if cat == "brands":
        return ""  # brands don't need price

    region = REGION_MAP.get(cc, "")
    cat_prices = price_map.get(cat, {})
    return cat_prices.get(region, f"{cur}25")


# ================================================================
# Marketplace by region
# ================================================================
def get_marketplace(cc, cat):
    """Return a representative marketplace for the country."""
    region = REGION_MAP.get(cc, "")

    marketplaces = {
        "east_asia": {
            "KR": "쿠팡/올리브영", "JP": "Amazon Japan", "CN": "Taobao/JD.com",
            "TW": "Shopee TW/PChome", "HK": "HKTVmall", "MN": "Shoppy MN",
        },
        "central_asia": "Wildberries/로컬 마켓",
        "southeast_asia": {
            "TH": "Shopee TH/Lazada", "VN": "TikTok Shop VN/Shopee",
            "ID": "Tokopedia/Shopee", "PH": "Shopee PH/Lazada",
            "MY": "Shopee MY/Lazada", "SG": "Shopee SG/Lazada",
            "KH": "Shopee KH", "LA": "로컬 마켓", "MM": "Shopee MM",
            "BN": "로컬 마켓", "TL": "로컬 마켓",
        },
        "south_asia": {
            "IN": "Amazon India/Flipkart", "PK": "Daraz PK",
            "BD": "Daraz BD", "LK": "Daraz LK",
            "NP": "Daraz NP", "BT": "로컬 마켓",
            "MV": "로컬 마켓", "AF": "로컬 마켓",
        },
        "western_europe": "Amazon/로컬 마켓",
        "nordic": "Amazon/Zalando",
        "southern_europe": "Amazon/로컬 마켓",
        "eastern_europe": "Allegro/Temu/로컬 마켓",
        "baltic": "Amazon/로컬 마켓",
        "russia_caucasus": {"RU": "Wildberries/Ozon", "GE": "로컬 마켓", "AM": "로컬 마켓", "AZ": "로컬 마켓"},
        "middle_east": {
            "AE": "Noon/Amazon AE", "SA": "Noon/Amazon SA",
            "TR": "Trendyol/Hepsiburada", "IL": "Amazon/로컬",
        },
        "north_africa": "Jumia/로컬 마켓",
        "west_africa": {"NG": "Jumia NG/Konga", "GH": "Jumia GH"},
        "east_africa": {"KE": "Jumia KE", "TZ": "Jumia TZ"},
        "central_south_africa": {"ZA": "Takealot"},
        "north_america": {"US": "Amazon/Walmart", "CA": "Amazon CA", "MX": "Mercado Libre/Amazon MX"},
        "central_america": "Mercado Libre/로컬 마켓",
        "caribbean": "로컬 마켓",
        "south_america": {"BR": "Mercado Livre/Amazon BR", "AR": "Mercado Libre AR", "CO": "Mercado Libre CO"},
        "oceania": {"AU": "Amazon AU/Kmart", "NZ": "TheMarket NZ"},
    }

    region_data = marketplaces.get(region, "로컬 마켓")
    if isinstance(region_data, dict):
        return region_data.get(cc, "로컬 마켓")
    return region_data


# ================================================================
# Regional trend pools (TikTok/Instagram viral based)
# ================================================================

# Each pool item: (trend_name, description_template, tags)
# {cc} = country code, {country} = country name, {marketplace} = marketplace, {price} = price

BRANDS_POOL = {
    "global": [
        ("SHEIN", "틱톡에서 #SHEIN 가성비 패션 바이럴. 글로벌 패스트패션 트렌드. {marketplace} 판매.", ["shein", "fast-fashion", "brands", "viral"]),
        ("Temu", "틱톡에서 #Temu 초저가 쇼핑 바이럴. 글로벌 이커머스 트렌드. {marketplace} 판매.", ["temu", "ecommerce", "brands", "viral"]),
        ("Nike", "틱톡에서 #Nike 스니커즈/스포츠웨어 바이럴. 글로벌 스포츠 브랜드. {marketplace} 판매.", ["nike", "sportswear", "brands", "viral"]),
        ("Adidas", "인스타에서 #Adidas 오리지널스 스트리트웨어 바이럴. 글로벌 스포츠 브랜드. {marketplace} 판매.", ["adidas", "streetwear", "brands"]),
        ("Zara", "틱톡에서 #Zara 신상 하울 바이럴. 글로벌 SPA 브랜드. {marketplace} 판매.", ["zara", "fashion", "brands", "viral"]),
        ("H&M", "틱톡에서 #HM 가성비 패션 하울 바이럴. 글로벌 SPA 브랜드. {marketplace} 판매.", ["hm", "affordable-fashion", "brands"]),
        ("Samsung", "틱톡에서 #Samsung 갤럭시 시리즈 바이럴. 글로벌 테크 브랜드. {marketplace} 판매.", ["samsung", "galaxy", "brands", "viral"]),
        ("Apple", "인스타에서 #Apple 아이폰/에어팟 바이럴. 글로벌 프리미엄 테크. {marketplace} 판매.", ["apple", "iphone", "brands"]),
    ],
    "east_asia": [
        ("Uniqlo", "틱톡에서 #Uniqlo 에어리즘/히트텍 바이럴. 일본 글로벌 SPA 브랜드. {marketplace} 판매.", ["uniqlo", "basics", "brands", "viral"]),
        ("Daiso", "틱톡에서 #Daiso 가성비 생활용품 바이럴. 일본 100엔 숍. {marketplace} 판매.", ["daiso", "100-yen", "brands"]),
    ],
    "central_asia": [
        ("Wildberries", "틱톡에서 #Wildberries 온라인 쇼핑 바이럴. 중앙아시아 인기 이커머스. {marketplace} 판매.", ["wildberries", "ecommerce", "brands"]),
    ],
    "southeast_asia": [
        ("Shopee", "틱톡에서 #Shopee 플래시 세일 바이럴. 동남아 대표 이커머스. {marketplace} 판매.", ["shopee", "ecommerce", "brands", "viral"]),
        ("Lazada", "틱톡에서 #Lazada 메가 세일 바이럴. 동남아 이커머스 플랫폼. {marketplace} 판매.", ["lazada", "ecommerce", "brands"]),
        ("Grab", "틱톡에서 #Grab 슈퍼앱 바이럴. 동남아 라이드헤일링+배달. {marketplace} 판매.", ["grab", "superapp", "brands"]),
    ],
    "south_asia": [
        ("Daraz", "틱톡에서 #Daraz 온라인 쇼핑 바이럴. 남아시아 대표 이커머스. {marketplace} 판매.", ["daraz", "ecommerce", "brands"]),
        ("Meesho", "틱톡에서 #Meesho 소셜 커머스 바이럴. 남아시아 리셀러 플랫폼. {marketplace} 판매.", ["meesho", "social-commerce", "brands"]),
    ],
    "western_europe": [
        ("Primark", "틱톡에서 #Primark 가성비 패션 하울 바이럴. 유럽 패스트패션. {marketplace} 판매.", ["primark", "affordable", "brands", "viral"]),
        ("IKEA", "틱톡에서 #IKEA 룸투어/인테리어 바이럴. 글로벌 가구 브랜드. {marketplace} 판매.", ["ikea", "interior", "brands"]),
    ],
    "nordic": [
        ("& Other Stories", "인스타에서 #AndOtherStories 노르딕 미니멀 패션 바이럴. H&M 그룹. {marketplace} 판매.", ["and-other-stories", "minimal", "brands"]),
    ],
    "southern_europe": [
        ("Mango", "틱톡에서 #Mango 지중해 스타일 패션 바이럴. 스페인 SPA 브랜드. {marketplace} 판매.", ["mango", "mediterranean", "brands"]),
    ],
    "eastern_europe": [
        ("Temu", "틱톡에서 #Temu 초저가 쇼핑 동유럽 바이럴. 글로벌 이커머스. {marketplace} 판매.", ["temu", "shopping", "brands", "viral"]),
    ],
    "baltic": [
        ("Bolt", "틱톡에서 #Bolt 라이드헤일링+배달 바이럴. 발틱 스타트업 글로벌 확장. {marketplace} 판매.", ["bolt", "ride-hailing", "brands"]),
    ],
    "russia_caucasus": [
        ("Ozon", "틱톡에서 #Ozon 온라인 쇼핑 바이럴. 러시아 대표 이커머스. {marketplace} 판매.", ["ozon", "ecommerce", "brands"]),
    ],
    "middle_east": [
        ("Noon", "틱톡에서 #Noon 중동 이커머스 바이럴. 중동 대표 온라인 마켓. {marketplace} 판매.", ["noon", "ecommerce", "brands", "viral"]),
        ("Namshi", "인스타에서 #Namshi 중동 패션 이커머스 바이럴. 프리미엄 패션. {marketplace} 판매.", ["namshi", "fashion", "brands"]),
    ],
    "north_africa": [
        ("Jumia", "틱톡에서 #Jumia 아프리카 이커머스 바이럴. 북아프리카 대표 마켓. {marketplace} 판매.", ["jumia", "ecommerce", "brands"]),
    ],
    "west_africa": [
        ("Jumia", "틱톡에서 #Jumia 서아프리카 바이럴. 아프리카 최대 이커머스. {marketplace} 판매.", ["jumia", "ecommerce", "brands", "viral"]),
        ("Konga", "틱톡에서 #Konga 나이지리아 이커머스 바이럴. 서아프리카 마켓. {marketplace} 판매.", ["konga", "ecommerce", "brands"]),
    ],
    "east_africa": [
        ("Safaricom", "틱톡에서 #Safaricom 모바일 머니 바이럴. 동아프리카 핀테크. {marketplace} 판매.", ["safaricom", "mpesa", "brands"]),
    ],
    "central_south_africa": [
        ("Mr Price", "틱톡에서 #MrPrice 가성비 패션 바이럴. 남부 아프리카 패션. {marketplace} 판매.", ["mr-price", "affordable", "brands"]),
    ],
    "north_america": [
        ("Target", "틱톡에서 #TargetFinds 타겟 발견 쇼핑 바이럴. 미국 대형마트. {marketplace} 판매.", ["target", "finds", "brands", "viral"]),
        ("Costco", "틱톡에서 #CostcoFinds 코스트코 발견 바이럴. 미국 대형 창고형. {marketplace} 판매.", ["costco", "wholesale", "brands"]),
    ],
    "central_america": [
        ("Claro", "틱톡에서 #Claro 통신 브랜드 바이럴. 중미 대표 통신사. {marketplace} 판매.", ["claro", "telecom", "brands"]),
    ],
    "caribbean": [
        ("Digicel", "틱톡에서 #Digicel 카리브 통신 바이럴. 카리브 대표 통신사. {marketplace} 판매.", ["digicel", "telecom", "brands"]),
    ],
    "south_america": [
        ("Mercado Libre", "틱톡에서 #MercadoLibre 남미 이커머스 바이럴. 남미 최대 마켓플레이스. {marketplace} 판매.", ["mercado-libre", "ecommerce", "brands"]),
    ],
    "oceania": [
        ("Cotton On", "틱톡에서 #CottonOn 캐주얼 패션 바이럴. 오세아니아 대표 패션. {marketplace} 판매.", ["cotton-on", "casual", "brands"]),
        ("Kmart AU", "틱톡에서 #KmartAU 가성비 생활용품 바이럴. 호주 대형마트. {marketplace} 판매.", ["kmart", "affordable", "brands"]),
    ],
}

FASHION_POOL = {
    "global": [
        ("Oversized Hoodie Trend", "틱톡에서 #OversizedHoodie 오버사이즈 후디 코디 바이럴. 유니섹스 캐주얼 트렌드. {marketplace} 판매. {price}.", ["oversized", "hoodie", "casual", "fashion", "viral"]),
        ("Cargo Pants Revival", "틱톡에서 #CargoPants 카고 팬츠 리바이벌 바이럴. Y2K 워크웨어 트렌드. {marketplace} 판매. {price}.", ["cargo", "pants", "y2k", "fashion"]),
        ("Y2K Revival Outfit", "인스타에서 #Y2KFashion Y2K 리바이벌 코디 바이럴. 2000년대 레트로 트렌드. {marketplace} 판매. {price}.", ["y2k", "revival", "retro", "fashion"]),
        ("Quiet Luxury Blazer", "틱톡에서 #QuietLuxury 조용한 럭셔리 블레이저 바이럴. 올드머니 트렌드. {marketplace} 판매. {price}.", ["quiet-luxury", "blazer", "old-money", "fashion", "viral"]),
        ("Canvas Tote Bag Trend", "틱톡에서 #ToteBag 캔버스 토트백 바이럴. 에코 패션 트렌드. {marketplace} 판매. {price}.", ["tote-bag", "canvas", "eco", "fashion"]),
        ("Platform Sneakers", "인스타에서 #PlatformSneakers 플랫폼 스니커즈 바이럴. 키높이 트렌드. {marketplace} 판매. {price}.", ["platform", "sneakers", "fashion"]),
        ("Crochet Top Trend", "틱톡에서 #CrochetTop 크로셰 니트 탑 바이럴. 수공예 패션 트렌드. {marketplace} 판매. {price}.", ["crochet", "knit", "top", "fashion", "viral"]),
        ("Baggy Jeans Style", "틱톡에서 #BaggyJeans 배기진 스타일 바이럴. 스트리트 패션 트렌드. {marketplace} 판매. {price}.", ["baggy", "jeans", "street", "fashion"]),
    ],
    "east_asia": [
        ("K-Fashion Layered Look", "틱톡에서 #KFashion 레이어드 코디 바이럴. 한국 패션 영향 스타일링. {marketplace} 판매. {price}.", ["k-fashion", "layered", "fashion", "viral"]),
        ("Hanbok Modern Casual", "인스타에서 #HanbokModern 한복 캐주얼 현대화 바이럴. 전통+현대 패션. {marketplace} 판매. {price}.", ["hanbok", "modern", "casual", "fashion"]),
        ("Kimono Casual Style", "틱톡에서 #KimonoCasual 기모노 캐주얼 스타일 바이럴. 일본 전통 현대화. {marketplace} 판매. {price}.", ["kimono", "casual", "japanese", "fashion"]),
    ],
    "central_asia": [
        ("Central Asian Chapan Modern", "틱톡에서 #ChapanModern 중앙아시아 전통 외투 현대화 바이럴. {marketplace} 판매. {price}.", ["chapan", "traditional", "modern", "fashion"]),
    ],
    "southeast_asia": [
        ("Modest Streetwear SEA", "틱톡에서 #ModestStreet 모디스트 스트리트웨어 바이럴. 히잡+스트리트 트렌드. {marketplace} 판매. {price}.", ["modest", "streetwear", "fashion", "viral"]),
        ("Ao Dai Modern Casual", "인스타에서 #AoDai 아오자이 캐주얼 현대화 바이럴. 동남아 전통 현대화. {marketplace} 판매. {price}.", ["ao-dai", "modern", "traditional", "fashion"]),
    ],
    "south_asia": [
        ("Kurti Modern Streetwear", "틱톡에서 #KurtiModern 쿠르티 현대 스트리트웨어 바이럴. 남아시아 전통 현대화. {marketplace} 판매. {price}.", ["kurti", "modern", "streetwear", "fashion"]),
        ("South Asian Bridal Jewelry", "인스타에서 #BridalJewelry 남아시아 웨딩 주얼리 바이럴. 웨딩 시즌 트렌드. {marketplace} 판매. {price}.", ["bridal", "jewelry", "wedding", "fashion", "viral"]),
    ],
    "western_europe": [
        ("Layered Minimalist Look", "틱톡에서 #LayeredMinimal 레이어드 미니멀 룩 바이럴. 유럽 미니멀 트렌드. {marketplace} 판매. {price}.", ["layered", "minimal", "european", "fashion"]),
        ("Giant Sunglasses Trend", "인스타에서 #GiantSunglasses 대형 선글라스 트렌드 바이럴. 유럽 액세서리. {marketplace} 판매. {price}.", ["giant", "sunglasses", "accessories", "fashion"]),
    ],
    "nordic": [
        ("Scandi Minimalism Outfit", "틱톡에서 #ScandiMinimal 스칸디 미니멀 아웃핏 바이럴. 북유럽 심플 스타일. {marketplace} 판매. {price}.", ["scandi", "minimalism", "outfit", "fashion"]),
    ],
    "southern_europe": [
        ("Corset Top Mediterranean", "틱톡에서 #CorsetTop 코르셋 탑 지중해 스타일 바이럴. 남유럽 여름 트렌드. {marketplace} 판매. {price}.", ["corset", "top", "mediterranean", "fashion", "viral"]),
    ],
    "eastern_europe": [
        ("Vintage Denim Thrift", "틱톡에서 #VintageDenim 빈티지 데님 쓰리프트 바이럴. 동유럽 세컨핸드 트렌드. {marketplace} 판매. {price}.", ["vintage", "denim", "thrift", "fashion"]),
    ],
    "baltic": [
        ("Sustainable Linen Fashion", "틱톡에서 #LinenFashion 지속가능 리넨 패션 바이럴. 발틱 에코 트렌드. {marketplace} 판매. {price}.", ["sustainable", "linen", "eco", "fashion"]),
    ],
    "russia_caucasus": [
        ("Russian Techwear Style", "틱톡에서 #RussianTechwear 러시아 테크웨어 바이럴. 기능성+스트리트. {marketplace} 판매. {price}.", ["techwear", "functional", "street", "fashion"]),
    ],
    "middle_east": [
        ("Modern Abaya Style", "틱톡에서 #ModernAbaya 모던 아바야 스타일 바이럴. 중동 모디스트 패션. {marketplace} 판매. {price}.", ["modern", "abaya", "modest", "fashion", "viral"]),
        ("Modest Streetwear ME", "인스타에서 #ModestStreet 중동 모디스트 스트리트웨어 바이럴. {marketplace} 판매. {price}.", ["modest", "streetwear", "middle-east", "fashion"]),
    ],
    "north_africa": [
        ("Caftan Modern Revival", "틱톡에서 #Caftan 카프탄 현대 리바이벌 바이럴. 북아프리카 전통 현대화. {marketplace} 판매. {price}.", ["caftan", "revival", "traditional", "fashion"]),
    ],
    "west_africa": [
        ("Ankara Print Modern Style", "틱톡에서 #AnkaraPrint 앙카라 프린트 현대 스타일 바이럴. 서아프리카 전통 패턴. {marketplace} 판매. {price}.", ["ankara", "print", "modern", "fashion", "viral"]),
        ("Dashiki Streetwear", "인스타에서 #Dashiki 다시키 스트리트웨어 바이럴. 아프리카 전통 의상 현대화. {marketplace} 판매. {price}.", ["dashiki", "streetwear", "african", "fashion"]),
    ],
    "east_africa": [
        ("Kitenge Modern Fashion", "틱톡에서 #Kitenge 키텡게 현대 패션 바이럴. 동아프리카 전통 패턴. {marketplace} 판매. {price}.", ["kitenge", "modern", "african", "fashion"]),
    ],
    "central_south_africa": [
        ("Shweshwe Modern Dress", "틱톡에서 #Shweshwe 슈에슈에 현대 드레스 바이럴. 남부 아프리카 전통 패턴. {marketplace} 판매. {price}.", ["shweshwe", "modern", "dress", "fashion"]),
    ],
    "north_america": [
        ("Athleisure Matching Set", "틱톡에서 #Athleisure 애슬레저 매칭 세트 바이럴. 운동+일상 겸용. {marketplace} 판매. {price}.", ["athleisure", "matching-set", "fashion", "viral"]),
        ("Vintage Denim Revival", "인스타에서 #VintageDenim 빈티지 데님 리바이벌 바이럴. 쓰리프트 트렌드. {marketplace} 판매. {price}.", ["vintage", "denim", "thrift", "fashion"]),
        ("Cowboy Boots Trend", "틱톡에서 #CowboyBoots 카우보이 부츠 트렌드 바이럴. 웨스턴 스타일. {marketplace} 판매. {price}.", ["cowboy", "boots", "western", "fashion"]),
    ],
    "central_america": [
        ("Huipil Modern Fashion", "틱톡에서 #Huipil 우이필 현대 패션 바이럴. 중미 전통 의상 현대화. {marketplace} 판매. {price}.", ["huipil", "modern", "traditional", "fashion"]),
    ],
    "caribbean": [
        ("Caribbean Resort Wear", "틱톡에서 #ResortWear 카리브 리조트 웨어 바이럴. 열대 패션 트렌드. {marketplace} 판매. {price}.", ["resort", "wear", "tropical", "fashion"]),
    ],
    "south_america": [
        ("Gaucho Modern Style", "틱톡에서 #GauchoModern 가우초 모던 스타일 바이럴. 남미 전통 목동 패션. {marketplace} 판매. {price}.", ["gaucho", "modern", "south-american", "fashion"]),
    ],
    "oceania": [
        ("Surf Wear Trend", "틱톡에서 #SurfWear 서프 웨어 트렌드 바이럴. 오세아니아 서핑 문화. {marketplace} 판매. {price}.", ["surf", "wear", "beach", "fashion"]),
        ("Bush Hat Modern", "인스타에서 #BushHat 부시 햇 모던 스타일 바이럴. 아웃도어 패션. {marketplace} 판매. {price}.", ["bush-hat", "outdoor", "fashion"]),
    ],
}

FOOD_POOL = {
    "global": [
        ("Pistachio Dessert Trend", "틱톡에서 #Pistachio 피스타치오 디저트 트렌드 바이럴. 올해의 슈퍼푸드. {marketplace} 판매. {price}.", ["pistachio", "dessert", "superfood", "food", "viral"]),
        ("Mushroom Coffee Trend", "틱톡에서 #MushroomCoffee 머쉬룸 커피 건강 트렌드 바이럴. 카페인 저감. {marketplace} 판매. {price}.", ["mushroom", "coffee", "health", "food"]),
        ("Cottage Cheese Reinvented", "틱톡에서 #CottageCheese 코티지 치즈 혁신 레시피 바이럴. 고단백 트렌드. {marketplace} 판매. {price}.", ["cottage-cheese", "protein", "food", "viral"]),
        ("Air Fryer Recipes Viral", "틱톡에서 #AirFryer 에어프라이어 레시피 바이럴. 간편 조리 트렌드. {marketplace} 판매. {price}.", ["air-fryer", "recipe", "food"]),
        ("Dubai Chocolate Viral", "틱톡에서 #DubaiChocolate 두바이 초콜릿 글로벌 바이럴. 피스타치오+카다이프 초콜릿. {marketplace} 판매. {price}.", ["dubai", "chocolate", "pistachio", "food", "viral"]),
    ],
    "east_asia": [
        ("Bubble Tea Innovation", "틱톡에서 #BubbleTea 버블티 혁신 메뉴 바이럴. 아시아 밀크티 트렌드. {marketplace} 판매. {price}.", ["bubble-tea", "innovation", "food", "viral"]),
        ("Mochi Ice Cream Trend", "틱톡에서 #MochiIceCream 모찌 아이스크림 바이럴. 일본 디저트 글로벌화. {marketplace} 판매. {price}.", ["mochi", "ice-cream", "japanese", "food"]),
        ("Spicy Ramen Challenge", "틱톡에서 #SpicyRamen 매운 라면 챌린지 바이럴. 아시아 누들 트렌드. {marketplace} 판매. {price}.", ["spicy", "ramen", "challenge", "food"]),
    ],
    "central_asia": [
        ("Plov Gourmet Innovation", "틱톡에서 #Plov 필라프 고급화 혁신 바이럴. 중앙아시아 전통 쌀 요리. {marketplace} 판매. {price}.", ["plov", "pilaf", "gourmet", "food"]),
        ("Kumis Wellness Drink", "인스타에서 #Kumis 마유주 웰니스 음료 바이럴. 중앙아시아 전통 발효유. {marketplace} 판매. {price}.", ["kumis", "fermented", "wellness", "food"]),
    ],
    "southeast_asia": [
        ("Street Food Night Market", "틱톡에서 #NightMarket 나이트 마켓 길거리 음식 바이럴. 동남아 야시장 트렌드. {marketplace} 판매. {price}.", ["night-market", "street-food", "food", "viral"]),
        ("Iced Thai Tea Premium", "틱톡에서 #ThaiTea 아이스 타이 티 프리미엄 바이럴. 동남아 음료 트렌드. {marketplace} 판매. {price}.", ["thai-tea", "iced", "premium", "food"]),
    ],
    "south_asia": [
        ("Masala Chai Innovation", "틱톡에서 #MasalaChai 마살라 차이 혁신 바이럴. 남아시아 전통 차 현대화. {marketplace} 판매. {price}.", ["masala", "chai", "innovation", "food", "viral"]),
        ("Biryani Premium Bowl", "인스타에서 #Biryani 비리야니 프리미엄 보울 바이럴. 남아시아 대표 요리. {marketplace} 판매. {price}.", ["biryani", "premium", "bowl", "food"]),
    ],
    "western_europe": [
        ("Sourdough Revival Bread", "틱톡에서 #Sourdough 사워도우 리바이벌 빵 바이럴. 수제 빵 트렌드. {marketplace} 판매. {price}.", ["sourdough", "revival", "bread", "food", "viral"]),
        ("Aperol Spritz Variation", "인스타에서 #AperolSpritz 아페롤 스프리츠 변형 바이럴. 유럽 칵테일 트렌드. {marketplace} 판매. {price}.", ["aperol", "spritz", "cocktail", "food"]),
        ("Croissant Pistachio Viral", "틱톡에서 #PistachioCroissant 피스타치오 크루아상 바이럴. 유럽 베이커리 트렌드. {marketplace} 판매. {price}.", ["croissant", "pistachio", "bakery", "food", "viral"]),
    ],
    "nordic": [
        ("Nordic Foraging Cuisine", "틱톡에서 #NordicForaging 노르딕 포레이징 요리 바이럴. 야생 식재료 트렌드. {marketplace} 판매. {price}.", ["foraging", "wild", "nordic", "food"]),
        ("Smørrebrød Innovation", "인스타에서 #Smørrebrød 스뫼레브뢰드 혁신 바이럴. 북유럽 오픈 샌드위치. {marketplace} 판매. {price}.", ["smørrebrød", "open-sandwich", "food"]),
    ],
    "southern_europe": [
        ("Mediterranean Mezze Board", "틱톡에서 #MezzeBoard 지중해 메제 보드 바이럴. 지중해식 전채 트렌드. {marketplace} 판매. {price}.", ["mezze", "board", "mediterranean", "food", "viral"]),
        ("Gelato Artisan Flavor", "인스타에서 #Gelato 아르티잔 젤라토 바이럴. 남유럽 디저트 트렌드. {marketplace} 판매. {price}.", ["gelato", "artisan", "dessert", "food"]),
    ],
    "eastern_europe": [
        ("Pierogi Gourmet Fusion", "틱톡에서 #Pierogi 피에로기 고급 퓨전 바이럴. 동유럽 전통 만두 현대화. {marketplace} 판매. {price}.", ["pierogi", "gourmet", "fusion", "food"]),
    ],
    "baltic": [
        ("Rye Bread Artisan", "틱톡에서 #RyeBread 호밀빵 장인 바이럴. 발틱 전통 빵 현대화. {marketplace} 판매. {price}.", ["rye-bread", "artisan", "baltic", "food"]),
    ],
    "russia_caucasus": [
        ("Pelmeni Gourmet Innovation", "틱톡에서 #Pelmeni 펠메니 고급 혁신 바이럴. 러시아 전통 만두 현대화. {marketplace} 판매. {price}.", ["pelmeni", "gourmet", "russian", "food"]),
    ],
    "middle_east": [
        ("Kunafa Modern Fusion", "틱톡에서 #Kunafa 쿠나파 현대 퓨전 바이럴. 중동 전통 디저트 트렌드. {marketplace} 판매. {price}.", ["kunafa", "fusion", "dessert", "food", "viral"]),
        ("Arabic Coffee Specialty", "인스타에서 #ArabicCoffee 아라빅 커피 스페셜티 바이럴. 중동 전통 커피. {marketplace} 판매. {price}.", ["arabic", "coffee", "specialty", "food"]),
        ("Shawarma Gourmet Premium", "틱톡에서 #Shawarma 샤와르마 고급화 바이럴. 중동 길거리 음식 프리미엄. {marketplace} 판매. {price}.", ["shawarma", "gourmet", "premium", "food"]),
    ],
    "north_africa": [
        ("Mint Tea Ceremony Modern", "틱톡에서 #MintTea 민트티 세레모니 현대화 바이럴. 북아프리카 차 문화. {marketplace} 판매. {price}.", ["mint-tea", "ceremony", "food"]),
        ("Tagine Gourmet Modern", "인스타에서 #Tagine 타진 고급 현대화 바이럴. 북아프리카 전통 요리. {marketplace} 판매. {price}.", ["tagine", "gourmet", "moroccan", "food"]),
    ],
    "west_africa": [
        ("Jollof Rice Challenge", "틱톡에서 #JollofRice 졸로프 라이스 챌린지 바이럴. 서아프리카 대표 요리. {marketplace} 판매. {price}.", ["jollof", "rice", "challenge", "food", "viral"]),
        ("Suya Gourmet Skewer", "인스타에서 #Suya 수야 고급 꼬치 바이럴. 서아프리카 길거리 음식. {marketplace} 판매. {price}.", ["suya", "gourmet", "skewer", "food"]),
    ],
    "east_africa": [
        ("Injera Modern Fusion", "틱톡에서 #Injera 인제라 현대 퓨전 바이럴. 동아프리카 전통 빵. {marketplace} 판매. {price}.", ["injera", "modern", "fusion", "food"]),
        ("East African Coffee Specialty", "인스타에서 #EthiopianCoffee 동아프리카 커피 스페셜티 바이럴. {marketplace} 판매. {price}.", ["coffee", "specialty", "african", "food"]),
    ],
    "central_south_africa": [
        ("Braai BBQ Innovation", "틱톡에서 #Braai 브라이 바비큐 혁신 바이럴. 남부 아프리카 BBQ 문화. {marketplace} 판매. {price}.", ["braai", "bbq", "innovation", "food"]),
    ],
    "north_america": [
        ("Birria Everything Trend", "틱톡에서 #BirriaEverything 비리아 만능 트렌드 바이럴. 멕시코 영향 퓨전. {marketplace} 판매. {price}.", ["birria", "everything", "fusion", "food", "viral"]),
        ("Acai Bowl Premium", "인스타에서 #AcaiBowl 아사이 보울 프리미엄 바이럴. 건강 브런치 트렌드. {marketplace} 판매. {price}.", ["acai", "bowl", "healthy", "food"]),
        ("Loaded Toast Viral", "틱톡에서 #LoadedToast 로디드 토스트 바이럴. 토핑 가득 브런치. {marketplace} 판매. {price}.", ["loaded", "toast", "brunch", "food"]),
    ],
    "central_america": [
        ("Pupusa Gourmet Fusion", "틱톡에서 #Pupusa 푸푸사 고급 퓨전 바이럴. 중미 전통 옥수수 요리. {marketplace} 판매. {price}.", ["pupusa", "gourmet", "fusion", "food"]),
    ],
    "caribbean": [
        ("Tropical Fruit Smoothie Bowl", "틱톡에서 #TropicalBowl 열대 과일 스무디 보울 바이럴. 카리브 건강 음료. {marketplace} 판매. {price}.", ["tropical", "smoothie", "bowl", "food"]),
    ],
    "south_america": [
        ("Ceviche Modern Fusion", "틱톡에서 #Ceviche 세비체 현대 퓨전 바이럴. 남미 해산물 트렌드. {marketplace} 판매. {price}.", ["ceviche", "modern", "fusion", "food", "viral"]),
        ("Empanada Gourmet Trend", "인스타에서 #Empanada 엠파나다 고급화 바이럴. 남미 전통 파이. {marketplace} 판매. {price}.", ["empanada", "gourmet", "food"]),
    ],
    "oceania": [
        ("Flat White Innovation", "틱톡에서 #FlatWhite 플랫 화이트 혁신 바이럴. 오세아니아 커피 문화. {marketplace} 판매. {price}.", ["flat-white", "coffee", "innovation", "food"]),
        ("Meat Pie Gourmet", "인스타에서 #MeatPie 미트 파이 고급화 바이럴. 오세아니아 전통 파이. {marketplace} 판매. {price}.", ["meat-pie", "gourmet", "food"]),
        ("Pavlova Modern Dessert", "틱톡에서 #Pavlova 파블로바 현대 디저트 바이럴. 오세아니아 전통 디저트. {marketplace} 판매. {price}.", ["pavlova", "modern", "dessert", "food"]),
    ],
}

PRODUCTS_POOL = {
    "global": [
        ("LED Face Mask Device", "틱톡에서 #LEDMask LED 페이스 마스크 바이럴. 뷰티 테크 트렌드. {marketplace} 판매. {price}.", ["led", "mask", "beauty-tech", "products", "viral"]),
        ("Portable Blender Trend", "틱톡에서 #PortableBlender 포터블 블렌더 바이럴. 건강 스무디 필수템. {marketplace} 판매. {price}.", ["portable", "blender", "health", "products"]),
        ("Heatless Curler Set", "틱톡에서 #HeatlessCurls 무열 컬러 세트 바이럴. 헤어 케어 트렌드. {marketplace} 판매. {price}.", ["heatless", "curler", "hair", "products", "viral"]),
        ("Galaxy Projector Light", "틱톡에서 #GalaxyProjector 갤럭시 프로젝터 무드등 바이럴. 방 인테리어. {marketplace} 판매. {price}.", ["galaxy", "projector", "mood-light", "products"]),
        ("Mini Karaoke Mic", "틱톡에서 #MiniKaraoke 미니 가라오케 마이크 바이럴. 파티 필수템. {marketplace} 판매. {price}.", ["mini", "karaoke", "mic", "products", "viral"]),
        ("Sunset Lamp Projector", "틱톡에서 #SunsetLamp 선셋 램프 프로젝터 바이럴. 인테리어 무드등. {marketplace} 판매. {price}.", ["sunset", "lamp", "projector", "products"]),
        ("Cloud Humidifier", "틱톡에서 #CloudHumidifier 구름 가습기 바이럴. 인테리어+건강 가전. {marketplace} 판매. {price}.", ["cloud", "humidifier", "interior", "products"]),
    ],
    "east_asia": [
        ("K-Beauty Serum Set", "틱톡에서 #KBeauty 세럼 세트 바이럴. K-뷰티 글래스 스킨 필수. {marketplace} 판매. {price}.", ["k-beauty", "serum", "glass-skin", "products", "viral"]),
        ("Smart Rice Cooker Mini", "틱톡에서 #SmartRiceCooker 미니 스마트 밥솥 바이럴. 1인가구 필수 가전. {marketplace} 판매. {price}.", ["smart", "rice-cooker", "mini", "products"]),
        ("Cute Character Phone Case", "틱톡에서 #CutePhoneCase 캐릭터 폰케이스 바이럴. 아시아 캐릭터 트렌드. {marketplace} 판매. {price}.", ["cute", "character", "phone-case", "products"]),
    ],
    "central_asia": [
        ("Portable Power Bank", "틱톡에서 #PowerBank 대용량 보조배터리 바이럴. 필수 가젯. {marketplace} 판매. {price}.", ["portable", "power-bank", "gadget", "products"]),
    ],
    "southeast_asia": [
        ("K-Beauty Cushion Foundation", "틱톡에서 #CushionFoundation 쿠션 파운데이션 바이럴. K-뷰티 영향. {marketplace} 판매. {price}.", ["k-beauty", "cushion", "foundation", "products", "viral"]),
    ],
    "south_asia": [
        ("Ayurvedic Hair Oil Set", "틱톡에서 #AyurvedicHairOil 아유르베다 헤어 오일 세트 바이럴. 전통 헤어케어. {marketplace} 판매. {price}.", ["ayurvedic", "hair-oil", "natural", "products"]),
    ],
    "western_europe": [
        ("Cordless Vacuum Compact", "틱톡에서 #CordlessVacuum 무선 청소기 콤팩트 바이럴. 스마트홈 트렌드. {marketplace} 판매. {price}.", ["cordless", "vacuum", "smart-home", "products", "viral"]),
        ("Eco Cleaning Kit", "인스타에서 #EcoCleaning 에코 클리닝 키트 바이럴. 지속가능 생활 트렌드. {marketplace} 판매. {price}.", ["eco", "cleaning", "sustainable", "products"]),
    ],
    "nordic": [
        ("Smart Home Hub Nordic", "틱톡에서 #SmartHome 스마트 홈 허브 바이럴. 북유럽 스마트홈 트렌드. {marketplace} 판매. {price}.", ["smart-home", "hub", "nordic", "products"]),
    ],
    "southern_europe": [
        ("Olive Oil Skincare Set", "틱톡에서 #OliveOilSkincare 올리브 오일 스킨케어 바이럴. 지중해 천연 뷰티. {marketplace} 판매. {price}.", ["olive-oil", "skincare", "natural", "products"]),
    ],
    "eastern_europe": [
        ("Ring Light Creator Kit", "틱톡에서 #RingLight 링 라이트 크리에이터 키트 바이럴. 콘텐츠 제작 필수. {marketplace} 판매. {price}.", ["ring-light", "creator", "content", "products"]),
    ],
    "baltic": [
        ("Amber Skincare Set", "틱톡에서 #AmberSkincare 호박 스킨케어 세트 바이럴. 발틱 천연 뷰티. {marketplace} 판매. {price}.", ["amber", "skincare", "baltic", "products"]),
    ],
    "russia_caucasus": [
        ("Matryoshka Design Gadget", "틱톡에서 #Matryoshka 마트료시카 디자인 가젯 바이럴. 러시아 전통 디자인 현대화. {marketplace} 판매. {price}.", ["matryoshka", "design", "gadget", "products"]),
    ],
    "middle_east": [
        ("Luxury Perfume Discovery Set", "틱톡에서 #LuxuryPerfume 럭셔리 향수 디스커버리 세트 바이럴. 중동 향수 문화. {marketplace} 판매. {price}.", ["luxury", "perfume", "discovery", "products", "viral"]),
        ("Gold Jewelry Cleaner Kit", "인스타에서 #GoldCleaner 골드 주얼리 클리너 키트 바이럴. 중동 주얼리 관리. {marketplace} 판매. {price}.", ["gold", "jewelry", "cleaner", "products"]),
    ],
    "north_africa": [
        ("Argan Oil Beauty Set", "틱톡에서 #ArganOil 아르간 오일 뷰티 세트 바이럴. 모로코 천연 뷰티. {marketplace} 판매. {price}.", ["argan-oil", "beauty", "moroccan", "products", "viral"]),
    ],
    "west_africa": [
        ("Solar Charger Portable", "틱톡에서 #SolarCharger 포터블 솔라 충전기 바이럴. 아프리카 에너지 솔루션. {marketplace} 판매. {price}.", ["solar", "charger", "portable", "products"]),
        ("Water Filter Portable", "틱톡에서 #WaterFilter 포터블 정수기 바이럴. 깨끗한 물 솔루션. {marketplace} 판매. {price}.", ["water-filter", "portable", "products"]),
    ],
    "east_africa": [
        ("Solar Lamp Portable", "틱톡에서 #SolarLamp 포터블 솔라 램프 바이럴. 동아프리카 에너지 솔루션. {marketplace} 판매. {price}.", ["solar", "lamp", "portable", "products"]),
    ],
    "central_south_africa": [
        ("Power Bank Solar", "틱톡에서 #SolarPowerBank 솔라 보조배터리 바이럴. 정전 대비 필수템. {marketplace} 판매. {price}.", ["solar", "power-bank", "products"]),
    ],
    "north_america": [
        ("Ring Light Pro Kit", "틱톡에서 #RingLight 링 라이트 프로 키트 바이럴. 콘텐츠 크리에이터 필수. {marketplace} 판매. {price}.", ["ring-light", "pro", "creator", "products", "viral"]),
        ("Portable Charger MagSafe", "인스타에서 #MagSafe 맥세이프 포터블 충전기 바이럴. 아이폰 필수 액세서리. {marketplace} 판매. {price}.", ["portable", "charger", "magsafe", "products"]),
        ("Pet Camera WiFi", "틱톡에서 #PetCamera 반려동물 WiFi 카메라 바이럴. 펫 테크 트렌드. {marketplace} 판매. {price}.", ["pet", "camera", "wifi", "products"]),
    ],
    "central_america": [
        ("Bluetooth Speaker Portable", "틱톡에서 #BluetoothSpeaker 포터블 블루투스 스피커 바이럴. 파티 필수 가젯. {marketplace} 판매. {price}.", ["bluetooth", "speaker", "portable", "products"]),
    ],
    "caribbean": [
        ("Waterproof Phone Pouch", "틱톡에서 #WaterproofPouch 방수 폰 파우치 바이럴. 비치 필수템. {marketplace} 판매. {price}.", ["waterproof", "phone", "pouch", "products"]),
    ],
    "south_america": [
        ("Hammock Portable Travel", "틱톡에서 #Hammock 포터블 여행용 해먹 바이럴. 아웃도어 라이프. {marketplace} 판매. {price}.", ["hammock", "portable", "travel", "products"]),
    ],
    "oceania": [
        ("Reef Safe Sunscreen Kit", "틱톡에서 #ReefSafe 산호초 안전 선크림 키트 바이럴. 오세아니아 환경 트렌드. {marketplace} 판매. {price}.", ["reef-safe", "sunscreen", "eco", "products", "viral"]),
        ("Camping Gadget Multi-Tool", "인스타에서 #CampingGadget 캠핑 가젯 멀티툴 바이럴. 아웃도어 필수템. {marketplace} 판매. {price}.", ["camping", "gadget", "multi-tool", "products"]),
    ],
}


# ================================================================
# Helper functions
# ================================================================

def calc_heat(social, search, ecommerce, news):
    return round(social * 0.4 + search * 0.3 + ecommerce * 0.2 + news * 0.1)


def esc(s):
    if s is None:
        return "NULL"
    return "'" + s.replace("'", "''") + "'"


def tags_sql(tags):
    if not tags:
        return "ARRAY[]::text[]"
    return "ARRAY[" + ",".join("'" + t.replace("'", "''") + "'" for t in tags) + "]"


def get_scores(cc, cat):
    """Generate score values based on tier and category."""
    is_tier1 = cc in TIER1_COUNTRIES

    if is_tier1:
        social = random.randint(70, 90)
    else:
        social = random.randint(55, 75)

    # Category multiplier for search_score
    cat_multiplier = {"brands": 1.2, "products": 1.1, "fashion": 0.9, "food": 0.8}.get(cat, 1.0)
    noise = random.randint(-5, 5)
    search = max(0, min(100, round(social * cat_multiplier + noise)))

    ecommerce = random.randint(40, 70)
    news = random.randint(30, 60)

    heat = calc_heat(social, search, ecommerce, news)

    return social, search, ecommerce, news, heat


def make_unique_name(base_name, cc, existing_names):
    """Make a trend name unique by appending country code if needed."""
    name = base_name
    if name in existing_names:
        name = f"{base_name} {cc}"
    if name in existing_names:
        name = f"{base_name} {COUNTRY_NAMES.get(cc, cc)}"
    if name in existing_names:
        # Add a hash suffix
        suffix = hashlib.md5(f"{cc}{base_name}".encode()).hexdigest()[:4]
        name = f"{base_name} {cc}-{suffix}"
    return name


# ================================================================
# Parse existing v5 SQL
# ================================================================

def parse_existing_trends(sql_path):
    """Parse v5 SQL to get country-category counts and existing trend names."""
    counts = {}  # (country_id, category_id) -> count
    names = set()  # set of trend names (lowered) for dedup

    # Build reverse maps
    id_to_country = {v: k for k, v in COUNTRY_IDS.items()}
    id_to_category = {v: k for k, v in CATEGORY_IDS.items()}

    with open(sql_path, "r", encoding="utf-8") as f:
        for line in f:
            if not line.strip().startswith("INSERT INTO trends"):
                continue

            # Extract country_id and category_id from VALUES clause
            # Pattern: VALUES ('country_uuid', 'category_uuid', 'name', ...
            m = re.search(r"VALUES\s*\(\s*'([^']+)'\s*,\s*'([^']+)'\s*,\s*'([^']*(?:''[^']*)*)'", line)
            if not m:
                continue

            country_id = m.group(1)
            category_id = m.group(2)
            trend_name = m.group(3).replace("''", "'")

            cc = id_to_country.get(country_id, "??")
            cat = id_to_category.get(category_id, "??")

            key = (cc, cat)
            counts[key] = counts.get(key, 0) + 1
            names.add(trend_name.lower().strip())

    return counts, names


# ================================================================
# Main generation
# ================================================================

def main():
    v5_path = OUTPUT_DIR / "trends_v5.sql"
    if not v5_path.exists():
        print(f"ERROR: {v5_path} not found!")
        return

    print("Parsing existing v5 SQL...")
    existing_counts, existing_names = parse_existing_trends(v5_path)

    print(f"Found {sum(existing_counts.values())} existing trends")
    print(f"Found {len(existing_names)} unique trend names")

    # Calculate what's needed
    all_countries = sorted(COUNTRY_IDS.keys())
    supplement_needed = {}  # (cc, cat) -> count needed
    total_needed = 0

    for cc in all_countries:
        for cat in CATEGORIES:
            current = existing_counts.get((cc, cat), 0)
            if current < TARGET_MIN:
                needed = TARGET_MIN - current
                supplement_needed[(cc, cat)] = needed
                total_needed += needed

    print(f"\nCountry-category pairs below {TARGET_MIN}: {len(supplement_needed)}")
    print(f"Total supplement trends needed: {total_needed}")

    # Category breakdown
    cat_needed = {}
    for (cc, cat), n in supplement_needed.items():
        cat_needed[cat] = cat_needed.get(cat, 0) + n
    print(f"Needed by category: {cat_needed}")

    # Generate supplement trends
    supplement = []  # (cc, cat, name, name_local, desc, social, search, ecom, news, heat, status, tags)
    used_names = set(existing_names)  # Track used names to avoid duplication

    for (cc, cat), needed in sorted(supplement_needed.items()):
        region = REGION_MAP.get(cc, "")
        marketplace = get_marketplace(cc, cat)
        price = get_price(cc, cat)
        country = COUNTRY_NAMES.get(cc, cc)

        # Get pool for this category
        if cat == "brands":
            pool_map = BRANDS_POOL
        elif cat == "fashion":
            pool_map = FASHION_POOL
        elif cat == "food":
            pool_map = FOOD_POOL
        elif cat == "products":
            pool_map = PRODUCTS_POOL
        else:
            continue

        # Combine regional + global pool
        regional_pool = pool_map.get(region, [])
        global_pool = pool_map.get("global", [])
        combined_pool = list(regional_pool) + list(global_pool)

        # Shuffle for variety
        random.shuffle(combined_pool)

        generated = 0
        for base_name, desc_template, base_tags in combined_pool:
            if generated >= needed:
                break

            # Make name unique
            trend_name = make_unique_name(base_name, cc, used_names)
            if trend_name.lower().strip() in used_names:
                continue

            # Format description
            desc = desc_template.format(
                cc=cc, country=country, marketplace=marketplace, price=price
            )

            # Generate scores
            social, search, ecom, news, heat = get_scores(cc, cat)

            # Tags
            tags = list(base_tags)

            supplement.append((
                cc, cat, trend_name, None, desc,
                social, search, ecom, news, heat, "rising", tags
            ))
            used_names.add(trend_name.lower().strip())
            generated += 1

        if generated < needed:
            # If pool ran out, generate generic ones
            for i in range(generated, needed):
                generic_names = {
                    "brands": [
                        (f"Local Brand Discovery {cc}-{i+1}", f"틱톡에서 현지 브랜드 발견 바이럴. {country}의 떠오르는 로컬 브랜드. {marketplace} 판매.", ["local", "brand", "discovery", "brands"]),
                        (f"Rising Brand {cc}-{i+1}", f"인스타에서 떠오르는 브랜드 {country} 바이럴. 신생 브랜드 트렌드. {marketplace} 판매.", ["rising", "brand", "brands"]),
                    ],
                    "fashion": [
                        (f"Street Style Trend {cc}-{i+1}", f"틱톡에서 스트리트 스타일 트렌드 {country} 바이럴. 현지 패션 트렌드. {marketplace} 판매. {price}.", ["street", "style", "local", "fashion"]),
                        (f"Casual Layered Look {cc}-{i+1}", f"인스타에서 캐주얼 레이어드 룩 {country} 바이럴. 일상 코디 트렌드. {marketplace} 판매. {price}.", ["casual", "layered", "fashion"]),
                    ],
                    "food": [
                        (f"Street Food Viral {cc}-{i+1}", f"틱톡에서 길거리 음식 {country} 바이럴. 현지 길거리 음식 트렌드. {marketplace} 판매. {price}.", ["street-food", "local", "food"]),
                        (f"Fusion Recipe Trend {cc}-{i+1}", f"틱톡에서 퓨전 레시피 트렌드 {country} 바이럴. 전통+현대 요리. {marketplace} 판매. {price}.", ["fusion", "recipe", "food"]),
                    ],
                    "products": [
                        (f"TikTok Must-Have {cc}-{i+1}", f"틱톡에서 머스트해브 아이템 {country} 바이럴. 트렌딩 상품. {marketplace} 판매. {price}.", ["must-have", "trending", "products"]),
                        (f"Skincare Routine Set {cc}-{i+1}", f"틱톡에서 스킨케어 루틴 세트 {country} 바이럴. 뷰티 케어 트렌드. {marketplace} 판매. {price}.", ["skincare", "routine", "products"]),
                    ],
                }

                options = generic_names.get(cat, [])
                if options:
                    idx = i % len(options)
                    name, desc, tags = options[idx]
                else:
                    name = f"Trending Item {cc}-{cat}-{i+1}"
                    desc = f"틱톡에서 트렌딩 아이템 {country} 바이럴. {marketplace} 판매."
                    tags = [cat, "trending"]

                if name.lower().strip() in used_names:
                    name = f"{name}-{hashlib.md5(f'{cc}{cat}{i}'.encode()).hexdigest()[:4]}"

                social, search, ecom, news, heat = get_scores(cc, cat)

                supplement.append((
                    cc, cat, name, None, desc,
                    social, search, ecom, news, heat, "rising", tags
                ))
                used_names.add(name.lower().strip())

    print(f"\nGenerated {len(supplement)} supplement trends")

    # Verify coverage
    final_counts = dict(existing_counts)
    for cc, cat, *_ in supplement:
        key = (cc, cat)
        final_counts[key] = final_counts.get(key, 0) + 1

    still_under = 0
    for cc in all_countries:
        for cat in CATEGORIES:
            if final_counts.get((cc, cat), 0) < TARGET_MIN:
                still_under += 1
                print(f"  WARNING: {cc}/{cat} = {final_counts.get((cc, cat), 0)} (still under {TARGET_MIN})")

    if still_under == 0:
        print(f"All {len(all_countries)} countries × {len(CATEGORIES)} categories >= {TARGET_MIN} trends")
    else:
        print(f"WARNING: {still_under} combos still under {TARGET_MIN}")

    # Category distribution of supplement
    sup_cat = {}
    for _, cat, *_ in supplement:
        sup_cat[cat] = sup_cat.get(cat, 0) + 1
    print(f"Supplement category distribution: {sup_cat}")

    # Check for duplicate names in supplement
    sup_names = [t[2].lower().strip() for t in supplement]
    dup_names = set()
    seen = set()
    for n in sup_names:
        if n in seen:
            dup_names.add(n)
        seen.add(n)
    if dup_names:
        print(f"WARNING: {len(dup_names)} duplicate names in supplement")
    else:
        print("No duplicate names in supplement")

    # Generate SQL
    sql_lines = []
    sql_lines.append("-- ========================================")
    sql_lines.append("-- MONTRA Trends v5 Supplement - Fill to 5 per country-category")
    sql_lines.append(f"-- Generated: {datetime.now(timezone.utc).strftime('%Y-%m-%d %H:%M')} UTC")
    sql_lines.append(f"-- Supplement Trends: {len(supplement)}")
    sql_lines.append(f"-- Category Distribution: {sup_cat}")
    sql_lines.append(f"-- Target: All 190 countries × 4 categories >= {TARGET_MIN} trends")
    sql_lines.append("-- Source: Regional trend pools (TikTok/Instagram viral based)")
    sql_lines.append("-- ========================================")
    sql_lines.append("")
    sql_lines.append("-- NOTE: Run this AFTER trends_v5.sql has been loaded")
    sql_lines.append(f"-- DELETE FROM trends WHERE last_updated_at = '{NOW}';")
    sql_lines.append("")

    err_count = 0
    for t in supplement:
        cc, cat, name, name_local, desc, social, search, ecom, news, heat, status, tags = t
        country_id = COUNTRY_IDS.get(cc)
        category_id = CATEGORY_IDS.get(cat)
        if not country_id or not category_id:
            print(f"  [SKIP] Missing ID: country={cc}, category={cat}")
            err_count += 1
            continue

        sql = (
            f"INSERT INTO trends (country_id, category_id, name, name_local, description, "
            f"heat_score, heat_status, search_score, social_score, ecommerce_score, news_score, "
            f"tags, source_urls, first_detected_at, last_updated_at) VALUES ("
            f"'{country_id}', '{category_id}', {esc(name)}, {esc(name_local)}, "
            f"{esc(desc)}, {heat}, {esc(status)}, "
            f"{search}, {social}, {ecom}, {news}, "
            f"{tags_sql(tags)}, ARRAY[]::text[], "
            f"'{FIRST_DETECTED}', '{NOW}');"
        )
        sql_lines.append(sql)

    output_path = OUTPUT_DIR / "trends_v5_supplement.sql"
    with open(output_path, "w", encoding="utf-8") as f:
        f.write("\n".join(sql_lines) + "\n")

    print(f"\nOutput: {output_path}")
    print(f"Errors: {err_count}")
    print("Done!")


if __name__ == "__main__":
    main()
