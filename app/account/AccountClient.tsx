'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'

type Feedback = { type: 'success' | 'error'; text: string } | null

// ── Reusable bits ───────────────────────────────────────────────────────────

function SectionCard({
  title,
  emoji,
  desc,
  children,
}: {
  title: string
  emoji: string
  desc: string
  children: React.ReactNode
}) {
  return (
    <div className="bg-white border-4 border-black rounded-[2rem] p-6 md:p-8 shadow-[8px_8px_0_0_#000]">
      <div className="mb-6">
        <h2 className="flex items-center gap-3 text-xl font-black text-black uppercase tracking-tight">
          <span className="text-2xl">{emoji}</span> {title}
        </h2>
        <p className="text-sm font-semibold text-zinc-500 mt-2">{desc}</p>
      </div>
      {children}
    </div>
  )
}

function Banner({ feedback }: { feedback: Feedback }) {
  if (!feedback) return null
  const ok = feedback.type === 'success'
  return (
    <div
      className={`mb-4 px-4 py-3 rounded-xl border-2 text-sm font-bold ${
        ok
          ? 'border-green-600 bg-green-50 text-green-800'
          : 'border-red-500 bg-red-50 text-red-700'
      }`}
    >
      {ok ? '✓ ' : '⚠️ '}
      {feedback.text}
    </div>
  )
}

const labelCls = 'text-black font-black uppercase tracking-wider text-[11px] mb-2 block'
const inputCls =
  'w-full bg-white text-black border-2 border-zinc-200 rounded-xl px-4 py-3.5 focus:outline-none focus:border-black focus:ring-4 focus:ring-zinc-100 hover:border-zinc-300 placeholder-zinc-400 text-[15px] font-bold shadow-sm transition-all disabled:opacity-50 disabled:bg-zinc-50'
const btnCls =
  'bg-black hover:bg-zinc-800 text-white font-black uppercase tracking-widest text-[13px] py-3.5 px-6 rounded-xl shadow-[4px_4px_0_0_var(--fpt-orange)] transition-all hover:translate-y-1 hover:shadow-none active:scale-95 disabled:opacity-50 disabled:translate-y-0 disabled:shadow-[4px_4px_0_0_var(--fpt-orange)]'

// ── Page ─────────────────────────────────────────────────────────────────────

