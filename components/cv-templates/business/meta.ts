import type { TemplateMeta } from '../types'
import BusinessPreview from './preview'
import { BusinessPdf } from './pdf'

export const BUSINESS_META: TemplateMeta = {
  id: 'business',
  name: 'Business',
  description: 'Chuyên nghiệp, tông navy trang nhã — cho Quản trị kinh doanh / Marketing',
  category: 'Kinh doanh & Marketing',
  isPro: false,
  Preview: BusinessPreview,
  Pdf: BusinessPdf,
}
