import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import type { SupabaseClient } from '@supabase/supabase-js'

/**
 * Server-side Supabase factories.
 *
 * Trước đây mỗi route/page tự khởi tạo `createServerClient` kèm boilerplate
 * cookie (lặp lại ~15 dòng ở 16 file). Gom về đây để DRY và đảm bảo cấu hình
 * cookie nhất quán toàn hệ thống.
 */

function env(name: string): string {
  const value = process.env[name]
  if (!value) {
    throw new Error(`Thiếu biến môi trường bắt buộc: ${name}`)
  }
  return value
}

/**
 * Dùng trong Server Components / layouts — nơi KHÔNG được phép ghi cookie
 * trong lúc render. `setAll` là no-op để tránh lỗi runtime của Next.js.
 */
export async function createServerSupabase(): Promise<SupabaseClient> {
  const cookieStore = await cookies()
  return createServerClient(
    env('NEXT_PUBLIC_SUPABASE_URL'),
    env('NEXT_PUBLIC_SUPABASE_ANON_KEY'),
    {
      cookies: {
        getAll: () => cookieStore.getAll(),
        setAll: () => {},
      },
    }
  )
}

/**
 * Dùng trong Route Handlers / Server Actions — nơi ĐƯỢC phép ghi cookie,
 * cho phép Supabase tự động refresh session (rotate access/refresh token).
 */
export async function createRouteSupabase(): Promise<SupabaseClient> {
  const cookieStore = await cookies()
  return createServerClient(
    env('NEXT_PUBLIC_SUPABASE_URL'),
    env('NEXT_PUBLIC_SUPABASE_ANON_KEY'),
    {
      cookies: {
        getAll: () => cookieStore.getAll(),
        setAll: (cookiesToSet) => {
          for (const { name, value, options } of cookiesToSet) {
            cookieStore.set(name, value, options)
          }
        },
      },
    }
  )
}
