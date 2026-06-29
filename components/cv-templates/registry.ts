import type { TemplateMeta } from './types'
import { CLASSIC_META } from './classic/meta'
import { MODERN_TECH_META } from './modern-tech/meta'
import { BUSINESS_META } from './business/meta'
import { CREATIVE_META } from './creative/meta'
import { NEO_BRUTAL_META } from './neo-brutal/meta'
import { GRADIENT_META } from './gradient/meta'
import { SIDEBAR_META } from './sidebar/meta'
import { DATA_SCIENCE_META } from './data-science/meta'
import { ELEGANT_META } from './elegant/meta'
import { CORPORATE_META } from './corporate/meta'

export const TEMPLATES: Record<string, TemplateMeta> = {
  classic: CLASSIC_META,
  'modern-tech': MODERN_TECH_META,
  business: BUSINESS_META,
  creative: CREATIVE_META,
  'neo-brutal': NEO_BRUTAL_META,
  gradient: GRADIENT_META,
  sidebar: SIDEBAR_META,
  'data-science': DATA_SCIENCE_META,
  elegant: ELEGANT_META,
  corporate: CORPORATE_META,
}

/** Trả về template theo id, fallback về 'classic' nếu không tìm thấy. */
export function getTemplate(id: string): TemplateMeta {
  return TEMPLATES[id] ?? TEMPLATES.classic
}

/** Trả về danh sách tất cả templates. */
export function listTemplates(): TemplateMeta[] {
  return Object.values(TEMPLATES)
}

/** Gom templates theo category, giữ thứ tự xuất hiện. */
export function listTemplatesByCategory(): { category: string; templates: TemplateMeta[] }[] {
  const groups: { category: string; templates: TemplateMeta[] }[] = []
  for (const t of listTemplates()) {
    let g = groups.find((x) => x.category === t.category)
    if (!g) { g = { category: t.category, templates: [] }; groups.push(g) }
    g.templates.push(t)
  }
  return groups
}
