import type { SupabaseClient } from '@supabase/supabase-js'

export interface UserPlan {
  plan: 'free' | 'pro'
  pro_expires_at: string | null
  /** true khi plan='pro' và pro_expires_at chưa quá thời điểm hiện tại */
  isPro: boolean
}

/**
 * Lấy gói hiện tại của user từ bảng profiles.
 * Nhận supabase client làm tham số để dùng được từ cả client component lẫn API route.
 * Fallback về free nếu không tìm thấy profile.
 */
export async function getUserPlan(
  supabase: SupabaseClient,
  userId: string
): Promise<UserPlan> {
  const { data } = await supabase
    .from('profiles')
    .select('plan, pro_expires_at')
    .eq('id', userId)
    .single()

  if (!data) {
    return { plan: 'free', pro_expires_at: null, isPro: false }
  }

  const isPro =
    data.plan === 'pro' &&
    data.pro_expires_at !== null &&
    new Date(data.pro_expires_at) > new Date()

  return {
    plan: data.plan as 'free' | 'pro',
    pro_expires_at: data.pro_expires_at as string | null,
    isPro,
  }
}

/**
 * Đếm số CV hiện có của user trong bảng cvs.
 * Trả về 0 nếu có lỗi.
 */
export async function countUserCvs(
  supabase: SupabaseClient,
  userId: string
): Promise<number> {
  const { count, error } = await supabase
    .from('cvs')
    .select('id', { count: 'exact', head: true })
    .eq('user_id', userId)

  if (error || count === null) return 0
  return count
}
