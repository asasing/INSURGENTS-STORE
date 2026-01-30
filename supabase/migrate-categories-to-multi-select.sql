-- Migration: Change category_id to category_ids (multi-select support)
-- Run this in Supabase SQL Editor

-- Step 1: Add new category_ids column (JSONB array)
ALTER TABLE online_products
ADD COLUMN IF NOT EXISTS category_ids jsonb DEFAULT '[]'::jsonb;

-- Step 2: Migrate existing data (convert single category_id to array)
UPDATE online_products
SET category_ids = jsonb_build_array(category_id::text)
WHERE category_id IS NOT NULL;

-- Step 3: Create index for category_ids
CREATE INDEX IF NOT EXISTS idx_online_products_category_ids ON online_products USING GIN (category_ids);

-- Step 4: Drop old category_id column and index (optional - only if you want to fully migrate)
-- Uncomment these lines when you're ready to remove the old column:
-- DROP INDEX IF EXISTS idx_online_products_category;
-- ALTER TABLE online_products DROP COLUMN IF EXISTS category_id;

-- Verification: Check migrated data
SELECT
  id,
  name,
  category_id,
  category_ids
FROM online_products
LIMIT 5;

-- Note: Keep both columns during transition period
-- Once you verify everything works, you can drop the old category_id column
