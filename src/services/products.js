import { supabase } from '../lib/supabase'

/**
 * Helper function to enrich products with category data when using category_ids array
 * @param {Array} products - Array of products
 * @returns {Promise<Array>} - Products with enriched category data
 */
async function enrichProductsWithCategories(products) {
  if (!products || products.length === 0) return products

  // Collect all unique category IDs from all products
  const categoryIds = new Set()
  products.forEach(product => {
    if (product.category_ids && Array.isArray(product.category_ids)) {
      product.category_ids.forEach(id => categoryIds.add(id))
    }
  })

  if (categoryIds.size === 0) return products

  // Fetch all categories at once
  const { data: categories, error } = await supabase
    .from('online_categories')
    .select('id, name, slug')
    .in('id', Array.from(categoryIds))

  if (error || !categories) return products

  // Create a lookup map
  const categoryMap = {}
  categories.forEach(cat => {
    categoryMap[cat.id] = cat
  })

  // Enrich products with category data
  return products.map(product => {
    if (product.category_ids && Array.isArray(product.category_ids)) {
      // For multi-category products, attach an array of categories
      const productCategories = product.category_ids
        .map(id => categoryMap[id])
        .filter(Boolean)

      return {
        ...product,
        categories: productCategories,
        // Also set 'category' to first category for backward compatibility
        category: productCategories[0] || product.category
      }
    }
    return product
  })
}

export async function getProducts(filters = {}) {
  try {
    let query = supabase
      .from('online_products')
      .select('*, category:online_categories(name, slug)')
      .eq('is_active', true)

    if (filters.categoryId) {
      // Support both old single category and new multi-category
      query = query.or(`category_id.eq.${filters.categoryId},category_ids.cs.["${filters.categoryId}"]`)
    }

    if (filters.categorySlug) {
      const { data: category } = await supabase
        .from('online_categories')
        .select('id')
        .eq('slug', filters.categorySlug)
        .single()

      if (category) {
        // Support both old single category and new multi-category
        query = query.or(`category_id.eq.${category.id},category_ids.cs.["${category.id}"]`)
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

    // Enrich products with categories if using category_ids array
    let products = await enrichProductsWithCategories(data)

    // Calculate discount percentage and sort by discount if needed
    products = products.map(product => ({
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

    // Enrich with categories if using category_ids array
    const enriched = await enrichProductsWithCategories([data])
    return enriched[0]
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

/**
 * Check if a product is available for purchase
 * @param {string} productId - Product ID
 * @param {string} size - Selected size
 * @param {number} quantity - Desired quantity
 * @returns {Promise<{available: boolean, message: string, product: Object}>}
 */
export async function checkProductAvailability(productId, size, quantity = 1) {
  try {
    const { data: product, error } = await supabase
      .from('online_products')
      .select('*, category:online_categories(name, slug)')
      .eq('id', productId)
      .single()

    if (error || !product) {
      return {
        available: false,
        message: 'Product not found',
        product: null
      }
    }

    // Check if product is active
    if (!product.is_active) {
      return {
        available: false,
        message: 'This product is no longer available',
        product
      }
    }

    // Check stock quantity
    if (product.stock_quantity === 0) {
      return {
        available: false,
        message: 'This product is out of stock',
        product
      }
    }

    if (product.stock_quantity < quantity) {
      return {
        available: false,
        message: `Only ${product.stock_quantity} items left in stock`,
        product
      }
    }

    // Check if size is valid for this product
    // Note: sizes field should be an array in the database
    if (size && product.sizes && Array.isArray(product.sizes)) {
      const sizeAvailable = product.sizes.some(s => {
        // Handle both string sizes and object sizes
        if (typeof s === 'string') {
          return s === size
        }
        return s.value === size || s.name === size
      })

      if (!sizeAvailable) {
        return {
          available: false,
          message: `Size ${size} is not available for this product`,
          product
        }
      }
    }

    return {
      available: true,
      message: 'Product is available',
      product
    }
  } catch (error) {
    console.error('Error checking product availability:', error)
    return {
      available: false,
      message: 'Error checking availability',
      product: null
    }
  }
}

/**
 * Batch check availability for multiple cart items
 * @param {Array} items - Array of {productId, size, quantity}
 * @returns {Promise<Array>} - Array of availability results
 */
export async function checkCartItemsAvailability(items) {
  try {
    const results = await Promise.all(
      items.map(item =>
        checkProductAvailability(item.id || item.productId, item.selectedSize || item.size, item.quantity)
      )
    )
    return results
  } catch (error) {
    console.error('Error checking cart items availability:', error)
    throw error
  }
}
