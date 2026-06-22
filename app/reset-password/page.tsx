'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'

export default function ResetPasswordPage() {
  const router = useRouter()
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [sessionChecked, setSessionChecked] = useState(false)
  const [hasSession, setHasSession] = useState(false)

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      setHasSession(!!data.user)
      setSessionChecked(true)
    })
  }, [])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')

    if (password.length < 6) {
      setError('Mật khẩu phải có ít nhất 6 ký tự.')
      return
    }
    if (password !== confirm) {
      setError('Mật khẩu xác nhận không khớp.')
      return
    }

    setLoading(true)
    const { data: userData } = await supabase.auth.getUser()
    if (!userData.user) {
      setError('Link không hợp lệ hoặc đã hết hạn. Vui lòng yêu cầu lại.')
      setLoading(false)
      return
    }

    const { error: updateError } = await supabase.auth.updateUser({ password })
    setLoading(false)

    if (updateError) {
      setError(updateError.message)
      return
    }

    setSuccess(true)
    setTimeout(() => router.push('/dashboard'), 2000)
  }

  if (!sessionChecked) {
    return (
      <div className="min-h-screen bg-zinc-50 flex items-center justify-center p-6">
        <div className="w-12 h-12 border-4 border-black border-t-var(--fpt-orange) rounded-full animate-spin" />
      </div>
    )
  }

  if (!hasSession) {
    return (
      <div className="min-h-screen bg-zinc-50 flex items-center justify-center p-6">
        <div className="w-full max-w-md bg-white rounded-2xl p-8 sm:p-12 border-4 border-black shadow-[8px_8px_0_0_#000] text-center">
          <div className="w-16 h-16 rounded-2xl bg-red-100 flex items-center justify-center mx-auto mb-6 border-2 border-black shadow-[4px_4px_0_0_#000] transform rotate-3">
            <span className="text-3xl">🚫</span>
          </div>
          <h2 className="text-3xl font-black text-black tracking-tight uppercase mb-4">Link không hợp lệ</h2>
          <p className="text-zinc-600 font-bold mb-8">
            Link đổi mật khẩu đã hết hạn hoặc không tồn tại.
          </p>
          <a
            href="/forgot-password"
            className="w-full inline-block py-4 rounded-xl bg-black text-white font-black uppercase text-[13px] tracking-widest hover:bg-zinc-800 transition-all active:scale-95 shadow-[4px_4px_0_0_var(--fpt-orange)]"
          >
            Yêu cầu link mới
          </a>
        </div>
      </div>
    )
  }

  if (success) {
    return (
      <div className="min-h-screen bg-zinc-50 flex items-center justify-center p-6">
        <div className="w-full max-w-md bg-white rounded-2xl p-8 sm:p-12 border-4 border-black shadow-[8px_8px_0_0_#000] text-center">
          <div className="w-16 h-16 rounded-2xl bg-green-200 flex items-center justify-center mx-auto mb-6 border-2 border-black shadow-[4px_4px_0_0_#000] transform -rotate-3">
            <span className="text-3xl">✅</span>
          </div>
          <h2 className="text-3xl font-black text-black tracking-tight uppercase mb-4">Thành công!</h2>
          <p className="text-zinc-600 font-bold mb-8">Mật khẩu đã được cập nhật thành công. Đang chuyển về Dashboard...</p>
          <div className="w-8 h-8 border-4 border-black border-t-green-500 rounded-full animate-spin mx-auto" />
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-zinc-50 flex items-center justify-center p-6">
      <div className="w-full max-w-md bg-white rounded-2xl p-8 sm:p-12 border-4 border-black shadow-[8px_8px_0_0_#C4A1FF]">
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
          <h1 className="text-3xl font-black text-black tracking-tight uppercase mb-2">Đổi mật khẩu</h1>
          <p className="text-zinc-500 font-bold text-[15px]">
            Tạo mật khẩu mới cho tài khoản của bạn.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-6">
          <div>
            <label className="text-black font-black uppercase tracking-wider text-[11px] mb-2 block">Mật khẩu mới</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
              className="w-full bg-white text-black border-2 border-zinc-200 rounded-xl px-4 py-3.5 focus:outline-none focus:border-black focus:ring-4 focus:ring-zinc-100 hover:border-zinc-300 placeholder-zinc-400 text-[15px] font-bold shadow-sm transition-all"
            />
          </div>

          <div>
            <label className="text-black font-black uppercase tracking-wider text-[11px] mb-2 block">Xác nhận mật khẩu mới</label>
            <input
              type="password"
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
              placeholder="••••••••"
              required
              className="w-full bg-white text-black border-2 border-zinc-200 rounded-xl px-4 py-3.5 focus:outline-none focus:border-black focus:ring-4 focus:ring-zinc-100 hover:border-zinc-300 placeholder-zinc-400 text-[15px] font-bold shadow-sm transition-all"
            />
          </div>

          {error && (
            <p className="text-red-900 text-[13px] font-bold bg-red-100 border-l-4 border-red-500 px-4 py-3">
              ⚠️ {error}
            </p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-black hover:bg-zinc-800 text-white font-black uppercase tracking-widest text-[13px] py-4 rounded-xl shadow-[4px_4px_0_0_#C4A1FF] transition-all hover:translate-y-1 hover:shadow-[0px_0px_0_0_#C4A1FF] active:scale-95 disabled:opacity-50 mt-2"
          >
            {loading ? 'Đang cập nhật...' : 'Cập nhật mật khẩu'}
          </button>
        </form>
      </div>
    </div>
  )
}
