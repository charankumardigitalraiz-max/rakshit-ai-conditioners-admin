import React, { useState, useEffect } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { Plus, Trash2, X, Upload, Image as ImageIcon, LayoutGrid, CheckCircle2, AlertCircle } from 'lucide-react'
import { fetchTestimonials, createTestimonial, deleteTestimonialAsync } from '../store/slices/testimonialsSlice'
import { getImageUrl } from '../utils/imageHandler'
import { toast } from 'react-hot-toast'
import DeleteConfirmModal from '../components/DeleteConfirmModal'

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
    dispatch(fetchTestimonials({
      page: currentPage,
      limit: 12
    }))
  }, [dispatch, currentPage])

  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= pagination.pages) {
      setCurrentPage(newPage)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!selectedFile) {
      toast.error('Please select an image')
      return
    }

    const data = new FormData()
    data.append('image', selectedFile)

    try {
      await dispatch(createTestimonial(data)).unwrap()
      toast.success('Testimonial added successfully!')
      setIsFormOpen(false)
      resetForm()
      dispatch(fetchTestimonials({ page: currentPage, limit: 12 }))
    } catch (err) {
      toast.error(err.message || 'Failed to save testimonial')
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
      reader.onloadend = () => {
        setPreviewImage(reader.result)
      }
      reader.readAsDataURL(file)
    }
  }

  const handleDragOver = (e) => {
    e.preventDefault()
    setIsDragging(true)
  }

  const handleDragLeave = () => {
    setIsDragging(false)
  }

  const handleDrop = (e) => {
    e.preventDefault()
    setIsDragging(false)
    onImageChange(e)
  }

  const handleDelete = async () => {
    if (!deleteTarget) return
    setDeleteLoading(true)
    try {
      await dispatch(deleteTestimonialAsync(deleteTarget)).unwrap()
      toast.success('Testimonial removed')
    } catch {
      toast.error('Failed to delete')
    } finally {
      setDeleteLoading(false)
      setDeleteTarget(null)
    }
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      <DeleteConfirmModal
        isOpen={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
        loading={deleteLoading}
        title="Delete Testimonial"
        description="Are you sure you want to remove this testimonial? This action will immediately reflect on the website gallery."
      />

      {/* ── Header ── */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-2">
        <div className="space-y-1">
          <h1 className="text-3xl font-black text-slate-900 tracking-tight" style={{ fontFamily: 'Outfit, sans-serif' }}>
            Client Testimonials
          </h1>
          <p className="text-slate-500 font-medium max-w-lg">
            Manage the visual gallery of customer feedback and success stories shared by our valued clients.
          </p>
        </div>
        <button
          onClick={() => { resetForm(); setIsFormOpen(true); }}
          className="group inline-flex items-center justify-center gap-2.5 bg-brand hover:bg-brand-hover text-white px-6 py-3.5 rounded-2xl text-sm font-bold transition-all duration-300 shadow-xl shadow-brand/20 active:scale-95"
        >
          <Plus className="w-5 h-5 transition-transform group-hover:rotate-90" />
          Add New Preview
        </button>
      </div>

      {/* ── Stats Bar ── */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {[
          { label: 'Total Testimonials', value: pagination.total || 0, icon: ImageIcon, color: 'text-blue-600', bg: 'bg-blue-50' },
          { label: 'Active Gallery', value: 'Live', icon: LayoutGrid, color: 'text-brand', bg: 'bg-indigo-50' },
          { label: 'Verified Reviews', value: '100%', icon: CheckCircle2, color: 'text-emerald-600', bg: 'bg-emerald-50' },
        ].map((stat, i) => (
          <div key={i} className="bg-white border border-slate-100 rounded-2xl p-4 flex items-center gap-4 shadow-sm">
            <div className={`w-12 h-12 ${stat.bg} ${stat.color} rounded-xl flex items-center justify-center`}>
              <stat.icon className="w-6 h-6" />
            </div>
            <div>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{stat.label}</p>
              <p className="text-xl font-black text-slate-900 leading-tight">{stat.value}</p>
            </div>
          </div>
        ))}
      </div>

      {/* ── Gallery Main ── */}
      <div className="py-2">
        {loading && testimonials.length === 0 ? (
          <div className="py-32 flex flex-col items-center justify-center text-slate-300 gap-4">
            <div className="w-12 h-12 border-4 border-brand border-t-transparent rounded-full animate-spin"></div>
            <p className="text-sm font-bold uppercase tracking-widest text-slate-400">Loading Gallery...</p>
          </div>
        ) : error ? (
          <div className="py-32 text-center flex flex-col items-center gap-4">
            <div className="w-16 h-16 bg-rose-50 text-rose-500 rounded-full flex items-center justify-center border border-rose-100">
              <AlertCircle className="w-8 h-8" />
            </div>
            <p className="text-rose-500 font-bold">{error}</p>
          </div>
        ) : testimonials.length === 0 ? (
          <div className="py-32 text-center flex flex-col items-center gap-4 group">
            <div className="w-20 h-20 bg-slate-50 text-slate-200 rounded-full flex items-center justify-center border border-slate-100 group-hover:scale-110 transition-transform duration-500">
              <ImageIcon className="w-10 h-10" />
            </div>
            <div className="space-y-1">
              <p className="text-slate-900 font-bold text-lg">No testimonials yet</p>
              <p className="text-slate-400 text-sm">Upload your first customer feedback image to get started.</p>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-8">
            {testimonials.map((testimonial, idx) => (
              <div
                key={testimonial._id || testimonial.id}
                className="group relative aspect-[4/5] bg-white rounded-[1.75rem] border border-slate-200/60 overflow-hidden hover:shadow-[0_40px_100px_-20px_rgba(0,0,0,0.12)] transition-all duration-700 animate-in fade-in slide-in-from-bottom-4"
                style={{ animationDelay: `${idx * 50}ms` }}
              >
                <img
                  src={getImageUrl(testimonial.image)}
                  alt="Testimonial"
                  className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110"
                />

                {/* ── Glass Overlay ── */}
                <div className="absolute inset-0 bg-slate-900/0 group-hover:bg-slate-900/60 transition-all duration-500 backdrop-blur-[0px] group-hover:backdrop-blur-sm flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 p-6">
                  <div className="text-center space-y-4 transform translate-y-10 group-hover:translate-y-0 transition-transform duration-500">
                    <p className="text-white/60 text-[10px] font-bold uppercase tracking-widest">Added on {new Date(testimonial.createdAt).toLocaleDateString()}</p>
                    <button
                      onClick={() => setDeleteTarget(testimonial._id || testimonial.id)}
                      className="inline-flex items-center gap-2 px-6 py-2.5 bg-rose-500 text-white rounded-xl hover:bg-rose-600 transition-all shadow-xl shadow-rose-500/20 active:scale-95"
                    >
                      <Trash2 className="w-4 h-4" />
                      <span className="text-xs font-bold uppercase tracking-wider">Remove</span>
                    </button>
                  </div>
                </div>

                {/* ── Bottom Gradient Fade (Static) ── */}
                <div className="absolute bottom-0 left-0 w-full h-24 bg-gradient-to-t from-black/20 to-transparent pointer-events-none group-hover:opacity-0 transition-opacity"></div>
              </div>
            ))}
          </div>
        )}

        {/* ── Modern Pagination ── */}
        {pagination.pages > 1 && (
          <div className="mt-16 pt-8 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-6">
            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">
              Showing <span className="text-slate-900">{(pagination.page - 1) * pagination.limit + 1} - {Math.min(pagination.page * pagination.limit, pagination.total)}</span> of <span className="text-slate-900">{pagination.total}</span> Testimonials
            </p>
            <div className="flex items-center gap-2">
              <button
                onClick={() => handlePageChange(pagination.page - 1)}
                disabled={pagination.page <= 1}
                className="px-5 py-2.5 bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-50 disabled:opacity-30 disabled:hover:bg-white transition-all shadow-sm"
              >
                Previous
              </button>
              <div className="flex items-center gap-1.5 px-3">
                {[...Array(pagination.pages)].map((_, i) => (
                  <button
                    key={i + 1}
                    onClick={() => handlePageChange(i + 1)}
                    className={`w-10 h-10 rounded-xl text-xs font-black transition-all ${pagination.page === i + 1
                      ? 'bg-brand text-white shadow-lg shadow-brand/20 scale-110'
                      : 'text-slate-400 hover:bg-slate-50'
                      }`}
                  >
                    {i + 1}
                  </button>
                ))}
              </div>
              <button
                onClick={() => handlePageChange(pagination.page + 1)}
                disabled={pagination.page >= pagination.pages}
                className="px-5 py-2.5 bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-50 disabled:opacity-30 disabled:hover:bg-white transition-all shadow-sm"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>

      {/* ── Premium Add Modal ── */}
      {isFormOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md animate-in fade-in duration-300">
          <div className="bg-white rounded-[2.5rem] shadow-2xl w-full max-w-xl overflow-hidden flex flex-col animate-in slide-in-from-bottom-8 zoom-in-95 duration-500 border border-white/20">
            <div className="px-8 py-6 border-b border-slate-100 flex items-center justify-between">
              <div>
                <h2 className="text-xl font-black text-slate-900 tracking-tight">Add Testimonial</h2>
                <p className="text-xs text-slate-400 font-medium tracking-wide">Upload a customer feedback screenshot</p>
              </div>
              <button
                onClick={() => setIsFormOpen(false)}
                className="p-3 text-slate-400 hover:text-slate-600 hover:bg-slate-50 rounded-full transition-all active:scale-90"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="p-8">
              <form onSubmit={handleSubmit} className="space-y-8">
                <div
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onDrop={handleDrop}
                  className={`relative group border-2 border-dashed rounded-[2rem] transition-all duration-500 h-80 overflow-hidden cursor-pointer flex flex-col items-center justify-center text-center
                    ${isDragging ? 'border-brand bg-brand/5 scale-[0.98]' : 'border-slate-200 hover:border-brand/40 bg-slate-50/50 hover:bg-brand/[0.02]'}
                  `}
                >
                  <input type="file" accept="image/*" className="hidden" id="testimonial-upload" onChange={onImageChange} />
                  <label htmlFor="testimonial-upload" className="absolute inset-0 cursor-pointer z-10"></label>

                  {previewImage ? (
                    <>
                      <img src={previewImage} alt="Preview" className="absolute inset-0 w-full h-full object-cover" />
                      <div className="absolute inset-0 bg-slate-900/40 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center backdrop-blur-[2px]">
                        <div className="w-14 h-14 bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center text-white mb-2 border border-white/30">
                          <Plus className="w-7 h-7" />
                        </div>
                        <p className="text-white text-xs font-black uppercase tracking-widest">Change Image</p>
                      </div>
                    </>
                  ) : (
                    <div className="space-y-4 p-8">
                      <div className={`w-20 h-20 rounded-3xl flex items-center justify-center mx-auto transition-all duration-500
                        ${isDragging ? 'bg-brand text-white scale-110 shadow-xl shadow-brand/20' : 'bg-white text-brand shadow-lg shadow-brand/10'}
                      `}>
                        <Upload className={`w-8 h-8 ${isDragging ? 'animate-bounce' : ''}`} />
                      </div>
                      <div className="space-y-1">
                        <p className="text-lg font-black text-slate-900">Drop testimonial here</p>
                        <p className="text-sm text-slate-400 font-medium">or click anywhere to browse files</p>
                      </div>
                      <div className="pt-4 flex items-center justify-center gap-6">
                        <div className="flex items-center gap-2 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                          JPG or PNG
                        </div>
                        <div className="flex items-center gap-2 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                          Up to 5MB
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                <div className="flex items-center gap-4">
                  <button
                    type="button"
                    onClick={() => setIsFormOpen(false)}
                    className="flex-1 px-6 py-4 text-sm font-bold text-slate-600 hover:bg-slate-50 bg-white border border-slate-200 rounded-2xl transition-all active:scale-95"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={!selectedFile}
                    className="flex-1 px-6 py-4 text-sm font-bold text-white bg-brand hover:bg-brand-hover rounded-2xl transition-all shadow-xl shadow-brand/20 active:scale-95 disabled:opacity-50 disabled:shadow-none"
                  >
                    Complete Upload
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default Testimonials
