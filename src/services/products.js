import { supabase } from '../lib/supabase'

export async function getProducts(filters = {}) {
  try {
    let query = supabase
      .from('online_products')
      .select('*, category:online_categories(name, slug)')
      .eq('is_active', true)

    if (filters.categoryId) {
      query = query.eq('category_id', filters.categoryId)
    }

    if (filters.categorySlug) {
      const { data: category } = await supabase
        .from('online_categories')
        .select('id')
        .eq('slug', filters.categorySlug)
        .single()

      if (category) {
        query = query.eq('category_id', category.id)
      }
    }

    if (filters.search) {
      query = query.ilike('name', `%${filters.search}%`)
    }

    if (filters.onSale) {
      query = query.not('sale_price', 'is', null)
    }

    if (filters.featured) {
      query = query.eq('is_featured', true)
    }

    // Apply sorting
    const sortBy = filters.sortBy || 'latest'

    if (sortBy === 'latest') {
      query = query.order('created_at', { ascending: false })
    } else if (sortBy === 'name') {
      query = query.order('name', { ascending: true })
    } else if (sortBy === 'price-low') {
      // Sort by sale_price if exists, otherwise price
      query = query.order('price', { ascending: true })
    } else if (sortBy === 'price-high') {
      query = query.order('price', { ascending: false })
    }

    // Apply limit if specified (for new arrivals)
    if (filters.limit) {
      query = query.limit(filters.limit)
    }

    const { data, error } = await query

    if (error) throw error

    // Calculate discount percentage and sort by discount if needed
    let products = data.map(product => ({
      ...product,
      discountPercent: product.sale_price
        ? Math.round(((product.price - product.sale_price) / product.price) * 100)
        : 0
    }))

    // Client-side sorting for discount (can't do in SQL easily)
    if (sortBy === 'discount') {
      products = products.sort((a, b) => b.discountPercent - a.discountPercent)
    }

    // For price sorting, use sale_price if available
    if (sortBy === 'price-low' || sortBy === 'price-high') {
      products = products.sort((a, b) => {
        const priceA = a.sale_price || a.price
        const priceB = b.sale_price || b.price
        return sortBy === 'price-low' ? priceA - priceB : priceB - priceA
      })
    }

    return products
  } catch (error) {
    console.error('Error fetching products:', error)
    throw error
  }
}

export async function getProductById(id) {
  try {
    const { data, error } = await supabase
      .from('online_products')
      .select('*, category:online_categories(name, slug)')
      .eq('id', id)
      .single()

    if (error) throw error
    return data
  } catch (error) {
    console.error('Error fetching product:', error)
    throw error
  }
}

export async function createProduct(productData) {
  try {
    const { data, error } = await supabase
      .from('online_products')
      .insert(productData)
      .select()
      .single()

    if (error) throw error
    return data
  } catch (error) {
    console.error('Error creating product:', error)
    throw error
  }
}

export async function updateProduct(id, productData) {
  try {
    const { data, error } = await supabase
      .from('online_products')
      .update(productData)
      .eq('id', id)
      .select()
      .single()

    if (error) throw error
    return data
  } catch (error) {
    console.error('Error updating product:', error)
    throw error
  }
}

export async function deleteProduct(id) {
  try {
    const { error } = await supabase.from('online_products').delete().eq('id', id)

    if (error) throw error
  } catch (error) {
    console.error('Error deleting product:', error)
    throw error
  }
}
