-- Simple Query to Get Table Columns
-- This will show results in an easy-to-copy format

-- Sales table columns
SELECT 'SALES TABLE COLUMNS:' as info;
SELECT
  column_name,
  data_type,
  is_nullable
FROM information_schema.columns
WHERE table_name = 'sales'
ORDER BY ordinal_position;

-- Items table columns
SELECT 'ITEMS TABLE COLUMNS:' as info;
SELECT
  column_name,
  data_type,
  is_nullable
FROM information_schema.columns
WHERE table_name = 'items'
ORDER BY ordinal_position;
