import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { NextRequest } from 'next/server'

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

function buildCvText(content: Record<string, unknown>): string {
  const parts: string[] = []

  const info = content.personalInfo as Record<string, string> | undefined
  if (info) {
    const fields = [info.name, info.email, info.phone, info.address, info.summary].filter(Boolean)
    if (fields.length) parts.push('=== Thông tin cá nhân ===\n' + fields.join('\n'))
  }

  const edu = content.education as Array<Record<string, string>> | undefined
  if (edu?.length) {
    parts.push(
      '=== Học vấn ===\n' +
        edu
          .map((e) => [e.school, e.degree, e.field, e.startDate, e.endDate, e.description].filter(Boolean).join(' | '))
          .join('\n'),
    )
  }

  const skills = content.skills as Array<Record<string, string>> | undefined
  if (skills?.length) {
    parts.push('=== Kỹ năng ===\n' + skills.map((s) => [s.name, s.level].filter(Boolean).join(': ')).join('\n'))
  }

  const exp = content.experience as Array<Record<string, string>> | undefined
  if (exp?.length) {
    parts.push(
      '=== Kinh nghiệm ===\n' +
        exp
          .map((e) =>
            [e.company, e.position, e.startDate, e.endDate, e.description].filter(Boolean).join(' | '),
          )
          .join('\n'),
    )
  }

  const projects = content.projects as Array<Record<string, string>> | undefined
  if (projects?.length) {
    parts.push(
      '=== Dự án ===\n' +
        projects
          .map((p) => [p.name, p.description, p.technologies, p.url].filter(Boolean).join(' | '))
          .join('\n'),
    )
  }

  const certs = content.certifications as Array<Record<string, string>> | undefined
  if (certs?.length) {
    parts.push(
      '=== Chứng chỉ ===\n' +
        certs.map((c) => [c.name, c.issuer, c.date].filter(Boolean).join(' | ')).join('\n'),
    )
  }

  return parts.join('\n\n')
}

export async function POST(request: NextRequest) {
  const cookieStore = await cookies()

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => {
            cookieStore.set(name, value, options)
          })
        },
      },
    },
  )

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
