

# Loyverse Integration Guide

Complete guide to syncing your online store with Loyverse POS system.

## Overview

This integration creates automatic two-way sync between:
- **online_products** ↔ **items** (Loyverse inventory)
- **online_orders** → **sales** (Loyverse receipts)

## Features

✅ **Automatic Stock Updates** - When orders are completed online, Loyverse inventory decreases
✅ **Sales Receipt Creation** - Creates Loyverse receipts for online orders
✅ **Price Sync** - Pull prices from Loyverse to online store
✅ **Stock Sync** - Pull stock levels from Loyverse to online store
✅ **Manual Control** - Enable/disable sync per product

---

## Setup

### Step 1: Run Migration

1. Open Supabase SQL Editor
2. Run **`supabase/sync-loyverse-integration.sql`**

**This adds:**
- `item_id` column to online_products (links to Loyverse items)
- `sku` column (for matching products)
- `sync_enabled` flag (enable/disable sync per product)
- `last_synced_at` timestamp
- Trigger functions for automatic syncing

### Step 2: Link Products to Loyverse Items

You have 3 options to link products:

#### Option A: Manual Linking by SKU (Recommended)

```sql
-- Link a specific product to Loyverse item by SKU
SELECT link_product_to_item_by_sku(
  'online-product-uuid',
  'SKU123'  -- The SKU from Loyverse
);
```

#### Option B: Bulk Link by Name Matching

```sql
-- Automatically link products with matching names
UPDATE online_products op
SET item_id = i.id, sku = i.sku, last_synced_at = NOW()
FROM items i
WHERE LOWER(op.name) = LOWER(i.name)
  AND op.item_id IS NULL;
```

#### Option C: Manual Update

```sql
-- Manually set item_id for a product
UPDATE online_products
SET item_id = 'loyverse-item-uuid', sku = 'SKU123'
WHERE id = 'online-product-uuid';
```

### Step 3: Verify Links

```sql
-- Check which products are linked
SELECT
  op.name as online_product,
  i.name as loyverse_item,
  op.sku,
  op.sync_enabled,
  op.last_synced_at
FROM online_products op
LEFT JOIN items i ON op.item_id = i.id
ORDER BY op.name;
```

---

## How It Works

### 1. Stock Updates (Online → Loyverse)

**Trigger:** When `online_orders.status` changes to `'completed'` or `'paid'`

**What happens:**
1. Reads all items from the order
2. For each item with `sync_enabled = true` and linked `item_id`:
   - Decreases `items.in_stock` by the quantity ordered
   - Updates `online_products.last_synced_at`

**Example:**
```sql
-- Customer buys 2 pairs of shoes online
-- Order status changes to 'completed'
-- Automatically:
UPDATE items
SET in_stock = in_stock - 2
WHERE id = (linked_item_id);
```

### 2. Sales Receipt Creation (Online → Loyverse)

**Trigger:** When `online_orders.status` changes to `'completed'` or `'paid'`

**What happens:**
1. Generates receipt number: `WEB-{order_id_first_8}`
2. Creates receipt in `sales` table:
   - `receipt_type = 'SALE'`
   - `source = 'WEBSITE'`
   - `gross_sales = order.total`
   - `net_sales = order.total`
   - `payments` = Online payment info
   - `raw` = Full order data (JSON)

**Example Receipt:**
```sql
receipt_number: WEB-bc7d0923
source: WEBSITE
gross_sales: 5999.00
net_sales: 5999.00
payments: [{"type": "ONLINE", "amount": 5999, "payment_method": "Maya"}]
```

### 3. Price Sync (Loyverse → Online)

**Manual Function:** Run when you want to update online prices from Loyverse

```sql
-- Sync all prices from Loyverse
SELECT sync_prices_from_loyverse();
```

Updates `online_products.price` with `items.price` for all linked products.

### 4. Stock Sync (Loyverse → Online)

**Manual Function:** Run when you want to update online stock from Loyverse

```sql
-- Sync all stock levels from Loyverse
SELECT sync_stock_from_loyverse();
```

Updates `online_products.stock_quantity` with `items.in_stock` for all linked products.

---

## Admin Interface (Future Enhancement)

### Recommended Features to Add:

**1. Product Linking UI** (in Admin → Inventory)
- Dropdown to select Loyverse item when editing product
- Auto-suggest based on name matching
- Show current link status

**2. Sync Status Dashboard**
- Show which products are linked
- Display last sync time
- Enable/disable sync per product
- Button to manually trigger sync

**3. Sales Report**
- Combined view of POS + Online sales
- Filter by source (POS vs Website)
- Daily/weekly/monthly reports

---

## Database Schema

### online_products (Updated)
```sql
id              uuid
name            text
price           numeric
stock_quantity  int
item_id         uuid  ← Links to items.id
sku             text  ← Loyverse SKU
sync_enabled    boolean  ← Enable/disable sync
last_synced_at  timestamptz  ← Last sync timestamp
...
```

