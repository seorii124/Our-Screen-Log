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
        const avg = data.reduce((acc, cur) => acc + cur.average_rating, 0) / data.length
        setStats({ total: data.length, movie: movies, drama: dramas, avgRating: Number(avg.toFixed(1)) })
      }
    }
    getStats()
  }, [])

  return (
    <div className="max-w-5xl mx-auto p-10">
      <h1 className="text-3xl font-black mb-10 tracking-tighter italic">DATA INSIGHTS 📊</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
        <div className="bg-white p-8 rounded-[2rem] shadow-sm border border-gray-100 text-center">
          <p className="text-gray-400 text-xs font-black uppercase mb-2">Total Records</p>
          <h3 className="text-4xl font-black">{stats.total}</h3>
        </div>
        <div className="bg-white p-8 rounded-[2rem] shadow-sm border border-gray-100 text-center">
          <p className="text-gray-400 text-xs font-black uppercase mb-2">Avg Rating</p>
          <h3 className="text-4xl font-black text-blue-600">⭐ {stats.avgRating || 0}</h3>
        </div>
        <div className="bg-white p-8 rounded-[2rem] shadow-sm border border-gray-100 text-center">
          <p className="text-gray-400 text-xs font-black uppercase mb-2">Movie vs Drama</p>
          <h3 className="text-4xl font-black">{stats.movie} : {stats.drama}</h3>
        </div>
      </div>

      {/* 단순 막대 그래프 시각화 */}
      <div className="bg-white p-10 rounded-[3.5rem] shadow-xl border border-gray-100">
        <h4 className="font-black text-sm mb-8 uppercase tracking-widest text-center">Category Distribution</h4>
        <div className="flex items-end justify-center gap-10 h-64">
          <div className="flex flex-col items-center gap-4">
            <div className="bg-blue-500 w-16 rounded-t-2xl transition-all duration-1000" style={{ height: `${(stats.movie / stats.total) * 100}%` }}></div>
            <span className="text-[10px] font-black uppercase">Movies ({stats.movie})</span>
          </div>
          <div className="flex flex-col items-center gap-4">
            <div className="bg-gray-200 w-16 rounded-t-2xl transition-all duration-1000" style={{ height: `${(stats.drama / stats.total) * 100}%` }}></div>
            <span className="text-[10px] font-black uppercase">Dramas ({stats.drama})</span>
          </div>
        </div>
      </div>
    </div>
  )
}