"""
190개국 바이럴 트렌드 데이터 생성 스크립트 v3
- PM 웹검색 연구 데이터 기반 (2026년 3월)
- 30개 주요국: 실제 바이럴 트렌드 데이터
- 160개국: 같은 지역 주요국 데이터 기반 변형 (현지 통화, 현지 맞춤)
- 카테고리: fashion, products, food, brands (4개)
- 출력: scripts/output/trends_v3_part{1..6}.sql (지역별)
- 전체 목표: 190개국 × ~27개 = 5,000개+ INSERT
"""

import sys
import io
import json
import random
import hashlib
from datetime import datetime, timezone
from pathlib import Path
from copy import deepcopy

try:
    sys.stdout.reconfigure(encoding='utf-8', errors='replace')
except Exception:
    sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8', errors='replace')

SCRIPT_DIR = Path(__file__).parent
CONFIG_DIR = SCRIPT_DIR / "config"
OUTPUT_DIR = SCRIPT_DIR / "output"
OUTPUT_DIR.mkdir(exist_ok=True)

# ================================================================
# Supabase IDs 로드
# ================================================================
with open(CONFIG_DIR / "supabase_ids.json", "r", encoding="utf-8") as f:
    SUPABASE_IDS = json.load(f)

CATEGORY_IDS = SUPABASE_IDS["categories"]
COUNTRY_IDS = SUPABASE_IDS["countries"]

# ================================================================
# 190개국 정보
# (code, name_ko, name_en, flag, region, sub_region)
# ================================================================
ALL_COUNTRIES = [
    # ===== 아시아 (32) =====
    ("KR", "한국", "South Korea", "asia", "east_asia"),
    ("JP", "일본", "Japan", "asia", "east_asia"),
    ("CN", "중국", "China", "asia", "east_asia"),
    ("TW", "대만", "Taiwan", "asia", "east_asia"),
    ("MN", "몽골", "Mongolia", "asia", "east_asia"),
    ("HK", "홍콩", "Hong Kong", "asia", "east_asia"),
    ("SG", "싱가포르", "Singapore", "asia", "southeast_asia"),
    ("TH", "태국", "Thailand", "asia", "southeast_asia"),
    ("VN", "베트남", "Vietnam", "asia", "southeast_asia"),
    ("PH", "필리핀", "Philippines", "asia", "southeast_asia"),
    ("MY", "말레이시아", "Malaysia", "asia", "southeast_asia"),
    ("ID", "인도네시아", "Indonesia", "asia", "southeast_asia"),
    ("MM", "미얀마", "Myanmar", "asia", "southeast_asia"),
    ("KH", "캄보디아", "Cambodia", "asia", "southeast_asia"),
    ("LA", "라오스", "Laos", "asia", "southeast_asia"),
    ("BN", "브루나이", "Brunei", "asia", "southeast_asia"),
    ("TL", "동티모르", "Timor-Leste", "asia", "southeast_asia"),
    ("IN", "인도", "India", "asia", "south_asia"),
    ("PK", "파키스탄", "Pakistan", "asia", "south_asia"),
    ("BD", "방글라데시", "Bangladesh", "asia", "south_asia"),
    ("LK", "스리랑카", "Sri Lanka", "asia", "south_asia"),
    ("NP", "네팔", "Nepal", "asia", "south_asia"),
    ("AF", "아프가니스탄", "Afghanistan", "asia", "south_asia"),
    ("MV", "몰디브", "Maldives", "asia", "south_asia"),
    ("BT", "부탄", "Bhutan", "asia", "south_asia"),
    ("KZ", "카자흐스탄", "Kazakhstan", "asia", "central_asia"),
    ("UZ", "우즈베키스탄", "Uzbekistan", "asia", "central_asia"),
    ("GE", "조지아", "Georgia", "asia", "central_asia"),
    ("AZ", "아제르바이잔", "Azerbaijan", "asia", "central_asia"),
    ("TM", "투르크메니스탄", "Turkmenistan", "asia", "central_asia"),
    ("KG", "키르기스스탄", "Kyrgyzstan", "asia", "central_asia"),
    ("TJ", "타지키스탄", "Tajikistan", "asia", "central_asia"),
    # ===== 중동 (16) =====
    ("AE", "UAE", "United Arab Emirates", "middle_east", "middle_east"),
    ("SA", "사우디아라비아", "Saudi Arabia", "middle_east", "middle_east"),
    ("QA", "카타르", "Qatar", "middle_east", "middle_east"),
    ("KW", "쿠웨이트", "Kuwait", "middle_east", "middle_east"),
    ("BH", "바레인", "Bahrain", "middle_east", "middle_east"),
    ("OM", "오만", "Oman", "middle_east", "middle_east"),
    ("IL", "이스라엘", "Israel", "middle_east", "middle_east"),
    ("TR", "튀르키예", "Turkey", "middle_east", "middle_east"),
    ("JO", "요르단", "Jordan", "middle_east", "middle_east"),
    ("LB", "레바논", "Lebanon", "middle_east", "middle_east"),
    ("IQ", "이라크", "Iraq", "middle_east", "middle_east"),
    ("YE", "예멘", "Yemen", "middle_east", "middle_east"),
    ("SY", "시리아", "Syria", "middle_east", "middle_east"),
    ("PS", "팔레스타인", "Palestine", "middle_east", "middle_east"),
    ("IR", "이란", "Iran", "middle_east", "middle_east"),
    ("CY", "키프로스", "Cyprus", "middle_east", "middle_east"),
    # ===== 유럽 (44) =====
    ("GB", "영국", "United Kingdom", "europe", "west_europe"),
    ("FR", "프랑스", "France", "europe", "west_europe"),
    ("DE", "독일", "Germany", "europe", "west_europe"),
    ("NL", "네덜란드", "Netherlands", "europe", "west_europe"),
    ("BE", "벨기에", "Belgium", "europe", "west_europe"),
    ("LU", "룩셈부르크", "Luxembourg", "europe", "west_europe"),
    ("AT", "오스트리아", "Austria", "europe", "west_europe"),
    ("CH", "스위스", "Switzerland", "europe", "west_europe"),
    ("IE", "아일랜드", "Ireland", "europe", "west_europe"),
    ("IT", "이탈리아", "Italy", "europe", "south_europe"),
    ("ES", "스페인", "Spain", "europe", "south_europe"),
    ("PT", "포르투갈", "Portugal", "europe", "south_europe"),
    ("GR", "그리스", "Greece", "europe", "south_europe"),
    ("HR", "크로아티아", "Croatia", "europe", "south_europe"),
    ("MT", "몰타", "Malta", "europe", "south_europe"),
    ("AL", "알바니아", "Albania", "europe", "south_europe"),
    ("MK", "북마케도니아", "North Macedonia", "europe", "south_europe"),
    ("ME", "몬테네그로", "Montenegro", "europe", "south_europe"),
    ("SE", "스웨덴", "Sweden", "europe", "north_europe"),
    ("NO", "노르웨이", "Norway", "europe", "north_europe"),
    ("DK", "덴마크", "Denmark", "europe", "north_europe"),
    ("FI", "핀란드", "Finland", "europe", "north_europe"),
    ("IS", "아이슬란드", "Iceland", "europe", "north_europe"),
    ("PL", "폴란드", "Poland", "europe", "east_europe"),
    ("CZ", "체코", "Czech Republic", "europe", "east_europe"),
    ("HU", "헝가리", "Hungary", "europe", "east_europe"),
    ("RO", "루마니아", "Romania", "europe", "east_europe"),
    ("BG", "불가리아", "Bulgaria", "europe", "east_europe"),
    ("UA", "우크라이나", "Ukraine", "europe", "east_europe"),
    ("RS", "세르비아", "Serbia", "europe", "east_europe"),
    ("SK", "슬로바키아", "Slovakia", "europe", "east_europe"),
    ("SI", "슬로베니아", "Slovenia", "europe", "east_europe"),
    ("LT", "리투아니아", "Lithuania", "europe", "east_europe"),
    ("LV", "라트비아", "Latvia", "europe", "east_europe"),
    ("EE", "에스토니아", "Estonia", "europe", "east_europe"),
    ("BA", "보스니아", "Bosnia and Herzegovina", "europe", "east_europe"),
    ("MD", "몰도바", "Moldova", "europe", "east_europe"),
    ("RU", "러시아", "Russia", "europe", "east_europe"),
    ("BY", "벨라루스", "Belarus", "europe", "east_europe"),
    ("XK", "코소보", "Kosovo", "europe", "east_europe"),
    ("AM", "아르메니아", "Armenia", "europe", "east_europe"),
    # ===== 아프리카 (44) =====
    ("EG", "이집트", "Egypt", "africa", "north_africa"),
    ("MA", "모로코", "Morocco", "africa", "north_africa"),
    ("TN", "튀니지", "Tunisia", "africa", "north_africa"),
    ("DZ", "알제리", "Algeria", "africa", "north_africa"),
    ("LY", "리비아", "Libya", "africa", "north_africa"),
    ("SD", "수단", "Sudan", "africa", "north_africa"),
    ("NG", "나이지리아", "Nigeria", "africa", "west_africa"),
    ("GH", "가나", "Ghana", "africa", "west_africa"),
    ("SN", "세네갈", "Senegal", "africa", "west_africa"),
    ("CI", "코트디부아르", "Ivory Coast", "africa", "west_africa"),
    ("CM", "카메룬", "Cameroon", "africa", "west_africa"),
    ("ML", "말리", "Mali", "africa", "west_africa"),
    ("BF", "부르키나파소", "Burkina Faso", "africa", "west_africa"),
    ("NE", "니제르", "Niger", "africa", "west_africa"),
    ("GN", "기니", "Guinea", "africa", "west_africa"),
    ("SL", "시에라리온", "Sierra Leone", "africa", "west_africa"),
    ("LR", "라이베리아", "Liberia", "africa", "west_africa"),
    ("TG", "토고", "Togo", "africa", "west_africa"),
    ("BJ", "베냉", "Benin", "africa", "west_africa"),
    ("CV", "카보베르데", "Cape Verde", "africa", "west_africa"),
    ("MR", "모리타니", "Mauritania", "africa", "west_africa"),
    ("GM", "감비아", "Gambia", "africa", "west_africa"),
    ("GW", "기니비사우", "Guinea-Bissau", "africa", "west_africa"),
    ("GQ", "적도기니", "Equatorial Guinea", "africa", "central_africa"),
    ("KE", "케냐", "Kenya", "africa", "east_africa"),
    ("ET", "에티오피아", "Ethiopia", "africa", "east_africa"),
    ("TZ", "탄자니아", "Tanzania", "africa", "east_africa"),
    ("UG", "우간다", "Uganda", "africa", "east_africa"),
    ("RW", "르완다", "Rwanda", "africa", "east_africa"),
    ("MG", "마다가스카르", "Madagascar", "africa", "east_africa"),
    ("MU", "모리셔스", "Mauritius", "africa", "east_africa"),
    ("SO", "소말리아", "Somalia", "africa", "east_africa"),
    ("ER", "에리트레아", "Eritrea", "africa", "east_africa"),
    ("DJ", "지부티", "Djibouti", "africa", "east_africa"),
    ("MW", "말라위", "Malawi", "africa", "east_africa"),
    ("SC", "세이셸", "Seychelles", "africa", "east_africa"),
    ("SS", "남수단", "South Sudan", "africa", "east_africa"),
    ("BI", "부룬디", "Burundi", "africa", "east_africa"),
    ("KM", "코모로", "Comoros", "africa", "east_africa"),
    ("ZA", "남아공", "South Africa", "africa", "south_africa"),
    ("MZ", "모잠비크", "Mozambique", "africa", "south_africa"),
    ("ZW", "짐바브웨", "Zimbabwe", "africa", "south_africa"),
    ("BW", "보츠와나", "Botswana", "africa", "south_africa"),
    ("NA", "나미비아", "Namibia", "africa", "south_africa"),
    ("ZM", "잠비아", "Zambia", "africa", "south_africa"),
    ("LS", "레소토", "Lesotho", "africa", "south_africa"),
    ("SZ", "에스와티니", "Eswatini", "africa", "south_africa"),
    ("CD", "콩고민주", "DR Congo", "africa", "central_africa"),
    ("CG", "콩고공화국", "Republic of Congo", "africa", "central_africa"),
    ("GA", "가봉", "Gabon", "africa", "central_africa"),
    ("TD", "차드", "Chad", "africa", "central_africa"),
    ("AO", "앙골라", "Angola", "africa", "central_africa"),
    ("CF", "중앙아프리카", "Central African Republic", "africa", "central_africa"),
    ("ST", "상투메프린시페", "Sao Tome and Principe", "africa", "central_africa"),
    # ===== 아메리카 (31) =====
    ("US", "미국", "United States", "americas", "north_america"),
    ("CA", "캐나다", "Canada", "americas", "north_america"),
    ("MX", "멕시코", "Mexico", "americas", "central_america"),
    ("GT", "과테말라", "Guatemala", "americas", "central_america"),
    ("CU", "쿠바", "Cuba", "americas", "central_america"),
    ("HN", "온두라스", "Honduras", "americas", "central_america"),
    ("SV", "엘살바도르", "El Salvador", "americas", "central_america"),
    ("NI", "니카라과", "Nicaragua", "americas", "central_america"),
    ("CR", "코스타리카", "Costa Rica", "americas", "central_america"),
    ("PA", "파나마", "Panama", "americas", "central_america"),
    ("DO", "도미니카공화국", "Dominican Republic", "americas", "central_america"),
    ("JM", "자메이카", "Jamaica", "americas", "central_america"),
    ("HT", "아이티", "Haiti", "americas", "central_america"),
    ("BZ", "벨리즈", "Belize", "americas", "central_america"),
    ("BB", "바베이도스", "Barbados", "americas", "central_america"),
    ("BS", "바하마", "Bahamas", "americas", "central_america"),
    ("PR", "푸에르토리코", "Puerto Rico", "americas", "central_america"),
    ("TT", "트리니다드토바고", "Trinidad and Tobago", "americas", "south_america"),
    ("AG", "앤티가바부다", "Antigua and Barbuda", "americas", "central_america"),
    ("DM", "도미니카", "Dominica", "americas", "central_america"),
    ("GD", "그레나다", "Grenada", "americas", "central_america"),
    ("SR", "수리남", "Suriname", "americas", "south_america"),
    ("GY", "가이아나", "Guyana", "americas", "south_america"),
    ("BR", "브라질", "Brazil", "americas", "south_america"),
    ("AR", "아르헨티나", "Argentina", "americas", "south_america"),
    ("CO", "콜롬비아", "Colombia", "americas", "south_america"),
    ("CL", "칠레", "Chile", "americas", "south_america"),
    ("PE", "페루", "Peru", "americas", "south_america"),
    ("VE", "베네수엘라", "Venezuela", "americas", "south_america"),
    ("EC", "에콰도르", "Ecuador", "americas", "south_america"),
    ("UY", "우루과이", "Uruguay", "americas", "south_america"),
    ("BO", "볼리비아", "Bolivia", "americas", "south_america"),
    ("PY", "파라과이", "Paraguay", "americas", "south_america"),
    # ===== 오세아니아 (14) =====
    ("AU", "호주", "Australia", "oceania", "oceania"),
    ("NZ", "뉴질랜드", "New Zealand", "oceania", "oceania"),
    ("FJ", "피지", "Fiji", "oceania", "oceania"),
    ("PG", "파푸아뉴기니", "Papua New Guinea", "oceania", "oceania"),
    ("WS", "사모아", "Samoa", "oceania", "oceania"),
    ("TO", "통가", "Tonga", "oceania", "oceania"),
    ("VU", "바누아투", "Vanuatu", "oceania", "oceania"),
    ("SB", "솔로몬제도", "Solomon Islands", "oceania", "oceania"),
    ("FM", "미크로네시아", "Micronesia", "oceania", "oceania"),
    ("MH", "마셜제도", "Marshall Islands", "oceania", "oceania"),
    ("PW", "팔라우", "Palau", "oceania", "oceania"),
    ("KI", "키리바시", "Kiribati", "oceania", "oceania"),
    ("NR", "나우루", "Nauru", "oceania", "oceania"),
    ("TV", "투발루", "Tuvalu", "oceania", "oceania"),
]

# ================================================================
# 30개 주요국 (실제 트렌드 데이터)
# ================================================================
TOP_COUNTRIES = {
    "KR", "JP", "CN", "US", "GB", "FR", "DE", "IT", "ES",
    "TH", "VN", "IN", "TW", "SG", "ID", "PH", "MY",
    "AE", "SA", "TR",
    "BR", "MX", "NG", "ZA", "EG",
    "AU",
    # 추가 주요국 (PM 데이터 기반)
    "NZ", "CA", "IL", "RU",
}

# ================================================================
# 템플릿 국가 매핑 (나머지 160개국 -> 주요국)
# ================================================================
TEMPLATE_MAP = {
    # 동아시아
    "MN": "KR", "HK": "CN",
    # 동남아시아
    "MM": "TH", "KH": "TH", "LA": "TH", "BN": "SG", "TL": "ID",
    # 남아시아
    "PK": "IN", "BD": "IN", "LK": "IN", "NP": "IN",
    "AF": "IN", "MV": "IN", "BT": "IN",
    # 중앙아시아
    "KZ": "TR", "UZ": "TR", "GE": "TR", "AZ": "TR",
    "TM": "TR", "KG": "TR", "TJ": "TR",
    # 중동
    "QA": "AE", "KW": "AE", "BH": "AE", "OM": "AE",
    "JO": "SA", "LB": "FR", "IQ": "SA", "YE": "SA",
    "SY": "TR", "PS": "SA", "IR": "TR", "CY": "GB",
    # 서유럽
    "NL": "DE", "BE": "FR", "LU": "FR", "AT": "DE",
    "CH": "DE", "IE": "GB",
    # 남유럽
    "PT": "ES", "GR": "IT", "HR": "DE", "MT": "IT",
    "AL": "TR", "MK": "TR", "ME": "TR",
    # 북유럽
    "SE": "DE", "NO": "DE", "DK": "DE", "FI": "DE", "IS": "DE",
    # 동유럽
    "PL": "DE", "CZ": "DE", "HU": "DE", "RO": "DE",
    "BG": "TR", "UA": "DE", "RS": "DE", "SK": "DE",
    "SI": "DE", "LT": "DE", "LV": "DE", "EE": "DE",
    "BA": "TR", "MD": "DE", "BY": "RU", "XK": "TR", "AM": "TR",
    # 북아프리카
    "MA": "FR", "TN": "FR", "DZ": "FR", "LY": "EG", "SD": "EG",
    # 서아프리카
    "GH": "NG", "SN": "NG", "CI": "NG", "CM": "NG",
    "ML": "NG", "BF": "NG", "NE": "NG", "GN": "NG",
    "SL": "NG", "LR": "NG", "TG": "NG", "BJ": "NG",
    "CV": "NG", "MR": "NG", "GM": "NG", "GW": "NG", "GQ": "NG",
    # 동아프리카
    "KE": "NG", "ET": "NG", "TZ": "NG", "UG": "NG",
    "RW": "NG", "MG": "NG", "MU": "ZA", "SO": "EG",
    "ER": "EG", "DJ": "EG", "MW": "ZA", "SC": "ZA",
    "SS": "NG", "BI": "NG", "KM": "EG",
    # 남아프리카
    "MZ": "ZA", "ZW": "ZA", "BW": "ZA", "NA": "ZA",
    "ZM": "ZA", "LS": "ZA", "SZ": "ZA",
    # 중앙아프리카
    "CD": "NG", "CG": "NG", "GA": "NG", "TD": "NG",
    "AO": "BR", "CF": "NG", "ST": "NG",
    # 북미
    "CA": "US",
    # 중미/카리브
    "GT": "MX", "CU": "MX", "HN": "MX", "SV": "MX",
    "NI": "MX", "CR": "MX", "PA": "MX", "DO": "MX",
    "JM": "US", "HT": "MX", "BZ": "MX", "BB": "US",
    "BS": "US", "PR": "US", "TT": "US", "AG": "US",
    "DM": "US", "GD": "US", "SR": "BR", "GY": "BR",
    # 남미
    "AR": "BR", "CO": "BR", "CL": "BR", "PE": "MX",
    "VE": "BR", "EC": "MX", "UY": "BR", "BO": "MX", "PY": "BR",
    # 오세아니아
    "FJ": "AU", "PG": "AU", "WS": "AU", "TO": "AU",
    "VU": "AU", "SB": "AU", "FM": "AU", "MH": "AU",
    "PW": "AU", "KI": "AU", "NR": "AU", "TV": "AU",
}

