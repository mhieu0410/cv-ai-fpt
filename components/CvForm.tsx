'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { computeAtsScore } from '@/lib/ats-score'
import { motion } from 'framer-motion'
import { getTemplate } from '@/components/cv-templates/registry'
import { getUserPlan } from '@/lib/user-plan'
import SkillSelector from '@/components/cv-editor/SkillSelector'
import ProjectWizard from '@/components/cv-editor/ProjectWizard'
import ActivityPicker from '@/components/cv-editor/ActivityPicker'
import AchievementChecklist from '@/components/cv-editor/AchievementChecklist'
import CompletionCoach from '@/components/cv-editor/CompletionCoach'

// ── Types ─────────────────────────────────────────────────────────────────────

interface Education { school: string; major: string; year: string }
interface Project   { name: string; description: string }
interface Activity  { description: string }

export interface CvContent {
  personal:   { name: string; email: string; phone: string }
  education:  Education[]
  skills:     string[]
  projects:   Project[]
  activities?: Activity[]
}

export interface CvFormData {
  title:   string
  content: CvContent
  template?: string
}

interface EduErr  { school: string; major: string; year: string }
interface ProjErr { name: string; description: string }

interface FormErrors {
  title: string; name: string; email: string; phone: string
  education: EduErr[]; skills: string[]
  projects: ProjErr[]; activities: string[]
}

interface EduTouched  { school: boolean; major: boolean; year: boolean }
interface ProjTouched { name: boolean; description: boolean }

interface Touched {
  title: boolean; name: boolean; email: boolean; phone: boolean
  education: EduTouched[]; skills: boolean[]
  projects: ProjTouched[]; activities: boolean[]
}

interface Props {
  mode: 'create' | 'edit'
  initialData?: CvFormData
  cvId?: string
}

// ── Validation ────────────────────────────────────────────────────────────────

const rule = {
  title:       (s: string) => !s.trim() ? 'Vui lòng nhập tiêu đề CV'
                            : s.trim().length < 3 ? 'Tiêu đề phải có ít nhất 3 ký tự' : '',
  name:        (s: string) => !s.trim() ? 'Vui lòng nhập họ tên'
                            : s.trim().length < 2 ? 'Họ tên phải có ít nhất 2 ký tự'
                            : !/^[\p{L}\s]+$/u.test(s.trim()) ? 'Họ tên chỉ được chứa chữ cái và khoảng trắng' : '',
  email:       (s: string) => !s.trim() ? 'Vui lòng nhập email'
                            : !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(s.trim()) ? 'Email không hợp lệ' : '',
  phone:       (s: string) => !s.trim() ? 'Vui lòng nhập số điện thoại'
                            : !/^0\d{9}$/.test(s.replace(/\s/g, '')) ? 'Phải gồm 10 chữ số, bắt đầu bằng 0' : '',
  school:      (s: string) => !s.trim() ? 'Vui lòng nhập tên trường'
                            : s.trim().length < 2 ? 'Tên trường ít nhất 2 ký tự' : '',
  major:       (s: string) => !s.trim() ? 'Vui lòng nhập chuyên ngành'
                            : s.trim().length < 2 ? 'Chuyên ngành ít nhất 2 ký tự' : '',
  year:        (s: string) => !s.trim() ? 'Vui lòng nhập năm học'
                            : !/^\d{4}-\d{4}$/.test(s.trim()) ? 'Định dạng phải là YYYY-YYYY' : '',
  skill:       (s: string) => !s.trim() ? 'Vui lòng nhập kỹ năng'
                            : s.trim().length < 2 ? 'Kỹ năng ít nhất 2 ký tự' : '',
  projectName: (s: string) => !s.trim() ? 'Vui lòng nhập tên dự án'
                            : s.trim().length < 3 ? 'Tên dự án ít nhất 3 ký tự' : '',
  projectDesc: (s: string) => !s.trim() ? 'Vui lòng nhập mô tả dự án'
                            : s.trim().length < 10 ? 'Mô tả ít nhất 10 ký tự' : '',
  activity:    (s: string) => s.trim() && s.trim().length < 10 ? 'Mô tả ít nhất 10 ký tự' : '',
}

function computeErrors(
  title: string,
  personal: { name: string; email: string; phone: string },
  education: Education[], skills: string[], projects: Project[], activities: Activity[],
): FormErrors {
  return {
    title:      rule.title(title),
    name:       rule.name(personal.name),
    email:      rule.email(personal.email),
    phone:      rule.phone(personal.phone),
    education:  education.map(e => ({ school: rule.school(e.school), major: rule.major(e.major), year: rule.year(e.year) })),
    skills:     skills.map(s => rule.skill(s)),
    projects:   projects.map(p => ({ name: rule.projectName(p.name), description: rule.projectDesc(p.description) })),
    activities: activities.map(a => rule.activity(a.description)),
  }
}

