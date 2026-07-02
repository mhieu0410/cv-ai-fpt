'use client'

import { useState } from 'react'

/**
 * Nút "Cần gợi ý?" tái sử dụng cho mọi section (Feature 5).
 * Mở ra panel chip gợi ý; bấm chip để import vào section.
 */
export default function AICoachCard({
  label = 'Cần gợi ý?',
  heading,
  items,
  onPick,
  onPickAll,
}: {
  label?: string
  heading: string
  items: string[]
  onPick: (value: string) => void
  onPickAll?: () => void
}) {
  const [open, setOpen] = useState(false)

  return (
    <div className="mt-3">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="inline-flex items-center gap-1.5 rounded-lg border-2 border-black bg-yellow-300 px-3 py-1.5 text-[12px] font-black uppercase tracking-widest text-black shadow-[2px_2px_0_0_#000] transition-all hover:-translate-y-0.5 hover:shadow-[3px_3px_0_0_#000] active:translate-y-0 active:shadow-none"
      >
        💡 {label}
      </button>

      {open && (
        <div className="mt-2 rounded-xl border-2 border-black bg-white p-3 shadow-[3px_3px_0_0_#000]">
          <p className="mb-2 text-[12px] font-bold text-zinc-500">{heading}</p>
          <div className="flex flex-wrap gap-1.5">
            {items.map((it) => (
              <button
                key={it}
                type="button"
                onClick={() => onPick(it)}
                className="rounded-lg border-2 border-black bg-zinc-50 px-2.5 py-1 text-[12px] font-bold text-black shadow-[2px_2px_0_0_#000] transition-all hover:-translate-y-0.5 hover:bg-yellow-300 active:translate-y-0 active:shadow-none"
              >
                + {it}
              </button>
            ))}
          </div>
          {onPickAll && (
            <button
              type="button"
              onClick={onPickAll}
              className="mt-2.5 text-[11px] font-black uppercase tracking-widest text-[var(--fpt-orange)] hover:underline"
            >
              Thêm tất cả →
            </button>
          )}
        </div>
      )}
    </div>
  )
}
