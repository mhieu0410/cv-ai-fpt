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
  pending:         { label: 'Chờ thanh toán', cls: 'text-black bg-yellow-300 border-black' },
  awaiting_review: { label: 'Đang duyệt',     cls: 'text-black bg-blue-300 border-black' },
  paid:            { label: 'Đã kích hoạt',  cls: 'text-black bg-green-400 border-black' },
  rejected:        { label: 'Bị từ chối',     cls: 'text-white bg-red-500 border-black' },
}

function StatusBadge({ status }: { status: OrderStatus }) {
  const { label, cls } = STATUS_CONFIG[status]
  return (
    <span className={`text-[11px] font-black uppercase tracking-widest px-3 py-1.5 rounded-md border-2 shadow-[2px_2px_0_0_#000] ${cls}`}>
      {label}
    </span>
  )
}

function OrderCard({ order }: { order: Order }) {
  const router = useRouter()
  return (
    <div className="bg-white border-4 border-black rounded-2xl p-6 sm:p-8 shadow-[6px_6px_0_0_#000] flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between transition-transform hover:-translate-y-1 hover:shadow-[10px_10px_0_0_#000]">
      <div className="flex flex-col gap-3 min-w-0">
        <div className="flex items-center gap-3 flex-wrap mb-1">
          <span className="text-black font-black text-lg uppercase bg-zinc-100 px-3 py-1 rounded border-2 border-black">{order.order_code}</span>
          <StatusBadge status={order.status} />
        </div>

        <p className="text-zinc-500 font-black text-sm uppercase tracking-widest mt-1">
          <span className="text-black font-black text-3xl tracking-tighter mr-2">{order.amount.toLocaleString('vi-VN')}đ</span> 
          <span className="opacity-50">/</span> {formatDateTime(order.created_at)}
        </p>

        {order.status === 'paid' && order.paid_at && (
          <p className="text-green-600 font-bold text-xs flex items-center gap-2 mt-2 bg-green-50 w-fit px-3 py-1.5 rounded-lg border-2 border-green-200">
            <span className="text-sm">✓</span> Duyệt lúc {formatDateTime(order.paid_at)}
          </p>
        )}
        {order.status === 'rejected' && order.note && (
          <p className="text-red-700 font-bold text-xs bg-red-100 p-3 rounded-xl border-2 border-red-300 mt-2">
            ⚠️ LÝ DO: {order.note}
          </p>
        )}
      </div>

      {order.status === 'pending' && (
        <button
          onClick={() => router.push(`/checkout/${order.id}`)}
          className="shrink-0 text-[13px] font-black uppercase tracking-widest text-white bg-[var(--fpt-orange)] hover:bg-orange-600 px-8 py-4 rounded-xl border-4 border-black shadow-[4px_4px_0_0_#000] transition-all hover:translate-y-px hover:shadow-none active:scale-95"
        >
          Tiếp tục thanh toán
        </button>
      )}
    </div>
  )
}

export default function OrdersMeClient() {
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
      <div className="min-h-screen bg-zinc-50 flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-black border-t-var(--fpt-orange) rounded-full animate-spin shadow-[4px_4px_0_0_#000]" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-zinc-50 pt-24 pb-20 px-4 md:px-8">
      <div className="max-w-[800px] mx-auto">
        <div className="mb-12 relative">
           <div className="inline-flex items-center gap-2 px-3 py-1 bg-[#C4A1FF] border-2 border-black rounded text-[11px] font-black uppercase tracking-widest mb-4 shadow-[4px_4px_0_0_#000]">
              Thanh Toán
           </div>
          <h1 className="text-5xl md:text-7xl font-black text-black tracking-tighter uppercase mb-4 neo-shadow-text leading-[1.1]">Lịch sử<br/>Đơn hàng</h1>
          <p className="text-zinc-500 font-bold text-lg md:text-xl">Theo dõi trạng thái nâng cấp tài khoản Pro của bạn.</p>
        </div>

        {orders.length === 0 ? (
          <div className="bg-[#C4A1FF] border-4 border-black rounded-[2.5rem] p-12 text-center shadow-[8px_8px_0_0_#000]">
            <div className="w-24 h-24 bg-white border-4 border-black rounded-full flex items-center justify-center mx-auto mb-8 transform hover:-rotate-12 hover:scale-110 transition-transform shadow-[4px_4px_0_0_#000]">
              <span className="text-5xl">🧾</span>
            </div>
            <h2 className="text-3xl font-black text-black uppercase tracking-tighter mb-4">Chưa có giao dịch</h2>
            <p className="text-black font-bold text-lg mb-10 max-w-md mx-auto opacity-80">
              Bạn chưa thực hiện giao dịch nào. Hãy nâng cấp Pro để mở khóa toàn bộ tính năng AI đỉnh cao.
            </p>
            <button
              onClick={() => router.push('/upgrade')}
              className="inline-flex items-center gap-2 bg-black hover:bg-zinc-800 text-white font-black uppercase tracking-widest px-8 py-5 rounded-2xl border-4 border-black shadow-[6px_6px_0_0_var(--fpt-orange)] transition-all hover:-translate-y-1 hover:shadow-[10px_10px_0_0_var(--fpt-orange)] active:scale-95"
            >
              Nâng cấp Pro ngay
            </button>
          </div>
        ) : (
          <div className="flex flex-col gap-6">
            {orders.map((o) => (
              <OrderCard key={o.id} order={o} />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
