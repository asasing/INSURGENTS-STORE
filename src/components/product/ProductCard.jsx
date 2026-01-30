import { useState } from 'react'
import { Link } from 'react-router-dom'
import { ShoppingCart } from 'lucide-react'
import Card from '../common/Card'
import Button from '../common/Button'
import PriceDisplay from './PriceDisplay'
import { useCartStore } from '../../store/cartStore'
import toast from 'react-hot-toast'
import { calculateSalePercentage } from '../../lib/utils'

// Size options
const APPAREL_SIZES = ['XS', 'S', 'M', 'L', 'XL', 'XXL', 'Free Size']
const SHOE_SIZES_EU = [35, 36, 37, 38, 39, 40, 41, 42, 43, 44, 45, 46, 47, 48]

export default function ProductCard({ product }) {
  const addItem = useCartStore((state) => state.addItem)
  const [selectedSize, setSelectedSize] = useState('')

  const isOnSale = product.sale_price && product.sale_price < product.price
  const discount = isOnSale ? calculateSalePercentage(product.price, product.sale_price) : 0
  const isApparel = product.category?.slug === 'apparels'
  const sizeOptions = isApparel ? APPAREL_SIZES : SHOE_SIZES_EU

  const handleAddToCart = (e) => {
    e.preventDefault()
    e.stopPropagation()

    if (!selectedSize) {
      toast.error('Please select a size')
      return
    }

    addItem(product, 1, selectedSize)
    toast.success(`${product.name} (${isApparel ? selectedSize : `EU ${selectedSize}`}) added to cart`)
    setSelectedSize('') // Reset size after adding
  }

  const handleSizeChange = (e) => {
    e.preventDefault()
    e.stopPropagation()
    setSelectedSize(e.target.value)
  }

  const imageUrl = product.images?.[0]?.url || '/placeholder-product.jpg'

  return (
    <Link to={`/product/${product.id}`}>
      <Card className="group hover:shadow-xl transition-all duration-300 overflow-hidden h-full flex flex-col">
        {/* Image Container */}
        <div className="relative aspect-square overflow-hidden bg-gray-100 dark:bg-gray-700 rounded-md mb-3">
          <img
            src={imageUrl}
            alt={product.name}
            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
            loading="lazy"
          />

          {/* Sale Badge */}
          {isOnSale && discount > 0 && (
            <div className="absolute top-2 right-2 bg-red-600 text-white px-2 py-1 rounded font-bold text-sm">
              -{discount}%
            </div>
          )}

          {/* Stock Status */}
          {product.stock_quantity === 0 && (
            <div className="absolute inset-0 bg-black bg-opacity-60 flex items-center justify-center">
              <span className="text-white font-bold text-lg">Out of Stock</span>
            </div>
          )}
        </div>

        {/* Product Info */}
        <div className="flex-1 flex flex-col">
          <h3 className="font-semibold text-gray-900 dark:text-white mb-1 line-clamp-2 min-h-[3rem]">
            {product.name}
          </h3>

          {product.category && (
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">
              {product.category.name}
            </p>
          )}

          <div className="mt-auto">
            <PriceDisplay price={product.price} salePrice={product.sale_price} showBadge={false} />

            {/* Size Selector */}
            <select
              value={selectedSize}
              onChange={handleSizeChange}
              onClick={(e) => { e.preventDefault(); e.stopPropagation(); }}
              className="w-full mt-3 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-gray-400 dark:focus:ring-gray-600"
            >
              <option value="">
                {isApparel ? 'Select Size' : 'Select Size (EU)'}
              </option>
              {sizeOptions.map((size) => (
                <option key={size} value={size}>
                  {isApparel ? size : `EU ${size}`}
                </option>
              ))}
            </select>

            <Button
              onClick={handleAddToCart}
              disabled={product.stock_quantity === 0}
              className="w-full mt-2 flex items-center justify-center gap-2"
              size="sm"
            >
              <ShoppingCart className="w-4 h-4" />
              Add to Cart
            </Button>
          </div>
        </div>
      </Card>
    </Link>
  )
}
