'use client'

import { useEffect, useState } from 'react'
import { createBrowserClient } from '@supabase/ssr'
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell
} from 'recharts'

export default function StatsPage() {
  const [chartData, setChartData] = useState<any[]>([])
  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )

  useEffect(() => {
    async function fetchStats() {
      const { data, error } = await supabase.from('works').select('viewing_period, average_rating')
      
      if (error || !data) return

      // 1. 데이터 파싱 및 그룹화 로직
      const groups: { [key: string]: { sum: number; count: number } } = {}

      data.forEach((work) => {
        // '25년 9월' -> '2025-09' 형태로 변환
        const period = work.viewing_period // 예: "25년 9월"
        const match = period.match(/(\d+)년\s*(\d+)월/)
        
        if (match) {
          const year = `20${match[1]}`
          const month = match[2].padStart(2, '0')
          const key = `${year}-${month}`

          if (!groups[key]) groups[key] = { sum: 0, count: 0 }
          groups[key].sum += work.average_rating || 0
          groups[key].count += 1
        }
      })

      // 2. 차트 데이터 배열로 변환 및 시간순 정렬
      const formattedData = Object.keys(groups)
        .sort() // 2025-09, 2025-10... 순서로 정렬
        .map((key) => ({
          month: key,
          average: Number((groups[key].sum / groups[key].count).toFixed(1)),
          count: groups[key].count
        }))

      setChartData(formattedData)
    }

    fetchStats()
  }, [supabase])

  return (
    <div className="max-w-6xl mx-auto p-10 min-h-screen text-white">
      <header className="mb-12">
        <h1 className="text-4xl font-black italic tracking-tighter mb-2 text-white">Watching Analysis</h1>
        <p className="text-neutral-500 font-bold text-xs uppercase tracking-[0.2em]">시간 흐름에 따른 평점 추이</p>
      </header>

      {/* 메인 차트 카드 */}
      <section className="bg-black border border-neutral-800 p-10 rounded-[2.5rem] shadow-2xl">
        <div className="flex justify-between items-center mb-10">
          <h2 className="text-xl font-bold">월별 평균 평점 추이</h2>
          <div className="flex gap-4 text-[10px] font-black text-neutral-500 uppercase">
            <div className="flex items-center gap-1.5"><span className="w-2 h-2 bg-blue-600 rounded-full"></span> 평균 평점</div>
          </div>
        </div>

        <div className="h-[400px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData} margin={{ top: 20, right: 30, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#262626" vertical={false} />
              <XAxis 
                dataKey="month" 
                stroke="#525252" 
                fontSize={12} 
                tickLine={false} 
                axisLine={false} 
                dy={10}
              />
              <YAxis 
                stroke="#525252" 
                fontSize={12} 
                tickLine={false} 
                axisLine={false} 
                domain={[0, 5]}
              />
              <Tooltip 
                cursor={{ fill: '#171717' }}
                contentStyle={{ backgroundColor: '#000', border: '1px solid #262626', borderRadius: '12px' }}
                itemStyle={{ color: '#2563eb', fontWeight: 'bold' }}
              />
              <Bar dataKey="average" radius={[6, 6, 0, 0]} barSize={40}>
                {chartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.average >= 4 ? '#2563eb' : '#3b82f6'} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </section>

      {/* 하단 상세 통계 그리드 */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-10">
        <div className="bg-neutral-900 border border-neutral-800 p-6 rounded-3xl">
          <p className="text-xs font-bold text-neutral-500 uppercase mb-2">총 기록 기간</p>
          <p className="text-2xl font-black">{chartData.length}개월</p>
        </div>
        <div className="bg-neutral-900 border border-neutral-800 p-6 rounded-3xl">
          <p className="text-xs font-bold text-neutral-500 uppercase mb-2">전체 평균 평점</p>
          <p className="text-2xl font-black text-blue-500">
            {(chartData.reduce((acc, cur) => acc + cur.average, 0) / chartData.length || 0).toFixed(1)}
          </p>
        </div>
        <div className="bg-neutral-900 border border-neutral-800 p-6 rounded-3xl">
          <p className="text-xs font-bold text-neutral-500 uppercase mb-2">가장 많이 본 달</p>
          <p className="text-2xl font-black text-emerald-500">
            {chartData.length > 0 ? [...chartData].sort((a, b) => b.count - a.count)[0].month : '-'}
          </p>
        </div>
      </div>
    </div>
  )
}