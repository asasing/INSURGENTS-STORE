import { createClient } from '@supabase/supabase-js'

// Initialize Supabase client
const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY // Use service key for server-side operations
)

export default async function handler(req, res) {
  // Only accept POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
    console.log('📥 Maya Webhook received:', JSON.stringify(req.body, null, 2))

    const {
      id: checkoutId,
      status,
      requestReferenceNumber: orderId,
      paymentStatus,
      receipt,
      metadata
    } = req.body

    // Validate required fields
    if (!orderId) {
      console.error('❌ Missing orderId in webhook payload')
      return res.status(400).json({ error: 'Missing orderId' })
    }

    // Map Maya status to our order status
    let orderStatus = 'pending'
    if (status === 'COMPLETED' || paymentStatus === 'PAYMENT_SUCCESS') {
      orderStatus = 'paid'
    } else if (status === 'FAILED' || paymentStatus === 'PAYMENT_FAILED') {
      orderStatus = 'failed'
    } else if (status === 'CANCELLED' || paymentStatus === 'PAYMENT_CANCELLED') {
      orderStatus = 'cancelled'
    }

    console.log(`📝 Updating order ${orderId} to status: ${orderStatus}`)

    // Update order in database
    const { data, error } = await supabase
      .from('online_orders')
      .update({
        status: orderStatus,
        payment_reference: checkoutId,
        payment_receipt: receipt,
        updated_at: new Date().toISOString()
      })
      .eq('id', orderId)

    if (error) {
      console.error('❌ Error updating order:', error)
      throw error
    }

    console.log('✅ Order updated successfully:', data)

    // Return success response to Maya
    return res.status(200).json({
      success: true,
      message: 'Webhook processed successfully'
    })

  } catch (error) {
    console.error('❌ Webhook processing error:', error)
    return res.status(500).json({
      error: 'Internal server error',
      message: error.message
    })
  }
}
