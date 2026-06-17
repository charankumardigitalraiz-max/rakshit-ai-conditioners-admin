import React, { useState, useEffect } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { Plus, Wrench, Edit, Trash2, X, Upload, Search, ChevronLeft, ChevronRight } from 'lucide-react'
import { fetchServices, createService, deleteServiceAsync, updateServiceAsync } from '../store/slices/servicesSlice'
import { getImageUrl } from '../utils/imageHandler'
import { toast } from 'react-hot-toast'
import DeleteConfirmModal from '../components/DeleteConfirmModal'
import { motion, AnimatePresence } from 'framer-motion'

const Services = () => {
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [editingId, setEditingId] = useState(null)
  const [formData, setFormData] = useState({ title: '', description: '', status: 'Active' })
  const [selectedFile, setSelectedFile] = useState(null)
  const [previewImage, setPreviewImage] = useState(null)
  const [deleteTarget, setDeleteTarget] = useState(null)
  const [deleteLoading, setDeleteLoading] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [debouncedSearch, setDebouncedSearch] = useState('')
  const [currentPage, setCurrentPage] = useState(1)

  const { items: services, loading, pagination } = useSelector(state => state.services)
  const dispatch = useDispatch()

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchTerm)
      setCurrentPage(1)
    }, 400)
    return () => clearTimeout(timer)
  }, [searchTerm])

  useEffect(() => {
    dispatch(fetchServices({ page: currentPage, limit: 12, search: debouncedSearch }))
  }, [dispatch, currentPage, debouncedSearch])

  const handleSubmit = async (e) => {
    e.preventDefault()
    const data = new FormData()
    Object.keys(formData).forEach(key => data.append(key, formData[key]))
    if (selectedFile) data.append('image', selectedFile)

    try {
      if (editingId) {
        await dispatch(updateServiceAsync({ id: editingId, data })).unwrap()
        toast.success('Service updated!')
        dispatch(fetchServices({ page: currentPage, limit: 12, search: debouncedSearch }))
      } else {
        await dispatch(createService(data)).unwrap()
        toast.success('Service added!')
        if (currentPage !== 1) {
          setCurrentPage(1)
        } else {
          dispatch(fetchServices({ page: 1, limit: 12, search: debouncedSearch }))
        }
      }
      closeModal()
    } catch (err) {
      toast.error(err.message || 'Failed to save')
    }
  }

  const handleEdit = (service) => {
    setEditingId(service._id || service.id)
    setFormData({
      title: service.title,
      description: service.description || '',
      status: service.status || 'Active'
    })
    setPreviewImage(service.image)
    setIsFormOpen(true)
  }

  const closeModal = () => {
    setIsFormOpen(false)
    setEditingId(null)
    setFormData({ title: '', description: '', status: 'Active' })
    setSelectedFile(null)
    setPreviewImage(null)
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
      await dispatch(deleteServiceAsync(deleteTarget)).unwrap()
      toast.success('Removed successfully!')
      dispatch(fetchServices({ page: currentPage, limit: 12, search: debouncedSearch }))
    } catch {
      toast.error('Failed to remove')
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
        title="Remove Service"
        description="This will permanently delete this service."
      />

      <div className="flex items-end justify-between gap-4">
        <div>
          <h1 className="text-lg font-bold text-slate-900 tracking-tight">Services</h1>
          <p className="text-[11px] font-medium text-slate-400 uppercase tracking-wider mt-0.5">HVAC Service Offerings</p>
        </div>
        <button
          onClick={() => setIsFormOpen(true)}
          className="inline-flex items-center gap-2 bg-slate-900 hover:bg-slate-800 text-white px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all shadow-sm"
        >
          <Plus className="w-3.5 h-3.5" />
          Add Service
        </button>
      </div>

      <div className="relative max-w-xs">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
        <input
          type="text"
          value={searchTerm}
          onChange={e => setSearchTerm(e.target.value)}
          placeholder="Search services..."
          className="w-full bg-white border border-slate-200 rounded-lg pl-9 pr-3 py-2 text-xs font-medium text-slate-900 outline-none focus:border-brand transition-all"
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {loading && services.length === 0 ? (
          <div className="col-span-full py-20 text-center text-slate-300 animate-pulse font-bold text-xs uppercase tracking-widest">
            Loading Services...
          </div>
        ) : services.length === 0 ? (
          <div className="col-span-full py-20 text-center text-slate-400 font-bold text-xs uppercase tracking-widest border-2 border-dashed border-slate-100 rounded-xl">
            No services found.
          </div>
        ) : (
          services.map((item) => (
            <div key={item._id} className="group bg-white border border-slate-200 rounded-xl overflow-hidden flex flex-col hover:border-brand/40 hover:shadow-md transition-all">
              <div className="h-32 bg-slate-50 border-b border-slate-100 flex items-center justify-center relative overflow-hidden shrink-0">
                {item.image ? (
                  <img src={getImageUrl(item.image)} alt="" className="absolute inset-0 w-full h-full object-cover" />
                ) : (
                  <div className="w-10 h-10 bg-white rounded-lg border border-slate-200 flex items-center justify-center shadow-sm relative z-10 group-hover:scale-110 transition-transform">
                    <Wrench className="w-5 h-5 text-brand" />
                  </div>
                )}
                <div className="absolute top-2 right-2 flex gap-1">
                  <button onClick={() => handleEdit(item)} className="p-1.5 bg-amber-500 text-white rounded-md shadow-sm border border-amber-600 transition-all hover:bg-amber-600">
                    <Edit className="w-3 h-3" />
                  </button>
                  <button onClick={() => setDeleteTarget(item._id)} className="p-1.5 bg-rose-500 text-white rounded-md shadow-sm border border-rose-600 transition-all hover:bg-rose-600">
                    <Trash2 className="w-3 h-3" />
                  </button>
                </div>
              </div>

              <div className="p-3.5 flex-1 flex flex-col">
                <div className="flex items-center justify-between mb-2">
                  <span className={`text-[9px] font-extrabold uppercase tracking-wider ${item.status === 'Active' ? 'text-emerald-500' : 'text-slate-400'}`}>
                    {item.status}
                  </span>
                </div>
                <h3 className="text-[13px] font-bold text-slate-900 mb-1 leading-tight line-clamp-1">
                  {item.title}
                </h3>
                <p className="text-[11px] text-slate-500 line-clamp-2 leading-relaxed">
                  {item.description}
                </p>
              </div>
            </div>
          ))
        )}

        <button
          onClick={() => setIsFormOpen(true)}
          className="bg-slate-50 border-2 border-dashed border-slate-200 rounded-xl flex flex-col items-center justify-center text-center p-6 min-h-[160px] hover:bg-slate-100 hover:border-brand/30 transition-all group"
        >
          <div className="w-8 h-8 bg-white rounded-full border border-slate-200 flex items-center justify-center mb-2 group-hover:scale-110 transition-transform shadow-sm">
            <Plus className="w-4 h-4 text-slate-400 group-hover:text-brand" />
          </div>
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Add Service</p>
        </button>
      </div>

      {pagination.pages > 1 && (
        <div className="flex items-center justify-between pt-2">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
            {pagination.total} Services
          </span>
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
      )}

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
                    <Wrench className="w-4 h-4" />
                  </div>
                  <div>
                    <h2 className="text-sm font-bold text-slate-900 leading-tight">{editingId ? 'Edit Service' : 'New Service'}</h2>
                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Service Details</p>
                  </div>
                </div>
                <button onClick={closeModal} className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-50 rounded-lg transition-all">
                  <X className="w-4 h-4" />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="p-5 space-y-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Service Title</label>
                  <input type="text" value={formData.title} onChange={e => setFormData({ ...formData, title: e.target.value })} placeholder="e.g. Precision Room Cooling" className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs font-bold text-slate-900 outline-none focus:border-brand transition-all" required />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Description</label>
                  <textarea rows="3" value={formData.description} onChange={e => setFormData({ ...formData, description: e.target.value })} placeholder="Brief description of the service..." className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs font-bold text-slate-900 outline-none focus:border-brand transition-all resize-none" />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Status</label>
                  <select value={formData.status} onChange={e => setFormData({ ...formData, status: e.target.value })} className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs font-bold text-slate-900 outline-none focus:border-brand transition-all">
                    <option value="Active">Active</option>
                    <option value="Inactive">Inactive</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Thumbnail</label>
                  <label className="relative block h-28 border-2 border-dashed border-slate-100 rounded-xl overflow-hidden hover:bg-slate-50 cursor-pointer transition-all">
                    <input type="file" accept="image/*" className="hidden" onChange={onImageChange} />
                    {previewImage ? (
                      <img src={getImageUrl(previewImage)} alt="Preview" className="w-full h-full object-cover" />
                    ) : (
                      <div className="flex flex-col items-center justify-center h-full text-slate-300">
                        <Upload className="w-5 h-5 mb-1" />
                        <span className="text-[9px] font-bold uppercase tracking-wider">Upload Image</span>
                      </div>
                    )}
                  </label>
                </div>

                <div className="flex items-center justify-end gap-3 pt-2">
                  <button type="button" onClick={closeModal} className="px-4 py-1.5 text-xs font-bold text-slate-500 hover:bg-slate-100 rounded-lg transition-all">
                    Cancel
                  </button>
                  <button type="submit" className="px-5 py-1.5 text-xs font-bold text-white bg-slate-900 rounded-lg hover:bg-slate-800 transition-all shadow-sm">
                    {editingId ? 'Update Service' : 'Publish Service'}
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

export default Services
