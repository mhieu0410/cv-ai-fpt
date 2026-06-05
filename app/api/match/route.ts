import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { NextRequest } from 'next/server'

const AI_API_URL = process.env.AI_MATCH_API_URL || ''

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

  let result: string
  let isMock = false

  if (!AI_API_URL || AI_API_URL === 'mock') {
    await new Promise((r) => setTimeout(r, 1500))

    result = `### Đánh giá tổng quan

CV của bạn **match khoảng 72%** với JD này. Đây là mức độ phù hợp **trung bình - khá**, có thể ứng tuyển nhưng cần cải thiện một số điểm.

### Điểm mạnh
- **Java và Spring Boot**: Bạn đã có kinh nghiệm với 2 công nghệ cốt lõi JD yêu cầu
- **MySQL**: Phù hợp với yêu cầu về database
- **REST APIs**: Có project chứng minh khả năng xây dựng API
- **Background FPT**: Là điểm cộng vì JD ưu tiên sinh viên có nền tảng kỹ thuật vững

### Điểm thiếu
- **Docker**: JD yêu cầu kinh nghiệm Docker nhưng CV chưa thấy nhắc đến
- **Cloud deployment**: Chưa có bằng chứng từng deploy lên cloud (AWS, GCP, Azure)
- **Authentication mechanisms**: Có nhắc JWT nhưng cần làm rõ kinh nghiệm thực tế

### Khuyến nghị
1. Học Docker cơ bản (1-2 tuần) và **bổ sung 1 project dùng Docker** vào CV
2. Deploy 1 project hiện có lên Render/Vercel/Railway để có dòng "Deployed on..."
3. Trong phần kinh nghiệm JWT, thêm chi tiết: *"Implemented JWT-based authentication for X project, handling Y concurrent users"*
4. Bổ sung 1 dòng về Agile methodology trong skills (JD có nhắc)

Với những điều chỉnh trên, bạn có thể nâng match lên **85-90%**.`

    isMock = true
  } else {
    const aiResponse = await fetch(AI_API_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ cv_text, job_text }),
    })

    if (!aiResponse.ok) {
      return Response.json({ error: 'AI service error' }, { status: 502 })
    }

    result = await aiResponse.text()
  }

  const { data: match, error: insertError } = await supabase
    .from('matches')
    .insert({ cv_id, user_id: user.id, job_text, result_text: result })
    .select('id')
    .single()

  if (insertError || !match) {
    return Response.json({ error: 'Failed to save match result' }, { status: 500 })
  }

  return Response.json({ result, matchId: match.id, isMock })
}
