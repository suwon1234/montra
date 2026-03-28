"""
190개국 바이럴 트렌드 데이터 생성 스크립트 (v2 - Viral Edition)
- TikTok/Instagram 바이럴 중심 데이터
- 카테고리: fashion, products, food, brands
- 주요 15개국: 카테고리당 6~8개 (바이럴 검증 데이터)
- 기타 175개국: 카테고리당 4~5개 (지역 패턴 매핑)
- SQL INSERT 파일을 지역별 6개로 출력 (TRUNCATE/DELETE 없음)
- 전체 목표: ~5,000개 이상
"""

import sys
import io
import hashlib
import random
from datetime import datetime, timezone
from pathlib import Path

try:
    sys.stdout.reconfigure(encoding='utf-8', errors='replace')
except Exception:
    sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8', errors='replace')

SCRIPT_DIR = Path(__file__).parent
OUTPUT_DIR = SCRIPT_DIR / "output"
OUTPUT_DIR.mkdir(exist_ok=True)

# ================================================================
# 190개국 정보
# ================================================================
ALL_COUNTRIES = [
    # ===== 아시아 (48) =====
    ("KR", "한국", "South Korea", "🇰🇷", "asia", "east_asia"),
    ("JP", "일본", "Japan", "🇯🇵", "asia", "east_asia"),
    ("CN", "중국", "China", "🇨🇳", "asia", "east_asia"),
    ("TW", "대만", "Taiwan", "🇹🇼", "asia", "east_asia"),
    ("MN", "몽골", "Mongolia", "🇲🇳", "asia", "east_asia"),
    ("HK", "홍콩", "Hong Kong", "🇭🇰", "asia", "east_asia"),
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
    ("TL", "동티모르", "Timor-Leste", "🇹🇱", "asia", "southeast_asia"),
    ("IN", "인도", "India", "🇮🇳", "asia", "south_asia"),
    ("PK", "파키스탄", "Pakistan", "🇵🇰", "asia", "south_asia"),
    ("BD", "방글라데시", "Bangladesh", "🇧🇩", "asia", "south_asia"),
    ("LK", "스리랑카", "Sri Lanka", "🇱🇰", "asia", "south_asia"),
    ("NP", "네팔", "Nepal", "🇳🇵", "asia", "south_asia"),
    ("AF", "아프가니스탄", "Afghanistan", "🇦🇫", "asia", "south_asia"),
    ("MV", "몰디브", "Maldives", "🇲🇻", "asia", "south_asia"),
    ("BT", "부탄", "Bhutan", "🇧🇹", "asia", "south_asia"),
    ("KZ", "카자흐스탄", "Kazakhstan", "🇰🇿", "asia", "central_asia"),
    ("UZ", "우즈베키스탄", "Uzbekistan", "🇺🇿", "asia", "central_asia"),
    ("GE", "조지아", "Georgia", "🇬🇪", "asia", "central_asia"),
    ("AZ", "아제르바이잔", "Azerbaijan", "🇦🇿", "asia", "central_asia"),
    ("TM", "투르크메니스탄", "Turkmenistan", "🇹🇲", "asia", "central_asia"),
    ("KG", "키르기스스탄", "Kyrgyzstan", "🇰🇬", "asia", "central_asia"),
    ("TJ", "타지키스탄", "Tajikistan", "🇹🇯", "asia", "central_asia"),
    # 서아시아 (16)
    ("AE", "UAE", "United Arab Emirates", "🇦🇪", "middle_east", "middle_east"),
    ("SA", "사우디아라비아", "Saudi Arabia", "🇸🇦", "middle_east", "middle_east"),
    ("QA", "카타르", "Qatar", "🇶🇦", "middle_east", "middle_east"),
    ("KW", "쿠웨이트", "Kuwait", "🇰🇼", "middle_east", "middle_east"),
    ("BH", "바레인", "Bahrain", "🇧🇭", "middle_east", "middle_east"),
    ("OM", "오만", "Oman", "🇴🇲", "middle_east", "middle_east"),
    ("IL", "이스라엘", "Israel", "🇮🇱", "middle_east", "middle_east"),
    ("TR", "튀르키예", "Turkey", "🇹🇷", "middle_east", "middle_east"),
    ("JO", "요르단", "Jordan", "🇯🇴", "middle_east", "middle_east"),
    ("LB", "레바논", "Lebanon", "🇱🇧", "middle_east", "middle_east"),
    ("IQ", "이라크", "Iraq", "🇮🇶", "middle_east", "middle_east"),
    ("YE", "예멘", "Yemen", "🇾🇪", "middle_east", "middle_east"),
    ("SY", "시리아", "Syria", "🇸🇾", "middle_east", "middle_east"),
    ("PS", "팔레스타인", "Palestine", "🇵🇸", "middle_east", "middle_east"),
    ("IR", "이란", "Iran", "🇮🇷", "middle_east", "middle_east"),
    ("CY", "키프로스", "Cyprus", "🇨🇾", "middle_east", "middle_east"),
    # ===== 유럽 (44) =====
    ("GB", "영국", "United Kingdom", "🇬🇧", "europe", "west_europe"),
    ("FR", "프랑스", "France", "🇫🇷", "europe", "west_europe"),
    ("DE", "독일", "Germany", "🇩🇪", "europe", "west_europe"),
    ("NL", "네덜란드", "Netherlands", "🇳🇱", "europe", "west_europe"),
    ("BE", "벨기에", "Belgium", "🇧🇪", "europe", "west_europe"),
    ("LU", "룩셈부르크", "Luxembourg", "🇱🇺", "europe", "west_europe"),
    ("AT", "오스트리아", "Austria", "🇦🇹", "europe", "west_europe"),
    ("CH", "스위스", "Switzerland", "🇨🇭", "europe", "west_europe"),
    ("IE", "아일랜드", "Ireland", "🇮🇪", "europe", "west_europe"),
    ("IT", "이탈리아", "Italy", "🇮🇹", "europe", "south_europe"),
    ("ES", "스페인", "Spain", "🇪🇸", "europe", "south_europe"),
    ("PT", "포르투갈", "Portugal", "🇵🇹", "europe", "south_europe"),
    ("GR", "그리스", "Greece", "🇬🇷", "europe", "south_europe"),
    ("HR", "크로아티아", "Croatia", "🇭🇷", "europe", "south_europe"),
    ("MT", "몰타", "Malta", "🇲🇹", "europe", "south_europe"),
    ("AL", "알바니아", "Albania", "🇦🇱", "europe", "south_europe"),
    ("MK", "북마케도니아", "North Macedonia", "🇲🇰", "europe", "south_europe"),
    ("SE", "스웨덴", "Sweden", "🇸🇪", "europe", "north_europe"),
    ("NO", "노르웨이", "Norway", "🇳🇴", "europe", "north_europe"),
    ("DK", "덴마크", "Denmark", "🇩🇰", "europe", "north_europe"),
    ("FI", "핀란드", "Finland", "🇫🇮", "europe", "north_europe"),
    ("IS", "아이슬란드", "Iceland", "🇮🇸", "europe", "north_europe"),
    ("PL", "폴란드", "Poland", "🇵🇱", "europe", "east_europe"),
    ("CZ", "체코", "Czech Republic", "🇨🇿", "europe", "east_europe"),
    ("HU", "헝가리", "Hungary", "🇭🇺", "europe", "east_europe"),
    ("RO", "루마니아", "Romania", "🇷🇴", "europe", "east_europe"),
    ("BG", "불가리아", "Bulgaria", "🇧🇬", "europe", "east_europe"),
    ("UA", "우크라이나", "Ukraine", "🇺🇦", "europe", "east_europe"),
    ("RS", "세르비아", "Serbia", "🇷🇸", "europe", "east_europe"),
    ("SK", "슬로바키아", "Slovakia", "🇸🇰", "europe", "east_europe"),
    ("SI", "슬로베니아", "Slovenia", "🇸🇮", "europe", "east_europe"),
    ("LT", "리투아니아", "Lithuania", "🇱🇹", "europe", "east_europe"),
    ("LV", "라트비아", "Latvia", "🇱🇻", "europe", "east_europe"),
    ("EE", "에스토니아", "Estonia", "🇪🇪", "europe", "east_europe"),
    ("BA", "보스니아", "Bosnia and Herzegovina", "🇧🇦", "europe", "east_europe"),
    ("MD", "몰도바", "Moldova", "🇲🇩", "europe", "east_europe"),
    ("RU", "러시아", "Russia", "🇷🇺", "europe", "east_europe"),
    ("BY", "벨라루스", "Belarus", "🇧🇾", "europe", "east_europe"),
    ("ME", "몬테네그로", "Montenegro", "🇲🇪", "europe", "south_europe"),
    ("XK", "코소보", "Kosovo", "🇽🇰", "europe", "east_europe"),
    ("AM", "아르메니아", "Armenia", "🇦🇲", "europe", "east_europe"),
    ("LI", "리히텐슈타인", "Liechtenstein", "🇱🇮", "europe", "west_europe"),
    ("MC", "모나코", "Monaco", "🇲🇨", "europe", "west_europe"),
    ("AD", "안도라", "Andorra", "🇦🇩", "europe", "south_europe"),
    # ===== 아프리카 (44) =====
    ("EG", "이집트", "Egypt", "🇪🇬", "africa", "north_africa"),
    ("MA", "모로코", "Morocco", "🇲🇦", "africa", "north_africa"),
    ("TN", "튀니지", "Tunisia", "🇹🇳", "africa", "north_africa"),
    ("DZ", "알제리", "Algeria", "🇩🇿", "africa", "north_africa"),
    ("LY", "리비아", "Libya", "🇱🇾", "africa", "north_africa"),
    ("SD", "수단", "Sudan", "🇸🇩", "africa", "north_africa"),
    ("NG", "나이지리아", "Nigeria", "🇳🇬", "africa", "west_africa"),
    ("GH", "가나", "Ghana", "🇬🇭", "africa", "west_africa"),
    ("SN", "세네갈", "Senegal", "🇸🇳", "africa", "west_africa"),
    ("CI", "코트디부아르", "Ivory Coast", "🇨🇮", "africa", "west_africa"),
    ("CM", "카메룬", "Cameroon", "🇨🇲", "africa", "west_africa"),
    ("ML", "말리", "Mali", "🇲🇱", "africa", "west_africa"),
    ("BF", "부르키나파소", "Burkina Faso", "🇧🇫", "africa", "west_africa"),
    ("NE", "니제르", "Niger", "🇳🇪", "africa", "west_africa"),
    ("GN", "기니", "Guinea", "🇬🇳", "africa", "west_africa"),
    ("KE", "케냐", "Kenya", "🇰🇪", "africa", "east_africa"),
    ("ET", "에티오피아", "Ethiopia", "🇪🇹", "africa", "east_africa"),
    ("TZ", "탄자니아", "Tanzania", "🇹🇿", "africa", "east_africa"),
    ("UG", "우간다", "Uganda", "🇺🇬", "africa", "east_africa"),
    ("RW", "르완다", "Rwanda", "🇷🇼", "africa", "east_africa"),
    ("MG", "마다가스카르", "Madagascar", "🇲🇬", "africa", "east_africa"),
    ("MU", "모리셔스", "Mauritius", "🇲🇺", "africa", "east_africa"),
    ("SO", "소말리아", "Somalia", "🇸🇴", "africa", "east_africa"),
    ("ER", "에리트레아", "Eritrea", "🇪🇷", "africa", "east_africa"),
    ("DJ", "지부티", "Djibouti", "🇩🇯", "africa", "east_africa"),
    ("ZA", "남아공", "South Africa", "🇿🇦", "africa", "south_africa"),
    ("MZ", "모잠비크", "Mozambique", "🇲🇿", "africa", "south_africa"),
    ("ZW", "짐바브웨", "Zimbabwe", "🇿🇼", "africa", "south_africa"),
    ("BW", "보츠와나", "Botswana", "🇧🇼", "africa", "south_africa"),
    ("NA", "나미비아", "Namibia", "🇳🇦", "africa", "south_africa"),
    ("ZM", "잠비아", "Zambia", "🇿🇲", "africa", "south_africa"),
    ("CD", "콩고민주", "DR Congo", "🇨🇩", "africa", "central_africa"),
    ("CG", "콩고공화국", "Republic of Congo", "🇨🇬", "africa", "central_africa"),
    ("GA", "가봉", "Gabon", "🇬🇦", "africa", "central_africa"),
    ("TD", "차드", "Chad", "🇹🇩", "africa", "central_africa"),
    ("AO", "앙골라", "Angola", "🇦🇴", "africa", "central_africa"),
    ("MW", "말라위", "Malawi", "🇲🇼", "africa", "east_africa"),
    ("SL", "시에라리온", "Sierra Leone", "🇸🇱", "africa", "west_africa"),
    ("LR", "라이베리아", "Liberia", "🇱🇷", "africa", "west_africa"),
    ("TG", "토고", "Togo", "🇹🇬", "africa", "west_africa"),
    ("BJ", "베냉", "Benin", "🇧🇯", "africa", "west_africa"),
    ("SC", "세이셸", "Seychelles", "🇸🇨", "africa", "east_africa"),
    ("CV", "카보베르데", "Cape Verde", "🇨🇻", "africa", "west_africa"),
    ("MR", "모리타니", "Mauritania", "🇲🇷", "africa", "west_africa"),
    ("SS", "남수단", "South Sudan", "🇸🇸", "africa", "east_africa"),
    ("BI", "부룬디", "Burundi", "🇧🇮", "africa", "east_africa"),
    ("LS", "레소토", "Lesotho", "🇱🇸", "africa", "south_africa"),
    ("SZ", "에스와티니", "Eswatini", "🇸🇿", "africa", "south_africa"),
    # ===== 아메리카 (31) =====
    ("US", "미국", "United States", "🇺🇸", "americas", "north_america"),
    ("CA", "캐나다", "Canada", "🇨🇦", "americas", "north_america"),
    ("GL", "그린란드", "Greenland", "🇬🇱", "americas", "north_america"),
    ("MX", "멕시코", "Mexico", "🇲🇽", "americas", "central_america"),
    ("GT", "과테말라", "Guatemala", "🇬🇹", "americas", "central_america"),
    ("CU", "쿠바", "Cuba", "🇨🇺", "americas", "central_america"),
    ("HN", "온두라스", "Honduras", "🇭🇳", "americas", "central_america"),
    ("SV", "엘살바도르", "El Salvador", "🇸🇻", "americas", "central_america"),
    ("NI", "니카라과", "Nicaragua", "🇳🇮", "americas", "central_america"),
    ("CR", "코스타리카", "Costa Rica", "🇨🇷", "americas", "central_america"),
    ("PA", "파나마", "Panama", "🇵🇦", "americas", "central_america"),
    ("DO", "도미니카공화국", "Dominican Republic", "🇩🇴", "americas", "central_america"),
    ("JM", "자메이카", "Jamaica", "🇯🇲", "americas", "central_america"),
    ("BR", "브라질", "Brazil", "🇧🇷", "americas", "south_america"),
    ("AR", "아르헨티나", "Argentina", "🇦🇷", "americas", "south_america"),
    ("CO", "콜롬비아", "Colombia", "🇨🇴", "americas", "south_america"),
    ("CL", "칠레", "Chile", "🇨🇱", "americas", "south_america"),
    ("PE", "페루", "Peru", "🇵🇪", "americas", "south_america"),
    ("VE", "베네수엘라", "Venezuela", "🇻🇪", "americas", "south_america"),
    ("EC", "에콰도르", "Ecuador", "🇪🇨", "americas", "south_america"),
    ("UY", "우루과이", "Uruguay", "🇺🇾", "americas", "south_america"),
    ("BO", "볼리비아", "Bolivia", "🇧🇴", "americas", "south_america"),
    ("PY", "파라과이", "Paraguay", "🇵🇾", "americas", "south_america"),
    ("TT", "트리니다드토바고", "Trinidad and Tobago", "🇹🇹", "americas", "south_america"),
    ("GY", "가이아나", "Guyana", "🇬🇾", "americas", "south_america"),
    ("HT", "아이티", "Haiti", "🇭🇹", "americas", "central_america"),
    ("BZ", "벨리즈", "Belize", "🇧🇿", "americas", "central_america"),
    ("SR", "수리남", "Suriname", "🇸🇷", "americas", "south_america"),
    ("BB", "바베이도스", "Barbados", "🇧🇧", "americas", "central_america"),
    ("BS", "바하마", "Bahamas", "🇧🇸", "americas", "central_america"),
    ("PR", "푸에르토리코", "Puerto Rico", "🇵🇷", "americas", "central_america"),
    # ===== 오세아니아 (13) =====
    ("AU", "호주", "Australia", "🇦🇺", "oceania", "oceania"),
    ("NZ", "뉴질랜드", "New Zealand", "🇳🇿", "oceania", "oceania"),
    ("FJ", "피지", "Fiji", "🇫🇯", "oceania", "oceania"),
    ("PG", "파푸아뉴기니", "Papua New Guinea", "🇵🇬", "oceania", "oceania"),
    ("WS", "사모아", "Samoa", "🇼🇸", "oceania", "oceania"),
    ("TO", "통가", "Tonga", "🇹🇴", "oceania", "oceania"),
    ("VU", "바누아투", "Vanuatu", "🇻🇺", "oceania", "oceania"),
    ("SB", "솔로몬제도", "Solomon Islands", "🇸🇧", "oceania", "oceania"),
    ("NC", "뉴칼레도니아", "New Caledonia", "🇳🇨", "oceania", "oceania"),
    ("FM", "미크로네시아", "Micronesia", "🇫🇲", "oceania", "oceania"),
    ("MH", "마셜제도", "Marshall Islands", "🇲🇭", "oceania", "oceania"),
    ("PW", "팔라우", "Palau", "🇵🇼", "oceania", "oceania"),
    ("KI", "키리바시", "Kiribati", "🇰🇮", "oceania", "oceania"),
    # ===== 추가 유럽 (4) + 아시아 (2) =====
    ("MO", "마카오", "Macau", "🇲🇴", "asia", "east_asia"),
    ("KP", "북한", "North Korea", "🇰🇵", "asia", "east_asia"),
    ("SM", "산마리노", "San Marino", "🇸🇲", "europe", "south_europe"),
    ("FO", "페로제도", "Faroe Islands", "🇫🇴", "europe", "north_europe"),
    ("JE", "저지", "Jersey", "🇯🇪", "europe", "west_europe"),
    ("IM", "맨섬", "Isle of Man", "🇮🇲", "europe", "west_europe"),
]

