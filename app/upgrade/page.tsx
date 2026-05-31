'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { CONFIG } from '@/lib/config'

const FREE_FEATURES = [
  `Tạo tối đa ${CONFIG.freeCvLimit} CV`,
  'Gợi ý chuyên ngành cơ bản',
  'PDF có watermark',
]

const PRO_FEATURES = [
  'Tạo CV không giới hạn',
  'Gợi ý chuyên ngành chi tiết hơn',
  'PDF không watermark',
  'Ưu tiên hỗ trợ',
]

export default function UpgradePage() {
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
    <div className="min-h-screen bg-black py-12 px-4 flex flex-col items-center">
      <div className="w-full max-w-2xl">
        <div className="text-center mb-10">
          <h1 className="text-white text-3xl font-bold">Nâng cấp lên Pro</h1>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Free card */}
          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 flex flex-col">
            <p className="text-zinc-400 text-sm font-medium uppercase tracking-wide mb-1">Free</p>
            <p className="text-white text-3xl font-bold mb-6">0đ</p>

            <ul className="flex flex-col gap-2.5 flex-1 mb-8">
              {FREE_FEATURES.map((f) => (
                <li key={f} className="flex items-start gap-2 text-zinc-400 text-sm">
                  <span className="mt-0.5 text-zinc-600">✓</span>
                  {f}
                </li>
              ))}
            </ul>

            <button
              disabled
              className="w-full py-2.5 rounded-lg border border-zinc-700 text-zinc-600 text-sm font-medium cursor-not-allowed"
            >
              Đang dùng
            </button>
          </div>

          {/* Pro card */}
          <div className="bg-zinc-900 border border-blue-500 rounded-2xl p-6 flex flex-col relative">
            <span className="absolute top-4 right-4 text-xs font-semibold text-blue-400 bg-blue-950 px-2.5 py-0.5 rounded-full">
              Đề xuất
            </span>
            <p className="text-blue-400 text-sm font-medium uppercase tracking-wide mb-1">Pro 1 tháng</p>
            <p className="text-white text-3xl font-bold mb-1">
              {CONFIG.proPrice.toLocaleString('vi-VN')}đ
            </p>
            <p className="text-zinc-500 text-xs mb-6">/ tháng</p>

            <ul className="flex flex-col gap-2.5 flex-1 mb-8">
              {PRO_FEATURES.map((f) => (
                <li key={f} className="flex items-start gap-2 text-zinc-300 text-sm">
                  <span className="mt-0.5 text-blue-400">✓</span>
                  {f}
                </li>
              ))}
            </ul>

            {error && (
              <p className="text-red-400 text-xs mb-3">{error}</p>
            )}

            <button
              onClick={handleBuyPro}
              disabled={loading}
              className="w-full py-2.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-sm font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Đang tạo đơn...' : 'Mua Pro'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
