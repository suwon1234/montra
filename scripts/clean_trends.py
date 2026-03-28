"""
수집된 트렌드 데이터 정리
1. 상품명 길이 정리 (60자 이내)
2. 카테고리 오분류 필터링 (음식이 패션에 있는 경우 등)
3. 한국어 설명 추가 (상품이 무엇인지)
4. 새 SQL 생성
"""

import sys
import io
import json
import math
import re
from datetime import datetime, timezone
from pathlib import Path

sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8', errors='replace')

SCRIPT_DIR = Path(__file__).parent
OUTPUT_DIR = SCRIPT_DIR / "output"

# 카테고리별 제외 키워드 (이 키워드가 포함되면 해당 카테고리에서 제외)
CATEGORY_EXCLUDE = {
    "fashion": [
        # 음식
        "요거트", "요거젤리", "젤리", "과자", "음식", "식품", "그릭", "푸룬", "블루베리", "딸기",
        "cookie", "snack", "food", "candy", "chocolate", "yogurt", "recipe", "cook", "gummy",
        "brownie", "cake", "cheese", "protein", "お菓子", "食", "料理", "チョコ",
        # 교재/책
        "CD", "교재", "수능", "자격증", "프로그래밍", "마케터", "헌법", "한국어능력",
        "ebook", "eBook", "교육", "기출", "기본서", "問題集", "参考書", "教科書",
        "트렌드 2026", "AI 비즈니스", "웰니스치유", "주소록",
        # 생활용품/기타
        "기저귀", "살균", "소독", "액정보호", "네비게이션", "보호필름", "캔들",
        "소설", "나라장터", "사전", "도감", "역사",
        # 전자제품
        "speaker", "blender", "charger", "projector", "smartwatch", "tracker",
    ],
    "products": [
        # 교재/책
        "교재", "수능", "자격증", "기출", "프로그래밍", "한국어능력", "헌법", "경찰",
        "에듀윌", "주소록", "ebook", "eBook", "参考書", "教科書", "問題集",
        "기본서", "교육", "소설", "나라장터", "사전", "도감", "역사", "가이드",
        "소설", "교과서", "문제집", "hướng dẫn",
        # 음식 (products에서 제외)
        "요거트", "요거젤리", "젤리", "과자", "간식", "초콜릿", "캔디", "그릭", "푸룬",
        "cookie", "snack", "candy", "chocolate", "gummy", "brownie",
        "お菓子", "スイーツ", "チョコ", "ขนม",
    ],
    "food": [
        # 패션
        "옷", "패션", "의류", "dress", "shirt", "pants", "jacket", "shoes", "sneaker",
        "blouse", "skirt", "coat", "服", "ファッション",
        # 생활용품
        "기저귀", "살균", "액정보호", "네비게이션", "CD", "교재",
        # 캔들/그릇 (음식이 아님)
        "캔들", "용기", "그릇", "볼", "접시", "candle", "holder",
        # 반려동물 사료
        "사료", "강아지", "고양이", "pet", "dog", "cat", "สุนัข", "เพดดิกรี",
    ],
    "entertainment": [
        # 교재/책
        "교재", "수능", "자격증", "기출", "헌법", "경찰", "에듀윌", "마케터",
        "ebook", "eBook", "참고서", "기본서", "교육", "参考書", "教科書", "問題集",
        "소설", "나라장터", "사전", "가이드", "hướng dẫn",
    ],
}

# 글로벌 제외 (모든 카테고리에서 제외)
GLOBAL_EXCLUDE = [
    "살균소독기", "소독기", "보호필름", "네비게이션", "계기판", "주소록",
    "기저귀", "교과서", "문제집", "기출문제", "참고서", "교재",
]

