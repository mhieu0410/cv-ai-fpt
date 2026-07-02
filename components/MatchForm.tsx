'use client'

import { useState, useEffect, useCallback } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import type { CvData } from '@/components/cv-templates/types'
import { percentileFromScore } from '@/lib/job-matching'

const LOADING_MESSAGES = [
  '> KHỞI TẠO HỆ THỐNG AI...',
  '> ĐỌC DỮ LIỆU CV GỐC...',
  '> BÓC TÁCH MÔ TẢ CÔNG VIỆC (JD)...',
  '> SO KHỚP KỸ NĂNG VÀ TỪ KHÓA...',
  '> TỔNG HỢP ĐIỂM SỐ...',
]

interface AnalyzeResult {
  fit_score: number
  overall_score: number
  matching_skills: string[]
  missing_skills: string[]
  why_good_fit: string
  cover_letter: string
  interview_tips: string[]
}

interface RecommendedJob {
  job_id: string
  title: string
  location?: string
  company?: string
  job_url?: string
  salary_range?: string
  deadline?: string
  job_description: string
}

interface CvAnalysis {
  current_role?: string
  location?: string
  skills?: string[]
  years_experience?: number
  education?: string
}

interface Props {
  cvId: string
  cvTitle: string
  cvContent: CvData
  isPro: boolean
}

function getScoreLevel(score: number) {
  if (score >= 75) return { color: '#00A651', textColor: 'text-[#00A651]', ring: 'border-[#00A651]', label: 'PHÙ HỢP CAO' }
  if (score >= 50) return { color: '#F26F21', textColor: 'text-[var(--fpt-orange)]', ring: 'border-[var(--fpt-orange)]', label: 'CẦN CẢI THIỆN' }
  return { color: '#EF4444', textColor: 'text-red-500', ring: 'border-red-500', label: 'RỦI RO TRƯỢT CAO' }
}

/** Dựng cv_analysis tối giản từ CV (dùng cho tab dán JD thủ công). */
function buildLocalCvAnalysis(cv: CvData): CvAnalysis {
  const education = (cv.education ?? [])
    .map((e) => [e.school, e.major].filter(Boolean).join(' - '))
    .filter(Boolean)
    .join('; ')
  return {
    current_role: '',
    location: '',
    skills: cv.skills ?? [],
    years_experience: 0,
    education,
  }
}

function TerminalLoading({ messages }: { messages: string[] }) {
  const [currentLine, setCurrentLine] = useState(0)
  const [text, setText] = useState('')
  useEffect(() => {
    if (currentLine >= messages.length) return
    let i = 0
    const fullText = messages[currentLine]
    const timer = setInterval(() => {
      setText(fullText.substring(0, i)); i++
      if (i > fullText.length) {
        clearInterval(timer)
        setTimeout(() => { setCurrentLine((c) => c + 1); setText('') }, 700)
      }
    }, 28)
    return () => clearInterval(timer)
  }, [currentLine, messages])

  return (
    <div className="border-4 border-black bg-zinc-950 p-6 sm:p-8 shadow-[8px_8px_0_0_#000] rounded-2xl min-h-[300px] flex flex-col relative overflow-hidden font-mono">
      <div className="absolute top-0 left-0 w-full h-8 bg-zinc-200 border-b-4 border-black flex items-center px-4 gap-2">
        <div className="w-3 h-3 rounded-full bg-red-500 border-2 border-black" />
        <div className="w-3 h-3 rounded-full bg-yellow-400 border-2 border-black" />
        <div className="w-3 h-3 rounded-full bg-green-500 border-2 border-black" />
        <span className="ml-4 text-[10px] font-black tracking-widest text-black">AI_CORE_TERMINAL_V1.0</span>
      </div>
      <div className="mt-8 flex-1 text-green-400 text-sm leading-relaxed">
        {messages.slice(0, currentLine).map((msg, i) => (
          <div key={i} className="mb-2 opacity-70">{msg} <span className="text-white">[OK]</span></div>
        ))}
        {currentLine < messages.length && (
          <div className="mb-2 text-yellow-300">{text}<span className="animate-pulse">_</span></div>
        )}
      </div>
    </div>
  )
}

