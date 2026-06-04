-- Trends 중복 정리: country_id + name 기준 최신 1건만 남기고 나머지 삭제
-- 2026-04-29 PM
BEGIN;

-- 1) trend_history는 trends.id를 FK 참조 → 삭제 대상 trend의 history 먼저 정리
WITH ranked AS (
  SELECT id, ROW_NUMBER() OVER (
    PARTITION BY country_id, name
    ORDER BY last_updated_at DESC NULLS LAST, created_at DESC NULLS LAST, id DESC
  ) AS rn
  FROM trends
),
to_delete AS (SELECT id FROM ranked WHERE rn > 1)
DELETE FROM trend_history WHERE trend_id IN (SELECT id FROM to_delete);

-- 2) trends 중복 행 삭제 (각 country+name당 최신 1건만 보존)
WITH ranked AS (
  SELECT id, ROW_NUMBER() OVER (
    PARTITION BY country_id, name
    ORDER BY last_updated_at DESC NULLS LAST, created_at DESC NULLS LAST, id DESC
  ) AS rn
  FROM trends
)
DELETE FROM trends WHERE id IN (SELECT id FROM ranked WHERE rn > 1);

-- 3) 향후 재발 방지 unique constraint
ALTER TABLE trends ADD CONSTRAINT trends_country_name_unique UNIQUE (country_id, name);

COMMIT;
