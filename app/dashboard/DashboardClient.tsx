'use client'

import { useEffect, useMemo, useState, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { pdf } from '@react-pdf/renderer'
import { getTemplate } from '@/components/cv-templates/registry'
import { getUserPlan, type UserPlan } from '@/lib/user-plan'
import { CONFIG } from '@/lib/config'

interface CV {
  id: string
  title: string
  created_at: string
}

type SortKey = 'newest' | 'oldest' | 'title'

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('vi-VN', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  })
}

// ── Toast ──────────────────────────────────────────────────────────────────
function Toast({ tone, children, onClose }: {
  tone: 'green' | 'blue' | 'red'
  children: React.ReactNode
  onClose: () => void
}) {
  const cls = {
    green: 'bg-green-900/80 border-green-700 text-green-300',
    blue: 'bg-blue-900/80 border-blue-700 text-blue-300',
    red: 'bg-red-900/80 border-red-700 text-red-300',
  }[tone]
  return (
    <div className={`fixed top-6 left-1/2 -translate-x-1/2 ${cls} border text-sm px-5 py-3 rounded-xl flex items-center gap-3 shadow-lg z-50`}>
      <span>{children}</span>
      <button onClick={onClose} className="opacity-70 hover:opacity-100 leading-none">×</button>
    </div>
  )
}

// ── Stat card ────────────────────────────────────────────────────────────────
function StatCard({ label, value, hint }: { label: string; value: string; hint?: string }) {
  return (
    <div className="bg-zinc-900 border border-zinc-800 rounded-xl px-5 py-4">
      <p className="text-zinc-500 text-xs uppercase tracking-wider">{label}</p>
      <p className="text-white text-2xl font-bold mt-1">{value}</p>
      {hint && <p className="text-zinc-500 text-xs mt-0.5">{hint}</p>}
    </div>
  )
}

// ── Skeleton card ─────────────────────────────────────────────────────────────
function SkeletonCard() {
  return (
    <div className="bg-zinc-900 rounded-xl px-5 py-4 animate-pulse">
      <div className="h-4 w-1/3 bg-zinc-800 rounded mb-3" />
      <div className="h-3 w-24 bg-zinc-800/70 rounded mb-4" />
      <div className="flex gap-2">
        <div className="h-8 w-16 bg-zinc-800 rounded-lg" />
        <div className="h-8 w-16 bg-zinc-800 rounded-lg" />
        <div className="h-8 w-20 bg-zinc-800 rounded-lg" />
      </div>
    </div>
  )
}

