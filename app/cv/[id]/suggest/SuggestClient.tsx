'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { pdf } from '@react-pdf/renderer'
import { getTemplate } from '@/components/cv-templates/registry'

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

      const { data: cv, error: cvError } = await supabase
        .from('cvs')
        .select('id, title, user_id, content, template')
        .eq('id', cvId)
        .eq('user_id', session.user.id)
        .single()

      if (cvError || !cv) {
        setError('Không tìm thấy CV hoặc bạn không có quyền xem.')
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
        setError('Gọi API phân tích thất bại.')
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

      setSuggestions(result)
      setLoading(false)
    }

    run()
  }, [cvId, router])

  async function handleDownloadPdf() {
    if (!cvData) return
    setDownloading(true)
    try {
      const { Pdf } = getTemplate(cvData.template || 'classic')
      const blob = await pdf(<Pdf data={cvData.content} />).toBlob()
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
      <div className="min-h-screen bg-zinc-950 flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="w-12 h-12 border-4 border-violet-500 border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-zinc-400 text-lg font-medium">Đang phân tích CV...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-zinc-950 flex items-center justify-center">
        <div className="text-center space-y-4">
          <p className="text-red-400 text-lg">{error}</p>
          <button
            onClick={() => router.push('/dashboard')}
            className="px-4 py-2 bg-violet-600 hover:bg-violet-700 text-white rounded-lg transition-colors"
          >
            Quay lại dashboard
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-zinc-950 py-10 px-4">
      {pdfToast && (
        <div className="fixed bottom-6 right-6 z-50 bg-zinc-800 border border-zinc-700 text-zinc-200 text-sm px-4 py-3 rounded-xl flex items-center gap-3 shadow-xl">
          <span>✓ Đã tải PDF</span>
          <span className="text-zinc-500">—</span>
          <a href="/feedback?from=pdf_export" className="text-blue-400 hover:text-blue-300 underline underline-offset-2 transition-colors">
            Góp ý
          </a>
          <button onClick={() => setPdfToast(false)} className="text-zinc-500 hover:text-zinc-200 ml-1 leading-none">×</button>
        </div>
      )}
      <div className="max-w-2xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-white">Gợi ý chuyên ngành</h1>
          <div className="flex items-center gap-2">
            <button
              onClick={handleDownloadPdf}
              disabled={downloading || !cvData}
              className="px-4 py-2 text-sm bg-violet-600 text-white rounded-lg hover:bg-violet-700 transition-colors disabled:opacity-50"
            >
              {downloading ? 'Đang tạo...' : 'Tải PDF'}
            </button>
            <button
              onClick={() => router.push('/dashboard')}
              className="px-4 py-2 text-sm bg-zinc-800 border border-zinc-700 rounded-lg text-zinc-300 hover:bg-zinc-700 transition-colors"
            >
              ← Quay lại
            </button>
          </div>
        </div>

        <div className="space-y-4">
          {suggestions.map((s, i) => (
            <div
              key={i}
              className="bg-zinc-900 rounded-2xl border border-zinc-800 p-6 space-y-2"
            >
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold text-white">{s.major}</h2>
                <span className="text-sm font-semibold text-violet-400 bg-violet-900/30 px-3 py-1 rounded-full">
                  {Math.round(s.score * 100)}% phù hợp
                </span>
              </div>
              <p className="text-zinc-400 text-sm">{s.reason}</p>
            </div>
          ))}
        </div>

        {suggestions.length > 0 && (
          <div className="text-center text-sm text-zinc-500 pt-2">
            Gợi ý có hữu ích không?{' '}
            <a
              href="/feedback?from=ai_suggestion"
              className="text-violet-400 hover:text-violet-300 transition-colors"
            >
              Cho tụi mình biết →
            </a>
          </div>
        )}
      </div>
    </div>
  )
}
