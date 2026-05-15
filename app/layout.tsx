import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { cookies } from "next/headers";
import { createServerClient } from "@supabase/ssr";
import AuthListener from "./components/AuthListener";

export const dynamic = "force-dynamic";
export const revalidate = 0;

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "THE ARCHIVE | Our Screen Log",
  description: "Screen Log Archive",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const cookieStore = await cookies();

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() { return cookieStore.getAll(); },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            );
          } catch {}
        },
      },
    }
  );

  const { data: { user } } = await supabase.auth.getUser().catch(() => ({ data: { user: null } }));

  return (
    <html lang="ko">
      {/* 배경을 흰색(bg-white), 글씨를 검정(text-black)으로 확정 */}
      <body className={`${inter.className} bg-white text-black min-h-screen flex flex-col overflow-x-hidden selection:bg-gray-200`}>
        <AuthListener />
        
        {/* 네비게이션: 검정 배경 유지, 로고의 italic 클래스 완전 삭제 */}
        <nav className="flex justify-between items-center px-6 md:px-12 py-5 bg-black sticky top-0 z-50 w-full">
          <div className="flex items-center justify-between w-full md:w-auto gap-8">
            <a href="/" className="text-xl font-bold tracking-normal text-white flex items-center gap-2">
              OUR SCREEN LOG
            </a>
            
            <div className="flex items-center gap-6 text-sm font-medium text-gray-400">
              <a href="/actors" className="hover:text-white transition">배우</a>
              <a href="/ost" className="hover:text-white transition">OST</a>
              <a href="/scenes" className="hover:text-white transition">명장면</a>
              <a href="/lines" className="hover:text-white transition">명대사</a>
              <a href="/stats" className="hover:text-white transition">통계</a>
              <a href="/wishlist" className="hover:text-white transition">보고싶어요</a>
            </div>
          </div>
          
          <div className="hidden md:flex items-center gap-6 pl-6">
            {user ? (
              <div className="flex items-center gap-5">
                <a href="/my-log" className="text-sm font-medium text-gray-300 hover:text-white transition">
                  My Page
                </a>
                <a href="/logout" className="text-red-400 text-sm font-medium hover:text-red-300 transition">
                  Logout
                </a>
              </div>
            ) : (
              <a href="/login" className="text-sm font-medium text-blue-400 hover:text-blue-300 transition">
                Login
              </a>
            )}
          </div>
        </nav>

        <main className="flex-grow w-full bg-white">{children}</main>
      </body>
    </html>
  );
}