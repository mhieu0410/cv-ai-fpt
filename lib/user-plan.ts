import type { SupabaseClient } from '@supabase/supabase-js'

export interface UserPlan {
  plan: 'free' | 'pro'
  pro_expires_at: string | null
  /** true khi plan='pro' và pro_expires_at chưa quá thời điểm hiện tại */
  isPro: boolean
  /** Số ngày còn lại của gói Pro (0 nếu không phải Pro hoặc đã hết hạn) */
  daysLeft: number
}

const MS_PER_DAY = 1000 * 60 * 60 * 24

const FREE_PLAN: UserPlan = {
  plan: 'free',
  pro_expires_at: null,
  isPro: false,
  daysLeft: 0,
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
  const { data, error } = await supabase
    .from('profiles')
    .select('plan, pro_expires_at')
    .eq('id', userId)
    .single()

  if (error || !data) {
    // Nếu có lỗi (ví dụ nghẽn RLS), fallback về free
    return FREE_PLAN
  }

  // Parse ngày tháng an toàn chống lệch múi giờ
  const expireTime = data.pro_expires_at ? new Date(data.pro_expires_at).getTime() : 0
  const now = Date.now()

  // Điều kiện Pro: plan là 'pro' VÀ thời gian hết hạn phải lớn hơn hiện tại
  const isPro = data.plan === 'pro' && expireTime > now
  const daysLeft = isPro ? Math.max(0, Math.ceil((expireTime - now) / MS_PER_DAY)) : 0

  return {
    plan: data.plan as 'free' | 'pro',
    pro_expires_at: data.pro_expires_at as string | null,
    isPro,
    daysLeft,
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
