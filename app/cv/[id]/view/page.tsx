import { cookies } from 'next/headers'
import { createServerClient } from '@supabase/ssr'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import AppNavbar from '@/components/AppNavbar'
import ViewActions from './ViewActions'

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

function SectionCard({ heading, children }: { heading: string; children: React.ReactNode }) {
  return (
    <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6">
      <h3 className="text-violet-400 font-semibold text-base mb-4">{heading}</h3>
      {children}
    </div>
  )
}

export default async function ViewCvPage({
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
    .select('id, title, content, created_at')
    .eq('id', id)
    .eq('user_id', user.id)
    .single()

  if (!cv) redirect('/dashboard?error=cv_not_found')

  const content = cv.content as CvContent

  return (
    <>
      <AppNavbar />

      <main className="min-h-screen bg-zinc-950 py-10 px-4">
        <div className="max-w-3xl mx-auto">

          {/* ── Page header ── */}
          <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mb-8">
            <div className="min-w-0">
              <h1 className="text-white text-2xl font-bold leading-snug truncate">
                {cv.title}
              </h1>
              <p className="text-zinc-500 text-sm mt-1">
                Tạo lúc {formatDateTime(cv.created_at)}
              </p>
            </div>

            <ViewActions
              cvId={id}
              cvTitle={cv.title}
              content={content}
            />
          </div>

          {/* ── Thông tin cá nhân ── */}
          <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6 mb-4">
            <p className="text-white text-2xl font-bold mb-3">
              {content.personal.name || <span className="text-zinc-600 italic">Chưa có tên</span>}
            </p>
            <div className="flex flex-col gap-1.5">
              {content.personal.email && (
                <span className="text-zinc-400 text-sm flex items-center gap-2">
                  <span className="text-base" aria-hidden="true">📧</span>
                  {content.personal.email}
                </span>
              )}
              {content.personal.phone && (
                <span className="text-zinc-400 text-sm flex items-center gap-2">
                  <span className="text-base" aria-hidden="true">📞</span>
                  {content.personal.phone}
                </span>
              )}
            </div>
          </div>

          <div className="flex flex-col gap-4">
            {/* ── Học vấn ── */}
            {content.education?.length > 0 && (
              <SectionCard heading="🎓 Học vấn">
                <ul className="flex flex-col gap-3">
                  {content.education.map((edu, i) => (
                    <li key={i} className="flex flex-col gap-0.5">
                      <p className="text-white font-medium">{edu.school}</p>
                      <p className="text-zinc-400 text-sm">
                        {edu.major}
                        {edu.year && <span className="text-zinc-600"> · {edu.year}</span>}
                      </p>
                    </li>
                  ))}
                </ul>
              </SectionCard>
            )}

            {/* ── Kỹ năng ── */}
            {content.skills?.length > 0 && (
              <SectionCard heading="💡 Kỹ năng">
                <div className="flex flex-wrap gap-2">
                  {content.skills.map((skill, i) => (
                    <span
                      key={i}
                      className="px-3 py-1 bg-zinc-800 border border-zinc-700 text-zinc-300 text-sm rounded-full"
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              </SectionCard>
            )}

            {/* ── Dự án ── */}
            {content.projects?.length > 0 && (
              <SectionCard heading="🚀 Dự án">
                <ul className="flex flex-col gap-5">
                  {content.projects.map((proj, i) => (
                    <li key={i}>
                      <p className="text-white font-semibold mb-1">{proj.name}</p>
                      <p className="text-zinc-400 text-sm leading-relaxed whitespace-pre-line">
                        {proj.description}
                      </p>
                    </li>
                  ))}
                </ul>
              </SectionCard>
            )}

            {/* ── Hoạt động ── */}
            {content.activities && content.activities.length > 0 && (
              <SectionCard heading="🌟 Hoạt động">
                <ul className="flex flex-col gap-2">
                  {content.activities.map((act, i) => (
                    <li key={i} className="text-zinc-300 text-sm leading-relaxed">
                      {act.description}
                    </li>
                  ))}
                </ul>
              </SectionCard>
            )}
          </div>

          {/* ── Footer ── */}
          <div className="mt-10">
            <Link
              href="/dashboard"
              className="text-zinc-500 hover:text-white text-sm transition-colors"
            >
              ← Quay về dashboard
            </Link>
          </div>

        </div>
      </main>
    </>
  )
}