# 카테고리별 한국어 설명 키워드 매핑
PRODUCT_TYPE_KR = {
    "fashion": {
        # 영어
        "dress": "원피스", "skirt": "스커트", "pants": "팬츠", "jeans": "진", "shirt": "셔츠",
        "blouse": "블라우스", "top": "상의", "jacket": "재킷", "coat": "코트", "sweater": "스웨터",
        "hoodie": "후디", "cardigan": "가디건", "set": "세트", "suit": "수트",
        "sneaker": "스니커즈", "shoe": "신발", "boot": "부츠", "sandal": "샌들",
        "bag": "가방", "handbag": "핸드백", "backpack": "백팩",
        "jumpsuit": "점프수트", "oversize": "오버사이즈", "knit": "니트",
        # 일본어
        "ワンピース": "원피스", "パンツ": "팬츠", "ニット": "니트", "スカート": "스커트",
        "ジャケット": "재킷", "セットアップ": "세트", "コート": "코트",
        "服": "의류", "ファッション": "패션 아이템",
        # 기타
        "vestido": "원피스", "robe": "원피스", "veste": "재킷", "pantalon": "팬츠",
        "kleid": "원피스", "hose": "팬츠", "kleidung": "의류",
    },
    "products": {
        "ring": "스마트 반지", "watch": "스마트워치", "speaker": "스피커", "headphone": "헤드폰",
        "earbuds": "이어버즈", "charger": "충전기", "blender": "블렌더", "bottle": "보틀",
        "projector": "프로젝터", "pen": "펜", "light": "라이트", "lamp": "램프",
        "tracker": "트래커", "tag": "태그", "oven": "오븐", "iron": "다리미",
        "powerbank": "보조배터리", "cable": "케이블", "mist": "미스트",
        "ポット": "포트", "スマートウォッチ": "스마트워치", "イヤホン": "이어폰",
        "altavoz": "스피커", "reloj": "시계", "cargador": "충전기",
    },
    "food": {
        "chocolate": "초콜릿", "cookie": "쿠키", "candy": "캔디", "gummy": "젤리",
        "snack": "스낵", "chip": "칩", "brownie": "브라우니", "cake": "케이크",
        "bar": "바", "wafer": "웨이퍼", "biscuit": "비스킷", "cracker": "크래커",
        "popcorn": "팝콘", "toffee": "토피", "caramel": "카라멜", "pie": "파이",
        "tea": "차", "coffee": "커피", "juice": "주스",
        "お菓子": "과자", "スイーツ": "스위츠", "チョコ": "초콜릿", "クッキー": "쿠키",
        "バウムクーヘン": "바움쿠헨", "ガトー": "가토",
        "과자": "과자", "간식": "간식", "디저트": "디저트", "캔들": "캔들",
        "dulce": "사탕", "bonbon": "봉봉", "gâteau": "케이크", "biscotti": "비스코티",
    },
    "entertainment": {
        "lego": "레고", "game": "게임", "puzzle": "퍼즐", "toy": "장난감",
        "console": "게임기", "handheld": "휴대용 게임기", "drone": "드론",
        "figure": "피규어", "doll": "인형", "robot": "로봇", "cube": "큐브",
        "card": "카드게임", "board": "보드게임", "fidget": "피젯",
        "おもちゃ": "장난감", "ゲーム": "게임", "グッズ": "굿즈",
        "juguete": "장난감", "jouet": "장난감", "spielzeug": "장난감",
        "giocattol": "장난감", "leksak": "장난감",
    },
}

# 국가 코드별 언어
COUNTRY_LANG = {
    "KR": "ko", "US": "en", "JP": "ja", "TW": "zh", "SG": "en", "TH": "th",
    "VN": "vi", "IN": "en", "CA": "en", "MX": "es", "BR": "pt",
    "GB": "en", "FR": "fr", "DE": "de", "IT": "it", "ES": "es", "SE": "sv",
    "AU": "en", "AE": "en", "ZA": "en",
}

CATEGORY_KO = {
    "fashion": "패션", "products": "인기 상품", "food": "간식/음식", "entertainment": "놀이/게임",
}


def clean_name(name: str) -> str:
    """상품명 정리: 60자 이내, 불필요한 텍스트 제거"""
    # 대괄호 내용 제거 [xxx]
    name = re.sub(r'\[.*?\]', '', name).strip()
    # 수량/용량 정보 간소화
    name = re.sub(r'\s+\d+\s*(g|kg|ml|L|매|개|입|팩|세트|장|ml|oz|pk|ct)\b', '', name, flags=re.IGNORECASE)
    name = re.sub(r'\s*x\s*\d+', '', name, flags=re.IGNORECASE)
    # 불필요 접두사
    name = re.sub(r'^(eBook|ebook|CD)\s+', '', name)
    # 여러 공백 정리
    name = re.sub(r'\s+', ' ', name).strip()
    # 60자 초과 시 단어 경계에서 자르기
    if len(name) > 60:
        cut = name[:57].rsplit(' ', 1)[0]
        if len(cut) > 20:
            name = cut + '...'
        else:
            name = name[:57] + '...'
    return name


def is_wrong_category(name: str, desc: str, category: str) -> bool:
    """카테고리 오분류 체크"""
    text = (name + " " + desc).lower()
    # 글로벌 제외
    for kw in GLOBAL_EXCLUDE:
        if kw.lower() in text:
            return True
    # 카테고리별 제외
    excludes = CATEGORY_EXCLUDE.get(category, [])
    for kw in excludes:
        if kw.lower() in text:
            return True
    return False


def generate_kr_description(name: str, category: str, source: str, price: str, country_code: str,
                            rating: float = 0, reviews: int = 0, position: int = 0, heat_status: str = "") -> str:
    """한국어 설명 생성 — 검증된 트렌드 이유 + 상품 정보"""
    name_lower = name.lower()

    # 1) 상품 타입 찾기
    type_map = PRODUCT_TYPE_KR.get(category, {})
    product_type = ""
    for keyword, kr_type in type_map.items():
        if keyword.lower() in name_lower:
            product_type = kr_type
            break

    # 2) 국가+카테고리별 검증된 트렌드 컨텍스트
    trend_reason = _get_verified_trend_reason(name_lower, category, country_code, product_type)

    # 3) 인기 수치 (검증 가능한 데이터만)
    stats = ""
    if reviews >= 1000:
        stats = f"리뷰 {reviews:,}개"
    elif reviews >= 100:
        stats = f"리뷰 {reviews}개"
    if rating >= 4.5:
        stats = f"평점 {rating}" + (f", {stats}" if stats else "")

    # 4) 조합
    parts = [trend_reason]
    if stats:
        parts.append(stats)
    if source:
        parts.append(f"{source} 판매")
    if price:
        parts.append(price)

    return _clean_desc(". ".join(parts) + ".")


