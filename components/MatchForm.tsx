'use client'

import { useRef, useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { analyzeKeywords, type KeywordAnalysis } from '@/lib/keyword-analysis'
import type { CvData } from '@/components/cv-templates/types'

const LOADING_MESSAGES = [
  '> KHỞI TẠO HỆ THỐNG AI...',
  '> ĐỌC DỮ LIỆU CV GỐC...',
  '> BÓC TÁCH MÔ TẢ CÔNG VIỆC (JD)...',
  '> SO KHỚP KỸ NĂNG VÀ TỪ KHÓA...',
  '> PHÂN TÍCH KINH NGHIỆM LÀM VIỆC...',
  '> TỔNG HỢP ĐIỂM SỐ...',
  '> TẠO BÁO CÁO CHI TIẾT...',
]

interface MatchResult {
  overall_score: number
  skill_match: number
  experience_match: number
  education_match: number
  missing_skills: string[]
  strengths: string[]
  recommendation: string
}

interface Props {
  cvId: string
  cvTitle: string
  cvContent: CvData
}

function getScoreLevel(score: number) {
  if (score >= 75) {
    return { color: '#00A651', textColor: 'text-[#00A651]', ring: 'border-[#00A651]', bg: 'bg-[#00A651]/10', label: 'PHÙ HỢP CAO' }
  }
  if (score >= 50) {
    return { color: '#F26F21', textColor: 'text-[var(--fpt-orange)]', ring: 'border-[var(--fpt-orange)]', bg: 'bg-[var(--fpt-orange)]/10', label: 'CẦN CẢI THIỆN' }
  }
  return { color: '#EF4444', textColor: 'text-red-500', ring: 'border-red-500', bg: 'bg-red-500/10', label: 'RỦI RO TRƯỢT CAO' }
}

function ScoreBar({ label, value }: { label: string; value: number }) {
  const pct = Math.max(0, Math.min(100, value))
  return (
    <div className="mb-4">
      <div className="flex items-center justify-between mb-2">
        <span className="text-[13px] font-black uppercase tracking-widest text-black">{label}</span>
        <span className="text-[13px] font-black uppercase tracking-widest text-black">{pct}%</span>
      </div>
      <div className="h-4 border-2 border-black bg-zinc-100 overflow-hidden">
        <div className="h-full bg-[#C4A1FF] border-r-2 border-black transition-all duration-1000 ease-out" style={{ width: `${pct}%` }} />
      </div>
    </div>
  )
}

function KeywordPanel({ data }: { data: KeywordAnalysis }) {
  const pctColor = data.matchPct >= 70 ? 'text-green-500' : data.matchPct >= 40 ? 'text-[var(--fpt-orange)]' : 'text-red-500'
  return (
    <div className="border-4 border-black bg-white p-6 sm:p-8 shadow-[6px_6px_0_0_#000] rounded-2xl mb-8">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-black uppercase tracking-tighter text-black">QUÉT TỪ KHOÁ NHANH</h2>
        <span className={`text-4xl font-black tracking-tighter ${pctColor} neo-shadow-text`}>{data.matchPct}%</span>
      </div>
      <div className="h-4 border-2 border-black bg-zinc-100 mb-8 overflow-hidden">
        <div className="h-full bg-black transition-all duration-1000" style={{ width: `${data.matchPct}%` }} />
      </div>

      {data.matched.length > 0 && (
        <div className="mb-6">
          <h3 className="text-[11px] font-black uppercase tracking-widest text-green-600 mb-3 bg-green-100 inline-block px-2 py-1 border-2 border-black">✓ ĐÃ CÓ TRONG CV ({data.matched.length})</h3>
          <div className="flex flex-wrap gap-2">
            {data.matched.map((k) => (
              <span key={k} className="text-xs font-bold text-black border-2 border-black px-3 py-1 bg-white shadow-[2px_2px_0_0_#000]">{k}</span>
            ))}
          </div>
        </div>
      )}

      {data.missing.length > 0 && (
        <div>
          <h3 className="text-[11px] font-black uppercase tracking-widest text-red-600 mb-3 bg-red-100 inline-block px-2 py-1 border-2 border-black">✗ JD YÊU CẦU NHƯNG THIẾU ({data.missing.length})</h3>
          <div className="flex flex-wrap gap-2">
            {data.missing.map((k) => (
              <span key={k} className="text-xs font-bold text-black border-2 border-black px-3 py-1 bg-zinc-200">{k}</span>
            ))}
          </div>
          <p className="text-zinc-600 font-bold text-xs mt-4 bg-zinc-100 p-3 border-2 border-black">💡 MẸO: Hãy bổ sung ngay các từ khoá trên vào CV nếu bạn thực sự có kỹ năng đó để lọt qua vòng lọc máy ATS.</p>
        </div>
      )}
    </div>
  )
}

// THEATER MODE TERMINAL COMPONENT
function TerminalLoading({ messages }: { messages: string[] }) {
  const [currentLine, setCurrentLine] = useState(0)
  const [text, setText] = useState('')

  useEffect(() => {
    if (currentLine >= messages.length) return
    let i = 0
    const fullText = messages[currentLine]
    const timer = setInterval(() => {
      setText(fullText.substring(0, i))
      i++
      if (i > fullText.length) {
        clearInterval(timer)
        setTimeout(() => {
          setCurrentLine(c => c + 1)
          setText('')
        }, 800) // wait before next line
      }
    }, 30) // typing speed
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
          <div className="mb-2 text-yellow-300">
            {text}<span className="animate-pulse">_</span>
          </div>
        )}
      </div>
    </div>
  )
}

