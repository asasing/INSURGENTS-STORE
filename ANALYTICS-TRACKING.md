# Analytics Tracking Implementation

Complete list of all tracked events and button clicks in the Insurgents Store.

## 🎯 Automatic Tracking (No Code Required)

These events are tracked automatically by PostHog:
- **Page Views** - Every page navigation
- **Page Leaves** - When users navigate away from pages
- **Session Duration** - Time spent on site
- **User Paths** - Navigation flow through the site

## 🔘 Button Click Tracking

### Header & Navigation
- **Logo Click** - Track navigation to home from header logo
- **Mobile Menu Toggle** - Track mobile menu opens
- **Cart Icon Click** - Track cart views with items count and total
- **Category Menu Items** - Track all category navigation clicks (desktop & mobile)
- **Special Menu Items** - "All Items" and "New Arrivals" clicks

### Product Cards
- **Add to Cart** - Track with product ID, size, and price
- **Add to Cart (No Size)** - Track failed attempts without size selection
- **Buy Now** - Track fast checkout with product ID and size
- **Buy Now (No Size)** - Track failed attempts without size selection

### Product Detail Page
- **Product View** - Automatically tracked when product loads
- **Add to Cart** - Track with product ID, size, and quantity
- **Add to Cart (No Size)** - Track failed attempts
- **Buy Now** - Track with product ID, size, and quantity
- **Buy Now (No Size)** - Track failed attempts
- **Size Chart Toggle** - Can be tracked (currently not implemented)

### Shopping Cart
- **Proceed to Checkout** - Track with items count and cart total
- **Continue Shopping** - Track navigation back to home
- **Size Change** - Track when user changes product size in cart
- **Quantity Increase** - Track with old and new quantities
- **Quantity Decrease** - Track with old and new quantities
- **Remove from Cart** - Track which product was removed

### Checkout Page
- **Checkout Started** - Automatically tracked when page loads
- **Place Order Success** - Track successful order with order ID and total
- **Place Order (Maya Error)** - Track when payment gateway fails

## 📊 E-commerce Events

### Product Interactions
```javascript
// Product Viewed
{
  event: 'product_viewed',
  product_id: 'uuid',
  product_name: 'Adidas Ultraboost 23',
  category: 'Running',
  price: 6999,
  sale_price: 5999,
  is_on_sale: true
}

// Add to Cart
{
  event: 'add_to_cart',
  product_id: 'uuid',
  product_name: 'Nike Air Max',
  category: 'Casual',
  price: 5999,
  quantity: 1,
  size: 'EU 42',
  cart_value: 5999
}

// Buy Now Clicked
{
  event: 'buy_now_clicked',
  product_id: 'uuid',
  product_name: 'Nike Air Max',
  price: 5999,
  size: 'EU 42'
}
```

### Cart Actions
```javascript
// Remove from Cart
{
  event: 'remove_from_cart',
  product_id: 'uuid',
  product_name: 'Nike Air Max',
  quantity: 2
}

// Cart Size Changed
{
  event: 'cart_size_changed',
  product_id: 'uuid',
  product_name: 'Nike Air Max',
  old_size: 'EU 42',
  new_size: 'EU 43'
}

// Quantity Changed
{
  event: 'quantity_changed',
  product_id: 'uuid',
  product_name: 'Nike Air Max',
  old_quantity: 1,
  new_quantity: 2,
  change: 1
}

// Cart Viewed
{
  event: 'cart_viewed',
  items_count: 3,
  cart_total: 15999
}
```

### Checkout Flow
```javascript
// Checkout Started
{
  event: 'checkout_started',
  cart_items_count: 3,
  cart_total: 15999,
  items: [
    {
      product_id: 'uuid',
      product_name: 'Nike Air Max',
      quantity: 1,
      price: 5999
    },
    // ... more items
  ]
}

// Purchase Completed
{
  event: 'purchase_completed',
  order_id: 'uuid',
  total: 15999,
  items_count: 3,
  customer_email: 'john@example.com',
  payment_method: 'maya'
}
```

