import { redirect } from 'next/navigation'
import CvForm from '@/components/CvForm'
import { createServerSupabase } from '@/lib/supabase-server'

export default async function EditCvPage({
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
    .select('id, title, content, template')
    .eq('id', id)
    .eq('user_id', user.id)
    .single()

  if (!cv) redirect('/dashboard?error=cv_not_found')

  return (
    <CvForm
      mode="edit"
      cvId={id}
      initialData={{ title: cv.title, content: cv.content, template: cv.template || 'classic' }}
    />
  )
}
