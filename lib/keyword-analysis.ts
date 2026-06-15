import type { CvData } from '@/components/cv-templates/types'

/**
 * Phân tích từ khoá JD ↔ CV (thuần logic, không cần AI).
 * Tách các "token" có ý nghĩa từ JD, đối chiếu với toàn bộ text của CV.
 */

export interface KeywordAnalysis {
  matched: string[]
  missing: string[]
  matchPct: number
}

// Stopwords tiếng Anh + Việt (rút gọn) — loại các từ không mang tín hiệu kỹ năng.
const STOPWORDS = new Set([
  'and', 'or', 'the', 'a', 'an', 'to', 'of', 'in', 'on', 'for', 'with', 'as', 'is',
  'are', 'be', 'will', 'you', 'your', 'we', 'our', 'have', 'has', 'at', 'by', 'from',
  'this', 'that', 'it', 'all', 'can', 'who', 'about', 'using', 'use', 'work', 'working',
  'job', 'role', 'team', 'good', 'strong', 'plus', 'etc', 'years', 'year', 'experience',
  'và', 'hoặc', 'các', 'của', 'cho', 'với', 'là', 'có', 'một', 'những', 'trong', 'được',
  'theo', 'như', 'về', 'tại', 'khi', 'sẽ', 'bạn', 'chúng', 'tôi', 'kinh', 'nghiệm', 'năm',
  'công', 'việc', 'làm', 'yêu', 'cầu', 'ưu', 'tiên', 'kỹ', 'năng', 'biết', 'tốt',
])

/** Giữ lại token kỹ thuật: chứa ký tự đặc thù (c#, c++, node.js) hoặc dài >= 3, không phải stopword. */
function tokenize(text: string): string[] {
  return text
    .toLowerCase()
    .replace(/[•·,;:|()\[\]{}"'`]/g, ' ')
    .split(/\s+/)
    .map((w) => w.replace(/^[.#+-]+|[.#+-]+$/g, (m) => (/[#+]/.test(m) ? m : '')).trim())
    .filter((w) => w.length >= 2 && !STOPWORDS.has(w) && !/^\d+$/.test(w))
}

function cvText(data: CvData): string {
  const parts: string[] = []
  if (data.personal) parts.push(data.personal.name ?? '')
  for (const e of data.education ?? []) parts.push(e.school, e.major)
  for (const s of data.skills ?? []) parts.push(s)
  for (const p of data.projects ?? []) parts.push(p.name, p.description)
  for (const a of data.activities ?? []) parts.push(a.description)
  return parts.filter(Boolean).join(' ').toLowerCase()
}

/**
 * @param topN số từ khoá JD tối đa đưa vào đối chiếu (theo tần suất xuất hiện).
 */
export function analyzeKeywords(data: CvData, jobText: string, topN = 20): KeywordAnalysis {
  const cv = cvText(data)

  // Đếm tần suất token trong JD, lấy topN làm "từ khoá quan trọng".
  const freq = new Map<string, number>()
  for (const tok of tokenize(jobText)) {
    freq.set(tok, (freq.get(tok) ?? 0) + 1)
  }
  const keywords = [...freq.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, topN)
    .map(([k]) => k)

  const matched: string[] = []
  const missing: string[] = []
  for (const k of keywords) {
    if (cv.includes(k)) matched.push(k)
    else missing.push(k)
  }

  const matchPct = keywords.length ? Math.round((matched.length / keywords.length) * 100) : 0
  return { matched, missing, matchPct }
}
