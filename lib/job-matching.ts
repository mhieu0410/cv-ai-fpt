import type { CvData } from '@/components/cv-templates/types'
import { COMPANIES, GROUP_META } from '@/lib/companies-data'

// ============================================================================
// Gợi ý & xếp hạng công việc phù hợp với CV — chạy hoàn toàn cục bộ (không AI).
// Nguồn: (1) vị trí thật của các công ty con FPT, (2) bộ role chung curated.
// AI (rankcv service qua /api/match) chỉ được gọi khi user bấm vào 1 việc.
// ============================================================================

export interface JobCandidate {
  id: string
  title: string
  company?: string
  category: string
  skills: string[]
  source: 'fpt' | 'general'
  /** Mô tả ngắn dùng để dựng JD gửi cho AI so khớp */
  summary: string
}

export interface RankedJob {
  job: JobCandidate
  matchPercent: number
  matched: string[]
  missing: string[]
}

// ── Bộ role chung (ngoài FPT) ───────────────────────────────────────────────
const GENERAL_ROLES: JobCandidate[] = [
  { id: 'g-frontend', title: 'Frontend Developer', category: 'Công nghệ', source: 'general', skills: ['HTML', 'CSS', 'JavaScript', 'TypeScript', 'React', 'Next.js', 'TailwindCSS'], summary: 'Xây dựng giao diện web, tối ưu trải nghiệm người dùng và hiệu năng.' },
  { id: 'g-backend', title: 'Backend Developer', category: 'Công nghệ', source: 'general', skills: ['Java', 'Spring Boot', 'Node.js', 'REST API', 'MySQL', 'PostgreSQL', 'Docker'], summary: 'Phát triển API, xử lý logic nghiệp vụ và cơ sở dữ liệu.' },
  { id: 'g-fullstack', title: 'Fullstack Developer', category: 'Công nghệ', source: 'general', skills: ['JavaScript', 'TypeScript', 'React', 'Node.js', 'REST API', 'MongoDB', 'Git'], summary: 'Làm cả frontend lẫn backend cho sản phẩm web.' },
  { id: 'g-mobile', title: 'Mobile Developer', category: 'Công nghệ', source: 'general', skills: ['Flutter', 'Dart', 'Kotlin', 'Firebase', 'REST API'], summary: 'Phát triển ứng dụng di động đa nền tảng.' },
  { id: 'g-qa', title: 'QA / Tester', category: 'Công nghệ', source: 'general', skills: ['Manual Testing', 'Postman', 'SQL', 'Jira', 'Test case'], summary: 'Kiểm thử phần mềm, đảm bảo chất lượng sản phẩm.' },
  { id: 'g-data', title: 'Data Analyst', category: 'Công nghệ', source: 'general', skills: ['SQL', 'Excel', 'Power BI', 'Python', 'Data visualization'], summary: 'Phân tích dữ liệu, xây dựng báo cáo và dashboard.' },
  { id: 'g-dm', title: 'Digital Marketing Executive', category: 'Marketing', source: 'general', skills: ['Facebook Ads', 'Google Ads', 'Google Analytics', 'SEO', 'Content Writing', 'Canva'], summary: 'Triển khai chiến dịch marketing số, tối ưu chuyển đổi.' },
  { id: 'g-content', title: 'Content Marketing', category: 'Marketing', source: 'general', skills: ['Content Writing', 'Copywriting', 'SEO', 'Social Media', 'Canva'], summary: 'Sản xuất nội dung, xây dựng thương hiệu trên các kênh số.' },
  { id: 'g-seo', title: 'SEO Specialist', category: 'Marketing', source: 'general', skills: ['SEO', 'Google Analytics', 'Google Tag Manager', 'Content Writing'], summary: 'Tối ưu website lên top tìm kiếm, tăng traffic tự nhiên.' },
  { id: 'g-ba', title: 'Business Analyst', category: 'Kinh doanh', source: 'general', skills: ['Nghiên cứu thị trường', 'Excel', 'SQL', 'Lập kế hoạch', 'Giao tiếp'], summary: 'Phân tích nghiệp vụ, cầu nối giữa kinh doanh và kỹ thuật.' },
  { id: 'g-sales', title: 'Sales Executive', category: 'Kinh doanh', source: 'general', skills: ['Sales', 'Chăm sóc khách hàng', 'Đàm phán', 'Giao tiếp', 'Excel'], summary: 'Tư vấn bán hàng, phát triển và chăm sóc khách hàng.' },
  { id: 'g-uiux', title: 'UI/UX Designer', category: 'Thiết kế', source: 'general', skills: ['Figma', 'Adobe XD', 'Wireframe', 'Prototyping', 'Design System'], summary: 'Thiết kế trải nghiệm và giao diện cho sản phẩm số.' },
  { id: 'g-graphic', title: 'Graphic Designer', category: 'Thiết kế', source: 'general', skills: ['Photoshop', 'Illustrator', 'Canva', 'Typography', 'Branding'], summary: 'Thiết kế ấn phẩm truyền thông, nhận diện thương hiệu.' },
  { id: 'g-acc', title: 'Kế toán viên', category: 'Tài chính', source: 'general', skills: ['Excel', 'MISA', 'Kế toán tổng hợp', 'Báo cáo tài chính', 'Thuế'], summary: 'Xử lý nghiệp vụ kế toán, lập báo cáo tài chính.' },
]

