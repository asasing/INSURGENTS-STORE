-- Create Online Users Table for Customer Accounts
-- This allows customers to save addresses, track orders, and receive promos

-- Create online_users table
CREATE TABLE IF NOT EXISTS online_users (
  id uuid REFERENCES auth.users(id) PRIMARY KEY,
  email text UNIQUE NOT NULL,
  full_name text,
  phone text,

  -- Preferences
  email_promo_consent boolean DEFAULT false,
  email_order_updates boolean DEFAULT true,

  -- Saved shipping addresses (JSONB array)
  saved_addresses jsonb DEFAULT '[]'::jsonb,
  -- Example structure:
  -- [
  --   {
  --     "label": "Home",
  --     "address": "123 Main St",
  --     "city": "Manila",
  --     "postalCode": "1000",
  --     "isDefault": true
  --   }
  -- ]

  -- Metadata
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Update online_orders to optionally link to online_users
ALTER TABLE online_orders
  ADD COLUMN IF NOT EXISTS user_id uuid REFERENCES online_users(id);

-- Create index for faster user lookups
CREATE INDEX IF NOT EXISTS idx_online_orders_user ON online_orders(user_id);

-- RLS Policies for online_users

-- Enable RLS
ALTER TABLE online_users ENABLE ROW LEVEL SECURITY;

-- Users can read their own data
CREATE POLICY "Users can view own profile"
  ON online_users FOR SELECT
  USING (auth.uid() = id);

-- Users can update their own data
CREATE POLICY "Users can update own profile"
  ON online_users FOR UPDATE
  USING (auth.uid() = id);

-- Users can read their own orders
CREATE POLICY "Users can view own orders"
  ON online_orders FOR SELECT
  USING (user_id = auth.uid() OR user_id IS NULL);

-- Admins can view all users
CREATE POLICY "Admins can view all users"
  ON online_users FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

-- Trigger to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_online_users_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_online_users_timestamp
  BEFORE UPDATE ON online_users
  FOR EACH ROW
  EXECUTE FUNCTION update_online_users_updated_at();

-- Function to automatically create online_users entry after auth signup
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.online_users (id, email, full_name)
  VALUES (
    NEW.id,
    NEW.email,
    NEW.raw_user_meta_data->>'full_name'
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger on auth.users to auto-create online_users
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION handle_new_user();

-- Create promo_subscriptions table for email campaigns
CREATE TABLE IF NOT EXISTS promo_subscriptions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email text UNIQUE NOT NULL,
  full_name text,
  source text DEFAULT 'website', -- 'website', 'checkout', 'popup'
  is_active boolean DEFAULT true,
  subscribed_at timestamptz DEFAULT now(),
  unsubscribed_at timestamptz
);

-- RLS for promo_subscriptions
ALTER TABLE promo_subscriptions ENABLE ROW LEVEL SECURITY;

-- Anyone can subscribe
CREATE POLICY "Anyone can subscribe to promos"
  ON promo_subscriptions FOR INSERT
  WITH CHECK (true);

-- Admins can view all subscriptions
CREATE POLICY "Admins can view subscriptions"
  ON promo_subscriptions FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

-- Users can unsubscribe themselves
CREATE POLICY "Users can unsubscribe"
  ON promo_subscriptions FOR UPDATE
  USING (email = (SELECT email FROM online_users WHERE id = auth.uid()));

-- Verification queries
-- SELECT * FROM online_users LIMIT 5;
-- SELECT * FROM promo_subscriptions LIMIT 5;

-- Check if user_id column was added to orders
-- SELECT column_name, data_type
-- FROM information_schema.columns
-- WHERE table_name = 'online_orders';
