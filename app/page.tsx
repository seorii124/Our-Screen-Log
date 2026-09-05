'use client'

import { useState, useEffect } from 'react'
import { createClient } from '../src/lib/supabase/client'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

interface Work {
  id: number;
  title: string;
  category: string;
  viewing_period: string;
  poster_url: string;
  average_rating: number;
}

export default function Home() {
  const [works, setWorks] = useState<Work[]>([])
  const [sortType, setSortType] = useState('latest')
  const [user, setUser] = useState<any>(null) // 초기값을 null로 명확히 지정
  const router = useRouter()
  const supabase = createClient()

  // 1. 유저 세션 전용 useEffect (쇼윈도 관리자 권한 확인 및 실시간 동기화)
  useEffect(() => {
    // 마운트 시 즉시 유저 확인
    supabase.auth.getUser().then(({ data: { user } }) => {
      setUser(user)
    })

    // 로그인/로그아웃 상태가 변하면 즉시 버튼 UI 업데이트 (새로고침 불필요)
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user || null)
    })

    return () => subscription.unsubscribe()
  }, [supabase.auth])

  // 2. 작품 데이터 패치 전용 useEffect (정렬 변경 시 진열장만 업데이트)
  useEffect(() => {
    async function fetchWorks() {
      let query = supabase.from('works').select('*')
      if (sortType === 'latest') query = query.order('id', { ascending: false })
      else if (sortType === 'high') query = query.order('average_rating', { ascending: false })
      else if (sortType === 'low') query = query.order('average_rating', { ascending: true })

      const { data } = await query
      if (data) setWorks(data as Work[])
    }
    fetchWorks()
  }, [sortType, supabase])

  return (
    <div className="max-w-7xl mx-auto p-10 min-h-screen pb-32">
      <header className="mb-14 flex flex-col sm:flex-row sm:justify-between sm:items-end gap-6">
        <div>
          <h1 className="text-5xl font-bold text-neutral-900 tracking-tight mb-3">Archive Content</h1>
          <p className="text-neutral-600 font-bold tracking-widest text-xs uppercase">Curated by Team INFP Collector</p>
        </div>
        {/* 관리자/직원에게만 진열장 수정 버튼 노출 */}
        {user && (
          <Link
            href="/admin"
            className="inline-block bg-black text-white px-8 py-4 rounded-full text-xs font-black uppercase tracking-widest hover:bg-neutral-800 transition-all shadow-xl text-center"
          >
            + New Record
          </Link>
        )}
      </header>

      <div className="flex justify-between items-end mb-10 border-b border-neutral-200 pb-8">
        <div className="flex gap-8">
          {['latest', 'high', 'low'].map((t) => (
            <button
              key={t}
              onClick={() => setSortType(t)}
              className={`text-xs font-black uppercase tracking-widest transition-all relative ${
                sortType === t ? 'text-black' : 'text-neutral-500 hover:text-black'
              }`}
            >
              {t === 'latest' ? '최신순' : t === 'high' ? '평점 높은순' : '평점 낮은순'}
              {sortType === t && <div className="absolute -bottom-8 left-0 w-full h-0.5 bg-black"></div>}
            </button>
          ))}
        </div>
        <div className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest">
          Total {works.length} items
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-x-8 gap-y-14">
        {works.map((work) => (
          <div key={work.id} onClick={() => router.push(`/works/${work.id}`)} className="group cursor-pointer transition-transform duration-300 ease-out hover:-translate-y-1 hover:scale-[1.02] hover:z-10">
            <div className="relative aspect-[2/3] rounded-xl overflow-hidden bg-neutral-100 border border-neutral-200 group-hover:border-neutral-400 transition-all duration-300 shadow-lg group-hover:shadow-2xl">
              <img src={work.poster_url || ''} alt={work.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 ease-out" />
              <div className="absolute top-3 right-3 bg-black/70 backdrop-blur-md px-2 py-1 rounded text-xs font-semibold text-yellow-400 border border-neutral-700">
                ★ {work.average_rating.toFixed(1)}
              </div>
            </div>
            <div className="mt-5 space-y-1">
              <h2 className="font-bold text-base text-neutral-900 line-clamp-1 group-hover:text-neutral-600 transition-colors">{work.title}</h2>
              <div className="flex items-center gap-2 text-xs font-medium text-neutral-500 uppercase tracking-normal">
                <span>{work.category}</span>
                <span>•</span>
                <span>{work.viewing_period}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
