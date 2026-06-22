"use client";
import { useRef, useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

// ── Mini UI Mockups ───────────────────────────────────────────────────

const InputMockup = () => (
  <div className="bg-white p-6 font-mono text-xs select-none">
    <div className="text-zinc-400 mb-3 uppercase tracking-widest text-[10px]">{"// thông_tin_thô.txt"}</div>
    <div className="space-y-2 mb-4">
      {[
        { text: "Làm project môn SWP391", w: "100%", dimmed: true },
        { text: "Biết code Java, HTML", w: "80%", dimmed: true },
        { text: "Tham gia CLB lập trình", w: "60%", dimmed: true },
      ].map(({ text, w, dimmed }, i) => (
        <div key={i} style={{ width: w }} className="flex items-center gap-2">
          <span className={`text-[11px] ${dimmed ? "text-zinc-300" : "text-zinc-800"}`}>{text}</span>
        </div>
      ))}
      <div className="flex items-center gap-2 mt-2">
        <span className="inline-block w-2 h-4 bg-[var(--fpt-orange)] animate-pulse" />
        <span className="text-[11px] text-zinc-400">Dán CV của bạn vào đây...</span>
      </div>
    </div>
    <div className="flex items-center gap-2 pt-3 border-t border-zinc-100">
      <div className="bg-zinc-950 text-white text-[9px] font-bold uppercase px-2 py-0.5 flex-shrink-0">JD</div>
      <div className="text-[10px] text-zinc-500 truncate">Senior Frontend Developer — Tiki Corp...</div>
    </div>
  </div>
);

const AnalyzeMockup = () => (
  <div className="bg-zinc-950 p-6 font-mono text-xs select-none">
    <div className="flex items-center gap-2 mb-5">
      <span className="w-2 h-2 bg-[var(--fpt-orange)] rounded-full animate-pulse" />
      <span className="text-[var(--fpt-orange)] text-[10px] uppercase tracking-widest font-bold">AI đang phân tích...</span>
    </div>
    <div className="mb-4">
      <div className="flex justify-between mb-1.5">
        <span className="text-zinc-400 text-[10px]">ATS Match Score</span>
        <span className="text-[var(--fpt-orange)] font-black text-[11px]">91.3%</span>
      </div>
      <div className="h-2 bg-zinc-800 overflow-hidden">
        <motion.div
          className="h-full bg-[var(--fpt-orange)]"
          initial={{ width: "0%" }}
          animate={{ width: "91.3%" }}
          transition={{ duration: 1.4, delay: 0.2, ease: [0.32, 0.72, 0, 1] }}
        />
      </div>
    </div>
    <div className="space-y-2">
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
          <span className={`text-[11px] ${hit ? "text-white" : "text-zinc-500"}`}>{kw}</span>
          {!hit && <span className="text-[9px] text-yellow-500 ml-auto">AI thêm vào</span>}
        </div>
      ))}
    </div>
  </div>
);

const DownloadMockup = () => (
  <div className="bg-white p-6 select-none">
    <div className="border border-zinc-200 mb-4 overflow-hidden">
      <div className="bg-[var(--fpt-orange)] px-4 py-3">
        <div className="font-black text-white text-sm uppercase tracking-widest">Nguyễn Văn A</div>
        <div className="text-white/80 text-[11px]">Frontend Developer</div>
      </div>
      <div className="p-3 space-y-1.5">
        {[0.9, 0.7, 1, 0.6].map((w, i) => (
          <div key={i} className="h-1.5 bg-zinc-200 rounded-full" style={{ width: `${w * 100}%` }} />
        ))}
      </div>
    </div>
    <div className="flex items-center justify-between mb-4">
      <div className="flex items-center gap-1.5">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#22c55e" strokeWidth="2.5" aria-hidden="true">
          <polyline points="20 6 9 17 4 12" />
        </svg>
        <span className="text-[12px] font-black text-emerald-600 uppercase">ATS: 91.3%</span>
      </div>
      <span className="text-[10px] text-zinc-400">PDF · A4</span>
    </div>
    <motion.button
      whileHover={{ y: -2 }}
      whileTap={{ scale: 0.97 }}
      className="w-full py-3 bg-[var(--fpt-orange)] border-2 border-black text-white text-xs font-black uppercase tracking-widest flex items-center justify-center gap-2"
      style={{ boxShadow: "4px 4px 0 0 #000" }}
    >
      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" aria-hidden="true">
        <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4M7 10l5 5 5-5M12 15V3" />
      </svg>
      Tải Xuống PDF
    </motion.button>
  </div>
);