# ================================================================
# 통화 정보 (code, symbol, rate_to_usd)
# ================================================================
CURRENCY_INFO = {
    "KR": ("KRW", "₩", 1350), "JP": ("JPY", "¥", 150), "CN": ("CNY", "¥", 7.2),
    "TW": ("TWD", "NT$", 32), "MN": ("MNT", "₮", 3400), "HK": ("HKD", "HK$", 7.8),
    "SG": ("SGD", "S$", 1.35), "TH": ("THB", "฿", 35), "VN": ("VND", "₫", 25000),
    "PH": ("PHP", "₱", 56), "MY": ("MYR", "RM", 4.7), "ID": ("IDR", "Rp", 15500),
    "MM": ("MMK", "K", 2100), "KH": ("KHR", "៛", 4100), "LA": ("LAK", "₭", 20000),
    "BN": ("BND", "B$", 1.35), "TL": ("USD", "$", 1),
    "IN": ("INR", "₹", 83), "PK": ("PKR", "Rs", 280), "BD": ("BDT", "৳", 110),
    "LK": ("LKR", "Rs", 320), "NP": ("NPR", "Rs", 133), "AF": ("AFN", "؋", 70),
    "MV": ("MVR", "Rf", 15.4), "BT": ("BTN", "Nu", 83),
    "KZ": ("KZT", "₸", 460), "UZ": ("UZS", "so'm", 12500), "GE": ("GEL", "₾", 2.7),
    "AZ": ("AZN", "₼", 1.7), "TM": ("TMT", "T", 3.5), "KG": ("KGS", "сом", 89),
    "TJ": ("TJS", "SM", 10.9),
    "AE": ("AED", "AED", 3.67), "SA": ("SAR", "SAR", 3.75), "QA": ("QAR", "QAR", 3.64),
    "KW": ("KWD", "KD", 0.31), "BH": ("BHD", "BD", 0.38), "OM": ("OMR", "OMR", 0.385),
    "IL": ("ILS", "₪", 3.7), "TR": ("TRY", "₺", 32), "JO": ("JOD", "JD", 0.71),
    "LB": ("LBP", "L£", 89500), "IQ": ("IQD", "د.ع", 1310),
    "YE": ("YER", "﷼", 250), "SY": ("SYP", "£S", 13000), "PS": ("ILS", "₪", 3.7),
    "IR": ("IRR", "﷼", 42000), "CY": ("EUR", "€", 0.92),
    "GB": ("GBP", "£", 0.79), "FR": ("EUR", "€", 0.92), "DE": ("EUR", "€", 0.92),
    "NL": ("EUR", "€", 0.92), "BE": ("EUR", "€", 0.92), "LU": ("EUR", "€", 0.92),
    "AT": ("EUR", "€", 0.92), "CH": ("CHF", "CHF", 0.88), "IE": ("EUR", "€", 0.92),
    "IT": ("EUR", "€", 0.92), "ES": ("EUR", "€", 0.92), "PT": ("EUR", "€", 0.92),
    "GR": ("EUR", "€", 0.92), "HR": ("EUR", "€", 0.92), "MT": ("EUR", "€", 0.92),
    "AL": ("ALL", "L", 95), "MK": ("MKD", "ден", 57),
    "ME": ("EUR", "€", 0.92),
    "SE": ("SEK", "kr", 10.5), "NO": ("NOK", "kr", 10.7), "DK": ("DKK", "kr", 6.9),
    "FI": ("EUR", "€", 0.92), "IS": ("ISK", "kr", 138),
    "PL": ("PLN", "zł", 4), "CZ": ("CZK", "Kč", 23), "HU": ("HUF", "Ft", 365),
    "RO": ("RON", "lei", 4.6), "BG": ("BGN", "лв", 1.8), "UA": ("UAH", "₴", 38),
    "RS": ("RSD", "din", 108), "SK": ("EUR", "€", 0.92), "SI": ("EUR", "€", 0.92),
    "LT": ("EUR", "€", 0.92), "LV": ("EUR", "€", 0.92), "EE": ("EUR", "€", 0.92),
    "BA": ("BAM", "KM", 1.8), "MD": ("MDL", "L", 18),
    "RU": ("RUB", "₽", 92), "BY": ("BYN", "Br", 3.3),
    "XK": ("EUR", "€", 0.92), "AM": ("AMD", "֏", 390),
    "EG": ("EGP", "E£", 50), "MA": ("MAD", "MAD", 10), "TN": ("TND", "DT", 3.1),
    "DZ": ("DZD", "DA", 135), "LY": ("LYD", "LD", 4.85), "SD": ("SDG", "SDG", 600),
    "NG": ("NGN", "₦", 1550), "GH": ("GHS", "GH₵", 15), "SN": ("XOF", "CFA", 610),
    "CI": ("XOF", "CFA", 610), "CM": ("XAF", "FCFA", 610),
    "ML": ("XOF", "CFA", 610), "BF": ("XOF", "CFA", 610),
    "NE": ("XOF", "CFA", 610), "GN": ("GNF", "FG", 8600),
    "SL": ("SLL", "Le", 22700), "LR": ("LRD", "L$", 192),
    "TG": ("XOF", "CFA", 610), "BJ": ("XOF", "CFA", 610),
    "CV": ("CVE", "Esc", 102), "MR": ("MRU", "UM", 40),
    "GM": ("GMD", "D", 68), "GW": ("XOF", "CFA", 610), "GQ": ("XAF", "FCFA", 610),
    "KE": ("KES", "KSh", 155), "ET": ("ETB", "Br", 57), "TZ": ("TZS", "TSh", 2550),
    "UG": ("UGX", "USh", 3750), "RW": ("RWF", "RF", 1300),
    "MG": ("MGA", "Ar", 4600), "MU": ("MUR", "Rs", 45),
    "SO": ("SOS", "Sh", 570), "ER": ("ERN", "Nkf", 15), "DJ": ("DJF", "Fdj", 178),
    "MW": ("MWK", "MK", 1730), "SC": ("SCR", "Rs", 14),
    "SS": ("SSP", "SS£", 130), "BI": ("BIF", "FBu", 2900), "KM": ("KMF", "CF", 455),
    "ZA": ("ZAR", "R", 18), "MZ": ("MZN", "MT", 64), "ZW": ("ZWL", "Z$", 14000),
    "BW": ("BWP", "P", 14), "NA": ("NAD", "N$", 18), "ZM": ("ZMW", "ZK", 27),
    "LS": ("LSL", "L", 18), "SZ": ("SZL", "E", 18),
    "CD": ("CDF", "FC", 2750), "CG": ("XAF", "FCFA", 610),
    "GA": ("XAF", "FCFA", 610), "TD": ("XAF", "FCFA", 610), "AO": ("AOA", "Kz", 830),
    "CF": ("XAF", "FCFA", 610), "ST": ("STN", "Db", 23),
    "US": ("USD", "$", 1), "CA": ("CAD", "C$", 1.37),
    "MX": ("MXN", "MX$", 17), "GT": ("GTQ", "Q", 7.8), "CU": ("CUP", "$", 24),
    "HN": ("HNL", "L", 25), "SV": ("USD", "$", 1), "NI": ("NIO", "C$", 37),
    "CR": ("CRC", "₡", 520), "PA": ("PAB", "B/.", 1), "DO": ("DOP", "RD$", 58),
    "JM": ("JMD", "J$", 156), "HT": ("HTG", "G", 132), "BZ": ("BZD", "BZ$", 2),
    "BB": ("BBD", "Bds$", 2), "BS": ("BSD", "B$", 1), "PR": ("USD", "$", 1),
    "TT": ("TTD", "TT$", 6.8), "AG": ("XCD", "EC$", 2.7),
    "DM": ("XCD", "EC$", 2.7), "GD": ("XCD", "EC$", 2.7),
    "SR": ("SRD", "SR$", 36), "GY": ("GYD", "G$", 210),
    "BR": ("BRL", "R$", 5), "AR": ("ARS", "$", 870), "CO": ("COP", "$", 4000),
    "CL": ("CLP", "$", 950), "PE": ("PEN", "S/.", 3.7), "VE": ("VES", "Bs", 36),
    "EC": ("USD", "$", 1), "UY": ("UYU", "$U", 40), "BO": ("BOB", "Bs", 6.9),
    "PY": ("PYG", "₲", 7500),
    "AU": ("AUD", "A$", 1.55), "NZ": ("NZD", "NZ$", 1.7), "FJ": ("FJD", "FJ$", 2.3),
    "PG": ("PGK", "K", 3.9), "WS": ("WST", "WS$", 2.8), "TO": ("TOP", "T$", 2.4),
    "VU": ("VUV", "VT", 120), "SB": ("SBD", "SI$", 8.5),
    "FM": ("USD", "$", 1), "MH": ("USD", "$", 1),
    "PW": ("USD", "$", 1), "KI": ("AUD", "A$", 1.55),
    "NR": ("AUD", "A$", 1.55), "TV": ("AUD", "A$", 1.55),
}

# ================================================================
# 판매처
# ================================================================
LOCAL_STORES = {
    "KR": ["쿠팡", "무신사", "올리브영", "에이블리", "지그재그"],
    "JP": ["Amazon Japan", "Rakuten", "Yahoo Shopping", "ZOZOTOWN"],
    "CN": ["Taobao", "JD.com", "Pinduoduo", "Tmall", "Douyin Shop"],
    "TW": ["Shopee TW", "momo", "PChome", "Yahoo TW"],
    "HK": ["HKTVmall", "Shopee HK", "Amazon HK"],
    "SG": ["Shopee SG", "Lazada SG", "Amazon.sg"],
    "TH": ["Shopee TH", "Lazada TH", "TikTok Shop TH"],
    "VN": ["Shopee VN", "Tiki", "Lazada VN", "TikTok Shop VN"],
    "PH": ["Shopee PH", "Lazada PH", "TikTok Shop PH"],
    "MY": ["Shopee MY", "Lazada MY", "TikTok Shop MY"],
    "ID": ["Tokopedia", "Shopee ID", "TikTok Shop ID"],
    "IN": ["Amazon India", "Flipkart", "Myntra", "Meesho"],
    "PK": ["Daraz PK", "Goto.com.pk"],
    "BD": ["Daraz BD", "Evaly"],
    "LK": ["Daraz LK", "Kapruka"],
    "NP": ["Daraz NP", "SastoDeal"],
    "KZ": ["Kaspi.kz", "Wildberries KZ"],
    "UZ": ["Uzum Market", "Asaxiy"],
    "GE": ["Extra.ge", "Mymarket.ge"],
    "AZ": ["Umico", "Tap.az"],
    "AE": ["Amazon.ae", "Noon", "Namshi"],
    "SA": ["Noon SA", "Amazon.sa", "Jarir"],
    "QA": ["Noon QA", "Talabat Mall"],
    "KW": ["Noon KW", "Xcite"],
    "BH": ["Noon BH", "LuLu Online BH"],
    "OM": ["Noon OM", "LuLu Oman"],
    "IL": ["Amazon IL", "Zap", "KSP"],
    "TR": ["Trendyol", "Hepsiburada", "n11"],
    "JO": ["OpenSooq JO", "Noon JO"],
    "LB": ["Noon LB", "Carrefour LB"],
    "IQ": ["Miswag", "Orisdi"],
    "IR": ["Digikala", "Basalam"],
    "CY": ["Skroutz CY", "Public CY"],
    "GB": ["Amazon UK", "ASOS", "John Lewis", "Argos"],
    "FR": ["Amazon.fr", "Cdiscount", "Fnac", "Sephora FR"],
    "DE": ["Amazon.de", "Otto", "Zalando", "MediaMarkt"],
    "NL": ["Bol.com", "Coolblue", "Wehkamp"],
    "BE": ["Bol.com BE", "Coolblue BE"],
    "AT": ["Amazon.at", "Zalando AT"],
    "CH": ["Digitec", "Galaxus"],
    "IE": ["Amazon.ie", "Argos IE"],
    "IT": ["Amazon.it", "Zalando IT", "Yoox"],
    "ES": ["Amazon.es", "El Corte Ingles", "Zara.com"],
    "PT": ["Amazon.pt", "Worten"],
    "GR": ["Skroutz", "Public.gr"],
    "SE": ["Amazon.se", "Zalando SE", "CDON"],
    "NO": ["Komplett.no", "Elkjop"],
    "DK": ["Zalando DK", "Elgiganten DK"],
    "FI": ["Verkkokauppa", "Zalando FI"],
    "PL": ["Allegro", "Zalando PL"],
    "CZ": ["Alza.cz", "Mall.cz"],
    "HU": ["Emag HU", "Alza.hu"],
    "RO": ["eMAG", "Altex"],
    "BG": ["eMAG BG", "Ozone.bg"],
    "UA": ["Rozetka", "Prom.ua"],
    "RS": ["Kupujem Prodajem", "Gigatron"],
    "RU": ["Wildberries", "Ozon", "Yandex Market"],
    "EG": ["Noon EG", "Amazon EG", "Jumia EG"],
    "MA": ["Jumia MA", "Hmall.ma"],
    "TN": ["Jumia TN", "Mytek"],
    "DZ": ["Jumia DZ", "Ouedkniss"],
    "NG": ["Jumia NG", "Konga", "PayPorte"],
    "GH": ["Jumia GH", "Jiji GH"],
    "SN": ["Jumia SN", "CoinAfrique SN"],
    "KE": ["Jumia KE", "Kilimall"],
    "ET": ["Addis Mercato", "Telegram Shops ET"],
    "TZ": ["Jumia TZ", "Jiji TZ"],
    "UG": ["Jumia UG", "Jiji UG"],
    "ZA": ["Takealot", "Mr Price", "Superbalist"],
    "MZ": ["OLX MZ"],
    "ZW": ["Classifieds.co.zw"],
    "US": ["Amazon", "Walmart", "Target", "TikTok Shop US"],
    "CA": ["Amazon.ca", "Canadian Tire", "Shopify"],
    "MX": ["Mercado Libre", "Amazon MX", "Liverpool"],
    "BR": ["Mercado Livre", "Magazine Luiza", "Americanas"],
    "AR": ["Mercado Libre AR", "Falabella AR"],
    "CO": ["Mercado Libre CO", "Falabella CO"],
    "CL": ["Mercado Libre CL", "Falabella CL"],
    "PE": ["Mercado Libre PE", "Falabella PE"],
    "AU": ["Amazon.com.au", "Kogan", "The Iconic", "JB Hi-Fi"],
    "NZ": ["Mighty Ape", "The Warehouse", "Trade Me"],
}

