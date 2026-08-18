import React, { useState, useEffect, useMemo } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { Plus, Search, Edit, Trash2, MapPin, X, Phone, Mail, Clock, Building2 } from 'lucide-react'
import { toast } from 'react-hot-toast'
import DeleteConfirmModal from '../components/DeleteConfirmModal'
import Modal from '../components/ui/Modal'
import { motion, AnimatePresence } from 'framer-motion'
import {
  fetchServiceLocations,
  createServiceLocation,
  updateServiceLocationAsync,
  deleteServiceLocationAsync,
} from '../store/slices/serviceLocationsSlice'

const emptyForm = {
  state: '',
  name: '',
  address: '',
  phone: '',
  email: '',
  timing: '9:30 AM - 6:30 PM (Mon - Sat)',
  isActive: true,
  sortOrder: 1,
}

const ServiceLocations = () => {
  const dispatch = useDispatch()
  const { items: locations, loading } = useSelector((state) => state.serviceLocations)

  const [isFormOpen, setIsFormOpen] = useState(false)
  const [formData, setFormData] = useState(emptyForm)
  const [editingId, setEditingId] = useState(null)
  const [showValidation, setShowValidation] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [stateFilter, setStateFilter] = useState('All')
  const [deleteTarget, setDeleteTarget] = useState(null)
  const [deleteLoading, setDeleteLoading] = useState(false)
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    dispatch(fetchServiceLocations({ limit: 100 }))
  }, [dispatch])

  const matchesSearch = (loc, query) => {
    if (!query) return true
    return (
      loc.state?.toLowerCase().includes(query) ||
      loc.name?.toLowerCase().includes(query) ||
      loc.address?.toLowerCase().includes(query) ||
      loc.phone?.toLowerCase().includes(query) ||
      loc.email?.toLowerCase().includes(query)
    )
  }

  const filteredLocations = useMemo(() => {
    const query = searchTerm.trim().toLowerCase()

    return locations.filter((loc) => {
      const matchesState = stateFilter === 'All' || loc.state === stateFilter
      return matchesState && matchesSearch(loc, query)
    })
  }, [locations, stateFilter, searchTerm])

  const visibleStates = useMemo(() => {
    const query = searchTerm.trim().toLowerCase()
    const matching = locations.filter((loc) => matchesSearch(loc, query))
    const unique = [...new Set(matching.map((loc) => loc.state).filter(Boolean))].sort()
    return ['All', ...unique]
  }, [locations, searchTerm])

  const stateCounts = useMemo(() => {
    const query = searchTerm.trim().toLowerCase()
    const matching = locations.filter((loc) => matchesSearch(loc, query))
    const counts = { All: matching.length }
    matching.forEach((loc) => {
      counts[loc.state] = (counts[loc.state] || 0) + 1
    })
    return counts
  }, [locations, searchTerm])

  useEffect(() => {
    if (stateFilter !== 'All' && !visibleStates.includes(stateFilter)) {
      setStateFilter('All')
    }
  }, [visibleStates, stateFilter])

  const groupedLocations = useMemo(() => {
    const groups = {}
    filteredLocations.forEach((loc) => {
      if (!groups[loc.state]) groups[loc.state] = []
      groups[loc.state].push(loc)
    })
    return Object.entries(groups).sort(([a], [b]) => a.localeCompare(b))
  }, [filteredLocations])

  const resetForm = () => {
    setFormData(emptyForm)
    setEditingId(null)
    setShowValidation(false)
  }

  const openCreate = () => {
    resetForm()
    setFormData({ ...emptyForm, sortOrder: locations.length + 1 })
    setIsFormOpen(true)
  }

  const openEdit = (location) => {
    setEditingId(location._id)
    setFormData({
      state: location.state || '',
      name: location.name || '',
      address: location.address || '',
      phone: location.phone || '',
      email: location.email || '',
      timing: location.timing || emptyForm.timing,
      isActive: location.isActive !== false,
      sortOrder: location.sortOrder || 1,
    })
    setShowValidation(false)
    setIsFormOpen(true)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setShowValidation(true)

    if (!formData.state || !formData.name || !formData.address || !formData.phone || !formData.email) {
      toast.error('State, name, address, phone, and email are required')
      return
    }

    setSubmitting(true)
    try {
      const payload = {
        ...formData,
        isActive: Boolean(formData.isActive),
        sortOrder: parseInt(formData.sortOrder, 10) || 1,
      }

      if (editingId) {
        await dispatch(updateServiceLocationAsync({ id: editingId, data: payload })).unwrap()
        toast.success('Service location updated')
      } else {
        await dispatch(createServiceLocation(payload)).unwrap()
        toast.success('Service location added')
      }

      dispatch(fetchServiceLocations({ limit: 100 }))
      setIsFormOpen(false)
      resetForm()
    } catch (err) {
      toast.error(err || 'Failed to save location')
    } finally {
      setSubmitting(false)
    }
  }

  const handleDelete = async () => {
    if (!deleteTarget) return
    setDeleteLoading(true)
    try {
      await dispatch(deleteServiceLocationAsync(deleteTarget._id)).unwrap()
      toast.success('Service location deleted')
      setDeleteTarget(null)
    } catch (err) {
      toast.error(err || 'Failed to delete location')
    } finally {
      setDeleteLoading(false)
    }
  }

  return (
    <div className="admin-page">
      <div className="flex items-end justify-between gap-4">
        <div>
          <h1 className="admin-page-title">Service Locations</h1>
          <p className="admin-page-subtitle">Regional service centers on the Services page</p>
        </div>
        <button onClick={openCreate} className="admin-btn-primary">
          <Plus className="w-3.5 h-3.5" />
          Add Location
        </button>
      </div>

      <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden flex flex-col">
        <div className="px-4 py-3 border-b border-slate-100 flex flex-col lg:flex-row gap-3 bg-slate-50/30">
          <div className="relative flex-1">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search by state, city, address, phone..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-4 admin-input"
            />
          </div>
          <div className="admin-filter-tabs overflow-x-auto no-scrollbar">
            {visibleStates.map((state) => (
              <button
                key={state}
                onClick={() => setStateFilter(state)}
                className={`admin-filter-tab whitespace-nowrap ${stateFilter === state ? 'admin-filter-tab-active' : 'admin-filter-tab-inactive'}`}
              >
                {state}
                <span className="ml-1.5 text-[10px] opacity-80">({stateCounts[state] || 0})</span>
              </button>
            ))}
          </div>
        </div>

        <div className="p-4">
      {loading && locations.length === 0 ? (
        <div className="flex justify-center py-20">
          <div className="w-10 h-10 border-4 border-blue-100 border-t-[#0072bc] rounded-full animate-spin" />
        </div>
      ) : locations.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-2xl border border-slate-200">
          <MapPin className="w-10 h-10 text-slate-300 mx-auto mb-3" />
          <p className="text-xs text-slate-500">No service locations found. Add your first location.</p>
        </div>
      ) : filteredLocations.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-2xl border border-slate-200">
          <MapPin className="w-10 h-10 text-slate-300 mx-auto mb-3" />
          <p className="text-xs text-slate-500">No service locations match your search or filter.</p>
          {(searchTerm || stateFilter !== 'All') && (
            <button
              type="button"
              onClick={() => { setSearchTerm(''); setStateFilter('All') }}
              className="mt-3 admin-btn-secondary"
            >
              Clear filters
            </button>
          )}
        </div>
      ) : (
        <div className="space-y-8">
          {groupedLocations.map(([state, stateLocations]) => (
            <div key={state}>
              <div className="flex items-center gap-2 mb-4">
                <Building2 className="w-4 h-4 text-[#0072bc]" />
                <h2 className="text-sm font-bold text-slate-900">{state}</h2>
                <span className="text-[10px] font-bold text-slate-400 bg-slate-100 px-2 py-0.5 rounded-full">
                  {stateLocations.length}
                </span>
              </div>
              <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-4">
                {stateLocations.map((location) => (
                  <div
                    key={location._id}
                    className="bg-white border border-slate-200 rounded-2xl p-5 hover:border-[#0072bc]/30 hover:shadow-md transition-all"
                  >
                    <div className="flex items-start justify-between gap-3 mb-3">
                      <div>
                        <h3 className="text-sm font-bold text-slate-900">{location.name}</h3>
                        {!location.isActive && (
                          <span className="inline-block mt-1 text-[10px] font-bold uppercase tracking-wider text-amber-600 bg-amber-50 px-2 py-0.5 rounded">
                            Inactive
                          </span>
                        )}
                      </div>
                      <div className="flex gap-1 shrink-0">
                        <button
                          onClick={() => openEdit(location)}
                          className="p-2 text-slate-400 hover:text-[#0072bc] hover:bg-blue-50 rounded-lg transition-colors"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => setDeleteTarget(location)}
                          className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                    <p className="text-xs text-slate-500 leading-relaxed mb-4">{location.address}</p>
                    <div className="space-y-2 text-xs text-slate-600 border-t border-slate-100 pt-3">
                      <div className="flex items-center gap-2">
                        <Phone className="w-3.5 h-3.5 text-[#0072bc]" />
                        <span>{location.phone}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Mail className="w-3.5 h-3.5 text-[#0072bc]" />
                        <span className="truncate">{location.email}</span>
                      </div>
                      <div className="flex items-center gap-2 text-slate-400">
                        <Clock className="w-3.5 h-3.5" />
                        <span>{location.timing}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
        </div>
      </div>

      <Modal
        isOpen={isFormOpen}
        onClose={() => { setIsFormOpen(false); resetForm() }}
        title={editingId ? 'Edit Service Location' : 'Add Service Location'}
        subtitle="Location Details"
        icon={Building2}
        maxWidth="max-w-lg"
      >
        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          <div>
            <label className="admin-label block mb-1.5">State / Region *</label>
            <input
              type="text"
              value={formData.state}
              onChange={(e) => setFormData({ ...formData, state: e.target.value })}
              placeholder="e.g. Karnataka"
              className={`admin-input-form ${showValidation && !formData.state ? 'border-red-300' : ''}`}
            />
          </div>
          <div>
            <label className="admin-label block mb-1.5">Location Name *</label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="e.g. Bengaluru (Head Office)"
              className={`admin-input-form ${showValidation && !formData.name ? 'border-red-300' : ''}`}
            />
          </div>
          <div>
            <label className="admin-label block mb-1.5">Address *</label>
            <textarea
              rows={3}
              value={formData.address}
              onChange={(e) => setFormData({ ...formData, address: e.target.value })}
              className={`admin-input-form resize-none ${showValidation && !formData.address ? 'border-red-300' : ''}`}
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="admin-label block mb-1.5">Phone *</label>
              <input
                type="text"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                className={`admin-input-form ${showValidation && !formData.phone ? 'border-red-300' : ''}`}
              />
            </div>
            <div>
              <label className="admin-label block mb-1.5">Email *</label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className={`admin-input-form ${showValidation && !formData.email ? 'border-red-300' : ''}`}
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="admin-label block mb-1.5">Working Hours</label>
              <input
                type="text"
                value={formData.timing}
                onChange={(e) => setFormData({ ...formData, timing: e.target.value })}
                className="admin-input-form"
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
            <button type="button" onClick={() => { setIsFormOpen(false); resetForm() }} className="admin-btn-secondary">
              Cancel
            </button>
            <button type="submit" disabled={submitting} className="admin-btn-primary disabled:opacity-60">
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
        title="Delete Service Location"
        description={`Are you sure you want to delete "${deleteTarget?.name}"? This cannot be undone.`}
      />
    </div>
  )
}

export default ServiceLocations