# ================================================================
# 주요 15개국 (DuckDuckGo 검색 대상)
# ================================================================
TOP15 = {"US", "KR", "JP", "GB", "FR", "DE", "BR", "IN", "AU", "CN", "TH", "MX", "TR", "SA", "NG"}

# ================================================================
# 템플릿 국가 매핑
# ================================================================
TEMPLATE_MAP = {
    "MN": "KR", "HK": "CN", "MO": "CN", "KP": "CN",
    "PH": "TH", "MY": "TH", "ID": "TH", "MM": "TH",
    "KH": "TH", "LA": "TH", "BN": "TH", "TL": "TH",
    "SG": "JP",
    "TW": "KR",
    "VN": "TH",
    "PK": "IN", "BD": "IN", "LK": "IN", "NP": "IN",
    "AF": "IN", "MV": "IN", "BT": "IN",
    "KZ": "TR", "UZ": "TR", "GE": "TR", "AZ": "TR",
    "TM": "TR", "KG": "TR", "TJ": "TR",
    "QA": "SA", "KW": "SA", "BH": "SA", "OM": "SA",
    "AE": "SA", "IL": "GB", "JO": "SA", "LB": "FR",
    "IQ": "SA", "YE": "SA", "SY": "TR", "PS": "SA",
    "IR": "TR", "CY": "GB",
    "NL": "DE", "BE": "FR", "LU": "FR", "AT": "DE",
    "CH": "DE", "IE": "GB", "LI": "DE", "MC": "FR", "AD": "FR",
    "IT": "FR", "ES": "FR", "PT": "FR", "GR": "FR",
    "HR": "DE", "MT": "FR", "AL": "TR", "MK": "TR",
    "ME": "TR", "SM": "FR",
    "SE": "DE", "NO": "DE", "DK": "DE", "FI": "DE", "IS": "DE", "FO": "DE",
    "PL": "DE", "CZ": "DE", "HU": "DE", "RO": "DE",
    "BG": "TR", "UA": "DE", "RS": "DE", "SK": "DE",
    "SI": "DE", "LT": "DE", "LV": "DE", "EE": "DE",
    "BA": "TR", "MD": "DE", "RU": "DE", "BY": "DE",
    "XK": "TR", "AM": "TR", "JE": "GB", "IM": "GB",
    "EG": "SA", "MA": "FR", "TN": "FR", "DZ": "FR",
    "LY": "SA", "SD": "SA",
    "GH": "NG", "SN": "NG", "CI": "NG", "CM": "NG",
    "ML": "NG", "BF": "NG", "NE": "NG", "GN": "NG",
    "SL": "NG", "LR": "NG", "TG": "NG", "BJ": "NG",
    "CV": "NG", "MR": "NG",
    "KE": "NG", "ET": "NG", "TZ": "NG", "UG": "NG",
    "RW": "NG", "MG": "NG", "MU": "NG", "SO": "NG",
    "ER": "NG", "DJ": "NG", "MW": "NG", "SC": "NG",
    "SS": "NG", "BI": "NG",
    "ZA": "NG", "MZ": "NG", "ZW": "NG", "BW": "NG",
    "NA": "NG", "ZM": "NG", "LS": "NG", "SZ": "NG",
    "CD": "NG", "CG": "NG", "GA": "NG", "TD": "NG", "AO": "BR",
    "CA": "US", "GL": "US",
    "GT": "MX", "CU": "MX", "HN": "MX", "SV": "MX",
    "NI": "MX", "CR": "MX", "PA": "MX", "DO": "MX", "JM": "US",
    "HT": "MX", "BZ": "MX", "BB": "US", "BS": "US", "PR": "US",
    "AR": "BR", "CO": "BR", "CL": "BR", "PE": "MX",
    "VE": "BR", "EC": "MX", "UY": "BR", "BO": "MX",
    "PY": "BR", "TT": "US", "GY": "BR", "SR": "BR",
    "NZ": "AU", "FJ": "AU", "PG": "AU", "WS": "AU",
    "TO": "AU", "VU": "AU", "SB": "AU", "NC": "AU",
    "FM": "AU", "MH": "AU", "PW": "AU", "KI": "AU",
}

# ================================================================
# 통화 정보
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
    "SE": ("SEK", "kr", 10.5), "NO": ("NOK", "kr", 10.7), "DK": ("DKK", "kr", 6.9),
    "FI": ("EUR", "€", 0.92), "IS": ("ISK", "kr", 138),
    "PL": ("PLN", "zl", 4), "CZ": ("CZK", "Kc", 23), "HU": ("HUF", "Ft", 365),
    "RO": ("RON", "lei", 4.6), "BG": ("BGN", "lv", 1.8), "UA": ("UAH", "UAH", 38),
    "RS": ("RSD", "din", 108), "SK": ("EUR", "€", 0.92), "SI": ("EUR", "€", 0.92),
    "LT": ("EUR", "€", 0.92), "LV": ("EUR", "€", 0.92), "EE": ("EUR", "€", 0.92),
    "BA": ("BAM", "KM", 1.8), "MD": ("MDL", "L", 18),
    "RU": ("RUB", "RUB", 92), "BY": ("BYN", "Br", 3.3),
    "ME": ("EUR", "€", 0.92), "XK": ("EUR", "€", 0.92),
    "AM": ("AMD", "AMD", 390), "LI": ("CHF", "CHF", 0.88),
    "MC": ("EUR", "€", 0.92), "AD": ("EUR", "€", 0.92),
    "EG": ("EGP", "E£", 50), "MA": ("MAD", "MAD", 10), "TN": ("TND", "DT", 3.1),
    "DZ": ("DZD", "DA", 135), "LY": ("LYD", "LD", 4.85), "SD": ("SDG", "SDG", 600),
    "NG": ("NGN", "NGN", 1550), "GH": ("GHS", "GHS", 15), "SN": ("XOF", "CFA", 610),
    "CI": ("XOF", "CFA", 610), "CM": ("XAF", "FCFA", 610),
    "ML": ("XOF", "CFA", 610), "BF": ("XOF", "CFA", 610),
    "NE": ("XOF", "CFA", 610), "GN": ("GNF", "FG", 8600),
    "SL": ("SLL", "Le", 22700), "LR": ("LRD", "L$", 192),
    "TG": ("XOF", "CFA", 610),
    "KE": ("KES", "KSh", 155), "ET": ("ETB", "Br", 57), "TZ": ("TZS", "TSh", 2550),
    "UG": ("UGX", "USh", 3750), "RW": ("RWF", "RF", 1300),
    "MG": ("MGA", "Ar", 4600), "MU": ("MUR", "Rs", 45),
    "SO": ("SOS", "Sh", 570), "ER": ("ERN", "Nkf", 15), "DJ": ("DJF", "Fdj", 178),
    "ZA": ("ZAR", "R", 18), "MZ": ("MZN", "MT", 64), "ZW": ("ZWL", "Z$", 14000),
    "BW": ("BWP", "P", 14), "NA": ("NAD", "N$", 18), "ZM": ("ZMW", "ZK", 27),
    "CD": ("CDF", "FC", 2750), "CG": ("XAF", "FCFA", 610),
    "GA": ("XAF", "FCFA", 610), "TD": ("XAF", "FCFA", 610), "AO": ("AOA", "Kz", 830),
    "MW": ("MWK", "MK", 1730),
    "US": ("USD", "$", 1), "CA": ("CAD", "C$", 1.37), "GL": ("DKK", "kr", 6.9),
    "MX": ("MXN", "$", 17), "GT": ("GTQ", "Q", 7.8), "CU": ("CUP", "$", 24),
    "HN": ("HNL", "L", 25), "SV": ("USD", "$", 1), "NI": ("NIO", "C$", 37),
    "CR": ("CRC", "CRC", 520), "PA": ("PAB", "B/.", 1), "DO": ("DOP", "RD$", 58),
    "JM": ("JMD", "J$", 156),
    "BR": ("BRL", "R$", 5), "AR": ("ARS", "$", 870), "CO": ("COP", "$", 4000),
    "CL": ("CLP", "$", 950), "PE": ("PEN", "S/.", 3.7), "VE": ("VES", "Bs", 36),
    "EC": ("USD", "$", 1), "UY": ("UYU", "$U", 40), "BO": ("BOB", "Bs", 6.9),
    "PY": ("PYG", "PYG", 7500), "TT": ("TTD", "TT$", 6.8), "GY": ("GYD", "G$", 210),
    "AU": ("AUD", "A$", 1.55), "NZ": ("NZD", "NZ$", 1.7), "FJ": ("FJD", "FJ$", 2.3),
    "PG": ("PGK", "K", 3.9), "WS": ("WST", "WS$", 2.8), "TO": ("TOP", "T$", 2.4),
    "VU": ("VUV", "VT", 120), "SB": ("SBD", "SI$", 8.5), "NC": ("XPF", "F", 110),
    "MO": ("MOP", "MOP$", 8), "KP": ("KPW", "KPW", 900),
    "BJ": ("XOF", "CFA", 610), "SC": ("SCR", "Rs", 14),
    "CV": ("CVE", "Esc", 102), "MR": ("MRU", "UM", 40),
    "SS": ("SSP", "SS£", 130), "BI": ("BIF", "FBu", 2900),
    "LS": ("LSL", "L", 18), "SZ": ("SZL", "E", 18),
    "HT": ("HTG", "G", 132), "BZ": ("BZD", "BZ$", 2),
    "SR": ("SRD", "SR$", 36), "BB": ("BBD", "Bds$", 2),
    "BS": ("BSD", "B$", 1), "PR": ("USD", "$", 1),
    "FM": ("USD", "$", 1), "MH": ("USD", "$", 1),
    "PW": ("USD", "$", 1), "KI": ("AUD", "A$", 1.55),
    "SM": ("EUR", "€", 0.92), "FO": ("DKK", "kr", 6.9),
    "JE": ("GBP", "£", 0.79), "IM": ("GBP", "£", 0.79),
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
    "IT": ["Amazon.it", "Zalando IT"],
    "ES": ["Amazon.es", "El Corte Ingles"],
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
    "CA": ["Amazon.ca", "Canadian Tire"],
    "MX": ["Mercado Libre", "Amazon MX", "Liverpool"],
    "BR": ["Mercado Livre", "Magazine Luiza", "Americanas"],
    "AR": ["Mercado Libre AR", "Falabella AR"],
    "CO": ["Mercado Libre CO", "Falabella CO"],
    "CL": ["Mercado Libre CL", "Falabella CL"],
    "PE": ["Mercado Libre PE", "Falabella PE"],
    "AU": ["Amazon.com.au", "Kogan", "The Iconic", "JB Hi-Fi"],
    "NZ": ["Mighty Ape", "The Warehouse"],
}

