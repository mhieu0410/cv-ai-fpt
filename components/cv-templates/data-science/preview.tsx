import type { CvData } from '../types'

export default function DataSciencePreview({ data }: { data: CvData }) {
  const { personal, education, skills, projects, activities } = data
  return (
    <div className="mx-auto w-full max-w-[600px] aspect-[210/297] overflow-hidden bg-white text-[#1a1a1a] text-[10px] leading-normal">
      <div className="bg-[#0F172A] px-8 py-7">
        <h1 className="text-[22px] font-bold text-white leading-tight">{personal.name}</h1>
        <div className="mt-2 flex flex-wrap gap-x-3 text-[9px] text-[#22D3EE] font-mono">
          {personal.email ? <span>{personal.email}</span> : null}
          {personal.phone ? <span>{personal.phone}</span> : null}
        </div>
      </div>
      <div className="px-8 py-6">
        {skills.length > 0 && (
          <section className="mb-4">
            <h2 className="text-[11px] font-bold uppercase tracking-wide text-[#0F172A]"><span className="text-[#06B6D4]">{'// '}</span>Kỹ năng</h2>
            <div className="mt-2 flex flex-wrap gap-1.5">
              {skills.map((sk, i) => (
                <span key={i} className="border border-[#06B6D4]/40 bg-[#ECFEFF] text-[#0E7490] rounded px-2 py-[2px] text-[9px] font-mono">{sk}</span>
              ))}
            </div>
          </section>
        )}
        {education.length > 0 && (
          <section className="mb-4">
            <h2 className="text-[11px] font-bold uppercase tracking-wide text-[#0F172A]"><span className="text-[#06B6D4]">{'// '}</span>Học vấn</h2>
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
        {projects.length > 0 && (
          <section className="mb-4">
            <h2 className="text-[11px] font-bold uppercase tracking-wide text-[#0F172A]"><span className="text-[#06B6D4]">{'// '}</span>Dự án</h2>
            <div className="mt-2">
              {projects.map((p, i) => (
                <div key={i} className="mb-2 border-l-2 border-[#06B6D4] pl-2.5">
                  <p className="font-bold text-[10px]">{p.name}</p>
                  <p className="text-[9px] text-[#444] leading-relaxed">{p.description}</p>
                </div>
              ))}
            </div>
          </section>
        )}
        {activities && activities.length > 0 && (
          <section>
            <h2 className="text-[11px] font-bold uppercase tracking-wide text-[#0F172A]"><span className="text-[#06B6D4]">{'// '}</span>Hoạt động</h2>
            <div className="mt-2">
              {activities.map((a, i) => <p key={i} className="mb-1 text-[9px] text-[#444] leading-relaxed">{a.description}</p>)}
            </div>
          </section>
        )}
      </div>
    </div>
  )
}
