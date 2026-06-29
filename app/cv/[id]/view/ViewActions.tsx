'use client'

import { useState } from 'react'
import Link from 'next/link'
import { pdf } from '@react-pdf/renderer'
import { Pencil, Download, BarChart3, Target, Link2, Check } from 'lucide-react'
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
  isPro:    boolean
}

export default function ViewActions({ cvId, cvTitle, content, template, isPro }: Props) {
  const [downloading, setDownloading] = useState<string | null>(null)
  const [copied, setCopied] = useState(false)

  async function handleDownload(templateId: string) {
    setDownloading(templateId)
    try {
      const { Pdf } = getTemplate(templateId)
      const blob = await pdf(
        <Pdf data={content} isPro={isPro} />
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

  const base =
    'inline-flex h-9 items-center gap-1.5 rounded-lg px-3 text-sm font-medium transition-colors disabled:cursor-not-allowed disabled:opacity-60'
  const secondary = `${base} border border-zinc-200 bg-white text-zinc-700 hover:bg-zinc-50 hover:text-zinc-900`
  const primary = `${base} bg-[var(--fpt-orange)] text-white shadow-sm hover:brightness-95`

  return (
    <div className="flex flex-wrap items-center gap-2">
      <Link href={`/cv/${cvId}/edit`} className={secondary}>
        <Pencil className="h-4 w-4" /> Sửa
      </Link>

      <button
        type="button"
        onClick={() => handleDownload(template)}
        disabled={downloading !== null}
        className={primary}
      >
        <Download className="h-4 w-4" />
        {downloading === template ? 'Đang tạo...' : 'Tải PDF'}
      </button>

      <Link href={`/cv/${cvId}/ats`} className={secondary}>
        <BarChart3 className="h-4 w-4" /> Điểm ATS
      </Link>
      <Link href={`/cv/${cvId}/match`} className={secondary}>
        <Target className="h-4 w-4" /> Match với JD
      </Link>

      <button type="button" onClick={handleShare} className={secondary}>
        {copied ? <Check className="h-4 w-4 text-green-600" /> : <Link2 className="h-4 w-4" />}
        {copied ? 'Đã copy link' : 'Chia sẻ'}
      </button>
    </div>
  )
}
