import Link from 'next/link'
import { notFound } from 'next/navigation'
import { createAdminClient } from '@/lib/supabase-admin'
import type { CvData } from '@/components/cv-templates/types'

export const dynamic = 'force-dynamic'

function SectionCard({ heading, children }: { heading: string; children: React.ReactNode }) {
  return (
    <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6">
      <h3 className="text-violet-400 font-semibold text-base mb-4">{heading}</h3>
      {children}
    </div>
  )
}

export default async function SharedCvPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params

  // Truy cập công khai qua link không-thể-đoán (UUID). Dùng service role để
  // bỏ qua RLS — chỉ trả về đúng nội dung CV mà chủ sở hữu chủ động chia sẻ.
  const db = createAdminClient()
  const { data: cv } = await db
    .from('cvs')
    .select('title, content')
    .eq('id', id)
    .single()

  if (!cv) notFound()

  const content = cv.content as CvData

  return (
    <div className="min-h-screen bg-zinc-950">
      {/* Top bar công khai */}
      <header className="sticky top-0 z-50 bg-zinc-900/80 backdrop-blur border-b border-zinc-800">
        <div className="max-w-3xl mx-auto px-4 h-14 flex items-center justify-between">
          <Link href="/" className="font-semibold text-white">CV AI <span className="text-violet-400">FPT</span></Link>
          <Link href="/signup" className="text-sm px-4 py-2 rounded-lg bg-violet-600 hover:bg-violet-500 text-white transition-colors">
            Tạo CV của bạn
          </Link>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-4 py-10">
        <p className="text-zinc-500 text-xs mb-6 text-center">CV được chia sẻ qua CV AI FPT</p>

        {/* Thông tin cá nhân */}
        <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6 mb-4">
          <p className="text-white text-2xl font-bold mb-3">
            {content.personal?.name || <span className="text-zinc-600 italic">Chưa có tên</span>}
          </p>
          <div className="flex flex-col gap-1.5">
            {content.personal?.email && (
              <span className="text-zinc-400 text-sm flex items-center gap-2"><span aria-hidden="true">📧</span>{content.personal.email}</span>
            )}
            {content.personal?.phone && (
              <span className="text-zinc-400 text-sm flex items-center gap-2"><span aria-hidden="true">📞</span>{content.personal.phone}</span>
            )}
          </div>
        </div>

        <div className="flex flex-col gap-4">
          {content.education?.length > 0 && (
            <SectionCard heading="🎓 Học vấn">
              <ul className="flex flex-col gap-3">
                {content.education.map((edu, i) => (
                  <li key={i} className="flex flex-col gap-0.5">
                    <p className="text-white font-medium">{edu.school}</p>
                    <p className="text-zinc-400 text-sm">{edu.major}{edu.year && <span className="text-zinc-600"> · {edu.year}</span>}</p>
                  </li>
                ))}
              </ul>
            </SectionCard>
          )}

          {content.skills?.length > 0 && (
            <SectionCard heading="💡 Kỹ năng">
              <div className="flex flex-wrap gap-2">
                {content.skills.map((skill, i) => (
                  <span key={i} className="px-3 py-1 bg-zinc-800 border border-zinc-700 text-zinc-300 text-sm rounded-full">{skill}</span>
                ))}
              </div>
            </SectionCard>
          )}

          {content.projects?.length > 0 && (
            <SectionCard heading="🚀 Dự án">
              <ul className="flex flex-col gap-5">
                {content.projects.map((proj, i) => (
                  <li key={i}>
                    <p className="text-white font-semibold mb-1">{proj.name}</p>
                    <p className="text-zinc-400 text-sm leading-relaxed whitespace-pre-line">{proj.description}</p>
                  </li>
                ))}
              </ul>
            </SectionCard>
          )}

          {content.activities && content.activities.length > 0 && (
            <SectionCard heading="🌟 Hoạt động">
              <ul className="flex flex-col gap-2">
                {content.activities.map((act, i) => (
                  <li key={i} className="text-zinc-300 text-sm leading-relaxed">{act.description}</li>
                ))}
              </ul>
            </SectionCard>
          )}
        </div>

        <div className="mt-10 text-center">
          <Link href="/signup" className="inline-block px-6 py-3 rounded-xl bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-500 hover:to-purple-500 text-white font-semibold transition-all">
            Tạo CV miễn phí với CV AI FPT →
          </Link>
        </div>
      </main>
    </div>
  )
}