function isFormValid(err: FormErrors) {
  return !err.title && !err.name && !err.email && !err.phone
    && err.education.every(e => !e.school && !e.major && !e.year)
    && err.skills.every(s => !s)
    && err.projects.every(p => !p.name && !p.description)
    && err.activities.every(a => !a)
}

function firstErrorId(err: FormErrors): string {
  if (err.title) return 'field-title'
  if (err.name)  return 'field-name'
  if (err.email) return 'field-email'
  if (err.phone) return 'field-phone'
  for (let i = 0; i < err.education.length; i++) {
    if (err.education[i].school) return `field-edu-${i}-school`
    if (err.education[i].major)  return `field-edu-${i}-major`
    if (err.education[i].year)   return `field-edu-${i}-year`
  }
  for (let i = 0; i < err.skills.length;  i++) if (err.skills[i])              return `field-skill-${i}`
  for (let i = 0; i < err.projects.length; i++) {
    if (err.projects[i].name)        return `field-project-${i}-name`
    if (err.projects[i].description) return `field-project-${i}-desc`
  }
  for (let i = 0; i < err.activities.length; i++) if (err.activities[i]) return `field-activity-${i}`
  return ''
}

// ── UI helpers ────────────────────────────────────────────────────────────────

function fieldCls(bg: string, hasErr: boolean, isHighlighted: boolean, extra = '') {
  const base = `w-full bg-white border-2 border-black text-black rounded-xl px-4 py-3 focus:outline-none placeholder-zinc-400 text-[14px] font-bold transition-all shadow-[2px_2px_0_0_#000] hover:shadow-[4px_4px_0_0_#000] focus:shadow-none focus:translate-y-[2px] focus:translate-x-[2px] ${extra}`
  if (isHighlighted) return `${base} ring-4 ring-red-500/20 border-red-500`
  if (hasErr)        return `${base} border-red-500 bg-red-50`
  return `${base}`
}

function ErrMsg({ msg }: { msg: string }) {
  if (!msg) return null
  return <p className="text-red-500 text-[13px] font-medium mt-1.5">{msg}</p>
}

function SectionHeader({ title, onAdd, index }: { title: string; onAdd: () => void; index: string }) {
  return (
    <div className="flex items-center justify-between mb-4">
      <h2 className="text-zinc-900 font-black text-2xl tracking-tighter uppercase flex items-center gap-3"><span className="text-[var(--fpt-orange)] px-2 bg-yellow-300 border-2 border-black shadow-[2px_2px_0_0_#000] rounded">{index}.</span> {title}</h2>
      <button type="button" onClick={onAdd} className="text-[12px] font-black uppercase tracking-widest bg-yellow-300 border-2 border-black text-black hover:bg-[var(--fpt-orange)] hover:text-white px-4 py-2 rounded-xl shadow-[2px_2px_0_0_#000] hover:shadow-[4px_4px_0_0_#000] transition-all hover:-translate-y-0.5 active:translate-y-0.5 active:shadow-none">
        + Thêm
      </button>
    </div>
  )
}

function RemoveBtn({ onClick }: { onClick: () => void }) {
  return (
    <button type="button" onClick={onClick}
      className="absolute top-6 right-6 text-black border-2 border-black bg-zinc-100 hover:bg-red-400 hover:text-white shadow-[2px_2px_0_0_#000] hover:shadow-none hover:translate-y-0.5 rounded-full p-1.5 transition-all"
      aria-label="Xóa">
      <svg className="w-4 h-4 stroke-[3px]" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
    </button>
  )
}

