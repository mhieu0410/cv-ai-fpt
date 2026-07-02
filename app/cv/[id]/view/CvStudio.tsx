'use client'

import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { pdf } from '@react-pdf/renderer'
import {
  Pencil, Download, BarChart3, Target, Link2, Check,
  LayoutGrid, X, Sparkles, Lock,
} from 'lucide-react'
import { getTemplate, listTemplatesByCategory } from '@/components/cv-templates/registry'
import type { CvData, TemplateMeta } from '@/components/cv-templates/types'

interface Props {
  cvId: string
  cvTitle: string
  content: CvData
  initialTemplate: string
  isPro: boolean
}

/**
 * Render preview đúng tỉ lệ A4: template thiết kế ở bề rộng `baseWidth` (600px),
 * scale theo bề rộng thực của khung (ResizeObserver) → sắc nét ở mọi kích thước.
 */
function ScaledPreview({
  Preview,
  data,
  baseWidth = 600,
}: {
  Preview: TemplateMeta['Preview']
  data: CvData
  baseWidth?: number
}) {
  const ref = useRef<HTMLDivElement>(null)
  const [scale, setScale] = useState(0.5)

  useEffect(() => {
    const el = ref.current
    if (!el) return
    const update = () => setScale(el.clientWidth / baseWidth)
    update()
    const ro = new ResizeObserver(update)
    ro.observe(el)
    return () => ro.disconnect()
  }, [baseWidth])

  return (
    <div ref={ref} className="relative w-full aspect-[210/297] overflow-hidden">
      <div
        className="absolute left-0 top-0 origin-top-left"
        style={{ width: baseWidth, transform: `scale(${scale})` }}
      >
        <Preview data={data} />
      </div>
    </div>
  )
}

