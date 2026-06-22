'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { CheckCircle2, ShieldCheck } from 'lucide-react'
import { CONFIG } from '@/lib/config'
import { supabase } from '@/lib/supabase'

export default function CheckoutClient() {
  const params = useParams()
  const router = useRouter()
  const orderId = params.orderId as string
  const [status, setStatus] = useState<'loading' | 'waiting' | 'success'>('loading')
  const [amount] = useState(CONFIG.proPrice)

  useEffect(() => {
    async function load() {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) {
        router.push(`/login?redirect=/checkout/${orderId}`)
        return
      }
      // Simulate loading
      setTimeout(() => setStatus('waiting'), 500)
    }
    load()
  }, [orderId, router])

  // Giả lập trạng thái thanh toán thành công
  useEffect(() => {
    if (status === 'success') {
      const t = setTimeout(() => {
        router.push('/dashboard?success=pro')
      }, 2500)
      return () => clearTimeout(t)
    }
  }, [status, router])

  // Fake QR generation
  const qrUrl = `https://img.vietqr.io/image/MB-0901234567-compact2.png?amount=${amount}&addInfo=Thanh toan CV Pro ${orderId}&accountName=FPT CV Builder`

  if (status === 'loading') {
    return (
      <div className="min-h-screen bg-zinc-950 flex items-center justify-center">
        <div className="w-8 h-8 rounded-full border-2 border-[var(--fpt-orange)] border-t-transparent animate-spin" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-zinc-950 flex items-center justify-center p-4 relative overflow-hidden">
      {/* Background Video/Animation - Simulated with grainy gradient & glow */}
      <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-30 mix-blend-overlay pointer-events-none"></div>
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-[var(--fpt-orange)] opacity-20 blur-[120px] rounded-full pointer-events-none animate-pulse" />
      
      <button onClick={() => router.push('/upgrade')} className="absolute top-8 left-8 text-zinc-400 hover:text-white font-bold uppercase tracking-widest text-sm transition-colors z-50">
        ← Quay Lại
      </button>

      <AnimatePresence mode="wait">
        {status === 'waiting' ? (
          <motion.div
            key="waiting"
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 1.05, filter: 'blur(10px)' }}
            transition={{ duration: 0.5, type: 'spring' }}
            className="w-full max-w-md relative z-10"
          >
            <div className="bg-white/10 backdrop-blur-2xl border border-white/20 p-8 rounded-[2.5rem] shadow-[0_0_50px_rgba(0,0,0,0.5)] flex flex-col items-center">
              
              <div className="w-full text-center mb-8">
                <h1 className="text-white text-3xl font-black tracking-tight mb-2">Thanh Toán Pro</h1>
                <p className="text-zinc-400 text-sm font-medium">Quét mã VietQR bằng ứng dụng ngân hàng</p>
              </div>

              {/* QR Code Container */}
              <div className="relative group">
                {/* Glow behind QR */}
                <div className="absolute -inset-4 bg-[var(--fpt-orange)] opacity-20 blur-2xl group-hover:opacity-40 transition-opacity duration-500 rounded-3xl" />
                
                <div className="bg-white p-4 rounded-3xl relative z-10 shadow-2xl">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={qrUrl} alt="VietQR" className="w-64 h-64 object-contain rounded-xl" />
                </div>
                
                {/* Scanning line animation */}
                <motion.div 
                  className="absolute top-0 left-0 right-0 h-1 bg-[var(--fpt-orange)] shadow-[0_0_15px_#f26f21] z-20 rounded-full"
                  animate={{ top: ['0%', '100%', '0%'] }}
                  transition={{ duration: 3, ease: 'linear', repeat: Infinity }}
                />
              </div>

              <div className="mt-8 text-center space-y-4">
                <div className="text-white text-4xl font-black tracking-tighter neo-shadow-text">
                  {(amount).toLocaleString('vi-VN')}đ
                </div>
                <div className="flex items-center justify-center gap-2 text-zinc-400 text-xs font-bold uppercase tracking-widest">
                  <ShieldCheck className="w-4 h-4 text-green-400" />
                  Giao dịch mã hoá an toàn
                </div>
              </div>

              {/* Development helper - Nút giả lập */}
              <button 
                onClick={() => setStatus('success')}
                className="mt-8 text-[11px] font-bold uppercase tracking-widest text-zinc-500 hover:text-white underline underline-offset-4 decoration-zinc-700 transition-colors"
              >
                (Dev) Click để giả lập thanh toán 1-chạm
              </button>
            </div>
          </motion.div>
        ) : (
          <motion.div
            key="success"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, type: 'spring', bounce: 0.5 }}
            className="flex flex-col items-center text-center relative z-10"
          >
            <motion.div 
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: 'spring', bounce: 0.6 }}
              className="w-32 h-32 bg-green-500 rounded-full flex items-center justify-center shadow-[0_0_60px_rgba(34,197,94,0.6)] mb-8"
            >
              <CheckCircle2 className="w-16 h-16 text-white" />
            </motion.div>
            <h2 className="text-white text-5xl font-black tracking-tight mb-4">Thành Công!</h2>
            <p className="text-zinc-400 text-lg font-medium max-w-sm">Tài khoản của bạn đã được kích hoạt Pro. Đang chuyển hướng...</p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
