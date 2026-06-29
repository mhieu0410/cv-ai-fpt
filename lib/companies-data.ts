// ============================================================================
// Dữ liệu các công ty thành viên FPT — feature "Khám phá FPT"
// ----------------------------------------------------------------------------
// Nội dung curated tĩnh, soạn từ nguồn công khai chính thống của FPT.
// ⚠️ Số liệu (nhân sự, quy mô) mang tính tham khảo tại thời điểm `lastUpdated`,
//    nên đối chiếu nguồn trước khi công bố. Mỗi đơn vị đều kèm `sources`.
//
// Schema được thiết kế forward-compatible để sau này nối vào luồng Match CV–JD
// (vd: dùng `techStack` / `hiring.roles` để gợi ý từ khóa CV theo công ty).
// ============================================================================

export type CompanyGroup =
  | 'technology'
  | 'telecom'
  | 'retail'
  | 'education'
  | 'other'

export interface CompanySource {
  label: string
  url: string
}

/**
 * "FPT Insider Secrets" — bí mật thực chiến, cô đọng từ kinh nghiệm cộng đồng.
 * KHÔNG phải quy trình chính thức của công ty; mang tính tham khảo để ứng viên
 * chuẩn bị tốt hơn. Mỗi mục gồm vài gạch đầu dòng ngắn gọn.
 */
export interface InsiderSecrets {
  /** Quy trình phỏng vấn ngầm: mấy vòng, vòng nào hay rớt */
  interview: string[]
  /** Luật ngầm văn hóa (tinh thần STCo): hòa nhập nhanh, HR thích thái độ nào */
  culture: string[]
  /** Đặc thù công việc: lưu ý khi làm thực tế (vd khách Nhật/Mỹ) */
  jobNature: string[]
}

export interface Company {
  /** Định danh dùng cho URL: /companies/[slug] */
  slug: string
  /** Tên đầy đủ */
  name: string
  /** Tên ngắn hiển thị trên card */
  shortName: string
  /** Nhóm để filter */
  group: CompanyGroup
  /** Mô tả 1 dòng */
  tagline: string
  /** Ký tự viết tắt cho ô logo (fallback khi chưa có ảnh) */
  logoText: string
  /** Màu nhấn của card (hex) */
  accent: string
  /** Năm thành lập (nếu có) */
  founded?: string
  /** Quy mô: nhân sự / thị trường — kèm caveat trong nội dung */
  scale?: string

  // ── 4 nội dung đã chốt ────────────────────────────────────────────────
  /** Lĩnh vực & mảng kinh doanh (gạch đầu dòng) */
  business: string[]
  /** Mô hình kinh doanh tóm tắt (B2B / B2C / outsourcing...) */
  businessModel: string
  /** Văn hóa & giá trị cốt lõi */
  culture: string[]
  /** Tuyển dụng */
  hiring: {
    /** Vị trí thường tuyển */
    roles: string[]
    /** Phù hợp với sinh viên ngành nào */
    fitFor: string
  }
  /** Tech stack / kỹ năng trọng tâm (có thể rỗng cho đơn vị phi công nghệ) */
  techStack: string[]
  /** Bí mật thực chiến (tham khảo) — phỏng vấn, văn hóa STCo, đặc thù công việc */
  insiderSecrets?: InsiderSecrets

  // ── Metadata ──────────────────────────────────────────────────────────
  website?: string
  /** Ngày cập nhật nội dung (ISO) */
  lastUpdated: string
  /** Nguồn tham khảo công khai */
  sources: CompanySource[]
}

// ── Metadata cho từng nhóm (label + màu filter) ───────────────────────────
export const GROUP_META: Record<CompanyGroup, { label: string; color: string }> = {
  technology: { label: 'Công nghệ', color: '#f26f21' },
  telecom:    { label: 'Viễn thông', color: '#2563eb' },
  retail:     { label: 'Bán lẻ', color: '#16a34a' },
  education:  { label: 'Giáo dục', color: '#C4A1FF' },
  other:      { label: 'Khác', color: '#71717a' },
}

// ============================================================================
// DỮ LIỆU — hiện có 3 đơn vị mẫu để duyệt giao diện & văn phong.
// Sau khi Hiếu duyệt, bổ sung nốt các đơn vị còn lại theo đúng template này.
// ============================================================================

