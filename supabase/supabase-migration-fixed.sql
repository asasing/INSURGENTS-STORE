-- ====================================
-- INSURGENTS STORE DATABASE SCHEMA (FIXED)
-- Run this in Supabase SQL Editor
-- ====================================

-- Drop existing policies first (to avoid conflicts)
DROP POLICY IF EXISTS "Public read active products" ON products;
DROP POLICY IF EXISTS "Public read active categories" ON categories;
DROP POLICY IF EXISTS "Public read approved testimonials" ON testimonials;
DROP POLICY IF EXISTS "Public read active sales" ON sales;
DROP POLICY IF EXISTS "Public can create orders" ON orders;
DROP POLICY IF EXISTS "Admins manage products" ON products;
DROP POLICY IF EXISTS "Admins manage categories" ON categories;
DROP POLICY IF EXISTS "Admins manage testimonials" ON testimonials;
DROP POLICY IF EXISTS "Admins manage sales" ON sales;
DROP POLICY IF EXISTS "Admins manage orders" ON orders;
DROP POLICY IF EXISTS "Admins can view admin_users" ON admin_users;

-- Create categories table
CREATE TABLE IF NOT EXISTS categories (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  slug text UNIQUE NOT NULL,
  display_order int DEFAULT 0,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now()
);

