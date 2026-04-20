import React from 'react'
import { Trash2, X } from 'lucide-react'

/**
 * Reusable Delete Confirmation Modal
 *
 * Props:
 *   isOpen        boolean   - Whether the modal is shown
 *   onClose       fn        - Called when user cancels
 *   onConfirm     fn        - Called when user confirms delete
 *   title         string    - Modal heading (optional)
 *   description   string    - Body text (optional)
 *   loading       boolean   - Shows a spinner and disables buttons during async delete
 */
const DeleteConfirmModal = ({
  isOpen,
  onClose,
  onConfirm,
  title = 'Confirm Delete',
  description = 'Are you sure you want to delete this item? This action cannot be undone.',
  loading = false,
}) => {
  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm overflow-hidden border border-slate-200 animate-in zoom-in duration-200">

        {/* Header */}
        <div className="flex items-center justify-between px-6 pt-6 pb-0">
          <div className="w-12 h-12 bg-rose-50 rounded-full flex items-center justify-center border border-rose-100 shrink-0">
            <Trash2 className="w-6 h-6 text-rose-500" />
          </div>
          <button
            onClick={onClose}
            disabled={loading}
            className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-full transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Body */}
        <div className="px-6 pt-4 pb-6">
          <h3 className="text-lg font-bold text-slate-900 mb-1.5">{title}</h3>
          <p className="text-sm text-slate-500 leading-relaxed">{description}</p>
        </div>

        {/* Actions */}
        <div className="flex gap-3 px-6 pb-6">
          <button
            onClick={onClose}
            disabled={loading}
            className="flex-1 px-4 py-2.5 text-sm font-bold text-slate-600 bg-slate-50 border border-slate-200 rounded-xl hover:bg-slate-100 transition-all disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            disabled={loading}
            className="flex-1 px-4 py-2.5 text-sm font-bold text-white bg-rose-500 hover:bg-rose-600 rounded-xl transition-all shadow-lg shadow-rose-200 disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {loading ? (
              <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
            ) : (
              <Trash2 className="w-4 h-4" />
            )}
            {loading ? 'Deleting…' : 'Yes, Delete'}
          </button>
        </div>
      </div>
    </div>
  )
}

export default DeleteConfirmModal
