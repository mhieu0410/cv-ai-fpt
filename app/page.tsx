import Link from 'next/link'
import { createServerSupabase } from '@/lib/supabase-server'
import { MagneticButton } from '@/components/ui/magnetic-button'
import { ScrollTellingHero } from '@/components/ui/scroll-telling-hero'
import { FAQAccordion } from '@/components/ui/faq-accordion'
import { NewsletterForm } from '@/components/ui/newsletter-form'
import { FloatingNavbar } from '@/components/ui/floating-navbar'
import { Logo } from '@/components/ui/logo'
import { StatsCounter } from '@/components/ui/stats-counter'
import { HowItWorks } from '@/components/ui/how-it-works'
import { TestimonialsSection } from '@/components/ui/testimonials-section'
import { FeaturesSectionAnimated } from '@/components/ui/features-section-animated'
import { PricingSectionAnimated } from '@/components/ui/pricing-section-animated'
import { BeforeAfterSection } from '@/components/ui/before-after-section'
import { FinalCTASection } from '@/components/ui/final-cta-section'
import { BackToTopButton } from '@/components/ui/back-to-top'

export default async function LandingPage() {
  const supabase = await createServerSupabase()
  const { data: { user } } = await supabase.auth.getUser()
  const isLoggedIn = !!user

  return (
    <div className="min-h-screen text-zinc-900 selection:bg-[var(--fpt-orange)] selection:text-white font-sans" style={{ background: "#06101e" }}>

      {/* ── Ticker — sits at very top, scrolls away with page ───── */}
      <div className="bg-[var(--fpt-orange)] border-b-4 border-black px-4 py-2 flex justify-center items-center overflow-hidden relative z-[60]">
        <div className="flex whitespace-nowrap animate-ticker-scroll">
          {[...Array(8)].map((_, i) => (
            <span key={i} className="text-black font-black text-sm uppercase tracking-widest whitespace-nowrap flex items-center gap-6 pr-12">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" className="text-black inline-block flex-shrink-0" aria-hidden="true">
                <path d="M12 2C9 7 5 9.5 5 14a7 7 0 0014 0c0-2.5-1-5-3-7.5-.5 2-2 3.5-2 3.5S12 8 12 2z"/>
              </svg>
              Mở bán sớm: Tặng 100 gói Pro miễn phí cho sinh viên FPT K17/K18 — Hết hạn 30/09/2026
            </span>
          ))}
        </div>
      </div>

      {/* ── Floating Navbar ──────────────────────────────────────── */}
      <FloatingNavbar isLoggedIn={isLoggedIn} />

      <main>
        {/* S1 — CINEMATIC HERO
            id="hero-scroll-section" is used by FloatingNavbar to detect
            when the user exits the hero and the navbar should reappear. */}
        <div id="hero-scroll-section" className="relative z-10" style={{ background: "#06101e" }}>
          <ScrollTellingHero />
        </div>

        {/* Everything below hero is WHITE */}
        <div className="bg-white relative z-10">

          {/* ── Dual-direction Marquee ── */}
          <section className="border-y border-zinc-200 bg-zinc-50 overflow-hidden">
            <div className="py-4 border-b border-zinc-200 flex whitespace-nowrap animate-marquee">
              {[...Array(10)].map((_, i) => (
                <span key={i} className="text-2xl font-black text-zinc-800 uppercase mx-6 flex items-center gap-5 tracking-tight">
                  TIN DÙNG BỞI 500+ SINH VIÊN FPT
                  <span className="text-[var(--fpt-orange)] text-3xl leading-none">•</span>
                </span>
              ))}
            </div>
            <div className="py-4 flex whitespace-nowrap animate-marquee-reverse">
              {[
                'FPT Software', 'VNG Corporation', 'MoMo', 'Tiki', 'VNPT',
                'Viettel', 'Shopee VN', 'Zalo', 'KMS Technology', 'NashTech',
                'FPT Software', 'VNG Corporation', 'MoMo', 'Tiki', 'VNPT',
                'Viettel', 'Shopee VN', 'Zalo', 'KMS Technology', 'NashTech',
              ].map((co, i) => (
                <span key={i} className="text-sm font-black text-zinc-500 uppercase mx-6 tracking-widest flex items-center gap-5">
                  <svg width="6" height="6" viewBox="0 0 6 6" fill="currentColor" aria-hidden="true"><rect width="6" height="6"/></svg>
                  {co}
                </span>
              ))}
            </div>
          </section>

          {/* ══ S1.7 STATS ════════════════════════════════════════ */}
          <StatsCounter />

          {/* ══ S2 FEATURES ═══════════════════════════════════════ */}
          <FeaturesSectionAnimated />

          {/* ══ S2.3 HOW IT WORKS ═════════════════════════════════ */}
          <HowItWorks />

          {/* ══ S2.5 BEFORE & AFTER ═══════════════════════════════ */}
          <BeforeAfterSection />

          {/* ══ S2.7 TESTIMONIALS ═════════════════════════════════ */}
          <TestimonialsSection />

          {/* ══ S3 PRICING ════════════════════════════════════════ */}
          <PricingSectionAnimated />

          {/* ══ S3.5 FAQ (dark) ═══════════════════════════════════ */}
          <section className="py-32 px-4 sm:px-6 bg-zinc-950">
            <div className="max-w-4xl mx-auto">
              <div className="mb-20">
                <span className="inline-block rounded-full px-3 py-1 text-[11px] uppercase tracking-[0.2em] font-black border border-zinc-700 bg-zinc-900 text-zinc-400 mb-6">
                  FAQ
                </span>
                <h2 className="text-6xl md:text-8xl font-black tracking-tighter text-white uppercase">
                  Hỏi<br />Đáp
                </h2>
              </div>
              <FAQAccordion faqs={[
                { q: "Hệ thống AI có viết bị 'giả trân' không?", a: "Hoàn toàn không. Trái với ChatGPT thông thường hay dùng các cụm từ hoa mỹ rỗng tuếch, AI của chúng tôi được huấn luyện đặc biệt để tối ưu từ khóa ATS và sửa lỗi chính tả, nhưng vẫn giữ nguyên sự chân thực và ngôn ngữ thực tế của bạn." },
                { q: "Điểm ATS Match có thực sự chính xác?", a: "Chúng tôi mô phỏng các thuật toán phân tích từ khóa phổ biến của các phần mềm quản lý nhân sự (ATS) hiện hành. Khi điểm Match của bạn trên 85%, tỷ lệ CV của bạn vượt qua vòng lọc tự động sẽ tăng lên gấp nhiều lần." },
                { q: "Thanh toán Gói Pro như thế nào?", a: "Chúng tôi hỗ trợ thanh toán 1-chạm qua mã VietQR, cực kỳ phù hợp cho sinh viên. Gói Pro không tự động gia hạn nên bạn hoàn toàn chủ động trong việc quản lý chi phí." },
                { q: "Dữ liệu CV của tôi có được bảo mật không?", a: "Hoàn toàn. Chúng tôi không chia sẻ dữ liệu CV với bên thứ ba. Mỗi bản CV được mã hóa và chỉ bạn mới có quyền truy cập. Bạn có thể xóa tài khoản và toàn bộ dữ liệu bất kỳ lúc nào." },
                { q: "Có hỗ trợ ngành nghề nào ngoài CNTT không?", a: "Hiện tại CV AI FPT được tối ưu cho sinh viên FPT University với trọng tâm là ngành CNTT, Kinh tế số, và Kỹ thuật phần mềm. Chúng tôi đang mở rộng sang các ngành khác trong Q3 2025." },
              ]} />
            </div>
          </section>

          {/* ══ S4 FINAL CTA ══════════════════════════════════════ */}
          <FinalCTASection />

          {/* ── Footer ─────────────────────────────────────────── */}
          <footer className="bg-zinc-950 pt-20 pb-8 w-full">
            <div className="px-4 sm:px-6 max-w-7xl mx-auto flex flex-col lg:flex-row justify-between items-start gap-12 w-full mb-16">
              <div className="flex-1 w-full lg:w-auto">
                <h3 className="text-5xl font-black text-white uppercase mb-6 tracking-tighter">Đăng Ký Nhận Tin</h3>
                <p className="text-zinc-400 font-bold mb-8 text-lg leading-relaxed max-w-[45ch]">
                  Đừng bỏ lỡ những mẫu CV xịn xò nhất và mã giảm giá gói Pro dành riêng cho sinh viên FPT.
                </p>
                <NewsletterForm />
              </div>
              <div className="flex flex-col sm:flex-row gap-16 text-white w-full lg:w-auto">
                <div>
                  <h4 className="text-sm font-black uppercase mb-6 text-zinc-500 tracking-[0.2em]">Sản Phẩm</h4>
                  <ul className="space-y-4 font-bold text-lg">
                    {[{ label: 'Dashboard', href: '/dashboard' }, { label: 'Đăng Nhập', href: '/login' }].map(({ label, href }) => (
                      <li key={href}>
                        <Link href={href} className="hover:text-[var(--fpt-orange)] transition-colors inline-flex items-center gap-2 group">
                          {label}
                          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" className="opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all" aria-hidden="true">
                            <line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/>
                          </svg>
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>
                <div>
                  <h4 className="text-sm font-black uppercase mb-6 text-zinc-500 tracking-[0.2em]">Pháp Lý</h4>
                  <ul className="space-y-4 font-bold text-lg">
                    {[{ label: 'Điều Khoản', href: '/terms' }, { label: 'Bảo Mật', href: '/privacy' }].map(({ label, href }) => (
                      <li key={href}>
                        <Link href={href} className="hover:text-[var(--fpt-orange)] transition-colors inline-flex items-center gap-2 group">
                          {label}
                          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" className="opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all" aria-hidden="true">
                            <line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/>
                          </svg>
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
            <div className="max-w-7xl mx-auto w-full px-4 sm:px-6 flex flex-col md:flex-row items-center justify-between text-zinc-400 text-sm font-medium pb-6 border-t border-zinc-800 pt-6">
              <div className="flex items-center gap-4 mb-4 md:mb-0">
                <span>©2026 CV AI FPT</span>
                <span className="flex items-center gap-1">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
                  100% Bảo Mật
                </span>
              </div>
              <div className="flex items-center gap-6 mb-4 md:mb-0">
                <Link href="#" className="hover:text-white transition-colors" aria-label="X (Twitter)">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>
                </Link>
                <Link href="#" className="hover:text-white transition-colors" aria-label="Discord">
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor"><path d="M20.317 4.3698a19.7913 19.7913 0 00-4.8851-1.5152.0741.0741 0 00-.0785.0371c-.211.3753-.4447.8648-.6083 1.2495-1.8447-.2762-3.68-.2762-5.4868 0-.1636-.3933-.4058-.8742-.6177-1.2495a.077.077 0 00-.0785-.037 19.7363 19.7363 0 00-4.8852 1.515.0699.0699 0 00-.0321.0277C.5334 9.0458-.319 13.5799.0992 18.0578a.0824.0824 0 00.0312.0561c2.0528 1.5076 4.0413 2.4228 5.9929 3.0294a.0777.0777 0 00.0842-.0276c.4616-.6304.8731-1.2952 1.226-1.9942a.076.076 0 00-.0416-.1057c-.6528-.2476-1.2743-.5495-1.8722-.8923a.077.077 0 01-.0076-.1277c.1258-.0943.2517-.1923.3718-.2914a.0743.0743 0 01.0776-.0105c3.9278 1.7933 8.18 1.7933 12.0614 0a.0739.0739 0 01.0785.0095c.1202.099.246.1981.3728.2924a.077.077 0 01-.0066.1276 12.2986 12.2986 0 01-1.873.8914.0766.0766 0 00-.0407.1067c.3604.698.7719 1.3628 1.225 1.9932a.076.076 0 00.0842.0286c1.961-.6067 3.9495-1.5219 6.0023-3.0294a.077.077 0 00.0313-.0552c.5004-5.177-.8382-9.6739-3.5485-13.6604a.061.061 0 00-.0312-.0286zM8.02 15.3312c-1.1825 0-2.1569-1.0857-2.1569-2.419 0-1.3332.9555-2.4189 2.157-2.4189 1.2108 0 2.1757 1.0952 2.1568 2.419 0 1.3332-.9555 2.4189-2.1569 2.4189zm7.9748 0c-1.1825 0-2.1569-1.0857-2.1569-2.419 0-1.3332.9554-2.4189 2.1569-2.4189 1.2108 0 2.1757 1.0952 2.1568 2.419 0 1.3332-.946 2.4189-2.1568 2.4189Z"/></svg>
                </Link>
              </div>
              <BackToTopButton />
            </div>
          </footer>
        </div>
      </main>

      {/* ── Curtain reveal logo at scroll bottom ─────────────────── */}
      <div className="fixed bottom-0 left-0 w-full bg-[var(--fpt-orange)] z-0 h-[60vh] flex justify-center items-center overflow-hidden">
        <Logo isFooter={true} />
      </div>
      <div className="h-[60vh] w-full pointer-events-none" />

      <style>{`
        @keyframes marquee {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
        .animate-marquee { animation: marquee 22s linear infinite; width: 200%; }

        @keyframes marquee-reverse {
          0% { transform: translateX(-50%); }
          100% { transform: translateX(0); }
        }
        .animate-marquee-reverse { animation: marquee-reverse 18s linear infinite; width: 200%; }

        @keyframes ticker-scroll {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
        .animate-ticker-scroll { animation: ticker-scroll 32s linear infinite; width: 200%; }
      `}</style>
    </div>
  )
}


