import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import Link from "next/link";

// [최적화] Next.js 15 환경에 맞춰 params를 Promise로 받도록 수정
type Props = {
  params: Promise<{ id: string }>;
};

export default async function WorkDetailPage({ params }: Props) {
  // 🚨 여기서 반드시 await로 파라미터를 풀어줘야 화면이 하얗게 뻗지 않습니다.
  const resolvedParams = await params;
  const { id } = resolvedParams;
  
  const cookieStore = await cookies();
  
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { cookies: { get(name: string) { return cookieStore.get(name)?.value; } } }
  );

  const { data: { user } } = await supabase.auth.getUser().catch(() => ({ data: { user: null } }));
  const { data: work } = await supabase.from('works').select('*').eq('id', id).single();

  if (!work) return <div className="p-10 text-white font-bold tracking-widest flex items-center justify-center min-h-[50vh]">작품을 찾을 수 없습니다.</div>;

  return (
    <div className="max-w-4xl mx-auto p-10 min-h-screen text-white">
      <Link href="/" className="mb-8 inline-block text-neutral-400 text-xs font-bold hover:text-white transition">
        ← 목록으로 돌아가기
      </Link>
      
      <div className="grid md:grid-cols-2 gap-12 mt-4">
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