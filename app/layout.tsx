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

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  async function handleLogout() {
    "use server";
    const actionCookieStore = await cookies();
    
    const actionSupabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          get(name: string) {
            return actionCookieStore.get(name)?.value;
          },
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
        {!userError && user && (
          <nav className="flex justify-between items-center p-6 border-b border-neutral-800 bg-neutral-950">
            <Link href="/" className="text-xl font-black tracking-tighter hover:text-neutral-400 transition italic">
              THE ARCHIVE
            </Link>
            <div className="flex items-center gap-6 text-sm">
              <Link href="/stats" className="hover:text-blue-400 font-bold transition">Stats</Link>
              <div className="flex items-center gap-2 text-neutral-400">
                <span>{user?.email}</span>
                <span className="px-2 py-1 bg-neutral-800 text-white rounded text-[10px] font-black uppercase">
                  {user?.user_metadata?.role || "Member"}
                </span>
              </div>
              <form action={handleLogout}>
                <button type="submit" className="text-red-400 font-bold hover:text-red-300 transition">
                  Logout
                </button>
              </form>
            </div>
          </nav>
        )}
        <main>{children}</main>
      </body>
    </html>
  );
}