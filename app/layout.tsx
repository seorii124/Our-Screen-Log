import './globals.css'
import type { Metadata } from 'next'
import Navbar from '../components/Navbar' // 1. 상단에 이 줄을 추가해서 Navbar를 불러옵니다.

export const metadata: Metadata = {
  title: 'Media Archive',
  description: '우리들만의 미디어 기록장',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="ko">
      <body className="bg-gray-50 text-gray-900 min-h-screen">
        {/* 2. 기존의 <header> 구역을 지우고 방금 불러온 <Navbar />를 넣습니다. */}
        <Navbar />
        
        {/* 실제 내용이 들어가는 구역 */}
        <main className="max-w-5xl mx-auto p-6">
          {children}
        </main>
      </body>
    </html>
  )
}