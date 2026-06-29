import type { TemplateMeta } from '../types'
import SidebarPreview from './preview'
import { SidebarPdf } from './pdf'

export const SIDEBAR_META: TemplateMeta = {
  id: 'sidebar',
  name: 'Sidebar',
  description: 'Cột trái màu đậm chứa thông tin & kỹ năng, cột phải nội dung — gọn gàng, dễ đọc',
  category: 'Thiết kế & Sáng tạo',
  isPro: true,
  Preview: SidebarPreview,
  Pdf: SidebarPdf,
}
