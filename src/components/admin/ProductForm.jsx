import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import Input from '../common/Input'
import Button from '../common/Button'
import ImageUploader from './ImageUploader'
import SizePicker from './SizePicker'
import { useCategories } from '../../hooks/useCategories'

const productSchema = z.object({
  name: z.string().min(3, 'Name must be at least 3 characters'),
  description: z.string().optional(),
  price: z.number().min(0, 'Price must be positive'),
  sale_price: z.number().min(0).optional().nullable(),
  stock_quantity: z.number().min(0, 'Stock must be positive').default(0),
  category_ids: z.array(z.string().uuid()).min(1, 'Please select at least one category'),
  sizes: z.array(z.string()).optional(),
  colors: z.string().optional(),
  is_featured: z.boolean().default(false),
  is_active: z.boolean().default(true)
})

export default function ProductForm({ product, onSubmit, onCancel, loading }) {
  const { data: categories } = useCategories()
  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch
  } = useForm({
    resolver: zodResolver(productSchema),
    defaultValues: product || {
      name: '',
      description: '',
      price: 0,
      sale_price: null,
      stock_quantity: 0,
      category_ids: [],
      sizes: [],
      colors: '',
      is_featured: false,
      is_active: true,
      images: []
    }
  })

  const images = watch('images') || []
  const selectedCategories = watch('category_ids') || []
  const selectedSizes = watch('sizes') || []

  useEffect(() => {
    if (product) {
      Object.keys(product).forEach(key => {
        if (key === 'sizes') {
          // Convert to array format (handle both array and comma-separated string)
          if (Array.isArray(product[key])) {
            setValue('sizes', product[key].map(s => s.toString()))
          } else if (typeof product[key] === 'string') {
            setValue('sizes', product[key].split(',').map(s => s.trim()).filter(Boolean))
          } else {
            setValue('sizes', [])
          }
        } else if (key === 'colors') {
          // Keep colors as comma-separated string
          setValue('colors', Array.isArray(product[key]) ? product[key].join(', ') : (product[key] || ''))
        } else if (key === 'category_id' && product.category_id) {
          // Migrate old single category to array format
          setValue('category_ids', [product.category_id])
        } else if (key === 'category_ids') {
          // Use existing category_ids array
          setValue('category_ids', Array.isArray(product.category_ids) ? product.category_ids : [])
        } else {
          setValue(key, product[key])
        }
      })
    }
  }, [product, setValue])

  const handleFormSubmit = (data) => {
    // Format data for submission
    const formattedData = {
      ...data,
      sizes: data.sizes || [], // Already in array format
      colors: data.colors ? data.colors.split(',').map(c => c.trim()).filter(Boolean) : [],
      images: images,
      price: parseFloat(data.price),
      sale_price: data.sale_price ? parseFloat(data.sale_price) : null,
      stock_quantity: parseInt(data.stock_quantity)
    }

    onSubmit(formattedData)
  }

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-6">
      {/* Basic Info */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Input
          label="Product Name *"
          {...register('name')}
          error={errors.name?.message}
          placeholder="Nike Air Max 2024"
        />

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Categories * (Select multiple)
          </label>
          <div className="grid grid-cols-2 gap-2 p-4 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800">
            {categories?.map(cat => {
              const isSelected = selectedCategories.includes(cat.id)
              return (
                <label
                  key={cat.id}
                  className={`flex items-center gap-2 px-3 py-2 rounded-lg cursor-pointer transition-colors ${
                    isSelected
                      ? 'bg-black text-white dark:bg-white dark:text-black'
                      : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={isSelected}
                    onChange={(e) => {
                      const newCategories = e.target.checked
                        ? [...selectedCategories, cat.id]
                        : selectedCategories.filter(id => id !== cat.id)
                      setValue('category_ids', newCategories, { shouldValidate: true })
                    }}
                    className="w-4 h-4 rounded border-gray-300 dark:border-gray-600"
                  />
                  <span className="text-sm font-medium">{cat.name}</span>
                </label>
              )
            })}
          </div>
          {errors.category_ids && (
            <p className="mt-1 text-sm text-red-600 dark:text-red-400">
              {errors.category_ids.message}
            </p>
          )}
        </div>
      </div>

      {/* Description */}
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
          Description
        </label>
        <textarea
          {...register('description')}
          rows={4}
          className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-gray-500"
          placeholder="Premium running shoes with superior cushioning..."
        />
      </div>

      {/* Pricing & Stock */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Input
          label="Regular Price (₱) *"
          type="number"
          step="0.01"
          {...register('price', { valueAsNumber: true })}
          error={errors.price?.message}
          placeholder="5999.00"
        />

        <Input
          label="Sale Price (₱)"
          type="number"
          step="0.01"
          {...register('sale_price', { valueAsNumber: true })}
          error={errors.sale_price?.message}
          placeholder="4499.00"
        />

        <Input
          label="Stock Quantity *"
          type="number"
          {...register('stock_quantity', { valueAsNumber: true })}
          error={errors.stock_quantity?.message}
          placeholder="50"
        />
      </div>

      {/* Sizes */}
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Available Sizes *
        </label>
        <SizePicker
          selectedSizes={selectedSizes}
          onChange={(newSizes) => setValue('sizes', newSizes, { shouldValidate: true })}
          type={watch('category_ids')?.some(id =>
            categories?.find(c => c.id === id && c.slug === 'apparels')
          ) ? 'apparel' : 'shoes'}
        />
        {errors.sizes && (
          <p className="mt-1 text-sm text-red-600 dark:text-red-400">
            {errors.sizes.message}
          </p>
        )}
      </div>

      {/* Colors */}
      <div>
        <Input
          label="Colors (comma separated)"
          {...register('colors')}
          placeholder="Black, White, Blue"
        />
      </div>

      {/* Images */}
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Product Images
        </label>
        <ImageUploader
          images={images}
          onChange={(newImages) => setValue('images', newImages)}
          maxImages={5}
        />
      </div>

      {/* Checkboxes */}
      <div className="flex gap-6">
        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="checkbox"
            {...register('is_featured')}
            className="w-4 h-4 text-black dark:text-white border-gray-300 rounded focus:ring-gray-500"
          />
          <span className="text-sm text-gray-700 dark:text-gray-300">
            Featured Product
          </span>
        </label>

        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="checkbox"
            {...register('is_active')}
            className="w-4 h-4 text-black dark:text-white border-gray-300 rounded focus:ring-gray-500"
          />
          <span className="text-sm text-gray-700 dark:text-gray-300">
            Active (visible to customers)
          </span>
        </label>
      </div>

      {/* Actions */}
      <div className="flex gap-3 justify-end border-t border-gray-200 dark:border-gray-700 pt-4">
        <Button
          type="button"
          variant="secondary"
          onClick={onCancel}
          disabled={loading}
        >
          Cancel
        </Button>
        <Button type="submit" disabled={loading}>
          {loading ? 'Saving...' : product ? 'Update Product' : 'Create Product'}
        </Button>
      </div>
    </form>
  )
}
