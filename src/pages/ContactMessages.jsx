import React, { useState, useEffect } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { Mail, Phone, Calendar, User, Trash2, CheckCircle2, MessageSquare, Search, X, Filter } from 'lucide-react'
import { fetchContacts, updateContactStatusAsync, deleteContactAsync } from '../store/slices/contactSlice'
import { toast } from 'react-hot-toast'
import DeleteConfirmModal from '../components/DeleteConfirmModal'

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
    }, 500)
    return () => clearTimeout(timer)
  }, [searchTerm])

  useEffect(() => {
    dispatch(fetchContacts({
      page: currentPage,
      limit: 10,
      search: debouncedSearch,
      status: statusFilter
    }))
  }, [dispatch, currentPage, debouncedSearch, statusFilter])

  const handleStatusUpdate = async (id, status) => {
    try {
      await dispatch(updateContactStatusAsync({ id, status })).unwrap()
      toast.success('Message updated!')
      if (selectedContact?._id === id) {
        setSelectedContact(prev => ({ ...prev, status }))
      }
    } catch (err) {
      toast.error(err.message || 'Failed to update status')
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
    <div className="space-y-6">
      <DeleteConfirmModal
        isOpen={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
        loading={deleteLoading}
        title="Delete Message"
        description="Are you sure you want to delete this contact message? This action cannot be undone."
      />
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Contact Form Messages</h1>
          <p className="text-sm text-slate-500 mt-1">Manage general enquiries and feedback from the contact form.</p>
        </div>
      </div>

      <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden text-sm">
        <div className="px-6 py-4 border-b border-slate-200 flex flex-col lg:flex-row lg:items-center gap-4 justify-between bg-white">
          <div className="flex flex-col sm:flex-row lg:flex-row justify-between items-center gap-4 flex-1">
            {/* Search */}
            <div className="relative w-full sm:w-80">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Search messages..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 focus:border-brand focus:ring-4 focus:ring-brand/5 rounded-xl pl-10 pr-4 py-2.5 text-sm text-slate-700 transition-all outline-none"
              />
            </div>

            {/* Filter */}
            <div className="flex items-center gap-2 w-full sm:w-auto">
              <div className="flex items-center gap-2 px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl">
                <Filter className="w-3.5 h-3.5 text-slate-400" />
                <select
                  value={statusFilter}
                  onChange={(e) => { setStatusFilter(e.target.value); setCurrentPage(1); }}
                  className="bg-transparent text-xs font-bold text-slate-600 outline-none cursor-pointer"
                >
                  <option value="All">All Status</option>
                  <option value="Unread">Unread</option>
                  <option value="Read">Read</option>
                  <option value="Replied">Replied</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm whitespace-nowrap">
            <thead className="bg-brand border-b border-brand-hover">
              <tr>
                <th className="px-6 py-4 text-xs font-bold text-white">Customer</th>
                <th className="px-6 py-4 text-xs font-bold text-white">Subject/Message</th>
                <th className="px-6 py-4 text-xs font-bold text-white text-center">Status</th>
                <th className="px-6 py-4 text-xs font-bold text-white text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading && (
                <tr><td colSpan={4} className="text-center py-12 text-slate-400 italic">Finding messages...</td></tr>
              )}
              {!loading && contacts.length === 0 && (
                <tr><td colSpan={4} className="text-center py-12 text-slate-400">No messages found matching filters.</td></tr>
              )}
              {contacts.map((msg) => (
                <tr key={msg._id} className="hover:bg-slate-50/50 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex flex-col">
                      <span className="font-bold text-slate-900">{msg.name}</span>
                      <span className="text-[11px] text-slate-500">{msg.email}</span>
                      {msg.phone && <span className="text-[11px] text-slate-400">{msg.phone}</span>}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex flex-col max-w-md">
                      <span className="text-[11px] font-bold text-brand uppercase truncate">{msg.subject}</span>
                      <span className="text-slate-600 truncate italic" title={msg.message}>"{msg.message}"</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-center">
                    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider
                      ${msg.status === 'Unread' ? 'bg-rose-50 text-rose-600 border border-rose-100' : ''}
                      ${msg.status === 'Read' ? 'bg-amber-50 text-amber-600 border border-amber-100' : ''}
                      ${msg.status === 'Replied' ? 'bg-emerald-50 text-emerald-600 border border-emerald-100' : ''}
                    `}>
                      {msg.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <button
                      onClick={() => setSelectedContact(msg)}
                      className="inline-flex items-center gap-2 px-3 py-1.5 text-xs font-bold text-emerald-600 bg-emerald-50 border border-emerald-100/50 rounded-xl hover:bg-emerald-600 hover:text-white transition-all duration-300 shadow-sm group"
                    >
                      <Search className="w-3.5 h-3.5 transition-transform group-hover:scale-110" />
                      View Details
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {pagination.pages > 1 && (
          <div className="p-4 border-t border-slate-200 flex items-center justify-between text-xs text-slate-500 bg-slate-50/30">
            <div>
              Showing <span className="font-medium text-slate-900">{(pagination.page - 1) * pagination.limit + 1}</span> to <span className="font-medium text-slate-900">{Math.min(pagination.page * pagination.limit, pagination.total)}</span> of <span className="font-medium text-slate-900">{pagination.total}</span> results
            </div>
            <div className="flex items-center gap-1">
              <button onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))} disabled={pagination.page <= 1} className="px-3 py-1.5 border border-slate-200 rounded-lg hover:bg-white disabled:opacity-50 transition-all">Prev</button>
              {[...Array(pagination.pages)].map((_, i) => (
                <button
                  key={i + 1}
                  onClick={() => setCurrentPage(i + 1)}
                  className={`w-8 h-8 flex items-center justify-center rounded-lg font-bold transition-all ${pagination.page === i + 1 ? 'bg-brand text-white shadow-md shadow-brand/20' : 'hover:bg-white text-slate-600 border border-transparent'}`}
                >
                  {i + 1}
                </button>
              ))}
              <button onClick={() => setCurrentPage(prev => Math.min(pagination.pages, prev + 1))} disabled={pagination.page >= pagination.pages} className="px-3 py-1.5 border border-slate-200 rounded-lg hover:bg-white disabled:opacity-50 transition-all">Next</button>
            </div>
          </div>
        )}
      </div>

      {/* View Modal */}
      {selectedContact && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden flex flex-col animate-in fade-in zoom-in duration-200 border border-slate-200">
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-white sticky top-0 z-10">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-blue-50 border border-blue-100 flex items-center justify-center text-brand">
                  <User className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-slate-900 leading-tight">{selectedContact.name}</h2>
                  <p className="text-xs text-slate-400 font-medium">Contact Form Submission</p>
                </div>
              </div>
              <button onClick={() => setSelectedContact(null)} className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-50 rounded-full transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 overflow-y-auto space-y-6">
              {/* Customer Details */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Email Address</p>
                  <p className="text-sm font-semibold text-slate-900 flex items-center gap-2">
                    <Mail className="w-3.5 h-3.5 text-slate-300" /> {selectedContact.email}
                  </p>
                </div>
                {selectedContact.phone && (
                  <div className="space-y-1">
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Phone Number</p>
                    <p className="text-sm font-semibold text-slate-900 flex items-center gap-2">
                      <Phone className="w-3.5 h-3.5 text-slate-300" /> {selectedContact.phone}
                    </p>
                  </div>
                )}
              </div>

              {/* Subject */}
              <div className="space-y-1">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Subject</p>
                <div className="p-3 bg-slate-50 rounded-lg border border-slate-100 font-bold text-slate-900 text-sm">
                  {selectedContact.subject}
                </div>
              </div>

              {/* Message */}
              <div className="space-y-2">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Full Message</p>
                <div className="p-4 bg-slate-50 rounded-xl border border-slate-100 text-sm text-slate-700 italic leading-relaxed">
                  "{selectedContact.message}"
                </div>
                <div className="flex items-center gap-2 text-[10px] text-slate-400 pl-1 font-medium">
                  <Calendar className="w-3 h-3" /> Submitted on {new Date(selectedContact.createdAt).toLocaleString()}
                </div>
              </div>

              {/* Status Update */}
              <div className="space-y-3 pt-2">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Update Process Status</p>
                <div className="flex flex-wrap gap-2">
                  {['Unread', 'Read', 'Replied'].map(status => (
                    <button
                      key={status}
                      onClick={() => handleStatusUpdate(selectedContact._id, status)}
                      className={`px-4 py-2 rounded-lg text-xs font-bold transition-all border ${selectedContact.status === status
                        ? status === 'Unread' ? 'bg-rose-500 text-white border-rose-500 shadow-md shadow-rose-200' :
                          status === 'Read' ? 'bg-amber-500 text-white border-amber-500 shadow-md shadow-amber-200' :
                            'bg-emerald-500 text-white border-emerald-500 shadow-md shadow-emerald-200'
                        : 'bg-white text-slate-600 border-slate-200 hover:border-slate-300 hover:bg-slate-50'
                        }`}
                    >
                      {status === selectedContact.status && <CheckCircle2 className="w-3 h-3 inline mr-1.5 mb-0.5" />}
                      {status}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="px-6 py-4 bg-slate-50 border-t border-slate-100 flex items-center justify-between mt-auto">
              <button
                onClick={() => setDeleteTarget(selectedContact._id)}
                className="text-xs font-bold text-slate-400 hover:text-rose-500 flex items-center gap-1.5 transition-colors"
              >
                <Trash2 className="w-3.5 h-3.5" /> Permanently Delete
              </button>
              <button
                onClick={() => setSelectedContact(null)}
                className="px-5 py-2 text-xs font-bold text-white bg-slate-900 rounded-lg hover:bg-slate-800 transition-colors shadow-lg shadow-slate-200"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}


      {/* Pagination */}
      {pagination.pages > 1 && (
        <div className="p-4 border-t border-slate-200 flex items-center justify-between text-xs text-slate-500">
          <div>
            Showing {Math.min((pagination.page - 1) * pagination.limit + 1, pagination.total)} to {Math.min(pagination.page * pagination.limit, pagination.total)} of {pagination.total} results
          </div>
          <div className="flex items-center gap-1">
            <button
              onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
              disabled={pagination.page <= 1}
              className="px-3 py-1 border border-slate-200 rounded hover:bg-slate-50 disabled:opacity-50 transition-colors"
            >
              Prev
            </button>
            {[...Array(pagination.pages)].map((_, i) => (
              <button
                key={i + 1}
                onClick={() => setCurrentPage(i + 1)}
                className={`w-7 h-7 flex items-center justify-center rounded transition-colors ${pagination.page === i + 1 ? 'bg-brand text-white' : 'hover:bg-slate-50 text-slate-600'}`}
              >
                {i + 1}
              </button>
            ))}
            <button
              onClick={() => setCurrentPage(prev => Math.min(pagination.pages, prev + 1))}
              disabled={pagination.page >= pagination.pages}
              className="px-3 py-1 border border-slate-200 rounded hover:bg-slate-50 disabled:opacity-50 transition-colors"
            >
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  )
}


export default ContactMessages
