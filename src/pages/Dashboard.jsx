import React, { useEffect } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { Package, Briefcase, Award, MessageSquare, ArrowUpRight, ArrowDownRight, Eye, Clock } from 'lucide-react'
import { fetchCounts } from '../store/slices/dashboardCountsSlice'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'

const typeConfig = {
  Product: { icon: Package, color: 'text-brand', bg: 'bg-brand/5', border: 'border-brand/10' },
  Project: { icon: Briefcase, color: 'text-brand', bg: 'bg-brand/5', border: 'border-brand/10' },
  Enquiry: { icon: MessageSquare, color: 'text-emerald-600', bg: 'bg-emerald-50', border: 'border-emerald-100' },
  Contact: { icon: MessageSquare, color: 'text-rose-600', bg: 'bg-rose-50', border: 'border-rose-100' },
}

const timeAgo = (timestamp) => {
  const now = new Date()
  const then = new Date(timestamp)
  const diff = Math.floor((now - then) / 1000)
  if (diff < 60) return `${diff}s`
  if (diff < 3600) return `${Math.floor(diff / 60)}m`
  if (diff < 86400) return `${Math.floor(diff / 3600)}h`
  return `${Math.floor(diff / 86400)}d`
}

const Dashboard = () => {
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const { counts, loading } = useSelector(state => state.dashboardCounts)
  const { activities = [], trends = {} } = counts

  useEffect(() => {
    dispatch(fetchCounts())
  }, [dispatch])

  const stats = [
    { label: 'Products', value: counts.productsCount, trend: trends.products, icon: Package, color: 'text-blue-600', bg: 'bg-blue-50' },
    { label: 'Projects', value: counts.projectsCount, trend: trends.projects, icon: Briefcase, color: 'text-indigo-600', bg: 'bg-indigo-50' },
    { label: 'Achievements', value: counts.achievedCount, trend: null, icon: Award, color: 'text-amber-600', bg: 'bg-amber-50' },
    { label: 'Leads', value: counts.enquiriesCount, trend: trends.enquiries, icon: MessageSquare, color: 'text-emerald-600', bg: 'bg-emerald-50' },
  ]

  return (
    <div className="space-y-5">
      <div className="flex items-end justify-between">
        <div>
          <h1 className="text-lg font-bold text-slate-900 tracking-tight">Dashboard</h1>
          <p className="text-[11px] font-medium text-slate-400 uppercase tracking-wider mt-0.5">Overview & Metrics</p>
        </div>
        <div className="flex items-center gap-2 text-[11px] font-bold text-slate-400 bg-white border border-slate-200 px-3 py-1.5 rounded-lg shadow-sm">
          <Clock className="w-3 h-3" />
          <span>Last updated: Just now</span>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, index) => (
          <motion.div 
            key={index} 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
            className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm hover:border-brand/30 transition-all group"
          >
            <div className="flex items-center justify-between mb-3">
              <div className={`p-2 rounded-lg ${stat.bg} group-hover:scale-110 transition-transform`}>
                <stat.icon className={`w-4 h-4 ${stat.color}`} />
              </div>
              {stat.trend != null && (
                <div className={`flex items-center gap-0.5 text-[10px] font-bold ${stat.trend >= 0 ? 'text-emerald-600' : 'text-rose-500'}`}>
                  {stat.trend >= 0 ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
                  {Math.abs(stat.trend)}
                </div>
              )}
            </div>
            <div>
              <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">{stat.label}</p>
              <h3 className="text-xl font-bold text-slate-900 mt-0.5">
                {loading ? <span className="animate-pulse text-slate-200">—</span> : stat.value ?? 0}
              </h3>
            </div>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-5">
        {/* Growth Overview */}
        <div className="lg:col-span-3 bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden flex flex-col">
          <div className="px-5 py-3 border-b border-slate-100 flex items-center justify-between bg-slate-50/30">
            <h3 className="text-[12px] font-bold text-slate-900 uppercase tracking-tight">Growth Metrics</h3>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">30 Day Window</span>
          </div>
          <div className="p-5 flex-1 flex flex-col justify-between">
            <div className="grid grid-cols-2 gap-3 mb-6">
              {[
                { label: 'Products', value: trends.products, color: 'bg-blue-500' },
                { label: 'Projects', value: trends.projects, color: 'bg-indigo-500' },
                { label: 'Leads', value: trends.enquiries, color: 'bg-emerald-500' },
                { label: 'Awards', value: trends.achievements, color: 'bg-rose-500' },
              ].map((item, i) => (
                <div key={i} className="bg-slate-50/50 rounded-lg p-3 border border-slate-100 flex items-center justify-between">
                  <div>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-0.5">{item.label}</p>
                    <div className="text-lg font-bold text-slate-900 leading-none">{loading ? '—' : item.value ?? 0}</div>
                  </div>
                  <div className={`w-1.5 h-6 rounded-full ${item.color} opacity-20`} />
                </div>
              ))}
            </div>

            <div className="space-y-3.5">
              {[
                { label: 'Products', value: counts.productsCount, color: 'bg-blue-500' },
                { label: 'Projects', value: counts.projectsCount, color: 'bg-indigo-500' },
                { label: 'Leads', value: counts.enquiriesCount, color: 'bg-emerald-500' },
              ].map((item, i) => {
                const max = Math.max(counts.productsCount, counts.projectsCount, counts.achievedCount, counts.enquiriesCount, 1)
                const pct = Math.round(((item.value ?? 0) / max) * 100)
                return (
                  <div key={i} className="space-y-1.5">
                    <div className="flex items-center justify-between text-[11px] font-bold text-slate-500">
                      <span className="uppercase tracking-wider">{item.label}</span>
                      <span className="text-slate-900">{item.value ?? 0} total</span>
                    </div>
                    <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
                      <motion.div 
                        initial={{ width: 0 }}
                        animate={{ width: `${pct}%` }}
                        transition={{ duration: 1, ease: "easeOut" }}
                        className={`${item.color} h-full rounded-full`} 
                      />
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        </div>

        {/* Activity Feed */}
        <div className="lg:col-span-2 bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden flex flex-col">
          <div className="px-5 py-3 border-b border-slate-100 flex items-center justify-between bg-slate-50/30">
            <h3 className="text-[12px] font-bold text-slate-900 uppercase tracking-tight">Recent Activity</h3>
            <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
          </div>
          
          <div className="flex-1 overflow-y-auto max-h-[380px] custom-scrollbar">
            {loading ? (
              <div className="divide-y divide-slate-50">
                {[1, 2, 3, 4, 5].map(i => (
                  <div key={i} className="flex items-center gap-3 px-5 py-3 animate-pulse">
                    <div className="w-8 h-8 rounded-lg bg-slate-100 shrink-0" />
                    <div className="flex-1 space-y-2">
                      <div className="h-2.5 bg-slate-100 rounded w-3/4" />
                      <div className="h-2 bg-slate-50 rounded w-1/2" />
                    </div>
                  </div>
                ))}
              </div>
            ) : activities.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 text-center px-6">
                <div className="w-12 h-12 bg-slate-50 rounded-full flex items-center justify-center text-slate-200 mb-3">
                  <MessageSquare className="w-6 h-6" />
                </div>
                <p className="text-[12px] font-bold text-slate-400 uppercase tracking-wider">No Activity</p>
                <p className="text-[10px] text-slate-300 mt-1">New events will appear here in real-time.</p>
              </div>
            ) : (
              <div className="divide-y divide-slate-50">
                {activities.map((activity, i) => {
                  const cfg = typeConfig[activity.type] || typeConfig.Product
                  const Icon = cfg.icon

                  const handleNavigate = () => {
                    if (activity.type === 'Product' && activity._id) navigate(`/products/${activity._id}`)
                    else if (activity.type === 'Enquiry') navigate('/enquiries')
                    else if (activity.type === 'Project') navigate('/projects')
                    else if (activity.type === 'Contact') navigate('/contacts')
                  }

                  return (
                    <div
                      key={activity._id || i}
                      onClick={handleNavigate}
                      className="flex items-center gap-3 px-5 py-3 hover:bg-slate-50 transition-all cursor-pointer group"
                    >
                      <div className={`w-8 h-8 rounded-lg ${cfg.bg} ${cfg.border} border flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform`}>
                        <Icon className={`w-4 h-4 ${cfg.color}`} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-2">
                          <p className="text-[12px] font-bold text-slate-900 truncate group-hover:text-brand transition-colors">
                            {activity.title}
                          </p>
                          <span className="text-[9px] font-medium text-slate-400 whitespace-nowrap">{timeAgo(activity.timestamp)}</span>
                        </div>
                        <p className="text-[10px] text-slate-400 truncate mt-0.5 font-medium">{activity.subtitle}</p>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </div>
          
          <button 
            className="w-full py-2.5 bg-slate-50 border-t border-slate-100 text-[10px] font-bold text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-all uppercase tracking-widest"
            onClick={() => navigate('/enquiries')}
          >
            View all logs
          </button>
        </div>
      </div>
    </div>
  )
}

export default Dashboard
