import type { TemplateMeta } from '../types'
import DataSciencePreview from './preview'
import { DataSciencePdf } from './pdf'

export const DATA_SCIENCE_META: TemplateMeta = {
  id: 'data-science',
  name: 'Data Science',
  description: 'Header tối, điểm nhấn cyan, phong cách kỹ thuật — cho AI / Khoa học dữ liệu',
  category: 'AI & Khoa học dữ liệu',
  isPro: true,
  Preview: DataSciencePreview,
  Pdf: DataSciencePdf,
}
