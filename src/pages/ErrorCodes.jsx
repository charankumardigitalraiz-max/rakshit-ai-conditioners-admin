import React, { useState, useEffect } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { Plus, Search, Edit, Trash2, X, AlertTriangle } from 'lucide-react'
import { toast } from 'react-hot-toast'
import DeleteConfirmModal from '../components/DeleteConfirmModal'
import Modal from '../components/ui/Modal'
import { motion, AnimatePresence } from 'framer-motion'
import {
  fetchErrorCodes,
  createErrorCode,
  updateErrorCodeAsync,
  deleteErrorCodeAsync,
} from '../store/slices/errorCodesSlice'

const UNIT_OPTIONS = ['Indoor Unit', 'Outdoor Unit', 'System']

const emptyForm = {
  code: '',
  unit: 'Indoor Unit',
  title: '',
  description: '',
  action: '',
  isActive: true,
  sortOrder: 1,
}

const unitBadgeClass = (unit) => {
  if (unit === 'Indoor Unit') return 'bg-green-50 text-green-700 border-green-100'
  if (unit === 'Outdoor Unit') return 'bg-orange-50 text-orange-700 border-orange-100'
  return 'bg-purple-50 text-purple-700 border-purple-100'
}

const ErrorCodes = () => {
  const dispatch = useDispatch()
  const { items: errorCodes, loading } = useSelector((state) => state.errorCodes)

  const [isFormOpen, setIsFormOpen] = useState(false)
  const [formData, setFormData] = useState(emptyForm)
  const [editingId, setEditingId] = useState(null)
  const [showValidation, setShowValidation] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [debouncedSearch, setDebouncedSearch] = useState('')
  const [unitFilter, setUnitFilter] = useState('All')
  const [deleteTarget, setDeleteTarget] = useState(null)
  const [deleteLoading, setDeleteLoading] = useState(false)
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(searchTerm), 400)
    return () => clearTimeout(timer)
  }, [searchTerm])

  useEffect(() => {
    dispatch(fetchErrorCodes({
      limit: 200,
      search: debouncedSearch || undefined,
      unit: unitFilter !== 'All' ? unitFilter : undefined,
    }))
  }, [dispatch, debouncedSearch, unitFilter])

  const resetForm = () => {
    setFormData(emptyForm)
    setEditingId(null)
    setShowValidation(false)
  }

  const openCreate = () => {
    resetForm()
    setFormData({ ...emptyForm, sortOrder: errorCodes.length + 1 })
    setIsFormOpen(true)
  }

  const openEdit = (item) => {
    setEditingId(item._id)
    setFormData({
      code: item.code || '',
      unit: item.unit || 'Indoor Unit',
      title: item.title || '',
      description: item.description || '',
      action: item.action || '',
      isActive: item.isActive !== false,
      sortOrder: item.sortOrder || 1,
    })
    setShowValidation(false)
    setIsFormOpen(true)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setShowValidation(true)

    if (!formData.code || !formData.title || !formData.description || !formData.action) {
      toast.error('Code, title, description, and action are required')
      return
    }

    setSubmitting(true)
    try {
      const payload = {
        ...formData,
        code: formData.code.toUpperCase().trim(),
        isActive: Boolean(formData.isActive),
        sortOrder: parseInt(formData.sortOrder, 10) || 1,
      }

      if (editingId) {
        await dispatch(updateErrorCodeAsync({ id: editingId, data: payload })).unwrap()
        toast.success('Error code updated')
      } else {
        await dispatch(createErrorCode(payload)).unwrap()
        toast.success('Error code added')
      }

      dispatch(fetchErrorCodes({
        limit: 200,
        search: debouncedSearch || undefined,
        unit: unitFilter !== 'All' ? unitFilter : undefined,
      }))
      setIsFormOpen(false)
      resetForm()
    } catch (err) {
      toast.error(err || 'Failed to save error code')
    } finally {
      setSubmitting(false)
    }
  }

  const handleDelete = async () => {
    if (!deleteTarget) return
    setDeleteLoading(true)
    try {
      await dispatch(deleteErrorCodeAsync(deleteTarget._id)).unwrap()
      toast.success('Error code deleted')
      setDeleteTarget(null)
    } catch (err) {
      toast.error(err || 'Failed to delete error code')
    } finally {
      setDeleteLoading(false)
    }
  }

  return (
    <div className="admin-page">
      <div className="flex items-end justify-between gap-4">
        <div>
          <h1 className="admin-page-title">Error Codes</h1>
          <p className="admin-page-subtitle">Daikin error codes for the Services page</p>
        </div>
        <button
          onClick={openCreate}
          className="admin-btn-primary"
        >
          <Plus className="w-3.5 h-3.5" />
          Add Error Code
        </button>
      </div>

      <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden flex flex-col">
        <div className="px-4 py-3 border-b border-slate-100 flex flex-col lg:flex-row gap-3 bg-slate-50/30">
          <div className="relative flex-1">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search by code, title, description..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-4 admin-input"
            />
          </div>
          <div className="admin-filter-tabs">
            {['All', ...UNIT_OPTIONS].map((unit) => (
              <button
                key={unit}
                onClick={() => setUnitFilter(unit)}
                className={`admin-filter-tab ${unitFilter === unit ? 'admin-filter-tab-active' : 'admin-filter-tab-inactive'}`}
              >
                {unit}
              </button>
            ))}
          </div>
        </div>

        <div className="p-4">
      {loading && errorCodes.length === 0 ? (
        <div className="flex justify-center py-20">
          <div className="w-10 h-10 border-4 border-blue-100 border-t-[#0072bc] rounded-full animate-spin" />
        </div>
      ) : errorCodes.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-2xl border border-slate-200">
          <AlertTriangle className="w-10 h-10 text-slate-300 mx-auto mb-3" />
          <p className="text-xs text-slate-500">No error codes found. Add your first code.</p>
        </div>
      ) : (
        <div className="border border-slate-200 rounded-xl overflow-hidden">
          <div className="hidden lg:grid grid-cols-12 gap-4 bg-slate-50 px-5 py-3 border-b border-slate-200 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
            <div className="col-span-1">Code</div>
            <div className="col-span-2">Category</div>
            <div className="col-span-3">Title</div>
            <div className="col-span-4">Action</div>
            <div className="col-span-2 text-right">Manage</div>
          </div>
          <div className="divide-y divide-slate-100">
            {errorCodes.map((item) => (
              <div key={item._id} className="grid lg:grid-cols-12 gap-3 px-5 py-4 items-start hover:bg-slate-50/50 transition-colors">
                <div className="col-span-1">
                  <span className="text-xs font-black text-brand bg-blue-50 px-2.5 py-1 rounded-lg inline-block">
                    {item.code}
                  </span>
                  {!item.isActive && (
                    <span className="block mt-1 text-[9px] font-bold uppercase text-amber-600">Hidden</span>
                  )}
                </div>
                <div className="col-span-2">
                  <span className={`px-2 py-1 text-[10px] font-bold uppercase tracking-wider rounded-full border ${unitBadgeClass(item.unit)}`}>
                    {item.unit}
                  </span>
                </div>
                <div className="col-span-3">
                  <p className="text-xs font-bold text-slate-900">{item.title}</p>
                  <p className="text-xs text-slate-500 mt-1 line-clamp-2">{item.description}</p>
                </div>
                <div className="col-span-4">
                  <p className="text-xs text-slate-600 leading-relaxed line-clamp-3">{item.action}</p>
                </div>
                <div className="col-span-2 flex justify-end gap-1">
                  <button
                    onClick={() => openEdit(item)}
                    className="p-2 text-slate-400 hover:text-[#0072bc] hover:bg-blue-50 rounded-lg transition-colors"
                  >
                    <Edit className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => setDeleteTarget(item)}
                    className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
        </div>
      </div>

      <Modal
        isOpen={isFormOpen}
        onClose={() => { setIsFormOpen(false); resetForm() }}
        title={editingId ? 'Edit Error Code' : 'Add Error Code'}
        subtitle="Error Category"
        icon={AlertTriangle}
        maxWidth="max-w-lg"
      >
        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="admin-label block mb-1.5">Code *</label>
              <input
                type="text"
                value={formData.code}
                onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                placeholder="e.g. U4"
                className={`admin-input-form ${showValidation && !formData.code ? 'border-red-300' : ''}`}
              />
            </div>
            <div>
              <label className="admin-label block mb-1.5">Category *</label>
              <select
                value={formData.unit}
                onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
                className="admin-input-form"
              >
                {UNIT_OPTIONS.map((unit) => (
                  <option key={unit} value={unit}>{unit}</option>
                ))}
              </select>
            </div>
          </div>
          <div>
            <label className="admin-label block mb-1.5">Title *</label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className={`admin-input-form ${showValidation && !formData.title ? 'border-red-300' : ''}`}
            />
          </div>
          <div>
            <label className="admin-label block mb-1.5">Description *</label>
            <textarea
              rows={3}
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className={`admin-input-form resize-none ${showValidation && !formData.description ? 'border-red-300' : ''}`}
            />
          </div>
          <div>
            <label className="admin-label block mb-1.5">Recommended Action *</label>
            <textarea
              rows={3}
              value={formData.action}
              onChange={(e) => setFormData({ ...formData, action: e.target.value })}
              className={`admin-input-form resize-none ${showValidation && !formData.action ? 'border-red-300' : ''}`}
            />
          </div>
          <div>
            <label className="admin-label block mb-1.5">Sort Order</label>
            <input
              type="number"
              min="1"
              value={formData.sortOrder}
              onChange={(e) => setFormData({ ...formData, sortOrder: e.target.value })}
              className="admin-input-form"
            />
          </div>
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={formData.isActive}
              onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
              className="rounded border-slate-300 text-brand focus:ring-brand"
            />
            <span className="text-xs font-medium text-slate-600">Show on website</span>
          </label>
          <div className="flex items-center justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={() => { setIsFormOpen(false); resetForm() }}
              className="admin-btn-secondary"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="admin-btn-primary disabled:opacity-60"
            >
              {submitting ? 'Saving...' : editingId ? 'Update' : 'Create'}
            </button>
          </div>
        </form>
      </Modal>

      <DeleteConfirmModal
        isOpen={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
        loading={deleteLoading}
        title="Delete Error Code"
        description={`Are you sure you want to delete error code "${deleteTarget?.code}"? This cannot be undone.`}
      />
    </div>
  )
}

export default ErrorCodes