// ── Steps ─────────────────────────────────────────────────────────────
const STEPS = [
  {
    number: "01",
    title: "Nhập & Paste",
    description: "Paste thông tin CV thô + Job Description bạn muốn apply. Không cần format, không cần đẹp — AI hiểu tất cả.",
    color: "#87E8C6",
    Mockup: InputMockup,
  },
  {
    number: "02",
    title: "AI Phân Tích",
    description: "AI quét qua từng dòng, map từ khóa với JD, tự động thêm vào những gì còn thiếu và viết lại theo chuẩn ATS.",
    color: "#FDE047",
    Mockup: AnalyzeMockup,
  },
  {
    number: "03",
    title: "Tải CV Xịn",
    description: "Download PDF chuẩn A4 ngay lập tức. ATS Match Score 85%+ đảm bảo lọt qua vòng lọc tự động của nhà tuyển dụng.",
    color: "#F26F21",
    Mockup: DownloadMockup,
  },
] as const;

// ── Main component ────────────────────────────────────────────────────
export const HowItWorks = () => {
  const [activeStep, setActiveStep] = useState(0);
  const stepRefs = useRef<(HTMLDivElement | null)[]>([]);

  // Intersection Observer — works regardless of scroll engine (Lenis/native)
  useEffect(() => {
    const observers: IntersectionObserver[] = [];

    stepRefs.current.forEach((el, index) => {
      if (!el) return;
      const obs = new IntersectionObserver(
        ([entry]) => {
          if (entry.isIntersecting) setActiveStep(index);
        },
        { threshold: 0.5, rootMargin: "0px 0px -20% 0px" }
      );
      obs.observe(el);
      observers.push(obs);
    });

    return () => observers.forEach((obs) => obs.disconnect());
  }, []);

  const ActiveMockup = STEPS[activeStep].Mockup;

  return (
    <section className="bg-white border-b-4 border-black">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-24 lg:py-32">

        {/* Heading */}
        <div className="mb-20">
          <span className="inline-block rounded-full px-3 py-1 text-[11px] uppercase tracking-[0.2em] font-black border-2 border-black bg-yellow-300 mb-6">
            Quy Trình
          </span>
          <h2
            className="text-6xl md:text-8xl font-black tracking-tighter text-black uppercase"
            style={{ textShadow: "4px 4px 0 #F26F21" }}
          >
            3 Bước.<br />Xong.
          </h2>
          <p className="text-xl font-bold text-zinc-500 mt-6 max-w-[50ch]">
            Từ CV thô đến bản hoàn chỉnh vượt ATS — chỉ mất chưa đến 5 phút.
          </p>
        </div>

        {/* Two column layout */}
        <div className="flex flex-col lg:flex-row gap-16 lg:gap-24">

          {/* LEFT — scrolling steps */}
          <div className="w-full lg:w-1/2">
            {STEPS.map(({ number, title, description, color, Mockup }, idx) => (
              <div
                key={number}
                ref={(el) => { stepRefs.current[idx] = el; }}
                className="min-h-[80vh] flex flex-col justify-center border-l-4 pl-8 transition-all duration-500"
                style={{
                  borderColor: activeStep === idx ? color : "#e4e4e7",
                  opacity: activeStep === idx ? 1 : 0.3,
                }}
              >
                <div
                  className="w-12 h-12 border-4 border-black flex items-center justify-center font-black text-lg text-black flex-shrink-0 mb-6"
                  style={{ background: color, boxShadow: "4px 4px 0 0 #000" }}
                >
                  {number}
                </div>
                <h3 className="text-4xl font-black text-black uppercase mb-4">{title}</h3>
                <p className="text-xl font-bold text-zinc-600 leading-relaxed max-w-[35ch]">{description}</p>

                {/* Mobile inline mockup */}
                <div className="block lg:hidden mt-8 border-4 border-black" style={{ boxShadow: "6px 6px 0 0 #F26F21" }}>
                  <Mockup />
                </div>
              </div>
            ))}
          </div>

          {/* RIGHT — fixed-position mockup panel (JS-driven, not CSS sticky) */}
          <div className="hidden lg:block w-full lg:w-1/2">
            <div
              style={{
                position: "sticky",
                top: "20vh",
                // Fallback: nếu sticky không hoạt động với Lenis,
                // component vẫn hiển thị đúng ở vị trí ban đầu
              }}
            >
              <AnimatePresence mode="wait">
                <motion.div
                  key={activeStep}
                  initial={{ opacity: 0, y: 24 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -24 }}
                  transition={{ duration: 0.4, ease: [0.32, 0.72, 0, 1] }}
                  className="border-4 border-black"
                  style={{ boxShadow: "8px 8px 0 0 #F26F21" }}
                >
                  <ActiveMockup />
                </motion.div>
              </AnimatePresence>

              {/* Step indicators */}
              <div className="flex gap-2 mt-6 justify-center">
                {STEPS.map((step, idx) => (
                  <button
                    key={idx}
                    onClick={() => setActiveStep(idx)}
                    className="h-1.5 rounded-full transition-all duration-500"
                    style={{
                      width: activeStep === idx ? "32px" : "8px",
                      background: activeStep === idx ? step.color : "#d4d4d8",
                    }}
                    aria-label={`Bước ${idx + 1}`}
                  />
                ))}
              </div>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
};
