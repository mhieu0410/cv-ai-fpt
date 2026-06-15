'use client'

import { useState, useEffect, useCallback } from 'react'
import { loadOrders } from './actions' // <-- Import từ file actions mới

type OrderStatus = 'pending' | 'awaiting_review' | 'paid' | 'rejected'

interface Order {
  id: string
  order_code: string
  amount: number
  status: OrderStatus
  bank_txn_id: string | null
  created_at: string
  paid_at: string | null
  note: string | null
  profiles: { email: string } | null
}

// ── Helpers ──────────────────────────────────────────────────────────────────

function fmtVnd(amount: number) {
  return amount.toLocaleString('vi-VN') + 'đ'
}

function fmtDate(iso: string) {
  return new Date(iso).toLocaleString('vi-VN', {
    day: '2-digit', month: '2-digit',
    hour: '2-digit', minute: '2-digit',
  })
}

const STATUS_CONFIG: Record<OrderStatus, { label: string; cls: string }> = {
  pending:         { label: 'Chờ TT',    cls: 'text-yellow-700 bg-yellow-100' },
  awaiting_review: { label: 'Chờ duyệt', cls: 'text-blue-700 bg-blue-100' },
  paid:            { label: 'Đã TT',     cls: 'text-green-700 bg-green-100' },
  rejected:        { label: 'Từ chối',   cls: 'text-red-700 bg-red-100' },
}

const TABS = [
  { key: 'awaiting_review' as const, label: 'Chờ duyệt' },
  { key: 'paid'            as const, label: 'Đã duyệt' },
  { key: 'rejected'        as const, label: 'Bị từ chối' },
  { key: 'pending'         as const, label: 'Chờ thanh toán' },
  { key: 'all'             as const, label: 'Tất cả' },
]

type TabKey = 'awaiting_review' | 'paid' | 'rejected' | 'pending' | 'all'

// ── Sub-components ────────────────────────────────────────────────────────────

function Toast({
  message,
  type,
  onClose,
}: {
  message: string
  type: 'success' | 'error'
  onClose: () => void
}) {
  useEffect(() => {
    const t = setTimeout(onClose, 4000)
    return () => clearTimeout(t)
  }, [onClose])

  return (
    <div
      className={`fixed top-4 right-4 z-50 flex items-center gap-3 px-4 py-3 rounded-xl shadow-lg text-sm font-medium ${
        type === 'success' ? 'bg-green-600 text-white' : 'bg-red-600 text-white'
      }`}
    >
      {message}
      <button onClick={onClose} className="ml-1 opacity-75 hover:opacity-100 text-lg leading-none">
        ×
      </button>
    </div>
  )
}

