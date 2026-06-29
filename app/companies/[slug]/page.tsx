import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import AppNavbar from '@/components/AppNavbar'
import {
  getCompanyBySlug,
  getAllCompanySlugs,
  GROUP_META,
} from '@/lib/companies-data'

export function generateStaticParams() {
  return getAllCompanySlugs().map((slug) => ({ slug }))
}

export async function generateMetadata(
  { params }: { params: Promise<{ slug: string }> }
): Promise<Metadata> {
  const { slug } = await params
  const company = getCompanyBySlug(slug)
  if (!company) return { title: 'Không tìm thấy công ty' }
  return {
    title: `${company.shortName} — Khám phá FPT`,
    description: company.tagline,
  }
}

function fmtDate(iso: string) {
  return new Date(iso).toLocaleDateString('vi-VN', {
    day: '2-digit', month: '2-digit', year: 'numeric',
  })
}

// Section card dùng chung
function Section({
  title,
  emoji,
  children,
}: {
  title: string
  emoji: string
  children: React.ReactNode
}) {
  return (
    <div className="bg-white border-4 border-black rounded-3xl p-6 md:p-8 shadow-[6px_6px_0_0_#000]">
      <h2 className="flex items-center gap-3 text-xl font-black text-black uppercase tracking-tight mb-5">
        <span className="text-2xl">{emoji}</span> {title}
      </h2>
      {children}
    </div>
  )
}

function BulletList({ items }: { items: string[] }) {
  return (
    <ul className="space-y-3">
      {items.map((it) => (
        <li key={it} className="flex items-start gap-3 text-[15px] font-semibold text-zinc-700 leading-relaxed">
          <span className="mt-2 w-2 h-2 shrink-0 bg-[var(--fpt-orange)] border border-black" />
          {it}
        </li>
      ))}
    </ul>
  )
}

