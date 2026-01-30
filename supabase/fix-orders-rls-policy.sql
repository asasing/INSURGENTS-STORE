-- Fix RLS policy for online_orders table
-- This allows public (unauthenticated) users to create orders

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Allow public order creation" ON online_orders;
DROP POLICY IF EXISTS "Allow public to insert orders" ON online_orders;

-- Enable RLS on online_orders table
ALTER TABLE online_orders ENABLE ROW LEVEL SECURITY;

-- Allow anyone to insert orders (for checkout)
CREATE POLICY "Allow public to insert orders"
ON online_orders
FOR INSERT
TO public
WITH CHECK (true);

-- Allow users to read their own orders by email (optional, for order tracking)
CREATE POLICY "Allow users to read own orders"
ON online_orders
FOR SELECT
TO public
USING (customer_email = current_setting('request.jwt.claims', true)::json->>'email');

-- For admin users to read all orders (if you have admin authentication)
-- Uncomment this if you want admins to see all orders
-- CREATE POLICY "Admins can read all orders"
-- ON online_orders
-- FOR SELECT
-- TO authenticated
-- USING (
--   EXISTS (
--     SELECT 1 FROM admin_users
--     WHERE admin_users.id = auth.uid() AND is_active = true
--   )
-- );