function RejectModal({
  order,
  onClose,
  onSuccess,
}: {
  order: Order
  onClose: () => void
  onSuccess: () => void
}) {
  const [note, setNote] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const trimmed = note.trim()
    if (trimmed.length < 5) {
      setError('Lý do từ chối phải có ít nhất 5 ký tự.')
      return
    }
    setLoading(true)
    setError('')
    try {
      const res = await fetch(`/api/admin/orders/${order.id}/reject`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ note: trimmed }),
      })
      const json = await res.json()
      if (!res.ok) {
        setError(json.error ?? 'Có lỗi xảy ra.')
        return
      }
      onSuccess()
    } catch {
      setError('Lỗi kết nối, thử lại.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md mx-4 p-6">
        <h3 className="text-base font-semibold text-zinc-900 mb-1">Từ chối đơn hàng</h3>
        <p className="text-sm text-zinc-500 mb-4">
          Đơn:{' '}
          <span className="font-mono font-medium text-zinc-800">{order.order_code}</span>
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-zinc-700 mb-1.5">Lý do từ chối</label>
            <textarea
              value={note}
              onChange={e => { setNote(e.target.value); setError('') }}
              rows={3}
              placeholder="VD: Không tìm thấy giao dịch trong app ngân hàng"
              className="w-full text-sm border border-zinc-300 rounded-lg px-3 py-2.5 resize-none focus:outline-none focus:ring-2 focus:ring-red-400 focus:border-transparent"
              autoFocus
            />
            {error && <p className="text-red-500 text-xs mt-1">{error}</p>}
          </div>

          <div className="flex gap-2 justify-end">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="px-4 py-2 text-sm font-medium text-zinc-600 bg-zinc-100 hover:bg-zinc-200 rounded-lg transition-colors disabled:opacity-50"
            >
              Hủy
            </button>
            <button
              type="submit"
              disabled={loading || note.trim().length < 5}
              className="px-4 py-2 text-sm font-medium text-white bg-red-600 hover:bg-red-700 disabled:opacity-50 rounded-lg transition-colors"
            >
              {loading ? 'Đang xử lý...' : 'Xác nhận từ chối'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

// ── Page ─────────────────────────────────────────────────────────────────────

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([])
  const [fetching, setFetching] = useState(true)
  const [activeTab, setActiveTab] = useState<TabKey>('awaiting_review')
  const [rejectTarget, setRejectTarget] = useState<Order | null>(null)
  const [approvingId, setApprovingId] = useState<string | null>(null)
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null)

  const showToast = useCallback((message: string, type: 'success' | 'error') => {
    setToast({ message, type })
  }, [])

  // Bọc hàm đóng toast bằng useCallback để giữ nguyên định danh hàm qua các lần render
  const handleCloseToast = useCallback(() => {
    setToast(null)
  }, [])

  const loadData = useCallback(async () => {
    try {
      const data = await loadOrders()
      setOrders(data)
    } catch {
      showToast('Không thể tải danh sách đơn hàng.', 'error')
    } finally {
      setFetching(false)
    }
  }, [showToast])

  useEffect(() => {
    let active = true
    void (async () => {
      try {
        const data = await loadOrders()
        if (active) setOrders(data)
      } catch {
        if (active) showToast('Không thể tải danh sách đơn hàng.', 'error')
      } finally {
        if (active) setFetching(false)
      }
    })()
    return () => { active = false }
  }, [showToast])

  async function handleApprove(order: Order) {
    const ok = window.confirm(
      `Xác nhận đã nhận ${fmtVnd(order.amount)} vào tài khoản từ ${order.order_code}?\nUser sẽ được nâng cấp Pro 30 ngày.`
    )
    if (!ok) return

    setApprovingId(order.id)
    try {
      const res = await fetch(`/api/admin/orders/${order.id}/approve`, { method: 'POST' })
      const json = await res.json()
      if (!res.ok) {
        showToast(json.error ?? 'Có lỗi xảy ra.', 'error')
        return
      }
      showToast('Đã duyệt thành công!', 'success')
      await loadData()
    } catch {
      showToast('Lỗi kết nối, thử lại.', 'error')
    } finally {
      setApprovingId(null)
    }
  }

  function handleRejectSuccess() {
    setRejectTarget(null)
    showToast('Đã từ chối đơn hàng.', 'success')
    loadData()
  }

  // Compute tab counts from full dataset
  const counts: Record<TabKey, number> = {
    awaiting_review: orders.filter(o => o.status === 'awaiting_review').length,
    paid:            orders.filter(o => o.status === 'paid').length,
    rejected:        orders.filter(o => o.status === 'rejected').length,
    pending:         orders.filter(o => o.status === 'pending').length,
    all:             orders.length,
  }

  const filtered = activeTab === 'all' ? orders : orders.filter(o => o.status === activeTab)

  return (
    <div className="space-y-6">
      <h1 className="text-xl font-bold text-zinc-800">Quản lý đơn hàng</h1>

      {toast && (
        <Toast message={toast.message} type={toast.type} onClose={handleCloseToast} />
      )}

      {/* Filter tabs */}
      <div className="flex flex-wrap gap-2">
        {TABS.map(tab => {
          const count = counts[tab.key]
          const isActive = activeTab === tab.key
          return (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                isActive
                  ? 'bg-zinc-900 text-white'
                  : 'bg-white text-zinc-600 border border-zinc-200 hover:bg-zinc-50'
              }`}
            >
              {tab.label}
              <span
                className={`text-xs px-1.5 py-0.5 rounded-full ${
                  isActive
                    ? 'bg-white/20 text-white'
                    : tab.key === 'awaiting_review' && count > 0
                      ? 'bg-blue-100 text-blue-700 font-semibold'
                      : 'bg-zinc-100 text-zinc-500'
                }`}
              >
                {count}
              </span>
            </button>
          )
        })}
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl shadow-sm border border-zinc-200 overflow-hidden">
        {fetching ? (
          <div className="flex items-center justify-center py-16 text-zinc-400 text-sm gap-2">
            <span className="animate-spin inline-block w-4 h-4 border-2 border-zinc-300 border-t-zinc-600 rounded-full" />
            Đang tải...
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex items-center justify-center py-16 text-zinc-400 text-sm">
            Không có đơn hàng nào.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-zinc-100 bg-zinc-50/80">
                  <th className="text-left font-semibold text-zinc-500 px-4 py-3 whitespace-nowrap">Mã đơn</th>
                  <th className="text-left font-semibold text-zinc-500 px-4 py-3">Khách hàng</th>
                  <th className="text-right font-semibold text-zinc-500 px-4 py-3 whitespace-nowrap">Số tiền</th>
                  <th className="text-left font-semibold text-zinc-500 px-4 py-3 whitespace-nowrap">Mã GD ngân hàng</th>
                  <th className="text-left font-semibold text-zinc-500 px-4 py-3">Trạng thái</th>
                  <th className="text-left font-semibold text-zinc-500 px-4 py-3 whitespace-nowrap">Tạo lúc</th>
                  <th className="text-left font-semibold text-zinc-500 px-4 py-3">Hành động</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-50">
                {filtered.map(order => {
                  const st = STATUS_CONFIG[order.status] ?? {
                    label: order.status,
                    cls: 'text-zinc-600 bg-zinc-100',
                  }
                  const isApproving = approvingId === order.id

                  return (
                    <tr key={order.id} className="hover:bg-zinc-50/60 transition-colors">
                      {/* Mã đơn */}
                      <td className="px-4 py-3">
                        <span className="font-mono font-bold text-zinc-900 text-xs tracking-wide">
                          {order.order_code}
                        </span>
                      </td>

                      {/* Khách hàng */}
                      <td className="px-4 py-3 max-w-[180px]">
                        <span className="text-zinc-700 truncate block" title={order.profiles?.email}>
                          {order.profiles?.email ?? <span className="text-zinc-300">—</span>}
                        </span>
                      </td>

                      {/* Số tiền */}
                      <td className="px-4 py-3 text-right font-semibold text-zinc-900 whitespace-nowrap">
                        {fmtVnd(order.amount)}
                      </td>

                      {/* Mã GD ngân hàng */}
                      <td className="px-4 py-3 font-mono text-xs text-zinc-500 max-w-[140px]">
                        {order.bank_txn_id
                          ? <span className="truncate block" title={order.bank_txn_id}>{order.bank_txn_id}</span>
                          : <span className="text-zinc-300">—</span>
                        }
                      </td>

                      {/* Trạng thái */}
                      <td className="px-4 py-3">
                        <span className={`text-xs font-medium px-2 py-0.5 rounded-full whitespace-nowrap ${st.cls}`}>
                          {st.label}
                        </span>
                      </td>

                      {/* Tạo lúc */}
                      <td className="px-4 py-3 text-zinc-500 whitespace-nowrap text-xs">
                        {fmtDate(order.created_at)}
                      </td>

                      {/* Hành động */}
                      <td className="px-4 py-3">
                        {order.status === 'awaiting_review' && (
                          <div className="flex gap-1.5 items-center">
                            <button
                              onClick={() => handleApprove(order)}
                              disabled={isApproving}
                              className="px-2.5 py-1.5 text-xs font-medium text-white bg-green-600 hover:bg-green-700 disabled:opacity-50 rounded-lg transition-colors whitespace-nowrap"
                            >
                              {isApproving ? (
                                <span className="flex items-center gap-1">
                                  <span className="animate-spin inline-block w-3 h-3 border border-white border-t-transparent rounded-full" />
                                  Đang xử lý
                                </span>
                              ) : '✓ Duyệt'}
                            </button>
                            <button
                              onClick={() => setRejectTarget(order)}
                              disabled={isApproving}
                              className="px-2.5 py-1.5 text-xs font-medium text-white bg-red-600 hover:bg-red-700 disabled:opacity-50 rounded-lg transition-colors whitespace-nowrap"
                            >
                              ✗ Từ chối
                            </button>
                          </div>
                        )}
                        {order.status === 'paid' && (
                          <span className="text-green-600 text-xs whitespace-nowrap">
                            Đã duyệt {order.paid_at ? fmtDate(order.paid_at) : ''}
                          </span>
                        )}
                        {order.status === 'rejected' && (
                          <span
                            className="text-red-500 text-xs block max-w-[200px] truncate"
                            title={order.note ?? ''}
                          >
                            Từ chối: {order.note ?? '—'}
                          </span>
                        )}
                        {order.status === 'pending' && (
                          <span className="text-zinc-400 text-xs whitespace-nowrap">
                            Đợi user chuyển khoản
                          </span>
                        )}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Reject modal */}
      {rejectTarget && (
        <RejectModal
          order={rejectTarget}
          onClose={() => setRejectTarget(null)}
          onSuccess={handleRejectSuccess}
        />
      )}
    </div>
  )
}