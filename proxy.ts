import { type NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'

/**
 * Các tiền tố đường dẫn yêu cầu đăng nhập. Chưa đăng nhập → redirect /login.
 * Quyền admin được kiểm tra sâu hơn ở app/admin/layout.tsx + các route /api/admin/*.
 */
const PROTECTED_PREFIXES = ['/dashboard', '/cv', '/orders', '/upgrade', '/checkout', '/admin']

function isProtected(pathname: string): boolean {
  return PROTECTED_PREFIXES.some(
    (p) => pathname === p || pathname.startsWith(p + '/')
  )
}

export async function proxy(request: NextRequest) {
  // response mặc định — sẽ được tái tạo nếu Supabase cần ghi lại cookie (refresh token)
  let response = NextResponse.next({ request })

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  // Thiếu cấu hình → bỏ qua middleware để không chặn toàn bộ site
  if (!url || !anon) return response

  const supabase = createServerClient(url, anon, {
    cookies: {
      getAll() {
        return request.cookies.getAll()
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
        response = NextResponse.next({ request })
        cookiesToSet.forEach(({ name, value, options }) =>
          response.cookies.set(name, value, options)
        )
      },
    },
  })

  // QUAN TRỌNG: getUser() vừa xác thực vừa refresh session (rotate token) nếu cần.
  const {
    data: { user },
  } = await supabase.auth.getUser()

  const { pathname } = request.nextUrl

  if (!user && isProtected(pathname)) {
    const redirectUrl = request.nextUrl.clone()
    redirectUrl.pathname = '/login'
    redirectUrl.searchParams.set('redirect', pathname)
    return NextResponse.redirect(redirectUrl)
  }

  return response
}

export const config = {
  // Chạy trên mọi route trừ static assets & favicon (để luôn giữ session tươi).
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico)$).*)',
  ],
}
