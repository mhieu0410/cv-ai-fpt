// ============================================================================
// Dữ liệu gợi ý + bộ sinh câu cho trải nghiệm "Discover Yourself" trong CvForm.
// Không phụ thuộc AI ngoài — sinh câu bằng heuristic để chạy ngay; sau này có
// thể thay bằng lời gọi LLM thật mà không đổi giao diện.
// ============================================================================

// ── Kỹ năng theo nhóm (Feature 1) ──────────────────────────────────────────
export interface SkillGroup {
  label: string
  skills: string[]
}

export const SKILL_GROUPS: SkillGroup[] = [
  { label: 'Ngôn ngữ lập trình', skills: ['Java', 'Python', 'C++', 'C#', 'JavaScript', 'TypeScript', 'Kotlin', 'Dart', 'Go'] },
  { label: 'Frontend', skills: ['HTML', 'CSS', 'React', 'Next.js', 'Vue', 'Angular', 'Flutter', 'TailwindCSS'] },
  { label: 'Backend', skills: ['Spring Boot', 'Node.js', 'Express', 'ASP.NET', 'Django', 'Laravel', 'REST API'] },
  { label: 'Cơ sở dữ liệu', skills: ['MySQL', 'PostgreSQL', 'MongoDB', 'SQL Server', 'Redis', 'Firebase'] },
  { label: 'Công cụ & DevOps', skills: ['Git', 'Docker', 'Figma', 'Postman', 'Linux', 'CI/CD', 'AWS', 'Jira'] },
  { label: 'Kỹ năng mềm', skills: ['Làm việc nhóm', 'Giao tiếp', 'Quản lý thời gian', 'Giải quyết vấn đề', 'Thuyết trình'] },
  { label: 'Ngoại ngữ', skills: ['Tiếng Anh giao tiếp', 'IELTS 6.5', 'TOEIC 750', 'Tiếng Nhật N3'] },
]

// Gợi ý nhanh cho AI Coach ("Sinh viên CNTT thường có")
export const COMMON_SE_SKILLS = ['Java', 'Git', 'REST API', 'SQL', 'OOP', 'Spring Boot', 'React', 'Docker']

// ── Kỹ năng theo NGÀNH (mở rộng ngoài IT) ───────────────────────────────────
export interface Industry {
  key: string
  emoji: string
  label: string
  /** Các nhóm kỹ năng đặc thù ngành */
  groups: SkillGroup[]
  /** Gợi ý nhanh cho AI Coach */
  common: string[]
  /** Gợi ý tên dự án/sản phẩm tiêu biểu của ngành (dùng cho ProjectWizard) */
  projectIdeas: string[]
  /** Công nghệ / công cụ thường dùng của ngành (bước "công cụ" trong wizard) */
  tools: string[]
}

// Nhóm dùng chung cho mọi ngành
const SOFT_GROUP: SkillGroup = { label: 'Kỹ năng mềm', skills: ['Làm việc nhóm', 'Giao tiếp', 'Quản lý thời gian', 'Giải quyết vấn đề', 'Thuyết trình', 'Tư duy phản biện'] }
const LANG_GROUP: SkillGroup = { label: 'Ngoại ngữ', skills: ['Tiếng Anh giao tiếp', 'IELTS 6.5', 'TOEIC 750', 'Tiếng Nhật N3'] }

