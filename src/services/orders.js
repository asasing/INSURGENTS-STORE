import { supabase } from '../lib/supabase'

export async function createOrder(orderData) {
  try {
    const { data, error } = await supabase
      .from('online_orders')
      .insert({
        customer_email: orderData.customerEmail,
        customer_name: orderData.customerName,
        customer_phone: orderData.customerPhone,
        items: orderData.items,
        total: orderData.total,
        shipping_address: orderData.shippingAddress,
        status: 'pending'
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
