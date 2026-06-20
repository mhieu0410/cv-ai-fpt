"use client";
import Link from "next/link";
import { motion } from "framer-motion";
import { MagneticButton } from "./magnetic-button";

// ── Final CTA with cinematic scale+blur reveal ────────────────────────
export const FinalCTASection = () => {
  return (
    <section className="py-40 px-4 sm:px-6 bg-yellow-300 text-black text-center relative overflow-hidden border-b-4 border-black">
      {/* Dot-grid texture */}
      <div
        className="absolute inset-0 opacity-20 pointer-events-none"
        style={{
          backgroundImage: 'radial-gradient(circle, #000 1px, transparent 1px)',
          backgroundSize: '24px 24px',
        }}
      />

      <div className="max-w-5xl mx-auto relative z-10">
        <motion.span
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="inline-block rounded-full px-3 py-1 text-[11px] uppercase tracking-[0.2em] font-black border-2 border-black bg-white mb-8"
        >
          Bắt Đầu Ngay
        </motion.span>

        {/* Cinematic scale + blur reveal — the headline moment */}
        <motion.h2
          initial={{ opacity: 0, scale: 0.88, filter: "blur(14px)" }}
          whileInView={{ opacity: 1, scale: 1, filter: "blur(0px)" }}
          viewport={{ once: true, margin: "-60px" }}
          transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
          className="text-7xl md:text-9xl font-black tracking-tighter mb-10 uppercase neo-shadow-text leading-none"
        >
          Bạn Đã<br />Sẵn Sàng?
        </motion.h2>

        <motion.p
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="text-xl font-bold mb-14 bg-white inline-block px-8 py-4 border-4 border-black neo-shadow"
        >
          347 sinh viên FPT K17/K18 đã apply thành công OJT. Giờ đến lượt bạn.
        </motion.p>

        <br />

        <motion.div
          initial={{ opacity: 0, y: 32 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.45 }}
        >
          <MagneticButton>
            <Link
              href="/signup"
              className="inline-flex items-center gap-4 px-16 py-7 border-4 border-black bg-[var(--fpt-orange)] text-white font-black text-3xl md:text-4xl uppercase shadow-[12px_12px_0px_0px_#0a0a0a] hover:-translate-y-3 hover:shadow-[20px_20px_0px_0px_#0a0a0a] transition-all active:scale-95"
            >
              Tạo CV Ngay
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <line x1="5" y1="12" x2="19" y2="12"/>
                <polyline points="12 5 19 12 12 19"/>
              </svg>
            </Link>
          </MagneticButton>
        </motion.div>

        {/* Micro trust signals below CTA */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.65 }}
          className="flex justify-center gap-8 mt-10 flex-wrap"
        >
          {[
            { icon: "M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z", text: "Bảo mật tuyệt đối" },
            { icon: "M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4M7 10l5 5 5-5M12 15V3", text: "Không cần cài đặt" },
            { icon: "M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8zM12 9a3 3 0 100 6 3 3 0 000-6z", text: "Không lưu CV của bạn" },
          ].map(({ icon, text }) => (
            <div key={text} className="flex items-center gap-2 text-sm font-bold text-black/70">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" className="text-black" aria-hidden="true">
                <path d={icon} />
              </svg>
              {text}
            </div>
          ))}
        </motion.div>
      </div>
    </section>
  );
};
