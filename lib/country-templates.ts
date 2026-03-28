// ============================================================
// 전 세계 국가 템플릿 트렌드 데이터
// 기존 mock 6개국(KR/US/JP/CN/GB/FR) 외 80개+ 국가 지원
// 지역 기반 트렌드 템플릿으로 모든 국가에 데이터 제공
// ============================================================

import type { TrendWithDetails } from './types';
import { MOCK_COUNTRIES, MOCK_TRENDS, MOCK_CATEGORIES } from './mock-data';

// ── 실제 수집 데이터 관련 ──
interface RealTrend {
  keyword: string;
  category: string;
  heat_score: number;
  heat_status: string;
  search_score: number;
  social_score: number;
  related_queries: string[];
  collected_at: string;
}

interface RealTrendsData {
  last_updated: string;
  countries: Record<string, {
    name: string;
    trends: RealTrend[];
  }>;
}

const CATEGORY_DEFAULT_IMAGES: Record<string, string> = {
  fashion: 'https://images.unsplash.com/photo-1445205170230-053b83016050?auto=format&fit=crop&q=80&w=800',
  products: 'https://images.unsplash.com/photo-1493809842364-78817add7ffb?auto=format&fit=crop&q=80&w=800',
  food: 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&q=80&w=800',
  brands: 'https://images.unsplash.com/photo-1596462502278-27bfdc403348?auto=format&fit=crop&q=80&w=800',
  challenges: 'https://images.unsplash.com/photo-1533227268428-f9ed0900fb3b?auto=format&fit=crop&q=80&w=800',
};

const CATEGORY_KO: Record<string, string> = {
  fashion: '패션', products: '상품', food: '푸드', brands: '브랜드', challenges: '챌린지',
};

const CATEGORY_EMOJI: Record<string, string> = {
  fashion: '👗', products: '📦', food: '🍪', brands: '🏷️', challenges: '🔥',
};

let cachedRealData: RealTrendsData | null = null;

function loadRealData(): RealTrendsData | null {
  if (cachedRealData) return cachedRealData;
  try {
    if (typeof window !== 'undefined') return null;
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const fs = require('fs');
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const path = require('path');
    const filePath = path.join(process.cwd(), 'public', 'data', 'trends.json');
    if (!fs.existsSync(filePath)) return null;
    const raw = fs.readFileSync(filePath, 'utf-8');
    cachedRealData = JSON.parse(raw);
    return cachedRealData;
  } catch {
    return null;
  }
}

function realDataToTrends(code: string, countryName: string, realTrends: RealTrend[]): TrendWithDetails[] {
  return realTrends.map((t, i) => ({
    id: `real-${code}-${i}`,
    country_id: `country-${code}`,
    category_id: `cat-${t.category}`,
    name: t.keyword,
    description: t.related_queries?.slice(0, 3).join(', ') || '',
    image_url: CATEGORY_DEFAULT_IMAGES[t.category] || CATEGORY_DEFAULT_IMAGES.products,
    heat_score: t.heat_score,
    heat_status: t.heat_status as 'new' | 'rising' | 'steady' | 'cooling',
    search_score: t.search_score,
    social_score: t.social_score,
    ecommerce_score: 0,
    news_score: 0,
    tags: t.related_queries?.slice(0, 5) || [],
    source_urls: [],
    first_detected_at: t.collected_at,
    last_updated_at: t.collected_at,
    created_at: t.collected_at,
    country: {
      code: code.toUpperCase(),
      name_ko: countryName,
      name_en: countryName,
      flag_emoji: '',
    },
    category: {
      slug: t.category as 'fashion' | 'products' | 'food' | 'brands' | 'challenges',
      name_ko: CATEGORY_KO[t.category] || t.category,
      name_en: t.category.charAt(0).toUpperCase() + t.category.slice(1),
      emoji: CATEGORY_EMOJI[t.category] || '📦',
    },
  }));
}

// ============================================================
// 1. 인터페이스 & 타입
// ============================================================

export interface TemplateCountry {
  code: string;
  name_en: string;
  name_ko: string;
  name_local: string;
  description: string;
  region: string;
  sub_region: string;
}

/** 16개 지역 분류 */
export type TemplateRegion =
  | 'east_asia'
  | 'southeast_asia'
  | 'south_asia'
  | 'central_asia'
  | 'middle_east'
  | 'west_europe'
  | 'east_europe'
  | 'north_europe'
  | 'south_europe'
  | 'north_america'
  | 'latin_america'
  | 'west_africa'
  | 'east_africa'
  | 'north_africa'
  | 'south_africa_region'
  | 'oceania';

interface RegionTrendTemplate {
  category_id: string;
  name: string;
  name_local: string;
  description: string;
  image_url: string;
  price: string;
  heat_score: number;
  heat_status: 'rising' | 'steady' | 'cooling' | 'new';
  tags: string[];
}

// ============================================================
// 2. 국기 이모지 매핑 (ISO alpha-2 대문자 → 이모지)
// ============================================================

function codeToFlagEmoji(code: string): string {
  const upper = code.toUpperCase();
  const offset = 0x1F1E6 - 65; // 'A' = 65
  return String.fromCodePoint(
    upper.charCodeAt(0) + offset,
    upper.charCodeAt(1) + offset,
  );
}

// ============================================================
// 3. 국가 메타데이터 (80개+)
// ============================================================

