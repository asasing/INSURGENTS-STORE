/**
 * Size conversion utilities for shoes
 * Reference: Standard international shoe size conversion
 */

// Complete size conversion table
export const SIZE_CONVERSION_TABLE = {
  // EU -> US Men, US Women, Kids
  35: { EU: 35, US_MEN: 3, US_WOMEN: 5, KIDS: null },
  36: { EU: 36, US_MEN: 4, US_WOMEN: 6, KIDS: null },
  37: { EU: 37, US_MEN: 5, US_WOMEN: 7, KIDS: null },
  38: { EU: 38, US_MEN: 6, US_WOMEN: 8, KIDS: null },
  39: { EU: 39, US_MEN: 7, US_WOMEN: 9, KIDS: null },
  40: { EU: 40, US_MEN: 8, US_WOMEN: 10, KIDS: null },
  41: { EU: 41, US_MEN: 9, US_WOMEN: 11, KIDS: null },
  42: { EU: 42, US_MEN: 10, US_WOMEN: 12, KIDS: null },
  43: { EU: 43, US_MEN: 11, US_WOMEN: 13, KIDS: null },
  44: { EU: 44, US_MEN: 12, US_WOMEN: 14, KIDS: null },
  45: { EU: 45, US_MEN: 13, US_WOMEN: 15, KIDS: null },
  46: { EU: 46, US_MEN: 14, US_WOMEN: 16, KIDS: null },
  47: { EU: 47, US_MEN: 15, US_WOMEN: 17, KIDS: null },
  48: { EU: 48, US_MEN: 16, US_WOMEN: 18, KIDS: null },

  // Kids sizes (EU 24-34)
  24: { EU: 24, US_MEN: null, US_WOMEN: null, KIDS: 7.5 },
  25: { EU: 25, US_MEN: null, US_WOMEN: null, KIDS: 8 },
  26: { EU: 26, US_MEN: null, US_WOMEN: null, KIDS: 9 },
  27: { EU: 27, US_MEN: null, US_WOMEN: null, KIDS: 10 },
  28: { EU: 28, US_MEN: null, US_WOMEN: null, KIDS: 11 },
  29: { EU: 29, US_MEN: null, US_WOMEN: null, KIDS: 11.5 },
  30: { EU: 30, US_MEN: null, US_WOMEN: null, KIDS: 12 },
  31: { EU: 31, US_MEN: null, US_WOMEN: null, KIDS: 13 },
  32: { EU: 32, US_MEN: null, US_WOMEN: null, KIDS: 1 },
  33: { EU: 33, US_MEN: null, US_WOMEN: null, KIDS: 2 },
  34: { EU: 34, US_MEN: null, US_WOMEN: null, KIDS: 3 }
}

// Available size arrays
export const SHOE_SIZES_EU = [24, 25, 26, 27, 28, 29, 30, 31, 32, 33, 34, 35, 36, 37, 38, 39, 40, 41, 42, 43, 44, 45, 46, 47, 48]
export const SHOE_SIZES_US_MEN = [3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16]
export const SHOE_SIZES_US_WOMEN = [5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18]
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
