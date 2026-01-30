import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Menu, ShoppingCart } from 'lucide-react'
import { useQuery } from '@tanstack/react-query'
import ThemeToggle from './ThemeToggle'
import Navigation from './Navigation'
import MobileMenu from './MobileMenu'
import { useCartStore } from '../../store/cartStore'
import { getSettings } from '../../services/settings'
import { useAnalytics } from '../../lib/analytics'

export default function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const items = useCartStore((state) => state.items)
  const cartCount = items.reduce((total, item) => total + item.quantity, 0)
  const analytics = useAnalytics()

  const { data: settings } = useQuery({
    queryKey: ['settings'],
    queryFn: getSettings
  })

  return (
    <>
      <header className="sticky top-0 z-40 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 shadow-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            {/* Logo & Mobile Menu Toggle */}
            <div className="flex items-center gap-4">
              <button
                onClick={() => {
                  setMobileMenuOpen(true)
                  analytics.trackButtonClick('mobile_menu', 'header')
                }}
                className="lg:hidden p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800"
              >
                <Menu className="w-6 h-6" />
              </button>

              <Link
                to="/"
                className="flex items-center"
                onClick={() => analytics.trackNavigation('home', 'header_logo')}
              >
                {settings?.site_logo_url ? (
                  <img
                    src={settings.site_logo_url}
                    alt={settings?.site_name || 'Store Logo'}
                    className="h-10 object-contain"
                  />
                ) : (
                  <span className="text-2xl font-bold text-gray-900 dark:text-white">
                    {settings?.site_name || 'Insurgents'}
                  </span>
                )}
              </Link>
            </div>

            {/* Desktop Navigation */}
            <Navigation />

            {/* Actions */}
            <div className="flex items-center gap-3">
              <ThemeToggle />

              <Link
                to="/cart"
                className="relative p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800"
                onClick={() => {
                  const total = items.reduce((sum, item) => sum + (item.sale_price || item.price) * item.quantity, 0)
                  analytics.trackCartView(cartCount, total)
                  analytics.trackButtonClick('cart_icon', 'header', { items_count: cartCount })
                }}
              >
                <ShoppingCart className="w-6 h-6" />
                {cartCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-red-600 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
                    {cartCount}
                  </span>
                )}
              </Link>
            </div>
          </div>
        </div>
      </header>

      <MobileMenu isOpen={mobileMenuOpen} onClose={() => setMobileMenuOpen(false)} />
    </>
  )
}