export default function MatchForm({ cvId, cvTitle, cvContent }: Props) {
  const router = useRouter()
  const [jobText, setJobText] = useState('')
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<MatchResult | null>(null)
  const [keywords, setKeywords] = useState<KeywordAnalysis | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [showToast, setShowToast] = useState(false)

  const isValid = jobText.length >= 50

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!isValid || loading) return

    setKeywords(analyzeKeywords(cvContent, jobText))
    setLoading(true)
    setError(null)
    setResult(null)

    try {
      const res = await fetch('/api/match', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ cv_id: cvId, job_text: jobText }),
      })

      if (res.status === 401) { router.push('/login'); return }
      if (res.status === 404) { router.push('/dashboard?error=cv_not_found'); return }
      if (!res.ok) { setError('HỆ THỐNG AI ĐANG QUÁ TẢI. VUI LÒNG THỬ LẠI SAU.'); return }

      const data = await res.json()
      // delay deliberately to show the cool terminal animation
      setTimeout(() => {
        setResult(data.result)
        setShowToast(true)
        setLoading(false)
        setTimeout(() => setShowToast(false), 8000)
      }, Math.max(0, (LOADING_MESSAGES.length * 1000) - 2000)) // ensure terminal runs long enough
    } catch {
      setError('MẤT KẾT NỐI VỚI MÁY CHỦ AI.')
      setLoading(false)
    }
  }

  function handleReset() {
    setResult(null)
    setKeywords(null)
    setError(null)
    setJobText('')
  }

  return (
    <main className="min-h-screen bg-zinc-50 pt-20 pb-32">
      <div className="max-w-6xl mx-auto px-4 md:px-8">
        <div className="mb-12">
          <div className="inline-block px-3 py-1 bg-yellow-300 border-2 border-black rounded text-[11px] font-black uppercase tracking-widest mb-4 shadow-[2px_2px_0_0_#000]">
            THEATER MODE
          </div>
          <h1 className="text-5xl md:text-7xl font-black tracking-tighter text-black uppercase mb-4 neo-shadow-text leading-[1.1]">
            AI MATCH JD
          </h1>
          <p className="text-lg font-bold text-zinc-500 mb-2 uppercase tracking-widest">
            PHÂN TÍCH ĐỘ KHỚP GIỮA CV VÀ MÔ TẢ CÔNG VIỆC
          </p>
          <div className="inline-flex items-center gap-2 bg-white px-4 py-2 border-2 border-black shadow-[4px_4px_0_0_#000]">
            <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
            <span className="text-[13px] font-black uppercase tracking-widest text-black">CV: {cvTitle}</span>
          </div>
          <br/>
          <Link href={`/cv/${cvId}/matches`} className="inline-block mt-6 text-[13px] font-black uppercase tracking-widest text-[var(--fpt-orange)] hover:underline">
            ← LỊCH SỬ MATCH
          </Link>
        </div>

        <div className="flex flex-col lg:flex-row gap-10">
          {/* LEFT: INPUT */}
          <div className="w-full lg:w-[45%] shrink-0">
            <form onSubmit={handleSubmit} className="bg-white border-4 border-black p-6 sm:p-8 rounded-2xl shadow-[8px_8px_0_0_#000]">
              <label className="block text-black font-black uppercase tracking-widest text-[14px] mb-4">
                DÁN MÔ TẢ CÔNG VIỆC (JD) VÀO ĐÂY
              </label>
              <textarea
                rows={12}
                value={jobText}
                onChange={(e) => setJobText(e.target.value)}
                placeholder="Ví dụ: Yêu cầu ứng viên có 2 năm kinh nghiệm ReactJS, hiểu biết về Next.js, UI/UX..."
                disabled={loading}
                className="w-full bg-zinc-50 border-4 border-black rounded-xl px-5 py-4 text-black font-bold text-[15px] placeholder-zinc-400 focus:outline-none focus:shadow-[6px_6px_0_0_var(--fpt-orange)] resize-none transition-all disabled:opacity-50"
              />
              <div className="flex justify-between items-center mt-3 mb-8">
                <p className={`text-[11px] font-black uppercase tracking-widest ${isValid ? 'text-green-600' : 'text-zinc-400'}`}>
                  {jobText.length} / MIN 50 KÝ TỰ
                </p>
                {error && <span className="text-[11px] font-black uppercase text-red-500 bg-red-100 px-2 py-1 border-2 border-black">{error}</span>}
              </div>

              <button
                type="submit"
                disabled={!isValid || loading}
                className="w-full py-5 px-6 rounded-xl font-black uppercase tracking-widest text-[16px] text-white bg-black border-4 border-black shadow-[6px_6px_0_0_var(--fpt-orange)] hover:-translate-y-1 hover:shadow-[10px_10px_0_0_var(--fpt-orange)] active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none transition-all"
              >
                {loading ? 'ĐANG PHÂN TÍCH...' : 'QUÉT VÀ PHÂN TÍCH'}
              </button>
            </form>
          </div>

          {/* RIGHT: THEATER TERMINAL / RESULT */}
          <div className="w-full lg:flex-1">
            {!loading && !result && !keywords && (
              <div className="border-4 border-black bg-zinc-100 border-dashed rounded-2xl h-full min-h-[400px] flex flex-col items-center justify-center p-10 text-center opacity-70">
                <div className="text-6xl mb-6">🤖</div>
                <h3 className="text-black font-black uppercase tracking-widest text-xl mb-2">CHỜ DỮ LIỆU ĐẦU VÀO</h3>
                <p className="text-zinc-500 font-bold max-w-sm">Dán JD vào ô bên trái để trí tuệ nhân tạo bắt đầu phân tích độ khớp của CV.</p>
              </div>
            )}

            {loading && <TerminalLoading messages={LOADING_MESSAGES} />}

            {!loading && keywords && result && (() => {
              const level = getScoreLevel(result.overall_score)
              return (
                <div className="animate-in fade-in slide-in-from-bottom-4 duration-700">
                  <KeywordPanel data={keywords} />

                  <div className="border-4 border-black bg-[#C4A1FF] p-6 sm:p-10 shadow-[8px_8px_0_0_#000] rounded-2xl relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-white/30 rounded-full blur-3xl -translate-y-1/2 translate-x-1/4 pointer-events-none" />
                    
                    <div className="flex flex-col sm:flex-row items-center sm:items-start gap-8 mb-10 relative z-10">
                      <div className={`flex flex-col items-center justify-center w-40 h-40 rounded-full border-8 bg-white shadow-[8px_8px_0_0_#000] shrink-0 ${level.ring}`}>
                        <span className="text-6xl font-black tracking-tighter" style={{ color: level.color }}>{result.overall_score}%</span>
                      </div>
                      <div className="text-center sm:text-left mt-4 sm:mt-0">
                        <h2 className="text-3xl font-black text-black uppercase tracking-tighter neo-shadow-text">BÁO CÁO TỪ AI</h2>
                        <p className={`mt-2 text-lg font-black uppercase tracking-widest bg-white inline-block px-3 py-1 border-2 border-black shadow-[2px_2px_0_0_#000] ${level.textColor}`}>{level.label}</p>
                      </div>
                    </div>

                    <div className="bg-white border-4 border-black rounded-xl p-6 sm:p-8 shadow-[4px_4px_0_0_#000] relative z-10 space-y-6">
                      <ScoreBar label="Kỹ Năng Cốt Lõi" value={result.skill_match} />
                      <ScoreBar label="Độ Dày Kinh Nghiệm" value={result.experience_match} />
                      <ScoreBar label="Nền Tảng Học Vấn" value={result.education_match} />
                    </div>

                    {result.strengths.length > 0 && (
                      <div className="mt-8 bg-green-50 border-4 border-black p-6 rounded-xl shadow-[4px_4px_0_0_#000] relative z-10">
                        <h3 className="text-[13px] font-black uppercase tracking-widest text-green-700 mb-4 bg-green-200 inline-block px-3 py-1 border-2 border-black">ĐIỂM SÁNG GIÁ NHẤT</h3>
                        <ul className="space-y-3">
                          {result.strengths.map((s, i) => (
                            <li key={i} className="flex items-start gap-3 text-black font-bold">
                              <span className="text-green-600 text-lg leading-none shrink-0">★</span>
                              <span>{s}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {result.recommendation && (
                      <div className="mt-8 bg-white border-4 border-black p-6 rounded-xl shadow-[4px_4px_0_0_#000] relative z-10">
                        <h3 className="text-[13px] font-black uppercase tracking-widest text-black mb-4 bg-yellow-300 inline-block px-3 py-1 border-2 border-black">LỜI KHUYÊN TỪ AI COACH</h3>
                        <div className="text-black font-bold leading-relaxed text-[15px]">
                          {result.recommendation}
                        </div>
                      </div>
                    )}

                    <div className="flex flex-col sm:flex-row gap-4 mt-10 relative z-10">
                      <Link href={`/cv/${cvId}/edit`} className="flex-1 text-center py-4 px-4 rounded-xl border-4 border-black bg-[var(--fpt-orange)] text-white font-black uppercase tracking-widest text-[14px] shadow-[4px_4px_0_0_#000] hover:-translate-y-1 hover:shadow-none active:scale-95 transition-all">
                        SỬA CV NGAY
                      </Link>
                      <button onClick={handleReset} className="flex-1 py-4 px-4 rounded-xl border-4 border-black bg-white text-black font-black uppercase tracking-widest text-[14px] shadow-[4px_4px_0_0_#000] hover:bg-yellow-300 hover:-translate-y-1 hover:shadow-none active:scale-95 transition-all">
                        TẢI LẠI TỪ ĐẦU
                      </button>
                    </div>
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
