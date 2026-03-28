"""
100개국 트렌드 데이터 생성 스크립트
- 기존 20개국 SerpAPI 데이터(serpapi_trends_v2.json)를 로드하여 clean_trends.py 로직 적용
- 80개국을 추가: 같은 지역의 기존 국가 데이터를 템플릿으로, 현지 정보로 변환
- SQL 파일 4~8파트로 분할 출력
"""

import sys
import io
import json
import math
import re
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
OUTPUT_DIR = SCRIPT_DIR / "output"

# ================================================================
# 100개국 정보
# ================================================================
ALL_COUNTRIES = [
    # 동아시아 (5)
    ("KR", "한국", "South Korea", "🇰🇷", "asia", "east_asia"),
    ("JP", "일본", "Japan", "🇯🇵", "asia", "east_asia"),
    ("TW", "대만", "Taiwan", "🇹🇼", "asia", "east_asia"),
    ("CN", "중국", "China", "🇨🇳", "asia", "east_asia"),
    ("MN", "몽골", "Mongolia", "🇲🇳", "asia", "east_asia"),
    # 동남아시아 (10)
    ("SG", "싱가포르", "Singapore", "🇸🇬", "asia", "southeast_asia"),
    ("TH", "태국", "Thailand", "🇹🇭", "asia", "southeast_asia"),
    ("VN", "베트남", "Vietnam", "🇻🇳", "asia", "southeast_asia"),
    ("PH", "필리핀", "Philippines", "🇵🇭", "asia", "southeast_asia"),
    ("MY", "말레이시아", "Malaysia", "🇲🇾", "asia", "southeast_asia"),
    ("ID", "인도네시아", "Indonesia", "🇮🇩", "asia", "southeast_asia"),
    ("MM", "미얀마", "Myanmar", "🇲🇲", "asia", "southeast_asia"),
    ("KH", "캄보디아", "Cambodia", "🇰🇭", "asia", "southeast_asia"),
    ("LA", "라오스", "Laos", "🇱🇦", "asia", "southeast_asia"),
    ("BN", "브루나이", "Brunei", "🇧🇳", "asia", "southeast_asia"),
    # 남아시아 (5)
    ("IN", "인도", "India", "🇮🇳", "asia", "south_asia"),
    ("PK", "파키스탄", "Pakistan", "🇵🇰", "asia", "south_asia"),
    ("BD", "방글라데시", "Bangladesh", "🇧🇩", "asia", "south_asia"),
    ("LK", "스리랑카", "Sri Lanka", "🇱🇰", "asia", "south_asia"),
    ("NP", "네팔", "Nepal", "🇳🇵", "asia", "south_asia"),
    # 중앙아시아 (3)
    ("KZ", "카자흐스탄", "Kazakhstan", "🇰🇿", "asia", "central_asia"),
    ("UZ", "우즈베키스탄", "Uzbekistan", "🇺🇿", "asia", "central_asia"),
    ("GE", "조지아", "Georgia", "🇬🇪", "asia", "central_asia"),
    # 중동 (8)
    ("AE", "UAE", "United Arab Emirates", "🇦🇪", "middle_east", "middle_east"),
    ("SA", "사우디아라비아", "Saudi Arabia", "🇸🇦", "middle_east", "middle_east"),
    ("QA", "카타르", "Qatar", "🇶🇦", "middle_east", "middle_east"),
    ("KW", "쿠웨이트", "Kuwait", "🇰🇼", "middle_east", "middle_east"),
    ("BH", "바레인", "Bahrain", "🇧🇭", "middle_east", "middle_east"),
    ("OM", "오만", "Oman", "🇴🇲", "middle_east", "middle_east"),
    ("IL", "이스라엘", "Israel", "🇮🇱", "middle_east", "middle_east"),
    ("TR", "튀르키예", "Turkey", "🇹🇷", "middle_east", "middle_east"),
    # 북아프리카 (4)
    ("EG", "이집트", "Egypt", "🇪🇬", "africa", "north_africa"),
    ("MA", "모로코", "Morocco", "🇲🇦", "africa", "north_africa"),
    ("TN", "튀니지", "Tunisia", "🇹🇳", "africa", "north_africa"),
    ("DZ", "알제리", "Algeria", "🇩🇿", "africa", "north_africa"),
    # 서아프리카 (3)
    ("NG", "나이지리아", "Nigeria", "🇳🇬", "africa", "west_africa"),
    ("GH", "가나", "Ghana", "🇬🇭", "africa", "west_africa"),
    ("SN", "세네갈", "Senegal", "🇸🇳", "africa", "west_africa"),
    # 동/남아프리카 (4)
    ("ZA", "남아공", "South Africa", "🇿🇦", "africa", "south_africa"),
    ("KE", "케냐", "Kenya", "🇰🇪", "africa", "east_africa"),
    ("ET", "에티오피아", "Ethiopia", "🇪🇹", "africa", "east_africa"),
    ("TZ", "탄자니아", "Tanzania", "🇹🇿", "africa", "east_africa"),
    # 북미 (2)
    ("US", "미국", "United States", "🇺🇸", "americas", "north_america"),
    ("CA", "캐나다", "Canada", "🇨🇦", "americas", "north_america"),
    # 중미/카리브 (4)
    ("MX", "멕시코", "Mexico", "🇲🇽", "americas", "central_america"),
    ("CO", "콜롬비아", "Colombia", "🇨🇴", "americas", "central_america"),
    ("PA", "파나마", "Panama", "🇵🇦", "americas", "central_america"),
    ("CR", "코스타리카", "Costa Rica", "🇨🇷", "americas", "central_america"),
    # 남미 (5)
    ("BR", "브라질", "Brazil", "🇧🇷", "americas", "south_america"),
    ("AR", "아르헨티나", "Argentina", "🇦🇷", "americas", "south_america"),
    ("CL", "칠레", "Chile", "🇨🇱", "americas", "south_america"),
    ("PE", "페루", "Peru", "🇵🇪", "americas", "south_america"),
    ("EC", "에콰도르", "Ecuador", "🇪🇨", "americas", "south_america"),
    # 서유럽 (7)
    ("GB", "영국", "United Kingdom", "🇬🇧", "europe", "west_europe"),
    ("FR", "프랑스", "France", "🇫🇷", "europe", "west_europe"),
    ("DE", "독일", "Germany", "🇩🇪", "europe", "west_europe"),
    ("NL", "네덜란드", "Netherlands", "🇳🇱", "europe", "west_europe"),
    ("BE", "벨기에", "Belgium", "🇧🇪", "europe", "west_europe"),
    ("LU", "룩셈부르크", "Luxembourg", "🇱🇺", "europe", "west_europe"),
    ("AT", "오스트리아", "Austria", "🇦🇹", "europe", "west_europe"),
    # 남유럽 (5)
    ("IT", "이탈리아", "Italy", "🇮🇹", "europe", "south_europe"),
    ("ES", "스페인", "Spain", "🇪🇸", "europe", "south_europe"),
    ("PT", "포르투갈", "Portugal", "🇵🇹", "europe", "south_europe"),
    ("GR", "그리스", "Greece", "🇬🇷", "europe", "south_europe"),
    ("HR", "크로아티아", "Croatia", "🇭🇷", "europe", "south_europe"),
    # 북유럽 (5)
    ("SE", "스웨덴", "Sweden", "🇸🇪", "europe", "north_europe"),
    ("NO", "노르웨이", "Norway", "🇳🇴", "europe", "north_europe"),
    ("DK", "덴마크", "Denmark", "🇩🇰", "europe", "north_europe"),
    ("FI", "핀란드", "Finland", "🇫🇮", "europe", "north_europe"),
    ("IS", "아이슬란드", "Iceland", "🇮🇸", "europe", "north_europe"),
    # 동유럽 (7)
    ("PL", "폴란드", "Poland", "🇵🇱", "europe", "east_europe"),
    ("CZ", "체코", "Czech Republic", "🇨🇿", "europe", "east_europe"),
    ("HU", "헝가리", "Hungary", "🇭🇺", "europe", "east_europe"),
    ("RO", "루마니아", "Romania", "🇷🇴", "europe", "east_europe"),
    ("BG", "불가리아", "Bulgaria", "🇧🇬", "europe", "east_europe"),
    ("UA", "우크라이나", "Ukraine", "🇺🇦", "europe", "east_europe"),
    ("RS", "세르비아", "Serbia", "🇷🇸", "europe", "east_europe"),
    # 오세아니아 (3)
    ("AU", "호주", "Australia", "🇦🇺", "oceania", "oceania"),
    ("NZ", "뉴질랜드", "New Zealand", "🇳🇿", "oceania", "oceania"),
    ("FJ", "피지", "Fiji", "🇫🇯", "oceania", "oceania"),
    # === 추가 20개국 (100개국 달성) ===
    # 동남아시아 추가 (1)
    ("TL", "동티모르", "Timor-Leste", "🇹🇱", "asia", "southeast_asia"),
    # 남아시아 추가 (1)
    ("AF", "아프가니스탄", "Afghanistan", "🇦🇫", "asia", "south_asia"),
    # 중앙아시아 추가 (2)
    ("AZ", "아제르바이잔", "Azerbaijan", "🇦🇿", "asia", "central_asia"),
    ("TM", "투르크메니스탄", "Turkmenistan", "🇹🇲", "asia", "central_asia"),
    # 중동 추가 (2)
    ("JO", "요르단", "Jordan", "🇯🇴", "middle_east", "middle_east"),
    ("LB", "레바논", "Lebanon", "🇱🇧", "middle_east", "middle_east"),
    # 아프리카 추가 (4)
    ("UG", "우간다", "Uganda", "🇺🇬", "africa", "east_africa"),
    ("CI", "코트디부아르", "Ivory Coast", "🇨🇮", "africa", "west_africa"),
    ("CM", "카메룬", "Cameroon", "🇨🇲", "africa", "west_africa"),
    ("MZ", "모잠비크", "Mozambique", "🇲🇿", "africa", "east_africa"),
    # 남미 추가 (3)
    ("UY", "우루과이", "Uruguay", "🇺🇾", "americas", "south_america"),
    ("BO", "볼리비아", "Bolivia", "🇧🇴", "americas", "south_america"),
    ("PY", "파라과이", "Paraguay", "🇵🇾", "americas", "south_america"),
    # 카리브 추가 (2)
    ("DO", "도미니카공화국", "Dominican Republic", "🇩🇴", "americas", "central_america"),
    ("JM", "자메이카", "Jamaica", "🇯🇲", "americas", "central_america"),
    # 동유럽 추가 (3)
    ("SK", "슬로바키아", "Slovakia", "🇸🇰", "europe", "east_europe"),
    ("SI", "슬로베니아", "Slovenia", "🇸🇮", "europe", "east_europe"),
    ("LT", "리투아니아", "Lithuania", "🇱🇹", "europe", "east_europe"),
    # 서유럽 추가 (1)
    ("IE", "아일랜드", "Ireland", "🇮🇪", "europe", "west_europe"),
    # 서아시아 추가 (1)
    ("IQ", "이라크", "Iraq", "🇮🇶", "middle_east", "middle_east"),
]

# 기존 20개국 (SerpAPI 데이터 있음)
EXISTING_COUNTRIES = {
    "KR", "JP", "TW", "SG", "TH", "VN", "IN",
    "US", "CA", "MX", "BR",
    "GB", "FR", "DE", "IT", "ES", "SE",
    "AU", "AE", "ZA",
}

