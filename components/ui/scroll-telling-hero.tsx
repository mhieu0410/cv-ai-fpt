"use client";
import React, { useRef, useState } from "react";
import {
  motion, AnimatePresence,
  useScroll, useMotionValueEvent,
} from "framer-motion";
import Link from "next/link";
import { WebGLCVScene } from "./webgl-cv-scene";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger, useGSAP);
}

// ─────────────────────────────────────────────────────────────────────
// PHASE CONTENT — Text lives on the LEFT, 3D scene reacts on the RIGHT
// ─────────────────────────────────────────────────────────────────────
const PHASES = [
  {
    code: "// ai.init(cv)",
    codeColor: "#00d4ff",
    lines: ["Viết CV.", "Match JD.", "Vượt ATS."],
    colors: ["#ffffff", "var(--fpt-orange)", "#00d4ff"],
    sub: "AI phân tích CV của bạn như một HR chuyên nghiệp — trong 5 giây.",
    cta: true,
  },
  {
    code: "// cv.parse(rawData)",
    codeColor: "#00d4ff",
    lines: ["AI Quét", "Từng Dòng."],
    colors: ["#ffffff", "#00d4ff"],
    sub: "Mọi kinh nghiệm, kỹ năng và dự án được phân tích chính xác.",
    cta: false,
  },
  {
    code: "// keywords.inject(jd)",
    codeColor: "var(--fpt-orange)",
    lines: ["Nhúng Từ", "Khóa Chuẩn."],
    colors: ["#ffffff", "var(--fpt-orange)"],
    sub: "47 từ khóa chiến lược khớp với JD mục tiêu được thêm tự động.",
    cta: false,
  },
  {
    code: "// ats.score(optimized)",
    codeColor: "#00d4ff",
    lines: ["91.3%", "ATS Match."],
    colors: ["#00d4ff", "#ffffff"],
    sub: "CV tối ưu vượt qua bộ lọc tự động của 94% nhà tuyển dụng lớn.",
    cta: false,
  },
  {
    code: "// career.launch()",
    codeColor: "var(--fpt-orange)",
    lines: ["Bắt Đầu", "Hành Trình."],
    colors: ["#ffffff", "var(--fpt-orange)"],
    sub: "Từ sinh viên FPT đến ứng viên được tuyển dụng — bắt đầu miễn phí.",
    cta: true,
  },
] as const;

const TOTAL_PHASES = PHASES.length;

