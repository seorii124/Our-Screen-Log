'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function LoginPage() {
  const [password, setPassword] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    // 관리자님 전용 비밀번호 (원하시는 대로 바꾸세요!)
    if (password === '1234') {
      // 로그인이 성공하면 관리자 페이지로 이동
      router.push('/admin')
    } else {
      alert('비밀번호가 일치하지 않습니다.')
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="bg-white p-10 rounded-[2.5rem] shadow-2xl border border-gray-100 w-full max-w-sm">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-black uppercase tracking-tighter text-gray-900">Admin Access</h1>
          <p className="text-gray-400 text-xs font-bold mt-2">기록고 관리를 위해 인증이 필요합니다</p>
        </div>

        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <input 
              type="password" 
              value={password} 
              onChange={(e) => setPassword(e.target.value)} 
              placeholder="Password" 
              className="w-full bg-gray-50 border-0 p-5 rounded-2xl outline-none focus:ring-2 focus:ring-black font-bold text-center transition-all"
              required
            />
          </div>
          
          <button 
            type="submit" 
            disabled={isLoading}
            className="w-full py-5 bg-black text-white rounded-2xl font-black shadow-xl hover:bg-gray-800 active:scale-95 transition-all disabled:bg-gray-200"
          >
            {isLoading ? 'VERIFYING...' : 'ENTER'}
          </button>
        </form>

        <p className="text-center mt-8 text-[10px] text-gray-300 font-medium tracking-widest uppercase">
          Private Archive System v1.0
        </p>
      </div>
    </div>
  )
}