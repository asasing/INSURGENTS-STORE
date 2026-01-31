import { useEffect, useState } from 'react'
import { useParams, Link, useSearchParams } from 'react-router-dom'
import { CheckCircle, Package } from 'lucide-react'
import { getOrderById, updateOrder } from '../services/orders'
import Button from '../components/common/Button'
import Card from '../components/common/Card'
import Spinner from '../components/common/Spinner'
import { formatPrice } from '../lib/utils'

export default function OrderConfirmation() {
  const { orderId } = useParams()
  const [searchParams] = useSearchParams()
  const [order, setOrder] = useState(null)
  const [loading, setLoading] = useState(true)
  const [statusSynced, setStatusSynced] = useState(false)

  useEffect(() => {
    if (orderId) {
      loadOrder()
    }
  }, [orderId])

  const loadOrder = async () => {
    try {
      const data = await getOrderById(orderId)
      setOrder(data)
    } catch (error) {
      console.error('Error loading order:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (!order || statusSynced) return
    const status = searchParams.get('status')
    if (!status) return

    const updates = {}
    if (status === 'success') {
      if (order.payment_status !== 'paid') updates.payment_status = 'paid'
      if (order.status === 'pending') updates.status = 'processing'
    } else if (status === 'failed') {
      if (order.payment_status !== 'failed') updates.payment_status = 'failed'
    } else if (status === 'cancelled') {
      updates.status = 'cancelled'
      updates.payment_status = 'failed'
    }

    if (!Object.keys(updates).length) {
      setStatusSynced(true)
      return
    }

    updateOrder(order.id, updates)
      .then((next) => setOrder(next))
      .catch((error) => console.error('Failed to sync order status:', error))
      .finally(() => setStatusSynced(true))
  }, [order, searchParams, statusSynced])

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-16 flex justify-center">
        <Spinner size="lg" />
      </div>
    )
  }

  if (!order) {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
          Order not found
        </h2>
        <Link to="/">
          <Button>Return to Home</Button>
        </Link>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-3xl mx-auto">
        {/* Success Message */}
        <div className="text-center mb-8">
          <CheckCircle className="w-20 h-20 text-green-600 dark:text-green-400 mx-auto mb-4" />
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            Order Confirmed!
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Thank you for your purchase. We'll send you a confirmation email shortly.
          </p>
        </div>

        {/* Order Details */}
        <Card className="mb-6">
          <div className="border-b border-gray-200 dark:border-gray-700 pb-4 mb-4">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
              Order Details
            </h2>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Order ID: <span className="font-mono">{order.id}</span>
            </p>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Date: {new Date(order.created_at).toLocaleDateString()}
            </p>
          </div>

          {/* Customer Info */}
          <div className="mb-6">
            <h3 className="font-semibold text-gray-900 dark:text-white mb-2">
              Customer Information
            </h3>
            <p className="text-gray-600 dark:text-gray-400">{order.customer_name}</p>
            <p className="text-gray-600 dark:text-gray-400">{order.customer_email}</p>
            <p className="text-gray-600 dark:text-gray-400">{order.customer_phone}</p>
          </div>

          {/* Shipping Address */}
          <div className="mb-6">
            <h3 className="font-semibold text-gray-900 dark:text-white mb-2">
              Shipping Address
            </h3>
            <p className="text-gray-600 dark:text-gray-400">
              {order.shipping_address?.address}
            </p>
            <p className="text-gray-600 dark:text-gray-400">
              {order.shipping_address?.city}, {order.shipping_address?.postalCode}
            </p>
          </div>

          {/* Order Items */}
          <div className="mb-6">
            <h3 className="font-semibold text-gray-900 dark:text-white mb-3">
              Order Items
            </h3>
            <div className="space-y-3">
              {order.items?.map((item, index) => (
                <div key={index} className="flex justify-between items-center">
                  <div>
                    <div className="font-medium text-gray-900 dark:text-white">
                      {item.name}
                    </div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">
                      Quantity: {item.quantity}
                    </div>
                  </div>
                  <div className="font-medium text-gray-900 dark:text-white">
                    {formatPrice(item.price * item.quantity)}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Total */}
          <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
            <div className="flex justify-between text-xl font-bold text-gray-900 dark:text-white">
              <span>Total</span>
              <span>{formatPrice(order.total)}</span>
            </div>
          </div>
        </Card>

        {/* Payment & Fulfillment Status */}
        <Card className="mb-6">
          <div className="flex items-center gap-3">
            <Package className="w-6 h-6 text-blue-600 dark:text-blue-400" />
            <div>
              <div className="font-semibold text-gray-900 dark:text-white">
                Payment Method: <span className="text-orange-600">{(order.payment_method || 'maya').toUpperCase()}</span>
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">
                Payment Status: <span className="text-orange-600">{order.payment_status || 'pending'}</span>
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">
                Order Status: <span className="text-orange-600">{order.status || 'pending'}</span>
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">
                We'll send you updates about your order via email
              </div>
            </div>
          </div>
        </Card>

        {/* Actions */}
        <div className="flex gap-4 justify-center">
          <Link to="/">
            <Button>Continue Shopping</Button>
          </Link>
        </div>
      </div>
    </div>
  )
}
