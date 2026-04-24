import React, { useState, useEffect } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { Plus, Search, Edit, Trash2, MapPin, X, Upload, Zap, ChevronLeft, ChevronRight, Briefcase } from 'lucide-react'
import { fetchClients, createClient, deleteClientAsync, updateClientAsync } from '../store/slices/clientsSlice'
import { fetchCategories } from '../store/slices/categorySlice';
import { getImageUrl } from '../utils/imageHandler'
import { toast } from 'react-hot-toast'
import DeleteConfirmModal from '../components/DeleteConfirmModal'
import { motion, AnimatePresence } from 'framer-motion'

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

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchTerm)
      setCurrentPage(1)
    }, 400)
    return () => clearTimeout(timer)
  }, [searchTerm])

  useEffect(() => {
    dispatch(fetchClients({
      page: currentPage,
      limit: 12,
      search: debouncedSearch,
      category: category
    }))
  }, [dispatch, currentPage, debouncedSearch, category])

  useEffect(() => {
    dispatch(fetchCategories({ page: 1, limit: 50 }))
  }, [dispatch])

  const handleSubmit = async (e) => {
    e.preventDefault()
    const data = new FormData()
    Object.keys(formData).forEach(key => data.append(key, formData[key]))
    if (selectedFile) data.append('image', selectedFile)

    try {
      if (editingId) {
        await dispatch(updateClientAsync({ id: editingId, data })).unwrap()
        toast.success('Client updated!')
      } else {
        await dispatch(createClient(data)).unwrap()
        toast.success('Client added!')
      }
      setIsFormOpen(false)
      resetForm()
    } catch (err) {
      toast.error(err.message || 'Failed to save')
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
      reader.onloadend = () => setPreviewImage(reader.result)
      reader.readAsDataURL(file)
    }
  }

  const handleDelete = async () => {
    if (!deleteTarget) return
    setDeleteLoading(true)
    try {
      await dispatch(deleteClientAsync(deleteTarget)).unwrap()
      toast.success('Client deleted!')
    } catch {
      toast.error('Failed to delete')
    } finally {
      setDeleteLoading(false)
      setDeleteTarget(null)
    }
  }

  return (
    <div className="space-y-5">
      <DeleteConfirmModal
        isOpen={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
        loading={deleteLoading}
        title="Delete Client"
        description="Are you sure you want to remove this client partner?"
      />

      <div className="flex items-end justify-between gap-4">
        <div>
          <h1 className="text-lg font-bold text-slate-900 tracking-tight">Our Clients</h1>
          <p className="text-[11px] font-medium text-slate-400 uppercase tracking-wider mt-0.5">Corporate Partners & Key Accounts</p>
        </div>
        <button
          onClick={() => { resetForm(); setIsFormOpen(true); }}
          className="inline-flex items-center gap-2 bg-slate-900 hover:bg-slate-800 text-white px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all shadow-sm"
        >
          <Plus className="w-3.5 h-3.5" />
          Add Client
        </button>
      </div>

      <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden flex flex-col">
        {/* Toolbar */}
        <div className="px-4 py-3 border-b border-slate-100 flex flex-wrap items-center gap-3 bg-slate-50/30">
          <div className="relative flex-1 min-w-[200px]">
            <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search clients..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-white border border-slate-200 focus:border-brand rounded-lg pl-9 pr-4 py-1.5 text-xs text-slate-700 outline-none transition-all"
            />
          </div>

          <div className="flex items-center gap-1.5 px-2 py-1 bg-white border border-slate-200 rounded-lg">
            <Briefcase className="w-3 h-3 text-slate-400" />
            <select
              value={category}
              onChange={(e) => { setCategory(e.target.value); setCurrentPage(1) }}
              className="bg-transparent text-[11px] font-bold text-slate-600 outline-none cursor-pointer pr-1"
            >
              <option value="">All Categories</option>
              {categories.map(cat => (
                <option key={cat._id} value={cat._id}>{cat.name}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto overflow-y-auto max-h-[60vh] custom-scrollbar">
          <table className="w-full text-left text-[12px] whitespace-nowrap">
            <thead className="bg-white sticky top-0 z-10 border-b border-slate-100">
              <tr>
                <th className="px-5 py-3 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Client Name</th>
                <th className="px-5 py-3 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Category</th>
                <th className="px-5 py-3 text-[10px] font-bold text-slate-400 uppercase tracking-widest text-center">Capacity (HP)</th>
                <th className="px-5 py-3 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Location</th>
                <th className="px-5 py-3 text-[10px] font-bold text-slate-400 uppercase tracking-widest text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {loading ? (
                <tr><td colSpan={5} className="text-center py-20 text-slate-300 animate-pulse font-bold">Syncing partners...</td></tr>
              ) : clients.length === 0 ? (
                <tr><td colSpan={5} className="text-center py-20 text-slate-400">No clients found.</td></tr>
              ) : (
                clients.map((client) => (
                  <tr key={client._id} className="hover:bg-slate-50/80 transition-colors group">
                    <td className="px-5 py-2.5">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded bg-slate-50 border border-slate-100 flex items-center justify-center overflow-hidden shrink-0 shadow-sm p-1">
                          {client.image ? (
                            <img src={getImageUrl(client.image)} alt="" className="w-full h-full object-contain" />
                          ) : (
                            <span className="text-[10px] font-bold text-slate-300">{client.name.charAt(0)}</span>
                          )}
                        </div>
                        <span className="font-bold text-slate-900">{client.name}</span>
                      </div>
                    </td>
                    <td className="px-5 py-2.5">
                      <span className="px-2 py-0.5 rounded bg-slate-50 text-slate-500 font-bold text-[10px] border border-slate-100">
                        {client?.category?.name || 'N/A'}
                      </span>
                    </td>
                    <td className="px-5 py-2.5 text-center">
                      <div className="inline-flex items-center gap-1.5 px-2 py-0.5 bg-blue-50 text-blue-600 rounded text-[10px] font-bold">
                        <Zap className="w-3 h-3" />
                        {client.hp || 'N/A'}
                      </div>
                    </td>
                    <td className="px-5 py-2.5 text-slate-500">
                      <div className="flex items-center gap-1.5">
                        <MapPin className="w-3 h-3 text-slate-300" />
                        {client.location || 'N/A'}
                      </div>
                    </td>
                    <td className="px-5 py-2.5 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button onClick={() => handleEdit(client)} className="p-1.5 text-amber-600 bg-amber-50/50 hover:bg-amber-600 hover:text-white rounded-md transition-all">
                          <Edit className="w-3.5 h-3.5" />
                        </button>
                        <button onClick={() => setDeleteTarget(client._id)} className="p-1.5 text-rose-600 bg-rose-50/50 hover:bg-rose-600 hover:text-white rounded-md transition-all">
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

        {/* Pagination */}
        <div className="px-4 py-2.5 border-t border-slate-100 flex items-center justify-between bg-slate-50/20">
          <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
            {pagination.total} Total Partners
          </div>
          <div className="flex items-center gap-1.5">
            <button onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))} disabled={pagination.page <= 1} className="p-1 text-slate-400 hover:text-slate-900 disabled:opacity-30 transition-all">
              <ChevronLeft className="w-4 h-4" />
            </button>
            <div className="flex items-center gap-1">
              {[...Array(Math.min(pagination.pages, 5))].map((_, i) => (
                <button key={i + 1} onClick={() => setCurrentPage(i + 1)} className={`w-6 h-6 flex items-center justify-center rounded-md text-[10px] font-bold transition-all ${pagination.page === i + 1 ? 'bg-slate-900 text-white' : 'text-slate-500 hover:bg-slate-100'}`}>
                  {i + 1}
                </button>
              ))}
            </div>
            <button onClick={() => setCurrentPage(prev => Math.min(pagination.pages, prev + 1))} disabled={pagination.page >= pagination.pages} className="p-1 text-slate-400 hover:text-slate-900 disabled:opacity-30 transition-all">
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Form Modal */}
      <AnimatePresence>
        {isFormOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-[2px]">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-xl shadow-2xl w-full max-w-md overflow-hidden border border-slate-200"
            >
              <div className="px-5 py-3 border-b border-slate-100 flex items-center justify-between bg-white sticky top-0 z-10">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-slate-900 flex items-center justify-center text-white">
                    <Zap className="w-4 h-4" />
                  </div>
                  <div>
                    <h2 className="text-sm font-bold text-slate-900 leading-tight">{editingId ? 'Edit Partner' : 'New Partner'}</h2>
                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Client Details</p>
                  </div>
                </div>
                <button onClick={() => setIsFormOpen(false)} className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-50 rounded-lg transition-all">
                  <X className="w-4 h-4" />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="p-5 space-y-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Partner Name</label>
                  <input type="text" value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} placeholder="e.g. Omega Hospital" className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs font-bold text-slate-900 outline-none focus:border-brand transition-all" required />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  {/* <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Capacity (HP)</label>
                    <input type="text" value={formData.hp} onChange={e => setFormData({ ...formData, hp: e.target.value })} placeholder="e.g. 1100" className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs font-bold text-slate-900 outline-none focus:border-brand transition-all" />
                  </div> */}
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Location</label>
                    <input type="text" value={formData.location} onChange={e => setFormData({ ...formData, location: e.target.value })} placeholder="e.g. Hyderabad" className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs font-bold text-slate-900 outline-none focus:border-brand transition-all" />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Category</label>
                  <select value={formData.category} onChange={e => setFormData({ ...formData, category: e.target.value })} className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs font-bold text-slate-900 outline-none focus:border-brand transition-all">
                    <option value="">Select category</option>
                    {categories.map(cat => (
                      <option key={cat._id} value={cat._id}>{cat.name}</option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Brand Logo</label>
                  <label className="relative block h-28 border-2 border-dashed border-slate-100 rounded-xl overflow-hidden hover:bg-slate-50 cursor-pointer transition-all">
                    <input type="file" accept="image/*" className="hidden" onChange={onImageChange} />
                    {previewImage ? (
                      <img src={previewImage} alt="Preview" className="w-full h-full object-contain p-2" />
                    ) : (
                      <div className="flex flex-col items-center justify-center h-full text-slate-300">
                        <Upload className="w-5 h-5 mb-1" />
                        <span className="text-[9px] font-bold uppercase tracking-wider">Upload PNG</span>
                      </div>
                    )}
                  </label>
                </div>

                <div className="flex items-center justify-end gap-3 pt-2">
                  <button type="button" onClick={() => setIsFormOpen(false)} className="px-4 py-1.5 text-xs font-bold text-slate-500 hover:bg-slate-100 rounded-lg transition-all">
                    Cancel
                  </button>
                  <button type="submit" className="px-5 py-1.5 text-xs font-bold text-white bg-slate-900 rounded-lg hover:bg-slate-800 transition-all shadow-sm">
                    {editingId ? 'Update Partner' : 'Add Partner'}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  )
}

export default Clients
