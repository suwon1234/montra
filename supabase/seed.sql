-- ============================================================
-- MONTRA 시드 데이터
-- schema.sql 실행 후 이 파일을 Supabase SQL Editor에서 실행
-- ============================================================

-- ------------------------------------------------------------
-- 카테고리 (6개)
-- ------------------------------------------------------------
INSERT INTO categories (slug, name_ko, name_en, emoji, sort_order) VALUES
  ('fashion', '패션', 'Fashion', '👗', 1),
  ('beauty', '뷰티', 'Beauty', '💄', 2),
  ('food', '푸드', 'Food', '🍪', 3),
  ('tech', '테크', 'Tech', '📱', 4),
  ('lifestyle', '라이프스타일', 'Lifestyle', '🏠', 5),
  ('entertainment', '엔터테인먼트', 'Entertainment', '🎬', 6);

-- ------------------------------------------------------------
-- 국가 (6개)
-- ------------------------------------------------------------
INSERT INTO countries (code, name_ko, name_en, name_local, flag_emoji, region, sub_region, timezone, primary_language, primary_ecommerce_platform, primary_social_platform, population, internet_penetration) VALUES
  ('KR', '한국', 'South Korea', '대한민국', '🇰🇷', 'asia', 'east_asia', 'Asia/Seoul', '한국어', '쿠팡', 'Instagram/TikTok', 51740000, 97.6),
  ('US', '미국', 'United States', 'United States of America', '🇺🇸', 'americas', 'north_america', 'America/New_York', 'English', 'Amazon', 'TikTok/Instagram', 331900000, 92.0),
  ('JP', '일본', 'Japan', '日本', '🇯🇵', 'asia', 'east_asia', 'Asia/Tokyo', '日本語', 'Amazon.co.jp/楽天', 'TikTok/Instagram', 125800000, 93.0),
  ('CN', '중국', 'China', '中国', '🇨🇳', 'asia', 'east_asia', 'Asia/Shanghai', '中文', '淘宝/JD.com', 'Douyin/RED', 1412000000, 73.0),
  ('GB', '영국', 'United Kingdom', 'United Kingdom', '🇬🇧', 'europe', 'west_europe', 'Europe/London', 'English', 'Amazon.co.uk', 'TikTok/Instagram', 67330000, 95.0),
  ('FR', '프랑스', 'France', 'France', '🇫🇷', 'europe', 'west_europe', 'Europe/Paris', 'Français', 'Amazon.fr', 'TikTok/Instagram', 67750000, 93.0);

-- ------------------------------------------------------------
-- 트렌드 (20개)
-- ------------------------------------------------------------

