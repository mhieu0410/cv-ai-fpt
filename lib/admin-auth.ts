import type { SupabaseClient, User } from '@supabase/supabase-js'
import { createServerSupabase } from './supabase-server'

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

/**
 * Helper cho Route Handlers: tạo server client, lấy user và xác nhận admin.
 * Trả về `User` nếu hợp lệ, hoặc `null` nếu chưa đăng nhập / không phải admin.
 * Gom logic auth admin đang lặp lại ở các route /api/admin/*.
 */
export async function getAdminUser(): Promise<User | null> {
  const supabase = await createServerSupabase()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user || !isAdmin(user.email)) return null
  return user
}
