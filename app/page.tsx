import Link from 'next/link'
import { createServerSupabase } from '@/lib/supabase-server'

export default async function LandingPage() {
  const supabase = await createServerSupabase()
  const { data: { user } } = await supabase.auth.getUser()
  const isLoggedIn = !!user

  return (
    <>
      <style>{`
        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(24px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes blobFloat {
          0%, 100% { transform: translate(0, 0) scale(1); }
          33%       { transform: translate(28px, -18px) scale(1.06); }
          66%       { transform: translate(-18px, 14px) scale(0.95); }
        }
        .fade-in-up { animation: fadeInUp 0.65s ease-out forwards; opacity: 0; }
        .delay-100  { animation-delay: 0.1s; }
        .delay-250  { animation-delay: 0.25s; }
        .delay-400  { animation-delay: 0.4s; }
        .delay-550  { animation-delay: 0.55s; }
        .delay-700  { animation-delay: 0.7s; }
        .delay-900  { animation-delay: 0.9s; }
        .blob       { animation: blobFloat 9s ease-in-out infinite; }
        .blob-2     { animation: blobFloat 11s ease-in-out infinite 2s; }
        .blob-3     { animation: blobFloat 13s ease-in-out infinite 4.5s; }
        html        { scroll-behavior: smooth; }
      `}</style>

      <div className="min-h-screen bg-zinc-950 text-white">

        {/* ── Navbar ── */}
        <header className="fixed top-0 inset-x-0 z-50 bg-zinc-950/80 backdrop-blur-md border-b border-zinc-900">
          <nav className="max-w-6xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between">
            <Link href="/" className="font-semibold text-base tracking-tight">
              CV AI <span className="text-violet-400">FPT</span>
            </Link>
            <div className="flex items-center gap-2 sm:gap-3">
              {isLoggedIn ? (
                <Link
                  href="/dashboard"
                  className="px-4 py-2 rounded-lg bg-violet-600 hover:bg-violet-500 text-white text-sm font-medium transition-colors"
                >
                  Dashboard
                </Link>
              ) : (
                <>
                  <Link
                    href="/login"
                    className="px-3 py-2 text-zinc-300 hover:text-white text-sm transition-colors"
                  >
                    Đăng nhập
                  </Link>
                  <Link
                    href="/signup"
                    className="px-4 py-2 rounded-lg border border-zinc-700 hover:border-zinc-500 text-white text-sm transition-colors"
                  >
                    Đăng ký
                  </Link>
                </>
              )}
            </div>
          </nav>
        </header>

        <main>
          {/* ══════════════════════════════════════════
              SECTION 1 — HERO
          ══════════════════════════════════════════ */}
          <section
            aria-label="Hero"
            className="relative overflow-hidden min-h-screen flex flex-col items-center justify-center pt-14 pb-16"
          >
            {/* Gradient blobs */}
            <div className="blob absolute top-1/4 left-1/4 w-72 h-72 bg-violet-600/20 rounded-full blur-3xl pointer-events-none" />
            <div className="blob-2 absolute bottom-1/3 right-1/4 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
            <div className="blob-3 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-purple-700/15 rounded-full blur-3xl pointer-events-none" />

            <div className="relative z-10 text-center px-4 max-w-4xl mx-auto w-full">
              {/* Main tagline */}
              <h1 className="font-bold leading-[1.05] tracking-tight mb-6">
                <span className="fade-in-up delay-100 block text-5xl sm:text-6xl md:text-7xl lg:text-8xl text-white">
                  Viết CV.
                </span>
                <span className="fade-in-up delay-250 block text-5xl sm:text-6xl md:text-7xl lg:text-8xl bg-gradient-to-r from-violet-400 to-purple-500 bg-clip-text text-transparent">
                  Match JD.
                </span>
                <span className="fade-in-up delay-400 block text-5xl sm:text-6xl md:text-7xl lg:text-8xl bg-gradient-to-r from-emerald-400 to-green-500 bg-clip-text text-transparent">
                  Đậu OJT.
                </span>
              </h1>

              {/* Sub-tagline */}
              <p className="fade-in-up delay-550 text-base sm:text-lg text-zinc-400 max-w-md mx-auto mb-10">
                Công cụ AI dành riêng cho sinh viên FPT chuẩn bị OJT/internship.
                Viết CV theo ngữ cảnh FPT, đối chiếu với JD cụ thể, tối ưu vượt bot lọc nhà tuyển dụng.
              </p>

              {/* CTAs */}
              <div className="fade-in-up delay-700 flex flex-col sm:flex-row items-center justify-center gap-4 mb-14">
                <Link
                  href="/signup"
                  className="w-full sm:w-auto px-8 py-4 rounded-xl bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-500 hover:to-purple-500 text-white font-semibold text-lg transition-all shadow-[0_0_30px_rgba(139,92,246,0.35)] hover:shadow-[0_0_44px_rgba(139,92,246,0.55)]"
                >
                  Tạo CV miễn phí →
                </Link>
                <Link
                  href="/login"
                  className="w-full sm:w-auto px-8 py-4 rounded-xl border border-zinc-700 hover:border-zinc-500 text-zinc-300 hover:text-white font-medium text-lg transition-all text-center"
                >
                  Đã có tài khoản? Đăng nhập
                </Link>
              </div>

              {/* App mock-up */}
              <div className="fade-in-up delay-900 mx-auto max-w-2xl rounded-2xl bg-zinc-900 border border-zinc-800 p-5 sm:p-6 text-left shadow-[0_0_60px_rgba(139,92,246,0.1)]">
                {/* Window chrome */}
                <div className="flex items-center gap-2 mb-5">
                  <div className="w-3 h-3 rounded-full bg-red-500/60" />
                  <div className="w-3 h-3 rounded-full bg-yellow-500/60" />
                  <div className="w-3 h-3 rounded-full bg-green-500/60" />
                  <span className="ml-3 text-zinc-500 text-xs font-mono">cv-ojt-2026.pdf</span>
                </div>
                {/* Skeleton content */}
                <div className="space-y-3">
                  <div className="h-5 bg-zinc-800 rounded-md w-1/3" />
                  <div className="h-4 bg-zinc-800/70 rounded-md w-2/3" />
                  <div className="flex flex-wrap gap-2 pt-1">
                    <div className="h-5 bg-violet-900/50 rounded-full w-20" />
                    <div className="h-5 bg-violet-900/50 rounded-full w-16" />
                    <div className="h-5 bg-violet-900/50 rounded-full w-24" />
                  </div>
                  <div className="border-t border-zinc-800 pt-4 space-y-2">
                    <div className="h-3 bg-zinc-800/70 rounded w-full" />
                    <div className="h-3 bg-zinc-800/70 rounded w-5/6" />
                    <div className="h-3 bg-zinc-800/70 rounded w-4/6" />
                  </div>
                  <div className="flex items-center gap-2 pt-2">
                    <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                    <span className="text-emerald-400 text-xs">AI đang tối ưu CV của bạn...</span>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* ══════════════════════════════════════════
              SECTION 2 — FEATURES
          ══════════════════════════════════════════ */}
          <section aria-label="Tính năng" className="py-24 px-4 sm:px-6">
            <div className="max-w-5xl mx-auto">
              <div className="text-center mb-14">
                <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
                  Tất cả những gì sinh viên FPT cần
                </h2>
                <p className="text-zinc-400 text-lg">
                  Từ ý tưởng đến CV vào tay nhà tuyển dụng
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Card 1 */}
                <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-8 hover:border-violet-500/50 hover:shadow-[0_0_32px_rgba(139,92,246,0.12)] transition-all duration-300">
                  <div className="text-6xl mb-6" role="img" aria-label="Bút viết">📝</div>
                  <h3 className="text-xl font-semibold text-white mb-3">CV theo ngữ cảnh FPT</h3>
                  <p className="text-zinc-400 leading-relaxed text-sm sm:text-base">
                    Tạo CV phù hợp với khóa học, project, hoạt động của sinh viên FPT. AI hiểu bạn học gì và làm được gì.
                  </p>
                </div>

                {/* Card 2 */}
                <div className="relative bg-zinc-900 border border-zinc-800 rounded-2xl p-8 hover:border-violet-500/50 hover:shadow-[0_0_32px_rgba(139,92,246,0.12)] transition-all duration-300">
                  <span className="absolute top-4 right-4 px-2.5 py-1 bg-zinc-800 text-zinc-400 text-xs rounded-full border border-zinc-700">
                    Coming soon
                  </span>
                  <div className="text-6xl mb-6" role="img" aria-label="Mục tiêu">🎯</div>
                  <h3 className="text-xl font-semibold text-white mb-3">Match với JD</h3>
                  <p className="text-zinc-400 leading-relaxed text-sm sm:text-base">
                    Dán JD vào, AI chấm điểm CV vs JD, chỉ ra điểm thiếu cần bổ sung trước khi nộp.
                  </p>
                </div>

                {/* Card 3 */}
                <div className="relative bg-zinc-900 border border-zinc-800 rounded-2xl p-8 hover:border-violet-500/50 hover:shadow-[0_0_32px_rgba(139,92,246,0.12)] transition-all duration-300">
                  <span className="absolute top-4 right-4 px-2.5 py-1 bg-zinc-800 text-zinc-400 text-xs rounded-full border border-zinc-700">
                    Coming soon
                  </span>
                  <div className="text-6xl mb-6" role="img" aria-label="Robot">🤖</div>
                  <h3 className="text-xl font-semibold text-white mb-3">Vượt bot lọc ATS</h3>
                  <p className="text-zinc-400 leading-relaxed text-sm sm:text-base">
                    Tối ưu CV để qua hệ thống lọc tự động của nhà tuyển dụng. Không lo CV bị bỏ qua.
                  </p>
                </div>
              </div>
            </div>
          </section>

          {/* ══════════════════════════════════════════
              SECTION 3 — HOW IT WORKS
          ══════════════════════════════════════════ */}
          <section aria-label="Cách hoạt động" className="py-24 px-4 sm:px-6 bg-zinc-900/30">
            <div className="max-w-5xl mx-auto">
              <div className="text-center mb-16">
                <h2 className="text-3xl md:text-4xl font-bold text-white">
                  4 bước để có CV đậu vòng lọc
                </h2>
              </div>

              <div className="relative">
                {/* Connecting line — desktop only */}
                <div
                  className="hidden md:block absolute top-10 left-[12.5%] right-[12.5%] h-px"
                  style={{ background: 'linear-gradient(to right, #7c3aed, #a855f7, #10b981)' }}
                  aria-hidden="true"
                />

                <ol className="grid grid-cols-1 md:grid-cols-4 gap-10 md:gap-6">
                  {[
                    { emoji: '👤', label: 'Người dùng', title: 'Đăng ký miễn phí',     desc: 'Tạo tài khoản chỉ mất 30 giây với email sinh viên FPT.' },
                    { emoji: '✍️', label: 'Viết',       title: 'Nhập thông tin CV',     desc: 'Điền thông tin học vấn, kỹ năng và kinh nghiệm của bạn.' },
                    { emoji: '🤖', label: 'AI',          title: 'Nhận gợi ý từ AI',     desc: 'AI phân tích và đề xuất cải thiện từng phần của CV.' },
                    { emoji: '🚀', label: 'Ứng tuyển',  title: 'Tải PDF & ứng tuyển', desc: 'Xuất CV chuẩn PDF và sẵn sàng nộp cho nhà tuyển dụng.' },
                  ].map(({ emoji, label, title, desc }, i) => (
                    <li key={title} className="flex flex-col items-center text-center">
                      <div
                        className="relative z-10 w-20 h-20 rounded-2xl bg-zinc-900 border border-zinc-800 flex items-center justify-center text-4xl mb-4 shadow-[0_0_20px_rgba(139,92,246,0.15)]"
                        role="img"
                        aria-label={label}
                      >
                        {emoji}
                      </div>
                      <div className="text-violet-400 text-xs font-semibold tracking-widest uppercase mb-2">
                        Bước {i + 1}
                      </div>
                      <h3 className="text-white font-semibold mb-2">{title}</h3>
                      <p className="text-zinc-400 text-sm leading-relaxed">{desc}</p>
                    </li>
                  ))}
                </ol>
              </div>
            </div>
          </section>

          {/* ══════════════════════════════════════════
              SECTION 4 — PRICING
          ══════════════════════════════════════════ */}
          <section aria-label="Bảng giá" className="py-24 px-4 sm:px-6">
            <div className="max-w-3xl mx-auto">
              <div className="text-center mb-14">
                <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
                  Bắt đầu miễn phí, nâng cấp khi cần
                </h2>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
                {/* Free */}
                <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-8">
                  <h3 className="text-xl font-semibold text-white mb-1">Free</h3>
                  <div className="flex items-baseline gap-1 mb-1">
                    <span className="text-4xl font-bold text-white">0đ</span>
                  </div>
                  <p className="text-zinc-400 text-sm mb-6">Dùng thử thoải mái</p>
                  <ul className="space-y-3 mb-8" aria-label="Tính năng Free">
                    {['Tạo tối đa 5 CV', 'Gợi ý chuyên ngành cơ bản', 'Xuất PDF tiếng Việt'].map((f) => (
                      <li key={f} className="flex items-center gap-3 text-zinc-300 text-sm">
                        <span className="text-emerald-400 text-base font-bold" aria-hidden="true">✓</span>
                        {f}
                      </li>
                    ))}
                  </ul>
                  <Link
                    href="/signup"
                    className="block w-full py-3 rounded-xl border border-zinc-700 hover:border-zinc-500 text-center text-white font-medium transition-all"
                  >
                    Bắt đầu miễn phí
                  </Link>
                </div>

                {/* Pro */}
                <div className="relative bg-zinc-900 border border-violet-500/50 rounded-2xl p-8 shadow-[0_0_40px_rgba(139,92,246,0.2)]">
                  <span className="absolute -top-3.5 left-1/2 -translate-x-1/2 px-4 py-1 bg-gradient-to-r from-violet-600 to-purple-600 text-white text-xs font-semibold rounded-full whitespace-nowrap">
                    Phổ biến
                  </span>
                  <h3 className="text-xl font-semibold text-white mb-1">Pro 1 tháng</h3>
                  <div className="flex items-baseline gap-1 mb-1">
                    <span className="text-4xl font-bold text-white">49.000đ</span>
                    <span className="text-zinc-400 text-sm">/tháng</span>
                  </div>
                  <p className="text-zinc-400 text-sm mb-6">Đầy đủ tính năng AI</p>
                  <ul className="space-y-3 mb-8" aria-label="Tính năng Pro">
                    {['Tạo CV không giới hạn', 'Match JD chi tiết', 'ATS score checker', 'Ưu tiên hỗ trợ'].map((f) => (
                      <li key={f} className="flex items-center gap-3 text-zinc-300 text-sm">
                        <span className="text-emerald-400 text-base font-bold" aria-hidden="true">✓</span>
                        {f}
                      </li>
                    ))}
                  </ul>
                  <Link
                    href="/signup"
                    className="block w-full py-3 rounded-xl bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-500 hover:to-purple-500 text-center text-white font-semibold transition-all shadow-[0_0_20px_rgba(139,92,246,0.3)]"
                  >
                    Nâng cấp Pro
                  </Link>
                </div>
              </div>
            </div>
          </section>

          {/* ══════════════════════════════════════════
              SECTION 5 — FINAL CTA
          ══════════════════════════════════════════ */}
          <section aria-label="Kêu gọi hành động" className="py-24 px-4 sm:px-6 text-center">
            <div className="max-w-2xl mx-auto">
              <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-6 leading-tight">
                Sẵn sàng có chiếc CV đậu OJT?
              </h2>
              <p className="text-zinc-400 text-lg mb-10">
                Tham gia cùng các sinh viên FPT khác đang sử dụng CV AI
              </p>
              <Link
                href="/signup"
                className="inline-block px-10 py-5 rounded-2xl bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-500 hover:to-purple-500 text-white font-semibold text-xl transition-all shadow-[0_0_50px_rgba(139,92,246,0.4)] hover:shadow-[0_0_72px_rgba(139,92,246,0.6)]"
              >
                Tạo CV miễn phí ngay
              </Link>
            </div>
          </section>
        </main>

        {/* ── Footer ── */}
        <footer className="border-t border-zinc-900 py-6 px-4 sm:px-6">
          <div className="max-w-5xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3">
            <p className="text-zinc-500 text-sm">CV AI cho sinh viên FPT © 2026</p>
            <Link href="/feedback" className="text-zinc-400 hover:text-white text-sm transition-colors">
              Góp ý
            </Link>
          </div>
        </footer>

      </div>
    </>
  )
}
