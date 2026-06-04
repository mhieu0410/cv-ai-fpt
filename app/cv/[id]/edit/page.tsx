import { cookies } from 'next/headers'
import { createServerClient } from '@supabase/ssr'
import { redirect } from 'next/navigation'
import AppNavbar from '@/components/AppNavbar'
import CvForm from '@/components/CvForm'

export default async function EditCvPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
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
  if (!user) redirect('/login')

  const { data: cv } = await supabase
    .from('cvs')
    .select('id, title, content')
    .eq('id', id)
    .eq('user_id', user.id)
    .single()

  if (!cv) redirect('/dashboard?error=cv_not_found')

  return (
    <>
      <AppNavbar />
      <CvForm
        mode="edit"
        cvId={id}
        initialData={{ title: cv.title, content: cv.content }}
      />
    </>
  )
}
