import { useMemo, useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { Eye, Package, RefreshCcw } from 'lucide-react'
import { getOrders, updateOrder } from '../../services/orders'
import Card from '../../components/common/Card'
import Button from '../../components/common/Button'
import Modal from '../../components/common/Modal'
import Spinner from '../../components/common/Spinner'
import { formatPrice } from '../../lib/utils'
import toast from 'react-hot-toast'

const STATUS_OPTIONS = ['pending', 'processing', 'shipped', 'completed', 'refunded', 'cancelled']
const PAYMENT_STATUS_OPTIONS = ['pending', 'paid', 'refunded', 'failed']
const PAYMENT_METHOD_LABELS = {
  maya: 'Maya',
  cod: 'COD'
}

const statusBadgeClass = (status) => {
  switch (status) {
    case 'shipped':
      return 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-300'
    case 'completed':
      return 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300'
    case 'paid':
      return 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300'
    case 'processing':
      return 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300'
    case 'cancelled':
    case 'refunded':
    case 'failed':
      return 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300'
    default:
      return 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-300'
  }
}

export default function Orders() {
  const queryClient = useQueryClient()
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [paymentFilter, setPaymentFilter] = useState('all')
  const [methodFilter, setMethodFilter] = useState('all')
  const [selectedOrder, setSelectedOrder] = useState(null)
  const [selectedIds, setSelectedIds] = useState(() => new Set())
  const [sortKey, setSortKey] = useState('created_at')
  const [sortDir, setSortDir] = useState('desc')

  const { data: orders, isLoading } = useQuery({
    queryKey: ['orders'],
    queryFn: getOrders
  })

  const updateMutation = useMutation({
    mutationFn: ({ id, updates }) => updateOrder(id, updates),
    onSuccess: () => {
      queryClient.invalidateQueries(['orders'])
      toast.success('Order updated')
    },
    onError: (error) => {
      console.error(error)
      toast.error('Failed to update order')
    }
  })

  const bulkMutation = useMutation({
    mutationFn: async ({ ids, updates }) => {
      await Promise.all(ids.map((id) => updateOrder(id, updates)))
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['orders'])
      setSelectedIds(new Set())
      toast.success('Orders updated')
    },
    onError: (error) => {
      console.error(error)
      toast.error('Failed to update selected orders')
    }
  })

  const filteredOrders = useMemo(() => {
    if (!orders) return []
    return orders.filter((order) => {
      const query = search.trim().toLowerCase()
      const matchesQuery =
        !query ||
        order.id?.toLowerCase().includes(query) ||
        order.customer_name?.toLowerCase().includes(query) ||
        order.customer_email?.toLowerCase().includes(query)
      const matchesStatus = statusFilter === 'all' || order.status === statusFilter
      const matchesPayment = paymentFilter === 'all' || order.payment_status === paymentFilter
      const matchesMethod = methodFilter === 'all' || order.payment_method === methodFilter
      return matchesQuery && matchesStatus && matchesPayment && matchesMethod
    })
  }, [orders, paymentFilter, methodFilter, search, statusFilter])

  const sortedOrders = useMemo(() => {
    const dir = sortDir === 'asc' ? 1 : -1
    return [...filteredOrders].sort((a, b) => {
      const av = a[sortKey]
      const bv = b[sortKey]
      if (sortKey === 'total') return dir * (Number(av || 0) - Number(bv || 0))
      if (sortKey === 'created_at') return dir * (new Date(av).getTime() - new Date(bv).getTime())
      return dir * String(av ?? '').localeCompare(String(bv ?? ''))
    })
  }, [filteredOrders, sortDir, sortKey])

  const toggleSort = (key) => {
    if (sortKey === key) {
      setSortDir((prev) => (prev === 'asc' ? 'desc' : 'asc'))
      return
    }
    setSortKey(key)
    setSortDir('asc')
  }

  const sortLabel = (key, label) => (
    <button
      type="button"
      onClick={() => toggleSort(key)}
      className="inline-flex items-center gap-1"
    >
      <span>{label}</span>
      {sortKey === key ? <span className="text-xs">{sortDir === 'asc' ? '▲' : '▼'}</span> : null}
    </button>
  )

  const allVisibleSelected = filteredOrders.length > 0 && filteredOrders.every((o) => selectedIds.has(o.id))
  const someVisibleSelected = filteredOrders.some((o) => selectedIds.has(o.id))

  const toggleSelectAllVisible = () => {
    setSelectedIds((prev) => {
      const next = new Set(prev)
      if (allVisibleSelected) {
        filteredOrders.forEach((o) => next.delete(o.id))
      } else {
        filteredOrders.forEach((o) => next.add(o.id))
      }
      return next
    })
  }

  const toggleSelectOne = (id) => {
    setSelectedIds((prev) => {
      const next = new Set(prev)
      if (next.has(id)) {
        next.delete(id)
      } else {
        next.add(id)
      }
      return next
    })
  }

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Spinner size="lg" />
      </div>
    )
  }

  return (
    <div>
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Orders</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">Track and fulfill online orders.</p>
        </div>
        <Button
          variant="secondary"
          className="flex items-center gap-2"
          onClick={() => queryClient.invalidateQueries(['orders'])}
        >
          <RefreshCcw className="w-4 h-4" />
          Refresh
        </Button>
      </div>

      <Card className="mb-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <input
            type="text"
            placeholder="Search by order ID, name, email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <select
            value={methodFilter}
            onChange={(e) => setMethodFilter(e.target.value)}
            className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">All payment methods</option>
            <option value="maya">Maya</option>
            <option value="cod">COD</option>
          </select>
          <select
            value={paymentFilter}
            onChange={(e) => setPaymentFilter(e.target.value)}
            className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">All payment statuses</option>
            {PAYMENT_STATUS_OPTIONS.map((status) => (
              <option key={status} value={status}>{status}</option>
            ))}
          </select>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">All order statuses</option>
            {STATUS_OPTIONS.map((status) => (
              <option key={status} value={status}>{status}</option>
            ))}
          </select>
        </div>
      </Card>

      {selectedIds.size ? (
        <Card className="mb-6">
          <div className="flex flex-col md:flex-row md:items-center gap-3 justify-between">
            <div className="text-sm text-gray-700 dark:text-gray-300">
              {selectedIds.size} selected
            </div>
            <div className="flex flex-wrap gap-2">
              <Button
                variant="secondary"
                onClick={() => bulkMutation.mutate({ ids: Array.from(selectedIds), updates: { status: 'shipped' } })}
                disabled={bulkMutation.isLoading}
              >
                Mark Shipped
              </Button>
              <Button
                variant="secondary"
                onClick={() => bulkMutation.mutate({ ids: Array.from(selectedIds), updates: { payment_status: 'paid' } })}
                disabled={bulkMutation.isLoading}
              >
                Mark Paid
              </Button>
              <select
                className="px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-sm"
                defaultValue=""
                onChange={(e) => {
                  const value = e.target.value
                  if (!value) return
                  bulkMutation.mutate({ ids: Array.from(selectedIds), updates: { status: value } })
                }}
              >
                <option value="">Set order status...</option>
                {STATUS_OPTIONS.map((status) => (
                  <option key={status} value={status}>{status}</option>
                ))}
              </select>
              <select
                className="px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-sm"
                defaultValue=""
                onChange={(e) => {
                  const value = e.target.value
                  if (!value) return
                  bulkMutation.mutate({ ids: Array.from(selectedIds), updates: { payment_status: value } })
                }}
              >
                <option value="">Set payment status...</option>
                {PAYMENT_STATUS_OPTIONS.map((status) => (
                  <option key={status} value={status}>{status}</option>
                ))}
              </select>
              <Button
                variant="outline"
                onClick={() => setSelectedIds(new Set())}
                disabled={bulkMutation.isLoading}
              >
                Clear Selection
              </Button>
            </div>
          </div>
        </Card>
      ) : null}

      <Card>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200 dark:border-gray-700 text-left">
                <th className="py-3 px-4 font-semibold text-gray-700 dark:text-gray-300">
                  <input
                    type="checkbox"
                    checked={allVisibleSelected}
                    ref={(el) => {
                      if (el) el.indeterminate = !allVisibleSelected && someVisibleSelected
                    }}
                    onChange={toggleSelectAllVisible}
                    className="w-5 h-5"
                  />
                </th>
                <th className="py-3 px-4 font-semibold text-gray-700 dark:text-gray-300">{sortLabel('id', 'Order')}</th>
                <th className="py-3 px-4 font-semibold text-gray-700 dark:text-gray-300">{sortLabel('created_at', 'Date')}</th>
                <th className="py-3 px-4 font-semibold text-gray-700 dark:text-gray-300">{sortLabel('customer_name', 'Customer')}</th>
                <th className="py-3 px-4 font-semibold text-gray-700 dark:text-gray-300">{sortLabel('total', 'Total')}</th>
                <th className="py-3 px-4 font-semibold text-gray-700 dark:text-gray-300">{sortLabel('payment_method', 'Payment')}</th>
                <th className="py-3 px-4 font-semibold text-gray-700 dark:text-gray-300">{sortLabel('payment_status', 'Payment Status')}</th>
                <th className="py-3 px-4 font-semibold text-gray-700 dark:text-gray-300">{sortLabel('status', 'Order Status')}</th>
                <th className="py-3 px-4 font-semibold text-gray-700 dark:text-gray-300">Actions</th>
              </tr>
            </thead>
            <tbody>
              {sortedOrders.length ? (
                sortedOrders.map((order) => (
                  <tr
                    key={order.id}
                    className="border-b border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800/50"
                  >
                    <td className="py-3 px-4">
                      <input
                        type="checkbox"
                        checked={selectedIds.has(order.id)}
                        onChange={() => toggleSelectOne(order.id)}
                        className="w-5 h-5"
                      />
                    </td>
                    <td className="py-3 px-4">
                      <div className="font-mono text-xs text-gray-600 dark:text-gray-400">
                        {order.id}
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <div className="text-xs text-gray-500 dark:text-gray-500">
                        {new Date(order.created_at).toLocaleString()}
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <div className="font-medium text-gray-900 dark:text-white">{order.customer_name}</div>
                      <div className="text-xs text-gray-500 dark:text-gray-400">{order.customer_email}</div>
                    </td>
                    <td className="py-3 px-4 font-semibold text-gray-900 dark:text-white">
                      {formatPrice(order.total)}
                    </td>
                    <td className="py-3 px-4">
                      <span className="inline-flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300">
                        <Package className="w-4 h-4" />
                        {PAYMENT_METHOD_LABELS[order.payment_method] || order.payment_method || 'Maya'}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <div className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-semibold mb-2 ${statusBadgeClass(order.payment_status || 'pending')}`}>
                        {order.payment_status || 'pending'}
                      </div>
                      <select
                        value={order.payment_status || 'pending'}
                        onChange={(e) =>
                          updateMutation.mutate({
                            id: order.id,
                            updates: { payment_status: e.target.value }
                          })
                        }
                        className="w-full px-2 py-1 rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-sm"
                      >
                        {PAYMENT_STATUS_OPTIONS.map((status) => (
                          <option key={status} value={status}>{status}</option>
                        ))}
                      </select>
                    </td>
                    <td className="py-3 px-4">
                      <div className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-semibold mb-2 ${statusBadgeClass(order.status || 'pending')}`}>
                        {order.status || 'pending'}
                      </div>
                      <select
                        value={order.status || 'pending'}
                        onChange={(e) =>
                          updateMutation.mutate({
                            id: order.id,
                            updates: { status: e.target.value }
                          })
                        }
                        className="w-full px-2 py-1 rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-sm"
                      >
                        {STATUS_OPTIONS.map((status) => (
                          <option key={status} value={status}>{status}</option>
                        ))}
                      </select>
                    </td>
                    <td className="py-3 px-4">
                      <Button
                        variant="secondary"
                        className="flex items-center gap-2"
                        onClick={() => setSelectedOrder(order)}
                      >
                        <Eye className="w-4 h-4" />
                        View
                      </Button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={9} className="py-8 text-center text-gray-500 dark:text-gray-400">
                    No orders found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>

      {selectedOrder ? (
        <Modal isOpen={!!selectedOrder} onClose={() => setSelectedOrder(null)} title="Order Details">
          <div className="space-y-4">
            <div className="text-sm text-gray-600 dark:text-gray-400">
              <div>Order ID: <span className="font-mono">{selectedOrder.id}</span></div>
              <div>Date: {new Date(selectedOrder.created_at).toLocaleString()}</div>
            </div>
            <div>
              <div className="font-semibold text-gray-900 dark:text-white">Customer</div>
              <div className="text-gray-600 dark:text-gray-400">{selectedOrder.customer_name}</div>
              <div className="text-gray-600 dark:text-gray-400">{selectedOrder.customer_email}</div>
              <div className="text-gray-600 dark:text-gray-400">{selectedOrder.customer_phone}</div>
            </div>
            <div>
              <div className="font-semibold text-gray-900 dark:text-white">Shipping Address</div>
              <div className="text-gray-600 dark:text-gray-400">
                {selectedOrder.shipping_address?.address}
              </div>
              <div className="text-gray-600 dark:text-gray-400">
                {selectedOrder.shipping_address?.city} {selectedOrder.shipping_address?.postalCode}
              </div>
              {selectedOrder.shipping_address?.notes ? (
                <div className="text-gray-500 dark:text-gray-400 text-sm">
                  Notes: {selectedOrder.shipping_address?.notes}
                </div>
              ) : null}
            </div>
            <div>
              <div className="font-semibold text-gray-900 dark:text-white mb-2">Items</div>
              <div className="space-y-2">
                {selectedOrder.items?.map((item, idx) => (
                  <div key={`${item.id}-${idx}`} className="flex justify-between text-sm text-gray-700 dark:text-gray-300">
                    <div>
                      <div className="font-medium">{item.name}</div>
                      <div className="text-xs text-gray-500 dark:text-gray-400">
                        Qty: {item.quantity} {item.selectedSize ? `• Size: ${item.selectedSize}` : ''} {item.selectedColor ? `• Color: ${item.selectedColor}` : ''}
                      </div>
                    </div>
                    <div className="font-semibold">{formatPrice(item.price * item.quantity)}</div>
                  </div>
                ))}
              </div>
            </div>
            <div className="border-t border-gray-200 dark:border-gray-700 pt-3 flex justify-between font-bold text-gray-900 dark:text-white">
              <span>Total</span>
              <span>{formatPrice(selectedOrder.total)}</span>
            </div>
          </div>
        </Modal>
      ) : null}
    </div>
  )
}