### items (Loyverse)
```sql
id              uuid
loyverse_item_id uuid
sku             text
name            text
price           numeric
in_stock        numeric  ← Stock quantity
track_stock     boolean
available_for_sale boolean
...
```

### sales (Loyverse)
```sql
id              uuid
receipt_id      text
receipt_number  text
receipt_type    text  (SALE, REFUND, etc.)
source          text  ('WEBSITE' for online orders)
gross_sales     numeric
net_sales       numeric
payments        jsonb
raw             jsonb  (full order data)
...
```

---

## Workflow Examples

### Example 1: New Product from Loyverse

1. Create product in Loyverse POS
2. Product appears in `items` table with SKU
3. Create matching product in Admin → Inventory
4. Link via SQL:
   ```sql
   SELECT link_product_to_item_by_sku(
     '< online-product-id>',
     'SKU-FROM-LOYVERSE'
   );
   ```
5. Enable sync: Product is now linked!

### Example 2: Customer Makes Online Purchase

1. Customer adds items to cart and checks out
2. Order created with `status = 'pending'`
3. Customer pays via Maya
4. Admin marks order as `'completed'` or `'paid'`
5. **Automatically:**
   - Loyverse inventory decreases
   - Receipt created in `sales` table
   - Both `last_synced_at` timestamps updated

### Example 3: Update Prices from Loyverse

You changed prices in Loyverse POS, want to update website:

```sql
-- Run this to sync all prices
SELECT sync_prices_from_loyverse();
```

All linked products now have updated prices!

### Example 4: Inventory Count

You did inventory count in Loyverse, want to update website stock:

```sql
-- Run this to sync all stock levels
SELECT sync_stock_from_loyverse();
```

Online stock now matches Loyverse!

---

## Troubleshooting

### Product Not Syncing

**Check:**
1. Is `sync_enabled = true`?
   ```sql
   SELECT sync_enabled FROM online_products WHERE id = 'product-id';
   ```
2. Is `item_id` set?
   ```sql
   SELECT item_id FROM online_products WHERE id = 'product-id';
   ```
3. Does the Loyverse item exist?
   ```sql
   SELECT * FROM items WHERE id = 'item-id';
   ```

### Stock Not Decreasing

**Check:**
1. Did order status change to 'completed' or 'paid'?
2. Is the trigger enabled?
   ```sql
   SELECT * FROM pg_trigger WHERE tgname = 'trg_update_loyverse_stock';
   ```

### Receipt Not Created

**Check:**
1. Order status must change to 'completed' or 'paid'
2. Check for errors in Supabase logs
3. Verify trigger exists:
   ```sql
   SELECT * FROM pg_trigger WHERE tgname = 'trg_create_loyverse_receipt';
   ```

### Disable Sync for Specific Product

```sql
UPDATE online_products
SET sync_enabled = false
WHERE id = 'product-id';
```

---

## Best Practices

✅ **Link products by SKU** - Most reliable matching method
✅ **Enable sync selectively** - Only for products sold both online and in-store
✅ **Run manual syncs regularly** - Keep prices and stock in sync
✅ **Monitor `last_synced_at`** - Identify products that haven't synced recently
✅ **Test with dummy orders** - Before going live

❌ **Don't link same item twice** - One Loyverse item = One online product
❌ **Don't disable tracking in Loyverse** - Keep `track_stock = true`
❌ **Don't manually adjust synced values** - Let triggers handle it

---

## Future Enhancements

**Phase 1 (Recommended):**
- [ ] Add product linking UI in admin
- [ ] Sync status dashboard
- [ ] Manual sync buttons

**Phase 2:**
- [ ] Cost of goods calculation
- [ ] Tax calculation
- [ ] Discount tracking
- [ ] Refund handling

**Phase 3:**
- [ ] Automated scheduled syncs (cron job)
- [ ] Conflict resolution (when same product sold simultaneously)
- [ ] Stock alerts (low stock notifications)
- [ ] Sales analytics dashboard

---

## SQL Quick Reference

```sql
-- Link product to item
SELECT link_product_to_item_by_sku('product-uuid', 'SKU123');

-- Sync all prices
SELECT sync_prices_from_loyverse();

-- Sync all stock
SELECT sync_stock_from_loyverse();

-- Check linked products
SELECT op.name, i.name, op.sync_enabled
FROM online_products op
LEFT JOIN items i ON op.item_id = i.id;

-- View website sales receipts
SELECT * FROM sales WHERE source = 'WEBSITE';

-- Disable sync for a product
UPDATE online_products SET sync_enabled = false WHERE id = 'uuid';

-- Check last sync time
SELECT name, last_synced_at FROM online_products WHERE item_id IS NOT NULL;
```

---

**Ready to sync!** Run the migration and start linking your products. 🚀
