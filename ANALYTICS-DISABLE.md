# Disabling PostHog Analytics

Guide on how to disable or control PostHog analytics during development.

## 🚫 Automatic Disabling on Localhost

**Analytics is automatically disabled on localhost by default.**

When you run your development server:
```bash
npm run dev
```

PostHog will automatically detect that you're on `localhost` or `127.0.0.1` and **disable all tracking**.

You'll see a console message:
```
📊 PostHog Analytics: ⏸️  DISABLED (localhost)
```

## 🎛️ Manual Toggle (Development Only)

### Visual Toggle Button

A toggle button appears in the **footer** of your app when running in development mode:

- **Green "Analytics On"** - Currently tracking events
- **Gray "Analytics Off"** - Not tracking events

Click the button to toggle analytics on/off. Your preference is saved to `localStorage`.

### Browser Console Commands

You can also control analytics from the browser console:

#### Disable Analytics
```javascript
localStorage.setItem('disable_analytics', 'true')
location.reload() // Refresh to apply
```

#### Enable Analytics
```javascript
localStorage.removeItem('disable_analytics')
location.reload() // Refresh to apply
```

#### Check Current Status
```javascript
localStorage.getItem('disable_analytics') // Returns 'true' if disabled, null if enabled
```

#### Use PostHog Methods Directly
```javascript
// Opt out (disable tracking)
window.posthog.opt_out_capturing()

// Opt in (enable tracking)
window.posthog.opt_in_capturing()

// Check if opted out
window.posthog.has_opted_out_capturing()
```

## 🔧 Environment-Based Control

### Disable for Specific Environments

Edit [src/main.jsx](src/main.jsx:21-32) to customize when analytics is disabled:

```javascript
// Disable on localhost
const isLocalhost = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'

// Disable in development mode
const isDevelopment = import.meta.env.DEV

// Disable via localStorage
const isDisabled = localStorage.getItem('disable_analytics') === 'true'

const posthogOptions = {
  // Combine conditions as needed
  opt_out_capturing_by_default: isLocalhost || isDisabled || isDevelopment,
  // ... other options
}
```

### Disable Completely

To completely disable PostHog in your build:

**Option 1: Comment out PostHogProvider**

In [src/main.jsx](src/main.jsx):
```jsx
// Wrap with PostHogProvider - DISABLED
// <PostHogProvider apiKey={...} options={...}>
  <QueryClientProvider client={queryClient}>
    <App />
  </QueryClientProvider>
// </PostHogProvider>
```

**Option 2: Conditional Rendering**

```jsx
const AnalyticsWrapper = import.meta.env.PROD ? PostHogProvider : React.Fragment

<AnalyticsWrapper apiKey={...} options={...}>
  <QueryClientProvider client={queryClient}>
    <App />
  </QueryClientProvider>
</AnalyticsWrapper>
```

**Option 3: Remove Environment Variables**

Remove PostHog keys from `.env`:
```bash
# VITE_PUBLIC_POSTHOG_KEY=...
# VITE_PUBLIC_POSTHOG_HOST=...
```

PostHog will fail to initialize if keys are missing (safe to do).

## 📊 Selective Event Tracking

### Disable Specific Events

Modify [src/lib/analytics.js](src/lib/analytics.js) to conditionally track events:

```javascript
export function useAnalytics() {
  const posthog = usePostHog()
  const isDev = import.meta.env.DEV

  return {
    trackProductView: (product) => {
      // Skip tracking in development
      if (isDev) return

      posthog?.capture('product_viewed', {
        product_id: product.id,
        // ... other properties
      })
    },
    // ... other methods
  }
}
```

### Track Only Production Events

```javascript
const shouldTrack = import.meta.env.PROD && !window.location.hostname.includes('localhost')

if (shouldTrack) {
  analytics.trackProductView(product)
}
```

## 🧪 Testing Analytics Without Sending Data

### Debug Mode (Development)

PostHog automatically enables debug mode in development:

```javascript
loaded: (posthog) => {
  if (import.meta.env.DEV) {
    posthog.debug() // Shows all events in console without sending
  }
}
```

Events are logged to console but can be prevented from sending by disabling capture.

### Test Mode

Create a test flag:

```javascript
const isTestMode = localStorage.getItem('analytics_test_mode') === 'true'

if (isTestMode) {
  console.log('📊 Would track:', eventName, properties)
  return // Don't actually track
}

posthog?.capture(eventName, properties)
```

Enable test mode:
```javascript
localStorage.setItem('analytics_test_mode', 'true')
```

## 🎯 Best Practices

### Development
- ✅ **Use localhost** - Automatically disabled
- ✅ **Use toggle button** - Quick on/off during testing
- ✅ **Check console** - See what would be tracked

### Staging
- ✅ **Keep enabled** - Test analytics pipeline
- ✅ **Filter in PostHog** - Create segments excluding staging data
- ✅ **Use separate project** - Create staging PostHog project

### Production
- ✅ **Keep enabled** - Get real user insights
- ❌ **Don't disable** - You need this data!

## 🔍 Verify Analytics Status

### Check in Browser Console
```javascript
// Check if PostHog is loaded
console.log('PostHog loaded:', !!window.posthog)

// Check if capturing is enabled
console.log('Capturing:', !window.posthog?.has_opted_out_capturing())

// Check configuration
console.log('Config:', window.posthog?.config)
```

### Check in PostHog Dashboard

1. Go to [app.posthog.com](https://app.posthog.com)
2. Navigate to **Live Events**
3. Perform an action in your app
4. Event should appear within seconds (if enabled)

### Visual Indicators

In development mode, you'll see:
- Console messages: `📊 PostHog Analytics: ⏸️ DISABLED (localhost)` or `✅ ENABLED`
- Debug logs: All tracked events in console
- Toggle button: Shows current state in footer

## 🚨 Troubleshooting

### Analytics Not Working in Production

1. Check environment variables are set in Vercel
2. Verify keys are correct
3. Check browser console for errors
4. Confirm PostHog project is active

### Toggle Button Not Showing

The toggle only appears in **development mode** (`npm run dev`). It won't show in production builds.

### Events Still Being Tracked on Localhost

1. Check localStorage: `localStorage.getItem('disable_analytics')`
2. Clear localStorage: `localStorage.clear()`
3. Hard refresh: Ctrl+Shift+R (Windows/Linux) or Cmd+Shift+R (Mac)
4. Check main.jsx configuration

## 📚 Additional Resources

- [PostHog Opt-Out Documentation](https://posthog.com/docs/libraries/js#opt-users-out)
- [PostHog Configuration Options](https://posthog.com/docs/libraries/js#config)
- [GDPR Compliance](https://posthog.com/docs/privacy/gdpr-compliance)
