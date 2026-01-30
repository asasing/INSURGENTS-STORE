# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Insurgents Store is a modern, mobile-first e-commerce platform for shoes and apparel built with React, Vite, Tailwind CSS, and Supabase. The store features a complete shopping experience with cart management, checkout flow with Maya payment integration, admin dashboard for inventory management, and a black/white/gray theme with dark mode support.

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
```

**Maya Configuration:**
- Use `https://pg-sandbox.paymaya.com` for development/testing
- Use `https://pg.paymaya.com` for production
- In Vercel, set `VITE_MAYA_API_BASE` to production URL for live deployment

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
- `online_orders`: Customer orders with JSONB items array, shipping address, status tracking
- `online_categories`: Product categories with slugs for routing
- `online_sale_promotions`: Sale timers with end dates
- `online_testimonials`: Customer reviews with approval status
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
- `/admin/inventory` - Product CRUD
- `/admin/sales` - Sale promotion management
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
- `orders.js`: Order creation, Maya checkout session creation
- `maya.js`: Maya Checkout API integration (creates checkout sessions with locked amounts)
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
- Price calculation uses `sale_price` if available, otherwise `price`
- Persisted to localStorage automatically via Zustand persist middleware

**Methods:**
```javascript
const { items, addItem, removeItem, updateQuantity, clearCart, getTotal } = useCartStore()
```

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
- `src/main.jsx`: React Query config, Toaster config
- `tailwind.config.js`: Theme colors
- `src/services/products.js`: Product filtering/sorting logic
- `src/services/orders.js`: Order creation and Maya integration
- `src/store/cartStore.js`: Cart state management
- `.env`: Environment variables (never commit this file)

## SQL Scripts Reference

Located in `supabase/` directory:

- `create-online-tables-fresh.sql`: Creates all e-commerce tables
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

---

For detailed setup instructions, see [README.md](./README.md)
For database migration details, see `supabase/README.md`
