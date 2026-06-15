import type { TemplateMeta } from '../types'
import ClassicPreview from './preview'
import { ClassicPdf } from './pdf'

export const CLASSIC_META: TemplateMeta = {
  id: 'classic',
  name: 'Classic',
  description: 'Cổ điển, 1 cột, đen trắng — phù hợp mọi ngành',
  category: 'Mọi ngành',
  isPro: false,
  Preview: ClassicPreview,
  Pdf: ClassicPdf,
}
