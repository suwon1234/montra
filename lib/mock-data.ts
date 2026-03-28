import type {
  Country,
  Category,
  Trend,
  TrendHistory,
  TrendWithDetails,
  CountryWithStats,
  CategorySlug,
} from './types';

// ============================================================
// 카테고리 시드 데이터
// ============================================================
export const MOCK_CATEGORIES: Category[] = [
  { id: 'cat-fashion', slug: 'fashion', name_ko: '옷', name_en: 'Fashion', emoji: '👗', sort_order: 1 },
  { id: 'cat-products', slug: 'products', name_ko: '상품', name_en: 'Products', emoji: '🛍️', sort_order: 2 },
  { id: 'cat-food', slug: 'food', name_ko: '음식', name_en: 'Food', emoji: '🍽️', sort_order: 3 },
  { id: 'cat-brands', slug: 'brands', name_ko: '브랜드', name_en: 'Brands', emoji: '🏷️', sort_order: 4 },
  { id: 'cat-challenges', slug: 'challenges', name_ko: '챌린지', name_en: 'Challenges', emoji: '🔥', sort_order: 5 },
];

// ============================================================
// 국가 시드 데이터
// ============================================================
export const MOCK_COUNTRIES: Country[] = [
  {
    id: 'country-kr',
    code: 'KR',
    name_ko: '한국',
    name_en: 'South Korea',
    name_local: '대한민국',
    description: 'The epicenter of global pop culture, where traditional heritage meets futuristic innovation.',
    flag_emoji: '\uD83C\uDDF0\uD83C\uDDF7',
    region: 'asia',
    sub_region: 'east_asia',
    timezone: 'Asia/Seoul',
    primary_language: '한국어',
    primary_ecommerce_platform: '쿠팡',
    primary_social_platform: 'Instagram/TikTok',
    population: 51_740_000,
    internet_penetration: 97.6,
    is_active: true,
    created_at: '2026-03-01T00:00:00Z',
  },
  {
    id: 'country-us',
    code: 'US',
    name_ko: '미국',
    name_en: 'United States',
    name_local: 'United States of America',
    description: 'A melting pot of innovation, from Silicon Valley tech to the creative energy of New York.',
    flag_emoji: '\uD83C\uDDFA\uD83C\uDDF8',
    region: 'americas',
    sub_region: 'north_america',
    timezone: 'America/New_York',
    primary_language: 'English',
    primary_ecommerce_platform: 'Amazon',
    primary_social_platform: 'TikTok/Instagram',
    population: 331_900_000,
    internet_penetration: 92.0,
    is_active: true,
    created_at: '2026-03-01T00:00:00Z',
  },
  {
    id: 'country-jp',
    code: 'JP',
    name_ko: '일본',
    name_en: 'Japan',
    name_local: '日本',
    description: 'A harmonious blend of ancient traditions and cutting-edge technology, focused on precision and beauty.',
    flag_emoji: '\uD83C\uDDEF\uD83C\uDDF5',
    region: 'asia',
    sub_region: 'east_asia',
    timezone: 'Asia/Tokyo',
    primary_language: '日本語',
    primary_ecommerce_platform: 'Amazon.co.jp/楽天',
    primary_social_platform: 'TikTok/Instagram',
    population: 125_800_000,
    internet_penetration: 93.0,
    is_active: true,
    created_at: '2026-03-01T00:00:00Z',
  },
  {
    id: 'country-cn',
    code: 'CN',
    name_ko: '중국',
    name_en: 'China',
    name_local: '中国',
    description: "The world's largest market where ancient civilization meets rapid modernization.",
    flag_emoji: '\uD83C\uDDE8\uD83C\uDDF3',
    region: 'asia',
    sub_region: 'east_asia',
    timezone: 'Asia/Shanghai',
    primary_language: '中文',
    primary_ecommerce_platform: '淘宝/JD.com',
    primary_social_platform: 'Douyin/RED',
    population: 1_412_000_000,
    internet_penetration: 73.0,
    is_active: true,
    created_at: '2026-03-01T00:00:00Z',
  },
  {
    id: 'country-gb',
    code: 'GB',
    name_ko: '영국',
    name_en: 'United Kingdom',
    name_local: 'United Kingdom',
    description: 'A cultural powerhouse blending centuries of tradition with contemporary creativity.',
    flag_emoji: '\uD83C\uDDEC\uD83C\uDDE7',
    region: 'europe',
    sub_region: 'west_europe',
    timezone: 'Europe/London',
    primary_language: 'English',
    primary_ecommerce_platform: 'Amazon.co.uk',
    primary_social_platform: 'TikTok/Instagram',
    population: 67_330_000,
    internet_penetration: 95.0,
    is_active: true,
    created_at: '2026-03-01T00:00:00Z',
  },
  {
    id: 'country-fr',
    code: 'FR',
    name_ko: '프랑스',
    name_en: 'France',
    name_local: 'France',
    description: 'The global capital of luxury, gastronomy, and the art of living well.',
    flag_emoji: '\uD83C\uDDEB\uD83C\uDDF7',
    region: 'europe',
    sub_region: 'west_europe',
    timezone: 'Europe/Paris',
    primary_language: 'Fran\u00e7ais',
    primary_ecommerce_platform: 'Amazon.fr',
    primary_social_platform: 'TikTok/Instagram',
    population: 67_750_000,
    internet_penetration: 93.0,
    is_active: true,
    created_at: '2026-03-01T00:00:00Z',
  },
];

