import { getUserPlan } from '@/lib/user-plan'
import { isAdmin } from '@/lib/admin-auth'
import Link from 'next/link'
import NavbarLinks from './NavbarLinks'
import { createServerSupabase } from '@/lib/supabase-server'

export default async function AppNavbar() {
  const supabase = await createServerSupabase()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null

  const plan  = await getUserPlan(supabase, user.id)
  const admin = isAdmin(user.email)

  const planBadge: { type: 'free' } | { type: 'pro'; daysLeft: number } =
    plan.isPro
      ? { type: 'pro', daysLeft: plan.daysLeft }
      : { type: 'free' }

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
