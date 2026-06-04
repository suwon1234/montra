import { readFileSync, writeFileSync } from "fs";
import pg from "pg";

const WINDOW_DATE = "2026-04-24";
const TARGET_COUNTRIES = ["ID", "PH", "SG", "TW", "HK"];
const FULL_SQL = "scripts/output/verified_IDPHSGTWHK_full_ko_2026-04-24.sql";

const countries = {
  ID: ["353799bf-5c9e-4e15-bd92-2103bb73cee3", "인도네시아", "Indonesia", "Indonesia", "🇮🇩", "asia", "Southeast Asia", "Asia/Jakarta", "id-ID", "Tokopedia", "Instagram"],
  PH: ["e4e167e6-1dcb-4e70-96aa-458fcbad56d1", "필리핀", "Philippines", "Pilipinas", "🇵🇭", "asia", "Southeast Asia", "Asia/Manila", "en-PH", "Shopee Philippines", "TikTok"],
  SG: ["375cfcb3-e327-4a54-a3df-224bc955ac27", "싱가포르", "Singapore", "Singapore", "🇸🇬", "asia", "Southeast Asia", "Asia/Singapore", "en-SG", "Shopee Singapore", "Instagram"],
  TW: ["099ecdd4-544d-4414-9458-71b69d4975bf", "대만", "Taiwan", "台灣", "🇹🇼", "asia", "East Asia", "Asia/Taipei", "zh-TW", "Shopee Taiwan", "Instagram"],
  HK: ["ee4b2646-1804-4343-b977-bf4e7933fb8b", "홍콩", "Hong Kong", "香港", "🇭🇰", "asia", "East Asia", "Asia/Hong_Kong", "zh-HK", "HKTVmall", "Instagram"],
};

const categoryIds = {
  brands: "47d77b6d-3c38-4861-ac3a-1dfe04277da5",
  challenge: "395a5576-8c5e-40a6-a965-28ead697a232",
  fashion: "98561c59-d4db-41d7-b7e6-545614e37e87",
  food: "989c0361-82f8-4805-a4b1-285a7ee420de",
  products: "faba0b6a-bbbe-4eb6-8035-23c7e5b2a61b",
};

