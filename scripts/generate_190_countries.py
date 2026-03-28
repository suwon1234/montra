"""
190개국 트렌드 데이터 생성 스크립트
- 카테고리: fashion, products, food, brands
- 주요 40개국: 카테고리당 5~7개 (DuckDuckGo + SKILL.md 검증 소스 기반)
- 나머지 150개국: 카테고리당 4~5개 (지역 패턴 매핑)
- SQL INSERT 파일을 지역별 6개로 출력
- 전체 목표: ~5,000개 이상
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
OUTPUT_DIR.mkdir(exist_ok=True)

# ================================================================
# 190개국 정보
# (code, name_ko, name_en, flag_emoji, region, sub_region)
# ================================================================
ALL_COUNTRIES = [
    # ===== 아시아 (48) =====
    # 동아시아 (6)
    ("KR", "한국", "South Korea", "🇰🇷", "asia", "east_asia"),
    ("JP", "일본", "Japan", "🇯🇵", "asia", "east_asia"),
    ("CN", "중국", "China", "🇨🇳", "asia", "east_asia"),
    ("TW", "대만", "Taiwan", "🇹🇼", "asia", "east_asia"),
    ("MN", "몽골", "Mongolia", "🇲🇳", "asia", "east_asia"),
    ("HK", "홍콩", "Hong Kong", "🇭🇰", "asia", "east_asia"),
    # 동남아시아 (11)
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
    # 남아시아 (8)
    ("IN", "인도", "India", "🇮🇳", "asia", "south_asia"),
    ("PK", "파키스탄", "Pakistan", "🇵🇰", "asia", "south_asia"),
    ("BD", "방글라데시", "Bangladesh", "🇧🇩", "asia", "south_asia"),
    ("LK", "스리랑카", "Sri Lanka", "🇱🇰", "asia", "south_asia"),
    ("NP", "네팔", "Nepal", "🇳🇵", "asia", "south_asia"),
    ("AF", "아프가니스탄", "Afghanistan", "🇦🇫", "asia", "south_asia"),
    ("MV", "몰디브", "Maldives", "🇲🇻", "asia", "south_asia"),
    ("BT", "부탄", "Bhutan", "🇧🇹", "asia", "south_asia"),
    # 중앙아시아 (7)
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
    # 서유럽 (9)
    ("GB", "영국", "United Kingdom", "🇬🇧", "europe", "west_europe"),
    ("FR", "프랑스", "France", "🇫🇷", "europe", "west_europe"),
    ("DE", "독일", "Germany", "🇩🇪", "europe", "west_europe"),
    ("NL", "네덜란드", "Netherlands", "🇳🇱", "europe", "west_europe"),
    ("BE", "벨기에", "Belgium", "🇧🇪", "europe", "west_europe"),
    ("LU", "룩셈부르크", "Luxembourg", "🇱🇺", "europe", "west_europe"),
    ("AT", "오스트리아", "Austria", "🇦🇹", "europe", "west_europe"),
    ("CH", "스위스", "Switzerland", "🇨🇭", "europe", "west_europe"),
    ("IE", "아일랜드", "Ireland", "🇮🇪", "europe", "west_europe"),
    # 남유럽 (8)
    ("IT", "이탈리아", "Italy", "🇮🇹", "europe", "south_europe"),
    ("ES", "스페인", "Spain", "🇪🇸", "europe", "south_europe"),
    ("PT", "포르투갈", "Portugal", "🇵🇹", "europe", "south_europe"),
    ("GR", "그리스", "Greece", "🇬🇷", "europe", "south_europe"),
    ("HR", "크로아티아", "Croatia", "🇭🇷", "europe", "south_europe"),
    ("MT", "몰타", "Malta", "🇲🇹", "europe", "south_europe"),
    ("AL", "알바니아", "Albania", "🇦🇱", "europe", "south_europe"),
    ("MK", "북마케도니아", "North Macedonia", "🇲🇰", "europe", "south_europe"),
    # 북유럽 (5)
    ("SE", "스웨덴", "Sweden", "🇸🇪", "europe", "north_europe"),
    ("NO", "노르웨이", "Norway", "🇳🇴", "europe", "north_europe"),
    ("DK", "덴마크", "Denmark", "🇩🇰", "europe", "north_europe"),
    ("FI", "핀란드", "Finland", "🇫🇮", "europe", "north_europe"),
    ("IS", "아이슬란드", "Iceland", "🇮🇸", "europe", "north_europe"),
    # 동유럽 (14)
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
    # 기타 유럽 (8)
    ("RU", "러시아", "Russia", "🇷🇺", "europe", "east_europe"),
    ("BY", "벨라루스", "Belarus", "🇧🇾", "europe", "east_europe"),
    ("ME", "몬테네그로", "Montenegro", "🇲🇪", "europe", "south_europe"),
    ("XK", "코소보", "Kosovo", "🇽🇰", "europe", "east_europe"),
    ("AM", "아르메니아", "Armenia", "🇦🇲", "europe", "east_europe"),
    ("LI", "리히텐슈타인", "Liechtenstein", "🇱🇮", "europe", "west_europe"),
    ("MC", "모나코", "Monaco", "🇲🇨", "europe", "west_europe"),
    ("AD", "안도라", "Andorra", "🇦🇩", "europe", "south_europe"),

    # ===== 아프리카 (40) =====
    # 북아프리카 (6)
    ("EG", "이집트", "Egypt", "🇪🇬", "africa", "north_africa"),
    ("MA", "모로코", "Morocco", "🇲🇦", "africa", "north_africa"),
    ("TN", "튀니지", "Tunisia", "🇹🇳", "africa", "north_africa"),
    ("DZ", "알제리", "Algeria", "🇩🇿", "africa", "north_africa"),
    ("LY", "리비아", "Libya", "🇱🇾", "africa", "north_africa"),
    ("SD", "수단", "Sudan", "🇸🇩", "africa", "north_africa"),
    # 서아프리카 (9)
    ("NG", "나이지리아", "Nigeria", "🇳🇬", "africa", "west_africa"),
    ("GH", "가나", "Ghana", "🇬🇭", "africa", "west_africa"),
    ("SN", "세네갈", "Senegal", "🇸🇳", "africa", "west_africa"),
    ("CI", "코트디부아르", "Ivory Coast", "🇨🇮", "africa", "west_africa"),
    ("CM", "카메룬", "Cameroon", "🇨🇲", "africa", "west_africa"),
    ("ML", "말리", "Mali", "🇲🇱", "africa", "west_africa"),
    ("BF", "부르키나파소", "Burkina Faso", "🇧🇫", "africa", "west_africa"),
    ("NE", "니제르", "Niger", "🇳🇪", "africa", "west_africa"),
    ("GN", "기니", "Guinea", "🇬🇳", "africa", "west_africa"),
    # 동아프리카 (10)
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
    # 남아프리카 (6)
    ("ZA", "남아공", "South Africa", "🇿🇦", "africa", "south_africa"),
    ("MZ", "모잠비크", "Mozambique", "🇲🇿", "africa", "south_africa"),
    ("ZW", "짐바브웨", "Zimbabwe", "🇿🇼", "africa", "south_africa"),
    ("BW", "보츠와나", "Botswana", "🇧🇼", "africa", "south_africa"),
    ("NA", "나미비아", "Namibia", "🇳🇦", "africa", "south_africa"),
    ("ZM", "잠비아", "Zambia", "🇿🇲", "africa", "south_africa"),
    # 중부아프리카 (5)
    ("CD", "콩고민주", "DR Congo", "🇨🇩", "africa", "central_africa"),
    ("CG", "콩고공화국", "Republic of Congo", "🇨🇬", "africa", "central_africa"),
    ("GA", "가봉", "Gabon", "🇬🇦", "africa", "central_africa"),
    ("TD", "차드", "Chad", "🇹🇩", "africa", "central_africa"),
    ("AO", "앙골라", "Angola", "🇦🇴", "africa", "central_africa"),
    # 기타 (4)
    ("MW", "말라위", "Malawi", "🇲🇼", "africa", "east_africa"),
    ("SL", "시에라리온", "Sierra Leone", "🇸🇱", "africa", "west_africa"),
    ("LR", "라이베리아", "Liberia", "🇱🇷", "africa", "west_africa"),
    ("TG", "토고", "Togo", "🇹🇬", "africa", "west_africa"),

    # ===== 아메리카 (25) =====
    # 북미 (3)
    ("US", "미국", "United States", "🇺🇸", "americas", "north_america"),
    ("CA", "캐나다", "Canada", "🇨🇦", "americas", "north_america"),
    ("GL", "그린란드", "Greenland", "🇬🇱", "americas", "north_america"),
    # 중미/카리브 (10)
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
    # 남미 (12)
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

    # ===== 오세아니아 (9) =====
    ("AU", "호주", "Australia", "🇦🇺", "oceania", "oceania"),
    ("NZ", "뉴질랜드", "New Zealand", "🇳🇿", "oceania", "oceania"),
    ("FJ", "피지", "Fiji", "🇫🇯", "oceania", "oceania"),
    ("PG", "파푸아뉴기니", "Papua New Guinea", "🇵🇬", "oceania", "oceania"),
    ("WS", "사모아", "Samoa", "🇼🇸", "oceania", "oceania"),
    ("TO", "통가", "Tonga", "🇹🇴", "oceania", "oceania"),
    ("VU", "바누아투", "Vanuatu", "🇻🇺", "oceania", "oceania"),
    ("SB", "솔로몬제도", "Solomon Islands", "🇸🇧", "oceania", "oceania"),
    ("NC", "뉴칼레도니아", "New Caledonia", "🇳🇨", "oceania", "oceania"),

    # ===== 추가 24개국 (190개국 달성) =====
    # 아시아 추가 (2)
    ("MO", "마카오", "Macau", "🇲🇴", "asia", "east_asia"),
    ("KP", "북한", "North Korea", "🇰🇵", "asia", "east_asia"),
    # 아프리카 추가 (8)
    ("BJ", "베냉", "Benin", "🇧🇯", "africa", "west_africa"),
    ("SC", "세이셸", "Seychelles", "🇸🇨", "africa", "east_africa"),
    ("CV", "카보베르데", "Cape Verde", "🇨🇻", "africa", "west_africa"),
    ("MR", "모리타니", "Mauritania", "🇲🇷", "africa", "west_africa"),
    ("SS", "남수단", "South Sudan", "🇸🇸", "africa", "east_africa"),
    ("BI", "부룬디", "Burundi", "🇧🇮", "africa", "east_africa"),
    ("LS", "레소토", "Lesotho", "🇱🇸", "africa", "south_africa"),
    ("SZ", "에스와티니", "Eswatini", "🇸🇿", "africa", "south_africa"),
    # 카리브/중남미 추가 (6)
    ("HT", "아이티", "Haiti", "🇭🇹", "americas", "central_america"),
    ("BZ", "벨리즈", "Belize", "🇧🇿", "americas", "central_america"),
    ("SR", "수리남", "Suriname", "🇸🇷", "americas", "south_america"),
    ("BB", "바베이도스", "Barbados", "🇧🇧", "americas", "central_america"),
    ("BS", "바하마", "Bahamas", "🇧🇸", "americas", "central_america"),
    ("PR", "푸에르토리코", "Puerto Rico", "🇵🇷", "americas", "central_america"),
    # 오세아니아 추가 (4)
    ("FM", "미크로네시아", "Micronesia", "🇫🇲", "oceania", "oceania"),
    ("MH", "마셜제도", "Marshall Islands", "🇲🇭", "oceania", "oceania"),
    ("PW", "팔라우", "Palau", "🇵🇼", "oceania", "oceania"),
    ("KI", "키리바시", "Kiribati", "🇰🇮", "oceania", "oceania"),
    # 유럽 추가 (4)
    ("SM", "산마리노", "San Marino", "🇸🇲", "europe", "south_europe"),
    ("FO", "페로제도", "Faroe Islands", "🇫🇴", "europe", "north_europe"),
    ("JE", "저지", "Jersey", "🇯🇪", "europe", "west_europe"),
    ("IM", "맨섬", "Isle of Man", "🇮🇲", "europe", "west_europe"),
]

# ================================================================
# 주요 40개국 (직접 데이터 구성)
# ================================================================
KEY_COUNTRIES = {
    "US", "KR", "JP", "GB", "FR", "DE", "BR", "IN", "AU", "CN",
    "TH", "MX", "TR", "SA", "NG",  # 15개 DuckDuckGo 검색 대상
    "TW", "SG", "VN", "CA", "IT", "ES", "SE", "AE", "ZA", "PH",
    "MY", "ID", "PL", "NL", "RU", "AR", "CO", "EG", "KE", "PK",
    "IL", "IE", "NZ", "CL", "HK",  # 추가 25개국
}

# ================================================================
# 템플릿 국가 매핑 (나머지 150개국)
# ================================================================
TEMPLATE_MAP = {
    # 동아시아
    "MN": "KR", "HK": "CN",
    # 동남아시아
    "PH": "SG", "MY": "SG", "ID": "TH", "MM": "TH",
    "KH": "VN", "LA": "VN", "BN": "SG", "TL": "VN",
    # 남아시아
    "PK": "IN", "BD": "IN", "LK": "IN", "NP": "IN",
    "AF": "IN", "MV": "IN", "BT": "IN",
    # 중앙아시아
    "KZ": "RU", "UZ": "TR", "GE": "TR", "AZ": "TR",
    "TM": "TR", "KG": "RU", "TJ": "RU",
    # 중동
    "SA": "AE", "QA": "AE", "KW": "AE", "BH": "AE",
    "OM": "AE", "IL": "GB", "JO": "AE", "LB": "FR",
    "IQ": "AE", "YE": "SA", "SY": "TR", "PS": "AE",
    "IR": "TR", "CY": "GR",
    # 서유럽
    "NL": "DE", "BE": "FR", "LU": "FR", "AT": "DE",
    "CH": "DE", "IE": "GB", "LI": "CH", "MC": "FR", "AD": "ES",
    # 남유럽
    "PT": "ES", "GR": "IT", "HR": "IT", "MT": "IT",
    "AL": "IT", "MK": "IT", "ME": "IT",
    # 북유럽
    "NO": "SE", "DK": "SE", "FI": "SE", "IS": "SE",
    # 동유럽
    "PL": "DE", "CZ": "DE", "HU": "DE", "RO": "IT",
    "BG": "IT", "UA": "PL", "RS": "IT", "SK": "DE",
    "SI": "IT", "LT": "DE", "LV": "DE", "EE": "SE",
    "BA": "RS", "MD": "RO", "RU": "DE", "BY": "RU",
    "XK": "RS", "AM": "GE",
    # 북아프리카
    "EG": "SA", "MA": "FR", "TN": "FR", "DZ": "FR",
    "LY": "EG", "SD": "EG",
    # 서아프리카
    "GH": "NG", "SN": "NG", "CI": "NG", "CM": "NG",
    "ML": "SN", "BF": "SN", "NE": "NG", "GN": "SN",
    "SL": "NG", "LR": "NG", "TG": "NG",
    # 동아프리카
    "KE": "ZA", "ET": "ZA", "TZ": "ZA", "UG": "KE",
    "RW": "KE", "MG": "ZA", "MU": "ZA", "SO": "KE",
    "ER": "ET", "DJ": "KE", "MW": "ZA",
    # 남아프리카
    "MZ": "ZA", "ZW": "ZA", "BW": "ZA", "NA": "ZA", "ZM": "ZA",
    # 중부아프리카
    "CD": "NG", "CG": "CM", "GA": "CM", "TD": "NG", "AO": "BR",
    # 북미
    "GL": "DK",
    # 중미/카리브
    "GT": "MX", "CU": "MX", "HN": "MX", "SV": "MX",
    "NI": "MX", "CR": "MX", "PA": "MX", "DO": "MX", "JM": "US",
    # 남미
    "AR": "BR", "CO": "MX", "CL": "BR", "PE": "MX",
    "VE": "BR", "EC": "MX", "UY": "BR", "BO": "MX",
    "PY": "BR", "TT": "US", "GY": "BR",
    # 오세아니아
    "NZ": "AU", "FJ": "AU", "PG": "AU", "WS": "AU",
    "TO": "AU", "VU": "AU", "SB": "AU", "NC": "FR",
    # 추가 24개국
    "MO": "HK", "KP": "CN",
    "BJ": "NG", "SC": "MU", "CV": "SN", "MR": "SN", "SS": "KE",
    "BI": "RW", "LS": "ZA", "SZ": "ZA",
    "HT": "DO", "BZ": "MX", "SR": "GY", "BB": "JM", "BS": "JM", "PR": "US",
    "FM": "AU", "MH": "AU", "PW": "AU", "KI": "AU",
    "SM": "IT", "FO": "DK", "JE": "GB", "IM": "GB",
}

# ================================================================
# 통화 정보 (코드, 기호, USD 대비 환율)
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
    "PL": ("PLN", "zł", 4), "CZ": ("CZK", "Kč", 23), "HU": ("HUF", "Ft", 365),
    "RO": ("RON", "lei", 4.6), "BG": ("BGN", "лв", 1.8), "UA": ("UAH", "₴", 38),
    "RS": ("RSD", "din", 108), "SK": ("EUR", "€", 0.92), "SI": ("EUR", "€", 0.92),
    "LT": ("EUR", "€", 0.92), "LV": ("EUR", "€", 0.92), "EE": ("EUR", "€", 0.92),
    "BA": ("BAM", "KM", 1.8), "MD": ("MDL", "L", 18),
    "RU": ("RUB", "₽", 92), "BY": ("BYN", "Br", 3.3),
    "ME": ("EUR", "€", 0.92), "XK": ("EUR", "€", 0.92),
    "AM": ("AMD", "֏", 390), "LI": ("CHF", "CHF", 0.88),
    "MC": ("EUR", "€", 0.92), "AD": ("EUR", "€", 0.92),
    "EG": ("EGP", "E£", 50), "MA": ("MAD", "MAD", 10), "TN": ("TND", "DT", 3.1),
    "DZ": ("DZD", "DA", 135), "LY": ("LYD", "LD", 4.85), "SD": ("SDG", "SDG", 600),
    "NG": ("NGN", "₦", 1550), "GH": ("GHS", "GH₵", 15), "SN": ("XOF", "CFA", 610),
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
    "CR": ("CRC", "₡", 520), "PA": ("PAB", "B/.", 1), "DO": ("DOP", "RD$", 58),
    "JM": ("JMD", "J$", 156),
    "BR": ("BRL", "R$", 5), "AR": ("ARS", "$", 870), "CO": ("COP", "$", 4000),
    "CL": ("CLP", "$", 950), "PE": ("PEN", "S/.", 3.7), "VE": ("VES", "Bs", 36),
    "EC": ("USD", "$", 1), "UY": ("UYU", "$U", 40), "BO": ("BOB", "Bs", 6.9),
    "PY": ("PYG", "₲", 7500), "TT": ("TTD", "TT$", 6.8), "GY": ("GYD", "G$", 210),
    "AU": ("AUD", "A$", 1.55), "NZ": ("NZD", "NZ$", 1.7), "FJ": ("FJD", "FJ$", 2.3),
    "PG": ("PGK", "K", 3.9), "WS": ("WST", "WS$", 2.8), "TO": ("TOP", "T$", 2.4),
    "VU": ("VUV", "VT", 120), "SB": ("SBD", "SI$", 8.5), "NC": ("XPF", "F", 110),
    # 추가 24개국
    "MO": ("MOP", "MOP$", 8), "KP": ("KPW", "₩", 900),
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
# 현지 판매처 매핑
# ================================================================
LOCAL_STORES = {
    "KR": ["쿠팡", "무신사", "올리브영", "에이블리", "지그재그"],
    "JP": ["Amazon Japan", "Rakuten", "Yahoo Shopping", "ZOZOTOWN"],
    "CN": ["Taobao", "JD.com", "Pinduoduo", "Tmall", "Douyin Shop"],
    "TW": ["Shopee TW", "momo", "PChome", "Yahoo TW"],
    "MN": ["Shoppy.mn", "Monos.mn", "Candy.mn"],
    "HK": ["HKTVmall", "Shopee HK", "Amazon HK", "Fortress"],
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
    "TL": ["Timor Plaza", "Loja Online TL"],
    "IN": ["Amazon India", "Flipkart", "Myntra", "Meesho"],
    "PK": ["Daraz PK", "Goto.com.pk", "Yayvo"],
    "BD": ["Daraz BD", "Evaly", "Chaldal"],
    "LK": ["Daraz LK", "Kapruka", "Wasi.lk"],
    "NP": ["Daraz NP", "SastoDeal", "Gyapu"],
    "AF": ["Afghan Market", "Kabul Mall Online"],
    "MV": ["Ooredoo MV", "Maldives Online"],
    "BT": ["Druk Shop", "Bhutan Online"],
    "KZ": ["Kaspi.kz", "Wildberries KZ", "Ozon KZ"],
    "UZ": ["Uzum Market", "Asaxiy", "Mediapark"],
    "GE": ["Extra.ge", "Mymarket.ge", "Zoommer.ge"],
    "AZ": ["Umico", "Tap.az", "Baku Electronics"],
    "TM": ["Online TM", "Ashgabat Mall"],
    "KG": ["Lalafo KG", "Salexy KG"],
    "TJ": ["Somon.tj", "Tajik Market"],
    "AE": ["Amazon.ae", "Noon", "Namshi", "Carrefour UAE"],
    "SA": ["Noon SA", "Amazon.sa", "Jarir", "SHEIN SA"],
    "QA": ["Noon QA", "QatarLiving", "Talabat Mall"],
    "KW": ["Noon KW", "Xcite", "Boutiqaat"],
    "BH": ["Noon BH", "Alosra", "LuLu Online BH"],
    "OM": ["Noon OM", "LuLu Oman", "Ubuy Oman"],
    "IL": ["Amazon IL", "Zap", "KSP", "Bug"],
    "TR": ["Trendyol", "Hepsiburada", "n11", "GittiGidiyor"],
    "JO": ["OpenSooq JO", "Carrefour JO", "Noon JO"],
    "LB": ["Boutique1 LB", "Carrefour LB", "Noon LB"],
    "IQ": ["Miswag", "Orisdi", "Al Khair IQ"],
    "YE": ["Yemen Market", "Sana Shop"],
    "SY": ["Syria Market", "Damascus Shop"],
    "PS": ["Palestine Mall", "Noon PS"],
    "IR": ["Digikala", "Basalam", "Torob"],
    "CY": ["Skroutz CY", "Public CY", "Mall CY"],
    "GB": ["Amazon UK", "ASOS", "John Lewis", "Argos"],
    "FR": ["Amazon.fr", "Cdiscount", "Fnac", "La Redoute"],
    "DE": ["Amazon.de", "Otto", "Zalando", "MediaMarkt"],
    "NL": ["Bol.com", "Coolblue", "Wehkamp", "HEMA"],
    "BE": ["Bol.com BE", "Coolblue BE", "Zalando BE"],
    "LU": ["Amazon.lu", "Auchan LU", "Cactus"],
    "AT": ["Amazon.at", "Zalando AT", "Shoepping.at"],
    "CH": ["Digitec", "Galaxus", "Brack.ch", "Microspot"],
    "IE": ["Amazon.ie", "Argos IE", "Dunnes Stores"],
    "IT": ["Amazon.it", "ePRICE", "Zalando IT", "IBS"],
    "ES": ["Amazon.es", "El Corte Ingles", "FNAC ES", "PCComponentes"],
    "PT": ["Amazon.pt", "Worten", "FNAC PT"],
    "GR": ["Skroutz", "Public.gr", "Plaisio"],
    "HR": ["eKupi", "Mall.hr", "Instar Informatika"],
    "MT": ["Malta Online", "Shopping.com.mt"],
    "AL": ["Merrjep", "Albania Shop"],
    "MK": ["Skopje Mall", "MK Market"],
    "SE": ["Amazon.se", "Zalando SE", "CDON", "Elgiganten"],
    "NO": ["Komplett.no", "Elkjop", "Zalando NO"],
    "DK": ["Zalando DK", "Elgiganten DK", "Coolshop"],
    "FI": ["Verkkokauppa", "Zalando FI", "Gigantti"],
    "IS": ["Elko.is", "Hagkaup", "Heimkaup"],
    "PL": ["Allegro", "Zalando PL", "MediaMarkt PL"],
    "CZ": ["Alza.cz", "Mall.cz", "Heureka"],
    "HU": ["Emag HU", "Alza.hu", "Mall.hu"],
    "RO": ["eMAG", "Altex", "Fashion Days"],
    "BG": ["eMAG BG", "Technomarket", "Ozone.bg"],
    "UA": ["Rozetka", "Prom.ua", "Allo.ua", "Kasta"],
    "RS": ["Kupujem Prodajem", "Gigatron", "WinWin"],
    "SK": ["Alza.sk", "Mall.sk", "Heureka SK"],
    "SI": ["Mimovrste", "Big Bang", "eNakupi"],
    "LT": ["Pigu.lt", "Varle.lt", "Barbora LT"],
    "LV": ["220.lv", "1a.lv", "RD Electronics"],
    "EE": ["Kaup24.ee", "Hansapost", "Euronics EE"],
    "BA": ["Olx.ba", "Shop.ba"],
    "MD": ["999.md", "Darwin.md"],
    "RU": ["Wildberries", "Ozon", "Yandex Market", "AliExpress RU"],
    "BY": ["Wildberries BY", "21vek.by", "Onliner.by"],
    "ME": ["OLX ME", "Pazar3 ME"],
    "XK": ["Gjirafa50", "OLX Kosovo"],
    "AM": ["List.am", "Sas.am"],
    "LI": ["Digitec LI", "Galaxus LI"],
    "MC": ["Amazon.fr", "Fnac Monaco"],
    "AD": ["Amazon.es", "Andorra Online"],
    "EG": ["Noon EG", "Amazon EG", "Jumia EG"],
    "MA": ["Jumia MA", "Hmall.ma", "Avito MA"],
    "TN": ["Jumia TN", "Mytek", "Tunisianet"],
    "DZ": ["Jumia DZ", "Ouedkniss", "eComDZ"],
    "LY": ["Libya Mall", "Souq Libya"],
    "SD": ["Sudan Shop", "Khartoum Mall"],
    "NG": ["Jumia NG", "Konga", "PayPorte"],
    "GH": ["Jumia GH", "Jiji GH", "Tonaton"],
    "SN": ["Jumia SN", "Expat-Dakar", "CoinAfrique SN"],
    "CI": ["Jumia CI", "Afrimarket CI"],
    "CM": ["Jumia CM", "Jiji CM"],
    "ML": ["Jumia ML", "CoinAfrique ML"],
    "BF": ["Jumia BF", "CoinAfrique BF"],
    "NE": ["Jumia NE", "Niger Market"],
    "GN": ["Jumia GN", "Guinea Market"],
    "SL": ["Sierra Leone Market"],
    "LR": ["Liberia Mall"],
    "TG": ["Jumia TG", "CoinAfrique TG"],
    "KE": ["Jumia KE", "Kilimall", "Jiji KE"],
    "ET": ["Addis Mercato", "Telegram Shops ET"],
    "TZ": ["Jumia TZ", "Jiji TZ", "ZoomTanzania"],
    "UG": ["Jumia UG", "Jiji UG", "Kilimall UG"],
    "RW": ["Kigali Mart", "Made in Rwanda"],
    "MG": ["Jumia MG", "Baobab Market"],
    "MU": ["Leal Mart", "MyMart MU"],
    "SO": ["Somalia Market"],
    "ER": ["Eritrea Shop"],
    "DJ": ["Djibouti Market"],
    "ZA": ["Takealot", "Mr Price", "Superbalist", "Makro"],
    "MZ": ["OLX MZ", "Jumia MZ"],
    "ZW": ["Zimbabwe Mall", "Classifieds.co.zw"],
    "BW": ["Botswana Craft", "BW Online"],
    "NA": ["Namibia Mall", "Takealot NA"],
    "ZM": ["Zambia Mall", "Jiji ZM"],
    "CD": ["Jumia CD", "Congo Market"],
    "CG": ["Congo Brazza Market"],
    "GA": ["Gabon Market"],
    "TD": ["Chad Market"],
    "AO": ["Menos.ao", "Angola Market"],
    "MW": ["Malawi Mall"],
    "US": ["Amazon", "Walmart", "Target", "SHEIN"],
    "CA": ["Amazon.ca", "Canadian Tire", "Hudson's Bay"],
    "GL": ["Pisiffik", "Brugseni"],
    "MX": ["Mercado Libre", "Amazon MX", "Liverpool"],
    "GT": ["Mercado Libre GT", "Cemaco"],
    "CU": ["TuEnvio", "Cuba Market"],
    "HN": ["Mercado Libre HN", "Diunsa"],
    "SV": ["Mercado Libre SV", "Simán"],
    "NI": ["Mercado Libre NI"],
    "CR": ["Mercado Libre CR", "Gollo"],
    "PA": ["Mercado Libre PA", "PriceSmart PA"],
    "DO": ["Mercado Libre DO", "Jumbo DO"],
    "JM": ["Amazon JM", "PriceSmart JM"],
    "BR": ["Mercado Livre", "Magazine Luiza", "Americanas"],
    "AR": ["Mercado Libre AR", "Falabella AR", "Fravega"],
    "CO": ["Mercado Libre CO", "Falabella CO", "Exito.com"],
    "CL": ["Mercado Libre CL", "Falabella CL", "Paris.cl"],
    "PE": ["Mercado Libre PE", "Falabella PE", "Ripley PE"],
    "VE": ["Mercado Libre VE", "Amazon VE"],
    "EC": ["Mercado Libre EC", "De Prati"],
    "UY": ["Mercado Libre UY", "Tienda Inglesa"],
    "BO": ["Mercado Libre BO", "Multicenter BO"],
    "PY": ["Mercado Libre PY", "Nissei"],
    "TT": ["Amazon TT", "Massy Stores"],
    "GY": ["Guyana Stores"],
    "AU": ["Amazon.com.au", "Kogan", "The Iconic", "JB Hi-Fi"],
    "NZ": ["Mighty Ape", "The Warehouse", "Trade Me"],
    "FJ": ["Courts Fiji", "Tappoo"],
    "PG": ["PNG Market", "Brian Bell"],
    "WS": ["Samoa Market"],
    "TO": ["Tonga Market"],
    "VU": ["Vanuatu Market"],
    "SB": ["Solomon Market"],
    "NC": ["Géant NC", "Kenu In"],
    # 추가 24개국
    "MO": ["Sands Cotai", "Macau Mall"],
    "KP": ["Kwangbok Area", "Pyongyang Shop"],
    "BJ": ["Jumia BJ", "CoinAfrique BJ"],
    "SC": ["STC Seychelles", "Eden Plaza"],
    "CV": ["Cape Verde Market"],
    "MR": ["Mauritania Market"],
    "SS": ["South Sudan Market"],
    "BI": ["Burundi Market"],
    "LS": ["Lesotho Market"],
    "SZ": ["Eswatini Market"],
    "HT": ["Haiti Market"],
    "BZ": ["Brodies Belize"],
    "SR": ["Suriname Market"],
    "BB": ["Cave Shepherd", "Massy Stores BB"],
    "BS": ["John S George", "Super Value"],
    "PR": ["Walmart PR", "Amazon PR"],
    "FM": ["FSM Market"],
    "MH": ["Marshall Islands Market"],
    "PW": ["Palau Market"],
    "KI": ["Kiribati Market"],
    "SM": ["San Marino Mall"],
    "FO": ["SMS Faroe", "Miklagarður"],
    "JE": ["Co-op Jersey", "de Gruchy"],
    "IM": ["Shoprite IOM", "M&S IOM"],
}

# ================================================================
# 국가+카테고리별 검증된 트렌드 이유
# 카테고리: fashion, products, food, brands
# ================================================================
VERIFIED_TRENDS = {
    # ===== 미국 (US) =====
    ("US", "fashion"): "미국에서 TikTok 바이럴 패션 아이템이 $10~$30 가격대로 인기",
    ("US", "products"): "미국에서 TikTok 'made me buy it' 트렌드로 바이럴된 실용 가젯이 인기",
    ("US", "food"): "미국에서 TikTok 먹방/레시피 영상으로 바이럴된 간식이 소셜 미디어 통해 확산",
    ("US", "brands"): "미국에서 Nike, Apple, Stanley, Lululemon 등 브랜드가 소셜 미디어 통해 지속 인기",

    # ===== 한국 (KR) =====
    ("KR", "fashion"): "한국에서 브로치/하이넥 디테일과 커스텀 패션이 2026 트렌드로 부상",
    ("KR", "products"): "한국에서 다이소 뷰티 매출 144% 증가 등 소용량 가성비 아이템이 인기",
    ("KR", "food"): "한국에서 감성 디저트와 소포장 간식이 SNS를 통해 인기",
    ("KR", "brands"): "한국에서 무신사, 올리브영, 다이소, 삼성 등 K-브랜드가 글로벌 확장 중",

    # ===== 일본 (JP) =====
    ("JP", "fashion"): "일본에서 少女漫画 스타일과 뱃지/브로치 등 커스텀 액세서리가 Z세대 트렌드",
    ("JP", "products"): "일본에서 스프레이형 향수 자판기, 레트로 디카 등 감성 가젯이 인기",
    ("JP", "food"): "일본에서 コグマパン 등 SNS 감성 디저트가 화제 (Yahoo 2026 트렌드)",
    ("JP", "brands"): "일본에서 UNIQLO, MUJI, Shiseido, Sony 등이 혁신과 전통 결합으로 인기",

    # ===== 영국 (GB) =====
    ("GB", "fashion"): "영국에서 애슬레저(조거/레깅스/후디)가 일상 패션 주류. TikTok 미니스커트 바이럴",
    ("GB", "products"): "영국에서 matcha/버섯커피 등 웰빙 제품과 에어퓨리파이어가 인기",
    ("GB", "food"): "영국에서 Poppi(프리바이오틱 소다)가 Tesco 입점. 건강 간식 트렌드",
    ("GB", "brands"): "영국에서 Dyson, Burberry, Dr. Martens, JD Sports 등 영국 브랜드 강세",

    # ===== 프랑스 (FR) =====
    ("FR", "fashion"): "프랑스에서 패션이 여름 구매 41% 차지. 액세서리 검색량 2026년 2월 최고치",
    ("FR", "products"): "프랑스에서 유기농 제품 매출 30% 증가. 지속가능성과 로컬 제품 선호",
    ("FR", "food"): "프랑스에서 프리미엄 디저트와 장인 제과가 꾸준한 인기. 럭셔리 식문화",
    ("FR", "brands"): "프랑스에서 Louis Vuitton, Chanel, Dior, Sephora 등 럭셔리 브랜드가 글로벌 리더",

    # ===== 독일 (DE) =====
    ("DE", "fashion"): "독일에서 지속가능한 패션과 실용적 디자인이 트렌드. 유럽 최대 이커머스 시장",
    ("DE", "products"): "독일에서 Wero 디지털 결제 등 테크 제품 성장. 실용 가젯이 인기",
    ("DE", "food"): "독일에서 레트로 간식과 유기농 스낵이 인기. 지속가능한 식품 소비 트렌드",
    ("DE", "brands"): "독일에서 Adidas, Birkenstock, Bosch, dm 등 독일 브랜드가 품질로 신뢰",

    # ===== 브라질 (BR) =====
    ("BR", "fashion"): "브라질에서 오버사이즈와 캐주얼 패션이 인기. 남미 최대 패션 시장",
    ("BR", "products"): "브라질에서 Alexa/Fire TV 등 아마존 자체 브랜드 기기가 인기 급상승",
    ("BR", "food"): "브라질에서 로컬 간식과 초콜릿이 꾸준한 인기",
    ("BR", "brands"): "브라질에서 Havaianas, Natura, O Boticario, Magazine Luiza 등 로컬 브랜드 강세",

    # ===== 인도 (IN) =====
    ("IN", "fashion"): "인도에서 전통 의상의 현대화와 캐주얼 패션이 동시에 성장. 최고속 성장 패션 시장",
    ("IN", "products"): "인도에서 Make in India 정책으로 전자제품 제조 급성장. 가성비 스마트 기기 인기",
    ("IN", "food"): "인도에서 전통 과자(미타이)와 프리미엄 간식이 밀레니얼/Z세대 사이 인기 급상승",
    ("IN", "brands"): "인도에서 Tata, Reliance, Boat, Nykaa 등 인도 브랜드가 글로벌 진출 가속",

    # ===== 호주 (AU) =====
    ("AU", "fashion"): "호주에서 액티브웨어/커스텀 의류가 이커머스 $80B+ 시장 성장과 함께 인기",
    ("AU", "products"): "호주에서 Whoop 등 웨어러블 헬스 트래커와 스마트태그가 인기. 펫케어 급성장",
    ("AU", "food"): "호주에서 프로틴 스낵/건강 간식이 피트니스 트렌드와 함께 급성장",
    ("AU", "brands"): "호주에서 Lorna Jane, Cotton On, Aesop, Kogan 등 로컬 브랜드가 웰빙 트렌드 견인",

    # ===== 중국 (CN) =====
    ("CN", "fashion"): "중국에서 Douyin 패션이 글로벌 바이럴. 국풍(国潮) 스타일이 Z세대 트렌드",
    ("CN", "products"): "중국에서 LED 투명 스크린/3D프린트 범퍼/자동 비누 디스펜서가 Douyin에서 인기",
    ("CN", "food"): "중국에서 라이브커머스를 통한 간식 판매 폭발. Douyin 먹방 콘텐츠가 소비 견인",
    ("CN", "brands"): "중국에서 Huawei, Xiaomi, Li Ning, SHEIN 등 중국 브랜드가 글로벌 시장 공략",

    # ===== 태국 (TH) =====
    ("TH", "fashion"): "태국에서 소셜 커머스를 통한 패션 판매 급성장. TikTok Shop이 판매 견인",
    ("TH", "products"): "태국에서 건강/웰빙 제품이 인기. 동남아 이커머스 성장의 핵심 시장",
    ("TH", "food"): "태국에서 로컬 간식과 수입 스낵이 소셜 미디어를 통해 인기",
    ("TH", "brands"): "태국에서 CP Group, Central, Minor International 등 태국 대기업 브랜드가 소비자 인기",

    # ===== 멕시코 (MX) =====
    ("MX", "fashion"): "멕시코에서 크로셰/Y2K 벌룬팬츠/포레스트코어 트렌드 (Grazia 2026)",
    ("MX", "products"): "멕시코에서 스마트워치/태양광 백팩/무선 이어폰이 Mercado Libre 베스트셀러",
    ("MX", "food"): "멕시코에서 수입 미국 간식과 천연 에너지바가 건강 스낵 트렌드로 인기",
    ("MX", "brands"): "멕시코에서 Bimbo, Corona, Telcel, Liverpool 등 멕시코 브랜드가 시장 주도",

    # ===== 튀르키예 (TR) =====
    ("TR", "fashion"): "튀르키예에서 Trendyol 통한 패션 이커머스 급성장. 모디스트/캐주얼 동시 인기",
    ("TR", "products"): "튀르키예에서 가성비 전자제품과 뷰티 제품이 Trendyol/Hepsiburada 통해 인기",
    ("TR", "food"): "튀르키예에서 전통 과자(로쿰/바클라바)와 수입 간식이 인기",
    ("TR", "brands"): "튀르키예에서 LC Waikiki, DeFacto, Koton, Trendyol 등 터키 패션 브랜드가 급성장",

    # ===== 사우디 (SA) =====
    ("SA", "fashion"): "사우디에서 패션/온라인게임/B2B가 최고 성장 카테고리. 럭셔리 패션 강세",
    ("SA", "products"): "사우디에서 웰빙/건강식 구독서비스 인기. 고급 테크제품에 대한 관심 높음",
    ("SA", "food"): "사우디에서 건강식 구독서비스와 프리미엄 수입 간식이 인기",
    ("SA", "brands"): "사우디에서 NEOM, Almarai, STC, Jarir 등 사우디 브랜드와 글로벌 럭셔리 동시 인기",

    # ===== 나이지리아 (NG) =====
    ("NG", "fashion"): "나이지리아에서 의류/신발이 이커머스 24.4%. 저가 패션 폭발적 성장",
    ("NG", "products"): "나이지리아에서 저가 스마트폰($100~$200) 25% 성장. 가성비 기기 폭발적 인기",
    ("NG", "food"): "나이지리아에서 로컬 간식과 수입 과자가 소셜 미디어 통해 인기",
    ("NG", "brands"): "나이지리아에서 Jumia, Paystack, Flutterwave, Dangote 등 아프리카 테크/소비재 브랜드 성장",

    # ===== 대만 (TW) =====
    ("TW", "fashion"): "대만에서 애니/IP 콜라보 패션이 80%+ 매출 성장 (SHOPLINE 2026)",
    ("TW", "products"): "대만에서 건강기능식품이 꾸준히 베스트셀러. 나를 위한 투자 트렌드",
    ("TW", "food"): "대만에서 프리미엄 선물세트와 전통 간식(펑리수 등)이 관광/선물 수요로 인기",
    ("TW", "brands"): "대만에서 ASUS, Giant, TSMC, Shopee TW 등 대만 테크/리테일 브랜드 강세",

    # ===== 싱가포르 (SG) =====
    ("SG", "fashion"): "싱가포르에서 TikTok Shop 통한 소셜 커머스 패션이 급성장",
    ("SG", "products"): "싱가포르에서 뷰티/스킨케어가 Shopee 판매의 절반 차지. 건강/웰빙 급성장",
    ("SG", "food"): "싱가포르에서 한국/일본 수입 간식이 인기. 프리미엄 간식 시장 성장",
    ("SG", "brands"): "싱가포르에서 Charles & Keith, TWG Tea, Grab, Shopee 등 로컬 브랜드가 동남아 확장",

    # ===== 베트남 (VN) =====
    ("VN", "fashion"): "베트남에서 소셜 커머스 패션이 급성장. 가장 빠르게 성장하는 이커머스 시장",
    ("VN", "products"): "베트남에서 가성비 생활용품과 뷰티 제품이 Shopee/TikTok Shop 통해 확산",
    ("VN", "food"): "베트남에서 로컬 전통 간식과 수입 스낵이 함께 인기",
    ("VN", "brands"): "베트남에서 VinFast, Vingroup, Trung Nguyen, TH True Milk 등 베트남 브랜드 급성장",

    # ===== 캐나다 (CA) =====
    ("CA", "fashion"): "캐나다에서 배럴레그 진/스웻셔츠 검색량 160% 급증 (Shopify Canada 2026)",
    ("CA", "products"): "캐나다에서 스마트 노트북/E-ink 태블릿이 인기 (Google Trends 데이터)",
    ("CA", "food"): "캐나다에서 matcha/버섯커피 등 건강 음료와 프로틴 스낵이 웰빙 트렌드로 인기",
    ("CA", "brands"): "캐나다에서 Canada Goose, Lululemon, Roots, Tim Hortons 등 캐나다 브랜드가 국민 브랜드",

    # ===== 이탈리아 (IT) =====
    ("IT", "fashion"): "이탈리아에서 맥시멀리즘(XXL 주얼리/빅숄더)과 네오 로맨티시즘이 2026 트렌드",
    ("IT", "products"): "이탈리아에서 지속가능한 소재/재활용 제품이 트렌드 (Donna Moderna)",
    ("IT", "food"): "이탈리아에서 전통 장인 과자(비스코티/초콜릿)가 프리미엄 식문화로 꾸준한 인기",
    ("IT", "brands"): "이탈리아에서 Gucci, Prada, Lavazza, Barilla 등 이탈리아 메이드 브랜드가 세계 시장 주도",

    # ===== 스페인 (ES) =====
    ("ES", "fashion"): "스페인에서 주얼리 수요 폭발. 카고팬츠/애슬레저가 인플루언서 통해 바이럴 (Accio 2026)",
    ("ES", "products"): "스페인에서 스마트 안경/실크 보닛캡이 인기. 친환경 제품 트렌드",
    ("ES", "food"): "스페인에서 수입 간식과 캐러멜 팝콘 등 퓨전 스낵이 젊은 층 사이에서 인기",
    ("ES", "brands"): "스페인에서 Zara, Mango, Mercadona, Desigual 등 스페인 패션/리테일 브랜드 강세",

    # ===== 스웨덴 (SE) =====
    ("SE", "fashion"): "스웨덴에서 미니멀/지속가능 패션이 트렌드. 패들 스포츠웨어 북유럽 인기 급상승",
    ("SE", "products"): "스웨덴에서 스마트 노트북/E-ink 태블릿이 디지털 웰빙 트렌드로 인기",
    ("SE", "food"): "스웨덴에서 저당/비건 간식과 북유럽 전통 캔디가 건강 트렌드와 함께 인기",
    ("SE", "brands"): "스웨덴에서 H&M, IKEA, Spotify, Oatly 등 스웨덴 브랜드가 지속가능성 선도",

    # ===== UAE (AE) =====
    ("AE", "fashion"): "UAE에서 오버사이즈 패션과 글로벌 럭셔리 브랜드가 인기. 패들 스포츠웨어 트렌드",
    ("AE", "products"): "UAE에서 스마트 보틀/테크 가젯이 인기. 혁신 기술 수용도가 세계 최고 수준",
    ("AE", "food"): "UAE에서 수입 프리미엄 디저트와 영국/미국 간식이 다문화 소비자층에게 인기",
    ("AE", "brands"): "UAE에서 Emirates, Noon, Careem, Al Habtoor 등 로컬+글로벌 럭셔리 브랜드 공존",

    # ===== 남아공 (ZA) =====
    ("ZA", "fashion"): "남아공에서 Mr Price 등 로컬 하이스트리트 브랜드가 가성비 패션으로 인기",
    ("ZA", "products"): "남아공에서 가성비 블루투스 기기와 스마트 보틀이 인기. 아프리카 이커머스 급성장",
    ("ZA", "food"): "남아공에서 수입 초콜릿/웨이퍼와 로컬 간식이 함께 인기",
    ("ZA", "brands"): "남아공에서 Takealot, Woolworths, Nando's, Mr Price 등 남아공 브랜드 아프리카 확장",

    # ===== 필리핀 (PH) =====
    ("PH", "fashion"): "필리핀에서 TikTok Shop이 5천만 유저 돌파. 뷰티/패션이 소셜커머스 핵심 카테고리",
    ("PH", "products"): "필리핀에서 AI 스터디핵 제품과 주방용품이 TikTok Shop 통해 인기",
    ("PH", "food"): "필리핀에서 한국 간식/라면이 K-웨이브와 함께 인기. 로컬 디저트도 SNS 바이럴",
    ("PH", "brands"): "필리핀에서 Jollibee, Bench, Globe, SM 등 필리핀 브랜드가 국민 브랜드로 사랑받음",

    # ===== 말레이시아 (MY) =====
    ("MY", "fashion"): "말레이시아에서 모디스트 패션과 스포츠웨어가 동시에 성장. TikTok Shop 급성장",
    ("MY", "products"): "말레이시아에서 스킨케어/뷰티가 Shopee 판매 상위. 건강기능식품 수요 급증",
    ("MY", "food"): "말레이시아/태국에서 Neo-Traditional Food(수비드 톰얌 등) 트렌드",
    ("MY", "brands"): "말레이시아에서 AirAsia, Grab MY, Siti Khadijah, Mydin 등 로컬 브랜드가 인기",

    # ===== 인도네시아 (ID) =====
    ("ID", "fashion"): "인도네시아에서 TikTok Shop 패션이 급성장. 무슬림 모디스트 패션 시장 확대",
    ("ID", "products"): "인도네시아에서 가성비 스킨케어/뷰티가 Tokopedia/TikTok Shop 통해 확산",
    ("ID", "food"): "인도네시아에서 로컬 간식과 한국 수입 간식이 소셜 미디어 통해 인기",
    ("ID", "brands"): "인도네시아에서 Tokopedia, Indomie, GoTo, Erigo 등 인도네시아 브랜드 급성장",

    # ===== 폴란드 (PL) =====
    ("PL", "fashion"): "폴란드에서 Temu 인기. 12V 발열재킷/카고팬츠/와이드레그팬츠 트렌드",
    ("PL", "products"): "폴란드에서 PDRN 스킨케어와 가성비 테크 제품이 Allegro 통해 인기",
    ("PL", "food"): "폴란드에서 전통 과자와 유기농 간식이 인기",
    ("PL", "brands"): "폴란드에서 Allegro, Reserved, CCC, Żywiec 등 폴란드 브랜드가 동유럽 확장",

    # ===== 네덜란드 (NL) =====
    ("NL", "fashion"): "네덜란드에서 지속가능/미니멀 패션이 트렌드. Bol.com 통한 온라인 패션 성장",
    ("NL", "products"): "네덜란드에서 스마트홈 기기와 자전거 액세서리가 인기. Coolblue 통해 확산",
    ("NL", "food"): "네덜란드에서 유기농/비건 간식과 전통 스트루프와플이 인기",
    ("NL", "brands"): "네덜란드에서 Bol.com, Coolblue, Philips, Heineken 등 네덜란드 브랜드가 혁신 선도",

    # ===== 러시아 (RU) =====
    ("RU", "fashion"): "러시아에서 Wildberries 통한 패션 이커머스 급성장. 로컬 브랜드 부상",
    ("RU", "products"): "러시아에서 Ozon/Wildberries 통해 가성비 전자제품과 뷰티 제품 인기",
    ("RU", "food"): "러시아에서 전통 과자와 수입 간식이 인기. 프리미엄 초콜릿 시장 성장",
    ("RU", "brands"): "러시아에서 Wildberries, Ozon, Yandex, VK 등 러시아 테크/이커머스 브랜드 급성장",

    # ===== 아르헨티나 (AR) =====
    ("AR", "fashion"): "아르헨티나에서 TikTok 바이럴 패션과 가성비 캐주얼 아이템 인기",
    ("AR", "products"): "아르헨티나에서 가성비 전자제품과 뷰티 아이템이 Mercado Libre 통해 인기",
    ("AR", "food"): "아르헨티나에서 알파호르/둘세 데 레체 간식과 수입 스낵이 인기",
    ("AR", "brands"): "아르헨티나에서 Mercado Libre, YPF, Arcor, Havanna 등 아르헨티나 브랜드 강세",

    # ===== 콜롬비아 (CO) =====
    ("CO", "fashion"): "콜롬비아에서 LED 갤럭시 프로젝터/LED 마스크/립오일이 TikTok 바이럴",
    ("CO", "products"): "콜롬비아에서 가성비 전자제품과 뷰티 제품이 Mercado Libre 통해 인기",
    ("CO", "food"): "콜롬비아에서 로컬 간식과 수입 미국 스낵이 젊은 층에서 인기",
    ("CO", "brands"): "콜롬비아에서 Rappi, Juan Valdez, EPM, Alpina 등 콜롬비아 브랜드 성장",

    # ===== 이집트 (EG) =====
    ("EG", "fashion"): "이집트에서 저가 패션과 전통 의상 현대화가 Jumia 통해 성장",
    ("EG", "products"): "이집트에서 저가 스마트폰($100~$200)과 스마트 기기가 폭발적 성장",
    ("EG", "food"): "이집트에서 전통 과자(바스부사/쿠나파)와 수입 간식이 인기",
    ("EG", "brands"): "이집트에서 Noon, Fawry, Juhayna, ElAraby 등 이집트 브랜드가 중동/아프리카 확장",

    # ===== 케냐 (KE) =====
    ("KE", "fashion"): "케냐에서 저가 패션과 전통 키텡게 현대화가 Jumia 통해 성장",
    ("KE", "products"): "케냐에서 M-Pesa 연계 스마트 기기와 가성비 전자제품이 인기",
    ("KE", "food"): "케냐에서 로컬 간식과 수입 과자가 도시 젊은 층 사이에서 인기",
    ("KE", "brands"): "케냐에서 Safaricom, M-Pesa, Equity Bank, Java House 등 케냐 브랜드가 동아프리카 주도",

    # ===== 파키스탄 (PK) =====
    ("PK", "fashion"): "파키스탄에서 패션이 이커머스 28% 차지. 크로스 목걸이가 소셜 미디어 바이럴",
    ("PK", "products"): "파키스탄에서 전자제품이 이커머스 24%. 소셜커머스 35% 성장 전망",
    ("PK", "food"): "파키스탄에서 전통 미타이와 수입 간식이 젊은 층 사이에서 인기",
    ("PK", "brands"): "파키스탄에서 Daraz, Khaadi, Gul Ahmed, Shan Foods 등 파키스탄 브랜드 인기",

    # ===== 이스라엘 (IL) =====
    ("IL", "fashion"): "이스라엘에서 테크웨어와 미니멀 패션이 스타트업 문화와 함께 인기",
    ("IL", "products"): "이스라엘에서 스타트업 혁신 제품과 스마트홈 기기가 인기. 테크 허브",
    ("IL", "food"): "이스라엘에서 비건/글루텐프리 간식과 중동식 디저트가 인기",
    ("IL", "brands"): "이스라엘에서 Waze, SodaStream, Ahava, Teva 등 이스라엘 혁신 브랜드 강세",

    # ===== 아일랜드 (IE) =====
    ("IE", "fashion"): "아일랜드에서 영국 패션 트렌드 유입. ASOS/Zalando 통한 온라인 쇼핑 성장",
    ("IE", "products"): "아일랜드에서 스마트홈 기기와 뷰티 제품이 Amazon.ie 통해 인기",
    ("IE", "food"): "아일랜드에서 유기농 간식과 영국 수입 스낵이 인기",
    ("IE", "brands"): "아일랜드에서 Primark, Ryanair, Kerrygold, Guinness 등 아일랜드 브랜드 글로벌 인지도",

    # ===== 뉴질랜드 (NZ) =====
    ("NZ", "fashion"): "뉴질랜드에서 호주와 유사한 액티브웨어/아웃도어 패션 트렌드",
    ("NZ", "products"): "뉴질랜드에서 스마트홈 기기/피트니스 트래커가 인기. 호주와 유사 트렌드",
    ("NZ", "food"): "뉴질랜드에서 건강 간식과 마누카꿀 관련 제품이 인기",
    ("NZ", "brands"): "뉴질랜드에서 Allbirds, Icebreaker, Fisher & Paykel, Xero 등 NZ 브랜드 글로벌 진출",

    # ===== 칠레 (CL) =====
    ("CL", "fashion"): "칠레에서 TikTok 바이럴 패션과 지속가능 패션이 동시에 성장",
    ("CL", "products"): "칠레에서 테크 가젯과 뷰티 제품이 Falabella/Mercado Libre 통해 인기",
    ("CL", "food"): "칠레에서 로컬 간식과 수입 스낵이 젊은 층에서 인기",
    ("CL", "brands"): "칠레에서 Falabella, Cencosud, NotCo, Cornershop 등 칠레 브랜드 남미 확장",

    # ===== 홍콩 (HK) =====
    ("HK", "fashion"): "홍콩에서 럭셔리 패션과 스트리트웨어가 동시에 인기. 아시아 패션 허브",
    ("HK", "products"): "홍콩에서 최신 테크 가젯과 뷰티 제품이 인기. 면세 쇼핑 허브",
    ("HK", "food"): "홍콩에서 딤섬/에그타르트 등 전통 간식과 일본/한국 수입 디저트 인기",
    ("HK", "brands"): "홍콩에서 HKTVmall, Cathay Pacific, G.O.D., Shanghai Tang 등 HK 브랜드 인기",
}

# ================================================================
# 카테고리별 상품 데이터 (주요 40개국용 + 템플릿)
# brands 카테고리는 브랜드 자체가 상품
# ================================================================
KEY_COUNTRY_PRODUCTS = {
    # ========== US ==========
    ("US", "fashion"): [
        ("Lululemon Align Leggings", "TikTok 바이럴 요가 레깅스. 버터 같은 착용감. Amazon 판매. $98."),
        ("Stanley Quencher Tumbler H2.0", "소셜 미디어 인기 텀블러. 다양한 컬러. Target 판매. $45."),
        ("Nike Dunk Low Retro", "레트로 스니커즈 열풍 지속. 스트릿 패션 필수. Nike.com 판매. $115."),
        ("Skims Soft Lounge Dress", "Kim K 브랜드 라운지 드레스. 편안한 데일리룩. Skims.com 판매. $78."),
        ("Abercrombie Barrel Jeans", "배럴 진 트렌드 주도. TikTok 바이럴. Abercrombie 판매. $90."),
        ("Free People Hot Shot Mini Shorts", "여름 필수 핫팬츠. 인플루언서 추천. Free People 판매. $48."),
    ],
    ("US", "products"): [
        ("Apple AirPods Pro 3", "공간 오디오+적응형 노이즈캔슬링. Apple Store 판매. $249."),
        ("Dyson Airstrait Straightener", "젖은 머리에 바로 사용 가능. TikTok 바이럴. Dyson.com 판매. $499."),
        ("Samsung Galaxy Ring", "건강 추적 스마트 링. 수면/심박수 분석. Samsung.com 판매. $399."),
        ("Ember Mug 2", "온도 유지 스마트 머그. 앱 연동. Amazon 판매. $149."),
        ("Oura Ring Gen 4", "프리미엄 헬스 트래커 링. 수면 분석. Oura.com 판매. $349."),
        ("Theragun Mini 3", "휴대용 마사지건. 운동 후 회복. Walmart 판매. $199."),
    ],
    ("US", "food"): [
        ("Poppi Prebiotic Soda", "프리바이오틱 소다. 장 건강 트렌드. Target 판매. $2.49."),
        ("Chamberlain Coffee Matcha", "Emma Chamberlain 브랜드 말차. 소셜 미디어 인기. Amazon 판매. $22."),
        ("Liquid Death Mountain Water", "캔 포장 프리미엄 물. 마케팅 바이럴. Walmart 판매. $18.99 (12팩)."),
        ("Boba Protein Shake", "버블티 맛 프로틴 쉐이크. TikTok 바이럴. Amazon 판매. $34.99."),
        ("Fly By Jing Chili Crisp", "사천 칠리 크리스프. 요리 인플루언서 추천. Amazon 판매. $14.99."),
        ("Siete Churro Chips", "글루텐프리 추로 칩. 건강 스낵. Target 판매. $4.49."),
    ],
    ("US", "brands"): [
        ("Nike Air Max Dn", "나이키 에어맥스 신형. 다이내믹 에어 기술. Nike.com 판매. $160."),
        ("Apple Vision Pro", "애플 공간 컴퓨팅 기기. 혁신 기술 선도. Apple Store 판매. $3,499."),
        ("Stanley Adventure Quencher", "스탠리 퀜처 시리즈. 아웃도어 라이프스타일. Stanley 판매. $45."),
        ("Lululemon Belt Bag", "룰루레몬 벨트백. 애슬레저 필수템. Lululemon 판매. $38."),
        ("Yeti Rambler Tumbler", "예티 프리미엄 텀블러. 아웃도어 인기. Yeti.com 판매. $35."),
        ("Patagonia Better Sweater", "파타고니아 지속가능 패션. ESG 트렌드. Patagonia.com 판매. $139."),
    ],

    # ========== KR ==========
    ("KR", "fashion"): [
        ("무신사 스탠다드 와이드 팬츠", "무신사 자체 브랜드 와이드 팬츠. 가성비 데일리룩. 무신사 판매. ₩39,900."),
        ("에이블리 크롭 니트", "에이블리 인기 크롭 니트. 봄 레이어드 필수. 에이블리 판매. ₩19,800."),
        ("지그재그 미니 숄더백", "미니 숄더백 트렌드. 인스타 인기. 지그재그 판매. ₩32,000."),
        ("올리브영 비건 패드", "비건 뷰티 패드. 올리브영 매출 1위. 올리브영 판매. ₩12,900."),
        ("마뗑킴 크로스바디백", "마뗑킴 크로스바디. K-패션 대표. 무신사 판매. ₩89,000."),
        ("커버낫 스웻셔츠", "커버낫 로고 스웻셔츠. 캐주얼 필수. 쿠팡 판매. ₩49,900."),
    ],
    ("KR", "products"): [
        ("다이소 LED 미러", "다이소 인기 LED 거울. 매출 144% 증가. 다이소 판매. ₩5,000."),
        ("삼성 갤럭시 버즈3 프로", "노이즈캔슬링 이어버즈. 갤럭시 생태계. 쿠팡 판매. ₩329,000."),
        ("LG 스탠바이미 Go", "포터블 27인치 TV. 캠핑/재택. 쿠팡 판매. ₩999,000."),
        ("에어팟 프로3", "애플 프리미엄 이어폰. 공간 오디오. 쿠팡 판매. ₩349,000."),
        ("샤오미 보조배터리 20000mAh", "가성비 보조배터리. USB-C. 쿠팡 판매. ₩19,900."),
        ("로보락 S8 MaxV Ultra", "AI 로봇청소기. 자동 세척. 쿠팡 판매. ₩1,590,000."),
    ],
    ("KR", "food"): [
        ("편의점 감성 디저트 세트", "CU/GS25 한정판 감성 디저트. SNS 인기. 편의점 판매. ₩3,500."),
        ("오리온 초코파이 하우스", "프리미엄 초코파이. 선물용 인기. 쿠팡 판매. ₩12,900."),
        ("빽다방 아이스크림 라떼", "빽다방 인기 시그니처 음료. 배달 앱 판매. ₩3,000."),
        ("삼양 불닭볶음면 카르보", "해외에서도 인기 폭발. 수출 효자. 쿠팡 판매. ₩4,980."),
        ("곰표 밀맥주", "곰표 콜라보 수제맥주. 굿즈 인기. 편의점 판매. ₩3,500."),
        ("정관장 에브리타임", "홍삼 스틱. 건강 선물 1위. 올리브영 판매. ₩32,000."),
    ],
    ("KR", "brands"): [
        ("무신사 스탠다드", "무신사 자체 브랜드. 가성비 기본템. 무신사 판매. ₩29,900."),
        ("올리브영 라운드어라운드", "올리브영 PB 스킨케어. 비건 인기. 올리브영 판매. ₩15,900."),
        ("다이소 미니 선풍기", "다이소 시즌 히트. 가성비 왕. 다이소 판매. ₩3,000."),
        ("삼성 갤럭시 S26 케이스", "삼성 갤럭시 공식 케이스. 쿠팡 판매. ₩39,900."),
        ("현대 캐스퍼 미니카", "현대차 인기 경차 미니카 굿즈. 현대몰 판매. ₩25,000."),
        ("카카오프렌즈 춘식이 인형", "카카오 캐릭터 인형. 선물용 인기. 카카오메이커스 판매. ₩28,000."),
    ],

    # ========== JP ==========
    ("JP", "fashion"): [
        ("UNIQLO AIRism Ultra Seamless", "유니클로 에어리즘 시리즈. 여름 필수. UNIQLO 판매. ¥1,990."),
        ("GU スウェットワイドパンツ", "GU 와이드 스웻팬츠. 가성비 데일리룩. GU 판매. ¥1,490."),
        ("ZOZOTOWN オーバーサイズシャツ", "ZOZOTOWN 인기 오버사이즈 셔츠. ZOZOTOWN 판매. ¥4,990."),
        ("무인양품 리넨 셔츠", "MUJI 린넨 셔츠. 미니멀 스타일. MUJI 판매. ¥3,990."),
        ("New Balance 990v6", "NB 990 시리즈. 일본 스니커즈 인기. ABC-Mart 판매. ¥36,300."),
        ("Maison Kitsuné Fox Tee", "메종키츠네 여우 티셔츠. 도쿄 스트릿. SSENSE 판매. ¥14,300."),
    ],
    ("JP", "products"): [
        ("Panasonic ナノケア ドライヤー", "파나소닉 나노케어 드라이어. 뷰티 가전 1위. Amazon Japan 판매. ¥38,610."),
        ("Sony WH-1000XM6", "소니 프리미엄 헤드폰. 노이즈캔슬링. Sony Store 판매. ¥49,500."),
        ("Anker 733 Power Bank", "앤커 3-in-1 보조배터리. 인기 가젯. Amazon Japan 판매. ¥12,990."),
        ("BALMUDA The Speaker", "발뮤다 스피커. 감성 인테리어. Rakuten 판매. ¥38,500."),
        ("다이슨 Supersonic r", "다이슨 프로용 드라이어. 프리미엄 뷰티. Dyson JP 판매. ¥64,900."),
    ],
    ("JP", "food"): [
        ("コグマパン (고구마빵)", "SNS 감성 디저트. Yahoo 2026 트렌드 예측 선정. Amazon Japan 판매. ¥3,240."),
        ("抹茶キットカット 限定版", "한정판 말차 킷캣. 관광 선물 1위. Amazon Japan 판매. ¥1,080."),
        ("東京ばな奈 (도쿄바나나)", "도쿄 대표 선물. 관광 필수. 도쿄역 판매. ¥1,188."),
        ("カルビー ポテトチップス", "칼비 감자칩 한정판. Rakuten 판매. ¥298."),
        ("AGF ブレンディ カフェオレ", "AGF 카페오레 스틱. 홈카페 인기. Amazon Japan 판매. ¥698."),
        ("ROYCE' 생초콜릿", "로이즈 생초콜릿. 프리미엄 선물. ROYCE 공식 판매. ¥1,166."),
    ],
    ("JP", "brands"): [
        ("UNIQLO LifeWear 컬렉션", "유니클로 라이프웨어. 기본 필수. UNIQLO 판매. ¥2,990."),
        ("MUJI 아로마 디퓨저", "무인양품 아로마. 미니멀 라이프. MUJI 판매. ¥4,990."),
        ("Shiseido WASO 크림", "시세이도 와소 크림. J-뷰티 대표. Shiseido 판매. ¥4,400."),
        ("Sony PlayStation 5 Pro", "소니 PS5 프로. 게임 트렌드. Sony Store 판매. ¥79,980."),
        ("Toyota GR86 미니카", "토요타 GR86 다이캐스트. 자동차 굿즈. Amazon Japan 판매. ¥2,200."),
        ("Asics Gel-Kayano 31", "아식스 러닝화. 일본 품질. ASICS 판매. ¥19,800."),
    ],

    # ========== GB ==========
    ("GB", "fashion"): [
        ("ASOS Design Oversized Hoodie", "ASOS 오버사이즈 후디. 영국 스트릿. ASOS 판매. £28."),
        ("Dr. Martens 1460 Boots", "닥터마틴 1460. 클래식 부츠. Dr. Martens 판매. £169."),
        ("Primark Seamless Leggings", "프라이마크 레깅스. 초가성비. Primark 판매. £8."),
        ("The North Face Nuptse", "노스페이스 눕시. 겨울 아우터 필수. JD Sports 판매. £280."),
        ("Barbour Bedale Jacket", "바버 비데일 재킷. 영국 클래식. John Lewis 판매. £229."),
    ],
    ("GB", "products"): [
        ("Dyson V15 Detect Absolute", "다이슨 무선 청소기. 레이저 먼지 감지. Dyson UK 판매. £629."),
        ("Ninja Creami Ice Cream Maker", "닌자 크리미. TikTok 바이럴. Amazon UK 판매. £179."),
        ("Olaplex No.3 Hair Perfector", "올라플렉스 3번. 헤어 케어 인기. Amazon UK 판매. £28."),
        ("Apple Watch Ultra 3", "애플 워치 울트라3. 프리미엄 웨어러블. Apple UK 판매. £799."),
        ("Hisense U8N Mini-LED TV", "하이센스 미니LED TV. 가성비. Amazon UK 판매. £899."),
    ],
    ("GB", "food"): [
        ("Poppi Prebiotic Soda", "프리바이오틱 소다. Tesco 입점. 건강 간식. Tesco 판매. £2.50."),
        ("Grenade Protein Bar", "그레네이드 프로틴바. 피트니스 인기. Tesco 판매. £2.99."),
        ("Cadbury Dairy Milk Silk", "캐드버리 실크 초콜릿. 영국 대표. Sainsbury's 판매. £1.50."),
        ("Yorkshire Tea", "요크셔 티. 영국 국민 차. Amazon UK 판매. £5.50 (80bags)."),
        ("Graze Snack Box", "그레이즈 스낵박스. 건강 간식 구독. Graze.com 판매. £4.49."),
    ],
    ("GB", "brands"): [
        ("Dyson Airwrap Complete", "다이슨 에어랩. 뷰티 테크 1위. Dyson UK 판매. £479."),
        ("Burberry Scarf Classic Check", "버버리 체크 스카프. 영국 럭셔리. Burberry 판매. £450."),
        ("JD Sports Nike Dunk", "JD스포츠 나이키 덩크. 스니커즈 문화. JD Sports 판매. £89."),
        ("Marks & Spencer Cashmere", "M&S 캐시미어. 영국 품질. M&S 판매. £69."),
        ("Boots No7 Serum", "부츠 No7 세럼. 영국 뷰티. Boots 판매. £24.95."),
    ],

    # ========== FR ==========
    ("FR", "fashion"): [
        ("Sézane La Blouse", "세잔 블라우스. 파리지엔 스타일 대표. Sézane 판매. €125."),
        ("Jacquemus Le Chiquito", "자크뮈스 미니백. 인스타 바이럴. Jacquemus 판매. €540."),
        ("AMI Paris Ami de Coeur Tee", "아미 파리 하트 티셔츠. 캐주얼 럭셔리. AMI 판매. €195."),
        ("Lacoste Polo Classic", "라코스테 폴로. 프렌치 클래식. Lacoste 판매. €110."),
        ("Maison Margiela Tabi Boots", "메종 마르지엘라 타비 부츠. 아방가르드 패션. SSENSE 판매. €1,050."),
    ],
    ("FR", "products"): [
        ("La Roche-Posay Anthelios SPF50", "라로슈포제 선크림. 더마 뷰티 1위. Sephora FR 판매. €15.90."),
        ("Dyson Supersonic HD08", "다이슨 드라이어. 프리미엄 뷰티 가전. Fnac 판매. €399."),
        ("Nuxe Huile Prodigieuse", "뉵스 프로디쥬 오일. 프랑스 뷰티 대표. Nuxe 판매. €30.50."),
        ("Le Creuset Cocotte", "르크루제 코코트. 프리미엄 주방용품. Le Creuset 판매. €279."),
        ("BaByliss Pro Digital", "바비리스 고데기. 프랑스 뷰티 가전. Amazon.fr 판매. €89.99."),
    ],
    ("FR", "food"): [
        ("Pierre Hermé Macarons", "피에르 에르메 마카롱. 프리미엄 디저트. Pierre Hermé 판매. €22."),
        ("LU Petit Écolier", "LU 쁘띠 에콜리에. 프랑스 국민 과자. Carrefour 판매. €3.49."),
        ("Kusmi Tea Paris", "쿠스미 티. 프리미엄 프렌치 티. Kusmi 판매. €16.90."),
        ("Bonne Maman Tartlets", "본마망 타르트렛. 장인 제과. Monoprix 판매. €4.29."),
        ("Maison du Chocolat Ganache", "메종 뒤 쇼콜라. 프리미엄 초콜릿. La Maison 판매. €26."),
    ],
    ("FR", "brands"): [
        ("Louis Vuitton Neverfull", "루이비통 네버풀. 럭셔리 필수. Louis Vuitton 판매. €1,960."),
        ("Chanel N°5 L'Eau", "샤넬 No.5 로. 아이코닉 향수. Sephora 판매. €132."),
        ("Dior Lip Glow", "디올 립글로우. 뷰티 베스트셀러. Dior 판매. €39."),
        ("Sephora Collection Mask", "세포라 컬렉션 마스크. 가성비 뷰티. Sephora 판매. €3.99."),
        ("Petit Bateau Marinière", "프티바토 마리니에르. 프렌치 캐주얼. Petit Bateau 판매. €45."),
    ],

    # ========== DE ==========
    ("DE", "fashion"): [
        ("Adidas Samba OG", "아디다스 삼바. 레트로 스니커즈 대세. Zalando 판매. €100."),
        ("Birkenstock Arizona", "비르켄스탁 아리조나. 편안한 샌들. Birkenstock 판매. €80."),
        ("Jack Wolfskin Outdoorjacke", "잭 울프스킨 아웃도어. 독일 기능성. Amazon.de 판매. €149."),
        ("Armedangels Organic Tee", "아름다운겔스 유기농 티. 지속가능. Armedangels 판매. €39.90."),
        ("BOSS Hugo Boss Polo", "휴고보스 폴로. 독일 프리미엄. BOSS 판매. €98."),
    ],
    ("DE", "products"): [
        ("Bosch Smart Home Starter Kit", "보쉬 스마트홈 스타터. IoT 트렌드. Amazon.de 판매. €179."),
        ("Siemens EQ9 Coffee Machine", "지멘스 커피머신. 독일 엔지니어링. MediaMarkt 판매. €1,399."),
        ("dm alverde Naturkosmetik", "dm 알베르데 자연 화장품. 독일 클린뷰티. dm 판매. €5.95."),
        ("Braun Series 9 Pro", "브라운 시리즈9. 프리미엄 면도기. Amazon.de 판매. €299."),
        ("Thermomix TM7", "테르모믹스 TM7. 스마트 쿠커. Thermomix 판매. €1,499."),
    ],
    ("DE", "food"): [
        ("Ritter Sport Schokolade", "리터스포트 초콜릿. 독일 대표 초콜릿. dm 판매. €1.49."),
        ("Haribo Goldbären", "하리보 골드베렌. 세계적 젤리. REWE 판매. €1.09."),
        ("Brezn Bretzel", "브레첼. 독일 전통 빵. Bäckerei 판매. €1.50."),
        ("Melitta Kaffee", "멜리타 커피. 독일 커피 문화. Amazon.de 판매. €6.99."),
        ("Alnatura Bio-Müsli", "알나투라 유기농 뮤즐리. 건강 트렌드. dm 판매. €3.49."),
    ],
    ("DE", "brands"): [
        ("Adidas Ultraboost Light", "아디다스 울트라부스트. 러닝화 대세. Adidas.de 판매. €180."),
        ("Birkenstock Boston Clog", "비르켄스탁 보스턴. 트렌드 클로그. Birkenstock 판매. €120."),
        ("dm Balea Crème", "dm 발레아 크림. 가성비 뷰티. dm 판매. €1.45."),
        ("NIVEA Creme Dose", "니베아 크림. 독일 국민 뷰티. dm 판매. €2.49."),
        ("Bosch Pro Impact Driver", "보쉬 임팩트 드라이버. 독일 공구. Amazon.de 판매. €149."),
    ],

    # ========== BR ==========
    ("BR", "fashion"): [
        ("Havaianas Slim", "하바이아나스 슬림. 브라질 국민 슬리퍼. Havaianas 판매. R$49.99."),
        ("Farm Rio Tropical Dress", "팜 리오 트로피컬 드레스. 브라질 패션. Farm Rio 판매. R$399."),
        ("Colcci Jeans Skinny", "콜치 스키니 진. 브라질 데님. Magazine Luiza 판매. R$229."),
        ("Melissa Jelly Shoes", "멜리사 젤리 슈즈. 아이코닉 브라질. Melissa 판매. R$199."),
        ("Reserva Camiseta Básica", "헤제르바 기본 티. 남성 캐주얼. Reserva 판매. R$99."),
    ],
    ("BR", "products"): [
        ("Natura Chronos Sérum", "나뚜라 크로노스 세럼. 브라질 뷰티 1위. Natura 판매. R$149.90."),
        ("Samsung Galaxy A55", "삼성 갤럭시 A55. 가성비 스마트폰. Magazine Luiza 판매. R$1,799."),
        ("Electrolux PowerSpeed", "일렉트로룩스 청소기. 가전 인기. Americanas 판매. R$399."),
        ("O Boticário Malbec Noir", "오보띠까리오 말벡 노와. 남성 향수. O Boticário 판매. R$219."),
        ("JBL Tune 520BT", "JBL 무선 헤드폰. 가성비 오디오. Mercado Livre 판매. R$199."),
    ],
    ("BR", "food"): [
        ("Nestlé Nescau", "네스카우 초콜릿 음료. 브라질 국민 음료. Mercado Livre 판매. R$14.99."),
        ("Bauducco Chocottone", "바우두코 쇼코토네. 축제 시즌 필수. Carrefour BR 판매. R$29.90."),
        ("Havanna Alfajores", "하반나 알파호르. 아르헨티나식 간식. Havanna 판매. R$39.90."),
        ("Pão de Mel Kopenhagen", "코펜하겐 빵 드 멜. 프리미엄 과자. Kopenhagen 판매. R$49.90."),
        ("Café Melitta Tradicional", "멜리타 전통 커피. 브라질 커피. Mercado Livre 판매. R$18.90."),
    ],
    ("BR", "brands"): [
        ("Havaianas Top", "하바이아나스 탑. 브라질 아이코닉. Havaianas 판매. R$29.99."),
        ("Natura Ekos Castanha", "나뚜라 에코스. 아마존 원료. Natura 판매. R$89.90."),
        ("O Boticário Nativa SPA", "오보띠까리오 나티바 스파. 뷰티. O Boticário 판매. R$49.90."),
        ("Magazine Luiza Lu", "매거진 루이자 AI 캐릭터 굿즈. Magazine Luiza 판매. R$59.90."),
        ("Grendene Rider Sandal", "그렌데네 라이더 샌들. 브라질 여름. Mercado Livre 판매. R$69.90."),
    ],

    # ========== IN ==========
    ("IN", "fashion"): [
        ("Myntra Roadster Tshirt", "로드스터 기본 티. 인도 가성비 패션. Myntra 판매. ₹499."),
        ("FabIndia Kurti Collection", "패브인디아 쿠르티. 전통 현대화. FabIndia 판매. ₹1,499."),
        ("Allen Solly Chinos", "앨런 솔리 치노. 오피스 캐주얼. Flipkart 판매. ₹1,299."),
        ("Biba Anarkali Suit", "비바 아나르칼리. 인도 전통 패션. Biba 판매. ₹2,499."),
        ("Nike Air Force 1 India", "나이키 에어포스1. 인도 스니커즈. Amazon India 판매. ₹7,495."),
    ],
    ("IN", "products"): [
        ("boAt Airdopes 141", "보트 에어돕스. 인도 1위 이어버즈. Amazon India 판매. ₹1,299."),
        ("Realme Narzo 70x", "리얼미 나르조. 가성비 스마트폰. Flipkart 판매. ₹11,999."),
        ("Mamaearth Vitamin C Serum", "마마어스 비타민C 세럼. 인도 클린뷰티. Amazon India 판매. ₹549."),
        ("Mi Smart Band 9", "미밴드9. 가성비 웨어러블. Mi.com 판매. ₹2,999."),
        ("Prestige Induction Cooktop", "프레스티지 인덕션. 인도 주방 필수. Amazon India 판매. ₹2,199."),
    ],
    ("IN", "food"): [
        ("Haldiram's Soan Papdi", "할디람스 소안파프디. 인도 전통 과자. Amazon India 판매. ₹260."),
        ("Paper Boat Aam Panna", "페이퍼보트 암판나. 인도 전통 음료. BigBasket 판매. ₹30."),
        ("Bikanervala Kaju Katli", "비카네르발라 카주카틀리. 프리미엄 미타이. Bikanervala 판매. ₹650."),
        ("Too Yumm! Multigrain Chips", "투얌 멀티그레인 칩. 건강 스낵. Amazon India 판매. ₹30."),
        ("Sleepy Owl Cold Brew", "슬리피 아울 콜드브루. 인도 카페 트렌드. Amazon India 판매. ₹349."),
    ],
    ("IN", "brands"): [
        ("Tata Cliq Watch", "타타 클릭 스마트워치. 인도 대기업. Tata Cliq 판매. ₹4,999."),
        ("Nykaa Kay Beauty Palette", "니카 케이뷰티. 인도 뷰티 플랫폼. Nykaa 판매. ₹799."),
        ("boAt Rockerz 450", "보트 락커즈 헤드폰. 인도 오디오 1위. Amazon India 판매. ₹1,499."),
        ("Amul Dark Chocolate", "아물 다크 초콜릿. 인도 국민 유제품 브랜드. BigBasket 판매. ₹100."),
        ("Reliance Jio Phone", "릴라이언스 지오폰. 인도 통신 혁신. JioMart 판매. ₹6,499."),
    ],

    # ========== AU ==========
    ("AU", "fashion"): [
        ("Lorna Jane Sports Bra", "로나 제인 스포츠 브라. 호주 액티브웨어. Lorna Jane 판매. A$69.99."),
        ("Cotton On Relaxed Jeans", "코튼온 릴렉스드 진. 호주 캐주얼. Cotton On 판매. A$49.99."),
        ("RM Williams Craftsman Boots", "RM 윌리엄스 부츠. 호주 아이코닉. RM Williams 판매. A$595."),
        ("Rip Curl Wetsuit", "립컬 웻수트. 호주 서핑 문화. Rip Curl 판매. A$199."),
        ("Bonds Originals Tee", "본즈 오리지널 티. 호주 국민 브랜드. Bonds 판매. A$29.95."),
    ],
    ("AU", "products"): [
        ("Aesop Resurrection Aromatique", "이솝 핸드워시. 호주 프리미엄 뷰티. Aesop 판매. A$41."),
        ("Kogan SmarterHome Robot Vacuum", "코건 로봇청소기. 가성비 가전. Kogan 판매. A$299."),
        ("Go-To Skincare Face Hero", "고투 페이스 히어로. 호주 클린뷰티. Go-To 판매. A$45."),
        ("Breville Barista Express", "브레빌 바리스타. 호주 커피 문화. JB Hi-Fi 판매. A$699."),
        ("Frank Green Reusable Cup", "프랭크 그린 리유저블 컵. 친환경 트렌드. Frank Green 판매. A$44.95."),
    ],
    ("AU", "food"): [
        ("Tim Tam Double Coat", "팀탐 더블코트. 호주 국민 과자. Woolworths 판매. A$4.65."),
        ("Vegemite Squeeze", "베지마이트 스퀴즈. 호주 아이콘. Coles 판매. A$6.50."),
        ("T2 Tea French Earl Grey", "T2 프렌치 얼그레이. 호주 프리미엄 차. T2 판매. A$15."),
        ("Carman's Protein Bar", "카먼스 프로틴 바. 건강 간식. Woolworths 판매. A$5.50."),
        ("Byron Bay Cookie Company", "바이런베이 쿠키. 호주 장인 쿠키. Amazon AU 판매. A$6.50."),
    ],
    ("AU", "brands"): [
        ("Aesop Parsley Seed Cleanser", "이솝 파슬리 씨드. 호주 프리미엄. Aesop 판매. A$51."),
        ("Cotton On Foundation Tee", "코튼온 파운데이션 티. 호주 캐주얼. Cotton On 판매. A$14.99."),
        ("Lorna Jane Active Legging", "로나 제인 액티브 레깅스. 호주 액티브웨어. Lorna Jane 판매. A$109.99."),
        ("Kogan Smart TV 55-inch", "코건 스마트TV 55인치. 가성비 가전. Kogan 판매. A$499."),
        ("Swisse Vitamin C Gummies", "스위스 비타민C 구미. 호주 건강. Chemist Warehouse 판매. A$18.99."),
    ],

    # ========== CN ==========
    ("CN", "fashion"): [
        ("Li Ning 国潮 运动鞋", "리닝 국풍 운동화. 国潮 트렌드. JD.com 판매. ¥599."),
        ("Anta KT8 篮球鞋", "안타 KT8 농구화. 중국 스포츠 브랜드. Tmall 판매. ¥899."),
        ("PEACEBIRD 太平鸟", "태평조 캐주얼. 중국 패스트패션. Tmall 판매. ¥299."),
        ("Bosideng 波司登 Down", "보시덩 패딩. 중국 다운 브랜드 1위. JD.com 판매. ¥1,299."),
        ("JNBY 江南布衣 Dress", "강남포의 원피스. 중국 디자이너. JNBY 판매. ¥999."),
    ],
    ("CN", "products"): [
        ("Huawei Mate 70 Pro", "화웨이 메이트70 프로. 중국 프리미엄 폰. Huawei 판매. ¥6,999."),
        ("Xiaomi 15 Ultra", "샤오미15 울트라. 가성비 플래그십. Mi.com 판매. ¥5,999."),
        ("DJI Mini 4 Pro Drone", "DJI 미니4 프로. 드론 세계 1위. DJI Store 판매. ¥4,788."),
        ("Anker 氘多 충전기", "앤커 충전기. GaN 기술. JD.com 판매. ¥168."),
        ("Dreame L20 Ultra 로봇청소기", "드리미 L20. AI 로봇청소기. Tmall 판매. ¥4,299."),
    ],
    ("CN", "food"): [
        ("三只松鼠 坚果礼盒", "삼지송서 견과 선물세트. 라이브커머스 인기. Tmall 판매. ¥99."),
        ("良品铺子 肉松饼", "량핀푸쯔 육송병. 중국 전통 간식. JD.com 판매. ¥19.90."),
        ("百草味 芒果干", "바이차오웨이 망고건조. Douyin 인기. Pinduoduo 판매. ¥15.90."),
        ("蒙牛 特仑苏 牛奶", "멍뉴 특룬수. 프리미엄 우유. JD.com 판매. ¥69.90."),
        ("瑞幸咖啡 生椰拿铁粉", "루이싱 코코넛라떼 파우더. 중국 카페 트렌드. Tmall 판매. ¥59.90."),
    ],
    ("CN", "brands"): [
        ("Huawei Watch GT5 Pro", "화웨이 워치GT5 프로. 건강 관리. Huawei 판매. ¥2,488."),
        ("Xiaomi Smart Band 9 Pro", "샤오미 미밴드9 프로. 가성비 웨어러블. Mi.com 판매. ¥299."),
        ("Li Ning Way of Wade", "리닝 웨이드 시리즈. 중국 농구화. Li Ning 판매. ¥1,099."),
        ("SHEIN Summer Collection", "쉬인 여름 컬렉션. 글로벌 패스트패션. SHEIN 판매. ¥79."),
        ("BYD 모델카", "비야디 미니카. 중국 EV 브랜드 굿즈. Tmall 판매. ¥59."),
    ],

    # ========== TH ==========
    ("TH", "fashion"): [
        ("Uniqlo AIRism TH", "유니클로 에어리즘. 태국 더위 필수. Uniqlo TH 판매. ฿590."),
        ("Pomelo Fashion Dress", "포멜로 패션 드레스. 태국 온라인 브랜드. Pomelo 판매. ฿1,290."),
        ("CPS Chaps Polo", "CPS 챕스 폴로. 태국 캐주얼. CPS 판매. ฿890."),
        ("Carnival Sneaker Collab", "카니발 스니커즈 콜라보. 태국 스니커즈 문화. Carnival 판매. ฿4,990."),
        ("Jaspal Collection", "자스팔 컬렉션. 태국 프리미엄 패션. Jaspal 판매. ฿1,990."),
    ],
    ("TH", "products"): [
        ("Mistine Sunscreen", "미스틴 선크림. 태국 뷰티 1위. Lazada TH 판매. ฿299."),
        ("OPPO Reno 12 Pro", "오포 레노12 프로. 태국 인기폰. Shopee TH 판매. ฿15,999."),
        ("Panasonic Ionity Dryer TH", "파나소닉 이오니티 드라이어. Central Online 판매. ฿1,990."),
        ("Samsung Galaxy Tab S9 FE", "삼성 갤럭시 탭. 태국 학생 인기. JD Central 판매. ฿13,990."),
        ("Xiaomi Air Purifier 4", "샤오미 공기청정기. 방콕 미세먼지. Lazada TH 판매. ฿5,490."),
    ],
    ("TH", "food"): [
        ("Mama Tom Yum Ramen", "마마 똠양 라면. 태국 국민 라면. 7-Eleven TH 판매. ฿7."),
        ("Lay's Thailand Exclusive", "레이즈 태국 한정판. 로컬 맛. Big C 판매. ฿25."),
        ("Bento Squid Snack", "벤또 오징어 스낵. 태국 간식 대표. 7-Eleven TH 판매. ฿10."),
        ("Doi Kham Dried Mango", "도이캄 건망고. 태국 왕실 브랜드. Central Food Hall 판매. ฿85."),
        ("Singha Water Sparkling", "싱하 스파클링. 태국 프리미엄 워터. Big C 판매. ฿20."),
    ],
    ("TH", "brands"): [
        ("Central Department Store Gift", "센트럴 백화점 기프트. 태국 리테일 1위. Central 판매. ฿2,000."),
        ("CP All 7-Eleven Exclusive", "CP올 7-일레븐 한정상품. 태국 편의점. 7-Eleven TH 판매. ฿49."),
        ("True Move Accessories", "트루무브 액세서리. 태국 통신. True Store 판매. ฿590."),
        ("Thai Airways Model Plane", "타이항공 모형비행기. 태국 항공 굿즈. King Power 판매. ฿890."),
        ("DTAC Smart SIM Kit", "DTAC 스마트 SIM. 태국 통신 브랜드. DTAC Store 판매. ฿299."),
    ],

    # ========== MX ==========
    ("MX", "fashion"): [
        ("Liverpool Blusa Casual", "리버풀 캐주얼 블라우스. 멕시코 백화점. Liverpool 판매. $499 MXN."),
        ("Cuidado con el Perro Tee", "쿠이다도 콘 엘 페로. 멕시코 로컬 패션. Amazon MX 판매. $349 MXN."),
        ("Nike Air Max TW Mexico", "나이키 에어맥스 멕시코 에디션. Mercado Libre 판매. $2,499 MXN."),
        ("Shasa Fashion Dress", "샤사 패션 드레스. 멕시코 패스트패션. Shasa 판매. $699 MXN."),
        ("Bershka MX Cargo Pants", "버시카 카고팬츠. Y2K 트렌드. Bershka MX 판매. $799 MXN."),
    ],
    ("MX", "products"): [
        ("Xiaomi Redmi Note 13 Pro", "샤오미 레드미노트13. 멕시코 가성비 폰. Mercado Libre 판매. $4,999 MXN."),
        ("Amazon Echo Dot 5", "아마존 에코 닷5. 스마트 스피커. Amazon MX 판매. $1,049 MXN."),
        ("Samsung Galaxy Buds FE", "삼성 갤럭시 버즈FE. 가성비 이어버즈. Liverpool 판매. $1,499 MXN."),
        ("Kärcher SC3 Steam Cleaner", "케르허 스팀 클리너. 독일 가전. Amazon MX 판매. $3,999 MXN."),
        ("Miniso LED Ring Light", "미니소 LED 링라이트. 콘텐츠 크리에이터. Miniso 판매. $399 MXN."),
    ],
    ("MX", "food"): [
        ("Takis Fuego", "타키스 푸에고. 멕시코 국민 과자. Walmart MX 판매. $28 MXN."),
        ("Carlos V Chocolate", "카를로스V 초콜릿. 멕시코 전통 초콜릿. OXXO 판매. $18 MXN."),
        ("Sabritas Adobadas", "사브리타스 아도바다스. 멕시코 감자칩. Walmart MX 판매. $22 MXN."),
        ("Boing! Mango Juice", "보잉 망고 주스. 멕시코 국민 음료. OXXO 판매. $15 MXN."),
        ("De la Rosa Mazapán", "데 라 로사 마자판. 멕시코 전통 과자. Walmart MX 판매. $12 MXN."),
    ],
    ("MX", "brands"): [
        ("Bimbo Pan Blanco", "빔보 식빵. 멕시코 식품 기업 1위. Walmart MX 판매. $49 MXN."),
        ("Liverpool Gift Card", "리버풀 기프트카드. 멕시코 백화점. Liverpool 판매. $500 MXN."),
        ("Corona Extra 6-Pack", "코로나 엑스트라 6팩. 멕시코 맥주 아이콘. OXXO 판매. $119 MXN."),
        ("Telcel Prepaid SIM", "텔셀 프리페이드 SIM. 멕시코 통신 1위. Telcel Store 판매. $100 MXN."),
        ("Cinépolis Popcorn Bucket", "시네폴리스 팝콘 버킷. 멕시코 영화관. Cinépolis 판매. $89 MXN."),
    ],

    # ========== TR ==========
    ("TR", "fashion"): [
        ("LC Waikiki Basic Tee", "LC 와이키키 기본 티. 터키 국민 패션. LC Waikiki 판매. ₺149."),
        ("DeFacto Slim Jean", "디팩토 슬림 진. 터키 패스트패션. DeFacto 판매. ₺399."),
        ("Koton Summer Dress", "코톤 여름 원피스. Trendyol 판매. ₺599."),
        ("Mavi Jeans Gold", "마비 진 골드. 터키 데님 브랜드. Mavi 판매. ₺899."),
        ("Ipekyol Modest Collection", "이페키올 모디스트 컬렉션. 터키 프리미엄. Ipekyol 판매. ₺1,999."),
    ],
    ("TR", "products"): [
        ("Vestel Venus V7", "베스텔 비너스V7. 터키 스마트폰. Hepsiburada 판매. ₺5,999."),
        ("Arçelik Telve Kahve", "아르첼릭 텔베. 터키 커피 메이커. n11 판매. ₺1,499."),
        ("Farmasi Skincare Set", "파르마시 스킨케어. 터키 뷰티 브랜드. Farmasi 판매. ₺499."),
        ("Philips One Blade TR", "필립스 원블레이드. 남성 그루밍. Trendyol 판매. ₺899."),
        ("Beko Smart Oven", "베코 스마트 오븐. 터키 가전. Hepsiburada 판매. ₺3,999."),
    ],
    ("TR", "food"): [
        ("Ülker Çikolatalı Gofret", "율커 초콜릿 고프레. 터키 국민 과자. A101 판매. ₺15."),
        ("Tariş Zeytinyağı", "타리시 올리브오일. 터키 프리미엄. Migros 판매. ₺189."),
        ("Tadım Kuruyemiş Mix", "타딤 견과류 믹스. 터키 간식. BIM 판매. ₺59."),
        ("Dido Wafer", "디도 웨이퍼. 터키 인기 과자. ŞOK 판매. ₺10."),
        ("Çaykur Rize Tea", "차이쿠르 리제 차. 터키 홍차. Migros 판매. ₺79."),
    ],
    ("TR", "brands"): [
        ("LC Waikiki Kids Set", "LC 와이키키 키즈 세트. 터키 가족 패션. LC Waikiki 판매. ₺299."),
        ("Trendyol Collection Dress", "트렌드욜 컬렉션. 터키 이커머스 1위. Trendyol 판매. ₺499."),
        ("Turkish Airlines Cabin Bag", "터키항공 기내가방. 항공 굿즈. Turkish Airlines Shop 판매. ₺899."),
        ("Koçtaş Smart Home Kit", "코치타시 스마트홈 키트. 터키 홈 브랜드. Koçtaş 판매. ₺1,299."),
        ("Arçelik Robot Vacuum", "아르첼릭 로봇청소기. 터키 가전 1위. Arçelik 판매. ₺7,999."),
    ],

    # ========== SA ==========
    ("SA", "fashion"): [
        ("Ounass Designer Abaya", "오나스 디자이너 아바야. 사우디 럭셔리. Ounass 판매. SAR 1,500."),
        ("Namshi Sports Sneaker", "남시 스포츠 스니커즈. 사우디 스포츠웨어. Namshi 판매. SAR 399."),
        ("SHEIN SA Modest Dress", "쉬인 모디스트 드레스. 가성비. SHEIN SA 판매. SAR 89."),
        ("Nike Air Jordan 1 SA", "나이키 에어조던1. 사우디 스니커즈. Noon SA 판매. SAR 699."),
        ("Styli Fashion Top", "스타일리 패션 탑. 사우디 온라인. Styli 판매. SAR 129."),
    ],
    ("SA", "products"): [
        ("Apple iPhone 16 Pro SA", "아이폰16 프로. 사우디 프리미엄. Jarir 판매. SAR 5,299."),
        ("Dyson V12 Detect SA", "다이슨 V12. 사우디 프리미엄 가전. Noon SA 판매. SAR 2,499."),
        ("Samsung Galaxy Z Fold 6", "삼성 폴드6. 폴더블 트렌드. Jarir 판매. SAR 7,499."),
        ("Foreo Luna 4 SA", "포레오 루나4. 뷰티 디바이스. Noon SA 판매. SAR 1,199."),
        ("Sony PS5 Slim SA", "소니 PS5 슬림. 게임 트렌드. Jarir 판매. SAR 1,899."),
    ],
    ("SA", "food"): [
        ("Al Baik Sauce", "알바이크 소스. 사우디 국민 패스트푸드. Al Baik 판매. SAR 15."),
        ("Almarai Dates Filled", "알마라이 대추야자. 사우디 전통 간식. Tamimi 판매. SAR 29."),
        ("Nadec Laban", "나덱 라반. 사우디 유산균 음료. Danube 판매. SAR 5."),
        ("Al Fakher Sweets", "알파케르 아랍 과자. 전통 디저트. Panda 판매. SAR 45."),
        ("Saudi Coffee Arabic Blend", "사우디 아라빅 커피. 전통 커피. Amazon.sa 판매. SAR 89."),
    ],
    ("SA", "brands"): [
        ("NEOM City Collection", "네옴 시티 컬렉션. 사우디 미래도시 굿즈. NEOM 판매. SAR 199."),
        ("Almarai Juice Pack", "알마라이 주스팩. 사우디 유제품 1위. Tamimi 판매. SAR 12."),
        ("STC Pay Gift Card", "STC 페이 기프트카드. 사우디 통신. STC 판매. SAR 100."),
        ("Jarir Bookstore Planner", "자리르 플래너. 사우디 서점. Jarir 판매. SAR 49."),
        ("Saudi Airlines Amenity Kit", "사우디항공 어메니티 키트. 항공 굿즈. Saudi Airlines 판매. SAR 149."),
    ],

    # ========== NG ==========
    ("NG", "fashion"): [
        ("Ankara Print Dress", "앙카라 프린트 드레스. 나이지리아 전통 패턴. Jumia NG 판매. ₦8,500."),
        ("Adidas Lagos City Pack", "아디다스 라고스 팩. 나이지리아 에디션. Konga 판매. ₦45,000."),
        ("Payporte Basic Tee", "페이포르테 기본 티. 가성비 패션. PayPorte 판매. ₦3,500."),
        ("Orange Culture Shirt", "오렌지 컬처 셔츠. 나이지리아 디자이너. Orange Culture 판매. ₦25,000."),
        ("Deola Sagoe Collection", "데올라 사고에 컬렉션. 나이지리아 하이패션. Deola Sagoe 판매. ₦85,000."),
    ],
    ("NG", "products"): [
        ("Tecno Spark 20 Pro+", "테크노 스파크20 프로+. 아프리카 가성비 폰. Jumia NG 판매. ₦120,000."),
        ("Oraimo FreePods 4", "오라이모 프리팟4. 아프리카 이어버즈 1위. Konga 판매. ₦15,000."),
        ("Hisense 43-inch Smart TV", "하이센스 스마트TV. 가성비 가전. Jumia NG 판매. ₦185,000."),
        ("Nexus Gas Cooker", "넥서스 가스 쿠커. 나이지리아 주방 필수. Jumia NG 판매. ₦95,000."),
        ("Starlink Mini Kit Nigeria", "스타링크 미니. 나이지리아 인터넷 혁신. Starlink 판매. ₦250,000."),
    ],
    ("NG", "food"): [
        ("Indomie Instant Noodles", "인도미 인스턴트 라면. 나이지리아 국민 라면. Shoprite 판매. ₦200."),
        ("Dangote Sugar 1kg", "당고테 설탕. 나이지리아 식품 대기업. Shoprite 판매. ₦1,200."),
        ("Gala Sausage Roll", "갈라 소시지 롤. 나이지리아 간식 아이콘. 길거리 판매. ₦300."),
        ("Peak Milk Evaporated", "피크 밀크. 나이지리아 우유 1위. Shoprite 판매. ₦500."),
        ("Milo Nestle Nigeria", "마일로. 나이지리아 인기 음료. Shoprite 판매. ₦2,500."),
    ],
    ("NG", "brands"): [
        ("Jumia Gift Voucher", "주미아 기프트 바우처. 아프리카 이커머스 1위. Jumia NG 판매. ₦10,000."),
        ("Dangote Cement Merchandise", "당고테 시멘트 굿즈. 나이지리아 대기업. Dangote Store 판매. ₦5,000."),
        ("Paystack Developer Kit", "페이스택 개발자 키트. 나이지리아 핀테크. Paystack 판매. ₦15,000."),
        ("GTBank Fashion Weekend", "GTBank 패션 위크엔드 굿즈. 나이지리아 은행. GTBank 판매. ₦8,000."),
        ("Flutterwave Starter Pack", "플러터웨이브 스타터팩. 아프리카 핀테크. Flutterwave 판매. ₦12,000."),
    ],
}

# 카테고리별 상품 템플릿 (나머지 국가용)
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
    ],
    "products": [
        ("무선 블루투스 이어버즈", "액티브 노이즈캔슬링 무선 이어버즈. 긴 배터리 수명"),
        ("휴대용 보조배터리 10000mAh", "슬림 디자인 보조배터리. USB-C 고속충전 지원"),
        ("LED 데스크 램프", "밝기/색온도 조절 LED 램프. 학습/재택근무용"),
        ("스마트 체중계", "체지방/근육량 측정 스마트 체중계. 앱 연동"),
        ("미니 공기청정기", "USB 전원 미니 공기청정기. 책상/차량용"),
        ("뷰티 LED 미러", "LED 조명 내장 화장 거울. 밝기 조절 가능"),
        ("보온보냉 텀블러", "진공 단열 보온보냉 텀블러. 12시간 보온"),
    ],
    "food": [
        ("프리미엄 초콜릿 세트", "프리미엄 수제 초콜릿 세트. 선물용으로 인기"),
        ("견과류 믹스 스낵", "하루 견과 믹스 스낵팩. 건강 간식으로 인기"),
        ("그래놀라 바", "유기농 그래놀라 에너지바. 간편한 건강 간식"),
        ("전통 쿠키 세트", "수제 전통 쿠키 세트. 축제/선물용 인기"),
        ("프로틴 스낵 바", "고단백 프로틴 스낵바. 운동 후 간식"),
        ("드립백 커피 세트", "프리미엄 드립백 커피 세트. 간편한 홈카페"),
        ("허브티 세트", "유기농 허브티 세트. 릴렉스 시간을 위한 차"),
    ],
    "brands": [
        ("글로벌 브랜드 스니커즈", "글로벌 브랜드 인기 스니커즈. 스트릿 패션 필수"),
        ("로컬 뷰티 브랜드 세트", "로컬 뷰티 브랜드 스킨케어 세트. 현지 인기"),
        ("스포츠 브랜드 백팩", "스포츠 브랜드 기능성 백팩. 데일리/아웃도어 겸용"),
        ("프리미엄 브랜드 향수", "프리미엄 브랜드 향수. 시그니처 향"),
        ("로컬 식품 브랜드 세트", "로컬 식품 브랜드 선물 세트. 현지 특산"),
        ("테크 브랜드 액세서리", "테크 브랜드 스마트폰 액세서리. 호환성 우수"),
        ("패션 브랜드 지갑", "패션 브랜드 미니 지갑. 카드/현금 수납"),
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


def format_local_price(usd_amount: float, country_code: str) -> str:
    """USD 금액을 현지 통화로 변환하여 포맷팅"""
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
    """일관된 스코어 세트 생성"""
    rng = random.Random(seed_val)
    heat = max(50, min(100, base_heat + rng.randint(-15, 10)))
    search = max(30, heat - rng.randint(5, 15))
    social = max(30, heat - rng.randint(10, 25))
    ecommerce = max(30, heat - rng.randint(0, 10))
    news = max(20, heat - rng.randint(15, 35))
    status = "rising" if heat >= 75 else "steady"
    return heat, status, search, social, ecommerce, news


def get_country_info(code: str):
    """국가 코드 -> 전체 정보"""
    for c in ALL_COUNTRIES:
        if c[0] == code:
            return c
    return None


def get_country_name_ko(code: str) -> str:
    info = get_country_info(code)
    return info[1] if info else code


def log(msg: str):
    print(f"[{datetime.now().strftime('%H:%M:%S')}] {msg}")


def get_region(code: str) -> str:
    info = get_country_info(code)
    return info[4] if info else "other"


# ================================================================
# 메인 로직
# ================================================================

def generate_key_country_data():
    """주요 국가 데이터 생성 (KEY_COUNTRY_PRODUCTS에 있는 국가만)"""
    all_items = []

    for (cc, cat), products in KEY_COUNTRY_PRODUCTS.items():
        for i, (name, desc) in enumerate(products):
            seed_val = int(hashlib.md5(f"{cc}_{cat}_{name}".encode()).hexdigest()[:8], 16)
            heat, status, search, social, ecomm, news = generate_heat_scores(seed_val, 88 - i * 3)

            # tags에서 가격과 판매처 추출
            parts = desc.rstrip('.').split('. ')
            store = ""
            price = ""
            for p in parts:
                if '판매' in p:
                    store = p.replace(' 판매', '')
            if parts:
                last_part = parts[-1].strip()
                if any(c in last_part for c in '$₩¥£€₹฿₦₺₱'):
                    price = last_part
                elif last_part.startswith(('SAR', 'AED', 'R$', 'A$', 'C$', 'S$', 'HK$')):
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


def _generate_template_items(cc, cat, count, key_index, rng, base_heat=78):
    """템플릿 기반으로 상품 생성"""
    items = []
    template_cc = TEMPLATE_MAP.get(cc, "US")
    stores = LOCAL_STORES.get(cc, ["Online Store"])
    if isinstance(stores, tuple):
        stores = list(stores)
    country_name = get_country_name_ko(cc)
    seed_base = int(hashlib.md5(f"{cc}_{cat}".encode()).hexdigest()[:8], 16)

    # 트렌드 이유
    trend_reason = VERIFIED_TRENDS.get((cc, cat), "")
    if not trend_reason:
        tmpl_reason = VERIFIED_TRENDS.get((template_cc, cat), "")
        if tmpl_reason:
            trend_reason = f"{country_name}에서 {cat} 상품이 온라인 통해 인기 확산"
        else:
            trend_reason = f"{country_name}에서 인기 상품"

    template_items = key_index.get((template_cc, cat), [])

    # 사용할 이름 리스트 (중복 방지)
    used_names = set()
    selected_sources = []

    if template_items:
        sampled = rng.sample(template_items, min(count, len(template_items)))
        for item in sampled:
            selected_sources.append(("ref", item))
            used_names.add(item["name"])

    # 부족분은 PRODUCT_TEMPLATES에서 보충
    templates = PRODUCT_TEMPLATES.get(cat, [])
    available_templates = [t for t in templates if t[0] not in used_names]
    while len(selected_sources) < count and available_templates:
        tpl = rng.choice(available_templates)
        selected_sources.append(("tpl", tpl))
        used_names.add(tpl[0])
        available_templates = [t for t in available_templates if t[0] not in used_names]

    for i, source in enumerate(selected_sources):
        store = rng.choice(stores)
        price_ranges = {"fashion": (8, 60), "products": (5, 45), "food": (3, 25), "brands": (8, 50)}
        low, high = price_ranges.get(cat, (5, 30))
        usd_price = rng.uniform(low, high)
        local_price = format_local_price(usd_price, cc)

        if source[0] == "ref":
            name = source[1]["name"]
        else:
            name = source[1][0]

        desc = f"{trend_reason}. {store} 판매. {local_price}."
        score_seed = seed_base + i * 7
        heat, status, search, social, ecomm, news = generate_heat_scores(score_seed, base_heat - i * 3)

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


def generate_all_country_data(explicit_data):
    """모든 190개국 데이터 생성"""
    all_items = list(explicit_data)  # 시작: KEY_COUNTRY_PRODUCTS에서 온 데이터
    categories = ["fashion", "products", "food", "brands"]

    # explicit_data를 국가+카테고리별로 인덱싱
    key_index = {}
    for item in explicit_data:
        k = (item["country_code"], item["category_slug"])
        key_index.setdefault(k, []).append(item)

    # explicit_data에 있는 국가코드 set
    explicit_countries = set(d["country_code"] for d in explicit_data)

    for c_info in ALL_COUNTRIES:
        cc = c_info[0]

        # 이미 explicit 데이터가 있는 국가는 카테고리별로 확인
        for cat in categories:
            existing = key_index.get((cc, cat), [])

            if cc in explicit_countries and len(existing) >= 5:
                # 이미 충분한 데이터 있음
                continue

            # KEY_COUNTRIES에 포함된 국가는 5~7개, 아닌 국가는 5~6개
            seed_base = int(hashlib.md5(f"{cc}_{cat}_gen".encode()).hexdigest()[:8], 16)
            rng = random.Random(seed_base)

            if cc in KEY_COUNTRIES:
                target = rng.randint(7, 8)
                base_heat = 82
            else:
                target = rng.randint(7, 7)
                base_heat = 75

            needed = target - len(existing)
            if needed <= 0:
                continue

            new_items = _generate_template_items(cc, cat, needed, key_index, rng, base_heat)
            all_items.extend(new_items)

    return all_items


def generate_region_sql(trends, region_name, region_codes, part_num, total_parts):
    """지역별 SQL 생성"""
    region_trends = [t for t in trends if t["country_code"] in region_codes]

    sql = []
    sql.append(f"-- MONTRA 190개국 트렌드 데이터 - {region_name}")
    sql.append(f"-- Part {part_num}/{total_parts}")
    sql.append(f"-- 생성: {datetime.now(timezone.utc).strftime('%Y-%m-%d %H:%M UTC')}")
    sql.append(f"-- 국가: {len(set(t['country_code'] for t in region_trends))}개국, 상품: {len(region_trends)}개")
    sql.append("")

    if part_num == 1:
        # 첫 파트에 TRUNCATE + categories + countries
        sql.append("-- 기존 데이터 정리")
        sql.append("TRUNCATE trend_history CASCADE;")
        sql.append("TRUNCATE trends CASCADE;")
        sql.append("DELETE FROM categories;")
        sql.append("DELETE FROM countries;")
        sql.append("")
        sql.append("ALTER TABLE categories DROP CONSTRAINT IF EXISTS categories_slug_check;")
        sql.append("ALTER TABLE countries DROP CONSTRAINT IF EXISTS countries_region_check;")
        sql.append("")

        # Categories (brands 포함)
        cats = [
            ("fashion", "옷", "Fashion", "👗", 1),
            ("products", "상품", "Products", "🛍️", 2),
            ("food", "음식", "Food", "🍽️", 3),
            ("brands", "브랜드", "Brands", "🏷️", 4),
        ]
        for slug, ko, en, emoji, sort in cats:
            sql.append(
                f"INSERT INTO categories (slug, name_ko, name_en, emoji, sort_order) "
                f"VALUES ('{slug}', '{ko}', '{en}', '{emoji}', {sort});"
            )
        sql.append("")

        # ALL countries (190개)
        for code, ko, en, flag, region, sub in ALL_COUNTRIES:
            sql.append(
                f"INSERT INTO countries (code, name_ko, name_en, flag_emoji, region, sub_region, is_active) "
                f"VALUES ('{escape_sql(code)}', '{escape_sql(ko)}', '{escape_sql(en)}', "
                f"'{flag}', '{region}', '{sub}', true);"
            )
        sql.append("")

        sql.append("ALTER TABLE categories ADD CONSTRAINT categories_slug_check CHECK (slug IN ('fashion','products','food','brands'));")
        sql.append("ALTER TABLE countries ADD CONSTRAINT countries_region_check CHECK (region IN ('asia','europe','americas','middle_east','africa','oceania'));")
        sql.append("")

    # Trend INSERTs
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
    log("190개국 트렌드 데이터 생성 시작")
    log("=" * 60)

    # 1. KEY_COUNTRY_PRODUCTS 기반 직접 데이터
    log("\n[1/2] 직접 데이터 생성 중 (KEY_COUNTRY_PRODUCTS)...")
    explicit_data = generate_key_country_data()
    explicit_countries = set(d["country_code"] for d in explicit_data)
    log(f"  직접 데이터: {len(explicit_data)}개 상품, {len(explicit_countries)}개국")

    # 2. 190개국 전체 데이터 생성 (템플릿 보충 포함)
    log("\n[2/2] 190개국 전체 데이터 생성 중...")
    all_trends = generate_all_country_data(explicit_data)
    total_countries = len(set(t["country_code"] for t in all_trends))
    log(f"\n  총 상품: {len(all_trends)}개")
    log(f"  총 국가: {total_countries}개")

    for cat in ["fashion", "products", "food", "brands"]:
        cnt = sum(1 for t in all_trends if t["category_slug"] == cat)
        log(f"    {cat}: {cnt}개")

    # 4. 지역별 SQL 생성
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
    log(f"  직접 데이터 (KEY_COUNTRY_PRODUCTS): {len(explicit_data)}개 ({len(explicit_countries)}개국)")
    log(f"  템플릿 보충: {len(all_trends) - len(explicit_data)}개")
    log(f"  SQL 파일: {len(files_written)}개")
    for fname, fsize, fcnt in files_written:
        log(f"    {fname}: {fsize / 1024:.1f}KB ({fcnt} INSERT)")
    log("=" * 60)


if __name__ == "__main__":
    main()
