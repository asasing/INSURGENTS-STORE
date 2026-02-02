# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Insurgents Store is a modern, mobile-first e-commerce platform for shoes and apparel built with React, Vite, Tailwind CSS, and Supabase. The store features:

- Complete shopping cart and checkout flow with Maya payment integration
- Time-based discount system with priority resolution (product and category-level)
- Promo code system with usage tracking and free shipping support
- Location-based shipping zones with fuzzy city matching
- Admin dashboard for inventory, discounts, orders, and settings management
- PostHog analytics integration for conversion tracking
- Black/white/gray theme with dark mode support

## Development Commands

```bash
# Start development server (default port: 5173)
npm run dev

# Build for production
npm run build

# Preview production build locally
npm run preview

# Install dependencies
npm install
```

## Environment Configuration

Required environment variables in `.env`:
```env
VITE_SUPABASE_URL=your-supabase-url
VITE_SUPABASE_ANON_KEY=your-supabase-anon-key
VITE_MAYA_PUBLIC_KEY=your-maya-public-key
VITE_MAYA_SECRET_KEY=your-maya-secret-key
VITE_MAYA_API_BASE=https://pg-sandbox.paymaya.com
VITE_PUBLIC_POSTHOG_KEY=your-posthog-key
VITE_PUBLIC_POSTHOG_HOST=https://app.posthog.com
```

**Maya Configuration:**
- Use `https://pg-sandbox.paymaya.com` for development/testing
- Use `https://pg.paymaya.com` for production
- In Vercel, set `VITE_MAYA_API_BASE` to production URL for live deployment

**PostHog Configuration (optional):**
- Set `VITE_PUBLIC_POSTHOG_KEY` and `VITE_PUBLIC_POSTHOG_HOST` to enable analytics
- Omitting these variables disables analytics tracking
- See `ANALYTICS-TRACKING.md` and `POSTHOG-GUIDE.md` for detailed setup

## Architecture Overview

### State Management Strategy

**Two-tier state management:**

1. **Client State (Zustand with persistence)**
   - Cart items: `src/store/cartStore.js`
   - Theme preference: `src/store/themeStore.js`
   - Both use Zustand's `persist` middleware for localStorage persistence

2. **Server State (React Query)**
   - All Supabase data fetching uses React Query
   - Custom hooks in `src/hooks/` wrap React Query
   - Configuration: 5min stale time, 10min cache time (see `src/main.jsx`)

**Pattern:** Never mix concerns. Cart/theme = Zustand. Products/orders/categories = React Query.

### Database Architecture

**Table Naming Convention:**
- E-commerce tables: `online_*` prefix (e.g., `online_products`, `online_orders`, `online_categories`)
- Settings table: `site_settings` (for logo, site name, etc.)
- Admin table: `admin_users`
- **Important:** Loyverse POS tables exist without prefix (`items`, `sales`). The `online_*` prefix separates e-commerce from POS data. Do not modify POS tables - n8n handles synchronization.

**Key Tables:**
- `online_products`: Product catalog with pricing, images (JSONB), inventory, categories
- `online_orders`: Customer orders with JSONB items array, shipping address, status tracking, promo codes, shipping fees
- `online_categories`: Product categories with slugs for routing
- `online_sale_promotions`: Sale timers with end dates
- `online_testimonials`: Customer reviews with approval status
- `online_discounts`: Product/category discount rules with priority, date ranges (replaces sale_price column)
- `online_discount_products`: Junction table linking discounts to specific products (for manual application)
- `online_promo_codes`: Checkout-level promo codes with usage tracking and minimum order amounts
- `online_shipping_zones`: Location-based shipping zones with city arrays and fee amounts
- `site_settings`: Key-value pairs for site configuration (logo URL, site name, etc.)

**Storage Buckets:**
- `product-images`: For product photos
- `AssetsYour`: For logos and site assets (created via `supabase/create-assets-bucket.sql`)

### Routing Architecture