# ================================================================
# 새 국가 -> 템플릿 국가 매핑 (같은 지역 기반)
# ================================================================
TEMPLATE_MAP = {
    # 동아시아
    "CN": "KR",   # 중국 <- 한국
    "MN": "KR",   # 몽골 <- 한국
    # 동남아시아
    "PH": "SG",   # 필리핀 <- 싱가포르
    "MY": "SG",   # 말레이시아 <- 싱가포르
    "ID": "TH",   # 인도네시아 <- 태국
    "MM": "TH",   # 미얀마 <- 태국
    "KH": "VN",   # 캄보디아 <- 베트남
    "LA": "VN",   # 라오스 <- 베트남
    "BN": "SG",   # 브루나이 <- 싱가포르
    # 남아시아
    "PK": "IN",   # 파키스탄 <- 인도
    "BD": "IN",   # 방글라데시 <- 인도
    "LK": "IN",   # 스리랑카 <- 인도
    "NP": "IN",   # 네팔 <- 인도
    # 중앙아시아
    "KZ": "IN",   # 카자흐스탄 <- 인도 (가격대 유사)
    "UZ": "IN",   # 우즈베키스탄 <- 인도
    "GE": "IT",   # 조지아 <- 이탈리아 (유럽풍 소비패턴)
    # 중동
    "SA": "AE",   # 사우디 <- UAE
    "QA": "AE",   # 카타르 <- UAE
    "KW": "AE",   # 쿠웨이트 <- UAE
    "BH": "AE",   # 바레인 <- UAE
    "OM": "AE",   # 오만 <- UAE
    "IL": "GB",   # 이스라엘 <- 영국
    "TR": "ES",   # 튀르키예 <- 스페인 (가격대 유사)
    # 북아프리카
    "EG": "ZA",   # 이집트 <- 남아공
    "MA": "ZA",   # 모로코 <- 남아공
    "TN": "ZA",   # 튀니지 <- 남아공
    "DZ": "ZA",   # 알제리 <- 남아공
    # 서아프리카
    "NG": "ZA",   # 나이지리아 <- 남아공
    "GH": "ZA",   # 가나 <- 남아공
    "SN": "ZA",   # 세네갈 <- 남아공
    # 동/남아프리카
    "KE": "ZA",   # 케냐 <- 남아공
    "ET": "ZA",   # 에티오피아 <- 남아공
    "TZ": "ZA",   # 탄자니아 <- 남아공
    # 중미/카리브
    "CO": "MX",   # 콜롬비아 <- 멕시코
    "PA": "MX",   # 파나마 <- 멕시코
    "CR": "MX",   # 코스타리카 <- 멕시코
    # 남미
    "AR": "BR",   # 아르헨티나 <- 브라질
    "CL": "BR",   # 칠레 <- 브라질
    "PE": "MX",   # 페루 <- 멕시코
    "EC": "MX",   # 에콰도르 <- 멕시코
    # 서유럽
    "NL": "DE",   # 네덜란드 <- 독일
    "BE": "FR",   # 벨기에 <- 프랑스
    "LU": "FR",   # 룩셈부르크 <- 프랑스
    "AT": "DE",   # 오스트리아 <- 독일
    # 남유럽
    "PT": "ES",   # 포르투갈 <- 스페인
    "GR": "IT",   # 그리스 <- 이탈리아
    "HR": "IT",   # 크로아티아 <- 이탈리아
    # 북유럽
    "NO": "SE",   # 노르웨이 <- 스웨덴
    "DK": "SE",   # 덴마크 <- 스웨덴
    "FI": "SE",   # 핀란드 <- 스웨덴
    "IS": "SE",   # 아이슬란드 <- 스웨덴
    # 동유럽
    "PL": "DE",   # 폴란드 <- 독일
    "CZ": "DE",   # 체코 <- 독일
    "HU": "DE",   # 헝가리 <- 독일
    "RO": "IT",   # 루마니아 <- 이탈리아
    "BG": "IT",   # 불가리아 <- 이탈리아
    "UA": "DE",   # 우크라이나 <- 독일
    "RS": "IT",   # 세르비아 <- 이탈리아
    # 오세아니아
    "NZ": "AU",   # 뉴질랜드 <- 호주
    "FJ": "AU",   # 피지 <- 호주
    # === 추가 20개국 ===
    "TL": "VN",   # 동티모르 <- 베트남
    "AF": "IN",   # 아프가니스탄 <- 인도
    "AZ": "IN",   # 아제르바이잔 <- 인도
    "TM": "IN",   # 투르크메니스탄 <- 인도
    "JO": "AE",   # 요르단 <- UAE
    "LB": "AE",   # 레바논 <- UAE
    "UG": "ZA",   # 우간다 <- 남아공
    "CI": "ZA",   # 코트디부아르 <- 남아공
    "CM": "ZA",   # 카메룬 <- 남아공
    "MZ": "ZA",   # 모잠비크 <- 남아공
    "UY": "BR",   # 우루과이 <- 브라질
    "BO": "MX",   # 볼리비아 <- 멕시코
    "PY": "BR",   # 파라과이 <- 브라질
    "DO": "MX",   # 도미니카공화국 <- 멕시코
    "JM": "US",   # 자메이카 <- 미국
    "SK": "DE",   # 슬로바키아 <- 독일
    "SI": "IT",   # 슬로베니아 <- 이탈리아
    "LT": "DE",   # 리투아니아 <- 독일
    "IE": "GB",   # 아일랜드 <- 영국
    "IQ": "AE",   # 이라크 <- UAE
}

# ================================================================
# 통화 정보 (코드, 기호, USD 대비 대략적 환율)
# ================================================================
CURRENCY_INFO = {
    "KR": ("KRW", "₩", 1350),
    "JP": ("JPY", "¥", 150),
    "TW": ("TWD", "NT$", 32),
    "CN": ("CNY", "¥", 7.2),
    "MN": ("MNT", "₮", 3400),
    "SG": ("SGD", "S$", 1.35),
    "TH": ("THB", "฿", 35),
    "VN": ("VND", "₫", 25000),
    "PH": ("PHP", "₱", 56),
    "MY": ("MYR", "RM", 4.7),
    "ID": ("IDR", "Rp", 15500),
    "MM": ("MMK", "K", 2100),
    "KH": ("KHR", "៛", 4100),
    "LA": ("LAK", "₭", 20000),
    "BN": ("BND", "B$", 1.35),
    "IN": ("INR", "₹", 83),
    "PK": ("PKR", "Rs", 280),
    "BD": ("BDT", "৳", 110),
    "LK": ("LKR", "Rs", 320),
    "NP": ("NPR", "Rs", 133),
    "KZ": ("KZT", "₸", 460),
    "UZ": ("UZS", "so'm", 12500),
    "GE": ("GEL", "₾", 2.7),
    "AE": ("AED", "AED", 3.67),
    "SA": ("SAR", "SAR", 3.75),
    "QA": ("QAR", "QAR", 3.64),
    "KW": ("KWD", "KD", 0.31),
    "BH": ("BHD", "BD", 0.38),
    "OM": ("OMR", "OMR", 0.385),
    "IL": ("ILS", "₪", 3.7),
    "TR": ("TRY", "₺", 32),
    "EG": ("EGP", "E£", 50),
    "MA": ("MAD", "MAD", 10),
    "TN": ("TND", "DT", 3.1),
    "DZ": ("DZD", "DA", 135),
    "NG": ("NGN", "₦", 1550),
    "GH": ("GHS", "GH₵", 15),
    "SN": ("XOF", "CFA", 610),
    "ZA": ("ZAR", "R", 18),
    "KE": ("KES", "KSh", 155),
    "ET": ("ETB", "Br", 57),
    "TZ": ("TZS", "TSh", 2550),
    "US": ("USD", "$", 1),
    "CA": ("CAD", "C$", 1.37),
    "MX": ("MXN", "$", 17),
    "CO": ("COP", "$", 4000),
    "PA": ("PAB", "B/.", 1),
    "CR": ("CRC", "₡", 520),
    "BR": ("BRL", "R$", 5),
    "AR": ("ARS", "$", 870),
    "CL": ("CLP", "$", 950),
    "PE": ("PEN", "S/.", 3.7),
    "EC": ("USD", "$", 1),
    "GB": ("GBP", "£", 0.79),
    "FR": ("EUR", "€", 0.92),
    "DE": ("EUR", "€", 0.92),
    "NL": ("EUR", "€", 0.92),
    "BE": ("EUR", "€", 0.92),
    "LU": ("EUR", "€", 0.92),
    "AT": ("EUR", "€", 0.92),
    "IT": ("EUR", "€", 0.92),
    "ES": ("EUR", "€", 0.92),
    "PT": ("EUR", "€", 0.92),
    "GR": ("EUR", "€", 0.92),
    "HR": ("EUR", "€", 0.92),
    "SE": ("SEK", "kr", 10.5),
    "NO": ("NOK", "kr", 10.7),
    "DK": ("DKK", "kr", 6.9),
    "FI": ("EUR", "€", 0.92),
    "IS": ("ISK", "kr", 138),
    "PL": ("PLN", "zł", 4),
    "CZ": ("CZK", "Kč", 23),
    "HU": ("HUF", "Ft", 365),
    "RO": ("RON", "lei", 4.6),
    "BG": ("BGN", "лв", 1.8),
    "UA": ("UAH", "₴", 38),
    "RS": ("RSD", "din", 108),
    "AU": ("AUD", "A$", 1.55),
    "NZ": ("NZD", "NZ$", 1.7),
    "FJ": ("FJD", "FJ$", 2.3),
    # 추가 20개국
    "TL": ("USD", "$", 1),
    "AF": ("AFN", "؋", 70),
    "AZ": ("AZN", "₼", 1.7),
    "TM": ("TMT", "T", 3.5),
    "JO": ("JOD", "JD", 0.71),
    "LB": ("LBP", "L£", 89500),
    "UG": ("UGX", "USh", 3750),
    "CI": ("XOF", "CFA", 610),
    "CM": ("XAF", "FCFA", 610),
    "MZ": ("MZN", "MT", 64),
    "UY": ("UYU", "$U", 40),
    "BO": ("BOB", "Bs", 6.9),
    "PY": ("PYG", "₲", 7500),
    "DO": ("DOP", "RD$", 58),
    "JM": ("JMD", "J$", 156),
    "SK": ("EUR", "€", 0.92),
    "SI": ("EUR", "€", 0.92),
    "LT": ("EUR", "€", 0.92),
    "IE": ("EUR", "€", 0.92),
    "IQ": ("IQD", "د.ع", 1310),
}

# ================================================================
# 현지 판매처 매핑
# ================================================================
LOCAL_STORES = {
    "KR": ["쿠팡", "무신사", "올리브영", "에이블리", "지그재그"],
    "JP": ["Amazon Japan", "Rakuten", "Yahoo Shopping", "ZOZOTOWN"],
    "TW": ["Shopee TW", "momo", "PChome", "Yahoo TW"],
    "CN": ["Taobao", "JD.com", "Pinduoduo", "Tmall", "Douyin Shop"],
    "MN": ["Shoppy.mn", "Monos.mn", "Candy.mn"],
    "SG": ["Shopee SG", "Lazada SG", "Amazon.sg", "Qoo10"],
    "TH": ["Shopee TH", "Lazada TH", "Central Online", "JD Central"],
    "VN": ["Shopee VN", "Tiki", "Lazada VN", "Sendo"],
    "PH": ["Shopee PH", "Lazada PH", "TikTok Shop PH", "Zalora PH"],
    "MY": ["Shopee MY", "Lazada MY", "Zalora MY", "TikTok Shop MY"],
    "ID": ["Tokopedia", "Shopee ID", "Bukalapak", "TikTok Shop ID"],
    "MM": ["Shopee MM", "Myanmore", "OneKyat"],
    "KH": ["Little Fashion", "Nham24", "Shopee KH"],
    "LA": ["Laos Market", "Shopee LA"],
    "BN": ["Shopee BN", "Brunei Mall"],
    "IN": ["Amazon India", "Flipkart", "Myntra", "Meesho"],
    "PK": ["Daraz PK", "Goto.com.pk", "Yayvo"],
    "BD": ["Daraz BD", "Evaly", "Chaldal"],
    "LK": ["Daraz LK", "Kapruka", "Wasi.lk"],
    "NP": ["Daraz NP", "SastoDeal", "Gyapu"],
    "KZ": ["Kaspi.kz", "Wildberries KZ", "Ozon KZ"],
    "UZ": ["Uzum Market", "Asaxiy", "Mediapark"],
    "GE": ["Extra.ge", "Mymarket.ge", "Zoommer.ge"],
    "AE": ["Amazon.ae", "Noon", "Namshi", "Carrefour UAE"],
    "SA": ["Noon SA", "Amazon.sa", "Jarir", "SHEIN SA"],
    "QA": ["Noon QA", "QatarLiving", "Talabat Mall"],
    "KW": ["Noon KW", "Xcite", "Boutiqaat"],
    "BH": ["Noon BH", "Alosra", "LuLu Online BH"],
    "OM": ["Noon OM", "LuLu Oman", "Ubuy Oman"],
    "IL": ["Amazon IL", "Zap", "KSP", "Bug"],
    "TR": ["Trendyol", "Hepsiburada", "n11", "GittiGidiyor"],
    "EG": ["Noon EG", "Amazon EG", "Jumia EG"],
    "MA": ["Jumia MA", "Hmall.ma", "Avito MA"],
    "TN": ["Jumia TN", "Mytek", "Tunisianet"],
    "DZ": ["Jumia DZ", "Ouedkniss", "eComDZ"],
    "NG": ["Jumia NG", "Konga", "PayPorte"],
    "GH": ["Jumia GH", "Jiji GH", "Tonaton"],
    "SN": ["Jumia SN", "Expat-Dakar", "CoinAfrique SN"],
    "ZA": ["Takealot", "Mr Price", "Superbalist", "Makro"],
    "KE": ["Jumia KE", "Kilimall", "Jiji KE"],
    "ET": ["Addis Mercato", "Telegram Shops ET", "Engocha"],
    "TZ": ["Jumia TZ", "Jiji TZ", "ZoomTanzania"],
    "US": ["Amazon", "Walmart", "Target", "SHEIN"],
    "CA": ["Amazon.ca", "Canadian Tire", "Hudson's Bay"],
    "MX": ["Mercado Libre", "Amazon MX", "Liverpool"],
    "CO": ["Mercado Libre CO", "Falabella CO", "Exito.com"],
    "PA": ["Mercado Libre PA", "Pricesmart PA", "PriceSmart"],
    "CR": ["Mercado Libre CR", "Amazon CR", "Gollo"],
    "BR": ["Mercado Livre", "Magazine Luiza", "Americanas"],
    "AR": ["Mercado Libre AR", "Falabella AR", "Fravega"],
    "CL": ["Mercado Libre CL", "Falabella CL", "Paris.cl"],
    "PE": ["Mercado Libre PE", "Falabella PE", "Ripley PE"],
    "EC": ["Mercado Libre EC", "De Prati", "Mi Comisariato"],
    "GB": ["Amazon UK", "ASOS", "John Lewis", "Argos"],
    "FR": ["Amazon.fr", "Cdiscount", "Fnac", "La Redoute"],
    "DE": ["Amazon.de", "Otto", "Zalando", "MediaMarkt"],
    "NL": ["Bol.com", "Coolblue", "Wehkamp", "HEMA"],
    "BE": ["Bol.com BE", "Coolblue BE", "Zalando BE"],
    "LU": ["Amazon.lu", "Auchan LU", "Cactus"],
    "AT": ["Amazon.at", "Zalando AT", "Shoepping.at"],
    "IT": ["Amazon.it", "ePRICE", "Zalando IT", "IBS"],
    "ES": ["Amazon.es", "El Corte Ingles", "FNAC ES", "PCComponentes"],
    "PT": ["Amazon.pt", "Worten", "FNAC PT", "El Corte Ingles PT"],
    "GR": ["Skroutz", "Public.gr", "Plaisio", "eFresh.gr"],
    "HR": ["eKupi", "Mall.hr", "Instar Informatika"],
    "SE": ["Amazon.se", "Zalando SE", "CDON", "Elgiganten"],
    "NO": ["Komplett.no", "Elkjop", "Zalando NO", "CDON NO"],
    "DK": ["Zalando DK", "Elgiganten DK", "Coolshop", "CDON DK"],
    "FI": ["Verkkokauppa", "Zalando FI", "Gigantti", "CDON FI"],
    "IS": ["Elko.is", "Hagkaup", "Heimkaup"],
    "PL": ["Allegro", "Zalando PL", "MediaMarkt PL", "Morele.net"],
    "CZ": ["Alza.cz", "Mall.cz", "Heureka", "Notino CZ"],
    "HU": ["Emag HU", "Alza.hu", "eMAG HU", "Mall.hu"],
    "RO": ["eMAG", "Altex", "Fashion Days", "elefant.ro"],
    "BG": ["eMAG BG", "Emag.bg", "Technomarket", "Ozone.bg"],
    "UA": ["Rozetka", "Prom.ua", "Allo.ua", "Kasta"],
    "RS": ("Kupujem Prodajem", "Gigatron", "WinWin", "eKupi RS"),
    "AU": ["Amazon.com.au", "Kogan", "The Iconic", "JB Hi-Fi"],
    "NZ": ["Mighty Ape", "The Warehouse", "Fishpond", "Trade Me"],
    "FJ": ["Courts Fiji", "Tappoo", "MH Fiji"],
    # 추가 20개국
    "TL": ["Timor Plaza", "Loja Online TL"],
    "AF": ["Afghan Market", "Kabul Mall Online"],
    "AZ": ("Umico", "Tap.az", "Baku Electronics"),
    "TM": ("Online TM", "Ashgabat Mall"),
    "JO": ["OpenSooq JO", "Carrefour JO", "Noon JO"],
    "LB": ["Boutique1 LB", "Carrefour LB", "Noon LB"],
    "UG": ["Jumia UG", "Jiji UG", "Kilimall UG"],
    "CI": ["Jumia CI", "Afrimarket CI", "CoinAfrique CI"],
    "CM": ["Jumia CM", "Jiji CM", "CoinAfrique CM"],
    "MZ": ["OLX MZ", "Jumia MZ"],
    "UY": ["Mercado Libre UY", "Tienda Inglesa", "Mosca"],
    "BO": ["Mercado Libre BO", "Multicenter BO"],
    "PY": ["Mercado Libre PY", "Nissei", "TuPi"],
    "DO": ["Mercado Libre DO", "Jumbo DO", "Amazon DO"],
    "JM": ["Amazon JM", "PriceSmart JM", "MegaMart JM"],
    "SK": ["Alza.sk", "Mall.sk", "Heureka SK"],
    "SI": ["Mimovrste", "Big Bang", "eNakupi"],
    "LT": ["Pigu.lt", "Varle.lt", "Barbora LT"],
    "IE": ["Amazon.ie", "Argos IE", "Dunnes Stores"],
    "IQ": ["Miswag", "Orisdi", "Al Khair IQ"],
}

