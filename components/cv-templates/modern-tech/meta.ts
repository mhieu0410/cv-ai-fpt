import type { TemplateMeta } from '../types'
import ModernTechPreview from './preview'
import { ModernTechPdf } from './pdf'

export const MODERN_TECH_META: TemplateMeta = {
  id: 'modern-tech',
  name: 'Modern Tech',
  description: 'Hiện đại, 2 cột, tông màu FPT — cho CNTT / Kỹ thuật phần mềm',
  category: 'CNTT & Phần mềm',
  isPro: true,
  Preview: ModernTechPreview,
  Pdf: ModernTechPdf,
}
