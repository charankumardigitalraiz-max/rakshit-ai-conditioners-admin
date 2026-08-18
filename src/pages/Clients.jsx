import React, { useState, useEffect } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { Plus, Search, Edit, Trash2, MapPin, X, Upload, Zap, ChevronLeft, ChevronRight, Briefcase } from 'lucide-react'
import { fetchClients, createClient, deleteClientAsync, updateClientAsync } from '../store/slices/clientsSlice'
import { fetchCategories } from '../store/slices/categorySlice';
import { fetchBranches } from '../store/slices/branchesSlice';
import { getImageUrl } from '../utils/imageHandler'
import { toast } from 'react-hot-toast'
import DeleteConfirmModal from '../components/DeleteConfirmModal'
import DataTable from '../components/ui/DataTable'
import Modal from '../components/ui/Modal'
import { motion, AnimatePresence } from 'framer-motion'

const Clients = () => {
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [formData, setFormData] = useState({ name: '', hp: '', location: '', category: '', branch: '', priority: '' })
  const [editingId, setEditingId] = useState(null)
  const [selectedFile, setSelectedFile] = useState(null)
  const [previewImage, setPreviewImage] = useState(null)
  const [showValidation, setShowValidation] = useState(false)

  const [searchTerm, setSearchTerm] = useState('')
  const [debouncedSearch, setDebouncedSearch] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const [deleteTarget, setDeleteTarget] = useState(null)
  const [deleteLoading, setDeleteLoading] = useState(false)
  const [category, setCategory] = useState('')

  const { items: clients, loading, error, pagination } = useSelector(state => state.clients)
  const { items: branches } = useSelector(state => state.branches)
  const categories = useSelector(state => state.categories?.items || [])
  const activeCategories = categories.filter(c => c.status === 'active')
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
    dispatch(fetchBranches({ limit: 50 }))
  }, [dispatch])

  const handleSubmit = async (e) => {
    e.preventDefault()
    setShowValidation(true)

    if (!formData.name || !formData.location || !formData.category || !previewImage) {
      toast.error('All fields are mandatory')
      return
    }

    const data = new FormData()
    Object.keys(formData).forEach(key => data.append(key, formData[key]))
    if (selectedFile) data.append('image', selectedFile)

    try {
      if (editingId) {
        await dispatch(updateClientAsync({ id: editingId, data })).unwrap()
        toast.success('Client updated!')
        dispatch(fetchClients({ page: currentPage, limit: 12, search: debouncedSearch, category }))
      } else {
        await dispatch(createClient(data)).unwrap()
        toast.success('Client added!')
        if (currentPage !== 1) {
          setCurrentPage(1)
        } else {
          dispatch(fetchClients({ page: 1, limit: 12, search: debouncedSearch, category }))
        }
      }
      setIsFormOpen(false)
      resetForm()
    } catch (err) {
      toast.error(err.message || 'Failed to save')
    }
  }

  const resetForm = () => {
    setFormData({ name: '', hp: '', location: '', category: '', branch: '', priority: '' })
    setEditingId(null)
    setSelectedFile(null)
    setPreviewImage(null)
    setShowValidation(false)
  }

  const handleEdit = (client) => {
    setFormData({
      name: client.name,
      hp: client.hp || '',
      location: client.location || '',
      category: client.category?._id || client.category || '',
      branch: client.branch?._id || client.branch || '',
      priority: (client.priority === 9999 || client.priority === 999999 || client.priority == null) ? '' : client.priority
    })
    // dispatch(fetchCategories({ page: currentPage, limit: 12, search: debouncedSearch }))
    setEditingId(client._id || client.id)
    setPreviewImage(getImageUrl(client.image))
    setShowValidation(false)
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
      dispatch(fetchClients({ page: currentPage, limit: 12, search: debouncedSearch, category }))
    } catch {
      toast.error('Failed to delete')
    } finally {
      setDeleteLoading(false)
      setDeleteTarget(null)
    }
  }

  return (
    <div className="admin-page">
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
          <h1 className="admin-page-title">Our Clients</h1>
          <p className="admin-page-subtitle">Corporate Partners & Key Accounts</p>
        </div>
        <button
          onClick={() => { resetForm(); setIsFormOpen(true); }}
          className="admin-btn-primary"
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
              {activeCategories.map(cat => (
                <option key={cat._id} value={cat._id}>{cat.name}</option>
              ))}
            </select>
          </div>
        </div>

        {/* DataTable */}
        <DataTable
          columns={[
            { label: 'Client Name' },
            { label: 'Category' },
            { label: 'Branch' },
            { label: 'Location' },
            { label: 'Priority', className: 'text-center' },
            { label: 'Actions', className: 'text-right' }
          ]}
          data={clients}
          loading={loading}
          loadingMessage="Syncing partners..."
          emptyMessage="No clients found."
          pagination={pagination}
          onPageChange={setCurrentPage}
          totalLabel="Total Partners"
          renderRow={(client) => (
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
              <td className="px-5 py-2.5">
                <span className="px-2 py-0.5 rounded bg-blue-50 text-blue-600 font-bold text-[10px] border border-blue-100">
                  {client?.branch?.name || 'N/A'}
                </span>
              </td>
              <td className="px-5 py-2.5">
                <div className="flex items-center gap-1.5 text-slate-500">
                  <MapPin className="w-3 h-3 text-slate-400" />
                  {client.location || 'N/A'}
                </div>
              </td>
              <td className="px-5 py-2.5 text-center">
                <span className="font-bold text-slate-600">
                  {client.priority === 999999 ? '—' : (client.priority ?? '—')}
                </span>
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
          )}
        />
      </div>

      {/* Form Modal */}
      <Modal
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        title={editingId ? 'Edit Partner' : 'New Partner'}
        subtitle="Client Details"
        icon={Zap}
      >
        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          <div className="space-y-1">
            <div className="flex items-center justify-between">
              <label className={`text-[10px] font-bold uppercase tracking-wider ${showValidation && !formData.name ? 'text-rose-500' : 'text-slate-400'}`}>
                Partner Name
              </label>
              {showValidation && !formData.name && <span className="text-[9px] font-bold text-rose-500 uppercase tracking-wider">Required</span>}
            </div>
            <input
              type="text"
              value={formData.name}
              onChange={e => setFormData({ ...formData, name: e.target.value })}
              placeholder="e.g. Omega Hospital"
              className={`w-full bg-slate-50 border rounded-lg px-3 py-2 text-xs font-bold text-slate-900 outline-none transition-all ${showValidation && !formData.name ? 'border-rose-200 focus:border-rose-400' : 'border-slate-200 focus:border-brand'}`}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <div className="flex items-center justify-between">
                <label className={`text-[10px] font-bold uppercase tracking-wider ${showValidation && !formData.location ? 'text-rose-500' : 'text-slate-400'}`}>
                  Location
                </label>
                {showValidation && !formData.location && <span className="text-[9px] font-bold text-rose-500 uppercase tracking-wider">Required</span>}
              </div>
              <input
                type="text"
                value={formData.location}
                onChange={e => setFormData({ ...formData, location: e.target.value })}
                placeholder="e.g. Hyderabad"
                className={`w-full bg-slate-50 border rounded-lg px-3 py-2 text-xs font-bold text-slate-900 outline-none transition-all ${showValidation && !formData.location ? 'border-rose-200 focus:border-rose-400' : 'border-slate-200 focus:border-brand'}`}
              />
            </div>
          </div>

          <div className="space-y-1">
            <div className="flex items-center justify-between">
              <label className={`text-[10px] font-bold uppercase tracking-wider ${showValidation && !formData.category ? 'text-rose-500' : 'text-slate-400'}`}>
                Category
              </label>
              {showValidation && !formData.category && <span className="text-[9px] font-bold text-rose-500 uppercase tracking-wider">Required</span>}
            </div>
            <select
              value={formData.category}
              onChange={e => setFormData({ ...formData, category: e.target.value })}
              className={`w-full bg-slate-50 border rounded-lg px-3 py-2 text-xs font-bold text-slate-900 outline-none transition-all ${showValidation && !formData.category ? 'border-rose-200 focus:border-rose-400' : 'border-slate-200 focus:border-brand'}`}
            >
              <option value="">Select category</option>
              {activeCategories.map(cat => (
                <option key={cat._id} value={cat._id}>{cat.name}</option>
              ))}
            </select>
          </div>

          <div className="space-y-1">
            <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
              Branch
            </label>
            <select
              value={formData.branch}
              onChange={e => setFormData({ ...formData, branch: e.target.value })}
              className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs font-bold text-slate-900 outline-none transition-all focus:border-brand"
            >
              <option value="">Select branch</option>
              {branches.map(branch => (
                <option key={branch._id} value={branch._id}>{branch.name}</option>
              ))}
            </select>
          </div>

          <div className="space-y-1">
            <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
              Priority
            </label>
            <input
              type="number"
              value={formData.priority === 999999 ? '' : formData.priority}
              onChange={e => setFormData({ ...formData, priority: e.target.value === '' ? 999999 : parseInt(e.target.value) })}
              className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs font-bold text-slate-900 outline-none transition-all focus:border-brand"
            />
          </div>

          <div className="space-y-1">
            <div className="flex items-center justify-between">
              <label className={`text-[10px] font-bold uppercase tracking-wider ${showValidation && (!previewImage && !selectedFile) ? 'text-rose-500' : 'text-slate-400'}`}>
                Brand Logo
              </label>
              {showValidation && (!previewImage && !selectedFile) && <span className="text-[9px] font-bold text-rose-500 uppercase tracking-wider">Required</span>}
            </div>
            <label className={`relative block h-28 border-2 border-dashed rounded-xl overflow-hidden hover:bg-slate-50 cursor-pointer transition-all ${showValidation && (!previewImage && !selectedFile) ? 'border-rose-200 bg-rose-50/20' : 'border-slate-100'}`}>
              <input type="file" accept="image/*" className="hidden" onChange={onImageChange} />
              {previewImage ? (
                <img src={getImageUrl(previewImage)} alt="Preview" className="w-full h-full object-contain p-2" />
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
      </Modal>
    </div>
  )
}

export default Clients