# ================================================================
# 국가+카테고리별 검증된 트렌드 이유 (기존 + 80개국 확장)
# ================================================================
VERIFIED_TRENDS = {
    # === 기존 20개국 (clean_trends.py에서 가져옴) ===
    ("KR", "fashion"): "한국에서 브로치/하이넥 디테일과 커스텀 패션이 2026 트렌드로 부상",
    ("KR", "products"): "한국에서 다이소 뷰티 매출 144% 증가 등 소용량 가성비 아이템이 인기",
    ("KR", "food"): "한국에서 감성 디저트와 소포장 간식이 SNS를 통해 인기",
    ("KR", "entertainment"): "한국에서 커스터마이징과 DIY 취미가 MZ세대 사이에서 인기 급상승",
    ("US", "fashion"): "미국에서 TikTok 바이럴 패션 아이템이 $10~$30 가격대로 인기",
    ("US", "products"): "미국에서 TikTok 'made me buy it' 트렌드로 바이럴된 실용 가젯이 인기",
    ("US", "food"): "미국에서 TikTok 먹방/레시피 영상으로 바이럴된 간식이 소셜 미디어 통해 확산",
    ("US", "entertainment"): "미국에서 STEM 교육 장난감과 레트로 게임이 크리에이터 콘텐츠로 바이럴",
    ("JP", "fashion"): "일본에서 少女漫画 스타일과 뱃지/브로치 등 커스텀 액세서리가 Z세대 트렌드",
    ("JP", "products"): "일본에서 스프레이형 향수 자판기, 레트로 디카 등 감성 가젯이 인기",
    ("JP", "food"): "일본에서 コグマパン 등 SNS 감성 디저트가 화제 (Yahoo 2026 트렌드)",
    ("JP", "entertainment"): "일본에서 ブラインドボックス와 장난감 모양 코스메틱이 Z세대 트렌드",
    ("TW", "fashion"): "대만에서 애니/IP 콜라보 패션이 80%+ 매출 성장 (SHOPLINE 2026)",
    ("TW", "products"): "대만에서 건강기능식품이 꾸준히 베스트셀러. 나를 위한 투자 트렌드",
    ("TW", "food"): "대만에서 프리미엄 선물세트와 전통 간식(펑리수 등)이 관광/선물 수요로 인기",
    ("TW", "entertainment"): "대만에서 애니/IP/전시회 굿즈가 80%+ 매출 성장. 수집형 소비 트렌드",
    ("SG", "fashion"): "싱가포르에서 TikTok Shop 통한 소셜 커머스 패션이 급성장",
    ("SG", "products"): "싱가포르에서 뷰티/스킨케어가 Shopee 판매의 절반 차지. 건강/웰빙 급성장",
    ("SG", "food"): "싱가포르에서 한국/일본 수입 간식이 인기. 프리미엄 간식 시장 성장",
    ("SG", "entertainment"): "싱가포르에서 일본/한국 캐릭터 굿즈와 수집용 완구가 인기",
    ("TH", "fashion"): "태국에서 소셜 커머스를 통한 패션 판매 급성장. TikTok Shop이 판매 견인",
    ("TH", "products"): "태국에서 건강/웰빙 제품이 인기. 동남아 이커머스 성장의 핵심 시장",
    ("TH", "food"): "태국에서 로컬 간식과 수입 스낵이 소셜 미디어를 통해 인기",
    ("TH", "entertainment"): "태국에서 레트로 게임기와 수집용 피규어가 젊은 층에서 인기",
    ("VN", "fashion"): "베트남에서 소셜 커머스 패션이 급성장. 가장 빠르게 성장하는 이커머스 시장",
    ("VN", "products"): "베트남에서 가성비 생활용품과 뷰티 제품이 Shopee/TikTok Shop 통해 확산",
    ("VN", "food"): "베트남에서 로컬 전통 간식과 수입 스낵이 함께 인기",
    ("VN", "entertainment"): "베트남에서 모바일 게임 액세서리와 수집용 완구가 젊은 층에서 인기",
    ("IN", "fashion"): "인도에서 전통 의상의 현대화와 캐주얼 패션이 동시에 성장. 최고속 성장 패션 시장",
    ("IN", "products"): "인도에서 Make in India 정책으로 전자제품 제조 급성장. 가성비 스마트 기기 인기",
    ("IN", "food"): "인도에서 전통 과자(미타이)와 프리미엄 간식이 밀레니얼/Z세대 사이 인기 급상승",
    ("IN", "entertainment"): "인도에서 STEM 교육 장난감과 DIY 키트가 교육열과 함께 인기 상승",
    ("CA", "fashion"): "캐나다에서 배럴레그 진/스웻셔츠 검색량 160% 급증 (Shopify Canada 2026)",
    ("CA", "products"): "캐나다에서 스마트 노트북/E-ink 태블릿이 인기 (Google Trends 데이터)",
    ("CA", "food"): "캐나다에서 matcha/버섯커피 등 건강 음료와 프로틴 스낵이 웰빙 트렌드로 인기",
    ("CA", "entertainment"): "캐나다에서 Shashibo/DIY 키트 등 크리에이티브 퍼즐이 실내 취미 트렌드로 인기",
    ("MX", "fashion"): "멕시코에서 크로셰/Y2K 벌룬팬츠/포레스트코어 트렌드 (Grazia 2026)",
    ("MX", "products"): "멕시코에서 스마트워치/태양광 백팩/무선 이어폰이 Mercado Libre 베스트셀러",
    ("MX", "food"): "멕시코에서 수입 미국 간식과 천연 에너지바가 건강 스낵 트렌드로 인기",
    ("MX", "entertainment"): "멕시코에서 Labubu/Sonny Angels 등 바이럴 수집형 피규어가 TikTok에서 화제",
    ("BR", "fashion"): "브라질에서 오버사이즈와 캐주얼 패션이 인기. 남미 최대 패션 시장",
    ("BR", "products"): "브라질에서 Alexa/Fire TV 등 아마존 자체 브랜드 기기가 인기 급상승",
    ("BR", "food"): "브라질에서 로컬 간식과 초콜릿이 꾸준한 인기",
    ("BR", "entertainment"): "브라질에서 보드게임과 가족 단위 놀이가 인기. 남미 최대 완구 시장",
    ("GB", "fashion"): "영국에서 애슬레저(조거/레깅스/후디)가 일상 패션 주류. TikTok 미니스커트 바이럴",
    ("GB", "products"): "영국에서 matcha/버섯커피 등 웰빙 제품과 에어퓨리파이어가 인기",
    ("GB", "food"): "영국에서 Poppi(프리바이오틱 소다)가 Tesco 입점. 건강 간식 트렌드",
    ("GB", "entertainment"): "영국에서 STEM 교육 완구와 피젯 토이가 TikTok 바이럴로 판매 견인",
    ("FR", "fashion"): "프랑스에서 패션이 여름 구매 41% 차지. 액세서리 검색량 2026년 2월 최고치",
    ("FR", "products"): "프랑스에서 유기농 제품 매출 30% 증가. 지속가능성과 로컬 제품 선호",
    ("FR", "food"): "프랑스에서 프리미엄 디저트와 장인 제과가 꾸준한 인기. 럭셔리 식문화",
    ("FR", "entertainment"): "프랑스에서 교육용 장난감과 크리에이티브 키트가 프리미엄 완구 시장 성장",
    ("DE", "fashion"): "독일에서 지속가능한 패션과 실용적 디자인이 트렌드. 유럽 최대 이커머스 시장",
    ("DE", "products"): "독일에서 Wero 디지털 결제 등 테크 제품 성장. 실용 가젯이 인기",
    ("DE", "food"): "독일에서 레트로 간식과 유기농 스낵이 인기. 지속가능한 식품 소비 트렌드",
    ("DE", "entertainment"): "독일에서 교육용/크리에이티브 완구가 인기. 유럽 최대 장난감 시장 중 하나",
    ("IT", "fashion"): "이탈리아에서 맥시멀리즘(XXL 주얼리/빅숄더)과 네오 로맨티시즘이 2026 트렌드",
    ("IT", "products"): "이탈리아에서 지속가능한 소재/재활용 제품이 트렌드 (Donna Moderna)",
    ("IT", "food"): "이탈리아에서 전통 장인 과자(비스코티/초콜릿)가 프리미엄 식문화로 꾸준한 인기",
    ("IT", "entertainment"): "이탈리아에서 피젯 토이와 STEM 교육 키트가 크리에이티브 놀이 트렌드",
    ("ES", "fashion"): "스페인에서 주얼리 수요 폭발. 카고팬츠/애슬레저가 인플루언서 통해 바이럴 (Accio 2026)",
    ("ES", "products"): "스페인에서 스마트 안경/실크 보닛캡이 인기. 친환경 제품 트렌드",
    ("ES", "food"): "스페인에서 수입 간식과 캐러멜 팝콘 등 퓨전 스낵이 젊은 층 사이에서 인기",
    ("ES", "entertainment"): "스페인에서 피젯 큐브/교육용 펜 키트 등 크리에이티브 장난감이 인기",
    ("SE", "fashion"): "스웨덴에서 미니멀/지속가능 패션이 트렌드. 패들 스포츠웨어 북유럽 인기 급상승",
    ("SE", "products"): "스웨덴에서 스마트 노트북/E-ink 태블릿이 디지털 웰빙 트렌드로 인기",
    ("SE", "food"): "스웨덴에서 저당/비건 간식과 북유럽 전통 캔디가 건강 트렌드와 함께 인기",
    ("SE", "entertainment"): "스웨덴에서 보드게임/퍼즐 등 가족 단위 놀이가 북유럽 실내문화로 인기",
    ("AU", "fashion"): "호주에서 액티브웨어/커스텀 의류가 이커머스 $80B+ 시장 성장과 함께 인기",
    ("AU", "products"): "호주에서 Whoop 등 웨어러블 헬스 트래커와 스마트태그가 인기. 펫케어 급성장",
    ("AU", "food"): "호주에서 프로틴 스낵/건강 간식이 피트니스 트렌드와 함께 급성장",
    ("AU", "entertainment"): "호주에서 스파이 키트/루빅스큐브 등 STEM/두뇌 장난감이 교육 트렌드로 인기",
    ("AE", "fashion"): "UAE에서 오버사이즈 패션과 글로벌 럭셔리 브랜드가 인기. 패들 스포츠웨어 트렌드",
    ("AE", "products"): "UAE에서 스마트 보틀/테크 가젯이 인기. 혁신 기술 수용도가 세계 최고 수준",
    ("AE", "food"): "UAE에서 수입 프리미엄 디저트와 영국/미국 간식이 다문화 소비자층에게 인기",
    ("AE", "entertainment"): "UAE에서 미니 드론/RC 등 테크 장난감이 혁신 제품에 대한 높은 관심으로 인기",
    ("ZA", "fashion"): "남아공에서 Mr Price 등 로컬 하이스트리트 브랜드가 가성비 패션으로 인기",
    ("ZA", "products"): "남아공에서 가성비 블루투스 기기와 스마트 보틀이 인기. 아프리카 이커머스 급성장",
    ("ZA", "food"): "남아공에서 수입 초콜릿/웨이퍼와 로컬 간식이 함께 인기",
    ("ZA", "entertainment"): "남아공에서 레고/UNO 등 글로벌 브랜드 완구와 카드게임이 가족 단위로 인기",

    # === 새 80개국 트렌드 이유 ===

    # 동아시아
    ("CN", "fashion"): "중국에서 Douyin 패션이 글로벌 바이럴. 국풍(国潮) 스타일이 Z세대 트렌드",
    ("CN", "products"): "중국에서 LED 투명 스크린/3D프린트 범퍼/자동 비누 디스펜서가 Douyin에서 인기",
    ("CN", "food"): "중국에서 라이브커머스를 통한 간식 판매 폭발. Douyin 먹방 콘텐츠가 소비 견인",
    ("CN", "entertainment"): "중국에서 블라인드박스/팝마트 피규어 등 수집형 완구가 Z세대 사이 대세",
    ("MN", "fashion"): "몽골에서 한류 영향의 K-패션과 전통 의상 현대화가 트렌드",
    ("MN", "products"): "몽골에서 가성비 스마트 기기와 방한용품이 인기",
    ("MN", "food"): "몽골에서 수입 한국/일본 간식과 유제품 간식이 인기",
    ("MN", "entertainment"): "몽골에서 모바일 게임 액세서리와 보드게임이 가족 단위로 인기",

    # 동남아시아
    ("PH", "fashion"): "필리핀에서 TikTok Shop이 5천만 유저 돌파. 뷰티/패션이 소셜커머스 핵심 카테고리",
    ("PH", "products"): "필리핀에서 AI 스터디핵 제품과 주방용품이 TikTok Shop 통해 인기",
    ("PH", "food"): "필리핀에서 한국 간식/라면이 K-웨이브와 함께 인기. 로컬 디저트도 SNS 바이럴",
    ("PH", "entertainment"): "필리핀에서 모바일 게임 액세서리와 K-pop 굿즈가 젊은 층에서 인기",
    ("MY", "fashion"): "말레이시아에서 모디스트 패션과 스포츠웨어가 동시에 성장. TikTok Shop 급성장",
    ("MY", "products"): "말레이시아에서 스킨케어/뷰티가 Shopee 판매 상위. 건강기능식품 수요 급증",
    ("MY", "food"): "말레이시아/태국에서 Neo-Traditional Food(수비드 톰얌 등) 트렌드",
    ("MY", "entertainment"): "말레이시아에서 K-pop/J-pop 굿즈와 보드게임이 가족/친구 사이 인기",
    ("ID", "fashion"): "인도네시아에서 TikTok Shop 패션이 급성장. 무슬림 모디스트 패션 시장 확대",
    ("ID", "products"): "인도네시아에서 가성비 스킨케어/뷰티가 Tokopedia/TikTok Shop 통해 확산",
    ("ID", "food"): "인도네시아에서 로컬 간식과 한국 수입 간식이 소셜 미디어 통해 인기",
    ("ID", "entertainment"): "인도네시아에서 모바일 게임 액세서리와 DIY 크래프트 키트가 젊은 층에서 인기",
    ("MM", "fashion"): "미얀마에서 소셜 커머스를 통한 패션 판매 성장. 전통 론지 현대화 트렌드",
    ("MM", "products"): "미얀마에서 가성비 스마트폰 액세서리와 뷰티 제품이 소셜 미디어 통해 인기",
    ("MM", "food"): "미얀마에서 로컬 차/간식과 태국/한국 수입 스낵이 인기",
    ("MM", "entertainment"): "미얀마에서 모바일 게임과 K-드라마 관련 굿즈가 인기",
    ("KH", "fashion"): "캄보디아에서 소셜 커머스 패션이 성장. 저가형 캐주얼웨어가 인기",
    ("KH", "products"): "캄보디아에서 가성비 전자제품과 뷰티 제품이 소셜 미디어 통해 확산",
    ("KH", "food"): "캄보디아에서 로컬 전통 간식과 베트남/태국 수입 스낵이 인기",
    ("KH", "entertainment"): "캄보디아에서 모바일 게임 액세서리와 DIY 완구가 젊은 층에서 인기",
    ("LA", "fashion"): "라오스에서 태국/베트남 영향 패션이 소셜 미디어 통해 확산",
    ("LA", "products"): "라오스에서 가성비 생활용품과 스마트폰 액세서리가 인기",
    ("LA", "food"): "라오스에서 태국/베트남 간식과 로컬 전통 간식이 인기",
    ("LA", "entertainment"): "라오스에서 태국 콘텐츠 관련 굿즈와 모바일 게임 액세서리가 인기",
    ("BN", "fashion"): "브루나이에서 모디스트 패션과 글로벌 브랜드가 소셜 커머스 통해 인기",
    ("BN", "products"): "브루나이에서 뷰티/스킨케어와 스마트 기기가 인기. 높은 구매력",
    ("BN", "food"): "브루나이에서 수입 프리미엄 간식과 할랄 인증 스낵이 인기",
    ("BN", "entertainment"): "브루나이에서 글로벌 브랜드 완구와 수집형 피규어가 인기",

    # 남아시아
    ("PK", "fashion"): "파키스탄에서 패션이 이커머스 28% 차지. 크로스 목걸이가 소셜 미디어 바이럴",
    ("PK", "products"): "파키스탄에서 전자제품이 이커머스 24%. 소셜커머스 35% 성장 전망",
    ("PK", "food"): "파키스탄에서 전통 미타이와 수입 간식이 젊은 층 사이에서 인기",
    ("PK", "entertainment"): "파키스탄에서 크리켓 관련 굿즈와 모바일 게임 액세서리가 인기",
    ("BD", "fashion"): "방글라데시에서 전통 의상 현대화와 저가 캐주얼 패션이 동시에 성장",
    ("BD", "products"): "방글라데시에서 가성비 스마트폰/액세서리와 뷰티 제품이 Daraz 통해 인기",
    ("BD", "food"): "방글라데시에서 전통 미스티(과자)와 수입 간식이 인기",
    ("BD", "entertainment"): "방글라데시에서 크리켓 관련 상품과 모바일 게임 액세서리가 인기",
    ("LK", "fashion"): "스리랑카에서 피트니스 의류/스포츠웨어가 인기. 실론 라이프스타일 트렌드",
    ("LK", "products"): "스리랑카에서 스마트홈 기기와 뷰티 제품이 인기 급상승",
    ("LK", "food"): "스리랑카에서 실론티 관련 간식과 전통 과자가 관광/선물 수요로 인기",
    ("LK", "entertainment"): "스리랑카에서 크리켓 관련 굿즈와 보드게임이 가족 단위로 인기",
    ("NP", "fashion"): "네팔에서 인도/한국 영향 패션이 소셜 미디어 통해 확산. 전통 직물 현대화",
    ("NP", "products"): "네팔에서 가성비 스마트 기기와 뷰티 제품이 Daraz 통해 인기",
    ("NP", "food"): "네팔에서 인도식 과자와 수입 간식이 축제 시즌에 인기",
    ("NP", "entertainment"): "네팔에서 보드게임과 DIY 크래프트가 가족 단위로 인기",

    # 중앙아시아
    ("KZ", "fashion"): "카자흐스탄에서 러시아/유럽 패션 트렌드가 Kaspi.kz 통해 확산",
    ("KZ", "products"): "카자흐스탄에서 가성비 전자제품과 뷰티 제품이 Kaspi.kz 통해 인기",
    ("KZ", "food"): "카자흐스탄에서 러시아/터키 수입 간식과 전통 유제품 간식이 인기",
    ("KZ", "entertainment"): "카자흐스탄에서 보드게임과 러시아 콘텐츠 관련 완구가 인기",
    ("UZ", "fashion"): "우즈베키스탄에서 전통 의상 현대화와 터키 패션 영향이 소셜 미디어 통해 확산",
    ("UZ", "products"): "우즈베키스탄에서 가성비 전자제품과 스마트폰 액세서리가 Uzum Market 통해 인기",
    ("UZ", "food"): "우즈베키스탄에서 전통 과자와 터키/러시아 수입 간식이 인기",
    ("UZ", "entertainment"): "우즈베키스탄에서 보드게임과 교육용 완구가 가족 단위로 인기",
    ("GE", "fashion"): "조지아에서 유럽풍 패션과 로컬 디자이너 브랜드가 성장",
    ("GE", "products"): "조지아에서 스마트 기기와 뷰티 제품이 Extra.ge 통해 인기",
    ("GE", "food"): "조지아에서 전통 와인/치즈 관련 간식과 유럽 수입 스낵이 인기",
    ("GE", "entertainment"): "조지아에서 보드게임과 유럽 브랜드 완구가 가족 단위로 인기",

    # 중동
    ("SA", "fashion"): "사우디에서 패션/온라인게임/B2B가 최고 성장 카테고리. 럭셔리 패션 강세",
    ("SA", "products"): "사우디에서 웰빙/건강식 구독서비스 인기. 고급 테크제품에 대한 관심 높음",
    ("SA", "food"): "사우디에서 건강식 구독서비스와 프리미엄 수입 간식이 인기",
    ("SA", "entertainment"): "사우디에서 e스포츠/온라인게임 시장 급성장. 테크 장난감 인기",
    ("QA", "fashion"): "카타르에서 럭셔리 패션과 스포츠웨어가 높은 구매력으로 인기",
    ("QA", "products"): "카타르에서 프리미엄 테크 가젯과 웰빙 제품이 인기. 혁신 수용도 높음",
    ("QA", "food"): "카타르에서 프리미엄 수입 디저트와 건강 스낵이 다국적 소비자층에게 인기",
    ("QA", "entertainment"): "카타르에서 테크 장난감과 프리미엄 보드게임이 인기",
    ("KW", "fashion"): "쿠웨이트에서 글로벌 럭셔리 브랜드와 모디스트 패션이 동시에 인기",
    ("KW", "products"): "쿠웨이트에서 프리미엄 뷰티/스킨케어와 스마트 기기가 인기",
    ("KW", "food"): "쿠웨이트에서 수입 프리미엄 간식과 건강 스낵이 인기",
    ("KW", "entertainment"): "쿠웨이트에서 게임 콘솔 액세서리와 레고가 인기",
    ("BH", "fashion"): "바레인에서 중동 모디스트 패션과 글로벌 브랜드가 온라인으로 성장",
    ("BH", "products"): "바레인에서 스마트 기기와 뷰티 제품이 Noon 통해 인기",
    ("BH", "food"): "바레인에서 수입 간식과 로컬 대추야자 디저트가 인기",
    ("BH", "entertainment"): "바레인에서 보드게임과 게임 액세서리가 젊은 층에서 인기",
    ("OM", "fashion"): "오만에서 전통 의상과 모던 패션의 융합이 트렌드",
    ("OM", "products"): "오만에서 스마트 기기와 자동차 액세서리가 인기",
    ("OM", "food"): "오만에서 아랍 전통 과자와 수입 프리미엄 간식이 인기",
    ("OM", "entertainment"): "오만에서 가족 단위 보드게임과 아웃도어 장비가 인기",
    ("IL", "fashion"): "이스라엘에서 테크웨어와 미니멀 패션이 스타트업 문화와 함께 인기",
    ("IL", "products"): "이스라엘에서 스타트업 혁신 제품과 스마트홈 기기가 인기. 테크 허브",
    ("IL", "food"): "이스라엘에서 비건/글루텐프리 간식과 중동식 디저트가 인기",
    ("IL", "entertainment"): "이스라엘에서 STEM 교육 키트와 보드게임이 높은 교육열로 인기",
    ("TR", "fashion"): "튀르키예에서 Trendyol 통한 패션 이커머스 급성장. 모디스트/캐주얼 동시 인기",
    ("TR", "products"): "튀르키예에서 가성비 전자제품과 뷰티 제품이 Trendyol/Hepsiburada 통해 인기",
    ("TR", "food"): "튀르키예에서 전통 과자(로쿰/바클라바)와 수입 간식이 인기",
    ("TR", "entertainment"): "튀르키예에서 보드게임과 교육용 완구가 가족 단위로 인기",

    # 북아프리카
    ("EG", "fashion"): "이집트에서 저가 패션과 전통 의상 현대화가 Jumia 통해 성장",
    ("EG", "products"): "이집트에서 저가 스마트폰($100~$200)과 스마트 기기가 폭발적 성장",
    ("EG", "food"): "이집트에서 전통 과자(바스부사/쿠나파)와 수입 간식이 인기",
    ("EG", "entertainment"): "이집트에서 모바일 게임 액세서리와 저가형 완구가 인기",
    ("MA", "fashion"): "모로코에서 전통 젤라바 현대화와 유럽풍 패션이 동시에 인기",
    ("MA", "products"): "모로코에서 뷰티/스킨케어와 가성비 전자제품이 Jumia MA 통해 성장",
    ("MA", "food"): "모로코에서 전통 과자와 프랑스 수입 디저트가 인기",
    ("MA", "entertainment"): "모로코에서 보드게임과 교육용 완구가 가족 단위로 인기",
    ("TN", "fashion"): "튀니지에서 유럽풍 패션과 전통 의상이 소셜 미디어 통해 확산",
    ("TN", "products"): "튀니지에서 가성비 전자제품과 뷰티 제품이 온라인으로 성장",
    ("TN", "food"): "튀니지에서 전통 과자와 프랑스 수입 간식이 인기",
    ("TN", "entertainment"): "튀니지에서 보드게임과 교육용 완구가 가족 단위로 인기",
    ("DZ", "fashion"): "알제리에서 전통 의상과 프랑스풍 패션이 동시에 인기",
    ("DZ", "products"): "알제리에서 가성비 스마트폰과 생활 전자제품이 인기",
    ("DZ", "food"): "알제리에서 전통 과자(마크루드 등)와 수입 간식이 인기",
    ("DZ", "entertainment"): "알제리에서 가족 단위 보드게임과 축구 관련 굿즈가 인기",

    # 서아프리카
    ("NG", "fashion"): "나이지리아에서 의류/신발이 이커머스 24.4%. 저가 패션 폭발적 성장",
    ("NG", "products"): "나이지리아에서 저가 스마트폰($100~$200) 25% 성장. 가성비 기기 폭발적 인기",
    ("NG", "food"): "나이지리아에서 로컬 간식과 수입 과자가 소셜 미디어 통해 인기",
    ("NG", "entertainment"): "나이지리아에서 모바일 게임과 Nollywood 관련 굿즈가 인기",
    ("GH", "fashion"): "가나에서 전통 켄테 현대화와 저가 패션이 동시에 성장",
    ("GH", "products"): "가나에서 가성비 스마트폰과 전자제품이 Jumia 통해 인기",
    ("GH", "food"): "가나에서 로컬 전통 간식과 수입 초콜릿이 인기",
    ("GH", "entertainment"): "가나에서 모바일 게임과 축구 관련 굿즈가 젊은 층에서 인기",
    ("SN", "fashion"): "세네갈에서 전통 의상 현대화와 프랑스풍 패션이 동시에 인기",
    ("SN", "products"): "세네갈에서 가성비 스마트폰과 뷰티 제품이 소셜 커머스 통해 확산",
    ("SN", "food"): "세네갈에서 로컬 전통 간식과 프랑스 수입 과자가 인기",
    ("SN", "entertainment"): "세네갈에서 축구 관련 굿즈와 보드게임이 인기",

    # 동/남아프리카
    ("KE", "fashion"): "케냐에서 저가 패션과 전통 키텡게 현대화가 Jumia 통해 성장",
    ("KE", "products"): "케냐에서 M-Pesa 연계 스마트 기기와 가성비 전자제품이 인기",
    ("KE", "food"): "케냐에서 로컬 간식과 수입 과자가 도시 젊은 층 사이에서 인기",
    ("KE", "entertainment"): "케냐에서 보드게임과 모바일 게임 액세서리가 인기",
    ("ET", "fashion"): "에티오피아에서 전통 의상 현대화와 저가 캐주얼 패션이 성장",
    ("ET", "products"): "에티오피아에서 가성비 스마트폰과 태양열 충전기가 인기",
    ("ET", "food"): "에티오피아에서 전통 인제라 간식과 커피 관련 제품이 인기",
    ("ET", "entertainment"): "에티오피아에서 보드게임과 축구 관련 굿즈가 인기",
    ("TZ", "fashion"): "탄자니아에서 전통 의상과 동아프리카 패션이 소셜 미디어 통해 확산",
    ("TZ", "products"): "탄자니아에서 가성비 스마트폰과 태양열 기기가 인기",
    ("TZ", "food"): "탄자니아에서 로컬 간식과 수입 과자가 도시 지역에서 인기",
    ("TZ", "entertainment"): "탄자니아에서 보드게임과 축구 관련 굿즈가 인기",

    # 중미/카리브
    ("CO", "fashion"): "콜롬비아에서 LED 갤럭시 프로젝터/LED 마스크/립오일이 TikTok 바이럴. $10~$30 가격대",
    ("CO", "products"): "콜롬비아에서 가성비 전자제품과 뷰티 제품이 Mercado Libre 통해 인기",
    ("CO", "food"): "콜롬비아에서 로컬 간식과 수입 미국 스낵이 젊은 층에서 인기",
    ("CO", "entertainment"): "콜롬비아에서 수집형 피규어와 보드게임이 소셜 미디어 통해 인기",
    ("PA", "fashion"): "파나마에서 미국/멕시코 패션 트렌드가 소셜 미디어 통해 확산",
    ("PA", "products"): "파나마에서 면세점 테크 제품과 뷰티 아이템이 인기",
    ("PA", "food"): "파나마에서 중남미 전통 간식과 미국 수입 스낵이 인기",
    ("PA", "entertainment"): "파나마에서 보드게임과 글로벌 브랜드 완구가 인기",
    ("CR", "fashion"): "코스타리카에서 에코/지속가능 패션이 환경 의식과 함께 성장",
    ("CR", "products"): "코스타리카에서 에코 제품과 가성비 전자제품이 인기",
    ("CR", "food"): "코스타리카에서 로컬 커피 관련 간식과 수입 스낵이 인기",
    ("CR", "entertainment"): "코스타리카에서 아웃도어 장비와 에코 완구가 인기",

    # 남미
    ("AR", "fashion"): "아르헨티나에서 LED 갤럭시 프로젝터/LED 마스크/립오일이 TikTok 바이럴. $10~$30",
    ("AR", "products"): "아르헨티나에서 가성비 전자제품과 뷰티 아이템이 Mercado Libre 통해 인기",
    ("AR", "food"): "아르헨티나에서 알파호르/둘세 데 레체 간식과 수입 스낵이 인기",
    ("AR", "entertainment"): "아르헨티나에서 수집형 피규어와 축구 관련 굿즈가 인기",
    ("CL", "fashion"): "칠레에서 LED 마스크/립오일이 TikTok 바이럴. 지속가능 패션도 성장",
    ("CL", "products"): "칠레에서 테크 가젯과 뷰티 제품이 Falabella/Mercado Libre 통해 인기",
    ("CL", "food"): "칠레에서 로컬 간식과 수입 스낵이 젊은 층에서 인기",
    ("CL", "entertainment"): "칠레에서 보드게임과 수집형 피규어가 가족/젊은 층에서 인기",
    ("PE", "fashion"): "페루에서 전통 직물 현대화와 캐주얼 패션이 동시에 성장",
    ("PE", "products"): "페루에서 가성비 전자제품과 뷰티 제품이 Mercado Libre 통해 인기",
    ("PE", "food"): "페루에서 전통 간식과 수입 스낵이 소셜 미디어 통해 인기",
    ("PE", "entertainment"): "페루에서 보드게임과 교육용 완구가 가족 단위로 인기",
    ("EC", "fashion"): "에콰도르에서 캐주얼 패션과 전통 의상이 소셜 미디어 통해 확산",
    ("EC", "products"): "에콰도르에서 가성비 전자제품과 뷰티 제품이 인기",
    ("EC", "food"): "에콰도르에서 로컬 초콜릿 간식과 수입 스낵이 인기",
    ("EC", "entertainment"): "에콰도르에서 보드게임과 축구 관련 굿즈가 인기",

    # 서유럽
    ("NL", "fashion"): "네덜란드에서 지속가능/미니멀 패션이 트렌드. Bol.com 통한 온라인 패션 성장",
    ("NL", "products"): "네덜란드에서 스마트홈 기기와 자전거 액세서리가 인기. Coolblue 통해 확산",
    ("NL", "food"): "네덜란드에서 유기농/비건 간식과 전통 스트루프와플이 인기",
    ("NL", "entertainment"): "네덜란드에서 교육용 완구와 보드게임이 가족 단위로 인기",
    ("BE", "fashion"): "벨기에에서 프랑스/네덜란드 패션 트렌드가 동시에 유입. 지속가능 패션 성장",
    ("BE", "products"): "벨기에에서 스마트 기기와 뷰티 제품이 인기. Coolblue/Bol.com 통해 확산",
    ("BE", "food"): "벨기에에서 프리미엄 초콜릿과 와플 관련 간식이 인기",
    ("BE", "entertainment"): "벨기에에서 교육용 완구와 보드게임이 가족 단위로 인기",
    ("LU", "fashion"): "룩셈부르크에서 프리미엄 패션과 유럽 럭셔리 브랜드가 높은 구매력으로 인기",
    ("LU", "products"): "룩셈부르크에서 프리미엄 테크 가젯과 스마트홈 기기가 인기",
    ("LU", "food"): "룩셈부르크에서 프리미엄 유럽 디저트와 유기농 간식이 인기",
    ("LU", "entertainment"): "룩셈부르크에서 프리미엄 보드게임과 교육용 완구가 인기",
    ("AT", "fashion"): "오스트리아에서 독일/이탈리아 패션 트렌드가 동시에 유입. 지속가능 패션 성장",
    ("AT", "products"): "오스트리아에서 스마트 기기와 친환경 제품이 인기",
    ("AT", "food"): "오스트리아에서 전통 과자(자허토르테 등)와 유기농 간식이 인기",
    ("AT", "entertainment"): "오스트리아에서 교육용/크리에이티브 완구가 인기",

    # 남유럽
    ("PT", "fashion"): "포르투갈에서 스페인 패션 트렌드 유입. 지속가능/로컬 브랜드 성장",
    ("PT", "products"): "포르투갈에서 가성비 전자제품과 뷰티 제품이 Worten 통해 인기",
    ("PT", "food"): "포르투갈에서 전통 과자(파스텔 드 나타 등)와 수입 간식이 인기",
    ("PT", "entertainment"): "포르투갈에서 보드게임과 교육용 완구가 가족 단위로 인기",
    ("GR", "fashion"): "그리스에서 지중해 스타일 패션과 글로벌 브랜드가 Skroutz 통해 인기",
    ("GR", "products"): "그리스에서 가성비 전자제품과 뷰티 제품이 Skroutz/Public.gr 통해 인기",
    ("GR", "food"): "그리스에서 전통 디저트(바클라바 등)와 올리브 간식이 인기",
    ("GR", "entertainment"): "그리스에서 보드게임과 교육용 완구가 가족 단위로 인기",
    ("HR", "fashion"): "크로아티아에서 이탈리아 패션 트렌드 유입. 관광 시즌 리조트웨어 인기",
    ("HR", "products"): "크로아티아에서 가성비 전자제품과 뷰티 제품이 eKupi 통해 인기",
    ("HR", "food"): "크로아티아에서 전통 과자와 유럽 수입 간식이 인기",
    ("HR", "entertainment"): "크로아티아에서 보드게임과 아웃도어 장비가 인기",

    # 북유럽
    ("NO", "fashion"): "노르웨이에서 패션 온라인구매 50%+. 지속가능/에코 소비. 가격민감도 증가",
    ("NO", "products"): "노르웨이에서 스마트홈 기기와 아웃도어 장비가 인기. 높은 구매력",
    ("NO", "food"): "노르웨이에서 유기농/건강 간식과 전통 캔디가 인기",
    ("NO", "entertainment"): "노르웨이에서 보드게임과 아웃도어 장비가 북유럽 실내/아웃도어 문화로 인기",
    ("DK", "fashion"): "덴마크에서 패션 온라인구매 50%+. H&M/Zalando. 지속가능/에코 소비 트렌드",
    ("DK", "products"): "덴마크에서 스마트홈 기기와 디자인 제품이 인기. 높은 디자인 감각",
    ("DK", "food"): "덴마크에서 유기농/비건 간식과 뉴노르딕 디저트가 인기",
    ("DK", "entertainment"): "덴마크에서 레고 본고장답게 크리에이티브 완구가 인기. 보드게임 문화",
    ("FI", "fashion"): "핀란드에서 미니멀/기능성 패션이 트렌드. Marimekko 등 로컬 브랜드 강세",
    ("FI", "products"): "핀란드에서 사우나 관련 제품과 스마트홈 기기가 인기",
    ("FI", "food"): "핀란드에서 유기농 간식과 베리류 디저트가 건강 트렌드와 함께 인기",
    ("FI", "entertainment"): "핀란드에서 보드게임과 아웃도어 장비가 북유럽 라이프스타일로 인기",
    ("IS", "fashion"): "아이슬란드에서 아웃도어/기능성 패션과 미니멀 디자인이 트렌드",
    ("IS", "products"): "아이슬란드에서 아웃도어 장비와 스마트홈 기기가 인기",
    ("IS", "food"): "아이슬란드에서 유기농 간식과 전통 스카이르(요거트) 관련 제품이 인기",
    ("IS", "entertainment"): "아이슬란드에서 보드게임과 크리에이티브 완구가 가족 단위로 인기",

    # 동유럽
    ("PL", "fashion"): "폴란드에서 Temu 인기. 12V 발열재킷/카고팬츠/와이드레그팬츠 트렌드",
    ("PL", "products"): "폴란드에서 PDRN 스킨케어와 가성비 테크 제품이 Allegro 통해 인기",
    ("PL", "food"): "폴란드에서 전통 과자와 유기농 간식이 인기",
    ("PL", "entertainment"): "폴란드에서 보드게임과 교육용 완구가 유럽 트렌드와 함께 인기",
    ("CZ", "fashion"): "체코에서 Temu/Zalando 통한 패션 이커머스 성장. 캐주얼/스트리트 인기",
    ("CZ", "products"): "체코에서 가성비 전자제품과 뷰티 제품이 Alza.cz 통해 인기",
    ("CZ", "food"): "체코에서 전통 과자(트르들로 등)와 유럽 수입 간식이 인기",
    ("CZ", "entertainment"): "체코에서 보드게임과 교육용 완구가 가족 단위로 인기",
    ("HU", "fashion"): "헝가리에서 Temu/eMAG 통한 패션 이커머스 성장. 가성비 패션 인기",
    ("HU", "products"): "헝가리에서 가성비 전자제품과 뷰티 제품이 eMAG/Alza 통해 인기",
    ("HU", "food"): "헝가리에서 전통 과자(쿠르토슈 등)와 유럽 수입 간식이 인기",
    ("HU", "entertainment"): "헝가리에서 보드게임과 교육용 완구가 가족 단위로 인기",
    ("RO", "fashion"): "루마니아에서 eMAG/Fashion Days 통한 패션 이커머스 급성장",
    ("RO", "products"): "루마니아에서 가성비 전자제품과 뷰티 제품이 eMAG 통해 인기",
    ("RO", "food"): "루마니아에서 전통 과자와 유럽 수입 간식이 인기",
    ("RO", "entertainment"): "루마니아에서 보드게임과 교육용 완구가 가족 단위로 인기",
    ("BG", "fashion"): "불가리아에서 eMAG/Temu 통한 패션 이커머스 성장. 가성비 패션 인기",
    ("BG", "products"): "불가리아에서 가성비 전자제품과 뷰티 제품이 eMAG 통해 인기",
    ("BG", "food"): "불가리아에서 전통 요거트 관련 간식과 유럽 수입 스낵이 인기",
    ("BG", "entertainment"): "불가리아에서 보드게임과 교육용 완구가 가족 단위로 인기",
    ("UA", "fashion"): "우크라이나에서 Rozetka/Kasta 통한 패션 이커머스 성장. 로컬 디자이너 지원 트렌드",
    ("UA", "products"): "우크라이나에서 가성비 전자제품과 뷰티 제품이 Rozetka 통해 인기",
    ("UA", "food"): "우크라이나에서 전통 과자와 수입 간식이 인기",
    ("UA", "entertainment"): "우크라이나에서 보드게임과 교육용 완구가 인기",
    ("RS", "fashion"): "세르비아에서 유럽 패션 트렌드가 이커머스 통해 확산. 가성비 패션 인기",
    ("RS", "products"): "세르비아에서 가성비 전자제품과 뷰티 제품이 온라인으로 성장",
    ("RS", "food"): "세르비아에서 전통 과자와 유럽 수입 간식이 인기",
    ("RS", "entertainment"): "세르비아에서 보드게임과 교육용 완구가 가족 단위로 인기",

    # 오세아니아
    ("NZ", "fashion"): "뉴질랜드에서 호주와 유사한 액티브웨어/아웃도어 패션 트렌드",
    ("NZ", "products"): "뉴질랜드에서 스마트홈 기기/피트니스 트래커가 인기. 호주와 유사 트렌드",
    ("NZ", "food"): "뉴질랜드에서 건강 간식과 마누카꿀 관련 제품이 인기",
    ("NZ", "entertainment"): "뉴질랜드에서 아웃도어 장비와 보드게임이 인기",
    ("FJ", "fashion"): "피지에서 리조트웨어와 아웃도어 패션이 관광 수요와 함께 인기",
    ("FJ", "products"): "피지에서 태양열 기기와 가성비 전자제품이 인기",
    ("FJ", "food"): "피지에서 로컬 열대과일 간식과 수입 스낵이 인기",
    ("FJ", "entertainment"): "피지에서 아웃도어 장비와 수상 스포츠 용품이 인기",

    # === 추가 20개국 ===
    ("TL", "fashion"): "동티모르에서 캐주얼 패션과 전통 타이스 직물 현대화가 트렌드",
    ("TL", "products"): "동티모르에서 가성비 스마트폰과 태양열 기기가 인기",
    ("TL", "food"): "동티모르에서 로컬 커피 간식과 수입 스낵이 인기",
    ("TL", "entertainment"): "동티모르에서 모바일 게임과 축구 관련 굿즈가 인기",

    ("AF", "fashion"): "아프가니스탄에서 전통 의상과 캐주얼 패션이 소셜 미디어 통해 확산",
    ("AF", "products"): "아프가니스탄에서 가성비 스마트폰과 태양열 충전기가 인기",
    ("AF", "food"): "아프가니스탄에서 전통 과자(잘레비 등)와 견과류 간식이 인기",
    ("AF", "entertainment"): "아프가니스탄에서 크리켓 관련 굿즈와 보드게임이 인기",

    ("AZ", "fashion"): "아제르바이잔에서 유럽/터키 패션 트렌드가 소셜 미디어 통해 확산",
    ("AZ", "products"): "아제르바이잔에서 스마트 기기와 뷰티 제품이 Umico 통해 인기",
    ("AZ", "food"): "아제르바이잔에서 전통 과자(바클라바 등)와 터키 수입 간식이 인기",
    ("AZ", "entertainment"): "아제르바이잔에서 보드게임과 교육용 완구가 인기",

    ("TM", "fashion"): "투르크메니스탄에서 전통 의상과 캐주얼 패션이 함께 인기",
    ("TM", "products"): "투르크메니스탄에서 가성비 전자제품과 생활용품이 인기",
    ("TM", "food"): "투르크메니스탄에서 전통 과자와 러시아/터키 수입 간식이 인기",
    ("TM", "entertainment"): "투르크메니스탄에서 보드게임과 교육용 완구가 가족 단위로 인기",

    ("JO", "fashion"): "요르단에서 모디스트 패션과 글로벌 브랜드가 소셜 커머스 통해 성장",
    ("JO", "products"): "요르단에서 스마트 기기와 뷰티 제품이 Noon/OpenSooq 통해 인기",
    ("JO", "food"): "요르단에서 아랍 전통 과자와 수입 간식이 인기",
    ("JO", "entertainment"): "요르단에서 보드게임과 교육용 키트가 가족 단위로 인기",

    ("LB", "fashion"): "레바논에서 프랑스풍 패션과 중동 모디스트 패션이 동시에 인기",
    ("LB", "products"): "레바논에서 뷰티/스킨케어 제품이 인기. 프랑스 화장품 선호",
    ("LB", "food"): "레바논에서 전통 과자(바클라바/마아물)와 프랑스 수입 디저트가 인기",
    ("LB", "entertainment"): "레바논에서 보드게임과 교육용 완구가 인기",

    ("UG", "fashion"): "우간다에서 저가 패션과 전통 의상이 Jumia 통해 성장",
    ("UG", "products"): "우간다에서 가성비 스마트폰과 태양열 기기가 인기",
    ("UG", "food"): "우간다에서 로컬 간식과 수입 과자가 도시 지역에서 인기",
    ("UG", "entertainment"): "우간다에서 축구 관련 굿즈와 보드게임이 인기",

    ("CI", "fashion"): "코트디부아르에서 전통 직물 현대화와 프랑스풍 패션이 동시에 인기",
    ("CI", "products"): "코트디부아르에서 가성비 스마트폰과 뷰티 제품이 Jumia 통해 확산",
    ("CI", "food"): "코트디부아르에서 로컬 전통 간식과 프랑스 수입 과자가 인기",
    ("CI", "entertainment"): "코트디부아르에서 축구 관련 굿즈와 보드게임이 인기",

    ("CM", "fashion"): "카메룬에서 전통 의상과 프랑스풍 패션이 소셜 미디어 통해 확산",
    ("CM", "products"): "카메룬에서 가성비 스마트폰과 전자제품이 Jumia 통해 인기",
    ("CM", "food"): "카메룬에서 로컬 간식과 수입 과자가 도시 지역에서 인기",
    ("CM", "entertainment"): "카메룬에서 축구 관련 굿즈와 보드게임이 인기",

    ("MZ", "fashion"): "모잠비크에서 전통 카풀라나 직물 현대화와 저가 패션이 성장",
    ("MZ", "products"): "모잠비크에서 가성비 스마트폰과 태양열 기기가 인기",
    ("MZ", "food"): "모잠비크에서 로컬 간식과 수입 과자가 도시 지역에서 인기",
    ("MZ", "entertainment"): "모잠비크에서 축구 관련 굿즈와 보드게임이 인기",

    ("UY", "fashion"): "우루과이에서 캐주얼 패션과 지속가능 브랜드가 성장",
    ("UY", "products"): "우루과이에서 테크 가젯과 뷰티 제품이 Mercado Libre 통해 인기",
    ("UY", "food"): "우루과이에서 알파호르와 수입 간식이 인기",
    ("UY", "entertainment"): "우루과이에서 보드게임과 축구 관련 굿즈가 인기",

    ("BO", "fashion"): "볼리비아에서 전통 직물 현대화와 캐주얼 패션이 동시에 성장",
    ("BO", "products"): "볼리비아에서 가성비 전자제품과 뷰티 제품이 인기",
    ("BO", "food"): "볼리비아에서 전통 간식과 수입 스낵이 인기",
    ("BO", "entertainment"): "볼리비아에서 보드게임과 교육용 완구가 가족 단위로 인기",

    ("PY", "fashion"): "파라과이에서 캐주얼 패션과 브라질 패션 트렌드가 유입",
    ("PY", "products"): "파라과이에서 가성비 전자제품과 뷰티 제품이 인기",
    ("PY", "food"): "파라과이에서 전통 간식(치파 등)과 수입 스낵이 인기",
    ("PY", "entertainment"): "파라과이에서 축구 관련 굿즈와 보드게임이 인기",

    ("DO", "fashion"): "도미니카공화국에서 캐리비안 리조트웨어와 미국 패션 트렌드가 인기",
    ("DO", "products"): "도미니카공화국에서 가성비 전자제품과 뷰티 제품이 인기",
    ("DO", "food"): "도미니카공화국에서 로컬 간식과 미국 수입 스낵이 인기",
    ("DO", "entertainment"): "도미니카공화국에서 야구 관련 굿즈와 보드게임이 인기",

    ("JM", "fashion"): "자메이카에서 레게/스트릿 패션과 미국 패션 트렌드가 동시에 인기",
    ("JM", "products"): "자메이카에서 가성비 전자제품과 뷰티 제품이 인기",
    ("JM", "food"): "자메이카에서 로컬 간식(저크 시즈닝 등)과 수입 스낵이 인기",
    ("JM", "entertainment"): "자메이카에서 음악 관련 굿즈와 보드게임이 인기",

    ("SK", "fashion"): "슬로바키아에서 Temu/Zalando 통한 패션 이커머스 성장. 가성비 패션 인기",
    ("SK", "products"): "슬로바키아에서 가성비 전자제품과 뷰티 제품이 Alza.sk 통해 인기",
    ("SK", "food"): "슬로바키아에서 전통 과자와 유럽 수입 간식이 인기",
    ("SK", "entertainment"): "슬로바키아에서 보드게임과 교육용 완구가 가족 단위로 인기",

    ("SI", "fashion"): "슬로베니아에서 이탈리아/독일 패션 트렌드 유입. 지속가능 패션 성장",
    ("SI", "products"): "슬로베니아에서 스마트 기기와 뷰티 제품이 Mimovrste 통해 인기",
    ("SI", "food"): "슬로베니아에서 전통 과자와 유럽 수입 간식이 인기",
    ("SI", "entertainment"): "슬로베니아에서 아웃도어 장비와 보드게임이 인기",

    ("LT", "fashion"): "리투아니아에서 북유럽/독일 패션 트렌드가 이커머스 통해 확산",
    ("LT", "products"): "리투아니아에서 가성비 전자제품과 뷰티 제품이 Pigu.lt 통해 인기",
    ("LT", "food"): "리투아니아에서 전통 과자와 유럽 수입 간식이 인기",
    ("LT", "entertainment"): "리투아니아에서 보드게임과 교육용 완구가 가족 단위로 인기",

    ("IE", "fashion"): "아일랜드에서 영국 패션 트렌드 유입. ASOS/Zalando 통한 온라인 쇼핑 성장",
    ("IE", "products"): "아일랜드에서 스마트홈 기기와 뷰티 제품이 Amazon.ie 통해 인기",
    ("IE", "food"): "아일랜드에서 유기농 간식과 영국 수입 스낵이 인기",
    ("IE", "entertainment"): "아일랜드에서 보드게임과 교육용 완구가 가족 단위로 인기",

    ("IQ", "fashion"): "이라크에서 전통 의상과 모디스트 패션이 소셜 미디어 통해 성장",
    ("IQ", "products"): "이라크에서 가성비 스마트폰과 전자제품이 인기",
    ("IQ", "food"): "이라크에서 전통 과자와 중동 수입 간식이 인기",
    ("IQ", "entertainment"): "이라크에서 모바일 게임과 축구 관련 굿즈가 인기",
}

