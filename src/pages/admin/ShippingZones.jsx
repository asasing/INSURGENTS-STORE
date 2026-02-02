import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Plus, Pencil, Trash2 } from 'lucide-react'
import toast from 'react-hot-toast'
import Button from '../../components/common/Button'
import Card from '../../components/common/Card'
import Modal from '../../components/common/Modal'
import Spinner from '../../components/common/Spinner'
import Input from '../../components/common/Input'
import { getAllShippingZones, createShippingZone, updateShippingZone, deleteShippingZone } from '../../services/shipping'
import { formatPrice } from '../../lib/utils'

// Zod schema for shipping zone validation
const shippingZoneSchema = z.object({
  name: z.string().min(3, 'Name must be at least 3 characters'),
  cities: z.string().min(1, 'Please enter at least one city'),
  shipping_fee: z.number().min(0, 'Shipping fee must be 0 or greater'),
  display_order: z.number().min(0).default(0),
  is_active: z.boolean().default(true)
})

export default function ShippingZones() {
  const [showModal, setShowModal] = useState(false)
  const [selectedZone, setSelectedZone] = useState(null)
  const [deleteConfirm, setDeleteConfirm] = useState(null)

  const queryClient = useQueryClient()

  // Fetch shipping zones (including inactive)
  const { data: zones = [], isLoading } = useQuery({
    queryKey: ['shipping-zones-admin'],
    queryFn: getAllShippingZones
  })

  // Setup form
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors }
  } = useForm({
    resolver: zodResolver(shippingZoneSchema),
    defaultValues: {
      name: '',
      cities: '',
      shipping_fee: 0,
      display_order: 0,
      is_active: true
    }
  })

  // Mutations
  const createMutation = useMutation({
    mutationFn: createShippingZone,
    onSuccess: () => {
      queryClient.invalidateQueries(['shipping-zones-admin'])
      queryClient.invalidateQueries(['shipping-zones'])
      toast.success('Shipping zone created successfully')
      setShowModal(false)
      reset()
    },
    onError: (error) => {
      toast.error(error.message || 'Failed to create shipping zone')
    }
  })

  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => updateShippingZone(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries(['shipping-zones-admin'])
      queryClient.invalidateQueries(['shipping-zones'])
      toast.success('Shipping zone updated successfully')
      setShowModal(false)
      setSelectedZone(null)
      reset()
    },
    onError: (error) => {
      toast.error(error.message || 'Failed to update shipping zone')
    }
  })

  const deleteMutation = useMutation({
    mutationFn: deleteShippingZone,
    onSuccess: () => {
      queryClient.invalidateQueries(['shipping-zones-admin'])
      queryClient.invalidateQueries(['shipping-zones'])
      toast.success('Shipping zone deleted successfully')
      setDeleteConfirm(null)
    },
    onError: (error) => {
      toast.error(error.message || 'Failed to delete shipping zone')
    }
  })

  // Handlers
  const handleOpenModal = (zone = null) => {
    if (zone) {
      setSelectedZone(zone)
      reset({
        name: zone.name,
        cities: zone.cities.join(', '),
        shipping_fee: zone.shipping_fee,
        display_order: zone.display_order,
        is_active: zone.is_active
      })
    } else {
      setSelectedZone(null)
      reset({
        name: '',
        cities: '',
        shipping_fee: 0,
        display_order: zones.length,
        is_active: true
      })
    }
    setShowModal(true)
  }

  const onSubmit = (data) => {
    // Convert cities string to array (split by comma and trim)
    const citiesArray = data.cities
      .split(',')
      .map(city => city.trim())
      .filter(city => city.length > 0)

    const zoneData = {
      name: data.name,
      cities: citiesArray,
      shipping_fee: parseFloat(data.shipping_fee),
      display_order: parseInt(data.display_order),
      is_active: data.is_active
    }

    if (selectedZone) {
      updateMutation.mutate({ id: selectedZone.id, data: zoneData })
    } else {
      createMutation.mutate(zoneData)
    }
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Shipping Zones
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Manage location-based shipping fees
          </p>
        </div>
        <Button onClick={() => handleOpenModal()}>
          <Plus className="w-4 h-4 mr-2" />
          Add Shipping Zone
        </Button>
      </div>

      <Card>
        {isLoading ? (
          <div className="flex justify-center py-12">
            <Spinner size="lg" />
          </div>
        ) : zones.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500 dark:text-gray-400 mb-4">
              No shipping zones yet. Create your first shipping zone to get started.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 dark:bg-gray-800">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Order
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Zone Name
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Cities
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Shipping Fee
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
                {zones.map((zone) => (
                  <tr key={zone.id} className="hover:bg-gray-50 dark:hover:bg-gray-800">
                    <td className="px-4 py-3 text-sm text-gray-900 dark:text-white">
                      {zone.display_order}
                    </td>
                    <td className="px-4 py-3">
                      <div className="text-sm font-medium text-gray-900 dark:text-white">
                        {zone.name}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="text-sm text-gray-900 dark:text-white">
                        {zone.cities.join(', ')}
                      </div>
                    </td>
                    <td className="px-4 py-3 text-sm font-medium text-gray-900 dark:text-white">
                      {zone.shipping_fee === 0 ? (
                        <span className="text-green-600 dark:text-green-400">FREE</span>
                      ) : (
                        formatPrice(zone.shipping_fee)
                      )}
                    </td>
                    <td className="px-4 py-3">
                      {zone.is_active ? (
                        <span className="px-2 py-1 text-xs font-medium rounded bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300">
                          Active
                        </span>
                      ) : (
                        <span className="px-2 py-1 text-xs font-medium rounded bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300">
                          Inactive
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => handleOpenModal(zone)}
                          className="text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300"
                        >
                          <Pencil className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => setDeleteConfirm(zone)}
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

      {/* Create/Edit Modal */}
      <Modal
        isOpen={showModal}
        onClose={() => {
          setShowModal(false)
          setSelectedZone(null)
          reset()
        }}
        title={selectedZone ? 'Edit Shipping Zone' : 'Create Shipping Zone'}
        size="lg"
      >
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <Input
            label="Zone Name *"
            {...register('name')}
            error={errors.name?.message}
            placeholder="e.g., Free Shipping Zone"
          />

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Cities *
            </label>
            <textarea
              {...register('cities')}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-black dark:focus:ring-white bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
              placeholder="Enter cities separated by commas (e.g., Cebu City, Mandaue City, Lapu-lapu City)"
            />
            {errors.cities && (
              <p className="mt-1 text-sm text-red-600">{errors.cities.message}</p>
            )}
            <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
              Enter city names separated by commas. The system will use fuzzy matching to handle spelling variations.
            </p>
          </div>

          <Input
            label="Shipping Fee (₱) *"
            type="number"
            step="0.01"
            {...register('shipping_fee', { valueAsNumber: true })}
            error={errors.shipping_fee?.message}
            placeholder="0.00"
          />

          <Input
            label="Display Order"
            type="number"
            {...register('display_order', { valueAsNumber: true })}
            error={errors.display_order?.message}
            placeholder="0"
          />

          <div>
            <label className="flex items-center">
              <input
                type="checkbox"
                {...register('is_active')}
                className="mr-2"
              />
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Active (zone will be used for shipping calculations)
              </span>
            </label>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
            <Button
              type="button"
              variant="secondary"
              onClick={() => {
                setShowModal(false)
                setSelectedZone(null)
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
                : selectedZone
                ? 'Update Zone'
                : 'Create Zone'}
            </Button>
          </div>
        </form>
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
            Are you sure you want to delete the shipping zone{' '}
            <span className="font-semibold">{deleteConfirm?.name}</span>? This action cannot be
            undone.
          </p>
          <div className="flex justify-end gap-3">
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
