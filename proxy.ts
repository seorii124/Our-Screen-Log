// proxy.ts (Next.js 16 표준 규격)
import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

// 🔐 직원(관리자)만 들어갈 수 있는 금지 구역
const PROTECTED_PATHS = ['/admin', '/my-log', '/write', '/edit']

export async function proxy(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() { return request.cookies.getAll() },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
          supabaseResponse = NextResponse.next({ request })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  const { data: { user } } = await supabase.auth.getUser()
  const pathname = request.nextUrl.pathname

  // 🚪 쇼윈도(Public) 예외 처리: 작품 상세(/works/...)는 무조건 통과
  if (pathname.startsWith('/works/') && !pathname.endsWith('/edit')) {
    return supabaseResponse
  }

  // 🚩 보호 경로 체크 (경로 중간에 'admin' 등이 포함되어도 잡아냄)
  const isProtected = PROTECTED_PATHS.some(path => pathname.includes(path))

  if (isProtected && !user) {
    console.log('🚨 [Proxy] Unauthorized access to:', pathname)
    return NextResponse.redirect(new URL('/login', request.url))
  }

  return supabaseResponse
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)'],
}