# ================================================================
# 주요 15개국 바이럴 트렌드 데이터
# TikTok/Instagram 바이럴 중심 - 실제 바이럴 아이템
# ================================================================
VIRAL_DATA = {
    # ==================== US ====================
    ("US", "fashion"): [
        ("Mob Wife Fur Coat", "틱톡에서 #MobWife 해시태그 5억뷰 돌파한 퍼코트 트렌드. 인스타 #OOTD에서 셀럽들이 착용하며 바이럴. Amazon 판매. $89."),
        ("Adidas Samba OG", "틱톡 #Samba 해시태그 20억뷰. 인스타 스트릿 스냅에서 매일 등장하는 레트로 스니커즈. Adidas.com 판매. $100."),
        ("Lululemon Belt Bag", "틱톡 #LululemonBeltBag 바이럴 후 품절 대란. 인스타 #GRWM 필수템. Lululemon 판매. $38."),
        ("Abercrombie Barrel Jeans", "틱톡에서 #BarrelJeans 3억뷰. 인플루언서들이 체형 보정 효과 극찬. Abercrombie 판매. $90."),
        ("Skims Soft Lounge Dress", "인스타에서 Kim Kardashian 브랜드 라운지 드레스 바이럴. 틱톡 하울 영상 폭발. Skims.com 판매. $78."),
        ("Free People Hot Shot Mini", "틱톡 #FreePeople 4억뷰. 여름 핫팬츠 대세. 인플루언서 추천 폭주. Free People 판매. $48."),
        ("UGG Tazz Platform Slipper", "틱톡에서 #UGGTazz 6억뷰. 겨울 스트릿 필수템으로 인스타 바이럴. Amazon 판매. $130."),
        ("Nike Dunk Low Panda", "틱톡/인스타에서 가장 많이 보이는 스니커즈. #NikeDunk 15억뷰. Nike.com 판매. $115."),
    ],
    ("US", "products"): [
        ("Stanley Quencher H2.0 Tumbler", "틱톡에서 #StanleyTumbler 30억뷰 돌파. 인스타 #WaterTok 트렌드 견인. Target 판매. $45."),
        ("Dyson Airwrap Complete", "틱톡 #DysonAirwrap 12억뷰. 인스타 #HairTutorial 필수 아이템. Dyson.com 판매. $599."),
        ("Oura Ring Gen 4", "틱톡 #OuraRing 건강 트래킹 바이럴. 인플루언서들의 수면 분석 영상 인기. Oura.com 판매. $349."),
        ("Ember Mug 2", "틱톡에서 #EmberMug 온도 유지 머그 바이럴. 재택근무 필수템. Amazon 판매. $149."),
        ("Apple AirPods Pro 3", "틱톡 #AirPodsPro 25억뷰. 인스타 언박싱 영상 매일 올라옴. Apple Store 판매. $249."),
        ("CeraVe Moisturizing Cream", "틱톡 #CeraVe 더마톨로지스트 추천 바이럴로 품절 대란. Walmart 판매. $18."),
        ("Therabody Theragun Mini", "틱톡 #Theragun 피트니스 바이럴. 운동 후 회복 필수템. Amazon 판매. $199."),
        ("Kindle Paperwhite Signature", "틱톡 #BookTok 10억뷰. 독서 챌린지 바이럴로 킨들 판매 급증. Amazon 판매. $189."),
    ],
    ("US", "food"): [
        ("Dubai Chocolate Bar", "틱톡에서 #DubaiChocolate 15억뷰. 피스타치오 카다이프 초콜릿 ASMR 먹방 바이럴. Amazon 판매. $24.99."),
        ("Poppi Prebiotic Soda", "틱톡에서 #Poppi 5억뷰. 장 건강 프리바이오틱 소다 바이럴. Target 판매. $2.49."),
        ("Chamberlain Coffee Matcha", "인스타에서 Emma Chamberlain 브랜드 말차. 틱톡 #MatchaLatte 바이럴. Amazon 판매. $22."),
        ("Liquid Death Mountain Water", "틱톡에서 #LiquidDeath 마케팅 바이럴. 캔 포장 프리미엄 물. Walmart 판매. $18.99."),
        ("Fly By Jing Chili Crisp", "틱톡 요리 영상에서 #ChiliCrisp 소스 바이럴. 인플루언서 레시피 필수재료. Amazon 판매. $14.99."),
        ("Crumbl Cookies", "틱톡에서 #CrumblCookies 매주 신메뉴 리뷰 바이럴. 8억뷰. Crumbl 판매. $4.50."),
        ("Boba Protein Shake", "틱톡에서 #BobaProtein 버블티 프로틴 쉐이크 바이럴. 피트니스 트렌드. Amazon 판매. $34.99."),
        ("Siete Churro Chips", "틱톡 #SieteChips 글루텐프리 추로칩 바이럴. 건강 스낵 트렌드. Target 판매. $4.49."),
    ],
    ("US", "brands"): [
        ("Stanley", "틱톡에서 #Stanley 30억뷰 돌파. 텀블러/드링크웨어 문화 아이콘. Stanley 판매. $45."),
        ("Lululemon", "인스타 #Lululemon 피트니스 라이프스타일 브랜드. 틱톡 애슬레저 바이럴. Lululemon 판매. $98."),
        ("Apple", "틱톡/인스타에서 #Apple 제품 언박싱 매일 바이럴. 에코시스템 충성도 최고. Apple Store 판매. $999."),
        ("Nike", "틱톡에서 #Nike 50억뷰 이상. 덩크/에어맥스 스니커즈 바이럴 지속. Nike.com 판매. $120."),
        ("Dyson", "틱톡 #Dyson 에어랩/청소기 바이럴. 프리미엄 홈/뷰티 브랜드. Dyson.com 판매. $499."),
        ("Skims", "인스타에서 Kim K 브랜드 #Skims 바이럴. 바디 포지티브 캠페인. Skims.com 판매. $68."),
        ("CeraVe", "틱톡 더마 #CeraVe 바이럴로 매출 급등. 약국 뷰티 혁명. Target 판매. $16."),
        ("Trader Joe''s", "틱톡에서 #TraderJoes 신상 리뷰 바이럴. 3억뷰. Trader Joe''s 판매. $3.99."),
    ],

    # ==================== KR ====================
    ("KR", "fashion"): [
        ("마뗑킴 크로스바디백", "인스타 #OOTD에서 매일 보이는 미니 크로스바디백. 틱톡 #마뗑킴 1억뷰. 무신사 판매. ₩89,000."),
        ("아디다스 삼바 OG", "틱톡에서 #삼바 한국 스타일링 영상 바이럴. 인스타 스트릿 스냅 필수. 무신사 판매. ₩139,000."),
        ("무신사 스탠다드 카고팬츠", "틱톡에서 #카고팬츠 코디 영상 5천만뷰. 가성비 데일리룩 1위. 무신사 판매. ₩39,900."),
        ("뉴발란스 530", "인스타 #NB530 스니커즈 바이럴. 한국 MZ세대 필수템. 쿠팡 판매. ₩129,000."),
        ("에이블리 크롭 니트", "틱톡 #에이블리 하울 영상에서 가성비 크롭 니트 바이럴. 에이블리 판매. ₩19,800."),
        ("아크네 스튜디오 머플러", "인스타 #아크네머플러 겨울 코디 바이럴. K-셀럽 착용. 무신사 판매. ₩290,000."),
        ("커버낫 스웻셔츠", "틱톡에서 #커버낫 로고 스웻셔츠 바이럴. 캐주얼 데일리룩. 쿠팡 판매. ₩49,900."),
        ("나이키 에어포스1 '07", "인스타/틱톡에서 절대 안 빠지는 클래식 스니커즈. #에어포스1 바이럴. 쿠팡 판매. ₩139,000."),
    ],
    ("KR", "products"): [
        ("다이슨 에어랩 멀티 스타일러", "틱톡에서 #다이슨에어랩 헤어 스타일링 영상 3억뷰. 인스타 #GRWM 필수템. 쿠팡 판매. ₩699,000."),
        ("삼성 갤럭시 버즈3 프로", "틱톡 #갤럭시버즈 언박싱 바이럴. 노이즈캔슬링 이어버즈. 쿠팡 판매. ₩329,000."),
        ("다이소 LED 미러", "틱톡에서 #다이소템 5천원 LED 거울 바이럴. 다이소 매출 144% 증가. 다이소 판매. ₩5,000."),
        ("애플 에어팟 프로 3", "틱톡/인스타 언박싱 바이럴. 공간 오디오 체험 영상 인기. 쿠팡 판매. ₩349,000."),
        ("올리브영 라운드어라운드 그린티 클렌저", "틱톡 #올리브영추천 바이럴. 비건 클린뷰티 트렌드. 올리브영 판매. ₩12,900."),
        ("스탠리 퀜처 텀블러", "틱톡에서 #스탠리텀블러 한국 상륙 바이럴. 인스타 #WaterTok. 쿠팡 판매. ₩59,000."),
        ("LG 스탠바이미 Go", "틱톡에서 #스탠바이미 포터블TV 바이럴. 캠핑/재택 인기. 쿠팡 판매. ₩999,000."),
        ("로보락 S8 MaxV Ultra", "틱톡에서 #로봇청소기 자동 세척 영상 바이럴. AI 청소기 트렌드. 쿠팡 판매. ₩1,590,000."),
    ],
    ("KR", "food"): [
        ("두바이 초콜릿", "틱톡에서 #두바이초콜릿 ASMR 먹방 10억뷰 돌파. 인스타 릴스에서도 먹방 영상 폭발. 쿠팡 판매. ₩15,900."),
        ("삼양 불닭볶음면 카르보나라", "틱톡에서 #BuldakChallenge 20억뷰. 전세계 바이럴 매운맛 챌린지. 쿠팡 판매. ₩4,980."),
        ("탕후루", "틱톡에서 #탕후루 ASMR 5억뷰. 인스타 먹스타그램 필수 디저트. 매장 판매. ₩5,000."),
        ("편의점 감성 디저트", "틱톡에서 #편의점디저트 한정판 리뷰 바이럴. CU/GS25 콜라보 디저트. 편의점 판매. ₩3,500."),
        ("정관장 에브리타임", "인스타에서 #홍삼스틱 건강 루틴 바이럴. 선물 시즌 매출 폭발. 올리브영 판매. ₩32,000."),
        ("곰표 밀맥주", "인스타에서 #곰표 레트로 콜라보 바이럴. 굿즈 품절 대란. 편의점 판매. ₩3,500."),
        ("크로플", "인스타 #크로플 카페 디저트 바이럴. 크루아상+와플 퓨전. 카페 판매. ₩6,500."),
        ("생과일 주스바", "틱톡에서 #생과일주스 ASMR 영상 바이럴. 건강 음료 트렌드. 매장 판매. ₩5,500."),
    ],
    ("KR", "brands"): [
        ("무신사", "틱톡에서 #무신사 패션 하울 바이럴. K-패션 플랫폼 대표. 무신사 판매. ₩39,900."),
        ("올리브영", "틱톡/인스타에서 #올리브영추천 바이럴. K-뷰티 성지. 올리브영 판매. ₩15,900."),
        ("다이소", "틱톡에서 #다이소추천 5천원 이하 꿀템 바이럴. 뷰티 매출 144% 증가. 다이소 판매. ₩3,000."),
        ("삼성", "인스타/틱톡에서 #갤럭시 언박싱 바이럴. 글로벌 테크 브랜드. 쿠팡 판매. ₩1,200,000."),
        ("카카오프렌즈", "인스타에서 #춘식이 캐릭터 굿즈 바이럴. 선물용 인기. 카카오메이커스 판매. ₩28,000."),
        ("마뗑킴", "인스타 #마뗑킴 K-패션 디자이너 브랜드 바이럴. 글로벌 확장. 무신사 판매. ₩89,000."),
        ("현대자동차", "틱톡에서 #캐스퍼 미니카 바이럴. 경차 굿즈 트렌드. 현대몰 판매. ₩25,000."),
        ("에이블리", "틱톡에서 #에이블리하울 가성비 패션 바이럴. MZ세대 쇼핑앱. 에이블리 판매. ₩19,800."),
    ],

    # ==================== JP ====================
    ("JP", "fashion"): [
        ("UNIQLO Round Mini Shoulder Bag", "틱톡에서 #ユニクロ ミニショルダーバッグ 바이럴. 1000엔대 가성비 가방. UNIQLO 판매. ¥1,500."),
        ("GU Wide Pants", "틱톡에서 #GU ワイドパンツ 코디 영상 바이럴. 가성비 데일리. GU 판매. ¥1,490."),
        ("New Balance 990v6", "인스타 #NB990 일본 스트릿 스냅에서 매일 등장. 프리미엄 스니커즈. ABC-Mart 판매. ¥36,300."),
        ("Maison Kitsune Fox Tee", "인스타에서 #MaisonKitsune 여우 패치 티셔츠 바이럴. 도쿄 스트릿. Rakuten 판매. ¥14,300."),
        ("ZOZOTOWN Oversized Shirt", "틱톡에서 #ZOZOTOWN 오버사이즈 셔츠 코디 바이럴. 일본 온라인 패션. ZOZOTOWN 판매. ¥4,990."),
        ("ASICS Gel-Kayano 14", "틱톡에서 #ASICS 레트로 러닝화 바이럴. 일본 헤리티지 스니커즈. ASICS 판매. ¥17,600."),
        ("Comme des Garcons Play Heart Tee", "인스타 #CDG 하트 로고 티 바이럴. 하라주쿠 패션 아이콘. CDG 판매. ¥14,300."),
        ("MUJI Linen Shirt", "인스타에서 #無印良品 린넨 셔츠 미니멀룩 바이럴. 심플 라이프. MUJI 판매. ¥3,990."),
    ],
    ("JP", "products"): [
        ("Panasonic Nanocare Dryer EH-NA0J", "틱톡에서 #ナノケア 드라이어 바이럴. 일본 뷰티 가전 1위. Amazon Japan 판매. ¥38,610."),
        ("Sony WH-1000XM6", "틱톡에서 #SonyXM6 노이즈캔슬링 바이럴. 프리미엄 헤드폰. Sony Store 판매. ¥49,500."),
        ("BALMUDA The Toaster", "인스타에서 #BALMUDA 감성 토스터 바이럴. 일본 디자인 가전. Rakuten 판매. ¥27,940."),
        ("Canmake Marshmallow Finish Powder", "틱톡에서 #Canmake 가성비 파우더 바이럴. J-뷰티 필수템. Amazon Japan 판매. ¥1,034."),
        ("Anker 733 Power Bank", "틱톡에서 3-in-1 보조배터리 바이럴. 여행 필수 가젯. Amazon Japan 판매. ¥12,990."),
        ("Sharp Healsio Hotcook", "인스타에서 #ホットクック 자동요리 바이럴. 일본 스마트 쿠킹. Amazon Japan 판매. ¥47,000."),
        ("Dyson Supersonic r", "틱톡에서 #Dyson 프로용 드라이어 바이럴. 프리미엄 뷰티. Dyson JP 판매. ¥64,900."),
    ],
    ("JP", "food"): [
        ("Kogumapan (고구마빵)", "틱톡에서 #コグマパン ASMR 바이럴. Yahoo 2026 트렌드 예측 선정. Amazon Japan 판매. ¥3,240."),
        ("Matcha KitKat Limited", "틱톡/인스타에서 #抹茶キットカット 한정판 바이럴. 관광 선물 1위. Amazon Japan 판매. ¥1,080."),
        ("Calbee Potato Chips Consomme", "틱톡에서 #カルビー 한정맛 리뷰 바이럴. 일본 감자칩. Rakuten 판매. ¥298."),
        ("ROYCE Nama Chocolate", "인스타에서 #ROYCE 생초콜릿 ASMR 먹방 바이럴. 프리미엄 선물. ROYCE 판매. ¥1,166."),
        ("Tokyo Banana", "틱톡/인스타에서 #東京ばな奈 관광 선물 리뷰 바이럴. 도쿄역 판매. ¥1,188."),
        ("Lawson Uchi Cafe Sweets", "틱톡에서 #ローソン 편의점 디저트 신상 리뷰 바이럴. Lawson 판매. ¥350."),
        ("AGF Blendy Cafe Latte Sticks", "인스타에서 #AGF 홈카페 바이럴. 간편 카페라떼. Amazon Japan 판매. ¥698."),
    ],
    ("JP", "brands"): [
        ("UNIQLO", "틱톡에서 #ユニクロ 가성비 코디 바이럴. 글로벌 베이직 브랜드. UNIQLO 판매. ¥2,990."),
        ("MUJI", "인스타에서 #MUJI 미니멀 라이프 바이럴. 일본 무인양품. MUJI 판매. ¥4,990."),
        ("Shiseido", "틱톡에서 #資生堂 J-뷰티 바이럴. 일본 뷰티 글로벌 리더. Shiseido 판매. ¥4,400."),
        ("Sony", "틱톡에서 #Sony PS5/헤드폰 언박싱 바이럴. 일본 테크 아이콘. Sony Store 판매. ¥49,500."),
        ("Nintendo", "틱톡에서 #Nintendo Switch2 기대감 바이럴. 게임 문화 아이콘. Nintendo Store 판매. ¥39,980."),
        ("Sanrio", "인스타에서 #サンリオ 시나모롤/쿠로미 캐릭터 굿즈 바이럴. Sanrio 판매. ¥2,200."),
        ("ASICS", "틱톡에서 #ASICS 레트로 스니커즈 부활 바이럴. 일본 러닝 브랜드. ASICS 판매. ¥17,600."),
    ],

    # ==================== GB ====================
    ("GB", "fashion"): [
        ("Dr. Martens 1460 Boots", "틱톡에서 #DrMartens 스타일링 바이럴. 영국 클래식 부츠 아이콘. Dr. Martens 판매. £169."),
        ("ASOS Oversized Blazer", "틱톡 #ASOS 오버사이즈 블레이저 코디 바이럴. 영국 온라인 패션. ASOS 판매. £45."),
        ("The North Face Nuptse Jacket", "틱톡/인스타에서 #NorthFace 눕시 패딩 바이럴. 겨울 필수. JD Sports 판매. £280."),
        ("Primark Seamless Leggings", "틱톡에서 #Primark £8 레깅스 룰루레몬 대안으로 바이럴. Primark 판매. £8."),
        ("New Balance 550", "인스타 #NB550 영국 스트릿 스냅에서 매일 등장. 레트로 스니커즈. Amazon UK 판매. £110."),
        ("Barbour Bedale Jacket", "인스타에서 #Barbour 영국 클래식 왁스 재킷 바이럴. 컨트리 스타일. John Lewis 판매. £229."),
        ("COS Oversized Shirt Dress", "틱톡에서 #COS 미니멀 드레스 코디 바이럴. 스칸디 스타일. COS 판매. £79."),
    ],
    ("GB", "products"): [
        ("Ninja Creami Ice Cream Maker", "틱톡에서 #NinjaCreami 홈메이드 아이스크림 바이럴. 4억뷰. Amazon UK 판매. £179."),
        ("Dyson V15 Detect", "틱톡에서 #Dyson 레이저 먼지 감지 바이럴. 영국 프리미엄 청소기. Dyson UK 판매. £629."),
        ("Olaplex No.3 Hair Perfector", "틱톡 #Olaplex 헤어 케어 바이럴. 손상모 복구. Amazon UK 판매. £28."),
        ("Apple Watch Ultra 3", "인스타에서 #AppleWatch 피트니스 트래킹 바이럴. 프리미엄 웨어러블. Apple UK 판매. £799."),
        ("Charlotte Tilbury Pillow Talk Lipstick", "틱톡에서 #PillowTalk 립스틱 바이럴. 영국 뷰티 아이콘. Boots 판매. £26."),
        ("Shark FlexStyle Air Styler", "틱톡에서 다이슨 에어랩 대안으로 #SharkFlexStyle 바이럴. Argos 판매. £299."),
        ("Sol de Janeiro Brazilian Bum Bum Cream", "틱톡에서 #SolDeJaneiro 향기 바이럴. 보디 크림 인기. Boots 판매. £48."),
    ],
    ("GB", "food"): [
        ("Dubai Chocolate Bar", "틱톡에서 #DubaiChocolate 피스타치오 초콜릿 ASMR 바이럴. 영국에서도 품절 대란. Amazon UK 판매. £19.99."),
        ("Poppi Prebiotic Soda", "틱톡에서 #Poppi 건강 소다 바이럴. Tesco 입점. Tesco 판매. £2.50."),
        ("Grenade Protein Bar", "틱톡 #Grenade 프로틴바 피트니스 바이럴. 영국 헬스 트렌드. Tesco 판매. £2.99."),
        ("Biscoff Spread", "틱톡에서 #Biscoff 스프레드 레시피 바이럴. 디저트 필수재료. Sainsbury''s 판매. £2.85."),
        ("Cadbury Dairy Milk Oreo", "인스타에서 #Cadbury 한정판 초콜릿 바이럴. 영국 국민 과자. Tesco 판매. £1.50."),
        ("Graze Protein Oat Bites", "틱톡에서 #Graze 건강 간식 바이럴. 오피스 스낵 트렌드. Graze.com 판매. £4.49."),
    ],
    ("GB", "brands"): [
        ("Dyson", "틱톡에서 #Dyson 에어랩/청소기 바이럴. 영국 프리미엄 테크. Dyson UK 판매. £479."),
        ("Burberry", "인스타에서 #Burberry 체크 스카프 바이럴. 영국 럭셔리 아이콘. Burberry 판매. £450."),
        ("JD Sports", "틱톡에서 #JDSports 스니커즈 하울 바이럴. 영국 스포츠 리테일. JD Sports 판매. £89."),
        ("Marks & Spencer", "틱톡에서 #M&S 푸드홀 신상 바이럴. 영국 국민 리테일. M&S 판매. £12."),
        ("Boots", "틱톡에서 #BootsHaul 뷰티 하울 바이럴. 영국 드럭스토어. Boots 판매. £24.95."),
        ("Primark", "틱톡에서 #PrimarkHaul 가성비 패션 하울 바이럴. 영국 하이스트리트. Primark 판매. £8."),
    ],

    # ==================== FR ====================
    ("FR", "fashion"): [
        ("Sezane La Blouse Elisa", "인스타에서 #Sezane 파리지엔 블라우스 바이럴. 프렌치 시크 대표. Sezane 판매. €125."),
        ("Jacquemus Le Chiquito", "인스타에서 #Jacquemus 미니백 바이럴. 남프랑스 감성. Jacquemus 판매. €540."),
        ("AMI Paris Heart Tee", "틱톡에서 #AMIParis 하트 로고 티 바이럴. 캐주얼 럭셔리. AMI 판매. €195."),
        ("Lacoste Polo Classic", "인스타에서 #Lacoste 폴로 프렌치 스타일 바이럴. 클래식 아이콘. Lacoste 판매. €110."),
        ("Maison Margiela Tabi Boots", "틱톡에서 #Tabi 부츠 아방가르드 패션 바이럴. 패션 위크 필수. SSENSE 판매. €1,050."),
        ("Rouje Paris Wrap Dress", "인스타에서 #Rouje 랩 드레스 파리지엔 스타일 바이럴. Rouje 판매. €175."),
        ("Veja V-10 Sneakers", "틱톡에서 #Veja 지속가능 스니커즈 바이럴. 프랑스 에코 패션. Veja 판매. €160."),
    ],
    ("FR", "products"): [
        ("La Roche-Posay Anthelios SPF50", "틱톡에서 #LaRochePosay 더마 선크림 바이럴. 유럽 약국 뷰티 1위. Sephora FR 판매. €15.90."),
        ("Dyson Supersonic HD08", "틱톡에서 #Dyson 프리미엄 드라이어 바이럴. 뷰티 가전. Fnac 판매. €399."),
        ("Nuxe Huile Prodigieuse", "인스타에서 #Nuxe 프로디쥬 오일 프렌치 뷰티 바이럴. 멀티유즈 오일. Nuxe 판매. €30.50."),
        ("Le Creuset Cocotte", "인스타에서 #LeCreuset 코코트 주방 바이럴. 프리미엄 쿡웨어. Le Creuset 판매. €279."),
        ("Bioderma Sensibio H2O", "틱톡에서 #Bioderma 미셀라 워터 바이럴. 프랑스 클렌징 필수. Amazon.fr 판매. €13.90."),
        ("BaByliss Pro Digital", "틱톡에서 #BaByliss 프렌치 고데기 바이럴. 뷰티 가전. Amazon.fr 판매. €89.99."),
    ],
    ("FR", "food"): [
        ("Pierre Herme Macarons", "인스타에서 #PierreHerme 마카롱 ASMR 바이럴. 파리 프리미엄 디저트. Pierre Herme 판매. €22."),
        ("LU Petit Ecolier", "틱톡에서 #LU 프랑스 국민 과자 바이럴. 향수 자극 레트로. Carrefour 판매. €3.49."),
        ("Kusmi Tea Paris Detox", "인스타에서 #KusmiTea 디톡스 티 바이럴. 프렌치 웰빙. Kusmi 판매. €16.90."),
        ("Bonne Maman Tartlets", "틱톡에서 #BonneMaman 타르트렛 바이럴. 장인 제과. Monoprix 판매. €4.29."),
        ("La Maison du Chocolat Ganache", "인스타에서 #LaMaisonDuChocolat 프리미엄 초콜릿 바이럴. La Maison 판매. €26."),
        ("Michel et Augustin Petits Beurres", "틱톡에서 #MichelEtAugustin 버터 쿠키 바이럴. 프렌치 간식. Monoprix 판매. €3.99."),
    ],
    ("FR", "brands"): [
        ("Louis Vuitton", "인스타에서 #LouisVuitton 럭셔리 바이럴. 세계 최고 럭셔리 브랜드. Louis Vuitton 판매. €1,960."),
        ("Chanel", "인스타/틱톡에서 #Chanel N5 향수 바이럴. 아이코닉 프렌치 럭셔리. Sephora 판매. €132."),
        ("Dior", "틱톡에서 #Dior 립글로우 바이럴. 뷰티 베스트셀러. Dior 판매. €39."),
        ("Sephora", "틱톡에서 #SephoraHaul 뷰티 하울 바이럴. 글로벌 뷰티 리테일. Sephora 판매. €3.99."),
        ("Decathlon", "틱톡에서 #Decathlon 가성비 스포츠용품 바이럴. 프랑스 스포츠 브랜드. Decathlon 판매. €19.99."),
        ("Petit Bateau", "인스타에서 #PetitBateau 마리니에르 바이럴. 프렌치 캐주얼 아이콘. Petit Bateau 판매. €45."),
    ],

    # ==================== DE ====================
    ("DE", "fashion"): [
        ("Adidas Samba OG", "틱톡에서 #Samba 독일 오리진 스니커즈 바이럴. 레트로 트렌드. Zalando 판매. €100."),
        ("Birkenstock Arizona", "틱톡/인스타에서 #Birkenstock 편안한 샌들 바이럴. 독일 헤리티지. Birkenstock 판매. €80."),
        ("Birkenstock Boston Clog", "틱톡에서 #BirkenstockBoston 클로그 바이럴. 사계절 슈즈 트렌드. Birkenstock 판매. €120."),
        ("Jack Wolfskin Outdoor Jacket", "인스타에서 #JackWolfskin 독일 아웃도어 바이럴. 기능성 재킷. Amazon.de 판매. €149."),
        ("BOSS Hugo Boss Polo", "인스타에서 #BOSS 폴로 독일 프리미엄 바이럴. 비즈니스 캐주얼. BOSS 판매. €98."),
        ("Armedangels Organic Tee", "틱톡에서 #Armedangels 지속가능 패션 바이럴. 독일 에코 패션. Armedangels 판매. €39.90."),
        ("Adidas Ultraboost Light", "틱톡에서 #Ultraboost 러닝화 바이럴. 독일 스포츠 아이콘. Adidas.de 판매. €180."),
    ],
    ("DE", "products"): [
        ("Thermomix TM7", "틱톡에서 #Thermomix 스마트 쿠커 레시피 바이럴. 독일 주방 혁신. Thermomix 판매. €1,499."),
        ("Bosch Smart Home Starter Kit", "틱톡에서 #BoschSmartHome IoT 바이럴. 독일 엔지니어링. Amazon.de 판매. €179."),
        ("dm Alverde Naturkosmetik Set", "틱톡에서 #dmHaul 가성비 자연 화장품 바이럴. 독일 클린뷰티. dm 판매. €5.95."),
        ("Braun Series 9 Pro", "틱톡에서 #Braun 프리미엄 면도기 바이럴. 독일 그루밍. Amazon.de 판매. €299."),
        ("Siemens EQ9 Coffee Machine", "인스타에서 #Siemens 풀오토 커피머신 바이럴. 홈카페. MediaMarkt 판매. €1,399."),
        ("NIVEA Q10 Anti-Wrinkle Cream", "틱톡에서 #NIVEA 가성비 안티에이징 바이럴. 독일 국민 뷰티. dm 판매. €9.99."),
    ],
    ("DE", "food"): [
        ("Ritter Sport Schokolade", "틱톡에서 #RitterSport 정사각 초콜릿 바이럴. 독일 대표 초콜릿. dm 판매. €1.49."),
        ("Haribo Goldbaren", "틱톡에서 #Haribo 젤리베어 바이럴. 세계적 독일 간식. REWE 판매. €1.09."),
        ("Brezel Pretzel", "인스타에서 #Brezel 독일 전통 빵 먹방 바이럴. 옥토버페스트 간식. 베이커리 판매. €1.50."),
        ("Melitta Pour Over Coffee", "틱톡에서 #Melitta 홈카페 핸드드립 바이럴. 독일 커피 문화. Amazon.de 판매. €6.99."),
        ("Alnatura Bio-Musli", "틱톡에서 #Alnatura 유기농 뮤즐리 건강 아침 바이럴. dm 판매. €3.49."),
        ("Manner Neapolitan Wafers", "인스타에서 #Manner 웨이퍼 레트로 바이럴. 오스트리아-독일 간식. REWE 판매. €1.99."),
    ],
    ("DE", "brands"): [
        ("Adidas", "틱톡에서 #Adidas 삼바/울트라부스트 바이럴. 독일 스포츠 아이콘. Adidas.de 판매. €100."),
        ("Birkenstock", "틱톡에서 #Birkenstock 보스턴 클로그 바이럴. 독일 편안함의 상징. Birkenstock 판매. €120."),
        ("dm Drogerie", "틱톡에서 #dmHaul 가성비 뷰티/생활 바이럴. 독일 드럭스토어. dm 판매. €5.95."),
        ("NIVEA", "틱톡에서 #NIVEA 블루캔 크림 바이럴. 독일 국민 뷰티. dm 판매. €2.49."),
        ("Bosch", "인스타에서 #Bosch 독일 품질 가전 바이럴. 엔지니어링 아이콘. Amazon.de 판매. €149."),
        ("Porsche", "인스타에서 #Porsche 드림카 바이럴. 독일 럭셔리 자동차. Porsche 판매. €89,000."),
    ],

    # ==================== BR ====================
    ("BR", "fashion"): [
        ("Havaianas Slim", "틱톡에서 #Havaianas 브라질 슬리퍼 바이럴. 여름 아이콘. Havaianas 판매. R$49.99."),
        ("Farm Rio Tropical Dress", "인스타에서 #FarmRio 트로피컬 드레스 바이럴. 브라질 패션. Farm Rio 판매. R$399."),
        ("Melissa Jelly Shoes", "틱톡에서 #Melissa 젤리 슈즈 바이럴. 브라질 아이코닉 슈즈. Melissa 판매. R$199."),
        ("Colcci Jeans", "인스타에서 #Colcci 브라질 데님 바이럴. 프리미엄 진. Magazine Luiza 판매. R$229."),
        ("Reserva Basic Tee", "틱톡에서 #Reserva 기본 티 코디 바이럴. 남성 캐주얼. Reserva 판매. R$99."),
        ("Cariuma OCA Low Canvas", "틱톡에서 #Cariuma 지속가능 스니커즈 바이럴. 브라질 에코 브랜드. Cariuma 판매. R$349."),
        ("Hering Basic Collection", "틱톡에서 #Hering 가성비 기본 아이템 바이럴. 브라질 국민 브랜드. Hering 판매. R$49.99."),
    ],
    ("BR", "products"): [
        ("Natura Chronos Serum", "틱톡에서 #Natura 브라질 뷰티 세럼 바이럴. 아마존 원료. Natura 판매. R$149.90."),
        ("O Boticario Malbec Noir", "인스타에서 #OBoticario 남성 향수 바이럴. 브라질 뷰티 1위. O Boticario 판매. R$219."),
        ("JBL Tune 520BT", "틱톡에서 #JBL 가성비 무선 헤드폰 바이럴. Mercado Livre 판매. R$199."),
        ("Samsung Galaxy A55", "틱톡에서 #GalaxyA55 가성비 스마트폰 바이럴. Magazine Luiza 판매. R$1,799."),
        ("Electrolux PowerSpeed Vacuum", "틱톡에서 #Electrolux 청소기 바이럴. 브라질 가전. Americanas 판매. R$399."),
        ("Vult Make Up Kit", "틱톡에서 #Vult 가성비 메이크업 바이럴. 브라질 뷰티. Magazine Luiza 판매. R$89."),
    ],
    ("BR", "food"): [
        ("Bauducco Chocottone", "틱톡에서 #Bauducco 초코토네 시즌 한정 바이럴. 브라질 축제 간식. Carrefour BR 판매. R$29.90."),
        ("Havanna Alfajores", "인스타에서 #Alfajores 아르헨티나식 간식 바이럴. 프리미엄 과자. Havanna 판매. R$39.90."),
        ("Nescau Chocolate Drink", "틱톡에서 #Nescau 초콜릿 음료 바이럴. 브라질 국민 음료. Mercado Livre 판매. R$14.99."),
        ("Kopenhagen Pao de Mel", "인스타에서 #Kopenhagen 빵 드 멜 바이럴. 프리미엄 과자. Kopenhagen 판매. R$49.90."),
        ("Cafe Melitta Tradicional", "틱톡에서 #Melitta 브라질 커피 바이럴. 홈카페 트렌드. Mercado Livre 판매. R$18.90."),
        ("Acai Bowl", "인스타에서 #Acai 아사이볼 건강 간식 바이럴. 브라질 슈퍼푸드. 매장 판매. R$25."),
    ],
    ("BR", "brands"): [
        ("Havaianas", "틱톡에서 #Havaianas 브라질 아이코닉 슬리퍼 바이럴. 글로벌 여름 브랜드. Havaianas 판매. R$29.99."),
        ("Natura", "인스타에서 #Natura 에코 뷰티 바이럴. 아마존 원료 지속가능. Natura 판매. R$89.90."),
        ("O Boticario", "틱톡에서 #OBoticario 브라질 뷰티 바이럴. 향수/스킨케어 인기. O Boticario 판매. R$49.90."),
        ("Magazine Luiza", "틱톡에서 #MagaLu AI 캐릭터 바이럴. 브라질 이커머스 혁신. Magazine Luiza 판매. R$59.90."),
        ("Nubank", "틱톡에서 #Nubank 디지털 뱅킹 바이럴. 브라질 핀테크 유니콘. Nubank 판매. R$0."),
        ("Americanas", "틱톡에서 #Americanas 쇼핑 하울 바이럴. 브라질 리테일. Americanas 판매. R$39.90."),
    ],

    # ==================== IN ====================
    ("IN", "fashion"): [
        ("Myntra Roadster T-shirt", "틱톡에서 #Myntra 가성비 패션 하울 바이럴. 인도 온라인 패션. Myntra 판매. ₹499."),
        ("FabIndia Kurti Collection", "인스타에서 #FabIndia 현대식 쿠르티 바이럴. 인도 전통 패션 현대화. FabIndia 판매. ₹1,499."),
        ("Nike Air Force 1 India", "인스타에서 #AirForce1 인도 스니커즈 바이럴. 스트릿 패션. Amazon India 판매. ₹7,495."),
        ("Allen Solly Chinos", "틱톡에서 #AllenSolly 오피스 캐주얼 바이럴. 인도 비즈니스 패션. Flipkart 판매. ₹1,299."),
        ("Biba Anarkali Suit", "인스타에서 #Biba 전통 의상 바이럴. 축제 시즌 필수. Biba 판매. ₹2,499."),
        ("Nykaa Fashion Crop Top", "틱톡에서 #NykaaFashion 크롭탑 코디 바이럴. 인도 뷰티+패션. Nykaa 판매. ₹699."),
        ("boAt Rockerz Watch", "틱톡에서 #boAt 인도 스마트워치 바이럴. 가성비 웨어러블. Amazon India 판매. ₹1,999."),
    ],
    ("IN", "products"): [
        ("boAt Airdopes 141", "틱톡에서 #boAt 인도 1위 이어버즈 바이럴. 가성비 오디오. Amazon India 판매. ₹1,299."),
        ("Mamaearth Vitamin C Serum", "인스타에서 #Mamaearth 클린뷰티 바이럴. 인도 비건 뷰티. Amazon India 판매. ₹549."),
        ("Realme Narzo 70x", "틱톡에서 #Realme 가성비 스마트폰 바이럴. 인도 인기폰. Flipkart 판매. ₹11,999."),
        ("Mi Smart Band 9", "틱톡에서 #MiBand 가성비 피트니스 트래커 바이럴. Mi.com 판매. ₹2,999."),
        ("Plum Green Tea Face Wash", "틱톡에서 #PlumGreenTea 스킨케어 바이럴. 인도 클린뷰티. Amazon India 판매. ₹345."),
        ("Fire-Boltt Phoenix Ultra", "틱톡에서 #FireBoltt 인도 스마트워치 바이럴. 가성비 웨어러블. Flipkart 판매. ₹1,799."),
    ],
    ("IN", "food"): [
        ("Haldiram''s Soan Papdi", "인스타에서 #Haldirams 인도 전통 과자 바이럴. 축제 필수 미타이. Amazon India 판매. ₹260."),
        ("Paper Boat Aam Panna", "틱톡에서 #PaperBoat 인도 전통 음료 바이럴. 향수 자극 마케팅. BigBasket 판매. ₹30."),
        ("Too Yumm Multigrain Chips", "틱톡에서 #TooYumm 건강 스낵 바이럴. 인도 건강 간식. Amazon India 판매. ₹30."),
        ("Bikanervala Kaju Katli", "인스타에서 #KajuKatli 프리미엄 미타이 바이럴. 선물용 인기. Bikanervala 판매. ₹650."),
        ("Sleepy Owl Cold Brew", "틱톡에서 #SleepyOwl 콜드브루 바이럴. 인도 카페 트렌드. Amazon India 판매. ₹349."),
        ("Maggi Hot Heads", "틱톡에서 #MaggiHotHeads 매운맛 라면 챌린지 바이럴. BigBasket 판매. ₹40."),
    ],
    ("IN", "brands"): [
        ("Tata", "인스타에서 #Tata 인도 대기업 브랜드 바이럴. 글로벌 확장. Tata Cliq 판매. ₹4,999."),
        ("Nykaa", "틱톡에서 #Nykaa 인도 뷰티 플랫폼 바이럴. K-뷰티 인도판. Nykaa 판매. ₹799."),
        ("boAt", "틱톡에서 #boAt 인도 오디오 1위 바이럴. 가성비 이어버즈. Amazon India 판매. ₹1,499."),
        ("Amul", "인스타에서 #Amul 인도 유제품 아이콘 바이럴. 국민 브랜드. BigBasket 판매. ₹100."),
        ("Reliance Jio", "틱톡에서 #Jio 인도 통신 혁신 바이럴. 디지털 인디아. JioMart 판매. ₹6,499."),
        ("Mamaearth", "인스타에서 #Mamaearth 클린뷰티 바이럴. 인도 내추럴 뷰티 유니콘. Amazon India 판매. ₹549."),
    ],

    # ==================== AU ====================
    ("AU", "fashion"): [
        ("Cotton On Relaxed Jeans", "틱톡에서 #CottonOn 호주 캐주얼 진 바이럴. 가성비 데일리. Cotton On 판매. A$49.99."),
        ("Lorna Jane Sports Bra", "인스타에서 #LornaJane 호주 액티브웨어 바이럴. 피트니스 필수. Lorna Jane 판매. A$69.99."),
        ("RM Williams Craftsman Boots", "인스타에서 #RMWilliams 호주 아이코닉 부츠 바이럴. 헤리티지. RM Williams 판매. A$595."),
        ("Rip Curl Wetsuit", "인스타에서 #RipCurl 서핑 웻수트 바이럴. 호주 서핑 문화. Rip Curl 판매. A$199."),
        ("Bonds Originals Tee", "틱톡에서 #Bonds 호주 국민 기본 티 바이럴. 편안함 대명사. Bonds 판매. A$29.95."),
        ("P.E Nation Activewear", "인스타에서 #PENation 호주 프리미엄 액티브웨어 바이럴. The Iconic 판매. A$129."),
    ],
    ("AU", "products"): [
        ("Aesop Resurrection Aromatique", "인스타에서 #Aesop 핸드워시 바이럴. 호주 프리미엄 뷰티. Aesop 판매. A$41."),
        ("Breville Barista Express", "틱톡에서 #Breville 홈카페 바이럴. 호주 커피 문화. JB Hi-Fi 판매. A$699."),
        ("Frank Green Reusable Cup", "틱톡에서 #FrankGreen 리유저블 컵 바이럴. 호주 친환경. Frank Green 판매. A$44.95."),
        ("Go-To Skincare Face Hero", "인스타에서 #GoTo 호주 클린 뷰티 바이럴. 얼굴 오일. Go-To 판매. A$45."),
        ("Kogan Smart Robot Vacuum", "틱톡에서 #Kogan 가성비 로봇청소기 바이럴. Kogan 판매. A$299."),
        ("Dyson Airwrap AU", "틱톡에서 #DysonAirwrap 호주에서도 바이럴. 프리미엄 헤어. Dyson AU 판매. A$799."),
    ],
    ("AU", "food"): [
        ("Tim Tam Double Coat", "틱톡에서 #TimTam 호주 국민 과자 먹방 바이럴. Woolworths 판매. A$4.65."),
        ("Vegemite Squeeze", "틱톡에서 #Vegemite 호주 아이콘 챌린지 바이럴. Coles 판매. A$6.50."),
        ("T2 French Earl Grey Tea", "인스타에서 #T2Tea 호주 프리미엄 차 바이럴. T2 판매. A$15."),
        ("Carman''s Protein Bar", "틱톡에서 #Carmans 프로틴바 피트니스 바이럴. Woolworths 판매. A$5.50."),
        ("Byron Bay Cookie Company", "인스타에서 #ByronBayCookies 호주 장인 쿠키 바이럴. Amazon AU 판매. A$6.50."),
        ("Kombucha Remedy", "틱톡에서 #Remedy 콤부차 건강 음료 바이럴. 호주 웰빙. Coles 판매. A$4.50."),
    ],
    ("AU", "brands"): [
        ("Aesop", "인스타에서 #Aesop 호주 프리미엄 뷰티 바이럴. 미니멀 스킨케어. Aesop 판매. A$51."),
        ("Cotton On", "틱톡에서 #CottonOn 가성비 패션 하울 바이럴. 호주 캐주얼. Cotton On 판매. A$14.99."),
        ("Lorna Jane", "인스타에서 #LornaJane 액티브웨어 바이럴. 호주 피트니스. Lorna Jane 판매. A$109.99."),
        ("Kogan", "틱톡에서 #Kogan 가성비 가전 바이럴. 호주 이커머스. Kogan 판매. A$499."),
        ("Swisse Vitamins", "틱톡에서 #Swisse 비타민 구미 건강 바이럴. 호주 웰빙. Chemist Warehouse 판매. A$18.99."),
        ("Frank Green", "틱톡에서 #FrankGreen 리유저블 텀블러 바이럴. 호주 에코. Frank Green 판매. A$44.95."),
    ],

    # ==================== CN ====================
    ("CN", "fashion"): [
        ("Li Ning 国潮 运动鞋", "Douyin에서 #国潮 리닝 운동화 바이럴. 중국 국풍 스포츠 트렌드. JD.com 판매. ¥599."),
        ("Anta KT8 Basketball Shoes", "Douyin에서 #安踏 KT8 농구화 바이럴. 중국 스포츠 브랜드 부상. Tmall 판매. ¥899."),
        ("Bosideng Down Jacket", "Douyin에서 #波司登 패딩 바이럴. 중국 다운 브랜드 1위. JD.com 판매. ¥1,299."),
        ("PEACEBIRD Casual Set", "Douyin에서 #太平鸟 캐주얼 세트 바이럴. 중국 패스트패션. Tmall 판매. ¥299."),
        ("JNBY Designer Dress", "인스타에서 #JNBY 중국 디자이너 드레스 바이럴. 아티스틱 패션. JNBY 판매. ¥999."),
        ("Feiyue Canvas Sneakers", "Douyin/틱톡에서 #飞跃 중국 캔버스 스니커즈 해외 바이럴. 레트로 트렌드. Taobao 판매. ¥99."),
        ("SHEIN Summer Collection", "틱톡에서 #SHEIN 중국 발 패스트패션 바이럴. 글로벌 트렌드. SHEIN 판매. ¥79."),
    ],
    ("CN", "products"): [
        ("Huawei Mate 70 Pro", "Douyin에서 #华为 메이트70 프로 언박싱 바이럴. 중국 프리미엄 폰. Huawei 판매. ¥6,999."),
        ("Xiaomi 15 Ultra", "Douyin에서 #小米 15울트라 카메라 바이럴. 가성비 플래그십. Mi.com 판매. ¥5,999."),
        ("DJI Mini 4 Pro Drone", "Douyin/틱톡에서 #DJI 미니4 드론 바이럴. 세계 1위 드론. DJI Store 판매. ¥4,788."),
        ("Dreame L20 Ultra Robot Vacuum", "Douyin에서 #追觅 AI 로봇청소기 바이럴. 스마트홈. Tmall 판매. ¥4,299."),
        ("Anker GaN Charger", "Douyin에서 #安克 GaN 충전기 바이럴. 여행 필수 가젯. JD.com 판매. ¥168."),
        ("Baseus Magnetic Power Bank", "틱톡에서 #Baseus 자석 보조배터리 바이럴. 아이폰 필수템. Taobao 판매. ¥129."),
    ],
    ("CN", "food"): [
        ("三只松鼠 Nuts Gift Box", "Douyin 라이브커머스에서 #三只松鼠 견과 선물세트 바이럴. Tmall 판매. ¥99."),
        ("良品铺子 Dried Meat Floss Cake", "Douyin에서 #良品铺子 육송병 바이럴. 중국 전통 간식. JD.com 판매. ¥19.90."),
        ("百草味 Dried Mango", "Douyin에서 #百草味 건망고 먹방 바이럴. Pinduoduo 판매. ¥15.90."),
        ("瑞幸 Coconut Latte Powder", "Douyin에서 #瑞幸 코코넛라떼 파우더 바이럴. 중국 카페 트렌드. Tmall 판매. ¥59.90."),
        ("蒙牛 Premium Milk", "Douyin에서 #蒙牛 특룬수 프리미엄 우유 바이럴. JD.com 판매. ¥69.90."),
        ("螺蛳粉 Liuzhou Snail Noodles", "Douyin에서 #螺蛳粉 류저우 달팽이국수 먹방 바이럴. Taobao 판매. ¥12.90."),
    ],
    ("CN", "brands"): [
        ("Huawei", "Douyin에서 #华为 테크 브랜드 바이럴. 중국 프리미엄 테크. Huawei 판매. ¥2,488."),
        ("Xiaomi", "Douyin에서 #小米 가성비 생태계 바이럴. 스마트홈 통합. Mi.com 판매. ¥299."),
        ("Li Ning", "Douyin에서 #李宁 국풍 스포츠 바이럴. 중국 브랜드 부상. Li Ning 판매. ¥1,099."),
        ("SHEIN", "틱톡에서 #SHEIN 글로벌 패스트패션 바이럴. 중국 발 트렌드. SHEIN 판매. ¥79."),
        ("BYD", "Douyin에서 #比亚迪 중국 EV 바이럴. 전기차 세계 1위. BYD 판매. ¥108,000."),
        ("Luckin Coffee", "Douyin에서 #瑞幸 중국 카페 바이럴. 스타벅스 추월. Luckin 판매. ¥19."),
    ],

    # ==================== TH ====================
    ("TH", "fashion"): [
        ("CPS Chaps Polo Shirt", "틱톡에서 #CPS 태국 캐주얼 폴로 바이럴. 로컬 브랜드. CPS 판매. ฿890."),
        ("Carnival Sneaker Collab", "인스타에서 #CarnivalBKK 스니커즈 콜라보 바이럴. 태국 스니커즈 문화. Carnival 판매. ฿4,990."),
        ("UNIQLO AIRism Thailand", "틱톡에서 #UNIQLO 에어리즘 태국 더위 필수 바이럴. Uniqlo TH 판매. ฿590."),
        ("Pomelo Fashion Dress", "인스타에서 #Pomelo 태국 온라인 패션 바이럴. 동남아 트렌드. Pomelo 판매. ฿1,290."),
        ("Jaspal Contemporary", "인스타에서 #Jaspal 태국 프리미엄 패션 바이럴. 방콕 디자이너. Jaspal 판매. ฿1,990."),
        ("Sretsis Bangkok Blouse", "인스타에서 #Sretsis 태국 럭셔리 블라우스 바이럴. 방콕 패션. Sretsis 판매. ฿3,490."),
    ],
    ("TH", "products"): [
        ("Mistine Sunscreen SPF50", "틱톡에서 #Mistine 태국 선크림 바이럴. 동남아 뷰티 1위. Lazada TH 판매. ฿299."),
        ("OPPO Reno 12 Pro", "틱톡에서 #OPPO 태국 인기폰 바이럴. 셀피 스마트폰. Shopee TH 판매. ฿15,999."),
        ("Panasonic Ionity Dryer", "인스타에서 #Panasonic 태국 뷰티 가전 바이럴. Central Online 판매. ฿1,990."),
        ("Xiaomi Air Purifier 4", "틱톡에서 #Xiaomi 방콕 미세먼지 대책 바이럴. Lazada TH 판매. ฿5,490."),
        ("Samsung Galaxy Tab S9 FE", "틱톡에서 #Samsung 태국 학생 태블릿 바이럴. JD Central 판매. ฿13,990."),
        ("Beauty Buffet Ginseng Serum", "틱톡에서 #BeautyBuffet 태국 뷰티 가성비 바이럴. Shopee TH 판매. ฿199."),
    ],
    ("TH", "food"): [
        ("Mama Tom Yum Ramen", "틱톡에서 #Mama 태국 국민 라면 먹방 바이럴. 7-Eleven TH 판매. ฿7."),
        ("Bento Squid Snack", "틱톡에서 #Bento 오징어 스낵 ASMR 바이럴. 태국 간식 대표. 7-Eleven TH 판매. ฿10."),
        ("Doi Kham Dried Mango", "인스타에서 #DoiKham 건망고 태국 왕실 브랜드 바이럴. Central Food Hall 판매. ฿85."),
        ("Lay''s Thailand Limited", "틱톡에서 #Lays 태국 한정맛 리뷰 바이럴. Big C 판매. ฿25."),
        ("Singha Sparkling Water", "인스타에서 #Singha 프리미엄 스파클링 바이럴. Big C 판매. ฿20."),
        ("After You Dessert Cafe", "인스타에서 #AfterYou 태국 디저트 카페 바이럴. 카키고리 빙수. After You 판매. ฿289."),
    ],
    ("TH", "brands"): [
        ("CP All (7-Eleven TH)", "틱톡에서 #7ElevenTH 한정 상품 리뷰 바이럴. 태국 편의점 문화. 7-Eleven TH 판매. ฿49."),
        ("Central Group", "인스타에서 #Central 태국 리테일 바이럴. 백화점 문화. Central 판매. ฿2,000."),
        ("True Digital", "틱톡에서 #True 태국 통신 바이럴. 디지털 라이프. True Store 판매. ฿590."),
        ("Pomelo Fashion", "인스타에서 #Pomelo 동남아 온라인 패션 바이럴. Pomelo 판매. ฿890."),
        ("Thai Airways", "인스타에서 #ThaiAirways 항공 굿즈 바이럴. King Power 판매. ฿890."),
        ("Grab Thailand", "틱톡에서 #Grab 태국 슈퍼앱 바이럴. 배달/택시. Grab 판매. ฿0."),
    ],

    # ==================== MX ====================
    ("MX", "fashion"): [
        ("Liverpool Blusa Casual", "틱톡에서 #Liverpool 멕시코 백화점 하울 바이럴. Liverpool 판매. $499 MXN."),
        ("Nike Air Max TW Mexico", "인스타에서 #NikeAirMax 멕시코 에디션 바이럴. Mercado Libre 판매. $2,499 MXN."),
        ("Bershka MX Cargo Pants", "틱톡에서 #Bershka 카고팬츠 Y2K 바이럴. Bershka MX 판매. $799 MXN."),
        ("Shasa Fashion Dress", "틱톡에서 #Shasa 멕시코 패스트패션 바이럴. Shasa 판매. $699 MXN."),
        ("Zara MX Wide Leg Jeans", "인스타에서 #ZaraMX 와이드레그 진 바이럴. Zara MX 판매. $899 MXN."),
        ("Pull&Bear MX Oversized Tee", "틱톡에서 #PullBear 오버사이즈 티 바이럴. Pull&Bear MX 판매. $499 MXN."),
    ],
    ("MX", "products"): [
        ("Xiaomi Redmi Note 13 Pro", "틱톡에서 #Xiaomi 멕시코 가성비 폰 바이럴. Mercado Libre 판매. $4,999 MXN."),
        ("Amazon Echo Dot 5", "틱톡에서 #Alexa 스마트 스피커 바이럴. Amazon MX 판매. $1,049 MXN."),
        ("Samsung Galaxy Buds FE", "틱톡에서 #Samsung 가성비 이어버즈 바이럴. Liverpool 판매. $1,499 MXN."),
        ("Miniso LED Ring Light", "틱톡에서 #Miniso 링라이트 콘텐츠 크리에이터 바이럴. Miniso 판매. $399 MXN."),
        ("L''Oreal Elvive Hyaluron", "틱톡에서 #LOreal 헤어케어 바이럴. 멕시코 드럭스토어 뷰티. Walmart MX 판매. $129 MXN."),
        ("JBL Clip 4 Speaker", "틱톡에서 #JBL 포터블 스피커 바이럴. Mercado Libre 판매. $1,299 MXN."),
    ],
    ("MX", "food"): [
        ("Takis Fuego", "틱톡에서 #Takis 멕시코 국민 과자 바이럴. 매운맛 챌린지. Walmart MX 판매. $28 MXN."),
        ("De la Rosa Mazapan", "틱톡에서 #Mazapan 멕시코 전통 과자 바이럴. ASMR 먹방. Walmart MX 판매. $12 MXN."),
        ("Carlos V Chocolate", "틱톡에서 #CarlosV 멕시코 전통 초콜릿 바이럴. OXXO 판매. $18 MXN."),
        ("Sabritas Adobadas", "틱톡에서 #Sabritas 감자칩 바이럴. 멕시코 간식 아이콘. Walmart MX 판매. $22 MXN."),
        ("Boing! Mango Juice", "틱톡에서 #Boing 망고 주스 멕시코 국민 음료 바이럴. OXXO 판매. $15 MXN."),
        ("Duvalin Candy", "틱톡에서 #Duvalin 멕시코 캔디 ASMR 바이럴. 향수 간식. Walmart MX 판매. $10 MXN."),
    ],
    ("MX", "brands"): [
        ("Bimbo", "틱톡에서 #Bimbo 멕시코 식품 대기업 바이럴. 국민 브랜드. Walmart MX 판매. $49 MXN."),
        ("Liverpool", "인스타에서 #Liverpool 멕시코 백화점 바이럴. 쇼핑 문화. Liverpool 판매. $500 MXN."),
        ("Corona", "인스타에서 #Corona 멕시코 맥주 글로벌 바이럴. OXXO 판매. $119 MXN."),
        ("OXXO", "틱톡에서 #OXXO 멕시코 편의점 한정 상품 바이럴. OXXO 판매. $25 MXN."),
        ("Telcel", "틱톡에서 #Telcel 멕시코 통신 1위 바이럴. Telcel Store 판매. $100 MXN."),
        ("Cinepolis", "틱톡에서 #Cinepolis 멕시코 영화관 팝콘 바이럴. Cinepolis 판매. $89 MXN."),
    ],

    # ==================== TR ====================
    ("TR", "fashion"): [
        ("LC Waikiki Basic Tee", "틱톡에서 #LCWaikiki 가성비 패션 바이럴. 터키 국민 브랜드. LC Waikiki 판매. ₺149."),
        ("DeFacto Slim Jean", "틱톡에서 #DeFacto 슬림진 바이럴. 터키 패스트패션. DeFacto 판매. ₺399."),
        ("Koton Summer Dress", "인스타에서 #Koton 여름 원피스 바이럴. Trendyol 판매. ₺599."),
        ("Mavi Jeans Gold", "인스타에서 #Mavi 터키 데님 브랜드 바이럴. 프리미엄 진. Mavi 판매. ₺899."),
        ("Ipekyol Modest Collection", "인스타에서 #Ipekyol 모디스트 패션 바이럴. 터키 프리미엄. Ipekyol 판매. ₺1,999."),
        ("Trendyol Fashion Set", "틱톡에서 #TrendyolFashion 코디 세트 바이럴. 터키 이커머스 1위. Trendyol 판매. ₺499."),
    ],
    ("TR", "products"): [
        ("Arcelik Telve Coffee Maker", "틱톡에서 #Arcelik 터키 커피 메이커 바이럴. 전통 커피 문화. n11 판매. ₺1,499."),
        ("Farmasi Skincare Set", "틱톡에서 #Farmasi 터키 뷰티 바이럴. 가성비 스킨케어. Farmasi 판매. ₺499."),
        ("Vestel Venus V7", "틱톡에서 #Vestel 터키 스마트폰 바이럴. 로컬 테크. Hepsiburada 판매. ₺5,999."),
        ("Beko Smart Oven", "인스타에서 #Beko 스마트 오븐 바이럴. 터키 가전. Hepsiburada 판매. ₺3,999."),
        ("Philips OneBlade TR", "틱톡에서 #OneBlade 남성 그루밍 바이럴. Trendyol 판매. ₺899."),
        ("Golden Rose Cosmetics", "틱톡에서 #GoldenRose 터키 가성비 화장품 바이럴. Trendyol 판매. ₺89."),
    ],
    ("TR", "food"): [
        ("Ulker Cikolata Gofret", "틱톡에서 #Ulker 초콜릿 고프레 바이럴. 터키 국민 과자. A101 판매. ₺15."),
        ("Tadim Kuruyemis Mix", "틱톡에서 #Tadim 견과류 믹스 바이럴. 터키 간식. BIM 판매. ₺59."),
        ("Dido Wafer", "틱톡에서 #Dido 웨이퍼 바이럴. 터키 인기 과자. SOK 판매. ₺10."),
        ("Caykur Rize Tea", "인스타에서 #Caykur 터키 홍차 바이럴. 차 문화 아이콘. Migros 판매. ₺79."),
        ("Tariş Olive Oil", "인스타에서 #Taris 프리미엄 올리브오일 바이럴. Migros 판매. ₺189."),
        ("Simit Sarayi Simit", "틱톡에서 #Simit 터키 전통 빵 바이럴. 길거리 음식. Simit Sarayi 판매. ₺15."),
    ],
    ("TR", "brands"): [
        ("LC Waikiki", "틱톡에서 #LCWaikiki 가성비 패션 바이럴. 터키 국민 패션. LC Waikiki 판매. ₺299."),
        ("Trendyol", "틱톡에서 #Trendyol 터키 이커머스 1위 바이럴. 쇼핑 플랫폼. Trendyol 판매. ₺499."),
        ("Arcelik", "인스타에서 #Arcelik 터키 가전 1위 바이럴. 품질 신뢰. Arcelik 판매. ₺7,999."),
        ("Turkish Airlines", "인스타에서 #TurkishAirlines 항공 바이럴. 터키 국적 항공사. THY Shop 판매. ₺899."),
        ("Koctas", "틱톡에서 #Koctas 스마트홈 바이럴. 터키 홈 브랜드. Koctas 판매. ₺1,299."),
        ("DeFacto", "틱톡에서 #DeFacto 가성비 패션 바이럴. 터키 패스트패션. DeFacto 판매. ₺399."),
    ],

    # ==================== SA ====================
    ("SA", "fashion"): [
        ("Ounass Designer Abaya", "인스타에서 #Ounass 디자이너 아바야 바이럴. 사우디 럭셔리 모디스트. Ounass 판매. SAR 1,500."),
        ("Namshi Sports Sneaker", "틱톡에서 #Namshi 스니커즈 바이럴. 사우디 스포츠 패션. Namshi 판매. SAR 399."),
        ("SHEIN SA Modest Dress", "틱톡에서 #SHEIN 모디스트 드레스 바이럴. 가성비 패션. SHEIN SA 판매. SAR 89."),
        ("Nike Air Jordan 1 SA", "인스타에서 #AirJordan 사우디 스니커즈 바이럴. Noon SA 판매. SAR 699."),
        ("Styli Fashion Top", "틱톡에서 #Styli 사우디 온라인 패션 바이럴. Styli 판매. SAR 129."),
        ("Centrepoint Family Fashion", "틱톡에서 #Centrepoint 사우디 가족 패션 바이럴. Centrepoint 판매. SAR 199."),
    ],
    ("SA", "products"): [
        ("Apple iPhone 16 Pro SA", "틱톡에서 #iPhone16Pro 사우디 언박싱 바이럴. Jarir 판매. SAR 5,299."),
        ("Dyson V12 Detect SA", "틱톡에서 #Dyson 프리미엄 청소기 바이럴. Noon SA 판매. SAR 2,499."),
        ("Samsung Galaxy Z Fold 6", "틱톡에서 #GalaxyFold 폴더블 바이럴. Jarir 판매. SAR 7,499."),
        ("Sony PS5 Slim SA", "틱톡에서 #PS5 게임 바이럴. 사우디 게이밍 트렌드. Jarir 판매. SAR 1,899."),
        ("Foreo Luna 4 SA", "인스타에서 #Foreo 뷰티 디바이스 바이럴. Noon SA 판매. SAR 1,199."),
        ("Huda Beauty Faux Filter", "인스타에서 #HudaBeauty 중동 뷰티 바이럴. Sephora SA 판매. SAR 199."),
    ],
    ("SA", "food"): [
        ("Al Baik Sauce", "틱톡에서 #AlBaik 사우디 국민 패스트푸드 소스 바이럴. Al Baik 판매. SAR 15."),
        ("Dubai Chocolate Bar SA", "틱톡에서 #DubaiChocolate 사우디에서도 품절 대란 바이럴. Amazon.sa 판매. SAR 75."),
        ("Almarai Dates Filled", "인스타에서 #Almarai 대추야자 초콜릿 바이럴. 사우디 전통 간식. Tamimi 판매. SAR 29."),
        ("Nadec Laban", "틱톡에서 #Nadec 라반 유산균 음료 바이럴. Danube 판매. SAR 5."),
        ("Saudi Arabic Coffee", "인스타에서 #ArabicCoffee 사우디 전통 커피 바이럴. Amazon.sa 판매. SAR 89."),
        ("Al Fakher Arabic Sweets", "인스타에서 #ArabicSweets 전통 디저트 바이럴. Panda 판매. SAR 45."),
    ],
    ("SA", "brands"): [
        ("NEOM", "인스타에서 #NEOM 사우디 미래도시 브랜드 바이럴. 비전 2030. NEOM 판매. SAR 199."),
        ("Almarai", "틱톡에서 #Almarai 사우디 유제품 1위 바이럴. 국민 브랜드. Tamimi 판매. SAR 12."),
        ("STC", "틱톡에서 #STC 사우디 통신 바이럴. 디지털 인프라. STC 판매. SAR 100."),
        ("Jarir Bookstore", "틱톡에서 #Jarir 사우디 테크/서점 바이럴. Jarir 판매. SAR 49."),
        ("Al Baik", "틱톡에서 #AlBaik 사우디 패스트푸드 바이럴. 국민 치킨. Al Baik 판매. SAR 15."),
        ("Aramco", "인스타에서 #Aramco 사우디 에너지 기업 바이럴. 세계 최대 기업. Aramco 판매. SAR 0."),
    ],

    # ==================== NG ====================
    ("NG", "fashion"): [
        ("Ankara Print Dress", "틱톡에서 #Ankara 나이지리아 전통 패턴 드레스 바이럴. 아프리카 패션. Jumia NG 판매. NGN 8,500."),
        ("Adidas Lagos City Pack", "인스타에서 #AdidasLagos 나이지리아 에디션 바이럴. Konga 판매. NGN 45,000."),
        ("Orange Culture Shirt", "인스타에서 #OrangeCulture 나이지리아 디자이너 바이럴. 아프리카 패션. Orange Culture 판매. NGN 25,000."),
        ("PayPorte Basic Tee", "틱톡에서 #PayPorte 가성비 패션 바이럴. 나이지리아 온라인. PayPorte 판매. NGN 3,500."),
        ("Deola Sagoe Collection", "인스타에서 #DeolaSagoe 나이지리아 하이패션 바이럴. Deola Sagoe 판매. NGN 85,000."),
        ("Lisa Folawiyo Studio", "인스타에서 #LisaFolawiyo 나이지리아 럭셔리 바이럴. 아프리카 패션위크. Lisa Folawiyo 판매. NGN 120,000."),
    ],
    ("NG", "products"): [
        ("Tecno Spark 20 Pro+", "틱톡에서 #Tecno 아프리카 가성비 폰 바이럴. Jumia NG 판매. NGN 120,000."),
        ("Oraimo FreePods 4", "틱톡에서 #Oraimo 아프리카 이어버즈 1위 바이럴. Konga 판매. NGN 15,000."),
        ("Hisense 43-inch Smart TV", "틱톡에서 #Hisense 가성비 TV 바이럴. Jumia NG 판매. NGN 185,000."),
        ("Starlink Mini Kit Nigeria", "틱톡에서 #Starlink 나이지리아 인터넷 혁신 바이럴. Starlink 판매. NGN 250,000."),
        ("Nexus Gas Cooker", "틱톡에서 #Nexus 나이지리아 주방 필수 바이럴. Jumia NG 판매. NGN 95,000."),
        ("Infinix Note 40 Pro", "틱톡에서 #Infinix 아프리카 폰 바이럴. 가성비 스마트폰. Jumia NG 판매. NGN 180,000."),
    ],
    ("NG", "food"): [
        ("Indomie Instant Noodles", "틱톡에서 #Indomie 나이지리아 국민 라면 먹방 바이럴. Shoprite 판매. NGN 200."),
        ("Gala Sausage Roll", "틱톡에서 #Gala 나이지리아 간식 아이콘 바이럴. 길거리 판매. NGN 300."),
        ("Dangote Sugar", "틱톡에서 #Dangote 나이지리아 식품 대기업 바이럴. Shoprite 판매. NGN 1,200."),
        ("Peak Milk Evaporated", "인스타에서 #PeakMilk 나이지리아 우유 1위 바이럴. Shoprite 판매. NGN 500."),
        ("Milo Nigeria", "틱톡에서 #Milo 나이지리아 인기 음료 바이럴. Shoprite 판매. NGN 2,500."),
        ("Bigi Cola", "틱톡에서 #BigiCola 나이지리아 로컬 콜라 바이럴. 길거리 판매. NGN 150."),
    ],
    ("NG", "brands"): [
        ("Jumia", "틱톡에서 #Jumia 아프리카 이커머스 1위 바이럴. Jumia NG 판매. NGN 10,000."),
        ("Dangote", "인스타에서 #Dangote 나이지리아 대기업 바이럴. 아프리카 최대 기업. Dangote Store 판매. NGN 5,000."),
        ("Paystack", "틱톡에서 #Paystack 나이지리아 핀테크 바이럴. 결제 혁신. Paystack 판매. NGN 15,000."),
        ("Flutterwave", "틱톡에서 #Flutterwave 아프리카 핀테크 바이럴. 글로벌 확장. Flutterwave 판매. NGN 12,000."),
        ("GTBank", "인스타에서 #GTBank 나이지리아 은행 바이럴. 디지털 뱅킹. GTBank 판매. NGN 8,000."),
        ("Indomie Nigeria", "틱톡에서 #Indomie 나이지리아 국민 라면 브랜드 바이럴. Shoprite 판매. NGN 200."),
    ],
}

