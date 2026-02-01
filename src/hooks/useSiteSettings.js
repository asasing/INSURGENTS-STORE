import { useEffect } from 'react'
import { useQuery } from '@tanstack/react-query'
import { getSettings } from '../services/settings'

/**
 * Hook to fetch site settings and update document title and favicon
 */
export function useSiteSettings() {
  const { data: settings, isLoading, error } = useQuery({
    queryKey: ['settings'],
    queryFn: getSettings,
    staleTime: 5 * 60 * 1000, // 5 minutes
  })

  // Update document title and favicon when settings change
  useEffect(() => {
    if (!settings) return

    // Update browser tab title
    if (settings.site_title) {
      document.title = settings.site_title
    }

    // Update favicon
    if (settings.favicon_url) {
      // Remove existing favicon links
      const existingLinks = document.querySelectorAll("link[rel*='icon']")
      existingLinks.forEach(link => link.remove())

      // Add new favicon
      const link = document.createElement('link')
      link.rel = 'icon'
      link.type = 'image/x-icon'
      link.href = settings.favicon_url
      document.head.appendChild(link)
    }
  }, [settings])

  return { settings, isLoading, error }
}
