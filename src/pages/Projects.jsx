import React, { useState, useEffect } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { Plus, Search, Filter, Edit, Trash2, MapPin, X, Upload, Briefcase, CheckCircle2 } from 'lucide-react'
import { fetchProjects, createProject, deleteProjectAsync, updateProjectAsync } from '../store/slices/projectsSlice'
import { fetchCategories } from '../store/slices/categorySlice'
import { getImageUrl } from '../utils/imageHandler'
import { toast } from 'react-hot-toast'
import DeleteConfirmModal from '../components/DeleteConfirmModal'

const Projects = () => {
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [formData, setFormData] = useState({ title: '', category: '', location: '', date: '', status: 'Planning', hvacSystemType: '', totalCapacity: '', description: '' })
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

  // Debounce search term
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchTerm)
      setCurrentPage(1)
    }, 500)
    return () => clearTimeout(timer)
  }, [searchTerm])

  useEffect(() => {
    const params = {
      page: currentPage,
      limit: 10,
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
    if (!formData.title.trim()) {
      newErrors.title = 'Project title is required'
    }
    if (!formData.category) {
      newErrors.category = 'Category is required'
    }
    if (!selectedFile && !previewImage) {
      newErrors.image = 'Project image is required'
    }
    if (selectedFile && selectedFile.size > 5 * 1024 * 1024) {
      newErrors.image = 'Image size must be less than 5MB'
    }
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= pagination.pages) {
      setCurrentPage(newPage)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!validateForm()) {
      return
    }

    const data = new FormData()
    Object.keys(formData).forEach(key => {
      data.append(key, formData[key])
    })
    if (selectedFile) {
      data.append('image', selectedFile)
    }

    try {
      if (editingId) {
        await dispatch(updateProjectAsync({ id: editingId, data })).unwrap()
        toast.success('Project updated successfully!')
      } else {
        await dispatch(createProject(data)).unwrap()
        toast.success('Project created successfully!')
      }
      setIsFormOpen(false)
      resetForm()
      dispatch(fetchProjects({ page: currentPage, limit: 10, search: debouncedSearch, category: null, status: null }))
    } catch (err) {
      toast.error(err.message || 'Failed to save project')
    }
  }

  // const handleDelete = async (id) => {
  //   if (window.confirm('Are you sure you want to delete this project?')) {
  //     try {
  //       await dispatch(deleteProjectAsync(id)).unwrap()
  //       toast.success('Project deleted successfully!')
  //       dispatch(fetchProjects({ page: currentPage, limit: 10, search: debouncedSearch, category: categoryFilter, status: statusFilter }))
  //     } catch (err) {
  //       toast.error(err.message || 'Failed to delete project')
  //     }
  //   }
  // }

  const resetForm = () => {
    setFormData({ title: '', category: '', location: '', date: '', status: 'Planning', hvacSystemType: '', totalCapacity: '', description: '', })
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
      hvacSystemType: project.hvacSystemType,
      totalCapacity: project.totalCapacity,
      description: project.description,
    })
    setEditingId(project._id || project.id)
    setPreviewImage(getImageUrl(project.image))
    setErrors({})
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
      if (errors.image) setErrors({ ...errors, image: '' })
    }
  }

  const handleDelete = async () => {
    if (!deleteTarget) return
    setDeleteLoading(true)
    try {
      await dispatch(deleteProjectAsync(deleteTarget)).unwrap()
      toast.success('Project deleted successfully!')
    } catch {
      toast.error('Failed to delete project')
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
        title="Delete Project"
        description="Are you sure you want to delete this project? This action cannot be undone."
      />
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Projects Showcase</h1>
          <p className="text-sm text-slate-500 mt-1">Manage and display your portfolio of completed HVAC projects.</p>
        </div>
        <button
          onClick={() => { resetForm(); setIsFormOpen(true); }}
          className="inline-flex items-center justify-center gap-2 bg-brand hover:bg-brand-hover text-white px-4 py-2.5 rounded-lg text-sm font-medium transition-colors shadow-sm shadow-brand/20">
          <Plus className="w-4 h-4" />
          Add Project
        </button>
      </div>

      <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-200 flex flex-col lg:flex-row lg:items-center gap-4 justify-between bg-white">
          <div className="flex flex-col sm:flex-row lg:flex-row justify-between  items-center gap-4 flex-1">
            {/* Search */}
            <div className="relative w-full sm:w-80">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Search projects..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 focus:border-brand focus:ring-4 focus:ring-brand/5 rounded-xl pl-10 pr-4 py-2.5 text-sm text-slate-700 transition-all outline-none"
              />
            </div>

            {/* Filters */}
            <div className="flex items-center gap-2 w-full sm:w-auto">
              <div className="flex items-center gap-2 px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl">
                <Briefcase className="w-3.5 h-3.5 text-slate-400" />
                <select
                  value={categoryFilter}
                  onChange={(e) => { setCategoryFilter(e.target.value); setCurrentPage(1); }}
                  className="bg-transparent text-xs font-bold text-slate-600 outline-none cursor-pointer"
                >
                    <option value="">All</option>
              {categories.map(cat => (
                  <option key={cat._id || cat.id} value={cat._id}>
                    {cat.name}
                  </option>
              ))}
                </select>
              </div>

                            <div className="flex items-center gap-2 px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl">
                <Briefcase className="w-3.5 h-3.5 text-slate-400" />
                <select
                  value={statusFilter}
                  onChange={(e) => { setStatusFilter(e.target.value); setCurrentPage(1); }}
                  className="bg-transparent text-xs font-bold text-slate-600 outline-none cursor-pointer"
                >
                    <option value="">All</option>
                    {statuses.map(status => (
                        <option key={status._id || status.id} value={status.name}>
                            {status}
                        </option>
                    ))}
                </select>
              </div>
            </div>
          </div>

        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm whitespace-nowrap">
            <thead className="bg-brand border-b border-brand-hover">
              <tr>
                <th className="px-6 py-4 text-xs font-bold text-white">Project Details</th>
                <th className="px-6 py-4 text-xs font-bold text-white">Category</th>
                <th className="px-6 py-4 text-xs font-bold text-white">Location</th>
                <th className="px-6 py-4 text-xs font-bold text-white">Status</th>
                <th className="px-6 py-4 text-xs font-bold text-white text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading && (
                <tr><td colSpan={6} className="text-center py-12 text-slate-400">Loading projects...</td></tr>
              )}
              {error && (
                <tr><td colSpan={6} className="text-center py-12 text-rose-500">{error}</td></tr>
              )}
              {!loading && projects.length === 0 && (
                <tr><td colSpan={6} className="text-center py-12 text-slate-400">No projects found matching filters.</td></tr>
              )}
              {!loading && projects.map((project) => (
                <tr key={project._id || project.id} className="hover:bg-slate-50/50 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-slate-100 border border-slate-200 flex items-center justify-center overflow-hidden">
                        {project.image ? (
                          <img src={getImageUrl(project.image)} alt="" className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full bg-slate-200"></div>
                        )}
                      </div>
                      <div className="font-semibold text-slate-900">{project.title}</div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="px-2.5 py-1 rounded-md bg-slate-100 text-slate-600 text-xs font-medium border border-slate-200">
                      {project?.category?.name || 'N/A'}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-1.5 text-slate-600">
                      <MapPin className="w-3.5 h-3.5 text-slate-400" />
                      {project.location}
                    </div>
                  </td>
                  {/* <td className="px-6 py-4 text-slate-600">{project.date}</td> */}
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider
                      ${project.status === 'Completed' ? 'bg-emerald-50 text-emerald-600 border border-emerald-100' : ''}
                      ${project.status === 'In Progress' ? 'bg-blue-50 text-blue-600 border border-blue-100' : ''}
                      ${project.status === 'Planning' ? 'bg-amber-50 text-amber-600 border border-amber-100' : ''}
                    `}>
                      {project.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-2.5">
                      <button 
                        onClick={() => handleEdit(project)} 
                        title="Edit Project"
                        className="p-2 text-amber-600 bg-amber-50 hover:bg-amber-600 hover:text-white rounded-xl transition-all duration-300 shadow-sm border border-amber-100/50"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => setDeleteTarget(project._id || project.id)}
                        title="Delete Project"
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
        {pagination.pages > 0 && (
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

      {/* Add Project Modal */}
      {isFormOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl max-h-[90vh] flex flex-col overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between">
              <h2 className="text-lg font-bold text-slate-900">{editingId ? 'Edit Project' : 'Add New Project'}</h2>
              <button onClick={() => { setIsFormOpen(false); setEditingId(null); }} className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-full transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 overflow-y-auto flex-1 custom-scrollbar">
              <form id="projectForm" onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-slate-700">Project Title</label>
                    <input type="text" value={formData.title} onChange={e => { setFormData({ ...formData, title: e.target.value }); if (errors.title) setErrors({ ...errors, title: '' }); }} placeholder="e.g. Wipro Corporate Office" className="w-full bg-slate-50 border border-slate-200 focus:bg-white focus:border-brand focus:ring-2 focus:ring-brand/20 rounded-lg px-4 py-2.5 text-sm text-slate-900 outline-none transition-all" required />
                    {errors.title && <p className="text-red-500 text-xs mt-1">{errors.title}</p>}
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-slate-700">Category</label>
                    <select value={formData.category} onChange={e => { setFormData({ ...formData, category: e.target.value }); if (errors.category) setErrors({ ...errors, category: '' }); }} className="w-full bg-slate-50 border border-slate-200 focus:bg-white focus:border-brand focus:ring-2 focus:ring-brand/20 rounded-lg px-4 py-2.5 text-sm text-slate-900 outline-none transition-all" required>

                      <option value="">Select category</option>
                      {categories.map(cat => (
                        <option key={cat._id || cat.id} value={cat._id}>{cat.name}</option>
                      ))}
                      </select>
                    {errors.category && <p className="text-red-500 text-xs mt-1">{errors.category}</p>}

                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-slate-700">Status</label>
                    <select value={formData.status} onChange={e => setFormData({ ...formData, status: e.target.value })} className="w-full bg-slate-50 border border-slate-200 focus:bg-white focus:border-brand focus:ring-2 focus:ring-brand/20 rounded-lg px-4 py-2.5 text-sm text-slate-900 outline-none transition-all">
                      <option value="Planning">Planning</option>
                      <option value="In Progress">In Progress</option>
                      <option value="Completed">Completed</option>
                    </select>
                  </div>
                 {/* <div className="space-y-2">
                    <label className="text-sm font-medium text-slate-700">HVAC System Type</label>
                    <input type="text" value={formData.hvacSystemType} onChange={e => setFormData({...formData, hvacSystemType: e.target.value})} placeholder="e.g. VRV System, Split AC, Ducted" className="w-full bg-slate-50 border border-slate-200 focus:bg-white focus:border-brand focus:ring-2 focus:ring-brand/20 rounded-lg px-4 py-2.5 text-sm text-slate-900 outline-none transition-all" />
                  </div> */}
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-slate-700">City</label>
                    <input type="text" value={formData.location} onChange={e => setFormData({...formData, location: e.target.value})} placeholder="e.g. New York" className="w-full bg-slate-50 border border-slate-200 focus:bg-white focus:border-brand focus:ring-2 focus:ring-brand/20 rounded-lg px-4 py-2.5 text-sm text-slate-900 outline-none transition-all" />
                  </div> 
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-700">Project Details / Description</label>
                  <textarea rows="4" value={formData.description} onChange={e => setFormData({ ...formData, description: e.target.value })} placeholder="Describe the HVAC solutions provided..." className="w-full bg-slate-50 border border-slate-200 focus:bg-white focus:border-brand focus:ring-2 focus:ring-brand/20 rounded-lg px-4 py-2.5 text-sm text-slate-900 outline-none transition-all resize-none"></textarea>
                </div>

                <div className="space-y-2 max-w-md">
                  <label className="text-sm font-medium text-slate-700 flex items-center justify-between">
                    Project Image
                    <span className="text-[10px] text-slate-400 font-normal tracking-normal">Recommended: 1200 x 700 px</span>
                  </label>
                  <label className="border-2 border-dashed border-slate-200 rounded-xl p-8 flex flex-col items-center justify-center text-center hover:bg-slate-50 hover:border-brand/40 transition-colors cursor-pointer group relative overflow-hidden h-48">
                    <input type="file" accept="image/png, image/jpeg, image/jpg, image/webp" className="hidden" onChange={onImageChange} />
                    {previewImage ? (
                      <img src={getImageUrl(previewImage)} alt="Preview" className="absolute inset-0 w-full h-full object-cover" />
                    ) : (
                      <>
                        <div className="w-12 h-12 bg-blue-50 rounded-full flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                          <Upload className="w-5 h-5 text-brand" />
                        </div>
                        <p className="text-sm font-medium text-slate-700">Click to upload image</p>
                        <p className="text-xs text-slate-500 mt-1">SVG, PNG, JPG or GIF (max. 5MB)</p>
                      </>
                    )}
                  </label>
                  {errors.image && <p className="text-red-500 text-xs mt-1">{errors.image}</p>}
                </div>
              </form>
            </div>

            <div className="px-6 py-4 border-t border-slate-200 bg-slate-50 flex items-center justify-end gap-3">
              <button onClick={() => setIsFormOpen(false)} className="px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-200 bg-white border border-slate-200 rounded-lg transition-colors">
                Cancel
              </button>
              <button type="submit" form="projectForm" className="px-4 py-2 text-sm font-medium text-white bg-brand hover:bg-brand-hover rounded-lg transition-colors shadow-sm shadow-brand/20">
                Save Project
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default Projects
