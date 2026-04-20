import React, { useEffect } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { Package, Briefcase, Award, MessageSquare, ArrowUpRight, ArrowDownRight, Eye } from 'lucide-react'
import { fetchCounts } from '../store/slices/dashboardCountsSlice'

const typeConfig = {
  Product: { icon: Package, color: 'text-blue-600', bg: 'bg-blue-50', dot: 'bg-blue-500', ring: 'ring-blue-100' },
  Project: { icon: Briefcase, color: 'text-indigo-600', bg: 'bg-indigo-50', dot: 'bg-indigo-500', ring: 'ring-indigo-100' },
  Enquiry: { icon: MessageSquare, color: 'text-emerald-600', bg: 'bg-emerald-50', dot: 'bg-emerald-500', ring: 'ring-emerald-100' },
  Contact: { icon: MessageSquare, color: 'text-rose-600', bg: 'bg-rose-50', dot: 'bg-rose-500', ring: 'ring-rose-100' },
}

const timeAgo = (timestamp) => {
  const now = new Date()
  const then = new Date(timestamp)
  const diff = Math.floor((now - then) / 1000)
  if (diff < 60) return `${diff}s ago`
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`
  return `${Math.floor(diff / 86400)}d ago`
}

const Dashboard = () => {
  const dispatch = useDispatch()
  const { counts, loading } = useSelector(state => state.dashboardCounts)
  const { activities = [], trends = {} } = counts

  useEffect(() => {
    dispatch(fetchCounts())
  }, [dispatch])

  const stats = [
    {
      label: 'Total Products',
      value: counts.productsCount,
      trend: trends.products,
      icon: Package,
      color: 'text-blue-600',
      bg: 'bg-blue-50'
    },
    {
      label: 'Active Projects',
      value: counts.projectsCount,
      trend: trends.projects,
      icon: Briefcase,
      color: 'text-indigo-600',
      bg: 'bg-indigo-50'
    },
    {
      label: 'Achievements',
      value: counts.achievedCount,
      trend: null,
      icon: Award,
      color: 'text-amber-600',
      bg: 'bg-amber-50'
    },
    {
      label: 'Product Enquiries',
      value: counts.enquiriesCount,
      trend: trends.enquiries,
      icon: MessageSquare,
      color: 'text-emerald-600',
      bg: 'bg-emerald-50'
    },
  ]

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Dashboard Overview</h1>
          <p className="text-sm text-slate-500 mt-1">Welcome back! Here's what's happening today.</p>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => (
          <div key={index} className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm font-medium text-slate-500">{stat.label}</p>
                <h3 className="text-3xl font-bold text-slate-900 mt-2">
                  {loading ? <span className="animate-pulse text-slate-300">—</span> : stat.value ?? 0}
                </h3>
              </div>
              <div className={`p-3 rounded-xl ${stat.bg}`}>
                <stat.icon className={`w-6 h-6 ${stat.color}`} />
              </div>
            </div>
            <div className="mt-4 flex items-center text-xs">
              {stat.trend != null ? (
                stat.trend > 0 ? (
                  <>
                    <span className="text-emerald-600 font-bold flex items-center gap-0.5">
                      <ArrowUpRight className="w-3.5 h-3.5" /> +{stat.trend}
                    </span>
                    <span className="text-slate-400 ml-1.5">new this month</span>
                  </>
                ) : (
                  <>
                    <span className="text-rose-500 font-bold flex items-center gap-0.5">
                      <ArrowDownRight className="w-3.5 h-3.5" /> {stat.trend}
                    </span>
                    <span className="text-slate-400 ml-1.5">new this month</span>
                  </>
                )
              ) : (
                <span className="text-slate-400">Total recorded</span>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Bottom Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Quick Overview */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
          <h3 className="text-base font-semibold text-slate-900 mb-5">Quick Overview</h3>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {[
              { label: 'Products Added', value: trends.products, color: 'bg-blue-500' },
              { label: 'Projects Added', value: trends.projects, color: 'bg-indigo-500' },
              { label: 'Enquiries Received', value: trends.enquiries, color: 'bg-emerald-500' },
              { label: 'Achievements', value: trends.achievements, color: 'bg-rose-500' },
            ].map((item, i) => (
              <div key={i} className="bg-slate-50 rounded-xl p-4 border border-slate-100 flex flex-col gap-2">
                <div className={`w-2 h-2 rounded-full ${item.color}`} />
                <div className="text-2xl font-bold text-slate-900">{loading ? '—' : item.value ?? 0}</div>
                <div className="text-[11px] text-slate-500 font-medium leading-tight">{item.label}</div>
                <div className="text-[10px] text-slate-400">Last 30 days</div>
              </div>
            ))}
          </div>

          {/* Progress bars */}
          <div className="mt-6 space-y-3">
            {[
              { label: 'Products', value: counts.productsCount, color: 'bg-blue-500' },
              { label: 'Projects', value: counts.projectsCount, color: 'bg-indigo-500' },
              { label: 'Achievements', value: counts.achievedCount, color: 'bg-amber-500' },
              { label: 'Enquiries', value: counts.enquiriesCount, color: 'bg-emerald-500' },
            ].map((item, i) => {
              const max = Math.max(counts.productsCount, counts.projectsCount, counts.achievedCount, counts.enquiriesCount, 1)
              const pct = Math.round(((item.value ?? 0) / max) * 100)
              return (
                <div key={i} className="flex items-center gap-3">
                  <div className="text-xs text-slate-500 font-medium w-20 shrink-0">{item.label}</div>
                  <div className="flex-1 bg-slate-100 rounded-full h-2">
                    <div className={`${item.color} h-2 rounded-full transition-all duration-700`} style={{ width: `${pct}%` }} />
                  </div>
                  <div className="text-xs font-bold text-slate-700 w-5 text-right">{item.value ?? 0}</div>
                </div>
              )
            })}
          </div>
        </div>

        {/* Recent Activity */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-900 tracking-tight">Recent Activity</h3>
            {!loading && activities.length > 0 && (
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-500 uppercase tracking-wider">
                {activities.length} events
              </span>
            )}
          </div>
          {loading ? (
            <div className="divide-y divide-slate-50">
              {[1, 2, 3, 4].map(i => (
                <div key={i} className="flex items-center gap-3 px-6 py-4 animate-pulse">
                  <div className="w-9 h-9 rounded-xl bg-slate-100 shrink-0" />
                  <div className="flex-1 space-y-2">
                    <div className="h-3 bg-slate-100 rounded w-3/4" />
                    <div className="h-2.5 bg-slate-50 rounded w-1/2" />
                  </div>
                  <div className="w-12 h-4 bg-slate-100 rounded-full" />
                </div>
              ))}
            </div>
          ) : activities.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-14 text-slate-300">
              <MessageSquare className="w-10 h-10 mb-3" />
              <p className="text-sm font-medium text-slate-400">No recent activity</p>
              <p className="text-xs text-slate-300 mt-1">Events will appear here as they happen</p>
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
                    className="flex items-center gap-3 px-6 py-4 hover:bg-slate-50 transition-all cursor-pointer group"
                  >
                    <div className={`w-10 h-10 rounded-xl ${cfg.bg} flex items-center justify-center shrink-0 shadow-sm border border-transparent group-hover:border-slate-200 transition-all`}>
                      <Icon className={`w-5 h-5 ${cfg.color}`} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-bold text-slate-900 truncate group-hover:text-brand transition-colors">{activity.title}</p>
                      <p className="text-[11px] text-slate-400 truncate mt-0.5">{activity.subtitle}</p>
                    </div>
                    <div className="flex flex-col items-end gap-1.5 shrink-0">
                      <span className={`text-[9px] font-extrabold px-2.5 py-0.5 rounded-lg uppercase tracking-wider ${cfg.bg} ${cfg.color} border border-transparent`}>
                        {activity.type}
                      </span>
                      <span className="text-[10px] text-slate-400 font-medium">{timeAgo(activity.timestamp)}</span>
                    </div>
                    <div className="opacity-0 group-hover:opacity-100 transition-opacity ml-2">
                      <div className="p-1.5 rounded-lg bg-slate-100 text-slate-400">
                        <Eye className="w-3.5 h-3.5" />
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default Dashboard
