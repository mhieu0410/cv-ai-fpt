import type { CvData } from '../types'

export default function ElegantPreview({ data }: { data: CvData }) {
  const { personal, education, skills, projects, activities } = data
  return (
    <div className="mx-auto w-full max-w-[600px] aspect-[210/297] overflow-hidden bg-white text-[#2a2a2a] px-12 py-10 text-[10px] leading-normal">
      <div className="text-center">
        <h1 className="text-[22px] font-semibold tracking-[0.18em] uppercase text-[#3a3a3a]">{personal.name}</h1>
        <div className="mt-2 flex justify-center gap-3 text-[9px] text-[#8B7355]">
          {personal.email ? <span>{personal.email}</span> : null}
          {personal.phone ? <span>{personal.phone}</span> : null}
        </div>
        <div className="mx-auto mt-3 h-px w-20 bg-[#B08D57]" />
      </div>

      {education.length > 0 && (
        <section className="mt-5 text-center">
          <h2 className="text-[10px] font-semibold uppercase tracking-[0.25em] text-[#B08D57]">Học vấn</h2>
          <div className="mt-2">
            {education.map((e, i) => (
              <div key={i} className="mb-1.5">
                <p className="font-semibold text-[10px]">{e.school}</p>
                <p className="text-[9px] text-[#777] italic">{e.major}{e.year ? `  •  ${e.year}` : ''}</p>
              </div>
            ))}
          </div>
        </section>
      )}
      {skills.length > 0 && (
        <section className="mt-5 text-center">
          <h2 className="text-[10px] font-semibold uppercase tracking-[0.25em] text-[#B08D57]">Kỹ năng</h2>
          <p className="mt-2 text-[9px] text-[#444] leading-relaxed">{skills.join('  ·  ')}</p>
        </section>
      )}
      {projects.length > 0 && (
        <section className="mt-5">
          <h2 className="text-center text-[10px] font-semibold uppercase tracking-[0.25em] text-[#B08D57]">Dự án</h2>
          <div className="mt-2">
            {projects.map((p, i) => (
              <div key={i} className="mb-2 text-center">
                <p className="font-semibold text-[10px]">{p.name}</p>
                <p className="text-[9px] text-[#555] leading-relaxed">{p.description}</p>
              </div>
            ))}
          </div>
        </section>
      )}
      {activities && activities.length > 0 && (
        <section className="mt-5 text-center">
          <h2 className="text-[10px] font-semibold uppercase tracking-[0.25em] text-[#B08D57]">Hoạt động</h2>
          <div className="mt-2">
            {activities.map((a, i) => <p key={i} className="mb-1 text-[9px] text-[#555] leading-relaxed">{a.description}</p>)}
          </div>
        </section>
      )}
    </div>
  )
}