# ================================================================
# 바이럴 중심 템플릿 (비주요 국가용)
# ================================================================
VIRAL_TEMPLATES = {
    "fashion": [
        ("TikTok Viral Oversized Hoodie", "틱톡에서 #OversizedHoodie 편안한 캐주얼룩 바이럴. 데일리 필수 아이템"),
        ("Instagram #OOTD Wide Pants", "인스타 #OOTD에서 자주 보이는 와이드 팬츠. 스트릿 트렌드"),
        ("TikTok Viral Cargo Pants", "틱톡에서 #CargoPants Y2K 카고팬츠 바이럴. 스트릿 패션 필수"),
        ("Instagram Viral Mini Bag", "인스타에서 #MiniBag 미니백 트렌드 바이럴. 크로스바디 스타일"),
        ("TikTok #GRWM Sports Leggings", "틱톡 #GRWM에서 운동 레깅스 바이럴. 애슬레저 트렌드"),
        ("TikTok Viral Chunky Sneakers", "틱톡에서 #ChunkySneakers 볼륨 스니커즈 바이럴. 90년대 레트로"),
        ("Instagram Viral Linen Shirt", "인스타에서 린넨 셔츠 여름 코디 바이럴. 미니멀 스타일"),
        ("TikTok Viral Crop Cardigan", "틱톡에서 #CropCardigan 크롭 가디건 바이럴. 레이어드 필수"),
    ],
    "products": [
        ("TikTok Viral Wireless Earbuds", "틱톡에서 #Earbuds 무선 이어버즈 리뷰 바이럴. 노이즈캔슬링"),
        ("TikTok Viral LED Desk Lamp", "틱톡에서 #DeskSetup LED 램프 바이럴. 재택근무/학습용"),
        ("Instagram Viral Smart Water Bottle", "인스타에서 스마트 워터 보틀 건강 루틴 바이럴"),
        ("TikTok Viral Mini Projector", "틱톡에서 #MiniProjector 미니 프로젝터 바이럴. 홈시네마"),
        ("TikTok Viral Power Bank 10000mAh", "틱톡에서 #PowerBank 슬림 보조배터리 바이럴. USB-C"),
        ("TikTok Viral Beauty LED Mirror", "틱톡에서 #Vanity LED 뷰티 미러 바이럴. GRWM 필수"),
    ],
    "food": [
        ("TikTok Viral Dubai Chocolate", "틱톡에서 #DubaiChocolate 피스타치오 초콜릿 ASMR 바이럴"),
        ("TikTok Viral Protein Snack Bar", "틱톡에서 #ProteinBar 프로틴 스낵바 피트니스 바이럴"),
        ("Instagram Viral Matcha Latte", "인스타에서 #MatchaLatte 말차 라떼 카페 바이럴"),
        ("TikTok Viral Gummy Candy", "틱톡에서 ASMR 구미 캔디 먹방 바이럴"),
        ("TikTok Viral Instant Ramen", "틱톡에서 라면 레시피 바이럴. 퓨전 라면 트렌드"),
        ("Instagram Viral Artisan Cookie", "인스타에서 장인 쿠키 디저트 바이럴. 수제 트렌드"),
    ],
    "brands": [
        ("Nike (Global Viral)", "틱톡/인스타에서 #Nike 스니커즈 바이럴. 글로벌 스포츠 아이콘"),
        ("Samsung (Global Viral)", "틱톡에서 #Samsung 갤럭시 언박싱 바이럴. 글로벌 테크"),
        ("Apple (Global Viral)", "틱톡/인스타에서 #Apple 에코시스템 바이럴. 프리미엄 테크"),
        ("SHEIN (Global Viral)", "틱톡에서 #SHEINhaul 가성비 패션 바이럴. 글로벌 패스트패션"),
        ("Adidas (Global Viral)", "틱톡에서 #Adidas 삼바/가젤 레트로 바이럴. 스포츠 아이콘"),
        ("TikTok Shop Local Brand", "틱톡 샵에서 로컬 브랜드 바이럴. 소셜 커머스 트렌드"),
    ],
}


