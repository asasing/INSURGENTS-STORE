-- Drop Old Tables (Without "online_" Prefix)
-- Run this to remove the old tables now that you have online_* versions
-- Run this in Supabase SQL Editor

-- ⚠️ WARNING: This will permanently delete these tables and all their data
-- Only run this if:
-- 1. You have confirmed your online_* tables are working
-- 2. You don't need the data in the old tables
-- 3. Your application is using the online_* tables

-- Step 1: Check what will be deleted
SELECT
  table_name,
  (SELECT COUNT(*) FROM information_schema.columns WHERE table_name = t.table_name) as columns
FROM information_schema.tables t
WHERE table_schema = 'public'
AND table_name IN ('products', 'categories', 'testimonials', 'orders', 'sale_promotions')
ORDER BY table_name;

-- If you see tables listed above, they will be deleted

-- ============================================
-- Step 2: Drop the old tables
-- ============================================

-- Drop tables in correct order (child tables first due to foreign keys)
DROP TABLE IF EXISTS products CASCADE;
DROP TABLE IF EXISTS orders CASCADE;
DROP TABLE IF EXISTS testimonials CASCADE;
DROP TABLE IF EXISTS sale_promotions CASCADE;
DROP TABLE IF EXISTS categories CASCADE;

-- ============================================
-- Step 3: Verify deletion
-- ============================================

-- Check old tables are gone
SELECT table_name
FROM information_schema.tables
WHERE table_schema = 'public'
AND table_name IN ('products', 'categories', 'testimonials', 'orders', 'sale_promotions')
ORDER BY table_name;

-- Should return 0 rows (no old tables)

-- Check online_ tables still exist
SELECT
  table_name,
  (SELECT COUNT(*) FROM information_schema.columns WHERE table_name = t.table_name) as columns
FROM information_schema.tables t
WHERE table_schema = 'public'
AND table_name LIKE 'online_%'
ORDER BY table_name;

-- Should return 5 tables: online_categories, online_orders, online_products, online_sale_promotions, online_testimonials

-- Success message
SELECT '✅ Old tables dropped successfully! Only online_* tables remain.' as status;
