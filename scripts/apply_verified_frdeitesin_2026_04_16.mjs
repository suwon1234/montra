import { readFileSync, writeFileSync } from 'fs';
import pg from 'pg';

const WINDOW_DATE = '2026-04-16';
const TARGET_COUNTRIES = ['FR', 'DE', 'IT', 'ES', 'IN'];
const FULL_SQL = 'scripts/output/verified_FRDEITESIN_full_ko_2026-04-16.sql';

const countries = {
  FR: ['f25e479a-b039-4473-9650-05cdcd9d66e1', '프랑스', 'France', 'France', '🇫🇷', 'europe', 'Western Europe', 'Europe/Paris', 'fr-FR', 'Amazon France', 'Instagram'],
  DE: ['5fcac716-e123-4a01-927f-eeef6e140d7d', '독일', 'Germany', 'Deutschland', '🇩🇪', 'europe', 'Western Europe', 'Europe/Berlin', 'de-DE', 'Amazon Germany', 'TikTok'],
  IT: ['cca49c7f-2498-49a7-824e-356deabc4dc9', '이탈리아', 'Italy', 'Italia', '🇮🇹', 'europe', 'Southern Europe', 'Europe/Rome', 'it-IT', 'Amazon Italy', 'Instagram'],
  ES: ['2d18b4ed-0c6f-428e-ba11-be2b95a3252d', '스페인', 'Spain', 'España', '🇪🇸', 'europe', 'Southern Europe', 'Europe/Madrid', 'es-ES', 'Amazon Spain', 'TikTok'],
  IN: ['35647959-6860-4d5b-8286-211210329bd2', '인도', 'India', 'भारत', '🇮🇳', 'asia', 'South Asia', 'Asia/Kolkata', 'hi-IN', 'Flipkart', 'Instagram'],
};

const categoryIds = {
  brands: '47d77b6d-3c38-4861-ac3a-1dfe04277da5',
  challenge: '395a5576-8c5e-40a6-a965-28ead697a232',
  fashion: '98561c59-d4db-41d7-b7e6-545614e37e87',
  food: '989c0361-82f8-4805-a4b1-285a7ee420de',
  products: 'faba0b6a-bbbe-4eb6-8035-23c7e5b2a61b',
};

const source = {
  frTourtel: 'https://www.rayon-boissons.com/bieres-et-cidres/tourtel-twist-elargit-son-offre-avec-deux-nouveautes-sans-sucres',
  frBeer: 'https://www.rayon-boissons.com/bieres-et-cidres/les-principales-innovations-bieres-du-premier-trimestre-2026',
  frPerrier: 'https://www.foodbev.com/news/maison-perrier-launches-french-kiss-first-sweetened-sparkling-water-with-prebiotics',
  frShoes: 'https://www.vogue.fr/article/tendances-chaussures-printemps-ete-2026-prix-doux',
  frBags: 'https://www.vogue.fr/article/sacs-iconiques-printemps-2026-tendances-mode',
  frFlip: 'https://www.vogue.fr/article/tendances-tongs-ete-2026',
  frKworb: 'https://kworb.net/spotify/country/fr_daily.html',
  deAlpro: 'https://www.foodbev.com/post301/danone-expands-alpro-portfolio-with-plant-based-meal-replacement-drinks',
  deDesperados: 'https://www.about-drinks.com/desperados-erweitert-portfolio-tropical-daiquiri/',
  deDrinks: 'https://www.about-drinks.com/?page_id=0',
  deVodka: 'https://www.about-drinks.com/launch-von-9-mile-skinny-btch-im-fruehjahr-2026/',
  deShoes: 'https://www.vogue.de/artikel/schuhtrends-fruehjahr-sommer-2026',
  deFashion: 'https://www.discovergermany.com/fashion-finds-april-2026/',
  deKworb: 'https://kworb.net/spotify/country/de_daily.html',
  itBarilla: 'https://people.com/barilla-celebrates-f1-with-racing-wheels-pasta-11949415',
  itLec: 'https://www.italiaatavola.net/alimenti-bevande/2026/4/9/gelato-leclerc-cresce-nuovo-gusto-obiettivo-espansione/118531/',
  itSanpellegrino: 'https://www.foodbev.com/news/nestl%C3%A9-s-sanpellegrino-moves-into-functional-soda-with-vitamin-fortified-launch',
  itLimonce: 'https://drinks-intel.com/spirits/this-weeks-new-spirits-launches-6-10-april-2026/',
  itBlazer: 'https://www.vogue.it/article/blazer-colorato-primavera-estate-2026-modelli-tendenze',
  itLoafer: 'https://www.vogue.it/article/mocassini-con-tacco-primavera-estate-2026-modelli-tendenza',
  itBags: 'https://www.vogue.it/article/borse-camoscio-colori-suede-modelli-tendenza',
  itRedShoes: 'https://www.vogue.it/article/scarpe-rosse-primavera-estate-2026-modelli-tendenza',
  itVoodoo: 'https://www.vogue.it/article/novita-moda-primavera-estate-2026',
  itKworb: 'https://www.kworb.net/spotify/country/it_daily.html',
  esLay: 'https://www.foodbev.com/news/pepsico-launches-first-lay-s-branded-restaurant-concept-in-madrid',
  esMahou: 'https://www.revistaaral.com/texto-diario/mostrar/5839321/mahou-san-miguel-refuerza-liderazgo-cerveza-alcohol-lanzamiento-mahou-00-rubia',
  esEneryeti: 'https://www.revistaaral.com/texto-diario/mostrar/5782534/eneryeti-presenta-nueva-bebida-sabor-maracuya',
  esNestle: 'https://www.revistaaral.com/texto-diario/mostrar/5818673/nestle-presenta-nuevo-nescafe-espresso-concentrate-alimentaria',
  esPuleva: 'https://www.foodbev.com/news/bioiberica-and-lactalis-launch-spain-s-first-collagen-enriched-milk-drink',
  esVogue: 'https://www.vogue.es/galerias/compras-tendencias-2026-obsesiones-abril',
  esBags: 'https://www.vogue.es/articulos/bolsos-tendencias-primavera-verano-2026',
  esShoes: 'https://www.vogue.es/articulos/zapatos-tendencias-primavera-verano-2026',
  esKworb: 'https://kworb.net/spotify/country/es_daily.html',
  inPowerade: 'https://www.business-standard.com/content/press-releases-ani/powerade-enters-india-as-official-sports-drink-of-the-icc-men-s-t20-world-cup-2026-126022700866_1.html',
  inNutrica: 'https://www.business-standard.com/content/press-releases-ani/nutrica-foods-strengthens-its-consumer-network-engages-5-000-visitors-at-aahar-2026-126031800590_1.html',
  inMyntra: 'https://timesofindia.indiatimes.com/business/myntra-welcomes-alia-bhatt-as-the-brand-ambassador-for-fashion-and-beauty/articleshow/130141620.cms',
  inBeach: 'https://www.vogue.in/content/this-is-the-best-beachwear-for-a-summer-wardrobe-with-personality',
  inBags: 'https://www.vogue.in/content/your-lehenga-has-a-plus-one-and-its-these-bridal-bags',
  inSari: 'https://www.vogue.in/content/the-sari-gown-is-the-smartest-buy-for-festive-season',
  inAccessories: 'https://www.vogue.in/content/from-desks-to-dinners-statement-accessories-to-elevate-your-friday-night-agenda',
  inKworb: 'https://kworb.net/spotify/country/in_daily.html',
};

const records = [
];

