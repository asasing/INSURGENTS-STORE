-- Fix RLS policy for online_orders table
-- This allows unauthenticated users to create orders

-- Drop ALL existing policies first
DO $$
DECLARE
    r RECORD;
BEGIN
    FOR r IN (SELECT policyname FROM pg_policies WHERE tablename = 'online_orders') LOOP
        EXECUTE 'DROP POLICY IF EXISTS "' || r.policyname || '" ON online_orders';
    END LOOP;
END $$;

-- Enable RLS on online_orders table
ALTER TABLE online_orders ENABLE ROW LEVEL SECURITY;

-- Allow ANYONE (including anonymous users) to insert orders
CREATE POLICY "allow_insert_orders"
ON online_orders
FOR INSERT
WITH CHECK (true);

-- Allow ANYONE to read all orders (you can restrict this later)
CREATE POLICY "allow_read_orders"
ON online_orders
FOR SELECT
USING (true);

-- Optional: Allow authenticated admins to update orders
-- CREATE POLICY "allow_admin_update_orders"
-- ON online_orders
-- FOR UPDATE
-- TO authenticated
-- USING (
--   EXISTS (
--     SELECT 1 FROM admin_users
--     WHERE admin_users.id = auth.uid() AND is_active = true
--   )
-- );
