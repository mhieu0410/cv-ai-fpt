'use client'

import { useEffect, useState, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { supabase } from '@/lib/supabase'

  interface CV {
    id: string
    title: string
    created_at: string
  }

  function formatDate(iso: string) {
    return new Date(iso).toLocaleDateString('vi-VN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    })
  }

  function CVCard({ cv }: { cv: CV }) {
    const router = useRouter()
    return (
      <div className="bg-zinc-900 rounded-xl px-5 py-4 flex items-center
  justify-between gap-4">
        <div className="min-w-0">
          <p className="text-white font-medium truncate">{cv.title}</p>
          <p className="text-zinc-500 text-sm mt-0.5">Tạo lúc
  {formatDate(cv.created_at)}</p>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <button
            type="button"
            onClick={() => router.push(`/cv/${cv.id}/suggest`)}
            className="text-sm text-blue-400 hover:text-blue-200 border
  border-blue-800 hover:border-blue-500 px-4 py-1.5 rounded-lg
  transition-colors"
          >
            Gợi ý chuyên ngành
          </button>
          <button
            type="button"
            className="text-sm text-zinc-400 hover:text-white border
  border-zinc-700 hover:border-zinc-500 px-4 py-1.5 rounded-lg
  transition-colors"
          >
            Xem
          </button>
        </div>
      </div>
    )
  }

  function DashboardContent() {
    const router = useRouter()
    const searchParams = useSearchParams()

    const [email, setEmail] = useState<string | null>(null)
    const [authLoading, setAuthLoading] = useState(true)
    const [cvs, setCvs] = useState<CV[]>([])
    const [cvsLoading, setCvsLoading] = useState(true)
    const [success, setSuccess] = useState(false)

    useEffect(() => {
      if (searchParams.get('success') === '1') {
        setSuccess(true)
        window.history.replaceState(null, '', '/dashboard')
      }
    }, [searchParams])

    useEffect(() => {
      supabase.auth.getSession().then(async ({ data: { session } }) => {
        if (!session) {
          router.push('/login')
          return
        }

        setEmail(session.user.email ?? null)
        setAuthLoading(false)

        const { data } = await supabase
          .from('cvs')
          .select('id, title, created_at')
          .eq('user_id', session.user.id)
          .order('created_at', { ascending: false })

        setCvs(data ?? [])
        setCvsLoading(false)
      })
    }, [router])

    async function handleLogout() {
      await supabase.auth.signOut()
      router.push('/login')
    }

    if (authLoading) {
      return (
        <div className="min-h-screen bg-black flex items-center justify-center">
          <p className="text-zinc-500">Đang tải...</p>
        </div>
      )
    }

    return (
      <div className="min-h-screen bg-black py-10 px-4">
        {success && (
          <div className="fixed top-6 left-1/2 -translate-x-1/2 bg-green-900/80
  border border-green-700 text-green-300 text-sm px-5 py-3 rounded-xl flex
  items-center gap-3 shadow-lg z-10">
            <span>✓ Lưu CV thành công!</span>
            <button onClick={() => setSuccess(false)} className="text-green-500
  hover:text-green-200 leading-none">×</button>
          </div>
        )}
  
        <div className="max-w-2xl mx-auto">
          <div className="flex items-center justify-between mb-8">
            <div>
              <p className="text-zinc-500 text-sm">Xin chào,</p>
              <p className="text-white font-semibold">{email}</p>
            </div>
            <button onClick={handleLogout} className="text-zinc-500
  hover:text-white text-sm transition-colors">
              Đăng xuất
            </button>
          </div>

          <div className="flex items-center justify-between mb-4">
            <h1 className="text-white text-lg font-bold">CV của tôi</h1>
            <button
              onClick={() => router.push('/cv/new')}
              className="bg-white text-black text-sm font-semibold px-4 py-2
  rounded-lg hover:bg-zinc-200 transition-colors"
            >
              + Tạo CV mới
            </button>
          </div>

          {cvsLoading ? (
            <p className="text-zinc-500 text-sm py-8 text-center">Đang
  tải...</p>
          ) : cvs.length === 0 ? (
            <div className="text-center py-16">
              <p className="text-zinc-400 mb-4">Bạn chưa có CV nào. Tạo CV đầu
  tiên!</p>
              <button
                onClick={() => router.push('/cv/new')}
                className="bg-white text-black text-sm font-semibold px-6 py-2.5
  rounded-lg hover:bg-zinc-200 transition-colors"
              >
                + Tạo CV mới
              </button>
            </div>
          ) : (
            <div className="flex flex-col gap-3">
              {cvs.map((cv) => <CVCard key={cv.id} cv={cv} />)}
            </div>
          )}
        </div>
      </div>
    )
  }
  
  export default function DashboardPage() {
    return (
      <Suspense fallback={
        <div className="min-h-screen bg-black flex items-center justify-center">
          <p className="text-zinc-500">Đang tải...</p>
        </div>
      }>
        <DashboardContent />
      </Suspense>
    )
  }
