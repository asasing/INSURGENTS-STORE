-- Check Loyverse Table Schemas
-- Run this to see the structure of items and sales tables

-- Check items table structure
SELECT
  column_name,
  data_type,
  is_nullable,
  column_default
FROM information_schema.columns
WHERE table_name = 'items'
ORDER BY ordinal_position;

-- Check sales table structure
SELECT
  column_name,
  data_type,
  is_nullable,
  column_default
FROM information_schema.columns
WHERE table_name = 'sales'
ORDER BY ordinal_position;

-- Sample data from items (first 3 rows)
SELECT * FROM items LIMIT 3;

-- Sample data from sales (first 3 rows)
SELECT * FROM sales LIMIT 3;
