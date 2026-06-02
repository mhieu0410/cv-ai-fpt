'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'

type OrderStatus = 'pending' | 'awaiting_review' | 'paid' | 'rejected'

interface Order {
  id: string
  order_code: string
  amount: number
  status: OrderStatus
  note: string | null
  created_at: string
  paid_at: string | null
}

function formatDateTime(iso: string) {
  return new Date(iso).toLocaleString('vi-VN', {
    day: '2-digit', month: '2-digit', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  })
}

const STATUS_CONFIG: Record<OrderStatus, { label: string; cls: string }> = {
  pending:         { label: 'Chờ thanh toán', cls: 'text-yellow-400 bg-yellow-950/50 border-yellow-700' },
  awaiting_review: { label: 'Đang duyệt',     cls: 'text-blue-400 bg-blue-950/50 border-blue-700' },
  paid:            { label: 'Đã thanh toán',  cls: 'text-green-400 bg-green-950/50 border-green-700' },
  rejected:        { label: 'Bị từ chối',     cls: 'text-red-400 bg-red-950/50 border-red-700' },
}

function StatusBadge({ status }: { status: OrderStatus }) {
  const { label, cls } = STATUS_CONFIG[status]
  return (
    <span className={`text-xs font-medium px-2.5 py-1 rounded-full border ${cls}`}>
      {label}
    </span>
  )
}

function OrderCard({ order }: { order: Order }) {
  const router = useRouter()
  return (
    <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex flex-col gap-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-white font-mono font-semibold">{order.order_code}</span>
          <StatusBadge status={order.status} />
        </div>

        <p className="text-zinc-400 text-sm">
          {order.amount.toLocaleString('vi-VN')}đ · {formatDateTime(order.created_at)}
        </p>

        {order.status === 'paid' && order.paid_at && (
          <p className="text-green-500 text-xs">Duyệt lúc {formatDateTime(order.paid_at)}</p>
        )}
        {order.status === 'rejected' && order.note && (
          <p className="text-red-400 text-xs">Lý do: {order.note}</p>
        )}
      </div>

      {order.status === 'pending' && (
        <button
          onClick={() => router.push(`/checkout/${order.id}`)}
          className="shrink-0 text-sm font-medium text-white bg-blue-600 hover:bg-blue-500 px-4 py-1.5 rounded-lg transition-colors"
        >
          Tiếp tục thanh toán
        </button>
      )}
    </div>
  )
}

export default function OrdersPage() {
  const router = useRouter()
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      if (!session) {
        router.push('/login?redirect=/orders/me')
        return
      }

      const { data } = await supabase
        .from('orders')
        .select('id, order_code, amount, status, note, created_at, paid_at')
        .order('created_at', { ascending: false })

      setOrders(data ?? [])
      setLoading(false)
    })
  }, [router])

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <p className="text-zinc-500">Đang tải...</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-black py-10 px-4">
      <div className="max-w-2xl mx-auto">
        <div className="flex items-center gap-4 mb-8">
          <button
            onClick={() => router.push('/dashboard')}
            className="text-zinc-500 hover:text-white text-sm transition-colors"
          >
            ← Dashboard
          </button>
          <h1 className="text-white text-xl font-bold">Lịch sử đơn hàng</h1>
        </div>

        {orders.length === 0 ? (
          <div className="text-center py-16">
            <p className="text-zinc-400 mb-4">Chưa có đơn nào.</p>
            <a
              href="/upgrade"
              className="inline-block bg-white text-black text-sm font-semibold px-6 py-2.5 rounded-lg hover:bg-zinc-200 transition-colors"
            >
              Nâng cấp Pro
            </a>
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            {orders.map((order) => (
              <OrderCard key={order.id} order={order} />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}