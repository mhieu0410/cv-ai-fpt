'use client'

import { useState } from 'react'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [sent, setSent] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setError('Email không hợp lệ.')
      return
    }

    setLoading(true)
    const { error: authError } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    })
    setLoading(false)

    if (authError) {
      // Still show success to prevent email enumeration attacks
      setSent(true)
      return
    }

    setSent(true)
  }

  if (sent) {
    return (
      <div className="min-h-screen bg-zinc-50 flex items-center justify-center p-6">
        <div className="w-full max-w-md bg-white rounded-2xl p-8 sm:p-12 border-4 border-black shadow-[8px_8px_0_0_#000] text-center relative overflow-hidden">
          <div className="w-16 h-16 rounded-2xl bg-[#E9D5FF] flex items-center justify-center mx-auto mb-6 border-2 border-black shadow-[4px_4px_0_0_#000] transform -rotate-3">
            <svg className="w-8 h-8 text-black" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h2 className="text-3xl font-black text-black tracking-tight uppercase mb-4">Đã gửi link</h2>
          <p className="text-zinc-600 font-bold mb-8">
            Đã gửi link đặt lại đến <span className="text-black">{email}</span>.
            Hãy kiểm tra hộp thư của bạn (cả spam).
          </p>
          <div className="flex flex-col gap-4">
            <button
              onClick={() => { setSent(false); setEmail('') }}
              className="w-full py-4 rounded-xl border-4 border-black text-black font-black uppercase text-[13px] tracking-widest hover:bg-zinc-100 transition-all active:scale-95 shadow-[4px_4px_0_0_#000] hover:shadow-[0px_0px_0_0_#000] hover:translate-y-1"
            >
              Gửi lại link
            </button>
            <Link
              href="/login"
              className="w-full py-4 rounded-xl border-4 border-transparent text-center text-zinc-500 hover:text-black font-bold uppercase text-[13px] tracking-widest hover:border-black transition-all"
            >
              ← Quay lại đăng nhập
            </Link>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-zinc-50 flex items-center justify-center p-6">
      <div className="w-full max-w-md bg-white rounded-2xl p-8 sm:p-12 border-4 border-black shadow-[8px_8px_0_0_var(--fpt-orange)]">
        <div className="flex items-center gap-3 mb-8 justify-center">
          <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center shadow-[4px_4px_0_0_rgba(0,0,0,0.3)] border-2 border-black">
            <svg width="24" height="24" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
              <rect x="4" y="4" width="16" height="16" stroke="black" strokeWidth="3" fill="#C4A1FF" />
              <rect x="12" y="12" width="16" height="16" stroke="black" strokeWidth="3" fill="var(--fpt-orange)" />
            </svg>
          </div>
          <span className="text-black text-2xl font-black tracking-tighter uppercase">CV AI</span>
        </div>

        <div className="mb-8 text-center">
          <h1 className="text-3xl font-black text-black tracking-tight uppercase mb-2">Quên mật khẩu?</h1>
          <p className="text-zinc-500 font-bold text-[15px]">
            Nhập email đã đăng ký, chúng tôi sẽ gửi link đặt lại mật khẩu.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-6">
          <div>
            <label htmlFor="email" className="text-black font-black uppercase tracking-wider text-[11px] mb-2 block">
              Địa chỉ Email
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@fpt.edu.vn"
              required
              className="w-full bg-white text-black border-2 border-zinc-200 rounded-xl px-4 py-3.5 focus:outline-none focus:border-black focus:ring-4 focus:ring-zinc-100 hover:border-zinc-300 placeholder-zinc-400 text-[15px] font-bold shadow-sm transition-all"
            />
          </div>

          {error && (
            <p className="text-red-900 text-[13px] font-bold bg-red-100 border-l-4 border-red-500 px-4 py-3">
              ⚠️ {error}
            </p>
          )}

          <div className="flex flex-col gap-4 mt-2">
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-black hover:bg-zinc-800 text-white font-black uppercase tracking-widest text-[13px] py-4 rounded-xl shadow-[4px_4px_0_0_#C4A1FF] transition-all hover:translate-y-1 hover:shadow-[0px_0px_0_0_#C4A1FF] active:scale-95 disabled:opacity-50"
            >
              {loading ? 'Đang gửi...' : 'Gửi link khôi phục'}
            </button>

            <Link
              href="/login"
              className="text-center text-zinc-500 hover:text-black font-black uppercase text-[12px] tracking-wider transition-colors py-2"
            >
              ← Quay lại đăng nhập
            </Link>
          </div>
        </form>
      </div>
    </div>
  )
}
