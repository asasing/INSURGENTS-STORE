import { supabase } from '../lib/supabase'

// ============================================================================
// DISCOUNT CRUD OPERATIONS
// ============================================================================

/**
 * Get all discounts with optional filtering
 * @param {Object} filters - Optional filters
 * @param {boolean} filters.activeOnly - Only return active discounts within date range
 * @returns {Array} Array of discount objects with product counts
 */
export async function getDiscounts(filters = {}) {
  try {
    let query = supabase
      .from('online_discounts')
      .select('*')
      .order('priority', { ascending: false })
      .order('created_at', { ascending: false })

    if (filters.activeOnly) {
      const now = new Date().toISOString()
      query = query
        .eq('is_active', true)
        .lte('start_date', now)
        .gte('end_date', now)
    }

    const { data, error } = await query
    if (error) throw error

    // Get product counts for each discount
    if (data && data.length > 0) {
      const discountIds = data.map(d => d.id)
      const { data: productCounts, error: countError } = await supabase
        .from('online_discount_products')
        .select('discount_id')
        .in('discount_id', discountIds)

      if (!countError) {
        const countMap = {}
        productCounts.forEach(item => {
          countMap[item.discount_id] = (countMap[item.discount_id] || 0) + 1
        })

        return data.map(discount => ({
          ...discount,
          product_count: discount.application_type === 'manual' ? (countMap[discount.id] || 0) : null
        }))
      }
    }

    return data
  } catch (error) {
    console.error('Error fetching discounts:', error)
    throw error
  }
}

/**
 * Get a single discount by ID with linked products/categories
 * @param {string} id - Discount ID
 * @returns {Object} Discount object with product IDs
 */
export async function getDiscountById(id) {
  try {
    const { data, error } = await supabase
      .from('online_discounts')
      .select('*')
      .eq('id', id)
      .single()

    if (error) throw error

    // Get linked product IDs if manual application
    if (data.application_type === 'manual') {
      const { data: productLinks, error: linkError } = await supabase
        .from('online_discount_products')
        .select('product_id')
        .eq('discount_id', id)

      if (linkError) throw linkError

      data.product_ids = productLinks.map(link => link.product_id)
    }

    return data
  } catch (error) {
    console.error('Error fetching discount:', error)
    throw error
  }
}

/**
 * Create a new discount
 * @param {Object} discountData - Discount data
 * @param {string} discountData.name - Discount name
 * @param {string} discountData.description - Description (optional)
 * @param {string} discountData.discount_type - 'percentage' or 'fixed_amount'
 * @param {number} discountData.discount_value - Discount value
 * @param {string} discountData.application_type - 'manual' or 'category'
 * @param {Array<string>} discountData.product_ids - Product IDs (for manual)
 * @param {Array<string>} discountData.category_ids - Category IDs (for category)
 * @param {string} discountData.start_date - Start date ISO string
 * @param {string} discountData.end_date - End date ISO string
 * @param {number} discountData.priority - Priority (default 0)
 * @param {boolean} discountData.is_active - Active status (default true)
 * @returns {Object} Created discount object
 */
export async function createDiscount(discountData) {
  try {
    const { product_ids, ...discountFields } = discountData

    // Create discount
    const { data: discount, error: discountError } = await supabase
      .from('online_discounts')
      .insert(discountFields)
      .select()
      .single()

    if (discountError) throw discountError

    // Link products if manual application
    if (discount.application_type === 'manual' && product_ids && product_ids.length > 0) {
      const productLinks = product_ids.map(productId => ({
        discount_id: discount.id,
        product_id: productId
      }))

      const { error: linkError } = await supabase
        .from('online_discount_products')
        .insert(productLinks)

      if (linkError) throw linkError
    }

    return discount
  } catch (error) {
    console.error('Error creating discount:', error)
    throw error
  }
}

/**
 * Update an existing discount
 * @param {string} id - Discount ID
 * @param {Object} discountData - Updated discount data
 * @returns {Object} Updated discount object
 */
