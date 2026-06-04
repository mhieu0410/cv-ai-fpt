'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { CONFIG } from '@/lib/config'

// ── Types ────────────────────────────────────────────────────────────────────

interface Education { school: string; major: string; year: string }
interface Project   { name: string; description: string }
interface Activity  { description: string }

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

// ── Validation rules ─────────────────────────────────────────────────────────

const rule = {
  title:       (s: string) => !s.trim() ? 'Vui lòng nhập tiêu đề CV'
                            : s.trim().length < 3 ? 'Tiêu đề phải có ít nhất 3 ký tự' : '',

  name:        (s: string) => !s.trim() ? 'Vui lòng nhập họ tên'
                            : s.trim().length < 2 ? 'Họ tên phải có ít nhất 2 ký tự'
                            : !/^[\p{L}\s]+$/u.test(s.trim()) ? 'Họ tên chỉ được chứa chữ cái và khoảng trắng' : '',

  email:       (s: string) => !s.trim() ? 'Vui lòng nhập email'
                            : !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(s.trim()) ? 'Vui lòng nhập email hợp lệ' : '',

  phone:       (s: string) => !s.trim() ? 'Vui lòng nhập số điện thoại'
                            : !/^0\d{9}$/.test(s.replace(/\s/g, '')) ? 'Số điện thoại phải gồm 10 chữ số và bắt đầu bằng 0' : '',

  school:      (s: string) => !s.trim() ? 'Vui lòng nhập tên trường'
                            : s.trim().length < 2 ? 'Tên trường phải có ít nhất 2 ký tự' : '',

  major:       (s: string) => !s.trim() ? 'Vui lòng nhập chuyên ngành'
                            : s.trim().length < 2 ? 'Chuyên ngành phải có ít nhất 2 ký tự' : '',

  year:        (s: string) => !s.trim() ? 'Vui lòng nhập năm học'
                            : !/^\d{4}-\d{4}$/.test(s.trim()) ? 'Định dạng phải là YYYY-YYYY, ví dụ: 2021-2025' : '',

  skill:       (s: string) => !s.trim() ? 'Vui lòng nhập kỹ năng'
                            : s.trim().length < 2 ? 'Kỹ năng phải có ít nhất 2 ký tự' : '',

  projectName: (s: string) => !s.trim() ? 'Vui lòng nhập tên dự án'
                            : s.trim().length < 3 ? 'Tên dự án phải có ít nhất 3 ký tự' : '',

  projectDesc: (s: string) => !s.trim() ? 'Vui lòng nhập mô tả dự án'
                            : s.trim().length < 10 ? 'Mô tả phải có ít nhất 10 ký tự' : '',

  activity:    (s: string) => s.trim() && s.trim().length < 10
                            ? 'Mô tả hoạt động phải có ít nhất 10 ký tự' : '',
}

