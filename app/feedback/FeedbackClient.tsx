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
    <div className="flex gap-2 justify-center sm:justify-start">
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          onClick={() => onChange(star)}
          onMouseEnter={() => setHovered(star)}
          onMouseLeave={() => setHovered(0)}
          className="text-4xl transition-transform hover:scale-125 hover:-translate-y-1 active:scale-95 leading-none"
          aria-label={`${star} sao`}
        >
          <span className={(hovered || value) >= star ? 'text-yellow-400 drop-shadow-[2px_2px_0_rgba(0,0,0,1)]' : 'text-zinc-300 drop-shadow-[2px_2px_0_rgba(0,0,0,1)]'}>
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
      setError('Bạn quên chọn số sao đánh giá kìa!')
      return
    }
    if (!feedbackType) {
      setError('Vui lòng chọn loại góp ý để tụi mình phân loại nhé.')
      return
    }
    if (content.trim().length < 10) {
      setError('Vui lòng gõ thêm xíu nữa (ít nhất 10 ký tự) nha.')
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
      setError('Đã xảy ra lỗi hệ thống. Vui lòng thử lại sau.')
      return
    }

    setSubmitted(true)
  }

  if (!authReady) {
    return (
      <div className="min-h-screen bg-zinc-50 flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-black border-t-var(--fpt-orange) rounded-full animate-spin shadow-[4px_4px_0_0_#000]" />
      </div>
    )
  }

  if (submitted) {
    return (
      <div className="min-h-screen bg-zinc-50 flex items-center justify-center px-4">
        <div className="text-center max-w-sm bg-yellow-300 p-12 rounded-[2.5rem] border-4 border-black shadow-[8px_8px_0_0_#000]">
          <div className="text-6xl mb-6 transform -rotate-12 hover:rotate-12 hover:scale-125 transition-transform duration-500">🎉</div>
          <h2 className="text-black text-4xl font-black uppercase tracking-tighter mb-4 neo-shadow-text">Tuyệt Vời!</h2>
          <p className="text-black font-bold text-[15px] mb-8 bg-white/50 p-4 border-2 border-black rounded-xl">
            Phản hồi của bạn đã được ghi nhận. Tụi mình sẽ nâng cấp hệ thống ngay!
          </p>
          <button
            onClick={() => router.push(isLoggedIn ? '/dashboard' : '/')}
            className="w-full bg-black text-white font-black uppercase text-[15px] tracking-widest py-5 rounded-2xl border-4 border-black hover:bg-[var(--fpt-orange)] transition-all active:scale-95 shadow-[4px_4px_0_0_#000] hover:shadow-[0px_0px_0_0_#000] hover:translate-y-1"
          >
            {isLoggedIn ? 'Về Dashboard' : 'Về Trang chủ'}
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-zinc-50 py-24 px-4 flex items-start justify-center">
      <div className="w-full max-w-lg">
        <div className="mb-12 text-center">
          <div className="inline-block px-4 py-1.5 border-2 border-black bg-[#C4A1FF] text-black text-[11px] font-black uppercase tracking-widest rounded mb-6 shadow-[4px_4px_0_0_#000]">
            Tiếng Nói Của Bạn
          </div>
          <h1 className="text-black text-5xl md:text-6xl font-black uppercase tracking-tighter mb-4 neo-shadow-text leading-[1.1]">
            Góp Ý <br/>Cho CV AI
          </h1>
          <p className="text-zinc-500 font-bold text-lg">
            Sản phẩm này là của bạn. Hãy nói cho chúng tôi biết bạn muốn nó trở nên thế nào.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="bg-white rounded-[2.5rem] border-4 border-black p-6 sm:p-10 flex flex-col gap-8 shadow-[8px_8px_0_0_#000]">
          
          {/* Rating */}
          <div className="text-center sm:text-left bg-zinc-50 p-6 rounded-2xl border-2 border-black">
            <label className="block text-black font-black uppercase tracking-widest text-[13px] mb-4">
              Bạn đánh giá chúng tôi mấy sao? <span className="text-[var(--fpt-orange)]">*</span>
            </label>
            <StarRating value={rating} onChange={setRating} />
          </div>

          {/* Feedback type */}
          <div>
            <label className="block text-black font-black uppercase tracking-widest text-[13px] mb-3">
              Chủ đề góp ý <span className="text-[var(--fpt-orange)]">*</span>
            </label>
            <select
              value={feedbackType}
              onChange={(e) => setFeedbackType(e.target.value as FeedbackType)}
              className="w-full bg-white border-4 border-black text-black font-black uppercase tracking-widest rounded-2xl px-5 py-4 text-[14px] focus:outline-none focus:shadow-[6px_6px_0_0_var(--fpt-orange)] hover:bg-zinc-50 transition-all appearance-none cursor-pointer"
              style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='black'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='4' d='M19 9l-7 7-7-7'%3E%3C/path%3E%3C/svg%3E")`, backgroundPosition: 'right 1.25rem center', backgroundRepeat: 'no-repeat', backgroundSize: '1.25em' }}
            >
              <option value="" disabled>CHỌN LOẠI GÓP Ý...</option>
              <option value="bug">🐛 Báo Lỗi Tính Năng</option>
              <option value="feature">✨ Đề Xuất Chức Năng Mới</option>
              <option value="general">💬 Góp Ý Trải Nghiệm</option>
              <option value="praise">❤️ Lời Khen Nhỏ Nhỏ</option>
            </select>
          </div>

          {/* Content */}
          <div>
            <label className="block text-black font-black uppercase tracking-widest text-[13px] mb-3 flex justify-between items-end">
              <span>Nội dung chi tiết <span className="text-[var(--fpt-orange)]">*</span></span>
              <span className={`text-[11px] font-bold ${content.length > MAX - 20 ? 'text-red-500' : 'text-zinc-400'}`}>
                {content.length}/{MAX}
              </span>
            </label>
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value.slice(0, MAX))}
              rows={5}
              placeholder="Vui lòng chia sẻ chi tiết..."
              className="w-full bg-white border-4 border-black text-black font-bold rounded-2xl px-5 py-4 text-[15px] placeholder-zinc-400 focus:outline-none focus:shadow-[6px_6px_0_0_#000] transition-all resize-none"
            />
          </div>

          {error && (
            <div className="bg-red-400 border-4 border-black text-black font-black uppercase tracking-widest text-[13px] px-5 py-4 rounded-xl shadow-[4px_4px_0_0_#000]">
              ⚠️ {error}
            </div>
          )}

          <button
            type="submit"
            disabled={submitting}
            className="w-full bg-[var(--fpt-orange)] hover:bg-black text-white font-black uppercase tracking-widest text-[16px] py-5 rounded-2xl border-4 border-black shadow-[6px_6px_0_0_#000] transition-all hover:translate-y-1 hover:shadow-none active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed mt-4"
          >
            {submitting ? 'ĐANG GỬI...' : 'GỬI GÓP Ý NGAY'}
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
        <div className="min-h-screen bg-zinc-50 flex items-center justify-center">
          <div className="w-12 h-12 border-4 border-black border-t-var(--fpt-orange) rounded-full animate-spin shadow-[4px_4px_0_0_#000]" />
        </div>
      }
    >
      <FeedbackContent />
    </Suspense>
  )
}
