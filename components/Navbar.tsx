"use client"

import { useEffect, useState } from 'react'
import { createClient } from '../src/lib/supabase/client' // 본인의 경로에 맞게 수정
import { useRouter } from 'next/navigation'

export default function Navbar() {
  const [userEmail, setUserEmail] = useState<string | null>(null)
  const supabase = createClient()
  const router = useRouter()

  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (user) setUserEmail(user.email ?? null)
    }
    getUser()
  }, [])

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push('/login')
    router.refresh()
  }

  return (
    <nav className="flex justify-between items-center p-4 bg-white border-b">
      <h1 className="font-bold text-xl cursor-pointer" onClick={() => router.push('/')}>
        🎬 INFP Collecter
      </h1>
      <div className="flex items-center gap-4">
        {userEmail ? (
          <>
            <span className="text-sm font-medium text-blue-600">{userEmail} 님 접속 중</span>
            <button onClick={handleLogout} className="text-xs bg-gray-100 px-3 py-1 rounded-full">로그아웃</button>
          </>
        ) : (
          <button onClick={() => router.push('/login')} className="text-sm text-blue-500">로그인 필요</button>
        )}
      </div>
    </nav>
  )
}