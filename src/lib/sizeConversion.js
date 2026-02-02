/**
 * Size conversion utilities for shoes
 * Reference: Standard international shoe size conversion (Nike/Adidas)
 * Measurements based on foot length in centimeters
 */

// Complete size conversion table (Based on Nike/Adidas standard sizing)
// Includes foot length measurements in cm (for size chart display)
export const SIZE_CONVERSION_TABLE = {
  // EU -> US Men, US Women, Kids, Foot Length (cm)
  35: { EU: 35, US_MEN: 3.5, US_WOMEN: 5, KIDS: null, FOOT_LENGTH_CM: 22.5 },
  35.5: { EU: 35.5, US_MEN: 4, US_WOMEN: 5.5, KIDS: null, FOOT_LENGTH_CM: 22.8 },
  36: { EU: 36, US_MEN: 4.5, US_WOMEN: 6, KIDS: null, FOOT_LENGTH_CM: 23.0 },
  36.5: { EU: 36.5, US_MEN: 5, US_WOMEN: 6.5, KIDS: null, FOOT_LENGTH_CM: 23.3 },
  37: { EU: 37, US_MEN: 5, US_WOMEN: 6.5, KIDS: null, FOOT_LENGTH_CM: 23.5 },
  37.5: { EU: 37.5, US_MEN: 5.5, US_WOMEN: 7, KIDS: null, FOOT_LENGTH_CM: 23.8 },
  38: { EU: 38, US_MEN: 5.5, US_WOMEN: 7.5, KIDS: null, FOOT_LENGTH_CM: 24.0 },
  38.5: { EU: 38.5, US_MEN: 6, US_WOMEN: 8, KIDS: null, FOOT_LENGTH_CM: 24.3 },
  39: { EU: 39, US_MEN: 6.5, US_WOMEN: 8.5, KIDS: null, FOOT_LENGTH_CM: 24.5 },
  40: { EU: 40, US_MEN: 7, US_WOMEN: 9, KIDS: null, FOOT_LENGTH_CM: 25.0 },
  40.5: { EU: 40.5, US_MEN: 7.5, US_WOMEN: 9.5, KIDS: null, FOOT_LENGTH_CM: 25.3 },
  41: { EU: 41, US_MEN: 8, US_WOMEN: 10, KIDS: null, FOOT_LENGTH_CM: 26.0 },
  42: { EU: 42, US_MEN: 8.5, US_WOMEN: 10.5, KIDS: null, FOOT_LENGTH_CM: 26.5 },
  42.5: { EU: 42.5, US_MEN: 9, US_WOMEN: 11, KIDS: null, FOOT_LENGTH_CM: 26.8 },
  43: { EU: 43, US_MEN: 9.5, US_WOMEN: 11.5, KIDS: null, FOOT_LENGTH_CM: 27.0 },
  44: { EU: 44, US_MEN: 10, US_WOMEN: 12, KIDS: null, FOOT_LENGTH_CM: 27.5 },
  44.5: { EU: 44.5, US_MEN: 10.5, US_WOMEN: 12.5, KIDS: null, FOOT_LENGTH_CM: 28.0 },
  45: { EU: 45, US_MEN: 11, US_WOMEN: 13, KIDS: null, FOOT_LENGTH_CM: 28.5 },
  45.5: { EU: 45.5, US_MEN: 11.5, US_WOMEN: 13.5, KIDS: null, FOOT_LENGTH_CM: 29.0 },
  46: { EU: 46, US_MEN: 12, US_WOMEN: 14, KIDS: null, FOOT_LENGTH_CM: 29.5 },
  47: { EU: 47, US_MEN: 13, US_WOMEN: 15, KIDS: null, FOOT_LENGTH_CM: 30.0 },
  47.5: { EU: 47.5, US_MEN: 13.5, US_WOMEN: 15.5, KIDS: null, FOOT_LENGTH_CM: 30.5 },
  48: { EU: 48, US_MEN: 14, US_WOMEN: 16, KIDS: null, FOOT_LENGTH_CM: 31.0 },
  48.5: { EU: 48.5, US_MEN: 14.5, US_WOMEN: 16.5, KIDS: null, FOOT_LENGTH_CM: 31.5 },
  49: { EU: 49, US_MEN: 15, US_WOMEN: 17, KIDS: null, FOOT_LENGTH_CM: 32.0 },

  // Kids sizes (EU 24-34)
  24: { EU: 24, US_MEN: null, US_WOMEN: null, KIDS: 7.5, FOOT_LENGTH_CM: 15.0 },
  25: { EU: 25, US_MEN: null, US_WOMEN: null, KIDS: 8, FOOT_LENGTH_CM: 15.5 },
  26: { EU: 26, US_MEN: null, US_WOMEN: null, KIDS: 9, FOOT_LENGTH_CM: 16.5 },
  27: { EU: 27, US_MEN: null, US_WOMEN: null, KIDS: 10, FOOT_LENGTH_CM: 17.0 },
  28: { EU: 28, US_MEN: null, US_WOMEN: null, KIDS: 11, FOOT_LENGTH_CM: 17.5 },
  29: { EU: 29, US_MEN: null, US_WOMEN: null, KIDS: 11.5, FOOT_LENGTH_CM: 18.0 },
  30: { EU: 30, US_MEN: null, US_WOMEN: null, KIDS: 12, FOOT_LENGTH_CM: 18.5 },
  31: { EU: 31, US_MEN: null, US_WOMEN: null, KIDS: 13, FOOT_LENGTH_CM: 19.5 },
  32: { EU: 32, US_MEN: null, US_WOMEN: null, KIDS: 1, FOOT_LENGTH_CM: 20.0 },
  33: { EU: 33, US_MEN: null, US_WOMEN: null, KIDS: 2, FOOT_LENGTH_CM: 20.5 },
  34: { EU: 34, US_MEN: null, US_WOMEN: null, KIDS: 3, FOOT_LENGTH_CM: 21.5 }
}

