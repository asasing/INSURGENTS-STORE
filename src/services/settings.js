import { supabase } from '../lib/supabase'

export async function getSettings() {
  try {
    const { data, error } = await supabase
      .from('site_settings')
      .select('*')

    if (error) throw error

    // Convert array to object for easy access
    const settingsObj = {}
    data?.forEach(setting => {
      settingsObj[setting.setting_key] = setting.setting_value
    })

    return settingsObj
  } catch (error) {
    console.error('Error fetching settings:', error)
    throw error
  }
}

export async function getSetting(key) {
  try {
    const { data, error } = await supabase
      .from('site_settings')
      .select('setting_value')
      .eq('setting_key', key)
      .single()

    if (error) throw error
    return data?.setting_value
  } catch (error) {
    console.error('Error fetching setting:', error)
    return null
  }
}

export async function updateSetting(key, value) {
  try {
    const { error } = await supabase
      .from('site_settings')
      .upsert({
        setting_key: key,
        setting_value: value,
        updated_at: new Date().toISOString()
      }, {
        onConflict: 'setting_key'
      })

    if (error) throw error
  } catch (error) {
    console.error('Error updating setting:', error)
    throw error
  }
}
