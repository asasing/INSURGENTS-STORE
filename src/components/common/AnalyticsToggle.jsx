import { useState, useEffect } from 'react'
import { usePostHog } from 'posthog-js/react'
import { BarChart3, Slash } from 'lucide-react'

export default function AnalyticsToggle({ className = '' }) {
  const posthog = usePostHog()
  const [isEnabled, setIsEnabled] = useState(true)
  const isDev = import.meta.env.DEV

  useEffect(() => {
    // Check if analytics is disabled in localStorage
    const disabled = localStorage.getItem('disable_analytics') === 'true'
    setIsEnabled(!disabled)
  }, [])

  const toggleAnalytics = () => {
    const newState = !isEnabled

    if (newState) {
      // Enable analytics
      localStorage.removeItem('disable_analytics')
      posthog?.opt_in_capturing()
      console.log('📊 Analytics: ENABLED')
    } else {
      // Disable analytics
      localStorage.setItem('disable_analytics', 'true')
      posthog?.opt_out_capturing()
      console.log('📊 Analytics: DISABLED')
    }

    setIsEnabled(newState)
  }

  // Only show toggle in development mode
  if (!isDev) {
    return null
  }

  return (
    <button
      onClick={toggleAnalytics}
      className={`flex items-center gap-2 px-3 py-2 text-sm rounded-lg transition-colors ${
        isEnabled
          ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 hover:bg-green-200 dark:hover:bg-green-900/50'
          : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700'
      } ${className}`}
      title={isEnabled ? 'Disable Analytics (Dev Only)' : 'Enable Analytics (Dev Only)'}
    >
      {isEnabled ? (
        <>
          <BarChart3 className="w-4 h-4" />
          <span className="hidden sm:inline">Analytics On</span>
        </>
      ) : (
        <>
          <div className="relative">
            <BarChart3 className="w-4 h-4" />
            <Slash className="w-4 h-4 absolute inset-0" />
          </div>
          <span className="hidden sm:inline">Analytics Off</span>
        </>
      )}
    </button>
  )
}