# ================================================================
# 30개 주요국 바이럴 트렌드 데이터 (PM 웹검색 연구 기반)
# 키: (country_code, category_slug)
# 값: [(name, description), ...]
# ================================================================
VIRAL_DATA = {
    # ==================== KR (한국) ====================
    ("KR", "fashion"): [
        ("Angel Motif Cardigan", "틱톡에서 #엔젤모티프 네오파스텔 스타일 바이럴. 인스타 #OOTD에서 천사 모티프 카디건 인기. 무신사 판매. ₩59,000."),
        ("Neo-Pastel Oversized Hoodie", "인스타에서 #네오파스텔 파스텔톤 오버사이즈 후디 바이럴. 2026 봄 트렌드. 에이블리 판매. ₩39,800."),
        ("Custom Running Shoes", "틱톡에서 #러닝화커스텀 개인 맞춤 러닝화 바이럴. NIKEiD/뉴발란스 커스텀 트렌드. 무신사 판매. ₩159,000."),
        ("마뗑킴 크로스바디백", "인스타 #OOTD에서 매일 보이는 미니 크로스바디백. 틱톡 #마뗑킴 1억뷰. 무신사 판매. ₩89,000."),
        ("아디다스 삼바 OG", "틱톡에서 #삼바 한국 스타일링 영상 바이럴. 인스타 스트릿 스냅 필수. 무신사 판매. ₩139,000."),
        ("무신사 스탠다드 카고팬츠", "틱톡에서 #카고팬츠 코디 영상 5천만뷰. 가성비 데일리룩. 무신사 판매. ₩39,900."),
        ("뉴발란스 530", "인스타 #NB530 스니커즈 바이럴. MZ세대 필수템. 쿠팡 판매. ₩129,000."),
    ],
    ("KR", "products"): [
        ("Snail Mucin Serum", "틱톡에서 #SnailMucin K-뷰티 글래스 스킨 필수템으로 바이럴. 올리브영 베스트셀러. 올리브영 판매. ₩12,900."),
        ("LED Light Therapy Mask", "틱톡 뷰티테크 트렌드 #LEDMask 바이럴. 여드름/주름 관리. 쿠팡 판매. ₩49,000."),
        ("Lip Oil Glass Lips", "틱톡에서 #LipOil 글래스 립 트렌드 바이럴. 비접착 촉촉한 입술. 올리브영 판매. ₩15,900."),
        ("Heatless Hair Curling Set", "틱톡에서 #히트리스컬 열 없이 웨이브 바이럴. 모발 손상 제로 트렌드. 쿠팡 판매. ₩9,900."),
        ("다이슨 에어랩 멀티 스타일러", "틱톡에서 #다이슨에어랩 헤어 스타일링 영상 3억뷰. 인스타 #GRWM 필수템. 쿠팡 판매. ₩699,000."),
        ("3-in-1 Wireless Charging Station", "틱톡에서 3-in-1 무선충전 스테이션 바이럴. 아이폰+애플워치+에어팟 동시충전. 쿠팡 판매. ₩29,900."),
        ("Pet Hair Remover Roller", "틱톡에서 #반려동물털제거 롤러 바이럴. 펫 가구 청소 필수템. 쿠팡 판매. ₩12,900."),
    ],
    ("KR", "food"): [
        ("두쫀쿠 (Dubai Chewy Cookie)", "틱톡에서 #두쫀쿠 IVE 장원영 SNS 이후 카페 오픈런 바이럴. 두바이 초콜릿 쿠키. 카페 판매. ₩6,500."),
        ("두바이 초콜릿", "틱톡에서 #두바이초콜릿 ASMR 먹방 10억뷰 돌파. 피스타치오 카다이프 초콜릿. 쿠팡 판매. ₩15,900."),
        ("K-라면 고급화 (프리미엄 라면)", "틱톡에서 #프리미엄라면 한정판 고급 라면 바이럴. 명장 라면/신라면 블랙. 쿠팡 판매. ₩4,980."),
        ("삼양 불닭볶음면 카르보나라", "틱톡에서 #BuldakChallenge 20억뷰. 전세계 매운맛 챌린지 바이럴. 쿠팡 판매. ₩4,980."),
        ("탕후루", "틱톡에서 #탕후루 ASMR 5억뷰. 인스타 먹스타그램 필수 디저트. 매장 판매. ₩5,000."),
        ("편의점 감성 디저트", "틱톡에서 #편의점디저트 한정판 리뷰 바이럴. CU/GS25 콜라보 디저트. 편의점 판매. ₩3,500."),
        ("크로플", "인스타 #크로플 카페 디저트 바이럴. 크루아상+와플 퓨전. 카페 판매. ₩6,500."),
    ],
    ("KR", "brands"): [
        ("fwee", "일본 1위 K-뷰티 브랜드. 틱톡에서 #fwee 글래시 립 바이럴. 올리브영 판매. ₩18,000."),
        ("CLIO", "틱톡에서 #CLIO 킬커버 파운데이션 K-뷰티 바이럴. 글로벌 확장 중. 올리브영 판매. ₩25,000."),
        ("올리브영", "틱톡/인스타에서 #올리브영추천 바이럴. K-뷰티 성지. 올리브영 판매. ₩15,900."),
        ("무신사", "틱톡에서 #무신사 패션 하울 바이럴. K-패션 플랫폼 대표. 무신사 판매. ₩39,900."),
        ("HiteJinro", "틱톡에서 #두쫀쿠맛소주 한정판 바이럴. HiteJinro 콜라보 소주. 편의점 판매. ₩5,000."),
        ("마뗑킴", "인스타 #마뗑킴 K-패션 디자이너 브랜드 바이럴. 글로벌 확장. 무신사 판매. ₩89,000."),
    ],

    # ==================== JP (일본) ====================
    ("JP", "fashion"): [
        ("Neo-Pastel Angel Style", "틱톡에서 #ネオパステル 한국 영향 천사 모티프 스타일 바이럴. ZOZOTOWN 판매. ¥4,990."),
        ("SHEIN Japan Limited", "틱톡에서 #SHEIN 일본 한정 컬렉션 바이럴. 가성비 트렌드 패션. SHEIN 판매. ¥1,990."),
        ("UNIQLO Round Mini Shoulder Bag", "틱톡에서 #ユニクロ ミニショルダーバッグ 바이럴. 1000엔대 가성비 가방. UNIQLO 판매. ¥1,500."),
        ("GU Wide Pants", "틱톡에서 #GU ワイドパンツ 코디 영상 바이럴. 가성비 데일리. GU 판매. ¥1,490."),
        ("New Balance 990v6", "인스타 #NB990 일본 스트릿 스냅에서 매일 등장. 프리미엄 스니커즈. ABC-Mart 판매. ¥36,300."),
        ("ASICS Gel-Kayano 14", "틱톡에서 #ASICS 레트로 러닝화 바이럴. 일본 헤리티지 스니커즈. ASICS 판매. ¥17,600."),
        ("MUJI Linen Shirt", "인스타에서 #無印良品 린넨 셔츠 미니멀룩 바이럴. 심플 라이프. MUJI 판매. ¥3,990."),
    ],
    ("JP", "products"): [
        ("ちいかわ(치이카와) 굿즈", "틱톡/인스타에서 #ちいかわ 캐릭터 굿즈 바이럴. 일본 캐릭터 열풍. Amazon Japan 판매. ¥1,980."),
        ("LED Light Therapy Mask JP", "틱톡에서 #LEDマスク 뷰티테크 바이럴. 여드름/주름 관리. Amazon Japan 판매. ¥5,980."),
        ("Panasonic Nanocare Dryer EH-NA0J", "틱톡에서 #ナノケア 드라이어 바이럴. 일본 뷰티 가전 인기. Amazon Japan 판매. ¥38,610."),
        ("Canmake Marshmallow Finish Powder", "틱톡에서 #Canmake 가성비 파우더 바이럴. J-뷰티 필수템. Amazon Japan 판매. ¥1,034."),
        ("Sony WH-1000XM6", "틱톡에서 #SonyXM6 노이즈캔슬링 바이럴. 프리미엄 헤드폰. Sony Store 판매. ¥49,500."),
        ("BALMUDA The Toaster", "인스타에서 #BALMUDA 감성 토스터 바이럴. 일본 디자인 가전. Rakuten 판매. ¥27,940."),
    ],
    ("JP", "food"): [
        ("Japanese Cheesecake 2-ingredient", "틱톡에서 #JapaneseCheesecake 그릭요거트+비스코프 2재료 레시피 글로벌 바이럴. 카페 판매. ¥580."),
        ("コグマパン(고구마빵)", "틱톡에서 #コグマパン ASMR 바이럴. Yahoo 2026 트렌드 예측 선정. Amazon Japan 판매. ¥3,240."),
        ("Matcha KitKat Limited", "틱톡/인스타에서 #抹茶キットカット 한정판 바이럴. 관광 선물 인기. Amazon Japan 판매. ¥1,080."),
        ("ROYCE Nama Chocolate", "인스타에서 #ROYCE 생초콜릿 ASMR 먹방 바이럴. 프리미엄 선물. ROYCE 판매. ¥1,166."),
        ("Lawson Uchi Cafe Sweets", "틱톡에서 #ローソン 편의점 디저트 신상 리뷰 바이럴. Lawson 판매. ¥350."),
        ("AGF Blendy Cafe Latte Sticks", "인스타에서 #AGF 홈카페 바이럴. 간편 카페라떼. Amazon Japan 판매. ¥698."),
    ],
    ("JP", "brands"): [
        ("ちいかわ", "틱톡/인스타에서 #ちいかわ 캐릭터 IP 바이럴. 굿즈/콜라보 트렌드. 전국 매장 판매. ¥1,980."),
        ("fwee", "일본에서 K-뷰티 1위 브랜드. 틱톡에서 #fwee 바이럴. Amazon Japan 판매. ¥2,200."),
        ("CLIO", "틱톡에서 #CLIO K-뷰티 파운데이션 일본 바이럴. Amazon Japan 판매. ¥2,640."),
        ("UNIQLO", "틱톡에서 #ユニクロ 가성비 코디 바이럴. 글로벌 베이직 브랜드. UNIQLO 판매. ¥2,990."),
        ("Nintendo", "틱톡에서 #Nintendo Switch2 기대감 바이럴. 게임 문화 아이콘. Nintendo Store 판매. ¥39,980."),
        ("Sanrio", "인스타에서 #サンリオ 시나모롤/쿠로미 캐릭터 굿즈 바이럴. Sanrio 판매. ¥2,200."),
    ],

    # ==================== CN (중국) ====================
    ("CN", "fashion"): [
        ("新中式 (Neo-Chinese Style) Dress", "Douyin에서 #新中式 4만 포스트. 전통 한복 요소 현대 패션 접목 바이럴. Taobao 판매. ¥299."),
        ("Guochao(国潮) Sneakers", "Douyin에서 #国潮 중국풍 스니커즈 바이럴. 애국 소비 트렌드. Li Ning 판매. ¥599."),
        ("Li Ning 국풍 운동화", "Douyin에서 #李宁 국풍 운동화 바이럴. 중국 스포츠 트렌드. JD.com 판매. ¥799."),
        ("Anta KT8 Basketball Shoes", "Douyin에서 #安踏 KT8 농구화 바이럴. 중국 스포츠 브랜드 부상. Tmall 판매. ¥899."),
        ("Bosideng Down Jacket", "Douyin에서 #波司登 패딩 바이럴. 중국 다운 브랜드 대표. JD.com 판매. ¥1,299."),
        ("Feiyue Canvas Sneakers", "Douyin/틱톡에서 #飞跃 중국 캔버스 스니커즈 해외 바이럴. 레트로 트렌드. Taobao 판매. ¥99."),
        ("SHEIN Summer Collection", "틱톡에서 #SHEIN 중국 발 패스트패션 바이럴. 글로벌 트렌드. SHEIN 판매. ¥79."),
    ],
    ("CN", "products"): [
        ("MissWiss Lifting Yoga Pants", "Douyin에서 #MissWiss 리프팅 요가 팬츠 GMV 1.3억위안 돌파 바이럴. Douyin Shop 판매. ¥139."),
        ("Micro-EV (미니 전기차)", "Douyin에서 #微型电动车 미니 전기차 바이럴. 도시 이동 혁명. Pinduoduo 판매. ¥29,800."),
        ("Huawei Mate 70 Pro", "Douyin에서 #华为 메이트70 프로 언박싱 바이럴. 중국 프리미엄 폰. Huawei 판매. ¥6,999."),
        ("DJI Mini 4 Pro Drone", "Douyin/틱톡에서 #DJI 미니4 드론 바이럴. 세계 1위 드론. DJI Store 판매. ¥4,788."),
        ("Dreame L20 Ultra Robot Vacuum", "Douyin에서 #追觅 AI 로봇청소기 바이럴. 스마트홈. Tmall 판매. ¥4,299."),
        ("Anker GaN Charger", "Douyin에서 #安克 GaN 충전기 바이럴. 여행 필수 가젯. JD.com 판매. ¥168."),
    ],
    ("CN", "food"): [
        ("酱香拿铁 (마오타이+라떼)", "Douyin에서 #酱香拿铁 마오타이+Luckin Coffee 콜라보 라떼 바이럴. Luckin Coffee 판매. ¥38."),
        ("Molecular Gastronomy Fusion", "Douyin에서 #分子料理 분자 요리 퓨전 트렌드 바이럴. 하이테크 요리. 레스토랑 판매. ¥128."),
        ("螺蛳粉 Liuzhou Snail Noodles", "Douyin에서 #螺蛳粉 류저우 달팽이국수 먹방 바이럴. Taobao 판매. ¥12.90."),
        ("三只松鼠 Nuts Gift Box", "Douyin 라이브커머스에서 #三只松鼠 견과 선물세트 바이럴. Tmall 판매. ¥99."),
        ("瑞幸 Coconut Latte Powder", "Douyin에서 #瑞幸 코코넛라떼 파우더 바이럴. 중국 카페 트렌드. Tmall 판매. ¥59.90."),
        ("良品铺子 Dried Meat Floss Cake", "Douyin에서 #良品铺子 육송병 바이럴. 중국 전통 간식. JD.com 판매. ¥19.90."),
    ],
    ("CN", "brands"): [
        ("Kans (韩束)", "Douyin에서 #韩束 중국 국산 뷰티 바이럴. 로컬 스킨케어 대표. Tmall 판매. ¥129."),
        ("Proya (珀莱雅)", "Douyin에서 #珀莱雅 중국 국산 화장품 바이럴. 가성비 스킨케어. JD.com 판매. ¥169."),
        ("Funny Elves (花知晓)", "틱톡에서 #花知晓 중국 색조 브랜드 바이럴. 판타지 메이크업. Taobao 판매. ¥79."),
        ("Luckin Coffee", "Douyin에서 #瑞幸 중국 카페 바이럴. 스타벅스 추월. Luckin 판매. ¥19."),
        ("BYD", "Douyin에서 #比亚迪 중국 EV 바이럴. 전기차 세계 1위. BYD 판매. ¥108,000."),
        ("SHEIN", "틱톡에서 #SHEIN 글로벌 패스트패션 바이럴. 중국 발 트렌드. SHEIN 판매. ¥79."),
    ],

    # ==================== US (미국) ====================
    ("US", "fashion"): [
        ("Quiet Luxury Blazer", "틱톡에서 #QuietLuxury 로고 없는 고급 블레이저 바이럴. 미니멀 럭셔리 트렌드. Nordstrom 판매. $189."),
        ("Y2K Revival Cargo Pants", "틱톡에서 #Y2K 카고팬츠 리바이벌 바이럴. 2000년대 레트로 트렌드. ASOS 판매. $49."),
        ("Oversized Hoodie Dress", "틱톡에서 #OversizedHoodie 원피스처럼 입는 후디 바이럴. Amazon 판매. $35."),
        ("Canvas Tote Bag", "인스타에서 #ToteBag 캔버스 토트백 에코 트렌드 바이럴. Etsy 판매. $28."),
        ("Adidas Samba OG", "틱톡에서 #Samba 20억뷰 레트로 스니커즈 바이럴. Adidas.com 판매. $100."),
        ("UGG Tazz Platform Slipper", "틱톡에서 #UGGTazz 6억뷰 겨울 스트릿 필수템 바이럴. Amazon 판매. $130."),
        ("Nike Dunk Low Panda", "틱톡/인스타에서 가장 많이 보이는 스니커즈. #NikeDunk 15억뷰. Nike.com 판매. $115."),
    ],
    ("US", "products"): [
        ("Galaxy Projector", "틱톡에서 #GalaxyProjector bedroom glow-up 영상으로 1만개+ 주문 바이럴. Amazon 판매. $15."),
        ("LED Light Therapy Mask", "틱톡 뷰티테크 트렌드 #LEDMask 여드름/주름 관리 바이럴. Amazon 판매. $35."),
        ("Portable Mini Projector", "틱톡에서 #MiniProjector 손바닥 크기 무선 프로젝터 바이럴. Amazon 판매. $69."),
        ("Portable Blender Cup", "틱톡에서 #PortableBlender USB 충전 블렌더 바이럴. 스무디 온더고. Amazon 판매. $24."),
        ("Sunset Projection Lamp", "틱톡에서 #SunsetLamp 감성 조명 인테리어 바이럴. 인스타 감성 필수. Amazon 판매. $12."),
        ("Stanley Quencher H2.0 Tumbler", "틱톡에서 #StanleyTumbler 30억뷰 돌파. 인스타 #WaterTok 트렌드 견인. Target 판매. $45."),
        ("Mini Karaoke Microphone", "틱톡에서 #MiniKaraoke 미니 노래방 마이크 바이럴. 파티 필수템. Amazon 판매. $19."),
    ],
    ("US", "food"): [
        ("Crumbl Cookies", "틱톡에서 #CrumblCookies 매주 신메뉴 리뷰 바이럴. 8억뷰. Crumbl 판매. $4.50."),
        ("Pickle Dip (Cream Cheese+Dill)", "틱톡에서 #PickleDip 크림치즈+딜피클 디핑 레시피 바이럴. Walmart 판매. $5.99."),
        ("Pistachio Everything", "틱톡에서 #PistachioEverything 피스타치오 디저트/라떼/케이크 트렌드 바이럴. Trader Joe''s 판매. $8.99."),
        ("Dubai Chocolate Bar", "틱톡에서 #DubaiChocolate 15억뷰. 피스타치오 카다이프 초콜릿 ASMR 바이럴. Amazon 판매. $24.99."),
        ("Poppi Prebiotic Soda", "틱톡에서 #Poppi 5억뷰. 장 건강 프리바이오틱 소다 바이럴. Target 판매. $2.49."),
        ("Boba Protein Shake", "틱톡에서 #BobaProtein 버블티 프로틴 쉐이크 바이럴. 피트니스 트렌드. Amazon 판매. $34.99."),
        ("Rolling Ice Cream Pan", "틱톡에서 #RollingIceCream 집에서 롤아이스크림 만들기 바이럴. Amazon 판매. $29.99."),
    ],
    ("US", "brands"): [
        ("Rhode (Hailey Bieber)", "인스타에서 #Rhode Hailey Bieber 스킨케어 브랜드 바이럴. 립케이스 품절대란. Rhode 판매. $29."),
        ("Stanley", "틱톡에서 #Stanley 30억뷰 돌파. 텀블러/드링크웨어 문화 아이콘. Stanley 판매. $45."),
        ("Fenty Beauty", "틱톡에서 #FentyBeauty 리한나 브랜드 바이럴. 인클루시브 뷰티. Sephora 판매. $42."),
        ("Dior", "틱톡에서 #Dior 립글로우/새들백 바이럴. 럭셔리 베스트셀러. Dior 판매. $39."),
        ("Apple", "틱톡/인스타에서 #Apple 제품 언박싱 매일 바이럴. Apple Store 판매. $999."),
        ("Nike", "틱톡에서 #Nike 50억뷰 이상. 덩크/삼바 스니커즈 바이럴 지속. Nike.com 판매. $120."),
    ],

    # ==================== GB (영국) ====================
    ("GB", "fashion"): [
        ("Quiet Luxury Thrifted Blazer", "틱톡에서 #QuietLuxury 자선가게 블레이저 리스타일링 바이럴. 영국 스리프팅 문화. Vinted UK 판매. £25."),
        ("Greggs x Primark Collab Hoodie", "틱톡에서 #GreggsxPrimark 콜라보 후디 바이럴. 영국 하이스트리트 문화. Primark 판매. £15."),
        ("Dr. Martens 1460 Boots", "틱톡에서 #DrMartens 스타일링 바이럴. 영국 클래식 부츠 아이콘. Dr. Martens 판매. £169."),
        ("The North Face Nuptse Jacket", "틱톡/인스타에서 #NorthFace 눕시 패딩 바이럴. 겨울 필수. JD Sports 판매. £280."),
        ("Primark Seamless Leggings", "틱톡에서 #Primark £8 레깅스 룰루레몬 대안으로 바이럴. Primark 판매. £8."),
        ("Barbour Bedale Jacket", "인스타에서 #Barbour 영국 클래식 왁스 재킷 바이럴. 컨트리 스타일. John Lewis 판매. £229."),
    ],
    ("GB", "products"): [
        ("Pre-owned Luxury Handbag", "틱톡에서 #PreownedLuxury 중고 명품 가방 바이럴. 지속가능 럭셔리 트렌드. Vestiaire Collective 판매. £450."),
        ("Steam Mop Cleaner", "틱톡에서 #SteamMop 스팀 청소 바이럴. 화학세제 없는 클리닝. Amazon UK 판매. £79."),
        ("Cordless Blender", "틱톡에서 #CordlessBlender 무선 블렌더 바이럴. 스무디 온더고. Amazon UK 판매. £29."),
        ("Ninja Creami Ice Cream Maker", "틱톡에서 #NinjaCreami 홈메이드 아이스크림 바이럴. 4억뷰. Amazon UK 판매. £179."),
        ("Charlotte Tilbury Pillow Talk Lipstick", "틱톡에서 #PillowTalk 립스틱 바이럴. 영국 뷰티 아이콘. Boots 판매. £26."),
        ("Shark FlexStyle Air Styler", "틱톡에서 다이슨 에어랩 대안으로 #SharkFlexStyle 바이럴. Argos 판매. £299."),
    ],
    ("GB", "food"): [
        ("Biscoff Everything", "틱톡에서 #BiscoffEverything 비스코프 스프레드/케이크/라떼 카페 디저트 바이럴. Sainsbury''s 판매. £2.85."),
        ("Japanese Cheesecake 2-ingredient", "틱톡에서 #JapaneseCheesecake 그릭요거트+비스코프 레시피 바이럴. 카페 판매. £4.50."),
        ("Dubai Chocolate Bar", "틱톡에서 #DubaiChocolate 피스타치오 초콜릿 ASMR 바이럴. 품절 대란. Amazon UK 판매. £19.99."),
        ("Grenade Protein Bar", "틱톡 #Grenade 프로틴바 피트니스 바이럴. 영국 헬스 트렌드. Tesco 판매. £2.99."),
        ("Cadbury Dairy Milk Oreo", "인스타에서 #Cadbury 한정판 초콜릿 바이럴. 영국 국민 과자. Tesco 판매. £1.50."),
        ("Poppi Prebiotic Soda", "틱톡에서 #Poppi 건강 소다 바이럴. Tesco 입점. Tesco 판매. £2.50."),
    ],
    ("GB", "brands"): [
        ("Greggs", "틱톡에서 #Greggs 영국 베이커리 콜라보 바이럴. 국민 브랜드. Greggs 판매. £2.50."),
        ("Primark", "틱톡에서 #PrimarkHaul 가성비 패션 하울 바이럴. 영국 하이스트리트. Primark 판매. £8."),
        ("M&S (Marks & Spencer)", "틱톡에서 #M&S 푸드홀 신상 바이럴. 영국 국민 리테일. M&S 판매. £12."),
        ("Dyson", "틱톡에서 #Dyson 에어랩/청소기 바이럴. 영국 프리미엄 테크. Dyson UK 판매. £479."),
        ("Boots", "틱톡에서 #BootsHaul 뷰티 하울 바이럴. 영국 드럭스토어. Boots 판매. £24.95."),
        ("JD Sports", "틱톡에서 #JDSports 스니커즈 하울 바이럴. 영국 스포츠 리테일. JD Sports 판매. £89."),
    ],

    # ==================== FR (프랑스) ====================
    ("FR", "fashion"): [
        ("Jacquemus Le Bambino Mini Bag", "인스타에서 #Jacquemus 르 밤비노 미니백 바이럴. 남프랑스 감성. Jacquemus 판매. €540."),
        ("Quiet Luxury Trench Coat", "인스타에서 #QuietLuxury 프렌치 트렌치코트 바이럴. 미니멀 럭셔리. Sezane 판매. €295."),
        ("Sezane La Blouse Elisa", "인스타에서 #Sezane 파리지엔 블라우스 바이럴. 프렌치 시크 대표. Sezane 판매. €125."),
        ("AMI Paris Heart Tee", "틱톡에서 #AMIParis 하트 로고 티 바이럴. 캐주얼 럭셔리. AMI 판매. €195."),
        ("Veja V-10 Sneakers", "틱톡에서 #Veja 지속가능 스니커즈 바이럴. 프랑스 에코 패션. Veja 판매. €160."),
        ("Rouje Paris Wrap Dress", "인스타에서 #Rouje 랩 드레스 파리지엔 스타일 바이럴. Rouje 판매. €175."),
    ],
    ("FR", "products"): [
        ("Picard Surgeles Gourmet Frozen", "틱톡에서 #Picard 프리미엄 냉동식품 바이럴. 프랑스 미식 냉동 트렌드. Picard 판매. €6.50."),
        ("La Roche-Posay Anthelios SPF50", "틱톡에서 #LaRochePosay 더마 선크림 바이럴. 유럽 약국 뷰티. Sephora FR 판매. €15.90."),
        ("Nuxe Huile Prodigieuse", "인스타에서 #Nuxe 프로디쥬 오일 프렌치 뷰티 바이럴. 멀티유즈 오일. Nuxe 판매. €30.50."),
        ("Le Creuset Cocotte", "인스타에서 #LeCreuset 코코트 주방 바이럴. 프리미엄 쿡웨어. Le Creuset 판매. €279."),
        ("Bioderma Sensibio H2O", "틱톡에서 #Bioderma 미셀라 워터 바이럴. 프랑스 클렌징 필수. Amazon.fr 판매. €13.90."),
        ("Dyson Supersonic HD08", "틱톡에서 #Dyson 프리미엄 드라이어 바이럴. 뷰티 가전. Fnac 판매. €399."),
    ],
    ("FR", "food"): [
        ("Croissant Pistachio", "인스타에서 #CroissantPistache 피스타치오 크루아상 바이럴. 파리 베이커리 트렌드. 베이커리 판매. €4.50."),
        ("Molecular Gastronomy Dessert", "인스타에서 #Gastronomie 분자 요리 디저트 바이럴. 프렌치 하이엔드 디저트. 레스토랑 판매. €18."),
        ("Pierre Herme Macarons", "인스타에서 #PierreHerme 마카롱 ASMR 바이럴. 파리 프리미엄 디저트. Pierre Herme 판매. €22."),
        ("Kusmi Tea Paris Detox", "인스타에서 #KusmiTea 디톡스 티 바이럴. 프렌치 웰빙. Kusmi 판매. €16.90."),
        ("Bonne Maman Tartlets", "틱톡에서 #BonneMaman 타르트렛 바이럴. 장인 제과. Monoprix 판매. €4.29."),
        ("La Maison du Chocolat Ganache", "인스타에서 #LaMaisonDuChocolat 프리미엄 초콜릿 바이럴. La Maison 판매. €26."),
    ],
    ("FR", "brands"): [
        ("Jacquemus", "인스타에서 #Jacquemus 르 밤비노/르 시키토 바이럴. 남프랑스 럭셔리. Jacquemus 판매. €540."),
        ("Picard", "틱톡에서 #Picard 프리미엄 냉동식품 바이럴. 프랑스 미식 혁신. Picard 판매. €6.50."),
        ("Camaieu (Revival)", "틱톡에서 #Camaieu 부활 리런칭 바이럴. 프랑스 패션 브랜드 복귀. Camaieu 판매. €29."),
        ("Sephora", "틱톡에서 #SephoraHaul 뷰티 하울 바이럴. 글로벌 뷰티 리테일. Sephora 판매. €3.99."),
        ("Decathlon", "틱톡에서 #Decathlon 가성비 스포츠용품 바이럴. 프랑스 스포츠 브랜드. Decathlon 판매. €19.99."),
        ("Louis Vuitton", "인스타에서 #LouisVuitton 럭셔리 바이럴. 세계 최고 럭셔리 브랜드. Louis Vuitton 판매. €1,960."),
    ],

    # ==================== DE (독일) ====================
    ("DE", "fashion"): [
        ("Streetcore Oversized Jacket", "틱톡에서 #Streetcore 독일 스트릿코어 재킷 바이럴. 유틸리티 패션. Zalando 판매. €89."),
        ("Sustainable Fashion Organic Tee", "틱톡에서 #SustainableFashion 독일 지속가능 패션 바이럴. 에코 트렌드. Armedangels 판매. €39.90."),
        ("Adidas Samba OG", "틱톡에서 #Samba 독일 오리진 스니커즈 바이럴. 레트로 트렌드. Zalando 판매. €100."),
        ("Birkenstock Boston Clog", "틱톡에서 #BirkenstockBoston 클로그 바이럴. 사계절 슈즈 트렌드. Birkenstock 판매. €120."),
        ("BOSS Hugo Boss Polo", "인스타에서 #BOSS 폴로 독일 프리미엄 바이럴. 비즈니스 캐주얼. BOSS 판매. €98."),
        ("Jack Wolfskin Outdoor Jacket", "인스타에서 #JackWolfskin 독일 아웃도어 바이럴. 기능성 재킷. Amazon.de 판매. €149."),
    ],
    ("DE", "products"): [
        ("Cordless Vacuum Cleaner", "틱톡에서 #CordlessVacuum 무선 청소기 바이럴. 독일 가전 트렌드. Amazon.de 판매. €199."),
        ("Kitchen Gadget Air Fryer", "틱톡에서 #AirFryer 에어프라이어 레시피 바이럴. 건강 조리 트렌드. MediaMarkt 판매. €89."),
        ("Thermomix TM7", "틱톡에서 #Thermomix 스마트 쿠커 레시피 바이럴. 독일 주방 혁신. Thermomix 판매. €1,499."),
        ("dm Alverde Naturkosmetik Set", "틱톡에서 #dmHaul 가성비 자연 화장품 바이럴. 독일 클린뷰티. dm 판매. €5.95."),
        ("Braun Series 9 Pro", "틱톡에서 #Braun 프리미엄 면도기 바이럴. 독일 그루밍. Amazon.de 판매. €299."),
        ("NIVEA Q10 Anti-Wrinkle Cream", "틱톡에서 #NIVEA 가성비 안티에이징 바이럴. 독일 국민 뷰티. dm 판매. €9.99."),
    ],
    ("DE", "food"): [
        ("Doner Kebab Gourmet", "틱톡에서 #DönerKebab 독일 되너 고급화 트렌드 바이럴. 아티장 되너 레스토랑. 매장 판매. €8.50."),
        ("Pistachio Desserts", "틱톡에서 #PistazienDessert 피스타치오 디저트 바이럴. 베이커리 트렌드. 베이커리 판매. €5.90."),
        ("Ritter Sport Schokolade", "틱톡에서 #RitterSport 정사각 초콜릿 바이럴. 독일 대표 초콜릿. dm 판매. €1.49."),
        ("Haribo Goldbaren", "틱톡에서 #Haribo 젤리베어 바이럴. 세계적 독일 간식. REWE 판매. €1.09."),
        ("Brezel Pretzel", "인스타에서 #Brezel 독일 전통 빵 먹방 바이럴. 옥토버페스트 간식. 베이커리 판매. €1.50."),
        ("Alnatura Bio-Musli", "틱톡에서 #Alnatura 유기농 뮤즐리 건강 아침 바이럴. dm 판매. €3.49."),
    ],
    ("DE", "brands"): [
        ("Lidl", "틱톡에서 #Lidl 콜라보 한정판 패션 바이럴. 독일 디스카운터 문화. Lidl 판매. €12.99."),
        ("Aldi", "틱톡에서 #Aldi 한정판 콜라보 상품 바이럴. 독일 디스카운터 아이콘. Aldi 판매. €9.99."),
        ("Adidas", "틱톡에서 #Adidas 삼바/울트라부스트 바이럴. 독일 스포츠 아이콘. Adidas.de 판매. €100."),
        ("Birkenstock", "틱톡에서 #Birkenstock 보스턴 클로그 바이럴. 독일 편안함의 상징. Birkenstock 판매. €120."),
        ("dm Drogerie", "틱톡에서 #dmHaul 가성비 뷰티/생활 바이럴. 독일 드럭스토어. dm 판매. €5.95."),
        ("NIVEA", "틱톡에서 #NIVEA 블루캔 크림 바이럴. 독일 국민 뷰티. dm 판매. €2.49."),
    ],

    # ==================== IT (이탈리아) ====================
    ("IT", "fashion"): [
        ("Euro 2026 Fan Merchandise", "인스타에서 #Euro2026 이탈리아 팬 머천다이즈 바이럴. 축구 문화. Amazon.it 판매. €35."),
        ("Made in Italy Revival Blazer", "인스타에서 #MadeInItaly 이탈리안 블레이저 리바이벌 바이럴. 장인 패션. Yoox 판매. €189."),
        ("Gucci Bamboo 1947 Mini", "인스타에서 #Gucci 뱀부 미니백 바이럴. 이탈리안 럭셔리. Gucci 판매. €2,980."),
        ("Superga 2750 Classic", "틱톡에서 #Superga 이탈리안 캔버스 스니커즈 바이럴. 클래식 슈즈. Amazon.it 판매. €65."),
        ("Calzedonia Summer Tights", "틱톡에서 #Calzedonia 이탈리안 타이츠 바이럴. 패션 레그웨어. Calzedonia 판매. €12."),
        ("Max Mara Teddy Coat", "인스타에서 #MaxMara 테디 코트 바이럴. 이탈리안 아이코닉 코트. Max Mara 판매. €3,090."),
    ],
    ("IT", "products"): [
        ("Compact Espresso Machine", "틱톡에서 #EspressoMachine 컴팩트 에스프레소 머신 바이럴. 이탈리안 커피 문화. Amazon.it 판매. €89."),
        ("Beauty Gadget LED Mask", "틱톡에서 #LEDMask 뷰티 디바이스 바이럴. 이탈리안 스킨케어. Amazon.it 판매. €49."),
        ("Bialetti Moka Express", "인스타에서 #Bialetti 모카포트 홈카페 바이럴. 이탈리안 커피 아이콘. Amazon.it 판매. €32."),
        ("Kiko Milano Lip Gloss", "틱톡에서 #KikoMilano 가성비 립글로스 바이럴. 이탈리안 뷰티. Kiko 판매. €6.99."),
        ("De''Longhi Magnifica S", "틱톡에서 #DeLonghi 풀오토 커피머신 바이럴. 이탈리안 홈카페. Amazon.it 판매. €349."),
        ("Smeg Retro Toaster", "인스타에서 #Smeg 레트로 토스터 바이럴. 이탈리안 디자인 가전. Smeg 판매. €149."),
    ],
    ("IT", "food"): [
        ("Pistachio di Bronte Dessert", "인스타에서 #PistacchioDiBronte 피스타치오 디저트 바이럴. 시칠리아 특산물. 파스티체리아 판매. €8."),
        ("Aperol Spritz Variations", "인스타에서 #AperolSpritz 바리에이션 칵테일 바이럴. 이탈리안 아페리티보. Bar 판매. €7."),
        ("Tiramisù Premium", "틱톡에서 #Tiramisu 프리미엄 티라미수 ASMR 바이럴. 카페 판매. €6."),
        ("Eataly Artisan Pasta", "인스타에서 #Eataly 장인 파스타 바이럴. 이탈리안 미식. Eataly 판매. €5.90."),
        ("Ferrero Rocher Collection", "틱톡에서 #FerreroRocher 프리미엄 초콜릿 바이럴. 선물 트렌드. Amazon.it 판매. €12.99."),
        ("Limoncello Artisan", "인스타에서 #Limoncello 아말피 레몬첼로 바이럴. 이탈리안 식후주. 매장 판매. €15."),
    ],
    ("IT", "brands"): [
        ("Lavazza", "인스타에서 #Lavazza 이탈리안 커피 바이럴. 프리미엄 커피 브랜드. Lavazza 판매. €7.90."),
        ("Aperol", "인스타에서 #Aperol 아페리티보 문화 바이럴. 이탈리안 칵테일 아이콘. Bar 판매. €14."),
        ("Gucci", "인스타에서 #Gucci 이탈리안 럭셔리 바이럴. 밀라노 패션. Gucci 판매. €890."),
        ("Bialetti", "인스타에서 #Bialetti 모카포트 커피 문화 바이럴. 이탈리안 아이콘. Amazon.it 판매. €32."),
        ("Eataly", "인스타에서 #Eataly 이탈리안 미식 마켓 바이럴. 프리미엄 식료품. Eataly 판매. €15."),
        ("Kiko Milano", "틱톡에서 #KikoMilano 가성비 뷰티 바이럴. 이탈리안 코스메틱. Kiko 판매. €6.99."),
    ],

    # ==================== ES (스페인) ====================
    ("ES", "fashion"): [
        ("Boho-Chic Festival Wear", "틱톡에서 #BohoChic 페스티벌 웨어 바이럴. 스페인 축제 패션. Zara.com 판매. €39.95."),
        ("Zara New Collection Dress", "인스타에서 #ZaraNewIn 신상 드레스 바이럴. 스페인 패스트패션 아이콘. Zara 판매. €49.95."),
        ("Mango Linen Blazer", "인스타에서 #Mango 린넨 블레이저 여름 바이럴. 지중해 스타일. Mango 판매. €69.99."),
        ("Desigual Print Top", "틱톡에서 #Desigual 컬러풀 프린트 탑 바이럴. 스페인 아이덴티티. Desigual 판매. €59.95."),
        ("Castaner Espadrilles", "인스타에서 #Castaner 에스파드리유 바이럴. 스페인 전통 슈즈. Castaner 판매. €110."),
        ("Pull&Bear Wide Leg Jeans", "틱톡에서 #PullBear 와이드레그진 바이럴. 스페인 영캐주얼. Pull&Bear 판매. €29.99."),
    ],
    ("ES", "products"): [
        ("Festival 360-degree Camera", "틱톡에서 #360Camera 페스티벌 360도 카메라 바이럴. 축제 촬영 가젯. Amazon.es 판매. €49."),
        ("Rituals of Sakura Body Cream", "틱톡에서 #Rituals 바디크림 바이럴. 유럽 웰니스. Rituals 판매. €12.50."),
        ("Freshly Cosmetics Face Serum", "틱톡에서 #FreshlyCosmetics 스페인 내추럴 뷰티 바이럴. Freshly 판매. €29.95."),
        ("Cecotec Conga Robot Vacuum", "틱톡에서 #Cecotec 스페인 가성비 로봇청소기 바이럴. El Corte Ingles 판매. €249."),
        ("Foreo Luna 4", "인스타에서 #Foreo 세안 디바이스 바이럴. 스킨케어 가젯. Sephora ES 판매. €199."),
        ("Xiaomi Mi Band 9", "틱톡에서 #MiBand 가성비 스마트밴드 바이럴. Amazon.es 판매. €39.99."),
    ],
    ("ES", "food"): [
        ("Churros Gourmet Variations", "틱톡에서 #ChurrosGourmet 고급 추로스 바리에이션 바이럴. 초콜릿/피스타치오 토핑. 추레리아 판매. €5."),
        ("Croquetas Fusion", "틱톡에서 #CroquetasFusion 크로케타 퓨전 바이럴. 하몽/치즈/트러플 크로케타. 바 판매. €2.50."),
        ("Turron Artisan Premium", "인스타에서 #Turron 프리미엄 투론 바이럴. 스페인 전통 과자. El Corte Ingles 판매. €12."),
        ("Mercadona Hacendado Hummus", "틱톡에서 #Mercadona 후무스 바이럴. 스페인 PB상품 트렌드. Mercadona 판매. €1.50."),
        ("Sangria Premium Bottled", "인스타에서 #Sangria 프리미엄 병 상그리아 바이럴. 홈파티. El Corte Ingles 판매. €8."),
        ("Patatas Bravas Gourmet", "틱톡에서 #PatasBravas 고급 파타타스 브라바스 바이럴. 바르셀로나 타파스. 바 판매. €6."),
    ],
    ("ES", "brands"): [
        ("Zara", "인스타에서 #Zara 글로벌 패스트패션 바이럴. 스페인 패션 아이콘. Zara 판매. €49.95."),
        ("Mercadona", "틱톡에서 #Mercadona PB 상품 하울 바이럴. 스페인 슈퍼마켓 문화. Mercadona 판매. €1.50."),
        ("Mango", "인스타에서 #Mango 프리미엄 패션 바이럴. 스페인 글로벌 패션. Mango 판매. €69.99."),
        ("Seat/Cupra", "틱톡에서 #Cupra 스페인 자동차 바이럴. 스포티 EV. Cupra 판매. €35,000."),
        ("Desigual", "틱톡에서 #Desigual 컬러풀 패션 바이럴. 스페인 아이덴티티. Desigual 판매. €59.95."),
        ("El Corte Ingles", "인스타에서 #ElCorteIngles 스페인 백화점 바이럴. 프리미엄 리테일. El Corte Ingles 판매. €45."),
    ],

    # ==================== TH (태국) ====================
    ("TH", "fashion"): [
        ("K-fashion Streetwear Set", "틱톡에서 #KFashion 한국 영향 스트릿웨어 세트 바이럴. 태국 젊은층 인기. Shopee TH 판매. ฿890."),
        ("CPS Chaps Polo Shirt", "틱톡에서 #CPS 태국 캐주얼 폴로 바이럴. 로컬 브랜드. CPS 판매. ฿890."),
        ("Carnival Sneaker Collab", "인스타에서 #CarnivalBKK 스니커즈 콜라보 바이럴. 태국 스니커즈 문화. Carnival 판매. ฿4,990."),
        ("UNIQLO AIRism Thailand", "틱톡에서 #UNIQLO 에어리즘 태국 더위 필수 바이럴. Uniqlo TH 판매. ฿590."),
        ("Pomelo Fashion Dress", "인스타에서 #Pomelo 태국 온라인 패션 바이럴. 동남아 트렌드. Pomelo 판매. ฿1,290."),
        ("Jaspal Contemporary", "인스타에서 #Jaspal 태국 프리미엄 패션 바이럴. 방콕 디자이너. Jaspal 판매. ฿1,990."),
    ],
    ("TH", "products"): [
        ("Body Creams & Lotions", "틱톡에서 #BodyCream 226K 좋아요 바이럴. 태국 바디케어 트렌드. Shopee TH 판매. ฿199."),
        ("Mistine Sunscreen SPF50", "틱톡에서 #Mistine 태국 선크림 바이럴. 동남아 뷰티 인기. Lazada TH 판매. ฿299."),
        ("Beauty Buffet Ginseng Serum", "틱톡에서 #BeautyBuffet 태국 가성비 뷰티 바이럴. Shopee TH 판매. ฿199."),
        ("Xiaomi Air Purifier 4", "틱톡에서 #Xiaomi 방콕 미세먼지 대책 바이럴. Lazada TH 판매. ฿5,490."),
        ("OPPO Reno 12 Pro", "틱톡에서 #OPPO 태국 인기폰 바이럴. 셀피 스마트폰. Shopee TH 판매. ฿15,999."),
        ("Samsung Galaxy Tab S9 FE", "틱톡에서 #Samsung 태국 학생 태블릿 바이럴. JD Central 판매. ฿13,990."),
    ],
    ("TH", "food"): [
        ("Tom Yum Sous-Vide", "틱톡에서 #TomYum 수비드 조리 하이테크 톰얌 바이럴. 전통+하이테크 퓨전. 레스토랑 판매. ฿289."),
        ("Mango Sticky Rice Premium", "인스타에서 #MangoStickyRice 프리미엄 망고 찹쌀밥 바이럴. 고급 디저트 버전. 카페 판매. ฿199."),
        ("Mama Tom Yum Ramen", "틱톡에서 #Mama 태국 국민 라면 먹방 바이럴. 7-Eleven TH 판매. ฿7."),
        ("Bento Squid Snack", "틱톡에서 #Bento 오징어 스낵 ASMR 바이럴. 태국 간식 대표. 7-Eleven TH 판매. ฿10."),
        ("Doi Kham Dried Mango", "인스타에서 #DoiKham 건망고 태국 왕실 브랜드 바이럴. Central Food Hall 판매. ฿85."),
        ("After You Kakigori (Shaved Ice)", "인스타에서 #AfterYou 태국 디저트 카페 카키고리 바이럴. After You 판매. ฿289."),
    ],
    ("TH", "brands"): [
        ("Mistine", "틱톡에서 #Mistine 태국 뷰티 대표 바이럴. 선크림/메이크업. Shopee TH 판매. ฿299."),
        ("4U2", "틱톡에서 #4U2 태국 가성비 색조 브랜드 바이럴. Shopee TH 판매. ฿199."),
        ("CP All (7-Eleven TH)", "틱톡에서 #7ElevenTH 한정 상품 리뷰 바이럴. 태국 편의점 문화. 7-Eleven TH 판매. ฿49."),
        ("Central Group", "인스타에서 #Central 태국 리테일 바이럴. 백화점 문화. Central 판매. ฿2,000."),
        ("Grab Thailand", "틱톡에서 #Grab 태국 슈퍼앱 바이럴. 배달/택시. Grab 판매. ฿0."),
        ("Pomelo Fashion", "인스타에서 #Pomelo 동남아 온라인 패션 바이럴. Pomelo 판매. ฿890."),
    ],

    # ==================== VN (베트남) ====================
    ("VN", "fashion"): [
        ("K-fashion Ao Dai Modern", "틱톡에서 #AoDaiModern 한국 패션 영향 모던 아오자이 바이럴. Shopee VN 판매. ₫350,000."),
        ("K-fashion Streetwear", "틱톡에서 #KFashion 한국 스트릿웨어 바이럴. 베트남 젊은층 인기. Shopee VN 판매. ₫250,000."),
        ("Local Designer Dress", "인스타에서 베트남 로컬 디자이너 드레스 바이럴. Tiki 판매. ₫450,000."),
        ("Vintage Denim Jacket", "틱톡에서 #VintageJean 빈티지 데님 재킷 바이럴. 베트남 빈티지 트렌드. Shopee VN 판매. ₫280,000."),
        ("Nike Vietnam Edition", "틱톡에서 #Nike 베트남 에디션 스니커즈 바이럴. Shopee VN 판매. ₫2,500,000."),
        ("Canifa Basic Collection", "틱톡에서 #Canifa 베트남 가성비 패션 바이럴. Canifa 판매. ₫199,000."),
    ],
    ("VN", "products"): [
        ("K-Beauty Skincare Set", "틱톡에서 #KBeauty 한국 스킨케어 세트 베트남 바이럴. Shopee VN 판매. ₫250,000."),
        ("LED Light Therapy Mask", "틱톡에서 #LEDMask 뷰티테크 바이럴. Lazada VN 판매. ₫490,000."),
        ("Xiaomi Redmi Note 13", "틱톡에서 #Xiaomi 가성비 폰 바이럴. Tiki 판매. ₫4,990,000."),
        ("Samsung Galaxy A55", "틱톡에서 #Samsung 가성비 스마트폰 바이럴. Shopee VN 판매. ₫8,990,000."),
        ("Cocoon Vietnam Skincare", "틱톡에서 #Cocoon 베트남 로컬 스킨케어 바이럴. Shopee VN 판매. ₫159,000."),
        ("Robot Vacuum Ecovacs", "틱톡에서 #Ecovacs 가성비 로봇청소기 바이럴. Lazada VN 판매. ₫5,990,000."),
    ],
    ("VN", "food"): [
        ("Banh Mi Fusion", "틱톡에서 #BanhMi 반미 퓨전 바이럴. 전통 반미+현대 재료. 매장 판매. ₫35,000."),
        ("Egg Coffee Premium", "인스타에서 #EggCoffee 프리미엄 에그커피 바이럴. 하노이 카페 문화. The Coffee House 판매. ₫45,000."),
        ("Pho Bo Premium", "인스타에서 #PhoBo 프리미엄 쌀국수 바이럴. 고급 쌀국수 트렌드. 레스토랑 판매. ₫65,000."),
        ("Che (Sweet Soup) Artisan", "틱톡에서 #ChéTruyền 전통 체 디저트 바이럴. 매장 판매. ₫30,000."),
        ("Vietnamese Coffee RTD", "틱톡에서 #CàPhêViệt RTD 커피 바이럴. 편의점 판매. ₫15,000."),
        ("Banh Trang Tron (Rice Paper)", "틱톡에서 #BánhTráng 라이스페이퍼 간식 ASMR 바이럴. 매장 판매. ₫20,000."),
    ],
    ("VN", "brands"): [
        ("VinFast", "틱톡에서 #VinFast 베트남 전기차 바이럴. 국산 EV 브랜드. VinFast 판매. ₫459,000,000."),
        ("The Coffee House", "인스타에서 #TheCoffeeHouse 베트남 카페 체인 바이럴. 에그커피 인기. The Coffee House 판매. ₫45,000."),
        ("Shopee Vietnam", "틱톡에서 #Shopee 베트남 이커머스 바이럴. 쇼핑 플랫폼. Shopee VN 판매. ₫0."),
        ("Trung Nguyen Coffee", "인스타에서 #TrungNguyen 베트남 커피 바이럴. 프리미엄 커피. Trung Nguyen 판매. ₫85,000."),
        ("Cocoon Vietnam", "틱톡에서 #Cocoon 베트남 내추럴 스킨케어 바이럴. Cocoon 판매. ₫159,000."),
        ("Canifa", "틱톡에서 #Canifa 베트남 가성비 패션 바이럴. Canifa 판매. ₫199,000."),
    ],

    # ==================== IN (인도) ====================
    ("IN", "fashion"): [
        ("Ethnic Fusion Wear", "틱톡에서 #EthnicFusion 전통+현대 퓨전 의상 바이럴. 인도 패션 혁명. Myntra 판매. ₹1,499."),
        ("Saree Draping Challenge Look", "인스타에서 #SareeDraping 사리 챌린지 스타일링 바이럴. 전통 재해석. Amazon India 판매. ₹2,499."),
        ("FabIndia Kurti Collection", "인스타에서 #FabIndia 현대식 쿠르티 바이럴. 인도 전통 패션 현대화. FabIndia 판매. ₹1,499."),
        ("Nike Air Force 1 India", "인스타에서 #AirForce1 인도 스니커즈 바이럴. 스트릿 패션. Amazon India 판매. ₹7,495."),
        ("Biba Anarkali Suit", "인스타에서 #Biba 전통 의상 바이럴. 축제 시즌 필수. Biba 판매. ₹2,499."),
        ("boAt Rockerz Smart Watch", "틱톡에서 #boAt 인도 스마트워치 바이럴. 가성비 웨어러블. Amazon India 판매. ₹1,999."),
    ],
    ("IN", "products"): [
        ("Affordable Smartphones (Realme)", "틱톡에서 #Realme 가성비 스마트폰 바이럴. 인도 인기폰. Flipkart 판매. ₹11,999."),
        ("Mamaearth Vitamin C Serum", "인스타에서 #Mamaearth 클린뷰티 바이럴. 인도 비건 뷰티. Amazon India 판매. ₹549."),
        ("boAt Airdopes 141", "틱톡에서 #boAt 인도 1위 이어버즈 바이럴. 가성비 오디오. Amazon India 판매. ₹1,299."),
        ("Mi Smart Band 9", "틱톡에서 #MiBand 가성비 피트니스 트래커 바이럴. Mi.com 판매. ₹2,999."),
        ("Plum Green Tea Face Wash", "틱톡에서 #PlumGreenTea 스킨케어 바이럴. 인도 클린뷰티. Amazon India 판매. ₹345."),
        ("Fire-Boltt Phoenix Ultra", "틱톡에서 #FireBoltt 인도 스마트워치 바이럴. 가성비 웨어러블. Flipkart 판매. ₹1,799."),
    ],
    ("IN", "food"): [
        ("Street Food Innovations", "틱톡에서 #StreetFood 인도 길거리 음식 혁신 바이럴. 퓨전 차트/도사. 매장 판매. ₹100."),
        ("Chai Variations", "틱톡에서 #ChaiVariations 차이 변형 레시피 바이럴. 마살라/아이스/버블 차이. 카페 판매. ₹60."),
        ("Haldiram''s Soan Papdi", "인스타에서 #Haldirams 인도 전통 과자 바이럴. 축제 필수 미타이. Amazon India 판매. ₹260."),
        ("Paper Boat Aam Panna", "틱톡에서 #PaperBoat 인도 전통 음료 바이럴. 향수 자극 마케팅. BigBasket 판매. ₹30."),
        ("Sleepy Owl Cold Brew", "틱톡에서 #SleepyOwl 콜드브루 바이럴. 인도 카페 트렌드. Amazon India 판매. ₹349."),
        ("Maggi Hot Heads", "틱톡에서 #MaggiHotHeads 매운맛 라면 챌린지 바이럴. BigBasket 판매. ₹40."),
    ],
    ("IN", "brands"): [
        ("Nykaa", "틱톡에서 #Nykaa 인도 뷰티 플랫폼 바이럴. K-뷰티 인도판. Nykaa 판매. ₹799."),
        ("Mamaearth", "인스타에서 #Mamaearth 클린뷰티 바이럴. 인도 내추럴 뷰티 유니콘. Amazon India 판매. ₹549."),
        ("Tata", "인스타에서 #Tata 인도 대기업 브랜드 바이럴. 글로벌 확장. Tata Cliq 판매. ₹4,999."),
        ("boAt", "틱톡에서 #boAt 인도 오디오 1위 바이럴. 가성비 이어버즈. Amazon India 판매. ₹1,499."),
        ("Amul", "인스타에서 #Amul 인도 유제품 아이콘 바이럴. 국민 브랜드. BigBasket 판매. ₹100."),
        ("Reliance Jio", "틱톡에서 #Jio 인도 통신 혁신 바이럴. 디지털 인디아. JioMart 판매. ₹6,499."),
    ],

    # ==================== TW (대만) ====================
    ("TW", "fashion"): [
        ("Japanese/Korean Streetwear", "틱톡에서 #JKFashion 일본/한국 영향 스트릿웨어 바이럴. Shopee TW 판매. NT$890."),
        ("Vintage Denim Jacket", "틱톡에서 빈티지 데님 재킷 바이럴. 대만 빈티지 트렌드. momo 판매. NT$990."),
        ("UNIQLO Taiwan Limited", "틱톡에서 #UNIQLO 대만 한정 컬렉션 바이럴. UNIQLO TW 판매. NT$590."),
        ("Local Designer Bag", "인스타에서 대만 로컬 디자이너 가방 바이럴. Pinkoi 판매. NT$1,290."),
        ("New Balance 550 TW", "인스타에서 #NB550 대만 스트릿 스냅 바이럴. ABC-Mart TW 판매. NT$3,280."),
        ("Night Market Fashion", "틱톡에서 #夜市穿搭 야시장 패션 아이템 바이럴. 야시장 판매. NT$390."),
    ],
    ("TW", "products"): [
        ("Bubble Tea Gadgets", "틱톡에서 #BubbleTea 버블티 만들기 가젯 바이럴. Shopee TW 판매. NT$490."),
        ("Tech Accessories", "틱톡에서 #TechGadget 테크 액세서리 바이럴. PChome 판매. NT$390."),
        ("Apple iPhone 16 TW", "틱톡에서 #iPhone16 대만 언박싱 바이럴. momo 판매. NT$35,900."),
        ("Samsung Galaxy Buds", "틱톡에서 #GalaxyBuds 이어버즈 바이럴. PChome 판매. NT$4,990."),
        ("Innisfree Green Tea Serum", "인스타에서 K-뷰티 대만 바이럴. Shopee TW 판매. NT$680."),
        ("Dyson Airwrap TW", "틱톡에서 #Dyson 대만 뷰티 가전 바이럴. momo 판매. NT$16,900."),
    ],
    ("TW", "food"): [
        ("Bubble Tea Innovations", "틱톡에서 #珍珠奶茶 버블티 신메뉴 바이럴. 대만 버블티 혁신. 매장 판매. NT$65."),
        ("滷味(Lu Wei) Gourmet", "인스타에서 #滷味 루웨이 고급화 바이럴. 대만 야시장 간식 프리미엄. 매장 판매. NT$120."),
        ("Pineapple Cake Premium", "인스타에서 #鳳梨酥 프리미엄 파인애플 케이크 바이럴. 대만 선물 대표. SunnyHills 판매. NT$420."),
        ("Taiwanese Castella Cake", "틱톡에서 #古早味蛋糕 대만 카스테라 ASMR 바이럴. 베이커리 판매. NT$180."),
        ("Iron Egg (鐵蛋)", "틱톡에서 #鐵蛋 대만 철란(철계란) 먹방 바이럴. 편의점 판매. NT$50."),
        ("Mango Shaved Ice", "인스타에서 #芒果冰 대만 망고빙수 바이럴. 여름 디저트. 매장 판매. NT$150."),
    ],
    ("TW", "brands"): [
        ("7-ELEVEN Taiwan", "틱톡에서 #7ELEVEN 대만 편의점 한정상품 바이럴. 7-ELEVEN TW 판매. NT$39."),
        ("FamilyMart Taiwan", "틱톡에서 #FamilyMart 대만 편의점 콜라보 바이럴. FamilyMart 판매. NT$45."),
        ("Shopee Taiwan", "틱톡에서 #Shopee 대만 이커머스 바이럴. Shopee TW 판매. NT$0."),
        ("ASUS", "틱톡에서 #ASUS 대만 테크 브랜드 바이럴. 노트북/스마트폰. ASUS Store 판매. NT$29,900."),
        ("SunnyHills", "인스타에서 #微熱山丘 파인애플 케이크 바이럴. 대만 프리미엄 선물. SunnyHills 판매. NT$420."),
        ("Giant Bicycles", "인스타에서 #Giant 대만 자전거 바이럴. 글로벌 자전거 브랜드. Giant 판매. NT$18,000."),
    ],

    # ==================== SG (싱가포르) ====================
    ("SG", "fashion"): [
        ("Smart Casual Linen Set", "인스타에서 싱가포르 스마트 캐주얼 린넨 세트 바이럴. 열대 비즈니스. Uniqlo SG 판매. S$49.90."),
        ("Charles & Keith Bag", "틱톡에서 #CharlesKeith 싱가포르 브랜드 가방 바이럴. Charles & Keith 판매. S$69."),
        ("Love Bonito Dress", "인스타에서 #LoveBonito 싱가포르 패션 바이럴. Love Bonito 판매. S$49.90."),
        ("Adidas Samba SG", "틱톡에서 #Samba 싱가포르 스트릿 바이럴. Adidas SG 판매. S$150."),
        ("Cotton On SG Basics", "틱톡에서 #CottonOn 가성비 베이직 바이럴. Cotton On SG 판매. S$19.99."),
        ("Pedro Shoes", "인스타에서 #Pedro 싱가포르 슈즈 브랜드 바이럴. Pedro 판매. S$79."),
    ],
    ("SG", "products"): [
        ("Micro-EV Scooter", "틱톡에서 #MicroEV 마이크로 전기 스쿠터 바이럴. 도심 이동수단. Lazada SG 판매. S$599."),
        ("Smart Home Gadgets Hub", "틱톡에서 #SmartHome 스마트홈 가젯 바이럴. Amazon.sg 판매. S$79."),
        ("Dyson Pure Cool Air Purifier", "틱톡에서 #Dyson 공기청정기 바이럴. 싱가포르 헤이즈 시즌. Dyson SG 판매. S$599."),
        ("Apple AirPods Pro 3", "틱톡에서 #AirPods 언박싱 바이럴. Apple SG 판매. S$369."),
        ("Samsung Galaxy Z Flip 6", "틱톡에서 #ZFlip 폴더블 바이럴. Shopee SG 판매. S$1,398."),
        ("Tatcha Dewy Skin Cream", "인스타에서 #Tatcha 프리미엄 스킨케어 바이럴. Sephora SG 판매. S$98."),
    ],
    ("SG", "food"): [
        ("Laksa Premium", "인스타에서 #Laksa 프리미엄 락사 바이럴. 싱가포르 호커 미식. 호커 센터 판매. S$8."),
        ("Kaya Toast Artisan", "인스타에서 #KayaToast 아티장 카야 토스트 바이럴. Ya Kun 판매. S$5.80."),
        ("Bak Kut Teh Premium", "인스타에서 #BakKutTeh 프리미엄 바쿠테 바이럴. Song Fa 판매. S$9."),
        ("Salted Egg Yolk Chips", "틱톡에서 #SaltedEgg 솔티드 에그 칩스 바이럴. NTUC FairPrice 판매. S$5.90."),
        ("Milo Dinosaur", "틱톡에서 #MiloDinosaur 마일로 다이노소어 바이럴. 호커 센터 판매. S$2.50."),
        ("Chilli Crab Sauce", "인스타에서 #ChilliCrab 칠리크랩 소스 바이럴. NTUC FairPrice 판매. S$6.90."),
    ],
    ("SG", "brands"): [
        ("Grab", "틱톡에서 #Grab 싱가포르 슈퍼앱 바이럴. 동남아 대표. Grab 판매. S$0."),
        ("Shopee", "틱톡에서 #Shopee 싱가포르 이커머스 바이럴. Shopee SG 판매. S$0."),
        ("Charles & Keith", "인스타에서 #CharlesKeith 싱가포르 패션 바이럴. Charles & Keith 판매. S$69."),
        ("TWG Tea", "인스타에서 #TWGTea 싱가포르 프리미엄 차 바이럴. TWG 판매. S$38."),
        ("Tiger Beer", "인스타에서 #TigerBeer 싱가포르 맥주 바이럴. NTUC FairPrice 판매. S$15.90."),
        ("BreadTalk", "틱톡에서 #BreadTalk 싱가포르 베이커리 바이럴. BreadTalk 판매. S$2.20."),
    ],

    # ==================== ID (인도네시아) ====================
    ("ID", "fashion"): [
        ("Modest Fashion Hijab Set", "틱톡에서 #ModestFashion 모디스트 히잡 패션 세트 바이럴. Tokopedia 판매. Rp189,000."),
        ("Hijab Styling Tutorial Look", "틱톡에서 #HijabStyling 히잡 스타일링 바이럴. Shopee ID 판매. Rp79,000."),
        ("Erigo Streetwear", "틱톡에서 #Erigo 인도네시아 스트릿웨어 바이럴. Tokopedia 판매. Rp159,000."),
        ("Buttonscarves Collection", "인스타에서 #Buttonscarves 프리미엄 히잡 바이럴. Buttonscarves 판매. Rp250,000."),
        ("Nike Dunk Low ID", "틱톡에서 #NikeDunk 인도네시아 스니커즈 바이럴. Shopee ID 판매. Rp1,549,000."),
        ("UNIQLO Indonesia", "틱톡에서 #UNIQLO 인도네시아 베이직 바이럴. UNIQLO ID 판매. Rp199,000."),
    ],
    ("ID", "products"): [
        ("Wardah Skincare Set", "틱톡에서 #Wardah 인도네시아 할랄 뷰티 바이럴. Shopee ID 판매. Rp89,000."),
        ("Somethinc Vitamin C Serum", "틱톡에서 #Somethinc 인도네시아 스킨케어 바이럴. Tokopedia 판매. Rp109,000."),
        ("Xiaomi Redmi Note 13", "틱톡에서 #Xiaomi 가성비 폰 바이럴. Tokopedia 판매. Rp2,499,000."),
        ("OPPO A79 5G", "틱톡에서 #OPPO 인도네시아 가성비 5G 바이럴. Shopee ID 판매. Rp3,299,000."),
        ("Implora Eye Palette", "틱톡에서 #Implora 가성비 아이팔레트 바이럴. Shopee ID 판매. Rp35,000."),
        ("Samsung Galaxy A15", "틱톡에서 #Samsung 인도네시아 엔트리폰 바이럴. Tokopedia 판매. Rp2,299,000."),
    ],
    ("ID", "food"): [
        ("Indomie Creative Recipes", "틱톡에서 #Indomie 크리에이티브 레시피 바이럴. 인도네시아 국민 라면 변형. Indomaret 판매. Rp3,500."),
        ("Nasi Goreng Gourmet", "틱톡에서 #NasiGoreng 고급 나시고렝 바이럴. 인도네시아 미식. 레스토랑 판매. Rp35,000."),
        ("Es Teh Indonesia", "틱톡에서 #EsTeh 인도네시아 아이스티 바이럴. Es Teh Indonesia 판매. Rp10,000."),
        ("Rendang Premium", "인스타에서 #Rendang 프리미엄 렌당 바이럴. 인도네시아 대표 요리. Tokopedia 판매. Rp65,000."),
        ("Martabak Manis", "틱톡에서 #Martabak 마르타박 디저트 바이럴. 인도네시아 간식. 매장 판매. Rp40,000."),
        ("Kopi Kenangan RTD", "틱톡에서 #KopiKenangan RTD 커피 바이럴. Indomaret 판매. Rp15,000."),
    ],
    ("ID", "brands"): [
        ("Wardah", "틱톡에서 #Wardah 인도네시아 할랄 뷰티 바이럴. 로컬 뷰티 대표. Shopee ID 판매. Rp89,000."),
        ("Somethinc", "틱톡에서 #Somethinc 인도네시아 스킨케어 바이럴. 로컬 뷰티 유니콘. Tokopedia 판매. Rp109,000."),
        ("Tokopedia", "틱톡에서 #Tokopedia 인도네시아 이커머스 바이럴. Tokopedia 판매. Rp0."),
        ("Indomie", "틱톡에서 #Indomie 글로벌 인스턴트 라면 바이럴. Indomaret 판매. Rp3,500."),
        ("Erigo", "틱톡에서 #Erigo 인도네시아 스트릿웨어 바이럴. Tokopedia 판매. Rp159,000."),
        ("Kopi Kenangan", "틱톡에서 #KopiKenangan 인도네시아 카페 체인 바이럴. Kopi Kenangan 판매. Rp18,000."),
    ],

    # ==================== PH (필리핀) ====================
    ("PH", "fashion"): [
        ("Filipino Pride Wear Tee", "틱톡에서 #FilipinoPride 필리핀 자부심 티셔츠 바이럴. Shopee PH 판매. ₱399."),
        ("Casual Streetwear Set", "틱톡에서 #Streetwear 캐주얼 스트릿웨어 세트 바이럴. Lazada PH 판매. ₱599."),
        ("Sunnies Face Lip Dip", "틱톡에서 #SunniesFace 필리핀 뷰티 브랜드 립 바이럴. Sunnies Face 판매. ₱345."),
        ("Penshoppe Collection", "틱톡에서 #Penshoppe 필리핀 패션 브랜드 바이럴. Penshoppe 판매. ₱699."),
        ("Nike Court Vision Low", "틱톡에서 #Nike 가성비 스니커즈 바이럴. Shopee PH 판매. ₱3,495."),
        ("Bench Body Basics", "틱톡에서 #Bench 필리핀 국민 패션 바이럴. Bench 판매. ₱299."),
    ],
    ("PH", "products"): [
        ("Sunnies Face Fluffmatte", "틱톡에서 #SunniesFace 필리핀 가성비 립 바이럴. Sunnies Face 판매. ₱345."),
        ("Realme C67", "틱톡에서 #Realme 가성비 스마트폰 바이럴. Lazada PH 판매. ₱6,999."),
        ("Samsung Galaxy A25", "틱톡에서 #Samsung 가성비폰 바이럴. Shopee PH 판매. ₱11,999."),
        ("JBL Go 3 Speaker", "틱톡에서 #JBL 포터블 스피커 바이럴. Shopee PH 판매. ₱1,999."),
        ("Xiaomi Smart Band 9", "틱톡에서 #Xiaomi 스마트밴드 바이럴. Lazada PH 판매. ₱1,999."),
        ("Human Nature Skincare", "인스타에서 #HumanNature 필리핀 내추럴 뷰티 바이럴. Human Nature 판매. ₱299."),
    ],
    ("PH", "food"): [
        ("Ube Everything", "틱톡에서 #Ube 자색 고구마 디저트/아이스크림/케이크 바이럴. 필리핀 대표 디저트. 매장 판매. ₱120."),
        ("Filipino Street Food Kwek-Kwek", "틱톡에서 #KwekKwek 필리핀 길거리 간식 먹방 바이럴. 매장 판매. ₱50."),
        ("Jollibee Chickenjoy", "틱톡에서 #Jollibee 치킨조이 리뷰 바이럴. 필리핀 국민 치킨. Jollibee 판매. ₱89."),
        ("Halo-Halo Premium", "인스타에서 #HaloHalo 프리미엄 할로할로 바이럴. 필리핀 여름 디저트. 매장 판매. ₱150."),
        ("Mang Inasal Chicken Inasal", "틱톡에서 #MangInasal 치킨 이나살 바이럴. Mang Inasal 판매. ₱129."),
        ("Silvanas Frozen Dessert", "인스타에서 #Silvanas 냉동 디저트 바이럴. 필리핀 전통 과자. 매장 판매. ₱250."),
    ],
    ("PH", "brands"): [
        ("Jollibee", "틱톡에서 #Jollibee 필리핀 패스트푸드 아이콘 바이럴. 글로벌 확장. Jollibee 판매. ₱89."),
        ("Sunnies Face", "틱톡에서 #SunniesFace 필리핀 뷰티 브랜드 바이럴. 가성비 립. Sunnies Face 판매. ₱345."),
        ("Shopee Philippines", "틱톡에서 #Shopee 필리핀 이커머스 바이럴. Shopee PH 판매. ₱0."),
        ("Bench", "틱톡에서 #Bench 필리핀 국민 패션 바이럴. Bench 판매. ₱299."),
        ("Penshoppe", "틱톡에서 #Penshoppe 필리핀 패션 브랜드 바이럴. Penshoppe 판매. ₱699."),
        ("Globe Telecom", "틱톡에서 #Globe 필리핀 통신 바이럴. Globe 판매. ₱99."),
    ],

    # ==================== MY (말레이시아) ====================
    ("MY", "fashion"): [
        ("Modest Fashion Baju Kurung Modern", "인스타에서 #BajuKurung 모던 바주 쿠룽 바이럴. Shopee MY 판매. RM89."),
        ("K-fashion Influence Tee", "틱톡에서 #KFashion 한국 패션 영향 바이럴. Shopee MY 판매. RM49."),
        ("UNIQLO Malaysia", "틱톡에서 #UNIQLO 말레이시아 베이직 바이럴. UNIQLO MY 판매. RM59.90."),
        ("Padini Concept Store", "틱톡에서 #Padini 말레이시아 가성비 패션 바이럴. Padini 판매. RM39.90."),
        ("Nike Air Max MY", "인스타에서 #AirMax 말레이시아 스니커즈 바이럴. JD Sports MY 판매. RM549."),
        ("FashionValet Collection", "인스타에서 #FashionValet 말레이시아 디자이너 바이럴. FashionValet 판매. RM129."),
    ],
    ("MY", "products"): [
        ("K-Beauty Skincare Set", "틱톡에서 #KBeauty 한국 스킨케어 말레이시아 바이럴. Shopee MY 판매. RM59."),
        ("Beauty Blender Set", "틱톡에서 #BeautyBlender 뷰티 블렌더 세트 바이럴. Shopee MY 판매. RM29."),
        ("Samsung Galaxy A55 MY", "틱톡에서 #Samsung 가성비 스마트폰 바이럴. Lazada MY 판매. RM1,499."),
        ("Realme GT 5 Pro", "틱톡에서 #Realme 가성비 플래그십 바이럴. Shopee MY 판매. RM2,199."),
        ("Loreal Paris Serum", "틱톡에서 #Loreal 가성비 세럼 바이럴. Watsons MY 판매. RM49.90."),
        ("Robot Vacuum Dreame", "틱톡에서 #Dreame 로봇청소기 바이럴. Lazada MY 판매. RM1,299."),
    ],
    ("MY", "food"): [
        ("Teh Tarik Molecular Foam", "틱톡에서 #TehTarik 분자 폼 테타릭 바이럴. 전통 밀크티 하이테크 버전. 카페 판매. RM8."),
        ("Nasi Lemak Premium", "인스타에서 #NasiLemak 프리미엄 나시르막 바이럴. 말레이시아 국민 음식. 레스토랑 판매. RM15."),
        ("Roti Canai Gourmet", "틱톡에서 #RotiCanai 고급 로티차나이 바이럴. 매장 판매. RM5."),
        ("Old Town White Coffee", "틱톡에서 #OldTown 화이트 커피 바이럴. 말레이시아 카페 문화. OldTown 판매. RM12.90."),
        ("Durian Musang King", "인스타에서 #MusangKing 두리안 바이럴. 프리미엄 두리안. 매장 판매. RM60."),
        ("Mamee Monster Noodles", "틱톡에서 #Mamee 매미 몬스터 스낵 바이럴. 7-Eleven MY 판매. RM2.50."),
    ],
    ("MY", "brands"): [
        ("Grab", "틱톡에서 #Grab 말레이시아 슈퍼앱 바이럴. Grab 판매. RM0."),
        ("MyNews", "틱톡에서 #MyNews 말레이시아 편의점 바이럴. MyNews 판매. RM5."),
        ("Shopee Malaysia", "틱톡에서 #Shopee 말레이시아 이커머스 바이럴. Shopee MY 판매. RM0."),
        ("Padini", "틱톡에서 #Padini 말레이시아 가성비 패션 바이럴. Padini 판매. RM39.90."),
        ("Petronas", "인스타에서 #Petronas 말레이시아 에너지 기업 바이럴. Petronas 판매. RM0."),
        ("AirAsia", "틱톡에서 #AirAsia 말레이시아 저가항공 바이럴. AirAsia 판매. RM99."),
    ],

    # ==================== AE (UAE) ====================
    ("AE", "fashion"): [
        ("Modest Luxury Fashion Abaya", "인스타에서 #ModestLuxury 디자이너 아바야 바이럴. UAE 모디스트 럭셔리. Ounass 판매. AED 1,500."),
        ("Designer Abaya Collection", "인스타에서 #DesignerAbaya 아바야 컬렉션 바이럴. Namshi 판매. AED 890."),
        ("Nike Air Jordan 1 AE", "인스타에서 #AirJordan UAE 스니커즈 바이럴. Noon 판매. AED 699."),
        ("SHEIN AE Modest Collection", "틱톡에서 #SHEIN 모디스트 패션 바이럴. SHEIN AE 판매. AED 89."),
        ("Namshi Streetwear", "틱톡에서 #Namshi UAE 스트릿웨어 바이럴. Namshi 판매. AED 199."),
        ("Louis Vuitton Dubai Edition", "인스타에서 #LV 두바이 에디션 바이럴. Louis Vuitton 판매. AED 7,500."),
    ],
    ("AE", "products"): [
        ("Gissah Custom Perfume", "틱톡에서 #Gissah 커스텀 향수 바이럴. UAE 향수 문화. Gissah 판매. AED 450."),
        ("Apple iPhone 16 Pro AE", "틱톡에서 #iPhone16Pro UAE 언박싱 바이럴. Virgin Megastore 판매. AED 4,899."),
        ("Dyson V15 Detect AE", "틱톡에서 #Dyson 프리미엄 청소기 바이럴. Noon 판매. AED 2,699."),
        ("Huda Beauty Faux Filter", "인스타에서 #HudaBeauty 중동 뷰티 바이럴. Sephora AE 판매. AED 185."),
        ("Samsung Galaxy Z Fold 6", "틱톡에서 #ZFold UAE 폴더블 바이럴. Virgin Megastore 판매. AED 6,999."),
        ("Sony PS5 Slim AE", "틱톡에서 #PS5 UAE 게이밍 바이럴. Virgin Megastore 판매. AED 1,749."),
    ],
    ("AE", "food"): [
        ("Dubai Chocolate (Original)", "틱톡에서 #DubaiChocolate 글로벌 트렌드 원조. 피스타치오 카다이프 초콜릿 바이럴. Fix Dessert 판매. AED 80."),
        ("Kunafa Premium", "인스타에서 #Kunafa 프리미엄 쿠나파 디저트 바이럴. UAE 전통 디저트. 매장 판매. AED 35."),
        ("Arabic Coffee (Gahwa)", "인스타에서 #Gahwa UAE 전통 커피 바이럴. 환대 문화. 매장 판매. AED 25."),
        ("Luqaimat Sweet Dumplings", "틱톡에서 #Luqaimat 전통 디저트 먹방 바이럴. 매장 판매. AED 20."),
        ("Dates Chocolate Coated", "인스타에서 #DatesChocolate 초콜릿 대추 바이럴. 프리미엄 선물. Bateel 판매. AED 95."),
        ("Camel Milk Ice Cream", "틱톡에서 #CamelMilk 낙타유 아이스크림 바이럴. Al Nassma 판매. AED 30."),
    ],
    ("AE", "brands"): [
        ("Gissah", "틱톡에서 #Gissah UAE 커스텀 퍼퓸 바이럴. 중동 향수 문화. Gissah 판매. AED 450."),
        ("Huda Beauty", "인스타에서 #HudaBeauty UAE 뷰티 바이럴. 글로벌 중동 뷰티. Sephora 판매. AED 185."),
        ("Noon", "틱톡에서 #Noon UAE 이커머스 바이럴. 중동 쇼핑 플랫폼. Noon 판매. AED 0."),
        ("Emirates", "인스타에서 #Emirates UAE 국적항공 바이럴. 럭셔리 항공. Emirates 판매. AED 2,500."),
        ("Bateel", "인스타에서 #Bateel 프리미엄 대추 브랜드 바이럴. 선물 문화. Bateel 판매. AED 120."),
        ("Namshi", "틱톡에서 #Namshi UAE 온라인 패션 바이럴. Namshi 판매. AED 199."),
    ],

    # ==================== SA (사우디) ====================
    ("SA", "fashion"): [
        ("Modest Fashion + Streetwear Fusion", "틱톡에서 #ModestStreet 모디스트+스트릿 퓨전 바이럴. 사우디 젊은층. Namshi 판매. SAR 299."),
        ("Ounass Designer Abaya", "인스타에서 #Ounass 디자이너 아바야 바이럴. 사우디 럭셔리 모디스트. Ounass 판매. SAR 1,500."),
        ("Nike Air Jordan 1 SA", "인스타에서 #AirJordan 사우디 스니커즈 바이럴. Noon SA 판매. SAR 699."),
        ("SHEIN SA Modest Dress", "틱톡에서 #SHEIN 모디스트 드레스 바이럴. 가성비 패션. SHEIN SA 판매. SAR 89."),
        ("Styli Fashion Top", "틱톡에서 #Styli 사우디 온라인 패션 바이럴. Styli 판매. SAR 129."),
        ("Centrepoint Family Fashion", "틱톡에서 #Centrepoint 사우디 가족 패션 바이럴. Centrepoint 판매. SAR 199."),
    ],
    ("SA", "products"): [
        ("Gissah Perfumes", "틱톡에서 #Gissah 사우디 커스텀 향수 바이럴. 중동 향수 문화. Gissah 판매. SAR 500."),
        ("Luxury Beauty Set", "인스타에서 #LuxuryBeauty 럭셔리 뷰티 세트 바이럴. Sephora SA 판매. SAR 399."),
        ("Apple iPhone 16 Pro SA", "틱톡에서 #iPhone16Pro 사우디 언박싱 바이럴. Jarir 판매. SAR 5,299."),
        ("Samsung Galaxy Z Fold 6", "틱톡에서 #GalaxyFold 폴더블 바이럴. Jarir 판매. SAR 7,499."),
        ("Sony PS5 Slim SA", "틱톡에서 #PS5 게임 바이럴. 사우디 게이밍 트렌드. Jarir 판매. SAR 1,899."),
        ("Huda Beauty Faux Filter", "인스타에서 #HudaBeauty 중동 뷰티 바이럴. Sephora SA 판매. SAR 199."),
    ],
    ("SA", "food"): [
        ("Kabsa Gourmet", "틱톡에서 #Kabsa 사우디 전통 카브사 고급화 바이럴. 레스토랑 판매. SAR 55."),
        ("Dates Premium (Ajwa)", "인스타에서 #AjwaDates 프리미엄 대추야자 바이럴. 사우디 전통 선물. Tamimi 판매. SAR 120."),
        ("Dubai Chocolate Bar SA", "틱톡에서 #DubaiChocolate 사우디에서도 품절 대란 바이럴. Amazon.sa 판매. SAR 75."),
        ("Al Baik Sauce", "틱톡에서 #AlBaik 사우디 국민 패스트푸드 소스 바이럴. Al Baik 판매. SAR 15."),
        ("Saudi Arabic Coffee", "인스타에서 #ArabicCoffee 사우디 전통 커피 바이럴. Amazon.sa 판매. SAR 89."),
        ("Al Fakher Arabic Sweets", "인스타에서 #ArabicSweets 전통 디저트 바이럴. Panda 판매. SAR 45."),
    ],
    ("SA", "brands"): [
        ("Gissah", "틱톡에서 #Gissah 사우디 향수 바이럴. 중동 향수 문화 대표. Gissah 판매. SAR 500."),
        ("Sephora Middle East", "인스타에서 #Sephora 중동 뷰티 바이럴. Sephora SA 판매. SAR 199."),
        ("NEOM", "인스타에서 #NEOM 사우디 미래도시 브랜드 바이럴. 비전 2030. NEOM 판매. SAR 199."),
        ("Al Baik", "틱톡에서 #AlBaik 사우디 패스트푸드 아이콘 바이럴. Al Baik 판매. SAR 15."),
        ("STC", "틱톡에서 #STC 사우디 통신 바이럴. STC 판매. SAR 100."),
        ("Jarir Bookstore", "틱톡에서 #Jarir 사우디 테크/서점 바이럴. Jarir 판매. SAR 49."),
    ],

    # ==================== TR (튀르키예) ====================
    ("TR", "fashion"): [
        ("Turkish Bazaar Fashion Revival", "틱톡에서 #BazaarFashion 터키 바자르 패션 리바이벌 바이럴. 전통 패턴 현대화. Trendyol 판매. ₺299."),
        ("LC Waikiki Basic Tee", "틱톡에서 #LCWaikiki 가성비 패션 바이럴. 터키 국민 브랜드. LC Waikiki 판매. ₺149."),
        ("DeFacto Slim Jean", "틱톡에서 #DeFacto 슬림진 바이럴. 터키 패스트패션. DeFacto 판매. ₺399."),
        ("Koton Summer Dress", "인스타에서 #Koton 여름 원피스 바이럴. Trendyol 판매. ₺599."),
        ("Mavi Jeans Gold", "인스타에서 #Mavi 터키 데님 브랜드 바이럴. 프리미엄 진. Mavi 판매. ₺899."),
        ("Trendyol Fashion Set", "틱톡에서 #TrendyolFashion 코디 세트 바이럴. 터키 이커머스 1위. Trendyol 판매. ₺499."),
    ],
    ("TR", "products"): [
        ("Turkish Ceramics Modern", "틱톡에서 #TurkishCeramics 터키 세라믹 현대 디자인 바이럴. Hepsiburada 판매. ₺299."),
        ("Arcelik Telve Coffee Maker", "틱톡에서 #Arcelik 터키 커피 메이커 바이럴. 전통 커피 문화. n11 판매. ₺1,499."),
        ("Farmasi Skincare Set", "틱톡에서 #Farmasi 터키 뷰티 바이럴. 가성비 스킨케어. Farmasi 판매. ₺499."),
        ("Golden Rose Cosmetics", "틱톡에서 #GoldenRose 터키 가성비 화장품 바이럴. Trendyol 판매. ₺89."),
        ("Beko Smart Oven", "인스타에서 #Beko 스마트 오븐 바이럴. 터키 가전. Hepsiburada 판매. ₺3,999."),
        ("Philips OneBlade TR", "틱톡에서 #OneBlade 남성 그루밍 바이럴. Trendyol 판매. ₺899."),
    ],
    ("TR", "food"): [
        ("Kunefe (Künefe)", "틱톡에서 #Künefe 터키 전통 쿠네페 디저트 바이럴. 치즈+시럽. 매장 판매. ₺80."),
        ("Turkish Ice Cream (Dondurma)", "틱톡에서 #Dondurma 터키 아이스크림 퍼포먼스 바이럴. 매장 판매. ₺35."),
        ("Ulker Cikolata Gofret", "틱톡에서 #Ulker 초콜릿 고프레 바이럴. 터키 국민 과자. A101 판매. ₺15."),
        ("Caykur Rize Tea", "인스타에서 #Caykur 터키 홍차 바이럴. 차 문화 아이콘. Migros 판매. ₺79."),
        ("Simit Sarayi Simit", "틱톡에서 #Simit 터키 전통 빵 바이럴. 길거리 음식. Simit Sarayi 판매. ₺15."),
        ("Baklava Premium", "인스타에서 #Baklava 프리미엄 바클라바 바이럴. 터키 디저트 아이콘. Karakoy Gulluoglu 판매. ₺250."),
    ],
    ("TR", "brands"): [
        ("LC Waikiki", "틱톡에서 #LCWaikiki 가성비 패션 바이럴. 터키 국민 패션. LC Waikiki 판매. ₺299."),
        ("Turkish Airlines", "인스타에서 #TurkishAirlines 항공 바이럴. 터키 국적 항공사. THY Shop 판매. ₺899."),
        ("Trendyol", "틱톡에서 #Trendyol 터키 이커머스 1위 바이럴. Trendyol 판매. ₺499."),
        ("Arcelik", "인스타에서 #Arcelik 터키 가전 1위 바이럴. Arcelik 판매. ₺7,999."),
        ("DeFacto", "틱톡에서 #DeFacto 가성비 패션 바이럴. DeFacto 판매. ₺399."),
        ("Ulker", "틱톡에서 #Ulker 터키 식품 바이럴. 국민 과자 브랜드. A101 판매. ₺15."),
    ],

    # ==================== BR (브라질) ====================
    ("BR", "fashion"): [
        ("Carnival Streetwear", "틱톡에서 #Carnival 카니발 영감 스트릿웨어 바이럴. 브라질 축제 패션. Mercado Livre 판매. R$99."),
        ("Sustainable Fashion Tee", "틱톡에서 #SustainableFashion 브라질 지속가능 패션 바이럴. Cariuma 판매. R$149."),
        ("Havaianas Slim", "틱톡에서 #Havaianas 브라질 슬리퍼 바이럴. 여름 아이콘. Havaianas 판매. R$49.99."),
        ("Farm Rio Tropical Dress", "인스타에서 #FarmRio 트로피컬 드레스 바이럴. 브라질 패션. Farm Rio 판매. R$399."),
        ("Melissa Jelly Shoes", "틱톡에서 #Melissa 젤리 슈즈 바이럴. 브라질 아이코닉 슈즈. Melissa 판매. R$199."),
        ("Hering Basic Collection", "틱톡에서 #Hering 가성비 기본 아이템 바이럴. 브라질 국민 브랜드. Hering 판매. R$49.99."),
    ],
    ("BR", "products"): [
        ("Brazilian Bum Bum Cream", "틱톡에서 #BrazilianBumBum Sol de Janeiro 바디크림 바이럴. Sephora BR 판매. R$189."),
        ("Livestream Auction Products", "틱톡에서 #LiveAuction 라이브 경매 상품 바이럴. 브라질 라이브커머스. Shopee BR 판매. R$49."),
        ("Natura Chronos Serum", "틱톡에서 #Natura 브라질 뷰티 세럼 바이럴. 아마존 원료. Natura 판매. R$149.90."),
        ("O Boticario Malbec Noir", "인스타에서 #OBoticario 남성 향수 바이럴. 브라질 뷰티 1위. O Boticario 판매. R$219."),
        ("Samsung Galaxy A55 BR", "틱톡에서 #GalaxyA55 가성비 스마트폰 바이럴. Magazine Luiza 판매. R$1,799."),
        ("JBL Tune 520BT", "틱톡에서 #JBL 가성비 무선 헤드폰 바이럴. Mercado Livre 판매. R$199."),
    ],
    ("BR", "food"): [
        ("Acai Bowls Premium", "인스타에서 #Acai 프리미엄 아사이볼 바이럴. 브라질 슈퍼푸드. 매장 판매. R$25."),
        ("Brigadeiro Gourmet", "인스타에서 #Brigadeiro 구르메 브리가데이루 바이럴. 브라질 디저트 고급화. 매장 판매. R$8."),
        ("Bauducco Chocottone", "틱톡에서 #Bauducco 초코토네 시즌 한정 바이럴. 브라질 축제 간식. Carrefour BR 판매. R$29.90."),
        ("Cafe Melitta Tradicional", "틱톡에서 #Melitta 브라질 커피 바이럴. 홈카페 트렌드. Mercado Livre 판매. R$18.90."),
        ("Kopenhagen Pao de Mel", "인스타에서 #Kopenhagen 빵 드 멜 바이럴. 프리미엄 과자. Kopenhagen 판매. R$49.90."),
        ("Nescau Chocolate Drink", "틱톡에서 #Nescau 초콜릿 음료 바이럴. 브라질 국민 음료. Mercado Livre 판매. R$14.99."),
    ],
    ("BR", "brands"): [
        ("Havaianas", "틱톡에서 #Havaianas 브라질 아이코닉 슬리퍼 바이럴. 글로벌 여름 브랜드. Havaianas 판매. R$29.99."),
        ("Natura", "인스타에서 #Natura 에코 뷰티 바이럴. 아마존 원료 지속가능. Natura 판매. R$89.90."),
        ("O Boticario", "틱톡에서 #OBoticario 브라질 뷰티 바이럴. 향수/스킨케어 인기. O Boticario 판매. R$49.90."),
        ("Magazine Luiza", "틱톡에서 #MagaLu AI 캐릭터 바이럴. 브라질 이커머스 혁신. Magazine Luiza 판매. R$59.90."),
        ("Nubank", "틱톡에서 #Nubank 디지털 뱅킹 바이럴. 브라질 핀테크 유니콘. Nubank 판매. R$0."),
        ("Americanas", "틱톡에서 #Americanas 쇼핑 하울 바이럴. 브라질 리테일. Americanas 판매. R$39.90."),
    ],

    # ==================== MX (멕시코) ====================
    ("MX", "fashion"): [
        ("Artisan Embroidery Modern Top", "틱톡에서 #Artisan 멕시코 전통 자수 현대화 바이럴. Mercado Libre 판매. MX$599."),
        ("Sneaker Culture Limited Edition", "인스타에서 #SneakerCulture 멕시코 스니커즈 문화 바이럴. Liverpool 판매. MX$2,499."),
        ("Zara MX Wide Leg Jeans", "인스타에서 #ZaraMX 와이드레그 진 바이럴. Zara MX 판매. MX$899."),
        ("Bershka MX Cargo Pants", "틱톡에서 #Bershka 카고팬츠 Y2K 바이럴. Bershka MX 판매. MX$799."),
        ("Nike Air Max TW Mexico", "인스타에서 #NikeAirMax 멕시코 에디션 바이럴. Mercado Libre 판매. MX$2,499."),
        ("Shasa Fashion Dress", "틱톡에서 #Shasa 멕시코 패스트패션 바이럴. Shasa 판매. MX$699."),
    ],
    ("MX", "products"): [
        ("Xiaomi Redmi Note 13 Pro", "틱톡에서 #Xiaomi 멕시코 가성비 폰 바이럴. Mercado Libre 판매. MX$4,999."),
        ("Samsung Galaxy Buds FE", "틱톡에서 #Samsung 가성비 이어버즈 바이럴. Liverpool 판매. MX$1,499."),
        ("Amazon Echo Dot 5", "틱톡에서 #Alexa 스마트 스피커 바이럴. Amazon MX 판매. MX$1,049."),
        ("L''Oreal Elvive Hyaluron", "틱톡에서 #LOreal 헤어케어 바이럴. 멕시코 드럭스토어 뷰티. Walmart MX 판매. MX$129."),
        ("JBL Clip 4 Speaker", "틱톡에서 #JBL 포터블 스피커 바이럴. Mercado Libre 판매. MX$1,299."),
        ("Miniso LED Ring Light", "틱톡에서 #Miniso 링라이트 콘텐츠 크리에이터 바이럴. Miniso 판매. MX$399."),
    ],
    ("MX", "food"): [
        ("Birria Nachos", "틱톡에서 #BirriaNachos TikTok 바이럴. 멕시코 전통 비리아+나초 퓨전. 매장 판매. MX$120."),
        ("Street Taco Premium", "틱톡에서 #StreetTaco 프리미엄 길거리 타코 바이럴. 고급 타코. 매장 판매. MX$45."),
        ("Takis Fuego", "틱톡에서 #Takis 멕시코 국민 과자 매운맛 챌린지 바이럴. Walmart MX 판매. MX$28."),
        ("De la Rosa Mazapan", "틱톡에서 #Mazapan 멕시코 전통 과자 ASMR 바이럴. Walmart MX 판매. MX$12."),
        ("Sabritas Adobadas", "틱톡에서 #Sabritas 감자칩 바이럴. 멕시코 간식 아이콘. Walmart MX 판매. MX$22."),
        ("Carlos V Chocolate", "틱톡에서 #CarlosV 멕시코 전통 초콜릿 바이럴. OXXO 판매. MX$18."),
    ],
    ("MX", "brands"): [
        ("Bimbo", "틱톡에서 #Bimbo 멕시코 식품 대기업 바이럴. 국민 브랜드. Walmart MX 판매. MX$49."),
        ("Corona", "인스타에서 #Corona 멕시코 맥주 글로벌 바이럴. OXXO 판매. MX$119."),
        ("Liverpool", "인스타에서 #Liverpool 멕시코 백화점 바이럴. 쇼핑 문화. Liverpool 판매. MX$500."),
        ("OXXO", "틱톡에서 #OXXO 멕시코 편의점 한정 상품 바이럴. OXXO 판매. MX$25."),
        ("Mercado Libre", "틱톡에서 #MercadoLibre 멕시코 이커머스 바이럴. Mercado Libre 판매. MX$0."),
        ("Cinepolis", "틱톡에서 #Cinepolis 멕시코 영화관 팝콘 바이럴. Cinepolis 판매. MX$89."),
    ],

    # ==================== NG (나이지리아) ====================
    ("NG", "fashion"): [
        ("Ankara Modern Print Dress", "틱톡에서 #Ankara 앙카라 모던 프린트 드레스 바이럴. 아프리카 패션. Jumia NG 판매. ₦8,500."),
        ("Afrobeats Fashion Set", "틱톡에서 #Afrobeats 아프로비츠 패션 바이럴. 나이지리아 음악+패션. Konga 판매. ₦12,000."),
        ("Adidas Lagos City Pack", "인스타에서 #AdidasLagos 나이지리아 에디션 바이럴. Konga 판매. ₦45,000."),
        ("PayPorte Basic Tee", "틱톡에서 #PayPorte 가성비 패션 바이럴. PayPorte 판매. ₦3,500."),
        ("Orange Culture Shirt", "인스타에서 #OrangeCulture 나이지리아 디자이너 바이럴. Orange Culture 판매. ₦25,000."),
        ("Lisa Folawiyo Studio", "인스타에서 #LisaFolawiyo 나이지리아 럭셔리 바이럴. Lisa Folawiyo 판매. ₦120,000."),
    ],
    ("NG", "products"): [
        ("Tecno Spark 20 Pro+", "틱톡에서 #Tecno 아프리카 가성비 폰 바이럴. Jumia NG 판매. ₦120,000."),
        ("Oraimo FreePods 4", "틱톡에서 #Oraimo 아프리카 이어버즈 1위 바이럴. Konga 판매. ₦15,000."),
        ("Affordable Smartphones (Infinix)", "틱톡에서 #Infinix 아프리카 폰 바이럴. 가성비 스마트폰. Jumia NG 판매. ₦180,000."),
        ("Starlink Mini Kit Nigeria", "틱톡에서 #Starlink 나이지리아 인터넷 혁신 바이럴. Starlink 판매. ₦250,000."),
        ("Hisense 43-inch Smart TV", "틱톡에서 #Hisense 가성비 TV 바이럴. Jumia NG 판매. ₦185,000."),
        ("Nexus Gas Cooker", "틱톡에서 #Nexus 나이지리아 주방 필수 바이럴. Jumia NG 판매. ₦95,000."),
    ],
    ("NG", "food"): [
        ("Jollof Rice Challenge", "틱톡에서 #JollofRice 졸로프라이스 챌린지 바이럴. 나이지리아 vs 가나. Shoprite 판매. ₦2,000."),
        ("Suya Gourmet", "틱톡에서 #Suya 수야 고급화 바이럴. 나이지리아 그릴 트렌드. 매장 판매. ₦1,500."),
        ("Indomie Instant Noodles", "틱톡에서 #Indomie 나이지리아 국민 라면 먹방 바이럴. Shoprite 판매. ₦200."),
        ("Gala Sausage Roll", "틱톡에서 #Gala 나이지리아 간식 아이콘 바이럴. 매장 판매. ₦300."),
        ("Peak Milk Evaporated", "인스타에서 #PeakMilk 나이지리아 우유 1위 바이럴. Shoprite 판매. ₦500."),
        ("Milo Nigeria", "틱톡에서 #Milo 나이지리아 인기 음료 바이럴. Shoprite 판매. ₦2,500."),
    ],
    ("NG", "brands"): [
        ("GTBank", "인스타에서 #GTBank 나이지리아 디지털 뱅킹 바이럴. GTBank 판매. ₦8,000."),
        ("Dangote", "인스타에서 #Dangote 나이지리아/아프리카 최대 기업 바이럴. Dangote Store 판매. ₦5,000."),
        ("Jumia", "틱톡에서 #Jumia 아프리카 이커머스 1위 바이럴. Jumia NG 판매. ₦10,000."),
        ("Paystack", "틱톡에서 #Paystack 나이지리아 핀테크 바이럴. 결제 혁신. Paystack 판매. ₦15,000."),
        ("Flutterwave", "틱톡에서 #Flutterwave 아프리카 핀테크 바이럴. 글로벌 확장. Flutterwave 판매. ₦12,000."),
        ("Indomie Nigeria", "틱톡에서 #Indomie 나이지리아 국민 라면 브랜드 바이럴. Shoprite 판매. ₦200."),
    ],

    # ==================== ZA (남아공) ====================
    ("ZA", "fashion"): [
        ("Amapiano Fashion Set", "틱톡에서 #Amapiano 아마피아노 음악 영향 패션 바이럴. 남아공 문화. Superbalist 판매. R299."),
        ("Tamia Modest Fashion", "인스타에서 #Tamia 남아공 모디스트 패션 브랜드 바이럴. Tamia 판매. R450."),
        ("Redbat Athletics Sneaker", "틱톡에서 #Redbat 남아공 스포츠웨어 바이럴. Sportscene 판매. R599."),
        ("Mr Price Smart Casual", "틱톡에서 #MrPrice 가성비 스마트 캐주얼 바이럴. Mr Price 판매. R199."),
        ("Bathu Sneakers", "인스타에서 #Bathu 남아공 로컬 스니커즈 브랜드 바이럴. Bathu 판매. R1,299."),
        ("Cotton On ZA Basics", "틱톡에서 #CottonOn 가성비 베이직 바이럴. Cotton On ZA 판매. R149."),
    ],
    ("ZA", "products"): [
        ("Asian-South African Fusion Products", "틱톡에서 아시아-남아공 퓨전 뷰티 제품 바이럴. Takealot 판매. R299."),
        ("Tecno Spark 20 Pro ZA", "틱톡에서 #Tecno 가성비 폰 바이럴. Takealot 판매. R3,499."),
        ("Samsung Galaxy A25 ZA", "틱톡에서 #Samsung 가성비 스마트폰 바이럴. Takealot 판매. R5,999."),
        ("Garnier Micellar Water", "틱톡에서 #Garnier 클렌징 바이럴. Clicks 판매. R119."),
        ("JBL Clip 4 ZA", "틱톡에서 #JBL 포터블 스피커 바이럴. Takealot 판매. R999."),
        ("Nivea Body Lotion ZA", "틱톡에서 #Nivea 바디로션 바이럴. Clicks 판매. R89."),
    ],
    ("ZA", "food"): [
        ("Braai Innovations", "틱톡에서 #Braai 남아공 바비큐 혁신 바이럴. 프리미엄 그릴 트렌드. Checkers 판매. R149."),
        ("Biltong Gourmet", "인스타에서 #Biltong 구르메 빌통 바이럴. 남아공 전통 간식 고급화. Woolworths ZA 판매. R89."),
        ("Rooibos Tea Premium", "인스타에서 #Rooibos 남아공 루이보스 차 바이럴. 웰빙 트렌드. Woolworths ZA 판매. R45."),
        ("Nando''s Peri-Peri Sauce", "틱톡에서 #Nandos 페리페리 소스 바이럴. 남아공 맛. Nando''s 판매. R49."),
        ("Simba Chips", "틱톡에서 #Simba 감자칩 바이럴. 남아공 국민 스낵. Pick n Pay 판매. R15."),
        ("Amarula Cream Liqueur", "인스타에서 #Amarula 남아공 크림 리큐어 바이럴. 매장 판매. R189."),
    ],
    ("ZA", "brands"): [
        ("Woolworths ZA", "인스타에서 #Woolworths 남아공 프리미엄 리테일 바이럴. Woolworths ZA 판매. R299."),
        ("Nando''s", "틱톡에서 #Nandos 남아공 치킨 글로벌 바이럴. Nando''s 판매. R89."),
        ("Takealot", "틱톡에서 #Takealot 남아공 이커머스 바이럴. Takealot 판매. R0."),
        ("Mr Price", "틱톡에서 #MrPrice 가성비 패션 바이럴. Mr Price 판매. R199."),
        ("Bathu", "인스타에서 #Bathu 남아공 로컬 스니커즈 바이럴. Bathu 판매. R1,299."),
        ("Discovery", "인스타에서 #Discovery 남아공 보험/건강 바이럴. Discovery 판매. R0."),
    ],

    # ==================== EG (이집트) ====================
    ("EG", "fashion"): [
        ("Modern Egyptian Cotton Wear", "인스타에서 #EgyptianCotton 이집트 면 현대 의상 바이럴. Jumia EG 판매. E£450."),
        ("Casual Streetwear", "틱톡에서 #Streetwear 이집트 스트릿웨어 바이럴. Amazon EG 판매. E£350."),
        ("Zara Egypt Collection", "인스타에서 #Zara 이집트 컬렉션 바이럴. Zara EG 판매. E£899."),
        ("Adidas Egypt Edition", "인스타에서 #Adidas 이집트 에디션 바이럴. Amazon EG 판매. E£2,500."),
        ("Cotton Egypt Basic Tee", "틱톡에서 이집트 면 가성비 티셔츠 바이럴. Jumia EG 판매. E£199."),
        ("H&M Egypt Modest", "틱톡에서 #HM 이집트 모디스트 라인 바이럴. H&M EG 판매. E£499."),
    ],
    ("EG", "products"): [
        ("Affordable Beauty Products", "틱톡에서 이집트 가성비 뷰티 제품 바이럴. Jumia EG 판매. E£150."),
        ("Phone Accessories Bundle", "틱톡에서 폰 액세서리 번들 바이럴. Amazon EG 판매. E£99."),
        ("Samsung Galaxy A15 EG", "틱톡에서 #Samsung 가성비 폰 바이럴. Jumia EG 판매. E£5,999."),
        ("Oppo A79 EG", "틱톡에서 #Oppo 가성비 스마트폰 바이럴. Noon EG 판매. E£7,999."),
        ("L''Oreal Paris Serum EG", "틱톡에서 #Loreal 세럼 바이럴. 이집트 뷰티. Amazon EG 판매. E£299."),
        ("Anker Power Bank EG", "틱톡에서 #Anker 보조배터리 바이럴. Amazon EG 판매. E£599."),
    ],
    ("EG", "food"): [
        ("Koshari Gourmet", "틱톡에서 #Koshari 코샤리 고급화 바이럴. 이집트 국민 음식. 매장 판매. E£50."),
        ("Falafel Premium", "틱톡에서 #Falafel 프리미엄 팔라펠 바이럴. 이집트 전통 간식. 매장 판매. E£25."),
        ("Basbousa Premium", "인스타에서 #Basbousa 바스부사 디저트 바이럴. 이집트 전통 디저트. 매장 판매. E£40."),
        ("Hibiscus Tea (Karkade)", "인스타에서 #Karkade 히비스커스 차 바이럴. 이집트 전통 음료. 매장 판매. E£15."),
        ("Om Ali Dessert", "틱톡에서 #OmAli 옴 알리 디저트 먹방 바이럴. 이집트 전통. 매장 판매. E£45."),
        ("Egyptian Bread (Aish Baladi)", "틱톡에서 #AishBaladi 이집트 전통빵 먹방 바이럴. 매장 판매. E£5."),
    ],
    ("EG", "brands"): [
        ("Juhayna", "틱톡에서 #Juhayna 이집트 유제품 바이럴. 국민 브랜드. Juhayna 판매. E£25."),
        ("Vodafone Egypt", "틱톡에서 #Vodafone 이집트 통신 바이럴. Vodafone EG 판매. E£100."),
        ("Jumia Egypt", "틱톡에서 #Jumia 이집트 이커머스 바이럴. Jumia EG 판매. E£0."),
        ("Noon Egypt", "틱톡에서 #Noon 이집트 쇼핑 바이럴. Noon EG 판매. E£0."),
        ("Edita Food", "틱톡에서 #Edita 이집트 식품 바이럴. 국민 과자 브랜드. 매장 판매. E£10."),
        ("CIB Bank", "인스타에서 #CIB 이집트 은행 바이럴. 디지털 뱅킹. CIB 판매. E£0."),
    ],

    # ==================== AU (호주) ====================
    ("AU", "fashion"): [
        ("Outdoor Athleisure Set", "틱톡에서 #Athleisure 호주 아웃도어/애슬레저 바이럴. Cotton On 판매. A$49.99."),
        ("Surf Wear Board Shorts", "인스타에서 #SurfWear 호주 서핑 문화 보드숏 바이럴. Rip Curl 판매. A$69."),
        ("Lorna Jane Sports Bra", "인스타에서 #LornaJane 호주 액티브웨어 바이럴. Lorna Jane 판매. A$69.99."),
        ("RM Williams Craftsman Boots", "인스타에서 #RMWilliams 호주 아이코닉 부츠 바이럴. RM Williams 판매. A$595."),
        ("Bonds Originals Tee", "틱톡에서 #Bonds 호주 국민 기본 티 바이럴. Bonds 판매. A$29.95."),
        ("P.E Nation Activewear", "인스타에서 #PENation 호주 프리미엄 액티브웨어 바이럴. The Iconic 판매. A$129."),
    ],
    ("AU", "products"): [
        ("Aesop Skincare (Sun Protection)", "인스타에서 #Aesop 호주 프리미엄 선크림 바이럴. Aesop 판매. A$51."),
        ("Eco Products Reusable Set", "틱톡에서 #EcoProducts 호주 친환경 리유저블 세트 바이럴. Frank Green 판매. A$44.95."),
        ("Breville Barista Express", "틱톡에서 #Breville 홈카페 바이럴. 호주 커피 문화. JB Hi-Fi 판매. A$699."),
        ("Frank Green Reusable Cup", "틱톡에서 #FrankGreen 리유저블 컵 바이럴. 호주 친환경. Frank Green 판매. A$44.95."),
        ("Go-To Skincare Face Hero", "인스타에서 #GoTo 호주 클린 뷰티 바이럴. Go-To 판매. A$45."),
        ("Dyson Airwrap AU", "틱톡에서 #DysonAirwrap 호주에서도 바이럴. 프리미엄 헤어. Dyson AU 판매. A$799."),
    ],
    ("AU", "food"): [
        ("Flat White Innovations", "틱톡에서 #FlatWhite 호주 플랫화이트 혁신 바이럴. 카페 문화 트렌드. 카페 판매. A$5."),
        ("Meat Pie Gourmet", "인스타에서 #MeatPie 고급 미트파이 바이럴. 호주 전통 간식 고급화. 베이커리 판매. A$8."),
        ("Tim Tam Double Coat", "틱톡에서 #TimTam 호주 국민 과자 먹방 바이럴. Woolworths 판매. A$4.65."),
        ("Vegemite Squeeze", "틱톡에서 #Vegemite 호주 아이콘 챌린지 바이럴. Coles 판매. A$6.50."),
        ("Kombucha Remedy", "틱톡에서 #Remedy 콤부차 건강 음료 바이럴. 호주 웰빙. Coles 판매. A$4.50."),
        ("Byron Bay Cookie Company", "인스타에서 #ByronBayCookies 호주 장인 쿠키 바이럴. Amazon AU 판매. A$6.50."),
    ],
    ("AU", "brands"): [
        ("Aesop", "인스타에서 #Aesop 호주 프리미엄 뷰티 바이럴. 미니멀 스킨케어. Aesop 판매. A$51."),
        ("Cotton On", "틱톡에서 #CottonOn 가성비 패션 하울 바이럴. 호주 캐주얼. Cotton On 판매. A$14.99."),
        ("Lorna Jane", "인스타에서 #LornaJane 액티브웨어 바이럴. 호주 피트니스. Lorna Jane 판매. A$109.99."),
        ("Frank Green", "틱톡에서 #FrankGreen 리유저블 텀블러 바이럴. 호주 에코. Frank Green 판매. A$44.95."),
        ("Swisse Vitamins", "틱톡에서 #Swisse 비타민 구미 건강 바이럴. Chemist Warehouse 판매. A$18.99."),
        ("Kogan", "틱톡에서 #Kogan 가성비 가전 바이럴. 호주 이커머스. Kogan 판매. A$499."),
    ],

    # ==================== NZ (뉴질랜드) ====================
    ("NZ", "fashion"): [
        ("Outdoor Adventure Wear", "인스타에서 뉴질랜드 아웃도어 어드벤처 웨어 바이럴. Macpac 판매. NZ$89."),
        ("Icebreaker Merino Tee", "인스타에서 #Icebreaker 메리노울 티 바이럴. 뉴질랜드 지속가능. Icebreaker 판매. NZ$99."),
        ("Allbirds Wool Runner", "틱톡에서 #Allbirds 뉴질랜드 에코 스니커즈 바이럴. Allbirds 판매. NZ$170."),
        ("Kathmandu Puffer Jacket", "인스타에서 #Kathmandu 아웃도어 재킷 바이럴. Kathmandu 판매. NZ$249."),
        ("Glassons Basics", "틱톡에서 #Glassons 뉴질랜드 가성비 패션 바이럴. Glassons 판매. NZ$25."),
        ("Karen Walker Sunglasses", "인스타에서 #KarenWalker 뉴질랜드 디자이너 선글라스 바이럴. Karen Walker 판매. NZ$349."),
    ],
    ("NZ", "products"): [
        ("Ethique Solid Shampoo Bar", "틱톡에서 #Ethique 뉴질랜드 고체 샴푸 에코 바이럴. Ethique 판매. NZ$22."),
        ("Fisher & Paykel Oven", "인스타에서 #FisherPaykel 뉴질랜드 프리미엄 가전 바이럴. Fisher & Paykel 판매. NZ$2,499."),
        ("Antipodes Skincare", "인스타에서 #Antipodes 뉴질랜드 클린 뷰티 바이럴. Antipodes 판매. NZ$49."),
        ("Apple AirPods Pro NZ", "틱톡에서 #AirPods 언박싱 바이럴. Mighty Ape 판매. NZ$449."),
        ("Ecoya Candle", "인스타에서 #Ecoya 뉴질랜드 프리미엄 캔들 바이럴. Ecoya 판매. NZ$49.95."),
        ("Comvita Manuka Honey", "인스타에서 #ManukaHoney 뉴질랜드 마누카 꿀 바이럴. Comvita 판매. NZ$55."),
    ],
    ("NZ", "food"): [
        ("Manuka Honey Premium", "인스타에서 #ManukaHoney 프리미엄 마누카 꿀 바이럴. 뉴질랜드 특산물. Comvita 판매. NZ$55."),
        ("Whittaker''s Chocolate", "틱톡에서 #Whittakers 뉴질랜드 국민 초콜릿 바이럴. New World 판매. NZ$5.50."),
        ("L&P Soda", "틱톡에서 #L&P 뉴질랜드 국민 탄산음료 바이럴. Countdown 판매. NZ$2.50."),
        ("Bluff Oysters", "인스타에서 #BluffOysters 뉴질랜드 프리미엄 굴 바이럴. 시즌 한정. 매장 판매. NZ$40."),
        ("Cookie Time Cookies", "틱톡에서 #CookieTime 뉴질랜드 쿠키 바이럴. Cookie Time 판매. NZ$3.50."),
        ("Kapiti Ice Cream", "인스타에서 #Kapiti 뉴질랜드 프리미엄 아이스크림 바이럴. New World 판매. NZ$10."),
    ],
    ("NZ", "brands"): [
        ("Allbirds", "틱톡에서 #Allbirds 뉴질랜드 에코 스니커즈 바이럴. 글로벌 확장. Allbirds 판매. NZ$170."),
        ("Icebreaker", "인스타에서 #Icebreaker 뉴질랜드 메리노울 바이럴. 지속가능 브랜드. Icebreaker 판매. NZ$99."),
        ("Whittaker''s", "틱톡에서 #Whittakers 뉴질랜드 초콜릿 바이럴. 국민 브랜드. New World 판매. NZ$5.50."),
        ("Kathmandu", "인스타에서 #Kathmandu 뉴질랜드 아웃도어 바이럴. Kathmandu 판매. NZ$249."),
        ("Air New Zealand", "인스타에서 #AirNZ 뉴질랜드 항공 바이럴. Air NZ 판매. NZ$0."),
        ("Fisher & Paykel", "인스타에서 #FisherPaykel 뉴질랜드 프리미엄 가전 바이럴. F&P 판매. NZ$2,499."),
    ],

    # ==================== IL (이스라엘) ====================
    ("IL", "fashion"): [
        ("Tel Aviv Streetwear", "틱톡에서 텔아비브 스트릿웨어 바이럴. 이스라엘 캐주얼. Zap 판매. ₪199."),
        ("Castro Fashion Set", "인스타에서 #Castro 이스라엘 패션 브랜드 바이럴. Castro 판매. ₪149."),
        ("Fox Fashion Basics", "틱톡에서 #Fox 이스라엘 가성비 패션 바이럴. Fox 판매. ₪89."),
        ("Hoodies & Co Oversized", "틱톡에서 오버사이즈 후디 바이럴. KSP 판매. ₪129."),
        ("Naot Sandals", "인스타에서 #Naot 이스라엘 편안한 샌들 바이럴. Naot 판매. ₪349."),
        ("Adidas Israel Collection", "인스타에서 #Adidas 이스라엘 컬렉션 바이럴. Adidas IL 판매. ₪399."),
    ],
    ("IL", "products"): [
        ("Ahava Dead Sea Skincare", "인스타에서 #Ahava 사해 스킨케어 바이럴. 이스라엘 뷰티. Ahava 판매. ₪129."),
        ("SodaStream Terra", "틱톡에서 #SodaStream 탄산수 메이커 바이럴. 이스라엘 발명. Amazon IL 판매. ₪349."),
        ("Waze Premium GPS", "틱톡에서 #Waze 이스라엘 네비 앱 바이럴. 글로벌 서비스. Free."),
        ("Samsung Galaxy S24 IL", "틱톡에서 #Samsung 이스라엘 인기폰 바이럴. KSP 판매. ₪3,499."),
        ("Sabon Body Scrub", "인스타에서 #Sabon 이스라엘 바디 스크럽 바이럴. Sabon 판매. ₪149."),
        ("OrCam MyEye AI", "틱톡에서 #OrCam 이스라엘 AI 보조기기 바이럴. 테크 혁신. OrCam 판매. ₪5,999."),
    ],
    ("IL", "food"): [
        ("Hummus Premium", "틱톡에서 #Hummus 프리미엄 후무스 바이럴. 이스라엘 대표 음식. 매장 판매. ₪25."),
        ("Shakshuka Kit", "틱톡에서 #Shakshuka 샥슈카 레시피 바이럴. 이스라엘 브런치 트렌드. 매장 판매. ₪35."),
        ("Bamba Peanut Snack", "틱톡에서 #Bamba 이스라엘 국민 스낵 바이럴. 매장 판매. ₪8."),
        ("Elite Chocolate", "틱톡에서 #Elite 이스라엘 초콜릿 바이럴. 매장 판매. ₪12."),
        ("Sabich Sandwich", "틱톡에서 #Sabich 이스라엘 길거리 음식 바이럴. 매장 판매. ₪30."),
        ("Israeli Couscous Salad", "인스타에서 #IsraeliCouscous 프티티엠 샐러드 바이럴. 매장 판매. ₪35."),
    ],
    ("IL", "brands"): [
        ("SodaStream", "틱톡에서 #SodaStream 이스라엘 탄산수 메이커 바이럴. 글로벌 브랜드. SodaStream 판매. ₪349."),
        ("Ahava", "인스타에서 #Ahava 사해 화장품 바이럴. 이스라엘 뷰티. Ahava 판매. ₪129."),
        ("Wix", "틱톡에서 #Wix 이스라엘 웹 빌더 바이럴. 글로벌 테크. Wix 판매. ₪0."),
        ("Sabon", "인스타에서 #Sabon 이스라엘 바디케어 바이럴. 프리미엄 바디. Sabon 판매. ₪149."),
        ("Castro", "인스타에서 #Castro 이스라엘 패션 바이럴. 로컬 패션. Castro 판매. ₪149."),
        ("Strauss Group", "인스타에서 #Strauss 이스라엘 식품 기업 바이럴. 국민 식품. 매장 판매. ₪15."),
    ],

    # ==================== RU (러시아) ====================
    ("RU", "fashion"): [
        ("12Storeez Minimalist", "인스타에서 #12Storeez 러시아 미니멀 패션 바이럴. 12Storeez 판매. ₽5,990."),
        ("Befree Casual Set", "틱톡에서 #Befree 러시아 캐주얼 패션 바이럴. Wildberries 판매. ₽2,990."),
        ("Gloria Jeans Basics", "틱톡에서 #GloriaJeans 가성비 베이직 바이럴. Gloria Jeans 판매. ₽1,499."),
        ("Lamoda Fashion", "인스타에서 #Lamoda 러시아 온라인 패션 바이럴. Lamoda 판매. ₽3,990."),
        ("LIME Collection", "인스타에서 #LIME 러시아 프리미엄 캐주얼 바이럴. LIME 판매. ₽4,990."),
        ("Sportmaster Sneakers", "틱톡에서 #Sportmaster 스포츠 스니커즈 바이럴. Sportmaster 판매. ₽4,990."),
    ],
    ("RU", "products"): [
        ("Yandex Station Mini", "틱톡에서 #Yandex 스마트 스피커 바이럴. 러시아 AI 어시스턴트. Yandex Market 판매. ₽5,990."),
        ("Xiaomi Redmi Note 13 RU", "틱톡에서 #Xiaomi 가성비 폰 바이럴. Ozon 판매. ₽14,990."),
        ("Samsung Galaxy A55 RU", "틱톡에서 #Samsung 가성비 스마트폰 바이럴. Wildberries 판매. ₽24,990."),
        ("Letual Beauty Set", "인스타에서 #Letual 러시아 뷰티 세트 바이럴. Letual 판매. ₽2,990."),
        ("Ozon Smart TV", "틱톡에서 #Ozon 가성비 스마트TV 바이럴. Ozon 판매. ₽19,990."),
        ("Vivienne Sabo Mascara", "틱톡에서 #VivienneSabo 러시아 가성비 마스카라 바이럴. Wildberries 판매. ₽499."),
    ],
    ("RU", "food"): [
        ("Alenka Chocolate", "틱톡에서 #Alenka 러시아 국민 초콜릿 바이럴. 매장 판매. ₽99."),
        ("Ptichye Moloko (Bird''s Milk Cake)", "인스타에서 #ПтичьеМолоко 러시아 전통 케이크 바이럴. 매장 판매. ₽350."),
        ("Kefir Premium", "틱톡에서 #Kefir 케피르 건강 음료 바이럴. 러시아 유산균. 매장 판매. ₽89."),
        ("Blin (Russian Crepes)", "틱톡에서 #Blini 러시아 블리니 먹방 바이럴. Teremok 판매. ₽250."),
        ("Korovka Cookies", "틱톡에서 #Korovka 러시아 국민 쿠키 바이럴. 매장 판매. ₽79."),
        ("Ivan Chai Herbal Tea", "인스타에서 #IvanChai 러시아 허브티 바이럴. 웰빙 트렌드. 매장 판매. ₽199."),
    ],
    ("RU", "brands"): [
        ("Wildberries", "틱톡에서 #Wildberries 러시아 이커머스 1위 바이럴. Wildberries 판매. ₽0."),
        ("Ozon", "틱톡에서 #Ozon 러시아 이커머스 바이럴. Ozon 판매. ₽0."),
        ("Yandex", "틱톡에서 #Yandex 러시아 테크 기업 바이럴. 검색/택시/배달. Yandex 판매. ₽0."),
        ("12Storeez", "인스타에서 #12Storeez 러시아 패션 브랜드 바이럴. 12Storeez 판매. ₽5,990."),
        ("Teremok", "틱톡에서 #Teremok 러시아 패스트푸드 바이럴. 블리니 체인. Teremok 판매. ₽250."),
        ("Gloria Jeans", "틱톡에서 #GloriaJeans 러시아 가성비 패션 바이럴. Gloria Jeans 판매. ₽1,499."),
    ],

    # ==================== CA (캐나다) ====================
    ("CA", "fashion"): [
        ("Lululemon Align Leggings", "틱톡에서 #Lululemon 캐나다 애슬레저 바이럴. Lululemon 판매. C$128."),
        ("Roots Cabin Hoodie", "틱톡에서 #Roots 캐나다 국민 후디 바이럴. Roots 판매. C$98."),
        ("Aritzia Super Puff", "인스타에서 #Aritzia 슈퍼퍼프 패딩 바이럴. Aritzia 판매. C$298."),
        ("Canada Goose Chilliwack", "인스타에서 #CanadaGoose 캐나다 프리미엄 패딩 바이럴. Canada Goose 판매. C$1,395."),
        ("Joe Fresh Basics", "틱톡에서 #JoeFresh 가성비 패션 바이럴. Joe Fresh 판매. C$19."),
        ("Adidas Samba CA", "틱톡에서 #Samba 캐나다 스트릿 바이럴. Adidas.ca 판매. C$130."),
    ],
    ("CA", "products"): [
        ("The Ordinary Skincare", "틱톡에서 #TheOrdinary 캐나다 가성비 스킨케어 바이럴. Sephora CA 판매. C$9.90."),
        ("Stanley Quencher CA", "틱톡에서 #Stanley 캐나다에서도 바이럴. Canadian Tire 판매. C$55."),
        ("Dyson Airwrap CA", "틱톡에서 #Dyson 캐나다 뷰티 가전 바이럴. Dyson CA 판매. C$699."),
        ("Apple AirPods Pro 3 CA", "틱톡에서 #AirPods 캐나다 언박싱 바이럴. Apple CA 판매. C$329."),
        ("Samsung Galaxy S24 CA", "틱톡에서 #Samsung 캐나다 인기폰 바이럴. Best Buy CA 판매. C$1,099."),
        ("Fenty Beauty CA", "인스타에서 #FentyBeauty 캐나다 뷰티 바이럴. Sephora CA 판매. C$52."),
    ],
    ("CA", "food"): [
        ("Nanaimo Bar", "틱톡에서 #NanaimoBar 캐나다 전통 디저트 바이럴. 매장 판매. C$4."),
        ("BeaverTails Pastry", "틱톡에서 #BeaverTails 캐나다 페이스트리 바이럴. BeaverTails 판매. C$7."),
        ("Tim Hortons Double-Double", "틱톡에서 #TimHortons 캐나다 국민 커피 바이럴. Tim Hortons 판매. C$2.10."),
        ("Poutine Gourmet", "틱톡에서 #Poutine 고급 푸틴 바이럴. 캐나다 대표 음식. 매장 판매. C$12."),
        ("Maple Syrup Premium", "인스타에서 #MapleSyrup 프리미엄 메이플시럽 바이럴. 캐나다 특산물. 매장 판매. C$15."),
        ("Ketchup Chips", "틱톡에서 #KetchupChips 캐나다 전용 감자칩 바이럴. Loblaws 판매. C$4.49."),
    ],
    ("CA", "brands"): [
        ("Lululemon", "틱톡에서 #Lululemon 캐나다 애슬레저 바이럴. 글로벌 피트니스. Lululemon 판매. C$128."),
        ("Canada Goose", "인스타에서 #CanadaGoose 캐나다 프리미엄 패딩 바이럴. Canada Goose 판매. C$1,395."),
        ("Tim Hortons", "틱톡에서 #TimHortons 캐나다 국민 커피 바이럴. Tim Hortons 판매. C$2.10."),
        ("Aritzia", "인스타에서 #Aritzia 캐나다 패션 바이럴. Aritzia 판매. C$298."),
        ("Roots", "틱톡에서 #Roots 캐나다 국민 브랜드 바이럴. Roots 판매. C$98."),
        ("The Ordinary", "틱톡에서 #TheOrdinary 캐나다 스킨케어 바이럴. Sephora CA 판매. C$9.90."),
    ],
}


