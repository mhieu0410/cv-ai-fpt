import type { CvData } from '@/components/cv-templates/types'

/**
 * Bộ chấm điểm ATS thuần logic (không cần AI) cho CV của sinh viên FPT.
 * Mỗi tiêu chí có trọng số; tổng trọng số = 100. Điểm cuối là tổng điểm đạt được.
 */

export type CheckStatus = 'pass' | 'warn' | 'fail'

export interface AtsCheck {
  id: string
  label: string
  status: CheckStatus
  detail: string
  /** Trọng số tối đa của tiêu chí */
  weight: number
  /** Điểm thực nhận (0..weight) */
  earned: number
}

export type AtsLevel = 'excellent' | 'good' | 'fair' | 'poor'

export interface AtsResult {
  score: number
  level: AtsLevel
  checks: AtsCheck[]
  passed: number
  total: number
}

const ACTION_VERBS = [
  // English
  'develop', 'built', 'build', 'design', 'implement', 'create', 'led', 'lead',
  'manage', 'optimi', 'deploy', 'test', 'analyz', 'research', 'improv', 'automat',
  // Tiếng Việt
  'xây dựng', 'phát triển', 'thiết kế', 'triển khai', 'quản lý', 'tối ưu',
  'xử lý', 'nghiên cứu', 'thực hiện', 'tham gia', 'cải thiện', 'phụ trách',
]

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
const DIGIT_RE = /\d/

function clampLevel(score: number): AtsLevel {
  if (score >= 85) return 'excellent'
  if (score >= 70) return 'good'
  if (score >= 50) return 'fair'
  return 'poor'
}

function projectsText(data: CvData): string {
  return (data.projects ?? []).map((p) => `${p.name} ${p.description}`).join(' ').toLowerCase()
}

/**
 * Tính điểm ATS cho một CV.
 * @param title  tiêu đề CV (tuỳ chọn) — dùng cho tiêu chí "vai trò rõ ràng".
 */
export function computeAtsScore(data: CvData, title?: string): AtsResult {
  const checks: AtsCheck[] = []
  const personal = data.personal ?? { name: '', email: '', phone: '' }
  const education = data.education ?? []
  const skills = (data.skills ?? []).filter((s) => s && s.trim())
  const projects = (data.projects ?? []).filter((p) => p.name || p.description)
  const activities = (data.activities ?? []).filter((a) => a.description)

  // 1) Thông tin liên hệ đầy đủ (15)
  {
    const have = [personal.name, personal.email, personal.phone].filter((v) => v && v.trim()).length
    const earned = Math.round((have / 3) * 15)
    checks.push({
      id: 'contact', label: 'Thông tin liên hệ', weight: 15, earned,
      status: have === 3 ? 'pass' : have >= 1 ? 'warn' : 'fail',
      detail: have === 3 ? 'Đủ họ tên, email và số điện thoại.' : `Còn thiếu ${3 - have} trường liên hệ (họ tên / email / SĐT).`,
    })
  }

  // 2) Email hợp lệ (8)
  {
    const ok = EMAIL_RE.test((personal.email ?? '').trim())
    checks.push({
      id: 'email', label: 'Email hợp lệ', weight: 8, earned: ok ? 8 : 0,
      status: ok ? 'pass' : 'fail',
      detail: ok ? 'Email đúng định dạng.' : 'Email trống hoặc sai định dạng.',
    })
  }

  // 3) Có học vấn (10)
  {
    const ok = education.length > 0 && !!education[0].school
    checks.push({
      id: 'education', label: 'Học vấn', weight: 10, earned: ok ? 10 : 0,
      status: ok ? 'pass' : 'fail',
      detail: ok ? 'Đã có thông tin học vấn.' : 'Chưa khai báo trường/chuyên ngành.',
    })
  }

  // 4) Đủ kỹ năng (15): >=5 đạt, 3-4 cảnh báo
  {
    const n = skills.length
    const earned = n >= 5 ? 15 : n >= 3 ? 9 : n >= 1 ? 4 : 0
    checks.push({
      id: 'skills', label: 'Số lượng kỹ năng', weight: 15, earned,
      status: n >= 5 ? 'pass' : n >= 3 ? 'warn' : 'fail',
      detail: n >= 5 ? `${n} kỹ năng — tốt cho bộ lọc từ khoá.` : `Chỉ có ${n} kỹ năng. Nên liệt kê ít nhất 5.`,
    })
  }

  // 5) Dự án có mô tả đủ chi tiết (15)
  {
    const detailed = projects.filter((p) => (p.description ?? '').trim().length >= 40).length
    const earned = detailed >= 2 ? 15 : detailed === 1 ? 10 : projects.length ? 4 : 0
    checks.push({
      id: 'projects', label: 'Dự án có chiều sâu', weight: 15, earned,
      status: detailed >= 2 ? 'pass' : detailed >= 1 ? 'warn' : 'fail',
      detail: detailed >= 2 ? `${detailed} dự án mô tả chi tiết.` : 'Nên có ≥2 dự án với mô tả ≥40 ký tự (công nghệ, vai trò, kết quả).',
    })
  }

  // 6) Dùng động từ hành động (12)
  {
    const text = projectsText(data) + ' ' + activities.map((a) => a.description).join(' ').toLowerCase()
    const hit = ACTION_VERBS.some((v) => text.includes(v))
    checks.push({
      id: 'verbs', label: 'Động từ hành động', weight: 12, earned: hit ? 12 : 0,
      status: hit ? 'pass' : 'warn',
      detail: hit ? 'Mô tả dùng động từ mạnh (xây dựng, phát triển...).' : 'Mở đầu mô tả bằng động từ mạnh: "Xây dựng…", "Phát triển…", "Tối ưu…".',
    })
  }

  // 7) Có số liệu định lượng (12)
  {
    const text = projectsText(data) + ' ' + activities.map((a) => a.description).join(' ')
    const hit = DIGIT_RE.test(text)
    checks.push({
      id: 'metrics', label: 'Kết quả định lượng', weight: 12, earned: hit ? 12 : 0,
      status: hit ? 'pass' : 'warn',
      detail: hit ? 'Có con số minh hoạ kết quả.' : 'Thêm số liệu: "giảm 30% thời gian", "500+ người dùng"…',
    })
  }

  // 8) Hoạt động ngoại khoá (5)
  {
    const ok = activities.length > 0
    checks.push({
      id: 'activities', label: 'Hoạt động / CLB', weight: 5, earned: ok ? 5 : 0,
      status: ok ? 'pass' : 'warn',
      detail: ok ? 'Có hoạt động ngoại khoá.' : 'Bổ sung CLB/hoạt động để CV nổi bật hơn (không bắt buộc).',
    })
  }

  // 9) Tiêu đề nêu rõ vai trò (8)
  {
    const t = (title ?? '').trim()
    const ok = t.length >= 10
    checks.push({
      id: 'title', label: 'Tiêu đề rõ vai trò', weight: 8, earned: ok ? 8 : t ? 4 : 0,
      status: ok ? 'pass' : t ? 'warn' : 'fail',
      detail: ok ? 'Tiêu đề mô tả rõ vị trí ứng tuyển.' : 'Đặt tiêu đề nêu rõ vị trí, ví dụ: "CV Lập trình viên Frontend – Nguyễn Văn A".',
    })
  }

  const score = checks.reduce((s, c) => s + c.earned, 0)
  const passed = checks.filter((c) => c.status === 'pass').length
  return { score, level: clampLevel(score), checks, passed, total: checks.length }
}
