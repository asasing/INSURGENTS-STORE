# Quick Setup Guide (Using Existing Supabase)

Since you already have Supabase tables and a `profiles` table with roles, here's the simplified setup:

## Step 1: Run E-commerce Tables Migration

1. Open Supabase Dashboard → SQL Editor
2. Copy content from [supabase-ecommerce-tables.sql](supabase-ecommerce-tables.sql)
3. Paste and click "Run"

This will create:
- ✅ `categories` (6 product categories)
- ✅ `products` (product catalog)
- ✅ `sales` (sale promotions)
- ✅ `testimonials` (8 Filipino testimonials pre-seeded)
- ✅ `orders` (customer orders)

**Important**: These tables use your existing `profiles` table for admin authentication!

## Step 2: Update Environment Variables

1. Get your Supabase anon key:
   - Dashboard → Settings → API
   - Copy the `anon` `public` key

2. Update [.env](.env):
   ```env
   VITE_SUPABASE_ANON_KEY=your_anon_key_here
   ```

## Step 3: Create Storage Bucket

1. Supabase Dashboard → Storage
2. Click "Create a new bucket"
3. Name: `product-images`
4. Make it **Public**
5. Click "Create bucket"

### Add Storage Policies

Click on the bucket → Policies → New Policy:

**Policy 1: Public Read**
```sql
bucket_id = 'product-images'
```
Operation: SELECT

**Policy 2: Admin Upload**
```sql
bucket_id = 'product-images' AND
EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
```
Operation: INSERT

**Policy 3: Admin Delete**
```sql
bucket_id = 'product-images' AND
EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
```
Operation: DELETE

## Step 4: Set Up Admin User

Your existing user just needs to have `role = 'admin'` in the `profiles` table.

**Option A: Update existing user**
```sql
UPDATE profiles
SET role = 'admin'
WHERE email = 'your@email.com';
```

**Option B: Create new admin user**
1. Authentication → Users → Add user
2. Enter email and password
3. Copy the user UUID
4. Run:
```sql
UPDATE profiles
SET role = 'admin'
WHERE id = 'YOUR_UUID_HERE';
```

Or if profile doesn't exist yet:
```sql
INSERT INTO profiles (id, email, role)
VALUES ('YOUR_UUID_HERE', 'your@email.com', 'admin');
```

## Step 5: Start the App

```bash
npm run dev
```

Visit http://localhost:5173

## What Works Now

✅ **Homepage** with hero section
✅ **8 Filipino testimonials** displaying
✅ **Dark/Light mode** toggle
✅ **Navigation** menu (6 categories)
✅ **Shopping cart** (add to cart functionality)
✅ **Admin login** at `/admin/login`
✅ **Admin dashboard** at `/admin/dashboard`

## Testing Admin Access

1. Go to http://localhost:5173/admin/login
2. Sign in with your admin user credentials
3. You'll be redirected to the dashboard
4. Protected routes check `profiles.role = 'admin'`

## Verify Setup

Run these queries in Supabase SQL Editor:

```sql
-- Check categories (should return 6)
SELECT * FROM categories ORDER BY display_order;

-- Check testimonials (should return 8)
SELECT customer_name, rating FROM testimonials;

-- Check your admin user
SELECT id, email, role FROM profiles WHERE role = 'admin';

-- Check sales
SELECT * FROM sales WHERE is_active = true;
```

## Next Steps

Once everything is working:

1. **Add sample products** (we'll build the admin UI for this in Phase 9)
2. **Test the shopping cart**
3. **Verify dark mode**
4. **Continue with remaining phases**

## Troubleshooting

**Issue: Can't login**
- Check that your user has `role = 'admin'` in profiles table
- Verify email/password are correct
- Check browser console for errors

**Issue: Testimonials not showing**
- Run: `SELECT COUNT(*) FROM testimonials WHERE is_approved = true;`
- Should return 8

**Issue: "Missing environment variables"**
- Make sure `VITE_SUPABASE_ANON_KEY` is in `.env`
- Restart dev server after updating `.env`

## Database Schema Notes

Your setup uses:
- **Existing**: `profiles` table (with roles: admin, staff, viewer)
- **Existing**: `items` table (from Loyverse)
- **New**: `products` table (e-commerce products, separate from items)
- **New**: `categories`, `sales`, `testimonials`, `orders`

The `products` table has an optional `item_id` field if you want to link products to your existing Loyverse items later.

## RLS Security

All admin operations check:
```sql
EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
```

This works with your existing profiles table structure!
