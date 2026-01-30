import { useEffect, useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { getActiveSalePromotion } from '../services/promotions'

export function useSaleTimer() {
  const { data: salePromotion, isLoading } = useQuery({
    queryKey: ['activeSalePromotion'],
    queryFn: getActiveSalePromotion,
    refetchInterval: 60000 // Refetch every minute
  })

  const [timeRemaining, setTimeRemaining] = useState(null)

  useEffect(() => {
    if (!salePromotion || !salePromotion.end_date) {
      setTimeRemaining(null)
      return
    }

    const calculateTimeRemaining = () => {
      const now = new Date()
      const endDate = new Date(salePromotion.end_date)
      const diff = endDate - now

      if (diff <= 0) {
        setTimeRemaining(null)
        return
      }

      const days = Math.floor(diff / (1000 * 60 * 60 * 24))
      const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60))
      const seconds = Math.floor((diff % (1000 * 60)) / 1000)

      setTimeRemaining({ days, hours, minutes, seconds })
    }

    calculateTimeRemaining()
    const interval = setInterval(calculateTimeRemaining, 1000)

    return () => clearInterval(interval)
  }, [salePromotion])

  return {
    salePromotion,
    timeRemaining,
    isLoading,
    isActive: !!timeRemaining
  }
}
