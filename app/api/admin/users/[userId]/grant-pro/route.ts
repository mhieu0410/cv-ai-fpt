import { NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { isAdmin } from '@/lib/admin-auth'
import { createAdminClient } from '@/lib/supabase-admin'

export async function POST(
  request: Request,
  { params }: { params: Promise<{ userId: string }> }
) {
  // ── Auth ──────────────────────────────────────────────────────────────────
  const cookieStore = await cookies()
  const ssrClient = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll: () => cookieStore.getAll(),
        setAll: () => {},
      },
    }
  )
  const { data: { user } } = await ssrClient.auth.getUser()
  if (!user || !isAdmin(user.email)) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  // ── Parse & validate body ─────────────────────────────────────────────────
  const body = await request.json().catch(() => ({}))
  const days = typeof body.days === 'number' ? body.days : 30

  if (!Number.isInteger(days) || days < 1 || days > 365) {
    return NextResponse.json({ error: 'days phải là số nguyên từ 1 đến 365.' }, { status: 400 })
  }

  // ── Fetch current profile ─────────────────────────────────────────────────
  const { userId } = await params
  const db = createAdminClient()

  const { data: profile, error: fetchError } = await db
    .from('profiles')
    .select('plan, pro_expires_at')
    .eq('id', userId)
    .single()

  if (fetchError || !profile) {
    return NextResponse.json({ error: 'Không tìm thấy user.' }, { status: 404 })
  }

  // ── Compute new expiry (idempotency) ──────────────────────────────────────
  const msPerDay = 24 * 60 * 60 * 1000
  const now = Date.now()

  let base = now
  if (profile.plan === 'pro' && profile.pro_expires_at) {
    const currentExpiry = new Date(profile.pro_expires_at).getTime()
    if (currentExpiry > now) {
      // Still active → extend from current expiry
      base = currentExpiry
    }
  }

  const newExpiresAt = new Date(base + days * msPerDay).toISOString()

  // ── Update profile ────────────────────────────────────────────────────────
  const { error: updateError } = await db
    .from('profiles')
    .update({ plan: 'pro', pro_expires_at: newExpiresAt })
    .eq('id', userId)

  if (updateError) {
    console.error('[admin/grant-pro] update failed:', updateError)
    return NextResponse.json({ error: 'Cập nhật thất bại.' }, { status: 500 })
  }

  console.info('[admin/grant-pro]', { adminEmail: user.email, userId, days, newExpiresAt })

  return NextResponse.json({ success: true, newExpiresAt })
}
