"use client";
import { motion } from 'framer-motion'

// ── Animated Features Bento Grid ────────────────────────────────────
export const FeaturesSectionAnimated = () => {
  return (
    <section className="py-32 px-4 sm:px-6 bg-white border-b-4 border-black">
      <div className="max-w-7xl mx-auto">
        {/* Heading — slide from left */}
        <motion.div
          initial={{ opacity: 0, x: -48 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.7, ease: [0.32, 0.72, 0, 1] }}
          className="mb-20"
        >
          <span className="inline-block rounded-full px-3 py-1 text-[11px] uppercase tracking-[0.2em] font-black border-2 border-black bg-yellow-300 mb-6">
            Tính Năng
          </span>
          <h2 className="text-6xl md:text-8xl font-black tracking-tighter text-black uppercase neo-shadow-text">
            Vũ Khí<br />Bí Mật
          </h2>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-6 auto-rows-auto">
          {/* Card 1 — Wide (3/5) — slide from LEFT */}
          <motion.div
            initial={{ opacity: 0, x: -60 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: "-60px" }}
            transition={{ duration: 0.7, ease: [0.32, 0.72, 0, 1] }}
            className="group md:col-span-3 lg:col-span-3 p-10 border-4 border-black neo-shadow bg-[#87E8C6] hover:-translate-y-2 hover:shadow-[16px_16px_0px_0px_#0a0a0a] transition-all duration-300 flex flex-col"
          >
            <svg width="52" height="52" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="mb-8 text-black group-hover:scale-110 transition-transform origin-left" aria-hidden="true">
              <path d="M22 10v6M2 10l10-5 10 5-10 5z"/><path d="M6 12v5c3 3 9 3 12 0v-5"/>
            </svg>
            <h3 className="text-4xl font-black text-black uppercase mb-4 leading-tight">Ngữ cảnh FPT</h3>
            <p className="text-lg font-bold text-zinc-800 leading-relaxed max-w-[55ch]">
              Hiểu rõ OJT, Capstone, F-Code để tối ưu hóa ngôn từ — AI được huấn luyện đặc biệt
              với dữ liệu từ chương trình đào tạo FPT University.
            </p>
            <div className="mt-auto pt-8 flex gap-3 flex-wrap">
              {['OJT', 'Capstone', 'F-Code', 'F-Edu', 'FAI'].map((tag) => (
                <span key={tag} className="text-[10px] font-black uppercase tracking-widest border-2 border-black px-2 py-0.5 bg-white">
                  {tag}
                </span>
              ))}
            </div>
          </motion.div>

          {/* Card 2 — Narrow (2/5) — slide from RIGHT */}
          <motion.div
            initial={{ opacity: 0, x: 60 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: "-60px" }}
            transition={{ duration: 0.7, ease: [0.32, 0.72, 0, 1], delay: 0.1 }}
            className="group md:col-span-3 lg:col-span-2 p-10 border-4 border-black neo-shadow bg-yellow-300 hover:-translate-y-2 hover:shadow-[16px_16px_0px_0px_#0a0a0a] transition-all duration-300 flex flex-col"
          >
            <svg width="52" height="52" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="mb-8 text-black group-hover:scale-110 transition-transform origin-left" aria-hidden="true">
              <circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="6"/><circle cx="12" cy="12" r="2"/>
            </svg>
            <h3 className="text-4xl font-black text-black uppercase mb-4 leading-tight">Phân tích JD</h3>
            <p className="text-lg font-bold text-zinc-800 leading-relaxed">
              Chấm điểm độ phù hợp & vá lỗ hổng kỹ năng của bạn theo từng Job Description cụ thể.
            </p>
            {/* ATS score visual */}
            <div className="mt-auto pt-8">
              <div className="flex justify-between mb-1">
                <span className="text-xs font-black uppercase tracking-widest text-black">ATS Match</span>
                <span className="text-xs font-black text-black">91.3%</span>
              </div>
              <div className="h-3 bg-black/20 border-2 border-black overflow-hidden">
                <div className="h-full bg-black" style={{ width: '91.3%' }} />
              </div>
            </div>
          </motion.div>

          {/* Card 3 — Full width — slide from BOTTOM */}
          <motion.div
            initial={{ opacity: 0, y: 60 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-40px" }}
            transition={{ duration: 0.7, ease: [0.32, 0.72, 0, 1], delay: 0.2 }}
            className="group md:col-span-3 lg:col-span-5 p-10 border-4 border-black neo-shadow bg-[var(--fpt-orange)] hover:-translate-y-2 hover:shadow-[16px_16px_0px_0px_#0a0a0a] transition-all duration-300 flex flex-col md:flex-row md:items-center gap-8"
          >
            <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="text-white flex-shrink-0 group-hover:scale-110 transition-transform" aria-hidden="true">
              <rect x="9" y="9" width="6" height="6"/><path d="M15 9V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4M9 15v4a2 2 0 002 2h2a2 2 0 002-2v-4M20 13h-4M4 13H0M13 4V0M13 24v-4"/>
            </svg>
            <div>
              <h3 className="text-4xl font-black text-white uppercase mb-3 leading-tight">Vượt bot ATS</h3>
              <p className="text-xl font-bold text-white/90 leading-relaxed max-w-[70ch]">
                Tối ưu từ khóa chuẩn hệ thống nhân sự. Mô phỏng thuật toán ATS phổ biến nhất tại Việt Nam
                — khi điểm Match trên 85%, tỷ lệ vượt vòng lọc tăng gấp nhiều lần.
              </p>
            </div>
            <div className="md:ml-auto flex-shrink-0 text-right">
              <div className="text-7xl font-black text-white neo-shadow-text">85%+</div>
              <div className="text-sm font-black text-white/80 uppercase tracking-widest">Match Score</div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};
