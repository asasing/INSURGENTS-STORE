import { usePostHog } from 'posthog-js/react'

/**
 * Custom hook for PostHog analytics
 * Usage: const analytics = useAnalytics()
 */
export function useAnalytics() {
  const posthog = usePostHog()

  return {
    // Track product views
    trackProductView: (product) => {
      posthog?.capture('product_viewed', {
        product_id: product.id,
        product_name: product.name,
        category: product.category?.name,
        price: product.price,
        sale_price: product.sale_price,
        is_on_sale: !!product.sale_price
      })
    },

    // Track when user adds item to cart
    trackAddToCart: (product, quantity, size) => {
      posthog?.capture('add_to_cart', {
        product_id: product.id,
        product_name: product.name,
        category: product.category?.name,
        price: product.sale_price || product.price,
        quantity,
        size,
        cart_value: (product.sale_price || product.price) * quantity
      })
    },

    // Track when user removes item from cart
    trackRemoveFromCart: (item) => {
      posthog?.capture('remove_from_cart', {
        product_id: item.id,
        product_name: item.name,
        quantity: item.quantity
      })
    },

    // Track checkout initiated
    trackCheckoutStarted: (items, total) => {
      posthog?.capture('checkout_started', {
        cart_items_count: items.length,
        cart_total: total,
        items: items.map(item => ({
          product_id: item.id,
          product_name: item.name,
          quantity: item.quantity,
          price: item.sale_price || item.price
        }))
      })
    },

    // Track successful purchase
    trackPurchase: (order) => {
      posthog?.capture('purchase_completed', {
        order_id: order.id,
        total: order.total,
        items_count: order.items?.length,
        customer_email: order.customer_email,
        payment_method: order.payment_method || 'maya'
      })
    },

    // Track search
    trackSearch: (query, results_count) => {
      posthog?.capture('search', {
        search_query: query,
        results_count
      })
    },

    // Track category view
    trackCategoryView: (categoryName) => {
      posthog?.capture('category_viewed', {
        category_name: categoryName
      })
    },

    // Track Buy Now clicks (fast checkout)
    trackBuyNow: (product, size) => {
      posthog?.capture('buy_now_clicked', {
        product_id: product.id,
        product_name: product.name,
        price: product.sale_price || product.price,
        size
      })
    },

    // Track size changes in cart
    trackSizeChange: (product, oldSize, newSize) => {
      posthog?.capture('cart_size_changed', {
        product_id: product.id,
        product_name: product.name,
        old_size: oldSize,
        new_size: newSize
      })
    },

    // Identify user (for logged-in users or after checkout)
    identifyUser: (userId, properties = {}) => {
      posthog?.identify(userId, properties)
    },

    // Track navigation clicks
    trackNavigation: (destination, source = 'unknown') => {
      posthog?.capture('navigation_clicked', {
        destination,
        source
      })
    },

    // Track menu item clicks
    trackMenuClick: (menuItem) => {
      posthog?.capture('menu_clicked', {
        menu_item: menuItem
      })
    },

    // Track checkout button click
    trackCheckoutButtonClick: (source, items_count, total) => {
      posthog?.capture('checkout_button_clicked', {
        source, // 'cart', 'product_page', etc.
        items_count,
        cart_total: total
      })
    },

    // Track theme toggle
    trackThemeToggle: (newTheme) => {
      posthog?.capture('theme_toggled', {
        new_theme: newTheme
      })
    },

    // Track filter usage
    trackFilter: (filterType, filterValue) => {
      posthog?.capture('filter_used', {
        filter_type: filterType,
        filter_value: filterValue
      })
    },

    // Track sort usage
    trackSort: (sortBy) => {
      posthog?.capture('sort_used', {
        sort_by: sortBy
      })
    },

    // Track cart view
    trackCartView: (items_count, total) => {
      posthog?.capture('cart_viewed', {
        items_count,
        cart_total: total
      })
    },

    // Track quantity changes
    trackQuantityChange: (product, oldQuantity, newQuantity) => {
      posthog?.capture('quantity_changed', {
        product_id: product.id,
        product_name: product.name,
        old_quantity: oldQuantity,
        new_quantity: newQuantity,
        change: newQuantity - oldQuantity
      })
    },

    // Track button clicks (generic)
    trackButtonClick: (buttonName, location, metadata = {}) => {
      posthog?.capture('button_clicked', {
        button_name: buttonName,
        location,
        ...metadata
      })
    },

    // Track custom events
    track: (eventName, properties = {}) => {
      posthog?.capture(eventName, properties)
    }
  }
}

/**
 * Standalone analytics functions (for use outside React components)
 */
export const analytics = {
  // These will be initialized when PostHog loads
  trackEvent: (eventName, properties = {}) => {
    if (window.posthog) {
      window.posthog.capture(eventName, properties)
    }
  },

  identifyUser: (userId, properties = {}) => {
    if (window.posthog) {
      window.posthog.identify(userId, properties)
    }
  }
}