# ================================================================
# 검증된 트렌드 이유 (웹검색 기반, 출처: Shopify, TikTok, 日経トレンディ, Marie Claire UK 등)
# ================================================================
VERIFIED_TRENDS = {
    # === 한국 ===
    ("KR", "fashion"): "한국에서 브로치·하이넥 디테일과 커스텀 패션(크록스 꾸미기 등)이 2026 트렌드로 부상",
    ("KR", "products"): "한국에서 다이소 뷰티 매출 144% 증가 등 소용량 가성비 아이템이 인기. '나를 위한 작은 사치' 소비 트렌드",
    ("KR", "food"): "한국에서 감성 디저트와 소포장 간식이 SNS를 통해 인기. 짧고 빈번한 소비(픽셀라이프) 트렌드",
    ("KR", "entertainment"): "한국에서 커스터마이징과 DIY 취미가 MZ세대 사이에서 인기 급상승",
    # === 미국 ===
    ("US", "fashion"): "미국에서 TikTok 바이럴 패션 아이템. 캐주얼 드레스·후디·바디수트가 $10~$30 가격대로 인기",
    ("US", "products"): "미국에서 TikTok 'made me buy it' 트렌드로 바이럴된 상품. LED 프로젝터·에어프라이어 등 실용 가젯이 인기",
    ("US", "food"): "미국에서 TikTok 먹방·레시피 영상으로 바이럴된 간식. $10~$30 가격대 스낵이 소셜 미디어 통해 확산",
    ("US", "entertainment"): "미국에서 STEM 교육 장난감과 레트로 게임이 인기. 크리에이터 콘텐츠로 바이럴",
    # === 일본 ===
    ("JP", "fashion"): "일본에서 少女漫画 스타일과 뱃지·브로치 등 커스텀 액세서리가 Z세대 트렌드 (SHIBUYA109 lab. 선정)",
    ("JP", "products"): "일본에서 스프레이형 향수 자판기, 레트로 디카 등 '감성 가젯'이 인기. 편리함+감성 결합 트렌드",
    ("JP", "food"): "일본에서 コグマパン(고구마빵) 등 SNS 감성 디저트가 화제. Yahoo 2026 트렌드 예측 선정",
    ("JP", "entertainment"): "일본에서 ブラインドボックス(랜덤 박스)와 장난감 모양 코스메틱이 Z세대 사이에서 트렌드",
    # === 영국 ===
    ("GB", "fashion"): "영국에서 애슬레저(조거·레깅스·후디)가 일상 패션의 주류. TikTok에서 미니스커트·베이비티가 바이럴",
    ("GB", "products"): "영국에서 matcha·버섯커피 등 웰빙 제품과 에어퓨리파이어가 인기. 실용+라이프스타일 가치 결합 트렌드",
    ("GB", "food"): "영국에서 미국 컬트 브랜드 Poppi(프리바이오틱 소다)가 Tesco 입점하며 화제. 건강 간식 트렌드",
    ("GB", "entertainment"): "영국에서 STEM 교육 완구와 피젯 토이가 꾸준히 인기. TikTok 바이럴 캠페인이 판매 견인",
    # === 프랑스 ===
    ("FR", "fashion"): "프랑스에서 패션이 여름 구매의 41% 차지. 액세서리 검색량이 2026년 2월 최고치 기록",
    ("FR", "products"): "프랑스에서 유기농 제품 매출 30% 증가. 지속가능성과 로컬 제품 선호 트렌드",
    ("FR", "food"): "프랑스에서 프리미엄 디저트와 장인 제과가 꾸준한 인기. 럭셔리 식문화 전통",
    ("FR", "entertainment"): "프랑스에서 교육용 장난감과 크리에이티브 키트가 인기. 유럽 내 프리미엄 완구 시장 성장",
    # === 독일 ===
    ("DE", "fashion"): "독일에서 지속가능한 패션과 실용적 디자인이 트렌드. 유럽 최대 이커머스 시장",
    ("DE", "products"): "독일에서 Wero 디지털 결제 등 테크 제품 성장. 제조업 강국답게 실용 가젯이 인기",
    ("DE", "food"): "독일에서 레트로 간식과 유기농 스낵이 인기. 지속가능한 식품 소비 트렌드",
    ("DE", "entertainment"): "독일에서 교육용·크리에이티브 완구가 인기. 유럽 최대 장난감 시장 중 하나",
    # === 이탈리아 ===
    # === 이탈리아 (출처: Donna Moderna, Fanpage.it, Sky TG24 2026) ===
    ("IT", "fashion"): "이탈리아에서 맥시멀리즘(XXL 주얼리·빅숄더)과 네오 로맨티시즘이 2026 트렌드. 레트로 축구화 실루엣도 인기 (Sky TG24)",
    ("IT", "products"): "이탈리아에서 지속가능한 소재·재활용 제품이 트렌드. '인텔렉추얼 에스테틱' 라이프스타일 (Donna Moderna)",
    ("IT", "food"): "이탈리아에서 전통 장인 과자(비스코티·초콜릿)가 꾸준한 인기. 프리미엄 식문화 강국",
    ("IT", "entertainment"): "이탈리아에서 피젯 토이와 STEM 교육 키트가 인기. 크리에이티브 놀이 트렌드",
    # === 스페인 ===
    # === 스페인 (출처: Accio, Hostinger ES, Amazon ES 2026) ===
    ("ES", "fashion"): "스페인에서 주얼리 수요 폭발(2027까지 최고 성장 전망). 카고팬츠·애슬레저가 인플루언서 통해 바이럴 (Accio 2026)",
    ("ES", "products"): "스페인에서 스마트 안경·실크 보닛캡이 인기. 재사용 물병 등 친환경 제품 트렌드 (Google Trends)",
    ("ES", "food"): "스페인에서 수입 간식과 캐러멜 팝콘 등 퓨전 스낵이 젊은 층 사이에서 인기",
    ("ES", "entertainment"): "스페인에서 피젯 큐브·교육용 펜 키트 등 크리에이티브 장난감이 인기. 패들 액세서리도 트렌드",
    # === 동남아 ===
    ("SG", "fashion"): "싱가포르에서 TikTok Shop 통한 소셜 커머스 패션이 급성장. 동남아 이커머스 $230B 시장",
    ("SG", "products"): "싱가포르에서 뷰티·스킨케어가 Shopee 판매의 절반 차지. 건강·웰빙 제품 급성장",
    ("SG", "food"): "싱가포르에서 한국·일본 수입 간식이 인기. 동남아 프리미엄 간식 시장 성장",
    ("SG", "entertainment"): "싱가포르에서 일본·한국 캐릭터 굿즈와 수집용 완구가 인기",
    ("TH", "fashion"): "태국에서 소셜 커머스를 통한 패션 판매 급성장. TikTok Shop이 동남아 판매 견인",
    ("TH", "products"): "태국에서 건강·웰빙 제품이 인기. 동남아 이커머스 성장의 핵심 시장",
    ("TH", "food"): "태국에서 로컬 간식과 수입 스낵이 소셜 미디어를 통해 인기",
    ("TH", "entertainment"): "태국에서 레트로 게임기와 수집용 피규어가 젊은 층에서 인기",
    ("VN", "fashion"): "베트남에서 소셜 커머스 패션이 급성장. 동남아에서 가장 빠르게 성장하는 이커머스 시장 중 하나",
    ("VN", "products"): "베트남에서 가성비 생활용품과 뷰티 제품이 인기. Shopee·TikTok Shop 통해 확산",
    ("VN", "food"): "베트남에서 로컬 전통 간식과 수입 스낵이 함께 인기",
    ("VN", "entertainment"): "베트남에서 모바일 게임 액세서리와 수집용 완구가 젊은 층에서 인기",
    # === 인도 ===
    ("IN", "fashion"): "인도에서 전통 의상의 현대화와 캐주얼 패션이 동시에 성장. 세계에서 가장 빠르게 성장하는 패션 시장",
    ("IN", "products"): "인도에서 Make in India 정책으로 전자제품 제조 급성장. 가성비 스마트 기기가 인기",
    ("IN", "food"): "인도에서 전통 과자(미타이)와 프리미엄 간식이 밀레니얼·Z세대 사이에서 인기 급상승",
    ("IN", "entertainment"): "인도에서 STEM 교육 장난감과 DIY 키트가 교육열과 함께 인기 상승",
    # === 기타 ===
    # === 캐나다 (출처: Shopify Canada 2026, Google Trends) ===
    ("CA", "fashion"): "캐나다에서 배럴레그 진과 스웻셔츠 검색량 160% 급증. 폴드오버·플레어 레깅스가 인기 (Shopify Canada 2026)",
    ("CA", "products"): "캐나다에서 Boneless Couch 검색량 폭발. 스마트 노트북·E-ink 태블릿이 인기 (Google Trends 데이터)",
    ("CA", "food"): "캐나다에서 matcha·버섯커피 등 건강 음료와 프로틴 스낵이 웰빙 트렌드로 인기",
    ("CA", "entertainment"): "캐나다에서 Shashibo·DIY 키트 등 크리에이티브 퍼즐이 인기. 실내 취미 트렌드",
    # === 멕시코 (출처: Tiendanube, Grazia Mexico 2026) ===
    ("MX", "fashion"): "멕시코에서 크로셰·Y2K 벌룬팬츠·포레스트코어 트렌드. 선인장 가죽 등 지속가능 패션이 성장 (Grazia 2026)",
    ("MX", "products"): "멕시코에서 스마트워치·태양광 백팩·무선 이어폰이 인기. Mercado Libre 베스트셀러",
    ("MX", "food"): "멕시코에서 수입 미국 간식과 천연 에너지바가 인기. 건강 스낵 트렌드",
    ("MX", "entertainment"): "멕시코에서 Labubu·Sonny Angels 등 바이럴 수집형 피규어가 TikTok·Instagram에서 화제 (Tiendanube 2026)",
    ("BR", "fashion"): "브라질에서 오버사이즈와 캐주얼 패션이 인기. 남미 최대 패션 시장",
    ("BR", "products"): "브라질에서 Alexa·Fire TV 등 아마존 자체 브랜드 기기가 인기 급상승",
    ("BR", "food"): "브라질에서 로컬 간식과 초콜릿이 꾸준한 인기",
    ("BR", "entertainment"): "브라질에서 보드게임과 가족 단위 놀이가 인기. 남미 최대 완구 시장",
    # === 호주 (출처: Skailama, Ubuy 2026) ===
    ("AU", "fashion"): "호주에서 액티브웨어·커스텀 의류가 이커머스 $80B+ 시장 성장과 함께 인기 (Skailama 2026)",
    ("AU", "products"): "호주에서 Whoop 등 웨어러블 헬스 트래커와 스마트태그가 인기. 펫케어 시장도 급성장",
    ("AU", "food"): "호주에서 프로틴 스낵·건강 간식이 피트니스 트렌드와 함께 급성장. 이커머스 $80B 시장",
    ("AU", "entertainment"): "호주에서 스파이 키트·루빅스큐브 등 STEM·두뇌 장난감이 교육 트렌드로 인기",
    # === UAE (출처: Ubuy, 글로벌 트렌드 리포트 2026) ===
    ("AE", "fashion"): "UAE에서 오버사이즈 패션과 글로벌 럭셔리 브랜드가 인기. 중동 최대 이커머스 시장. 패들 스포츠웨어 트렌드",
    ("AE", "products"): "UAE에서 스마트 보틀·테크 가젯이 인기. 혁신 기술 수용도가 세계 최고 수준",
    ("AE", "food"): "UAE에서 수입 프리미엄 디저트와 영국·미국 간식이 다문화 소비자층에게 인기",
    ("AE", "entertainment"): "UAE에서 미니 드론·RC 등 테크 장난감이 인기. 혁신 제품에 대한 높은 관심",
    # === 남아공 (출처: TechPoint Africa, 글로벌 이커머스 2026) ===
    ("ZA", "fashion"): "남아공에서 Mr Price 등 로컬 하이스트리트 브랜드가 가성비 패션으로 인기. 아프리카 최대 이커머스 시장",
    ("ZA", "products"): "남아공에서 가성비 블루투스 기기와 스마트 보틀이 인기. 아프리카 이커머스 시장 급성장 (TechPoint Africa)",
    ("ZA", "food"): "남아공에서 수입 초콜릿·웨이퍼와 로컬 간식이 함께 인기. 글로벌 간식 트렌드 유입",
    ("ZA", "entertainment"): "남아공에서 레고·UNO 등 글로벌 브랜드 완구와 카드게임이 가족 단위로 인기",
    # === 대만 (출처: TechNews, SHOPLINE 2026 소비트렌드) ===
    ("TW", "fashion"): "대만에서 애니·IP 콜라보 패션이 80% 이상 매출 성장. 건강·웰빙과 개인화 소비 트렌드 (SHOPLINE 2026)",
    ("TW", "products"): "대만에서 건강기능식품(피쉬오일·콜라겐·프로바이오틱스)이 꾸준히 베스트셀러. '나를 위한 투자' 트렌드",
    ("TW", "food"): "대만에서 프리미엄 선물세트와 대만 전통 간식(펑리수 등)이 관광·선물 수요로 인기",
    ("TW", "entertainment"): "대만에서 애니·IP·전시회 굿즈가 80%+ 매출 성장 기록. 수집형 소비 트렌드 (TechNews 보도)",
    # === 스웨덴 (출처: Accio, Hostinger 2026 트렌드) ===
    ("SE", "fashion"): "스웨덴에서 미니멀·지속가능 패션이 트렌드. 패들 스포츠웨어가 북유럽·UAE에서 인기 급상승",
    ("SE", "products"): "스웨덴에서 스마트 노트북·E-ink 태블릿(Kindle Scribe 등)이 인기. 디지털 웰빙 트렌드",
    ("SE", "food"): "스웨덴에서 저당·비건 간식과 북유럽 전통 캔디가 건강 트렌드와 함께 인기",
    ("SE", "entertainment"): "스웨덴에서 보드게임·퍼즐 등 가족 단위 놀이가 인기. 북유럽 실내문화 (Hostinger 2026)",
}