-- 한국 (4개)
INSERT INTO trends (country_id, category_id, name, name_local, description, image_url, heat_score, heat_status, search_score, social_score, ecommerce_score, news_score, tags, first_detected_at, last_updated_at, peak_date) VALUES
  ((SELECT id FROM countries WHERE code='KR'), (SELECT id FROM categories WHERE slug='food'),
   '두쫀쿠', '두쫀쿠', '카다이프 반죽에 피스타치오 크림을 채운 쿠키. 터키 디저트에서 영감받아 SNS에서 폭발적 인기를 얻으며 전국 베이커리로 확산.',
   'https://images.unsplash.com/photo-1558961363-fa8fdf82db35?auto=format&fit=crop&q=80&w=800',
   97, 'cooling', 95, 99, 88, 82, ARRAY['디저트','SNS바이럴','카다이프','피스타치오','베이커리'],
   '2025-11-15T00:00:00Z', '2026-03-15T12:00:00Z', '2026-01-20T00:00:00Z'),

  ((SELECT id FROM countries WHERE code='KR'), (SELECT id FROM categories WHERE slug='fashion'),
   '러닝화 커스텀', '러닝화 커스텀', '나만의 러닝화를 직접 디자인하는 트렌드. 나이키 바이유, 뉴발란스 커스텀 서비스 수요 급증.',
   'https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&q=80&w=800',
   82, 'rising', 78, 85, 80, 65, ARRAY['러닝','커스텀','스니커즈','개인화','MTO'],
   '2026-01-10T00:00:00Z', '2026-03-14T18:00:00Z', NULL),

  ((SELECT id FROM countries WHERE code='KR'), (SELECT id FROM categories WHERE slug='beauty'),
   '글루타치온 토너', '글루타치온 토너', '글루타치온 성분을 활용한 미백 토너. 올리브영 베스트셀러 진입하며 꾸준한 판매량 유지.',
   'https://images.unsplash.com/photo-1556228578-0d85b1a4d571?auto=format&fit=crop&q=80&w=800',
   74, 'steady', 70, 72, 82, 55, ARRAY['스킨케어','미백','글루타치온','올리브영','토너'],
   '2025-09-01T00:00:00Z', '2026-03-13T09:00:00Z', NULL),

  ((SELECT id FROM countries WHERE code='KR'), (SELECT id FROM categories WHERE slug='tech'),
   '미니 빔프로젝터', '미니 빔프로젝터', '손바닥 크기의 휴대용 빔프로젝터. 1인 가구 증가와 캠핑 트렌드에 힘입어 새롭게 부상.',
   'https://images.unsplash.com/photo-1478720568477-152d9b164e26?auto=format&fit=crop&q=80&w=800',
   68, 'new', 72, 60, 75, 50, ARRAY['프로젝터','1인가구','캠핑','홈시네마','가성비'],
   '2026-02-20T00:00:00Z', '2026-03-15T06:00:00Z', NULL);

-- 미국 (4개)
INSERT INTO trends (country_id, category_id, name, description, image_url, heat_score, heat_status, search_score, social_score, ecommerce_score, news_score, tags, first_detected_at, last_updated_at) VALUES
  ((SELECT id FROM countries WHERE code='US'), (SELECT id FROM categories WHERE slug='beauty'),
   'Rhode Peptide Lip Boost', 'Hailey Bieber의 뷰티 브랜드 Rhode에서 출시한 펩타이드 립 부스터. TikTok에서 바이럴되며 출시 즉시 품절.',
   'https://images.unsplash.com/photo-1586495777744-4413f21062fa?auto=format&fit=crop&q=80&w=800',
   94, 'rising', 92, 98, 85, 78, ARRAY['Rhode','Hailey Bieber','lip gloss','peptide','TikTok viral'],
   '2026-01-05T00:00:00Z', '2026-03-15T10:00:00Z'),

  ((SELECT id FROM countries WHERE code='US'), (SELECT id FROM categories WHERE slug='lifestyle'),
   'Stanley Cup Tumbler', 'Stanley Quencher 텀블러의 한정판 컬러 수집 열풍. 매 시즌 새 컬러 출시마다 오픈런 현상.',
   'https://images.unsplash.com/photo-1602143407151-7111542de6e8?auto=format&fit=crop&q=80&w=800',
   85, 'steady', 80, 88, 90, 70, ARRAY['Stanley','tumbler','Quencher','limited edition','collectible'],
   '2025-06-01T00:00:00Z', '2026-03-14T14:00:00Z'),

  ((SELECT id FROM countries WHERE code='US'), (SELECT id FROM categories WHERE slug='food'),
   'Crumbl Cookies', '매주 메뉴가 바뀌는 대형 쿠키 프랜차이즈. 소셜 미디어 리뷰 콘텐츠로 꾸준한 화제.',
   'https://images.unsplash.com/photo-1499636136210-6f4ee915583e?auto=format&fit=crop&q=80&w=800',
   78, 'cooling', 75, 82, 70, 60, ARRAY['cookies','franchise','weekly menu','dessert','viral food'],
   '2025-03-01T00:00:00Z', '2026-03-12T08:00:00Z'),

  ((SELECT id FROM countries WHERE code='US'), (SELECT id FROM categories WHERE slug='tech'),
   'AI Pin', 'Humane AI Pin 등 웨어러블 AI 디바이스. 스마트폰 대체를 표방하며 새로운 카테고리 개척 중.',
   'https://images.unsplash.com/photo-1519389950473-47ba0277781c?auto=format&fit=crop&q=80&w=800',
   71, 'new', 76, 65, 55, 80, ARRAY['AI','wearable','Humane','post-smartphone','gadget'],
   '2026-02-01T00:00:00Z', '2026-03-15T11:00:00Z');

