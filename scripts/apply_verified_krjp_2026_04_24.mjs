import { readFileSync, writeFileSync } from "fs";
import pg from "pg";

const WINDOW_DATE = "2026-04-24";
const TARGET_COUNTRIES = ["KR", "JP"];
const FULL_SQL = "scripts/output/verified_KRJP_full_ko_2026-04-24.sql";

const countries = {
  KR: ["2ac73bcd-2a75-47b1-a9f4-dc3171c9d4c2", "한국", "South Korea", "대한민국", "🇰🇷", "asia", "East Asia", "Asia/Seoul", "ko-KR", "Coupang", "Instagram"],
  JP: ["a2ff70c1-321e-4960-8220-8fe265c8dc0a", "일본", "Japan", "日本", "🇯🇵", "asia", "East Asia", "Asia/Tokyo", "ja-JP", "Rakuten", "X"],
};

const categoryIds = {
  brands: "47d77b6d-3c38-4861-ac3a-1dfe04277da5",
  challenge: "395a5576-8c5e-40a6-a965-28ead697a232",
  fashion: "98561c59-d4db-41d7-b7e6-545614e37e87",
  food: "989c0361-82f8-4805-a4b1-285a7ee420de",
  products: "faba0b6a-bbbe-4eb6-8035-23c7e5b2a61b",
};

const source = {
  kr29cmRise: "https://www.29cm.co.kr/content/highlight/2026/04/20/6th?cache=true",
  kr29cmPuma: "https://www.29cm.co.kr/content/focus/2026/04/15/puma",
  kr29cmReTheMitten: "https://www.29cm.co.kr/content/highlight/2026/04/20/4th?cache=true",
  krKiehls: "https://fashionbiz.co.kr/article/224850",
  krAromatica: "https://news.nate.com/view/20260416n15736",
  krChilsung: "https://biz.chosun.com/distribution/food/2026/04/01/MHERSP6EMJH57GBG5GJNTXJU6E/?outputType=amp",
  krLipton: "https://www.g-enews.com/article/Distribution/2026/04/202604161032018687740eacf404_1",
  krPringles: "https://www.fnnews.com/news/202604170838552191",
  krRoyalCrab: "https://news.nate.com/view/20260416n26501",
  krDreame: "https://biz.chosun.com/it-science/ict/2026/04/15/CESGYQU6JJEATMFCF3FVBX7KFE/?outputType=amp",
  krKworb: "https://kworb.net/spotify/country/kr_daily.html",
  jpStarbucks: "https://www.fashion-press.net/news/145134",
  jpKinotake: "https://www.fashion-press.net/news/145151",
  jpSlime: "https://www.fashion-press.net/news/145108",
  jpHaruta: "https://www.fashion-press.net/news/143588",
  jpAdidasAdam: "https://www.fashion-press.net/news/145399",
  jpConversePinkhouse: "https://www.fashion-press.net/news/144511",
  jpCasseliniHanky: "https://www.fashion-press.net/news/145272",
  jpBonaventura: "https://jp.bonaventura.shop/en/blogs/news/shop-news-kisarazu-outlet",
  jpAnnaSui: "https://www.fashion-press.net/news/142486",
  jpMaquillage: "https://www.fashion-press.net/news/143819",
  jpJill: "https://www.fashion-press.net/news/140960",
  jpKworb: "https://kworb.net/spotify/country/jp_daily.html",
};

const records = [];

function rec(country, category, name, nameLocal, description, tags, sourceUrls, heatScore, heatStatus = "rising", scores = {}) {
  return {
    country,
    category,
    name,
    name_local: nameLocal,
    description,
    heat_score: heatScore,
    heat_status: heatStatus,
    search_score: scores.search ?? Math.max(60, heatScore - 10),
    social_score: scores.social ?? Math.max(60, heatScore - 5),
    ecommerce_score: scores.ecommerce ?? (category === "challenge" ? 8 : Math.max(60, heatScore - 4)),
    news_score: scores.news ?? Math.max(58, heatScore - 8),
    tags: ["weekly-research", "verified", "ko-copy", WINDOW_DATE, ...tags],
    source_urls: sourceUrls,
    first_detected_at: `${WINDOW_DATE}T00:00:00.000Z`,
    last_updated_at: `${WINDOW_DATE}T00:00:00.000Z`,
  };
}

