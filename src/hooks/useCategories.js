import { useQuery } from '@tanstack/react-query'
import { getCategories, getCategoryBySlug } from '../services/categories'

export function useCategories() {
  return useQuery({
    queryKey: ['categories'],
    queryFn: getCategories
  })
}

export function useCategory(slug) {
  return useQuery({
    queryKey: ['category', slug],
    queryFn: () => getCategoryBySlug(slug),
    enabled: !!slug
  })
}