# ================================================================
# 카테고리별 상품 템플릿 (새 국가용)
# ================================================================
PRODUCT_TEMPLATES = {
    "fashion": [
        ("오버사이즈 후디", "오버사이즈 캐주얼 후디. 편안한 착용감으로 데일리룩으로 인기"),
        ("와이드 카고 팬츠", "와이드핏 카고팬츠. 스트릿 패션 트렌드로 인기"),
        ("크롭 니트 가디건", "크롭 기장 니트 가디건. 레이어드 필수 아이템"),
        ("슬림핏 스트레이트 진", "슬림핏 스트레이트 데님진. 기본 아이템으로 꾸준한 수요"),
        ("미니멀 토트백", "미니멀 디자인 토트백. 데일리/오피스룩 겸용"),
        ("스포츠 레깅스", "하이웨이스트 스포츠 레깅스. 운동/일상 겸용"),
        ("캐주얼 스니커즈", "경량 캐주얼 스니커즈. 편안한 데일리 슈즈"),
        ("린넨 셔츠", "여름용 린넨 셔츠. 통기성 좋은 소재"),
        ("모디스트 롱 원피스", "모디스트 디자인 롱 원피스. 우아한 실루엣"),
        ("스트릿 캡 모자", "유니섹스 스트릿 캡. 로고 디자인 포인트"),
    ],
    "products": [
        ("무선 블루투스 이어버즈", "액티브 노이즈캔슬링 무선 이어버즈. 긴 배터리 수명"),
        ("휴대용 보조배터리 10000mAh", "슬림 디자인 보조배터리. USB-C 고속충전 지원"),
        ("LED 데스크 램프", "밝기/색온도 조절 LED 램프. 학습/재택근무용"),
        ("스마트 체중계", "체지방/근육량 측정 스마트 체중계. 앱 연동"),
        ("미니 공기청정기", "USB 전원 미니 공기청정기. 책상/차량용"),
        ("스마트워치 밴드", "실리콘 스마트워치 교체 밴드. 다양한 컬러"),
        ("뷰티 LED 미러", "LED 조명 내장 화장 거울. 밝기 조절 가능"),
        ("자동 비누 디스펜서", "터치리스 자동 비누 디스펜서. 위생적"),
        ("보온보냉 텀블러", "진공 단열 보온보냉 텀블러. 12시간 보온"),
        ("전동 두피 마사지기", "방수 전동 두피 마사지기. 두피 케어용"),
    ],
    "food": [
        ("프리미엄 초콜릿 세트", "프리미엄 수제 초콜릿 세트. 선물용으로 인기"),
        ("견과류 믹스 스낵", "하루 견과 믹스 스낵팩. 건강 간식으로 인기"),
        ("그래놀라 바", "유기농 그래놀라 에너지바. 간편한 건강 간식"),
        ("전통 쿠키 세트", "수제 전통 쿠키 세트. 축제/선물용 인기"),
        ("말차 파우더", "프리미엄 말차 파우더. 라떼/디저트 재료"),
        ("프로틴 스낵 바", "고단백 프로틴 스낵바. 운동 후 간식"),
        ("비건 젤리", "식물성 비건 젤리. 건강한 간식 트렌드"),
        ("드립백 커피 세트", "프리미엄 드립백 커피 세트. 간편한 홈카페"),
        ("건과일 칩스", "무첨가 건과일 칩스. 자연 그대로의 달콤함"),
        ("허브티 세트", "유기농 허브티 세트. 릴렉스 시간을 위한 차"),
    ],
    "entertainment": [
        ("3D 퍼즐 키트", "3D 조립 퍼즐 키트. 집중력/창의력 발달"),
        ("미니 보드게임", "가족용 미니 보드게임. 2~4인용"),
        ("LED 갤럭시 프로젝터", "LED 별빛 프로젝터. 방 분위기 조명"),
        ("DIY 미니어처 하우스", "조립식 미니어처 하우스 키트. 취미/인테리어"),
        ("피젯 큐브", "스트레스 해소용 피젯 큐브. 다양한 기능"),
        ("수집형 피규어", "인기 캐릭터 수집형 피규어. 블라인드박스"),
        ("마그네틱 블록", "자석 조립 블록. STEM 교육용 완구"),
        ("카드 게임 세트", "가족/친구용 카드게임. 파티게임으로 인기"),
        ("RC 미니카", "리모컨 미니카. 실내/실외 주행"),
        ("색칠 키트 세트", "성인용 색칠 키트. 힐링/스트레스 해소"),
    ],
}


