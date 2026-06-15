import { NextRequest } from 'next/server'
import { createRouteSupabase } from '@/lib/supabase-server'

const AI_API_URL = process.env.AI_MATCH_API_URL || ''

interface MatchResult {
  overall_score: number
  skill_match: number
  experience_match: number
  education_match: number
  missing_skills: string[]
  strengths: string[]
  recommendation: string
}

function isValidMatchResult(value: unknown): value is MatchResult {
  if (!value || typeof value !== 'object') return false
  const r = value as Record<string, unknown>
  return (
    typeof r.overall_score === 'number' &&
    Array.isArray(r.strengths) &&
    Array.isArray(r.missing_skills) &&
    typeof r.recommendation === 'string'
  )
}

/**
 * Chuyển nội dung CV (theo schema thực tế lưu trong bảng `cvs`) thành plain text
 * để gửi cho dịch vụ AI đối chiếu với JD.
 *
 * Schema khớp với CvContent ở `components/CvForm.tsx`:
 *   { personal: {name,email,phone}, education: [{school,major,year}],
 *     skills: string[], projects: [{name,description}], activities?: [{description}] }
 */
function buildCvText(content: Record<string, unknown>): string {
  const parts: string[] = []

  const info = content.personal as Record<string, string> | undefined
  if (info) {
    const fields = [info.name, info.email, info.phone].filter(Boolean)
    if (fields.length) parts.push('=== Thông tin cá nhân ===\n' + fields.join('\n'))
  }

  const edu = content.education as Array<Record<string, string>> | undefined
  if (edu?.length) {
    parts.push(
      '=== Học vấn ===\n' +
        edu
          .map((e) => [e.school, e.major, e.year].filter(Boolean).join(' | '))
          .join('\n'),
    )
  }

  const skills = content.skills as string[] | undefined
  if (skills?.length) {
    parts.push('=== Kỹ năng ===\n' + skills.filter(Boolean).join(', '))
  }

  const projects = content.projects as Array<Record<string, string>> | undefined
  if (projects?.length) {
    parts.push(
      '=== Dự án ===\n' +
        projects
          .map((p) => [p.name, p.description].filter(Boolean).join(': '))
          .join('\n'),
    )
  }

  const activities = content.activities as Array<Record<string, string>> | undefined
  if (activities?.length) {
    parts.push(
      '=== Hoạt động ===\n' +
        activities.map((a) => a.description).filter(Boolean).join('\n'),
    )
  }

  return parts.join('\n\n')
}

export async function POST(request: NextRequest) {
  const supabase = await createRouteSupabase()

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser()

  if (authError || !user) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 })
  }

  let body: { cv_id?: string; job_text?: string }
  try {
    body = await request.json()
  } catch {
    return Response.json({ error: 'Invalid JSON body' }, { status: 400 })
  }

  const { cv_id, job_text } = body

  if (!cv_id) {
    return Response.json({ error: 'cv_id is required' }, { status: 400 })
  }

  if (!job_text || job_text.length < 50) {
    return Response.json({ error: 'job_text must be at least 50 characters' }, { status: 400 })
  }

  const { data: cv, error: cvError } = await supabase
    .from('cvs')
    .select('id, content')
    .eq('id', cv_id)
    .eq('user_id', user.id)
    .single()

  if (cvError || !cv) {
    return Response.json({ error: 'CV not found' }, { status: 404 })
  }

  const cv_text = buildCvText((cv.content as Record<string, unknown>) || {})

  let result: MatchResult

  if (!AI_API_URL || AI_API_URL === 'mock') {
    await new Promise((r) => setTimeout(r, 1500))

    result = {
      overall_score: 72,
      skill_match: 78,
      experience_match: 65,
      education_match: 80,
      missing_skills: ['Docker', 'Cloud deployment (AWS/GCP/Azure)', 'Agile methodology'],
      strengths: [
        'Có kinh nghiệm Java và Spring Boot - 2 công nghệ cốt lõi JD yêu cầu',
        'Có kinh nghiệm với MySQL, phù hợp yêu cầu về database',
        'Có project chứng minh khả năng xây dựng REST API',
      ],
      recommendation:
        'Học Docker cơ bản và bổ sung 1 project dùng Docker vào CV. Deploy 1 project hiện có lên Render/Vercel/Railway. Bổ sung chi tiết về kinh nghiệm JWT authentication và Agile methodology để tăng độ phù hợp.',
    }
  } else {
    let aiResponse: Response
    try {
      aiResponse = await fetch(AI_API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ cv_text, job_text }),
        signal: AbortSignal.timeout(60000),
      })
    } catch (err) {
      if (err instanceof Error && (err.name === 'AbortError' || err.name === 'TimeoutError')) {
        return Response.json(
          {
            error: 'ai_timeout',
            message: 'AI mất quá nhiều thời gian phản hồi (server đang khởi động), vui lòng thử lại',
          },
          { status: 504 },
        )
      }
      return Response.json(
        { error: 'ai_service_error', message: 'AI service tạm thời không phản hồi, vui lòng thử lại sau' },
        { status: 502 },
      )
    }

    if (!aiResponse.ok) {
      return Response.json(
        { error: 'ai_service_error', message: 'AI service tạm thời không phản hồi, vui lòng thử lại sau' },
        { status: 502 },
      )
    }

    let parsed: unknown
    try {
      parsed = await aiResponse.json()
    } catch {
      return Response.json(
        { error: 'ai_service_error', message: 'AI service tạm thời không phản hồi, vui lòng thử lại sau' },
        { status: 502 },
      )
    }

    if (!isValidMatchResult(parsed)) {
      return Response.json(
        { error: 'ai_service_error', message: 'AI service trả về dữ liệu không hợp lệ, vui lòng thử lại sau' },
        { status: 502 },
      )
    }

    result = parsed
  }

  const { data: match, error: insertError } = await supabase
    .from('matches')
    .insert({ cv_id, user_id: user.id, job_text, result_json: result })
    .select('id')
    .single()

  if (insertError || !match) {
    return Response.json({ error: 'Failed to save match result' }, { status: 500 })
  }

  return Response.json({ result, matchId: match.id })
}