// Available size arrays (including half sizes)
export const SHOE_SIZES_EU = [24, 25, 26, 27, 28, 29, 30, 31, 32, 33, 34, 35, 35.5, 36, 36.5, 37, 37.5, 38, 38.5, 39, 40, 40.5, 41, 42, 42.5, 43, 44, 44.5, 45, 45.5, 46, 47, 47.5, 48, 48.5, 49]
export const SHOE_SIZES_US_MEN = [3.5, 4, 4.5, 5, 5.5, 6, 6.5, 7, 7.5, 8, 8.5, 9, 9.5, 10, 10.5, 11, 11.5, 12, 13, 13.5, 14, 14.5, 15]
export const SHOE_SIZES_US_WOMEN = [5, 5.5, 6, 6.5, 7, 7.5, 8, 8.5, 9, 9.5, 10, 10.5, 11, 11.5, 12, 12.5, 13, 13.5, 14, 15, 15.5, 16, 16.5, 17]
export const SHOE_SIZES_KIDS = [7.5, 8, 9, 10, 11, 11.5, 12, 13, 1, 2, 3]

export const APPAREL_SIZES = ['XS', 'S', 'M', 'L', 'XL', 'XXL', '3XL', 'Free Size']

/**
 * Convert any size type to EU size (which is what we store in database)
 * @param {string|number} size - The size value
 * @param {string} type - The size type: 'EU', 'US_MEN', 'US_WOMEN', 'KIDS'
 * @returns {number|null} - The EU size or null if not found
 */
export function convertToEU(size, type) {
  if (type === 'EU') return parseInt(size)

  const numSize = parseFloat(size)

  // Find the conversion
  for (const [eu, conversions] of Object.entries(SIZE_CONVERSION_TABLE)) {
    if (conversions[type] === numSize) {
      return parseInt(eu)
    }
  }

  return null
}

/**
 * Convert EU size to any other size type
 * @param {number} euSize - The EU size
 * @param {string} targetType - Target size type: 'US_MEN', 'US_WOMEN', 'KIDS'
 * @returns {number|null} - The converted size or null
 */
export function convertFromEU(euSize, targetType) {
  const conversion = SIZE_CONVERSION_TABLE[euSize]
  return conversion ? conversion[targetType] : null
}

/**
 * Get all available sizes in a specific type based on product's EU sizes
 * @param {Array} productSizes - Product's available sizes (in EU)
 * @param {string} sizeType - Target size type
 * @returns {Array} - Available sizes in target type
 */
export function getAvailableSizesInType(productSizes, sizeType) {
  if (!productSizes || !Array.isArray(productSizes)) return []

  // Extract EU sizes from product
  const euSizes = productSizes.map(s => {
    if (typeof s === 'string') return parseInt(s)
    if (typeof s === 'object') return parseInt(s.size || s.value || s.name)
    return s
  }).filter(Boolean)

  if (sizeType === 'EU') return euSizes

  // Convert to target type
  return euSizes
    .map(euSize => convertFromEU(euSize, sizeType))
    .filter(size => size !== null)
}

/**
 * Check if a size is available (with conversion support)
 * @param {Array} productSizes - Product's available sizes (stored in EU)
 * @param {string|number} size - Size to check
 * @param {string} sizeType - Size type of the size being checked
 * @returns {boolean} - True if available
 */
export function isSizeAvailable(productSizes, size, sizeType = 'EU') {
  if (!productSizes || !Array.isArray(productSizes)) return false

  // Convert the requested size to EU
  const euSize = convertToEU(size, sizeType)
  if (!euSize) return false

  // Check if EU size exists in product
  return productSizes.some(s => {
    if (typeof s === 'string') return parseInt(s) === euSize
    if (typeof s === 'object') {
      const sizeValue = parseInt(s.size || s.value || s.name)
      // Check stock if available
      if ('stock' in s) {
        return sizeValue === euSize && s.stock > 0
      }
      return sizeValue === euSize
    }
    return s === euSize
  })
}

/**
 * Format size for display
 * @param {string|number} size - The size value
 * @param {string} type - The size type
 * @returns {string} - Formatted size string
 */
export function formatSizeDisplay(size, type) {
  if (type === 'EU') return `EU ${size}`
  if (type === 'US_MEN') return `US ${size} (Men)`
  if (type === 'US_WOMEN') return `US ${size} (Women)`
  if (type === 'KIDS') return `US ${size} (Kids)`
  return size.toString()
}
