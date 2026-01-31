import { useState, useMemo } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { ShoppingCart, Zap } from 'lucide-react'
import Card from '../common/Card'
import Button from '../common/Button'
import PriceDisplay from './PriceDisplay'
import { useCartStore } from '../../store/cartStore'
import toast from 'react-hot-toast'
import { calculateSalePercentage } from '../../lib/utils'
import { useAnalytics } from '../../lib/analytics'
import {
  APPAREL_SIZES,
  SHOE_SIZES_EU,
  SHOE_SIZES_US_MEN,
  SHOE_SIZES_US_WOMEN,
  SHOE_SIZES_KIDS,
  convertFromEU,
  convertToEU,
} from '../../lib/sizeConversion'

const ALL_US_SIZES = [
  ...SHOE_SIZES_US_MEN.map((s) => ({ size: s, type: 'US_MEN' })),
  ...SHOE_SIZES_US_WOMEN.map((s) => ({ size: s, type: 'US_WOMEN' })),
  ...SHOE_SIZES_KIDS.map((s) => ({ size: s, type: 'KIDS' })),
].sort((a, b) => a.size - b.size)

export default function ProductCard({ product }) {
  const addItem = useCartStore((state) => state.addItem)
  const navigate = useNavigate()
  const analytics = useAnalytics()
  const [selectedEuSize, setSelectedEuSize] = useState('')
  const [selectedUsSize, setSelectedUsSize] = useState('')

  const isOnSale = product.sale_price && product.sale_price < product.price
  const discount = isOnSale ? calculateSalePercentage(product.price, product.sale_price) : 0
  const isApparel = product.category?.slug === 'apparels'

  const availableEuSizes = useMemo(() => {
    if (product.stock_quantity === 0) return []
    if (product.sizes && Array.isArray(product.sizes)) {
      return SHOE_SIZES_EU.filter(size => {
        const sizeData = product.sizes.find(s => {
          if (typeof s === 'object') return (s.size === size || s.value === size || s.name === size)
          // Convert both to strings for comparison since sizes are stored as strings
          return s.toString() === size.toString()
        })
        if (sizeData && typeof sizeData === 'object' && 'stock' in sizeData) return sizeData.stock > 0
        return !!sizeData
      })
    }
    return product.stock_quantity > 0 ? SHOE_SIZES_EU : []
  }, [product.sizes, product.stock_quantity])

  const isSizeAvailable = (size, type = 'EU') => {
    if (type === 'EU') {
      return availableEuSizes.includes(size)
    }
    const euSize = convertToEU(size, type)
    return euSize ? availableEuSizes.includes(euSize) : false
  }

  const isApparelSizeAvailable = (size) => {
    if (product.stock_quantity === 0) return false
    if (product.sizes && Array.isArray(product.sizes)) {
      const sizeData = product.sizes.find(s => {
        if (typeof s === 'object') return s.size === size || s.value === size || s.name === size
        // Convert both to strings for comparison since sizes are stored as strings
        return s.toString() === size.toString()
      })
      if (sizeData && typeof sizeData === 'object' && 'stock' in sizeData) return sizeData.stock > 0
      return !!sizeData
    }
    return product.stock_quantity > 0
  }

  const handleEuSizeChange = (e) => {
    e.preventDefault()
    e.stopPropagation()
    const euSize = e.target.value ? Number(e.target.value) : ''
    setSelectedEuSize(euSize)

    if (euSize) {
      const usMen = convertFromEU(euSize, 'US_MEN')
      if (usMen) {
        setSelectedUsSize(`${usMen}-US_MEN`)
        return
      }
      const usKids = convertFromEU(euSize, 'KIDS')
      if (usKids) {
        setSelectedUsSize(`${usKids}-KIDS`)
        return
      }
    }
    setSelectedUsSize('')
  }

  const handleUsSizeChange = (e) => {
    e.preventDefault()
    e.stopPropagation()
    const usSizeWithType = e.target.value
    setSelectedUsSize(usSizeWithType)

    if (usSizeWithType) {
      const [size, type] = usSizeWithType.split('-')
      const euSize = convertToEU(Number(size), type)
      setSelectedEuSize(euSize || '')
    } else {
      setSelectedEuSize('')
    }
  }

  const handleAddToCart = (e) => {
    e.preventDefault()
    e.stopPropagation()

    if (!selectedEuSize) {
      toast.error('Please select a size')
      analytics.trackButtonClick('add_to_cart_no_size', 'product_card', { product_id: product.id })
      return
    }

    addItem(product, 1, selectedEuSize)
    analytics.trackAddToCart(product, 1, selectedEuSize)
    analytics.trackButtonClick('add_to_cart', 'product_card', {
      product_id: product.id,
      size: selectedEuSize
    })
    toast.success(`${product.name} (EU ${selectedEuSize}) added to cart`)
    setSelectedEuSize('')
    setSelectedUsSize('')
  }

  const handleBuyNow = (e) => {
    e.preventDefault()
    e.stopPropagation()

    if (!selectedEuSize) {
      toast.error('Please select a size')
      analytics.trackButtonClick('buy_now_no_size', 'product_card', { product_id: product.id })
      return
    }

    addItem(product, 1, selectedEuSize)
    analytics.trackBuyNow(product, selectedEuSize)
    analytics.trackButtonClick('buy_now', 'product_card', {
      product_id: product.id,
      size: selectedEuSize
    })
    navigate('/checkout')
  }
  
  const handleApparelSizeChange = (e) => {
    e.preventDefault()
    e.stopPropagation()
    setSelectedEuSize(e.target.value)
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
            {isApparel ? (
               <select
                value={selectedEuSize}
                onChange={handleApparelSizeChange}
                onClick={(e) => { e.preventDefault(); e.stopPropagation(); }}
                className="w-full mt-3 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-gray-400 dark:focus:ring-gray-600"
              >
                <option value="">Select Size</option>
                {APPAREL_SIZES.map((size) => (
                  <option key={size} value={size} disabled={!isApparelSizeAvailable(size)}>
                    {size}
                  </option>
                ))}
              </select>
            ) : (
              <div className="grid grid-cols-2 gap-2 mt-3">
                <select
                  value={selectedEuSize}
                  onChange={handleEuSizeChange}
                  onClick={(e) => { e.preventDefault(); e.stopPropagation(); }}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-gray-400 dark:focus:ring-gray-600"
                >
                  <option value="">EU Size</option>
                  {SHOE_SIZES_EU.map((size) => (
                    <option key={size} value={size} disabled={!isSizeAvailable(size)}>
                      {size}
                    </option>
                  ))}
                </select>
                <select
                  value={selectedUsSize}
                  onChange={handleUsSizeChange}
                  onClick={(e) => { e.preventDefault(); e.stopPropagation(); }}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-gray-400 dark:focus:ring-gray-600"
                >
                  <option value="">US Size</option>
                  {ALL_US_SIZES.map(({ size, type }) => (
                    <option key={`${size}-${type}`} value={`${size}-${type}`} disabled={!isSizeAvailable(size, type)}>
                      {size} ({type.replace('US_', '').charAt(0)})
                    </option>
                  ))}
                </select>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex gap-2 mt-2">
              <Button
                onClick={handleAddToCart}
                disabled={product.stock_quantity === 0 || !selectedEuSize}
                variant="secondary"
                className="flex-1 flex items-center justify-center gap-2"
                size="sm"
              >
                <ShoppingCart className="w-4 h-4" />
                Add
              </Button>

              <Button
                onClick={handleBuyNow}
                disabled={product.stock_quantity === 0 || !selectedEuSize}
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
