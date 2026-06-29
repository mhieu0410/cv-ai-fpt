'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { motion, AnimatePresence } from 'framer-motion'

const translateError = (msg: string) => {
  if (msg.includes('Invalid login credentials')) return 'Email hoặc mật khẩu không chính xác.'
  if (msg.includes('Email not confirmed')) return 'Vui lòng xác nhận email trước khi đăng nhập.'
  return 'Lỗi đăng nhập: ' + msg
}

export default function LoginPage() {
  const router = useRouter()
  const [mode, setMode] = useState<'password' | 'magic-link'>('password')
  
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  
  const [loading, setLoading] = useState(false)
  const [googleLoading, setGoogleLoading] = useState(false)

  async function handlePasswordLogin(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setSuccess('')
    setLoading(true)

    const { error: signInError } = await supabase.auth.signInWithPassword({ email, password })

    if (signInError) {
      setError(translateError(signInError.message))
      setLoading(false)
      return
    }

    redirectUser()
  }

  async function handleMagicLink(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setSuccess('')
    setLoading(true)

    const { error: otpError } = await supabase.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo: `${window.location.origin}/dashboard`,
      }
    })

    if (otpError) {
      setError(translateError(otpError.message))
    } else {
      setSuccess('Chúng tôi đã gửi một Magic Link đến email của bạn. Vui lòng kiểm tra hộp thư (cả mục Spam).')
    }
    setLoading(false)
  }

  function redirectUser() {
    const params = new URLSearchParams(window.location.search)
    const redirect = params.get('redirect')
    const dest = redirect && redirect.startsWith('/') && !redirect.startsWith('//')
      ? redirect
      : '/dashboard'
    router.push(dest)
  }

  async function handleGoogleLogin() {
    setError('')
    setGoogleLoading(true)
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/auth/callback?next=/dashboard`,
      },
    })
    if (error) {
      setError(translateError(error.message))
      setGoogleLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-zinc-50 flex">
      {/* Nửa trái: Branding / Visual (Ẩn trên mobile) */}
      <div className="hidden lg:flex w-1/2 bg-[var(--fpt-orange)] flex-col justify-between p-12 relative overflow-hidden border-r-4 border-black">
        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 mix-blend-overlay pointer-events-none"></div>
        
        {/* Abstract shapes */}
        <div className="absolute top-[-10%] right-[-10%] w-[50%] h-[50%] bg-yellow-300 rounded-full mix-blend-multiply blur-3xl opacity-50" />
        <div className="absolute bottom-[-10%] left-[-10%] w-[60%] h-[60%] bg-pink-500 rounded-full mix-blend-multiply blur-3xl opacity-30" />
        
        <div className="relative z-10 flex items-center gap-3">
          <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center shadow-[4px_4px_0_0_#000] border-2 border-black">
            <svg width="24" height="24" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
              <rect x="4" y="4" width="16" height="16" stroke="black" strokeWidth="3" fill="#C4A1FF" />
              <rect x="12" y="12" width="16" height="16" stroke="black" strokeWidth="3" fill="var(--fpt-orange)" />
            </svg>
          </div>
          <span className="text-black text-2xl font-black tracking-tighter uppercase">CV AI</span>
        </div>

        <div className="relative z-10 w-full max-w-lg mt-12">
          <span className="inline-block px-4 py-1.5 border-2 border-black bg-white text-black text-xs font-black uppercase tracking-widest rounded-full mb-6 shadow-[2px_2px_0_0_#000]">
            Vượt qua ATS
          </span>
          <h2 className="text-5xl text-black font-black tracking-tighter mb-6 leading-[1.1] uppercase neo-shadow-text">
            Chìa khóa mở<br/>
            cánh cửa OJT.
          </h2>
          <p className="text-black/80 font-bold text-lg leading-relaxed mb-10 max-w-[40ch]">
            Hơn 5.000+ sinh viên FPT đã sử dụng hệ thống AI của chúng tôi để tối ưu hóa CV và trúng tuyển kỳ thực tập doanh nghiệp.
          </p>
          
          {/* Testimonial Card */}
          <div className="bg-white border-4 border-black rounded-2xl p-6 shadow-[8px_8px_0_0_#000] relative">
            <div className="absolute -top-4 -right-4 w-10 h-10 bg-yellow-300 border-4 border-black rounded-full flex items-center justify-center text-xl shadow-[4px_4px_0_0_#000] rotate-12">
              🔥
            </div>
            <div className="flex gap-1 text-yellow-500 mb-3 text-xl">
              {'★★★★★'.split('').map((star, i) => <span key={i}>{star}</span>)}
            </div>
            <p className="text-black font-bold text-[15px] leading-relaxed italic mb-4">
              &quot;Công cụ Match JD thực sự là cứu cánh. Mình nhận ra trước đây rớt CV vì thiếu quá nhiều từ khóa quan trọng mà nhà tuyển dụng cần.&quot;
            </p>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-zinc-200 border-2 border-black overflow-hidden flex items-center justify-center font-bold text-sm bg-gradient-to-br from-purple-400 to-orange-400">NA</div>
              <div>
                <p className="text-black font-black text-sm uppercase">Nguyễn Văn A</p>
                <p className="text-zinc-600 font-bold text-xs">SE - K17 FPTU</p>
              </div>
            </div>
          </div>
        </div>
        
        <div className="relative z-10 mt-12">
          <p className="text-black/60 text-sm font-bold">© 2026 CV AI. Built for students.</p>
        </div>
      </div>

      {/* Nửa phải: Auth Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-6 sm:p-12 bg-white relative">
        <div className="w-full max-w-[420px]">
          <div className="flex lg:hidden items-center gap-3 mb-12 justify-center">
            <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center shadow-[4px_4px_0_0_#000] border-2 border-black">
              <svg width="24" height="24" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
                <rect x="4" y="4" width="16" height="16" stroke="black" strokeWidth="3" fill="#C4A1FF" />
                <rect x="12" y="12" width="16" height="16" stroke="black" strokeWidth="3" fill="var(--fpt-orange)" />
              </svg>
            </div>
            <span className="text-black text-2xl font-black tracking-tighter uppercase">CV AI</span>
          </div>

          <div className="text-center lg:text-left mb-8">
            <h1 className="text-black text-3xl font-black tracking-tighter mb-2 uppercase">Đăng nhập</h1>
            <p className="text-zinc-500 font-bold text-[15px]">Chào mừng quay trở lại bàn làm việc của bạn.</p>
          </div>

          {/* Social Login */}
          <div className="mb-8">
            <button
              onClick={handleGoogleLogin}
              disabled={googleLoading || loading}
              className="w-full flex items-center justify-center gap-3 bg-white border-4 border-black hover:bg-zinc-100 text-black font-black uppercase text-[15px] py-3.5 rounded-xl transition-all shadow-[4px_4px_0_0_#000] hover:translate-y-1 hover:shadow-[0px_0px_0_0_#000] active:scale-95 disabled:opacity-50"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
              </svg>
              {googleLoading ? 'Đang kết nối...' : 'Đăng nhập với Google'}
            </button>
          </div>

          <div className="flex items-center gap-4 mb-8">
            <div className="h-0.5 bg-zinc-200 flex-1"></div>
            <span className="text-zinc-400 text-xs font-black uppercase tracking-widest">Hoặc chọn phương thức</span>
            <div className="h-0.5 bg-zinc-200 flex-1"></div>
          </div>

          {/* Tabs for Mode */}
          <div className="flex bg-zinc-100 p-1.5 rounded-xl mb-6">
            <button 
              onClick={() => { setMode('password'); setError(''); setSuccess(''); }}
              className={`flex-1 py-2 text-[13px] font-black uppercase tracking-wider rounded-lg transition-all ${mode === 'password' ? 'bg-white shadow-sm text-black' : 'text-zinc-500 hover:text-black'}`}
            >
              Mật khẩu
            </button>
            <button 
              onClick={() => { setMode('magic-link'); setError(''); setSuccess(''); }}
              className={`flex-1 py-2 text-[13px] font-black uppercase tracking-wider rounded-lg transition-all ${mode === 'magic-link' ? 'bg-white shadow-sm text-black' : 'text-zinc-500 hover:text-black'}`}
            >
              Magic Link ✨
            </button>
          </div>

          {/* Form */}
          <form onSubmit={mode === 'password' ? handlePasswordLogin : handleMagicLink} className="flex flex-col gap-5">
            <div>
              <label className="text-black font-black uppercase tracking-wider text-[11px] mb-2 block">Địa chỉ Email</label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@fpt.edu.vn"
                className="w-full bg-white text-black border-2 border-black/20 rounded-xl px-4 py-3.5 focus:outline-none focus:border-black focus:shadow-[4px_4px_0_0_#000] hover:border-black/50 focus:-translate-y-0.5 placeholder-zinc-400 text-[15px] font-bold transition-all duration-200"
              />
            </div>
            
            {mode === 'password' && (
              <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}>
                <div className="flex justify-between items-center mb-2 mt-1">
                  <label className="text-black font-black uppercase tracking-wider text-[11px] block">Mật khẩu</label>
                  <a href="/forgot-password" className="text-zinc-500 hover:text-black text-[11px] uppercase tracking-wider font-bold transition-colors border-b-2 border-transparent hover:border-black">
                    Quên mật khẩu?
                  </a>
                </div>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full bg-white text-black border-2 border-black/20 rounded-xl px-4 py-3.5 focus:outline-none focus:border-black focus:shadow-[4px_4px_0_0_#000] hover:border-black/50 focus:-translate-y-0.5 placeholder-zinc-400 text-[15px] font-bold transition-all duration-200"
                />
              </motion.div>
            )}

            <AnimatePresence>
              {error && (
                <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>
                  <p className="text-red-900 text-[13px] font-bold bg-red-100 border-l-4 border-red-500 px-4 py-3 flex items-start gap-2">
                    <span>⚠️</span>
                    {error}
                  </p>
                </motion.div>
              )}
              {success && (
                <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>
                  <p className="text-green-900 text-[13px] font-bold bg-green-100 border-l-4 border-green-500 px-4 py-3 flex items-start gap-2">
                    <span>✨</span>
                    {success}
                  </p>
                </motion.div>
              )}
            </AnimatePresence>

            <button
              type="submit"
              disabled={loading || googleLoading}
              className="w-full bg-black hover:bg-zinc-800 text-white font-black uppercase tracking-widest text-[13px] py-4 rounded-xl shadow-[4px_4px_0_0_var(--fpt-orange)] transition-all hover:translate-y-1 hover:shadow-[0px_0px_0_0_var(--fpt-orange)] active:scale-95 disabled:opacity-50 mt-2"
            >
              {loading ? 'Đang xử lý...' : (mode === 'password' ? 'Đăng nhập' : 'Gửi Link Đăng Nhập')}
            </button>
            
            <p className="text-zinc-500 text-[14px] font-bold text-center mt-6">
              Chưa có tài khoản?{' '}
              <a href="/signup" className="text-black font-black uppercase tracking-wider text-[12px] hover:underline border-b-2 border-transparent hover:border-black transition-all">
                Tạo tài khoản mới
              </a>
            </p>
          </form>
        </div>
      </div>
    </div>
  )
}