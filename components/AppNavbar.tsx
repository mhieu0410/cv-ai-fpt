import { cookies } from 'next/headers'
import { createServerClient } from '@supabase/ssr'
import { getUserPlan } from '@/lib/user-plan'
import { isAdmin } from '@/lib/admin-auth'
import Link from 'next/link'
import NavbarLinks from './NavbarLinks'

export default async function AppNavbar() {
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
  if (!user) return null

  const plan  = await getUserPlan(supabase, user.id)
  const admin = isAdmin(user.email)

  let planBadge: { type: 'free' } | { type: 'pro'; daysLeft: number }
  if (plan.isPro && plan.pro_expires_at) {
    const ms      = new Date(plan.pro_expires_at).getTime() - Date.now()
    const daysLeft = Math.max(0, Math.ceil(ms / (1000 * 60 * 60 * 24)))
    planBadge = { type: 'pro', daysLeft }
  } else {
    planBadge = { type: 'free' }
  }

  return (
    <header className="sticky top-0 z-50 bg-zinc-900 border-b border-zinc-800">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 h-[60px] flex items-center justify-between">
        {/* Logo */}
        <Link
          href="/"
          className="flex items-center gap-2 font-bold text-lg text-white hover:opacity-90 transition-opacity"
          aria-label="CV AI — Trang chủ"
        >
          <span aria-hidden="true">📝</span>
          <span>CV AI</span>
        </Link>

        {/* Interactive parts (client) */}
        <NavbarLinks
          email={user.email ?? ''}
          showAdmin={admin}
          planBadge={planBadge}
        />
      </div>
    </header>
  )
}
