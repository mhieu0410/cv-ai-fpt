import { createAdminClient } from '@/lib/supabase-admin'
import { Users, FileText, Package, Wallet } from 'lucide-react'

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
  icon: React.ReactNode
  value: string
  label: string
  sub?: string
}

function StatCard({ icon, value, label, sub }: StatCardProps) {
  return (
    <div className="bg-white rounded-3xl shadow-soft-xl border border-zinc-200/60 p-8 flex flex-col justify-between group hover:shadow-[0_20px_40px_-15px_rgba(0,0,0,0.05)] hover:-translate-y-1 transition-all duration-300">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-12 h-12 rounded-2xl bg-zinc-50 border border-zinc-100 flex items-center justify-center text-zinc-900 group-hover:bg-[var(--fpt-orange)] group-hover:text-white transition-colors duration-300">
          {icon}
        </div>
        <p className="text-sm font-bold text-zinc-500 uppercase tracking-widest">{label}</p>
      </div>
      <div>
        <p className="text-5xl font-black text-zinc-900 tracking-tighter">{value}</p>
        {sub && <p className="text-xs font-semibold text-zinc-400 mt-2">{sub}</p>}
      </div>
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

  // Quan sát lỗi truy vấn
  const queryErrors = [e1, e2, e3, e4, e5, e6, e7].filter(Boolean)
  if (queryErrors.length > 0) {
    console.error('[admin/dashboard] query errors:', queryErrors.map((e) => e?.message))
  }

  const revenue = paidOrders?.reduce((sum, o) => sum + (o.amount ?? 0), 0) ?? 0
  const paidCount = paidOrders?.length ?? 0

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-black text-zinc-900 tracking-tight">Tổng Quan Hệ Thống</h1>
      </div>

      {/* Stat cards - Bento Grid style */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
        <StatCard
          icon={<Users className="w-6 h-6" />}
          value={(userCount ?? 0).toLocaleString('vi-VN')}
          label="Người dùng"
        />
        <StatCard
          icon={<FileText className="w-6 h-6" />}
          value={(cvCount ?? 0).toLocaleString('vi-VN')}
          label="CV đã tạo"
        />
        <StatCard
          icon={<Package className="w-6 h-6" />}
          value={(orderCount ?? 0).toLocaleString('vi-VN')}
          label="Tổng đơn hàng"
          sub={`${awaitingCount ?? 0} chờ duyệt`}
        />
        <StatCard
          icon={<Wallet className="w-6 h-6" />}
          value={fmtVnd(revenue)}
          label="Doanh thu"
          sub={`${paidCount} đơn đã thanh toán`}
        />
      </div>

      {/* Tables - Bento Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent orders */}
        <div className="bg-white rounded-3xl shadow-soft-xl border border-zinc-200/60 overflow-hidden flex flex-col h-[400px]">
          <div className="px-6 py-5 border-b border-zinc-100 flex items-center justify-between shrink-0">
            <h2 className="text-base font-bold text-zinc-900 tracking-wide uppercase">5 đơn hàng gần nhất</h2>
            <a href="/admin/orders" className="text-xs font-bold text-[var(--fpt-orange)] hover:underline">Xem tất cả</a>
          </div>
          <div className="divide-y divide-zinc-50 overflow-y-auto flex-1">
            {!recentOrders?.length && (
              <div className="h-full flex items-center justify-center text-zinc-400 text-sm font-medium">Chưa có đơn nào.</div>
            )}
            {recentOrders?.map((o) => {
              const profile = o.profiles as unknown as { email: string } | null
              const st = STATUS_LABEL[o.status] ?? { label: o.status, cls: 'text-zinc-600 bg-zinc-100' }
              return (
                <div key={o.order_code} className="px-6 py-4 flex items-center justify-between gap-4 hover:bg-zinc-50/50 transition-colors">
                  <div className="min-w-0">
                    <p className="text-sm font-mono font-bold text-zinc-900 truncate">{o.order_code}</p>
                    <p className="text-xs font-medium text-zinc-500 truncate mt-0.5">{profile?.email ?? '—'} · {fmtDate(o.created_at)}</p>
                  </div>
                  <div className="flex items-center gap-3 shrink-0">
                    <span className="text-sm font-bold text-zinc-900">{fmtVnd(o.amount)}</span>
                    <span className={`text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-md ${st.cls}`}>{st.label}</span>
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        {/* Recent users */}
        <div className="bg-white rounded-3xl shadow-soft-xl border border-zinc-200/60 overflow-hidden flex flex-col h-[400px]">
          <div className="px-6 py-5 border-b border-zinc-100 flex items-center justify-between shrink-0">
            <h2 className="text-base font-bold text-zinc-900 tracking-wide uppercase">5 user mới nhất</h2>
            <a href="/admin/users" className="text-xs font-bold text-[var(--fpt-orange)] hover:underline">Xem tất cả</a>
          </div>
          <div className="divide-y divide-zinc-50 overflow-y-auto flex-1">
            {!recentUsers?.length && (
              <div className="h-full flex items-center justify-center text-zinc-400 text-sm font-medium">Chưa có user nào.</div>
            )}
            {recentUsers?.map((u, i) => (
              <div key={i} className="px-6 py-4 flex items-center justify-between gap-4 hover:bg-zinc-50/50 transition-colors">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-10 h-10 rounded-full bg-zinc-100 flex items-center justify-center text-zinc-500 font-bold shrink-0">
                    {u.email.charAt(0).toUpperCase()}
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-bold text-zinc-900 truncate">{u.email}</p>
                    <p className="text-xs font-medium text-zinc-500 mt-0.5">{fmtDate(u.created_at)}</p>
                  </div>
                </div>
                <span className={`text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-md shrink-0 ${
                  u.plan === 'pro'
                    ? 'text-[var(--fpt-orange)] bg-orange-50'
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
