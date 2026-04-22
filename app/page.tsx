'use client'

import { useState, useEffect } from 'react'
import { createClient } from '../src/lib/supabase/client'
import { useRouter } from 'next/navigation'

// 데이터 타입 정의 (빌드 에러 방지)
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
  const supabase = createClient()

  useEffect(() => {
    async function fetchWorks() {
      // 기본 쿼리 생성
      let query = supabase.from('works').select('*')
      
      // 관리자님, 여기서 정렬을 확실하게 잡았습니다.
      if (sortType === 'latest') {
        // '최신순'은 ID가 큰 순서(가장 나중에 등록된 순서)로 정렬합니다.
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
    <div className="max-w-6xl mx-auto p-6 bg-gray-50 min-h-screen">
      {/* 요구하신 브랜딩 문구 반영 */}
      <header className="mb-12 pt-10">
        <h1 className="text-4xl font-black text-gray-900 tracking-tighter mb-2 italic">Our Screen Log 🍿</h1>
        <p className="text-gray-400 font-bold tracking-widest text-xs uppercase">INFP Collecter's archive</p>
      </header>
      
      {/* 정렬 버튼 섹션 */}
      <div className="flex gap-2 mb-10">
        {['latest', 'high', 'low'].map((t) => (
          <button 
            key={t} 
            onClick={() => setSortType(t)} 
            className={`px-5 py-2 rounded-full text-[10px] font-black uppercase transition-all shadow-sm ${
              sortType === t ? 'bg-black text-white shadow-md' : 'bg-white text-gray-400 border border-gray-100 hover:text-black'
            }`}
          >
            {t === 'latest' ? '최신순' : t === 'high' ? '평점 높은순' : '평점 낮은순'}
          </button>
        ))}
      </div>

      {/* 리스트 섹션 */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-10">
        {works.map((work) => (
          <div 
            key={work.id} 
            onClick={() => router.push(`/works/${work.id}`)} 
            className="group cursor-pointer bg-white rounded-[2.5rem] overflow-hidden shadow-sm hover:shadow-2xl transition-all duration-500 border border-gray-100"
          >
            <div className="relative h-80 overflow-hidden bg-gray-100">
              <img 
                src={work.poster_url || 'https://via.placeholder.com/400x600?text=No+Image'} 
                alt={work.title}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" 
              />
              <div className="absolute top-4 right-4 bg-white/90 backdrop-blur px-3 py-1 rounded-full text-xs font-black text-blue-600 shadow-sm">
                ⭐ {work.average_rating.toFixed(1)}
              </div>
            </div>
            <div className="p-8">
              <div className="flex items-center gap-2 mb-2">
                <span className="w-1.5 h-1.5 rounded-full bg-blue-500"></span>
                <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{work.category}</span>
              </div>
              <h2 className="font-bold text-xl text-gray-900 line-clamp-1 tracking-tight">{work.title}</h2>
              <p className="text-gray-400 text-[11px] mt-3 font-bold">{work.viewing_period}</p>
            </div>
          </div>
        ))}
      </div>

      {/* 데이터가 없을 때 표시 */}
      {works.length === 0 && (
        <div className="text-center py-20">
          <p className="text-gray-300 font-bold uppercase tracking-widest text-sm">기록된 데이터가 없습니다.</p>
        </div>
      )}
    </div>
  )
}