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
  if (state === 'expired') return { label: 'Pro hết hạn', cls: 'text-red-700 bg-red-100' }
  const daysLeft = Math.ceil((new Date(proExpiresAt!).getTime() - Date.now()) / 86400000)
  return { label: `Pro còn ${daysLeft} ngày`, cls: 'text-[var(--fpt-orange)] bg-orange-50' }
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
  { key: 'pro',     label: 'Pro' },
  { key: 'free',    label: 'Free' },
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
    <div className={`fixed top-4 right-4 z-50 flex items-center gap-3 px-5 py-4 rounded-2xl shadow-2xl text-sm font-bold ${
      type === 'success' ? 'bg-green-600 text-white' : 'bg-red-600 text-white'
    }`}>
      {message}
      <button onClick={onClose} className="ml-2 opacity-75 hover:opacity-100 text-xl leading-none">
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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-zinc-950/40 backdrop-blur-md p-4">
      <div className="bg-white rounded-[2rem] shadow-2xl w-full max-w-xl flex flex-col max-h-[90vh] overflow-hidden border border-zinc-200/50">
        {/* Header */}
        <div className="flex items-center justify-between px-8 py-6 border-b border-zinc-100 shrink-0 bg-zinc-50/50">
          <div className="min-w-0">
            <h3 className="text-xl font-black text-zinc-900">Chi tiết người dùng</h3>
            <p className="text-sm font-medium text-zinc-500 truncate mt-1">{user.email}</p>
          </div>
          <button
            onClick={onClose}
            className="text-zinc-400 hover:text-zinc-900 text-2xl leading-none px-2 transition-colors shrink-0"
          >
            ×
          </button>
        </div>

        {/* Scrollable body */}
        <div className="overflow-y-auto flex-1 px-8 py-6 space-y-8">
          {/* Info grid - Bento style */}
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-zinc-50 border border-zinc-100 rounded-2xl p-5 flex flex-col justify-center">
              <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest mb-2">Gói hiện tại</p>
              <div>
                <span className={`text-[11px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-md ${badge.cls}`}>
                  {badge.label}
                </span>
              </div>
            </div>
            <div className="bg-zinc-50 border border-zinc-100 rounded-2xl p-5">
              <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest mb-1">Ngày tham gia</p>
              <p className="text-lg font-black text-zinc-900">{fmtDate(user.created_at)}</p>
            </div>
            <div className="bg-zinc-50 border border-zinc-100 rounded-2xl p-5">
              <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest mb-1">Số lượng CV</p>
              <p className="text-lg font-black text-zinc-900">{user.cvCount}</p>
            </div>
            <div className="bg-zinc-50 border border-zinc-100 rounded-2xl p-5">
              <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest mb-1">Tổng đơn hàng</p>
              <p className="text-lg font-black text-zinc-900">{user.orderCount}</p>
            </div>
          </div>

          {detailLoading ? (
            <div className="flex flex-col items-center justify-center py-12 text-zinc-400 gap-4">
              <span className="animate-spin inline-block w-6 h-6 border-2 border-zinc-200 border-t-zinc-600 rounded-full" />
              <span className="text-xs font-bold uppercase tracking-widest">Đang tải chi tiết...</span>
            </div>
          ) : (
            <div className="space-y-6">
              {/* CV list */}
              <div>
                <h4 className="text-xs font-bold text-zinc-900 uppercase tracking-widest mb-3">
                  Danh sách CV ({detail?.cvs.length ?? 0})
                </h4>
                {!detail?.cvs.length ? (
                  <p className="text-sm font-medium text-zinc-400">Chưa có CV nào được tạo.</p>
                ) : (
                  <div className="divide-y divide-zinc-100 border border-zinc-200/80 rounded-2xl overflow-hidden">
                    {detail.cvs.map(cv => (
                      <div key={cv.id} className="flex items-center justify-between px-5 py-4 gap-4 hover:bg-zinc-50/50 transition-colors">
                        <span className="text-sm font-bold text-zinc-800 truncate">{cv.title}</span>
                        <span className="text-xs font-medium text-zinc-500 shrink-0">{fmtDateTime(cv.created_at)}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Order list */}
              <div>
                <h4 className="text-xs font-bold text-zinc-900 uppercase tracking-widest mb-3">
                  Lịch sử đơn hàng ({detail?.orders.length ?? 0})
                </h4>
                {!detail?.orders.length ? (
                  <p className="text-sm font-medium text-zinc-400">Chưa có đơn hàng nào.</p>
                ) : (
                  <div className="divide-y divide-zinc-100 border border-zinc-200/80 rounded-2xl overflow-hidden">
                    {detail.orders.map(o => {
                      const st = ORDER_STATUS[o.status] ?? { label: o.status, cls: 'text-zinc-600 bg-zinc-100' }
                      return (
                        <div key={o.id} className="flex items-center justify-between px-5 py-4 gap-4 hover:bg-zinc-50/50 transition-colors">
                          <div className="min-w-0">
                            <p className="text-xs font-mono font-bold text-zinc-900">{o.order_code}</p>
                            <p className="text-xs font-medium text-zinc-500 mt-1">{fmtDateTime(o.created_at)}</p>
                          </div>
                          <div className="flex items-center gap-3 shrink-0">
                            <span className="text-sm font-bold text-zinc-900">{fmtVnd(o.amount)}</span>
                            <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md ${st.cls}`}>
                              {st.label}
                            </span>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Footer actions */}
        <div className="px-8 py-5 border-t border-zinc-100 shrink-0 flex gap-3 justify-end bg-zinc-50/50">
          <button
            onClick={onClose}
            disabled={acting}
            className="px-5 py-3 text-sm font-bold text-zinc-600 bg-white border border-zinc-200 hover:bg-zinc-100 disabled:opacity-50 rounded-xl transition-all shadow-sm"
          >
            Đóng
          </button>

          {planState !== 'pro' ? (
            <button
              onClick={handleGrantPro}
              disabled={acting}
              className="px-5 py-3 text-sm font-bold text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50 rounded-xl transition-all shadow-md active:scale-95"
            >
              {acting ? 'Đang xử lý...' : 'Nâng lên Pro 30 ngày'}
            </button>
          ) : (
            <button
              onClick={handleRevokePro}
              disabled={acting}
              className="px-5 py-3 text-sm font-bold text-white bg-red-600 hover:bg-red-700 disabled:opacity-50 rounded-xl transition-all shadow-md active:scale-95"
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
    <div className="space-y-8 max-w-7xl mx-auto">
      {toast && <Toast message={toast.message} type={toast.type} onClose={handleCloseToast} />}

      {/* Header section with Search and Tabs */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
        
        {/* Filter tabs */}
        <div className="flex flex-wrap gap-3">
          {TABS.map(tab => {
            const count = counts[tab.key]
            const isActive = activeTab === tab.key
            return (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={`flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-bold transition-all shadow-sm ${
                  isActive
                    ? 'bg-zinc-900 text-white shadow-zinc-900/20'
                    : 'bg-white text-zinc-600 border border-zinc-200/80 hover:bg-zinc-100 hover:text-zinc-900'
                }`}
              >
                {tab.label}
                <span className={`text-[10px] px-2 py-0.5 rounded-full uppercase tracking-widest ${
                  isActive ? 'bg-white/20 text-white' : 'bg-zinc-100 text-zinc-500'
                }`}>
                  {count}
                </span>
              </button>
            )
          })}
        </div>

        {/* Search bar */}
        <div className="flex items-center gap-3 w-full lg:w-auto relative">
          <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
            <svg className="w-5 h-5 text-zinc-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
          <input
            type="text"
            value={query}
            onChange={e => setQuery(e.target.value)}
            placeholder="Tìm theo email..."
            className="w-full lg:w-80 text-sm font-medium border-2 border-zinc-200 rounded-full pl-11 pr-4 py-2.5 bg-white shadow-soft-sm focus:outline-none focus:ring-4 focus:ring-zinc-900/10 focus:border-zinc-900 transition-all text-zinc-900"
          />
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-3xl shadow-soft-xl border border-zinc-200/60 overflow-hidden">
        {filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 text-zinc-400">
            <div className="w-16 h-16 bg-zinc-50 rounded-2xl flex items-center justify-center mb-4">
              <span className="text-2xl">👥</span>
            </div>
            <span className="text-sm font-bold uppercase tracking-widest">Không tìm thấy user nào</span>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-zinc-100 bg-zinc-50/50">
                  <th className="font-bold text-zinc-500 text-xs uppercase tracking-wider px-6 py-4 whitespace-nowrap">Email</th>
                  <th className="font-bold text-zinc-500 text-xs uppercase tracking-wider px-6 py-4 whitespace-nowrap">Gói hiện tại</th>
                  <th className="font-bold text-zinc-500 text-xs uppercase tracking-wider px-6 py-4 text-center whitespace-nowrap">Số lượng CV</th>
                  <th className="font-bold text-zinc-500 text-xs uppercase tracking-wider px-6 py-4 text-center whitespace-nowrap">Số lượng Đơn</th>
                  <th className="font-bold text-zinc-500 text-xs uppercase tracking-wider px-6 py-4 whitespace-nowrap">Ngày tham gia</th>
                  <th className="font-bold text-zinc-500 text-xs uppercase tracking-wider px-6 py-4 text-right">Hành động</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-50">
                {filtered.map(user => {
                  const badge = getPlanBadge(user.plan, user.pro_expires_at)
                  return (
                    <tr key={user.id} className="hover:bg-zinc-50/80 transition-colors group">
                      <td className="px-6 py-5 max-w-[240px]">
                        <div className="flex items-center gap-4">
                          <div className="w-10 h-10 rounded-full bg-zinc-100 flex items-center justify-center text-zinc-500 font-bold shrink-0">
                            {user.email.charAt(0).toUpperCase()}
                          </div>
                          <span className="text-zinc-900 font-bold truncate block" title={user.email}>
                            {user.email}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-5">
                        <span className={`text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-md whitespace-nowrap ${badge.cls}`}>
                          {badge.label}
                        </span>
                      </td>
                      <td className="px-6 py-5 text-center font-bold text-zinc-700">{user.cvCount}</td>
                      <td className="px-6 py-5 text-center font-bold text-zinc-700">{user.orderCount}</td>
                      <td className="px-6 py-5 text-zinc-500 text-sm font-medium whitespace-nowrap">
                        {fmtDate(user.created_at)}
                      </td>
                      <td className="px-6 py-5 text-right">
                        <button
                          onClick={() => setSelectedUser(user)}
                          className="px-4 py-2 text-xs font-bold uppercase tracking-wide text-zinc-700 bg-white border border-zinc-200 shadow-sm hover:bg-zinc-100 rounded-xl transition-all active:scale-95 whitespace-nowrap"
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
    </div>
  )
}
