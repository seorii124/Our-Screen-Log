'use client'

import { useEffect, useState } from 'react'
import { createClient } from '../../src/lib/supabase/client'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

interface Work {
  id: number;
  title: string;
  category: string;
  viewing_period: string;
  poster_url: string;
  [key: string]: any;
}

export default function MyLogPage() {
  const [works, setWorks] = useState<Work[]>([])
  const [user, setUser] = useState<any>(null)
  const [memberNum, setMemberNum] = useState<number>(0)
  const [loading, setLoading] = useState(true)
  
  const router = useRouter()
  const supabase = createClient()

  // ★ 못 박은 순서 완벽 적용 ★
  const getMemberNum = (email: string) => {
    if (email === 'seorii40@gmail.com') return 1;   // 1번: 나
    if (email === 'onlyziyu76@gmail.com') return 2; // 2번: 포도 🍇
    if (email === 'mooddnnaa@gmail.com') return 3;  // 3번: 아이스크림 🍦
    return 0;
  }

  useEffect(() => {
    async function fetchMyLogs() {
      const { data: { user } } = await supabase.auth.getUser()
      
      if (!user) {
        router.push('/login')
        return
      }

      const num = getMemberNum(user.email!)
      setUser(user)
      setMemberNum(num)

      if (num > 0) {
        const { data, error } = await supabase
          .from('works')
          .select('*')
          .gt(`m${num}_rating`, 0)
          .order('id', { ascending: false })

        if (data) setWorks(data as Work[])
      }
      setLoading(false)
    }

    fetchMyLogs()
  }, [supabase, router])

  if (loading) return <div className="p-10 text-center font-black text-black">LOADING MY ARCHIVE...</div>

  // 번호에 따른 임티 지정
  const memberEmoji = memberNum === 1 ? '❄️' : memberNum === 2 ? '🍇' : memberNum === 3 ? '🍦' : '';

  return (
    <div className="max-w-7xl mx-auto p-10 min-h-screen pb-32">
      <header className="mb-14">
        <h1 className="text-5xl font-black text-neutral-900 tracking-tighter mb-3 italic uppercase">
          {memberEmoji} My Collection
        </h1>
        <p className="text-neutral-500 font-bold tracking-[0.3em] text-[10px] uppercase">
          Member {memberNum} / {user?.email}
        </p>
      </header>

      {works.length === 0 ? (
        <div className="py-20 text-center border-2 border-dashed border-neutral-200 rounded-[3rem]">
          <p className="text-neutral-400 font-bold">아직 평가를 남긴 작품이 없습니다.</p>
          <Link href="/" className="text-blue-600 font-black text-xs uppercase mt-4 inline-block underline">
            Go to Archive
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-x-8 gap-y-14">
          {works.map((work) => (
            <Link href={`/works/${work.id}`} key={work.id} className="group cursor-pointer">
              <div className="relative aspect-[2/3] rounded-xl overflow-hidden bg-neutral-100 border border-neutral-200 group-hover:border-blue-500 transition-all duration-300 shadow-lg">
                <img src={work.poster_url || ''} alt={work.title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
                <div className="absolute bottom-3 right-3 bg-black text-white px-2 py-1 rounded text-[10px] font-black border border-neutral-700">
                  MY ⭐ {work[`m${memberNum}_rating`]?.toFixed(1)}
                </div>
              </div>
              <div className="mt-5 space-y-1">
                <h2 className="font-bold text-base text-neutral-900 line-clamp-1 group-hover:text-blue-600 transition-colors">
                  {work.title}
                </h2>
                <div className="flex items-center gap-2 text-[10px] font-bold text-neutral-500 uppercase tracking-tighter">
                  <span>{work.category}</span>
                  <span>•</span>
                  <span>{work[`m${memberNum}_date`]} 시청</span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}