### Navigation
```javascript
// Navigation Clicked
{
  event: 'navigation_clicked',
  destination: '/category/running',
  source: 'desktop_nav' // or 'mobile_menu', 'header_logo', etc.
}

// Menu Clicked
{
  event: 'menu_clicked',
  menu_item: 'Running'
}

// Category Viewed
{
  event: 'category_viewed',
  category_name: 'Running'
}
```

### Generic Button Clicks
```javascript
// Button Clicked
{
  event: 'button_clicked',
  button_name: 'proceed_to_checkout',
  location: 'cart',
  items_count: 3,
  total: 15999
}
```

## 📈 Key Funnels to Track in PostHog

### Purchase Funnel
1. Product Viewed
2. Add to Cart
3. Cart Viewed
4. Checkout Started
5. Purchase Completed

### Quick Checkout Funnel (Buy Now)
1. Product Viewed
2. Buy Now Clicked
3. Checkout Started
4. Purchase Completed

### Category Exploration Funnel
1. Category Viewed
2. Product Viewed
3. Add to Cart

## 🎨 Custom Dashboards to Create

### Sales Performance
- Total purchases
- Average order value
- Conversion rate (product view → purchase)
- Cart abandonment rate

### Product Analytics
- Most viewed products
- Most added to cart
- Products with highest Buy Now rate
- Size selection patterns

### User Behavior
- Navigation patterns
- Time to purchase
- Mobile vs Desktop usage
- Cart modifications (size changes, quantity adjustments)

## 🚀 Using the Data

### In PostHog Dashboard

1. **Insights** - Create custom queries
   ```
   Event: purchase_completed
   Filter: last 7 days
   Breakdown by: payment_method
   ```

2. **Funnels** - Track conversion
   ```
   Step 1: product_viewed
   Step 2: add_to_cart
   Step 3: checkout_started
   Step 4: purchase_completed
   ```

3. **Trends** - Monitor over time
   ```
   Event: button_clicked
   Filter: button_name = "buy_now"
   Time period: Last 30 days
   ```

4. **Session Recordings** - Watch user behavior
   - Enable in PostHog project settings
   - See exactly how users navigate your store

## 🔧 Technical Implementation

All tracking is implemented through the `useAnalytics()` hook from [src/lib/analytics.js](src/lib/analytics.js).

### Files with Tracking
- ✅ [src/components/layout/Header.jsx](src/components/layout/Header.jsx)
- ✅ [src/components/layout/Navigation.jsx](src/components/layout/Navigation.jsx)
- ✅ [src/components/product/ProductCard.jsx](src/components/product/ProductCard.jsx)
- ✅ [src/pages/ProductDetail.jsx](src/pages/ProductDetail.jsx)
- ✅ [src/pages/Cart.jsx](src/pages/Cart.jsx)
- ✅ [src/pages/Checkout.jsx](src/pages/Checkout.jsx)

### Adding More Tracking

To track a new event:

```jsx
import { useAnalytics } from '../lib/analytics'

function MyComponent() {
  const analytics = useAnalytics()

  const handleClick = () => {
    analytics.trackButtonClick('my_button', 'my_component', {
      custom_property: 'value'
    })
  }

  return <button onClick={handleClick}>Click Me</button>
}
```

## 📝 Notes

- All tracking respects user privacy
- Only identified users get full profiles (`person_profiles: 'identified_only'`)
- Debug mode enabled only in development
- All events include contextual information (product IDs, prices, quantities, etc.)

## 🎯 Next Steps

1. Deploy to Vercel with PostHog environment variables
2. Create custom dashboards in PostHog
3. Set up conversion funnels
4. Enable session recordings (optional)
5. Create alerts for important metrics (e.g., drop in conversion rate)
