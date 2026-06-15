import { redirect } from 'next/navigation'
import Link from 'next/link'
import AppNavbar from '@/components/AppNavbar'
import { createServerSupabase } from '@/lib/supabase-server'

interface MatchResultJson {
  overall_score?: number
  skill_match?: number
  experience_match?: number
  education_match?: number
  missing_skills?: string[]
  strengths?: string[]
  recommendation?: string
}

interface MatchRow {
  id: string
  job_text: string
  result_json: MatchResultJson | null
  created_at: string
}

function fmtDateTime(iso: string) {
  return new Date(iso).toLocaleString('vi-VN', {
    day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit',
  })
}

function scoreColor(score: number) {
  if (score >= 75) return '#10b981'
  if (score >= 50) return '#f59e0b'
  return '#ef4444'
}

export default async function MatchesHistoryPage({
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
    .select('id, title')
    .eq('id', id)
    .eq('user_id', user.id)
    .single()

  if (!cv) redirect('/dashboard?error=cv_not_found')

  const { data: matches } = await supabase
    .from('matches')
    .select('id, job_text, result_json, created_at')
    .eq('cv_id', id)
    .order('created_at', { ascending: false })

  const rows = (matches ?? []) as MatchRow[]

  return (
    <>
      <AppNavbar />
      <main className="min-h-screen bg-zinc-950 py-10 px-4">
        <div className="max-w-3xl mx-auto">
          <div className="flex items-center gap-4 mb-2">
            <Link href={`/cv/${id}/match`} className="text-zinc-500 hover:text-white transition-colors text-sm">← Match mới</Link>
            <h1 className="text-white text-2xl font-bold">Lịch sử Match</h1>
          </div>
          <p className="text-zinc-400 text-sm mb-8">CV: <span className="text-violet-400 font-medium">{cv.title}</span></p>

          {rows.length === 0 ? (
            <div className="text-center py-16">
              <div className="text-5xl mb-4">🕘</div>
              <p className="text-zinc-400 mb-4">Chưa có lần match nào cho CV này.</p>
              <Link href={`/cv/${id}/match`} className="bg-white text-black text-sm font-semibold px-6 py-2.5 rounded-lg hover:bg-zinc-200 transition-colors">
                + Match với JD
              </Link>
            </div>
          ) : (
            <div className="flex flex-col gap-4">
              {rows.map((m) => {
                const r = m.result_json
                const score = r?.overall_score ?? null
                return (
                  <div key={m.id} className="bg-zinc-900 border border-zinc-800 rounded-2xl p-5">
                    <div className="flex items-start gap-4">
                      {score !== null && (
                        <div className="shrink-0 w-14 h-14 rounded-full flex items-center justify-center font-bold text-lg"
                          style={{ color: scoreColor(score), border: `3px solid ${scoreColor(score)}` }}>
                          {score}
                        </div>
                      )}
                      <div className="min-w-0 flex-1">
                        <p className="text-zinc-500 text-xs mb-1">{fmtDateTime(m.created_at)}</p>
                        <p className="text-zinc-300 text-sm line-clamp-2 whitespace-pre-line">
                          {m.job_text.slice(0, 220)}{m.job_text.length > 220 ? '…' : ''}
                        </p>
                      </div>
                    </div>

                    {r?.missing_skills && r.missing_skills.length > 0 && (
                      <div className="mt-4">
                        <p className="text-xs font-semibold text-orange-400 mb-1.5">Kỹ năng còn thiếu</p>
                        <div className="flex flex-wrap gap-1.5">
                          {r.missing_skills.map((s, i) => (
                            <span key={i} className="text-xs text-orange-300 bg-orange-500/10 border border-orange-500/30 rounded-full px-2.5 py-0.5">{s}</span>
                          ))}
                        </div>
                      </div>
                    )}

                    {r?.recommendation && (
                      <p className="mt-3 text-xs text-zinc-400 border-l-2 border-violet-700 pl-3">{r.recommendation}</p>
                    )}
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </main>
    </>
  )
}
