import React, { useState, useEffect } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { Plus, Search, Edit, Trash2, MapPin, X, Upload, Zap } from 'lucide-react'
import { fetchCategories, createCategory, deleteCategoryAsync, updateCategoryAsync } from '../store/slices/categorySlice'
// import { getImageUrl } from '../utils/imageHandler'
import { toast } from 'react-hot-toast'
import DeleteConfirmModal from '../components/DeleteConfirmModal'

const Categories = () => {
    const [isFormOpen, setIsFormOpen] = useState(false)
    const [formData, setFormData] = useState({ name: '', description: '', status: 'active' })
    const [editingId, setEditingId] = useState(null)
    const [selectedFile, setSelectedFile] = useState(null)
    // const [previewImage, setPreviewImage] = useState(null)
    const [errors, setErrors] = useState({})

    const [searchTerm, setSearchTerm] = useState('')
    const [debouncedSearch, setDebouncedSearch] = useState('')
    const [currentPage, setCurrentPage] = useState(1)
    const [deleteTarget, setDeleteTarget] = useState(null)
    const [deleteLoading, setDeleteLoading] = useState(false)
    // const [category, setCategory] = useState('')
    const { items: categorys, loading, error, pagination } = useSelector(state => state.categories)
    const dispatch = useDispatch()

    // Debounce search term
    useEffect(() => {
        const timer = setTimeout(() => {
            setDebouncedSearch(searchTerm)
            setCurrentPage(1)
        }, 500)
        return () => clearTimeout(timer)
    }, [searchTerm])

    useEffect(() => {
        dispatch(fetchCategories({
            page: currentPage,
            limit: 10,
            search: debouncedSearch,
            // category: category
        }))
    }, [dispatch, currentPage, debouncedSearch])

    const handlePageChange = (newPage) => {
        if (newPage >= 1 && newPage <= pagination.pages) {
            setCurrentPage(newPage)
        }
    }

    const validateForm = () => {
        const validationErrors = {}

        if (!formData.name?.trim()) {
            validationErrors.name = 'Category name is required'
        }

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
        Object.keys(formData).forEach(key => {
            data.append(key, formData[key])
        })
        if (selectedFile) {
            data.append('image', selectedFile)
        }

        try {
            if (editingId) {
                await dispatch(updateCategoryAsync({ id: editingId, data })).unwrap()
                toast.success('Category updated successfully!')
            } else {
                await dispatch(createCategory(data)).unwrap()
                toast.success('Category created successfully!')
            }
            setIsFormOpen(false)
            resetForm()
            dispatch(fetchCategories({ page: currentPage, limit: 10, search: debouncedSearch }))
        } catch (err) {
            toast.error(err.message || 'Failed to save category')
        }
    }

    const resetForm = () => {
        setFormData({ name: '', description: '', status: 'active' })
        setEditingId(null)
        setSelectedFile(null)
        // setPreviewImage(null)
    }

    const handleEdit = (category) => {
        setFormData({
            name: category.name,
            description: category.description || '',
            status: category.status || 'active'
        })
        setEditingId(category._id || category.id)
        // setPreviewImage(getImageUrl(category.image))
        setIsFormOpen(true)
    }

    // const onImageChange = (e) => {
    //     const file = e.target.files[0]
    //     if (file) {
    //         setSelectedFile(file)
    //         const reader = new FileReader()
    //         reader.onloadend = () => {
    //             setPreviewImage(reader.result)
    //         }
    //         reader.readAsDataURL(file)
    //     }
    // }

    const handleDelete = async () => {
        if (!deleteTarget) return
        setDeleteLoading(true)
        try {
            await dispatch(deleteCategoryAsync(deleteTarget)).unwrap()
            toast.success('category deleted successfully!')
        } catch {
            toast.error('Failed to delete category')
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
                title="Delete category"
                description="Are you sure you want to delete this category? This will remove their record from the website."
            />

            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Our categorys</h1>
                    <p className="text-sm text-slate-500 mt-1">Manage the categorys and corporate partners displayed on the website.</p>
                </div>
                <button
                    onClick={() => { resetForm(); setIsFormOpen(true); }}
                    className="inline-flex items-center justify-center gap-2 bg-brand hover:bg-brand-hover text-white px-4 py-2.5 rounded-lg text-sm font-medium transition-colors shadow-sm shadow-brand/20"
                >
                    <Plus className="w-4 h-4" />
                    Add category
                </button>
            </div>

            <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
                <div className="px-6 py-4 border-b border-slate-200 bg-white">
                    <div className="relative w-full sm:w-80">
                        <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                        <input
                            type="text"
                            placeholder="Search categorys..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full bg-slate-50 border border-slate-200 focus:border-brand focus:ring-4 focus:ring-brand/5 rounded-xl pl-10 pr-4 py-2.5 text-sm text-slate-700 transition-all outline-none"
                        />
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm whitespace-nowrap">
                        <thead className="bg-brand border-b border-brand-hover">
                            <tr>
                                <th className="px-6 py-4 text-xs font-bold text-white">category</th>
                                <th className="px-6 py-4 text-xs font-bold text-white">Description</th> 
                                <th className="px-6 py-4 text-xs font-bold text-white">Status</th>
                                <th className="px-6 py-4 text-xs font-bold text-white text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {loading && (
                                <tr><td colSpan={4} className="text-center py-12 text-slate-400">Loading categorys...</td></tr>
                            )}
                            {error && (
                                <tr><td colSpan={4} className="text-center py-12 text-rose-500">{error}</td></tr>
                            )}
                            {!loading && categorys.length === 0 && (
                                <tr><td colSpan={4} className="text-center py-12 text-slate-400">No categorys found matching your search.</td></tr>
                            )}
                            {!loading && categorys.map((category) => (
                                <tr key={category._id || category.id} className="hover:bg-slate-50/50 transition-colors">
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-3">
                                            {/* <div className="w-12 h-12 rounded-lg bg-slate-100 border border-slate-200 flex items-center justify-center overflow-hidden p-1">
                                                {category.image ? (
                                                    <img src={getImageUrl(category.image)} alt="" className="w-full h-full object-contain" />
                                                ) : (
                                                    <div className="w-full h-full bg-slate-200 flex items-center justify-center text-xs font-bold text-slate-400">{category.name}</div>
                                                )}
                                            </div> */}
                                            <div className="font-semibold text-slate-900">{category.name}</div>
                                        </div>
                                    </td>
                                                                        <td className="px-6 py-4">
                                        <div className="flex items-center gap-1.5 text-slate-600">
                                            <MapPin className="w-3.5 h-3.5 text-slate-400" />
                                            {category?.description || 'N/A'}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-1.5 text-slate-600">
                                            <MapPin className="w-3.5 h-3.5 text-slate-400" />
                                            {category?.status || 'N/A'}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <div className="flex items-center justify-end gap-2.5">
                                            <button
                                                onClick={() => handleEdit(category)}
                                                title="Edit category"
                                                className="p-2 text-amber-600 bg-amber-50 hover:bg-amber-600 hover:text-white rounded-xl transition-all duration-300 shadow-sm border border-amber-100/50"
                                            >
                                                <Edit className="w-4 h-4" />
                                            </button>
                                            <button
                                                onClick={() => setDeleteTarget(category._id || category.id)}
                                                title="Delete category"
                                                className="p-2 text-rose-600 bg-rose-50 hover:bg-rose-600 hover:text-white rounded-xl transition-all duration-300 shadow-sm border border-rose-100/50"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {/* Pagination */}
                {pagination.pages > 0 && (
                    <div className="p-4 border-t border-slate-200 flex items-center justify-between text-xs text-slate-500 bg-slate-50/30">
                        <div>
                            Showing <span className="font-medium text-slate-900">{(pagination.page - 1) * pagination.limit + 1}</span> to <span className="font-medium text-slate-900">{Math.min(pagination.page * pagination.limit, pagination.total)}</span> of <span className="font-medium text-slate-900">{pagination.total}</span> results
                        </div>
                        <div className="flex items-center gap-1">
                            <button
                                onClick={() => handlePageChange(pagination.page - 1)}
                                disabled={pagination.page <= 1}
                                className="px-3 py-1.5 border border-slate-200 rounded-lg hover:bg-white disabled:opacity-50 transition-all font-medium"
                            >
                                Prev
                            </button>
                            {[...Array(pagination.pages)].map((_, i) => (
                                <button
                                    key={i + 1}
                                    onClick={() => handlePageChange(i + 1)}
                                    className={`w-8 h-8 flex items-center justify-center rounded-lg font-bold transition-all ${pagination.page === i + 1 ? 'bg-brand text-white shadow-md shadow-brand/20' : 'hover:bg-white text-slate-600 border border-transparent'}`}
                                >
                                    {i + 1}
                                </button>
                            ))}
                            <button
                                onClick={() => handlePageChange(pagination.page + 1)}
                                disabled={pagination.page >= pagination.pages}
                                className="px-3 py-1.5 border border-slate-200 rounded-lg hover:bg-white disabled:opacity-50 transition-all font-medium"
                            >
                                Next
                            </button>
                        </div>
                    </div>
                )}
            </div>

            {/* Form Modal */}
            {isFormOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4">
                    <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg max-h-[90vh] flex flex-col overflow-hidden">

                        {/* Header */}
                        <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between">
                            <h2 className="text-lg font-bold text-slate-900">
                                {editingId ? 'Edit Category' : 'Add New Category'}
                            </h2>
                            <button
                                onClick={() => setIsFormOpen(false)}
                                className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-full"
                            >
                                ✕
                            </button>
                        </div>

                        {/* Form */}
                        <div className="p-6 overflow-y-auto flex-1">
                            <form id="categoryForm" onSubmit={handleSubmit} className="space-y-5">

                                {/* Name */}
                                <div>
                                    <label className="text-sm font-medium text-slate-700">
                                        Category Name
                                    </label>
                                    <input
                                        type="text"
                                        value={formData.name}
                                        onChange={e => {
                                            setFormData({ ...formData, name: e.target.value })
                                            if (errors.name) setErrors({ ...errors, name: null })
                                        }}
                                        placeholder="Enter category name"
                                        className="w-full mt-1 bg-slate-50 border border-slate-200 rounded-lg px-4 py-2 text-sm outline-none focus:border-brand"
                                        required
                                    />
                                    {errors.name && (
                                        <p className="mt-2 text-sm text-rose-600">{errors.name}</p>
                                    )}
                                </div>

                                {/* Description */}
                                <div>
                                    <label className="text-sm font-medium text-slate-700">
                                        Description
                                    </label>
                                    <textarea
                                        value={formData.description}
                                        onChange={e => setFormData({ ...formData, description: e.target.value })}
                                        placeholder="Enter description"
                                        rows={3}
                                        className="w-full mt-1 bg-slate-50 border border-slate-200 rounded-lg px-4 py-2 text-sm outline-none focus:border-brand"
                                    />
                                </div>

                                {/* Status */}
                                {editingId && (
                                <div>
                                    <label className="text-sm font-medium text-slate-700">
                                        Status
                                    </label>
                                    <select
                                        value={formData.status}
                                        onChange={e => setFormData({ ...formData, status: e.target.value })}
                                        className="w-full mt-1 bg-slate-50 border border-slate-200 rounded-lg px-4 py-2 text-sm outline-none focus:border-brand"
                                    >
                                        <option value="active">Active</option>
                                        <option value="inactive">Inactive</option>
                                    </select>
                                </div>
                                )}

                            </form>
                        </div>

                        {/* Footer */}
                        <div className="px-6 py-4 border-t border-slate-200 bg-slate-50 flex justify-end gap-3">
                            <button
                                onClick={() => setIsFormOpen(false)}
                                className="px-4 py-2 text-sm text-slate-700 bg-white border rounded-lg"
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                form="categoryForm"
                                className="px-4 py-2 text-sm text-white bg-brand rounded-lg"
                            >
                                {editingId ? 'Update Category' : 'Add Category'}
                            </button>
                        </div>

                    </div>
                </div>
            )}
        </div>
    )
}

export default Categories