**Public Routes (with Header/Footer/SaleTimer):**
- `/` - Home page with product grid
- `/category/:slug` - Category pages (supports special slugs: `all-items`, `new-arrivals`, `on-sale`, `top-selling`)
- `/cart` - Shopping cart
- `/checkout` - Checkout form with Maya integration
- `/order-confirmation/:orderId` - Order confirmation

**Admin Routes (protected, with AdminLayout):**
- `/admin/login` - Admin authentication
- `/admin/dashboard` - Overview stats
- `/admin/orders` - Order management and tracking
- `/admin/inventory` - Product CRUD
- `/admin/discounts` - Discount & promo code management
- `/admin/shipping` - Shipping zone configuration
- `/admin/promotions` - Sale promotion timers
- `/admin/testimonials` - Review moderation
- `/admin/settings` - Logo/site configuration

**Pattern:** All admin routes wrapped in `<ProtectedRoute>` + `<AdminLayout>`. All public routes wrapped in consistent layout with Header/Footer.

### Service Layer Pattern

**Location:** `src/services/`

**Pattern:** Each service exports async functions that wrap Supabase operations. Never call `supabase` directly from components.

**Example:**
```javascript
// src/services/products.js
export async function getProducts(filters = {}) {
  let query = supabase.from('online_products').select(...)
  // Apply filters
  const { data, error } = await query
  if (error) throw error
  return data
}
```

**Key Services:**
- `products.js`: Product CRUD, filtering, sorting (name, price, discount, latest)
- `orders.js`: Order creation, Maya checkout session creation, promo code application
- `maya.js`: Maya Checkout API integration (creates checkout sessions with locked amounts)
- `discounts.js`: Discount CRUD, priority-based discount resolution, product enrichment with active discounts
- `promoCodes.js`: Promo code validation, discount calculation, usage tracking
- `shipping.js`: Shipping zone CRUD, location-based fee calculation with fuzzy city matching
- `storage.js`: Image upload to Supabase Storage (has separate functions for products vs assets)
- `settings.js`: Site settings CRUD (logo, site name, etc.)

### Component Architecture

**Common Components (`src/components/common/`):**
- Reusable UI primitives (Button, Card, Input, Modal, Spinner, LoadingModal)
- Always prefer these over creating new variants
- `LoadingModal`: Full-screen loading overlay for async operations (checkout, redirects)

**Layout Components (`src/components/layout/`):**
- `Header`: Logo (from settings), navigation, cart icon, theme toggle
- `Footer`: Site footer
- `Navigation`: Dynamic menu from database + special items (All Items, New Arrivals)
- `AdminLayout`: Sidebar navigation for admin pages
- `ProtectedRoute`: Auth guard for admin routes
- `ThemeToggle`: Dark/light mode switcher

**Product Components (`src/components/product/`):**
- `ProductCard`: Used in grids, shows image, name, price, sale badge
- `ProductGrid`: Responsive grid layout with loading/error states
- `PriceDisplay`: Handles price/sale_price display with strikethrough
- `SaleTimer`: Countdown timer for active sales

### Maya Payment Integration

**Current Implementation:** Maya Checkout API (not simple payment links)

**Flow:**
1. User completes checkout form
2. Order created in `online_orders` table
3. `createMayaCheckoutSession()` called with order data
4. Maya API returns checkout URL with **locked amount** (read-only)
5. User redirected to Maya's secure checkout page
6. After payment, Maya redirects to success/failure/cancel URLs

**Key Files:**
- `src/services/maya.js`: API integration
- `src/services/orders.js`: `createMayaCheckoutSession()` wrapper
- `src/pages/Checkout.jsx`: Form + LoadingModal + checkout flow

**Important:** The amount is locked on Maya's side. Users cannot modify it. This replaced the old payment link approach where amount was editable.

### Discount Management System

**Architecture:** Replaces the legacy `sale_price` column with a flexible discount system supporting time-based rules and priority resolution.