function JobCard({ job, onClick, active }: { job: RecommendedJob; onClick: () => void; active: boolean }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`w-full text-left border-4 border-black rounded-2xl p-4 bg-white shadow-[4px_4px_0_0_#000] transition-all hover:-translate-y-1 hover:shadow-[7px_7px_0_0_#000] ${active ? 'ring-4 ring-[var(--fpt-orange)]/30' : ''}`}
    >
      <p className="font-black text-black leading-tight">{job.title}</p>
      <p className="text-[12px] font-bold text-zinc-500 mt-0.5">
        {[job.company, job.location].filter(Boolean).join(' · ')}
      </p>
      {job.job_description && (
        <p className="mt-2 text-[12px] font-medium text-zinc-500 line-clamp-2 leading-relaxed">
          {job.job_description.slice(0, 160)}…
        </p>
      )}
      <div className="mt-3 flex items-center gap-3">
        <span className="text-[11px] font-black uppercase tracking-widest text-[var(--fpt-orange)]">Phân tích độ khớp →</span>
        {job.job_url && (
          <a href={job.job_url} target="_blank" rel="noopener noreferrer" onClick={(e) => e.stopPropagation()}
            className="text-[11px] font-bold text-zinc-400 underline hover:text-black">Xem tin gốc ↗</a>
        )}
      </div>
    </button>
  )
}

