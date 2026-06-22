'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { motion, AnimatePresence } from 'framer-motion'

type ExperienceLevel = 'Năm 1-3 (Đang học)' | 'Năm 4 (Tìm OJT)' | 'Đã tốt nghiệp (Fresher/Junior)' | ''
type TargetRole = 'Software Engineer' | 'Data Analyst' | 'Business Analyst' | 'Marketing' | 'Khác' | ''
type PainPoint = 'Không biết viết gì' | 'Nộp nhiều nhưng rớt ATS' | 'Thiết kế form quá xấu' | 'Chưa có kinh nghiệm thực tế' | ''

const LOADING_MESSAGES = [
  'Đang khởi tạo AI Engine...',
  'Đang phân tích kỹ năng hiện tại...',
  'Đang đối chiếu dữ liệu thị trường...',
  'Đang xây dựng chiến lược CV...',
  'Gần xong rồi...'
]

export default function OnboardingPage() {
  const router = useRouter()
  const [step, setStep] = useState(1)
  
  // State for answers
  const [experience, setExperience] = useState<ExperienceLevel>('')
  const [role, setRole] = useState<TargetRole>('')
  const [painPoint, setPainPoint] = useState<PainPoint>('')
  
  // For final step
  const [analyzing, setAnalyzing] = useState(false)
  const [loadingMsgIdx, setLoadingMsgIdx] = useState(0)

  // Verify Auth
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session) {
        router.push('/login?redirect=/onboarding')
      }
    })
  }, [router])

  // Handle Loading Text Animation
  useEffect(() => {
    if (analyzing) {
      const interval = setInterval(() => {
        setLoadingMsgIdx((prev) => (prev < LOADING_MESSAGES.length - 1 ? prev + 1 : prev))
      }, 500)
      return () => clearInterval(interval)
    }
  }, [analyzing])

  const handleBack = () => {
    if (step > 1) {
      setStep(step - 1)
    }
  }

  const finishOnboarding = async (finalPainPoint: PainPoint) => {
    setStep(4)
    setAnalyzing(true)
    setLoadingMsgIdx(0)
    
    // Giả lập thời gian AI phân tích (tạo cảm giác "Wow")
    setTimeout(async () => {
      // Lưu vào user metadata
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        await supabase.auth.updateUser({
          data: {
            onboarding_completed: true,
            cv_experience: experience,
            cv_target_role: role,
            cv_pain_point: finalPainPoint
          }
        })
      }
      setAnalyzing(false)
    }, 2800)
  }

  const getStepContent = () => {
    switch (step) {
      case 1:
        return (
          <motion.div
            key="step1"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="flex flex-col h-full justify-center"
          >
            <h2 className="text-3xl sm:text-4xl font-black tracking-tight mb-2 uppercase text-black">Giai đoạn hiện tại?</h2>
            <p className="text-zinc-500 font-bold mb-8 text-sm sm:text-base leading-relaxed">Điều này giúp chúng tôi tinh chỉnh cấu trúc CV phù hợp với bạn nhất.</p>
            
            <div className="flex flex-col gap-4 pb-8">
              {[
                { id: 'Năm 1-3 (Đang học)', icon: '📚', desc: 'Nhấn mạnh vào Đồ án môn học & CLB' },
                { id: 'Năm 4 (Tìm OJT)', icon: '🎯', desc: 'Tối ưu từ khóa để vượt qua vòng lọc OJT' },
                { id: 'Đã tốt nghiệp (Fresher/Junior)', icon: '💼', desc: 'Làm nổi bật kinh nghiệm làm việc thực tế' }
              ].map((item) => (
                <button
                  key={item.id}
                  onClick={() => { setExperience(item.id as ExperienceLevel); setTimeout(() => setStep(2), 300) }}
                  className={`text-left p-5 sm:p-6 rounded-2xl border-4 transition-all flex items-center gap-4 sm:gap-5 group ${
                    experience === item.id 
                      ? 'border-black bg-yellow-300 shadow-[4px_4px_0_0_#000]' 
                      : 'border-zinc-200 bg-white hover:border-black hover:shadow-[4px_4px_0_0_#000]'
                  }`}
                >
                  <div className={`w-12 h-12 shrink-0 rounded-xl flex items-center justify-center text-2xl border-2 border-black bg-white group-hover:scale-110 transition-transform`}>
                    {item.icon}
                  </div>
                  <div>
                    <h3 className="font-black text-black text-[15px] sm:text-lg">{item.id}</h3>
                    <p className="text-zinc-600 font-bold text-[13px] sm:text-sm mt-1">{item.desc}</p>
                  </div>
                </button>
              ))}
            </div>
          </motion.div>
        )
      case 2:
        return (
          <motion.div
            key="step2"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="flex flex-col h-full justify-center"
          >
            <h2 className="text-3xl sm:text-4xl font-black tracking-tight mb-2 uppercase text-black">Mục tiêu ứng tuyển?</h2>
            <p className="text-zinc-500 font-bold mb-8 text-sm sm:text-base leading-relaxed">Hệ thống sẽ gợi ý các từ khóa (keywords) mà nhà tuyển dụng tìm kiếm.</p>
            
            <div className="grid grid-cols-2 gap-4">
              {[
                { id: 'Software Engineer', icon: '💻' },
                { id: 'Data Analyst', icon: '📊' },
                { id: 'Business Analyst', icon: '📈' },
                { id: 'Marketing', icon: '🎨' },
              ].map((item) => (
                <button
                  key={item.id}
                  onClick={() => { setRole(item.id as TargetRole); setTimeout(() => setStep(3), 300) }}
                  className={`p-5 sm:p-6 rounded-2xl border-4 transition-all flex flex-col items-center justify-center gap-3 text-center group ${
                    role === item.id 
                      ? 'border-black bg-[var(--fpt-orange)] text-white shadow-[4px_4px_0_0_#000]' 
                      : 'border-zinc-200 bg-white hover:border-black hover:bg-zinc-50 hover:shadow-[4px_4px_0_0_#000]'
                  }`}
                >
                  <div className="text-4xl mb-1 sm:mb-2 group-hover:scale-125 transition-transform">{item.icon}</div>
                  <h3 className={`font-black text-[14px] sm:text-[15px] uppercase tracking-wide ${role === item.id ? 'text-white' : 'text-black'}`}>{item.id}</h3>
                </button>
              ))}
            </div>
            
            <button
              onClick={() => { setRole('Khác'); setTimeout(() => setStep(3), 300) }}
              className={`mt-4 w-full p-4 rounded-xl border-4 transition-all font-black text-sm uppercase tracking-widest ${
                role === 'Khác' 
                  ? 'border-black bg-black text-white shadow-[4px_4px_0_0_var(--fpt-orange)]' 
                  : 'border-zinc-200 bg-white text-zinc-600 hover:border-black hover:text-black hover:shadow-[4px_4px_0_0_#000]'
              }`}
            >
              Ngành Khác
            </button>
          </motion.div>
        )
      case 3:
        return (
          <motion.div
            key="step3"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="flex flex-col h-full justify-center"
          >
            <h2 className="text-3xl sm:text-4xl font-black tracking-tight mb-2 uppercase text-black">Vấn đề của bạn là gì?</h2>
            <p className="text-zinc-500 font-bold mb-8 text-sm sm:text-base leading-relaxed">Hãy chia sẻ thật lòng để AI của chúng tôi &quot;chữa bệnh&quot; cho chiếc CV của bạn.</p>
            
            <div className="flex flex-col gap-4 pb-8">
              {[
                { id: 'Không biết viết gì', icon: '🤔', desc: 'Thiếu định hướng nội dung chi tiết.' },
                { id: 'Nộp nhiều nhưng rớt ATS', icon: '🤖', desc: 'Cần tối ưu lại format và từ khóa.' },
                { id: 'Thiết kế form quá xấu', icon: '🤮', desc: 'Muốn có giao diện chuyên nghiệp hơn.' },
                { id: 'Chưa có kinh nghiệm thực tế', icon: '🌱', desc: 'Muốn biết cách khai thác các dự án nhỏ.' }
              ].map((item) => (
                <button
                  key={item.id}
                  onClick={() => { setPainPoint(item.id as PainPoint); setTimeout(() => finishOnboarding(item.id as PainPoint), 300) }}
                  className={`text-left p-5 sm:p-6 rounded-2xl border-4 transition-all flex items-center gap-4 sm:gap-5 group ${
                    painPoint === item.id 
                      ? 'border-black bg-[#E9D5FF] shadow-[4px_4px_0_0_#000]'
                      : 'border-zinc-200 bg-white hover:border-black hover:shadow-[4px_4px_0_0_#000]'
                  }`}
                >
                  <div className="text-3xl shrink-0 group-hover:scale-125 transition-transform">{item.icon}</div>
                  <div>
                    <h3 className="font-black text-black text-[15px] sm:text-[16px]">{item.id}</h3>
                    <p className="text-zinc-600 font-bold text-[13px] sm:text-sm mt-1">{item.desc}</p>
                  </div>
                </button>
              ))}
            </div>
          </motion.div>
        )
      case 4:
        return (
          <motion.div
            key="step4"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex flex-col h-full items-center justify-center text-center pb-8"
          >
            {analyzing ? (
              <div className="flex flex-col items-center">
                <div className="relative w-32 h-32 mb-8">
                  <div className="absolute inset-0 border-8 border-zinc-100 rounded-full"></div>
                  <div className="absolute inset-0 border-8 border-[var(--fpt-orange)] rounded-full border-t-transparent animate-spin"></div>
                  <div className="absolute inset-0 flex items-center justify-center text-4xl">✨</div>
                </div>
                <h2 className="text-2xl sm:text-3xl font-black uppercase text-black mb-4 tracking-tighter animate-pulse">AI Đang Xử Lý</h2>
                <div className="h-6">
                  <p className="text-zinc-500 font-bold text-sm uppercase tracking-widest">{LOADING_MESSAGES[loadingMsgIdx]}</p>
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center w-full">
                <div className="w-24 h-24 bg-green-400 border-4 border-black rounded-full flex items-center justify-center text-5xl mb-8 shadow-[4px_4px_0_0_#000] rotate-12 hover:rotate-0 transition-transform">
                  🎯
                </div>
                <h2 className="text-4xl font-black uppercase text-black mb-6 tracking-tighter">Phân Tích Hoàn Tất!</h2>
                
                <div className="bg-zinc-50 border-4 border-black p-6 sm:p-8 rounded-2xl w-full text-left mb-8 shadow-[6px_6px_0_0_#000]">
                  <p className="text-black font-bold mb-4 leading-relaxed">
                    Dành riêng cho <span className="bg-yellow-300 px-2 py-0.5 mx-1 rounded border-2 border-black uppercase font-black tracking-tighter text-sm">{role || 'Ứng viên'}</span> đang <span className="bg-violet-300 px-2 py-0.5 mx-1 rounded border-2 border-black uppercase font-black tracking-tighter text-sm">{experience}</span>:
                  </p>
                  <p className="text-zinc-600 font-bold text-[15px] sm:text-base leading-relaxed">
                    Vấn đề <span className="text-black italic">&quot;{painPoint}&quot;</span> của bạn rất phổ biến. Hệ thống đã tùy chỉnh AI để tự động gợi ý các đoạn văn bản giải quyết chính xác điểm yếu này. Dưới đây là 3 mẫu CV phù hợp nhất để bạn bắt đầu.
                  </p>
                </div>

                <button
                  onClick={() => router.push('/dashboard')}
                  className="w-full py-5 bg-[var(--fpt-orange)] border-4 border-black text-white font-black uppercase tracking-widest text-[15px] rounded-2xl shadow-[6px_6px_0_0_#000] hover:translate-y-1 hover:shadow-[2px_2px_0_0_#000] active:scale-95 transition-all"
                >
                  Bắt đầu tạo CV ngay →
                </button>
              </div>
            )}
          </motion.div>
        )
    }
  }

  return (
    <div className="min-h-screen bg-zinc-50 flex items-center justify-center p-4 py-12">
      <div className="w-full max-w-4xl min-h-[600px] md:h-[700px] bg-white border-4 border-black rounded-[2rem] shadow-[16px_16px_0_0_#000] flex overflow-hidden">
        
        {/* Nửa trái / Banner */}
        <div className="hidden md:flex w-2/5 bg-[var(--fpt-orange)] flex-col justify-between p-8 border-r-4 border-black relative">
          <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-30 mix-blend-overlay"></div>
          
          <div className="relative z-10">
            <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center shadow-[4px_4px_0_0_#000] border-4 border-black mb-10">
              <svg width="24" height="24" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
                <rect x="4" y="4" width="16" height="16" stroke="black" strokeWidth="4" fill="#C4A1FF" />
                <rect x="12" y="12" width="16" height="16" stroke="black" strokeWidth="4" fill="var(--fpt-orange)" />
              </svg>
            </div>
            
            <div className="space-y-8">
              <div className={`transition-opacity duration-300 ${step === 1 ? 'opacity-100' : 'opacity-30'}`}>
                <span className="text-black font-black uppercase tracking-widest text-xs">01</span>
                <h3 className="text-black font-black text-2xl uppercase mt-1 neo-shadow-text">Hồ sơ<br/>của bạn</h3>
              </div>
              <div className={`transition-opacity duration-300 ${step === 2 ? 'opacity-100' : 'opacity-30'}`}>
                <span className="text-black font-black uppercase tracking-widest text-xs">02</span>
                <h3 className="text-black font-black text-2xl uppercase mt-1 neo-shadow-text">Mục tiêu<br/>nghề nghiệp</h3>
              </div>
              <div className={`transition-opacity duration-300 ${step === 3 ? 'opacity-100' : 'opacity-30'}`}>
                <span className="text-black font-black uppercase tracking-widest text-xs">03</span>
                <h3 className="text-black font-black text-2xl uppercase mt-1 neo-shadow-text">Điểm nghẽn<br/>của bạn</h3>
              </div>
            </div>
          </div>

          <div className="relative z-10 w-full h-3 bg-black/20 rounded-full overflow-hidden mt-12 border-2 border-black/10">
            <motion.div 
              className="h-full bg-black rounded-full"
              initial={{ width: '25%' }}
              animate={{ width: `${(step / 4) * 100}%` }}
              transition={{ duration: 0.5 }}
            />
          </div>
        </div>

        {/* Nửa phải / Form Area - Independent Scroll Area */}
        <div className="w-full md:w-3/5 p-6 sm:p-10 relative flex flex-col overflow-y-auto custom-scrollbar">
          {step < 4 && step > 1 && (
            <button onClick={handleBack} className="absolute top-6 left-6 sm:top-10 sm:left-10 text-zinc-400 hover:text-black font-black uppercase text-xs tracking-widest transition-colors flex items-center gap-1 z-10 bg-white/80 backdrop-blur-sm py-1 px-2 rounded-lg">
              ← Quay lại
            </button>
          )}

          {step < 4 && (
            <div className="absolute top-6 right-6 sm:top-10 sm:right-10 text-zinc-300 font-black uppercase text-xs tracking-widest z-10">
              Bước {step}/3
            </div>
          )}

          <div className="flex-1 mt-12 sm:mt-8 pt-4">
            <AnimatePresence mode="wait">
              {getStepContent()}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </div>
  )
}