function add(country, category, rows) {
  for (const row of rows) {
    records.push(rec(
      country,
      category,
      row.name,
      row.local,
      row.desc,
      [country.toLowerCase(), category, ...row.tags],
      row.urls,
      row.heat,
      row.status ?? "rising",
      row.scores ?? {},
    ));
  }
}

// DATA_BLOCKS_START
add("KR", "food", [
  {
    name: "칠성사이다 제로 유자",
    local: "칠성사이다 제로 유자",
    desc: "4월 들어 출시된 제로 유자 탄산으로, 기존 칠성사이다 제로 라인업을 넓히며 편의점과 대형마트 진열에서 바로 눈에 띄는 신상 음료 축에 들어갔다.",
    tags: ["lotte-chilsung", "zero-soda", "yuja"],
    urls: [source.krChilsung],
    heat: 87,
    status: "new",
  },
  {
    name: "립톤 제로 복숭아 스파클링",
    local: "립톤 제로 복숭아 스파클링",
    desc: "4월 16일 공개된 스파클링 아이스티 신제품으로, 제로 슈거와 복숭아 풍미 조합이 붙으면서 한국 음료 신상품 큐에서 반응이 빠르게 붙는 타입으로 보였다.",
    tags: ["lipton", "iced-tea", "sparkling"],
    urls: [source.krLipton],
    heat: 90,
    status: "new",
  },
  {
    name: "프링글스 하트 미니로즈",
    local: "프링글스 하트 미니로즈",
    desc: "한국 단독 선출시와 하트 모양이라는 강한 비주얼 포인트 덕분에 4월 중순 스낵 신상품 가운데 화제성이 특히 높은 편으로 잡혔다.",
    tags: ["pringles", "snack", "limited"],
    urls: [source.krPringles],
    heat: 91,
    status: "new",
  },
  {
    name: "로얄크랩 디핑",
    local: "로얄크랩 디핑",
    desc: "사조대림이 로얄크랩 확장형 제품군으로 같이 언급한 신제품으로, 전용 소스를 붙인 간편식 스타일이 건강 지향 간식 흐름과 함께 다시 부각됐다.",
    tags: ["sajo-daerim", "surimi", "dipping"],
    urls: [source.krRoyalCrab],
    heat: 82,
    status: "new",
  },
  {
    name: "로얄크랩 밸런스",
    local: "로얄크랩 밸런스",
    desc: "영양 설계를 강화한 확장 제품으로 기사에서 별도 언급되면서, 한국 가공식품 시장의 고단백 간식 수요에 맞춘 파생 라인으로 읽혔다.",
    tags: ["sajo-daerim", "surimi", "protein"],
    urls: [source.krRoyalCrab],
    heat: 80,
    status: "new",
  },
]);

add("KR", "fashion", [
  {
    name: "ODS Tencel Silky Shirts",
    local: "오디에스 텐셀 실키 셔츠",
    desc: "29CM 4월 20~26일 라이징 브랜드 하이라이트에서 전면 추천된 셔츠로, 봄에서 초여름으로 넘어가는 시기 출근룩 수요에 잘 맞는 아이템으로 밀리고 있다.",
    tags: ["29cm", "shirt", "office-look"],
    urls: [source.kr29cmRise],
    heat: 86,
    status: "new",
  },
  {
    name: "THE APERTURE Over Cotton Shirt Ivory",
    local: "디애퍼처 오버 코튼 셔츠 아이보리",
    desc: "워싱 코튼과 박시 실루엣을 앞세운 29CM 추천 상품으로, 가볍게 걸치는 한국 봄 셔츠 수요를 정면으로 받은 모델이다.",
    tags: ["29cm", "shirt", "minimal"],
    urls: [source.kr29cmRise],
    heat: 84,
    status: "new",
  },
  {
    name: "SO IR Shirring Sheer Blouse",
    local: "쏘이르 셔링 시어 블라우스",
    desc: "오프숄더까지 연출 가능한 블라우스로 소개되면서, 이번 주 한국 여성복 쪽에서 시어 소재와 페미닌 무드가 계속 강하다는 신호를 보여줬다.",
    tags: ["29cm", "blouse", "sheer"],
    urls: [source.kr29cmRise],
    heat: 85,
    status: "new",
  },
  {
    name: "PUMA Bella V Blush",
    local: "푸마 벨라 V 블러쉬",
    desc: "29CM 전용 컬러와 포토리뷰 이벤트까지 같이 붙은 로우 프로파일 스니커즈로, 한국 데일리 슈즈 수요에 맞는 푸마 신상으로 밀렸다.",
    tags: ["29cm", "puma", "sneakers"],
    urls: [source.kr29cmPuma],
    heat: 88,
    status: "new",
  },
  {
    name: "RE_L Oly lace H skirt",
    local: "리엘 올리 레이스 H 스커트",
    desc: "29CM 하이라이트에서 여성스러운 실키 라인 아이템으로 전면 배치돼, 이번 주 한국 여성복 쪽 미디 스커트 수요를 대표하는 제품으로 보였다.",
    tags: ["29cm", "skirt", "feminine"],
    urls: [source.kr29cmReTheMitten],
    heat: 83,
    status: "new",
  },
]);

