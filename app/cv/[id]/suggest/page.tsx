'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'

interface Suggestion {
  major: string
  score: number
  reason: string
}

export default function SuggestPage() {
  const params = useParams()
  const router = useRouter()
  const cvId = params.id as string

  const [suggestions, setSuggestions] = useState<Suggestion[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function run() {
      const {
        data: { session },
      } = await supabase.auth.getSession()

      if (!session) {
        router.push('/login')
        return
      }

      const { data: cv, error: cvError } = await supabase
        .from('cvs')
        .select('id, user_id, content')
        .eq('id', cvId)
        .eq('user_id', session.user.id)
        .single()

      if (cvError || !cv) {
        setError('Không tìm thấy CV hoặc bạn không có quyền xem.')
        setLoading(false)
        return
      }

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

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center space-y-4">
          <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-gray-600 text-lg font-medium">Đang phân tích CV...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center space-y-4">
          <p className="text-red-500 text-lg">{error}</p>
          <button
            onClick={() => router.push('/dashboard')}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Quay lại dashboard
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 py-10 px-4">
      <div className="max-w-2xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-gray-800">Gợi ý chuyên ngành</h1>
          <button
            onClick={() => router.push('/dashboard')}
            className="px-4 py-2 text-sm bg-white border border-gray-300 rounded-lg text-gray-600 hover:bg-gray-100 transition"
          >
            ← Quay lại dashboard
          </button>
        </div>

        <div className="space-y-4">
          {suggestions.map((s, i) => (
            <div
              key={i}
              className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 space-y-2"
            >
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold text-gray-900">{s.major}</h2>
                <span className="text-sm font-semibold text-blue-600 bg-blue-50 px-3 py-1 rounded-full">
                  {Math.round(s.score * 100)}% phù hợp
                </span>
              </div>
              <p className="text-gray-600 text-sm">{s.reason}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
