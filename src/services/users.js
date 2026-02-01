import { supabase } from '../lib/supabase'

/**
 * Get all admin/staff users from profiles table
 */
export async function getAdminUsers() {
  try {
    const { data, error } = await supabase
      .from('profiles')
      .select('id, email, role, created_at')
      .order('created_at', { ascending: false })

    if (error) throw error
    return data || []
  } catch (error) {
    console.error('Error fetching users:', error)
    throw error
  }
}

/**
 * Create a new admin/staff user
 * @param {Object} userData - User data (email, password, role)
 */
export async function createAdminUser(userData) {
  try {
    // Note: User creation via admin API requires Supabase service role key
    // For now, users must be created manually in Supabase dashboard
    // This is a placeholder for future implementation
    throw new Error('User creation must be done through Supabase dashboard for security')
  } catch (error) {
    console.error('Error creating user:', error)
    throw error
  }
}

/**
 * Update user role
 * @param {string} userId - User ID
 * @param {string} role - New role (admin, staff, viewer)
 */
export async function updateUserRole(userId, role) {
  try {
    const { data, error } = await supabase
      .from('profiles')
      .update({ role })
      .eq('id', userId)
      .select()
      .single()

    if (error) throw error
    return data
  } catch (error) {
    console.error('Error updating user role:', error)
    throw error
  }
}

/**
 * Delete user (removes from profiles, keeps auth.users for security)
 * @param {string} userId - User ID
 */
export async function deleteAdminUser(userId) {
  try {
    const { error } = await supabase
      .from('profiles')
      .delete()
      .eq('id', userId)

    if (error) throw error
  } catch (error) {
    console.error('Error deleting user:', error)
    throw error
  }
}