add("KR", "brands", [
  {
    name: "ODS",
    local: "오디에스",
    desc: "29CM 라이징 브랜드 하이라이트에서 출근룩 키워드와 함께 전면 노출되며, 한국 미니멀 셔츠 브랜드 중 이번 주 주목도가 올라간 이름으로 보였다.",
    tags: ["29cm", "fashion-brand", "minimal"],
    urls: [source.kr29cmRise],
    heat: 84,
    status: "new",
  },
  {
    name: "THE APERTURE",
    local: "디애퍼처",
    desc: "29CM 하이라이트에 무제 컬렉션과 함께 걸리면서, 90년대 미니멀 감성 계열 한국 셀렉트 수요에 다시 붙는 브랜드로 잡혔다.",
    tags: ["29cm", "fashion-brand", "minimal"],
    urls: [source.kr29cmRise],
    heat: 83,
    status: "new",
  },
  {
    name: "SO IR",
    local: "쏘이르",
    desc: "클래식하고 페미닌한 무드의 라이징 브랜드로 29CM 메인 하이라이트에 올라, 이번 주 여성복 큐에서 가시성이 크게 높아졌다.",
    tags: ["29cm", "fashion-brand", "feminine"],
    urls: [source.kr29cmRise],
    heat: 82,
    status: "new",
  },
  {
    name: "PUMA",
    local: "푸마",
    desc: "29CM 단독 컬러와 리뷰 이벤트를 동반한 포커스 페이지가 열리면서, 한국 스니커즈 쇼핑 문맥에서 다시 존재감이 커졌다.",
    tags: ["29cm", "sports-brand", "sneakers"],
    urls: [source.kr29cmPuma],
    heat: 86,
    status: "new",
  },
  {
    name: "AROMATICA",
    local: "아로마티카",
    desc: "북촌 플래그십 오픈을 계기로 K-웰니스 체험 공간이라는 메시지가 강화되면서, 이번 주 한국 뷰티 브랜드 중 체험형 관심도가 두드러졌다.",
    tags: ["wellness-brand", "flagship", "bukchon"],
    urls: [source.krAromatica],
    heat: 81,
    status: "new",
  },
]);

add("KR", "products", [
  {
    name: "Kiehl's Panthenol Med Cream",
    local: "키엘 판테놀 함유 메디크림",
    desc: "성수 팝업의 메인 신제품으로 직접 체험 동선까지 묶여 노출되면서, 이번 주 한국 더마 보습 제품 가운데 가장 선명한 신상 축 중 하나였다.",
    tags: ["kiehls", "skincare", "popup"],
    urls: [source.krKiehls],
    heat: 88,
    status: "new",
  },
  {
    name: "Kiehl's Collagen Sun Serum",
    local: "키엘 콜라겐 선세럼",
    desc: "같은 성수 팝업에서 별도 체험존이 잡힌 제품으로, 봄철 선케어와 탄력 케어를 한 번에 보려는 한국 수요와 맞물렸다.",
    tags: ["kiehls", "sun-care", "popup"],
    urls: [source.krKiehls],
    heat: 86,
    status: "new",
  },
  {
    name: "Dreame C10 Water Purifier",
    local: "드리미 C10 정수기",
    desc: "4월 15일 한국 출시 기사와 함께 와디즈 선공개 일정이 붙으면서, 무설치형 프리미엄 소형가전 신상으로 빠르게 주목을 받았다.",
    tags: ["dreame", "appliance", "water-purifier"],
    urls: [source.krDreame],
    heat: 84,
    status: "new",
  },
  {
    name: "PUMA Bella V Blush",
    local: "푸마 벨라 V 블러쉬",
    desc: "단독 컬러와 리뷰 이벤트가 같이 걸린 제품이라 브랜드 단위보다 상품 단위 반응을 보기 쉬운 케이스였다. 이번 주 한국 로우 프로파일 스니커즈 관심도를 대표한다.",
    tags: ["puma", "sneakers", "exclusive"],
    urls: [source.kr29cmPuma],
    heat: 87,
    status: "new",
  },
  {
    name: "THE MITTEN Hatto hoodie jacket",
    local: "더미튼 하토 후디 재킷",
    desc: "29CM 하이라이트에서 체크 패턴과 후드 자켓 조합으로 추천되며, 간절기 캐주얼 아우터 수요를 받는 제품으로 노출됐다.",
    tags: ["29cm", "outerwear", "hoodie-jacket"],
    urls: [source.kr29cmReTheMitten],
    heat: 82,
    status: "new",
  },
]);

