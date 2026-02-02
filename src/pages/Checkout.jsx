import { useState, useEffect } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Package, CreditCard } from 'lucide-react'
import { useCartStore } from '../store/cartStore'
import { createOrder, createMayaCheckoutSession } from '../services/orders'
import Button from '../components/common/Button'
import Input from '../components/common/Input'
import Card from '../components/common/Card'
import LoadingModal from '../components/common/LoadingModal'
import { formatPrice } from '../lib/utils'
import toast from 'react-hot-toast'
import { useAnalytics } from '../lib/analytics'

const checkoutSchema = z.object({
  customerName: z.string().min(2, 'Name must be at least 2 characters'),
  customerEmail: z.string().email('Invalid email address'),
  customerPhone: z.string().min(10, 'Phone number must be at least 10 digits'),
  address: z.string().min(10, 'Address must be at least 10 characters'),
  city: z.string().min(2, 'City is required'),
  postalCode: z.string().min(4, 'Postal code is required'),
  notes: z.string().optional()
})

export default function Checkout() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const { items, getTotal, clearCart } = useCartStore()
  const [loading, setLoading] = useState(false)
  const [paymentMethod, setPaymentMethod] = useState('maya')
  const analytics = useAnalytics()

  const {
    register,
    handleSubmit,
    formState: { errors }
  } = useForm({
    resolver: zodResolver(checkoutSchema)
  })

  const total = getTotal()

  // Track checkout started when page loads
  useEffect(() => {
    analytics.trackCheckoutStarted(items, total)
    analytics.trackButtonClick('checkout_page_loaded', 'checkout', {
      items_count: items.length,
      total
    })
  }, [])

  useEffect(() => {
    const status = searchParams.get('status')
    if (status !== 'cancelled') return
    const lastOrderId = localStorage.getItem('last_order_id')
    if (!lastOrderId) return
    import('../services/orders').then(({ updateOrder }) => {
      return updateOrder(lastOrderId, {
        status: 'cancelled',
        payment_status: 'failed'
      })
    }).catch((error) => {
      console.error('Failed to update cancelled order:', error)
    }).finally(() => {
      localStorage.removeItem('last_order_id')
    })
  }, [searchParams])

  if (items.length === 0) {
    navigate('/cart')
    return null
  }

  const onSubmit = async (data) => {
    setLoading(true)

    try {
      // Create order in database
      const order = await createOrder({
        customerName: data.customerName,
        customerEmail: data.customerEmail,
        customerPhone: data.customerPhone,
        items: items.map(item => ({
          id: item.id,
          name: item.name,
          price: item.sale_price || item.price,
          quantity: item.quantity,
          selectedSize: item.selectedSize,
          selectedColor: item.selectedColor
        })),
        total,
        shippingAddress: {
          address: data.address,
          city: data.city,
          postalCode: data.postalCode,
          notes: data.notes
        },
        paymentMethod,
        status: 'pending',
        paymentStatus: paymentMethod === 'cod' ? 'pending' : 'pending'
      })

      if (paymentMethod === 'cod') {
        localStorage.removeItem('last_order_id')
        analytics.trackPurchase(order)
        analytics.trackButtonClick('place_order_cod', 'checkout', {
          order_id: order.id,
          total: order.total
        })
        clearCart()
        setLoading(false);
        navigate('/order-success', {
          state: { orderId: order.id, paymentMethod: 'Cash on Delivery' },
        });
        return
      }

      // Create Maya checkout session
      try {
        const checkout = await createMayaCheckoutSession(order)
        localStorage.setItem('last_order_id', order.id)

        // Track purchase
        analytics.trackPurchase(order)
        analytics.trackButtonClick('place_order_success', 'checkout', {
          order_id: order.id,
          total: order.total,
          fallback_mode: checkout.fallbackMode
        })

        // Note: Cart will be cleared after successful payment confirmation
        // Don't clear cart here - user might cancel payment

        // Show success message
        if (checkout.fallbackMode) {
          toast.success('Order created! Redirecting to Maya payment...\n(Using payment link - Checkout API setup pending)')
        } else {
          toast.success('Order created! Redirecting to payment...')
        }

        // Redirect to Maya checkout or payment link
        setTimeout(() => {
          window.location.href = checkout.redirectUrl
        }, 1000)
      } catch (mayaError) {
        // If Maya checkout fails, still show order confirmation
        console.error('Maya checkout error:', mayaError)
        analytics.trackButtonClick('place_order_maya_error', 'checkout', {
          order_id: order.id,
          error: mayaError.message
        })
        // Don't clear cart - let user retry
        toast.error('Payment gateway error. Please contact support with your order ID.')
        navigate(`/order-confirmation/${order.id}`)
      }
    } catch (error) {
      console.error('Checkout error:', error)
      toast.error('Failed to process order. Please try again.')
      setLoading(false)
    }
  }

  return (
    <>
      <LoadingModal
        isOpen={loading}
        message="Processing your order..."
      />

      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-8">
          Checkout
        </h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Checkout Form */}
        <div className="lg:col-span-2">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {/* Customer Information */}
            <Card>
              <div className="flex items-center gap-2 mb-4">
                <Package className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                  Customer Information
                </h2>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input
                  label="Full Name *"
                  {...register('customerName')}
                  error={errors.customerName?.message}
                  placeholder="Juan Dela Cruz"
                />

                <Input
                  label="Email *"
                  type="email"
                  {...register('customerEmail')}
                  error={errors.customerEmail?.message}
                  placeholder="juan@example.com"
                />

                <div className="md:col-span-2">
                  <Input
                    label="Phone Number *"
                    {...register('customerPhone')}
                    error={errors.customerPhone?.message}
                    placeholder="+63 912 345 6789"
                  />
                </div>
              </div>
            </Card>

            {/* Shipping Address */}
            <Card>
              <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
                Shipping Address
              </h2>

              <div className="space-y-4">
                <Input
                  label="Street Address *"
                  {...register('address')}
                  error={errors.address?.message}
                  placeholder="123 Main Street, Barangay Example"
                />

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Input
                    label="City *"
                    {...register('city')}
                    error={errors.city?.message}
                    placeholder="Manila"
                  />

                  <Input
                    label="Postal Code *"
                    {...register('postalCode')}
                    error={errors.postalCode?.message}
                    placeholder="1000"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Order Notes (Optional)
                  </label>
                  <textarea
                    {...register('notes')}
                    rows={3}
                    className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Any special instructions for your order..."
                  />
                </div>
              </div>
            </Card>

            {/* Payment Info */}
            <Card>
              <div className="flex items-center gap-2 mb-4">
                <CreditCard className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                  Payment Method
                </h2>
              </div>

              <div className="space-y-3">
                <label className="flex items-start gap-3 p-4 border border-gray-200 dark:border-gray-700 rounded-lg cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800/50">
                  <input
                    type="radio"
                    name="paymentMethod"
                    value="maya"
                    checked={paymentMethod === 'maya'}
                    onChange={() => setPaymentMethod('maya')}
                    className="mt-1"
                  />
                  <div>
                    <div className="font-medium text-gray-900 dark:text-white">Maya (Card/Wallet)</div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">
                      You will be redirected to Maya to complete payment securely.
                    </div>
                  </div>
                </label>
                <label className="flex items-start gap-3 p-4 border border-gray-200 dark:border-gray-700 rounded-lg cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800/50">
                  <input
                    type="radio"
                    name="paymentMethod"
                    value="cod"
                    checked={paymentMethod === 'cod'}
                    onChange={() => setPaymentMethod('cod')}
                    className="mt-1"
                  />
                  <div>
                    <div className="font-medium text-gray-900 dark:text-white">Cash on Delivery (COD)</div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">
                      Pay the rider when your order arrives.
                    </div>
                  </div>
                </label>
              </div>
            </Card>

            {/* Submit Button */}
            <div className="flex justify-between items-center">
              <Button
                type="button"
                variant="secondary"
                onClick={() => navigate('/cart')}
                disabled={loading}
              >
                Back to Cart
              </Button>

              <Button
                type="submit"
                disabled={loading}
                className="flex items-center gap-2"
              >
                {loading ? 'Processing...' : 'Place Order'}
              </Button>
            </div>
          </form>
        </div>

        {/* Order Summary */}
        <div className="lg:col-span-1">
          <Card className="sticky top-4">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
              Order Summary
            </h2>

            <div className="space-y-3 mb-4">
              {items.map((item) => (
                <div key={item.cartItemId} className="flex gap-3">
                  <img
                    src={item.images?.[0]?.url || '/placeholder.jpg'}
                    alt={item.name}
                    className="w-16 h-16 object-cover rounded"
                  />
                  <div className="flex-1">
                    <div className="font-medium text-sm text-gray-900 dark:text-white">
                      {item.name}
                    </div>
                    <div className="text-xs text-gray-600 dark:text-gray-400">
                      Qty: {item.quantity}
                    </div>
                    <div className="text-sm font-medium text-gray-900 dark:text-white">
                      {formatPrice((item.sale_price || item.price) * item.quantity)}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="border-t border-gray-200 dark:border-gray-700 pt-4 space-y-2">
              <div className="flex justify-between text-gray-600 dark:text-gray-400">
                <span>Subtotal</span>
                <span>{formatPrice(total)}</span>
              </div>

              <div className="flex justify-between text-gray-600 dark:text-gray-400">
                <span>Shipping</span>
                <span>Calculated after order</span>
              </div>

              <div className="border-t border-gray-200 dark:border-gray-700 pt-2">
                <div className="flex justify-between text-lg font-bold text-gray-900 dark:text-white">
                  <span>Total</span>
                  <span>{formatPrice(total)}</span>
                </div>
              </div>
            </div>
          </Card>
        </div>
      </div>
      </div>
    </>
  )
}