export default async function CompanyDetailPage(
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params
  const company = getCompanyBySlug(slug)
  if (!company) notFound()

  const group = GROUP_META[company.group]

  return (
    <>
      <AppNavbar />
      <div className="min-h-screen bg-[#f8f9fa] font-sans pb-24">
        {/* Back */}
        <div className="max-w-4xl mx-auto px-4 sm:px-6 pt-8">
          <Link
            href="/companies"
            className="inline-flex items-center gap-2 text-[13px] font-black uppercase tracking-widest text-black px-4 py-2 border-2 border-black rounded-xl bg-white shadow-[3px_3px_0_0_#000] hover:-translate-y-0.5 hover:shadow-[5px_5px_0_0_#000] transition-all"
          >
            ← Khám phá FPT
          </Link>
        </div>

        {/* Header */}
        <header className="max-w-4xl mx-auto px-4 sm:px-6 pt-8">
          <div className="bg-white border-4 border-black rounded-[2rem] p-6 md:p-10 shadow-[8px_8px_0_0_#000]">
            <div className="flex flex-col sm:flex-row sm:items-center gap-5">
              <div
                className="w-20 h-20 shrink-0 rounded-3xl border-4 border-black flex items-center justify-center font-black text-white text-2xl shadow-[3px_3px_0_0_#000]"
                style={{ backgroundColor: company.accent }}
              >
                {company.logoText}
              </div>
              <div className="min-w-0">
                <span
                  className="inline-block text-[10px] font-black uppercase tracking-widest px-2.5 py-1 rounded border-2 border-black mb-2"
                  style={{ backgroundColor: group.color, color: '#fff' }}
                >
                  {group.label}
                </span>
                <h1 className="text-3xl md:text-4xl font-black text-black tracking-tighter leading-tight">
                  {company.shortName}
                </h1>
                <p className="text-sm font-bold text-zinc-500 mt-1">{company.name}</p>
              </div>
            </div>

            <p className="mt-6 text-lg font-bold text-zinc-700 leading-relaxed border-l-4 border-[var(--fpt-orange)] pl-4">
              {company.tagline}
            </p>

            {/* Quick facts */}
            <div className="mt-6 flex flex-wrap gap-3">
              {company.founded && (
                <div className="px-4 py-2 bg-zinc-100 border-2 border-black rounded-xl">
                  <span className="block text-[10px] font-black uppercase tracking-widest text-zinc-400">Thành lập</span>
                  <span className="font-black text-black">{company.founded}</span>
                </div>
              )}
              {company.website && (
                <a
                  href={company.website}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-4 py-2 bg-yellow-300 border-2 border-black rounded-xl font-black uppercase text-[12px] tracking-widest text-black shadow-[2px_2px_0_0_#000] hover:translate-y-px hover:shadow-none transition-all flex items-center"
                >
                  Website ↗
                </a>
              )}
            </div>

            {company.scale && (
              <p className="mt-5 text-sm font-semibold text-zinc-600 bg-zinc-50 border-2 border-zinc-200 rounded-xl p-4">
                <span className="font-black text-black uppercase text-xs tracking-widest mr-2">Quy mô:</span>
                {company.scale}
              </p>
            )}
          </div>
        </header>

        {/* Body */}
        <main className="max-w-4xl mx-auto px-4 sm:px-6 pt-8 space-y-6">
          <Section title="Lĩnh vực & mô hình kinh doanh" emoji="🏢">
            <BulletList items={company.business} />
            <div className="mt-5 p-4 bg-[#f8f9fa] border-2 border-black rounded-xl">
              <span className="block text-[11px] font-black uppercase tracking-widest text-[var(--fpt-orange)] mb-1">
                Mô hình
              </span>
              <p className="text-[15px] font-semibold text-zinc-700 leading-relaxed">{company.businessModel}</p>
            </div>
          </Section>

          <Section title="Văn hóa & giá trị" emoji="✨">
            <BulletList items={company.culture} />
          </Section>

          <Section title="Vị trí tuyển & phù hợp với ai" emoji="🎯">
            <div className="flex flex-wrap gap-2 mb-5">
              {company.hiring.roles.map((r) => (
                <span
                  key={r}
                  className="text-[13px] font-bold text-black bg-white border-2 border-black rounded-lg px-3 py-1.5 shadow-[2px_2px_0_0_#000]"
                >
                  {r}
                </span>
              ))}
            </div>
            <div className="p-4 bg-green-50 border-2 border-green-600 rounded-xl">
              <span className="block text-[11px] font-black uppercase tracking-widest text-green-700 mb-1">
                Phù hợp với
              </span>
              <p className="text-[15px] font-semibold text-zinc-700 leading-relaxed">{company.hiring.fitFor}</p>
            </div>
          </Section>

          {company.techStack.length > 0 && (
            <Section title="Tech stack & kỹ năng trọng tâm" emoji="🛠">
              <div className="flex flex-wrap gap-2">
                {company.techStack.map((t) => (
                  <span
                    key={t}
                    className="text-[13px] font-black uppercase tracking-wide text-white bg-black rounded-lg px-3 py-1.5"
                  >
                    {t}
                  </span>
                ))}
              </div>
            </Section>
          )}

          {/* ── FPT Insider Secrets ── */}
          {company.insiderSecrets && (
            <div className="bg-black border-4 border-black rounded-[2rem] p-6 md:p-8 shadow-[8px_8px_0_0_var(--fpt-orange)] relative overflow-hidden">
              <div className="absolute top-0 right-0 w-56 h-56 bg-[var(--fpt-orange)] rounded-full blur-[90px] opacity-20 pointer-events-none" />
              <div className="relative z-10">
                <div className="flex items-center gap-3 mb-1">
                  <span className="text-2xl">🔓</span>
                  <h2 className="text-xl md:text-2xl font-black text-white uppercase tracking-tight">
                    FPT Insider Secrets
                  </h2>
                  <span className="text-[10px] font-black uppercase tracking-widest px-2 py-1 rounded bg-[var(--fpt-orange)] text-white border border-white/20">
                    Thực chiến
                  </span>
                </div>
                <p className="text-zinc-400 text-sm font-semibold mb-6">
                  Bí mật cô đọng giúp bạn chuẩn bị tốt hơn — không phải bản sao Wikipedia.
                </p>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {[
                    { emoji: '🎤', title: 'Phỏng vấn ngầm', items: company.insiderSecrets.interview },
                    { emoji: '🤝', title: 'Luật ngầm văn hóa STCo', items: company.insiderSecrets.culture },
                    { emoji: '💼', title: 'Đặc thù công việc', items: company.insiderSecrets.jobNature },
                  ].map((blk) => (
                    <div
                      key={blk.title}
                      className="bg-white/5 border-2 border-white/15 rounded-2xl p-5 backdrop-blur-sm"
                    >
                      <h3 className="flex items-center gap-2 text-[13px] font-black uppercase tracking-widest text-yellow-400 mb-4">
                        <span className="text-lg">{blk.emoji}</span> {blk.title}
                      </h3>
                      <ul className="space-y-3">
                        {blk.items.map((it) => (
                          <li key={it} className="flex items-start gap-2 text-[14px] font-medium text-zinc-200 leading-relaxed">
                            <span className="mt-1.5 w-1.5 h-1.5 shrink-0 bg-[var(--fpt-orange)] rounded-full" />
                            {it}
                          </li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </div>

                <p className="mt-6 text-[11px] text-zinc-500 font-medium leading-relaxed border-t border-white/10 pt-4">
                  ⚠️ Đây là kinh nghiệm tham khảo từ cộng đồng, KHÔNG phải quy trình chính thức của công ty và có thể thay đổi theo thời điểm/vị trí.
                </p>
              </div>
            </div>
          )}

          {/* Sources + last updated */}
          <div className="bg-zinc-100 border-2 border-zinc-300 rounded-2xl p-5">
            <p className="text-[11px] font-black uppercase tracking-widest text-zinc-500 mb-2">
              Nguồn tham khảo · Cập nhật {fmtDate(company.lastUpdated)}
            </p>
            <ul className="space-y-1">
              {company.sources.map((s) => (
                <li key={s.url}>
                  <a
                    href={s.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm font-semibold text-zinc-600 hover:text-[var(--fpt-orange)] underline underline-offset-2 break-words"
                  >
                    {s.label}
                  </a>
                </li>
              ))}
            </ul>
            <p className="mt-3 text-[11px] text-zinc-400 font-medium leading-relaxed">
              Thông tin tổng hợp từ nguồn công khai chính thống, mang tính tham khảo. Số liệu có thể thay đổi theo thời gian.
            </p>
          </div>

          {/* CTA về CV */}
          <div className="bg-black border-4 border-black rounded-[2rem] p-8 text-center shadow-[8px_8px_0_0_var(--fpt-orange)]">
            <h3 className="text-2xl font-black text-white uppercase tracking-tight mb-3">
              Sẵn sàng ứng tuyển {company.shortName}?
            </h3>
            <p className="text-zinc-300 font-semibold mb-6 max-w-md mx-auto">
              Tạo CV nhắm đúng kỹ năng đơn vị này cần và đối chiếu với JD cụ thể.
            </p>
            <Link
              href="/dashboard"
              className="inline-block py-3.5 px-8 bg-[var(--fpt-orange)] text-white font-black uppercase text-sm tracking-widest rounded-2xl border-2 border-black shadow-[4px_4px_0_0_#fff] hover:-translate-y-1 hover:shadow-[6px_6px_0_0_#fff] active:translate-y-0 active:shadow-none transition-all"
            >
              Tạo CV ngay →
            </Link>
          </div>
        </main>
      </div>
    </>
  )
}
