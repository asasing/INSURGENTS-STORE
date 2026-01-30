import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Minus, Plus, Trash2, ShoppingBag } from 'lucide-react'
import { useCartStore } from '../store/cartStore'
import Button from '../components/common/Button'
import { formatPrice } from '../lib/utils'
import { checkProductAvailability } from '../services/products'
import toast from 'react-hot-toast'

// Size options
const APPAREL_SIZES = ['XS', 'S', 'M', 'L', 'XL', 'XXL', 'Free Size']
const SHOE_SIZES_EU = [35, 36, 37, 38, 39, 40, 41, 42, 43, 44, 45, 46, 47, 48]

export default function Cart() {
  const { items, updateQuantity, updateSize, removeItem, getTotal } = useCartStore()
  const [updatingSize, setUpdatingSize] = useState({})
  const total = getTotal()

  const handleSizeChange = async (cartItemId, item, newSize) => {
    setUpdatingSize({ ...updatingSize, [cartItemId]: true })

    try {
      // Check if new size is available
      const availability = await checkProductAvailability(item.id, newSize, item.quantity)

      if (!availability.available) {
        toast.error(availability.message)
        setUpdatingSize({ ...updatingSize, [cartItemId]: false })
        return
      }

      // Update size if available
      updateSize(cartItemId, newSize)
      analytics.trackSizeChange(item, item.selectedSize, newSize)
      const isApparel = item.category?.slug === 'apparels'
      const sizeLabel = isApparel ? newSize : `EU ${newSize}`
      toast.success(`Size updated to ${sizeLabel}`)
    } catch (error) {
      console.error('Error checking availability:', error)
      toast.error('Error checking size availability')
    } finally {
      setUpdatingSize({ ...updatingSize, [cartItemId]: false })
    }
  }

  const handleQuantityIncrease = async (cartItemId, item) => {
    const newQuantity = item.quantity + 1

    try {
      // Check if quantity is available
      const availability = await checkProductAvailability(item.id, item.selectedSize, newQuantity)

      if (!availability.available) {
        toast.error(availability.message)
        return
      }

      updateQuantity(cartItemId, newQuantity)
      analytics.trackQuantityChange(item, item.quantity, newQuantity)
    } catch (error) {
      console.error('Error checking availability:', error)
      toast.error('Error checking stock availability')
    }
  }

  const handleQuantityDecrease = (cartItemId, item) => {
    const newQuantity = item.quantity - 1
    if (newQuantity >= 1) {
      updateQuantity(cartItemId, newQuantity)
      analytics.trackQuantityChange(item, item.quantity, newQuantity)
    }
  }

  const handleRemoveItem = (cartItemId, item) => {
    removeItem(cartItemId)
    analytics.trackRemoveFromCart(item)
    analytics.trackButtonClick('remove_from_cart', 'cart', {
      product_id: item.id,
      product_name: item.name
    })
  }

  if (items.length === 0) {
    return (
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-md mx-auto text-center">
          <ShoppingBag className="w-24 h-24 mx-auto text-gray-300 dark:text-gray-600 mb-6" />
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
            Your cart is empty
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mb-8">
            Looks like you haven't added anything to your cart yet.
          </p>
          <Link to="/">
            <Button>Continue Shopping</Button>
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-8">
        Shopping Cart
      </h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Cart Items */}
        <div className="lg:col-span-2 space-y-4">
          {items.map((item) => {
            const isApparel = item.category?.slug === 'apparels'
            const sizeOptions = isApparel ? APPAREL_SIZES : SHOE_SIZES_EU

            return (
              <div
                key={item.cartItemId}
                className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-4"
              >
                <div className="flex gap-4">
                  {/* Image */}
                  <div className="w-24 h-24 flex-shrink-0">
                    <img
                      src={item.images?.[0]?.url || '/placeholder.jpg'}
                      alt={item.name}
                      className="w-full h-full object-cover rounded"
                    />
                  </div>

                  {/* Details */}
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-900 dark:text-white mb-1">
                      {item.name}
                    </h3>

                    {item.selectedColor && (
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        Color: {item.selectedColor}
                      </p>
                    )}

                    {/* Size Selector */}
                    <div className="mt-2">
                      <label className="block text-xs text-gray-500 dark:text-gray-400 mb-1">
                        Size
                      </label>
                      <select
                        value={item.selectedSize}
                        onChange={(e) => handleSizeChange(item.cartItemId, item, e.target.value)}
                        disabled={updatingSize[item.cartItemId]}
                        className="px-3 py-1 text-sm border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
                      >
                        {sizeOptions.map((size) => (
                          <option key={size} value={size}>
                            {isApparel ? size : `EU ${size}`}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="mt-3 flex items-center gap-4">
                      {/* Quantity Controls */}
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleQuantityDecrease(item.cartItemId, item)}
                          disabled={item.quantity <= 1}
                          className="p-1 rounded hover:bg-gray-100 dark:hover:bg-gray-700 disabled:opacity-50 text-gray-700 dark:text-gray-300"
                        >
                          <Minus className="w-4 h-4" />
                        </button>

                        <span className="w-8 text-center font-medium text-gray-900 dark:text-white">
                          {item.quantity}
                        </span>

                        <button
                          onClick={() => handleQuantityIncrease(item.cartItemId, item)}
                          className="p-1 rounded hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300"
                        >
                          <Plus className="w-4 h-4" />
                        </button>
                      </div>

                      {/* Remove Button */}
                      <button
                        onClick={() => handleRemoveItem(item.cartItemId, item)}
                        className="text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 flex items-center gap-1 text-sm"
                      >
                        <Trash2 className="w-4 h-4" />
                        Remove
                      </button>
                    </div>
                  </div>

                  {/* Price */}
                  <div className="text-right">
                    <div className="font-bold text-lg text-gray-900 dark:text-white">
                      {formatPrice((item.sale_price || item.price) * item.quantity)}
                    </div>
                    {item.sale_price && (
                      <div className="text-sm text-gray-500 line-through">
                        {formatPrice(item.price * item.quantity)}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )
          })}
        </div>

        {/* Order Summary */}
        <div className="lg:col-span-1">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 sticky top-4">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
              Order Summary
            </h2>

            <div className="space-y-3 mb-6">
              <div className="flex justify-between text-gray-600 dark:text-gray-400">
                <span>Subtotal ({items.length} items)</span>
                <span>{formatPrice(total)}</span>
              </div>

              <div className="flex justify-between text-gray-600 dark:text-gray-400">
                <span>Shipping</span>
                <span>Calculated at checkout</span>
              </div>

              <div className="border-t border-gray-200 dark:border-gray-700 pt-3">
                <div className="flex justify-between text-lg font-bold text-gray-900 dark:text-white">
                  <span>Total</span>
                  <span>{formatPrice(total)}</span>
                </div>
              </div>
            </div>

            <Link
              to="/checkout"
              onClick={() => {
                analytics.trackCheckoutButtonClick('cart', items.length, total)
                analytics.trackButtonClick('proceed_to_checkout', 'cart', {
                  items_count: items.length,
                  total
                })
              }}
            >
              <Button className="w-full mb-3">
                Proceed to Checkout
              </Button>
            </Link>

            <Link
              to="/"
              onClick={() => {
                analytics.trackNavigation('home', 'cart_continue_shopping')
                analytics.trackButtonClick('continue_shopping', 'cart')
              }}
            >
              <Button variant="secondary" className="w-full">
                Continue Shopping
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
