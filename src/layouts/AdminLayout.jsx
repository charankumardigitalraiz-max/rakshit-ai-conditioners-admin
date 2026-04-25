import React from 'react'
import { Outlet, Link, useLocation } from 'react-router-dom'
import { LayoutDashboard, Package, Briefcase, Award, LogOut, MessageSquare, Mail, Users, Quote, ChevronRight } from 'lucide-react'
import { useSelector, useDispatch } from 'react-redux'
import { useNavigate } from 'react-router-dom'
import { logout } from '../store/slices/authSlice'
import { motion, AnimatePresence } from 'framer-motion'

const AdminLayout = () => {
  const { user } = useSelector((state) => state.auth)
  const location = useLocation()
  const dispatch = useDispatch()
  const navigate = useNavigate()

  const [showLogoutModal, setShowLogoutModal] = React.useState(false)

  const onLogout = () => {
    dispatch(logout())
    navigate('/login')
  }

  const navItems = [
    { path: '/', label: 'Dashboard', icon: LayoutDashboard },
    { divider: true },
    { path: '/products', label: 'Products', icon: Package },
    { path: '/Category', label: 'Categories', icon: Package },
    { path: '/projects', label: 'Projects', icon: Briefcase },
    { divider: true },
    { path: '/clients', label: 'Clients', icon: Users },
    { path: '/testimonials', label: 'Testimonials', icon: Quote },
    { path: '/achievements', label: 'Achievements', icon: Award },
    { divider: true },
    { path: '/enquiries', label: 'Leads', icon: MessageSquare },
    { path: '/contacts', label: 'Messages', icon: Mail },
  ]

  return (
    <div className="min-h-screen bg-surface flex">
      {/* Logout Modal */}
      <AnimatePresence>
        {showLogoutModal && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-[2px]">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-xl shadow-2xl w-full max-w-xs overflow-hidden border border-slate-200"
            >
              <div className="p-5 text-center">
                <div className="w-12 h-12 bg-rose-50 rounded-full flex items-center justify-center text-rose-500 mx-auto mb-3">
                  <LogOut className="w-6 h-6" />
                </div>
                <h3 className="text-sm font-bold text-slate-900 mb-1">Confirm Logout</h3>
                <p className="text-slate-500 text-xs leading-relaxed">
                  Are you sure you want to exit?
                </p>
              </div>
              <div className="flex border-t border-slate-100 p-3 gap-2 bg-slate-50/50">
                <button
                  onClick={() => setShowLogoutModal(false)}
                  className="flex-1 px-3 py-2 text-xs font-bold text-slate-600 hover:bg-white rounded-lg transition-all border border-slate-200"
                >
                  Cancel
                </button>
                <button
                  onClick={onLogout}
                  className="flex-1 px-3 py-2 text-xs font-bold text-white bg-rose-500 hover:bg-rose-600 rounded-lg transition-all shadow-sm"
                >
                  Logout
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Sidebar */}
      <aside className="w-60 bg-white border-r border-slate-200 flex flex-col fixed h-full z-30">
        <div className="h-16 flex items-center px-5 border-b border-slate-100 bg-white">
          <Link to="/" className="flex items-center">
            <img
              src="/Rakshith logo web png.png"
              alt="Rakshith Air Conditioners"
              className="h-10 w-auto object-contain"
            />
          </Link>
        </div>

        <div className="flex-1 overflow-y-auto py-3 px-3">
          <nav className="space-y-0.5">
            {navItems.map((item, idx) => {
              if (item.divider) return <div key={`div-${idx}`} className="h-px bg-slate-100 my-3 mx-2" />

              const isActive = location.pathname === item.path || (item.path !== '/' && location.pathname.startsWith(item.path))
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`flex items-center justify-between group px-3 py-2 rounded-md text-[13px] font-medium transition-all ${isActive
                    ? 'bg-brand text-white shadow-sm'
                    : 'text-slate-500 hover:bg-blue-50 hover:text-brand'
                    }`}
                >
                  <div className="flex items-center gap-3">
                    <item.icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-slate-400 group-hover:text-brand'}`} />
                    <span>{item.label}</span>
                  </div>
                  {isActive && <ChevronRight className="w-3 h-3 opacity-50" />}
                </Link>
              )
            })}
          </nav>
        </div>

        <div className="p-3 border-t border-slate-100 bg-slate-50/50">
          <button
            onClick={() => setShowLogoutModal(true)}
            className="flex items-center gap-3 px-3 py-2 w-full rounded-md text-[13px] font-medium text-slate-500 hover:bg-rose-50 hover:text-rose-600 transition-all group"
          >
            <LogOut className="w-4 h-4 text-slate-400 group-hover:text-rose-600 transition-colors" />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 ml-60 flex flex-col min-h-screen">
        <header className="h-14 bg-white/80 backdrop-blur-md border-b border-slate-200 flex items-center justify-between px-6 sticky top-0 z-20">
          <div className="flex items-center gap-2 text-xs font-medium text-slate-400">
            <span>Rakshith Air Condition</span>
            <ChevronRight className="w-3 h-3" />
            <span className="text-slate-900 capitalize">{location.pathname.split('/').filter(Boolean)[0] || 'Dashboard'}</span>
          </div>

          <div className="flex items-center gap-4">
            <Link to="/profile" className="flex items-center gap-3 pl-4 border-l border-slate-100 hover:opacity-80 transition-all cursor-pointer group">
              <div className="text-right hidden sm:block">
                <div className="text-[12px] font-bold text-slate-900 leading-none mb-0.5 group-hover:text-brand transition-colors">
                  {user?.name || 'Administrator'}
                </div>
                <div className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider">
                  {user?.role || 'Superuser'}
                </div>
              </div>
              <div className="w-8 h-8 rounded-lg bg-brand flex items-center justify-center text-white font-bold text-xs shadow-sm group-hover:shadow transition-all">
                {user?.name ? user.name.charAt(0).toUpperCase() : 'A'}
              </div>
            </Link>
          </div>
        </header>

        <main className="flex-1 p-5 lg:p-6 max-w-7xl">
          <Outlet />
        </main>
      </div>
    </div>
  )
}

export default AdminLayout
