import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useForm } from 'react-hook-form'
import { Settings as SettingsIcon, Upload } from 'lucide-react'
import { getSettings, updateSetting } from '../../services/settings'
import { uploadAsset } from '../../services/storage'
import Button from '../../components/common/Button'
import Card from '../../components/common/Card'
import Input from '../../components/common/Input'
import Spinner from '../../components/common/Spinner'
import toast from 'react-hot-toast'

export default function Settings() {
  const [uploading, setUploading] = useState(false)
  const queryClient = useQueryClient()

  const { data: settings, isLoading } = useQuery({
    queryKey: ['settings'],
    queryFn: getSettings
  })

  const { register, handleSubmit, formState: { errors } } = useForm({
    values: settings || {}
  })

  const updateMutation = useMutation({
    mutationFn: async (data) => {
      // Update all settings
      await Promise.all([
        updateSetting('site_name', data.site_name),
        updateSetting('site_tagline', data.site_tagline)
      ])
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['settings'])
      toast.success('Settings updated!')
    },
    onError: () => {
      toast.error('Failed to update settings')
    }
  })

  const handleLogoUpload = async (e) => {
    const file = e.target.files?.[0]
    if (!file) return

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast.error('Please upload an image file')
      return
    }

    // Validate file size (max 2MB)
    if (file.size > 2 * 1024 * 1024) {
      toast.error('Image must be less than 2MB')
      return
    }

    setUploading(true)

    try {
      const result = await uploadAsset(file, 'logos')
      await updateSetting('site_logo_url', result.url)
      queryClient.invalidateQueries(['settings'])
      toast.success('Logo uploaded!')
    } catch (error) {
      console.error('Upload error:', error)
      toast.error('Failed to upload logo')
    } finally {
      setUploading(false)
    }
  }

  const handleRemoveLogo = async () => {
    if (!confirm('Remove logo?')) return

    try {
      await updateSetting('site_logo_url', '')
      queryClient.invalidateQueries(['settings'])
      toast.success('Logo removed')
    } catch (error) {
      toast.error('Failed to remove logo')
    }
  }

  const onSubmit = (data) => {
    updateMutation.mutate(data)
  }

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Spinner size="lg" />
      </div>
    )
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Site Settings
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Configure your store's branding and information
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Logo Upload */}
        <Card>
          <div className="flex items-center gap-2 mb-4">
            <SettingsIcon className="w-5 h-5 text-gray-600 dark:text-gray-400" />
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">
              Store Logo
            </h2>
          </div>

          <div className="space-y-4">
            {/* Current Logo */}
            {settings?.site_logo_url && (
              <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                  Current Logo:
                </p>
                <img
                  src={settings.site_logo_url}
                  alt="Store Logo"
                  className="max-h-24 object-contain"
                />
                <Button
                  variant="danger"
                  size="sm"
                  onClick={handleRemoveLogo}
                  className="mt-3"
                >
                  Remove Logo
                </Button>
              </div>
            )}

            {/* Upload New Logo */}
            <div>
              <label
                htmlFor="logo-upload"
                className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
              >
                {uploading ? (
                  <Spinner />
                ) : (
                  <>
                    <Upload className="w-8 h-8 text-gray-400 mb-2" />
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Click to upload new logo
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">
                      PNG, JPG up to 2MB
                    </p>
                  </>
                )}
                <input
                  id="logo-upload"
                  type="file"
                  accept="image/*"
                  onChange={handleLogoUpload}
                  disabled={uploading}
                  className="hidden"
                />
              </label>
            </div>

            <p className="text-xs text-gray-500 dark:text-gray-500">
              Recommended size: 200x60px for best results
            </p>
          </div>
        </Card>

        {/* Site Information */}
        <Card>
          <div className="flex items-center gap-2 mb-4">
            <SettingsIcon className="w-5 h-5 text-gray-600 dark:text-gray-400" />
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">
              Site Information
            </h2>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <Input
              label="Store Name"
              {...register('site_name', { required: 'Store name is required' })}
              error={errors.site_name?.message}
              placeholder="Insurgents Store"
            />

            <Input
              label="Tagline"
              {...register('site_tagline')}
              placeholder="Premium Shoes & Apparel"
            />

            <Button
              type="submit"
              disabled={updateMutation.isPending}
              className="w-full"
            >
              {updateMutation.isPending ? 'Saving...' : 'Save Changes'}
            </Button>
          </form>
        </Card>
      </div>
    </div>
  )
}
