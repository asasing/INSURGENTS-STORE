import { Link, useLocation } from 'react-router-dom'
import { cn } from '../../lib/utils'

const categories = [
  { name: 'Top Selling', slug: 'top-selling' },
  { name: 'Apparels', slug: 'apparels' },
  { name: 'Running', slug: 'running' },
  { name: 'Basketball', slug: 'basketball' },
  { name: 'Casual', slug: 'casual' },
  { name: 'On Sale', slug: 'on-sale' }
]

export default function Navigation({ mobile = false, onItemClick }) {
  const location = useLocation()

  const linkClasses = (slug) =>
    cn(
      'px-4 py-2 rounded-lg font-medium transition-colors',
      location.pathname === `/category/${slug}`
        ? 'bg-blue-600 text-white dark:bg-blue-500'
        : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'
    )

  return (
    <nav className={mobile ? 'flex flex-col space-y-2' : 'hidden lg:flex lg:space-x-2'}>
      {categories.map((category) => (
        <Link
          key={category.slug}
          to={`/category/${category.slug}`}
          className={linkClasses(category.slug)}
          onClick={onItemClick}
        >
          {category.name}
        </Link>
      ))}
    </nav>
  )
}
