import { supabase } from '../lib/supabase'

// ============================================================================
// PROMO CODE CRUD OPERATIONS
// ============================================================================

/**
 * Get all promo codes with optional filtering
 * @param {Object} filters - Optional filters
 * @param {boolean} filters.activeOnly - Only return active promo codes within date range
 * @returns {Array} Array of promo code objects
 */
export async function getPromoCodes(filters = {}) {
  try {
    let query = supabase
      .from('online_promo_codes')
      .select('*')
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
    return data
  } catch (error) {
    console.error('Error fetching promo codes:', error)
    throw error
  }
}

/**
 * Get a single promo code by ID
 * @param {string} id - Promo code ID
 * @returns {Object} Promo code object
 */
export async function getPromoCodeById(id) {
  try {
    const { data, error } = await supabase
      .from('online_promo_codes')
      .select('*')
      .eq('id', id)
      .single()

    if (error) throw error
    return data
  } catch (error) {
    console.error('Error fetching promo code:', error)
    throw error
  }
}

/**
 * Validate a promo code and check eligibility
 * @param {string} code - Promo code string (case-insensitive)
 * @param {number} orderTotal - Current order subtotal
 * @returns {Object} Validation result with valid flag, message, and promoCode data
 */
export async function validatePromoCode(code, orderTotal) {
  try {
    const now = new Date().toISOString()

    // Query for the promo code (case-insensitive)
    const { data, error } = await supabase
      .from('online_promo_codes')
      .select('*')
      .ilike('code', code)
      .single()

    if (error) {
      if (error.code === 'PGRST116') {
        return { valid: false, message: 'Invalid or expired promo code' }
      }
      throw error
    }

    // Check if active
    if (!data.is_active) {
      return { valid: false, message: 'This promo code is no longer active' }
    }

    // Check date range
    if (new Date(data.start_date) > new Date(now)) {
      return { valid: false, message: 'This promo code is not yet active' }
    }

    if (new Date(data.end_date) < new Date(now)) {
      return { valid: false, message: 'This promo code has expired' }
    }

    // Check usage limit
    if (data.usage_limit !== null && data.times_used >= data.usage_limit) {
      return { valid: false, message: 'This promo code has reached its usage limit' }
    }

    // Check minimum order amount
    if (orderTotal < data.min_order_amount) {
      return {
        valid: false,
        message: `Minimum order amount of ₱${data.min_order_amount.toFixed(2)} required`
      }
    }

    // All checks passed
    return { valid: true, promoCode: data }
  } catch (error) {
    console.error('Error validating promo code:', error)
    return { valid: false, message: 'Error validating promo code' }
  }
}

/**
 * Calculate discount amount from promo code
 * @param {Object} promoCode - Promo code object
 * @param {number} subtotal - Order subtotal
 * @returns {number} Discount amount
 */
export function calculatePromoDiscount(promoCode, subtotal) {
  if (!promoCode) return 0

  if (promoCode.discount_type === 'percentage') {
    return (subtotal * promoCode.discount_value) / 100
  } else if (promoCode.discount_type === 'fixed_amount') {
    // Don't exceed subtotal
    return Math.min(promoCode.discount_value, subtotal)
  } else if (promoCode.discount_type === 'free_shipping') {
    return 0 // Handled separately in shipping calculation
  }

  return 0
}

/**
 * Increment promo code usage counter
 * @param {string} code - Promo code string
 * @returns {void}
 */
export async function incrementPromoCodeUsage(code) {
  try {
    const { error } = await supabase
      .from('online_promo_codes')
      .update({
        times_used: supabase.sql`times_used + 1`,
        updated_at: new Date().toISOString()
      })
      .ilike('code', code)

    if (error) throw error
  } catch (error) {
    console.error('Error incrementing promo code usage:', error)
    // Don't throw - this is not critical to order flow
  }
}

/**
 * Create a new promo code
 * @param {Object} promoData - Promo code data
 * @param {string} promoData.code - Promo code (will be converted to uppercase)
 * @param {string} promoData.description - Description (optional)
 * @param {string} promoData.discount_type - 'percentage', 'fixed_amount', or 'free_shipping'
 * @param {number} promoData.discount_value - Discount value (null for free_shipping)
 * @param {number} promoData.min_order_amount - Minimum order amount (default 0)
 * @param {string} promoData.start_date - Start date ISO string
 * @param {string} promoData.end_date - End date ISO string
 * @param {number} promoData.usage_limit - Usage limit (null for unlimited)
 * @param {boolean} promoData.is_active - Active status (default true)
 * @returns {Object} Created promo code object
 */
export async function createPromoCode(promoData) {
  try {
    const { data, error } = await supabase
      .from('online_promo_codes')
      .insert({
        ...promoData,
        code: promoData.code.toUpperCase(), // Always store uppercase
        times_used: 0 // Initialize usage counter
      })
      .select()
      .single()

    if (error) {
      // Check for unique constraint violation
      if (error.code === '23505') {
        throw new Error('A promo code with this code already exists')
      }
      throw error
    }

    return data
  } catch (error) {
    console.error('Error creating promo code:', error)
    throw error
  }
}

/**
 * Update an existing promo code
 * @param {string} id - Promo code ID
 * @param {Object} promoData - Updated promo code data
 * @returns {Object} Updated promo code object
 */
export async function updatePromoCode(id, promoData) {
  try {
    const updateData = {
      ...promoData,
      updated_at: new Date().toISOString()
    }

    // Convert code to uppercase if provided
    if (updateData.code) {
      updateData.code = updateData.code.toUpperCase()
    }

    const { data, error } = await supabase
      .from('online_promo_codes')
      .update(updateData)
      .eq('id', id)
      .select()
      .single()

    if (error) {
      // Check for unique constraint violation
      if (error.code === '23505') {
        throw new Error('A promo code with this code already exists')
      }
      throw error
    }

    return data
  } catch (error) {
    console.error('Error updating promo code:', error)
    throw error
  }
}

/**
 * Delete a promo code
 * @param {string} id - Promo code ID
 * @returns {void}
 */
export async function deletePromoCode(id) {
  try {
    const { error } = await supabase
      .from('online_promo_codes')
      .delete()
      .eq('id', id)

    if (error) throw error
  } catch (error) {
    console.error('Error deleting promo code:', error)
    throw error
  }
}
