-- Loyverse Integration: Sync online_products with items and online_orders with sales
-- This creates a two-way sync between your e-commerce and POS systems

-- ============================================
-- PART 1: Add sync columns to online_products
-- ============================================

-- Add item_id to link online products to Loyverse items
ALTER TABLE online_products
  ADD COLUMN IF NOT EXISTS item_id uuid REFERENCES items(id),
  ADD COLUMN IF NOT EXISTS sku text,
  ADD COLUMN IF NOT EXISTS sync_enabled boolean DEFAULT true,
  ADD COLUMN IF NOT EXISTS last_synced_at timestamptz;

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_online_products_item_id ON online_products(item_id);
CREATE INDEX IF NOT EXISTS idx_online_products_sku ON online_products(sku);

-- ============================================
-- PART 2: Function to update item stock when online order is completed
-- ============================================

CREATE OR REPLACE FUNCTION update_loyverse_stock_on_order()
RETURNS TRIGGER AS $$
DECLARE
  order_item jsonb;
  product_record RECORD;
BEGIN
  -- Only process when order status changes to 'completed' or 'paid'
  IF (TG_OP = 'UPDATE' AND NEW.status IN ('completed', 'paid') AND OLD.status != NEW.status) THEN

    -- Loop through each item in the order
    FOR order_item IN SELECT * FROM jsonb_array_elements(NEW.items)
    LOOP
      -- Get the online_product and its linked item_id
      SELECT op.item_id, op.sync_enabled
      INTO product_record
      FROM online_products op
      WHERE op.id = (order_item->>'id')::uuid;

      -- If product is linked to a Loyverse item and sync is enabled
      IF product_record.item_id IS NOT NULL AND product_record.sync_enabled THEN
        -- Decrease stock in items table
        UPDATE items
        SET
          in_stock = GREATEST(in_stock - (order_item->>'quantity')::numeric, 0),
          updated_at = NOW()
        WHERE id = product_record.item_id;

        -- Update last synced timestamp
        UPDATE online_products
        SET last_synced_at = NOW()
        WHERE id = (order_item->>'id')::uuid;
      END IF;
    END LOOP;

  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger
DROP TRIGGER IF EXISTS trg_update_loyverse_stock ON online_orders;
CREATE TRIGGER trg_update_loyverse_stock
  AFTER UPDATE ON online_orders
  FOR EACH ROW
  EXECUTE FUNCTION update_loyverse_stock_on_order();

-- ============================================
-- PART 3: Function to create sales receipt when order is completed
-- ============================================

CREATE OR REPLACE FUNCTION create_loyverse_receipt_on_order()
RETURNS TRIGGER AS $$
DECLARE
  receipt_num text;
  payment_info jsonb;
BEGIN
  -- Only process when order status changes to 'completed' or 'paid'
  IF (TG_OP = 'UPDATE' AND NEW.status IN ('completed', 'paid') AND OLD.status != NEW.status) THEN

    -- Generate receipt number (format: WEB-{order_id_first_8})
    receipt_num := 'WEB-' || SUBSTRING(NEW.id::text, 1, 8);

    -- Build payment info
    payment_info := jsonb_build_array(
      jsonb_build_object(
        'type', 'ONLINE',
        'amount', NEW.total,
        'payment_method', COALESCE(NEW.payment_reference, 'Maya')
      )
    );

    -- Insert into sales table
    INSERT INTO sales (
      receipt_id,
      receipt_number,
      receipt_type,
      state,
      source,
      created_at,
      receipt_datetime,
      receipt_date,
      gross_sales,
      refunds,
      discounts,
      taxes,
      net_sales,
      cost_of_goods,
      gross_profit,
      currency,
      payments,
      raw
    ) VALUES (
      receipt_num,                    -- receipt_id
      receipt_num,                    -- receipt_number
      'SALE',                         -- receipt_type
      'CLOSED',                       -- state
      'WEBSITE',                      -- source
      NOW(),                          -- created_at
      NOW(),                          -- receipt_datetime
      CURRENT_DATE,                   -- receipt_date
      NEW.total,                      -- gross_sales
      0,                              -- refunds
      0,                              -- discounts (future: calculate from sale prices)
      0,                              -- taxes (future: add tax calculation)
      NEW.total,                      -- net_sales
      0,                              -- cost_of_goods (future: sum item costs)
      NEW.total,                      -- gross_profit (future: calculate properly)
      'PHP',                          -- currency
      payment_info,                   -- payments
      jsonb_build_object(             -- raw (store full order data)
        'order_id', NEW.id,
        'customer_name', NEW.customer_name,
        'customer_email', NEW.customer_email,
        'customer_phone', NEW.customer_phone,
        'items', NEW.items,
        'shipping_address', NEW.shipping_address
      )
    );

  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger
