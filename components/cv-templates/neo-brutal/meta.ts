import type { TemplateMeta } from '../types'
import NeoBrutalPreview from './preview'
import { NeoBrutalPdf } from './pdf'

export const NEO_BRUTAL_META: TemplateMeta = {
  id: 'neo-brutal',
  name: 'Neo Brutalism',
  description: 'Viền đen dày, khối màu cam/vàng nổi bật — chất riêng, hợp ngành sáng tạo & marketing',
  category: 'Thiết kế & Sáng tạo',
  isPro: true,
  Preview: NeoBrutalPreview,
  Pdf: NeoBrutalPdf,
}
