import React, { useState, useEffect } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { Plus, Search, Filter, Edit, Trash2, MapPin, X, Upload, Briefcase, ChevronLeft, ChevronRight, LayoutGrid } from 'lucide-react'
import { fetchProjects, createProject, deleteProjectAsync, updateProjectAsync } from '../store/slices/projectsSlice'
import { fetchCategories } from '../store/slices/categorySlice'
import { fetchBranches } from '../store/slices/branchesSlice'
import { getImageUrl } from '../utils/imageHandler'
import { toast } from 'react-hot-toast'
import DeleteConfirmModal from '../components/DeleteConfirmModal'
import DataTable from '../components/ui/DataTable'
import Modal from '../components/ui/Modal'
import { motion, AnimatePresence } from 'framer-motion'

const Projects = () => {
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [formData, setFormData] = useState({ title: '', category: '', branch: '', location: '', date: '', status: 'Planning', hvacSystemType: '', totalCapacity: '', duration: '', hp: '', description: '', priority: '' })
  const [editingId, setEditingId] = useState(null)
  const [selectedFile, setSelectedFile] = useState(null)
  const [previewImage, setPreviewImage] = useState(null)

  const [searchTerm, setSearchTerm] = useState('')
  const [debouncedSearch, setDebouncedSearch] = useState('')
  const [categoryFilter, setCategoryFilter] = useState('All')
  const [statusFilter, setStatusFilter] = useState('All')
  const [currentPage, setCurrentPage] = useState(1)
  const [deleteTarget, setDeleteTarget] = useState(null)
  const [deleteLoading, setDeleteLoading] = useState(false)
  const [errors, setErrors] = useState({})

  const { items: projects, loading, error, pagination } = useSelector(state => state.projects)
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
    const params = {
      page: currentPage,
      limit: 12,
      search: debouncedSearch,
      status: statusFilter !== 'All' ? statusFilter : null,
      category: categoryFilter !== 'All' ? categoryFilter : null,
    }
    dispatch(fetchProjects(params))
  }, [dispatch, currentPage, debouncedSearch, categoryFilter, statusFilter])

  useEffect(() => {
    dispatch(fetchCategories({ page: 1, limit: 50 }))
    dispatch(fetchBranches({ limit: 50 }))
  }, [dispatch])

  const statuses = ['All', 'Planning', 'In Progress', 'Completed']

  const validateForm = () => {
    const newErrors = {}
    if (!formData.title.trim()) newErrors.title = 'Please fill this field'
    if (!formData.category) newErrors.category = 'Please select a category'
    if (!selectedFile && !previewImage) newErrors.image = 'Please upload a project image'
    setErrors(newErrors)
    if (Object.keys(newErrors).length > 0) {
      toast.error('Please fill all required fields')
    }
    return Object.keys(newErrors).length === 0
  }

  const clearError = (field) => {
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: '' }))
    }
  }

  const fieldClass = (field) =>
    `w-full bg-slate-50 border rounded-lg px-3 py-2 text-xs font-bold text-slate-900 outline-none transition-all ${errors[field] ? 'border-rose-300 focus:border-rose-400' : 'border-slate-200 focus:border-brand'
    }`

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!validateForm()) return

    const data = new FormData()
    Object.keys(formData).forEach(key => data.append(key, formData[key]))
    if (selectedFile) data.append('image', selectedFile)

    try {
      if (editingId) {
        await dispatch(updateProjectAsync({ id: editingId, data })).unwrap()
        toast.success('Project updated!')
        dispatch(fetchProjects({ page: currentPage, limit: 12, search: debouncedSearch, status: statusFilter !== 'All' ? statusFilter : null, category: categoryFilter !== 'All' ? categoryFilter : null }))
      } else {
        await dispatch(createProject(data)).unwrap()
        toast.success('Project created!')
        if (currentPage !== 1) {
          setCurrentPage(1)
        } else {
          dispatch(fetchProjects({ page: 1, limit: 12, search: debouncedSearch, status: statusFilter !== 'All' ? statusFilter : null, category: categoryFilter !== 'All' ? categoryFilter : null }))
        }
      }
      setIsFormOpen(false)
      resetForm()
    } catch (err) {
      toast.error(err.message || 'Failed to save project')
    }
  }

  const resetForm = () => {
    setFormData({ title: '', category: '', branch: '', location: '', date: '', status: 'Planning', hvacSystemType: '', totalCapacity: '', duration: '', hp: '', description: '', priority: '' })
    setEditingId(null)
    setSelectedFile(null)
    setPreviewImage(null)
    setErrors({})
  }

  const handleEdit = (project) => {
    setFormData({
      title: project.title,
      category: project.category?._id || project.category || '',
      branch: project.branch?._id || project.branch || '',
      location: project.location,
      date: project.date,
      status: project.status,
      hvacSystemType: project.hvacSystemType || '',
      totalCapacity: project.totalCapacity || '',
      duration: project.duration || '',
      hp: project.hp || '',
      description: project.description || '',
      priority: (project.priority === 999999 || project.priority == null) ? '' : project.priority,
    })
    setEditingId(project._id || project.id)
    setPreviewImage(getImageUrl(project.image))
    setIsFormOpen(true)
  }

  const onImageChange = (e) => {
    const file = e.target.files[0]
    if (file) {
      setSelectedFile(file)
      clearError('image')
      const reader = new FileReader()
      reader.onloadend = () => setPreviewImage(reader.result)
      reader.readAsDataURL(file)
    }
  }

  const handleDelete = async () => {
    if (!deleteTarget) return
    setDeleteLoading(true)
    try {
      await dispatch(deleteProjectAsync(deleteTarget)).unwrap()
      toast.success('Project deleted!')
      dispatch(fetchProjects({ page: currentPage, limit: 12, search: debouncedSearch, status: statusFilter !== 'All' ? statusFilter : null, category: categoryFilter !== 'All' ? categoryFilter : null }))
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
        title="Delete Project"
        description="Are you sure you want to delete this project?"
      />

      <div className="flex items-end justify-between gap-4">
        <div>
          <h1 className="admin-page-title">Portfolio</h1>
          <p className="admin-page-subtitle">Showcase Projects & Installations</p>
        </div>
        <button
          onClick={() => { resetForm(); setIsFormOpen(true); }}
          className="admin-btn-primary"
        >
          <Plus className="w-3.5 h-3.5" />
          New Project
        </button>
      </div>

      <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden flex flex-col">
        {/* Toolbar */}
        <div className="px-4 py-3 border-b border-slate-100 flex flex-wrap items-center gap-3 bg-slate-50/30">
          <div className="relative flex-1 min-w-[200px]">
            <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search projects..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-white border border-slate-200 focus:border-brand rounded-lg pl-9 pr-4 py-1.5 text-xs text-slate-700 outline-none transition-all"
            />
          </div>

          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1.5 px-2 py-1 bg-white border border-slate-200 rounded-lg">
              <LayoutGrid className="w-3 h-3 text-slate-400" />
              <select
                value={categoryFilter}
                onChange={(e) => { setCategoryFilter(e.target.value); setCurrentPage(1); }}
                className="bg-transparent text-[11px] font-bold text-slate-600 outline-none cursor-pointer pr-1"
              >
                <option value="All">All Categories</option>
                {activeCategories.map(cat => (
                  <option key={cat._id} value={cat._id}>{cat.name}</option>
                ))}
              </select>
            </div>

            <div className="flex items-center gap-1.5 px-2 py-1 bg-white border border-slate-200 rounded-lg">
              <Filter className="w-3 h-3 text-slate-400" />
              <select
                value={statusFilter}
                onChange={(e) => { setStatusFilter(e.target.value); setCurrentPage(1); }}
                className="bg-transparent text-[11px] font-bold text-slate-600 outline-none cursor-pointer pr-1"
              >
                {statuses.map(s => <option key={s} value={s}>{s === 'All' ? 'All Status' : s}</option>)}
              </select>
            </div>
          </div>
        </div>

        {/* DataTable */}
        <DataTable
          columns={[
            { label: 'Project' },
            { label: 'Category' },
            { label: 'Branch' },
            { label: 'Location' },
            { label: 'Status', className: 'text-center' },
            { label: 'Priority', className: 'text-center' },
            { label: 'Actions', className: 'text-right' }
          ]}
          data={projects}
          loading={loading}
          loadingMessage="Scanning portfolio..."
          emptyMessage="No projects found."
          pagination={pagination}
          onPageChange={setCurrentPage}
          totalLabel="Total Projects"
          renderRow={(project) => (
            <tr key={project._id} className="hover:bg-slate-50/80 transition-colors group">
              <td className="px-5 py-2.5">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded bg-slate-50 border border-slate-100 flex items-center justify-center overflow-hidden shrink-0 shadow-sm">
                    {project.image ? (
                      <img src={getImageUrl(project.image)} alt="" className="w-full h-full object-cover" />
                    ) : (
                      <Briefcase className="w-4 h-4 text-slate-200" />
                    )}
                  </div>
                  <span className="font-bold text-slate-900">{project.title}</span>
                </div>
              </td>
              <td className="px-5 py-2.5">
                <span className="px-2 py-0.5 rounded bg-slate-50 text-slate-500 font-bold text-[10px] border border-slate-100">
                  {project?.category?.name || 'N/A'}
                </span>
              </td>
              <td className="px-5 py-2.5">
                <span className="px-2 py-0.5 rounded bg-blue-50 text-blue-600 font-bold text-[10px] border border-blue-100">
                  {project?.branch?.name || 'N/A'}
                </span>
              </td>
              <td className="px-5 py-2.5">
                <div className="flex items-center gap-1.5 text-slate-500">
                  <MapPin className="w-3 h-3 text-slate-400" />
                  {project.location}
                </div>
              </td>
              <td className="px-5 py-2.5 text-center">
                <span className={`inline-flex items-center px-2 py-0.5 rounded text-[9px] font-extrabold uppercase tracking-wider
                  ${project.status === 'Completed' ? 'bg-emerald-50 text-emerald-600' : ''}
                  ${project.status === 'In Progress' ? 'bg-blue-50 text-blue-600' : ''}
                  ${project.status === 'Planning' ? 'bg-amber-50 text-amber-600' : ''}
                `}>
                  {project.status}
                </span>
              </td>
              <td className="px-5 py-2.5 text-center">
                <span className="font-bold text-slate-600">
                  {project.priority === 999999 ? '—' : (project.priority ?? '—')}
                </span>
              </td>
              <td className="px-5 py-2.5 text-right">
                <div className="flex items-center justify-end gap-1">
                  <button onClick={() => handleEdit(project)} className="p-1.5 text-amber-600 bg-amber-50/50 hover:bg-amber-600 hover:text-white rounded-md transition-all">
                    <Edit className="w-3.5 h-3.5" />
                  </button>
                  <button onClick={() => setDeleteTarget(project._id)} className="p-1.5 text-rose-600 bg-rose-50/50 hover:bg-rose-600 hover:text-white rounded-md transition-all">
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
        onClose={() => { setIsFormOpen(false); setErrors({}) }}
        title={editingId ? 'Edit Project' : 'New Project'}
        subtitle="Project Details"
        icon={Briefcase}
        maxWidth="max-w-2xl"
      >
        <form onSubmit={handleSubmit} noValidate className="p-5 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Project Name <span className="text-rose-500">*</span></label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => {
                  setFormData({ ...formData, title: e.target.value })
                  clearError('title')
                }}
                placeholder="e.g. Wipro Corporate Office"
                className={fieldClass('title')}
              />
              {errors.title && <p className="text-[10px] text-rose-500 font-semibold">{errors.title}</p>}
            </div>
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Category <span className="text-rose-500">*</span></label>
              <select
                value={formData.category}
                onChange={(e) => {
                  setFormData({ ...formData, category: e.target.value })
                  clearError('category')
                }}
                className={fieldClass('category')}
              >
                <option value="">Select category</option>
                {activeCategories.map(cat => <option key={cat._id} value={cat._id}>{cat.name}</option>)}
              </select>
              {errors.category && <p className="text-[10px] text-rose-500 font-semibold">{errors.category}</p>}
            </div>
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Status</label>
              <select value={formData.status} onChange={e => setFormData({ ...formData, status: e.target.value })} className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs font-bold text-slate-900 outline-none focus:border-brand transition-all">
                <option value="Planning">Planning</option>
                <option value="In Progress">In Progress</option>
                <option value="Completed">Completed</option>
              </select>
            </div>
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Priority</label>
              <input type="number" value={formData.priority === 999999 ? '' : formData.priority} onChange={e => setFormData({ ...formData, priority: e.target.value === '' ? 999999 : parseInt(e.target.value) })} className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs font-bold text-slate-900 outline-none focus:border-brand transition-all" />
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Branch</label>
              <select
                value={formData.branch}
                onChange={e => setFormData({ ...formData, branch: e.target.value })}
                className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs font-bold text-slate-900 outline-none focus:border-brand transition-all"
              >
                <option value="">Select branch</option>
                {branches.map((branch) => (
                  <option key={branch._id} value={branch._id}>{branch.name}</option>
                ))}
              </select>
            </div>
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Location</label>
              <input type="text" value={formData.location} onChange={e => setFormData({ ...formData, location: e.target.value })} placeholder="e.g. Hyderabad" className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs font-bold text-slate-900 outline-none focus:border-brand transition-all" />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">System Type</label>
              <input type="text" value={formData.hvacSystemType} onChange={e => setFormData({ ...formData, hvacSystemType: e.target.value })} placeholder="VRV, Split, etc" className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs font-bold text-slate-900 outline-none focus:border-brand transition-all" />
            </div>
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Capacity</label>
              <input type="text" value={formData.totalCapacity} onChange={e => setFormData({ ...formData, totalCapacity: e.target.value })} placeholder="500 TR" className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs font-bold text-slate-900 outline-none focus:border-brand transition-all" />
            </div>
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Duration</label>
              <input type="text" value={formData.duration} onChange={e => setFormData({ ...formData, duration: e.target.value })} placeholder="3 Months" className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs font-bold text-slate-900 outline-none focus:border-brand transition-all" />
            </div>
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Hp</label>
              <input type="text" value={formData.hp} onChange={e => setFormData({ ...formData, hp: e.target.value })} placeholder="3 Months" className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs font-bold text-slate-900 outline-none focus:border-brand transition-all" />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Overview</label>
            <textarea rows="3" value={formData.description} onChange={e => setFormData({ ...formData, description: e.target.value })} placeholder="Brief project overview..." className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs font-bold text-slate-900 outline-none focus:border-brand transition-all resize-none"></textarea>
          </div>

          <div className="space-y-1">
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Project Image <span className="text-rose-500">*</span></label>
            <label className={`relative block h-32 border-2 border-dashed rounded-xl overflow-hidden hover:bg-slate-50 cursor-pointer transition-all ${errors.image ? 'border-rose-300 bg-rose-50/30' : 'border-slate-100'}`}>
              <input type="file" accept="image/*" className="hidden" onChange={onImageChange} />
              {previewImage ? (
                <img src={getImageUrl(previewImage)} alt="Preview" className="w-full h-full object-cover" />
              ) : (
                <div className="flex flex-col items-center justify-center h-full text-slate-300">
                  <Upload className="w-6 h-6 mb-1" />
                  <span className="text-[10px] font-bold uppercase tracking-wider">Upload Thumbnail</span>
                </div>
              )}
            </label>
            {errors.image && <p className="text-[10px] text-rose-500 font-semibold">{errors.image}</p>}
          </div>

          <div className="flex items-center justify-end gap-3 pt-2">
            <button type="button" onClick={() => { setIsFormOpen(false); setErrors({}) }} className="px-4 py-1.5 text-xs font-bold text-slate-500 hover:bg-slate-100 rounded-lg transition-all">
              Cancel
            </button>
            <button type="submit" className="px-5 py-1.5 text-xs font-bold text-white bg-slate-900 rounded-lg hover:bg-slate-800 transition-all shadow-sm">
              {editingId ? 'Update Project' : 'Publish Project'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  )
}

export default Projects
