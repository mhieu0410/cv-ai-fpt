import { NextResponse } from 'next/server'
import { CONFIG } from '@/lib/config'
import { getUserPlan, countUserCvs } from '@/lib/user-plan'
import { createRouteSupabase } from '@/lib/supabase-server'

export async function POST(request: Request) {
  const supabase = await createRouteSupabase()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const plan = await getUserPlan(supabase, user.id)
  if (!plan.isPro) {
    const count = await countUserCvs(supabase, user.id)
    if (count >= CONFIG.freeCvLimit) {
      return NextResponse.json(
        { error: 'free_limit_reached', limit: CONFIG.freeCvLimit, current: count },
        { status: 403 }
      )
    }
  }

  const body = await request.json().catch(() => ({}))
  const { title, content } = body

  if (!title || typeof title !== 'string' || !title.trim()) {
    return NextResponse.json({ error: 'Tiêu đề không hợp lệ.' }, { status: 400 })
  }

  const { data, error } = await supabase
    .from('cvs')
    .insert({ title: title.trim(), content, user_id: user.id })
    .select('id, title, created_at')
    .single()

  if (error) {
    console.error('[cvs/create] insert failed:', error)
    return NextResponse.json({ error: 'Lưu CV thất bại.' }, { status: 500 })
  }

  return NextResponse.json({ cv: data })
}
