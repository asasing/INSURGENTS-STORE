import { Link, useNavigate, useLocation } from 'react-router-dom'
import { Package, ShoppingCart, MessageSquare, Timer, LayoutDashboard, LogOut, Settings, ExternalLink, Store, User, Tag, Truck } from 'lucide-react'
import { useAuth } from '../../hooks/useAuth'
import ThemeToggle from './ThemeToggle'
import toast from 'react-hot-toast'
import { cn } from '../../lib/utils'

const menuItems = [
  { path: '/admin/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { path: '/admin/orders', label: 'Orders', icon: ShoppingCart },
  { path: '/admin/inventory', label: 'Inventory', icon: Package },
  { path: '/admin/discounts', label: 'Discounts & Promos', icon: Tag },
  { path: '/admin/shipping', label: 'Shipping Zones', icon: Truck },
  { path: '/admin/promotions', label: 'Promotions', icon: Timer },
  { path: '/admin/testimonials', label: 'Testimonials', icon: MessageSquare },
  { path: '/admin/settings', label: 'Settings', icon: Settings, adminOnly: true },
  { url: '/', label: 'View Online Store', icon: Store, isExternal: true },
  { url: 'https://ins-admin.vercel.app/', label: 'Store Operations', icon: ExternalLink, isExternal: true }
]

export default function AdminLayout({ children }) {
  const { signOut, isAdmin, user } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()

  // Filter menu items based on admin status
  const visibleMenuItems = menuItems.filter(item => !item.adminOnly || isAdmin)

  // Get role badge color
  const getRoleBadgeColor = () => {
    if (isAdmin) return 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200'
    return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'
  }

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
            {visibleMenuItems.map((item) => {
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

      {/* Main Content Area */}
      <div className="ml-64">
        {/* Top Bar */}
        <header className="sticky top-0 z-10 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-8 py-4">
          <div className="flex items-center justify-between">
            {/* Page Title / Breadcrumb (optional - can be added later) */}
            <div className="flex-1">
              {/* Empty for now, can add breadcrumbs or page title here */}
            </div>

            {/* User Info & Actions */}
            <div className="flex items-center gap-4">
              {/* User Info */}
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-2 px-3 py-2 bg-gray-100 dark:bg-gray-700 rounded-lg">
                  <User className="w-4 h-4 text-gray-600 dark:text-gray-400" />
                  <div className="flex flex-col">
                    <span className="text-sm font-medium text-gray-900 dark:text-white">
                      {user?.email || 'User'}
                    </span>
                    <span className={cn('text-xs font-medium px-2 py-0.5 rounded-full', getRoleBadgeColor())}>
                      {isAdmin ? 'Admin' : 'Staff'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Theme Toggle */}
              <ThemeToggle />

              {/* Logout Button */}
              <button
                onClick={handleSignOut}
                className="flex items-center gap-2 px-4 py-2 rounded-lg font-medium text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                title="Sign Out"
              >
                <LogOut className="w-4 h-4" />
                <span className="text-sm">Logout</span>
              </button>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="p-8">{children}</main>
      </div>
    </div>
  )
}
