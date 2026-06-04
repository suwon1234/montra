import { readFileSync, writeFileSync } from 'fs';
import pg from 'pg';

const WINDOW_DATE = '2026-04-16';
const TARGET_COUNTRIES = ['BR', 'CN', 'MX', 'GB'];
const FULL_SQL = 'scripts/output/verified_BRCNMXGB_full_ko_2026-04-16.sql';

const countries = {
  BR: ['b68f5290-0456-4155-8cfa-9044b02cad76', '브라질', 'Brazil', 'Brasil', '🇧🇷', 'americas', 'South America', 'America/Sao_Paulo', 'pt-BR', 'Mercado Livre', 'Instagram'],
  CN: ['514427b2-9b81-4a1b-a1f2-95950a9e2686', '중국', 'China', '中国', '🇨🇳', 'asia', 'East Asia', 'Asia/Shanghai', 'zh-CN', 'Tmall', 'Douyin'],
  MX: ['16875bb4-75e0-4d1f-9e97-fa620ccd0c74', '멕시코', 'Mexico', 'México', '🇲🇽', 'americas', 'North America', 'America/Mexico_City', 'es-MX', 'Mercado Libre', 'TikTok'],
  GB: ['049dccb4-a656-4a52-a456-30fb235334c1', '영국', 'United Kingdom', 'United Kingdom', '🇬🇧', 'europe', 'Western Europe', 'Europe/London', 'en-GB', 'Amazon UK', 'TikTok'],
};

const categoryIds = {
  brands: '47d77b6d-3c38-4861-ac3a-1dfe04277da5',
  challenge: '395a5576-8c5e-40a6-a965-28ead697a232',
  fashion: '98561c59-d4db-41d7-b7e6-545614e37e87',
  food: '989c0361-82f8-4805-a4b1-285a7ee420de',
  products: 'faba0b6a-bbbe-4eb6-8035-23c7e5b2a61b',
};

const source = {
  brSnacks: 'https://mercadoeconsumo.com.br/09/04/2026/produtos/dia-expande-marca-propria-com-novos-produtos-na-linha-de-snacks/',
  brCopa: 'https://mercadoeconsumo.com.br/07/04/2026/marcas/m-dias-branco-lays-e-cachaca-51-entram-em-campo-com-lancamentos-inspirados-na-copa/',
  brRiofw: 'https://www.cnnbrasil.com.br/lifestyle/riofw-veja-datas-de-desfiles-e-marcas-da-edicao-de-2026/',
  brOsklen: 'https://elle.com.br/desfiles/riofw-2026-osklen',
  brSpotify: 'https://open.spotify.com/embed/playlist/37i9dQZEVXbMOkSwG072hV?nd=1',
  cnHeytea: 'https://english.shanghai.gov.cn/en-Editorspick-ShoppinginShanghai/20260330/97445e8bd55d4a02900ce73d74145608.html',
  cnLuckin: 'https://finance.sina.com.cn/tech/roll/2026-03-31/doc-inepytsf2674927.shtml',
  cnPuma: 'https://jingdaily.com/intels/2026-04/03/puma-and-jil-sander-launch-new-k-street-sneaker-collaboration',
  cnBottega: 'https://jingdaily.com/posts/bottega-veneta-intrecciato-louise-trotter-china-apac',
  cnMargiela: 'https://jingdaily.com/posts/china-luxury-shanghai-fashion-week-margiela-2026',
  cnIntel407: 'https://jingdaily.com/intels/2026-04/07',
  cnIntel410: 'https://jingdaily.com/intels/2026-04/10',
  cnIntel414: 'https://jingdaily.com/intels/2026-04/14',
  cnAlo: 'https://jingdaily.com/intels/2026-04/02/alo-names-jimmy-zhu-president-ahead-of-china-market-entry',
  cnErno: 'https://jingdaily.com/intels/2026-04/13/china-s-ruoyuchen-to-acquire-erno-laszlo-for-299-million-rmb',
  cnApple: 'https://music.apple.com/cn/charts',
  mxMaiz: 'https://foodandtravel.mx/sabores/6-platillos-para-disfrutar-la-cocina-mexicana-contemporanea-en-maiz-tinto/',
  mxCampo: 'https://elpais.com/mexico/2026-04-10/campo-marte-26-artistas-calendario-y-precios-del-festival-que-une-la-musica-y-la-pasion-del-mundial.html/',
  mxElle: 'https://elle.mx/moda/2026/04/14/5-tendencias-de-denim-para-primavera-que-debes-probar-ahora',
  mxLowHeel: 'https://www.glamour.mx/articulos/zapatos-de-tacon-bajo-ideales-para-llevar-con-jeans-pantalones-y-faldas-en-primavera-2026',
  mxGrandma: 'https://www.glamour.mx/articulos/los-conjuntos-de-abuela-ideales-para-lograr-el-look-mas-elegante-e-inesperado-de-abril-2026',
  mxShoes: 'https://www.glamour.mx/articulos/de-bailarinas-a-sandalias-de-gladiador-9-zapatos-elegantes-que-reinaran-la-primavera-verano-2026',
  mxGlamour: 'https://www.glamour.mx/moda',
  mxKworb: 'https://www.kworb.net/spotify/country/mx_daily.html',
  gbGreggs: 'https://www.thesun.co.uk/money/38755929/greggs-chicken-sausage-roll-release-price-confirmed/',
  gbMcd: 'https://www.mcdonalds.com/gb/en-gb/menu/whats-new.html',
  gbAero: 'https://www.foodbev.com/news/nestl%C3%A9-taps-pistachio-trend-with-latest-aero-launch',
  gbMadri: 'https://www.foodbev.com/news/molson-coors-targets-43m-fruit-beer-boom-with-madr%C3%AD-excepcional-lim%C3%B3n-launch',
  gbUgg: 'https://www.vogue.co.uk/article/ugg-tasman-trend-spring-2026',
  gbBags: 'https://www.vogue.co.uk/article/spring-summer-2026-bag-trends',
  gbShoes: 'https://www.vogue.co.uk/article/spring-summer-2026-shoe-trends',
  gbCheddars: 'https://www.foodbev.com/news/jacob-s-launches-new-limited-edition-mini-cheddar-flavours',
  gbPlenish: 'https://www.foodbev.com/news/plenish-enters-protein-category-with-clean-label-plant-based-powders',
  gbKworb: 'https://kworb.net/spotify/country/gb_daily.html',
};

