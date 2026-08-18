import React, { useEffect } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { Plus, Search, Filter, Edit, Trash2, Package, Eye } from 'lucide-react'
import { Link, useNavigate } from 'react-router-dom'
import { fetchProducts, deleteProductAsync } from '../store/slices/productsSlice'
import { fetchCategories } from '../store/slices/categorySlice'
import { getImageUrl } from '../utils/imageHandler'
import DeleteConfirmModal from '../components/DeleteConfirmModal'
import DataTable from '../components/ui/DataTable'
import { motion } from 'framer-motion'

const Products = () => {
  const { items: products, loading, error, pagination } = useSelector(state => state.products)
  const [searchTerm, setSearchTerm] = React.useState('')
  const [debouncedSearch, setDebouncedSearch] = React.useState('')
  const [categoryFilter, setCategoryFilter] = React.useState('All')
  const [statusFilter, setStatusFilter] = React.useState('All')
  const [currentPage, setCurrentPage] = React.useState(1)
  const [deleteTarget, setDeleteTarget] = React.useState(null)
  const [deleteLoading, setDeleteLoading] = React.useState(false)

  const categoriesData = useSelector(state => state.categories?.items || [])
  const activeCategories = categoriesData.filter(c => c.status === 'active')

  const dispatch = useDispatch()
  const navigate = useNavigate()

  const handleDelete = async () => {
    if (!deleteTarget) return
    setDeleteLoading(true)
    try {
      await dispatch(deleteProductAsync(deleteTarget)).unwrap()
      toast.success('Product deleted!')
      dispatch(fetchProducts({
        page: currentPage,
        limit: 12,
        search: debouncedSearch,
        category: categoryFilter,
        stockStatus: statusFilter
      }))

    } catch {
      toast.error('Failed to delete')
    } finally {
      setDeleteLoading(false)
      setDeleteTarget(null)
    }
  }

  useEffect(() => {
    dispatch(fetchCategories({ limit: 100 }))
  }, [dispatch])

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchTerm)
      setCurrentPage(1)
    }, 400)
    return () => clearTimeout(timer)
  }, [searchTerm])

  useEffect(() => {
    dispatch(fetchProducts({
      page: currentPage,
      limit: 12,
      search: debouncedSearch,
      category: categoryFilter,
      stockStatus: statusFilter
    }))
  }, [dispatch, currentPage, debouncedSearch, categoryFilter, statusFilter])

  const statuses = ['All', 'Active', 'Out of Stock', 'Inactive']

  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= pagination.pages) {
      setCurrentPage(newPage)
    }
  }

  return (
    <div className="admin-page">
      <DeleteConfirmModal
        isOpen={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
        loading={deleteLoading}
        title="Delete Product"
        description="Are you sure you want to delete this product?"
      />

      <div className="flex items-end justify-between gap-4">
        <div>
          <h1 className="admin-page-title">Products</h1>
          <p className="admin-page-subtitle">Inventory Management</p>
        </div>
        <Link
          to="/products/add"
          className="admin-btn-primary"
        >
          <Plus className="w-3.5 h-3.5" />
          Add New
        </Link>
      </div>

      <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden flex flex-col">
        {/* Compact Toolbar */}
        <div className="px-4 py-3 border-b border-slate-100 flex flex-wrap items-center gap-3 bg-slate-50/30">
          <div className="relative flex-1 min-w-[200px]">
            <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Quick search..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-white border border-slate-200 focus:border-brand rounded-lg pl-9 pr-4 py-1.5 text-xs text-slate-700 outline-none transition-all"
            />
          </div>

          <div className="flex items-center gap-2">
            {/* <div className="flex items-center gap-1.5 px-2 py-1 bg-white border border-slate-200 rounded-lg">
              <Filter className="w-3 h-3 text-slate-400" />
              <select
                value={categoryFilter}
                onChange={(e) => { setCategoryFilter(e.target.value); setCurrentPage(1); }}
                className="bg-transparent text-[11px] font-bold text-slate-600 outline-none cursor-pointer pr-1"
              >
                <option value="All">All</option>
                {activeCategories.map(cat => <option key={cat._id} value={cat.name}>{cat.name}</option>)}
              </select>
            </div> */}

            <div className="flex items-center gap-1.5 px-2 py-1 bg-white border border-slate-200 rounded-lg">
              <Package className="w-3 h-3 text-slate-400" />
              <select
                value={statusFilter}
                onChange={(e) => { setStatusFilter(e.target.value); setCurrentPage(1); }}
                className="bg-transparent text-[11px] font-bold text-slate-600 outline-none cursor-pointer pr-1"
              >
                {statuses.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
          </div>
        </div>

        {/* DataTable */}
        <DataTable
          columns={[
            { label: 'Product' },
            { label: 'Category' },
            { label: 'Price' },
            { label: 'Status' },
            { label: 'Priority' },
            { label: 'Actions', className: 'text-right' }
          ]}
          data={products}
          loading={loading}
          loadingMessage="Synchronizing database..."
          emptyMessage="No results found for current filters."
          pagination={pagination}
          onPageChange={handlePageChange}
          totalLabel="Records Found"
          renderRow={(product) => (
            <tr key={product._id || product.id} className="hover:bg-slate-50/80 transition-colors group">
              <td className="px-5 py-2.5">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-slate-50 border border-slate-100 flex items-center justify-center overflow-hidden shrink-0">
                    {product.image ? (
                      <img src={getImageUrl(product.image)} alt="" className="w-full h-full object-cover" />
                    ) : (
                      <Package className="w-4 h-4 text-slate-300" />
                    )}
                  </div>
                  <div className="font-bold text-slate-700 truncate max-w-[200px]">{product.name}</div>
                </div>
              </td>
              <td className="px-5 py-2.5">
                <span className="font-medium text-slate-500">{product.category}</span>
              </td>
              <td className="px-5 py-2.5">
                <span className="font-bold text-slate-900">
                  {product.variants?.[0]?.price ? `₹${product.variants[0].price.toLocaleString()}` : '—'}
                </span>
              </td>
              <td className="px-5 py-2.5">
                <span className={`inline-flex items-center px-2 py-0.5 rounded text-[9px] font-extrabold uppercase tracking-wider
                  ${product.stockStatus === 'Active' ? 'bg-emerald-50 text-emerald-600' : ''}
                  ${product.stockStatus === 'Draft' ? 'bg-slate-50 text-slate-500' : ''}
                  ${product.stockStatus === 'Out of Stock' ? 'bg-rose-50 text-rose-600' : ''}
                `}>
                  {product.stockStatus || 'Active'}
                </span>
              </td>
              <td className="px-5 py-2.5">
                <span className="font-bold text-slate-600">
                  {product.priority === 999999 ? '—' : (product.priority ?? '—')}
                </span>
              </td>
              <td className="px-5 py-2.5 text-right">
                <div className="flex items-center justify-end gap-1.5">
                  <button
                    onClick={() => navigate(`/products/${product._id || product.id}`)}
                    className="p-1.5 text-slate-400 hover:text-brand hover:bg-brand/5 rounded-md transition-all"
                  >
                    <Eye className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => navigate(`/products/edit/${product._id || product.id}`)}
                    className="p-1.5 text-amber-600 bg-amber-50/50 hover:bg-amber-600 hover:text-white rounded-md transition-all"
                  >
                    <Edit className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => setDeleteTarget(product._id || product.id)}
                    className="p-1.5 text-rose-600 bg-rose-50/50 hover:bg-rose-600 hover:text-white rounded-md transition-all"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </td>
            </tr>
          )}
        />
      </div>
    </div>
  )
}

export default Products
