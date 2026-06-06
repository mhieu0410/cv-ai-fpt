'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { listTemplates } from '@/components/cv-templates/registry'
import type { CvData } from '@/components/cv-templates/types'

interface Props {
  cvId: string
  currentTemplate: string
  userIsPro: boolean
  data: CvData
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

    if (locked) {
      router.push('/upgrade')
      return
    }

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
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="relative">
      <h2 className="text-white text-lg font-semibold">Chọn mẫu CV</h2>
      <p className="text-zinc-500 text-sm mt-1 mb-4">Chọn giao diện cho CV của bạn</p>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {listTemplates().map((template) => {
          const isCurrent = template.id === current
          const locked = template.isPro && !userIsPro
          const Preview = template.Preview

          return (
            <button
              key={template.id}
              type="button"
              onClick={() => handleSelect(template.id, locked)}
              disabled={saving}
              className={`relative text-left rounded-xl border bg-zinc-900 overflow-hidden transition-colors disabled:cursor-not-allowed ${
                isCurrent
                  ? 'border-2 border-violet-500'
                  : 'border-zinc-800 hover:border-zinc-600'
              }`}
            >
              {isCurrent && (
                <span className="absolute top-2 left-2 z-10 px-2 py-0.5 text-xs font-medium text-white bg-violet-600 rounded-full">
                  ✓ Đang dùng
                </span>
              )}

              <div className="relative h-64 overflow-hidden bg-zinc-950">
                <div className="origin-top scale-[0.4] pointer-events-none">
                  <Preview data={data} />
                </div>

                {locked && (
                  <div className="absolute inset-0 flex flex-col items-center justify-center gap-1 bg-black/60 backdrop-blur-[1px]">
                    <span className="text-2xl" aria-hidden="true">🔒</span>
                    <span className="text-white text-sm font-medium">Cần Pro</span>
                  </div>
                )}
              </div>

              <div className="p-3">
                <p className="text-white font-medium">{template.name}</p>
                <p className="text-zinc-500 text-xs mt-0.5">{template.description}</p>
              </div>
            </button>
          )
        })}
      </div>

      {toast && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 px-4 py-2 bg-zinc-800 border border-zinc-700 text-white text-sm rounded-lg shadow-lg z-50">
          {toast}
        </div>
      )}
    </div>
  )
}
