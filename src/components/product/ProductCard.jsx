import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { ShoppingCart, Zap } from 'lucide-react'
import Card from '../common/Card'
import Button from '../common/Button'
import PriceDisplay from './PriceDisplay'
import { useCartStore } from '../../store/cartStore'
import toast from 'react-hot-toast'
import { calculateSalePercentage } from '../../lib/utils'
import { useAnalytics } from '../../lib/analytics'
import { APPAREL_SIZES, SHOE_SIZES_EU, convertFromEU } from '../../lib/sizeConversion'

export default function ProductCard({ product }) {
  const addItem = useCartStore((state) => state.addItem)
  const navigate = useNavigate()
  const analytics = useAnalytics()
  const [selectedSize, setSelectedSize] = useState('')

  const isOnSale = product.sale_price && product.sale_price < product.price
  const discount = isOnSale ? calculateSalePercentage(product.price, product.sale_price) : 0
  const isApparel = product.category?.slug === 'apparels'
  const sizeOptions = isApparel ? APPAREL_SIZES : SHOE_SIZES_EU
  const formatShoeSizeLabel = (euSize) => {
    const usMen = convertFromEU(euSize, 'US_MEN')
    const usKids = convertFromEU(euSize, 'KIDS')
    const usLabel = usMen ? `US ${usMen}` : usKids ? `US ${usKids} (Kids)` : null
    return usLabel ? `EU ${euSize} / ${usLabel}` : `EU ${euSize}`
  }

  // Check if a size is available
  const isSizeAvailable = (size) => {
    // If product is out of stock, no sizes are available
    if (product.stock_quantity === 0) return false

    // If sizes field exists and has stock info
    if (product.sizes && Array.isArray(product.sizes)) {
      // Check if sizes are objects with stock property
      const sizeData = product.sizes.find(s => {
        if (typeof s === 'object') {
          return s.size === size || s.value === size || s.name === size
        }
        return s === size
      })

      // If size has stock property, check it
      if (sizeData && typeof sizeData === 'object' && 'stock' in sizeData) {
        return sizeData.stock > 0
      }

      // If size exists in array (as string or object without stock), it's available
      return !!sizeData
    }

    // Default: all sizes available if product has stock
    return product.stock_quantity > 0
  }

  const handleAddToCart = (e) => {
    e.preventDefault()
    e.stopPropagation()

    if (!selectedSize) {
      toast.error('Please select a size')
      analytics.trackButtonClick('add_to_cart_no_size', 'product_card', { product_id: product.id })
      return
    }

    addItem(product, 1, selectedSize)
    analytics.trackAddToCart(product, 1, selectedSize)
    analytics.trackButtonClick('add_to_cart', 'product_card', {
      product_id: product.id,
      size: selectedSize
    })
    toast.success(`${product.name} (${isApparel ? selectedSize : `EU ${selectedSize}`}) added to cart`)
    setSelectedSize('') // Reset size after adding
  }

  const handleBuyNow = (e) => {
    e.preventDefault()
    e.stopPropagation()

    if (!selectedSize) {
      toast.error('Please select a size')
      analytics.trackButtonClick('buy_now_no_size', 'product_card', { product_id: product.id })
      return
    }

    addItem(product, 1, selectedSize)
    analytics.trackBuyNow(product, selectedSize)
    analytics.trackButtonClick('buy_now', 'product_card', {
      product_id: product.id,
      size: selectedSize
    })
    navigate('/checkout')
  }

  const handleSizeChange = (e) => {
    e.preventDefault()
    e.stopPropagation()
    setSelectedSize(e.target.value)
  }

  const imageUrl = product.images?.[0]?.url

  return (
    <Link to={`/product/${product.id}`}>
      <Card className="group hover:shadow-xl transition-all duration-300 overflow-hidden h-full flex flex-col">
        {/* Image Container */}
        <div className="relative aspect-square overflow-hidden bg-gray-100 dark:bg-gray-700 rounded-md mb-3">
          {imageUrl ? (
            <img
              src={imageUrl}
              alt={product.name}
              className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
              loading="lazy"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-gray-200 dark:bg-gray-700">
              <span className="text-gray-400 dark:text-gray-500 text-sm">No Image</span>
            </div>
          )}

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
                {isApparel ? 'Select Size' : 'Select Size (EU / US)'}
              </option>
              {sizeOptions
                .filter((size) => isSizeAvailable(size))
                .map((size) => (
                  <option key={size} value={size}>
                    {isApparel ? size : formatShoeSizeLabel(size)}
                  </option>
                ))}
            </select>

            {/* Action Buttons */}
            <div className="flex gap-2 mt-2">
              <Button
                onClick={handleAddToCart}
                disabled={product.stock_quantity === 0}
                variant="secondary"
                className="flex-1 flex items-center justify-center gap-2"
                size="sm"
              >
                <ShoppingCart className="w-4 h-4" />
                Add
              </Button>

              <Button
                onClick={handleBuyNow}
                disabled={product.stock_quantity === 0}
                className="flex-1 flex items-center justify-center gap-2"
                size="sm"
              >
                <Zap className="w-4 h-4" />
                Buy Now
              </Button>
            </div>
          </div>
        </div>
      </Card>
    </Link>
  )
}
