'use client'

import { useEffect, useState } from 'react'
import {
  PROJECT_IDEAS, PROJECT_ROLES, PROJECT_TECH, PROJECT_FEATURES, INDUSTRIES,
  generateProjectDescription, type ProjectWizardAnswers,
} from './data'

/**
 * Feature 2 + 6 — Wizard hỏi từng bước rồi tự sinh mô tả bullet.
 * Khi xong gọi onComplete({ name, description }) để CvForm append vào projects.
 */
export default function ProjectWizard({
  open,
  onClose,
  onComplete,
  industryKey,
}: {
  open: boolean
  onClose: () => void
  onComplete: (project: { name: string; description: string }) => void
  industryKey?: string | null
}) {
  const industry = INDUSTRIES.find((i) => i.key === industryKey) ?? null
  const ideas = industry?.projectIdeas ?? PROJECT_IDEAS
  const toolList = industry?.tools ?? PROJECT_TECH
  const [step, setStep] = useState(0)
  const [a, setA] = useState<ProjectWizardAnswers>({
    name: '', team: '', role: '', tech: [], features: [], achievement: '',
  })
  const [customFeature, setCustomFeature] = useState('')

  useEffect(() => {
    if (open) {
      setStep(0)
      setA({ name: '', team: '', role: '', tech: [], features: [], achievement: '' })
      setCustomFeature('')
    }
  }, [open])

  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() }
    document.addEventListener('keydown', onKey)
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => { document.removeEventListener('keydown', onKey); document.body.style.overflow = prev }
  }, [open, onClose])

  if (!open) return null

  const toggleTech = (t: string) =>
    setA((s) => ({ ...s, tech: s.tech.includes(t) ? s.tech.filter((x) => x !== t) : [...s.tech, t] }))
  const toggleFeature = (f: string) =>
    setA((s) => ({ ...s, features: s.features.includes(f) ? s.features.filter((x) => x !== f) : [...s.features, f] }))
  const addCustomFeature = () => {
    const t = customFeature.trim()
    if (!t || a.features.includes(t)) return
    setA((s) => ({ ...s, features: [...s.features, t] }))
    setCustomFeature('')
  }

  const canNext =
    (step === 0 && a.name.trim().length >= 3) ||
    (step === 1 && !!a.team) ||
    step === 2 ||
    step === 3 ||
    step === 4

  const TOTAL = 5
  const preview = generateProjectDescription(a)

  function finish() {
    onComplete({ name: a.name.trim(), description: preview })
    onClose()
  }

  const chip = (active: boolean) =>
    `rounded-lg border-2 border-black px-3 py-1.5 text-[13px] font-bold shadow-[2px_2px_0_0_#000] transition-all hover:-translate-y-0.5 active:translate-y-0 active:shadow-none ${
      active ? 'bg-yellow-300 text-black' : 'bg-white text-zinc-700 hover:bg-zinc-100'
    }`

  return (
    <div className="fixed inset-0 z-[60] flex items-end justify-center p-0 sm:items-center sm:p-6" role="dialog" aria-modal="true">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      <div className="relative z-10 flex max-h-[92vh] w-full max-w-lg flex-col overflow-hidden rounded-t-[2rem] border-4 border-black bg-white shadow-[8px_8px_0_0_#000] sm:rounded-[2rem]">
        {/* Header + progress */}
        <div className="border-b-4 border-black p-5">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-black uppercase tracking-tight text-zinc-900">🚀 Trợ lý tạo dự án</h3>
            <button onClick={onClose} aria-label="Đóng" className="grid h-8 w-8 place-items-center rounded-lg border-2 border-black bg-white shadow-[2px_2px_0_0_#000] hover:bg-zinc-100">
              <svg className="h-4 w-4 stroke-[3]" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" d="M6 18L18 6M6 6l12 12" /></svg>
            </button>
          </div>
          <div className="mt-3 flex gap-1.5">
            {Array.from({ length: TOTAL }).map((_, i) => (
              <div key={i} className={`h-2 flex-1 rounded-full border-2 border-black ${i <= step ? 'bg-[var(--fpt-orange)]' : 'bg-zinc-100'}`} />
            ))}
          </div>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-6">
          {step === 0 && (
            <div>
              <label className="mb-2 block text-[15px] font-black text-zinc-900">Bạn đã làm dự án gì?</label>
              <input
                autoFocus
                value={a.name}
                onChange={(e) => setA((s) => ({ ...s, name: e.target.value }))}
                placeholder="VD: Website bán hàng online"
                className="w-full rounded-xl border-2 border-black bg-white px-4 py-3 text-[14px] font-bold shadow-[2px_2px_0_0_#000] focus:translate-y-[2px] focus:shadow-none focus:outline-none"
              />
              <p className="mb-2 mt-4 text-[12px] font-bold uppercase tracking-widest text-zinc-400">Hoặc chọn nhanh:</p>
              <div className="flex flex-wrap gap-2">
                {ideas.map((idea) => (
                  <button key={idea} type="button" onClick={() => setA((s) => ({ ...s, name: idea }))} className={chip(a.name === idea)}>
                    {idea}
                  </button>
                ))}
              </div>
            </div>
          )}

          {step === 1 && (
            <div className="flex flex-col gap-5">
              <div>
                <label className="mb-2 block text-[15px] font-black text-zinc-900">Bạn làm một mình hay theo nhóm?</label>
                <div className="flex gap-2">
                  {(['solo', 'team'] as const).map((t) => (
                    <button key={t} type="button" onClick={() => setA((s) => ({ ...s, team: t }))} className={chip(a.team === t)}>
                      {t === 'solo' ? '👤 Một mình' : '👥 Theo nhóm'}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="mb-2 block text-[15px] font-black text-zinc-900">Vai trò của bạn?</label>
                <div className="flex flex-wrap gap-2">
                  {PROJECT_ROLES.map((r) => (
                    <button key={r} type="button" onClick={() => setA((s) => ({ ...s, role: s.role === r ? '' : r }))} className={chip(a.role === r)}>
                      {r}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {step === 2 && (
            <div>
              <label className="mb-2 block text-[15px] font-black text-zinc-900">Công nghệ / công cụ đã dùng?</label>
              <div className="flex flex-wrap gap-2">
                {toolList.map((t) => (
                  <button key={t} type="button" onClick={() => toggleTech(t)} className={chip(a.tech.includes(t))}>
                    {a.tech.includes(t) ? '✓ ' : '+ '}{t}
                  </button>
                ))}
              </div>
            </div>
          )}

          {step === 3 && (
            <div>
              <label className="mb-2 block text-[15px] font-black text-zinc-900">Tính năng chính đã làm?</label>
              <div className="mb-3 flex flex-wrap gap-2">
                {PROJECT_FEATURES.map((f) => (
                  <button key={f} type="button" onClick={() => toggleFeature(f)} className={chip(a.features.includes(f))}>
                    {a.features.includes(f) ? '✓ ' : '+ '}{f}
                  </button>
                ))}
              </div>
              <div className="flex items-center gap-2">
                <input
                  value={customFeature}
                  onChange={(e) => setCustomFeature(e.target.value)}
                  onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); addCustomFeature() } }}
                  placeholder="Tính năng khác..."
                  className="w-full rounded-xl border-2 border-black bg-white px-3 py-2 text-[13px] font-bold shadow-[2px_2px_0_0_#000] focus:translate-y-[2px] focus:shadow-none focus:outline-none"
                />
                <button type="button" onClick={addCustomFeature} className="shrink-0 rounded-xl border-2 border-black bg-zinc-900 px-3 py-2 text-[12px] font-black uppercase tracking-widest text-white shadow-[2px_2px_0_0_#000]">Thêm</button>
              </div>
            </div>
          )}

          {step === 4 && (
            <div className="flex flex-col gap-4">
              <div>
                <label className="mb-2 block text-[15px] font-black text-zinc-900">Có thành tích/kết quả gì không? <span className="font-bold text-zinc-400">(tùy chọn)</span></label>
                <input
                  value={a.achievement}
                  onChange={(e) => setA((s) => ({ ...s, achievement: e.target.value }))}
                  placeholder="VD: đạt 500+ người dùng, giải Nhì cuộc thi..."
                  className="w-full rounded-xl border-2 border-black bg-white px-4 py-3 text-[14px] font-bold shadow-[2px_2px_0_0_#000] focus:translate-y-[2px] focus:shadow-none focus:outline-none"
                />
              </div>
              <div>
                <p className="mb-2 text-[12px] font-black uppercase tracking-widest text-zinc-400">✨ Mô tả tự sinh (có thể sửa sau)</p>
                <pre className="whitespace-pre-wrap rounded-xl border-2 border-black bg-yellow-50 p-4 text-[13px] font-semibold leading-relaxed text-zinc-800 shadow-[2px_2px_0_0_#000]">{preview}</pre>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between gap-3 border-t-4 border-black p-4">
          <button
            type="button"
            onClick={() => (step === 0 ? onClose() : setStep((s) => s - 1))}
            className="rounded-xl border-2 border-black bg-white px-4 py-2.5 text-[13px] font-black uppercase tracking-widest text-zinc-700 shadow-[2px_2px_0_0_#000] transition-all hover:-translate-y-0.5 active:translate-y-0 active:shadow-none"
          >
            {step === 0 ? 'Hủy' : '← Quay lại'}
          </button>
          {step < TOTAL - 1 ? (
            <button
              type="button"
              disabled={!canNext}
              onClick={() => setStep((s) => s + 1)}
              className="rounded-xl border-2 border-black bg-[var(--fpt-orange)] px-6 py-2.5 text-[13px] font-black uppercase tracking-widest text-white shadow-[2px_2px_0_0_#000] transition-all hover:-translate-y-0.5 active:translate-y-0 active:shadow-none disabled:opacity-40"
            >
              Tiếp →
            </button>
          ) : (
            <button
              type="button"
              onClick={finish}
              className="rounded-xl border-2 border-black bg-green-500 px-6 py-2.5 text-[13px] font-black uppercase tracking-widest text-white shadow-[2px_2px_0_0_#000] transition-all hover:-translate-y-0.5 active:translate-y-0 active:shadow-none"
            >
              ✓ Thêm vào CV
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
