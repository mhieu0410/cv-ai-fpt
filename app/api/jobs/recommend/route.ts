import { NextRequest } from 'next/server'
import { createRouteSupabase } from '@/lib/supabase-server'

const RECOMMEND_URL =
  process.env.JOB_RECOMMEND_API_URL || 'https://ai-job-search-pink.vercel.app/api/recommend'

/** Dựng CV thành đoạn text để gửi cho dịch vụ gợi ý việc. */
function buildCvContent(content: Record<string, unknown>): string {
  const parts: string[] = []

  const p = content.personal as Record<string, string> | undefined
  if (p?.name) parts.push(`Họ tên: ${p.name}`)

  const edu = content.education as Array<Record<string, string>> | undefined
  if (edu?.length) {
    parts.push('Học vấn: ' + edu.map((e) => [e.school, e.major, e.year].filter(Boolean).join(' - ')).join('; '))
  }

  const skills = content.skills as string[] | undefined
  if (skills?.length) parts.push('Skills: ' + skills.filter(Boolean).join(', '))

  const projects = content.projects as Array<Record<string, string>> | undefined
  if (projects?.length) {
    parts.push('Dự án: ' + projects.map((pr) => [pr.name, pr.description].filter(Boolean).join(' - ')).join('; '))
  }

  const acts = content.activities as Array<Record<string, string>> | undefined
  if (acts?.length) parts.push('Hoạt động: ' + acts.map((a) => a.description).filter(Boolean).join('; '))

  return parts.join('. ')
}

export async function POST(request: NextRequest) {
  const supabase = await createRouteSupabase()
  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 })
  }

  let body: { cv_id?: string }
  try {
    body = await request.json()
  } catch {
    return Response.json({ error: 'Invalid JSON body' }, { status: 400 })
  }
  if (!body.cv_id) return Response.json({ error: 'cv_id is required' }, { status: 400 })

  const { data: cv, error: cvError } = await supabase
    .from('cvs')
    .select('id, content')
    .eq('id', body.cv_id)
    .eq('user_id', user.id)
    .single()

  if (cvError || !cv) return Response.json({ error: 'CV not found' }, { status: 404 })

  const cv_content = buildCvContent((cv.content as Record<string, unknown>) || {})
  if (cv_content.length < 10) {
    return Response.json({ error: 'cv_empty', message: 'CV chưa đủ thông tin để gợi ý việc.' }, { status: 400 })
  }

  let aiRes: Response
  try {
    aiRes = await fetch(RECOMMEND_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ cv_content }),
      signal: AbortSignal.timeout(90000),
    })
  } catch (err) {
    if (err instanceof Error && (err.name === 'AbortError' || err.name === 'TimeoutError')) {
      return Response.json(
        { error: 'timeout', message: 'Dịch vụ gợi ý việc mất quá lâu để phản hồi (đang khởi động), thử lại nhé.' },
        { status: 504 },
      )
    }
    return Response.json(
      { error: 'service_error', message: 'Không kết nối được dịch vụ gợi ý việc, thử lại sau.' },
      { status: 502 },
    )
  }

  if (!aiRes.ok) {
    return Response.json(
      { error: 'service_error', message: 'Dịch vụ gợi ý việc tạm thời lỗi, thử lại sau.' },
      { status: 502 },
    )
  }

  let data: unknown
  try {
    data = await aiRes.json()
  } catch {
    return Response.json({ error: 'service_error', message: 'Dữ liệu trả về không hợp lệ.' }, { status: 502 })
  }

  return Response.json(data)
}
