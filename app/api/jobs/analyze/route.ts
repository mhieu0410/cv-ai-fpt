import { NextRequest } from 'next/server'
import { createRouteSupabase } from '@/lib/supabase-server'

const ANALYZE_URL =
  process.env.JOB_ANALYZE_API_URL || 'https://ai-job-search-pink.vercel.app/api/analyze-job'

interface AnalyzeRaw {
  fit_score?: number
  matching_skills?: string[]
  missing_skills?: string[]
  why_good_fit?: string
  cover_letter?: string
  interview_tips?: string[]
}

export async function POST(request: NextRequest) {
  const supabase = await createRouteSupabase()
  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) return Response.json({ error: 'Unauthorized' }, { status: 401 })

  let body: { cv_id?: string; cv_analysis?: unknown; job?: Record<string, unknown> }
  try {
    body = await request.json()
  } catch {
    return Response.json({ error: 'Invalid JSON body' }, { status: 400 })
  }

  const { cv_id, cv_analysis, job } = body
  if (!cv_id || !cv_analysis || !job) {
    return Response.json({ error: 'cv_id, cv_analysis và job là bắt buộc' }, { status: 400 })
  }

  // Xác minh CV thuộc về user
  const { data: cv, error: cvError } = await supabase
    .from('cvs').select('id').eq('id', cv_id).eq('user_id', user.id).single()
  if (cvError || !cv) return Response.json({ error: 'CV not found' }, { status: 404 })

  // Gọi dịch vụ phân tích
  let aiRes: Response
  try {
    aiRes = await fetch(ANALYZE_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ cv_analysis, job }),
      signal: AbortSignal.timeout(90000),
    })
  } catch (err) {
    if (err instanceof Error && (err.name === 'AbortError' || err.name === 'TimeoutError')) {
      return Response.json({ error: 'ai_timeout', message: 'AI mất quá lâu để phản hồi (đang khởi động), thử lại nhé.' }, { status: 504 })
    }
    return Response.json({ error: 'ai_service_error', message: 'AI tạm thời không phản hồi, thử lại sau.' }, { status: 502 })
  }

  if (!aiRes.ok) {
    return Response.json({ error: 'ai_service_error', message: 'AI tạm thời lỗi, thử lại sau.' }, { status: 502 })
  }

  let raw: AnalyzeRaw
  try {
    raw = (await aiRes.json()) as AnalyzeRaw
  } catch {
    return Response.json({ error: 'ai_service_error', message: 'Dữ liệu AI trả về không hợp lệ.' }, { status: 502 })
  }

  if (typeof raw.fit_score !== 'number') {
    return Response.json({ error: 'ai_service_error', message: 'AI trả về thiếu điểm khớp.' }, { status: 502 })
  }

  // fit_score có thể là 0..1 hoặc 0..100 → chuẩn hoá về 0..100
  const overall_score = raw.fit_score <= 1
    ? Math.round(raw.fit_score * 100)
    : Math.round(raw.fit_score)

  const result = {
    ...raw,
    // Các field chuẩn hoá để tương thích trang Lịch sử match (đọc shape cũ)
    overall_score,
    recommendation: raw.why_good_fit ?? '',
  }

  const jobRec = job as Record<string, string>
  const job_text = jobRec.job_description || jobRec.title || 'Công việc'

  await supabase.from('matches').insert({
    cv_id,
    user_id: user.id,
    job_text,
    result_json: result,
  })

  return Response.json({ result })
}
