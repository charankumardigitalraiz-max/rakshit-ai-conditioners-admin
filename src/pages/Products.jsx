import React, { useEffect } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { Plus, Search, Filter, Edit, Trash2, Package, Eye } from 'lucide-react'
import { Link, useNavigate } from 'react-router-dom'
import { fetchProducts, deleteProductAsync } from '../store/slices/productsSlice'
import { getImageUrl } from '../utils/imageHandler'
import DeleteConfirmModal from '../components/DeleteConfirmModal'

const Products = () => {
  const { items: products, loading, error, pagination } = useSelector(state => state.products)
  const [searchTerm, setSearchTerm] = React.useState('')
  const [debouncedSearch, setDebouncedSearch] = React.useState('')
  const [categoryFilter, setCategoryFilter] = React.useState('All')
  const [statusFilter, setStatusFilter] = React.useState('All')
  const [currentPage, setCurrentPage] = React.useState(1)
  const [deleteTarget, setDeleteTarget] = React.useState(null)
  const [deleteLoading, setDeleteLoading] = React.useState(false)

  const dispatch = useDispatch()
  const navigate = useNavigate()

  const handleDelete = async () => {
    if (!deleteTarget) return
    setDeleteLoading(true)
    await dispatch(deleteProductAsync(deleteTarget))
    setDeleteLoading(false)
    setDeleteTarget(null)
  }

  // Debounce search term
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchTerm)
      setCurrentPage(1) // Reset to page 1 on new search
    }, 500)
    return () => clearTimeout(timer)
  }, [searchTerm])

  useEffect(() => {
    dispatch(fetchProducts({
      page: currentPage,
      limit: 10,
      search: debouncedSearch,
      category: categoryFilter,
      stockStatus: statusFilter
    }))
  }, [dispatch, currentPage, debouncedSearch, categoryFilter, statusFilter])

  const categories = ['All', 'Room AC', 'Commercial AC', 'Central AC', 'Ventilation']
  const statuses = ['All', 'Active', 'Draft', 'Out of Stock']

  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= pagination.pages) {
      setCurrentPage(newPage)
    }
  }

  return (
    <div className="space-y-6">
      <DeleteConfirmModal
        isOpen={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
        loading={deleteLoading}
        title="Delete Product"
        description="Are you sure you want to delete this product? This action cannot be undone."
      />
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Products Management</h1>
          <p className="text-sm text-slate-500 mt-1">Manage your catalog of air conditioners and HVAC systems.</p>
        </div>
        <Link
          to="/products/add"
          className="inline-flex items-center justify-center gap-2 bg-brand hover:bg-brand-hover text-white px-4 py-2.5 rounded-lg text-sm font-medium transition-colors shadow-sm shadow-brand/20">
          <Plus className="w-4 h-4" />
          Add Product
        </Link>
      </div>

      <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
        {/* Table Toolbar */}
        <div className="px-6 py-4 border-b border-slate-200 flex flex-col lg:flex-row lg:items-center gap-4 justify-between bg-white">
          <div className="flex flex-col sm:flex-row lg:flex-row justify-between  items-center gap-4 flex-1">
            {/* Search */}
            <div className="relative w-full sm:w-80">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Search products..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 focus:border-brand focus:ring-4 focus:ring-brand/5 rounded-xl pl-10 pr-4 py-2.5 text-sm text-slate-700 transition-all outline-none"
              />
            </div>

            {/* Filters */}
            <div className="flex items-center gap-2 w-full sm:w-auto">
              <div className="flex items-center gap-2 px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl">
                <Filter className="w-3.5 h-3.5 text-slate-400" />
                <select
                  value={categoryFilter}
                  onChange={(e) => { setCategoryFilter(e.target.value); setCurrentPage(1); }}
                  className="bg-transparent text-xs font-bold text-slate-600 outline-none cursor-pointer"
                >
                  {categories.map(cat => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>

              <div className="flex items-center gap-2 px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl">
                <Package className="w-3.5 h-3.5 text-slate-400" />
                <select
                  value={statusFilter}
                  onChange={(e) => { setStatusFilter(e.target.value); setCurrentPage(1); }}
                  className="bg-transparent text-xs font-bold text-slate-600 outline-none cursor-pointer"
                >
                  {statuses.map(s => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* <div className="flex items-center gap-3 shrink-0">
            <div className="h-8 w-px bg-slate-100 hidden lg:block" />
            <div className="px-3 py-1.5 bg-brand/5 border border-brand/10 rounded-lg">
              <span className="text-[11px] font-extrabold text-brand uppercase tracking-wider">
                {pagination.total} <span className="text-brand/60 font-medium">Results</span>
              </span>
            </div>
          </div> */}
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm whitespace-nowrap">
            <thead className="bg-brand border-b border-brand-hover">
              <tr>
                <th className="px-6 py-4 text-xs font-bold text-white">Product Info</th>
                <th className="px-6 py-4 text-xs font-bold text-white">Category</th>
                <th className="px-6 py-4 text-xs font-bold text-white">Price</th>
                <th className="px-6 py-4 text-xs font-bold text-white">Stock</th>
                <th className="px-6 py-4 text-xs font-bold text-white">Status</th>
                <th className="px-6 py-4 text-xs font-bold text-white text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading && (
                <tr><td colSpan={6} className="text-center py-12 text-slate-400">Loading products...</td></tr>
              )}
              {error && (
                <tr><td colSpan={6} className="text-center py-12 text-rose-500">{error}</td></tr>
              )}
              {!loading && !error && products.length === 0 && (
                <tr><td colSpan={6} className="text-center py-12 text-slate-400">No products found matching filters.</td></tr>
              )}
              {!loading && products.map((product) => (
                <tr key={product._id || product.id} className="hover:bg-slate-50/50 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-slate-100 border border-slate-200 flex items-center justify-center overflow-hidden">
                        {product.image ? (
                          <img src={getImageUrl(product.image)} alt="" className="w-full h-full object-cover" />
                        ) : (
                          <Package className="w-5 h-5 text-slate-400" />
                        )}
                      </div>
                      <div className="font-semibold text-slate-900">{product.name}</div>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-slate-600">{product.category}</td>
                  <td className="px-6 py-4 font-medium text-slate-900">
                    {product.variants?.[0]?.price ? `₹${product.variants[0].price.toLocaleString()}` : product.price || '—'}
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-slate-600">{product.stock || '—'}</span>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider
                      ${product.stockStatus === 'Active' ? 'bg-emerald-50 text-emerald-600 border border-emerald-100' : ''}
                      ${product.stockStatus === 'Draft' ? 'bg-slate-100 text-slate-600 border border-slate-100' : ''}
                      ${product.stockStatus === 'Out of Stock' ? 'bg-rose-50 text-rose-600 border border-rose-100' : ''}
                    `}>
                      {product.stockStatus || product.status || 'Active'}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-2.5">
                      <button
                        onClick={() => navigate(`/products/${product._id || product.id}`)}
                        title="View Details"
                        className="p-2 text-emerald-600 bg-emerald-50 hover:bg-emerald-600 hover:text-white rounded-xl transition-all duration-300 shadow-sm border border-emerald-100/50"
                      >
                        <Eye className="w-4 h-4" />
                      </button>

                      <button
                        onClick={() => navigate(`/products/edit/${product._id || product.id}`)}
                        title="Edit Product"
                        className="p-2 text-amber-600 bg-amber-50 hover:bg-amber-600 hover:text-white rounded-xl transition-all duration-300 shadow-sm border border-amber-100/50"
                      >
                        <Edit className="w-4 h-4" />
                      </button>

                      <button
                        onClick={() => setDeleteTarget(product._id || product.id)}
                        title="Delete Product"
                        className="p-2 text-rose-600 bg-rose-50 hover:bg-rose-600 hover:text-white rounded-xl transition-all duration-300 shadow-sm border border-rose-100/50"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="p-4 border-t border-slate-200 flex items-center justify-between text-sm text-slate-500">
          <div>
            Showing {Math.min((pagination.page - 1) * pagination.limit + 1, pagination.total)} to {Math.min(pagination.page * pagination.limit, pagination.total)} of {pagination.total} results
          </div>
          <div className="flex items-center gap-1">
            <button
              onClick={() => handlePageChange(pagination.page - 1)}
              disabled={pagination.page <= 1}
              className="px-3 py-1 border border-slate-200 rounded hover:bg-slate-50 disabled:opacity-50 transition-colors"
            >
              Prev
            </button>
            <div className="flex items-center gap-1">
              {[...Array(pagination.pages)].map((_, i) => (
                <button
                  key={i + 1}
                  onClick={() => handlePageChange(i + 1)}
                  className={`w-8 h-8 flex items-center justify-center rounded transition-colors ${pagination.page === i + 1 ? 'bg-brand text-white' : 'hover:bg-slate-50 text-slate-600 border border-slate-100'}`}
                >
                  {i + 1}
                </button>
              ))}
            </div>
            <button
              onClick={() => handlePageChange(pagination.page + 1)}
              disabled={pagination.page >= pagination.pages}
              className="px-3 py-1 border border-slate-200 rounded hover:bg-slate-50 disabled:opacity-50 transition-colors"
            >
              Next
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}


export default Products
