import { Clock } from 'lucide-react'
import { useSaleTimer } from '../../hooks/useSaleTimer'

export default function SaleTimer() {
  const { salePromotion, timeRemaining, isLoading, isActive } = useSaleTimer()

  if (isLoading || !isActive || !timeRemaining) {
    return null
  }

  return (
    <div className="bg-gradient-to-r from-red-600 to-orange-600 dark:from-red-700 dark:to-orange-700 text-white py-3">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-center gap-4 flex-wrap">
          <div className="flex items-center gap-2">
            <Clock className="w-5 h-5" />
            <span className="font-semibold">
              {salePromotion.message || 'Limited Time Sale!'}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-sm">Ends in:</span>
            <div className="flex gap-2">
              {timeRemaining.days > 0 && (
                <div className="bg-white/20 px-2 py-1 rounded">
                  <span className="font-bold">{timeRemaining.days}</span>
                  <span className="text-xs ml-1">d</span>
                </div>
              )}
              <div className="bg-white/20 px-2 py-1 rounded">
                <span className="font-bold">{String(timeRemaining.hours).padStart(2, '0')}</span>
                <span className="text-xs ml-1">h</span>
              </div>
              <div className="bg-white/20 px-2 py-1 rounded">
                <span className="font-bold">{String(timeRemaining.minutes).padStart(2, '0')}</span>
                <span className="text-xs ml-1">m</span>
              </div>
              <div className="bg-white/20 px-2 py-1 rounded">
                <span className="font-bold">{String(timeRemaining.seconds).padStart(2, '0')}</span>
                <span className="text-xs ml-1">s</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
