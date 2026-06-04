import { writeFileSync, readFileSync } from 'fs';
import pg from 'pg';

const WINDOW_DATE = '2026-04-16';
const OUTPUT_SQL = 'scripts/output/verified_4countries_full_ko_2026-04-16.update.sql';

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
  return `'${String(value).replace(/'/g, "''")}'`;
}

function arr(values) {
  if (!values) return null;
  return `ARRAY[${values.map(q).join(',')}]`;
}

const playlist = {
  kr: 'https://open.spotify.com/embed/playlist/37i9dQZEVXbM1H8L6Tttw9',
  us: 'https://open.spotify.com/embed/playlist/37i9dQZEVXbKuaTI1Z1Afx?theme=0',
  ca: 'https://open.spotify.com/embed/playlist/37i9dQZEVXbKfIuOAZrk7G?theme=0',
  jp: 'https://www.oricon.co.jp/rank/tt/w/2026-04-10/',
};

const updates = [
  // KR food
  ['KR', 'food', 'Butter Tteok Convenience Rush', '버터떡 편의점 확산', '버터떡 편의점 확산', '버터떡은 아직 꺼지지 않았습니다. SNS에서 뜬 쫀득한 디저트를 편의점이 빠르게 상품화하면서 이번 주에도 한국 디저트 흐름의 중심에 있습니다.'],
  ['KR', 'food', 'Yangzhi Ganlu Dessert', '양지감로 디저트', '양지감로 디저트', '망고와 자몽, 코코넛 느낌이 강한 양지감로가 다음 디저트 후보로 언급되고 있습니다. 카페형 디저트와 컵 디저트 쪽에서 이어서 볼 만한 흐름입니다.'],
  ['KR', 'food', 'Ube Dessert Drinks', '우베 디저트 음료', '우베 디저트 음료', '보라색 비주얼이 강한 우베 디저트와 음료가 카페 메뉴로 계속 번지고 있습니다. 맛보다도 사진과 영상에서 먼저 눈에 들어오는 타입입니다.'],
  ['KR', 'food', 'Chewy Texture Desserts', '쫀득 식감 디저트', '쫀득 식감 디저트', '한국 디저트 트렌드는 지금도 쫀득한 식감이 핵심입니다. 버터떡, 떡 디저트, 크림을 섞은 쫀득한 컵 디저트가 같이 움직입니다.'],
  ['KR', 'food', 'Convenience SNS Dessert Drops', '편의점 SNS 디저트 출시', '편의점 SNS 디저트 출시', 'SNS에서 먼저 뜬 디저트를 편의점이 바로 상품으로 내는 패턴이 강합니다. 한국은 이번 주도 편의점 신상 디저트를 계속 봐야 합니다.'],

  // KR fashion
  ['KR', 'fashion', 'Fresh Steps Spring Shoes', '봄 신발 교체', '봄 신발 교체', '4월 중순으로 넘어가면서 한국 패션은 옷보다 신발 교체 신호가 또렷합니다. 스니커즈, 플랫, 샌들처럼 가벼운 봄 신발 편집이 전면에 올라왔습니다.'],
  ['KR', 'fashion', 'Mood Refresh Light Layers', '가벼운 레이어드', '가벼운 레이어드', '두꺼운 아우터보다 셔츠, 얇은 재킷, 가벼운 니트로 분위기를 바꾸는 코디가 보입니다. 4월 중순 한국 날씨에 잘 맞는 흐름입니다.'],
  ['KR', 'fashion', 'Best-Selling Global Brands', '글로벌 캐주얼 브랜드 픽', '글로벌 캐주얼 브랜드 픽', '29CM에서 글로벌 브랜드 묶음이 다시 올라왔습니다. 국내 브랜드와 함께 해외 캐주얼·라이프스타일 브랜드를 섞어 입는 흐름입니다.'],
  ['KR', 'fashion', 'Spring Activewear', '봄 액티브웨어', '봄 액티브웨어', '날씨가 풀리면서 운동복과 일상복의 경계가 더 흐려졌습니다. 산책, 러닝, 가벼운 운동까지 커버하는 액티브웨어가 계속 올라옵니다.'],
  ['KR', 'fashion', 'Spring Outdoor', '봄 아웃도어룩', '봄 아웃도어룩', '한국의 4월 패션은 도시형 아웃도어가 여전히 강합니다. 윈드브레이커, 가벼운 팬츠, 편한 신발 조합이 무난하게 먹히는 구간입니다.'],

  // KR brands
  ['KR', 'entertainment', 'YUNSE', '윤세 YUNSE', '윤세 YUNSE', '윤세는 29CM 포커스 노출로 이번 주 다시 눈에 띈 브랜드입니다. 작은 액세서리와 가벼운 봄 아이템을 같이 보기 좋습니다.'],
  ['KR', 'entertainment', 'OVMENT', '오브먼트 OVMENT', '오브먼트 OVMENT', '오브먼트는 저자극 데일리 케어 쪽으로 노출이 붙었습니다. 화려한 신제품보다 매일 쓰는 클렌징·스킨케어 수요에 맞는 브랜드입니다.'],
  ['KR', 'entertainment', 'HAPPY MOONDAY', '해피문데이', '해피문데이', '해피문데이는 여성 웰니스와 생리용품 쪽에서 계속 보입니다. 생활밀착형 브랜드라 구매 전환이 잘 나는 쪽으로 봐야 합니다.'],
  ['KR', 'entertainment', 'CHILLY', '칠리 CHILLY', '칠리 CHILLY', '칠리는 여성청결제 카테고리에서 다시 노출이 붙었습니다. 뷰티보다 웰니스 상품으로 분류해 보는 게 자연스럽습니다.'],
  ['KR', 'entertainment', 'ADUAL', '에이듀얼 ADUAL', '에이듀얼 ADUAL', '에이듀얼은 봄 아우터와 셔츠류에 맞는 국내 패션 브랜드로 잡힙니다. 이번 주에는 가벼운 코튼 블루종 쪽 신호가 있습니다.'],

  // KR products
  ['KR', 'products', 'Ovment Daily Cleanser Set', '오브먼트 데일리 클렌저 세트', '오브먼트 데일리 클렌저 세트', '오브먼트 클렌저 세트는 자극 적은 데일리 클렌징 수요와 맞습니다. 큰 유행템이라기보다 지금 장바구니에 담기 좋은 실사용 상품입니다.'],
  ['KR', 'products', 'Happy Moonday Organic Pad 3-Month Set', '해피문데이 유기농 생리대 3개월 세트', '해피문데이 유기농 생리대 3개월 세트', '해피문데이 3개월 세트는 여성 웰니스 상품 중 재구매형 아이템입니다. 할인·구성 노출이 붙을 때 반응이 나기 좋습니다.'],
  ['KR', 'products', 'CHILLY Protect Feminine Wash', '칠리 프로텍트 여성청결제', '칠리 프로텍트 여성청결제', '칠리 프로텍트는 여성청결제 카테고리에서 이번 주 노출이 확인된 상품입니다. 뷰티보다 생활 케어 상품으로 보는 게 맞습니다.'],
  ['KR', 'products', 'ADUAL An Cotton Blouson', '에이듀얼 코튼 블루종', '에이듀얼 코튼 블루종', '에이듀얼 코튼 블루종은 4월 중순에 입기 좋은 얇은 아우터입니다. 날씨가 애매한 봄철에 반응하기 쉬운 상품입니다.'],
  ['KR', 'products', 'YUNSE Hatch Logo Socks', '윤세 해치 로고 삭스', '윤세 해치 로고 삭스', '윤세 로고 삭스는 메인 의류보다 부담 없이 살 수 있는 액세서리형 상품입니다. 브랜드 노출과 함께 선물·증정 포인트로 잡힙니다.'],

  // KR challenges
  ['KR', 'challenge', 'Akrapovic', '아크라포빅 (Akrapovic) - hamo', '아크라포빅 (Akrapovic) - hamo', 'Spotify Viral 50 Korea 1위권에 오른 곡입니다. 짧은 랩 훅과 리듬감이 좋아 립싱크, 표정 연기, 짧은 전환 영상에 붙기 좋습니다.', [playlist.kr, 'https://open.spotify.com/track/1yzhq3TCuOU9LFAcyzATaQ']],
  ['KR', 'challenge', 'Wish', 'Wish - KIRARA', 'Wish - KIRARA', 'Viral 50 Korea 상위권에 있는 곡입니다. 빠른 댄스 챌린지보다 감성 영상이나 분위기 전환용 오디오로 쓰이는 쪽에 가깝습니다.', [playlist.kr]],
  ['KR', 'challenge', 'Haraboji and Aboji', 'Haraboji & Aboji - PM Kenobi, Moment Joon', 'Haraboji & Aboji - PM Kenobi, Moment Joon', '한국 바이럴 차트 상위권에 들어온 로컬 감성 강한 곡입니다. 제목과 훅이 기억에 남아 밈성 영상에 붙기 좋습니다.', [playlist.kr]],
  ['KR', 'challenge', 'MONTAGEM HIKARI', 'MONTAGEM HIKARI - BellyJay', 'MONTAGEM HIKARI - BellyJay', '브라질 펑크 계열 리듬이 한국 차트에도 들어온 케이스입니다. 발동작이나 바닥을 쓸 듯한 풋워크 영상과 잘 맞습니다.', [playlist.kr]],
  ['KR', 'challenge', 'RUDE!', 'RUDE! - Hearts2Hearts', 'RUDE! - Hearts2Hearts', 'Hearts2Hearts의 RUDE!는 음원 차트와 숏폼에서 같이 살아 있는 K팝 댄스곡입니다. 포인트 안무형 챌린지로 계속 볼 만합니다.', [playlist.kr, 'https://kpopofficial.com/album/hearts2hearts-rude/']],

  // JP food
  ['JP', 'food', 'Paki-to Tiramisu Kuromitsu Kinako Mochi', '파키토 티라미수 흑밀 키나코 모치', 'パキッとティラミス 黒蜜きなこもち', '세븐일레븐의 바삭하게 깨지는 초콜릿, 흑밀, 키나코, 모치 조합입니다. 일본 편의점 디저트 특유의 식감 놀이 흐름이 잘 보입니다.'],
  ['JP', 'food', 'Two-Layer Uji Matcha Nama Dorayaki', '2층 우지 말차 생도라야키', '2層仕立て宇治抹茶生どら焼き', '우지 말차를 앞세운 생도라야키입니다. 일본은 4월에도 말차 디저트 신상이 계속 강하게 움직입니다.'],
  ['JP', 'food', 'Benitenshi Baked Sweet Potato Milk Cream', '베니텐시 군고구마 밀크크림', '紅天使のなめらか焼きいもミルククリーム', '고구마와 밀크크림을 섞은 편의점 디저트입니다. 지역감 있는 소재를 부드러운 크림 디저트로 바꾼 신상으로 보면 됩니다.'],
  ['JP', 'food', 'Mocchiri Wa Crepe Mochi and Kinako', '쫀득 와 크레이프 모치 키나코', 'もっちり和クレープ もちときなこ', '모치, 흑당 소스, 키나코 크림을 넣은 와풍 크레이프입니다. 일본 편의점의 쫀득한 식감 트렌드가 계속 이어지고 있습니다.'],
  ['JP', 'food', 'Strawberry Mousse and Jelly Benihoppe', '베니홋페 딸기 무스 젤리', '苺のムース＆ジュレ 紅ほっぺ', '시즈오카 베니홋페 딸기를 쓴 무스와 젤리 디저트입니다. 봄 과일 디저트로 지역 딸기 이름을 전면에 세운 점이 포인트입니다.'],

  // JP fashion
  ['JP', 'fashion', 'Camper x Issey Miyake Karst Finch', '캠퍼 x 이세이 미야케 카르스트 핀치', 'Camper x ISSEY MIYAKE Karst Finch', '캠퍼와 이세이 미야케 협업 스니커즈입니다. 기능성 신발에 디자인 브랜드 감도를 붙인 일본식 협업 신호가 뚜렷합니다.'],
  ['JP', 'fashion', 'New Balance District Vision 1080 v15', '뉴발란스 x 디스트릭트 비전 1080 v15', 'New Balance x District Vision 1080 v15', '러닝화 기반의 뉴발란스 협업 모델입니다. 일본에서는 퍼포먼스 스니커즈를 일상화로 신는 흐름이 계속 강합니다.'],
  ['JP', 'fashion', 'Converse All Star Flower Charm OX', '컨버스 올스타 플라워 참 OX', 'Converse All Star Flower Charm OX', '플라워 참으로 꾸밀 수 있는 컨버스 올스타입니다. 기본 스니커즈에 귀여운 장식을 더하는 커스터마이징 흐름입니다.'],
  ['JP', 'fashion', 'Marimekko Unikko Knit Bags', '마리메꼬 우니꼬 니트백', 'Marimekko Unikko Knit Bags', '마리메꼬의 우니꼬 패턴 니트백입니다. 선명한 컬러와 꽃무늬가 봄 액세서리로 잘 맞습니다.'],
  ['JP', 'fashion', 'Converse Chewy Frill Sandals', '컨버스 츄이 프릴 샌들', 'Converse Chewy Frill Sandals', '프릴 디테일이 들어간 컨버스 플랫폼 샌들입니다. 일본의 귀여운 여름 신발 트렌드로 보기 좋습니다.'],

  // JP brands
  ['JP', 'entertainment', 'Issey Miyake', '이세이 미야케', 'ISSEY MIYAKE', '이세이 미야케는 캠퍼 협업으로 이번 주 신발 쪽 노출이 강했습니다. 의류가 아니라 풋웨어 협업으로 새 관심을 만든 케이스입니다.'],
  ['JP', 'entertainment', 'Converse', '컨버스', 'Converse', '컨버스는 플라워 참 올스타와 프릴 샌들까지 동시에 보입니다. 일본 봄·여름 캐주얼 신발 브랜드로 계속 확인됩니다.'],
  ['JP', 'entertainment', 'New Balance', '뉴발란스', 'New Balance', '뉴발란스는 디스트릭트 비전 협업으로 러닝 기반 스니커즈 수요를 다시 잡았습니다. 기능성과 일상복 사이에 있습니다.'],
  ['JP', 'entertainment', 'Marimekko', '마리메꼬', 'Marimekko', '마리메꼬는 우니꼬 패턴 백과 소품으로 일본 봄 액세서리 시장에서 계속 노출됩니다. 컬러가 강해 SNS 이미지에도 잘 맞습니다.'],
  ['JP', 'entertainment', 'ANNA SUI', '안나수이', 'ANNA SUI', '안나수이는 여름 아이 메이크업과 네일 신상 예약 이슈로 다시 올라왔습니다. 일본 뷰티 신상 캘린더에서 존재감이 큽니다.'],

  // JP products
  ['JP', 'products', 'JILL STUART Sweets Revival Cosmetics', '질스튜어트 스위츠 리바이벌 코스메틱', 'JILL STUART Sweets Revival Cosmetics', '질스튜어트의 스위츠 테마 리바이벌 코스메틱입니다. 패키지와 콘셉트가 강해 일본 뷰티 신상 중 화제성이 좋습니다.'],
  ['JP', 'products', 'ANNA SUI Liquid Eye Color 2026 Summer', '안나수이 리퀴드 아이 컬러 2026 여름', 'ANNA SUI Liquid Eye Color 2026 Summer', '펄감 있는 리퀴드 아이 컬러입니다. 여름 메이크업용으로 반짝임과 색감을 전면에 세운 상품입니다.'],
  ['JP', 'products', 'Cosme Decorte Rouge Decorte Cream Glow', '코스메 데코르테 루즈 데코르테 크림 글로우', 'Cosme Decorte Rouge Decorte Cream Glow', '코스메 데코르테의 새 립 컬러입니다. 일본 백화점 뷰티 쪽에서는 촉촉한 립 텍스처가 계속 유효합니다.'],
  ['JP', 'products', 'Maquillage Angel Blue Cool Primer', '마키아주 엔젤블루 쿨 프라이머', 'Maquillage Angel Blue Cool Primer', '마키아주의 한정 쿨 프라이머입니다. 4월부터 여름 베이스 메이크업을 준비하는 흐름과 맞습니다.'],
  ['JP', 'products', 'DiorShow Flash Stick', '디올쇼 플래시 스틱', 'DiorShow Flash Stick', '디올쇼 플래시 스틱은 여름 아이 메이크업 신상으로 잡힙니다. 빠르게 포인트를 줄 수 있는 스틱형 제품이라는 점이 좋습니다.'],

  // JP challenges
  ['JP', 'challenge', 'Kimi ni 100 Percent', 'きみに100パーセント - きゃりーぱみゅぱみゅ', 'きみに100パーセント - きゃりーぱみゅぱみゅ', 'Oricon TikTok 음악 차트 1위권 곡입니다. 오래된 곡이 다시 숏폼 안무와 귀여운 영상 포맷으로 살아난 케이스입니다.', [playlist.jp]],
  ['JP', 'challenge', 'MONTAGEM NATTO GAKKO 2', 'MONTAGEM NATTO GAKKO 2 - BMFUNK2341', 'MONTAGEM NATTO GAKKO 2 - BMFUNK2341', '브라질 펑크 계열 리듬이 일본 TikTok 차트 상위권에 들어왔습니다. 빠른 컷 편집과 발동작 영상에 잘 붙는 곡입니다.', [playlist.jp, 'https://music.amazon.com/tracks/B0FT3TKS8G']],
  ['JP', 'challenge', 'Bad Boy', 'ほんまやで☆なんでやねん☆しらんけど - モナキ', 'ほんまやで☆なんでやねん☆しらんけど - モナキ', 'AWA가 4월 13일 공개한 TikTok HOT SONG 목록에서 언급된 곡입니다. 사비 구간의 중독성 있는 춤이 포인트입니다.', ['https://news.awa.fm/jpn/202603/tiktok', 'https://monaki.fanpla.jp/discography/detail/6385/']],
  ['JP', 'challenge', 'Bakuretsu Aishiteru', '爆裂愛してる - M!LK', '爆裂愛してる - M!LK', 'M!LK의 곡은 귀엽고 따라 하기 쉬운 안무로 TikTok에서 강하게 번졌습니다. 4월에도 HOT SONG 묶음에서 계속 확인됩니다.', ['https://news.awa.fm/jpn/202603/tiktok', 'https://tower.jp/article/news/2026/02/27/tg005']],
  ['JP', 'challenge', 'Tontsukatantan', 'トンツカタンタン - クレイジーウォウウォ!!', 'トンツカタンタン - クレイジーウォウウォ!!', '캐릭터 안무와 빠른 템포가 붙으면서 일본 TikTok에서 계속 쓰이는 곡입니다. 춤춰보기 영상으로 확산된 흐름입니다.', ['https://tvfan.kyodo.co.jp/music/news-music/1504934', 'https://www.youtube.com/watch?v=O0qF5oeeyTw']],

  // US food
  ['US', 'food', 'Zabs Chicken Ranch Nacho Fries', 'Zab’s 치킨 랜치 나초 프라이', 'Zab’s 치킨 랜치 나초 프라이', '타코벨이 핫소스 브랜드 Zab’s와 묶어 낸 매콤한 나초 프라이입니다. 감자튀김에 치킨, 랜치, 핫소스를 얹은 자극적인 신상입니다.'],
  ['US', 'food', 'Diablo Dusted Crispy Chicken Nuggets', '디아블로 더스트 치킨 너겟', 'Diablo Dusted Crispy Chicken Nuggets', '타코벨의 디아블로 소스를 가루 시즈닝처럼 입힌 치킨 너겟입니다. 미국 패스트푸드에서 매운 치킨 경쟁이 계속 이어집니다.'],
  ['US', 'food', 'Burger King King Size Sliders Box', '버거킹 킹 사이즈 슬라이더 박스', 'Burger King King Size Sliders Box', '버거킹이 테스트 중인 미니 버거 박스입니다. 여러 맛을 한 번에 고르는 구성이라 공유형 메뉴로 반응이 나기 좋습니다.'],
  ['US', 'food', 'Tax Day Food Deals', '택스데이 푸드 딜', 'Tax Day Food Deals', '미국 세금 신고 마감일에 맞춰 여러 외식 브랜드가 할인과 무료 메뉴를 냈습니다. 날짜성 이벤트지만 검색과 방문을 끌어내는 힘이 큽니다.'],
  ['US', 'food', 'Ben and Jerrys Free Cone Day', '벤앤제리스 프리콘데이', 'Ben & Jerry’s Free Cone Day', '벤앤제리스 무료 콘 행사입니다. 미국에서는 이런 하루짜리 무료 디저트 이벤트도 SNS 인증과 지역 방문을 크게 만듭니다.'],

  // US fashion
  ['US', 'fashion', 'Sneakerinas', '스니커리나', 'Sneakerinas', '스니커즈와 발레 플랫을 섞은 신발입니다. 편하지만 여성스러운 실루엣을 원하는 미국 봄 신발 트렌드로 잡힙니다.'],
  ['US', 'fashion', 'Floral Dresses', '플로럴 드레스', 'Floral Dresses', '봄·여름 런웨이 흐름에서 꽃무늬 드레스가 다시 강하게 보입니다. 미국에서는 시즌감이 바로 읽히는 안전한 스타일입니다.'],
  ['US', 'fashion', 'Spring 2026 Handbag Trends', '2026 봄 핸드백 트렌드', 'Spring 2026 Handbag Trends', '아카이브 백, 작은 파우치, 독특한 형태의 가방이 같이 올라왔습니다. 봄 코디에서 가방으로 포인트를 주는 흐름입니다.'],
  ['US', 'fashion', 'Spring Shoe Colors', '봄 슈즈 컬러', 'Spring Shoe Colors', '버터 옐로, 화이트, 레드, 연핑크, 메탈릭, 파우더 블루처럼 색으로 신발을 고르는 흐름입니다. 옷보다 신발 색이 먼저 보입니다.'],
  ['US', 'fashion', 'Brooch Revival', '브로치 리바이벌', 'Brooch Revival', '브로치가 재킷, 셔츠, 니트 포인트로 다시 쓰이고 있습니다. 올드한 액세서리를 새롭게 스타일링하는 흐름입니다.'],

  // US brands
  ['US', 'entertainment', 'Taco Bell', '타코벨', 'Taco Bell', '타코벨은 이번 주 디아블로 너겟과 Zab’s 나초 프라이를 연달아 밀었습니다. 매운맛 신상으로 가장 눈에 띈 패스트푸드 브랜드입니다.'],
  ['US', 'entertainment', 'Puma', '푸마', 'Puma', '푸마는 Speedcat Ballet으로 스니커리나 흐름에 올라탔습니다. 가격 접근성이 좋아 트렌드 입문용으로 언급되기 좋습니다.'],
  ['US', 'entertainment', 'Burger King', '버거킹', 'Burger King', '버거킹은 킹 사이즈 슬라이더 박스 테스트로 다시 메뉴 이야기를 만들었습니다. 미니 버거 구성이라 숏폼에도 잘 보입니다.'],
  ['US', 'entertainment', 'Prada', '프라다', 'Prada', '프라다는 슬림 스니커즈와 펌프스 흐름에서 계속 언급됩니다. 미국 봄 신발 트렌드에서 럭셔리 기준점 역할을 합니다.'],
  ['US', 'entertainment', 'Chloe', '끌로에', 'Chloe', '끌로에는 플로럴 드레스, 가방, 신발 트렌드에서 동시에 잡힙니다. 부드러운 봄 무드의 대표 브랜드로 보입니다.'],

  // US products
  ['US', 'products', 'Zabs Chicken Ranch Nacho Fries', 'Zab’s 치킨 랜치 나초 프라이', 'Zab’s Chicken Ranch Nacho Fries', '타코벨의 이번 주 핵심 상품입니다. 감자튀김 위에 치킨과 매운 랜치를 얹어 한눈에 자극적인 비주얼이 나옵니다.'],
  ['US', 'products', 'Diablo Dusted Crispy Chicken Nuggets', '디아블로 더스트 치킨 너겟', 'Diablo Dusted Crispy Chicken Nuggets', '디아블로 시즈닝을 입힌 타코벨 너겟입니다. 소스보다 더 직접적인 매운맛 상품으로 이야기하기 좋습니다.'],
  ['US', 'products', 'Puma Speedcat Ballet Sneakers', '푸마 스피드캣 발레 스니커즈', 'Puma Speedcat Ballet Sneakers', '스니커리나 트렌드를 부담 없이 따라가기 좋은 푸마 모델입니다. 스포티한데 발레 플랫처럼 얇은 실루엣이 특징입니다.'],
  ['US', 'products', 'Staud Lila Mini Bag', '스타우드 라일라 미니백', 'Staud Lila Mini Bag', '봄 핸드백 트렌드에서 작은 파우치형 가방으로 언급된 상품입니다. 가볍게 들 수 있는 포인트 백으로 보기 좋습니다.'],
  ['US', 'products', 'Chloe Paddington Bag', '끌로에 패딩턴 백', 'Chloe Paddington Bag', '끌로에 패딩턴 백은 아카이브 백 부활 흐름의 대표 사례입니다. 예전 잇백을 다시 꺼내 드는 분위기가 있습니다.'],

  // US challenges
  ['US', 'challenge', 'Self Aware', 'Self Aware - Temper City', 'Self Aware - Temper City', 'Spotify Viral 50 USA 상위권에 있는 곡입니다. 감정선 있는 짧은 영상이나 립싱크 배경음으로 쓰기 좋습니다.', [playlist.us]],
  ['US', 'challenge', 'iloveitiloveitiloveit', 'iloveitiloveitiloveit - Bella Kay', 'iloveitiloveitiloveit - Bella Kay', '미국 Viral 50 상위권에 오른 곡입니다. 제목처럼 반복감이 강해서 짧은 후킹 영상에 붙기 좋습니다.', [playlist.us]],
  ['US', 'challenge', 'Just The Way You Are', 'Doomed - Maphra', 'Doomed - Maphra', '4월 16일 기준 Spotify Viral 50 USA 1위권 곡입니다. 감정적인 분위기의 숏폼 배경음으로 빠르게 올라왔습니다.', [playlist.us]],
  ['US', 'challenge', 'Ring My Bell', 'Freakin’ Out - Dexter and The Moonrocks', 'Freakin’ Out - Dexter and The Moonrocks', '미국 Viral 50 상위권 록 사운드입니다. 댄스보다 상황극, 전환, 에너지 있는 편집 영상에 잘 맞습니다.', [playlist.us]],
  ['US', 'challenge', 'Be Like a Woman', 'Jane! - The Long Faces', 'Jane! - The Long Faces', 'Viral 50 USA 상위권에 들어온 곡입니다. 인디 감성 숏폼과 립싱크 영상에 붙기 좋은 흐름입니다.', [playlist.us]],

  // CA food
  ['CA', 'food', 'Raspberry Mojito Zero Sugar Sparkling Quencher', '라즈베리 모히토 제로슈거 스파클링 퀜처', 'Raspberry Mojito Zero Sugar Sparkling Quencher', '팀홀튼이 봄·여름 음료로 앞세운 제로슈거 탄산 퀜처입니다. 캐나다에서는 가볍고 시원한 음료 신호가 강합니다.'],
  ['CA', 'food', 'Tim Hortons Protein Quenchers', '팀홀튼 프로틴 퀜처', 'Tim Hortons Protein Quenchers', '단순 음료가 아니라 단백질을 넣은 차가운 음료입니다. 캐나다에서도 기능성 음료와 카페 메뉴가 섞이는 흐름이 보입니다.'],
  ['CA', 'food', 'Caramel Churro Drinks', '카라멜 츄로 음료', 'Caramel Churro Drinks', '팀홀튼의 디저트형 음료입니다. 츄로와 카라멜 맛을 음료로 옮긴 메뉴라 달달한 시즌 메뉴로 반응하기 좋습니다.'],
  ['CA', 'food', 'FlameThrower Chicken Strip Basket', '플레임스로워 치킨 스트립 바스켓', 'FlameThrower Chicken Strip Basket', 'DQ Canada가 매운 치킨 스트립 바스켓을 밀고 있습니다. 부드러운 아이스크림 이미지와 매운 치킨을 같이 쓰는 점이 재미있습니다.'],
  ['CA', 'food', 'Pineapple Lemonade DQ Sparkler with Tajin', '타힌 파인애플 레모네이드 스파클러', 'Pineapple Lemonade DQ Sparkler with Tajin', '파인애플 레모네이드에 타힌을 더한 음료입니다. 달고 상큼한 과일맛에 매콤한 가루를 얹는 조합이 포인트입니다.'],

  // CA fashion
  ['CA', 'fashion', 'Primary Paintbox', '원색 컬러 코디', 'Primary Paintbox', '캐나다 봄 패션에서는 빨강, 파랑, 노랑처럼 선명한 원색을 쓰는 코디가 보입니다. 흐린 날씨에도 눈에 띄는 스타일입니다.'],
  ['CA', 'fashion', 'Feathered Details', '깃털 디테일', 'Feathered Details', '깃털 장식은 캐나다 봄 트렌드에서 장난스러운 포인트로 잡힙니다. 과하지 않게 소매나 끝단에 들어가는 식입니다.'],
  ['CA', 'fashion', 'Twenties Dressing', '1920년대풍 드레싱', 'Twenties Dressing', '드롭 웨이스트와 빈티지한 장식감이 있는 1920년대풍 스타일입니다. 파티룩과 데일리룩 사이에서 변주되기 좋습니다.'],
  ['CA', 'fashion', 'Bookish Babe', '북시크 스타일', 'Bookish Babe', '안경, 니트, 셔츠처럼 공부 잘할 것 같은 프레피 무드가 이어집니다. 캐나다 봄 데일리룩에 자연스럽게 들어갑니다.'],
  ['CA', 'fashion', 'Wow-Worthy Skirts', '존재감 있는 스커트', 'Wow-Worthy Skirts', '기본 상의에 스커트 하나로 포인트를 주는 흐름입니다. 볼륨, 색, 소재가 확실한 스커트가 봄 코디 중심에 있습니다.'],

  // CA brands
  ['CA', 'entertainment', 'Tim Hortons', '팀홀튼', 'Tim Hortons', '팀홀튼은 캐나다 봄 음료 라인업을 가장 크게 밀고 있습니다. 퀜처, 프로틴 음료, 츄로 음료까지 한 번에 잡힙니다.'],
  ['CA', 'entertainment', 'Dairy Queen Canada', '데어리퀸 캐나다', 'Dairy Queen Canada', 'DQ Canada는 매운 치킨과 타힌 음료, 블리자드 할인까지 같이 노출됩니다. 아이스크림 브랜드를 넘어 식사 메뉴까지 밀고 있습니다.'],
  ['CA', 'entertainment', 'Aritzia', '아리치아', 'Aritzia', '아리치아는 캐나다 패션에서 계속 기준점처럼 쓰이는 브랜드입니다. 컬러와 봄 재킷 흐름에서 다시 언급됩니다.'],
  ['CA', 'entertainment', 'Dior Beauty', '디올 뷰티', 'Dior Beauty', '디올 뷰티는 브론저와 글로우 메이크업 흐름에서 계속 보입니다. 2000년대식 골든 메이크업 분위기와 맞습니다.'],
  ['CA', 'entertainment', 'Cheekbone Beauty', '치크본 뷰티', 'Cheekbone Beauty', '치크본 뷰티는 캐나다 로컬 뷰티 브랜드로 계속 주목할 만합니다. 블러셔와 브론저 상품이 시즌 흐름과 잘 맞습니다.'],

  // CA products
  ['CA', 'products', 'Raspberry Mojito Zero Sugar Sparkling Quencher', '라즈베리 모히토 제로슈거 스파클링 퀜처', 'Raspberry Mojito Zero Sugar Sparkling Quencher', '팀홀튼 봄·여름 음료 라인업의 대표 상품입니다. 제로슈거와 상큼한 맛을 동시에 내세운 점이 강합니다.'],
  ['CA', 'products', 'Caramel Churro Iced Capp', '카라멜 츄로 아이스캡', 'Caramel Churro Iced Capp', '카라멜 츄로 맛을 아이스캡으로 만든 상품입니다. 캐나다 팀홀튼식 달달한 시즌 메뉴로 보기 좋습니다.'],
  ['CA', 'products', 'FlameThrower Chicken Strip Basket', '플레임스로워 치킨 스트립 바스켓', 'FlameThrower Chicken Strip Basket', 'DQ Canada의 매운 치킨 바스켓입니다. 달콤한 디저트 브랜드 이미지와 반대로 매운 식사 메뉴를 밀고 있습니다.'],
  ['CA', 'products', 'DQ Blizzard Treat BOGO', 'DQ 블리자드 1+1 행사', 'DQ Blizzard Treat BOGO', '4월 14일부터 19일까지 진행되는 블리자드 1+1 행사입니다. 기간이 짧아 방문을 바로 끌어내는 프로모션입니다.'],
  ['CA', 'products', 'Cheekbone Beauty Balance Blush Bronzer', '치크본 뷰티 밸런스 블러셔 브론저', 'Cheekbone Beauty Balance Blush Bronzer', '치크본 뷰티의 블러셔·브론저 상품입니다. 캐나다 봄 메이크업에서 혈색과 햇빛에 그을린 느낌을 같이 잡습니다.'],

  // CA challenges
  ['CA', 'challenge', 'Loop', 'Doomed - Maphra', 'Doomed - Maphra', 'Spotify Viral 50 Canada 1위권 곡입니다. 캐나다에서는 감정적인 숏폼 배경음으로 빠르게 올라온 흐름입니다.', [playlist.ca]],
  ['CA', 'challenge', 'Self Aware', 'In The Dark - Tom Right', 'In The Dark - Tom Right', 'Viral 50 Canada 상위권 곡입니다. 차분한 분위기 영상과 짧은 감정 전환 컷에 붙기 좋습니다.', [playlist.ca]],
  ['CA', 'challenge', 'iloveitiloveitiloveit', 'When I Stand - Owen James', 'When I Stand - Owen James', '캐나다 Viral 50 상위권에 들어온 곡입니다. 캐나다 로컬 감성의 숏폼 배경음으로 보기 좋습니다.', [playlist.ca]],
  ['CA', 'challenge', 'Sherpa', 'Freakin’ Out - Dexter and The Moonrocks', 'Freakin’ Out - Dexter and The Moonrocks', '캐나다 Viral 50 상위권 록 사운드입니다. 에너지 있는 상황극이나 전환 영상에 쓰기 좋습니다.', [playlist.ca]],
  ['CA', 'challenge', 'Just The Way You Are', 'Jane! - The Long Faces', 'Jane! - The Long Faces', 'Viral 50 Canada 상위권 곡입니다. 인디 감성 립싱크와 데일리 브이로그 배경음으로 잡힙니다.', [playlist.ca]],
];

