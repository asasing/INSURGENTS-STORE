import { Link, useLocation } from 'react-router-dom'
import { cn } from '../../lib/utils'
import { useCategories } from '../../hooks/useCategories'

export default function Navigation({ mobile = false, onItemClick }) {
  const location = useLocation()
  const { data: categories } = useCategories()

  const linkClasses = (slug) =>
    cn(
      'px-4 py-2 rounded-lg font-medium transition-colors',
      location.pathname === `/category/${slug}`
        ? 'bg-black text-white dark:bg-white dark:text-black'
        : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'
    )

  // Special menu items
  const specialItems = [
    { slug: 'all-items', name: 'All Items' },
    { slug: 'new-arrivals', name: 'New Arrivals' }
  ]

  return (
    <nav className={mobile ? 'flex flex-col space-y-2' : 'hidden lg:flex lg:space-x-2'}>
      {/* Special items first */}
      {specialItems.map((item) => (
        <Link
          key={item.slug}
          to={`/category/${item.slug}`}
          className={linkClasses(item.slug)}
          onClick={onItemClick}
        >
          {item.name}
        </Link>
      ))}

      {/* Regular categories */}
      {categories?.map((category) => (
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
