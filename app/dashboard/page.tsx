import { cookies } from 'next/headers'
import { createServerClient } from '@supabase/ssr'
import { isAdmin } from '@/lib/admin-auth'
import DashboardClient from './DashboardClient'

export default async function DashboardPage() {
  const cookieStore = await cookies()
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll: () => cookieStore.getAll(),
        setAll: () => {},
      },
    }
  )

  const { data: { user } } = await supabase.auth.getUser()
  const showAdminLink = isAdmin(user?.email)

  return <DashboardClient showAdminLink={showAdminLink} />
}
