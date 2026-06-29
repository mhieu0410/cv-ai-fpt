import type { CvData } from '../types'

function Heading({ children }: { children: React.ReactNode }) {
  return (
    <h2 className="inline-block bg-[#FCD34D] border-2 border-black px-2.5 py-0.5 text-[11px] font-black uppercase tracking-wide shadow-[3px_3px_0_0_#000]">
      {children}
    </h2>
  )
}

export default function NeoBrutalPreview({ data }: { data: CvData }) {
  const { personal, education, skills, projects, activities } = data
  return (
    <div className="mx-auto w-full max-w-[600px] aspect-[210/297] overflow-hidden bg-[#FFFDF5] text-[#0a0a0a] text-[10px] leading-normal p-6">
      {/* Header */}
      <div className="border-[3px] border-black bg-[#f26f21] p-4 shadow-[6px_6px_0_0_#000]">
        <h1 className="text-[26px] font-black uppercase leading-none text-white">{personal.name}</h1>
        <div className="mt-3 flex flex-wrap gap-2">
          {personal.email ? <span className="bg-white border-2 border-black px-2 py-0.5 text-[9px] font-bold">✉ {personal.email}</span> : null}
          {personal.phone ? <span className="bg-white border-2 border-black px-2 py-0.5 text-[9px] font-bold">☎ {personal.phone}</span> : null}
        </div>
      </div>

      <div className="mt-5 flex flex-col gap-4">
        {skills.length > 0 && (
          <section>
            <Heading>Kỹ năng</Heading>
            <div className="mt-2.5 flex flex-wrap gap-1.5">
              {skills.map((s, i) => (
                <span key={i} className="border-2 border-black bg-white px-2 py-0.5 text-[9px] font-bold shadow-[2px_2px_0_0_#000]">{s}</span>
              ))}
            </div>
          </section>
        )}
        {education.length > 0 && (
          <section>
            <Heading>Học vấn</Heading>
            <div className="mt-2.5 border-2 border-black bg-white p-2.5 shadow-[3px_3px_0_0_#000]">
              {education.map((e, i) => (
                <div key={i} className={i ? 'mt-1.5' : ''}>
                  <p className="font-black text-[10px]">{e.school}</p>
                  <p className="text-[9px] text-[#555]">{e.major}{e.year ? `  •  ${e.year}` : ''}</p>
                </div>
              ))}
            </div>
          </section>
        )}
        {projects.length > 0 && (
          <section>
            <Heading>Dự án</Heading>
            <div className="mt-2.5 flex flex-col gap-2">
              {projects.map((p, i) => (
                <div key={i} className="border-2 border-black bg-white p-2.5 shadow-[3px_3px_0_0_#000]">
                  <p className="font-black text-[10px]">{p.name}</p>
                  <p className="text-[9px] text-[#444] leading-relaxed">{p.description}</p>
                </div>
              ))}
            </div>
          </section>
        )}
        {activities && activities.length > 0 && (
          <section>
            <Heading>Hoạt động</Heading>
            <div className="mt-2.5 border-2 border-black bg-white p-2.5 shadow-[3px_3px_0_0_#000]">
              {activities.map((a, i) => (
                <p key={i} className={`text-[9px] text-[#444] leading-relaxed ${i ? 'mt-1' : ''}`}>• {a.description}</p>
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  )
}
