import React, { useState, useEffect } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { Plus, Search, Filter, Edit, Trash2, MapPin, X, Upload, Briefcase, ChevronLeft, ChevronRight, LayoutGrid } from 'lucide-react'
import { fetchProjects, createProject, deleteProjectAsync, updateProjectAsync } from '../store/slices/projectsSlice'
import { fetchCategories } from '../store/slices/categorySlice'
import { getImageUrl } from '../utils/imageHandler'
import { toast } from 'react-hot-toast'
import DeleteConfirmModal from '../components/DeleteConfirmModal'
import { motion, AnimatePresence } from 'framer-motion'

const Projects = () => {
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [formData, setFormData] = useState({ title: '', category: '', location: '', date: '', status: 'Planning', hvacSystemType: '', totalCapacity: '', duration: '', hp: '', description: '' })
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
  }, [dispatch])

  const statuses = ['All', 'Planning', 'In Progress', 'Completed']

  const validateForm = () => {
    const newErrors = {}
    if (!formData.title.trim()) newErrors.title = 'Project title is required'
    if (!formData.category) newErrors.category = 'Category is required'
    if (!selectedFile && !previewImage) newErrors.image = 'Project image is required'
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

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
      } else {
        await dispatch(createProject(data)).unwrap()
        toast.success('Project created!')
      }
      setIsFormOpen(false)
      resetForm()
    } catch (err) {
      toast.error(err.message || 'Failed to save project')
    }
  }

  const resetForm = () => {
    setFormData({ title: '', category: '', location: '', date: '', status: 'Planning', hvacSystemType: '', totalCapacity: '', duration: '', hp: '', description: '', })
    setEditingId(null)
    setSelectedFile(null)
    setPreviewImage(null)
    setErrors({})
  }

  const handleEdit = (project) => {
    setFormData({
      title: project.title,
      category: project.category?._id || project.category || '',
      location: project.location,
      date: project.date,
      status: project.status,
      hvacSystemType: project.hvacSystemType || '',
      totalCapacity: project.totalCapacity || '',
      duration: project.duration || '',
      hp: project.hp || '',
      description: project.description || '',
    })
    setEditingId(project._id || project.id)
    setPreviewImage(getImageUrl(project.image))
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
      await dispatch(deleteProjectAsync(deleteTarget)).unwrap()
      toast.success('Project deleted!')
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
        title="Delete Project"
        description="Are you sure you want to delete this project?"
      />

      <div className="flex items-end justify-between gap-4">
        <div>
          <h1 className="text-lg font-bold text-slate-900 tracking-tight">Portfolio</h1>
          <p className="text-[11px] font-medium text-slate-400 uppercase tracking-wider mt-0.5">Showcase Projects & Installations</p>
        </div>
        <button
          onClick={() => { resetForm(); setIsFormOpen(true); }}
          className="inline-flex items-center gap-2 bg-slate-900 hover:bg-slate-800 text-white px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all shadow-sm"
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
                {categories.map(cat => (
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

        {/* Table */}
        <div className="overflow-x-auto overflow-y-auto max-h-[60vh] custom-scrollbar">
          <table className="w-full text-left text-[12px] whitespace-nowrap">
            <thead className="bg-white sticky top-0 z-10 border-b border-slate-100">
              <tr>
                <th className="px-5 py-3 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Project</th>
                <th className="px-5 py-3 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Category</th>
                <th className="px-5 py-3 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Location</th>
                <th className="px-5 py-3 text-[10px] font-bold text-slate-400 uppercase tracking-widest text-center">Status</th>
                <th className="px-5 py-3 text-[10px] font-bold text-slate-400 uppercase tracking-widest text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {loading ? (
                <tr><td colSpan={5} className="text-center py-20 text-slate-300 animate-pulse">Scanning portfolio...</td></tr>
              ) : projects.length === 0 ? (
                <tr><td colSpan={5} className="text-center py-20 text-slate-400">No projects found.</td></tr>
              ) : (
                projects.map((project) => (
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
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="px-4 py-2.5 border-t border-slate-100 flex items-center justify-between bg-slate-50/20">
          <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
            {pagination.total} Total Projects
          </div>

          <div className="flex items-center gap-1.5">
            <button
              onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
              disabled={pagination.page <= 1}
              className="p-1 text-slate-400 hover:text-slate-900 disabled:opacity-30 transition-all"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>

            <div className="flex items-center gap-1">
              {[...Array(Math.min(pagination.pages, 5))].map((_, i) => {
                const p = i + 1;
                return (
                  <button
                    key={p}
                    onClick={() => setCurrentPage(p)}
                    className={`w-6 h-6 flex items-center justify-center rounded-md text-[10px] font-bold transition-all ${pagination.page === p
                      ? 'bg-slate-900 text-white shadow-sm'
                      : 'text-slate-500 hover:bg-slate-100'
                      }`}
                  >
                    {p}
                  </button>
                )
              })}
            </div>

            <button
              onClick={() => setCurrentPage(prev => Math.min(pagination.pages, prev + 1))}
              disabled={pagination.page >= pagination.pages}
              className="p-1 text-slate-400 hover:text-slate-900 disabled:opacity-30 transition-all"
            >
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
              className="bg-white rounded-xl shadow-2xl w-full max-w-2xl overflow-hidden border border-slate-200"
            >
              <div className="px-5 py-3 border-b border-slate-100 flex items-center justify-between bg-white sticky top-0 z-10">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-slate-900 flex items-center justify-center text-white">
                    <Briefcase className="w-4 h-4" />
                  </div>
                  <div>
                    <h2 className="text-sm font-bold text-slate-900 leading-tight">{editingId ? 'Edit Project' : 'New Project'}</h2>
                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Project Details</p>
                  </div>
                </div>
                <button onClick={() => setIsFormOpen(false)} className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-50 rounded-lg transition-all">
                  <X className="w-4 h-4" />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="p-5 space-y-4 max-h-[75vh] overflow-y-auto custom-scrollbar">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Project Name</label>
                    <input type="text" value={formData.title} onChange={e => setFormData({ ...formData, title: e.target.value })} placeholder="e.g. Wipro Corporate Office" className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs font-bold text-slate-900 outline-none focus:border-brand transition-all" required />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Category</label>
                    <select value={formData.category} onChange={e => setFormData({ ...formData, category: e.target.value })} className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs font-bold text-slate-900 outline-none focus:border-brand transition-all" required>
                      <option value="">Select category</option>
                      {categories.map(cat => <option key={cat._id} value={cat._id}>{cat.name}</option>)}
                    </select>
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
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Overview</label>
                  <textarea rows="3" value={formData.description} onChange={e => setFormData({ ...formData, description: e.target.value })} placeholder="Brief project overview..." className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs font-bold text-slate-900 outline-none focus:border-brand transition-all resize-none"></textarea>
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Project Image</label>
                  <label className="relative block h-32 border-2 border-dashed border-slate-100 rounded-xl overflow-hidden hover:bg-slate-50 cursor-pointer transition-all">
                    <input type="file" accept="image/*" className="hidden" onChange={onImageChange} />
                    {previewImage ? (
                      <img src={previewImage} alt="Preview" className="w-full h-full object-cover" />
                    ) : (
                      <div className="flex flex-col items-center justify-center h-full text-slate-300">
                        <Upload className="w-6 h-6 mb-1" />
                        <span className="text-[10px] font-bold uppercase tracking-wider">Upload Thumbnail</span>
                      </div>
                    )}
                  </label>
                </div>

                <div className="flex items-center justify-end gap-3 pt-2">
                  <button type="button" onClick={() => setIsFormOpen(false)} className="px-4 py-1.5 text-xs font-bold text-slate-500 hover:bg-slate-100 rounded-lg transition-all">
                    Cancel
                  </button>
                  <button type="submit" className="px-5 py-1.5 text-xs font-bold text-white bg-slate-900 rounded-lg hover:bg-slate-800 transition-all shadow-sm">
                    {editingId ? 'Update Project' : 'Publish Project'}
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

export default Projects
