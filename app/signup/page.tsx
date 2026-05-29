'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'

export default function SignupPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setLoading(true)

    const { error } = await supabase.auth.signUp({ email, password })

    if (error) {
      setError(error.message)
      setLoading(false)
      return
    }

    router.push('/dashboard')
  }

  return (
    <div className="min-h-screen bg-black flex items-center justify-center px-4">
      <div className="bg-zinc-900 p-8 rounded-2xl w-full max-w-md">
        <h1 className="text-white text-2xl font-bold mb-6">Đăng ký</h1>
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div>
            <label className="text-zinc-400 text-sm mb-1 block">Email</label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              className="w-full bg-zinc-800 text-white rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-white/20 placeholder-zinc-600"
            />
          </div>
          <div>
            <label className="text-zinc-400 text-sm mb-1 block">Mật khẩu</label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full bg-zinc-800 text-white rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-white/20 placeholder-zinc-600"
            />
          </div>
          {error && (
            <p className="text-red-400 text-sm bg-red-950/40 px-3 py-2 rounded-lg">{error}</p>
          )}
          <button
            type="submit"
            disabled={loading}
            className="bg-white text-black font-semibold py-2.5 rounded-lg hover:bg-zinc-200 disabled:opacity-50 transition-colors mt-1"
          >
            {loading ? 'Đang xử lý...' : 'Đăng ký'}
          </button>
          <p className="text-zinc-500 text-sm text-center">
            Đã có tài khoản?{' '}
            <a href="/login" className="text-white hover:underline">
              Đăng nhập
            </a>
          </p>
        </form>
      </div>
    </div>
  )
}
