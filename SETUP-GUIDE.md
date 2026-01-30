# Insurgents Store - Setup & Testing Guide

## Phase 11: Sample Data Setup ✓

### Step 1: Load Sample Products

1. Open Supabase Dashboard → SQL Editor
2. Copy and paste the contents of `sample-products-seed.sql`
3. Click "Run" to insert 15 sample products and 1 active sale promotion

**What you'll get:**
- 3 Running shoes (Nike Pegasus, Adidas Ultraboost, Asics Gel-Kayano)
- 3 Basketball shoes (LeBron 21, Dame 8, Jordan Why Not)
- 3 Casual shoes (Air Force 1, Stan Smith, Puma Suede)
- 6 Apparels (shirts, shorts, hoodie, joggers)
- 1 Active sale promotion (expires in 7 days)
- Many products with sale pricing

### Step 2: Add Product Images (Optional but Recommended)

You have two options:

**Option A: Via Admin Interface (Recommended)**
1. Login to admin: `http://localhost:5173/admin/login`
2. Navigate to Inventory
3. Click "Edit" on any product
4. Upload images using the drag-and-drop uploader
5. Save

**Option B: Manual URL Entry**
Edit products in Supabase dashboard and add image URLs in the `images` field:
```json
[
  {"url": "https://your-image-url.com/image1.jpg"},
  {"url": "https://your-image-url.com/image2.jpg"}
]
```

**Where to find product images:**
- Nike: nike.com
- Adidas: adidas.com
- Asics: asics.com
- Puma: puma.com
- Under Armour: underarmour.com
- Or use placeholder images from unsplash.com

### Step 3: Verify Everything Works

**Public Store:**
1. Visit `http://localhost:5173`
2. Check that products display on homepage
3. Verify sale countdown timer is visible
4. Check "On Sale" section shows discounted products
5. Verify testimonials section displays 8 Filipino reviews
6. Test adding products to cart
7. Test dark/light mode toggle
8. Test mobile responsive design (resize browser)

**Admin Panel:**
1. Login at `http://localhost:5173/admin/login`
2. **Dashboard**: View stats and recent orders
3. **Inventory**:
   - Search products
   - Edit product details
   - Upload images
   - Check stock levels
4. **Sales**:
   - View active sale promotion
   - Edit end date/message
   - Create new sale promotions
5. **Testimonials**:
   - View all testimonials
   - Approve/reject new testimonials
   - Feature testimonials on homepage
   - Edit testimonial content

**Checkout Flow:**
1. Add items to cart
2. Go to cart page
3. Proceed to checkout
4. Fill in customer information
5. Complete order
6. Should redirect to Maya payment link (or order confirmation if Maya not configured)

---

## Phase 12: Polish & Optimize 🎨

### Current Status
The application is fully functional! Here are optional enhancements:

### A. Loading States ✓
Already implemented:
- Spinner components used throughout
- React Query handles loading states
- Button loading states in forms

### B. Error Handling ✓
Already implemented:
- Toast notifications for success/error
- Form validation with React Hook Form + Zod
- Try-catch blocks in all service functions
- Supabase error handling

### C. Performance Optimizations
Consider adding:
1. **Image Optimization**
   - Use Next.js Image component (if migrating to Next.js)
   - Or: Add lazy loading to images: `loading="lazy"`
   - Compress images before upload

2. **Code Splitting**
   - Already automatic with Vite and React Router
   - Admin routes lazy loaded separately

3. **React Query Cache**
   - Already configured with staleTime and cacheTime
   - Reduces unnecessary API calls

### D. Accessibility
Add these improvements:
```javascript
// Add to images
<img alt="Product name" ... />

// Add ARIA labels
<button aria-label="Close modal">

// Keyboard navigation already works with semantic HTML
```

### E. SEO (if needed)
```javascript
// Install react-helmet-async
npm install react-helmet-async

// Add to each page
<Helmet>
  <title>Insurgents Store - Premium Shoes & Apparel</title>
  <meta name="description" content="Shop the latest shoes and apparel" />
</Helmet>
```

### F. Additional Features (Optional)
- [ ] Product search functionality
- [ ] Product filtering by price range
- [ ] Wishlist/favorites
- [ ] Product reviews from customers
- [ ] Order history for customers
- [ ] Email notifications via Supabase
- [ ] Product variants (different SKUs for colors/sizes)
- [ ] Inventory alerts when stock is low
- [ ] Analytics dashboard with charts
- [ ] Export orders to CSV

---

## Phase 13: Deploy to Vercel 🚀

### Prerequisites
1. GitHub account
2. Vercel account (free tier is fine)
3. Push code to GitHub repository

### Step 1: Prepare for Deployment

**Update .gitignore** (should already include):
```
node_modules
dist
.env
.env.local
```

**Update environment variables in .env:**
```env
VITE_SUPABASE_URL=https://dzdwvxgvkifppvycpobm.supabase.co
VITE_SUPABASE_ANON_KEY=your_anon_key_here
VITE_MAYA_PAYMENT_LINK=your_maya_link_here
```

### Step 2: Push to GitHub

```bash
git init
git add .
git commit -m "Initial commit - Insurgents Store"
git branch -M main
git remote add origin https://github.com/yourusername/insurgents-store.git
git push -u origin main
```

### Step 3: Deploy on Vercel

