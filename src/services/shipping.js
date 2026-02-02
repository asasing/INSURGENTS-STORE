import { supabase } from '../lib/supabase'

// ============================================================================
// SHIPPING ZONE CRUD OPERATIONS
// ============================================================================

/**
 * Get all active shipping zones
 * @returns {Array} Array of shipping zone objects ordered by display_order
 */
export async function getShippingZones() {
  try {
    const { data, error } = await supabase
      .from('online_shipping_zones')
      .select('*')
      .eq('is_active', true)
      .order('display_order', { ascending: true })

    if (error) throw error
    return data
  } catch (error) {
    console.error('Error fetching shipping zones:', error)
    throw error
  }
}

/**
 * Get all shipping zones (including inactive) - for admin use
 * @returns {Array} Array of all shipping zone objects
 */
export async function getAllShippingZones() {
  try {
    const { data, error } = await supabase
      .from('online_shipping_zones')
      .select('*')
      .order('display_order', { ascending: true })

    if (error) throw error
    return data
  } catch (error) {
    console.error('Error fetching all shipping zones:', error)
    throw error
  }
}

/**
 * Get a single shipping zone by ID
 * @param {string} id - Shipping zone ID
 * @returns {Object} Shipping zone object
 */
export async function getShippingZoneById(id) {
  try {
    const { data, error } = await supabase
      .from('online_shipping_zones')
      .select('*')
      .eq('id', id)
      .single()

    if (error) throw error
    return data
  } catch (error) {
    console.error('Error fetching shipping zone:', error)
    throw error
  }
}

/**
 * Calculate shipping fee based on city name
 * Uses fuzzy matching to handle spelling variations
 * @param {string} city - City name from checkout form
 * @param {boolean} hasFreeShippingPromo - Whether a free shipping promo is applied
 * @returns {Object} Object with fee (number) and zone (object or null)
 */
export async function calculateShippingFee(city, hasFreeShippingPromo = false) {
  // Free shipping promo overrides everything
  if (hasFreeShippingPromo) {
    return { fee: 0, zone: null, message: 'Free shipping promo applied' }
  }

  if (!city || city.trim().length === 0) {
    return { fee: 200, zone: null, message: 'City not specified' }
  }

  try {
    const zones = await getShippingZones()

    // Normalize city name for comparison
    const normalizedCity = city.trim().toLowerCase()

    // Check each zone in order
    for (const zone of zones) {
      const isMatch = zone.cities.some(zoneCity => {
        const normalizedZoneCity = zoneCity.toLowerCase()
        // Check if city contains zone city or vice versa
        return (
          normalizedCity.includes(normalizedZoneCity) ||
          normalizedZoneCity.includes(normalizedCity)
        )
      })

      if (isMatch) {
        return {
          fee: zone.shipping_fee,
          zone: zone,
          message: `${zone.name} - ₱${zone.shipping_fee}`
        }
      }
    }

    // No match found - default to highest shipping fee (last zone)
    const defaultZone = zones[zones.length - 1]
    return {
      fee: defaultZone?.shipping_fee || 200,
      zone: defaultZone,
      message: defaultZone ? `${defaultZone.name} - ₱${defaultZone.shipping_fee}` : 'Default shipping fee'
    }
  } catch (error) {
    console.error('Error calculating shipping fee:', error)
    // Return default fallback on error
    return { fee: 200, zone: null, message: 'Default shipping fee (error)' }
  }
}

/**
 * Create a new shipping zone
 * @param {Object} zoneData - Shipping zone data
 * @param {string} zoneData.name - Zone name
 * @param {Array<string>} zoneData.cities - Array of city names
 * @param {number} zoneData.shipping_fee - Shipping fee amount
 * @param {number} zoneData.display_order - Display order (optional, default 0)
 * @param {boolean} zoneData.is_active - Active status (optional, default true)
 * @returns {Object} Created shipping zone object
 */
export async function createShippingZone(zoneData) {
  try {
    const { data, error } = await supabase
      .from('online_shipping_zones')
      .insert(zoneData)
      .select()
      .single()

    if (error) throw error
    return data
  } catch (error) {
    console.error('Error creating shipping zone:', error)
    throw error
  }
}

/**
 * Update an existing shipping zone
 * @param {string} id - Shipping zone ID
 * @param {Object} zoneData - Updated shipping zone data
 * @returns {Object} Updated shipping zone object
 */
export async function updateShippingZone(id, zoneData) {
  try {
    const { data, error } = await supabase
      .from('online_shipping_zones')
      .update({
        ...zoneData,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select()
      .single()

    if (error) throw error
    return data
  } catch (error) {
    console.error('Error updating shipping zone:', error)
    throw error
  }
}

/**
 * Delete a shipping zone
 * @param {string} id - Shipping zone ID
 * @returns {void}
 */
export async function deleteShippingZone(id) {
  try {
    const { error } = await supabase
      .from('online_shipping_zones')
      .delete()
      .eq('id', id)

    if (error) throw error
  } catch (error) {
    console.error('Error deleting shipping zone:', error)
    throw error
  }
}
