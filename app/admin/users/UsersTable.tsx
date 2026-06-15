'use client'

import { useState, useEffect, useMemo, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { getUserDetail } from './actions'

export type UserRow = {
  id: string
  email: string
  plan: string
  pro_expires_at: string | null
  created_at: string
  cvCount: number
  orderCount: number
}

type CvRow = { id: string; title: string; created_at: string }
type OrderRow = { id: string; order_code: string; status: string; amount: number; created_at: string }
type TabKey = 'all' | 'free' | 'pro' | 'expired'

// ── Helpers ───────────────────────────────────────────────────────────────────

function getPlanState(plan: string, proExpiresAt: string | null): 'free' | 'pro' | 'expired' {
  if (plan !== 'pro') return 'free'
  if (!proExpiresAt) return 'expired'
  return new Date(proExpiresAt) > new Date() ? 'pro' : 'expired'
}

function getPlanBadge(plan: string, proExpiresAt: string | null) {
  const state = getPlanState(plan, proExpiresAt)
  if (state === 'free') return { label: 'Free', cls: 'text-zinc-500 bg-zinc-100' }
  if (state === 'expired') return { label: 'Pro hết hạn', cls: 'text-orange-700 bg-orange-100' }
  const daysLeft = Math.ceil((new Date(proExpiresAt!).getTime() - Date.now()) / 86400000)
  return { label: `Pro còn ${daysLeft} ngày`, cls: 'text-blue-700 bg-blue-100' }
}

function fmtDate(iso: string) {
  return new Date(iso).toLocaleDateString('vi-VN', {
    day: '2-digit', month: '2-digit', year: 'numeric',
  })
}

function fmtDateTime(iso: string) {
  return new Date(iso).toLocaleString('vi-VN', {
    day: '2-digit', month: '2-digit',
    hour: '2-digit', minute: '2-digit',
  })
}

function fmtVnd(amount: number) {
  return amount.toLocaleString('vi-VN') + 'đ'
}

const ORDER_STATUS: Record<string, { label: string; cls: string }> = {
  pending:         { label: 'Chờ TT',    cls: 'text-yellow-700 bg-yellow-100' },
  awaiting_review: { label: 'Chờ duyệt', cls: 'text-blue-700 bg-blue-100' },
  paid:            { label: 'Đã TT',     cls: 'text-green-700 bg-green-100' },
  rejected:        { label: 'Từ chối',   cls: 'text-red-700 bg-red-100' },
}

const TABS: { key: TabKey; label: string }[] = [
  { key: 'all',     label: 'Tất cả' },
  { key: 'free',    label: 'Free' },
  { key: 'pro',     label: 'Pro' },
  { key: 'expired', label: 'Pro hết hạn' },
]

// ── Toast ─────────────────────────────────────────────────────────────────────

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
    <div className={`fixed top-4 right-4 z-50 flex items-center gap-3 px-4 py-3 rounded-xl shadow-lg text-sm font-medium ${
      type === 'success' ? 'bg-green-600 text-white' : 'bg-red-600 text-white'
    }`}>
      {message}
      <button onClick={onClose} className="ml-1 opacity-75 hover:opacity-100 text-lg leading-none">
        ×
      </button>
    </div>
  )
}

// ── User detail modal ─────────────────────────────────────────────────────────