function MagicTextarea({
  id,
  value,
  onChange,
  onBlur,
  placeholder,
  hasError,
  isHighlighted,
  isPro,
}: {
  id: string
  value: string
  onChange: (v: string) => void
  onBlur: () => void
  placeholder: string
  hasError: boolean
  isHighlighted: boolean
  isPro?: boolean
}) {
  const router = useRouter()
  const [isGenerating, setIsGenerating] = useState(false)
  const [aiText, setAiText] = useState('')
  const [showAi, setShowAi] = useState(false)

  const handleMagic = async () => {
    if (!value.trim()) return
    if (!isPro) {
      router.push('/upgrade')
      return
    }
    setIsGenerating(true)
    setShowAi(true)
    setAiText('')

    // TODO: Thay bằng API thật khi triển khai monetization (gọi endpoint AI của bạn)
    const fakeResponse = `Đã tham gia thiết kế và tối ưu hoá dự án, ứng dụng các best practices để cải thiện 30% hiệu năng. ${value.slice(0, 30)}...`

    // Simulate typing
    for (let i = 0; i <= fakeResponse.length; i++) {
      await new Promise(r => setTimeout(r, 20))
      setAiText(fakeResponse.slice(0, i))
    }
    setIsGenerating(false)
  }

  return (
    <div className="relative group/magic">
      <div className={`relative transition-all duration-300 rounded-xl ${showAi ? 'p-[2px] bg-gradient-to-r from-orange-400 via-yellow-400 to-orange-400 animate-pulse' : ''}`}>
        <textarea
          id={id}
          value={showAi ? aiText : value}
          onChange={e => {
            if (showAi) return // Disable typing while AI is showing
            onChange(e.target.value)
          }}
          onBlur={onBlur}
          placeholder={placeholder}
          rows={4}
          className={fieldCls('', hasError && !showAi, isHighlighted, 'resize-none leading-relaxed relative z-10 w-full')}
          disabled={isGenerating}
        />

        {!showAi && (
          <button
            type="button"
            onClick={handleMagic}
            className={`absolute bottom-4 right-4 ${isPro ? 'bg-zinc-900 text-white hover:bg-[var(--fpt-orange)]' : 'bg-yellow-400 text-black border-2 border-black'} px-3 py-2 rounded-xl shadow-lg opacity-0 group-hover/magic:opacity-100 transition-all hover:scale-110 z-20 flex items-center gap-1.5 font-bold text-[11px] uppercase tracking-widest`}
            title={isPro ? 'Sửa văn phong bằng AI' : 'Nâng cấp Pro để mở khóa'}
          >
            🪄 {isPro ? 'AI Tối Ưu' : 'Pro'}
          </button>
        )}
      </div>

      {showAi && !isGenerating && (
        <div className="flex items-center gap-2 mt-3 justify-end">
          <button
            type="button"
            onClick={() => {
              onChange(aiText)
              setShowAi(false)
            }}
            className="text-xs font-bold bg-zinc-900 text-white px-4 py-2 rounded-lg shadow-md hover:bg-black transition-colors flex items-center gap-1"
          >
            <span className="text-green-400">✓</span> Áp dụng
          </button>
          <button
            type="button"
            onClick={() => {
              setShowAi(false)
            }}
            className="text-xs font-bold bg-white border border-zinc-200 text-zinc-600 px-4 py-2 rounded-lg hover:bg-zinc-50 transition-colors"
          >
            Từ chối
          </button>
        </div>
      )}
    </div>
  )
}

// ── Component ─────────────────────────────────────────────────────────────────

