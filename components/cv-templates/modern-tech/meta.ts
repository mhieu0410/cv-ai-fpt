import type { TemplateMeta } from '../types'
import ModernTechPreview from './preview'
import { ModernTechPdf } from './pdf'

export const MODERN_TECH_META: TemplateMeta = {
  id: 'modern-tech',
  name: 'Modern Tech',
  description: 'Hiện đại, 2 cột, tông màu FPT — phù hợp ứng tuyển công ty công nghệ',
  isPro: true,
  Preview: ModernTechPreview,
  Pdf: ModernTechPdf,
}
