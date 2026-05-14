import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import Link from "next/link";
// next/navigation의 useParams 대신 서버 컴포넌트 props로 params를 받습니다.

type Props = {
  params: { id: string };
};

export default async function WorkDetailPage({ params }: Props) {
  const { id } = params;
  const cookieStore = await cookies();
  
  // 기존 클라이언트가 아닌 서버용 Supabase 인스턴스 생성
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { cookies: { get(name: string) { return cookieStore.get(name)?.value; } } }
  );

  // 1. 유저 상태 확인 (서버에서 즉시 확인하므로 로딩 딜레이 없음)
  const { data: { user } } = await supabase.auth.getUser().catch(() => ({ data: { user: null } }));

  // 2. 작품 데이터 확인 (서버에서 즉시 패칭)
  const { data: work } = await supabase.from('works').select('*').eq('id', id).single();

  if (!work) return <div className="p-10 text-white font-bold tracking-widest flex items-center justify-center min-h-[50vh]">LOADING...</div>;

  return (
    <div className="max-w-4xl mx-auto p-10 min-h-screen text-white">
      {/* 🚨 클라이언트 전용인 history.back() 대신 Link로 목록 복귀 처리 (서버 컴포넌트 최적화) */}
      <Link href="/" className="mb-8 inline-block text-neutral-400 text-xs font-bold hover:text-white transition">
        ← 목록으로 돌아가기
      </Link>
      
      <div className="grid md:grid-cols-2 gap-12 mt-4">
        {/* 노션 스타일의 카드형 포스터 뷰 (UI 최적화) */}
        <div className="bg-neutral-900 p-2 rounded-2xl shadow-2xl border border-neutral-800 self-start">
          <img src={work.poster_url} alt={work.title} className="w-full aspect-[2/3] object-cover rounded-xl" />
        </div>
        
        <div>
          <h1 className="text-4xl font-black mb-4 italic tracking-tight">{work.title}</h1>
          <p className="text-neutral-400 mb-8 font-bold">{work.category} • {work.viewing_period}</p>
          
          <div className="space-y-6">
            {[1, 2, 3].map(n => (
              work[`m${n}_review`] && (
                <div key={n} className="bg-neutral-900 p-6 rounded-2xl border border-neutral-800 shadow-sm transition hover:border-neutral-700">
                  <div className="flex justify-between items-center mb-3">
                    <span className="font-bold text-sm text-neutral-300">Member {n}</span>
                    <span className="text-yellow-400 font-black text-lg">★ {work[`m${n}_rating`]}</span>
                  </div>
                  <p className="text-neutral-200 leading-relaxed text-sm">{work[`m${n}_review`]}</p>
                </div>
              )
            ))}
          </div>
          
          {/* 서버 렌더링 시점에 바로 결정되므로 권한 깜빡임이나 튕김 현상 원천 차단 */}
          {user && (
            <Link href={`/works/${id}/edit`} className="mt-10 block w-full text-center py-4 bg-white text-black rounded-full font-black hover:bg-neutral-200 transition shadow-lg">
              내용 수정하기
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}