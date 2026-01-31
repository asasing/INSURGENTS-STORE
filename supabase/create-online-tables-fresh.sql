-- Create E-commerce Tables with "online_" Prefix (Fresh Setup)
-- Run this in Supabase SQL Editor

-- Create online_categories table
CREATE TABLE IF NOT EXISTS online_categories (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  slug text UNIQUE NOT NULL,
  display_order int DEFAULT 0,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now()
);

-- Create online_products table
CREATE TABLE IF NOT EXISTS online_products (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  category_id uuid REFERENCES online_categories(id),
  name text NOT NULL,
  description text,
  price numeric(10,2) NOT NULL,
  sale_price numeric(10,2),
  stock_quantity int DEFAULT 0,
  sizes jsonb DEFAULT '[]'::jsonb,
  colors jsonb DEFAULT '[]'::jsonb,
  images jsonb DEFAULT '[]'::jsonb,
  is_featured boolean DEFAULT false,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now()
);

-- Create indexes for products
CREATE INDEX IF NOT EXISTS idx_online_products_category ON online_products(category_id);
CREATE INDEX IF NOT EXISTS idx_online_products_active ON online_products(is_active);

-- Create online_sale_promotions table
CREATE TABLE IF NOT EXISTS online_sale_promotions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  end_date timestamptz NOT NULL,
  is_active boolean DEFAULT true,
  message text DEFAULT 'Limited Time Sale!',
  created_at timestamptz DEFAULT now()
);

-- Create online_testimonials table
CREATE TABLE IF NOT EXISTS online_testimonials (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_name text NOT NULL,
  rating int CHECK (rating >= 1 AND rating <= 5),
  comment text NOT NULL,
  is_approved boolean DEFAULT false,
  is_featured boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);

-- Create online_orders table
CREATE TABLE IF NOT EXISTS online_orders (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_email text NOT NULL,
  customer_name text NOT NULL,
  customer_phone text,
  items jsonb NOT NULL,
  total numeric(10,2) NOT NULL,
  status text DEFAULT 'pending',
  payment_method text DEFAULT 'maya',
  payment_status text DEFAULT 'pending',
  payment_reference text,
  shipping_address jsonb,
  created_at timestamptz DEFAULT now()
);

-- Enable Row Level Security on all tables
ALTER TABLE online_products ENABLE ROW LEVEL SECURITY;
ALTER TABLE online_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE online_testimonials ENABLE ROW LEVEL SECURITY;
ALTER TABLE online_sale_promotions ENABLE ROW LEVEL SECURITY;
ALTER TABLE online_orders ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if any (in case running multiple times)
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

-- Public read access policies
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

-- Admin full access policies (checks profiles.role = 'admin')
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

-- Seed Categories
INSERT INTO online_categories (name, slug, display_order) VALUES
  ('Top Selling', 'top-selling', 1),
  ('Apparels', 'apparels', 2),
  ('Running', 'running', 3),
  ('Basketball', 'basketball', 4),
  ('Casual', 'casual', 5),
  ('On Sale', 'on-sale', 6)
ON CONFLICT (slug) DO NOTHING;

-- Seed Filipino Testimonials
INSERT INTO online_testimonials (customer_name, rating, comment, is_approved, is_featured) VALUES
  ('Maria Santos', 5, 'Sobrang ganda ng quality ng shoes! Komportable pa suotin. Highly recommended po!', true, true),
  ('Juan Dela Cruz', 5, 'Fast delivery at maganda ang packaging. Sulit na sulit ang binayad ko. Salamat!', true, true),
  ('Ana Reyes', 4, 'Maganda naman ang quality pero medyo tight ang fit. Overall okay pa rin.', true, false),
  ('Pedro Garcia', 5, 'Best online shoe store! Mura pa at matibay. Bibili pa ako ulit!', true, true),
  ('Rosa Lopez', 5, 'Ang ganda ng design at comfortable sa paa. Perfect for everyday use!', true, false),
  ('Carlos Martinez', 4, 'Good quality shoes at reasonable price. Mabilis din ang shipping.', true, false),
  ('Linda Fernandez', 5, 'Sobrang satisfied ako! Exact same as the picture. Thank you!', true, true),
  ('Rico Torres', 4, 'Nice shoes! Worth it ang price. Solid ang build quality.', true, false)
ON CONFLICT DO NOTHING;

-- Verification queries
SELECT 'Categories created:' as status, COUNT(*) as count FROM online_categories;
SELECT 'Testimonials created:' as status, COUNT(*) as count FROM online_testimonials;

-- Show all tables
SELECT table_name
FROM information_schema.tables
WHERE table_schema = 'public'
AND table_name LIKE 'online_%'
ORDER BY table_name;
