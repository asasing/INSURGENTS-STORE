import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Star, Check, X, Edit, Trash2 } from 'lucide-react'
import { supabase } from '../../lib/supabase'
import Button from '../../components/common/Button'
import Card from '../../components/common/Card'
import Modal from '../../components/common/Modal'
import Input from '../../components/common/Input'
import Spinner from '../../components/common/Spinner'
import { useForm } from 'react-hook-form'
import toast from 'react-hot-toast'

export default function Testimonials() {
  const [filter, setFilter] = useState('all')
  const [showModal, setShowModal] = useState(false)
  const [selectedTestimonial, setSelectedTestimonial] = useState(null)

  const queryClient = useQueryClient()

  const { data: testimonials, isLoading } = useQuery({
    queryKey: ['online_testimonials', 'admin'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('online_testimonials')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) throw error
      return data
    }
  })

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors }
  } = useForm()

  const approveMutation = useMutation({
    mutationFn: async (id) => {
      const { error } = await supabase
        .from('online_testimonials')
        .update({ is_approved: true })
        .eq('id', id)

      if (error) throw error
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['online_testimonials'])
      toast.success('Testimonial approved!')
    }
  })

  const rejectMutation = useMutation({
    mutationFn: async (id) => {
      const { error } = await supabase
        .from('online_testimonials')
        .update({ is_approved: false })
        .eq('id', id)

      if (error) throw error
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['online_testimonials'])
      toast.success('Testimonial rejected')
    }
  })

  const toggleFeaturedMutation = useMutation({
    mutationFn: async ({ id, is_featured }) => {
      const { error } = await supabase
        .from('online_testimonials')
        .update({ is_featured: !is_featured })
        .eq('id', id)

      if (error) throw error
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['online_testimonials'])
      toast.success('Featured status updated!')
    }
  })

  const updateMutation = useMutation({
    mutationFn: async ({ id, data }) => {
      const { error } = await supabase
        .from('online_testimonials')
        .update(data)
        .eq('id', id)

      if (error) throw error
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['online_testimonials'])
      toast.success('Testimonial updated!')
      setShowModal(false)
      setSelectedTestimonial(null)
      reset()
    }
  })

  const deleteMutation = useMutation({
    mutationFn: async (id) => {
      const { error} = await supabase
        .from('online_testimonials')
        .delete()
        .eq('id', id)

      if (error) throw error
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['online_testimonials'])
      toast.success('Testimonial deleted!')
    }
  })

  const handleEdit = (testimonial) => {
    setSelectedTestimonial(testimonial)
    reset({
      customer_name: testimonial.customer_name,
      rating: testimonial.rating,
      comment: testimonial.comment
    })
    setShowModal(true)
  }

  const onSubmit = (data) => {
    updateMutation.mutate({
      id: selectedTestimonial.id,
      data: {
        customer_name: data.customer_name,
        rating: parseInt(data.rating),
        comment: data.comment
      }
    })
  }

  const filteredTestimonials = testimonials?.filter((t) => {
    if (filter === 'approved') return t.is_approved
    if (filter === 'pending') return !t.is_approved
    if (filter === 'featured') return t.is_featured
    return true
  })

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
            Testimonials
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Moderate customer reviews
          </p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex gap-2 mb-6">
        {['all', 'approved', 'pending', 'featured'].map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              filter === f
                ? 'bg-blue-600 text-white dark:bg-blue-500'
                : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
            }`}
          >
            {f.charAt(0).toUpperCase() + f.slice(1)}
            <span className="ml-2 text-xs opacity-75">
              ({testimonials?.filter((t) => {
                if (f === 'approved') return t.is_approved
                if (f === 'pending') return !t.is_approved
                if (f === 'featured') return t.is_featured
                return true
              }).length || 0})
            </span>
          </button>
        ))}
      </div>

      {/* Testimonials Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredTestimonials?.map((testimonial) => (
          <Card key={testimonial.id}>
            <div className="flex items-start justify-between mb-3">
              <div>
                <div className="font-bold text-gray-900 dark:text-white">
                  {testimonial.customer_name}
                </div>
                <div className="flex gap-1 mt-1">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className={`w-4 h-4 ${
                        i < testimonial.rating
                          ? 'text-yellow-400 fill-yellow-400'
                          : 'text-gray-300 dark:text-gray-600'
                      }`}
                    />
                  ))}
                </div>
              </div>
              <div className="flex gap-2">
                {testimonial.is_approved && (
                  <span className="px-2 py-1 bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 text-xs rounded">
                    Approved
                  </span>
                )}
                {testimonial.is_featured && (
                  <span className="px-2 py-1 bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-200 text-xs rounded">
                    Featured
                  </span>
                )}
              </div>
            </div>

            <p className="text-sm text-gray-600 dark:text-gray-400 italic mb-4">
              "{testimonial.comment}"
            </p>

            <div className="text-xs text-gray-500 dark:text-gray-400 mb-4">
              {new Date(testimonial.created_at).toLocaleDateString()}
            </div>

            <div className="flex flex-wrap gap-2">
              {!testimonial.is_approved && (
                <button
                  onClick={() => approveMutation.mutate(testimonial.id)}
                  className="flex items-center gap-1 px-3 py-1.5 bg-green-600 text-white rounded hover:bg-green-700 text-sm"
                >
                  <Check className="w-4 h-4" />
                  Approve
                </button>
              )}

              {testimonial.is_approved && (
                <button
                  onClick={() => rejectMutation.mutate(testimonial.id)}
                  className="flex items-center gap-1 px-3 py-1.5 bg-gray-600 text-white rounded hover:bg-gray-700 text-sm"
                >
                  <X className="w-4 h-4" />
                  Unapprove
                </button>
              )}

              <button
                onClick={() =>
                  toggleFeaturedMutation.mutate({
                    id: testimonial.id,
                    is_featured: testimonial.is_featured
                  })
                }
                className={`flex items-center gap-1 px-3 py-1.5 rounded text-sm ${
                  testimonial.is_featured
                    ? 'bg-yellow-600 text-white hover:bg-yellow-700'
                    : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'
                }`}
              >
                <Star className="w-4 h-4" />
                {testimonial.is_featured ? 'Unfeature' : 'Feature'}
              </button>

              <button
                onClick={() => handleEdit(testimonial)}
                className="flex items-center gap-1 px-3 py-1.5 bg-blue-600 text-white rounded hover:bg-blue-700 text-sm"
              >
                <Edit className="w-4 h-4" />
                Edit
              </button>

              <button
                onClick={() => {
                  if (confirm('Delete this testimonial?')) {
                    deleteMutation.mutate(testimonial.id)
                  }
                }}
                className="flex items-center gap-1 px-3 py-1.5 bg-red-600 text-white rounded hover:bg-red-700 text-sm"
              >
                <Trash2 className="w-4 h-4" />
                Delete
              </button>
            </div>
          </Card>
        ))}

        {filteredTestimonials?.length === 0 && (
          <div className="col-span-full text-center py-12 text-gray-500 dark:text-gray-400">
            No testimonials found for this filter.
          </div>
        )}
      </div>

      {/* Edit Modal */}
      <Modal
        isOpen={showModal}
        onClose={() => {
          setShowModal(false)
          setSelectedTestimonial(null)
          reset()
        }}
        title="Edit Testimonial"
        size="md"
      >
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <Input
            label="Customer Name *"
            {...register('customer_name', { required: 'Name is required' })}
            error={errors.customer_name?.message}
          />

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Rating *
            </label>
            <select
              {...register('rating', { required: 'Rating is required' })}
              className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {[1, 2, 3, 4, 5].map((r) => (
                <option key={r} value={r}>
                  {r} Star{r > 1 ? 's' : ''}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Comment *
            </label>
            <textarea
              {...register('comment', { required: 'Comment is required' })}
              rows={4}
              className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            {errors.comment && (
              <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                {errors.comment.message}
              </p>
            )}
          </div>

          <div className="flex gap-3 justify-end border-t border-gray-200 dark:border-gray-700 pt-4">
            <Button
              type="button"
              variant="secondary"
              onClick={() => {
                setShowModal(false)
                setSelectedTestimonial(null)
                reset()
              }}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={updateMutation.isPending}>
              {updateMutation.isPending ? 'Saving...' : 'Update'}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  )
}
