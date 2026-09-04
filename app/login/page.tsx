'use client'

import { useState } from 'react'
import { createBrowserClient } from '@supabase/ssr'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  
  const router = useRouter()
  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (error) {
      setError('로그인 정보가 올바르지 않습니다.')
      setLoading(false)
    } else {
      // [최적화 포인트] 토큰이 쿠키에 안전하게 구워질 시간을 확보하기 위해
      // router.push + router.refresh 대신 window.location.href 사용
      // 이렇게 하면 브라우저가 완전히 새로운 페이지 요청을 서버로 보내며
      // 구워진 쿠키를 100% 확실하게 서버로 전달하여 세션 튕김 현상을 방지합니다.
      window.location.href = '/'
    }
  }

  return (
    <div className="flex items-center justify-center min-h-[calc(100vh-80px)] bg-neutral-900 p-4 sm:p-6">
      <div className="w-full max-w-[460px] bg-white rounded-[2.5rem] p-8 sm:p-12 shadow-2xl">
        <div className="text-center mb-10">
          <h1 className="text-2xl font-bold tracking-tight text-black uppercase">Login</h1>
          <p className="text-sm font-medium text-neutral-600 mt-2">우리의 기록을 이어가려면 로그인해 주세요.</p>
        </div>

        <form onSubmit={handleLogin} className="space-y-4">
          <div className="space-y-1">
            <label className="text-xs font-semibold uppercase text-neutral-600 ml-1">ID</label>
            <input
              type="email"
              placeholder="admin@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full px-6 py-4 bg-neutral-100 rounded-2xl text-black font-bold placeholder:text-neutral-300 focus:outline-none focus:ring-2 focus:ring-black transition-all"
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs font-semibold uppercase text-neutral-600 ml-1">Password</label>
            <input
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full px-6 py-4 bg-neutral-100 rounded-2xl text-black font-bold placeholder:text-neutral-300 focus:outline-none focus:ring-2 focus:ring-black transition-all"
            />
          </div>

          {error && (
            <p className="text-center text-red-500 text-xs font-bold animate-pulse">{error}</p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-5 bg-black text-white rounded-2xl font-semibold uppercase tracking-wide hover:bg-neutral-800 transition-all shadow-lg active:scale-95 disabled:opacity-50"
          >
            {loading ? 'Authenticating...' : 'Login'}
          </button>
        </form>

        <div className="mt-10 text-center">
          <p className="text-xs font-semibold text-neutral-500 uppercase tracking-wide">
            Private Archive System v1.1
          </p>
          <Link href="/" className="inline-block mt-4 text-xs font-semibold text-neutral-600 hover:text-black transition-colors underline">
            Back to Home
          </Link>
        </div>
      </div>
    </div>
  )
}
