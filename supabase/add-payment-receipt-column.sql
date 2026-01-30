-- Add payment_receipt column to online_orders table
-- This stores the receipt information from Maya webhook

ALTER TABLE online_orders
ADD COLUMN IF NOT EXISTS payment_receipt jsonb;

-- Add updated_at column if it doesn't exist
ALTER TABLE online_orders
ADD COLUMN IF NOT EXISTS updated_at timestamptz DEFAULT now();

-- Create index for faster queries on payment_reference
CREATE INDEX IF NOT EXISTS idx_orders_payment_reference
ON online_orders(payment_reference);

-- Update the updated_at timestamp automatically on updates
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Drop trigger if exists
DROP TRIGGER IF EXISTS update_online_orders_updated_at ON online_orders;

-- Create trigger for auto-updating updated_at
CREATE TRIGGER update_online_orders_updated_at
    BEFORE UPDATE ON online_orders
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();
