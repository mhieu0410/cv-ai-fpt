'use client'

import { useState } from 'react'
import Link from 'next/link'
import { pdf } from '@react-pdf/renderer'
import { getTemplate } from '@/components/cv-templates/registry'

interface CvContent {
  personal:    { name: string; email: string; phone: string }
  education:   { school: string; major: string; year: string }[]
  skills:      string[]
  projects:    { name: string; description: string }[]
  activities?: { description: string }[]
}

interface Props {
  cvId:     string
  cvTitle:  string
  content:  CvContent
  template: string
}

export default function ViewActions({ cvId, cvTitle, content, template }: Props) {
  const [downloading, setDownloading] = useState<string | null>(null)
  const [copied, setCopied] = useState(false)

  async function handleDownload(templateId: string) {
    setDownloading(templateId)
    try {
      const { Pdf } = getTemplate(templateId)
      const blob = await pdf(
        <Pdf data={content} />
      ).toBlob()
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `CV_${cvTitle.replace(/\s+/g, '_')}.pdf`
      a.click()
      URL.revokeObjectURL(url)
    } finally {
      setDownloading(null)
    }
  }

  async function handleShare() {
    const url = `${window.location.origin}/share/${cvId}`
    try {
      await navigator.clipboard.writeText(url)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      window.prompt('Sao chép link chia sẻ:', url)
    }
  }

  return (
    <div className="flex flex-wrap items-center gap-2">
      <Link
        href={`/cv/${cvId}/edit`}
        className="flex items-center gap-1.5 px-3.5 py-2 text-sm text-zinc-300 hover:text-white border border-zinc-700 hover:border-zinc-500 rounded-lg transition-colors"
      >
        ✏️ Sửa
      </Link>

      <button
        type="button"
        onClick={() => handleDownload(template)}
        disabled={downloading !== null}
        className="flex items-center gap-1.5 px-3.5 py-2 text-sm text-zinc-300 hover:text-white border border-zinc-700 hover:border-zinc-500 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
      >
        📥 {downloading === template ? 'Đang tạo...' : 'Tải PDF'}
      </button>

      <Link
        href={`/cv/${cvId}/ats`}
        className="flex items-center gap-1.5 px-3.5 py-2 text-sm text-emerald-400 hover:text-emerald-200 border border-emerald-800 hover:border-emerald-500 rounded-lg transition-colors"
      >
        📊 Điểm ATS
      </Link>
      <Link
        href={`/cv/${cvId}/match`}
        className="flex items-center gap-1.5 px-3.5 py-2 text-sm text-violet-400 hover:text-violet-200 border border-violet-800 hover:border-violet-500 rounded-lg transition-colors"
      >
        🎯 Match với JD
      </Link>

      <button
        type="button"
        onClick={handleShare}
        className="flex items-center gap-1.5 px-3.5 py-2 text-sm text-zinc-300 hover:text-white border border-zinc-700 hover:border-zinc-500 rounded-lg transition-colors"
      >
        {copied ? '✓ Đã copy link' : '🔗 Chia sẻ'}
      </button>
    </div>
  )
}
