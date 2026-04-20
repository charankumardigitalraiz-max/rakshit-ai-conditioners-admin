import React, { useState, useEffect } from 'react'
import { User, Mail, Shield, Camera, Save, Lock, Loader2 } from 'lucide-react'
import { useDispatch, useSelector } from 'react-redux'
import { getMe, updateUserDetails, updateUserPassword } from '../store/slices/authSlice'
import { toast } from 'react-hot-toast'
import { getImageUrl } from '../utils/imageHandler'

const Profile = () => {
  const dispatch = useDispatch()
  const { user, isLoading } = useSelector((state) => state.auth)
  const fileInputRef = React.useRef(null)

  const [formData, setFormData] = useState({
    name: '',
    email: '',
  })

  const [passwords, setPasswords] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  })

  useEffect(() => {
    dispatch(getMe())
  }, [dispatch])

  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name || '',
        email: user.email || '',
      })
    }
  }, [user])

  const handleAvatarClick = () => {
    fileInputRef.current?.click()
  }

  const handleFileChange = async (e) => {
    const file = e.target.files?.[0]
    if (file) {
      const data = new FormData()
      data.append('avatar', file)
      try {
        await dispatch(updateUserDetails(data)).unwrap()
        toast.success('Avatar updated successfully!')
      } catch (err) {
        toast.error(err || 'Failed to update avatar')
      }
    }
  }

  const handleProfileSubmit = async (e) => {
    e.preventDefault()
    try {
      await dispatch(updateUserDetails(formData)).unwrap()
      toast.success('Profile details updated!')
    } catch (err) {
      toast.error(err || 'Failed to update profile')
    }
  }

  const handlePasswordSubmit = async (e) => {
    e.preventDefault()
    if (passwords.newPassword !== passwords.confirmPassword) {
      return toast.error('Passwords do not match')
    }
    try {
      await dispatch(updateUserPassword({
        currentPassword: passwords.currentPassword,
        newPassword: passwords.newPassword
      })).unwrap()
      toast.success('Password changed successfully!')
      setPasswords({ currentPassword: '', newPassword: '', confirmPassword: '' })
    } catch (err) {
      toast.error(err || 'Failed to change password')
    }
  }

  if (isLoading && !user) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 text-brand animate-spin" />
      </div>
    )
  }

  const profile = {
    name: user?.name || 'Admin User',
    email: user?.email || 'admin@rakshitac.com',
    role: user?.role === 'super-admin' ? 'Super Admin' : 'Administrator',
    phone: '+91 98765 43210',
    address: 'Bangalore, India'
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-12">
      <div>
        <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Admin Profile</h1>
        <p className="text-sm text-slate-500 mt-1.5">Manage your account settings, security preferences, and administrative identity.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column - Profile Card */}
        <div className="space-y-6">
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-8 flex flex-col items-center text-center relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-brand to-blue-400"></div>
            <div className="relative mb-6">
              <input
                type="file"
                ref={fileInputRef}
                className="hidden"
                accept="image/*"
                onChange={handleFileChange}
              />
              <div className="w-28 h-28 rounded-full bg-slate-50 border-4 border-white shadow-xl flex items-center justify-center text-brand font-black text-4xl uppercase overflow-hidden ring-1 ring-slate-100">
                {user?.avatar ? (
                  <img src={getImageUrl(user.avatar)} alt="" className="w-full h-full object-cover" />
                ) : (
                  profile.name.charAt(0)
                )}
              </div>
              <button
                onClick={handleAvatarClick}
                disabled={isLoading}
                title="Change Avatar"
                className="absolute bottom-0 right-0 p-2 bg-brand text-white border-2 border-white rounded-full shadow-lg hover:bg-brand-hover hover:scale-110 transition-all disabled:opacity-50"
              >
                <Camera className="w-4 h-4" />
              </button>
            </div>
            <h2 className="text-xl font-bold text-slate-900 tracking-tight">{profile.name}</h2>
            <p className="text-xs font-bold text-brand uppercase tracking-widest mt-1">{profile.role}</p>

            <div className="mt-8 w-full space-y-3">
              <div className="flex items-center gap-3 text-sm font-medium text-slate-600 bg-slate-50 px-4 py-3 rounded-xl border border-slate-100">
                <Mail className="w-4 h-4 text-slate-400" />
                <span className="truncate">{profile.email}</span>
              </div>
              <div className="flex items-center gap-3 text-sm font-medium text-slate-600 bg-slate-50 px-4 py-3 rounded-xl border border-slate-100">
                <Shield className="w-4 h-4 text-slate-400" />
                {profile.role}
              </div>
            </div>
          </div>
        </div>

        {/* Right Column - Edit Form */}
        <div className="lg:col-span-2 space-y-8">
          <form onSubmit={handleProfileSubmit} className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-200 bg-slate-50/50">
              <h3 className="text-xs font-black text-slate-900 uppercase tracking-[0.2em]">Account Details</h3>
            </div>
            <div className="p-8 space-y-5">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div className="space-y-2">
                  <label className="text-[11px] font-black text-slate-500 uppercase tracking-wider ml-1">Full Name</label>
                  <div className="relative">
                    <User className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input
                      type="text"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="w-full bg-slate-50/50 border border-slate-200 focus:border-brand focus:ring-4 focus:ring-brand/5 rounded-xl pl-11 pr-4 py-3 text-sm font-medium text-slate-700 outline-none transition-all placeholder:text-slate-400"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-[11px] font-black text-slate-500 uppercase tracking-wider ml-1">Email Address</label>
                  <div className="relative">
                    <Mail className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      className="w-full bg-slate-50/50 border border-slate-200 focus:border-brand focus:ring-4 focus:ring-brand/5 rounded-xl pl-11 pr-4 py-3 text-sm font-medium text-slate-700 outline-none transition-all placeholder:text-slate-400"
                    />
                  </div>
                </div>
              </div>

              <div className="pt-4 flex justify-end">
                <button
                  type="submit"
                  disabled={isLoading}
                  className="inline-flex items-center gap-2 bg-brand hover:bg-brand-hover text-white px-8 py-3 rounded-xl text-sm font-bold transition-all shadow-lg shadow-brand/20 active:scale-[0.98] disabled:opacity-50"
                >
                  <Save className="w-4 h-4" />
                  {isLoading ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </div>
          </form>

          <form onSubmit={handlePasswordSubmit} className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-200 bg-slate-50/50">
              <h3 className="text-xs font-black text-slate-900 uppercase tracking-[0.2em]">Security & Privacy</h3>
            </div>
            <div className="p-8 space-y-5">
              <div className="grid grid-cols-1 gap-5">
                <div className="space-y-2">
                  <label className="text-[11px] font-black text-slate-500 uppercase tracking-wider ml-1">Current Password</label>
                  <div className="relative">
                    <Lock className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input
                      type="password"
                      value={passwords.currentPassword}
                      onChange={(e) => setPasswords({ ...passwords, currentPassword: e.target.value })}
                      required
                      className="w-full bg-slate-50/50 border border-slate-200 focus:border-brand focus:ring-4 focus:ring-brand/5 rounded-xl pl-11 pr-4 py-3 text-sm font-medium outline-none transition-all"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <div className="space-y-2">
                    <label className="text-[11px] font-black text-slate-500 uppercase tracking-wider ml-1">New Password</label>
                    <input
                      type="password"
                      value={passwords.newPassword}
                      onChange={(e) => setPasswords({ ...passwords, newPassword: e.target.value })}
                      required
                      className="w-full bg-slate-50/50 border border-slate-200 focus:border-brand focus:ring-4 focus:ring-brand/5 rounded-xl px-4 py-3 text-sm font-medium outline-none transition-all"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[11px] font-black text-slate-500 uppercase tracking-wider ml-1">Confirm New Password</label>
                    <input
                      type="password"
                      value={passwords.confirmPassword}
                      onChange={(e) => setPasswords({ ...passwords, confirmPassword: e.target.value })}
                      required
                      className="w-full bg-slate-50/50 border border-slate-200 focus:border-brand focus:ring-4 focus:ring-brand/5 rounded-xl px-4 py-3 text-sm font-medium outline-none transition-all"
                    />
                  </div>
                </div>
              </div>
              <div className="pt-4 flex justify-end">
                <button
                  type="submit"
                  disabled={isLoading}
                  className="inline-flex items-center gap-2 bg-slate-900 hover:bg-slate-800 text-white px-8 py-3 rounded-xl text-sm font-bold transition-all shadow-lg shadow-slate-200 active:scale-[0.98] disabled:opacity-50"
                >
                  <Lock className="w-4 h-4" />
                  {isLoading ? 'Updating...' : 'Update Password'}
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>

  )
}

export default Profile