export default function AccountClient() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)

  // Thông tin tài khoản hiện tại
  const [currentEmail, setCurrentEmail] = useState('')
  const [isEmailProvider, setIsEmailProvider] = useState(true)

  // ── Form: Tên hiển thị ──
  const [name, setName] = useState('')
  const [nameSaving, setNameSaving] = useState(false)
  const [nameMsg, setNameMsg] = useState<Feedback>(null)

  // ── Form: Email ──
  const [newEmail, setNewEmail] = useState('')
  const [emailSaving, setEmailSaving] = useState(false)
  const [emailMsg, setEmailMsg] = useState<Feedback>(null)

  // ── Form: Mật khẩu ──
  const [curPass, setCurPass] = useState('')
  const [newPass, setNewPass] = useState('')
  const [confirmPass, setConfirmPass] = useState('')
  const [passSaving, setPassSaving] = useState(false)
  const [passMsg, setPassMsg] = useState<Feedback>(null)

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session) {
        router.push('/login?redirect=/account')
        return
      }
      const u = session.user
      setCurrentEmail(u.email ?? '')
      setName((u.user_metadata?.full_name as string) ?? '')
      const provider = (u.app_metadata?.provider as string) ?? 'email'
      setIsEmailProvider(provider === 'email')
      setLoading(false)
    })
  }, [router])

  // ── Handlers ──────────────────────────────────────────────────────────────

  async function handleSaveName(e: React.FormEvent) {
    e.preventDefault()
    setNameMsg(null)
    const trimmed = name.trim()
    if (trimmed.length < 2) {
      setNameMsg({ type: 'error', text: 'Tên hiển thị phải có ít nhất 2 ký tự.' })
      return
    }
    setNameSaving(true)
    const { error } = await supabase.auth.updateUser({ data: { full_name: trimmed } })
    setNameSaving(false)
    if (error) {
      setNameMsg({ type: 'error', text: error.message })
      return
    }
    setNameMsg({ type: 'success', text: 'Đã cập nhật tên hiển thị.' })
  }

  async function handleSaveEmail(e: React.FormEvent) {
    e.preventDefault()
    setEmailMsg(null)
    const trimmed = newEmail.trim().toLowerCase()
    const emailRe = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRe.test(trimmed)) {
      setEmailMsg({ type: 'error', text: 'Email không hợp lệ.' })
      return
    }
    if (trimmed === currentEmail.toLowerCase()) {
      setEmailMsg({ type: 'error', text: 'Email mới trùng với email hiện tại.' })
      return
    }
    setEmailSaving(true)
    const { error } = await supabase.auth.updateUser({ email: trimmed })
    setEmailSaving(false)
    if (error) {
      setEmailMsg({ type: 'error', text: error.message })
      return
    }
    setEmailMsg({
      type: 'success',
      text: `Đã gửi link xác nhận tới ${trimmed}. Email sẽ đổi sau khi bạn nhấp xác nhận (kiểm tra cả hộp thư cũ nếu được yêu cầu).`,
    })
    setNewEmail('')
  }

  async function handleSavePassword(e: React.FormEvent) {
    e.preventDefault()
    setPassMsg(null)
    if (newPass.length < 6) {
      setPassMsg({ type: 'error', text: 'Mật khẩu mới phải có ít nhất 6 ký tự.' })
      return
    }
    if (newPass !== confirmPass) {
      setPassMsg({ type: 'error', text: 'Mật khẩu xác nhận không khớp.' })
      return
    }
    if (!curPass) {
      setPassMsg({ type: 'error', text: 'Vui lòng nhập mật khẩu hiện tại.' })
      return
    }

    setPassSaving(true)
    // Xác thực lại bằng mật khẩu hiện tại trước khi đổi
    const { error: reauthError } = await supabase.auth.signInWithPassword({
      email: currentEmail,
      password: curPass,
    })
    if (reauthError) {
      setPassSaving(false)
      setPassMsg({ type: 'error', text: 'Mật khẩu hiện tại không đúng.' })
      return
    }

    const { error } = await supabase.auth.updateUser({ password: newPass })
    setPassSaving(false)
    if (error) {
      setPassMsg({ type: 'error', text: error.message })
      return
    }
    setPassMsg({ type: 'success', text: 'Đã cập nhật mật khẩu thành công.' })
    setCurPass('')
    setNewPass('')
    setConfirmPass('')
  }

  // ── Render ──────────────────────────────────────────────────────────────────

  if (loading) {
    return (
      <div className="min-h-screen bg-zinc-50 flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-black border-t-[var(--fpt-orange)] rounded-full animate-spin shadow-[4px_4px_0_0_#000]" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-zinc-50 pt-16 pb-24 px-4 md:px-8">
      <div className="max-w-[720px] mx-auto">
        {/* Header */}
        <div className="mb-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-[#C4A1FF] border-2 border-black rounded text-[11px] font-black uppercase tracking-widest mb-4 shadow-[4px_4px_0_0_#000]">
            Cài đặt
          </div>
          <h1 className="text-4xl md:text-6xl font-black text-black tracking-tighter uppercase mb-3 neo-shadow-text leading-[1.05]">
            Tài khoản
          </h1>
          <p className="text-zinc-500 font-bold text-base md:text-lg">
            Cập nhật thông tin cá nhân và bảo mật của bạn.
          </p>
        </div>

        <div className="flex flex-col gap-6">
          {/* ── Tên hiển thị ── */}
          <SectionCard title="Tên hiển thị" emoji="🧑" desc="Tên này hiển thị trên thanh điều hướng và trong CV của bạn.">
            <Banner feedback={nameMsg} />
            <form onSubmit={handleSaveName} className="flex flex-col gap-4">
              <div>
                <label className={labelCls}>Họ và tên</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => { setName(e.target.value); setNameMsg(null) }}
                  placeholder="VD: Nguyễn Văn A"
                  className={inputCls}
                />
              </div>
              <div className="flex justify-end">
                <button type="submit" disabled={nameSaving} className={btnCls}>
                  {nameSaving ? 'Đang lưu...' : 'Lưu tên'}
                </button>
              </div>
            </form>
          </SectionCard>

          {/* ── Email ── */}
          <SectionCard title="Email" emoji="✉️" desc="Email dùng để đăng nhập. Đổi email cần xác nhận qua link gửi vào hộp thư.">
            <Banner feedback={emailMsg} />
            <div className="mb-4 p-4 bg-zinc-50 border-2 border-zinc-200 rounded-xl">
              <span className="block text-[11px] font-black uppercase tracking-widest text-zinc-400">Email hiện tại</span>
              <span className="font-black text-black break-words">{currentEmail}</span>
            </div>
            {isEmailProvider ? (
              <form onSubmit={handleSaveEmail} className="flex flex-col gap-4">
                <div>
                  <label className={labelCls}>Email mới</label>
                  <input
                    type="email"
                    value={newEmail}
                    onChange={(e) => { setNewEmail(e.target.value); setEmailMsg(null) }}
                    placeholder="email-moi@example.com"
                    className={inputCls}
                  />
                </div>
                <div className="flex justify-end">
                  <button type="submit" disabled={emailSaving} className={btnCls}>
                    {emailSaving ? 'Đang gửi...' : 'Đổi email'}
                  </button>
                </div>
              </form>
            ) : (
              <p className="text-sm font-semibold text-zinc-500 bg-yellow-50 border-2 border-yellow-300 rounded-xl p-4">
                Tài khoản của bạn đăng nhập bằng Google nên email được quản lý bởi Google, không thể đổi tại đây.
              </p>
            )}
          </SectionCard>

          {/* ── Mật khẩu ── */}
          <SectionCard title="Mật khẩu" emoji="🔒" desc="Để đổi mật khẩu, hãy nhập mật khẩu hiện tại để xác thực.">
            <Banner feedback={passMsg} />
            {isEmailProvider ? (
              <form onSubmit={handleSavePassword} className="flex flex-col gap-4">
                <div>
                  <label className={labelCls}>Mật khẩu hiện tại</label>
                  <input
                    type="password"
                    value={curPass}
                    onChange={(e) => { setCurPass(e.target.value); setPassMsg(null) }}
                    placeholder="••••••••"
                    autoComplete="current-password"
                    className={inputCls}
                  />
                </div>
                <div>
                  <label className={labelCls}>Mật khẩu mới</label>
                  <input
                    type="password"
                    value={newPass}
                    onChange={(e) => { setNewPass(e.target.value); setPassMsg(null) }}
                    placeholder="Ít nhất 6 ký tự"
                    autoComplete="new-password"
                    className={inputCls}
                  />
                </div>
                <div>
                  <label className={labelCls}>Xác nhận mật khẩu mới</label>
                  <input
                    type="password"
                    value={confirmPass}
                    onChange={(e) => { setConfirmPass(e.target.value); setPassMsg(null) }}
                    placeholder="••••••••"
                    autoComplete="new-password"
                    className={inputCls}
                  />
                </div>
                <div className="flex justify-end">
                  <button type="submit" disabled={passSaving} className={btnCls}>
                    {passSaving ? 'Đang cập nhật...' : 'Đổi mật khẩu'}
                  </button>
                </div>
              </form>
            ) : (
              <p className="text-sm font-semibold text-zinc-500 bg-yellow-50 border-2 border-yellow-300 rounded-xl p-4">
                Tài khoản đăng nhập bằng Google không dùng mật khẩu tại đây. Vui lòng quản lý mật khẩu trong tài khoản Google của bạn.
              </p>
            )}
          </SectionCard>
        </div>
      </div>
    </div>
  )
}
