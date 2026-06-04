import { NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
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
