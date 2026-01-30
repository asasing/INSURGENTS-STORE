import { supabase } from '../lib/supabase'

export async function getSalePromotions(filters = {}) {
  try {
    let query = supabase
      .from('online_sale_promotions')
      .select('*')
      .eq('is_active', true)

    const { data, error } = await query.order('created_at', { ascending: false })

    if (error) throw error
    return data
  } catch (error) {
    console.error('Error fetching sale promotions:', error)
    throw error
  }
}

export async function getActiveSalePromotion() {
  try {
    const { data, error } = await supabase
      .from('online_sale_promotions')
      .select('*')
      .eq('is_active', true)
      .gt('end_date', new Date().toISOString())
      .order('end_date', { ascending: true })
      .limit(1)
      .single()

    if (error && error.code !== 'PGRST116') throw error // Ignore "no rows" error
    return data
  } catch (error) {
    console.error('Error fetching active sale promotion:', error)
    return null
  }
}

export async function createSalePromotion(promotionData) {
  try {
    const { data, error } = await supabase
      .from('online_sale_promotions')
      .insert(promotionData)
      .select()
      .single()

    if (error) throw error
    return data
  } catch (error) {
    console.error('Error creating sale promotion:', error)
    throw error
  }
}

export async function updateSalePromotion(id, promotionData) {
  try {
    const { data, error } = await supabase
      .from('online_sale_promotions')
      .update(promotionData)
      .eq('id', id)
      .select()
      .single()

    if (error) throw error
    return data
  } catch (error) {
    console.error('Error updating sale promotion:', error)
    throw error
  }
}

export async function deleteSalePromotion(id) {
  try {
    const { error } = await supabase
      .from('online_sale_promotions')
      .delete()
      .eq('id', id)

    if (error) throw error
  } catch (error) {
    console.error('Error deleting sale promotion:', error)
    throw error
  }
}
