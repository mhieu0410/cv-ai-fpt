import { NextResponse } from 'next/server'

// ⚠️ DEPRECATED & DISABLED
// Endpoint này trước đây tự động set order = 'paid' và nâng profile lên 'pro'
// ngay khi user bấm nút, BỎ QUA bước admin đối soát. Đó là lỗ hổng cho phép
// người dùng tự nâng cấp Pro mà không cần thanh toán được duyệt.
//
// Quy trình đúng:
//   1. User nhập mã giao dịch  -> POST /api/orders/[orderId]/confirm  (status: awaiting_review)
//   2. Admin đối soát ngân hàng -> POST /api/admin/orders/[orderId]/approve (status: paid + nâng Pro)
//
// Giữ lại file để mọi request cũ tới /verify đều bị từ chối an toàn.
export async function POST() {
  return NextResponse.json(
    {
      error:
        'Endpoint không còn được hỗ trợ. Vui lòng xác nhận giao dịch qua /api/orders/[orderId]/confirm.',
    },
    { status: 410 }
  )
}
