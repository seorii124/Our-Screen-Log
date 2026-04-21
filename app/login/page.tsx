"use client"

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '../../src/lib/supabase/client' // 경로 주의!

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    // Supabase에게 이메일과 비밀번호를 던져서 확인을 부탁합니다.
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (error) {
      alert('로그인 실패: ' + error.message)
      setLoading(false)
    } else {
      alert('반갑습니다! 로그인되었습니다. 🍿')
      router.push('/') // 로그인이 성공하면 메인 화면으로 보냅니다.
      router.refresh() // 화면을 새로고침해서 로그인 상태를 반영합니다.
    }
  }

  return (
    <div className="max-w-md mx-auto mt-20 p-8 bg-white rounded-3xl shadow-xl border border-gray-100">
      <h1 className="text-3xl font-bold mb-6 text-center text-gray-800">Media Archive</h1>
      <p className="text-gray-500 text-center mb-8">관리자 전용 로그인</p>

      <form onSubmit={handleLogin} className="space-y-4">
        <div>
          <label className="block text-sm font-semibold text-gray-600 mb-1">이메일</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full p-3 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="example@gmail.com"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-semibold text-gray-600 mb-1">비밀번호</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full p-3 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="••••••••"
            required
          />
        </div>
        <button
          type="submit"
          disabled={loading}
          className="w-full bg-blue-600 text-white font-bold py-3 rounded-xl hover:bg-blue-700 transition-all disabled:bg-gray-300"
        >
          {loading ? '확인 중...' : '로그인하기'}
        </button>
      </form>
    </div>
  )
}