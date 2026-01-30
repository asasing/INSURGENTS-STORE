# Final Setup Instructions

## 🎯 Updated for Your Existing Supabase Tables

Your setup already has:
- ✅ `profiles` table (with roles: admin, staff, viewer)
- ✅ `sales` table (Loyverse POS receipts)
- ✅ `items` table (Loyverse inventory)
- ✅ `dim_roles`, `dim_payment_types` tables

So we've created **separate e-commerce tables** to avoid conflicts:

## New E-commerce Tables

| Table | Purpose |
|-------|---------|
| `categories` | Product categories (Top Selling, Apparels, etc.) |
| `products` | E-commerce product catalog (separate from Loyverse items) |
| `sale_promotions` | Sale timers/promotions (NOT Loyverse sales) |
| `testimonials` | Customer reviews |
| `orders` | E-commerce orders (separate from Loyverse receipts) |

## Quick Setup (5 Steps)

### Step 1: Run the Migration (2 min)

1. Open Supabase Dashboard → SQL Editor
2. Copy ALL content from **[supabase-ecommerce-tables-v2.sql](supabase-ecommerce-tables-v2.sql)**
3. Paste and click "Run"

✅ This creates the 5 new tables with Filipino testimonials pre-loaded!

### Step 2: Update .env (1 min)

Get your Supabase anon key:
- Dashboard → Settings → API → Copy `anon` `public` key

Update [.env](.env):
```env
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

### Step 3: Set Admin Role (1 min)

Make your user an admin:

```sql
-- Update existing user
UPDATE profiles
SET role = 'admin'
WHERE email = 'your@email.com';
```

Or if you need to create the profile:
```sql
-- Get your user ID from Authentication → Users
INSERT INTO profiles (id, email, role)
VALUES ('your-user-uuid', 'your@email.com', 'admin');
```

### Step 4: Create Storage Bucket (2 min)

1. **Create bucket**:
   - Dashboard → Storage → New bucket
   - Name: `product-images`
   - **Public**: Yes ✅

2. **Add policies** (click bucket → Policies → New Policy):

**Policy 1: Public Read**
- Name: "Public read product images"
- Allowed operation: SELECT
- Policy definition:
  ```sql
  bucket_id = 'product-images'
  ```

**Policy 2: Admin Upload**
- Name: "Admins upload images"
- Allowed operation: INSERT
- Policy definition:
  ```sql
  bucket_id = 'product-images' AND
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
  ```

**Policy 3: Admin Delete**
- Name: "Admins delete images"
- Allowed operation: DELETE
- Policy definition:
  ```sql
  bucket_id = 'product-images' AND
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
  ```

### Step 5: Start the App

```bash
npm run dev
```

Visit: http://localhost:5173

## ✨ What You'll See

### Homepage
- 🎨 Beautiful gradient hero section
- ⏱️ **NEW! Sale countdown timer** (if active promotion exists)
- 💬 8 Filipino testimonials displaying
- 🛍️ Product sections (empty until you add products)
- 🌓 Dark/Light mode toggle
- 📱 Mobile-responsive design

### Sale Timer
The countdown timer appears at the top when a sale promotion is active! It shows:
- Days, Hours, Minutes, Seconds countdown
- Custom sale message
- Auto-hides when sale ends

### Admin Panel
- Login: http://localhost:5173/admin/login
- Dashboard with stats
- Protected routes (checks `profiles.role = 'admin'`)

## 🔍 Verify Setup

Run these in Supabase SQL Editor:

```sql
-- Check categories (should return 6)
SELECT * FROM categories ORDER BY display_order;

-- Check testimonials (should return 8)
SELECT customer_name, rating FROM testimonials WHERE is_approved = true;

-- Check sale promotion (should return 1)
SELECT * FROM sale_promotions WHERE is_active = true;

-- Verify your admin user
SELECT id, email, role FROM profiles WHERE role = 'admin';
```

## 📊 Database Relationships

```
Your Existing Tables (Untouched):
├── profiles (used for admin auth)
├── sales (Loyverse POS receipts)
├── items (Loyverse inventory)
├── dim_roles
└── dim_payment_types

New E-commerce Tables:
├── categories (6 categories)
├── products → categories
│   └── (optional) → items (via item_id)
├── sale_promotions (sale timers)
├── testimonials → products
└── orders (customer purchases)
```

## 🎯 Phase 7 Complete!

You now have:
- ✅ Phase 1-6: All core features
- ✅ **Phase 7: Sale countdown timer** 🎉

The timer will automatically:
- Fetch active promotions from `sale_promotions` table
- Display countdown (Days:Hours:Minutes:Seconds)
- Update every second
- Hide when sale expires

## 🚀 Next Steps

### Test the Sale Timer

Add a test promotion:
```sql
INSERT INTO sale_promotions (name, end_date, is_active, message)
VALUES (
  'Test Flash Sale',
  NOW() + INTERVAL '1 hour',
  true,
  '⚡ Flash Sale - 50% Off!'
);
```

Refresh the homepage and you'll see the countdown timer!

### Remaining Phases

- **Phase 8**: Checkout & Maya payment (coming next)
- **Phase 9**: Admin inventory UI (add/edit products)
- **Phase 10**: Sale promotion manager + testimonial moderation
- **Phase 11**: Add sample products with images
- **Phase 12**: Polish & optimize
- **Phase 13**: Deploy to Vercel

## ⚠️ Important Notes

1. **Table Names**:
   - Use `sale_promotions` (NOT `sales` - that's for Loyverse)
   - Use `products` (separate from Loyverse `items`)
   - Use `orders` (separate from Loyverse receipts)

2. **Admin Authentication**:
   - Uses your existing `profiles` table
   - Checks `profiles.role = 'admin'`
   - No separate admin_users table needed

3. **Storage**:
   - Bucket must be **public** for product images
   - Policies use `profiles.role = 'admin'` for uploads

## 🐛 Troubleshooting

**Timer not showing?**
- Check: `SELECT * FROM sale_promotions WHERE is_active = true;`
- Make sure `end_date` is in the future
- Check browser console for errors

**Can't login?**
- Verify: `SELECT role FROM profiles WHERE email = 'your@email.com';`
- Should return `admin`

**Testimonials not showing?**
- Run: `SELECT COUNT(*) FROM testimonials WHERE is_approved = true;`
- Should return 8

**Products not displaying?**
- This is normal! You haven't added products yet
- We'll build the admin inventory UI in Phase 9

---

**Ready to continue with Phase 8 (Checkout) or test what we have?**