const TEMPLATE_COUNTRIES: Record<string, TemplateCountry> = {
  // ── East Asia ──
  tw: { code: 'tw', name_en: 'Taiwan', name_ko: '대만', name_local: '臺灣', description: 'A vibrant island blending Chinese heritage with modern tech innovation and legendary street food culture.', region: 'asia', sub_region: 'east_asia' },
  mn: { code: 'mn', name_en: 'Mongolia', name_ko: '몽골', name_local: 'Монгол', description: 'Land of endless steppes where nomadic traditions meet a rapidly modernizing urban culture.', region: 'asia', sub_region: 'east_asia' },
  hk: { code: 'hk', name_en: 'Hong Kong', name_ko: '홍콩', name_local: '香港', description: 'A dynamic fusion of East and West, from towering skylines to bustling street markets.', region: 'asia', sub_region: 'east_asia' },

  // ── Southeast Asia ──
  th: { code: 'th', name_en: 'Thailand', name_ko: '태국', name_local: 'ประเทศไทย', description: 'The Land of Smiles where ancient temples, tropical beaches, and vibrant street food create a sensory paradise.', region: 'asia', sub_region: 'southeast_asia' },
  vn: { code: 'vn', name_en: 'Vietnam', name_ko: '베트남', name_local: 'Việt Nam', description: 'A rising economic star where traditional pho kitchens share streets with modern tech startups.', region: 'asia', sub_region: 'southeast_asia' },
  id: { code: 'id', name_en: 'Indonesia', name_ko: '인도네시아', name_local: 'Indonesia', description: 'The world\'s largest archipelago, rich in biodiversity and home to a booming digital economy.', region: 'asia', sub_region: 'southeast_asia' },
  my: { code: 'my', name_en: 'Malaysia', name_ko: '말레이시아', name_local: 'Malaysia', description: 'A multicultural melting pot where Malay, Chinese, and Indian traditions create a unique consumer landscape.', region: 'asia', sub_region: 'southeast_asia' },
  ph: { code: 'ph', name_en: 'Philippines', name_ko: '필리핀', name_local: 'Pilipinas', description: 'An archipelago of over 7,000 islands with a young, social-media-savvy population driving trends.', region: 'asia', sub_region: 'southeast_asia' },
  sg: { code: 'sg', name_en: 'Singapore', name_ko: '싱가포르', name_local: 'Singapore', description: 'A city-state that punches above its weight as a global hub for innovation, food, and luxury.', region: 'asia', sub_region: 'southeast_asia' },
  mm: { code: 'mm', name_en: 'Myanmar', name_ko: '미얀마', name_local: 'မြန်မာ', description: 'A land of golden pagodas and emerging markets where traditional craftsmanship persists.', region: 'asia', sub_region: 'southeast_asia' },
  kh: { code: 'kh', name_en: 'Cambodia', name_ko: '캄보디아', name_local: 'កម្ពុជា', description: 'Home of Angkor Wat, where ancient heritage inspires a growing creative and digital economy.', region: 'asia', sub_region: 'southeast_asia' },
  la: { code: 'la', name_en: 'Laos', name_ko: '라오스', name_local: 'ລາວ', description: 'A landlocked gem known for its serene landscapes, Buddhist culture, and emerging eco-tourism.', region: 'asia', sub_region: 'southeast_asia' },

  // ── South Asia ──
  in: { code: 'in', name_en: 'India', name_ko: '인도', name_local: 'भारत', description: 'A billion-strong market where ancient Ayurvedic wisdom meets the world\'s fastest-growing tech ecosystem.', region: 'asia', sub_region: 'south_asia' },
  bd: { code: 'bd', name_en: 'Bangladesh', name_ko: '방글라데시', name_local: 'বাংলাদেশ', description: 'The garment capital of the world with a rapidly digitizing population and rich textile heritage.', region: 'asia', sub_region: 'south_asia' },
  pk: { code: 'pk', name_en: 'Pakistan', name_ko: '파키스탄', name_local: 'پاکستان', description: 'A nation of vibrant bazaars, rich textiles, and a booming youth-driven digital economy.', region: 'asia', sub_region: 'south_asia' },
  lk: { code: 'lk', name_en: 'Sri Lanka', name_ko: '스리랑카', name_local: 'ශ්‍රී ලංකාව', description: 'The pearl of the Indian Ocean, renowned for Ceylon tea, spices, and gemstones.', region: 'asia', sub_region: 'south_asia' },
  np: { code: 'np', name_en: 'Nepal', name_ko: '네팔', name_local: 'नेपाल', description: 'Nestled in the Himalayas, where trekking culture and spiritual traditions drive unique consumer trends.', region: 'asia', sub_region: 'south_asia' },

  // ── Central Asia ──
  kz: { code: 'kz', name_en: 'Kazakhstan', name_ko: '카자흐스탄', name_local: 'Қазақстан', description: 'The largest Central Asian nation blending nomadic Turkic heritage with modern oil-rich urbanization.', region: 'asia', sub_region: 'central_asia' },
  uz: { code: 'uz', name_en: 'Uzbekistan', name_ko: '우즈베키스탄', name_local: 'Oʻzbekiston', description: 'A Silk Road jewel where ancient bazaars meet a new wave of tourism and craft revival.', region: 'asia', sub_region: 'central_asia' },
  kg: { code: 'kg', name_en: 'Kyrgyzstan', name_ko: '키르기스스탄', name_local: 'Кыргызстан', description: 'A mountainous republic where yurt culture and horseback traditions inspire artisanal products.', region: 'asia', sub_region: 'central_asia' },
  tj: { code: 'tj', name_en: 'Tajikistan', name_ko: '타지키스탄', name_local: 'Тоҷикистон', description: 'Home to the Pamir Mountains, where Persian-influenced culture shapes local crafts and cuisine.', region: 'asia', sub_region: 'central_asia' },
  tm: { code: 'tm', name_en: 'Turkmenistan', name_ko: '투르크메니스탄', name_local: 'Türkmenistan', description: 'A nation of desert landscapes and the ancient city of Merv, known for handwoven carpets.', region: 'asia', sub_region: 'central_asia' },

  // ── Middle East ──
  ae: { code: 'ae', name_en: 'United Arab Emirates', name_ko: 'UAE', name_local: 'الإمارات', description: 'A futuristic desert nation where luxury shopping, gold souks, and global ambition converge.', region: 'middle_east', sub_region: 'middle_east' },
  sa: { code: 'sa', name_en: 'Saudi Arabia', name_ko: '사우디아라비아', name_local: 'المملكة العربية السعودية', description: 'A kingdom undergoing rapid modernization under Vision 2030, blending tradition with innovation.', region: 'middle_east', sub_region: 'middle_east' },
  tr: { code: 'tr', name_en: 'Turkey', name_ko: '터키', name_local: 'Türkiye', description: 'A bridge between Europe and Asia where Ottoman heritage meets a thriving modern creative scene.', region: 'middle_east', sub_region: 'middle_east' },
  il: { code: 'il', name_en: 'Israel', name_ko: '이스라엘', name_local: 'ישראל', description: 'The Startup Nation where cutting-edge technology and ancient history create a unique market.', region: 'middle_east', sub_region: 'middle_east' },
  qa: { code: 'qa', name_en: 'Qatar', name_ko: '카타르', name_local: 'قطر', description: 'A wealthy Gulf state investing heavily in sports, culture, and world-class infrastructure.', region: 'middle_east', sub_region: 'middle_east' },
  jo: { code: 'jo', name_en: 'Jordan', name_ko: '요르단', name_local: 'الأردن', description: 'Home of Petra and the Dead Sea, where ancient traditions meet a growing tech-savvy youth.', region: 'middle_east', sub_region: 'middle_east' },
  kw: { code: 'kw', name_en: 'Kuwait', name_ko: '쿠웨이트', name_local: 'الكويت', description: 'A Gulf state with a strong consumer culture driven by luxury goods and social media trends.', region: 'middle_east', sub_region: 'middle_east' },
  lb: { code: 'lb', name_en: 'Lebanon', name_ko: '레바논', name_local: 'لبنان', description: 'The Paris of the Middle East, renowned for its cuisine, fashion sense, and resilient creative spirit.', region: 'middle_east', sub_region: 'middle_east' },
  ir: { code: 'ir', name_en: 'Iran', name_ko: '이란', name_local: 'ایران', description: 'An ancient civilization with rich artistic traditions in carpets, poetry, and saffron cuisine.', region: 'middle_east', sub_region: 'middle_east' },

  // ── West Europe ──
  de: { code: 'de', name_en: 'Germany', name_ko: '독일', name_local: 'Deutschland', description: 'Europe\'s industrial powerhouse where engineering precision meets sustainable living and craft beer culture.', region: 'europe', sub_region: 'west_europe' },
  nl: { code: 'nl', name_en: 'Netherlands', name_ko: '네덜란드', name_local: 'Nederland', description: 'A cycling nation of canals and design innovation, leading in sustainable fashion and flower culture.', region: 'europe', sub_region: 'west_europe' },
  be: { code: 'be', name_en: 'Belgium', name_ko: '벨기에', name_local: 'België', description: 'The heart of Europe, famous for chocolate, beer, waffles, and avant-garde fashion from Antwerp.', region: 'europe', sub_region: 'west_europe' },
  ch: { code: 'ch', name_en: 'Switzerland', name_ko: '스위스', name_local: 'Schweiz', description: 'A land of Alpine precision known for luxury watches, chocolate, and sustainable mountain lifestyle.', region: 'europe', sub_region: 'west_europe' },
  at: { code: 'at', name_en: 'Austria', name_ko: '오스트리아', name_local: 'Österreich', description: 'A cultural capital where classical music tradition meets modern Alpine wellness and design.', region: 'europe', sub_region: 'west_europe' },
  ie: { code: 'ie', name_en: 'Ireland', name_ko: '아일랜드', name_local: 'Éire', description: 'The Emerald Isle where Celtic heritage, literary tradition, and tech hub energy converge.', region: 'europe', sub_region: 'west_europe' },
  lu: { code: 'lu', name_en: 'Luxembourg', name_ko: '룩셈부르크', name_local: 'Lëtzebuerg', description: 'Europe\'s wealthiest per capita nation with a cosmopolitan lifestyle and multicultural dining scene.', region: 'europe', sub_region: 'west_europe' },

  // ── East Europe ──
  pl: { code: 'pl', name_en: 'Poland', name_ko: '폴란드', name_local: 'Polska', description: 'A rising European economy where medieval charm meets a booming tech and gaming industry.', region: 'europe', sub_region: 'east_europe' },
  cz: { code: 'cz', name_en: 'Czech Republic', name_ko: '체코', name_local: 'Česko', description: 'A bohemian gem famous for crystal glasswork, craft beer, and a thriving design scene.', region: 'europe', sub_region: 'east_europe' },
  hu: { code: 'hu', name_en: 'Hungary', name_ko: '헝가리', name_local: 'Magyarország', description: 'A thermal bath paradise where paprika cuisine and ruin bar culture drive unique lifestyle trends.', region: 'europe', sub_region: 'east_europe' },
  ro: { code: 'ro', name_en: 'Romania', name_ko: '루마니아', name_local: 'România', description: 'A land of Transylvanian castles and Carpathian nature, with a growing IT sector and artisan revival.', region: 'europe', sub_region: 'east_europe' },
  ua: { code: 'ua', name_en: 'Ukraine', name_ko: '우크라이나', name_local: 'Україна', description: 'A resilient nation with rich agricultural traditions, vibrant folk art, and a tech-forward youth culture.', region: 'europe', sub_region: 'east_europe' },
  bg: { code: 'bg', name_en: 'Bulgaria', name_ko: '불가리아', name_local: 'България', description: 'A Balkan treasure where rose oil production, yogurt culture, and Black Sea tourism thrive.', region: 'europe', sub_region: 'east_europe' },
  hr: { code: 'hr', name_en: 'Croatia', name_ko: '크로아티아', name_local: 'Hrvatska', description: 'An Adriatic jewel where Mediterranean lifestyle meets Slavic heritage and world-class tourism.', region: 'europe', sub_region: 'east_europe' },
  rs: { code: 'rs', name_en: 'Serbia', name_ko: '세르비아', name_local: 'Србија', description: 'A Balkan crossroads known for vibrant nightlife, rakija culture, and an emerging startup ecosystem.', region: 'europe', sub_region: 'east_europe' },
  sk: { code: 'sk', name_en: 'Slovakia', name_ko: '슬로바키아', name_local: 'Slovensko', description: 'A Carpathian nation where medieval castles and mountain resorts drive heritage tourism.', region: 'europe', sub_region: 'east_europe' },
  ru: { code: 'ru', name_en: 'Russia', name_ko: '러시아', name_local: 'Россия', description: 'The world\'s largest country, spanning two continents with a rich legacy in art, science, and cuisine.', region: 'europe', sub_region: 'east_europe' },

  // ── North Europe ──
  se: { code: 'se', name_en: 'Sweden', name_ko: '스웨덴', name_local: 'Sverige', description: 'A Nordic innovator leading in sustainability, design minimalism, and the concept of lagom balance.', region: 'europe', sub_region: 'north_europe' },
  dk: { code: 'dk', name_en: 'Denmark', name_ko: '덴마크', name_local: 'Danmark', description: 'The birthplace of hygge, New Nordic cuisine, and world-class Scandinavian design.', region: 'europe', sub_region: 'north_europe' },
  no: { code: 'no', name_en: 'Norway', name_ko: '노르웨이', name_local: 'Norge', description: 'A fjord nation where outdoor adventure culture and sustainability drive premium lifestyle trends.', region: 'europe', sub_region: 'north_europe' },
  fi: { code: 'fi', name_en: 'Finland', name_ko: '핀란드', name_local: 'Suomi', description: 'The happiest country on Earth, known for sauna culture, Marimekko design, and Arctic wellness.', region: 'europe', sub_region: 'north_europe' },
  is: { code: 'is', name_en: 'Iceland', name_ko: '아이슬란드', name_local: 'Ísland', description: 'A volcanic island of geothermal pools, Northern Lights tourism, and creative music-driven culture.', region: 'europe', sub_region: 'north_europe' },
  ee: { code: 'ee', name_en: 'Estonia', name_ko: '에스토니아', name_local: 'Eesti', description: 'Europe\'s most digitally advanced nation, birthplace of Skype and a thriving e-residency program.', region: 'europe', sub_region: 'north_europe' },
  lt: { code: 'lt', name_en: 'Lithuania', name_ko: '리투아니아', name_local: 'Lietuva', description: 'A Baltic gem with baroque architecture, amber jewelry tradition, and a growing fintech scene.', region: 'europe', sub_region: 'north_europe' },
  lv: { code: 'lv', name_en: 'Latvia', name_ko: '라트비아', name_local: 'Latvija', description: 'A Baltic nation of art nouveau architecture, birch sap traditions, and Riga\'s vibrant creative scene.', region: 'europe', sub_region: 'north_europe' },

  // ── South Europe ──
  it: { code: 'it', name_en: 'Italy', name_ko: '이탈리아', name_local: 'Italia', description: 'The cradle of Renaissance art, fashion capital of Milan, and the world\'s most beloved cuisine.', region: 'europe', sub_region: 'south_europe' },
  es: { code: 'es', name_en: 'Spain', name_ko: '스페인', name_local: 'España', description: 'A sun-soaked nation of flamenco passion, tapas culture, and a resurgent fashion and design scene.', region: 'europe', sub_region: 'south_europe' },
  pt: { code: 'pt', name_en: 'Portugal', name_ko: '포르투갈', name_local: 'Portugal', description: 'Europe\'s western edge, where fado music, pastéis de nata, and a booming startup scene thrive.', region: 'europe', sub_region: 'south_europe' },
  gr: { code: 'gr', name_en: 'Greece', name_ko: '그리스', name_local: 'Ελλάδα', description: 'The birthplace of democracy and philosophy, known for Mediterranean diet, olive oil, and island tourism.', region: 'europe', sub_region: 'south_europe' },

  // ── North America ──
  ca: { code: 'ca', name_en: 'Canada', name_ko: '캐나다', name_local: 'Canada', description: 'A vast multicultural nation where outdoor lifestyle, maple traditions, and tech innovation converge.', region: 'americas', sub_region: 'north_america' },
  mx: { code: 'mx', name_en: 'Mexico', name_ko: '멕시코', name_local: 'México', description: 'A vibrant land of ancient civilizations, world-class cuisine, and a booming creative economy.', region: 'americas', sub_region: 'north_america' },

  // ── Latin America ──
  br: { code: 'br', name_en: 'Brazil', name_ko: '브라질', name_local: 'Brasil', description: 'A continental nation of samba, carnival, and the Amazon, with a massive and trend-hungry consumer market.', region: 'americas', sub_region: 'latin_america' },
  ar: { code: 'ar', name_en: 'Argentina', name_ko: '아르헨티나', name_local: 'Argentina', description: 'The land of tango, Malbec wine, and passionate football culture, with a sophisticated urban lifestyle.', region: 'americas', sub_region: 'latin_america' },
  co: { code: 'co', name_en: 'Colombia', name_ko: '콜롬비아', name_local: 'Colombia', description: 'A nation of coffee, emeralds, and cumbia rhythm, experiencing a cultural and economic renaissance.', region: 'americas', sub_region: 'latin_america' },
  cl: { code: 'cl', name_en: 'Chile', name_ko: '칠레', name_local: 'Chile', description: 'A slender nation stretching from the Atacama to Patagonia, known for wine and a stable tech ecosystem.', region: 'americas', sub_region: 'latin_america' },
  pe: { code: 'pe', name_en: 'Peru', name_ko: '페루', name_local: 'Perú', description: 'Home of Machu Picchu and ceviche, leading a global gastronomic revolution with ancient superfoods.', region: 'americas', sub_region: 'latin_america' },
  ec: { code: 'ec', name_en: 'Ecuador', name_ko: '에콰도르', name_local: 'Ecuador', description: 'The Galápagos nation where biodiversity meets cacao, roses, and vibrant indigenous markets.', region: 'americas', sub_region: 'latin_america' },
  uy: { code: 'uy', name_en: 'Uruguay', name_ko: '우루과이', name_local: 'Uruguay', description: 'A progressive South American nation known for mate culture, beef, and a laid-back coastal lifestyle.', region: 'americas', sub_region: 'latin_america' },
  cr: { code: 'cr', name_en: 'Costa Rica', name_ko: '코스타리카', name_local: 'Costa Rica', description: 'A green paradise committed to sustainability, ecotourism, and the pura vida lifestyle.', region: 'americas', sub_region: 'latin_america' },
  cu: { code: 'cu', name_en: 'Cuba', name_ko: '쿠바', name_local: 'Cuba', description: 'An island of vintage cars, salsa rhythms, and cigars, where retro charm meets emerging creative culture.', region: 'americas', sub_region: 'latin_america' },
  pa: { code: 'pa', name_en: 'Panama', name_ko: '파나마', name_local: 'Panamá', description: 'A crossroads of the Americas where the famous canal meets a booming cosmopolitan economy.', region: 'americas', sub_region: 'latin_america' },

  // ── West Africa ──
  ng: { code: 'ng', name_en: 'Nigeria', name_ko: '나이지리아', name_local: 'Nigeria', description: 'Africa\'s most populous nation, a powerhouse of Nollywood, Afrobeats, and tech entrepreneurship.', region: 'africa', sub_region: 'west_africa' },
  gh: { code: 'gh', name_en: 'Ghana', name_ko: '가나', name_local: 'Ghana', description: 'The Gold Coast, known for kente cloth, cocoa, and a thriving Accra-based tech and creative scene.', region: 'africa', sub_region: 'west_africa' },
  sn: { code: 'sn', name_en: 'Senegal', name_ko: '세네갈', name_local: 'Sénégal', description: 'A West African cultural hub known for thiéboudienne cuisine, vibrant music, and Dakar fashion week.', region: 'africa', sub_region: 'west_africa' },
  ci: { code: 'ci', name_en: 'Ivory Coast', name_ko: '코트디부아르', name_local: 'Côte d\'Ivoire', description: 'The world\'s top cocoa producer with a growing urban fashion and music scene in Abidjan.', region: 'africa', sub_region: 'west_africa' },
  ml: { code: 'ml', name_en: 'Mali', name_ko: '말리', name_local: 'Mali', description: 'An ancient Saharan crossroads known for mud-cloth textiles, gold, and the musical heritage of Timbuktu.', region: 'africa', sub_region: 'west_africa' },

  // ── East Africa ──
  ke: { code: 'ke', name_en: 'Kenya', name_ko: '케냐', name_local: 'Kenya', description: 'East Africa\'s tech hub where safari tourism, M-Pesa innovation, and Nairobi\'s creative scene converge.', region: 'africa', sub_region: 'east_africa' },
  et: { code: 'et', name_en: 'Ethiopia', name_ko: '에티오피아', name_local: 'ኢትዮጵያ', description: 'The birthplace of coffee, home to ancient civilizations, and Africa\'s fastest-growing economy.', region: 'africa', sub_region: 'east_africa' },
  tz: { code: 'tz', name_en: 'Tanzania', name_ko: '탄자니아', name_local: 'Tanzania', description: 'Home of Kilimanjaro and the Serengeti, where wildlife tourism and Tanzanite gemstones thrive.', region: 'africa', sub_region: 'east_africa' },
  ug: { code: 'ug', name_en: 'Uganda', name_ko: '우간다', name_local: 'Uganda', description: 'The Pearl of Africa, known for mountain gorillas, Robusta coffee, and a vibrant Kampala tech scene.', region: 'africa', sub_region: 'east_africa' },
  rw: { code: 'rw', name_en: 'Rwanda', name_ko: '르완다', name_local: 'Rwanda', description: 'Africa\'s cleanest and fastest-digitizing nation, known for specialty coffee and innovative governance.', region: 'africa', sub_region: 'east_africa' },

  // ── North Africa ──
  ma: { code: 'ma', name_en: 'Morocco', name_ko: '모로코', name_local: 'المغرب', description: 'A gateway between Africa and Europe, famed for argan oil, vibrant souks, and riad hospitality.', region: 'africa', sub_region: 'north_africa' },
  eg: { code: 'eg', name_en: 'Egypt', name_ko: '이집트', name_local: 'مصر', description: 'Land of the Pharaohs where ancient wonders meet a young, trend-conscious population along the Nile.', region: 'africa', sub_region: 'north_africa' },
  tn: { code: 'tn', name_en: 'Tunisia', name_ko: '튀니지', name_local: 'تونس', description: 'A Mediterranean crossroads known for olive oil, harissa cuisine, and Carthaginian heritage.', region: 'africa', sub_region: 'north_africa' },
  dz: { code: 'dz', name_en: 'Algeria', name_ko: '알제리', name_local: 'الجزائر', description: 'Africa\'s largest country with Saharan landscapes, French-influenced cuisine, and rich Berber culture.', region: 'africa', sub_region: 'north_africa' },

  // ── South Africa Region ──
  za: { code: 'za', name_en: 'South Africa', name_ko: '남아프리카공화국', name_local: 'South Africa', description: 'The Rainbow Nation where diverse cultures, world-class vineyards, and township creativity merge.', region: 'africa', sub_region: 'south_africa_region' },
  bw: { code: 'bw', name_en: 'Botswana', name_ko: '보츠와나', name_local: 'Botswana', description: 'A diamond-rich nation with pristine wildlife reserves and one of Africa\'s most stable economies.', region: 'africa', sub_region: 'south_africa_region' },
  na: { code: 'na', name_en: 'Namibia', name_ko: '나미비아', name_local: 'Namibia', description: 'A land of dramatic desert landscapes, Himba heritage, and eco-conscious safari tourism.', region: 'africa', sub_region: 'south_africa_region' },
  mz: { code: 'mz', name_en: 'Mozambique', name_ko: '모잠비크', name_local: 'Moçambique', description: 'An Indian Ocean nation where peri-peri cuisine, coral reefs, and Portuguese-influenced culture thrive.', region: 'africa', sub_region: 'south_africa_region' },
  zw: { code: 'zw', name_en: 'Zimbabwe', name_ko: '짐바브웨', name_local: 'Zimbabwe', description: 'Home of Victoria Falls and Great Zimbabwe, with resilient artisans and a creative revival.', region: 'africa', sub_region: 'south_africa_region' },

  // ── Oceania ──
  au: { code: 'au', name_en: 'Australia', name_ko: '호주', name_local: 'Australia', description: 'A sun-drenched continent where surf culture, specialty coffee, and indigenous art shape modern trends.', region: 'oceania', sub_region: 'oceania' },
  nz: { code: 'nz', name_en: 'New Zealand', name_ko: '뉴질랜드', name_local: 'Aotearoa', description: 'A land of dramatic landscapes where Maori culture, Manuka honey, and outdoor adventure converge.', region: 'oceania', sub_region: 'oceania' },
  fj: { code: 'fj', name_en: 'Fiji', name_ko: '피지', name_local: 'Fiji', description: 'A tropical paradise of 330 islands known for kava ceremonies, bula spirit, and eco-resorts.', region: 'oceania', sub_region: 'oceania' },
  pg: { code: 'pg', name_en: 'Papua New Guinea', name_ko: '파푸아뉴기니', name_local: 'Papua Niugini', description: 'One of the most culturally diverse nations on Earth, with over 800 languages and rich tribal arts.', region: 'oceania', sub_region: 'oceania' },
};

