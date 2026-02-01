import { Link, useNavigate, useLocation } from 'react-router-dom'
import { Package, ShoppingCart, MessageSquare, Timer, LayoutDashboard, LogOut, Settings, ExternalLink, Store } from 'lucide-react'
import { useAuth } from '../../hooks/useAuth'
import ThemeToggle from './ThemeToggle'
import toast from 'react-hot-toast'
import { cn } from '../../lib/utils'

const menuItems = [
  { path: '/admin/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { path: '/admin/orders', label: 'Orders', icon: ShoppingCart },
  { path: '/admin/inventory', label: 'Inventory', icon: Package },
  { path: '/admin/promotions', label: 'Promotions', icon: Timer },
  { path: '/admin/testimonials', label: 'Testimonials', icon: MessageSquare },
  { path: '/admin/settings', label: 'Settings', icon: Settings },
  { url: '/', label: 'View Online Store', icon: Store, isExternal: true },
  { url: 'https://ins-admin.vercel.app/', label: 'Store Operations', icon: ExternalLink, isExternal: true }
]

export default function AdminLayout({ children }) {
  const { signOut } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()

  const handleSignOut = async () => {
    await signOut()
    toast.success('Signed out successfully')
    navigate('/admin/login')
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Sidebar */}
      <aside className="fixed left-0 top-0 h-full w-64 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 p-4">
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="mb-8">
            <Link to="/" className="text-xl font-bold text-gray-900 dark:text-white">
              REMAfy
            </Link>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Online Store Admin</p>
          </div>

          {/* Navigation */}
          <nav className="flex-1 space-y-2">
            {menuItems.map((item) => {
              const Icon = item.icon
              const isActive = location.pathname === item.path
              const key = item.path || item.url

              // External link (opens in new tab)
              if (item.isExternal) {
                return (
                  <a
                    key={key}
                    href={item.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-3 px-4 py-3 rounded-lg font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                  >
                    <Icon className="w-5 h-5" />
                    {item.label}
                  </a>
                )
              }

              // Internal link
              return (
                <Link
                  key={key}
                  to={item.path}
                  className={cn(
                    'flex items-center gap-3 px-4 py-3 rounded-lg font-medium transition-colors',
                    isActive
                      ? 'bg-black text-white dark:bg-white dark:text-black'
                      : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                  )}
                >
                  <Icon className="w-5 h-5" />
                  {item.label}
                </Link>
              )
            })}
          </nav>

          {/* Footer Actions */}
          <div className="space-y-2 border-t border-gray-200 dark:border-gray-700 pt-4">
            <ThemeToggle />
            <button
              onClick={handleSignOut}
              className="flex items-center gap-3 px-4 py-3 rounded-lg font-medium text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors w-full"
            >
              <LogOut className="w-5 h-5" />
              Sign Out
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="ml-64 p-8">{children}</main>
    </div>
  )
}