// ── CV card ────────────────────────────────────────────────────────────────
function CVCard({ cv, onDeleted, onDuplicated }: { cv: CV; onDeleted: (id: string) => void; onDuplicated: (cv: CV) => void }) {
  const router = useRouter()
  const [downloading, setDownloading] = useState(false)
  const [pdfToast, setPdfToast] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [confirming, setConfirming] = useState(false)
  const [duplicating, setDuplicating] = useState(false)
  const [shared, setShared] = useState(false)

  useEffect(() => {
    if (!pdfToast) return
    const t = setTimeout(() => setPdfToast(false), 8000)
    return () => clearTimeout(t)
  }, [pdfToast])

  async function handleDownloadPdf() {
    setDownloading(true)
    try {
      const { data } = await supabase
        .from('cvs')
        .select('title, content, template')
        .eq('id', cv.id)
        .single()
      if (!data) return
      const { Pdf } = getTemplate(data.template || 'classic')
      const blob = await pdf(<Pdf data={data.content} />).toBlob()
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `CV_${data.title.replace(/\s+/g, '_')}.pdf`
      a.click()
      URL.revokeObjectURL(url)
      setPdfToast(true)
    } finally {
      setDownloading(false)
    }
  }

  async function handleDelete() {
    setDeleting(true)
    try {
      const res = await fetch(`/api/cvs/${cv.id}`, { method: 'DELETE' })
      if (res.ok) {
        onDeleted(cv.id)
      } else {
        setDeleting(false)
        setConfirming(false)
      }
    } catch {
      setDeleting(false)
      setConfirming(false)
    }
  }

  async function handleDuplicate() {
    setDuplicating(true)
    try {
      const res = await fetch(`/api/cvs/${cv.id}/duplicate`, { method: 'POST' })
      const json = await res.json().catch(() => ({}))
      if (res.ok && json.cv) onDuplicated(json.cv)
      else if (json.error === 'free_limit_reached') window.location.href = '/upgrade'
    } finally {
      setDuplicating(false)
    }
  }

  async function handleShare() {
    const url = `${window.location.origin}/share/${cv.id}`
    try {
      await navigator.clipboard.writeText(url)
      setShared(true)
      setTimeout(() => setShared(false), 2000)
    } catch {
      window.prompt('Sao chép link chia sẻ:', url)
    }
  }

  const btn = 'text-sm px-3 py-1.5 rounded-lg transition-colors border'
  return (
    <>
      {pdfToast && (
        <div className="fixed bottom-6 right-6 z-50 bg-zinc-800 border border-zinc-700 text-zinc-200 text-sm px-4 py-3 rounded-xl flex items-center gap-3 shadow-xl">
          <span>✓ Đã tải PDF</span>
          <span className="text-zinc-500">—</span>
          <a href="/feedback?from=pdf_export" className="text-blue-400 hover:text-blue-300 underline underline-offset-2 transition-colors">Góp ý</a>
          <button onClick={() => setPdfToast(false)} className="text-zinc-500 hover:text-zinc-200 ml-1 leading-none">×</button>
        </div>
      )}
      <div className="bg-zinc-900 rounded-xl px-5 py-4 border border-transparent hover:border-zinc-800 transition-colors">
        <div className="mb-3">
          <p className="text-white font-medium truncate">{cv.title}</p>
          <p className="text-zinc-500 text-sm mt-0.5">Tạo lúc {formatDate(cv.created_at)}</p>
        </div>

        {confirming ? (
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-sm text-zinc-300">Xoá CV này?</span>
            <button onClick={handleDelete} disabled={deleting}
              className={`${btn} text-red-300 border-red-700 hover:border-red-500 disabled:opacity-50`}>
              {deleting ? 'Đang xoá...' : 'Xoá vĩnh viễn'}
            </button>
            <button onClick={() => setConfirming(false)} disabled={deleting}
              className={`${btn} text-zinc-300 border-zinc-700 hover:border-zinc-500`}>
              Huỷ
            </button>
          </div>
        ) : (
          <div className="flex flex-wrap items-center gap-2">
            <button type="button" onClick={() => router.push(`/cv/${cv.id}/view`)}
              className={`${btn} text-zinc-300 hover:text-white border-zinc-700 hover:border-zinc-500`}>👁 Xem</button>
            <button type="button" onClick={() => router.push(`/cv/${cv.id}/edit`)}
              className={`${btn} text-zinc-300 hover:text-white border-zinc-700 hover:border-zinc-500`}>✏️ Sửa</button>
            <button type="button" onClick={handleDownloadPdf} disabled={downloading}
              className={`${btn} text-zinc-300 hover:text-white border-zinc-700 hover:border-zinc-500 disabled:opacity-50`}>
              📥 {downloading ? 'Đang tạo...' : 'Tải PDF'}
            </button>
            <button type="button" onClick={() => router.push(`/cv/${cv.id}/suggest`)}
              className={`${btn} text-blue-400 hover:text-blue-200 border-blue-800 hover:border-blue-500`}>🎯 Gợi ý chuyên ngành</button>
            <button type="button" onClick={() => router.push(`/cv/${cv.id}/match`)}
              className={`${btn} text-violet-400 hover:text-violet-200 border-violet-800 hover:border-violet-500`}>🎯 Match JD</button>
            <button type="button" onClick={handleDuplicate} disabled={duplicating}
              className={`${btn} text-zinc-300 hover:text-white border-zinc-700 hover:border-zinc-500 disabled:opacity-50`}>📑 {duplicating ? 'Đang sao...' : 'Nhân bản'}</button>
            <button type="button" onClick={handleShare}
              className={`${btn} text-zinc-300 hover:text-white border-zinc-700 hover:border-zinc-500`}>{shared ? '✓ Đã copy' : '🔗 Chia sẻ'}</button>
            <button type="button" onClick={() => setConfirming(true)}
              className={`${btn} text-zinc-500 hover:text-red-400 border-transparent hover:border-red-800 ml-auto`}>🗑 Xoá</button>
          </div>
        )}
      </div>
    </>
  )
}