-- Create products table
CREATE TABLE IF NOT EXISTS products (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  category_id uuid REFERENCES categories(id),
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
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create sales table
CREATE TABLE IF NOT EXISTS sales (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  end_date timestamptz NOT NULL,
  is_active boolean DEFAULT true,
  message text DEFAULT 'Limited Time Sale!',
  created_at timestamptz DEFAULT now()
);

-- Create testimonials table
CREATE TABLE IF NOT EXISTS testimonials (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_name text NOT NULL,
  rating int CHECK (rating >= 1 AND rating <= 5),
  comment text NOT NULL,
  product_id uuid REFERENCES products(id) ON DELETE CASCADE,
  is_approved boolean DEFAULT false,
  is_featured boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);

-- Create admin_users table
CREATE TABLE IF NOT EXISTS admin_users (
  id uuid REFERENCES auth.users(id) PRIMARY KEY,
  email text UNIQUE NOT NULL,
  full_name text,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now()
);

-- Create orders table
CREATE TABLE IF NOT EXISTS orders (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_email text NOT NULL,
  customer_name text NOT NULL,
  customer_phone text,
  items jsonb NOT NULL,
  total numeric(10,2) NOT NULL,
  status text DEFAULT 'pending' CHECK (status IN ('pending', 'paid', 'cancelled', 'refunded')),
  payment_reference text,
  shipping_address jsonb,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create indexes (will skip if already exist)
CREATE INDEX IF NOT EXISTS idx_products_category ON products(category_id);
CREATE INDEX IF NOT EXISTS idx_products_active ON products(is_active);
CREATE INDEX IF NOT EXISTS idx_products_featured ON products(is_featured);
CREATE INDEX IF NOT EXISTS idx_testimonials_approved ON testimonials(is_approved);
CREATE INDEX IF NOT EXISTS idx_testimonials_featured ON testimonials(is_featured);
CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status);
CREATE INDEX IF NOT EXISTS idx_sales_active ON sales(is_active);

-- ====================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ====================================

-- Enable RLS on all tables
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE testimonials ENABLE ROW LEVEL SECURITY;
ALTER TABLE sales ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE admin_users ENABLE ROW LEVEL SECURITY;

-- Public read access for active products
CREATE POLICY "Public read active products"
  ON products FOR SELECT
  USING (is_active = true);

-- Public read access for active categories
CREATE POLICY "Public read active categories"
  ON categories FOR SELECT
  USING (is_active = true);

-- Public read access for approved testimonials
CREATE POLICY "Public read approved testimonials"
  ON testimonials FOR SELECT
  USING (is_approved = true);

-- Public read access for active sales
CREATE POLICY "Public read active sales"
  ON sales FOR SELECT
  USING (is_active = true);

-- Public can insert orders (checkout)
CREATE POLICY "Public can create orders"
  ON orders FOR INSERT
  WITH CHECK (true);

-- Admins have full access to products
CREATE POLICY "Admins manage products"
  ON products
  USING (
    EXISTS (
      SELECT 1 FROM admin_users
      WHERE admin_users.id = auth.uid() AND admin_users.is_active = true
    )
  );

-- Admins have full access to categories
CREATE POLICY "Admins manage categories"
  ON categories
  USING (
    EXISTS (
      SELECT 1 FROM admin_users
      WHERE admin_users.id = auth.uid() AND admin_users.is_active = true
    )
  );

-- Admins have full access to testimonials
CREATE POLICY "Admins manage testimonials"
  ON testimonials
  USING (
    EXISTS (
      SELECT 1 FROM admin_users
      WHERE admin_users.id = auth.uid() AND admin_users.is_active = true
    )
  );

-- Admins have full access to sales
CREATE POLICY "Admins manage sales"
  ON sales
  USING (
    EXISTS (
      SELECT 1 FROM admin_users
      WHERE admin_users.id = auth.uid() AND admin_users.is_active = true
    )
  );

-- Admins have full access to orders
CREATE POLICY "Admins manage orders"
  ON orders
  USING (
    EXISTS (
      SELECT 1 FROM admin_users
      WHERE admin_users.id = auth.uid() AND admin_users.is_active = true
    )
  );

-- Admin users can view themselves
CREATE POLICY "Admins can view admin_users"
  ON admin_users FOR SELECT
  USING (
    id = auth.uid() OR
    EXISTS (
      SELECT 1 FROM admin_users
      WHERE admin_users.id = auth.uid() AND admin_users.is_active = true
    )
  );

-- ====================================
-- FUNCTIONS AND TRIGGERS
-- ====================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Add trigger to products table
DROP TRIGGER IF EXISTS update_products_updated_at ON products;
CREATE TRIGGER update_products_updated_at
    BEFORE UPDATE ON products
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Add trigger to orders table
DROP TRIGGER IF EXISTS update_orders_updated_at ON orders;
CREATE TRIGGER update_orders_updated_at
    BEFORE UPDATE ON orders
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- ====================================
-- SEED DATA
-- ====================================

-- Insert categories (will skip if already exist)
INSERT INTO categories (name, slug, display_order) VALUES
  ('Top Selling', 'top-selling', 1),
  ('Apparels', 'apparels', 2),
  ('Running', 'running', 3),
  ('Basketball', 'basketball', 4),
  ('Casual', 'casual', 5),
  ('On Sale', 'on-sale', 6)
ON CONFLICT (slug) DO NOTHING;

-- Insert Filipino testimonials (will skip if ID conflicts)
INSERT INTO testimonials (customer_name, rating, comment, is_approved, is_featured) VALUES
  ('Maria Santos', 5, 'Sobrang ganda ng quality ng shoes! Komportable pa suotin. Highly recommended po!', true, true),
  ('Juan Dela Cruz', 5, 'Fast delivery at maganda ang packaging. Sulit na sulit ang binayad ko. Salamat!', true, true),
  ('Ana Reyes', 4, 'Maganda naman ang quality pero medyo tight ang fit. Overall okay pa rin.', true, false),
  ('Pedro Garcia', 5, 'Best online shoe store! Mura pa at matibay. Bibili pa ako ulit!', true, true),
  ('Rosa Lopez', 5, 'Ang ganda ng design at comfortable sa paa. Perfect for everyday use!', true, false),
  ('Carlos Martinez', 4, 'Good quality shoes at reasonable price. Mabilis din ang shipping.', true, false),
  ('Linda Fernandez', 5, 'Sobrang satisfied ako! Exact same as the picture. Thank you!', true, true),
  ('Rico Torres', 4, 'Nice shoes! Worth it ang price. Solid ang build quality.', true, false);

-- Insert a sample sale (adjust end_date as needed)
INSERT INTO sales (name, end_date, is_active, message) VALUES
  ('Summer Sale 2026', '2026-02-15 23:59:59+00', true, 'Limited Time Sale - Up to 50% Off!');

-- ====================================
-- VERIFICATION
-- ====================================

-- Check tables were created
SELECT 'Tables created successfully!' as status;
SELECT table_name FROM information_schema.tables
WHERE table_schema = 'public' AND table_type = 'BASE TABLE'
ORDER BY table_name;
