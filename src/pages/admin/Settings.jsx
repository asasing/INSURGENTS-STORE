import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useForm } from 'react-hook-form'
import { Settings as SettingsIcon, Upload, Users, Trash2 } from 'lucide-react'
import { getSettings, updateSetting } from '../../services/settings'
import { uploadAsset } from '../../services/storage'
import { getAdminUsers, updateUserRole, deleteAdminUser } from '../../services/users'
import Button from '../../components/common/Button'
import Card from '../../components/common/Card'
import Input from '../../components/common/Input'
import Spinner from '../../components/common/Spinner'
import toast from 'react-hot-toast'
import { useAuth } from '../../hooks/useAuth'

export default function Settings() {
  const [uploading, setUploading] = useState(false)
  const [uploadingFavicon, setUploadingFavicon] = useState(false)
  const queryClient = useQueryClient()
  const { isAdmin } = useAuth()

  const { data: settings, isLoading } = useQuery({
    queryKey: ['settings'],
    queryFn: getSettings
  })

  const { data: users = [], isLoading: usersLoading } = useQuery({
    queryKey: ['admin-users'],
    queryFn: getAdminUsers,
    enabled: isAdmin
  })

  const { register, handleSubmit, formState: { errors } } = useForm({
    values: settings || {}
  })

  const updateMutation = useMutation({
    mutationFn: async (data) => {
      // Update all settings
      await Promise.all([
        updateSetting('site_name', data.site_name),
        updateSetting('site_tagline', data.site_tagline),
        updateSetting('site_title', data.site_title)
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

  const roleUpdateMutation = useMutation({
    mutationFn: ({ userId, role }) => updateUserRole(userId, role),
    onSuccess: () => {
      queryClient.invalidateQueries(['admin-users'])
      toast.success('User role updated!')
    },
    onError: () => {
      toast.error('Failed to update user role')
    }
  })

  const deleteUserMutation = useMutation({
    mutationFn: deleteAdminUser,
    onSuccess: () => {
      queryClient.invalidateQueries(['admin-users'])
      toast.success('User removed!')
    },
    onError: () => {
      toast.error('Failed to remove user')
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

  const handleFaviconUpload = async (e) => {
    const file = e.target.files?.[0]
    if (!file) return

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast.error('Please upload an image file')
      return
    }

    // Validate file size (max 1MB for favicon)
    if (file.size > 1 * 1024 * 1024) {
      toast.error('Favicon must be less than 1MB')
      return
    }

    setUploadingFavicon(true)

    try {
      const result = await uploadAsset(file, 'logos')
      await updateSetting('favicon_url', result.url)
      queryClient.invalidateQueries(['settings'])
      toast.success('Favicon uploaded!')
    } catch (error) {
      console.error('Upload error:', error)
      toast.error('Failed to upload favicon')
    } finally {
      setUploadingFavicon(false)
    }
  }

  const handleRemoveFavicon = async () => {
    if (!confirm('Remove favicon?')) return

    try {
      await updateSetting('favicon_url', '')
      queryClient.invalidateQueries(['settings'])
      toast.success('Favicon removed')
    } catch (error) {
      toast.error('Failed to remove favicon')
    }
  }

  const handleDeleteUser = async (userId) => {
    if (!confirm('Are you sure you want to remove this user? They will lose admin access.')) return
    deleteUserMutation.mutate(userId)
  }

  const handleRoleChange = (userId, newRole) => {
    roleUpdateMutation.mutate({ userId, role: newRole })
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

      <div className="space-y-6">
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
              label="Browser Tab Title"
              {...register('site_title', { required: 'Site title is required' })}
              error={errors.site_title?.message}
              placeholder="REMAfy - Online Store"
            />

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

        {/* Favicon Upload */}
        <Card>
          <div className="flex items-center gap-2 mb-4">
            <SettingsIcon className="w-5 h-5 text-gray-600 dark:text-gray-400" />
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">
              Favicon (Browser Tab Icon)
            </h2>
          </div>

          <div className="space-y-4">
            {/* Current Favicon */}
            {settings?.favicon_url && (
              <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                  Current Favicon:
                </p>
                <img
                  src={settings.favicon_url}
                  alt="Favicon"
                  className="w-8 h-8 object-contain"
                />
                <Button
                  variant="danger"
                  size="sm"
                  onClick={handleRemoveFavicon}
                  className="mt-3"
                >
                  Remove Favicon
                </Button>
              </div>
            )}

            {/* Upload New Favicon */}
            <div>
              <label
                htmlFor="favicon-upload"
                className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
              >
                {uploadingFavicon ? (
                  <Spinner />
                ) : (
                  <>
                    <Upload className="w-8 h-8 text-gray-400 mb-2" />
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Click to upload favicon
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">
                      PNG, ICO up to 1MB
                    </p>
                  </>
                )}
                <input
                  id="favicon-upload"
                  type="file"
                  accept="image/*,.ico"
                  onChange={handleFaviconUpload}
                  disabled={uploadingFavicon}
                  className="hidden"
                />
              </label>
            </div>

            <p className="text-xs text-gray-500 dark:text-gray-500">
              Recommended size: 32x32px or 64x64px for best results
            </p>
          </div>
        </Card>

        {/* User Management - Only visible to admins */}
        {isAdmin && (
          <Card>
            <div className="flex items-center gap-2 mb-4">
              <Users className="w-5 h-5 text-gray-600 dark:text-gray-400" />
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                User Management
              </h2>
            </div>

            {usersLoading ? (
              <div className="flex justify-center p-8">
                <Spinner />
              </div>
            ) : (
              <div className="space-y-4">
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Manage admin and staff access. To add new users, create them in Supabase dashboard first.
                </p>

                {users.length === 0 ? (
                  <p className="text-sm text-gray-500 dark:text-gray-500 text-center p-8">
                    No users found. Create users in Supabase dashboard.
                  </p>
                ) : (
                  <div className="divide-y divide-gray-200 dark:divide-gray-700">
                    {users.map((user) => (
                      <div key={user.id} className="py-4 flex items-center justify-between">
                        <div className="flex-1">
                          <p className="text-sm font-medium text-gray-900 dark:text-white">
                            {user.email}
                          </p>
                          <p className="text-xs text-gray-500 dark:text-gray-500">
                            Added: {new Date(user.created_at).toLocaleDateString()}
                          </p>
                        </div>

                        <div className="flex items-center gap-3">
                          <select
                            value={user.role || 'viewer'}
                            onChange={(e) => handleRoleChange(user.id, e.target.value)}
                            className="px-3 py-1 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                          >
                            <option value="admin">Admin</option>
                            <option value="staff">Staff</option>
                            <option value="viewer">Viewer</option>
                          </select>

                          <button
                            onClick={() => handleDeleteUser(user.id)}
                            className="p-2 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                            title="Remove user"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </Card>
        )}
      </div>
    </div>
  )
}
