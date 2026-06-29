import { NextResponse } from 'next/server'
import { createRouteSupabase } from '@/lib/supabase-server'

/**
 * Callback OAuth (Google...). Supabase redirect về đây kèm `?code=...`.
 * Bắt buộc phải đổi code lấy session (PKCE) rồi mới chuyển hướng tiếp,
 * nếu không session sẽ không được tạo và user bị đá về /login.
 */
export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  const next = searchParams.get('next') ?? '/dashboard'

  if (code) {
    const supabase = await createRouteSupabase()
    const { error } = await supabase.auth.exchangeCodeForSession(code)

    if (!error) {
      // Hỗ trợ deploy sau reverse proxy (Vercel...): ưu tiên forwarded host.
      const forwardedHost = request.headers.get('x-forwarded-host')
      const isLocal = process.env.NODE_ENV === 'development'
      if (isLocal || !forwardedHost) {
        return NextResponse.redirect(`${origin}${next}`)
      }
      return NextResponse.redirect(`https://${forwardedHost}${next}`)
    }
  }

  return NextResponse.redirect(`${origin}/login?error=oauth`)
}