add("KR", "challenge", [
  {
    name: "AKMU - Paradise of Rumors",
    local: "악뮤 - 소문의 낙원",
    desc: "4월 22일 기준 한국 Spotify 일간 차트 1위 곡으로, 이번 주 국내 숏폼 배경음과 리스닝 양쪽에서 존재감이 가장 높게 잡힌다.",
    tags: ["spotify", "music", "kworb"],
    urls: [source.krKworb],
    heat: 92,
    status: "rising",
    scores: { search: 85, social: 95, ecommerce: 8, news: 67 },
  },
  {
    name: "Jung Kook - Seven",
    local: "정국 - Seven",
    desc: "오래된 곡이지만 이번 주 한국 일간 차트에서 다시 급반등해 상위권을 차지하면서, 챌린지용 재사용 오디오로 다시 힘이 붙은 흐름이다.",
    tags: ["spotify", "music", "kworb"],
    urls: [source.krKworb],
    heat: 89,
    status: "rising",
    scores: { search: 82, social: 93, ecommerce: 8, news: 65 },
  },
  {
    name: "HANRORO - 0+0",
    local: "한로로 - 0+0",
    desc: "한국 일간 차트 상위권을 유지하는 곡으로, 감성적인 숏폼과 브이로그 배경음에서 계속 재활용되기 좋은 타입의 오디오다.",
    tags: ["spotify", "music", "kworb"],
    urls: [source.krKworb],
    heat: 88,
    status: "rising",
    scores: { search: 80, social: 91, ecommerce: 8, news: 64 },
  },
  {
    name: "AKMU - Joy, Sorrow, A Beautiful Heart",
    local: "악뮤 - 기쁨과 슬픔, 그리고 아름다운 마음",
    desc: "동일 아티스트 신곡군이 동시에 상위권에 올라 있는 패턴이라, 이번 주 한국 음악 소비가 AKMU 신작 쪽으로 몰려 있다는 신호가 분명하다.",
    tags: ["spotify", "music", "kworb"],
    urls: [source.krKworb],
    heat: 87,
    status: "rising",
    scores: { search: 79, social: 90, ecommerce: 8, news: 63 },
  },
  {
    name: "Hearts2Hearts - RUDE!",
    local: "Hearts2Hearts - RUDE!",
    desc: "걸그룹 곡 가운데 이번 주에도 상위권을 유지해, 안무 클립과 하이라이트 편집에 계속 붙는 배경음 후보로 남아 있다.",
    tags: ["spotify", "music", "kworb"],
    urls: [source.krKworb],
    heat: 85,
    status: "rising",
    scores: { search: 77, social: 89, ecommerce: 8, news: 62 },
  },
]);

