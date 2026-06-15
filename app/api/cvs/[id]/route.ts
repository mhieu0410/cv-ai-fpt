import { NextResponse } from 'next/server'
import { createRouteSupabase } from '@/lib/supabase-server'

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const supabase = await createRouteSupabase()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const body = await request.json().catch(() => ({}))
  const { title, content } = body

  if (!title || typeof title !== 'string' || !title.trim()) {
    return NextResponse.json({ error: 'Tiêu đề không hợp lệ.' }, { status: 400 })
  }

  const { data, error } = await supabase
    .from('cvs')
    .update({ title: title.trim(), content })
    .eq('id', id)
    .eq('user_id', user.id)
    .select('id, title, created_at')
    .single()

  if (error || !data) {
    if (error?.code === 'PGRST116') {
      return NextResponse.json(
        { error: 'CV không tồn tại hoặc bạn không có quyền chỉnh sửa.' },
        { status: 404 }
      )
    }
    console.error('[cvs/update] error:', error)
    return NextResponse.json({ error: 'Cập nhật CV thất bại.' }, { status: 500 })
  }

  return NextResponse.json({ success: true, cv: data })
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const supabase = await createRouteSupabase()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  // .eq('user_id') đảm bảo user chỉ xoá được CV của chính mình (ownership check)
  const { data, error } = await supabase
    .from('cvs')
    .delete()
    .eq('id', id)
    .eq('user_id', user.id)
    .select('id')
    .single()

  if (error || !data) {
    if (error?.code === 'PGRST116') {
      return NextResponse.json(
        { error: 'CV không tồn tại hoặc bạn không có quyền xoá.' },
        { status: 404 }
      )
    }
    console.error('[cvs/delete] error:', error)
    return NextResponse.json({ error: 'Xoá CV thất bại.' }, { status: 500 })
  }

  return NextResponse.json({ success: true })
}