def _get_verified_trend_reason(name_lower: str, category: str, country_code: str, product_type: str) -> str:
    """검증된 트렌드 이유 반환"""
    key = (country_code, category)
    base = VERIFIED_TRENDS.get(key, "")
    if not base:
        base = f"현재 인기 {product_type or CATEGORY_KO.get(category, '상품')}"
    return base


def _build_product_desc(name_lower: str, category: str, product_type: str, country_code: str, source: str) -> str:
    """상품이 무엇인지 설명"""
    market = {
        "KR": "국내", "US": "미국", "JP": "일본", "TW": "대만",
        "SG": "싱가포르", "TH": "태국", "VN": "베트남", "IN": "인도",
        "CA": "캐나다", "MX": "멕시코", "BR": "브라질",
        "GB": "영국", "FR": "프랑스", "DE": "독일", "IT": "이탈리아",
        "ES": "스페인", "SE": "스웨덴", "AU": "호주", "AE": "UAE", "ZA": "남아공",
    }.get(country_code, "해외")

    # 카테고리별 상세 설명 생성
    if category == "fashion":
        if product_type:
            # "니트", "원피스" 등이 있으면
            extras = []
            if ("set" in name_lower or "세트" in name_lower or "セット" in name_lower) and product_type != "세트":
                extras.append("세트")
            if "luxury" in name_lower or "premium" in name_lower or "고급" in name_lower:
                extras.append("프리미엄")
            extra = " ".join(extras)
            desc = f"{market} 인기 {product_type}" if not extra else f"{market} 인기 {extra} {product_type}"
            return _clean_desc(desc)
        return f"{market} 인기 패션 아이템"

    elif category == "food":
        if product_type:
            extras = []
            if "gift" in name_lower or "ギフト" in name_lower or "선물" in name_lower or "詰合" in name_lower:
                extras.append("선물세트")
            if "premium" in name_lower or "高級" in name_lower or "고급" in name_lower or "銀座" in name_lower:
                extras.append("프리미엄")
            if "organic" in name_lower or "오가닉" in name_lower:
                extras.append("유기농")
            extra = " ".join(extras)
            return f"{market} {extra} {product_type}".strip()

        # 일반 음식 키워드
        if any(kw in name_lower for kw in ["gift", "ギフト", "선물", "세트", "assort", "詰合", "box"]):
            return f"{market} 인기 간식 선물세트"
        return f"{market} 인기 간식"

    elif category == "products":
        if product_type:
            extras = []
            if "smart" in name_lower or "스마트" in name_lower:
                extras.append("스마트")
            if "portable" in name_lower or "휴대" in name_lower:
                extras.append("휴대용")
            if "wireless" in name_lower or "무선" in name_lower:
                extras.append("무선")
            extra = " ".join(extras)
            return f"{market} 인기 {extra} {product_type}".strip()
        if "beauty" in name_lower or "cosmetic" in name_lower or "뷰티" in name_lower or "화장" in name_lower:
            return f"{market} 인기 뷰티 아이템"
        if "kitchen" in name_lower or "주방" in name_lower or "cook" in name_lower:
            return f"{market} 인기 주방용품"
        return f"{market} 인기 생활용품"

    elif category == "entertainment":
        if product_type:
            extras = []
            if "diy" in name_lower or "만들기" in name_lower or "kit" in name_lower:
                extras.append("DIY")
            if "retro" in name_lower or "레트로" in name_lower:
                extras.append("레트로")
            if "educational" in name_lower or "교육" in name_lower or "学習" in name_lower:
                extras.append("교육용")
            extra = " ".join(extras)
            return f"{market} 인기 {extra} {product_type}".strip()
        return f"{market} 인기 놀이/취미용품"

    return f"{market} 인기 상품"


