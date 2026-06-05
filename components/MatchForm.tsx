'use client'

import { useRef, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import ReactMarkdown from 'react-markdown'

const LOADING_MESSAGES = [
  'Đang phân tích CV...',
  'Đang đối chiếu với JD...',
  'Đang tạo gợi ý...',
]

interface Props {
  cvId: string
  cvTitle: string
}

export default function MatchForm({ cvId, cvTitle }: Props) {
  const router = useRouter()
  const [jobText, setJobText] = useState('')
  const [loading, setLoading] = useState(false)
  const [loadingMsg, setLoadingMsg] = useState(LOADING_MESSAGES[0])
  const [result, setResult] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [showToast, setShowToast] = useState(false)
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null)

  const isValid = jobText.length >= 50

  function startRotation() {
    let idx = 0
    intervalRef.current = setInterval(() => {
      idx = (idx + 1) % LOADING_MESSAGES.length
      setLoadingMsg(LOADING_MESSAGES[idx])
    }, 3000)
  }

  function stopRotation() {
    if (intervalRef.current) {
      clearInterval(intervalRef.current)
      intervalRef.current = null
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!isValid || loading) return

    setLoading(true)
    setError(null)
    setResult(null)
    setLoadingMsg(LOADING_MESSAGES[0])
    startRotation()

    try {
      const res = await fetch('/api/match', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ cv_id: cvId, job_text: jobText }),
      })

      if (res.status === 401) {
        router.push('/login')
        return
      }
      if (res.status === 404) {
        router.push('/dashboard?error=cv_not_found')
        return
      }
      if (!res.ok) {
        setError('AI tạm thời không phản hồi, vui lòng thử lại sau.')
        return
      }

      const data = await res.json()
      setResult(data.result)
      setShowToast(true)
      setTimeout(() => setShowToast(false), 8000)
    } catch {
      setError('AI tạm thời không phản hồi, vui lòng thử lại sau.')
    } finally {
      stopRotation()
      setLoading(false)
    }
  }

  function handleReset() {
    setResult(null)
    setError(null)
    setJobText('')
  }

  return (
    <main className="min-h-screen bg-zinc-950 text-zinc-100">
      <div className="max-w-6xl mx-auto px-4 py-10">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">🎯 Match CV với JD</h1>
          <p className="text-zinc-400 mb-1">
            Dán JD vào, AI sẽ phân tích CV của bạn có phù hợp không và gợi ý cải thiện
          </p>
          <p className="text-sm text-violet-400">
            CV đang phân tích: <span className="font-semibold">{cvTitle}</span>
          </p>
        </div>

        <div className="flex flex-col lg:flex-row gap-8">
          {/* Left column: form */}
          <div className="w-full lg:w-1/2 shrink-0">
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-zinc-300 mb-2">
                  Mô tả công việc (JD)
                </label>
                <textarea
                  rows={10}
                  value={jobText}
                  onChange={(e) => setJobText(e.target.value)}
                  placeholder="Paste mô tả công việc vào đây. Có thể copy từ TopCV, ITviec, LinkedIn..."
                  disabled={loading}
                  className="w-full bg-zinc-900 border border-zinc-700 rounded-xl px-4 py-3 text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-violet-500 focus:ring-1 focus:ring-violet-500 resize-none transition disabled:opacity-50"
                />
                <p
                  className={`text-xs mt-1 transition-colors ${
                    isValid ? 'text-emerald-400' : 'text-zinc-500'
                  }`}
                >
                  {jobText.length} / tối thiểu 50 ký tự
                </p>
              </div>

              <button
                type="submit"
                disabled={!isValid || loading}
                className="w-full py-3 px-6 rounded-xl font-semibold text-white bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-500 hover:to-purple-500 disabled:opacity-40 disabled:cursor-not-allowed transition"
              >
                🚀 Phân tích match
              </button>
            </form>

            {/* Loading state */}
            {loading && (
              <div className="mt-8 flex flex-col items-center gap-3 py-8">
                <div className="w-10 h-10 border-4 border-violet-500 border-t-transparent rounded-full animate-spin" />
                <p className="text-zinc-300 font-medium">{loadingMsg}</p>
                <p className="text-xs text-zinc-500">
                  Lần đầu có thể mất ~30 giây để AI khởi động
                </p>
              </div>
            )}

            {/* Error state */}
            {error && !loading && (
              <div className="mt-6 rounded-xl border border-red-800 bg-red-950/40 p-4 text-sm text-red-300">
                {error}
              </div>
            )}
          </div>

          {/* Right column: result */}
          {result && !loading && (
            <div className="w-full lg:flex-1">
              <div className="rounded-2xl border border-violet-800/50 bg-zinc-900 p-6 shadow-[0_0_40px_rgba(139,92,246,0.08)]">
                <h2 className="text-lg font-semibold text-zinc-200 mb-4">
                  Kết quả phân tích
                </h2>

                <div className="text-zinc-300 space-y-1 [&_h3]:text-xl [&_h3]:font-bold [&_h3]:text-violet-400 [&_h3]:mt-5 [&_h3]:mb-2 [&_strong]:text-emerald-400 [&_ul]:list-disc [&_ul]:pl-5 [&_ul>li]:mt-1 [&_ul>li::marker]:text-violet-400 [&_ol]:list-decimal [&_ol]:pl-5 [&_ol>li]:mt-1 [&_em]:text-zinc-400 [&_p]:mb-2">
                  <ReactMarkdown>{result}</ReactMarkdown>
                </div>

                <div className="flex flex-col sm:flex-row gap-3 mt-6 pt-5 border-t border-zinc-800">
                  <Link
                    href={`/cv/${cvId}/edit`}
                    className="flex-1 text-center py-2.5 px-4 rounded-lg bg-violet-600 hover:bg-violet-500 text-white font-medium transition text-sm"
                  >
                    ✏️ Sửa CV theo gợi ý
                  </Link>
                  <button
                    onClick={handleReset}
                    className="flex-1 py-2.5 px-4 rounded-lg border border-zinc-700 hover:border-zinc-500 text-zinc-300 hover:text-white font-medium transition text-sm"
                  >
                    🔄 Thử với JD khác
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Toast */}
      {showToast && (
        <div className="fixed bottom-6 right-6 bg-zinc-800 border border-zinc-700 rounded-xl px-4 py-3 shadow-xl text-sm text-zinc-200 flex items-center gap-3 z-50 animate-in slide-in-from-bottom-4">
          <span>Đánh giá có hữu ích không?</span>
          <Link
            href="/feedback?from=match"
            className="text-violet-400 hover:underline font-medium"
          >
            Góp ý ngay
          </Link>
          <button
            onClick={() => setShowToast(false)}
            className="text-zinc-500 hover:text-zinc-300 ml-1"
          >
            ✕
          </button>
        </div>
      )}
    </main>
  )
}
