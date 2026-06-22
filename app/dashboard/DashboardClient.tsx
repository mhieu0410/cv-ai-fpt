'use client'

import { useEffect, useMemo, useState, Suspense, useRef } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { pdf } from '@react-pdf/renderer'
import { getTemplate } from '@/components/cv-templates/registry'
import { getUserPlan, type UserPlan } from '@/lib/user-plan'
import { CONFIG } from '@/lib/config'
import { motion, AnimatePresence } from 'framer-motion'
import { MoreHorizontal, Eye, Download, Target, Copy, Share2, Trash2 } from 'lucide-react'
import { ParallaxCard } from '@/components/ui/parallax-card'

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
    green: 'bg-green-50 border-green-200 text-green-800',
    blue: 'bg-blue-50 border-blue-200 text-blue-800',
    red: 'bg-red-50 border-red-200 text-red-800',
  }[tone]
  return (
    <motion.div 
      initial={{ opacity: 0, y: -20, x: '-50%' }}
      animate={{ opacity: 1, y: 0, x: '-50%' }}
      exit={{ opacity: 0, y: -20, x: '-50%' }}
      className={`fixed top-6 left-1/2 ${cls} border font-medium text-sm px-5 py-3 rounded-xl flex items-center gap-3 shadow-soft-xl z-50`}
    >
      <span>{children}</span>
      <button onClick={onClose} className="opacity-50 hover:opacity-100 leading-none text-lg">×</button>
    </motion.div>
  )
}

// ── Stat card ────────────────────────────────────────────────────────────────
function StatCard({ label, value, hint, index = 0 }: { label: string; value: string; hint?: string; index?: number }) {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1, duration: 0.5, type: 'spring' }}
      whileHover={{ y: -5 }}
      className="relative overflow-hidden bg-white border border-zinc-200 rounded-[2rem] p-8 shadow-soft-2xl group transition-all"
    >
      <div className="absolute top-0 right-0 p-8">
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" className="text-zinc-300 group-hover:text-[var(--fpt-orange)] transition-colors"><path d="M5 12h14"/><path d="m12 5 7 7-7 7"/></svg>
      </div>
      <p className="text-zinc-500 text-xs font-black uppercase tracking-[0.15em] relative z-10 mb-6">{label}</p>
      <p className="text-zinc-900 text-7xl font-black tracking-tighter relative z-10 leading-none">{value}</p>
      {hint && <p className="text-[var(--fpt-orange)] text-sm mt-3 font-bold relative z-10">{hint}</p>}
    </motion.div>
  )
}