def _clean_desc(text: str) -> str:
    """설명 텍스트 정리: 중복 단어, 이중 공백 제거"""
    import re as _re
    # 이중 공백 제거
    text = _re.sub(r'\s+', ' ', text).strip()
    # 연속 중복 단어 제거 (예: "세트 세트" → "세트")
    words = text.split()
    result = [words[0]] if words else []
    for w in words[1:]:
        if w != result[-1]:
            result.append(w)
    return ' '.join(result)


# 판매처별 타겟 추정
SOURCE_TARGET = {
    # 한국
    "무신사": "10대~20대", "올리브영": "20~30대 여성", "에이블리": "10대~20대 여성",
    "지그재그": "20~30대 여성", "컬리": "30~40대", "쿠팡": "전 연령",
    "11번가": "전 연령", "G마켓": "전 연령", "SSG": "30~40대",
    # 글로벌
    "Fashion Nova": "10대~20대", "SHEIN": "10대~20대", "ASOS": "20~30대",
    "Zara": "20~30대", "H&M": "10대~30대", "Uniqlo": "전 연령",
    "Amazon": "전 연령", "Target": "전 연령", "Walmart": "전 연령",
    "Abercrombie": "20~30대", "Nike": "10대~30대", "Adidas": "10대~30대",
    "LEGO": "어린이~성인", "Nintendo": "10대~30대",
}

