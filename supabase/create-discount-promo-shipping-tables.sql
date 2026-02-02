-- ============================================================================
-- INSURGENTS STORE: DISCOUNT MANAGEMENT, PROMO CODES & SHIPPING ZONES
-- ============================================================================
-- This migration adds support for:
-- 1. Product discounts (percentage/fixed) with expiry dates
-- 2. Promo codes for checkout (discount/free shipping)
-- 3. Location-based shipping zones
-- 4. Order breakdown (subtotal, discounts, shipping)
-- ============================================================================

-- ============================================================================
-- DISCOUNTS TABLE
-- ============================================================================
-- Stores discount rules with support for both manual product selection
-- and category-based application
CREATE TABLE IF NOT EXISTS online_discounts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  description text,
  discount_type text NOT NULL CHECK (discount_type IN ('percentage', 'fixed_amount')),
  discount_value numeric(10,2) NOT NULL CHECK (discount_value > 0),
  application_type text NOT NULL DEFAULT 'manual' CHECK (application_type IN ('manual', 'category')),
  category_ids uuid[], -- For category-based discounts (array of category UUIDs)
  start_date timestamptz NOT NULL DEFAULT now(),
  end_date timestamptz NOT NULL,
  is_active boolean DEFAULT true,
  priority int DEFAULT 0, -- Higher priority wins when multiple discounts apply
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- ============================================================================
-- DISCOUNT-PRODUCT JUNCTION TABLE
-- ============================================================================
-- Links discounts to specific products (for manual application type)
CREATE TABLE IF NOT EXISTS online_discount_products (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  discount_id uuid REFERENCES online_discounts(id) ON DELETE CASCADE,
  product_id uuid REFERENCES online_products(id) ON DELETE CASCADE,
  created_at timestamptz DEFAULT now(),
  UNIQUE(discount_id, product_id)
);

-- ============================================================================
-- PROMO CODES TABLE
-- ============================================================================
-- Stores checkout promo codes with usage tracking
CREATE TABLE IF NOT EXISTS online_promo_codes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  code text UNIQUE NOT NULL, -- e.g., "SUMMER2024"
  description text,
  discount_type text NOT NULL CHECK (discount_type IN ('percentage', 'fixed_amount', 'free_shipping')),
  discount_value numeric(10,2), -- NULL for free_shipping type
  min_order_amount numeric(10,2) DEFAULT 0, -- Minimum order amount to use promo
  start_date timestamptz NOT NULL DEFAULT now(),
  end_date timestamptz NOT NULL,
  usage_limit int, -- NULL = unlimited
  times_used int DEFAULT 0,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- ============================================================================