// ============================================================
// 트렌드 시드 데이터
// ============================================================
export const MOCK_TRENDS: Trend[] = [
  // --- 한국 (4개) ---
  {
    id: 'trend-kr-001',
    country_id: 'country-kr',
    category_id: 'cat-food',
    name: '두쫀쿠',
    name_local: '두쫀쿠',
    description: '카다이프 반죽에 피스타치오 크림을 채운 쿠키. 터키 디저트에서 영감받아 SNS에서 폭발적 인기를 얻으며 전국 베이커리로 확산.',
    image_url: 'https://images.unsplash.com/photo-1558961363-fa8fdf82db35?auto=format&fit=crop&q=80&w=800',
    price: '\u20A98,500',
    heat_score: 97,
    heat_status: 'cooling',
    search_score: 95,
    social_score: 99,
    ecommerce_score: 88,
    news_score: 82,
    tags: ['디저트', 'SNS바이럴', '카다이프', '피스타치오', '베이커리'],
    source_urls: [],
    first_detected_at: '2025-11-15T00:00:00Z',
    last_updated_at: '2026-03-15T12:00:00Z',
    peak_date: '2026-01-20T00:00:00Z',
    created_at: '2025-11-15T00:00:00Z',
  },
  {
    id: 'trend-kr-002',
    country_id: 'country-kr',
    category_id: 'cat-fashion',
    name: '러닝화 커스텀',
    name_local: '러닝화 커스텀',
    description: '나만의 러닝화를 직접 디자인하는 트렌드. 나이키 바이유, 뉴발란스 커스텀 서비스 수요 급증.',
    image_url: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&q=80&w=800',
    price: '\u20A9189,000',
    heat_score: 82,
    heat_status: 'rising',
    search_score: 78,
    social_score: 85,
    ecommerce_score: 80,
    news_score: 65,
    tags: ['러닝', '커스텀', '스니커즈', '개인화', 'MTO'],
    source_urls: [],
    first_detected_at: '2026-01-10T00:00:00Z',
    last_updated_at: '2026-03-14T18:00:00Z',
    created_at: '2026-01-10T00:00:00Z',
  },
  {
    id: 'trend-kr-003',
    country_id: 'country-kr',
    category_id: 'cat-products',
    name: '글루타치온 토너',
    name_local: '글루타치온 토너',
    description: '글루타치온 성분을 활용한 미백 토너. 올리브영 베스트셀러 진입하며 꾸준한 판매량 유지.',
    image_url: 'https://images.unsplash.com/photo-1556228578-0d85b1a4d571?auto=format&fit=crop&q=80&w=800',
    price: '\u20A932,000',
    heat_score: 74,
    heat_status: 'steady',
    search_score: 70,
    social_score: 72,
    ecommerce_score: 82,
    news_score: 55,
    tags: ['스킨케어', '미백', '글루타치온', '올리브영', '토너'],
    source_urls: [],
    first_detected_at: '2025-09-01T00:00:00Z',
    last_updated_at: '2026-03-13T09:00:00Z',
    created_at: '2025-09-01T00:00:00Z',
  },
  {
    id: 'trend-kr-004',
    country_id: 'country-kr',
    category_id: 'cat-brands',
    name: '미니 빔프로젝터',
    name_local: '미니 빔프로젝터',
    description: '손바닥 크기의 휴대용 빔프로젝터. 1인 가구 증가와 캠핑 트렌드에 힘입어 새롭게 부상.',
    image_url: 'https://images.unsplash.com/photo-1478720568477-152d9b164e26?auto=format&fit=crop&q=80&w=800',
    price: '\u20A9249,000',
    heat_score: 68,
    heat_status: 'new',
    search_score: 72,
    social_score: 60,
    ecommerce_score: 75,
    news_score: 50,
    tags: ['프로젝터', '1인가구', '캠핑', '홈시네마', '가성비'],
    source_urls: [],
    first_detected_at: '2026-02-20T00:00:00Z',
    last_updated_at: '2026-03-15T06:00:00Z',
    created_at: '2026-02-20T00:00:00Z',
  },

  // --- 미국 (4개) ---
  {
    id: 'trend-us-001',
    country_id: 'country-us',
    category_id: 'cat-products',
    name: 'Rhode Peptide Lip Boost',
    description: 'Hailey Bieber의 뷰티 브랜드 Rhode에서 출시한 펩타이드 립 부스터. TikTok에서 바이럴되며 출시 즉시 품절.',
    image_url: 'https://images.unsplash.com/photo-1586495777744-4413f21062fa?auto=format&fit=crop&q=80&w=800',
    price: '$29',
    heat_score: 94,
    heat_status: 'rising',
    search_score: 92,
    social_score: 98,
    ecommerce_score: 85,
    news_score: 78,
    tags: ['Rhode', 'Hailey Bieber', 'lip gloss', 'peptide', 'TikTok viral'],
    source_urls: [],
    first_detected_at: '2026-01-05T00:00:00Z',
    last_updated_at: '2026-03-15T10:00:00Z',
    created_at: '2026-01-05T00:00:00Z',
  },
  {
    id: 'trend-us-002',
    country_id: 'country-us',
    category_id: 'cat-products',
    name: 'Stanley Cup Tumbler',
    description: 'Stanley Quencher 텀블러의 한정판 컬러 수집 열풍. 매 시즌 새 컬러 출시마다 오픈런 현상.',
    image_url: 'https://images.unsplash.com/photo-1602143407151-7111542de6e8?auto=format&fit=crop&q=80&w=800',
    price: '$45',
    heat_score: 85,
    heat_status: 'steady',
    search_score: 80,
    social_score: 88,
    ecommerce_score: 90,
    news_score: 70,
    tags: ['Stanley', 'tumbler', 'Quencher', 'limited edition', 'collectible'],
    source_urls: [],
    first_detected_at: '2025-06-01T00:00:00Z',
    last_updated_at: '2026-03-14T14:00:00Z',
    created_at: '2025-06-01T00:00:00Z',
  },
  {
    id: 'trend-us-003',
    country_id: 'country-us',
    category_id: 'cat-food',
    name: 'Crumbl Cookies',
    description: '매주 메뉴가 바뀌는 대형 쿠키 프랜차이즈. 소셜 미디어 리뷰 콘텐츠로 꾸준한 화제.',
    image_url: 'https://images.unsplash.com/photo-1499636136210-6f4ee915583e?auto=format&fit=crop&q=80&w=800',
    price: '$18',
    heat_score: 78,
    heat_status: 'cooling',
    search_score: 75,
    social_score: 82,
    ecommerce_score: 70,
    news_score: 60,
    tags: ['cookies', 'franchise', 'weekly menu', 'dessert', 'viral food'],
    source_urls: [],
    first_detected_at: '2025-03-01T00:00:00Z',
    last_updated_at: '2026-03-12T08:00:00Z',
    peak_date: '2025-10-15T00:00:00Z',
    created_at: '2025-03-01T00:00:00Z',
  },
  {
    id: 'trend-us-004',
    country_id: 'country-us',
    category_id: 'cat-brands',
    name: 'AI Pin',
    description: 'Humane AI Pin 등 웨어러블 AI 디바이스. 스마트폰 대체를 표방하며 새로운 카테고리 개척 중.',
    image_url: 'https://images.unsplash.com/photo-1519389950473-47ba0277781c?auto=format&fit=crop&q=80&w=800',
    price: '$699',
    heat_score: 71,
    heat_status: 'new',
    search_score: 76,
    social_score: 65,
    ecommerce_score: 55,
    news_score: 80,
    tags: ['AI', 'wearable', 'Humane', 'post-smartphone', 'gadget'],
    source_urls: [],
    first_detected_at: '2026-02-01T00:00:00Z',
    last_updated_at: '2026-03-15T11:00:00Z',
    created_at: '2026-02-01T00:00:00Z',
  },

  // --- 일본 (3개) ---
  {
    id: 'trend-jp-001',
    country_id: 'country-jp',
    category_id: 'cat-brands',
    name: 'ちいかわ グッズ',
    name_local: 'ちいかわ グッズ',
    description: '나가노의 인기 캐릭터 치이카와 관련 굿즈가 폭발적 인기. 콜라보 상품 출시마다 즉시 품절.',
    image_url: 'https://images.unsplash.com/photo-1558618666-fcd25c85f82e?auto=format&fit=crop&q=80&w=800',
    price: '\u00A52,480',
    heat_score: 91,
    heat_status: 'rising',
    search_score: 88,
    social_score: 95,
    ecommerce_score: 92,
    news_score: 75,
    tags: ['ちいかわ', 'キャラクター', 'グッズ', 'コラボ', 'ナガノ'],
    source_urls: [],
    first_detected_at: '2025-08-01T00:00:00Z',
    last_updated_at: '2026-03-15T09:00:00Z',
    created_at: '2025-08-01T00:00:00Z',
  },
  {
    id: 'trend-jp-002',
    country_id: 'country-jp',
    category_id: 'cat-food',
    name: 'おにぎりスタンド',
    name_local: 'おにぎりスタンド',
    description: '프리미엄 수제 오니기리 전문점. 편의점 오니기리를 넘어 고급 식재료를 사용한 전문점 급증.',
    image_url: 'https://images.unsplash.com/photo-1567521464027-f127ff144326?auto=format&fit=crop&q=80&w=800',
    price: '\u00A5680',
    heat_score: 76,
    heat_status: 'new',
    search_score: 72,
    social_score: 78,
    ecommerce_score: 60,
    news_score: 68,
    tags: ['おにぎり', 'グルメ', '専門店', 'プレミアム', 'テイクアウト'],
    source_urls: [],
    first_detected_at: '2026-02-10T00:00:00Z',
    last_updated_at: '2026-03-14T15:00:00Z',
    created_at: '2026-02-10T00:00:00Z',
  },
  {
    id: 'trend-jp-003',
    country_id: 'country-jp',
    category_id: 'cat-fashion',
    name: 'SHEIN 日本限定',
    name_local: 'SHEIN 日本限定',
    description: 'SHEIN의 일본 한정 컬렉션. Z세대를 중심으로 초저가 패스트패션 수요 급증.',
    image_url: 'https://images.unsplash.com/photo-1445205170230-053b83016050?auto=format&fit=crop&q=80&w=800',
    price: '\u00A53,990',
    heat_score: 69,
    heat_status: 'rising',
    search_score: 65,
    social_score: 74,
    ecommerce_score: 72,
    news_score: 50,
    tags: ['SHEIN', 'ファッション', 'Z世代', 'プチプラ', '限定'],
    source_urls: [],
    first_detected_at: '2026-01-20T00:00:00Z',
    last_updated_at: '2026-03-13T20:00:00Z',
    created_at: '2026-01-20T00:00:00Z',
  },

  // --- 중국 (3개) ---
  {
    id: 'trend-cn-001',
    country_id: 'country-cn',
    category_id: 'cat-fashion',
    name: '新中式 패션',
    name_local: '新中式',
    description: '전통 중국 의상 요소를 현대 패션에 접목한 신중식 스타일. 한푸에서 영감받은 일상복이 RED에서 대유행.',
    image_url: 'https://images.unsplash.com/photo-1617019114583-affb34d1b3cd?auto=format&fit=crop&q=80&w=800',
    price: '\u00A5399',
    heat_score: 93,
    heat_status: 'rising',
    search_score: 90,
    social_score: 96,
    ecommerce_score: 88,
    news_score: 78,
    tags: ['新中式', '汉服', '国潮', 'RED', '传统文化'],
    source_urls: [],
    first_detected_at: '2025-10-01T00:00:00Z',
    last_updated_at: '2026-03-15T08:00:00Z',
    created_at: '2025-10-01T00:00:00Z',
  },
  {
    id: 'trend-cn-002',
    country_id: 'country-cn',
    category_id: 'cat-food',
    name: '酱香拿铁',
    name_local: '酱香拿铁',
    description: '마오타이주와 라떼를 결합한 콜라보 음료. 루이싱커피와 마오타이의 협업으로 SNS에서 화제.',
    image_url: 'https://images.unsplash.com/photo-1461023058943-07fcbe16d735?auto=format&fit=crop&q=80&w=800',
    price: '\u00A538',
    heat_score: 87,
    heat_status: 'cooling',
    search_score: 82,
    social_score: 90,
    ecommerce_score: 75,
    news_score: 85,
    tags: ['酱香拿铁', '茅台', '瑞幸', '联名', '咖啡'],
    source_urls: [],
    first_detected_at: '2025-09-04T00:00:00Z',
    last_updated_at: '2026-03-12T16:00:00Z',
    peak_date: '2025-10-01T00:00:00Z',
    created_at: '2025-09-04T00:00:00Z',
  },
  {
    id: 'trend-cn-003',
    country_id: 'country-cn',
    category_id: 'cat-brands',
    name: '华为 Mate 70',
    name_local: '华为 Mate 70',
    description: '화웨이 Mate 70 시리즈. 자체 칩셋 기린으로 복귀하며 중국 시장 점유율 확대.',
    image_url: 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?auto=format&fit=crop&q=80&w=800',
    price: '\u00A55,499',
    heat_score: 81,
    heat_status: 'steady',
    search_score: 85,
    social_score: 75,
    ecommerce_score: 88,
    news_score: 80,
    tags: ['华为', 'Mate70', '麒麟', '国产芯片', '旗舰手机'],
    source_urls: [],
    first_detected_at: '2025-11-01T00:00:00Z',
    last_updated_at: '2026-03-14T12:00:00Z',
    created_at: '2025-11-01T00:00:00Z',
  },

  // --- 영국 (3개) ---
  {
    id: 'trend-gb-001',
    country_id: 'country-gb',
    category_id: 'cat-fashion',
    name: 'Greggs \u00d7 Primark Collab',
    description: 'UK 국민 베이커리 Greggs와 Primark의 이색 콜라보. 소시지롤 프린트 의류 등 유머러스한 아이템이 화제.',
    image_url: 'https://images.unsplash.com/photo-1441984904996-e0b6ba687e04?auto=format&fit=crop&q=80&w=800',
    price: '\u00A318',
    heat_score: 79,
    heat_status: 'new',
    search_score: 74,
    social_score: 83,
    ecommerce_score: 70,
    news_score: 72,
    tags: ['Greggs', 'Primark', 'collab', 'high street', 'British'],
    source_urls: [],
    first_detected_at: '2026-02-15T00:00:00Z',
    last_updated_at: '2026-03-15T07:00:00Z',
    created_at: '2026-02-15T00:00:00Z',
  },
  {
    id: 'trend-gb-002',
    country_id: 'country-gb',
    category_id: 'cat-food',
    name: 'Biscoff Everything',
    description: 'Lotus Biscoff 스프레드를 활용한 다양한 디저트와 음료. 카페, 베이커리에서 비스코프 메뉴 대유행.',
    image_url: 'https://images.unsplash.com/photo-1558961363-fa8fdf82db35?auto=format&fit=crop&q=80&w=800',
    price: '\u00A34.50',
    heat_score: 72,
    heat_status: 'steady',
    search_score: 68,
    social_score: 75,
    ecommerce_score: 70,
    news_score: 55,
    tags: ['Biscoff', 'Lotus', 'spread', 'dessert', 'cafe trend'],
    source_urls: [],
    first_detected_at: '2025-07-01T00:00:00Z',
    last_updated_at: '2026-03-13T11:00:00Z',
    created_at: '2025-07-01T00:00:00Z',
  },
  {
    id: 'trend-gb-003',
    country_id: 'country-gb',
    category_id: 'cat-brands',
    name: 'The Bear 시즌3',
    description: 'FX/Hulu 드라마 The Bear 시즌3. 요리 씬과 긴장감 넘치는 연출로 영국에서도 시청률 급상승.',
    image_url: 'https://images.unsplash.com/photo-1585647347483-22b66260dfff?auto=format&fit=crop&q=80&w=800',
    price: '\u00A37.99',
    heat_score: 68,
    heat_status: 'rising',
    search_score: 72,
    social_score: 70,
    ecommerce_score: 45,
    news_score: 75,
    tags: ['The Bear', 'FX', 'drama', 'cooking', 'streaming'],
    source_urls: [],
    first_detected_at: '2026-01-15T00:00:00Z',
    last_updated_at: '2026-03-14T19:00:00Z',
    created_at: '2026-01-15T00:00:00Z',
  },

  // --- 프랑스 (3개) ---
  {
    id: 'trend-fr-001',
    country_id: 'country-fr',
    category_id: 'cat-fashion',
    name: 'Jacquemus Le Bambino',
    description: 'Jacquemus의 시그니처 미니백 Le Bambino. 파리 스트리트 패션의 필수 아이템으로 꾸준한 인기.',
    image_url: 'https://images.unsplash.com/photo-1548036328-c9fa89d128fa?auto=format&fit=crop&q=80&w=800',
    price: '\u20AC590',
    heat_score: 88,
    heat_status: 'steady',
    search_score: 82,
    social_score: 90,
    ecommerce_score: 85,
    news_score: 72,
    tags: ['Jacquemus', 'Le Bambino', 'mini bag', 'Paris fashion', 'luxury'],
    source_urls: [],
    first_detected_at: '2025-04-01T00:00:00Z',
    last_updated_at: '2026-03-15T05:00:00Z',
    created_at: '2025-04-01T00:00:00Z',
  },
  {
    id: 'trend-fr-002',
    country_id: 'country-fr',
    category_id: 'cat-food',
    name: 'Picard Surgel\u00e9s Gourmet',
    description: 'Picard 냉동식품의 고급화 라인. 미슐랭 셰프 콜라보 냉동 요리로 프리미엄 간편식 시장 선도.',
    image_url: 'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?auto=format&fit=crop&q=80&w=800',
    price: '\u20AC12',
    heat_score: 65,
    heat_status: 'rising',
    search_score: 60,
    social_score: 62,
    ecommerce_score: 72,
    news_score: 58,
    tags: ['Picard', 'surgel\u00e9s', 'gourmet', 'frozen food', 'Michelin'],
    source_urls: [],
    first_detected_at: '2026-01-25T00:00:00Z',
    last_updated_at: '2026-03-14T22:00:00Z',
    created_at: '2026-01-25T00:00:00Z',
  },
  {
    id: 'trend-fr-003',
    country_id: 'country-fr',
    category_id: 'cat-fashion',
    name: 'Cama\u00efu Revival',
    description: '2022년 파산한 프랑스 패션 브랜드 Cama\u00efu의 부활. 새 투자자 아래 온라인 우선 전략으로 재런칭.',
    image_url: 'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?auto=format&fit=crop&q=80&w=800',
    price: '\u20AC45',
    heat_score: 60,
    heat_status: 'new',
    search_score: 58,
    social_score: 55,
    ecommerce_score: 65,
    news_score: 62,
    tags: ['Cama\u00efu', 'revival', 'French fashion', 'relaunch', 'online'],
    source_urls: [],
    first_detected_at: '2026-03-01T00:00:00Z',
    last_updated_at: '2026-03-15T03:00:00Z',
    created_at: '2026-03-01T00:00:00Z',
  },
];

