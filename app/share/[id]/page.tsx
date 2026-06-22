import Link from 'next/link'
import { notFound } from 'next/navigation'
import { createAdminClient } from '@/lib/supabase-admin'
import type { CvData } from '@/components/cv-templates/types'

export const dynamic = 'force-dynamic'

function SectionCard({ heading, children, icon }: { heading: string; children: React.ReactNode; icon: string }) {
  return (
    <div className="bg-white border-4 border-black rounded-3xl p-6 sm:p-8 shadow-[8px_8px_0_0_#000]">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 bg-yellow-300 border-2 border-black rounded-xl flex items-center justify-center text-xl shadow-[2px_2px_0_0_#000] rotate-3">
          {icon}
        </div>
        <h3 className="text-black font-black uppercase text-xl tracking-tight">{heading}</h3>
      </div>
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
    <div className="min-h-screen bg-zinc-50 font-sans selection:bg-yellow-300 selection:text-black">
      {/* Top bar công khai */}
      <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b-4 border-black">
        <div className="max-w-4xl mx-auto px-4 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 group">
            <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center shadow-[2px_2px_0_0_rgba(0,0,0,1)] border-2 border-black group-hover:-translate-y-0.5 transition-transform">
              <svg width="16" height="16" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
                <rect x="4" y="4" width="16" height="16" stroke="black" strokeWidth="4" fill="#C4A1FF" />
                <rect x="12" y="12" width="16" height="16" stroke="black" strokeWidth="4" fill="var(--fpt-orange)" />
              </svg>
            </div>
            <span className="font-black text-black uppercase tracking-tighter text-xl">CV AI</span>
          </Link>
          <Link href="/signup" className="text-[11px] font-black uppercase tracking-widest px-4 py-2 rounded-xl bg-black hover:bg-zinc-800 text-white transition-all shadow-[2px_2px_0_0_var(--fpt-orange)] active:scale-95">
            Tạo CV ngay
          </Link>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-12 sm:py-20">
        <div className="text-center mb-12">
          <span className="inline-block px-4 py-1.5 border-2 border-black bg-white text-black text-[10px] font-black uppercase tracking-widest rounded-full mb-4 shadow-[2px_2px_0_0_#000]">
            Hồ sơ công khai
          </span>
          <p className="text-zinc-500 font-bold text-sm">Bản tóm tắt năng lực do CV AI cung cấp.</p>
        </div>

        {/* Thông tin cá nhân */}
        <div className="bg-[var(--fpt-orange)] border-4 border-black rounded-3xl p-8 sm:p-12 mb-8 shadow-[12px_12px_0_0_#000] relative overflow-hidden">
          {/* Abstract dots */}
          <div className="absolute top-4 right-4 grid grid-cols-3 gap-2 opacity-20 rotate-12">
            {[...Array(9)].map((_, i) => <div key={i} className="w-2 h-2 bg-black rounded-full" />)}
          </div>
          
          <div className="relative z-10">
            <h1 className="text-white text-5xl sm:text-6xl font-black mb-6 tracking-tighter uppercase neo-shadow-text-sm">
              {content.personal?.name || <span className="italic opacity-50">Chưa có tên</span>}
            </h1>
            <div className="flex flex-wrap items-center gap-4 sm:gap-6">
              {content.personal?.email && (
                <div className="flex items-center gap-2 bg-white px-4 py-2 rounded-xl border-2 border-black shadow-[2px_2px_0_0_#000]">
                  <span className="text-lg">📧</span>
                  <span className="text-black font-bold text-sm">{content.personal.email}</span>
                </div>
              )}
              {content.personal?.phone && (
                <div className="flex items-center gap-2 bg-white px-4 py-2 rounded-xl border-2 border-black shadow-[2px_2px_0_0_#000]">
                  <span className="text-lg">📞</span>
                  <span className="text-black font-bold text-sm">{content.personal.phone}</span>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="grid gap-8">
          {content.education?.length > 0 && (
            <SectionCard heading="Học vấn" icon="🎓">
              <ul className="flex flex-col gap-6">
                {content.education.map((edu, i) => (
                  <li key={i} className="flex flex-col sm:flex-row sm:items-baseline sm:justify-between gap-1 sm:gap-4 border-b-2 border-zinc-100 pb-6 last:border-0 last:pb-0">
                    <p className="text-black font-black text-xl uppercase">{edu.school}</p>
                    <div className="text-right">
                      <p className="text-zinc-600 font-bold bg-zinc-100 px-3 py-1 rounded-lg border-2 border-transparent inline-block">{edu.major}</p>
                      {edu.year && <p className="text-zinc-400 font-bold text-sm mt-1">{edu.year}</p>}
                    </div>
                  </li>
                ))}
              </ul>
            </SectionCard>
          )}

          {content.skills?.length > 0 && (
            <SectionCard heading="Kỹ năng" icon="💡">
              <div className="flex flex-wrap gap-3">
                {content.skills.map((skill, i) => (
                  <span key={i} className="px-4 py-2 bg-white border-2 border-black text-black font-black text-sm uppercase rounded-xl shadow-[2px_2px_0_0_#000] hover:translate-y-0.5 hover:shadow-[0px_0px_0_0_#000] transition-all">
                    {skill}
                  </span>
                ))}
              </div>
            </SectionCard>
          )}

          {content.projects?.length > 0 && (
            <SectionCard heading="Dự án" icon="🚀">
              <ul className="flex flex-col gap-8">
                {content.projects.map((proj, i) => (
                  <li key={i} className="bg-zinc-50 border-2 border-black rounded-2xl p-6">
                    <h4 className="text-black font-black text-xl uppercase mb-3 flex items-center gap-2">
                      <span className="text-yellow-500">▹</span> {proj.name}
                    </h4>
                    <p className="text-zinc-600 font-bold text-[15px] leading-relaxed whitespace-pre-line border-l-4 border-black pl-4">
                      {proj.description}
                    </p>
                  </li>
                ))}
              </ul>
            </SectionCard>
          )}

          {content.activities && content.activities.length > 0 && (
            <SectionCard heading="Hoạt động" icon="🌟">
              <ul className="flex flex-col gap-4">
                {content.activities.map((act, i) => (
                  <li key={i} className="flex items-start gap-3 bg-zinc-50 border-2 border-black rounded-xl p-4">
                    <span className="text-xl">✨</span>
                    <p className="text-zinc-700 font-bold text-[15px] leading-relaxed pt-0.5">{act.description}</p>
                  </li>
                ))}
              </ul>
            </SectionCard>
          )}
        </div>

        <div className="mt-16 text-center">
          <Link href="/signup" className="inline-flex items-center justify-center gap-3 px-8 py-5 rounded-2xl bg-black text-white font-black uppercase tracking-widest text-[14px] hover:bg-zinc-800 transition-all shadow-[6px_6px_0_0_var(--fpt-orange)] hover:shadow-[0px_0px_0_0_var(--fpt-orange)] hover:translate-y-1 active:scale-95">
            Tạo CV nổi bật của riêng bạn →
          </Link>
        </div>
      </main>
    </div>
  )
}