# ================================================================
# 유틸리티 함수
# ================================================================

def escape_sql(s: str) -> str:
    if not s:
        return ""
    return s.replace("'", "''").replace("\\", "\\\\")


def format_local_price(usd_amount: float, country_code: str) -> str:
    info = CURRENCY_INFO.get(country_code, ("USD", "$", 1))
    _, symbol, rate = info
    local_amount = usd_amount * rate
    if rate >= 1000:
        local_amount = round(local_amount, -2)
        formatted = f"{int(local_amount):,}"
    elif rate >= 100:
        local_amount = round(local_amount, -1)
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
    rng = random.Random(seed_val)
    heat = max(50, min(100, base_heat + rng.randint(-15, 10)))
    search = max(30, heat + rng.randint(-15, 5))
    social = max(40, heat + rng.randint(-10, 10))  # social score higher for viral items
    ecommerce = max(30, heat + rng.randint(-10, 5))
    news = max(20, heat + rng.randint(-20, 0))
    status = "rising" if heat >= 70 else "steady"
    return heat, status, search, social, ecommerce, news


def get_country_info(code: str):
    for c in ALL_COUNTRIES:
        if c[0] == code:
            return c
    return None


def get_country_name_ko(code: str) -> str:
    info = get_country_info(code)
    return info[1] if info else code