# ================================================================
# 유틸리티 함수
# ================================================================

def escape_sql(s: str) -> str:
    """SQL 문자열 이스케이프"""
    if not s:
        return ""
    return s.replace("'", "''").replace("\\", "\\\\")


def convert_price_usd(price_str: str) -> float:
    """원본 가격 문자열에서 USD 추정값 추출"""
    if not price_str:
        return 15.0  # 기본값

    # 유럽/남아공 방식 (47,99 €, R 199,99) -> 소수점으로 변환
    # 패턴: "숫자.숫자,숫자숫자" (독일식 1.234,56) 또는 "숫자,숫자숫자" (47,99)
    cleaned = price_str

    # "1.234,56" -> "1234.56" (독일식 천단위 구분)
    if re.search(r'\d+\.\d{3},\d{2}', cleaned):
        cleaned = cleaned.replace('.', '').replace(',', '.')
    # "1 234,56" -> "1234.56" (공백 천단위 구분)
    elif re.search(r'\d+\s\d{3},\d{2}', cleaned):
        cleaned = cleaned.replace(' ', '').replace(',', '.')
    # "199,99" -> "199.99" (쉼표가 소수점)
    elif re.search(r'\d+,\d{2}$', cleaned) or re.search(r'\d+,\d{2}[^0-9]', cleaned):
        cleaned = cleaned.replace(',', '.')
    # 그 외는 쉼표를 천단위 구분으로 간주하고 제거
    else:
        cleaned = cleaned.replace(',', '')

    # 숫자 추출
    nums = re.findall(r'[\d]+\.?\d*', cleaned)
    if not nums:
        return 15.0

    val = float(nums[0])

    # 통화별 USD 변환 (대략적)
    if '₩' in price_str or 'KRW' in price_str:
        return val / 1350
    elif '¥' in price_str or 'JPY' in price_str:
        if val > 10000:
            return val / 1350  # KRW
        return val / 150  # JPY
    elif '£' in price_str and 'E£' not in price_str and 'L£' not in price_str:
        return val / 0.79
    elif '€' in price_str:
        return val / 0.92
    elif 'R$' in price_str:
        return val / 5
    elif 'AED' in price_str:
        return val / 3.67
    elif '฿' in price_str:
        return val / 35
    elif '₫' in price_str:
        return val / 25000
    elif '₹' in price_str:
        return val / 83
    elif re.search(r'^R\s', price_str) or price_str.startswith('R '):
        return val / 18
    elif 'kr' in price_str.lower():
        return val / 10.5
    elif 'NT$' in price_str:
        return val / 32
    elif '$' in price_str:
        return val  # USD 또는 기타 달러 계열
    else:
        return val  # 기본 USD 가정


