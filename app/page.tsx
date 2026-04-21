import { createClient } from '../src/lib/supabase/server'
import Link from 'next/link'

export default async function Home() {
  // 1. 서버 전용 클라이언트를 가져옵니다 (await 필수!)
  const supabase = await createClient()

  // 2. Supabase 'works' 테이블에서 영화 목록 가져오기
  const { data: works } = await supabase
    .from('works')
    .select('*')
    .order('created_at', { ascending: false })

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <h2 className="text-2xl font-bold">우리들의 기록</h2>
        <Link 
          href="/admin" 
          className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2 rounded-full text-sm font-medium transition-colors"
        >
          + 새 작품 등록
        </Link>
      </div>

      {!works || works.length === 0 ? (
        <div className="text-center py-32 bg-white rounded-3xl border-2 border-dashed border-gray-200">
          <p className="text-gray-400 text-lg">아직 등록된 영화가 없어요.</p>
          <p className="text-gray-400 text-sm mt-2">첫 번째 영화를 등록해 보세요! 🍿</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
          {works.map((work) => (
            <Link href={`/works/${work.id}`} key={work.id} className="group cursor-pointer">
              <div className="aspect-[2/3] bg-gray-200 rounded-2xl overflow-hidden mb-3 shadow-sm group-hover:shadow-xl transition-shadow">
                {work.poster_url ? (
                  <img 
                    src={work.poster_url} 
                    alt={work.title} 
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" 
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-gray-400">
                    No Poster
                  </div>
                )}
              </div>
              <h3 className="font-bold text-lg truncate group-hover:text-blue-600 transition-colors">
                {work.title}
              </h3>
              <p className="text-sm text-gray-500">{work.category}</p>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}