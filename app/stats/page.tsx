'use client'

import { useState, useEffect } from 'react'
import { createClient } from '../../src/lib/supabase/client'

export default function StatsPage() {
  const [stats, setStats] = useState({ total: 0, movie: 0, drama: 0, avgRating: 0 })
  const supabase = createClient()

  useEffect(() => {
    async function getStats() {
      const { data } = await supabase.from('works').select('category, average_rating')
      if (data) {
        const movies = data.filter(d => d.category === '영화').length
        const dramas = data.filter(d => d.category === '드라마').length
        const avg = data.length > 0 ? data.reduce((acc, cur) => acc + (cur.average_rating || 0), 0) / data.length : 0
        setStats({ total: data.length, movie: movies, drama: dramas, avgRating: Number(avg.toFixed(1)) })
      }
    }
    getStats()
  }, [])

  return (
    <div className="max-w-5xl mx-auto p-10">
      <header className="mb-12">
        <p className="text-gray-400 font-bold tracking-widest text-[10px] uppercase mb-1 italic">INFP Collecter's archive</p>
        <h1 className="text-4xl font-black italic tracking-tighter">DATA INSIGHTS</h1>
      </header>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
        <div className="bg-white p-8 rounded-[2rem] border border-gray-100 shadow-sm text-center">
          <p className="text-gray-400 text-[10px] font-black uppercase mb-2">총 기록물</p>
          <h3 className="text-4xl font-black">{stats.total}개</h3>
        </div>
        <div className="bg-white p-8 rounded-[2rem] border border-gray-100 shadow-sm text-center">
          <p className="text-gray-400 text-[10px] font-black uppercase mb-2">평균 별점</p>
          <h3 className="text-4xl font-black text-blue-600">⭐ {stats.avgRating}</h3>
        </div>
        <div className="bg-white p-8 rounded-[2rem] border border-gray-100 shadow-sm text-center">
          <p className="text-gray-400 text-[10px] font-black uppercase mb-2">콘텐츠 분류</p>
          <h3 className="text-xl font-black">영화 {stats.movie} / 드라마 {stats.drama}</h3>
        </div>
      </div>

      {/* 그래프 바 - 색상을 더 진하게 하고 높이를 확실히 줬습니다 */}
      <div className="bg-white p-12 rounded-[3rem] border border-gray-100 shadow-xl">
        <h4 className="font-black text-xs mb-16 uppercase tracking-[0.4em] text-center text-gray-300">Distribution</h4>
        <div className="flex items-end justify-center gap-24 h-64 border-b-2 border-gray-50 pb-2">
          <div className="flex flex-col items-center gap-6 w-24">
            <div className="bg-blue-600 w-full rounded-t-2xl shadow-lg" style={{ height: `${stats.total > 0 ? (stats.movie / stats.total) * 100 : 0}%`, minHeight: '10px' }}></div>
            <span className="text-[10px] font-black uppercase tracking-widest">Movies ({stats.movie})</span>
          </div>
          <div className="flex flex-col items-center gap-6 w-24">
            <div className="bg-black w-full rounded-t-2xl shadow-lg" style={{ height: `${stats.total > 0 ? (stats.drama / stats.total) * 100 : 0}%`, minHeight: '10px' }}></div>
            <span className="text-[10px] font-black uppercase tracking-widest">Dramas ({stats.drama})</span>
          </div>
        </div>
      </div>
    </div>
  )
}