function computeErrors(
  title: string, personal: { name: string; email: string; phone: string },
  education: Education[], skills: string[], projects: Project[], activities: Activity[],
): FormErrors {
  return {
    title:    rule.title(title),
    name:     rule.name(personal.name),
    email:    rule.email(personal.email),
    phone:    rule.phone(personal.phone),
    education: education.map(e => ({ school: rule.school(e.school), major: rule.major(e.major), year: rule.year(e.year) })),
    skills:    skills.map(s => rule.skill(s)),
    projects:  projects.map(p => ({ name: rule.projectName(p.name), description: rule.projectDesc(p.description) })),
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
  for (let i = 0; i < err.skills.length;   i++) if (err.skills[i])              return `field-skill-${i}`
  for (let i = 0; i < err.projects.length;  i++) {
    if (err.projects[i].name)        return `field-project-${i}-name`
    if (err.projects[i].description) return `field-project-${i}-desc`
  }
  for (let i = 0; i < err.activities.length; i++) if (err.activities[i]) return `field-activity-${i}`
  return ''
}

// ── Styling helpers ───────────────────────────────────────────────────────────

function fieldCls(bg: string, hasErr: boolean, isHighlighted: boolean, extra = '') {
  const base = `w-full ${bg} text-white rounded-lg px-4 py-2.5 focus:outline-none placeholder-zinc-600 text-sm transition-shadow ${extra}`
  if (isHighlighted) return `${base} ring-2 ring-red-500`
  if (hasErr)        return `${base} ring-1 ring-red-500/70`
  return `${base} focus:ring-2 focus:ring-white/20`
}

function ErrMsg({ msg }: { msg: string }) {
  if (!msg) return null
  return <p className="text-red-400 text-xs mt-1 pl-0.5">{msg}</p>
}

function SectionHeader({ title, onAdd }: { title: string; onAdd: () => void }) {
  return (
    <div className="flex items-center justify-between mb-4">
      <h2 className="text-white font-semibold">{title}</h2>
      <button type="button" onClick={onAdd} className="text-sm text-zinc-400 hover:text-white transition-colors">
        + Thêm
      </button>
    </div>
  )
}

function RemoveBtn({ onClick }: { onClick: () => void }) {
  return (
    <button type="button" onClick={onClick}
      className="absolute top-3 right-3 text-zinc-500 hover:text-red-400 text-xl leading-none"
      aria-label="Xóa">×</button>
  )
}

// ── Component ─────────────────────────────────────────────────────────────────

export default function NewCvClient() {
  const router = useRouter()
  const [authLoading, setAuthLoading] = useState(true)
  const [saving, setSaving]           = useState(false)
  const [saveError, setSaveError]     = useState('')
  const [limitReached, setLimitReached] = useState(false)
  const [highlighted, setHighlighted] = useState('')

  // Form state
  const [title, setTitle]         = useState('')
  const [personal, setPersonal]   = useState({ name: '', email: '', phone: '' })
  const [education, setEducation] = useState<Education[]>([{ school: '', major: '', year: '' }])
  const [skills, setSkills]       = useState<string[]>([''])
  const [projects, setProjects]   = useState<Project[]>([{ name: '', description: '' }])
  const [activities, setActivities] = useState<Activity[]>([{ description: '' }])

  // Touched state
  const [touched, setTouched] = useState<Touched>({
    title: false, name: false, email: false, phone: false,
    education:  [{ school: false, major: false, year: false }],
    skills:     [false],
    projects:   [{ name: false, description: false }],
    activities: [false],
  })

  const errors = computeErrors(title, personal, education, skills, projects, activities)
  const valid  = isFormValid(errors)

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session) router.push('/login')
      else setAuthLoading(false)
    })
  }, [router])

  // ── Touch helpers ─────────────────────────────────────────────────────────

  const touch = (field: 'title' | 'name' | 'email' | 'phone') =>
    setTouched(t => ({ ...t, [field]: true }))

  const touchEdu = (i: number, field: keyof EduTouched) =>
    setTouched(t => ({ ...t, education: t.education.map((e, idx) => idx === i ? { ...e, [field]: true } : e) }))

  const touchSkill = (i: number) =>
    setTouched(t => ({ ...t, skills: t.skills.map((s, idx) => idx === i ? true : s) }))

  const touchProject = (i: number, field: keyof ProjTouched) =>
    setTouched(t => ({ ...t, projects: t.projects.map((p, idx) => idx === i ? { ...p, [field]: true } : p) }))

  const touchActivity = (i: number) =>
    setTouched(t => ({ ...t, activities: t.activities.map((a, idx) => idx === i ? true : a) }))

  // ── Array field operations ────────────────────────────────────────────────

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

  const addSkill = () => {
    setSkills(p => [...p, ''])
    setTouched(t => ({ ...t, skills: [...t.skills, false] }))
  }
  const removeSkill = (i: number) => {
    setSkills(p => p.filter((_, idx) => idx !== i))
    setTouched(t => ({ ...t, skills: t.skills.filter((_, idx) => idx !== i) }))
  }
  const updateSkill = (i: number, val: string) =>
    setSkills(p => p.map((s, idx) => idx === i ? val : s))

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

  // ── Save ──────────────────────────────────────────────────────────────────

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

    const content = {
      personal,
      education: education.filter(e => e.school || e.major || e.year),
      skills:    skills.filter(s => s.trim()),
      projects:  projects.filter(p => p.name || p.description),
      activities: activities.filter(a => a.description),
    }

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
  }

  // ── Render ────────────────────────────────────────────────────────────────

  if (authLoading) {
    return (
      <div className="min-h-screen bg-zinc-950 flex items-center justify-center">
        <p className="text-zinc-500">Đang tải...</p>
      </div>
    )
  }

  const hi = highlighted

  return (
    <div className="min-h-screen bg-zinc-950 py-10 px-4">
      <div className="max-w-2xl mx-auto">

        <div className="flex items-center gap-4 mb-8">
          <button type="button" onClick={() => router.push('/dashboard')}
            className="text-zinc-500 hover:text-white transition-colors text-sm">
            ← Quay lại
          </button>
          <h1 className="text-white text-2xl font-bold">Tạo CV mới</h1>
        </div>

        {/* ── Tiêu đề CV ── */}
        <section className="mb-8">
          <label htmlFor="field-title" className="text-zinc-400 text-sm mb-2 block font-medium">
            Tiêu đề CV
          </label>
          <input
            id="field-title" type="text" value={title}
            onChange={e => setTitle(e.target.value)}
            onBlur={() => touch('title')}
            placeholder="VD: CV Lập trình viên Frontend – Nguyễn Văn A"
            className={fieldCls('bg-zinc-900', touched.title && !!errors.title, hi === 'field-title')}
          />
          {touched.title && <ErrMsg msg={errors.title} />}
        </section>

        {/* ── Thông tin cá nhân ── */}
        <section className="mb-8">
          <h2 className="text-white font-semibold mb-4">Thông tin cá nhân</h2>
          <div className="bg-zinc-900 rounded-xl p-4 flex flex-col gap-3">
            <div>
              <label htmlFor="field-name" className="text-zinc-400 text-sm mb-1 block">Họ tên</label>
              <input
                id="field-name" type="text" value={personal.name}
                onChange={e => setPersonal({ ...personal, name: e.target.value })}
                onBlur={() => touch('name')}
                placeholder="Nguyễn Văn A"
                className={fieldCls('bg-zinc-800', touched.name && !!errors.name, hi === 'field-name')}
              />
              {touched.name && <ErrMsg msg={errors.name} />}
            </div>
            <div>
              <label htmlFor="field-email" className="text-zinc-400 text-sm mb-1 block">Email</label>
              <input
                id="field-email" type="email" value={personal.email}
                onChange={e => setPersonal({ ...personal, email: e.target.value })}
                onBlur={() => touch('email')}
                placeholder="you@fpt.edu.vn"
                className={fieldCls('bg-zinc-800', touched.email && !!errors.email, hi === 'field-email')}
              />
              {touched.email && <ErrMsg msg={errors.email} />}
            </div>
            <div>
              <label htmlFor="field-phone" className="text-zinc-400 text-sm mb-1 block">Số điện thoại</label>
              <input
                id="field-phone" type="tel" value={personal.phone}
                onChange={e => setPersonal({ ...personal, phone: e.target.value })}
                onBlur={() => touch('phone')}
                placeholder="0901234567"
                className={fieldCls('bg-zinc-800', touched.phone && !!errors.phone, hi === 'field-phone')}
              />
              {touched.phone && <ErrMsg msg={errors.phone} />}
            </div>
          </div>
        </section>

        {/* ── Học vấn ── */}
        <section className="mb-8">
          <SectionHeader title="Học vấn" onAdd={addEducation} />
          <div className="flex flex-col gap-3">
            {education.map((edu, i) => (
              <div key={i} className="bg-zinc-900 rounded-xl p-4 relative">
                {education.length > 1 && <RemoveBtn onClick={() => removeEducation(i)} />}
                <div className="flex flex-col gap-3">
                  <div>
                    <label className="text-zinc-400 text-sm mb-1 block">Trường</label>
                    <input
                      id={`field-edu-${i}-school`} type="text" value={edu.school}
                      onChange={e => updateEducation(i, 'school', e.target.value)}
                      onBlur={() => touchEdu(i, 'school')}
                      placeholder="Đại học FPT"
                      className={fieldCls('bg-zinc-800', !!touched.education[i]?.school && !!errors.education[i]?.school, hi === `field-edu-${i}-school`)}
                    />
                    {touched.education[i]?.school && <ErrMsg msg={errors.education[i]?.school ?? ''} />}
                  </div>
                  <div>
                    <label className="text-zinc-400 text-sm mb-1 block">Chuyên ngành</label>
                    <input
                      id={`field-edu-${i}-major`} type="text" value={edu.major}
                      onChange={e => updateEducation(i, 'major', e.target.value)}
                      onBlur={() => touchEdu(i, 'major')}
                      placeholder="Kỹ thuật phần mềm"
                      className={fieldCls('bg-zinc-800', !!touched.education[i]?.major && !!errors.education[i]?.major, hi === `field-edu-${i}-major`)}
                    />
                    {touched.education[i]?.major && <ErrMsg msg={errors.education[i]?.major ?? ''} />}
                  </div>
                  <div>
                    <label className="text-zinc-400 text-sm mb-1 block">Năm học</label>
                    <input
                      id={`field-edu-${i}-year`} type="text" value={edu.year}
                      onChange={e => updateEducation(i, 'year', e.target.value)}
                      onBlur={() => touchEdu(i, 'year')}
                      placeholder="2021-2025"
                      className={fieldCls('bg-zinc-800', !!touched.education[i]?.year && !!errors.education[i]?.year, hi === `field-edu-${i}-year`)}
                    />
                    {touched.education[i]?.year && <ErrMsg msg={errors.education[i]?.year ?? ''} />}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* ── Kỹ năng ── */}
        <section className="mb-8">
          <SectionHeader title="Kỹ năng" onAdd={addSkill} />
          <div className="flex flex-col gap-2">
            {skills.map((skill, i) => (
              <div key={i}>
                <div className="flex items-center gap-2">
                  <input
                    id={`field-skill-${i}`} type="text" value={skill}
                    onChange={e => updateSkill(i, e.target.value)}
                    onBlur={() => touchSkill(i)}
                    placeholder="VD: React, TypeScript, Figma..."
                    className={fieldCls('bg-zinc-900', !!touched.skills[i] && !!errors.skills[i], hi === `field-skill-${i}`)}
                  />
                  {skills.length > 1 && (
                    <button type="button" onClick={() => removeSkill(i)}
                      className="text-zinc-500 hover:text-red-400 text-xl leading-none shrink-0">×</button>
                  )}
                </div>
                {touched.skills[i] && <ErrMsg msg={errors.skills[i] ?? ''} />}
              </div>
            ))}
          </div>
        </section>

        {/* ── Dự án ── */}
        <section className="mb-8">
          <SectionHeader title="Dự án / Project" onAdd={addProject} />
          <div className="flex flex-col gap-3">
            {projects.map((project, i) => (
              <div key={i} className="bg-zinc-900 rounded-xl p-4 relative">
                {projects.length > 1 && <RemoveBtn onClick={() => removeProject(i)} />}
                <div className="flex flex-col gap-3">
                  <div>
                    <label className="text-zinc-400 text-sm mb-1 block">Tên project</label>
                    <input
                      id={`field-project-${i}-name`} type="text" value={project.name}
                      onChange={e => updateProject(i, 'name', e.target.value)}
                      onBlur={() => touchProject(i, 'name')}
                      placeholder="CV AI for FPT Students"
                      className={fieldCls('bg-zinc-800', !!touched.projects[i]?.name && !!errors.projects[i]?.name, hi === `field-project-${i}-name`)}
                    />
                    {touched.projects[i]?.name && <ErrMsg msg={errors.projects[i]?.name ?? ''} />}
                  </div>
                  <div>
                    <label className="text-zinc-400 text-sm mb-1 block">Mô tả</label>
                    <textarea
                      id={`field-project-${i}-desc`} value={project.description}
                      onChange={e => updateProject(i, 'description', e.target.value)}
                      onBlur={() => touchProject(i, 'description')}
                      placeholder="Mô tả ngắn về dự án, công nghệ sử dụng, vai trò của bạn..."
                      rows={3}
                      className={fieldCls('bg-zinc-800', !!touched.projects[i]?.description && !!errors.projects[i]?.description, hi === `field-project-${i}-desc`, 'resize-none')}
                    />
                    {touched.projects[i]?.description && <ErrMsg msg={errors.projects[i]?.description ?? ''} />}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* ── Hoạt động ── */}
        <section className="mb-8">
          <SectionHeader title="Hoạt động / CLB" onAdd={addActivity} />
          <div className="flex flex-col gap-2">
            {activities.map((activity, i) => (
              <div key={i}>
                <div className="flex items-start gap-2">
                  <textarea
                    id={`field-activity-${i}`} value={activity.description}
                    onChange={e => updateActivity(i, e.target.value)}
                    onBlur={() => touchActivity(i)}
                    placeholder="VD: Thành viên CLB Lập trình FPT, tham gia tổ chức hackathon 2024..."
                    rows={2}
                    className={fieldCls('bg-zinc-900', !!touched.activities[i] && !!errors.activities[i], hi === `field-activity-${i}`, 'resize-none')}
                  />
                  {activities.length > 1 && (
                    <button type="button" onClick={() => removeActivity(i)}
                      className="text-zinc-500 hover:text-red-400 text-xl leading-none shrink-0 pt-2">×</button>
                  )}
                </div>
                {touched.activities[i] && <ErrMsg msg={errors.activities[i] ?? ''} />}
              </div>
            ))}
          </div>
        </section>

        {/* ── Save error ── */}
        {limitReached && (
          <div className="text-orange-300 text-sm bg-orange-950/50 border border-orange-800 px-4 py-3 rounded-lg mb-4">
            Bạn đã đạt giới hạn {CONFIG.freeCvLimit} CV của gói Free.{' '}
            <a href="/upgrade" className="underline font-semibold hover:text-orange-200 transition-colors">
              Nâng cấp Pro →
            </a>
          </div>
        )}
        {saveError && (
          <div className="text-red-400 text-sm bg-red-950/40 px-4 py-3 rounded-lg mb-4">
            {saveError}
          </div>
        )}

        {/* ── Save button ── */}
        <button
          type="button"
          onClick={handleSave}
          disabled={saving}
          className={`w-full font-semibold py-3 rounded-xl transition-colors ${
            valid
              ? 'bg-white text-black hover:bg-zinc-200'
              : 'bg-white/25 text-black/40 cursor-not-allowed'
          } disabled:opacity-40`}
        >
          {saving ? 'Đang lưu...' : 'Lưu CV'}
        </button>

      </div>
    </div>
  )
}
