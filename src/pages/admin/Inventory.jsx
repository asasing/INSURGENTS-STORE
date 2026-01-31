import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Plus, Search, Edit, Trash2, Eye, EyeOff } from 'lucide-react'
import { getProducts, createProduct, updateProduct, deleteProduct } from '../../services/products'
import Button from '../../components/common/Button'
import Card from '../../components/common/Card'
import Modal from '../../components/common/Modal'
import Spinner from '../../components/common/Spinner'
import ProductForm from '../../components/admin/ProductForm'
import { formatPrice } from '../../lib/utils'
import toast from 'react-hot-toast'

export default function Inventory() {
  const [searchQuery, setSearchQuery] = useState('')
  const [showModal, setShowModal] = useState(false)
  const [selectedProduct, setSelectedProduct] = useState(null)
  const [deleteConfirm, setDeleteConfirm] = useState(null)
  const [sortKey, setSortKey] = useState('name')
  const [sortDir, setSortDir] = useState('asc')

  const queryClient = useQueryClient()

  // Fetch all products (including inactive for admin)
  const { data: products, isLoading } = useQuery({
    queryKey: ['products', 'admin'],
    queryFn: () => getProducts({})
  })

  // Create product mutation
  const createMutation = useMutation({
    mutationFn: createProduct,
    onSuccess: () => {
      queryClient.invalidateQueries(['products'])
      toast.success('Product created successfully!')
      setShowModal(false)
      setSelectedProduct(null)
    },
    onError: (error) => {
      toast.error('Failed to create product')
      console.error(error)
    }
  })

  // Update product mutation
  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => updateProduct(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries(['products'])
      toast.success('Product updated successfully!')
      setShowModal(false)
      setSelectedProduct(null)
    },
    onError: (error) => {
      toast.error('Failed to update product')
      console.error(error)
    }
  })

  // Delete product mutation
  const deleteMutation = useMutation({
    mutationFn: deleteProduct,
    onSuccess: () => {
      queryClient.invalidateQueries(['products'])
      toast.success('Product deleted successfully!')
      setDeleteConfirm(null)
    },
    onError: (error) => {
      toast.error('Failed to delete product')
      console.error(error)
    }
  })

  const handleAddProduct = () => {
    setSelectedProduct(null)
    setShowModal(true)
  }

  const handleEditProduct = (product) => {
    setSelectedProduct(product)
    setShowModal(true)
  }

  const handleDeleteProduct = (product) => {
    setDeleteConfirm(product)
  }

  const confirmDelete = () => {
    if (deleteConfirm) {
      deleteMutation.mutate(deleteConfirm.id)
    }
  }

  const handleSubmit = (data) => {
    if (selectedProduct) {
      updateMutation.mutate({ id: selectedProduct.id, data })
    } else {
      createMutation.mutate(data)
    }
  }

  const filteredProducts = products?.filter(product =>
    product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    product.description?.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const sortedProducts = [...(filteredProducts || [])].sort((a, b) => {
    const dir = sortDir === 'asc' ? 1 : -1
    if (sortKey === 'price') return dir * (Number(a.price || 0) - Number(b.price || 0))
    if (sortKey === 'stock_quantity') return dir * (Number(a.stock_quantity || 0) - Number(b.stock_quantity || 0))
    if (sortKey === 'category') return dir * String(a.category?.name || '').localeCompare(String(b.category?.name || ''))
    if (sortKey === 'is_active') return dir * (a.is_active === b.is_active ? 0 : a.is_active ? -1 : 1)
    return dir * String(a[sortKey] || '').localeCompare(String(b[sortKey] || ''))
  })

  const toggleSort = (key) => {
    if (sortKey === key) {
      setSortDir((prev) => (prev === 'asc' ? 'desc' : 'asc'))
      return
    }
    setSortKey(key)
    setSortDir('asc')
  }

  const sortLabel = (key, label) => (
    <button type="button" onClick={() => toggleSort(key)} className="inline-flex items-center gap-1">
      <span>{label}</span>
      {sortKey === key ? <span className="text-xs">{sortDir === 'asc' ? '▲' : '▼'}</span> : null}
    </button>
  )

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Spinner size="lg" />
      </div>
    )
  }

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Inventory Management
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Manage your product catalog
          </p>
        </div>
        <Button onClick={handleAddProduct} className="flex items-center gap-2">
          <Plus className="w-5 h-5" />
          Add Product
        </Button>
      </div>

      {/* Search & Stats */}
      <Card className="mb-6">
        <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
          <div className="relative flex-1 w-full md:w-auto">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search products..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="flex gap-4 text-sm">
            <div className="text-center">
              <div className="font-bold text-2xl text-gray-900 dark:text-white">
                {products?.length || 0}
              </div>
              <div className="text-gray-600 dark:text-gray-400">Total Products</div>
            </div>
            <div className="text-center">
              <div className="font-bold text-2xl text-green-600 dark:text-green-400">
                {products?.filter(p => p.is_active).length || 0}
              </div>
              <div className="text-gray-600 dark:text-gray-400">Active</div>
            </div>
            <div className="text-center">
              <div className="font-bold text-2xl text-orange-600 dark:text-orange-400">
                {products?.filter(p => p.stock_quantity < 10).length || 0}
              </div>
              <div className="text-gray-600 dark:text-gray-400">Low Stock</div>
            </div>
          </div>
        </div>
      </Card>

      {/* Product Table */}
      <Card>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200 dark:border-gray-700">
                <th className="text-left py-3 px-4 font-semibold text-gray-700 dark:text-gray-300">
                  {sortLabel('name', 'Product')}
                </th>
                <th className="text-left py-3 px-4 font-semibold text-gray-700 dark:text-gray-300">
                  {sortLabel('category', 'Category')}
                </th>
                <th className="text-left py-3 px-4 font-semibold text-gray-700 dark:text-gray-300">
                  {sortLabel('price', 'Price')}
                </th>
                <th className="text-left py-3 px-4 font-semibold text-gray-700 dark:text-gray-300">
                  {sortLabel('stock_quantity', 'Stock')}
                </th>
                <th className="text-left py-3 px-4 font-semibold text-gray-700 dark:text-gray-300">
                  {sortLabel('is_active', 'Status')}
                </th>
                <th className="text-right py-3 px-4 font-semibold text-gray-700 dark:text-gray-300">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {sortedProducts.map((product) => (
                <tr
                  key={product.id}
                  className="border-b border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800/50"
                >
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-3">
                      {product.images?.[0] ? (
                        <img
                          src={product.images[0].url}
                          alt={product.name}
                          className="w-12 h-12 object-cover rounded"
                        />
                      ) : (
                        <div className="w-12 h-12 bg-gray-200 dark:bg-gray-700 rounded flex items-center justify-center">
                          <span className="text-gray-400 text-xs">No image</span>
                        </div>
                      )}
                      <div>
                        <div className="font-medium text-gray-900 dark:text-white">
                          {product.name}
                        </div>
                        {product.is_featured && (
                          <span className="text-xs bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-200 px-2 py-0.5 rounded">
                            Featured
                          </span>
                        )}
                      </div>
                    </div>
                  </td>
                  <td className="py-3 px-4 text-gray-600 dark:text-gray-400">
                    {product.category?.name || 'Uncategorized'}
                  </td>
                  <td className="py-3 px-4">
                    <div className="text-gray-900 dark:text-white font-medium">
                      {formatPrice(product.sale_price || product.price)}
                    </div>
                    {product.sale_price && (
                      <div className="text-xs text-gray-500 line-through">
                        {formatPrice(product.price)}
                      </div>
                    )}
                  </td>
                  <td className="py-3 px-4">
                    <span
                      className={`inline-flex items-center px-2 py-1 rounded text-xs font-medium ${
                        product.stock_quantity === 0
                          ? 'bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200'
                          : product.stock_quantity < 10
                          ? 'bg-orange-100 dark:bg-orange-900 text-orange-800 dark:text-orange-200'
                          : 'bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200'
                      }`}
                    >
                      {product.stock_quantity} units
                    </span>
                  </td>
                  <td className="py-3 px-4">
                    {product.is_active ? (
                      <span className="inline-flex items-center gap-1 text-green-600 dark:text-green-400">
                        <Eye className="w-4 h-4" />
                        Active
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-gray-500 dark:text-gray-400">
                        <EyeOff className="w-4 h-4" />
                        Inactive
                      </span>
                    )}
                  </td>
                  <td className="py-3 px-4">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => handleEditProduct(product)}
                        className="p-2 text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDeleteProduct(product)}
                        className="p-2 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}

              {filteredProducts?.length === 0 && (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-gray-500 dark:text-gray-400">
                    No products found. Click "Add Product" to create one.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Add/Edit Modal */}
      <Modal
        isOpen={showModal}
        onClose={() => {
          setShowModal(false)
          setSelectedProduct(null)
        }}
        title={selectedProduct ? 'Edit Product' : 'Add New Product'}
        size="xl"
      >
        <ProductForm
          product={selectedProduct}
          onSubmit={handleSubmit}
          onCancel={() => {
            setShowModal(false)
            setSelectedProduct(null)
          }}
          loading={createMutation.isPending || updateMutation.isPending}
        />
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={!!deleteConfirm}
        onClose={() => setDeleteConfirm(null)}
        title="Delete Product"
        size="sm"
      >
        <div className="space-y-4">
          <p className="text-gray-600 dark:text-gray-400">
            Are you sure you want to delete <strong>{deleteConfirm?.name}</strong>?
            This action cannot be undone.
          </p>
          <div className="flex gap-3 justify-end">
            <Button
              variant="secondary"
              onClick={() => setDeleteConfirm(null)}
              disabled={deleteMutation.isPending}
            >
              Cancel
            </Button>
            <Button
              variant="danger"
              onClick={confirmDelete}
              disabled={deleteMutation.isPending}
            >
              {deleteMutation.isPending ? 'Deleting...' : 'Delete'}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  )
}
