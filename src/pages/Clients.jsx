import React, { useState, useEffect } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { Plus, Search, Edit, Trash2, MapPin, X, Upload, Zap } from 'lucide-react'
import { fetchClients, createClient, deleteClientAsync, updateClientAsync } from '../store/slices/clientsSlice'
import { fetchCategories } from '../store/slices/categorySlice';
import { getImageUrl } from '../utils/imageHandler'
import { toast } from 'react-hot-toast'
import DeleteConfirmModal from '../components/DeleteConfirmModal'

const Clients = () => {
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [formData, setFormData] = useState({ name: '', hp: '', location: '', category: '' })
  const [editingId, setEditingId] = useState(null)
  const [selectedFile, setSelectedFile] = useState(null)
  const [previewImage, setPreviewImage] = useState(null)

  const [searchTerm, setSearchTerm] = useState('')
  const [debouncedSearch, setDebouncedSearch] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const [deleteTarget, setDeleteTarget] = useState(null)
  const [deleteLoading, setDeleteLoading] = useState(false)
  const [category, setCategory] = useState('')
  const { items: clients, loading, error, pagination } = useSelector(state => state.clients)
  const categories = useSelector(state => state.categories?.items || [])
  const dispatch = useDispatch()

  // Debounce search term
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchTerm)
      setCurrentPage(1)
    }, 500)
    return () => clearTimeout(timer)
  }, [searchTerm])

  useEffect(() => {
    dispatch(fetchClients({
      page: currentPage,
      limit: 10,
      search: debouncedSearch,
      category: category
    }))
  }, [dispatch, currentPage, debouncedSearch, category])


  useEffect(() => {
    dispatch(fetchCategories({
      page: 1,
      limit: 50,
  }))
  }, [dispatch])

  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= pagination.pages) {
      setCurrentPage(newPage)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    const data = new FormData()
    Object.keys(formData).forEach(key => {
      data.append(key, formData[key])
    })
    if (selectedFile) {
      data.append('image', selectedFile)
    }

    try {
      if (editingId) {
        await dispatch(updateClientAsync({ id: editingId, data })).unwrap()
        toast.success('Client updated successfully!')
      } else {
        await dispatch(createClient(data)).unwrap()
        toast.success('Client created successfully!')
      }
      setIsFormOpen(false)
      resetForm()
      dispatch(fetchClients({ page: currentPage, limit: 10, search: debouncedSearch }))
    } catch (err) {
      toast.error(err.message || 'Failed to save client')
    }
  }

  const resetForm = () => {
    setFormData({ name: '', hp: '', location: '', category: '' })
    setEditingId(null)
    setSelectedFile(null)
    setPreviewImage(null)
  }

  const handleEdit = (client) => {
    setFormData({
      name: client.name,
      hp: client.hp || '',
      location: client.location || '',
      category: client.category?._id || client.category || ''
    })
    setEditingId(client._id || client.id)
    setPreviewImage(getImageUrl(client.image))
    setIsFormOpen(true)
  }

  const onImageChange = (e) => {
    const file = e.target.files[0]
    if (file) {
      setSelectedFile(file)
      const reader = new FileReader()
      reader.onloadend = () => {
        setPreviewImage(reader.result)
      }
      reader.readAsDataURL(file)
    }
  }

  const handleDelete = async () => {
    if (!deleteTarget) return
    setDeleteLoading(true)
    try {
      await dispatch(deleteClientAsync(deleteTarget)).unwrap()
      toast.success('Client deleted successfully!')
    } catch {
      toast.error('Failed to delete client')
    } finally {
      setDeleteLoading(false)
      setDeleteTarget(null)
    }
  }

  return (
    <div className="space-y-6">
      <DeleteConfirmModal
        isOpen={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
        loading={deleteLoading}
        title="Delete Client"
        description="Are you sure you want to delete this client? This will remove their record from the website."
      />

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Our Clients</h1>
          <p className="text-sm text-slate-500 mt-1">Manage the clients and corporate partners displayed on the website.</p>
        </div>
        <button
          onClick={() => { resetForm(); setIsFormOpen(true); }}
          className="inline-flex items-center justify-center gap-2 bg-brand hover:bg-brand-hover text-white px-4 py-2.5 rounded-lg text-sm font-medium transition-colors shadow-sm shadow-brand/20"
        >
          <Plus className="w-4 h-4" />
          Add Client
        </button>
      </div>

      <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-200 bg-white">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="relative w-full sm:w-80">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Search clients..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 focus:border-brand focus:ring-4 focus:ring-brand/5 rounded-xl pl-10 pr-4 py-2.5 text-sm text-slate-700 transition-all outline-none"
              />
            </div>
            <div className="w-full sm:w-56">
              <select
                value={category}
                onChange={(e) => { setCategory(e.target.value); setCurrentPage(1) }}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm text-slate-700 focus:border-brand focus:ring-4 focus:ring-brand/5 outline-none"
              >
                <option value="">All Categories</option>
                {categories.map(cat => (
                  <option key={cat._id || cat.id} value={cat._id || cat.id}>
                    {cat.name}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm whitespace-nowrap">
            <thead className="bg-brand border-b border-brand-hover">
              <tr>
                <th className="px-6 py-4 text-xs font-bold text-white">Client</th>
                 <th className="px-6 py-4 text-xs font-bold text-white">Category</th>
                <th className="px-6 py-4 text-xs font-bold text-white">Capacity (HP)</th>
                <th className="px-6 py-4 text-xs font-bold text-white">Location</th>
                <th className="px-6 py-4 text-xs font-bold text-white text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading && (
                <tr><td colSpan={4} className="text-center py-12 text-slate-400">Loading clients...</td></tr>
              )}
              {error && (
                <tr><td colSpan={4} className="text-center py-12 text-rose-500">{error}</td></tr>
              )}
              {!loading && clients.length === 0 && (
                <tr><td colSpan={4} className="text-center py-12 text-slate-400">No clients found matching your search.</td></tr>
              )}
              {!loading && clients.map((client) => (
                <tr key={client._id || client.id} className="hover:bg-slate-50/50 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-lg bg-slate-100 border border-slate-200 flex items-center justify-center overflow-hidden p-1">
                        {client.image ? (
                          <img src={getImageUrl(client.image)} alt="" className="w-full h-full object-contain" />
                        ) : (
                          <div className="w-full h-full bg-slate-200 flex items-center justify-center text-xs font-bold text-slate-400">{client.name.charAt(0)}</div>
                        )}
                      </div>
                      <div className="font-semibold text-slate-900">{client.name}</div>
                    </div>
                  </td>
                                    <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <span className="inline-flex items-center rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-700">
                        {client?.category?.name || 'N/A'}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-1.5 text-slate-600">
                      <Zap className="w-3.5 h-3.5 text-blue-400" />
                      <span className="font-medium">{client.hp || 'N/A'}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-1.5 text-slate-600">
                      <MapPin className="w-3.5 h-3.5 text-slate-400" />
                      {client.location || 'N/A'}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-2.5">
                      <button
                        onClick={() => handleEdit(client)}
                        title="Edit Client"
                        className="p-2 text-amber-600 bg-amber-50 hover:bg-amber-600 hover:text-white rounded-xl transition-all duration-300 shadow-sm border border-amber-100/50"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => setDeleteTarget(client._id || client.id)}
                        title="Delete Client"
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
        {pagination.pages > 1 && (
          <div className="p-4 border-t border-slate-200 flex items-center justify-between text-xs text-slate-500 bg-slate-50/30">
            <div>
              Showing <span className="font-medium text-slate-900">{(pagination.page - 1) * pagination.limit + 1}</span> to <span className="font-medium text-slate-900">{Math.min(pagination.page * pagination.limit, pagination.total)}</span> of <span className="font-medium text-slate-900">{pagination.total}</span> results
            </div>
            <div className="flex items-center gap-1">
              <button
                onClick={() => handlePageChange(pagination.page - 1)}
                disabled={pagination.page <= 1}
                className="px-3 py-1.5 border border-slate-200 rounded-lg hover:bg-white disabled:opacity-50 transition-all font-medium"
              >
                Prev
              </button>
              {[...Array(pagination.pages)].map((_, i) => (
                <button
                  key={i + 1}
                  onClick={() => handlePageChange(i + 1)}
                  className={`w-8 h-8 flex items-center justify-center rounded-lg font-bold transition-all ${pagination.page === i + 1 ? 'bg-brand text-white shadow-md shadow-brand/20' : 'hover:bg-white text-slate-600 border border-transparent'}`}
                >
                  {i + 1}
                </button>
              ))}
              <button
                onClick={() => handlePageChange(pagination.page + 1)}
                disabled={pagination.page >= pagination.pages}
                className="px-3 py-1.5 border border-slate-200 rounded-lg hover:bg-white disabled:opacity-50 transition-all font-medium"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Form Modal */}
      {isFormOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg max-h-[90vh] flex flex-col overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between">
              <h2 className="text-lg font-bold text-slate-900">{editingId ? 'Edit Client' : 'Add New Client'}</h2>
              <button onClick={() => setIsFormOpen(false)} className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-full transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 overflow-y-auto flex-1">
              <form id="clientForm" onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-700">Client Name</label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={e => setFormData({ ...formData, name: e.target.value })}
                    placeholder="e.g. OMEGA HOSPITAL"
                    className="w-full bg-slate-50 border border-slate-200 focus:bg-white focus:border-brand focus:ring-2 focus:ring-brand/20 rounded-lg px-4 py-2.5 text-sm text-slate-900 outline-none transition-all"
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-slate-700">Capacity (HP)</label>
                    <input
                      type="text"
                      value={formData.hp}
                      onChange={e => setFormData({ ...formData, hp: e.target.value })}
                      placeholder="e.g. 1100"
                      className="w-full bg-slate-50 border border-slate-200 focus:bg-white focus:border-brand focus:ring-2 focus:ring-brand/20 rounded-lg px-4 py-2.5 text-sm text-slate-900 outline-none transition-all"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-slate-700">Location (City)</label>
                    <input
                      type="text"
                      value={formData.location}
                      onChange={e => setFormData({ ...formData, location: e.target.value })}
                      placeholder="e.g. Gachibowli"
                      className="w-full bg-slate-50 border border-slate-200 focus:bg-white focus:border-brand focus:ring-2 focus:ring-brand/20 rounded-lg px-4 py-2.5 text-sm text-slate-900 outline-none transition-all"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-700">Category</label>
                  <select
                    value={formData.category}
                    onChange={e => setFormData({ ...formData, category: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 focus:bg-white focus:border-brand focus:ring-2 focus:ring-brand/20 rounded-lg px-4 py-2.5 text-sm text-slate-900 outline-none transition-all"
                  >
                    <option value="">Select category</option>
                    {categories.map(cat => (
                      <option key={cat._id || cat.id} value={cat._id || cat.id}>
                        {cat.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-700 flex items-center justify-between">
                    Client Logo / Image
                    <span className="text-[10px] text-slate-400 font-normal tracking-normal">Transparent PNG preferred</span>
                  </label>
                  <label className="border-2 border-dashed border-slate-200 rounded-xl p-8 flex flex-col items-center justify-center text-center hover:bg-slate-50 hover:border-brand/40 transition-colors cursor-pointer group relative overflow-hidden h-40">
                    <input type="file" accept="image/*" className="hidden" onChange={onImageChange} />
                    {previewImage ? (
                      <img src={previewImage} alt="Preview" className="absolute inset-0 w-full h-full object-contain p-4" />
                    ) : (
                      <>
                        <div className="w-10 h-10 bg-blue-50 rounded-full flex items-center justify-center mb-2">
                          <Upload className="w-5 h-5 text-brand" />
                        </div>
                        <p className="text-xs font-medium text-slate-700">Click to upload</p>
                      </>
                    )}
                  </label>
                </div>
              </form>
            </div>

            <div className="px-6 py-4 border-t border-slate-200 bg-slate-50 flex items-center justify-end gap-3">
              <button onClick={() => setIsFormOpen(false)} className="px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-200 bg-white border border-slate-200 rounded-lg transition-colors">
                Cancel
              </button>
              <button type="submit" form="clientForm" className="px-4 py-2 text-sm font-medium text-white bg-brand hover:bg-brand-hover rounded-lg transition-colors shadow-sm shadow-brand/20">
                {editingId ? 'Update Client' : 'Add Client'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default Clients