**Discount Types:**
1. **Manual Application:** Link discounts to specific products via junction table (`online_discount_products`)
2. **Category Application:** Apply discounts to all products in specified categories (uses `category_ids` array)

**Discount Calculation:**
- `percentage`: Reduces price by X% (e.g., 20% off)
- `fixed_amount`: Reduces price by fixed amount (e.g., ₱100 off)

**Priority Resolution:**
- Multiple discounts can apply to a product (manual + category)
- Highest `priority` value wins (default: 0)
- Active discounts checked against date range (`start_date` to `end_date`)

**Product Enrichment Flow:**
1. Products fetched from database
2. `enrichProductsWithDiscounts()` called in `src/services/discounts.js`
3. Function queries both manual and category-based discounts
4. Applies highest-priority active discount per product
5. Sets `sale_price` and `active_discount` fields on product object
6. Products display with calculated discount pricing

**Key Functions:**
- `getProductDiscount(productId, categoryIds)`: Get active discount for a product
- `enrichProductsWithDiscounts(products)`: Batch enrich products with discount data
- `calculateDiscountedPrice(originalPrice, discount)`: Calculate final price

**Location:** `src/services/discounts.js`, Admin UI at `/admin/discounts`

### Promo Code System

**Purpose:** Checkout-level discount codes that customers enter at checkout (separate from product discounts).

**Promo Code Types:**
- `percentage`: X% off order subtotal
- `fixed_amount`: Fixed amount off order subtotal
- `free_shipping`: Waives shipping fee

**Validation Rules:**
- Case-insensitive code matching (stored uppercase)
- Date range validation (`start_date` to `end_date`)
- Usage limit tracking (`usage_limit` vs `times_used`)
- Minimum order amount requirement (`min_order_amount`)
- Active status check (`is_active`)

**Application Flow:**
1. User enters promo code at checkout
2. `validatePromoCode(code, orderTotal)` validates all rules
3. If valid, `calculatePromoDiscount()` computes discount amount
4. Discount applied to order subtotal (after product discounts)
5. `incrementPromoCodeUsage()` called after successful order

**Cart Integration:**
- Cart store (`src/store/cartStore.js`) has `promoCode` state
- `setPromoCode(promoCode)` and `clearPromoCode()` methods
- Promo code persists in localStorage with cart

**Location:** `src/services/promoCodes.js`, Admin UI at `/admin/discounts` (same page as discounts)

### Shipping Zone System

**Purpose:** Location-based shipping fee calculation using city matching.

**Data Structure:**
- `name`: Zone display name (e.g., "Free Shipping Zone")
- `cities`: Array of city names for matching (e.g., `['Cebu City', 'Mandaue City']`)
- `shipping_fee`: Fee amount in PHP
- `display_order`: Sort order for matching priority
- `is_active`: Enable/disable zone

**Fee Calculation:**
- `calculateShippingFee(city, hasFreeShippingPromo)` in `src/services/shipping.js`
- Normalizes city name (lowercase, trimmed)
- Uses fuzzy matching (substring matching) to handle spelling variations
- Checks zones in `display_order` sequence
- Returns first matching zone's fee
- Falls back to last zone (highest fee) if no match
- Free shipping promo overrides all zones (returns ₱0)

**Example Zones:**
1. Free Shipping Zone (Cebu City, Mandaue City) - ₱0
2. Cebu Province (Other Cebu Cities) - ₱100
3. Outside Cebu (Default fallback) - ₱200

**Checkout Integration:**
- City entered in checkout form
- Shipping fee calculated on form submit
- Fee stored in `online_orders.shipping_fee` and `shipping_zone_id`

**Location:** `src/services/shipping.js`, Admin UI at `/admin/shipping`

### PostHog Analytics Integration

**Purpose:** Track user behavior, conversions, and product performance.

**Configuration:**
- Environment variables: `VITE_PUBLIC_POSTHOG_KEY`, `VITE_PUBLIC_POSTHOG_HOST`
- Initialized in `src/main.jsx` with PostHogProvider
- Custom hook: `useAnalytics()` in `src/lib/analytics.js`