add("JP", "food", [
  {
    name: "Blueberry Rare Cheesecake",
    local: "ブルーベリーレアチーズケーキ",
    desc: "스타벅스 재팬의 4월 봄 푸드 라인업 핵심 디저트로, 블루베리 과육을 전면에 내세운 비주얼이 강해서 이번 주 일본 카페 신상 쪽에서 반응이 좋다.",
    tags: ["starbucks", "dessert", "spring-food"],
    urls: [source.jpStarbucks],
    heat: 88,
    status: "new",
  },
  {
    name: "Blueberry Scone",
    local: "ブルーベリースコーン",
    desc: "같은 스타벅스 봄 푸드 라인업에서 함께 공개된 베이커리로, 블루베리 시즌감이 명확해 일본 카페 간식 수요에 바로 붙는다.",
    tags: ["starbucks", "bakery", "spring-food"],
    urls: [source.jpStarbucks],
    heat: 84,
    status: "new",
  },
  {
    name: "An Butter Scone Sandwich",
    local: "あんバタースコーンサンド",
    desc: "단팥과 버터 조합을 스콘 샌드 형태로 풀어낸 메뉴로, 일본식 단짠 베이커리 취향을 건드리며 이번 주 화제성이 높다.",
    tags: ["starbucks", "bakery", "an-butter"],
    urls: [source.jpStarbucks],
    heat: 85,
    status: "new",
  },
  {
    name: "Kitakita Konokono Kono Yamazato",
    local: "きたきたのこのこの山里",
    desc: "메이지의 대표 스낵 두 라인을 합친 한정 신상품으로, 4월 14일 전국 출시 이후 일본 과자 화제 목록에서 빠지지 않는 이름이다.",
    tags: ["meiji", "snack", "limited"],
    urls: [source.jpKinotake],
    heat: 90,
    status: "new",
  },
  {
    name: "Slime Manju",
    local: "スライムまんじゅう",
    desc: "드래곤퀘스트 워크 협업 화과자로 4월 17일부터 판매가 시작돼, 일본 캐릭터 푸드 신상 가운데 사진 반응이 특히 좋은 편이다.",
    tags: ["aoyagi", "collab", "wagashi"],
    urls: [source.jpSlime],
    heat: 86,
    status: "new",
  },
]);

add("JP", "fashion", [
  {
    name: "HARUTA x Casselini Ribbon Detail Loafer",
    local: "ハルタ×キャセリーニ リボンディテールローファー",
    desc: "4월 24일 발매되는 협업 로퍼로, 일본 쪽에서 러블리한 디테일을 더한 클래식 슈즈 수요를 대표하는 신상으로 잡혔다.",
    tags: ["haruta", "casselini", "loafer"],
    urls: [source.jpHaruta],
    heat: 87,
    status: "new",
  },
  {
    name: "HARUTA x Casselini White Stitch Platform Loafer",
    local: "ハルタ×キャセリーニ ホワイトステッチ厚底ローファー",
    desc: "같은 협업 기사에서 같이 소개된 두꺼운 밑창 로퍼로, 단정한 로퍼 실루엣에 볼륨감을 붙인 일본식 스쿨룩 변형 수요와 잘 맞는다.",
    tags: ["haruta", "casselini", "loafer"],
    urls: [source.jpHaruta],
    heat: 84,
    status: "new",
  },
  {
    name: "adidas Originals Handball Spezial",
    local: "アディダス オリジナルス ハンドボール スペツィアル",
    desc: "아담 엣 로페 한정 컬러로 4월 24일 발매되는 모노톤 스니커즈라, 이번 주 일본 셀렉트숍 스니커즈 쪽 핵심 화제 상품으로 보인다.",
    tags: ["adidas", "adam-et-rope", "sneakers"],
    urls: [source.jpAdidasAdam],
    heat: 89,
    status: "new",
  },
  {
    name: "Converse x PINK HOUSE Flower Check Sneakers",
    local: "コンバース×ピンクハウス フラワーチェック柄スニーカー",
    desc: "꽃무늬 체크 패턴과 올스타 HI 조합으로 풀린 협업 스니커즈라, 일본식 가리시 룩과 빈티지 무드 소비층이 같이 반응할 만한 제품이다.",
    tags: ["converse", "pink-house", "sneakers"],
    urls: [source.jpConversePinkhouse],
    heat: 85,
    status: "new",
  },
  {
    name: "hanky panky x Casselini Signature Lace Classic Camisole",
    local: "キャセリーニ×ハンキーパンキー シグネチャーレース クラシックキャミソール",
    desc: "4월 10일 나온 협업 캐미솔로, 핑크 레이스를 전면에 세운 란제리 겸 레이어드 웨어 흐름이 이번 봄 일본 패션 기사에서 계속 반복되고 있다.",
    tags: ["casselini", "hanky-panky", "camisole"],
    urls: [source.jpCasseliniHanky],
    heat: 82,
    status: "new",
  },
]);

