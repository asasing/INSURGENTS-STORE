-- ============================================================================
-- MIGRATE EXISTING SALE_PRICE VALUES TO DISCOUNT RECORDS
-- ============================================================================
-- This script automatically converts products with manual sale_price values
-- into discount records with 30-day expiry.
--
-- PREREQUISITES: Run create-discount-promo-shipping-tables.sql first
--
-- IMPORTANT:
-- - This creates individual discounts for each product that has a sale_price
-- - Discounts are created with a 30-day expiry from now()
-- - Original sale_price values are NOT cleared (kept as fallback)
-- - Admins should review and adjust the migrated discounts as needed
-- ============================================================================

-- Auto-migrate existing sale_price values to discount records
-- Creates individual discounts with 30-day expiry
DO $$
DECLARE
  product_record RECORD;
  new_discount_id uuid;
BEGIN
  -- Loop through all products with sale_price set
  FOR product_record IN
    SELECT id, name, price, sale_price
    FROM online_products
    WHERE sale_price IS NOT NULL AND sale_price < price
  LOOP
    -- Create a discount for this product
    INSERT INTO online_discounts (
      name,
      description,
      discount_type,
      discount_value,
      start_date,
      end_date,
      is_active,
      application_type,
      priority
    )
    VALUES (
      'Migrated Sale - ' || product_record.name,
      'Auto-migrated from manual sale_price field',
      'fixed_amount',
      product_record.price - product_record.sale_price,
      now(),
      now() + interval '30 days',
      true,
      'manual',
      0
    )
    RETURNING id INTO new_discount_id;

    -- Link the discount to the product
    INSERT INTO online_discount_products (discount_id, product_id)
    VALUES (new_discount_id, product_record.id);

    RAISE NOTICE 'Migrated discount for product: % (ID: %)', product_record.name, product_record.id;
  END LOOP;

  RAISE NOTICE 'Migration complete! Review discounts in the admin panel.';
END $$;

-- ============================================================================
-- OPTIONAL: CLEAR SALE_PRICE AFTER MIGRATION
-- ============================================================================
-- Uncomment the following line if you want to clear the sale_price field
-- after migration. This will force all price calculations to use the new
-- discount system exclusively.
--
-- WARNING: Only do this after verifying the migrated discounts work correctly!
-- ============================================================================

-- UPDATE online_products SET sale_price = NULL WHERE sale_price IS NOT NULL;

-- ============================================================================
-- VERIFICATION QUERY
-- ============================================================================
-- Run this query to verify the migration:

-- SELECT
--   d.name AS discount_name,
--   d.discount_type,
--   d.discount_value,
--   d.start_date,
--   d.end_date,
--   p.name AS product_name,
--   p.price AS original_price,
--   p.sale_price AS old_sale_price
-- FROM online_discounts d
-- JOIN online_discount_products dp ON d.id = dp.discount_id
-- JOIN online_products p ON dp.product_id = p.id
-- WHERE d.name LIKE 'Migrated Sale -%'
-- ORDER BY d.created_at DESC;
