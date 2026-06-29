import type { TemplateMeta } from '../types'
import GradientPreview from './preview'
import { GradientPdf } from './pdf'

export const GRADIENT_META: TemplateMeta = {
  id: 'gradient',
  name: 'Gradient',
  description: 'Header gradient rực rỡ, bố cục thoáng — trẻ trung, hợp ngành sáng tạo & sản phẩm',
  category: 'Thiết kế & Sáng tạo',
  isPro: true,
  Preview: GradientPreview,
  Pdf: GradientPdf,
}
