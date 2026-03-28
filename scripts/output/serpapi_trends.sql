-- MONTRA 실제 상품 데이터 (SerpAPI Google Shopping)
-- 생성일: 2026-03-17 05:52:08 UTC
-- 총 297개 상품, API 호출 24회

-- 기존 카테고리 삭제 + 새 4개 카테고리
TRUNCATE trend_history CASCADE;
TRUNCATE trends CASCADE;
DELETE FROM categories;

INSERT INTO categories (slug, name_ko, name_en, emoji, sort_order) VALUES ('fashion', '옷', 'Fashion', '👗', 1);
INSERT INTO categories (slug, name_ko, name_en, emoji, sort_order) VALUES ('products', '상품', 'Products', '🛍️', 2);
INSERT INTO categories (slug, name_ko, name_en, emoji, sort_order) VALUES ('food', '음식', 'Food', '🍽️', 3);
INSERT INTO categories (slug, name_ko, name_en, emoji, sort_order) VALUES ('entertainment', '놀이', 'Entertainment', '🎮', 4);

-- slug CHECK 제약 업데이트
ALTER TABLE categories DROP CONSTRAINT IF EXISTS categories_slug_check;
ALTER TABLE categories ADD CONSTRAINT categories_slug_check CHECK (slug IN ('fashion', 'products', 'food', 'entertainment'));

INSERT INTO trends (country_id, category_id, name, description, image_url, heat_score, heat_status, search_score, social_score, ecommerce_score, news_score, tags, source_urls, first_detected_at, last_updated_at) VALUES (
  (SELECT id FROM countries WHERE code='KR'),
  (SELECT id FROM categories WHERE slug='fashion'),
  'AI 비즈니스 트렌드 2026', '판매처: 알라딘 인터넷서점 | 가격: ₩15,400', 'https://encrypted-tbn2.gstatic.com/shopping?q=tbn:ANd9GcRgg04OgK-YxD14C1gMvUeJY47Y61NRLY5WCLYA0Co76-EkMcrcHM0Jse6o0Bq7ezX3g7y9e1eu4xT7iyO81czRT6sqiSPlvkgD5UTQIsJ3J0PFTeFySDt1',
  100, 'rising',
  95, 85, 100, 75,
  ARRAY['알라딘 인터넷서점','₩15,400'], ARRAY['https://www.google.com/search?ibp=oshop&q=2026 인기 패션 트렌드 옷&prds=catalogid:6387590625473545145,headlineOfferDocid:3044505943871792066,imageDocid:11423711138602571446,gpcid:180044315771083537,mid:576462872288157935,pvt:hg&hl=ko&gl=kr&udm=28'],
  '2026-03-17T05:52:08.866748+00:00', '2026-03-17T05:52:08.866748+00:00'
);
INSERT INTO trends (country_id, category_id, name, description, image_url, heat_score, heat_status, search_score, social_score, ecommerce_score, news_score, tags, source_urls, first_detected_at, last_updated_at) VALUES (
  (SELECT id FROM countries WHERE code='KR'),
  (SELECT id FROM categories WHERE slug='fashion'),
  '2026 AI 교육 트렌드', '판매처: 알라딘 인터넷서점 | 가격: ₩20,000', 'https://encrypted-tbn3.gstatic.com/shopping?q=tbn:ANd9GcTXGr3G2Fl_-7VZC4kkYO3OKQgyNNou2wNlPKjkZyk9bTQPApz6srJn6zSxCCq9et1dnQTULxfb_IosO0KDC0yChH84qvdR0L2fw1BfiVQBIAfizTzhgh-XsA',
  97, 'rising',
  92, 82, 97, 72,
  ARRAY['알라딘 인터넷서점','₩20,000'], ARRAY['https://www.google.com/search?ibp=oshop&q=2026 인기 패션 트렌드 옷&prds=catalogid:2854001203237229633,headlineOfferDocid:2751300789870304794,imageDocid:13368464750947117295,gpcid:5872839239104987621,mid:576462875447284505,pvt:hg&hl=ko&gl=kr&udm=28'],
  '2026-03-17T05:52:08.866748+00:00', '2026-03-17T05:52:08.866748+00:00'
);
INSERT INTO trends (country_id, category_id, name, description, image_url, heat_score, heat_status, search_score, social_score, ecommerce_score, news_score, tags, source_urls, first_detected_at, last_updated_at) VALUES (
  (SELECT id FROM countries WHERE code='KR'),
  (SELECT id FROM categories WHERE slug='fashion'),
  '웰니스치유 트렌드 2026', '판매처: 알라딘 인터넷서점 | 가격: ₩17,820', 'https://encrypted-tbn0.gstatic.com/shopping?q=tbn:ANd9GcRAUnKlPi03SMyiL2yjGpKe9nPdyeIqCuRqvCnx59fBDhQRTu_LWw4ouAXeWREYGuzto5lNShc43_zTMGjOfk_NJBmwKvodRw',
  95, 'rising',
  90, 80, 95, 70,
  ARRAY['알라딘 인터넷서점','₩17,820'], ARRAY['https://www.google.com/search?ibp=oshop&q=2026 인기 패션 트렌드 옷&prds=catalogid:7517852758937298821,headlineOfferDocid:1549463514143425157,imageDocid:2127428846600914816,gpcid:4262029430656489411,mid:576462847058746956,pvt:hg&hl=ko&gl=kr&udm=28'],
  '2026-03-17T05:52:08.866748+00:00', '2026-03-17T05:52:08.866748+00:00'
);
INSERT INTO trends (country_id, category_id, name, description, image_url, heat_score, heat_status, search_score, social_score, ecommerce_score, news_score, tags, source_urls, first_detected_at, last_updated_at) VALUES (
  (SELECT id FROM countries WHERE code='KR'),
  (SELECT id FROM categories WHERE slug='fashion'),
  'SPRING26 3차[콩제슬래드]FAIRY 프릴 코스튬-KS26KSCOS4800HMX', '판매처: 포레포레 | 가격: ₩90,000', 'https://encrypted-tbn3.gstatic.com/shopping?q=tbn:ANd9GcRhz76tiMcaKvxkzayUc5UK2aEykrdM8QsmNmKP7vlrQHTeQCbZwEXGJPvxaNtci9vmybtXhIXGYd9z1iwX4EPGJyh9z1tA',
  92, 'rising',
  87, 77, 92, 67,
  ARRAY['포레포레','₩90,000'], ARRAY['https://www.google.com/search?ibp=oshop&q=2026 인기 패션 트렌드 옷&prds=productid:3095382321218718986,headlineOfferDocid:3095382321218718986,imageDocid:9458549121400102083,pvt:hg&hl=ko&gl=kr&udm=28'],
  '2026-03-17T05:52:08.866748+00:00', '2026-03-17T05:52:08.866748+00:00'
);
INSERT INTO trends (country_id, category_id, name, description, image_url, heat_score, heat_status, search_score, social_score, ecommerce_score, news_score, tags, source_urls, first_detected_at, last_updated_at) VALUES (
  (SELECT id FROM countries WHERE code='KR'),
  (SELECT id FROM categories WHERE slug='fashion'),
  'Z세대 트렌드 2026', '판매처: 알라딘 인터넷서점 | 가격: ₩16,200', 'https://encrypted-tbn1.gstatic.com/shopping?q=tbn:ANd9GcTSvJp7I7b6mc4-o8y246ZdWLSNBvdHDZSiNSBtA8CsfsZqA9ziXCoDgbMV6H574i9Rv8YuJiQbjLfybRmBj5DflW_AfqH0',
  90, 'rising',
  85, 75, 90, 65,
  ARRAY['알라딘 인터넷서점','₩16,200'], ARRAY['https://www.google.com/search?ibp=oshop&q=2026 인기 패션 트렌드 옷&prds=catalogid:4713841785594509977,headlineOfferDocid:7547981812456025237,imageDocid:13467463850888308609,gpcid:930529229086861959,mid:576462868605129235,pvt:hg&hl=ko&gl=kr&udm=28'],
  '2026-03-17T05:52:08.866748+00:00', '2026-03-17T05:52:08.866748+00:00'
);
INSERT INTO trends (country_id, category_id, name, description, image_url, heat_score, heat_status, search_score, social_score, ecommerce_score, news_score, tags, source_urls, first_detected_at, last_updated_at) VALUES (
  (SELECT id FROM countries WHERE code='KR'),
  (SELECT id FROM categories WHERE slug='fashion'),
  '펠트 골든 도블론 데님 슬리브리스 : 여성용 블랙 (PA2TVF003BK) | 펠트', '판매처: 펠트 | 가격: ₩348,000', 'https://encrypted-tbn1.gstatic.com/shopping?q=tbn:ANd9GcSbEI_zfju1VKTSX6d44Db03H8lG4y5bvUX7SgUzMwV809LlDdBcq4IXJD6WiM_O6h7TP1Z8Ob7mett_E5xacHMou1xM_7mL3ru8aTLl-I0fl3j37SFhcaE3w',
  87, 'steady',
  82, 72, 87, 62,
  ARRAY['펠트','₩348,000'], ARRAY['https://www.google.com/search?ibp=oshop&q=2026 인기 패션 트렌드 옷&prds=productid:14853699964767440580,headlineOfferDocid:14853699964767440580,imageDocid:8934216137997540761,pvt:hg&hl=ko&gl=kr&udm=28'],
  '2026-03-17T05:52:08.866748+00:00', '2026-03-17T05:52:08.866748+00:00'
);
INSERT INTO trends (country_id, category_id, name, description, image_url, heat_score, heat_status, search_score, social_score, ecommerce_score, news_score, tags, source_urls, first_detected_at, last_updated_at) VALUES (
  (SELECT id FROM countries WHERE code='KR'),
  (SELECT id FROM categories WHERE slug='fashion'),
  '발렌시아가 25SS 803266 바스킷볼 배기 스웨트 팬츠', '판매처: 필웨이 | 가격: ₩630,000', 'https://encrypted-tbn0.gstatic.com/shopping?q=tbn:ANd9GcR_HuDK0MeizDG6G2OKlXBWhbpdGOePW8D4VVGi_B1knS7jDXz-l9MestSKO4DIYfFIg4B3cwTU4PxSQvXZV1WEsuXYLqWw',
  85, 'steady',
  80, 70, 85, 60,
  ARRAY['필웨이','₩630,000'], ARRAY['https://www.google.com/search?ibp=oshop&q=2026 인기 패션 트렌드 옷&prds=productid:2202691934031828786,headlineOfferDocid:2202691934031828786,imageDocid:8693219304323421028,pvt:hg&hl=ko&gl=kr&udm=28'],
  '2026-03-17T05:52:08.866748+00:00', '2026-03-17T05:52:08.866748+00:00'
);
INSERT INTO trends (country_id, category_id, name, description, image_url, heat_score, heat_status, search_score, social_score, ecommerce_score, news_score, tags, source_urls, first_detected_at, last_updated_at) VALUES (
  (SELECT id FROM countries WHERE code='KR'),
  (SELECT id FROM categories WHERE slug='fashion'),
  '펠트 미션 스탬프 패턴 PK 셔츠 : 여성용 블랙 (PA2TSF014BK) | 펠트', '판매처: 펠트 | 가격: ₩298,000', 'https://encrypted-tbn0.gstatic.com/shopping?q=tbn:ANd9GcROFAabm2uvW-iNebt8SRwqfE6KYoxC_oDVUQ1ahIJLppM4NTEfHnvYDbEe7rgghmJ0NdwDbeUA3G-Y1D0hb8fezbF7Iy6mXes8bkqmny8W9aGIgvVOifSYrw',
  82, 'steady',
  77, 67, 82, 57,
  ARRAY['펠트','₩298,000'], ARRAY['https://www.google.com/search?ibp=oshop&q=2026 인기 패션 트렌드 옷&prds=productid:4429619590097988027,headlineOfferDocid:4429619590097988027,imageDocid:424449332163226916,pvt:hg&hl=ko&gl=kr&udm=28'],
  '2026-03-17T05:52:08.866748+00:00', '2026-03-17T05:52:08.866748+00:00'
);
INSERT INTO trends (country_id, category_id, name, description, image_url, heat_score, heat_status, search_score, social_score, ecommerce_score, news_score, tags, source_urls, first_detected_at, last_updated_at) VALUES (
  (SELECT id FROM countries WHERE code='KR'),
  (SELECT id FROM categories WHERE slug='fashion'),
  '펠트 트리플 믹스 레터 PK 셔츠 : 여성용 블랙 (PA2TSF009BK) | 펠트', '판매처: 펠트 | 가격: ₩288,000', 'https://encrypted-tbn0.gstatic.com/shopping?q=tbn:ANd9GcTQY17No42AFsFuz-oHDoqTfSyI6Z3RTm2ZDjcmCj9BzV8RfT5DO9Py_G9EkRbEP0xc6K7Qze5zOntn0_gWg7uc5R_0GHDEvS-KAS8FrGL58BzeXOabIQIVrg',
  80, 'steady',
  75, 65, 80, 55,
  ARRAY['펠트','₩288,000'], ARRAY['https://www.google.com/search?ibp=oshop&q=2026 인기 패션 트렌드 옷&prds=productid:10909116824688377363,headlineOfferDocid:10909116824688377363,imageDocid:1710493165131819200,pvt:hg&hl=ko&gl=kr&udm=28'],
  '2026-03-17T05:52:08.866748+00:00', '2026-03-17T05:52:08.866748+00:00'
);
INSERT INTO trends (country_id, category_id, name, description, image_url, heat_score, heat_status, search_score, social_score, ecommerce_score, news_score, tags, source_urls, first_detected_at, last_updated_at) VALUES (
  (SELECT id FROM countries WHERE code='KR'),
  (SELECT id FROM categories WHERE slug='fashion'),
  '펠트 미션 스탬프 패턴 PK 셔츠 : 남성용 블랙 (PA2TSM014BK) | 펠트', '판매처: 펠트 | 가격: ₩298,000', 'https://encrypted-tbn3.gstatic.com/shopping?q=tbn:ANd9GcT9uk6xwnNmnX8G9yU0wDz7n-SsV7O0cqVULeOYI1sJN7qldgeDoR-WCvVa1-vfcUYSFpvjtJFqLyuOJko6tXiYFKsPKMOKuTxyE2TJxokEaTTMWERbr727',
  77, 'steady',
  72, 62, 77, 52,
  ARRAY['펠트','₩298,000'], ARRAY['https://www.google.com/search?ibp=oshop&q=2026 인기 패션 트렌드 옷&prds=productid:10061023720276069555,headlineOfferDocid:10061023720276069555,imageDocid:2596540706727751687,pvt:hg&hl=ko&gl=kr&udm=28'],
  '2026-03-17T05:52:08.866748+00:00', '2026-03-17T05:52:08.866748+00:00'
);
INSERT INTO trends (country_id, category_id, name, description, image_url, heat_score, heat_status, search_score, social_score, ecommerce_score, news_score, tags, source_urls, first_detected_at, last_updated_at) VALUES (
  (SELECT id FROM countries WHERE code='KR'),
  (SELECT id FROM categories WHERE slug='fashion'),
  '실버 플라워 패턴 포인트 PK 티셔츠 : 여성용 화이트 (PD2TSF534WH) | 펠트', '판매처: 펠트 | 가격: ₩298,000', 'https://encrypted-tbn2.gstatic.com/shopping?q=tbn:ANd9GcRL75ICnOS0P7tvxA2IQhx_DzsSHAeoGeWVsQCrD9jcxGMA28EUaQbAF7BG2dNnjD7nz4j1ElNFR4ppPxe4j64pduBCyBKc2ShXAeTBFMK4kISfG1RzMGIw2w',
  75, 'steady',
  70, 60, 75, 50,
  ARRAY['펠트','₩298,000'], ARRAY['https://www.google.com/search?ibp=oshop&q=2026 인기 패션 트렌드 옷&prds=productid:13394800831563246392,headlineOfferDocid:13394800831563246392,imageDocid:7505463340247050802,pvt:hg&hl=ko&gl=kr&udm=28'],
  '2026-03-17T05:52:08.866748+00:00', '2026-03-17T05:52:08.866748+00:00'
);
INSERT INTO trends (country_id, category_id, name, description, image_url, heat_score, heat_status, search_score, social_score, ecommerce_score, news_score, tags, source_urls, first_detected_at, last_updated_at) VALUES (
  (SELECT id FROM countries WHERE code='KR'),
  (SELECT id FROM categories WHERE slug='fashion'),
  '실버 플라워 패턴 포인트 PK 티셔츠 : 여성용 블랙 (PD2TSF534BK) | 펠트', '판매처: 펠트 | 가격: ₩298,000', 'https://encrypted-tbn0.gstatic.com/shopping?q=tbn:ANd9GcRlf5kK4w-r1kpOVnHTw39EP-owPAbY7c7xek43Tne70rVGhwuHuj7f5IG7Vk2e9lZENASxlLnZINDvpIK00ceAwV93ZqUnk-b7SArmQJDMZB6_6qmYINNMdw',
  72, 'steady',
  67, 57, 72, 47,
  ARRAY['펠트','₩298,000'], ARRAY['https://www.google.com/search?ibp=oshop&q=2026 인기 패션 트렌드 옷&prds=productid:1189612427340786818,headlineOfferDocid:1189612427340786818,imageDocid:10958289370295685464,pvt:hg&hl=ko&gl=kr&udm=28'],
  '2026-03-17T05:52:08.866748+00:00', '2026-03-17T05:52:08.866748+00:00'
);
INSERT INTO trends (country_id, category_id, name, description, image_url, heat_score, heat_status, search_score, social_score, ecommerce_score, news_score, tags, source_urls, first_detected_at, last_updated_at) VALUES (
  (SELECT id FROM countries WHERE code='KR'),
  (SELECT id FROM categories WHERE slug='products'),
  '2026 이기적 SNS광고마케터 1급 기본서', '판매처: YES24 | 가격: ₩16,000', 'https://encrypted-tbn1.gstatic.com/shopping?q=tbn:ANd9GcRXeE4VsZH3UlMSHntN9IwW-2oMNF6WaosG21O-4lm3zGA0bve3WX9ofhI2eeQ4dyKF1A0UPSFKz5mpNIqPu0zKXlZYh6wC1OCxijh9UkJc',
  100, 'rising',
  95, 85, 100, 75,
  ARRAY['YES24','₩16,000'], ARRAY['https://www.google.com/search?ibp=oshop&q=2026 인기 상품 핫템 추천&prds=catalogid:2785868461983576849,headlineOfferDocid:8538513823588419535,imageDocid:16811107992787151729,gpcid:5131276768980438895,mid:576462900110036814,pvt:hg&hl=ko&gl=kr&udm=28'],
  '2026-03-17T05:52:08.866748+00:00', '2026-03-17T05:52:08.866748+00:00'
);
INSERT INTO trends (country_id, category_id, name, description, image_url, heat_score, heat_status, search_score, social_score, ecommerce_score, news_score, tags, source_urls, first_detected_at, last_updated_at) VALUES (
  (SELECT id FROM countries WHERE code='KR'),
  (SELECT id FROM categories WHERE slug='products'),
  '2026 이기적 프로그래밍기능사 필기 기출 900제', '판매처: 알라딘 인터넷서점 | 가격: ₩15,300', 'https://encrypted-tbn0.gstatic.com/shopping?q=tbn:ANd9GcRBGGnaMwczu0-Rnf5sgtDfUn8-9uneh4v7plLccUjGhPlZLmh7S3dfilcXMQJTXZkIEyNCGaVbylSmSc3AI16GrS15JFzH',
  97, 'rising',
  92, 82, 97, 72,
  ARRAY['알라딘 인터넷서점','₩15,300'], ARRAY['https://www.google.com/search?ibp=oshop&q=2026 인기 상품 핫템 추천&prds=catalogid:2591689376278845086,headlineOfferDocid:16474291316568763817,imageDocid:5256423771128386872,gpcid:3460459743713142214,mid:576462882311749706,pvt:hg&hl=ko&gl=kr&udm=28'],
  '2026-03-17T05:52:08.866748+00:00', '2026-03-17T05:52:08.866748+00:00'
);
INSERT INTO trends (country_id, category_id, name, description, image_url, heat_score, heat_status, search_score, social_score, ecommerce_score, news_score, tags, source_urls, first_detected_at, last_updated_at) VALUES (
  (SELECT id FROM countries WHERE code='KR'),
  (SELECT id FROM categories WHERE slug='products'),
  'eBook 2026 수능 대비 자이스토리 생활과 윤리 [ 스마트한 PDF 필기 기능을 사용해 보세요! ]', '판매처: YES24 | 가격: ₩19,800', 'https://encrypted-tbn1.gstatic.com/shopping?q=tbn:ANd9GcQ4QwSb1-CykzzSG_Ioi0SMLqAOnvqPXYKtPx4nYx3bAUNHhWAwEXx7FkRUduXxa2n171RsmxGXuJpKLePdKol8CwMcjavcu0i3zwQR4TSFDvKOG16u4UiWVQ',
  95, 'rising',
  90, 80, 95, 70,
  ARRAY['YES24','₩19,800'], ARRAY['https://www.google.com/search?ibp=oshop&q=2026 인기 상품 핫템 추천&prds=productid:2515742274132659750,headlineOfferDocid:2515742274132659750,imageDocid:17791824380368203397,pvt:hg&hl=ko&gl=kr&udm=28'],
  '2026-03-17T05:52:08.866748+00:00', '2026-03-17T05:52:08.866748+00:00'
);
INSERT INTO trends (country_id, category_id, name, description, image_url, heat_score, heat_status, search_score, social_score, ecommerce_score, news_score, tags, source_urls, first_detected_at, last_updated_at) VALUES (
  (SELECT id FROM countries WHERE code='KR'),
  (SELECT id FROM categories WHERE slug='products'),
  '[핫딜] 2026년 신형 데이비드 투어 제로토크 퍼터 제로퍼터', '판매처: 딜팡 | 가격: ₩317,000', 'https://encrypted-tbn1.gstatic.com/shopping?q=tbn:ANd9GcTPLjl5hQwvKUZxyVZlFWa5k695is6bN5UczZo0ThiIG-PdzSxbTx4iQwdr9us1Yv_m3E4TMV0FX4kGzLg_uFpFEnG8ehjFTnYpTngAaUdmYPuI77v5HBLD',
  92, 'rising',
  87, 77, 92, 67,
  ARRAY['딜팡','₩317,000'], ARRAY['https://www.google.com/search?ibp=oshop&q=2026 인기 상품 핫템 추천&prds=productid:8468767137558439910,headlineOfferDocid:8468767137558439910,imageDocid:14730676604789780949,pvt:hg&hl=ko&gl=kr&udm=28'],
  '2026-03-17T05:52:08.866748+00:00', '2026-03-17T05:52:08.866748+00:00'
);
INSERT INTO trends (country_id, category_id, name, description, image_url, heat_score, heat_status, search_score, social_score, ecommerce_score, news_score, tags, source_urls, first_detected_at, last_updated_at) VALUES (
  (SELECT id FROM countries WHERE code='KR'),
  (SELECT id FROM categories WHERE slug='products'),
  'eBook 2026 수능 대비 자이스토리 고3 확률과 통계 [ 스마트한 PDF 필기 기능을 사용해 보세요! ]', '판매처: YES24 | 가격: ₩18,900', 'https://encrypted-tbn0.gstatic.com/shopping?q=tbn:ANd9GcRkVXcYK9vrL5nAEgLAIfZ0K9h1TOtvtrbOqHUdibcX8P2_ep4ZWEwJkR68Lprtqn4V8IMQcnPNDMGFeHEQHyAW13ZNAnh1iOo3Xg5npcdu5MGZboIRxNC6Xw',
  90, 'rising',
  85, 75, 90, 65,
  ARRAY['YES24','₩18,900'], ARRAY['https://www.google.com/search?ibp=oshop&q=2026 인기 상품 핫템 추천&prds=productid:16880838850451316707,headlineOfferDocid:16880838850451316707,imageDocid:12148780066061305628,pvt:hg&hl=ko&gl=kr&udm=28'],
  '2026-03-17T05:52:08.866748+00:00', '2026-03-17T05:52:08.866748+00:00'
);
INSERT INTO trends (country_id, category_id, name, description, image_url, heat_score, heat_status, search_score, social_score, ecommerce_score, news_score, tags, source_urls, first_detected_at, last_updated_at) VALUES (
  (SELECT id FROM countries WHERE code='KR'),
  (SELECT id FROM categories WHERE slug='products'),
  '2026 알기 쉬운 변리사 물리공식', '판매처: 알라딘 인터넷서점 | 가격: ₩9,000', 'https://encrypted-tbn2.gstatic.com/shopping?q=tbn:ANd9GcROxxZYpGtBh4SbZ4awaTotCKdX9QG7tTnlppnEARBeM_JdH7L2N7B__Bf2mmP_qGuRa_a_B64fLXkzW_dMtBWTwL7A28mE',
  87, 'steady',
  82, 72, 87, 62,
  ARRAY['알라딘 인터넷서점','₩9,000'], ARRAY['https://www.google.com/search?ibp=oshop&q=2026 인기 상품 핫템 추천&prds=catalogid:7130365686429130038,headlineOfferDocid:12580578529823882119,imageDocid:16964258367090218658,gpcid:8391193731627537703,mid:576462847080878393,pvt:hg&hl=ko&gl=kr&udm=28'],
  '2026-03-17T05:52:08.866748+00:00', '2026-03-17T05:52:08.866748+00:00'
);
INSERT INTO trends (country_id, category_id, name, description, image_url, heat_score, heat_status, search_score, social_score, ecommerce_score, news_score, tags, source_urls, first_detected_at, last_updated_at) VALUES (
  (SELECT id FROM countries WHERE code='KR'),
  (SELECT id FROM categories WHERE slug='products'),
  '2026 에듀윌 KBS한국어능력시험 한권끝장+무료특강', '판매처: YES24 | 가격: ₩31,500', 'https://encrypted-tbn0.gstatic.com/shopping?q=tbn:ANd9GcRdJhUUi2Zwinn-xeCl26xtE57F6rfpt5LzPZcV7C-Fq_dP0KvdlEFRA6TXGUXg9uSACqg7CPg09_bCkBKnYHEPf2-uCQOnF4FwNOOeQEIQLYE8svjOKrWq',
  85, 'steady',
  80, 70, 85, 60,
  ARRAY['YES24','₩31,500'], ARRAY['https://www.google.com/search?ibp=oshop&q=2026 인기 상품 핫템 추천&prds=productid:6737341543461086249,headlineOfferDocid:6737341543461086249,imageDocid:13859820935519127232,pvt:hg&hl=ko&gl=kr&udm=28'],
  '2026-03-17T05:52:08.866748+00:00', '2026-03-17T05:52:08.866748+00:00'
);
INSERT INTO trends (country_id, category_id, name, description, image_url, heat_score, heat_status, search_score, social_score, ecommerce_score, news_score, tags, source_urls, first_detected_at, last_updated_at) VALUES (
  (SELECT id FROM countries WHERE code='KR'),
  (SELECT id FROM categories WHERE slug='products'),
  '하기스 2026 매직컴포트 팬티기저귀 특대형 5단계(공용) 38매', '판매처: Homeplus | 가격: ₩38,400', 'https://encrypted-tbn1.gstatic.com/shopping?q=tbn:ANd9GcTlzDnSgmbV2GrDEItsVOjZ6FTWwRq-eZ6rMzywOqs-xnwf3JdXNEeowYMmGUPlfNPKLLiE-fti4vgOtd7BjgnWm8Y_HuEqdwIbXttFM3obX7qe_b1fcYe9',
  82, 'steady',
  77, 67, 82, 57,
  ARRAY['Homeplus','₩38,400'], ARRAY['https://www.google.com/search?ibp=oshop&q=2026 인기 상품 핫템 추천&prds=productid:6329438656156835921,headlineOfferDocid:6329438656156835921,imageDocid:6904624787282426701,pvt:hg&hl=ko&gl=kr&udm=28'],
  '2026-03-17T05:52:08.866748+00:00', '2026-03-17T05:52:08.866748+00:00'
);
INSERT INTO trends (country_id, category_id, name, description, image_url, heat_score, heat_status, search_score, social_score, ecommerce_score, news_score, tags, source_urls, first_detected_at, last_updated_at) VALUES (
  (SELECT id FROM countries WHERE code='KR'),
  (SELECT id FROM categories WHERE slug='products'),
  '이기적 검색광고마케터 1급 기본서(2026)', '판매처: 영풍문고 | 가격: ₩18,900', 'https://encrypted-tbn3.gstatic.com/shopping?q=tbn:ANd9GcRpKXt1_jk5WBxMWJcJfeU2Db322nkru0MG8ehxyJBcuxOwhCLZDlAM610mBTogRs9z-GwdQp5xhoBrsX4wf_wJXKWtZFwsSio3H2rqSINu1CG8H_YucI_W',
  80, 'steady',
  75, 65, 80, 55,
  ARRAY['영풍문고','₩18,900'], ARRAY['https://www.google.com/search?ibp=oshop&q=2026 인기 상품 핫템 추천&prds=catalogid:13290265250618771120,headlineOfferDocid:14555499891390706699,imageDocid:16802093976395402287,gpcid:17339438650076707177,mid:576462531580826468,pvt:hg&hl=ko&gl=kr&udm=28'],
  '2026-03-17T05:52:08.866748+00:00', '2026-03-17T05:52:08.866748+00:00'
);
INSERT INTO trends (country_id, category_id, name, description, image_url, heat_score, heat_status, search_score, social_score, ecommerce_score, news_score, tags, source_urls, first_detected_at, last_updated_at) VALUES (
  (SELECT id FROM countries WHERE code='KR'),
  (SELECT id FROM categories WHERE slug='products'),
  '2026 심슨 전략서 + 암기 노트 세트 - 전2권', '판매처: 알라딘 인터넷서점 | 가격: ₩29,700', 'https://encrypted-tbn0.gstatic.com/shopping?q=tbn:ANd9GcQnxIgS1z9uZ_kqkgcmG-YUWOnxfS4irrPVL3_80EIyt4nK5ZoHMcql1dx5SupiBOYa099I2uVrzsMrOGBWP1egv4BRE0ekPA',
  77, 'steady',
  72, 62, 77, 52,
  ARRAY['알라딘 인터넷서점','₩29,700'], ARRAY['https://www.google.com/search?ibp=oshop&q=2026 인기 상품 핫템 추천&prds=catalogid:2971180297891977674,headlineOfferDocid:8987546938010587437,imageDocid:13223691810407881020,gpcid:3605385023195556765,mid:576462846932934534,pvt:hg&hl=ko&gl=kr&udm=28'],
  '2026-03-17T05:52:08.866748+00:00', '2026-03-17T05:52:08.866748+00:00'
);
INSERT INTO trends (country_id, category_id, name, description, image_url, heat_score, heat_status, search_score, social_score, ecommerce_score, news_score, tags, source_urls, first_detected_at, last_updated_at) VALUES (
  (SELECT id FROM countries WHERE code='KR'),
  (SELECT id FROM categories WHERE slug='products'),
  '2026 킬러 없는 모의고사 수학 (2025년)', '판매처: YES24 | 가격: ₩22,320', 'https://encrypted-tbn2.gstatic.com/shopping?q=tbn:ANd9GcQb3EiDfI7GbcR6M-m-IM2Qf_nH7qkpXlP_JcvWaGjvRxusASbbu_enNbLTkUI3r1PjTEWDpnQzIBWgwCCldfUbqSpwdx1X4w5a-pjO_q98LzInP8gXT_rs7g',
  75, 'steady',
  70, 60, 75, 50,
  ARRAY['YES24','₩22,320'], ARRAY['https://www.google.com/search?ibp=oshop&q=2026 인기 상품 핫템 추천&prds=catalogid:640524371192842995,headlineOfferDocid:9642792708376153912,imageDocid:10179924104522784582,gpcid:9067141525028907760,mid:576462900096642248,pvt:hg&hl=ko&gl=kr&udm=28'],
  '2026-03-17T05:52:08.866748+00:00', '2026-03-17T05:52:08.866748+00:00'
);
INSERT INTO trends (country_id, category_id, name, description, image_url, heat_score, heat_status, search_score, social_score, ecommerce_score, news_score, tags, source_urls, first_detected_at, last_updated_at) VALUES (
  (SELECT id FROM countries WHERE code='KR'),
  (SELECT id FROM categories WHERE slug='products'),
  '2026 단기완성 민법 1 (민법총칙·물권법)', '판매처: yongbong books | 가격: ₩35,340', 'https://encrypted-tbn3.gstatic.com/shopping?q=tbn:ANd9GcQsohb3DeN_wtog87JIC54Ooz-E5JWB7B0qLGOrVx8rCID7mmtx6F5ode5AhyLTvOWbZlYmoAYGRCQHrddfdHW76_B2DrjDRw',
  72, 'steady',
  67, 57, 72, 47,
  ARRAY['yongbong books','₩35,340'], ARRAY['https://www.google.com/search?ibp=oshop&q=2026 인기 상품 핫템 추천&prds=catalogid:17974315264180289224,headlineOfferDocid:17551821775352099607,imageDocid:12273037832743751827,gpcid:14614044265458413449,mid:576462849171790827,pvt:hg&hl=ko&gl=kr&udm=28'],
  '2026-03-17T05:52:08.866748+00:00', '2026-03-17T05:52:08.866748+00:00'
);
INSERT INTO trends (country_id, category_id, name, description, image_url, heat_score, heat_status, search_score, social_score, ecommerce_score, news_score, tags, source_urls, first_detected_at, last_updated_at) VALUES (
  (SELECT id FROM countries WHERE code='KR'),
  (SELECT id FROM categories WHERE slug='products'),
  '2026 에듀윌 KBS한국어능력시험 한권끝장 + 무료특강', '판매처: 웅진 바로보네 | 가격: ₩31,500', 'https://encrypted-tbn3.gstatic.com/shopping?q=tbn:ANd9GcQPW9W6AeoueXu84I1WdXhXvYA0X2n3YNPQAtOhllzDhocrDxwuIDUwmLdelclCxojAGwmc0Gxz1nEmBgFyMwdAPy5mEcvT-Qhg6Djmu7ug7egOjjpWkc8O',
  70, 'steady',
  65, 55, 70, 45,
  ARRAY['웅진 바로보네','₩31,500'], ARRAY['https://www.google.com/search?ibp=oshop&q=2026 인기 상품 핫템 추천&prds=productid:1100427207578282194,headlineOfferDocid:1100427207578282194,imageDocid:13297412690068288495,pvt:hg&hl=ko&gl=kr&udm=28'],
  '2026-03-17T05:52:08.866748+00:00', '2026-03-17T05:52:08.866748+00:00'
);
INSERT INTO trends (country_id, category_id, name, description, image_url, heat_score, heat_status, search_score, social_score, ecommerce_score, news_score, tags, source_urls, first_detected_at, last_updated_at) VALUES (
  (SELECT id FROM countries WHERE code='KR'),
  (SELECT id FROM categories WHERE slug='products'),
  '2026 시대에듀 유튜브로 쉽게 끝내는 은행권 NCS 필기시험 통합기본서', '판매처: YES24 | 가격: ₩24,300', 'https://encrypted-tbn1.gstatic.com/shopping?q=tbn:ANd9GcSOtEDeoc33VwQ7SmG-3VV0y39eM0XTwFqb36egmBTaAdtuwrnVqSJMawEr8cjEhhRuC18KcqUY_vbzmtRU7TfjlPEmbERNlGM505JTASlX5_89e0lWkggH-g',
  67, 'steady',
  62, 52, 67, 42,
  ARRAY['YES24','₩24,300'], ARRAY['https://www.google.com/search?ibp=oshop&q=2026 인기 상품 핫템 추천&prds=catalogid:17886286141494729881,headlineOfferDocid:1663874577762716900,imageDocid:9473050372662489577,gpcid:16833827560949181207,mid:576462525347545846,pvt:hg&hl=ko&gl=kr&udm=28'],
  '2026-03-17T05:52:08.866748+00:00', '2026-03-17T05:52:08.866748+00:00'
);
INSERT INTO trends (country_id, category_id, name, description, image_url, heat_score, heat_status, search_score, social_score, ecommerce_score, news_score, tags, source_urls, first_detected_at, last_updated_at) VALUES (
  (SELECT id FROM countries WHERE code='KR'),
  (SELECT id FROM categories WHERE slug='products'),
  '2026 대기환경기사 필기+과년도+무료동영상', '판매처: 알라딘 인터넷서점 | 가격: ₩37,800', 'https://encrypted-tbn3.gstatic.com/shopping?q=tbn:ANd9GcStJhx9179MN0FVcs1pWVe6JUhPLzxZk6aotLbbTT4VKWxfOR3jMmnq-XC2irSk2VaHXsLQkO5aFBR9qYr8HyahUJWAVw4i',
  65, 'steady',
  60, 50, 65, 40,
  ARRAY['알라딘 인터넷서점','₩37,800'], ARRAY['https://www.google.com/search?ibp=oshop&q=2026 인기 상품 핫템 추천&prds=catalogid:17009241021164868090,headlineOfferDocid:14954371782746178418,imageDocid:3096676392393562167,gpcid:6011600672871140848,mid:576462900400310321,pvt:hg&hl=ko&gl=kr&udm=28'],
  '2026-03-17T05:52:08.866748+00:00', '2026-03-17T05:52:08.866748+00:00'
);
INSERT INTO trends (country_id, category_id, name, description, image_url, heat_score, heat_status, search_score, social_score, ecommerce_score, news_score, tags, source_urls, first_detected_at, last_updated_at) VALUES (
  (SELECT id FROM countries WHERE code='KR'),
  (SELECT id FROM categories WHERE slug='food'),
  '하기스 2026 매직컴포트 팬티기저귀 특대형 5단계(공용) 38매', '판매처: Homeplus | 가격: ₩38,400', 'https://encrypted-tbn1.gstatic.com/shopping?q=tbn:ANd9GcTlzDnSgmbV2GrDEItsVOjZ6FTWwRq-eZ6rMzywOqs-xnwf3JdXNEeowYMmGUPlfNPKLLiE-fti4vgOtd7BjgnWm8Y_HuEqdwIbXttFM3obX7qe_b1fcYe9',
  100, 'rising',
  95, 85, 100, 75,
  ARRAY['Homeplus','₩38,400'], ARRAY['https://www.google.com/search?ibp=oshop&q=2026 인기 음식 디저트 간식 트렌드&prds=productid:6329438656156835921,headlineOfferDocid:6329438656156835921,imageDocid:6904624787282426701,pvt:hg&hl=ko&gl=kr&udm=28'],
  '2026-03-17T05:52:08.866748+00:00', '2026-03-17T05:52:08.866748+00:00'
);
INSERT INTO trends (country_id, category_id, name, description, image_url, heat_score, heat_status, search_score, social_score, ecommerce_score, news_score, tags, source_urls, first_detected_at, last_updated_at) VALUES (
  (SELECT id FROM countries WHERE code='KR'),
  (SELECT id FROM categories WHERE slug='food'),
  '[CD] 2026 전국 학교 주소록 CD - CD-ROM 1장', '판매처: 알라딘 인터넷서점 | 가격: ₩63,000', 'https://encrypted-tbn3.gstatic.com/shopping?q=tbn:ANd9GcTUT9VsZbNXjWDYBtB5Pu3Wkjdn0Ve24PJNxwfrfGu9TprIu5VxoeWP0AzXWABWuiE8-qYQUaFLMeFkTcTeN4sQyJbMvr8e',
  97, 'rising',
  92, 82, 97, 72,
  ARRAY['알라딘 인터넷서점','₩63,000'], ARRAY['https://www.google.com/search?ibp=oshop&q=2026 인기 음식 디저트 간식 트렌드&prds=catalogid:8791298434309884321,headlineOfferDocid:16104491270852319526,imageDocid:3516184704976162147,gpcid:16136219927660773300,mid:576462867999452530,pvt:hg&hl=ko&gl=kr&udm=28'],
  '2026-03-17T05:52:08.866748+00:00', '2026-03-17T05:52:08.866748+00:00'
);
INSERT INTO trends (country_id, category_id, name, description, image_url, heat_score, heat_status, search_score, social_score, ecommerce_score, news_score, tags, source_urls, first_detected_at, last_updated_at) VALUES (
  (SELECT id FROM countries WHERE code='KR'),
  (SELECT id FROM categories WHERE slug='food'),
  '쏘렌토 2026 프레스티지 계기판 내비게이션 일체형 저반사 액정보호필름', '판매처: 폰트리 | 가격: ₩35,800', 'https://encrypted-tbn0.gstatic.com/shopping?q=tbn:ANd9GcTOcmkySnjFu1afPCimFKI7p-KXy3b_iMEY1Ss8LVEc3yLNpxCRnSqyJWUU9WxrcsOZhq8UF-Dip-hWW2lGUeTDTsmqwaQD8MfgSf_npbNXUgh30DNIQqYSAA',
  95, 'rising',
  90, 80, 95, 70,
  ARRAY['폰트리','₩35,800'], ARRAY['https://www.google.com/search?ibp=oshop&q=2026 인기 음식 디저트 간식 트렌드&prds=productid:15687036901666393899,headlineOfferDocid:15687036901666393899,imageDocid:484047886073507676,pvt:hg&hl=ko&gl=kr&udm=28'],
  '2026-03-17T05:52:08.866748+00:00', '2026-03-17T05:52:08.866748+00:00'
);
INSERT INTO trends (country_id, category_id, name, description, image_url, heat_score, heat_status, search_score, social_score, ecommerce_score, news_score, tags, source_urls, first_detected_at, last_updated_at) VALUES (
  (SELECT id FROM countries WHERE code='KR'),
  (SELECT id FROM categories WHERE slug='food'),
  '2026 마더텅 수능기출문제집 물리학 1 (2025년)', '판매처: YES24 | 가격: ₩17,030', 'https://encrypted-tbn3.gstatic.com/shopping?q=tbn:ANd9GcRi3xHp5uVTAycMrFTWylTcXpUu_kp9Vy6Mh6iYhy-tgtL6L_uZvOT3qXBEA2dJLrf9Uh1up591PWx1_Vsgdzq7i1ZHE0-r',
  92, 'rising',
  87, 77, 92, 67,
  ARRAY['YES24','₩17,030'], ARRAY['https://www.google.com/search?ibp=oshop&q=2026 인기 음식 디저트 간식 트렌드&prds=catalogid:3850494209487994225,headlineOfferDocid:9678076147488256760,imageDocid:5121439694298656895,gpcid:3245539899645936042,mid:576462846997051910,pvt:hg&hl=ko&gl=kr&udm=28'],
  '2026-03-17T05:52:08.866748+00:00', '2026-03-17T05:52:08.866748+00:00'
);
INSERT INTO trends (country_id, category_id, name, description, image_url, heat_score, heat_status, search_score, social_score, ecommerce_score, news_score, tags, source_urls, first_detected_at, last_updated_at) VALUES (
  (SELECT id FROM countries WHERE code='KR'),
  (SELECT id FROM categories WHERE slug='food'),
  '하기스 2026 매직컴포트 팬티기저귀 대형 4단계(공용) 46매', '판매처: Homeplus | 가격: ₩38,400', 'https://encrypted-tbn3.gstatic.com/shopping?q=tbn:ANd9GcSKhZaRzEqy7s4V9xyCkY0nWtDcRnQ2-dRoUS5bCNlRwwD_uLyOq9M9BTOSCvuHC9kJHIcpNLYq2C_6YuHwjm-4_XZZf-YqCblG-nXI8TRm7-jbuJFPmyCy',
  90, 'rising',
  85, 75, 90, 65,
  ARRAY['Homeplus','₩38,400'], ARRAY['https://www.google.com/search?ibp=oshop&q=2026 인기 음식 디저트 간식 트렌드&prds=productid:9601729729850461416,headlineOfferDocid:9601729729850461416,imageDocid:3023999009362973391,pvt:hg&hl=ko&gl=kr&udm=28'],
  '2026-03-17T05:52:08.866748+00:00', '2026-03-17T05:52:08.866748+00:00'
);
INSERT INTO trends (country_id, category_id, name, description, image_url, heat_score, heat_status, search_score, social_score, ecommerce_score, news_score, tags, source_urls, first_detected_at, last_updated_at) VALUES (
  (SELECT id FROM countries WHERE code='KR'),
  (SELECT id FROM categories WHERE slug='food'),
  '2026 오피셜 B5 먼슬리 다이어리 업무용', '판매처: 알라딘 인터넷서점 | 가격: ₩14,000', 'https://encrypted-tbn2.gstatic.com/shopping?q=tbn:ANd9GcSL4z-c7yPOXtT4JwY6U-xddTqB_rWbXW3eWKaJ6AkJtZgTFYtytX--WNYXE4LNy1y-OYcWbJJua5UUDBttm8yWH90MHd8J',
  87, 'steady',
  82, 72, 87, 62,
  ARRAY['알라딘 인터넷서점','₩14,000'], ARRAY['https://www.google.com/search?ibp=oshop&q=2026 인기 음식 디저트 간식 트렌드&prds=catalogid:15674668071850557435,headlineOfferDocid:8094232475144780448,imageDocid:14783380536267808662,gpcid:15244216181250109235,mid:576462884313710248,pvt:hg&hl=ko&gl=kr&udm=28'],
  '2026-03-17T05:52:08.866748+00:00', '2026-03-17T05:52:08.866748+00:00'
);
INSERT INTO trends (country_id, category_id, name, description, image_url, heat_score, heat_status, search_score, social_score, ecommerce_score, news_score, tags, source_urls, first_detected_at, last_updated_at) VALUES (
  (SELECT id FROM countries WHERE code='KR'),
  (SELECT id FROM categories WHERE slug='food'),
  '2026 마더텅 수능기출문제집 정치와 법 (2025년)', '판매처: 쿠팡 | 가격: ₩19,710', 'https://encrypted-tbn3.gstatic.com/shopping?q=tbn:ANd9GcQXqc-RzKEr4Mn8gyeDTU3qN5EE-T-OBKCuzZbTVk9VaXr3aUFGDuxlexWRbC-u2_3z8Fg-UqKPw402XWpL_7lrr5OTLHbeOaRduDmel0gsm0hF9cFW-Q0t',
  85, 'steady',
  80, 70, 85, 60,
  ARRAY['쿠팡','₩19,710'], ARRAY['https://www.google.com/search?ibp=oshop&q=2026 인기 음식 디저트 간식 트렌드&prds=catalogid:9603588343083297178,headlineOfferDocid:14865684934870346092,imageDocid:11530219620600315527,gpcid:5784295096361800592,mid:576462820470420908,pvt:hg&hl=ko&gl=kr&udm=28'],
  '2026-03-17T05:52:08.866748+00:00', '2026-03-17T05:52:08.866748+00:00'
);
INSERT INTO trends (country_id, category_id, name, description, image_url, heat_score, heat_status, search_score, social_score, ecommerce_score, news_score, tags, source_urls, first_detected_at, last_updated_at) VALUES (
  (SELECT id FROM countries WHERE code='KR'),
  (SELECT id FROM categories WHERE slug='food'),
  '2026 해커스 한 권으로 끝내는 취업 기출 금융경제 상식', '판매처: 웅진 바로보네 | 가격: ₩24,300', 'https://encrypted-tbn3.gstatic.com/shopping?q=tbn:ANd9GcRl2_WLnXM53G59kn2pka5EemJ73ukD8DML9zXvW_2hBBxCa_IW9fXJEiRoCqebTzlVAEqakSdto5BUWcvjtLU7VBWtb-bTVNG1gvHK3fKZUwi-W1pz04UX',
  82, 'steady',
  77, 67, 82, 57,
  ARRAY['웅진 바로보네','₩24,300'], ARRAY['https://www.google.com/search?ibp=oshop&q=2026 인기 음식 디저트 간식 트렌드&prds=catalogid:13364969707648513624,headlineOfferDocid:5171097440184108715,imageDocid:18361181406000496551,gpcid:18178025753118684089,mid:576462875332271722,pvt:hg&hl=ko&gl=kr&udm=28'],
  '2026-03-17T05:52:08.866748+00:00', '2026-03-17T05:52:08.866748+00:00'
);
INSERT INTO trends (country_id, category_id, name, description, image_url, heat_score, heat_status, search_score, social_score, ecommerce_score, news_score, tags, source_urls, first_detected_at, last_updated_at) VALUES (
  (SELECT id FROM countries WHERE code='KR'),
  (SELECT id FROM categories WHERE slug='food'),
  '2026 DIET 이상헌 행정학 4.0 기출 ALL CARE', '판매처: yongbong books | 가격: ₩28,800', 'https://encrypted-tbn1.gstatic.com/shopping?q=tbn:ANd9GcRtOEUMqaIAHLHpazo14lC6tT8BAHWC-4UwEKgvs0A4rWqEGqO3uPOF3A-bFTR_1gj10ZLJui2JaEa4tGvDI0_gsPFXllbE',
  80, 'steady',
  75, 65, 80, 55,
  ARRAY['yongbong books','₩28,800'], ARRAY['https://www.google.com/search?ibp=oshop&q=2026 인기 음식 디저트 간식 트렌드&prds=catalogid:8586483473482406141,headlineOfferDocid:6769171827496042769,imageDocid:5229364743515335457,gpcid:6290159481203622268,mid:576462900233200576,pvt:hg&hl=ko&gl=kr&udm=28'],
  '2026-03-17T05:52:08.866748+00:00', '2026-03-17T05:52:08.866748+00:00'
);
INSERT INTO trends (country_id, category_id, name, description, image_url, heat_score, heat_status, search_score, social_score, ecommerce_score, news_score, tags, source_urls, first_detected_at, last_updated_at) VALUES (
  (SELECT id FROM countries WHERE code='KR'),
  (SELECT id FROM categories WHERE slug='food'),
  '2026 해커스 사회조사분석사 2급 필기 한권합격 이론+최신기출+핵심노트', '판매처: 알라딘 인터넷서점 | 가격: ₩30,510', 'https://encrypted-tbn2.gstatic.com/shopping?q=tbn:ANd9GcR9-5rtDaM-btch7mqKKz3sABm3MgnumqRo2Patdhz9LXrWfadiPgx7NOR_qe_gGCotCEuAj5T_AMtNclKeaAYtNy52euB5gQ',
  77, 'steady',
  72, 62, 77, 52,
  ARRAY['알라딘 인터넷서점','₩30,510'], ARRAY['https://www.google.com/search?ibp=oshop&q=2026 인기 음식 디저트 간식 트렌드&prds=catalogid:6688696373261443760,headlineOfferDocid:4747556767215069065,imageDocid:10497255181374952230,gpcid:10271356182964899852,mid:576462871809599830,pvt:hg&hl=ko&gl=kr&udm=28'],
  '2026-03-17T05:52:08.866748+00:00', '2026-03-17T05:52:08.866748+00:00'
);
INSERT INTO trends (country_id, category_id, name, description, image_url, heat_score, heat_status, search_score, social_score, ecommerce_score, news_score, tags, source_urls, first_detected_at, last_updated_at) VALUES (
  (SELECT id FROM countries WHERE code='KR'),
  (SELECT id FROM categories WHERE slug='food'),
  '2026년 디즈니 클래식 벽걸이 달력', '판매처: YES24 | 가격: ₩10,720', 'https://encrypted-tbn3.gstatic.com/shopping?q=tbn:ANd9GcQ8CF0TiSCgBt408jwYcI8i6f7bA_Ja6ZuEmmpRoUGvf7W1pl-ZlKxtkX7pKrGFkNnLXdgoJCV9wfoBCx7h8VutRFo1u5_rtHjWtB_lAHGSAAiU1M_9F8UkKA',
  75, 'steady',
  70, 60, 75, 50,
  ARRAY['YES24','₩10,720'], ARRAY['https://www.google.com/search?ibp=oshop&q=2026 인기 음식 디저트 간식 트렌드&prds=catalogid:2502577826476232496,headlineOfferDocid:6101197891041728296,imageDocid:18248522912271671971,gpcid:11254963730509438906,mid:576462899966613111,pvt:hg&hl=ko&gl=kr&udm=28'],
  '2026-03-17T05:52:08.866748+00:00', '2026-03-17T05:52:08.866748+00:00'
);
INSERT INTO trends (country_id, category_id, name, description, image_url, heat_score, heat_status, search_score, social_score, ecommerce_score, news_score, tags, source_urls, first_detected_at, last_updated_at) VALUES (
  (SELECT id FROM countries WHERE code='KR'),
  (SELECT id FROM categories WHERE slug='food'),
  '2026 시대에듀 공기업 일반상식 단기완성 + 무료동영상 (최신시사 특강)', '판매처: solve.im | 가격: ₩13,230', 'https://encrypted-tbn0.gstatic.com/shopping?q=tbn:ANd9GcRWWrnnLBxsEzmLlF1BLlcEWvCYhvoM8Kfjj_S7IgfvXDC7ZOMpIGoTL2u0O8yH7XgqcnwylM74sMdaA0Stl4a8zWfmg51kVRz1MRSFMxuHqBMS-YmMnWn5hw',
  72, 'steady',
  67, 57, 72, 47,
  ARRAY['solve.im','₩13,230'], ARRAY['https://www.google.com/search?ibp=oshop&q=2026 인기 음식 디저트 간식 트렌드&prds=catalogid:15374073839052402683,headlineOfferDocid:18008643970621466561,imageDocid:16196520546113117440,gpcid:11507524950013132351,mid:576462871033942950,pvt:hg&hl=ko&gl=kr&udm=28'],
  '2026-03-17T05:52:08.866748+00:00', '2026-03-17T05:52:08.866748+00:00'
);
INSERT INTO trends (country_id, category_id, name, description, image_url, heat_score, heat_status, search_score, social_score, ecommerce_score, news_score, tags, source_urls, first_detected_at, last_updated_at) VALUES (
  (SELECT id FROM countries WHERE code='KR'),
  (SELECT id FROM categories WHERE slug='food'),
  'LG 디오스 오브제컬렉션 식기세척기', '판매처: LG전자 | 가격: ₩1,380,000', 'https://encrypted-tbn1.gstatic.com/shopping?q=tbn:ANd9GcTgwyRAxRO1gnk_MSL1FPgStC6dp0ncZyTgxeL4LnTEBssBQBJQZR77e_jcdeSVHeR2p56z_IfsrvPG6FvPYJv8v3OVAWS3',
  70, 'steady',
  65, 55, 70, 45,
  ARRAY['LG전자','₩1,380,000'], ARRAY['https://www.google.com/search?ibp=oshop&q=2026 인기 음식 디저트 간식 트렌드&prds=catalogid:8560285523804044735,headlineOfferDocid:10637586254815740330,imageDocid:16200827567908154745,gpcid:15323917714730244320,pvt:hg&hl=ko&gl=kr&udm=28'],
  '2026-03-17T05:52:08.866748+00:00', '2026-03-17T05:52:08.866748+00:00'
);
INSERT INTO trends (country_id, category_id, name, description, image_url, heat_score, heat_status, search_score, social_score, ecommerce_score, news_score, tags, source_urls, first_detected_at, last_updated_at) VALUES (
  (SELECT id FROM countries WHERE code='KR'),
  (SELECT id FROM categories WHERE slug='food'),
  '2026 최신판 시대에듀 한국수력원자력 통합기본서', '판매처: 알라딘 인터넷서점 | 가격: ₩22,500', 'https://encrypted-tbn1.gstatic.com/shopping?q=tbn:ANd9GcTEOSG472NLkWySyvqoTilURWy-wvrdPcXA66xMxzlk8rrA2Pm5hsiazDC7hjTuYhz5l3JDj3l1c2FCjsb_wvvZ9p-QaZfGNA',
  67, 'steady',
  62, 52, 67, 42,
  ARRAY['알라딘 인터넷서점','₩22,500'], ARRAY['https://www.google.com/search?ibp=oshop&q=2026 인기 음식 디저트 간식 트렌드&prds=catalogid:10628982344570795923,headlineOfferDocid:15931138074369362505,imageDocid:1435306241567994133,gpcid:16408832213686001,mid:576462875110972237,pvt:hg&hl=ko&gl=kr&udm=28'],
  '2026-03-17T05:52:08.866748+00:00', '2026-03-17T05:52:08.866748+00:00'
);
INSERT INTO trends (country_id, category_id, name, description, image_url, heat_score, heat_status, search_score, social_score, ecommerce_score, news_score, tags, source_urls, first_detected_at, last_updated_at) VALUES (
  (SELECT id FROM countries WHERE code='KR'),
  (SELECT id FROM categories WHERE slug='food'),
  '2026 마더텅 수능기출문제집 한국지리 (2025년)', '판매처: 쿠팡 | 가격: ₩19,710', 'https://encrypted-tbn1.gstatic.com/shopping?q=tbn:ANd9GcQeGwpQ6Eki0ma6e65jWt4KwOd8Yih1ymH_W6JVA1K_YkW6iblqyxK7INislmn5aJ0t3Lc98lTF3t9TzJzhf1SGL48pgr2t0faGHp7gnMkVoX_LmnqDuUIC',
  65, 'steady',
  60, 50, 65, 40,
  ARRAY['쿠팡','₩19,710'], ARRAY['https://www.google.com/search?ibp=oshop&q=2026 인기 음식 디저트 간식 트렌드&prds=catalogid:7693386627833330245,headlineOfferDocid:10952450415484079288,imageDocid:18166280120510805925,gpcid:6992634286925075152,mid:576462512461238991,pvt:hg&hl=ko&gl=kr&udm=28'],
  '2026-03-17T05:52:08.866748+00:00', '2026-03-17T05:52:08.866748+00:00'
);
INSERT INTO trends (country_id, category_id, name, description, image_url, heat_score, heat_status, search_score, social_score, ecommerce_score, news_score, tags, source_urls, first_detected_at, last_updated_at) VALUES (
  (SELECT id FROM countries WHERE code='KR'),
  (SELECT id FROM categories WHERE slug='entertainment'),
  '2026 에듀윌 KBS한국어능력시험 한권끝장+무료특강', '판매처: YES24 | 가격: ₩31,500', 'https://encrypted-tbn0.gstatic.com/shopping?q=tbn:ANd9GcRdJhUUi2Zwinn-xeCl26xtE57F6rfpt5LzPZcV7C-Fq_dP0KvdlEFRA6TXGUXg9uSACqg7CPg09_bCkBKnYHEPf2-uCQOnF4FwNOOeQEIQLYE8svjOKrWq',
  100, 'rising',
  95, 85, 100, 75,
  ARRAY['YES24','₩31,500'], ARRAY['https://www.google.com/search?ibp=oshop&q=2026 인기 굿즈 게임 장난감 취미&prds=productid:6737341543461086249,headlineOfferDocid:6737341543461086249,imageDocid:13859820935519127232,pvt:hg&hl=ko&gl=kr&udm=28'],
  '2026-03-17T05:52:08.866748+00:00', '2026-03-17T05:52:08.866748+00:00'
);
INSERT INTO trends (country_id, category_id, name, description, image_url, heat_score, heat_status, search_score, social_score, ecommerce_score, news_score, tags, source_urls, first_detected_at, last_updated_at) VALUES (
  (SELECT id FROM countries WHERE code='KR'),
  (SELECT id FROM categories WHERE slug='entertainment'),
  'MK에디션 CES 2026 - 피지컬 AI의 시대', '판매처: 영풍문고 | 가격: ₩18,000', 'https://encrypted-tbn1.gstatic.com/shopping?q=tbn:ANd9GcSd-juQVKcj7HhEQ4E6xLK7w-vDuSTfLwsbzufFqrsbvwOir1B6xTgduAwZnFI7vOCmMre3sUWEwU0ttPA-7OJKJYl59IlRiZOsYeI87QO1Qm1FjyUTPrRoDQ',
  97, 'rising',
  92, 82, 97, 72,
  ARRAY['영풍문고','₩18,000'], ARRAY['https://www.google.com/search?ibp=oshop&q=2026 인기 굿즈 게임 장난감 취미&prds=catalogid:3485273569594736471,headlineOfferDocid:4814445533808698540,imageDocid:17411415437690352433,gpcid:17718364410873160453,mid:576462537659928023,pvt:hg&hl=ko&gl=kr&udm=28'],
  '2026-03-17T05:52:08.866748+00:00', '2026-03-17T05:52:08.866748+00:00'
);
INSERT INTO trends (country_id, category_id, name, description, image_url, heat_score, heat_status, search_score, social_score, ecommerce_score, news_score, tags, source_urls, first_detected_at, last_updated_at) VALUES (
  (SELECT id FROM countries WHERE code='KR'),
  (SELECT id FROM categories WHERE slug='entertainment'),
  '2026 황남기 경찰헌법 OX 총정리', '판매처: 알라딘 인터넷서점 | 가격: ₩33,250', 'https://encrypted-tbn2.gstatic.com/shopping?q=tbn:ANd9GcTiti7R-8fTj8I5F6PgXCYN64Iswf5tfV1mOA4sIY-pNYWMMg3zWutFm2BeD-487XEYEMpq_GU-L9ztODk_b4bgCF2otxr4Pw',
  95, 'rising',
  90, 80, 95, 70,
  ARRAY['알라딘 인터넷서점','₩33,250'], ARRAY['https://www.google.com/search?ibp=oshop&q=2026 인기 굿즈 게임 장난감 취미&prds=catalogid:6896119405229072051,headlineOfferDocid:17803746342413239885,imageDocid:8308348112196782982,gpcid:13411122464095652854,mid:576462536183770486,pvt:hg&hl=ko&gl=kr&udm=28'],
  '2026-03-17T05:52:08.866748+00:00', '2026-03-17T05:52:08.866748+00:00'
);
INSERT INTO trends (country_id, category_id, name, description, image_url, heat_score, heat_status, search_score, social_score, ecommerce_score, news_score, tags, source_urls, first_detected_at, last_updated_at) VALUES (
  (SELECT id FROM countries WHERE code='KR'),
  (SELECT id FROM categories WHERE slug='entertainment'),
  '[2개 세트] 부드러운 미니치킨까스 [소비기한 2026-05-08]', '판매처: foody-buddy.com | 가격: ₩12,500', 'https://encrypted-tbn1.gstatic.com/shopping?q=tbn:ANd9GcR1GddM3hPWL_MhS0CfTG93HaROvirCy_-YdRybto8ysA4I0mQbU2OL22ZXIcedDN9AGkWcNFgaynO3kx-O7etj7NjHxatf0cs6J_SMyZambDSIX03M3uDgRQ',
  92, 'rising',
  87, 77, 92, 67,
  ARRAY['foody-buddy.com','₩12,500'], ARRAY['https://www.google.com/search?ibp=oshop&q=2026 인기 굿즈 게임 장난감 취미&prds=catalogid:18146369650004719812,headlineOfferDocid:5489495132966316501,imageDocid:13692820885963318873,gpcid:13571037200268830528,mid:576462544195097599,pvt:hg&hl=ko&gl=kr&udm=28'],
  '2026-03-17T05:52:08.866748+00:00', '2026-03-17T05:52:08.866748+00:00'
);
INSERT INTO trends (country_id, category_id, name, description, image_url, heat_score, heat_status, search_score, social_score, ecommerce_score, news_score, tags, source_urls, first_detected_at, last_updated_at) VALUES (
  (SELECT id FROM countries WHERE code='KR'),
  (SELECT id FROM categories WHERE slug='entertainment'),
  '청소년상담사 1급 한권으로 끝내기(2026)', '판매처: yongbong books | 가격: ₩44,100', 'https://encrypted-tbn1.gstatic.com/shopping?q=tbn:ANd9GcRsiQS9GcDgd2R0aBs_YqYVJ1mHeORr1mbAgS9-RjZ1kPHy7ZrtaRJ5EDzWsMWrqnHTT1N43pUJtOjIv0-johw2kOQmajCf',
  90, 'rising',
  85, 75, 90, 65,
  ARRAY['yongbong books','₩44,100'], ARRAY['https://www.google.com/search?ibp=oshop&q=2026 인기 굿즈 게임 장난감 취미&prds=catalogid:10948058901015520956,headlineOfferDocid:6926023256941602769,imageDocid:14541782778587322637,gpcid:15849106014707027328,mid:576462876595075492,pvt:hg&hl=ko&gl=kr&udm=28'],
  '2026-03-17T05:52:08.866748+00:00', '2026-03-17T05:52:08.866748+00:00'
);
INSERT INTO trends (country_id, category_id, name, description, image_url, heat_score, heat_status, search_score, social_score, ecommerce_score, news_score, tags, source_urls, first_detected_at, last_updated_at) VALUES (
  (SELECT id FROM countries WHERE code='KR'),
  (SELECT id FROM categories WHERE slug='entertainment'),
  '2026 수능대비 Xistory 자이스토리 화학 1 (2025년)', '판매처: YES24 | 가격: ₩19,800', 'https://encrypted-tbn1.gstatic.com/shopping?q=tbn:ANd9GcRCgK82fHx6hiBw6a9jMZaf1Ri8aAMOW1rZAwUR8IkyLhnkqc6DfodxGxwdQ-MylJ3g54J464lFq9fbi05wQwWHfKd_6kjX4kjMpG5nbI3sS9KCwauyy38T',
  87, 'steady',
  82, 72, 87, 62,
  ARRAY['YES24','₩19,800'], ARRAY['https://www.google.com/search?ibp=oshop&q=2026 인기 굿즈 게임 장난감 취미&prds=catalogid:4918913179407242470,headlineOfferDocid:6058321650272273801,imageDocid:6518319529855864201,gpcid:3140623626795490663,mid:576462846999388456,pvt:hg&hl=ko&gl=kr&udm=28'],
  '2026-03-17T05:52:08.866748+00:00', '2026-03-17T05:52:08.866748+00:00'
);
INSERT INTO trends (country_id, category_id, name, description, image_url, heat_score, heat_status, search_score, social_score, ecommerce_score, news_score, tags, source_urls, first_detected_at, last_updated_at) VALUES (
  (SELECT id FROM countries WHERE code='KR'),
  (SELECT id FROM categories WHERE slug='entertainment'),
  '2026 에듀윌 KBS한국어능력시험 한권끝장 + 무료특강', '판매처: 웅진 바로보네 | 가격: ₩31,500', 'https://encrypted-tbn3.gstatic.com/shopping?q=tbn:ANd9GcQPW9W6AeoueXu84I1WdXhXvYA0X2n3YNPQAtOhllzDhocrDxwuIDUwmLdelclCxojAGwmc0Gxz1nEmBgFyMwdAPy5mEcvT-Qhg6Djmu7ug7egOjjpWkc8O',
  85, 'steady',
  80, 70, 85, 60,
  ARRAY['웅진 바로보네','₩31,500'], ARRAY['https://www.google.com/search?ibp=oshop&q=2026 인기 굿즈 게임 장난감 취미&prds=productid:1100427207578282194,headlineOfferDocid:1100427207578282194,imageDocid:13297412690068288495,pvt:hg&hl=ko&gl=kr&udm=28'],
  '2026-03-17T05:52:08.866748+00:00', '2026-03-17T05:52:08.866748+00:00'
);
INSERT INTO trends (country_id, category_id, name, description, image_url, heat_score, heat_status, search_score, social_score, ecommerce_score, news_score, tags, source_urls, first_detected_at, last_updated_at) VALUES (
  (SELECT id FROM countries WHERE code='KR'),
  (SELECT id FROM categories WHERE slug='entertainment'),
  '2026 완벽대비 가스기능장 필기', '판매처: 영풍문고 | 가격: ₩36,000', 'https://encrypted-tbn1.gstatic.com/shopping?q=tbn:ANd9GcSVnRE-XxkLZCuxN1_YU8grPk9FWuDHn6OXJx1fO7OwkuwaUO7TETn9W1ndZ4PzeUcSVJ02zozT4K7tZGOEjlvT53yB6CS7miD5nWhVcQdeU97ecu1NuCH6-w',
  82, 'steady',
  77, 67, 82, 57,
  ARRAY['영풍문고','₩36,000'], ARRAY['https://www.google.com/search?ibp=oshop&q=2026 인기 굿즈 게임 장난감 취미&prds=catalogid:13940115520272537835,headlineOfferDocid:8879841092113666281,imageDocid:13530020135548448713,gpcid:16338870789113384490,mid:576462900312986493,pvt:hg&hl=ko&gl=kr&udm=28'],
  '2026-03-17T05:52:08.866748+00:00', '2026-03-17T05:52:08.866748+00:00'
);
INSERT INTO trends (country_id, category_id, name, description, image_url, heat_score, heat_status, search_score, social_score, ecommerce_score, news_score, tags, source_urls, first_detected_at, last_updated_at) VALUES (
  (SELECT id FROM countries WHERE code='KR'),
  (SELECT id FROM categories WHERE slug='entertainment'),
  '2026 하루에 끝장내기 재정학', '판매처: 알라딘 인터넷서점 | 가격: ₩19,000', 'https://encrypted-tbn2.gstatic.com/shopping?q=tbn:ANd9GcRI6HGZ_r0WUylLrWN6ZOBZThJZ_IGl2L9brLLytupVmcPNATg_18AcfaPGHB1iuiXRodVGSODtbdt3DjK2RJI51NVYYXeQQA',
  80, 'steady',
  75, 65, 80, 55,
  ARRAY['알라딘 인터넷서점','₩19,000'], ARRAY['https://www.google.com/search?ibp=oshop&q=2026 인기 굿즈 게임 장난감 취미&prds=catalogid:14393833582215929214,headlineOfferDocid:3329147074060799352,imageDocid:1945173559473719586,gpcid:10008025301488840900,mid:576462523863480849,pvt:hg&hl=ko&gl=kr&udm=28'],
  '2026-03-17T05:52:08.866748+00:00', '2026-03-17T05:52:08.866748+00:00'
);
INSERT INTO trends (country_id, category_id, name, description, image_url, heat_score, heat_status, search_score, social_score, ecommerce_score, news_score, tags, source_urls, first_detected_at, last_updated_at) VALUES (
  (SELECT id FROM countries WHERE code='KR'),
  (SELECT id FROM categories WHERE slug='entertainment'),
  '개정판 | 리얼 스페인 2025~2026', '판매처: YES24 | 가격: ₩16,000', 'https://encrypted-tbn0.gstatic.com/shopping?q=tbn:ANd9GcRMM4h-WOGMSNev-NDv8LFr12Y_fBeRMd4pmdyaS994YU30RBTj4wK2Liu51u0VQpvSYVvtLnNrGBwI6QwMEFcr1lPhMbKInWqmCwPhu4zmFKV7Wo2a6b1n',
  77, 'steady',
  72, 62, 77, 52,
  ARRAY['YES24','₩16,000'], ARRAY['https://www.google.com/search?ibp=oshop&q=2026 인기 굿즈 게임 장난감 취미&prds=catalogid:16500295828140847132,headlineOfferDocid:9808123141692504054,imageDocid:563817223966260076,gpcid:13302412230714189446,mid:576462847231616679,pvt:hg&hl=ko&gl=kr&udm=28'],
  '2026-03-17T05:52:08.866748+00:00', '2026-03-17T05:52:08.866748+00:00'
);
INSERT INTO trends (country_id, category_id, name, description, image_url, heat_score, heat_status, search_score, social_score, ecommerce_score, news_score, tags, source_urls, first_detected_at, last_updated_at) VALUES (
  (SELECT id FROM countries WHERE code='KR'),
  (SELECT id FROM categories WHERE slug='entertainment'),
  '에리트레아 2025-2026 홈 컨셉 축구 유니폼(리베로)', '판매처: fruugo.kr | 가격: ₩69,590', 'https://encrypted-tbn2.gstatic.com/shopping?q=tbn:ANd9GcQ3tVCSrzdK7Sumo-17BdLgx6Ymy62xWunzrYBoZpdprqYBKdrJCVu9RW_Gb5SEcubX_oO_3IZjLOpW1cl6aMUe53KYD1mQ-FqDj95gG4VizJRoQClaJ2HBKQ',
  75, 'steady',
  70, 60, 75, 50,
  ARRAY['fruugo.kr','₩69,590'], ARRAY['https://www.google.com/search?ibp=oshop&q=2026 인기 굿즈 게임 장난감 취미&prds=productid:10838234746368662568,headlineOfferDocid:10838234746368662568,imageDocid:4831594793715230894,pvt:hg&hl=ko&gl=kr&udm=28'],
  '2026-03-17T05:52:08.866748+00:00', '2026-03-17T05:52:08.866748+00:00'
);
INSERT INTO trends (country_id, category_id, name, description, image_url, heat_score, heat_status, search_score, social_score, ecommerce_score, news_score, tags, source_urls, first_detected_at, last_updated_at) VALUES (
  (SELECT id FROM countries WHERE code='KR'),
  (SELECT id FROM categories WHERE slug='entertainment'),
  '2026 수능대비 Xistory 자이스토리 윤리와 사상 (2025년)', '판매처: 쿠팡 | 가격: ₩19,800', 'https://encrypted-tbn3.gstatic.com/shopping?q=tbn:ANd9GcTCdBR00hy6cRVzcyp9QdEu0_jS1w8TpGoh6DexJUnAhrUy51NYT9dUW2X2s6dZA_toEsnJueoIZvT4U924T9cj7HXKZ5BgcQ',
  72, 'steady',
  67, 57, 72, 47,
  ARRAY['쿠팡','₩19,800'], ARRAY['https://www.google.com/search?ibp=oshop&q=2026 인기 굿즈 게임 장난감 취미&prds=catalogid:8351547034535137584,headlineOfferDocid:4620541185999705692,imageDocid:14578696198932209247,gpcid:15557295994927229943,mid:576462848755181158,pvt:hg&hl=ko&gl=kr&udm=28'],
  '2026-03-17T05:52:08.866748+00:00', '2026-03-17T05:52:08.866748+00:00'
);
INSERT INTO trends (country_id, category_id, name, description, image_url, heat_score, heat_status, search_score, social_score, ecommerce_score, news_score, tags, source_urls, first_detected_at, last_updated_at) VALUES (
  (SELECT id FROM countries WHERE code='KR'),
  (SELECT id FROM categories WHERE slug='entertainment'),
  '2026 에듀윌 중졸 검정고시 도덕 기본서 + 무료특강', '판매처: yongbong books | 가격: ₩18,000', 'https://encrypted-tbn0.gstatic.com/shopping?q=tbn:ANd9GcQp7ldRkIZf-wia8ScLdKTy0aPMErrxLoatYygwAla2SHBFEUim-G7Spsh_CFOhabG-NGOmqhSu4nzFNZ7c6rTK_s3NPJDP7A',
  70, 'steady',
  65, 55, 70, 45,
  ARRAY['yongbong books','₩18,000'], ARRAY['https://www.google.com/search?ibp=oshop&q=2026 인기 굿즈 게임 장난감 취미&prds=catalogid:12391634667770431571,headlineOfferDocid:15274457118324999839,imageDocid:7147046736126743852,gpcid:17333889526432367432,mid:576462847136239535,pvt:hg&hl=ko&gl=kr&udm=28'],
  '2026-03-17T05:52:08.866748+00:00', '2026-03-17T05:52:08.866748+00:00'
);
INSERT INTO trends (country_id, category_id, name, description, image_url, heat_score, heat_status, search_score, social_score, ecommerce_score, news_score, tags, source_urls, first_detected_at, last_updated_at) VALUES (
  (SELECT id FROM countries WHERE code='KR'),
  (SELECT id FROM categories WHERE slug='entertainment'),
  '2026 수능대비 Xistory 자이스토리 국어 화법과 작문 실전 고3 (2025년)', '판매처: YES24 | 가격: ₩16,200', 'https://encrypted-tbn0.gstatic.com/shopping?q=tbn:ANd9GcQkfuKgFXJOntQabpmW3Ht3Hp9TvFvWAdYzwqdcr5zs4gitH15GjhHuBmyOsBfw-xYsJunRm0fOWOA2AXbQWYwkINRH7GqzjViz4aGtcEbDxvDdRVkzClf4aA',
  67, 'steady',
  62, 52, 67, 42,
  ARRAY['YES24','₩16,200'], ARRAY['https://www.google.com/search?ibp=oshop&q=2026 인기 굿즈 게임 장난감 취미&prds=catalogid:6666711054115330686,headlineOfferDocid:5052779816205472189,imageDocid:7154359014537711324,gpcid:11428808327543417010,mid:576462900164771327,pvt:hg&hl=ko&gl=kr&udm=28'],
  '2026-03-17T05:52:08.866748+00:00', '2026-03-17T05:52:08.866748+00:00'
);
INSERT INTO trends (country_id, category_id, name, description, image_url, heat_score, heat_status, search_score, social_score, ecommerce_score, news_score, tags, source_urls, first_detected_at, last_updated_at) VALUES (
  (SELECT id FROM countries WHERE code='KR'),
  (SELECT id FROM categories WHERE slug='entertainment'),
  '에듀윌 KBS한국어능력시험 13개년 기출분석으로 2주끝장 + 무료특강(2026)', '판매처: 알라딘 인터넷서점 | 가격: ₩22,500', 'https://encrypted-tbn1.gstatic.com/shopping?q=tbn:ANd9GcRtCgHfBOqnFlH8zjgKffDxm5HmGAr-pvbic63Ac4dzS2OZBTtwRP2ILhEpZZDH0p_L8b4EwycFMZ0BzGojXdtLVjvLlGJHMg',
  65, 'steady',
  60, 50, 65, 40,
  ARRAY['알라딘 인터넷서점','₩22,500'], ARRAY['https://www.google.com/search?ibp=oshop&q=2026 인기 굿즈 게임 장난감 취미&prds=catalogid:8867123342779406092,headlineOfferDocid:7303960324101926373,imageDocid:16629368479860087821,gpcid:17869793193750678313,mid:576462531232414307,pvt:hg&hl=ko&gl=kr&udm=28'],
  '2026-03-17T05:52:08.866748+00:00', '2026-03-17T05:52:08.866748+00:00'
);
INSERT INTO trends (country_id, category_id, name, description, image_url, heat_score, heat_status, search_score, social_score, ecommerce_score, news_score, tags, source_urls, first_detected_at, last_updated_at) VALUES (
  (SELECT id FROM countries WHERE code='US'),
  (SELECT id FROM categories WHERE slug='fashion'),
  'Fashion Nova Ruched Jacquard Pant Set', '판매처: Fashion Nova | 가격: $4.98 | 평점: 5.0 | 리뷰: 2개', 'https://encrypted-tbn0.gstatic.com/shopping?q=tbn:ANd9GcQIwz6F-mxMUjcQeAEmmxB-717CBdw2nSlMajPoVHt5q8elKWhSbHIK921909DXuIZVX7wXbGnFhTTW_aqDmKb7Uq1OhtDDPMEp1tIe0y1o_P9O000WeEJG',
  100, 'rising',
  95, 85, 100, 75,
  ARRAY['Fashion Nova','$4.98','★5.0'], ARRAY['https://www.google.com/search?ibp=oshop&q=trending fashion clothes 2026&prds=catalogid:1512969533115215678,headlineOfferDocid:3311604830974389849,imageDocid:6811733254111002580,rds:PC_16056687256492618242|PROD_PC_16056687256492618242,gpcid:16056687256492618242,mid:576462846862832059,pvt:a&hl=en&gl=us&udm=28'],
  '2026-03-17T05:52:08.866748+00:00', '2026-03-17T05:52:08.866748+00:00'
);
INSERT INTO trends (country_id, category_id, name, description, image_url, heat_score, heat_status, search_score, social_score, ecommerce_score, news_score, tags, source_urls, first_detected_at, last_updated_at) VALUES (
  (SELECT id FROM countries WHERE code='US'),
  (SELECT id FROM categories WHERE slug='fashion'),
  'Veslaya Elegant Commute & Casual All-match', '판매처: Shein | 가격: $12.82', 'https://encrypted-tbn0.gstatic.com/shopping?q=tbn:ANd9GcRzpPD9QIBQz0ACVCS3_yY0FigeYqxar8IkYUYcem_2IBLlzifD9nmzWSV-vgkHxMvW8MYJUoSjNcEEFUeFKn3m6dA0rvTXBzgffyzzOw0',
  97, 'rising',
  92, 82, 97, 72,
  ARRAY['Shein','$12.82'], ARRAY['https://www.google.com/search?ibp=oshop&q=trending fashion clothes 2026&prds=catalogid:7307568390866389559,headlineOfferDocid:7330669802601565584,imageDocid:4822468566337053564,gpcid:8207693916116701208,mid:576462883580293771,pvt:a&hl=en&gl=us&udm=28'],
  '2026-03-17T05:52:08.866748+00:00', '2026-03-17T05:52:08.866748+00:00'
);
INSERT INTO trends (country_id, category_id, name, description, image_url, heat_score, heat_status, search_score, social_score, ecommerce_score, news_score, tags, source_urls, first_detected_at, last_updated_at) VALUES (
  (SELECT id FROM countries WHERE code='US'),
  (SELECT id FROM categories WHERE slug='fashion'),
  'Women''s Hooded Loose Hem Split Dress', '판매처: Temu | 가격: $18.17', 'https://encrypted-tbn0.gstatic.com/shopping?q=tbn:ANd9GcQWrpbZvngwm1S0_2kr7nxeo4Uq9h46dSQkpv2SGvSVr-nVB08wtLsd57z9Yufu-Ky0SiJpc4nWDPVDIRXMgthTWfQ3cjfspkdhkOWGb6TjnuywB8M5bTgMyQ',
  95, 'rising',
  90, 80, 95, 70,
  ARRAY['Temu','$18.17'], ARRAY['https://www.google.com/search?ibp=oshop&q=trending fashion clothes 2026&prds=catalogid:16421449857673615473,headlineOfferDocid:9270875812893061734,imageDocid:3892263929237796052,pvt:a&hl=en&gl=us&udm=28'],
  '2026-03-17T05:52:08.866748+00:00', '2026-03-17T05:52:08.866748+00:00'
);
INSERT INTO trends (country_id, category_id, name, description, image_url, heat_score, heat_status, search_score, social_score, ecommerce_score, news_score, tags, source_urls, first_detected_at, last_updated_at) VALUES (
  (SELECT id FROM countries WHERE code='US'),
  (SELECT id FROM categories WHERE slug='fashion'),
  'Lavetir Sheath/Column Spaghetti Straps Pleated Long Bridesmaid Dresses with Split Side 2026', '판매처: Lavetir | 가격: $96.99', 'https://encrypted-tbn0.gstatic.com/shopping?q=tbn:ANd9GcQHxuLMLxZcu0raFBCOgteCKsw4Sg_E8yYBYib6RawxZ6gDRl8dYPQRuvdTmPK01CFUJx3TgBMOfFh11DnCouqLPp3FzeUZYKt-0dcId979CkOxRxGi16_ouA',
  92, 'rising',
  87, 77, 92, 67,
  ARRAY['Lavetir','$96.99'], ARRAY['https://www.google.com/search?ibp=oshop&q=trending fashion clothes 2026&prds=catalogid:1976590751800554693,headlineOfferDocid:5816825874744023017,imageDocid:6588253357616802616,gpcid:12451843374455907776,mid:576462860715002471,pvt:a&hl=en&gl=us&udm=28'],
  '2026-03-17T05:52:08.866748+00:00', '2026-03-17T05:52:08.866748+00:00'
);
INSERT INTO trends (country_id, category_id, name, description, image_url, heat_score, heat_status, search_score, social_score, ecommerce_score, news_score, tags, source_urls, first_detected_at, last_updated_at) VALUES (
  (SELECT id FROM countries WHERE code='US'),
  (SELECT id FROM categories WHERE slug='fashion'),
  'Free People Women''s Libre Wide Leg Jeans', '판매처: Backcountry.com | 가격: $68.99 | 평점: 4.3 | 리뷰: 238개', 'https://encrypted-tbn3.gstatic.com/shopping?q=tbn:ANd9GcRCA2cG3RhjfNJRnQIjE_DrMOL2lIKKSiAVQ93Rz54V7yEISysB1_uBmJpTb9veHH78Ox2GWEFfgsSdQsJAR35YqyUSQJp1lgrrvnbZev-2',
  100, 'rising',
  95, 85, 100, 75,
  ARRAY['Backcountry.com','$68.99','★4.3'], ARRAY['https://www.google.com/search?ibp=oshop&q=trending fashion clothes 2026&prds=catalogid:18023109755644365377,headlineOfferDocid:8773694640965978215,imageDocid:1039028704999031015,rds:PC_17356505379871572700|PROD_PC_17356505379871572700,gpcid:17356505379871572700,mid:576462776664996797,pvt:a&hl=en&gl=us&udm=28'],
  '2026-03-17T05:52:08.866748+00:00', '2026-03-17T05:52:08.866748+00:00'
);
INSERT INTO trends (country_id, category_id, name, description, image_url, heat_score, heat_status, search_score, social_score, ecommerce_score, news_score, tags, source_urls, first_detected_at, last_updated_at) VALUES (
  (SELECT id FROM countries WHERE code='US'),
  (SELECT id FROM categories WHERE slug='fashion'),
  'Fashion Nova Venezia Blouse and Wide Leg Pant Set', '판매처: Fashion Nova | 가격: $4.98 | 평점: 4.8 | 리뷰: 6개', 'https://encrypted-tbn1.gstatic.com/shopping?q=tbn:ANd9GcSTVzv1gN13BkTXzXoo7P8vaaOMCeJQxLVPxk05aohU95GZ-a2gRfKkk1DZP8vKDlBIdak9sYIr5AvsfMvLBKCvZw6fEvydmk2HvlbmY4TemrDIvzqa2orS',
  100, 'steady',
  95, 85, 100, 75,
  ARRAY['Fashion Nova','$4.98','★4.8'], ARRAY['https://www.google.com/search?ibp=oshop&q=trending fashion clothes 2026&prds=catalogid:6183645532831312056,headlineOfferDocid:1780511811551888764,imageDocid:17422173594662312121,rds:PC_15496587285006130334|PROD_PC_15496587285006130334,gpcid:15496587285006130334,mid:576462848350369086,pvt:a&hl=en&gl=us&udm=28'],
  '2026-03-17T05:52:08.866748+00:00', '2026-03-17T05:52:08.866748+00:00'
);
INSERT INTO trends (country_id, category_id, name, description, image_url, heat_score, heat_status, search_score, social_score, ecommerce_score, news_score, tags, source_urls, first_detected_at, last_updated_at) VALUES (
  (SELECT id FROM countries WHERE code='US'),
  (SELECT id FROM categories WHERE slug='fashion'),
  'Abercrombie & Fitch Women''s Bra-Free Clasp-Back Flowy Maxi Dress', '판매처: Abercrombie & Fitch | 가격: $89.99 | 평점: 4.5 | 리뷰: 52개', 'https://encrypted-tbn0.gstatic.com/shopping?q=tbn:ANd9GcQoVKZR8EzZDLp1waRLyDdvoo9rH_L0ozl7DrbByURyPbmozUxkufZbRku6WY0UU2-kjeT5vLxtxuIBF1bkkeBw24CLdd_I8szD_1O6Lq3aXiG2EZHVmG6L9g',
  100, 'steady',
  95, 85, 100, 75,
  ARRAY['Abercrombie & Fitch','$89.99','★4.5'], ARRAY['https://www.google.com/search?ibp=oshop&q=trending fashion clothes 2026&prds=catalogid:203964584313021476,headlineOfferDocid:10737583662257411193,imageDocid:10777019618425470688,rds:PC_15736918197021796752|PROD_PC_15736918197021796752,gpcid:15736918197021796752,mid:576462882026818427,pvt:a&hl=en&gl=us&udm=28'],
  '2026-03-17T05:52:08.866748+00:00', '2026-03-17T05:52:08.866748+00:00'
);
INSERT INTO trends (country_id, category_id, name, description, image_url, heat_score, heat_status, search_score, social_score, ecommerce_score, news_score, tags, source_urls, first_detected_at, last_updated_at) VALUES (
  (SELECT id FROM countries WHERE code='US'),
  (SELECT id FROM categories WHERE slug='fashion'),
  'H&M Ladies Harper High Rise Wide Leg Jeans', '판매처: H&M | 가격: $34.99 | 평점: 4.2 | 리뷰: 17,000개', 'https://encrypted-tbn3.gstatic.com/shopping?q=tbn:ANd9GcTY4In_RkbBSSd1CC8jegrE90-P1nKLXBnYCiZWALYR1zy1NB6KF9yjPmclM3sqv31tIW3bhF_RwD8kV3CRCaQwgwEow8LEpDZDuvGDCMi3QMSH6JwnhIQprw',
  100, 'steady',
  95, 85, 100, 75,
  ARRAY['H&M','$34.99','★4.2'], ARRAY['https://www.google.com/search?ibp=oshop&q=trending fashion clothes 2026&prds=catalogid:13170538487948016286,headlineOfferDocid:813627224904537834,imageDocid:14142897058145788511,rds:PC_1834951090102252699|PROD_PC_1834951090102252699,gpcid:1834951090102252699,pvt:a&hl=en&gl=us&udm=28'],
  '2026-03-17T05:52:08.866748+00:00', '2026-03-17T05:52:08.866748+00:00'
);
INSERT INTO trends (country_id, category_id, name, description, image_url, heat_score, heat_status, search_score, social_score, ecommerce_score, news_score, tags, source_urls, first_detected_at, last_updated_at) VALUES (
  (SELECT id FROM countries WHERE code='US'),
  (SELECT id FROM categories WHERE slug='fashion'),
  'Slaydiva 2026 Spring & Summer Elegant Commute & Casual Daily Wear', '판매처: Shein | 가격: $15.14', 'https://encrypted-tbn3.gstatic.com/shopping?q=tbn:ANd9GcRXPna0Z-ofDWzi_18MEuTKVmXLTg4pqpLNGGEhdKKJ-3fLCBX_4Wv-LnyLOgmIXwvK0PGgQtR6AJSlr4mvHzAU3awJHkecXoDpYbUBf-U',
  80, 'steady',
  75, 65, 80, 55,
  ARRAY['Shein','$15.14'], ARRAY['https://www.google.com/search?ibp=oshop&q=trending fashion clothes 2026&prds=catalogid:18146469754033821110,headlineOfferDocid:6280840983844308681,imageDocid:12666018434011326603,gpcid:6774161665401529265,mid:576462544522912500,pvt:a&hl=en&gl=us&udm=28'],
  '2026-03-17T05:52:08.866748+00:00', '2026-03-17T05:52:08.866748+00:00'
);
INSERT INTO trends (country_id, category_id, name, description, image_url, heat_score, heat_status, search_score, social_score, ecommerce_score, news_score, tags, source_urls, first_detected_at, last_updated_at) VALUES (
  (SELECT id FROM countries WHERE code='US'),
  (SELECT id FROM categories WHERE slug='fashion'),
  'Splicing Chiffon Crew Neck Short Sleeve Dress', '판매처: Temu | 가격: $19.31', 'https://encrypted-tbn0.gstatic.com/shopping?q=tbn:ANd9GcQ8KhAd_n-zrVRz_34i5gZlRO0366_x-bMH-aRZebJmIB_tzEbJQut3jyWFlF29M11lFZFe0L0VmhQVKJMOZbYwe8CmGZS1yRhOb-sAmaM',
  77, 'steady',
  72, 62, 77, 52,
  ARRAY['Temu','$19.31'], ARRAY['https://www.google.com/search?ibp=oshop&q=trending fashion clothes 2026&prds=catalogid:4023887092642058743,headlineOfferDocid:3418957365084573964,imageDocid:8817457629273845672,gpcid:3862189185297799248,pvt:a&hl=en&gl=us&udm=28'],
  '2026-03-17T05:52:08.866748+00:00', '2026-03-17T05:52:08.866748+00:00'
);
INSERT INTO trends (country_id, category_id, name, description, image_url, heat_score, heat_status, search_score, social_score, ecommerce_score, news_score, tags, source_urls, first_detected_at, last_updated_at) VALUES (
  (SELECT id FROM countries WHERE code='US'),
  (SELECT id FROM categories WHERE slug='fashion'),
  'Aritzia Women''s Babaton Lavish Pant', '판매처: Aritzia | 가격: $148.00', 'https://encrypted-tbn1.gstatic.com/shopping?q=tbn:ANd9GcR8McEYC-ifflFwONtU9UdHwy09Fjzs3UrAjFRevsA_CZAI5XfHiq77OSNDchwke6ebP4CpllL1vV2WmyufgRQW4Al-u10PKdPOEKblsygt5r8w_p0XuHLhV1Q',
  75, 'steady',
  70, 60, 75, 50,
  ARRAY['Aritzia','$148.00'], ARRAY['https://www.google.com/search?ibp=oshop&q=trending fashion clothes 2026&prds=catalogid:5471883214105121256,headlineOfferDocid:7740901695955356288,imageDocid:2025037288961728661,gpcid:13398262990559960635,mid:576462536903334926,pvt:a&hl=en&gl=us&udm=28'],
  '2026-03-17T05:52:08.866748+00:00', '2026-03-17T05:52:08.866748+00:00'
);
INSERT INTO trends (country_id, category_id, name, description, image_url, heat_score, heat_status, search_score, social_score, ecommerce_score, news_score, tags, source_urls, first_detected_at, last_updated_at) VALUES (
  (SELECT id FROM countries WHERE code='US'),
  (SELECT id FROM categories WHERE slug='fashion'),
  'Fashion Nova Modern Intent Long Sleeve Sweater Collar Mini Dress', '판매처: Fashion Nova | 가격: $4.98 | 평점: 5.0 | 리뷰: 5개', 'https://encrypted-tbn0.gstatic.com/shopping?q=tbn:ANd9GcQJMXNOMEJSR41ooX87zzolZENsglnl6C00aNwqMDKSpPmC6s_XFcyuL-OwIfio1FQXaf9VBnnVJ9gtG_3U_8pnco_LBrW3vWpuxXfgcJd8aHUDtRgZ4FcuU28',
  95, 'steady',
  90, 80, 95, 70,
  ARRAY['Fashion Nova','$4.98','★5.0'], ARRAY['https://www.google.com/search?ibp=oshop&q=trending fashion clothes 2026&prds=catalogid:18068247702937871727,headlineOfferDocid:8283509681412930530,imageDocid:16144562726290213344,rds:PC_4973725843280041673|PROD_PC_4973725843280041673,gpcid:4973725843280041673,mid:576462873284787436,pvt:a&hl=en&gl=us&udm=28'],
  '2026-03-17T05:52:08.866748+00:00', '2026-03-17T05:52:08.866748+00:00'
);
INSERT INTO trends (country_id, category_id, name, description, image_url, heat_score, heat_status, search_score, social_score, ecommerce_score, news_score, tags, source_urls, first_detected_at, last_updated_at) VALUES (
  (SELECT id FROM countries WHERE code='US'),
  (SELECT id FROM categories WHERE slug='fashion'),
  'Women Floral Maxi Skirt Beach', '판매처: Chicwish | 가격: $44.90', 'https://encrypted-tbn3.gstatic.com/shopping?q=tbn:ANd9GcT4_eiNOjrS5ON7ajF2S78mEFpcXSEc-EX3Pf3euS6BPhnupUg80NIMRoy_JYZDeL1aDPmq6mETvUXgMcaN3rjLNPMzVRErVm9txexg8j2GF3NMaifejRbJJUg',
  70, 'steady',
  65, 55, 70, 45,
  ARRAY['Chicwish','$44.90'], ARRAY['https://www.google.com/search?ibp=oshop&q=trending fashion clothes 2026&prds=catalogid:11476228798015004839,headlineOfferDocid:7976202967441026274,imageDocid:17543559242802948215,gpcid:6006302993410727866,mid:576462820654980303,pvt:a&hl=en&gl=us&udm=28'],
  '2026-03-17T05:52:08.866748+00:00', '2026-03-17T05:52:08.866748+00:00'
);
INSERT INTO trends (country_id, category_id, name, description, image_url, heat_score, heat_status, search_score, social_score, ecommerce_score, news_score, tags, source_urls, first_detected_at, last_updated_at) VALUES (
  (SELECT id FROM countries WHERE code='US'),
  (SELECT id FROM categories WHERE slug='fashion'),
  'Madewell Women''s Ultimate Wide-leg Jeans', '판매처: Madewell | 가격: $148.00 | 평점: 4.7 | 리뷰: 48개', 'https://encrypted-tbn3.gstatic.com/shopping?q=tbn:ANd9GcRl-KsWacK0mudm948vdAvQBfRFQyl5r2979KLQ1yFyolJLIfXwQKkaI17q_S9YFBYYqrdGE86cy9iZl9MWIYOhH8IkZiZLuxNCA-Sp-l9BbKqiW-339fPJOyw',
  92, 'steady',
  87, 77, 92, 67,
  ARRAY['Madewell','$148.00','★4.7'], ARRAY['https://www.google.com/search?ibp=oshop&q=trending fashion clothes 2026&prds=catalogid:9729168340712910203,headlineOfferDocid:575553336735131259,imageDocid:17306040129740070659,rds:PC_10854863100136633585|PROD_PC_10854863100136633585,gpcid:10854863100136633585,mid:576462878607743706,pvt:a&hl=en&gl=us&udm=28'],
  '2026-03-17T05:52:08.866748+00:00', '2026-03-17T05:52:08.866748+00:00'
);
INSERT INTO trends (country_id, category_id, name, description, image_url, heat_score, heat_status, search_score, social_score, ecommerce_score, news_score, tags, source_urls, first_detected_at, last_updated_at) VALUES (
  (SELECT id FROM countries WHERE code='US'),
  (SELECT id FROM categories WHERE slug='fashion'),
  'Four Seasons Women''s Floral Backless Mesh Horn Sleeve Mini Dress', '판매처: Temu | 가격: $17.24', 'https://encrypted-tbn0.gstatic.com/shopping?q=tbn:ANd9GcQFIWuVzDDKmRGv0sb2aNiW-x2Hb32wDqdeE2WyFLqpmFTcdVwppTvQcYmO7UrOq4wfc8p_Rk9DcK3Qsfg0EFdClMr1xN5BPq-CcpkJtD6P',
  65, 'steady',
  60, 50, 65, 40,
  ARRAY['Temu','$17.24'], ARRAY['https://www.google.com/search?ibp=oshop&q=trending fashion clothes 2026&prds=catalogid:14946178820605360438,headlineOfferDocid:6826984863369476890,imageDocid:9305981187433128080,gpcid:2738157551430029079,mid:576462883582951088,pvt:a&hl=en&gl=us&udm=28'],
  '2026-03-17T05:52:08.866748+00:00', '2026-03-17T05:52:08.866748+00:00'
);
INSERT INTO trends (country_id, category_id, name, description, image_url, heat_score, heat_status, search_score, social_score, ecommerce_score, news_score, tags, source_urls, first_detected_at, last_updated_at) VALUES (
  (SELECT id FROM countries WHERE code='US'),
  (SELECT id FROM categories WHERE slug='products'),
  '2026 TikTok Trending Garlic Chopper 300ml, Portable Electric Mini Food Processor, One-Touch Garlic & Chili Crusher, USB Rechargeable Wireless Crusher', '판매처: Walmart - LO.CYX | 가격: $11.55', 'https://encrypted-tbn1.gstatic.com/shopping?q=tbn:ANd9GcS-dPINw0H6ATdROYkkl3D4hvNOcw7Ct86xz2kbsFXoSxxUuva3lGNL2vbcD2Tl04l-nzhS2_Peb7Hx-wK84oSDRLWVKOYsIA',
  100, 'rising',
  95, 85, 100, 75,
  ARRAY['Walmart - LO.CYX','$11.55'], ARRAY['https://www.google.com/search?ibp=oshop&q=trending products viral 2026&prds=productid:11399955840479225361,headlineOfferDocid:11399955840479225361,imageDocid:12176123159786449333,pvt:hg&hl=en&gl=us&udm=28'],
  '2026-03-17T05:52:08.866748+00:00', '2026-03-17T05:52:08.866748+00:00'
);
INSERT INTO trends (country_id, category_id, name, description, image_url, heat_score, heat_status, search_score, social_score, ecommerce_score, news_score, tags, source_urls, first_detected_at, last_updated_at) VALUES (
  (SELECT id FROM countries WHERE code='US'),
  (SELECT id FROM categories WHERE slug='products'),
  'Oura Ceramic Petal Smart Ring', '판매처: Best Buy | 가격: $499.00 | 평점: 4.5 | 리뷰: 4,500개', 'https://encrypted-tbn2.gstatic.com/shopping?q=tbn:ANd9GcT_hXi_kBwQkpNZSHV7Abedz06xqjmhpkPh1pDEvb7fywP2A7iFffWrzADjaAPu2qcdU2Sk0g42evyzPUUuxF1OJ57S7qxFRq82tlmP7xD2',
  100, 'rising',
  95, 85, 100, 75,
  ARRAY['Best Buy','$499.00','★4.5'], ARRAY['https://www.google.com/search?ibp=oshop&q=trending products viral 2026&prds=catalogid:8127509861740038924,headlineOfferDocid:11859621436977935848,imageDocid:3517448377923779478,rds:PC_13123353969369559754|PROD_PC_13123353969369559754,gpcid:13123353969369559754,pvt:hg&hl=en&gl=us&udm=28'],
  '2026-03-17T05:52:08.866748+00:00', '2026-03-17T05:52:08.866748+00:00'
);
INSERT INTO trends (country_id, category_id, name, description, image_url, heat_score, heat_status, search_score, social_score, ecommerce_score, news_score, tags, source_urls, first_detected_at, last_updated_at) VALUES (
  (SELECT id FROM countries WHERE code='US'),
  (SELECT id FROM categories WHERE slug='products'),
  'Schylling Atomic NeeDoh Ball', '판매처: Five Below | 가격: $3.00 | 평점: 3.9 | 리뷰: 113개', 'https://encrypted-tbn2.gstatic.com/shopping?q=tbn:ANd9GcR7arb7t_OJuIk9LbRt2xsNyM2CWSQxZbJKix0QA7Wv5Ky74EDtdy9Sh0uDrsHCn4lIuPfhV3ispNI-j-V0PvXPdy6I-MdR',
  100, 'rising',
  95, 85, 100, 75,
  ARRAY['Five Below','$3.00','★3.9'], ARRAY['https://www.google.com/search?ibp=oshop&q=trending products viral 2026&prds=catalogid:17965261062188518078,headlineOfferDocid:8782423940849340023,imageDocid:5738404434624958582,rds:PC_1564537892718443130|PROD_PC_1564537892718443130,gpcid:1564537892718443130,mid:576462434415117440,pvt:hg&hl=en&gl=us&udm=28'],
  '2026-03-17T05:52:08.866748+00:00', '2026-03-17T05:52:08.866748+00:00'
);
INSERT INTO trends (country_id, category_id, name, description, image_url, heat_score, heat_status, search_score, social_score, ecommerce_score, news_score, tags, source_urls, first_detected_at, last_updated_at) VALUES (
  (SELECT id FROM countries WHERE code='US'),
  (SELECT id FROM categories WHERE slug='products'),
  'HYDROJUG Traveler Tumbler', '판매처: iHerb | 가격: $39.99 | 평점: 4.7 | 리뷰: 17,000개', 'https://encrypted-tbn1.gstatic.com/shopping?q=tbn:ANd9GcQScUCzfiWDoQPvEqxBvk_3RHdEgJ59gMRGFAUJtG1hyg6MQwiJYAkPsM95Aey0oEDRf3hma-vgnd014tGlxKlUqcN3-Gmf',
  100, 'rising',
  95, 85, 100, 75,
  ARRAY['iHerb','$39.99','★4.7'], ARRAY['https://www.google.com/search?ibp=oshop&q=trending products viral 2026&prds=catalogid:3663758859696692140,headlineOfferDocid:13133680375843157191,imageDocid:1834122117513497697,rds:PC_12285801992224729853|PROD_PC_12285801992224729853,gpcid:12285801992224729853,mid:576462857277317088,pvt:hg&hl=en&gl=us&udm=28'],
  '2026-03-17T05:52:08.866748+00:00', '2026-03-17T05:52:08.866748+00:00'
);
INSERT INTO trends (country_id, category_id, name, description, image_url, heat_score, heat_status, search_score, social_score, ecommerce_score, news_score, tags, source_urls, first_detected_at, last_updated_at) VALUES (
  (SELECT id FROM countries WHERE code='US'),
  (SELECT id FROM categories WHERE slug='products'),
  'Brumate Era 20 oz. Straw Tumbler', '판매처: DICK''S Sporting Goods | 가격: $34.99 | 평점: 4.9 | 리뷰: 209개', 'https://encrypted-tbn0.gstatic.com/shopping?q=tbn:ANd9GcRTnNbcxWEk_TFn8o3BHWjYpmB-b0S90avAbValDxb5NQI4f_-vXbSFAtvEjYOLCPiEPVZBZZcrms31_NHDWQLkUvIXgHuhmjDueA89J_t0',
  100, 'rising',
  95, 85, 100, 75,
  ARRAY['DICK''S Sporting Goods','$34.99','★4.9'], ARRAY['https://www.google.com/search?ibp=oshop&q=trending products viral 2026&prds=catalogid:13608245495046278886,headlineOfferDocid:1113455177717343758,imageDocid:11930309403344082416,rds:PC_12393552764514055555|PROD_PC_12393552764514055555,gpcid:12393552764514055555,pvt:hg&hl=en&gl=us&udm=28'],
  '2026-03-17T05:52:08.866748+00:00', '2026-03-17T05:52:08.866748+00:00'
);
INSERT INTO trends (country_id, category_id, name, description, image_url, heat_score, heat_status, search_score, social_score, ecommerce_score, news_score, tags, source_urls, first_detected_at, last_updated_at) VALUES (
  (SELECT id FROM countries WHERE code='US'),
  (SELECT id FROM categories WHERE slug='products'),
  'Squishy Bun,Glitter Dumplings,2026 New Squishy Dumpling,Dumpling Squishy, Rainbow Dumplings, Cute Anxiety Relief Fidget , Soft Squeeze Decompression', '판매처: Walmart - ZongRen | 가격: $6.78', 'https://encrypted-tbn0.gstatic.com/shopping?q=tbn:ANd9GcQ8QHPkEipoCnmG7GJ9fg_LhLXPFsEd9GcLrEVAjClZW2-PQqdq-B_79_tfb44kstHINVnbN7ypfSCmy16XBmEJ6ne76RvJ',
  87, 'steady',
  82, 72, 87, 62,
  ARRAY['Walmart - ZongRen','$6.78'], ARRAY['https://www.google.com/search?ibp=oshop&q=trending products viral 2026&prds=productid:6780200729169792462,headlineOfferDocid:6780200729169792462,imageDocid:455208859967139512,pvt:hg&hl=en&gl=us&udm=28'],
  '2026-03-17T05:52:08.866748+00:00', '2026-03-17T05:52:08.866748+00:00'
);
INSERT INTO trends (country_id, category_id, name, description, image_url, heat_score, heat_status, search_score, social_score, ecommerce_score, news_score, tags, source_urls, first_detected_at, last_updated_at) VALUES (
  (SELECT id FROM countries WHERE code='US'),
  (SELECT id FROM categories WHERE slug='products'),
  'BaoBerry GG by Bao - 100 Servings', '판매처: Gamer Supps | 가격: $40.00 | 평점: 4.8 | 리뷰: 347개', 'https://encrypted-tbn1.gstatic.com/shopping?q=tbn:ANd9GcSdTOSVr5AQ5mezdTnpJrD5hHzZS7krD93XbMvQWEfvEAR-I9jJ_A0t8edVfrJ3dVJPfk8HOCqE8gu_oWLy3Jym0GQTWk8dAqs0e2VznwjSVDgcK6ht-9ramNwc',
  100, 'steady',
  95, 85, 100, 75,
  ARRAY['Gamer Supps','$40.00','★4.8'], ARRAY['https://www.google.com/search?ibp=oshop&q=trending products viral 2026&prds=productid:4933318010350498665,headlineOfferDocid:4933318010350498665,imageDocid:2692826446443101537,rds:LO_4933318010350498665|PROD_LO_4933318010350498665,pvt:hg&hl=en&gl=us&udm=28'],
  '2026-03-17T05:52:08.866748+00:00', '2026-03-17T05:52:08.866748+00:00'
);
INSERT INTO trends (country_id, category_id, name, description, image_url, heat_score, heat_status, search_score, social_score, ecommerce_score, news_score, tags, source_urls, first_detected_at, last_updated_at) VALUES (
  (SELECT id FROM countries WHERE code='US'),
  (SELECT id FROM categories WHERE slug='products'),
  'The Comfy Original Wearable Blanket –', '판매처: The Comfy | 가격: $49.99 | 평점: 4.6 | 리뷰: 4,200개', 'https://encrypted-tbn0.gstatic.com/shopping?q=tbn:ANd9GcRh6x8y9Aoav-yPuKz9uRKWEz0FYmV8WtFIvrsGk688y36n00LwGUw8WY2nrn3_pQYV3Kv6qcTOOrpQv75DnbgF7i9BMMqAz45DzRHrySr9GPz5mAtFTDNR9xU',
  100, 'steady',
  95, 85, 100, 75,
  ARRAY['The Comfy','$49.99','★4.6'], ARRAY['https://www.google.com/search?ibp=oshop&q=trending products viral 2026&prds=catalogid:9986402047607382029,headlineOfferDocid:11173796484833568150,imageDocid:9973656228108741004,rds:PC_17938569249697534542|PROD_PC_17938569249697534542,gpcid:17938569249697534542,mid:576462512314297975,pvt:hg&hl=en&gl=us&udm=28'],
  '2026-03-17T05:52:08.866748+00:00', '2026-03-17T05:52:08.866748+00:00'
);
INSERT INTO trends (country_id, category_id, name, description, image_url, heat_score, heat_status, search_score, social_score, ecommerce_score, news_score, tags, source_urls, first_detected_at, last_updated_at) VALUES (
  (SELECT id FROM countries WHERE code='US'),
  (SELECT id FROM categories WHERE slug='products'),
  'Cronus Zen Controller Emulator', '판매처: KaterUSA | 가격: $114.99 | 평점: 4.1 | 리뷰: 1,300개', 'https://encrypted-tbn1.gstatic.com/shopping?q=tbn:ANd9GcRkfDLqzbFfb5MWoQIeI8OFJu8A96YxHj6S8qlCeOeIE4GESz9qq-m_sNXLzakd3gHSITvDYEeHCj5mKuPKt3XdZtaL5csH5rMmzUzqjnqrLs1uidZTvQgoiA',
  100, 'steady',
  95, 85, 100, 75,
  ARRAY['KaterUSA','$114.99','★4.1'], ARRAY['https://www.google.com/search?ibp=oshop&q=trending products viral 2026&prds=catalogid:14258228889846022674,headlineOfferDocid:4834656180852435020,imageDocid:5490581222590648021,rds:PC_1023291057638277161|PROD_PC_1023291057638277161,gpcid:1023291057638277161,mid:576462569181993678,pvt:hg&hl=en&gl=us&udm=28'],
  '2026-03-17T05:52:08.866748+00:00', '2026-03-17T05:52:08.866748+00:00'
);
INSERT INTO trends (country_id, category_id, name, description, image_url, heat_score, heat_status, search_score, social_score, ecommerce_score, news_score, tags, source_urls, first_detected_at, last_updated_at) VALUES (
  (SELECT id FROM countries WHERE code='US'),
  (SELECT id FROM categories WHERE slug='products'),
  'Cute Squishies,Stress Balls,Slow Rebound Cute Butter Squeeze Stress Balls, 2026 Upgraded Squeeze Ball Realistic Butter Stick Soft Squeeze Toys,', '판매처: Walmart - ZongRen | 가격: $7.68', 'https://encrypted-tbn0.gstatic.com/shopping?q=tbn:ANd9GcS_hfFhU9EC4W_18GbgyhCufXm9gGdnxoS5cccFFB2aX8Vf_1xy0kKBpGWxFwR0JkyAQajTqLYGdZyksoX-oLxjgdDv6R-k',
  77, 'steady',
  72, 62, 77, 52,
  ARRAY['Walmart - ZongRen','$7.68'], ARRAY['https://www.google.com/search?ibp=oshop&q=trending products viral 2026&prds=productid:11176608734709272641,headlineOfferDocid:11176608734709272641,imageDocid:1530454614089866196,pvt:hg&hl=en&gl=us&udm=28'],
  '2026-03-17T05:52:08.866748+00:00', '2026-03-17T05:52:08.866748+00:00'
);
INSERT INTO trends (country_id, category_id, name, description, image_url, heat_score, heat_status, search_score, social_score, ecommerce_score, news_score, tags, source_urls, first_detected_at, last_updated_at) VALUES (
  (SELECT id FROM countries WHERE code='US'),
  (SELECT id FROM categories WHERE slug='products'),
  'Saie Glowy Super Gel', '판매처: Saie | 가격: $29.00 | 평점: 4.4 | 리뷰: 15,000개', 'https://encrypted-tbn2.gstatic.com/shopping?q=tbn:ANd9GcRDBHSOtbieQFSmJqrkWisSHxU9bAl34YZ7gqht8LH5VKbdJ5qfUM3p33CglHYsrP2BMELibiqJB1uQk-t5norXuurQ-TDInAlw2PHPnBxpSChZlZQsw0Ad-Cwi',
  100, 'steady',
  95, 85, 100, 75,
  ARRAY['Saie','$29.00','★4.4'], ARRAY['https://www.google.com/search?ibp=oshop&q=trending products viral 2026&prds=catalogid:695704051771511492,headlineOfferDocid:5222288208937901127,imageDocid:9451344413740804866,rds:PC_17195092897264532992|PROD_PC_17195092897264532992,gpcid:17195092897264532992,mid:576462816695047568,pvt:hg&hl=en&gl=us&udm=28'],
  '2026-03-17T05:52:08.866748+00:00', '2026-03-17T05:52:08.866748+00:00'
);
INSERT INTO trends (country_id, category_id, name, description, image_url, heat_score, heat_status, search_score, social_score, ecommerce_score, news_score, tags, source_urls, first_detected_at, last_updated_at) VALUES (
  (SELECT id FROM countries WHERE code='US'),
  (SELECT id FROM categories WHERE slug='products'),
  'Glossier You Eau de Parfum', '판매처: Glossier | 가격: $116.00 | 평점: 4.3 | 리뷰: 16,000개', 'https://encrypted-tbn3.gstatic.com/shopping?q=tbn:ANd9GcSB7JDM7IjTU9NhYPlVdv86vEikTWJ5Hii4UaVpXVl9XsnvTukM7BYUgFxq5nTutIn4d9BQ8lLKmdwn9hYAiS1B0BkvfrsCSsy8sPYbZsd67kyHQHEnImAFf8w',
  100, 'steady',
  95, 85, 100, 75,
  ARRAY['Glossier','$116.00','★4.3'], ARRAY['https://www.google.com/search?ibp=oshop&q=trending products viral 2026&prds=catalogid:3892875597265459599,headlineOfferDocid:15089519642191735172,imageDocid:15783014216987498107,rds:PC_13690325614801731024|PROD_PC_13690325614801731024,gpcid:13690325614801731024,mid:576462775815095890,pvt:hg&hl=en&gl=us&udm=28'],
  '2026-03-17T05:52:08.866748+00:00', '2026-03-17T05:52:08.866748+00:00'
);
INSERT INTO trends (country_id, category_id, name, description, image_url, heat_score, heat_status, search_score, social_score, ecommerce_score, news_score, tags, source_urls, first_detected_at, last_updated_at) VALUES (
  (SELECT id FROM countries WHERE code='US'),
  (SELECT id FROM categories WHERE slug='products'),
  'The Super Puff Women''s The Super Puff Vest in Mochi Pink | Medium', '판매처: Aritzia | 가격: $250.00', 'https://encrypted-tbn0.gstatic.com/shopping?q=tbn:ANd9GcSOBestZNnSDFY3ZH9cMOO5dvPQLbcp1kaKXySb3mPphcXKRFdrVf6Ab7y-T256BXnAK9Z-hF7uN6h74SXNGTYMPD_ZBlGVIXAw90T5aNm74-c0U59UgUMv5g',
  70, 'steady',
  65, 55, 70, 45,
  ARRAY['Aritzia','$250.00'], ARRAY['https://www.google.com/search?ibp=oshop&q=trending products viral 2026&prds=productid:5071877795271738439,headlineOfferDocid:5071877795271738439,imageDocid:8690831400559488604,pvt:hg&hl=en&gl=us&udm=28'],
  '2026-03-17T05:52:08.866748+00:00', '2026-03-17T05:52:08.866748+00:00'
);
INSERT INTO trends (country_id, category_id, name, description, image_url, heat_score, heat_status, search_score, social_score, ecommerce_score, news_score, tags, source_urls, first_detected_at, last_updated_at) VALUES (
  (SELECT id FROM countries WHERE code='US'),
  (SELECT id FROM categories WHERE slug='products'),
  'VIRAL PAINTED BLUSHES', '판매처: Painted | 가격: $35.00', 'https://encrypted-tbn1.gstatic.com/shopping?q=tbn:ANd9GcSjvbgXcn-Y7kwhadWGc9Vg0dhtNLc40zcjAfds_Pu3EqwbPnnFQCgfJwGkIK6oXVmll5_8TsVIdtf9paGHeuPryDsLdz1dmXsvU3AVxsR1gwg1nOPjbI_0',
  67, 'steady',
  62, 52, 67, 42,
  ARRAY['Painted','$35.00'], ARRAY['https://www.google.com/search?ibp=oshop&q=trending products viral 2026&prds=catalogid:15094378140935590244,headlineOfferDocid:17106040359594854812,imageDocid:7976486391668067257,gpcid:15604897855888271290,mid:576462516957551653,pvt:hg&hl=en&gl=us&udm=28'],
  '2026-03-17T05:52:08.866748+00:00', '2026-03-17T05:52:08.866748+00:00'
);
INSERT INTO trends (country_id, category_id, name, description, image_url, heat_score, heat_status, search_score, social_score, ecommerce_score, news_score, tags, source_urls, first_detected_at, last_updated_at) VALUES (
  (SELECT id FROM countries WHERE code='US'),
  (SELECT id FROM categories WHERE slug='products'),
  'Helix Magnetic Fidget Coil', '판매처: Speks | 가격: $19.95 | 평점: 4.4 | 리뷰: 62개', 'https://encrypted-tbn0.gstatic.com/shopping?q=tbn:ANd9GcQVUptr0_fjvy14XOrY7r0gCfLVXMs4-25c5IiqFphmtM0ujc9BsbNjTTPgigmokRAeY7Eyw8JIfGHxUAcqGd6h78EN-zrE4v0H8vmE6MaUScRTXqY1tM4e4Q',
  87, 'steady',
  82, 72, 87, 62,
  ARRAY['Speks','$19.95','★4.4'], ARRAY['https://www.google.com/search?ibp=oshop&q=trending products viral 2026&prds=catalogid:5810480604636197856,headlineOfferDocid:17477809654720765053,imageDocid:5377329387903678672,rds:PC_11204525295599466241|PROD_PC_11204525295599466241,gpcid:11204525295599466241,mid:576462866748792228,pvt:hg&hl=en&gl=us&udm=28'],
  '2026-03-17T05:52:08.866748+00:00', '2026-03-17T05:52:08.866748+00:00'
);
INSERT INTO trends (country_id, category_id, name, description, image_url, heat_score, heat_status, search_score, social_score, ecommerce_score, news_score, tags, source_urls, first_detected_at, last_updated_at) VALUES (
  (SELECT id FROM countries WHERE code='US'),
  (SELECT id FROM categories WHERE slug='food'),
  'International Snack Box', '판매처: Universal Yums | 가격: $29.00', 'https://encrypted-tbn0.gstatic.com/shopping?q=tbn:ANd9GcQza1zNfb4loQVt8jCcpeuoyG2WWJHsjksUlfK_iZArY9V0IlKTkvPIxHryNfvF3pA31NEDHLgC3ehC1PYx10DLAlb4OsXgK9W8SvZJCzHZKczNBlJHGZnT',
  100, 'rising',
  95, 85, 100, 75,
  ARRAY['Universal Yums','$29.00'], ARRAY['https://www.google.com/search?ibp=oshop&q=trending food snacks dessert 2026&prds=catalogid:8286892886768405598,headlineOfferDocid:1502098282542444864,imageDocid:9519078946496729084,gpcid:5921803066743758057,pvt:hg&hl=en&gl=us&udm=28'],
  '2026-03-17T05:52:08.866748+00:00', '2026-03-17T05:52:08.866748+00:00'
);
INSERT INTO trends (country_id, category_id, name, description, image_url, heat_score, heat_status, search_score, social_score, ecommerce_score, news_score, tags, source_urls, first_detected_at, last_updated_at) VALUES (
  (SELECT id FROM countries WHERE code='US'),
  (SELECT id FROM categories WHERE slug='food'),
  'Nerds Gummy Clusters', '판매처: Walmart - Seller | 가격: $3.20 | 평점: 4.7 | 리뷰: 3,500개', 'https://encrypted-tbn3.gstatic.com/shopping?q=tbn:ANd9GcQsingv8csaieJnMdi1hJMDHujrZk_eYHUGNaOx59pDfwDCgthWhrXqMaqzIAeUd8j3g3RBaWhHjYiEHuArsAHxX4jjCxUH8w',
  100, 'rising',
  95, 85, 100, 75,
  ARRAY['Walmart - Seller','$3.20','★4.7'], ARRAY['https://www.google.com/search?ibp=oshop&q=trending food snacks dessert 2026&prds=catalogid:1604069463571622247,headlineOfferDocid:7580292616863862622,imageDocid:12366366805921881355,rds:PC_4795506053387662523|PROD_PC_4795506053387662523,gpcid:4795506053387662523,mid:576462876030150791,pvt:hg&hl=en&gl=us&udm=28'],
  '2026-03-17T05:52:08.866748+00:00', '2026-03-17T05:52:08.866748+00:00'
);
INSERT INTO trends (country_id, category_id, name, description, image_url, heat_score, heat_status, search_score, social_score, ecommerce_score, news_score, tags, source_urls, first_detected_at, last_updated_at) VALUES (
  (SELECT id FROM countries WHERE code='US'),
  (SELECT id FROM categories WHERE slug='food'),
  'Drizzilicious Birthday Cake Bites Mini Rice Crisp', '판매처: seasonskosher.com | 가격: $3.99 | 평점: 4.9 | 리뷰: 415개', 'https://encrypted-tbn0.gstatic.com/shopping?q=tbn:ANd9GcSzZKj3gr1eUXPA1SUuXP6chlx-n2rDz8Aycb6mzrFcWOzIvTi8C6IomBkFtV0U_J16jnaIP7TtLruFBv089VQYKlr5V55C',
  100, 'rising',
  95, 85, 100, 75,
  ARRAY['seasonskosher.com','$3.99','★4.9'], ARRAY['https://www.google.com/search?ibp=oshop&q=trending food snacks dessert 2026&prds=catalogid:11995206913907614900,headlineOfferDocid:5624063375032832726,imageDocid:3407528644328168664,rds:PC_18188145610106194832|PROD_PC_18188145610106194832,gpcid:18188145610106194832,mid:576462808320860074,pvt:hg&hl=en&gl=us&udm=28'],
  '2026-03-17T05:52:08.866748+00:00', '2026-03-17T05:52:08.866748+00:00'
);
INSERT INTO trends (country_id, category_id, name, description, image_url, heat_score, heat_status, search_score, social_score, ecommerce_score, news_score, tags, source_urls, first_detected_at, last_updated_at) VALUES (
  (SELECT id FROM countries WHERE code='US'),
  (SELECT id FROM categories WHERE slug='food'),
  'Nationwide Assorted Birthday Cookies', '판매처: Milk Bar | 가격: $28.00 | 평점: 4.2 | 리뷰: 4,100개', 'https://encrypted-tbn1.gstatic.com/shopping?q=tbn:ANd9GcTrVTP1Go3eLEFNK4qCduz2tpyEw7X58zxjUm-Yp5ozVQY3rnzSwCmaDsyIeaa8p6ecA9Uc03N4zvqb9OBD7SKtxK-rkWmxOMvswXrZprMzQqWAVSDlRlCh4Q',
  100, 'rising',
  95, 85, 100, 75,
  ARRAY['Milk Bar','$28.00','★4.2'], ARRAY['https://www.google.com/search?ibp=oshop&q=trending food snacks dessert 2026&prds=catalogid:5141056464286329714,headlineOfferDocid:14660324955953348695,imageDocid:16139331216679747693,rds:PC_10114510135968802410|PROD_PC_10114510135968802410,gpcid:10114510135968802410,mid:576462820649551186,pvt:hg&hl=en&gl=us&udm=28'],
  '2026-03-17T05:52:08.866748+00:00', '2026-03-17T05:52:08.866748+00:00'
);
INSERT INTO trends (country_id, category_id, name, description, image_url, heat_score, heat_status, search_score, social_score, ecommerce_score, news_score, tags, source_urls, first_detected_at, last_updated_at) VALUES (
  (SELECT id FROM countries WHERE code='US'),
  (SELECT id FROM categories WHERE slug='food'),
  'Special Value Mystery Cookies', '판매처: Cheryl''s Cookies | 가격: $19.99', 'https://encrypted-tbn1.gstatic.com/shopping?q=tbn:ANd9GcRU59sW1pum9M24DT298d5mfHqgzmuILEhuYAPWebi9zK2bd0nkgaZYHHUf0537qUkQ2nGxfvW9A7btKyps_Q4L7kSvfH8wgY27T7H78inb_iTswmKlrPAI',
  90, 'rising',
  85, 75, 90, 65,
  ARRAY['Cheryl''s Cookies','$19.99'], ARRAY['https://www.google.com/search?ibp=oshop&q=trending food snacks dessert 2026&prds=catalogid:17766913416073765602,headlineOfferDocid:12679572797488477221,imageDocid:9846038782878367493,gpcid:4693483009382860132,pvt:hg&hl=en&gl=us&udm=28'],
  '2026-03-17T05:52:08.866748+00:00', '2026-03-17T05:52:08.866748+00:00'
);
INSERT INTO trends (country_id, category_id, name, description, image_url, heat_score, heat_status, search_score, social_score, ecommerce_score, news_score, tags, source_urls, first_detected_at, last_updated_at) VALUES (
  (SELECT id FROM countries WHERE code='US'),
  (SELECT id FROM categories WHERE slug='food'),
  'Sakura Box 30 Piece Japanese Snacks Dagashi Gift Box', '판매처: Sakura Box | 가격: $35.97 | 평점: 3.0 | 리뷰: 2개', 'https://encrypted-tbn1.gstatic.com/shopping?q=tbn:ANd9GcQ8iA4rnY_5pjDvIdnNSTQPLF6KRl0zjx_zmRUOzlHyqlHDknSItXDNaXdmw89RXHm1ZbwyDdEtrkPjFkByy4xGLuzCqZgE6K3qIWSYVH-vvGP7NVE3XWzR',
  89, 'steady',
  84, 74, 89, 64,
  ARRAY['Sakura Box','$35.97','★3.0'], ARRAY['https://www.google.com/search?ibp=oshop&q=trending food snacks dessert 2026&prds=catalogid:9287381605608547232,headlineOfferDocid:6292480269511466976,imageDocid:4644545031618728269,rds:CID_9287381605608547232|PROD_CID_9287381605608547232,gpcid:5646876980222290082,pvt:hg&hl=en&gl=us&udm=28'],
  '2026-03-17T05:52:08.866748+00:00', '2026-03-17T05:52:08.866748+00:00'
);
INSERT INTO trends (country_id, category_id, name, description, image_url, heat_score, heat_status, search_score, social_score, ecommerce_score, news_score, tags, source_urls, first_detected_at, last_updated_at) VALUES (
  (SELECT id FROM countries WHERE code='US'),
  (SELECT id FROM categories WHERE slug='food'),
  'Keebler Funables & Mother''s Sweet Treat Cookies Box Variety Pack (30 ct)', '판매처: Walmart | 가격: $12.72 | 평점: 4.2 | 리뷰: 122개', 'https://encrypted-tbn2.gstatic.com/shopping?q=tbn:ANd9GcTlxm6BgGAqY3FN6Zt2_MZtd_9iZBOKxDq9Im0-6syUA3Q74OQhUIB-8LbokYC5vGGDOMB7B_wnnxTdtV_i8F_0LA2ZdRcddsZAql0-Zjo0BW7IYm4mMAB5',
  100, 'steady',
  95, 85, 100, 75,
  ARRAY['Walmart','$12.72','★4.2'], ARRAY['https://www.google.com/search?ibp=oshop&q=trending food snacks dessert 2026&prds=catalogid:10050278625541965897,headlineOfferDocid:936792692454464948,imageDocid:18329133978225348306,rds:PC_14824392036804770477|PROD_PC_14824392036804770477,gpcid:14824392036804770477,mid:576462699843088013,pvt:hg&hl=en&gl=us&udm=28'],
  '2026-03-17T05:52:08.866748+00:00', '2026-03-17T05:52:08.866748+00:00'
);
INSERT INTO trends (country_id, category_id, name, description, image_url, heat_score, heat_status, search_score, social_score, ecommerce_score, news_score, tags, source_urls, first_detected_at, last_updated_at) VALUES (
  (SELECT id FROM countries WHERE code='US'),
  (SELECT id FROM categories WHERE slug='food'),
  'Little Debbie Cosmic Brownies', '판매처: Food Depot | 가격: $2.19 | 평점: 4.4 | 리뷰: 2,700개', 'https://encrypted-tbn2.gstatic.com/shopping?q=tbn:ANd9GcT0EX6XGle-yuOGbqwvm6UXpvcgyRVk5-SMJVTHXtk7GBveS9W6QaO35leU9vLObNqPGWRSkFPpm0Q5ff16IxT2KY4SWdMpew',
  100, 'steady',
  95, 85, 100, 75,
  ARRAY['Food Depot','$2.19','★4.4'], ARRAY['https://www.google.com/search?ibp=oshop&q=trending food snacks dessert 2026&prds=catalogid:3896701121694866177,headlineOfferDocid:7283114176053480953,imageDocid:7572322208547372790,rds:PC_10004701221368018298|PROD_PC_10004701221368018298,gpcid:10004701221368018298,mid:576462333017925737,pvt:hg&hl=en&gl=us&udm=28'],
  '2026-03-17T05:52:08.866748+00:00', '2026-03-17T05:52:08.866748+00:00'
);
INSERT INTO trends (country_id, category_id, name, description, image_url, heat_score, heat_status, search_score, social_score, ecommerce_score, news_score, tags, source_urls, first_detected_at, last_updated_at) VALUES (
  (SELECT id FROM countries WHERE code='US'),
  (SELECT id FROM categories WHERE slug='food'),
  'Oreo Cakesters Confetti Soft Snack Cakes', '판매처: OREOiD | 가격: $5.59 | 평점: 4.5 | 리뷰: 88개', 'https://encrypted-tbn2.gstatic.com/shopping?q=tbn:ANd9GcQezxm50ClTnW9lnYyC66vKZIy7UzJC6VUdLwvOdC_kk9TvhH6VJ_-qNZLKd8fNd-e4JedmRxnq_sLPrR9iZCPtvyS8cToCkxBcAIfvB3GvlvV5TcEFx24LXQ',
  100, 'steady',
  95, 85, 100, 75,
  ARRAY['OREOiD','$5.59','★4.5'], ARRAY['https://www.google.com/search?ibp=oshop&q=trending food snacks dessert 2026&prds=catalogid:4823860379796356928,headlineOfferDocid:12995482994202121168,imageDocid:7374989685848446626,rds:PC_14434686681855144032|PROD_PC_14434686681855144032,gpcid:14434686681855144032,mid:576462871810249960,pvt:hg&hl=en&gl=us&udm=28'],
  '2026-03-17T05:52:08.866748+00:00', '2026-03-17T05:52:08.866748+00:00'
);
INSERT INTO trends (country_id, category_id, name, description, image_url, heat_score, heat_status, search_score, social_score, ecommerce_score, news_score, tags, source_urls, first_detected_at, last_updated_at) VALUES (
  (SELECT id FROM countries WHERE code='US'),
  (SELECT id FROM categories WHERE slug='food'),
  'Little Debbie Strawberry Shortcake Rolls', '판매처: Party City | 가격: $2.79 | 평점: 4.3 | 리뷰: 745개', 'https://encrypted-tbn2.gstatic.com/shopping?q=tbn:ANd9GcRB08veGGdhpU0_7WU0sGjL9ffxCHFZ0T4nhR4gVEgbuot0xWIURY4bOxTEsDoefd0a5VovUQ6PeiHRZ4P693Sco4d--ZkBlR4MnJ5LbY2EkpFz_YZmyZiqv6Y',
  100, 'steady',
  95, 85, 100, 75,
  ARRAY['Party City','$2.79','★4.3'], ARRAY['https://www.google.com/search?ibp=oshop&q=trending food snacks dessert 2026&prds=catalogid:16859939635266901758,headlineOfferDocid:9326686925678730779,imageDocid:17272203354260722526,rds:PC_1950855059784799267|PROD_PC_1950855059784799267,gpcid:1950855059784799267,mid:576462770939885278,pvt:hg&hl=en&gl=us&udm=28'],
  '2026-03-17T05:52:08.866748+00:00', '2026-03-17T05:52:08.866748+00:00'
);
INSERT INTO trends (country_id, category_id, name, description, image_url, heat_score, heat_status, search_score, social_score, ecommerce_score, news_score, tags, source_urls, first_detected_at, last_updated_at) VALUES (
  (SELECT id FROM countries WHERE code='US'),
  (SELECT id FROM categories WHERE slug='food'),
  'Chili Chocolate Crunch Bar 3-Pack', '판매처: Momofuku | 가격: $27.00 | 평점: 4.2 | 리뷰: 40개', 'https://encrypted-tbn1.gstatic.com/shopping?q=tbn:ANd9GcTcBQpjj7ngiM4jfVycMk4Lsp-BFhV5qoxeSsHNPBbettvYVVHZLYLacZnuer7fdRH3Z0I0vgwIryW78s-T7kIOom_dUYCKHBfQ4c-zjlHZGlZtM3C19E33Xlun',
  95, 'steady',
  90, 80, 95, 70,
  ARRAY['Momofuku','$27.00','★4.2'], ARRAY['https://www.google.com/search?ibp=oshop&q=trending food snacks dessert 2026&prds=productid:13410288378496939815,headlineOfferDocid:13410288378496939815,imageDocid:551990903226876665,rds:LO_13410288378496939815|PROD_LO_13410288378496939815,pvt:hg&hl=en&gl=us&udm=28'],
  '2026-03-17T05:52:08.866748+00:00', '2026-03-17T05:52:08.866748+00:00'
);
INSERT INTO trends (country_id, category_id, name, description, image_url, heat_score, heat_status, search_score, social_score, ecommerce_score, news_score, tags, source_urls, first_detected_at, last_updated_at) VALUES (
  (SELECT id FROM countries WHERE code='US'),
  (SELECT id FROM categories WHERE slug='food'),
  'Atkins Keto Caramel Almond Clusters', '판매처: Walmart | 가격: $10.48 | 평점: 4.7 | 리뷰: 2,300개', 'https://encrypted-tbn2.gstatic.com/shopping?q=tbn:ANd9GcShyPRvL_-qpPZudOTPdOSkKzmmci2FTarYCtqhDQ5bx6tax3i2fEeaNOpIktwh6_tSD5VKsI4r67mMw-HB-Nt3rWmB5en6Mew-mFKbcRwJdsLWgtG6OSbWgQ',
  100, 'steady',
  95, 85, 100, 75,
  ARRAY['Walmart','$10.48','★4.7'], ARRAY['https://www.google.com/search?ibp=oshop&q=trending food snacks dessert 2026&prds=catalogid:12323890796216236951,headlineOfferDocid:8955987074533415574,imageDocid:1727450815347701702,rds:PC_13330944452663829266|PROD_PC_13330944452663829266,gpcid:13330944452663829266,mid:576462622916813012,pvt:hg&hl=en&gl=us&udm=28'],
  '2026-03-17T05:52:08.866748+00:00', '2026-03-17T05:52:08.866748+00:00'
);
INSERT INTO trends (country_id, category_id, name, description, image_url, heat_score, heat_status, search_score, social_score, ecommerce_score, news_score, tags, source_urls, first_detected_at, last_updated_at) VALUES (
  (SELECT id FROM countries WHERE code='US'),
  (SELECT id FROM categories WHERE slug='food'),
  'Drizzilicious S''mores Rice Crisp Mini Smores', '판매처: Netrition.com | 가격: $4.79 | 평점: 4.7 | 리뷰: 317개', 'https://encrypted-tbn1.gstatic.com/shopping?q=tbn:ANd9GcS4pLPIIVtp7pwCOr5ty44EjgOoBpCTrjXgIP-4ZWIM6ZC3WjpcEgBJ5dHAlcdhJnNs8TVKHSXesp_0ZWdmAT2D-0VjPL9L2A-OEOqrDu4HecDrG78Pp2-Z',
  99, 'steady',
  94, 84, 99, 74,
  ARRAY['Netrition.com','$4.79','★4.7'], ARRAY['https://www.google.com/search?ibp=oshop&q=trending food snacks dessert 2026&prds=catalogid:17213831725133315239,headlineOfferDocid:10141458212465838303,imageDocid:605031278026067937,rds:PC_4455571005268482655|PROD_PC_4455571005268482655,gpcid:4455571005268482655,mid:576462845885968672,pvt:hg&hl=en&gl=us&udm=28'],
  '2026-03-17T05:52:08.866748+00:00', '2026-03-17T05:52:08.866748+00:00'
);
INSERT INTO trends (country_id, category_id, name, description, image_url, heat_score, heat_status, search_score, social_score, ecommerce_score, news_score, tags, source_urls, first_detected_at, last_updated_at) VALUES (
  (SELECT id FROM countries WHERE code='US'),
  (SELECT id FROM categories WHERE slug='food'),
  'Assorted Cheesecake Bites, Pastries, and Scones (Raspberry)', '판매처: Wisconsin Cheeseman | 가격: $31.99 | 평점: 4.0 | 리뷰: 1개', 'https://encrypted-tbn3.gstatic.com/shopping?q=tbn:ANd9GcShexcH-90g5oeolxZpeytaxfIIxFJ7MG72IbfKl31MJNVnH2CSvVsxD_6bbTo_w1tzC0umiy_T-X7N55jVyccURjlFNlUP1WfHAdSYdnU',
  77, 'steady',
  72, 62, 77, 52,
  ARRAY['Wisconsin Cheeseman','$31.99','★4.0'], ARRAY['https://www.google.com/search?ibp=oshop&q=trending food snacks dessert 2026&prds=catalogid:4646408521786583815,headlineOfferDocid:1586321133912717619,imageDocid:12450044685091350451,rds:PC_15192399429497104726|PROD_PC_15192399429497104726,gpcid:15192399429497104726,pvt:hg&hl=en&gl=us&udm=28'],
  '2026-03-17T05:52:08.866748+00:00', '2026-03-17T05:52:08.866748+00:00'
);
INSERT INTO trends (country_id, category_id, name, description, image_url, heat_score, heat_status, search_score, social_score, ecommerce_score, news_score, tags, source_urls, first_detected_at, last_updated_at) VALUES (
  (SELECT id FROM countries WHERE code='US'),
  (SELECT id FROM categories WHERE slug='food'),
  'Fun Flavors Box Sweet Pastry Dessert Snack Care Package', '판매처: Fun Flavors Box | 가격: $38.99 | 평점: 1.8 | 리뷰: 4개', 'https://encrypted-tbn3.gstatic.com/shopping?q=tbn:ANd9GcQwQS8pvPDLLOUQnPV5P-17lLdYDJM5uEA7H3I8Um9Wmp3yX1BXTxthlNMmXpMtDLq6xF1AGb5Wvpc3p3ZRGx8FAmqyKFCAVOJ7ksi_rtw3W7vXi5iL53CcDQ',
  56, 'new',
  51, 41, 56, 31,
  ARRAY['Fun Flavors Box','$38.99','★1.8'], ARRAY['https://www.google.com/search?ibp=oshop&q=trending food snacks dessert 2026&prds=catalogid:11774676147380326856,headlineOfferDocid:8486040893362854335,imageDocid:8082581386688849503,rds:PC_2483686511845597972|PROD_PC_2483686511845597972,gpcid:2483686511845597972,mid:576462601383023202,pvt:hg&hl=en&gl=us&udm=28'],
  '2026-03-17T05:52:08.866748+00:00', '2026-03-17T05:52:08.866748+00:00'
);
INSERT INTO trends (country_id, category_id, name, description, image_url, heat_score, heat_status, search_score, social_score, ecommerce_score, news_score, tags, source_urls, first_detected_at, last_updated_at) VALUES (
  (SELECT id FROM countries WHERE code='US'),
  (SELECT id FROM categories WHERE slug='entertainment'),
  'Pixicade! Draw Your Own Video Games', '판매처: Walmart | 가격: $19.97 | 평점: 4.6 | 리뷰: 224개', 'https://encrypted-tbn3.gstatic.com/shopping?q=tbn:ANd9GcSk0lnCrnkY5fD97NiqDHRlQDvJnWx8aDvWqtV_GgMaNITUiaakpACMMxikJXXM8xmCKMv6uPUTQnuM_ZB0waYsJhfJzAS0tQWE85tyNwQt05SMQHcyksF2Mw',
  100, 'rising',
  95, 85, 100, 75,
  ARRAY['Walmart','$19.97','★4.6'], ARRAY['https://www.google.com/search?ibp=oshop&q=trending toys games gadgets hobby 2026&prds=catalogid:10080730850938793841,headlineOfferDocid:9527852305711755670,imageDocid:17495305112637708227,rds:PC_8528635798895753679|PROD_PC_8528635798895753679,gpcid:8528635798895753679,mid:576462820102934303,pvt:hg&hl=en&gl=us&udm=28'],
  '2026-03-17T05:52:08.866748+00:00', '2026-03-17T05:52:08.866748+00:00'
);
INSERT INTO trends (country_id, category_id, name, description, image_url, heat_score, heat_status, search_score, social_score, ecommerce_score, news_score, tags, source_urls, first_detected_at, last_updated_at) VALUES (
  (SELECT id FROM countries WHERE code='US'),
  (SELECT id FROM categories WHERE slug='entertainment'),
  'LEGO Creator Retro Gaming Console', '판매처: Best Buy | 가격: $39.37 | 평점: 4.9 | 리뷰: 59개', 'https://encrypted-tbn2.gstatic.com/shopping?q=tbn:ANd9GcSirG5-01FCq746W2ii64yBhrsebG5FJsVXStqt3Im6EranYpkFZIiEJI-Sk8qm4_M5YGTL7J-P2tUivkiivH8YLHVcTyqECRACG8dSFx5Woz_9mmqZOp-y1Q',
  100, 'rising',
  95, 85, 100, 75,
  ARRAY['Best Buy','$39.37','★4.9'], ARRAY['https://www.google.com/search?ibp=oshop&q=trending toys games gadgets hobby 2026&prds=catalogid:13533578583947156416,headlineOfferDocid:18231098293232664646,imageDocid:12695945331530927274,rds:PC_7222415118414395839|PROD_PC_7222415118414395839,gpcid:7222415118414395839,mid:576462869913241860,pvt:hg&hl=en&gl=us&udm=28'],
  '2026-03-17T05:52:08.866748+00:00', '2026-03-17T05:52:08.866748+00:00'
);
INSERT INTO trends (country_id, category_id, name, description, image_url, heat_score, heat_status, search_score, social_score, ecommerce_score, news_score, tags, source_urls, first_detected_at, last_updated_at) VALUES (
  (SELECT id FROM countries WHERE code='US'),
  (SELECT id FROM categories WHERE slug='entertainment'),
  'Thames & Kosmos Mega Cyborg Hand', '판매처: Rainbow Resource Center | 가격: $40.40 | 평점: 3.8 | 리뷰: 168개', 'https://encrypted-tbn1.gstatic.com/shopping?q=tbn:ANd9GcQphPSlPeNGPGYzE2Yf8l7wmH2E1x-C-QJBKg6vNg8RWE5HmnqhBbxyRz_fCjH-WwtV9F4OC2Z1e8cRuzE8G899A9ITGcteayw_xkf57vtQGXro2B8eKeireA',
  100, 'rising',
  95, 85, 100, 75,
  ARRAY['Rainbow Resource Center','$40.40','★3.8'], ARRAY['https://www.google.com/search?ibp=oshop&q=trending toys games gadgets hobby 2026&prds=catalogid:3810903208265727088,headlineOfferDocid:8606668236268274287,imageDocid:10927736681140739577,rds:PC_7765593764077158681|PROD_PC_7765593764077158681,gpcid:7765593764077158681,mid:576462732677288424,pvt:hg&hl=en&gl=us&udm=28'],
  '2026-03-17T05:52:08.866748+00:00', '2026-03-17T05:52:08.866748+00:00'
);
INSERT INTO trends (country_id, category_id, name, description, image_url, heat_score, heat_status, search_score, social_score, ecommerce_score, news_score, tags, source_urls, first_detected_at, last_updated_at) VALUES (
  (SELECT id FROM countries WHERE code='US'),
  (SELECT id FROM categories WHERE slug='entertainment'),
  'Mini Brands Magic Cook Kitchen Ice- Cream Maker', '판매처: Walmart | 가격: $9.97 | 평점: 5.0 | 리뷰: 4개', 'https://encrypted-tbn1.gstatic.com/shopping?q=tbn:ANd9GcScTYdUJrTMjPiMumBT8613XyALFyao67A033oLxCLD5gjsz9IcGRtG03Q9E2YASuouu_OFNCVtmqtRQB5tXu2FNhRBKccp0mikgiV69TkOwYLZYMJGKG3G_zk',
  100, 'rising',
  95, 85, 100, 75,
  ARRAY['Walmart','$9.97','★5.0'], ARRAY['https://www.google.com/search?ibp=oshop&q=trending toys games gadgets hobby 2026&prds=catalogid:18312863546006575683,headlineOfferDocid:14208877225038852827,imageDocid:12399195335985265817,rds:PC_9264198260492806057|PROD_PC_9264198260492806057,gpcid:9264198260492806057,mid:576462873295542852,pvt:hg&hl=en&gl=us&udm=28'],
  '2026-03-17T05:52:08.866748+00:00', '2026-03-17T05:52:08.866748+00:00'
);
INSERT INTO trends (country_id, category_id, name, description, image_url, heat_score, heat_status, search_score, social_score, ecommerce_score, news_score, tags, source_urls, first_detected_at, last_updated_at) VALUES (
  (SELECT id FROM countries WHERE code='US'),
  (SELECT id FROM categories WHERE slug='entertainment'),
  'Bluey Hide & Seek Game', '판매처: Target | 가격: $11.99 | 평점: 4.7 | 리뷰: 410개', 'https://encrypted-tbn0.gstatic.com/shopping?q=tbn:ANd9GcR-ooVvQooiC8bDb99aN_2Gqvzg7cBBKHSvzLC6N-domPTb3iSn5RpX4rp9k8-deUBhLITq9M8WOaZIgCJSRqCy-jXtb0Hi',
  100, 'rising',
  95, 85, 100, 75,
  ARRAY['Target','$11.99','★4.7'], ARRAY['https://www.google.com/search?ibp=oshop&q=trending toys games gadgets hobby 2026&prds=catalogid:147440787667343583,headlineOfferDocid:1674601882820769041,imageDocid:8585164785743324384,rds:PC_4128987955109117774|PROD_PC_4128987955109117774,gpcid:4128987955109117774,mid:576462787413741031,pvt:hg&hl=en&gl=us&udm=28'],
  '2026-03-17T05:52:08.866748+00:00', '2026-03-17T05:52:08.866748+00:00'
);
INSERT INTO trends (country_id, category_id, name, description, image_url, heat_score, heat_status, search_score, social_score, ecommerce_score, news_score, tags, source_urls, first_detected_at, last_updated_at) VALUES (
  (SELECT id FROM countries WHERE code='US'),
  (SELECT id FROM categories WHERE slug='entertainment'),
  'Make Market Miniature Gaming Set', '판매처: Michaels Stores | 가격: $13.99 | 평점: 5.0 | 리뷰: 2개', 'https://encrypted-tbn3.gstatic.com/shopping?q=tbn:ANd9GcQcsZEVzvFDPUvjPzfh4V8WjUPjJDndeAY-QKj2RTBdURRcpsqZoV8qpVnrsue_BuepideI5r0JRw9ail6lbYPAUNjgSqm7rdR54_4vcruULrtoBbPSLlem',
  100, 'steady',
  95, 85, 100, 75,
  ARRAY['Michaels Stores','$13.99','★5.0'], ARRAY['https://www.google.com/search?ibp=oshop&q=trending toys games gadgets hobby 2026&prds=catalogid:16969340573580470475,headlineOfferDocid:703409020961788686,imageDocid:16686428863406053835,rds:PC_7461307684365346189|PROD_PC_7461307684365346189,gpcid:7461307684365346189,mid:576462518568456423,pvt:hg&hl=en&gl=us&udm=28'],
  '2026-03-17T05:52:08.866748+00:00', '2026-03-17T05:52:08.866748+00:00'
);
INSERT INTO trends (country_id, category_id, name, description, image_url, heat_score, heat_status, search_score, social_score, ecommerce_score, news_score, tags, source_urls, first_detected_at, last_updated_at) VALUES (
  (SELECT id FROM countries WHERE code='US'),
  (SELECT id FROM categories WHERE slug='entertainment'),
  'LEGO Super Mario Game Boy', '판매처: Kohl''s | 가격: $59.99 | 평점: 4.8 | 리뷰: 1,900개', 'https://encrypted-tbn2.gstatic.com/shopping?q=tbn:ANd9GcTK0KKd86rXDeO_S_qmhVdQc32rz6a2bsASwY4XkUkzKxfzDFmsJ4du0HA7cvYM34sewCmQLF3gNnIsmssrehqn9tsu_T4BVsUm1UGbHFXrKSlfJS5FKMmvzA',
  100, 'steady',
  95, 85, 100, 75,
  ARRAY['Kohl''s','$59.99','★4.8'], ARRAY['https://www.google.com/search?ibp=oshop&q=trending toys games gadgets hobby 2026&prds=catalogid:1845943780870367562,headlineOfferDocid:16548724826250482916,imageDocid:14157728262399172858,rds:PC_12383452342090645821|PROD_PC_12383452342090645821,gpcid:12383452342090645821,mid:576462827074482147,pvt:hg&hl=en&gl=us&udm=28'],
  '2026-03-17T05:52:08.866748+00:00', '2026-03-17T05:52:08.866748+00:00'
);
INSERT INTO trends (country_id, category_id, name, description, image_url, heat_score, heat_status, search_score, social_score, ecommerce_score, news_score, tags, source_urls, first_detected_at, last_updated_at) VALUES (
  (SELECT id FROM countries WHERE code='US'),
  (SELECT id FROM categories WHERE slug='entertainment'),
  'Luma ZipString', '판매처: Walmart | 가격: $29.97 | 평점: 4.4 | 리뷰: 1,600개', 'https://encrypted-tbn3.gstatic.com/shopping?q=tbn:ANd9GcQpTkyHjinOa4gBiJWOLnIfpll7wtqkOCTpA3e9wfS7W1GdwI5lBOo2861omfT03DaDaCBCzG4FAnOq6YBDPA9GzbThfawXsMAuFxy7jGcHv55MQy0sZb07Rw',
  100, 'steady',
  95, 85, 100, 75,
  ARRAY['Walmart','$29.97','★4.4'], ARRAY['https://www.google.com/search?ibp=oshop&q=trending toys games gadgets hobby 2026&prds=catalogid:13351508241302076405,headlineOfferDocid:14624580574743601259,imageDocid:10225773747544260807,rds:PC_6539533684269403812|PROD_PC_6539533684269403812,gpcid:6539533684269403812,mid:576462867536096931,pvt:hg&hl=en&gl=us&udm=28'],
  '2026-03-17T05:52:08.866748+00:00', '2026-03-17T05:52:08.866748+00:00'
);
INSERT INTO trends (country_id, category_id, name, description, image_url, heat_score, heat_status, search_score, social_score, ecommerce_score, news_score, tags, source_urls, first_detected_at, last_updated_at) VALUES (
  (SELECT id FROM countries WHERE code='US'),
  (SELECT id FROM categories WHERE slug='entertainment'),
  'Odyssey Toys ReactionWhizz Pocket Game', '판매처: BrandsMart USA | 가격: $4.99', 'https://encrypted-tbn1.gstatic.com/shopping?q=tbn:ANd9GcSmQIUSUb0DBdP___mjk_tRqbhJoXyJ3d82KwSLey4Kt99_YhjEbrdIyip-b9VM9AXAxsmqqCZI9So3egNvrckG6OQKb2R7HA',
  80, 'steady',
  75, 65, 80, 55,
  ARRAY['BrandsMart USA','$4.99'], ARRAY['https://www.google.com/search?ibp=oshop&q=trending toys games gadgets hobby 2026&prds=catalogid:507058380579670138,headlineOfferDocid:15170839071173872437,imageDocid:1804233751638241073,gpcid:8114278485761749998,mid:576462867357472667,pvt:hg&hl=en&gl=us&udm=28'],
  '2026-03-17T05:52:08.866748+00:00', '2026-03-17T05:52:08.866748+00:00'
);
INSERT INTO trends (country_id, category_id, name, description, image_url, heat_score, heat_status, search_score, social_score, ecommerce_score, news_score, tags, source_urls, first_detected_at, last_updated_at) VALUES (
  (SELECT id FROM countries WHERE code='US'),
  (SELECT id FROM categories WHERE slug='entertainment'),
  'Lite Brite Classic Light Up Art Set', '판매처: Target | 가격: $14.99 | 평점: 4.1 | 리뷰: 1,800개', 'https://encrypted-tbn3.gstatic.com/shopping?q=tbn:ANd9GcT_CoaQmdRCyis7MdvE2C4rTLWtw8wQMAuyZ4O4lIhTdXio6cnZINH_YtZtiOhoPyklckdbvpRKkKQh239Jl1rQbNDK479Atg',
  100, 'steady',
  95, 85, 100, 75,
  ARRAY['Target','$14.99','★4.1'], ARRAY['https://www.google.com/search?ibp=oshop&q=trending toys games gadgets hobby 2026&prds=catalogid:3978741939008025281,headlineOfferDocid:16647069584800816533,imageDocid:11443274203867162007,rds:PC_17452032669855198868|PROD_PC_17452032669855198868,gpcid:17452032669855198868,mid:576462660814767728,pvt:hg&hl=en&gl=us&udm=28'],
  '2026-03-17T05:52:08.866748+00:00', '2026-03-17T05:52:08.866748+00:00'
);
INSERT INTO trends (country_id, category_id, name, description, image_url, heat_score, heat_status, search_score, social_score, ecommerce_score, news_score, tags, source_urls, first_detected_at, last_updated_at) VALUES (
  (SELECT id FROM countries WHERE code='US'),
  (SELECT id FROM categories WHERE slug='entertainment'),
  'Tower Stack Head to Head Stacking Challenge', '판매처: Walmart | 가격: $17.97 | 평점: 4.6 | 리뷰: 201개', 'https://encrypted-tbn1.gstatic.com/shopping?q=tbn:ANd9GcQ43GuFiftfpNDTNG8Ixl5_DEF0v4jPoGylR73d_Eu2oIHzLwvY9EZ_bJJRBZYBPsp_UEVlaHq-oqL51SuVM793pGIxnnwYc-crTqUFCw6MKOX8h_FGpHpVOA',
  100, 'steady',
  95, 85, 100, 75,
  ARRAY['Walmart','$17.97','★4.6'], ARRAY['https://www.google.com/search?ibp=oshop&q=trending toys games gadgets hobby 2026&prds=catalogid:2846362066226579246,headlineOfferDocid:9365990920446768321,imageDocid:5084599799914701457,rds:PC_16965337889282525445|PROD_PC_16965337889282525445,gpcid:16965337889282525445,mid:576462776677627586,pvt:hg&hl=en&gl=us&udm=28'],
  '2026-03-17T05:52:08.866748+00:00', '2026-03-17T05:52:08.866748+00:00'
);
INSERT INTO trends (country_id, category_id, name, description, image_url, heat_score, heat_status, search_score, social_score, ecommerce_score, news_score, tags, source_urls, first_detected_at, last_updated_at) VALUES (
  (SELECT id FROM countries WHERE code='US'),
  (SELECT id FROM categories WHERE slug='entertainment'),
  'World''s Smallest Perfection', '판매처: The Paper Store | 가격: $8.99 | 평점: 5.0 | 리뷰: 1개', 'https://encrypted-tbn0.gstatic.com/shopping?q=tbn:ANd9GcRKbIRazB6Nu8QuyqxS4hZ6GkgcQosp2t5U8M1EBfiAMnR3MRTpHaq4IfQQI1Up51RUwXyCZsCf8u-BK1ZKafC6Y5RI09Fj5UiDPQ0x---TPT6yoBfUJIb31g',
  92, 'steady',
  87, 77, 92, 67,
  ARRAY['The Paper Store','$8.99','★5.0'], ARRAY['https://www.google.com/search?ibp=oshop&q=trending toys games gadgets hobby 2026&prds=catalogid:1726092527177432437,headlineOfferDocid:3931065789674932367,imageDocid:18013370512083655292,rds:PC_7767377133580193758|PROD_PC_7767377133580193758,gpcid:7767377133580193758,mid:576462833038479274,pvt:hg&hl=en&gl=us&udm=28'],
  '2026-03-17T05:52:08.866748+00:00', '2026-03-17T05:52:08.866748+00:00'
);
INSERT INTO trends (country_id, category_id, name, description, image_url, heat_score, heat_status, search_score, social_score, ecommerce_score, news_score, tags, source_urls, first_detected_at, last_updated_at) VALUES (
  (SELECT id FROM countries WHERE code='US'),
  (SELECT id FROM categories WHERE slug='entertainment'),
  'Magshuto Stunt Park', '판매처: Fat Brain Toys | 가격: $21.95 | 평점: 5.0 | 리뷰: 6개', 'https://encrypted-tbn1.gstatic.com/shopping?q=tbn:ANd9GcQ40vsXkQM_zrUxwpyvGP982uprNNgFDBUtmdLkFS57LmHAZsDWRAISAHfGT4_aH7jSnA24ar2WcZ01d_Y8eiWZCH1oCBC2ZZQiGU1y_MYCSfAqulRMTIcrUQ',
  93, 'steady',
  88, 78, 93, 68,
  ARRAY['Fat Brain Toys','$21.95','★5.0'], ARRAY['https://www.google.com/search?ibp=oshop&q=trending toys games gadgets hobby 2026&prds=catalogid:3640603969638732655,headlineOfferDocid:13971097332530264037,imageDocid:8944877877313756917,rds:PC_2237248890257937219|PROD_PC_2237248890257937219,gpcid:2237248890257937219,mid:576462502725376375,pvt:hg&hl=en&gl=us&udm=28'],
  '2026-03-17T05:52:08.866748+00:00', '2026-03-17T05:52:08.866748+00:00'
);
INSERT INTO trends (country_id, category_id, name, description, image_url, heat_score, heat_status, search_score, social_score, ecommerce_score, news_score, tags, source_urls, first_detected_at, last_updated_at) VALUES (
  (SELECT id FROM countries WHERE code='US'),
  (SELECT id FROM categories WHERE slug='entertainment'),
  'Mini Brands Magic Cook Kitchen Blender', '판매처: Walmart | 가격: $9.97', 'https://encrypted-tbn1.gstatic.com/shopping?q=tbn:ANd9GcQ5impQDE4yAjdma1CM7fxHJ_61eBtsMTXfhHdOu3iXSK-bS08fRGjDc3hq9S_LuOBjGTv3inIda4Go5o8Ah6uxkr_Lc7tb3_xbwiStAJuBItzZ4vQaTxsT2Q',
  67, 'steady',
  62, 52, 67, 42,
  ARRAY['Walmart','$9.97'], ARRAY['https://www.google.com/search?ibp=oshop&q=trending toys games gadgets hobby 2026&prds=catalogid:5839785358161247824,headlineOfferDocid:9767609522839087187,imageDocid:6287032460125946993,gpcid:7643690476943520040,mid:576462873289713474,pvt:hg&hl=en&gl=us&udm=28'],
  '2026-03-17T05:52:08.866748+00:00', '2026-03-17T05:52:08.866748+00:00'
);
INSERT INTO trends (country_id, category_id, name, description, image_url, heat_score, heat_status, search_score, social_score, ecommerce_score, news_score, tags, source_urls, first_detected_at, last_updated_at) VALUES (
  (SELECT id FROM countries WHERE code='US'),
  (SELECT id FROM categories WHERE slug='entertainment'),
  'Marble Run Challenge 2-Player Game', '판매처: Five Below | 가격: $6.00', 'https://encrypted-tbn0.gstatic.com/shopping?q=tbn:ANd9GcT5VqpEf7OjuRdvx4ga_Fa2JpHcAP3VpdnNyB2ZLrbG0f-VyoOHxRVGFX3TZDoO8J2VtlL20floub1t973SYGaF2DxSzp4q8ylabLWair9PAWtu_BoIktsq',
  65, 'steady',
  60, 50, 65, 40,
  ARRAY['Five Below','$6.00'], ARRAY['https://www.google.com/search?ibp=oshop&q=trending toys games gadgets hobby 2026&prds=catalogid:5263240434812388060,headlineOfferDocid:2029229961366344443,imageDocid:1180588431966972332,gpcid:14245843558832242764,mid:576462867949571713,pvt:hg&hl=en&gl=us&udm=28'],
  '2026-03-17T05:52:08.866748+00:00', '2026-03-17T05:52:08.866748+00:00'
);
INSERT INTO trends (country_id, category_id, name, description, image_url, heat_score, heat_status, search_score, social_score, ecommerce_score, news_score, tags, source_urls, first_detected_at, last_updated_at) VALUES (
  (SELECT id FROM countries WHERE code='JP'),
  (SELECT id FROM categories WHERE slug='fashion'),
  'レディース 2点セット セットアップ キャザーセーター&ロングパンツ パンツスーツ 春服 秋服 冬服 ランタンスリーブ ウエストリボン ロング丈 ワイド シンプル おしゃれ レトロ 着痩せ カジュアル ゆったり 大人 可愛い 春', '판매처: Amazon公式サイト | 가격: ￥3,618', 'https://encrypted-tbn0.gstatic.com/shopping?q=tbn:ANd9GcQJMWjwFk5JN6e4oVrek9kCG5keItr4QAst1fSMD-C0V6mUZGyBJlzJGq77OmmfMIQQJX1-sFzAKcLNtJFwkzpKRtXEgZHwHlNJuBb9_O0jkrp31-t8bsGY',
  100, 'rising',
  95, 85, 100, 75,
  ARRAY['Amazon公式サイト','￥3,618'], ARRAY['https://www.google.com/search?ibp=oshop&q=2026 トレンド ファッション 服&prds=catalogid:4188920352963801177,headlineOfferDocid:7891229694657938582,imageDocid:15234976546195518296,gpcid:3341562720601138289,mid:576462867867297402,pvt:a&hl=ja&gl=jp&udm=28'],
  '2026-03-17T05:52:08.866748+00:00', '2026-03-17T05:52:08.866748+00:00'
);
INSERT INTO trends (country_id, category_id, name, description, image_url, heat_score, heat_status, search_score, social_score, ecommerce_score, news_score, tags, source_urls, first_detected_at, last_updated_at) VALUES (
  (SELECT id FROM countries WHERE code='JP'),
  (SELECT id FROM categories WHERE slug='fashion'),
  'MISCH MASCH / 2026春夏新作 ツイード編みフリンジニットワンピース WOMEN トップス > シャツ/ブラウス', '판매처: ZOZOTOWN | 가격: ￥13,200', 'https://encrypted-tbn2.gstatic.com/shopping?q=tbn:ANd9GcThYkFFAn0tyyHq7C35oF40B-Q-M0GAS-OmSfzYGuS-JVis5gn0zNH7JyCknHsZ9LXpdUIN1c9TZzDsKIJCCfteUdjsb-WT',
  97, 'rising',
  92, 82, 97, 72,
  ARRAY['ZOZOTOWN','￥13,200'], ARRAY['https://www.google.com/search?ibp=oshop&q=2026 トレンド ファッション 服&prds=catalogid:17168538751919216967,headlineOfferDocid:6962494228606493394,imageDocid:4677263288609766018,gpcid:12475326127389003310,mid:576462884734082159,pvt:a&hl=ja&gl=jp&udm=28'],
  '2026-03-17T05:52:08.866748+00:00', '2026-03-17T05:52:08.866748+00:00'
);
INSERT INTO trends (country_id, category_id, name, description, image_url, heat_score, heat_status, search_score, social_score, ecommerce_score, news_score, tags, source_urls, first_detected_at, last_updated_at) VALUES (
  (SELECT id FROM countries WHERE code='JP'),
  (SELECT id FROM categories WHERE slug='fashion'),
  '[トップス] 2点コーデセット 2026 レディース ニット 長袖 トップス セーター ケーブル編み 片畦編み ラメ スカート ロング ボトムス フレアスカート ロングスカート 変形 秋 冬 オシャレウォーカー【不可】【50】... フリーサイズ ブラック', '판매처: 楽天市場 - オシャレウォーカー osharewalker | 가격: ￥13,960', 'https://encrypted-tbn1.gstatic.com/shopping?q=tbn:ANd9GcQbGYvOgsTOBt-Dd730-Ns-Gs9CQv7g5vch1u5FTPwabkxZM1yJ9kbDdPxPxe1JX0OnjJQWFs6UBRoIUe6ocBbpgaE7cHbUcXqNCkZ_7_LAWzP8hb80SlCmtg',
  95, 'rising',
  90, 80, 95, 70,
  ARRAY['楽天市場 - オシャレウォーカー osharewalker','￥13,960'], ARRAY['https://www.google.com/search?ibp=oshop&q=2026 トレンド ファッション 服&prds=catalogid:12486539660575181155,headlineOfferDocid:7420669375722065844,imageDocid:11414072641830169133,pvt:a&hl=ja&gl=jp&udm=28'],
  '2026-03-17T05:52:08.866748+00:00', '2026-03-17T05:52:08.866748+00:00'
);
INSERT INTO trends (country_id, category_id, name, description, image_url, heat_score, heat_status, search_score, social_score, ecommerce_score, news_score, tags, source_urls, first_detected_at, last_updated_at) VALUES (
  (SELECT id FROM countries WHERE code='JP'),
  (SELECT id FROM categories WHERE slug='fashion'),
  '2点コーデセット 2026 レディース カーディガン トップス 長袖 羽織 ニットカーディガン スカート ロング ボトムス フレア セミフレア 「メー... S/M/L/LL/3L osharewalker', '판매처: Yahoo!ショッピング - オシャレウォーカー | 가격: ￥8,940', 'https://encrypted-tbn3.gstatic.com/shopping?q=tbn:ANd9GcRRTpniu1tlnR1UR_AX4ciEmqVNTqdFSv7yr06DadZ9Sjq6Oj413hwpcCHRhyf_hROglTGaRM1e77ej-BLQfYqGqfOfC_5h4qk7Wh6MnBlouvzZjshw1SLh',
  92, 'rising',
  87, 77, 92, 67,
  ARRAY['Yahoo!ショッピング - オシャレウォーカー','￥8,940'], ARRAY['https://www.google.com/search?ibp=oshop&q=2026 トレンド ファッション 服&prds=catalogid:6785897022264256249,headlineOfferDocid:8989165133796161345,imageDocid:4312821414988887747,gpcid:654129448179658837,mid:576462543438350377,pvt:a&hl=ja&gl=jp&udm=28'],
  '2026-03-17T05:52:08.866748+00:00', '2026-03-17T05:52:08.866748+00:00'
);
INSERT INTO trends (country_id, category_id, name, description, image_url, heat_score, heat_status, search_score, social_score, ecommerce_score, news_score, tags, source_urls, first_detected_at, last_updated_at) VALUES (
  (SELECT id FROM countries WHERE code='JP'),
  (SELECT id FROM categories WHERE slug='fashion'),
  'ビス VIS ペプラムオーガンジードッキングニットプルオーバー', '판매처: マルイウェブチャネル | 가격: ￥5,929 | 평점: 5 | 리뷰: 4개', 'https://encrypted-tbn1.gstatic.com/shopping?q=tbn:ANd9GcQ7qVn_40cq1M7kP7z_DaDOewVehkc4EyusY4bOAXHK5SUZyUh9YcXpU9ej3nEpCXg_kfHS3urM9ADm_j-7vVIDxBFvWxnDJ4LT4UfDej2533xTsExB9SZGVA',
  100, 'rising',
  95, 85, 100, 75,
  ARRAY['マルイウェブチャネル','￥5,929','★5'], ARRAY['https://www.google.com/search?ibp=oshop&q=2026 トレンド ファッション 服&prds=catalogid:7203250025299075746,headlineOfferDocid:17461703701644217564,imageDocid:9546199611271053233,rds:PC_2575062060621521427|PROD_PC_2575062060621521427,gpcid:2575062060621521427,mid:576462845539239213,pvt:a&hl=ja&gl=jp&udm=28'],
  '2026-03-17T05:52:08.866748+00:00', '2026-03-17T05:52:08.866748+00:00'
);
INSERT INTO trends (country_id, category_id, name, description, image_url, heat_score, heat_status, search_score, social_score, ecommerce_score, news_score, tags, source_urls, first_detected_at, last_updated_at) VALUES (
  (SELECT id FROM countries WHERE code='JP'),
  (SELECT id FROM categories WHERE slug='fashion'),
  'KOBE LETTUCE レディース アウター キャメル フリー', '판매처: ロコンド | 가격: ￥5,662', 'https://encrypted-tbn0.gstatic.com/shopping?q=tbn:ANd9GcS-u0yfVEIfzZdcIV-1gctTJT8Kd2L2wVt-bM82quoh0JP319gE2YLtQCq6F5mUfEHCpRxkBNcybq7kkFyUBBkgecWPZ0NMxF0ihdkGNVs9nGXa2KDjSMuZ',
  87, 'steady',
  82, 72, 87, 62,
  ARRAY['ロコンド','￥5,662'], ARRAY['https://www.google.com/search?ibp=oshop&q=2026 トレンド ファッション 服&prds=catalogid:7981411702438665365,headlineOfferDocid:8277436643273403574,imageDocid:14069808388312283480,gpcid:12604920061287978793,mid:576462841259318465,pvt:a&hl=ja&gl=jp&udm=28'],
  '2026-03-17T05:52:08.866748+00:00', '2026-03-17T05:52:08.866748+00:00'
);
INSERT INTO trends (country_id, category_id, name, description, image_url, heat_score, heat_status, search_score, social_score, ecommerce_score, news_score, tags, source_urls, first_detected_at, last_updated_at) VALUES (
  (SELECT id FROM countries WHERE code='JP'),
  (SELECT id FROM categories WHERE slug='fashion'),
  'Remind me and forever レディースマルチwayトップス+バルーンミニスカートセットアップ', '판매처: パルクローゼット | 가격: ￥6,490', 'https://encrypted-tbn3.gstatic.com/shopping?q=tbn:ANd9GcT42K45hTgwK6nrvjEGpoiPdz-37PxR2jiA4DXtYWr7ahQJVJZLO8peWWGd-FM5FMeEk-yeCJ9y-2pTf13Z9CNsBM4WafoxOrC8SSUc6u8',
  85, 'steady',
  80, 70, 85, 60,
  ARRAY['パルクローゼット','￥6,490'], ARRAY['https://www.google.com/search?ibp=oshop&q=2026 トレンド ファッション 服&prds=catalogid:3625021650279723040,headlineOfferDocid:306311257906797874,imageDocid:2866993599489096351,gpcid:16951609959227574083,mid:576462531717166405,pvt:a&hl=ja&gl=jp&udm=28'],
  '2026-03-17T05:52:08.866748+00:00', '2026-03-17T05:52:08.866748+00:00'
);
INSERT INTO trends (country_id, category_id, name, description, image_url, heat_score, heat_status, search_score, social_score, ecommerce_score, news_score, tags, source_urls, first_detected_at, last_updated_at) VALUES (
  (SELECT id FROM countries WHERE code='JP'),
  (SELECT id FROM categories WHERE slug='fashion'),
  '【ANAYI】【Eternal LINE 2026】シアードビープリーツボウ ワンピース', '판매처: 三越伊勢丹オンラインストア | 가격: ￥71,500', 'https://encrypted-tbn3.gstatic.com/shopping?q=tbn:ANd9GcQbuYf_b1ZxYHGmGlHtecxhhNDaki8SJX2lr8vHX2lRkruX8wo6apa9d5W10B-yunr3Vcn9GkEAdWtFzc010ad58STVDRTx',
  82, 'steady',
  77, 67, 82, 57,
  ARRAY['三越伊勢丹オンラインストア','￥71,500'], ARRAY['https://www.google.com/search?ibp=oshop&q=2026 トレンド ファッション 服&prds=catalogid:6294582200980619738,headlineOfferDocid:8459051944925427181,imageDocid:14333700224799001447,gpcid:2061856272076950318,mid:576462530065678131,pvt:a&hl=ja&gl=jp&udm=28'],
  '2026-03-17T05:52:08.866748+00:00', '2026-03-17T05:52:08.866748+00:00'
);
INSERT INTO trends (country_id, category_id, name, description, image_url, heat_score, heat_status, search_score, social_score, ecommerce_score, news_score, tags, source_urls, first_detected_at, last_updated_at) VALUES (
  (SELECT id FROM countries WHERE code='JP'),
  (SELECT id FROM categories WHERE slug='fashion'),
  '31 Sons de MODE / 2026春夏新作 リボンタイ付きブルゾン WOMEN ジャケット/アウター > ブルゾン', '판매처: ZOZOTOWN | 가격: ￥18,700', 'https://encrypted-tbn0.gstatic.com/shopping?q=tbn:ANd9GcQv2Fpdq4ia2YcqMnkgrhuQpSZZTnIr100tSLKyL2LIJUe8v8psIaor73CoEPMUtHRtzdrW-lZAMKihkWcxhJX_ZMj7OJyS7A',
  80, 'steady',
  75, 65, 80, 55,
  ARRAY['ZOZOTOWN','￥18,700'], ARRAY['https://www.google.com/search?ibp=oshop&q=2026 トレンド ファッション 服&prds=catalogid:13750520733580019299,headlineOfferDocid:4152506406635211679,imageDocid:9318058885422350664,gpcid:2481422227923817832,mid:576462879454698209,pvt:a&hl=ja&gl=jp&udm=28'],
  '2026-03-17T05:52:08.866748+00:00', '2026-03-17T05:52:08.866748+00:00'
);
INSERT INTO trends (country_id, category_id, name, description, image_url, heat_score, heat_status, search_score, social_score, ecommerce_score, news_score, tags, source_urls, first_detected_at, last_updated_at) VALUES (
  (SELECT id FROM countries WHERE code='JP'),
  (SELECT id FROM categories WHERE slug='fashion'),
  '2点コーデセット 2026 レディース カットソー 裏毛 トップス 長袖 配色 レース プルオーバー パンツ ボトムス デニム ジーンズ 長ズボン 「メ... S/M/L/LL/3L osharewalker', '판매처: Yahoo!ショッピング - オシャレウォーカー | 가격: ￥9,570', 'https://encrypted-tbn2.gstatic.com/shopping?q=tbn:ANd9GcQv8APbcusrUr0MbfMwZsBG_KgIqXEsMAolhJt9STFU7UnYRGYFAV5JNfUvcgJM9cMM0x63J2iR_5kNIFFCp76PoAXbzrPktyKk_l-BfVueTeBdQmyqKOuD_A',
  77, 'steady',
  72, 62, 77, 52,
  ARRAY['Yahoo!ショッピング - オシャレウォーカー','￥9,570'], ARRAY['https://www.google.com/search?ibp=oshop&q=2026 トレンド ファッション 服&prds=catalogid:11053229407611810475,headlineOfferDocid:13183012725704619292,imageDocid:7572091784976276362,gpcid:7258923347637439297,mid:576462543437868375,pvt:a&hl=ja&gl=jp&udm=28'],
  '2026-03-17T05:52:08.866748+00:00', '2026-03-17T05:52:08.866748+00:00'
);
INSERT INTO trends (country_id, category_id, name, description, image_url, heat_score, heat_status, search_score, social_score, ecommerce_score, news_score, tags, source_urls, first_detected_at, last_updated_at) VALUES (
  (SELECT id FROM countries WHERE code='JP'),
  (SELECT id FROM categories WHERE slug='fashion'),
  '[トップス] 2点コーデセット 2026 レディース カットソー 裏毛 トップス 長袖 配色 レース プルオーバー スタンドネック ハイネック ドルマンスリーブ パンツ ボトムス デニム ジーンズ 秋 冬 春 オシャレウォーカー【不可】【50】... フリーサイズ ブラック', '판매처: 楽天市場 - オシャレウォーカー osharewalker | 가격: ￥9,570', 'https://encrypted-tbn3.gstatic.com/shopping?q=tbn:ANd9GcRjWkyqhA6H-rl71vSmFWVr0E5X2k7BNLl-UzPkzYc3jTjG9wm0nQ6QUibJf62IMAVZ2IUEc-enHskErGdGTfS5exGoskARpZAREtUId14MbNHzfM0DiZ2x',
  75, 'steady',
  70, 60, 75, 50,
  ARRAY['楽天市場 - オシャレウォーカー osharewalker','￥9,570'], ARRAY['https://www.google.com/search?ibp=oshop&q=2026 トレンド ファッション 服&prds=catalogid:16947616088092812117,headlineOfferDocid:15820388618219606013,imageDocid:3028460370764292615,pvt:a&hl=ja&gl=jp&udm=28'],
  '2026-03-17T05:52:08.866748+00:00', '2026-03-17T05:52:08.866748+00:00'
);
INSERT INTO trends (country_id, category_id, name, description, image_url, heat_score, heat_status, search_score, social_score, ecommerce_score, news_score, tags, source_urls, first_detected_at, last_updated_at) VALUES (
  (SELECT id FROM countries WHERE code='JP'),
  (SELECT id FROM categories WHERE slug='fashion'),
  '23区 ファンシーツィーディー ポケットデザイン カーディガン', '판매처: オンワード・クローゼット | 가격: ￥29,920', 'https://encrypted-tbn2.gstatic.com/shopping?q=tbn:ANd9GcR5nNH8JqsrPhVBq-pW2O1_6jgC3tJLL46mlT4Wf7UVpvj4zntxTjNEWiuL1BoAasp7JTt77Op5vF0KwCD5DMVS66MKqNNeQpqzEr6_bZ_OpS6I94lRk-YFgZ8',
  72, 'steady',
  67, 57, 72, 47,
  ARRAY['オンワード・クローゼット','￥29,920'], ARRAY['https://www.google.com/search?ibp=oshop&q=2026 トレンド ファッション 服&prds=catalogid:3037912467733197359,headlineOfferDocid:12013359040660477922,imageDocid:13918165992581712582,gpcid:5281442030905772326,mid:576462877189083965,pvt:a&hl=ja&gl=jp&udm=28'],
  '2026-03-17T05:52:08.866748+00:00', '2026-03-17T05:52:08.866748+00:00'
);
INSERT INTO trends (country_id, category_id, name, description, image_url, heat_score, heat_status, search_score, social_score, ecommerce_score, news_score, tags, source_urls, first_detected_at, last_updated_at) VALUES (
  (SELECT id FROM countries WHERE code='JP'),
  (SELECT id FROM categories WHERE slug='fashion'),
  'THIRD MAGAZINE ボクシーロゴポケットTシャツ サードマガジン', '판매처: ELLE SHOP | 가격: ￥16,500', 'https://encrypted-tbn3.gstatic.com/shopping?q=tbn:ANd9GcQLX0pAFXbaCgKGj4K2xOlm9A7_ArWQsqFtujyni-wW8Bca1W0qVAAl2lDcyo4P3uB6d9EWtv0WPFxv-GDZUzot5wsqvEJ2zNkbZmo9LJYnf04eyGQqvE3r-A',
  70, 'steady',
  65, 55, 70, 45,
  ARRAY['ELLE SHOP','￥16,500'], ARRAY['https://www.google.com/search?ibp=oshop&q=2026 トレンド ファッション 服&prds=catalogid:18046847246667266338,headlineOfferDocid:7611418763284574604,imageDocid:1287632043881455623,gpcid:11744380018313655681,mid:576462543213393601,pvt:a&hl=ja&gl=jp&udm=28'],
  '2026-03-17T05:52:08.866748+00:00', '2026-03-17T05:52:08.866748+00:00'
);
INSERT INTO trends (country_id, category_id, name, description, image_url, heat_score, heat_status, search_score, social_score, ecommerce_score, news_score, tags, source_urls, first_detected_at, last_updated_at) VALUES (
  (SELECT id FROM countries WHERE code='JP'),
  (SELECT id FROM categories WHERE slug='fashion'),
  'WOMEN mystic レディース', '판매처: パルクローゼット | 가격: ￥5,940 | 평점: 5 | 리뷰: 1개', 'https://encrypted-tbn2.gstatic.com/shopping?q=tbn:ANd9GcRPIgRAMIqFw7AY00n30kv_YXx11WzI1IcH__mHv6V_-bDIwSWvEZ1zPTNHmXnMoLaBUg1XNiaH3AgFFdasrETsxo4JtZdshTtOXjYKyGM',
  87, 'steady',
  82, 72, 87, 62,
  ARRAY['パルクローゼット','￥5,940','★5'], ARRAY['https://www.google.com/search?ibp=oshop&q=2026 トレンド ファッション 服&prds=catalogid:12438102955898738906,headlineOfferDocid:3501542321116477827,imageDocid:2698081603889519270,rds:PC_2732290787623164788|PROD_PC_2732290787623164788,gpcid:2732290787623164788,mid:576462873301690150,pvt:a&hl=ja&gl=jp&udm=28'],
  '2026-03-17T05:52:08.866748+00:00', '2026-03-17T05:52:08.866748+00:00'
);
INSERT INTO trends (country_id, category_id, name, description, image_url, heat_score, heat_status, search_score, social_score, ecommerce_score, news_score, tags, source_urls, first_detected_at, last_updated_at) VALUES (
  (SELECT id FROM countries WHERE code='JP'),
  (SELECT id FROM categories WHERE slug='fashion'),
  'KOBE LETTUCE レディース トップス', '판매처: 神戸レタス | 가격: ￥1,790', 'https://encrypted-tbn2.gstatic.com/shopping?q=tbn:ANd9GcRNQndNpxFna2X2-9xeO1yL2DPCuL3stdc5pnX6zCG3DpoF_t3Fk9SIjl6h0Uw1Ipf5JlMYnkkKrkaA341RfxrVACfmf6xIAvsulDY4mJEGeL_ltJ0n2M15PAI',
  65, 'steady',
  60, 50, 65, 40,
  ARRAY['神戸レタス','￥1,790'], ARRAY['https://www.google.com/search?ibp=oshop&q=2026 トレンド ファッション 服&prds=catalogid:16673980514334571588,headlineOfferDocid:6621500362257989423,imageDocid:2655160270572028834,gpcid:7580915571146528639,mid:576462518041765036,pvt:a&hl=ja&gl=jp&udm=28'],
  '2026-03-17T05:52:08.866748+00:00', '2026-03-17T05:52:08.866748+00:00'
);
INSERT INTO trends (country_id, category_id, name, description, image_url, heat_score, heat_status, search_score, social_score, ecommerce_score, news_score, tags, source_urls, first_detected_at, last_updated_at) VALUES (
  (SELECT id FROM countries WHERE code='JP'),
  (SELECT id FROM categories WHERE slug='products'),
  'レコルト 自動調理ポット', '판매처: ビックカメラ.com | 가격: ￥13,200 | 평점: 5 | 리뷰: 9,265개', 'https://encrypted-tbn0.gstatic.com/shopping?q=tbn:ANd9GcRkdhUeHBLs-c7St2cU4JqCt6bR04jbMxB180A9O6CpBmbBPRTMLhKXNzPq78rg7OCtV_ZfwC9t3TJGaDHRO4Qla27cReafTXzhemNDPeA',
  100, 'rising',
  95, 85, 100, 75,
  ARRAY['ビックカメラ.com','￥13,200','★5'], ARRAY['https://www.google.com/search?ibp=oshop&q=2026 人気商品 トレンド おすすめ&prds=catalogid:11597525713990426288,headlineOfferDocid:961767701282595939,imageDocid:13695851305611252464,rds:PC_2947980212304428338|PROD_PC_2947980212304428338,gpcid:2947980212304428338,mid:576462866662416963,pvt:hg&hl=ja&gl=jp&udm=28'],
  '2026-03-17T05:52:08.866748+00:00', '2026-03-17T05:52:08.866748+00:00'
);
INSERT INTO trends (country_id, category_id, name, description, image_url, heat_score, heat_status, search_score, social_score, ecommerce_score, news_score, tags, source_urls, first_detected_at, last_updated_at) VALUES (
  (SELECT id FROM countries WHERE code='JP'),
  (SELECT id FROM categories WHERE slug='products'),
  'スマートウォッチ 1.6 インチAMOLED大画面 軍用規格 耐衝撃 GPS運動模式記録 Bluetooth5.3通話 L/電気製品>', '판매처: Amazon公式サイト | 가격: ￥5,998', 'https://encrypted-tbn2.gstatic.com/shopping?q=tbn:ANd9GcSsOHTV0tRjijXqFHBFu2-t60zLqNllF6QPGeY3zV5sPmYpf1AYznCpRYB3cSJNduh7APePgN0fHRxbUJ98-A2UvCl8yNbJ-OZnsOnQDfimavTR_v8-GLTm',
  97, 'rising',
  92, 82, 97, 72,
  ARRAY['Amazon公式サイト','￥5,998'], ARRAY['https://www.google.com/search?ibp=oshop&q=2026 人気商品 トレンド おすすめ&prds=catalogid:17124165959420259782,headlineOfferDocid:4294754388313759358,imageDocid:7138039530916928362,gpcid:3101465621858344188,mid:576462882315882188,pvt:hg&hl=ja&gl=jp&udm=28'],
  '2026-03-17T05:52:08.866748+00:00', '2026-03-17T05:52:08.866748+00:00'
);
INSERT INTO trends (country_id, category_id, name, description, image_url, heat_score, heat_status, search_score, social_score, ecommerce_score, news_score, tags, source_urls, first_detected_at, last_updated_at) VALUES (
  (SELECT id FROM countries WHERE code='JP'),
  (SELECT id FROM categories WHERE slug='products'),
  'coen women レディース ブークレ 2way ミックスニットカーディガン', '판매처: コーエン公式通販 | 가격: ￥2,376 | 평점: 5 | 리뷰: 5개', 'https://encrypted-tbn1.gstatic.com/shopping?q=tbn:ANd9GcQMPWPUXm-2JIVGbPYilX_zzvhNbjsmhr4adtL9g0eqr3Z3EbTZuh8gS5W9IpFjOJt7lFqpFK15EKsmLlTxVlwX3m1kmKID',
  100, 'rising',
  95, 85, 100, 75,
  ARRAY['コーエン公式通販','￥2,376','★5'], ARRAY['https://www.google.com/search?ibp=oshop&q=2026 人気商品 トレンド おすすめ&prds=catalogid:3134675252323177224,headlineOfferDocid:10572857420399361742,imageDocid:8915140285021530097,rds:PC_17140198675756122087|PROD_PC_17140198675756122087,gpcid:7928810185613080736,mid:576462847527980701,pvt:hg&hl=ja&gl=jp&udm=28'],
  '2026-03-17T05:52:08.866748+00:00', '2026-03-17T05:52:08.866748+00:00'
);
INSERT INTO trends (country_id, category_id, name, description, image_url, heat_score, heat_status, search_score, social_score, ecommerce_score, news_score, tags, source_urls, first_detected_at, last_updated_at) VALUES (
  (SELECT id FROM countries WHERE code='JP'),
  (SELECT id FROM categories WHERE slug='products'),
  'YSL ラブシャイン キャンディ グロウ バーム', '판매처: ＠cosme shopping | 가격: ￥5,390 | 평점: 5 | 리뷰: 4,407개', 'https://encrypted-tbn2.gstatic.com/shopping?q=tbn:ANd9GcQbwMMSPBN-b3T1z3YId3mZgMVO-HnS7TYaWG2xhmbKoor9TnT8LgHMQsNraFmK-wDBpkF88_tntqo-HC6fNrUGaegXMN9O',
  100, 'rising',
  95, 85, 100, 75,
  ARRAY['＠cosme shopping','￥5,390','★5'], ARRAY['https://www.google.com/search?ibp=oshop&q=2026 人気商品 トレンド おすすめ&prds=catalogid:6794522672040058919,headlineOfferDocid:14533199705392596813,imageDocid:6568818404007230554,rds:PC_7956823683931535884|PROD_PC_7956823683931535884,gpcid:7956823683931535884,mid:576462852262833015,pvt:hg&hl=ja&gl=jp&udm=28'],
  '2026-03-17T05:52:08.866748+00:00', '2026-03-17T05:52:08.866748+00:00'
);
INSERT INTO trends (country_id, category_id, name, description, image_url, heat_score, heat_status, search_score, social_score, ecommerce_score, news_score, tags, source_urls, first_detected_at, last_updated_at) VALUES (
  (SELECT id FROM countries WHERE code='JP'),
  (SELECT id FROM categories WHERE slug='products'),
  'レコルト recolte RPD-4 ポットデュオ キャレ', '판매처: レコルト公式オンラインショップ | 가격: ￥8,800 | 평점: 5 | 리뷰: 820개', 'https://encrypted-tbn2.gstatic.com/shopping?q=tbn:ANd9GcRs2wfgGHCpb408tCWXUwkSadqUkbPo8GaAF1I-h8Rfje0qO-IYBIabgkFcTkcOHSrTVWiz5vMK5CkoaZA_FleDN2aBXul-7k8EZ_sDTHT3wEpdimTG8hqfZg',
  100, 'rising',
  95, 85, 100, 75,
  ARRAY['レコルト公式オンラインショップ','￥8,800','★5'], ARRAY['https://www.google.com/search?ibp=oshop&q=2026 人気商品 トレンド おすすめ&prds=catalogid:1783270769539664756,headlineOfferDocid:8321319878709228689,imageDocid:11325312369811904682,rds:PC_4276177445804118586|PROD_PC_4276177445804118586,gpcid:4276177445804118586,mid:576462701526432869,pvt:hg&hl=ja&gl=jp&udm=28'],
  '2026-03-17T05:52:08.866748+00:00', '2026-03-17T05:52:08.866748+00:00'
);
INSERT INTO trends (country_id, category_id, name, description, image_url, heat_score, heat_status, search_score, social_score, ecommerce_score, news_score, tags, source_urls, first_detected_at, last_updated_at) VALUES (
  (SELECT id FROM countries WHERE code='JP'),
  (SELECT id FROM categories WHERE slug='products'),
  '23区 スクエアフラット ショルダーバッグ / ショルダーバッグ', '판매처: オンワード・クローゼット | 가격: ￥13,970', 'https://encrypted-tbn3.gstatic.com/shopping?q=tbn:ANd9GcQrEqbx5U9fSe0cB9MOsN3ChUjRaJW_CcZWoO0Abfv2oUykADhggxyh6cXFaYYwGhiwal_ZB3cI1njTN-PvWRv3KidmSGFm9_pepDvZb0nlvpdc6Kis5c4bDw',
  87, 'steady',
  82, 72, 87, 62,
  ARRAY['オンワード・クローゼット','￥13,970'], ARRAY['https://www.google.com/search?ibp=oshop&q=2026 人気商品 トレンド おすすめ&prds=catalogid:13147489074685023552,headlineOfferDocid:8531788567377048346,imageDocid:16249306687161280767,gpcid:15727378121012431582,mid:576462878443372188,pvt:hg&hl=ja&gl=jp&udm=28'],
  '2026-03-17T05:52:08.866748+00:00', '2026-03-17T05:52:08.866748+00:00'
);
INSERT INTO trends (country_id, category_id, name, description, image_url, heat_score, heat_status, search_score, social_score, ecommerce_score, news_score, tags, source_urls, first_detected_at, last_updated_at) VALUES (
  (SELECT id FROM countries WHERE code='JP'),
  (SELECT id FROM categories WHERE slug='products'),
  'Classical Elf / 《JaVa ジャバコラボ》重ね上手は、おめかし上手。チュール レイヤード バックプリント ミニ 裏毛 長袖 ロンT WOMEN トップス > Tシャツ/カットソー', '판매처: ZOZOTOWN | 가격: ￥2,760 | 평점: 5 | 리뷰: 256개', 'https://encrypted-tbn1.gstatic.com/shopping?q=tbn:ANd9GcQD2nTMK_nOMKdGFQUn7l76_g466nW6KjbFdrZmUFlVu0wOXaf-lxbCvdfvXtpHIyBFCnbgeChG5eh5E8jufnfMlHV3hACD',
  100, 'steady',
  95, 85, 100, 75,
  ARRAY['ZOZOTOWN','￥2,760','★5'], ARRAY['https://www.google.com/search?ibp=oshop&q=2026 人気商品 トレンド おすすめ&prds=productid:6250722630790193579,headlineOfferDocid:6250722630790193579,imageDocid:6289506797312209057,rds:PC_15222961674040583682|PROD_PC_15222961674040583682,pvt:hg&hl=ja&gl=jp&udm=28'],
  '2026-03-17T05:52:08.866748+00:00', '2026-03-17T05:52:08.866748+00:00'
);
INSERT INTO trends (country_id, category_id, name, description, image_url, heat_score, heat_status, search_score, social_score, ecommerce_score, news_score, tags, source_urls, first_detected_at, last_updated_at) VALUES (
  (SELECT id FROM countries WHERE code='JP'),
  (SELECT id FROM categories WHERE slug='products'),
  'プーマ PUMA SPEEDCAT OG', '판매처: プーマ公式サイト | 가격: ￥15,400 | 평점: 5 | 리뷰: 3,425개', 'https://encrypted-tbn0.gstatic.com/shopping?q=tbn:ANd9GcQFO9O5FKzZs8B0CyWAV54wwDCgax2oUBHYybQLV27qpD7i9a7AkQK1FfVjGbMfaDmAPiuYt5Hxarey8XLDS85i15ND1vQPZ0JQg3_Hk-C9q87aXSs8-gpzHg',
  100, 'steady',
  95, 85, 100, 75,
  ARRAY['プーマ公式サイト','￥15,400','★5'], ARRAY['https://www.google.com/search?ibp=oshop&q=2026 人気商品 トレンド おすすめ&prds=catalogid:6427829610746068577,headlineOfferDocid:618980838519842788,imageDocid:12690234441798893548,rds:PC_14464739813848030305|PROD_PC_14464739813848030305,gpcid:14464739813848030305,mid:576462862509448101,pvt:hg&hl=ja&gl=jp&udm=28'],
  '2026-03-17T05:52:08.866748+00:00', '2026-03-17T05:52:08.866748+00:00'
);
INSERT INTO trends (country_id, category_id, name, description, image_url, heat_score, heat_status, search_score, social_score, ecommerce_score, news_score, tags, source_urls, first_detected_at, last_updated_at) VALUES (
  (SELECT id FROM countries WHERE code='JP'),
  (SELECT id FROM categories WHERE slug='products'),
  'スマートウォッチ【2026年業界最新進化 ChatGPT搭載 AI文字盤 GPS内蔵】2.01インチ大画面 Bluetooth5.3通話 スポーツウォッチ 1ATM防水 GPS運動軌跡記録 腕時計 長持ちバッテリー 100+運動モード DIY文字盤 Lineなどアプリ通知 振動と着信音設定 軽量 薄', '판매처: Amazon公式サイト | 가격: ￥5,999', 'https://encrypted-tbn3.gstatic.com/shopping?q=tbn:ANd9GcRn2UlspCRt-Wjj4y1U5UD7-UsSTDPKdwGsLbbhNCfVfbNXXWWRwSS5KW_cOBCQsFUHPLupEemSVdUfUniF8N14TfgYac3ES2Q7_WhYd8hXelaPvseYkkox',
  80, 'steady',
  75, 65, 80, 55,
  ARRAY['Amazon公式サイト','￥5,999'], ARRAY['https://www.google.com/search?ibp=oshop&q=2026 人気商品 トレンド おすすめ&prds=catalogid:8866481330399429760,headlineOfferDocid:4139784536114391510,imageDocid:5811441296847548183,pvt:hg&hl=ja&gl=jp&udm=28'],
  '2026-03-17T05:52:08.866748+00:00', '2026-03-17T05:52:08.866748+00:00'
);
INSERT INTO trends (country_id, category_id, name, description, image_url, heat_score, heat_status, search_score, social_score, ecommerce_score, news_score, tags, source_urls, first_detected_at, last_updated_at) VALUES (
  (SELECT id FROM countries WHERE code='JP'),
  (SELECT id FROM categories WHERE slug='products'),
  'FAS ザ ブラック デイ クリーム', '판매처: FAS 公式オンラインショップ | 가격: ￥6,600 | 평점: 5 | 리뷰: 18개', 'https://encrypted-tbn1.gstatic.com/shopping?q=tbn:ANd9GcQeP3oER-8XLf37JN61NtZpTQ2KpBBL3l_37Q0Ixccxc1O4zLHSDcKALvU7HZqX37vHbIbvNyo2_2vbCYgVVOAIcb_X449jABZPKk1qSXWCd3nBybf7ynP4',
  100, 'steady',
  95, 85, 100, 75,
  ARRAY['FAS 公式オンラインショップ','￥6,600','★5'], ARRAY['https://www.google.com/search?ibp=oshop&q=2026 人気商品 トレンド おすすめ&prds=catalogid:2585939555334822327,headlineOfferDocid:17142830240848751119,imageDocid:4232363213196151033,rds:PC_6853097380932390142|PROD_PC_6853097380932390142,gpcid:6853097380932390142,mid:576462834021638014,pvt:hg&hl=ja&gl=jp&udm=28'],
  '2026-03-17T05:52:08.866748+00:00', '2026-03-17T05:52:08.866748+00:00'
);
INSERT INTO trends (country_id, category_id, name, description, image_url, heat_score, heat_status, search_score, social_score, ecommerce_score, news_score, tags, source_urls, first_detected_at, last_updated_at) VALUES (
  (SELECT id FROM countries WHERE code='JP'),
  (SELECT id FROM categories WHERE slug='products'),
  'Lanvin クラリス 2wayバッグ', '판매처: Rakuten Fashion | 가격: ￥13,200 | 평점: 5 | 리뷰: 2개', 'https://encrypted-tbn1.gstatic.com/shopping?q=tbn:ANd9GcRxJpnhdroXt5ds2E_3O_KTtHaxv2VnGz8MYzphkMU5FaX9rPo8XMl1wkhgpZ-RAElBl2bGP1eG0-gFKTSit2HV-EmO1XGagfadcs7R1fzNPX_kLWg5901M',
  96, 'steady',
  91, 81, 96, 71,
  ARRAY['Rakuten Fashion','￥13,200','★5'], ARRAY['https://www.google.com/search?ibp=oshop&q=2026 人気商品 トレンド おすすめ&prds=catalogid:17076470461037934109,headlineOfferDocid:2667545944173658758,imageDocid:12550814123302954329,rds:PC_8955263374738904371|PROD_PC_8955263374738904371,gpcid:8955263374738904371,mid:576462461257944785,pvt:hg&hl=ja&gl=jp&udm=28'],
  '2026-03-17T05:52:08.866748+00:00', '2026-03-17T05:52:08.866748+00:00'
);
INSERT INTO trends (country_id, category_id, name, description, image_url, heat_score, heat_status, search_score, social_score, ecommerce_score, news_score, tags, source_urls, first_detected_at, last_updated_at) VALUES (
  (SELECT id FROM countries WHERE code='JP'),
  (SELECT id FROM categories WHERE slug='products'),
  'ニッセン スウェットライクニットカーディガン/366Basic/レディースファッション/トップス/カーディガン', '판매처: ニッセン | 가격: ￥3,070 | 평점: 5 | 리뷰: 176개', 'https://encrypted-tbn3.gstatic.com/shopping?q=tbn:ANd9GcSrajie0LF9aPnVNOpL87T2n-lwGk5jV2Bc4MDVYWTbzwWRLDwhpzY8uQEcJfX7TN7QL2fdcjLbNi6Vkkj1_QXXn-ThOqQvE5PS4egtatBy6Y8bgMrQuyks',
  100, 'steady',
  95, 85, 100, 75,
  ARRAY['ニッセン','￥3,070','★5'], ARRAY['https://www.google.com/search?ibp=oshop&q=2026 人気商品 トレンド おすすめ&prds=catalogid:18259234795738975149,headlineOfferDocid:3607036079187252465,imageDocid:12370312837741227419,rds:PC_13227540078643859715|PROD_PC_13227540078643859715,gpcid:13227540078643859715,mid:576462845555510044,pvt:hg&hl=ja&gl=jp&udm=28'],
  '2026-03-17T05:52:08.866748+00:00', '2026-03-17T05:52:08.866748+00:00'
);
INSERT INTO trends (country_id, category_id, name, description, image_url, heat_score, heat_status, search_score, social_score, ecommerce_score, news_score, tags, source_urls, first_detected_at, last_updated_at) VALUES (
  (SELECT id FROM countries WHERE code='JP'),
  (SELECT id FROM categories WHERE slug='products'),
  'ミッシュマッシュ MISCH MASCH 2026春夏新作 レース切替シャツブラウス MM618106', '판매처: ZOZOTOWN | 가격: ￥8,800', 'https://encrypted-tbn3.gstatic.com/shopping?q=tbn:ANd9GcST0VBtDEhAZSMdm3D9H6Q4faE45A9JXUEAp9b2vGPLav0HXnN0-YveiPaM9aZ5fLDH6Xd0RHxvdzEiPtFGgRE3dztJlxq3Mw',
  70, 'steady',
  65, 55, 70, 45,
  ARRAY['ZOZOTOWN','￥8,800'], ARRAY['https://www.google.com/search?ibp=oshop&q=2026 人気商品 トレンド おすすめ&prds=catalogid:14278027707153746590,headlineOfferDocid:11667887658969942790,imageDocid:13147481801677242847,gpcid:15397236687370214370,mid:576462542876649719,pvt:hg&hl=ja&gl=jp&udm=28'],
  '2026-03-17T05:52:08.866748+00:00', '2026-03-17T05:52:08.866748+00:00'
);
INSERT INTO trends (country_id, category_id, name, description, image_url, heat_score, heat_status, search_score, social_score, ecommerce_score, news_score, tags, source_urls, first_detected_at, last_updated_at) VALUES (
  (SELECT id FROM countries WHERE code='JP'),
  (SELECT id FROM categories WHERE slug='products'),
  'スマートウォッチ【2026年最新傑作 GPS内蔵 超薄型 超軽量】丸型 iPhone対応 アンドロイド対応 スポーツウォッチ Bluetooth5.3通話 1.39インチ大画面 腕時計 100+運動モード 文字盤DIY GPS運動軌跡記録 振動と着信音設定 IP68防水 Lineなど通知 Smart', '판매처: Amazon公式サイト | 가격: ￥4,299', 'https://encrypted-tbn1.gstatic.com/shopping?q=tbn:ANd9GcTi4wNJkQ54yRQX3S516-Flgf629Jr2QXIN2kHu_LC7sLvq3xEIBOX7uSLeWq2faxpskvCzcd4UMBqh0sFMasW0k6wcFDW-TexY7IDajDWLRamXGdjNO5Go',
  67, 'steady',
  62, 52, 67, 42,
  ARRAY['Amazon公式サイト','￥4,299'], ARRAY['https://www.google.com/search?ibp=oshop&q=2026 人気商品 トレンド おすすめ&prds=productid:4252368186888131480,headlineOfferDocid:4252368186888131480,imageDocid:1892128475718153293,pvt:hg&hl=ja&gl=jp&udm=28'],
  '2026-03-17T05:52:08.866748+00:00', '2026-03-17T05:52:08.866748+00:00'
);
INSERT INTO trends (country_id, category_id, name, description, image_url, heat_score, heat_status, search_score, social_score, ecommerce_score, news_score, tags, source_urls, first_detected_at, last_updated_at) VALUES (
  (SELECT id FROM countries WHERE code='JP'),
  (SELECT id FROM categories WHERE slug='products'),
  'allureville/アルアバイル キルティングチェーン ショルダーバッグ', '판매처: ルミネ | 가격: ￥18,700', 'https://encrypted-tbn3.gstatic.com/shopping?q=tbn:ANd9GcQPGDwe27IHotrUMpkBNGZw7uKI4p9dE9vfGPXcutvCAvkPDAUKKiPzGPFm2w9ffApynlb5fg1n7673cBCos1cgbVsjFVQm',
  65, 'steady',
  60, 50, 65, 40,
  ARRAY['ルミネ','￥18,700'], ARRAY['https://www.google.com/search?ibp=oshop&q=2026 人気商品 トレンド おすすめ&prds=catalogid:2439808640112629562,headlineOfferDocid:10511971292243753087,imageDocid:11820372310010118635,gpcid:5747494800881444582,mid:576462841267443855,pvt:hg&hl=ja&gl=jp&udm=28'],
  '2026-03-17T05:52:08.866748+00:00', '2026-03-17T05:52:08.866748+00:00'
);
INSERT INTO trends (country_id, category_id, name, description, image_url, heat_score, heat_status, search_score, social_score, ecommerce_score, news_score, tags, source_urls, first_detected_at, last_updated_at) VALUES (
  (SELECT id FROM countries WHERE code='JP'),
  (SELECT id FROM categories WHERE slug='food'),
  'せんねんの木 とろなまバウムクーヘン 洋菓子', '판매처: バウムクーヘン専門店 せんねんの木 | 가격: ￥2,350', 'https://encrypted-tbn0.gstatic.com/shopping?q=tbn:ANd9GcQDh4Kq4JO3Vb0piKjOkaE-A58TRR_McY0Kin5Dlyj17vSFWo0hgBByG0cIFeP45togEafjKrRFdkEBEKbC0lkBo3n4fDkaLoj8OGAzyOU1L89E3Kz3Z88O',
  100, 'rising',
  95, 85, 100, 75,
  ARRAY['バウムクーヘン専門店 せんねんの木','￥2,350'], ARRAY['https://www.google.com/search?ibp=oshop&q=2026 人気 スイーツ お菓子 トレンド&prds=catalogid:12331835473263973361,headlineOfferDocid:14175591758145534943,imageDocid:6885855102101457696,gpcid:5935316684076284313,mid:576462828517066128,pvt:hg&hl=ja&gl=jp&udm=28'],
  '2026-03-17T05:52:08.866748+00:00', '2026-03-17T05:52:08.866748+00:00'
);
INSERT INTO trends (country_id, category_id, name, description, image_url, heat_score, heat_status, search_score, social_score, ecommerce_score, news_score, tags, source_urls, first_detected_at, last_updated_at) VALUES (
  (SELECT id FROM countries WHERE code='JP'),
  (SELECT id FROM categories WHERE slug='food'),
  'ホワイトデー 2026 かわいい お返し ザ・キャラメルクラウン バターキャラメルサンド 5枚入', '판매처: Amazon公式サイト | 가격: ￥2,877', 'https://encrypted-tbn1.gstatic.com/shopping?q=tbn:ANd9GcQZyX9bPn48LE7Nah8iqVJnGL9to-wRzELUA0yY3If_RZJDe5acAfF8Cuu6ET8jbGvgtmHsoLwDtgT_dRqPpj_WlOEfi_GfG69EeDPUqlv6SAwhw8NHy1_qSO8',
  97, 'rising',
  92, 82, 97, 72,
  ARRAY['Amazon公式サイト','￥2,877'], ARRAY['https://www.google.com/search?ibp=oshop&q=2026 人気 スイーツ お菓子 トレンド&prds=productid:17662372894987633298,headlineOfferDocid:17662372894987633298,imageDocid:4191001084837196093,pvt:hg&hl=ja&gl=jp&udm=28'],
  '2026-03-17T05:52:08.866748+00:00', '2026-03-17T05:52:08.866748+00:00'
);
INSERT INTO trends (country_id, category_id, name, description, image_url, heat_score, heat_status, search_score, social_score, ecommerce_score, news_score, tags, source_urls, first_detected_at, last_updated_at) VALUES (
  (SELECT id FROM countries WHERE code='JP'),
  (SELECT id FROM categories WHERE slug='food'),
  'タルトレット 9個入 ギフト プレゼント 焼き菓子 洋菓子', '판매처: 伊勢丹オンラインストア | 가격: ￥3,240', 'https://encrypted-tbn2.gstatic.com/shopping?q=tbn:ANd9GcQcSrb4-d6ft7gWcrJ_zZr3TPGJiLtUqrz6XCmGsEQWxKwqobhA8LZmi-x2dWZr4Hl7-7h6B9By1F-Lhr44HXvbiQXXxhS-fyDi8bHqhqhALNDfZeGwReLWsw',
  95, 'rising',
  90, 80, 95, 70,
  ARRAY['伊勢丹オンラインストア','￥3,240'], ARRAY['https://www.google.com/search?ibp=oshop&q=2026 人気 スイーツ お菓子 トレンド&prds=catalogid:2891587797275944411,headlineOfferDocid:12455498408271626900,imageDocid:18059366450466219150,gpcid:14993179753404908014,pvt:hg&hl=ja&gl=jp&udm=28'],
  '2026-03-17T05:52:08.866748+00:00', '2026-03-17T05:52:08.866748+00:00'
);
INSERT INTO trends (country_id, category_id, name, description, image_url, heat_score, heat_status, search_score, social_score, ecommerce_score, news_score, tags, source_urls, first_detected_at, last_updated_at) VALUES (
  (SELECT id FROM countries WHERE code='JP'),
  (SELECT id FROM categories WHERE slug='food'),
  '[チョコレート][ギフト] \\累計300,000袋突破/ ななつのしあわせミックスナッツ チョコレート ホワイトデー チョコ 2026 とろけるカカオ仕立て アーモンド クルミ マカデミア カシューナッツ ピスタチオ 冬 ギフト プレゼント ギフト おすすめ', '판매처: 楽天市場 - タマチャンショップ | 가격: ￥1,490 | 평점: 5 | 리뷰: 2,232개', 'https://encrypted-tbn2.gstatic.com/shopping?q=tbn:ANd9GcQ-OLbNEBF2fjJvAgDQprrchCo_1KoA2NdO9BdEG_dsuE_AGRtOHD5SlgDrGWWvpvec-LUuPmx6yC4rOjB0fMPsdlorVbVCYBVuxJ0G_X9btr3OjSijrPvN',
  100, 'rising',
  95, 85, 100, 75,
  ARRAY['楽天市場 - タマチャンショップ','￥1,490','★5'], ARRAY['https://www.google.com/search?ibp=oshop&q=2026 人気 スイーツ お菓子 トレンド&prds=productid:6656665731467619846,headlineOfferDocid:6656665731467619846,imageDocid:8024551480889721382,rds:PC_7606699329828115621|PROD_PC_7606699329828115621,pvt:hg&hl=ja&gl=jp&udm=28'],
  '2026-03-17T05:52:08.866748+00:00', '2026-03-17T05:52:08.866748+00:00'
);
INSERT INTO trends (country_id, category_id, name, description, image_url, heat_score, heat_status, search_score, social_score, ecommerce_score, news_score, tags, source_urls, first_detected_at, last_updated_at) VALUES (
  (SELECT id FROM countries WHERE code='JP'),
  (SELECT id FROM categories WHERE slug='food'),
  'ホワイトデー 2026 焼き菓子 クッキー スイーツ 贈り物 ギフト 千疋屋 パティスリー銀座千疋屋 銀座キャラメルショコラ12個', '판매처: Yahoo!ショッピング - パティスリー銀座千疋屋 | 가격: ￥3,240 | 평점: 5 | 리뷰: 58개', 'https://encrypted-tbn2.gstatic.com/shopping?q=tbn:ANd9GcS_t2iJnWj1vC5ocOQF8mqiEqQG7saV5S39ehPPJCHwy3H7_jufqjSFvtNfOKUMCBQqufAInu_oO9P2aCX3ZsufCKMJXXKclg',
  100, 'rising',
  95, 85, 100, 75,
  ARRAY['Yahoo!ショッピング - パティスリー銀座千疋屋','￥3,240','★5'], ARRAY['https://www.google.com/search?ibp=oshop&q=2026 人気 スイーツ お菓子 トレンド&prds=productid:5887674214693826233,headlineOfferDocid:5887674214693826233,imageDocid:4223389251440640902,rds:LO_5887674214693826233|PROD_LO_5887674214693826233,pvt:hg&hl=ja&gl=jp&udm=28'],
  '2026-03-17T05:52:08.866748+00:00', '2026-03-17T05:52:08.866748+00:00'
);
INSERT INTO trends (country_id, category_id, name, description, image_url, heat_score, heat_status, search_score, social_score, ecommerce_score, news_score, tags, source_urls, first_detected_at, last_updated_at) VALUES (
  (SELECT id FROM countries WHERE code='JP'),
  (SELECT id FROM categories WHERE slug='food'),
  '神戸浪漫 神戸トラッドクッキー', '판매처: JRE MALL | 가격: ￥1,659 | 평점: 5 | 리뷰: 117개', 'https://encrypted-tbn3.gstatic.com/shopping?q=tbn:ANd9GcTmmwP4cizR_3R74sxFhCJINLZzzl9FmEAMtwq2MQPZDgssV3_dJvdz1xKTrwHRWSbnP-gFGBOLJ4vcHBWSLrPN2BLO2xUmRlFt65dSLNM',
  100, 'steady',
  95, 85, 100, 75,
  ARRAY['JRE MALL','￥1,659','★5'], ARRAY['https://www.google.com/search?ibp=oshop&q=2026 人気 スイーツ お菓子 トレンド&prds=catalogid:1181593483097183492,headlineOfferDocid:10390739464440028592,imageDocid:13792333877092976075,rds:PC_4596158579309387785|PROD_PC_4596158579309387785,gpcid:4596158579309387785,mid:576462783329720261,pvt:hg&hl=ja&gl=jp&udm=28'],
  '2026-03-17T05:52:08.866748+00:00', '2026-03-17T05:52:08.866748+00:00'
);
INSERT INTO trends (country_id, category_id, name, description, image_url, heat_score, heat_status, search_score, social_score, ecommerce_score, news_score, tags, source_urls, first_detected_at, last_updated_at) VALUES (
  (SELECT id FROM countries WHERE code='JP'),
  (SELECT id FROM categories WHERE slug='food'),
  '2026Collection', '판매처: chocolaterie-takasu.shop | 가격: ￥2,600', 'https://encrypted-tbn2.gstatic.com/shopping?q=tbn:ANd9GcRa3zEhsPVZHR0-3_sAKHcA4vzdIUMgdOT8HJot_kO15Q8hIvjGiapgHBDq3xkGJYjpnyscIsjgkYpbQDJ2v0AM6scBLQbGn0gbhYiboo4F',
  85, 'steady',
  80, 70, 85, 60,
  ARRAY['chocolaterie-takasu.shop','￥2,600'], ARRAY['https://www.google.com/search?ibp=oshop&q=2026 人気 スイーツ お菓子 トレンド&prds=productid:7166653533781436817,headlineOfferDocid:7166653533781436817,imageDocid:17546203816313645506,pvt:hg&hl=ja&gl=jp&udm=28'],
  '2026-03-17T05:52:08.866748+00:00', '2026-03-17T05:52:08.866748+00:00'
);
INSERT INTO trends (country_id, category_id, name, description, image_url, heat_score, heat_status, search_score, social_score, ecommerce_score, news_score, tags, source_urls, first_detected_at, last_updated_at) VALUES (
  (SELECT id FROM countries WHERE code='JP'),
  (SELECT id FROM categories WHERE slug='food'),
  'パレショコラ 5枚 チョコレート ギフト プレゼント', '판매처: Amazon公式サイト | 가격: ￥3,080', 'https://encrypted-tbn3.gstatic.com/shopping?q=tbn:ANd9GcTthQsCAScZvcx3CmD3q_g0lvdQB4-R_xGFWH4osV8Hm1q2bx7O43_UXlk5VOK7gJrFuj7-hpG4id-UaAPS-IPcdgxEmmQAnWawPlU9sKc1ycgzjZqTbw5xliw',
  82, 'steady',
  77, 67, 82, 57,
  ARRAY['Amazon公式サイト','￥3,080'], ARRAY['https://www.google.com/search?ibp=oshop&q=2026 人気 スイーツ お菓子 トレンド&prds=catalogid:5477631220817659468,headlineOfferDocid:14910094733455656566,imageDocid:10056899264403018703,gpcid:2065161050806323106,pvt:hg&hl=ja&gl=jp&udm=28'],
  '2026-03-17T05:52:08.866748+00:00', '2026-03-17T05:52:08.866748+00:00'
);
INSERT INTO trends (country_id, category_id, name, description, image_url, heat_score, heat_status, search_score, social_score, ecommerce_score, news_score, tags, source_urls, first_detected_at, last_updated_at) VALUES (
  (SELECT id FROM countries WHERE code='JP'),
  (SELECT id FROM categories WHERE slug='food'),
  'マカロン6個詰合わせ 2025 ギフト お菓子 スイーツ ご褒美 洋菓子 フランス菓子 パリ ケーキ パティスリー デザート 紅茶 アフタヌーンティー 誕生日 記念日 チョコレート ショコラ サブレ クッキー 焼き菓子 お祝い 内祝 出産祝 お礼 冷凍ケーキ フルーツ お歳暮 クリスマス お年賀', '판매처: 伊勢丹オンラインストア | 가격: ￥3,132 | 평점: 5 | 리뷰: 13개', 'https://encrypted-tbn2.gstatic.com/shopping?q=tbn:ANd9GcSJ2JKkX7ScCs0unPnEKKQlMb1QbjN-0rvvMU7pApQljcCf5B_vwItK1B_hW1TXsGP3eAOO0H8LpS_FPkmoHDahNGv_h6ouGHGomvVG3rGEXoAEdWo-3CPAHlA',
  100, 'steady',
  95, 85, 100, 75,
  ARRAY['伊勢丹オンラインストア','￥3,132','★5'], ARRAY['https://www.google.com/search?ibp=oshop&q=2026 人気 スイーツ お菓子 トレンド&prds=catalogid:16049589060465367722,headlineOfferDocid:3395559455921574481,imageDocid:5300251479870258190,rds:PC_7331233809827406067|PROD_PC_7331233809827406067,gpcid:7331233809827406067,pvt:hg&hl=ja&gl=jp&udm=28'],
  '2026-03-17T05:52:08.866748+00:00', '2026-03-17T05:52:08.866748+00:00'
);
INSERT INTO trends (country_id, category_id, name, description, image_url, heat_score, heat_status, search_score, social_score, ecommerce_score, news_score, tags, source_urls, first_detected_at, last_updated_at) VALUES (
  (SELECT id FROM countries WHERE code='JP'),
  (SELECT id FROM categories WHERE slug='food'),
  'ホワイトデー ゴディバ公式(GODIVA)あまおう苺&ホワイトチョコレートラングドシャクッキー(4枚入)クッキー ビスケット(ギフト スイーツ プレゼント)', '판매처: ゴディバジャパン公式オンラインショップ | 가격: ￥626 | 평점: 5 | 리뷰: 20개', 'https://encrypted-tbn0.gstatic.com/shopping?q=tbn:ANd9GcRNauLwxzulm7T-SRYdBN5qPDnDJtv1afksuUiDhKrWxOrugQ2yiNQlk5IGJmhkvSH5TQ01buy01Mu4NYnPLRDXtnTXsyFb',
  100, 'steady',
  95, 85, 100, 75,
  ARRAY['ゴディバジャパン公式オンラインショップ','￥626','★5'], ARRAY['https://www.google.com/search?ibp=oshop&q=2026 人気 スイーツ お菓子 トレンド&prds=catalogid:14127757651673156252,headlineOfferDocid:14752919123517928494,imageDocid:13651314469671159256,rds:PC_13107860253314905333|PROD_PC_13107860253314905333,gpcid:13107860253314905333,mid:576462877837182640,pvt:hg&hl=ja&gl=jp&udm=28'],
  '2026-03-17T05:52:08.866748+00:00', '2026-03-17T05:52:08.866748+00:00'
);
INSERT INTO trends (country_id, category_id, name, description, image_url, heat_score, heat_status, search_score, social_score, ecommerce_score, news_score, tags, source_urls, first_detected_at, last_updated_at) VALUES (
  (SELECT id FROM countries WHERE code='JP'),
  (SELECT id FROM categories WHERE slug='food'),
  'ROYCE(ロイズ) バトンクッキー50枚2種詰合せ', '판매처: 楽天市場 - 北海道物産展の「北の森ガーデン」 | 가격: ￥1,998 | 평점: 5 | 리뷰: 34개', 'https://encrypted-tbn1.gstatic.com/shopping?q=tbn:ANd9GcRWETzBr3un5t-baMd16LEqcpcBYHAJeX-DGSYogKOTZ6AOK3SfwAxdWbSH7DU_b0PpGncgWpUrowSpRDQOdMooxkmexrs0',
  100, 'steady',
  95, 85, 100, 75,
  ARRAY['楽天市場 - 北海道物産展の「北の森ガーデン」','￥1,998','★5'], ARRAY['https://www.google.com/search?ibp=oshop&q=2026 人気 スイーツ お菓子 トレンド&prds=catalogid:16778504851552537004,headlineOfferDocid:847763209867973804,imageDocid:7915379181107764413,rds:PC_4327891473894088085|PROD_PC_4327891473894088085,gpcid:4327891473894088085,mid:576462400626513880,pvt:hg&hl=ja&gl=jp&udm=28'],
  '2026-03-17T05:52:08.866748+00:00', '2026-03-17T05:52:08.866748+00:00'
);
INSERT INTO trends (country_id, category_id, name, description, image_url, heat_score, heat_status, search_score, social_score, ecommerce_score, news_score, tags, source_urls, first_detected_at, last_updated_at) VALUES (
  (SELECT id FROM countries WHERE code='JP'),
  (SELECT id FROM categories WHERE slug='food'),
  'RAU Nami-Nami サクサク食感のクリームサンドサブレ “誰も見たことのない菓子”を京都から', '판매처: GOOD NATURE STATION ONLINE | 가격: ￥4,320 | 평점: 5 | 리뷰: 117개', 'https://encrypted-tbn3.gstatic.com/shopping?q=tbn:ANd9GcTDeVsEi2dXcyw7i9dEQIiHUdDgA5xYoKH4cWcobbohDM3vSnNqMNk8BhZGoSVwzL3qg7Zh3mHPF4S6eXzSZuy1X21Ah9KwCwrpAStLuZLlED8k58uh_SyO1w',
  100, 'steady',
  95, 85, 100, 75,
  ARRAY['GOOD NATURE STATION ONLINE','￥4,320','★5'], ARRAY['https://www.google.com/search?ibp=oshop&q=2026 人気 スイーツ お菓子 トレンド&prds=catalogid:5250739651398127534,headlineOfferDocid:9529389360161891407,imageDocid:3670146211743966231,rds:PC_404074598606489710|PROD_PC_404074598606489710,gpcid:404074598606489710,mid:576462875162082111,pvt:hg&hl=ja&gl=jp&udm=28'],
  '2026-03-17T05:52:08.866748+00:00', '2026-03-17T05:52:08.866748+00:00'
);
INSERT INTO trends (country_id, category_id, name, description, image_url, heat_score, heat_status, search_score, social_score, ecommerce_score, news_score, tags, source_urls, first_detected_at, last_updated_at) VALUES (
  (SELECT id FROM countries WHERE code='JP'),
  (SELECT id FROM categories WHERE slug='food'),
  '神戸フランツ 神戸魔法の壷プリン・ショコラ4個入 スイーツ ギフト プレゼント 人気 冷凍 お菓子', '판매처: Yahoo!ショッピング - 神戸フランツ スイーツ&ギフト | 가격: ￥2,890 | 평점: 5 | 리뷰: 158개', 'https://encrypted-tbn2.gstatic.com/shopping?q=tbn:ANd9GcTzlO1onxz-R8YT5FP7_iUwgcVB9qYGMNd4WZxEAZ5ICbPEV5yhNiQk8V9eS3TibReKTvOEjMGzrogC5b07UU0w9G23J2ZXVA',
  100, 'steady',
  95, 85, 100, 75,
  ARRAY['Yahoo!ショッピング - 神戸フランツ スイーツ&ギフト','￥2,890','★5'], ARRAY['https://www.google.com/search?ibp=oshop&q=2026 人気 スイーツ お菓子 トレンド&prds=catalogid:4044116211675797753,headlineOfferDocid:11396377427897147355,imageDocid:362890768530012070,rds:PC_7056393849432203212|PROD_PC_7056393849432203212,gpcid:7056393849432203212,mid:576462724338910204,pvt:hg&hl=ja&gl=jp&udm=28'],
  '2026-03-17T05:52:08.866748+00:00', '2026-03-17T05:52:08.866748+00:00'
);
INSERT INTO trends (country_id, category_id, name, description, image_url, heat_score, heat_status, search_score, social_score, ecommerce_score, news_score, tags, source_urls, first_detected_at, last_updated_at) VALUES (
  (SELECT id FROM countries WHERE code='JP'),
  (SELECT id FROM categories WHERE slug='food'),
  '【スイーツギフト】プティ・タ・プティ Sボックス 9種26個入/【公式】アンリ・シャルパンティエ', '판매처: アンリ・シャルパンティエ シーキューブ 公式 | 가격: ￥1,664 | 평점: 5 | 리뷰: 119개', 'https://encrypted-tbn1.gstatic.com/shopping?q=tbn:ANd9GcQ21hbXSGJhP9XcbHTOtt6FrkxkjPa-gu0NnNC-Yq17hqzayxbMaY1jlrLoLZe2YPHttajRO1mNno9jC3tLgoDkpJaQaZF0YRQ4Q2HL7alT8GlJLkJ7OAsXKg',
  97, 'steady',
  92, 82, 97, 72,
  ARRAY['アンリ・シャルパンティエ シーキューブ 公式','￥1,664','★5'], ARRAY['https://www.google.com/search?ibp=oshop&q=2026 人気 スイーツ お菓子 トレンド&prds=productid:5448894840295455450,headlineOfferDocid:5448894840295455450,imageDocid:2082409855924988093,rds:PC_14350467610684711510|PROD_PC_14350467610684711510,pvt:hg&hl=ja&gl=jp&udm=28'],
  '2026-03-17T05:52:08.866748+00:00', '2026-03-17T05:52:08.866748+00:00'
);
INSERT INTO trends (country_id, category_id, name, description, image_url, heat_score, heat_status, search_score, social_score, ecommerce_score, news_score, tags, source_urls, first_detected_at, last_updated_at) VALUES (
  (SELECT id FROM countries WHERE code='JP'),
  (SELECT id FROM categories WHERE slug='food'),
  'バターサンド2種詰合せ〈チョコレート〉8個入', '판매처: Amazon公式サイト | 가격: ￥2,160 | 평점: 5 | 리뷰: 159개', 'https://encrypted-tbn1.gstatic.com/shopping?q=tbn:ANd9GcQgMhA_pRu4QT3HrFgKUBIe8Wr_oEpCcYk5mRz36ijJ9ipWGRkxE1u4Pj82KIAFdQg5tizhylypjiBl38oQRbU71neU6uEN6tgClTW4C73H0Jpms91yFHRb',
  96, 'steady',
  91, 81, 96, 71,
  ARRAY['Amazon公式サイト','￥2,160','★5'], ARRAY['https://www.google.com/search?ibp=oshop&q=2026 人気 スイーツ お菓子 トレンド&prds=catalogid:4579074412643960079,headlineOfferDocid:13561560082623771493,imageDocid:2162815345325063057,rds:PC_17661911410554710756|PROD_PC_17661911410554710756,gpcid:17661911410554710756,mid:576462823165677359,pvt:hg&hl=ja&gl=jp&udm=28'],
  '2026-03-17T05:52:08.866748+00:00', '2026-03-17T05:52:08.866748+00:00'
);
INSERT INTO trends (country_id, category_id, name, description, image_url, heat_score, heat_status, search_score, social_score, ecommerce_score, news_score, tags, source_urls, first_detected_at, last_updated_at) VALUES (
  (SELECT id FROM countries WHERE code='JP'),
  (SELECT id FROM categories WHERE slug='entertainment'),
  'バンダイ Tamagotchi Paradise Jade Forest', '판매처: 楽天市場 - Day by Day onlinstore | 가격: ￥10,600 | 평점: 5 | 리뷰: 382개', 'https://encrypted-tbn3.gstatic.com/shopping?q=tbn:ANd9GcRtL0wlNFdVubOvCkncADadRS6P-asBNMFBbgkPi1T1q8QjxMcC73377Z3A143aPpqGjnasmouT0_-_-9d9pPAb59Sgo8NdlZmj-OrLvXZck3mTvOipPsqG1A',
  100, 'rising',
  95, 85, 100, 75,
  ARRAY['楽天市場 - Day by Day onlinstore','￥10,600','★5'], ARRAY['https://www.google.com/search?ibp=oshop&q=2026 人気 グッズ ゲーム おもちゃ&prds=catalogid:11349226012291933891,headlineOfferDocid:3878533243163768292,imageDocid:17673363521078969203,rds:PC_6985101522289414681|PROD_PC_6985101522289414681,gpcid:6985101522289414681,mid:576462849395389835,pvt:hg&hl=ja&gl=jp&udm=28'],
  '2026-03-17T05:52:08.866748+00:00', '2026-03-17T05:52:08.866748+00:00'
);
INSERT INTO trends (country_id, category_id, name, description, image_url, heat_score, heat_status, search_score, social_score, ecommerce_score, news_score, tags, source_urls, first_detected_at, last_updated_at) VALUES (
  (SELECT id FROM countries WHERE code='JP'),
  (SELECT id FROM categories WHERE slug='entertainment'),
  'LOL-FUN 【2026新登場】輪投げセット 輪投げ おもちゃ 遊び 外遊び 玩具 アクションゲーム 子供 親子ゲーム ファミリー リング投げ ゲーム リングトスゲーム ホーム イベント 裏庭 パーティー 文化祭 公園遊びグッズ', '판매처: Amazon公式サイト | 가격: ￥2,060', 'https://encrypted-tbn0.gstatic.com/shopping?q=tbn:ANd9GcRPOUxj7xdoAmfCL10StxDq_odEA9gBlHFuESMMhpKcL7AGN6sxwUCKrZdDWzl36s1icHDOFoRis6GZSW8CzQf7WHuwNHzRVYLQEfJpaeCpTq7bdQq4-Ug2',
  97, 'rising',
  92, 82, 97, 72,
  ARRAY['Amazon公式サイト','￥2,060'], ARRAY['https://www.google.com/search?ibp=oshop&q=2026 人気 グッズ ゲーム おもちゃ&prds=productid:3536950126566553249,headlineOfferDocid:3536950126566553249,imageDocid:11626681974535323424,pvt:hg&hl=ja&gl=jp&udm=28'],
  '2026-03-17T05:52:08.866748+00:00', '2026-03-17T05:52:08.866748+00:00'
);
INSERT INTO trends (country_id, category_id, name, description, image_url, heat_score, heat_status, search_score, social_score, ecommerce_score, news_score, tags, source_urls, first_detected_at, last_updated_at) VALUES (
  (SELECT id FROM countries WHERE code='JP'),
  (SELECT id FROM categories WHERE slug='entertainment'),
  'タカラトミー ポケモン ポケなで モンスターボール', '판매처: Yahoo!ショッピング - トイズプライム | 가격: ￥8,800 | 평점: 5 | 리뷰: 75개', 'https://encrypted-tbn0.gstatic.com/shopping?q=tbn:ANd9GcShTBY1Sf18meoMDqdixWIbnn7heFpNdjor53yQV07J_9CdIzz5F3beIS2YUf0XoLjxnvSMErVCBut4iycVFPNDUHET6PbewQ',
  100, 'rising',
  95, 85, 100, 75,
  ARRAY['Yahoo!ショッピング - トイズプライム','￥8,800','★5'], ARRAY['https://www.google.com/search?ibp=oshop&q=2026 人気 グッズ ゲーム おもちゃ&prds=catalogid:16343346963187270301,headlineOfferDocid:1104973406587642486,imageDocid:7477957348463544268,rds:PC_215634408189108309|PROD_PC_215634408189108309,gpcid:215634408189108309,mid:576462866145837146,pvt:hg&hl=ja&gl=jp&udm=28'],
  '2026-03-17T05:52:08.866748+00:00', '2026-03-17T05:52:08.866748+00:00'
);
INSERT INTO trends (country_id, category_id, name, description, image_url, heat_score, heat_status, search_score, social_score, ecommerce_score, news_score, tags, source_urls, first_detected_at, last_updated_at) VALUES (
  (SELECT id FROM countries WHERE code='JP'),
  (SELECT id FROM categories WHERE slug='entertainment'),
  'ドラゴンクエスト メタリックモンスターズギャラリー メタルスライム', '판매처: au PAY マーケット - 42541931_家電のＳＡＫＵＲＡ | 가격: ￥1,900 | 평점: 5 | 리뷰: 11개', 'https://encrypted-tbn3.gstatic.com/shopping?q=tbn:ANd9GcROcdDzPcPW9JgrjY7Ofg6wbHnGObhNq02HHhOhB_lOcPbGheiMT7T_dUJ7xRnzuuXT5QV6s2rnuJdzgFsSbucVKSiRb7bm4A',
  100, 'rising',
  95, 85, 100, 75,
  ARRAY['au PAY マーケット - 42541931_家電のＳＡＫＵＲＡ','￥1,900','★5'], ARRAY['https://www.google.com/search?ibp=oshop&q=2026 人気 グッズ ゲーム おもちゃ&prds=catalogid:7330151264304476523,headlineOfferDocid:7482962418395179944,imageDocid:1008416575129810199,rds:PC_3169572013867212024|PROD_PC_3169572013867212024,gpcid:3169572013867212024,mid:576462804286014474,pvt:hg&hl=ja&gl=jp&udm=28'],
  '2026-03-17T05:52:08.866748+00:00', '2026-03-17T05:52:08.866748+00:00'
);
INSERT INTO trends (country_id, category_id, name, description, image_url, heat_score, heat_status, search_score, social_score, ecommerce_score, news_score, tags, source_urls, first_detected_at, last_updated_at) VALUES (
  (SELECT id FROM countries WHERE code='JP'),
  (SELECT id FROM categories WHERE slug='entertainment'),
  'バンダイ Tamagotchi Paradise Blue Water', '판매처: Amazon公式サイト | 가격: ￥13,700 | 평점: 5 | 리뷰: 470개', 'https://encrypted-tbn0.gstatic.com/shopping?q=tbn:ANd9GcQUuBQi2dyFzXB3G4Cp1ppapq88VBgzsbA4GktWhpNuLdYNthWAFsQHFMCi7qkdaEMRmDnaxjhQC3dyqYdmOuQTt2QGjGTYuaLLm-IJ56_GisjxVU8LK5Wu',
  100, 'rising',
  95, 85, 100, 75,
  ARRAY['Amazon公式サイト','￥13,700','★5'], ARRAY['https://www.google.com/search?ibp=oshop&q=2026 人気 グッズ ゲーム おもちゃ&prds=catalogid:11069780003195627918,headlineOfferDocid:16031533147306178530,imageDocid:9558995831619594004,rds:PC_11309128167118285110|PROD_PC_11309128167118285110,gpcid:11309128167118285110,mid:576462827442724269,pvt:hg&hl=ja&gl=jp&udm=28'],
  '2026-03-17T05:52:08.866748+00:00', '2026-03-17T05:52:08.866748+00:00'
);
INSERT INTO trends (country_id, category_id, name, description, image_url, heat_score, heat_status, search_score, social_score, ecommerce_score, news_score, tags, source_urls, first_detected_at, last_updated_at) VALUES (
  (SELECT id FROM countries WHERE code='JP'),
  (SELECT id FROM categories WHERE slug='entertainment'),
  'SALE!【一年保証】【2026新登場】クレーンゲーム USB給電式 電池式 音楽 LEDライト 卓上ゲーム 親子ゲーム かわいい お子様 子供 お誕生日 クリスマス プレゼント', '판매처: 楽天市場 - MAKANAshop120 | 가격: ￥5,280', 'https://encrypted-tbn1.gstatic.com/shopping?q=tbn:ANd9GcQw7MeSzK9sXXHilEh9_WgYe03oZgeq7vne9pQPx4ZZQtjCvtuiu5JLARBxs-KO2RitMgpffsBkcByP6nA5q3ScRtynkZ_19XJaeJRcqsM-khty9oBOrbxRBg',
  87, 'steady',
  82, 72, 87, 62,
  ARRAY['楽天市場 - MAKANAshop120','￥5,280'], ARRAY['https://www.google.com/search?ibp=oshop&q=2026 人気 グッズ ゲーム おもちゃ&prds=productid:4688766743082190018,headlineOfferDocid:4688766743082190018,imageDocid:16136784704729100069,pvt:hg&hl=ja&gl=jp&udm=28'],
  '2026-03-17T05:52:08.866748+00:00', '2026-03-17T05:52:08.866748+00:00'
);
INSERT INTO trends (country_id, category_id, name, description, image_url, heat_score, heat_status, search_score, social_score, ecommerce_score, news_score, tags, source_urls, first_detected_at, last_updated_at) VALUES (
  (SELECT id FROM countries WHERE code='JP'),
  (SELECT id FROM categories WHERE slug='entertainment'),
  'ホワイトデー お返し 人気 プチ 卒業 入学 記念品 プレゼント お祝 2026 ギフト プレゼント ゲームスタジアムスタンダード 玩具 知育玩具 学習玩具', '판매처: JRE MALL | 가격: ￥3,673', 'https://encrypted-tbn0.gstatic.com/shopping?q=tbn:ANd9GcTEnPPxzJr2JhC5YdLpRYQc9RDLW72ca4M0Qb7wzy9FOKzu4eLAsB6oDGZbp0vaLY6WlCSdD8PjagoGayojq3-vhHHxkUsgrdfO0yjqVwQ9NloOlr1cYUKu',
  85, 'steady',
  80, 70, 85, 60,
  ARRAY['JRE MALL','￥3,673'], ARRAY['https://www.google.com/search?ibp=oshop&q=2026 人気 グッズ ゲーム おもちゃ&prds=productid:14763701617212310796,headlineOfferDocid:14763701617212310796,imageDocid:10192364602290622788,pvt:hg&hl=ja&gl=jp&udm=28'],
  '2026-03-17T05:52:08.866748+00:00', '2026-03-17T05:52:08.866748+00:00'
);
INSERT INTO trends (country_id, category_id, name, description, image_url, heat_score, heat_status, search_score, social_score, ecommerce_score, news_score, tags, source_urls, first_detected_at, last_updated_at) VALUES (
  (SELECT id FROM countries WHERE code='JP'),
  (SELECT id FROM categories WHERE slug='entertainment'),
  'ClaGla ヒューマナイレーサーズ', '판매처: Yahoo!ショッピング - ゆかいなさかなYahoo!店 | 가격: ￥2,992', 'https://encrypted-tbn1.gstatic.com/shopping?q=tbn:ANd9GcQ91KSQdhKjg2FYlwa7EFFqKfF4w5ZltLPEtThK1b3GhITz9ApftuAg6KhwgzwyJN1F1CDJ0JnWhGhyiS_nAS_Znfdn1idq',
  82, 'steady',
  77, 67, 82, 57,
  ARRAY['Yahoo!ショッピング - ゆかいなさかなYahoo!店','￥2,992'], ARRAY['https://www.google.com/search?ibp=oshop&q=2026 人気 グッズ ゲーム おもちゃ&prds=catalogid:134612352779957037,headlineOfferDocid:8984181185394112538,imageDocid:11111450591563251417,gpcid:12224486408080176661,mid:576462900886066379,pvt:hg&hl=ja&gl=jp&udm=28'],
  '2026-03-17T05:52:08.866748+00:00', '2026-03-17T05:52:08.866748+00:00'
);
INSERT INTO trends (country_id, category_id, name, description, image_url, heat_score, heat_status, search_score, social_score, ecommerce_score, news_score, tags, source_urls, first_detected_at, last_updated_at) VALUES (
  (SELECT id FROM countries WHERE code='JP'),
  (SELECT id FROM categories WHERE slug='entertainment'),
  'A5640 コネクト フォー', '판매처: Amazon公式サイト | 가격: ￥1,956 | 평점: 5 | 리뷰: 92개', 'https://encrypted-tbn1.gstatic.com/shopping?q=tbn:ANd9GcQmpTWTdUM5Cb8iXNTvt_sQ_gDq0bjvqc-B6jzhxPBBh0PfZ9eXrO55Jk_OuWSlIeUZl8INnu31lzMHUZ9cxsI1lS0o5yJ-gdYb6uT3uPeeBPy5ARQ0DSNd',
  100, 'steady',
  95, 85, 100, 75,
  ARRAY['Amazon公式サイト','￥1,956','★5'], ARRAY['https://www.google.com/search?ibp=oshop&q=2026 人気 グッズ ゲーム おもちゃ&prds=catalogid:10657259894677925355,headlineOfferDocid:17613184597981129587,imageDocid:6467777854305276353,rds:PC_5508556295190686019|PROD_PC_5508556295190686019,gpcid:5508556295190686019,mid:576462869253922496,pvt:hg&hl=ja&gl=jp&udm=28'],
  '2026-03-17T05:52:08.866748+00:00', '2026-03-17T05:52:08.866748+00:00'
);
INSERT INTO trends (country_id, category_id, name, description, image_url, heat_score, heat_status, search_score, social_score, ecommerce_score, news_score, tags, source_urls, first_detected_at, last_updated_at) VALUES (
  (SELECT id FROM countries WHERE code='JP'),
  (SELECT id FROM categories WHERE slug='entertainment'),
  'アーテック なかまをおとすな!バランスゲーム 21737', '판매처: シモジマ 公式オンラインショップ | 가격: ￥372', 'https://encrypted-tbn3.gstatic.com/shopping?q=tbn:ANd9GcSN-nM5GDyWNcSWLvUjpeZjSHHxKvCKhypx9cDVcYilUPWHuGQNmVFVeeK6PhndYd0OrYmpcB435rD2DDuGrHIm23dt0s_Z_LDiMru3hx7Mmos9suwTtUCLxw',
  77, 'steady',
  72, 62, 77, 52,
  ARRAY['シモジマ 公式オンラインショップ','￥372'], ARRAY['https://www.google.com/search?ibp=oshop&q=2026 人気 グッズ ゲーム おもちゃ&prds=catalogid:13995519501844072216,headlineOfferDocid:15442528655530727501,imageDocid:17437797247809918795,gpcid:17402497455044156993,mid:576462517489625647,pvt:hg&hl=ja&gl=jp&udm=28'],
  '2026-03-17T05:52:08.866748+00:00', '2026-03-17T05:52:08.866748+00:00'
);
INSERT INTO trends (country_id, category_id, name, description, image_url, heat_score, heat_status, search_score, social_score, ecommerce_score, news_score, tags, source_urls, first_detected_at, last_updated_at) VALUES (
  (SELECT id FROM countries WHERE code='JP'),
  (SELECT id FROM categories WHERE slug='entertainment'),
  'ボードゲーム クラスク 日本語版 (Klask)', '판매처: 楽天市場 - ボードゲームショップ ALBUM | 가격: ￥7,700 | 평점: 5 | 리뷰: 5개', 'https://encrypted-tbn2.gstatic.com/shopping?q=tbn:ANd9GcR2VsUVAg04bPC-wKYBp4p8Wf_oLsxzXJQpGDRpXpfOBJHiwOwKb2TU3ZCMbxDZvEmHTh3vl33bDsSBThC8eSvXZh0_5y7SKQ',
  98, 'steady',
  93, 83, 98, 73,
  ARRAY['楽天市場 - ボードゲームショップ ALBUM','￥7,700','★5'], ARRAY['https://www.google.com/search?ibp=oshop&q=2026 人気 グッズ ゲーム おもちゃ&prds=catalogid:14584817464948915429,headlineOfferDocid:714853790595828070,imageDocid:15914102229301606118,rds:PC_16870043464340745371|PROD_PC_16870043464340745371,gpcid:16870043464340745371,pvt:hg&hl=ja&gl=jp&udm=28'],
  '2026-03-17T05:52:08.866748+00:00', '2026-03-17T05:52:08.866748+00:00'
);
INSERT INTO trends (country_id, category_id, name, description, image_url, heat_score, heat_status, search_score, social_score, ecommerce_score, news_score, tags, source_urls, first_detected_at, last_updated_at) VALUES (
  (SELECT id FROM countries WHERE code='JP'),
  (SELECT id FROM categories WHERE slug='entertainment'),
  '【2026年 福袋】 Playte (プレイテ) ボードゲーム 3点 詰め合わせセット (2025年 入り/被りなし) Lucky red Box', '판매처: Amazon公式サイト | 가격: ￥5,000', 'https://encrypted-tbn0.gstatic.com/shopping?q=tbn:ANd9GcRsJ4OGXMPkXjvuy2eFLqsVP9g8B3NQBuIQT7osop7L85L53LgSHi4X6VKD8euE4C40fLCtU0aVf3emSZ5Q335yGS0jHM3MudeIKmm2TP1Gyl6OlA_Iql8x',
  72, 'steady',
  67, 57, 72, 47,
  ARRAY['Amazon公式サイト','￥5,000'], ARRAY['https://www.google.com/search?ibp=oshop&q=2026 人気 グッズ ゲーム おもちゃ&prds=productid:8559981250359991535,headlineOfferDocid:8559981250359991535,imageDocid:16741152805784418412,pvt:hg&hl=ja&gl=jp&udm=28'],
  '2026-03-17T05:52:08.866748+00:00', '2026-03-17T05:52:08.866748+00:00'
);
INSERT INTO trends (country_id, category_id, name, description, image_url, heat_score, heat_status, search_score, social_score, ecommerce_score, news_score, tags, source_urls, first_detected_at, last_updated_at) VALUES (
  (SELECT id FROM countries WHERE code='JP'),
  (SELECT id FROM categories WHERE slug='entertainment'),
  'ニンテンドーサウンドクロック Alarmo', '판매처: あみあみ amiami | 가격: ￥12,980 | 평점: 5 | 리뷰: 714개', 'https://encrypted-tbn0.gstatic.com/shopping?q=tbn:ANd9GcQseXyNnxebwNj5uNyOvs2bzHEmEbgkCqEfjEaJu21ECmkrOBkI4r6Ny4d8dpBmG8SWc8-DXKen7JeeuY2p3f7tP9XDLua_',
  100, 'steady',
  95, 85, 100, 75,
  ARRAY['あみあみ amiami','￥12,980','★5'], ARRAY['https://www.google.com/search?ibp=oshop&q=2026 人気 グッズ ゲーム おもちゃ&prds=catalogid:2985180451201673220,headlineOfferDocid:11157281230594363902,imageDocid:11996490183229258332,rds:PC_2945817462290954854|PROD_PC_2945817462290954854,gpcid:2945817462290954854,mid:576462498225969908,pvt:hg&hl=ja&gl=jp&udm=28'],
  '2026-03-17T05:52:08.866748+00:00', '2026-03-17T05:52:08.866748+00:00'
);
INSERT INTO trends (country_id, category_id, name, description, image_url, heat_score, heat_status, search_score, social_score, ecommerce_score, news_score, tags, source_urls, first_detected_at, last_updated_at) VALUES (
  (SELECT id FROM countries WHERE code='JP'),
  (SELECT id FROM categories WHERE slug='entertainment'),
  '丸紅木材/26面ストレージゲーム IKONIH', '판매처: シャディ ギフトモール | 가격: ￥9,900', 'https://encrypted-tbn2.gstatic.com/shopping?q=tbn:ANd9GcT_py9PnPtTjVyT7KQ0iX9SsBxt4mDlMbxkGb4EQWEm5HmPTc09mHd0x7Aj0aG9DAXZh9Yhb0H4Vf9C4FaANM8JQblOY1bLpg',
  67, 'steady',
  62, 52, 67, 42,
  ARRAY['シャディ ギフトモール','￥9,900'], ARRAY['https://www.google.com/search?ibp=oshop&q=2026 人気 グッズ ゲーム おもちゃ&prds=catalogid:2174025775588409596,headlineOfferDocid:7027318939003568662,imageDocid:2404807466511456914,gpcid:9039838901085537793,mid:576462668211189261,pvt:hg&hl=ja&gl=jp&udm=28'],
  '2026-03-17T05:52:08.866748+00:00', '2026-03-17T05:52:08.866748+00:00'
);
INSERT INTO trends (country_id, category_id, name, description, image_url, heat_score, heat_status, search_score, social_score, ecommerce_score, news_score, tags, source_urls, first_detected_at, last_updated_at) VALUES (
  (SELECT id FROM countries WHERE code='JP'),
  (SELECT id FROM categories WHERE slug='entertainment'),
  'ハローキティ どきどきブロックくずしゲーム おもちゃ サンリオ キャラクター', '판매처: 堀商店 | 가격: ￥1,155 | 평점: 5 | 리뷰: 1개', 'https://encrypted-tbn1.gstatic.com/shopping?q=tbn:ANd9GcR_V0DH6mkm1_vUxfYsNLyQ8TXelc7xwMjy0l4oHNd-6EapKDTdJEgfjwNjFmQwIk_COTvYUs1Lfz8zDZT9qjhssjGGIBQA',
  85, 'steady',
  80, 70, 85, 60,
  ARRAY['堀商店','￥1,155','★5'], ARRAY['https://www.google.com/search?ibp=oshop&q=2026 人気 グッズ ゲーム おもちゃ&prds=catalogid:14242384001139008502,headlineOfferDocid:13305313517606204672,imageDocid:1752921835974736193,rds:PC_616863633945104469|PROD_PC_616863633945104469,gpcid:616863633945104469,mid:576462789383408040,pvt:hg&hl=ja&gl=jp&udm=28'],
  '2026-03-17T05:52:08.866748+00:00', '2026-03-17T05:52:08.866748+00:00'
);
INSERT INTO trends (country_id, category_id, name, description, image_url, heat_score, heat_status, search_score, social_score, ecommerce_score, news_score, tags, source_urls, first_detected_at, last_updated_at) VALUES (
  (SELECT id FROM countries WHERE code='GB'),
  (SELECT id FROM categories WHERE slug='fashion'),
  'Zara Checked Midi Skirt with Belt', '판매처: Zara UK | 가격: £49.99', 'https://encrypted-tbn1.gstatic.com/shopping?q=tbn:ANd9GcSr36BkXaU_wBFMVVwVzEo2YpN0rTEVxLfF9EWeob5ze4A-BnaJlxifqfZWV1PL-IljW3WQSJR_katVd75arM1hn-OtfCjcSjdAPY9EjWAN9CIDNAXsto9BAAM',
  100, 'rising',
  95, 85, 100, 75,
  ARRAY['Zara UK','£49.99'], ARRAY['https://www.google.com/search?ibp=oshop&q=trending fashion clothes UK 2026&prds=catalogid:17030525813035690455,headlineOfferDocid:13012795076387566541,imageDocid:13647252290667381317,gpcid:12361653572176532470,mid:576462531129275359,pvt:a&hl=en&gl=uk&udm=28'],
  '2026-03-17T05:52:08.866748+00:00', '2026-03-17T05:52:08.866748+00:00'
);
INSERT INTO trends (country_id, category_id, name, description, image_url, heat_score, heat_status, search_score, social_score, ecommerce_score, news_score, tags, source_urls, first_detected_at, last_updated_at) VALUES (
  (SELECT id FROM countries WHERE code='GB'),
  (SELECT id FROM categories WHERE slug='fashion'),
  'Pink Boutique Want You Bad Orange Gold Detail Trouser Co-ord Set Womens', '판매처: Pink Boutique | 가격: £39.99', 'https://encrypted-tbn0.gstatic.com/shopping?q=tbn:ANd9GcRwP0U2hgLUCe5_6ods5Vv6nLrnV42krCTpqDJi8bF2Y4knIghVDJtgMMSH-idlUbocCNFu63-g6z5irwQwzviuJlLKmc0_y2iQX-pkaIg',
  97, 'rising',
  92, 82, 97, 72,
  ARRAY['Pink Boutique','£39.99'], ARRAY['https://www.google.com/search?ibp=oshop&q=trending fashion clothes UK 2026&prds=catalogid:1203664116780898211,headlineOfferDocid:7056374223581580921,imageDocid:6502983802518746092,gpcid:14298791137384335135,mid:576462882025032348,pvt:a&hl=en&gl=uk&udm=28'],
  '2026-03-17T05:52:08.866748+00:00', '2026-03-17T05:52:08.866748+00:00'
);
INSERT INTO trends (country_id, category_id, name, description, image_url, heat_score, heat_status, search_score, social_score, ecommerce_score, news_score, tags, source_urls, first_detected_at, last_updated_at) VALUES (
  (SELECT id FROM countries WHERE code='GB'),
  (SELECT id FROM categories WHERE slug='fashion'),
  'Reformation Jessalyn Silk Dress', '판매처: Reformation | 가격: £248.00 | 평점: 4.0 | 리뷰: 3개', 'https://encrypted-tbn2.gstatic.com/shopping?q=tbn:ANd9GcR7tUAHZj-uzXqupKTmdJNvGRzxyfNEJrwhKawzGQ_8ooLB_uRVgvPKP197LnpeFsEMs2AlvqptPBv84JQeQ2IxnZxey0pNDKg0Ca_zMq-FABw6e6WeqiTU',
  100, 'rising',
  95, 85, 100, 75,
  ARRAY['Reformation','£248.00','★4.0'], ARRAY['https://www.google.com/search?ibp=oshop&q=trending fashion clothes UK 2026&prds=catalogid:7291052756373609325,headlineOfferDocid:3063946305566929715,imageDocid:4999506070179992438,rds:PC_8625864884094855837|PROD_PC_8625864884094855837,gpcid:8625864884094855837,mid:576462900294806046,pvt:a&hl=en&gl=uk&udm=28'],
  '2026-03-17T05:52:08.866748+00:00', '2026-03-17T05:52:08.866748+00:00'
);
INSERT INTO trends (country_id, category_id, name, description, image_url, heat_score, heat_status, search_score, social_score, ecommerce_score, news_score, tags, source_urls, first_detected_at, last_updated_at) VALUES (
  (SELECT id FROM countries WHERE code='GB'),
  (SELECT id FROM categories WHERE slug='fashion'),
  'Summer Dresses for Women UK 2026 Causal V-Neck Button Short Sleeve Vacation Floral Maxi Dresses with Pockets Fashion Elegant Eyelet Ruffle Swing A', '판매처: Amazon.co.uk - Amazon.co.uk-Seller | 가격: £7.99', 'https://encrypted-tbn1.gstatic.com/shopping?q=tbn:ANd9GcS7HidtUnR_uYXzXx5gJxIJlH-h8PvcvrEoefBxeIYQmmrjpgG12VAMYSzWH_TmDCEWRU0GdT20s1JWo_R1iL4kqZhbvggd5p3qBPFZ7kNew67uX65tQB2Ugw',
  92, 'rising',
  87, 77, 92, 67,
  ARRAY['Amazon.co.uk - Amazon.co.uk-Seller','£7.99'], ARRAY['https://www.google.com/search?ibp=oshop&q=trending fashion clothes UK 2026&prds=productid:10821228311634549612,headlineOfferDocid:10821228311634549612,imageDocid:7822013356141105869,pvt:a&hl=en&gl=uk&udm=28'],
  '2026-03-17T05:52:08.866748+00:00', '2026-03-17T05:52:08.866748+00:00'
);
INSERT INTO trends (country_id, category_id, name, description, image_url, heat_score, heat_status, search_score, social_score, ecommerce_score, news_score, tags, source_urls, first_detected_at, last_updated_at) VALUES (
  (SELECT id FROM countries WHERE code='GB'),
  (SELECT id FROM categories WHERE slug='fashion'),
  'Woman Zara Zw Collection Wide-Leg Trousers With Pleats', '판매처: Zara UK | 가격: £39.99', 'https://encrypted-tbn3.gstatic.com/shopping?q=tbn:ANd9GcRmC0iMDDzo4V1LVFlcGJ3MSPNQGpQB79PUkNhj1YFURu7Hwdml4OKYGCXmq3NWM6XA5Z9MwqiILf2Wph0xHsh50mrGSP-CCiacJJ5AXtx4pBSQCfe8Zkz7g18',
  90, 'rising',
  85, 75, 90, 65,
  ARRAY['Zara UK','£39.99'], ARRAY['https://www.google.com/search?ibp=oshop&q=trending fashion clothes UK 2026&prds=catalogid:14386782088584485177,headlineOfferDocid:10227365555348229297,imageDocid:8823446392131678895,gpcid:8037086781241187955,mid:576462866282793344,pvt:a&hl=en&gl=uk&udm=28'],
  '2026-03-17T05:52:08.866748+00:00', '2026-03-17T05:52:08.866748+00:00'
);
INSERT INTO trends (country_id, category_id, name, description, image_url, heat_score, heat_status, search_score, social_score, ecommerce_score, news_score, tags, source_urls, first_detected_at, last_updated_at) VALUES (
  (SELECT id FROM countries WHERE code='GB'),
  (SELECT id FROM categories WHERE slug='fashion'),
  'Womens Reiss Black Harriet Button-detail Knitted Midi Dress', '판매처: Reiss | 가격: £98.00 | 평점: 4.6 | 리뷰: 7개', 'https://encrypted-tbn0.gstatic.com/shopping?q=tbn:ANd9GcRJerx9JFBsIEllWJHG1mOVvxBMEIdgGI8WuBTSPkze7TfWNU8w6nMrIbg7-TcTWC3VKneNNJsh1mGbzOqBI6VIUbFkueeeL86kKA0oOOFxw3BvD0sb9oNw7g',
  100, 'steady',
  95, 85, 100, 75,
  ARRAY['Reiss','£98.00','★4.6'], ARRAY['https://www.google.com/search?ibp=oshop&q=trending fashion clothes UK 2026&prds=catalogid:5550713470395461949,headlineOfferDocid:4735035075206463687,imageDocid:10463853347250296380,rds:PC_15791954269903556658|PROD_PC_15791954269903556658,gpcid:15791954269903556658,mid:576462878448589794,pvt:a&hl=en&gl=uk&udm=28'],
  '2026-03-17T05:52:08.866748+00:00', '2026-03-17T05:52:08.866748+00:00'
);
INSERT INTO trends (country_id, category_id, name, description, image_url, heat_score, heat_status, search_score, social_score, ecommerce_score, news_score, tags, source_urls, first_detected_at, last_updated_at) VALUES (
  (SELECT id FROM countries WHERE code='GB'),
  (SELECT id FROM categories WHERE slug='fashion'),
  'boohoo Women''s Seam Detail Button Through Knitted Top and Flare Trouser Set', '판매처: boohoo | 가격: £14.00', 'https://encrypted-tbn0.gstatic.com/shopping?q=tbn:ANd9GcRoSqDe5l5yZGhPdWD0cQSOTMJ5_r7LbW4mHwu-WYnPOm94vLvovIvumu7Y47fpK6pVqGwtaJ5J7nv9R2mNMX_tH7fec-HmqnBy7VL3Z8LgfNTzedjTLkcpsQ',
  85, 'steady',
  80, 70, 85, 60,
  ARRAY['boohoo','£14.00'], ARRAY['https://www.google.com/search?ibp=oshop&q=trending fashion clothes UK 2026&prds=catalogid:950490834055596129,headlineOfferDocid:243132294282901238,imageDocid:6997721881711134640,gpcid:8667392456106879362,mid:576462847775444264,pvt:a&hl=en&gl=uk&udm=28'],
  '2026-03-17T05:52:08.866748+00:00', '2026-03-17T05:52:08.866748+00:00'
);
INSERT INTO trends (country_id, category_id, name, description, image_url, heat_score, heat_status, search_score, social_score, ecommerce_score, news_score, tags, source_urls, first_detected_at, last_updated_at) VALUES (
  (SELECT id FROM countries WHERE code='GB'),
  (SELECT id FROM categories WHERE slug='fashion'),
  'Joe Browns Women''s Geo Print Midi Shirt Dress', '판매처: Joe Browns | 가격: £27.00 | 평점: 4.4 | 리뷰: 46개', 'https://encrypted-tbn0.gstatic.com/shopping?q=tbn:ANd9GcRJkHqjHTPIT288QIaCEdetf-Ijy0_EJ57JjjBwsmGgL0aycwQ6NjGz5O1BJF9IQBOkCWM6nJlSVO2urzv_B5eLXDZQ2wPAbdMG1yICkX4Lw3nXZkTDUK7EiA',
  100, 'steady',
  95, 85, 100, 75,
  ARRAY['Joe Browns','£27.00','★4.4'], ARRAY['https://www.google.com/search?ibp=oshop&q=trending fashion clothes UK 2026&prds=catalogid:5319642424645696851,headlineOfferDocid:7121847588217849944,imageDocid:13038674220043327564,rds:PC_1492834685403506842|PROD_PC_1492834685403506842,gpcid:1492834685403506842,mid:576462839740013642,pvt:a&hl=en&gl=uk&udm=28'],
  '2026-03-17T05:52:08.866748+00:00', '2026-03-17T05:52:08.866748+00:00'
);
INSERT INTO trends (country_id, category_id, name, description, image_url, heat_score, heat_status, search_score, social_score, ecommerce_score, news_score, tags, source_urls, first_detected_at, last_updated_at) VALUES (
  (SELECT id FROM countries WHERE code='GB'),
  (SELECT id FROM categories WHERE slug='fashion'),
  'Coast Women''s Crepe Colour Block Midi Dress', '판매처: Coast | 가격: £111.20 | 평점: 3.5 | 리뷰: 2개', 'https://encrypted-tbn3.gstatic.com/shopping?q=tbn:ANd9GcQ3qyPyrXwFKzrWoB0MxtGliOvrAjLEFTZ6rfUFevPQAc81q4QymYAv_3iq_76iiiUec4xvKxpmRpgQIS8BXw2kHSYHnINfg2PC2ln1x95mmtMVreXQkzPUSw',
  86, 'steady',
  81, 71, 86, 61,
  ARRAY['Coast','£111.20','★3.5'], ARRAY['https://www.google.com/search?ibp=oshop&q=trending fashion clothes UK 2026&prds=catalogid:9056888495311101806,headlineOfferDocid:7488359431230336126,imageDocid:16533399369324568439,rds:PC_12322632742232915484|PROD_PC_12322632742232915484,gpcid:12322632742232915484,mid:576462771048522144,pvt:a&hl=en&gl=uk&udm=28'],
  '2026-03-17T05:52:08.866748+00:00', '2026-03-17T05:52:08.866748+00:00'
);
INSERT INTO trends (country_id, category_id, name, description, image_url, heat_score, heat_status, search_score, social_score, ecommerce_score, news_score, tags, source_urls, first_detected_at, last_updated_at) VALUES (
  (SELECT id FROM countries WHERE code='GB'),
  (SELECT id FROM categories WHERE slug='fashion'),
  'KITRI Women''s Elise Velvet Dress', '판매처: KITRI | 가격: £136.00', 'https://encrypted-tbn2.gstatic.com/shopping?q=tbn:ANd9GcQ6ik-q-Z-2_2FLMJbU27sTn_pzAMAgB2VRQ5sMWYRia-VrtP9zie4qJy9doq0RhmTLX1zJ174U2AJSrgp-uuaVRi2577Hq3oA630B9WszHOqlj2-A8BV67mA',
  77, 'steady',
  72, 62, 77, 52,
  ARRAY['KITRI','£136.00'], ARRAY['https://www.google.com/search?ibp=oshop&q=trending fashion clothes UK 2026&prds=catalogid:841385169399814038,headlineOfferDocid:11801506650505110663,imageDocid:2531104688963733378,gpcid:17879855236641675910,mid:576462868598359160,pvt:a&hl=en&gl=uk&udm=28'],
  '2026-03-17T05:52:08.866748+00:00', '2026-03-17T05:52:08.866748+00:00'
);
INSERT INTO trends (country_id, category_id, name, description, image_url, heat_score, heat_status, search_score, social_score, ecommerce_score, news_score, tags, source_urls, first_detected_at, last_updated_at) VALUES (
  (SELECT id FROM countries WHERE code='GB'),
  (SELECT id FROM categories WHERE slug='fashion'),
  'Boden Women''s AVA Linen Blend Midi Dress', '판매처: Boden | 가격: £159.20 | 평점: 3.0 | 리뷰: 3개', 'https://encrypted-tbn0.gstatic.com/shopping?q=tbn:ANd9GcRtFC37_03-UuFikz488-mn5LOSeybprBHoMtv1Vpgw2ookJ5L2OGjuYdRDdc-KQwe5hRrnkJNrL8wABcnpotUMsaAfoEC1PES4tYl3XN4KwJ8dBArDordytw',
  77, 'steady',
  72, 62, 77, 52,
  ARRAY['Boden','£159.20','★3.0'], ARRAY['https://www.google.com/search?ibp=oshop&q=trending fashion clothes UK 2026&prds=catalogid:6304519649113675799,headlineOfferDocid:13531399793243281356,imageDocid:17308647376511803088,rds:PC_13725637975057827423|PROD_PC_13725637975057827423,gpcid:13725637975057827423,mid:576462536162921835,pvt:a&hl=en&gl=uk&udm=28'],
  '2026-03-17T05:52:08.866748+00:00', '2026-03-17T05:52:08.866748+00:00'
);
INSERT INTO trends (country_id, category_id, name, description, image_url, heat_score, heat_status, search_score, social_score, ecommerce_score, news_score, tags, source_urls, first_detected_at, last_updated_at) VALUES (
  (SELECT id FROM countries WHERE code='GB'),
  (SELECT id FROM categories WHERE slug='fashion'),
  'Intimissimi Lace and Silk Top', '판매처: Intimissimi | 가격: £55.00 | 평점: 4.8 | 리뷰: 963개', 'https://encrypted-tbn2.gstatic.com/shopping?q=tbn:ANd9GcSCT1kCua6pnvCnm0Qlm-HO9ae_s78O-597V6lotjWTJk_91n59Zv2DuXR1GN81xhRHIElcvqiwRlNYQxR3_gU6bSHXQklJ',
  100, 'steady',
  95, 85, 100, 75,
  ARRAY['Intimissimi','£55.00','★4.8'], ARRAY['https://www.google.com/search?ibp=oshop&q=trending fashion clothes UK 2026&prds=catalogid:153212527246918829,headlineOfferDocid:504787772426966266,imageDocid:7945648728167466466,rds:PC_10619942626989799332|PROD_PC_10619942626989799332,gpcid:10619942626989799332,mid:576462457592053228,pvt:a&hl=en&gl=uk&udm=28'],
  '2026-03-17T05:52:08.866748+00:00', '2026-03-17T05:52:08.866748+00:00'
);
INSERT INTO trends (country_id, category_id, name, description, image_url, heat_score, heat_status, search_score, social_score, ecommerce_score, news_score, tags, source_urls, first_detected_at, last_updated_at) VALUES (
  (SELECT id FROM countries WHERE code='GB'),
  (SELECT id FROM categories WHERE slug='fashion'),
  'Wallis Women''s Rib Detail High Neck Belted Knitted Dress', '판매처: Wallis UK | 가격: £52.00 | 평점: 4.2 | 리뷰: 22개', 'https://encrypted-tbn1.gstatic.com/shopping?q=tbn:ANd9GcQHm3GiTh6alGjJvBpnsZSpLJ6GYfhPtvkslmsB9EH76h8SoCH0r9BgHGR9vtbg-knYvDTODUFYlKT-zAMjpstvliGyoBxYbKBiQajpwHDtTOIwxNRkD803',
  88, 'steady',
  83, 73, 88, 63,
  ARRAY['Wallis UK','£52.00','★4.2'], ARRAY['https://www.google.com/search?ibp=oshop&q=trending fashion clothes UK 2026&prds=catalogid:405017715086772134,headlineOfferDocid:16805503435790571211,imageDocid:9351088392458062229,rds:PC_8577806593308927263|PROD_PC_8577806593308927263,gpcid:8577806593308927263,mid:576462775286424241,pvt:a&hl=en&gl=uk&udm=28'],
  '2026-03-17T05:52:08.866748+00:00', '2026-03-17T05:52:08.866748+00:00'
);
INSERT INTO trends (country_id, category_id, name, description, image_url, heat_score, heat_status, search_score, social_score, ecommerce_score, news_score, tags, source_urls, first_detected_at, last_updated_at) VALUES (
  (SELECT id FROM countries WHERE code='GB'),
  (SELECT id FROM categories WHERE slug='fashion'),
  'Ladies Tops for Women UK 2026 Plus Size Cotton Linen Short Sleeve Blouses Crew Neck Tunic Boho Top Going Out T Shirts Womens Summer Fashion Streetwear', '판매처: Amazon.co.uk - Amazon.co.uk-Seller | 가격: £7.99', 'https://encrypted-tbn2.gstatic.com/shopping?q=tbn:ANd9GcTSL10Vwpy8_8TUyPpt5Fi6r6WA6v0hs_jEnQPxhtqXszGPqygOUwiF7imBH1wpielteEw-m1cxdBdGlnzgICarq1kYhT1nGWnXcz2LBREfvywkywRU6I2v',
  67, 'steady',
  62, 52, 67, 42,
  ARRAY['Amazon.co.uk - Amazon.co.uk-Seller','£7.99'], ARRAY['https://www.google.com/search?ibp=oshop&q=trending fashion clothes UK 2026&prds=productid:3010207576179266308,headlineOfferDocid:3010207576179266308,imageDocid:4337428053644178626,pvt:a&hl=en&gl=uk&udm=28'],
  '2026-03-17T05:52:08.866748+00:00', '2026-03-17T05:52:08.866748+00:00'
);
INSERT INTO trends (country_id, category_id, name, description, image_url, heat_score, heat_status, search_score, social_score, ecommerce_score, news_score, tags, source_urls, first_detected_at, last_updated_at) VALUES (
  (SELECT id FROM countries WHERE code='GB'),
  (SELECT id FROM categories WHERE slug='fashion'),
  'Women''s DISTURBIA Callopistria Moth Print Mini Shirt Dress', '판매처: Disturbia | 가격: £36.00 | 평점: 4.7 | 리뷰: 31개', 'https://encrypted-tbn1.gstatic.com/shopping?q=tbn:ANd9GcRdqlWQIkJZc1RgBhfYSM7aU_TyAiUuwM30ICNLxauYnevDbvOScXfXwlSK6U24K_eBIH0SNUxtJR9UvAXsriASPkDJPyI5TrOEADhiYt9PZpVQS9sPmMJ1',
  89, 'steady',
  84, 74, 89, 64,
  ARRAY['Disturbia','£36.00','★4.7'], ARRAY['https://www.google.com/search?ibp=oshop&q=trending fashion clothes UK 2026&prds=catalogid:12444292708488824333,headlineOfferDocid:6132017164025753036,imageDocid:18270620495181522717,rds:PC_8145956321143070657|PROD_PC_8145956321143070657,gpcid:8145956321143070657,mid:576462832603693538,pvt:a&hl=en&gl=uk&udm=28'],
  '2026-03-17T05:52:08.866748+00:00', '2026-03-17T05:52:08.866748+00:00'
);
INSERT INTO trends (country_id, category_id, name, description, image_url, heat_score, heat_status, search_score, social_score, ecommerce_score, news_score, tags, source_urls, first_detected_at, last_updated_at) VALUES (
  (SELECT id FROM countries WHERE code='GB'),
  (SELECT id FROM categories WHERE slug='products'),
  'Go Viral Family Party Game', '판매처: Argos | 가격: £20.00', 'https://encrypted-tbn0.gstatic.com/shopping?q=tbn:ANd9GcQaX7JABKmkr3FHQstUMTvOm0U3-idaptnJQ0kEW84O0s9PgaYj7pns8DEiSIhia8a-e0jXZF2Mnd-ThnKJrzvZT8orVSdFN7WbdqEyi90xwDZ8X8b9kdJp',
  100, 'rising',
  95, 85, 100, 75,
  ARRAY['Argos','£20.00'], ARRAY['https://www.google.com/search?ibp=oshop&q=trending products UK viral 2026&prds=catalogid:15820496545352253935,headlineOfferDocid:17183981460260417810,imageDocid:2283607624680320356,gpcid:9979370294590551465,mid:576462783750811108,pvt:hg&hl=en&gl=uk&udm=28'],
  '2026-03-17T05:52:08.866748+00:00', '2026-03-17T05:52:08.866748+00:00'
);
INSERT INTO trends (country_id, category_id, name, description, image_url, heat_score, heat_status, search_score, social_score, ecommerce_score, news_score, tags, source_urls, first_detected_at, last_updated_at) VALUES (
  (SELECT id FROM countries WHERE code='GB'),
  (SELECT id FROM categories WHERE slug='products'),
  'What Do You Meme? UK Refreshed', '판매처: Smyths Toys | 가격: £19.99 | 평점: 4.6 | 리뷰: 20개', 'https://encrypted-tbn2.gstatic.com/shopping?q=tbn:ANd9GcSNqJxGLmvpUn2y93XMSF7HotjeBfVGsS7GcjcmygBc9zn1yDaXFPW_HxV4QqWDcKOif3fJOOvslJDcrdVl_keke7wjVfwZ',
  100, 'rising',
  95, 85, 100, 75,
  ARRAY['Smyths Toys','£19.99','★4.6'], ARRAY['https://www.google.com/search?ibp=oshop&q=trending products UK viral 2026&prds=catalogid:14741385819412886498,headlineOfferDocid:573650038789970552,imageDocid:16479007188458798254,rds:PC_12256081019680237361|PROD_PC_12256081019680237361,gpcid:12256081019680237361,pvt:hg&hl=en&gl=uk&udm=28'],
  '2026-03-17T05:52:08.866748+00:00', '2026-03-17T05:52:08.866748+00:00'
);
INSERT INTO trends (country_id, category_id, name, description, image_url, heat_score, heat_status, search_score, social_score, ecommerce_score, news_score, tags, source_urls, first_detected_at, last_updated_at) VALUES (
  (SELECT id FROM countries WHERE code='GB'),
  (SELECT id FROM categories WHERE slug='products'),
  'Body Mist Sol De Janeiro Cheirosa 40', '판매처: Justmylook | 가격: £26.60 | 평점: 4.7 | 리뷰: 21,000개', 'https://encrypted-tbn1.gstatic.com/shopping?q=tbn:ANd9GcRkGjATVUPZW_IdlK6Sd3kPrN079dTmKqvpYAsNdsxOLWSGaRjLttZHua101zyzG6Q9QezwAiGdDJtC1nHUOzpS6hciMOtkc_duvzI9QOMZ6A2qyF0ReP5o',
  100, 'rising',
  95, 85, 100, 75,
  ARRAY['Justmylook','£26.60','★4.7'], ARRAY['https://www.google.com/search?ibp=oshop&q=trending products UK viral 2026&prds=catalogid:2430398212477549406,headlineOfferDocid:15142464698726572751,imageDocid:3301919283349180253,rds:PC_2912987878031467640|PROD_PC_2912987878031467640,gpcid:2912987878031467640,mid:576462777187487843,pvt:hg&hl=en&gl=uk&udm=28'],
  '2026-03-17T05:52:08.866748+00:00', '2026-03-17T05:52:08.866748+00:00'
);
INSERT INTO trends (country_id, category_id, name, description, image_url, heat_score, heat_status, search_score, social_score, ecommerce_score, news_score, tags, source_urls, first_detected_at, last_updated_at) VALUES (
  (SELECT id FROM countries WHERE code='GB'),
  (SELECT id FROM categories WHERE slug='products'),
  'Charlotte Tilbury Unreal Blush Healthy Glow Stick', '판매처: Charlotte Tilbury | 가격: £25.60 | 평점: 4.7 | 리뷰: 1,400개', 'https://encrypted-tbn3.gstatic.com/shopping?q=tbn:ANd9GcQhcilpoBsTgtNXM3zuvj02l94cto-wHYF2Er_mnNbQk0ZnenRSQwLjUjy8cyNP2zvol-wdEgLpVdTqRLnEk34OiztXM8CyGs3yY2jiqL9VNWNQBPMX76g_dw',
  100, 'rising',
  95, 85, 100, 75,
  ARRAY['Charlotte Tilbury','£25.60','★4.7'], ARRAY['https://www.google.com/search?ibp=oshop&q=trending products UK viral 2026&prds=catalogid:1556621823656960803,headlineOfferDocid:14345795236911553465,imageDocid:2512219959448712007,rds:PC_17448035073291591416|PROD_PC_17448035073291591416,gpcid:17448035073291591416,mid:576462827082371776,pvt:hg&hl=en&gl=uk&udm=28'],
  '2026-03-17T05:52:08.866748+00:00', '2026-03-17T05:52:08.866748+00:00'
);
INSERT INTO trends (country_id, category_id, name, description, image_url, heat_score, heat_status, search_score, social_score, ecommerce_score, news_score, tags, source_urls, first_detected_at, last_updated_at) VALUES (
  (SELECT id FROM countries WHERE code='GB'),
  (SELECT id FROM categories WHERE slug='products'),
  'Eletorot Birthday Gifts for Women: Unique Hamper Pamper Basket for Mum, Wife, Sister, Girls, Daughter, Nan, Personalised Ladies Self Care Spa Bath Set', '판매처: Amazon.co.uk - Amazon.co.uk-Seller | 가격: £12.99', 'https://encrypted-tbn3.gstatic.com/shopping?q=tbn:ANd9GcSNK3FtsqoUbNd4qnJtB6UVNsV-8eq3X-1nHjcTrXxR6uArsfnVqKXdyLtOCx3n1lPdq-Qne6t4IuRG9h4ORGVMCgZgOA7JvrryiM4w9YoBRhUMs36kHEpZQw',
  90, 'rising',
  85, 75, 90, 65,
  ARRAY['Amazon.co.uk - Amazon.co.uk-Seller','£12.99'], ARRAY['https://www.google.com/search?ibp=oshop&q=trending products UK viral 2026&prds=productid:2727284328475585329,headlineOfferDocid:2727284328475585329,imageDocid:10264843903302311239,pvt:hg&hl=en&gl=uk&udm=28'],
  '2026-03-17T05:52:08.866748+00:00', '2026-03-17T05:52:08.866748+00:00'
);
INSERT INTO trends (country_id, category_id, name, description, image_url, heat_score, heat_status, search_score, social_score, ecommerce_score, news_score, tags, source_urls, first_detected_at, last_updated_at) VALUES (
  (SELECT id FROM countries WHERE code='GB'),
  (SELECT id FROM categories WHERE slug='products'),
  'Shark Matrix Plus 2-in-1 Robot Vacuum Mop', '판매처: George at ASDA | 가격: £228.00 | 평점: 4.0 | 리뷰: 2,400개', 'https://encrypted-tbn3.gstatic.com/shopping?q=tbn:ANd9GcS8wIYNVFu4D8HgOzG9Z6mH4VODShdhvUo4iiRIdOZ20OvhkaeteJwy6I1QxZFWMbp6Wvd5_chIGNWN0xkV6psdQcGP_fbJ0i5v3w-EaQpT9sHiZfqUZXJT',
  100, 'steady',
  95, 85, 100, 75,
  ARRAY['George at ASDA','£228.00','★4.0'], ARRAY['https://www.google.com/search?ibp=oshop&q=trending products UK viral 2026&prds=catalogid:583700360783566488,headlineOfferDocid:3703211330522565276,imageDocid:13490776031514567507,rds:PC_13810121284207114560|PROD_PC_13810121284207114560,gpcid:13810121284207114560,mid:576462845892513031,pvt:hg&hl=en&gl=uk&udm=28'],
  '2026-03-17T05:52:08.866748+00:00', '2026-03-17T05:52:08.866748+00:00'
);
INSERT INTO trends (country_id, category_id, name, description, image_url, heat_score, heat_status, search_score, social_score, ecommerce_score, news_score, tags, source_urls, first_detected_at, last_updated_at) VALUES (
  (SELECT id FROM countries WHERE code='GB'),
  (SELECT id FROM categories WHERE slug='products'),
  'Patrick Ta Major Headlines Double-Take Crème & Powder Blush', '판매처: Cult Beauty | 가격: £37.00 | 평점: 4.7 | 리뷰: 13,000개', 'https://encrypted-tbn1.gstatic.com/shopping?q=tbn:ANd9GcSdLznigWfsA4_2cVz38hAyLBLc0tpcyndYh4DvsavMiuXRJCVDS9_IKSWz_VB6sJwZiNFYzDyi1s_vvLqVT2qiZ0-v3UW1urtWf1axJ6e0jjBww3YFnnCLMQ0',
  100, 'steady',
  95, 85, 100, 75,
  ARRAY['Cult Beauty','£37.00','★4.7'], ARRAY['https://www.google.com/search?ibp=oshop&q=trending products UK viral 2026&prds=catalogid:4444754049944305600,headlineOfferDocid:10154568134032909526,imageDocid:18405961894791324089,rds:PC_4910314374792565937|PROD_PC_4910314374792565937,gpcid:4910314374792565937,mid:576462569818813591,pvt:hg&hl=en&gl=uk&udm=28'],
  '2026-03-17T05:52:08.866748+00:00', '2026-03-17T05:52:08.866748+00:00'
);
INSERT INTO trends (country_id, category_id, name, description, image_url, heat_score, heat_status, search_score, social_score, ecommerce_score, news_score, tags, source_urls, first_detected_at, last_updated_at) VALUES (
  (SELECT id FROM countries WHERE code='GB'),
  (SELECT id FROM categories WHERE slug='products'),
  'Funky ASMR ball Orange Crunch', '판매처: Funky Fidgets Shop | 가격: £4.50', 'https://encrypted-tbn1.gstatic.com/shopping?q=tbn:ANd9GcSB0MUeODiPbV3X1FVRGIfr7nOZEkd4ALeJel_BWjqPYH_PLp63ZvNK78CGG2zS9AN-0k9i6Ew-GHkPFMzLONdlUaPwiJ5rWEhfxVDR0m0ezIXKRSut-GFZ',
  82, 'steady',
  77, 67, 82, 57,
  ARRAY['Funky Fidgets Shop','£4.50'], ARRAY['https://www.google.com/search?ibp=oshop&q=trending products UK viral 2026&prds=productid:6510795428973088319,headlineOfferDocid:6510795428973088319,imageDocid:3778645140147157325,pvt:hg&hl=en&gl=uk&udm=28'],
  '2026-03-17T05:52:08.866748+00:00', '2026-03-17T05:52:08.866748+00:00'
);
INSERT INTO trends (country_id, category_id, name, description, image_url, heat_score, heat_status, search_score, social_score, ecommerce_score, news_score, tags, source_urls, first_detected_at, last_updated_at) VALUES (
  (SELECT id FROM countries WHERE code='GB'),
  (SELECT id FROM categories WHERE slug='products'),
  'Divoom Ditoo-Pro Retro Pixel Art Bluetooth Speaker', '판매처: Amazon.co.uk - Amazon.co.uk-Seller | 가격: £82.99 | 평점: 4.7 | 리뷰: 1,300개', 'https://encrypted-tbn3.gstatic.com/shopping?q=tbn:ANd9GcRE0XjS43tHLDJZEr0-Kjzv2gkyRvUf5d2VpfCaIX__EWQuPo1eTbmHFsqmxEcr6sdkTt0AugnmcQITeiWNBpOnPSgU64pWzg0m8eF-YraJpvjOUxUXsOUufQ',
  100, 'steady',
  95, 85, 100, 75,
  ARRAY['Amazon.co.uk - Amazon.co.uk-Seller','£82.99','★4.7'], ARRAY['https://www.google.com/search?ibp=oshop&q=trending products UK viral 2026&prds=catalogid:2017547737850285536,headlineOfferDocid:12207183716533455958,imageDocid:3752650927681804971,rds:PC_14114659447497641688|PROD_PC_14114659447497641688,gpcid:2601685407539427281,mid:576462755304656790,pvt:hg&hl=en&gl=uk&udm=28'],
  '2026-03-17T05:52:08.866748+00:00', '2026-03-17T05:52:08.866748+00:00'
);
INSERT INTO trends (country_id, category_id, name, description, image_url, heat_score, heat_status, search_score, social_score, ecommerce_score, news_score, tags, source_urls, first_detected_at, last_updated_at) VALUES (
  (SELECT id FROM countries WHERE code='GB'),
  (SELECT id FROM categories WHERE slug='products'),
  'Chloé Nomade Eau de Parfum', '판매처: Justmylook | 가격: £40.99 | 평점: 4.7 | 리뷰: 13,000개', 'https://encrypted-tbn3.gstatic.com/shopping?q=tbn:ANd9GcQUuFQvdCkPhKDMri2DNIKe7gidN14dwTHxtRhaWIjEnhC7tKaRTm1RQuKSoKfrs6S00Av5Wjhoq5KVgaoQqeCafvIfqL1jH3GdWSFn0ijFxFoMe5D5-vpjew',
  100, 'steady',
  95, 85, 100, 75,
  ARRAY['Justmylook','£40.99','★4.7'], ARRAY['https://www.google.com/search?ibp=oshop&q=trending products UK viral 2026&prds=catalogid:14967357119343328456,headlineOfferDocid:6633830831972377040,imageDocid:15812385540673868083,rds:PC_9970126549054653955|PROD_PC_9970126549054653955,gpcid:9970126549054653955,mid:576462839966598506,pvt:hg&hl=en&gl=uk&udm=28'],
  '2026-03-17T05:52:08.866748+00:00', '2026-03-17T05:52:08.866748+00:00'
);
INSERT INTO trends (country_id, category_id, name, description, image_url, heat_score, heat_status, search_score, social_score, ecommerce_score, news_score, tags, source_urls, first_detected_at, last_updated_at) VALUES (
  (SELECT id FROM countries WHERE code='GB'),
  (SELECT id FROM categories WHERE slug='products'),
  'Charlotte Tilbury Unreal Skin Sheer Glow Tint Foundation', '판매처: Charlotte Tilbury | 가격: £29.60 | 평점: 4.3 | 리뷰: 3,800개', 'https://encrypted-tbn1.gstatic.com/shopping?q=tbn:ANd9GcTH288a9nI0oeY_-YAf7KLGuRFBv2jC1Bx4evkmt51WeHEZP_IinrXZlLpBH94FWE0khTbMcCJ8Ru_6hxlLf29jX549VtJG3Bcwsz8F7tcNESjFILAinMhigl8',
  100, 'steady',
  95, 85, 100, 75,
  ARRAY['Charlotte Tilbury','£29.60','★4.3'], ARRAY['https://www.google.com/search?ibp=oshop&q=trending products UK viral 2026&prds=catalogid:13379281297344872950,headlineOfferDocid:2812431455372621516,imageDocid:11692495801172246233,rds:PC_10172049923242061274|PROD_PC_10172049923242061274,gpcid:10172049923242061274,mid:576462781031776362,pvt:hg&hl=en&gl=uk&udm=28'],
  '2026-03-17T05:52:08.866748+00:00', '2026-03-17T05:52:08.866748+00:00'
);
INSERT INTO trends (country_id, category_id, name, description, image_url, heat_score, heat_status, search_score, social_score, ecommerce_score, news_score, tags, source_urls, first_detected_at, last_updated_at) VALUES (
  (SELECT id FROM countries WHERE code='GB'),
  (SELECT id FROM categories WHERE slug='products'),
  'Portico Designs Rosie Made a Thing Slim Diary', '판매처: Sweet P | 가격: £4.50 | 평점: 4.8 | 리뷰: 7개', 'https://encrypted-tbn1.gstatic.com/shopping?q=tbn:ANd9GcSFm5l0JlWAw6ORcVGkRB3oHyfEcTdFi9rIYxR2z1TuCgFb5WKd0UJtWxf3TNom82pVheFCaYDlaEmnWNnPnHtXLr3pPNlbirg_aVmp2YWNzMYRAG__cLp_jA',
  94, 'steady',
  89, 79, 94, 69,
  ARRAY['Sweet P','£4.50','★4.8'], ARRAY['https://www.google.com/search?ibp=oshop&q=trending products UK viral 2026&prds=catalogid:14899508518837419092,headlineOfferDocid:7722247574689035974,imageDocid:14903361848365706825,rds:PC_6035528977289072079|PROD_PC_6035528977289072079,gpcid:6035528977289072079,mid:576462826140823492,pvt:hg&hl=en&gl=uk&udm=28'],
  '2026-03-17T05:52:08.866748+00:00', '2026-03-17T05:52:08.866748+00:00'
);
INSERT INTO trends (country_id, category_id, name, description, image_url, heat_score, heat_status, search_score, social_score, ecommerce_score, news_score, tags, source_urls, first_detected_at, last_updated_at) VALUES (
  (SELECT id FROM countries WHERE code='GB'),
  (SELECT id FROM categories WHERE slug='products'),
  'Designer-Inspired Perfume', '판매처: Scent 26 Candle Co. | 가격: £34.99', 'https://encrypted-tbn1.gstatic.com/shopping?q=tbn:ANd9GcQ57bcFXc9zdN_T03tDbWE3JEJEHToDOEQGVkCFX4fR2VmROfQQxLjDrTJKtS2_G3X08TVmXbbpSRYCUdBxf65heOR2P2O4_YHjXMd6x3nhBuMNUHysCJ8ANw',
  70, 'steady',
  65, 55, 70, 45,
  ARRAY['Scent 26 Candle Co.','£34.99'], ARRAY['https://www.google.com/search?ibp=oshop&q=trending products UK viral 2026&prds=catalogid:287237690222373281,headlineOfferDocid:6645797075010447082,imageDocid:12588437653622662785,gpcid:6416608854813933550,pvt:hg&hl=en&gl=uk&udm=28'],
  '2026-03-17T05:52:08.866748+00:00', '2026-03-17T05:52:08.866748+00:00'
);
INSERT INTO trends (country_id, category_id, name, description, image_url, heat_score, heat_status, search_score, social_score, ecommerce_score, news_score, tags, source_urls, first_detected_at, last_updated_at) VALUES (
  (SELECT id FROM countries WHERE code='GB'),
  (SELECT id FROM categories WHERE slug='products'),
  'The Ordinary Multi-Peptide + Copper Peptides 1% Serum', '판매처: Harrods | 가격: £28.90 | 평점: 4.6 | 리뷰: 4,000개', 'https://encrypted-tbn1.gstatic.com/shopping?q=tbn:ANd9GcRpj2fDQZypwxS1ku2dEa_VVBB6MrLlZ_AppMXu7H_CJo6YDsHHgvZHPJfk1Q2_p8mXsrWvncu6XqWfe7e_utdEJ5PpkV1P456rGvTqh2XVFnI1UVlVSEkL',
  100, 'steady',
  95, 85, 100, 75,
  ARRAY['Harrods','£28.90','★4.6'], ARRAY['https://www.google.com/search?ibp=oshop&q=trending products UK viral 2026&prds=catalogid:2452231911483610697,headlineOfferDocid:958692494584298456,imageDocid:13826562499675944709,rds:PC_14315254744359337565|PROD_PC_14315254744359337565,gpcid:14315254744359337565,mid:576462460901031824,pvt:hg&hl=en&gl=uk&udm=28'],
  '2026-03-17T05:52:08.866748+00:00', '2026-03-17T05:52:08.866748+00:00'
);
INSERT INTO trends (country_id, category_id, name, description, image_url, heat_score, heat_status, search_score, social_score, ecommerce_score, news_score, tags, source_urls, first_detected_at, last_updated_at) VALUES (
  (SELECT id FROM countries WHERE code='GB'),
  (SELECT id FROM categories WHERE slug='products'),
  'Me to You Classic Slim Diary', '판매처: Calendar Club Main | 가격: £3.99 | 평점: 4.3 | 리뷰: 12개', 'https://encrypted-tbn2.gstatic.com/shopping?q=tbn:ANd9GcT1Kp-bZa0X0FWkny7b3DyQVwcnV2hXCNAE0clM83QuXo3eJF1bQOeMaW6y_4CrXvkmY-swZ6AGPYvh6gFL2VmiJjDtgaPjt0HOeBeasdbDL_lOUNVAbHn-',
  83, 'steady',
  78, 68, 83, 58,
  ARRAY['Calendar Club Main','£3.99','★4.3'], ARRAY['https://www.google.com/search?ibp=oshop&q=trending products UK viral 2026&prds=catalogid:11216382600850353808,headlineOfferDocid:5036927925175309272,imageDocid:6621122187447452062,rds:PC_11444482442259368393|PROD_PC_11444482442259368393,gpcid:11444482442259368393,mid:576462518100621120,pvt:hg&hl=en&gl=uk&udm=28'],
  '2026-03-17T05:52:08.866748+00:00', '2026-03-17T05:52:08.866748+00:00'
);
INSERT INTO trends (country_id, category_id, name, description, image_url, heat_score, heat_status, search_score, social_score, ecommerce_score, news_score, tags, source_urls, first_detected_at, last_updated_at) VALUES (
  (SELECT id FROM countries WHERE code='GB'),
  (SELECT id FROM categories WHERE slug='food'),
  'Savoury Crisps Mystery Box', '판매처: WorldSnacks | 가격: £20.00', 'https://encrypted-tbn1.gstatic.com/shopping?q=tbn:ANd9GcS0uxW9KPK2Wm0jZMg3yrSZrQEa5sOfQbtEuMK266qUmZRMEYNQHFifx_K6WnjLRLwo_BPf1MtKDlYZ-lTUBZlGbeemc5DB99CBeItBuMNhbQrNYAaHZziEWA',
  100, 'rising',
  95, 85, 100, 75,
  ARRAY['WorldSnacks','£20.00'], ARRAY['https://www.google.com/search?ibp=oshop&q=trending food snacks UK 2026&prds=productid:7610576237625945453,headlineOfferDocid:7610576237625945453,imageDocid:3178966890270130009,pvt:hg&hl=en&gl=uk&udm=28'],
  '2026-03-17T05:52:08.866748+00:00', '2026-03-17T05:52:08.866748+00:00'
);
INSERT INTO trends (country_id, category_id, name, description, image_url, heat_score, heat_status, search_score, social_score, ecommerce_score, news_score, tags, source_urls, first_detected_at, last_updated_at) VALUES (
  (SELECT id FROM countries WHERE code='GB'),
  (SELECT id FROM categories WHERE slug='food'),
  'Nakd Fruit & Nut Bar Variety Pack', '판매처: Amazon.co.uk | 가격: £13.50 | 평점: 3.5 | 리뷰: 20개', 'https://encrypted-tbn0.gstatic.com/shopping?q=tbn:ANd9GcREf5lTJQv9gMNbVprqz93BMVZB2mdgu9SFQxHRbfmask3T9UsrG_B6O4_yDXT9VYZsubiBRSGUUevJ9FgWPN18unC5vo9YQyw7ygOCA1vGqBpZgvZbngyZ',
  100, 'rising',
  95, 85, 100, 75,
  ARRAY['Amazon.co.uk','£13.50','★3.5'], ARRAY['https://www.google.com/search?ibp=oshop&q=trending food snacks UK 2026&prds=catalogid:12093516969319042705,headlineOfferDocid:12086940304289991923,imageDocid:17630818590620408076,rds:PC_10330073922225846586|PROD_PC_10330073922225846586,gpcid:10330073922225846586,mid:576462854089984330,pvt:hg&hl=en&gl=uk&udm=28'],
  '2026-03-17T05:52:08.866748+00:00', '2026-03-17T05:52:08.866748+00:00'
);
INSERT INTO trends (country_id, category_id, name, description, image_url, heat_score, heat_status, search_score, social_score, ecommerce_score, news_score, tags, source_urls, first_detected_at, last_updated_at) VALUES (
  (SELECT id FROM countries WHERE code='GB'),
  (SELECT id FROM categories WHERE slug='food'),
  'Samyang Hot Chicken Zzaldduck Snack', '판매처: Starry Mart | 가격: £1.70 | 평점: 4.7 | 리뷰: 486개', 'https://encrypted-tbn0.gstatic.com/shopping?q=tbn:ANd9GcRc5UlUIvR50V3ZfNYk_cwYayvquZ1TGJKLcKRMUNHDX9l0_V1-BqwSDHuPvwxG3io4wqd6io_xVSgg6DhjsNX1Yzi2o2DSoQ',
  100, 'rising',
  95, 85, 100, 75,
  ARRAY['Starry Mart','£1.70','★4.7'], ARRAY['https://www.google.com/search?ibp=oshop&q=trending food snacks UK 2026&prds=catalogid:3862875481655534192,headlineOfferDocid:1288911946066606590,imageDocid:3838295669017944892,rds:PC_17037089305263621754|PROD_PC_17037089305263621754,gpcid:17037089305263621754,mid:576462304628157429,pvt:hg&hl=en&gl=uk&udm=28'],
  '2026-03-17T05:52:08.866748+00:00', '2026-03-17T05:52:08.866748+00:00'
);
INSERT INTO trends (country_id, category_id, name, description, image_url, heat_score, heat_status, search_score, social_score, ecommerce_score, news_score, tags, source_urls, first_detected_at, last_updated_at) VALUES (
  (SELECT id FROM countries WHERE code='GB'),
  (SELECT id FROM categories WHERE slug='food'),
  '20 Piece Japanese Snacks & Candy Box Dagashi Sweets & Snack Set', '판매처: Amazon.co.uk - Amazon.co.uk-Seller | 가격: £19.97 | 평점: 5.0 | 리뷰: 4개', 'https://encrypted-tbn3.gstatic.com/shopping?q=tbn:ANd9GcQ84rW9Ahs30AG995p7HmwQGRiqKXm4uD7ImsGsD_0sQ000TAPhJgsT-LdRmXQpjmYLdmyN2rFmgnJsHzKH58JLR2EtBKxTvRtH3rCw49yzPV49OU6miY7a',
  100, 'rising',
  95, 85, 100, 75,
  ARRAY['Amazon.co.uk - Amazon.co.uk-Seller','£19.97','★5.0'], ARRAY['https://www.google.com/search?ibp=oshop&q=trending food snacks UK 2026&prds=catalogid:12943746370044773963,headlineOfferDocid:8312848346225461973,imageDocid:11433270321830316763,rds:PC_1357456646585882484|PROD_PC_1357456646585882484,gpcid:1357456646585882484,mid:576462502347199042,pvt:hg&hl=en&gl=uk&udm=28'],
  '2026-03-17T05:52:08.866748+00:00', '2026-03-17T05:52:08.866748+00:00'
);
INSERT INTO trends (country_id, category_id, name, description, image_url, heat_score, heat_status, search_score, social_score, ecommerce_score, news_score, tags, source_urls, first_detected_at, last_updated_at) VALUES (
  (SELECT id FROM countries WHERE code='GB'),
  (SELECT id FROM categories WHERE slug='food'),
  'Torres Black Truffle Potato Crisps', '판매처: Ocado | 가격: £5.10 | 평점: 4.6 | 리뷰: 1,000개', 'https://encrypted-tbn1.gstatic.com/shopping?q=tbn:ANd9GcR1U5ECX3CqQyuiMkvBiNCDnMW851-_Aeti-1UHpqrR-qkKFM6QaKGQgKcESGpOUt1XdxwXH14dhy5clpwTB9eDjIelxmqv',
  100, 'rising',
  95, 85, 100, 75,
  ARRAY['Ocado','£5.10','★4.6'], ARRAY['https://www.google.com/search?ibp=oshop&q=trending food snacks UK 2026&prds=catalogid:12561701440083907260,headlineOfferDocid:14171787666211529644,imageDocid:17701241123173024177,rds:PC_2573941019414605222|PROD_PC_2573941019414605222,gpcid:2573941019414605222,mid:576462328119438172,pvt:hg&hl=en&gl=uk&udm=28'],
  '2026-03-17T05:52:08.866748+00:00', '2026-03-17T05:52:08.866748+00:00'
);
INSERT INTO trends (country_id, category_id, name, description, image_url, heat_score, heat_status, search_score, social_score, ecommerce_score, news_score, tags, source_urls, first_detected_at, last_updated_at) VALUES (
  (SELECT id FROM countries WHERE code='GB'),
  (SELECT id FROM categories WHERE slug='food'),
  'The Classic Snack Bundle', '판매처: Foodhak | 가격: £22.99', 'https://encrypted-tbn3.gstatic.com/shopping?q=tbn:ANd9GcQcdZogbGUY53pmBOwG1N8SMp_5VyXYCOVOXFAd2zXonYuyWVygFF7Wy8HRcDuQ16WVsuz0Zrsh435Eq0m-RxPL7e9E05buJGGqWD_VWIlYzWf16nwI78Z0',
  87, 'steady',
  82, 72, 87, 62,
  ARRAY['Foodhak','£22.99'], ARRAY['https://www.google.com/search?ibp=oshop&q=trending food snacks UK 2026&prds=catalogid:10617466732748952806,headlineOfferDocid:13108336471173055401,imageDocid:11021336019629626619,gpcid:1279031356976456420,pvt:hg&hl=en&gl=uk&udm=28'],
  '2026-03-17T05:52:08.866748+00:00', '2026-03-17T05:52:08.866748+00:00'
);
INSERT INTO trends (country_id, category_id, name, description, image_url, heat_score, heat_status, search_score, social_score, ecommerce_score, news_score, tags, source_urls, first_detected_at, last_updated_at) VALUES (
  (SELECT id FROM countries WHERE code='GB'),
  (SELECT id FROM categories WHERE slug='food'),
  'BEAR Fruit Yoyos Strawberry', '판매처: Amazon.co.uk | 가격: £12.00 | 평점: 4.4 | 리뷰: 23개', 'https://encrypted-tbn2.gstatic.com/shopping?q=tbn:ANd9GcSB7wBMgcoO9I9Hh9ksF746KiW9BsoeISrYemOrfTIvMfsn7nhEy2K7XRUjdRnEYl3CUiZcNo1gpeePnDzc_INf_mBb8ig3JRM30K4FaIB9l4LqZARO5YzD',
  100, 'steady',
  95, 85, 100, 75,
  ARRAY['Amazon.co.uk','£12.00','★4.4'], ARRAY['https://www.google.com/search?ibp=oshop&q=trending food snacks UK 2026&prds=catalogid:17676560261245260,headlineOfferDocid:4651603309415957264,imageDocid:1605685765772040106,rds:PC_16660953284697588783|PROD_PC_16660953284697588783,gpcid:16660953284697588783,mid:576462544128160626,pvt:hg&hl=en&gl=uk&udm=28'],
  '2026-03-17T05:52:08.866748+00:00', '2026-03-17T05:52:08.866748+00:00'
);
INSERT INTO trends (country_id, category_id, name, description, image_url, heat_score, heat_status, search_score, social_score, ecommerce_score, news_score, tags, source_urls, first_detected_at, last_updated_at) VALUES (
  (SELECT id FROM countries WHERE code='GB'),
  (SELECT id FROM categories WHERE slug='food'),
  'OLW Smash Choc Covered Corn Snacks', '판매처: World Food Shop | 가격: £4.00 | 평점: 4.8 | 리뷰: 168개', 'https://encrypted-tbn1.gstatic.com/shopping?q=tbn:ANd9GcT2kz-ppaBn5mB0K-B1L_0q2lVx8IZpQPN7zeeTEAS6Vb1CU7gjzH0w6Csp0zKu9bmyWMaUMO6OjJOKhGHYzAm1gAIIZKLE',
  100, 'steady',
  95, 85, 100, 75,
  ARRAY['World Food Shop','£4.00','★4.8'], ARRAY['https://www.google.com/search?ibp=oshop&q=trending food snacks UK 2026&prds=catalogid:11567321723865799482,headlineOfferDocid:11315361132545159718,imageDocid:11391726236803808897,rds:PC_13396059048763990937|PROD_PC_13396059048763990937,gpcid:13396059048763990937,mid:576462318698400615,pvt:hg&hl=en&gl=uk&udm=28'],
  '2026-03-17T05:52:08.866748+00:00', '2026-03-17T05:52:08.866748+00:00'
);
INSERT INTO trends (country_id, category_id, name, description, image_url, heat_score, heat_status, search_score, social_score, ecommerce_score, news_score, tags, source_urls, first_detected_at, last_updated_at) VALUES (
  (SELECT id FROM countries WHERE code='GB'),
  (SELECT id FROM categories WHERE slug='food'),
  'Simba Ghost Pops 100g', '판매처: American Grocer | 가격: £3.99 | 평점: 5.0 | 리뷰: 10개', 'https://encrypted-tbn1.gstatic.com/shopping?q=tbn:ANd9GcSCNMGf21Nw_y7-9afFXIZGyVPBQUUImf9HXDPV4uBg4Dgohk95bAc--PVJzp_KvLSP26t9CnVc8nlhWyOxqBT20JNMPW1czzFL1QNy_9iABfFWbxxwYQFbtA',
  100, 'steady',
  95, 85, 100, 75,
  ARRAY['American Grocer','£3.99','★5.0'], ARRAY['https://www.google.com/search?ibp=oshop&q=trending food snacks UK 2026&prds=catalogid:13401988331299306644,headlineOfferDocid:381991427456684169,imageDocid:9630200817079493441,rds:PC_2001458042067728683|PROD_PC_2001458042067728683,gpcid:2001458042067728683,mid:576462442609947445,pvt:hg&hl=en&gl=uk&udm=28'],
  '2026-03-17T05:52:08.866748+00:00', '2026-03-17T05:52:08.866748+00:00'
);
INSERT INTO trends (country_id, category_id, name, description, image_url, heat_score, heat_status, search_score, social_score, ecommerce_score, news_score, tags, source_urls, first_detected_at, last_updated_at) VALUES (
  (SELECT id FROM countries WHERE code='GB'),
  (SELECT id FROM categories WHERE slug='food'),
  'Walkers Monster Munch Variety', '판매처: Tesco | 가격: £2.99 | 평점: 4.2 | 리뷰: 62개', 'https://encrypted-tbn1.gstatic.com/shopping?q=tbn:ANd9GcSdNp4jMXBNwrmvSYYp4a_L8ZtZmoKFooyvhm_G_1ZFH8GnYqOn-sQvKRj6LPjS1zUNJJNKiVqVAxccN4WQRCPJqv8ifJuHSapR2ePxxZTA5sSMpSNjfejY',
  98, 'steady',
  93, 83, 98, 73,
  ARRAY['Tesco','£2.99','★4.2'], ARRAY['https://www.google.com/search?ibp=oshop&q=trending food snacks UK 2026&prds=catalogid:3953480254536179643,headlineOfferDocid:12951502685631606981,imageDocid:1031784750822005301,rds:PC_10149294321754974819|PROD_PC_10149294321754974819,gpcid:3863291832927299212,mid:576462862777152946,pvt:hg&hl=en&gl=uk&udm=28'],
  '2026-03-17T05:52:08.866748+00:00', '2026-03-17T05:52:08.866748+00:00'
);
INSERT INTO trends (country_id, category_id, name, description, image_url, heat_score, heat_status, search_score, social_score, ecommerce_score, news_score, tags, source_urls, first_detected_at, last_updated_at) VALUES (
  (SELECT id FROM countries WHERE code='GB'),
  (SELECT id FROM categories WHERE slug='food'),
  'Eastanbul International Snack Box', '판매처: Amazon.co.uk - Amazon.co.uk-Seller | 가격: £27.99 | 평점: 4.0 | 리뷰: 4개', 'https://encrypted-tbn2.gstatic.com/shopping?q=tbn:ANd9GcS0GeoJFUEOC0u2BZag99qpmTW88ZcSHxh_Yvv2e9SJMkp0MFKUnBiCZsEz9I8wf7kvDApXulOQZcUVsRan1j1pdoK6x7yi3n6xZjCtmuK7sjR3FmamTJWGQw',
  88, 'steady',
  83, 73, 88, 63,
  ARRAY['Amazon.co.uk - Amazon.co.uk-Seller','£27.99','★4.0'], ARRAY['https://www.google.com/search?ibp=oshop&q=trending food snacks UK 2026&prds=catalogid:2823264576305248956,headlineOfferDocid:17675932153939112422,imageDocid:2137394557646038494,rds:PC_15168330328496942423|PROD_PC_15168330328496942423,gpcid:15168330328496942423,mid:576462870137613187,pvt:hg&hl=en&gl=uk&udm=28'],
  '2026-03-17T05:52:08.866748+00:00', '2026-03-17T05:52:08.866748+00:00'
);
INSERT INTO trends (country_id, category_id, name, description, image_url, heat_score, heat_status, search_score, social_score, ecommerce_score, news_score, tags, source_urls, first_detected_at, last_updated_at) VALUES (
  (SELECT id FROM countries WHERE code='GB'),
  (SELECT id FROM categories WHERE slug='food'),
  'Pom Bear Original Snacks', '판매처: Ocado | 가격: £1.50 | 평점: 4.6 | 리뷰: 526개', 'https://encrypted-tbn2.gstatic.com/shopping?q=tbn:ANd9GcTJ0MbH5ChXRWQFbFcM1a4VGpywJe0f7ajaz-tvsdAPQdOZ2d_-gXTRv7Yatl0u1_u_PimrcvZBVUt7GW18tIi2iGumXbkPvQ',
  100, 'steady',
  95, 85, 100, 75,
  ARRAY['Ocado','£1.50','★4.6'], ARRAY['https://www.google.com/search?ibp=oshop&q=trending food snacks UK 2026&prds=catalogid:6369260280204668843,headlineOfferDocid:2946713242054715489,imageDocid:6810374246113787322,rds:PC_15710271633305970837|PROD_PC_15710271633305970837,gpcid:15710271633305970837,mid:576462349368487184,pvt:hg&hl=en&gl=uk&udm=28'],
  '2026-03-17T05:52:08.866748+00:00', '2026-03-17T05:52:08.866748+00:00'
);
INSERT INTO trends (country_id, category_id, name, description, image_url, heat_score, heat_status, search_score, social_score, ecommerce_score, news_score, tags, source_urls, first_detected_at, last_updated_at) VALUES (
  (SELECT id FROM countries WHERE code='GB'),
  (SELECT id FROM categories WHERE slug='food'),
  'Go Ahead Crispy Fruit Slice Forest Fruit', '판매처: Waitrose & Partners | 가격: £1.60 | 평점: 4.0 | 리뷰: 145개', 'https://encrypted-tbn1.gstatic.com/shopping?q=tbn:ANd9GcSyHQxzEvoziWh2XUkHzDtrKsjo5Rmd9cD04DDHBtiKvt5r95uV6YjBiZvs2ODGS9w6igARoP7ELw7zMcYWztRmPUl8sV92',
  90, 'steady',
  85, 75, 90, 65,
  ARRAY['Waitrose & Partners','£1.60','★4.0'], ARRAY['https://www.google.com/search?ibp=oshop&q=trending food snacks UK 2026&prds=catalogid:18237450117475540644,headlineOfferDocid:17763254249041337928,imageDocid:10998563562609026177,rds:PC_17774415859940659097|PROD_PC_17774415859940659097,gpcid:17774415859940659097,mid:576462407491949868,pvt:hg&hl=en&gl=uk&udm=28'],
  '2026-03-17T05:52:08.866748+00:00', '2026-03-17T05:52:08.866748+00:00'
);
INSERT INTO trends (country_id, category_id, name, description, image_url, heat_score, heat_status, search_score, social_score, ecommerce_score, news_score, tags, source_urls, first_detected_at, last_updated_at) VALUES (
  (SELECT id FROM countries WHERE code='GB'),
  (SELECT id FROM categories WHERE slug='food'),
  'Sakura Box Japanese Snacks & Candy 30 Piece Dagashi Set', '판매처: Amazon.co.uk - Amazon.co.uk-Seller | 가격: £25.97 | 평점: 5.0 | 리뷰: 1개', 'https://encrypted-tbn1.gstatic.com/shopping?q=tbn:ANd9GcShNhSIzrh5hh6qZF2SeSOwE7zB6jAXbDTbvqHc8S9Vn7k3eK0paaeeBSrXJOq2PDMhj9UwCpofl-BGSjDMX338cIFSXIBAL8id_Q_iMROdvfiANvw-LvBZ5A',
  87, 'steady',
  82, 72, 87, 62,
  ARRAY['Amazon.co.uk - Amazon.co.uk-Seller','£25.97','★5.0'], ARRAY['https://www.google.com/search?ibp=oshop&q=trending food snacks UK 2026&prds=catalogid:14481730723912819369,headlineOfferDocid:7220968797947843516,imageDocid:14410293320394537685,rds:PC_15180467948369440437|PROD_PC_15180467948369440437,gpcid:15180467948369440437,mid:576462686020824803,pvt:hg&hl=en&gl=uk&udm=28'],
  '2026-03-17T05:52:08.866748+00:00', '2026-03-17T05:52:08.866748+00:00'
);
INSERT INTO trends (country_id, category_id, name, description, image_url, heat_score, heat_status, search_score, social_score, ecommerce_score, news_score, tags, source_urls, first_detected_at, last_updated_at) VALUES (
  (SELECT id FROM countries WHERE code='GB'),
  (SELECT id FROM categories WHERE slug='food'),
  'Luxury Gourmet Popcorn Snack Bundle - Multicolour', '판매처: The Range | 가격: £22.50 | 평점: 5.0 | 리뷰: 1개', 'https://encrypted-tbn2.gstatic.com/shopping?q=tbn:ANd9GcQxDiUMWfjs_pdN_0xyv_VEOFnS6AQp8p6KjLhS8OyfcFnTFfsxeuNFl2ye7mEsULQ2L5qwoWraXQuSa4BD9jmp4dlkVPEfYKFx4N2G4NHaMoSFJI4UMWFz',
  85, 'steady',
  80, 70, 85, 60,
  ARRAY['The Range','£22.50','★5.0'], ARRAY['https://www.google.com/search?ibp=oshop&q=trending food snacks UK 2026&prds=productid:5609076401215069977,headlineOfferDocid:5609076401215069977,imageDocid:14194068685355585054,rds:PC_3168826636943611860|PROD_PC_3168826636943611860,pvt:hg&hl=en&gl=uk&udm=28'],
  '2026-03-17T05:52:08.866748+00:00', '2026-03-17T05:52:08.866748+00:00'
);
INSERT INTO trends (country_id, category_id, name, description, image_url, heat_score, heat_status, search_score, social_score, ecommerce_score, news_score, tags, source_urls, first_detected_at, last_updated_at) VALUES (
  (SELECT id FROM countries WHERE code='GB'),
  (SELECT id FROM categories WHERE slug='entertainment'),
  'Retro Handheld Game Console', '판매처: Amazon.co.uk - Amazon.co.uk-Seller | 가격: £56.99', 'https://encrypted-tbn3.gstatic.com/shopping?q=tbn:ANd9GcRjf0ahCCnmoxBlyMEW3eRBMsPMBA6wnXnAOVdOZWIl_FSoauRqW_eoNXUm-i-zTsSXVGwFU7tpOikX1ziDB_TOUOOqGukoVzvf_iIzP44CJ_DKxFgN7zCwiw',
  100, 'rising',
  95, 85, 100, 75,
  ARRAY['Amazon.co.uk - Amazon.co.uk-Seller','£56.99'], ARRAY['https://www.google.com/search?ibp=oshop&q=trending toys games gadgets UK 2026&prds=catalogid:1748108004831656950,headlineOfferDocid:9579773388325432186,imageDocid:2438844138470153351,pvt:hg&hl=en&gl=uk&udm=28'],
  '2026-03-17T05:52:08.866748+00:00', '2026-03-17T05:52:08.866748+00:00'
);
INSERT INTO trends (country_id, category_id, name, description, image_url, heat_score, heat_status, search_score, social_score, ecommerce_score, news_score, tags, source_urls, first_detected_at, last_updated_at) VALUES (
  (SELECT id FROM countries WHERE code='GB'),
  (SELECT id FROM categories WHERE slug='entertainment'),
  '3Doodler Essential Starter Pen Set', '판매처: Smyths Toys | 가격: £39.99 | 평점: 4.1 | 리뷰: 718개', 'https://encrypted-tbn2.gstatic.com/shopping?q=tbn:ANd9GcTrPaW-Wc0Y_lEuak3ykSeBeztpgItA3ccCr3o0C4dZMmEUNkTkJMOb0KeO73azWBIy1eReRYru3c9Voq0PA89Us80TIvfWPA',
  100, 'rising',
  95, 85, 100, 75,
  ARRAY['Smyths Toys','£39.99','★4.1'], ARRAY['https://www.google.com/search?ibp=oshop&q=trending toys games gadgets UK 2026&prds=catalogid:6229226010338488505,headlineOfferDocid:11432789133124815621,imageDocid:7536384135979682706,rds:PC_9049542113983340944|PROD_PC_9049542113983340944,gpcid:9049542113983340944,mid:576462794940866403,pvt:hg&hl=en&gl=uk&udm=28'],
  '2026-03-17T05:52:08.866748+00:00', '2026-03-17T05:52:08.866748+00:00'
);
INSERT INTO trends (country_id, category_id, name, description, image_url, heat_score, heat_status, search_score, social_score, ecommerce_score, news_score, tags, source_urls, first_detected_at, last_updated_at) VALUES (
  (SELECT id FROM countries WHERE code='GB'),
  (SELECT id FROM categories WHERE slug='entertainment'),
  'ThinkFun Gravity Maze Game', '판매처: John Lewis & Partners | 가격: £24.99 | 평점: 4.7 | 리뷰: 249개', 'https://encrypted-tbn1.gstatic.com/shopping?q=tbn:ANd9GcS4MxJC4Rb2FRonajf5SaPejHp7sst_3NeWVV6OwerPnSfVsAX_GGNjlHHgle7acOC_anYVM0WYgv2bbnWY1l73obOC8Evp84RU8Q-tGhLOtvF7FxwpVoyK',
  100, 'rising',
  95, 85, 100, 75,
  ARRAY['John Lewis & Partners','£24.99','★4.7'], ARRAY['https://www.google.com/search?ibp=oshop&q=trending toys games gadgets UK 2026&prds=catalogid:16077031924194355471,headlineOfferDocid:9785426832786776416,imageDocid:11519429508103583833,rds:PC_6968585258796843887|PROD_PC_6968585258796843887,gpcid:6968585258796843887,mid:576462543154245139,pvt:hg&hl=en&gl=uk&udm=28'],
  '2026-03-17T05:52:08.866748+00:00', '2026-03-17T05:52:08.866748+00:00'
);
INSERT INTO trends (country_id, category_id, name, description, image_url, heat_score, heat_status, search_score, social_score, ecommerce_score, news_score, tags, source_urls, first_detected_at, last_updated_at) VALUES (
  (SELECT id FROM countries WHERE code='GB'),
  (SELECT id FROM categories WHERE slug='entertainment'),
  'Onbuy Multicolor Fidget Pen', '판매처: Amazon.co.uk - Amazon.co.uk-Seller | 가격: £9.99', 'https://encrypted-tbn0.gstatic.com/shopping?q=tbn:ANd9GcQA_VZJ8FoVS9xWUf0JKSt4LWQ_qnukjq8G8Svth67Vy6O8QBIS2RrT7MJpJAsrTwUcxbkuP4REDuzNE58_QBoUrqL55THPk220aWAQLBH-',
  92, 'rising',
  87, 77, 92, 67,
  ARRAY['Amazon.co.uk - Amazon.co.uk-Seller','£9.99'], ARRAY['https://www.google.com/search?ibp=oshop&q=trending toys games gadgets UK 2026&prds=catalogid:3300394050693758745,headlineOfferDocid:15632713495172990116,imageDocid:17825926778559587956,gpcid:18444835377293852903,mid:576462850735566435,pvt:hg&hl=en&gl=uk&udm=28'],
  '2026-03-17T05:52:08.866748+00:00', '2026-03-17T05:52:08.866748+00:00'
);
INSERT INTO trends (country_id, category_id, name, description, image_url, heat_score, heat_status, search_score, social_score, ecommerce_score, news_score, tags, source_urls, first_detected_at, last_updated_at) VALUES (
  (SELECT id FROM countries WHERE code='GB'),
  (SELECT id FROM categories WHERE slug='entertainment'),
  'Strikesphere Soccer Dash', '판매처: Menkind | 가격: £49.00 | 평점: 5.0 | 리뷰: 1개', 'https://encrypted-tbn3.gstatic.com/shopping?q=tbn:ANd9GcQwG_di9Z1rGFMe-ZIypKMlJcRbn8PULEMWH-h9AgLth-7bt4_82up6OILFMVsVncl_cP5g8bB2Tz0IXIQXt0F6ORTiCQNXoTZ8xPJYK1uN',
  100, 'rising',
  95, 85, 100, 75,
  ARRAY['Menkind','£49.00','★5.0'], ARRAY['https://www.google.com/search?ibp=oshop&q=trending toys games gadgets UK 2026&prds=catalogid:10141129542344783695,headlineOfferDocid:4462380560172618224,imageDocid:13911153497105520027,rds:PC_471294601410036928|PROD_PC_471294601410036928,gpcid:471294601410036928,mid:576462842216753200,pvt:hg&hl=en&gl=uk&udm=28'],
  '2026-03-17T05:52:08.866748+00:00', '2026-03-17T05:52:08.866748+00:00'
);
INSERT INTO trends (country_id, category_id, name, description, image_url, heat_score, heat_status, search_score, social_score, ecommerce_score, news_score, tags, source_urls, first_detected_at, last_updated_at) VALUES (
  (SELECT id FROM countries WHERE code='GB'),
  (SELECT id FROM categories WHERE slug='entertainment'),
  'Bitzee Hamster Ball Interactive Pet', '판매처: Amazon.co.uk | 가격: £21.49 | 평점: 4.6 | 리뷰: 239개', 'https://encrypted-tbn2.gstatic.com/shopping?q=tbn:ANd9GcQvxbgQnnDO_uXdTYLnCvVy2BV7CkoW7fCtTzTdd2Tllyh-QtNpftKWWeIn10_GRGhL0tIIJDhPEkY9dlVmkpQfduPIHw6IDGvSDCK7T_ffqfCS30oDGaDTRA',
  100, 'steady',
  95, 85, 100, 75,
  ARRAY['Amazon.co.uk','£21.49','★4.6'], ARRAY['https://www.google.com/search?ibp=oshop&q=trending toys games gadgets UK 2026&prds=catalogid:7166126547488314076,headlineOfferDocid:10604728398579463242,imageDocid:11629909867081071134,rds:PC_15467748406390889958|PROD_PC_15467748406390889958,gpcid:15467748406390889958,mid:576462820875327263,pvt:hg&hl=en&gl=uk&udm=28'],
  '2026-03-17T05:52:08.866748+00:00', '2026-03-17T05:52:08.866748+00:00'
);
INSERT INTO trends (country_id, category_id, name, description, image_url, heat_score, heat_status, search_score, social_score, ecommerce_score, news_score, tags, source_urls, first_detected_at, last_updated_at) VALUES (
  (SELECT id FROM countries WHERE code='GB'),
  (SELECT id FROM categories WHERE slug='entertainment'),
  'LeapFrog LeapMove Motion-Based Educational Game', '판매처: John Lewis & Partners | 가격: £44.99 | 평점: 4.2 | 리뷰: 235개', 'https://encrypted-tbn1.gstatic.com/shopping?q=tbn:ANd9GcTEvgYzto5sXIuAlR82-z5HEdM3UGMZxIZNPnbKzZsYmIlYGLej47K5MyhOti2GdZQVOG98mKYZyCbOFOtCPItnYASiRTdVJHFmXCsHLw69Z_5x8fUtQ_vNwrQ',
  100, 'steady',
  95, 85, 100, 75,
  ARRAY['John Lewis & Partners','£44.99','★4.2'], ARRAY['https://www.google.com/search?ibp=oshop&q=trending toys games gadgets UK 2026&prds=catalogid:8486517459431178928,headlineOfferDocid:2025211398848245433,imageDocid:17543358764869827465,rds:PC_8169946455116413839|PROD_PC_8169946455116413839,gpcid:8169946455116413839,mid:576462836348342394,pvt:hg&hl=en&gl=uk&udm=28'],
  '2026-03-17T05:52:08.866748+00:00', '2026-03-17T05:52:08.866748+00:00'
);
INSERT INTO trends (country_id, category_id, name, description, image_url, heat_score, heat_status, search_score, social_score, ecommerce_score, news_score, tags, source_urls, first_detected_at, last_updated_at) VALUES (
  (SELECT id FROM countries WHERE code='GB'),
  (SELECT id FROM categories WHERE slug='entertainment'),
  'Hasbro Bop It!', '판매처: BargainMax.co.uk | 가격: £12.99 | 평점: 4.6 | 리뷰: 3,400개', 'https://encrypted-tbn3.gstatic.com/shopping?q=tbn:ANd9GcSuCn5_oZ_mJ2s52lwgzXArDfXUknVm1ttnyQeFDH0W4q0LpB0C2LqtbzWWUMobEjoFCCiN-v7eEOLWQhbGVR1HwbSLe-aR2xkYgTQLo38OCLlFOc-M6h9hrw',
  100, 'steady',
  95, 85, 100, 75,
  ARRAY['BargainMax.co.uk','£12.99','★4.6'], ARRAY['https://www.google.com/search?ibp=oshop&q=trending toys games gadgets UK 2026&prds=catalogid:16040416960669276660,headlineOfferDocid:8778076766665305374,imageDocid:13559561225488484247,rds:PC_10527156514017777504|PROD_PC_10527156514017777504,gpcid:10527156514017777504,mid:576462846802756152,pvt:hg&hl=en&gl=uk&udm=28'],
  '2026-03-17T05:52:08.866748+00:00', '2026-03-17T05:52:08.866748+00:00'
);
INSERT INTO trends (country_id, category_id, name, description, image_url, heat_score, heat_status, search_score, social_score, ecommerce_score, news_score, tags, source_urls, first_detected_at, last_updated_at) VALUES (
  (SELECT id FROM countries WHERE code='GB'),
  (SELECT id FROM categories WHERE slug='entertainment'),
  'Keyboard Fidget, Keyboard Fidget Toy, 4 Button Fidget Keyboard Keychain Without Lights, Stress Relief Keyboard Clicker Fidget Decompression Gift for', '판매처: Amazon.co.uk - Amazon.co.uk-Seller | 가격: £2.99', 'https://encrypted-tbn0.gstatic.com/shopping?q=tbn:ANd9GcTBwJxs6aHZT8DT7-FfIg258DdOMvKztxx3NMFEUr1crqtEtsK3KABq1Iu_bRwahl8-a0prN9jdgz0nz6-LhasdGYjNCTqd8ztvL2ka7wKbOH1muC4qfTqkrhc',
  80, 'steady',
  75, 65, 80, 55,
  ARRAY['Amazon.co.uk - Amazon.co.uk-Seller','£2.99'], ARRAY['https://www.google.com/search?ibp=oshop&q=trending toys games gadgets UK 2026&prds=productid:5587252552121660936,headlineOfferDocid:5587252552121660936,imageDocid:1898747850062413596,pvt:hg&hl=en&gl=uk&udm=28'],
  '2026-03-17T05:52:08.866748+00:00', '2026-03-17T05:52:08.866748+00:00'
);
INSERT INTO trends (country_id, category_id, name, description, image_url, heat_score, heat_status, search_score, social_score, ecommerce_score, news_score, tags, source_urls, first_detected_at, last_updated_at) VALUES (
  (SELECT id FROM countries WHERE code='GB'),
  (SELECT id FROM categories WHERE slug='entertainment'),
  'Magnetic Tiles Ball Run Set', '판매처: Smyths Toys | 가격: £34.99 | 평점: 4.3 | 리뷰: 92개', 'https://encrypted-tbn0.gstatic.com/shopping?q=tbn:ANd9GcRt_7UEXSjGEE2oSFnsqoe9HhqVve2R-oquoqjjsAzN5r3k1M8fdzHdW02rwV28oVZgklU2c8QfRrr-g7GpYCaYP12A7vo9Eg',
  100, 'steady',
  95, 85, 100, 75,
  ARRAY['Smyths Toys','£34.99','★4.3'], ARRAY['https://www.google.com/search?ibp=oshop&q=trending toys games gadgets UK 2026&prds=catalogid:3195023757739145451,headlineOfferDocid:17287232128737547640,imageDocid:5553931726173687292,rds:PC_15243163816952780827|PROD_PC_15243163816952780827,gpcid:15243163816952780827,mid:576462775328437721,pvt:hg&hl=en&gl=uk&udm=28'],
  '2026-03-17T05:52:08.866748+00:00', '2026-03-17T05:52:08.866748+00:00'
);
INSERT INTO trends (country_id, category_id, name, description, image_url, heat_score, heat_status, search_score, social_score, ecommerce_score, news_score, tags, source_urls, first_detected_at, last_updated_at) VALUES (
  (SELECT id FROM countries WHERE code='GB'),
  (SELECT id FROM categories WHERE slug='entertainment'),
  'Glow Ball', '판매처: Argos | 가격: £30.00 | 평점: 4.3 | 리뷰: 23개', 'https://encrypted-tbn0.gstatic.com/shopping?q=tbn:ANd9GcRdyVVfp_LW4KpyTr2XYT7nngBbhXklLE6sZUTNfRej156_cxbiUCNkcJp9rX0KKW8uRMXMXeNv4t_Jp65hdvYfLZUUQYWQ4YjXRpH_q193MkxynNgma_LF',
  94, 'steady',
  89, 79, 94, 69,
  ARRAY['Argos','£30.00','★4.3'], ARRAY['https://www.google.com/search?ibp=oshop&q=trending toys games gadgets UK 2026&prds=catalogid:13119054109066589768,headlineOfferDocid:17320990897105566744,imageDocid:14568610515418706860,rds:PC_18361041911316361136|PROD_PC_18361041911316361136,gpcid:18361041911316361136,mid:576462859004171294,pvt:hg&hl=en&gl=uk&udm=28'],
  '2026-03-17T05:52:08.866748+00:00', '2026-03-17T05:52:08.866748+00:00'
);
INSERT INTO trends (country_id, category_id, name, description, image_url, heat_score, heat_status, search_score, social_score, ecommerce_score, news_score, tags, source_urls, first_detected_at, last_updated_at) VALUES (
  (SELECT id FROM countries WHERE code='GB'),
  (SELECT id FROM categories WHERE slug='entertainment'),
  'Bluey Hide & Seek Game', '판매처: John Lewis & Partners | 가격: £16.99 | 평점: 4.7 | 리뷰: 410개', 'https://encrypted-tbn2.gstatic.com/shopping?q=tbn:ANd9GcSQqNMpUKGsOWhOPc3BSAQf9grjihWTfZZlhSxIKyBrbtRrD5GV9pzztMecru8TUjazRZgsl02dfTstASOei6OPOt2bPqYeEfx5vFDzFdEcxsKWzy49c2Pmbw',
  100, 'steady',
  95, 85, 100, 75,
  ARRAY['John Lewis & Partners','£16.99','★4.7'], ARRAY['https://www.google.com/search?ibp=oshop&q=trending toys games gadgets UK 2026&prds=catalogid:147440787667343583,headlineOfferDocid:10390742040939758912,imageDocid:3188827612261523638,rds:PC_4128987955109117774|PROD_PC_4128987955109117774,gpcid:4128987955109117774,mid:576462787413741031,pvt:hg&hl=en&gl=uk&udm=28'],
  '2026-03-17T05:52:08.866748+00:00', '2026-03-17T05:52:08.866748+00:00'
);
INSERT INTO trends (country_id, category_id, name, description, image_url, heat_score, heat_status, search_score, social_score, ecommerce_score, news_score, tags, source_urls, first_detected_at, last_updated_at) VALUES (
  (SELECT id FROM countries WHERE code='GB'),
  (SELECT id FROM categories WHERE slug='entertainment'),
  'Wooden Useless Boring Box, Broad Game Tricky Toys Useless Box, Creative Adult Funny Toys Kids Gift Fun Birthday Party Toys for Children, Leave Me', '판매처: Amazon.co.uk - Amazon.co.uk-Seller | 가격: £16.88', 'https://encrypted-tbn0.gstatic.com/shopping?q=tbn:ANd9GcTRSsEKvCpI0ClVdveFcV8u46Vo7B8Z6VIkhTc_XDB74jHRAXYgH8yVCmE7TiKuga1EjQIIBnuqsWT8O9QogZ4WOm8RaB3g_vjQhCPNt3i46BtBTEpTDN2z',
  70, 'steady',
  65, 55, 70, 45,
  ARRAY['Amazon.co.uk - Amazon.co.uk-Seller','£16.88'], ARRAY['https://www.google.com/search?ibp=oshop&q=trending toys games gadgets UK 2026&prds=productid:17405738276156475416,headlineOfferDocid:17405738276156475416,imageDocid:5722562391615462500,pvt:hg&hl=en&gl=uk&udm=28'],
  '2026-03-17T05:52:08.866748+00:00', '2026-03-17T05:52:08.866748+00:00'
);
INSERT INTO trends (country_id, category_id, name, description, image_url, heat_score, heat_status, search_score, social_score, ecommerce_score, news_score, tags, source_urls, first_detected_at, last_updated_at) VALUES (
  (SELECT id FROM countries WHERE code='GB'),
  (SELECT id FROM categories WHERE slug='entertainment'),
  'Ambassador Games Tabletop Air Hockey', '판매처: Smyths Toys | 가격: £10.00 | 평점: 3.9 | 리뷰: 51개', 'https://encrypted-tbn1.gstatic.com/shopping?q=tbn:ANd9GcSvlWoTsxtrExXLXVcDqbhuARmBlBSVFxVRomvbqa2vei4aPYkPzv2W71iC2Wo2c24aD9cSd8jY8Qmvkc6uNEX7twkuBsYr',
  85, 'steady',
  80, 70, 85, 60,
  ARRAY['Smyths Toys','£10.00','★3.9'], ARRAY['https://www.google.com/search?ibp=oshop&q=trending toys games gadgets UK 2026&prds=catalogid:8662630825421709822,headlineOfferDocid:8375583384207415877,imageDocid:9679493353569917137,rds:PC_17119752344297061419|PROD_PC_17119752344297061419,gpcid:17119752344297061419,mid:576462441483758544,pvt:hg&hl=en&gl=uk&udm=28'],
  '2026-03-17T05:52:08.866748+00:00', '2026-03-17T05:52:08.866748+00:00'
);
INSERT INTO trends (country_id, category_id, name, description, image_url, heat_score, heat_status, search_score, social_score, ecommerce_score, news_score, tags, source_urls, first_detected_at, last_updated_at) VALUES (
  (SELECT id FROM countries WHERE code='GB'),
  (SELECT id FROM categories WHERE slug='entertainment'),
  'Pushi Popz Bear Gamer LED Light Up Fidget Game', '판매처: The Entertainer | 가격: £3.00', 'https://encrypted-tbn3.gstatic.com/shopping?q=tbn:ANd9GcQzxIoNZzHUes9uV98wXJYe42joFqRoXxydEr6WII2NGJhAFshSd-jbg5h_cb3VD--464B94T4SytfTxnGunFnhUAGmFO_Pvg',
  65, 'steady',
  60, 50, 65, 40,
  ARRAY['The Entertainer','£3.00'], ARRAY['https://www.google.com/search?ibp=oshop&q=trending toys games gadgets UK 2026&prds=catalogid:2825097466828247437,headlineOfferDocid:17213614065033992697,imageDocid:13582303871421939703,gpcid:2743433584646977440,mid:576462784602435142,pvt:hg&hl=en&gl=uk&udm=28'],
  '2026-03-17T05:52:08.866748+00:00', '2026-03-17T05:52:08.866748+00:00'
);
INSERT INTO trends (country_id, category_id, name, description, image_url, heat_score, heat_status, search_score, social_score, ecommerce_score, news_score, tags, source_urls, first_detected_at, last_updated_at) VALUES (
  (SELECT id FROM countries WHERE code='FR'),
  (SELECT id FROM categories WHERE slug='fashion'),
  'Generisch 2026 Veste tendance pour homme, décontractée, coupe ajustée, coton, letterman, baseball, bomber, veste universitaire classique', '판매처: Amazon.fr - Seller | 가격: 20,12 €', 'https://encrypted-tbn3.gstatic.com/shopping?q=tbn:ANd9GcSdNLVAVcpI1Z90WdBpLynjOxZGmmWaj6GIDqXxmcKcFuqjjZ-D_sBqXU2ZZIMhWg_IoulT-TpoOqp-QbXeyB6jsqdN5acBvLB3e-BDt-xvRjLzTc1Of3fGcw',
  100, 'rising',
  95, 85, 100, 75,
  ARRAY['Amazon.fr - Seller','20,12 €'], ARRAY['https://www.google.com/search?ibp=oshop&q=tendance mode vêtements 2026&prds=productid:2175356061389898564,headlineOfferDocid:2175356061389898564,imageDocid:168073889420075367,pvt:a&hl=fr&gl=fr&udm=28'],
  '2026-03-17T05:52:08.866748+00:00', '2026-03-17T05:52:08.866748+00:00'
);
INSERT INTO trends (country_id, category_id, name, description, image_url, heat_score, heat_status, search_score, social_score, ecommerce_score, news_score, tags, source_urls, first_detected_at, last_updated_at) VALUES (
  (SELECT id FROM countries WHERE code='FR'),
  (SELECT id FROM categories WHERE slug='fashion'),
  'Robe caftan court modèle moderne et tendance 2025/2026', '판매처: mode-et-caftan.shop | 가격: 329,00 €', 'https://encrypted-tbn0.gstatic.com/shopping?q=tbn:ANd9GcTq1nblZxaJae_hw-5Lcziqa6J1hYoH3g5PhtDq3Q3lcilQMpvpezlxQE-z9hxFr9IVm8954qHt-g6hYJ4cLC44v6Zg0AF8FUcXK52yQyF9Sg_01NPV2qlJ',
  97, 'rising',
  92, 82, 97, 72,
  ARRAY['mode-et-caftan.shop','329,00 €'], ARRAY['https://www.google.com/search?ibp=oshop&q=tendance mode vêtements 2026&prds=catalogid:11833961920854839530,headlineOfferDocid:15553322362070768443,imageDocid:392253575866938784,gpcid:16535621232297753087,mid:576462869876832394,pvt:a&hl=fr&gl=fr&udm=28'],
  '2026-03-17T05:52:08.866748+00:00', '2026-03-17T05:52:08.866748+00:00'
);
INSERT INTO trends (country_id, category_id, name, description, image_url, heat_score, heat_status, search_score, social_score, ecommerce_score, news_score, tags, source_urls, first_detected_at, last_updated_at) VALUES (
  (SELECT id FROM countries WHERE code='FR'),
  (SELECT id FROM categories WHERE slug='fashion'),
  'Maje Robe courte En tweed manches ballon Femme Coton', '판매처: Galeries Lafayette | 가격: 345,00 € | 평점: 5.0 | 리뷰: 1개', 'https://encrypted-tbn0.gstatic.com/shopping?q=tbn:ANd9GcT18I5CTSg1oEN-fIgcM0PT0Pnmx9EoMAFhCuUkHl2eo8S0HZZ0GkJsSiKK4KkcQp6soa99ses_p_vXCJnCyjuADmWRIm0fOtgOS135RQJ2iS2oE9chUXKu6ps',
  100, 'rising',
  95, 85, 100, 75,
  ARRAY['Galeries Lafayette','345,00 €','★5.0'], ARRAY['https://www.google.com/search?ibp=oshop&q=tendance mode vêtements 2026&prds=catalogid:14124547379339680007,headlineOfferDocid:13795917812143673026,imageDocid:10720438755983508584,rds:PC_1114001453579000403|PROD_PC_1114001453579000403,gpcid:1114001453579000403,mid:576462531116362134,pvt:a&hl=fr&gl=fr&udm=28'],
  '2026-03-17T05:52:08.866748+00:00', '2026-03-17T05:52:08.866748+00:00'
);
INSERT INTO trends (country_id, category_id, name, description, image_url, heat_score, heat_status, search_score, social_score, ecommerce_score, news_score, tags, source_urls, first_detected_at, last_updated_at) VALUES (
  (SELECT id FROM countries WHERE code='FR'),
  (SELECT id FROM categories WHERE slug='fashion'),
  'femme Breal Robe ajustée courte', '판매처: Bréal | 가격: 49,99 € | 평점: 4.7 | 리뷰: 34개', 'https://encrypted-tbn2.gstatic.com/shopping?q=tbn:ANd9GcTzOsgbL9Mqhq-G7qNtamf3StnPM-3k2lWLW-qOySHoOM5-hKRlE5hGT5XXk6_8A8m3ZoSyRoRhmjGRKWLsKzxXAFalTJIr8VG3iP3h50vvi--Vbcyna3mq',
  100, 'rising',
  95, 85, 100, 75,
  ARRAY['Bréal','49,99 €','★4.7'], ARRAY['https://www.google.com/search?ibp=oshop&q=tendance mode vêtements 2026&prds=catalogid:17788563460058590821,headlineOfferDocid:2361486327229260658,imageDocid:13432945205649828486,rds:PC_17597827843643444001|PROD_PC_17597827843643444001,gpcid:17597827843643444001,mid:576462827516541979,pvt:a&hl=fr&gl=fr&udm=28'],
  '2026-03-17T05:52:08.866748+00:00', '2026-03-17T05:52:08.866748+00:00'
);
INSERT INTO trends (country_id, category_id, name, description, image_url, heat_score, heat_status, search_score, social_score, ecommerce_score, news_score, tags, source_urls, first_detected_at, last_updated_at) VALUES (
  (SELECT id FROM countries WHERE code='FR'),
  (SELECT id FROM categories WHERE slug='fashion'),
  'The Kooples Veste Sans Col Homme Noir', '판매처: Printemps.com | 가격: 495,00 €', 'https://encrypted-tbn1.gstatic.com/shopping?q=tbn:ANd9GcSpi9ew_QWHcphbJbryoPhZF2hF857jjXfhl_jc_I2-V_19JCCMCtfJupr3PfkYeK7k3E5-Ig07One4Sl7V_41n93iyb8VGq0B4csYxjOFz2Sp_hKJOgtKqpQ',
  90, 'rising',
  85, 75, 90, 65,
  ARRAY['Printemps.com','495,00 €'], ARRAY['https://www.google.com/search?ibp=oshop&q=tendance mode vêtements 2026&prds=catalogid:2263352411946559568,headlineOfferDocid:17244733303729964031,imageDocid:11678458938783209901,gpcid:1653128135617346285,mid:576462873297307821,pvt:a&hl=fr&gl=fr&udm=28'],
  '2026-03-17T05:52:08.866748+00:00', '2026-03-17T05:52:08.866748+00:00'
);
INSERT INTO trends (country_id, category_id, name, description, image_url, heat_score, heat_status, search_score, social_score, ecommerce_score, news_score, tags, source_urls, first_detected_at, last_updated_at) VALUES (
  (SELECT id FROM countries WHERE code='FR'),
  (SELECT id FROM categories WHERE slug='fashion'),
  'OYICAI Jean Femme Large Baggy Denim Tendance 2026 Pantalon Vintage Hip Hop Loose Fit Streetwear', '판매처: Amazon.fr - Seller | 가격: 38,99 €', 'https://encrypted-tbn0.gstatic.com/shopping?q=tbn:ANd9GcQDwXzjUB637V8CM04QtLG4bHosenK4tFws-jFFjZe5C-dR8T3V3qgvAEB8KCd4AMALrlU3amQkhAbumpEx86JKdFG2o0UHIzNbYSyGWWeQh4ahAWUYHs8j',
  87, 'steady',
  82, 72, 87, 62,
  ARRAY['Amazon.fr - Seller','38,99 €'], ARRAY['https://www.google.com/search?ibp=oshop&q=tendance mode vêtements 2026&prds=productid:14272864118573623105,headlineOfferDocid:14272864118573623105,imageDocid:17587077007037657852,pvt:a&hl=fr&gl=fr&udm=28'],
  '2026-03-17T05:52:08.866748+00:00', '2026-03-17T05:52:08.866748+00:00'
);
INSERT INTO trends (country_id, category_id, name, description, image_url, heat_score, heat_status, search_score, social_score, ecommerce_score, news_score, tags, source_urls, first_detected_at, last_updated_at) VALUES (
  (SELECT id FROM countries WHERE code='FR'),
  (SELECT id FROM categories WHERE slug='fashion'),
  'femme Cache Cache Pantalon barrel', '판매처: Cache Cache | 가격: 35,99 € | 평점: 4.8 | 리뷰: 31개', 'https://encrypted-tbn2.gstatic.com/shopping?q=tbn:ANd9GcQsLcSpHm1_lG2p7QZdOUzvEP7epR3MP8CkanJpiA9ztQTLcAg7UK5OZL8RMePg3PJqAGAamunkh11Z4nNFnp_ZCFHKuPV22YqFGu7IAR0fXm1BRbUVnZoq',
  100, 'steady',
  95, 85, 100, 75,
  ARRAY['Cache Cache','35,99 €','★4.8'], ARRAY['https://www.google.com/search?ibp=oshop&q=tendance mode vêtements 2026&prds=catalogid:13422125401261748196,headlineOfferDocid:14919892260158213279,imageDocid:12276953644321261170,rds:PC_13999599762599118118|PROD_PC_13999599762599118118,gpcid:13999599762599118118,mid:576462531718019787,pvt:a&hl=fr&gl=fr&udm=28'],
  '2026-03-17T05:52:08.866748+00:00', '2026-03-17T05:52:08.866748+00:00'
);
INSERT INTO trends (country_id, category_id, name, description, image_url, heat_score, heat_status, search_score, social_score, ecommerce_score, news_score, tags, source_urls, first_detected_at, last_updated_at) VALUES (
  (SELECT id FROM countries WHERE code='FR'),
  (SELECT id FROM categories WHERE slug='fashion'),
  'femme Breal Robe fluide col v manches longues', '판매처: La Redoute | 가격: 34,99 € | 평점: 4.6 | 리뷰: 21개', 'https://encrypted-tbn0.gstatic.com/shopping?q=tbn:ANd9GcQ9ANnr_t3mKHXBAiXLlOt5NI17OTz2YEJOfD2KTXLED6Y5U1SYZpIL9NmDTJsF6uDa_M8ORpu6uC1j7BAA8CtHNaFVT3ZIuNhweA9fYXYEZz8BeMfk7JH69Q',
  100, 'steady',
  95, 85, 100, 75,
  ARRAY['La Redoute','34,99 €','★4.6'], ARRAY['https://www.google.com/search?ibp=oshop&q=tendance mode vêtements 2026&prds=catalogid:5884918498928556518,headlineOfferDocid:6150992951540056201,imageDocid:18319527442748456088,rds:PC_1306626443783699642|PROD_PC_1306626443783699642,gpcid:1306626443783699642,mid:576462537159758337,pvt:a&hl=fr&gl=fr&udm=28'],
  '2026-03-17T05:52:08.866748+00:00', '2026-03-17T05:52:08.866748+00:00'
);
INSERT INTO trends (country_id, category_id, name, description, image_url, heat_score, heat_status, search_score, social_score, ecommerce_score, news_score, tags, source_urls, first_detected_at, last_updated_at) VALUES (
  (SELECT id FROM countries WHERE code='FR'),
  (SELECT id FROM categories WHERE slug='fashion'),
  'BZB Veste sans manches Femme', '판매처: BZB | 가격: 45,99 €', 'https://encrypted-tbn1.gstatic.com/shopping?q=tbn:ANd9GcQjPVDhECUI1M1dY3R59bMwf53jEYbQmjajP65GcF41fagsIGq2l6yTcWJ71aJaqHUFDPsO39KQzll3ipBuDwDI1jPHNE4S7-Cmr01aQM0OCmq68kGvVdpO0Q',
  80, 'steady',
  75, 65, 80, 55,
  ARRAY['BZB','45,99 €'], ARRAY['https://www.google.com/search?ibp=oshop&q=tendance mode vêtements 2026&prds=catalogid:18139304105956691601,headlineOfferDocid:13111424639444154824,imageDocid:16044777480569028189,gpcid:7656687563543358063,mid:576462863715485485,pvt:a&hl=fr&gl=fr&udm=28'],
  '2026-03-17T05:52:08.866748+00:00', '2026-03-17T05:52:08.866748+00:00'
);
INSERT INTO trends (country_id, category_id, name, description, image_url, heat_score, heat_status, search_score, social_score, ecommerce_score, news_score, tags, source_urls, first_detected_at, last_updated_at) VALUES (
  (SELECT id FROM countries WHERE code='FR'),
  (SELECT id FROM categories WHERE slug='fashion'),
  'Ysé Veste Les soirs de flamme', '판매처: Ysé | 가격: 95,00 €', 'https://encrypted-tbn1.gstatic.com/shopping?q=tbn:ANd9GcTMt4C-RXKYEyd8Zj1XsT-z9GLhwq2AEqWYPqP9nxe7Oz_dqCCHdoz0ClXjsCia3DA0SaU6s0MsvwU6Z68QQRWLnO8kyzs_SXTJ5lWP__zkPy7jfDLAqhr0',
  77, 'steady',
  72, 62, 77, 52,
  ARRAY['Ysé','95,00 €'], ARRAY['https://www.google.com/search?ibp=oshop&q=tendance mode vêtements 2026&prds=catalogid:17723683252117526744,headlineOfferDocid:17950008476654423137,imageDocid:16585533816770723309,gpcid:6561589633406918015,mid:576462537015620304,pvt:a&hl=fr&gl=fr&udm=28'],
  '2026-03-17T05:52:08.866748+00:00', '2026-03-17T05:52:08.866748+00:00'
);
INSERT INTO trends (country_id, category_id, name, description, image_url, heat_score, heat_status, search_score, social_score, ecommerce_score, news_score, tags, source_urls, first_detected_at, last_updated_at) VALUES (
  (SELECT id FROM countries WHERE code='FR'),
  (SELECT id FROM categories WHERE slug='fashion'),
  'Haut Femme Manches 3/4 Chic et Tendance 2026 - Blouse Professionnelle à Col en V avec Détails Boutonnés - Tunique Fluide et Respirante pour Le Travail', '판매처: Amazon.fr - Seller | 가격: 16,59 €', 'https://encrypted-tbn1.gstatic.com/shopping?q=tbn:ANd9GcQ8LN6wTakU0wU_nT3_q6LADJ7iCEJ7RuoD97ArAwSXV53thhI2jPzm0R6Y0bVYZhdLZRxYRAYm97qvfRtOSnVGtsVEkgQfMV_bI3tkTAe4VNdCESzHl1kv',
  75, 'steady',
  70, 60, 75, 50,
  ARRAY['Amazon.fr - Seller','16,59 €'], ARRAY['https://www.google.com/search?ibp=oshop&q=tendance mode vêtements 2026&prds=productid:13732897377013288101,headlineOfferDocid:13732897377013288101,imageDocid:2364985492260386945,pvt:a&hl=fr&gl=fr&udm=28'],
  '2026-03-17T05:52:08.866748+00:00', '2026-03-17T05:52:08.866748+00:00'
);
INSERT INTO trends (country_id, category_id, name, description, image_url, heat_score, heat_status, search_score, social_score, ecommerce_score, news_score, tags, source_urls, first_detected_at, last_updated_at) VALUES (
  (SELECT id FROM countries WHERE code='FR'),
  (SELECT id FROM categories WHERE slug='fashion'),
  'Breal Pantalon bootcut à pont Femme Taille', '판매처: Bréal | 가격: 49,99 € | 평점: 4.7 | 리뷰: 723개', 'https://encrypted-tbn1.gstatic.com/shopping?q=tbn:ANd9GcRU3gSJUyMiS303RL147BVYaWFFeNTsdrPwHTsP2u1BWyeDfzWB-X9gzjZ_dqQqj6ii-Nqlb0lDcW_yoKr2v_l5_eklZLdGaVjiDXAkzKZXJfbYABkd-ZdhCg',
  100, 'steady',
  95, 85, 100, 75,
  ARRAY['Bréal','49,99 €','★4.7'], ARRAY['https://www.google.com/search?ibp=oshop&q=tendance mode vêtements 2026&prds=catalogid:8308169890716750055,headlineOfferDocid:10904104528962338322,imageDocid:2340024201295980265,rds:PC_15948475975452190167|PROD_PC_15948475975452190167,gpcid:15948475975452190167,mid:576462492996020606,pvt:a&hl=fr&gl=fr&udm=28'],
  '2026-03-17T05:52:08.866748+00:00', '2026-03-17T05:52:08.866748+00:00'
);
INSERT INTO trends (country_id, category_id, name, description, image_url, heat_score, heat_status, search_score, social_score, ecommerce_score, news_score, tags, source_urls, first_detected_at, last_updated_at) VALUES (
  (SELECT id FROM countries WHERE code='FR'),
  (SELECT id FROM categories WHERE slug='fashion'),
  'Mode Bleu Ciel Appliques Papillon Perle Paillettes Faux Diamant Robe De Bal 2026 Bustier', '판매처: Veaul.com | 가격: 177,65 €', 'https://encrypted-tbn2.gstatic.com/shopping?q=tbn:ANd9GcSn4Y85NaLP2DqZOCnJ1sctaS4liXh7QS8aatKC0HQJCkkBHBLsXMhy0sT6qk25soR2OATJevEEpCe9LiP0LBOFcvSHqD9nFydIOGzXJvoEaEft0AZ1zPJ8Gw',
  70, 'steady',
  65, 55, 70, 45,
  ARRAY['Veaul.com','177,65 €'], ARRAY['https://www.google.com/search?ibp=oshop&q=tendance mode vêtements 2026&prds=catalogid:11487399662359565012,headlineOfferDocid:13453160634210388399,imageDocid:11732452782718022518,gpcid:13239155736377160769,pvt:a&hl=fr&gl=fr&udm=28'],
  '2026-03-17T05:52:08.866748+00:00', '2026-03-17T05:52:08.866748+00:00'
);
INSERT INTO trends (country_id, category_id, name, description, image_url, heat_score, heat_status, search_score, social_score, ecommerce_score, news_score, tags, source_urls, first_detected_at, last_updated_at) VALUES (
  (SELECT id FROM countries WHERE code='FR'),
  (SELECT id FROM categories WHERE slug='fashion'),
  'Trendy Queen Womens Long Sleeve Crop Tops Basic Slim Fitted Shirts Spring Fashion Outfits 2026 Teen Girl Clothes', '판매처: Ubuy | 가격: 16,00 €', 'https://encrypted-tbn2.gstatic.com/shopping?q=tbn:ANd9GcT_efEABNu3GNSoWj2Vl_Abv2q6usuVF0XGrMtqzFsXcwkkGrQ2x-dqd0IVS1Vqn7RSXEtJLmfrv7gUReva1q77eLjfuGjTH-bS6mNcEqiP',
  67, 'steady',
  62, 52, 67, 42,
  ARRAY['Ubuy','16,00 €'], ARRAY['https://www.google.com/search?ibp=oshop&q=tendance mode vêtements 2026&prds=catalogid:4447193479893505052,headlineOfferDocid:2848330466840995862,imageDocid:16492042371073165854,gpcid:12308750643195675840,mid:576462883335572588,pvt:a&hl=fr&gl=fr&udm=28'],
  '2026-03-17T05:52:08.866748+00:00', '2026-03-17T05:52:08.866748+00:00'
);
INSERT INTO trends (country_id, category_id, name, description, image_url, heat_score, heat_status, search_score, social_score, ecommerce_score, news_score, tags, source_urls, first_detected_at, last_updated_at) VALUES (
  (SELECT id FROM countries WHERE code='FR'),
  (SELECT id FROM categories WHERE slug='fashion'),
  'Robe courte Boden Femmes texturée à onglets EU Regular', '판매처: BODEN | 가격: 92,00 € | 평점: 4.0 | 리뷰: 5개', 'https://encrypted-tbn0.gstatic.com/shopping?q=tbn:ANd9GcShiC8DHPXEZVlfl_2RTQQ-5ZcIE-zXayjVFd06EkbD86L62u44TiIR4HQUQ3Dx_nZqZZhBSvu19MvmQWOHE_j_HVQS5X0sJDBxZzV60V552dWHZiT4ENaNeA',
  78, 'steady',
  73, 63, 78, 53,
  ARRAY['BODEN','92,00 €','★4.0'], ARRAY['https://www.google.com/search?ibp=oshop&q=tendance mode vêtements 2026&prds=catalogid:12486268914952767468,headlineOfferDocid:13880006337131485393,imageDocid:15512520683700072104,rds:PC_12651338310934583982|PROD_PC_12651338310934583982,gpcid:12651338310934583982,mid:576462846978960272,pvt:a&hl=fr&gl=fr&udm=28'],
  '2026-03-17T05:52:08.866748+00:00', '2026-03-17T05:52:08.866748+00:00'
);
INSERT INTO trends (country_id, category_id, name, description, image_url, heat_score, heat_status, search_score, social_score, ecommerce_score, news_score, tags, source_urls, first_detected_at, last_updated_at) VALUES (
  (SELECT id FROM countries WHERE code='FR'),
  (SELECT id FROM categories WHERE slug='products'),
  'Porte-clés cheval 2026 avec pendentif en forme de cheval 2D pour enfants, adultes, garçons, filles, anniversaire, remise de diplôme, vacances, voyage,', '판매처: Amazon.fr - Seller | 가격: 5,59 €', 'https://encrypted-tbn0.gstatic.com/shopping?q=tbn:ANd9GcTsZsDjQ3Yic_u5l1ju6DtPdR7kYU0Y0pl8VdWhwqgmnvNaklGtM0iSQ78F-MSjcIr40OyO4cRi96k_mkbJxmYcE3vNRzdpYQ37NbupIXlZo5UaWhtWx_EHrA',
  100, 'rising',
  95, 85, 100, 75,
  ARRAY['Amazon.fr - Seller','5,59 €'], ARRAY['https://www.google.com/search?ibp=oshop&q=produits tendance populaire 2026&prds=productid:10644160550867816098,headlineOfferDocid:10644160550867816098,imageDocid:16385971926073585844,pvt:hg&hl=fr&gl=fr&udm=28'],
  '2026-03-17T05:52:08.866748+00:00', '2026-03-17T05:52:08.866748+00:00'
);
INSERT INTO trends (country_id, category_id, name, description, image_url, heat_score, heat_status, search_score, social_score, ecommerce_score, news_score, tags, source_urls, first_detected_at, last_updated_at) VALUES (
  (SELECT id FROM countries WHERE code='FR'),
  (SELECT id FROM categories WHERE slug='products'),
  'Champion Homme Crewneck Sweatshirt', '판매처: Sarenza.com | 가격: 63,00 € | 평점: 4.4 | 리뷰: 1,400개', 'https://encrypted-tbn3.gstatic.com/shopping?q=tbn:ANd9GcR3VKDiGYuUzK1SMaPHgEET0EE1xlTPABfeoHxf9JfKnJUFmlkwDr9cbsCHpjqGFJoatnuVVU4tMcGndOLAXHwV43O9owy9LcFm1VBIAWg9vCH6oHg5fa0HNw',
  100, 'rising',
  95, 85, 100, 75,
  ARRAY['Sarenza.com','63,00 €','★4.4'], ARRAY['https://www.google.com/search?ibp=oshop&q=produits tendance populaire 2026&prds=catalogid:15285732563758277655,headlineOfferDocid:10459424684520953492,imageDocid:10546861528042234175,rds:PC_3204014321461510161|PROD_PC_3204014321461510161,gpcid:3204014321461510161,mid:576462848546335790,pvt:hg&hl=fr&gl=fr&udm=28'],
  '2026-03-17T05:52:08.866748+00:00', '2026-03-17T05:52:08.866748+00:00'
);
INSERT INTO trends (country_id, category_id, name, description, image_url, heat_score, heat_status, search_score, social_score, ecommerce_score, news_score, tags, source_urls, first_detected_at, last_updated_at) VALUES (
  (SELECT id FROM countries WHERE code='FR'),
  (SELECT id FROM categories WHERE slug='products'),
  'Plantes Personnalisables Pot en Céramique Gravé Votre Message Personnalisé', '판매처: Les Merveilleuses | 가격: 20,00 € | 평점: 4.7 | 리뷰: 26개', 'https://encrypted-tbn1.gstatic.com/shopping?q=tbn:ANd9GcQH8LtqNLvJ-dIFpUpcODhXPzCAgH2b0GC2C0MjYp-rknmYVs_0Fyns70cz4NqT_5nAH7CA965nEYXi2QPdr_QmUfdj1t5FdRXNvYyKZVJQ',
  100, 'rising',
  95, 85, 100, 75,
  ARRAY['Les Merveilleuses','20,00 €','★4.7'], ARRAY['https://www.google.com/search?ibp=oshop&q=produits tendance populaire 2026&prds=catalogid:5202672721877162734,headlineOfferDocid:12488413552286584133,imageDocid:16524215806059029301,rds:PC_17077828216554657571|PROD_PC_17077828216554657571,gpcid:17077828216554657571,pvt:hg&hl=fr&gl=fr&udm=28'],
  '2026-03-17T05:52:08.866748+00:00', '2026-03-17T05:52:08.866748+00:00'
);
INSERT INTO trends (country_id, category_id, name, description, image_url, heat_score, heat_status, search_score, social_score, ecommerce_score, news_score, tags, source_urls, first_detected_at, last_updated_at) VALUES (
  (SELECT id FROM countries WHERE code='FR'),
  (SELECT id FROM categories WHERE slug='products'),
  'Enceinte portable 3W avec autonomie de 4h en bambou et ABS recyclé personnalisable avec votre logo', '판매처: HiGift | 가격: 4,64 €', 'https://encrypted-tbn2.gstatic.com/shopping?q=tbn:ANd9GcQ4JoGKwLetP7FMfrZuUeVEBwZ__uh5KJlb6LTuHalnd-yJGiFtUFrkmEexnZgCO3hpUkeb6MSWh3a1v2789pKe2EYwrLJGpqu8mVTw3KHwEhHK5qvoYVJAQA',
  92, 'rising',
  87, 77, 92, 67,
  ARRAY['HiGift','4,64 €'], ARRAY['https://www.google.com/search?ibp=oshop&q=produits tendance populaire 2026&prds=catalogid:10626378599515263577,headlineOfferDocid:12520130896508405901,imageDocid:10352484084603580110,gpcid:1048476454741787342,pvt:hg&hl=fr&gl=fr&udm=28'],
  '2026-03-17T05:52:08.866748+00:00', '2026-03-17T05:52:08.866748+00:00'
);
INSERT INTO trends (country_id, category_id, name, description, image_url, heat_score, heat_status, search_score, social_score, ecommerce_score, news_score, tags, source_urls, first_detected_at, last_updated_at) VALUES (
  (SELECT id FROM countries WHERE code='FR'),
  (SELECT id FROM categories WHERE slug='products'),
  'Les Eaux Primordiales Ambre Supermassive Parfum', '판매처: Galeries Lafayette | 가격: 215,00 € | 평점: 4.8 | 리뷰: 24개', 'https://encrypted-tbn2.gstatic.com/shopping?q=tbn:ANd9GcT5ZRDCDHBnzXnoyc4KxVSJYGpleAiyH-lqbVrAEzvzDu9X3vb6qBnlwzMyGqVmi1Plw2XWR9QxSgPw2cu5fCmIHZqyhjZR-tbBsEuDDfTIkI75MvO8hTo5',
  100, 'rising',
  95, 85, 100, 75,
  ARRAY['Galeries Lafayette','215,00 €','★4.8'], ARRAY['https://www.google.com/search?ibp=oshop&q=produits tendance populaire 2026&prds=catalogid:16072528650116812873,headlineOfferDocid:15998746217607893896,imageDocid:3472365246567551126,rds:PC_4499847744409931244|PROD_PC_4499847744409931244,gpcid:4499847744409931244,mid:576462484284389265,pvt:hg&hl=fr&gl=fr&udm=28'],
  '2026-03-17T05:52:08.866748+00:00', '2026-03-17T05:52:08.866748+00:00'
);
INSERT INTO trends (country_id, category_id, name, description, image_url, heat_score, heat_status, search_score, social_score, ecommerce_score, news_score, tags, source_urls, first_detected_at, last_updated_at) VALUES (
  (SELECT id FROM countries WHERE code='FR'),
  (SELECT id FROM categories WHERE slug='products'),
  'Zoë Ayla Jet Set Glam Kit coffret cadeau pour femme', '판매처: Notino.fr | 가격: 12,08 €', 'https://encrypted-tbn3.gstatic.com/shopping?q=tbn:ANd9GcROBcOjA2L3NIP-3pLs_1A68Kpu7Ae_58kKZWs8X0KeveYcbU7Z72iRswJYJofbyq1UiQwStp0CGbcm2IRx3AUfRJE2gR_0aX8A6_ApiDYN',
  87, 'steady',
  82, 72, 87, 62,
  ARRAY['Notino.fr','12,08 €'], ARRAY['https://www.google.com/search?ibp=oshop&q=produits tendance populaire 2026&prds=catalogid:1532986512892981761,headlineOfferDocid:10009218911332865704,imageDocid:16537791491281740607,gpcid:5108520379693012161,mid:576462869040143533,pvt:hg&hl=fr&gl=fr&udm=28'],
  '2026-03-17T05:52:08.866748+00:00', '2026-03-17T05:52:08.866748+00:00'
);
INSERT INTO trends (country_id, category_id, name, description, image_url, heat_score, heat_status, search_score, social_score, ecommerce_score, news_score, tags, source_urls, first_detected_at, last_updated_at) VALUES (
  (SELECT id FROM countries WHERE code='FR'),
  (SELECT id FROM categories WHERE slug='products'),
  'Bontemps Amoureux Du Temps', '판매처: Printemps.com | 가격: 115,00 €', 'https://encrypted-tbn1.gstatic.com/shopping?q=tbn:ANd9GcSIcNghcCACPfdOgAHT4DaIepuSkvyknx0GpoUVRLYC_QPm-KqcJvXseQkmF8bLWEXWPmWpl6xhs9TG8AshAHff46Tc7PaepBeL69nGq_ek5fRPW9_WeOqzFRg',
  85, 'steady',
  80, 70, 85, 60,
  ARRAY['Printemps.com','115,00 €'], ARRAY['https://www.google.com/search?ibp=oshop&q=produits tendance populaire 2026&prds=catalogid:5572014635058703038,headlineOfferDocid:14631020406186471453,imageDocid:10522142947945191649,gpcid:11133133614938650690,mid:576462846737261352,pvt:hg&hl=fr&gl=fr&udm=28'],
  '2026-03-17T05:52:08.866748+00:00', '2026-03-17T05:52:08.866748+00:00'
);
INSERT INTO trends (country_id, category_id, name, description, image_url, heat_score, heat_status, search_score, social_score, ecommerce_score, news_score, tags, source_urls, first_detected_at, last_updated_at) VALUES (
  (SELECT id FROM countries WHERE code='FR'),
  (SELECT id FROM categories WHERE slug='products'),
  'Maison Francis Kurkdjian Reine des prés Boite à meuh parfumée', '판매처: Maison Francis Kurkdjian Paris | 가격: 45,00 €', 'https://encrypted-tbn0.gstatic.com/shopping?q=tbn:ANd9GcTbiwCZCJRhU2bt206ngx-kmBAtZf4vFrLHKbk7ni0k_WsTJXewthbENWrKLgtOeidds8JTrDDKun9P3tYp2Cedc0y8qh6aRotksK8ocTnustT76Sj9tQLocg',
  82, 'steady',
  77, 67, 82, 57,
  ARRAY['Maison Francis Kurkdjian Paris','45,00 €'], ARRAY['https://www.google.com/search?ibp=oshop&q=produits tendance populaire 2026&prds=catalogid:16981816717089525923,headlineOfferDocid:12342372454565949852,imageDocid:1058546213865207832,gpcid:14324994445429709415,mid:576462874586223629,pvt:hg&hl=fr&gl=fr&udm=28'],
  '2026-03-17T05:52:08.866748+00:00', '2026-03-17T05:52:08.866748+00:00'
);
INSERT INTO trends (country_id, category_id, name, description, image_url, heat_score, heat_status, search_score, social_score, ecommerce_score, news_score, tags, source_urls, first_detected_at, last_updated_at) VALUES (
  (SELECT id FROM countries WHERE code='FR'),
  (SELECT id FROM categories WHERE slug='products'),
  'Coffret cadeau femme luxe 7pcs – bougie parfumée, mug isotherme étui cuir végétal, bracelet pierres naturelles, miroir de poche, boîte magnétique chic', '판매처: Amazon.fr - Seller | 가격: 39,90 €', 'https://encrypted-tbn3.gstatic.com/shopping?q=tbn:ANd9GcSTIlHJOG4zq3WiTdOU6jyhnGfIoIMQEfoEz3VSJjOJK554cntJkTuYqH6xb0tVxgBKfdOPurEXVeoa1oyVt0r1ruLUtJAAmNqMaEz21l-ZFtE8KfcA_CL_Sg',
  80, 'steady',
  75, 65, 80, 55,
  ARRAY['Amazon.fr - Seller','39,90 €'], ARRAY['https://www.google.com/search?ibp=oshop&q=produits tendance populaire 2026&prds=productid:5644512582095189726,headlineOfferDocid:5644512582095189726,imageDocid:17738727499919324875,pvt:hg&hl=fr&gl=fr&udm=28'],
  '2026-03-17T05:52:08.866748+00:00', '2026-03-17T05:52:08.866748+00:00'
);
INSERT INTO trends (country_id, category_id, name, description, image_url, heat_score, heat_status, search_score, social_score, ecommerce_score, news_score, tags, source_urls, first_detected_at, last_updated_at) VALUES (
  (SELECT id FROM countries WHERE code='FR'),
  (SELECT id FROM categories WHERE slug='products'),
  'Florame Coffret Sucre d''Orge Crème Mains 30 ml + Baume Lèvres Bio 15 ml', '판매처: Mademoiselle bio | 가격: 9,03 €', 'https://encrypted-tbn2.gstatic.com/shopping?q=tbn:ANd9GcR6EYUQCClY-tGiOK-1IKXi1z8nMysKR9p4P81X3kRXHPSjWs3sfMyniUp_sbuakpG8nriG9QQONTBs7RfTBRdKCzsUF55RHboNlCAAA26G8QS8thTmdqZ7',
  77, 'steady',
  72, 62, 77, 52,
  ARRAY['Mademoiselle bio','9,03 €'], ARRAY['https://www.google.com/search?ibp=oshop&q=produits tendance populaire 2026&prds=catalogid:374970382707655208,headlineOfferDocid:3830792007822980325,imageDocid:1117581265014995026,gpcid:7555479212119541053,mid:576462794354464483,pvt:hg&hl=fr&gl=fr&udm=28'],
  '2026-03-17T05:52:08.866748+00:00', '2026-03-17T05:52:08.866748+00:00'
);
INSERT INTO trends (country_id, category_id, name, description, image_url, heat_score, heat_status, search_score, social_score, ecommerce_score, news_score, tags, source_urls, first_detected_at, last_updated_at) VALUES (
  (SELECT id FROM countries WHERE code='FR'),
  (SELECT id FROM categories WHERE slug='products'),
  'Desigual Femme Box cadeau de bonnet et gants', '판매처: Desigual.fr | 가격: 19,98 € | 평점: 5.0 | 리뷰: 5개', 'https://encrypted-tbn0.gstatic.com/shopping?q=tbn:ANd9GcTkYusc_2s2HSyG94m7kDxUR-tG7sVCEtctS9nQSs7Ws3BI9tdVnRE4kBOK3CprShhLnIUo1zxyU4c8mv4e5bIo_tUDOJvGWK5i2BqTrvdiHrI_vmPfNeE8By9c',
  98, 'steady',
  93, 83, 98, 73,
  ARRAY['Desigual.fr','19,98 €','★5.0'], ARRAY['https://www.google.com/search?ibp=oshop&q=produits tendance populaire 2026&prds=catalogid:4795569571938618072,headlineOfferDocid:18285298520485677153,imageDocid:13269602736641735232,rds:PC_1418487094742958046|PROD_PC_1418487094742958046,gpcid:1418487094742958046,mid:576462788419546521,pvt:hg&hl=fr&gl=fr&udm=28'],
  '2026-03-17T05:52:08.866748+00:00', '2026-03-17T05:52:08.866748+00:00'
);
INSERT INTO trends (country_id, category_id, name, description, image_url, heat_score, heat_status, search_score, social_score, ecommerce_score, news_score, tags, source_urls, first_detected_at, last_updated_at) VALUES (
  (SELECT id FROM countries WHERE code='FR'),
  (SELECT id FROM categories WHERE slug='products'),
  'SOLS Stellar Enfant Sweat capuche', '판매처: Wordans.fr | 가격: 21,27 € | 평점: 4.6 | 리뷰: 49개', 'https://encrypted-tbn0.gstatic.com/shopping?q=tbn:ANd9GcQhoGk7WaCv7QFk9KGGm0TejqS4W1xc_M2GMuyp2j76HE4MzUrHwmPtFlyiNHVbqt563BLmXdc6FMLuzAqf6pVpfnkYLyaKKhl2sVTg6G7vpZnWYihQOuhljg',
  96, 'steady',
  91, 81, 96, 71,
  ARRAY['Wordans.fr','21,27 €','★4.6'], ARRAY['https://www.google.com/search?ibp=oshop&q=produits tendance populaire 2026&prds=catalogid:962345149402503488,headlineOfferDocid:15719842630659445045,imageDocid:11793637789195894448,rds:PC_16988372294069314481|PROD_PC_16988372294069314481,gpcid:16988372294069314481,mid:576462790811757769,pvt:hg&hl=fr&gl=fr&udm=28'],
  '2026-03-17T05:52:08.866748+00:00', '2026-03-17T05:52:08.866748+00:00'
);
INSERT INTO trends (country_id, category_id, name, description, image_url, heat_score, heat_status, search_score, social_score, ecommerce_score, news_score, tags, source_urls, first_detected_at, last_updated_at) VALUES (
  (SELECT id FROM countries WHERE code='FR'),
  (SELECT id FROM categories WHERE slug='products'),
  'Atmosphera Coffret cadeau VÉGÉTAL', '판매처: Leroy Merlin | 가격: 19,99 € | 평점: 5.0 | 리뷰: 4개', 'https://encrypted-tbn0.gstatic.com/shopping?q=tbn:ANd9GcSe0o02o2OtcQEX7nMF_i6Y1F2pUryZrQYXoNv3cvfPU6SVQgP2vw73LilzQ_BKSpvpqzpnYnbneGbxhhA4whozQcC8E1lT2iJ7e4P6vXShZO_o3L39dDyoAg',
  93, 'steady',
  88, 78, 93, 68,
  ARRAY['Leroy Merlin','19,99 €','★5.0'], ARRAY['https://www.google.com/search?ibp=oshop&q=produits tendance populaire 2026&prds=catalogid:5509070729770039607,headlineOfferDocid:6892798823930755282,imageDocid:5773637445334907532,rds:PC_6861904463633363209|PROD_PC_6861904463633363209,gpcid:6861904463633363209,mid:576462628261329740,pvt:hg&hl=fr&gl=fr&udm=28'],
  '2026-03-17T05:52:08.866748+00:00', '2026-03-17T05:52:08.866748+00:00'
);
INSERT INTO trends (country_id, category_id, name, description, image_url, heat_score, heat_status, search_score, social_score, ecommerce_score, news_score, tags, source_urls, first_detected_at, last_updated_at) VALUES (
  (SELECT id FROM countries WHERE code='FR'),
  (SELECT id FROM categories WHERE slug='products'),
  'TERRE D''OC parfum d''ambiance Petits goûters d''automne', '판매처: Nature & Découvertes FR | 가격: 18,95 € | 평점: 5.0 | 리뷰: 4개', 'https://encrypted-tbn1.gstatic.com/shopping?q=tbn:ANd9GcRAOKmQ-SBoQTfPqA9rjGJMDGyYzDzSyZNBytF5ZmwedOFnZKrfL4n-FblXdb-6ngOOXNwpDDtNNkmguIpNbyhHmVm8lzqfCWqjXLymCJ8VTkeohRa0JL5rRw',
  90, 'steady',
  85, 75, 90, 65,
  ARRAY['Nature & Découvertes FR','18,95 €','★5.0'], ARRAY['https://www.google.com/search?ibp=oshop&q=produits tendance populaire 2026&prds=catalogid:14055544060503345612,headlineOfferDocid:1305791032388885482,imageDocid:13809501753721676149,rds:PC_16390206294445619099|PROD_PC_16390206294445619099,gpcid:16390206294445619099,mid:576462848677895615,pvt:hg&hl=fr&gl=fr&udm=28'],
  '2026-03-17T05:52:08.866748+00:00', '2026-03-17T05:52:08.866748+00:00'
);
INSERT INTO trends (country_id, category_id, name, description, image_url, heat_score, heat_status, search_score, social_score, ecommerce_score, news_score, tags, source_urls, first_detected_at, last_updated_at) VALUES (
  (SELECT id FROM countries WHERE code='FR'),
  (SELECT id FROM categories WHERE slug='products'),
  'Horace Eau de Parfum Coloris unique', '판매처: Galeries Lafayette | 가격: 62,00 € | 평점: 4.6 | 리뷰: 140개', 'https://encrypted-tbn2.gstatic.com/shopping?q=tbn:ANd9GcS6WtWseoaxWNYHxvc5K4PiQtPITWRHlxctT5Cp8Udec2Ft22xxEaz2RzDOgJ3Ta05G806iClGtSBM3waVNT9zfCAittVLzyvWdHfl0JD-dQlONC51fbaymIA',
  91, 'steady',
  86, 76, 91, 66,
  ARRAY['Galeries Lafayette','62,00 €','★4.6'], ARRAY['https://www.google.com/search?ibp=oshop&q=produits tendance populaire 2026&prds=catalogid:8802492957999320920,headlineOfferDocid:7285276262546552308,imageDocid:16432374224926347214,rds:PC_7165335549666290357|PROD_PC_7165335549666290357,gpcid:7165335549666290357,mid:576462823389664546,pvt:hg&hl=fr&gl=fr&udm=28'],
  '2026-03-17T05:52:08.866748+00:00', '2026-03-17T05:52:08.866748+00:00'
);
INSERT INTO trends (country_id, category_id, name, description, image_url, heat_score, heat_status, search_score, social_score, ecommerce_score, news_score, tags, source_urls, first_detected_at, last_updated_at) VALUES (
  (SELECT id FROM countries WHERE code='FR'),
  (SELECT id FROM categories WHERE slug='food'),
  'Dessert végétal à l''avoine noisette', '판매처: La Belle Vie | 가격: 2,97 €', 'https://encrypted-tbn2.gstatic.com/shopping?q=tbn:ANd9GcSWkNFvW-YyLIzKJMLXgP6A5f-k_VeOwLrO-L7JgfIsQDV3nekusN_QRVh36O88b-y0g5w0I6L3I6JFkH9ZsPmbKqwR0GU6yf_SklPp8EVoo9_rGSgkyIFw',
  100, 'rising',
  95, 85, 100, 75,
  ARRAY['La Belle Vie','2,97 €'], ARRAY['https://www.google.com/search?ibp=oshop&q=tendance nourriture dessert snack 2026&prds=catalogid:13442204880558901676,headlineOfferDocid:10107665468121845347,imageDocid:17966448048136607794,gpcid:1675852005928173646,mid:576462855051904275,pvt:hg&hl=fr&gl=fr&udm=28'],
  '2026-03-17T05:52:08.866748+00:00', '2026-03-17T05:52:08.866748+00:00'
);
INSERT INTO trends (country_id, category_id, name, description, image_url, heat_score, heat_status, search_score, social_score, ecommerce_score, news_score, tags, source_urls, first_detected_at, last_updated_at) VALUES (
  (SELECT id FROM countries WHERE code='FR'),
  (SELECT id FROM categories WHERE slug='food'),
  'Gâteau été palette de couleur bord de mer et couher de soleil vegan', '판매처: GâteauSansOeufs.com | 가격: 44,90 €', 'https://encrypted-tbn1.gstatic.com/shopping?q=tbn:ANd9GcSBxEsZbzsyX3waVfmUoCMrXrEjSm3Ebn5C5QYLv7FzQyNCyWkt0qwjiYbFFwQkdGt_6X0vIRbesyWjNBdQgk4yqcYjOYWbKxHRMGHoSBey8jKYMR-P47Qy',
  97, 'rising',
  92, 82, 97, 72,
  ARRAY['GâteauSansOeufs.com','44,90 €'], ARRAY['https://www.google.com/search?ibp=oshop&q=tendance nourriture dessert snack 2026&prds=catalogid:16322514998441531538,headlineOfferDocid:14714027136452485848,imageDocid:1984991793617865265,gpcid:6146691125500863252,pvt:hg&hl=fr&gl=fr&udm=28'],
  '2026-03-17T05:52:08.866748+00:00', '2026-03-17T05:52:08.866748+00:00'
);
INSERT INTO trends (country_id, category_id, name, description, image_url, heat_score, heat_status, search_score, social_score, ecommerce_score, news_score, tags, source_urls, first_detected_at, last_updated_at) VALUES (
  (SELECT id FROM countries WHERE code='FR'),
  (SELECT id FROM categories WHERE slug='food'),
  'Douceur des îles', '판매처: Pâtisseries La Romainville | 가격: 16,50 €', 'https://encrypted-tbn0.gstatic.com/shopping?q=tbn:ANd9GcRlXfw8YWQyaF9s36gBt6-8YwtFqWS1D_pMTeTPae-6ERBawd2G7LrQI87GCHQS3agXZov4LIzyarI8N_kIiYOIo9ajYMLyKpuhUkHK8weR',
  95, 'rising',
  90, 80, 95, 70,
  ARRAY['Pâtisseries La Romainville','16,50 €'], ARRAY['https://www.google.com/search?ibp=oshop&q=tendance nourriture dessert snack 2026&prds=catalogid:12930348128123536855,headlineOfferDocid:11204349851160256466,imageDocid:16223278169002453132,gpcid:13078511292382209030,pvt:hg&hl=fr&gl=fr&udm=28'],
  '2026-03-17T05:52:08.866748+00:00', '2026-03-17T05:52:08.866748+00:00'
);
INSERT INTO trends (country_id, category_id, name, description, image_url, heat_score, heat_status, search_score, social_score, ecommerce_score, news_score, tags, source_urls, first_detected_at, last_updated_at) VALUES (
  (SELECT id FROM countries WHERE code='FR'),
  (SELECT id FROM categories WHERE slug='food'),
  'Le Hangar Comté Noisettes 150g', '판매처: Cafés Querry | 가격: 4,70 €', 'https://encrypted-tbn3.gstatic.com/shopping?q=tbn:ANd9GcSfcci_HJn2hGLaI5Gph-jiCKIJd7kBld8STYJXfN-sMjfoTA3r8Ou3Hcz8CZkN_ZAOtKadXWpy-hWpp5yj___RYBlp14v7bG_nEu9ZCU2XSlPdGxAhlUHecQ',
  92, 'rising',
  87, 77, 92, 67,
  ARRAY['Cafés Querry','4,70 €'], ARRAY['https://www.google.com/search?ibp=oshop&q=tendance nourriture dessert snack 2026&prds=catalogid:2240762254383132689,headlineOfferDocid:4067681036566883115,imageDocid:16602077536750195471,gpcid:7083443998052258338,mid:576462692634720287,pvt:hg&hl=fr&gl=fr&udm=28'],
  '2026-03-17T05:52:08.866748+00:00', '2026-03-17T05:52:08.866748+00:00'
);
INSERT INTO trends (country_id, category_id, name, description, image_url, heat_score, heat_status, search_score, social_score, ecommerce_score, news_score, tags, source_urls, first_detected_at, last_updated_at) VALUES (
  (SELECT id FROM countries WHERE code='FR'),
  (SELECT id FROM categories WHERE slug='food'),
  'Bergen Dubai Style Crème de Noisettes avec Kadayif', '판매처: MesBonBons | 가격: 6,99 €', 'https://encrypted-tbn3.gstatic.com/shopping?q=tbn:ANd9GcTJptbnplcy12Yv-GjF8LhT-QVUq_sXtejY0aaEfhiDCJgzUpW6DmtcLCy-yz6eEvqhWOb2dYCF-_8AFBXOeL2Jwwy5ofSPNp7CU9gXT-wFY855DS9WiJ5xfw',
  90, 'rising',
  85, 75, 90, 65,
  ARRAY['MesBonBons','6,99 €'], ARRAY['https://www.google.com/search?ibp=oshop&q=tendance nourriture dessert snack 2026&prds=catalogid:1163119364560769840,headlineOfferDocid:4141408337669555577,imageDocid:10417417145374240127,gpcid:11477319610147629232,mid:576462842349416358,pvt:hg&hl=fr&gl=fr&udm=28'],
  '2026-03-17T05:52:08.866748+00:00', '2026-03-17T05:52:08.866748+00:00'
);
INSERT INTO trends (country_id, category_id, name, description, image_url, heat_score, heat_status, search_score, social_score, ecommerce_score, news_score, tags, source_urls, first_detected_at, last_updated_at) VALUES (
  (SELECT id FROM countries WHERE code='FR'),
  (SELECT id FROM categories WHERE slug='food'),
  'La boîte Celeste JADIS La Généreuse', '판매처: JADIS | 가격: 23,50 €', 'https://encrypted-tbn3.gstatic.com/shopping?q=tbn:ANd9GcRTdSxsaSqZK01ZaFYAUevYAhO1MZ5hO89ZnkqQGQ165HIDt7lfPCB36bfAhSoKFa7wnEE3oYB8JNt1qu7d2QstU_0u_eLVsxGVbOesH5c0',
  87, 'steady',
  82, 72, 87, 62,
  ARRAY['JADIS','23,50 €'], ARRAY['https://www.google.com/search?ibp=oshop&q=tendance nourriture dessert snack 2026&prds=catalogid:8696433267528095001,headlineOfferDocid:5424673811840686528,imageDocid:10527029817117964163,gpcid:14984168477351093038,mid:576462537645525024,pvt:hg&hl=fr&gl=fr&udm=28'],
  '2026-03-17T05:52:08.866748+00:00', '2026-03-17T05:52:08.866748+00:00'
);
INSERT INTO trends (country_id, category_id, name, description, image_url, heat_score, heat_status, search_score, social_score, ecommerce_score, news_score, tags, source_urls, first_detected_at, last_updated_at) VALUES (
  (SELECT id FROM countries WHERE code='FR'),
  (SELECT id FROM categories WHERE slug='food'),
  'Tranche aux Fruits', '판매처: France Cake Tradition | 가격: 1,60 €', 'https://encrypted-tbn0.gstatic.com/shopping?q=tbn:ANd9GcRcAcH3_FulpXbGc63B65yeiEilPp336BkJuCFXEhx9Ovu-mIf5qND8IV1vD5-IejhUBX8J8PisdTknYqxwhL9zI80ovdoK7u8_DyMMnH-5FxBZ7l8CZGHw',
  85, 'steady',
  80, 70, 85, 60,
  ARRAY['France Cake Tradition','1,60 €'], ARRAY['https://www.google.com/search?ibp=oshop&q=tendance nourriture dessert snack 2026&prds=catalogid:5394427175061111632,headlineOfferDocid:15414745477743725961,imageDocid:11792413612253900192,gpcid:16112617867831575698,mid:576462821678339106,pvt:hg&hl=fr&gl=fr&udm=28'],
  '2026-03-17T05:52:08.866748+00:00', '2026-03-17T05:52:08.866748+00:00'
);
INSERT INTO trends (country_id, category_id, name, description, image_url, heat_score, heat_status, search_score, social_score, ecommerce_score, news_score, tags, source_urls, first_detected_at, last_updated_at) VALUES (
  (SELECT id FROM countries WHERE code='FR'),
  (SELECT id FROM categories WHERE slug='food'),
  'Dankek Bouchees De Cake A La Noix De Coco 10X160G', '판매처: Alimetz | 가격: 13,95 €', 'https://encrypted-tbn3.gstatic.com/shopping?q=tbn:ANd9GcTEYrLj11YPqM95n7xt6H5hNgJjxMgFUQTFfdthiE-hejqyEBii8O5dW7V5Eaf-SWxUmV7oDs1Qwu4aFGrJTO1JgaYP6Gn_HiElK-fsBfqrRGLuWUTH60T_PSo',
  82, 'steady',
  77, 67, 82, 57,
  ARRAY['Alimetz','13,95 €'], ARRAY['https://www.google.com/search?ibp=oshop&q=tendance nourriture dessert snack 2026&prds=catalogid:5807135505306672199,headlineOfferDocid:17429721420291696461,imageDocid:4631368851660932099,gpcid:18294104978975017825,mid:576462873300522294,pvt:hg&hl=fr&gl=fr&udm=28'],
  '2026-03-17T05:52:08.866748+00:00', '2026-03-17T05:52:08.866748+00:00'
);
INSERT INTO trends (country_id, category_id, name, description, image_url, heat_score, heat_status, search_score, social_score, ecommerce_score, news_score, tags, source_urls, first_detected_at, last_updated_at) VALUES (
  (SELECT id FROM countries WHERE code='FR'),
  (SELECT id FROM categories WHERE slug='food'),
  'Crème croustillante à la pomme', '판매처: Lyophilise & Co | 가격: 62,95 € | 평점: 5.0 | 리뷰: 1개', 'https://encrypted-tbn2.gstatic.com/shopping?q=tbn:ANd9GcQt7p0S54E4YHWobXHSjE4Wc8uaPntVcALs1O1Ieg36Ymz47NfTgnX-Usew4JOfTdIydEV9Bpxf1A-Kjw78o0wcbNArxNa0Lu--rufJeAegvV0LIKFIYVNr1Dk',
  100, 'steady',
  95, 85, 100, 75,
  ARRAY['Lyophilise & Co','62,95 €','★5.0'], ARRAY['https://www.google.com/search?ibp=oshop&q=tendance nourriture dessert snack 2026&prds=catalogid:11776039038662471261,headlineOfferDocid:55968801741552282,imageDocid:6486497989720875274,rds:PC_4800466277017566381|PROD_PC_4800466277017566381,gpcid:4800466277017566381,pvt:hg&hl=fr&gl=fr&udm=28'],
  '2026-03-17T05:52:08.866748+00:00', '2026-03-17T05:52:08.866748+00:00'
);
INSERT INTO trends (country_id, category_id, name, description, image_url, heat_score, heat_status, search_score, social_score, ecommerce_score, news_score, tags, source_urls, first_detected_at, last_updated_at) VALUES (
  (SELECT id FROM countries WHERE code='FR'),
  (SELECT id FROM categories WHERE slug='food'),
  'Asia marché Dessert chinois aux graines 160g', '판매처: Asia Marché | 가격: 3,49 €', 'https://encrypted-tbn3.gstatic.com/shopping?q=tbn:ANd9GcSVqyCmUkh6RjibBSlev4c-MFRPVYg7Gc4LO1vbUJpHfcZEldhU43ovpDkcNDHb65OM42h6oyMakHPenyUkRd2PzTJj_8_usVM1DWgXJ-2r1vjCq2avxRL6',
  77, 'steady',
  72, 62, 77, 52,
  ARRAY['Asia Marché','3,49 €'], ARRAY['https://www.google.com/search?ibp=oshop&q=tendance nourriture dessert snack 2026&prds=catalogid:876752519462924499,headlineOfferDocid:3313823581782308682,imageDocid:11174530668541578451,gpcid:1076423236329844173,mid:576462640389288617,pvt:hg&hl=fr&gl=fr&udm=28'],
  '2026-03-17T05:52:08.866748+00:00', '2026-03-17T05:52:08.866748+00:00'
);
INSERT INTO trends (country_id, category_id, name, description, image_url, heat_score, heat_status, search_score, social_score, ecommerce_score, news_score, tags, source_urls, first_detected_at, last_updated_at) VALUES (
  (SELECT id FROM countries WHERE code='FR'),
  (SELECT id FROM categories WHERE slug='food'),
  'Soon dessert chanvre chocolat 530gr', '판매처: Frichti Market | 가격: 3,82 € | 평점: 5.0 | 리뷰: 1개', 'https://encrypted-tbn0.gstatic.com/shopping?q=tbn:ANd9GcRXS4Z05vxYqQ0MT1N0z5at_eAJ-Z35eNftIrL4A50-fQjwUgztLr6As5azvlnxD859kiXIwrvKXRKP8LcF9yzVYnCpQSIiW543J7IXlnSP0Vx7N4Gk2M9Xbw',
  95, 'steady',
  90, 80, 95, 70,
  ARRAY['Frichti Market','3,82 €','★5.0'], ARRAY['https://www.google.com/search?ibp=oshop&q=tendance nourriture dessert snack 2026&prds=catalogid:18305166877899269775,headlineOfferDocid:8495285653901542522,imageDocid:8008952798823640752,rds:PC_18196981084279856649|PROD_PC_18196981084279856649,gpcid:18196981084279856649,mid:576462693103981622,pvt:hg&hl=fr&gl=fr&udm=28'],
  '2026-03-17T05:52:08.866748+00:00', '2026-03-17T05:52:08.866748+00:00'
);
INSERT INTO trends (country_id, category_id, name, description, image_url, heat_score, heat_status, search_score, social_score, ecommerce_score, news_score, tags, source_urls, first_detected_at, last_updated_at) VALUES (
  (SELECT id FROM countries WHERE code='FR'),
  (SELECT id FROM categories WHERE slug='food'),
  'Petit Cake moelleux au Bleu des Causses et aux lentilles', '판매처: BienManger.com | 가격: 2,95 €', 'https://encrypted-tbn3.gstatic.com/shopping?q=tbn:ANd9GcS8C0kuEKZtM5DaPfeg23JA9val3GTzdWkCciR8DOIBe_22zydEGoAKVyMHlO9gQwLLvRhoZjkIrSEuD7-1HkZQsIJq-TZM9UtYEAT9k4LrLZfBsHGYKPxs',
  72, 'steady',
  67, 57, 72, 47,
  ARRAY['BienManger.com','2,95 €'], ARRAY['https://www.google.com/search?ibp=oshop&q=tendance nourriture dessert snack 2026&prds=catalogid:5513587125718228122,headlineOfferDocid:3641947772367731492,imageDocid:15764914425051791931,pvt:hg&hl=fr&gl=fr&udm=28'],
  '2026-03-17T05:52:08.866748+00:00', '2026-03-17T05:52:08.866748+00:00'
);
INSERT INTO trends (country_id, category_id, name, description, image_url, heat_score, heat_status, search_score, social_score, ecommerce_score, news_score, tags, source_urls, first_detected_at, last_updated_at) VALUES (
  (SELECT id FROM countries WHERE code='FR'),
  (SELECT id FROM categories WHERE slug='food'),
  'Gâteau The Big Bang Theory Sheldon et la bande vegan', '판매처: GâteauSansOeufs.com | 가격: 44,90 €', 'https://encrypted-tbn3.gstatic.com/shopping?q=tbn:ANd9GcQHT9vQsgFNodMl2kiFvrtxEVo3i9JjHxDt47QU03ZFtOlAdrqvy1gqhAMM8L1YZhUeRTxYLXfU__XvktpEfvTzYrKURuIbC8eUEnNzNVGBzoJeltWE22Lkqw',
  70, 'steady',
  65, 55, 70, 45,
  ARRAY['GâteauSansOeufs.com','44,90 €'], ARRAY['https://www.google.com/search?ibp=oshop&q=tendance nourriture dessert snack 2026&prds=catalogid:11655976170315153140,headlineOfferDocid:6536936205533445702,imageDocid:1479289464975621523,gpcid:12948904516543299632,pvt:hg&hl=fr&gl=fr&udm=28'],
  '2026-03-17T05:52:08.866748+00:00', '2026-03-17T05:52:08.866748+00:00'
);
INSERT INTO trends (country_id, category_id, name, description, image_url, heat_score, heat_status, search_score, social_score, ecommerce_score, news_score, tags, source_urls, first_detected_at, last_updated_at) VALUES (
  (SELECT id FROM countries WHERE code='FR'),
  (SELECT id FROM categories WHERE slug='food'),
  'Mini Assortiment de Snacks Chocolatés par Elite - 390g / 13.76 oz — Fabriqué en Israël', '판매처: GroundJerusalem.com | 가격: 12,90 €', 'https://encrypted-tbn0.gstatic.com/shopping?q=tbn:ANd9GcRHJBHjrFj2IS4koLGazJMAWM9SbacIBvXDMlN5tDEM6vzaII3kxXNd0t0huGhumrmFjN70mMcumxu_lrJSmHJL1x16hxZUXc9vfpIqm7qTRvnuEc-knjptQg',
  67, 'steady',
  62, 52, 67, 42,
  ARRAY['GroundJerusalem.com','12,90 €'], ARRAY['https://www.google.com/search?ibp=oshop&q=tendance nourriture dessert snack 2026&prds=productid:17950999268714495467,headlineOfferDocid:17950999268714495467,imageDocid:9133260038769696912,pvt:hg&hl=fr&gl=fr&udm=28'],
  '2026-03-17T05:52:08.866748+00:00', '2026-03-17T05:52:08.866748+00:00'
);
INSERT INTO trends (country_id, category_id, name, description, image_url, heat_score, heat_status, search_score, social_score, ecommerce_score, news_score, tags, source_urls, first_detected_at, last_updated_at) VALUES (
  (SELECT id FROM countries WHERE code='FR'),
  (SELECT id FROM categories WHERE slug='food'),
  'Soon Dessert riz chocolat 530g', '판매처: Etik et Bio | 가격: 3,00 € | 평점: 5.0 | 리뷰: 3개', 'https://encrypted-tbn3.gstatic.com/shopping?q=tbn:ANd9GcSfuwwv90VfRQ0p00ztc5MMuupYUhfhwWl915kXIEWYUAJjPV89qt1GbMAMVq5SgR_8bx2Ncf7e8fuBhDmG3OIZdpyYaUS4hragQb7tRo4rlJOrHC_63Zueeg',
  87, 'steady',
  82, 72, 87, 62,
  ARRAY['Etik et Bio','3,00 €','★5.0'], ARRAY['https://www.google.com/search?ibp=oshop&q=tendance nourriture dessert snack 2026&prds=catalogid:3622579165968482731,headlineOfferDocid:14281970200811104790,imageDocid:3051796132450438123,rds:PC_14076717998265698997|PROD_PC_14076717998265698997,gpcid:14076717998265698997,mid:576462724958375539,pvt:hg&hl=fr&gl=fr&udm=28'],
  '2026-03-17T05:52:08.866748+00:00', '2026-03-17T05:52:08.866748+00:00'
);
INSERT INTO trends (country_id, category_id, name, description, image_url, heat_score, heat_status, search_score, social_score, ecommerce_score, news_score, tags, source_urls, first_detected_at, last_updated_at) VALUES (
  (SELECT id FROM countries WHERE code='FR'),
  (SELECT id FROM categories WHERE slug='entertainment'),
  'Flipslide Moose Toys', '판매처: Esprit Jeu | 가격: 21,90 € | 평점: 4.8 | 리뷰: 24개', 'https://encrypted-tbn2.gstatic.com/shopping?q=tbn:ANd9GcSesMsiC0UbB0KIFNGFCcz4lUfT6Afx3OuihAs1ZuZVZUgw1bIehNp3QZhITDOf2Lfm7wjNqJEz',
  100, 'rising',
  95, 85, 100, 75,
  ARRAY['Esprit Jeu','21,90 €','★4.8'], ARRAY['https://www.google.com/search?ibp=oshop&q=tendance jouets jeux gadgets 2026&prds=catalogid:17943737896259350834,headlineOfferDocid:9344105480617140209,imageDocid:13957001795229657090,rds:PC_8123039141450862423|PROD_PC_8123039141450862423,gpcid:8123039141450862423,mid:576462794439314401,pvt:hg&hl=fr&gl=fr&udm=28'],
  '2026-03-17T05:52:08.866748+00:00', '2026-03-17T05:52:08.866748+00:00'
);
INSERT INTO trends (country_id, category_id, name, description, image_url, heat_score, heat_status, search_score, social_score, ecommerce_score, news_score, tags, source_urls, first_detected_at, last_updated_at) VALUES (
  (SELECT id FROM countries WHERE code='FR'),
  (SELECT id FROM categories WHERE slug='entertainment'),
  'Lumios Gigamic', '판매처: Cultura.com | 가격: 39,99 € | 평점: 4.5 | 리뷰: 724개', 'https://encrypted-tbn3.gstatic.com/shopping?q=tbn:ANd9GcRrNNaVAB2HeJeI-UmR5lajaE4eRswAsAiYO-bRhlk21tK0WecLbTHyHsAlhGH3JqIN57uryWwd',
  100, 'rising',
  95, 85, 100, 75,
  ARRAY['Cultura.com','39,99 €','★4.5'], ARRAY['https://www.google.com/search?ibp=oshop&q=tendance jouets jeux gadgets 2026&prds=catalogid:5922098876567343445,headlineOfferDocid:6847760520129530219,imageDocid:13161669319710630491,rds:PC_14911059452383176752|PROD_PC_14911059452383176752,gpcid:14911059452383176752,mid:576462531111114832,pvt:hg&hl=fr&gl=fr&udm=28'],
  '2026-03-17T05:52:08.866748+00:00', '2026-03-17T05:52:08.866748+00:00'
);
INSERT INTO trends (country_id, category_id, name, description, image_url, heat_score, heat_status, search_score, social_score, ecommerce_score, news_score, tags, source_urls, first_detected_at, last_updated_at) VALUES (
  (SELECT id FROM countries WHERE code='FR'),
  (SELECT id FROM categories WHERE slug='entertainment'),
  'Goliath Clickeez Controller', '판매처: Carrefour | 가격: 18,99 € | 평점: 4.6 | 리뷰: 10개', 'https://encrypted-tbn1.gstatic.com/shopping?q=tbn:ANd9GcQZiZqdPvzbVs5HRxLySH9n7C4OvrvNi4xk9MX1oE9kfEFA-MpbJHy4ALWWuJFtKC3Aqx8jSlfB',
  100, 'rising',
  95, 85, 100, 75,
  ARRAY['Carrefour','18,99 €','★4.6'], ARRAY['https://www.google.com/search?ibp=oshop&q=tendance jouets jeux gadgets 2026&prds=catalogid:8227848247558267635,headlineOfferDocid:10797162302047540962,imageDocid:14245182026584457749,rds:PC_10295619253740354898|PROD_PC_10295619253740354898,gpcid:10295619253740354898,pvt:hg&hl=fr&gl=fr&udm=28'],
  '2026-03-17T05:52:08.866748+00:00', '2026-03-17T05:52:08.866748+00:00'
);
INSERT INTO trends (country_id, category_id, name, description, image_url, heat_score, heat_status, search_score, social_score, ecommerce_score, news_score, tags, source_urls, first_detected_at, last_updated_at) VALUES (
  (SELECT id FROM countries WHERE code='FR'),
  (SELECT id FROM categories WHERE slug='entertainment'),
  'Archeo Gigamic', '판매처: JouéClub | 가격: 26,99 €', 'https://encrypted-tbn1.gstatic.com/shopping?q=tbn:ANd9GcS3FsK7S6mNyINR1Lz59jJR9C-h9JKwHPHYAp356ypB1lRz1FQ_hC19jdB02zQ',
  92, 'rising',
  87, 77, 92, 67,
  ARRAY['JouéClub','26,99 €'], ARRAY['https://www.google.com/search?ibp=oshop&q=tendance jouets jeux gadgets 2026&prds=catalogid:6096050473549593057,headlineOfferDocid:6580887568393743931,imageDocid:13467869542511842845,gpcid:3325877382452049820,mid:576462828442858793,pvt:hg&hl=fr&gl=fr&udm=28'],
  '2026-03-17T05:52:08.866748+00:00', '2026-03-17T05:52:08.866748+00:00'
);
INSERT INTO trends (country_id, category_id, name, description, image_url, heat_score, heat_status, search_score, social_score, ecommerce_score, news_score, tags, source_urls, first_detected_at, last_updated_at) VALUES (
  (SELECT id FROM countries WHERE code='FR'),
  (SELECT id FROM categories WHERE slug='entertainment'),
  'Cozy Sticker Ville', '판매처: Philibert | 가격: 35,95 € | 평점: 5.0 | 리뷰: 2개', 'https://encrypted-tbn2.gstatic.com/shopping?q=tbn:ANd9GcSUShOOQbvonORPbB_41lpEpYK6xfz2ZgMwsox2TDvALKMR4R2WJXbn9ABqAESM33jYYsJo5pJn',
  100, 'rising',
  95, 85, 100, 75,
  ARRAY['Philibert','35,95 €','★5.0'], ARRAY['https://www.google.com/search?ibp=oshop&q=tendance jouets jeux gadgets 2026&prds=catalogid:16151655956958444928,headlineOfferDocid:9185521424813890652,imageDocid:15823093476635510358,rds:PC_15810201261812154125|PROD_PC_15810201261812154125,gpcid:15810201261812154125,mid:576462884639276924,pvt:hg&hl=fr&gl=fr&udm=28'],
  '2026-03-17T05:52:08.866748+00:00', '2026-03-17T05:52:08.866748+00:00'
);
INSERT INTO trends (country_id, category_id, name, description, image_url, heat_score, heat_status, search_score, social_score, ecommerce_score, news_score, tags, source_urls, first_detected_at, last_updated_at) VALUES (
  (SELECT id FROM countries WHERE code='FR'),
  (SELECT id FROM categories WHERE slug='entertainment'),
  'Coolzon Blocs de Construction Magnétiques, 154 Pièces Cubes Magnétiques, Ensemble de Blocs Magnétiques pour Construire de 3 à 10 Ans, Jouet Sensoriel', '판매처: Amazon.fr - Seller | 가격: 29,99 €', 'https://encrypted-tbn2.gstatic.com/shopping?q=tbn:ANd9GcT9wP_X_Rh1Mi8GMWoUmIhKFSKh6I5TXmnESdpv_KLaRfZcQEEWCawcFHMrrH7iYkSqZwsYFFqQ',
  87, 'steady',
  82, 72, 87, 62,
  ARRAY['Amazon.fr - Seller','29,99 €'], ARRAY['https://www.google.com/search?ibp=oshop&q=tendance jouets jeux gadgets 2026&prds=productid:12954674130986981400,headlineOfferDocid:12954674130986981400,imageDocid:4399891725220234814,pvt:hg&hl=fr&gl=fr&udm=28'],
  '2026-03-17T05:52:08.866748+00:00', '2026-03-17T05:52:08.866748+00:00'
);
INSERT INTO trends (country_id, category_id, name, description, image_url, heat_score, heat_status, search_score, social_score, ecommerce_score, news_score, tags, source_urls, first_detected_at, last_updated_at) VALUES (
  (SELECT id FROM countries WHERE code='FR'),
  (SELECT id FROM categories WHERE slug='entertainment'),
  'Jeux De Construction Cada La Station Essence Shell', '판매처: L''Armoire de Bébé | 가격: 89,90 € | 평점: 4.7 | 리뷰: 23개', 'https://encrypted-tbn1.gstatic.com/shopping?q=tbn:ANd9GcSDORzgIjZR2pbyRDQwQRkmqdAqVX-z9s9qj1_4h2wgjqQ37iyQuZ1hvrRJK_LY1NuR5Cn5HQb7',
  100, 'steady',
  95, 85, 100, 75,
  ARRAY['L''Armoire de Bébé','89,90 €','★4.7'], ARRAY['https://www.google.com/search?ibp=oshop&q=tendance jouets jeux gadgets 2026&prds=catalogid:5033677982548466088,headlineOfferDocid:1800680850631246726,imageDocid:6081429964862206065,rds:PC_6657706943783954517|PROD_PC_6657706943783954517,gpcid:6657706943783954517,mid:576462796791366697,pvt:hg&hl=fr&gl=fr&udm=28'],
  '2026-03-17T05:52:08.866748+00:00', '2026-03-17T05:52:08.866748+00:00'
);
INSERT INTO trends (country_id, category_id, name, description, image_url, heat_score, heat_status, search_score, social_score, ecommerce_score, news_score, tags, source_urls, first_detected_at, last_updated_at) VALUES (
  (SELECT id FROM countries WHERE code='FR'),
  (SELECT id FROM categories WHERE slug='entertainment'),
  'Petit Bloom Jeu des fruits', '판매처: Nature & Découvertes FR | 가격: 49,00 €', 'https://encrypted-tbn2.gstatic.com/shopping?q=tbn:ANd9GcTZrnyHK4IZi4tLpwtHdOZrilYArOLxOVslEAPvvGByv0EpVxAI-1R3qS2sMeDlVGW77okYv2nm',
  82, 'steady',
  77, 67, 82, 57,
  ARRAY['Nature & Découvertes FR','49,00 €'], ARRAY['https://www.google.com/search?ibp=oshop&q=tendance jouets jeux gadgets 2026&prds=catalogid:164734278930909167,headlineOfferDocid:4046916395326353021,imageDocid:9105133607648480666,gpcid:14396031813885934777,mid:576462865237122680,pvt:hg&hl=fr&gl=fr&udm=28'],
  '2026-03-17T05:52:08.866748+00:00', '2026-03-17T05:52:08.866748+00:00'
);
INSERT INTO trends (country_id, category_id, name, description, image_url, heat_score, heat_status, search_score, social_score, ecommerce_score, news_score, tags, source_urls, first_detected_at, last_updated_at) VALUES (
  (SELECT id FROM countries WHERE code='FR'),
  (SELECT id FROM categories WHERE slug='entertainment'),
  'Zig Zag Jeu du requin', '판매처: King Jouet | 가격: 22,99 €', 'https://encrypted-tbn0.gstatic.com/shopping?q=tbn:ANd9GcTiqhxZFS0QWrOMRuLdkQRXkKJuJI8lkFZ3v60tFMzz7tr-VJr1KdqSDuqaWXL02yiZ0y5SJG_0',
  80, 'steady',
  75, 65, 80, 55,
  ARRAY['King Jouet','22,99 €'], ARRAY['https://www.google.com/search?ibp=oshop&q=tendance jouets jeux gadgets 2026&prds=catalogid:1441792328994444520,headlineOfferDocid:16502514814452544195,imageDocid:12008180611241117088,gpcid:7079996568365058479,mid:576462497992023015,pvt:hg&hl=fr&gl=fr&udm=28'],
  '2026-03-17T05:52:08.866748+00:00', '2026-03-17T05:52:08.866748+00:00'
);
INSERT INTO trends (country_id, category_id, name, description, image_url, heat_score, heat_status, search_score, social_score, ecommerce_score, news_score, tags, source_urls, first_detected_at, last_updated_at) VALUES (
  (SELECT id FROM countries WHERE code='FR'),
  (SELECT id FROM categories WHERE slug='entertainment'),
  'Cubimana Ensemble Spatial Rotatif avec Lumière Kit de Construction D''exploration Spatiale Cadeau Enfants 8 +ans (554 Pièces)', '판매처: Cdiscount | 가격: 33,99 € | 평점: 5.0 | 리뷰: 1개', 'https://encrypted-tbn3.gstatic.com/shopping?q=tbn:ANd9GcQLpkJJ4wtfKxm_5_z4PjfayhqKsc6ZK6TDUT_FFXp9Irec5nN2HWR_vC8ZsWsqM-2ZmVLxbO4P',
  97, 'steady',
  92, 82, 97, 72,
  ARRAY['Cdiscount','33,99 €','★5.0'], ARRAY['https://www.google.com/search?ibp=oshop&q=tendance jouets jeux gadgets 2026&prds=productid:6322347768095727673,headlineOfferDocid:6322347768095727673,imageDocid:6638291420299867167,rds:PC_14599369509511731345|PROD_PC_14599369509511731345,pvt:hg&hl=fr&gl=fr&udm=28'],
  '2026-03-17T05:52:08.866748+00:00', '2026-03-17T05:52:08.866748+00:00'
);
INSERT INTO trends (country_id, category_id, name, description, image_url, heat_score, heat_status, search_score, social_score, ecommerce_score, news_score, tags, source_urls, first_detected_at, last_updated_at) VALUES (
  (SELECT id FROM countries WHERE code='FR'),
  (SELECT id FROM categories WHERE slug='entertainment'),
  'Trunki coffre à jouets plateau de Jeu TeeBee Turquoise', '판매처: Trunki FR | 가격: 24,99 € | 평점: 3.8 | 리뷰: 5개', 'https://encrypted-tbn3.gstatic.com/shopping?q=tbn:ANd9GcQqRUYrfFnGtTH3bgM-SE_HflZnifHHKlRdJ6YD823OGgfjIeeVN4mYK2ky6w4bEi2itc6rvDE',
  86, 'steady',
  81, 71, 86, 61,
  ARRAY['Trunki FR','24,99 €','★3.8'], ARRAY['https://www.google.com/search?ibp=oshop&q=tendance jouets jeux gadgets 2026&prds=catalogid:445443316765985560,headlineOfferDocid:15248210973135104231,imageDocid:7637363612079556799,rds:PC_7176446657483992399|PROD_PC_7176446657483992399,gpcid:7176446657483992399,mid:576462860144755606,pvt:hg&hl=fr&gl=fr&udm=28'],
  '2026-03-17T05:52:08.866748+00:00', '2026-03-17T05:52:08.866748+00:00'
);
INSERT INTO trends (country_id, category_id, name, description, image_url, heat_score, heat_status, search_score, social_score, ecommerce_score, news_score, tags, source_urls, first_detected_at, last_updated_at) VALUES (
  (SELECT id FROM countries WHERE code='FR'),
  (SELECT id FROM categories WHERE slug='entertainment'),
  'Pierres de l''Espace', '판매처: BCD Jeux | 가격: 8,90 € | 평점: 4.0 | 리뷰: 4개', 'https://encrypted-tbn3.gstatic.com/shopping?q=tbn:ANd9GcSwxqfGDVmLr7k4GyGtr3OryQbM-3G1x_XKxGFFSZZSGSuS4Tgpf0rw02XQPzOYBtE5-IfIm0w',
  85, 'steady',
  80, 70, 85, 60,
  ARRAY['BCD Jeux','8,90 €','★4.0'], ARRAY['https://www.google.com/search?ibp=oshop&q=tendance jouets jeux gadgets 2026&prds=catalogid:2471319597464899835,headlineOfferDocid:6048053267135081939,imageDocid:13264425320963486035,rds:PC_1786971361145055817|PROD_PC_1786971361145055817,gpcid:1786971361145055817,mid:576462674092740326,pvt:hg&hl=fr&gl=fr&udm=28'],
  '2026-03-17T05:52:08.866748+00:00', '2026-03-17T05:52:08.866748+00:00'
);
INSERT INTO trends (country_id, category_id, name, description, image_url, heat_score, heat_status, search_score, social_score, ecommerce_score, news_score, tags, source_urls, first_detected_at, last_updated_at) VALUES (
  (SELECT id FROM countries WHERE code='FR'),
  (SELECT id FROM categories WHERE slug='entertainment'),
  'Jouet Fille 3-8 ans, jeux Educatif 3-8 ans Cadeau Fille 3-8 ans jouet enfant', '판매처: Amazon.fr - Seller | 가격: 15,99 €', 'https://encrypted-tbn3.gstatic.com/shopping?q=tbn:ANd9GcTEvRJRPptcwCFBrw5GG6IJYOGXGttmwlrT1-0jrf97SHnRg7mPabX8DzFxOA',
  70, 'steady',
  65, 55, 70, 45,
  ARRAY['Amazon.fr - Seller','15,99 €'], ARRAY['https://www.google.com/search?ibp=oshop&q=tendance jouets jeux gadgets 2026&prds=catalogid:9060077410704066604,headlineOfferDocid:11102038393831450151,imageDocid:2103518739784132379,gpcid:2474038037758096893,mid:576462865750532192,pvt:hg&hl=fr&gl=fr&udm=28'],
  '2026-03-17T05:52:08.866748+00:00', '2026-03-17T05:52:08.866748+00:00'
);
INSERT INTO trends (country_id, category_id, name, description, image_url, heat_score, heat_status, search_score, social_score, ecommerce_score, news_score, tags, source_urls, first_detected_at, last_updated_at) VALUES (
  (SELECT id FROM countries WHERE code='FR'),
  (SELECT id FROM categories WHERE slug='entertainment'),
  'SmartGames Chute Libre', '판매처: La Grande Récré | 가격: 24,99 € | 평점: 4.5 | 리뷰: 35개', 'https://encrypted-tbn0.gstatic.com/shopping?q=tbn:ANd9GcTINeJ2Eeku6IHXMSsGiICvYRYWIRCskIQqBM2PKyRZ4cPr6Z-mgoLscHQF2_vGUNkwTUXAhb2a',
  90, 'steady',
  85, 75, 90, 65,
  ARRAY['La Grande Récré','24,99 €','★4.5'], ARRAY['https://www.google.com/search?ibp=oshop&q=tendance jouets jeux gadgets 2026&prds=catalogid:1783786812084431450,headlineOfferDocid:2714442913315598986,imageDocid:11082305286583502628,rds:PC_3147121276301941652|PROD_PC_3147121276301941652,gpcid:3147121276301941652,mid:576462807635153472,pvt:hg&hl=fr&gl=fr&udm=28'],
  '2026-03-17T05:52:08.866748+00:00', '2026-03-17T05:52:08.866748+00:00'
);
INSERT INTO trends (country_id, category_id, name, description, image_url, heat_score, heat_status, search_score, social_score, ecommerce_score, news_score, tags, source_urls, first_detected_at, last_updated_at) VALUES (
  (SELECT id FROM countries WHERE code='FR'),
  (SELECT id FROM categories WHERE slug='entertainment'),
  'Jeu d’habileté Comansi', '판매처: Carrefour | 가격: 16,26 €', 'https://encrypted-tbn0.gstatic.com/shopping?q=tbn:ANd9GcQ2u-zk548lqP9HJaGRjoaEaspOmeZIjdLvOhh9XcYLuXvt7wo91sCVhr4K-Bof8TKGzXKpr1A',
  65, 'steady',
  60, 50, 65, 40,
  ARRAY['Carrefour','16,26 €'], ARRAY['https://www.google.com/search?ibp=oshop&q=tendance jouets jeux gadgets 2026&prds=catalogid:5378467905469252494,headlineOfferDocid:10547389317829992015,imageDocid:1976284512125613772,gpcid:15168713905895748952,mid:576462827956706383,pvt:hg&hl=fr&gl=fr&udm=28'],
  '2026-03-17T05:52:08.866748+00:00', '2026-03-17T05:52:08.866748+00:00'
);