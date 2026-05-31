import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  await request.json()

  await new Promise((resolve) =>
    setTimeout(resolve, 1000 + Math.random() * 1000)
  )

  return NextResponse.json({
    suggestions: [
      {
        major: 'Web Development',
        score: 0.85,
        reason: 'Bạn có kinh nghiệm với React và project frontend.',
      },
      {
        major: 'Data Analysis',
        score: 0.72,
        reason: 'Khả năng phân tích và làm việc với dữ liệu phù hợp.',
      },
      {
        major: 'Mobile Development',
        score: 0.65,
        reason:
          'Có thể phát triển hướng app di động dựa trên nền tảng hiện tại.',
      },
    ],
  })
}
