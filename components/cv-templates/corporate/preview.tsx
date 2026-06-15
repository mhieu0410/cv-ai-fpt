import type { CvData } from '../types'

export default function CorporatePreview({ data }: { data: CvData }) {
  const { personal, education, skills, projects, activities } = data
  return (
    <div className="mx-auto w-full max-w-[600px] aspect-[210/297] overflow-hidden bg-white text-[#1a1a1a] text-[10px] leading-normal">
      <div className="bg-[#1B2A4A] px-9 py-6 text-white">
        <h1 className="text-[21px] font-bold leading-tight">{personal.name}</h1>
        <div className="mt-1.5 flex flex-wrap gap-x-3 text-[9px] text-white/80">
          {personal.email ? <span>{personal.email}</span> : null}
          {personal.phone ? <span>{personal.phone}</span> : null}
        </div>
      </div>
      <div className="px-9 py-6">
        {education.length > 0 && (
          <section className="mb-4">
            <h2 className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-wide text-[#1B2A4A]"><span className="inline-block h-3 w-[3px] bg-[#1B2A4A]" />Học vấn</h2>
            <div className="mt-2">
              {education.map((e, i) => (
                <div key={i} className="mb-1.5">
                  <p className="font-bold text-[10px]">{e.school}</p>
                  <p className="text-[9px] text-[#666]">{e.major}{e.year ? `  •  ${e.year}` : ''}</p>
                </div>
              ))}
            </div>
          </section>
        )}
        {skills.length > 0 && (
          <section className="mb-4">
            <h2 className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-wide text-[#1B2A4A]"><span className="inline-block h-3 w-[3px] bg-[#1B2A4A]" />Kỹ năng</h2>
            <p className="mt-2 text-[9px] text-[#444] leading-relaxed">{skills.join('  •  ')}</p>
          </section>
        )}
        {projects.length > 0 && (
          <section className="mb-4">
            <h2 className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-wide text-[#1B2A4A]"><span className="inline-block h-3 w-[3px] bg-[#1B2A4A]" />Dự án</h2>
            <div className="mt-2">
              {projects.map((p, i) => (
                <div key={i} className="mb-2">
                  <p className="font-bold text-[10px]">{p.name}</p>
                  <p className="text-[9px] text-[#444] leading-relaxed">{p.description}</p>
                </div>
              ))}
            </div>
          </section>
        )}
        {activities && activities.length > 0 && (
          <section>
            <h2 className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-wide text-[#1B2A4A]"><span className="inline-block h-3 w-[3px] bg-[#1B2A4A]" />Hoạt động</h2>
            <div className="mt-2">
              {activities.map((a, i) => <p key={i} className="mb-1 text-[9px] text-[#444] leading-relaxed">{a.description}</p>)}
            </div>
          </section>
        )}
      </div>
    </div>
  )
}
