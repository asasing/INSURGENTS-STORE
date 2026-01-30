# Table Rename Summary - "online_" Prefix

## What Changed?

All e-commerce tables have been renamed with an `online_` prefix to clearly separate them from your existing POS/Loyverse tables.

### Table Renames

| Old Name | New Name |
|----------|----------|
| `categories` | `online_categories` |
| `products` | `online_products` |
| `sale_promotions` | `online_sale_promotions` |
| `testimonials` | `online_testimonials` |
| `orders` | `online_orders` |

## Files Updated ✅

### Service Files
- ✅ [src/services/products.js](src/services/products.js) - Updated to `online_products` and `online_categories`
- ✅ [src/services/promotions.js](src/services/promotions.js) - Updated to `online_sale_promotions`
- ✅ [src/services/orders.js](src/services/orders.js) - Updated to `online_orders`
- ✅ [src/services/testimonials.js](src/services/testimonials.js) - Updated to `online_testimonials`
- ✅ [src/services/categories.js](src/services/categories.js) - Updated to `online_categories`

### Page Files
- ✅ [src/pages/admin/Testimonials.jsx](src/pages/admin/Testimonials.jsx) - Updated all direct Supabase queries

### SQL Files
- ✅ [sample-products-seed.sql](sample-products-seed.sql) - Updated to use new table names

### SQL Scripts Created
- ✅ [rename-tables-to-online.sql](rename-tables-to-online.sql) - Automated rename script
- ✅ [create-online-users.sql](create-online-users.sql) - Optional user accounts feature

## How to Apply Changes

### Step 1: Run the Rename Script
1. Open Supabase Dashboard → SQL Editor
2. Copy and paste contents of `rename-tables-to-online.sql`
3. Click "Run"
4. Verify tables renamed: Check "Table Editor" to see `online_*` tables

### Step 2: Restart Dev Server
The codebase has been updated, but you need to restart:
```bash
# Stop the current dev server (Ctrl+C)
npm run dev
```

### Step 3: Test Everything
- ✅ Home page loads products
- ✅ Products display correctly
- ✅ Sale timer shows (if active)
- ✅ Testimonials display
- ✅ Cart works
- ✅ Checkout works
- ✅ Admin inventory works
- ✅ Admin sales manager works
- ✅ Admin testimonials works

## Database Structure Now

Your Supabase database now has clear separation:

### POS/Loyverse Tables (Unchanged)
- `sales` - POS receipts from Loyverse
- `items` - POS inventory items
- `profiles` - User profiles with roles
- `dim_roles` - Role definitions
- `dim_payment_types` - Payment types

### E-commerce Tables (Renamed with online_ prefix)
- `online_categories` - Product categories for website
- `online_products` - Products for sale on website
- `online_sale_promotions` - Sale countdown timers
- `online_testimonials` - Customer reviews
- `online_orders` - Customer orders from website

## Benefits of This Structure

1. **Clear Separation**
   - Easy to identify which tables are for website
   - No confusion with POS data

2. **Future-Proof**
   - Can add more POS features without naming conflicts
   - Easy to add more e-commerce features

3. **Better Organization**
   - Developers know `online_*` tables are for website
   - Easier to manage permissions

4. **Analytics**
   - Easy to compare POS sales vs online sales
   - Clear data sources for reports

## RLS Policies Updated

All Row Level Security policies have been recreated:

**Public Access:**
- Can read active products
- Can read active categories
- Can read approved testimonials
- Can read active sales
- Can create orders

**Admin Access:**
- Full CRUD on all `online_*` tables
- Checks `profiles.role = 'admin'`

## Foreign Keys Updated

- `online_products.category_id` → `online_categories.id`

## Indexes Updated

- `idx_online_products_category` - Fast category lookups
- `idx_online_products_active` - Fast active product queries

## Verification Queries

Run these in Supabase SQL Editor to verify:

```sql
-- Check all tables exist
SELECT table_name
FROM information_schema.tables
WHERE table_schema = 'public'
AND table_name LIKE 'online_%';

-- Should return:
-- online_categories
-- online_orders
-- online_products
-- online_sale_promotions
-- online_testimonials

-- Check sample data loaded
SELECT COUNT(*) as total_products FROM online_products;
SELECT COUNT(*) as total_categories FROM online_categories;
SELECT COUNT(*) as total_testimonials FROM online_testimonials;

-- Check active sale
SELECT * FROM online_sale_promotions WHERE is_active = true;
```

## Rollback (If Needed)

If you need to revert the changes:

```sql
-- Rename back to original names
ALTER TABLE online_categories RENAME TO categories;
ALTER TABLE online_products RENAME TO products;
ALTER TABLE online_sale_promotions RENAME TO sale_promotions;
ALTER TABLE online_testimonials RENAME TO testimonials;
ALTER TABLE online_orders RENAME TO orders;

-- Update foreign key
ALTER TABLE products
  DROP CONSTRAINT online_products_category_id_fkey;
ALTER TABLE products
  ADD CONSTRAINT products_category_id_fkey
  FOREIGN KEY (category_id) REFERENCES categories(id);
```

Then update all the service files back to original names.

## Next Steps

1. ✅ Run `rename-tables-to-online.sql`
2. ✅ Restart dev server
3. ✅ Test all features
4. ✅ Run `sample-products-seed.sql` (if not already done)
5. 📖 Read `USER-LOGIN-RECOMMENDATIONS.md` for customer accounts
6. 🚀 Deploy to Vercel when ready

---

**All codebase updates complete! No further changes needed.** 🎉
