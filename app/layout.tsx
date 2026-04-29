import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { cookies } from "next/headers";
import { createServerClient } from "@supabase/ssr";
import Link from "next/link";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "THE ARCHIVE | Our Screen Log",
  description: "INFP Collecter's archive",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  // 1. 쿠키 저장소 가져오기 (비동기 처리 호환성 확보)
  const cookieStore = cookies();
  
  // 2. Supabase 클라이언트 초기화 (가장 안전한 방식)
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          // @ts-ignore (버전 호환성을 위해 무시)
          return cookieStore.get(name)?.value;
        },
      },
    }
  );

  // 3. 유저 정보 가져오기 (에러가 나도 페이지는 뜨도록 처리)
  const { data: { user } } = await supabase.auth.getUser().catch(() => ({ data: { user: null } }));

  return (
    <html lang="ko">
      <body className={`${inter.className} bg-neutral-900 text-neutral-100 min-h-screen flex flex-col overflow-x-hidden`}>
        <nav className="flex justify-between items-center px-4 md:px-10 py-4 border-b border-neutral-800 bg-black sticky top-0 z-50 w-full min-h-[70px]">
          <div className="flex items-center justify-between w-full md:w-auto gap-4 md:gap-12">
            <Link href="/" className="text-lg md:text-2xl font-black tracking-tighter text-white italic flex items-center gap-2">
              <span>🍿</span> OUR SCREEN LOG
            </Link>
            
            <div className="flex items-center gap-3 md:gap-8 text-[11px] md:text-sm font-bold text-neutral-400">
              <Link href="/stats" className="hover:text-white transition">통계</Link>
              <Link href="/scenes" className="hover:text-white transition">명장면</Link>
              <Link href="/lines" className="hover:text-white transition">명대사</Link>
              <Link href="/actors" className="hover:text-white transition">배우</Link>
              <Link href="/wishlist" className="hover:text-white transition">보고싶어요</Link>
            </div>
          </div>
          
          <div className="hidden md:flex items-center gap-6 border-l border-neutral-800 pl-6">
            {user ? (
              <div className="flex items-center gap-4">
                <span className="text-xs text-neutral-500">{user.email}</span>
                <Link href="/logout" className="text-red-400 text-sm font-bold">Logout</Link>
              </div>
            ) : (
              <Link href="/login" className="text-sm font-bold text-blue-500">Admin Login</Link>
            )}
          </div>
        </nav>

        <main className="flex-grow w-full">{children}</main>
      </body>
    </html>
  );
}