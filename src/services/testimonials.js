import { supabase } from '../lib/supabase'

export async function getTestimonials(filters = {}) {
  try {
    let query = supabase
      .from('online_testimonials')
      .select('*')
      .eq('is_approved', true)

    if (filters.featured) {
      query = query.eq('is_featured', true)
    }

    const { data, error } = await query.order('created_at', { ascending: false })

    if (error) throw error
    return data
  } catch (error) {
    console.error('Error fetching testimonials:', error)
    throw error
  }
}
