'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { Check, Lock, Sparkles } from 'lucide-react'
import { listTemplatesByCategory } from '@/components/cv-templates/registry'
import type { CvData, TemplateMeta } from '@/components/cv-templates/types'

interface Props {
  cvId: string
  currentTemplate: string
  userIsPro: boolean
  data: CvData
}

/**
 * Thumbnail render đúng tỉ lệ A4: preview thiết kế ở bề rộng 600px,
 * được scale theo bề rộng thực của card (ResizeObserver) nên luôn sắc nét,
 * không vỡ layout ở mọi breakpoint.
 */
function PreviewThumb({ Preview, data }: { Preview: TemplateMeta['Preview']; data: CvData }) {
  const ref = useRef<HTMLDivElement>(null)
  const [scale, setScale] = useState(0.45)

  useEffect(() => {
    const el = ref.current
    if (!el) return
    const update = () => setScale(el.clientWidth / 600)
    update()
    const ro = new ResizeObserver(update)
    ro.observe(el)
    return () => ro.disconnect()
  }, [])

  return (
    <div ref={ref} className="relative w-full aspect-[210/297] overflow-hidden bg-zinc-50">
      <div className="absolute left-0 top-0 w-[600px] origin-top-left" style={{ transform: `scale(${scale})` }}>
        <Preview data={data} />
      </div>
    </div>
  )
}

export default function TemplateSelector({ cvId, currentTemplate, userIsPro, data }: Props) {
  const router = useRouter()
  const [current, setCurrent] = useState(currentTemplate)
  const [saving, setSaving] = useState(false)
  const [toast, setToast] = useState<string | null>(null)

  function showToast(message: string) {
    setToast(message)
    setTimeout(() => setToast(null), 2000)
  }

  async function handleSelect(templateId: string, locked: boolean) {
    if (saving) return
    if (locked) { router.push('/upgrade'); return }
    if (templateId === current) return

    const previous = current
    setCurrent(templateId)
    setSaving(true)
    try {
      const res = await fetch(`/api/cvs/${cvId}/template`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ template: templateId }),
      })
      if (!res.ok) {
        setCurrent(previous)
        alert('Không đổi được mẫu, thử lại')
        return
      }
      showToast('Đã đổi mẫu CV')
      // Đồng bộ lại server component để ViewActions (nút Tải PDF) nhận template mới.
      router.refresh()
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="relative">
      {/* Header */}
      <div className="mb-8">
        <h2 className="text-lg font-semibold tracking-tight text-zinc-900">Thư viện mẫu CV</h2>
        <p className="mt-1 text-sm text-zinc-500">
          Mỗi chuyên ngành có mẫu đặc trưng — chọn mẫu phù hợp với bạn.
        </p>
      </div>

      <div className="flex flex-col gap-10">
        {listTemplatesByCategory().map((group) => (
          <section key={group.category}>
            {/* Category header + divider */}
            <div className="mb-5 flex items-baseline justify-between border-b border-zinc-200 pb-3">
              <h3 className="text-sm font-semibold tracking-tight text-zinc-900">{group.category}</h3>
              <span className="text-xs font-medium text-zinc-400">
                {group.templates.length} mẫu
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {group.templates.map((template) => {
                const isCurrent = template.id === current
                const locked = template.isPro && !userIsPro
                const Preview = template.Preview

                return (
                  <button
                    key={template.id}
                    type="button"
                    onClick={() => handleSelect(template.id, locked)}
                    disabled={saving}
                    aria-pressed={isCurrent}
                    className={`group relative flex flex-col overflow-hidden rounded-xl border bg-white text-left transition-all duration-200 disabled:cursor-not-allowed ${
                      isCurrent
                        ? 'border-[var(--fpt-orange)] ring-2 ring-[var(--fpt-orange)]/25 shadow-sm'
                        : 'border-zinc-200 shadow-sm hover:-translate-y-1 hover:border-zinc-300 hover:shadow-lg'
                    }`}
                  >
                    {/* Preview */}
                    <div className="relative">
                      <PreviewThumb Preview={Preview} data={data} />

                      {/* Badges */}
                      {isCurrent && (
                        <span className="absolute left-3 top-3 z-10 inline-flex items-center gap-1 rounded-md bg-[var(--fpt-orange)] px-2 py-1 text-[11px] font-medium text-white shadow-sm">
                          <Check className="h-3 w-3" strokeWidth={3} /> Đang dùng
                        </span>
                      )}
                      {template.isPro && (
                        <span className="absolute right-3 top-3 z-10 inline-flex items-center gap-1 rounded-md bg-zinc-900/85 px-2 py-1 text-[11px] font-medium text-white backdrop-blur-sm">
                          <Sparkles className="h-3 w-3" /> Pro
                        </span>
                      )}

                      {/* Locked overlay */}
                      {locked && (
                        <div className="absolute inset-0 z-10 flex flex-col items-center justify-center gap-2 bg-white/70 backdrop-blur-[2px] opacity-0 transition-opacity duration-200 group-hover:opacity-100">
                          <span className="flex h-10 w-10 items-center justify-center rounded-full bg-zinc-900 text-white">
                            <Lock className="h-4 w-4" />
                          </span>
                          <span className="text-sm font-medium text-zinc-800">Nâng cấp Pro</span>
                        </div>
                      )}
                    </div>

                    {/* Meta */}
                    <div className="flex items-start justify-between gap-2 border-t border-zinc-100 p-4">
                      <div className="min-w-0">
                        <p className="truncate text-sm font-semibold text-zinc-900">{template.name}</p>
                        <p className="mt-0.5 line-clamp-2 text-xs leading-relaxed text-zinc-500">
                          {template.description}
                        </p>
                      </div>
                      {isCurrent && (
                        <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-[var(--fpt-orange)] text-white">
                          <Check className="h-3 w-3" strokeWidth={3} />
                        </span>
                      )}
                    </div>
                  </button>
                )
              })}
            </div>
          </section>
        ))}
      </div>

      {toast && (
        <div className="fixed bottom-6 left-1/2 z-50 flex -translate-x-1/2 items-center gap-2 rounded-lg bg-zinc-900 px-4 py-2.5 text-sm font-medium text-white shadow-lg">
          <Check className="h-4 w-4 text-green-400" strokeWidth={3} />
          {toast}
        </div>
      )}
    </div>
  )
}
