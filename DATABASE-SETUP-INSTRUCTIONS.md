# Database Setup Instructions

## Error: "relation online_orders does not exist"

This means the tables haven't been created yet. Use this guide to set up your database correctly.

## Step-by-Step Setup

### Step 1: Create Tables with "online_" Prefix

Since the tables don't exist yet, we'll create them fresh with the correct names.

1. Open **Supabase Dashboard**
2. Go to **SQL Editor**
3. Copy and paste the contents of **`supabase/create-online-tables-fresh.sql`**
4. Click **"Run"**

**What this script does:**
- ✅ Creates all 5 tables with `online_` prefix
- ✅ Creates indexes for better performance
- ✅ Sets up Row Level Security (RLS) policies
- ✅ Seeds 6 product categories
- ✅ Seeds 8 Filipino testimonials
- ✅ Shows verification queries

**Tables created:**
- `online_categories` (with 6 categories)
- `online_products` (empty, ready for products)
- `online_sale_promotions` (empty, ready for sales)
- `online_testimonials` (with 8 reviews)
- `online_orders` (empty, ready for orders)

### Step 2: Load Sample Products

After Step 1 completes successfully:

1. In **SQL Editor**
2. Copy and paste the contents of **`supabase/sample-products-seed.sql`**
3. Click **"Run"**

**What this adds:**
- ✅ 15 sample products (shoes and apparel)
- ✅ 1 active sale promotion (expires in 7 days)
- ✅ Products with sale pricing
- ✅ Multiple sizes and colors

### Step 3: (Optional) Add User Accounts

If you want customer login functionality:

1. In **SQL Editor**
2. Copy and paste the contents of **`supabase/create-online-users.sql`**
3. Click **"Run"**

**What this adds:**
- `online_users` table for customer accounts
- `promo_subscriptions` table for email marketing
- Auto-creation trigger for new signups

> **Note:** Read `USER-LOGIN-RECOMMENDATIONS.md` before implementing this. Guest checkout is recommended as primary flow.

### Step 4: Restart Your Dev Server

After running the SQL scripts:

```bash
# Stop current dev server (Ctrl+C in terminal)
npm run dev
```

### Step 5: Test Everything

Visit `http://localhost:5173` and verify:

**Public Site:**
- [ ] Home page loads
- [ ] Products display (after running sample-products-seed.sql)
- [ ] Sale timer shows (if active sale exists)
- [ ] Testimonials display (8 Filipino reviews)
- [ ] Can add to cart
- [ ] Cart page works
- [ ] Checkout form works
- [ ] Dark/light mode toggle works

**Admin Panel** (`http://localhost:5173/admin/login`):
- [ ] Can login with admin account
- [ ] Dashboard shows stats
- [ ] Inventory page shows products
- [ ] Can add/edit/delete products
- [ ] Sales manager works
- [ ] Testimonials moderation works

## Troubleshooting

### "relation online_products does not exist"
**Solution:** Run `create-online-tables-fresh.sql` first

### "permission denied for table online_products"
**Solution:** Check RLS policies were created. Re-run the script.

### "No products displaying on homepage"
**Solution:**
1. Run `sample-products-seed.sql` to add sample data
2. Or add products via Admin → Inventory

### "Invalid API key" error
**Solution:**
1. Check `.env` has `VITE_SUPABASE_ANON_KEY`
2. Get anon key from Supabase → Settings → API
3. Restart dev server

### "Cannot login to admin"
**Solution:**
1. Check admin user exists in Supabase Auth
2. Verify `profiles` table has entry with `role = 'admin'`
3. Create admin user:
   ```sql
   -- Check if admin exists
   SELECT * FROM profiles WHERE role = 'admin';

   -- If not, add your user as admin
   UPDATE profiles
   SET role = 'admin'
   WHERE email = 'your-email@example.com';
   ```

## SQL Scripts Overview

| Script | Purpose | When to Run |
|--------|---------|-------------|
| `supabase/create-online-tables-fresh.sql` | Create all tables + seed categories/testimonials | **Run First** |
| `supabase/sample-products-seed.sql` | Add 15 sample products + active sale | Run after tables created |
| `supabase/create-online-users.sql` | Add customer accounts (optional) | Run if you want user login |
| `supabase/check-and-cleanup-old-tables.sql` | Check/delete old tables | If you have duplicates |

> 📂 All SQL scripts are now in the `supabase/` folder. See `supabase/README.md` for full documentation.

## Database Structure After Setup

```
Supabase Tables:
├── profiles (existing - for admin auth)
├── sales (existing - Loyverse POS data)
├── items (existing - Loyverse inventory)
├── online_categories ✨ (6 categories)
├── online_products ✨ (15 sample products)
├── online_sale_promotions ✨ (1 active sale)
├── online_testimonials ✨ (8 reviews)
└── online_orders ✨ (customer orders)
```

## Next Steps After Setup

1. **Upload Product Images**
   - Login to admin at `/admin/inventory`
   - Click "Edit" on any product
   - Use drag-and-drop uploader
   - Upload real product images

2. **Configure Sale Promotion**
   - Go to `/admin/sales`
   - Edit the active sale
   - Set appropriate end date
   - Customize message

3. **Review Testimonials**
   - Go to `/admin/testimonials`
   - Approve/feature testimonials
   - Edit content if needed

4. **Test Checkout Flow**
   - Add products to cart
   - Go through checkout
   - Verify order created in database

5. **Deploy to Vercel**
   - Follow deployment guide in `SETUP-GUIDE.md`
   - Configure environment variables
   - Test production site

## Verification Query

Run this in SQL Editor to confirm everything is set up:

```sql
-- Check all online tables exist
SELECT
  table_name,
  (SELECT COUNT(*) FROM information_schema.columns WHERE table_name = t.table_name) as column_count
FROM information_schema.tables t
WHERE table_schema = 'public'
AND table_name LIKE 'online_%'
ORDER BY table_name;

-- Check data counts
SELECT 'Categories' as table_name, COUNT(*) as count FROM online_categories
UNION ALL
SELECT 'Products', COUNT(*) FROM online_products
UNION ALL
SELECT 'Testimonials', COUNT(*) FROM online_testimonials
UNION ALL
SELECT 'Sale Promotions', COUNT(*) FROM online_sale_promotions
UNION ALL
SELECT 'Orders', COUNT(*) FROM online_orders;

-- Check RLS policies
SELECT tablename, policyname, cmd
FROM pg_policies
WHERE tablename LIKE 'online_%'
ORDER BY tablename, policyname;
```

Expected output:
- 5 online tables
- 6 categories
- 0-15 products (depending on if you ran sample data)
- 8 testimonials
- 0-1 sale promotions
- Multiple RLS policies per table

---

**All set! Your database is ready to go.** 🎉
