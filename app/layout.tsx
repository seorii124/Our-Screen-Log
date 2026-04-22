import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { cookies } from "next/headers";
import { createServerClient, type CookieOptions } from "@supabase/ssr";
import { redirect } from "next/navigation";
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
  const cookieStore = await cookies();

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value;
        },
      },
    }
  );

  const { data: { user }, error: userError } = await supabase.auth.getUser();

  // 로그아웃 서버 액션 유지
  async function handleLogout() {
    "use server";
    const actionCookieStore = await cookies();
    const actionSupabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          get(name: string) { return actionCookieStore.get(name)?.value; },
          set(name: string, value: string, options: CookieOptions) {
            try { actionCookieStore.set({ name, value, ...options }); } catch {}
          },
          remove(name: string, options: CookieOptions) {
            try { actionCookieStore.set({ name, value: "", ...options, maxAge: 0 }); } catch {}
          },
        },
      }
    );
    await actionSupabase.auth.signOut();
    redirect("/login");
  }

  return (
    <html lang="ko">
      <body className={`${inter.className} bg-neutral-900 text-neutral-100 min-h-screen`}>
        <nav className="flex justify-between items-center px-10 py-5 border-b border-neutral-800 bg-black sticky top-0 z-50">
          <div className="flex items-center gap-12">
            <Link href="/" className="text-2xl font-black tracking-tighter text-white italic flex items-center gap-2">
              <span>🍿</span> OUR SCREEN LOG
            </Link>
            
            <div className="hidden md:flex items-center gap-10 text-sm font-bold text-neutral-400">
              <Link href="/stats" className="hover:text-white transition">통계</Link>
              <Link href="/scenes" className="hover:text-white transition">명장면</Link>
              <Link href="/lines" className="hover:text-white transition">명대사</Link>
            </div>
          </div>
          
          <div className="flex items-center gap-6">
            {!userError && user ? (
              <div className="flex items-center gap-6 border-l border-neutral-800 pl-6">
                
                {/* [수정] 이메일에만 마이로그 링크 활성화 */}
                <Link 
                  href="/my-log" 
                  className="text-xs text-neutral-500 font-medium hover:text-blue-400 transition-colors"
                >
                  {user.email}
                </Link>

                {/* 배지는 클릭되지 않는 일반 텍스트로 복구 */}
                <span className="px-2 py-1 bg-neutral-800 text-[10px] font-black rounded text-white uppercase tracking-widest">
                  {user?.user_metadata?.role || "Member"}
                </span>

                <form action={handleLogout}>
                  <button type="submit" className="text-red-400 text-sm font-bold hover:text-red-300 transition">
                    Logout
                  </button>
                </form>
              </div>
            ) : (
              <Link href="/login" className="text-sm font-bold text-blue-500 hover:underline">
                Admin Login
              </Link>
            )}
          </div>
        </nav>
        <main>{children}</main>
      </body>
    </html>
  );
}