1. Go to [vercel.com](https://vercel.com)
2. Click "Import Project"
3. Import your GitHub repository
4. Vercel will auto-detect Vite configuration
5. Add Environment Variables:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`
   - `VITE_MAYA_PAYMENT_LINK`
6. Click "Deploy"

### Step 4: Post-Deployment

1. **Test the live site:**
   - Visit your Vercel URL (e.g., `insurgents-store.vercel.app`)
   - Test all features
   - Check mobile responsiveness on real device
   - Test admin login and CMS
   - Complete a test order

2. **Update Supabase Settings:**
   - Go to Supabase Dashboard → Authentication → URL Configuration
   - Add your Vercel URL to "Site URL"
   - Add to "Redirect URLs": `https://your-app.vercel.app/**`

3. **Update Maya Configuration:**
   - Configure Maya webhook to point to your Vercel URL (if using webhooks)
   - Test checkout flow with real payment

4. **Custom Domain (Optional):**
   - Go to Vercel project settings → Domains
   - Add your custom domain
   - Update DNS records as instructed

### Step 5: Monitoring

**Vercel Analytics** (Free):
- Automatic performance monitoring
- View in Vercel dashboard

**Supabase Logs**:
- Monitor database queries
- Check for errors
- View API usage

---

## Troubleshooting

### Products not loading
- Check `.env` has correct `VITE_SUPABASE_ANON_KEY`
- Restart dev server after changing `.env`
- Check browser console for errors
- Verify RLS policies in Supabase

### Admin login not working
- Verify admin user exists in `profiles` table with `role = 'admin'`
- Check Supabase Authentication → Users
- Try password reset

### Images not uploading
- Check storage policies in Supabase
- Verify bucket name is `product-images`
- Check file size (max 5MB per image)

### Maya payment not redirecting
- Verify `VITE_MAYA_PAYMENT_LINK` is set correctly
- Check browser console for errors
- Test with valid order data

### Dark mode not persisting
- Check localStorage in browser DevTools
- Verify `themeStore.js` persist configuration
- Clear browser cache and try again

---

## Tech Stack Summary

**Frontend:**
- ⚛️ React 18.3.1
- ⚡ Vite 6.0.5
- 🎨 Tailwind CSS 3.4.17
- 🧭 React Router v6
- 📊 React Query (TanStack Query)
- 🐻 Zustand (State Management)
- 📝 React Hook Form + Zod

**Backend:**
- 🗄️ Supabase (PostgreSQL)
- 🔐 Supabase Auth
- 📦 Supabase Storage
- 🔒 Row Level Security (RLS)

**Payment:**
- 💳 Maya Payment Gateway

**Deployment:**
- ▲ Vercel

---

## Project Structure

```
src/
├── components/
│   ├── common/           # Reusable UI components
│   │   ├── Button.jsx
│   │   ├── Card.jsx
│   │   ├── Input.jsx
│   │   ├── Modal.jsx
│   │   └── Spinner.jsx
│   ├── layout/           # Layout components
│   │   ├── Header.jsx
│   │   ├── Footer.jsx
│   │   ├── AdminLayout.jsx
│   │   ├── ProtectedRoute.jsx
│   │   └── ThemeToggle.jsx
│   ├── product/          # Product-specific components
│   │   ├── ProductCard.jsx
│   │   ├── PriceDisplay.jsx
│   │   └── SaleTimer.jsx
│   └── admin/            # Admin-specific components
│       ├── ImageUploader.jsx
│       └── ProductForm.jsx
├── pages/
│   ├── Home.jsx          # Public homepage
│   ├── Cart.jsx          # Shopping cart
│   ├── Checkout.jsx      # Checkout form
│   ├── OrderConfirmation.jsx
│   └── admin/            # Admin pages
│       ├── Login.jsx
│       ├── Dashboard.jsx
│       ├── Inventory.jsx
│       ├── SaleManager.jsx
│       └── Testimonials.jsx
├── hooks/                # Custom React hooks
│   ├── useAuth.js
│   ├── useSaleTimer.js
│   └── useTheme.js
├── services/             # API service functions
│   ├── products.js
│   ├── promotions.js
│   ├── orders.js
│   └── storage.js
├── store/                # Zustand stores
│   ├── cartStore.js
│   └── themeStore.js
├── lib/                  # Utilities
│   ├── supabase.js
│   └── utils.js
├── App.jsx               # Root component with routes
└── main.jsx              # Entry point
```

---

## Success Checklist

- [x] Project setup complete
- [x] Database schema created
- [x] Authentication working
- [x] Product display functional
- [x] Shopping cart working
- [x] Sale countdown timer visible
- [x] Admin CMS fully functional
- [x] Image upload working
- [x] Testimonials displaying
- [x] Checkout flow complete
- [x] Dark/light mode working
- [x] Mobile responsive
- [ ] Sample data loaded
- [ ] Product images uploaded
- [ ] All features tested
- [ ] Deployed to Vercel

---

## Next Steps

1. ✅ Run `sample-products-seed.sql` in Supabase
2. ⚡ Upload product images via admin panel
3. 🧪 Test all features thoroughly
4. 🚀 Deploy to Vercel
5. 🎉 Launch your store!

---

## Support & Resources

**Documentation:**
- [React](https://react.dev)
- [Vite](https://vitejs.dev)
- [Tailwind CSS](https://tailwindcss.com)
- [Supabase](https://supabase.com/docs)
- [React Query](https://tanstack.com/query)
- [Zustand](https://github.com/pmndrs/zustand)

**Supabase Dashboard:**
https://app.supabase.com/project/dzdwvxgvkifppvycpobm

**Need Help?**
- Check browser console for errors
- Check Supabase logs
- Review RLS policies
- Verify environment variables

---

**Built with ❤️ using Claude Code**
