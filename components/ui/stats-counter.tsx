"use client";
import { useEffect, useRef, useState } from "react";
import { motion, useInView } from "framer-motion";

// ── Custom count-up hook using requestAnimationFrame ────────────────
function useCountUp(target: number, duration: number, started: boolean) {
  const [count, setCount] = useState(0);
  useEffect(() => {
    if (!started) return;
    let startTime: number;
    let raf: number;
    const step = (ts: number) => {
      if (!startTime) startTime = ts;
      const progress = Math.min((ts - startTime) / duration, 1);
      // Cubic ease-out
      const eased = 1 - Math.pow(1 - progress, 3);
      setCount(parseFloat((eased * target).toFixed(1)));
      if (progress < 1) raf = requestAnimationFrame(step);
      else setCount(target);
    };
    raf = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf);
  }, [started, target, duration]);
  return count;
}

// ── Individual stat item ────────────────────────────────────────────
interface StatProps {
  value: number;
  prefix?: string;
  suffix: string;
  label: string;
  duration?: number;
  delay?: number;
}

function StatItem({ value, prefix = "", suffix, label, duration = 1600, delay = 0 }: StatProps) {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, margin: "-80px" });
  const count = useCountUp(value, duration, isInView);

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 32 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-80px" }}
      transition={{ duration: 0.7, ease: [0.32, 0.72, 0, 1], delay }}
      className="flex flex-col"
    >
      <div className="text-5xl md:text-6xl lg:text-7xl font-black tracking-tighter text-white leading-none">
        {prefix}
        {value % 1 === 0 ? Math.floor(count) : count.toFixed(1)}
        {suffix}
      </div>
      <div className="text-zinc-500 font-bold uppercase tracking-[0.15em] text-xs mt-3 max-w-[16ch] leading-relaxed">
        {label}
      </div>
    </motion.div>
  );
}

// ── Avatar pile ─────────────────────────────────────────────────────
const AVATARS = [
  { init: "NT", color: "#F26F21" },
  { init: "VK", color: "#87E8C6" },
  { init: "BN", color: "#FDE047" },
  { init: "PL", color: "#FF6B6B" },
  { init: "ĐA", color: "#a78bfa" },
];

// ── Main Section ────────────────────────────────────────────────────
export const StatsCounter = () => {
  return (
    <section className="py-24 px-4 sm:px-6 bg-zinc-950 border-b-4 border-black overflow-hidden">
      <div className="max-w-7xl mx-auto">

        {/* Eyebrow */}
        <motion.div
          initial={{ opacity: 0, x: -24 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, ease: [0.32, 0.72, 0, 1] }}
          className="mb-16"
        >
          <span className="inline-block rounded-full px-3 py-1 text-[11px] uppercase tracking-[0.2em] font-black border-2 border-zinc-700 bg-zinc-900 text-zinc-400">
            Số Liệu Thực Tế
          </span>
        </motion.div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-x-8 gap-y-12 mb-16">
          <StatItem value={500} suffix="+" label="Sinh viên FPT đã dùng" delay={0} />
          <StatItem value={94.7} suffix="%" label="Tỉ lệ CV vượt ATS thành công" duration={2000} delay={0.1} />
          <StatItem value={47} suffix="" label="Từ khóa được tối ưu trung bình / CV" delay={0.2} />
          <StatItem value={5} suffix=" phút" label="Thời gian tạo CV hoàn chỉnh" duration={900} delay={0.3} />
        </div>

        {/* Divider + avatar proof */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, delay: 0.4 }}
          className="pt-8 border-t border-zinc-800 flex flex-col sm:flex-row items-start sm:items-center gap-5"
        >
          {/* Avatar stack */}
          <div className="flex -space-x-3 flex-shrink-0">
            {AVATARS.map(({ init, color }, i) => (
              <div
                key={i}
                className="w-10 h-10 rounded-full border-2 border-zinc-950 flex items-center justify-center text-[11px] font-black text-zinc-950"
                style={{ background: color, zIndex: AVATARS.length - i }}
              >
                {init}
              </div>
            ))}
            <div className="w-10 h-10 rounded-full border-2 border-zinc-950 bg-zinc-800 flex items-center justify-center text-[10px] font-black text-zinc-400">
              +342
            </div>
          </div>
          <p className="text-zinc-400 font-bold text-sm leading-relaxed">
            <span className="text-white font-black">347 sinh viên FPT K17/K18</span> đã apply thành công OJT
            trong 3 tháng gần nhất — phỏng vấn trong{" "}
            <span className="text-[var(--fpt-orange)]">vòng 72 giờ</span>.
          </p>
        </motion.div>
      </div>
    </section>
  );
};
