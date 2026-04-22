'use client'

import { useState, useEffect } from 'react'
// Supabase 클라이언트 경로를 프로젝트 환경에 맞게 수정하여 사용하세요.
import { createBrowserClient } from '@supabase/ssr'
import { useRouter } from 'next/navigation'

interface Work {
  id: number;
  title: string;
  category: string;
  viewing_period: string;
  poster_url: string;
  average_rating: number;
  created_at: string;
}

export default function Home() {
  const [works, setWorks] = useState<Work[]>([])
  const [sortType, setSortType] = useState('latest')
  const router = useRouter()
  
  // 클라이언트 컴포넌트용 Supabase 생성
  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )

  useEffect(() => {
    async function fetchWorks() {
      let query = supabase.from('works').select('*')
      
      if (sortType === 'latest') {
        query = query.order('id', { ascending: false })
      } else if (sortType === 'high') {
        query = query.order('average_rating', { ascending: false })
      } else if (sortType === 'low') {
        query = query.order('average_rating', { ascending: true })
      }

      const { data, error } = await query
      if (error) {
        console.error('데이터 로드 에러:', error.message)
      } else if (data) {
        setWorks(data as Work[])
      }
    }
    fetchWorks()
  }, [sortType, supabase])

  return (
    <div className="max-w-6xl mx-auto p-6 min-h-screen">
      <header className="mb-12 pt-10">
        <h1 className="text-4xl font-black text-white tracking-tighter mb-2 italic">Our Screen Log 🍿</h1>
        <p className="text-gray-400 font-bold tracking-widest text-xs uppercase">INFP Collecter's archive</p>
      </header>
      
      <div className="flex gap-2 mb-10">
        {['latest', 'high', 'low'].map((t) => (
          <button 
            key={t} 
            onClick={() => setSortType(t)} 
            className={`px-5 py-2 rounded-full text-[10px] font-black uppercase transition-all shadow-sm ${
              sortType === t ? 'bg-blue-600 text-white shadow-md' : 'bg-neutral-800 text-gray-400 border border-neutral-700 hover:text-white'
            }`}
          >
            {t === 'latest' ? '최신순' : t === 'high' ? '평점 높은순' : '평점 낮은순'}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-10">
        {works.map((work) => (
          <div 
            key={work.id} 
            onClick={() => router.push(`/works/${work.id}`)} 
            className="group cursor-pointer bg-neutral-900 rounded-[2.5rem] overflow-hidden shadow-sm hover:shadow-2xl transition-all duration-500 border border-neutral-800"
          >
            <div className="relative h-80 overflow-hidden bg-neutral-800">
              <img 
                src={work.poster_url || 'https://via.placeholder.com/400x600?text=No+Image'} 
                alt={work.title}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" 
              />
              <div className="absolute top-4 right-4 bg-black/80 backdrop-blur px-3 py-1 rounded-full text-xs font-black text-blue-400 shadow-sm border border-neutral-700">
                ⭐ {work.average_rating.toFixed(1)}
              </div>
            </div>
            <div className="p-8">
              <div className="flex items-center gap-2 mb-2">
                <span className="w-1.5 h-1.5 rounded-full bg-blue-500"></span>
                <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{work.category}</span>
              </div>
              <h2 className="font-bold text-xl text-white line-clamp-1 tracking-tight">{work.title}</h2>
              <p className="text-gray-500 text-[11px] mt-3 font-bold">{work.viewing_period}</p>
            </div>
          </div>
        ))}
      </div>

      {works.length === 0 && (
        <div className="text-center py-20">
          <p className="text-gray-500 font-bold uppercase tracking-widest text-sm">기록된 데이터가 없습니다.</p>
        </div>
      )}
    </div>
  )
}