function rec(country, category, name, nameLocal, description, tags, sourceUrls, heatScore, heatStatus = 'rising', scores = {}) {
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
    ecommerce_score: scores.ecommerce ?? (category === 'challenge' ? 8 : Math.max(60, heatScore - 4)),
    news_score: scores.news ?? Math.max(58, heatScore - 8),
    tags: ['weekly-research', 'verified', 'ko-copy', WINDOW_DATE, ...tags],
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
      row.status ?? 'rising',
      row.scores ?? {},
    ));
  }
}

add('FR', 'food', [
  { name: 'Tourtel Twist Sans Sucres Citron', local: '투르텔 트위스트 무가당 레몬', desc: '프랑스 무알코올 과일맥주 라인에서 설탕을 뺀 레몬 맛 신제품입니다.', tags: ['tourtel', 'zero-sugar'], urls: [source.frTourtel], heat: 86, scores: { search: 82, social: 78, ecommerce: 84, news: 80 } },
  { name: 'Tourtel Twist Sans Sucres Framboise', local: '투르텔 트위스트 무가당 라즈베리', desc: '무가당 콘셉트를 라즈베리 맛으로 확장한 프랑스 봄 음료 신제품입니다.', tags: ['tourtel', 'raspberry'], urls: [source.frTourtel], heat: 84, scores: { search: 80, social: 77, ecommerce: 83, news: 79 } },
  { name: 'Birra Moretti 66cl GMS France', local: '비라 모레티 66cl 프랑스 대형마트형', desc: '프랑스 맥주 신제품 흐름에서 소개된 수입맥주 대용량 소매 포맷입니다.', tags: ['beer', 'retail'], urls: [source.frBeer], heat: 79, scores: { search: 75, social: 70, ecommerce: 80, news: 76 } },
  { name: 'Maison Perrier French Kiss Blackberry & Lemon', local: '메종 페리에 프렌치 키스 블랙베리 레몬', desc: '프리바이오틱스와 과일 맛을 결합한 메종 페리에의 달콤한 기능성 탄산수입니다.', tags: ['perrier', 'prebiotic'], urls: [source.frPerrier], heat: 82, scores: { search: 78, social: 76, ecommerce: 81, news: 83 } },
  { name: 'Maison Perrier French Kiss Peach & Cherry', local: '메종 페리에 프렌치 키스 복숭아 체리', desc: '복숭아와 체리 맛으로 확장된 French Kiss 라인의 프리미엄 탄산수입니다.', tags: ['perrier', 'sparkling-water'], urls: [source.frPerrier], heat: 80, scores: { search: 76, social: 75, ecommerce: 79, news: 82 } },
]);

add('FR', 'fashion', [
  { name: 'Jelly Tongs Printemps 2026', local: '젤리 통 샌들 2026 봄', desc: 'Vogue France가 봄 슈즈 트렌드로 다룬 Y2K 무드의 젤리 소재 통 샌들입니다.', tags: ['shoes', 'jelly-sandals'], urls: [source.frShoes], heat: 88, status: 'rising', scores: { search: 84, social: 86, ecommerce: 87, news: 79 } },
  { name: 'Ballerines Froncees', local: '프론스 디테일 발레리나 플랫', desc: '주름 디테일을 더한 발레리나 플랫으로 프랑스식 데일리 봄 슈즈 흐름에 맞습니다.', tags: ['ballet-flats'], urls: [source.frShoes], heat: 84, scores: { search: 80, social: 81, ecommerce: 83, news: 77 } },
  { name: 'Louis Vuitton Sac Express PM', local: '루이비통 삭 익스프레스 PM', desc: 'Vogue France의 2026 봄 아이코닉 백 흐름에서 주목된 작은 명품 데일리 백입니다.', tags: ['louis-vuitton', 'luxury-bag'], urls: [source.frBags], heat: 87, scores: { search: 83, social: 84, ecommerce: 86, news: 80 } },
  { name: 'Saint Laurent Mombasa Medium Leopard', local: '생로랑 몸바사 미디엄 레오파드', desc: '레오파드 패턴과 곡선 핸들로 강한 포인트를 주는 생로랑 아이코닉 백입니다.', tags: ['saint-laurent', 'leopard'], urls: [source.frBags], heat: 83, scores: { search: 79, social: 82, ecommerce: 82, news: 77 } },
  { name: 'Havaianas x Gigi Hadid Flip-Flops', local: '하바이아나스 x 지지 하디드 플립플롭', desc: '셀러브리티 협업과 여름 플립플롭 트렌드가 겹친 프랑스 패션 관심 아이템입니다.', tags: ['flip-flops', 'collaboration'], urls: [source.frFlip], heat: 81, scores: { search: 77, social: 84, ecommerce: 80, news: 74 } },
]);

add('FR', 'brands', [
  { name: 'Tourtel Twist', local: '투르텔 트위스트', desc: '무알코올 과일맥주에 무가당 라인을 추가하며 프랑스 음료 매장에서 노출이 커진 브랜드입니다.', tags: ['beverage-brand'], urls: [source.frTourtel], heat: 88, status: 'rising', scores: { search: 84, social: 81, ecommerce: 86, news: 83 } },
  { name: 'Brasseries Kronenbourg', local: '브라스리 크로넨부르', desc: 'Tourtel Twist 확장을 통해 무알코올과 저당 음료 흐름에서 다시 언급되는 프랑스 맥주 기업입니다.', tags: ['brewery'], urls: [source.frTourtel], heat: 80, scores: { search: 76, social: 72, ecommerce: 79, news: 82 } },
  { name: 'Maison Perrier', local: '메종 페리에', desc: 'French Kiss 출시로 기능성 탄산수와 프리미엄 워터 사이의 관심을 끌고 있습니다.', tags: ['perrier', 'functional-beverage'], urls: [source.frPerrier], heat: 85, scores: { search: 81, social: 80, ecommerce: 83, news: 85 } },
  { name: 'Birra Moretti', local: '비라 모레티', desc: '프랑스 맥주 신제품 기사에서 대형 소매 포맷 확대가 확인된 이탈리아 맥주 브랜드입니다.', tags: ['beer-brand'], urls: [source.frBeer], heat: 78, scores: { search: 74, social: 70, ecommerce: 79, news: 75 } },
  { name: 'Louis Vuitton', local: '루이비통', desc: '아이코닉 백과 투자형 명품 가방 흐름에서 프랑스 패션 관심을 계속 받는 브랜드입니다.', tags: ['luxury', 'bags'], urls: [source.frBags], heat: 89, status: 'rising', scores: { search: 85, social: 88, ecommerce: 86, news: 82 } },
]);

add('FR', 'products', [
  { name: 'Tourtel Twist Citron Sans Sucres 6x33cl', local: '투르텔 트위스트 레몬 무가당 6x33cl', desc: '낮은 당과 휴대성을 앞세운 무알코올 레몬 맛 슬림 캔 묶음 제품입니다.', tags: ['canned-drink', 'zero-sugar'], urls: [source.frTourtel], heat: 85, scores: { search: 81, social: 77, ecommerce: 86, news: 79 } },
  { name: 'Tourtel Twist Framboise Sans Sucres 6x33cl', local: '투르텔 트위스트 라즈베리 무가당 6x33cl', desc: '라즈베리 향과 무가당 콘셉트를 함께 내세운 프랑스 무알코올 음료 제품입니다.', tags: ['canned-drink', 'raspberry'], urls: [source.frTourtel], heat: 83, scores: { search: 79, social: 76, ecommerce: 84, news: 78 } },
  { name: 'Maison Perrier French Kiss Mango & Coconut', local: '메종 페리에 프렌치 키스 망고 코코넛', desc: '열대 과일 맛과 프리바이오틱스 콘셉트를 결합한 French Kiss 라인 제품입니다.', tags: ['functional-water', 'mango-coconut'], urls: [source.frPerrier], heat: 81, scores: { search: 77, social: 78, ecommerce: 80, news: 82 } },
  { name: 'Louis Vuitton Sac Express PM', local: '루이비통 삭 익스프레스 PM', desc: '여행가방 감성을 작은 사이즈로 줄인 루이비통 명품 데일리 백입니다.', tags: ['luxury-bag'], urls: [source.frBags], heat: 88, status: 'rising', scores: { search: 84, social: 86, ecommerce: 87, news: 80 } },
  { name: 'Saint Laurent Mombasa Medium Leopard', local: '생로랑 몸바사 미디엄 레오파드', desc: '레오파드 패턴을 입힌 생로랑 Mombasa 미디엄 백으로 강한 포인트 쇼핑 수요가 있습니다.', tags: ['luxury-bag', 'leopard'], urls: [source.frBags], heat: 82, scores: { search: 78, social: 82, ecommerce: 81, news: 76 } },
]);

