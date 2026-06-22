"use client";
import { useRef } from "react";
import { motion, useMotionValue, useSpring, useTransform } from "framer-motion";

// ── Testimonial data ─────────────────────────────────────────────────
const TESTIMONIALS = [
  {
    init: "TV",
    name: "Trần Thảo Vy",
    major: "Software Engineering · K18",
    company: "FPT Software",
    companyColor: "#F26F21",
    stars: 5,
    atsScore: 91,
    quote:
      "Trước đây apply 20 lần không có ai reply. Sau khi dùng CV AI FPT, apply 3 chỗ, 2 chỗ gọi phỏng vấn, 1 chỗ offer ngay tuần sau. ATS Score từ 34% lên 91% — không tin vào mắt mình luôn.",
  },
  {
    init: "MK",
    name: "Nguyễn Minh Khoa",
    major: "Artificial Intelligence · K17",
    company: "VNG Corporation",
    companyColor: "#0a0a0a",
    stars: 5,
    atsScore: 88,
    quote:
      "Cái hay nhất là nó hiểu đúng ngữ cảnh FPT — OJT, Capstone, F-Code. ChatGPT viết ra toàn 'passionate' với 'leverage', còn cái này viết tự nhiên như mình tự viết nhưng xịn hơn nhiều lần.",
  },
  {
    init: "BC",
    name: "Phạm Lê Bảo Châu",
    major: "Business Administration · K18",
    company: "MoMo",
    companyColor: "#a855f7",
    stars: 5,
    atsScore: 93,
    quote:
      "Mình dùng thử free trước — ngay lần đầu ATS Score đã lên 87%. Sau khi upgrade Pro và paste JD cụ thể của MoMo vào, score lên 93.2%. Đúng 3 ngày sau có email mời phỏng vấn.",
  },
  {
    init: "ĐA",
    name: "Vũ Đức Anh",
    major: "Cyber Security · K17",
    company: "VNPT",
    companyColor: "#3b82f6",
    stars: 5,
    atsScore: 89,
    quote:
      "49K/tháng mà chất lượng này? Mình đã từng bỏ 300K thuê người viết CV mà kết quả còn không bằng. Tool này hiểu được mình muốn gì từ JD và tối ưu cực kỳ chính xác.",
  },
  {
    init: "NH",
    name: "Bùi Ngọc Hân",
    major: "Digital Marketing · K18",
    company: "Tiki",
    companyColor: "#3b82f6",
    stars: 5,
    atsScore: 86,
    quote:
      "Là dân Marketing, mình nghĩ tool này chỉ cho dân IT. Nhưng khi paste JD Marketing Analyst của Tiki vào thì AI phân tích cực kỳ chính xác các từ khóa như 'cohort analysis', 'A/B testing'. Ấn tượng thật sự.",
  },
];

// ── 3D Tilt Card ─────────────────────────────────────────────────────
function TiltCard({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const rawX = useMotionValue(0);
  const rawY = useMotionValue(0);
  const springX = useSpring(rawX, { stiffness: 250, damping: 20 });
  const springY = useSpring(rawY, { stiffness: 250, damping: 20 });
  const rotateX = useTransform(springY, [-0.5, 0.5], ["10deg", "-10deg"]);
  const rotateY = useTransform(springX, [-0.5, 0.5], ["-10deg", "10deg"]);

  const onMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!ref.current) return;
    const rect = ref.current.getBoundingClientRect();
    rawX.set((e.clientX - rect.left) / rect.width - 0.5);
    rawY.set((e.clientY - rect.top) / rect.height - 0.5);
  };
  const onLeave = () => { rawX.set(0); rawY.set(0); };

  return (
    <div
      ref={ref}
      onMouseMove={onMove}
      onMouseLeave={onLeave}
      className={`cursor-grab active:cursor-grabbing ${className}`}
      style={{ perspective: "900px" }}
    >
      <motion.div
        style={{ rotateX, rotateY, transformStyle: "preserve-3d" }}
        className="h-full"
      >
        {children}
      </motion.div>
    </div>
  );
}

// ── Star Rating ───────────────────────────────────────────────────────
function Stars({ count }: { count: number }) {
  return (
    <div className="flex gap-0.5" aria-label={`${count} sao`}>
      {Array.from({ length: count }).map((_, i) => (
        <svg key={i} width="14" height="14" viewBox="0 0 24 24" fill="#F26F21" aria-hidden="true">
          <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
        </svg>
      ))}
    </div>
  );
}

