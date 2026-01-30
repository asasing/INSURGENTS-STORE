import ProductCard from './ProductCard'
import Spinner from '../common/Spinner'

export default function ProductGrid({ products, loading, error }) {
  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <Spinner size="lg" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="text-center text-red-600 dark:text-red-400 p-8">
        <p className="text-lg font-semibold mb-2">Error loading products</p>
        <p className="text-sm">{error.message || 'Please try again later'}</p>
      </div>
    )
  }

  if (!products || products.length === 0) {
    return (
      <div className="text-center text-gray-600 dark:text-gray-400 p-12">
        <p className="text-lg font-semibold mb-2">No products found</p>
        <p className="text-sm">Check back soon for new arrivals!</p>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
      {products.map((product) => (
        <ProductCard key={product.id} product={product} />
      ))}
    </div>
  )
}
