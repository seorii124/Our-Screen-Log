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
      <body className={`${inter.className} bg-white text-black min-h-screen flex flex-col overflow-x-hidden selection:bg-gray-200`}>
        <AuthListener />
        
        <nav className="flex flex-col md:flex-row justify-between items-stretch md:items-center px-4 md:px-10 py-4 border-b border-neutral-100 bg-black sticky top-0 z-50 w-full min-h-[70px]">
          <div className="flex flex-col md:flex-row items-center justify-between w-full md:w-auto gap-4 md:gap-12">
            {/* 🍿 아이콘 제거 및 깔끔한 폰트 적용 */}
            <a href="/" className="text-xl md:text-2xl font-bold tracking-tight text-white flex items-center">
              OUR SCREEN LOG
            </a>
            
            <div className="flex flex-wrap items-center justify-center gap-x-4 gap-y-2 md:gap-10 text-sm md:text-[15px] font-bold text-neutral-300">
              <a href="/actors" className="hover:text-white transition-colors">배우</a>
              <a href="/ost" className="hover:text-white transition-colors">OST</a>
              <a href="/scenes" className="hover:text-white transition-colors">명장면</a>
              <a href="/lines" className="hover:text-white transition-colors">명대사</a>
              <a href="/stats" className="hover:text-white transition-colors">통계</a>
              <a href="/wishlist" className="hover:text-white transition-colors">보고싶어요</a>
            </div>
          </div>
          
          <div className="hidden md:flex items-center gap-6">
            {user ? (
              <div className="flex items-center gap-5">
                <a href="/my-log" className="text-sm font-bold text-white hover:text-gray-300 transition">
                  My Page
                </a>
                <a href="/logout" className="text-red-400 text-sm font-bold hover:text-red-300 transition">
                  Logout
                </a>
              </div>
            ) : (
              <a href="/login" className="text-sm font-bold text-neutral-200 hover:text-white transition">
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
