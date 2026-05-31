import { NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

export async function POST(
  request: Request,
  { params }: { params: Promise<{ orderId: string }> }
) {
  const { orderId } = await params
  const cookieStore = await cookies()

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll: () => cookieStore.getAll(),
        setAll: (toSet) => {
          for (const { name, value, options } of toSet) {
            cookieStore.set(name, value, options)
          }
        },
      },
    }
  )

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const body = await request.json().catch(() => ({}))
  const bankTxnId: string = (body.bank_txn_id ?? '').trim()

  if (bankTxnId.length < 4) {
    return NextResponse.json(
      { error: 'Mã giao dịch phải có ít nhất 4 ký tự.' },
      { status: 400 }
    )
  }

  // Verify order exists, belongs to user, and is still pending
  const { data: order, error: fetchError } = await supabase
    .from('orders')
    .select('id, status')
    .eq('id', orderId)
    .eq('user_id', user.id)
    .single()

  if (fetchError || !order) {
    return NextResponse.json({ error: 'Không tìm thấy đơn hàng.' }, { status: 404 })
  }

  if (order.status !== 'pending') {
    return NextResponse.json(
      { error: 'Đơn này không ở trạng thái chờ thanh toán.' },
      { status: 409 }
    )
  }

  const { error: updateError } = await supabase
    .from('orders')
    .update({ status: 'awaiting_review', bank_txn_id: bankTxnId })
    .eq('id', orderId)
    .eq('user_id', user.id)

  if (updateError) {
    console.error('[orders/confirm] update failed:', updateError)
    return NextResponse.json(
      { error: 'Xác nhận thất bại. Vui lòng thử lại.' },
      { status: 500 }
    )
  }

  return NextResponse.json({ status: 'awaiting_review' })
}
