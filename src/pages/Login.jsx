import React, { useState, useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useNavigate } from 'react-router-dom'
import { login, reset } from '../store/slices/authSlice'
import { LogIn, Mail, Lock, Loader2, AlertCircle, Shield, Globe, Activity } from 'lucide-react'
import { toast } from 'react-hot-toast'

const Login = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  })

  const { email, password } = formData

  const dispatch = useDispatch()
  const navigate = useNavigate()

  const { user, isLoading, isError, isSuccess, message } = useSelector(
    (state) => state.auth
  )

  useEffect(() => {
    if (isError) {
      toast.error(message || 'Login failed')
    }

    if (isSuccess || user) {
      if (isSuccess) toast.success('Welcome back!')
      navigate('/')
    }

    dispatch(reset())
  }, [user, isError, isSuccess, message, navigate, dispatch])

  const onChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.id]: e.target.value,
    }))
  }

  const onSubmit = (e) => {
    e.preventDefault()
    const userData = { email, password }
    dispatch(login(userData))
  }

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-[#f8fafc] p-4 relative overflow-hidden">
      {/* Subtle Background Accent */}
      <div className="absolute top-0 right-0 w-full h-full opacity-[0.05] pointer-events-none">
        <svg width="100%" height="100%" viewBox="0 0 100 100" preserveAspectRatio="none">
          <circle cx="100" cy="0" r="40" fill="#0072bc" />
        </svg>
      </div>

      <div className="w-full max-w-[820px] flex flex-col md:flex-row bg-white rounded-[2rem] overflow-hidden shadow-[0_30px_60px_rgba(0,0,0,0.06)] border border-slate-100 z-10">
        
        {/* ── LEFT PANEL: BRANDING ── */}
        <div className="w-full md:w-[35%] bg-[#0072bc] p-8 md:p-10 flex flex-col justify-between relative overflow-hidden">
          <div className="relative z-10">
            <div className="w-14 h-14 bg-white rounded-xl p-2.5 shadow-lg mb-8 flex items-center justify-center">
              <img src="/logo.png" alt="Rakshith" className="w-full h-full object-contain" />
            </div>
            <h2 className="text-2xl font-bold text-white tracking-tight leading-tight">
              Rakshith <br />
              <span className="text-blue-200">Admin</span>
            </h2>
            <p className="text-blue-100/60 text-xs mt-4 font-medium leading-relaxed">
              Daikin Certified HVAC Network.
            </p>
          </div>

          <div className="relative z-10 space-y-5 mt-10">
            <div className="flex items-center gap-3 text-blue-100/50">
              <Shield className="w-4 h-4" />
              <span className="text-[9px] font-bold uppercase tracking-widest">Secure Access</span>
            </div>
            <div className="flex items-center gap-3 text-blue-100/50">
              <Globe className="w-4 h-4" />
              <span className="text-[9px] font-bold uppercase tracking-widest">v2.4 Core</span>
            </div>
            <div className="flex items-center gap-3 text-blue-100/50">
              <Activity className="w-4 h-4" />
              <span className="text-[9px] font-bold uppercase tracking-widest">Online</span>
            </div>
          </div>
        </div>

        {/* ── RIGHT PANEL: FORM ── */}
        <div className="w-full md:w-[65%] p-8 md:p-12 bg-white flex flex-col justify-center">
          <div className="mb-8">
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Admin Sign-in</h1>
            <p className="text-slate-400 text-xs mt-2 font-medium">Please enter your credentials to proceed.</p>
          </div>

          {isError && (
            <div className="mb-6 flex items-center gap-3 bg-rose-50 text-rose-600 px-4 py-3 rounded-xl border border-rose-100">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <p className="text-[12px] font-bold">{message || 'Login failed.'}</p>
            </div>
          )}

          <form onSubmit={onSubmit} className="space-y-6">
            <div className="space-y-1.5">
              <label htmlFor="email" className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">
                Email
              </label>
              <div className="relative group">
                <div className="absolute left-0 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-[#0072bc] transition-colors">
                  <Mail className="w-[18px] h-[18px]" />
                </div>
                <input
                  type="email"
                  id="email"
                  value={email}
                  onChange={onChange}
                  required
                  placeholder="admin@rakshithac.com"
                  className="w-full bg-transparent border-b border-slate-100 focus:border-[#0072bc] py-3 pl-8 text-slate-900 text-sm font-semibold transition-all outline-none"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label htmlFor="password" className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">
                Key
              </label>
              <div className="relative group">
                <div className="absolute left-0 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-[#0072bc] transition-colors">
                  <Lock className="w-[18px] h-[18px]" />
                </div>
                <input
                  type="password"
                  id="password"
                  value={password}
                  onChange={onChange}
                  required
                  placeholder="••••••••"
                  className="w-full bg-transparent border-b border-slate-100 focus:border-[#0072bc] py-3 pl-8 text-slate-900 text-sm font-semibold transition-all outline-none"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-[#0072bc] hover:bg-[#005fa3] text-white font-bold py-4 rounded-xl shadow-lg shadow-blue-50 transition-all active:scale-[0.98] disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2 mt-6 group"
            >
              {isLoading ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <>
                  <span className="text-[14px]">Access Dashboard</span>
                  <LogIn className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                </>
              )}
            </button>
          </form>

          <div className="mt-10 pt-6 border-t border-slate-50 text-center md:text-left">
            <p className="text-slate-300 text-[9px] font-bold uppercase tracking-widest">
              &copy; {new Date().getFullYear()} Rakshith Admin Hub
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Login







