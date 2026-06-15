import type { CvData } from '../types'

export default function CreativePreview({ data }: { data: CvData }) {
  const { personal, education, skills, projects, activities } = data
  return (
    <div className="mx-auto w-full max-w-[600px] aspect-[210/297] overflow-hidden bg-white text-[#1a1a1a] text-[10px] leading-normal">
      <div className="bg-[#7C3AED] px-8 py-7 text-white">
        <h1 className="text-[24px] font-extrabold leading-tight">{personal.name}</h1>
        <div className="mt-2 flex flex-wrap gap-x-3 gap-y-0.5 text-[9px] text-white/90">
          {personal.email ? <span>✉ {personal.email}</span> : null}
          {personal.phone ? <span>☎ {personal.phone}</span> : null}
        </div>
      </div>

      <div className="px-8 py-6">
        {skills.length > 0 && (
          <section className="mb-4">
            <h2 className="text-[12px] font-extrabold uppercase text-[#7C3AED]">Kỹ năng</h2>
            <div className="mt-0.5 mb-2 h-[3px] w-8 bg-[#DB2777]" />
            <div className="flex flex-wrap gap-1.5">
              {skills.map((s, i) => (
                <span key={i} className="rounded-full bg-[#F3E8FF] text-[#6D28D9] px-2.5 py-[3px] text-[9px] font-medium">{s}</span>
              ))}
            </div>
          </section>
        )}
        {education.length > 0 && (
          <section className="mb-4">
            <h2 className="text-[12px] font-extrabold uppercase text-[#7C3AED]">Học vấn</h2>
            <div className="mt-0.5 mb-2 h-[3px] w-8 bg-[#DB2777]" />
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
            <h2 className="text-[12px] font-extrabold uppercase text-[#7C3AED]">Dự án</h2>
            <div className="mt-0.5 mb-2 h-[3px] w-8 bg-[#DB2777]" />
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
            <h2 className="text-[12px] font-extrabold uppercase text-[#7C3AED]">Hoạt động</h2>
            <div className="mt-0.5 mb-2 h-[3px] w-8 bg-[#DB2777]" />
            {activities.map((a, i) => (
              <p key={i} className="mb-1 text-[9px] text-[#444] leading-relaxed">{a.description}</p>
            ))}
          </section>
        )}
      </div>
    </div>
  )
}
