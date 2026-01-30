import { supabase } from '../lib/supabase'

// Use AssetsYour bucket for logo and other assets
const ASSETS_BUCKET = 'AssetsYour'
const PRODUCT_IMAGES_BUCKET = 'product-images'

export async function uploadImage(file, path = '', bucket = PRODUCT_IMAGES_BUCKET) {
  try {
    // Generate unique filename
    const fileExt = file.name.split('.').pop()
    const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`
    const filePath = path ? `${path}/${fileName}` : fileName

    const { data, error } = await supabase.storage
      .from(bucket)
      .upload(filePath, file, {
        cacheControl: '3600',
        upsert: false
      })

    if (error) throw error

    // Get public URL
    const { data: { publicUrl } } = supabase.storage
      .from(bucket)
      .getPublicUrl(filePath)

    return {
      path: filePath,
      url: publicUrl,
      name: fileName
    }
  } catch (error) {
    console.error('Error uploading image:', error)
    throw error
  }
}

// Specific function for uploading assets like logos
export async function uploadAsset(file, path = '') {
  return uploadImage(file, path, ASSETS_BUCKET)
}

export async function deleteImage(filePath, bucket = PRODUCT_IMAGES_BUCKET) {
  try {
    const { error } = await supabase.storage
      .from(bucket)
      .remove([filePath])

    if (error) throw error
  } catch (error) {
    console.error('Error deleting image:', error)
    throw error
  }
}

export async function uploadMultipleImages(files, path = '') {
  try {
    const uploadPromises = files.map(file => uploadImage(file, path))
    const results = await Promise.all(uploadPromises)
    return results
  } catch (error) {
    console.error('Error uploading multiple images:', error)
    throw error
  }
}

export function getImageUrl(filePath, bucket = PRODUCT_IMAGES_BUCKET) {
  if (!filePath) return null

  const { data: { publicUrl } } = supabase.storage
    .from(bucket)
    .getPublicUrl(filePath)

  return publicUrl
}
