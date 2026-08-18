import React, { useState, useEffect } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { Mail, Phone, Calendar, User, Trash2, Search, X, Filter, ChevronLeft, ChevronRight, MessageSquare, MapPin } from 'lucide-react'
import { fetchContacts, updateContactStatusAsync, deleteContactAsync } from '../store/slices/contactSlice'
import { toast } from 'react-hot-toast'
import DeleteConfirmModal from '../components/DeleteConfirmModal'
import DataTable from '../components/ui/DataTable'
import Modal from '../components/ui/Modal'
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
    <div className="admin-page">
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
          <h1 className="admin-page-title">Inbox</h1>
          <p className="admin-page-subtitle">Contact Form Submissions</p>
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

        {/* DataTable */}
        <DataTable
          columns={[
            { label: 'Sender' },
            { label: 'Subject / Message' },
            { label: 'Status', className: 'text-center' },
            { label: 'Actions', className: 'text-right' }
          ]}
          data={contacts}
          loading={loading}
          loadingMessage="Fetching inbox..."
          emptyMessage="No messages found."
          pagination={pagination}
          onPageChange={setCurrentPage}
          totalLabel="Messages"
          renderRow={(msg) => (
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
          )}
        />
      </div>

      {/* Details Modal */}
      <Modal
        isOpen={!!selectedContact}
        onClose={() => setSelectedContact(null)}
        title={selectedContact?.name}
        subtitle="Message Details"
        icon={Mail}
        maxWidth="max-w-lg"
      >
        {selectedContact && (
          <>
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
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Name</p>
                <div className="p-2.5 bg-slate-50 rounded-lg border border-slate-100 font-bold text-slate-900 text-[13px]">
                  {selectedContact.name}
                </div>
              </div>
              <div className="space-y-1">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Interest</p>
                <div className="p-2.5 bg-slate-50 rounded-lg border border-slate-100 font-bold text-slate-900 text-[13px]">
                  {selectedContact.interest || "N/A"}
                </div>
              </div>
              {(selectedContact.location || selectedContact.area) && (
                <div className="space-y-1">
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Location</p>
                  <div className="p-2.5 bg-slate-50 rounded-lg border border-slate-100 text-[13px] text-slate-700 flex items-start gap-2">
                    <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0 mt-0.5" />
                    <span>
                      {[selectedContact.location, selectedContact.area].filter(Boolean).join(', ')}
                    </span>
                  </div>
                </div>
              )}
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
          </>
        )}
      </Modal>
    </div>
  )
}

export default ContactMessages