# ================================================================
# SQL 생성 헬퍼
# ================================================================
def escape_sql(text):
    """SQL 문자열 이스케이프"""
    if text is None:
        return "NULL"
    return text.replace("'", "''").replace("\\", "\\\\")


def generate_uuid_from_seed(seed_str):
    """시드에서 결정적 UUID 생성"""
    h = hashlib.md5(seed_str.encode("utf-8")).hexdigest()
    return f"{h[:8]}-{h[8:12]}-{h[12:16]}-{h[16:20]}-{h[20:32]}"


def convert_price(usd_price, country_code):
    """USD 가격을 현지 통화로 변환"""
    if country_code not in CURRENCY_INFO:
        return "$" + str(usd_price)
    _, symbol, rate = CURRENCY_INFO[country_code]
    local_price = round(usd_price * rate)
    if rate >= 1000:
        local_price = round(local_price / 100) * 100
    elif rate >= 100:
        local_price = round(local_price / 10) * 10
    elif rate >= 10:
        local_price = round(local_price)
    else:
        local_price = round(usd_price * rate, 2)
    return f"{symbol}{local_price:,}"


def get_store(country_code):
    """국가별 판매처 반환"""
    if country_code in LOCAL_STORES:
        return random.choice(LOCAL_STORES[country_code])
    # 주변 국가 매핑
    tpl = TEMPLATE_MAP.get(country_code)
    if tpl and tpl in LOCAL_STORES:
        return random.choice(LOCAL_STORES[tpl])
    return "Online Store"


