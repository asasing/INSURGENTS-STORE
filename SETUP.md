# Insurgents Store - Setup Guide

## 1. Supabase Setup

### Step 1: Get your Supabase Anon Key
1. Go to your Supabase Dashboard: https://supabase.com/dashboard
2. Select your project
3. Click on "Settings" (gear icon) in the sidebar
4. Click on "API"
5. Copy the `anon` `public` key
6. Update your `.env` file:
   ```env
   VITE_SUPABASE_ANON_KEY=your_anon_key_here
   ```

### Step 2: Run Database Migration
1. In your Supabase Dashboard, click on "SQL Editor" in the sidebar
2. Click "New Query"
3. Open the file `supabase-migration.sql` in this project
4. Copy all the SQL and paste it into the SQL Editor
5. Click "Run" to execute the migration
6. You should see "Success. No rows returned" or similar success message

### Step 3: Create Storage Bucket
1. In Supabase Dashboard, go to "Storage" in the sidebar
2. Click "Create a new bucket"
3. Name it: `product-images`
4. Make it **Public**
5. Click "Create bucket"

### Step 4: Set Storage Policies
1. Click on the `product-images` bucket
2. Click on "Policies" tab
3. Click "New Policy"
4. Create three policies:

**Policy 1: Public Read**
- Policy name: `Public read product images`
- Allowed operation: `SELECT`
- Policy definition:
  ```sql
  bucket_id = 'product-images'
  ```

**Policy 2: Admin Upload**
- Policy name: `Admins upload images`
- Allowed operation: `INSERT`
- Policy definition:
  ```sql
  bucket_id = 'product-images' AND
  EXISTS (SELECT 1 FROM admin_users WHERE id = auth.uid())
  ```

**Policy 3: Admin Delete**
- Policy name: `Admins delete images`
- Allowed operation: `DELETE`
- Policy definition:
  ```sql
  bucket_id = 'product-images' AND
  EXISTS (SELECT 1 FROM admin_users WHERE id = auth.uid())
  ```

### Step 5: Create Admin User
1. In Supabase Dashboard, go to "Authentication" > "Users"
2. Click "Add user" > "Create new user"
3. Enter your email and password
4. Click "Create user"
5. Copy the user's UUID

### Step 6: Add Admin User to admin_users Table
1. Go to "SQL Editor"
2. Run this query (replace with your UUID and email):
   ```sql
   INSERT INTO admin_users (id, email, full_name, is_active)
   VALUES (
     'YOUR_USER_UUID_HERE',
     'your@email.com',
     'Your Full Name',
     true
   );
   ```

## 2. Maya Payment Link Setup

1. Get your Maya payment link
2. Update `.env`:
   ```env
   VITE_MAYA_PAYMENT_LINK=your_maya_link_here
   ```

## 3. Run the Application

```bash
# Install dependencies (if not already done)
npm install

# Start development server
npm run dev
```

The app should open at http://localhost:5173

## 4. Verify Database Setup

Run these queries in Supabase SQL Editor to verify:

```sql
-- Check categories
SELECT * FROM categories ORDER BY display_order;

-- Check testimonials
SELECT customer_name, rating, is_approved FROM testimonials;

-- Check active sales
SELECT * FROM sales WHERE is_active = true;

-- Check admin user
SELECT * FROM admin_users;
```

## Next Steps

Once the database is set up:
1. You can log in to the admin panel at `/admin/login`
2. Add products through the inventory management
3. Upload product images
4. Configure sale timers
5. Moderate testimonials

## Troubleshooting

### Issue: "Missing Supabase environment variables"
- Make sure you've added `VITE_SUPABASE_ANON_KEY` to your `.env` file
- Restart the dev server after updating `.env`

### Issue: Can't log in to admin
- Make sure you created the admin user in Supabase Auth
- Make sure you added the user to the `admin_users` table with the correct UUID
- Check that `is_active = true` in the admin_users table

### Issue: RLS policy errors
- Make sure all RLS policies were created successfully
- Check that the admin_users table has your user record

## Development Workflow

1. **Adding Products**: Use the admin CMS at `/admin/inventory`
2. **Managing Sales**: Use the sale manager at `/admin/sales`
3. **Moderating Testimonials**: Use testimonials page at `/admin/testimonials`
4. **Testing Dark Mode**: Click the theme toggle in the header

Enjoy building your store!
