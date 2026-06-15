import type { TemplateMeta } from '../types'
import ElegantPreview from './preview'
import { ElegantPdf } from './pdf'

export const ELEGANT_META: TemplateMeta = {
  id: 'elegant',
  name: 'Elegant',
  description: 'Tinh tế, căn giữa, điểm nhấn vàng đồng — cho Ngôn ngữ / Truyền thông / PR',
  category: 'Ngôn ngữ & Truyền thông',
  isPro: true,
  Preview: ElegantPreview,
  Pdf: ElegantPdf,
}