function UserModal({
  user,
  onClose,
  onAction,
}: {
  user: UserRow
  onClose: () => void
  onAction: (msg: string, type: 'success' | 'error') => void
}) {
  const router = useRouter()
  const [detail, setDetail] = useState<{ cvs: CvRow[]; orders: OrderRow[] } | null>(null)
  const [detailLoading, setDetailLoading] = useState(true)
  const [acting, setActing] = useState(false)

  const planState = getPlanState(user.plan, user.pro_expires_at)
  const badge = getPlanBadge(user.plan, user.pro_expires_at)

  useEffect(() => {
    let active = true
    getUserDetail(user.id).then(d => {
      if (!active) return
      setDetail(d)
      setDetailLoading(false)
    })
    return () => { active = false }
  }, [user.id])

  async function handleGrantPro() {
    const ok = window.confirm(`Nâng user "${user.email}" lên Pro 30 ngày?`)
    if (!ok) return
    setActing(true)
    try {
      const res = await fetch(`/api/admin/users/${user.id}/grant-pro`, { method: 'POST' })
      const json = await res.json()
      if (!res.ok) {
        onAction(json.error ?? 'Có lỗi xảy ra.', 'error')
        return
      }
      onClose()
      onAction('Đã nâng lên Pro 30 ngày!', 'success')
      router.refresh()
    } catch {
      onAction('Lỗi kết nối, thử lại.', 'error')
    } finally {
      setActing(false)
    }
  }

  async function handleRevokePro() {
    const reason = window.prompt('Lý do hủy gói Pro (tùy chọn):') ?? ''
    const ok = window.confirm(
      `Hủy gói Pro của user "${user.email}"?${reason ? `\nLý do: ${reason}` : ''}`
    )
    if (!ok) return
    setActing(true)
    try {
      const res = await fetch(`/api/admin/users/${user.id}/revoke-pro`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reason }),
      })
      const json = await res.json()
      if (!res.ok) {
        onAction(json.error ?? 'Có lỗi xảy ra.', 'error')
        return
      }
      onClose()
      onAction('Đã hủy gói Pro.', 'success')
      router.refresh()
    } catch {
      onAction('Lỗi kết nối, thử lại.', 'error')
    } finally {
      setActing(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-xl flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-zinc-100 shrink-0">
          <div className="min-w-0">
            <h3 className="text-base font-semibold text-zinc-900">Chi tiết user</h3>
            <p className="text-sm text-zinc-500 truncate mt-0.5">{user.email}</p>
          </div>
          <button
            onClick={onClose}
            className="text-zinc-400 hover:text-zinc-700 text-xl leading-none px-1 ml-3 shrink-0"
          >
            ×
          </button>
        </div>

        {/* Scrollable body */}
        <div className="overflow-y-auto flex-1 px-6 py-4 space-y-5">
          {/* Info grid */}
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-zinc-50 rounded-xl px-4 py-3">
              <p className="text-xs text-zinc-500 mb-1.5">Gói hiện tại</p>
              <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${badge.cls}`}>
                {badge.label}
              </span>
            </div>
            <div className="bg-zinc-50 rounded-xl px-4 py-3">
              <p className="text-xs text-zinc-500 mb-1.5">Ngày đăng ký</p>
              <p className="text-sm font-medium text-zinc-800">{fmtDate(user.created_at)}</p>
            </div>
            <div className="bg-zinc-50 rounded-xl px-4 py-3">
              <p className="text-xs text-zinc-500 mb-1.5">Số CV</p>
              <p className="text-sm font-medium text-zinc-800">{user.cvCount}</p>
            </div>
            <div className="bg-zinc-50 rounded-xl px-4 py-3">
              <p className="text-xs text-zinc-500 mb-1.5">Số đơn hàng</p>
              <p className="text-sm font-medium text-zinc-800">{user.orderCount}</p>
            </div>
          </div>

          {detailLoading ? (
            <div className="flex items-center justify-center py-8 text-zinc-400 text-sm gap-2">
              <span className="animate-spin inline-block w-4 h-4 border-2 border-zinc-300 border-t-zinc-600 rounded-full" />
              Đang tải...
            </div>
          ) : (
            <>
              {/* CV list */}
              <div>
                <h4 className="text-sm font-semibold text-zinc-700 mb-2">
                  Danh sách CV ({detail?.cvs.length ?? 0})
                </h4>
                {!detail?.cvs.length ? (
                  <p className="text-xs text-zinc-400">Chưa có CV nào.</p>
                ) : (
                  <div className="divide-y divide-zinc-100 border border-zinc-100 rounded-xl overflow-hidden">
                    {detail.cvs.map(cv => (
                      <div key={cv.id} className="flex items-center justify-between px-4 py-2.5 gap-3">
                        <span className="text-sm text-zinc-800 truncate">{cv.title}</span>
                        <span className="text-xs text-zinc-400 shrink-0">{fmtDateTime(cv.created_at)}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Order list */}
              <div>
                <h4 className="text-sm font-semibold text-zinc-700 mb-2">
                  Lịch sử đơn hàng ({detail?.orders.length ?? 0})
                </h4>
                {!detail?.orders.length ? (
                  <p className="text-xs text-zinc-400">Chưa có đơn hàng nào.</p>
                ) : (
                  <div className="divide-y divide-zinc-100 border border-zinc-100 rounded-xl overflow-hidden">
                    {detail.orders.map(o => {
                      const st = ORDER_STATUS[o.status] ?? { label: o.status, cls: 'text-zinc-600 bg-zinc-100' }
                      return (
                        <div key={o.id} className="flex items-center justify-between px-4 py-2.5 gap-3">
                          <div className="min-w-0">
                            <p className="text-xs font-mono font-bold text-zinc-900">{o.order_code}</p>
                            <p className="text-xs text-zinc-400">{fmtDateTime(o.created_at)}</p>
                          </div>
                          <div className="flex items-center gap-2 shrink-0">
                            <span className="text-sm font-medium text-zinc-700">{fmtVnd(o.amount)}</span>
                            <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${st.cls}`}>
                              {st.label}
                            </span>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                )}
              </div>
            </>
          )}
        </div>

        {/* Footer actions */}
        <div className="px-6 py-4 border-t border-zinc-100 shrink-0 flex gap-2 justify-end">
          <button
            onClick={onClose}
            disabled={acting}
            className="px-4 py-2 text-sm font-medium text-zinc-600 bg-zinc-100 hover:bg-zinc-200 disabled:opacity-50 rounded-lg transition-colors"
          >
            Đóng
          </button>

          {planState !== 'pro' ? (
            <button
              onClick={handleGrantPro}
              disabled={acting}
              className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50 rounded-lg transition-colors"
            >
              {acting ? 'Đang xử lý...' : 'Nâng lên Pro 30 ngày'}
            </button>
          ) : (
            <button
              onClick={handleRevokePro}
              disabled={acting}
              className="px-4 py-2 text-sm font-medium text-white bg-red-600 hover:bg-red-700 disabled:opacity-50 rounded-lg transition-colors"
            >
              {acting ? 'Đang xử lý...' : 'Hủy gói Pro'}
            </button>
          )}
        </div>
      </div>
    </div>
  )
}

