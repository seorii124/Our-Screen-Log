'use client'

import './globals.css'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  
  // 임시 데이터 (로그인 기능 연동 전까지 화면 표시용)
  const userEmail = "admin@archive.com"; 
  const userRole = "관리자 (Master)";

  const handleLogout = () => {
    if(confirm("로그아웃 하시겠습니까?")) {
      router.push('/login');
    }
  };

  return (
    <html lang="ko">
      <body className="bg-gray-50 text-black">
        <nav className="sticky top-0 z-50 bg-white border-b border-gray-100">
          <div className="max-w-6xl mx-auto px-6 h-20 flex items-center justify-between">
            <Link href="/" className="text-2xl font-black tracking-tighter italic">THE ARCHIVE</Link>
            
            <div className="flex gap-8 items-center">
              <Link href="/" className="text-xs font-bold hover:text-blue-600 uppercase">Home</Link>
              <Link href="/stats" className="text-xs font-bold hover:text-blue-600 uppercase">Stats</Link>
              <Link href="/admin" className="bg-black text-white px-5 py-2 rounded-full text-xs font-bold hover:bg-gray-800 transition-all">RECORD</Link>
              
              {/* 계정 정보 섹션 */}
              <div className="group relative flex items-center gap-3 pl-6 border-l border-gray-100 cursor-pointer">
                <div className="text-right">
                  <p className="text-[11px] font-black leading-none">{userEmail.split('@')[0]}</p>
                  <p className="text-[9px] text-blue-600 font-bold mt-1 uppercase">{userRole}</p>
                </div>
                <div className="w-9 h-9 bg-gray-100 rounded-full flex items-center justify-center text-xs font-bold border border-gray-200">
                  User
                </div>
                
                {/* 드롭다운 메뉴 (마우스 올리면 노출) */}
                <div className="absolute right-0 top-full pt-2 hidden group-hover:block w-48">
                  <div className="bg-white border border-gray-100 shadow-xl rounded-2xl p-4">
                    <p className="text-[10px] text-gray-400 font-bold uppercase mb-1">Full Account</p>
                    <p className="text-xs font-bold mb-4 break-all">{userEmail}</p>
                    <button onClick={handleLogout} className="w-full py-2 bg-red-50 text-red-600 text-[10px] font-bold rounded-lg hover:bg-red-100 transition-all">
                      LOGOUT
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </nav>
        <main>{children}</main>
      </body>
    </html>
  )
}