// ============================================================
// 헬퍼 함수: 카테고리 ID → 카테고리 객체
// ============================================================
const categoryMap = new Map(MOCK_CATEGORIES.map((c) => [c.id, c]));
const countryMap = new Map(MOCK_COUNTRIES.map((c) => [c.id, c]));

/**
 * Mock 트렌드에 country/category 정보를 조인하여 TrendWithDetails로 변환
 */
export function getMockTrendsWithDetails(): TrendWithDetails[] {
  return MOCK_TRENDS.map((trend) => {
    const country = countryMap.get(trend.country_id)!;
    const category = categoryMap.get(trend.category_id)!;
    return {
      ...trend,
      country: {
        code: country.code,
        name_ko: country.name_ko,
        name_en: country.name_en,
        flag_emoji: country.flag_emoji,
      },
      category: {
        slug: category.slug,
        name_ko: category.name_ko,
        name_en: category.name_en,
        emoji: category.emoji,
      },
    };
  });
}

/**
 * 국가별 통계를 포함한 CountryWithStats 배열 반환
 */
export function getMockCountriesWithStats(): CountryWithStats[] {
  return MOCK_COUNTRIES.map((country) => {
    const countryTrends = MOCK_TRENDS.filter(
      (t) => t.country_id === country.id
    );
    const risingCount = countryTrends.filter(
      (t) => t.heat_status === 'rising'
    ).length;
    const topTrend = countryTrends.sort(
      (a, b) => b.heat_score - a.heat_score
    )[0];
    return {
      ...country,
      rising_count: risingCount,
      total_trends: countryTrends.length,
      top_trend: topTrend?.name,
    };
  });
}

