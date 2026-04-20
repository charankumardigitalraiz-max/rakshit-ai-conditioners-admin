import React, { useState, useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useNavigate } from 'react-router-dom'
import { login, reset } from '../store/slices/authSlice'
import { LogIn, Mail, Lock, Loader2, AlertCircle } from 'lucide-react'
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
    <div className="min-h-screen w-full flex items-center justify-center bg-slate-50 relative overflow-hidden">
      {/* Decorative Background Elements */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-brand/5 rounded-full blur-3xl animate-pulse"></div>
      <div className="absolute bottom-[-15%] right-[-10%] w-[50%] h-[50%] bg-brand/10 rounded-full blur-3xl"></div>

      <div className="w-full max-w-md px-6 relative z-10">
        {/* Logo / Branding */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-white rounded-2xl shadow-xl shadow-brand/10 border border-slate-100 mb-6 p-4">
            <img src="/logo.png" alt="Rakshith Air Conditioners" className="w-full h-full object-contain" />
          </div>
          <h1 className="text-3xl font-bold text-slate-900 tracking-tight mb-2">Admin Portal</h1>
          <p className="text-slate-500 font-medium tracking-wide">Enter your credentials to manage resources</p>
        </div>

        {/* Login Card */}
        <div className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-2xl shadow-slate-200/50 border border-white p-8 md:p-10 transition-all duration-500 hover:shadow-brand/5">
          {isError && (
            <div className="mb-6 flex items-center gap-3 bg-rose-50 text-rose-600 px-4 py-3 rounded-xl border border-rose-100 animate-in fade-in slide-in-from-top-4">
              <AlertCircle className="w-5 h-5 flex-shrink-0" />
              <p className="text-sm font-semibold">{message || 'Invalid credentials. Please try again.'}</p>
            </div>
          )}

          <form onSubmit={onSubmit} className="space-y-6">
            <div className="space-y-2">
              <label htmlFor="email" className="text-xs font-bold text-slate-500 uppercase tracking-widest ml-1">
                Email Address
              </label>
              <div className="relative group">
                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-brand transition-colors">
                  <Mail className="w-5 h-5" />
                </div>
                <input
                  type="email"
                  id="email"
                  value={email}
                  onChange={onChange}
                  required
                  placeholder="admin@rakshithac.com"
                  className="w-full bg-slate-50 border-2 border-transparent focus:bg-white focus:border-brand focus:ring-4 focus:ring-brand/10 rounded-2xl pl-12 pr-4 py-4 text-slate-700 font-medium transition-all outline-none"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label htmlFor="password" className="text-xs font-bold text-slate-500 uppercase tracking-widest ml-1">
                Password
              </label>
              <div className="relative group">
                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-brand transition-colors">
                  <Lock className="w-5 h-5" />
                </div>
                <input
                  type="password"
                  id="password"
                  value={password}
                  onChange={onChange}
                  required
                  placeholder="••••••••"
                  className="w-full bg-slate-50 border-2 border-transparent focus:bg-white focus:border-brand focus:ring-4 focus:ring-brand/10 rounded-2xl pl-12 pr-4 py-4 text-slate-700 font-medium transition-all outline-none"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-brand hover:bg-brand-hover text-white font-bold py-4 rounded-2xl shadow-lg shadow-brand/30 hover:shadow-brand/50 transition-all active:scale-[0.98] disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2 text-lg mt-4"
            >
              {isLoading ? (
                <Loader2 className="w-6 h-6 animate-spin" />
              ) : (
                <>
                  <LogIn className="w-6 h-6" />
                  Sign In
                </>
              )}
            </button>
          </form>
        </div>

        {/* Footer */}
        <p className="text-center text-slate-400 text-sm mt-8 font-medium">
          &copy; {new Date().getFullYear()} Rakshith Air Conditioners Admin Hub
        </p>
      </div>
    </div>
  )
}

export default Login
