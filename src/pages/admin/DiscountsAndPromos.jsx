import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Copy, Plus, Pencil, Trash2 } from 'lucide-react'
import toast from 'react-hot-toast'
import Button from '../../components/common/Button'
import Card from '../../components/common/Card'
import Modal from '../../components/common/Modal'
import Spinner from '../../components/common/Spinner'
import DiscountForm from '../../components/admin/DiscountForm'
import PromoCodeForm from '../../components/admin/PromoCodeForm'
import { getDiscounts, createDiscount, updateDiscount, deleteDiscount } from '../../services/discounts'
import { getPromoCodes, createPromoCode, updatePromoCode, deletePromoCode } from '../../services/promoCodes'
import { formatPrice } from '../../lib/utils'

export default function DiscountsAndPromos() {
  const [activeTab, setActiveTab] = useState('discounts') // 'discounts' or 'promos'
  const [showDiscountModal, setShowDiscountModal] = useState(false)
  const [showPromoModal, setShowPromoModal] = useState(false)
  const [selectedDiscount, setSelectedDiscount] = useState(null)
  const [selectedPromo, setSelectedPromo] = useState(null)
  const [deleteConfirm, setDeleteConfirm] = useState(null)

  const queryClient = useQueryClient()

  // Fetch discounts
  const { data: discounts = [], isLoading: discountsLoading } = useQuery({
    queryKey: ['discounts'],
    queryFn: () => getDiscounts()
  })

  // Fetch promo codes
  const { data: promoCodes = [], isLoading: promosLoading } = useQuery({
    queryKey: ['promo-codes'],
    queryFn: () => getPromoCodes()
  })

  // Discount mutations
  const createDiscountMutation = useMutation({
    mutationFn: createDiscount,
    onSuccess: () => {
      queryClient.invalidateQueries(['discounts'])
      queryClient.invalidateQueries(['products']) // Refresh products to show new discounts
      toast.success('Discount created successfully')
      setShowDiscountModal(false)
      setSelectedDiscount(null)
    },
    onError: (error) => {
      toast.error(error.message || 'Failed to create discount')
    }
  })

  const updateDiscountMutation = useMutation({
    mutationFn: ({ id, data }) => updateDiscount(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries(['discounts'])
      queryClient.invalidateQueries(['products'])
      toast.success('Discount updated successfully')
      setShowDiscountModal(false)
      setSelectedDiscount(null)
    },
    onError: (error) => {
      toast.error(error.message || 'Failed to update discount')
    }
  })

  const deleteDiscountMutation = useMutation({
    mutationFn: deleteDiscount,
    onSuccess: () => {
      queryClient.invalidateQueries(['discounts'])
      queryClient.invalidateQueries(['products'])
      toast.success('Discount deleted successfully')
      setDeleteConfirm(null)
    },
    onError: (error) => {
      toast.error(error.message || 'Failed to delete discount')
    }
  })

  // Promo code mutations
  const createPromoMutation = useMutation({
    mutationFn: createPromoCode,
    onSuccess: () => {
      queryClient.invalidateQueries(['promo-codes'])
      toast.success('Promo code created successfully')
      setShowPromoModal(false)
      setSelectedPromo(null)
    },
    onError: (error) => {
      toast.error(error.message || 'Failed to create promo code')
    }
  })

  const updatePromoMutation = useMutation({
    mutationFn: ({ id, data }) => updatePromoCode(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries(['promo-codes'])
      toast.success('Promo code updated successfully')
      setShowPromoModal(false)
      setSelectedPromo(null)
    },
    onError: (error) => {
      toast.error(error.message || 'Failed to update promo code')
    }
  })

  const deletePromoMutation = useMutation({
    mutationFn: deletePromoCode,
    onSuccess: () => {
      queryClient.invalidateQueries(['promo-codes'])
      toast.success('Promo code deleted successfully')
      setDeleteConfirm(null)
    },
    onError: (error) => {
      toast.error(error.message || 'Failed to delete promo code')
    }
  })

  // Handlers
  const handleDiscountSubmit = (data) => {
    if (selectedDiscount) {
      updateDiscountMutation.mutate({ id: selectedDiscount.id, data })
    } else {
      createDiscountMutation.mutate(data)
    }
  }

  const handlePromoSubmit = (data) => {
    if (selectedPromo) {
      updatePromoMutation.mutate({ id: selectedPromo.id, data })
    } else {
      createPromoMutation.mutate(data)
    }
  }

  const handleDelete = () => {
    if (deleteConfirm.type === 'discount') {
      deleteDiscountMutation.mutate(deleteConfirm.id)
    } else {
      deletePromoMutation.mutate(deleteConfirm.id)
    }
  }

  const copyPromoCode = (code) => {
    navigator.clipboard.writeText(code)
    toast.success(`Copied "${code}" to clipboard`)
  }

  const getStatusBadge = (item, isPromo = false) => {
    const now = new Date()
    const startDate = new Date(item.start_date)
    const endDate = new Date(item.end_date)

    if (!item.is_active) {
      return <span className="px-2 py-1 text-xs font-medium rounded bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300">Inactive</span>
    }
    if (now < startDate) {
      return <span className="px-2 py-1 text-xs font-medium rounded bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300">Scheduled</span>
    }
    if (now > endDate) {
      return <span className="px-2 py-1 text-xs font-medium rounded bg-red-100 dark:bg-red-900 text-red-700 dark:text-red-300">Expired</span>
    }

    // Check usage limit for promo codes
    if (isPromo && item.usage_limit && item.times_used >= item.usage_limit) {
      return <span className="px-2 py-1 text-xs font-medium rounded bg-orange-100 dark:bg-orange-900 text-orange-700 dark:text-orange-300">Limit Reached</span>
    }

    return <span className="px-2 py-1 text-xs font-medium rounded bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300">Active</span>
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
          Discounts & Promo Codes
        </h1>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-6 border-b border-gray-200 dark:border-gray-700">
        <button
          onClick={() => setActiveTab('discounts')}
          className={`px-4 py-2 font-medium border-b-2 transition-colors ${
            activeTab === 'discounts'
              ? 'border-black dark:border-white text-gray-900 dark:text-white'
              : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
          }`}
        >
          Product Discounts
        </button>
        <button
          onClick={() => setActiveTab('promos')}
          className={`px-4 py-2 font-medium border-b-2 transition-colors ${
            activeTab === 'promos'
              ? 'border-black dark:border-white text-gray-900 dark:text-white'
              : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
          }`}
        >
          Promo Codes
        </button>
      </div>

      {/* Discounts Tab */}
      {activeTab === 'discounts' && (
        <Card>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">
              Product Discounts
            </h2>
            <Button
              onClick={() => {
                setSelectedDiscount(null)
                setShowDiscountModal(true)
              }}
            >
              <Plus className="w-4 h-4 mr-2" />
              Add Discount
            </Button>
          </div>

          {discountsLoading ? (
            <div className="flex justify-center py-12">
              <Spinner size="lg" />
            </div>
          ) : discounts.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-500 dark:text-gray-400 mb-4">
                No discounts yet. Create your first discount to get started.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 dark:bg-gray-800">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Name
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Type
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Value
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Application
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Date Range
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-800">
                  {discounts.map((discount) => (
                    <tr key={discount.id} className="hover:bg-gray-50 dark:hover:bg-gray-800">
                      <td className="px-4 py-3">
                        <div className="text-sm font-medium text-gray-900 dark:text-white">
                          {discount.name}
                        </div>
                        {discount.description && (
                          <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                            {discount.description}
                          </div>
                        )}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-900 dark:text-white">
                        {discount.discount_type === 'percentage' ? 'Percentage' : 'Fixed Amount'}
                      </td>
                      <td className="px-4 py-3 text-sm font-medium text-gray-900 dark:text-white">
                        {discount.discount_type === 'percentage'
                          ? `${discount.discount_value}%`
                          : formatPrice(discount.discount_value)}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-900 dark:text-white">
                        {discount.application_type === 'manual' ? (
                          <span>Manual ({discount.product_count || 0} products)</span>
                        ) : (
                          <span>Category ({discount.category_ids?.length || 0} categories)</span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-xs text-gray-500 dark:text-gray-400">
                        <div>{new Date(discount.start_date).toLocaleDateString()}</div>
                        <div>{new Date(discount.end_date).toLocaleDateString()}</div>
                      </td>
                      <td className="px-4 py-3">
                        {getStatusBadge(discount)}
                      </td>
                      <td className="px-4 py-3 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => {
                              setSelectedDiscount(discount)
                              setShowDiscountModal(true)
                            }}
                            className="text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300"
                          >
                            <Pencil className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => setDeleteConfirm({ id: discount.id, type: 'discount', name: discount.name })}
                            className="text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Card>
      )}

      {/* Promo Codes Tab */}
      {activeTab === 'promos' && (
        <Card>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">
              Promo Codes
            </h2>
            <Button
              onClick={() => {
                setSelectedPromo(null)
                setShowPromoModal(true)
              }}
            >
              <Plus className="w-4 h-4 mr-2" />
              Add Promo Code
            </Button>
          </div>

          {promosLoading ? (
            <div className="flex justify-center py-12">
              <Spinner size="lg" />
            </div>
          ) : promoCodes.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-500 dark:text-gray-400 mb-4">
                No promo codes yet. Create your first promo code to get started.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 dark:bg-gray-800">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Code
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Type
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Value
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Usage
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Date Range
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-800">
                  {promoCodes.map((promo) => (
                    <tr key={promo.id} className="hover:bg-gray-50 dark:hover:bg-gray-800">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-bold text-gray-900 dark:text-white font-mono">
                            {promo.code}
                          </span>
                          <button
                            onClick={() => copyPromoCode(promo.code)}
                            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                            title="Copy code"
                          >
                            <Copy className="w-3 h-3" />
                          </button>
                        </div>
                        {promo.description && (
                          <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                            {promo.description}
                          </div>
                        )}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-900 dark:text-white">
                        {promo.discount_type === 'percentage' && 'Percentage'}
                        {promo.discount_type === 'fixed_amount' && 'Fixed Amount'}
                        {promo.discount_type === 'free_shipping' && 'Free Shipping'}
                      </td>
                      <td className="px-4 py-3 text-sm font-medium text-gray-900 dark:text-white">
                        {promo.discount_type === 'percentage' && `${promo.discount_value}%`}
                        {promo.discount_type === 'fixed_amount' && formatPrice(promo.discount_value)}
                        {promo.discount_type === 'free_shipping' && '-'}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-900 dark:text-white">
                        {promo.times_used || 0}
                        {promo.usage_limit ? ` / ${promo.usage_limit}` : ' / ∞'}
                      </td>
                      <td className="px-4 py-3 text-xs text-gray-500 dark:text-gray-400">
                        <div>{new Date(promo.start_date).toLocaleDateString()}</div>
                        <div>{new Date(promo.end_date).toLocaleDateString()}</div>
                      </td>
                      <td className="px-4 py-3">
                        {getStatusBadge(promo, true)}
                      </td>
                      <td className="px-4 py-3 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => {
                              setSelectedPromo(promo)
                              setShowPromoModal(true)
                            }}
                            className="text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300"
                          >
                            <Pencil className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => setDeleteConfirm({ id: promo.id, type: 'promo', name: promo.code })}
                            className="text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Card>
      )}

      {/* Discount Modal */}
      <Modal
        isOpen={showDiscountModal}
        onClose={() => {
          setShowDiscountModal(false)
          setSelectedDiscount(null)
        }}
        title={selectedDiscount ? 'Edit Discount' : 'Create Discount'}
        size="xl"
      >
        <DiscountForm
          discount={selectedDiscount}
          onSubmit={handleDiscountSubmit}
          onCancel={() => {
            setShowDiscountModal(false)
            setSelectedDiscount(null)
          }}
          isLoading={createDiscountMutation.isPending || updateDiscountMutation.isPending}
        />
      </Modal>

      {/* Promo Code Modal */}
      <Modal
        isOpen={showPromoModal}
        onClose={() => {
          setShowPromoModal(false)
          setSelectedPromo(null)
        }}
        title={selectedPromo ? 'Edit Promo Code' : 'Create Promo Code'}
        size="lg"
      >
        <PromoCodeForm
          promoCode={selectedPromo}
          onSubmit={handlePromoSubmit}
          onCancel={() => {
            setShowPromoModal(false)
            setSelectedPromo(null)
          }}
          isLoading={createPromoMutation.isPending || updatePromoMutation.isPending}
        />
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={!!deleteConfirm}
        onClose={() => setDeleteConfirm(null)}
        title="Confirm Delete"
        size="sm"
      >
        <div className="space-y-4">
          <p className="text-gray-700 dark:text-gray-300">
            Are you sure you want to delete{' '}
            <span className="font-semibold">{deleteConfirm?.name}</span>? This action cannot be
            undone.
          </p>
          <div className="flex justify-end gap-3">
            <Button variant="secondary" onClick={() => setDeleteConfirm(null)}>
              Cancel
            </Button>
            <Button
              variant="danger"
              onClick={handleDelete}
              disabled={deleteDiscountMutation.isPending || deletePromoMutation.isPending}
            >
              {deleteDiscountMutation.isPending || deletePromoMutation.isPending
                ? 'Deleting...'
                : 'Delete'}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  )
}
