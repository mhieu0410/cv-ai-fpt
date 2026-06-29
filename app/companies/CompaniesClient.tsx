'use client'

import { useState, useMemo } from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { COMPANIES, GROUP_META, type CompanyGroup } from '@/lib/companies-data'

type FilterKey = 'all' | CompanyGroup

const FILTERS: { key: FilterKey; label: string }[] = [
  { key: 'all', label: 'Tất cả' },
  { key: 'technology', label: GROUP_META.technology.label },
  { key: 'telecom', label: GROUP_META.telecom.label },
  { key: 'retail', label: GROUP_META.retail.label },
  { key: 'education', label: GROUP_META.education.label },
  { key: 'other', label: GROUP_META.other.label },
]

export default function CompaniesClient() {
  const [filter, setFilter] = useState<FilterKey>('all')

  const counts = useMemo(() => {
    const c: Record<FilterKey, number> = {
      all: COMPANIES.length,
      technology: 0, telecom: 0, retail: 0, education: 0, other: 0,
    }
    for (const company of COMPANIES) c[company.group]++
    return c
  }, [])

  const visible = useMemo(
    () => (filter === 'all' ? COMPANIES : COMPANIES.filter((c) => c.group === filter)),
    [filter]
  )

  return (
    <div className="min-h-screen bg-[#f8f9fa] font-sans">
      {/* ── HERO ── */}
      <section className="relative pt-20 pb-12 px-4 sm:px-6 overflow-hidden">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#8080801a_1px,transparent_1px),linear-gradient(to_bottom,#8080801a_1px,transparent_1px)] bg-[size:40px_40px] pointer-events-none" />
        <div className="max-w-6xl mx-auto relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, type: 'spring', bounce: 0.35 }}
          >
            <div className="inline-block px-4 py-1.5 bg-[#C4A1FF] border-2 border-black rounded-full shadow-[4px_4px_0_0_#000] text-xs font-black uppercase tracking-[0.2em] mb-6 rotate-[-2deg]">
              Hiểu công ty
            </div>
            <h1 className="text-5xl md:text-7xl font-black tracking-tighter text-black uppercase leading-[0.95] mb-6 drop-shadow-[5px_5px_0_rgba(0,0,0,1)]">
              Khám phá <span className="text-[var(--fpt-orange)]">Tập đoàn FPT</span>
            </h1>
            <p className="text-base md:text-lg font-bold text-zinc-600 max-w-2xl leading-relaxed border-2 border-black bg-white p-4 rounded-xl shadow-[4px_4px_0_0_#000]">
              Hiểu rõ từng công ty thành viên — lĩnh vực, mô hình kinh doanh, văn hóa và vị trí tuyển dụng — để chọn đúng nơi ứng tuyển và viết CV trúng đích.
            </p>
          </motion.div>
        </div>
      </section>

      {/* ── FILTER ── */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 pb-2">
        <div className="flex flex-wrap gap-3">
          {FILTERS.map((f) => {
            const active = filter === f.key
            return (
              <button
                key={f.key}
                onClick={() => setFilter(f.key)}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-[13px] font-black uppercase tracking-widest border-2 border-black transition-all ${
                  active
                    ? 'bg-black text-white shadow-[3px_3px_0_0_var(--fpt-orange)]'
                    : 'bg-white text-black hover:-translate-y-0.5 shadow-[3px_3px_0_0_#000] hover:shadow-[5px_5px_0_0_#000]'
                }`}
              >
                {f.label}
                <span className={`text-[10px] px-1.5 py-0.5 rounded ${active ? 'bg-white/20' : 'bg-zinc-100'}`}>
                  {counts[f.key]}
                </span>
              </button>
            )
          })}
        </div>
      </section>

      {/* ── GRID ── */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 py-10 pb-24">
        {visible.length === 0 ? (
          <div className="bg-white border-4 border-black rounded-3xl p-12 text-center shadow-[8px_8px_0_0_#000]">
            <p className="text-xl font-black uppercase tracking-widest text-zinc-400">
              Chưa có công ty trong nhóm này
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {visible.map((c, i) => (
              <motion.div
                key={c.slug}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: i * 0.05 }}
              >
                <Link
                  href={`/companies/${c.slug}`}
                  className="group block h-full bg-white border-4 border-black rounded-3xl p-6 shadow-[6px_6px_0_0_#000] hover:-translate-y-1 hover:shadow-[10px_10px_0_0_#000] transition-all"
                >
                  <div className="flex items-start gap-4 mb-4">
                    <div
                      className="w-14 h-14 shrink-0 rounded-2xl border-2 border-black flex items-center justify-center font-black text-white text-lg shadow-[2px_2px_0_0_#000]"
                      style={{ backgroundColor: c.accent }}
                    >
                      {c.logoText}
                    </div>
                    <div className="min-w-0">
                      <h3 className="text-lg font-black text-black leading-tight">{c.shortName}</h3>
                      <span
                        className="inline-block mt-1 text-[10px] font-black uppercase tracking-widest px-2 py-0.5 rounded border border-black"
                        style={{ backgroundColor: GROUP_META[c.group].color, color: '#fff' }}
                      >
                        {GROUP_META[c.group].label}
                      </span>
                    </div>
                  </div>
                  <p className="text-sm font-semibold text-zinc-600 leading-relaxed mb-4">{c.tagline}</p>
                  {c.insiderSecrets && (
                    <span className="inline-flex items-center gap-1 text-[10px] font-black uppercase tracking-widest text-black bg-yellow-300 border-2 border-black rounded px-2 py-0.5 shadow-[2px_2px_0_0_#000] mb-4">
                      🔓 Insider Secrets
                    </span>
                  )}
                  <span className="flex items-center gap-1 text-[13px] font-black uppercase tracking-widest text-[var(--fpt-orange)] group-hover:gap-2 transition-all">
                    Xem chi tiết →
                  </span>
                </Link>
              </motion.div>
            ))}
          </div>
        )}
      </section>
    </div>
  )
}
