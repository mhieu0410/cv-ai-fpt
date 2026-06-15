import { redirect } from 'next/navigation'
import AppNavbar from '@/components/AppNavbar'
import MatchForm from '@/components/MatchForm'
import { createServerSupabase } from '@/lib/supabase-server'

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
    .select('id, title')
    .eq('id', id)
    .eq('user_id', user.id)
    .single()

  if (!cv) redirect('/dashboard?error=cv_not_found')

  return (
    <>
      <AppNavbar />
      <MatchForm cvId={cv.id} cvTitle={cv.title} />
    </>
  )
}
