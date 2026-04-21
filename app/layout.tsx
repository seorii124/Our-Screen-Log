import './globals.css'
import Link from 'next/link'

export const metadata = {
  title: 'Archiving Page🍿',
  description: '영화와 드라마 기록 저장소',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="ko">
      <body className="bg-gray-50 text-black">
        {/* 상단 메뉴바 (Navigation) */}
        <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-gray-100">
          <div className="max-w-5xl mx-auto px-6 h-16 flex items-center justify-between">
            {/* 로고: 홈으로 이동 */}
            <Link href="/" className="text-xl font-black tracking-tighter hover:opacity-70">
              ARCHIVE 🍿
            </Link>

            {/* 메뉴 버튼들 */}
            <div className="flex gap-6 items-center">
              <Link href="/" className="text-sm font-bold hover:text-blue-600 transition-colors">
                HOME
              </Link>
              <Link href="/stats" className="text-sm font-bold hover:text-blue-600 transition-colors">
                STATS
              </Link>
              <Link href="/admin" className="bg-black text-white px-4 py-2 rounded-full text-xs font-black hover:bg-gray-800 transition-all">
                RECORD
              </Link>
            </div>
          </div>
        </nav>

        {/* 실제 페이지 내용들 */}
        <main>
          {children}
        </main>
      </body>
    </html>
  )
}