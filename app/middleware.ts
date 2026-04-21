import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export async function middleware(req: NextRequest) {
  const res = NextResponse.next()
  const supabase = createMiddlewareClient({ req, res })

  // 현재 로그인 세션 확인
  const { data: { session } } = await supabase.auth.getSession()

  // 로그인 안 됐는데 메인('/')이나 등록 페이지로 가려고 하면 로그인 창으로 강제 이동
  if (!session && req.nextUrl.pathname !== '/login') {
    return NextResponse.redirect(new URL('/login', req.url))
  }

  return res
}

// 이 규칙을 적용할 경로들
export const config = {
  matcher: ['/', '/add', '/dashboard'],
}