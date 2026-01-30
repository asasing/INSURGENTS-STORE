-- Rename E-commerce Tables with "online_" Prefix
-- This script renames all website-specific tables to avoid confusion with POS/Loyverse tables
-- Run this in Supabase SQL Editor

-- Step 1: Drop existing RLS policies (will recreate them after rename)
DROP POLICY IF EXISTS "Public read active products" ON products;
DROP POLICY IF EXISTS "Public read active categories" ON categories;
DROP POLICY IF EXISTS "Public read approved testimonials" ON testimonials;
DROP POLICY IF EXISTS "Public read active sales" ON sale_promotions;
DROP POLICY IF EXISTS "Admins manage products" ON products;

-- Step 2: Rename tables
ALTER TABLE IF EXISTS categories RENAME TO online_categories;
ALTER TABLE IF EXISTS products RENAME TO online_products;
ALTER TABLE IF EXISTS sale_promotions RENAME TO online_sale_promotions;
ALTER TABLE IF EXISTS testimonials RENAME TO online_testimonials;
ALTER TABLE IF EXISTS orders RENAME TO online_orders;

-- Step 3: Update foreign key constraint (products references categories)
-- The constraint name might be different, check with:
-- SELECT conname FROM pg_constraint WHERE conrelid = 'online_products'::regclass;
ALTER TABLE online_products
  DROP CONSTRAINT IF EXISTS products_category_id_fkey;

ALTER TABLE online_products
  ADD CONSTRAINT online_products_category_id_fkey
  FOREIGN KEY (category_id) REFERENCES online_categories(id);

-- Step 4: Rename indexes
ALTER INDEX IF EXISTS idx_products_category RENAME TO idx_online_products_category;
ALTER INDEX IF EXISTS idx_products_active RENAME TO idx_online_products_active;

-- Step 5: Recreate RLS policies with new table names

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

-- Admin full access (using existing profiles table)
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

-- Step 6: Verification queries
-- Uncomment and run these to verify the rename was successful

-- SELECT table_name
-- FROM information_schema.tables
-- WHERE table_schema = 'public'
-- AND table_name LIKE 'online_%';

-- SELECT * FROM online_categories LIMIT 5;
-- SELECT * FROM online_products LIMIT 5;

-- Check RLS policies
-- SELECT tablename, policyname
-- FROM pg_policies
-- WHERE tablename LIKE 'online_%';