export const INDUSTRIES: Industry[] = [
  {
    key: 'it', emoji: '💻', label: 'CNTT / Phần mềm',
    groups: [
      { label: 'Ngôn ngữ lập trình', skills: ['Java', 'Python', 'C++', 'C#', 'JavaScript', 'TypeScript', 'Kotlin', 'Dart', 'Go'] },
      { label: 'Frontend', skills: ['HTML', 'CSS', 'React', 'Next.js', 'Vue', 'Angular', 'Flutter', 'TailwindCSS'] },
      { label: 'Backend', skills: ['Spring Boot', 'Node.js', 'Express', 'ASP.NET', 'Django', 'Laravel', 'REST API'] },
      { label: 'Cơ sở dữ liệu', skills: ['MySQL', 'PostgreSQL', 'MongoDB', 'SQL Server', 'Redis', 'Firebase'] },
      { label: 'Công cụ & DevOps', skills: ['Git', 'Docker', 'Postman', 'Linux', 'CI/CD', 'AWS', 'Jira'] },
      SOFT_GROUP, LANG_GROUP,
    ],
    common: ['Java', 'Git', 'REST API', 'SQL', 'OOP', 'Spring Boot', 'React', 'Docker'],
    projectIdeas: ['Website bán hàng online', 'Quản lý thư viện', 'Ứng dụng đặt đồ ăn', 'AI Chatbot', 'Website Portfolio cá nhân', 'Quản lý bệnh viện', 'Ứng dụng quản lý công việc', 'Website xem phim'],
    tools: ['Java', 'Spring Boot', 'React', 'Next.js', 'Node.js', 'C#', 'ASP.NET', 'Flutter', 'MySQL', 'PostgreSQL', 'MongoDB', 'Firebase', 'Docker', 'Git'],
  },
  {
    key: 'marketing', emoji: '📣', label: 'Marketing',
    groups: [
      { label: 'Content & SEO', skills: ['SEO', 'Content Writing', 'Copywriting', 'Content Planning', 'Storytelling'] },
      { label: 'Digital Ads', skills: ['Google Ads', 'Facebook Ads', 'TikTok Ads', 'Meta Business Suite'] },
      { label: 'Social & Email', skills: ['Social Media', 'Email Marketing', 'Community Management'] },
      { label: 'Phân tích', skills: ['Google Analytics', 'Google Tag Manager', 'A/B Testing', 'Excel'] },
      { label: 'Công cụ thiết kế', skills: ['Canva', 'Photoshop', 'CapCut', 'Figma'] },
      SOFT_GROUP, LANG_GROUP,
    ],
    common: ['SEO', 'Content Writing', 'Facebook Ads', 'Google Analytics', 'Canva', 'Social Media'],
    projectIdeas: ['Chiến dịch quảng cáo Facebook', 'Kế hoạch content 30 ngày', 'Quản lý fanpage/TikTok', 'Dự án SEO website', 'Email marketing automation', 'Nghiên cứu insight khách hàng'],
    tools: ['Facebook Ads', 'Google Ads', 'TikTok Ads', 'Google Analytics', 'Canva', 'Photoshop', 'CapCut', 'Meta Business Suite', 'Email Marketing', 'SEO'],
  },
  {
    key: 'business', emoji: '💼', label: 'Kinh doanh / QTKD',
    groups: [
      { label: 'Bán hàng', skills: ['Sales', 'Chăm sóc khách hàng', 'Đàm phán', 'Telesales', 'B2B Sales'] },
      { label: 'Quản lý & Vận hành', skills: ['Quản lý dự án', 'Lập kế hoạch', 'Quản lý thời gian', 'OKR/KPI'] },
      { label: 'Phân tích & Công cụ', skills: ['Excel', 'Power BI', 'Google Sheets', 'Nghiên cứu thị trường'] },
      SOFT_GROUP, LANG_GROUP,
    ],
    common: ['Sales', 'Excel', 'Chăm sóc khách hàng', 'Nghiên cứu thị trường', 'Đàm phán'],
    projectIdeas: ['Kế hoạch kinh doanh sản phẩm', 'Dự án nghiên cứu thị trường', 'Kế hoạch bán hàng theo quý', 'Phân tích đối thủ cạnh tranh', 'Xây dựng quy trình chăm sóc khách hàng'],
    tools: ['Excel', 'Power BI', 'Google Sheets', 'CRM', 'Nghiên cứu thị trường', 'Lập kế hoạch', 'OKR/KPI'],
  },
  {
    key: 'design', emoji: '🎨', label: 'Thiết kế / Sáng tạo',
    groups: [
      { label: 'Thiết kế đồ họa', skills: ['Photoshop', 'Illustrator', 'InDesign', 'CorelDRAW'] },
      { label: 'UI/UX', skills: ['Figma', 'Adobe XD', 'Wireframe', 'Prototyping', 'Design System'] },
      { label: 'Video & Motion', skills: ['After Effects', 'Premiere', 'CapCut', 'Motion Graphics'] },
      { label: 'Nền tảng', skills: ['Typography', 'Color Theory', 'Vẽ tay', 'Branding'] },
      SOFT_GROUP, LANG_GROUP,
    ],
    common: ['Figma', 'Photoshop', 'Illustrator', 'Prototyping', 'Typography'],
    projectIdeas: ['Bộ nhận diện thương hiệu', 'Thiết kế UI cho app di động', 'Poster/ấn phẩm sự kiện', 'Video motion graphics', 'Portfolio thiết kế cá nhân', 'Redesign giao diện website'],
    tools: ['Figma', 'Photoshop', 'Illustrator', 'Adobe XD', 'After Effects', 'Premiere', 'CapCut', 'InDesign'],
  },
  {
    key: 'finance', emoji: '📊', label: 'Kế toán / Tài chính',
    groups: [
      { label: 'Nghiệp vụ', skills: ['Kế toán tổng hợp', 'Báo cáo tài chính', 'Thuế', 'Kiểm toán'] },
      { label: 'Phần mềm', skills: ['Excel', 'MISA', 'Fast Accounting', 'SAP', 'Power BI'] },
      { label: 'Phân tích', skills: ['Phân tích tài chính', 'Định giá', 'SQL cơ bản'] },
      SOFT_GROUP, LANG_GROUP,
    ],
    common: ['Excel', 'Kế toán tổng hợp', 'Báo cáo tài chính', 'MISA', 'Thuế'],
    projectIdeas: ['Phân tích báo cáo tài chính công ty', 'Lập bảng dự toán ngân sách', 'Mô hình định giá doanh nghiệp', 'Dashboard theo dõi dòng tiền', 'Dự án thực hành kế toán trên MISA'],
    tools: ['Excel', 'MISA', 'Fast Accounting', 'SAP', 'Power BI', 'Google Sheets'],
  },
  {
    key: 'general', emoji: '✨', label: 'Khác / Chung',
    groups: [SOFT_GROUP, LANG_GROUP, { label: 'Tin học văn phòng', skills: ['Microsoft Word', 'Excel', 'PowerPoint', 'Google Workspace'] }],
    common: ['Làm việc nhóm', 'Giao tiếp', 'Excel', 'Tiếng Anh giao tiếp', 'Quản lý thời gian'],
    projectIdeas: ['Dự án môn học', 'Nghiên cứu khoa học', 'Đồ án tốt nghiệp', 'Dự án nhóm', 'Bài tập lớn'],
    tools: ['Microsoft Word', 'Excel', 'PowerPoint', 'Google Workspace', 'Canva'],
  },
]

