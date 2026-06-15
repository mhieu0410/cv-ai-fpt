import { NextResponse } from 'next/server'
import { getAdminUser } from '@/lib/admin-auth'
import { createAdminClient } from '@/lib/supabase-admin'

export async function POST(
  _request: Request,
  { params }: { params: Promise<{ orderId: string }> }
) {
  // ── Auth: verify admin (reads user cookie + kiểm tra ADMIN_EMAILS) ──────────
  const adminUser = await getAdminUser()
  if (!adminUser) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const { orderId } = await params
  const db = createAdminClient()

  // ── Fetch order ────────────────────────────────────────────────────────────
  const { data: order, error: fetchError } = await db
    .from('orders')
    .select('id, status, user_id')
    .eq('id', orderId)
    .single()

  if (fetchError || !order) {
    return NextResponse.json({ error: 'Không tìm thấy đơn hàng.' }, { status: 404 })
  }

  if (order.status !== 'awaiting_review') {
    return NextResponse.json(
      { error: 'order_not_pending_review', currentStatus: order.status },
      { status: 400 }
    )
  }

  // ── (a) Update order → paid ────────────────────────────────────────────────
  const { error: orderUpdateError } = await db
    .from('orders')
    .update({ status: 'paid', paid_at: new Date().toISOString() })
    .eq('id', orderId)

  if (orderUpdateError) {
    console.error('[admin/approve] order update failed:', orderUpdateError)
    return NextResponse.json({ error: 'Cập nhật đơn hàng thất bại.' }, { status: 500 })
  }

  // ── (b) Update profile → pro ───────────────────────────────────────────────
  const proExpiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()

  const { error: profileUpdateError } = await db
    .from('profiles')
    .update({ plan: 'pro', pro_expires_at: proExpiresAt })
    .eq('id', order.user_id)

  if (profileUpdateError) {
    console.error('[admin/approve] profile update failed — cần sửa tay:', {
      orderId,
      userId: order.user_id,
      error: profileUpdateError,
    })
    return NextResponse.json({
      success: true,
      warning: 'profile_update_failed',
      orderId,
      userId: order.user_id,
    })
  }

  return NextResponse.json({ success: true, orderId, plan: 'pro', proExpiresAt })
}