// ============================================================
// 4. 지역별 트렌드 템플릿
// ============================================================

const REGION_TRENDS: Record<TemplateRegion, RegionTrendTemplate[]> = {
  east_asia: [
    { category_id: 'cat-products', name: 'K-beauty Glass Skin Routine', name_local: 'K-뷰티 글래스 스킨', description: 'The Korean multi-step skincare routine achieving the coveted glass-like luminous complexion, now adopted across East Asia.', image_url: 'https://images.unsplash.com/photo-1556228578-0d85b1a4d571?auto=format&fit=crop&q=80&w=800', price: '¥3,800', heat_score: 88, heat_status: 'rising', tags: ['K-beauty', 'skincare', 'glass skin', 'multi-step', 'luminous'] },
    { category_id: 'cat-food', name: 'Bubble Tea Innovation', name_local: 'バブルティー', description: 'Next-gen bubble tea with cheese foam, fruit teas, and premium toppings pushing beyond classic milk tea.', image_url: 'https://images.unsplash.com/photo-1558857563-b371033873b8?auto=format&fit=crop&q=80&w=800', price: '¥680', heat_score: 82, heat_status: 'steady', tags: ['bubble tea', 'boba', 'cheese foam', 'milk tea', 'dessert drink'] },
    { category_id: 'cat-brands', name: 'Anime Collectibles & Gacha', name_local: 'アニメコレクション', description: 'Limited-edition anime figures, blind box gacha toys, and character collaboration merchandise driving collector frenzy.', image_url: 'https://images.unsplash.com/photo-1558618666-fcd25c85f82e?auto=format&fit=crop&q=80&w=800', price: '¥2,200', heat_score: 85, heat_status: 'rising', tags: ['anime', 'collectibles', 'gacha', 'figures', 'blind box'] },
    { category_id: 'cat-products', name: 'Smart Home Ecosystem', name_local: '스마트홈 생태계', description: 'AI-powered home devices from voice assistants to robotic vacuums creating seamless connected living spaces.', image_url: 'https://images.unsplash.com/photo-1558002038-1055907df827?auto=format&fit=crop&q=80&w=800', price: '¥15,800', heat_score: 76, heat_status: 'steady', tags: ['smart home', 'IoT', 'AI assistant', 'robot vacuum', 'connected'] },
    { category_id: 'cat-fashion', name: 'Gorpcore Outdoor Style', name_local: '고프코어', description: 'Technical outdoor wear repurposed as everyday fashion, blending hiking gear aesthetics with urban style.', image_url: 'https://images.unsplash.com/photo-1551698618-1dfe5d97d256?auto=format&fit=crop&q=80&w=800', price: '¥12,000', heat_score: 79, heat_status: 'rising', tags: ['gorpcore', 'outdoor', 'technical wear', 'hiking fashion', 'urban'] },
  ],
  southeast_asia: [
    { category_id: 'cat-food', name: 'Elevated Street Food', name_local: 'อาหารริมทาง', description: 'Traditional street food reimagined with premium ingredients and Instagram-worthy presentation in night markets.', image_url: 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&q=80&w=800', price: '฿180', heat_score: 87, heat_status: 'rising', tags: ['street food', 'night market', 'Thai food', 'hawker', 'gourmet'] },
    { category_id: 'cat-fashion', name: 'Tropical Resort Wear', name_local: 'แฟชั่นเขตร้อน', description: 'Breezy linen sets, batik-printed resort wear, and sustainable tropical fashion for year-round warm climates.', image_url: 'https://images.unsplash.com/photo-1469334031218-e382a71b716b?auto=format&fit=crop&q=80&w=800', price: '฿1,590', heat_score: 75, heat_status: 'steady', tags: ['resort wear', 'tropical', 'linen', 'batik', 'sustainable'] },
    { category_id: 'cat-products', name: 'Super App Ride-Hailing', name_local: 'แอปเรียกรถ', description: 'Grab, Gojek, and local super-apps expanding beyond rides into food delivery, payments, and financial services.', image_url: 'https://images.unsplash.com/photo-1519389950473-47ba0277781c?auto=format&fit=crop&q=80&w=800', price: '฿45', heat_score: 80, heat_status: 'steady', tags: ['super app', 'ride-hailing', 'Grab', 'Gojek', 'fintech'] },
    { category_id: 'cat-products', name: 'Coconut & Tropical Beauty', name_local: 'ผลิตภัณฑ์มะพร้าว', description: 'Cold-pressed coconut oil skincare, tropical fruit enzymes, and pandan-infused beauty products.', image_url: 'https://images.unsplash.com/photo-1608571423902-eed4a5ad8108?auto=format&fit=crop&q=80&w=800', price: '฿490', heat_score: 72, heat_status: 'new', tags: ['coconut', 'tropical beauty', 'natural', 'pandan', 'organic'] },
    { category_id: 'cat-products', name: 'Cafe Hopping Culture', name_local: 'คาเฟ่ฮ็อปปิ้ง', description: 'Instagram-driven cafe culture with themed cafes, specialty coffee, and photogenic dessert presentations.', image_url: 'https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?auto=format&fit=crop&q=80&w=800', price: '฿150', heat_score: 78, heat_status: 'rising', tags: ['cafe', 'specialty coffee', 'Instagram', 'dessert', 'lifestyle'] },
  ],
  south_asia: [
    { category_id: 'cat-products', name: 'Ayurvedic & Spice Skincare', name_local: 'आयुर्वेदिक स्किनकेयर', description: 'Ancient Ayurvedic formulations with turmeric, neem, and saffron repackaged as modern luxury skincare.', image_url: 'https://images.unsplash.com/photo-1556228578-0d85b1a4d571?auto=format&fit=crop&q=80&w=800', price: '₹1,299', heat_score: 84, heat_status: 'rising', tags: ['Ayurveda', 'turmeric', 'neem', 'saffron', 'natural skincare'] },
    { category_id: 'cat-brands', name: 'Cricket Merch & Fan Culture', name_local: 'क्रिकेट मर्चेंडाइज', description: 'IPL and national cricket team merchandise, from jerseys to limited-edition collectibles fueling fan spending.', image_url: 'https://images.unsplash.com/photo-1531415074968-036ba1b575da?auto=format&fit=crop&q=80&w=800', price: '₹2,499', heat_score: 81, heat_status: 'steady', tags: ['cricket', 'IPL', 'merchandise', 'sports', 'fan culture'] },
    { category_id: 'cat-food', name: 'Masala Chai Premium Blends', name_local: 'मसाला चाय', description: 'Artisanal chai brands elevating traditional masala chai with single-origin teas and premium spice blends.', image_url: 'https://images.unsplash.com/photo-1564890369478-c89ca6d9cde9?auto=format&fit=crop&q=80&w=800', price: '₹599', heat_score: 77, heat_status: 'steady', tags: ['chai', 'masala', 'tea', 'artisanal', 'spices'] },
    { category_id: 'cat-fashion', name: 'Contemporary Textile Arts', name_local: 'समकालीन वस्त्र', description: 'Traditional handloom fabrics like Banarasi silk and Ikat reimagined in modern silhouettes for global appeal.', image_url: 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&q=80&w=800', price: '₹4,999', heat_score: 73, heat_status: 'rising', tags: ['handloom', 'silk', 'Ikat', 'textile', 'artisan'] },
    { category_id: 'cat-products', name: 'UPI Digital Payments', name_local: 'डिजिटल भुगतान', description: 'India\'s UPI revolution enabling seamless digital payments, from street vendors to luxury stores.', image_url: 'https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?auto=format&fit=crop&q=80&w=800', price: '₹0', heat_score: 90, heat_status: 'steady', tags: ['UPI', 'digital payments', 'fintech', 'cashless', 'mobile'] },
  ],
  central_asia: [
    { category_id: 'cat-fashion', name: 'Silk Road Revival Fashion', name_local: 'Жібек жолы сәні', description: 'Traditional ikat patterns and Suzani embroidery reinterpreted in contemporary fashion along the ancient trade routes.', image_url: 'https://images.unsplash.com/photo-1617019114583-affb34d1b3cd?auto=format&fit=crop&q=80&w=800', price: '₸15,000', heat_score: 70, heat_status: 'new', tags: ['Silk Road', 'ikat', 'Suzani', 'embroidery', 'heritage'] },
    { category_id: 'cat-food', name: 'Fermented Mare\'s Milk (Kumis)', name_local: 'Қымыз', description: 'Traditional kumis and other fermented dairy products gaining recognition as probiotic superfoods.', image_url: 'https://images.unsplash.com/photo-1550583724-b2692b85b150?auto=format&fit=crop&q=80&w=800', price: '₸800', heat_score: 65, heat_status: 'steady', tags: ['kumis', 'fermented', 'probiotic', 'dairy', 'traditional'] },
    { category_id: 'cat-products', name: 'Yurt Glamping Experience', name_local: 'Юрта глэмпинг', description: 'Luxury yurt stays combining nomadic heritage with modern comfort in the vast Central Asian steppes.', image_url: 'https://images.unsplash.com/photo-1504280390367-361c6d9f38f4?auto=format&fit=crop&q=80&w=800', price: '₸25,000', heat_score: 68, heat_status: 'rising', tags: ['yurt', 'glamping', 'nomadic', 'steppe', 'eco-tourism'] },
    { category_id: 'cat-products', name: 'Handcrafted Natural Soap', name_local: 'Табиғи сабын', description: 'Artisan soaps made with local herbs, oils, and minerals from the Central Asian highlands.', image_url: 'https://images.unsplash.com/photo-1607006344380-b6775a0824a7?auto=format&fit=crop&q=80&w=800', price: '₸2,500', heat_score: 62, heat_status: 'new', tags: ['handmade', 'soap', 'natural', 'herbs', 'artisan'] },
  ],
  middle_east: [
    { category_id: 'cat-products', name: 'Arabic Perfume (Oud & Bakhoor)', name_local: 'عطور عربية', description: 'Luxurious oud-based fragrances and bakhoor incense gaining global recognition as the ultimate in niche perfumery.', image_url: 'https://images.unsplash.com/photo-1541643600914-78b084683601?auto=format&fit=crop&q=80&w=800', price: 'AED 350', heat_score: 86, heat_status: 'rising', tags: ['oud', 'bakhoor', 'perfume', 'fragrance', 'luxury'] },
    { category_id: 'cat-food', name: 'Gourmet Dates & Tahini', name_local: 'تمور فاخرة', description: 'Premium Medjool dates with artisan fillings and stone-ground tahini elevated as luxury health foods.', image_url: 'https://images.unsplash.com/photo-1590779033100-9f60a05a013d?auto=format&fit=crop&q=80&w=800', price: 'AED 85', heat_score: 78, heat_status: 'steady', tags: ['dates', 'Medjool', 'tahini', 'gourmet', 'health food'] },
    { category_id: 'cat-fashion', name: 'Modest Fashion Movement', name_local: 'أزياء محتشمة', description: 'Elegant modest fashion lines from global brands blending style with coverage for the modern Muslim consumer.', image_url: 'https://images.unsplash.com/photo-1590330297626-d7aff25a0431?auto=format&fit=crop&q=80&w=800', price: 'AED 420', heat_score: 83, heat_status: 'steady', tags: ['modest fashion', 'hijab', 'abaya', 'Muslim fashion', 'elegant'] },
    { category_id: 'cat-products', name: 'Gold & Diamond Jewelry', name_local: 'مجوهرات ذهبية', description: 'Dubai\'s gold souk culture expanding online with custom Arabic calligraphy jewelry and investment pieces.', image_url: 'https://images.unsplash.com/photo-1515562141589-67f0d706de39?auto=format&fit=crop&q=80&w=800', price: 'AED 2,800', heat_score: 80, heat_status: 'steady', tags: ['gold', 'jewelry', 'Dubai', 'calligraphy', 'luxury'] },
    { category_id: 'cat-products', name: 'Smart City Infrastructure', name_local: 'مدينة ذكية', description: 'AI-powered city management, autonomous transport, and digital governance leading the smart city revolution.', image_url: 'https://images.unsplash.com/photo-1519389950473-47ba0277781c?auto=format&fit=crop&q=80&w=800', price: 'AED 0', heat_score: 74, heat_status: 'rising', tags: ['smart city', 'AI', 'autonomous', 'digital', 'infrastructure'] },
  ],
  west_europe: [
    { category_id: 'cat-fashion', name: 'Sustainable Fashion Labels', name_local: 'Nachhaltige Mode', description: 'Eco-conscious brands using organic cotton, recycled materials, and transparent supply chains redefining European style.', image_url: 'https://images.unsplash.com/photo-1445205170230-053b83016050?auto=format&fit=crop&q=80&w=800', price: '€89', heat_score: 85, heat_status: 'rising', tags: ['sustainable', 'eco-fashion', 'organic', 'recycled', 'ethical'] },
    { category_id: 'cat-food', name: 'Artisan Sourdough Revival', name_local: 'Sauerteigbrot', description: 'The resurgence of traditional sourdough baking with heritage grain flours and slow fermentation techniques.', image_url: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?auto=format&fit=crop&q=80&w=800', price: '€6.50', heat_score: 76, heat_status: 'steady', tags: ['sourdough', 'artisan bread', 'heritage grain', 'fermentation', 'bakery'] },
    { category_id: 'cat-brands', name: 'Vintage Vinyl Collecting', name_local: 'Vinyl Sammeln', description: 'The vinyl record renaissance with audiophile pressings, colored editions, and independent record shops thriving.', image_url: 'https://images.unsplash.com/photo-1483412033650-1015ddeb83d1?auto=format&fit=crop&q=80&w=800', price: '€32', heat_score: 72, heat_status: 'steady', tags: ['vinyl', 'records', 'audiophile', 'music', 'collecting'] },
    { category_id: 'cat-food', name: 'Natural & Orange Wine', name_local: 'Naturwein', description: 'Minimal-intervention wines with no added sulfites, skin-contact orange wines, and biodynamic vineyard practices.', image_url: 'https://images.unsplash.com/photo-1510812431401-41d2bd2722f3?auto=format&fit=crop&q=80&w=800', price: '€18', heat_score: 74, heat_status: 'rising', tags: ['natural wine', 'orange wine', 'biodynamic', 'low sulfite', 'artisan'] },
    { category_id: 'cat-products', name: 'Circular Economy Products', name_local: 'Kreislaufwirtschaft', description: 'Refurbished electronics, upcycled furniture, and product-as-a-service models reshaping European consumer habits.', image_url: 'https://images.unsplash.com/photo-1532996122724-e3c354a0b15b?auto=format&fit=crop&q=80&w=800', price: '€45', heat_score: 70, heat_status: 'rising', tags: ['circular economy', 'upcycled', 'refurbished', 'sustainability', 'zero waste'] },
  ],
  east_europe: [
    { category_id: 'cat-food', name: 'Craft Spirits & Rakija', name_local: 'Ракија', description: 'Small-batch fruit brandies, craft vodka, and artisanal rakija with premium botanicals and heritage recipes.', image_url: 'https://images.unsplash.com/photo-1569529465841-dfecdab7503b?auto=format&fit=crop&q=80&w=800', price: 'zł89', heat_score: 74, heat_status: 'steady', tags: ['craft spirits', 'rakija', 'vodka', 'artisanal', 'brandy'] },
    { category_id: 'cat-fashion', name: 'Folk-Modern Fusion Fashion', name_local: 'Ludowa moda', description: 'Traditional Slavic embroidery patterns, Vyshyvanka shirts, and folk motifs integrated into contemporary streetwear.', image_url: 'https://images.unsplash.com/photo-1617019114583-affb34d1b3cd?auto=format&fit=crop&q=80&w=800', price: 'zł199', heat_score: 71, heat_status: 'new', tags: ['folk fashion', 'Vyshyvanka', 'embroidery', 'Slavic', 'streetwear'] },
    { category_id: 'cat-products', name: 'Gaming & Esports Scene', name_local: 'Gry i esport', description: 'Poland\'s CD Projekt, Czech indie studios, and the booming Eastern European gaming and esports ecosystem.', image_url: 'https://images.unsplash.com/photo-1542751371-adc38448a05e?auto=format&fit=crop&q=80&w=800', price: 'zł249', heat_score: 79, heat_status: 'rising', tags: ['gaming', 'esports', 'indie games', 'CD Projekt', 'streaming'] },
    { category_id: 'cat-food', name: 'Fermented Foods Renaissance', name_local: 'Kiszona żywność', description: 'Traditional fermented foods like sauerkraut, kefir, and pickled vegetables rebranded as gut-health superfoods.', image_url: 'https://images.unsplash.com/photo-1590779033100-9f60a05a013d?auto=format&fit=crop&q=80&w=800', price: 'zł24', heat_score: 68, heat_status: 'steady', tags: ['fermented', 'sauerkraut', 'kefir', 'probiotics', 'gut health'] },
    { category_id: 'cat-products', name: 'Eastern European Botanicals', name_local: 'Kosmetyki ziołowe', description: 'Skincare lines using Carpathian herbs, birch sap, and rose water from Bulgarian rose valleys.', image_url: 'https://images.unsplash.com/photo-1556228578-0d85b1a4d571?auto=format&fit=crop&q=80&w=800', price: 'zł65', heat_score: 66, heat_status: 'new', tags: ['botanicals', 'herbs', 'rose water', 'birch sap', 'natural'] },
  ],
  north_europe: [
    { category_id: 'cat-products', name: 'Hygge & Slow Living', name_local: 'Hygge', description: 'The Danish art of cozy contentment—candles, knit blankets, warm drinks, and mindful moments at home.', image_url: 'https://images.unsplash.com/photo-1513694203232-719a280e022f?auto=format&fit=crop&q=80&w=800', price: 'kr 299', heat_score: 82, heat_status: 'steady', tags: ['hygge', 'slow living', 'cozy', 'candles', 'mindful'] },
    { category_id: 'cat-fashion', name: 'Nordic Outdoor Gear', name_local: 'Friluftsklær', description: 'Premium Scandinavian outdoor brands combining functionality with minimalist design for all-weather exploration.', image_url: 'https://images.unsplash.com/photo-1551698618-1dfe5d97d256?auto=format&fit=crop&q=80&w=800', price: 'kr 1,899', heat_score: 79, heat_status: 'steady', tags: ['outdoor', 'Nordic', 'hiking', 'Fjällräven', 'functional'] },
    { category_id: 'cat-products', name: 'Scandinavian Design Objects', name_local: 'Skandinavisk design', description: 'Clean-line furniture, ceramic tableware, and glass art from Nordic design houses embracing form and function.', image_url: 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?auto=format&fit=crop&q=80&w=800', price: 'kr 1,200', heat_score: 77, heat_status: 'steady', tags: ['Scandinavian design', 'minimalism', 'ceramics', 'furniture', 'Nordic'] },
    { category_id: 'cat-food', name: 'New Nordic Cuisine & Ferments', name_local: 'Ny nordisk mat', description: 'Noma-inspired fermented foods, foraged ingredients, and preserved fish traditions meeting modern gastronomy.', image_url: 'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?auto=format&fit=crop&q=80&w=800', price: 'kr 350', heat_score: 73, heat_status: 'rising', tags: ['New Nordic', 'fermentation', 'foraging', 'Noma', 'gastronomy'] },
    { category_id: 'cat-products', name: 'Digital-First Society', name_local: 'Digitalt samhälle', description: 'E-government, digital banking, and cashless payments at near-total adoption in Scandinavian daily life.', image_url: 'https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?auto=format&fit=crop&q=80&w=800', price: 'kr 0', heat_score: 85, heat_status: 'steady', tags: ['digital', 'cashless', 'e-government', 'fintech', 'Nordic'] },
  ],
  south_europe: [
    { category_id: 'cat-food', name: 'Premium Olive Oil Culture', name_local: 'Olio d\'oliva', description: 'Single-estate extra virgin olive oils with terroir tastings, sommelier pairings, and health-driven demand surge.', image_url: 'https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?auto=format&fit=crop&q=80&w=800', price: '€24', heat_score: 80, heat_status: 'steady', tags: ['olive oil', 'EVOO', 'Mediterranean', 'tasting', 'health'] },
    { category_id: 'cat-fashion', name: 'Italian Leather Goods', name_local: 'Pelletteria italiana', description: 'Handcrafted Florentine leather bags, shoes, and accessories blending centuries-old craftsmanship with modern design.', image_url: 'https://images.unsplash.com/photo-1548036328-c9fa89d128fa?auto=format&fit=crop&q=80&w=800', price: '€280', heat_score: 82, heat_status: 'steady', tags: ['Italian leather', 'Florence', 'handcraft', 'luxury', 'accessories'] },
    { category_id: 'cat-food', name: 'Third-Wave Espresso Culture', name_local: 'Cultura del caffè', description: 'Specialty espresso bars with single-origin beans and precision brewing techniques beyond traditional Italian cafes.', image_url: 'https://images.unsplash.com/photo-1461023058943-07fcbe16d735?auto=format&fit=crop&q=80&w=800', price: '€4.50', heat_score: 76, heat_status: 'rising', tags: ['espresso', 'specialty coffee', 'single origin', 'barista', 'Italian'] },
    { category_id: 'cat-products', name: 'Artisan Ceramics & Pottery', name_local: 'Cerámica artesanal', description: 'Hand-painted majolica, terracotta tableware, and artisan pottery from Mediterranean workshops gaining global demand.', image_url: 'https://images.unsplash.com/photo-1565193566173-7a0ee3dbe261?auto=format&fit=crop&q=80&w=800', price: '€35', heat_score: 71, heat_status: 'new', tags: ['ceramics', 'pottery', 'majolica', 'handpainted', 'Mediterranean'] },
    { category_id: 'cat-products', name: 'Mediterranean Beauty Rituals', name_local: 'Bellezza mediterranea', description: 'Skincare lines using Mediterranean ingredients—olive leaf, citrus, sea salt, and volcanic clay.', image_url: 'https://images.unsplash.com/photo-1556228578-0d85b1a4d571?auto=format&fit=crop&q=80&w=800', price: '€42', heat_score: 69, heat_status: 'rising', tags: ['Mediterranean', 'olive', 'sea salt', 'volcanic clay', 'natural'] },
  ],
  north_america: [
    { category_id: 'cat-food', name: 'Plant-Based Everything', name_local: 'Plant-Based Food', description: 'Beyond burgers to plant-based seafood, dairy, and even steak—the protein revolution continues.', image_url: 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?auto=format&fit=crop&q=80&w=800', price: '$12', heat_score: 82, heat_status: 'steady', tags: ['plant-based', 'vegan', 'Beyond Meat', 'protein', 'sustainable'] },
    { category_id: 'cat-fashion', name: 'Athleisure Everywhere', name_local: 'Athleisure', description: 'Lululemon, Alo Yoga, and athletic-inspired everyday wear blurring the line between gym and street.', image_url: 'https://images.unsplash.com/photo-1506629082955-511b1aa562c8?auto=format&fit=crop&q=80&w=800', price: '$98', heat_score: 84, heat_status: 'steady', tags: ['athleisure', 'Lululemon', 'Alo Yoga', 'activewear', 'comfort'] },
    { category_id: 'cat-products', name: 'AI-Powered Smart Home', name_local: 'Smart Home AI', description: 'Matter-compatible devices, AI assistants, and home automation ecosystems creating truly intelligent homes.', image_url: 'https://images.unsplash.com/photo-1558002038-1055907df827?auto=format&fit=crop&q=80&w=800', price: '$249', heat_score: 86, heat_status: 'rising', tags: ['smart home', 'AI', 'Matter', 'automation', 'voice assistant'] },
    { category_id: 'cat-food', name: 'Craft Beer & Seltzer', name_local: 'Craft Beer', description: 'Independent breweries, hazy IPAs, and hard seltzer continuing to disrupt the beverage landscape.', image_url: 'https://images.unsplash.com/photo-1535958636474-b021ee887b13?auto=format&fit=crop&q=80&w=800', price: '$8', heat_score: 73, heat_status: 'steady', tags: ['craft beer', 'IPA', 'seltzer', 'brewery', 'independent'] },
    { category_id: 'cat-products', name: 'Wellness & Self-Care Tech', name_local: 'Wellness Tech', description: 'Oura rings, Whoop bands, and wellness apps driving the quantified self-care movement.', image_url: 'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?auto=format&fit=crop&q=80&w=800', price: '$299', heat_score: 80, heat_status: 'rising', tags: ['wellness', 'Oura', 'Whoop', 'self-care', 'wearable'] },
  ],
  latin_america: [
    { category_id: 'cat-food', name: 'Ceviche & Pisco Culture', name_local: 'Ceviche y Pisco', description: 'Peruvian ceviche and Chilean-Peruvian pisco sour culture spreading across the Americas as the new foodie obsession.', image_url: 'https://images.unsplash.com/photo-1535399831218-d5bd36d1a6b3?auto=format&fit=crop&q=80&w=800', price: 'R$45', heat_score: 81, heat_status: 'rising', tags: ['ceviche', 'pisco', 'Peruvian', 'seafood', 'gastronomy'] },
    { category_id: 'cat-fashion', name: 'Colorful Textile Artisanship', name_local: 'Textiles artesanales', description: 'Hand-woven Andean textiles, Guatemalan huipil patterns, and Mexican rebozos entering global fashion.', image_url: 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&q=80&w=800', price: 'R$180', heat_score: 75, heat_status: 'steady', tags: ['textiles', 'handwoven', 'Andean', 'huipil', 'artisan'] },
    { category_id: 'cat-food', name: 'Yerba Mate Modern Culture', name_local: 'Yerba Mate', description: 'Traditional yerba mate reimagined in energy drinks, ready-to-drink cans, and wellness-branded products.', image_url: 'https://images.unsplash.com/photo-1564890369478-c89ca6d9cde9?auto=format&fit=crop&q=80&w=800', price: 'R$32', heat_score: 73, heat_status: 'steady', tags: ['yerba mate', 'energy', 'RTD', 'traditional', 'wellness'] },
    { category_id: 'cat-products', name: 'Handcraft Jewelry & Gems', name_local: 'Joyería artesanal', description: 'Colombian emeralds, Brazilian tourmaline, and artisan silver jewelry with indigenous design motifs.', image_url: 'https://images.unsplash.com/photo-1515562141589-67f0d706de39?auto=format&fit=crop&q=80&w=800', price: 'R$250', heat_score: 70, heat_status: 'new', tags: ['jewelry', 'emerald', 'artisan', 'silver', 'gemstones'] },
    { category_id: 'cat-products', name: 'Amazonian Beauty Ingredients', name_local: 'Beleza Amazônica', description: 'Açaí, buriti oil, cupuaçu butter, and Brazilian biodiversity-based beauty products gaining global cult status.', image_url: 'https://images.unsplash.com/photo-1608571423902-eed4a5ad8108?auto=format&fit=crop&q=80&w=800', price: 'R$89', heat_score: 78, heat_status: 'rising', tags: ['Amazonian', 'açaí', 'buriti', 'cupuaçu', 'biodiversity'] },
  ],
  west_africa: [
    { category_id: 'cat-fashion', name: 'Ankara & Kente Fashion', name_local: 'Ankara Fashion', description: 'Bold Ankara prints and Kente cloth reimagined by Nigerian and Ghanaian designers for the global stage.', image_url: 'https://images.unsplash.com/photo-1590330297626-d7aff25a0431?auto=format&fit=crop&q=80&w=800', price: '₦15,000', heat_score: 84, heat_status: 'rising', tags: ['Ankara', 'Kente', 'African fashion', 'wax print', 'designer'] },
    { category_id: 'cat-food', name: 'Jollof Rice Culture', name_local: 'Jollof Rice', description: 'The beloved West African dish sparking friendly rivalry between Nigerian and Ghanaian versions, going global.', image_url: 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&q=80&w=800', price: '₦3,500', heat_score: 79, heat_status: 'steady', tags: ['jollof', 'rice', 'Nigerian', 'Ghanaian', 'West African'] },
    { category_id: 'cat-products', name: 'Shea Butter & Black Soap', name_local: 'Shea Butter', description: 'Unrefined shea butter and African black soap becoming staple ingredients in global natural beauty routines.', image_url: 'https://images.unsplash.com/photo-1607006344380-b6775a0824a7?auto=format&fit=crop&q=80&w=800', price: '₦5,000', heat_score: 77, heat_status: 'steady', tags: ['shea butter', 'black soap', 'natural', 'skincare', 'West Africa'] },
    { category_id: 'cat-brands', name: 'Afrobeats & Amapiano Wave', name_local: 'Afrobeats', description: 'Burna Boy, Wizkid, and the Amapiano genre from South Africa dominating global music charts and playlists.', image_url: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?auto=format&fit=crop&q=80&w=800', price: '₦1,500', heat_score: 90, heat_status: 'rising', tags: ['Afrobeats', 'Amapiano', 'Burna Boy', 'Wizkid', 'music'] },
    { category_id: 'cat-products', name: 'Fintech & Mobile Money', name_local: 'Mobile Money', description: 'Nigerian and Ghanaian fintech startups like Flutterwave and Paystack revolutionizing payments across Africa.', image_url: 'https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?auto=format&fit=crop&q=80&w=800', price: '₦0', heat_score: 82, heat_status: 'rising', tags: ['fintech', 'mobile money', 'Flutterwave', 'Paystack', 'digital'] },
  ],
  east_africa: [
    { category_id: 'cat-food', name: 'Ethiopian Coffee Ceremony', name_local: 'ቡና', description: 'Specialty Ethiopian single-origin coffee and the traditional buna ceremony gaining global coffeehouse recognition.', image_url: 'https://images.unsplash.com/photo-1461023058943-07fcbe16d735?auto=format&fit=crop&q=80&w=800', price: 'KSh 450', heat_score: 83, heat_status: 'rising', tags: ['Ethiopian coffee', 'buna', 'ceremony', 'single origin', 'specialty'] },
    { category_id: 'cat-products', name: 'Maasai-Inspired Jewelry', name_local: 'Maasai Jewelry', description: 'Beaded Maasai jewelry and accessories made with traditional techniques, supporting local artisan communities.', image_url: 'https://images.unsplash.com/photo-1515562141589-67f0d706de39?auto=format&fit=crop&q=80&w=800', price: 'KSh 2,500', heat_score: 74, heat_status: 'steady', tags: ['Maasai', 'beaded', 'jewelry', 'artisan', 'handmade'] },
    { category_id: 'cat-fashion', name: 'Safari & Earth-Tone Fashion', name_local: 'Safari Fashion', description: 'Earth-toned utility wear and safari-inspired fashion blending adventure aesthetics with sustainable fabrics.', image_url: 'https://images.unsplash.com/photo-1469334031218-e382a71b716b?auto=format&fit=crop&q=80&w=800', price: 'KSh 3,800', heat_score: 70, heat_status: 'steady', tags: ['safari', 'earth tone', 'utility', 'sustainable', 'outdoor'] },
    { category_id: 'cat-products', name: 'Silicon Savannah Tech Hubs', name_local: 'Tech Hubs', description: 'Nairobi and Kigali emerging as Africa\'s Silicon Savannah with M-Pesa, iHub, and venture-backed startups.', image_url: 'https://images.unsplash.com/photo-1519389950473-47ba0277781c?auto=format&fit=crop&q=80&w=800', price: 'KSh 0', heat_score: 78, heat_status: 'rising', tags: ['Silicon Savannah', 'M-Pesa', 'startup', 'Nairobi', 'tech'] },
    { category_id: 'cat-food', name: 'Chai Spice & Kenyan Tea', name_local: 'Chai ya Kenya', description: 'Premium Kenyan purple tea and traditional spiced chai blends gaining recognition in the global specialty tea market.', image_url: 'https://images.unsplash.com/photo-1564890369478-c89ca6d9cde9?auto=format&fit=crop&q=80&w=800', price: 'KSh 350', heat_score: 68, heat_status: 'new', tags: ['Kenyan tea', 'purple tea', 'chai', 'spiced', 'specialty'] },
  ],
  north_africa: [
    { category_id: 'cat-products', name: 'Argan Oil Beauty', name_local: 'زيت الأركان', description: 'Moroccan argan oil hair and skin treatments from cooperative-produced cold-pressed oils gaining luxury status.', image_url: 'https://images.unsplash.com/photo-1608571423902-eed4a5ad8108?auto=format&fit=crop&q=80&w=800', price: 'MAD 180', heat_score: 85, heat_status: 'steady', tags: ['argan oil', 'Moroccan', 'hair care', 'luxury', 'cold-pressed'] },
    { category_id: 'cat-food', name: 'Tagine & Couscous Gourmet', name_local: 'طاجين', description: 'Traditional Moroccan tagine and fluffy couscous elevated with premium spices and presentation for global markets.', image_url: 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&q=80&w=800', price: 'MAD 95', heat_score: 78, heat_status: 'steady', tags: ['tagine', 'couscous', 'Moroccan', 'spices', 'gourmet'] },
    { category_id: 'cat-products', name: 'Berber Carpet & Textiles', name_local: 'سجاد أمازيغي', description: 'Hand-knotted Berber rugs from the Atlas Mountains becoming coveted interior design pieces worldwide.', image_url: 'https://images.unsplash.com/photo-1600166898405-da9535204843?auto=format&fit=crop&q=80&w=800', price: 'MAD 3,500', heat_score: 72, heat_status: 'steady', tags: ['Berber', 'carpet', 'Atlas', 'handmade', 'interior design'] },
    { category_id: 'cat-food', name: 'Mint Tea Ceremony', name_local: 'أتاي', description: 'The art of Moroccan mint tea service—gunpowder green tea with fresh mint and sugar, poured from height.', image_url: 'https://images.unsplash.com/photo-1564890369478-c89ca6d9cde9?auto=format&fit=crop&q=80&w=800', price: 'MAD 25', heat_score: 70, heat_status: 'steady', tags: ['mint tea', 'Moroccan', 'ceremony', 'green tea', 'hospitality'] },
    { category_id: 'cat-fashion', name: 'Caftan & Djellaba Modernization', name_local: 'قفطان', description: 'Traditional Moroccan caftans and djellabas reinterpreted by contemporary designers for international fashion.', image_url: 'https://images.unsplash.com/photo-1590330297626-d7aff25a0431?auto=format&fit=crop&q=80&w=800', price: 'MAD 1,200', heat_score: 69, heat_status: 'new', tags: ['caftan', 'djellaba', 'Moroccan fashion', 'traditional', 'modern'] },
  ],
  south_africa_region: [
    { category_id: 'cat-food', name: 'Biltong & Droëwors Culture', name_local: 'Biltong', description: 'South African dried meat snacks biltong and droëwors going global as premium high-protein alternatives to jerky.', image_url: 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&q=80&w=800', price: 'R 89', heat_score: 78, heat_status: 'steady', tags: ['biltong', 'droëwors', 'protein', 'snack', 'South African'] },
    { category_id: 'cat-products', name: 'Rooibos & Marula Beauty', name_local: 'Rooibos Beauty', description: 'Skincare infused with antioxidant-rich rooibos tea and marula oil from Southern African botanicals.', image_url: 'https://images.unsplash.com/photo-1556228578-0d85b1a4d571?auto=format&fit=crop&q=80&w=800', price: 'R 199', heat_score: 75, heat_status: 'rising', tags: ['rooibos', 'marula', 'botanicals', 'antioxidant', 'African beauty'] },
    { category_id: 'cat-fashion', name: 'Township Streetwear', name_local: 'Township Fashion', description: 'Bold, colorful streetwear brands emerging from South African townships, blending Zulu heritage with urban style.', image_url: 'https://images.unsplash.com/photo-1441984904996-e0b6ba687e04?auto=format&fit=crop&q=80&w=800', price: 'R 450', heat_score: 72, heat_status: 'new', tags: ['township', 'streetwear', 'South African', 'Zulu', 'urban'] },
    { category_id: 'cat-food', name: 'Cape Winelands Culture', name_local: 'Cape Wine', description: 'Stellenbosch and Franschhoek wines—Pinotage, Chenin Blanc—alongside food-and-wine pairing tourism boom.', image_url: 'https://images.unsplash.com/photo-1510812431401-41d2bd2722f3?auto=format&fit=crop&q=80&w=800', price: 'R 180', heat_score: 74, heat_status: 'steady', tags: ['wine', 'Pinotage', 'Stellenbosch', 'Cape Town', 'tasting'] },
    { category_id: 'cat-brands', name: 'Amapiano Dance Movement', name_local: 'Amapiano', description: 'The South African-born Amapiano genre and its signature dance moves becoming a global cultural phenomenon.', image_url: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?auto=format&fit=crop&q=80&w=800', price: 'R 0', heat_score: 88, heat_status: 'rising', tags: ['Amapiano', 'dance', 'South African', 'music', 'viral'] },
  ],
  oceania: [
    { category_id: 'cat-products', name: 'Polynesian Art & Tapa Cloth', name_local: 'Polynesian Art', description: 'Traditional tapa bark cloth, Maori ta moko-inspired designs, and Pacific Island art entering the contemporary scene.', image_url: 'https://images.unsplash.com/photo-1544967082-d9d25d867d66?auto=format&fit=crop&q=80&w=800', price: 'A$120', heat_score: 72, heat_status: 'new', tags: ['Polynesian', 'tapa', 'Maori', 'Pacific art', 'indigenous'] },
    { category_id: 'cat-food', name: 'Manuka Honey Premium', name_local: 'Manuka Honey', description: 'UMF-rated Manuka honey from New Zealand commanding premium prices for its unique medicinal properties.', image_url: 'https://images.unsplash.com/photo-1587049352846-4a222e784d38?auto=format&fit=crop&q=80&w=800', price: 'A$65', heat_score: 80, heat_status: 'steady', tags: ['Manuka', 'honey', 'UMF', 'medicinal', 'New Zealand'] },
    { category_id: 'cat-fashion', name: 'Surf & Beach Culture Wear', name_local: 'Surf Fashion', description: 'Australian surf brands like Rip Curl and Billabong alongside sustainable swimwear labels riding the wave.', image_url: 'https://images.unsplash.com/photo-1506629082955-511b1aa562c8?auto=format&fit=crop&q=80&w=800', price: 'A$89', heat_score: 76, heat_status: 'steady', tags: ['surf', 'beach', 'swimwear', 'Rip Curl', 'sustainable'] },
    { category_id: 'cat-products', name: 'Indigenous Art & Design', name_local: 'Aboriginal Art', description: 'Aboriginal dot painting and Maori carving traditions inspiring contemporary Australian and NZ fashion and interiors.', image_url: 'https://images.unsplash.com/photo-1544967082-d9d25d867d66?auto=format&fit=crop&q=80&w=800', price: 'A$250', heat_score: 74, heat_status: 'rising', tags: ['Aboriginal', 'dot painting', 'Maori', 'indigenous', 'art'] },
    { category_id: 'cat-food', name: 'Flat White & Coffee Culture', name_local: 'Flat White', description: 'Australia and New Zealand\'s specialty coffee scene—flat whites, single-origin pour-overs, and third-wave roasters.', image_url: 'https://images.unsplash.com/photo-1461023058943-07fcbe16d735?auto=format&fit=crop&q=80&w=800', price: 'A$5.50', heat_score: 78, heat_status: 'steady', tags: ['flat white', 'specialty coffee', 'third wave', 'barista', 'roaster'] },
  ],
};

// ============================================================
// 5. 카테고리 맵 (ID → Category 객체)
// ============================================================

const categoryMap = new Map(MOCK_CATEGORIES.map((c) => [c.id, c]));

// ============================================================
// 6. 유틸리티: 국가코드 → 지역 매핑
// ============================================================

function getRegionForCode(code: string): TemplateRegion | null {
  const country = TEMPLATE_COUNTRIES[code.toLowerCase()];
  if (!country) return null;
  return country.sub_region as TemplateRegion;
}

// ============================================================
// 7. Export 함수들
// ============================================================

/**
 * 국가 코드(소문자)로 템플릿 국가 메타데이터 조회
 */
export function getTemplateCountry(code: string): TemplateCountry | null {
  return TEMPLATE_COUNTRIES[code.toLowerCase()] ?? null;
}

/**
 * 국가 코드로 해당 지역의 템플릿 트렌드를 TrendWithDetails[] 호환 형태로 반환
 */
export function getTemplateTrends(code: string): TrendWithDetails[] {
  const lowerCode = code.toLowerCase();
  const region = getRegionForCode(lowerCode);
  if (!region) return [];

  const templates = REGION_TRENDS[region];
  if (!templates) return [];

  const country = TEMPLATE_COUNTRIES[lowerCode];
  if (!country) return [];

  const now = new Date().toISOString();
  const flagEmoji = codeToFlagEmoji(lowerCode);

  return templates.map((t, i) => {
    const cat = categoryMap.get(t.category_id);
    const trendId = `trend-${lowerCode}-tmpl-${String(i + 1).padStart(3, '0')}`;

    return {
      id: trendId,
      country_id: `country-${lowerCode}`,
      category_id: t.category_id,
      name: t.name,
      name_local: t.name_local,
      description: t.description,
      image_url: t.image_url,
      price: t.price,
      heat_score: t.heat_score,
      heat_status: t.heat_status,
      search_score: Math.max(40, t.heat_score - Math.floor(Math.random() * 10)),
      social_score: Math.max(40, t.heat_score + Math.floor(Math.random() * 8) - 4),
      ecommerce_score: Math.max(40, t.heat_score - Math.floor(Math.random() * 12)),
      news_score: Math.max(35, t.heat_score - Math.floor(Math.random() * 15)),
      tags: t.tags,
      source_urls: [],
      first_detected_at: '2026-01-01T00:00:00Z',
      last_updated_at: now,
      created_at: '2026-01-01T00:00:00Z',
      country: {
        code: country.code.toUpperCase(),
        name_ko: country.name_ko,
        name_en: country.name_en,
        flag_emoji: flagEmoji,
      },
      category: cat
        ? { slug: cat.slug, name_ko: cat.name_ko, name_en: cat.name_en, emoji: cat.emoji }
        : { slug: 'products' as const, name_ko: '상품', name_en: 'Products', emoji: '📦' },
    };
  });
}

/**
 * 통합 함수: 기존 mock 6개국 우선 → 없으면 템플릿 반환
 */
export function getCountryData(code: string): {
  country: {
    code: string;
    name_en: string;
    name_ko: string;
    name_local: string;
    description: string;
    flag_emoji: string;
    region: string;
  };
  trends: TrendWithDetails[];
} | null {
  const upperCode = code.toUpperCase();
  const lowerCode = code.toLowerCase();

  // 0) 실제 수집 데이터 (최우선)
  const realData = loadRealData();
  if (realData) {
    const countryData = realData.countries[upperCode];
    if (countryData && countryData.trends.length > 0) {
      const templateCountry = getTemplateCountry(code);
      const mockCountry = MOCK_COUNTRIES.find(c => c.code === upperCode);
      return {
        country: {
          code: upperCode,
          name_en: countryData.name || templateCountry?.name_en || upperCode,
          name_ko: mockCountry?.name_ko || templateCountry?.name_ko || countryData.name,
          name_local: mockCountry?.name_local || templateCountry?.name_local || countryData.name,
          description: mockCountry?.description || templateCountry?.description || 'Discover trending products and cultural movements.',
          flag_emoji: mockCountry?.flag_emoji || codeToFlagEmoji(lowerCode),
          region: templateCountry?.region || 'global',
        },
        trends: realDataToTrends(upperCode, countryData.name, countryData.trends),
      };
    }
  }

  // 1) 기존 mock 6개국 확인
  const mockCountry = MOCK_COUNTRIES.find((c) => c.code === upperCode);
  if (mockCountry) {
    // mock 트렌드 필터링 + TrendWithDetails 변환
    const mockTrends = MOCK_TRENDS.filter((t) => t.country_id === mockCountry.id);
    const catMap = new Map(MOCK_CATEGORIES.map((c) => [c.id, c]));

    const trends: TrendWithDetails[] = mockTrends.map((trend) => {
      const cat = catMap.get(trend.category_id)!;
      return {
        ...trend,
        country: {
          code: mockCountry.code,
          name_ko: mockCountry.name_ko,
          name_en: mockCountry.name_en,
          flag_emoji: mockCountry.flag_emoji,
        },
        category: {
          slug: cat.slug,
          name_ko: cat.name_ko,
          name_en: cat.name_en,
          emoji: cat.emoji,
        },
      };
    });

    return {
      country: {
        code: mockCountry.code,
        name_en: mockCountry.name_en,
        name_ko: mockCountry.name_ko,
        name_local: mockCountry.name_local ?? mockCountry.name_en,
        description: mockCountry.description ?? '',
        flag_emoji: mockCountry.flag_emoji,
        region: mockCountry.sub_region ?? mockCountry.region,
      },
      trends,
    };
  }

  // 2) 템플릿 국가 확인
  const templateCountry = TEMPLATE_COUNTRIES[lowerCode];
  if (templateCountry) {
    const trends = getTemplateTrends(lowerCode);
    return {
      country: {
        code: templateCountry.code.toUpperCase(),
        name_en: templateCountry.name_en,
        name_ko: templateCountry.name_ko,
        name_local: templateCountry.name_local,
        description: templateCountry.description,
        flag_emoji: codeToFlagEmoji(lowerCode),
        region: templateCountry.sub_region,
      },
      trends,
    };
  }

  // 3) 둘 다 없으면 null
  return null;
}

/**
 * 모든 지원 국가 코드 반환 (mock + 템플릿)
 */
export function getAllSupportedCodes(): string[] {
  const mockCodes = MOCK_COUNTRIES.map((c) => c.code.toLowerCase());
  const templateCodes = Object.keys(TEMPLATE_COUNTRIES);
  const allCodes = new Set([...mockCodes, ...templateCodes]);
  return Array.from(allCodes).sort();
}