add("JP", "brands", [
  {
    name: "Starbucks Coffee Japan",
    local: "スターバックス コーヒー ジャパン",
    desc: "4월 봄 푸드 라인업이 한꺼번에 공개되며, 일본 카페 신상 화제의 중심을 다시 스타벅스가 가져가는 흐름이 보였다.",
    tags: ["coffee-brand", "food-launch", "spring"],
    urls: [source.jpStarbucks],
    heat: 86,
    status: "new",
  },
  {
    name: "adidas Originals",
    local: "アディダス オリジナルス",
    desc: "아담 엣 로페 한정 핸드볼 스페지알 발매 일정이 붙으면서, 일본 스니커즈 커뮤니티 쪽에서 다시 전면으로 올라온 브랜드다.",
    tags: ["sports-brand", "sneakers", "collaboration"],
    urls: [source.jpAdidasAdam],
    heat: 85,
    status: "new",
  },
  {
    name: "HARUTA",
    local: "ハルタ",
    desc: "캐세리니와의 4월 24일 협업 로퍼 출시로, 일본식 클래식 슈즈 브랜드 중 이번 주 화제성이 특히 선명한 편이다.",
    tags: ["shoe-brand", "loafer", "collaboration"],
    urls: [source.jpHaruta],
    heat: 83,
    status: "new",
  },
  {
    name: "Casselini",
    local: "キャセリーニ",
    desc: "HARUTA 협업 로퍼와 hanky panky 협업 레이스 제품이 연달아 노출되며, 일본 여성 패션 소품 브랜드 중 존재감이 다시 커졌다.",
    tags: ["fashion-brand", "accessories", "collaboration"],
    urls: [source.jpHaruta, source.jpCasseliniHanky],
    heat: 84,
    status: "new",
  },
  {
    name: "BONAVENTURA",
    local: "ボナベンチュラ",
    desc: "4월 24일 기사라즈 아웃렛 신규 점포 오픈과 골든위크 한정 프로모션이 같이 붙으면서, 일본 레더 굿즈 브랜드 관심도가 올라갔다.",
    tags: ["leather-brand", "outlet", "gw"],
    urls: [source.jpBonaventura],
    heat: 82,
    status: "new",
  },
]);

add("JP", "products", [
  {
    name: "JILL STUART Petit Patisserie Lip Blossom Balm 104",
    local: "ジルスチュアート プチパティスリー リップブロッサム バーム 104",
    desc: "4월 17일 출시된 한정 립밤으로, 스트로베리 쿠키를 닮은 컬러와 패키지가 일본 봄 메이크업 기사에서 반복적으로 잡히는 제품이다.",
    tags: ["jill-stuart", "lip-balm", "limited"],
    urls: [source.jpJill],
    heat: 86,
    status: "new",
  },
  {
    name: "JILL STUART Petit Patisserie Lip Blossom Balm 105",
    local: "ジルスチュアート プチパティスリー リップブロッサム バーム 105",
    desc: "같은 한정 시리즈의 브라운 톤 립밤으로, 디저트 착상의 컬러 메이크업 흐름을 그대로 보여주는 일본 한정 코스메틱 상품이다.",
    tags: ["jill-stuart", "lip-balm", "limited"],
    urls: [source.jpJill],
    heat: 84,
    status: "new",
  },
  {
    name: "ANNA SUI Liquid Eye Color 101",
    local: "アナ スイ リキッド アイカラー 101",
    desc: "4월 17일 예약이 시작된 여름 신색 중 하나로, 밤하늘 블루 톤의 글리터 아이 메이크업 수요를 대표하는 제품으로 보였다.",
    tags: ["anna-sui", "eye-makeup", "summer"],
    urls: [source.jpAnnaSui],
    heat: 85,
    status: "new",
  },
  {
    name: "ANNA SUI Liquid Eye Color 901",
    local: "アナ スイ リキッド アイカラー 901",
    desc: "편광 카멜레온 쿼츠 컬러를 내세운 신색으로, 일본 뷰티 기사에서 Y3K 느낌의 반짝이는 아이 메이크업 축으로 묶여 노출됐다.",
    tags: ["anna-sui", "eye-makeup", "summer"],
    urls: [source.jpAnnaSui],
    heat: 84,
    status: "new",
  },
  {
    name: "MAQuillAGE Dramatic Skin Sensor Base NEO Cool",
    local: "マキアージュ ドラマティックスキンセンサーベース NEO クール",
    desc: "4월 21일 한정 출시된 쿨 타입 베이스로, 여름 직전 일본 베이스 메이크업 기사에서 가장 선명하게 잡히는 프라이머 신상이다.",
    tags: ["maquillage", "primer", "summer"],
    urls: [source.jpMaquillage],
    heat: 87,
    status: "new",
  },
]);

