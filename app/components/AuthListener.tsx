'use client'

import { createBrowserClient } from '@supabase/ssr'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'

export default function AuthListener() {
  const router = useRouter()

  useEffect(() => {
    const supabase = createBrowserClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    )

    // 브라우저 백그라운드에서 세션 변화 및 토큰 갱신을 실시간으로 감지
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event) => {
      if (event === 'SIGNED_OUT' || event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') {
        router.refresh() // 토큰이 갱신되면 강제로 최신 쿠키를 서버와 다시 동기화
      }
    })

    return () => {
      subscription.unsubscribe()
    }
  }, [router])

  return null // 화면에 렌더링할 요소는 없음
}