"use client";

import { useEffect, useState } from "react";
import { createBrowserClient } from "@supabase/ssr";
import { useRouter } from "next/navigation";
import { deleteWishlistItem } from "./actions";

export default function WishlistPage() {
  const [wishlist, setWishlist] = useState<any[]>([]);
  const router = useRouter();
  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  useEffect(() => {
    const fetchWishlist = async () => {
      const { data } = await supabase.from("wishlist").select("*").order("created_at", { ascending: false });
      if (data) setWishlist(data);
    };
    fetchWishlist();
  }, [supabase]);

  // PM님이 기획하신 '관람 완료' 로직의 핵심
  const handleWatchComplete = async (id: string, title: string, posterUrl: string) => {
    try {
      // 1. 서버 액션으로 DB에서 즉시 삭제
      await deleteWishlistItem(id);
      
      // 2. 작품 등록 페이지로 데이터 넘기며 이동
      const params = new URLSearchParams();
      params.set("title", title);
      if (posterUrl) params.set("poster_url", posterUrl);
      
      router.push(`/works/new?${params.toString()}`);
    } catch (error) {
      console.error(error);
      alert("처리 중 에러가 발생했습니다.");
    }
  };

  return (
    <div className="max-w-7xl mx-auto p-4 md:p-10">
      <h1 className="text-3xl font-black mb-8 italic">Wishlist</h1>
      
      {wishlist.length === 0 ? (
        <p className="text-neutral-500">아직 보고싶은 작품이 없습니다.</p>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {wishlist.map((item) => (
            <div key={item.id} className="bg-neutral-800 rounded-xl p-4 flex flex-col justify-between">
              <div>
                {item.poster_url && <img src={item.poster_url} alt={item.title} className="w-full h-48 object-cover rounded-lg mb-4" />}
                <h3 className="font-bold text-lg mb-2">{item.title}</h3>
                {item.expectation && <p className="text-xs text-neutral-400 line-clamp-3">{item.expectation}</p>}
              </div>
              
              {/* 관람 완료 버튼 */}
              <button 
                onClick={() => handleWatchComplete(item.id, item.title, item.poster_url)}
                className="mt-4 w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-2 rounded transition"
              >
                관람 완료 (아카이브로)
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}