-- 일본 (3개)
INSERT INTO trends (country_id, category_id, name, name_local, description, image_url, heat_score, heat_status, search_score, social_score, ecommerce_score, news_score, tags, first_detected_at, last_updated_at) VALUES
  ((SELECT id FROM countries WHERE code='JP'), (SELECT id FROM categories WHERE slug='entertainment'),
   'ちいかわ グッズ', 'ちいかわ グッズ', '나가노의 인기 캐릭터 치이카와 관련 굿즈가 폭발적 인기. 콜라보 상품 출시마다 즉시 품절.',
   'https://images.unsplash.com/photo-1558618666-fcd25c85f82e?auto=format&fit=crop&q=80&w=800',
   91, 'rising', 88, 95, 92, 75, ARRAY['ちいかわ','キャラクター','グッズ','コラボ','ナガノ'],
   '2025-08-01T00:00:00Z', '2026-03-15T09:00:00Z'),

  ((SELECT id FROM countries WHERE code='JP'), (SELECT id FROM categories WHERE slug='food'),
   'おにぎりスタンド', 'おにぎりスタンド', '프리미엄 수제 오니기리 전문점. 편의점 오니기리를 넘어 고급 식재료를 사용한 전문점 급증.',
   'https://images.unsplash.com/photo-1567521464027-f127ff144326?auto=format&fit=crop&q=80&w=800',
   76, 'new', 72, 78, 60, 68, ARRAY['おにぎり','グルメ','専門店','プレミアム','テイクアウト'],
   '2026-02-10T00:00:00Z', '2026-03-14T15:00:00Z'),

  ((SELECT id FROM countries WHERE code='JP'), (SELECT id FROM categories WHERE slug='fashion'),
   'SHEIN 日本限定', 'SHEIN 日本限定', 'SHEIN의 일본 한정 컬렉션. Z세대를 중심으로 초저가 패스트패션 수요 급증.',
   'https://images.unsplash.com/photo-1445205170230-053b83016050?auto=format&fit=crop&q=80&w=800',
   69, 'rising', 65, 74, 72, 50, ARRAY['SHEIN','ファッション','Z世代','プチプラ','限定'],
   '2026-01-20T00:00:00Z', '2026-03-13T20:00:00Z');

