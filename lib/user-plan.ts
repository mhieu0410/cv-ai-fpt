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
  const { data, error } = await supabase
    .from('profiles')
    .select('plan, pro_expires_at')
    .eq('id', userId)
    .single()

  // In ra màn hình console để debug chính xác dữ liệu nhận được ở Client là gì
  console.log('Debug getUserPlan nhận từ DB:', { data, error })

  if (error || !data) {
    // Nếu có lỗi (ví dụ nghẽn RLS), fallback về free
    return { plan: 'free', pro_expires_at: null, isPro: false }
  }

  // Đảm bảo parse ngày tháng an toàn chống lệch múi giờ
  const expireTime = data.pro_expires_at ? new Date(data.pro_expires_at).getTime() : 0
  const currentTime = Date.now()

  // Điều kiện Pro: plan là 'pro' VÀ thời gian hết hạn phải lớn hơn thời gian hiện tại
  const isPro = data.plan === 'pro' && expireTime > currentTime

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