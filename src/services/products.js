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

    const { data, error } = await query.order('created_at', { ascending: false })

    if (error) throw error
    return data
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