add('FR', 'challenge', [
  { name: 'PLK - Pocahontas', local: 'PLK - 포카혼타스', desc: '프랑스 Spotify 일간 차트 최상위권의 로컬 랩 트랙으로 숏폼 배경음에 맞습니다.', tags: ['spotify', 'music'], urls: [source.frKworb], heat: 94, status: 'rising', scores: { search: 90, social: 92, ecommerce: 8, news: 72 } },
  { name: 'disiz, Theodora - melodrama', local: 'disiz, Theodora - 멜로드라마', desc: '감정선이 뚜렷해 무드형 영상과 립싱크 소재로 쓰기 좋은 프랑스 차트 상위곡입니다.', tags: ['spotify', 'music'], urls: [source.frKworb], heat: 91, status: 'rising', scores: { search: 87, social: 89, ecommerce: 8, news: 70 } },
  { name: 'RnBoi - ELLE VOULAIT', local: 'RnBoi - ELLE VOULAIT', desc: '프랑스 차트에서 빠르게 올라온 트랙으로 반복 후렴이 짧은 클립에 적합합니다.', tags: ['spotify', 'music'], urls: [source.frKworb], heat: 89, status: 'rising', scores: { search: 85, social: 88, ecommerce: 8, news: 68 } },
  { name: 'Rambo goyard - B.M.S', local: 'Rambo goyard - B.M.S', desc: '프랑스 로컬 랩 차트 상위권 곡으로 팬덤 기반 오디오 관심도가 높습니다.', tags: ['spotify', 'music'], urls: [source.frKworb], heat: 86, scores: { search: 82, social: 84, ecommerce: 8, news: 66 } },
  { name: 'Nono La Grinta - LOVE YOU', local: 'Nono La Grinta - LOVE YOU', desc: '프랑스 Spotify 상위권에서 상승 흐름이 보이는 커플형 숏폼 친화 오디오입니다.', tags: ['spotify', 'music'], urls: [source.frKworb], heat: 84, scores: { search: 80, social: 83, ecommerce: 8, news: 64 } },
]);

add('DE', 'food', [
  { name: 'Alpro Meal To Go 500ml', local: '알프로 밀 투 고 500ml', desc: '다논이 알프로 라인에 추가한 식물성 식사대용 음료로 간편 영양 수요를 겨냥합니다.', tags: ['alpro', 'plant-based'], urls: [source.deAlpro], heat: 86, scores: { search: 82, social: 77, ecommerce: 84, news: 83 } },
  { name: 'Alpro Meal To Go Vanilla', local: '알프로 밀 투 고 바닐라', desc: '식물성 단백질과 익숙한 바닐라 맛을 결합한 독일권 간편식 음료 관심 제품입니다.', tags: ['alpro', 'vanilla'], urls: [source.deAlpro], heat: 83, scores: { search: 79, social: 74, ecommerce: 82, news: 81 } },
  { name: 'Desperados Tropical Daiquiri', local: '데스페라도스 트로피컬 다이키리', desc: '패션프루트와 라임을 앞세운 독일 시장용 트로피컬 비어믹스 신제품입니다.', tags: ['desperados', 'beer-mix'], urls: [source.deDesperados], heat: 87, status: 'rising', scores: { search: 83, social: 85, ecommerce: 86, news: 80 } },
  { name: 'Kumpf Landschorle Maracuja', local: '쿰프 란트쇼를레 마라쿠야', desc: '봄 시즌에 맞춰 나온 마라쿠야 맛 지역 과일 탄산 음료입니다.', tags: ['schorle', 'maracuja'], urls: [source.deDrinks], heat: 79, scores: { search: 75, social: 72, ecommerce: 79, news: 76 } },
  { name: '9 MILE Skinny B*tch RTD', local: '9 마일 스키니 비치 RTD', desc: '보드카, 소다, 라임 기반의 저당 RTD 캔으로 독일 봄 주류 신제품 흐름에 맞습니다.', tags: ['vodka', 'rtd'], urls: [source.deVodka], heat: 82, scores: { search: 78, social: 80, ecommerce: 81, news: 79 } },
]);

add('DE', 'fashion', [
  { name: 'Aeyde Glove Pumps', local: '아이데 글러브 펌프스', desc: 'Vogue Germany의 봄여름 슈즈 흐름에서 포착된 부드럽고 미니멀한 펌프스입니다.', tags: ['shoes', 'pumps'], urls: [source.deShoes], heat: 82, scores: { search: 78, social: 78, ecommerce: 82, news: 75 } },
  { name: 'Dries Van Noten Slim Sneakers', local: '드리스 반 노튼 슬림 스니커즈', desc: '낮고 얇은 실루엣의 패션 스니커즈로 독일 봄 신발 트렌드에 들어갑니다.', tags: ['sneakers', 'minimal'], urls: [source.deShoes], heat: 85, scores: { search: 81, social: 82, ecommerce: 84, news: 76 } },
  { name: 'Khaite Pumps', local: '카이트 펌프스', desc: '오피스룩과 드레스업 사이에서 활용되는 세련된 독일 봄 슈즈 관심 아이템입니다.', tags: ['shoes', 'luxury'], urls: [source.deShoes], heat: 80, scores: { search: 76, social: 77, ecommerce: 80, news: 73 } },
  { name: 'Betty & Co Co-ord Set', local: '베티 앤 코 셋업', desc: '간단히 차려입을 수 있는 봄 셋업으로 독일 데일리 포멀 수요와 맞습니다.', tags: ['co-ord', 'spring-fashion'], urls: [source.deFashion], heat: 78, scores: { search: 74, social: 73, ecommerce: 78, news: 72 } },
  { name: 'Betty & Co Short-Sleeve Shirt', local: '베티 앤 코 반소매 셔츠', desc: '출근복과 주말복 사이에서 쓰기 좋은 실용형 봄 셔츠 아이템입니다.', tags: ['shirt', 'spring-fashion'], urls: [source.deFashion], heat: 76, scores: { search: 72, social: 71, ecommerce: 77, news: 70 } },
]);