export async function updateDiscount(id, discountData) {
  try {
    const { product_ids, ...discountFields } = discountData

    // Update discount
    const { data: discount, error: discountError } = await supabase
      .from('online_discounts')
      .update({ ...discountFields, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single()

    if (discountError) throw discountError

    // Update product links if manual application and product_ids provided
    if (discount.application_type === 'manual' && product_ids !== undefined) {
      // Delete existing links
      await supabase
        .from('online_discount_products')
        .delete()
        .eq('discount_id', id)

      // Insert new links
      if (product_ids.length > 0) {
        const productLinks = product_ids.map(productId => ({
          discount_id: id,
          product_id: productId
        }))

        const { error: linkError } = await supabase
          .from('online_discount_products')
          .insert(productLinks)

        if (linkError) throw linkError
      }
    }

    return discount
  } catch (error) {
    console.error('Error updating discount:', error)
    throw error
  }
}

/**
 * Delete a discount
 * @param {string} id - Discount ID
 * @returns {void}
 */
export async function deleteDiscount(id) {
  try {
    // CASCADE will handle online_discount_products deletion
    const { error } = await supabase
      .from('online_discounts')
      .delete()
      .eq('id', id)

    if (error) throw error
  } catch (error) {
    console.error('Error deleting discount:', error)
    throw error
  }
}

// ============================================================================
// DISCOUNT CALCULATION & ENRICHMENT
// ============================================================================

/**
 * Get active discount for a product (both manual and category-based)
 * Returns highest priority active discount
 * @param {string} productId - Product ID
 * @param {Array<string>} categoryIds - Product's category IDs
 * @returns {Object|null} Discount object or null
 */
export async function getProductDiscount(productId, categoryIds = []) {
  try {
    const now = new Date().toISOString()
    const discounts = []

    // 1. Check for manual product-specific discounts
    const { data: manualDiscounts, error: manualError } = await supabase
      .from('online_discount_products')
      .select('discount:online_discounts(*)')
      .eq('product_id', productId)

    if (manualError) throw manualError

    if (manualDiscounts) {
      discounts.push(...manualDiscounts.map(item => item.discount))
    }

    // 2. Check for category-based discounts if product has categories
    if (categoryIds && categoryIds.length > 0) {
      const { data: categoryDiscounts, error: categoryError } = await supabase
        .from('online_discounts')
        .select('*')
        .eq('application_type', 'category')
        .overlaps('category_ids', categoryIds)

      if (categoryError) throw categoryError

      if (categoryDiscounts) {
        discounts.push(...categoryDiscounts)
      }
    }

    // 3. Filter active discounts within date range
    const activeDiscounts = discounts.filter(discount =>
      discount &&
      discount.is_active &&
      new Date(discount.start_date) <= new Date(now) &&
      new Date(discount.end_date) >= new Date(now)
    )

    // 4. Return highest priority discount
    if (activeDiscounts.length === 0) return null

    activeDiscounts.sort((a, b) => b.priority - a.priority)
    return activeDiscounts[0]
  } catch (error) {
    console.error('Error fetching product discount:', error)
    return null
  }
}

/**
 * Calculate discounted price based on discount rules
 * @param {number} originalPrice - Original product price
 * @param {Object} discount - Discount object
 * @returns {number} Calculated sale price
 */
export function calculateDiscountedPrice(originalPrice, discount) {
  if (!discount) return originalPrice

  if (discount.discount_type === 'percentage') {
    const discountAmount = (originalPrice * discount.discount_value) / 100
    return Math.max(0, originalPrice - discountAmount)
  } else if (discount.discount_type === 'fixed_amount') {
    return Math.max(0, originalPrice - discount.discount_value)
  }

  return originalPrice
}

/**
 * Enrich products with active discounts
 * This function adds active_discount and calculated_sale_price to each product
 * @param {Array} products - Array of product objects
 * @returns {Array} Products enriched with discount data
 */
export async function enrichProductsWithDiscounts(products) {
  if (!products || products.length === 0) return products

  try {
    const productIds = products.map(p => p.id)
    const now = new Date().toISOString()

    // Fetch all active manual discounts for these products
    const { data: manualDiscountLinks, error: manualError } = await supabase
      .from('online_discount_products')
      .select('product_id, discount:online_discounts(*)')
      .in('product_id', productIds)

    if (manualError) throw manualError

    // Fetch all active category-based discounts
    const { data: categoryDiscounts, error: categoryError } = await supabase
      .from('online_discounts')
      .select('*')
      .eq('application_type', 'category')
      .eq('is_active', true)
      .lte('start_date', now)
      .gte('end_date', now)

    if (categoryError) throw categoryError

    // Build discount map for each product
    const discountMap = {}

    // Add manual discounts
    manualDiscountLinks?.forEach(link => {
      const discount = link.discount
      if (discount && discount.is_active &&
          new Date(discount.start_date) <= new Date(now) &&
          new Date(discount.end_date) >= new Date(now)) {
        const existing = discountMap[link.product_id]
        if (!existing || discount.priority > existing.priority) {
          discountMap[link.product_id] = discount
        }
      }
    })

    // Add category-based discounts
    products.forEach(product => {
      if (product.category_ids && product.category_ids.length > 0) {
        categoryDiscounts?.forEach(discount => {
          // Check if any of the product's categories match the discount's categories
          const hasMatchingCategory = product.category_ids.some(catId =>
            discount.category_ids?.includes(catId)
          )

          if (hasMatchingCategory) {
            const existing = discountMap[product.id]
            if (!existing || discount.priority > existing.priority) {
              discountMap[product.id] = discount
            }
          }
        })
      }
    })

    // Enrich products
    return products.map(product => {
      const discount = discountMap[product.id]

      if (discount) {
        const calculatedPrice = calculateDiscountedPrice(product.price, discount)
        return {
          ...product,
          active_discount: discount,
          calculated_sale_price: calculatedPrice,
          // Override sale_price with calculated price
          sale_price: calculatedPrice
        }
      }

      // Keep existing sale_price if no active discount (fallback)
      return product
    })
  } catch (error) {
    console.error('Error enriching products with discounts:', error)
    // Return original products on error to avoid breaking the app
    return products
  }
}
