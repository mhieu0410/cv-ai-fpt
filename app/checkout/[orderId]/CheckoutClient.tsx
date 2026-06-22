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

  const [verifying, setVerifying] = useState(false)
  const [error, setError] = useState('')

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

  async function handleVerify() {
    if (verifying) return
    setVerifying(true)
    setError('')

    try {
      // Simulate banking delay
      await new Promise(res => setTimeout(res, 2000))

      const res = await fetch(`/api/orders/${orderId}/verify`, {
        method: 'POST'
      })
      const data = await res.json()

      if (!res.ok) {
        throw new Error(data.error || 'Lỗi xác thực thanh toán')
      }

      setStatus('success')
      setTimeout(() => {
        router.push('/dashboard?success=pro')
      }, 2500)
    } catch (err: any) {
      setError(err.message || 'Không thể xác nhận giao dịch. Vui lòng thử lại.')
      setVerifying(false)
    }
  }

  // Fake QR generation
  const encodedAccountName = encodeURIComponent(CONFIG.bank.holder || 'FPT CV Builder')
  const qrUrl = `https://img.vietqr.io/image/${CONFIG.bank.bin}-${CONFIG.bank.account}-compact2.png?amount=${amount}&addInfo=Thanh toan CV Pro ${orderId}&accountName=${encodedAccountName}`

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

              <div className="mt-8 text-center space-y-4 w-full">
                <div className="text-white text-4xl font-black tracking-tighter neo-shadow-text">
                  {(amount).toLocaleString('vi-VN')}đ
                </div>
                <div className="flex items-center justify-center gap-2 text-zinc-400 text-xs font-bold uppercase tracking-widest">
                  <ShieldCheck className="w-4 h-4 text-green-400" />
                  Giao dịch mã hoá an toàn
                </div>

                {error && (
                  <div className="mt-4 p-3 border-2 border-red-500 bg-red-500/20 text-red-200 text-sm font-bold rounded-xl">
                    {error}
                  </div>
                )}

                <button 
                  onClick={handleVerify}
                  disabled={verifying}
                  className="w-full mt-6 py-4 px-6 bg-[var(--fpt-orange)] text-white font-black uppercase tracking-widest rounded-2xl shadow-[0_0_20px_-5px_#f26f21] hover:shadow-[0_0_40px_-5px_#f26f21] transition-all disabled:opacity-50 disabled:shadow-none hover:-translate-y-1 active:scale-95 border-4 border-transparent"
                >
                  {verifying ? 'ĐANG KIỂM TRA GD...' : 'TÔI ĐÃ CHUYỂN KHOẢN'}
                </button>
              </div>
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
