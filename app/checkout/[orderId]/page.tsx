'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { CONFIG } from '@/lib/config'

interface Order {
  id: string
  order_code: string
  amount: number
  status: 'pending' | 'awaiting_review' | 'paid' | 'rejected'
  note: string | null
}

function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false)

  async function handleCopy() {
    await navigator.clipboard.writeText(text)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <button
      type="button"
      onClick={handleCopy}
      className="text-xs text-blue-400 hover:text-blue-300 transition-colors shrink-0"
    >
      {copied ? '✓ Đã copy' : 'Copy'}
    </button>
  )
}

function InfoRow({
  label,
  value,
  copyable,
  copyText,
}: {
  label: string
  value: string
  copyable?: boolean
  copyText?: string
}) {
  return (
    <div className="flex items-center justify-between gap-3">
      <span className="text-zinc-500 text-sm shrink-0">{label}</span>
      <div className="flex items-center gap-2 min-w-0">
        <span className="text-zinc-200 text-sm text-right truncate">{value}</span>
        {copyable && <CopyButton text={copyText ?? value} />}
      </div>
    </div>
  )
}

export default function CheckoutPage() {
  const params = useParams()
  const router = useRouter()
  const orderId = params.orderId as string

  const [order, setOrder] = useState<Order | null>(null)
  const [loading, setLoading] = useState(true)
  const [notFound, setNotFound] = useState(false)
  const [localStatus, setLocalStatus] = useState<Order['status'] | null>(null)

  const [bankTxnId, setBankTxnId] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    async function load() {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) {
        router.push(`/login?redirect=/checkout/${orderId}`)
        return
      }

      const { data, error: fetchError } = await supabase
        .from('orders')
        .select('id, order_code, amount, status, note')
        .eq('id', orderId)
        .single()

      if (fetchError || !data) {
        setNotFound(true)
      } else {
        setOrder(data)
        setLocalStatus(data.status)
      }
      setLoading(false)
    }
    load()
  }, [orderId, router])

  async function handleConfirm(e: React.FormEvent) {
    e.preventDefault()
    setError('')

    if (bankTxnId.trim().length < 4) {
      setError('Mã giao dịch phải có ít nhất 4 ký tự.')
      return
    }

    setSubmitting(true)
    const res = await fetch(`/api/orders/${orderId}/confirm`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ bank_txn_id: bankTxnId.trim() }),
    })
    const json = await res.json()
    setSubmitting(false)

    if (!res.ok) {
      setError(json.error ?? 'Xác nhận thất bại. Vui lòng thử lại.')
      return
    }

    setLocalStatus('awaiting_review')
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <p className="text-zinc-500">Đang tải...</p>
      </div>
    )
  }

  if (notFound || !order) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center px-4">
        <div className="text-center">
          <p className="text-zinc-400 mb-6">Không tìm thấy đơn hàng.</p>
          <button
            onClick={() => router.push('/dashboard')}
            className="bg-white text-black font-semibold px-6 py-2.5 rounded-lg hover:bg-zinc-200 transition-colors"
          >
            Quay lại Dashboard
          </button>
        </div>
      </div>
    )
  }

  if (localStatus === 'paid') {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center px-4">
        <div className="text-center">
          <div className="text-5xl mb-4">🎉</div>
          <h2 className="text-white text-2xl font-bold mb-2">Thanh toán thành công!</h2>
          <p className="text-zinc-400 text-sm mb-8">Đơn này đã được thanh toán thành công.</p>
          <button
            onClick={() => router.push('/dashboard')}
            className="bg-white text-black font-semibold px-6 py-2.5 rounded-lg hover:bg-zinc-200 transition-colors"
          >
            Dashboard
          </button>
        </div>
      </div>
    )
  }

  if (localStatus === 'rejected') {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center px-4">
        <div className="text-center max-w-sm">
          <div className="text-4xl mb-4">❌</div>
          <h2 className="text-white text-xl font-bold mb-2">Đơn bị từ chối</h2>
          {order.note && (
            <p className="text-zinc-400 text-sm mb-6">{order.note}</p>
          )}
          <button
            onClick={() => router.push('/upgrade')}
            className="bg-white text-black font-semibold px-6 py-2.5 rounded-lg hover:bg-zinc-200 transition-colors"
          >
            Thử lại
          </button>
        </div>
      </div>
    )
  }

  const qrUrl =
    `https://img.vietqr.io/image/970415-${CONFIG.bank.account}-compact2.png` +
    `?amount=${order.amount}&addInfo=${encodeURIComponent(order.order_code)}`

  return (
    <div className="min-h-screen bg-black py-12 px-4 flex items-start justify-center">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <p className="text-zinc-500 text-sm mb-1">Thanh toán đơn</p>
          <h1 className="text-white text-2xl font-bold tracking-wide">{order.order_code}</h1>
          <p className="text-white text-4xl font-bold mt-3">
            {order.amount.toLocaleString('vi-VN')}đ
          </p>
        </div>

        <div className="bg-zinc-900 rounded-2xl p-6 flex flex-col gap-6">
          {/* QR */}
          <div className="flex justify-center">
            <img
              src={qrUrl}
              alt="QR chuyển khoản"
              width={208}
              height={208}
              className="rounded-xl bg-white p-2 object-contain"
            />
          </div>

          {/* Bank info */}
          <div className="flex flex-col gap-3">
            <InfoRow label="Ngân hàng" value={CONFIG.bank.name} />
            <InfoRow label="Số tài khoản" value={CONFIG.bank.account} copyable />
            <InfoRow label="Chủ tài khoản" value={CONFIG.bank.holder} />
            <InfoRow
              label="Số tiền"
              value={`${order.amount.toLocaleString('vi-VN')}đ`}
              copyable
              copyText={String(order.amount)}
            />

            {/* Content — highlighted */}
            <div className="bg-yellow-950/50 border border-yellow-700 rounded-xl p-3.5">
              <p className="text-yellow-500 text-xs font-semibold uppercase tracking-wide mb-2">
                ⚠️ Nội dung chuyển khoản — bắt buộc ghi đúng
              </p>
              <div className="flex items-center justify-between gap-2">
                <span className="text-yellow-300 font-mono font-bold text-lg tracking-wider">
                  {order.order_code}
                </span>
                <CopyButton text={order.order_code} />
              </div>
              <p className="text-yellow-700 text-xs mt-1.5">
                Ghi sai nội dung sẽ không xác định được đơn hàng của bạn.
              </p>
            </div>
          </div>

          {/* Confirm / awaiting */}
          {localStatus === 'awaiting_review' ? (
            <div className="bg-green-950/50 border border-green-800 text-green-400 text-sm px-4 py-3 rounded-xl text-center leading-relaxed">
              ✓ Đã ghi nhận. Tụi mình sẽ duyệt trong 24h, bạn nhận thông báo khi xong.
            </div>
          ) : (
            <form onSubmit={handleConfirm} className="flex flex-col gap-3">
              <div>
                <label className="block text-zinc-400 text-sm mb-1.5">
                  Mã giao dịch ngân hàng <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={bankTxnId}
                  onChange={(e) => setBankTxnId(e.target.value)}
                  placeholder="VD: FT24123456789"
                  className="w-full bg-zinc-800 border border-zinc-700 text-white rounded-lg px-3 py-2.5 text-sm placeholder-zinc-600 focus:outline-none focus:border-zinc-500 transition-colors"
                />
              </div>

              {error && <p className="text-red-400 text-sm">{error}</p>}

              <button
                type="submit"
                disabled={submitting}
                className="w-full py-2.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-semibold text-sm transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {submitting ? 'Đang xác nhận...' : 'Tôi đã chuyển khoản'}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  )
}