function toUpdate(update) {
  const [country, category, oldName, name, nameLocal, description, sourceUrls] = update;
  const setParts = [
    `name = ${q(name)}`,
    `name_local = ${q(nameLocal)}`,
    `description = ${q(description)}`,
  ];
  const sourceArray = arr(sourceUrls);
  if (sourceArray) setParts.push(`source_urls = ${sourceArray}`);

  return {
    country,
    category,
    oldName,
    name,
    nameLocal,
    description,
    sourceUrls,
    sql: `UPDATE trends t SET ${setParts.join(', ')}
WHERE t.country_id = (SELECT id FROM countries WHERE code = ${q(country)})
  AND t.category_id = (SELECT id FROM categories WHERE slug = ${q(category)})
  AND t.name = ${q(oldName)}
  AND t.last_updated_at::date = DATE ${q(WINDOW_DATE)};`,
  };
}

const updateObjects = updates.map(toUpdate);
const outputSql = [
  '-- Korean natural copy refresh for verified 4-country trends',
  `-- Window date: ${WINDOW_DATE}`,
  'BEGIN;',
  ...updateObjects.map((item) => item.sql),
  'COMMIT;',
  '',
].join('\n\n');

writeFileSync(OUTPUT_SQL, outputSql, 'utf8');
console.log(`업데이트 SQL 파일 생성: ${OUTPUT_SQL}`);

