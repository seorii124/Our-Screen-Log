'use client'

import { useState, useEffect } from 'react'
import { createBrowserClient } from '@supabase/ssr'
import { useRouter } from 'next/navigation'

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
  const router = useRouter()
  const supabase = createBrowserClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!)

  useEffect(() => {
    async function fetchWorks() {
      let query = supabase.from('works').select('*')
      
      // [태초의 정렬 로직 완벽 유지]
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
      <header className="mb-14">
        <h1 className="text-5xl font-black text-neutral-900 tracking-tighter mb-3 italic">Archive Content</h1>
        <p className="text-neutral-500 font-bold tracking-[0.3em] text-[10px] uppercase">Curated by Team INFP Collector</p>
      </header>

      {/* 필터 바: 왓챠피디아 스타일 */}
      <div className="flex justify-between items-end mb-10 border-b border-neutral-800 pb-8">
        <div className="flex gap-8">
          {['latest', 'high', 'low'].map((t) => (
            <button 
              key={t} 
              onClick={() => setSortType(t)} 
              className={`text-xs font-black uppercase tracking-widest transition-all relative ${
                sortType === t ? 'text-blue-500' : 'text-neutral-500 hover:text-white'
              }`}
            >
              {t === 'latest' ? '최신순' : t === 'high' ? '평점 높은순' : '평점 낮은순'}
              {sortType === t && <div className="absolute -bottom-8 left-0 w-full h-0.5 bg-blue-500"></div>}
            </button>
          ))}
        </div>
      </div>

      {/* 포스터 그리드: 반응형 최적화 */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-x-8 gap-y-14">
        {works.map((work) => (
          <div 
            key={work.id} 
            onClick={() => router.push(`/works/${work.id}`)} 
            className="group cursor-pointer"
          >
            <div className="relative aspect-[2/3] rounded-xl overflow-hidden bg-neutral-800 border border-neutral-800 group-hover:border-neutral-500 transition-all duration-300 shadow-2xl">
              <img 
                src={work.poster_url || ''} 
                alt={work.title}
                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" 
              />
              {/* 우측 상단 평점 배지 */}
              <div className="absolute top-3 right-3 bg-black/70 backdrop-blur-md px-2 py-1 rounded text-[10px] font-black text-yellow-500 border border-neutral-700">
                ★ {work.average_rating.toFixed(1)}
              </div>
            </div>
            <div className="mt-5 space-y-1">
              <h2 className="font-bold text-base text-white line-clamp-1 group-hover:text-blue-400 transition-colors">{work.title}</h2>
              <div className="flex items-center gap-2 text-[10px] font-bold text-neutral-500 uppercase tracking-tighter">
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