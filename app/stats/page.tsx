'use client'

import { useEffect, useState } from 'react'
import { createClient } from '../../src/lib/supabase/client'

export default function StatsPage() {
  const [stats, setStats] = useState<any>({
    movieCount: 0,
    dramaCount: 0,
    monthlyData: []
  })
  const [loading, setLoading] = useState(true)
  const supabase = createClient()

  useEffect(() => {
    async function fetchStats() {
      const { data } = await supabase.from('works').select('*')
      if (data) {
        const movies = data.filter(w => w.category === '영화').length
        const dramas = data.filter(w => w.category === '드라마').length
        
        // 월별 (viewing_period) 집계
        const months: Record<string, { movie: number, drama: number }> = {}
        data.forEach(w => {
          const m = w.viewing_period || '미분류'
          if (!months[m]) months[m] = { movie: 0, drama: 0 }
          
          if (w.category === '영화') months[m].movie++
          else if (w.category === '드라마') months[m].drama++
        })

        // 월별 내림차순 정렬 (최근 달이 위로 오게)
        const sortedMonths = Object.keys(months)
          .sort((a, b) => b.localeCompare(a))
          .map(m => ({
            name: m,
            ...months[m]
          }))

        setStats({
          movieCount: movies,
          dramaCount: dramas,
          monthlyData: sortedMonths
        })
      }
      setLoading(false)
    }
    fetchStats()
  }, [])

  if (loading) return <div className="p-20 text-center font-black">ANALYZING...</div>

  return (
    <div className="max-w-4xl mx-auto p-10 min-h-screen">
      <header className="mb-12">
        {/* ★ 타이틀 검정색(text-neutral-900) 수정 및 불필요 문구 삭제 ★ */}
        <h1 className="text-4xl font-black text-neutral-900 tracking-tighter italic">Watching Analysis</h1>
        <p className="text-neutral-400 text-xs font-bold mt-2 uppercase tracking-widest">Team INFP Collector Archive</p>
      </header>

      {/* 심플해진 영화 / 드라마 개수 요약 카드 */}
      <div className="grid grid-cols-2 gap-6 mb-12">
        <div className="bg-white p-8 rounded-[2rem] border border-gray-100 shadow-sm">
          <p className="text-[10px] font-black text-gray-400 uppercase mb-2">Total Movies</p>
          <p className="text-3xl font-black text-black">{stats.movieCount} <span className="text-sm text-gray-300">FILMS</span></p>
        </div>
        <div className="bg-white p-8 rounded-[2rem] border border-gray-100 shadow-sm">
          <p className="text-[10px] font-black text-gray-400 uppercase mb-2">Total Dramas</p>
          <p className="text-3xl font-black text-black">{stats.dramaCount} <span className="text-sm text-gray-300">SERIES</span></p>
        </div>
      </div>

      {/* 월별 기록 리스트 (모바일에서도 가로로 돌릴 필요 없음) */}
      <section className="bg-white p-10 rounded-[3rem] border border-gray-100 shadow-xl">
        <h2 className="text-xl font-black mb-8 border-b pb-4 text-black">Monthly Records</h2>
        <div className="space-y-6">
          {stats.monthlyData.map((m: any) => (
            <div key={m.name} className="flex justify-between items-center border-b border-gray-50 pb-4">
              <span className="font-bold text-gray-900">{m.name}</span>
              <div className="flex gap-4">
                <span className="text-xs font-black text-blue-500 bg-blue-50 px-3 py-1 rounded-full">영화 {m.movie}</span>
                <span className="text-xs font-black text-purple-500 bg-purple-50 px-3 py-1 rounded-full">드라마 {m.drama}</span>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  )
}