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
      router.push('/')
      router.refresh()
    }
  }

  return (
    <div className="flex items-center justify-center min-h-[calc(100vh-80px)] bg-neutral-900 p-6">
      <div className="w-full max-w-[400px] bg-white rounded-[2.5rem] p-10 shadow-2xl">
        <div className="text-center mb-10">
          <h1 className="text-2xl font-black tracking-tighter text-black uppercase">Admin Access</h1>
          <p className="text-[11px] font-bold text-neutral-400 mt-2">기록고 관리를 위해 인증이 필요합니다</p>
        </div>

        <form onSubmit={handleLogin} className="space-y-4">
          <div className="space-y-1">
            <label className="text-[10px] font-black uppercase text-neutral-400 ml-1">Email Address</label>
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
            <label className="text-[10px] font-black uppercase text-neutral-400 ml-1">Password</label>
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
            className="w-full py-5 bg-black text-white rounded-2xl font-black uppercase tracking-widest hover:bg-neutral-800 transition-all shadow-lg active:scale-95 disabled:opacity-50"
          >
            {loading ? 'Authenticating...' : 'Enter'}
          </button>
        </form>

        <div className="mt-10 text-center">
          <p className="text-[9px] font-black text-neutral-300 uppercase tracking-widest">
            Private Archive System v1.1
          </p>
          <Link href="/" className="inline-block mt-4 text-[10px] font-bold text-neutral-400 hover:text-black transition-colors underline">
            Back to Home
          </Link>
        </div>
      </div>
    </div>
  )
}