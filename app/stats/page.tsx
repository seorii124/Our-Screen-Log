'use client'

import { useState, useEffect } from 'react'
import { createClient } from '../../src/lib/supabase/client'

export default function StatsPage() {
  const [stats, setStats] = useState({ total: 0, movie: 0, drama: 0, avgRating: 0 })
  const supabase = createClient()

  useEffect(() => {
    async function getStats() {
      const { data } = await supabase.from('works').select('category, average_rating')
      if (data && data.length > 0) {
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
      <header className="mb-10">
        <p className="text-gray-400 font-bold tracking-widest text-[10px] uppercase mb-1">INFP Collecter's archive 🍿</p>
        <h1 className="text-3xl font-black italic tracking-tighter">DATA INSIGHTS 📊</h1>
      </header>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10 text-black">
        <div className="bg-white p-8 rounded-[2rem] shadow-sm border border-gray-100 text-center">
          <p className="text-gray-400 text-[10px] font-black uppercase mb-2">Total Records</p>
          <h3 className="text-4xl font-black">{stats.total}</h3>
        </div>
        <div className="bg-white p-8 rounded-[2rem] shadow-sm border border-gray-100 text-center">
          <p className="text-gray-400 text-[10px] font-black uppercase mb-2">Avg Rating</p>
          <h3 className="text-4xl font-black text-blue-600">⭐ {stats.avgRating || 0}</h3>
        </div>
        <div className="bg-white p-8 rounded-[2rem] shadow-sm border border-gray-100 text-center">
          <p className="text-gray-400 text-[10px] font-black uppercase mb-2">Movie vs Drama</p>
          <h3 className="text-4xl font-black">{stats.movie} : {stats.drama}</h3>
        </div>
      </div>

      <div className="bg-white p-10 rounded-[3.5rem] shadow-xl border border-gray-100 text-black">
        <h4 className="font-black text-xs mb-12 uppercase tracking-[0.3em] text-center text-gray-400">Category Distribution</h4>
        <div className="flex items-end justify-center gap-16 h-48">
          <div className="flex flex-col items-center gap-4 group">
            <div className="bg-black w-20 rounded-2xl transition-all duration-1000 shadow-2xl" style={{ height: `${stats.total > 0 ? (stats.movie / stats.total) * 100 : 0}%` }}></div>
            <span className="text-[10px] font-black uppercase tracking-widest text-gray-800">Movies ({stats.movie})</span>
          </div>
          <div className="flex flex-col items-center gap-4 group">
            <div className="bg-gray-200 w-20 rounded-2xl transition-all duration-1000 shadow-inner" style={{ height: `${stats.total > 0 ? (stats.drama / stats.total) * 100 : 0}%` }}></div>
            <span className="text-[10px] font-black uppercase tracking-widest text-gray-400">Dramas ({stats.drama})</span>
          </div>
        </div>
      </div>
    </div>
  )
}