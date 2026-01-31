-- Add payment method and payment status to online_orders
ALTER TABLE online_orders
ADD COLUMN IF NOT EXISTS payment_method text DEFAULT 'maya',
ADD COLUMN IF NOT EXISTS payment_status text DEFAULT 'pending';

-- Optional indexes for filtering
CREATE INDEX IF NOT EXISTS idx_online_orders_payment_method ON online_orders(payment_method);
CREATE INDEX IF NOT EXISTS idx_online_orders_payment_status ON online_orders(payment_status);
