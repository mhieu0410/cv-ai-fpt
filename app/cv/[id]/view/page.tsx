import { redirect } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import AppNavbar from '@/components/AppNavbar'
import { getUserPlan } from '@/lib/user-plan'
import { createServerSupabase } from '@/lib/supabase-server'
import CvStudio from './CvStudio'

interface Education { school: string; major: string; year: string }
interface Project   { name: string; description: string }
interface Activity  { description: string }

interface CvContent {
  personal:    { name: string; email: string; phone: string }
  education:   Education[]
  skills:      string[]
  projects:    Project[]
  activities?: Activity[]
}

function formatDateTime(iso: string) {
  return new Date(iso).toLocaleString('vi-VN', {
    day: '2-digit', month: '2-digit', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  })
}

export default async function ViewCvPage({
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
    .select('id, title, content, created_at, template')
    .eq('id', id)
    .eq('user_id', user.id)
    .single()

  if (!cv) redirect('/dashboard?error=cv_not_found')

  const content = cv.content as CvContent
  const { isPro: userIsPro } = await getUserPlan(supabase, user.id)

  return (
    <>
      <AppNavbar />

      <main className="min-h-screen bg-white">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 py-8">
          {/* ── Header ── */}
          <div className="mb-8">
            <Link
              href="/dashboard"
              className="mb-4 inline-flex items-center gap-1.5 text-sm font-medium text-zinc-500 transition-colors hover:text-zinc-900"
            >
              <ArrowLeft className="h-4 w-4" />
              Quay về dashboard
            </Link>
            <h1 className="truncate text-2xl font-semibold tracking-tight text-zinc-900">
              {cv.title}
            </h1>
            <p className="mt-1 text-sm text-zinc-500">
              Cập nhật lúc {formatDateTime(cv.created_at)}
            </p>
          </div>

          {/* ── Studio: live preview + đổi mẫu + hành động ── */}
          <CvStudio
            cvId={id}
            cvTitle={cv.title}
            content={content}
            initialTemplate={cv.template}
            isPro={userIsPro}
          />
        </div>
      </main>
    </>
  )
}
