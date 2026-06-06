import type { CvData } from '../types'

/**
 * Placeholder preview cho template Modern Tech.
 * Bản preview HTML/CSS thật sẽ được làm ở task T2.b — chỗ này chỉ giữ chỗ
 * để registry có Preview hợp lệ và không lỗi import.
 */
export default function ModernTechPreview({ data: _data }: { data: CvData }) {
  return (
    <div className="mx-auto flex aspect-[210/297] w-full max-w-[600px] items-center justify-center overflow-hidden bg-white text-[#888] text-sm shadow-sm">
      Preview đang được tải...
    </div>
  )
}