DROP TRIGGER IF EXISTS trg_create_loyverse_receipt ON online_orders;
CREATE TRIGGER trg_create_loyverse_receipt
  AFTER UPDATE ON online_orders
  FOR EACH ROW
  EXECUTE FUNCTION create_loyverse_receipt_on_order();

-- ============================================
-- PART 4: Function to manually link online_product to item by SKU
-- ============================================

CREATE OR REPLACE FUNCTION link_product_to_item_by_sku(product_id uuid, item_sku text)
RETURNS void AS $$
BEGIN
  UPDATE online_products op
  SET
    item_id = i.id,
    sku = i.sku,
    last_synced_at = NOW()
  FROM items i
  WHERE op.id = product_id
    AND i.sku = item_sku;
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- PART 5: Function to sync prices from Loyverse to online store
-- ============================================

CREATE OR REPLACE FUNCTION sync_prices_from_loyverse()
RETURNS void AS $$
BEGIN
  -- Update prices for all linked products
  UPDATE online_products op
  SET
    price = i.price,
    last_synced_at = NOW()
  FROM items i
  WHERE op.item_id = i.id
    AND op.sync_enabled = true
    AND i.price IS NOT NULL;
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- PART 6: Function to sync stock from Loyverse to online store
-- ============================================

CREATE OR REPLACE FUNCTION sync_stock_from_loyverse()
RETURNS void AS $$
BEGIN
  -- Update stock for all linked products
  UPDATE online_products op
  SET
    stock_quantity = COALESCE(i.in_stock::integer, 0),
    last_synced_at = NOW()
  FROM items i
  WHERE op.item_id = i.id
    AND op.sync_enabled = true;
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- VERIFICATION & TESTING
-- ============================================

-- Check which products are linked to Loyverse items
SELECT
  op.name as online_product,
  op.sku,
  i.name as loyverse_item,
  i.sku as loyverse_sku,
  op.price as online_price,
  i.price as loyverse_price,
  op.stock_quantity as online_stock,
  i.in_stock as loyverse_stock,
  op.sync_enabled,
  op.last_synced_at
FROM online_products op
LEFT JOIN items i ON op.item_id = i.id
ORDER BY op.name;

-- Test: Create a test order and mark it completed (uncomment to test)
-- INSERT INTO online_orders (customer_email, customer_name, customer_phone, items, total, status)
-- VALUES (
--   'test@example.com',
--   'Test Customer',
--   '09123456789',
--   '[{"id": "product-uuid-here", "quantity": 1, "price": 100}]'::jsonb,
--   100,
--   'completed'
-- );

-- Check sales receipts from website
SELECT
  receipt_number,
  receipt_datetime,
  source,
  gross_sales,
  net_sales,
  raw->>'customer_name' as customer,
  state
FROM sales
WHERE source = 'WEBSITE'
ORDER BY receipt_datetime DESC
LIMIT 10;

-- ============================================
-- USAGE EXAMPLES
-- ============================================

-- 1. Link a product to a Loyverse item by SKU:
-- SELECT link_product_to_item_by_sku(
--   'online-product-uuid-here',
--   'SKU123'
-- );

-- 2. Sync all prices from Loyverse:
-- SELECT sync_prices_from_loyverse();

-- 3. Sync all stock from Loyverse:
-- SELECT sync_stock_from_loyverse();

-- 4. Manually update stock when item is sold online:
-- UPDATE items SET in_stock = in_stock - 1 WHERE sku = 'SKU123';

-- 5. Check sync status:
-- SELECT * FROM online_products WHERE sync_enabled = true AND item_id IS NOT NULL;