def generate_heat_score(is_top_country, idx):
    """heat_score 생성"""
    if is_top_country:
        base = 85 - (idx * 3)
        return max(60, min(98, base + random.randint(-3, 3)))
    else:
        base = 75 - (idx * 4)
        return max(45, min(88, base + random.randint(-3, 3)))


def generate_sub_scores(heat_score):
    """하위 스코어 생성"""
    base = heat_score
    search = max(0, min(100, base + random.randint(-15, 10)))
    social = max(0, min(100, base + random.randint(-10, 15)))
    ecommerce = max(0, min(100, base + random.randint(-20, 5)))
    news = max(0, min(100, base + random.randint(-25, 0)))
    return search, social, ecommerce, news


def heat_status(heat_score):
    """heat_score에 따른 상태"""
    if heat_score >= 85:
        return "rising"
    elif heat_score >= 70:
        return random.choice(["rising", "steady"])
    elif heat_score >= 55:
        return random.choice(["steady", "new"])
    else:
        return "new"


def generate_sql_insert(country_code, category_slug, name, description, heat, idx):
    """단일 INSERT 문 생성"""
    country_uuid = COUNTRY_IDS.get(country_code)
    category_uuid = CATEGORY_IDS.get(category_slug)

    if not country_uuid or not category_uuid:
        return None

    search_s, social_s, ecommerce_s, news_s = generate_sub_scores(heat)
    status = heat_status(heat)

    # 태그 생성
    tags = []
    words = name.lower().split()
    for w in words[:3]:
        clean = w.strip("()[]{},.!?\"'")
        if len(clean) > 2:
            tags.append(clean)
    tags.append(category_slug)
    if heat >= 80:
        tags.append("viral")
    tags_str = ",".join([f"'{escape_sql(t)}'" for t in tags[:5]])

    # first_detected_at 다양화
    day = max(1, min(28, 15 - idx + random.randint(-5, 5)))
    first_detected = f"2026-01-{day:02d}T00:00:00Z"

    sql = (
        f"INSERT INTO trends (country_id, category_id, name, name_local, description, "
        f"heat_score, heat_status, search_score, social_score, ecommerce_score, news_score, "
        f"tags, image_url, price, source_urls, first_detected_at, last_updated_at) VALUES ("
        f"'{country_uuid}', '{category_uuid}', "
        f"'{escape_sql(name)}', NULL, "
        f"'{escape_sql(description)}', "
        f"{heat}, '{status}', {search_s}, {social_s}, {ecommerce_s}, {news_s}, "
        f"ARRAY[{tags_str}], NULL, NULL, "
        f"ARRAY[]::text[], "
        f"'{first_detected}', '2026-03-19T12:00:00Z'"
        f");"
    )
    return sql


