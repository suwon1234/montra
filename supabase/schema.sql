-- ============================================================
-- MONTRA Supabase Schema
-- Supabase 대시보드 SQL Editor에서 실행
-- ============================================================

-- UUID 확장 활성화
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ------------------------------------------------------------
-- countries 테이블
-- ------------------------------------------------------------
CREATE TABLE countries (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  code VARCHAR(2) NOT NULL UNIQUE,          -- ISO 3166-1 alpha-2
  name_ko VARCHAR(100) NOT NULL,
  name_en VARCHAR(100) NOT NULL,
  name_local VARCHAR(100),
  flag_emoji VARCHAR(10) NOT NULL,
  region VARCHAR(20) NOT NULL CHECK (region IN ('asia', 'europe', 'americas', 'middle_east', 'africa', 'oceania')),
  sub_region VARCHAR(50),
  timezone VARCHAR(50),
  primary_language VARCHAR(50),
  primary_ecommerce_platform VARCHAR(100),
  primary_social_platform VARCHAR(100),
  population BIGINT,
  internet_penetration DECIMAL(5, 2),       -- 0.00 ~ 100.00
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ------------------------------------------------------------
-- categories 테이블
-- ------------------------------------------------------------
CREATE TABLE categories (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  slug VARCHAR(30) NOT NULL UNIQUE CHECK (slug IN ('fashion', 'beauty', 'food', 'tech', 'lifestyle', 'entertainment')),
  name_ko VARCHAR(50) NOT NULL,
  name_en VARCHAR(50) NOT NULL,
  emoji VARCHAR(10) NOT NULL,
  sort_order INTEGER NOT NULL DEFAULT 0
);

-- ------------------------------------------------------------
-- trends 테이블 (핵심)
-- ------------------------------------------------------------
CREATE TABLE trends (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  country_id UUID NOT NULL REFERENCES countries(id) ON DELETE CASCADE,
  category_id UUID NOT NULL REFERENCES categories(id) ON DELETE CASCADE,
  name VARCHAR(200) NOT NULL,
  name_local VARCHAR(200),
  description TEXT,
  heat_score INTEGER NOT NULL DEFAULT 0 CHECK (heat_score >= 0 AND heat_score <= 100),
  heat_status VARCHAR(10) NOT NULL DEFAULT 'new' CHECK (heat_status IN ('rising', 'steady', 'cooling', 'new')),
  search_score INTEGER NOT NULL DEFAULT 0,
  social_score INTEGER NOT NULL DEFAULT 0,
  ecommerce_score INTEGER NOT NULL DEFAULT 0,
  news_score INTEGER NOT NULL DEFAULT 0,
  tags TEXT[] DEFAULT '{}',
  image_url TEXT,
  source_urls TEXT[] DEFAULT '{}',
  first_detected_at TIMESTAMPTZ DEFAULT NOW(),
  last_updated_at TIMESTAMPTZ DEFAULT NOW(),
  peak_date TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ------------------------------------------------------------
-- trend_history 테이블
-- ------------------------------------------------------------
CREATE TABLE trend_history (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  trend_id UUID NOT NULL REFERENCES trends(id) ON DELETE CASCADE,
  recorded_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  heat_score INTEGER NOT NULL,
  search_score INTEGER,
  social_score INTEGER,
  ecommerce_score INTEGER,
  news_score INTEGER
);

-- ------------------------------------------------------------
-- 인덱스
-- ------------------------------------------------------------
CREATE INDEX idx_trends_country ON trends(country_id);
CREATE INDEX idx_trends_category ON trends(category_id);
CREATE INDEX idx_trends_heat_score ON trends(heat_score DESC);
CREATE INDEX idx_trends_heat_status ON trends(heat_status);
CREATE INDEX idx_trends_last_updated ON trends(last_updated_at DESC);
CREATE INDEX idx_trend_history_trend ON trend_history(trend_id);
CREATE INDEX idx_trend_history_recorded ON trend_history(recorded_at DESC);

-- ------------------------------------------------------------
-- RLS (Row Level Security) — 읽기 전용 공개
-- ------------------------------------------------------------
ALTER TABLE countries ENABLE ROW LEVEL SECURITY;
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE trends ENABLE ROW LEVEL SECURITY;
ALTER TABLE trend_history ENABLE ROW LEVEL SECURITY;

-- 모든 사용자에게 읽기 허용 (anon key로 조회 가능)
CREATE POLICY "Public read access" ON countries FOR SELECT USING (true);
CREATE POLICY "Public read access" ON categories FOR SELECT USING (true);
CREATE POLICY "Public read access" ON trends FOR SELECT USING (true);
CREATE POLICY "Public read access" ON trend_history FOR SELECT USING (true);