/**
 * 필터 조건에 맞는 트렌드를 반환
 */
export function filterMockTrends(options?: {
  countryCode?: string;
  categorySlug?: CategorySlug;
  heatStatus?: Trend['heat_status'];
  minScore?: number;
  search?: string;
  sortBy?: 'heat_score' | 'first_detected_at' | 'last_updated_at';
  sortOrder?: 'asc' | 'desc';
  limit?: number;
}): TrendWithDetails[] {
  let results = getMockTrendsWithDetails();

  if (options?.countryCode) {
    results = results.filter(
      (t) => t.country.code === options.countryCode!.toUpperCase()
    );
  }
  if (options?.categorySlug) {
    results = results.filter((t) => t.category.slug === options.categorySlug);
  }
  if (options?.heatStatus) {
    results = results.filter((t) => t.heat_status === options.heatStatus);
  }
  if (options?.minScore !== undefined) {
    results = results.filter((t) => t.heat_score >= options.minScore!);
  }
  if (options?.search) {
    const q = options.search.toLowerCase();
    results = results.filter(
      (t) =>
        t.name.toLowerCase().includes(q) ||
        (t.description?.toLowerCase().includes(q) ?? false) ||
        t.tags.some((tag) => tag.toLowerCase().includes(q))
    );
  }

  const sortBy = options?.sortBy ?? 'heat_score';
  const sortOrder = options?.sortOrder ?? 'desc';
  results.sort((a, b) => {
    const aVal = sortBy === 'heat_score' ? a[sortBy] : new Date(a[sortBy]).getTime();
    const bVal = sortBy === 'heat_score' ? b[sortBy] : new Date(b[sortBy]).getTime();
    return sortOrder === 'desc'
      ? (bVal as number) - (aVal as number)
      : (aVal as number) - (bVal as number);
  });

  if (options?.limit) {
    results = results.slice(0, options.limit);
  }

  return results;
}

