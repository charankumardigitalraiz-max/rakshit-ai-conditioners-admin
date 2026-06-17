import React, { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { Save, Plus, Trash2, Upload } from 'lucide-react'
import { fetchServiceApproach, updateServiceApproach } from '../store/slices/serviceApproachSlice'
import { getImageUrl, normalizeImagePath } from '../utils/imageHandler'
import { toast } from 'react-hot-toast'

const emptyPillar = () => ({ title: '', description: '', image: '', order: 0 })
const emptyStep = () => ({ number: '', title: '', description: '', image: '', order: 0 })

const Field = ({ label, hint, children }) => (
  <div className="space-y-1.5">
    <label className="block text-xs font-semibold text-slate-700">{label}</label>
    {children}
    {hint && <p className="text-[11px] text-slate-400 leading-snug">{hint}</p>}
  </div>
)

const inputCls = 'w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-900 outline-none focus:border-brand focus:ring-1 focus:ring-brand/20 transition-all'

const ImageUpload = ({ value, file, onPathChange, onFileChange }) => {
  const preview = file ? URL.createObjectURL(file) : (value ? getImageUrl(value) : null)

  return (
    <div className="flex gap-4 items-start">
      <label className="shrink-0 w-28 h-28 bg-slate-50 border border-dashed border-slate-200 rounded-lg overflow-hidden flex items-center justify-center cursor-pointer hover:border-brand/40 hover:bg-slate-100 transition-all">
        <input type="file" accept="image/*" className="hidden" onChange={(e) => onFileChange(e.target.files?.[0] || null)} />
        {preview ? (
          <img src={preview} alt="" className="w-full h-full object-cover" />
        ) : (
          <Upload className="w-5 h-5 text-slate-300" />
        )}
      </label>
      <div className="flex-1 space-y-1.5">
        <input
          type="text"
          value={value || ''}
          onChange={(e) => onPathChange(normalizeImagePath(e.target.value))}
          placeholder="Image path, e.g. /service/image.png"
          className={inputCls}
        />
        <p className="text-[11px] text-slate-400">Click the box to upload, or enter an image path.</p>
      </div>
    </div>
  )
}

const Section = ({ title, description, children, action }) => (
  <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">
    <div className="px-5 py-4 border-b border-slate-100 bg-slate-50/60 flex items-center justify-between gap-4">
      <div>
        <h2 className="text-sm font-bold text-slate-900">{title}</h2>
        {description && <p className="text-xs text-slate-500 mt-0.5">{description}</p>}
      </div>
      {action}
    </div>
    <div className="p-5">{children}</div>
  </div>
)

const ServiceApproach = () => {
  const dispatch = useDispatch()
  const { data, loading, saving } = useSelector((state) => state.serviceApproach)
  const [form, setForm] = useState(null)
  const [pillarFiles, setPillarFiles] = useState({})
  const [stepFiles, setStepFiles] = useState({})

  useEffect(() => {
    dispatch(fetchServiceApproach())
  }, [dispatch])

  useEffect(() => {
    if (data) {
      setForm({
        hero: { ...data.hero },
        methodology: { ...data.methodology },
        pillars: (data.pillars || []).map((p, i) => ({ ...p, image: normalizeImagePath(p.image || ''), order: p.order ?? i + 1 })),
        roadmap: { ...data.roadmap },
        steps: (data.steps || []).map((s, i) => ({ ...s, image: normalizeImagePath(s.image || ''), order: s.order ?? i + 1 })),
        status: data.status || 'Active',
      })
    }
  }, [data])

  const updateField = (section, field, value) => {
    setForm((prev) => ({ ...prev, [section]: { ...prev[section], [field]: value } }))
  }

  const updateListItem = (listKey, index, field, value) => {
    setForm((prev) => {
      const items = [...prev[listKey]]
      items[index] = { ...items[index], [field]: value }
      return { ...prev, [listKey]: items }
    })
  }

  const addListItem = (listKey, factory) => {
    setForm((prev) => ({ ...prev, [listKey]: [...prev[listKey], factory()] }))
  }

  const removeListItem = (listKey, index) => {
    setForm((prev) => ({ ...prev, [listKey]: prev[listKey].filter((_, i) => i !== index) }))
    if (listKey === 'pillars') {
      setPillarFiles((prev) => {
        const next = { ...prev }
        delete next[index]
        return next
      })
    } else {
      setStepFiles((prev) => {
        const next = { ...prev }
        delete next[index]
        return next
      })
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!form) return

    const payload = new FormData()
    payload.append('data', JSON.stringify(form))
    Object.entries(pillarFiles).forEach(([index, file]) => {
      if (file) payload.append(`pillarImage_${index}`, file)
    })
    Object.entries(stepFiles).forEach(([index, file]) => {
      if (file) payload.append(`stepImage_${index}`, file)
    })

    try {
      await dispatch(updateServiceApproach(payload)).unwrap()
      setPillarFiles({})
      setStepFiles({})
      toast.success('Approach page saved successfully!')
    } catch (err) {
      toast.error(err.message || 'Failed to save')
    }
  }

  if (loading || !form) {
    return (
      <div className="py-20 text-center text-slate-400 text-sm animate-pulse">
        Loading...
      </div>
    )
  }

  return (
    <div className="w-full space-y-6">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900">Our Approach</h1>
          <p className="text-sm text-slate-500 mt-1">Edit the content shown on the Services → Approach page.</p>
        </div>
        <button
          type="button"
          onClick={handleSubmit}
          disabled={saving}
          className="inline-flex items-center gap-2 bg-slate-900 hover:bg-slate-800 text-white px-4 py-2 rounded-lg text-sm font-semibold disabled:opacity-60"
        >
          <Save className="w-4 h-4" />
          {saving ? 'Saving...' : 'Save'}
        </button>
      </div>

      <form onSubmit={handleSubmit} className="w-full space-y-6">
        {/* Page Header */}
        <Section title="Page Header" description="Title and intro text at the top of the approach page.">
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
            <Field label="Eyebrow text" hint="Small label above the title.">
              <input value={form.hero.pre || ''} onChange={(e) => updateField('hero', 'pre', e.target.value)} className={inputCls} placeholder="Engineering Methodology" />
            </Field>
            <Field label="Title">
              <input value={form.hero.title || ''} onChange={(e) => updateField('hero', 'title', e.target.value)} className={inputCls} placeholder="Precision Climate" />
            </Field>
            <Field label="Highlighted word" hint="This part appears in blue on the website.">
              <input value={form.hero.subtitle || ''} onChange={(e) => updateField('hero', 'subtitle', e.target.value)} className={inputCls} placeholder="Approach" />
            </Field>
            <Field label="Status">
              <select value={form.status} onChange={(e) => setForm((prev) => ({ ...prev, status: e.target.value }))} className={inputCls}>
                <option value="Active">Active</option>
                <option value="Inactive">Inactive</option>
              </select>
            </Field>
            <div className="sm:col-span-2 lg:col-span-2">
              <Field label="Description">
                <textarea rows="3" value={form.hero.description || ''} onChange={(e) => updateField('hero', 'description', e.target.value)} className={`${inputCls} resize-none`} />
              </Field>
            </div>
          </div>
        </Section>

        {/* Methodology intro */}
        <Section title="Methodology Section" description="Heading shown above the three pillar cards.">
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            <Field label="Section title">
              <input value={form.methodology.title || ''} onChange={(e) => updateField('methodology', 'title', e.target.value)} className={inputCls} placeholder="Our Core" />
            </Field>
            <Field label="Highlighted word">
              <input value={form.methodology.highlight || ''} onChange={(e) => updateField('methodology', 'highlight', e.target.value)} className={inputCls} placeholder="Methodology" />
            </Field>
            <div className="sm:col-span-2 lg:col-span-3">
              <Field label="Section description">
                <textarea rows="2" value={form.methodology.description || ''} onChange={(e) => updateField('methodology', 'description', e.target.value)} className={`${inputCls} resize-none`} />
              </Field>
            </div>
          </div>
        </Section>

        {/* Pillars */}
        <Section
          title="Methodology Pillars"
          description="Three cards explaining your core approach."
          action={
            <button type="button" onClick={() => addListItem('pillars', emptyPillar)} className="inline-flex items-center gap-1.5 text-xs font-semibold text-brand hover:text-brand/80">
              <Plus className="w-3.5 h-3.5" /> Add pillar
            </button>
          }
        >
          {form.pillars.length === 0 ? (
            <p className="text-sm text-slate-400 text-center py-6">No pillars added yet.</p>
          ) : (
            <div className="grid lg:grid-cols-2 xl:grid-cols-3 gap-5">
              {form.pillars.map((pillar, index) => (
                <div key={index} className="rounded-lg border border-slate-200 p-5 space-y-4 h-full">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-500">Pillar {index + 1}</span>
                    <button type="button" onClick={() => removeListItem('pillars', index)} className="text-xs font-medium text-rose-500 hover:text-rose-600 flex items-center gap-1">
                      <Trash2 className="w-3.5 h-3.5" /> Remove
                    </button>
                  </div>
                  <Field label="Title">
                    <input value={pillar.title || ''} onChange={(e) => updateListItem('pillars', index, 'title', e.target.value)} className={inputCls} />
                  </Field>
                  <Field label="Description">
                    <textarea rows="3" value={pillar.description || ''} onChange={(e) => updateListItem('pillars', index, 'description', e.target.value)} className={`${inputCls} resize-none`} />
                  </Field>
                  <Field label="Image">
                    <ImageUpload
                      value={pillar.image}
                      file={pillarFiles[index]}
                      onPathChange={(v) => updateListItem('pillars', index, 'image', v)}
                      onFileChange={(f) => setPillarFiles((prev) => ({ ...prev, [index]: f }))}
                    />
                  </Field>
                </div>
              ))}
            </div>
          )}
        </Section>

        {/* Roadmap intro */}
        <Section title="Roadmap Section" description="Heading shown above the execution steps.">
          <div className="grid sm:grid-cols-2 gap-5">
            <Field label="Section title">
              <input value={form.roadmap.title || ''} onChange={(e) => updateField('roadmap', 'title', e.target.value)} className={inputCls} placeholder="The Execution Roadmap" />
            </Field>
            <div className="sm:col-span-2">
              <Field label="Section description">
                <textarea rows="2" value={form.roadmap.description || ''} onChange={(e) => updateField('roadmap', 'description', e.target.value)} className={`${inputCls} resize-none`} />
              </Field>
            </div>
          </div>
        </Section>

        {/* Steps */}
        <Section
          title="Roadmap Steps"
          description="Numbered steps in the execution process."
          action={
            <button
              type="button"
              onClick={() => addListItem('steps', () => ({ ...emptyStep(), number: String(form.steps.length + 1).padStart(2, '0') }))}
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-brand hover:text-brand/80"
            >
              <Plus className="w-3.5 h-3.5" /> Add step
            </button>
          }
        >
          {form.steps.length === 0 ? (
            <p className="text-sm text-slate-400 text-center py-6">No steps added yet.</p>
          ) : (
            <div className="grid lg:grid-cols-2 gap-5">
              {form.steps.map((step, index) => (
                <div key={index} className="rounded-lg border border-slate-200 p-5 space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-500">Step {index + 1}</span>
                    <button type="button" onClick={() => removeListItem('steps', index)} className="text-xs font-medium text-rose-500 hover:text-rose-600 flex items-center gap-1">
                      <Trash2 className="w-3.5 h-3.5" /> Remove
                    </button>
                  </div>
                  <div className="grid sm:grid-cols-5 gap-4">
                    <Field label="Step number">
                      <input value={step.number || ''} onChange={(e) => updateListItem('steps', index, 'number', e.target.value)} className={inputCls} placeholder="01" />
                    </Field>
                    <div className="sm:col-span-4">
                      <Field label="Title">
                        <input value={step.title || ''} onChange={(e) => updateListItem('steps', index, 'title', e.target.value)} className={inputCls} />
                      </Field>
                    </div>
                  </div>
                  <Field label="Description">
                    <textarea rows="3" value={step.description || ''} onChange={(e) => updateListItem('steps', index, 'description', e.target.value)} className={`${inputCls} resize-none`} />
                  </Field>
                  <Field label="Image">
                    <ImageUpload
                      value={step.image}
                      file={stepFiles[index]}
                      onPathChange={(v) => updateListItem('steps', index, 'image', v)}
                      onFileChange={(f) => setStepFiles((prev) => ({ ...prev, [index]: f }))}
                    />
                  </Field>
                </div>
              ))}
            </div>
          )}
        </Section>

        <div className="flex justify-end pb-4">
          <button type="submit" disabled={saving} className="inline-flex items-center gap-2 bg-slate-900 hover:bg-slate-800 text-white px-6 py-2.5 rounded-lg text-sm font-semibold disabled:opacity-60">
            <Save className="w-4 h-4" />
            {saving ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </form>
    </div>
  )
}

export default ServiceApproach