// ── Dự án (Feature 2 + 5) ───────────────────────────────────────────────────
export const PROJECT_IDEAS = [
  'Website bán hàng online',
  'Quản lý thư viện',
  'Ứng dụng đặt đồ ăn',
  'AI Chatbot',
  'Website Portfolio cá nhân',
  'Quản lý bệnh viện',
  'Ứng dụng quản lý công việc (Task Manager)',
  'Website xem phim',
]

export const PROJECT_ROLES = ['Frontend', 'Backend', 'Fullstack', 'Mobile', 'Tester', 'Team Leader'] as const

export const PROJECT_TECH = ['Java', 'Spring Boot', 'React', 'Next.js', 'Node.js', 'C#', 'ASP.NET', 'Flutter', 'MySQL', 'PostgreSQL', 'MongoDB', 'Firebase', 'Docker', 'Git']

export const PROJECT_FEATURES = [
  'Đăng ký / đăng nhập & phân quyền',
  'Quản lý (CRUD) dữ liệu',
  'Tìm kiếm & lọc',
  'Thanh toán trực tuyến',
  'Dashboard thống kê',
  'Thông báo real-time',
  'Tải lên / xuất file',
  'Responsive trên mobile',
]

// ── Hoạt động (Feature 3) ───────────────────────────────────────────────────
export interface ActivityType {
  key: string
  emoji: string
  label: string
  /** Placeholder cho ô chi tiết khi mở rộng */
  placeholder: string
}

export const ACTIVITY_TYPES: ActivityType[] = [
  { key: 'club', emoji: '🎯', label: 'Câu lạc bộ sinh viên', placeholder: 'Tên CLB + vai trò của bạn (VD: CLB Lập trình FPT, thành viên ban kỹ thuật)' },
  { key: 'volunteer', emoji: '🤝', label: 'Tình nguyện', placeholder: 'Chương trình + việc bạn làm (VD: Mùa hè xanh, dạy học cho trẻ em)' },
  { key: 'event', emoji: '🎪', label: 'Tổ chức sự kiện', placeholder: 'Sự kiện + vai trò (VD: Ngày hội việc làm, trưởng ban hậu cần)' },
  { key: 'competition', emoji: '🏆', label: 'Cuộc thi', placeholder: 'Tên cuộc thi + kết quả (VD: Olympic Tin học, giải Ba)' },
  { key: 'hackathon', emoji: '💡', label: 'Hackathon', placeholder: 'Tên hackathon + sản phẩm/kết quả' },
  { key: 'ta', emoji: '📚', label: 'Trợ giảng (TA)', placeholder: 'Môn học + công việc hỗ trợ' },
  { key: 'mentor', emoji: '🧑‍🏫', label: 'Mentor', placeholder: 'Bạn mentor cho ai, về nội dung gì' },
  { key: 'community', emoji: '🌍', label: 'Hoạt động cộng đồng', placeholder: 'Mô tả hoạt động cộng đồng bạn tham gia' },
]

