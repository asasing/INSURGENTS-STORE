import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Plus, Edit, Trash2, Clock } from 'lucide-react'
import { getSalePromotions, createSalePromotion, updateSalePromotion, deleteSalePromotion } from '../../services/promotions'
import Button from '../../components/common/Button'
import Card from '../../components/common/Card'
import Modal from '../../components/common/Modal'
import Input from '../../components/common/Input'
import Spinner from '../../components/common/Spinner'
import { useForm } from 'react-hook-form'
import toast from 'react-hot-toast'

export default function SaleManager() {
  const [showModal, setShowModal] = useState(false)
  const [selectedSale, setSelectedSale] = useState(null)
  const [deleteConfirm, setDeleteConfirm] = useState(null)

  const queryClient = useQueryClient()

  const { data: promotions, isLoading } = useQuery({
    queryKey: ['salePromotions'],
    queryFn: getSalePromotions
  })

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors }
  } = useForm()

  const createMutation = useMutation({
    mutationFn: createSalePromotion,
    onSuccess: () => {
      queryClient.invalidateQueries(['salePromotions'])
      queryClient.invalidateQueries(['activeSalePromotion'])
      toast.success('Sale promotion created!')
      setShowModal(false)
      reset()
    },
    onError: () => {
      toast.error('Failed to create promotion')
    }
  })

  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => updateSalePromotion(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries(['salePromotions'])
      queryClient.invalidateQueries(['activeSalePromotion'])
      toast.success('Sale promotion updated!')
      setShowModal(false)
      setSelectedSale(null)
      reset()
    },
    onError: () => {
      toast.error('Failed to update promotion')
    }
  })

  const deleteMutation = useMutation({
    mutationFn: deleteSalePromotion,
    onSuccess: () => {
      queryClient.invalidateQueries(['salePromotions'])
      queryClient.invalidateQueries(['activeSalePromotion'])
      toast.success('Sale promotion deleted!')
      setDeleteConfirm(null)
    },
    onError: () => {
      toast.error('Failed to delete promotion')
    }
  })

  const handleAdd = () => {
    setSelectedSale(null)
    reset({
      name: '',
      message: 'Limited Time Sale!',
      end_date: '',
      is_active: true
    })
    setShowModal(true)
  }

  const handleEdit = (sale) => {
    setSelectedSale(sale)
    reset({
      name: sale.name,
      message: sale.message,
      end_date: new Date(sale.end_date).toISOString().slice(0, 16),
      is_active: sale.is_active
    })
    setShowModal(true)
  }

  const onSubmit = (data) => {
    const formattedData = {
      name: data.name,
      message: data.message,
      end_date: new Date(data.end_date).toISOString(),
      is_active: data.is_active
    }

    if (selectedSale) {
      updateMutation.mutate({ id: selectedSale.id, data: formattedData })
    } else {
      createMutation.mutate(formattedData)
    }
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
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Sale Promotions
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Manage sale timers and promotions
          </p>
        </div>
        <Button onClick={handleAdd} className="flex items-center gap-2">
          <Plus className="w-5 h-5" />
          New Sale
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {promotions?.map((sale) => {
          const endDate = new Date(sale.end_date)
          const isExpired = endDate < new Date()
          const isActive = sale.is_active && !isExpired

          return (
            <Card key={sale.id}>
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-2">
                  <Clock className="w-5 h-5 text-orange-600 dark:text-orange-400" />
                  <h3 className="font-bold text-gray-900 dark:text-white">
                    {sale.name}
                  </h3>
                </div>
                <span
                  className={`px-2 py-1 rounded text-xs font-medium ${
                    isActive
                      ? 'bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200'
                      : isExpired
                      ? 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200'
                      : 'bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200'
                  }`}
                >
                  {isActive ? 'Active' : isExpired ? 'Expired' : 'Inactive'}
                </span>
              </div>

              <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                {sale.message}
              </p>

              <div className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                <div>Ends: {endDate.toLocaleString()}</div>
                <div className="text-xs mt-1">
                  Created: {new Date(sale.created_at).toLocaleDateString()}
                </div>
              </div>

              <div className="flex gap-2">
                <button
                  onClick={() => handleEdit(sale)}
                  className="flex-1 p-2 text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded flex items-center justify-center gap-2"
                >
                  <Edit className="w-4 h-4" />
                  Edit
                </button>
                <button
                  onClick={() => setDeleteConfirm(sale)}
                  className="flex-1 p-2 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded flex items-center justify-center gap-2"
                >
                  <Trash2 className="w-4 h-4" />
                  Delete
                </button>
              </div>
            </Card>
          )
        })}

        {promotions?.length === 0 && (
          <div className="col-span-full text-center py-12 text-gray-500 dark:text-gray-400">
            No sale promotions yet. Click "New Sale" to create one.
          </div>
        )}
      </div>

      {/* Add/Edit Modal */}
      <Modal
        isOpen={showModal}
        onClose={() => {
          setShowModal(false)
          setSelectedSale(null)
          reset()
        }}
        title={selectedSale ? 'Edit Sale Promotion' : 'New Sale Promotion'}
        size="md"
      >
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <Input
            label="Sale Name *"
            {...register('name', { required: 'Name is required' })}
            error={errors.name?.message}
            placeholder="Summer Sale 2026"
          />

          <Input
            label="Message *"
            {...register('message', { required: 'Message is required' })}
            error={errors.message?.message}
            placeholder="Limited Time Sale - Up to 50% Off!"
          />

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              End Date & Time *
            </label>
            <input
              type="datetime-local"
              {...register('end_date', { required: 'End date is required' })}
              className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            {errors.end_date && (
              <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                {errors.end_date.message}
              </p>
            )}
          </div>

          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              {...register('is_active')}
              className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
            />
            <span className="text-sm text-gray-700 dark:text-gray-300">
              Active (show on website)
            </span>
          </label>

          <div className="flex gap-3 justify-end border-t border-gray-200 dark:border-gray-700 pt-4">
            <Button
              type="button"
              variant="secondary"
              onClick={() => {
                setShowModal(false)
                setSelectedSale(null)
                reset()
              }}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={createMutation.isPending || updateMutation.isPending}
            >
              {createMutation.isPending || updateMutation.isPending
                ? 'Saving...'
                : selectedSale
                ? 'Update'
                : 'Create'}
            </Button>
          </div>
        </form>
      </Modal>

      {/* Delete Confirmation */}
      <Modal
        isOpen={!!deleteConfirm}
        onClose={() => setDeleteConfirm(null)}
        title="Delete Sale Promotion"
        size="sm"
      >
        <div className="space-y-4">
          <p className="text-gray-600 dark:text-gray-400">
            Are you sure you want to delete <strong>{deleteConfirm?.name}</strong>?
            This action cannot be undone.
          </p>
          <div className="flex gap-3 justify-end">
            <Button variant="secondary" onClick={() => setDeleteConfirm(null)}>
              Cancel
            </Button>
            <Button
              variant="danger"
              onClick={() => deleteMutation.mutate(deleteConfirm.id)}
              disabled={deleteMutation.isPending}
            >
              {deleteMutation.isPending ? 'Deleting...' : 'Delete'}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  )
}
