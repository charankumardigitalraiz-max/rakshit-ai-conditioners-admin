import React, { useState, useEffect } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { Plus, Award, MoreVertical, Edit, Trash2, X, Upload } from 'lucide-react'
import { fetchAchievements, createAchievement, deleteAchievementAsync, updateAchievementAsync } from '../store/slices/achievementsSlice'
import { getImageUrl } from '../utils/imageHandler'
import { toast } from 'react-hot-toast'
import DeleteConfirmModal from '../components/DeleteConfirmModal'
const Achievements = () => {
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [editingId, setEditingId] = useState(null)
  const [formData, setFormData] = useState({ title: '', year: '', description: '', status: 'Active' })
  const [selectedFile, setSelectedFile] = useState(null)
  const [previewImage, setPreviewImage] = useState(null)
  const [deleteTarget, setDeleteTarget] = useState(null)
  const [deleteLoading, setDeleteLoading] = useState(false)
  const { items: achievements, loading, error } = useSelector(state => state.achievements)
  const dispatch = useDispatch()

  useEffect(() => {
    dispatch(fetchAchievements())
  }, [dispatch])

  const handleSubmit = async (e) => {
    e.preventDefault()

    const data = new FormData()
    Object.keys(formData).forEach(key => data.append(key, formData[key]))
    if (selectedFile) {
      data.append('image', selectedFile)
    } else if (editingId && achievements.find(a => (a._id || a.id) === editingId)?.image) {
      data.append('image', achievements.find(a => (a._id || a.id) === editingId).image)
    }

    if (editingId) {
      await dispatch(updateAchievementAsync({ id: editingId, data })).unwrap()
      toast.success('Achievement updated successfully!')
    } else {
      await dispatch(createAchievement(data)).unwrap()
      toast.success('Achievement created successfully!')
    }

    closeModal()
  }

  const handleEdit = (achievement) => {
    setEditingId(achievement._id || achievement.id)
    setFormData({
      title: achievement.title,
      year: achievement.year,
      description: achievement.description,
      status: achievement.status
    })
    setPreviewImage(achievement.image)
    setIsFormOpen(true)
  }

  const closeModal = () => {
    setIsFormOpen(false)
    setEditingId(null)
    setFormData({ title: '', year: '', description: '', status: 'Active' })
    setSelectedFile(null)
    setPreviewImage(null)
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
      await dispatch(deleteAchievementAsync(deleteTarget)).unwrap()
      toast.success('Achievement deleted successfully!')
    } catch {
      toast.error('Failed to delete achievement')
    } finally {
      setDeleteLoading(false)
      setDeleteTarget(null)
    }
  }

  return (
    <>
      <div className="space-y-6">
        <DeleteConfirmModal
          isOpen={!!deleteTarget}
          onClose={() => setDeleteTarget(null)}
          onConfirm={handleDelete}
          loading={deleteLoading}
          title="Delete Achievement"
          description="Are you sure you want to delete this achievement? This action cannot be undone."
        />
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Corporate Achievements</h1>
            <p className="text-sm text-slate-500 mt-1">Manage company milestones, awards, and certifications.</p>
          </div>
          <button onClick={() => setIsFormOpen(true)} className="inline-flex items-center justify-center gap-2 bg-brand hover:bg-brand-hover text-white px-4 py-2.5 rounded-lg text-sm font-medium transition-colors shadow-sm shadow-brand/20">
            <Plus className="w-4 h-4" />
            Add Achievement
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {achievements.map((item) => (
            <div key={item.id} className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden flex flex-col group hover:border-brand/30 hover:shadow-md transition-all">
              <div className="h-40 bg-slate-50 border-b border-slate-100 flex items-center justify-center relative overflow-hidden">
                {item.image ? (
                  <img src={getImageUrl(item.image)} alt="" className="absolute inset-0 w-full h-full object-cover" />
                ) : (
                  <>
                    <div className="absolute inset-0 bg-gradient-to-br from-blue-50/50 to-transparent"></div>
                    <div className="w-16 h-16 bg-white rounded-full border border-slate-200 flex items-center justify-center shadow-sm relative z-10 group-hover:scale-110 transition-transform duration-500">
                      <Award className="w-8 h-8 text-brand" />
                    </div>
                  </>
                )}
                <div className="absolute top-3 right-3">
                  <button className="p-1.5 text-slate-400 hover:text-slate-700 bg-white/80 rounded-md backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-opacity border border-slate-200 shadow-sm">
                    <MoreVertical className="w-4 h-4" />
                  </button>
                </div>
              </div>
              <div className="p-5 flex-1 flex flex-col">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[10px] font-bold uppercase tracking-widest text-brand bg-blue-50 px-2 py-0.5 rounded text-center">
                    {item.year}
                  </span>
                  <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider
                    ${item.status === 'Active' ? 'bg-emerald-50 text-emerald-600 border border-emerald-100' : 'bg-rose-50 text-rose-600 border border-rose-100'}
                  `}>
                    {item.status}
                  </span>
                </div>
                <h3 className="text-base font-bold text-slate-900 mb-2 leading-tight">
                  {item.title}
                </h3>
                <p className="text-sm text-slate-500 flex-1">
                  {item.description}
                </p>

                <div className="mt-auto pt-4 border-t border-slate-100 flex items-center justify-end gap-2.5">
                  <button
                    onClick={() => handleEdit(item)}
                    title="Edit Milestone"
                    className="flex-1 sm:flex-none inline-flex items-center justify-center gap-1.5 px-4 py-2 text-xs font-bold text-amber-600 bg-amber-50 border border-amber-100/50 rounded-xl hover:bg-amber-600 hover:text-white transition-all duration-300 shadow-sm"
                  >
                    <Edit className="w-3.5 h-3.5" /> Edit
                  </button>
                  <button
                    onClick={() => setDeleteTarget(item._id || item.id)}
                    title="Remove Milestone"
                    className="flex-1 sm:flex-none inline-flex items-center justify-center gap-1.5 px-4 py-2 text-xs font-bold text-rose-600 bg-rose-50 border border-rose-100/50 rounded-xl hover:bg-rose-600 hover:text-white transition-all duration-300 shadow-sm"
                  >
                    <Trash2 className="w-3.5 h-3.5" /> Remove
                  </button>
                </div>
              </div>
            </div>
          ))}

          {/* Empty state / Add new card */}
          <div onClick={() => setIsFormOpen(true)} className="bg-slate-50 border-2 border-dashed border-slate-200 rounded-2xl flex flex-col items-center justify-center text-center p-8 min-h-[280px] hover:bg-slate-100 hover:border-brand/40 transition-colors cursor-pointer group">
            <div className="w-12 h-12 bg-white rounded-full border border-slate-200 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform shadow-sm">
              <Plus className="w-6 h-6 text-slate-400 group-hover:text-brand" />
            </div>
            <h3 className="text-sm font-semibold text-slate-900 mb-1">Add New Milestone</h3>
            <p className="text-xs text-slate-500 max-w-[200px]">Upload certificates or awards to display on the main website.</p>
          </div>
        </div>
      </div>

      {/* Add/Edit Achievement Modal */}
      {isFormOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg flex flex-col overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between">
              <h2 className="text-lg font-bold text-slate-900">{editingId ? 'Edit Achievement' : 'Add Achievement'}</h2>
              <button onClick={closeModal} className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-full transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form id="achievementForm" onSubmit={handleSubmit} className="p-6 space-y-4">
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Title</label>
                <input type="text" value={formData.title} onChange={e => setFormData({ ...formData, title: e.target.value })} placeholder="e.g. Best HVAC Contractor 2024" className="w-full bg-slate-50 border border-slate-200 rounded-lg px-4 py-2.5 text-sm outline-none focus:border-brand" required />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Year</label>
                  <input type="text" value={formData.year} onChange={e => setFormData({ ...formData, year: e.target.value })} placeholder="e.g. 2024" className="w-full bg-slate-50 border border-slate-200 rounded-lg px-4 py-2.5 text-sm outline-none focus:border-brand" required />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Status</label>
                  <select value={formData.status} onChange={e => setFormData({ ...formData, status: e.target.value })} className="w-full bg-slate-50 border border-slate-200 rounded-lg px-4 py-2.5 text-sm outline-none focus:border-brand">
                    <option value="Active">Active</option>
                    <option value="Draft">Draft</option>
                  </select>
                </div>
              </div>
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Description</label>
                <textarea rows="3" value={formData.description} onChange={e => setFormData({ ...formData, description: e.target.value })} placeholder="Achievement details..." className="w-full bg-slate-50 border border-slate-200 rounded-lg px-4 py-2.5 text-sm outline-none focus:border-brand resize-none"></textarea>
              </div>
              <div className="space-y-1 max-w-xs">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center justify-between">
                  Image
                  <span className="text-[10px] text-slate-400 font-normal">Recommended: 800 x 800 px</span>
                </label>
                <label className="border-2 border-dashed border-slate-200 rounded-xl p-4 flex flex-col items-center justify-center text-center hover:bg-slate-50 cursor-pointer relative overflow-hidden h-32">
                  <input type="file" accept="image/png, image/jpeg, image/jpg, image/webp" className="hidden" onChange={onImageChange} />
                  {previewImage ? (
                    <img src={getImageUrl(previewImage)} alt="Preview" className="absolute inset-0 w-full h-full object-cover" />
                  ) : (
                    <>
                      <Upload className="w-6 h-6 text-slate-300 mb-1" />
                      <p className="text-[10px] text-slate-500">Upload Award/Cert Image</p>
                    </>
                  )}
                </label>
              </div>
            </form>

            <div className="px-6 py-4 border-t border-slate-200 bg-slate-50 flex items-center justify-end gap-3">
              <button onClick={closeModal} className="px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100 rounded-lg transition-colors">Cancel</button>
              <button type="submit" form="achievementForm" className="px-4 py-2 text-sm font-medium text-white bg-brand hover:bg-brand-hover rounded-lg transition-colors">Save Achievement</button>
            </div>
          </div>
        </div>
      )}
      {/* </div> */}
    </>
  )
}

export default Achievements