export default function CvStudio({ cvId, cvTitle, content, initialTemplate, isPro }: Props) {
  const router = useRouter()
  const [current, setCurrent] = useState(initialTemplate)
  const [modalOpen, setModalOpen] = useState(false)
  const [saving, setSaving] = useState(false)
  const [downloading, setDownloading] = useState(false)
  const [copied, setCopied] = useState(false)
  const [toast, setToast] = useState<string | null>(null)

  const currentMeta = getTemplate(current)
  const Preview = currentMeta.Preview

  // Esc để đóng modal + khoá scroll nền khi mở
  useEffect(() => {
    if (!modalOpen) return
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') setModalOpen(false) }
    document.addEventListener('keydown', onKey)
    const prevOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.removeEventListener('keydown', onKey)
      document.body.style.overflow = prevOverflow
    }
  }, [modalOpen])

  function showToast(message: string) {
    setToast(message)
    setTimeout(() => setToast(null), 2000)
  }

  async function selectTemplate(id: string, locked: boolean) {
    if (locked) { router.push('/upgrade'); return }
    if (id === current) { setModalOpen(false); return }

    const previous = current
    setCurrent(id)
    setModalOpen(false)
    setSaving(true)
    try {
      const res = await fetch(`/api/cvs/${cvId}/template`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ template: id }),
      })
      if (!res.ok) {
        setCurrent(previous)
        showToast('Không đổi được mẫu, thử lại')
        return
      }
      showToast('Đã đổi mẫu CV')
      router.refresh()
    } finally {
      setSaving(false)
    }
  }

  async function handleDownload() {
    setDownloading(true)
    try {
      const { Pdf } = getTemplate(current)
      const blob = await pdf(<Pdf data={content} isPro={isPro} />).toBlob()
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `CV_${cvTitle.replace(/\s+/g, '_')}.pdf`
      a.click()
      URL.revokeObjectURL(url)
    } finally {
      setDownloading(false)
    }
  }

  async function handleShare() {
    const url = `${window.location.origin}/share/${cvId}`
    try {
      await navigator.clipboard.writeText(url)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      window.prompt('Sao chép link chia sẻ:', url)
    }
  }

  const secondary =
    'inline-flex h-9 items-center justify-center gap-1.5 rounded-lg border border-zinc-200 bg-white px-3 text-sm font-medium text-zinc-700 transition-colors hover:bg-zinc-50 hover:text-zinc-900'

  return (
    <>
      <div className="grid gap-6 lg:grid-cols-[1fr_340px] lg:items-start lg:gap-8">
        {/* ── Live preview ── */}
        <div className="order-2 lg:order-1">
          <div className="rounded-2xl border border-zinc-200 bg-zinc-100 p-4 sm:p-8">
            <div className="mx-auto w-full max-w-[600px] overflow-hidden rounded-lg bg-white shadow-[0_8px_30px_rgba(0,0,0,0.12)] ring-1 ring-black/5">
              <ScaledPreview Preview={Preview} data={content} />
            </div>
          </div>
        </div>

        {/* ── Control panel ── */}
        <aside className="order-1 flex flex-col gap-4 lg:order-2 lg:sticky lg:top-20">
          {/* Mẫu đang dùng */}
          <div className="rounded-xl border border-zinc-200 bg-white p-4">
            <p className="text-xs font-medium uppercase tracking-wide text-zinc-400">Mẫu đang dùng</p>
            <p className="mt-1 text-sm font-semibold text-zinc-900">{currentMeta.name}</p>
            <p className="mt-0.5 line-clamp-2 text-xs leading-relaxed text-zinc-500">{currentMeta.description}</p>
            <button
              onClick={() => setModalOpen(true)}
              className="mt-3 inline-flex h-9 w-full items-center justify-center gap-1.5 rounded-lg bg-zinc-900 px-3 text-sm font-medium text-white transition-colors hover:bg-zinc-800"
            >
              <LayoutGrid className="h-4 w-4" /> Đổi mẫu
            </button>
          </div>

          {/* Hành động */}
          <div className="rounded-xl border border-zinc-200 bg-white p-4">
            <button
              onClick={handleDownload}
              disabled={downloading}
              className="inline-flex h-9 w-full items-center justify-center gap-1.5 rounded-lg bg-[var(--fpt-orange)] px-3 text-sm font-medium text-white shadow-sm transition hover:brightness-95 disabled:opacity-60"
            >
              <Download className="h-4 w-4" /> {downloading ? 'Đang tạo...' : 'Tải PDF'}
            </button>
            <div className="mt-2 grid grid-cols-2 gap-2">
              <Link href={`/cv/${cvId}/edit`} className={secondary}>
                <Pencil className="h-4 w-4" /> Sửa
              </Link>
              <Link href={`/cv/${cvId}/ats`} className={secondary}>
                <BarChart3 className="h-4 w-4" /> ATS
              </Link>
              <Link href={`/cv/${cvId}/match`} className={secondary}>
                <Target className="h-4 w-4" /> Match JD
              </Link>
              <button type="button" onClick={handleShare} className={secondary}>
                {copied ? <Check className="h-4 w-4 text-green-600" /> : <Link2 className="h-4 w-4" />}
                {copied ? 'Đã copy' : 'Chia sẻ'}
              </button>
            </div>
          </div>
        </aside>
      </div>

      {/* ── Modal đổi mẫu ── */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-end justify-center p-0 sm:items-center sm:p-6" role="dialog" aria-modal="true">
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setModalOpen(false)} />
          <div className="relative z-10 flex max-h-[90vh] w-full max-w-5xl flex-col overflow-hidden rounded-t-2xl border border-zinc-200 bg-white shadow-2xl sm:rounded-2xl">
            <div className="flex items-center justify-between border-b border-zinc-200 px-6 py-4">
              <div>
                <h2 className="text-base font-semibold tracking-tight text-zinc-900">Chọn mẫu CV</h2>
                <p className="text-xs text-zinc-500">Mỗi chuyên ngành có mẫu đặc trưng — chọn mẫu phù hợp với bạn.</p>
              </div>
              <button
                onClick={() => setModalOpen(false)}
                aria-label="Đóng"
                className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-zinc-200 text-zinc-600 transition-colors hover:bg-zinc-50"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div data-lenis-prevent className="overflow-y-auto px-6 py-6 scroll-smooth">
                <div className="flex flex-col gap-8">
                {listTemplatesByCategory().map((group) => (
                  <section key={group.category}>
                    <div className="mb-4 flex items-baseline justify-between border-b border-zinc-200 pb-2">
                      <h3 className="text-sm font-semibold text-zinc-900">{group.category}</h3>
                      <span className="text-xs text-zinc-400">{group.templates.length} mẫu</span>
                    </div>
                    <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
                      {group.templates.map((t) => {
                        const isCurrent = t.id === current
                        const locked = t.isPro && !isPro
                        return (
                          <button
                            key={t.id}
                            type="button"
                            onClick={() => selectTemplate(t.id, locked)}
                            disabled={saving}
                            aria-pressed={isCurrent}
                            className={`group relative flex flex-col overflow-hidden rounded-xl border bg-white text-left transition-all duration-200 disabled:cursor-not-allowed ${
                              isCurrent
                                ? 'border-[var(--fpt-orange)] ring-2 ring-[var(--fpt-orange)]/25'
                                : 'border-zinc-200 hover:-translate-y-0.5 hover:border-zinc-300 hover:shadow-lg'
                            }`}
                          >
                            <div className="relative">
                              <ScaledPreview Preview={t.Preview} data={content} />
                              {isCurrent && (
                                <span className="absolute left-2 top-2 inline-flex items-center gap-1 rounded-md bg-[var(--fpt-orange)] px-1.5 py-0.5 text-[10px] font-medium text-white">
                                  <Check className="h-3 w-3" strokeWidth={3} /> Đang dùng
                                </span>
                              )}
                              {t.isPro && (
                                <span className="absolute right-2 top-2 inline-flex items-center gap-1 rounded-md bg-zinc-900/85 px-1.5 py-0.5 text-[10px] font-medium text-white backdrop-blur-sm">
                                  <Sparkles className="h-3 w-3" /> Pro
                                </span>
                              )}
                              {locked && (
                                <div className="absolute inset-0 flex flex-col items-center justify-center gap-1.5 bg-white/70 opacity-0 backdrop-blur-[2px] transition-opacity duration-200 group-hover:opacity-100">
                                  <span className="flex h-9 w-9 items-center justify-center rounded-full bg-zinc-900 text-white">
                                    <Lock className="h-4 w-4" />
                                  </span>
                                  <span className="text-xs font-medium text-zinc-800">Nâng cấp Pro</span>
                                </div>
                              )}
                            </div>
                            <div className="border-t border-zinc-100 p-3">
                              <p className="truncate text-xs font-semibold text-zinc-900">{t.name}</p>
                              <p className="mt-0.5 line-clamp-2 text-[11px] leading-relaxed text-zinc-500">{t.description}</p>
                            </div>
                          </button>
                        )
                      })}
                    </div>
                  </section>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {toast && (
        <div className="fixed bottom-6 left-1/2 z-[60] flex -translate-x-1/2 items-center gap-2 rounded-lg bg-zinc-900 px-4 py-2.5 text-sm font-medium text-white shadow-lg">
          <Check className="h-4 w-4 text-green-400" strokeWidth={3} /> {toast}
        </div>
      )}
    </>
  )
}
