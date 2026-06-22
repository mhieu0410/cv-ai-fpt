'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'

type PlanBadge = { type: 'free' } | { type: 'pro'; daysLeft: number }

interface NavbarLinksProps {
  email: string
  displayName?: string
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
      <span className="px-3 py-1 rounded border-2 border-black text-[11px] font-black uppercase tracking-widest bg-[#C4A1FF] text-black shadow-[2px_2px_0_0_#000]">
        Pro · {badge.daysLeft} ngày
      </span>
    )
  }
  return (
    <span className="px-3 py-1 rounded border-2 border-black text-[11px] font-black uppercase tracking-widest bg-zinc-200 text-black shadow-[2px_2px_0_0_#000]">
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
      <div className="hidden md:flex items-center gap-6">
        {/* Nav links */}
        <nav className="flex items-center gap-6" aria-label="Main navigation">
          {NAV_LINKS.map(({ label, href }) => (
            <Link
              key={href}
              href={href}
              className={`text-[13px] uppercase tracking-widest font-black transition-all ${
                isActive(href)
                  ? 'text-[var(--fpt-orange)] border-b-2 border-[var(--fpt-orange)]'
                  : 'text-black hover:text-[var(--fpt-orange)] hover:-translate-y-0.5'
              }`}
            >
              {label}
            </Link>
          ))}
        </nav>

        {/* Divider */}
        <div className="w-1 h-1 rounded-full bg-black" aria-hidden="true" />

        {/* Right cluster */}
        <div className="flex items-center gap-4">
          <PlanBadge badge={planBadge} />

          {showAdmin && (
            <Link
              href="/admin"
              className="px-3 py-1 text-[11px] font-black uppercase tracking-widest rounded border-2 border-black bg-yellow-300 text-black hover:translate-y-px hover:shadow-none shadow-[2px_2px_0_0_#000] transition-all"
            >
              🛠 Admin
            </Link>
          )}

          <span className="text-[13px] font-bold text-zinc-600 select-none" title={email}>
            {displayName ? displayName : shortenEmail(email)}
          </span>

          <button
            onClick={handleSignOut}
            disabled={signingOut}
            className="px-4 py-1.5 text-[12px] font-black uppercase tracking-widest rounded border-2 border-black bg-white text-black hover:bg-black hover:text-white shadow-[2px_2px_0_0_#000] hover:translate-y-px hover:shadow-none transition-all disabled:opacity-50"
          >
            {signingOut ? '...' : 'Đăng xuất'}
          </button>
        </div>
      </div>

      {/* ── Mobile: hamburger ─────────────────────── */}
      <button
        className="md:hidden p-2 rounded border-2 border-black bg-white text-black shadow-[2px_2px_0_0_#000] active:translate-y-px active:shadow-none transition-all"
        onClick={() => setOpen((v) => !v)}
        aria-label={open ? 'Đóng menu' : 'Mở menu'}
        aria-expanded={open}
      >
        {open ? (
          <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={3} strokeLinecap="round" strokeLinejoin="round">
            <path d="M6 18L18 6M6 6l12 12" />
          </svg>
        ) : (
          <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={3} strokeLinecap="round" strokeLinejoin="round">
            <path d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        )}
      </button>

      {/* ── Mobile dropdown ───────────────────────── */}
      {open && (
        <div className="md:hidden absolute top-full right-0 mt-4 w-72 bg-white border-4 border-black rounded-2xl shadow-[8px_8px_0_0_#000] z-50 overflow-hidden">
          {/* Nav links */}
          <nav aria-label="Mobile navigation" className="p-2 border-b-4 border-black flex flex-col gap-1">
            {NAV_LINKS.map(({ label, href }) => (
              <Link
                key={href}
                href={href}
                onClick={() => setOpen(false)}
                className={`flex items-center px-4 py-3 rounded-xl text-[13px] uppercase tracking-widest font-black transition-all ${
                  isActive(href)
                    ? 'bg-[var(--fpt-orange)] text-white border-2 border-black shadow-[2px_2px_0_0_#000]'
                    : 'text-black hover:bg-zinc-100 border-2 border-transparent hover:border-black'
                }`}
              >
                {label}
              </Link>
            ))}
            {showAdmin && (
              <Link
                href="/admin"
                onClick={() => setOpen(false)}
                className="flex items-center px-4 py-3 rounded-xl text-[13px] uppercase tracking-widest font-black text-black bg-yellow-300 border-2 border-black shadow-[2px_2px_0_0_#000] mt-2"
              >
                🛠 Admin Panel
              </Link>
            )}
          </nav>

          {/* User info + sign out */}
          <div className="p-4 flex flex-col gap-4">
            <div className="flex items-center gap-3 min-w-0 bg-zinc-50 border-2 border-black p-3 rounded-xl">
              <PlanBadge badge={planBadge} />
              <span className="text-[13px] font-bold text-black truncate" title={email}>
                {displayName ? displayName : shortenEmail(email)}
              </span>
            </div>
            <button
              onClick={handleSignOut}
              disabled={signingOut}
              className="w-full px-4 py-3 text-[13px] font-black uppercase tracking-widest rounded-xl border-2 border-black bg-white text-black hover:bg-black hover:text-white shadow-[4px_4px_0_0_#000] active:translate-y-1 active:shadow-none transition-all disabled:opacity-50"
            >
              {signingOut ? '...' : 'Đăng xuất'}
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
