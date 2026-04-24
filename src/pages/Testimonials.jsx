import React, { useState, useEffect } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { Plus, Trash2, X, Upload, Image as ImageIcon, ChevronLeft, ChevronRight, CheckCircle2 } from 'lucide-react'
import { fetchTestimonials, createTestimonial, deleteTestimonialAsync } from '../store/slices/testimonialsSlice'
import { getImageUrl } from '../utils/imageHandler'
import { toast } from 'react-hot-toast'
import DeleteConfirmModal from '../components/DeleteConfirmModal'
import { motion, AnimatePresence } from 'framer-motion'

const Testimonials = () => {
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [selectedFile, setSelectedFile] = useState(null)
  const [previewImage, setPreviewImage] = useState(null)
  const [currentPage, setCurrentPage] = useState(1)
  const [deleteTarget, setDeleteTarget] = useState(null)
  const [deleteLoading, setDeleteLoading] = useState(false)
  const [isDragging, setIsDragging] = useState(false)

  const { items: testimonials, loading, error, pagination } = useSelector(state => state.testimonials)
  const dispatch = useDispatch()

  useEffect(() => {
    dispatch(fetchTestimonials({ page: currentPage, limit: 12 }))
  }, [dispatch, currentPage])

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!selectedFile) {
      toast.error('Select an image')
      return
    }

    const data = new FormData()
    data.append('image', selectedFile)

    try {
      await dispatch(createTestimonial(data)).unwrap()
      toast.success('Testimonial added!')
      setIsFormOpen(false)
      resetForm()
    } catch (err) {
      toast.error(err.message || 'Failed to save')
    }
  }

  const resetForm = () => {
    setSelectedFile(null)
    setPreviewImage(null)
    setIsDragging(false)
  }

  const onImageChange = (e) => {
    const file = e.target.files?.[0] || e.dataTransfer?.files?.[0]
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
      await dispatch(deleteTestimonialAsync(deleteTarget)).unwrap()
      toast.success('Removed')
    } catch {
      toast.error('Failed')
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
        title="Delete Testimonial"
        description="Are you sure you want to remove this testimonial image?"
      />

      <div className="flex items-end justify-between gap-4">
        <div>
          <h1 className="text-lg font-bold text-slate-900 tracking-tight">Testimonials</h1>
          <p className="text-[11px] font-medium text-slate-400 uppercase tracking-wider mt-0.5">Customer Feedback Gallery</p>
        </div>
        <button
          onClick={() => { resetForm(); setIsFormOpen(true); }}
          className="inline-flex items-center gap-2 bg-slate-900 hover:bg-slate-800 text-white px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all shadow-sm"
        >
          <Plus className="w-3.5 h-3.5" />
          Add Preview
        </button>
      </div>

      <div className="bg-white border border-slate-200 rounded-xl shadow-sm p-4">
        {loading && testimonials.length === 0 ? (
          <div className="py-20 text-center text-slate-300 animate-pulse font-bold text-xs uppercase tracking-widest">
            Loading Gallery...
          </div>
        ) : testimonials.length === 0 ? (
          <div className="py-20 text-center text-slate-400 font-bold text-xs uppercase tracking-widest border-2 border-dashed border-slate-100 rounded-xl">
            Gallery is empty.
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4">
            {testimonials.map((item) => (
              <div key={item._id} className="group relative aspect-[3/4] bg-slate-50 rounded-lg overflow-hidden border border-slate-100 shadow-sm">
                <img src={getImageUrl(item.image)} alt="" className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
                <div className="absolute inset-0 bg-slate-900/10 flex items-center justify-center backdrop-blur-[0.5px]">
                  <div className="absolute top-2 right-2">
                    <button
                      onClick={() => setDeleteTarget(item._id)}
                      className="p-1.5 bg-rose-500 text-white rounded-lg hover:bg-rose-600 transition-all shadow-lg active:scale-90"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
                <div className="absolute top-2 left-2 px-1.5 py-0.5 bg-black/20 backdrop-blur-md rounded text-[8px] font-bold text-white uppercase tracking-widest">
                  {new Date(item.createdAt).toLocaleDateString()}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Pagination */}
        {pagination.pages > 1 && (
          <div className="mt-8 pt-4 border-t border-slate-100 flex items-center justify-between">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
              {pagination.total} Items
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
                    <ImageIcon className="w-4 h-4" />
                  </div>
                  <div>
                    <h2 className="text-sm font-bold text-slate-900 leading-tight">Add Testimonial</h2>
                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Visual Feedback</p>
                  </div>
                </div>
                <button onClick={() => setIsFormOpen(false)} className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-50 rounded-lg transition-all">
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="p-5 space-y-4">
                <div
                  onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
                  onDragLeave={() => setIsDragging(false)}
                  onDrop={(e) => { e.preventDefault(); setIsDragging(false); onImageChange(e); }}
                  className={`relative group border-2 border-dashed rounded-xl transition-all h-64 overflow-hidden cursor-pointer flex flex-col items-center justify-center text-center
                    ${isDragging ? 'border-brand bg-brand/5' : 'border-slate-100 hover:border-brand/30 bg-slate-50/50'}
                  `}
                >
                  <input type="file" accept="image/*" className="hidden" id="testimonial-upload" onChange={onImageChange} />
                  <label htmlFor="testimonial-upload" className="absolute inset-0 cursor-pointer z-10"></label>

                  {previewImage ? (
                    <img src={previewImage} alt="Preview" className="absolute inset-0 w-full h-full object-cover" />
                  ) : (
                    <div className="space-y-2 p-4">
                      <div className="w-12 h-12 rounded-xl bg-white flex items-center justify-center mx-auto shadow-sm text-slate-300">
                        <Upload className="w-6 h-6" />
                      </div>
                      <p className="text-xs font-bold text-slate-900">Drop testimonial here</p>
                      <p className="text-[10px] text-slate-400 font-medium">JPG or PNG (max. 5MB)</p>
                    </div>
                  )}
                </div>

                <div className="flex items-center gap-3 pt-2">
                  <button type="button" onClick={() => setIsFormOpen(false)} className="flex-1 py-1.5 text-xs font-bold text-slate-500 hover:bg-slate-100 rounded-lg transition-all">
                    Cancel
                  </button>
                  <button onClick={handleSubmit} disabled={!selectedFile} className="flex-1 py-1.5 text-xs font-bold text-white bg-slate-900 rounded-lg hover:bg-slate-800 transition-all shadow-sm disabled:opacity-50">
                    Upload Preview
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  )
}

export default Testimonials
