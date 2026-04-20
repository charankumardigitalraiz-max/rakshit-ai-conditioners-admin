import React, { useEffect } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { useSelector, useDispatch } from 'react-redux'
import { fetchProductById } from '../store/slices/productsSlice'
import { getImageUrl } from '../utils/imageHandler'
import {
  ArrowLeft, Edit, Package, CheckCircle2, Zap, Thermometer,
  Shield, Wrench, Star, Tag, AlertCircle
} from 'lucide-react'

const statusColors = {
  Active: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  Draft: 'bg-slate-100 text-slate-600 border-slate-200',
  'Out of Stock': 'bg-rose-50 text-rose-700 border-rose-200',
}

const SpecRow = ({ label, value }) => {
  if (!value) return null
  return (
    <div className="flex items-start justify-between py-3 px-5 border-b border-slate-100 last:border-0 hover:bg-slate-50/50 transition-colors">
      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest w-40 shrink-0">{label}</span>
      <span className="text-sm font-semibold text-slate-900 text-right">{value}</span>
    </div>
  )
}

const ProductDetails = () => {
  const { id } = useParams()
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const { selectedProduct: product, selectedLoading: loading, selectedError: error } = useSelector(state => state.products)

  useEffect(() => {
    if (id) dispatch(fetchProductById(id))
  }, [dispatch, id])

  if (loading) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="h-8 bg-slate-200 rounded w-48" />
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-1 bg-white rounded-2xl border border-slate-200 h-80" />
          <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200 h-80" />
        </div>
      </div>
    )
  }

  if (error || !product) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-slate-400">
        <AlertCircle className="w-12 h-12 mb-4 text-rose-300" />
        <p className="text-base font-semibold text-slate-600 mb-1">Product not found</p>
        <p className="text-sm text-slate-400 mb-6">{error || 'This product may have been deleted.'}</p>
        <Link to="/products" className="inline-flex items-center gap-2 text-sm font-bold text-brand hover:underline">
          <ArrowLeft className="w-4 h-4" /> Back to Products
        </Link>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Breadcrumb & Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-2 text-sm">
          <Link to="/products" className="text-slate-400 hover:text-brand transition-colors font-medium flex items-center gap-1">
            <ArrowLeft className="w-4 h-4" /> Products
          </Link>
          <span className="text-slate-300">/</span>
          <span className="text-slate-900 font-semibold truncate max-w-[220px]">{product.name}</span>
        </div>
        <button
          onClick={() => navigate(`/products/edit/${product._id}`)}
          className="inline-flex items-center gap-2 bg-brand hover:bg-brand-hover text-white px-4 py-2.5 rounded-lg text-sm font-bold transition-colors shadow-sm shadow-brand/20"
        >
          <Edit className="w-4 h-4" /> Edit Product
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: Image + Identity */}
        <div className="space-y-4">
          {/* Image */}
          <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden aspect-square flex items-center justify-center">
            {product.image ? (
              <img src={getImageUrl(product.image)} alt={product.name} className="w-full h-full object-contain p-4" />
            ) : (
              <div className="flex flex-col items-center gap-3 text-slate-300">
                <Package className="w-16 h-16" />
                <span className="text-sm font-medium">No Image</span>
              </div>
            )}
          </div>

          {/* Identity Card */}
          <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
            <div className="p-5 pb-2 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Status</span>
                <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider border
                  ${product.stockStatus === 'Active' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : ''}
                  ${product.stockStatus === 'Draft' ? 'bg-slate-100 text-slate-600 border-slate-100' : ''}
                  ${product.stockStatus === 'Out of Stock' ? 'bg-rose-50 text-rose-600 border-rose-100' : ''}
                `}>
                  {product.stockStatus || 'Active'}
                </span>
              </div>
              {product.category && (
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Category</span>
                  <span className="text-xs font-semibold text-slate-700 bg-slate-100 px-2.5 py-1 rounded-md border border-slate-200">{product.category}</span>
                </div>
              )}
            </div>
            <div className="border-t border-slate-100">
              {product.series && <SpecRow label="Series" value={product.series} />}
              {product.refrigerant && <SpecRow label="Refrigerant" value={product.refrigerant} />}
              <div className="flex items-center justify-between py-3 px-5 bg-slate-50/50">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Added</span>
                <span className="text-xs text-slate-500 font-medium">{new Date(product.createdAt).toLocaleDateString()}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right: Main Details */}
        <div className="lg:col-span-2 space-y-4">
          {/* Header */}
          <div className="bg-white border border-slate-200 rounded-2xl shadow-sm p-6 text-brand">
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">{product.name}</h1>
            {product.shortDescription && (
              <p className="text-sm text-slate-500 mt-2 leading-relaxed">{product.shortDescription}</p>
            )}
          </div>

          {/* Variants Table */}
          {product.variants?.length > 0 && (
            <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
              <div className="px-6 py-4 border-b border-slate-100 flex items-center gap-2">
                <Tag className="w-4 h-4 text-brand" />
                <h2 className="text-sm font-bold text-slate-900">Variants & Pricing</h2>
                <span className="ml-auto text-[10px] font-bold px-2 py-0.5 bg-brand/10 text-brand rounded-full">{product.variants.length} variants</span>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-brand border-b border-brand-hover">
                    <tr>
                      <th className="px-5 py-3 text-left text-xs font-bold text-white">Capacity</th>
                      <th className="px-5 py-3 text-left text-xs font-bold text-white">SKU</th>
                      <th className="px-5 py-3 text-left text-xs font-bold text-white">ISEER</th>
                      <th className="px-5 py-3 text-left text-xs font-bold text-white">Cooling (Full/Half)</th>
                      <th className="px-5 py-3 text-right text-xs font-bold text-white">Price</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50">
                    {product.variants.map((v, i) => (
                      <tr key={v._id || i} className="hover:bg-slate-50/50 transition-colors">
                        <td className="px-5 py-3.5 font-bold text-slate-900">{v.capacity || '—'}</td>
                        <td className="px-5 py-3.5 text-slate-500 font-mono text-xs">{v.sku || '—'}</td>
                        <td className="px-5 py-3.5 text-slate-600">{v.iseer ? `${v.iseer}` : '—'}</td>
                        <td className="px-5 py-3.5 text-slate-600">
                          {v.coolingCapacityFull || v.coolingCapacityHalf
                            ? `${v.coolingCapacityFull || '—'} / ${v.coolingCapacityHalf || '—'}`
                            : '—'}
                        </td>
                        <td className="px-5 py-3.5 text-right font-bold text-brand">
                          {v.price ? `₹${v.price.toLocaleString()}` : '—'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Features & Specs Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Technical Specs */}
            {product.technicalSpecs && Object.values(product.technicalSpecs).some(Boolean) && (
              <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
                <div className="flex items-center gap-2 p-5 pb-4">
                  <Zap className="w-4 h-4 text-amber-500" />
                  <h2 className="text-sm font-bold text-slate-900">Technical Specs</h2>
                </div>
                <div className="border-t border-slate-100">
                  <SpecRow label="Power Supply" value={product.technicalSpecs.powerSupply} />
                  <SpecRow label="Condenser Coil" value={product.technicalSpecs.condenserCoil} />
                  <SpecRow label="Operating Temp" value={product.technicalSpecs.operatingTemp} />
                </div>
              </div>
            )}

            {/* Warranty */}
            {product.warranty && Object.values(product.warranty).some(Boolean) && (
              <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
                <div className="flex items-center gap-2 p-5 pb-4">
                  <Shield className="w-4 h-4 text-indigo-500" />
                  <h2 className="text-sm font-bold text-slate-900">Warranty</h2>
                </div>
                <div className="border-t border-slate-100">
                  <SpecRow label="Compressor" value={product.warranty.compressor} />
                  <SpecRow label="PCB" value={product.warranty.pcb} />
                  <SpecRow label="Unit Wide" value={product.warranty.unitWide} />
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Bottom Sections: Full Width */}
      <div className="space-y-6">
        {/* Features */}
        {product.features?.length > 0 && (
          <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
            <div className="flex items-center gap-2 p-6 border-b border-slate-100">
              <Star className="w-4 h-4 text-brand" />
              <h2 className="text-sm font-bold text-slate-900">Key Features</h2>
            </div>
            <div className="p-6 bg-slate-50/20">
              <ul className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-x-8 gap-y-4">
                {product.features.map((f, i) => (
                  <li key={i} className="flex items-start gap-3 text-sm text-slate-700">
                    <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0" />
                    <span className="font-medium">{f}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        )}

        {/* Installation */}
        {product.installation && Object.values(product.installation).some(v => v && (typeof v === 'string' ? v : v.length > 0)) && (
          <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
            <div className="flex items-center gap-2 p-6 border-b border-slate-100">
              <Wrench className="w-4 h-4 text-slate-500" />
              <h2 className="text-sm font-bold text-slate-900">Installation Details</h2>
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-2">
              <div className="border-r border-slate-100">
                <SpecRow label="Standard Charges" value={product.installation.standardCharges} />
                <SpecRow label="Outdoor Stand" value={product.installation.outdoorStand} />
              </div>
              <div>
                <SpecRow label="Timeline" value={product.installation.timeline} />
                <SpecRow label="Free Services" value={product.installation.freeServices} />
              </div>
            </div>
            <div className="p-6 grid grid-cols-1 sm:grid-cols-2 gap-8 bg-slate-50/50">
              {product.installation.includes?.length > 0 && (
                <div>
                  <p className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest mb-3">What's Included</p>
                  <div className="flex flex-wrap gap-2">
                    {product.installation.includes.map((item, i) => (
                      <span key={i} className="px-3 py-1 bg-emerald-50 text-emerald-700 rounded-lg border border-emerald-100 text-xs font-bold">{item}</span>
                    ))}
                  </div>
                </div>
              )}
              {product.installation.excludes?.length > 0 && (
                <div>
                  <p className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest mb-3">Not Included</p>
                  <div className="flex flex-wrap gap-2">
                    {product.installation.excludes.map((item, i) => (
                      <span key={i} className="px-3 py-1 bg-rose-50 text-rose-700 rounded-lg border border-rose-100 text-xs font-bold">{item}</span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Detailed Features / Description */}
        {product.detailedFeatures && (
          <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-100 text-slate-400 font-bold text-[10px] uppercase tracking-widest bg-slate-50/30">
              Detailed Product Description
            </div>
            <div className="p-8 text-sm text-slate-600 leading-relaxed max-w-4xl">
              <p className="whitespace-pre-wrap">{product.detailedFeatures}</p>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default ProductDetails
