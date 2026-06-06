import type { TemplateMeta } from './types'
import { CLASSIC_META } from './classic/meta'
import { MODERN_TECH_META } from './modern-tech/meta'

export const TEMPLATES: Record<string, TemplateMeta> = {
  classic: CLASSIC_META,
  'modern-tech': MODERN_TECH_META,
}

/** Trả về template theo id, fallback về 'classic' nếu không tìm thấy. */
export function getTemplate(id: string): TemplateMeta {
  return TEMPLATES[id] ?? TEMPLATES.classic
}

/** Trả về danh sách tất cả templates. */
export function listTemplates(): TemplateMeta[] {
  return Object.values(TEMPLATES)
}
