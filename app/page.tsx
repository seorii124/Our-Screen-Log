'use client'

import { useState, useEffect } from 'react'
import { createClient } from '../src/lib/supabase/client'
import { useRouter } from 'next/navigation'

export default function Home() {
  const [works, setWorks] = useState<any[]>([])
  const [sortType, setSortType] = useState('latest')
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    async function fetchWorks() {
      let query = supabase.from('works').select('*')
      
      if (sortType === 'latest') {
        // 1순위: 생성일 역순, 2순위: ID 역순
        query = query.order('created_at', { ascending: false }).order('id', { ascending: false })
      } else if (sortType === 'high') {
        query = query.order('average_rating', { ascending: false })
      } else if (sortType === 'low') {
        query = query.order('average_rating', { ascending: true })
      }

      const { data } = await query
      if (data) setWorks(data)
    }
    fetchWorks()
  }, [sortType])

  return (
    <div className="max-w-5xl mx-auto p-6 bg-gray-50 min-h-screen">
      <header className="flex justify-between items-center mb-10 pt-6">
        <h1 className="text-3xl font-black text-gray-900">우리들의 기록고 🍿</h1>
        <button onClick={() => router.push('/admin')} className="bg-black text-white px-4 py-2 rounded-full text-sm font-bold">새 기록 등록</button>
      </header>
      
      <div className="flex gap-2 mb-8">
        {['latest', 'high', 'low'].map((t) => (
          <button key={t} onClick={() => setSortType(t)} className={`px-5 py-2 rounded-full text-xs font-bold transition-all ${sortType === t ? 'bg-black text-white shadow-lg' : 'bg-white text-gray-400 border border-gray-100'}`}>
            {t === 'latest' ? '최신순' : t === 'high' ? '평점 높은순' : '평점 낮은순'}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
        {works.map((work) => (
          <div key={work.id} onClick={() => router.push(`/works/${work.id}`)} className="group cursor-pointer bg-white rounded-[2rem] overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 border border-gray-100">
            <div className="relative h-72 overflow-hidden">
              <img src={work.poster_url || 'https://via.placeholder.com/400x600?text=No+Image'} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
              <div className="absolute top-4 right-4 bg-white/90 backdrop-blur px-3 py-1 rounded-full text-xs font-black shadow-sm text-blue-600 border border-blue-50">⭐ {work.average_rating}</div>
            </div>
            <div className="p-6">
              <span className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-2 block">{work.category}</span>
              <h2 className="font-bold text-xl text-gray-800 line-clamp-1">{work.title}</h2>
              <p className="text-gray-400 text-xs mt-2 font-medium">{work.viewing_period}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}