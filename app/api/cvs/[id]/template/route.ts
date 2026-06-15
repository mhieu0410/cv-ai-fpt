import { NextResponse } from 'next/server'
import { getTemplate, listTemplates } from '@/components/cv-templates/registry'
import { getUserPlan } from '@/lib/user-plan'
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
  const { template } = body

  const validIds = listTemplates().map((t) => t.id)
  if (typeof template !== 'string' || !validIds.includes(template)) {
    return NextResponse.json({ error: 'invalid_template' }, { status: 400 })
  }

  const { data: cv } = await supabase
    .from('cvs')
    .select('id')
    .eq('id', id)
    .eq('user_id', user.id)
    .single()

  if (!cv) {
    return NextResponse.json({ error: 'not_found' }, { status: 404 })
  }

  const meta = getTemplate(template)
  if (meta.isPro) {
    const plan = await getUserPlan(supabase, user.id)
    if (!plan.isPro) {
      return NextResponse.json({ error: 'pro_required' }, { status: 403 })
    }
  }

  const { error } = await supabase
    .from('cvs')
    .update({ template })
    .eq('id', id)
    .eq('user_id', user.id)

  if (error) {
    console.error('[cvs/template] error:', error)
    return NextResponse.json({ error: 'update_failed' }, { status: 500 })
  }

  return NextResponse.json({ success: true, template })
}
