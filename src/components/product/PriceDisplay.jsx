import { formatPrice, calculateSalePercentage } from '../../lib/utils'

export default function PriceDisplay({ price, salePrice, showBadge = false }) {
  const isOnSale = salePrice && salePrice < price
  const discount = isOnSale ? calculateSalePercentage(price, salePrice) : 0

  return (
    <div className="flex items-center gap-2 flex-wrap">
      {isOnSale ? (
        <>
          <span className="text-2xl font-bold text-green-600 dark:text-green-400">
            {formatPrice(salePrice)}
          </span>
          <span className="text-lg text-gray-500 dark:text-gray-400 line-through">
            {formatPrice(price)}
          </span>
          {showBadge && discount > 0 && (
            <span className="px-2 py-1 bg-red-600 text-white text-xs font-bold rounded">
              -{discount}%
            </span>
          )}
        </>
      ) : (
        <span className="text-2xl font-bold text-gray-900 dark:text-white">
          {formatPrice(price)}
        </span>
      )}
    </div>
  )
}