const records = [
  rec('BR', 'food', 'Dia Batata On Pizza', 'Batata On Pizza', 'Dia 슈퍼마켓의 자체 스낵 라인 Batata On에 추가된 피자맛 감자칩입니다. 4월 9일 발표된 신제품이라 브라질 매장형 스낵 흐름을 바로 보여줍니다.', ['br', 'food', 'snack', 'dia', 'batata-on'], [source.brSnacks], 84, 'new'),
  rec('BR', 'food', 'Dia Batata On Picante', 'Batata On Picante', 'Dia의 Batata On 라인에 붙은 매운맛 감자칩입니다. 피자맛과 함께 상파울루 전 점포에 깔리는 신상이라 편의형 매운 스낵 수요를 잡기 좋습니다.', ['br', 'food', 'snack', 'dia', 'spicy'], [source.brSnacks], 82, 'new'),
  rec('BR', 'food', 'Good Crackers Queijo', 'Good Crackers Queijo', 'Dia가 수입 크래커 Good Crackers에 추가한 치즈맛입니다. 저가형 간식보다 조금 더 고른 스낵 옵션을 찾는 브라질 장보기 흐름과 맞습니다.', ['br', 'food', 'crackers', 'dia', 'cheese'], [source.brSnacks], 79, 'new'),
  rec('BR', 'food', 'Adria Lámen Zero Fritura Cheddar com Jalapeño', 'Adria Lámen Zero Fritura Cheddar com Jalapeño', 'M. Dias Branco가 월드컵 분위기에 맞춰 낸 튀기지 않은 라면 신상입니다. 멕시코를 떠올리게 하는 체다와 할라피뇨 맛이라 축구 시즌용 간편식으로 보입니다.', ['br', 'food', 'ramen', 'adria', 'world-cup'], [source.brCopa], 86, 'new'),
  rec('BR', 'food', 'Piraquê Cookie Leite Maltado Caramelizado', 'Piraquê Cookie Leite Maltado Caramelizado', 'Piraquê가 월드컵 소비 시즌을 겨냥해 공개한 80g 쿠키입니다. 맥아 우유와 카라멜 맛을 섞어 경기 관람용 달콤한 간식으로 잡힙니다.', ['br', 'food', 'cookie', 'piraque', 'world-cup'], [source.brCopa], 80, 'new'),
  rec('BR', 'fashion', 'Osklen RioFW Verão 2026 white tailoring look', 'Osklen RioFW 2026 alfaiataria branca', 'Osklen이 2026 RioFW 첫 무대를 열며 선보인 흰색 테일러링 룩입니다. 2018년 이후 런웨이 복귀라 브라질 패션 대화에서 브랜드와 룩이 함께 강하게 잡힙니다.', ['br', 'fashion', 'riofw', 'osklen', 'tailoring'], [source.brOsklen, source.brRiofw], 88, 'rising'),
  rec('BR', 'fashion', 'Osklen linen raffia tailoring', 'Osklen tramas de linho, ráfia e juta', 'Osklen RioFW 컬렉션에서 리넨, 라피아, 주트 조직을 테일러링과 섞은 룩입니다. 브라질식 자연 소재와 도시형 럭셔리를 동시에 보여주는 아이템군입니다.', ['br', 'fashion', 'riofw', 'osklen', 'linen', 'raffia'], [source.brOsklen], 84, 'rising'),
  rec('BR', 'fashion', 'Osklen Ipanema graphic beachwear', 'Osklen Ipanema beachwear', 'Osklen이 이파네마 감성을 다시 꺼내며 비치웨어와 그래픽 프린트를 함께 보여줬습니다. 브라질 화면에서는 “여름 무드”보다 Osklen 이파네마 상품군으로 보여주는 편이 더 명확합니다.', ['br', 'fashion', 'riofw', 'osklen', 'beachwear'], [source.brOsklen], 81, 'rising'),
  rec('BR', 'fashion', 'Chico Rei camisa vermelha Copa 2026', 'Chico Rei camisa vermelha Copa 2026', 'Chico Rei가 브라질 대표팀의 빨간 유니폼 가능성을 장난스럽게 해석한 월드컵 티셔츠입니다. 경기 시즌에 바로 팔릴 수 있는 응원복 상품이라 트렌드명이 선명합니다.', ['br', 'fashion', 'shirt', 'chico-rei', 'world-cup'], [source.brCopa], 83, 'new'),
  rec('BR', 'fashion', 'RioFW 2026 comeback runway calendar', 'RioFW 2026 marcas brasileiras', '4월 14일부터 19일까지 진행되는 RioFW 2026 일정 자체가 브라질 패션 신호입니다. Osklen, Karoline Vitto, Martins, Piet 같은 브랜드가 한 주 안에 집중 노출됩니다.', ['br', 'fashion', 'riofw', 'runway'], [source.brRiofw], 79, 'rising'),
  rec('BR', 'brands', 'Osklen', 'Osklen', 'Osklen은 RioFW 2026 개막 무대로 브라질 패션 대화의 중심에 다시 올라왔습니다. 이파네마, 자연 소재, 고급 라이프스타일을 한 번에 묶은 브랜드 신호가 큽니다.', ['br', 'brands', 'fashion', 'osklen', 'riofw'], [source.brOsklen, source.brRiofw], 90, 'rising'),
  rec('BR', 'brands', 'Dia Melhor a Cada Dia', 'Dia Melhor a Cada Dia', 'Dia 슈퍼마켓의 자체 브랜드 Melhor a Cada Dia가 스낵 신제품을 늘렸습니다. 자체 브랜드 상품이 800개 이상으로 커졌다는 점도 브라질 리테일 흐름을 보여줍니다.', ['br', 'brands', 'retail', 'dia', 'private-label'], [source.brSnacks], 84, 'new'),
  rec('BR', 'brands', 'M. Dias Branco', 'M. Dias Branco', 'M. Dias Branco는 Adria, Isabela, Piraquê 같은 브랜드로 월드컵형 라면과 비스킷 신제품을 한 번에 밀고 있습니다. 경기 시즌 장보기 수요를 겨냥한 식품 브랜드입니다.', ['br', 'brands', 'food', 'm-dias-branco', 'world-cup'], [source.brCopa], 86, 'new'),
  rec('BR', 'brands', 'Lay’s Brasil', 'Lay’s Brasil', 'Lay’s Brasil은 FIFA 월드컵 후원 흐름에 맞춰 피카냐, 타코, 카망베르 맛을 브라질 시장에 냈습니다. 글로벌 경기 이벤트를 로컬 맛으로 바꾼 브랜드 사례입니다.', ['br', 'brands', 'snack', 'lays', 'world-cup'], [source.brCopa], 85, 'new'),
  rec('BR', 'brands', 'Cachaça 51', 'Cachaça 51', 'Cachaça 51은 월드컵 응원용 350ml 기념 라벨을 공개했습니다. 술 브랜드가 축구와 브라질성을 직접 연결한 캠페인이라 이번 주 브랜드 신호로 보기 좋습니다.', ['br', 'brands', 'beverage', 'cachaca-51', 'world-cup'], [source.brCopa], 82, 'new'),
  rec('BR', 'products', 'Lay’s Picanha Brasileira', 'Lay’s Picanha Brasileira', 'Lay’s가 브라질 시장에 낸 월드컵 한정 성격의 피카냐 맛 감자칩입니다. 브라질 대표 음식 이미지를 과자 맛으로 바꾼 상품이라 화면에서 바로 이해됩니다.', ['br', 'products', 'snack', 'lays', 'picanha'], [source.brCopa], 88, 'new'),
  rec('BR', 'products', 'Lay’s Taco Mexicano', 'Lay’s Taco Mexicano', 'Lay’s 월드컵 맛 라인 중 멕시코 타코를 앞세운 감자칩입니다. FIFA 개최국 음식 이미지를 브라질 소비자용 스낵으로 번역한 신상입니다.', ['br', 'products', 'snack', 'lays', 'taco'], [source.brCopa], 84, 'new'),
  rec('BR', 'products', 'Frontera Churrasco Argentino chips', 'Frontera Churrasco Argentino 60g', 'Frontera가 감자칩 카테고리에 새로 들어오며 낸 아르헨티나식 바비큐 맛 60g 제품입니다. 월드컵 관람용 짭짤한 스낵으로 쓰기 좋습니다.', ['br', 'products', 'snack', 'frontera', 'world-cup'], [source.brCopa], 82, 'new'),
  rec('BR', 'products', 'Cachaça 51 Branca 350ml Copa label', 'Cachaça 51 Branca 350 ml rótulo Copa', 'Cachaça 51 Branca 350ml의 월드컵 기념 라벨 상품입니다. 수집형 패키지와 축구 응원 분위기를 함께 잡아 술 진열대에서 눈에 띄기 좋습니다.', ['br', 'products', 'beverage', 'cachaca-51', 'collectible'], [source.brCopa], 81, 'new'),
  rec('BR', 'products', 'Piraquê Personal Cracker Pão de Alho', 'Piraquê Personal Cracker Pão de Alho', 'Piraquê Personal Cracker에 추가된 마늘빵 맛입니다. 23g씩 6개로 나뉜 138g 포장이라 경기 관람이나 이동 중 간식으로 설명하기 쉽습니다.', ['br', 'products', 'cracker', 'piraque', 'garlic-bread'], [source.brCopa], 80, 'new'),
  rec('BR', 'challenge', 'Filho da Fé - Samuel Batista Filho', 'Filho da Fé - Samuel Batista Filho', 'Spotify Viral 50 Brazil 최상단에 잡힌 곡입니다. 브라질 로컬 감성이 강한 오디오라 립싱크, 신앙/감정형 숏폼 배경음으로 쓰기 좋습니다.', ['br', 'challenge', 'spotify-viral', 'music'], [source.brSpotify], 92, 'rising', { search: 80, social: 96, ecommerce: 8, news: 62 }),
  rec('BR', 'challenge', 'CONEXÃO - O APAIXONADO', 'CONEXÃO - O APAIXONADO', 'Spotify Viral 50 Brazil 상위권 곡입니다. 제목과 훅이 직관적이라 커플 영상, 밈형 편집, 짧은 립싱크에 붙기 쉬운 오디오로 봅니다.', ['br', 'challenge', 'spotify-viral', 'music'], [source.brSpotify], 90, 'rising', { search: 78, social: 94, ecommerce: 8, news: 60 }),
  rec('BR', 'challenge', 'Jane! - The Long Faces', 'Jane! - The Long Faces', '브라질 Viral 50에서 계속 상위권에 남아 있는 인디 감성 곡입니다. 댄스보다 분위기 전환과 데일리 영상 배경음으로 잡힙니다.', ['br', 'challenge', 'spotify-viral', 'music'], [source.brSpotify], 88, 'rising', { search: 75, social: 92, ecommerce: 8, news: 58 }),
  rec('BR', 'challenge', 'Self Aware - Temper City', 'Self Aware - Temper City', 'Spotify Viral 50 Brazil 상위권의 감정형 오디오입니다. 짧은 독백, 전환 컷, 감성 브이로그에 붙기 좋은 곡으로 분류했습니다.', ['br', 'challenge', 'spotify-viral', 'music'], [source.brSpotify], 87, 'rising', { search: 74, social: 91, ecommerce: 8, news: 58 }),
  rec('BR', 'challenge', 'Sina de Ofélia - Heitor Santos', 'Sina de Ofélia - Heitor Santos', 'Heitor Santos의 곡이 브라질 Viral 50 상위권에 들어왔습니다. 포르투갈어권 로컬 오디오라 브라질 챌린지 카테고리에 더 자연스럽습니다.', ['br', 'challenge', 'spotify-viral', 'music'], [source.brSpotify], 86, 'rising', { search: 73, social: 90, ecommerce: 8, news: 57 }),
  rec('CN', 'food', 'HEYTEA Yanlan Chongming Rice Brew', '喜茶 燕岚崇明米酿', 'HEYTEA LAB 2.0이 상하이에서 선보인 충밍 쌀 발효 음료입니다. 지역 식재료를 프리미엄 차 음료로 바꾼 중국 카페 신상 흐름입니다.', ['cn', 'food', 'drink', 'heytea', 'shanghai'], [source.cnHeytea], 84, 'new'),
  rec('CN', 'food', 'HEYTEA Yanlan 7', '喜茶 燕岚7', 'HEYTEA LAB 2.0의 시즌 대표 음료 중 하나입니다. 차 브랜드가 지역 재료와 실험형 매장을 묶어 프리미엄 음료 경험으로 만든 사례입니다.', ['cn', 'food', 'drink', 'heytea'], [source.cnHeytea], 81, 'new'),
  rec('CN', 'food', 'HEYTEA Lava Egg Cake', '喜茶 Lava Egg Cake', 'HEYTEA LAB 2.0에서 음료와 함께 제시된 진한 계란 케이크입니다. 중국 카페 신상은 음료만이 아니라 베이커리형 디저트를 함께 묶는 흐름이 보입니다.', ['cn', 'food', 'dessert', 'heytea', 'cake'], [source.cnHeytea], 80, 'new'),
  rec('CN', 'food', 'HEYTEA Flossy Salted Egg Gelato', '喜茶 咸蛋黄 Gelato', 'HEYTEA LAB 2.0의 솔티드에그 젤라토형 디저트입니다. 짭짤한 노른자 맛을 차 브랜드 디저트로 확장한 상품이라 중국식 단짠 트렌드를 보여줍니다.', ['cn', 'food', 'dessert', 'salted-egg', 'heytea'], [source.cnHeytea], 82, 'new'),
  rec('CN', 'food', 'Luckin Fresh Brew Light Jasmine Milk Tea', '瑞幸 轻茉莉奶茶', 'Luckin이 밀고 있는 가벼운 자스민 밀크티 상품입니다. 커피 체인이 차 음료를 넓히는 흐름이라 중국 음료 시장을 읽기 좋습니다.', ['cn', 'food', 'drink', 'luckin', 'milk-tea'], [source.cnLuckin], 83, 'rising'),
  rec('CN', 'fashion', 'Puma x Jil Sander K-Street Sneaker', 'Puma x Jil Sander K-Street', 'Puma와 Jil Sander가 4월 8일 글로벌 출시한 초박형 유니섹스 스니커즈입니다. 중국에서는 슬림하고 낮은 신발 실루엣을 보여주는 실제 모델명으로 쓰기 좋습니다.', ['cn', 'fashion', 'sneaker', 'puma', 'jil-sander'], [source.cnPuma], 84, 'new'),
  rec('CN', 'fashion', 'Bottega Veneta Veneta Bag', 'Bottega Veneta Veneta Bag', 'Jing Daily가 중국에서 Bottega Veneta 인트레치아토 백의 힘을 다시 짚었습니다. “조용한 럭셔리”보다 Veneta 백이라는 실제 가방명으로 보여주는 쪽이 명확합니다.', ['cn', 'fashion', 'bag', 'bottega-veneta', 'intrecciato'], [source.cnBottega], 86, 'rising'),
  rec('CN', 'fashion', 'Maison Margiela Tabi Shoes Shanghai Folders', 'Maison Margiela Tabi Shoes', 'Maison Margiela가 상하이 패션위크 흐름에 맞춰 Folders 프로젝트를 전개하며 Tabi 슈즈와 아티자널 아카이브를 중국 주요 도시에서 보여줬습니다.', ['cn', 'fashion', 'shoes', 'maison-margiela', 'tabi'], [source.cnMargiela], 85, 'rising'),
  rec('CN', 'fashion', 'Clarks Walking Lab Shanghai', 'Clarks Walking Lab Shanghai', 'Clarks가 상하이에 Walking Lab 공간을 열며 기능성 신발 경험을 전면에 세웠습니다. 단순 브랜드 노출보다 “걷는 신발 실험 공간”이라는 패션 리테일 신호가 분명합니다.', ['cn', 'fashion', 'shoes', 'clarks', 'retail'], [source.cnIntel407], 80, 'new'),
  rec('CN', 'fashion', 'Weekend Max Mara wanderlust bus Shanghai', 'Weekend Max Mara wanderlust bus Shanghai', 'Weekend Max Mara가 상하이에서 버스 투어형 캠페인을 진행했습니다. 봄 여행 무드와 패션 브랜드 체험을 묶은 중국 로컬 활성화 사례입니다.', ['cn', 'fashion', 'weekend-max-mara', 'campaign'], [source.cnIntel414], 78, 'new'),
  rec('CN', 'brands', 'Erno Laszlo', 'Erno Laszlo', 'Ruoyuchen이 Erno Laszlo를 2억9900만 위안에 인수한다고 발표했습니다. 중국 뷰티 시장에서 오래된 프레스티지 스킨케어 브랜드가 다시 현지화되는 신호입니다.', ['cn', 'brands', 'beauty', 'erno-laszlo', 'ruoyuchen'], [source.cnErno], 86, 'new'),
  rec('CN', 'brands', 'Bottega Veneta', 'Bottega Veneta', 'Bottega Veneta는 중국에서 인트레치아토와 Veneta 백으로 다시 강하게 언급됩니다. 조용한 럭셔리의 기준 브랜드로 보여주기 좋습니다.', ['cn', 'brands', 'fashion', 'bottega-veneta'], [source.cnBottega], 85, 'rising'),
  rec('CN', 'brands', 'Alo Yoga China', 'Alo Yoga China', 'Alo Yoga가 중국·북아시아 대표를 선임하며 2026년 가을 중화권 진출 준비를 공식화했습니다. 프리미엄 액티브웨어 브랜드의 중국 진입 신호입니다.', ['cn', 'brands', 'activewear', 'alo-yoga'], [source.cnAlo], 81, 'rising'),
  rec('CN', 'brands', 'Ray-Ban x Jennie', 'Ray-Ban x Jennie', 'Ray-Ban이 Blackpink Jennie를 글로벌 역할로 기용했다는 4월 10일 소식이 중국 럭셔리·아이웨어 뉴스에 잡혔습니다. K팝과 아이웨어 브랜드가 함께 움직이는 사례입니다.', ['cn', 'brands', 'eyewear', 'ray-ban', 'jennie'], [source.cnIntel410], 83, 'new'),
  rec('CN', 'brands', 'L’Oréal Paris x Song Yuqi', 'L’Oréal Paris x 宋雨琦', 'L’Oréal이 i-dle의 송우기를 헤어 앰배서더로 기용했습니다. 중국 뷰티 브랜드 커뮤니케이션에서 아이돌 앰배서더 전략이 계속 강합니다.', ['cn', 'brands', 'beauty', 'loreal', 'song-yuqi'], [source.cnIntel414], 82, 'new'),
  rec('CN', 'products', 'Puma x Jil Sander K-Street Matte Bronze Suede', 'Puma x Jil Sander K-Street matte bronze suede', 'K-Street 협업의 매트 브론즈 스웨이드 컬러입니다. 초박형 밑창과 낮은 실루엣이 특징이라 중국 패션 상품 카드에 바로 올리기 좋습니다.', ['cn', 'products', 'sneaker', 'puma', 'jil-sander'], [source.cnPuma], 84, 'new'),
  rec('CN', 'products', 'Puma x Jil Sander K-Street Electric Blue Nylon', 'Puma x Jil Sander K-Street electric blue nylon', 'Jil Sander 채널 한정으로 언급된 전기색 블루 나일론 K-Street입니다. 미니멀한 협업 스니커즈 안에서도 색으로 바로 구분되는 상품입니다.', ['cn', 'products', 'sneaker', 'puma', 'jil-sander'], [source.cnPuma], 82, 'new'),
  rec('CN', 'products', 'Bottega Veneta revived Veneta bag', 'Bottega Veneta revived Veneta bag', 'Bottega Veneta가 다시 밀고 있는 Veneta 백입니다. 중국에서는 인트레치아토 가죽 공예와 아카이브 백 부활 흐름을 함께 설명할 수 있습니다.', ['cn', 'products', 'bag', 'bottega-veneta', 'veneta'], [source.cnBottega], 85, 'rising'),
  rec('CN', 'products', 'Maison Margiela Tabi Shoes', 'Maison Margiela Tabi Shoes', 'Maison Margiela Folders 프로젝트에서 중국 관객에게 다시 노출된 대표 신발입니다. 브랜드 세계관을 가장 빨리 떠올리게 하는 상품명이라 화면용으로 적합합니다.', ['cn', 'products', 'shoes', 'maison-margiela', 'tabi'], [source.cnMargiela], 83, 'rising'),
  rec('CN', 'products', 'Erno Laszlo cleansing bar', 'Erno Laszlo cleansing bar', 'Erno Laszlo 인수 소식과 함께 다시 볼 만한 대표 상품군은 클렌징 바입니다. 중국에서 이미 회원 기반이 있는 스킨케어 브랜드라 재활성화 가능성이 큽니다.', ['cn', 'products', 'skincare', 'erno-laszlo', 'cleansing'], [source.cnErno], 79, 'rising'),
  rec('CN', 'challenge', 'SWIM - BTS', 'SWIM - 防弹少年团', 'Apple Music 중국 인기곡 차트 1위권에 있는 BTS 곡입니다. 중국에서는 댄스보다 글로벌 팬덤형 숏폼 오디오로 강하게 쓰일 수 있습니다.', ['cn', 'challenge', 'apple-music', 'music', 'bts'], [source.cnApple], 92, 'rising', { search: 86, social: 96, ecommerce: 8, news: 82 }),
  rec('CN', 'challenge', 'Body to Body - BTS', 'Body to Body - 防弹少年团', 'Apple Music 중국 차트 상위권에 함께 올라온 BTS 수록곡입니다. 같은 앨범 안에서 여러 오디오가 숏폼 배경음으로 분화되는 흐름입니다.', ['cn', 'challenge', 'apple-music', 'music', 'bts'], [source.cnApple], 88, 'rising', { search: 80, social: 93, ecommerce: 8, news: 70 }),
  rec('CN', 'challenge', '搁浅 - Jay Chou', '搁浅 - 周杰伦', 'Apple Music 중국 차트 상위권에 다시 보이는 Jay Chou의 곡입니다. 추억형 만도팝 오디오가 숏폼 회상 영상에 계속 쓰이는 흐름으로 잡았습니다.', ['cn', 'challenge', 'apple-music', 'music', 'jay-chou'], [source.cnApple], 86, 'rising', { search: 78, social: 91, ecommerce: 8, news: 66 }),
  rec('CN', 'challenge', '晴天 - Jay Chou', '晴天 - 周杰伦', 'Jay Chou의 대표곡이 Apple Music 중국 인기곡 상위권에 남아 있습니다. 학교, 청춘, 회상형 영상에 붙는 카탈로그 오디오로 보기 좋습니다.', ['cn', 'challenge', 'apple-music', 'music', 'jay-chou'], [source.cnApple], 85, 'rising', { search: 77, social: 90, ecommerce: 8, news: 65 }),
  rec('CN', 'challenge', '七里香 - Jay Chou', '七里香 - 周杰伦', 'Apple Music 중국 차트에서 다시 보이는 Jay Chou 카탈로그 곡입니다. 중국 숏폼에서는 새 노래만큼 오래된 감성곡의 재사용도 중요합니다.', ['cn', 'challenge', 'apple-music', 'music', 'jay-chou'], [source.cnApple], 84, 'rising', { search: 75, social: 89, ecommerce: 8, news: 64 }),
  rec('MX', 'food', 'Maíz Tinto Suadero Braseado', 'Maíz Tinto Suadero Braseado', 'CDMX 레스토랑 Maíz Tinto의 36시간 조리 수아데로 요리입니다. 타코 속 재료로 익숙한 수아데로를 파인다이닝식 접시로 바꾼 메뉴라 멕시코 현대식 음식 흐름을 보여줍니다.', ['mx', 'food', 'restaurant', 'maiz-tinto', 'suadero'], [source.mxMaiz], 84, 'rising'),
  rec('MX', 'food', 'Maíz Tinto Delicia de Fresas y Jamaica', 'Maíz Tinto Delicia de fresas y jamaica', 'Maíz Tinto가 소개한 딸기와 히비스커스 디저트입니다. 멕시코 재료를 산뜻한 디저트로 풀어낸 메뉴라 더운 계절에 잘 맞습니다.', ['mx', 'food', 'dessert', 'maiz-tinto', 'jamaica'], [source.mxMaiz], 80, 'rising'),
  rec('MX', 'food', 'Maíz Tinto Escamoles con Epazote Morado', 'Maíz Tinto Escamoles con epazote morado', 'Maíz Tinto의 계절 메뉴로 소개된 에스카몰 요리입니다. 화이트와인, 정제 버터, 보라색 에파소테를 붙여 전통 재료를 현대식으로 보여줍니다.', ['mx', 'food', 'restaurant', 'maiz-tinto', 'escamoles'], [source.mxMaiz], 82, 'rising'),
  rec('MX', 'food', 'Campo Marte 26 México de mis Sabores', 'México de mis Sabores', 'Campo Marte 26 안에 들어가는 공식 미식 프로그램입니다. 멕시코 32개 주 대표 음식을 주간 교체 메뉴로 보여준다는 점이 월드컵 전 멕시코 음식 신호로 큽니다.', ['mx', 'food', 'festival', 'campo-marte-26', 'world-cup'], [source.mxCampo], 86, 'new'),
  rec('MX', 'food', 'Campo Marte 26 El Itacate antojitos', 'El Itacate antojitos mexicanos', 'Campo Marte 26의 테이크아웃 음식 공간 El Itacate입니다. 월드컵 관람객이 바로 들고 먹을 수 있는 멕시코 안토히토스 공간이라 행사형 음식 트렌드로 잡았습니다.', ['mx', 'food', 'antojitos', 'campo-marte-26', 'world-cup'], [source.mxCampo], 82, 'new'),
  rec('MX', 'fashion', 'ELLE México classic straight jeans', 'Jeans rectos clásicos', 'ELLE México가 4월 14일 봄 데님 핵심으로 꼽은 클래식 스트레이트 진입니다. 과한 실루엣보다 균형 잡힌 미니멀 데님이 멕시코 봄 옷장에 들어오는 흐름입니다.', ['mx', 'fashion', 'denim', 'elle-mexico', 'jeans'], [source.mxElle], 84, 'rising'),
  rec('MX', 'fashion', 'ELLE México cuffed jeans', 'Jeans con dobladillo', 'ELLE México가 봄 데님 트렌드로 언급한 접어 입는 데님입니다. 발목이나 무릎 가까이까지 크게 접는 스타일이라 사진에서 형태가 바로 보입니다.', ['mx', 'fashion', 'denim', 'elle-mexico', 'cuffed-jeans'], [source.mxElle], 82, 'rising'),
  rec('MX', 'fashion', 'Glamour México low-heel shoes', 'Zapatos de tacón bajo', 'Glamour México가 4월 9일 봄 스타일 기본으로 짚은 낮은 굽 신발입니다. 멕시코 패션 콘텐츠에서 편한데 차려입은 느낌을 주는 신발로 반복 노출됩니다.', ['mx', 'fashion', 'shoes', 'glamour-mexico', 'low-heels'], [source.mxLowHeel], 81, 'rising'),
  rec('MX', 'fashion', 'Glamour México grandma sets', 'Conjuntos de abuela', 'Glamour México가 4월 15일 “할머니 세트”를 세련된 봄 스타일로 소개했습니다. 레트로한 니트·스커트·카디건 조합을 새롭게 보는 흐름입니다.', ['mx', 'fashion', 'retro', 'glamour-mexico', 'grandma-style'], [source.mxGrandma], 80, 'rising'),
  rec('MX', 'fashion', 'Glamour México ballerinas to gladiator sandals', 'Bailarinas y sandalias de gladiador', 'Glamour México가 봄·여름 신발로 발레리나와 글래디에이터 샌들을 함께 짚었습니다. 더운 계절로 넘어가는 멕시코 패션의 신발 교체 신호입니다.', ['mx', 'fashion', 'shoes', 'glamour-mexico', 'sandals'], [source.mxShoes], 79, 'rising'),
  rec('MX', 'brands', 'Maíz Tinto', 'Maíz Tinto', 'Maíz Tinto는 Food and Travel México가 4월에 다시 조명한 CDMX 현대 멕시코 요리 레스토랑입니다. 메뉴 단위로 보여줄 수 있는 음식 신호가 여럿 있습니다.', ['mx', 'brands', 'restaurant', 'maiz-tinto'], [source.mxMaiz], 84, 'rising'),
  rec('MX', 'brands', 'Campo Marte 26 Santander', 'Campo Marte 26 Santander', 'Campo Marte 26 Santander는 월드컵 기간 CDMX에서 음식, 음악, 경기 관람을 묶는 대형 행사 브랜드로 발표됐습니다. 멕시코 소비·관광 흐름과 바로 연결됩니다.', ['mx', 'brands', 'festival', 'santander', 'world-cup'], [source.mxCampo], 86, 'new'),
  rec('MX', 'brands', 'ELLE México', 'ELLE México', 'ELLE México는 4월 14일 봄 데님 트렌드를 구체적으로 정리하며 멕시코 패션 검색 흐름을 이끌고 있습니다. 데님 카테고리 기준점으로 쓰기 좋습니다.', ['mx', 'brands', 'media', 'fashion', 'elle-mexico'], [source.mxElle], 78, 'rising'),
  rec('MX', 'brands', 'Glamour México', 'Glamour México', 'Glamour México는 4월 둘째 주에 신발, 데님, 레트로 세트 콘텐츠를 연속으로 냈습니다. 멕시코 봄 스타일 키워드를 잡는 패션 미디어 신호입니다.', ['mx', 'brands', 'media', 'fashion', 'glamour-mexico'], [source.mxGlamour], 77, 'rising'),
  rec('MX', 'brands', 'Zara, Mango y H&M summer looks', 'Zara, Mango y H&M', 'Glamour México가 봄·여름 룩을 설명할 때 Zara, Mango, H&M을 묶어 제시했습니다. 멕시코에서 접근성 높은 글로벌 SPA 브랜드가 여전히 스타일 기준점입니다.', ['mx', 'brands', 'fashion', 'zara', 'mango', 'hm'], [source.mxGlamour], 76, 'rising'),
  rec('MX', 'products', 'Maíz Tinto Suadero Braseado', 'Maíz Tinto Suadero Braseado', 'Maíz Tinto의 대표 접시로 잡힌 수아데로 브레이즈입니다. “현대 멕시코 요리”라고 뭉개지 않고 실제 메뉴명으로 보여줄 수 있습니다.', ['mx', 'products', 'restaurant-dish', 'maiz-tinto', 'suadero'], [source.mxMaiz], 84, 'rising'),
  rec('MX', 'products', 'Maíz Tinto Delicia de Fresas y Jamaica', 'Maíz Tinto Delicia de fresas y jamaica', '딸기와 하마이카를 쓴 Maíz Tinto 디저트입니다. 멕시코 재료명이 살아 있어 사용자 화면에서도 어떤 디저트인지 바로 설명됩니다.', ['mx', 'products', 'dessert', 'maiz-tinto', 'jamaica'], [source.mxMaiz], 80, 'rising'),
  rec('MX', 'products', 'Maíz Tinto Escamoles con Epazote Morado', 'Maíz Tinto Escamoles con epazote morado', '에스카몰과 보라색 에파소테를 조합한 Maíz Tinto 계절 메뉴입니다. 전통 식재료를 실제 메뉴 단위로 보여줄 수 있어 보류 없이 넣었습니다.', ['mx', 'products', 'restaurant-dish', 'maiz-tinto', 'escamoles'], [source.mxMaiz], 82, 'rising'),
  rec('MX', 'products', 'ELLE México cuffed jeans', 'Jeans con dobladillo', 'ELLE México가 봄 데님 트렌드로 짚은 접어 입는 진입니다. 특정 브랜드 제품은 아니지만 화면에서는 “접힌 데님”이라는 실물 형태가 분명합니다.', ['mx', 'products', 'denim', 'elle-mexico', 'jeans'], [source.mxElle], 79, 'rising'),
  rec('MX', 'products', 'Glamour México low-heel shoes', 'Zapatos de tacón bajo', 'Glamour México가 봄 기본 신발로 정리한 낮은 굽 슈즈입니다. 정장 팬츠, 진, 스커트와 함께 쓰이는 실사용형 제품군입니다.', ['mx', 'products', 'shoes', 'glamour-mexico', 'low-heels'], [source.mxLowHeel], 78, 'rising'),
  rec('MX', 'challenge', 'daño - Peso Pluma, Tito Double P', 'daño - Peso Pluma, Tito Double P', 'Kworb 기준 4월 14일 멕시코 Spotify 일간 차트 1위권 곡입니다. 지역 아티스트 중심의 숏폼 배경음으로 강하게 쓰일 수 있습니다.', ['mx', 'challenge', 'spotify-chart', 'music', 'peso-pluma'], [source.mxKworb], 92, 'rising', { search: 86, social: 96, ecommerce: 8, news: 72 }),
  rec('MX', 'challenge', 'TU SANCHO - Fuerza Regida', 'TU SANCHO - Fuerza Regida', '멕시코 Spotify 일간 차트에서 상위권으로 재상승한 곡입니다. 코리도/지역 멕시코 음악 기반의 립싱크와 상황극 오디오로 보기 좋습니다.', ['mx', 'challenge', 'spotify-chart', 'music', 'fuerza-regida'], [source.mxKworb], 90, 'rising', { search: 84, social: 94, ecommerce: 8, news: 70 }),
  rec('MX', 'challenge', 'Pvta Luna - Neton Vega', 'Pvta Luna - Neton Vega', 'Neton Vega의 곡이 멕시코 Spotify 상위권에 유지되고 있습니다. 짧은 구절을 반복해 쓰기 좋은 지역 음악 오디오로 분류했습니다.', ['mx', 'challenge', 'spotify-chart', 'music', 'neton-vega'], [source.mxKworb], 88, 'rising', { search: 82, social: 92, ecommerce: 8, news: 68 }),
  rec('MX', 'challenge', 'dopamina - Peso Pluma, Tito Double P', 'dopamina - Peso Pluma, Tito Double P', 'Peso Pluma와 Tito Double P 조합의 또 다른 멕시코 상위권 곡입니다. 같은 아티스트 축에서 여러 오디오가 숏폼에 분산되는 흐름입니다.', ['mx', 'challenge', 'spotify-chart', 'music', 'peso-pluma'], [source.mxKworb], 86, 'rising', { search: 80, social: 91, ecommerce: 8, news: 67 }),
  rec('MX', 'challenge', 'chiclona - Peso Pluma, Tito Double P, LENCHO', 'chiclona - Peso Pluma, Tito Double P, LENCHO', '멕시코 Spotify 상위권에 오른 Peso Pluma 계열 곡입니다. 빠른 컷 편집과 립싱크에 붙이기 쉬운 현지 오디오로 잡았습니다.', ['mx', 'challenge', 'spotify-chart', 'music', 'peso-pluma'], [source.mxKworb], 85, 'rising', { search: 79, social: 90, ecommerce: 8, news: 66 }),
  rec('GB', 'food', 'Greggs Chicken Sausage Roll', 'Greggs Chicken Sausage Roll', 'Greggs가 4월 9일부터 전국 출시한 치킨 소시지 롤입니다. 기존 포크, 비건 소시지 롤에 이어 세 번째 축으로 들어온 영국 베이커리 신상입니다.', ['gb', 'food', 'greggs', 'sausage-roll'], [source.gbGreggs], 88, 'new'),
  rec('GB', 'food', 'McDonald’s UK Double Big Mac with Bacon', 'McDonald’s UK Double Big Mac with Bacon', 'McDonald’s UK 최신 메뉴에 오른 한정판 더블 빅맥 베이컨입니다. 영국 패스트푸드 화면에서 바로 이해되는 대형 버거 신상입니다.', ['gb', 'food', 'mcdonalds', 'burger'], [source.gbMcd], 86, 'new'),
  rec('GB', 'food', 'McDonald’s UK Cadbury Creme Egg McFlurry', 'Cadbury Creme Egg McFlurry', 'McDonald’s UK 최신 메뉴에 남아 있는 Cadbury Creme Egg McFlurry입니다. 부활절 시즌 이후에도 디저트 메뉴로 눈에 띄는 한정 상품입니다.', ['gb', 'food', 'mcdonalds', 'mcflurry', 'cadbury'], [source.gbMcd], 82, 'rising'),
  rec('GB', 'food', 'Aero Pistachio Sharing Bar', 'Aero Pistachio Sharing Bar', 'Nestlé가 영국 리테일에 4월부터 내놓은 피스타치오맛 Aero 쉐어링 바입니다. 피스타치오 디저트 흐름을 대중 초콜릿 브랜드가 받은 사례입니다.', ['gb', 'food', 'aero', 'pistachio', 'chocolate'], [source.gbAero], 85, 'new'),
  rec('GB', 'food', 'Madrí Excepcional Limón 4x440ml', 'Madrí Excepcional Limón', 'Molson Coors가 영국 Tesco, Booker, One Stop에 독점 롤아웃하는 레몬맛 라거입니다. 여름 피크닉과 바비큐 수요를 겨냥한 과일 맥주 신상입니다.', ['gb', 'food', 'beer', 'madri', 'molson-coors'], [source.gbMadri], 84, 'new'),
  rec('GB', 'fashion', 'Ugg Tasman spring slipper', 'Ugg Tasman', 'British Vogue가 4월 10일 봄 신발로 다시 짚은 Ugg Tasman입니다. 샌들보다 편하게 신는 슬립온으로 런던 카페와 공항 주변에서 보이는 신발 흐름입니다.', ['gb', 'fashion', 'shoes', 'ugg', 'tasman'], [source.gbUgg], 86, 'rising'),
  rec('GB', 'fashion', 'COS Montmarte Leather Bowling Bag', 'COS Montmarte Leather Bowling Bag', 'British Vogue의 2026 봄·여름 백 트렌드에서 볼링백 예시로 제시된 COS 가죽백입니다. 럭셔리 런웨이 흐름을 하이스트리트 상품명으로 보여줍니다.', ['gb', 'fashion', 'bag', 'cos', 'bowling-bag'], [source.gbBags], 84, 'rising'),
  rec('GB', 'fashion', 'COS Suede-Nylon Ballet Trainers', 'COS Suede-Nylon Ballet Trainers', 'British Vogue가 슬림 스니커즈 흐름에서 제시한 COS 발레 트레이너입니다. 발레 스니커즈와 낮은 실루엣을 실제 구매 가능한 모델명으로 잡았습니다.', ['gb', 'fashion', 'shoes', 'cos', 'ballet-trainers'], [source.gbShoes], 83, 'rising'),
  rec('GB', 'fashion', 'Marks & Spencer Suede Tote Bag', 'Marks & Spencer Suede Tote Bag', 'British Vogue의 큰 토트백 흐름에서 제시된 M&S 스웨이드 토트입니다. 영국 사용자에게 접근성 높은 봄 가방 상품으로 보여주기 좋습니다.', ['gb', 'fashion', 'bag', 'marks-spencer', 'suede-tote'], [source.gbBags], 80, 'rising'),
  rec('GB', 'fashion', 'COS Heeled Ballerinas', 'COS Heeled Ballerinas', 'British Vogue가 글러브 펌프 흐름에서 추천한 COS 굽 있는 발레리나 슈즈입니다. 미니멀하고 얇은 앞코 신발 트렌드를 실제 상품명으로 표현합니다.', ['gb', 'fashion', 'shoes', 'cos', 'ballerinas'], [source.gbShoes], 81, 'rising'),
  rec('GB', 'brands', 'Greggs', 'Greggs', 'Greggs는 치킨 소시지 롤을 출시하며 대표 소시지 롤 라인업을 세 가지로 확장했습니다. 영국 고속 베이커리 브랜드 중 가장 직접적인 신제품 신호입니다.', ['gb', 'brands', 'food', 'greggs'], [source.gbGreggs], 87, 'new'),
  rec('GB', 'brands', 'McDonald’s UK', 'McDonald’s UK', 'McDonald’s UK는 Double Big Mac, Spicy McNuggets, Cadbury McFlurry 같은 한정 메뉴를 동시에 밀고 있습니다. 영국 패스트푸드 신상 페이지 기준점입니다.', ['gb', 'brands', 'food', 'mcdonalds'], [source.gbMcd], 86, 'rising'),
  rec('GB', 'brands', 'Nestlé Aero', 'Nestlé Aero', 'Aero는 피스타치오 쉐어링 바를 내며 영국 피스타치오 디저트 흐름을 대중 초콜릿으로 확장했습니다. 브랜드와 상품명이 같이 살아납니다.', ['gb', 'brands', 'confectionery', 'aero', 'nestle'], [source.gbAero], 84, 'new'),
  rec('GB', 'brands', 'Madrí Excepcional', 'Madrí Excepcional', 'Madrí Excepcional은 Limón 출시로 영국 과일 맥주 시장을 노립니다. Tesco 독점 롤아웃이라 리테일 진열 신호도 분명합니다.', ['gb', 'brands', 'beer', 'madri', 'molson-coors'], [source.gbMadri], 83, 'new'),
  rec('GB', 'brands', 'Jacob’s Mini Cheddars', 'Jacob’s Mini Cheddars', 'Jacob’s Mini Cheddars는 Chipotle & Lime, Nacho Cheese 한정 맛을 4월부터 영국 채널에 넣었습니다. 익숙한 스낵에 멕시칸 맛을 붙인 사례입니다.', ['gb', 'brands', 'snack', 'jacobs', 'pladis'], [source.gbCheddars], 82, 'new'),
  rec('GB', 'products', 'Jacob’s Mini Cheddars Chipotle & Lime', 'Jacob’s Mini Cheddars Chipotle & Lime', 'Jacob’s Mini Cheddars의 한정 Chipotle & Lime 맛입니다. 영국 스낵 시장에서 매콤하고 상큼한 멕시칸 풍미를 친숙한 포맷에 넣은 상품입니다.', ['gb', 'products', 'snack', 'jacobs', 'chipotle-lime'], [source.gbCheddars], 83, 'new'),
  rec('GB', 'products', 'Jacob’s Mini Cheddars Nacho Cheese', 'Jacob’s Mini Cheddars Nacho Cheese', 'Jacob’s Mini Cheddars의 Nacho Cheese 한정 맛입니다. 공유용 150g과 편의점용 90g 포맷으로 나와 스낵 진열대에서 노출되기 쉽습니다.', ['gb', 'products', 'snack', 'jacobs', 'nacho-cheese'], [source.gbCheddars], 82, 'new'),
  rec('GB', 'products', 'Plenish Clean Protein Madagascan Vanilla', 'Plenish Clean Protein Madagascan Vanilla', 'Plenish가 단백질 카테고리에 처음 진입하며 낸 바닐라맛 클린 프로틴 파우더입니다. 식물성·클린라벨·20g 단백질 흐름을 한 상품에 담았습니다.', ['gb', 'products', 'protein', 'plenish', 'plant-based'], [source.gbPlenish], 81, 'new'),
  rec('GB', 'products', 'Aero Pistachio Sharing Bar', 'Aero Pistachio Sharing Bar', 'Aero의 피스타치오 쉐어링 바입니다. 피스타치오 맛이 프리미엄 디저트에서 대중 초콜릿까지 내려온 흐름을 보여주는 실제 상품입니다.', ['gb', 'products', 'chocolate', 'aero', 'pistachio'], [source.gbAero], 84, 'new'),
  rec('GB', 'products', 'Madrí Excepcional Limón 4x440ml', 'Madrí Excepcional Limón 4x440ml', 'Madrí Excepcional Limón의 4x440ml 멀티팩입니다. 3.4% ABV 레몬맛 라거로 Tesco, Booker, One Stop 독점 롤아웃이 확인됩니다.', ['gb', 'products', 'beer', 'madri', 'lemon'], [source.gbMadri], 83, 'new'),
  rec('GB', 'challenge', 'iloveitiloveitiloveit - Bella Kay', 'iloveitiloveitiloveit - Bella Kay', 'Kworb 기준 4월 14일 영국 Spotify 일간 차트 1위권 곡입니다. 제목의 반복감이 강해 짧은 후킹 영상에 붙이기 좋습니다.', ['gb', 'challenge', 'spotify-chart', 'music', 'bella-kay'], [source.gbKworb], 92, 'rising', { search: 86, social: 96, ecommerce: 8, news: 70 }),
  rec('GB', 'challenge', 'Rein Me In - Sam Fender, Olivia Dean', 'Rein Me In - Sam Fender, Olivia Dean', '영국 Spotify 일간 차트 상위권에 있는 Sam Fender와 Olivia Dean의 곡입니다. 영국 로컬 팝 오디오로 감성 영상에 잘 맞습니다.', ['gb', 'challenge', 'spotify-chart', 'music', 'sam-fender', 'olivia-dean'], [source.gbKworb], 89, 'rising', { search: 84, social: 92, ecommerce: 8, news: 70 }),
  rec('GB', 'challenge', 'Man I Need - Olivia Dean', 'Man I Need - Olivia Dean', 'Olivia Dean의 곡이 영국 Spotify 상위권을 유지하고 있습니다. 립싱크와 데일리 브이로그 배경음으로 쓰기 좋은 현지 오디오입니다.', ['gb', 'challenge', 'spotify-chart', 'music', 'olivia-dean'], [source.gbKworb], 88, 'rising', { search: 83, social: 91, ecommerce: 8, news: 68 }),
  rec('GB', 'challenge', 'Beauty And A Beat - Justin Bieber, Nicki Minaj', 'Beauty And A Beat - Justin Bieber, Nicki Minaj', '영국 Spotify 차트에서 크게 재상승한 2010년대 팝 곡입니다. 복고형 댄스·립싱크 오디오가 다시 도는 흐름으로 분류했습니다.', ['gb', 'challenge', 'spotify-chart', 'music', 'justin-bieber'], [source.gbKworb], 86, 'rising', { search: 82, social: 90, ecommerce: 8, news: 66 }),
  rec('GB', 'challenge', 'Babydoll - Dominic Fike', 'Babydoll - Dominic Fike', 'Dominic Fike의 Babydoll은 영국 차트 상위권에 오래 남아 있는 짧고 감각적인 오디오입니다. 댄스보다 분위기형 숏폼에 잘 맞습니다.', ['gb', 'challenge', 'spotify-chart', 'music', 'dominic-fike'], [source.gbKworb], 85, 'rising', { search: 80, social: 89, ecommerce: 8, news: 65 }),
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
    '-- 2026-04-16 BR/CN/MX/GB verified Korean trend refresh',
    '-- 범위: BR, CN, MX, GB / 국가별 25개 / 총 100개',
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
  if (records.length !== 100 || bad.length) {
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

    if (summary.rows.reduce((sum, row) => sum + row.count, 0) !== 100) {
      throw new Error(`삽입 후 행 수가 100개가 아닙니다: ${JSON.stringify(summary.rows)}`);
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
