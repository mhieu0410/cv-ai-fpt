import type { CvData } from '../types'

function Heading({ children }: { children: React.ReactNode }) {
  return (
    <div className="mb-2">
      <h2 className="text-[12px] font-extrabold uppercase tracking-wide bg-gradient-to-r from-fuchsia-600 to-indigo-600 bg-clip-text text-transparent">
        {children}
      </h2>
      <div className="mt-0.5 h-[3px] w-10 rounded-full bg-gradient-to-r from-fuchsia-500 to-indigo-500" />
    </div>
  )
}

export default function GradientPreview({ data }: { data: CvData }) {
  const { personal, education, skills, projects, activities } = data
  return (
    <div className="mx-auto w-full max-w-[600px] aspect-[210/297] overflow-hidden bg-white text-[#1a1a1a] text-[10px] leading-normal">
      {/* Header */}
      <div className="bg-gradient-to-br from-fuchsia-600 via-purple-600 to-indigo-600 px-8 py-8 text-white">
        <h1 className="text-[26px] font-extrabold leading-tight">{personal.name}</h1>
        <div className="mt-2 flex flex-wrap gap-x-3 gap-y-0.5 text-[9px] text-white/90">
          {personal.email ? <span>✉ {personal.email}</span> : null}
          {personal.phone ? <span>☎ {personal.phone}</span> : null}
        </div>
      </div>

      <div className="px-8 py-6">
        {skills.length > 0 && (
          <section className="mb-4">
            <Heading>Kỹ năng</Heading>
            <div className="flex flex-wrap gap-1.5">
              {skills.map((s, i) => (
                <span key={i} className="rounded-full bg-gradient-to-r from-fuchsia-100 to-indigo-100 text-indigo-700 px-2.5 py-[3px] text-[9px] font-semibold border border-indigo-200">{s}</span>
              ))}
            </div>
          </section>
        )}
        {education.length > 0 && (
          <section className="mb-4">
            <Heading>Học vấn</Heading>
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
            <Heading>Dự án</Heading>
            {projects.map((p, i) => (
              <div key={i} className="mb-2 border-l-2 border-fuchsia-300 pl-2.5">
                <p className="font-bold text-[10px]">{p.name}</p>
                <p className="text-[9px] text-[#444] leading-relaxed">{p.description}</p>
              </div>
            ))}
          </section>
        )}
        {activities && activities.length > 0 && (
          <section>
            <Heading>Hoạt động</Heading>
            {activities.map((a, i) => (
              <p key={i} className="mb-1 text-[9px] text-[#444] leading-relaxed">• {a.description}</p>
            ))}
          </section>
        )}
      </div>
    </div>
  )
}
