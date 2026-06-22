'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { CONFIG } from '@/lib/config'
import { motion } from 'framer-motion'
import { ParallaxCard } from '@/components/ui/parallax-card'
import { MagneticButton } from '@/components/ui/magnetic-button'

export default function UpgradeClient({ isPro = false }: { isPro?: boolean }) {
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
    <div className="min-h-screen bg-[#f8f9fa] font-sans selection:bg-[var(--fpt-orange)] selection:text-white">
      
      {/* ── HEADER (Neo-brutalism) ── */}
      <header className="h-20 w-full bg-white border-b-4 border-black flex items-center justify-between px-6 z-50 sticky top-0 shadow-[0_4px_0_0_#000]">
        <button onClick={() => router.push('/dashboard')} className="text-black font-black uppercase tracking-widest text-[13px] px-4 py-2 border-2 border-black rounded-xl hover:-translate-y-1 hover:shadow-[4px_4px_0_0_#000] active:translate-y-0 active:shadow-none transition-all flex items-center gap-2 bg-zinc-100">
          ← Dashboard
        </button>
        <span className="text-black font-black uppercase tracking-widest text-sm hidden sm:inline-block">Nâng Cấp Tài Khoản</span>
        <div className="w-24" /> {/* Spacer */}
      </header>

      {/* ── HERO SECTION ── */}
      <section className="relative pt-24 pb-16 px-4 sm:px-6 overflow-hidden flex flex-col items-center text-center">
        {/* Background Grid Pattern */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#8080801a_1px,transparent_1px),linear-gradient(to_bottom,#8080801a_1px,transparent_1px)] bg-[size:40px_40px] pointer-events-none" />
        
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, type: 'spring', bounce: 0.4 }}
          className="relative z-10 max-w-4xl mx-auto flex flex-col items-center"
        >
          <div className="inline-block px-4 py-1.5 bg-yellow-300 border-2 border-black rounded-full shadow-[4px_4px_0_0_#000] text-xs font-black uppercase tracking-[0.2em] mb-8 rotate-[-2deg] hover:rotate-0 transition-transform cursor-default">
            Đầu tư cho sự nghiệp
          </div>
          
          <h1 className="text-6xl md:text-8xl lg:text-[7rem] font-black tracking-tighter text-black uppercase leading-[0.9] mb-8 drop-shadow-[6px_6px_0_rgba(0,0,0,1)]">
            Vượt Trội <br/> <span className="text-[var(--fpt-orange)]">Hơn Đối Thủ</span>
          </h1>
          
          <p className="text-lg md:text-xl font-bold text-zinc-600 max-w-2xl leading-relaxed border-2 border-black bg-white p-4 rounded-xl shadow-[4px_4px_0_0_#000]">
            Bỏ ra số tiền bằng 1 ly trà sữa để sở hữu CV 10 điểm trong mắt nhà tuyển dụng. Đầu tư thông minh, trúng tuyển linh đình!
          </p>
        </motion.div>
      </section>

      {/* ── PRICING CARDS ── */}
      <section className="max-w-5xl mx-auto px-4 sm:px-6 pb-32 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12 items-stretch">
          
          {/* FREE PLAN */}
          <motion.div
            initial={{ opacity: 0, x: -40 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.1, type: 'spring' }}
            className="h-full"
          >
            <ParallaxCard
              containerClassName="h-full"
              className="h-full bg-white border-4 border-black rounded-[2.5rem] shadow-[12px_12px_0_0_#000] hover:shadow-[16px_16px_0_0_#000] transition-shadow duration-300 flex flex-col"
            >
              <div className="p-8 md:p-10 flex flex-col h-full">
                <h3 className="text-2xl font-black text-zinc-500 uppercase mb-2">Gói Cơ Bản</h3>
                <div className="text-6xl font-black text-black tracking-tighter mb-4">0đ</div>
                <div className="text-xs font-black uppercase tracking-widest text-zinc-400 mb-8 pb-6 border-b-4 border-zinc-100">
                  Mãi mãi miễn phí
                </div>
                
                <ul className="space-y-5 flex-1 mb-10">
                  {[
                    `Tạo tối đa ${CONFIG.freeCvLimit} bản CV`,
                    'Sử dụng Template Tiêu Chuẩn',
                    'Xuất PDF có Watermark logo FPT',
                    'Gợi ý từ khóa AI mức cơ bản',
                  ].map((f) => (
                    <li key={f} className="flex items-start gap-3 text-base font-bold text-zinc-600">
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" className="text-black flex-shrink-0 mt-0.5" aria-hidden="true">
                        <polyline points="20 6 9 17 4 12"/>
                      </svg>
                      {f}
                    </li>
                  ))}
                </ul>
                {!isPro && (
                  <div className="block w-full py-4 border-4 border-zinc-200 bg-zinc-100 text-zinc-400 font-black uppercase text-[15px] tracking-widest text-center rounded-2xl cursor-not-allowed">
                    Đang sử dụng
                  </div>
                )}
              </div>
            </ParallaxCard>
          </motion.div>

          {/* PRO PLAN */}
          <motion.div
            initial={{ opacity: 0, x: 40 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.2, type: 'spring' }}
            className="h-full relative"
          >
            {/* Recommendation Badge */}
            <div 
              className="absolute -top-5 right-8 z-20 px-6 py-2 border-4 border-black bg-yellow-300 text-black font-black text-[13px] uppercase tracking-widest rounded-xl shadow-[4px_4px_0_0_#000]"
              style={{ transform: "rotate(4deg)" }}
            >
              🔥 Đáng tiền nhất
            </div>

            <ParallaxCard
              containerClassName="h-full"
              className="h-full bg-black border-4 border-black rounded-[2.5rem] shadow-[12px_12px_0_0_var(--fpt-orange)] hover:shadow-[20px_20px_0_0_var(--fpt-orange)] transition-shadow duration-300 flex flex-col relative overflow-hidden"
            >
              {/* Decorative background circle */}
              <div className="absolute top-0 right-0 w-64 h-64 bg-[var(--fpt-orange)] rounded-full blur-[100px] opacity-30 pointer-events-none" />

              <div className="p-8 md:p-10 flex flex-col h-full relative z-10">
                <h3 className="text-2xl font-black text-yellow-400 uppercase mb-2">Gói Pro AI</h3>
                <div className="text-6xl md:text-7xl font-black text-white tracking-tighter mb-4 drop-shadow-[4px_4px_0_var(--fpt-orange)]">
                  49K
                </div>
                <div className="text-xs font-black uppercase tracking-widest text-zinc-400 mb-8 pb-6 border-b-4 border-zinc-800">
                  / Tháng · Thanh toán 1 lần · Không tự gia hạn
                </div>
                
                <ul className="space-y-5 flex-1 mb-8">
                  {[
                    'Tạo không giới hạn số lượng CV',
                    'Mở khóa tất cả Premium Templates',
                    'Xuất PDF Sạch (Không Watermark)',
                    'AI Review & Chấm điểm CV theo chuẩn ATS',
                    'AI Match CV với JD Công ty mơ ước',
                  ].map((f) => (
                    <li key={f} className="flex items-start gap-3 text-base font-bold text-white">
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" className="text-yellow-400 flex-shrink-0 mt-0.5" aria-hidden="true">
                        <polyline points="20 6 9 17 4 12"/>
                      </svg>
                      {f}
                    </li>
                  ))}
                </ul>

                {error && (
                  <p className="text-white bg-red-500 border-2 border-white rounded-xl px-4 py-3 font-bold text-sm mb-6 shadow-[4px_4px_0_0_#fff]">
                    {error}
                  </p>
                )}

                <MagneticButton className="w-full">
                  <button onClick={handleBuyPro} disabled={loading} className="block w-full py-4 border-2 border-black bg-[var(--fpt-orange)] text-white font-black uppercase text-[15px] tracking-widest text-center rounded-2xl shadow-[6px_6px_0_0_#fff] hover:-translate-y-1 hover:shadow-[8px_8px_0_0_#fff] active:translate-y-0 active:shadow-none transition-all disabled:opacity-50 disabled:translate-y-0 disabled:shadow-[6px_6px_0_0_#fff]">
                    {loading ? 'Đang Tạo Đơn...' : isPro ? 'Gia hạn thêm 30 ngày' : 'Lên Đời Pro Ngay'}
                  </button>
                </MagneticButton>
              </div>
            </ParallaxCard>
          </motion.div>
          
        </div>
      </section>

      {/* ── FAQ / TRUST SECTION ── */}
      <section className="max-w-4xl mx-auto px-4 sm:px-6 pb-20">
        <div className="bg-white border-4 border-black rounded-[2rem] p-8 md:p-12 shadow-[12px_12px_0_0_#000]">
          <h2 className="text-3xl font-black text-black uppercase text-center mb-10">Bạn còn lăn tăn?</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div>
              <h4 className="text-lg font-black text-black flex items-center gap-2 mb-2">
                <span className="text-2xl">⚡</span> Kích hoạt bao lâu?
              </h4>
              <p className="text-zinc-600 font-semibold leading-relaxed">
                Sau khi thanh toán qua mã VietQR, hệ thống sẽ tự động đối soát và kích hoạt gói Pro cho bạn <strong>ngay lập tức trong vòng 3 giây</strong>.
              </p>
            </div>
            
            <div>
              <h4 className="text-lg font-black text-black flex items-center gap-2 mb-2">
                <span className="text-2xl">💳</span> Có tự động trừ tiền?
              </h4>
              <p className="text-zinc-600 font-semibold leading-relaxed">
                <strong>Tuyệt đối không!</strong> Bạn thanh toán thủ công từng lần thông qua chuyển khoản. Không lưu thẻ, không tự động gia hạn lén lút.
              </p>
            </div>
            
            <div>
              <h4 className="text-lg font-black text-black flex items-center gap-2 mb-2">
                <span className="text-2xl">🔒</span> Bảo mật dữ liệu?
              </h4>
              <p className="text-zinc-600 font-semibold leading-relaxed">
                Tất cả dữ liệu CV và thanh toán của bạn được mã hóa an toàn qua Supabase và cổng thanh toán nội địa uy tín.
              </p>
            </div>

            <div>
              <h4 className="text-lg font-black text-black flex items-center gap-2 mb-2">
                <span className="text-2xl">💼</span> Chất lượng AI ra sao?
              </h4>
              <p className="text-zinc-600 font-semibold leading-relaxed">
                Chúng tôi sử dụng mô hình ngôn ngữ lớn (LLM) hiện đại, được tinh chỉnh dành riêng cho thị trường tuyển dụng IT tại Việt Nam.
              </p>
            </div>
          </div>
        </div>
      </section>

    </div>
  )
}
