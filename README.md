# Insurgents Store - E-commerce Platform

A modern, mobile-first e-commerce store for shoes and apparel built with Vite, React, and Supabase.

## Features

### Completed ✅
- **Modern Tech Stack**: Vite + React + Tailwind CSS
- **Dark/Light Mode**: Persistent theme switching with localStorage
- **Responsive Design**: Mobile-first approach with Tailwind breakpoints
- **Product Management**: Complete CRUD operations for products
- **Shopping Cart**: Persistent cart with Zustand state management
- **Admin Authentication**: Secure admin login with Supabase Auth
- **Admin Dashboard**: Protected admin routes with overview stats
- **Product Display**: Grid layout with ProductCard components
- **Sale Pricing**: Strikethrough pricing with sale percentage badges
- **Testimonials**: Customer reviews with Filipino names and star ratings
- **Professional UI**: Reusable components (Button, Card, Input, Modal, Spinner)

### In Development 🚧
- Sale countdown timer
- Checkout & Maya payment integration
- Admin inventory management UI
- Sale timer configuration
- Testimonial moderation interface

## Tech Stack

- **Frontend**: React 18, Vite 5
- **Styling**: Tailwind CSS with dark mode support
- **Routing**: React Router v6
- **State Management**:
  - Zustand (cart, theme)
  - React Query (server state)
- **Backend**: Supabase (PostgreSQL, Auth, Storage)
- **Forms**: React Hook Form + Zod validation
- **Icons**: Lucide React
- **Notifications**: React Hot Toast
- **Deployment**: Vercel

## Project Structure

```
src/
├── components/
│   ├── common/          # Reusable UI components
│   │   ├── Button.jsx
│   │   ├── Card.jsx
│   │   ├── Input.jsx
│   │   ├── Modal.jsx
│   │   └── Spinner.jsx
│   ├── layout/          # Layout components
│   │   ├── AdminLayout.jsx
│   │   ├── Footer.jsx
│   │   ├── Header.jsx
│   │   ├── MobileMenu.jsx
│   │   ├── Navigation.jsx
│   │   ├── ProtectedRoute.jsx
│   │   └── ThemeToggle.jsx
│   └── product/         # Product components
│       ├── PriceDisplay.jsx
│       ├── ProductCard.jsx
│       └── ProductGrid.jsx
├── pages/
│   ├── Home.jsx
│   └── admin/
│       ├── Dashboard.jsx
│       └── Login.jsx
├── hooks/               # Custom React hooks
│   ├── useAuth.js
│   ├── useCategories.js
│   └── useProducts.js
├── lib/                 # Utilities
│   ├── supabase.js
│   └── utils.js
├── services/            # API services
│   ├── categories.js
│   ├── products.js
│   └── testimonials.js
├── store/               # Zustand stores
│   ├── cartStore.js
│   └── themeStore.js
├── App.jsx
└── main.jsx
```

## Getting Started

### Prerequisites
- Node.js 18+
- Supabase account
- Maya payment link (optional for now)

### Installation

1. **Clone and install dependencies**
   ```bash
   npm install
   ```

2. **Configure environment variables**

   Create a `.env` file with your credentials (see `.env.example`):
   ```env
   VITE_SUPABASE_URL=your_supabase_url
   VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
   VITE_MAYA_PUBLIC_KEY=your_maya_public_key
   VITE_MAYA_SECRET_KEY=your_maya_secret_key
   VITE_MAYA_API_BASE=https://pg-sandbox.paymaya.com
   ```

   **Note:** Use sandbox URL for development. For production deployment, set `VITE_MAYA_API_BASE=https://pg.paymaya.com` in Vercel environment variables.

3. **Set up Supabase database**

   Follow the detailed instructions in [SETUP.md](./SETUP.md):
   - Run the database migration (`supabase-migration.sql`)
   - Create storage bucket for product images
   - Create your admin user
   - Add admin user to admin_users table

4. **Start development server**
   ```bash
   npm run dev
   ```

   The app will open at http://localhost:5173

## Database Schema

### Tables
- **categories**: Product categories (6 predefined categories)
- **products**: Product listings with pricing, images, and inventory
- **sales**: Sale promotions with end dates
- **testimonials**: Customer reviews (8 Filipino testimonials seeded)
- **admin_users**: Admin user permissions
- **orders**: Customer orders

### Row Level Security (RLS)
- Public users can read active products, categories, sales, and approved testimonials
- Public users can create orders (checkout)
- Admin users have full CRUD access to all tables
- All sensitive operations are protected by RLS policies

## Features Guide

### Dark/Light Mode
- Click the sun/moon icon in the header
- Theme preference persists across sessions
- Applies to all pages and components

### Shopping Cart
- Add products from product cards or detail pages
- Cart persists in localStorage
- Cart count badge in header
- View cart at `/cart`

### Admin Access
1. Go to `/admin/login`
2. Sign in with your Supabase admin credentials
3. Access dashboard at `/admin/dashboard`
4. Protected routes require admin authentication

### Product Categories
- Top Selling
- Apparels
- Running
- Basketball
- Casual
- On Sale

## Development Commands

```bash
# Install dependencies
npm install

# Start dev server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

## Deployment

### Vercel Deployment

1. **Connect repository to Vercel**
   - Go to vercel.com
   - Import your GitHub repository
   - Configure project

2. **Set environment variables**
   - Add all `VITE_*` variables in Vercel dashboard
   - Settings > Environment Variables

3. **Deploy**
   - Vercel will automatically build and deploy
   - Get your live URL

## API Integration

### Supabase
- All data fetching uses Supabase client
- React Query handles caching and background updates
- RLS policies ensure data security

### Maya Payment (Planned)
- Static payment link approach
- Order details appended as URL parameters
- Order tracking in Supabase

## Next Steps

### Phase 7: Sale Timer
- Implement countdown timer component
- Fetch sale end dates from database
- Display on home page

### Phase 8: Checkout
- Build checkout form
- Integrate Maya payment link
- Create order confirmation page

### Phase 9: Admin Inventory
- Product CRUD interface
- Image upload to Supabase Storage
- Drag-and-drop image management

### Phase 10: Admin Tools
- Sale timer configuration
- Testimonial moderation
- Order management

### Phase 11: Sample Data
- Add sample products with images
- Create realistic product catalog

### Phase 12: Polish
- Loading states optimization
- Error boundary implementation
- Performance optimization
- Accessibility improvements

### Phase 13: Production
- Final testing
- Production deployment
- Custom domain setup

## Troubleshooting

### Common Issues

**Issue: "Missing Supabase environment variables"**
- Solution: Make sure `VITE_SUPABASE_ANON_KEY` is in `.env` and restart dev server

**Issue: Can't login to admin**
- Solution: Verify admin user is in both `auth.users` and `admin_users` table

**Issue: Products not displaying**
- Solution: Add products via Supabase dashboard or wait for admin inventory UI

**Issue: Dark mode not persisting**
- Solution: Clear browser localStorage and try again

## Contributing

This is a custom e-commerce platform for Insurgents Store. For major changes, please discuss with the project maintainer first.

## License

Proprietary - All rights reserved

## Support

For setup help, refer to [SETUP.md](./SETUP.md)

---

**Built with ❤️ using React, Tailwind CSS, and Supabase**