CATEGORY_DEFAULT_TARGET = {
    "fashion": "MZ세대", "products": "20~30대", "food": "전 연령", "entertainment": "어린이~20대",
}


def _guess_target(name_lower: str, category: str, source: str, price: str) -> str:
    """타겟 층 추정"""
    # 1. 판매처 기반
    for store, target in SOURCE_TARGET.items():
        if store.lower() in (source or "").lower():
            return target

    # 2. 상품명 키워드 기반
    kid_kw = ["kid", "child", "baby", "toy", "어린이", "유아", "아기", "키즈", "おもちゃ", "子供",
              "juguete", "jouet", "spielzeug", "brinquedo"]
    teen_kw = ["sneaker", "hoodie", "streetwear", "스트릿", "후디", "스니커즈", "ストリート"]
    women_kw = ["women", "여성", "레이디", "レディース", "femme", "damen", "donna", "mujer"]
    men_kw = ["men", "남성", "メンズ", "homme", "herren", "uomo", "hombre"]

    for kw in kid_kw:
        if kw in name_lower:
            return "어린이~10대"
    for kw in teen_kw:
        if kw in name_lower:
            return "10대~20대"
    for kw in women_kw:
        if kw in name_lower:
            return "20~30대 여성"
    for kw in men_kw:
        if kw in name_lower:
            return "20~30대 남성"

    # 3. 카테고리 기본값
    return CATEGORY_DEFAULT_TARGET.get(category, "")


