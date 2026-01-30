import { Link } from 'react-router-dom'
import { Package, ShoppingCart, MessageSquare, Timer } from 'lucide-react'
import Card from '../../components/common/Card'

export default function Dashboard() {
  const stats = [
    {
      title: 'Total Products',
      value: '0',
      icon: Package,
      link: '/admin/inventory',
      color: 'text-blue-600 dark:text-blue-400'
    },
    {
      title: 'Orders',
      value: '0',
      icon: ShoppingCart,
      link: '/admin/orders',
      color: 'text-green-600 dark:text-green-400'
    },
    {
      title: 'Testimonials',
      value: '8',
      icon: MessageSquare,
      link: '/admin/testimonials',
      color: 'text-purple-600 dark:text-purple-400'
    },
    {
      title: 'Active Sales',
      value: '1',
      icon: Timer,
      link: '/admin/sales',
      color: 'text-orange-600 dark:text-orange-400'
    }
  ]

  return (
    <div>
      <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-8">
        Dashboard
      </h1>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {stats.map((stat) => {
          const Icon = stat.icon
          return (
            <Link key={stat.title} to={stat.link}>
              <Card className="hover:shadow-lg transition-shadow cursor-pointer">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">
                      {stat.title}
                    </p>
                    <p className="text-3xl font-bold text-gray-900 dark:text-white">
                      {stat.value}
                    </p>
                  </div>
                  <div className={`p-3 rounded-lg bg-gray-100 dark:bg-gray-700 ${stat.color}`}>
                    <Icon className="w-8 h-8" />
                  </div>
                </div>
              </Card>
            </Link>
          )
        })}
      </div>

      <Card>
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
          Quick Actions
        </h2>
        <div className="space-y-2">
          <Link
            to="/admin/inventory"
            className="block p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
          >
            <span className="font-medium text-gray-900 dark:text-white">
              Manage Inventory
            </span>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Add, edit, or remove products
            </p>
          </Link>
          <Link
            to="/admin/sales"
            className="block p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
          >
            <span className="font-medium text-gray-900 dark:text-white">
              Configure Sales
            </span>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Set up sale timers and promotions
            </p>
          </Link>
          <Link
            to="/admin/testimonials"
            className="block p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
          >
            <span className="font-medium text-gray-900 dark:text-white">
              Moderate Testimonials
            </span>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Approve or reject customer reviews
            </p>
          </Link>
        </div>
      </Card>
    </div>
  )
}
