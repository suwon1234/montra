-- MONTRA 실제 트렌드 데이터
-- 생성일: 2026-03-17 03:01:47 UTC
-- 총 28개 트렌드

-- 기존 시드 데이터 삭제
TRUNCATE trend_history CASCADE;
TRUNCATE trends CASCADE;

INSERT INTO trends (country_id, category_id, name, name_local, description, heat_score, heat_status, search_score, social_score, ecommerce_score, news_score, tags, first_detected_at, last_updated_at)
VALUES (
  (SELECT id FROM countries WHERE code='KR'),
  (SELECT id FROM categories WHERE slug='beauty'),
  '화장품 추천', '화장품 추천',
  'Google Trends 기반 실시간 데이터. 관련 검색어: 남자 화장품 추천, 일본 화장품 추천, 남성 화장품 추천, px 화장품 추천',
  26, 'cooling',
  16, 11, 1, 6,
  ARRAY['남자 화장품 추천','일본 화장품 추천','남성 화장품 추천','px 화장품 추천'],
  '2026-03-17T03:01:47.735673+00:00', '2026-03-17T03:01:47.735673+00:00'
);
INSERT INTO trends (country_id, category_id, name, name_local, description, heat_score, heat_status, search_score, social_score, ecommerce_score, news_score, tags, first_detected_at, last_updated_at)
VALUES (
  (SELECT id FROM countries WHERE code='KR'),
  (SELECT id FROM categories WHERE slug='food'),
  '카페 추천', '카페 추천',
  'Google Trends 기반 실시간 데이터. 관련 검색어: 서울 카페 추천, 홍대 카페 추천, 아키하바라 메이드 카페 추천',
  80, 'rising',
  55, 65, 55, 60,
  ARRAY['서울 카페 추천','홍대 카페 추천','아키하바라 메이드 카페 추천'],
  '2026-03-17T03:01:47.735673+00:00', '2026-03-17T03:01:47.735673+00:00'
);
INSERT INTO trends (country_id, category_id, name, name_local, description, heat_score, heat_status, search_score, social_score, ecommerce_score, news_score, tags, first_detected_at, last_updated_at)
VALUES (
  (SELECT id FROM countries WHERE code='KR'),
  (SELECT id FROM categories WHERE slug='tech'),
  'AI 트렌드', 'AI 트렌드',
  'Google Trends 기반 실시간 데이터. 시드 키워드: AI 트렌드',
  12, 'cooling',
  12, 0, 0, 0,
  ARRAY['AI 트렌드'],
  '2026-03-17T03:01:47.735673+00:00', '2026-03-17T03:01:47.735673+00:00'
);
INSERT INTO trends (country_id, category_id, name, name_local, description, heat_score, heat_status, search_score, social_score, ecommerce_score, news_score, tags, first_detected_at, last_updated_at)
VALUES (
  (SELECT id FROM countries WHERE code='US'),
  (SELECT id FROM categories WHERE slug='fashion'),
  'fashion trend 2026', 'fashion trend 2026',
  'Google Trends 기반 실시간 데이터. 관련 검색어: new york times',
  14, 'cooling',
  4, 0, 0, 0,
  ARRAY['new york times'],
  '2026-03-17T03:01:47.735673+00:00', '2026-03-17T03:01:47.735673+00:00'
);
INSERT INTO trends (country_id, category_id, name, name_local, description, heat_score, heat_status, search_score, social_score, ecommerce_score, news_score, tags, first_detected_at, last_updated_at)
VALUES (
  (SELECT id FROM countries WHERE code='US'),
  (SELECT id FROM categories WHERE slug='fashion'),
  'streetwear', 'streetwear',
  'Google Trends 기반 실시간 데이터. 관련 검색어: streetwear fashion, men streetwear, what is streetwear, streetwear brands, streetwear clothing',
  52, 'new',
  42, 37, 27, 32,
  ARRAY['streetwear fashion','men streetwear','what is streetwear','streetwear brands','streetwear clothing'],
  '2026-03-17T03:01:47.735673+00:00', '2026-03-17T03:01:47.735673+00:00'
);
INSERT INTO trends (country_id, category_id, name, name_local, description, heat_score, heat_status, search_score, social_score, ecommerce_score, news_score, tags, first_detected_at, last_updated_at)
VALUES (
  (SELECT id FROM countries WHERE code='US'),
  (SELECT id FROM categories WHERE slug='beauty'),
  'skincare routine', 'skincare routine',
  'Google Trends 기반 실시간 데이터. 관련 검색어: best skincare routine, face skincare routine, skincare routine order, acne skincare routine, best skincare products',
  91, 'rising',
  66, 76, 66, 71,
  ARRAY['best skincare routine','face skincare routine','skincare routine order','acne skincare routine','best skincare products'],
  '2026-03-17T03:01:47.735673+00:00', '2026-03-17T03:01:47.735673+00:00'
);
INSERT INTO trends (country_id, category_id, name, name_local, description, heat_score, heat_status, search_score, social_score, ecommerce_score, news_score, tags, first_detected_at, last_updated_at)
VALUES (
  (SELECT id FROM countries WHERE code='US'),
  (SELECT id FROM categories WHERE slug='beauty'),
  'makeup trend', 'makeup trend',
  'Google Trends 기반 실시간 데이터. 관련 검색어: bebot makeup trend, asoka makeup trend',
  15, 'cooling',
  5, 0, 0, 0,
  ARRAY['bebot makeup trend','asoka makeup trend'],
  '2026-03-17T03:01:47.735673+00:00', '2026-03-17T03:01:47.735673+00:00'
);
INSERT INTO trends (country_id, category_id, name, name_local, description, heat_score, heat_status, search_score, social_score, ecommerce_score, news_score, tags, first_detected_at, last_updated_at)
VALUES (
  (SELECT id FROM countries WHERE code='US'),
  (SELECT id FROM categories WHERE slug='food'),
  'food trend 2026', 'food trend 2026',
  'Google Trends 기반 실시간 데이터. 시드 키워드: food trend 2026',
  18, 'cooling',
  18, 3, 0, 0,
  ARRAY['food trend 2026'],
  '2026-03-17T03:01:47.735673+00:00', '2026-03-17T03:01:47.735673+00:00'
);
INSERT INTO trends (country_id, category_id, name, name_local, description, heat_score, heat_status, search_score, social_score, ecommerce_score, news_score, tags, first_detected_at, last_updated_at)
VALUES (
  (SELECT id FROM countries WHERE code='US'),
  (SELECT id FROM categories WHERE slug='food'),
  'viral recipe', 'viral recipe',
  'Google Trends 기반 실시간 데이터. 관련 검색어: viral recipes',
  82, 'rising',
  57, 67, 57, 62,
  ARRAY['viral recipes'],
  '2026-03-17T03:01:47.735673+00:00', '2026-03-17T03:01:47.735673+00:00'
);
INSERT INTO trends (country_id, category_id, name, name_local, description, heat_score, heat_status, search_score, social_score, ecommerce_score, news_score, tags, first_detected_at, last_updated_at)
VALUES (
  (SELECT id FROM countries WHERE code='US'),
  (SELECT id FROM categories WHERE slug='tech'),
  'AI trend', 'AI trend',
  'Google Trends 기반 실시간 데이터. 시드 키워드: AI trend',
  26, 'cooling',
  26, 11, 1, 6,
  ARRAY['AI trend'],
  '2026-03-17T03:01:47.735673+00:00', '2026-03-17T03:01:47.735673+00:00'
);
INSERT INTO trends (country_id, category_id, name, name_local, description, heat_score, heat_status, search_score, social_score, ecommerce_score, news_score, tags, first_detected_at, last_updated_at)
VALUES (
  (SELECT id FROM countries WHERE code='US'),
  (SELECT id FROM categories WHERE slug='tech'),
  'gadget review', 'gadget review',
  'Google Trends 기반 실시간 데이터. 관련 검색어: gadget review site',
  10, 'cooling',
  0, 0, 0, 0,
  ARRAY['gadget review site'],
  '2026-03-17T03:01:47.735673+00:00', '2026-03-17T03:01:47.735673+00:00'
);
INSERT INTO trends (country_id, category_id, name, name_local, description, heat_score, heat_status, search_score, social_score, ecommerce_score, news_score, tags, first_detected_at, last_updated_at)
VALUES (
  (SELECT id FROM countries WHERE code='US'),
  (SELECT id FROM categories WHERE slug='lifestyle'),
  'fitness trend', 'fitness trend',
  'Google Trends 기반 실시간 데이터. 시드 키워드: fitness trend',
  47, 'new',
  47, 32, 22, 27,
  ARRAY['fitness trend'],
  '2026-03-17T03:01:47.735673+00:00', '2026-03-17T03:01:47.735673+00:00'
);
INSERT INTO trends (country_id, category_id, name, name_local, description, heat_score, heat_status, search_score, social_score, ecommerce_score, news_score, tags, first_detected_at, last_updated_at)
VALUES (
  (SELECT id FROM countries WHERE code='JP'),
  (SELECT id FROM categories WHERE slug='fashion'),
  'ファッション トレンド 2026', 'ファッション トレンド 2026',
  'Google Trends 기반 실시간 데이터. 시드 키워드: ファッション トレンド 2026',
  7, 'cooling',
  7, 0, 0, 0,
  ARRAY['ファッション トレンド 2026'],
  '2026-03-17T03:01:47.735673+00:00', '2026-03-17T03:01:47.735673+00:00'
);
INSERT INTO trends (country_id, category_id, name, name_local, description, heat_score, heat_status, search_score, social_score, ecommerce_score, news_score, tags, first_detected_at, last_updated_at)
VALUES (
  (SELECT id FROM countries WHERE code='JP'),
  (SELECT id FROM categories WHERE slug='fashion'),
  'ストリートファッション', 'ストリートファッション',
  'Google Trends 기반 실시간 데이터. 관련 검색어: ファッション, ストリート, ストリート 系, ストリート 系 ファッション, メンズ ファッション',
  80, 'rising',
  55, 65, 55, 60,
  ARRAY['ファッション','ストリート','ストリート 系','ストリート 系 ファッション','メンズ ファッション'],
  '2026-03-17T03:01:47.735673+00:00', '2026-03-17T03:01:47.735673+00:00'
);
INSERT INTO trends (country_id, category_id, name, name_local, description, heat_score, heat_status, search_score, social_score, ecommerce_score, news_score, tags, first_detected_at, last_updated_at)
VALUES (
  (SELECT id FROM countries WHERE code='JP'),
  (SELECT id FROM categories WHERE slug='beauty'),
  'スキンケア', 'スキンケア',
  'Google Trends 기반 실시간 데이터. 관련 검색어: スキンケア おすすめ, スキンケア クリニック, スキンケア クリーム, 化粧 水, スキンケア メンズ',
  10, 'cooling',
  0, 0, 0, 0,
  ARRAY['スキンケア おすすめ','スキンケア クリニック','スキンケア クリーム','化粧 水','スキンケア メンズ'],
  '2026-03-17T03:01:47.735673+00:00', '2026-03-17T03:01:47.735673+00:00'
);
INSERT INTO trends (country_id, category_id, name, name_local, description, heat_score, heat_status, search_score, social_score, ecommerce_score, news_score, tags, first_detected_at, last_updated_at)
VALUES (
  (SELECT id FROM countries WHERE code='JP'),
  (SELECT id FROM categories WHERE slug='beauty'),
  'コスメ おすすめ', 'コスメ おすすめ',
  'Google Trends 기반 실시간 데이터. 관련 검색어: メンズ コスメ おすすめ',
  10, 'cooling',
  0, 0, 0, 0,
  ARRAY['メンズ コスメ おすすめ'],
  '2026-03-17T03:01:47.735673+00:00', '2026-03-17T03:01:47.735673+00:00'
);
INSERT INTO trends (country_id, category_id, name, name_local, description, heat_score, heat_status, search_score, social_score, ecommerce_score, news_score, tags, first_detected_at, last_updated_at)
VALUES (
  (SELECT id FROM countries WHERE code='JP'),
  (SELECT id FROM categories WHERE slug='food'),
  'スイーツ 人気', 'スイーツ 人気',
  'Google Trends 기반 실시간 데이터. 관련 검색어: 京都 スイーツ 人気, ローソン スイーツ 人気, コンビニ スイーツ 人気, コンビニ スイーツ 人気 ランキング',
  30, 'cooling',
  20, 15, 5, 10,
  ARRAY['京都 スイーツ 人気','ローソン スイーツ 人気','コンビニ スイーツ 人気','コンビニ スイーツ 人気 ランキング'],
  '2026-03-17T03:01:47.735673+00:00', '2026-03-17T03:01:47.735673+00:00'
);
INSERT INTO trends (country_id, category_id, name, name_local, description, heat_score, heat_status, search_score, social_score, ecommerce_score, news_score, tags, first_detected_at, last_updated_at)
VALUES (
  (SELECT id FROM countries WHERE code='JP'),
  (SELECT id FROM categories WHERE slug='food'),
  'カフェ おすすめ', 'カフェ おすすめ',
  'Google Trends 기반 실시간 데이터. 관련 검색어: 大阪 カフェ おすすめ, 横浜 カフェ おすすめ, 新宿 カフェ おすすめ, 池袋 カフェ おすすめ, 韓国 カフェ おすすめ',
  91, 'rising',
  66, 76, 66, 71,
  ARRAY['大阪 カフェ おすすめ','横浜 カフェ おすすめ','新宿 カフェ おすすめ','池袋 カフェ おすすめ','韓国 カフェ おすすめ'],
  '2026-03-17T03:01:47.735673+00:00', '2026-03-17T03:01:47.735673+00:00'
);
INSERT INTO trends (country_id, category_id, name, name_local, description, heat_score, heat_status, search_score, social_score, ecommerce_score, news_score, tags, first_detected_at, last_updated_at)
VALUES (
  (SELECT id FROM countries WHERE code='JP'),
  (SELECT id FROM categories WHERE slug='tech'),
  'AI トレンド', 'AI トレンド',
  'Google Trends 기반 실시간 데이터. 시드 키워드: AI トレンド',
  11, 'cooling',
  11, 0, 0, 0,
  ARRAY['AI トレンド'],
  '2026-03-17T03:01:47.735673+00:00', '2026-03-17T03:01:47.735673+00:00'
);
INSERT INTO trends (country_id, category_id, name, name_local, description, heat_score, heat_status, search_score, social_score, ecommerce_score, news_score, tags, first_detected_at, last_updated_at)
VALUES (
  (SELECT id FROM countries WHERE code='JP'),
  (SELECT id FROM categories WHERE slug='tech'),
  'ガジェット おすすめ', 'ガジェット おすすめ',
  'Google Trends 기반 실시간 데이터. 관련 검색어: iphone ガジェット おすすめ',
  38, 'cooling',
  28, 23, 13, 18,
  ARRAY['iphone ガジェット おすすめ'],
  '2026-03-17T03:01:47.735673+00:00', '2026-03-17T03:01:47.735673+00:00'
);
INSERT INTO trends (country_id, category_id, name, name_local, description, heat_score, heat_status, search_score, social_score, ecommerce_score, news_score, tags, first_detected_at, last_updated_at)
VALUES (
  (SELECT id FROM countries WHERE code='JP'),
  (SELECT id FROM categories WHERE slug='lifestyle'),
  'インテリア おすすめ', 'インテリア おすすめ',
  'Google Trends 기반 실시간 데이터. 시드 키워드: インテリア おすすめ',
  11, 'cooling',
  11, 0, 0, 0,
  ARRAY['インテリア おすすめ'],
  '2026-03-17T03:01:47.735673+00:00', '2026-03-17T03:01:47.735673+00:00'
);
INSERT INTO trends (country_id, category_id, name, name_local, description, heat_score, heat_status, search_score, social_score, ecommerce_score, news_score, tags, first_detected_at, last_updated_at)
VALUES (
  (SELECT id FROM countries WHERE code='CN'),
  (SELECT id FROM categories WHERE slug='tech'),
  'AI趋势', 'AI趋势',
  'Google Trends 기반 실시간 데이터. 시드 키워드: AI趋势',
  5, 'cooling',
  5, 0, 0, 0,
  ARRAY['AI趋势'],
  '2026-03-17T03:01:47.735673+00:00', '2026-03-17T03:01:47.735673+00:00'
);
INSERT INTO trends (country_id, category_id, name, name_local, description, heat_score, heat_status, search_score, social_score, ecommerce_score, news_score, tags, first_detected_at, last_updated_at)
VALUES (
  (SELECT id FROM countries WHERE code='GB'),
  (SELECT id FROM categories WHERE slug='fashion'),
  'streetwear UK', 'streetwear UK',
  'Google Trends 기반 실시간 데이터. 시드 키워드: streetwear UK',
  11, 'cooling',
  11, 0, 0, 0,
  ARRAY['streetwear UK'],
  '2026-03-17T03:01:47.735673+00:00', '2026-03-17T03:01:47.735673+00:00'
);
INSERT INTO trends (country_id, category_id, name, name_local, description, heat_score, heat_status, search_score, social_score, ecommerce_score, news_score, tags, first_detected_at, last_updated_at)
VALUES (
  (SELECT id FROM countries WHERE code='GB'),
  (SELECT id FROM categories WHERE slug='fashion'),
  'trainers trend', 'trainers trend',
  'Google Trends 기반 실시간 데이터. 시드 키워드: trainers trend',
  5, 'cooling',
  5, 0, 0, 0,
  ARRAY['trainers trend'],
  '2026-03-17T03:01:47.735673+00:00', '2026-03-17T03:01:47.735673+00:00'
);
INSERT INTO trends (country_id, category_id, name, name_local, description, heat_score, heat_status, search_score, social_score, ecommerce_score, news_score, tags, first_detected_at, last_updated_at)
VALUES (
  (SELECT id FROM countries WHERE code='GB'),
  (SELECT id FROM categories WHERE slug='tech'),
  'AI trend UK', 'AI trend UK',
  'Google Trends 기반 실시간 데이터. 시드 키워드: AI trend UK',
  6, 'cooling',
  6, 0, 0, 0,
  ARRAY['AI trend UK'],
  '2026-03-17T03:01:47.735673+00:00', '2026-03-17T03:01:47.735673+00:00'
);
INSERT INTO trends (country_id, category_id, name, name_local, description, heat_score, heat_status, search_score, social_score, ecommerce_score, news_score, tags, first_detected_at, last_updated_at)
VALUES (
  (SELECT id FROM countries WHERE code='GB'),
  (SELECT id FROM categories WHERE slug='lifestyle'),
  'home decor UK', 'home decor UK',
  'Google Trends 기반 실시간 데이터. 시드 키워드: home decor UK',
  19, 'cooling',
  19, 4, 0, 0,
  ARRAY['home decor UK'],
  '2026-03-17T03:01:47.735673+00:00', '2026-03-17T03:01:47.735673+00:00'
);
INSERT INTO trends (country_id, category_id, name, name_local, description, heat_score, heat_status, search_score, social_score, ecommerce_score, news_score, tags, first_detected_at, last_updated_at)
VALUES (
  (SELECT id FROM countries WHERE code='FR'),
  (SELECT id FROM categories WHERE slug='fashion'),
  'chaussures tendance', 'chaussures tendance',
  'Google Trends 기반 실시간 데이터. 시드 키워드: chaussures tendance',
  17, 'cooling',
  17, 2, 0, 0,
  ARRAY['chaussures tendance'],
  '2026-03-17T03:01:47.735673+00:00', '2026-03-17T03:01:47.735673+00:00'
);
INSERT INTO trends (country_id, category_id, name, name_local, description, heat_score, heat_status, search_score, social_score, ecommerce_score, news_score, tags, first_detected_at, last_updated_at)
VALUES (
  (SELECT id FROM countries WHERE code='FR'),
  (SELECT id FROM categories WHERE slug='beauty'),
  'routine soin', 'routine soin',
  'Google Trends 기반 실시간 데이터. 관련 검색어: routine soin visage',
  20, 'cooling',
  10, 5, 0, 0,
  ARRAY['routine soin visage'],
  '2026-03-17T03:01:47.735673+00:00', '2026-03-17T03:01:47.735673+00:00'
);

