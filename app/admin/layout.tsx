import { redirect } from 'next/navigation'
import { isAdmin } from '@/lib/admin-auth'
import { createServerSupabase } from '@/lib/supabase-server'
import { LayoutDashboard, ShoppingCart, Users, MessageSquare, LogOut } from 'lucide-react'

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createServerSupabase()

  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/login')
  if (!isAdmin(user.email)) redirect('/dashboard?error=not_admin')

  const email = user.email ?? ''

  return (
    <div className="flex h-screen bg-zinc-50 overflow-hidden font-sans">
      {/* Admin Sidebar */}
      <aside className="w-64 bg-zinc-950 flex flex-col border-r border-zinc-900 shadow-2xl relative z-20">
        <div className="p-6">
          <div className="text-[var(--fpt-orange)] text-xs font-black uppercase tracking-[0.2em] mb-1">
            FPT CV Builder
          </div>
          <div className="text-white text-xl font-black tracking-tight">
            Admin Panel
          </div>
        </div>

        <div className="flex-1 px-4 py-6 space-y-2 overflow-y-auto">
          <NavLink href="/admin" icon={<LayoutDashboard className="w-4 h-4" />}>
            Tổng quan
          </NavLink>
          <NavLink href="/admin/orders" icon={<ShoppingCart className="w-4 h-4" />}>
            Đơn hàng
          </NavLink>
          <NavLink href="/admin/users" icon={<Users className="w-4 h-4" />}>
            Người dùng
          </NavLink>
          <NavLink href="/admin/feedbacks" icon={<MessageSquare className="w-4 h-4" />}>
            Feedback
          </NavLink>
        </div>

        <div className="p-4 border-t border-white/10 bg-black/20">
          <div className="flex flex-col gap-3">
            <span className="text-[10px] font-mono text-zinc-400 bg-white/5 px-2.5 py-1.5 rounded-lg border border-white/5 truncate">
              {email}
            </span>
            <a
              href="/dashboard"
              className="flex items-center gap-2 text-zinc-400 hover:text-white text-sm font-bold transition-colors w-full px-2"
            >
              <LogOut className="w-4 h-4" />
              Thoát admin
            </a>
          </div>
        </div>
      </aside>

      {/* Page content */}
      <main className="flex-1 overflow-auto bg-zinc-50 relative">
        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-5 mix-blend-overlay pointer-events-none"></div>
        <div className="max-w-6xl mx-auto p-8 relative z-10">
          {children}
        </div>
      </main>
    </div>
  )
}

function NavLink({ href, icon, children }: { href: string; icon: React.ReactNode; children: React.ReactNode }) {
  return (
    <a
      href={href}
      className="flex items-center gap-3 text-zinc-400 hover:text-white font-bold text-sm px-4 py-3 rounded-xl hover:bg-white/10 transition-all group"
    >
      <span className="text-zinc-500 group-hover:text-[var(--fpt-orange)] transition-colors">
        {icon}
      </span>
      {children}
    </a>
  )
}
