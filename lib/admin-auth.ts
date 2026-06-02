import type { SupabaseClient } from '@supabase/supabase-js'

/** Kiểm tra email có trong danh sách ADMIN_EMAILS không (case-insensitive). */
export function isAdmin(email: string | null | undefined): boolean {
  if (!email) return false

  const adminEmails = (process.env.ADMIN_EMAILS ?? '')
    .split(',')
    .map((e) => e.trim().toLowerCase())
    .filter(Boolean)

  return adminEmails.includes(email.toLowerCase())
}

/**
 * Lấy user đang đăng nhập và xác nhận là admin.
 * Throw Error nếu chưa đăng nhập hoặc không có quyền admin.
 */
export async function requireAdmin(supabase: SupabaseClient) {
  const { data: { user }, error } = await supabase.auth.getUser()

  if (error || !user) {
    throw new Error('Unauthorized')
  }

  if (!isAdmin(user.email)) {
    throw new Error('Forbidden')
  }

  return user
}
