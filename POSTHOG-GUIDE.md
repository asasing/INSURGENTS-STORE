# PostHog Analytics Integration Guide

PostHog has been integrated into the Insurgents Store for tracking user behavior and analytics.

## ✅ What's Already Set Up

1. **PostHog Provider** - Wraps the entire app in [src/main.jsx](src/main.jsx)
2. **Environment Variables** - Added to `.env` and `.env.example`
3. **Analytics Helper** - Custom hooks and functions in [src/lib/analytics.js](src/lib/analytics.js)

## 📊 Features Enabled

- **Automatic Page View Tracking** - Every page navigation is tracked
- **Automatic Page Leave Tracking** - Tracks when users leave pages
- **Session Recordings** - (Optional) Can be enabled in PostHog dashboard
- **Debug Mode** - Only enabled in development environment

## 🎯 How to Use in Components

### Import the hook

```jsx
import { useAnalytics } from '../lib/analytics'

function MyComponent() {
  const analytics = useAnalytics()

  // Track events
  analytics.trackProductView(product)
  analytics.trackAddToCart(product, quantity, size)
}
```

### Available Tracking Methods

#### E-commerce Events
- `trackProductView(product)` - When user views a product
- `trackAddToCart(product, quantity, size)` - When item is added to cart
- `trackRemoveFromCart(item)` - When item is removed from cart
- `trackCheckoutStarted(items, total)` - When user starts checkout
- `trackPurchase(order)` - When purchase is completed
- `trackBuyNow(product, size)` - When Buy Now button is clicked
- `trackSizeChange(product, oldSize, newSize)` - When size is changed in cart

#### Navigation Events
- `trackCategoryView(categoryName)` - When user views a category
- `trackSearch(query, resultsCount)` - When user searches

#### User Identification
- `identifyUser(userId, properties)` - Identify logged-in users

#### Custom Events
- `track(eventName, properties)` - Track any custom event

## 📝 Example Usage

### Track Product View in ProductDetail

```jsx
import { useEffect } from 'react'
import { useAnalytics } from '../lib/analytics'

function ProductDetail() {
  const analytics = useAnalytics()
  const { data: product } = useQuery(...)

  useEffect(() => {
    if (product) {
      analytics.trackProductView(product)
    }
  }, [product])

  return (...)
}
```

### Track Add to Cart

```jsx
import { useAnalytics } from '../lib/analytics'

function ProductCard({ product }) {
  const analytics = useAnalytics()

  const handleAddToCart = () => {
    if (!selectedSize) {
      toast.error('Please select a size')
      return
    }

    addItem(product, 1, selectedSize)
    analytics.trackAddToCart(product, 1, selectedSize) // Track event
    toast.success('Added to cart')
  }

  return (...)
}
```

### Track Purchase

```jsx
import { useAnalytics } from '../lib/analytics'

function Checkout() {
  const analytics = useAnalytics()

  const onSubmit = async (data) => {
    const order = await createOrder(data)
    analytics.trackPurchase(order) // Track successful purchase
    navigate(`/order-confirmation/${order.id}`)
  }

  return (...)
}
```

## 🚀 Deployment to Vercel

Don't forget to add these environment variables in Vercel:

1. Go to your Vercel project dashboard
2. Navigate to **Settings → Environment Variables**
3. Add:
   - `VITE_PUBLIC_POSTHOG_KEY` = `phc_alxkL20byqezC19fxoAqJVyYkcTalNmzru2xjkQfzJO`
   - `VITE_PUBLIC_POSTHOG_HOST` = `https://us.i.posthog.com`
4. Redeploy your application

## 📈 Viewing Analytics

1. Go to [PostHog Dashboard](https://app.posthog.com)
2. View events in real-time
3. Create custom insights and dashboards
4. Set up funnels to track conversion
5. View session recordings (if enabled)

## 🎨 Key Metrics to Track

### Conversion Funnel
1. Product Viewed
2. Add to Cart
3. Checkout Started
4. Purchase Completed

### Engagement Metrics
- Most viewed products
- Most added-to-cart products
- Cart abandonment rate
- Average order value
- Buy Now vs Add to Cart ratio

## 🔒 Privacy

PostHog respects user privacy:
- Only creates user profiles for identified users (`person_profiles: 'identified_only'`)
- No personally identifiable information is tracked by default
- You can add cookie consent if required

## 🛠 Advanced Features

### Feature Flags
```jsx
import { useFeatureFlagEnabled } from 'posthog-js/react'

function MyComponent() {
  const showNewFeature = useFeatureFlagEnabled('new-checkout-flow')

  return showNewFeature ? <NewCheckout /> : <OldCheckout />
}
```

### A/B Testing
Create experiments in PostHog dashboard and use feature flags to show variants.

## 📚 Resources

- [PostHog Documentation](https://posthog.com/docs)
- [React SDK Guide](https://posthog.com/docs/libraries/react)
- [Event Tracking Best Practices](https://posthog.com/docs/product-analytics/capture-events)
