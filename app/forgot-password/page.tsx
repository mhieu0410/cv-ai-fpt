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
      <div className="min-h-screen bg-gray-950 flex items-center justify-center px-4">
        <div className="w-full max-w-md bg-gray-900 rounded-2xl p-8 shadow-xl border border-gray-800 text-center">
          <div className="w-12 h-12 rounded-full bg-violet-600/20 flex items-center justify-center mx-auto mb-4">
            <svg className="w-6 h-6 text-violet-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h2 className="text-xl font-semibold text-white mb-2">Đã gửi link đặt lại</h2>
          <p className="text-gray-400 text-sm mb-6">
            Đã gửi link đặt lại đến <span className="text-white font-medium">{email}</span>.
            Hãy kiểm tra hộp thư của bạn (cả spam folder).
          </p>
          <div className="flex flex-col gap-3">
            <button
              onClick={() => { setSent(false); setEmail('') }}
              className="w-full py-2.5 rounded-xl border border-gray-700 text-gray-300 hover:bg-gray-800 transition-colors text-sm"
            >
              Gửi lại
            </button>
            <Link
              href="/login"
              className="w-full py-2.5 rounded-xl text-center text-gray-400 hover:text-white transition-colors text-sm"
            >
              ← Quay lại đăng nhập
            </Link>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-950 flex items-center justify-center px-4">
      <div className="w-full max-w-md bg-gray-900 rounded-2xl p-8 shadow-xl border border-gray-800">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-white mb-2">Quên mật khẩu?</h1>
          <p className="text-gray-400 text-sm">
            Nhập email đã đăng ký, tụi mình sẽ gửi link đặt lại mật khẩu vào hộp thư của bạn.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <label htmlFor="email" className="text-sm text-gray-300">
              Email
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              required
              className="w-full bg-gray-800 border border-gray-700 rounded-xl px-4 py-2.5 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent transition"
            />
          </div>

          {error && (
            <p className="text-red-400 text-sm">{error}</p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2.5 rounded-xl font-medium text-white bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-500 hover:to-purple-500 disabled:opacity-60 disabled:cursor-not-allowed transition-all"
          >
            {loading ? 'Đang gửi...' : 'Gửi link đặt lại'}
          </button>
        </form>

        <div className="mt-5 text-center">
          <Link href="/login" className="text-sm text-gray-400 hover:text-white transition-colors">
            ← Quay lại đăng nhập
          </Link>
        </div>
      </div>
    </div>
  )
}