const env = loadEnv();
const databaseUrl = process.env.DATABASE_URL || env.DATABASE_URL;
if (!databaseUrl) {
  console.error('DATABASE_URL이 없습니다.');
  process.exit(1);
}

const { Pool } = pg;
const pool = new Pool({ connectionString: databaseUrl });

let total = 0;
const missed = [];

try {
  await pool.query('BEGIN');
  for (const item of updateObjects) {
    const params = [
      item.name,
      item.nameLocal,
      item.description,
      item.sourceUrls ?? null,
      item.country,
      item.category,
      item.oldName,
      WINDOW_DATE,
    ];
    const result = await pool.query(
      `UPDATE trends t
       SET name = $1,
         name_local = $2,
         description = $3,
         source_urls = COALESCE($4::text[], source_urls)
       WHERE t.country_id = (SELECT id FROM countries WHERE code = $5)
         AND t.category_id = (SELECT id FROM categories WHERE slug = $6)
         AND t.name = $7
         AND t.last_updated_at::date = $8::date`,
      params
    );
    total += result.rowCount;
    if (result.rowCount !== 1) {
      missed.push(`${item.country}/${item.category}/${item.oldName}: ${result.rowCount}`);
    }
  }
  if (missed.length) {
    throw new Error(`업데이트 누락/중복: ${missed.join(', ')}`);
  }
  await pool.query('COMMIT');
  console.log(`Docker DB 업데이트 완료: ${total}개`);
} catch (error) {
  await pool.query('ROLLBACK');
  console.error(error.message);
  process.exit(1);
} finally {
  await pool.end();
}
