'use client'

import { useEffect, useState, use } from 'react'
import { createBrowserClient } from '@supabase/ssr'
import { useRouter } from 'next/navigation'

export default function WorkDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const unwrappedParams = use(params) 
  const currentId = unwrappedParams.id

  const [work, setWork] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()
  
  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )

  useEffect(() => {
    async function fetchWork() {
      const { data, error } = await supabase
        .from('works')
        .select('*')
        .eq('id', currentId)
        .single()

      if (error) {
        console.error(error)
      } else {
        setWork(data)
      }
      setLoading(false)
    }
    fetchWork()
  }, [currentId, supabase])

  if (loading) return <div className="p-10 text-center text-gray-500 font-medium">기록을 불러오는 중... 🍿</div>
  if (!work) return <div className="p-10 text-center text-gray-500">작품을 찾을 수 없습니다.</div>

  return (
    <div className="max-w-4xl mx-auto mt-10 p-6 bg-white rounded-3xl shadow-sm border border-gray-100 mb-20">
      <div className="flex justify-between items-center mb-8">
        <button onClick={() => router.push('/')} className="text-gray-400 hover:text-blue-500 transition-colors text-sm font-medium">← 목록으로 돌아가기</button>
        <button onClick={() => router.push(`/admin/edit/${currentId}`)} className="bg-gray-900 text-white px-5 py-2 rounded-full text-sm font-bold hover:bg-blue-600 transition-all">내용 수정하기</button>
      </div>

      <div className="border-b border-gray-50 pb-8 mb-8">
        <h1 className="text-4xl font-black mb-4 text-gray-900">{work.title}</h1>
        <div className="text-gray-500 flex flex-wrap gap-3 text-sm">
          <span className="bg-gray-100 px-3 py-1 rounded-full text-gray-700 font-bold">{work.category}</span>
          <span className="font-bold text-blue-600 bg-blue-50 px-3 py-1 rounded-full">⭐ 평균 {work.average_rating}</span>
        </div>
      </div>

      {work.poster_url && (
        <div className="mb-12">
          <p className="text-xs font-bold text-gray-400 mb-2 uppercase">Poster</p>
          <img src={work.poster_url} alt="포스터" className="h-80 w-auto object-cover rounded-2xl shadow-xl" />
        </div>
      )}

      <div className="space-y-8">
        <h2 className="text-2xl font-bold mb-6 text-gray-800">멤버별 한줄평</h2>
        
        {work.m1_review && (
          <div className="bg-blue-50/40 p-6 rounded-3xl border border-blue-100/50">
            <div className="flex justify-between mb-4"><div className="text-3xl">❄️</div> <div className="text-blue-500 font-bold">⭐ {work.m1_rating}</div></div>
            <p className="text-gray-700 italic">"{work.m1_review}"</p>
          </div>
        )}
        {work.m2_review && (
          <div className="bg-purple-50/40 p-6 rounded-3xl border border-purple-100/50">
            <div className="flex justify-between mb-4"><div className="text-3xl">🍇</div> <div className="text-purple-500 font-bold">⭐ {work.m2_rating}</div></div>
            <p className="text-gray-700 italic">"{work.m2_review}"</p>
          </div>
        )}
        {work.m3_review && (
          <div className="bg-yellow-50/40 p-6 rounded-3xl border border-yellow-100/50">
            <div className="flex justify-between mb-4"><div className="text-3xl">🍦</div> <div className="text-yellow-600 font-bold">⭐ {work.m3_rating}</div></div>
            <p className="text-gray-700 italic">"{work.m3_review}"</p>
          </div>
        )}
      </div>
    </div>
  )
}