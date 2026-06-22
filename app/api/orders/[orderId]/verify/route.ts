import { NextRequest, NextResponse } from 'next/server'
import { createRouteSupabase } from '@/lib/supabase-server'
import { createClient } from '@supabase/supabase-js'

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ orderId: string }> }
) {
  const { orderId } = await params
  const supabase = await createRouteSupabase()

  // Verify auth
  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  // Find order
  const { data: order, error: orderError } = await supabase
    .from('orders')
    .select('id, status, plan, amount')
    .eq('id', orderId)
    .eq('user_id', user.id)
    .single()

  if (orderError || !order) {
    return NextResponse.json({ error: 'Order not found' }, { status: 404 })
  }

  if (order.status === 'paid') {
    return NextResponse.json({ message: 'Order already paid' })
  }

  // Update Order to paid
  const adminAuthClient = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )

  const { error: updateOrderError } = await adminAuthClient
    .from('orders')
    .update({ 
      status: 'paid', 
      paid_at: new Date().toISOString(),
      note: 'Xác nhận thanh toán thành công (Simulated)'
    })
    .eq('id', orderId)

  if (updateOrderError) {
    console.error('Update order error:', updateOrderError)
    return NextResponse.json({ error: 'Failed to update order' }, { status: 500 })
  }

  // Update Profile to Pro (add 30 days)
  const MS_PER_DAY = 1000 * 60 * 60 * 24
  const expiresAt = new Date(Date.now() + 30 * MS_PER_DAY).toISOString()

  const { error: updateProfileError } = await adminAuthClient
    .from('profiles')
    .update({ 
      plan: 'pro',
      pro_expires_at: expiresAt
    })
    .eq('id', user.id)

  if (updateProfileError) {
    console.error('Update profile error:', updateProfileError)
    return NextResponse.json({ error: 'Failed to upgrade profile' }, { status: 500 })
  }

  return NextResponse.json({ success: true, expiresAt })
}
