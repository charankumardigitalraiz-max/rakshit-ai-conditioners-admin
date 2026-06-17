import React, { useEffect, useRef, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { Save, Plus, Trash2, ChevronDown, ChevronUp } from 'lucide-react'
import { fetchServiceTraining, updateServiceTraining } from '../store/slices/serviceTrainingSlice'
import { toast } from 'react-hot-toast'

const emptyStat = () => ({ num: '', label: '', order: 0 })
const emptyCourse = () => ({
  title: '',
  category: '',
  duration: '',
  description: '',
  highlightsText: '',
  order: 0,
})

const Field = ({ label, hint, children }) => (
  <div className="space-y-1.5">
    <label className="block text-xs font-semibold text-slate-700">{label}</label>
    {children}
    {hint && <p className="text-[11px] text-slate-400 leading-snug">{hint}</p>}
  </div>
)

const inputCls = 'w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-900 outline-none focus:border-brand focus:ring-1 focus:ring-brand/20 transition-all'

const Section = ({ title, description, children }) => (
  <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">
    <div className="px-5 py-4 border-b border-slate-100 bg-slate-50/60">
      <h2 className="text-sm font-bold text-slate-900">{title}</h2>
      {description && <p className="text-xs text-slate-500 mt-0.5">{description}</p>}
    </div>
    <div className="p-5">{children}</div>
  </div>
)

const AddButton = ({ label, onClick }) => (
  <button
    type="button"
    onClick={onClick}
    className="w-full mt-4 py-3 border border-dashed border-slate-200 rounded-lg text-sm font-semibold text-slate-500 hover:text-brand hover:border-brand/40 hover:bg-brand/5 transition-all inline-flex items-center justify-center gap-2"
  >
    <Plus className="w-4 h-4" />
    {label}
  </button>
)

const ServiceTraining = () => {
  const dispatch = useDispatch()
  const { data, loading, saving } = useSelector((state) => state.serviceTraining)
  const [form, setForm] = useState(null)
  const [expandedCourses, setExpandedCourses] = useState(new Set())
  const newCourseRef = useRef(null)

  useEffect(() => {
    dispatch(fetchServiceTraining())
  }, [dispatch])

  useEffect(() => {
    if (data) {
      const courses = (data.courses || []).map((c, i) => ({
        ...c,
        highlightsText: (c.highlights || []).join('\n'),
        order: c.order ?? i + 1,
      }))
      setForm({
        pageHero: { ...data.pageHero },
        hero: { ...data.hero },
        stats: (data.stats || []).map((s, i) => ({ ...s, order: s.order ?? i + 1 })),
        catalog: { ...data.catalog },
        courses,
        status: data.status || 'Active',
      })
      setExpandedCourses(new Set(courses.map((_, i) => i)))
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
    if (listKey === 'courses') {
      setExpandedCourses((prev) => {
        const next = new Set()
        prev.forEach((i) => {
          if (i < index) next.add(i)
          else if (i > index) next.add(i - 1)
        })
        return next
      })
    }
  }

  const toggleCourse = (index) => {
    setExpandedCourses((prev) => {
      const next = new Set(prev)
      if (next.has(index)) next.delete(index)
      else next.add(index)
      return next
    })
  }

  const handleAddCourse = () => {
    const newIndex = form.courses.length
    addListItem('courses', emptyCourse)
    setExpandedCourses((prev) => new Set([...prev, newIndex]))
    setTimeout(() => {
      newCourseRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' })
    }, 50)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!form) return

    const payload = {
      ...form,
      stats: form.stats.map((s, i) => ({ ...s, order: i + 1 })),
      courses: form.courses.map((c, i) => {
        const { highlightsText, ...rest } = c
        return {
          ...rest,
          highlights: (highlightsText || '')
            .split('\n')
            .map((h) => h.trim())
            .filter(Boolean),
          order: i + 1,
        }
      }),
    }

    try {
      await dispatch(updateServiceTraining(payload)).unwrap()
      toast.success('Training page saved successfully!')
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
    <div className="w-full space-y-6 pb-8">
      <div>
        <h1 className="text-xl font-bold text-slate-900">Training</h1>
        <p className="text-sm text-slate-500 mt-1">Edit the content shown on the Services → Training page.</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <Section title="Page Header" description="Top banner on the Services → Training page">
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <Field label="Eyebrow">
              <input type="text" value={form.pageHero.pre || ''} onChange={(e) => updateField('pageHero', 'pre', e.target.value)} className={inputCls} />
            </Field>
            <Field label="Title">
              <input type="text" value={form.pageHero.title || ''} onChange={(e) => updateField('pageHero', 'title', e.target.value)} className={inputCls} />
            </Field>
            <Field label="Subtitle">
              <input type="text" value={form.pageHero.subtitle || ''} onChange={(e) => updateField('pageHero', 'subtitle', e.target.value)} className={inputCls} />
            </Field>
            <Field label="Status">
              <select value={form.status} onChange={(e) => setForm((prev) => ({ ...prev, status: e.target.value }))} className={inputCls}>
                <option value="Active">Active</option>
                <option value="Inactive">Inactive</option>
              </select>
            </Field>
            <div className="sm:col-span-2 lg:col-span-4">
              <Field label="Description" hint="Shown below the title in the page header">
                <textarea value={form.pageHero.description || ''} onChange={(e) => updateField('pageHero', 'description', e.target.value)} rows={3} className={`${inputCls} resize-none`} />
              </Field>
            </div>
          </div>
        </Section>

        <Section title="Hero Card" description="Dark card section at the top of the training content">
          <div className="grid sm:grid-cols-2 gap-4">
            <Field label="Eyebrow">
              <input type="text" value={form.hero.eyebrow || ''} onChange={(e) => updateField('hero', 'eyebrow', e.target.value)} className={inputCls} />
            </Field>
            <Field label="Title">
              <input type="text" value={form.hero.title || ''} onChange={(e) => updateField('hero', 'title', e.target.value)} className={inputCls} />
            </Field>
            <Field label="CTA Button Text">
              <input type="text" value={form.hero.ctaText || ''} onChange={(e) => updateField('hero', 'ctaText', e.target.value)} className={inputCls} />
            </Field>
            <div className="sm:col-span-2">
              <Field label="Description" hint="Main paragraph in the hero card">
                <textarea value={form.hero.description || ''} onChange={(e) => updateField('hero', 'description', e.target.value)} rows={4} className={`${inputCls} resize-none`} />
              </Field>
            </div>
          </div>
        </Section>

        <Section title="Stats" description="Stat cards shown below the hero">
          {form.stats.length === 0 ? (
            <p className="text-sm text-slate-400 text-center py-4">No stats added yet.</p>
          ) : (
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {form.stats.map((stat, index) => (
                <div key={index} className="rounded-lg border border-slate-200 p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-500">Stat {index + 1}</span>
                    <button type="button" onClick={() => removeListItem('stats', index)} className="text-xs font-medium text-rose-500 hover:text-rose-600 flex items-center gap-1">
                      <Trash2 className="w-3.5 h-3.5" /> Remove
                    </button>
                  </div>
                  <Field label="Number">
                    <input type="text" value={stat.num || ''} onChange={(e) => updateListItem('stats', index, 'num', e.target.value)} className={inputCls} />
                  </Field>
                  <Field label="Label">
                    <input type="text" value={stat.label || ''} onChange={(e) => updateListItem('stats', index, 'label', e.target.value)} className={inputCls} />
                  </Field>
                </div>
              ))}
            </div>
          )}
          <AddButton label="Add stat" onClick={() => addListItem('stats', emptyStat)} />
        </Section>

        <Section title="Course Catalog Header">
          <div className="grid sm:grid-cols-2 gap-4">
            <Field label="Section Title">
              <input type="text" value={form.catalog.title || ''} onChange={(e) => updateField('catalog', 'title', e.target.value)} className={inputCls} />
            </Field>
            <Field label="Section Description">
              <input type="text" value={form.catalog.description || ''} onChange={(e) => updateField('catalog', 'description', e.target.value)} className={inputCls} />
            </Field>
          </div>
        </Section>

        <Section title="Courses" description="Click a course to expand and edit its details">
          {form.courses.length === 0 ? (
            <p className="text-sm text-slate-400 text-center py-4">No courses added yet.</p>
          ) : (
            <div className="space-y-3">
              {form.courses.map((course, index) => {
                const isExpanded = expandedCourses.has(index)
                const isNewest = index === form.courses.length - 1

                return (
                  <div
                    key={index}
                    ref={isNewest ? newCourseRef : null}
                    className={`rounded-lg border overflow-hidden transition-colors ${isExpanded ? 'border-brand/30 bg-white' : 'border-slate-200 bg-slate-50/40'}`}
                  >
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => toggleCourse(index)}
                        className="flex-1 flex items-center justify-between gap-3 px-4 py-3.5 text-left hover:bg-slate-50 transition-colors"
                      >
                        <div className="min-w-0">
                          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Course {index + 1}</p>
                          <p className="text-sm font-semibold text-slate-800 truncate">
                            {course.title || 'Untitled course'}
                          </p>
                          {course.category && !isExpanded && (
                            <p className="text-xs text-slate-500 mt-0.5 truncate">{course.category} · {course.duration}</p>
                          )}
                        </div>
                        {isExpanded ? (
                          <ChevronUp className="w-4 h-4 text-slate-400 shrink-0" />
                        ) : (
                          <ChevronDown className="w-4 h-4 text-slate-400 shrink-0" />
                        )}
                      </button>
                      <button
                        type="button"
                        onClick={() => removeListItem('courses', index)}
                        className="shrink-0 mr-3 text-xs font-medium text-rose-500 hover:text-rose-600 flex items-center gap-1 px-2 py-1 rounded hover:bg-rose-50"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        <span className="hidden sm:inline">Remove</span>
                      </button>
                    </div>

                    {isExpanded && (
                      <div className="px-4 pb-5 pt-1 border-t border-slate-100 space-y-4">
                        <div className="grid sm:grid-cols-2 gap-4">
                          <Field label="Title">
                            <input type="text" value={course.title || ''} onChange={(e) => updateListItem('courses', index, 'title', e.target.value)} className={inputCls} />
                          </Field>
                          <Field label="Category">
                            <input type="text" value={course.category || ''} onChange={(e) => updateListItem('courses', index, 'category', e.target.value)} className={inputCls} />
                          </Field>
                          <Field label="Duration">
                            <input type="text" value={course.duration || ''} onChange={(e) => updateListItem('courses', index, 'duration', e.target.value)} className={inputCls} />
                          </Field>
                          <div className="sm:col-span-2">
                            <Field label="Description">
                              <textarea value={course.description || ''} onChange={(e) => updateListItem('courses', index, 'description', e.target.value)} rows={3} className={`${inputCls} resize-none`} />
                            </Field>
                          </div>
                          <div className="sm:col-span-2">
                            <Field label="Key Takeaways" hint="One highlight per line">
                              <textarea value={course.highlightsText || ''} onChange={(e) => updateListItem('courses', index, 'highlightsText', e.target.value)} rows={4} className={`${inputCls} resize-none`} />
                            </Field>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          )}
          <AddButton label="Add course" onClick={handleAddCourse} />
        </Section>

        <div className="flex justify-end pt-2">
          <button
            type="submit"
            disabled={saving}
            className="inline-flex items-center gap-2 bg-slate-900 hover:bg-slate-800 text-white px-6 py-2.5 rounded-lg text-sm font-semibold disabled:opacity-60"
          >
            <Save className="w-4 h-4" />
            {saving ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </form>
    </div>
  )
}

export default ServiceTraining
