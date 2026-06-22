"use client";
import Link from "next/link";
import { motion } from "framer-motion";
import { MagneticButton } from "./magnetic-button";
import { ParallaxCard } from "./parallax-card";

// ── Animated Pricing Section with ParallaxCard ────────────────────────
export const PricingSectionAnimated = () => {
  return (
    <section className="py-32 px-4 sm:px-6 bg-white border-b-4 border-black">
      <div className="max-w-6xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 32 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.7, ease: [0.32, 0.72, 0, 1] }}
          className="mb-20"
        >
          <span className="inline-block rounded-full px-3 py-1 text-[11px] uppercase tracking-[0.2em] font-black border-2 border-black bg-yellow-300 mb-6">
            Bảng Giá
          </span>
          <h2 className="text-6xl md:text-8xl font-black tracking-tighter text-black uppercase neo-shadow-text">
            Đầu Tư<br />Thông Minh
          </h2>
          <p className="text-xl font-bold text-zinc-500 mt-4 max-w-[55ch]">
            Giá 1 ly trà sữa đổi lấy cơ hội OJT mơ ước — không cần suy nghĩ nhiều.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 max-w-5xl mx-auto">
          {/* Free Tier — slide from left */}
          <motion.div
            initial={{ opacity: 0, x: -48 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: "-60px" }}
            transition={{ duration: 0.7, ease: [0.32, 0.72, 0, 1] }}
          >
            <ParallaxCard
              containerClassName="h-full"
              className="border-4 border-black rounded-none bg-zinc-100 neo-shadow h-full"
            >
              <div className="p-10 flex flex-col h-full">
                <h3 className="text-3xl font-black text-black uppercase mb-2">Gói Free</h3>
                <div className="text-7xl font-black text-black tracking-tighter mb-6 neo-shadow-text">0đ</div>
                <div className="text-xs font-black uppercase tracking-widest text-zinc-500 mb-8 border-b-2 border-zinc-300 pb-5">
                  Mãi mãi miễn phí
                </div>
                <ul className="space-y-4 mb-10 flex-1">
                  {[
                    'Tạo tối đa 5 bản CV',
                    'Sử dụng Template Tiêu Chuẩn',
                    'Xuất PDF miễn phí',
                    'Gợi ý AI mức cơ bản',
                  ].map((f) => (
                    <li key={f} className="flex items-center gap-3 text-base font-bold text-black">
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" className="text-[var(--fpt-orange)] flex-shrink-0" aria-hidden="true">
                        <polyline points="9 18 15 12 9 6"/>
                      </svg>
                      {f}
                    </li>
                  ))}
                </ul>
                <MagneticButton className="w-full">
                  <Link href="/signup" className="block w-full py-4 border-4 border-black bg-white text-black font-black uppercase text-lg text-center neo-shadow hover:-translate-y-1 transition-transform active:scale-95">
                    Bắt Đầu Ngay
                  </Link>
                </MagneticButton>
              </div>
            </ParallaxCard>
          </motion.div>

          {/* Pro Tier — slide from right */}
          <motion.div
            initial={{ opacity: 0, x: 48 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: "-60px" }}
            transition={{ duration: 0.7, ease: [0.32, 0.72, 0, 1], delay: 0.1 }}
            className="relative"
          >
            <ParallaxCard
              containerClassName="h-full"
              className="border-4 border-black rounded-none bg-[var(--fpt-orange)] neo-shadow h-full"
            >
              <div className="p-10 flex flex-col h-full relative">
                {/* Badge — overlaps top-right border of card */}
                <div
                  className="absolute -top-px -right-px z-20 px-4 py-1.5 border-4 border-black bg-yellow-300 text-black font-black text-xs uppercase tracking-widest"
                  style={{ boxShadow: "3px 3px 0 0 #000", transform: "rotate(3deg) translate(4px, -6px)" }}
                >
                  KHUYÊN DÙNG
                </div>
                <h3 className="text-3xl font-black text-black uppercase mb-2">Gói Pro AI</h3>
                <div className="text-7xl font-black text-black tracking-tighter mb-1 neo-shadow-text">49K</div>
                <div className="text-sm font-black text-black mb-8 border-b-4 border-black pb-5 uppercase tracking-widest">
                  / Tháng · VietQR · Không tự gia hạn
                </div>
                <ul className="space-y-4 mb-6 flex-1">
                  {[
                    'Tạo CV Vô Hạn',
                    'Phân tích & Match JD Chuyên Sâu',
                    'Sửa lỗi và nâng cấp từ khóa tự động',
                    'Mở khóa tất cả Template Premium',
                  ].map((f) => (
                    <li key={f} className="flex items-start gap-3 text-base font-bold text-black">
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" className="flex-shrink-0 mt-0.5" aria-hidden="true">
                        <polyline points="9 18 15 12 9 6"/>
                      </svg>
                      {f}
                    </li>
                  ))}
                </ul>

                {/* Savings callout */}
                <div className="bg-black text-white px-4 py-3 text-xs font-bold mb-6 leading-relaxed border-2 border-black">
                  <span className="text-yellow-300 font-black">Tiết kiệm ~2,000,000đ</span> so với thuê coach viết CV tay — chất lượng hơn 10 lần.
                </div>

                {/* Trust signals */}
                <div className="flex gap-4 text-[10px] font-black uppercase text-black mb-8">
                  {['Hủy bất lúc', 'Bảo mật', 'VietQR'].map((s) => (
                    <div key={s} className="flex items-center gap-1.5">
                      <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" aria-hidden="true">
                        <polyline points="20 6 9 17 4 12"/>
                      </svg>
                      {s}
                    </div>
                  ))}
                </div>

                <MagneticButton className="w-full">
                  <Link href="/signup" className="block w-full py-4 border-4 border-black bg-zinc-950 text-white font-black uppercase text-lg text-center shadow-[8px_8px_0px_0px_rgba(255,255,255,0.8)] hover:-translate-y-1.5 hover:shadow-[12px_12px_0px_0px_rgba(255,255,255,0.9)] transition-all active:scale-95">
                    Lên Đời Pro
                  </Link>
                </MagneticButton>
              </div>
            </ParallaxCard>
          </motion.div>
        </div>
      </div>
    </section>
  );
};