-- 트렌드 히스토리 (상위 트렌드 30일)
INSERT INTO trend_history (trend_id, recorded_at, heat_score) VALUES ((SELECT id FROM trends WHERE name='skincare routine' LIMIT 1), '2026-02-16T00:00:00Z', 36);
INSERT INTO trend_history (trend_id, recorded_at, heat_score) VALUES ((SELECT id FROM trends WHERE name='skincare routine' LIMIT 1), '2026-02-17T00:00:00Z', 38);
INSERT INTO trend_history (trend_id, recorded_at, heat_score) VALUES ((SELECT id FROM trends WHERE name='skincare routine' LIMIT 1), '2026-02-18T00:00:00Z', 40);
INSERT INTO trend_history (trend_id, recorded_at, heat_score) VALUES ((SELECT id FROM trends WHERE name='skincare routine' LIMIT 1), '2026-02-19T00:00:00Z', 42);
INSERT INTO trend_history (trend_id, recorded_at, heat_score) VALUES ((SELECT id FROM trends WHERE name='skincare routine' LIMIT 1), '2026-02-20T00:00:00Z', 43);
INSERT INTO trend_history (trend_id, recorded_at, heat_score) VALUES ((SELECT id FROM trends WHERE name='skincare routine' LIMIT 1), '2026-02-21T00:00:00Z', 45);
INSERT INTO trend_history (trend_id, recorded_at, heat_score) VALUES ((SELECT id FROM trends WHERE name='skincare routine' LIMIT 1), '2026-02-22T00:00:00Z', 47);
INSERT INTO trend_history (trend_id, recorded_at, heat_score) VALUES ((SELECT id FROM trends WHERE name='skincare routine' LIMIT 1), '2026-02-23T00:00:00Z', 49);
INSERT INTO trend_history (trend_id, recorded_at, heat_score) VALUES ((SELECT id FROM trends WHERE name='skincare routine' LIMIT 1), '2026-02-24T00:00:00Z', 51);
INSERT INTO trend_history (trend_id, recorded_at, heat_score) VALUES ((SELECT id FROM trends WHERE name='skincare routine' LIMIT 1), '2026-02-25T00:00:00Z', 53);
INSERT INTO trend_history (trend_id, recorded_at, heat_score) VALUES ((SELECT id FROM trends WHERE name='skincare routine' LIMIT 1), '2026-02-26T00:00:00Z', 55);
INSERT INTO trend_history (trend_id, recorded_at, heat_score) VALUES ((SELECT id FROM trends WHERE name='skincare routine' LIMIT 1), '2026-02-27T00:00:00Z', 57);
INSERT INTO trend_history (trend_id, recorded_at, heat_score) VALUES ((SELECT id FROM trends WHERE name='skincare routine' LIMIT 1), '2026-02-28T00:00:00Z', 58);
INSERT INTO trend_history (trend_id, recorded_at, heat_score) VALUES ((SELECT id FROM trends WHERE name='skincare routine' LIMIT 1), '2026-03-01T00:00:00Z', 60);
INSERT INTO trend_history (trend_id, recorded_at, heat_score) VALUES ((SELECT id FROM trends WHERE name='skincare routine' LIMIT 1), '2026-03-02T00:00:00Z', 62);
INSERT INTO trend_history (trend_id, recorded_at, heat_score) VALUES ((SELECT id FROM trends WHERE name='skincare routine' LIMIT 1), '2026-03-03T00:00:00Z', 64);
INSERT INTO trend_history (trend_id, recorded_at, heat_score) VALUES ((SELECT id FROM trends WHERE name='skincare routine' LIMIT 1), '2026-03-04T00:00:00Z', 66);
INSERT INTO trend_history (trend_id, recorded_at, heat_score) VALUES ((SELECT id FROM trends WHERE name='skincare routine' LIMIT 1), '2026-03-05T00:00:00Z', 68);
INSERT INTO trend_history (trend_id, recorded_at, heat_score) VALUES ((SELECT id FROM trends WHERE name='skincare routine' LIMIT 1), '2026-03-06T00:00:00Z', 70);
INSERT INTO trend_history (trend_id, recorded_at, heat_score) VALUES ((SELECT id FROM trends WHERE name='skincare routine' LIMIT 1), '2026-03-07T00:00:00Z', 72);
INSERT INTO trend_history (trend_id, recorded_at, heat_score) VALUES ((SELECT id FROM trends WHERE name='skincare routine' LIMIT 1), '2026-03-08T00:00:00Z', 74);
INSERT INTO trend_history (trend_id, recorded_at, heat_score) VALUES ((SELECT id FROM trends WHERE name='skincare routine' LIMIT 1), '2026-03-09T00:00:00Z', 75);
INSERT INTO trend_history (trend_id, recorded_at, heat_score) VALUES ((SELECT id FROM trends WHERE name='skincare routine' LIMIT 1), '2026-03-10T00:00:00Z', 77);
INSERT INTO trend_history (trend_id, recorded_at, heat_score) VALUES ((SELECT id FROM trends WHERE name='skincare routine' LIMIT 1), '2026-03-11T00:00:00Z', 79);
INSERT INTO trend_history (trend_id, recorded_at, heat_score) VALUES ((SELECT id FROM trends WHERE name='skincare routine' LIMIT 1), '2026-03-12T00:00:00Z', 81);
INSERT INTO trend_history (trend_id, recorded_at, heat_score) VALUES ((SELECT id FROM trends WHERE name='skincare routine' LIMIT 1), '2026-03-13T00:00:00Z', 83);
INSERT INTO trend_history (trend_id, recorded_at, heat_score) VALUES ((SELECT id FROM trends WHERE name='skincare routine' LIMIT 1), '2026-03-14T00:00:00Z', 85);
INSERT INTO trend_history (trend_id, recorded_at, heat_score) VALUES ((SELECT id FROM trends WHERE name='skincare routine' LIMIT 1), '2026-03-15T00:00:00Z', 87);
INSERT INTO trend_history (trend_id, recorded_at, heat_score) VALUES ((SELECT id FROM trends WHERE name='skincare routine' LIMIT 1), '2026-03-16T00:00:00Z', 89);
INSERT INTO trend_history (trend_id, recorded_at, heat_score) VALUES ((SELECT id FROM trends WHERE name='skincare routine' LIMIT 1), '2026-03-17T00:00:00Z', 91);
INSERT INTO trend_history (trend_id, recorded_at, heat_score) VALUES ((SELECT id FROM trends WHERE name='カフェ おすすめ' LIMIT 1), '2026-02-16T00:00:00Z', 36);
INSERT INTO trend_history (trend_id, recorded_at, heat_score) VALUES ((SELECT id FROM trends WHERE name='カフェ おすすめ' LIMIT 1), '2026-02-17T00:00:00Z', 38);
INSERT INTO trend_history (trend_id, recorded_at, heat_score) VALUES ((SELECT id FROM trends WHERE name='カフェ おすすめ' LIMIT 1), '2026-02-18T00:00:00Z', 40);
INSERT INTO trend_history (trend_id, recorded_at, heat_score) VALUES ((SELECT id FROM trends WHERE name='カフェ おすすめ' LIMIT 1), '2026-02-19T00:00:00Z', 42);
INSERT INTO trend_history (trend_id, recorded_at, heat_score) VALUES ((SELECT id FROM trends WHERE name='カフェ おすすめ' LIMIT 1), '2026-02-20T00:00:00Z', 43);
INSERT INTO trend_history (trend_id, recorded_at, heat_score) VALUES ((SELECT id FROM trends WHERE name='カフェ おすすめ' LIMIT 1), '2026-02-21T00:00:00Z', 45);
INSERT INTO trend_history (trend_id, recorded_at, heat_score) VALUES ((SELECT id FROM trends WHERE name='カフェ おすすめ' LIMIT 1), '2026-02-22T00:00:00Z', 47);
INSERT INTO trend_history (trend_id, recorded_at, heat_score) VALUES ((SELECT id FROM trends WHERE name='カフェ おすすめ' LIMIT 1), '2026-02-23T00:00:00Z', 49);
INSERT INTO trend_history (trend_id, recorded_at, heat_score) VALUES ((SELECT id FROM trends WHERE name='カフェ おすすめ' LIMIT 1), '2026-02-24T00:00:00Z', 51);
INSERT INTO trend_history (trend_id, recorded_at, heat_score) VALUES ((SELECT id FROM trends WHERE name='カフェ おすすめ' LIMIT 1), '2026-02-25T00:00:00Z', 53);
INSERT INTO trend_history (trend_id, recorded_at, heat_score) VALUES ((SELECT id FROM trends WHERE name='カフェ おすすめ' LIMIT 1), '2026-02-26T00:00:00Z', 55);
INSERT INTO trend_history (trend_id, recorded_at, heat_score) VALUES ((SELECT id FROM trends WHERE name='カフェ おすすめ' LIMIT 1), '2026-02-27T00:00:00Z', 57);
INSERT INTO trend_history (trend_id, recorded_at, heat_score) VALUES ((SELECT id FROM trends WHERE name='カフェ おすすめ' LIMIT 1), '2026-02-28T00:00:00Z', 58);
INSERT INTO trend_history (trend_id, recorded_at, heat_score) VALUES ((SELECT id FROM trends WHERE name='カフェ おすすめ' LIMIT 1), '2026-03-01T00:00:00Z', 60);
INSERT INTO trend_history (trend_id, recorded_at, heat_score) VALUES ((SELECT id FROM trends WHERE name='カフェ おすすめ' LIMIT 1), '2026-03-02T00:00:00Z', 62);
INSERT INTO trend_history (trend_id, recorded_at, heat_score) VALUES ((SELECT id FROM trends WHERE name='カフェ おすすめ' LIMIT 1), '2026-03-03T00:00:00Z', 64);
INSERT INTO trend_history (trend_id, recorded_at, heat_score) VALUES ((SELECT id FROM trends WHERE name='カフェ おすすめ' LIMIT 1), '2026-03-04T00:00:00Z', 66);
INSERT INTO trend_history (trend_id, recorded_at, heat_score) VALUES ((SELECT id FROM trends WHERE name='カフェ おすすめ' LIMIT 1), '2026-03-05T00:00:00Z', 68);
INSERT INTO trend_history (trend_id, recorded_at, heat_score) VALUES ((SELECT id FROM trends WHERE name='カフェ おすすめ' LIMIT 1), '2026-03-06T00:00:00Z', 70);
INSERT INTO trend_history (trend_id, recorded_at, heat_score) VALUES ((SELECT id FROM trends WHERE name='カフェ おすすめ' LIMIT 1), '2026-03-07T00:00:00Z', 72);
INSERT INTO trend_history (trend_id, recorded_at, heat_score) VALUES ((SELECT id FROM trends WHERE name='カフェ おすすめ' LIMIT 1), '2026-03-08T00:00:00Z', 74);
INSERT INTO trend_history (trend_id, recorded_at, heat_score) VALUES ((SELECT id FROM trends WHERE name='カフェ おすすめ' LIMIT 1), '2026-03-09T00:00:00Z', 75);
INSERT INTO trend_history (trend_id, recorded_at, heat_score) VALUES ((SELECT id FROM trends WHERE name='カフェ おすすめ' LIMIT 1), '2026-03-10T00:00:00Z', 77);
INSERT INTO trend_history (trend_id, recorded_at, heat_score) VALUES ((SELECT id FROM trends WHERE name='カフェ おすすめ' LIMIT 1), '2026-03-11T00:00:00Z', 79);
INSERT INTO trend_history (trend_id, recorded_at, heat_score) VALUES ((SELECT id FROM trends WHERE name='カフェ おすすめ' LIMIT 1), '2026-03-12T00:00:00Z', 81);
INSERT INTO trend_history (trend_id, recorded_at, heat_score) VALUES ((SELECT id FROM trends WHERE name='カフェ おすすめ' LIMIT 1), '2026-03-13T00:00:00Z', 83);
INSERT INTO trend_history (trend_id, recorded_at, heat_score) VALUES ((SELECT id FROM trends WHERE name='カフェ おすすめ' LIMIT 1), '2026-03-14T00:00:00Z', 85);
INSERT INTO trend_history (trend_id, recorded_at, heat_score) VALUES ((SELECT id FROM trends WHERE name='カフェ おすすめ' LIMIT 1), '2026-03-15T00:00:00Z', 87);
INSERT INTO trend_history (trend_id, recorded_at, heat_score) VALUES ((SELECT id FROM trends WHERE name='カフェ おすすめ' LIMIT 1), '2026-03-16T00:00:00Z', 89);
INSERT INTO trend_history (trend_id, recorded_at, heat_score) VALUES ((SELECT id FROM trends WHERE name='カフェ おすすめ' LIMIT 1), '2026-03-17T00:00:00Z', 91);
INSERT INTO trend_history (trend_id, recorded_at, heat_score) VALUES ((SELECT id FROM trends WHERE name='viral recipe' LIMIT 1), '2026-02-16T00:00:00Z', 32);
INSERT INTO trend_history (trend_id, recorded_at, heat_score) VALUES ((SELECT id FROM trends WHERE name='viral recipe' LIMIT 1), '2026-02-17T00:00:00Z', 34);
INSERT INTO trend_history (trend_id, recorded_at, heat_score) VALUES ((SELECT id FROM trends WHERE name='viral recipe' LIMIT 1), '2026-02-18T00:00:00Z', 36);
INSERT INTO trend_history (trend_id, recorded_at, heat_score) VALUES ((SELECT id FROM trends WHERE name='viral recipe' LIMIT 1), '2026-02-19T00:00:00Z', 37);
INSERT INTO trend_history (trend_id, recorded_at, heat_score) VALUES ((SELECT id FROM trends WHERE name='viral recipe' LIMIT 1), '2026-02-20T00:00:00Z', 39);
INSERT INTO trend_history (trend_id, recorded_at, heat_score) VALUES ((SELECT id FROM trends WHERE name='viral recipe' LIMIT 1), '2026-02-21T00:00:00Z', 41);
INSERT INTO trend_history (trend_id, recorded_at, heat_score) VALUES ((SELECT id FROM trends WHERE name='viral recipe' LIMIT 1), '2026-02-22T00:00:00Z', 42);
INSERT INTO trend_history (trend_id, recorded_at, heat_score) VALUES ((SELECT id FROM trends WHERE name='viral recipe' LIMIT 1), '2026-02-23T00:00:00Z', 44);
INSERT INTO trend_history (trend_id, recorded_at, heat_score) VALUES ((SELECT id FROM trends WHERE name='viral recipe' LIMIT 1), '2026-02-24T00:00:00Z', 46);
INSERT INTO trend_history (trend_id, recorded_at, heat_score) VALUES ((SELECT id FROM trends WHERE name='viral recipe' LIMIT 1), '2026-02-25T00:00:00Z', 48);
INSERT INTO trend_history (trend_id, recorded_at, heat_score) VALUES ((SELECT id FROM trends WHERE name='viral recipe' LIMIT 1), '2026-02-26T00:00:00Z', 49);
INSERT INTO trend_history (trend_id, recorded_at, heat_score) VALUES ((SELECT id FROM trends WHERE name='viral recipe' LIMIT 1), '2026-02-27T00:00:00Z', 51);
INSERT INTO trend_history (trend_id, recorded_at, heat_score) VALUES ((SELECT id FROM trends WHERE name='viral recipe' LIMIT 1), '2026-02-28T00:00:00Z', 53);
INSERT INTO trend_history (trend_id, recorded_at, heat_score) VALUES ((SELECT id FROM trends WHERE name='viral recipe' LIMIT 1), '2026-03-01T00:00:00Z', 54);
INSERT INTO trend_history (trend_id, recorded_at, heat_score) VALUES ((SELECT id FROM trends WHERE name='viral recipe' LIMIT 1), '2026-03-02T00:00:00Z', 56);
INSERT INTO trend_history (trend_id, recorded_at, heat_score) VALUES ((SELECT id FROM trends WHERE name='viral recipe' LIMIT 1), '2026-03-03T00:00:00Z', 58);
INSERT INTO trend_history (trend_id, recorded_at, heat_score) VALUES ((SELECT id FROM trends WHERE name='viral recipe' LIMIT 1), '2026-03-04T00:00:00Z', 59);
INSERT INTO trend_history (trend_id, recorded_at, heat_score) VALUES ((SELECT id FROM trends WHERE name='viral recipe' LIMIT 1), '2026-03-05T00:00:00Z', 61);
INSERT INTO trend_history (trend_id, recorded_at, heat_score) VALUES ((SELECT id FROM trends WHERE name='viral recipe' LIMIT 1), '2026-03-06T00:00:00Z', 63);
INSERT INTO trend_history (trend_id, recorded_at, heat_score) VALUES ((SELECT id FROM trends WHERE name='viral recipe' LIMIT 1), '2026-03-07T00:00:00Z', 65);
INSERT INTO trend_history (trend_id, recorded_at, heat_score) VALUES ((SELECT id FROM trends WHERE name='viral recipe' LIMIT 1), '2026-03-08T00:00:00Z', 66);
INSERT INTO trend_history (trend_id, recorded_at, heat_score) VALUES ((SELECT id FROM trends WHERE name='viral recipe' LIMIT 1), '2026-03-09T00:00:00Z', 68);
INSERT INTO trend_history (trend_id, recorded_at, heat_score) VALUES ((SELECT id FROM trends WHERE name='viral recipe' LIMIT 1), '2026-03-10T00:00:00Z', 70);
INSERT INTO trend_history (trend_id, recorded_at, heat_score) VALUES ((SELECT id FROM trends WHERE name='viral recipe' LIMIT 1), '2026-03-11T00:00:00Z', 71);
INSERT INTO trend_history (trend_id, recorded_at, heat_score) VALUES ((SELECT id FROM trends WHERE name='viral recipe' LIMIT 1), '2026-03-12T00:00:00Z', 73);
INSERT INTO trend_history (trend_id, recorded_at, heat_score) VALUES ((SELECT id FROM trends WHERE name='viral recipe' LIMIT 1), '2026-03-13T00:00:00Z', 75);
INSERT INTO trend_history (trend_id, recorded_at, heat_score) VALUES ((SELECT id FROM trends WHERE name='viral recipe' LIMIT 1), '2026-03-14T00:00:00Z', 76);
INSERT INTO trend_history (trend_id, recorded_at, heat_score) VALUES ((SELECT id FROM trends WHERE name='viral recipe' LIMIT 1), '2026-03-15T00:00:00Z', 78);
INSERT INTO trend_history (trend_id, recorded_at, heat_score) VALUES ((SELECT id FROM trends WHERE name='viral recipe' LIMIT 1), '2026-03-16T00:00:00Z', 80);
INSERT INTO trend_history (trend_id, recorded_at, heat_score) VALUES ((SELECT id FROM trends WHERE name='viral recipe' LIMIT 1), '2026-03-17T00:00:00Z', 82);
INSERT INTO trend_history (trend_id, recorded_at, heat_score) VALUES ((SELECT id FROM trends WHERE name='카페 추천' LIMIT 1), '2026-02-16T00:00:00Z', 32);
INSERT INTO trend_history (trend_id, recorded_at, heat_score) VALUES ((SELECT id FROM trends WHERE name='카페 추천' LIMIT 1), '2026-02-17T00:00:00Z', 33);
INSERT INTO trend_history (trend_id, recorded_at, heat_score) VALUES ((SELECT id FROM trends WHERE name='카페 추천' LIMIT 1), '2026-02-18T00:00:00Z', 35);
INSERT INTO trend_history (trend_id, recorded_at, heat_score) VALUES ((SELECT id FROM trends WHERE name='카페 추천' LIMIT 1), '2026-02-19T00:00:00Z', 36);
INSERT INTO trend_history (trend_id, recorded_at, heat_score) VALUES ((SELECT id FROM trends WHERE name='카페 추천' LIMIT 1), '2026-02-20T00:00:00Z', 38);
INSERT INTO trend_history (trend_id, recorded_at, heat_score) VALUES ((SELECT id FROM trends WHERE name='카페 추천' LIMIT 1), '2026-02-21T00:00:00Z', 40);
INSERT INTO trend_history (trend_id, recorded_at, heat_score) VALUES ((SELECT id FROM trends WHERE name='카페 추천' LIMIT 1), '2026-02-22T00:00:00Z', 41);
INSERT INTO trend_history (trend_id, recorded_at, heat_score) VALUES ((SELECT id FROM trends WHERE name='카페 추천' LIMIT 1), '2026-02-23T00:00:00Z', 43);
INSERT INTO trend_history (trend_id, recorded_at, heat_score) VALUES ((SELECT id FROM trends WHERE name='카페 추천' LIMIT 1), '2026-02-24T00:00:00Z', 45);
INSERT INTO trend_history (trend_id, recorded_at, heat_score) VALUES ((SELECT id FROM trends WHERE name='카페 추천' LIMIT 1), '2026-02-25T00:00:00Z', 46);
INSERT INTO trend_history (trend_id, recorded_at, heat_score) VALUES ((SELECT id FROM trends WHERE name='카페 추천' LIMIT 1), '2026-02-26T00:00:00Z', 48);
INSERT INTO trend_history (trend_id, recorded_at, heat_score) VALUES ((SELECT id FROM trends WHERE name='카페 추천' LIMIT 1), '2026-02-27T00:00:00Z', 50);
INSERT INTO trend_history (trend_id, recorded_at, heat_score) VALUES ((SELECT id FROM trends WHERE name='카페 추천' LIMIT 1), '2026-02-28T00:00:00Z', 51);
INSERT INTO trend_history (trend_id, recorded_at, heat_score) VALUES ((SELECT id FROM trends WHERE name='카페 추천' LIMIT 1), '2026-03-01T00:00:00Z', 53);
INSERT INTO trend_history (trend_id, recorded_at, heat_score) VALUES ((SELECT id FROM trends WHERE name='카페 추천' LIMIT 1), '2026-03-02T00:00:00Z', 55);
INSERT INTO trend_history (trend_id, recorded_at, heat_score) VALUES ((SELECT id FROM trends WHERE name='카페 추천' LIMIT 1), '2026-03-03T00:00:00Z', 56);
INSERT INTO trend_history (trend_id, recorded_at, heat_score) VALUES ((SELECT id FROM trends WHERE name='카페 추천' LIMIT 1), '2026-03-04T00:00:00Z', 58);
INSERT INTO trend_history (trend_id, recorded_at, heat_score) VALUES ((SELECT id FROM trends WHERE name='카페 추천' LIMIT 1), '2026-03-05T00:00:00Z', 60);
INSERT INTO trend_history (trend_id, recorded_at, heat_score) VALUES ((SELECT id FROM trends WHERE name='카페 추천' LIMIT 1), '2026-03-06T00:00:00Z', 61);
INSERT INTO trend_history (trend_id, recorded_at, heat_score) VALUES ((SELECT id FROM trends WHERE name='카페 추천' LIMIT 1), '2026-03-07T00:00:00Z', 63);
INSERT INTO trend_history (trend_id, recorded_at, heat_score) VALUES ((SELECT id FROM trends WHERE name='카페 추천' LIMIT 1), '2026-03-08T00:00:00Z', 65);
INSERT INTO trend_history (trend_id, recorded_at, heat_score) VALUES ((SELECT id FROM trends WHERE name='카페 추천' LIMIT 1), '2026-03-09T00:00:00Z', 66);
INSERT INTO trend_history (trend_id, recorded_at, heat_score) VALUES ((SELECT id FROM trends WHERE name='카페 추천' LIMIT 1), '2026-03-10T00:00:00Z', 68);
INSERT INTO trend_history (trend_id, recorded_at, heat_score) VALUES ((SELECT id FROM trends WHERE name='카페 추천' LIMIT 1), '2026-03-11T00:00:00Z', 70);
INSERT INTO trend_history (trend_id, recorded_at, heat_score) VALUES ((SELECT id FROM trends WHERE name='카페 추천' LIMIT 1), '2026-03-12T00:00:00Z', 71);
INSERT INTO trend_history (trend_id, recorded_at, heat_score) VALUES ((SELECT id FROM trends WHERE name='카페 추천' LIMIT 1), '2026-03-13T00:00:00Z', 73);
INSERT INTO trend_history (trend_id, recorded_at, heat_score) VALUES ((SELECT id FROM trends WHERE name='카페 추천' LIMIT 1), '2026-03-14T00:00:00Z', 75);
INSERT INTO trend_history (trend_id, recorded_at, heat_score) VALUES ((SELECT id FROM trends WHERE name='카페 추천' LIMIT 1), '2026-03-15T00:00:00Z', 76);
INSERT INTO trend_history (trend_id, recorded_at, heat_score) VALUES ((SELECT id FROM trends WHERE name='카페 추천' LIMIT 1), '2026-03-16T00:00:00Z', 78);
INSERT INTO trend_history (trend_id, recorded_at, heat_score) VALUES ((SELECT id FROM trends WHERE name='카페 추천' LIMIT 1), '2026-03-17T00:00:00Z', 80);
INSERT INTO trend_history (trend_id, recorded_at, heat_score) VALUES ((SELECT id FROM trends WHERE name='ストリートファッション' LIMIT 1), '2026-02-16T00:00:00Z', 32);
INSERT INTO trend_history (trend_id, recorded_at, heat_score) VALUES ((SELECT id FROM trends WHERE name='ストリートファッション' LIMIT 1), '2026-02-17T00:00:00Z', 33);
INSERT INTO trend_history (trend_id, recorded_at, heat_score) VALUES ((SELECT id FROM trends WHERE name='ストリートファッション' LIMIT 1), '2026-02-18T00:00:00Z', 35);
INSERT INTO trend_history (trend_id, recorded_at, heat_score) VALUES ((SELECT id FROM trends WHERE name='ストリートファッション' LIMIT 1), '2026-02-19T00:00:00Z', 36);
INSERT INTO trend_history (trend_id, recorded_at, heat_score) VALUES ((SELECT id FROM trends WHERE name='ストリートファッション' LIMIT 1), '2026-02-20T00:00:00Z', 38);
INSERT INTO trend_history (trend_id, recorded_at, heat_score) VALUES ((SELECT id FROM trends WHERE name='ストリートファッション' LIMIT 1), '2026-02-21T00:00:00Z', 40);
INSERT INTO trend_history (trend_id, recorded_at, heat_score) VALUES ((SELECT id FROM trends WHERE name='ストリートファッション' LIMIT 1), '2026-02-22T00:00:00Z', 41);
INSERT INTO trend_history (trend_id, recorded_at, heat_score) VALUES ((SELECT id FROM trends WHERE name='ストリートファッション' LIMIT 1), '2026-02-23T00:00:00Z', 43);
INSERT INTO trend_history (trend_id, recorded_at, heat_score) VALUES ((SELECT id FROM trends WHERE name='ストリートファッション' LIMIT 1), '2026-02-24T00:00:00Z', 45);
INSERT INTO trend_history (trend_id, recorded_at, heat_score) VALUES ((SELECT id FROM trends WHERE name='ストリートファッション' LIMIT 1), '2026-02-25T00:00:00Z', 46);
INSERT INTO trend_history (trend_id, recorded_at, heat_score) VALUES ((SELECT id FROM trends WHERE name='ストリートファッション' LIMIT 1), '2026-02-26T00:00:00Z', 48);
INSERT INTO trend_history (trend_id, recorded_at, heat_score) VALUES ((SELECT id FROM trends WHERE name='ストリートファッション' LIMIT 1), '2026-02-27T00:00:00Z', 50);
INSERT INTO trend_history (trend_id, recorded_at, heat_score) VALUES ((SELECT id FROM trends WHERE name='ストリートファッション' LIMIT 1), '2026-02-28T00:00:00Z', 51);
INSERT INTO trend_history (trend_id, recorded_at, heat_score) VALUES ((SELECT id FROM trends WHERE name='ストリートファッション' LIMIT 1), '2026-03-01T00:00:00Z', 53);
INSERT INTO trend_history (trend_id, recorded_at, heat_score) VALUES ((SELECT id FROM trends WHERE name='ストリートファッション' LIMIT 1), '2026-03-02T00:00:00Z', 55);
INSERT INTO trend_history (trend_id, recorded_at, heat_score) VALUES ((SELECT id FROM trends WHERE name='ストリートファッション' LIMIT 1), '2026-03-03T00:00:00Z', 56);
INSERT INTO trend_history (trend_id, recorded_at, heat_score) VALUES ((SELECT id FROM trends WHERE name='ストリートファッション' LIMIT 1), '2026-03-04T00:00:00Z', 58);
INSERT INTO trend_history (trend_id, recorded_at, heat_score) VALUES ((SELECT id FROM trends WHERE name='ストリートファッション' LIMIT 1), '2026-03-05T00:00:00Z', 60);
INSERT INTO trend_history (trend_id, recorded_at, heat_score) VALUES ((SELECT id FROM trends WHERE name='ストリートファッション' LIMIT 1), '2026-03-06T00:00:00Z', 61);
INSERT INTO trend_history (trend_id, recorded_at, heat_score) VALUES ((SELECT id FROM trends WHERE name='ストリートファッション' LIMIT 1), '2026-03-07T00:00:00Z', 63);
INSERT INTO trend_history (trend_id, recorded_at, heat_score) VALUES ((SELECT id FROM trends WHERE name='ストリートファッション' LIMIT 1), '2026-03-08T00:00:00Z', 65);
INSERT INTO trend_history (trend_id, recorded_at, heat_score) VALUES ((SELECT id FROM trends WHERE name='ストリートファッション' LIMIT 1), '2026-03-09T00:00:00Z', 66);
INSERT INTO trend_history (trend_id, recorded_at, heat_score) VALUES ((SELECT id FROM trends WHERE name='ストリートファッション' LIMIT 1), '2026-03-10T00:00:00Z', 68);
INSERT INTO trend_history (trend_id, recorded_at, heat_score) VALUES ((SELECT id FROM trends WHERE name='ストリートファッション' LIMIT 1), '2026-03-11T00:00:00Z', 70);
INSERT INTO trend_history (trend_id, recorded_at, heat_score) VALUES ((SELECT id FROM trends WHERE name='ストリートファッション' LIMIT 1), '2026-03-12T00:00:00Z', 71);
INSERT INTO trend_history (trend_id, recorded_at, heat_score) VALUES ((SELECT id FROM trends WHERE name='ストリートファッション' LIMIT 1), '2026-03-13T00:00:00Z', 73);
INSERT INTO trend_history (trend_id, recorded_at, heat_score) VALUES ((SELECT id FROM trends WHERE name='ストリートファッション' LIMIT 1), '2026-03-14T00:00:00Z', 75);
INSERT INTO trend_history (trend_id, recorded_at, heat_score) VALUES ((SELECT id FROM trends WHERE name='ストリートファッション' LIMIT 1), '2026-03-15T00:00:00Z', 76);
INSERT INTO trend_history (trend_id, recorded_at, heat_score) VALUES ((SELECT id FROM trends WHERE name='ストリートファッション' LIMIT 1), '2026-03-16T00:00:00Z', 78);
INSERT INTO trend_history (trend_id, recorded_at, heat_score) VALUES ((SELECT id FROM trends WHERE name='ストリートファッション' LIMIT 1), '2026-03-17T00:00:00Z', 80);
INSERT INTO trend_history (trend_id, recorded_at, heat_score) VALUES ((SELECT id FROM trends WHERE name='streetwear' LIMIT 1), '2026-02-16T00:00:00Z', 45);
INSERT INTO trend_history (trend_id, recorded_at, heat_score) VALUES ((SELECT id FROM trends WHERE name='streetwear' LIMIT 1), '2026-02-17T00:00:00Z', 51);
INSERT INTO trend_history (trend_id, recorded_at, heat_score) VALUES ((SELECT id FROM trends WHERE name='streetwear' LIMIT 1), '2026-02-18T00:00:00Z', 48);
INSERT INTO trend_history (trend_id, recorded_at, heat_score) VALUES ((SELECT id FROM trends WHERE name='streetwear' LIMIT 1), '2026-02-19T00:00:00Z', 48);
INSERT INTO trend_history (trend_id, recorded_at, heat_score) VALUES ((SELECT id FROM trends WHERE name='streetwear' LIMIT 1), '2026-02-20T00:00:00Z', 44);
INSERT INTO trend_history (trend_id, recorded_at, heat_score) VALUES ((SELECT id FROM trends WHERE name='streetwear' LIMIT 1), '2026-02-21T00:00:00Z', 48);
INSERT INTO trend_history (trend_id, recorded_at, heat_score) VALUES ((SELECT id FROM trends WHERE name='streetwear' LIMIT 1), '2026-02-22T00:00:00Z', 50);
INSERT INTO trend_history (trend_id, recorded_at, heat_score) VALUES ((SELECT id FROM trends WHERE name='streetwear' LIMIT 1), '2026-02-23T00:00:00Z', 49);
INSERT INTO trend_history (trend_id, recorded_at, heat_score) VALUES ((SELECT id FROM trends WHERE name='streetwear' LIMIT 1), '2026-02-24T00:00:00Z', 49);
INSERT INTO trend_history (trend_id, recorded_at, heat_score) VALUES ((SELECT id FROM trends WHERE name='streetwear' LIMIT 1), '2026-02-25T00:00:00Z', 50);
INSERT INTO trend_history (trend_id, recorded_at, heat_score) VALUES ((SELECT id FROM trends WHERE name='streetwear' LIMIT 1), '2026-02-26T00:00:00Z', 45);
INSERT INTO trend_history (trend_id, recorded_at, heat_score) VALUES ((SELECT id FROM trends WHERE name='streetwear' LIMIT 1), '2026-02-27T00:00:00Z', 48);
INSERT INTO trend_history (trend_id, recorded_at, heat_score) VALUES ((SELECT id FROM trends WHERE name='streetwear' LIMIT 1), '2026-02-28T00:00:00Z', 51);
INSERT INTO trend_history (trend_id, recorded_at, heat_score) VALUES ((SELECT id FROM trends WHERE name='streetwear' LIMIT 1), '2026-03-01T00:00:00Z', 47);
INSERT INTO trend_history (trend_id, recorded_at, heat_score) VALUES ((SELECT id FROM trends WHERE name='streetwear' LIMIT 1), '2026-03-02T00:00:00Z', 50);
INSERT INTO trend_history (trend_id, recorded_at, heat_score) VALUES ((SELECT id FROM trends WHERE name='streetwear' LIMIT 1), '2026-03-03T00:00:00Z', 44);
INSERT INTO trend_history (trend_id, recorded_at, heat_score) VALUES ((SELECT id FROM trends WHERE name='streetwear' LIMIT 1), '2026-03-04T00:00:00Z', 50);
INSERT INTO trend_history (trend_id, recorded_at, heat_score) VALUES ((SELECT id FROM trends WHERE name='streetwear' LIMIT 1), '2026-03-05T00:00:00Z', 48);
INSERT INTO trend_history (trend_id, recorded_at, heat_score) VALUES ((SELECT id FROM trends WHERE name='streetwear' LIMIT 1), '2026-03-06T00:00:00Z', 48);
INSERT INTO trend_history (trend_id, recorded_at, heat_score) VALUES ((SELECT id FROM trends WHERE name='streetwear' LIMIT 1), '2026-03-07T00:00:00Z', 45);
INSERT INTO trend_history (trend_id, recorded_at, heat_score) VALUES ((SELECT id FROM trends WHERE name='streetwear' LIMIT 1), '2026-03-08T00:00:00Z', 49);
INSERT INTO trend_history (trend_id, recorded_at, heat_score) VALUES ((SELECT id FROM trends WHERE name='streetwear' LIMIT 1), '2026-03-09T00:00:00Z', 49);
INSERT INTO trend_history (trend_id, recorded_at, heat_score) VALUES ((SELECT id FROM trends WHERE name='streetwear' LIMIT 1), '2026-03-10T00:00:00Z', 48);
INSERT INTO trend_history (trend_id, recorded_at, heat_score) VALUES ((SELECT id FROM trends WHERE name='streetwear' LIMIT 1), '2026-03-11T00:00:00Z', 44);
INSERT INTO trend_history (trend_id, recorded_at, heat_score) VALUES ((SELECT id FROM trends WHERE name='streetwear' LIMIT 1), '2026-03-12T00:00:00Z', 49);
INSERT INTO trend_history (trend_id, recorded_at, heat_score) VALUES ((SELECT id FROM trends WHERE name='streetwear' LIMIT 1), '2026-03-13T00:00:00Z', 51);
INSERT INTO trend_history (trend_id, recorded_at, heat_score) VALUES ((SELECT id FROM trends WHERE name='streetwear' LIMIT 1), '2026-03-14T00:00:00Z', 47);
INSERT INTO trend_history (trend_id, recorded_at, heat_score) VALUES ((SELECT id FROM trends WHERE name='streetwear' LIMIT 1), '2026-03-15T00:00:00Z', 51);
INSERT INTO trend_history (trend_id, recorded_at, heat_score) VALUES ((SELECT id FROM trends WHERE name='streetwear' LIMIT 1), '2026-03-16T00:00:00Z', 44);
INSERT INTO trend_history (trend_id, recorded_at, heat_score) VALUES ((SELECT id FROM trends WHERE name='streetwear' LIMIT 1), '2026-03-17T00:00:00Z', 44);
INSERT INTO trend_history (trend_id, recorded_at, heat_score) VALUES ((SELECT id FROM trends WHERE name='fitness trend' LIMIT 1), '2026-02-16T00:00:00Z', 46);
INSERT INTO trend_history (trend_id, recorded_at, heat_score) VALUES ((SELECT id FROM trends WHERE name='fitness trend' LIMIT 1), '2026-02-17T00:00:00Z', 46);
INSERT INTO trend_history (trend_id, recorded_at, heat_score) VALUES ((SELECT id FROM trends WHERE name='fitness trend' LIMIT 1), '2026-02-18T00:00:00Z', 45);
INSERT INTO trend_history (trend_id, recorded_at, heat_score) VALUES ((SELECT id FROM trends WHERE name='fitness trend' LIMIT 1), '2026-02-19T00:00:00Z', 43);
INSERT INTO trend_history (trend_id, recorded_at, heat_score) VALUES ((SELECT id FROM trends WHERE name='fitness trend' LIMIT 1), '2026-02-20T00:00:00Z', 42);
INSERT INTO trend_history (trend_id, recorded_at, heat_score) VALUES ((SELECT id FROM trends WHERE name='fitness trend' LIMIT 1), '2026-02-21T00:00:00Z', 41);
INSERT INTO trend_history (trend_id, recorded_at, heat_score) VALUES ((SELECT id FROM trends WHERE name='fitness trend' LIMIT 1), '2026-02-22T00:00:00Z', 41);
INSERT INTO trend_history (trend_id, recorded_at, heat_score) VALUES ((SELECT id FROM trends WHERE name='fitness trend' LIMIT 1), '2026-02-23T00:00:00Z', 45);
INSERT INTO trend_history (trend_id, recorded_at, heat_score) VALUES ((SELECT id FROM trends WHERE name='fitness trend' LIMIT 1), '2026-02-24T00:00:00Z', 40);
INSERT INTO trend_history (trend_id, recorded_at, heat_score) VALUES ((SELECT id FROM trends WHERE name='fitness trend' LIMIT 1), '2026-02-25T00:00:00Z', 43);
INSERT INTO trend_history (trend_id, recorded_at, heat_score) VALUES ((SELECT id FROM trends WHERE name='fitness trend' LIMIT 1), '2026-02-26T00:00:00Z', 43);
INSERT INTO trend_history (trend_id, recorded_at, heat_score) VALUES ((SELECT id FROM trends WHERE name='fitness trend' LIMIT 1), '2026-02-27T00:00:00Z', 43);
INSERT INTO trend_history (trend_id, recorded_at, heat_score) VALUES ((SELECT id FROM trends WHERE name='fitness trend' LIMIT 1), '2026-02-28T00:00:00Z', 43);
INSERT INTO trend_history (trend_id, recorded_at, heat_score) VALUES ((SELECT id FROM trends WHERE name='fitness trend' LIMIT 1), '2026-03-01T00:00:00Z', 43);
INSERT INTO trend_history (trend_id, recorded_at, heat_score) VALUES ((SELECT id FROM trends WHERE name='fitness trend' LIMIT 1), '2026-03-02T00:00:00Z', 45);
INSERT INTO trend_history (trend_id, recorded_at, heat_score) VALUES ((SELECT id FROM trends WHERE name='fitness trend' LIMIT 1), '2026-03-03T00:00:00Z', 44);
INSERT INTO trend_history (trend_id, recorded_at, heat_score) VALUES ((SELECT id FROM trends WHERE name='fitness trend' LIMIT 1), '2026-03-04T00:00:00Z', 45);
INSERT INTO trend_history (trend_id, recorded_at, heat_score) VALUES ((SELECT id FROM trends WHERE name='fitness trend' LIMIT 1), '2026-03-05T00:00:00Z', 40);
INSERT INTO trend_history (trend_id, recorded_at, heat_score) VALUES ((SELECT id FROM trends WHERE name='fitness trend' LIMIT 1), '2026-03-06T00:00:00Z', 45);
INSERT INTO trend_history (trend_id, recorded_at, heat_score) VALUES ((SELECT id FROM trends WHERE name='fitness trend' LIMIT 1), '2026-03-07T00:00:00Z', 42);
INSERT INTO trend_history (trend_id, recorded_at, heat_score) VALUES ((SELECT id FROM trends WHERE name='fitness trend' LIMIT 1), '2026-03-08T00:00:00Z', 41);
INSERT INTO trend_history (trend_id, recorded_at, heat_score) VALUES ((SELECT id FROM trends WHERE name='fitness trend' LIMIT 1), '2026-03-09T00:00:00Z', 46);
INSERT INTO trend_history (trend_id, recorded_at, heat_score) VALUES ((SELECT id FROM trends WHERE name='fitness trend' LIMIT 1), '2026-03-10T00:00:00Z', 41);
INSERT INTO trend_history (trend_id, recorded_at, heat_score) VALUES ((SELECT id FROM trends WHERE name='fitness trend' LIMIT 1), '2026-03-11T00:00:00Z', 44);
INSERT INTO trend_history (trend_id, recorded_at, heat_score) VALUES ((SELECT id FROM trends WHERE name='fitness trend' LIMIT 1), '2026-03-12T00:00:00Z', 40);
INSERT INTO trend_history (trend_id, recorded_at, heat_score) VALUES ((SELECT id FROM trends WHERE name='fitness trend' LIMIT 1), '2026-03-13T00:00:00Z', 46);
INSERT INTO trend_history (trend_id, recorded_at, heat_score) VALUES ((SELECT id FROM trends WHERE name='fitness trend' LIMIT 1), '2026-03-14T00:00:00Z', 40);
INSERT INTO trend_history (trend_id, recorded_at, heat_score) VALUES ((SELECT id FROM trends WHERE name='fitness trend' LIMIT 1), '2026-03-15T00:00:00Z', 45);
INSERT INTO trend_history (trend_id, recorded_at, heat_score) VALUES ((SELECT id FROM trends WHERE name='fitness trend' LIMIT 1), '2026-03-16T00:00:00Z', 44);
INSERT INTO trend_history (trend_id, recorded_at, heat_score) VALUES ((SELECT id FROM trends WHERE name='fitness trend' LIMIT 1), '2026-03-17T00:00:00Z', 41);
INSERT INTO trend_history (trend_id, recorded_at, heat_score) VALUES ((SELECT id FROM trends WHERE name='ガジェット おすすめ' LIMIT 1), '2026-02-16T00:00:00Z', 38);
INSERT INTO trend_history (trend_id, recorded_at, heat_score) VALUES ((SELECT id FROM trends WHERE name='ガジェット おすすめ' LIMIT 1), '2026-02-17T00:00:00Z', 37);
INSERT INTO trend_history (trend_id, recorded_at, heat_score) VALUES ((SELECT id FROM trends WHERE name='ガジェット おすすめ' LIMIT 1), '2026-02-18T00:00:00Z', 37);
INSERT INTO trend_history (trend_id, recorded_at, heat_score) VALUES ((SELECT id FROM trends WHERE name='ガジェット おすすめ' LIMIT 1), '2026-02-19T00:00:00Z', 36);
INSERT INTO trend_history (trend_id, recorded_at, heat_score) VALUES ((SELECT id FROM trends WHERE name='ガジェット おすすめ' LIMIT 1), '2026-02-20T00:00:00Z', 36);
INSERT INTO trend_history (trend_id, recorded_at, heat_score) VALUES ((SELECT id FROM trends WHERE name='ガジェット おすすめ' LIMIT 1), '2026-02-21T00:00:00Z', 36);
INSERT INTO trend_history (trend_id, recorded_at, heat_score) VALUES ((SELECT id FROM trends WHERE name='ガジェット おすすめ' LIMIT 1), '2026-02-22T00:00:00Z', 35);
INSERT INTO trend_history (trend_id, recorded_at, heat_score) VALUES ((SELECT id FROM trends WHERE name='ガジェット おすすめ' LIMIT 1), '2026-02-23T00:00:00Z', 35);
INSERT INTO trend_history (trend_id, recorded_at, heat_score) VALUES ((SELECT id FROM trends WHERE name='ガジェット おすすめ' LIMIT 1), '2026-02-24T00:00:00Z', 34);
INSERT INTO trend_history (trend_id, recorded_at, heat_score) VALUES ((SELECT id FROM trends WHERE name='ガジェット おすすめ' LIMIT 1), '2026-02-25T00:00:00Z', 34);
INSERT INTO trend_history (trend_id, recorded_at, heat_score) VALUES ((SELECT id FROM trends WHERE name='ガジェット おすすめ' LIMIT 1), '2026-02-26T00:00:00Z', 34);
INSERT INTO trend_history (trend_id, recorded_at, heat_score) VALUES ((SELECT id FROM trends WHERE name='ガジェット おすすめ' LIMIT 1), '2026-02-27T00:00:00Z', 33);
INSERT INTO trend_history (trend_id, recorded_at, heat_score) VALUES ((SELECT id FROM trends WHERE name='ガジェット おすすめ' LIMIT 1), '2026-02-28T00:00:00Z', 33);
INSERT INTO trend_history (trend_id, recorded_at, heat_score) VALUES ((SELECT id FROM trends WHERE name='ガジェット おすすめ' LIMIT 1), '2026-03-01T00:00:00Z', 32);
INSERT INTO trend_history (trend_id, recorded_at, heat_score) VALUES ((SELECT id FROM trends WHERE name='ガジェット おすすめ' LIMIT 1), '2026-03-02T00:00:00Z', 32);
INSERT INTO trend_history (trend_id, recorded_at, heat_score) VALUES ((SELECT id FROM trends WHERE name='ガジェット おすすめ' LIMIT 1), '2026-03-03T00:00:00Z', 32);
INSERT INTO trend_history (trend_id, recorded_at, heat_score) VALUES ((SELECT id FROM trends WHERE name='ガジェット おすすめ' LIMIT 1), '2026-03-04T00:00:00Z', 31);
INSERT INTO trend_history (trend_id, recorded_at, heat_score) VALUES ((SELECT id FROM trends WHERE name='ガジェット おすすめ' LIMIT 1), '2026-03-05T00:00:00Z', 31);
INSERT INTO trend_history (trend_id, recorded_at, heat_score) VALUES ((SELECT id FROM trends WHERE name='ガジェット おすすめ' LIMIT 1), '2026-03-06T00:00:00Z', 30);
INSERT INTO trend_history (trend_id, recorded_at, heat_score) VALUES ((SELECT id FROM trends WHERE name='ガジェット おすすめ' LIMIT 1), '2026-03-07T00:00:00Z', 30);
INSERT INTO trend_history (trend_id, recorded_at, heat_score) VALUES ((SELECT id FROM trends WHERE name='ガジェット おすすめ' LIMIT 1), '2026-03-08T00:00:00Z', 30);
INSERT INTO trend_history (trend_id, recorded_at, heat_score) VALUES ((SELECT id FROM trends WHERE name='ガジェット おすすめ' LIMIT 1), '2026-03-09T00:00:00Z', 29);
INSERT INTO trend_history (trend_id, recorded_at, heat_score) VALUES ((SELECT id FROM trends WHERE name='ガジェット おすすめ' LIMIT 1), '2026-03-10T00:00:00Z', 29);
INSERT INTO trend_history (trend_id, recorded_at, heat_score) VALUES ((SELECT id FROM trends WHERE name='ガジェット おすすめ' LIMIT 1), '2026-03-11T00:00:00Z', 28);
INSERT INTO trend_history (trend_id, recorded_at, heat_score) VALUES ((SELECT id FROM trends WHERE name='ガジェット おすすめ' LIMIT 1), '2026-03-12T00:00:00Z', 28);
INSERT INTO trend_history (trend_id, recorded_at, heat_score) VALUES ((SELECT id FROM trends WHERE name='ガジェット おすすめ' LIMIT 1), '2026-03-13T00:00:00Z', 28);
INSERT INTO trend_history (trend_id, recorded_at, heat_score) VALUES ((SELECT id FROM trends WHERE name='ガジェット おすすめ' LIMIT 1), '2026-03-14T00:00:00Z', 27);
INSERT INTO trend_history (trend_id, recorded_at, heat_score) VALUES ((SELECT id FROM trends WHERE name='ガジェット おすすめ' LIMIT 1), '2026-03-15T00:00:00Z', 27);
INSERT INTO trend_history (trend_id, recorded_at, heat_score) VALUES ((SELECT id FROM trends WHERE name='ガジェット おすすめ' LIMIT 1), '2026-03-16T00:00:00Z', 26);
INSERT INTO trend_history (trend_id, recorded_at, heat_score) VALUES ((SELECT id FROM trends WHERE name='ガジェット おすすめ' LIMIT 1), '2026-03-17T00:00:00Z', 26);
INSERT INTO trend_history (trend_id, recorded_at, heat_score) VALUES ((SELECT id FROM trends WHERE name='スイーツ 人気' LIMIT 1), '2026-02-16T00:00:00Z', 30);
INSERT INTO trend_history (trend_id, recorded_at, heat_score) VALUES ((SELECT id FROM trends WHERE name='スイーツ 人気' LIMIT 1), '2026-02-17T00:00:00Z', 29);
INSERT INTO trend_history (trend_id, recorded_at, heat_score) VALUES ((SELECT id FROM trends WHERE name='スイーツ 人気' LIMIT 1), '2026-02-18T00:00:00Z', 29);
INSERT INTO trend_history (trend_id, recorded_at, heat_score) VALUES ((SELECT id FROM trends WHERE name='スイーツ 人気' LIMIT 1), '2026-02-19T00:00:00Z', 29);
INSERT INTO trend_history (trend_id, recorded_at, heat_score) VALUES ((SELECT id FROM trends WHERE name='スイーツ 人気' LIMIT 1), '2026-02-20T00:00:00Z', 28);
INSERT INTO trend_history (trend_id, recorded_at, heat_score) VALUES ((SELECT id FROM trends WHERE name='スイーツ 人気' LIMIT 1), '2026-02-21T00:00:00Z', 28);
INSERT INTO trend_history (trend_id, recorded_at, heat_score) VALUES ((SELECT id FROM trends WHERE name='スイーツ 人気' LIMIT 1), '2026-02-22T00:00:00Z', 28);
INSERT INTO trend_history (trend_id, recorded_at, heat_score) VALUES ((SELECT id FROM trends WHERE name='スイーツ 人気' LIMIT 1), '2026-02-23T00:00:00Z', 27);
INSERT INTO trend_history (trend_id, recorded_at, heat_score) VALUES ((SELECT id FROM trends WHERE name='スイーツ 人気' LIMIT 1), '2026-02-24T00:00:00Z', 27);
INSERT INTO trend_history (trend_id, recorded_at, heat_score) VALUES ((SELECT id FROM trends WHERE name='スイーツ 人気' LIMIT 1), '2026-02-25T00:00:00Z', 27);
INSERT INTO trend_history (trend_id, recorded_at, heat_score) VALUES ((SELECT id FROM trends WHERE name='スイーツ 人気' LIMIT 1), '2026-02-26T00:00:00Z', 26);
INSERT INTO trend_history (trend_id, recorded_at, heat_score) VALUES ((SELECT id FROM trends WHERE name='スイーツ 人気' LIMIT 1), '2026-02-27T00:00:00Z', 26);
INSERT INTO trend_history (trend_id, recorded_at, heat_score) VALUES ((SELECT id FROM trends WHERE name='スイーツ 人気' LIMIT 1), '2026-02-28T00:00:00Z', 26);
INSERT INTO trend_history (trend_id, recorded_at, heat_score) VALUES ((SELECT id FROM trends WHERE name='スイーツ 人気' LIMIT 1), '2026-03-01T00:00:00Z', 25);
INSERT INTO trend_history (trend_id, recorded_at, heat_score) VALUES ((SELECT id FROM trends WHERE name='スイーツ 人気' LIMIT 1), '2026-03-02T00:00:00Z', 25);
INSERT INTO trend_history (trend_id, recorded_at, heat_score) VALUES ((SELECT id FROM trends WHERE name='スイーツ 人気' LIMIT 1), '2026-03-03T00:00:00Z', 25);
INSERT INTO trend_history (trend_id, recorded_at, heat_score) VALUES ((SELECT id FROM trends WHERE name='スイーツ 人気' LIMIT 1), '2026-03-04T00:00:00Z', 25);
INSERT INTO trend_history (trend_id, recorded_at, heat_score) VALUES ((SELECT id FROM trends WHERE name='スイーツ 人気' LIMIT 1), '2026-03-05T00:00:00Z', 24);
INSERT INTO trend_history (trend_id, recorded_at, heat_score) VALUES ((SELECT id FROM trends WHERE name='スイーツ 人気' LIMIT 1), '2026-03-06T00:00:00Z', 24);
INSERT INTO trend_history (trend_id, recorded_at, heat_score) VALUES ((SELECT id FROM trends WHERE name='スイーツ 人気' LIMIT 1), '2026-03-07T00:00:00Z', 24);
INSERT INTO trend_history (trend_id, recorded_at, heat_score) VALUES ((SELECT id FROM trends WHERE name='スイーツ 人気' LIMIT 1), '2026-03-08T00:00:00Z', 23);
INSERT INTO trend_history (trend_id, recorded_at, heat_score) VALUES ((SELECT id FROM trends WHERE name='スイーツ 人気' LIMIT 1), '2026-03-09T00:00:00Z', 23);
INSERT INTO trend_history (trend_id, recorded_at, heat_score) VALUES ((SELECT id FROM trends WHERE name='スイーツ 人気' LIMIT 1), '2026-03-10T00:00:00Z', 23);
INSERT INTO trend_history (trend_id, recorded_at, heat_score) VALUES ((SELECT id FROM trends WHERE name='スイーツ 人気' LIMIT 1), '2026-03-11T00:00:00Z', 22);
INSERT INTO trend_history (trend_id, recorded_at, heat_score) VALUES ((SELECT id FROM trends WHERE name='スイーツ 人気' LIMIT 1), '2026-03-12T00:00:00Z', 22);
INSERT INTO trend_history (trend_id, recorded_at, heat_score) VALUES ((SELECT id FROM trends WHERE name='スイーツ 人気' LIMIT 1), '2026-03-13T00:00:00Z', 22);
INSERT INTO trend_history (trend_id, recorded_at, heat_score) VALUES ((SELECT id FROM trends WHERE name='スイーツ 人気' LIMIT 1), '2026-03-14T00:00:00Z', 21);
INSERT INTO trend_history (trend_id, recorded_at, heat_score) VALUES ((SELECT id FROM trends WHERE name='スイーツ 人気' LIMIT 1), '2026-03-15T00:00:00Z', 21);
INSERT INTO trend_history (trend_id, recorded_at, heat_score) VALUES ((SELECT id FROM trends WHERE name='スイーツ 人気' LIMIT 1), '2026-03-16T00:00:00Z', 21);
INSERT INTO trend_history (trend_id, recorded_at, heat_score) VALUES ((SELECT id FROM trends WHERE name='スイーツ 人気' LIMIT 1), '2026-03-17T00:00:00Z', 21);
INSERT INTO trend_history (trend_id, recorded_at, heat_score) VALUES ((SELECT id FROM trends WHERE name='화장품 추천' LIMIT 1), '2026-02-16T00:00:00Z', 26);
INSERT INTO trend_history (trend_id, recorded_at, heat_score) VALUES ((SELECT id FROM trends WHERE name='화장품 추천' LIMIT 1), '2026-02-17T00:00:00Z', 25);
INSERT INTO trend_history (trend_id, recorded_at, heat_score) VALUES ((SELECT id FROM trends WHERE name='화장품 추천' LIMIT 1), '2026-02-18T00:00:00Z', 25);
INSERT INTO trend_history (trend_id, recorded_at, heat_score) VALUES ((SELECT id FROM trends WHERE name='화장품 추천' LIMIT 1), '2026-02-19T00:00:00Z', 25);
INSERT INTO trend_history (trend_id, recorded_at, heat_score) VALUES ((SELECT id FROM trends WHERE name='화장품 추천' LIMIT 1), '2026-02-20T00:00:00Z', 24);
INSERT INTO trend_history (trend_id, recorded_at, heat_score) VALUES ((SELECT id FROM trends WHERE name='화장품 추천' LIMIT 1), '2026-02-21T00:00:00Z', 24);
INSERT INTO trend_history (trend_id, recorded_at, heat_score) VALUES ((SELECT id FROM trends WHERE name='화장품 추천' LIMIT 1), '2026-02-22T00:00:00Z', 24);
INSERT INTO trend_history (trend_id, recorded_at, heat_score) VALUES ((SELECT id FROM trends WHERE name='화장품 추천' LIMIT 1), '2026-02-23T00:00:00Z', 24);
INSERT INTO trend_history (trend_id, recorded_at, heat_score) VALUES ((SELECT id FROM trends WHERE name='화장품 추천' LIMIT 1), '2026-02-24T00:00:00Z', 23);
INSERT INTO trend_history (trend_id, recorded_at, heat_score) VALUES ((SELECT id FROM trends WHERE name='화장품 추천' LIMIT 1), '2026-02-25T00:00:00Z', 23);
INSERT INTO trend_history (trend_id, recorded_at, heat_score) VALUES ((SELECT id FROM trends WHERE name='화장품 추천' LIMIT 1), '2026-02-26T00:00:00Z', 23);
INSERT INTO trend_history (trend_id, recorded_at, heat_score) VALUES ((SELECT id FROM trends WHERE name='화장품 추천' LIMIT 1), '2026-02-27T00:00:00Z', 23);
INSERT INTO trend_history (trend_id, recorded_at, heat_score) VALUES ((SELECT id FROM trends WHERE name='화장품 추천' LIMIT 1), '2026-02-28T00:00:00Z', 22);
INSERT INTO trend_history (trend_id, recorded_at, heat_score) VALUES ((SELECT id FROM trends WHERE name='화장품 추천' LIMIT 1), '2026-03-01T00:00:00Z', 22);
INSERT INTO trend_history (trend_id, recorded_at, heat_score) VALUES ((SELECT id FROM trends WHERE name='화장품 추천' LIMIT 1), '2026-03-02T00:00:00Z', 22);
INSERT INTO trend_history (trend_id, recorded_at, heat_score) VALUES ((SELECT id FROM trends WHERE name='화장품 추천' LIMIT 1), '2026-03-03T00:00:00Z', 21);
INSERT INTO trend_history (trend_id, recorded_at, heat_score) VALUES ((SELECT id FROM trends WHERE name='화장품 추천' LIMIT 1), '2026-03-04T00:00:00Z', 21);
INSERT INTO trend_history (trend_id, recorded_at, heat_score) VALUES ((SELECT id FROM trends WHERE name='화장품 추천' LIMIT 1), '2026-03-05T00:00:00Z', 21);
INSERT INTO trend_history (trend_id, recorded_at, heat_score) VALUES ((SELECT id FROM trends WHERE name='화장품 추천' LIMIT 1), '2026-03-06T00:00:00Z', 21);
INSERT INTO trend_history (trend_id, recorded_at, heat_score) VALUES ((SELECT id FROM trends WHERE name='화장품 추천' LIMIT 1), '2026-03-07T00:00:00Z', 20);
INSERT INTO trend_history (trend_id, recorded_at, heat_score) VALUES ((SELECT id FROM trends WHERE name='화장품 추천' LIMIT 1), '2026-03-08T00:00:00Z', 20);
INSERT INTO trend_history (trend_id, recorded_at, heat_score) VALUES ((SELECT id FROM trends WHERE name='화장품 추천' LIMIT 1), '2026-03-09T00:00:00Z', 20);
INSERT INTO trend_history (trend_id, recorded_at, heat_score) VALUES ((SELECT id FROM trends WHERE name='화장품 추천' LIMIT 1), '2026-03-10T00:00:00Z', 20);
INSERT INTO trend_history (trend_id, recorded_at, heat_score) VALUES ((SELECT id FROM trends WHERE name='화장품 추천' LIMIT 1), '2026-03-11T00:00:00Z', 19);
INSERT INTO trend_history (trend_id, recorded_at, heat_score) VALUES ((SELECT id FROM trends WHERE name='화장품 추천' LIMIT 1), '2026-03-12T00:00:00Z', 19);
INSERT INTO trend_history (trend_id, recorded_at, heat_score) VALUES ((SELECT id FROM trends WHERE name='화장품 추천' LIMIT 1), '2026-03-13T00:00:00Z', 19);
INSERT INTO trend_history (trend_id, recorded_at, heat_score) VALUES ((SELECT id FROM trends WHERE name='화장품 추천' LIMIT 1), '2026-03-14T00:00:00Z', 19);
INSERT INTO trend_history (trend_id, recorded_at, heat_score) VALUES ((SELECT id FROM trends WHERE name='화장품 추천' LIMIT 1), '2026-03-15T00:00:00Z', 18);
INSERT INTO trend_history (trend_id, recorded_at, heat_score) VALUES ((SELECT id FROM trends WHERE name='화장품 추천' LIMIT 1), '2026-03-16T00:00:00Z', 18);
INSERT INTO trend_history (trend_id, recorded_at, heat_score) VALUES ((SELECT id FROM trends WHERE name='화장품 추천' LIMIT 1), '2026-03-17T00:00:00Z', 18);