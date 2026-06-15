import type { CvData } from '../types'

export default function BusinessPreview({ data }: { data: CvData }) {
  const { personal, education, skills, projects, activities } = data
  return (
    <div className="mx-auto w-full max-w-[600px] aspect-[210/297] overflow-hidden bg-white text-[#1a1a1a] px-10 py-9 text-[10px] leading-normal">
      <h1 className="text-[22px] font-bold text-[#1E3A5F] leading-tight">{personal.name}</h1>
      <div className="mt-1 flex flex-wrap gap-x-3 text-[9px] text-[#555]">
        {personal.email ? <span>{personal.email}</span> : null}
        {personal.phone ? <span>• {personal.phone}</span> : null}
      </div>
      <div className="mt-3 border-b-2 border-[#1E3A5F]" />

      {education.length > 0 && (
        <section className="mt-4">
          <h2 className="text-[11px] font-bold uppercase tracking-wide text-[#1E3A5F] border-b border-[#d6dde6] pb-1 mb-2">Học vấn</h2>
          {education.map((e, i) => (
            <div key={i} className="mb-1.5">
              <p className="font-bold text-[10px]">{e.school}</p>
              <p className="text-[9px] text-[#666]">{e.major}{e.year ? `  •  ${e.year}` : ''}</p>
            </div>
          ))}
        </section>
      )}
      {skills.length > 0 && (
        <section className="mt-4">
          <h2 className="text-[11px] font-bold uppercase tracking-wide text-[#1E3A5F] border-b border-[#d6dde6] pb-1 mb-2">Kỹ năng</h2>
          <div className="flex flex-wrap gap-1.5">
            {skills.map((sk, i) => (
              <span key={i} className="border border-[#1E3A5F]/30 text-[#1E3A5F] rounded px-2 py-[2px] text-[9px]">{sk}</span>
            ))}
          </div>
        </section>
      )}
      {projects.length > 0 && (
        <section className="mt-4">
          <h2 className="text-[11px] font-bold uppercase tracking-wide text-[#1E3A5F] border-b border-[#d6dde6] pb-1 mb-2">Dự án</h2>
          {projects.map((p, i) => (
            <div key={i} className="mb-2">
              <p className="font-bold text-[10px]">{p.name}</p>
              <p className="text-[9px] text-[#444] leading-relaxed">{p.description}</p>
            </div>
          ))}
        </section>
      )}
      {activities && activities.length > 0 && (
        <section className="mt-4">
          <h2 className="text-[11px] font-bold uppercase tracking-wide text-[#1E3A5F] border-b border-[#d6dde6] pb-1 mb-2">Hoạt động</h2>
          {activities.map((a, i) => <p key={i} className="mb-1 text-[9px] text-[#444] leading-relaxed">{a.description}</p>)}
        </section>
      )}
    </div>
  )
}