export const COMPANIES: Company[] = [
  {
    slug: 'fpt-software',
    name: 'Công ty TNHH Phần mềm FPT (FPT Software)',
    shortName: 'FPT Software',
    group: 'technology',
    tagline: 'Công ty xuất khẩu phần mềm & dịch vụ CNTT lớn nhất Việt Nam.',
    logoText: 'FS',
    accent: '#f26f21',
    founded: '1999',
    scale: 'Hơn 30.000 nhân sự trên toàn cầu (đầu 2025), hiện diện tại nhiều quốc gia.',
    business: [
      'Phát triển phần mềm & dịch vụ CNTT cho khách hàng quốc tế (Mỹ, Nhật, EU, APAC).',
      'Chuyển đổi số, AI, Cloud, Data, IoT, RPA, an toàn thông tin.',
      'Dịch vụ kiểm thử, bảo trì và vận hành hệ thống quy mô lớn.',
    ],
    businessModel:
      'B2B / xuất khẩu dịch vụ (IT outsourcing & global delivery). Doanh thu chủ yếu từ khách hàng nước ngoài theo mô hình dự án và đội ngũ thuê ngoài.',
    culture: [
      'Môi trường trẻ, năng động, quy mô toàn cầu — nhiều cơ hội onsite nước ngoài.',
      'Đề cao tinh thần học hỏi liên tục và chứng chỉ công nghệ.',
      'Văn hóa FPT: "Tôn Đổi Đồng – Chí Gương Sáng" (giá trị cốt lõi của tập đoàn).',
    ],
    hiring: {
      roles: [
        'Software Engineer / Developer (fresher, intern)',
        'Tester / QA',
        'BrSE (Kỹ sư cầu nối tiếng Nhật)',
        'AI/Data Engineer, Cloud Engineer',
      ],
      fitFor:
        'Sinh viên CNTT, Kỹ thuật phần mềm, Khoa học máy tính, ATTT; đặc biệt hợp bạn biết ngoại ngữ (Anh/Nhật) muốn làm dự án quốc tế.',
    },
    techStack: [
      'Java', '.NET', 'JavaScript/TypeScript', 'Python',
      'ReactJS', 'Angular', 'Spring', 'Cloud (AWS/Azure/GCP)', 'AI/ML',
    ],
    insiderSecrets: {
      interview: [
        'Thường 3–4 vòng: sàng lọc CV/GPA → test năng lực (tiếng Anh + tư duy/logic, có thể có test code) → phỏng vấn kỹ thuật → phỏng vấn HR.',
        'Vòng hay rớt nhất với fresher là test đầu vào (tiếng Anh + logic); vòng kỹ thuật dễ trượt khi bị hỏi sâu nền tảng (OOP, CSDL, thuật toán cơ bản).',
        'Vị trí BrSE: tiếng Nhật (JLPT ~N3 trở lên) gần như là điều kiện loại trực tiếp.',
      ],
      culture: [
        'Tinh thần STCo: hài hước, thẳng thắn, ít khoảng cách cấp bậc — sếp hay gọi bằng anh/chị/tên, đừng quá khách sáo.',
        'HR thích thái độ chủ động, ham học và thật thà về điểm yếu hơn là "chém" quá đà.',
        'Sẵn sàng nhận việc khó và tinh thần đồng đội ghi điểm nhanh khi mới vào.',
      ],
      jobNature: [
        'Phần lớn làm dự án cho khách nước ngoài → tiếng Anh/Nhật là công cụ sống còn, không chỉ để phỏng vấn.',
        'Khách Nhật: cực coi trọng Hou-Ren-Sou (báo cáo – liên lạc – thảo luận), đúng giờ, tỉ mỉ, theo quy trình.',
        'Khách Mỹ/EU: thiên Agile, cần chủ động nêu ý kiến và giao tiếp trực tiếp, rõ ràng.',
      ],
    },
    website: 'https://fptsoftware.com',
    lastUpdated: '2026-06-25',
    sources: [
      { label: 'FPT Software — Website chính thức', url: 'https://fptsoftware.com' },
      { label: 'ChungTa: FPT Software vượt mốc 30.000 nhân sự', url: 'https://chungta.vn/nguoi-fpt/fpt-software-vuot-moc-30-000-nhan-su-tren-toan-cau-1138459.html' },
      { label: 'FPT — Báo cáo thường niên 2024', url: 'https://fpt.com/vi/nha-dau-tu' },
    ],
  },
  {
    slug: 'fpt-is',
    name: 'Công ty TNHH Hệ thống Thông tin FPT (FPT IS)',
    shortName: 'FPT IS',
    group: 'technology',
    tagline: 'Đơn vị chuyển đổi số hàng đầu cho chính phủ & doanh nghiệp trong nước.',
    logoText: 'IS',
    accent: '#0ea5e9',
    founded: '1994',
    scale: 'Hệ sinh thái hơn 300 giải pháp số; phục vụ khối chính phủ và doanh nghiệp lớn tại Việt Nam.',
    business: [
      'Tích hợp hệ thống (system integration) cho chính phủ & doanh nghiệp.',
      'Phát triển phần mềm ứng dụng, dịch vụ ERP, e-services.',
      'Tư vấn & triển khai chuyển đổi số toàn diện, cung cấp thiết bị CNTT.',
    ],
    businessModel:
      'B2B / B2G (chính phủ). Tập trung thị trường nội địa: từ tư vấn → triển khai → vận hành cho các tổ chức lớn (ngân hàng, thuế, y tế, hành chính công).',
    culture: [
      'Định vị "đối tác công nghệ chuyên gia" — đồng hành sâu với khách hàng.',
      'Môi trường thiên về giải pháp doanh nghiệp, đề cao kiến thức nghiệp vụ ngành.',
      'Đã đổi tên & nhận diện thương hiệu mới từ 13/5/2024.',
    ],
    hiring: {
      roles: [
        'Lập trình viên (Java, .NET, Web)',
        'Business Analyst (BA) / Tư vấn giải pháp',
        'Kỹ sư triển khai hệ thống / DevOps',
        'Tester, Quản trị dự án (PM)',
      ],
      fitFor:
        'Sinh viên CNTT, Hệ thống thông tin, Kỹ thuật phần mềm; hợp bạn thích mảng giải pháp doanh nghiệp, ERP, nghiệp vụ ngành (tài chính, y tế, hành chính công).',
    },
    techStack: [
      'Java', '.NET', 'Oracle/SQL Server', 'ERP (SAP/Oracle EBS)',
      'Web (React/Angular)', 'Microservices', 'DevOps',
    ],
    insiderSecrets: {
      interview: [
        'Thường: CV → test logic/chuyên môn → phỏng vấn kỹ thuật & nghiệp vụ → HR.',
        'Vòng hay rớt: phỏng vấn chuyên môn khi thiếu kiến thức nghiệp vụ ngành (ngân hàng, thuế, y tế, hành chính công) hoặc nền tảng CSDL.',
        'Vị trí BA/tư vấn bị soi kỹ năng phân tích, đặt câu hỏi và giao tiếp.',
      ],
      culture: [
        'Văn hóa thiên "doanh nghiệp/dự án" hơn FSoft: chuyên nghiệp, quy trình, làm với khách lớn & nhà nước — vẫn giữ chất STCo nhưng "chững" hơn.',
        'HR đánh giá cao sự cẩn thận, kiên nhẫn và tinh thần trách nhiệm với dự án dài hơi.',
        'Hợp người thích chiều sâu nghiệp vụ hơn là chỉ code.',
      ],
      jobNature: [
        'Nhiều dự án on-site tại khách hàng (bộ ngành, ngân hàng) → cần tác phong chỉn chu, kiên nhẫn với giấy tờ/quy trình.',
        'Hiểu nghiệp vụ ngành quan trọng ngang code — chịu khó đọc tài liệu domain.',
        'Deadline gắn mốc nghiệm thu hợp đồng → áp lực theo tiến độ dự án.',
      ],
    },
    website: 'https://fpt-is.com',
    lastUpdated: '2026-06-25',
    sources: [
      { label: 'FPT IS — Website chính thức', url: 'https://fpt-is.com/ve-fpt-is/' },
      { label: 'FPT: FPT IS đổi tên & nhận diện thương hiệu mới (13/5/2024)', url: 'https://fpt.com/vi/tin-tuc/tin-fpt/fpt-is-doi-ten-va-nhan-dien-thuong-hieu-moi' },
    ],
  },
  {
    slug: 'fpt-telecom',
    name: 'Công ty Cổ phần Viễn thông FPT (FPT Telecom)',
    shortName: 'FPT Telecom',
    group: 'telecom',
    tagline: 'Nhà cung cấp Internet băng thông rộng & hạ tầng trung tâm dữ liệu.',
    logoText: 'FT',
    accent: '#2563eb',
    founded: '1997',
    scale: 'Mạng lưới chi nhánh rộng khắp toàn quốc; vận hành nhiều trung tâm dữ liệu (Data Center) đạt chuẩn Tier 3.',
    business: [
      'Dịch vụ Internet băng thông rộng (FTTH) cho hộ gia đình & doanh nghiệp.',
      'Trung tâm dữ liệu (Data Center), cloud, hạ tầng kết nối trong nước & quốc tế.',
      'Truyền hình FPT (FPT Play), dịch vụ số & giải pháp cho doanh nghiệp.',
    ],
    businessModel:
      'B2C + B2B. Doanh thu từ thuê bao Internet/truyền hình (hộ gia đình) và dịch vụ hạ tầng, Data Center, kết nối cho doanh nghiệp.',
    culture: [
      'Quy mô vận hành lớn, mạng lưới chi nhánh khắp các tỉnh thành.',
      'Hạ tầng tuân thủ tiêu chuẩn quốc tế (Uptime Tier 3, ISO 27001, ISO 9001).',
      'Văn hóa FPT chung; mạnh về vận hành kỹ thuật & chăm sóc khách hàng diện rộng.',
    ],
    hiring: {
      roles: [
        'Kỹ sư hệ thống / mạng (Network, System)',
        'Kỹ sư vận hành Data Center',
        'Lập trình viên dịch vụ số (FPT Play, app)',
        'Nhân viên kinh doanh / chăm sóc khách hàng',
      ],
      fitFor:
        'Sinh viên Mạng máy tính, Điện tử – Viễn thông, CNTT; cũng hợp bạn ngành kinh tế/marketing muốn vào mảng kinh doanh dịch vụ viễn thông.',
    },
    techStack: [
      'Networking (TCP/IP, routing)', 'Linux', 'Cloud/Data Center',
      'Java', 'Backend services', 'Mobile/Web (cho mảng dịch vụ số)',
    ],
    insiderSecrets: {
      interview: [
        'Kỹ thuật (mạng/hệ thống): test kiến thức mạng + phỏng vấn; kinh doanh: phỏng vấn thái độ + khả năng chịu KPI.',
        'Vòng hay rớt với sales: không thể hiện được sự lì đòn, kỹ năng giao tiếp và sẵn sàng chịu doanh số.',
        'Hay hỏi về tính kỷ luật và khả năng đi thị trường/đi tỉnh.',
      ],
      culture: [
        'Văn hóa "đời", gần gũi, quy mô lớn, nhịp nhanh — đặc biệt ở khối kinh doanh/kỹ thuật hiện trường.',
        'HR thích người chăm chỉ, chịu khó, tinh thần phục vụ khách hàng.',
        'Tinh thần đồng đội mạnh ở các chi nhánh tỉnh.',
      ],
      jobNature: [
        'Khối kinh doanh: KPI rõ ràng, áp lực doanh số, thu nhập gắn hoa hồng hợp đồng.',
        'Khối kỹ thuật: có thể trực ca, xử lý sự cố hạ tầng/Data Center 24/7.',
        'Va chạm khách hàng nhiều, cơ hội thử thách thực tế nhanh.',
      ],
    },
    website: 'https://fpt.vn',
    lastUpdated: '2026-06-25',
    sources: [
      { label: 'FPT Telecom — Trung tâm dữ liệu', url: 'https://fpt.vn/vi/dich-vu/trung-tam-du-lieu.html' },
      { label: 'VnExpress: FPT vận hành trung tâm dữ liệu phục vụ chuyển đổi số', url: 'https://vnexpress.net/fpt-van-hanh-trung-tam-du-lieu-phuc-vu-chuyen-doi-so-4929512.html' },
    ],
  },
  {
    slug: 'fpt-smart-cloud',
    name: 'Công ty TNHH FPT Smart Cloud',
    shortName: 'FPT Smart Cloud',
    group: 'technology',
    tagline: 'Nền tảng Trí tuệ nhân tạo (FPT.AI) & Điện toán đám mây (FPT Cloud).',
    logoText: 'SC',
    accent: '#0891b2',
    founded: '2020',
    scale: 'FPT.AI hơn 20 sản phẩm, FPT Cloud hơn 80 dịch vụ; phục vụ hơn 3.000 doanh nghiệp tại ~15 quốc gia; vận hành AI Factory với GPU NVIDIA H100/H200.',
    business: [
      'Nền tảng AI (FPT.AI): chatbot, voicebot, AI agent tổng đài, OCR, xử lý ngôn ngữ & hình ảnh.',
      'Hạ tầng điện toán đám mây (FPT Cloud): IaaS, PaaS, lưu trữ, tính toán.',
      'FPT AI Factory: hạ tầng GPU & nền tảng phát triển AI cho doanh nghiệp và startup.',
    ],
    businessModel:
      'B2B công nghệ — cung cấp nền tảng AI & Cloud theo mô hình dịch vụ/subscription cho doanh nghiệp trong và ngoài nước.',
    culture: [
      'Môi trường công nghệ cao, AI-first, cập nhật xu hướng mới liên tục.',
      'Hợp tác hệ sinh thái quốc tế (OpenStack, NVIDIA).',
      'Đề cao nghiên cứu, thử nghiệm và làm chủ công nghệ lõi.',
    ],
    hiring: {
      roles: [
        'AI/ML Engineer',
        'Data Engineer / Data Scientist',
        'Cloud / DevOps Engineer',
        'Backend Developer, Solution Engineer',
      ],
      fitFor:
        'Sinh viên CNTT, Khoa học máy tính, Khoa học dữ liệu, AI; nền tảng toán & machine learning vững là lợi thế lớn.',
    },
    techStack: [
      'Python', 'Machine Learning / Deep Learning', 'NLP', 'Computer Vision',
      'Cloud (OpenStack/Kubernetes)', 'MLOps', 'GPU computing', 'Go', 'Java',
    ],
    insiderSecrets: {
      interview: [
        'Thiên kỹ thuật sâu: phỏng vấn về nền tảng ML/AI hoặc cloud, thường có bài test/coding.',
        'Vòng hay rớt: chuyên môn khi thiếu nền tảng toán/ML hoặc không có project minh chứng.',
        'Portfolio/dự án AI thực tế (GitHub, Kaggle) là lợi thế lớn.',
      ],
      culture: [
        'Môi trường AI-first, trẻ, tốc độ — đề cao tự học và thử nghiệm; đậm tính sản phẩm/startup.',
        'HR/leader thích người tò mò công nghệ, dám đề xuất và "làm được việc".',
        'Cập nhật xu hướng mới (LLM, MLOps) được coi trọng.',
      ],
      jobNature: [
        'Công nghệ thay đổi rất nhanh → phải học liên tục (LLM, MLOps, hạ tầng GPU).',
        'Làm sản phẩm/nền tảng cho doanh nghiệp → cần tư duy giải pháp, không chỉ chạy mô hình.',
        'Cơ hội tiếp xúc hạ tầng AI quy mô lớn (GPU cluster).',
      ],
    },
    website: 'https://fptcloud.com',
    lastUpdated: '2026-06-25',
    sources: [
      { label: 'FPT Smart Cloud — About Us', url: 'https://fptcloud.com/en/about-us/' },
      { label: 'NVIDIA case study — FPT Smart Cloud', url: 'https://www.nvidia.com/en-us/case-studies/fpt-smart-cloud-levels-up-customer-service-operations/' },
    ],
  },
  {
    slug: 'fpt-digital',
    name: 'Công ty TNHH Dịch vụ Tư vấn Chuyển đổi số FPT (FPT Digital)',
    shortName: 'FPT Digital',
    group: 'technology',
    tagline: 'Công ty tư vấn chuyển đổi số & phát triển bền vững (ESG).',
    logoText: 'FD',
    accent: '#7c3aed',
    founded: '2021',
    scale: 'Công ty thành viên thứ 9 của FPT; tư vấn theo phương pháp luận FPT Digital Kaizen™ đúc kết từ hơn 30 năm kinh nghiệm CNTT của FPT.',
    business: [
      'Tư vấn lộ trình chuyển đổi số toàn diện & giám sát triển khai.',
      'Tư vấn phát triển nguồn lực, xây dựng văn hóa số cho doanh nghiệp.',
      'Tư vấn chuyển đổi xanh / ESG: báo cáo bền vững, kiểm kê & lộ trình giảm phát thải.',
    ],
    businessModel:
      'B2B tư vấn (consulting) — đồng hành cùng doanh nghiệp từ chiến lược đến giám sát thực thi chuyển đổi số.',
    culture: [
      'Môi trường tư vấn chuyên sâu, đề cao tư duy chiến lược & kiến thức ngành.',
      'Thường xuyên làm việc với lãnh đạo cấp cao của doanh nghiệp khách hàng.',
      'Coi trọng kỹ năng phân tích, trình bày và giải quyết vấn đề.',
    ],
    hiring: {
      roles: [
        'Chuyên viên tư vấn (Consultant)',
        'Business Analyst',
        'Chuyên viên ESG / Phát triển bền vững',
        'Project Manager',
      ],
      fitFor:
        'Sinh viên Quản trị kinh doanh, Kinh tế, CNTT, Môi trường (cho mảng ESG) có tư duy phân tích và kỹ năng giao tiếp tốt.',
    },
    techStack: [],
    insiderSecrets: {
      interview: [
        'Phong cách kiểu tư vấn: có tình huống/case, yêu cầu phân tích và trình bày logic.',
        'Vòng hay rớt: khi không cấu trúc được câu trả lời hoặc thiếu tư duy kinh doanh.',
        'Kỹ năng thuyết trình, tiếng Anh và sự tự tin được chú ý.',
      ],
      culture: [
        'Môi trường tư vấn chuyên nghiệp, làm việc với lãnh đạo doanh nghiệp → tác phong chỉn chu.',
        'HR đánh giá cao tư duy phản biện, ham học và thái độ cầu thị.',
        'Đề cao chất lượng đầu ra, áp lực "chất xám" cao.',
      ],
      jobNature: [
        'Làm theo dự án tư vấn → nhiều phân tích, slide, làm việc trực tiếp với khách cấp cao.',
        'Cần kiến thức đa ngành & cập nhật xu hướng (chuyển đổi số, ESG).',
        'Đi lại/họp khách nhiều, deadline theo mốc tư vấn.',
      ],
    },
    website: 'https://digital.fpt.com',
    lastUpdated: '2026-06-25',
    sources: [
      { label: 'FPT Digital — Website chính thức', url: 'https://digital.fpt.com/' },
      { label: 'FPT: Thành lập Công ty Dịch vụ Tư vấn Chuyển đổi số', url: 'https://fpt.com/vi/tin-tuc/thong-cao-bao-chi/fpt-thanh-lap-cong-ty-dich-vu-tu-van-chuyen-doi-so' },
    ],
  },
  {
    slug: 'fpt-semiconductor',
    name: 'Công ty Cổ phần Bán dẫn FPT (FPT Semiconductor)',
    shortName: 'FPT Semiconductor',
    group: 'technology',
    tagline: 'Thiết kế chip bán dẫn "Make in Vietnam".',
    logoText: 'FS',
    accent: '#0f766e',
    founded: '2022',
    scale: 'Thiết kế chip nguồn (PMIC) & chip IoT; từng công bố đơn hàng tới 70 triệu chip (2024–2025) từ Đài Loan, Hàn Quốc, Nhật Bản.',
    business: [
      'Thiết kế vi mạch (chip), tập trung chip quản lý nguồn (PMIC) và chip IoT.',
      'Định hướng mở rộng sang khâu back-end (đóng gói & kiểm thử) bán dẫn.',
      'Gắn với hệ sinh thái FPT (FPT Software hỗ trợ giải pháp, FPT Education đào tạo nhân lực).',
    ],
    businessModel:
      'B2B công nghệ bán dẫn theo mô hình fabless — FPT thiết kế chip rồi đặt nhà máy ngoài gia công sản xuất.',
    culture: [
      'Môi trường công nghệ sâu (deep-tech), thiên về nghiên cứu & phát triển vi mạch.',
      'Tham vọng trở thành công ty thiết kế chip hàng đầu Đông Nam Á.',
      'Tinh thần tiên phong, làm chủ công nghệ lõi của người Việt.',
    ],
    hiring: {
      roles: [
        'Kỹ sư thiết kế vi mạch (IC Design)',
        'Verification Engineer',
        'Embedded / IoT Engineer',
        'Layout Engineer',
      ],
      fitFor:
        'Sinh viên Điện tử – Viễn thông, Kỹ thuật máy tính, Thiết kế vi mạch bán dẫn; nền tảng điện tử số/tương tự vững là yêu cầu quan trọng.',
    },
    techStack: [
      'Verilog / VHDL', 'EDA tools', 'Analog/Digital IC design',
      'Embedded C', 'IoT', 'Vi xử lý',
    ],
    insiderSecrets: {
      interview: [
        'Phỏng vấn kỹ thuật sâu về điện tử số/tương tự, Verilog/VHDL, kiến trúc vi mạch.',
        'Vòng hay rớt: chuyên môn khi nền tảng điện tử/thiết kế số chưa vững.',
        'Đồ án/đề tài về IC, FPGA, embedded là điểm cộng rất lớn (ngành đang khát người).',
      ],
      culture: [
        'Đội ngũ tinh gọn, deep-tech, tinh thần tiên phong "chip Make in Vietnam".',
        'HR/leader thích người kiên trì, chịu khó nghiên cứu và học nhanh.',
        'Team nhỏ nên cơ hội học sát chuyên gia rất nhiều.',
      ],
      jobNature: [
        'Lĩnh vực mới & khó → đường học dốc, cần kiên nhẫn với chi tiết kỹ thuật.',
        'Làm theo chuẩn ngành bán dẫn: tài liệu tiếng Anh, quy trình verify nghiêm ngặt.',
        'Gắn với hệ sinh thái FPT (phối hợp FSoft, nguồn nhân lực từ ĐH FPT).',
      ],
    },
    website: 'https://fpt-is.com/semiconductor/',
    lastUpdated: '2026-06-25',
    sources: [
      { label: 'ChungTa: Tham vọng thiết kế chip số 1 Đông Nam Á', url: 'https://chungta.vn/cong-nghe/tham-vong-cua-fpt-la-tro-thanh-cong-ty-thiet-ke-chip-so-mot-tai-dong-nam-a-1139293.html' },
      { label: 'FPT Semiconductor — Chip bán dẫn Make in Vietnam', url: 'https://fpt-is.com/semiconductor/' },
    ],
  },
  {
    slug: 'fpt-retail',
    name: 'Công ty Cổ phần Bán lẻ Kỹ thuật số FPT (FPT Retail – FRT)',
    shortName: 'FPT Retail',
    group: 'retail',
    tagline: 'Chuỗi bán lẻ FPT Shop & hệ thống nhà thuốc Long Châu.',
    logoText: 'FR',
    accent: '#16a34a',
    founded: '2012',
    scale: 'Sở hữu FPT Shop, F.Studio By FPT và chuỗi nhà thuốc Long Châu (hơn 2.000 cửa hàng tính đến Q1/2025). Mã chứng khoán: FRT.',
    business: [
      'Bán lẻ điện thoại, laptop, thiết bị công nghệ (FPT Shop, F.Studio By FPT).',
      'Bán lẻ dược phẩm & trung tâm tiêm chủng (chuỗi nhà thuốc Long Châu).',
      'Thương mại điện tử và dịch vụ bán hàng đa kênh (omni-channel).',
    ],
    businessModel:
      'B2C bán lẻ (offline + online). Long Châu hiện là động lực tăng trưởng chính bên cạnh mảng bán lẻ công nghệ.',
    culture: [
      'Môi trường bán lẻ tốc độ cao, định hướng khách hàng và doanh số.',
      'Mở rộng mạng lưới cửa hàng nhanh, vận hành quy mô lớn.',
      'Đề cao kỷ luật vận hành và trải nghiệm khách hàng.',
    ],
    hiring: {
      roles: [
        'Nhân viên bán hàng / Dược sĩ (Long Châu)',
        'Quản lý cửa hàng',
        'Lập trình viên E-commerce / ERP, Data Analyst',
        'Marketing, Supply Chain',
      ],
      fitFor:
        'Sinh viên Kinh tế, QTKD, Marketing, Dược (cho Long Châu); sinh viên CNTT cho mảng e-commerce và hệ thống vận hành.',
    },
    techStack: [
      'E-commerce platform', 'ERP / POS', 'Data analytics', 'Web/Mobile (mảng số)',
    ],
    insiderSecrets: {
      interview: [
        'Cửa hàng/sales: phỏng vấn thái độ, giao tiếp, chịu KPI; Long Châu cần bằng/chứng chỉ dược cho vị trí dược sĩ.',
        'Vòng hay rớt: thiếu tinh thần phục vụ khách hàng hoặc ngại áp lực doanh số.',
        'Khối công nghệ/e-commerce: phỏng vấn kỹ thuật như công ty IT.',
      ],
      culture: [
        'Văn hóa bán lẻ tốc độ cao, kỷ luật vận hành, hướng khách hàng & con số.',
        'HR thích người nhanh nhẹn, chịu khó, tinh thần dịch vụ.',
        'Mở rộng nhanh → nhiều cơ hội thăng tiến nếu chịu được nhịp.',
      ],
      jobNature: [
        'KPI doanh số rõ ràng; làm theo ca, cuối tuần/lễ là cao điểm bán hàng.',
        'Long Châu: môi trường dược, cần cẩn thận và tư vấn đúng chuyên môn.',
        'Mảng số (e-commerce/ERP): áp lực hệ thống phục vụ chuỗi cửa hàng lớn.',
      ],
    },
    website: 'https://frt.vn',
    lastUpdated: '2026-06-25',
    sources: [
      { label: 'Wikipedia — FPT Retail', url: 'https://vi.wikipedia.org/wiki/FPT_Retail' },
      { label: 'VnExpress: Chủ sở hữu nhà thuốc Long Châu (số liệu cửa hàng)', url: 'https://vnexpress.net/chu-so-huu-nha-thuoc-long-chau-thu-hon-23-000-ty-dong-nua-dau-nam-4920468.html' },
    ],
  },
  {
    slug: 'synnex-fpt',
    name: 'Công ty Cổ phần Synnex FPT',
    shortName: 'Synnex FPT',
    group: 'other',
    tagline: 'Nhà phân phối sản phẩm công nghệ hàng đầu Việt Nam.',
    logoText: 'SX',
    accent: '#d97706',
    founded: '2009',
    scale: 'Mạng lưới hàng nghìn đại lý & điểm bán trên 63 tỉnh thành; phân phối sản phẩm của gần 40 thương hiệu công nghệ toàn cầu.',
    business: [
      'Phân phối sản phẩm CNTT, điện thoại, thiết bị công nghệ.',
      'Dịch vụ chuỗi cung ứng & giải pháp quản lý bán hàng cho đại lý.',
      'Định hướng chuyển dịch từ "trading" (phân phối) sang "service" (dịch vụ).',
    ],
    businessModel:
      'B2B2C phân phối (bán buôn) — kết nối các hãng công nghệ với mạng lưới đại lý và điểm bán trên toàn quốc.',
    culture: [
      'Môi trường thương mại & vận hành chuỗi cung ứng quy mô lớn.',
      'Định hướng dịch vụ, tốc độ và độ phủ thị trường.',
      'Hợp tác chặt với các thương hiệu công nghệ quốc tế.',
    ],
    hiring: {
      roles: [
        'Nhân viên kinh doanh / quản lý ngành hàng',
        'Logistics / Supply Chain',
        'Lập trình viên hệ thống phân phối',
        'Data Analyst',
      ],
      fitFor:
        'Sinh viên Kinh tế, QTKD, Logistics, Marketing; sinh viên CNTT cho hệ thống quản lý phân phối & dữ liệu.',
    },
    techStack: [
      'ERP', 'Supply chain system', 'Data analytics',
    ],
    insiderSecrets: {
      interview: [
        'Kinh doanh/ngành hàng: phỏng vấn thái độ, quan hệ đối tác, chịu KPI; logistics: nghiệp vụ chuỗi cung ứng.',
        'Vòng hay rớt: thiếu nhanh nhạy thương mại hoặc kỹ năng giao tiếp/đàm phán.',
        'Hiểu thị trường sản phẩm công nghệ là điểm cộng.',
      ],
      culture: [
        'Văn hóa thương mại, vận hành quy mô lớn, định hướng dịch vụ & tốc độ.',
        'HR thích người chủ động, quan hệ tốt, chịu được nhịp phân phối.',
        'Đề cao kết quả và độ tin cậy với đối tác/đại lý.',
      ],
      jobNature: [
        'Làm với hãng công nghệ & mạng lưới đại lý → cần kỹ năng quan hệ và bám sát số liệu.',
        'Áp lực tồn kho, doanh số và mùa vụ sản phẩm.',
        'Cơ hội hiểu sâu chuỗi cung ứng ngành công nghệ.',
      ],
    },
    website: 'https://synnexfpt.com',
    lastUpdated: '2026-06-25',
    sources: [
      { label: 'Synnex FPT — Website chính thức', url: 'https://synnexfpt.com/en/home-page/' },
      { label: 'Báo Đầu tư: Synnex FPT nâng tầm từ "trading" lên "service"', url: 'https://baodautu.vn/synnex-fpt-nang-tam-tu-trading-len-service-d160766.html' },
    ],
  },
  {
    slug: 'fpt-education',
    name: 'Tổ chức Giáo dục FPT (FPT Education)',
    shortName: 'FPT Education',
    group: 'education',
    tagline: 'Hệ thống giáo dục từ phổ thông đến đại học của FPT.',
    logoText: 'FE',
    accent: '#C4A1FF',
    founded: '1999',
    scale: 'Khoảng 100.000 học sinh/sinh viên quy đổi; hiện diện tại 6 tỉnh/thành (Hà Nội, TP.HCM, Đà Nẵng, Cần Thơ, Buôn Ma Thuột, Quy Nhơn); 180 đối tác tại ~40 quốc gia.',
    business: [
      'Đào tạo Phổ thông, Cao đẳng (FPT Polytechnic), Đại học (Trường ĐH FPT).',
      'Liên kết quốc tế, phát triển sinh viên quốc tế.',
      'Viện Quản trị Kinh doanh, Viện Nghiên cứu Công nghệ; gần đây có đào tạo vi mạch bán dẫn.',
    ],
    businessModel:
      'B2C giáo dục (học phí). Đào tạo gắn chặt với nhu cầu nhân lực công nghệ và doanh nghiệp.',
    culture: [
      'Gắn đào tạo với thực hành và doanh nghiệp; nhiều trải nghiệm quốc tế.',
      'Môi trường trẻ, năng động, đề cao kỹ năng mềm và ngoại ngữ.',
      'Mang đậm tinh thần và giá trị cốt lõi của FPT.',
    ],
    hiring: {
      roles: [
        'Giảng viên / Trợ giảng',
        'Cán bộ tuyển sinh',
        'Chuyên viên đào tạo / vận hành học vụ',
        'Lập trình viên hệ thống học tập (LMS)',
      ],
      fitFor:
        'Cử nhân/sinh viên nhiều ngành muốn theo nghề giáo dục – đào tạo; sinh viên CNTT cho mảng hệ thống e-learning.',
    },
    techStack: [
      'LMS / E-learning', 'Hệ thống quản lý đào tạo', 'Web nội bộ',
    ],
    insiderSecrets: {
      interview: [
        'Giảng viên: thường có vòng dạy thử (demo) + phỏng vấn chuyên môn; vận hành/tuyển sinh: phỏng vấn thái độ & giao tiếp.',
        'Vòng hay rớt: demo dạy khi thiếu kỹ năng truyền đạt/quản lý lớp.',
        'Tình yêu nghề, hiểu sinh viên và kỹ năng sư phạm được đánh giá cao.',
      ],
      culture: [
        'Môi trường giáo dục trẻ, năng động, gắn với doanh nghiệp; vẫn đậm tinh thần FPT.',
        'HR thích người tận tâm với người học, chủ động và sáng tạo trong giảng dạy.',
        'Đề cao trải nghiệm sinh viên và đổi mới phương pháp.',
      ],
      jobNature: [
        'Lịch theo kỳ học, cao điểm vào mùa tuyển sinh/thi cử.',
        'Giảng viên cần cập nhật kiến thức và gắn với thực tế nghề nghiệp.',
        'Vai trò vận hành/tuyển sinh: tương tác nhiều với sinh viên và phụ huynh.',
      ],
    },
    website: 'https://fpt.edu.vn',
    lastUpdated: '2026-06-25',
    sources: [
      { label: 'Tổ chức Giáo dục FPT — Website chính thức', url: 'https://fpt.edu.vn/' },
      { label: 'Wikipedia — Tổ chức Giáo dục FPT', url: 'https://vi.wikipedia.org/wiki/T%E1%BB%95_ch%E1%BB%A9c_Gi%C3%A1o_d%E1%BB%A5c_FPT' },
    ],
  },
  {
    slug: 'fpt-online',
    name: 'Công ty Cổ phần Dịch vụ Trực tuyến FPT (FPT Online)',
    shortName: 'FPT Online',
    group: 'other',
    tagline: 'Đơn vị vận hành báo điện tử VnExpress & quảng cáo trực tuyến.',
    logoText: 'FO',
    accent: '#e11d48',
    founded: '2007',
    scale: 'Vận hành VnExpress (báo điện tử hàng đầu Việt Nam) và Ngoisao.net; cung cấp giải pháp truyền thông số cho hàng nghìn doanh nghiệp.',
    business: [
      'Vận hành báo điện tử VnExpress và cổng giải trí Ngoisao.net.',
      'Quảng cáo trực tuyến & digital marketing (một trong những đơn vị dẫn đầu thị trường).',
      'Giải pháp branding, truyền thông số cho doanh nghiệp.',
    ],
    businessModel:
      'B2B (quảng cáo & digital marketing cho doanh nghiệp) kết hợp B2C (nội dung media thu hút độc giả). Doanh thu chính từ quảng cáo trực tuyến.',
    culture: [
      'Môi trường giao thoa media + công nghệ, nhịp độ nhanh theo dòng tin tức.',
      'Đề cao sáng tạo nội dung và khai thác dữ liệu người dùng.',
      'Văn hóa sản phẩm số hướng tới trải nghiệm độc giả.',
    ],
    hiring: {
      roles: [
        'Lập trình viên Web / Backend',
        'Ad-tech / Data Engineer',
        'Phóng viên / Biên tập viên, Content',
        'Digital Marketing, Sales quảng cáo',
      ],
      fitFor:
        'Sinh viên CNTT (sản phẩm số, ad-tech) lẫn Báo chí – Truyền thông, Marketing muốn làm trong môi trường media công nghệ.',
    },
    techStack: [
      'PHP / Java / Node.js', 'ReactJS', 'Big Data', 'Ad-tech', 'SEO',
    ],
    insiderSecrets: {
      interview: [
        'Nội dung/biên tập: thường có bài test viết; công nghệ/ad-tech: phỏng vấn kỹ thuật như công ty IT.',
        'Vòng hay rớt: bài test viết (với content) hoặc bài kỹ thuật (với dev) — đánh giá năng lực thật.',
        'Nhạy tin tức và hiểu độc giả số là điểm cộng cho mảng nội dung.',
      ],
      culture: [
        'Giao thoa media + công nghệ, nhịp rất nhanh theo dòng sự kiện.',
        'HR thích người nhanh, chủ động, sáng tạo và chịu được áp lực tin nóng.',
        'Đề cao chất lượng nội dung và khai thác dữ liệu người dùng.',
      ],
      jobNature: [
        'Mảng nội dung: áp lực thời sự, có thể phải trực tin sự kiện lớn.',
        'Mảng công nghệ/ad-tech: làm sản phẩm lưu lượng lớn, tối ưu hiệu năng & quảng cáo.',
        'Mọi thứ đo bằng số liệu (traffic, doanh thu quảng cáo).',
      ],
    },
    website: 'https://vnexpress.net',
    lastUpdated: '2026-06-25',
    sources: [
      { label: 'KIS Việt Nam: FPT Online — đơn vị vận hành VnExpress', url: 'https://kisvn.vn/fpt-online-cong-ty-van-hanh-bao-dien-tu-vnexpress-len-san-upcom-voi-gia-tham-chieu-110-000-dong-cp/' },
      { label: 'FPT — Hệ sinh thái công ty thành viên', url: 'https://fpt.com/vi/he-sinh-thai-fpt/cong-ty-thanh-vien' },
    ],
  },
]

// ── Helpers ───────────────────────────────────────────────────────────────
export function getCompanyBySlug(slug: string): Company | undefined {
  return COMPANIES.find((c) => c.slug === slug)
}

export function getAllCompanySlugs(): string[] {
  return COMPANIES.map((c) => c.slug)
}