add("JP", "challenge", [
  {
    name: "M!LK - 爆裂愛してる",
    local: "M!LK - 爆裂愛してる",
    desc: "4월 22일 기준 일본 Spotify 일간 차트 1위 곡으로, 이번 주 일본 숏폼과 팬덤 소비를 동시에 끌고 가는 핵심 오디오다.",
    tags: ["spotify", "music", "kworb"],
    urls: [source.jpKworb],
    heat: 93,
    status: "rising",
    scores: { search: 86, social: 96, ecommerce: 8, news: 69 },
  },
  {
    name: "Kenshi Yonezu - IRIS OUT",
    local: "米津玄師 - IRIS OUT",
    desc: "일본 일간 차트 최상위권을 안정적으로 유지하는 곡이라, 챌린지보다는 배경음과 팬 편집 양쪽에서 강하게 쓰이는 흐름이다.",
    tags: ["spotify", "music", "kworb"],
    urls: [source.jpKworb],
    heat: 90,
    status: "rising",
    scores: { search: 83, social: 93, ecommerce: 8, news: 67 },
  },
  {
    name: "Mrs. GREEN APPLE - lulu.",
    local: "Mrs. GREEN APPLE - lulu.",
    desc: "일본 스트리밍 차트 상위권을 계속 지키는 곡으로, 짧은 감성 클립과 일상형 영상 배경음에 다시 붙기 좋은 타입이다.",
    tags: ["spotify", "music", "kworb"],
    urls: [source.jpKworb],
    heat: 88,
    status: "rising",
    scores: { search: 81, social: 91, ecommerce: 8, news: 65 },
  },
  {
    name: "BTS - SWIM",
    local: "BTS - SWIM",
    desc: "일본 차트 상위권에서 계속 유지되며, 글로벌 팬덤 기반 숏폼 오디오가 일본 안에서도 강하게 먹히는 패턴을 보여준다.",
    tags: ["spotify", "music", "kworb"],
    urls: [source.jpKworb],
    heat: 87,
    status: "rising",
    scores: { search: 80, social: 92, ecommerce: 8, news: 64 },
  },
  {
    name: "King Gnu - AIZO",
    local: "King Gnu - AIZO",
    desc: "일본 일간 차트 5위권을 지키는 곡으로, 무드 편집형 영상과 강한 보컬 중심 숏폼에서 계속 쓰일 여지가 큰 오디오다.",
    tags: ["spotify", "music", "kworb"],
    urls: [source.jpKworb],
    heat: 85,
    status: "rising",
    scores: { search: 78, social: 89, ecommerce: 8, news: 63 },
  },
]);
// DATA_BLOCKS_END

function loadEnv() {
  const env = {};
  for (const line of readFileSync(".env.local", "utf8").split(/\r?\n/)) {
    const index = line.indexOf("=");
    if (index <= 0) continue;
    env[line.slice(0, index).trim()] = line.slice(index + 1).trim();
  }
  return env;
}

function q(value) {
  if (value === null || value === undefined) return "NULL";
  return `'${String(value).replace(/'/g, "''")}'`;
}

function arr(values) {
  return `ARRAY[${values.map(q).join(",")}]`;
}

function countrySql(code) {
  const [id, ko, en, local, flag, region, sub, timezone, lang, ecommerce, social] = countries[code];
  return `INSERT INTO countries (id, code, name_ko, name_en, name_local, flag_emoji, region, sub_region, timezone, primary_language, primary_ecommerce_platform, primary_social_platform)
SELECT ${[id, code, ko, en, local, flag, region, sub, timezone, lang, ecommerce, social].map(q).join(", ")}
WHERE NOT EXISTS (SELECT 1 FROM countries WHERE code = ${q(code)});`;
}

function trendSql(rows) {
  return rows.map((row) => {
    const countryId = countries[row.country][0];
    return `(${
      [
        countryId,
        categoryIds[row.category],
        row.name,
        row.name_local,
        row.description,
        row.heat_score,
        row.heat_status,
        row.search_score,
        row.social_score,
        row.ecommerce_score,
        row.news_score,
      ].map(q).join(", ")
    }, ${arr(row.tags)}, ${arr(row.source_urls)}, ${q(row.first_detected_at)}, ${q(row.last_updated_at)})`;
  }).join(",\n");
}