def adapt_trend_for_country(name, desc, source_cc, target_cc, category):
    """주요국 트렌드를 다른 국가용으로 변형"""
    target_store = get_store(target_cc)

    # 판매처 교체
    new_desc = desc
    if source_cc in LOCAL_STORES:
        for store in LOCAL_STORES[source_cc]:
            if store in new_desc:
                new_desc = new_desc.replace(store, target_store)
                break

    # 가격 변환 - 기존 가격에서 USD 추정 후 현지 통화
    # 간단히: 원래 설명의 가격 부분을 현지 통화로 교체
    if target_cc in CURRENCY_INFO:
        _, symbol, rate = CURRENCY_INFO[target_cc]
        # 가격 패턴 교체를 단순화 - 설명 끝에 현지 가격 추가
        # 기존 가격을 유지하되 판매처만 교체
        pass

    return name, new_desc


# ================================================================
# 글로벌 바이럴 보충 아이템 (비주요국에 추가)
# ================================================================
GLOBAL_SUPPLEMENTS = {
    "fashion": [
        ("Quiet Luxury Minimal Set", "틱톡에서 #QuietLuxury 미니멀 럭셔리 세트 바이럴. 로고 없는 고급 패션 트렌드. {store} 판매. {price}."),
        ("Y2K Revival Accessories", "틱톡에서 #Y2K 2000년대 리바이벌 액세서리 바이럴. 레트로 패션. {store} 판매. {price}."),
    ],
    "products": [
        ("Galaxy Projector", "틱톡에서 #GalaxyProjector bedroom glow-up 영상으로 바이럴. 감성 조명 인테리어. {store} 판매. {price}."),
        ("Portable Blender Cup", "틱톡에서 #PortableBlender USB 충전 블렌더 바이럴. 스무디 온더고 트렌드. {store} 판매. {price}."),
    ],
    "food": [
        ("Dubai Chocolate Bar", "틱톡에서 #DubaiChocolate 피스타치오 카다이프 초콜릿 ASMR 글로벌 바이럴. {store} 판매. {price}."),
        ("Boba Tea Kit", "틱톡에서 #BobaTea DIY 버블티 키트 바이럴. 홈 카페 트렌드. {store} 판매. {price}."),
    ],
    "brands": [
        ("TikTok Shop", "틱톡에서 #TikTokShop 소셜 커머스 바이럴. 라이브 쇼핑 트렌드. TikTok Shop 판매. Free."),
        ("SHEIN", "틱톡에서 #SHEIN 글로벌 패스트패션 바이럴. 가성비 트렌드 패션. SHEIN 판매. {price}."),
    ],
}

