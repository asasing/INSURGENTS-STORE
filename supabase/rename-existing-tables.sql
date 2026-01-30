-- Rename Existing Tables to "online_" Prefix
-- Use this script when you ALREADY have tables without the prefix
-- Run this in Supabase SQL Editor

-- Step 1: Check what tables exist
SELECT table_name
FROM information_schema.tables
WHERE table_schema = 'public'
AND table_name IN ('products', 'categories', 'testimonials', 'orders', 'sale_promotions')
ORDER BY table_name;

-- Expected: You should see 5 tables listed above

-- ============================================
-- Step 2: Rename the tables
-- ============================================

-- Rename tables to online_ prefix
ALTER TABLE IF EXISTS categories RENAME TO online_categories;
ALTER TABLE IF EXISTS products RENAME TO online_products;
ALTER TABLE IF EXISTS sale_promotions RENAME TO online_sale_promotions;
ALTER TABLE IF EXISTS testimonials RENAME TO online_testimonials;
ALTER TABLE IF EXISTS orders RENAME TO online_orders;

-- ============================================
-- Step 3: Update foreign key constraints
-- ============================================

-- First, drop the old foreign key
ALTER TABLE online_products
  DROP CONSTRAINT IF EXISTS products_category_id_fkey;

-- Add new foreign key with updated name
ALTER TABLE online_products
  ADD CONSTRAINT online_products_category_id_fkey
  FOREIGN KEY (category_id) REFERENCES online_categories(id);

-- ============================================
-- Step 4: Rename indexes
-- ============================================

ALTER INDEX IF EXISTS idx_products_category RENAME TO idx_online_products_category;
ALTER INDEX IF EXISTS idx_products_active RENAME TO idx_online_products_active;

-- ============================================
-- Step 5: Update RLS Policies
-- ============================================

-- Enable RLS if not already enabled
ALTER TABLE online_products ENABLE ROW LEVEL SECURITY;
ALTER TABLE online_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE online_testimonials ENABLE ROW LEVEL SECURITY;
ALTER TABLE online_sale_promotions ENABLE ROW LEVEL SECURITY;
ALTER TABLE online_orders ENABLE ROW LEVEL SECURITY;

-- Drop old policies (if they exist)
DROP POLICY IF EXISTS "Public read active products" ON online_products;
DROP POLICY IF EXISTS "Public read active categories" ON online_categories;
DROP POLICY IF EXISTS "Public read approved testimonials" ON online_testimonials;
DROP POLICY IF EXISTS "Public read active sales" ON online_sale_promotions;
DROP POLICY IF EXISTS "Admins manage products" ON online_products;
DROP POLICY IF EXISTS "Admins manage categories" ON online_categories;
DROP POLICY IF EXISTS "Admins manage testimonials" ON online_testimonials;
DROP POLICY IF EXISTS "Admins manage sales" ON online_sale_promotions;
DROP POLICY IF EXISTS "Admins manage orders" ON online_orders;
DROP POLICY IF EXISTS "Anyone can create orders" ON online_orders;

-- Create new policies

-- Public read access
CREATE POLICY "Public read active products"
  ON online_products FOR SELECT
  USING (is_active = true);

CREATE POLICY "Public read active categories"
  ON online_categories FOR SELECT
  USING (is_active = true);

CREATE POLICY "Public read approved testimonials"
  ON online_testimonials FOR SELECT
  USING (is_approved = true);

CREATE POLICY "Public read active sales"
  ON online_sale_promotions FOR SELECT
  USING (is_active = true);

-- Admin full access (using profiles.role = 'admin')
CREATE POLICY "Admins manage products"
  ON online_products
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

CREATE POLICY "Admins manage categories"
  ON online_categories
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

CREATE POLICY "Admins manage testimonials"
  ON online_testimonials
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

CREATE POLICY "Admins manage sales"
  ON online_sale_promotions
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

CREATE POLICY "Admins manage orders"
  ON online_orders
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

-- Public can create orders (for checkout)
CREATE POLICY "Anyone can create orders"
  ON online_orders FOR INSERT
  WITH CHECK (true);

-- ============================================
-- Step 6: Verify the rename
-- ============================================

-- Check all online_ tables exist
SELECT table_name,
       (SELECT COUNT(*) FROM information_schema.columns WHERE table_name = t.table_name) as columns
FROM information_schema.tables t
WHERE table_schema = 'public'
AND table_name LIKE 'online_%'
ORDER BY table_name;

-- Check data is intact
SELECT 'Categories' as table_name, COUNT(*) as rows FROM online_categories
UNION ALL
SELECT 'Products', COUNT(*) FROM online_products
UNION ALL
SELECT 'Testimonials', COUNT(*) FROM online_testimonials
UNION ALL
SELECT 'Sale Promotions', COUNT(*) FROM online_sale_promotions
UNION ALL
SELECT 'Orders', COUNT(*) FROM online_orders;

-- Check RLS policies
SELECT tablename, policyname
FROM pg_policies
WHERE tablename LIKE 'online_%'
ORDER BY tablename, policyname;

-- Success message
SELECT '✅ Tables renamed successfully! All data preserved.' as status;
