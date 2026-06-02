import { createAdminClient } from '@/lib/supabase-admin'

function fmtDate(iso: string) {
  return new Date(iso).toLocaleString('vi-VN', {
    day: '2-digit', month: '2-digit',
    hour: '2-digit', minute: '2-digit',
  })
}

function fmtVnd(amount: number) {
  return amount.toLocaleString('vi-VN') + 'đ'
}

const STATUS_LABEL: Record<string, { label: string; cls: string }> = {
  pending:          { label: 'Chờ TT',    cls: 'text-yellow-700 bg-yellow-100' },
  awaiting_review:  { label: 'Chờ duyệt', cls: 'text-blue-700 bg-blue-100' },
  paid:             { label: 'Đã TT',     cls: 'text-green-700 bg-green-100' },
  rejected:         { label: 'Từ chối',   cls: 'text-red-700 bg-red-100' },
}

interface StatCardProps {
  icon: string
  value: string
  label: string
  sub?: string
}

function StatCard({ icon, value, label, sub }: StatCardProps) {
  return (
    <div className="bg-white rounded-2xl shadow-sm border border-zinc-200 p-6">
      <div className="text-2xl mb-3">{icon}</div>
      <p className="text-4xl font-bold text-zinc-900">{value}</p>
      <p className="text-sm text-zinc-500 mt-1">{label}</p>
      {sub && <p className="text-xs text-zinc-400 mt-0.5">{sub}</p>}
    </div>
  )
}

export default async function AdminPage() {
  const db = createAdminClient()

  const [
    { count: userCount,    error: e1 },
    { count: cvCount,      error: e2 },
    { count: orderCount,   error: e3 },
    { count: awaitingCount,error: e4 },
    { data: paidOrders,    error: e5 },
    { data: recentOrders,  error: e6 },
    { data: recentUsers,   error: e7 },
  ] = await Promise.all([
    db.from('profiles').select('*', { count: 'exact', head: true }),
    db.from('cvs').select('*', { count: 'exact', head: true }),
    db.from('orders').select('*', { count: 'exact', head: true }),
    db.from('orders').select('*', { count: 'exact', head: true }).eq('status', 'awaiting_review'),
    db.from('orders').select('amount').eq('status', 'paid'),
    db.from('orders')
      .select('order_code, amount, status, created_at, profiles(email)')
      .order('created_at', { ascending: false })
      .limit(5),
    db.from('profiles')
      .select('email, plan, created_at')
      .order('created_at', { ascending: false })
      .limit(5),
  ])

  // DEBUG — xóa sau khi xác nhận
  const errs = { e1, e2, e3, e4, e5, e6, e7 }
  const hasErr = Object.values(errs).some(Boolean)
  if (hasErr) console.error('[admin/page] query errors:', JSON.stringify(errs, null, 2))

  const revenue = paidOrders?.reduce((sum, o) => sum + (o.amount ?? 0), 0) ?? 0
  const paidCount = paidOrders?.length ?? 0

  return (
    <div className="space-y-8">
      <h1 className="text-xl font-bold text-zinc-800">Tổng quan</h1>

      {/* Stat cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          icon="👥"
          value={(userCount ?? 0).toLocaleString('vi-VN')}
          label="Người dùng"
        />
        <StatCard
          icon="📄"
          value={(cvCount ?? 0).toLocaleString('vi-VN')}
          label="CV đã tạo"
        />
        <StatCard
          icon="📦"
          value={(orderCount ?? 0).toLocaleString('vi-VN')}
          label="Tổng đơn hàng"
          sub={`${awaitingCount ?? 0} chờ duyệt`}
        />
        <StatCard
          icon="💰"
          value={fmtVnd(revenue)}
          label="Doanh thu"
          sub={`${paidCount} đơn đã thanh toán`}
        />
      </div>

      {/* Tables */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent orders */}
        <div className="bg-white rounded-2xl shadow-sm border border-zinc-200 overflow-hidden">
          <div className="px-5 py-4 border-b border-zinc-100">
            <h2 className="text-sm font-semibold text-zinc-700">5 đơn hàng gần nhất</h2>
          </div>
          <div className="divide-y divide-zinc-100">
            {!recentOrders?.length && (
              <p className="text-zinc-400 text-sm px-5 py-4">Chưa có đơn nào.</p>
            )}
            {recentOrders?.map((o) => {
              const profile = o.profiles as { email: string } | null
              const st = STATUS_LABEL[o.status] ?? { label: o.status, cls: 'text-zinc-600 bg-zinc-100' }
              return (
                <div key={o.order_code} className="px-5 py-3 flex items-center justify-between gap-3">
                  <div className="min-w-0">
                    <p className="text-sm font-mono font-medium text-zinc-800 truncate">{o.order_code}</p>
                    <p className="text-xs text-zinc-400 truncate">{profile?.email ?? '—'} · {fmtDate(o.created_at)}</p>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <span className="text-sm font-medium text-zinc-700">{fmtVnd(o.amount)}</span>
                    <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${st.cls}`}>{st.label}</span>
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        {/* Recent users */}
        <div className="bg-white rounded-2xl shadow-sm border border-zinc-200 overflow-hidden">
          <div className="px-5 py-4 border-b border-zinc-100">
            <h2 className="text-sm font-semibold text-zinc-700">5 user mới nhất</h2>
          </div>
          <div className="divide-y divide-zinc-100">
            {!recentUsers?.length && (
              <p className="text-zinc-400 text-sm px-5 py-4">Chưa có user nào.</p>
            )}
            {recentUsers?.map((u, i) => (
              <div key={i} className="px-5 py-3 flex items-center justify-between gap-3">
                <div className="min-w-0">
                  <p className="text-sm text-zinc-800 truncate">{u.email}</p>
                  <p className="text-xs text-zinc-400">{fmtDate(u.created_at)}</p>
                </div>
                <span className={`text-xs font-medium px-2 py-0.5 rounded-full shrink-0 ${
                  u.plan === 'pro'
                    ? 'text-blue-700 bg-blue-100'
                    : 'text-zinc-500 bg-zinc-100'
                }`}>
                  {u.plan === 'pro' ? 'Pro' : 'Free'}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
