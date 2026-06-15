import type { TemplateMeta } from '../types'
import CreativePreview from './preview'
import { CreativePdf } from './pdf'

export const CREATIVE_META: TemplateMeta = {
  id: 'creative',
  name: 'Creative',
  description: 'Màu sắc nổi bật, header lớn — cho ngành Thiết kế / Truyền thông đa phương tiện',
  category: 'Thiết kế & Sáng tạo',
  isPro: true,
  Preview: CreativePreview,
  Pdf: CreativePdf,
}
