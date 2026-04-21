'use client'

// 1. 여기서 'use'를 추가로 가져옵니다!
import { useEffect, useState, use } from 'react' 
import { createClient } from '@supabase/supabase-js'
import { useRouter } from 'next/navigation'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL as string
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY as string
const supabase = createClient(supabaseUrl, supabaseKey)

// 2. params를 Promise로 받도록 타입을 살짝 바꿨습니다.
export default function WorkDetailPage({ params }: { params: Promise<{ id: string }> }) {
  // 3. React.use()로 params의 포장을 뜯어서 진짜 id를 꺼냅니다!
  const unwrappedParams = use(params) 
  const currentId = unwrappedParams.id

  const [work, setWork] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    async function fetchWork() {
      // 4. 이제 꺼내둔 currentId를 사용합니다.
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
  }, [currentId]) // 5. 여기도 currentId로 변경!

  if (loading) return <div className="p-10 text-center">데이터를 불러오는 중입니다...</div>
  if (!work) return <div className="p-10 text-center">작품을 찾을 수 없습니다.</div>

  return (
    <div className="max-w-4xl mx-auto mt-10 p-6 bg-white rounded-lg shadow-md">
      <button onClick={() => router.push('/')} className="mb-4 text-blue-500 hover:underline">
        ← 목록으로 돌아가기
      </button>

      {/* 작품 기본 정보 */}
      <div className="border-b pb-6 mb-6">
        <h1 className="text-3xl font-bold mb-2">{work.title}</h1>
        <div className="text-gray-600 space-x-4">
          <span>{work.category}</span>
          <span>|</span>
          <span>시청 시기: {work.viewing_period}</span>
          <span>|</span>
          <span className="font-bold text-blue-600">평균 평점: {work.average_rating}</span>
        </div>
      </div>

      {/* 첨부된 사진/동영상 */}
      <div className="flex gap-4 mb-8 overflow-x-auto">
        {work.poster_url && (
          <img src={work.poster_url} alt="포스터" className="h-64 object-cover rounded" />
        )}
        {work.best_scene_url && (
          <img src={work.best_scene_url} alt="명장면" className="h-64 object-cover rounded" />
        )}
        {work.video_url && (
          <video src={work.video_url} controls className="h-64 rounded" />
        )}
      </div>

      {/* 팀원별 리뷰 공간 */}
      <div className="space-y-6">
        <h2 className="text-2xl font-bold mb-4">멤버별 후기</h2>
        
        {/* 멤버 1 (❄️) */}
        {work.m1_review && (
          <div className="bg-blue-50 p-4 rounded-lg">
            <div className="flex justify-between items-center mb-2">
              <h3 className="font-bold text-lg">❄️ 멤버 1</h3>
              <div className="text-sm text-gray-500">{work.m1_date} | 평점: {work.m1_rating}</div>
            </div>
            <p className="text-gray-800 whitespace-pre-wrap">{work.m1_review}</p>
          </div>
        )}

        {/* 멤버 2 (🍇) */}
        {work.m2_review && (
          <div className="bg-purple-50 p-4 rounded-lg">
            <div className="flex justify-between items-center mb-2">
              <h3 className="font-bold text-lg">🍇 멤버 2</h3>
              <div className="text-sm text-gray-500">{work.m2_date} | 평점: {work.m2_rating}</div>
            </div>
            <p className="text-gray-800 whitespace-pre-wrap">{work.m2_review}</p>
          </div>
        )}

        {/* 멤버 3 (🍦) */}
        {work.m3_review && (
          <div className="bg-yellow-50 p-4 rounded-lg">
            <div className="flex justify-between items-center mb-2">
              <h3 className="font-bold text-lg">🍦 멤버 3</h3>
              <div className="text-sm text-gray-500">{work.m3_date} | 평점: {work.m3_rating}</div>
            </div>
            <p className="text-gray-800 whitespace-pre-wrap">{work.m3_review}</p>
          </div>
        )}
      </div>
    </div>
  )
}