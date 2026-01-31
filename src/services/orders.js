import { supabase } from '../lib/supabase'

export async function createOrder(orderData) {
  try {
    const paymentMethod = orderData.paymentMethod || 'maya'
    const paymentStatus = orderData.paymentStatus || (paymentMethod === 'cod' ? 'pending' : 'pending')
    const { data, error } = await supabase
      .from('online_orders')
      .insert({
        customer_email: orderData.customerEmail,
        customer_name: orderData.customerName,
        customer_phone: orderData.customerPhone,
        items: orderData.items,
        total: orderData.total,
        shipping_address: orderData.shippingAddress,
        status: orderData.status || 'pending',
        payment_method: paymentMethod,
        payment_status: paymentStatus
      })
      .select()
      .single()

    if (error) throw error
    return data
  } catch (error) {
    console.error('Error creating order:', error)
    throw error
  }
}

export async function getOrders() {
  try {
    const { data, error } = await supabase
      .from('online_orders')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) throw error
    return data
  } catch (error) {
    console.error('Error fetching orders:', error)
    throw error
  }
}

export async function getOrderById(id) {
  try {
    const { data, error } = await supabase
      .from('online_orders')
      .select('*')
      .eq('id', id)
      .single()

    if (error) throw error
    return data
  } catch (error) {
    console.error('Error fetching order:', error)
    throw error
  }
}

export async function updateOrderStatus(id, status) {
  try {
    const { data, error } = await supabase
      .from('online_orders')
      .update({ status })
      .eq('id', id)
      .select()
      .single()

    if (error) throw error
    return data
  } catch (error) {
    console.error('Error updating order status:', error)
    throw error
  }
}

export async function updateOrderPaymentStatus(id, payment_status) {
  try {
    const { data, error } = await supabase
      .from('online_orders')
      .update({ payment_status })
      .eq('id', id)
      .select()
      .single()

    if (error) throw error
    return data
  } catch (error) {
    console.error('Error updating order payment status:', error)
    throw error
  }
}

export async function updateOrder(id, updates) {
  try {
    const { data, error } = await supabase
      .from('online_orders')
      .update(updates)
      .eq('id', id)
      .select()
      .single()

    if (error) throw error
    return data
  } catch (error) {
    console.error('Error updating order:', error)
    throw error
  }
}

export async function createMayaCheckoutSession(order) {
  try {
    // Dynamically import to avoid circular dependencies
    const { createMayaCheckout } = await import('./maya')

    const appUrl = window.location.origin

    // Parse customer name into first and last name
    const nameParts = order.customer_name.split(' ')
    const firstName = nameParts[0] || ''
    const lastName = nameParts.slice(1).join(' ') || ''

    // Prepare checkout data
    const checkoutData = {
      totalAmount: order.total,
      requestReferenceNumber: order.id,
      buyer: {
        firstName,
        lastName,
        phone: order.customer_phone,
        email: order.customer_email,
        shippingAddress: order.shipping_address ? {
          line1: order.shipping_address.address,
          city: order.shipping_address.city,
          zipCode: order.shipping_address.postalCode
        } : undefined
      },
      items: order.items.map(item => ({
        name: item.name,
        quantity: item.quantity,
        code: item.id,
        description: item.name,
        amount: item.price
      })),
      redirectUrl: {
        success: `${appUrl}/order-success?order_id=${order.id}&payment_method=maya`,
        failure: `${appUrl}/order-confirmation/${order.id}?status=failed`,
        cancel: `${appUrl}/checkout?status=cancelled`
      },
      metadata: {
        orderId: order.id,
        customerEmail: order.customer_email
      }
    }

    try {
      // Try Maya Checkout API first
      const checkout = await createMayaCheckout(checkoutData)
      return checkout
    } catch (checkoutError) {
      // If K004 error (endpoint not available), fall back to Payment Link
      if (checkoutError.message?.includes('K004') || checkoutError.message?.includes('Invalid endpoint')) {
        console.warn('⚠️ Maya Checkout API not available yet. Falling back to Payment Link.')
        console.warn('💡 Complete your Maya Checkout application setup at https://business.maya.ph/')

        const paymentLink = generateMayaPaymentLink(order)
        if (paymentLink) {
          return {
            checkoutId: null,
            redirectUrl: paymentLink,
            fallbackMode: true
          }
        }
      }
      throw checkoutError
    }
  } catch (error) {
    console.error('Error creating Maya checkout session:', error)
    throw error
  }
}

// Keep the old function for backward compatibility
export function generateMayaPaymentLink(order) {
  const mayaBaseLink = import.meta.env.VITE_MAYA_PAYMENT_LINK

  if (!mayaBaseLink) {
    console.warn('Maya payment link not configured')
    return null
  }

  // Build detailed description with items
  const itemsList = order.items.map(item =>
    `${item.name} (x${item.quantity}) - ₱${(item.price * item.quantity).toFixed(2)}`
  ).join(', ')

  const fullDescription = `Order ${order.id.substring(0, 8)} | Items: ${itemsList} | Total: ₱${order.total.toFixed(2)}`

  // Append order details as URL parameters
  const params = new URLSearchParams({
    amount: order.total.toFixed(2),
    reference: order.id,
    description: fullDescription.substring(0, 500), // Limit length for URL
    customer_name: order.customer_name,
    customer_email: order.customer_email
  })

  return `${mayaBaseLink}?${params.toString()}`
}
