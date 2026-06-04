'use client'

import { useEffect, useState, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { supabase } from '@/lib/supabase'

type FeedbackType = 'bug' | 'feature' | 'general' | 'praise'

function StarRating({
  value,
  onChange,
}: {
  value: number
  onChange: (v: number) => void
}) {
  const [hovered, setHovered] = useState(0)

  return (
    <div className="flex gap-1">
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          onClick={() => onChange(star)}
          onMouseEnter={() => setHovered(star)}
          onMouseLeave={() => setHovered(0)}
          className="text-3xl transition-colors leading-none"
          aria-label={`${star} sao`}
        >
          <span className={(hovered || value) >= star ? 'text-yellow-400' : 'text-zinc-700'}>
            ★
          </span>
        </button>
      ))}
    </div>
  )
}

function FeedbackContent() {
  const router = useRouter()
  const searchParams = useSearchParams()

  const [userId, setUserId] = useState<string | null>(null)
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [authReady, setAuthReady] = useState(false)

  const [rating, setRating] = useState(0)
  const [feedbackType, setFeedbackType] = useState<FeedbackType | ''>('')
  const [content, setContent] = useState('')

  const [submitting, setSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [error, setError] = useState('')

  const featureUsed = searchParams.get('from') || null
  const MAX = 500

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        setUserId(session.user.id)
        setIsLoggedIn(true)
      }
      setAuthReady(true)
    })
  }, [])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')

    if (rating === 0) {
      setError('Vui lòng chọn số sao đánh giá.')
      return
    }
    if (!feedbackType) {
      setError('Vui lòng chọn loại góp ý.')
      return
    }
    if (content.trim().length < 10) {
      setError('Nội dung góp ý phải có ít nhất 10 ký tự.')
      return
    }

    setSubmitting(true)
    const { error: dbError } = await supabase.from('feedbacks').insert({
      rating,
      category: feedbackType,
      content: content.trim(),
      feature_used: featureUsed,
      user_id: userId,
    })
    setSubmitting(false)

    if (dbError) {
      setError('Gửi góp ý thất bại. Vui lòng thử lại.')
      return
    }

    setSubmitted(true)
  }

  if (!authReady) {
    return (
      <div className="min-h-screen bg-zinc-950 flex items-center justify-center">
        <p className="text-zinc-500">Đang tải...</p>
      </div>
    )
  }

  if (submitted) {
    return (
      <div className="min-h-screen bg-zinc-950 flex items-center justify-center px-4">
        <div className="text-center max-w-sm">
          <div className="text-5xl mb-4">🎉</div>
          <h2 className="text-white text-2xl font-bold mb-2">Cảm ơn bạn đã góp ý!</h2>
          <p className="text-zinc-400 text-sm mb-8">
            Phản hồi của bạn giúp tụi mình cải thiện sản phẩm hơn mỗi ngày.
          </p>
          <button
            onClick={() => router.push(isLoggedIn ? '/dashboard' : '/')}
            className="bg-white text-black font-semibold px-6 py-2.5 rounded-lg hover:bg-zinc-200 transition-colors"
          >
            {isLoggedIn ? 'Quay lại Dashboard' : 'Quay lại Trang chủ'}
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-zinc-950 py-12 px-4 flex items-start justify-center">
      <div className="w-full max-w-md">
        <div className="mb-8 text-center">
          <h1 className="text-white text-2xl font-bold mb-2">Góp ý cho CV AI</h1>
          <p className="text-zinc-400 text-sm">
            Phản hồi của bạn giúp tụi mình cải thiện sản phẩm — cảm ơn bạn!
          </p>
        </div>

        <form onSubmit={handleSubmit} className="bg-zinc-900 rounded-2xl p-6 flex flex-col gap-6">
          {/* Rating */}
          <div>
            <label className="block text-zinc-300 text-sm font-medium mb-3">
              Đánh giá <span className="text-red-500">*</span>
            </label>
            <StarRating value={rating} onChange={setRating} />
          </div>

          {/* Feedback type */}
          <div>
            <label className="block text-zinc-300 text-sm font-medium mb-2">
              Loại góp ý <span className="text-red-500">*</span>
            </label>
            <select
              value={feedbackType}
              onChange={(e) => setFeedbackType(e.target.value as FeedbackType)}
              className="w-full bg-zinc-800 border border-zinc-700 text-white rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-zinc-500 transition-colors"
            >
              <option value="" disabled>Chọn loại góp ý...</option>
              <option value="bug">Báo lỗi</option>
              <option value="feature">Đề xuất tính năng</option>
              <option value="general">Góp ý chung</option>
              <option value="praise">Khen ngợi</option>
            </select>
          </div>

          {/* Content */}
          <div>
            <label className="block text-zinc-300 text-sm font-medium mb-2">
              Nội dung <span className="text-red-500">*</span>
            </label>
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value.slice(0, MAX))}
              rows={5}
              placeholder="Chia sẻ trải nghiệm của bạn..."
              className="w-full bg-zinc-800 border border-zinc-700 text-white rounded-lg px-3 py-2.5 text-sm placeholder-zinc-600 focus:outline-none focus:border-zinc-500 transition-colors resize-none"
            />
            <p className="text-zinc-600 text-xs mt-1 text-right">
              còn lại {MAX - content.length}/{MAX} ký tự
            </p>
          </div>

          {error && (
            <div className="bg-red-950/60 border border-red-800 text-red-400 text-sm px-4 py-3 rounded-lg">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={submitting}
            className="bg-white text-black font-semibold py-2.5 rounded-lg hover:bg-zinc-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {submitting ? 'Đang gửi...' : 'Gửi góp ý'}
          </button>
        </form>
      </div>
    </div>
  )
}

export default function FeedbackClient() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-zinc-950 flex items-center justify-center">
          <p className="text-zinc-500">Đang tải...</p>
        </div>
      }
    >
      <FeedbackContent />
    </Suspense>
  )
}