add('DE', 'brands', [
  { name: 'Alpro', local: '알프로', desc: '식물성 식사대용 음료로 포트폴리오를 넓히며 독일 식물성 음료 관심을 끌고 있습니다.', tags: ['plant-based-brand'], urls: [source.deAlpro], heat: 88, status: 'rising', scores: { search: 84, social: 81, ecommerce: 86, news: 84 } },
  { name: 'Desperados', local: '데스페라도스', desc: 'Tropical Daiquiri 출시로 독일 비어믹스와 Gen Z 파티 음료 흐름에서 노출이 커졌습니다.', tags: ['beer-brand', 'gen-z'], urls: [source.deDesperados], heat: 86, status: 'rising', scores: { search: 82, social: 86, ecommerce: 84, news: 79 } },
  { name: 'fritz-kola', local: '프리츠 콜라', desc: 'organic 이름과 새 레시피로 업데이트되며 독일 로컬 콜라 관심을 다시 받습니다.', tags: ['cola', 'organic'], urls: [source.deDrinks], heat: 81, scores: { search: 77, social: 78, ecommerce: 80, news: 76 } },
  { name: 'Betty & Co', local: '베티 앤 코', desc: '4월 패션 추천에서 셋업과 셔츠 중심으로 노출된 독일 실용 패션 브랜드입니다.', tags: ['fashion-brand'], urls: [source.deFashion], heat: 77, scores: { search: 73, social: 72, ecommerce: 77, news: 71 } },
  { name: '9 MILE Vodka', local: '9 마일 보드카', desc: '저당 RTD 출시로 독일 캔 주류와 클럽 문화 이미지가 함께 움직이는 브랜드입니다.', tags: ['vodka', 'rtd'], urls: [source.deVodka], heat: 82, scores: { search: 78, social: 81, ecommerce: 81, news: 78 } },
]);

add('DE', 'products', [
  { name: 'Alpro Meal To Go 500ml', local: '알프로 밀 투 고 500ml', desc: '이동 중 한 끼 대체와 운동 후 보충을 겨냥한 500ml 식물성 음료입니다.', tags: ['meal-drink', 'plant-based'], urls: [source.deAlpro], heat: 85, scores: { search: 81, social: 76, ecommerce: 84, news: 82 } },
  { name: 'Desperados Tropical Daiquiri 0.33l Bottle', local: '데스페라도스 트로피컬 다이키리 0.33L 병', desc: '패션프루트와 라임 맛을 담은 독일 봄여름 파티용 비어믹스 병 제품입니다.', tags: ['beer-mix', 'bottle'], urls: [source.deDesperados], heat: 86, status: 'rising', scores: { search: 82, social: 85, ecommerce: 85, news: 79 } },
  { name: 'Kumpf Landschorle Maracuja', local: '쿰프 란트쇼를레 마라쿠야', desc: '지역성과 시즌성이 뚜렷한 마라쿠야 맛 과일 쇼를레 신제품입니다.', tags: ['fruit-schorle'], urls: [source.deDrinks], heat: 79, scores: { search: 75, social: 72, ecommerce: 79, news: 76 } },
  { name: 'fritz-kola organic', local: '프리츠 콜라 오가닉', desc: 'bio-kola를 organic 이름과 새 디자인으로 바꾼 독일 로컬 콜라 제품입니다.', tags: ['cola', 'organic'], urls: [source.deDrinks], heat: 80, scores: { search: 76, social: 78, ecommerce: 80, news: 75 } },
  { name: '9 MILE Skinny B*tch 330ml Can', local: '9 마일 스키니 비치 330ml 캔', desc: '보드카, 소다, 라임 조합의 저당 330ml RTD 캔입니다.', tags: ['rtd', 'low-sugar'], urls: [source.deVodka], heat: 82, scores: { search: 78, social: 81, ecommerce: 81, news: 78 } },
]);

add('DE', 'challenge', [
  { name: 'Dominic Fike - Babydoll', local: 'Dominic Fike - Babydoll', desc: '독일 Spotify 일간 차트 최상위권의 감성 팝 트랙으로 숏폼 배경음에 적합합니다.', tags: ['spotify', 'music'], urls: [source.deKworb], heat: 94, status: 'rising', scores: { search: 90, social: 91, ecommerce: 8, news: 70 } },
  { name: 'Dardan, Azet - Nonstop', local: 'Dardan, Azet - Nonstop', desc: '독일어권 힙합 팬덤 반응과 빠른 차트 상승을 보이는 로컬 트랙입니다.', tags: ['spotify', 'music'], urls: [source.deKworb], heat: 91, status: 'rising', scores: { search: 87, social: 89, ecommerce: 8, news: 69 } },
  { name: 'Zara Larsson - Lush Life', local: 'Zara Larsson - Lush Life', desc: '재상승한 팝 트랙으로 익숙한 후렴이 회귀형 숏폼 오디오에 잘 맞습니다.', tags: ['spotify', 'music'], urls: [source.deKworb], heat: 88, scores: { search: 84, social: 87, ecommerce: 8, news: 66 } },
  { name: 'Juju - CRASHOUT FREESTYLE', local: 'Juju - CRASHOUT FREESTYLE', desc: '독일 차트 상위권의 로컬 랩 트랙으로 립싱크와 전환 영상에 쓰기 좋습니다.', tags: ['spotify', 'music'], urls: [source.deKworb], heat: 87, scores: { search: 83, social: 86, ecommerce: 8, news: 66 } },
  { name: 'LACAZETTE, Nizi19, Lucio101, Yuyu19 - +49', local: 'LACAZETTE, Nizi19, Lucio101, Yuyu19 - +49', desc: '독일 국가번호를 제목으로 쓴 로컬 랩 트랙이라 지역 밈형 오디오로 적합합니다.', tags: ['spotify', 'music'], urls: [source.deKworb], heat: 86, scores: { search: 82, social: 85, ecommerce: 8, news: 65 } },
]);

add('IT', 'food', [
  { name: 'Barilla Racing Wheels Pasta', local: '바릴라 레이싱 휠 파스타', desc: 'F1 공식 파스타 파트너십을 기념한 바퀴 모양 한정 파스타입니다.', tags: ['barilla', 'pasta', 'f1'], urls: [source.itBarilla], heat: 90, status: 'rising', scores: { search: 86, social: 88, ecommerce: 86, news: 85 } },
  { name: 'Lec Why nut? Gelato', local: '레크 Why nut? 젤라토', desc: '이탈리아 젤라토 브랜드 Lec의 새 맛과 확장 계획이 함께 소개된 디저트 항목입니다.', tags: ['gelato', 'new-flavor'], urls: [source.itLec], heat: 82, scores: { search: 78, social: 81, ecommerce: 78, news: 80 } },
  { name: 'Sanpellegrino Crafted Soda Italiana', local: '산펠레그리노 크래프티드 소다 이탈리아나', desc: '비타민을 더한 기능성 소다 라인으로 프리미엄 탄산 브랜드 확장 흐름에 맞습니다.', tags: ['sanpellegrino', 'functional-soda'], urls: [source.itSanpellegrino], heat: 86, scores: { search: 82, social: 79, ecommerce: 84, news: 84 } },
  { name: 'Limonce Spritz', local: '리몬체 스프리츠', desc: '레몬 리큐어와 스프리츠 소비 흐름이 만난 이탈리아 봄여름 주류 관심 제품입니다.', tags: ['spritz', 'spirits'], urls: [source.itLimonce], heat: 80, scores: { search: 76, social: 78, ecommerce: 78, news: 77 } },
  { name: 'Sanpellegrino Crafted Soda Limonata', local: '산펠레그리노 크래프티드 소다 리모나타', desc: '이탈리아 레모네이드 감성과 기능성 음료 메시지를 함께 쓰는 산펠레그리노 제품입니다.', tags: ['lemonade', 'functional-drink'], urls: [source.itSanpellegrino], heat: 83, scores: { search: 79, social: 76, ecommerce: 82, news: 82 } },
]);