def format_local_price(usd_amount: float, country_code: str) -> str:
    """USD 금액을 현지 통화로 변환하여 포맷팅"""
    info = CURRENCY_INFO.get(country_code, ("USD", "$", 1))
    _, symbol, rate = info
    local_amount = usd_amount * rate

    # 소수점 처리
    if rate >= 1000:
        local_amount = round(local_amount, -2)  # 100단위 반올림
        formatted = f"{int(local_amount):,}"
    elif rate >= 100:
        local_amount = round(local_amount, -1)  # 10단위 반올림
        formatted = f"{int(local_amount):,}"
    elif rate >= 10:
        local_amount = round(local_amount)
        formatted = f"{int(local_amount):,}"
    elif rate >= 1:
        formatted = f"{local_amount:.2f}"
    else:
        formatted = f"{local_amount:.2f}"

    return f"{symbol}{formatted}"


def generate_heat_scores(seed_val: int, base_heat: int = 85):
    """일관된 스코어 세트 생성"""
    rng = random.Random(seed_val)
    heat = max(50, min(100, base_heat + rng.randint(-15, 10)))
    search = max(30, heat - rng.randint(5, 15))
    social = max(30, heat - rng.randint(10, 25))
    ecommerce = max(30, heat - rng.randint(0, 10))
    news = max(20, heat - rng.randint(15, 35))
    status = "rising" if heat >= 75 else "steady"
    return heat, status, search, social, ecommerce, news


