'use client'

import { useEffect, useMemo, useState, Suspense, useRef } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { pdf } from '@react-pdf/renderer'
import { getTemplate } from '@/components/cv-templates/registry'
import { getUserPlan, type UserPlan } from '@/lib/user-plan'
import { CONFIG } from '@/lib/config'
import { motion, AnimatePresence } from 'framer-motion'
import { MoreHorizontal, Eye, Download, Target, Copy, Share2, Trash2, FileText } from 'lucide-react'
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
    green: 'bg-[#C4A1FF] border-black text-black',
    blue: 'bg-blue-300 border-black text-black',
    red: 'bg-red-400 border-black text-black',
  }[tone]
  return (
    <motion.div 
      initial={{ opacity: 0, y: -20, x: '-50%' }}
      animate={{ opacity: 1, y: 0, x: '-50%' }}
      exit={{ opacity: 0, y: -20, x: '-50%' }}
      className={`fixed top-6 left-1/2 ${cls} border-4 font-black text-[13px] uppercase tracking-widest px-6 py-4 rounded-xl flex items-center gap-4 shadow-[6px_6px_0_0_#000] z-50`}
    >
      <span>{children}</span>
      <button onClick={onClose} className="hover:scale-125 transition-transform leading-none text-xl">×</button>
    </motion.div>
  )
}

// ── Stat card ────────────────────────────────────────────────────────────────
function StatCard({ label, value, hint, index = 0, bgClass = 'bg-white', onClick }: { label: string; value: string; hint?: string; index?: number; bgClass?: string; onClick?: () => void }) {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1, duration: 0.5, type: 'spring' }}
      whileHover={{ y: -4, boxShadow: '8px 8px 0px 0px #000' }}
      onClick={onClick}
      className={`relative overflow-hidden ${bgClass} border-4 border-black rounded-[2rem] p-8 shadow-[4px_4px_0_0_#000] group transition-all ${onClick ? 'cursor-pointer' : ''}`}
    >
      {onClick && (
        <div className="absolute top-0 right-0 p-8">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" className="text-black transition-transform group-hover:scale-125 group-hover:rotate-12"><path d="M5 12h14"/><path d="m12 5 7 7-7 7"/></svg>
        </div>
      )}
      <p className="text-black text-xs font-black uppercase tracking-[0.15em] relative z-10 mb-6">{label}</p>
      <p className="text-black text-7xl font-black tracking-tighter relative z-10 leading-none neo-shadow-text">{value}</p>
      {hint && <p className="text-black text-sm mt-3 font-bold relative z-10 bg-white/50 inline-block px-2 py-0.5 border-2 border-black rounded-md">{hint}</p>}
    </motion.div>
  )
}

// ── Skeleton card ─────────────────────────────────────────────────────────────
function SkeletonCard() {
  return (
    <div className="bg-white border-4 border-black rounded-[1.5rem] px-6 py-5 shadow-[4px_4px_0_0_#000] animate-pulse">
      <div className="h-5 w-1/3 bg-zinc-200 rounded-md mb-3 border-2 border-black/10" />
      <div className="h-4 w-24 bg-zinc-100 rounded-md mb-6" />
      <div className="flex gap-2">
        <div className="h-10 w-24 bg-zinc-100 rounded-xl border-2 border-black/10" />
        <div className="h-10 w-24 bg-zinc-100 rounded-xl border-2 border-black/10" />
      </div>
    </div>
  )
}

