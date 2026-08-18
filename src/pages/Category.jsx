import React, { useState, useEffect } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { Plus, Search, Edit, Trash2, X, LayoutGrid, ChevronLeft, ChevronRight } from 'lucide-react'
import { fetchCategories, createCategory, deleteCategoryAsync, updateCategoryAsync } from '../store/slices/categorySlice'
import { toast } from 'react-hot-toast'
import DeleteConfirmModal from '../components/DeleteConfirmModal'
import DataTable from '../components/ui/DataTable'
import Modal from '../components/ui/Modal'
import { motion, AnimatePresence } from 'framer-motion'

const Categories = () => {
    const [isFormOpen, setIsFormOpen] = useState(false)
    const [formData, setFormData] = useState({ name: '', description: '', status: 'active' })
    const [editingId, setEditingId] = useState(null)
    const [errors, setErrors] = useState({})

    const [searchTerm, setSearchTerm] = useState('')
    const [debouncedSearch, setDebouncedSearch] = useState('')
    const [currentPage, setCurrentPage] = useState(1)
    const [deleteTarget, setDeleteTarget] = useState(null)
    const [deleteLoading, setDeleteLoading] = useState(false)
    const { items: categories, loading, error, pagination } = useSelector(state => state.categories)
    const dispatch = useDispatch()

    useEffect(() => {
        const timer = setTimeout(() => {
            setDebouncedSearch(searchTerm)
            setCurrentPage(1)
        }, 400)
        return () => clearTimeout(timer)
    }, [searchTerm])

    useEffect(() => {
        dispatch(fetchCategories({
            page: currentPage,
            limit: 10,
            search: debouncedSearch,
        }))
    }, [dispatch, currentPage, debouncedSearch])

    const validateForm = () => {
        const validationErrors = {}
        if (!formData.name?.trim()) validationErrors.name = 'Category name is required'
        return validationErrors
    }

    const handleSubmit = async (e) => {
        e.preventDefault()
        const validationErrors = validateForm()
        if (Object.keys(validationErrors).length > 0) {
            setErrors(validationErrors)
            return
        }
        setErrors({})

        const data = new FormData()
        Object.keys(formData).forEach(key => data.append(key, formData[key]))

        try {
            if (editingId) {
                await dispatch(updateCategoryAsync({ id: editingId, data })).unwrap()
                toast.success('Category updated!')
                dispatch(fetchCategories({ page: currentPage, limit: 10, search: debouncedSearch }))
            } else {
                await dispatch(createCategory(data)).unwrap()
                toast.success('Category created!')
                if (currentPage !== 1) {
                    setCurrentPage(1)
                } else {
                    dispatch(fetchCategories({ page: 1, limit: 10, search: debouncedSearch }))
                }
            }
            setIsFormOpen(false)
            resetForm()
        } catch (err) {
            toast.error(err.message || 'Failed to save')
        }
    }

    const resetForm = () => {
        setFormData({ name: '', description: '', status: 'active' })
        setEditingId(null)
        setErrors({})
    }

    const handleEdit = (category) => {
        setFormData({
            name: category.name,
            description: category.description || '',
            status: category.status || 'active'
        })
        setEditingId(category._id || category.id)
        // dispatch(fetchCategories({ page: currentPage, limit: 12, search: debouncedSearch }))
        setIsFormOpen(true)
    }

    const handleDelete = async () => {
        if (!deleteTarget) return
        setDeleteLoading(true)
        try {
            await dispatch(deleteCategoryAsync(deleteTarget)).unwrap()
            toast.success('Category deleted!')
            // Force refetch to update pagination and count
            dispatch(fetchCategories({
                page: currentPage,
                limit: 10,
                search: debouncedSearch,
            }))
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
                title="Delete Category"
                description="Are you sure you want to delete this category?"
            />

            <div className="flex items-end justify-between gap-4">
                <div>
                    <h1 className="admin-page-title">Categories</h1>
                    <p className="admin-page-subtitle">Product & Service Taxonomies</p>
                </div>
                <button
                    onClick={() => { resetForm(); setIsFormOpen(true); }}
                    className="admin-btn-primary"
                >
                    <Plus className="w-3.5 h-3.5" />
                    New Category
                </button>
            </div>

            <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden flex flex-col">
                <div className="px-4 py-3 border-b border-slate-100 flex items-center gap-3 bg-slate-50/30">
                    <div className="relative flex-1 max-w-xs">
                        <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                        <input
                            type="text"
                            placeholder="Search categories..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full bg-white border border-slate-200 focus:border-brand rounded-lg pl-9 pr-4 py-1.5 text-xs text-slate-700 outline-none transition-all"
                        />
                    </div>
                </div>

                <DataTable
                    columns={[
                        { label: 'Name' },
                        { label: 'Status', className: 'text-center' },
                        { label: 'Actions', className: 'text-right' }
                    ]}
                    data={categories}
                    loading={loading}
                    loadingMessage="Syncing categories..."
                    emptyMessage="No categories found."
                    pagination={pagination}
                    onPageChange={setCurrentPage}
                    totalLabel="Total Categories"
                    renderRow={(cat) => (
                        <tr key={cat._id} className="hover:bg-slate-50/80 transition-colors group">
                            <td className="px-5 py-2.5">
                                <div className="flex items-center gap-3">
                                    <div className="w-7 h-7 rounded bg-slate-900 flex items-center justify-center text-white">
                                        <LayoutGrid className="w-3.5 h-3.5" />
                                    </div>
                                    <span className="font-bold text-slate-900">{cat.name}</span>
                                </div>
                            </td>
                            <td className="px-5 py-2.5 text-center">
                                <span className={`inline-flex items-center px-2 py-0.5 rounded text-[9px] font-extrabold uppercase tracking-wider
                                    ${cat.status === 'active' ? 'bg-emerald-50 text-emerald-600' : 'bg-slate-50 text-slate-400'}
                                `}>
                                    {cat.status}
                                </span>
                            </td>
                            <td className="px-5 py-2.5 text-right">
                                <div className="flex items-center justify-end gap-1">
                                    <button onClick={() => handleEdit(cat)} className="p-1.5 text-amber-600 bg-amber-50/50 hover:bg-amber-600 hover:text-white rounded-md transition-all">
                                        <Edit className="w-3.5 h-3.5" />
                                    </button>
                                    <button onClick={() => setDeleteTarget(cat._id)} className="p-1.5 text-rose-600 bg-rose-50/50 hover:bg-rose-600 hover:text-white rounded-md transition-all">
                                        <Trash2 className="w-3.5 h-3.5" />
                                    </button>
                                </div>
                            </td>
                        </tr>
                    )}
                />
            </div>

            {/* Form Modal */}
            <Modal
                isOpen={isFormOpen}
                onClose={() => setIsFormOpen(false)}
                title={editingId ? 'Edit Category' : 'New Category'}
                subtitle="Classification"
                icon={LayoutGrid}
            >
                <form onSubmit={handleSubmit} className="p-5 space-y-4">
                    <div className="space-y-1">
                        <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Category Name</label>
                        <input type="text" value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} placeholder="e.g. Industrial VRV" className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs font-bold text-slate-900 outline-none focus:border-brand transition-all" required />
                        {errors.name && <p className="text-[9px] text-rose-500 font-bold mt-1">{errors.name}</p>}
                    </div>

                    <div className="space-y-1">
                        <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Status</label>
                        <select value={formData.status} onChange={e => setFormData({ ...formData, status: e.target.value })} className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs font-bold text-slate-900 outline-none focus:border-brand transition-all">
                            <option value="active">Active</option>
                            <option value="inactive">Inactive</option>
                        </select>
                    </div>

                    <div className="flex items-center justify-end gap-3 pt-2">
                        <button type="button" onClick={() => setIsFormOpen(false)} className="px-4 py-1.5 text-xs font-bold text-slate-500 hover:bg-slate-100 rounded-lg transition-all">
                            Cancel
                        </button>
                        <button type="submit" className="px-5 py-1.5 text-xs font-bold text-white bg-slate-900 rounded-lg hover:bg-slate-800 transition-all shadow-sm">
                            {editingId ? 'Update' : 'Create'}
                        </button>
                    </div>
                </form>
            </Modal>
        </div>
    )
}

export default Categories
