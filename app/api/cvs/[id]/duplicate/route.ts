import { NextResponse } from 'next/server'
import { CONFIG } from '@/lib/config'
import { getUserPlan, countUserCvs } from '@/lib/user-plan'
import { createRouteSupabase } from '@/lib/supabase-server'

export async function POST(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const supabase = await createRouteSupabase()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  // Tôn trọng hạn mức gói Free
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

  const { data: src, error: fetchError } = await supabase
    .from('cvs')
    .select('title, content, template')
    .eq('id', id)
    .eq('user_id', user.id)
    .single()

  if (fetchError || !src) {
    return NextResponse.json({ error: 'CV không tồn tại hoặc bạn không có quyền.' }, { status: 404 })
  }

  const { data, error } = await supabase
    .from('cvs')
    .insert({
      user_id: user.id,
      title: `${src.title} (bản sao)`,
      content: src.content,
      template: src.template ?? 'classic',
    })
    .select('id, title, created_at')
    .single()

  if (error || !data) {
    console.error('[cvs/duplicate] insert failed:', error)
    return NextResponse.json({ error: 'Nhân bản CV thất bại.' }, { status: 500 })
  }

  return NextResponse.json({ cv: data })
}
