'use client'

import { useState } from 'react'
import { ACHIEVEMENTS, generateAchievementText } from './data'

/**
 * Feature 4 — checklist thành tích; mục được chọn có thể nhập chi tiết,
 * bấm thêm sẽ sinh câu và append nhiều mục cùng lúc.
 */
export default function AchievementChecklist({ onAdd }: { onAdd: (texts: string[]) => void }) {
  const [checked, setChecked] = useState<Record<string, boolean>>({})
  const [details, setDetails] = useState<Record<string, string>>({})

  const toggle = (key: string) => setChecked((c) => ({ ...c, [key]: !c[key] }))
  const selectedCount = Object.values(checked).filter(Boolean).length

  function confirm() {
    const texts = ACHIEVEMENTS
      .filter((a) => checked[a.key])
      .map((a) => generateAchievementText(a, details[a.key] ?? ''))
    if (texts.length) onAdd(texts)
    setChecked({})
    setDetails({})
  }

  return (
    <div className="rounded-2xl border-2 border-black bg-white p-5 shadow-[4px_4px_0_0_#000]">
      <p className="mb-3 text-[13px] font-black uppercase tracking-widest text-zinc-500">Bạn có thành tích nào? Tích chọn:</p>

      <div className="flex flex-col gap-2">
        {ACHIEVEMENTS.map((a) => {
          const on = !!checked[a.key]
          return (
            <div key={a.key}>
              <button
                type="button"
                onClick={() => toggle(a.key)}
                className={`flex w-full items-center gap-2.5 rounded-xl border-2 border-black px-3 py-2 text-left text-[13px] font-bold shadow-[2px_2px_0_0_#000] transition-all hover:-translate-y-0.5 active:translate-y-0 active:shadow-none ${
                  on ? 'bg-yellow-300 text-black' : 'bg-white text-zinc-700 hover:bg-zinc-50'
                }`}
              >
                <span className={`grid h-5 w-5 place-items-center rounded border-2 border-black ${on ? 'bg-[var(--fpt-orange)] text-white' : 'bg-white'}`}>
                  {on && <svg className="h-3 w-3 stroke-[4]" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>}
                </span>
                {a.label}
              </button>
              {on && a.needsDetail && (
                <input
                  value={details[a.key] ?? ''}
                  onChange={(e) => setDetails((d) => ({ ...d, [a.key]: e.target.value }))}
                  placeholder={a.detailPlaceholder}
                  className="mt-1.5 ml-8 w-[calc(100%-2rem)] rounded-lg border-2 border-black bg-zinc-50 px-3 py-1.5 text-[12px] font-semibold shadow-[2px_2px_0_0_#000] focus:translate-y-[2px] focus:shadow-none focus:outline-none"
                />
              )}
            </div>
          )
        })}
      </div>

      <div className="mt-4 flex justify-end">
        <button
          type="button"
          onClick={confirm}
          disabled={selectedCount === 0}
          className="rounded-lg border-2 border-black bg-[var(--fpt-orange)] px-4 py-2 text-[12px] font-black uppercase tracking-widest text-white shadow-[2px_2px_0_0_#000] transition-all hover:-translate-y-0.5 active:translate-y-0 active:shadow-none disabled:opacity-40"
        >
          + Thêm {selectedCount > 0 ? `${selectedCount} thành tích` : 'thành tích'}
        </button>
      </div>
    </div>
  )
}
