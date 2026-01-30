import { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { ShoppingCart, Ruler } from 'lucide-react'
import { getProductById } from '../services/products'
import { useCartStore } from '../store/cartStore'
import Button from '../components/common/Button'
import Card from '../components/common/Card'
import Spinner from '../components/common/Spinner'
import { formatPrice } from '../lib/utils'
import toast from 'react-hot-toast'

// Size charts
const SHOE_SIZES = {
  EU: [35, 36, 37, 38, 39, 40, 41, 42, 43, 44, 45, 46, 47, 48],
  US_MEN: [3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16],
  US_WOMEN: [5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18]
}

const APPAREL_SIZES = ['XS', 'S', 'M', 'L', 'XL', 'XXL', 'Free Size']

export default function ProductDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const addItem = useCartStore((state) => state.addItem)

  const [selectedImage, setSelectedImage] = useState(0)
  const [selectedSize, setSelectedSize] = useState('')
  const [sizeType, setSizeType] = useState('EU') // EU, US_MEN, US_WOMEN (for shoes)
  const [quantity, setQuantity] = useState(1)
  const [showSizeChart, setShowSizeChart] = useState(false)

  const isApparel = product?.category?.slug === 'apparels'

  const { data: product, isLoading, error } = useQuery({
    queryKey: ['product', id],
    queryFn: () => getProductById(id)
  })

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Spinner size="lg" />
      </div>
    )
  }

  if (error || !product) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-xl text-gray-600 dark:text-gray-400 mb-4">
            Product not found
          </p>
          <Button onClick={() => navigate('/')}>Back to Home</Button>
        </div>
      </div>
    )
  }

  const currentPrice = product.sale_price || product.price
  const images = product.images || []

  const handleAddToCart = () => {
    if (!selectedSize) {
      toast.error('Please select a size')
      return
    }

    const sizeLabel = isApparel ? selectedSize : `${getSizeLabel(selectedSize, sizeType)}`
    addItem(product, quantity, selectedSize)
    toast.success(`${product.name} (${sizeLabel}) added to cart`)
  }

  const getSizeLabel = (size, type) => {
    if (type === 'EU') return `EU ${size}`
    if (type === 'US_MEN') return `US ${size} (Men)`
    if (type === 'US_WOMEN') return `US ${size} (Women)`
    return size
  }

  return (
    <div className="bg-gray-50 dark:bg-gray-900 min-h-screen py-8">
      <div className="container mx-auto px-4">
        {/* Back Button */}
        <button
          onClick={() => navigate(-1)}
          className="mb-6 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
        >
          ← Back
        </button>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Images */}
          <div>
            <Card className="mb-4">
              {images.length > 0 ? (
                <img
                  src={images[selectedImage]?.url || '/placeholder.jpg'}
                  alt={product.name}
                  className="w-full h-96 object-contain rounded-lg"
                />
              ) : (
                <div className="w-full h-96 bg-gray-200 dark:bg-gray-700 rounded-lg flex items-center justify-center">
                  <span className="text-gray-400">No image available</span>
                </div>
              )}
            </Card>

            {/* Thumbnail Gallery */}
            {images.length > 1 && (
              <div className="grid grid-cols-4 gap-2">
                {images.map((image, index) => (
                  <button
                    key={index}
                    onClick={() => setSelectedImage(index)}
                    className={`border-2 rounded-lg overflow-hidden ${
                      selectedImage === index
                        ? 'border-black dark:border-white'
                        : 'border-gray-200 dark:border-gray-700'
                    }`}
                  >
                    <img
                      src={image.url}
                      alt={`${product.name} ${index + 1}`}
                      className="w-full h-20 object-cover"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Product Info */}
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
              {product.name}
            </h1>

            {product.category && (
              <p className="text-gray-600 dark:text-gray-400 mb-4">
                {product.category.name}
              </p>
            )}

            {/* Price */}
            <div className="mb-6">
              <div className="flex items-center gap-3">
                <span className="text-3xl font-bold text-gray-900 dark:text-white">
                  {formatPrice(currentPrice)}
                </span>
                {product.sale_price && (
                  <>
                    <span className="text-xl text-gray-500 line-through">
                      {formatPrice(product.price)}
                    </span>
                    <span className="bg-red-600 text-white px-2 py-1 rounded text-sm font-medium">
                      {Math.round(((product.price - product.sale_price) / product.price) * 100)}% OFF
                    </span>
                  </>
                )}
              </div>
            </div>

            {/* Description */}
            {product.description && (
              <Card className="mb-6">
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                  Description
                </h2>
                <p className="text-gray-700 dark:text-gray-300">
                  {product.description}
                </p>
              </Card>
            )}

            {/* Size Selection */}
            <Card className="mb-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                  Select Size {selectedSize && (isApparel ? `- ${selectedSize}` : `- ${getSizeLabel(selectedSize, sizeType)}`)}
                </h2>
                {!isApparel && (
                  <button
                    onClick={() => setShowSizeChart(!showSizeChart)}
                    className="flex items-center gap-1 text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
                  >
                    <Ruler className="w-4 h-4" />
                    Size Chart
                  </button>
                )}
              </div>

              {isApparel ? (
                /* Apparel Size Selection */
                <div className="grid grid-cols-4 gap-2">
                  {APPAREL_SIZES.map((size) => (
                    <button
                      key={size}
                      onClick={() => setSelectedSize(size)}
                      className={`py-3 rounded-lg font-medium transition-colors ${
                        selectedSize === size
                          ? 'bg-black text-white dark:bg-white dark:text-black'
                          : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'
                      }`}
                    >
                      {size}
                    </button>
                  ))}
                </div>
              ) : (
                /* Shoe Size Selection */
                <div>

                {/* Size Type Selector */}
                <div className="flex gap-2 mb-4">
                  <button
                    onClick={() => { setSizeType('EU'); setSelectedSize('') }}
                    className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                      sizeType === 'EU'
                        ? 'bg-black text-white dark:bg-white dark:text-black'
                        : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
                    }`}
                  >
                    EU
                  </button>
                  <button
                    onClick={() => { setSizeType('US_MEN'); setSelectedSize('') }}
                    className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                      sizeType === 'US_MEN'
                        ? 'bg-black text-white dark:bg-white dark:text-black'
                        : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
                    }`}
                  >
                    US Men
                  </button>
                  <button
                    onClick={() => { setSizeType('US_WOMEN'); setSelectedSize('') }}
                    className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                      sizeType === 'US_WOMEN'
                        ? 'bg-black text-white dark:bg-white dark:text-black'
                        : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
                    }`}
                  >
                    US Women
                  </button>
                </div>

                {/* Size Selection */}
                <div className="grid grid-cols-5 gap-2">
                  {SHOE_SIZES[sizeType].map((size) => (
                    <button
                      key={size}
                      onClick={() => setSelectedSize(size.toString())}
                      className={`py-2 rounded-lg font-medium transition-colors ${
                        selectedSize === size.toString()
                          ? 'bg-black text-white dark:bg-white dark:text-black'
                          : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'
                      }`}
                    >
                      {size}
                    </button>
                  ))}
                </div>

                {/* Size Chart */}
                {showSizeChart && (
                  <div className="mt-4 p-4 bg-gray-100 dark:bg-gray-800 rounded-lg">
                    <h3 className="font-semibold mb-2 text-gray-900 dark:text-white">
                      Size Conversion Chart
                    </h3>
                    <div className="overflow-x-auto">
                      <table className="w-full text-sm">
                        <thead>
                          <tr className="border-b border-gray-300 dark:border-gray-600">
                            <th className="text-left py-2 text-gray-900 dark:text-white">EU</th>
                            <th className="text-left py-2 text-gray-900 dark:text-white">US Men</th>
                            <th className="text-left py-2 text-gray-900 dark:text-white">US Women</th>
                          </tr>
                        </thead>
                        <tbody className="text-gray-700 dark:text-gray-300">
                          {SHOE_SIZES.EU.map((euSize, index) => (
                            <tr key={euSize} className="border-b border-gray-200 dark:border-gray-700">
                              <td className="py-2">{euSize}</td>
                              <td className="py-2">{SHOE_SIZES.US_MEN[index]}</td>
                              <td className="py-2">{SHOE_SIZES.US_WOMEN[index]}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}
                </div>
              )}
            </Card>

            {/* Quantity */}
            <Card className="mb-6">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                Quantity
              </h2>
              <div className="flex items-center gap-4">
                <button
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="w-10 h-10 rounded-lg bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-white font-semibold hover:bg-gray-300 dark:hover:bg-gray-600"
                >
                  -
                </button>
                <span className="text-xl font-medium text-gray-900 dark:text-white">
                  {quantity}
                </span>
                <button
                  onClick={() => setQuantity(quantity + 1)}
                  className="w-10 h-10 rounded-lg bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-white font-semibold hover:bg-gray-300 dark:hover:bg-gray-600"
                >
                  +
                </button>
              </div>
            </Card>

            {/* Add to Cart */}
            <Button
              onClick={handleAddToCart}
              className="w-full flex items-center justify-center gap-2"
              size="lg"
            >
              <ShoppingCart className="w-5 h-5" />
              Add to Cart
            </Button>

            {/* Stock Info */}
            {product.stock !== undefined && (
              <p className="mt-4 text-sm text-gray-600 dark:text-gray-400 text-center">
                {product.stock > 0 ? (
                  <>In stock: {product.stock} available</>
                ) : (
                  <span className="text-red-600">Out of stock</span>
                )}
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