// ── Main ─────────────────────────────────────────────────────────────────────
function DashboardContent() {
  const router = useRouter()
  const searchParams = useSearchParams()

  const [email, setEmail] = useState<string | null>(null)
  const [authLoading, setAuthLoading] = useState(true)
  const [cvs, setCvs] = useState<CV[]>([])
  const [cvsLoading, setCvsLoading] = useState(true)
  const [planInfo, setPlanInfo] = useState<UserPlan | null>(null)

  const [query, setQuery] = useState('')
  const [sort, setSort] = useState<SortKey>('newest')

  // URL flag toasts (đọc 1 lần lúc mount để tránh setState đồng bộ trong render)
  const [toast, setToast] = useState<null | { tone: 'green' | 'blue' | 'red'; msg: string }>(() => {
    const sp = searchParams
    if (sp.get('success') === '1') return { tone: 'green', msg: '✓ Lưu CV thành công!' }
    if (sp.get('updated') === '1') return { tone: 'blue', msg: '✓ Cập nhật CV thành công!' }
    if (sp.get('error') === 'not_admin') return { tone: 'red', msg: 'Bạn không có quyền truy cập admin.' }
    if (sp.get('error') === 'cv_not_found') return { tone: 'red', msg: 'CV không tồn tại hoặc đã bị xoá.' }
    return null
  })

  useEffect(() => {
    if (toast) {
      window.history.replaceState(null, '', '/dashboard')
      const t = setTimeout(() => setToast(null), 5000)
      return () => clearTimeout(t)
    }
  }, [toast])

  useEffect(() => {
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      if (!session) {
        router.push('/login')
        return
      }
      setEmail(session.user.email ?? null)
      setAuthLoading(false)

      const [{ data }, plan] = await Promise.all([
        supabase
          .from('cvs')
          .select('id, title, created_at')
          .eq('user_id', session.user.id)
          .order('created_at', { ascending: false }),
        getUserPlan(supabase, session.user.id),
      ])

      setCvs(data ?? [])
      setPlanInfo(plan)
      setCvsLoading(false)
    })
  }, [router])

  const visibleCvs = useMemo(() => {
    const q = query.trim().toLowerCase()
    const filtered = q ? cvs.filter((c) => c.title.toLowerCase().includes(q)) : cvs
    const sorted = [...filtered]
    if (sort === 'newest') sorted.sort((a, b) => +new Date(b.created_at) - +new Date(a.created_at))
    else if (sort === 'oldest') sorted.sort((a, b) => +new Date(a.created_at) - +new Date(b.created_at))
    else sorted.sort((a, b) => a.title.localeCompare(b.title, 'vi'))
    return sorted
  }, [cvs, query, sort])

  if (authLoading) {
    return (
      <div className="min-h-screen bg-zinc-950 flex items-center justify-center">
        <div className="w-6 h-6 border-2 border-violet-500 border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  const atLimit = !planInfo?.isPro && cvs.length >= CONFIG.freeCvLimit
  const newCvDest = atLimit ? '/upgrade' : '/cv/new'
  const planLabel = planInfo?.isPro ? `Pro · còn ${planInfo.daysLeft} ngày` : 'Free'
  const usageHint = planInfo?.isPro ? 'Không giới hạn' : `${cvs.length}/${CONFIG.freeCvLimit} CV đã dùng`

  return (
    <div className="min-h-screen bg-zinc-950 py-10 px-4">
      {toast && <Toast tone={toast.tone} onClose={() => setToast(null)}>{toast.msg}</Toast>}

      <div className="max-w-2xl mx-auto">
        <div className="mb-6">
          <p className="text-zinc-500 text-sm">Xin chào,</p>
          <p className="text-white font-semibold">{email}</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-8">
          <StatCard label="Tổng CV" value={String(cvs.length)} />
          <StatCard label="Gói" value={planLabel} />
          <StatCard label="Hạn mức" value={planInfo?.isPro ? '∞' : `${cvs.length}/${CONFIG.freeCvLimit}`} hint={usageHint} />
        </div>

        <div className="flex items-center justify-between mb-4 gap-3">
          <h1 className="text-white text-lg font-bold shrink-0">CV của tôi</h1>
          <button
            onClick={() => router.push(newCvDest)}
            className="bg-white text-black text-sm font-semibold px-4 py-2 rounded-lg hover:bg-zinc-200 transition-colors"
          >
            + {atLimit ? 'Tạo CV mới (cần Pro)' : 'Tạo CV mới'}
          </button>
        </div>

        {atLimit && (
          <div className="bg-orange-950/50 border border-orange-700 text-orange-300 text-sm px-4 py-3 rounded-xl mb-4">
            Bạn đã đạt giới hạn {CONFIG.freeCvLimit} CV của gói Free.{' '}
            <a href="/upgrade" className="underline font-semibold hover:text-orange-200 transition-colors">Nâng cấp Pro</a>{' '}
            để tạo không giới hạn.
          </div>
        )}

        {/* Search + sort (chỉ hiện khi có CV) */}
        {!cvsLoading && cvs.length > 0 && (
          <div className="flex flex-col sm:flex-row gap-2 mb-4">
            <input
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="🔍 Tìm CV theo tiêu đề..."
              className="flex-1 bg-zinc-900 border border-zinc-800 text-white text-sm rounded-lg px-4 py-2 placeholder-zinc-600 focus:outline-none focus:ring-2 focus:ring-violet-500/40"
            />
            <select
              value={sort}
              onChange={(e) => setSort(e.target.value as SortKey)}
              className="bg-zinc-900 border border-zinc-800 text-zinc-300 text-sm rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-violet-500/40"
              aria-label="Sắp xếp"
            >
              <option value="newest">Mới nhất</option>
              <option value="oldest">Cũ nhất</option>
              <option value="title">Tiêu đề A→Z</option>
            </select>
          </div>
        )}

        {cvsLoading ? (
          <div className="flex flex-col gap-3">
            <SkeletonCard />
            <SkeletonCard />
            <SkeletonCard />
          </div>
        ) : cvs.length === 0 ? (
          <div className="text-center py-16">
            <div className="text-5xl mb-4">📄</div>
            <p className="text-zinc-400 mb-4">Bạn chưa có CV nào. Tạo CV đầu tiên!</p>
            <button
              onClick={() => router.push('/cv/new')}
              className="bg-white text-black text-sm font-semibold px-6 py-2.5 rounded-lg hover:bg-zinc-200 transition-colors"
            >
              + Tạo CV mới
            </button>
          </div>
        ) : visibleCvs.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-zinc-400">Không tìm thấy CV nào khớp “{query}”.</p>
            <button onClick={() => setQuery('')} className="text-violet-400 hover:text-violet-300 text-sm mt-2">
              Xoá bộ lọc
            </button>
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            {visibleCvs.map((cv) => (
              <CVCard
                key={cv.id}
                cv={cv}
                onDeleted={(id) => setCvs((prev) => prev.filter((c) => c.id !== id))}
                onDuplicated={(nc) => setCvs((prev) => [nc, ...prev])}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

export default function DashboardClient() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-zinc-950 flex items-center justify-center">
        <div className="w-6 h-6 border-2 border-violet-500 border-t-transparent rounded-full animate-spin" />
      </div>
    }>
      <DashboardContent />
    </Suspense>
  )
}
