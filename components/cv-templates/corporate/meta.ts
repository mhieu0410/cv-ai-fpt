import type { TemplateMeta } from '../types'
import CorporatePreview from './preview'
import { CorporatePdf } from './pdf'

export const CORPORATE_META: TemplateMeta = {
  id: 'corporate',
  name: 'Corporate',
  description: 'Trang trọng, header navy đậm — cho Tài chính - Ngân hàng / Kế toán',
  category: 'Tài chính & Kế toán',
  isPro: true,
  Preview: CorporatePreview,
  Pdf: CorporatePdf,
}
