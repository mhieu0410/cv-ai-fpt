import { redirect } from 'next/navigation'
import Link from 'next/link'
import AppNavbar from '@/components/AppNavbar'
import { createServerSupabase } from '@/lib/supabase-server'
import { computeAtsScore, type CheckStatus } from '@/lib/ats-score'
import type { CvData } from '@/components/cv-templates/types'

const LEVEL_META: Record<string, { label: string; color: string }> = {
  excellent: { label: 'Xuất sắc', color: '#10b981' },
  good: { label: 'Tốt', color: '#22c55e' },
  fair: { label: 'Khá', color: '#f59e0b' },
  poor: { label: 'Cần cải thiện', color: '#ef4444' },
}

const STATUS_META: Record<CheckStatus, { icon: string; cls: string }> = {
  pass: { icon: '✓', cls: 'text-emerald-400' },
  warn: { icon: '!', cls: 'text-amber-400' },
  fail: { icon: '✕', cls: 'text-red-400' },
}

export default async function AtsPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const supabase = await createServerSupabase()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: cv } = await supabase
    .from('cvs')
    .select('id, title, content')
    .eq('id', id)
    .eq('user_id', user.id)
    .single()

  if (!cv) redirect('/dashboard?error=cv_not_found')

  const result = computeAtsScore(cv.content as CvData, cv.title)
  const level = LEVEL_META[result.level]

  // Vòng tròn tiến độ
  const R = 70
  const C = 2 * Math.PI * R
  const dash = (result.score / 100) * C

  return (
    <>
      <AppNavbar />
      <main className="min-h-screen bg-zinc-950 py-10 px-4">
        <div className="max-w-3xl mx-auto">
          <div className="flex items-center gap-4 mb-8">
            <Link href={`/cv/${id}/view`} className="text-zinc-500 hover:text-white transition-colors text-sm">← Quay lại</Link>
            <h1 className="text-white text-2xl font-bold">Điểm ATS</h1>
          </div>

          <p className="text-zinc-400 text-sm mb-8">
            CV: <span className="text-violet-400 font-medium">{cv.title}</span>
          </p>

          {/* Gauge */}
          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-8 flex flex-col sm:flex-row items-center gap-8 mb-6">
            <div className="relative shrink-0" style={{ width: 180, height: 180 }}>
              <svg width="180" height="180" viewBox="0 0 180 180" className="-rotate-90">
                <circle cx="90" cy="90" r={R} fill="none" stroke="#27272a" strokeWidth="14" />
                <circle
                  cx="90" cy="90" r={R} fill="none" stroke={level.color} strokeWidth="14"
                  strokeLinecap="round" strokeDasharray={`${dash} ${C}`}
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-4xl font-extrabold" style={{ color: level.color }}>{result.score}</span>
                <span className="text-zinc-500 text-xs">/ 100</span>
              </div>
            </div>
            <div className="text-center sm:text-left">
              <p className="text-zinc-500 text-sm">Mức độ</p>
              <p className="text-2xl font-bold" style={{ color: level.color }}>{level.label}</p>
              <p className="text-zinc-400 text-sm mt-2">
                Đạt {result.passed}/{result.total} tiêu chí. Sửa các mục bên dưới để tăng khả năng vượt bộ lọc ATS.
              </p>
              <Link
                href={`/cv/${id}/edit`}
                className="inline-block mt-4 px-4 py-2 rounded-lg bg-violet-600 hover:bg-violet-500 text-white text-sm font-medium transition-colors"
              >
                ✏️ Sửa CV
              </Link>
            </div>
          </div>

          {/* Checklist */}
          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl divide-y divide-zinc-800">
            {result.checks.map((c) => {
              const st = STATUS_META[c.status]
              return (
                <div key={c.id} className="flex items-start gap-3 px-5 py-4">
                  <span className={`mt-0.5 w-6 h-6 shrink-0 rounded-full border border-current flex items-center justify-center text-sm font-bold ${st.cls}`}>
                    {st.icon}
                  </span>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between gap-2">
                      <p className="text-white text-sm font-medium">{c.label}</p>
                      <span className="text-zinc-500 text-xs shrink-0">{c.earned}/{c.weight}đ</span>
                    </div>
                    <p className="text-zinc-400 text-sm mt-0.5">{c.detail}</p>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </main>
    </>
  )
}