add('IT', 'fashion', [
  { name: 'Blazer Colorato Primavera Estate 2026', local: '컬러 블레이저 2026 봄여름', desc: 'Vogue Italia가 봄여름 트렌드로 다룬 밝은 색감의 블레이저입니다.', tags: ['blazer', 'color'], urls: [source.itBlazer], heat: 88, status: 'rising', scores: { search: 84, social: 85, ecommerce: 86, news: 80 } },
  { name: 'Mocassini con Tacco', local: '굽 있는 로퍼', desc: '클래식 로퍼와 펌프스 사이의 형태로 오피스룩과 데일리룩 모두에 맞습니다.', tags: ['loafers', 'heels'], urls: [source.itLoafer], heat: 86, status: 'rising', scores: { search: 82, social: 84, ecommerce: 85, news: 79 } },
  { name: 'Borse Camoscio Colorate', local: '컬러 스웨이드 백', desc: '갈색뿐 아니라 강한 색감까지 확장된 2026 봄여름 스웨이드 백 흐름입니다.', tags: ['suede-bag', 'color'], urls: [source.itBags], heat: 84, scores: { search: 80, social: 83, ecommerce: 84, news: 78 } },
  { name: 'Scarpe Rosse Primavera Estate 2026', local: '레드 슈즈 2026 봄여름', desc: '단순한 룩에 강한 포인트를 주는 빨간 신발 트렌드입니다.', tags: ['red-shoes'], urls: [source.itRedShoes], heat: 82, scores: { search: 78, social: 82, ecommerce: 81, news: 76 } },
  { name: 'Voodoo Jewels Bold Shapes', local: '부두 주얼스 볼드 셰이프', desc: '미니멀 룩에 강한 장식감을 주는 볼드한 형태의 이탈리아 주얼리 관심 항목입니다.', tags: ['jewelry', 'bold-accessories'], urls: [source.itVoodoo], heat: 78, scores: { search: 74, social: 77, ecommerce: 77, news: 72 } },
]);

add('IT', 'brands', [
  { name: 'Barilla', local: '바릴라', desc: 'F1 협업 파스타로 식문화와 레이싱 팬덤을 연결한 이탈리아 대표 식품 브랜드입니다.', tags: ['food-brand', 'f1'], urls: [source.itBarilla], heat: 91, status: 'rising', scores: { search: 87, social: 89, ecommerce: 87, news: 86 } },
  { name: 'Lec', local: '레크', desc: '젤라토 신제품과 확장 스토리로 노출된 이탈리아 디저트 브랜드입니다.', tags: ['gelato-brand'], urls: [source.itLec], heat: 80, scores: { search: 76, social: 79, ecommerce: 76, news: 78 } },
  { name: 'Sanpellegrino', local: '산펠레그리노', desc: '기능성 소다 출시로 프리미엄 탄산수에서 웰니스 음료로 확장하는 브랜드입니다.', tags: ['beverage-brand', 'functional'], urls: [source.itSanpellegrino], heat: 87, scores: { search: 83, social: 80, ecommerce: 84, news: 85 } },
  { name: 'Limonce', local: '리몬체', desc: '레몬 리큐어와 스프리츠 소비가 맞물리며 봄여름 아페리티보 관심을 받습니다.', tags: ['spirits-brand'], urls: [source.itLimonce], heat: 79, scores: { search: 75, social: 78, ecommerce: 77, news: 76 } },
  { name: 'Voodoo Jewels', local: '부두 주얼스', desc: 'Vogue Italia 봄 패션 신제품 흐름에서 볼드 주얼리 브랜드로 노출됐습니다.', tags: ['jewelry-brand'], urls: [source.itVoodoo], heat: 76, scores: { search: 72, social: 76, ecommerce: 75, news: 70 } },
]);

add('IT', 'products', [
  { name: 'Barilla Racing Wheels Pasta', local: '바릴라 레이싱 휠 파스타', desc: '레이스카 바퀴 모양을 본뜬 한정 파스타로 수집형 패키지와 홈쿠킹 콘텐츠에 맞습니다.', tags: ['pasta', 'limited-edition'], urls: [source.itBarilla], heat: 90, status: 'rising', scores: { search: 86, social: 88, ecommerce: 86, news: 85 } },
  { name: 'Lec Why nut? Gelato', local: '레크 Why nut? 젤라토', desc: '견과류 콘셉트의 젤라토 신제품으로 디저트 신맛 관심을 반영합니다.', tags: ['gelato', 'nuts'], urls: [source.itLec], heat: 81, scores: { search: 77, social: 80, ecommerce: 77, news: 79 } },
  { name: 'Sanpellegrino Crafted Soda Italiana', local: '산펠레그리노 크래프티드 소다 이탈리아나', desc: '비타민을 더한 산펠레그리노 기능성 소다 제품입니다.', tags: ['functional-soda', 'vitamin'], urls: [source.itSanpellegrino], heat: 86, scores: { search: 82, social: 79, ecommerce: 84, news: 84 } },
  { name: 'Limonce Spritz', local: '리몬체 스프리츠', desc: '레몬 리큐어를 스프리츠 방식으로 즐기는 봄여름 음료 제품입니다.', tags: ['spritz', 'lemon'], urls: [source.itLimonce], heat: 80, scores: { search: 76, social: 78, ecommerce: 78, news: 77 } },
  { name: 'Voodoo Jewels Bold Shapes', local: '부두 주얼스 볼드 셰이프', desc: '룩을 강하게 바꾸는 포인트용 볼드 주얼리 제품군입니다.', tags: ['jewelry', 'statement'], urls: [source.itVoodoo], heat: 77, scores: { search: 73, social: 77, ecommerce: 76, news: 71 } },
]);

add('IT', 'challenge', [
  { name: 'Samurai Jay - OSSESSIONE', local: 'Samurai Jay - OSSESSIONE', desc: '이탈리아 Spotify 최상위권 트랙으로 강한 후렴과 팬덤 반응이 있습니다.', tags: ['spotify', 'music'], urls: [source.itKworb], heat: 94, status: 'rising', scores: { search: 90, social: 92, ecommerce: 8, news: 71 } },
  { name: 'Shiva, Geolier - Bad Bad Bad', local: 'Shiva, Geolier - Bad Bad Bad', desc: '이탈리아 랩 팬덤 중심으로 빠르게 소비되는 차트 상위 협업곡입니다.', tags: ['spotify', 'music'], urls: [source.itKworb], heat: 92, status: 'rising', scores: { search: 88, social: 91, ecommerce: 8, news: 70 } },
  { name: 'Shiva, Kid Yugi - Babyface', local: 'Shiva, Kid Yugi - Babyface', desc: '짧은 훅과 강한 아티스트 팬덤을 가진 이탈리아 상위권 트랙입니다.', tags: ['spotify', 'music'], urls: [source.itKworb], heat: 90, status: 'rising', scores: { search: 86, social: 89, ecommerce: 8, news: 69 } },
  { name: 'Shiva, ANNA - Obsessed', local: 'Shiva, ANNA - Obsessed', desc: '패션 전환 영상과 립싱크에 붙기 좋은 Shiva와 ANNA의 협업곡입니다.', tags: ['spotify', 'music'], urls: [source.itKworb], heat: 89, status: 'rising', scores: { search: 85, social: 88, ecommerce: 8, news: 68 } },
  { name: 'Shiva - Spie', local: 'Shiva - Spie', desc: '같은 아티스트의 여러 트랙이 동시에 움직이는 이탈리아 차트 흐름을 반영했습니다.', tags: ['spotify', 'music'], urls: [source.itKworb], heat: 87, scores: { search: 83, social: 86, ecommerce: 8, news: 66 } },
]);