export default function MatchForm({ cvId, cvTitle, cvContent, isPro }: Props) {
  const router = useRouter()
  const [tab, setTab] = useState<'jobs' | 'manual'>('jobs')

  // Gợi ý việc thật từ CV
  const [jobs, setJobs] = useState<RecommendedJob[] | null>(null)
  const [analysis, setAnalysis] = useState<CvAnalysis | null>(null)
  const [jobsLoading, setJobsLoading] = useState(false)
  const [jobsError, setJobsError] = useState<string | null>(null)

  // Deep analyze
  const [jobText, setJobText] = useState('')
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<AnalyzeResult | null>(null)
  const [activeJobId, setActiveJobId] = useState<string | null>(null)
  const [activeJobLabel, setActiveJobLabel] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [copiedCover, setCopiedCover] = useState(false)

  const fetchJobs = useCallback(async () => {
    setJobsLoading(true); setJobsError(null)
    try {
      const res = await fetch('/api/jobs/recommend', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ cv_id: cvId }),
      })
      if (res.status === 401) { router.push('/login'); return }
      const data = await res.json().catch(() => ({}))
      if (!res.ok) { setJobsError(data?.message || 'Không tải được gợi ý việc. Thử lại nhé.'); return }
      setJobs(Array.isArray(data.jobs) ? data.jobs : [])
      setAnalysis(data.cv_analysis ?? null)
    } catch {
      setJobsError('Mất kết nối tới dịch vụ gợi ý việc.')
    } finally {
      setJobsLoading(false)
    }
  }, [cvId, router])

  useEffect(() => {
    if (tab === 'jobs' && jobs === null && !jobsLoading) fetchJobs()
  }, [tab, jobs, jobsLoading, fetchJobs])

  async function runAnalyze(cvAnalysis: CvAnalysis, job: Record<string, unknown>, label: string) {
    setLoading(true); setError(null); setResult(null); setActiveJobLabel(label); setCopiedCover(false)
    try {
      const res = await fetch('/api/jobs/analyze', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ cv_id: cvId, cv_analysis: cvAnalysis, job }),
      })
      if (res.status === 401) { router.push('/login'); return }
      if (res.status === 404) { router.push('/dashboard?error=cv_not_found'); return }
      if (!res.ok) { setError('HỆ THỐNG AI ĐANG QUÁ TẢI HOẶC KHỞI ĐỘNG. THỬ LẠI SAU.'); setLoading(false); return }
      const data = await res.json()
      setTimeout(() => { setResult(data.result); setLoading(false) }, Math.max(0, LOADING_MESSAGES.length * 900 - 1200))
    } catch {
      setError('MẤT KẾT NỐI VỚI MÁY CHỦ AI.'); setLoading(false)
    }
  }

  function pickJob(job: RecommendedJob) {
    if (loading) return
    setActiveJobId(job.job_id)
    const cvAnalysis = analysis ?? buildLocalCvAnalysis(cvContent)
    runAnalyze(cvAnalysis, job as unknown as Record<string, unknown>, `${job.title}${job.company ? ' · ' + job.company : ''}`)
  }

  function submitManual(e: React.FormEvent) {
    e.preventDefault()
    if (jobText.length < 50 || loading) return
    setActiveJobId(null)
    const job = { job_id: 'manual', title: 'JD tùy chỉnh', company: '', location: '', job_description: jobText }
    runAnalyze(buildLocalCvAnalysis(cvContent), job, 'JD tự dán')
  }

  const tabCls = (on: boolean) =>
    `px-5 py-2.5 rounded-xl border-2 border-black text-[13px] font-black uppercase tracking-widest shadow-[2px_2px_0_0_#000] transition-all ${on ? 'bg-black text-white' : 'bg-white text-black hover:bg-zinc-100'}`

  return (
    <main className="min-h-screen bg-zinc-50 pt-20 pb-32">
      <div className="max-w-6xl mx-auto px-4 md:px-8">
        {/* Header */}
        <div className="mb-8">
          <div className="inline-block px-3 py-1 bg-yellow-300 border-2 border-black rounded text-[11px] font-black uppercase tracking-widest mb-4 shadow-[2px_2px_0_0_#000]">
            AI JOB MATCH
          </div>
          <h1 className="text-5xl md:text-7xl font-black tracking-tighter text-black uppercase mb-4 neo-shadow-text leading-[1.1]">VIỆC HỢP VỚI BẠN</h1>
          <p className="text-lg font-bold text-zinc-500 mb-4 uppercase tracking-widest">GỢI Ý CÔNG VIỆC TỪ CV & PHÂN TÍCH ĐỘ KHỚP</p>
          <div className="flex flex-wrap items-center gap-3">
            <div className="inline-flex items-center gap-2 bg-white px-4 py-2 border-2 border-black shadow-[4px_4px_0_0_#000]">
              <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
              <span className="text-[13px] font-black uppercase tracking-widest text-black">CV: {cvTitle}</span>
            </div>
            <Link href={`/cv/${cvId}/matches`} className="text-[13px] font-black uppercase tracking-widest text-[var(--fpt-orange)] hover:underline">← LỊCH SỬ MATCH</Link>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-8">
          <button className={tabCls(tab === 'jobs')} onClick={() => setTab('jobs')}>🎯 Việc phù hợp</button>
          <button className={tabCls(tab === 'manual')} onClick={() => setTab('manual')}>📋 Dán JD thủ công</button>
        </div>

        <div className="flex flex-col lg:flex-row gap-10">
          {/* LEFT */}
          <div className="w-full lg:w-[45%] shrink-0">
            {tab === 'jobs' ? (
              <div className="flex flex-col gap-3">
                {analysis && (
                  <div className="border-4 border-black bg-white rounded-2xl p-4 shadow-[4px_4px_0_0_#000] mb-1">
                    <p className="text-[11px] font-black uppercase tracking-widest text-zinc-400 mb-1">AI đọc CV của bạn</p>
                    <p className="text-sm font-bold text-black">
                      {[analysis.current_role, analysis.years_experience ? `${analysis.years_experience} năm KN` : null, analysis.location].filter(Boolean).join(' · ') || 'Đã phân tích hồ sơ'}
                    </p>
                    {analysis.skills?.length ? (
                      <div className="mt-2 flex flex-wrap gap-1.5">
                        {analysis.skills.slice(0, 8).map((s) => (
                          <span key={s} className="text-[10px] font-bold px-2 py-0.5 border-2 border-black rounded bg-zinc-100">{s}</span>
                        ))}
                      </div>
                    ) : null}
                  </div>
                )}

                <div className="flex items-center justify-between">
                  <p className="text-[13px] font-black uppercase tracking-widest text-zinc-500">
                    {jobs?.length ? `${jobs.length} việc gợi ý — bấm để AI phân tích` : 'Gợi ý việc từ CV của bạn'}
                  </p>
                  {jobs && !jobsLoading && (
                    <button onClick={fetchJobs} className="text-[11px] font-black uppercase tracking-widest text-[var(--fpt-orange)] hover:underline">↻ Tải lại</button>
                  )}
                </div>

                {jobsLoading && (
                  <div className="border-4 border-black bg-white rounded-2xl p-8 text-center shadow-[4px_4px_0_0_#000]">
                    <div className="w-8 h-8 border-[3px] border-zinc-300 border-t-[var(--fpt-orange)] rounded-full animate-spin mx-auto mb-4" />
                    <p className="font-black text-black uppercase tracking-widest text-sm">Đang tìm việc phù hợp...</p>
                    <p className="text-xs font-bold text-zinc-400 mt-1">AI đang quét tin tuyển dụng theo CV (có thể mất ~30-60s lần đầu).</p>
                  </div>
                )}

                {jobsError && !jobsLoading && (
                  <div className="border-4 border-red-500 bg-red-50 rounded-2xl p-5 text-center">
                    <p className="font-black text-red-600 text-sm mb-3">{jobsError}</p>
                    <button onClick={fetchJobs} className="text-[12px] font-black uppercase tracking-widest border-2 border-black bg-white px-4 py-2 rounded-lg shadow-[2px_2px_0_0_#000]">Thử lại</button>
                  </div>
                )}

                {jobs && !jobsLoading && jobs.length === 0 && !jobsError && (
                  <div className="border-4 border-dashed border-black bg-white rounded-2xl p-6 text-center">
                    <p className="font-black text-black">Chưa tìm thấy việc phù hợp</p>
                    <p className="text-sm font-bold text-zinc-500 mt-1">Thử bổ sung kỹ năng/kinh nghiệm vào CV rồi tải lại.</p>
                  </div>
                )}

                {jobs && !jobsLoading && jobs.map((job) => (
                  <JobCard key={job.job_id} job={job} active={activeJobId === job.job_id} onClick={() => pickJob(job)} />
                ))}
              </div>
            ) : (
              <form onSubmit={submitManual} className="bg-white border-4 border-black p-6 sm:p-8 rounded-2xl shadow-[8px_8px_0_0_#000]">
                <label className="block text-black font-black uppercase tracking-widest text-[14px] mb-4">DÁN MÔ TẢ CÔNG VIỆC (JD)</label>
                <textarea
                  rows={12}
                  value={jobText}
                  onChange={(e) => setJobText(e.target.value)}
                  placeholder="Ví dụ: Yêu cầu ứng viên có 2 năm kinh nghiệm ReactJS, hiểu biết về Next.js, UI/UX..."
                  disabled={loading}
                  className="w-full bg-zinc-50 border-4 border-black rounded-xl px-5 py-4 text-black font-bold text-[15px] placeholder-zinc-400 focus:outline-none focus:shadow-[6px_6px_0_0_var(--fpt-orange)] resize-none transition-all disabled:opacity-50"
                />
                <p className={`text-[11px] font-black uppercase tracking-widest mt-3 mb-6 ${jobText.length >= 50 ? 'text-green-600' : 'text-zinc-400'}`}>
                  {jobText.length} / MIN 50 KÝ TỰ
                </p>
                <button type="submit" disabled={jobText.length < 50 || loading}
                  className="w-full py-5 px-6 rounded-xl font-black uppercase tracking-widest text-[16px] text-white bg-black border-4 border-black shadow-[6px_6px_0_0_var(--fpt-orange)] hover:-translate-y-1 hover:shadow-[10px_10px_0_0_var(--fpt-orange)] active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none transition-all">
                  {loading ? 'ĐANG PHÂN TÍCH...' : 'QUÉT VÀ PHÂN TÍCH'}
                </button>
              </form>
            )}
          </div>

          {/* RIGHT */}
          <div className="w-full lg:flex-1">
            {!loading && !result && !error && (
              <div className="border-4 border-black bg-zinc-100 border-dashed rounded-2xl h-full min-h-[400px] flex flex-col items-center justify-center p-10 text-center opacity-70">
                <div className="text-6xl mb-6">🤖</div>
                <h3 className="text-black font-black uppercase tracking-widest text-xl mb-2">CHỜ BẠN CHỌN VIỆC</h3>
                <p className="text-zinc-500 font-bold max-w-sm">
                  {tab === 'jobs' ? 'Bấm vào một việc bên trái để AI phân tích độ khớp với CV của bạn.' : 'Dán JD vào ô bên trái rồi bấm phân tích.'}
                </p>
              </div>
            )}

            {loading && <TerminalLoading messages={LOADING_MESSAGES} />}
            {error && !loading && (
              <div className="border-4 border-red-500 bg-red-50 rounded-2xl p-6 text-center font-black uppercase tracking-widest text-red-600">{error}</div>
            )}

            {!loading && result && (() => {
              const level = getScoreLevel(result.overall_score)
              const pct = percentileFromScore(result.overall_score)
              return (
                <div className="border-4 border-black bg-[#C4A1FF] p-6 sm:p-8 shadow-[8px_8px_0_0_#000] rounded-2xl relative overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-500">
                  <div className="absolute top-0 right-0 w-64 h-64 bg-white/30 rounded-full blur-3xl -translate-y-1/2 translate-x-1/4 pointer-events-none" />

                  {activeJobLabel && (
                    <p className="relative z-10 text-[12px] font-black uppercase tracking-widest text-black/70 mb-3">Vị trí: {activeJobLabel}</p>
                  )}

                  {/* Overall + hook (FREE) */}
                  <div className="flex flex-col sm:flex-row items-center sm:items-start gap-8 relative z-10">
                    <div className={`flex items-center justify-center w-40 h-40 rounded-full border-8 bg-white shadow-[8px_8px_0_0_#000] shrink-0 ${level.ring}`}>
                      <span className="text-6xl font-black tracking-tighter" style={{ color: level.color }}>{result.overall_score}%</span>
                    </div>
                    <div className="text-center sm:text-left mt-2 sm:mt-4">
                      <p className={`text-lg font-black uppercase tracking-widest bg-white inline-block px-3 py-1 border-2 border-black shadow-[2px_2px_0_0_#000] ${level.textColor}`}>{level.label}</p>
                      <p className="mt-4 text-black font-bold text-[15px] leading-relaxed max-w-md">
                        Độ khớp <b>{result.overall_score}%</b> — cao hơn <b>~{pct}%</b> ứng viên cho vị trí này. {result.overall_score >= 75 ? 'CV của bạn rất tiềm năng!' : 'Còn vài điểm có thể cải thiện để tăng cơ hội.'}
                      </p>
                    </div>
                  </div>

                  {/* Detail — Pro gate */}
                  <div className="mt-8 relative z-10">
                    {isPro ? (
                      <div className="flex flex-col gap-6">
                        {result.why_good_fit && (
                          <div className="bg-white border-4 border-black p-6 rounded-xl shadow-[4px_4px_0_0_#000]">
                            <h3 className="text-[13px] font-black uppercase tracking-widest text-black mb-3 bg-yellow-300 inline-block px-3 py-1 border-2 border-black">VÌ SAO PHÙ HỢP</h3>
                            <p className="text-black font-bold leading-relaxed text-[15px]">{result.why_good_fit}</p>
                          </div>
                        )}

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          {result.matching_skills?.length > 0 && (
                            <div className="bg-green-50 border-4 border-black p-5 rounded-xl shadow-[4px_4px_0_0_#000]">
                              <h3 className="text-[12px] font-black uppercase tracking-widest text-green-700 mb-3 bg-green-200 inline-block px-2.5 py-1 border-2 border-black">KỸ NĂNG KHỚP</h3>
                              <div className="flex flex-wrap gap-2">
                                {result.matching_skills.map((s) => (<span key={s} className="text-xs font-bold text-black border-2 border-black px-3 py-1 bg-white shadow-[2px_2px_0_0_#000]">✓ {s}</span>))}
                              </div>
                            </div>
                          )}
                          {result.missing_skills?.length > 0 && (
                            <div className="bg-white border-4 border-black p-5 rounded-xl shadow-[4px_4px_0_0_#000]">
                              <h3 className="text-[12px] font-black uppercase tracking-widest text-red-600 mb-3 bg-red-100 inline-block px-2.5 py-1 border-2 border-black">CÒN THIẾU</h3>
                              <div className="flex flex-wrap gap-2">
                                {result.missing_skills.map((s) => (<span key={s} className="text-xs font-bold text-black border-2 border-black px-3 py-1 bg-zinc-200">{s}</span>))}
                              </div>
                            </div>
                          )}
                        </div>

                        {result.cover_letter && (
                          <div className="bg-white border-4 border-black p-6 rounded-xl shadow-[4px_4px_0_0_#000]">
                            <div className="flex items-center justify-between mb-3">
                              <h3 className="text-[13px] font-black uppercase tracking-widest text-black bg-[#C4A1FF] inline-block px-3 py-1 border-2 border-black">✉️ THƯ XIN VIỆC GỢI Ý</h3>
                              <button
                                type="button"
                                onClick={() => { navigator.clipboard?.writeText(result.cover_letter); setCopiedCover(true); setTimeout(() => setCopiedCover(false), 2000) }}
                                className="text-[11px] font-black uppercase tracking-widest border-2 border-black bg-white px-3 py-1.5 rounded-lg shadow-[2px_2px_0_0_#000] hover:bg-zinc-100"
                              >
                                {copiedCover ? '✓ Đã copy' : 'Copy'}
                              </button>
                            </div>
                            <p className="text-black font-medium leading-relaxed text-[14px] whitespace-pre-line">{result.cover_letter}</p>
                          </div>
                        )}

                        {result.interview_tips?.length > 0 && (
                          <div className="bg-white border-4 border-black p-6 rounded-xl shadow-[4px_4px_0_0_#000]">
                            <h3 className="text-[13px] font-black uppercase tracking-widest text-black mb-4 bg-yellow-300 inline-block px-3 py-1 border-2 border-black">💡 MẸO PHỎNG VẤN</h3>
                            <ul className="space-y-3">
                              {result.interview_tips.map((t, i) => (
                                <li key={i} className="flex items-start gap-3 text-black font-bold text-[14px]"><span className="text-[var(--fpt-orange)] text-lg leading-none shrink-0">→</span><span>{t}</span></li>
                              ))}
                            </ul>
                          </div>
                        )}

                        <Link href={`/cv/${cvId}/edit`} className="text-center py-4 px-4 rounded-xl border-4 border-black bg-[var(--fpt-orange)] text-white font-black uppercase tracking-widest text-[14px] shadow-[4px_4px_0_0_#000] hover:-translate-y-1 hover:shadow-none active:scale-95 transition-all">
                          SỬA CV NGAY
                        </Link>
                      </div>
                    ) : (
                      <div className="bg-white border-4 border-black rounded-xl p-8 shadow-[4px_4px_0_0_#000] text-center">
                        <div className="text-4xl mb-3">🔒</div>
                        <h3 className="text-xl font-black uppercase tracking-tighter text-black mb-2">Mở khóa phân tích chi tiết</h3>
                        <p className="text-zinc-600 font-bold text-[14px] max-w-md mx-auto mb-6">
                          Xem lý do phù hợp, kỹ năng còn thiếu, <b>thư xin việc soạn sẵn</b> và <b>mẹo phỏng vấn</b> riêng cho vị trí này — dành cho tài khoản Pro.
                        </p>
                        <Link href="/upgrade" className="inline-block py-4 px-8 rounded-xl border-4 border-black bg-black text-white font-black uppercase tracking-widest text-[14px] shadow-[4px_4px_0_0_var(--fpt-orange)] hover:-translate-y-1 hover:shadow-[6px_6px_0_0_var(--fpt-orange)] active:scale-95 transition-all">
                          NÂNG CẤP PRO →
                        </Link>
                      </div>
                    )}
                  </div>
                </div>
              )
            })()}
          </div>
        </div>
      </div>
    </main>
  )
}