**Key Events Tracked:**
- `product_viewed`: Product detail page views
- `add_to_cart`: Items added to cart (with size, price, quantity)
- `remove_from_cart`: Items removed from cart
- `cart_viewed`: Cart page views
- `checkout_started`: Checkout initiation with cart summary
- `purchase_completed`: Successful orders
- `category_viewed`: Category page views
- `theme_toggled`: Dark/light mode switches
- `filter_used`, `sort_used`: Product filtering and sorting

**Usage Pattern:**
```javascript
const analytics = useAnalytics()
analytics.trackProductView(product)
analytics.trackAddToCart(product, quantity, size)
```

**Privacy:** Users can disable tracking via analytics toggle in UI (see `src/components/common/AnalyticsToggle.jsx`)

**Location:** `src/lib/analytics.js`, initialized in `src/main.jsx`

### Styling Conventions

**Theme System:**
- Tailwind CSS with `darkMode: 'class'`
- Theme toggled via `ThemeToggle` component
- Custom colors in `tailwind.config.js`: black/white/gray scheme (primary, background, text, accent)
- **Pattern:** Use `dark:` prefix for dark mode variants, e.g., `bg-white dark:bg-gray-900`

**Color Usage:**
- Primary actions: `bg-black text-white dark:bg-white dark:text-black`
- Backgrounds: `bg-gray-50 dark:bg-gray-900`
- Text: `text-gray-900 dark:text-white`
- Borders: `border-gray-200 dark:border-gray-800`

**Responsive Design:**
- Mobile-first approach
- Breakpoints: `md:` (768px), `lg:` (1024px)
- Navigation collapses to mobile menu on small screens

## Important Patterns & Conventions

### Product Filtering & Sorting

**Category Slugs:**
- `all-items`: All active products
- `new-arrivals`: Top 20 newest products (uses `limit` filter)
- `on-sale`: Products with `sale_price` not null
- `top-selling`: Products with `is_featured = true`
- Custom slugs: Match against `online_categories.slug`

**Sorting Options:**
- `latest`: `created_at DESC` (default)
- `name`: Alphabetical A-Z
- `price-low`: Lowest price first (uses `sale_price` if available)
- `price-high`: Highest price first (uses `sale_price` if available)
- `discount`: Highest discount percentage first (client-side calculation)

**Implementation:** `src/services/products.js` handles both database sorting (for name, price, latest) and client-side sorting (for discount percentage).

### Cart Management

**Key Behavior:**
- Cart items identified by `cartItemId` (combination of product ID + size + color + timestamp)
- Supports same product with different sizes/colors as separate cart items
- Price calculation uses `sale_price` if available (from discounts), otherwise `price`
- Promo code stored alongside cart items
- Persisted to localStorage automatically via Zustand persist middleware

**Core Methods:**
```javascript
const {
  items,
  promoCode,
  addItem,
  removeItem,
  updateQuantity,
  updateSize,
  clearCart,
  getTotal,
  getSubtotal,
  getTotalProductDiscount,
  setPromoCode,
  clearPromoCode
} = useCartStore()
```

**Pricing Calculations:**
- `getSubtotal()`: Sum of all items (using sale_price if available)
- `getTotalProductDiscount()`: Total savings from product-level discounts
- Promo code discount calculated separately at checkout via `promoCodes.js`

### Admin Authentication

**Flow:**
1. User signs in via Supabase Auth (`/admin/login`)
2. Check if user exists in `admin_users` table (hook: `src/hooks/useAuth.js`)
3. If not in `admin_users`, sign out immediately
4. `ProtectedRoute` checks auth on every admin page load

**Important:** Admin access requires BOTH Supabase auth AND entry in `admin_users` table.

### Image Upload