-- 중국 (3개)
INSERT INTO trends (country_id, category_id, name, name_local, description, image_url, heat_score, heat_status, search_score, social_score, ecommerce_score, news_score, tags, first_detected_at, last_updated_at) VALUES
  ((SELECT id FROM countries WHERE code='CN'), (SELECT id FROM categories WHERE slug='fashion'),
   '新中式 패션', '新中式', '전통 중국 의상 요소를 현대 패션에 접목한 신중식 스타일. 한푸에서 영감받은 일상복이 RED에서 대유행.',
   'https://images.unsplash.com/photo-1617019114583-affb34d1b3cd?auto=format&fit=crop&q=80&w=800',
   93, 'rising', 90, 96, 88, 78, ARRAY['新中式','汉服','国潮','RED','传统文化'],
   '2025-10-01T00:00:00Z', '2026-03-15T08:00:00Z'),

  ((SELECT id FROM countries WHERE code='CN'), (SELECT id FROM categories WHERE slug='food'),
   '酱香拿铁', '酱香拿铁', '마오타이주와 라떼를 결합한 콜라보 음료. 루이싱커피와 마오타이의 협업으로 SNS에서 화제.',
   'https://images.unsplash.com/photo-1461023058943-07fcbe16d735?auto=format&fit=crop&q=80&w=800',
   87, 'cooling', 82, 90, 75, 85, ARRAY['酱香拿铁','茅台','瑞幸','联名','咖啡'],
   '2025-09-04T00:00:00Z', '2026-03-12T16:00:00Z'),

  ((SELECT id FROM countries WHERE code='CN'), (SELECT id FROM categories WHERE slug='tech'),
   '华为 Mate 70', '华为 Mate 70', '화웨이 Mate 70 시리즈. 자체 칩셋 기린으로 복귀하며 중국 시장 점유율 확대.',
   'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?auto=format&fit=crop&q=80&w=800',
   81, 'steady', 85, 75, 88, 80, ARRAY['华为','Mate70','麒麟','国产芯片','旗舰手机'],
   '2025-11-01T00:00:00Z', '2026-03-14T12:00:00Z');

-- 영국 (3개)
INSERT INTO trends (country_id, category_id, name, description, image_url, heat_score, heat_status, search_score, social_score, ecommerce_score, news_score, tags, first_detected_at, last_updated_at) VALUES
  ((SELECT id FROM countries WHERE code='GB'), (SELECT id FROM categories WHERE slug='fashion'),
   'Greggs × Primark Collab', 'UK 국민 베이커리 Greggs와 Primark의 이색 콜라보. 소시지롤 프린트 의류 등 유머러스한 아이템이 화제.',
   'https://images.unsplash.com/photo-1441984904996-e0b6ba687e04?auto=format&fit=crop&q=80&w=800',
   79, 'new', 74, 83, 70, 72, ARRAY['Greggs','Primark','collab','high street','British'],
   '2026-02-15T00:00:00Z', '2026-03-15T07:00:00Z'),

  ((SELECT id FROM countries WHERE code='GB'), (SELECT id FROM categories WHERE slug='food'),
   'Biscoff Everything', 'Lotus Biscoff 스프레드를 활용한 다양한 디저트와 음료. 카페, 베이커리에서 비스코프 메뉴 대유행.',
   'https://images.unsplash.com/photo-1558961363-fa8fdf82db35?auto=format&fit=crop&q=80&w=800',
   72, 'steady', 68, 75, 70, 55, ARRAY['Biscoff','Lotus','spread','dessert','cafe trend'],
   '2025-07-01T00:00:00Z', '2026-03-13T11:00:00Z'),

  ((SELECT id FROM countries WHERE code='GB'), (SELECT id FROM categories WHERE slug='entertainment'),
   'The Bear 시즌3', 'FX/Hulu 드라마 The Bear 시즌3. 요리 씬과 긴장감 넘치는 연출로 영국에서도 시청률 급상승.',
   'https://images.unsplash.com/photo-1585647347483-22b66260dfff?auto=format&fit=crop&q=80&w=800',
   68, 'rising', 72, 70, 45, 75, ARRAY['The Bear','FX','drama','cooking','streaming'],
   '2026-01-15T00:00:00Z', '2026-03-14T19:00:00Z');

