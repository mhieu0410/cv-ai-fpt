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
  const reason = typeof body.reason === 'string' ? body.reason.trim() : ''

  if (reason.length < 5) {
    return NextResponse.json({ error: 'reason phải có ít nhất 5 ký tự.' }, { status: 400 })
  }

  // ── Update profile ────────────────────────────────────────────────────────
  const { userId } = await params
  const db = createAdminClient()

  const { error } = await db
    .from('profiles')
    .update({ plan: 'free', pro_expires_at: null })
    .eq('id', userId)

  if (error) {
    console.error('[admin/revoke-pro] update failed:', error)
    return NextResponse.json({ error: 'Cập nhật thất bại.' }, { status: 500 })
  }

  console.info('[admin/revoke-pro]', { adminEmail: user.email, userId, reason })

  return NextResponse.json({ success: true })
}
