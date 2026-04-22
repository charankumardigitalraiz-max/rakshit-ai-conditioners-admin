import React from 'react'
import { Outlet, Link, useLocation } from 'react-router-dom'
import { LayoutDashboard, Package, Briefcase, Award, Settings, LogOut, Search, Bell, MessageSquare, Mail } from 'lucide-react'
import { useSelector, useDispatch } from 'react-redux'
import { useNavigate } from 'react-router-dom'
import { logout } from '../store/slices/authSlice'

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
    { path: '/products', label: 'Products', icon: Package },
    { path: '/projects', label: 'Projects', icon: Briefcase },
    { path: '/achievements', label: 'Achievements', icon: Award },
    { path: '/enquiries', label: 'Enquiries', icon: MessageSquare },
    // { path: '/contacts', label: 'Contact Messages', icon: Mail },
  ]

  return (
    <div className="min-h-screen bg-slate-50 flex">
      {/* Logout Confirmation Modal */}
      {showLogoutModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm overflow-hidden animate-in zoom-in duration-200 border border-slate-200">
            <div className="p-8 text-center">
              <div className="w-16 h-16 bg-rose-50 rounded-full flex items-center justify-center text-rose-500 mx-auto mb-4 border border-rose-100">
                <LogOut className="w-8 h-8" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-2">Confirm Logout</h3>
              <p className="text-slate-500 text-sm leading-relaxed">
                Are you sure you want to log out? You will need to sign in again to access the admin panel.
              </p>
            </div>
            <div className="flex border-t border-slate-100 bg-slate-50/50 p-4 gap-3">
              <button
                onClick={() => setShowLogoutModal(false)}
                className="flex-1 px-4 py-2.5 text-sm font-bold text-slate-600 hover:bg-white rounded-xl transition-all border border-transparent hover:border-slate-200"
              >
                Cancel
              </button>
              <button
                onClick={onLogout}
                className="flex-1 px-4 py-2.5 text-sm font-bold text-white bg-rose-500 hover:bg-rose-600 rounded-xl transition-all shadow-lg shadow-rose-200 hover:shadow-rose-300"
              >
                Yes, Logout
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Sidebar */}
      <aside className="w-64 bg-white border-r border-slate-200 flex flex-col fixed h-full z-10">
        <div className="h-16 flex items-center px-6 border-b border-slate-200">
          <div className="text-brand font-bold text-xl tracking-tight flex items-center gap-2">
            {/* <img src="/logo.png" alt="Logo" className="h-8 w-auto object-contain" /> */}
            Admin Hub
          </div>
        </div>

        <div className="flex-1 overflow-y-auto py-4 px-3 space-y-1">
          {navItems.map((item) => {
            const isActive = location.pathname === item.path || (item.path !== '/' && location.pathname.startsWith(item.path))
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${isActive
                  ? 'bg-blue-50 text-brand'
                  : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                  }`}
              >
                <item.icon className={`w-5 h-5 ${isActive ? 'text-brand' : 'text-slate-400'}`} />
                {item.label}
              </Link>
            )
          })}
        </div>

        <div className="p-4 border-t border-slate-200">
          <button
            onClick={() => setShowLogoutModal(true)}
            className="flex items-center gap-3 px-3 py-2 w-full rounded-lg text-sm font-medium text-slate-600 hover:bg-rose-50 hover:text-rose-600 transition-colors group"
          >
            <LogOut className="w-5 h-5 text-slate-400 group-hover:text-rose-600 transition-colors" />
            Logout
          </button>
        </div>
      </aside>

      {/* Main Content Wrapper */}
      <div className="flex-1 ml-64 flex flex-col min-h-screen">
        {/* Header */}
        <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-end px-8 sticky top-0 z-10">
          {/* <div className="flex-1 max-w-xl">
            <div className="relative">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Search resources..."
                className="w-full bg-slate-50 border-transparent focus:bg-white focus:border-brand focus:ring-2 focus:ring-brand/20 rounded-lg pl-10 pr-4 py-2 text-sm text-slate-700 transition-all outline-none"
              />
            </div>
          </div> */}

          <div className="flex items-center gap-4">
            {/* <button className="relative p-2 text-slate-400 hover:text-slate-600 transition-colors rounded-full hover:bg-slate-100">
              <Bell className="w-5 h-5" />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-rose-500 rounded-full border-2 border-white"></span>
            </button> */}
            <div className="h-8 w-px bg-slate-200 mx-2"></div>
            <Link to="/profile" className="flex items-center gap-3 cursor-pointer group">
              <div className="text-right hidden md:block">
                <div className="text-sm font-semibold text-slate-900 leading-tight group-hover:text-brand transition-colors">
                  {user?.name || 'Admin User'}
                </div>
                <div className="text-xs text-slate-500 font-medium capitalize">
                  {user?.role || 'Super Admin'}
                </div>
              </div>
              <div className="w-9 h-9 rounded-full bg-brand/10 border border-brand/20 flex items-center justify-center text-brand font-bold text-sm group-hover:bg-brand group-hover:text-white transition-all">
                {user?.name ? user.name.charAt(0).toUpperCase() : 'A'}
              </div>
            </Link>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 p-8">
          <Outlet />
        </main>
      </div>
    </div>
  )
}

export default AdminLayout
