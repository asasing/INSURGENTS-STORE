import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useQuery } from '@tanstack/react-query'
import Button from '../common/Button'
import Input from '../common/Input'
import { getProducts } from '../../services/products'
import { getCategories } from '../../services/categories'

// Zod schema for discount validation
const discountSchema = z.object({
  name: z.string().min(3, 'Name must be at least 3 characters'),
  description: z.string().optional(),
  discount_type: z.enum(['percentage', 'fixed_amount'], {
    required_error: 'Please select a discount type'
  }),
  discount_value: z.number().positive('Discount value must be greater than 0'),
  application_type: z.enum(['manual', 'category'], {
    required_error: 'Please select an application type'
  }),
  product_ids: z.array(z.string().uuid()).optional(),
  category_ids: z.array(z.string().uuid()).optional(),
  start_date: z.string().min(1, 'Start date is required'),
  end_date: z.string().min(1, 'End date is required'),
  priority: z.number().default(0),
  is_active: z.boolean().default(true)
}).refine(data => {
  // Validate that at least one product or category is selected based on application type
  if (data.application_type === 'manual') {
    return data.product_ids && data.product_ids.length > 0
  }
  if (data.application_type === 'category') {
    return data.category_ids && data.category_ids.length > 0
  }
  return true
}, {
  message: 'Please select at least one product or category',
  path: ['product_ids'] // Show error on product_ids field
})

