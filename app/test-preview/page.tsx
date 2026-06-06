import type { CvData } from '@/components/cv-templates/types'
import ModernTechPreview from '@/components/cv-templates/modern-tech/preview'

// TEMP: trang test để xem ModernTechPreview với dữ liệu mẫu — xóa sau khi xem xong.

const MOCK_CV: CvData = {
  personal: {
    name: 'Nguyễn Văn An',
    email: 'nguyenvanan@gmail.com',
    phone: '0901 234 567',
  },
  education: [
    { school: 'Đại học FPT', major: 'Kỹ thuật phần mềm', year: '2021 - 2025' },
    { school: 'THPT Chuyên Lê Hồng Phong', major: 'Chuyên Tin học', year: '2018 - 2021' },
  ],
  skills: ['JavaScript', 'TypeScript', 'React', 'Next.js', 'Node.js', 'PostgreSQL', 'Git'],
  projects: [
    {
      name: 'Hệ thống quản lý CV bằng AI',
      description: 'Xây dựng nền tảng tạo và tối ưu CV bằng AI, tích hợp matching JD, sử dụng Next.js và Supabase.',
    },
    {
      name: 'App đặt lịch khám bệnh online',
      description: 'Phát triển ứng dụng web đặt lịch khám bệnh, quản lý hồ sơ bệnh nhân và thông báo nhắc lịch.',
    },
  ],
  activities: [
    { description: 'Thành viên CLB Lập trình - Đại học FPT (2022 - nay)' },
    { description: 'Tình nguyện viên chương trình Mùa hè xanh 2023' },
  ],
}

export default function TestPreviewPage() {
  return (
    <main className="min-h-screen bg-zinc-950 py-10 px-4">
      <div className="mx-auto max-w-2xl">
        <h1 className="mb-6 text-center text-white text-xl font-bold">
          [TEMP] Preview — Modern Tech
        </h1>
        <ModernTechPreview data={MOCK_CV} />
      </div>
    </main>
  )
}
