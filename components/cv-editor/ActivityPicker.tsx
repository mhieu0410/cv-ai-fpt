'use client'

import { useState } from 'react'
import { ACTIVITY_TYPES, generateActivityText, type ActivityType } from './data'

/**
 * Feature 3 — chọn thẻ loại hoạt động, mở rộng ô chi tiết, sinh câu rồi append.
 */
export default function ActivityPicker({ onAdd }: { onAdd: (text: string) => void }) {
  const [selected, setSelected] = useState<ActivityType | null>(null)
  const [detail, setDetail] = useState('')

  function confirm() {
    if (!selected) return
    onAdd(generateActivityText(selected, detail))
    setSelected(null)
    setDetail('')
  }

  return (
    <div className="rounded-2xl border-2 border-black bg-white p-5 shadow-[4px_4px_0_0_#000]">
      <p className="mb-3 text-[13px] font-black uppercase tracking-widest text-zinc-500">Bạn đã tham gia hoạt động nào?</p>

      <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
        {ACTIVITY_TYPES.map((t) => (
          <button
            key={t.key}
            type="button"
            onClick={() => { setSelected(t); setDetail('') }}
            className={`flex items-center gap-2 rounded-xl border-2 border-black px-3 py-2.5 text-left text-[13px] font-bold shadow-[2px_2px_0_0_#000] transition-all hover:-translate-y-0.5 active:translate-y-0 active:shadow-none ${
              selected?.key === t.key ? 'bg-yellow-300 text-black' : 'bg-white text-zinc-700 hover:bg-zinc-50'
            }`}
          >
            <span className="text-base">{t.emoji}</span> {t.label}
          </button>
        ))}
      </div>

      {selected && (
        <div className="mt-4 rounded-xl border-2 border-black bg-zinc-50 p-4 shadow-[2px_2px_0_0_#000]">
          <label className="mb-1.5 block text-[13px] font-black text-zinc-900">{selected.emoji} {selected.label}</label>
          <textarea
            autoFocus
            rows={2}
            value={detail}
            onChange={(e) => setDetail(e.target.value)}
            placeholder={selected.placeholder}
            className="w-full resize-none rounded-xl border-2 border-black bg-white px-3 py-2 text-[13px] font-semibold leading-relaxed shadow-[2px_2px_0_0_#000] focus:translate-y-[2px] focus:shadow-none focus:outline-none"
          />
          <div className="mt-2 flex justify-end gap-2">
            <button type="button" onClick={() => setSelected(null)} className="rounded-lg border-2 border-black bg-white px-3 py-1.5 text-[12px] font-black uppercase tracking-widest text-zinc-600 shadow-[2px_2px_0_0_#000]">Hủy</button>
            <button type="button" onClick={confirm} className="rounded-lg border-2 border-black bg-[var(--fpt-orange)] px-4 py-1.5 text-[12px] font-black uppercase tracking-widest text-white shadow-[2px_2px_0_0_#000] transition-all hover:-translate-y-0.5">+ Thêm hoạt động</button>
          </div>
        </div>
      )}
    </div>
  )
}
