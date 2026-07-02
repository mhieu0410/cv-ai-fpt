'use client'

import type { AtsResult } from '@/lib/ats-score'

/**
 * Feature 7 — thay thanh ATS "khô" bằng coaching: điểm + gợi ý "+N điểm"
 * cho các tiêu chí chưa đạt tối đa.
 */
export default function CompletionCoach({ result }: { result: AtsResult }) {
  const color =
    result.level === 'excellent' ? '#10b981'
    : result.level === 'good' ? '#22c55e'
    : result.level === 'fair' ? '#f59e0b'
    : '#ef4444'
  const label =
    result.level === 'excellent' ? 'Xuất sắc'
    : result.level === 'good' ? 'Tốt'
    : result.level === 'fair' ? 'Khá'
    : 'Cần bổ sung'

  // Gợi ý: tiêu chí chưa đạt tối đa, ưu tiên thiếu nhiều điểm nhất, lấy top 4
  const suggestions = result.checks
    .filter((c) => c.earned < c.weight)
    .sort((a, b) => (b.weight - b.earned) - (a.weight - a.earned))
    .slice(0, 4)

  return (
    <div className="mb-12 flex flex-col gap-5 rounded-[2rem] border-4 border-black bg-white px-8 py-6 shadow-[8px_8px_0_0_#000] transition-all duration-300 hover:-translate-y-1 hover:shadow-[12px_12px_0_0_#000]">
      <div className="flex items-center justify-between">
        <span className="text-xs font-black uppercase tracking-[0.15em] text-zinc-500">Trợ lý hoàn thiện CV</span>
        <span
          className="rounded-xl border-2 border-black bg-zinc-50 px-4 py-1.5 text-[13px] font-black shadow-[2px_2px_0_0_#000]"
          style={{ color }}
        >
          {result.score}/100 · {label}
        </span>
      </div>

      <div className="relative h-4 overflow-hidden rounded-full border-2 border-black bg-zinc-100">
        <div className="h-full border-r-2 border-black transition-all duration-500" style={{ width: `${result.score}%`, background: color }} />
      </div>

      {suggestions.length > 0 ? (
        <div>
          <p className="mb-2 text-[12px] font-black uppercase tracking-widest text-zinc-400">Nâng điểm nhanh</p>
          <ul className="flex flex-col gap-2">
            {suggestions.map((c) => (
              <li key={c.id} className="flex items-start gap-2.5 rounded-xl border-2 border-black bg-zinc-50 px-3 py-2 shadow-[2px_2px_0_0_#000]">
                <span className="mt-0.5 shrink-0 rounded-md border-2 border-black bg-yellow-300 px-1.5 py-0.5 text-[11px] font-black text-black">
                  +{c.weight - c.earned}
                </span>
                <span className="text-[13px] font-semibold leading-relaxed text-zinc-700">{c.detail}</span>
              </li>
            ))}
          </ul>
        </div>
      ) : (
        <p className="rounded-xl border-2 border-black bg-green-50 px-4 py-3 text-[13px] font-bold text-green-700 shadow-[2px_2px_0_0_#000]">
          🎉 Tuyệt vời! CV của bạn đã khá hoàn chỉnh.
        </p>
      )}
    </div>
  )
}