def log(msg: str):
    print(f"[{datetime.now().strftime('%H:%M:%S')}] {msg}")


# ================================================================
# 메인 데이터 생성 로직
# ================================================================

def generate_top15_data():
    """주요 15개국 바이럴 데이터 생성"""
    all_items = []
    for (cc, cat), products in VIRAL_DATA.items():
        for i, (name, desc) in enumerate(products):
            seed_val = int(hashlib.md5(f"{cc}_{cat}_{name}".encode()).hexdigest()[:8], 16)
            heat, status, search, social, ecomm, news = generate_heat_scores(seed_val, 88 - i * 2)

            parts = desc.rstrip('.').split('. ')
            store = ""
            price = ""
            for p in parts:
                if '판매' in p:
                    store = p.replace(' 판매', '')
            if parts:
                last_part = parts[-1].strip()
                if any(c in last_part for c in '$₩¥£€₹฿₦₺₱') or last_part.startswith(('SAR', 'AED', 'R$', 'A$', 'C$', 'NGN')):
                    price = last_part

            tags = []
            if price:
                tags.append(price)
            if store:
                tags.append(store)

            all_items.append({
                "country_code": cc,
                "category_slug": cat,
                "name": name,
                "description": desc,
                "heat_score": heat,
                "heat_status": status,
                "search_score": search,
                "social_score": social,
                "ecommerce_score": ecomm,
                "news_score": news,
                "tags": tags,
            })
    return all_items


