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
    <header className="sticky top-0 z-50 border-b border-zinc-200 bg-white/80 backdrop-blur-md">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 h-14 flex items-center justify-between relative">
        {/* Logo */}
        <Link
          href="/"
          className="flex items-center gap-2.5 group"
          aria-label="CV AI — Trang chủ"
        >
          <div className="w-8 h-8 bg-[var(--fpt-orange)] rounded-lg flex items-center justify-center transition-transform group-hover:scale-105">
            <svg width="18" height="18" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
              <rect x="5" y="5" width="14" height="14" rx="2" fill="#fff" />
              <rect x="13" y="13" width="14" height="14" rx="2" fill="#ffffff" fillOpacity="0.55" />
            </svg>
          </div>
          <span className="font-semibold text-[15px] text-zinc-900 tracking-tight">CV AI</span>
        </Link>

        {/* Interactive parts (client) */}
        <NavbarLinks
          email={user.email ?? ''}
          displayName={user.user_metadata?.full_name || user.email}
          showAdmin={admin}
          planBadge={planBadge}
        />
      </div>
    </header>
  )
}
