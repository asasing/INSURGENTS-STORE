// Maya Checkout API integration
const MAYA_API_BASE = import.meta.env.VITE_MAYA_API_BASE || 'https://pg-sandbox.paymaya.com'

/**
 * Create a Maya checkout session
 * @param {Object} checkoutData - The checkout data
 * @param {number} checkoutData.totalAmount - Total amount in PHP
 * @param {string} checkoutData.requestReferenceNumber - Unique order reference
 * @param {Object} checkoutData.buyer - Buyer information
 * @param {Array} checkoutData.items - Array of items
 * @param {string} checkoutData.redirectUrl - Success redirect URL
 * @returns {Promise<Object>} - Checkout session with redirectUrl
 */
export async function createMayaCheckout(checkoutData) {
  try {
    const publicKey = import.meta.env.VITE_MAYA_PUBLIC_KEY
    const secretKey = import.meta.env.VITE_MAYA_SECRET_KEY

    console.log('🔍 Maya Configuration Check:')
    console.log('  API Base:', MAYA_API_BASE)
    console.log('  Public Key:', publicKey ? `${publicKey.substring(0, 10)}...` : 'MISSING')
    console.log('  Secret Key:', secretKey ? `${secretKey.substring(0, 10)}...` : 'MISSING')

    if (!publicKey || !secretKey) {
      throw new Error('Maya API keys not configured. Please add VITE_MAYA_PUBLIC_KEY and VITE_MAYA_SECRET_KEY to your .env file')
    }

    // Encode credentials for Basic Auth (use secret key for Checkout API)
    const credentials = btoa(`${secretKey}:`)
    console.log('  Encoded Auth:', `${credentials.substring(0, 20)}...`)

    // Prepare checkout payload
    const payload = {
      totalAmount: {
        value: checkoutData.totalAmount,
        currency: 'PHP'
      },
      buyer: {
        firstName: checkoutData.buyer.firstName || '',
        middleName: checkoutData.buyer.middleName || '',
        lastName: checkoutData.buyer.lastName || '',
        contact: {
          phone: checkoutData.buyer.phone || '',
          email: checkoutData.buyer.email || ''
        },
        shippingAddress: checkoutData.buyer.shippingAddress || {}
      },
      items: checkoutData.items.map(item => ({
        name: item.name,
        quantity: item.quantity,
        code: item.code || item.id,
        description: item.description || item.name,
        amount: {
          value: item.amount,
          details: {
            subtotal: item.amount * item.quantity
          }
        },
        totalAmount: {
          value: item.amount * item.quantity,
          details: {
            subtotal: item.amount * item.quantity
          }
        }
      })),
      redirectUrl: {
        success: checkoutData.redirectUrl.success,
        failure: checkoutData.redirectUrl.failure,
        cancel: checkoutData.redirectUrl.cancel
      },
      requestReferenceNumber: checkoutData.requestReferenceNumber,
      metadata: checkoutData.metadata || {}
    }

    // Call Maya Checkout API
    const apiUrl = `${MAYA_API_BASE}/checkout/v1/checkouts`
    console.log('📡 Making request to:', apiUrl)
    console.log('📦 Payload:', JSON.stringify(payload, null, 2))

    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Basic ${credentials}`
      },
      body: JSON.stringify(payload)
    })

    console.log('📬 Response Status:', response.status, response.statusText)

    if (!response.ok) {
      let errorData
      try {
        errorData = await response.json()
      } catch (e) {
        errorData = { message: await response.text() }
      }
      console.error('❌ Maya API Error Response:')
      console.error('   Status:', response.status)
      console.error('   Status Text:', response.statusText)
      console.error('   Error Data:', JSON.stringify(errorData, null, 2))

      throw new Error(errorData.error || errorData.message || 'Failed to create Maya checkout session')
    }

    const data = await response.json()

    return {
      checkoutId: data.checkoutId,
      redirectUrl: data.redirectUrl
    }
  } catch (error) {
    console.error('Error creating Maya checkout:', error)
    throw error
  }
}

/**
 * Get checkout details by ID
 * @param {string} checkoutId - The checkout ID
 * @returns {Promise<Object>} - Checkout details
 */
export async function getMayaCheckoutDetails(checkoutId) {
  try {
    const publicKey = import.meta.env.VITE_MAYA_PUBLIC_KEY
    const credentials = btoa(`${publicKey}:`)

    const response = await fetch(`${MAYA_API_BASE}/checkout/v1/checkouts/${checkoutId}`, {
      method: 'GET',
      headers: {
        'Authorization': `Basic ${credentials}`
      }
    })

    if (!response.ok) {
      throw new Error('Failed to get checkout details')
    }

    return await response.json()
  } catch (error) {
    console.error('Error getting Maya checkout details:', error)
    throw error
  }
}