// ── Thành tích (Feature 4) ──────────────────────────────────────────────────
export interface AchievementItem {
  key: string
  label: string
  /** Có ô nhập chi tiết không (vd điểm GPA, tên học bổng) */
  needsDetail?: boolean
  detailPlaceholder?: string
}

export const ACHIEVEMENTS: AchievementItem[] = [
  { key: 'gpa', label: 'GPA cao (≥ 3.2)', needsDetail: true, detailPlaceholder: 'GPA của bạn (VD: 3.5/4.0)' },
  { key: 'scholarship', label: 'Học bổng', needsDetail: true, detailPlaceholder: 'Tên học bổng (VD: Học bổng khuyến khích học tập)' },
  { key: 'internship', label: 'Thực tập', needsDetail: true, detailPlaceholder: 'Công ty + vị trí thực tập' },
  { key: 'hackathon', label: 'Giải hackathon / cuộc thi', needsDetail: true, detailPlaceholder: 'Tên giải + hạng' },
  { key: 'leadership', label: 'Vai trò lãnh đạo', needsDetail: true, detailPlaceholder: 'Vai trò (VD: Trưởng nhóm dự án 5 người)' },
  { key: 'ta', label: 'Trợ giảng', needsDetail: true, detailPlaceholder: 'Môn học trợ giảng' },
  { key: 'english', label: 'Chứng chỉ ngoại ngữ', needsDetail: true, detailPlaceholder: 'VD: IELTS 6.5, TOEIC 750' },
  { key: 'volunteer', label: 'Hoạt động tình nguyện nổi bật', needsDetail: false },
]

// ============================================================================
// Bộ sinh câu (heuristic) — trả về chuỗi bullet chuyên nghiệp.
// ============================================================================

export interface ProjectWizardAnswers {
  name: string
  team: 'solo' | 'team' | ''
  role: string
  tech: string[]
  features: string[]
  achievement: string
}

/** Sinh mô tả dự án dạng bullet từ câu trả lời wizard. */
export function generateProjectDescription(a: ProjectWizardAnswers): string {
  const lines: string[] = []
  const techStr = a.tech.length ? a.tech.join(', ') : 'các công nghệ web hiện đại'
  const context = a.team === 'team'
    ? `Phát triển dự án "${a.name}" theo nhóm${a.role ? `, đảm nhận vai trò ${a.role}` : ''}.`
    : `Tự phát triển dự án "${a.name}"${a.role ? ` với vai trò ${a.role}` : ''}.`
  lines.push(`- ${context}`)
  lines.push(`- Sử dụng ${techStr} để xây dựng và triển khai hệ thống.`)
  if (a.features.length) {
    lines.push(`- Hiện thực các tính năng chính: ${a.features.join('; ')}.`)
  }
  if (a.achievement.trim()) {
    lines.push(`- Kết quả: ${a.achievement.trim()}.`)
  }
  return lines.join('\n')
}

/** Sinh câu mô tả hoạt động từ loại + chi tiết. */
export function generateActivityText(type: ActivityType, detail: string): string {
  const d = detail.trim()
  if (d) return `${type.label}: ${d}.`
  return `Tham gia ${type.label.toLowerCase()}.`
}

/** Sinh câu mô tả thành tích từ lựa chọn + chi tiết. */
export function generateAchievementText(item: AchievementItem, detail: string): string {
  const d = detail.trim()
  switch (item.key) {
    case 'gpa': return d ? `Đạt GPA ${d}.` : 'Đạt GPA loại khá/giỏi.'
    case 'scholarship': return d ? `Nhận ${d}.` : 'Nhận học bổng của trường.'
    case 'internship': return d ? `Thực tập tại ${d}.` : 'Có kinh nghiệm thực tập thực tế.'
    case 'hackathon': return d ? `Đạt ${d} tại cuộc thi/hackathon.` : 'Đạt giải tại cuộc thi/hackathon.'
    case 'leadership': return d ? `Đảm nhận ${d}.` : 'Có kinh nghiệm ở vai trò lãnh đạo.'
    case 'ta': return d ? `Trợ giảng môn ${d}.` : 'Trợ giảng tại trường.'
    case 'english': return d ? `Chứng chỉ ngoại ngữ: ${d}.` : 'Có chứng chỉ ngoại ngữ.'
    case 'volunteer': return 'Tích cực tham gia hoạt động tình nguyện, cộng đồng.'
    default: return d || item.label
  }
}
