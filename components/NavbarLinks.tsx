'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { Menu, X } from 'lucide-react'
import { supabase } from '@/lib/supabase'

type PlanBadge = { type: 'free' } | { type: 'pro'; daysLeft: number }

interface NavbarLinksProps {
  email: string
  displayName?: string
  showAdmin: boolean
  planBadge: PlanBadge
}

const NAV_LINKS = [
  { label: 'Dashboard',    href: '/dashboard' },
  { label: 'Khám phá FPT', href: '/companies' },
  { label: 'Đơn hàng',     href: '/orders/me' },
  { label: 'Góp ý',        href: '/feedback?from=navbar' },
] as const

function shortenEmail(email: string): string {
  const atIdx = email.indexOf('@')
  if (atIdx < 0 || email.length <= 22) return email
  return `${email.slice(0, atIdx)}@...`
}

function PlanBadge({ badge }: { badge: PlanBadge }) {
  if (badge.type === 'pro') {
    return (
      <span className="inline-flex items-center rounded-full border border-[var(--fpt-orange)]/25 bg-[var(--fpt-orange)]/10 px-2.5 py-1 text-xs font-medium text-[var(--fpt-orange)]">
        Pro · {badge.daysLeft} ngày
      </span>
    )
  }
  return (
    <span className="inline-flex items-center rounded-full bg-zinc-100 px-2.5 py-1 text-xs font-medium text-zinc-600">
      Free
    </span>
  )
}

export default function NavbarLinks({ email, displayName, showAdmin, planBadge }: NavbarLinksProps) {
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
      <div className="hidden md:flex items-center gap-2">
        {/* Nav links */}
        <nav className="flex items-center gap-1" aria-label="Main navigation">
          {NAV_LINKS.map(({ label, href }) => (
            <Link
              key={href}
              href={href}
              className={`rounded-lg px-3 py-1.5 text-sm font-medium transition-colors ${
                isActive(href)
                  ? 'bg-zinc-100 text-zinc-900'
                  : 'text-zinc-500 hover:bg-zinc-50 hover:text-zinc-900'
              }`}
            >
              {label}
            </Link>
          ))}
        </nav>

        {/* Divider */}
        <div className="mx-2 h-5 w-px bg-zinc-200" aria-hidden="true" />

        {/* Right cluster */}
        <div className="flex items-center gap-3">
          <PlanBadge badge={planBadge} />

          {showAdmin && (
            <Link
              href="/admin"
              className="inline-flex h-8 items-center gap-1 rounded-lg border border-zinc-200 px-2.5 text-xs font-medium text-zinc-700 transition-colors hover:bg-zinc-50"
            >
              🛠 Admin
            </Link>
          )}

          <Link
            href="/account"
            title="Cài đặt tài khoản"
            className={`text-sm font-medium transition-colors ${
              isActive('/account') ? 'text-[var(--fpt-orange)]' : 'text-zinc-600 hover:text-zinc-900'
            }`}
          >
            {displayName ? displayName : shortenEmail(email)}
          </Link>

          <button
            onClick={handleSignOut}
            disabled={signingOut}
            className="inline-flex h-8 items-center rounded-lg border border-zinc-200 px-3 text-sm font-medium text-zinc-700 transition-colors hover:bg-zinc-50 disabled:opacity-50"
          >
            {signingOut ? '...' : 'Đăng xuất'}
          </button>
        </div>
      </div>

      {/* ── Mobile: hamburger ─────────────────────── */}
      <button
        className="md:hidden inline-flex h-9 w-9 items-center justify-center rounded-lg border border-zinc-200 text-zinc-700 transition-colors hover:bg-zinc-50"
        onClick={() => setOpen((v) => !v)}
        aria-label={open ? 'Đóng menu' : 'Mở menu'}
        aria-expanded={open}
      >
        {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
      </button>

      {/* ── Mobile dropdown ───────────────────────── */}
      {open && (
        <div className="absolute right-0 top-full z-50 mt-3 w-72 overflow-hidden rounded-xl border border-zinc-200 bg-white shadow-lg md:hidden">
          {/* Nav links */}
          <nav aria-label="Mobile navigation" className="flex flex-col gap-0.5 p-2">
            {NAV_LINKS.map(({ label, href }) => (
              <Link
                key={href}
                href={href}
                onClick={() => setOpen(false)}
                className={`rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${
                  isActive(href)
                    ? 'bg-zinc-100 text-zinc-900'
                    : 'text-zinc-600 hover:bg-zinc-50 hover:text-zinc-900'
                }`}
              >
                {label}
              </Link>
            ))}
            {showAdmin && (
              <Link
                href="/admin"
                onClick={() => setOpen(false)}
                className="rounded-lg px-3 py-2.5 text-sm font-medium text-zinc-600 transition-colors hover:bg-zinc-50 hover:text-zinc-900"
              >
                🛠 Admin Panel
              </Link>
            )}
          </nav>

          {/* User info + sign out */}
          <div className="flex flex-col gap-3 border-t border-zinc-100 p-3">
            <Link
              href="/account"
              onClick={() => setOpen(false)}
              className="flex items-center gap-3 rounded-lg border border-zinc-200 p-3 transition-colors hover:bg-zinc-50"
            >
              <PlanBadge badge={planBadge} />
              <span className="truncate text-sm font-medium text-zinc-800" title={email}>
                {displayName ? displayName : shortenEmail(email)}
              </span>
              <span className="ml-auto text-xs font-medium text-zinc-400">Tài khoản →</span>
            </Link>
            <button
              onClick={handleSignOut}
              disabled={signingOut}
              className="w-full rounded-lg border border-zinc-200 px-4 py-2.5 text-sm font-medium text-zinc-700 transition-colors hover:bg-zinc-50 disabled:opacity-50"
            >
              {signingOut ? '...' : 'Đăng xuất'}
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
