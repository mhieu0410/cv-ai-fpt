import type { CvData } from '../types'

/**
 * Phiên bản HTML/CSS của template Classic dùng cho preview trên web.
 * Bố cục, thứ tự section, font size và màu khớp với `pdf.tsx`.
 * Khung tỷ lệ A4 (210:297), nền trắng giả lập tờ giấy.
 */
export default function ClassicPreview({ data }: { data: CvData }) {
  const { personal, education, skills, projects, activities } = data

  return (
    <div className="mx-auto w-full max-w-[600px] aspect-[210/297] overflow-hidden bg-white text-[#1a1a1a] shadow-sm px-10 py-9 text-[10px] leading-normal">
      {/* Header */}
      <h1 className="text-[20px] font-bold mb-1 leading-tight">{personal.name}</h1>
      {personal.email ? <p className="text-[9px] text-[#555] mb-0.5">{personal.email}</p> : null}
      {personal.phone ? <p className="text-[9px] text-[#555] mb-0.5">{personal.phone}</p> : null}

      <div className="border-b border-[#d0d0d0] my-2.5" />

      {/* Học vấn */}
      {education.length > 0 && (
        <section className="mb-3.5">
          <h2 className="text-[11px] font-bold uppercase tracking-wide mb-1.5 text-[#111]">Học vấn</h2>
          {education.map((edu, i) => (
            <div key={i} className="mb-1.5">
              <p className="text-[10px] font-bold">{edu.school}</p>
              <p className="text-[9px] text-[#444] mt-px">
                {edu.major}{edu.year ? `  •  ${edu.year}` : ''}
              </p>
            </div>
          ))}
        </section>
      )}

      {/* Kỹ năng */}
      {skills.length > 0 && (
        <section className="mb-3.5">
          <h2 className="text-[11px] font-bold uppercase tracking-wide mb-1.5 text-[#111]">Kỹ năng</h2>
          <div className="flex flex-wrap gap-1">
            {skills.map((skill, i) => (
              <span
                key={i}
                className="text-[9px] bg-[#f0f0f0] text-[#333] rounded px-[7px] py-[3px]"
              >
                {skill}
              </span>
            ))}
          </div>
        </section>
      )}

      {/* Dự án */}
      {projects.length > 0 && (
        <section className="mb-3.5">
          <h2 className="text-[11px] font-bold uppercase tracking-wide mb-1.5 text-[#111]">Dự án</h2>
          {projects.map((proj, i) => (
            <div key={i} className="mb-2">
              <p className="text-[10px] font-bold mb-0.5">{proj.name}</p>
              <p className="text-[9px] text-[#444] leading-relaxed">{proj.description}</p>
            </div>
          ))}
        </section>
      )}

      {/* Hoạt động */}
      {activities && activities.length > 0 && (
        <section className="mb-3.5">
          <h2 className="text-[11px] font-bold uppercase tracking-wide mb-1.5 text-[#111]">Hoạt động</h2>
          {activities.map((act, i) => (
            <div key={i} className="mb-1">
              <p className="text-[9px] text-[#444] leading-relaxed">{act.description}</p>
            </div>
          ))}
        </section>
      )}
    </div>
  )
}
