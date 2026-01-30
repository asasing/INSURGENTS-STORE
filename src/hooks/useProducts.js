import { useQuery } from '@tanstack/react-query'
import { getProducts, getProductById } from '../services/products'

export function useProducts(filters = {}) {
  return useQuery({
    queryKey: ['products', filters],
    queryFn: () => getProducts(filters)
  })
}

export function useProduct(id) {
  return useQuery({
    queryKey: ['product', id],
    queryFn: () => getProductById(id),
    enabled: !!id
  })
}