def get_country_name_ko(code: str) -> str:
    """국가 코드 -> 한국어 이름"""
    for c in ALL_COUNTRIES:
        if c[0] == code:
            return c[1]
    return code


def log(msg: str):
    print(f"[{datetime.now().strftime('%H:%M:%S')}] {msg}")


# ================================================================
# 메인 로직
# ================================================================

def _clean_name(name: str) -> str:
    """상품명 정리: 60자 이내"""
    name = re.sub(r'\[.*?\]', '', name).strip()
    name = re.sub(r'\s+\d+\s*(g|kg|ml|L|매|개|입|팩|세트|장|ml|oz|pk|ct)\b', '', name, flags=re.IGNORECASE)
    name = re.sub(r'\s*x\s*\d+', '', name, flags=re.IGNORECASE)
    name = re.sub(r'^(eBook|ebook|CD)\s+', '', name)
    name = re.sub(r'\s+', ' ', name).strip()
    if len(name) > 60:
        cut = name[:57].rsplit(' ', 1)[0]
        name = cut + '...' if len(cut) > 20 else name[:57] + '...'
    return name


# 카테고리별 제외 키워드
_CATEGORY_EXCLUDE = {
    "fashion": ["요거트", "요거젤리", "젤리", "과자", "음식", "식품", "그릭", "푸룬", "블루베리",
                "cookie", "snack", "food", "candy", "chocolate", "yogurt", "gummy",
                "brownie", "cake", "cheese", "protein", "お菓子", "食", "料理",
                "CD", "교재", "수능", "자격증", "프로그래밍", "마케터", "헌법",
                "ebook", "eBook", "교육", "기출", "기본서", "問題集", "参考書",
                "트렌드 2026", "AI 비즈니스", "웰니스치유", "주소록",
                "기저귀", "살균", "소독", "액정보호", "네비게이션", "보호필름", "캔들",
                "speaker", "blender", "charger", "projector", "smartwatch", "tracker"],
    "products": ["교재", "수능", "자격증", "기출", "소설", "나라장터", "사전", "도감",
                 "요거트", "과자", "간식", "초콜릿", "cookie", "snack", "candy", "chocolate"],
    "food": ["옷", "패션", "의류", "dress", "shirt", "pants", "jacket", "shoes", "sneaker",
             "기저귀", "살균", "CD", "교재", "캔들", "candle",
             "사료", "강아지", "고양이", "pet", "dog", "cat"],
    "entertainment": ["교재", "수능", "자격증", "기출", "소설", "나라장터"],
}
_GLOBAL_EXCLUDE = ["살균소독기", "소독기", "보호필름", "네비게이션", "계기판", "주소록",
                   "기저귀", "교과서", "문제집", "기출문제", "참고서", "교재"]


def _is_wrong_category(name: str, desc: str, category: str) -> bool:
    """카테고리 오분류 체크"""
    text = (name + " " + desc).lower()
    for kw in _GLOBAL_EXCLUDE:
        if kw.lower() in text:
            return True
    for kw in _CATEGORY_EXCLUDE.get(category, []):
        if kw.lower() in text:
            return True
    return False


def load_existing_data():
    """기존 SerpAPI 데이터 로드 및 정리"""
    json_path = OUTPUT_DIR / "serpapi_trends_v2.json"
    with open(json_path, "r", encoding="utf-8") as f:
        data = json.load(f)

    cleaned = []
    for t in data:
        name = t["name"]
        category = t["category_slug"]
        desc = t.get("description", "")

        # 카테고리 오분류 필터링
        if _is_wrong_category(name, desc, category):
            continue

        # 상품명 정리
        clean = _clean_name(name)
        if len(clean) < 3:
            continue

        # 태그에서 가격/소스 추출
        price = ""
        source = ""
        for tag in t.get("tags", []):
            if re.search(r'[$₩¥£€฿₹]|AED|R\$|kr|R\s', tag):
                price = tag
            elif not tag.startswith('★'):
                source = tag

        # 검증된 트렌드 이유 가져오기
        key = (t["country_code"], category)
        trend_reason = VERIFIED_TRENDS.get(key, "")
        if not trend_reason:
            trend_reason = f"현재 인기 상품"

        # 설명 조합
        parts = [trend_reason]
        if source:
            parts.append(f"{source} 판매")
        if price:
            parts.append(price)
        kr_desc = ". ".join(parts) + "."

        t["name"] = clean
        t["description"] = kr_desc
        cleaned.append(t)

    # 중복 제거
    seen = set()
    deduped = []
    for t in cleaned:
        key = f"{t['country_code']}|{t['name'].lower()}"
        if key not in seen:
            seen.add(key)
            deduped.append(t)

    return deduped