// ── CV card ────────────────────────────────────────────────────────────────
function CVCard({ cv, isPro, onDeleted, onDuplicated }: { cv: CV; isPro: boolean; onDeleted: (id: string) => void; onDuplicated: (cv: CV) => void }) {
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
      const blob = await pdf(<Pdf data={data.content} isPro={isPro} />).toBlob()
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

  const btnPrimary = 'text-sm font-black uppercase tracking-widest bg-[var(--fpt-orange)] text-white px-5 py-2.5 rounded-xl border-2 border-black shadow-[2px_2px_0_0_#000] hover:translate-y-px hover:shadow-none active:scale-95 transition-all'
  const btnSecondary = 'text-sm font-black uppercase tracking-widest bg-white text-black border-2 border-black px-5 py-2.5 rounded-xl shadow-[2px_2px_0_0_#000] hover:translate-y-px hover:bg-yellow-300 hover:shadow-none active:scale-95 transition-all inline-flex items-center gap-2'
  const menuItem = 'w-full text-left px-5 py-3 text-sm text-black font-black uppercase tracking-widest hover:bg-[var(--fpt-orange)] hover:text-white flex items-center gap-3 transition-colors border-b-2 border-transparent hover:border-black disabled:opacity-50'

  return (
    <>
      {pdfToast && (
        <div className="fixed bottom-6 right-6 z-50 bg-white border-4 border-black text-black text-sm font-black uppercase tracking-widest px-5 py-4 rounded-xl flex items-center gap-3 shadow-[8px_8px_0_0_#000]">
          <span className="text-green-500 text-xl">✓</span>
          <span>Đã xuất File PDF</span>
          <span className="text-zinc-300">—</span>
          <a href="/feedback?from=pdf_export" className="text-[var(--fpt-orange)] hover:underline underline-offset-4 transition-all">Góp ý cho chúng tôi</a>
          <button onClick={() => setPdfToast(false)} className="hover:scale-125 ml-2 leading-none text-xl transition-transform">×</button>
        </div>
      )}
      
      <motion.div 
        whileHover={{ y: -4, boxShadow: '8px 8px 0px 0px #000' }}
        transition={{ type: "spring", stiffness: 400, damping: 30 }}
        className="relative bg-white rounded-[2rem] p-6 sm:p-8 border-4 border-black shadow-[4px_4px_0_0_#000] group overflow-visible"
      >
        <div className="mb-8 relative z-10">
          <div className="inline-block px-3 py-1 bg-yellow-300 border-2 border-black rounded text-[10px] font-black uppercase tracking-widest mb-4">
            Đã lưu tự động
          </div>
          <h3 className="text-black text-2xl font-black tracking-tight truncate pr-10 group-hover:text-[var(--fpt-orange)] transition-colors">{cv.title}</h3>
          <p className="text-zinc-500 text-[13px] uppercase tracking-widest mt-2 font-bold">Cập nhật lúc: {formatDate(cv.created_at)}</p>
        </div>

        {confirming ? (
          <div className="flex flex-wrap items-center gap-3 bg-red-400 p-4 rounded-xl border-4 border-black shadow-[4px_4px_0_0_#000]">
            <span className="text-sm text-black font-black uppercase tracking-widest w-full sm:w-auto">Xoá vĩnh viễn?</span>
            <button onClick={handleDelete} disabled={deleting}
              className="text-xs bg-black text-white px-4 py-2 border-2 border-black rounded-lg font-black uppercase tracking-widest hover:bg-zinc-800 disabled:opacity-50 transition-colors flex-1 sm:flex-none text-center">
              {deleting ? '...' : 'Xác nhận'}
            </button>
            <button onClick={() => setConfirming(false)} disabled={deleting}
              className="text-xs bg-white text-black px-4 py-2 border-2 border-black rounded-lg font-black uppercase tracking-widest hover:bg-zinc-100 transition-colors flex-1 sm:flex-none text-center">
              Huỷ
            </button>
          </div>
        ) : (
          <div className="flex flex-wrap sm:flex-nowrap items-center gap-3">
            <button onClick={() => router.push(`/cv/${cv.id}/edit`)} className={btnPrimary}>
              Sửa CV
            </button>
            <button onClick={() => router.push(`/cv/${cv.id}/view`)} className={btnSecondary}>
              <Eye className="w-4 h-4 stroke-[3px]" /> Xem Trước
            </button>
            
            {/* More Options Menu */}
            <div className="relative sm:ml-auto" ref={menuRef}>
              <button 
                onClick={() => setShowMenu(!showMenu)}
                className={`p-2.5 rounded-xl border-2 border-black transition-all ${showMenu ? 'bg-black text-white shadow-none translate-y-px' : 'bg-white text-black shadow-[2px_2px_0_0_#000] hover:bg-zinc-100 hover:translate-y-px hover:shadow-none'}`}
                aria-label="Thêm tùy chọn"
              >
                <MoreHorizontal className="w-5 h-5 stroke-[3px]" />
              </button>

              <AnimatePresence>
                {showMenu && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95, y: -10 }}
                    animate={{ opacity: 1, scale: 1, y: -4 }}
                    exit={{ opacity: 0, scale: 0.95, y: -10 }}
                    transition={{ duration: 0.15 }}
                    className="absolute right-0 sm:bottom-full sm:mb-2 top-full sm:top-auto mt-2 sm:mt-0 w-64 bg-white rounded-2xl shadow-[8px_8px_0_0_#000] border-4 border-black py-2 z-50 overflow-hidden origin-top-right sm:origin-bottom-right"
                  >
                    <button onClick={handleDownloadPdf} disabled={downloading} className={menuItem}>
                      <Download className="w-5 h-5 stroke-[3px]" /> {downloading ? 'Đang tạo PDF...' : 'Xuất File PDF'}
                    </button>
                    <button onClick={() => router.push(`/cv/${cv.id}/match`)} className={menuItem}>
                      <Target className="w-5 h-5 stroke-[3px]" /> AI Match JD
                    </button>
                    <button onClick={() => router.push(`/cv/${cv.id}/suggest`)} className={menuItem}>
                      <Target className="w-5 h-5 stroke-[3px]" /> Gợi ý ngành
                    </button>
                    <button onClick={() => {
                      if (isPro) router.push(`/cv/${cv.id}/cover-letter`)
                      else router.push('/upgrade')
                    }} className={`${menuItem} !text-[var(--fpt-orange)] hover:!text-white`}>
                      <FileText className="w-5 h-5 stroke-[3px]" /> Viết Cover Letter {!isPro && '🔒'}
                    </button>
                    <div className="h-1 bg-black my-2"></div>
                    <button onClick={handleDuplicate} disabled={duplicating} className={menuItem}>
                      <Copy className="w-5 h-5 stroke-[3px]" /> {duplicating ? 'Đang chép...' : 'Nhân Bản CV'}
                    </button>
                    <button onClick={handleShare} className={menuItem}>
                      <Share2 className="w-5 h-5 stroke-[3px]" /> {shared ? '✓ Đã Copy' : 'Chia Sẻ Public'}
                    </button>
                    <div className="h-1 bg-black my-2"></div>
                    <button onClick={() => { setShowMenu(false); setConfirming(true); }} className={`${menuItem} !text-red-600 hover:!bg-red-500 hover:!text-white`}>
                      <Trash2 className="w-5 h-5 stroke-[3px]" /> Ném vào thùng rác
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
  const [fullName, setFullName] = useState<string | null>(null)
  const [authLoading, setAuthLoading] = useState(true)
  const [cvs, setCvs] = useState<CV[]>([])
  const [cvsLoading, setCvsLoading] = useState(true)
  const [planInfo, setPlanInfo] = useState<UserPlan | null>(null)

  const [query, setQuery] = useState('')
  const [sort, setSort] = useState<SortKey>('newest')

  // URL flag toasts
  const [toast, setToast] = useState<null | { tone: 'green' | 'blue' | 'red'; msg: string }>(() => {
    const sp = searchParams
    if (sp.get('success') === '1') return { tone: 'green', msg: '✓ Đã Lưu CV' }
    if (sp.get('updated') === '1') return { tone: 'blue', msg: '✓ Đã Cập Nhật CV' }
    if (sp.get('error') === 'not_admin') return { tone: 'red', msg: 'Truy cập Admin bị từ chối' }
    if (sp.get('error') === 'cv_not_found') return { tone: 'red', msg: 'CV đã bốc hơi hoặc bị xoá' }
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
      setFullName(session.user.user_metadata?.full_name ?? null)
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
        <div className="w-12 h-12 border-4 border-black border-t-[var(--fpt-orange)] rounded-full animate-spin shadow-[4px_4px_0_0_#000]" />
      </div>
    )
  }

  const atLimit = !planInfo?.isPro && cvs.length >= CONFIG.freeCvLimit
  const newCvDest = atLimit ? '/upgrade' : '/cv/new'
  const planLabel = planInfo?.isPro ? `Pro` : 'Free'
  const usageHint = planInfo?.isPro ? 'Không giới hạn' : `${cvs.length}/${CONFIG.freeCvLimit} Bản`

  return (
    <div className="min-h-screen bg-zinc-50 pt-10 pb-20 px-4 md:px-8">
      {toast && <Toast tone={toast.tone} onClose={() => setToast(null)}>{toast.msg}</Toast>}

      <div className="max-w-[1100px] mx-auto">
        {/* Header Section */}
        <div className="mb-16">
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-black text-white border-2 border-black rounded text-[11px] font-black uppercase tracking-widest mb-6 shadow-[4px_4px_0_0_var(--fpt-orange)]">
              <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse" /> Workspace
            </div>
            <h1 className="text-5xl md:text-7xl font-black tracking-tighter text-black leading-[1.1] mb-2 uppercase neo-shadow-text">
              Dashboard
            </h1>
            <p className="text-xl md:text-2xl font-bold text-zinc-500 flex flex-wrap items-center gap-3 mt-2">
              <span>Xin chào,</span> <span className="text-black bg-yellow-300 px-2 leading-relaxed">{fullName || email?.split('@')[0]}</span>
              {planInfo?.isPro && (
                <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-gradient-to-r from-yellow-300 to-yellow-500 text-black border-2 border-black rounded-lg text-[12px] font-black uppercase tracking-widest shadow-[2px_2px_0_0_#000] animate-pulse">
                  <span>👑</span> VIP PRO
                </span>
              )}
            </p>
          </motion.div>
        </div>

        {/* Stats Bento Grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 gap-6 mb-16">
          <StatCard index={0} label="Hồ Sơ Đã Tạo" value={String(cvs.length)} bgClass="bg-[#C4A1FF]" onClick={() => document.getElementById('cv-list')?.scrollIntoView({ behavior: 'smooth' })} />
          <StatCard index={1} label="Gói Hiện Tại" value={planLabel} hint={planInfo?.isPro ? `Còn ${planInfo.daysLeft} ngày` : 'Nâng cấp Pro'} bgClass={planInfo?.isPro ? 'bg-yellow-400' : 'bg-[var(--fpt-orange)]'} onClick={() => router.push('/upgrade')} />
          <StatCard index={2} label="Hạn Mức (CV)" value={planInfo?.isPro ? '∞' : `${cvs.length}`} hint={usageHint} onClick={() => router.push('/upgrade')} />
        </div>

        {/* Toolbar */}
        <div id="cv-list" className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-6 border-b-4 border-black pb-6">
          <h2 className="text-black text-3xl font-black tracking-tighter uppercase">Danh sách hồ sơ</h2>
          <button
            onClick={() => router.push(newCvDest)}
            className="bg-black text-white text-[13px] font-black uppercase tracking-widest px-8 py-4 rounded-2xl border-4 border-black shadow-[6px_6px_0_0_var(--fpt-orange)] hover:bg-[var(--fpt-orange)] hover:text-black hover:translate-y-1 hover:shadow-[2px_2px_0_0_#000] active:scale-95 transition-all"
          >
            + {atLimit ? 'Tạo CV (Cần Mua Pro)' : 'Tạo CV Ngay'}
          </button>
        </div>

        {atLimit && (
          <div className="bg-yellow-300 border-4 border-black text-black text-sm font-black uppercase px-6 py-5 rounded-2xl mb-8 shadow-[6px_6px_0_0_#000] flex items-center justify-between flex-wrap gap-4">
            <div className="flex items-center gap-3">
              <span className="text-2xl">⚠️</span>
              <span>Đã cạn kiệt hạn mức {CONFIG.freeCvLimit} CV của gói Free.</span>
            </div>
            <a href="/upgrade" className="bg-black text-white px-5 py-2.5 rounded-lg hover:scale-105 transition-transform">Lên Đời Pro</a>
          </div>
        )}

        {/* Search + sort */}
        {!cvsLoading && cvs.length > 0 && (
          <div className="flex flex-col sm:flex-row gap-4 mb-10">
            <div className="flex-1 relative">
              <div className="absolute left-4 top-1/2 -translate-y-1/2 text-xl font-black">🔍</div>
              <input
                type="search"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="TÌM KIẾM THEO TÊN..."
                className="w-full bg-white border-4 border-black text-black text-sm font-black uppercase tracking-widest rounded-2xl pl-12 pr-4 py-4 focus:outline-none focus:shadow-[6px_6px_0_0_var(--fpt-orange)] transition-all placeholder-zinc-400"
              />
            </div>
            <select
              value={sort}
              onChange={(e) => setSort(e.target.value as SortKey)}
              className="bg-white border-4 border-black text-black text-sm font-black uppercase tracking-widest rounded-2xl px-6 py-4 focus:outline-none focus:shadow-[6px_6px_0_0_#000] cursor-pointer hover:bg-zinc-100 transition-all appearance-none text-center"
              aria-label="Sắp xếp"
            >
              <option value="newest">Mới Nhất</option>
              <option value="oldest">Cũ Nhất</option>
              <option value="title">A → Z</option>
            </select>
          </div>
        )}

        {/* Grid List */}
        {cvsLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <SkeletonCard />
            <SkeletonCard />
            <SkeletonCard />
            <SkeletonCard />
          </div>
        ) : cvs.length === 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-3 md:grid-rows-2 gap-6 h-auto md:h-[520px]">
            {/* Big CTA Card */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}
              onClick={() => router.push('/cv/new')}
              className="md:col-span-2 md:row-span-2 relative overflow-hidden bg-[#C4A1FF] border-4 border-black rounded-[2.5rem] p-10 flex flex-col justify-between group shadow-[8px_8px_0_0_#000] hover:shadow-[16px_16px_0_0_#000] hover:-translate-y-2 cursor-pointer transition-all duration-300"
            >
              <div className="absolute top-0 right-0 w-80 h-80 bg-[var(--fpt-orange)] rounded-full blur-3xl opacity-50 -translate-y-1/2 translate-x-1/4 group-hover:scale-125 transition-all duration-700 pointer-events-none"></div>
              
              <div className="relative z-10">
                <span className="inline-block px-4 py-2 bg-black text-white font-black text-[11px] uppercase tracking-[0.2em] rounded border-2 border-transparent mb-6 shadow-[2px_2px_0_0_var(--fpt-orange)]">Công cụ cốt lõi</span>
                <h3 className="text-black text-5xl md:text-7xl font-black tracking-tighter leading-[1.1] max-w-lg neo-shadow-text">Khởi Tạo <br/>CV Tương Lai</h3>
                <p className="text-black font-bold text-lg mt-6 max-w-sm bg-white/50 inline-block p-2 rounded-xl border-2 border-black">Tích hợp AI Co-pilot. Tự động soi lỗi và tối ưu hóa từ khóa JD theo thời gian thực.</p>
              </div>

              <div className="relative z-10 mt-12 md:mt-0">
                <div className="inline-flex items-center gap-3 bg-[var(--fpt-orange)] border-4 border-black text-white text-[15px] font-black uppercase tracking-widest px-8 py-5 rounded-2xl shadow-[6px_6px_0_0_#000] group-hover:bg-black group-hover:shadow-[10px_10px_0_0_var(--fpt-orange)] transition-all">
                  + Tạo CV Đầu Tiên
                </div>
              </div>
            </motion.div>

            {/* Small Card 1 - Pro Template Preview */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.1 }} className="h-full">
              <ParallaxCard containerClassName="h-full w-full" className="bg-zinc-950 border-4 border-black rounded-[2.5rem] p-8 flex flex-col justify-end overflow-hidden group h-full shadow-[6px_6px_0_0_#000]">
                <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 mix-blend-overlay pointer-events-none"></div>
                <div className="relative z-10">
                  <div className="bg-yellow-300 text-black font-black text-[10px] uppercase tracking-[0.2em] mb-4 inline-block px-2 py-1 rounded border-2 border-black">Pro Template</div>
                  <h4 className="text-white text-3xl font-black tracking-tighter uppercase">Harvard Minimal</h4>
                  <p className="text-zinc-400 text-sm mt-3 font-bold uppercase tracking-widest">Phong cách học thuật</p>
                </div>
              </ParallaxCard>
            </motion.div>

            {/* Small Card 2 - Stats Snippet */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.2 }} className="h-full">
               <div className="bg-yellow-300 border-4 border-black rounded-[2.5rem] p-8 flex flex-col justify-center items-center overflow-hidden h-full text-center relative group shadow-[6px_6px_0_0_#000]">
                 <div className="w-20 h-20 bg-white border-4 border-black rounded-full flex items-center justify-center shadow-[4px_4px_0_0_#000] mb-6 group-hover:scale-110 group-hover:-rotate-12 transition-transform">
                   <Target className="w-10 h-10 text-black stroke-[3px]" />
                 </div>
                 <h4 className="text-black text-2xl font-black tracking-tighter uppercase">Match JD Score</h4>
                 <p className="text-black text-[13px] mt-2 font-bold uppercase tracking-widest">Chấm điểm độ khớp thời gian thực.</p>
               </div>
            </motion.div>
          </div>
        ) : visibleCvs.length === 0 ? (
          <div className="text-center py-24 bg-white border-4 border-black rounded-[2rem] shadow-[8px_8px_0_0_#000]">
            <p className="text-black text-2xl font-black tracking-tighter uppercase">Không tìm thấy "{query}"</p>
            <button onClick={() => setQuery('')} className="mt-6 bg-black text-white px-6 py-3 rounded-xl font-black uppercase tracking-widest text-sm hover:bg-[var(--fpt-orange)] transition-colors">
              Xóa bộ lọc
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {visibleCvs.map((cv) => (
              <CVCard
                key={cv.id}
                cv={cv}
                isPro={!!planInfo?.isPro}
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
        <div className="w-12 h-12 border-4 border-black border-t-[var(--fpt-orange)] rounded-full animate-spin shadow-[4px_4px_0_0_#000]" />
      </div>
    }>
      <DashboardContent />
    </Suspense>
  )
}