// ── Skeleton card ─────────────────────────────────────────────────────────────
function SkeletonCard() {
  return (
    <div className="bg-white border border-zinc-100 rounded-[1.5rem] px-6 py-5 shadow-soft-xl animate-pulse">
      <div className="h-5 w-1/3 bg-zinc-200/60 rounded-md mb-3" />
      <div className="h-4 w-24 bg-zinc-100 rounded-md mb-6" />
      <div className="flex gap-2">
        <div className="h-9 w-24 bg-zinc-100 rounded-xl" />
        <div className="h-9 w-24 bg-zinc-100 rounded-xl" />
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
  
  const [showMenu, setShowMenu] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)

  // handle click outside for menu
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setShowMenu(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

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
      setShowMenu(false)
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
      if (res.ok && json.cv) {
        onDuplicated(json.cv)
        setShowMenu(false)
      } else if (json.error === 'free_limit_reached') window.location.href = '/upgrade'
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

  const btnPrimary = 'text-sm font-semibold bg-[var(--fpt-orange)] text-white px-4 py-2 rounded-xl shadow-soft-md hover:bg-orange-600 transition-colors'
  const btnSecondary = 'text-sm font-semibold bg-zinc-100 text-zinc-700 px-4 py-2 rounded-xl hover:bg-zinc-200 transition-colors inline-flex items-center gap-1.5'
  const menuItem = 'w-full text-left px-4 py-2.5 text-sm text-zinc-700 font-medium hover:bg-zinc-50 hover:text-zinc-900 flex items-center gap-2.5 transition-colors disabled:opacity-50'

  return (
    <>
      {pdfToast && (
        <div className="fixed bottom-6 right-6 z-50 bg-zinc-900 border border-zinc-800 text-white text-sm px-4 py-3 rounded-xl flex items-center gap-3 shadow-xl">
          <span className="text-green-400">✓</span>
          <span>Đã tải PDF</span>
          <span className="text-zinc-600">—</span>
          <a href="/feedback?from=pdf_export" className="text-orange-400 hover:text-orange-300 underline underline-offset-2 transition-colors">Góp ý</a>
          <button onClick={() => setPdfToast(false)} className="text-zinc-500 hover:text-zinc-300 ml-1 leading-none text-lg">×</button>
        </div>
      )}
      
      <motion.div 
        whileHover={{ y: -8, scale: 1.02 }}
        transition={{ type: "spring", stiffness: 400, damping: 30 }}
        className="relative bg-white/80 backdrop-blur-lg rounded-[2rem] p-6 border border-white shadow-2xl shadow-zinc-200/50 group overflow-hidden"
      >
        <div className="absolute inset-0 bg-gradient-to-br from-orange-50/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />
        
        <div className="mb-6 relative z-10">
          <h3 className="text-zinc-900 text-2xl font-black tracking-tight truncate pr-10 group-hover:text-[var(--fpt-orange)] transition-colors">{cv.title}</h3>
          <p className="text-zinc-500 text-sm mt-1.5 font-medium">Cập nhật {formatDate(cv.created_at)}</p>
        </div>

        {confirming ? (
          <div className="flex flex-wrap items-center gap-2 bg-red-50 p-3 rounded-xl border border-red-100">
            <span className="text-[13px] text-red-800 font-semibold mr-2">Xoá vĩnh viễn CV này?</span>
            <button onClick={handleDelete} disabled={deleting}
              className="text-sm bg-red-600 text-white px-4 py-1.5 rounded-lg font-medium hover:bg-red-700 disabled:opacity-50 transition-colors">
              {deleting ? 'Đang xoá...' : 'Xác nhận'}
            </button>
            <button onClick={() => setConfirming(false)} disabled={deleting}
              className="text-sm bg-white border border-red-200 text-red-700 px-4 py-1.5 rounded-lg font-medium hover:bg-red-50 transition-colors">
              Huỷ
            </button>
          </div>
        ) : (
          <div className="flex items-center gap-2">
            <button onClick={() => router.push(`/cv/${cv.id}/edit`)} className={btnPrimary}>
              Sửa CV
            </button>
            <button onClick={() => router.push(`/cv/${cv.id}/view`)} className={btnSecondary}>
              <Eye className="w-4 h-4 text-zinc-500" /> Xem
            </button>
            
            {/* More Options Menu */}
            <div className="relative ml-auto" ref={menuRef}>
              <button 
                onClick={() => setShowMenu(!showMenu)}
                className={`p-2 rounded-xl transition-colors ${showMenu ? 'bg-zinc-100 text-zinc-900' : 'text-zinc-400 hover:text-zinc-900 hover:bg-zinc-100'}`}
                aria-label="Thêm tùy chọn"
              >
                <MoreHorizontal className="w-5 h-5" />
              </button>

              <AnimatePresence>
                {showMenu && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95, y: -10 }}
                    animate={{ opacity: 1, scale: 1, y: -4 }}
                    exit={{ opacity: 0, scale: 0.95, y: -10 }}
                    transition={{ duration: 0.15 }}
                    className="absolute right-0 bottom-full mb-2 w-56 bg-white rounded-2xl shadow-soft-2xl border border-zinc-100 py-2 z-10 overflow-hidden origin-bottom-right"
                  >
                    <button onClick={handleDownloadPdf} disabled={downloading} className={menuItem}>
                      <Download className="w-4 h-4 text-zinc-400" /> {downloading ? 'Đang tạo PDF...' : 'Tải PDF'}
                    </button>
                    <button onClick={() => router.push(`/cv/${cv.id}/match`)} className={menuItem}>
                      <Target className="w-4 h-4 text-violet-500" /> Match JD (ATS)
                    </button>
                    <button onClick={() => router.push(`/cv/${cv.id}/suggest`)} className={menuItem}>
                      <Target className="w-4 h-4 text-blue-500" /> Gợi ý chuyên ngành
                    </button>
                    <div className="h-px bg-zinc-100 my-1"></div>
                    <button onClick={handleDuplicate} disabled={duplicating} className={menuItem}>
                      <Copy className="w-4 h-4 text-zinc-400" /> {duplicating ? 'Đang sao chép...' : 'Nhân bản CV'}
                    </button>
                    <button onClick={handleShare} className={menuItem}>
                      <Share2 className="w-4 h-4 text-zinc-400" /> {shared ? '✓ Đã copy link' : 'Chia sẻ public'}
                    </button>
                    <div className="h-px bg-zinc-100 my-1"></div>
                    <button onClick={() => { setShowMenu(false); setConfirming(true); }} className={`${menuItem} !text-red-600 hover:!bg-red-50`}>
                      <Trash2 className="w-4 h-4 text-red-500" /> Xoá CV này
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        )}
      </motion.div>
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
      <div className="min-h-screen bg-zinc-50 flex items-center justify-center">
        <div className="w-8 h-8 border-[3px] border-zinc-300 border-t-[var(--fpt-orange)] rounded-full animate-spin" />
      </div>
    )
  }

  const atLimit = !planInfo?.isPro && cvs.length >= CONFIG.freeCvLimit
  const newCvDest = atLimit ? '/upgrade' : '/cv/new'
  const planLabel = planInfo?.isPro ? `Pro · còn ${planInfo.daysLeft} ngày` : 'Free'
  const usageHint = planInfo?.isPro ? 'Không giới hạn' : `${cvs.length}/${CONFIG.freeCvLimit} CV đã dùng`

  return (
    <div className="min-h-screen bg-zinc-50 pt-10 pb-20 px-4 md:px-8">
      {toast && <Toast tone={toast.tone} onClose={() => setToast(null)}>{toast.msg}</Toast>}

      <div className="max-w-[1000px] mx-auto">
        <div className="mb-16 relative">
          <div className="absolute -top-20 -left-20 w-64 h-64 bg-[var(--fpt-orange)] opacity-10 blur-[100px] rounded-full pointer-events-none" />
          <div className="absolute -top-20 -right-20 w-64 h-64 bg-violet-500 opacity-10 blur-[100px] rounded-full pointer-events-none" />
          
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
            <p className="text-[var(--fpt-orange)] text-sm font-black uppercase tracking-[0.2em] mb-4 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-[var(--fpt-orange)] animate-pulse" /> Workspace
            </p>
            <h1 className="text-5xl md:text-7xl font-black tracking-tighter text-zinc-900 leading-[1.1] mb-4">
              Xin chào,<br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-zinc-900 to-zinc-500">
                {email?.split('@')[0]}
              </span>
            </h1>
          </motion.div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-3 gap-6 mb-16">
          <StatCard index={0} label="Tổng CV đã tạo" value={String(cvs.length)} />
          <StatCard index={1} label="Gói thành viên" value={planLabel} />
          <StatCard index={2} label="Hạn mức sử dụng" value={planInfo?.isPro ? '∞' : `${cvs.length}/${CONFIG.freeCvLimit}`} hint={usageHint} />
        </div>

        <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6 gap-4">
          <h2 className="text-zinc-900 text-2xl font-extrabold tracking-tight">Thư viện CV</h2>
          <button
            onClick={() => router.push(newCvDest)}
            className="bg-zinc-900 text-white text-sm font-bold px-6 py-2.5 rounded-xl shadow-soft-md hover:bg-black transition-colors hover:scale-95 active:scale-90"
          >
            + {atLimit ? 'Tạo CV mới (Cần Pro)' : 'Tạo CV mới'}
          </button>
        </div>

        {atLimit && (
          <div className="bg-orange-50 border border-orange-200 text-orange-800 text-sm px-5 py-4 rounded-[1.5rem] mb-6 shadow-soft-md">
            Bạn đã đạt giới hạn {CONFIG.freeCvLimit} CV của gói Free.{' '}
            <a href="/upgrade" className="underline font-bold hover:text-orange-600 transition-colors">Nâng cấp Pro</a>{' '}
            để tạo không giới hạn và mở khóa tất cả tính năng AI.
          </div>
        )}

        {/* Search + sort */}
        {!cvsLoading && cvs.length > 0 && (
          <div className="flex flex-col sm:flex-row gap-3 mb-6">
            <input
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Tìm kiếm CV theo tiêu đề..."
              className="flex-1 bg-white border border-zinc-200/60 text-zinc-900 text-sm font-medium rounded-xl px-4 py-2.5 placeholder-zinc-400 focus:outline-none focus:border-[var(--fpt-orange)] focus:ring-2 focus:ring-orange-500/20 shadow-sm transition-all"
            />
            <select
              value={sort}
              onChange={(e) => setSort(e.target.value as SortKey)}
              className="bg-white border border-zinc-200/60 text-zinc-700 text-sm font-medium rounded-xl px-4 py-2.5 focus:outline-none focus:border-[var(--fpt-orange)] focus:ring-2 focus:ring-orange-500/20 shadow-sm cursor-pointer hover:bg-zinc-50 transition-colors"
              aria-label="Sắp xếp"
            >
              <option value="newest">Mới nhất</option>
              <option value="oldest">Cũ nhất</option>
              <option value="title">Tiêu đề A→Z</option>
            </select>
          </div>
        )}

        {cvsLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <SkeletonCard />
            <SkeletonCard />
            <SkeletonCard />
            <SkeletonCard />
          </div>
        ) : cvs.length === 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-3 md:grid-rows-2 gap-6 h-auto md:h-[500px]">
            {/* Big CTA Card */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}
              onClick={() => router.push('/cv/new')}
              className="md:col-span-2 md:row-span-2 relative overflow-hidden bg-white border-2 border-zinc-200 rounded-[2.5rem] p-10 flex flex-col justify-between group shadow-soft-xl hover:shadow-2xl hover:border-[var(--fpt-orange)] cursor-pointer transition-all duration-500"
            >
              <div className="absolute top-0 right-0 w-64 h-64 bg-[var(--fpt-orange)]/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/4 group-hover:bg-[var(--fpt-orange)]/20 transition-all duration-500"></div>
              
              <div className="relative z-10">
                <span className="inline-block px-4 py-1.5 bg-orange-100 text-[var(--fpt-orange)] font-black text-xs uppercase tracking-widest rounded-full mb-6">CV AI Builder</span>
                <h3 className="text-zinc-900 text-5xl md:text-6xl font-black tracking-tighter leading-[1.1] max-w-md">Bắt Đầu Tạo CV Chuẩn ATS</h3>
                <p className="text-zinc-500 text-lg font-medium mt-4 max-w-sm">Chỉ mất 5 phút với sự hỗ trợ của AI Co-pilot. Tự động tối ưu điểm Match JD.</p>
              </div>

              <div className="relative z-10 mt-12 md:mt-0">
                <div className="inline-flex items-center gap-3 bg-[var(--fpt-orange)] text-white text-lg font-bold px-8 py-4 rounded-2xl shadow-lg hover:bg-orange-600 transition-colors">
                  + Tạo CV Ngay Bây Giờ
                </div>
              </div>
            </motion.div>

            {/* Small Card 1 - Pro Template Preview */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.1 }} className="h-full">
              <ParallaxCard containerClassName="h-full w-full" className="bg-zinc-950 border-2 border-zinc-800 rounded-[2.5rem] p-8 flex flex-col justify-end overflow-hidden group h-full">
                <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 mix-blend-overlay pointer-events-none"></div>
                <div className="relative z-10">
                  <div className="text-yellow-400 font-black text-[10px] uppercase tracking-[0.2em] mb-2">Pro Template</div>
                  <h4 className="text-white text-2xl font-black tracking-tight">Harvard Minimal</h4>
                  <p className="text-zinc-400 text-sm mt-2 font-medium">Phong cách học thuật tinh tế</p>
                </div>
              </ParallaxCard>
            </motion.div>

            {/* Small Card 2 - Stats Snippet */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.2 }} className="h-full">
               <div className="bg-zinc-100 border-2 border-zinc-200 rounded-[2.5rem] p-8 flex flex-col justify-center items-center overflow-hidden h-full text-center relative group">
                 <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center shadow-sm mb-4 group-hover:scale-110 transition-transform">
                   <Target className="w-8 h-8 text-[var(--fpt-orange)]" />
                 </div>
                 <h4 className="text-zinc-900 text-2xl font-black tracking-tight">Match JD Score</h4>
                 <p className="text-zinc-500 text-sm mt-2 font-medium">Tự động chấm điểm độ khớp với JD theo thời gian thực.</p>
               </div>
            </motion.div>
          </div>
        ) : visibleCvs.length === 0 ? (
          <div className="text-center py-16 bg-white border border-zinc-200/60 rounded-[2rem] shadow-soft-xl">
            <p className="text-zinc-500 font-medium">Không tìm thấy CV nào khớp với “<span className="text-zinc-900 font-bold">{query}</span>”.</p>
            <button onClick={() => setQuery('')} className="text-[var(--fpt-orange)] hover:text-orange-600 font-bold text-sm mt-3 transition-colors">
              Xóa bộ lọc
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
      <div className="min-h-screen bg-zinc-50 flex items-center justify-center">
        <div className="w-8 h-8 border-[3px] border-zinc-300 border-t-[var(--fpt-orange)] rounded-full animate-spin" />
      </div>
    }>
      <DashboardContent />
    </Suspense>
  )
}