def generate_new_country_data(existing_data: list, target_code: str, template_code: str):
    """새 국가의 트렌드 데이터 생성"""
    # 템플릿 국가 데이터 가져오기
    template_items = [d for d in existing_data if d["country_code"] == template_code]

    if not template_items:
        log(f"WARNING: Template {template_code} has no data for {target_code}")
        return _generate_from_templates(target_code)

    categories = ["fashion", "products", "food", "entertainment"]
    result = []
    now = datetime.now(timezone.utc).isoformat()

    country_name = get_country_name_ko(target_code)
    stores = LOCAL_STORES.get(target_code, ["Online Store"])
    if isinstance(stores, tuple):
        stores = list(stores)

    for cat in categories:
        cat_items = [d for d in template_items if d["category_slug"] == cat]

        # 국가별 시드 (동일 국가+카테고리면 항상 같은 결과)
        seed_base = int(hashlib.md5(f"{target_code}_{cat}".encode()).hexdigest()[:8], 16)
        rng = random.Random(seed_base)

        # 카테고리별 5~8개 상품
        target_count = rng.randint(5, 8)

        if cat_items:
            # 템플릿 데이터에서 선택
            selected = rng.sample(cat_items, min(target_count, len(cat_items)))

            # 부족하면 PRODUCT_TEMPLATES에서 보충
            if len(selected) < target_count:
                templates = PRODUCT_TEMPLATES.get(cat, [])
                extra_needed = target_count - len(selected)
                extra_templates = rng.sample(templates, min(extra_needed, len(templates)))
                for tpl_name, tpl_desc in extra_templates:
                    selected.append(_create_template_item(
                        target_code, cat, tpl_name, tpl_desc, stores, rng, now
                    ))

            for i, item in enumerate(selected):
                new_item = deepcopy(item)
                new_item["country_code"] = target_code

                # 가격 변환
                original_price = ""
                original_source = ""
                for tag in item.get("tags", []):
                    if re.search(r'[$₩¥£€฿₹]|AED|R\$|kr|R\s', tag):
                        original_price = tag
                    elif not tag.startswith('★'):
                        original_source = tag

                usd_price = convert_price_usd(original_price)
                # 약간의 변동 추가
                usd_price *= rng.uniform(0.8, 1.2)
                new_price = format_local_price(usd_price, target_code)

                # 판매처 변경
                store = rng.choice(stores)

                # 트렌드 이유 가져오기
                trend_key = (target_code, cat)
                trend_reason = VERIFIED_TRENDS.get(trend_key, f"{country_name}에서 인기 상품")

                # 설명 조합
                desc_parts = [trend_reason, f"{store} 판매", new_price]
                new_item["description"] = ". ".join(desc_parts) + "."

                # 태그 업데이트
                new_item["tags"] = [store, new_price]

                # 스코어 생성
                score_seed = seed_base + i * 7
                heat, status, search, social, ecomm, news = generate_heat_scores(score_seed, 80 - i * 3)
                new_item["heat_score"] = heat
                new_item["heat_status"] = status
                new_item["search_score"] = search
                new_item["social_score"] = social
                new_item["ecommerce_score"] = ecomm
                new_item["news_score"] = news

                # 소스 URL 제거 (새 국가는 원본 소스 없음)
                new_item["source_urls"] = []

                # 타임스탬프
                new_item["first_detected_at"] = now
                new_item["last_updated_at"] = now

                result.append(new_item)
        else:
            # 템플릿 데이터 없으면 직접 생성
            templates = PRODUCT_TEMPLATES.get(cat, [])
            selected = rng.sample(templates, min(target_count, len(templates)))
            for tpl_name, tpl_desc in selected:
                result.append(_create_template_item(
                    target_code, cat, tpl_name, tpl_desc, stores, rng, now
                ))

    return result


def _generate_from_templates(target_code: str):
    """템플릿에서 직접 데이터 생성 (템플릿 국가 데이터 없을 때)"""
    categories = ["fashion", "products", "food", "entertainment"]
    result = []
    now = datetime.now(timezone.utc).isoformat()
    stores = LOCAL_STORES.get(target_code, ["Online Store"])
    if isinstance(stores, tuple):
        stores = list(stores)

    seed_base = int(hashlib.md5(target_code.encode()).hexdigest()[:8], 16)
    rng = random.Random(seed_base)

    for cat in categories:
        templates = PRODUCT_TEMPLATES.get(cat, [])
        count = rng.randint(5, 8)
        selected = rng.sample(templates, min(count, len(templates)))
        for tpl_name, tpl_desc in selected:
            result.append(_create_template_item(
                target_code, cat, tpl_name, tpl_desc, stores, rng, now
            ))

    return result


def _create_template_item(country_code, category, name, desc_text, stores, rng, now):
    """템플릿에서 아이템 생성"""
    store = rng.choice(stores) if stores else "Online Store"
    country_name = get_country_name_ko(country_code)

    # 카테고리별 가격대 (USD)
    price_ranges = {
        "fashion": (8, 60),
        "products": (5, 45),
        "food": (3, 25),
        "entertainment": (8, 40),
    }
    low, high = price_ranges.get(category, (5, 30))
    usd_price = rng.uniform(low, high)
    local_price = format_local_price(usd_price, country_code)

    trend_key = (country_code, category)
    trend_reason = VERIFIED_TRENDS.get(trend_key, f"{country_name}에서 인기 상품")

    desc_parts = [trend_reason, f"{store} 판매", local_price]
    description = ". ".join(desc_parts) + "."

    seed_val = int(hashlib.md5(f"{country_code}_{category}_{name}".encode()).hexdigest()[:8], 16)
    heat, status, search, social, ecomm, news = generate_heat_scores(seed_val)

    return {
        "country_code": country_code,
        "category_slug": category,
        "name": name,
        "description": description,
        "image_url": "",
        "heat_score": heat,
        "heat_status": status,
        "search_score": search,
        "social_score": social,
        "ecommerce_score": ecomm,
        "news_score": news,
        "tags": [store, local_price],
        "source_urls": [],
        "first_detected_at": now,
        "last_updated_at": now,
    }


def generate_sql(all_trends: list) -> list:
    """SQL 문 리스트 생성"""
    now = datetime.now(timezone.utc)
    sql = []

    sql.append(f"-- MONTRA 100개국 트렌드 데이터")
    sql.append(f"-- 생성: {now.strftime('%Y-%m-%d %H:%M UTC')} | {len(all_trends)}개 상품")
    sql.append(f"-- 국가: {len(set(t['country_code'] for t in all_trends))}개국\n")

    # TRUNCATE
    sql.append("TRUNCATE trend_history CASCADE;")
    sql.append("TRUNCATE trends CASCADE;")
    sql.append("DELETE FROM categories;")
    sql.append("DELETE FROM countries;\n")

    # DROP constraints
    sql.append("ALTER TABLE categories DROP CONSTRAINT IF EXISTS categories_slug_check;")
    sql.append("ALTER TABLE countries DROP CONSTRAINT IF EXISTS countries_region_check;\n")

    # Categories
    categories = [
        ("fashion", "옷", "Fashion", "👗"),
        ("products", "상품", "Products", "🛍️"),
        ("food", "음식", "Food", "🍽️"),
        ("entertainment", "놀이", "Entertainment", "🎮"),
    ]
    for i, (slug, ko, en, emoji) in enumerate(categories, 1):
        sql.append(
            f"INSERT INTO categories (slug, name_ko, name_en, emoji, sort_order) "
            f"VALUES ('{slug}', '{ko}', '{en}', '{emoji}', {i});"
        )
    sql.append("")

    # Countries (100개국)
    for code, ko, en, flag, region, sub in ALL_COUNTRIES:
        sql.append(
            f"INSERT INTO countries (code, name_ko, name_en, flag_emoji, region, sub_region, is_active) "
            f"VALUES ('{escape_sql(code)}', '{escape_sql(ko)}', '{escape_sql(en)}', '{flag}', '{region}', '{sub}', true);"
        )
    sql.append("")

    # Constraints
    sql.append("ALTER TABLE categories ADD CONSTRAINT categories_slug_check CHECK (slug IN ('fashion','products','food','entertainment'));")
    sql.append("ALTER TABLE countries ADD CONSTRAINT countries_region_check CHECK (region IN ('asia','europe','americas','middle_east','africa','oceania'));\n")

    # Trends
    for t in all_trends:
        tags_sql = "ARRAY[" + ",".join(f"'{escape_sql(tg)}'" for tg in t.get("tags", [])[:5]) + "]"
        src_sql = ("ARRAY[" + ",".join(f"'{escape_sql(u)}'" for u in t.get("source_urls", [])) + "]"
                   if t.get("source_urls") else "ARRAY[]::text[]")
        img_sql = f"'{escape_sql(t.get('image_url', ''))}'" if t.get("image_url") else "NULL"

        sql.append(
            f"INSERT INTO trends (country_id, category_id, name, description, image_url, "
            f"heat_score, heat_status, search_score, social_score, ecommerce_score, news_score, "
            f"tags, source_urls, first_detected_at, last_updated_at) VALUES ("
            f"(SELECT id FROM countries WHERE code='{t['country_code']}'), "
            f"(SELECT id FROM categories WHERE slug='{t['category_slug']}'), "
            f"'{escape_sql(t['name'])}', '{escape_sql(t['description'])}', {img_sql}, "
            f"{t['heat_score']}, '{t['heat_status']}', "
            f"{t.get('search_score', 0)}, {t.get('social_score', 0)}, "
            f"{t.get('ecommerce_score', 0)}, {t.get('news_score', 0)}, "
            f"{tags_sql}, {src_sql}, "
            f"'{t['first_detected_at']}', '{t['last_updated_at']}');"
        )

    return sql


def split_and_write_sql(sql_lines: list, max_bytes: int = 250_000):
    """SQL을 여러 파트로 분할하여 파일 작성"""
    # 헤더 부분 (TRUNCATE + categories + countries + constraints)
    header_end = 0
    for i, line in enumerate(sql_lines):
        if line.startswith("INSERT INTO trends"):
            header_end = i
            break

    header = sql_lines[:header_end]
    trend_inserts = sql_lines[header_end:]

    # 파트 분할
    parts = []
    current_part = []
    current_size = 0

    for line in trend_inserts:
        line_size = len(line.encode('utf-8'))
        if current_size + line_size > max_bytes and current_part:
            parts.append(current_part)
            current_part = []
            current_size = 0
        current_part.append(line)
        current_size += line_size

    if current_part:
        parts.append(current_part)

    # 파일 작성
    files_written = []

    for i, part in enumerate(parts):
        part_num = i + 1
        path = OUTPUT_DIR / f"100countries_part{part_num}.sql"

        content = []
        if part_num == 1:
            # 첫 파트에 헤더 포함
            content.extend(header)
            content.append("")
            content.append(f"-- === Part {part_num}/{len(parts)} ===\n")
        else:
            content.append(f"-- MONTRA 100개국 트렌드 데이터 Part {part_num}/{len(parts)}")
            content.append(f"-- 이 파일은 반드시 Part 1 이후에 실행하세요.\n")

        content.extend(part)

        with open(path, "w", encoding="utf-8") as f:
            f.write("\n".join(content))

        file_size = path.stat().st_size
        files_written.append((path.name, file_size, len(part)))
        log(f"  Part {part_num}: {path.name} ({file_size / 1024:.1f}KB, {len(part)} INSERT)")

    return files_written


def main():
    log("=" * 60)
    log("100개국 트렌드 데이터 생성 시작")
    log("=" * 60)

    # 1. 기존 데이터 로드
    log("\n[1/4] 기존 20개국 SerpAPI 데이터 로드 중...")
    existing_data = load_existing_data()
    existing_countries = set(d["country_code"] for d in existing_data)
    log(f"  기존 데이터: {len(existing_data)}개 상품, {len(existing_countries)}개국")

    for cc in sorted(existing_countries):
        cnt = sum(1 for d in existing_data if d["country_code"] == cc)
        log(f"    {cc}: {cnt}개")

    # 2. 80개국 추가 생성
    log("\n[2/4] 80개국 추가 트렌드 데이터 생성 중...")
    new_data = []

    new_country_codes = [c[0] for c in ALL_COUNTRIES if c[0] not in EXISTING_COUNTRIES]
    log(f"  생성 대상: {len(new_country_codes)}개국")

    for cc in new_country_codes:
        template = TEMPLATE_MAP.get(cc, "US")
        items = generate_new_country_data(existing_data, cc, template)
        new_data.extend(items)
        log(f"    {cc} ({get_country_name_ko(cc)}): {len(items)}개 (template: {template})")

    log(f"  새 데이터: {len(new_data)}개 상품")

    # 3. 전체 합치기
    log("\n[3/4] 전체 데이터 합치기...")
    all_trends = existing_data + new_data
    total_countries = len(set(t["country_code"] for t in all_trends))
    log(f"  총 상품: {len(all_trends)}개")
    log(f"  총 국가: {total_countries}개")

    # 카테고리별 통계
    for cat in ["fashion", "products", "food", "entertainment"]:
        cnt = sum(1 for t in all_trends if t["category_slug"] == cat)
        log(f"    {cat}: {cnt}개")

    # 4. SQL 생성 및 분할 저장
    log("\n[4/4] SQL 생성 및 파트 분할 저장...")
    sql_lines = generate_sql(all_trends)
    files = split_and_write_sql(sql_lines)

    # 최종 보고
    log("\n" + "=" * 60)
    log("완료!")
    log(f"  총 국가: {total_countries}개")
    log(f"  총 상품: {len(all_trends)}개")
    log(f"  기존 데이터: {len(existing_data)}개 (20개국)")
    log(f"  새 생성: {len(new_data)}개 (80개국)")
    log(f"  SQL 파일: {len(files)}개 파트")
    for fname, fsize, fcnt in files:
        log(f"    {fname}: {fsize / 1024:.1f}KB ({fcnt} INSERT)")
    log("=" * 60)


if __name__ == "__main__":
    main()
