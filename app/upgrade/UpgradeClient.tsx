'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { CONFIG } from '@/lib/config'
import { motion } from 'framer-motion'
import { ParallaxCard } from '@/components/ui/parallax-card'
import { MagneticButton } from '@/components/ui/magnetic-button'

export default function UpgradeClient() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function handleBuyPro() {
    setError('')

    const { data: { session } } = await supabase.auth.getSession()
    if (!session) {
      router.push('/login?redirect=/upgrade')
      return
    }

    setLoading(true)
    const res = await fetch('/api/orders/create', { method: 'POST' })
    const json = await res.json()
    setLoading(false)

    if (!res.ok) {
      setError(json.error ?? 'Tạo đơn hàng thất bại. Vui lòng thử lại.')
      return
    }

    router.push(`/checkout/${json.orderId}`)
  }

  return (
    <div className="min-h-screen bg-white pb-32">
      {/* ── HEADER ──────────────────────────────────────────────────────── */}
      <div className="bg-[var(--fpt-orange)] border-b-4 border-black px-4 py-3 flex justify-between items-center z-[60] sticky top-0">
        <button onClick={() => router.push('/dashboard')} className="text-black font-black uppercase tracking-widest text-sm hover:underline flex items-center gap-2">
          ← Dashboard
        </button>
        <span className="text-black font-black uppercase tracking-widest text-sm hidden sm:inline-block">Nâng Cấp Tài Khoản</span>
        <div className="w-20" /> {/* Spacer */}
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 pt-20">
        <motion.div
          initial={{ opacity: 0, y: 32 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: [0.32, 0.72, 0, 1] }}
          className="mb-20"
        >
          <span className="inline-block rounded-full px-3 py-1 text-[11px] uppercase tracking-[0.2em] font-black border-2 border-black bg-yellow-300 mb-6">
            Bảng Giá
          </span>
          <h1 className="text-6xl md:text-8xl font-black tracking-tighter text-black uppercase neo-shadow-text">
            Đầu Tư<br />Thông Minh
          </h1>
          <p className="text-xl font-bold text-zinc-500 mt-4 max-w-[55ch]">
            Giá 1 ly trà sữa đổi lấy cơ hội OJT mơ ước — không cần suy nghĩ nhiều.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 max-w-5xl mx-auto">
          {/* Free Tier — slide from left */}
          <motion.div
            initial={{ opacity: 0, x: -48 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.7, ease: [0.32, 0.72, 0, 1] }}
          >
            <ParallaxCard
              containerClassName="h-full"
              className="border-4 border-black rounded-none bg-zinc-100 neo-shadow h-full"
            >
              <div className="p-10 flex flex-col h-full">
                <h3 className="text-3xl font-black text-black uppercase mb-2">Gói Free</h3>
                <div className="text-7xl font-black text-black tracking-tighter mb-6 neo-shadow-text">0đ</div>
                <div className="text-xs font-black uppercase tracking-widest text-zinc-500 mb-8 border-b-2 border-zinc-300 pb-5">
                  Mãi mãi miễn phí
                </div>
                <ul className="space-y-4 mb-10 flex-1">
                  {[
                    `Tạo tối đa ${CONFIG.freeCvLimit} bản CV`,
                    'Sử dụng Template Tiêu Chuẩn',
                    'Xuất PDF miễn phí (Watermark)',
                    'Gợi ý AI mức cơ bản',
                  ].map((f) => (
                    <li key={f} className="flex items-center gap-3 text-base font-bold text-black">
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" className="text-[var(--fpt-orange)] flex-shrink-0" aria-hidden="true">
                        <polyline points="9 18 15 12 9 6"/>
                      </svg>
                      {f}
                    </li>
                  ))}
                </ul>
                <div className="w-full">
                  <div className="block w-full py-4 border-4 border-black bg-zinc-300 text-zinc-500 font-black uppercase text-lg text-center opacity-70 cursor-not-allowed">
                    Đang sử dụng
                  </div>
                </div>
              </div>
            </ParallaxCard>
          </motion.div>

          {/* Pro Tier — slide from right */}
          <motion.div
            initial={{ opacity: 0, x: 48 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.7, ease: [0.32, 0.72, 0, 1], delay: 0.1 }}
            className="relative group"
          >
            {/* Glow Effect */}
            <div className="absolute -inset-2 bg-gradient-to-r from-orange-500 to-yellow-400 rounded-3xl blur-2xl opacity-20 group-hover:opacity-50 transition duration-1000 pointer-events-none"></div>
            
            <ParallaxCard
              containerClassName="h-full relative z-10"
              className="border-4 border-black rounded-[2rem] bg-zinc-950 neo-shadow h-full"
            >
              <div className="p-10 flex flex-col h-full relative">
                {/* Badge — overlaps top-right border of card */}
                <div
                  className="absolute -top-px -right-px z-20 px-4 py-1.5 border-4 border-black bg-yellow-300 text-black font-black text-xs uppercase tracking-widest"
                  style={{ boxShadow: "3px 3px 0 0 #000", transform: "rotate(3deg) translate(4px, -6px)" }}
                >
                  KHUYÊN DÙNG
                </div>
                <h3 className="text-3xl font-black text-white uppercase mb-2">Gói Pro AI</h3>
                <div className="text-7xl font-black text-white tracking-tighter mb-1 neo-shadow-text">{CONFIG.proPrice / 1000}K</div>
                <div className="text-sm font-black text-white mb-8 border-b-4 border-zinc-800 pb-5 uppercase tracking-widest">
                  / Tháng · VietQR · Không tự gia hạn
                </div>
                <ul className="space-y-4 mb-6 flex-1">
                  {[
                    'Tạo CV Vô Hạn',
                    'Phân tích & Match JD Chuyên Sâu',
                    'Sửa lỗi và nâng cấp từ khóa tự động',
                    'Mở khóa tất cả Template Premium (Không Watermark)',
                  ].map((f) => (
                    <li key={f} className="flex items-start gap-3 text-base font-bold text-white">
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" className="text-[var(--fpt-orange)] flex-shrink-0 mt-0.5" aria-hidden="true">
                        <polyline points="9 18 15 12 9 6"/>
                      </svg>
                      {f}
                    </li>
                  ))}
                </ul>

                {/* Savings callout */}
                <div className="bg-black text-white px-4 py-3 text-xs font-bold mb-6 leading-relaxed border-2 border-black">
                  <span className="text-yellow-300 font-black">Tiết kiệm ~2,000,000đ</span> so với thuê coach viết CV tay — chất lượng hơn 10 lần.
                </div>

                {/* Trust signals */}
                <div className="flex gap-4 text-[10px] font-black uppercase text-zinc-400 mb-6">
                  {['Hủy bất lúc', 'Bảo mật', 'VietQR'].map((s) => (
                    <div key={s} className="flex items-center gap-1.5">
                      <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" aria-hidden="true">
                        <polyline points="20 6 9 17 4 12"/>
                      </svg>
                      {s}
                    </div>
                  ))}
                </div>

                {error && (
                  <p className="text-red-900 bg-red-100 border-2 border-red-900 px-4 py-2 font-bold text-sm mb-4">{error}</p>
                )}

                <MagneticButton className="w-full">
                  <button onClick={handleBuyPro} disabled={loading} className="block w-full py-4 border-4 border-transparent bg-[var(--fpt-orange)] text-white font-black uppercase text-lg text-center rounded-2xl shadow-[0_0_40px_-10px_#f26f21] hover:shadow-[0_0_60px_-10px_#f26f21] hover:-translate-y-1.5 transition-all active:scale-95 disabled:opacity-50 disabled:scale-100 disabled:translate-y-0 disabled:shadow-none">
                    {loading ? 'Đang Tạo Đơn...' : 'Lên Đời Pro'}
                  </button>
                </MagneticButton>
              </div>
            </ParallaxCard>
          </motion.div>
        </div>
      </div>
    </div>
  )
}
