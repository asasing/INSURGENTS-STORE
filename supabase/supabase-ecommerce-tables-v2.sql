-- ====================================
-- E-COMMERCE TABLES FOR INSURGENTS STORE (v2)
-- Updated to avoid conflicts with existing tables
-- Uses 'sale_promotions' instead of 'sales'
-- ====================================

-- Create categories table for product organization
CREATE TABLE IF NOT EXISTS categories (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  slug text UNIQUE NOT NULL,
  display_order int DEFAULT 0,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now()
);

-- Create products table (separate from existing 'items' table)
CREATE TABLE IF NOT EXISTS products (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  category_id uuid REFERENCES categories(id),
  item_id uuid, -- Optional reference to existing 'items' table
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

-- Create sale_promotions table (renamed from 'sales' to avoid conflict)
CREATE TABLE IF NOT EXISTS sale_promotions (
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

-- Create orders table (e-commerce orders, separate from Loyverse sales)
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

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_products_category ON products(category_id);
CREATE INDEX IF NOT EXISTS idx_products_active ON products(is_active);
CREATE INDEX IF NOT EXISTS idx_products_featured ON products(is_featured);
CREATE INDEX IF NOT EXISTS idx_testimonials_approved ON testimonials(is_approved);
CREATE INDEX IF NOT EXISTS idx_testimonials_featured ON testimonials(is_featured);
CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status);
CREATE INDEX IF NOT EXISTS idx_sale_promotions_active ON sale_promotions(is_active);

-- ====================================
-- ROW LEVEL SECURITY (RLS)
-- Using existing 'profiles' table with roles
-- ====================================

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Public read active products" ON products;
DROP POLICY IF EXISTS "Public read active categories" ON categories;
DROP POLICY IF EXISTS "Public read approved testimonials" ON testimonials;
DROP POLICY IF EXISTS "Public read active sale_promotions" ON sale_promotions;
DROP POLICY IF EXISTS "Public can create orders" ON orders;
DROP POLICY IF EXISTS "Admins manage products" ON products;
DROP POLICY IF EXISTS "Admins manage categories" ON categories;
DROP POLICY IF EXISTS "Admins manage testimonials" ON testimonials;
DROP POLICY IF EXISTS "Admins manage sale_promotions" ON sale_promotions;
DROP POLICY IF EXISTS "Admins manage orders" ON orders;

-- Enable RLS
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE testimonials ENABLE ROW LEVEL SECURITY;
ALTER TABLE sale_promotions ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;

-- Public read policies
CREATE POLICY "Public read active products"
  ON products FOR SELECT
  USING (is_active = true);

CREATE POLICY "Public read active categories"
  ON categories FOR SELECT
  USING (is_active = true);

CREATE POLICY "Public read approved testimonials"
  ON testimonials FOR SELECT
  USING (is_approved = true);

CREATE POLICY "Public read active sale_promotions"
  ON sale_promotions FOR SELECT
  USING (is_active = true);

-- Public can create orders (checkout)
CREATE POLICY "Public can create orders"
  ON orders FOR INSERT
  WITH CHECK (true);

-- Admin policies (checks profiles table for role = 'admin')
CREATE POLICY "Admins manage products"
  ON products
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
    )
  );

CREATE POLICY "Admins manage categories"
  ON categories
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
    )
  );

CREATE POLICY "Admins manage testimonials"
  ON testimonials
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
    )
  );

CREATE POLICY "Admins manage sale_promotions"
  ON sale_promotions
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
    )
  );

CREATE POLICY "Admins manage orders"
  ON orders
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
    )
  );

-- ====================================
-- TRIGGERS FOR AUTO-UPDATE TIMESTAMPS
-- ====================================

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

DROP TRIGGER IF EXISTS update_products_updated_at ON products;
CREATE TRIGGER update_products_updated_at
    BEFORE UPDATE ON products
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_orders_updated_at ON orders;
CREATE TRIGGER update_orders_updated_at
    BEFORE UPDATE ON orders
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- ====================================
-- SEED DATA
-- ====================================

-- Insert product categories
INSERT INTO categories (name, slug, display_order) VALUES
  ('Top Selling', 'top-selling', 1),
  ('Apparels', 'apparels', 2),
  ('Running', 'running', 3),
  ('Basketball', 'basketball', 4),
  ('Casual', 'casual', 5),
  ('On Sale', 'on-sale', 6)
ON CONFLICT (slug) DO NOTHING;

-- Insert sample Filipino testimonials
INSERT INTO testimonials (customer_name, rating, comment, is_approved, is_featured)
SELECT * FROM (VALUES
  ('Maria Santos', 5, 'Sobrang ganda ng quality ng shoes! Komportable pa suotin. Highly recommended po!', true, true),
  ('Juan Dela Cruz', 5, 'Fast delivery at maganda ang packaging. Sulit na sulit ang binayad ko. Salamat!', true, true),
  ('Ana Reyes', 4, 'Maganda naman ang quality pero medyo tight ang fit. Overall okay pa rin.', true, false),
  ('Pedro Garcia', 5, 'Best online shoe store! Mura pa at matibay. Bibili pa ako ulit!', true, true),
  ('Rosa Lopez', 5, 'Ang ganda ng design at comfortable sa paa. Perfect for everyday use!', true, false),
  ('Carlos Martinez', 4, 'Good quality shoes at reasonable price. Mabilis din ang shipping.', true, false),
  ('Linda Fernandez', 5, 'Sobrang satisfied ako! Exact same as the picture. Thank you!', true, true),
  ('Rico Torres', 4, 'Nice shoes! Worth it ang price. Solid ang build quality.', true, false)
) AS v(customer_name, rating, comment, is_approved, is_featured)
WHERE NOT EXISTS (
  SELECT 1 FROM testimonials WHERE customer_name = v.customer_name
);

-- Insert sample sale promotion
INSERT INTO sale_promotions (name, end_date, is_active, message)
SELECT 'Summer Sale 2026', '2026-02-15 23:59:59+00', true, 'Limited Time Sale - Up to 50% Off!'
WHERE NOT EXISTS (SELECT 1 FROM sale_promotions WHERE name = 'Summer Sale 2026');

-- ====================================
-- VERIFICATION
-- ====================================
SELECT 'E-commerce tables created successfully!' as status;
SELECT COUNT(*) as category_count FROM categories;
SELECT COUNT(*) as testimonial_count FROM testimonials;
SELECT COUNT(*) as promotion_count FROM sale_promotions;
