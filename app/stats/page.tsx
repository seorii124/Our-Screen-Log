'use client'

import { useEffect, useState } from 'react'
import { createClient } from '../../src/lib/supabase/client'

export default function StatsPage() {
  const [stats, setStats] = useState<any>({
    totalCount: 0,
    movieCount: 0,
    dramaCount: 0,
    m1Avg: '0.0',
    m2Avg: '0.0',
    m3Avg: '0.0',
    monthlyData: [],
    maxCount: 1
  })
  const [loading, setLoading] = useState(true)
  const supabase = createClient()

  useEffect(() => {
    async function fetchStats() {
      const { data } = await supabase.from('works').select('*')
      if (data) {
        const total = data.length
        const movies = data.filter(w => w.category === '영화').length
        const dramas = data.filter(w => w.category === '드라마').length
        
        // 0점인 데이터는 제외하고 멤버별 진짜 평균 별점 계산
        const calcAvg = (memberKey: string) => {
          const valid = data.filter(w => w[memberKey] > 0);
          return valid.length ? (valid.reduce((acc, w) => acc + w[memberKey], 0) / valid.length).toFixed(1) : '0.0';
        }

        // 월별 (영화/드라마) 시청 횟수 집계
        const months: Record<string, { total: number, movie: number, drama: number }> = {}
        data.forEach(w => {
          const m = w.viewing_period || '미분류'
          if (!months[m]) months[m] = { total: 0, movie: 0, drama: 0 }
          
          months[m].total++
          if (w.category === '영화') months[m].movie++
          else if (w.category === '드라마') months[m].drama++
        })

        // 시간 흐름에 맞게 월별 정렬 (예: 25년 9월 -> 25년 10월)
        const sortedMonths = Object.keys(months)
          .sort((a, b) => {
             const parse = (s: string) => {
               const match = s.match(/(\d+)년\s*(\d+)월/);
               return match ? parseInt(match[1]) * 100 + parseInt(match[2]) : 9999;
             }
             return parse(a) - parse(b);
          })
          .map(m => ({
            name: m,
            ...months[m]
          }))

        const max = Math.max(...sortedMonths.map(m => m.total), 1)

        setStats({
          totalCount: total,
          movieCount: movies,
          dramaCount: dramas,
          m1Avg: calcAvg('m1_rating'),
          m2Avg: calcAvg('m2_rating'),
          m3Avg: calcAvg('m3_rating'),
          monthlyData: sortedMonths,
          maxCount: max
        })
      }
      setLoading(false)
    }
    fetchStats()
  }, [])

  if (loading) return <div className="p-20 text-center font-black">ANALYZING...</div>

  return (
    <div className="max-w-5xl mx-auto p-10 min-h-screen pb-32">
      <header className="mb-12">
        {/* 요청하신 블랙 타이틀 및 불필요한 부제목 삭제 적용 완료 */}
        <h1 className="text-4xl font-black text-neutral-900 tracking-tighter italic uppercase">Watching Analysis</h1>
        <p className="text-neutral-400 text-xs font-bold mt-2 uppercase tracking-widest">Team INFP Collector Archive</p>
      </header>

      {/* 1. 총 미디어 개수 (요청하신 3칸 디자인) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white p-8 rounded-[2rem] border border-gray-100 shadow-sm">
          <p className="text-[10px] font-black text-gray-400 uppercase mb-2">Total Media</p>
          <p className="text-3xl font-black text-black">{stats.totalCount} <span className="text-sm text-gray-300">WORKS</span></p>
        </div>
        <div className="bg-white p-8 rounded-[2rem] border border-gray-100 shadow-sm">
          <p className="text-[10px] font-black text-gray-400 uppercase mb-2">Total Movies</p>
          <p className="text-3xl font-black text-black">{stats.movieCount} <span className="text-sm text-gray-300">FILMS</span></p>
        </div>
        <div className="bg-white p-8 rounded-[2rem] border border-gray-100 shadow-sm">
          <p className="text-[10px] font-black text-gray-400 uppercase mb-2">Total Dramas</p>
          <p className="text-3xl font-black text-black">{stats.dramaCount} <span className="text-sm text-gray-300">SERIES</span></p>
        </div>
      </div>

      {/* 2. 멤버별 평균 별점 */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
        <div className="bg-blue-50/50 p-6 rounded-[2rem] border border-blue-100/50 flex justify-between items-center">
          <div>
            <p className="text-[10px] font-black text-blue-400 uppercase mb-1">Member 1</p>
            <p className="text-xl font-black text-blue-600">❄️ Avg</p>
          </div>
          <p className="text-3xl font-black text-blue-600">⭐ {stats.m1Avg}</p>
        </div>
        <div className="bg-purple-50/50 p-6 rounded-[2rem] border border-purple-100/50 flex justify-between items-center">
          <div>
            <p className="text-[10px] font-black text-purple-400 uppercase mb-1">Member 2</p>
            <p className="text-xl font-black text-purple-600">🍇 Avg</p>
          </div>
          <p className="text-3xl font-black text-purple-600">⭐ {stats.m2Avg}</p>
        </div>
        <div className="bg-yellow-50/50 p-6 rounded-[2rem] border border-yellow-100/50 flex justify-between items-center">
          <div>
            <p className="text-[10px] font-black text-yellow-600 uppercase mb-1">Member 3</p>
            <p className="text-xl font-black text-yellow-600">🍦 Avg</p>
          </div>
          <p className="text-3xl font-black text-yellow-600">⭐ {stats.m3Avg}</p>
        </div>
      </div>

      {/* 3. 월별 차트 (블랙 테마 + 하단 세부 지표) */}
      <section className="bg-black p-10 rounded-[3rem] shadow-2xl text-white">
        <h2 className="text-xl font-black mb-12 border-b border-gray-800 pb-4">월별 시청 작품 수 추이</h2>
        
        <div className="relative h-72 flex items-end justify-between gap-2 md:gap-4 mt-8">
          <div className="absolute inset-0 flex flex-col justify-between pointer-events-none text-[10px] text-gray-700 font-bold z-0">
            <div className="border-b border-gray-800 w-full pb-1 text-right pr-2">{stats.maxCount}편</div>
            <div className="border-b border-gray-800 w-full pb-1 text-right pr-2">{Math.ceil(stats.maxCount * 0.5)}편</div>
            <div className="border-b border-gray-800 w-full pb-1 text-right pr-2">0편</div>
          </div>

          {stats.monthlyData.map((d: any) => (
            <div key={d.name} className="relative z-10 flex-1 flex flex-col items-center justify-end h-full group">
              <div 
                className="w-full max-w-[40px] bg-blue-500 rounded-t-md hover:bg-blue-400 transition-all cursor-pointer relative"
                style={{ height: `${(d.total / stats.maxCount) * 100}%` }}
              >
                <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 hidden group-hover:block w-max bg-white text-black text-[10px] font-black px-3 py-2 rounded-lg shadow-xl z-50">
                  {d.name} <br/>
                  🎬 영화: {d.movie}편 <br/>
                  📺 드라마: {d.drama}편
                </div>
              </div>
              
              <div className="text-[10px] text-gray-400 mt-4 whitespace-nowrap font-bold">{d.name}</div>
              <div className="text-[9px] text-gray-600 mt-1 font-bold">
                🎬{d.movie} 📺{d.drama}
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  )
}