// ── Dựng job từ các công ty con FPT ─────────────────────────────────────────
function buildFptJobs(): JobCandidate[] {
  const jobs: JobCandidate[] = []
  for (const c of COMPANIES) {
    const baseSkills = c.techStack.length ? c.techStack : ['Kỹ năng chuyên môn', 'Giao tiếp', 'Làm việc nhóm']
    // Lấy tối đa 2 vai trò tiêu biểu mỗi công ty để danh sách không quá dài
    c.hiring.roles.slice(0, 2).forEach((role, idx) => {
      jobs.push({
        id: `fpt-${c.slug}-${idx}`,
        title: role,
        company: c.shortName,
        category: GROUP_META[c.group].label,
        skills: baseSkills,
        source: 'fpt',
        summary: c.tagline,
      })
    })
  }
  return jobs
}

/** Dựng đoạn JD (job_text) để gửi cho AI so khớp — đảm bảo đủ dài (>50 ký tự). */
export function buildJdText(job: JobCandidate): string {
  const where = job.company ? ` tại ${job.company}` : ''
  return [
    `Vị trí tuyển dụng: ${job.title}${where}.`,
    `Mô tả: ${job.summary}`,
    `Yêu cầu kỹ năng: ${job.skills.join(', ')}.`,
    `Ứng viên phù hợp có kiến thức và kinh nghiệm liên quan tới các kỹ năng trên, tinh thần học hỏi và làm việc nhóm tốt.`,
  ].join(' ')
}

function norm(s: string) {
  return s.trim().toLowerCase()
}

/** So khớp mềm: coi là trùng nếu tên kỹ năng chứa nhau (React ~ ReactJS). */
function skillMatches(cvSkill: string, jobSkill: string): boolean {
  const a = norm(cvSkill)
  const b = norm(jobSkill)
  if (!a || !b) return false
  return a === b || a.includes(b) || b.includes(a)
}

/** Xếp hạng công việc theo độ trùng kỹ năng với CV. */
export function rankJobs(cvData: CvData, limit = 12): RankedJob[] {
  const cvSkills = (cvData.skills ?? []).filter(Boolean)
  const candidates = [...buildFptJobs(), ...GENERAL_ROLES]

  const ranked: RankedJob[] = candidates.map((job) => {
    const matched: string[] = []
    const missing: string[] = []
    for (const js of job.skills) {
      if (cvSkills.some((cs) => skillMatches(cs, js))) matched.push(js)
      else missing.push(js)
    }
    // Chuẩn hoá theo mẫu số tối thiểu 3 để list kỹ năng ngắn không dễ đạt 100%
    const denom = Math.max(3, job.skills.length)
    const matchPercent = Math.max(0, Math.min(100, Math.round((matched.length / denom) * 100)))
    return { job, matchPercent, matched, missing }
  })

  ranked.sort((a, b) =>
    b.matchPercent - a.matchPercent || b.matched.length - a.matched.length
  )
  return ranked.slice(0, limit)
}

/** Ước tính phân vị "cao hơn ~X% ứng viên" từ điểm khớp (0..100). Trung thực, có hedge. */
export function percentileFromScore(score: number): number {
  return Math.max(5, Math.min(97, Math.round(score * 0.9 + 5)))
}
