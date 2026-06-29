import type { CvData } from '../types'

const TEAL = '#0F766E'

export default function SidebarPreview({ data }: { data: CvData }) {
  const { personal, education, skills, projects, activities } = data
  return (
    <div className="mx-auto w-full max-w-[600px] aspect-[210/297] overflow-hidden bg-white text-[#1a1a1a] text-[10px] leading-normal flex">
      {/* ── Cột trái (màu đậm) ── */}
      <div className="w-[36%] shrink-0 text-white px-4 py-6" style={{ backgroundColor: TEAL }}>
        <h1 className="text-[18px] font-extrabold leading-tight">{personal.name}</h1>

        <div className="mt-4">
          <h2 className="text-[10px] font-extrabold uppercase tracking-wide text-white/70 mb-1.5">Liên hệ</h2>
          <div className="flex flex-col gap-1 text-[9px] text-white/95 break-words">
            {personal.email ? <span>✉ {personal.email}</span> : null}
            {personal.phone ? <span>☎ {personal.phone}</span> : null}
          </div>
        </div>

        {skills.length > 0 && (
          <div className="mt-5">
            <h2 className="text-[10px] font-extrabold uppercase tracking-wide text-white/70 mb-1.5">Kỹ năng</h2>
            <div className="flex flex-wrap gap-1">
              {skills.map((s, i) => (
                <span key={i} className="rounded bg-white/15 px-1.5 py-[2px] text-[8.5px] font-medium">{s}</span>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* ── Cột phải (nội dung) ── */}
      <div className="flex-1 px-5 py-6">
        {education.length > 0 && (
          <section className="mb-4">
            <h2 className="text-[12px] font-extrabold uppercase" style={{ color: TEAL }}>Học vấn</h2>
            <div className="mt-0.5 mb-2 h-[2px] w-8" style={{ backgroundColor: TEAL }} />
            {education.map((e, i) => (
              <div key={i} className="mb-1.5">
                <p className="font-bold text-[10px]">{e.school}</p>
                <p className="text-[9px] text-[#666]">{e.major}{e.year ? `  •  ${e.year}` : ''}</p>
              </div>
            ))}
          </section>
        )}
        {projects.length > 0 && (
          <section className="mb-4">
            <h2 className="text-[12px] font-extrabold uppercase" style={{ color: TEAL }}>Dự án</h2>
            <div className="mt-0.5 mb-2 h-[2px] w-8" style={{ backgroundColor: TEAL }} />
            {projects.map((p, i) => (
              <div key={i} className="mb-2">
                <p className="font-bold text-[10px]">{p.name}</p>
                <p className="text-[9px] text-[#444] leading-relaxed">{p.description}</p>
              </div>
            ))}
          </section>
        )}
        {activities && activities.length > 0 && (
          <section>
            <h2 className="text-[12px] font-extrabold uppercase" style={{ color: TEAL }}>Hoạt động</h2>
            <div className="mt-0.5 mb-2 h-[2px] w-8" style={{ backgroundColor: TEAL }} />
            {activities.map((a, i) => (
              <p key={i} className="mb-1 text-[9px] text-[#444] leading-relaxed">• {a.description}</p>
            ))}
          </section>
        )}
      </div>
    </div>
  )
}
