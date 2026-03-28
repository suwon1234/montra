-- MONTRA 정리된 상품 데이터
-- 2026-03-17 06:53 UTC | 740개 상품

TRUNCATE trend_history CASCADE;
TRUNCATE trends CASCADE;
DELETE FROM categories;
DELETE FROM countries;

ALTER TABLE categories DROP CONSTRAINT IF EXISTS categories_slug_check;
ALTER TABLE countries DROP CONSTRAINT IF EXISTS countries_region_check;

INSERT INTO categories (slug, name_ko, name_en, emoji, sort_order) VALUES ('fashion', '옷', 'Fashion', '👗', 1);
INSERT INTO categories (slug, name_ko, name_en, emoji, sort_order) VALUES ('products', '상품', 'Products', '🛍️', 2);
INSERT INTO categories (slug, name_ko, name_en, emoji, sort_order) VALUES ('food', '음식', 'Food', '🍽️', 3);
INSERT INTO categories (slug, name_ko, name_en, emoji, sort_order) VALUES ('entertainment', '놀이', 'Entertainment', '🎮', 4);

INSERT INTO countries (code, name_ko, name_en, flag_emoji, region, sub_region, is_active) VALUES ('KR', '한국', 'South Korea', '🇰🇷', 'asia', 'east_asia', true);
INSERT INTO countries (code, name_ko, name_en, flag_emoji, region, sub_region, is_active) VALUES ('JP', '일본', 'Japan', '🇯🇵', 'asia', 'east_asia', true);
INSERT INTO countries (code, name_ko, name_en, flag_emoji, region, sub_region, is_active) VALUES ('TW', '대만', 'Taiwan', '🇹🇼', 'asia', 'east_asia', true);
INSERT INTO countries (code, name_ko, name_en, flag_emoji, region, sub_region, is_active) VALUES ('SG', '싱가포르', 'Singapore', '🇸🇬', 'asia', 'southeast_asia', true);
INSERT INTO countries (code, name_ko, name_en, flag_emoji, region, sub_region, is_active) VALUES ('TH', '태국', 'Thailand', '🇹🇭', 'asia', 'southeast_asia', true);
INSERT INTO countries (code, name_ko, name_en, flag_emoji, region, sub_region, is_active) VALUES ('VN', '베트남', 'Vietnam', '🇻🇳', 'asia', 'southeast_asia', true);
INSERT INTO countries (code, name_ko, name_en, flag_emoji, region, sub_region, is_active) VALUES ('IN', '인도', 'India', '🇮🇳', 'asia', 'south_asia', true);
INSERT INTO countries (code, name_ko, name_en, flag_emoji, region, sub_region, is_active) VALUES ('US', '미국', 'United States', '🇺🇸', 'americas', 'north_america', true);
INSERT INTO countries (code, name_ko, name_en, flag_emoji, region, sub_region, is_active) VALUES ('CA', '캐나다', 'Canada', '🇨🇦', 'americas', 'north_america', true);
INSERT INTO countries (code, name_ko, name_en, flag_emoji, region, sub_region, is_active) VALUES ('MX', '멕시코', 'Mexico', '🇲🇽', 'americas', 'latin_america', true);
INSERT INTO countries (code, name_ko, name_en, flag_emoji, region, sub_region, is_active) VALUES ('BR', '브라질', 'Brazil', '🇧🇷', 'americas', 'latin_america', true);
INSERT INTO countries (code, name_ko, name_en, flag_emoji, region, sub_region, is_active) VALUES ('GB', '영국', 'United Kingdom', '🇬🇧', 'europe', 'west_europe', true);
INSERT INTO countries (code, name_ko, name_en, flag_emoji, region, sub_region, is_active) VALUES ('FR', '프랑스', 'France', '🇫🇷', 'europe', 'west_europe', true);
INSERT INTO countries (code, name_ko, name_en, flag_emoji, region, sub_region, is_active) VALUES ('DE', '독일', 'Germany', '🇩🇪', 'europe', 'west_europe', true);
INSERT INTO countries (code, name_ko, name_en, flag_emoji, region, sub_region, is_active) VALUES ('IT', '이탈리아', 'Italy', '🇮🇹', 'europe', 'west_europe', true);
INSERT INTO countries (code, name_ko, name_en, flag_emoji, region, sub_region, is_active) VALUES ('ES', '스페인', 'Spain', '🇪🇸', 'europe', 'west_europe', true);
INSERT INTO countries (code, name_ko, name_en, flag_emoji, region, sub_region, is_active) VALUES ('SE', '스웨덴', 'Sweden', '🇸🇪', 'europe', 'north_europe', true);
INSERT INTO countries (code, name_ko, name_en, flag_emoji, region, sub_region, is_active) VALUES ('AU', '호주', 'Australia', '🇦🇺', 'oceania', 'oceania', true);
INSERT INTO countries (code, name_ko, name_en, flag_emoji, region, sub_region, is_active) VALUES ('AE', 'UAE', 'United Arab Emirates', '🇦🇪', 'middle_east', 'middle_east', true);
INSERT INTO countries (code, name_ko, name_en, flag_emoji, region, sub_region, is_active) VALUES ('ZA', '남아공', 'South Africa', '🇿🇦', 'africa', 'africa', true);

ALTER TABLE categories ADD CONSTRAINT categories_slug_check CHECK (slug IN ('fashion','products','food','entertainment'));
ALTER TABLE countries ADD CONSTRAINT countries_region_check CHECK (region IN ('asia','europe','americas','middle_east','africa','oceania'));
