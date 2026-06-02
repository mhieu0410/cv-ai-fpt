import { redirect } from 'next/navigation'
import { cookies } from 'next/headers'
import { createServerClient } from '@supabase/ssr'
import { isAdmin } from '@/lib/admin-auth'

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const cookieStore = await cookies()

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll: () => cookieStore.getAll(),
        setAll: () => {},
      },
    }
  )

  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/login')
  if (!isAdmin(user.email)) redirect('/dashboard?error=not_admin')

  const email = user.email ?? ''

  return (
    <div className="min-h-screen bg-zinc-100">
      {/* Admin navbar */}
      <nav className="bg-zinc-900 border-b border-zinc-700 px-4 py-3">
        <div className="max-w-5xl mx-auto flex items-center justify-between gap-4 flex-wrap">
          <div className="flex items-center gap-1">
            <span className="text-zinc-500 text-xs font-semibold uppercase tracking-widest mr-3">
              Admin
            </span>
            <NavLink href="/admin">Tổng quan</NavLink>
            <NavLink href="/admin/orders">Đơn hàng</NavLink>
            <NavLink href="/admin/users">Người dùng</NavLink>
            <NavLink href="/admin/feedbacks">Feedback</NavLink>
          </div>

          <div className="flex items-center gap-3">
            <span className="text-xs font-mono text-zinc-400 bg-zinc-800 px-2.5 py-1 rounded-full">
              ADMIN: {email}
            </span>
            <a
              href="/dashboard"
              className="text-zinc-400 hover:text-white text-xs transition-colors"
            >
              Thoát admin →
            </a>
          </div>
        </div>
      </nav>

      {/* Page content */}
      <main className="max-w-5xl mx-auto px-4 py-8">
        {children}
      </main>
    </div>
  )
}

function NavLink({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <a
      href={href}
      className="text-zinc-400 hover:text-white text-sm px-3 py-1.5 rounded-lg hover:bg-zinc-800 transition-colors"
    >
      {children}
    </a>
  )
}
