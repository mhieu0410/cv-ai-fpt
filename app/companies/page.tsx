import type { Metadata } from 'next'
import AppNavbar from '@/components/AppNavbar'
import CompaniesClient from './CompaniesClient'

export const metadata: Metadata = {
  title: 'Khám phá FPT — Hiểu nơi bạn ứng tuyển',
  description:
    'Tìm hiểu các công ty thành viên của Tập đoàn FPT: lĩnh vực, mô hình kinh doanh, văn hóa, vị trí tuyển dụng và tech stack — giúp bạn chọn đúng nơi và viết CV trúng đích.',
}

export default function CompaniesPage() {
  return (
    <>
      <AppNavbar />
      <CompaniesClient />
    </>
  )
}
