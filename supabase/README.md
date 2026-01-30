# Supabase SQL Scripts

All SQL scripts for setting up and managing your Supabase database.

## 🚀 Quick Start (Run These in Order)

### 1. Initial Setup (Required)
**File:** `create-online-tables-fresh.sql`

Creates all e-commerce tables with `online_` prefix, RLS policies, and seeds initial data.

**Run this first!**

**Creates:**
- `online_categories` (6 categories)
- `online_products` (empty, ready for products)
- `online_sale_promotions` (empty)
- `online_testimonials` (8 Filipino reviews)
- `online_orders` (empty)

### 2. Sample Data (Recommended)
**File:** `sample-products-seed.sql`

Adds 15 sample products and 1 active sale promotion.

**Run after step 1**

**Adds:**
- 3 Running shoes
- 3 Basketball shoes
- 3 Casual shoes
- 6 Apparels
- 1 Active sale (expires in 7 days)

### 3. Customer Accounts (Optional)
**File:** `create-online-users.sql`

Adds customer login functionality with saved addresses and promo subscriptions.

**Run only if you want customer accounts**

**Adds:**
- `online_users` table
- `promo_subscriptions` table
- Auto-creation triggers

> 💡 Read `../USER-LOGIN-RECOMMENDATIONS.md` before implementing

---

## 📂 All Available Scripts

### Active Scripts (Use These)

| File | Purpose | When to Use |
|------|---------|-------------|
| `create-online-tables-fresh.sql` | ✅ **Main Setup** - Creates all tables | **Run first** |
| `sample-products-seed.sql` | ✅ Add sample products | After main setup |
| `create-online-users.sql` | ⚙️ Optional user accounts | If you want customer login |
| `check-and-cleanup-old-tables.sql` | 🧹 Check/delete old tables | If you have duplicate tables |

### Legacy/Reference Scripts (Don't Use)

| File | Purpose | Note |
|------|---------|------|
| `rename-tables-to-online.sql` | Rename existing tables | For migration only, not needed for fresh setup |
| `storage-policies.sql` | Storage bucket policies | Already included in main setup |
| `supabase-ecommerce-tables-v2.sql` | Old setup script | Replaced by `create-online-tables-fresh.sql` |
| `supabase-ecommerce-tables.sql` | Older setup script | Deprecated |
| `supabase-migration.sql` | Initial migration | Deprecated |
| `supabase-migration-fixed.sql` | Migration fix | Deprecated |

---

## 📖 Detailed Script Descriptions

### create-online-tables-fresh.sql
**Purpose:** Complete database setup for e-commerce

**What it does:**
- Creates 5 main tables with `online_` prefix
- Sets up Row Level Security (RLS) policies
- Creates indexes for performance
- Seeds 6 product categories
- Seeds 8 Filipino testimonials
- Configures public read access
- Configures admin full access (checks `profiles.role = 'admin'`)

**Tables Created:**
```
online_categories    (6 rows: Top Selling, Apparels, Running, Basketball, Casual, On Sale)
online_products      (0 rows - ready for products)
online_sale_promotions (0 rows - ready for sales)
online_testimonials  (8 rows - Filipino reviews)
online_orders        (0 rows - ready for orders)
```

**RLS Policies:**
- ✅ Public can read active products, categories, approved testimonials, active sales
- ✅ Public can create orders (checkout)
- ✅ Admins (profiles.role = 'admin') have full CRUD access

---

### sample-products-seed.sql
**Purpose:** Add realistic sample products for testing

**What it adds:**
```
Running Shoes (3):
- Nike Air Zoom Pegasus 40 (₱7,495 → ₱5,996)
- Adidas Ultraboost 23 (₱9,995 → ₱7,496)
- Asics Gel-Kayano 30 (₱8,995)

Basketball Shoes (3):
- Nike LeBron 21 (₱10,995 → ₱8,796)
- Adidas Dame 8 (₱6,995 → ₱5,596)
- Jordan Why Not .6 (₱7,495)

Casual Shoes (3):
- Nike Air Force 1 07 (₱5,995 → ₱4,496)
- Adidas Stan Smith (₱4,995)
- Puma Suede Classic (₱3,995 → ₱2,996)

Apparels (6):
- Nike Dri-FIT Running Shirt (₱1,495 → ₱1,196)
- Under Armour Tech 2.0 Tee (₱1,295)
- Adidas Training Shorts (₱1,695 → ₱1,356)
- Nike Tech Fleece Hoodie (₱4,995 → ₱3,996)
- Puma Logo Joggers (₱2,495 → ₱1,996)

Sale Promotion:
- Year-End Clearance Sale (expires in 7 days)
```

**Features:**
- Multiple sizes (shoes: 6-13, apparel: S-XXL)
- Multiple colors
- Sale pricing on selected items
- Stock quantities
- Featured products marked

---

### create-online-users.sql
**Purpose:** Add customer account functionality

**What it adds:**

