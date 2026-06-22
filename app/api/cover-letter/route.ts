import { NextRequest } from 'next/server'
import { createRouteSupabase } from '@/lib/supabase-server'

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

  // extract name from CV content to make the mock cover letter slightly personalized
  const content = (cv.content as Record<string, any>) || {}
  const candidateName = content.personal?.name || 'Ứng viên'

  // Mocking an AI delay to allow the terminal animation to play
  await new Promise((resolve) => setTimeout(resolve, 2000))

  const mockCoverLetter = `Kính gửi Bộ phận Tuyển dụng,

Tôi viết thư này để bày tỏ sự quan tâm mãnh liệt đối với vị trí mà Quý công ty đang tuyển dụng. Thông qua thông tin tuyển dụng, tôi nhận thấy định hướng phát triển của công ty hoàn toàn phù hợp với mục tiêu nghề nghiệp và những kỹ năng mà tôi đã tích lũy được trong thời gian qua.

Với kinh nghiệm làm việc thực tế cùng nền tảng kiến thức vững chắc (như đã trình bày chi tiết trong CV đính kèm), tôi tự tin mình có thể đóng góp giá trị ngay lập tức vào thành công chung của đội ngũ. Cụ thể, tôi đã có cơ hội cọ xát với các dự án đòi hỏi tính chuyên môn cao, rèn luyện tư duy giải quyết vấn đề nhạy bén và khả năng thích nghi nhanh chóng với công nghệ mới.

Bên cạnh năng lực chuyên môn, tôi còn là một người có tinh thần trách nhiệm, luôn sẵn sàng học hỏi và phối hợp hiệu quả cùng đồng nghiệp. Tôi tin rằng sự nhiệt huyết và thái độ làm việc chuyên nghiệp của mình sẽ đáp ứng được những kỳ vọng khắt khe nhất từ Quý công ty.

Rất mong Quý công ty xem xét hồ sơ của tôi. Tôi luôn sẵn sàng cho một cuộc phỏng vấn trực tiếp để trao đổi sâu hơn về cách tôi có thể đóng góp vào sự phát triển của công ty.

Xin chân thành cảm ơn Quý công ty đã dành thời gian xem xét thư ứng tuyển này.

Trân trọng,

${candidateName}`

  return Response.json({ cover_letter: mockCoverLetter })
}