// ============================================================
// 트렌드 히스토리 데이터 (30일간 heat_score 변화)
// 기간: 2026-02-15 ~ 2026-03-16
// ============================================================

function generateHistory(
  trendId: string,
  curve: number[],
): TrendHistory[] {
  const startDate = new Date('2026-02-15T00:00:00Z');
  return curve.map((score, i) => {
    const date = new Date(startDate);
    date.setDate(date.getDate() + i);
    return {
      id: `hist-${trendId}-${String(i).padStart(2, '0')}`,
      trend_id: trendId,
      recorded_at: date.toISOString(),
      heat_score: score,
    };
  });
}

// trend-kr-001 (두쫀쿠): 상승 → 정점(97) → 하락(cooling)
const curveKr001 = [
  60, 63, 67, 72, 76, 80, 83, 87, 90, 93,
  95, 96, 97, 97, 96, 95, 93, 91, 89, 87,
  86, 85, 84, 83, 82, 81, 80, 79, 78, 77,
];

// trend-us-001 (Rhode Lip): 꾸준한 상승
const curveUs001 = [
  52, 54, 56, 58, 60, 63, 65, 67, 69, 71,
  73, 75, 77, 79, 80, 82, 83, 85, 86, 87,
  88, 89, 90, 91, 91, 92, 93, 93, 94, 94,
];

