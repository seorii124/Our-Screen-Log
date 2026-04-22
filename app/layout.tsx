import './globals.css'
import Link from 'next/link'

export const metadata = {
  title: 'THE ARCHIVE',
  description: 'INFP Collecter\'s archive',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ko">
      <body className="bg-gray-50 text-black">
        <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur-xl border-b border-gray-50">
          <div className="max-w-5xl mx-auto px-6 h-20 flex items-center justify-between">
            <Link href="/" className="text-2xl font-black tracking-tighter">ARCHIVE 🍿</Link>
            <div className="flex gap-8 items-center">
              <Link href="/" className="text-[11px] font-black tracking-widest text-gray-400 hover:text-black uppercase">Home</Link>
              <Link href="/stats" className="text-[11px] font-black tracking-widest text-gray-400 hover:text-black uppercase">Stats</Link>
              {/* 관리자님 전용 RECORD 버튼 */}
              <Link href="/admin" className="bg-black text-white px-5 py-2.5 rounded-full text-[10px] font-black tracking-widest hover:bg-gray-800 transition-all shadow-lg shadow-black/10">RECORD</Link>
              {/* 로그인 상태 표시 복구 */}
              <div className="ml-4 w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center text-[10px] font-black text-blue-600 border border-blue-200" title="Admin logged in">JI</div>
            </div>
          </div>
        </nav>
        <main>{children}</main>
      </body>
    </html>
  )
}