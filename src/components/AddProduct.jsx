import React, { useState } from 'react'
import { ArrowLeft, Upload, Plus, Trash2, CheckCircle2 } from 'lucide-react'
import { useNavigate, useParams } from 'react-router-dom'
import { useDispatch } from 'react-redux'
import { createProduct, updateProductAsync } from '../store/slices/productsSlice'
import { productsAPI } from '../services/api'
import { getImageUrl } from '../utils/imageHandler'

const AddProduct = () => {
  const navigate = useNavigate()
  const dispatch = useDispatch()
  const { id } = useParams()
  const isEditing = !!id

  const [variants, setVariants] = useState([
    { id: 1, capacity: '1.5 Ton', sku: 'FTKL50TV16', price: '45000', coolingFull: '5.0 kW', coolingHalf: '2.5 kW', powerFull: '1752 W', powerHalf: '615 W', annualPower: '1045 kWh', iseer: '3.70' }
  ])

  const [features, setFeatures] = useState([''])
  const [includes, setIncludes] = useState(['Standard copper pipe (3 meters)'])
  const [excludes, setExcludes] = useState(['Civil work', 'Extra pipe beyond 3 meters'])

  const [formState, setFormState] = useState({
    name: '', category: 'Split AC', series: '', refrigerant: 'R32', stockStatus: 'Active',
    shortDescription: '',
    powerSupply: '1 Phase, 230 V, 50 Hz', condenserCoil: '100% Copper', operatingTemp: 'Stable up to 52°C',
    standardCharges: '', outdoorStand: '', freeServices: '2 free services in the first year',
    compressorWarranty: '10 Years', pcbWarranty: '5 Years', unitWideWarranty: '1 Year',
    detailedFeatures: ''
  })
  const [selectedFile, setSelectedFile] = useState(null)
  const [previewImage, setPreviewImage] = useState(null)

  // Gallery upload state
  const [galleryFiles, setGalleryFiles] = useState([])
  const [galleryPreviews, setGalleryPreviews] = useState([])
  const [existingGallery, setExistingGallery] = useState([])

  const setField = (key, value) => setFormState(prev => ({ ...prev, [key]: value }))

  const addVariant = () => {
    setVariants([...variants, { id: Date.now(), capacity: '', sku: '', price: '', coolingFull: '', coolingHalf: '', powerFull: '', powerHalf: '', annualPower: '', iseer: '' }])
  }

  const removeVariant = (id) => {
    if (variants.length > 1) {
      setVariants(variants.filter(v => v.id !== id))
    }
  }

  const updateVariant = (id, key, val) => {
    setVariants(variants.map(v => v.id === id ? { ...v, [key]: val } : v))
  }

  const addFeature = () => setFeatures([...features, ''])
  const updateFeature = (index, val) => {
    const newFeatures = [...features]
    newFeatures[index] = val
    setFeatures(newFeatures)
  }
  const removeFeature = (index) => {
    if (features.length > 1) setFeatures(features.filter((_, i) => i !== index))
  }

  const addItem = (setter, list) => setter([...list, ''])
  const updateItem = (setter, list, index, val) => {
    const newList = [...list]
    newList[index] = val
    setter(newList)
  }
  const removeItem = (setter, list, index) => {
    if (list.length > 1) setter(list.filter((_, i) => i !== index))
  }

  React.useEffect(() => {
    if (isEditing) {
      productsAPI.getOne(id).then(res => {
        const product = res.data;
        setFormState({
          name: product.name || '',
          category: product.category || 'Room AC',
          series: product.series || '',
          refrigerant: product.refrigerant || 'R32',
          stockStatus: product.stockStatus || 'Active',
          shortDescription: product.shortDescription || '',
          powerSupply: product.technicalSpecs?.powerSupply || '1 Phase, 230 V, 50 Hz',
          condenserCoil: product.technicalSpecs?.condenserCoil || '100% Copper',
          operatingTemp: product.technicalSpecs?.operatingTemp || 'Stable up to 52°C',
          standardCharges: product.installation?.standardCharges || '',
          outdoorStand: product.installation?.outdoorStand || '',
          freeServices: product.installation?.freeServices || '2 free services in the first year',
          compressorWarranty: product.warranty?.compressor || '10 Years',
          pcbWarranty: product.warranty?.pcb || '5 Years',
          unitWideWarranty: product.warranty?.unitWide || '1 Year',
          detailedFeatures: product.detailedFeatures || '',
          image: product.image || ''
        });

        if (product.variants && product.variants.length > 0) {
          setVariants(product.variants.map(v => ({
            id: v._id || v.id || Date.now() + Math.random(),
            capacity: v.capacity || '',
            sku: v.sku || '',
            coolingFull: v.coolingCapacityFull || '',
            coolingHalf: v.coolingCapacityHalf || '',
            powerFull: v.powerConsumptionFull || '',
            powerHalf: v.powerConsumptionHalf || '',
            annualPower: v.annualPowerConsumption || '',
            iseer: v.iseer || '',
            price: v.price || ''
          })));
        }
        if (product.features && product.features.length > 0) {
          setFeatures(product.features);
        }
        if (product.installation?.includes && product.installation.includes.length > 0) {
          setIncludes(product.installation.includes);
        }
        if (product.installation?.excludes && product.installation.excludes.length > 0) {
          setExcludes(product.installation.excludes);
        }
        if (product.images && product.images.length > 0) {
          setExistingGallery(product.images);
        }
      }).catch(err => {
        console.error("Failed to fetch product:", err);
      });
    }
  }, [id, isEditing]);

  const handleSave = async (e) => {
    e.preventDefault()

    try {
      const data = new FormData()
      data.append('name', formState.name)
      data.append('category', formState.category)
      data.append('series', formState.series)
      data.append('refrigerant', formState.refrigerant)
      data.append('stockStatus', formState.stockStatus)
      data.append('shortDescription', formState.shortDescription)
      data.append('detailedFeatures', formState.detailedFeatures)

      // Append main image file if a new one is selected
      if (selectedFile) {
        data.append('imageFile', selectedFile)
      }

      // Always append the current image URL/path as a text field named 'image'
      // This is what the backend uses for the database if no new file is uploaded
      if (formState.image && typeof formState.image === 'string') {
        data.append('image', formState.image)
      }

      // Append new gallery images
      galleryFiles.forEach(file => {
        data.append('imageGallery', file)
      })

      // Send list of existing gallery images to keep (renamed to avoid collision with files)
      data.append('existingImages', JSON.stringify(existingGallery))

      // Map variants to match backend schema
      const mappedVariants = variants.map(v => ({
        capacity: v.capacity,
        sku: v.sku,
        coolingCapacityFull: v.coolingFull,
        coolingCapacityHalf: v.coolingHalf,
        powerConsumptionFull: v.powerFull,
        powerConsumptionHalf: v.powerHalf,
        annualPowerConsumption: v.annualPower,
        iseer: Number(v.iseer) || 0,
        price: Number(v.price) || 0
      }))

      data.append('variants', JSON.stringify(mappedVariants))
      data.append('features', JSON.stringify(features.filter(f => f.trim() !== '')))

      data.append('technicalSpecs', JSON.stringify({
        powerSupply: formState.powerSupply,
        condenserCoil: formState.condenserCoil,
        operatingTemp: formState.operatingTemp,
      }))

      data.append('installation', JSON.stringify({
        standardCharges: formState.standardCharges,
        outdoorStand: formState.outdoorStand,
        freeServices: formState.freeServices,
        includes: includes.filter(i => i.trim() !== ''),
        excludes: excludes.filter(ex => ex.trim() !== ''),
      }))

      data.append('warranty', JSON.stringify({
        compressor: formState.compressorWarranty,
        pcb: formState.pcbWarranty,
        unitWide: formState.unitWideWarranty,
      }))

      if (isEditing) {
        await dispatch(updateProductAsync({ id: id, data })).unwrap()
        toast.success('Product updated successfully!')
      } else {
        await dispatch(createProduct(data)).unwrap()
        toast.success('Product created successfully!')
      }
      navigate('/products')
    } catch (err) {
      toast.error(`Failed to save product: ${err.message || err}`)
    }
  }

  const handleGalleryChange = (e) => {
    const files = Array.from(e.target.files)
    if (files.length > 0) {
      setGalleryFiles(prev => [...prev, ...files])

      files.forEach(file => {
        const reader = new FileReader()
        reader.onloadend = () => {
          setGalleryPreviews(prev => [...prev, reader.result])
        }
        reader.readAsDataURL(file)
      })
    }
  }

  const removeNewGalleryImage = (index) => {
    setGalleryFiles(prev => prev.filter((_, i) => i !== index))
    setGalleryPreviews(prev => prev.filter((_, i) => i !== index))
  }

  const removeExistingGalleryImage = (imageUrl) => {
    setExistingGallery(prev => prev.filter(url => url !== imageUrl))
  }

  return (
    <div className="max-w-5xl mx-auto space-y-6 pb-12">
      <div className="flex items-center gap-4">
        <button onClick={() => navigate(-1)} className="p-2 hover:bg-slate-100 rounded-lg text-slate-500 transition-colors">
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">{isEditing ? 'Edit Air Conditioner' : 'Add New Air Conditioner'}</h1>
          <p className="text-sm text-slate-500 mt-1">{isEditing ? 'Update the details below.' : 'Detailed entry matching manufacturer specifications.'}</p>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="p-6 sm:p-8 sm:px-10">
          <form onSubmit={handleSave} className="space-y-12">

            {/* 1. Basic Information */}
            <section>
              <h3 className="text-sm font-bold text-[#0072bc] uppercase tracking-wider mb-6 border-b border-slate-100 pb-2">1. Basic Information</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div className="space-y-2 sm:col-span-2">
                  <label className="text-sm font-medium text-slate-700">Product Name</label>
                  <input type="text" value={formState.name} onChange={e => setField('name', e.target.value)} placeholder="e.g. Daikin Inverter 3 Star Split AC" className="w-full bg-slate-50 border border-slate-200 focus:bg-white focus:border-[#0072bc] focus:ring-2 focus:ring-blue-100 rounded-lg px-4 py-3 text-sm text-slate-900 outline-none transition-all" required />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-700">Category</label>
                  <select value={formState.category} onChange={e => setField('category', e.target.value)} className="w-full bg-slate-50 border border-slate-200 focus:bg-white focus:border-[#0072bc] focus:ring-2 focus:ring-blue-100 rounded-lg px-4 py-3 text-sm text-slate-900 outline-none transition-all">
                    <option value="Room AC">Room AC</option>
                    <option value="Commercial AC">Commercial AC</option>
                    <option value="Central AC">Central AC</option>
                    <option value="Ventilation">Ventilation</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-700">Series</label>
                  <input type="text" value={formState.series} onChange={e => setField('series', e.target.value)} placeholder="e.g. FTKL / FTKM Series" className="w-full bg-slate-50 border border-slate-200 focus:bg-white focus:border-[#0072bc] focus:ring-2 focus:ring-blue-100 rounded-lg px-4 py-3 text-sm text-slate-900 outline-none transition-all" />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-700">Refrigerant</label>
                  <input type="text" value={formState.refrigerant} onChange={e => setField('refrigerant', e.target.value)} className="w-full bg-slate-50 border border-slate-200 focus:bg-white focus:border-[#0072bc] focus:ring-2 focus:ring-blue-100 rounded-lg px-4 py-3 text-sm text-slate-900 outline-none transition-all" />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-700">Stock Status</label>
                  <select value={formState.stockStatus} onChange={e => setField('stockStatus', e.target.value)} className="w-full bg-slate-50 border border-slate-200 focus:bg-white focus:border-[#0072bc] focus:ring-2 focus:ring-blue-100 rounded-lg px-4 py-3 text-sm text-slate-900 outline-none transition-all">
                    <option value="Active">Active</option>
                    <option value="Draft">Draft</option>
                  </select>
                </div>
                <div className="space-y-2 sm:col-span-2">
                  <label className="text-sm font-medium text-slate-700">Short Description (Quote)</label>
                  <textarea value={formState.shortDescription} onChange={e => setField('shortDescription', e.target.value)} rows="2" placeholder="e.g. Neo swing technology for high efficiency..." className="w-full bg-slate-50 border border-slate-200 focus:bg-white focus:border-[#0072bc] focus:ring-2 focus:ring-blue-100 rounded-lg px-4 py-3 text-sm text-slate-900 outline-none transition-all resize-none"></textarea>
                </div>
              </div>
            </section>

            {/* 2. Technical Specifications (Shared) */}
            <section>
              <h3 className="text-sm font-bold text-[#0072bc] uppercase tracking-wider mb-6 border-b border-slate-100 pb-2">2. Shared Technical Specifications</h3>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-700">Power Supply</label>
                  <input type="text" value={formState.powerSupply} onChange={e => setField('powerSupply', e.target.value)} placeholder="e.g. 1 Phase, 230 V, 50 Hz" className="w-full bg-slate-50 border border-slate-200 focus:bg-white focus:border-[#0072bc] rounded-lg px-4 py-3 text-sm outline-none" />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-700">Condenser Coil</label>
                  <input type="text" value={formState.condenserCoil} onChange={e => setField('condenserCoil', e.target.value)} className="w-full bg-slate-50 border border-slate-200 focus:bg-white focus:border-[#0072bc] rounded-lg px-4 py-3 text-sm outline-none" />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-700">Operating Temp</label>
                  <input type="text" value={formState.operatingTemp} onChange={e => setField('operatingTemp', e.target.value)} placeholder="e.g. Stable up to 52°C" className="w-full bg-slate-50 border border-slate-200 focus:bg-white focus:border-[#0072bc] rounded-lg px-4 py-3 text-sm outline-none" />
                </div>
              </div>
            </section>

            {/* 3. Configurations & Variant Specs */}
            <section>
              <div className="flex items-center justify-between mb-6 border-b border-slate-100 pb-2">
                <h3 className="text-sm font-bold text-[#0072bc] uppercase tracking-wider">3. Configurations & Variant Specifications</h3>
                <button type="button" onClick={addVariant} className="text-xs font-bold text-[#0072bc] flex items-center gap-1 hover:text-blue-800 transition-colors">
                  <Plus className="w-4 h-4" /> Add Capacity Variant
                </button>
              </div>

              <div className="space-y-8">
                {variants.map((v, index) => (
                  <div key={v.id} className="p-6 bg-slate-50 border border-slate-200 rounded-2xl relative space-y-6">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-slate-400 uppercase">Variant #{index + 1}</span>
                      {variants.length > 1 && (
                        <button type="button" onClick={() => removeVariant(v.id)} className="text-xs text-rose-500 font-bold hover:text-rose-700">Remove</button>
                      )}
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                      <div className="space-y-1">
                        <label className="text-[10px] font-bold text-slate-500 uppercase">Capacity</label>
                        <input type="text" placeholder="1.5 Ton" value={v.capacity} onChange={e => updateVariant(v.id, 'capacity', e.target.value)} className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-sm outline-none" />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[10px] font-bold text-slate-500 uppercase">SKU / Model</label>
                        <input type="text" placeholder="FTKL50TV16" value={v.sku} onChange={e => updateVariant(v.id, 'sku', e.target.value)} className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-sm outline-none" />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[10px] font-bold text-slate-500 uppercase">Dealer Price (₹)</label>
                        <input type="number" placeholder="45000" value={v.price} onChange={e => updateVariant(v.id, 'price', e.target.value)} className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-sm outline-none" />
                      </div>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 border-t border-slate-200 pt-4">
                      <div className="space-y-1">
                        <label className="text-[10px] font-bold text-slate-500 uppercase">Cooling (Full/Half)</label>
                        <input type="text" placeholder="5.0 / 2.5 kW" value={v.coolingFull} onChange={e => updateVariant(v.id, 'coolingFull', e.target.value)} className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-sm outline-none" />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[10px] font-bold text-slate-500 uppercase">Power (Full/Half)</label>
                        <input type="text" placeholder="1752 / 615 W" value={v.powerFull} onChange={e => updateVariant(v.id, 'powerFull', e.target.value)} className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-sm outline-none" />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[10px] font-bold text-slate-500 uppercase">ISEER</label>
                        <input type="text" placeholder="3.70" value={v.iseer} onChange={e => updateVariant(v.id, 'iseer', e.target.value)} className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-sm outline-none" />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </section>

            {/* 4. Features & Long Description */}
            <section>
              <div className="flex items-center justify-between mb-6 border-b border-slate-100 pb-2">
                <h3 className="text-sm font-bold text-[#0072bc] uppercase tracking-wider">4. Features & Detailed Content</h3>
                <button type="button" onClick={addFeature} className="text-xs font-bold text-[#0072bc] flex items-center gap-1 hover:text-blue-800 transition-colors">
                  <Plus className="w-4 h-4" /> Add Highlight
                </button>
              </div>
              <div className="space-y-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {features.map((feat, idx) => (
                    <div key={idx} className="flex items-center gap-3 bg-slate-50 p-3 rounded-xl border border-slate-200 group">
                      <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                      <input
                        type="text"
                        value={feat}
                        onChange={(e) => updateFeature(idx, e.target.value)}
                        placeholder="e.g. Coanda Airflow for draftless comfort"
                        className="w-full bg-transparent border-none text-sm outline-none text-slate-700"
                      />
                      <button type="button" onClick={() => removeFeature(idx)} className="opacity-0 group-hover:opacity-100 p-1 text-slate-400 hover:text-rose-500 transition-all">
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-700">Detailed Features (Long Text / Markdown)</label>
                  <textarea value={formState.detailedFeatures} onChange={e => setField('detailedFeatures', e.target.value)} rows="4" placeholder="Comprehensive product story and additional features..." className="w-full bg-slate-50 border border-slate-200 focus:bg-white focus:border-[#0072bc] rounded-lg px-4 py-3 text-sm text-slate-900 outline-none transition-all resize-none"></textarea>
                </div>
              </div>
            </section>

            {/* 5. Installation Scope */}
            <section>
              <h3 className="text-sm font-bold text-[#0072bc] uppercase tracking-wider mb-6 border-b border-slate-100 pb-2">5. Installation & Service Scope</h3>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-8">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-700">Standard Charges</label>
                  <input type="text" value={formState.standardCharges} onChange={e => setField('standardCharges', e.target.value)} placeholder="₹1,500" className="w-full bg-slate-50 border border-slate-200 focus:bg-white focus:border-[#0072bc] rounded-lg px-4 py-3 text-sm outline-none" />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-700">Outdoor Stand Cost</label>
                  <input type="text" value={formState.outdoorStand} onChange={e => setField('outdoorStand', e.target.value)} placeholder="₹750" className="w-full bg-slate-50 border border-slate-200 focus:bg-white focus:border-[#0072bc] rounded-lg px-4 py-3 text-sm outline-none" />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-700">Free Services</label>
                  <input type="text" value={formState.freeServices} onChange={e => setField('freeServices', e.target.value)} placeholder="e.g. 2 Services (1 Year)" className="w-full bg-slate-50 border border-slate-200 focus:bg-white focus:border-[#0072bc] rounded-lg px-4 py-3 text-sm outline-none" />
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-bold text-slate-500 uppercase">What's Included</label>
                    <button type="button" onClick={() => addItem(setIncludes, includes)} className="text-[10px] font-bold text-[#0072bc]">+ Add</button>
                  </div>
                  {includes.map((item, idx) => (
                    <div key={idx} className="flex items-center gap-2">
                      <input value={item} onChange={(e) => updateItem(setIncludes, includes, idx, e.target.value)} className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs outline-none" placeholder="e.g. 10ft Copper Pipe" />
                      <button type="button" onClick={() => removeItem(setIncludes, includes, idx)} className="text-slate-400 hover:text-rose-500"><Trash2 className="w-3.5 h-3.5" /></button>
                    </div>
                  ))}
                </div>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-bold text-slate-500 uppercase">What's Excluded</label>
                    <button type="button" onClick={() => addItem(setExcludes, excludes)} className="text-[10px] font-bold text-[#0072bc]">+ Add</button>
                  </div>
                  {excludes.map((item, idx) => (
                    <div key={idx} className="flex items-center gap-2">
                      <input value={item} onChange={(e) => updateItem(setExcludes, excludes, idx, e.target.value)} className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs outline-none" placeholder="e.g. Core Cutting" />
                      <button type="button" onClick={() => removeItem(setExcludes, excludes, idx)} className="text-slate-400 hover:text-rose-500"><Trash2 className="w-3.5 h-3.5" /></button>
                    </div>
                  ))}
                </div>
              </div>
            </section>

            {/* 6. Warranty & Media */}
            <section>
              <h3 className="text-sm font-bold text-[#0072bc] uppercase tracking-wider mb-6 border-b border-slate-100 pb-2">6. Warranty & Product Image</h3>
              {/* <div className="grid grid-cols-1 sm:grid-cols-2 gap-8"> */}
              <div className="grid grid-cols-1 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-700">Compressor Warranty</label>
                  <input type="text" value={formState.compressorWarranty} onChange={e => setField('compressorWarranty', e.target.value)} placeholder="e.g. 10 Years (1+9)" className="w-full bg-slate-50 border border-slate-200 focus:bg-white focus:border-[#0072bc] rounded-lg px-4 py-3 text-sm outline-none" />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-700">PCB Warranty</label>
                  <input type="text" value={formState.pcbWarranty} onChange={e => setField('pcbWarranty', e.target.value)} placeholder="e.g. 5 Years (1+4)" className="w-full bg-slate-50 border border-slate-200 focus:bg-white focus:border-[#0072bc] rounded-lg px-4 py-3 text-sm outline-none" />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-700">Unit Wide Warranty</label>
                  <input type="text" value={formState.unitWideWarranty} onChange={e => setField('unitWideWarranty', e.target.value)} placeholder="e.g. 1 Year" className="w-full bg-slate-50 border border-slate-200 focus:bg-white focus:border-[#0072bc] rounded-lg px-4 py-3 text-sm outline-none" />
                </div>
              </div>
              <div className="space-y-4 mt-4">
                <div className="space-y-2 max-w-sm">
                  <label className="text-sm font-medium text-slate-700 flex items-center justify-between">
                    Primary Product Image
                    <span className="text-[10px] text-slate-400 font-normal">Recommended: 1000 x 1000 px (White Background)</span>
                  </label>
                  <label className="border-2 border-dashed border-slate-200 rounded-xl p-4 flex flex-col items-center justify-center text-center hover:bg-slate-50 hover:border-[#0072bc]/40 transition-colors cursor-pointer group bg-slate-50/50 h-32 relative overflow-hidden">
                    <input
                      type="file"
                      accept="image/png, image/jpeg, image/jpg, image/webp"
                      className="hidden"
                      onChange={(e) => {
                        const file = e.target.files[0];
                        if (file) {
                          setSelectedFile(file);
                          const reader = new FileReader();
                          reader.onloadend = () => {
                            setPreviewImage(reader.result);
                          };
                          reader.readAsDataURL(file);
                        }
                      }}
                    />
                    
                    {previewImage || formState.image ? (
                      <img src={getImageUrl(previewImage || formState.image)} alt="Preview" className="absolute inset-0 w-full h-full object-contain p-2" />
                    ) : (
                      <>
                        <Upload className="w-6 h-6 text-[#0072bc] mb-2 group-hover:scale-110 transition-transform" />
                        <p className="text-[10px] font-medium text-slate-700">Click to upload main image</p>
                      </>
                    )}
                  </label>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-700 flex items-center justify-between">
                    Product Gallery (Additional Angles)
                    <span className="text-[10px] text-slate-400 font-normal">Min 1000px width recommended</span>
                  </label>
                  <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-4">
                    {/* Existing Gallery Images */}
                    {existingGallery.map((url, idx) => (
                      <div key={`existing-${idx}`} className="relative aspect-square rounded-xl overflow-hidden border border-slate-200 group">
                        <img src={getImageUrl(url)} alt="" className="w-full h-full object-cover" />
                        <button
                          type="button"
                          onClick={() => removeExistingGalleryImage(url)}
                          className="absolute top-1 right-1 p-1 bg-white/90 text-rose-500 rounded-full opacity-0 group-hover:opacity-100 transition-opacity shadow-sm"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ))}

                    {/* New Gallery Previews */}
                    {galleryPreviews.map((url, idx) => (
                      <div key={`new-${idx}`} className="relative aspect-square rounded-xl overflow-hidden border border-brand/20 group">
                        <img src={url} alt="" className="w-full h-full object-cover" />
                        <div className="absolute top-1 left-1 bg-brand text-white text-[8px] font-bold px-1 rounded uppercase">New</div>
                        <button
                          type="button"
                          onClick={() => removeNewGalleryImage(idx)}
                          className="absolute top-1 right-1 p-1 bg-white/90 text-rose-500 rounded-full opacity-0 group-hover:opacity-100 transition-opacity shadow-sm"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ))}

                    {/* Upload Button */}
                    <label className="aspect-square border-2 border-dashed border-slate-200 rounded-xl flex flex-col items-center justify-center hover:bg-slate-50 hover:border-[#0072bc]/40 transition-colors cursor-pointer group bg-slate-50/50">
                      <input
                        type="file"
                        accept="image/png, image/jpeg, image/jpg, image/webp"
                        multiple
                        className="hidden"
                        onChange={handleGalleryChange}
                      />
                      <Plus className="w-6 h-6 text-slate-400 group-hover:text-[#0072bc] group-hover:scale-110 transition-all" />
                      <span className="text-[10px] font-bold text-slate-400 mt-1 uppercase">Add Photo</span>
                    </label>
                  </div>
                </div>
              </div>
            </section>

            {/* Submit Actions */}
            <div className="pt-8 border-t border-slate-200 flex items-center justify-end gap-4 mt-12">
              <button type="button" onClick={() => navigate(-1)} className="px-6 py-3 text-sm font-bold text-slate-600 hover:bg-slate-100 rounded-xl transition-colors border border-transparent">
                Cancel
              </button>
              <button type="submit" className="px-8 py-3 text-sm font-bold text-white bg-[#0072bc] hover:bg-[#002f54] rounded-xl transition-colors shadow-lg shadow-blue-500/20 active:scale-[0.98]">
                Save & Publish Product
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}

export default AddProduct
