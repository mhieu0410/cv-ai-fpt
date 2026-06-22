import { redirect } from 'next/navigation'
import AppNavbar from '@/components/AppNavbar'
import CoverLetterClient from './CoverLetterClient'
import { createServerSupabase } from '@/lib/supabase-server'
import { getUserPlan } from '@/lib/user-plan'

export default async function CoverLetterPage() {
  const supabase = await createServerSupabase()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const plan = await getUserPlan(supabase, user.id)
  if (!plan.isPro) {
    redirect('/upgrade')
  }

  return (
    <>
      <AppNavbar />
      <CoverLetterClient />
    </>
  )
}
