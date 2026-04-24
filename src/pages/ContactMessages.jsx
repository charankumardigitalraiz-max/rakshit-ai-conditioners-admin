import React, { useState, useEffect } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { Mail, Phone, Calendar, User, Trash2, Search, X, Filter, ChevronLeft, ChevronRight, MessageSquare } from 'lucide-react'
import { fetchContacts, updateContactStatusAsync, deleteContactAsync } from '../store/slices/contactSlice'
import { toast } from 'react-hot-toast'
import DeleteConfirmModal from '../components/DeleteConfirmModal'
import { motion, AnimatePresence } from 'framer-motion'

const ContactMessages = () => {
  const dispatch = useDispatch()
  const { items: contacts, loading, error, pagination } = useSelector(state => state.contacts)
  const [searchTerm, setSearchTerm] = useState('')
  const [debouncedSearch, setDebouncedSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('All')
  const [currentPage, setCurrentPage] = useState(1)
  const [selectedContact, setSelectedContact] = useState(null)
  const [deleteTarget, setDeleteTarget] = useState(null)
  const [deleteLoading, setDeleteLoading] = useState(false)

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchTerm)
      setCurrentPage(1)
    }, 400)
    return () => clearTimeout(timer)
  }, [searchTerm])

  useEffect(() => {
    dispatch(fetchContacts({
      page: currentPage,
      limit: 12,
      search: debouncedSearch,
      status: statusFilter
    }))
  }, [dispatch, currentPage, debouncedSearch, statusFilter])

  const handleStatusUpdate = async (id, status) => {
    try {
      await dispatch(updateContactStatusAsync({ id, status })).unwrap()
      toast.success('Status updated!')
      if (selectedContact?._id === id) {
        setSelectedContact(prev => ({ ...prev, status }))
      }
    } catch (err) {
      toast.error(err.message || 'Failed to update')
    }
  }

  const handleDelete = async () => {
    if (!deleteTarget) return
    setDeleteLoading(true)
    try {
      await dispatch(deleteContactAsync(deleteTarget)).unwrap()
      toast.success('Message deleted!')
      setSelectedContact(null)
    } catch {
      toast.error('Failed to delete')
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
        title="Delete Message"
        description="Are you sure you want to delete this message?"
      />

      <div className="flex items-end justify-between gap-4">
        <div>
          <h1 className="text-lg font-bold text-slate-900 tracking-tight">Inbox</h1>
          <p className="text-[11px] font-medium text-slate-400 uppercase tracking-wider mt-0.5">Contact Form Submissions</p>
        </div>
      </div>

      <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden flex flex-col">
        {/* Toolbar */}
        <div className="px-4 py-3 border-b border-slate-100 flex flex-wrap items-center gap-3 bg-slate-50/30">
          <div className="relative flex-1 min-w-[200px]">
            <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search messages..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-white border border-slate-200 focus:border-brand rounded-lg pl-9 pr-4 py-1.5 text-xs text-slate-700 outline-none transition-all"
            />
          </div>

          <div className="flex items-center gap-1.5 px-2 py-1 bg-white border border-slate-200 rounded-lg">
            <Filter className="w-3 h-3 text-slate-400" />
            <select
              value={statusFilter}
              onChange={(e) => { setStatusFilter(e.target.value); setCurrentPage(1); }}
              className="bg-transparent text-[11px] font-bold text-slate-600 outline-none cursor-pointer pr-1"
            >
              <option value="All">All Status</option>
              <option value="Unread">Unread</option>
              <option value="Read">Read</option>
              <option value="Replied">Replied</option>
            </select>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto overflow-y-auto max-h-[60vh] custom-scrollbar">
          <table className="w-full text-left text-[12px] whitespace-nowrap">
            <thead className="bg-white sticky top-0 z-10 border-b border-slate-100">
              <tr>
                <th className="px-5 py-3 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Sender</th>
                <th className="px-5 py-3 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Subject / Message</th>
                <th className="px-5 py-3 text-[10px] font-bold text-slate-400 uppercase tracking-widest text-center">Status</th>
                <th className="px-5 py-3 text-[10px] font-bold text-slate-400 uppercase tracking-widest text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {loading ? (
                <tr><td colSpan={4} className="text-center py-20 text-slate-300 animate-pulse">Fetching inbox...</td></tr>
              ) : contacts.length === 0 ? (
                <tr><td colSpan={4} className="text-center py-20 text-slate-400">No messages found.</td></tr>
              ) : (
                contacts.map((msg) => (
                  <tr key={msg._id} className="hover:bg-slate-50/80 transition-colors group">
                    <td className="px-5 py-2.5">
                      <div className="flex flex-col">
                        <span className="font-bold text-slate-900">{msg.name}</span>
                        <span className="text-[10px] text-slate-400 font-medium">{msg.email}</span>
                      </div>
                    </td>
                    <td className="px-5 py-2.5">
                      <div className="flex flex-col max-w-xs">
                        <span className="font-bold text-brand text-[10px] uppercase tracking-tight">{msg.subject}</span>
                        <span className="text-slate-500 truncate italic">"{msg.message}"</span>
                      </div>
                    </td>
                    <td className="px-5 py-2.5 text-center">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded text-[9px] font-extrabold uppercase tracking-wider
                        ${msg.status === 'Unread' ? 'bg-rose-50 text-rose-600' : ''}
                        ${msg.status === 'Read' ? 'bg-amber-50 text-amber-600' : ''}
                        ${msg.status === 'Replied' ? 'bg-emerald-50 text-emerald-600' : ''}
                      `}>
                        {msg.status}
                      </span>
                    </td>
                    <td className="px-5 py-2.5 text-right">
                      <button
                        onClick={() => setSelectedContact(msg)}
                        className="p-1.5 text-slate-400 hover:text-brand hover:bg-brand/5 rounded-md transition-all"
                      >
                        <Search className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="px-4 py-2.5 border-t border-slate-100 flex items-center justify-between bg-slate-50/20">
          <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
            {pagination.total} Messages
          </div>

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
      </div>

      {/* Details Modal */}
      <AnimatePresence>
        {selectedContact && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-[2px]">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-xl shadow-2xl w-full max-w-lg overflow-hidden border border-slate-200"
            >
              <div className="px-5 py-3 border-b border-slate-100 flex items-center justify-between bg-white sticky top-0 z-10">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-slate-900 flex items-center justify-center text-white">
                    <Mail className="w-4 h-4" />
                  </div>
                  <div>
                    <h2 className="text-sm font-bold text-slate-900 leading-tight">{selectedContact.name}</h2>
                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Message Details</p>
                  </div>
                </div>
                <button onClick={() => setSelectedContact(null)} className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-50 rounded-lg transition-all">
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="p-5 space-y-5">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-0.5">
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Contact Info</p>
                    <p className="text-xs font-bold text-slate-900 flex items-center gap-2">
                      <Mail className="w-3 h-3 text-slate-300" /> {selectedContact.email}
                    </p>
                    {selectedContact.phone && (
                      <p className="text-xs font-bold text-brand flex items-center gap-2">
                        <Phone className="w-3 h-3 text-slate-300" /> {selectedContact.phone}
                      </p>
                    )}
                  </div>
                  <div className="space-y-0.5 text-right">
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Date Received</p>
                    <p className="text-xs font-bold text-slate-900 flex items-center justify-end gap-2">
                      <Calendar className="w-3 h-3 text-slate-300" /> {new Date(selectedContact.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>

                <div className="space-y-1">
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Subject</p>
                  <div className="p-2.5 bg-slate-50 rounded-lg border border-slate-100 font-bold text-slate-900 text-[13px]">
                    {selectedContact.subject}
                  </div>
                </div>

                <div className="space-y-1.5">
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Full Message</p>
                  <div className="p-3.5 bg-slate-50 rounded-lg border border-slate-100 text-[13px] text-slate-700 italic leading-relaxed">
                    "{selectedContact.message}"
                  </div>
                </div>

                <div className="space-y-2.5 pt-1">
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Update Status</p>
                  <div className="flex gap-2">
                    {['Unread', 'Read', 'Replied'].map(status => (
                      <button
                        key={status}
                        onClick={() => handleStatusUpdate(selectedContact._id, status)}
                        className={`flex-1 py-2 rounded-lg text-xs font-bold transition-all border ${selectedContact.status === status
                          ? status === 'Unread' ? 'bg-rose-500 text-white border-rose-500 shadow-sm' :
                            status === 'Read' ? 'bg-amber-500 text-white border-amber-500 shadow-sm' :
                              'bg-emerald-500 text-white border-emerald-500 shadow-sm'
                          : 'bg-white text-slate-600 border-slate-200 hover:border-slate-300'
                          }`}
                      >
                        {status}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <div className="px-5 py-3 bg-slate-50 border-t border-slate-100 flex items-center justify-between">
                <button onClick={() => setDeleteTarget(selectedContact._id)} className="text-[10px] font-bold text-slate-400 hover:text-rose-500 flex items-center gap-1.5 transition-colors uppercase tracking-wider">
                  <Trash2 className="w-3.5 h-3.5" /> Delete
                </button>
                <button onClick={() => setSelectedContact(null)} className="px-4 py-1.5 text-xs font-bold text-white bg-slate-900 rounded-lg hover:bg-slate-800 transition-all shadow-sm">
                  Done
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  )
}

export default ContactMessages
