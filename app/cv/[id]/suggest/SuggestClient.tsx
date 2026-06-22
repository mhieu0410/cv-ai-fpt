'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { pdf } from '@react-pdf/renderer'
import { getTemplate } from '@/components/cv-templates/registry'
import { getUserPlan } from '@/lib/user-plan'

interface Suggestion {
  major: string
  score: number
  reason: string
}

interface CvContent {
  personal:   { name: string; email: string; phone: string }
  education:  { school: string; major: string; year: string }[]
  skills:     string[]
  projects:   { name: string; description: string }[]
  activities?: { description: string }[]
}

interface CvData {
  title: string
  content: CvContent
  template: string
}

const LOADING_MESSAGES = [
  '> QUÉT DỮ LIỆU CV...',
  '> PHÂN TÍCH TỪ KHOÁ KỸ NĂNG...',
  '> ĐỐI CHIẾU VỚI CƠ SỞ DỮ LIỆU NGÀNH NGHỀ...',
  '> TÍNH TOÁN XÁC SUẤT PHÙ HỢP...',
  '> LẬP LUẬN BẢN ĐỒ NGHỀ NGHIỆP...',
  '> XUẤT BÁO CÁO GỢI Ý...',
]

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
        }, 800)
      }
    }, 40)
    return () => clearInterval(timer)
  }, [currentLine, messages])

  return (
    <div className="border-4 border-black bg-zinc-950 p-8 shadow-[8px_8px_0_0_#000] rounded-2xl min-h-[350px] flex flex-col relative overflow-hidden font-mono max-w-2xl mx-auto w-full">
      <div className="absolute top-0 left-0 w-full h-8 bg-zinc-200 border-b-4 border-black flex items-center px-4 gap-2">
        <div className="w-3 h-3 rounded-full bg-red-500 border-2 border-black" />
        <div className="w-3 h-3 rounded-full bg-yellow-400 border-2 border-black" />
        <div className="w-3 h-3 rounded-full bg-green-500 border-2 border-black" />
        <span className="ml-4 text-[10px] font-black tracking-widest text-black">AI_CAREER_COACH_V1.0</span>
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

export default function SuggestClient() {
  const params = useParams()
  const router = useRouter()
  const cvId = params.id as string

  const [suggestions, setSuggestions] = useState<Suggestion[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [cvData, setCvData] = useState<CvData | null>(null)
  const [downloading, setDownloading] = useState(false)
  const [pdfToast, setPdfToast] = useState(false)
  const [isPro, setIsPro] = useState(false)

  useEffect(() => {
    if (!pdfToast) return
    const t = setTimeout(() => setPdfToast(false), 8000)
    return () => clearTimeout(t)
  }, [pdfToast])

  useEffect(() => {
    async function run() {
      const { data: { session } } = await supabase.auth.getSession()

      if (!session) {
        router.push('/login')
        return
      }

      const plan = await getUserPlan(supabase, session.user.id)
      setIsPro(plan.isPro)

      const { data: cv, error: cvError } = await supabase
        .from('cvs')
        .select('id, title, user_id, content, template')
        .eq('id', cvId)
        .eq('user_id', session.user.id)
        .single()

      if (cvError || !cv) {
        setError('KHÔNG THỂ TRUY CẬP DỮ LIỆU CV NÀY.')
        setLoading(false)
        return
      }

      setCvData({ title: cv.title, content: cv.content, template: cv.template })

      const res = await fetch('/api/suggest', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ cv_text: JSON.stringify(cv.content) }),
      })

      if (!res.ok) {
        setError('HỆ THỐNG AI ĐANG BẢO TRÌ. VUI LÒNG THỬ LẠI SAU.')
        setLoading(false)
        return
      }

      const json = await res.json()
      const result: Suggestion[] = json.suggestions

      await supabase.from('suggestions').insert(
        result.map((s) => ({
          cv_id: cvId,
          major: s.major,
          score: s.score,
          reason: s.reason,
        }))
      )

      setTimeout(() => {
        setSuggestions(result)
        setLoading(false)
      }, Math.max(0, (LOADING_MESSAGES.length * 1000) - 2000))
    }

    run()
  }, [cvId, router])

  async function handleDownloadPdf() {
    if (!cvData) return
    setDownloading(true)
    try {
      const { Pdf } = getTemplate(cvData.template || 'classic')
      const blob = await pdf(<Pdf data={cvData.content} isPro={isPro} />).toBlob()
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `CV_${cvData.title.replace(/\s+/g, '_')}.pdf`
      a.click()
      URL.revokeObjectURL(url)
      setPdfToast(true)
    } finally {
      setDownloading(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-zinc-50 flex items-center justify-center px-4">
        <TerminalLoading messages={LOADING_MESSAGES} />
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-zinc-50 flex items-center justify-center px-4">
        <div className="text-center bg-white border-4 border-black p-10 rounded-[2.5rem] shadow-[8px_8px_0_0_#000]">
          <div className="text-6xl mb-6">⚠️</div>
          <p className="text-black text-2xl font-black uppercase tracking-tighter mb-8">{error}</p>
          <button
            onClick={() => router.push('/dashboard')}
            className="px-8 py-4 bg-black text-white font-black uppercase tracking-widest rounded-xl hover:-translate-y-1 hover:shadow-[6px_6px_0_0_var(--fpt-orange)] transition-all active:scale-95"
          >
            QUAY VỀ DASHBOARD
          </button>
        </div>
      </div>
    )
  }

  const bgColors = ['bg-[#C4A1FF]', 'bg-yellow-300', 'bg-green-300', 'bg-blue-300', 'bg-[var(--fpt-orange)]']

  return (
    <div className="min-h-screen bg-zinc-50 py-20 px-4 md:px-8">
      {pdfToast && (
        <div className="fixed bottom-6 right-6 z-50 bg-white border-4 border-black text-black text-sm font-black uppercase tracking-widest px-6 py-4 rounded-xl flex items-center gap-3 shadow-[8px_8px_0_0_#000]">
          <span className="text-green-500 text-xl">✓</span>
          <span>Đã xuất File PDF</span>
          <span className="text-zinc-300">—</span>
          <a href="/feedback?from=pdf_export" className="text-[var(--fpt-orange)] hover:underline underline-offset-4 transition-all">
            Góp ý
          </a>
          <button onClick={() => setPdfToast(false)} className="hover:scale-125 ml-2 leading-none text-xl transition-transform">×</button>
        </div>
      )}
      
      <div className="max-w-4xl mx-auto">
        <div className="mb-12">
          <div className="inline-block px-3 py-1 bg-black text-white border-2 border-black rounded text-[11px] font-black uppercase tracking-widest mb-4 shadow-[2px_2px_0_0_var(--fpt-orange)]">
            AI CAREER COACH
          </div>
          <h1 className="text-5xl md:text-7xl font-black text-black tracking-tighter uppercase mb-4 neo-shadow-text leading-[1.1]">
            ĐỊNH HƯỚNG<br/>SỰ NGHIỆP
          </h1>
          <p className="text-lg font-bold text-zinc-500 mb-6 uppercase tracking-widest">
            Dựa trên kinh nghiệm và kỹ năng hiện tại của bạn.
          </p>
          
          <div className="flex flex-wrap items-center gap-4">
            <button
              onClick={handleDownloadPdf}
              disabled={downloading || !cvData}
              className="px-6 py-3 text-[13px] font-black uppercase tracking-widest bg-[var(--fpt-orange)] border-4 border-black text-white rounded-xl shadow-[4px_4px_0_0_#000] hover:-translate-y-1 hover:shadow-[6px_6px_0_0_#000] active:scale-95 transition-all disabled:opacity-50"
            >
              {downloading ? 'ĐANG TẠO...' : 'TẢI LẠI CV GỐC (PDF)'}
            </button>
            <button
              onClick={() => router.push('/dashboard')}
              className="px-6 py-3 text-[13px] font-black uppercase tracking-widest bg-white border-4 border-black text-black rounded-xl shadow-[4px_4px_0_0_#000] hover:bg-zinc-100 hover:-translate-y-1 hover:shadow-none active:scale-95 transition-all"
            >
              ← VỀ DASHBOARD
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {suggestions.map((s, i) => {
            const color = bgColors[i % bgColors.length]
            return (
              <div
                key={i}
                className={`${color} border-4 border-black rounded-[2.5rem] p-8 shadow-[8px_8px_0_0_#000] flex flex-col transition-transform hover:-translate-y-2 group`}
              >
                <div className="flex items-start justify-between mb-6 gap-4">
                  <h2 className="text-3xl font-black text-black uppercase tracking-tighter leading-none">{s.major}</h2>
                  <span className="text-[13px] shrink-0 font-black uppercase tracking-widest text-black bg-white border-4 border-black px-3 py-1.5 rounded-lg shadow-[2px_2px_0_0_#000] group-hover:bg-yellow-300 transition-colors">
                    MỨC ĐỘ: {Math.round(s.score * 100)}%
                  </span>
                </div>
                <div className="bg-white/80 p-5 border-4 border-black rounded-xl text-black font-bold text-[15px] leading-relaxed flex-1">
                  {s.reason}
                </div>
              </div>
            )
          })}
        </div>

        {suggestions.length > 0 && (
          <div className="text-center text-[13px] font-black uppercase tracking-widest text-zinc-500 mt-16 bg-white border-4 border-black p-6 rounded-2xl shadow-[6px_6px_0_0_#000]">
            AI Đánh giá có chính xác không?{' '}
            <a
              href="/feedback?from=ai_suggestion"
              className="text-[var(--fpt-orange)] hover:underline ml-2"
            >
              GÓP Ý NGAY →
            </a>
          </div>
        )}
      </div>
    </div>
  )
}