// ── Main table component ───────────────────────────────────────────────────────

export default function UsersTable({ users }: { users: UserRow[] }) {
  const [query, setQuery] = useState('')
  const [debouncedQuery, setDebouncedQuery] = useState('')
  const [activeTab, setActiveTab] = useState<TabKey>('all')
  const [selectedUser, setSelectedUser] = useState<UserRow | null>(null)
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null)

  useEffect(() => {
    const t = setTimeout(() => setDebouncedQuery(query), 400)
    return () => clearTimeout(t)
  }, [query])

  const handleCloseToast = useCallback(() => setToast(null), [])

  const counts = useMemo(() => {
    const result: Record<TabKey, number> = { all: users.length, free: 0, pro: 0, expired: 0 }
    for (const u of users) {
      result[getPlanState(u.plan, u.pro_expires_at)]++
    }
    return result
  }, [users])

  const filtered = useMemo(() => {
    return users.filter(u => {
      const matchSearch = !debouncedQuery || u.email.toLowerCase().includes(debouncedQuery.toLowerCase())
      const matchTab = activeTab === 'all' || getPlanState(u.plan, u.pro_expires_at) === activeTab
      return matchSearch && matchTab
    })
  }, [users, debouncedQuery, activeTab])

  return (
    <>
      {toast && <Toast message={toast.message} type={toast.type} onClose={handleCloseToast} />}

      {/* Search bar */}
      <div className="flex flex-wrap gap-3 items-center">
        <input
          type="text"
          value={query}
          onChange={e => setQuery(e.target.value)}
          placeholder="Tìm theo email..."
          className="w-full sm:w-72 text-sm border border-zinc-200 rounded-xl px-4 py-2.5 bg-white focus:outline-none focus:ring-2 focus:ring-zinc-400"
        />
        {debouncedQuery && (
          <span className="text-xs text-zinc-500">{filtered.length} kết quả</span>
        )}
      </div>

      {/* Filter tabs */}
      <div className="flex flex-wrap gap-2">
        {TABS.map(tab => {
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
              <span className={`text-xs px-1.5 py-0.5 rounded-full ${
                isActive ? 'bg-white/20 text-white' : 'bg-zinc-100 text-zinc-500'
              }`}>
                {counts[tab.key]}
              </span>
            </button>
          )
        })}
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl shadow-sm border border-zinc-200 overflow-hidden">
        {filtered.length === 0 ? (
          <div className="flex items-center justify-center py-16 text-zinc-400 text-sm">
            Không có user nào.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-zinc-100 bg-zinc-50/80">
                  <th className="text-left font-semibold text-zinc-500 px-4 py-3">Email</th>
                  <th className="text-left font-semibold text-zinc-500 px-4 py-3 whitespace-nowrap">Gói</th>
                  <th className="text-center font-semibold text-zinc-500 px-4 py-3 whitespace-nowrap">Số CV</th>
                  <th className="text-center font-semibold text-zinc-500 px-4 py-3 whitespace-nowrap">Số đơn</th>
                  <th className="text-left font-semibold text-zinc-500 px-4 py-3 whitespace-nowrap">Ngày đăng ký</th>
                  <th className="text-left font-semibold text-zinc-500 px-4 py-3">Hành động</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-50">
                {filtered.map(user => {
                  const badge = getPlanBadge(user.plan, user.pro_expires_at)
                  return (
                    <tr key={user.id} className="hover:bg-zinc-50/60 transition-colors">
                      <td className="px-4 py-3 max-w-[240px]">
                        <span className="text-zinc-800 truncate block" title={user.email}>
                          {user.email}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <span className={`text-xs font-medium px-2 py-0.5 rounded-full whitespace-nowrap ${badge.cls}`}>
                          {badge.label}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-center text-zinc-700">{user.cvCount}</td>
                      <td className="px-4 py-3 text-center text-zinc-700">{user.orderCount}</td>
                      <td className="px-4 py-3 text-zinc-500 text-xs whitespace-nowrap">
                        {fmtDate(user.created_at)}
                      </td>
                      <td className="px-4 py-3">
                        <button
                          onClick={() => setSelectedUser(user)}
                          className="px-3 py-1.5 text-xs font-medium text-zinc-700 bg-zinc-100 hover:bg-zinc-200 rounded-lg transition-colors"
                        >
                          Chi tiết
                        </button>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {selectedUser && (
        <UserModal
          key={selectedUser.id}
          user={selectedUser}
          onClose={() => setSelectedUser(null)}
          onAction={(msg, type) => setToast({ message: msg, type })}
        />
      )}
    </>
  )
}
