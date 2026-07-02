import { redirect } from 'next/navigation'
import AppNavbar from '@/components/AppNavbar'
import MatchForm from '@/components/MatchForm'
import { createServerSupabase } from '@/lib/supabase-server'
import { getUserPlan } from '@/lib/user-plan'

export default async function MatchPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const supabase = await createServerSupabase()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: cv } = await supabase
    .from('cvs')
    .select('id, title, content')
    .eq('id', id)
    .eq('user_id', user.id)
    .single()

  if (!cv) redirect('/dashboard?error=cv_not_found')

  const { isPro } = await getUserPlan(supabase, user.id)

  return (
    <>
      <AppNavbar />
      <MatchForm cvId={cv.id} cvTitle={cv.title} cvContent={cv.content} isPro={isPro} />
    </>
  )
}
