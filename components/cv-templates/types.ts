import type { ComponentType } from 'react'

/**
 * Hình dạng dữ liệu CV dùng chung cho mọi template (preview web + PDF).
 * Khớp với `content` được lưu trong bảng `cvs` của Supabase.
 */
export interface CvData {
  personal: { name: string; email: string; phone: string }
  education: { school: string; major: string; year: string }[]
  skills: string[]
  projects: { name: string; description: string }[]
  activities?: { description: string }[]
}

/** Metadata mô tả một template, dùng cho registry. */
export interface TemplateMeta {
  id: string
  name: string
  description: string
  /** Nhóm chuyên ngành để gom template trong trình chọn mẫu */
  category: string
  isPro: boolean
  Preview: ComponentType<{ data: CvData }>
  Pdf: ComponentType<{ data: CvData; isPro?: boolean }>
}
