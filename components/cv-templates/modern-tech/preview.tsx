import type { CvData } from '../types'

/**
 * Phiên bản HTML/CSS của template Modern Tech dùng cho preview trên web.
 * Bố cục 2 cột, màu sắc, font size và thứ tự section khớp với `pdf.tsx`.
 * Khung tỷ lệ A4, nền trắng giả lập tờ giấy.
 */
export default function ModernTechPreview({ data }: { data: CvData }) {
  const { personal, education, skills, projects, activities } = data

  return (
    <div className="mx-auto flex w-full max-w-[600px] aspect-[1/1.414] overflow-hidden rounded-md bg-white shadow-sm">

      {/* Cột trái — sidebar */}
      <div className="flex w-[35%] flex-col bg-[#F37021] p-5 text-white">
        <h1 className="text-xl font-bold leading-tight text-white">{personal.name}</h1>

        {personal.email ? <p className="mt-3 text-[11px] text-white">Email: {personal.email}</p> : null}
        {personal.phone ? <p className="mt-0.5 text-[11px] text-white">SĐT: {personal.phone}</p> : null}

        <div className="my-3.5 border-t border-white/30" />

        {skills.length > 0 && (
          <div>
            <h2 className="mb-2 text-sm font-bold uppercase tracking-wide text-white">Kỹ năng</h2>
            <ul className="flex flex-col gap-1">
              {skills.map((skill, i) => (
                <li key={i} className="text-[11px] text-white">• {skill}</li>
              ))}
            </ul>
          </div>
        )}
      </div>

      {/* Cột phải — nội dung */}
      <div className="w-[65%] bg-white p-6 text-[#1a1a1a]">

        {/* Học vấn */}
        {education.length > 0 && (
          <section className="mb-4">
            <h2 className="text-base font-bold uppercase text-[#0072BC]">Học vấn</h2>
            <div className="mb-2.5 mt-1 w-9 border-b-2 border-[#00A651]" />
            {education.map((edu, i) => (
              <div key={i} className="mb-1.5">
                <p className="text-sm font-bold text-[#1a1a1a]">{edu.school}</p>
                <p className="mt-0.5 text-xs text-[#666]">
                  {edu.major}{edu.year ? `  •  ${edu.year}` : ''}
                </p>
              </div>
            ))}
          </section>
        )}

        {/* Dự án */}
        {projects.length > 0 && (
          <section className="mb-4">
            <h2 className="text-base font-bold uppercase text-[#0072BC]">Dự án</h2>
            <div className="mb-2.5 mt-1 w-9 border-b-2 border-[#00A651]" />
            {projects.map((proj, i) => (
              <div key={i} className="mb-2">
                <p className="mb-0.5 text-sm font-bold text-[#1a1a1a]">{proj.name}</p>
                <p className="text-xs leading-relaxed text-[#444]">{proj.description}</p>
              </div>
            ))}
          </section>
        )}

        {/* Hoạt động */}
        {activities && activities.length > 0 && (
          <section className="mb-4">
            <h2 className="text-base font-bold uppercase text-[#0072BC]">Hoạt động</h2>
            <div className="mb-2.5 mt-1 w-9 border-b-2 border-[#00A651]" />
            {activities.map((act, i) => (
              <div key={i} className="mb-1">
                <p className="text-xs leading-relaxed text-[#444]">{act.description}</p>
              </div>
            ))}
          </section>
        )}
      </div>
    </div>
  )
}
