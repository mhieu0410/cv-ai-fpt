'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'

type PlanBadge = { type: 'free' } | { type: 'pro'; daysLeft: number }

interface NavbarLinksProps {
  email: string
  showAdmin: boolean
  planBadge: PlanBadge
}

const NAV_LINKS = [
  { label: 'Dashboard', href: '/dashboard' },
  { label: 'Đơn hàng',  href: '/orders/me' },
  { label: 'Góp ý',     href: '/feedback?from=navbar' },
] as const

function shortenEmail(email: string): string {
  const atIdx = email.indexOf('@')
  if (atIdx < 0 || email.length <= 22) return email
  return `${email.slice(0, atIdx)}@...`
}

function PlanBadge({ badge }: { badge: PlanBadge }) {
  if (badge.type === 'pro') {
    return (
      <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-gradient-to-r from-violet-600 to-emerald-500 text-white whitespace-nowrap">
        Pro · {badge.daysLeft} ngày
      </span>
    )
  }
  return (
    <span className="px-2.5 py-1 rounded-full text-xs font-medium bg-zinc-700 text-zinc-300">
      Free
    </span>
  )
}

export default function NavbarLinks({ email, showAdmin, planBadge }: NavbarLinksProps) {
  const pathname = usePathname()
  const router   = useRouter()
  const [open, setOpen] = useState(false)
  const [signingOut, setSigningOut] = useState(false)

  function isActive(href: string): boolean {
    const path = href.split('?')[0]
    return pathname === path || pathname.startsWith(path + '/')
  }

  async function handleSignOut() {
    setSigningOut(true)
    await supabase.auth.signOut()
    router.push('/login')
  }

  return (
    <div className="relative flex items-center">
      {/* ── Desktop layout ────────────────────────── */}
      <div className="hidden md:flex items-center gap-6">
        {/* Nav links */}
        <nav className="flex items-center gap-5" aria-label="Main navigation">
          {NAV_LINKS.map(({ label, href }) => (
            <Link
              key={href}
              href={href}
              className={`text-sm transition-colors ${
                isActive(href)
                  ? 'text-violet-400 font-medium'
                  : 'text-zinc-400 hover:text-white'
              }`}
            >
              {label}
            </Link>
          ))}
        </nav>

        {/* Divider */}
        <div className="w-px h-5 bg-zinc-800" aria-hidden="true" />

        {/* Right cluster */}
        <div className="flex items-center gap-3">
          <PlanBadge badge={planBadge} />

          {showAdmin && (
            <Link
              href="/admin"
              className="px-2.5 py-1 text-xs rounded-lg border border-zinc-700 text-zinc-300 hover:text-white hover:border-zinc-500 transition-colors"
            >
              🛠 Admin
            </Link>
          )}

          <span className="text-sm text-zinc-400 select-none" title={email}>
            {shortenEmail(email)}
          </span>

          <button
            onClick={handleSignOut}
            disabled={signingOut}
            className="px-3 py-1.5 text-sm rounded-lg border border-zinc-700 text-zinc-300 hover:border-red-500 hover:text-red-400 transition-colors disabled:opacity-50"
          >
            {signingOut ? '...' : 'Đăng xuất'}
          </button>
        </div>
      </div>

      {/* ── Mobile: hamburger ─────────────────────── */}
      <button
        className="md:hidden p-2 text-zinc-400 hover:text-white transition-colors"
        onClick={() => setOpen((v) => !v)}
        aria-label={open ? 'Đóng menu' : 'Mở menu'}
        aria-expanded={open}
      >
        {open ? (
          <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
            <path d="M6 18L18 6M6 6l12 12" />
          </svg>
        ) : (
          <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
            <path d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        )}
      </button>

      {/* ── Mobile dropdown ───────────────────────── */}
      {open && (
        <div className="md:hidden absolute top-full right-0 mt-2 w-72 bg-zinc-900 border border-zinc-800 rounded-2xl shadow-xl z-50 overflow-hidden">
          {/* Nav links */}
          <nav aria-label="Mobile navigation" className="p-2 border-b border-zinc-800">
            {NAV_LINKS.map(({ label, href }) => (
              <Link
                key={href}
                href={href}
                onClick={() => setOpen(false)}
                className={`flex items-center px-4 py-2.5 rounded-xl text-sm transition-colors ${
                  isActive(href)
                    ? 'bg-violet-500/10 text-violet-400 font-medium'
                    : 'text-zinc-300 hover:bg-zinc-800 hover:text-white'
                }`}
              >
                {label}
              </Link>
            ))}
            {showAdmin && (
              <Link
                href="/admin"
                onClick={() => setOpen(false)}
                className="flex items-center px-4 py-2.5 rounded-xl text-sm text-zinc-300 hover:bg-zinc-800 hover:text-white transition-colors"
              >
                🛠 Admin
              </Link>
            )}
          </nav>

          {/* User info + sign out */}
          <div className="p-3 flex items-center justify-between gap-3">
            <div className="flex items-center gap-2 min-w-0">
              <PlanBadge badge={planBadge} />
              <span className="text-xs text-zinc-400 truncate" title={email}>
                {shortenEmail(email)}
              </span>
            </div>
            <button
              onClick={handleSignOut}
              disabled={signingOut}
              className="shrink-0 px-3 py-1.5 text-xs rounded-lg border border-zinc-700 text-zinc-300 hover:border-red-500 hover:text-red-400 transition-colors disabled:opacity-50"
            >
              {signingOut ? '...' : 'Đăng xuất'}
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
