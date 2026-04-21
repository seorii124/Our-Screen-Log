'use client'

import { useEffect, useState, use } from 'react' 
import { createClient } from '@supabase/supabase-js'
import { useRouter } from 'next/navigation'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL as string
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY as string
const supabase = createClient(supabaseUrl, supabaseKey)

export default function WorkDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const unwrappedParams = use(params) 
  const currentId = unwrappedParams.id

  const [work, setWork] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()

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
  }, [currentId])

  if (loading) return <div className="p-10 text-center text-gray-500 font-medium">기록을 불러오는 중... 🍿</div>
  if (!work) return <div className="p-10 text-center text-gray-500">작품을 찾을 수 없습니다.</div>

  return (
    <div className="max-w-4xl mx-auto mt-10 p-6 bg-white rounded-3xl shadow-sm border border-gray-100 mb-20">
      
      {/* 상단 액션 바 (목록 가기 & 수정 버튼) */}
      <div className="flex justify-between items-center mb-8">
        <button 
          onClick={() => router.push('/')} 
          className="text-gray-400 hover:text-blue-500 transition-colors flex items-center gap-2 text-sm font-medium"
        >
          ← 목록으로 돌아가기
        </button>

        {/* ✏️ 대망의 수정 버튼: 클릭 시 admin의 수정 페이지로 이동 */}
        <button 
          onClick={() => router.push(`/admin/edit/${currentId}`)} 
          className="bg-gray-900 text-white px-5 py-2 rounded-full text-sm font-bold hover:bg-blue-600 transition-all shadow-md active:scale-95"
        >
          내용 수정하기
        </button>
      </div>

      {/* 작품 기본 정보 (14개 필드 중 핵심 정보) */}
      <div className="border-b border-gray-50 pb-8 mb-8">
        <h1 className="text-4xl font-black mb-4 text-gray-900 leading-tight">{work.title}</h1>
        <div className="text-gray-500 flex flex-wrap gap-3 text-sm items-center">
          <span className="bg-gray-100 px-3 py-1 rounded-full text-gray-700 font-bold">{work.category}</span>
          <span className="text-gray-300">|</span>
          <span className="flex items-center gap-1">📅 {work.viewing_period}</span>
          <span className="text-gray-300">|</span>
          <span className="font-bold text-blue-600 bg-blue-50 px-3 py-1 rounded-full flex items-center gap-1">
            ⭐ 평균 {work.average_rating}
          </span>
        </div>
      </div>

      {/* 미디어 섹션 (포스터, 명장면, 영상) */}
      <div className="flex gap-4 mb-12 overflow-x-auto pb-4 no-scrollbar">
        {work.poster_url && (
          <div className="flex-shrink-0">
            <p className="text-xs font-bold text-gray-400 mb-2 ml-1 uppercase tracking-wider">Poster</p>
            <img src={work.poster_url} alt="포스터" className="h-80 object-cover rounded-2xl shadow-xl border border-gray-100" />
          </div>
        )}
        {work.best_scene_url && (
          <div className="flex-shrink-0">
            <p className="text-xs font-bold text-gray-400 mb-2 ml-1 uppercase tracking-wider">Best Scene</p>
            <img src={work.best_scene_url} alt="명장면" className="h-80 object-cover rounded-2xl shadow-xl border border-gray-100" />
          </div>
        )}
        {work.video_url && (
          <div className="flex-shrink-0">
            <p className="text-xs font-bold text-gray-400 mb-2 ml-1 uppercase tracking-wider">Video</p>
            <video src={work.video_url} controls className="h-80 rounded-2xl shadow-xl bg-black" />
          </div>
        )}
      </div>

      {/* 멤버별 후기 (m1, m2, m3 데이터 올인원) */}
      <div className="space-y-8">
        <h2 className="text-2xl font-bold mb-6 text-gray-800 flex items-center gap-2">
          <span className="w-2 h-8 bg-blue-500 rounded-full"></span>
          멤버별 한줄평
        </h2>
        
        {/* 멤버 1 (❄️) */}
        {work.m1_review && (
          <div className="bg-blue-50/40 p-6 rounded-3xl border border-blue-100/50 hover:shadow-md transition-shadow">
            <div className="flex justify-between items-start mb-4">
              <div className="text-3xl">❄️</div> 
              <div className="text-right">
                <div className="text-blue-500 font-bold text-lg">⭐ {work.m1_rating}</div>
                <div className="text-xs text-blue-300 font-medium mt-1">{work.m1_date}</div>
              </div>
            </div>
            <p className="text-gray-700 leading-relaxed font-medium whitespace-pre-wrap italic">
              "{work.m1_review}"
            </p>
          </div>
        )}

        {/* 멤버 2 (🍇) */}
        {work.m2_review && (
          <div className="bg-purple-50/40 p-6 rounded-3xl border border-purple-100/50 hover:shadow-md transition-shadow">
            <div className="flex justify-between items-start mb-4">
              <div className="text-3xl">🍇</div> 
              <div className="text-right">
                <div className="text-purple-500 font-bold text-lg">⭐ {work.m2_rating}</div>
                <div className="text-xs text-purple-300 font-medium mt-1">{work.m2_date}</div>
              </div>
            </div>
            <p className="text-gray-700 leading-relaxed font-medium whitespace-pre-wrap italic">
              "{work.m2_review}"
            </p>
          </div>
        )}

        {/* 멤버 3 (🍦) */}
        {work.m3_review && (
          <div className="bg-yellow-50/40 p-6 rounded-3xl border border-yellow-100/50 hover:shadow-md transition-shadow">
            <div className="flex justify-between items-start mb-4">
              <div className="text-3xl">🍦</div> 
              <div className="text-right">
                <div className="text-yellow-600 font-bold text-lg">⭐ {work.m3_rating}</div>
                <div className="text-xs text-yellow-400 font-medium mt-1">{work.m3_date}</div>
              </div>
            </div>
            <p className="text-gray-700 leading-relaxed font-medium whitespace-pre-wrap italic">
              "{work.m3_review}"
            </p>
          </div>
        )}
      </div>
    </div>
  )
}