-- 프랑스 (3개)
INSERT INTO trends (country_id, category_id, name, description, image_url, heat_score, heat_status, search_score, social_score, ecommerce_score, news_score, tags, first_detected_at, last_updated_at) VALUES
  ((SELECT id FROM countries WHERE code='FR'), (SELECT id FROM categories WHERE slug='fashion'),
   'Jacquemus Le Bambino', 'Jacquemus의 시그니처 미니백 Le Bambino. 파리 스트리트 패션의 필수 아이템으로 꾸준한 인기.',
   'https://images.unsplash.com/photo-1548036328-c9fa89d128fa?auto=format&fit=crop&q=80&w=800',
   88, 'steady', 82, 90, 85, 72, ARRAY['Jacquemus','Le Bambino','mini bag','Paris fashion','luxury'],
   '2025-04-01T00:00:00Z', '2026-03-15T05:00:00Z'),

  ((SELECT id FROM countries WHERE code='FR'), (SELECT id FROM categories WHERE slug='food'),
   'Picard Surgelés Gourmet', 'Picard 냉동식품의 고급화 라인. 미슐랭 셰프 콜라보 냉동 요리로 프리미엄 간편식 시장 선도.',
   'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?auto=format&fit=crop&q=80&w=800',
   65, 'rising', 60, 62, 72, 58, ARRAY['Picard','surgelés','gourmet','frozen food','Michelin'],
   '2026-01-25T00:00:00Z', '2026-03-14T22:00:00Z'),

  ((SELECT id FROM countries WHERE code='FR'), (SELECT id FROM categories WHERE slug='fashion'),
   'Camaïeu Revival', '2022년 파산한 프랑스 패션 브랜드 Camaïeu의 부활. 새 투자자 아래 온라인 우선 전략으로 재런칭.',
   'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?auto=format&fit=crop&q=80&w=800',
   60, 'new', 58, 55, 65, 62, ARRAY['Camaïeu','revival','French fashion','relaunch','online'],
   '2026-03-01T00:00:00Z', '2026-03-15T03:00:00Z');

-- ------------------------------------------------------------
-- 트렌드 히스토리 (30일 heat_score 변화)
-- 주요 5개 트렌드만 히스토리 생성
-- ------------------------------------------------------------

-- 두쫀쿠 (cooling curve)
INSERT INTO trend_history (trend_id, recorded_at, heat_score) SELECT t.id, d.dt, d.score FROM (SELECT id FROM trends WHERE name='두쫀쿠') t, (VALUES
  ('2026-02-15'::timestamptz, 60), ('2026-02-16', 63), ('2026-02-17', 67), ('2026-02-18', 72), ('2026-02-19', 76),
  ('2026-02-20', 80), ('2026-02-21', 83), ('2026-02-22', 87), ('2026-02-23', 90), ('2026-02-24', 93),
  ('2026-02-25', 95), ('2026-02-26', 96), ('2026-02-27', 97), ('2026-02-28', 97), ('2026-03-01', 96),
  ('2026-03-02', 95), ('2026-03-03', 93), ('2026-03-04', 91), ('2026-03-05', 89), ('2026-03-06', 87),
  ('2026-03-07', 86), ('2026-03-08', 85), ('2026-03-09', 84), ('2026-03-10', 83), ('2026-03-11', 82),
  ('2026-03-12', 81), ('2026-03-13', 80), ('2026-03-14', 79), ('2026-03-15', 78), ('2026-03-16', 77)
) AS d(dt, score);

-- Rhode Peptide Lip Boost (rising curve)
INSERT INTO trend_history (trend_id, recorded_at, heat_score) SELECT t.id, d.dt, d.score FROM (SELECT id FROM trends WHERE name='Rhode Peptide Lip Boost') t, (VALUES
  ('2026-02-15'::timestamptz, 52), ('2026-02-16', 54), ('2026-02-17', 56), ('2026-02-18', 58), ('2026-02-19', 60),
  ('2026-02-20', 63), ('2026-02-21', 65), ('2026-02-22', 67), ('2026-02-23', 69), ('2026-02-24', 71),
  ('2026-02-25', 73), ('2026-02-26', 75), ('2026-02-27', 77), ('2026-02-28', 79), ('2026-03-01', 80),
  ('2026-03-02', 82), ('2026-03-03', 83), ('2026-03-04', 85), ('2026-03-05', 86), ('2026-03-06', 87),
  ('2026-03-07', 88), ('2026-03-08', 89), ('2026-03-09', 90), ('2026-03-10', 91), ('2026-03-11', 91),
  ('2026-03-12', 92), ('2026-03-13', 93), ('2026-03-14', 93), ('2026-03-15', 94), ('2026-03-16', 94)
) AS d(dt, score);

