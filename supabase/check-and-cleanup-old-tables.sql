-- Check and Clean Up Old Tables (if they exist)
-- Run this in Supabase SQL Editor

-- STEP 1: Check if old tables exist
-- Run this first to see what tables you have

SELECT
  table_name,
  (SELECT COUNT(*) FROM information_schema.columns WHERE table_name = t.table_name) as columns
FROM information_schema.tables t
WHERE table_schema = 'public'
AND table_name IN ('products', 'categories', 'testimonials', 'orders', 'sale_promotions')
ORDER BY table_name;

-- Expected result:
-- If you see tables listed = old tables exist, need to delete them
-- If no rows returned = no old tables, you're good to go!

-- ============================================
-- STEP 2: Only run this section if STEP 1 showed old tables exist
-- ============================================

-- Check if old tables have any data (just to be safe)
-- Uncomment these to check:

-- SELECT 'products' as table_name, COUNT(*) as row_count FROM products
-- UNION ALL
-- SELECT 'categories', COUNT(*) FROM categories
-- UNION ALL
-- SELECT 'testimonials', COUNT(*) FROM testimonials
-- UNION ALL
-- SELECT 'orders', COUNT(*) FROM orders
-- UNION ALL
-- SELECT 'sale_promotions', COUNT(*) FROM sale_promotions;

-- ============================================
-- STEP 3: Delete old tables (ONLY if STEP 1 found them)
-- ============================================

-- ⚠️ WARNING: This will permanently delete the old tables
-- Only run this if:
-- 1. Old tables exist (from STEP 1)
-- 2. You've confirmed they're empty or you don't need the data
-- 3. Your new online_* tables are working correctly

-- Uncomment these lines to delete old tables:

-- DROP TABLE IF EXISTS products CASCADE;
-- DROP TABLE IF EXISTS categories CASCADE;
-- DROP TABLE IF EXISTS testimonials CASCADE;
-- DROP TABLE IF EXISTS orders CASCADE;
-- DROP TABLE IF EXISTS sale_promotions CASCADE;

-- ============================================
-- STEP 4: Verify cleanup
-- ============================================

-- Run this to confirm only online_* tables remain

SELECT table_name
FROM information_schema.tables
WHERE table_schema = 'public'
AND (
  table_name LIKE 'online_%'
  OR table_name IN ('profiles', 'sales', 'items', 'dim_roles', 'dim_payment_types')
)
ORDER BY table_name;

-- Expected result:
-- ✅ online_categories
-- ✅ online_orders
-- ✅ online_products
-- ✅ online_sale_promotions
-- ✅ online_testimonials
-- ✅ profiles (existing - for admin)
-- ✅ sales (existing - Loyverse POS)
-- ✅ items (existing - Loyverse)
-- ✅ dim_roles (existing)
-- ✅ dim_payment_types (existing)

-- ============================================
-- Quick Summary
-- ============================================

SELECT
  CASE
    WHEN table_name LIKE 'online_%' THEN '🌐 E-commerce'
    WHEN table_name IN ('sales', 'items') THEN '🏪 POS/Loyverse'
    WHEN table_name IN ('profiles', 'dim_roles', 'dim_payment_types') THEN '👤 Auth/Config'
    ELSE '❓ Other'
  END as category,
  table_name,
  (SELECT COUNT(*) FROM information_schema.columns WHERE table_name = t.table_name) as columns
FROM information_schema.tables t
WHERE table_schema = 'public'
ORDER BY category, table_name;
