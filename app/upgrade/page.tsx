import AppNavbar from '@/components/AppNavbar'
import UpgradeClient from './UpgradeClient'
import { createServerSupabase } from '@/lib/supabase-server'
import { getUserPlan } from '@/lib/user-plan'

export default async function UpgradePage() {
  const supabase = await createServerSupabase()
  const { data: { session } } = await supabase.auth.getSession()
  let isPro = false
  if (session) {
    const planInfo = await getUserPlan(supabase, session.user.id)
    isPro = planInfo.isPro
  }

  return (
    <>
      <AppNavbar />
      <UpgradeClient isPro={isPro} />
    </>
  )
}
