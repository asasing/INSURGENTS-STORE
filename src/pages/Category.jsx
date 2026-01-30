import { useState } from 'react'
import { useParams } from 'react-router-dom'
import { useProducts } from '../hooks/useProducts'
import ProductGrid from '../components/product/ProductGrid'

export default function Category() {
  const { slug } = useParams()
  const [sortBy, setSortBy] = useState('latest')

  // Map slug to filters
  const getFilters = () => {
    const baseFilters = { sortBy }

    if (slug === 'all-items') {
      return baseFilters // No additional filters - show all products
    }
    if (slug === 'new-arrivals') {
      return { ...baseFilters, limit: 20 } // Top 20 newest
    }
    if (slug === 'on-sale') {
      return { ...baseFilters, onSale: true }
    }
    if (slug === 'top-selling') {
      return { ...baseFilters, featured: true }
    }
    // For other slugs, filter by category
    return { ...baseFilters, categorySlug: slug }
  }

  const { data: products, isLoading, error } = useProducts(getFilters())

  // Get category title
  const getCategoryTitle = () => {
    const titles = {
      'all-items': 'All Items',
      'new-arrivals': 'New Arrivals',
      'on-sale': 'On Sale',
      'top-selling': 'Top Selling',
      'apparels': 'Apparels',
      'running': 'Running Shoes',
      'basketball': 'Basketball Shoes',
      'casual': 'Casual Shoes'
    }
    return titles[slug] || slug.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')
  }

  const sortOptions = [
    { value: 'latest', label: 'Latest' },
    { value: 'name', label: 'Name (A-Z)' },
    { value: 'price-low', label: 'Price (Low to High)' },
    { value: 'price-high', label: 'Price (High to Low)' },
    { value: 'discount', label: 'Most Discounted' }
  ]

  return (
    <div className="bg-gray-50 dark:bg-gray-900 min-h-screen py-8">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="mb-8">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-4">
            <div>
              <h1 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-2">
                {getCategoryTitle()}
              </h1>
              <p className="text-gray-600 dark:text-gray-400">
                {products?.length || 0} {products?.length === 1 ? 'product' : 'products'} found
              </p>
            </div>

            {/* Sort Dropdown */}
            <div className="flex items-center gap-2">
              <label htmlFor="sort" className="text-sm text-gray-600 dark:text-gray-400">
                Sort by:
              </label>
              <select
                id="sort"
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-gray-400 dark:focus:ring-gray-600"
              >
                {sortOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Products Grid */}
        <ProductGrid products={products} loading={isLoading} error={error} />

        {/* Empty State */}
        {!isLoading && products?.length === 0 && (
          <div className="text-center py-16">
            <p className="text-lg text-gray-600 dark:text-gray-400">
              No products found in this category.
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
