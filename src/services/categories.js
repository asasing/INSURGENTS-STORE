import { supabase } from '../lib/supabase'

export async function getCategories() {
  try {
    const { data, error } = await supabase
      .from('online_categories')
      .select('*')
      .eq('is_active', true)
      .order('display_order', { ascending: true })

    if (error) throw error
    return data
  } catch (error) {
    console.error('Error fetching categories:', error)
    throw error
  }
}

export async function getCategoryBySlug(slug) {
  try {
    const { data, error } = await supabase
      .from('online_categories')
      .select('*')
      .eq('slug', slug)
      .eq('is_active', true)
      .single()

    if (error) throw error
    return data
  } catch (error) {
    console.error('Error fetching category:', error)
    throw error
  }
}