export default function CvForm({ mode, initialData, cvId }: Props) {
  const router = useRouter()
  const [authLoading, setAuthLoading] = useState(true)
  const [saving, setSaving]           = useState(false)
  const [saveError, setSaveError]     = useState('')
  const [limitReached, setLimitReached] = useState(false)
  const [highlighted, setHighlighted] = useState('')
  const [isPro, setIsPro]             = useState(false)
  const [wizardOpen, setWizardOpen]   = useState(false)
  const [ideasOpen, setIdeasOpen]     = useState(false)
  const [industryKey, setIndustryKey] = useState<string | null>(null)

  // ── Seed form state from initialData (edit) or blank (create) ─────────────
  const initEdu   = initialData?.content.education?.length  ? initialData.content.education  : [{ school: '', major: '', year: '' }]
  const initSkills = initialData?.content.skills ?? []
  const initProjs  = initialData?.content.projects ?? []
  const initActs   = initialData?.content.activities ?? []

  const [title,      setTitle]      = useState(initialData?.title ?? '')
  const [personal,   setPersonal]   = useState(initialData?.content.personal ?? { name: '', email: '', phone: '' })
  const [education,  setEducation]  = useState<Education[]>(initEdu)
  const [skills,     setSkills]     = useState<string[]>(initSkills)
  const [projects,   setProjects]   = useState<Project[]>(initProjs)
  const [activities, setActivities] = useState<Activity[]>(initActs)

  const [touched, setTouched] = useState<Touched>({
    title: false, name: false, email: false, phone: false,
    education:  initEdu.map(() => ({ school: false, major: false, year: false })),
    skills:     initSkills.map(() => false),
    projects:   initProjs.map(() => ({ name: false, description: false })),
    activities: initActs.map(() => false),
  })

  const errors = computeErrors(title, personal, education, skills, projects, activities)
  const valid  = isFormValid(errors)

  // Độ hoàn thiện CV (ước tính ATS) — tính realtime từ state hiện tại
  const strength = computeAtsScore({ personal, education, skills, projects, activities }, title)

  useEffect(() => {
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      if (!session) router.push('/login')
      else {
        const plan = await getUserPlan(supabase, session.user.id)
        setIsPro(plan.isPro)
        setAuthLoading(false)
      }
    })
  }, [router])

  // ── Touch helpers ─────────────────────────────────────────────────────────

  const touch = (field: 'title' | 'name' | 'email' | 'phone') =>
    setTouched(t => ({ ...t, [field]: true }))

  const touchEdu = (i: number, field: keyof EduTouched) =>
    setTouched(t => ({ ...t, education: t.education.map((e, idx) => idx === i ? { ...e, [field]: true } : e) }))

  const touchProject = (i: number, field: keyof ProjTouched) =>
    setTouched(t => ({ ...t, projects: t.projects.map((p, idx) => idx === i ? { ...p, [field]: true } : p) }))

  const touchActivity = (i: number) =>
    setTouched(t => ({ ...t, activities: t.activities.map((a, idx) => idx === i ? true : a) }))

  // ── Array operations ──────────────────────────────────────────────────────

  const addEducation = () => {
    setEducation(p => [...p, { school: '', major: '', year: '' }])
    setTouched(t => ({ ...t, education: [...t.education, { school: false, major: false, year: false }] }))
  }
  const removeEducation = (i: number) => {
    setEducation(p => p.filter((_, idx) => idx !== i))
    setTouched(t => ({ ...t, education: t.education.filter((_, idx) => idx !== i) }))
  }
  const updateEducation = (i: number, field: keyof Education, val: string) =>
    setEducation(p => p.map((e, idx) => idx === i ? { ...e, [field]: val } : e))

  const addProject = () => {
    setProjects(p => [...p, { name: '', description: '' }])
    setTouched(t => ({ ...t, projects: [...t.projects, { name: false, description: false }] }))
  }
  const removeProject = (i: number) => {
    setProjects(p => p.filter((_, idx) => idx !== i))
    setTouched(t => ({ ...t, projects: t.projects.filter((_, idx) => idx !== i) }))
  }
  const updateProject = (i: number, field: keyof Project, val: string) =>
    setProjects(p => p.map((proj, idx) => idx === i ? { ...proj, [field]: val } : proj))

  const addActivity = () => {
    setActivities(p => [...p, { description: '' }])
    setTouched(t => ({ ...t, activities: [...t.activities, false] }))
  }
  const removeActivity = (i: number) => {
    setActivities(p => p.filter((_, idx) => idx !== i))
    setTouched(t => ({ ...t, activities: t.activities.filter((_, idx) => idx !== i) }))
  }
  const updateActivity = (i: number, val: string) =>
    setActivities(p => p.map((a, idx) => idx === i ? { description: val } : a))

  // ── Handlers cho wizard / pickers ─────────────────────────────────────────
  const addProjectFromWizard = (proj: Project) => {
    setProjects(p => [...p, proj])
    setTouched(t => ({ ...t, projects: [...t.projects, { name: true, description: true }] }))
  }
  const addActivityText = (text: string) => {
    setActivities(p => [...p, { description: text }])
    setTouched(t => ({ ...t, activities: [...t.activities, true] }))
  }
  const addActivityTexts = (texts: string[]) => {
    setActivities(p => [...p, ...texts.map(text => ({ description: text }))])
    setTouched(t => ({ ...t, activities: [...t.activities, ...texts.map(() => true)] }))
  }

  // ── Submit ────────────────────────────────────────────────────────────────

  async function handleSave() {
    if (!valid) {
      setTouched({
        title: true, name: true, email: true, phone: true,
        education:  education.map(() => ({ school: true, major: true, year: true })),
        skills:     skills.map(() => true),
        projects:   projects.map(() => ({ name: true, description: true })),
        activities: activities.map(() => true),
      })
      const id = firstErrorId(errors)
      if (id) {
        document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'center' })
        setHighlighted(id)
        setTimeout(() => setHighlighted(''), 2000)
      }
      return
    }

    setSaveError('')
    setLimitReached(false)
    setSaving(true)

    const content: CvContent = {
      personal,
      education:  education.filter(e => e.school || e.major || e.year),
      skills:     skills.filter(s => s.trim()),
      projects:   projects.filter(p => p.name || p.description),
      activities: activities.filter(a => a.description),
    }

    if (mode === 'create') {
      const res = await fetch('/api/cvs/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: title.trim(), content }),
      })
      const json = await res.json()
      setSaving(false)

      if (!res.ok) {
        if (res.status === 401) { router.push('/login'); return }
        if (json.error === 'free_limit_reached') { setLimitReached(true); return }
        setSaveError(json.error ?? 'Lưu CV thất bại.')
        return
      }
      router.push('/dashboard?success=1')
    } else {
      const res = await fetch(`/api/cvs/${cvId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: title.trim(), content }),
      })
      const json = await res.json()
      setSaving(false)

      if (!res.ok) {
        if (res.status === 401) { router.push('/login'); return }
        setSaveError(json.error ?? 'Cập nhật CV thất bại.')
        return
      }
      router.push('/dashboard?updated=1')
    }
  }

  // ── Render ────────────────────────────────────────────────────────────────

  if (authLoading) {
    return (
      <div className="min-h-screen bg-zinc-50 flex items-center justify-center">
        <div className="w-8 h-8 border-[3px] border-zinc-300 border-t-[var(--fpt-orange)] rounded-full animate-spin" />
      </div>
    )
  }

  const hi = highlighted

  // Live Preview Data
  const currentTemplateId = initialData?.template || 'classic'
  const { Preview } = getTemplate(currentTemplateId)

  const contentPreview: CvContent = {
    personal,
    education,
    skills,
    projects,
    activities,
  }

  return (
    <div className="h-screen w-full flex flex-col bg-zinc-50 overflow-hidden relative">

      {/* ── TOP BAR (Neo-Brutalism) ── */}
      <header className="h-20 w-full bg-white border-b-4 border-black flex items-center justify-between px-4 md:px-6 z-50 shrink-0 shadow-[0_4px_0_0_#000]">
        <div className="flex items-center gap-4 w-1/3">
          <button onClick={() => router.push('/dashboard')} className="text-black font-black uppercase tracking-widest text-[13px] px-4 py-2.5 border-2 border-black rounded-xl hover:-translate-y-1 hover:shadow-[4px_4px_0_0_#000] active:translate-y-0 active:shadow-none transition-all flex items-center gap-2 bg-zinc-100">
            <span className="hidden md:inline">← Dashboard</span>
            <span className="md:hidden">←</span>
          </button>
        </div>

        <div className="flex-1 flex flex-col justify-center items-center w-1/3">
           <input
             id="field-title"
             value={title}
             onChange={e => setTitle(e.target.value)}
             onBlur={() => touch('title')}
             placeholder="Tên file CV..."
             className={`bg-zinc-100 border-2 border-black rounded-xl text-center font-black text-base md:text-lg placeholder-zinc-400 focus:outline-none focus:ring-0 w-full max-w-[400px] hover:bg-zinc-200 focus:bg-white px-4 py-2 transition-colors truncate shadow-[2px_2px_0_0_#000] ${touched.title && errors.title ? 'border-red-500 bg-red-50' : ''} ${hi === 'field-title' ? 'ring-4 ring-red-500/20 border-red-500' : ''}`}
           />
           {touched.title && errors.title && (
             <span className="text-red-500 text-[11px] font-medium mt-0.5 hidden md:block">{errors.title}</span>
           )}
        </div>

        <div className="flex items-center justify-end gap-3 md:gap-4 w-1/3">
           {saving ? (
             <span className="text-[var(--fpt-orange)] text-[13px] font-bold animate-pulse whitespace-nowrap hidden md:block">Đang lưu...</span>
           ) : saveError ? (
             <span className="text-red-500 text-[13px] font-bold whitespace-nowrap hidden md:block">{saveError}</span>
           ) : limitReached ? (
             <span className="text-red-500 text-[13px] font-bold whitespace-nowrap hidden md:block">Hết hạn mức</span>
           ) : (
              <span className="text-green-600 font-black text-[13px] uppercase tracking-widest hidden md:block opacity-0">✓ Đã lưu</span>
           )}

           <button onClick={handleSave} disabled={saving} className="bg-[var(--fpt-orange)] text-white font-black uppercase tracking-widest text-[12px] md:text-[13px] px-5 md:px-6 py-2.5 border-2 border-black rounded-xl shadow-[4px_4px_0_0_#000] hover:-translate-y-1 hover:shadow-[6px_6px_0_0_#000] active:translate-y-0 active:shadow-none transition-all disabled:opacity-50 whitespace-nowrap">
             Lưu CV
           </button>

           {cvId && (
             <button onClick={() => router.push(`/cv/${cvId}/view`)} className="bg-black text-white font-black uppercase tracking-widest text-[12px] md:text-[13px] px-5 md:px-6 py-2.5 border-2 border-black rounded-xl shadow-[4px_4px_0_0_var(--fpt-orange)] hover:-translate-y-1 hover:shadow-[6px_6px_0_0_var(--fpt-orange)] active:translate-y-0 active:shadow-none transition-all hidden lg:block whitespace-nowrap">
               Xuất PDF →
             </button>
           )}
        </div>
      </header>

      {/* Wizard tạo dự án (Feature 2) */}
      <ProjectWizard open={wizardOpen} onClose={() => setWizardOpen(false)} onComplete={addProjectFromWizard} industryKey={industryKey} />

      {/* ── MAIN WORKSPACE ── */}
      <div className="flex-1 w-full flex overflow-hidden">

        {/* ── BÊN TRÁI: Form Nhập Liệu (Focus Mode) ── */}
        <div className="w-full lg:w-[45%] xl:w-[42%] flex flex-col h-full bg-[#f8f9fa] border-r-4 border-black z-10 relative">

        {/* Form Body */}
        <div data-lenis-prevent className="flex-1 overflow-y-auto p-6 lg:p-10 scroll-smooth pb-32">
          <div className="max-w-[600px] mx-auto">
            {/* Trợ lý hoàn thiện CV (Feature 7) */}
            <CompletionCoach result={strength} />

            {/* ── Thông tin cá nhân ── */}
            <section className="mb-12">
              <h2 className="text-zinc-900 font-black text-2xl tracking-tighter uppercase mb-6 flex items-center gap-3"><span className="text-[var(--fpt-orange)] px-2 bg-yellow-300 border-2 border-black shadow-[2px_2px_0_0_#000] rounded">01.</span> Thông tin cá nhân</h2>
              <div className="bg-white border-4 border-black shadow-[8px_8px_0_0_#000] rounded-[2.5rem] p-8 md:p-10 flex flex-col gap-6 transition-all duration-500 focus-within:-translate-y-1 focus-within:shadow-[12px_12px_0_0_#000]">
                <div>
                  <label htmlFor="field-name" className="text-zinc-500 text-[13px] font-semibold mb-1.5 block">Họ và tên</label>
                  <input
                    id="field-name" type="text" value={personal.name}
                    onChange={e => setPersonal({ ...personal, name: e.target.value })}
                    onBlur={() => touch('name')}
                    placeholder="Nguyễn Văn A"
                    className={fieldCls('', touched.name && !!errors.name, hi === 'field-name')}
                  />
                  {touched.name && <ErrMsg msg={errors.name} />}
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="field-email" className="text-zinc-500 text-[13px] font-semibold mb-1.5 block">Email</label>
                    <input
                      id="field-email" type="email" value={personal.email}
                      onChange={e => setPersonal({ ...personal, email: e.target.value })}
                      onBlur={() => touch('email')}
                      placeholder="you@fpt.edu.vn"
                      className={fieldCls('', touched.email && !!errors.email, hi === 'field-email')}
                    />
                    {touched.email && <ErrMsg msg={errors.email} />}
                  </div>
                  <div>
                    <label htmlFor="field-phone" className="text-zinc-500 text-[13px] font-semibold mb-1.5 block">Số điện thoại</label>
                    <input
                      id="field-phone" type="tel" value={personal.phone}
                      onChange={e => setPersonal({ ...personal, phone: e.target.value })}
                      onBlur={() => touch('phone')}
                      placeholder="0901234567"
                      className={fieldCls('', touched.phone && !!errors.phone, hi === 'field-phone')}
                    />
                    {touched.phone && <ErrMsg msg={errors.phone} />}
                  </div>
                </div>
              </div>
            </section>

            {/* ── Học vấn ── */}
            <section className="mb-10">
              <SectionHeader title="Học vấn" onAdd={addEducation} index="02" />
              <div className="flex flex-col gap-6">
                {education.map((edu, i) => (
                  <div key={i} className="bg-white border-4 border-black shadow-[8px_8px_0_0_#000] rounded-[2.5rem] p-8 md:p-10 relative transition-all duration-500 focus-within:-translate-y-1 focus-within:shadow-[12px_12px_0_0_#000]">
                    {education.length > 1 && <RemoveBtn onClick={() => removeEducation(i)} />}
                    <div className="flex flex-col gap-6">
                      <div>
                        <label className="text-zinc-500 text-[13px] font-semibold mb-1.5 block">Tên trường</label>
                        <input
                          id={`field-edu-${i}-school`} type="text" value={edu.school}
                          onChange={e => updateEducation(i, 'school', e.target.value)}
                          onBlur={() => touchEdu(i, 'school')}
                          placeholder="Đại học FPT"
                          className={fieldCls('', !!touched.education[i]?.school && !!errors.education[i]?.school, hi === `field-edu-${i}-school`)}
                        />
                        {touched.education[i]?.school && <ErrMsg msg={errors.education[i]?.school ?? ''} />}
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="text-zinc-500 text-[13px] font-semibold mb-1.5 block">Chuyên ngành</label>
                          <input
                            id={`field-edu-${i}-major`} type="text" value={edu.major}
                            onChange={e => updateEducation(i, 'major', e.target.value)}
                            onBlur={() => touchEdu(i, 'major')}
                            placeholder="Kỹ thuật phần mềm"
                            className={fieldCls('', !!touched.education[i]?.major && !!errors.education[i]?.major, hi === `field-edu-${i}-major`)}
                          />
                          {touched.education[i]?.major && <ErrMsg msg={errors.education[i]?.major ?? ''} />}
                        </div>
                        <div>
                          <label className="text-zinc-500 text-[13px] font-semibold mb-1.5 block">Năm học</label>
                          <input
                            id={`field-edu-${i}-year`} type="text" value={edu.year}
                            onChange={e => updateEducation(i, 'year', e.target.value)}
                            onBlur={() => touchEdu(i, 'year')}
                            placeholder="2021-2025"
                            className={fieldCls('', !!touched.education[i]?.year && !!errors.education[i]?.year, hi === `field-edu-${i}-year`)}
                          />
                          {touched.education[i]?.year && <ErrMsg msg={errors.education[i]?.year ?? ''} />}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </section>

            {/* ── Kỹ năng (Feature 1: chip selector) ── */}
            <section className="mb-10">
              <h2 className="text-zinc-900 font-black text-2xl tracking-tighter uppercase mb-4 flex items-center gap-3">
                <span className="text-[var(--fpt-orange)] px-2 bg-yellow-300 border-2 border-black shadow-[2px_2px_0_0_#000] rounded">03.</span> Kỹ năng
              </h2>
              <SkillSelector value={skills} onChange={setSkills} industryKey={industryKey} onIndustryChange={setIndustryKey} />
            </section>

            {/* ── Dự án (Feature 2+6: wizard) ── */}
            <section className="mb-10">
              <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
                <h2 className="text-zinc-900 font-black text-2xl tracking-tighter uppercase flex items-center gap-3">
                  <span className="text-[var(--fpt-orange)] px-2 bg-yellow-300 border-2 border-black shadow-[2px_2px_0_0_#000] rounded">04.</span> Dự án
                </h2>
                <div className="flex gap-2">
                  <button type="button" onClick={() => setWizardOpen(true)} className="text-[12px] font-black uppercase tracking-widest bg-[var(--fpt-orange)] border-2 border-black text-white px-4 py-2 rounded-xl shadow-[2px_2px_0_0_#000] hover:-translate-y-0.5 active:translate-y-0 active:shadow-none transition-all">
                    🚀 Dùng trợ lý
                  </button>
                  <button type="button" onClick={addProject} className="text-[12px] font-black uppercase tracking-widest bg-white border-2 border-black text-black px-4 py-2 rounded-xl shadow-[2px_2px_0_0_#000] hover:-translate-y-0.5 active:translate-y-0 active:shadow-none transition-all">
                    + Thủ công
                  </button>
                </div>
              </div>
              {projects.length === 0 && (
                <button
                  type="button"
                  onClick={() => setWizardOpen(true)}
                  className="mb-6 w-full rounded-[2rem] border-4 border-dashed border-zinc-300 bg-white p-8 text-center transition-all hover:-translate-y-1 hover:border-black hover:shadow-[8px_8px_0_0_#000]"
                >
                  <p className="mb-2 text-3xl">🚀</p>
                  <p className="font-black text-zinc-700">Chưa có dự án nào</p>
                  <p className="mt-1 text-sm font-bold text-zinc-400">Bấm để dùng trợ lý — trả lời vài câu, hệ thống tự viết mô tả cho bạn.</p>
                </button>
              )}
              <div className="flex flex-col gap-6">
                {projects.map((project, i) => (
                  <div key={i} className="bg-white border-4 border-black shadow-[8px_8px_0_0_#000] rounded-[2.5rem] p-8 md:p-10 relative transition-all duration-500 focus-within:-translate-y-1 focus-within:shadow-[12px_12px_0_0_#000]">
                    {projects.length > 1 && <RemoveBtn onClick={() => removeProject(i)} />}
                    <div className="flex flex-col gap-6">
                      <div>
                        <label className="text-zinc-500 text-[13px] font-semibold mb-1.5 block">Tên project</label>
                        <input
                          id={`field-project-${i}-name`} type="text" value={project.name}
                          onChange={e => updateProject(i, 'name', e.target.value)}
                          onBlur={() => touchProject(i, 'name')}
                          placeholder="CV AI for FPT Students"
                          className={fieldCls('', !!touched.projects[i]?.name && !!errors.projects[i]?.name, hi === `field-project-${i}-name`)}
                        />
                        {touched.projects[i]?.name && <ErrMsg msg={errors.projects[i]?.name ?? ''} />}
                      </div>
                      <div>
                        <MagicTextarea
                          id={`field-project-${i}-desc`}
                          value={project.description}
                          onChange={v => updateProject(i, 'description', v)}
                          onBlur={() => touchProject(i, 'description')}
                          placeholder="- Xây dựng hệ thống bằng React, Node.js...&#10;- Tối ưu hóa hiệu năng tăng 30%...&#10;- Vai trò: Nhóm trưởng..."
                          hasError={!!touched.projects[i]?.description && !!errors.projects[i]?.description}
                          isHighlighted={hi === `field-project-${i}-desc`}
                          isPro={isPro}
                        />
                        {touched.projects[i]?.description && <ErrMsg msg={errors.projects[i]?.description ?? ''} />}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </section>

            {/* ── Hoạt động & Thành tích (Feature 3+4) ── */}
            <section className="mb-10">
              <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
                <h2 className="text-zinc-900 font-black text-2xl tracking-tighter uppercase flex items-center gap-3">
                  <span className="text-[var(--fpt-orange)] px-2 bg-yellow-300 border-2 border-black shadow-[2px_2px_0_0_#000] rounded">05.</span> Hoạt động &amp; Thành tích
                </h2>
                <div className="flex gap-2">
                  <button type="button" onClick={() => setIdeasOpen(o => !o)} className="text-[12px] font-black uppercase tracking-widest bg-[var(--fpt-orange)] border-2 border-black text-white px-4 py-2 rounded-xl shadow-[2px_2px_0_0_#000] hover:-translate-y-0.5 active:translate-y-0 active:shadow-none transition-all">
                    💡 Gợi ý
                  </button>
                  <button type="button" onClick={addActivity} className="text-[12px] font-black uppercase tracking-widest bg-white border-2 border-black text-black px-4 py-2 rounded-xl shadow-[2px_2px_0_0_#000] hover:-translate-y-0.5 active:translate-y-0 active:shadow-none transition-all">
                    + Thủ công
                  </button>
                </div>
              </div>

              {ideasOpen && (
                <div className="mb-6 flex flex-col gap-4">
                  <ActivityPicker onAdd={addActivityText} />
                  <AchievementChecklist onAdd={addActivityTexts} />
                </div>
              )}

              {activities.length === 0 && !ideasOpen && (
                <button
                  type="button"
                  onClick={() => setIdeasOpen(true)}
                  className="mb-4 w-full rounded-2xl border-4 border-dashed border-zinc-300 bg-white p-6 text-center transition-all hover:-translate-y-0.5 hover:border-black hover:shadow-[6px_6px_0_0_#000]"
                >
                  <p className="mb-1 text-2xl">💡</p>
                  <p className="font-black text-zinc-700">Chưa có hoạt động nào</p>
                  <p className="mt-1 text-sm font-bold text-zinc-400">Bấm để xem gợi ý: CLB, tình nguyện, cuộc thi, thành tích...</p>
                </button>
              )}

              <div className="flex flex-col gap-3">
                {activities.map((activity, i) => (
                  <div key={i} className="flex flex-col gap-1">
                    <div className="flex items-start gap-3">
                      <div className="flex-1">
                        <MagicTextarea
                          id={`field-activity-${i}`}
                          value={activity.description}
                          onChange={v => updateActivity(i, v)}
                          onBlur={() => touchActivity(i)}
                          placeholder="VD: Thành viên CLB Lập trình FPT, tham gia tổ chức sự kiện..."
                          hasError={!!touched.activities[i] && !!errors.activities[i]}
                          isHighlighted={hi === `field-activity-${i}`}
                          isPro={isPro}
                        />
                      </div>
                      <div className="shrink-0 mt-2">
                        {activities.length > 1 && (
                          <button type="button" onClick={() => removeActivity(i)}
                            className="text-black hover:text-white bg-white border-2 border-black shadow-[2px_2px_0_0_#000] hover:bg-red-500 hover:shadow-none hover:translate-y-0.5 rounded-xl p-3 transition-all shrink-0">
                            <svg className="w-5 h-5 stroke-[3px]" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
                          </button>
                        )}
                      </div>
                    </div>
                    {touched.activities[i] && <ErrMsg msg={errors.activities[i] ?? ''} />}
                  </div>
                ))}
              </div>
            </section>

            <div className="pb-10"></div>
          </div>
        </div>
      </div>

      {/* ── BÊN PHẢI: Live Preview ── */}
      <div data-lenis-prevent className="hidden lg:flex lg:w-[55%] xl:w-[58%] h-full bg-zinc-900 justify-center items-start p-8 xl:p-12 overflow-y-auto relative border-l-4 border-black">
        {/* Subtle grid pattern background */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px]"></div>
        <div className="relative z-10 w-full max-w-[620px] xl:max-w-[680px]">
           {/* Render Live Preview như một trang giấy trên canvas */}
           <div className="bg-white shadow-[0_20px_60px_-15px_rgba(0,0,0,0.8)] rounded-md overflow-hidden pointer-events-none ring-1 ring-black/5">
             <Preview data={contentPreview} />
           </div>
        </div>
      </div>
      </div>
    </div>
  )
}