# 글로벌 보충 아이템 가격 (USD 기준)
GLOBAL_PRICES_USD = {
    "Quiet Luxury Minimal Set": 45,
    "Y2K Revival Accessories": 15,
    "Galaxy Projector": 15,
    "Portable Blender Cup": 24,
    "Dubai Chocolate Bar": 25,
    "Boba Tea Kit": 12,
    "TikTok Shop": 0,
    "SHEIN": 15,
}


# ================================================================
# 메인 생성 로직
# ================================================================
def main():
    random.seed(42)  # 재현성

    # 국가 코드 → 정보 매핑
    country_info = {}
    for c in ALL_COUNTRIES:
        country_info[c[0]] = {
            "name_ko": c[1], "name_en": c[2],
            "region": c[3], "sub_region": c[4]
        }

    # 지역별 SQL 수집
    region_sql = {
        "asia": [],
        "middle_east": [],
        "europe": [],
        "africa": [],
        "americas": [],
        "oceania": [],
    }

    total_count = 0
    country_counts = {}
    categories = ["fashion", "products", "food", "brands"]

    for code, name_ko, name_en, region, sub_region in ALL_COUNTRIES:
        if code not in COUNTRY_IDS:
            print(f"  [SKIP] {code} ({name_ko}) - supabase_ids.json에 없음")
            continue

        country_count = 0

        # 이 국가에 직접 데이터가 있는지 확인
        has_own_data = any((code, cat) in VIRAL_DATA for cat in categories)

        if has_own_data:
            # 주요국: 실제 데이터 사용
            for cat in categories:
                key = (code, cat)
                if key in VIRAL_DATA:
                    for idx, (name, desc) in enumerate(VIRAL_DATA[key]):
                        heat = generate_heat_score(True, idx)
                        sql = generate_sql_insert(code, cat, name, desc, heat, idx)
                        if sql:
                            region_sql[region].append(sql)
                            country_count += 1
        else:
            # 비주요국: 템플릿 국가에서 변형 + 글로벌 보충
            template_cc = TEMPLATE_MAP.get(code, "US")
            for cat in categories:
                key = (template_cc, cat)
                if key not in VIRAL_DATA:
                    key = ("US", cat)
                if key not in VIRAL_DATA:
                    continue

                # 템플릿에서 5~6개
                items = VIRAL_DATA[key]
                count = min(len(items), random.choice([5, 6]))
                selected = random.sample(items, count)

                for idx, (name, desc) in enumerate(selected):
                    new_name, new_desc = adapt_trend_for_country(
                        name, desc, template_cc, code, cat
                    )
                    heat = generate_heat_score(False, idx)
                    sql = generate_sql_insert(code, cat, new_name, new_desc, heat, idx)
                    if sql:
                        region_sql[region].append(sql)
                        country_count += 1

                # 글로벌 보충 아이템 추가 (2개) -> 총 7~8개/카테고리
                if cat in GLOBAL_SUPPLEMENTS:
                    for gidx, (gname, gdesc_tpl) in enumerate(GLOBAL_SUPPLEMENTS[cat]):
                        store = get_store(code)
                        usd_price = GLOBAL_PRICES_USD.get(gname, 20)
                        price = convert_price(usd_price, code)
                        gdesc = gdesc_tpl.replace("{store}", store).replace("{price}", price)
                        heat = generate_heat_score(False, len(selected) + gidx)
                        sql = generate_sql_insert(code, cat, gname, gdesc, heat, len(selected) + gidx)
                        if sql:
                            region_sql[region].append(sql)
                            country_count += 1

        country_counts[code] = country_count
        total_count += country_count

    # 파일 출력
    region_names = {
        "asia": "part1_asia",
        "middle_east": "part2_middle_east",
        "europe": "part3_europe",
        "africa": "part4_africa",
        "americas": "part5_americas",
        "oceania": "part6_oceania",
    }

    for region, suffix in region_names.items():
        filename = f"trends_v3_{suffix}.sql"
        filepath = OUTPUT_DIR / filename
        with open(filepath, "w", encoding="utf-8") as f:
            f.write(f"-- ========================================\n")
            f.write(f"-- MONTRA Trends v3 - {region.upper()}\n")
            f.write(f"-- Generated: 2026-03-19\n")
            f.write(f"-- Trends: {len(region_sql[region])}\n")
            f.write(f"-- ========================================\n\n")
            for sql_line in region_sql[region]:
                f.write(sql_line + "\n")

        print(f"  [{region.upper():15s}] {len(region_sql[region]):5d} trends -> {filename}")

    print(f"\n  TOTAL: {total_count} trends across {len(country_counts)} countries")
    print(f"  Output: scripts/output/trends_v3_part{{1..6}}.sql")

    # 국가별 통계
    zero_countries = [c for c, n in country_counts.items() if n == 0]
    if zero_countries:
        print(f"\n  [WARNING] 0 trends: {', '.join(zero_countries)}")

    # 요약
    print(f"\n  === Summary ===")
    for cat in categories:
        cat_count = sum(1 for r in region_sql.values() for s in r if f"'{CATEGORY_IDS[cat]}'" in s)
        print(f"  {cat:10s}: {cat_count}")


if __name__ == "__main__":
    main()