const source = {
  idBeanStar: "https://mix.co.id/marcomm/news-trend/resmikan-gerai-ke-3-di-gandaria-city-mall-beanstar-coffee-perkenalkan-tiga-menu-baru/",
  idEufy: "https://mix.co.id/marcomm/news-trend/eufy-luncurkan-pompa-asi-handsfree-berteknologi-heatflow/",
  idAlfamart: "https://mix.co.id/marcomm/news-trend/alfamart-dan-anne-avantie-berkolaborasi-luncurkan-tote-bag-puspa-kinasih/",
  idAveeno: "https://mix.co.id/marcomm/news-trend/aveeno-luncurkan-sos-strength-of-sensitivity/",
  idHaier: "https://mix.co.id/marcomm/news-trend/jajaki-pasar-elektronik-di-indonesia-haier-gelar-product-launch-di-womens-day-run-2026/",
  idIsoplus: "https://mix.co.id/marcomm/news-trend/isoplus-targetkan-17-000-pelari-di-isoplus-run-series-2026/",
  idPantene: "https://www.cosmopolitan.co.id/amp/article/read/4/2026/45627/intip-yuk-rahasia-rambut-indah-dari-anggun-maudy-ayunda-saat-promosi-film-para-perasuk",
  idKworb: "https://kworb.net/spotify/country/id_daily.html",
  phWendys: "https://www.irwendys.com/news/news-details/2026/Wendys-Celebrates-Opening-of-100th-Restaurant-in-the-Philippines/default.aspx",
  phAngels: "https://businessmirror.com.ph/2026/04/14/angels-pizza-raises-the-bar-with-new-menu-creations/",
  phRumba: "https://businessmirror.com.ph/2026/04/22/rumba-welcomes-each-morning-with-a-new-menu-for-breakfast/",
  phBiniWeekend2: "https://vogue.ph/fashion/celebrity-fashion/bini-futuristic-glam-coachella-2026-weekend-two/",
  phBiniDebut: "https://vogue.ph/fashion/celebrity-fashion/inside-binis-historic-debut-at-coachella-with-ica-villanueva/",
  phPradaRoute: "https://www.preview.ph/fashion/prada-route-bag-history-price-celebrities-a4958-20260414-dyn",
  phDoctorBag: "https://www.preview.ph/fashion/doctor-bag-2026-trend-report-a6887-20260401-dyn",
  phSabrina: "https://vogue.ph/fashion/sabrina-carpenter-dior-coachella/",
  phIssue: "https://vogue.ph/behind-the-pages/making-of-april-2026-issue/",
  phKworb: "https://kworb.net/spotify/country/ph_daily.html",
  sgMaryGrace: "https://www.marketing-interactive.com/mary-grace-cafe-draws-crowds-and-warm-reception-in-singapore-debut",
  sgVaseline: "https://www.marketing-interactive.com/vaseline-turns-viral-social-media-hacks-into-real-products",
  sgEcoFashion: "https://vogue.sg/eco-fashion-weekend-2026/",
  sgKfc: "https://www.marketing-interactive.com/kfc-singapore-turns-up-the-heat-with-samyang-collab",
  sgHennessy: "https://www.marketing-interactive.com/hennessy-myway-2026-returns-betting-on-eco-conscious-serves",
  sgUniqlo: "https://www.marketing-interactive.com/uniqlo-turns-orchard-into-a-cooling-station-for-sweaty-singaporeans",
  sgKworb: "https://kworb.net/spotify/country/sg_daily.html",
  twKenangan: "https://www.taiwannews.com.tw/news/6337922",
  twSheerSkirt: "https://www.vogue.com.tw/article/how-to-wear-sheer-skirt-trend-2026",
  twJeansBlackTop: "https://www.vogue.com.tw/article/jeans-black-top-trends-2026",
  twSkirtTrends: "https://www.vogue.com.tw/article/2026-skirt-trends",
  twSatinPants: "https://www.vogue.com.tw/article/lazy-chic-satin-pants",
  twSummerColors: "https://www.vogue.com.tw/article/summer-color-trends-2026-butter-yellow-sky-blue",
  twBeauty: "https://www.vogue.com.tw/article/2026-apr-%E7%BE%8E%E5%A6%9D%E6%96%B0%E5%93%81part2",
  twFragrance: "https://www.vogue.com.tw/article/2026-apr-%E9%A6%99%E6%B0%9B%E6%96%B0%E5%93%81part2",
  twKworb: "https://kworb.net/spotify/country/tw_daily.html",
  hkAmoy: "https://www.marketing-interactive.com/amoy-turns-new-royal-dumpling-into-romantic-lead-with-sinny-ng",
  hkPacificPlace: "https://www.marketing-interactive.com/pacific-place-turns-runway-ready-with-devil-wears-prada-takeover",
  hkGiordano: "https://www.marketing-interactive.com/giordano-refreshes-brand-identity-with-elevated-retail-experience",
  hkLongines: "https://www.marketing-interactive.com/longines-unveils-immersive-hydroconquest-popup-at-festival-walk",
  hkColgate: "https://www.marketing-interactive.com/colgate-turns-hk-cafe-into-teeth-whitening-lab-pop-up",
  hkSunkist: "https://www.marketing-interactive.com/sunkist-turns-oranges-into-fashion-accessories-at-k11-pop-up",
  hkNescafe: "https://www.foodbev.com/news/nestl%C3%A9-strengthens-nescaf%C3%A9-gold-blend-line-with-first-whitener-plus-soluble-coffee",
  hkFanta: "https://www.marketing-interactive.com/fanta-opens-free-study-rooms-to-power-hk-dse-candidates",
  hkCafeDeCoral: "https://www.marketing-interactive.com/cafe-de-corals-menu-mate-mascot-spices-up-hk-ip-festival",
  hkBalloonPants: "https://www.voguehk.com/zh/article/fashion/2026-april-issue-blow-up/",
  hkKworb: "https://kworb.net/spotify/country/hk_daily.html",
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
add("ID", "food", [
  { name: "Tiger Bomb Dirty", local: "타이거 봄 더티", desc: "빈스타 커피가 4월 20일 자카르타 간다리아 시티몰 3호점 오픈과 함께 공개한 신메뉴입니다. 국제 커피 시장에서 뜨는 타이거 봄 계열을 인도네시아식 매장 경험에 바로 붙인 점이 이번 주 F&B 화제로 잡혔습니다.", tags: ["beanstar", "coffee"], urls: [source.idBeanStar], heat: 88, status: "new" },
  { name: "Tiger Bomb Latte", local: "타이거 봄 라떼", desc: "빈스타 커피가 같은 기사에서 함께 공개한 타이거 봄 라떼입니다. 기존 RTD보다 진한 커피감과 트렌디한 이름이 붙어 매장 신규 유입용 메뉴로 언급량이 붙고 있습니다.", tags: ["beanstar", "latte"], urls: [source.idBeanStar], heat: 85, status: "new" },
  { name: "Kopi Saku", local: "코피 사쿠", desc: "빈스타 커피가 인도네시아의 빠른 일상 소비에 맞춰 내놓은 RTD 카테고리 메뉴입니다. 기사에서 '언제 어디서나 마시기 쉬운 데일리 커피'로 소개돼 편의형 음료 수요와 맞물렸습니다.", tags: ["beanstar", "rtd"], urls: [source.idBeanStar], heat: 84, status: "new" },
  { name: "-86Dirty", local: "-86더티", desc: "빈스타 커피가 이번 신메뉴를 설명하면서 다시 꺼낸 대표 바이럴 메뉴입니다. 신규 매장 기사 안에서 기존 히트 메뉴를 재호명하면서 브랜드 대표 메뉴로 다시 주목받고 있습니다.", tags: ["beanstar", "signature"], urls: [source.idBeanStar], heat: 79 },
  { name: "ISOPLUS Isotonic Drink", local: "아이소플러스 이소토닉 드링크", desc: "아이소플러스 런 시리즈 2026 기사에서 브랜드가 다시 전면에 세운 이소토닉 음료 라인입니다. 러닝 붐과 결합해 운동 직후 보충 음료 수요를 잡는 대표 아이템으로 읽히고 있습니다.", tags: ["isoplus", "sports-drink"], urls: [source.idIsoplus], heat: 81, status: "new" },
]);

add("ID", "fashion", [
  { name: "Tote Bag Puspa Kinasih", local: "토트백 푸스파 키나시", desc: "알파마트와 안네 아반티가 4월 22일 공개한 한정판 쇼퍼백입니다. 카르티니 무드와 플로럴 패턴을 묶어 일상형 패션 아이템처럼 소비되는 흐름이 이번 주에 강하게 보였습니다.", tags: ["alfamart", "anne-avantie", "bag"], urls: [source.idAlfamart], heat: 87, status: "new" },
  { name: "Anne Avantie Floral Shopper Style", local: "안네 아반티 플로럴 쇼퍼 스타일", desc: "푸스파 키나시 토트백에 실린 안네 아반티 특유의 플로럴 모티프가 자체 스타일 포인트로 소비되고 있습니다. 단순 증정품보다는 로컬 디자이너 감성을 얹은 액세서리 흐름으로 읽힙니다.", tags: ["anne-avantie", "floral", "accessory"], urls: [source.idAlfamart], heat: 82, status: "new" },
  { name: "Pantene Miracles Glossy Hair Look", local: "팬틴 미라클즈 글로시 헤어 룩", desc: "마우디 아윤다와 앙군이 영화 홍보 일정에서 보여준 윤기 있는 헤어 스타일이 팬틴 기사와 함께 묶여 노출됐습니다. 헤어를 패션 완성 요소처럼 보이게 만든 캠페인형 트렌드입니다.", tags: ["pantene", "hair"], urls: [source.idPantene], heat: 81, status: "new" },
  { name: "Maudy Ayunda Promo Hair", local: "마우디 아윤다 프로모 헤어", desc: "마우디 아윤다가 영화 'Para Perasuk' 홍보 기간에 보여준 건강한 헤어 이미지가 팬틴 제품과 함께 소비되고 있습니다. 배우 스타일 레퍼런스를 따라가는 인도네시아 뷰티-패션형 관심도가 붙었습니다.", tags: ["maudy-ayunda", "hair"], urls: [source.idPantene], heat: 79 },
  { name: "Anggun Sleek Campaign Hair", local: "앙군 슬릭 캠페인 헤어", desc: "앙군이 같은 기사에서 보여준 정돈된 슬릭 헤어도 함께 화제가 됐습니다. 강한 커리어 우먼 이미지와 연결돼 헤어 자체가 스타일 코드처럼 읽히는 케이스입니다.", tags: ["anggun", "hair"], urls: [source.idPantene], heat: 77 },
]);

add("ID", "brands", [
  { name: "BeanStar Coffee", local: "빈스타 커피", desc: "빈스타 커피는 4월 20일 3호점 오픈과 신메뉴 3종 공개를 한 번에 묶으면서 인도네시아 커피 브랜드 화제에 올랐습니다. '글로벌 커피 트렌드를 빠르게 가져오는 브랜드'라는 포지션이 뚜렷해졌습니다.", tags: ["coffee-brand"], urls: [source.idBeanStar], heat: 89, status: "new" },
  { name: "eufy", local: "유피", desc: "유피는 4월 21일 인도네시아에 베이비 카테고리를 공식 진입시키며 히트플로우 기술을 앞세운 핸즈프리 유축기를 공개했습니다. 전자기기 브랜드가 육아 영역으로 확장하는 움직임이 주목을 받았습니다.", tags: ["baby-tech"], urls: [source.idEufy], heat: 86, status: "new" },
  { name: "Alfamart", local: "알파마트", desc: "알파마트는 안네 아반티 협업 토트백으로 리테일 브랜드를 패션 협업 주체로 보이게 만들었습니다. 오프라인 매장과 알파기프트를 동시에 묶으면서 소비 접점을 넓힌 점도 이번 주 신호입니다.", tags: ["retail", "collaboration"], urls: [source.idAlfamart], heat: 84, status: "new" },
  { name: "Aveeno", local: "아비노", desc: "아비노는 'SOS: Strength of Sensitivity' 캠페인을 4월 17일 자카르타에서 론칭하며 민감 피부와 정서적 스트레스를 함께 이야기했습니다. 기능성 스킨케어 브랜드가 공감형 메시지로 다시 떠오른 사례입니다.", tags: ["skincare"], urls: [source.idAveeno], heat: 82, status: "new" },
  { name: "Pantene Miracles", local: "팬틴 미라클즈", desc: "팬틴 미라클즈는 영화 프로모션과 신제품 론칭을 함께 엮으면서 인도네시아 헤어케어 브랜드 관심을 크게 끌었습니다. 샴푸 브랜드보다 '헤어 솔루션' 브랜드로 읽히는 방향이 강합니다.", tags: ["haircare"], urls: [source.idPantene], heat: 85, status: "new" },
]);

add("ID", "products", [
  { name: "eufy Breast Pump S1 Pro", local: "유피 브레스트 펌프 S1 프로", desc: "유피가 인도네시아에서 모더케어와 함께 판매를 예고한 대표 플래그십 유축기입니다. 온열 보조 기능과 핸즈프리 포인트가 같이 붙어 육아 신제품 화제 중심에 섰습니다.", tags: ["eufy", "breast-pump"], urls: [source.idEufy], heat: 87, status: "new" },
  { name: "eufy Breast Pump E20", local: "유피 브레스트 펌프 E20", desc: "유피가 인도네시아 모더케어 채널에 함께 올리는 또 다른 핵심 유축기 모델입니다. 플래그십 S1 Pro보다 접근성이 좋아 실구매 관심 제품으로 같이 언급되고 있습니다.", tags: ["eufy", "breast-pump"], urls: [source.idEufy], heat: 83, status: "new" },
  { name: "Tote Bag Puspa Kinasih", local: "토트백 푸스파 키나시", desc: "알파마트 협업 한정 수량 토트백입니다. 구매 조건과 정가가 기사에 함께 노출되면서 단순 이벤트 굿즈보다 실제 구매 상품으로 움직이고 있습니다.", tags: ["alfamart", "bag"], urls: [source.idAlfamart], heat: 88, status: "new" },
  { name: "Pantene Miracles Shampoo Biotin Strength", local: "팬틴 미라클즈 샴푸 바이오틴 스트렝스", desc: "팬틴이 새로 밀고 있는 손상·끊김 케어 샴푸입니다. 촬영과 야외 일정이 많은 배우 사례와 함께 설명되면서 실사용 제품으로 관심이 붙었습니다.", tags: ["pantene", "shampoo"], urls: [source.idPantene], heat: 84, status: "new" },
  { name: "Pantene Miracles Shampoo Collagen Repair", local: "팬틴 미라클즈 샴푸 콜라겐 리페어", desc: "팬틴 미라클즈 라인에서 함께 강조된 손상 복구용 샴푸입니다. 영화 촬영 중 머드 장면과 반복 테이크를 버틴 헤어 관리 솔루션으로 연결돼 제품 인지가 올라왔습니다.", tags: ["pantene", "shampoo"], urls: [source.idPantene], heat: 83, status: "new" },
]);

add("ID", "challenge", [
  { name: "Sal Priadi - Mungkin Kita Perlu Waktu", local: "살 프리아디 - 아마 우리에겐 시간이 필요해", desc: "인도네시아 Spotify 차트에서 이번 주 상위권을 지킨 곡입니다. 감정선이 또렷해서 짧은 릴스 배경음으로도 잘 붙는 유형의 곡입니다.", tags: ["spotify", "music"], urls: [source.idKworb], heat: 91, status: "rising", scores: { search: 84, social: 94, ecommerce: 8, news: 66 } },
  { name: "Nadhif Basalamah - bergema sampai selamanya", local: "나디프 바살라마 - 끝까지 울리는 사랑", desc: "인도네시아 차트에서 꾸준히 강한 존재감을 보인 곡입니다. 서정적인 클립과 고백형 영상에 많이 붙는 음악으로 해석됩니다.", tags: ["spotify", "music"], urls: [source.idKworb], heat: 89, status: "rising", scores: { search: 82, social: 92, ecommerce: 8, news: 64 } },
  { name: "Raim Laode - Lesung Pipi", local: "라임 라오데 - 보조개", desc: "가벼운 로맨스 무드에 잘 맞는 곡으로 인도네시아 차트 상위권에 다시 붙었습니다. 일상 브이로그와 커플 영상에 쉽게 쓰이는 트랙입니다.", tags: ["spotify", "music"], urls: [source.idKworb], heat: 87, scores: { search: 80, social: 90, ecommerce: 8, news: 63 } },
  { name: "Piche Kota - Aku Dah Lupa", local: "피체 코타 - 난 이미 잊었어", desc: "리듬이 명확하고 후렴이 기억에 남아 밈형 숏폼에 붙기 좋은 곡입니다. 이번 주 인도네시아 차트에서 빠르게 올라왔습니다.", tags: ["spotify", "music"], urls: [source.idKworb], heat: 85, scores: { search: 78, social: 89, ecommerce: 8, news: 61 } },
  { name: "Ifan Seventeen - 17", local: "이판 세븐틴 - 17", desc: "향수 자극형 클립과 회고형 영상에 잘 어울리는 곡으로 차트 상위권에 남아 있습니다. 감성형 챌린지용 배경음으로 쓰이기 좋습니다.", tags: ["spotify", "music"], urls: [source.idKworb], heat: 84, scores: { search: 77, social: 88, ecommerce: 8, news: 60 } },
]);

add("PH", "food", [
  { name: "Ultra Creamy Spinach Dip Pizza", local: "울트라 크리미 시금치 딥 피자", desc: "엔젤스 피자가 이번 주에 밀고 있는 대표 신메뉴입니다. 기존 시금치 딥 피자를 더 진하게 강화한 버전이라 필리핀 대중 피자 메뉴 화제로 바로 이어졌습니다.", tags: ["angels-pizza", "pizza"], urls: [source.phAngels], heat: 89, status: "new" },
  { name: "Cheesy Bacon Burger Melt Pizza", local: "치지 베이컨 버거 멜트 피자", desc: "버거 감성을 피자에 접목한 엔젤스 피자 신메뉴입니다. 소고기, 베이컨, 나초 치즈 조합이 또렷해서 사진 반응이 붙기 좋은 메뉴입니다.", tags: ["angels-pizza", "pizza"], urls: [source.phAngels], heat: 86, status: "new" },
  { name: "Quattro Formaggi Pizza", local: "콰트로 포르마지 피자", desc: "엔젤스 피자가 이번 라인업에 같이 넣은 치즈 중심 신메뉴입니다. 필리핀식 치즈 finish를 강조한 점이 로컬 취향과 맞물렸습니다.", tags: ["angels-pizza", "pizza"], urls: [source.phAngels], heat: 83, status: "new" },
  { name: "Turkish Flatbread", local: "터키시 플랫브레드", desc: "룸바가 4월 22일 선보인 조식 신메뉴 가운데 가장 눈에 띄는 메뉴입니다. 출근 전 가볍게 먹는 유럽풍 브런치 수요와 맞닿아 있습니다.", tags: ["rumba", "breakfast"], urls: [source.phRumba], heat: 80, status: "new" },
  { name: "Green Breakfast Bowl", local: "그린 브렉퍼스트 볼", desc: "퀴노아와 시트러스 요거트, 포치드에그를 묶은 룸바 조식 메뉴입니다. 필리핀 도시권에서 건강식 아침 메뉴 관심이 붙는 흐름을 보여줍니다.", tags: ["rumba", "breakfast"], urls: [source.phRumba], heat: 79, status: "new" },
]);

add("PH", "fashion", [
  { name: "BINI Retro-Futuristic Warrior Looks", local: "비니 레트로 퓨처 워리어 룩", desc: "BINI가 코첼라 위켄드 2에서 입은 반짝이는 라벤더·실버 무드의 무대 의상입니다. 필리핀 팀의 글로벌 무대 스타일로 이번 주 패션 화제성이 가장 강했습니다.", tags: ["bini", "stagewear"], urls: [source.phBiniWeekend2], heat: 90, status: "new" },
  { name: "BINI Intentional Coachella Costumes", local: "비니 코첼라 데뷔 코스튬", desc: "비니의 첫 코첼라 무대를 위해 곡마다 의미를 나눠 설계한 의상 세트입니다. 단순 공연복이 아니라 필리핀 정체성을 얹은 스타일링 사례로 소비됐습니다.", tags: ["bini", "coachella"], urls: [source.phBiniDebut], heat: 87, status: "new" },
  { name: "Prada Route Bag", local: "프라다 루트 백", desc: "프리뷰 필리핀이 4월 14일 다시 짚은 2026 시즌 가방입니다. 포켓이 많고 실용성이 강한 구조 덕분에 필리핀 패션 독자층 사이에서 다시 회자됐습니다.", tags: ["prada", "bag"], urls: [source.phPradaRoute], heat: 84, status: "rising" },
  { name: "Doctor Bag Carryall", local: "닥터백 캐리올", desc: "필리핀 패션 기사에서 2026년 복귀 아이템으로 다시 올라온 구조형 백입니다. 큰 토트보다 단정하면서도 클래식한 분위기가 강점으로 정리됐습니다.", tags: ["doctor-bag", "bag"], urls: [source.phDoctorBag], heat: 81, status: "rising" },
  { name: "Dior Coachella Stage Pieces", local: "디올 코첼라 스테이지 피스", desc: "보그 필리핀이 사브리나 카펜터의 양쪽 코첼라 주말 디올 착장을 다시 묶어 소개했습니다. 필리핀 독자층이 참고하는 글로벌 공연 패션 레퍼런스로 작동했습니다.", tags: ["dior", "coachella"], urls: [source.phSabrina], heat: 80, status: "rising" },
]);

add("PH", "brands", [
  { name: "Wendy's Philippines", local: "웬디스 필리핀", desc: "웬디스는 4월 21일 필리핀 100호점을 열며 동남아 핵심 성장 시장이라는 메시지를 다시 강하게 냈습니다. 로컬 메뉴와 현대식 매장 경험이 같이 언급돼 브랜드 관심이 올라왔습니다.", tags: ["qsr"], urls: [source.phWendys], heat: 87, status: "new" },
  { name: "Angel's Pizza", local: "엔젤스 피자", desc: "엔젤스 피자는 신메뉴 다수를 한 번에 내놓으며 필리핀 피자 브랜드 중 가장 강한 업데이트를 만들었습니다. 시그니처 메뉴 강화와 스낵 확장이 같이 붙었습니다.", tags: ["pizza-brand"], urls: [source.phAngels], heat: 88, status: "new" },
  { name: "Rumba", local: "룸바", desc: "룸바는 4월 22일 아침 메뉴를 대폭 추가하며 스페인-지중해식 브런치 브랜드 포지션을 강화했습니다. 커피와 조식이 한 세트로 묶이는 소비 흐름을 타고 있습니다.", tags: ["restaurant-brand"], urls: [source.phRumba], heat: 81, status: "new" },
  { name: "BINI", local: "비니", desc: "BINI는 코첼라 위켄드 2 기사와 데뷔 무대 기사 모두에서 필리핀을 대표하는 무대 브랜드처럼 소비됐습니다. 음악과 스타일을 동시에 끄는 팀으로 이번 주 존재감이 컸습니다.", tags: ["pop-group"], urls: [source.phBiniWeekend2, source.phBiniDebut], heat: 90, status: "rising" },
  { name: "Dior", local: "디올", desc: "디올은 필리핀 패션 기사에서 사브리나 카펜터의 코첼라 룩을 통해 다시 강하게 노출됐습니다. 공연복과 레드카펫 사이를 오가는 글로벌 레퍼런스 브랜드로 읽히고 있습니다.", tags: ["luxury-brand"], urls: [source.phSabrina], heat: 82, status: "rising" },
]);

add("PH", "products", [
  { name: "Cheezy Bomb Chicken Wings", local: "치지 봄 치킨 윙", desc: "엔젤스 피자가 이번 주 새로 넣은 스낵 메뉴입니다. 치즈 시즈닝을 강하게 입힌 스타일이라 숏폼 음식 사진에 잘 붙는 타입입니다.", tags: ["angels-pizza", "snack"], urls: [source.phAngels], heat: 84, status: "new" },
  { name: "Miracle Fries Cheese", local: "미라클 프라이 치즈", desc: "엔젤스 피자가 추가한 미라클 프라이 3종 중 치즈 맛입니다. 사이드 메뉴까지 신메뉴 전선을 넓힌 점이 보입니다.", tags: ["angels-pizza", "fries"], urls: [source.phAngels], heat: 80, status: "new" },
  { name: "Miracle Fries BBQ", local: "미라클 프라이 바비큐", desc: "미라클 프라이의 바비큐 버전입니다. 강한 양념 감자 메뉴를 찾는 필리핀 외식 수요와 잘 맞는 제품입니다.", tags: ["angels-pizza", "fries"], urls: [source.phAngels], heat: 79, status: "new" },
  { name: "Miracle Fries Sour Cream", local: "미라클 프라이 사워크림", desc: "미라클 프라이의 사워크림 맛입니다. 기본 감자튀김보다 개성 있는 사이드로 보이게 만든 구성이 이번 주 반응 포인트였습니다.", tags: ["angels-pizza", "fries"], urls: [source.phAngels], heat: 78, status: "new" },
  { name: "Quiche Lorraine", local: "키시 로렌", desc: "룸바 조식 라인업에서 눈에 띄는 클래식 메뉴입니다. 버터리한 크러스트와 진한 커스터드 구성이 강조돼 브런치형 메뉴 수요에 맞닿아 있습니다.", tags: ["rumba", "breakfast"], urls: [source.phRumba], heat: 77, status: "new" },
]);

add("PH", "challenge", [
  { name: "fitterkarma - Kalapastangan", local: "피터카르마 - 칼라파스탕안", desc: "필리핀 Spotify 차트에서 빠르게 붙은 곡입니다. 강한 제목감과 또렷한 후렴 때문에 짧은 영상 배경음으로도 잘 걸립니다.", tags: ["spotify", "music"], urls: [source.phKworb], heat: 90, status: "rising", scores: { search: 83, social: 94, ecommerce: 8, news: 65 } },
  { name: "Ben&Ben - Lifetime (Reimagined)", local: "벤앤벤 - 라이프타임 리이매진드", desc: "원곡 인지도가 있는 곡이라 필리핀 차트에서 다시 상승할 때 재사용 수요가 강합니다. 커플 영상과 감성 릴스에 붙기 좋은 타입입니다.", tags: ["spotify", "music"], urls: [source.phKworb], heat: 88, status: "rising", scores: { search: 81, social: 92, ecommerce: 8, news: 64 } },
  { name: "Skusta Clee - Since Day One", local: "스쿠스타 클리 - 신스 데이 원", desc: "비트가 분명하고 캐릭터가 강해 필리핀 숏폼에서 자주 돌기 쉬운 곡입니다. 이번 주 차트 상위권 흐름이 이어졌습니다.", tags: ["spotify", "music"], urls: [source.phKworb], heat: 86, scores: { search: 79, social: 90, ecommerce: 8, news: 63 } },
  { name: "fitterkarma - Pag-Ibig ay Kanibalismo II", local: "피터카르마 - 사랑은 식인성 II", desc: "제목 자체가 강해서 밈형 클립과 감정 과잉형 편집에 붙기 쉬운 곡입니다. 필리핀 차트 상위권에서 존재감이 확실했습니다.", tags: ["spotify", "music"], urls: [source.phKworb], heat: 85, scores: { search: 78, social: 89, ecommerce: 8, news: 62 } },
  { name: "El Manu - Tahanan", local: "엘 마누 - 타하난", desc: "집과 안식처 이미지를 건드리는 감성 곡으로 필리핀 차트에 남아 있습니다. 가족형, 회고형 영상 배경음으로 해석하기 좋습니다.", tags: ["spotify", "music"], urls: [source.phKworb], heat: 83, scores: { search: 76, social: 88, ecommerce: 8, news: 60 } },
]);

add("SG", "food", [
  { name: "Salted Egg Ensaymada", local: "솔티드에그 엔사이마다", desc: "메리 그레이스 카페 싱가포르 매장에서 현지화 버전으로 반응이 좋다고 기사에서 짚은 메뉴입니다. 싱가포르 취향을 직접 섞은 빵 메뉴라 초기 화제성이 높았습니다.", tags: ["mary-grace", "bakery"], urls: [source.sgMaryGrace], heat: 86, status: "new" },
  { name: "Kaya Pandan Cheese Rolls", local: "카야 판단 치즈 롤", desc: "메리 그레이스가 싱가포르 현지 입맛에 맞춰 내세운 대표 메뉴입니다. 카야와 판단을 넣어 '익숙한 현지 맛'으로 다가간 점이 명확합니다.", tags: ["mary-grace", "bakery"], urls: [source.sgMaryGrace], heat: 85, status: "new" },
  { name: "Crab Cake Brioche", local: "크랩 케이크 브리오슈", desc: "메리 그레이스 기사에서 싱가포르 매장 반응이 좋다고 언급된 메뉴입니다. 브런치형 카페 수요와 잘 맞는 구성이어서 사진 반응도 붙기 쉬운 메뉴입니다.", tags: ["mary-grace", "brunch"], urls: [source.sgMaryGrace], heat: 82, status: "new" },
  { name: "Ube Coconut Cloud", local: "우베 코코넛 클라우드", desc: "메리 그레이스가 싱가포르에서 traction을 얻고 있다고 언급된 디저트성 메뉴입니다. 필리핀 색감과 싱가포르 카페 취향을 함께 건드리는 포인트가 있습니다.", tags: ["mary-grace", "dessert"], urls: [source.sgMaryGrace], heat: 81, status: "new" },
  { name: "Samyang Buldak Carbonara Chicken", local: "삼양 불닭 까르보나라 치킨", desc: "KFC 싱가포르가 더블다운 외에 함께 묶어 낸 한정 메뉴입니다. 불닭 소스를 입힌 정통 치킨 메뉴라 접근성이 높고 SNS 노출도 좋습니다.", tags: ["kfc", "chicken"], urls: [source.sgKfc], heat: 84, status: "new" },
]);

add("SG", "fashion", [
  { name: "A.Oei Studio", local: "에이오이 스튜디오", desc: "보그 싱가포르가 에코 패션 위켄드 2026 주요 참여 브랜드로 집은 로컬 라벨입니다. 지속가능 패션을 이야기할 때 바로 떠오르는 이름으로 이번 주 주목도가 높았습니다.", tags: ["eco-fashion", "local-brand"], urls: [source.sgEcoFashion], heat: 82, status: "new" },
  { name: "Nyana Nyana Eco Collective", local: "냐나 냐나 에코 컬렉티브", desc: "에코 패션 위켄드 2026 쇼케이스 라인업에 오른 브랜드입니다. 공동체성과 지속가능성 키워드를 동시에 잡는 싱가포르 패션 관심사로 읽힙니다.", tags: ["eco-fashion"], urls: [source.sgEcoFashion], heat: 80, status: "new" },
  { name: "Nimbu", local: "님부", desc: "에코 패션 위켄드 2026 참가 브랜드로 노출된 이름입니다. 지속가능 브랜드 라인업 중에서도 이번 주 리스트업 빈도가 높은 편이었습니다.", tags: ["eco-fashion"], urls: [source.sgEcoFashion], heat: 78, status: "new" },
  { name: "Palmier Ile", local: "팔미에 일", desc: "보그 싱가포르가 이번 행사 대표 라인업에 포함한 브랜드입니다. 친환경 패션을 도시적인 리조트 무드로 풀어내는 쪽에서 관심이 붙고 있습니다.", tags: ["eco-fashion"], urls: [source.sgEcoFashion], heat: 79, status: "new" },
  { name: "Sui", local: "수이", desc: "에코 패션 위켄드 2026 쇼케이스에 오른 브랜드입니다. 싱가포르 패션 씬에서 지속가능성 키워드와 함께 다시 언급되고 있습니다.", tags: ["eco-fashion"], urls: [source.sgEcoFashion], heat: 77, status: "new" },
]);

add("SG", "brands", [
  { name: "Mary Grace Cafe", local: "메리 그레이스 카페", desc: "메리 그레이스 카페는 싱가포르 첫 해외 지점 오픈 후 빠르게 줄을 만들며 '집의 맛' 서사를 성공적으로 옮겼습니다. 필리핀 브랜드의 싱가포르 안착 사례로 이번 주 가장 강했습니다.", tags: ["cafe-brand"], urls: [source.sgMaryGrace], heat: 88, status: "new" },
  { name: "Vaseline", local: "바세린", desc: "바세린은 싱가포르 오길비와 함께 크리에이터 해킹 문화를 실제 제품으로 바꾼 'Originals' 캠페인을 내놨습니다. 소셜 해킹을 공식 제품으로 올린 사례라 브랜드 화제성이 큽니다.", tags: ["beauty-brand"], urls: [source.sgVaseline], heat: 86, status: "new" },
  { name: "UNIQLO AIRism", local: "유니클로 에어리즘", desc: "유니클로는 오차드에 '쿨링 스테이션' 팝업을 열며 싱가포르의 더위 자체를 브랜드 체험으로 만들었습니다. 기능성 의류가 체험형 브랜드 이벤트로 확장된 사례입니다.", tags: ["fashion-brand"], urls: [source.sgUniqlo], heat: 84, status: "rising" },
  { name: "KFC Singapore", local: "KFC 싱가포르", desc: "KFC 싱가포르는 삼양 불닭과 다시 손잡으며 K-트렌드와 포토부스 문화를 한 메뉴 안에 묶었습니다. 메뉴와 체험을 같이 파는 브랜드로 다시 떠올랐습니다.", tags: ["food-brand"], urls: [source.sgKfc], heat: 85, status: "new" },
  { name: "Hennessy", local: "헤네시", desc: "헤네시는 Hennessy MyWay 2026을 통해 바텐더 네트워크와 지속가능 칵테일 서사를 다시 키우고 있습니다. 싱가포르 바 씬에서 브랜드 존재감이 살아 있습니다.", tags: ["spirits-brand"], urls: [source.sgHennessy], heat: 81, status: "rising" },
]);

add("SG", "products", [
  { name: "Vaseline Brow Tamer", local: "바세린 브로우 테이머", desc: "바세린이 오래된 소셜 해킹에서 따와 이번 주 실제 제품으로 만든 신제품입니다. 크리에이터 아이디어를 공식 제품으로 올린 상징적인 아이템입니다.", tags: ["vaseline", "beauty"], urls: [source.sgVaseline], heat: 86, status: "new" },
  { name: "Vaseline All-in-One Primer and Highlighter Jelly", local: "바세린 올인원 프라이머 앤 하이라이터 젤리", desc: "바세린이 유튜브 초기 프라이머 해킹에서 착안해 만든 신제품입니다. 메이크업 전 단계와 광 표현을 동시에 잡는 포지션이 분명합니다.", tags: ["vaseline", "beauty"], urls: [source.sgVaseline], heat: 85, status: "new" },
  { name: "Samyang Buldak Carbonara Double Down", local: "삼양 불닭 까르보나라 더블다운", desc: "KFC 싱가포르가 4월 한정으로 다시 밀고 있는 대표 제품입니다. 불닭 까르보나라 면과 치킨 필렛, 파마산, 햄을 한 번에 쌓아 강한 사진 반응이 붙었습니다.", tags: ["kfc", "collab"], urls: [source.sgKfc], heat: 89, status: "new" },
  { name: "Samyang Buldak Carbonara Loaded Fries", local: "삼양 불닭 까르보나라 로디드 프라이", desc: "같은 협업에서 더블다운과 함께 묶인 감자 메뉴입니다. 불닭 까르보나라 소스와 치즈, 쪽파를 올려 사이드 메뉴까지 화제성을 만들었습니다.", tags: ["kfc", "fries"], urls: [source.sgKfc], heat: 82, status: "new" },
  { name: "Strawberry Cream Cheese Mochi", local: "스트로베리 크림치즈 모치", desc: "KFC 싱가포르 협업 라인에서 매운 메뉴를 식히는 디저트 역할로 들어간 신제품입니다. 치즈 중심과 딸기 충전이 붙어 화제 메뉴 구성이 완성됐습니다.", tags: ["kfc", "dessert"], urls: [source.sgKfc], heat: 80, status: "new" },
]);

add("SG", "challenge", [
  { name: "Jin - Don't Say You Love Me", local: "진 - 돈트 세이 유 러브 미", desc: "싱가포르 Spotify 차트 상위권에서 빠르게 존재감을 만든 곡입니다. 팬덤 기반 확산력이 커서 릴스형 숏폼 배경음으로도 강합니다.", tags: ["spotify", "music"], urls: [source.sgKworb], heat: 91, status: "rising", scores: { search: 84, social: 95, ecommerce: 8, news: 67 } },
  { name: "Justin Bieber, Nicki Minaj - Beauty And A Beat", local: "저스틴 비버, 니키 미나즈 - 뷰티 앤 어 비트", desc: "싱가포르 차트에서 다시 강하게 돌아온 레트로 팝 트랙입니다. 복고 편집과 Y2K 무드 영상에 붙기 좋은 곡입니다.", tags: ["spotify", "music"], urls: [source.sgKworb], heat: 88, scores: { search: 81, social: 92, ecommerce: 8, news: 64 } },
  { name: "BTS - SWIM", local: "방탄소년단 - 스윔", desc: "팬덤 기반 스트리밍이 강해 싱가포르 차트 상위권에 붙은 곡입니다. 안무형 클립과 팬캠 리컷 영상에 잘 맞는 곡입니다.", tags: ["spotify", "music"], urls: [source.sgKworb], heat: 86, scores: { search: 79, social: 91, ecommerce: 8, news: 63 } },
  { name: "Jimin - Who", local: "지민 - 후", desc: "싱가포르 차트에서 꾸준히 버티는 K팝 솔로 트랙입니다. 감정선이 뚜렷해서 얼굴 클로즈업 영상이나 무드 편집에 많이 붙을 수 있습니다.", tags: ["spotify", "music"], urls: [source.sgKworb], heat: 85, scores: { search: 78, social: 90, ecommerce: 8, news: 62 } },
  { name: "Bruno Mars - Risk It All", local: "브루노 마스 - 리스크 잇 올", desc: "싱가포르 차트 상위권에서 힘을 유지한 글로벌 팝 곡입니다. 감정 고조 구간이 분명해서 릴스 배경음으로 쓰기 좋습니다.", tags: ["spotify", "music"], urls: [source.sgKworb], heat: 83, scores: { search: 76, social: 88, ecommerce: 8, news: 61 } },
]);

add("TW", "food", [
  { name: "SOE Champion Series", local: "SOE 챔피언 시리즈", desc: "켄안간 커피가 대만 진출 기사에서 대표 라인으로 내세운 싱글 오리진 에스프레소 시리즈입니다. 발리 킨타마니 화산지대 원두와 합리적 가격대를 함께 강조했습니다.", tags: ["kenangan", "coffee"], urls: [source.twKenangan], heat: 86, status: "new" },
  { name: "Kenangan Latte", local: "케낭안 라테", desc: "켄안간 커피의 시그니처 팜슈거 라테입니다. 기사에서 인도네시아에서 하루 10만 잔이 팔린 적이 있다고 다시 강조돼 대만 론칭 대표 메뉴로 보였습니다.", tags: ["kenangan", "latte"], urls: [source.twKenangan], heat: 88, status: "new" },
  { name: "Jasmine Americano", local: "자스민 아메리카노", desc: "켄안간 타이베이 매장에서 제공하는 커피-티 믹솔로지 음료입니다. 꽃향과 커피를 같이 잡는 조합이라 대만 소비자 취향 대응 메뉴로 읽힙니다.", tags: ["kenangan", "americano"], urls: [source.twKenangan], heat: 84, status: "new" },
  { name: "Peach Americano", local: "피치 아메리카노", desc: "실제 과일을 넣은 아메리카노로 기사에서 별도 하이라이트된 메뉴입니다. 과일 커피 수요가 있는 대만 카페 씬과 맞물린 제품입니다.", tags: ["kenangan", "americano"], urls: [source.twKenangan], heat: 83, status: "new" },
  { name: "Beef Rendang Croffle", local: "비프 른당 크로플", desc: "켄안간이 대만 매장에 함께 넣은 푸드 메뉴 중 대표격입니다. 인도네시아 국민요리를 크로플 형태로 변주해 지역 정체성을 강하게 보여줬습니다.", tags: ["kenangan", "croffle"], urls: [source.twKenangan], heat: 82, status: "new" },
]);

add("TW", "fashion", [
  { name: "Sheer Skirt", local: "透視裙", desc: "보그 타이완이 4월 23일 가장 강하게 짚은 2026 봄 스타일입니다. 90년대식 투명 레이어링을 다시 일상 복장으로 끌어오는 흐름이 뚜렷합니다.", tags: ["vogue-taiwan", "skirt"], urls: [source.twSheerSkirt], heat: 86, status: "new" },
  { name: "Low-Rise Skirt", local: "低腰裙", desc: "보그 타이완 여름 스커트 트렌드 기사에서 1번으로 올린 대표 아이템입니다. 허리선을 낮춰 비율을 길게 보이게 하는 스타일이 다시 살아났습니다.", tags: ["vogue-taiwan", "skirt"], urls: [source.twSkirtTrends], heat: 84, status: "new" },
  { name: "Bubble Skirt", local: "泡泡裙", desc: "같은 여름 스커트 트렌드 기사에서 핵심 항목으로 정리된 아이템입니다. 볼륨감 있는 실루엣이 2026 시즌 스트리트 감성으로 다시 읽히고 있습니다.", tags: ["vogue-taiwan", "skirt"], urls: [source.twSkirtTrends], heat: 81, status: "new" },
  { name: "Satin Pants", local: "緞面長褲", desc: "보그 타이완이 4월 20일 'lazy chic' 키워드로 정리한 핵심 하의 트렌드입니다. 광택과 여유 있는 실루엣이 함께 묶여 이번 시즌 대만식 우아함으로 소비되고 있습니다.", tags: ["vogue-taiwan", "pants"], urls: [source.twSatinPants], heat: 82, status: "new" },
  { name: "Butter Yellow Palette", local: "奶油黃", desc: "보그 타이완이 4월 23일 여름 핵심 컬러로 꼽은 색상입니다. 검정·흰색 중심 옷장에서 벗어나 밝은 고급감을 주는 색으로 다시 뜨고 있습니다.", tags: ["vogue-taiwan", "color-trend"], urls: [source.twSummerColors], heat: 80, status: "new" },
]);

add("TW", "brands", [
  { name: "Kenangan Coffee", local: "肯納岸咖啡", desc: "켄안간 커피는 4월 10일 신콩미쓰코시 A11 플래그십 오픈으로 대만 시장에 본격 진입했습니다. 동남아 커피 유니콘의 대만 상륙이라는 서사가 강하게 붙었습니다.", tags: ["coffee-brand"], urls: [source.twKenangan], heat: 89, status: "new" },
  { name: "Dior Beauty Taiwan", local: "迪奧美妝 台灣", desc: "보그 타이완 4월 메이크업 신제품 기사에서 디올 여름 한정 메이크업이 강하게 노출됐습니다. 컬러 메이크업 시즌 브랜드로 다시 존재감이 커졌습니다.", tags: ["beauty-brand"], urls: [source.twBeauty], heat: 84, status: "rising" },
  { name: "Sisley", local: "希思黎", desc: "시슬리는 클라우드 립 무스와 하이라이트 팔레트를 함께 내세우며 2026 봄 메이크업 브랜드로 다시 노출됐습니다. 대만 뷰티 기사 안에서 제품 구성이 또렷했습니다.", tags: ["beauty-brand"], urls: [source.twBeauty], heat: 82, status: "rising" },
  { name: "Prada Beauty", local: "Prada Beauty", desc: "보그 타이완 4월 메이크업 기사 제목에 직접 들어간 브랜드입니다. 뷰티 카테고리에서 프라다가 색조 브랜드로 인식되는 흐름이 분명합니다.", tags: ["beauty-brand"], urls: [source.twBeauty], heat: 81, status: "rising" },
  { name: "Acqua di Parma", local: "帕爾瑪之水", desc: "보그 타이완 4월 향수 기사에서 가장 먼저 다룬 브랜드입니다. 다섯 가지 향수를 한 번에 내세운 신제품 라인 덕분에 이번 달 향수 브랜드 노출이 컸습니다.", tags: ["fragrance-brand"], urls: [source.twFragrance], heat: 80, status: "rising" },
]);

add("TW", "products", [
  { name: "Light Cloud Latte Series", local: "輕雲拿鐵系列", desc: "켄안간 대만 매장이 현지 전용으로 넣은 라이트 클라우드 라테 시리즈입니다. 우유와 크림 사이의 질감을 강조해 대만식 진한 바디감을 노렸습니다.", tags: ["kenangan", "latte"], urls: [source.twKenangan], heat: 84, status: "new" },
  { name: "Taro and Cheese Croffle", local: "芋頭起司可頌鬆餅", desc: "켄안간이 대만 입맛에 맞춰 별도 개발한 메뉴입니다. 화이트 페퍼와 타로를 넣어 로컬 취향을 분명히 건드렸습니다.", tags: ["kenangan", "croffle"], urls: [source.twKenangan], heat: 83, status: "new" },
  { name: "Dior Addict Water Lip Tint #531 Sunset", local: "迪奧癮誘沁涼水唇露 #531 落日夕陽", desc: "보그 타이완 4월 16일 기사에서 별도 색상까지 짚은 디올 립 제품입니다. 남프랑스 노을 무드 색상 설명이 붙어 시즌 한정 제품으로 존재감이 큽니다.", tags: ["dior", "lip"], urls: [source.twBeauty], heat: 82, status: "new" },
  { name: "Sisley Cloud Lip Mousse #03 Raspberry", local: "Sisley 雲朵唇慕斯 #03 覆盆子慕斯", desc: "시슬리 2026 봄 메이크업 라인 중 개성이 가장 강한 색상으로 소개된 제품입니다. 입술·볼·눈까지 쓰는 멀티 유즈 포인트가 분명합니다.", tags: ["sisley", "lip"], urls: [source.twBeauty], heat: 80, status: "new" },
  { name: "The Body Shop White Tea Hand Cream", local: "The Body Shop 花漾白茶保濕護手霜", desc: "보그 타이완 4월 향수·바디 기사에서 핸드크림 단품으로 가격과 기능이 함께 소개된 제품입니다. 향기 나는 핸드케어 수요와 잘 맞는 아이템입니다.", tags: ["the-body-shop", "hand-cream"], urls: [source.twFragrance], heat: 78, status: "new" },
]);

add("TW", "challenge", [
  { name: "Justin Bieber, Nicki Minaj - Beauty And A Beat", local: "저스틴 비버, 니키 미나즈 - 뷰티 앤 어 비트", desc: "대만 Spotify 차트에서 다시 강하게 떠오른 복고 팝 곡입니다. Y2K 무드 편집과 안무형 영상 배경음으로 잘 붙는 타입입니다.", tags: ["spotify", "music"], urls: [source.twKworb], heat: 89, status: "rising", scores: { search: 82, social: 93, ecommerce: 8, news: 65 } },
  { name: "The Kid LAROI, Justin Bieber - STAY", local: "더 키드 라로이, 저스틴 비버 - 스테이", desc: "대만 차트 상위권에 다시 붙은 글로벌 팝 트랙입니다. 익숙한 후렴이 강해서 짧은 영상에서 재사용성이 높습니다.", tags: ["spotify", "music"], urls: [source.twKworb], heat: 87, scores: { search: 80, social: 91, ecommerce: 8, news: 63 } },
  { name: "Jin - Don't Say You Love Me", local: "진 - 돈트 세이 유 러브 미", desc: "팬덤 기반 스트리밍이 강하게 받쳐줘 대만 차트 상위권에 오른 곡입니다. 감성 얼굴 클로즈업 영상과 팬 편집에 잘 맞습니다.", tags: ["spotify", "music"], urls: [source.twKworb], heat: 86, scores: { search: 79, social: 91, ecommerce: 8, news: 63 } },
  { name: "Justin Bieber - That Should Be Me", local: "저스틴 비버 - 댓 슈드 비 미", desc: "대만 차트에서 다시 보인 향수형 팝 곡입니다. 이별 회고나 감정형 숏폼에 붙기 좋은 선택지입니다.", tags: ["spotify", "music"], urls: [source.twKworb], heat: 84, scores: { search: 77, social: 89, ecommerce: 8, news: 61 } },
  { name: "BTS - SWIM", local: "방탄소년단 - 스윔", desc: "대만 차트에서 K팝 팬덤의 힘으로 상위권을 유지한 곡입니다. 팬캠 리컷과 무드 편집에 쓰기 좋은 배경음입니다.", tags: ["spotify", "music"], urls: [source.twKworb], heat: 83, scores: { search: 76, social: 88, ecommerce: 8, news: 60 } },
]);

add("HK", "food", [
  { name: "Chive & Pork Royal Dumpling", local: "淘大韭菜豬肉餃霸", desc: "아모이 딤섬이 4월 20일 로컬 걸그룹 Lolly Talk의 신니 응과 함께 밀기 시작한 신제품입니다. 찌기, 전자레인지, 군만두, 튀김까지 4가지 조리법을 한 번에 내세웠습니다.", tags: ["amoy", "dumpling"], urls: [source.hkAmoy], heat: 88, status: "new" },
  { name: "Nescafe Gold White Coffee", local: "NESCAFE GOLD 白咖啡", desc: "네슬레가 홍콩 시장에서 화이트너가 들어간 새로운 네스카페 골드 블렌드 라인을 강화하며 내놓은 제품입니다. 간편한 홈카페 음료 수요를 직접 겨냥합니다.", tags: ["nescafe", "coffee"], urls: [source.hkNescafe], heat: 83, status: "new" },
  { name: "Sunkist Oranges", local: "Sunkist 오렌지", desc: "선키스트가 K11 팝업에서 패션 소품처럼 재해석했지만 핵심에는 여전히 신선 오렌지 소비가 있습니다. 비타민C와 라이프스타일을 같이 묶은 식품형 화제입니다.", tags: ["sunkist", "fruit"], urls: [source.hkSunkist], heat: 79, status: "rising" },
  { name: "Fanta Orange Can", local: "환타 오렌지 캔", desc: "환타가 DSE 수험생 대상 스터디룸과 함께 6만 캔 이상을 배포하며 다시 전면 노출한 대표 음료입니다. 시즌 이벤트와 음료 소비가 직접 연결된 사례입니다.", tags: ["fanta", "soft-drink"], urls: [source.hkFanta], heat: 78, status: "new" },
  { name: "Cafe de Coral Hong Kong Flavour Breakfast", local: "大家樂 港味早餐", desc: "카페 드 코랄이 '홍콩 맛은 있어야 한다'는 새 플랫폼으로 다시 밀고 있는 로컬식 아침 식사 경험입니다. 이번 달 끝까지 이어지는 캠페인 안에서 식문화 대표 메뉴군으로 읽히고 있습니다.", tags: ["cafe-de-coral", "breakfast"], urls: [source.hkCafeDeCoral], heat: 77, status: "rising" },
]);

add("HK", "fashion", [
  { name: "Devil Wears Prada 2 Takeover Look", local: "악마는 프라다를 입는다 2 테이크오버 룩", desc: "퍼시픽 플레이스가 4월 22일부터 영화 세계관을 패션 무대로 바꿔버린 캠페인입니다. 초대형 빨간 하이힐 설치물과 편집실 감성 동선이 같이 화제가 됐습니다.", tags: ["pacific-place", "fashion-event"], urls: [source.hkPacificPlace], heat: 86, status: "new" },
  { name: "Giordano Premium Elegance Business-Casual", local: "지오다노 프리미엄 엘레강스 비즈니스 캐주얼", desc: "지오다노가 이번 리브랜딩에서 새로 강조한 옷차림 방향입니다. 스마트 오피스에서 좀 더 여유 있는 비즈니스 캐주얼로 옮겨가는 흐름을 대표합니다.", tags: ["giordano", "business-casual"], urls: [source.hkGiordano], heat: 83, status: "new" },
  { name: "HydroConquest Coastal Pop-Up Style", local: "하이드로컨퀘스트 코스털 팝업 스타일", desc: "롱진이 테네리페 해안 이미지를 그대로 가져온 팝업을 홍콩에 열면서 시계 자체보다 전체 무드가 패션 이벤트처럼 읽혔습니다. 해안·바다·쿨톤 럭셔리 이미지가 강합니다.", tags: ["longines", "luxury-style"], urls: [source.hkLongines], heat: 80, status: "new" },
  { name: "Sunkist Citrus Accessory Look", local: "선키스트 시트러스 액세서리 룩", desc: "선키스트가 K11 팝업에서 오렌지를 케이스와 참으로 바꾸며 '과일 meets 패션' 무드를 직접 보여줬습니다. 홍콩에서 푸드 브랜드가 패션 소품으로 번진 사례입니다.", tags: ["sunkist", "accessory"], urls: [source.hkSunkist], heat: 81, status: "new" },
  { name: "Balloon Pants", local: "燈籠褲", desc: "보그 홍콩이 4월 16일 2026 봄여름 핵심 하의로 다시 짚은 아이템입니다. 편안한 볼륨 실루엣과 다리 비율 보정감이 같이 강조됐습니다.", tags: ["vogue-hk", "pants"], urls: [source.hkBalloonPants], heat: 79, status: "new" },
]);

add("HK", "brands", [
  { name: "Amoy Dim Sum", local: "淘大點心", desc: "아모이 딤섬은 이번 주 '로열 덤플링' 론칭을 로맨스 스토리텔링으로 풀어내며 젊은 홍콩 소비자에게 다시 들어갔습니다. 로컬 팝컬처와 냉동식품을 잘 묶은 브랜드 사례입니다.", tags: ["food-brand"], urls: [source.hkAmoy], heat: 87, status: "new" },
  { name: "Pacific Place", local: "Pacific Place", desc: "퍼시픽 플레이스는 영화 IP와 패션몰 경험을 한 번에 묶으며 이번 주 홍콩 패션 리테일 화제를 만들었습니다. 쇼핑몰 자체가 패션 브랜드처럼 보이는 캠페인이었습니다.", tags: ["retail-brand"], urls: [source.hkPacificPlace], heat: 84, status: "new" },
  { name: "Giordano", local: "佐丹奴", desc: "지오다노는 새 태그라인과 새 매장 포맷을 함께 내놓으면서 홍콩 로컬 캐주얼 브랜드 재정비 흐름을 분명히 보였습니다. 세대 확장과 프리미엄 캐주얼 쪽이 핵심입니다.", tags: ["fashion-brand"], urls: [source.hkGiordano], heat: 83, status: "new" },
  { name: "Longines", local: "Longines", desc: "롱진은 하이드로컨퀘스트 리뉴얼 라인과 오감형 팝업을 같이 내세우며 홍콩 럭셔리 워치 브랜드 화제에 올랐습니다. 제품보다 경험까지 같이 설계한 점이 강합니다.", tags: ["watch-brand"], urls: [source.hkLongines], heat: 82, status: "new" },
  { name: "Colgate Optic White", local: "高露潔 Optic White", desc: "콜게이트는 홍콩 카페를 '치아 미백 랩'으로 바꾸면서 Optic White를 전문성 있는 미백 브랜드로 다시 포지셔닝했습니다. 커피와 착색 고민을 연결한 메시지가 선명합니다.", tags: ["beauty-brand"], urls: [source.hkColgate], heat: 81, status: "new" },
]);

add("HK", "products", [
  { name: "Colgate Optic White", local: "Colgate Optic White", desc: "홍콩 팝업에서 직접 앞세운 대표 미백 라인입니다. 커피 얼룩과 황변을 해결하는 전문형 제품으로 소개되며 재노출됐습니다.", tags: ["colgate", "whitening"], urls: [source.hkColgate], heat: 82, status: "new" },
  { name: "HydroConquest 39mm Automatic", local: "HydroConquest 39mm 오토매틱", desc: "롱진이 2026 리뉴얼 라인에서 핵심 사이즈로 소개한 제품군입니다. 더 작고 일상형인 다이버 워치 수요를 겨냥합니다.", tags: ["longines", "watch"], urls: [source.hkLongines], heat: 81, status: "new" },
  { name: "HydroConquest 41mm Automatic", local: "HydroConquest 41mm 오토매틱", desc: "롱진이 함께 전개한 또 다른 주력 사이즈입니다. 스포츠와 럭셔리를 같이 가져가는 워치 선택지로 보입니다.", tags: ["longines", "watch"], urls: [source.hkLongines], heat: 80, status: "new" },
  { name: "Sunkist Citrus Phone Case", local: "선키스트 시트러스 폰 케이스", desc: "선키스트 K11 팝업에서 가장 먼저 눈에 들어온 한정 굿즈입니다. 과일 브랜드가 패션 소품과 휴대폰 액세서리로 옮겨간 제품 사례입니다.", tags: ["sunkist", "accessory"], urls: [source.hkSunkist], heat: 79, status: "new" },
  { name: "Sunkist Orange Charm", local: "선키스트 오렌지 참", desc: "같은 팝업에서 교체형 참 형태로 나온 시트러스 소품입니다. 백참과 폰참 문화가 강한 홍콩 소비자 취향과 잘 맞습니다.", tags: ["sunkist", "accessory"], urls: [source.hkSunkist], heat: 78, status: "new" },
]);

add("HK", "challenge", [
  { name: "Jin - Don't Say You Love Me", local: "진 - 돈트 세이 유 러브 미", desc: "홍콩 Spotify 차트 상위권에서 강하게 보이는 곡입니다. 팬덤 기반 확산력과 감성형 숏폼 적합성이 모두 높습니다.", tags: ["spotify", "music"], urls: [source.hkKworb], heat: 90, status: "rising", scores: { search: 83, social: 94, ecommerce: 8, news: 66 } },
  { name: "Andy Lau, Keung To - 沒有翅膀的天使", local: "앤디 라우, 강도 - 날개 없는 천사", desc: "홍콩 로컬 스타 조합이 붙은 곡이라 지역 차트 존재감이 큽니다. 로컬 팬덤과 세대 교차 관심을 동시에 잡는 곡입니다.", tags: ["spotify", "music"], urls: [source.hkKworb], heat: 88, status: "rising", scores: { search: 81, social: 92, ecommerce: 8, news: 65 } },
  { name: "Keung To - 寂寞圓舞", local: "강도 - 적막한 원무", desc: "홍콩 차트에서 강도가 계속 상위권을 차지하는 흐름을 보여주는 곡입니다. 감정 몰입형 릴스 배경음으로 잘 붙을 수 있습니다.", tags: ["spotify", "music"], urls: [source.hkKworb], heat: 86, scores: { search: 79, social: 91, ecommerce: 8, news: 63 } },
  { name: "Keung To - 你要倔強", local: "강도 - 너는 끝까지 버텨야 해", desc: "의지와 버팀을 건드리는 제목 덕분에 텍스트형 영상에 붙기 쉬운 곡입니다. 홍콩 차트 상위권 유지력이 보였습니다.", tags: ["spotify", "music"], urls: [source.hkKworb], heat: 84, scores: { search: 77, social: 89, ecommerce: 8, news: 62 } },
  { name: "Anson Lo - 本命", local: "안슨 로 - 본명", desc: "홍콩 로컬 팬덤 기반이 강한 트랙으로 이번 주 차트에서 존재감을 보였습니다. 팬 편집형 영상과 클로즈업형 릴스에 잘 맞는 곡입니다.", tags: ["spotify", "music"], urls: [source.hkKworb], heat: 83, scores: { search: 76, social: 88, ecommerce: 8, news: 61 } },
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
    return `(${[
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
    ].map(q).join(", ")}, ${arr(row.tags)}, ${arr(row.source_urls)}, ${q(row.first_detected_at)}, ${q(row.last_updated_at)})`;
  }).join(",\n");
}

function buildFullSql(rows) {
  return [
    "-- 2026-04-24 ID/PH/SG/TW/HK verified Korean trend refresh",
    "-- 범위: ID, PH, SG, TW, HK / 국가별 25개 / 총 125개",
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
  if (records.length !== 125 || bad.length) {
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

    if (summary.rows.reduce((sum, row) => sum + row.count, 0) !== 125) {
      throw new Error(`삽입 결과가 125개가 아닙니다: ${JSON.stringify(summary.rows)}`);
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