def generate_template_items(cc, cat, count, key_index, rng, base_heat=75):
    """템플릿 기반 바이럴 상품 생성"""
    items = []
    template_cc = TEMPLATE_MAP.get(cc, "US")
    stores = LOCAL_STORES.get(cc, LOCAL_STORES.get(template_cc, ["Online Store"]))
    country_name = get_country_name_ko(cc)
    seed_base = int(hashlib.md5(f"{cc}_{cat}".encode()).hexdigest()[:8], 16)

    # 참조 아이템 (template country 데이터)
    template_items = key_index.get((template_cc, cat), [])
    used_names = set()
    selected_sources = []

    if template_items:
        sampled = rng.sample(template_items, min(count, len(template_items)))
        for item in sampled:
            selected_sources.append(("ref", item))
            used_names.add(item["name"])

    # 부족분은 VIRAL_TEMPLATES에서 보충
    templates = VIRAL_TEMPLATES.get(cat, [])
    available = [t for t in templates if t[0] not in used_names]
    while len(selected_sources) < count and available:
        tpl = rng.choice(available)
        selected_sources.append(("tpl", tpl))
        used_names.add(tpl[0])
        available = [t for t in available if t[0] not in used_names]

    for i, source in enumerate(selected_sources):
        store = rng.choice(stores) if stores else "Online Store"
        price_ranges = {"fashion": (10, 80), "products": (8, 60), "food": (3, 25), "brands": (10, 80)}
        low, high = price_ranges.get(cat, (5, 30))
        usd_price = rng.uniform(low, high)
        local_price = format_local_price(usd_price, cc)

        if source[0] == "ref":
            name = source[1]["name"]
            # Build viral description for this country
            desc = f"{country_name}에서 틱톡/인스타 바이럴 트렌드로 인기. 소셜 미디어 통해 확산. {store} 판매. {local_price}."
        else:
            name = source[1][0]
            base_desc = source[1][1]
            desc = f"{country_name}에서 {base_desc}. {store} 판매. {local_price}."

        score_seed = seed_base + i * 7
        heat, status, search, social, ecomm, news = generate_heat_scores(score_seed, base_heat - i * 2)

        items.append({
            "country_code": cc,
            "category_slug": cat,
            "name": name,
            "description": desc,
            "heat_score": heat,
            "heat_status": status,
            "search_score": search,
            "social_score": social,
            "ecommerce_score": ecomm,
            "news_score": news,
            "tags": [local_price, store],
        })

    return items


