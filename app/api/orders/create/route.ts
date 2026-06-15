import { NextResponse } from 'next/server'
import { CONFIG } from '@/lib/config'
import { createRouteSupabase } from '@/lib/supabase-server'

function generateOrderCode(): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'
  let code = 'CV-'
  for (let i = 0; i < 6; i++) {
    code += chars[Math.floor(Math.random() * chars.length)]
  }
  return code
}

export async function POST() {
  const supabase = await createRouteSupabase()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const MAX_RETRIES = 3
  for (let attempt = 0; attempt < MAX_RETRIES; attempt++) {
    const orderCode = generateOrderCode()

    const { data, error } = await supabase
      .from('orders')
      .insert({
        user_id: user.id,
        order_code: orderCode,
        plan: 'pro_1month',
        amount: CONFIG.proPrice,
        status: 'pending',
      })
      .select('id, order_code')
      .single()

    if (error) {
      // 23505 = unique_violation: order_code trùng, thử lại
      if (error.code === '23505' && attempt < MAX_RETRIES - 1) continue
      console.error('[orders/create] insert failed:', error)
      return NextResponse.json({ error: 'Tạo đơn hàng thất bại.' }, { status: 500 })
    }

    return NextResponse.json({ orderId: data.id, orderCode: data.order_code })
  }

  // Hết retry vẫn trùng (cực kỳ hiếm)
  return NextResponse.json({ error: 'Không thể tạo mã đơn hàng. Vui lòng thử lại.' }, { status: 500 })
}
