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
    <header className="sticky top-0 z-50 bg-white border-b-4 border-black shadow-[0_4px_0_0_rgba(0,0,0,0.05)]">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 h-[72px] flex items-center justify-between relative">
        {/* Logo */}
        <Link
          href="/"
          className="flex items-center gap-3 group"
          aria-label="CV AI — Trang chủ"
        >
          <div className="w-10 h-10 bg-[var(--fpt-orange)] rounded-xl flex items-center justify-center border-2 border-black shadow-[2px_2px_0_0_#000] group-hover:translate-y-0.5 group-hover:shadow-none transition-all">
            <svg width="20" height="20" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
              <rect x="4" y="4" width="16" height="16" stroke="black" strokeWidth="4" fill="#fff" />
              <rect x="12" y="12" width="16" height="16" stroke="black" strokeWidth="4" fill="#C4A1FF" />
            </svg>
          </div>
          <span className="font-black text-xl text-black uppercase tracking-tighter">CV AI</span>
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
