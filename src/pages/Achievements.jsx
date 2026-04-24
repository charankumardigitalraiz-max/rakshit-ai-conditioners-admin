import React, { useState, useEffect } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { Plus, Award, Edit, Trash2, X, Upload, Calendar, ChevronRight } from 'lucide-react'
import { fetchAchievements, createAchievement, deleteAchievementAsync, updateAchievementAsync } from '../store/slices/achievementsSlice'
import { getImageUrl } from '../utils/imageHandler'
import { toast } from 'react-hot-toast'
import DeleteConfirmModal from '../components/DeleteConfirmModal'
import { motion, AnimatePresence } from 'framer-motion'

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
    if (selectedFile) data.append('image', selectedFile)

    try {
      if (editingId) {
        await dispatch(updateAchievementAsync({ id: editingId, data })).unwrap()
        toast.success('Milestone updated!')
      } else {
        await dispatch(createAchievement(data)).unwrap()
        toast.success('Milestone added!')
      }
      closeModal()
    } catch (err) {
      toast.error(err.message || 'Failed to save')
    }
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
      reader.onloadend = () => setPreviewImage(reader.result)
      reader.readAsDataURL(file)
    }
  }

  const handleDelete = async () => {
    if (!deleteTarget) return
    setDeleteLoading(true)
    try {
      await dispatch(deleteAchievementAsync(deleteTarget)).unwrap()
      toast.success('Removed successfully!')
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
        title="Remove Milestone"
        description="This will permanently delete this achievement."
      />

      <div className="flex items-end justify-between gap-4">
        <div>
          <h1 className="text-lg font-bold text-slate-900 tracking-tight">Achievements</h1>
          <p className="text-[11px] font-medium text-slate-400 uppercase tracking-wider mt-0.5">Corporate Milestones & Awards</p>
        </div>
        <button
          onClick={() => setIsFormOpen(true)}
          className="inline-flex items-center gap-2 bg-slate-900 hover:bg-slate-800 text-white px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all shadow-sm"
        >
          <Plus className="w-3.5 h-3.5" />
          Add Milestone
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {loading ? (
          <div className="col-span-full py-20 text-center text-slate-300 animate-pulse font-bold text-xs uppercase tracking-widest">
            Syncing Milestones...
          </div>
        ) : achievements.length === 0 ? (
          <div className="col-span-full py-20 text-center text-slate-400 font-bold text-xs uppercase tracking-widest border-2 border-dashed border-slate-100 rounded-xl">
            No milestones recorded.
          </div>
        ) : (
          achievements.map((item) => (
            <div key={item._id} className="group bg-white border border-slate-200 rounded-xl overflow-hidden flex flex-col hover:border-brand/40 hover:shadow-md transition-all">
              <div className="h-32 bg-slate-50 border-b border-slate-100 flex items-center justify-center relative overflow-hidden shrink-0">
                {item.image ? (
                  <img src={getImageUrl(item.image)} alt="" className="absolute inset-0 w-full h-full object-cover" />
                ) : (
                  <div className="w-10 h-10 bg-white rounded-lg border border-slate-200 flex items-center justify-center shadow-sm relative z-10 group-hover:scale-110 transition-transform">
                    <Award className="w-5 h-5 text-brand" />
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
                  <span className="text-[9px] font-extrabold uppercase tracking-wider text-brand bg-brand/5 px-1.5 py-0.5 rounded">
                    {item.year}
                  </span>
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
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Add Milestone</p>
        </button>
      </div>

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
                    <Award className="w-4 h-4" />
                  </div>
                  <div>
                    <h2 className="text-sm font-bold text-slate-900 leading-tight">{editingId ? 'Edit Milestone' : 'New Milestone'}</h2>
                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Achievement Details</p>
                  </div>
                </div>
                <button onClick={closeModal} className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-50 rounded-lg transition-all">
                  <X className="w-4 h-4" />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="p-5 space-y-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Milestone Title</label>
                  <input type="text" value={formData.title} onChange={e => setFormData({ ...formData, title: e.target.value })} placeholder="e.g. Best Contractor 2024" className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs font-bold text-slate-900 outline-none focus:border-brand transition-all" required />
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Year</label>
                    <input type="text" value={formData.year} onChange={e => setFormData({ ...formData, year: e.target.value })} placeholder="2024" className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs font-bold text-slate-900 outline-none focus:border-brand transition-all" required />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Status</label>
                    <select value={formData.status} onChange={e => setFormData({ ...formData, status: e.target.value })} className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs font-bold text-slate-900 outline-none focus:border-brand transition-all">
                      <option value="Active">Active</option>
                      <option value="Draft">Draft</option>
                    </select>
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Overview</label>
                  <textarea rows="3" value={formData.description} onChange={e => setFormData({ ...formData, description: e.target.value })} placeholder="Brief description..." className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs font-bold text-slate-900 outline-none focus:border-brand transition-all resize-none"></textarea>
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
                    {editingId ? 'Update Milestone' : 'Publish Milestone'}
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

export default Achievements
