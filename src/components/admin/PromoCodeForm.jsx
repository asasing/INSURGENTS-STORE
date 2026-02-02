import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import Button from '../common/Button'
import Input from '../common/Input'

// Zod schema for promo code validation
const promoCodeSchema = z.object({
  code: z.string()
    .min(3, 'Code must be at least 3 characters')
    .max(20, 'Code must be at most 20 characters')
    .regex(/^[A-Z0-9]+$/, 'Code must contain only uppercase letters and numbers'),
  description: z.string().optional(),
  discount_type: z.enum(['percentage', 'fixed_amount', 'free_shipping'], {
    required_error: 'Please select a discount type'
  }),
  discount_value: z.number().nullable().optional(),
  min_order_amount: z.number().min(0, 'Minimum order amount must be 0 or greater').default(0),
  start_date: z.string().min(1, 'Start date is required'),
  end_date: z.string().min(1, 'End date is required'),
  usage_limit: z.number().nullable().optional(),
  is_active: z.boolean().default(true)
}).refine(data => {
  // Validate that discount_value is provided unless type is free_shipping
  if (data.discount_type !== 'free_shipping') {
    return data.discount_value !== null && data.discount_value !== undefined && data.discount_value > 0
  }
  return true
}, {
  message: 'Discount value is required for percentage and fixed amount discounts',
  path: ['discount_value']
})

export default function PromoCodeForm({ promoCode, onSubmit, onCancel, isLoading }) {
  // Setup form with default values
  const {
    register,
    handleSubmit,
    watch,
    formState: { errors }
  } = useForm({
    resolver: zodResolver(promoCodeSchema),
    defaultValues: {
      code: promoCode?.code || '',
      description: promoCode?.description || '',
      discount_type: promoCode?.discount_type || 'percentage',
      discount_value: promoCode?.discount_value || null,
      min_order_amount: promoCode?.min_order_amount || 0,
      start_date: promoCode?.start_date
        ? new Date(promoCode.start_date).toISOString().slice(0, 16)
        : new Date().toISOString().slice(0, 16),
      end_date: promoCode?.end_date
        ? new Date(promoCode.end_date).toISOString().slice(0, 16)
        : new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().slice(0, 16),
      usage_limit: promoCode?.usage_limit || null,
      is_active: promoCode?.is_active !== undefined ? promoCode.is_active : true
    }
  })

  const discountType = watch('discount_type')

  const handleFormSubmit = (data) => {
    // Convert dates to ISO strings and format data
    const formattedData = {
      ...data,
      code: data.code.toUpperCase(),
      start_date: new Date(data.start_date).toISOString(),
      end_date: new Date(data.end_date).toISOString(),
      discount_value: data.discount_type === 'free_shipping' ? null : parseFloat(data.discount_value),
      min_order_amount: parseFloat(data.min_order_amount),
      usage_limit: data.usage_limit ? parseInt(data.usage_limit) : null
    }

    onSubmit(formattedData)
  }

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-6">
      {/* Basic Information */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
          Basic Information
        </h3>

        <Input
          label="Promo Code *"
          {...register('code')}
          error={errors.code?.message}
          placeholder="SUMMER2024"
          className="uppercase"
          disabled={!!promoCode} // Don't allow editing code once created
          maxLength={20}
        />

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Description
          </label>
          <textarea
            {...register('description')}
            rows={3}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-black dark:focus:ring-white bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
            placeholder="Optional description of this promo code"
          />
        </div>
      </div>

      {/* Discount Type & Value */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
          Discount Details
        </h3>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Discount Type *
          </label>
          <div className="space-y-2">
            <label className="flex items-center">
              <input
                type="radio"
                value="percentage"
                {...register('discount_type')}
                className="mr-2"
              />
              <span className="text-gray-900 dark:text-white">Percentage Discount (%)</span>
            </label>
            <label className="flex items-center">
              <input
                type="radio"
                value="fixed_amount"
                {...register('discount_type')}
                className="mr-2"
              />
              <span className="text-gray-900 dark:text-white">Fixed Amount Discount (₱)</span>
            </label>
            <label className="flex items-center">
              <input
                type="radio"
                value="free_shipping"
                {...register('discount_type')}
                className="mr-2"
              />
              <span className="text-gray-900 dark:text-white">Free Shipping</span>
            </label>
          </div>
          {errors.discount_type && (
            <p className="mt-1 text-sm text-red-600">{errors.discount_type.message}</p>
          )}
        </div>

        {discountType !== 'free_shipping' && (
          <Input
            label={`Discount Value * ${discountType === 'percentage' ? '(%)' : '(₱)'}`}
            type="number"
            step={discountType === 'percentage' ? '1' : '0.01'}
            {...register('discount_value', { valueAsNumber: true })}
            error={errors.discount_value?.message}
            placeholder={discountType === 'percentage' ? '20' : '50.00'}
          />
        )}

        {discountType === 'free_shipping' && (
          <div className="p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
            <p className="text-sm text-green-800 dark:text-green-200">
              This promo code will provide free shipping at checkout
            </p>
          </div>
        )}

        <Input
          label="Minimum Order Amount (₱)"
          type="number"
          step="0.01"
          {...register('min_order_amount', { valueAsNumber: true })}
          error={errors.min_order_amount?.message}
          placeholder="0"
        />
      </div>

      {/* Usage Limits */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
          Usage Limits
        </h3>

        <div>
          <Input
            label="Maximum Uses"
            type="number"
            {...register('usage_limit', { valueAsNumber: true })}
            error={errors.usage_limit?.message}
            placeholder="Leave empty for unlimited"
          />
          <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
            Leave blank for unlimited uses
          </p>
        </div>

        {promoCode && (
          <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
            <p className="text-sm text-gray-700 dark:text-gray-300">
              <span className="font-medium">Times Used:</span> {promoCode.times_used || 0}
              {promoCode.usage_limit && ` / ${promoCode.usage_limit}`}
            </p>
          </div>
        )}
      </div>

      {/* Date Range */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
          Schedule
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input
            label="Start Date *"
            type="datetime-local"
            {...register('start_date')}
            error={errors.start_date?.message}
          />

          <Input
            label="End Date *"
            type="datetime-local"
            {...register('end_date')}
            error={errors.end_date?.message}
          />
        </div>
      </div>

      {/* Active Toggle */}
      <div>
        <label className="flex items-center">
          <input
            type="checkbox"
            {...register('is_active')}
            className="mr-2"
          />
          <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
            Active (promo code can be used immediately if within date range)
          </span>
        </label>
      </div>

      {/* Form Actions */}
      <div className="flex justify-end gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
        <Button
          type="button"
          variant="secondary"
          onClick={onCancel}
          disabled={isLoading}
        >
          Cancel
        </Button>
        <Button type="submit" disabled={isLoading}>
          {isLoading ? 'Saving...' : promoCode ? 'Update Promo Code' : 'Create Promo Code'}
        </Button>
      </div>
    </form>
  )
}
