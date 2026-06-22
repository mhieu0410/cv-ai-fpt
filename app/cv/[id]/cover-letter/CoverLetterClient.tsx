'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'

const LOADING_MESSAGES = [
  '> KHỞI TẠO AI COPYWRITER...',
  '> ĐỌC TOÀN BỘ KINH NGHIỆM TỪ CV...',
  '> PHÂN TÍCH VĂN PHONG DOANH NGHIỆP TỪ JD...',
  '> TÌM ĐIỂM GIAO THOA GIỮA ỨNG VIÊN VÀ CÔNG TY...',
  '> VIẾT ĐOẠN MỞ ĐẦU GÂY ẤN TƯỢNG...',
  '> TRIỂN KHAI THÂN BÀI THUYẾT PHỤC...',
  '> ĐÁNH BÓNG CÂU TỪ...',
  '> HOÀN TẤT THƯ ỨNG TUYỂN!',
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
        }, 600)
      }
    }, 40)
    return () => clearInterval(timer)
  }, [currentLine, messages])

  return (
    <div className="border-4 border-black bg-zinc-950 p-8 shadow-[8px_8px_0_0_#000] rounded-2xl min-h-[400px] flex flex-col relative overflow-hidden font-mono w-full">
      <div className="absolute top-0 left-0 w-full h-8 bg-zinc-200 border-b-4 border-black flex items-center px-4 gap-2">
        <div className="w-3 h-3 rounded-full bg-red-500 border-2 border-black" />
        <div className="w-3 h-3 rounded-full bg-yellow-400 border-2 border-black" />
        <div className="w-3 h-3 rounded-full bg-green-500 border-2 border-black" />
        <span className="ml-4 text-[10px] font-black tracking-widest text-black">AI_COPYWRITER_TERMINAL</span>
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

export default function CoverLetterClient() {
  const params = useParams()
  const router = useRouter()
  const cvId = params.id as string

  const [jobText, setJobText] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [result, setResult] = useState<string | null>(null)
  const [copied, setCopied] = useState(false)
  const [cvTitle, setCvTitle] = useState('')

  const isValid = jobText.length >= 50

  useEffect(() => {
    async function fetchCv() {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) {
        router.push('/login')
        return
      }

      const { data, error } = await supabase
        .from('cvs')
        .select('title')
        .eq('id', cvId)
        .eq('user_id', session.user.id)
        .single()

      if (data) {
        setCvTitle(data.title)
      } else {
        router.push('/dashboard')
      }
    }
    fetchCv()
  }, [cvId, router])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!isValid || loading) return

    setLoading(true)
    setError(null)
    setResult(null)

    try {
      const res = await fetch('/api/cover-letter', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ cv_id: cvId, job_text: jobText }),
      })

      if (res.status === 401) { router.push('/login'); return }
      if (!res.ok) { setError('HỆ THỐNG AI ĐANG QUÁ TẢI. VUI LÒNG THỬ LẠI SAU.'); return }

      const data = await res.json()
      
      setTimeout(() => {
        setResult(data.cover_letter)
        setLoading(false)
      }, Math.max(0, (LOADING_MESSAGES.length * 600) + 1000))
    } catch {
      setError('MẤT KẾT NỐI VỚI MÁY CHỦ AI.')
      setLoading(false)
    }
  }

  async function handleCopy() {
    if (!result) return
    try {
      await navigator.clipboard.writeText(result)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      alert('Không thể copy tự động, vui lòng chọn văn bản và nhấn Ctrl+C')
    }
  }

  return (
    <main className="min-h-screen bg-zinc-50 pt-20 pb-32">
      <div className="max-w-6xl mx-auto px-4 md:px-8">
        <div className="mb-12">
          <div className="inline-block px-3 py-1 bg-green-400 border-2 border-black rounded text-[11px] font-black uppercase tracking-widest mb-4 shadow-[2px_2px_0_0_#000]">
            TÍNH NĂNG ĐỘC QUYỀN
          </div>
          <h1 className="text-5xl md:text-7xl font-black tracking-tighter text-black uppercase mb-4 neo-shadow-text leading-[1.1]">
            AI COVER<br/>LETTER
          </h1>
          <p className="text-lg font-bold text-zinc-500 mb-2 uppercase tracking-widest">
            VIẾT THƯ ỨNG TUYỂN HOÀN HẢO CHỈ TRONG 1 CLICK DỰA VÀO CV VÀ JD.
          </p>
          <div className="inline-flex items-center gap-2 bg-white px-4 py-2 border-2 border-black shadow-[4px_4px_0_0_#000]">
            <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
            <span className="text-[13px] font-black uppercase tracking-widest text-black">CV NGUỒN: {cvTitle || 'Đang tải...'}</span>
          </div>
          <br/>
          <Link href="/dashboard" className="inline-block mt-6 text-[13px] font-black uppercase tracking-widest text-[var(--fpt-orange)] hover:underline">
            ← VỀ DASHBOARD
          </Link>
        </div>

        <div className="flex flex-col lg:flex-row gap-10">
          {/* LEFT: INPUT */}
          <div className="w-full lg:w-[45%] shrink-0">
            <form onSubmit={handleSubmit} className="bg-[#C4A1FF] border-4 border-black p-6 sm:p-8 rounded-[2.5rem] shadow-[8px_8px_0_0_#000]">
              <div className="bg-white border-4 border-black rounded-full w-16 h-16 flex items-center justify-center mb-6 shadow-[4px_4px_0_0_#000]">
                <span className="text-3xl">✉️</span>
              </div>
              <label className="block text-black font-black uppercase tracking-tighter text-2xl mb-4">
                DÁN JD ĐỂ AI PHÂN TÍCH VĂN PHONG
              </label>
              <textarea
                rows={10}
                value={jobText}
                onChange={(e) => setJobText(e.target.value)}
                placeholder="Paste mô tả công việc (JD) vào đây để AI biết được công ty đang cần người có tố chất gì..."
                disabled={loading}
                className="w-full bg-white border-4 border-black rounded-xl px-5 py-4 text-black font-bold text-[15px] placeholder-zinc-400 focus:outline-none focus:shadow-[6px_6px_0_0_#000] resize-none transition-all disabled:opacity-50"
              />
              <div className="flex justify-between items-center mt-3 mb-8">
                <p className={`text-[11px] font-black uppercase tracking-widest bg-white px-2 py-1 border-2 border-black ${isValid ? 'text-green-600' : 'text-zinc-500'}`}>
                  {jobText.length} / MIN 50 KÝ TỰ
                </p>
                {error && <span className="text-[11px] font-black uppercase text-red-500 bg-red-100 px-2 py-1 border-2 border-black shadow-[2px_2px_0_0_#000]">{error}</span>}
              </div>

              <button
                type="submit"
                disabled={!isValid || loading}
                className="w-full py-5 px-6 rounded-2xl font-black uppercase tracking-widest text-[16px] text-white bg-black border-4 border-black shadow-[6px_6px_0_0_var(--fpt-orange)] hover:-translate-y-1 hover:shadow-[10px_10px_0_0_var(--fpt-orange)] active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none transition-all"
              >
                {loading ? 'ĐANG TẠO THƯ...' : 'TẠO COVER LETTER NGAY'}
              </button>
            </form>
          </div>

          {/* RIGHT: THEATER TERMINAL / RESULT */}
          <div className="w-full lg:flex-1 flex flex-col">
            {!loading && !result && (
              <div className="border-4 border-black bg-white rounded-[2.5rem] h-full min-h-[400px] flex flex-col items-center justify-center p-10 text-center opacity-70 border-dashed">
                <div className="text-6xl mb-6 grayscale">📝</div>
                <h3 className="text-black font-black uppercase tracking-widest text-xl mb-2">BẢN THẢO TRỐNG</h3>
                <p className="text-zinc-500 font-bold max-w-sm">Hãy cung cấp JD để AI bắt đầu quá trình sáng tạo nội dung bức thư ứng tuyển giúp bạn.</p>
              </div>
            )}

            {loading && <TerminalLoading messages={LOADING_MESSAGES} />}

            {!loading && result && (
              <div className="animate-in fade-in slide-in-from-bottom-4 duration-700 bg-white border-4 border-black rounded-[2.5rem] shadow-[8px_8px_0_0_#000] flex flex-col h-full overflow-hidden">
                <div className="bg-yellow-300 border-b-4 border-black px-6 sm:px-8 py-5 flex items-center justify-between">
                  <h2 className="text-2xl font-black uppercase tracking-tighter text-black">📄 BẢN THẢO HOÀN CHỈNH</h2>
                  <button 
                    onClick={handleCopy}
                    className="bg-black text-white px-4 py-2 rounded-lg border-2 border-black font-black uppercase tracking-widest text-[11px] shadow-[2px_2px_0_0_#000] hover:translate-y-px hover:shadow-none active:scale-95 transition-all"
                  >
                    {copied ? '✓ ĐÃ COPY' : 'COPY VĂN BẢN'}
                  </button>
                </div>
                
                <div className="p-6 sm:p-10 overflow-y-auto">
                  <div className="whitespace-pre-wrap font-serif text-lg leading-relaxed text-zinc-800 bg-zinc-50 p-8 border-2 border-black rounded-xl">
                    {result}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </main>
  )
}