**online_users table:**
```sql
- id (links to auth.users)
- email
- full_name
- phone
- email_promo_consent (boolean)
- email_order_updates (boolean)
- saved_addresses (JSONB array)
- created_at / updated_at
```

**promo_subscriptions table:**
```sql
- id
- email
- full_name
- source (website, checkout, popup)
- is_active
- subscribed_at / unsubscribed_at
```

**Features:**
- Auto-creates user entry on signup
- Links orders to users
- Saves multiple shipping addresses
- Email subscription management
- RLS policies for privacy

**When to use:**
- Want to track repeat customers
- Need order history feature
- Want to send promotional emails
- Building loyalty program

> 📚 See `../USER-LOGIN-RECOMMENDATIONS.md` for implementation guide

---

### check-and-cleanup-old-tables.sql
**Purpose:** Check for and remove old table versions

**Use Cases:**
- You have duplicate tables (both `products` and `online_products`)
- You want to clean up after migration
- Checking database state

**Safe to run:** Yes - checks first before deleting anything

**Steps:**
1. STEP 1: Check if old tables exist
2. STEP 2: Check if they have data
3. STEP 3: Delete old tables (manual - uncomment to execute)
4. STEP 4: Verify cleanup successful

---

## 🔧 How to Run SQL Scripts

### In Supabase Dashboard:
1. Go to **SQL Editor**
2. Click **"New Query"**
3. Copy and paste script contents
4. Click **"Run"** or press `Ctrl+Enter`
5. Check output for errors

### Tips:
- ✅ Run scripts one at a time
- ✅ Read comments in scripts before running
- ✅ Check verification queries at the end
- ✅ Keep SQL Editor tab open to see results
- ⚠️ Don't run legacy scripts (marked as deprecated)

---

## ✅ Verification

After running scripts, verify with:

```sql
-- Check all tables exist
SELECT table_name
FROM information_schema.tables
WHERE table_schema = 'public'
AND table_name LIKE 'online_%'
ORDER BY table_name;

-- Check data counts
SELECT
  'Categories' as table_name,
  COUNT(*) as count
FROM online_categories
UNION ALL
SELECT 'Products', COUNT(*) FROM online_products
UNION ALL
SELECT 'Testimonials', COUNT(*) FROM online_testimonials
UNION ALL
SELECT 'Sale Promotions', COUNT(*) FROM online_sale_promotions
UNION ALL
SELECT 'Orders', COUNT(*) FROM online_orders;
```

**Expected Results:**
```
online_categories       (6 rows)
online_orders           (0 rows)
online_products         (15 rows if sample data loaded)
online_sale_promotions  (1 row if sample data loaded)
online_testimonials     (8 rows)
```

---

## 🐛 Troubleshooting

### "relation does not exist"
**Solution:** Run `create-online-tables-fresh.sql` first

### "permission denied"
**Solution:** Check you're logged in as admin in Supabase

### "duplicate key value"
**Solution:** Script already ran successfully, skip it

### "no rows returned"
**Solution:** Expected for verification queries if no data yet

---

## 📝 Database Schema

```
┌─────────────────────┐
│ online_categories   │
├─────────────────────┤
│ id (uuid)           │
│ name                │
│ slug                │
│ display_order       │
│ is_active           │
└─────────────────────┘
         ↓
┌─────────────────────┐
│ online_products     │
├─────────────────────┤
│ id (uuid)           │
│ category_id (fk)    │
│ name                │
│ description         │
│ price               │
│ sale_price          │
│ stock_quantity      │
│ sizes (jsonb)       │
│ colors (jsonb)      │
│ images (jsonb)      │
│ is_featured         │
│ is_active           │
└─────────────────────┘

┌──────────────────────┐
│ online_testimonials  │
├──────────────────────┤
│ id (uuid)            │
│ customer_name        │
│ rating               │
│ comment              │
│ is_approved          │
│ is_featured          │
└──────────────────────┘

┌──────────────────────────┐
│ online_sale_promotions   │
├──────────────────────────┤
│ id (uuid)                │
│ name                     │
│ end_date                 │
│ is_active                │
│ message                  │
└──────────────────────────┘

┌─────────────────────┐
│ online_orders       │
├─────────────────────┤
│ id (uuid)           │
│ customer_email      │
│ customer_name       │
│ customer_phone      │
│ items (jsonb)       │
│ total               │
│ status              │
│ shipping_address    │
│ user_id (optional)  │
└─────────────────────┘
```

---

## 🔗 Related Documentation

- [../DATABASE-SETUP-INSTRUCTIONS.md](../DATABASE-SETUP-INSTRUCTIONS.md) - Complete setup guide
- [../USER-LOGIN-RECOMMENDATIONS.md](../USER-LOGIN-RECOMMENDATIONS.md) - Customer accounts guide
- [../TABLE-RENAME-SUMMARY.md](../TABLE-RENAME-SUMMARY.md) - Why tables are named `online_*`
- [../SETUP-GUIDE.md](../SETUP-GUIDE.md) - Full project setup

---

**Need Help?** Check the troubleshooting section or refer to the main setup guide.
