import { NextResponse } from 'next/server'
import { getAdminUser } from '@/lib/admin-auth'
import { createAdminClient } from '@/lib/supabase-admin'

export async function POST(
  request: Request,
  { params }: { params: Promise<{ orderId: string }> }
) {
  // ── Auth: verify admin (reads user cookie + kiểm tra ADMIN_EMAILS) ──────────
  const adminUser = await getAdminUser()
  if (!adminUser) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const { orderId } = await params
  const db = createAdminClient()

  // ── Validate body ──────────────────────────────────────────────────────────
  const body = await request.json().catch(() => ({}))
  const note: string = (body.note ?? '').trim()

  if (note.length < 5) {
    return NextResponse.json(
      { error: 'Lý do từ chối phải có ít nhất 5 ký tự.' },
      { status: 400 }
    )
  }

  // ── Fetch order ────────────────────────────────────────────────────────────
  const { data: order, error: fetchError } = await db
    .from('orders')
    .select('id, status')
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

  // ── Update order → rejected ────────────────────────────────────────────────
  const { error: updateError } = await db
    .from('orders')
    .update({ status: 'rejected', note })
    .eq('id', orderId)

  if (updateError) {
    console.error('[admin/reject] order update failed:', updateError)
    return NextResponse.json({ error: 'Từ chối đơn thất bại.' }, { status: 500 })
  }

  return NextResponse.json({ success: true, orderId })
}
