import React, { useState, useEffect } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import {
  Plus, Edit, Trash2, X, Upload, MapPin, Phone, Mail, Wrench,
  Building2, Image as ImageIcon, Video, ExternalLink, Eye
} from 'lucide-react'
import { toast } from 'react-hot-toast'
import DeleteConfirmModal from '../components/DeleteConfirmModal'
import { motion, AnimatePresence } from 'framer-motion'
import { getImageUrl } from '../utils/imageHandler'
import {
  fetchBranches,
  fetchContactChannels,
  createBranch,
  updateBranchAsync,
  deleteBranchAsync,
  updateContactChannelAsync,
} from '../store/slices/branchesSlice'

const emptyBranchForm = {
  name: '',
  badge: '',
  address: '',
  mapEmbed: '',
  navUrl: '',
  theme: '#0072bc',
  mapPosition: 'right',
  galleryLabel: 'Infrastructure Gallery',
  video: null,
  isActive: true,
  sortOrder: 1,
}

const channelIcons = {
  phone: Phone,
  email: Mail,
  sales: Phone,
  technical: Wrench,
}

const Branches = () => {
  const dispatch = useDispatch()
  const { items: branches, channels: contactChannels, loading, channelsLoading } = useSelector((state) => state.branches)

  const [activeTab, setActiveTab] = useState('branches')
  const [editingChannel, setEditingChannel] = useState(null)
  const [channelForm, setChannelForm] = useState({})
  const [channelSubmitting, setChannelSubmitting] = useState(false)

  const [isBranchFormOpen, setIsBranchFormOpen] = useState(false)
  const [branchForm, setBranchForm] = useState(emptyBranchForm)
  const [editingBranchId, setEditingBranchId] = useState(null)
  const [existingImages, setExistingImages] = useState([])
  const [newImageFiles, setNewImageFiles] = useState([])
  const [newImagePreviews, setNewImagePreviews] = useState([])
  const [branchVideo, setBranchVideo] = useState(null)
  const [videoPreview, setVideoPreview] = useState(null)
  const [removeVideo, setRemoveVideo] = useState(false)
  const [showValidation, setShowValidation] = useState(false)
  const [deleteTarget, setDeleteTarget] = useState(null)
  const [deleteLoading, setDeleteLoading] = useState(false)
  const [previewBranch, setPreviewBranch] = useState(null)
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    dispatch(fetchBranches({ limit: 50 }))
    dispatch(fetchContactChannels())
  }, [dispatch])

  const openChannelEdit = (channel) => {
    setEditingChannel(channel._id)
    setChannelForm({ ...channel })
  }

  const closeChannelEdit = () => {
    setEditingChannel(null)
    setChannelForm({})
  }

  const saveChannelEdit = async (e) => {
    e?.preventDefault()
    if (!channelForm.label || !channelForm.contactValue) {
      toast.error('Label and contact value are required')
      return
    }

    setChannelSubmitting(true)
    try {
      await dispatch(updateContactChannelAsync({
        id: editingChannel,
        data: {
          label: channelForm.label,
          contactValue: channelForm.contactValue,
          detail: channelForm.detail,
          theme: channelForm.theme,
          href: channelForm.href,
          type: channelForm.type,
        },
      })).unwrap()
      closeChannelEdit()
      toast.success('Channel updated')
    } catch (err) {
      toast.error(err || 'Failed to update channel')
    } finally {
      setChannelSubmitting(false)
    }
  }

  const resetBranchForm = () => {
    setBranchForm(emptyBranchForm)
    setEditingBranchId(null)
    setExistingImages([])
    setNewImageFiles([])
    setNewImagePreviews([])
    setBranchVideo(null)
    setVideoPreview(null)
    setRemoveVideo(false)
    setShowValidation(false)
  }

  const openBranchCreate = () => {
    resetBranchForm()
    setBranchForm({ ...emptyBranchForm, sortOrder: branches.length + 1 })
    setIsBranchFormOpen(true)
  }

  const openBranchEdit = (branch) => {
    setEditingBranchId(branch._id)
    setBranchForm({
      name: branch.name,
      badge: branch.badge || '',
      address: branch.address,
      mapEmbed: branch.mapEmbed,
      navUrl: branch.navUrl,
      theme: branch.theme || '#0072bc',
      mapPosition: branch.mapPosition || 'right',
      galleryLabel: branch.galleryLabel || 'Infrastructure Gallery',
      isActive: branch.isActive !== false,
      sortOrder: branch.sortOrder || 1,
    })
    setExistingImages(branch.images || [])
    setNewImageFiles([])
    setNewImagePreviews([])
    setBranchVideo(null)
    setVideoPreview(branch.video ? getImageUrl(branch.video) : null)
    setRemoveVideo(false)
    setShowValidation(false)
    setIsBranchFormOpen(true)
  }

  const onBranchImagesChange = (e) => {
    const files = Array.from(e.target.files || [])
    if (!files.length) return
    setNewImageFiles((prev) => [...prev, ...files])
    files.forEach((file) => {
      const reader = new FileReader()
      reader.onloadend = () => {
        setNewImagePreviews((prev) => [...prev, reader.result])
      }
      reader.readAsDataURL(file)
    })
  }

  const removeBranchImage = (index) => {
    if (index < existingImages.length) {
      setExistingImages((prev) => prev.filter((_, i) => i !== index))
      return
    }
    const newIndex = index - existingImages.length
    setNewImageFiles((prev) => prev.filter((_, i) => i !== newIndex))
    setNewImagePreviews((prev) => prev.filter((_, i) => i !== newIndex))
  }

  const onBranchVideoChange = (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    setBranchVideo(file)
    setVideoPreview(URL.createObjectURL(file))
    setRemoveVideo(false)
  }

  const buildBranchFormData = () => {
    const data = new FormData()
    data.append('name', branchForm.name)
    data.append('badge', branchForm.badge)
    data.append('address', branchForm.address)
    data.append('mapEmbed', branchForm.mapEmbed)
    data.append('navUrl', branchForm.navUrl)
    data.append('theme', branchForm.theme)
    data.append('mapPosition', branchForm.mapPosition)
    data.append('galleryLabel', branchForm.galleryLabel)
    data.append('isActive', branchForm.isActive)
    data.append('sortOrder', branchForm.sortOrder)
    data.append('existingImages', JSON.stringify(existingImages))
    newImageFiles.forEach((file) => data.append('images', file))
    if (branchVideo) {
      data.append('video', branchVideo)
    } else if (removeVideo) {
      data.append('removeVideo', 'true')
    }
    return data
  }

  const handleBranchSubmit = async (e) => {
    e.preventDefault()
    setShowValidation(true)

    if (!branchForm.name || !branchForm.address || !branchForm.mapEmbed || !branchForm.navUrl) {
      toast.error('Please fill all required fields')
      return
    }

    const data = buildBranchFormData()
    setSubmitting(true)

    try {
      if (editingBranchId) {
        await dispatch(updateBranchAsync({ id: editingBranchId, data })).unwrap()
        toast.success('Branch updated')
      } else {
        await dispatch(createBranch(data)).unwrap()
        toast.success('Branch added')
      }
      dispatch(fetchBranches({ limit: 50 }))
      setIsBranchFormOpen(false)
      resetBranchForm()
    } catch (err) {
      toast.error(err || 'Failed to save branch')
    } finally {
      setSubmitting(false)
    }
  }

  const handleDeleteBranch = async () => {
    if (!deleteTarget) return
    setDeleteLoading(true)
    try {
      await dispatch(deleteBranchAsync(deleteTarget)).unwrap()
      toast.success('Branch removed')
    } catch {
      toast.error('Failed to delete branch')
    } finally {
      setDeleteLoading(false)
      setDeleteTarget(null)
    }
  }

  const getBranchImageUrl = (img) => getImageUrl(img)
  const allImagePreviews = [
    ...existingImages.map((img) => getImageUrl(img)),
    ...newImagePreviews,
  ]

  const tabs = [
    { id: 'branches', label: 'Regional Branches', icon: Building2 },
    { id: 'channels', label: 'Contact Channels', icon: Phone },
  ]

  return (
    <div className="admin-page">
      <DeleteConfirmModal
        isOpen={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDeleteBranch}
        loading={deleteLoading}
        title="Delete Branch"
        description="Are you sure you want to remove this branch location?"
      />

      <div className="flex items-end justify-between gap-4 flex-wrap">
        <div>
          <h1 className="admin-page-title">Branches & Contact</h1>
          <p className="admin-page-subtitle">
            Manage website contact page content
          </p>
        </div>
        {activeTab === 'branches' && (
          <button
            onClick={openBranchCreate}
            className="admin-btn-primary"
          >
            <Plus className="w-3.5 h-3.5" />
            Add Branch
          </button>
        )}
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-lg w-fit">
        {tabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`inline-flex items-center gap-2 px-4 py-2 rounded-md text-xs font-bold transition-all ${
              activeTab === tab.id
                ? 'bg-white text-slate-900 shadow-sm'
                : 'text-slate-500 hover:text-slate-700'
            }`}
          >
            <tab.icon className="w-3.5 h-3.5" />
            {tab.label}
          </button>
        ))}
      </div>

      {/* Contact Channels Tab */}
      {activeTab === 'channels' && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {channelsLoading && contactChannels.length === 0 ? (
            <div className="col-span-full py-16 text-center text-slate-300 animate-pulse font-bold text-xs uppercase tracking-widest">
              Loading channels...
            </div>
          ) : contactChannels.map(channel => {
            const Icon = channelIcons[channel.type] || channelIcons[channel.key] || Phone

            return (
              <div
                key={channel._id}
                className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden"
              >
                <div className="h-1" style={{ backgroundColor: channel.theme }} />
                <div className="p-5">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-2">
                      <div
                        className="w-8 h-8 rounded-lg flex items-center justify-center"
                        style={{ backgroundColor: `${channel.theme}15`, color: channel.theme }}
                      >
                        <Icon className="w-4 h-4" />
                      </div>
                      <div>
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                          {channel.label}
                        </p>
                        <p className="text-sm font-bold text-slate-900">{channel.contactValue}</p>
                      </div>
                    </div>
                    <button
                      onClick={() => openChannelEdit(channel)}
                      className="p-1.5 text-amber-600 bg-amber-50/50 hover:bg-amber-600 hover:text-white rounded-md transition-all"
                    >
                      <Edit className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">
                    {channel.detail}
                  </p>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* Branches Tab */}
      {activeTab === 'branches' && (
        <div className="bg-white border border-slate-200 rounded-xl shadow-sm p-4">
          {loading && branches.length === 0 ? (
            <div className="py-20 text-center text-slate-300 animate-pulse font-bold text-xs uppercase tracking-widest">
              Loading branches...
            </div>
          ) : branches.length === 0 ? (
            <div className="py-20 text-center text-slate-400 font-bold text-xs uppercase tracking-widest border-2 border-dashed border-slate-100 rounded-xl">
              No branches configured yet.
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
              {branches.map(branch => (
                <div
                  key={branch._id}
                  className="group bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm hover:shadow-md hover:border-slate-300 transition-all flex flex-col"
                >
                  {/* Card cover */}
                  <div className="relative h-36 overflow-hidden bg-slate-50">
                    {branch.images?.length > 0 ? (
                      <img
                        src={getBranchImageUrl(branch.images[0])}
                        alt={branch.name}
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                      />
                    ) : (
                      <div
                        className="w-full h-full flex flex-col items-center justify-center gap-2"
                        style={{ background: `linear-gradient(135deg, ${branch.theme}18, ${branch.theme}08)` }}
                      >
                        <MapPin className="w-8 h-8" style={{ color: branch.theme }} />
                        <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">No gallery yet</span>
                      </div>
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />
                    <span
                      className="absolute top-3 left-3 px-2 py-0.5 rounded-md text-[9px] font-bold uppercase tracking-wider backdrop-blur-sm"
                      style={{ backgroundColor: `${branch.theme}e6`, color: '#fff' }}
                    >
                      {branch.badge}
                    </span>
                    <span
                      className={`absolute top-3 right-3 px-2 py-0.5 rounded-md text-[9px] font-bold uppercase tracking-wider backdrop-blur-sm ${
                        branch.isActive ? 'bg-green-500/90 text-white' : 'bg-rose-500/90 text-white'
                      }`}
                    >
                      {branch.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </div>

                  {/* Card body */}
                  <div className="p-4 flex flex-col flex-1">
                    <h3 className="text-sm font-bold text-slate-900 leading-tight mb-1">{branch.name}</h3>
                    <p className="text-[11px] text-slate-500 leading-relaxed line-clamp-2 mb-3 flex-1">
                      {branch.address}
                    </p>

                    <div className="flex flex-wrap gap-1.5 mb-4">
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-slate-50 border border-slate-100 text-[9px] font-bold text-slate-500 uppercase">
                        <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: branch.theme }} />
                        Theme
                      </span>
                      <span className="px-2 py-0.5 rounded-md bg-slate-50 border border-slate-100 text-[9px] font-bold text-slate-500 uppercase">
                        {branch.images?.length || 0} imgs
                      </span>
                      {branch.video && (
                        <span className="px-2 py-0.5 rounded-md bg-green-50 border border-green-100 text-[9px] font-bold text-green-600 uppercase">
                          Video
                        </span>
                      )}
                      <span className="px-2 py-0.5 rounded-md bg-slate-50 border border-slate-100 text-[9px] font-bold text-slate-500 uppercase">
                        Map {branch.mapPosition}
                      </span>
                    </div>

                    {branch.images?.length > 1 && (
                      <div className="flex gap-1.5 mb-4 overflow-hidden">
                        {branch.images.slice(1, 5).map((img, i) => (
                          <div key={i} className="w-8 h-8 rounded-md overflow-hidden border border-slate-100 shrink-0">
                            <img src={getBranchImageUrl(img)} alt="" className="w-full h-full object-cover" />
                          </div>
                        ))}
                        {branch.images.length > 5 && (
                          <div className="w-8 h-8 rounded-md bg-slate-100 flex items-center justify-center text-[9px] font-bold text-slate-400">
                            +{branch.images.length - 5}
                          </div>
                        )}
                      </div>
                    )}

                    <div className="flex items-center gap-1.5 pt-3 border-t border-slate-100">
                      <button
                        onClick={() => setPreviewBranch(branch)}
                        className="flex-1 inline-flex items-center justify-center gap-1.5 py-1.5 text-[10px] font-bold text-blue-600 bg-blue-50/60 hover:bg-blue-600 hover:text-white rounded-lg transition-all"
                      >
                        <Eye className="w-3 h-3" />
                        Preview
                      </button>
                      <button
                        onClick={() => openBranchEdit(branch)}
                        className="p-1.5 text-amber-600 bg-amber-50/60 hover:bg-amber-600 hover:text-white rounded-lg transition-all"
                      >
                        <Edit className="w-3.5 h-3.5" />
                      </button>
                      {branch.navUrl && (
                        <a
                          href={branch.navUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="p-1.5 text-slate-500 bg-slate-50 hover:bg-slate-900 hover:text-white rounded-lg transition-all"
                          title="Open navigation"
                        >
                          <ExternalLink className="w-3.5 h-3.5" />
                        </a>
                      )}
                      <button
                        onClick={() => setDeleteTarget(branch._id)}
                        className="p-1.5 text-rose-600 bg-rose-50/60 hover:bg-rose-600 hover:text-white rounded-lg transition-all"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Branch Form Modal */}
      <AnimatePresence>
        {isBranchFormOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-[2px]">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden border border-slate-200 flex flex-col"
            >
              <div className="px-5 py-3 border-b border-slate-100 flex items-center justify-between bg-white sticky top-0 z-10">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-slate-900 flex items-center justify-center text-white">
                    <Building2 className="w-4 h-4" />
                  </div>
                  <div>
                    <h2 className="text-sm font-bold text-slate-900 leading-tight">
                      {editingBranchId ? 'Edit Branch' : 'New Branch'}
                    </h2>
                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Location Details</p>
                  </div>
                </div>
                <button
                  onClick={() => { setIsBranchFormOpen(false); resetBranchForm() }}
                  className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-50 rounded-lg transition-all"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <form onSubmit={handleBranchSubmit} className="p-5 space-y-4 overflow-y-auto custom-scrollbar">
                <div className="grid sm:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className={`text-[10px] font-bold uppercase tracking-wider ${showValidation && !branchForm.name ? 'text-rose-500' : 'text-slate-400'}`}>
                      Branch Name *
                    </label>
                    <input
                      value={branchForm.name}
                      onChange={e => setBranchForm({ ...branchForm, name: e.target.value })}
                      placeholder="e.g. Hyderabad Operations"
                      className={`w-full bg-slate-50 border rounded-lg px-3 py-2 text-xs font-bold text-slate-900 outline-none ${showValidation && !branchForm.name ? 'border-rose-200' : 'border-slate-200 focus:border-brand'}`}
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Badge Label</label>
                    <input
                      value={branchForm.badge}
                      onChange={e => setBranchForm({ ...branchForm, badge: e.target.value })}
                      placeholder="e.g. Operational Node"
                      className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs font-bold text-slate-900 outline-none focus:border-brand"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className={`text-[10px] font-bold uppercase tracking-wider ${showValidation && !branchForm.address ? 'text-rose-500' : 'text-slate-400'}`}>
                    Full Address *
                  </label>
                  <textarea
                    value={branchForm.address}
                    onChange={e => setBranchForm({ ...branchForm, address: e.target.value })}
                    rows={3}
                    placeholder="Complete branch address..."
                    className={`w-full bg-slate-50 border rounded-lg px-3 py-2 text-xs font-bold text-slate-900 outline-none resize-none ${showValidation && !branchForm.address ? 'border-rose-200' : 'border-slate-200 focus:border-brand'}`}
                  />
                </div>

                <div className="space-y-1">
                  <label className={`text-[10px] font-bold uppercase tracking-wider ${showValidation && !branchForm.mapEmbed ? 'text-rose-500' : 'text-slate-400'}`}>
                    Google Maps Embed URL *
                  </label>
                  <input
                    value={branchForm.mapEmbed}
                    onChange={e => setBranchForm({ ...branchForm, mapEmbed: e.target.value })}
                    placeholder="https://www.google.com/maps/embed?pb=..."
                    className={`w-full bg-slate-50 border rounded-lg px-3 py-2 text-xs text-slate-900 outline-none ${showValidation && !branchForm.mapEmbed ? 'border-rose-200' : 'border-slate-200 focus:border-brand'}`}
                  />
                </div>

                <div className="space-y-1">
                  <label className={`text-[10px] font-bold uppercase tracking-wider ${showValidation && !branchForm.navUrl ? 'text-rose-500' : 'text-slate-400'}`}>
                    Navigation Link *
                  </label>
                  <input
                    value={branchForm.navUrl}
                    onChange={e => setBranchForm({ ...branchForm, navUrl: e.target.value })}
                    placeholder="https://maps.google.com/?q=lat,lng"
                    className={`w-full bg-slate-50 border rounded-lg px-3 py-2 text-xs text-slate-900 outline-none ${showValidation && !branchForm.navUrl ? 'border-rose-200' : 'border-slate-200 focus:border-brand'}`}
                  />
                </div>

                <div className="grid sm:grid-cols-3 gap-4">
                  {/* <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Theme Color</label>
                    <input
                      type="color"
                      value={branchForm.theme}
                      onChange={e => setBranchForm({ ...branchForm, theme: e.target.value })}
                      className="w-full h-9 rounded-lg border border-slate-200 cursor-pointer"
                    />
                  </div> */}
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Map Position</label>
                    <select
                      value={branchForm.mapPosition}
                      onChange={e => setBranchForm({ ...branchForm, mapPosition: e.target.value })}
                      className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs font-bold text-slate-900 outline-none"
                    >
                      <option value="left">Left</option>
                      <option value="right">Right</option>
                    </select>
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Sort Order</label>
                    <input
                      type="number"
                      min={1}
                      value={branchForm.sortOrder}
                      onChange={e => setBranchForm({ ...branchForm, sortOrder: Number(e.target.value) })}
                      className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs font-bold text-slate-900 outline-none"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Gallery Section Label</label>
                  <input
                    value={branchForm.galleryLabel}
                    onChange={e => setBranchForm({ ...branchForm, galleryLabel: e.target.value })}
                    placeholder="e.g. Infrastructure Gallery"
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs font-bold text-slate-900 outline-none focus:border-brand"
                  />
                </div>

                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="isActive"
                    checked={branchForm.isActive}
                    onChange={e => setBranchForm({ ...branchForm, isActive: e.target.checked })}
                    className="rounded border-slate-300"
                  />
                  <label htmlFor="isActive" className="text-xs font-bold text-slate-600">Show on website</label>
                </div>

                {/* Gallery Images */}
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                    <ImageIcon className="w-3 h-3" />
                    Gallery Images
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {allImagePreviews.map((img, i) => (
                      <div key={i} className="relative w-16 h-16 rounded-lg overflow-hidden border border-slate-100 group/img">
                        <img src={img} alt="" className="w-full h-full object-cover" />
                        <button
                          type="button"
                          onClick={() => removeBranchImage(i)}
                          className="absolute inset-0 bg-rose-500/80 text-white opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                    <label className="w-16 h-16 border-2 border-dashed border-slate-200 rounded-lg flex flex-col items-center justify-center cursor-pointer hover:border-brand/40 hover:bg-slate-50 transition-all">
                      <Upload className="w-4 h-4 text-slate-300" />
                      <span className="text-[8px] font-bold text-slate-400 mt-0.5">Add</span>
                      <input type="file" accept="image/*" multiple className="hidden" onChange={onBranchImagesChange} />
                    </label>
                  </div>
                </div>

                {/* Video */}
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                    <Video className="w-3 h-3" />
                    Branch Video (optional)
                  </label>
                  {videoPreview ? (
                    <div className="relative rounded-lg overflow-hidden border border-slate-100 h-32">
                      <video src={videoPreview} className="w-full h-full object-cover" controls muted />
                      <button
                        type="button"
                        onClick={() => { setBranchVideo(null); setVideoPreview(null); setRemoveVideo(true) }}
                        className="absolute top-2 right-2 p-1 bg-rose-500 text-white rounded-md"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ) : (
                    <label className="block h-20 border-2 border-dashed border-slate-200 rounded-lg cursor-pointer hover:bg-slate-50 transition-all">
                      <input type="file" accept="video/*" className="hidden" onChange={onBranchVideoChange} />
                      <div className="flex flex-col items-center justify-center h-full text-slate-300">
                        <Video className="w-5 h-5" />
                        <span className="text-[9px] font-bold uppercase mt-1">Upload Video</span>
                      </div>
                    </label>
                  )}
                </div>

                <div className="flex items-center justify-end gap-3 pt-2 sticky bottom-0 bg-white">
                  <button
                    type="button"
                    onClick={() => { setIsBranchFormOpen(false); resetBranchForm() }}
                    className="px-4 py-1.5 text-xs font-bold text-slate-500 hover:bg-slate-100 rounded-lg"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={submitting}
                    className="px-5 py-1.5 text-xs font-bold text-white bg-slate-900 rounded-lg hover:bg-slate-800 shadow-sm disabled:opacity-50"
                  >
                    {submitting ? 'Saving...' : editingBranchId ? 'Update Branch' : 'Add Branch'}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Contact Channel Edit Modal */}
      <AnimatePresence>
        {editingChannel && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-[2px]">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-xl shadow-2xl w-full max-w-md max-h-[90vh] overflow-hidden border border-slate-200 flex flex-col"
            >
              <div className="px-5 py-3 border-b border-slate-100 flex items-center justify-between bg-white sticky top-0 z-10">
                <div className="flex items-center gap-3">
                  <div
                    className="w-8 h-8 rounded-lg flex items-center justify-center text-white"
                    style={{ backgroundColor: channelForm.theme || '#0072bc' }}
                  >
                    {channelForm.type === 'email' ? <Mail className="w-4 h-4" /> : <Phone className="w-4 h-4" />}
                  </div>
                  <div>
                    <h2 className="admin-modal-title">Edit Contact Channel</h2>
                    <p className="admin-page-subtitle">Website contact card</p>
                  </div>
                </div>
                <button
                  onClick={closeChannelEdit}
                  className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-50 rounded-lg transition-all"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <form onSubmit={saveChannelEdit} className="p-5 space-y-4 overflow-y-auto">
                <div className="space-y-1">
                  <label className="admin-label">Label *</label>
                  <input
                    value={channelForm.label || ''}
                    onChange={e => setChannelForm({ ...channelForm, label: e.target.value })}
                    placeholder="e.g. Sales Operations"
                    className="admin-input-form w-full"
                    required
                  />
                </div>
                <div className="space-y-1">
                  <label className="admin-label">Contact Value *</label>
                  <input
                    value={channelForm.contactValue || ''}
                    onChange={e => setChannelForm({ ...channelForm, contactValue: e.target.value })}
                    placeholder="e.g. +91 90300 64466"
                    className="admin-input-form w-full"
                    required
                  />
                </div>
                <div className="space-y-1">
                  <label className="admin-label">Detail</label>
                  <input
                    value={channelForm.detail || ''}
                    onChange={e => setChannelForm({ ...channelForm, detail: e.target.value })}
                    placeholder="e.g. Enterprise & Industrial"
                    className="admin-input-form w-full"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="admin-label">Type</label>
                    <select
                      value={channelForm.type || 'phone'}
                      onChange={e => setChannelForm({ ...channelForm, type: e.target.value })}
                      className="admin-input-form w-full"
                    >
                      <option value="phone">Phone</option>
                      <option value="email">Email</option>
                    </select>
                  </div>
                  <div className="space-y-1">
                    <label className="admin-label">Theme Color</label>
                    <input
                      type="color"
                      value={channelForm.theme || '#0072bc'}
                      onChange={e => setChannelForm({ ...channelForm, theme: e.target.value })}
                      className="w-full h-9 rounded-lg border border-slate-200 cursor-pointer"
                    />
                  </div>
                </div>
                <div className="space-y-1">
                  <label className="admin-label">Link (href)</label>
                  <input
                    value={channelForm.href || ''}
                    onChange={e => setChannelForm({ ...channelForm, href: e.target.value })}
                    placeholder="tel:+919030064466 or mailto:..."
                    className="admin-input-form w-full"
                  />
                </div>
                <div className="flex items-center justify-end gap-3 pt-2">
                  <button type="button" onClick={closeChannelEdit} className="admin-btn-secondary">
                    Cancel
                  </button>
                  <button type="submit" disabled={channelSubmitting} className="admin-btn-primary disabled:opacity-60">
                    {channelSubmitting ? 'Saving...' : 'Update Channel'}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Preview Modal */}
      <AnimatePresence>
        {previewBranch && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-[2px]">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-xl shadow-2xl w-full max-w-lg overflow-hidden border border-slate-200"
            >
              <div className="px-5 py-3 border-b border-slate-100 flex items-center justify-between">
                <h3 className="text-sm font-bold text-slate-900">Website Preview</h3>
                <button onClick={() => setPreviewBranch(null)} className="p-1.5 text-slate-400 hover:bg-slate-50 rounded-lg">
                  <X className="w-4 h-4" />
                </button>
              </div>
              <div className="p-5">
                <span
                  className="inline-block px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider mb-2"
                  style={{ backgroundColor: `${previewBranch.theme}15`, color: previewBranch.theme }}
                >
                  {previewBranch.badge}
                </span>
                <h4 className="text-lg font-bold text-slate-900 mb-2">
                  {previewBranch.name}
                  <span style={{ color: previewBranch.theme }}>.</span>
                </h4>
                <p className="text-sm text-slate-500 mb-4">{previewBranch.address}</p>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">
                  {previewBranch.galleryLabel}
                </p>
                <div className="flex gap-2 mb-4">
                  {(previewBranch.images || []).slice(0, 5).map((img, i) => (
                    <div key={i} className="w-12 h-12 rounded-xl overflow-hidden border-2 border-white shadow-md">
                      <img src={getImageUrl(img)} alt="" className="w-full h-full object-cover" />
                    </div>
                  ))}
                  {previewBranch.video && (
                    <div className="w-12 h-12 rounded-xl bg-green-50 flex items-center justify-center">
                      <Video className="w-5 h-5 text-green-600" />
                    </div>
                  )}
                </div>
                <a
                  href={previewBranch.navUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-2 px-6 py-2.5 text-white text-[11px] font-bold uppercase tracking-widest rounded-xl"
                  style={{ backgroundColor: previewBranch.theme }}
                >
                  Launch Navigation
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  )
}

export default Branches