export default function DiscountForm({ discount, onSubmit, onCancel, isLoading }) {
  const [selectedProducts, setSelectedProducts] = useState(new Set())
  const [selectedCategories, setSelectedCategories] = useState(new Set())
  const [searchQuery, setSearchQuery] = useState('')

  // Fetch products for product selection
  const { data: products = [] } = useQuery({
    queryKey: ['products', 'all'],
    queryFn: () => getProducts({ limit: 1000 })
  })

  // Fetch categories for category selection
  const { data: categories = [] } = useQuery({
    queryKey: ['categories'],
    queryFn: getCategories
  })

  // Setup form with default values
  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors }
  } = useForm({
    resolver: zodResolver(discountSchema),
    defaultValues: {
      name: discount?.name || '',
      description: discount?.description || '',
      discount_type: discount?.discount_type || 'percentage',
      discount_value: discount?.discount_value || 0,
      application_type: discount?.application_type || 'manual',
      product_ids: discount?.product_ids || [],
      category_ids: discount?.category_ids || [],
      start_date: discount?.start_date
        ? new Date(discount.start_date).toISOString().slice(0, 16)
        : new Date().toISOString().slice(0, 16),
      end_date: discount?.end_date
        ? new Date(discount.end_date).toISOString().slice(0, 16)
        : new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().slice(0, 16),
      priority: discount?.priority || 0,
      is_active: discount?.is_active !== undefined ? discount.is_active : true
    }
  })

  const applicationType = watch('application_type')
  const discountType = watch('discount_type')

  // Initialize selected items from discount
  useEffect(() => {
    if (discount?.product_ids) {
      setSelectedProducts(new Set(discount.product_ids))
    }
    if (discount?.category_ids) {
      setSelectedCategories(new Set(discount.category_ids))
    }
  }, [discount])

  // Handle product selection toggle
  const toggleProduct = (productId) => {
    const newSelected = new Set(selectedProducts)
    if (newSelected.has(productId)) {
      newSelected.delete(productId)
    } else {
      newSelected.add(productId)
    }
    setSelectedProducts(newSelected)
    setValue('product_ids', Array.from(newSelected))
  }

  // Handle category selection toggle
  const toggleCategory = (categoryId) => {
    const newSelected = new Set(selectedCategories)
    if (newSelected.has(categoryId)) {
      newSelected.delete(categoryId)
    } else {
      newSelected.add(categoryId)
    }
    setSelectedCategories(newSelected)
    setValue('category_ids', Array.from(newSelected))
  }

  // Filter products by search query
  const filteredProducts = products.filter(product =>
    product.name.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const handleFormSubmit = (data) => {
    // Convert dates to ISO strings
    const formattedData = {
      ...data,
      start_date: new Date(data.start_date).toISOString(),
      end_date: new Date(data.end_date).toISOString(),
      discount_value: parseFloat(data.discount_value),
      priority: parseInt(data.priority)
    }

    // Remove unnecessary fields based on application type
    if (formattedData.application_type === 'manual') {
      delete formattedData.category_ids
    } else {
      delete formattedData.product_ids
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
          label="Discount Name *"
          {...register('name')}
          error={errors.name?.message}
          placeholder="e.g., Summer Sale 2024"
        />

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Description
          </label>
          <textarea
            {...register('description')}
            rows={3}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-black dark:focus:ring-white bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
            placeholder="Optional description of this discount"
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
          <div className="flex gap-4">
            <label className="flex items-center">
              <input
                type="radio"
                value="percentage"
                {...register('discount_type')}
                className="mr-2"
              />
              <span className="text-gray-900 dark:text-white">Percentage (%)</span>
            </label>
            <label className="flex items-center">
              <input
                type="radio"
                value="fixed_amount"
                {...register('discount_type')}
                className="mr-2"
              />
              <span className="text-gray-900 dark:text-white">Fixed Amount (₱)</span>
            </label>
          </div>
          {errors.discount_type && (
            <p className="mt-1 text-sm text-red-600">{errors.discount_type.message}</p>
          )}
        </div>

        <Input
          label={`Discount Value * ${discountType === 'percentage' ? '(%)' : '(₱)'}`}
          type="number"
          step={discountType === 'percentage' ? '1' : '0.01'}
          {...register('discount_value', { valueAsNumber: true })}
          error={errors.discount_value?.message}
          placeholder={discountType === 'percentage' ? '10' : '100.00'}
        />

        <Input
          label="Priority (higher = more important)"
          type="number"
          {...register('priority', { valueAsNumber: true })}
          error={errors.priority?.message}
          placeholder="0"
        />
      </div>

      {/* Application Type */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
          Apply Discount To
        </h3>

        <div>
          <div className="flex gap-4 mb-4">
            <label className="flex items-center">
              <input
                type="radio"
                value="manual"
                {...register('application_type')}
                className="mr-2"
              />
              <span className="text-gray-900 dark:text-white">Specific Products</span>
            </label>
            <label className="flex items-center">
              <input
                type="radio"
                value="category"
                {...register('application_type')}
                className="mr-2"
              />
              <span className="text-gray-900 dark:text-white">Product Categories</span>
            </label>
          </div>

          {/* Manual Product Selection */}
          {applicationType === 'manual' && (
            <div className="border border-gray-300 dark:border-gray-600 rounded-lg p-4">
              <Input
                label="Search Products"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search by product name..."
                className="mb-4"
              />

              <div className="max-h-64 overflow-y-auto space-y-2">
                {filteredProducts.length === 0 ? (
                  <p className="text-gray-500 dark:text-gray-400 text-sm">
                    No products found
                  </p>
                ) : (
                  filteredProducts.map(product => (
                    <label
                      key={product.id}
                      className="flex items-center p-2 hover:bg-gray-50 dark:hover:bg-gray-700 rounded cursor-pointer"
                    >
                      <input
                        type="checkbox"
                        checked={selectedProducts.has(product.id)}
                        onChange={() => toggleProduct(product.id)}
                        className="mr-3"
                      />
                      <div className="flex-1">
                        <div className="text-sm font-medium text-gray-900 dark:text-white">
                          {product.name}
                        </div>
                        <div className="text-xs text-gray-500 dark:text-gray-400">
                          ₱{product.price.toFixed(2)}
                          {product.sale_price && ` (Sale: ₱${product.sale_price.toFixed(2)})`}
                        </div>
                      </div>
                    </label>
                  ))
                )}
              </div>

              <div className="mt-2 text-sm text-gray-600 dark:text-gray-400">
                {selectedProducts.size} product(s) selected
              </div>
            </div>
          )}

          {/* Category Selection */}
          {applicationType === 'category' && (
            <div className="border border-gray-300 dark:border-gray-600 rounded-lg p-4">
              <div className="space-y-2">
                {categories.length === 0 ? (
                  <p className="text-gray-500 dark:text-gray-400 text-sm">
                    No categories found
                  </p>
                ) : (
                  categories.map(category => (
                    <label
                      key={category.id}
                      className="flex items-center p-2 hover:bg-gray-50 dark:hover:bg-gray-700 rounded cursor-pointer"
                    >
                      <input
                        type="checkbox"
                        checked={selectedCategories.has(category.id)}
                        onChange={() => toggleCategory(category.id)}
                        className="mr-3"
                      />
                      <div className="flex-1">
                        <div className="text-sm font-medium text-gray-900 dark:text-white">
                          {category.name}
                        </div>
                        <div className="text-xs text-gray-500 dark:text-gray-400">
                          {category.slug}
                        </div>
                      </div>
                    </label>
                  ))
                )}
              </div>

              <div className="mt-2 text-sm text-gray-600 dark:text-gray-400">
                {selectedCategories.size} category(ies) selected
              </div>
            </div>
          )}

          {errors.product_ids && (
            <p className="mt-1 text-sm text-red-600">{errors.product_ids.message}</p>
          )}
        </div>
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
            Active (discount will be applied immediately if within date range)
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
          {isLoading ? 'Saving...' : discount ? 'Update Discount' : 'Create Discount'}
        </Button>
      </div>
    </form>
  )
}