add('ES', 'food', [
  { name: 'Lays Pilla Tortilla Madrid', local: '레이즈 피야 토르티야 마드리드', desc: 'PepsiCo가 마드리드에서 연 Lay’s 첫 레스토랑 콘셉트로 스낵과 토르티야를 연결했습니다.', tags: ['lays', 'restaurant'], urls: [source.esLay], heat: 90, status: 'rising', scores: { search: 86, social: 88, ecommerce: 82, news: 86 } },
  { name: 'Mahou 0,0 Rubia', local: '마오우 0,0 루비아', desc: '스페인 무알코올 맥주 성장 흐름에 맞춰 나온 밝은 라거 스타일 신제품입니다.', tags: ['mahou', 'non-alcoholic-beer'], urls: [source.esMahou], heat: 88, status: 'rising', scores: { search: 84, social: 81, ecommerce: 86, news: 85 } },
  { name: 'Eneryeti Wildz Maracuya', local: '에네르예티 와일즈 마라쿠야', desc: '마라쿠야 맛 저칼로리 에너지 음료로 4월 디지털 캠페인과 함께 노출됩니다.', tags: ['energy-drink', 'maracuja'], urls: [source.esEneryeti], heat: 84, scores: { search: 80, social: 84, ecommerce: 82, news: 78 } },
  { name: 'Nescafe Espresso Concentrate Caramel', local: '네스카페 에스프레소 콘센트레이트 캐러멜', desc: '집에서 차가운 커피를 만들기 쉬운 홈카페형 액상 커피 농축 제품입니다.', tags: ['coffee', 'home-cafe'], urls: [source.esNestle], heat: 83, scores: { search: 79, social: 78, ecommerce: 82, news: 80 } },
  { name: 'Puleva Vita Calcio Colageno', local: '풀레바 비타 칼시오 콜라헤노', desc: '스페인 최초 콜라겐 강화 우유 음료로 기능성 유제품 관심을 반영합니다.', tags: ['functional-dairy', 'collagen'], urls: [source.esPuleva], heat: 82, scores: { search: 78, social: 74, ecommerce: 81, news: 83 } },
]);

add('ES', 'fashion', [
  { name: 'Call It By Your Name Bandana Tote', local: '콜 잇 바이 유어 네임 반다나 토트', desc: 'Vogue Espana 쇼핑 관심 목록에서 포착된 봄철 프린트 토트백입니다.', tags: ['tote-bag', 'bandana'], urls: [source.esVogue], heat: 81, scores: { search: 77, social: 80, ecommerce: 80, news: 74 } },
  { name: 'Massimo Dutti Red Jacket', local: '마시모두티 레드 재킷', desc: '미니멀한 룩에 강한 컬러 포인트를 주는 스페인 봄 쇼핑 관심 아이템입니다.', tags: ['red-jacket'], urls: [source.esVogue], heat: 80, scores: { search: 76, social: 79, ecommerce: 80, news: 73 } },
  { name: 'Gucci Jackie Slim', local: '구찌 재키 슬림', desc: '2026 봄여름 백 트렌드에서 명품 데일리백 관심을 대표하는 슬림한 클래식 백입니다.', tags: ['gucci', 'luxury-bag'], urls: [source.esBags], heat: 86, status: 'rising', scores: { search: 82, social: 85, ecommerce: 84, news: 79 } },
  { name: 'Massimo Dutti Flip-Flop Sandals', local: '마시모두티 플립플롭 샌들', desc: '휴양지와 일상을 오가는 도시형 플립플롭 샌들 흐름을 반영합니다.', tags: ['sandals', 'flip-flops'], urls: [source.esShoes], heat: 82, scores: { search: 78, social: 80, ecommerce: 82, news: 75 } },
  { name: 'Parfois Fringe Flat Sandals', local: '파르푸아 프린지 플랫 샌들', desc: '보헤미안 무드와 실용성을 함께 가진 여름 전환기 플랫 샌들입니다.', tags: ['sandals', 'fringe'], urls: [source.esShoes], heat: 78, scores: { search: 74, social: 76, ecommerce: 78, news: 72 } },
]);

add('ES', 'brands', [
  { name: 'Lays Spain', local: '레이즈 스페인', desc: 'Pilla Tortilla 프로젝트로 스낵 브랜드를 외식 경험까지 확장했습니다.', tags: ['snack-brand', 'foodservice'], urls: [source.esLay], heat: 90, status: 'rising', scores: { search: 86, social: 88, ecommerce: 82, news: 86 } },
  { name: 'Mahou San Miguel', local: '마오우 산 미겔', desc: 'Mahou 0,0 Rubia 출시로 무알코올 맥주 리더십을 다시 강조하고 있습니다.', tags: ['beer-brand', 'non-alcoholic'], urls: [source.esMahou], heat: 89, status: 'rising', scores: { search: 85, social: 82, ecommerce: 86, news: 86 } },
  { name: 'Eneryeti', local: '에네르예티', desc: '마라쿠야 맛 Wildz와 디지털 캠페인으로 젊은 에너지 음료 소비자를 겨냥합니다.', tags: ['energy-drink-brand'], urls: [source.esEneryeti], heat: 83, scores: { search: 79, social: 84, ecommerce: 81, news: 77 } },
  { name: 'Nestle Espana', local: '네슬레 스페인', desc: 'Alimentaria에서 Nescafe Espresso Concentrate 등 간편 커피 혁신 제품을 소개했습니다.', tags: ['coffee-brand'], urls: [source.esNestle], heat: 84, scores: { search: 80, social: 77, ecommerce: 82, news: 82 } },
  { name: 'Puleva', local: '풀레바', desc: '콜라겐 강화 우유 음료로 기능성 유제품 카테고리를 넓힌 스페인 유제품 브랜드입니다.', tags: ['dairy-brand', 'collagen'], urls: [source.esPuleva], heat: 82, scores: { search: 78, social: 74, ecommerce: 81, news: 83 } },
]);

add('ES', 'products', [
  { name: 'Lays Pilla Tortilla', local: '레이즈 피야 토르티야', desc: 'Lay’s를 스페인식 토르티야 레시피에 접목한 마드리드 레스토랑 대표 콘셉트입니다.', tags: ['foodservice', 'tortilla'], urls: [source.esLay], heat: 89, status: 'rising', scores: { search: 85, social: 88, ecommerce: 80, news: 86 } },
  { name: 'Mahou 0,0 Rubia', local: '마오우 0,0 루비아', desc: '식품 유통과 호스피탈리티 채널을 겨냥한 무알코올 밝은 맥주 제품입니다.', tags: ['non-alcoholic-beer', 'lager'], urls: [source.esMahou], heat: 88, status: 'rising', scores: { search: 84, social: 81, ecommerce: 86, news: 85 } },
  { name: 'Eneryeti Wildz Maracuya 500ml', local: '에네르예티 와일즈 마라쿠야 500ml', desc: '강한 캔 디자인과 소셜 캠페인을 앞세운 저칼로리 마라쿠야 에너지 음료입니다.', tags: ['energy-drink', '500ml'], urls: [source.esEneryeti], heat: 84, scores: { search: 80, social: 84, ecommerce: 82, news: 78 } },
  { name: 'Nescafe Espresso Concentrate Caramel', local: '네스카페 에스프레소 콘센트레이트 캐러멜', desc: '우유나 얼음과 섞어 아이스 커피를 만들 수 있는 캐러멜 맛 커피 농축 제품입니다.', tags: ['coffee-concentrate', 'caramel'], urls: [source.esNestle], heat: 83, scores: { search: 79, social: 78, ecommerce: 82, news: 80 } },
  { name: 'ISDIN Flavo C Intense', local: 'ISDIN 플라보 C 인텐스', desc: 'Vogue Espana의 4월 쇼핑 관심 목록에 오른 비타민 C 스킨케어 제품입니다.', tags: ['beauty', 'vitamin-c'], urls: [source.esVogue], heat: 80, scores: { search: 76, social: 78, ecommerce: 80, news: 73 } },
]);

