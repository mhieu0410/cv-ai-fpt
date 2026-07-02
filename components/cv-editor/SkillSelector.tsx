'use client'

import { useState } from 'react'
import { INDUSTRIES } from './data'
import AICoachCard from './AICoachCard'

/**
 * Feature 1 — chọn kỹ năng bằng chip theo NGÀNH, vẫn cho gõ tự do.
 * Người dùng chọn ngành trước → gợi ý kỹ năng phù hợp ngành đó.
 * Controlled: nhận `value` (string[]) và `onChange`.
 */
export default function SkillSelector({
  value,
  onChange,
  industryKey,
  onIndustryChange,
}: {
  value: string[]
  onChange: (skills: string[]) => void
  industryKey: string | null
  onIndustryChange: (key: string | null) => void
}) {
  const [custom, setCustom] = useState('')
  const industry = INDUSTRIES.find((i) => i.key === industryKey) ?? null

  const has = (s: string) => value.some((v) => v.toLowerCase() === s.trim().toLowerCase())
  const add = (s: string) => {
    const t = s.trim()
    if (!t || has(t)) return
    onChange([...value, t])
  }
  const remove = (s: string) => onChange(value.filter((v) => v !== s))
  const toggle = (s: string) => {
    const existing = value.find((v) => v.toLowerCase() === s.toLowerCase())
    if (existing) remove(existing)
    else add(s)
  }

  function handleCustomAdd() {
    if (!custom.trim()) return
    add(custom)
    setCustom('')
  }

  return (
    <div className="rounded-[2rem] border-4 border-black bg-white p-6 shadow-[8px_8px_0_0_#000] md:p-8">
      {/* Đã chọn */}
      {value.length > 0 ? (
        <div className="mb-5 flex flex-wrap gap-2">
          {value.map((s) => (
            <span
              key={s}
              className="inline-flex items-center gap-1.5 rounded-lg border-2 border-black bg-[var(--fpt-orange)] px-3 py-1.5 text-[13px] font-black text-white shadow-[2px_2px_0_0_#000]"
            >
              {s}
              <button
                type="button"
                onClick={() => remove(s)}
                aria-label={`Xóa ${s}`}
                className="grid h-4 w-4 place-items-center rounded-full bg-white/25 text-white hover:bg-white/40"
              >
                <svg className="h-2.5 w-2.5 stroke-[3]" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </span>
          ))}
        </div>
      ) : (
        <p className="mb-5 rounded-xl border-2 border-dashed border-zinc-300 bg-zinc-50 px-4 py-3 text-[13px] font-bold text-zinc-400">
          Chưa có kỹ năng nào. Chọn ngành bên dưới để xem gợi ý 👇
        </p>
      )}

      {/* Nhập tự do */}
      <div className="mb-6 flex items-center gap-2">
        <input
          value={custom}
          onChange={(e) => setCustom(e.target.value)}
          onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); handleCustomAdd() } }}
          placeholder="Tự nhập kỹ năng khác rồi Enter..."
          className="w-full rounded-xl border-2 border-black bg-white px-4 py-2.5 text-[14px] font-bold text-black placeholder-zinc-400 shadow-[2px_2px_0_0_#000] focus:translate-y-[2px] focus:shadow-none focus:outline-none"
        />
        <button
          type="button"
          onClick={handleCustomAdd}
          className="shrink-0 rounded-xl border-2 border-black bg-zinc-900 px-4 py-2.5 text-[13px] font-black uppercase tracking-widest text-white shadow-[2px_2px_0_0_#000] transition-all hover:-translate-y-0.5 active:translate-y-0 active:shadow-none"
        >
          Thêm
        </button>
      </div>

      {/* Chọn ngành */}
      <p className="mb-2 text-[11px] font-black uppercase tracking-widest text-zinc-400">Bạn theo ngành nào?</p>
      <div className="mb-6 flex flex-wrap gap-2">
        {INDUSTRIES.map((ind) => (
          <button
            key={ind.key}
            type="button"
            onClick={() => onIndustryChange(ind.key === industryKey ? null : ind.key)}
            className={`inline-flex items-center gap-1.5 rounded-xl border-2 border-black px-3 py-2 text-[13px] font-black shadow-[2px_2px_0_0_#000] transition-all hover:-translate-y-0.5 active:translate-y-0 active:shadow-none ${
              industryKey === ind.key ? 'bg-black text-white' : 'bg-white text-zinc-700 hover:bg-zinc-100'
            }`}
          >
            <span className="text-base">{ind.emoji}</span> {ind.label}
          </button>
        ))}
      </div>

      {/* Chip theo nhóm của ngành đã chọn */}
      {industry ? (
        <>
          <div className="flex flex-col gap-5">
            {industry.groups.map((group) => (
              <div key={group.label}>
                <p className="mb-2 text-[11px] font-black uppercase tracking-widest text-zinc-400">{group.label}</p>
                <div className="flex flex-wrap gap-2">
                  {group.skills.map((s) => {
                    const active = has(s)
                    return (
                      <button
                        key={s}
                        type="button"
                        onClick={() => toggle(s)}
                        className={`rounded-lg border-2 border-black px-3 py-1.5 text-[13px] font-bold shadow-[2px_2px_0_0_#000] transition-all hover:-translate-y-0.5 active:translate-y-0 active:shadow-none ${
                          active ? 'bg-yellow-300 text-black' : 'bg-white text-zinc-700 hover:bg-zinc-100'
                        }`}
                      >
                        {active ? '✓ ' : '+ '}{s}
                      </button>
                    )
                  })}
                </div>
              </div>
            ))}
          </div>

          <AICoachCard
            heading={`Sinh viên ngành ${industry.label} thường có:`}
            items={industry.common}
            onPick={add}
            onPickAll={() => onChange(Array.from(new Set([...value, ...industry.common])))}
          />
        </>
      ) : (
        <p className="rounded-xl border-2 border-dashed border-zinc-300 bg-zinc-50 px-4 py-6 text-center text-[13px] font-bold text-zinc-400">
          👆 Chọn một ngành để xem các kỹ năng gợi ý phù hợp.
        </p>
      )}
    </div>
  )
}
