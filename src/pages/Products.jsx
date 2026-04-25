import React, { useEffect } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { Plus, Search, Filter, Edit, Trash2, Package, Eye, ChevronLeft, ChevronRight } from 'lucide-react'
import { Link, useNavigate } from 'react-router-dom'
import { fetchProducts, deleteProductAsync } from '../store/slices/productsSlice'
import { getImageUrl } from '../utils/imageHandler'
import DeleteConfirmModal from '../components/DeleteConfirmModal'
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

  const getPageNumbers = () => {
    const totalPages = pagination?.pages || 0;
    const currentPage = pagination?.page || 1;
    const maxVisible = 5;

    if (totalPages <= maxVisible) {
      return Array.from({ length: totalPages }, (_, i) => i + 1);
    }

    let start = Math.max(1, currentPage - Math.floor(maxVisible / 2));
    let end = start + maxVisible - 1;

    if (end > totalPages) {
      end = totalPages;
      start = Math.max(1, end - maxVisible + 1);
    }

    return Array.from({ length: end - start + 1 }, (_, i) => start + i);
  };

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

  const categories = ['All', 'Room AC', 'Split AC', 'Commercial AC', 'Central AC', 'Ventilation']
  const statuses = ['All', 'Active', 'Out of Stock', 'Inactive']

  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= pagination.pages) {
      setCurrentPage(newPage)
    }
  }

  return (
    <div className="space-y-5">
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
          <h1 className="text-lg font-bold text-slate-900 tracking-tight">Products</h1>
          <p className="text-[11px] font-medium text-slate-400 uppercase tracking-wider mt-0.5">Inventory Management</p>
        </div>
        <Link
          to="/products/add"
          className="inline-flex items-center gap-2 bg-slate-900 text-white px-3 py-2 rounded-lg text-xs font-bold hover:bg-brand transition-all shadow-sm"
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
            <div className="flex items-center gap-1.5 px-2 py-1 bg-white border border-slate-200 rounded-lg">
              <Filter className="w-3 h-3 text-slate-400" />
              <select
                value={categoryFilter}
                onChange={(e) => { setCategoryFilter(e.target.value); setCurrentPage(1); }}
                className="bg-transparent text-[11px] font-bold text-slate-600 outline-none cursor-pointer pr-1"
              >
                {categories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
              </select>
            </div>

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

        {/* Dense Table */}
        <div className="overflow-x-auto overflow-y-auto max-h-[60vh] custom-scrollbar">
          <table className="w-full text-left text-[12px] whitespace-nowrap">
            <thead className="bg-white sticky top-0 z-10 border-b border-slate-100">
              <tr>
                <th className="px-5 py-3 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Product</th>
                <th className="px-5 py-3 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Category</th>
                <th className="px-5 py-3 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Price</th>
                <th className="px-5 py-3 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Status</th>
                <th className="px-5 py-3 text-[10px] font-bold text-slate-400 uppercase tracking-widest text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {loading ? (
                <tr><td colSpan={5} className="text-center py-20 text-slate-300 animate-pulse">Synchronizing database...</td></tr>
              ) : products.length === 0 ? (
                <tr><td colSpan={5} className="text-center py-20 text-slate-400">No results found for current filters.</td></tr>
              ) : (
                products.map((product) => (
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
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Compact Pagination */}
        <div className="px-4 py-2.5 border-t border-slate-100 flex items-center justify-between bg-slate-50/20">
          <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
            {pagination.total} Records Found
          </div>

          <div className="flex items-center gap-1.5">
            <button
              onClick={() => handlePageChange(pagination.page - 1)}
              disabled={pagination.page <= 1}
              className="p-1 text-slate-400 hover:text-slate-900 disabled:opacity-30 transition-all"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>

            <div className="flex items-center gap-1">
              {getPageNumbers().map((p) => (
                <button
                  key={p}
                  onClick={() => handlePageChange(p)}
                  className={`w-6 h-6 flex items-center justify-center rounded-md text-[10px] font-bold transition-all ${pagination.page === p
                    ? 'bg-slate-900 text-white shadow-sm'
                    : 'text-slate-500 hover:bg-slate-100'
                    }`}
                >
                  {p}
                </button>
              ))}
            </div>

            <button
              onClick={() => handlePageChange(pagination.page + 1)}
              disabled={pagination.page >= pagination.pages}
              className="p-1 text-slate-400 hover:text-slate-900 disabled:opacity-30 transition-all"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Products