// trend-cn-001 (新中式): 급상승 중
const curveCn001 = [
  45, 47, 48, 50, 52, 55, 58, 61, 64, 67,
  70, 72, 74, 76, 78, 80, 82, 84, 86, 87,
  88, 89, 90, 91, 91, 92, 92, 93, 93, 93,
];

// trend-jp-001 (치이카와): 급상승 중
const curveJp001 = [
  55, 56, 58, 60, 62, 64, 66, 68, 70, 72,
  74, 76, 78, 79, 81, 82, 84, 85, 86, 87,
  88, 88, 89, 89, 90, 90, 91, 91, 91, 91,
];

// trend-us-002 (Stanley Cup): 안정적 유지
const curveUs002 = [
  83, 84, 84, 85, 85, 84, 83, 84, 85, 86,
  85, 84, 85, 86, 85, 84, 85, 85, 86, 85,
  84, 85, 85, 86, 85, 85, 84, 85, 85, 85,
];

export const MOCK_TREND_HISTORY: TrendHistory[] = [
  ...generateHistory('trend-kr-001', curveKr001),
  ...generateHistory('trend-us-001', curveUs001),
  ...generateHistory('trend-cn-001', curveCn001),
  ...generateHistory('trend-jp-001', curveJp001),
  ...generateHistory('trend-us-002', curveUs002),
];

export function getMockHistoryForTrend(trendId: string): TrendHistory[] {
  return MOCK_TREND_HISTORY.filter((h) => h.trend_id === trendId).sort(
    (a, b) =>
      new Date(a.recorded_at).getTime() - new Date(b.recorded_at).getTime(),
  );
}

/**
 * 여러 트렌드의 히스토리를 배치로 반환 (trend_id별 그룹핑)
 */
export function getMockBatchHistory(
  trendIds: string[]
): Record<string, TrendHistory[]> {
  const result: Record<string, TrendHistory[]> = {};
  for (const id of trendIds) {
    result[id] = getMockHistoryForTrend(id);
  }
  return result;
}