-- 新中式 패션 (rising curve)
INSERT INTO trend_history (trend_id, recorded_at, heat_score) SELECT t.id, d.dt, d.score FROM (SELECT id FROM trends WHERE name='新中式 패션') t, (VALUES
  ('2026-02-15'::timestamptz, 45), ('2026-02-16', 47), ('2026-02-17', 48), ('2026-02-18', 50), ('2026-02-19', 52),
  ('2026-02-20', 55), ('2026-02-21', 58), ('2026-02-22', 61), ('2026-02-23', 64), ('2026-02-24', 67),
  ('2026-02-25', 70), ('2026-02-26', 72), ('2026-02-27', 74), ('2026-02-28', 76), ('2026-03-01', 78),
  ('2026-03-02', 80), ('2026-03-03', 82), ('2026-03-04', 84), ('2026-03-05', 86), ('2026-03-06', 87),
  ('2026-03-07', 88), ('2026-03-08', 89), ('2026-03-09', 90), ('2026-03-10', 91), ('2026-03-11', 91),
  ('2026-03-12', 92), ('2026-03-13', 92), ('2026-03-14', 93), ('2026-03-15', 93), ('2026-03-16', 93)
) AS d(dt, score);

-- ちいかわ グッズ (rising curve)
INSERT INTO trend_history (trend_id, recorded_at, heat_score) SELECT t.id, d.dt, d.score FROM (SELECT id FROM trends WHERE name='ちいかわ グッズ') t, (VALUES
  ('2026-02-15'::timestamptz, 55), ('2026-02-16', 56), ('2026-02-17', 58), ('2026-02-18', 60), ('2026-02-19', 62),
  ('2026-02-20', 64), ('2026-02-21', 66), ('2026-02-22', 68), ('2026-02-23', 70), ('2026-02-24', 72),
  ('2026-02-25', 74), ('2026-02-26', 76), ('2026-02-27', 78), ('2026-02-28', 79), ('2026-03-01', 81),
  ('2026-03-02', 82), ('2026-03-03', 84), ('2026-03-04', 85), ('2026-03-05', 86), ('2026-03-06', 87),
  ('2026-03-07', 88), ('2026-03-08', 88), ('2026-03-09', 89), ('2026-03-10', 89), ('2026-03-11', 90),
  ('2026-03-12', 90), ('2026-03-13', 91), ('2026-03-14', 91), ('2026-03-15', 91), ('2026-03-16', 91)
) AS d(dt, score);

-- Stanley Cup Tumbler (steady curve)
INSERT INTO trend_history (trend_id, recorded_at, heat_score) SELECT t.id, d.dt, d.score FROM (SELECT id FROM trends WHERE name='Stanley Cup Tumbler') t, (VALUES
  ('2026-02-15'::timestamptz, 83), ('2026-02-16', 84), ('2026-02-17', 84), ('2026-02-18', 85), ('2026-02-19', 85),
  ('2026-02-20', 84), ('2026-02-21', 83), ('2026-02-22', 84), ('2026-02-23', 85), ('2026-02-24', 86),
  ('2026-02-25', 85), ('2026-02-26', 84), ('2026-02-27', 85), ('2026-02-28', 86), ('2026-03-01', 85),
  ('2026-03-02', 84), ('2026-03-03', 85), ('2026-03-04', 85), ('2026-03-05', 86), ('2026-03-06', 85),
  ('2026-03-07', 84), ('2026-03-08', 85), ('2026-03-09', 85), ('2026-03-10', 86), ('2026-03-11', 85),
  ('2026-03-12', 85), ('2026-03-13', 84), ('2026-03-14', 85), ('2026-03-15', 85), ('2026-03-16', 85)
) AS d(dt, score);
