"use client";
import { useRef } from "react";
import { motion, useInView } from "framer-motion";

// ── Mini UI Mockups for each step ───────────────────────────────────

const InputMockup = () => (
  <div className="bg-white border-2 border-zinc-200 p-5 font-mono text-xs select-none">
    <div className="text-zinc-400 mb-3 uppercase tracking-widest text-[10px]">// thông_tin_thô.txt</div>
    <div className="space-y-2">
      {[
        { text: "Làm project môn SWP391", w: "w-full", dimmed: true },
        { text: "Biết code Java, HTML", w: "w-4/5", dimmed: true },
        { text: "Tham gia CLB lập trình", w: "w-3/5", dimmed: true },
      ].map(({ text, w, dimmed }, i) => (
        <div key={i} className={`flex items-center gap-2 ${w}`}>
          <span className={`text-[10px] ${dimmed ? "text-zinc-300" : "text-zinc-800"}`}>{text}</span>
        </div>
      ))}
      <div className="flex items-center gap-2 mt-2">
        <span className="inline-block w-2 h-4 bg-[var(--fpt-orange)] animate-pulse" />
        <span className="text-[10px] text-zinc-400">Dán CV của bạn vào đây...</span>
      </div>
    </div>
    <div className="mt-4 flex items-center gap-2">
      {/* Job Description badge */}
      <div className="bg-zinc-950 text-white text-[9px] font-bold uppercase px-2 py-0.5">JD</div>
      <div className="text-[10px] text-zinc-500 truncate">Senior Frontend Developer — Tiki Corp...</div>
    </div>
  </div>
);

const AnalyzeMockup = () => (
  <div className="bg-zinc-950 border-2 border-[var(--fpt-orange)] p-5 font-mono text-xs select-none">
    <div className="flex items-center gap-2 mb-4">
      <span className="w-2 h-2 bg-[var(--fpt-orange)] rounded-full" style={{ animation: "pulse 1s infinite" }} />
      <span className="text-[var(--fpt-orange)] text-[10px] uppercase tracking-widest">AI đang phân tích...</span>
    </div>

    {/* ATS Score bar */}
    <div className="mb-3">
      <div className="flex justify-between mb-1">
        <span className="text-zinc-400 text-[10px]">ATS Match Score</span>
        <span className="text-[var(--fpt-orange)] font-black text-[10px]">91.3%</span>
      </div>
      <div className="h-2 bg-zinc-800 rounded-none overflow-hidden">
        <motion.div
          className="h-full bg-[var(--fpt-orange)]"
          initial={{ width: "0%" }}
          whileInView={{ width: "91.3%" }}
          viewport={{ once: true }}
          transition={{ duration: 1.4, delay: 0.5, ease: [0.32, 0.72, 0, 1] }}
        />
      </div>
    </div>

    {/* Keywords found */}
    <div className="space-y-1">
      {[
        { kw: "React.js", hit: true },
        { kw: "TypeScript", hit: true },
        { kw: "REST API", hit: true },
        { kw: "Docker", hit: false },
      ].map(({ kw, hit }) => (
        <div key={kw} className="flex items-center gap-2">
          <svg width="10" height="10" viewBox="0 0 12 12" fill="none" aria-hidden="true">
            <circle cx="6" cy="6" r="6" fill={hit ? "#22c55e" : "#ef4444"} />
            {hit && <polyline points="3 6 5 8 9 4" stroke="white" strokeWidth="1.5" strokeLinecap="round" />}
            {!hit && <line x1="8" y1="4" x2="4" y2="8" stroke="white" strokeWidth="1.5" strokeLinecap="round" />}
          </svg>
          <span className={`text-[10px] ${hit ? "text-white" : "text-zinc-600"}`}>{kw}</span>
          {!hit && <span className="text-[9px] text-yellow-500 ml-auto">AI thêm vào</span>}
        </div>
      ))}
    </div>
  </div>
);

const DownloadMockup = () => (
  <div className="bg-white border-2 border-black p-5 select-none">
    {/* CV preview strip */}
    <div className="border border-zinc-200 mb-4 overflow-hidden">
      <div className="bg-[var(--fpt-orange)] px-3 py-2">
        <div className="font-black text-white text-xs uppercase tracking-widest">Nguyễn Văn A</div>
        <div className="text-white/80 text-[10px]">Frontend Developer</div>
      </div>
      <div className="p-3 space-y-1.5">
        {[0.9, 0.7, 1, 0.6].map((w, i) => (
          <div key={i} className="h-1.5 bg-zinc-200 rounded-full" style={{ width: `${w * 100}%` }} />
        ))}
      </div>
    </div>

    {/* ATS badge */}
    <div className="flex items-center justify-between mb-3">
      <div className="flex items-center gap-1.5">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#22c55e" strokeWidth="2.5" aria-hidden="true">
          <polyline points="20 6 9 17 4 12" />
        </svg>
        <span className="text-[11px] font-black text-emerald-600 uppercase">ATS: 91.3%</span>
      </div>
      <span className="text-[10px] text-zinc-400">PDF · A4 · ILovePDF</span>
    </div>

    {/* Download button */}
    <motion.button
      whileHover={{ y: -2 }}
      whileTap={{ scale: 0.97 }}
      className="w-full py-2.5 bg-[var(--fpt-orange)] border-2 border-black text-white text-xs font-black uppercase tracking-widest flex items-center justify-center gap-2 neo-shadow"
    >
      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" aria-hidden="true">
        <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4M7 10l5 5 5-5M12 15V3" />
      </svg>
      Tải Xuống PDF
    </motion.button>
  </div>
);