export const ScrollTellingHero = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const stickyRef = useRef<HTMLDivElement>(null);
  const textColumnRef = useRef<HTMLDivElement>(null);
  const [phaseIdx, setPhaseIdx] = useState(0);

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end end"],
  });

  useMotionValueEvent(scrollYProgress, "change", (v) => {
    const idx = Math.min(Math.floor(v * TOTAL_PHASES), TOTAL_PHASES - 1);
    setPhaseIdx(idx);
  });

  // GSAP Exit Parallax
  useGSAP(() => {
    if (!containerRef.current || !textColumnRef.current || !stickyRef.current) return;

    // We want the text to blur and scale down at the very end of the 800vh scroll
    // when the next section is about to overlay.
    ScrollTrigger.create({
      trigger: containerRef.current,
      start: "bottom 150%", // Start animating when bottom of container is 150% down the viewport
      end: "bottom top", 
      scrub: true,
      animation: gsap.to(textColumnRef.current, {
        opacity: 0,
        scale: 0.85,
        y: -100,
        filter: "blur(12px)",
        ease: "none"
      })
    });
  }, { scope: containerRef });

  const phase = PHASES[phaseIdx];

  return (
    <div ref={containerRef} className="relative h-[800vh] w-full">
      <div ref={stickyRef} className="sticky top-0 h-[100dvh] w-full overflow-hidden">

        {/* ── Background: Deep Navy ────────────────────────────────── */}
        <div
          className="absolute inset-0"
          style={{
            background:
              "linear-gradient(175deg, #060c1c 0%, #0a0f1e 55%, #0d1424 85%, #111827 100%)",
          }}
        />

        {/* Film grain — 3% opacity, cinematic texture */}
        <div
          className="absolute inset-0 pointer-events-none z-10"
          style={{
            opacity: 0.032,
            backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='g'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23g)'/%3E%3C/svg%3E")`,
            backgroundSize: "128px",
          }}
        />


        {/* ════════════════════════════════════════════════════════════
            MAIN LAYOUT: 50 / 50 split — Text LEFT, 3D RIGHT
        ════════════════════════════════════════════════════════════ */}
        <div className="absolute inset-0 flex">

          {/* ── LEFT COLUMN: Minimal editorial text ───────────────── */}
          <div ref={textColumnRef} className="relative z-10 flex flex-col justify-center w-full md:w-[48%] pl-[7vw] pr-6 md:pr-12 pt-24 md:pt-0">
            <AnimatePresence mode="wait">
              <motion.div
                key={phaseIdx}
                initial={{ opacity: 0, y: 28, filter: "blur(10px)" }}
                animate={{ opacity: 1, y: 0,  filter: "blur(0px)"  }}
                exit={  { opacity: 0, y: -18, filter: "blur(8px)"  }}
                transition={{ duration: 0.55, ease: [0.32, 0.72, 0, 1] }}
                className="flex flex-col"
              >
                {/* Code comment label */}
                <span
                  className="mb-4 font-mono text-[11px] md:text-[13px] tracking-widest uppercase"
                  style={{ color: phase.codeColor, opacity: 0.75 }}
                >
                  {phase.code}
                </span>

                {/* Headline — large, bold, tight */}
                <div className="mb-6 md:mb-8">
                  {phase.lines.map((line, i) => (
                    <div
                      key={i}
                      className="block font-black leading-none tracking-tighter"
                      style={{
                        color: phase.colors[i],
                        fontSize: "clamp(3rem, 5.5vw, 5.2rem)",
                        letterSpacing: "-0.04em",
                      }}
                    >
                      {line}
                    </div>
                  ))}
                </div>

                {/* Sub-text — clean, readable */}
                <p
                  className="text-sm md:text-base leading-relaxed max-w-[38ch] font-medium mb-8 md:mb-10"
                  style={{ color: "rgba(255,255,255,0.50)" }}
                >
                  {phase.sub}
                </p>

                {/* CTA buttons — only on phase 0 and 4 */}
                {phase.cta && (
                  <div className="flex flex-wrap items-center gap-3 md:gap-4">
                    <Link
                      href="/signup"
                      className="px-6 py-3 rounded-full text-sm font-black uppercase tracking-widest text-white transition-all active:scale-95"
                      style={{
                        background: "var(--fpt-orange)",
                        boxShadow: "0 0 24px rgba(242,111,33,0.50), 0 0 48px rgba(242,111,33,0.18)",
                      }}
                      onMouseEnter={e =>
                        (e.currentTarget.style.boxShadow =
                          "0 0 32px rgba(242,111,33,0.70), 0 0 64px rgba(242,111,33,0.28)")
                      }
                      onMouseLeave={e =>
                        (e.currentTarget.style.boxShadow =
                          "0 0 24px rgba(242,111,33,0.50), 0 0 48px rgba(242,111,33,0.18)")
                      }
                    >
                      Tạo CV Miễn Phí →
                    </Link>
                    <Link
                      href="#how-it-works"
                      className="text-sm font-bold text-white/45 hover:text-white/80 transition-colors tracking-wide"
                    >
                      Xem cách hoạt động ↓
                    </Link>
                  </div>
                )}
              </motion.div>
            </AnimatePresence>

            {/* ── Vertical phase progress indicator ─────────────────── */}
            <div
              className="absolute bottom-10 left-[7vw] flex flex-col gap-2"
              aria-hidden="true"
            >
              {PHASES.map((_, i) => (
                <motion.div
                  key={i}
                  animate={{
                    height: i === phaseIdx ? 32 : 10,
                    opacity: i === phaseIdx ? 1 : 0.28,
                  }}
                  transition={{ duration: 0.4, ease: [0.32, 0.72, 0, 1] }}
                  className="w-[2px] rounded-full"
                  style={{ background: i === phaseIdx ? "#00d4ff" : "rgba(255,255,255,0.4)" }}
                />
              ))}
              <span
                className="mt-2 font-mono text-[10px] tracking-widest"
                style={{ color: "rgba(255,255,255,0.28)", writingMode: "vertical-rl" }}
              >
                {String(phaseIdx + 1).padStart(2, "0")} / {String(TOTAL_PHASES).padStart(2, "0")}
              </span>
            </div>
          </div>

          {/* ── BACKGROUND 3D SCENE (Spans full width) ───────────── */}
          <div className="absolute inset-0 z-0">
            <WebGLCVScene
              scrollYProgress={scrollYProgress}
              currentPhase={phaseIdx}
            />
          </div>
        </div>

        {/* ── Scroll hint (phase 0 only) ─────────────────────────── */}
        <AnimatePresence>
          {phaseIdx === 0 && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ delay: 1.6, duration: 0.6 }}
              className="absolute bottom-8 left-[23%] -translate-x-1/2 flex flex-col items-center gap-2 z-10 hidden md:flex"
            >
              <span
                className="font-mono text-[10px] uppercase tracking-[0.18em]"
                style={{ color: "rgba(255,255,255,0.28)" }}
              >
                Scroll
              </span>
              <motion.div
                animate={{ y: [0, 7, 0] }}
                transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
                style={{
                  width: "1px",
                  height: "36px",
                  background: "linear-gradient(to bottom, rgba(0,212,255,0.5), transparent)",
                }}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