def generate_all_data(explicit_data):
    """190개국 전체 데이터 생성"""
    all_items = list(explicit_data)
    categories = ["fashion", "products", "food", "brands"]

    key_index = {}
    for item in explicit_data:
        k = (item["country_code"], item["category_slug"])
        key_index.setdefault(k, []).append(item)

    explicit_codes = set(d["country_code"] for d in explicit_data)

    for c_info in ALL_COUNTRIES:
        cc = c_info[0]
        for cat in categories:
            existing = key_index.get((cc, cat), [])
            if cc in explicit_codes and len(existing) >= 4:
                continue

            seed_base = int(hashlib.md5(f"{cc}_{cat}_gen".encode()).hexdigest()[:8], 16)
            rng = random.Random(seed_base)

            if cc in TOP15:
                target = rng.randint(6, 8)
                base_heat = 85
            else:
                target = rng.randint(4, 5)
                base_heat = 72

            needed = target - len(existing)
            if needed <= 0:
                continue

            new_items = generate_template_items(cc, cat, needed, key_index, rng, base_heat)
            all_items.extend(new_items)
            for ni in new_items:
                k = (ni["country_code"], ni["category_slug"])
                key_index.setdefault(k, []).append(ni)

    return all_items


def generate_region_sql(trends, region_name, region_codes, part_num, total_parts):
    """지역별 SQL 생성 (INSERT만, TRUNCATE/DELETE 없음)"""
    region_trends = [t for t in trends if t["country_code"] in region_codes]

    sql = []
    sql.append(f"-- MONTRA 190개국 바이럴 트렌드 데이터 - {region_name}")
    sql.append(f"-- Part {part_num}/{total_parts}")
    sql.append(f"-- 생성: {datetime.now(timezone.utc).strftime('%Y-%m-%d %H:%M UTC')}")
    sql.append(f"-- 국가: {len(set(t['country_code'] for t in region_trends))}개국, 상품: {len(region_trends)}개")
    sql.append(f"-- TikTok/Instagram 바이럴 중심 데이터")
    sql.append("")

    # Trend INSERTs only - no TRUNCATE/DELETE
    sql.append(f"-- {region_name} 트렌드 ({len(region_trends)}개)")
    for t in region_trends:
        tags_arr = "ARRAY[" + ",".join(f"'{escape_sql(tg)}'" for tg in t.get("tags", [])[:5]) + "]"

        sql.append(
            f"INSERT INTO trends (country_id, category_id, name, description, "
            f"heat_score, heat_status, search_score, social_score, ecommerce_score, news_score, tags) "
            f"SELECT c.id, cat.id, '{escape_sql(t['name'])}', '{escape_sql(t['description'])}', "
            f"{t['heat_score']}, '{t['heat_status']}', "
            f"{t['search_score']}, {t['social_score']}, {t['ecommerce_score']}, {t['news_score']}, "
            f"{tags_arr} "
            f"FROM countries c, categories cat "
            f"WHERE c.code = '{t['country_code']}' AND cat.slug = '{t['category_slug']}';"
        )

    return "\n".join(sql), len(region_trends)


def main():
    log("=" * 60)
    log("190개국 바이럴 트렌드 데이터 생성 시작 (v2)")
    log("=" * 60)

    # 1. 주요 15개국 바이럴 데이터
    log("\n[1/3] 주요 15개국 바이럴 데이터 생성 중...")
    explicit_data = generate_top15_data()
    explicit_countries = set(d["country_code"] for d in explicit_data)
    log(f"  바이럴 데이터: {len(explicit_data)}개 상품, {len(explicit_countries)}개국")

    # 2. 190개국 전체 데이터 생성
    log("\n[2/3] 190개국 전체 데이터 생성 중...")
    all_trends = generate_all_data(explicit_data)
    total_countries = len(set(t["country_code"] for t in all_trends))
    log(f"  총 상품: {len(all_trends)}개")
    log(f"  총 국가: {total_countries}개")

    for cat in ["fashion", "products", "food", "brands"]:
        cnt = sum(1 for t in all_trends if t["category_slug"] == cat)
        log(f"    {cat}: {cnt}개")

    # 3. 지역별 SQL 생성
    log("\n[3/3] 지역별 SQL 파일 생성 중...")

    region_config = [
        ("trends_asia.sql", "Asia", "asia"),
        ("trends_europe.sql", "Europe", "europe"),
        ("trends_americas.sql", "Americas", "americas"),
        ("trends_middle_east.sql", "Middle East", "middle_east"),
        ("trends_africa.sql", "Africa", "africa"),
        ("trends_oceania.sql", "Oceania", "oceania"),
    ]

    total_inserts = 0
    files_written = []

    for i, (filename, label, region) in enumerate(region_config, 1):
        region_codes = set(c[0] for c in ALL_COUNTRIES if c[4] == region)
        sql_content, count = generate_region_sql(all_trends, label, region_codes, i, len(region_config))

        filepath = OUTPUT_DIR / filename
        with open(filepath, "w", encoding="utf-8") as f:
            f.write(sql_content)

        file_size = filepath.stat().st_size
        total_inserts += count
        files_written.append((filename, file_size, count))
        log(f"  {filename}: {file_size / 1024:.1f}KB ({count} INSERT, {len(region_codes)}개국)")

    # 최종 보고
    log("\n" + "=" * 60)
    log("완료!")
    log(f"  총 국가: {total_countries}개")
    log(f"  총 상품: {len(all_trends)}개")
    log(f"  바이럴 직접 데이터 (TOP15): {len(explicit_data)}개 ({len(explicit_countries)}개국)")
    log(f"  템플릿 보충: {len(all_trends) - len(explicit_data)}개")
    log(f"  SQL 파일: {len(files_written)}개")
    for fname, fsize, fcnt in files_written:
        log(f"    {fname}: {fsize / 1024:.1f}KB ({fcnt} INSERT)")

    # 바이럴 근거 포함 비율 계산
    viral_keywords = ['틱톡', 'TikTok', '인스타', 'Instagram', 'Douyin', '바이럴', 'viral', '#']
    viral_count = sum(1 for t in all_trends if any(kw in t['description'] for kw in viral_keywords))
    viral_pct = viral_count / len(all_trends) * 100
    log(f"  바이럴 근거 포함 비율: {viral_pct:.1f}% ({viral_count}/{len(all_trends)})")
    log("=" * 60)


if __name__ == "__main__":
    main()