// ── Steps data ───────────────────────────────────────────────────────
const STEPS = [
  {
    number: "01",
    title: "Nhập & Paste",
    description: "Paste thông tin CV thô + Job Description bạn muốn apply. Không cần format, không cần đẹp — AI hiểu tất cả.",
    color: "#87E8C6",
    MockupComponent: InputMockup,
  },
  {
    number: "02",
    title: "AI Phân Tích",
    description: "AI quét qua từng dòng, map từ khóa với JD, tự động thêm vào những gì còn thiếu và viết lại theo chuẩn ATS.",
    color: "#FDE047",
    MockupComponent: AnalyzeMockup,
  },
  {
    number: "03",
    title: "Tải CV Xịn",
    description: "Download PDF chuẩn A4 ngay lập tức. ATS Match Score 85%+ đảm bảo lọt qua vòng lọc tự động của nhà tuyển dụng.",
    color: "#F26F21",
    MockupComponent: DownloadMockup,
  },
] as const;

// ── Section ──────────────────────────────────────────────────────────
export const HowItWorks = () => {
  const lineRef = useRef<HTMLDivElement>(null);
  const isLineInView = useInView(lineRef, { once: true, margin: "-100px" });

  return (
    <section className="py-32 px-4 sm:px-6 bg-white border-b-4 border-black overflow-hidden">
      <div className="max-w-7xl mx-auto">

        {/* Heading */}
        <motion.div
          initial={{ opacity: 0, y: 32 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7, ease: [0.32, 0.72, 0, 1] }}
          className="mb-24"
        >
          <span className="inline-block rounded-full px-3 py-1 text-[11px] uppercase tracking-[0.2em] font-black border-2 border-black bg-yellow-300 mb-6">
            Quy Trình
          </span>
          <h2 className="text-6xl md:text-8xl font-black tracking-tighter text-black uppercase neo-shadow-text">
            3 Bước.<br />Xong.
          </h2>
          <p className="text-xl font-bold text-zinc-500 mt-6 max-w-[50ch]">
            Từ CV thô đến bản hoàn chỉnh vượt ATS — chỉ mất chưa đến 5 phút.
          </p>
        </motion.div>

        {/* Connecting line (desktop) */}
        <div ref={lineRef} className="hidden lg:block relative mb-0 px-[calc(100%/6)]">
          <div className="h-0.5 bg-zinc-200 w-full absolute top-0 left-0" />
          <motion.div
            className="h-0.5 bg-black w-full absolute top-0 left-0 origin-left"
            initial={{ scaleX: 0 }}
            animate={isLineInView ? { scaleX: 1 } : { scaleX: 0 }}
            transition={{ duration: 1.2, ease: [0.32, 0.72, 0, 1], delay: 0.2 }}
          />
        </div>

        {/* Steps grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 lg:gap-6">
          {STEPS.map(({ number, title, description, color, MockupComponent }, idx) => (
            <motion.div
              key={number}
              initial={{ opacity: 0, y: 48 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-60px" }}
              transition={{
                duration: 0.7,
                ease: [0.32, 0.72, 0, 1],
                delay: idx * 0.15,
              }}
              className="flex flex-col"
            >
              {/* Step number dot — sits on the line */}
              <div className="flex items-center gap-4 mb-8 mt-4 lg:mt-0 lg:-mt-5">
                <div
                  className="w-10 h-10 border-4 border-black flex items-center justify-center font-black text-sm text-black flex-shrink-0"
                  style={{ background: color }}
                >
                  {number}
                </div>
                <div className="h-0.5 flex-1 bg-zinc-200 lg:hidden" />
              </div>

              {/* Mockup */}
              <div className="mb-6 border-4 border-black neo-shadow">
                <MockupComponent />
              </div>

              {/* Content */}
              <h3 className="text-3xl font-black text-black uppercase mb-3">{title}</h3>
              <p className="text-base font-bold text-zinc-600 leading-relaxed">{description}</p>
            </motion.div>
          ))}
        </div>

        {/* Bottom CTA */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.5 }}
          className="mt-20 flex flex-col sm:flex-row items-start sm:items-center gap-6"
        >
          <div className="flex items-center gap-3 text-sm font-bold text-zinc-500 border-l-4 border-[var(--fpt-orange)] pl-4">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" className="text-[var(--fpt-orange)]" aria-hidden="true">
              <circle cx="12" cy="12" r="10" />
              <polyline points="12 6 12 12 16 14" />
            </svg>
            Tạo CV hoàn chỉnh trong dưới 5 phút
          </div>
          <div className="flex items-center gap-3 text-sm font-bold text-zinc-500 border-l-4 border-black pl-4">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" aria-hidden="true">
              <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
            </svg>
            Không lưu CV — bảo mật tuyệt đối
          </div>
        </motion.div>
      </div>
    </section>
  );
};
