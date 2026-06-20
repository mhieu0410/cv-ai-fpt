"use client";
import { motion } from "framer-motion";

// ── Before & After with directional slide-ins ────────────────────────
export const BeforeAfterSection = () => {
  return (
    <section className="py-32 px-4 sm:px-6 bg-zinc-100 border-b-4 border-black">
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 32 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.7, ease: [0.32, 0.72, 0, 1] }}
          className="mb-20"
        >
          <span className="inline-block rounded-full px-3 py-1 text-[11px] uppercase tracking-[0.2em] font-black border-2 border-black bg-white mb-6">
            So Sánh
          </span>
          <h2 className="text-6xl md:text-8xl font-black tracking-tighter text-black uppercase neo-shadow-text">
            Sự<br />Khác Biệt
          </h2>
          <p className="text-xl font-bold text-zinc-600 mt-6 max-w-[60ch]">
            Tại sao CV tự viết luôn bị rớt đài ngay vòng &quot;gửi xe&quot;?
          </p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Bad CV — slide from LEFT */}
          <motion.div
            initial={{ opacity: 0, x: -60 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: "-60px" }}
            transition={{ duration: 0.7, ease: [0.32, 0.72, 0, 1] }}
            className="bg-[#FF6B6B] border-4 border-black neo-shadow p-8 flex flex-col relative transform md:-rotate-1 hover:rotate-0 transition-transform duration-300"
          >
            <div className="absolute top-4 right-4 bg-zinc-950 text-white font-black px-4 py-2 uppercase text-sm tracking-widest transform rotate-12 neo-shadow">
              TỰ VIẾT TAY
            </div>
            <h3 className="text-4xl font-black uppercase mb-8 text-black mt-6">Cách Cũ</h3>
            <div className="space-y-5 bg-white p-8 border-4 border-black flex-1">
              {[
                { text: "Làm project môn học SWP391", note: "Viết chung chung, không có kết quả, không Tech Stack rõ ràng." },
                { text: "Biết code Java, HTML", note: "Thiếu trầm trọng từ khóa chuyên ngành, bot ATS loại lập tức." },
                { text: "ATS Match Score: 31%", note: "Bị loại trước khi con người đọc đến dòng đầu tiên." },
              ].map(({ text, note }) => (
                <div key={text} className="flex items-start gap-4">
                  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#ef4444" strokeWidth="2.5" strokeLinecap="round" className="flex-shrink-0 mt-0.5" aria-hidden="true">
                    <circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/>
                  </svg>
                  <div>
                    <p className="font-black text-black text-lg line-through decoration-red-500 decoration-4">{text}</p>
                    <p className="text-base font-bold text-red-700 mt-1">{note}</p>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Good CV — slide from RIGHT */}
          <motion.div
            initial={{ opacity: 0, x: 60 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: "-60px" }}
            transition={{ duration: 0.7, ease: [0.32, 0.72, 0, 1], delay: 0.1 }}
            className="bg-[#87E8C6] border-4 border-black neo-shadow p-8 flex flex-col relative transform md:rotate-1 hover:rotate-0 transition-transform duration-300"
          >
            <div className="absolute top-4 right-4 bg-[var(--fpt-orange)] text-white font-black px-4 py-2 uppercase text-sm tracking-widest transform -rotate-12 neo-shadow">
              AI TỐI ƯU
            </div>
            <h3 className="text-4xl font-black uppercase mb-8 text-black mt-6">Cách Của Tương Lai</h3>
            <div className="space-y-5 bg-white p-8 border-4 border-black flex-1">
              {[
                { text: "Phát triển hệ thống quản lý với React & Node.js, tăng 23% hiệu suất xử lý đơn.", note: "Dùng ngôn ngữ kết quả (Action Verbs) và số liệu cụ thể." },
                { text: "ATS Match Score: 91.3%", note: "Trúng 47/47 từ khóa của Job Description. Sẵn sàng Apply!" },
                { text: "Được gọi phỏng vấn trong 72 giờ", note: "Tiết kiệm 6+ giờ viết CV thủ công mỗi lần apply." },
              ].map(({ text, note }) => (
                <div key={text} className="flex items-start gap-4">
                  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#16a34a" strokeWidth="2.5" strokeLinecap="round" className="flex-shrink-0 mt-0.5" aria-hidden="true">
                    <circle cx="12" cy="12" r="10"/><polyline points="9 12 11 14 15 10"/>
                  </svg>
                  <div>
                    <p className="font-black text-black text-lg">{text}</p>
                    <p className="text-base font-bold text-emerald-700 mt-1">{note}</p>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};