add('ES', 'challenge', [
  { name: 'Jay Wheeler - De Lejitos', local: 'Jay Wheeler - De Lejitos', desc: '스페인 Spotify 최상위권의 로맨틱 라틴 팝 트랙으로 릴스 배경음에 맞습니다.', tags: ['spotify', 'music'], urls: [source.esKworb], heat: 94, status: 'rising', scores: { search: 90, social: 92, ecommerce: 8, news: 71 } },
  { name: 'Omar Courtz - KOKO', local: 'Omar Courtz - KOKO', desc: '짧은 후렴과 리듬감이 강해 댄스와 전환 영상에 적합한 라틴 트랙입니다.', tags: ['spotify', 'music'], urls: [source.esKworb], heat: 91, status: 'rising', scores: { search: 87, social: 90, ecommerce: 8, news: 69 } },
  { name: 'Justin Bieber, Nicki Minaj - Beauty And A Beat', local: 'Justin Bieber, Nicki Minaj - Beauty And A Beat', desc: '익숙한 후렴으로 재상승한 글로벌 팝 트랙이라 회귀형 밈 오디오로 적합합니다.', tags: ['spotify', 'music'], urls: [source.esKworb], heat: 89, status: 'rising', scores: { search: 85, social: 90, ecommerce: 8, news: 67 } },
  { name: 'Quevedo - NI BORRACHO', local: 'Quevedo - NI BORRACHO', desc: '스페인어권 팬덤 기반의 로컬 트랙으로 일상형 립싱크 소재에 맞습니다.', tags: ['spotify', 'music'], urls: [source.esKworb], heat: 87, scores: { search: 83, social: 86, ecommerce: 8, news: 66 } },
  { name: 'Ya Ice, Dilan - Dichavate', local: 'Ya Ice, Dilan - Dichavate', desc: '리듬이 선명해 댄스형 클립이나 거리 영상에 붙기 쉬운 스페인 차트 상위 오디오입니다.', tags: ['spotify', 'music'], urls: [source.esKworb], heat: 86, scores: { search: 82, social: 85, ecommerce: 8, news: 65 } },
]);

add('IN', 'food', [
  { name: 'Powerade Mountain Blast', local: '파워에이드 마운틴 블라스트', desc: 'ICC 남자 T20 월드컵 2026 공식 스포츠 음료로 인도에 진입한 파워에이드 맛입니다.', tags: ['powerade', 'sports-drink'], urls: [source.inPowerade], heat: 90, status: 'rising', scores: { search: 86, social: 88, ecommerce: 86, news: 85 } },
  { name: 'Powerade Fruit Punch', local: '파워에이드 프루트 펀치', desc: '인도 출시 라인업의 과일 맛 스포츠 음료로 크리켓 팬덤과 운동 수요를 겨냥합니다.', tags: ['powerade', 'fruit-punch'], urls: [source.inPowerade], heat: 88, status: 'rising', scores: { search: 84, social: 86, ecommerce: 85, news: 84 } },
  { name: 'Nutrica Pro-Blend Edible Oil', local: '뉴트리카 프로블렌드 식용유', desc: 'AAHAR 2026에서 소개된 건강 지향 식용유 제품군입니다.', tags: ['nutrica', 'edible-oil'], urls: [source.inNutrica], heat: 82, scores: { search: 78, social: 74, ecommerce: 81, news: 80 } },
  { name: 'Nutrica Bee Honey', local: '뉴트리카 비 허니', desc: '천연 감미료와 건강 간식 수요에 맞춘 Nutrica의 꿀 제품입니다.', tags: ['nutrica', 'honey'], urls: [source.inNutrica], heat: 80, scores: { search: 76, social: 73, ecommerce: 79, news: 78 } },
  { name: 'Nutrica Peanut Butter', local: '뉴트리카 피넛버터', desc: '단백질 간식과 아침 식사 대체 수요에 맞춘 Nutrica의 피넛버터 제품입니다.', tags: ['nutrica', 'peanut-butter'], urls: [source.inNutrica], heat: 81, scores: { search: 77, social: 75, ecommerce: 80, news: 78 } },
]);

add('IN', 'fashion', [
  { name: 'Myntra Alia Bhatt Fashion Campaign', local: '민트라 알리아 바트 패션 캠페인', desc: 'Myntra가 알리아 바트를 패션과 뷰티 앰버서더로 기용한 인도 이커머스 캠페인입니다.', tags: ['myntra', 'celebrity-fashion'], urls: [source.inMyntra], heat: 89, status: 'rising', scores: { search: 85, social: 89, ecommerce: 88, news: 83 } },
  { name: 'Vogue India Statement Accessories', local: '보그 인디아 스테이트먼트 액세서리', desc: '데스크에서 저녁 약속까지 이어지는 강한 액세서리 스타일 관심을 반영합니다.', tags: ['accessories', 'statement'], urls: [source.inAccessories], heat: 82, scores: { search: 78, social: 81, ecommerce: 80, news: 75 } },
  { name: 'Vogue India Summer Beachwear', local: '보그 인디아 서머 비치웨어', desc: '여름 개성을 살리는 비치웨어와 리조트룩 수요를 반영한 패션 항목입니다.', tags: ['beachwear', 'summer'], urls: [source.inBeach], heat: 83, scores: { search: 79, social: 82, ecommerce: 81, news: 76 } },
  { name: 'Vogue India Sari-Gown', local: '보그 인디아 사리 가운', desc: '전통 사리와 현대 드레스 실루엣을 결합한 인도 행사복 관심 아이템입니다.', tags: ['sari-gown', 'wedding'], urls: [source.inSari], heat: 84, scores: { search: 80, social: 83, ecommerce: 82, news: 76 } },
  { name: 'Vogue India Bridal Bags', local: '보그 인디아 브라이덜 백', desc: '레헹가와 함께 쓰는 작은 장식 백 수요를 반영한 결혼식 시즌 패션 항목입니다.', tags: ['bridal-bags', 'wedding'], urls: [source.inBags], heat: 82, scores: { search: 78, social: 81, ecommerce: 81, news: 75 } },
]);

add('IN', 'brands', [
  { name: 'Powerade India', local: '파워에이드 인도', desc: '크리켓 월드컵과 스포츠 스타 캠페인을 연결하며 인도에 공식 진입한 스포츠 음료 브랜드입니다.', tags: ['sports-drink-brand'], urls: [source.inPowerade], heat: 90, status: 'rising', scores: { search: 86, social: 88, ecommerce: 86, news: 85 } },
  { name: 'Nutrica Foods', local: '뉴트리카 푸즈', desc: 'AAHAR 2026에서 샘플링과 전시로 노출된 인도 웰니스 FMCG 브랜드입니다.', tags: ['fmcg', 'wellness'], urls: [source.inNutrica], heat: 84, scores: { search: 80, social: 76, ecommerce: 82, news: 82 } },
  { name: 'Myntra', local: '민트라', desc: '알리아 바트 캠페인으로 패션 이커머스와 뷰티 쇼핑 관심을 동시에 끌고 있습니다.', tags: ['fashion-ecommerce'], urls: [source.inMyntra], heat: 89, status: 'rising', scores: { search: 85, social: 89, ecommerce: 88, news: 83 } },
  { name: 'Vogue India', local: '보그 인디아', desc: '비치웨어, 브라이덜 백, 사리 가운 등 계절 패션 콘텐츠가 연달아 노출되고 있습니다.', tags: ['fashion-media'], urls: [source.inBeach, source.inBags, source.inSari, source.inAccessories], heat: 85, scores: { search: 81, social: 84, ecommerce: 80, news: 78 } },
  { name: 'Alia Bhatt x Myntra', local: '알리아 바트 x 민트라', desc: '셀러브리티 영향력과 패션 이커머스가 결합된 인도 캠페인 브랜드 조합입니다.', tags: ['celebrity', 'fashion-campaign'], urls: [source.inMyntra], heat: 88, status: 'rising', scores: { search: 84, social: 89, ecommerce: 86, news: 82 } },
]);

