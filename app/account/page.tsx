import type { Metadata } from 'next'
import AppNavbar from '@/components/AppNavbar'
import AccountClient from './AccountClient'

export const metadata: Metadata = {
  title: 'Tài khoản — Cài đặt thông tin',
  description: 'Cập nhật tên hiển thị, email và mật khẩu tài khoản của bạn.',
}

export default function AccountPage() {
  return (
    <>
      <AppNavbar />
      <AccountClient />
    </>
  )
}