**Two patterns:**
1. **Product Images:** `uploadImage(file, 'products')` → goes to `product-images` bucket
2. **Site Assets (logos):** `uploadAsset(file, 'logos')` → goes to `AssetsYour` bucket

**Location:** `src/services/storage.js`

**Pattern:** Always validate file type and size before upload. Max 2MB for logos, larger for products.

### Toast Notifications

**Configuration:** `src/main.jsx` - Toaster positioned `top-left` (doesn't cover cart icon)

**Usage:**
```javascript
import toast from 'react-hot-toast'

toast.success('Message')
toast.error('Error message')
```

**Behavior:** Click any toast to dismiss immediately. 3-second auto-dismiss.

### Form Validation

**Stack:** React Hook Form + Zod

**Pattern:**
```javascript
const schema = z.object({
  field: z.string().min(2, 'Error message')
})

const { register, handleSubmit, formState: { errors } } = useForm({
  resolver: zodResolver(schema)
})
```

**Example:** `src/pages/Checkout.jsx` has comprehensive validation schema.

### Discount System Migration Pattern

**Legacy Approach (deprecated):**
- Products had `sale_price` column set manually
- Required manual updates per product
- No expiration dates or automatic scheduling

**Current Approach (active):**
- Discounts defined separately with date ranges and priorities
- `enrichProductsWithDiscounts()` calculates and applies discounts dynamically
- Products enriched at query time with `sale_price` field
- Migration script: `supabase/migrate-sale-prices-to-discounts.sql`

**When fetching products:**
```javascript
// In product hooks (useProducts, useCategories)
const products = await getProducts(filters)
const enrichedProducts = await enrichProductsWithDiscounts(products)
// Now products have calculated sale_price based on active discounts
```

**Important:** Always call `enrichProductsWithDiscounts()` after fetching products to ensure discount prices are current.

## Database Guidelines

### Adding New Tables

1. Use `online_` prefix for e-commerce tables
2. Add `created_at` and `updated_at` timestamps
3. Create RLS policies (public read for active items, admin write access)
4. Create SQL file in `supabase/` directory

### Modifying Existing Tables

**Critical:** Never modify Loyverse POS tables (`items`, `sales`, etc.). These are synced via n8n.

For `online_*` tables, create new SQL migration files in `supabase/` directory.

### Storage Bucket Setup

Use `supabase/create-assets-bucket.sql` as template. Key requirements:
- Public read access
- Authenticated write access
- Proper RLS policies

## Common Workflows

### Adding a New Product Category

1. Insert into `online_categories`: `INSERT INTO online_categories (name, slug, description) VALUES (...)`
2. Navigation automatically loads new category (no code changes needed)
3. Category page at `/category/[slug]` works automatically

### Creating a New Admin Page

1. Create page component in `src/pages/admin/`
2. Add route in `src/App.jsx` wrapped with `<ProtectedRoute>` and `<AdminLayout>`
3. Add menu item in `src/components/layout/AdminLayout.jsx`

### Implementing a New Modal

1. Use `src/components/common/Modal.jsx` as base
2. For loading states, use `LoadingModal` component
3. Control with useState: `const [isOpen, setIsOpen] = useState(false)`

### Creating Product Discounts

**For category-wide sales:**
1. Navigate to `/admin/discounts`
2. Create discount with `application_type: 'category'`
3. Select target categories in `category_ids` array
4. Set percentage or fixed amount, date range, priority
5. Products in those categories automatically show discounted prices

**For specific product discounts:**
1. Navigate to `/admin/discounts`
2. Create discount with `application_type: 'manual'`
3. Select specific products to link
4. Junction table (`online_discount_products`) tracks associations
5. Only selected products show discounted prices

**Priority matters:** If a product matches multiple discounts (e.g., both manual + category), highest priority wins.

### Setting Up Promo Codes

1. Navigate to `/admin/discounts` (Promo Codes tab)
2. Create promo code with:
   - Unique code (e.g., "SUMMER2024") - stored uppercase
   - Discount type: percentage, fixed_amount, or free_shipping
   - Minimum order amount (optional)
   - Usage limit (optional, null = unlimited)
   - Date range
3. Customers enter code at checkout
4. System validates and applies discount automatically
5. Usage counter increments after successful orders

### Configuring Shipping Zones

1. Navigate to `/admin/shipping`
2. Create zones in priority order (display_order):
   - Lower display_order = checked first
   - First matching zone wins
3. Add city names to `cities` array
4. System uses fuzzy matching (handles typos, variations)
5. Last zone acts as fallback for unmatched cities

**Example setup:**
- Zone 1: Free Shipping (display_order: 1) - Cebu City, Mandaue
- Zone 2: Provincial (display_order: 2) - Other Cebu cities
- Zone 3: Default (display_order: 3) - Everywhere else (fallback)

## Testing the Maya Integration

**Sandbox Mode:** Set `VITE_MAYA_API_BASE=https://pg-sandbox.paymaya.com` in `.env`

**Test Flow:**
1. Add products to cart
2. Go to checkout, fill form
3. Submit → order created → Maya checkout session created
4. Redirected to Maya sandbox checkout page
5. Use Maya test cards for payment
6. Redirected back to order confirmation

**Production:**
- In Vercel environment variables, set `VITE_MAYA_API_BASE=https://pg.paymaya.com`
- Use production Maya keys (not sandbox keys)

## Key Files to Check Before Making Changes

- `src/App.jsx`: All route definitions
- `src/main.jsx`: React Query config, Toaster config, PostHog initialization
- `tailwind.config.js`: Theme colors
- `src/services/products.js`: Product filtering/sorting logic
- `src/services/orders.js`: Order creation, Maya integration, promo code application
- `src/services/discounts.js`: Discount system logic and product enrichment
- `src/services/promoCodes.js`: Promo code validation and calculation
- `src/services/shipping.js`: Shipping zone matching and fee calculation
- `src/store/cartStore.js`: Cart state management, promo code storage
- `src/lib/analytics.js`: PostHog event tracking functions
- `.env`: Environment variables (never commit this file)

## SQL Scripts Reference

Located in `supabase/` directory:

- `create-online-tables-fresh.sql`: Creates all e-commerce tables
- `create-discount-promo-shipping-tables.sql`: Creates discount, promo code, and shipping zone tables
- `migrate-sale-prices-to-discounts.sql`: Migrates existing sale_price values to discount system
- `create-assets-bucket.sql`: Sets up AssetsYour storage bucket
- `create-site-settings.sql`: Creates site_settings table
- `sample-products-seed.sql`: Sample product data
- `storage-policies.sql`: Storage bucket RLS policies

## Notes for Future Development

### Performance Optimization
- React Query caching reduces API calls significantly
- Product images should be optimized before upload
- Consider implementing image CDN for production

### Security Considerations
- All sensitive operations protected by Supabase RLS policies
- Admin routes protected by `ProtectedRoute` component
- Never expose Maya secret key on client side (it's only used server-side in API calls)

### Mobile Experience
- Test all features on mobile viewports
- Navigation collapses to hamburger menu
- Cart and checkout forms are mobile-optimized
- Product grid responsive (1 column mobile, 2-4 desktop)

### Discount and Pricing System
- Always enrich products with discounts after fetching from database
- Discount system supports overlapping rules - priority determines winner
- Product discounts (sale_price) apply before promo codes at checkout
- Order breakdown: subtotal → product discounts → promo code → shipping → total
- Expired discounts automatically filtered by date range queries
- Promo codes are case-insensitive, stored uppercase for consistency

### Analytics and Tracking
- PostHog events fire client-side - ensure analytics hook used in key flows
- Users can opt-out via analytics toggle (respects privacy)
- Track key conversion events: product views, add to cart, checkout, purchase
- Review PostHog dashboard regularly to identify drop-off points

---

For detailed setup instructions, see [README.md](./README.md)
For database migration details, see `supabase/README.md`