// ── Testimonial Card ──────────────────────────────────────────────────
function TestimonialCard({ t }: { t: (typeof TESTIMONIALS)[number] }) {
  return (
    <TiltCard className="w-[340px] sm:w-[380px] flex-shrink-0 h-full">
      <div className="h-full border-4 border-black bg-white neo-shadow p-8 flex flex-col gap-5">
        {/* Stars */}
        <Stars count={t.stars} />

        {/* Quote */}
        <blockquote className="text-base font-bold text-zinc-800 leading-relaxed flex-1">
          &ldquo;{t.quote}&rdquo;
        </blockquote>

        {/* ATS Score badge */}
        <div className="flex items-center gap-2">
          <div className="px-3 py-1 bg-zinc-950 text-white text-xs font-black uppercase tracking-widest">
            ATS {t.atsScore}%
          </div>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#22c55e" strokeWidth="2.5" aria-hidden="true">
            <polyline points="20 6 9 17 4 12" />
          </svg>
          <span className="text-xs font-bold text-emerald-600">Vượt vòng lọc</span>
        </div>

        {/* Author */}
        <div className="flex items-center gap-3 pt-4 border-t-2 border-zinc-100">
          <div
            className="w-10 h-10 rounded-full border-2 border-black flex items-center justify-center text-sm font-black text-black flex-shrink-0"
            style={{ background: t.companyColor === "#0a0a0a" ? "#FDE047" : "#87E8C6" }}
          >
            {t.init}
          </div>
          <div className="min-w-0">
            <div className="font-black text-black text-sm leading-tight">{t.name}</div>
            <div className="text-zinc-400 text-xs font-bold truncate">{t.major}</div>
          </div>
          <div
            className="ml-auto flex-shrink-0 px-2.5 py-1 text-[10px] font-black uppercase tracking-widest border-2 border-black text-white"
            style={{ background: t.companyColor }}
          >
            {t.company}
          </div>
        </div>
      </div>
    </TiltCard>
  );
}

import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

// ── Main Section ──────────────────────────────────────────────────────
export const TestimonialsSection = () => {
  const sectionRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);

  useGSAP(() => {
    if (!sectionRef.current || !trackRef.current) return;

    const track = trackRef.current;
    
    const getScrollAmount = () => {
      // Lấy offset X hiện tại để tính toán chính xác left offset ban đầu
      const currentX = Number(gsap.getProperty(track, "x")) || 0;
      const initialLeft = track.getBoundingClientRect().left - currentX;
      // Trừ đi initialLeft để đảm bảo cuộn chạm kịch viền phải của nội dung
      return -(track.scrollWidth - window.innerWidth + initialLeft);
    };

    const tween = gsap.to(track, {
      x: getScrollAmount,
      ease: "none"
    });

    ScrollTrigger.create({
      trigger: sectionRef.current,
      start: "top top",
      // end dựa trên độ dài chính xác của getScrollAmount để tốc độ cuộn ngang = cuộn dọc
      end: () => `+=${Math.abs(getScrollAmount())}`,
      pin: true,
      animation: tween,
      scrub: 1,
      invalidateOnRefresh: true,
    });
    
    return () => {
      tween.kill();
    }
  }, { scope: sectionRef });

  return (
    <section 
      ref={sectionRef} 
      className="h-screen bg-zinc-100 border-b-4 border-black overflow-hidden flex flex-col justify-center"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 w-full mb-12">
        {/* Heading */}
        <motion.div
          initial={{ opacity: 0, y: 32 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7, ease: [0.32, 0.72, 0, 1] }}
          className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-6"
        >
          <div>
            <span className="inline-block rounded-full px-3 py-1 text-[11px] uppercase tracking-[0.2em] font-black border-2 border-black bg-white mb-6">
              Câu Chuyện Thật
            </span>
            <h2 className="text-6xl md:text-8xl font-black tracking-tighter text-black uppercase neo-shadow-text">
              Sinh Viên<br />Nói Gì?
            </h2>
          </div>
          <p className="text-sm font-bold text-zinc-500 max-w-[32ch] leading-relaxed">
            Tiếp tục cuộn xuống để đọc thêm trải nghiệm thực tế từ sinh viên FPT.
          </p>
        </motion.div>
      </div>

      {/* Horizontal Track */}
      <div className="pl-4 sm:pl-6 md:pl-[max(1.5rem,calc((100vw-80rem)/2))] w-full">
        <div
          ref={trackRef}
          className="flex gap-6 w-max items-stretch"
        >
          {TESTIMONIALS.map((t, i) => (
            <motion.div
              key={t.name}
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-40px" }}
              transition={{ duration: 0.6, ease: [0.32, 0.72, 0, 1], delay: i * 0.08 }}
              className="h-full"
            >
              <TestimonialCard t={t} />
            </motion.div>
          ))}
          {/* Trailing spacer so the last card doesn't stick to the right edge */}
          <div className="w-[15vw] flex-shrink-0" aria-hidden="true" />
        </div>
      </div>
    </section>
  );
};
