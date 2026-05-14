'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { createClient } from '../../../src/lib/supabase/client'
import Link from 'next/link'

export default function WorkDetailPage() {
  const params = useParams()
  const id = params.id as string
  const [work, setWork] = useState<any>(null)
  
  // 🚨 [추가 1] 클라이언트 환경에 맞게 user 상태를 관리할 state 추가
  const [user, setUser] = useState<any>(null) 
  
  const supabase = createClient()

  useEffect(() => {
    async function fetchData() {
      // 기존: 작품 데이터 불러오기
      const { data: workData } = await supabase.from('works').select('*').eq('id', id).single()
      if (workData) setWork(workData)

      // 🚨 [추가 1-2] 페이지 렌더링 후 유저 세션 확인 및 상태 업데이트
      const { data: { user: userData } } = await supabase.auth.getUser()
      setUser(userData)
    }
    fetchData()
  }, [id])

  if (!work) return <div className="p-10 text-white">Loading...</div>

  return (
    <div className="max-w-4xl mx-auto p-10 min-h-screen text-white">
      <button onClick={() => history.back()} className="mb-8 text-neutral-400 text-xs font-bold hover:text-white">
        ← 목록으로 돌아가기
      </button>
      
      <div className="grid md:grid-cols-2 gap-12">
        <img src={work.poster_url} alt={work.title} className="w-full aspect-[2/3] object-cover rounded-2xl shadow-2xl" />
        <div>
          <h1 className="text-4xl font-black mb-4">{work.title}</h1>
          <p className="text-neutral-400 mb-8">{work.category} • {work.viewing_period}</p>
          
          <div className="space-y-6">
            {[1, 2, 3].map(n => (
              work[`m${n}_review`] && (
                <div key={n} className="bg-neutral-900 p-6 rounded-2xl">
                  <div className="flex justify-between mb-2">
                    <span className="font-bold text-sm">Member {n}</span>
                    <span className="text-yellow-400 font-black">★ {work[`m${n}_rating`]}</span>
                  </div>
                  <p className="text-neutral-300">{work[`m${n}_review`]}</p>
                </div>
              )
            ))}
          </div>
          
          {/* 🚨 [수정 2] user가 존재할 때만 버튼이 보이도록 감싸주기 */}
          {user && (
            <Link href={`/works/${id}/edit`} className="mt-10 block w-full text-center py-4 bg-neutral-800 rounded-full font-bold hover:bg-neutral-700">
              내용 수정하기
            </Link>
          )}
        </div>
      </div>
    </div>
  )
}