add('IN', 'products', [
  { name: 'Powerade Mountain Blast 250ml', local: '파워에이드 마운틴 블라스트 250ml', desc: '크리켓 경기와 운동 루틴에서 가볍게 구매할 수 있는 스포츠 음료 포맷입니다.', tags: ['sports-drink', '250ml'], urls: [source.inPowerade], heat: 89, status: 'rising', scores: { search: 85, social: 87, ecommerce: 86, news: 84 } },
  { name: 'Powerade Fruit Punch 500ml', local: '파워에이드 프루트 펀치 500ml', desc: '훈련과 야외 운동 상황을 겨냥한 500ml 스포츠 수분 보충 음료입니다.', tags: ['sports-drink', '500ml'], urls: [source.inPowerade], heat: 87, status: 'rising', scores: { search: 83, social: 85, ecommerce: 85, news: 83 } },
  { name: 'Nutrica Pro-Blend Edible Oil', local: '뉴트리카 프로블렌드 식용유', desc: '가족 식단과 웰니스 주방 재료 수요를 겨냥한 식용유 제품입니다.', tags: ['edible-oil', 'wellness'], urls: [source.inNutrica], heat: 82, scores: { search: 78, social: 74, ecommerce: 81, news: 80 } },
  { name: 'Nutrica Bee Honey', local: '뉴트리카 비 허니', desc: '천연 감미료와 건강 간식 관심에 맞춘 Nutrica 꿀 제품입니다.', tags: ['honey', 'natural'], urls: [source.inNutrica], heat: 80, scores: { search: 76, social: 73, ecommerce: 79, news: 78 } },
  { name: 'Nutrica Peanut Butter', local: '뉴트리카 피넛버터', desc: '단백질 보충, 아침 식사, 운동 전후 간식으로 쓰기 쉬운 피넛버터 제품입니다.', tags: ['peanut-butter', 'protein'], urls: [source.inNutrica], heat: 81, scores: { search: 77, social: 75, ecommerce: 80, news: 78 } },
]);

add('IN', 'challenge', [
  { name: 'Banjaare - Bairan', local: 'Banjaare - Bairan', desc: '인도 Spotify 일간 차트 1위권의 고스트리밍 곡으로 숏폼 배경음 관심이 큽니다.', tags: ['spotify', 'music'], urls: [source.inKworb], heat: 94, status: 'rising', scores: { search: 90, social: 92, ecommerce: 8, news: 71 } },
  { name: 'Mitta Ror, Swara Verma - Sheesha', local: 'Mitta Ror, Swara Verma - Sheesha', desc: '인도 차트 상위권의 지역 음악 트랙으로 릴스형 오디오 수요를 반영합니다.', tags: ['spotify', 'music'], urls: [source.inKworb], heat: 91, status: 'rising', scores: { search: 87, social: 90, ecommerce: 8, news: 69 } },
  { name: 'Shashwat Sachdev, Arijit Singh - Gehra Hua', local: 'Shashwat Sachdev, Arijit Singh - Gehra Hua', desc: 'Arijit Singh 참여로 감성 영상 편집과 립싱크에 쓰기 좋은 인도 차트 상위곡입니다.', tags: ['spotify', 'music'], urls: [source.inKworb], heat: 90, status: 'rising', scores: { search: 86, social: 89, ecommerce: 8, news: 69 } },
  { name: 'Shashwat Sachdev, Jasmine Sandlas - Jaiye Sajana', local: 'Shashwat Sachdev, Jasmine Sandlas - Jaiye Sajana', desc: '웨딩, 커플, 감성 클립에 어울리는 드라마틱한 보컬 중심 인도 상위권 트랙입니다.', tags: ['spotify', 'music'], urls: [source.inKworb], heat: 88, scores: { search: 84, social: 87, ecommerce: 8, news: 67 } },
  { name: 'Navjot Ahuja - Khat', local: 'Navjot Ahuja - Khat', desc: '짧은 서사형 영상과 감정선 있는 릴스에 쓰기 좋은 인도 Spotify 상위권 로컬 트랙입니다.', tags: ['spotify', 'music'], urls: [source.inKworb], heat: 86, scores: { search: 82, social: 85, ecommerce: 8, news: 65 } },
]);

function loadEnv() {
  const env = {};
  for (const line of readFileSync('.env.local', 'utf8').split(/\r?\n/)) {
    const index = line.indexOf('=');
    if (index <= 0) continue;
    env[line.slice(0, index).trim()] = line.slice(index + 1).trim();
  }
  return env;
}

function q(value) {
  if (value === null || value === undefined) return 'NULL';
  return `'${String(value).replace(/'/g, "''")}'`;
}

function arr(values) {
  return `ARRAY[${values.map(q).join(',')}]`;
}

function countrySql(code) {
  const [id, ko, en, local, flag, region, sub, timezone, lang, ecommerce, social] = countries[code];
  return `INSERT INTO countries (id, code, name_ko, name_en, name_local, flag_emoji, region, sub_region, timezone, primary_language, primary_ecommerce_platform, primary_social_platform)
SELECT ${[id, code, ko, en, local, flag, region, sub, timezone, lang, ecommerce, social].map(q).join(', ')}
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
    ].map(q).join(', ')}, ${arr(row.tags)}, ${arr(row.source_urls)}, ${q(row.first_detected_at)}, ${q(row.last_updated_at)})`;
  }).join(',\n');
}

function buildFullSql(rows) {
  return [
    '-- 2026-04-16 FR/DE/IT/ES/IN verified Korean trend refresh',
    '-- 범위: FR, DE, IT, ES, IN / 국가별 25개 / 총 125개',
    '',
    'BEGIN;',
    '',
    ...TARGET_COUNTRIES.map(countrySql),
    '',
    `DELETE FROM trends WHERE country_id IN (SELECT id FROM countries WHERE code IN (${TARGET_COUNTRIES.map(q).join(',')})) AND last_updated_at::date = DATE ${q(WINDOW_DATE)};`,
    '',
    'INSERT INTO trends (country_id, category_id, name, name_local, description, heat_score, heat_status, search_score, social_score, ecommerce_score, news_score, tags, source_urls, first_detected_at, last_updated_at) VALUES',
    `${trendSql(rows)};`,
    '',
    'COMMIT;',
    '',
  ].join('\n');
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
    throw new Error(`레코드 수 불일치: total=${records.length}, bad=${JSON.stringify(bad)}`);
  }
}

async function main() {
  validateRecords();
  writeFileSync(FULL_SQL, buildFullSql(records), 'utf8');

  const env = loadEnv();
  const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL || env.DATABASE_URL });
  try {
    await pool.query('BEGIN');

    for (const code of TARGET_COUNTRIES) {
      const [id, ko, en, local, flag, region, sub, timezone, lang, ecommerce, social] = countries[code];
      const existing = await pool.query('SELECT id FROM countries WHERE code = $1', [code]);
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
      throw new Error(`삽입 후 행 수가 125개가 아닙니다: ${JSON.stringify(summary.rows)}`);
    }

    await pool.query('COMMIT');
    console.table(summary.rows);
    console.log(`Docker DB 반영 완료: ${records.length}개`);
    console.log(`완성본 SQL: ${FULL_SQL}`);
  } catch (error) {
    await pool.query('ROLLBACK').catch(() => {});
    throw error;
  } finally {
    await pool.end();
  }
}

main().catch((error) => {
  console.error(error.message);
  process.exit(1);
});