function buildFullSql(rows) {
  return [
    "-- 2026-04-24 KR/JP verified Korean trend refresh",
    "-- scope: KR, JP / 25 per country / total 50",
    "",
    "BEGIN;",
    "",
    ...TARGET_COUNTRIES.map(countrySql),
    "",
    `DELETE FROM trends WHERE country_id IN (SELECT id FROM countries WHERE code IN (${TARGET_COUNTRIES.map(q).join(",")})) AND last_updated_at::date = DATE ${q(WINDOW_DATE)};`,
    "",
    "INSERT INTO trends (country_id, category_id, name, name_local, description, heat_score, heat_status, search_score, social_score, ecommerce_score, news_score, tags, source_urls, first_detected_at, last_updated_at) VALUES",
    `${trendSql(rows)};`,
    "",
    "COMMIT;",
    "",
  ].join("\n");
}

function validateRecords() {
  const counts = new Map();
  for (const code of TARGET_COUNTRIES) {
    for (const category of Object.keys(categoryIds)) counts.set(`${code}/${category}`, 0);
  }
  for (const record of records) {
    const key = `${record.country}/${record.category}`;
    if (!counts.has(key)) throw new Error(`범위 밖 레코드: ${key}`);
    counts.set(key, counts.get(key) + 1);
    if (!record.source_urls.length) throw new Error(`source_urls 없음: ${record.country}/${record.name}`);
  }
  const bad = [...counts.entries()].filter(([, count]) => count !== 5);
  if (records.length !== 50 || bad.length) {
    throw new Error(`레코드 수 불일치 total=${records.length}, bad=${JSON.stringify(bad)}`);
  }
}

async function main() {
  validateRecords();
  writeFileSync(FULL_SQL, buildFullSql(records), "utf8");

  const env = loadEnv();
  const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL || env.DATABASE_URL });

  try {
    await pool.query("BEGIN");

    for (const code of TARGET_COUNTRIES) {
      const [id, ko, en, local, flag, region, sub, timezone, lang, ecommerce, social] = countries[code];
      const existing = await pool.query("SELECT id FROM countries WHERE code = $1", [code]);
      if (existing.rowCount === 0) {
        await pool.query(
          `INSERT INTO countries (id, code, name_ko, name_en, name_local, flag_emoji, region, sub_region, timezone, primary_language, primary_ecommerce_platform, primary_social_platform)
           VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12)`,
          [id, code, ko, en, local, flag, region, sub, timezone, lang, ecommerce, social]
        );
      }
    }

    await pool.query(
      `DELETE FROM trends
       WHERE country_id IN (SELECT id FROM countries WHERE code = ANY($1::text[]))
         AND last_updated_at::date = $2::date`,
      [TARGET_COUNTRIES, WINDOW_DATE]
    );

    for (const row of records) {
      await pool.query(
        `INSERT INTO trends (country_id, category_id, name, name_local, description, heat_score, heat_status, search_score, social_score, ecommerce_score, news_score, tags, source_urls, first_detected_at, last_updated_at)
         VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12::text[],$13::text[],$14::timestamptz,$15::timestamptz)`,
        [
          countries[row.country][0],
          categoryIds[row.category],
          row.name,
          row.name_local,
          row.description,
          row.heat_score,
          row.heat_status,
          row.search_score,
          row.social_score,
          row.ecommerce_score,
          row.news_score,
          row.tags,
          row.source_urls,
          row.first_detected_at,
          row.last_updated_at,
        ]
      );
    }

    const summary = await pool.query(
      `SELECT c.code, cat.slug, count(*)::int AS count
       FROM trends t
       JOIN countries c ON c.id = t.country_id
       JOIN categories cat ON cat.id = t.category_id
       WHERE c.code = ANY($1::text[])
         AND t.last_updated_at::date = $2::date
       GROUP BY c.code, cat.slug
       ORDER BY c.code, cat.slug`,
      [TARGET_COUNTRIES, WINDOW_DATE]
    );

    if (summary.rows.reduce((sum, row) => sum + row.count, 0) !== 50) {
      throw new Error(`삽입 결과가 50개가 아닙니다: ${JSON.stringify(summary.rows)}`);
    }

    await pool.query("COMMIT");
    console.table(summary.rows);
    console.log(`Docker DB 반영 완료: ${records.length}개`);
    console.log(`완성본 SQL: ${FULL_SQL}`);
  } catch (error) {
    await pool.query("ROLLBACK").catch(() => {});
    throw error;
  } finally {
    await pool.end();
  }
}

main().catch((error) => {
  console.error(error.message);
  process.exit(1);
});