-- SHIPPING ZONES TABLE
-- ============================================================================
-- Defines location-based shipping fees
CREATE TABLE IF NOT EXISTS online_shipping_zones (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL, -- e.g., "Free Shipping Zone", "Cebu Province"
  cities text[] NOT NULL, -- Array of city names for matching
  shipping_fee numeric(10,2) NOT NULL DEFAULT 0,
  display_order int DEFAULT 0,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- ============================================================================
-- UPDATE ORDERS TABLE
-- ============================================================================
-- Add columns to track order breakdown (discounts, promo, shipping)
ALTER TABLE online_orders
  ADD COLUMN IF NOT EXISTS subtotal numeric(10,2),
  ADD COLUMN IF NOT EXISTS discount_amount numeric(10,2) DEFAULT 0,
  ADD COLUMN IF NOT EXISTS promo_code text,
  ADD COLUMN IF NOT EXISTS promo_discount numeric(10,2) DEFAULT 0,
  ADD COLUMN IF NOT EXISTS shipping_fee numeric(10,2) DEFAULT 0,
  ADD COLUMN IF NOT EXISTS shipping_city text,
  ADD COLUMN IF NOT EXISTS shipping_zone_id uuid REFERENCES online_shipping_zones(id);

-- ============================================================================
-- INDEXES FOR PERFORMANCE
-- ============================================================================
CREATE INDEX IF NOT EXISTS idx_discount_products_discount ON online_discount_products(discount_id);
CREATE INDEX IF NOT EXISTS idx_discount_products_product ON online_discount_products(product_id);
CREATE INDEX IF NOT EXISTS idx_discounts_active ON online_discounts(is_active);
CREATE INDEX IF NOT EXISTS idx_discounts_dates ON online_discounts(start_date, end_date);
CREATE INDEX IF NOT EXISTS idx_discounts_categories ON online_discounts USING GIN(category_ids);
CREATE INDEX IF NOT EXISTS idx_promo_codes_code ON online_promo_codes(code);
CREATE INDEX IF NOT EXISTS idx_promo_codes_active ON online_promo_codes(is_active);
CREATE INDEX IF NOT EXISTS idx_shipping_zones_active ON online_shipping_zones(is_active);

-- ============================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ============================================================================

-- Enable RLS on all new tables
ALTER TABLE online_discounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE online_discount_products ENABLE ROW LEVEL SECURITY;
ALTER TABLE online_promo_codes ENABLE ROW LEVEL SECURITY;
ALTER TABLE online_shipping_zones ENABLE ROW LEVEL SECURITY;

-- ----------------------------------------------------------------------------
-- DISCOUNTS POLICIES
-- ----------------------------------------------------------------------------
-- Public can read active discounts within their date range
CREATE POLICY "Public read active discounts"
  ON online_discounts FOR SELECT
  USING (is_active = true AND now() BETWEEN start_date AND end_date);

-- Admins have full access
CREATE POLICY "Admins manage discounts"
  ON online_discounts
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
    )
  );

-- ----------------------------------------------------------------------------
-- DISCOUNT_PRODUCTS POLICIES
-- ----------------------------------------------------------------------------
-- Public can read discount-product links
CREATE POLICY "Public read discount products"
  ON online_discount_products FOR SELECT
  USING (true);

-- Admins have full access
CREATE POLICY "Admins manage discount products"
  ON online_discount_products
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
    )
  );

-- ----------------------------------------------------------------------------
-- PROMO CODES POLICIES
-- ----------------------------------------------------------------------------
-- Public can read active promo codes for validation
CREATE POLICY "Public read active promo codes"
  ON online_promo_codes FOR SELECT
  USING (is_active = true AND now() BETWEEN start_date AND end_date);

-- Admins have full access
CREATE POLICY "Admins manage promo codes"
  ON online_promo_codes
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
    )
  );

-- ----------------------------------------------------------------------------
-- SHIPPING ZONES POLICIES
-- ----------------------------------------------------------------------------
-- Public can read active shipping zones
CREATE POLICY "Public read active shipping zones"
  ON online_shipping_zones FOR SELECT
  USING (is_active = true);

-- Admins have full access
CREATE POLICY "Admins manage shipping zones"
  ON online_shipping_zones
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
    )
  );

-- ============================================================================
-- SEED INITIAL SHIPPING ZONES
-- ============================================================================
-- Insert default shipping zones for Cebu area
INSERT INTO online_shipping_zones (name, cities, shipping_fee, display_order) VALUES
  (
    'Free Shipping Zone',
    ARRAY['Mandaue City', 'Cebu City', 'Lapu-lapu City', 'Talisay', 'Minglanilla', 'Consolacion', 'Lilo-an'],
    0,
    1
  ),
  (
    'Cebu Province',
    ARRAY['Other Cebu Cities'],
    100,
    2
  ),
  (
    'Outside Cebu',
    ARRAY['Outside Cebu'],
    200,
    3
  )
ON CONFLICT DO NOTHING;

-- ============================================================================
-- MIGRATION COMPLETE
-- ============================================================================
-- Run migrate-sale-prices-to-discounts.sql next to convert existing sale_price values