def log(msg: str):
    print(f"[{datetime.now().strftime('%H:%M:%S')}] {msg}")


def escape_sql(s: str) -> str:
    if not s:
        return ""
    return s.replace("'", "''").replace("\\", "\\\\")


def main():
    log("트렌드 데이터 정리 시작")

    # JSON 로드
    json_path = OUTPUT_DIR / "serpapi_trends_v2.json"
    if not json_path.exists():
        log(f"ERROR: {json_path} 파일이 없습니다")
        return

    with open(json_path, "r", encoding="utf-8") as f:
        trends = json.load(f)

    log(f"원본: {len(trends)}개 상품")

    # 정리
    cleaned = []
    removed_count = 0
    for t in trends:
        name = t["name"]
        category = t["category_slug"]
        desc = t.get("description", "")

        # 1. 카테고리 오분류 필터링
        if is_wrong_category(name, desc, category):
            removed_count += 1
            continue

        # 2. 상품명 정리
        clean = clean_name(name)
        if len(clean) < 3:
            removed_count += 1
            continue

        # 3. 태그에서 가격/소스/평점 추출
        price = ""
        source = ""
        rating = 0.0
        reviews = 0
        for tag in t.get("tags", []):
            if re.search(r'[$\u20A9\u00A5\u00A3\u20AC\u0E3F\u20B9]|AED|R\$|kr|R\s', tag):
                price = tag
            elif tag.startswith('★'):
                try:
                    rating = float(tag.replace('★', ''))
                except ValueError:
                    pass
            else:
                source = tag

        # 원본 description에서 리뷰 수 추출
        rev_match = re.search(r'리뷰:\s*([\d,]+)', t.get("description", ""))
        if rev_match:
            reviews = int(rev_match.group(1).replace(',', ''))

        # heat_score에서 대략적인 position 추정
        position = max(1, 11 - t.get("heat_score", 50) // 10)

        # 4. 한국어 설명 생성
        kr_desc = generate_kr_description(
            clean, category, source, price, t["country_code"],
            rating=rating, reviews=reviews, position=position, heat_status=t.get("heat_status", "")
        )

        t["name"] = clean
        t["description"] = kr_desc
        cleaned.append(t)

    # 중복 제거 (같은 국가 + 같은 이름)
    seen = set()
    deduped = []
    dup_count = 0
    for t in cleaned:
        key = f"{t['country_code']}|{t['name'].lower()}"
        if key in seen:
            dup_count += 1
            continue
        seen.add(key)
        deduped.append(t)
    cleaned = deduped

    log(f"정리 후: {len(cleaned)}개 상품 (카테고리 오분류 제거: {removed_count}개, 중복 제거: {dup_count}개)")

    # 국가별 통계
    country_counts = {}
    for t in cleaned:
        cc = t["country_code"]
        country_counts[cc] = country_counts.get(cc, 0) + 1
    for cc, cnt in sorted(country_counts.items()):
        log(f"  {cc}: {cnt}개")

    # SQL 생성
    now = datetime.now(timezone.utc)
    sql = []
    sql.append(f"-- MONTRA 정리된 상품 데이터")
    sql.append(f"-- {now.strftime('%Y-%m-%d %H:%M UTC')} | {len(cleaned)}개 상품\n")

    sql.append("TRUNCATE trend_history CASCADE;")
    sql.append("TRUNCATE trends CASCADE;")
    sql.append("DELETE FROM categories;")
    sql.append("DELETE FROM countries;\n")

    sql.append("ALTER TABLE categories DROP CONSTRAINT IF EXISTS categories_slug_check;")
    sql.append("ALTER TABLE countries DROP CONSTRAINT IF EXISTS countries_region_check;\n")

    # 카테고리
    categories = [
        ("fashion", "옷", "Fashion", "👗"),
        ("products", "상품", "Products", "🛍️"),
        ("food", "음식", "Food", "🍽️"),
        ("entertainment", "놀이", "Entertainment", "🎮"),
    ]
    for i, (slug, ko, en, emoji) in enumerate(categories, 1):
        sql.append(f"INSERT INTO categories (slug, name_ko, name_en, emoji, sort_order) VALUES ('{slug}', '{ko}', '{en}', '{emoji}', {i});")
    sql.append("")

    # 국가 (JSON에서 고유 국가 추출)
    countries_data = [
        ("KR", "한국", "South Korea", "🇰🇷", "asia", "east_asia"),
        ("JP", "일본", "Japan", "🇯🇵", "asia", "east_asia"),
        ("TW", "대만", "Taiwan", "🇹🇼", "asia", "east_asia"),
        ("SG", "싱가포르", "Singapore", "🇸🇬", "asia", "southeast_asia"),
        ("TH", "태국", "Thailand", "🇹🇭", "asia", "southeast_asia"),
        ("VN", "베트남", "Vietnam", "🇻🇳", "asia", "southeast_asia"),
        ("IN", "인도", "India", "🇮🇳", "asia", "south_asia"),
        ("US", "미국", "United States", "🇺🇸", "americas", "north_america"),
        ("CA", "캐나다", "Canada", "🇨🇦", "americas", "north_america"),
        ("MX", "멕시코", "Mexico", "🇲🇽", "americas", "latin_america"),
        ("BR", "브라질", "Brazil", "🇧🇷", "americas", "latin_america"),
        ("GB", "영국", "United Kingdom", "🇬🇧", "europe", "west_europe"),
        ("FR", "프랑스", "France", "🇫🇷", "europe", "west_europe"),
        ("DE", "독일", "Germany", "🇩🇪", "europe", "west_europe"),
        ("IT", "이탈리아", "Italy", "🇮🇹", "europe", "west_europe"),
        ("ES", "스페인", "Spain", "🇪🇸", "europe", "west_europe"),
        ("SE", "스웨덴", "Sweden", "🇸🇪", "europe", "north_europe"),
        ("AU", "호주", "Australia", "🇦🇺", "oceania", "oceania"),
        ("AE", "UAE", "United Arab Emirates", "🇦🇪", "middle_east", "middle_east"),
        ("ZA", "남아공", "South Africa", "🇿🇦", "africa", "africa"),
    ]
    for code, ko, en, flag, region, sub in countries_data:
        sql.append(f"INSERT INTO countries (code, name_ko, name_en, flag_emoji, region, sub_region, is_active) VALUES ('{code}', '{ko}', '{en}', '{flag}', '{region}', '{sub}', true);")
    sql.append("")

    sql.append("ALTER TABLE categories ADD CONSTRAINT categories_slug_check CHECK (slug IN ('fashion','products','food','entertainment'));")
    sql.append("ALTER TABLE countries ADD CONSTRAINT countries_region_check CHECK (region IN ('asia','europe','americas','middle_east','africa','oceania'));\n")

    # 트렌드
    for t in cleaned:
        tags_sql = "ARRAY[" + ",".join(f"'{escape_sql(tg)}'" for tg in t.get("tags", [])[:5]) + "]"
        src_sql = "ARRAY[" + ",".join(f"'{escape_sql(u)}'" for u in t.get("source_urls", [])) + "]" if t.get("source_urls") else "ARRAY[]::text[]"
        img_sql = f"'{escape_sql(t.get('image_url', ''))}'" if t.get("image_url") else "NULL"

        sql.append(
            f"INSERT INTO trends (country_id, category_id, name, description, image_url, "
            f"heat_score, heat_status, search_score, social_score, ecommerce_score, news_score, "
            f"tags, source_urls, first_detected_at, last_updated_at) VALUES ("
            f"(SELECT id FROM countries WHERE code='{t['country_code']}'), "
            f"(SELECT id FROM categories WHERE slug='{t['category_slug']}'), "
            f"'{escape_sql(t['name'])}', '{escape_sql(t['description'])}', {img_sql}, "
            f"{t['heat_score']}, '{t['heat_status']}', "
            f"{t.get('search_score',0)}, {t.get('social_score',0)}, {t.get('ecommerce_score',0)}, {t.get('news_score',0)}, "
            f"{tags_sql}, {src_sql}, "
            f"'{t['first_detected_at']}', '{t['last_updated_at']}');"
        )

    # 저장
    sql_path = OUTPUT_DIR / "serpapi_trends_clean.sql"
    with open(sql_path, "w", encoding="utf-8") as f:
        f.write("\n".join(sql))
    log(f"SQL: {sql_path}")

    # 정리된 JSON도 저장
    json_out = OUTPUT_DIR / "serpapi_trends_clean.json"
    with open(json_out, "w", encoding="utf-8") as f:
        json.dump(cleaned, f, ensure_ascii=False, indent=2)
    log(f"JSON: {json_out}")

    # 샘플 출력
    log("\n--- 샘플 (카테고리별 3개) ---")
    for cat in ["fashion", "products", "food", "entertainment"]:
        items = [t for t in cleaned if t["category_slug"] == cat][:3]
        log(f"\n[{cat}]")
        for t in items:
            log(f"  {t['country_code']} | {t['name'][:45]:45s} | {t['description']}")


if __name__ == "__main__":
    main()
