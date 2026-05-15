"use client";

import { useState } from "react";
import { createBrowserClient } from "@supabase/ssr";

interface Wishlist {
  id: string;
  title: string;
  reason: string;
  platform: string;
  cover_image_url: string;
  is_watched: boolean;
}

export default function WishlistClient({
  initialWishlist, deleteWishlist, saveWishlist, updateWishlist, isLoggedIn
}: {
  initialWishlist: Wishlist[]; deleteWishlist: (id: string) => Promise<void>; saveWishlist: (data: any) => Promise<void>; updateWishlist: (id: string, data: any) => Promise<void>; isLoggedIn: boolean;
}) {
  const [isEditing, setIsEditing] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  const uploadFile = async (file: File) => {
    const fileExt = file.name.split('.').pop();
    const fileName = `${Math.random()}.${fileExt}`;
    const { error } = await supabase.storage.from("wishlist").upload(fileName, file);
    if (error) throw error;
    const { data } = supabase.storage.from("wishlist").getPublicUrl(fileName);
    return data.publicUrl;
  };

  const startEditing = (item: Wishlist) => {
    setEditingId(item.id);
    setIsEditing(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    try {
      const formData = new FormData(e.currentTarget);
      const file = formData.get("cover_image") as File;
      
      let cover_image_url = formData.get("existing_cover_image") as string;
      if (file && file.size > 0) {
        cover_image_url = await uploadFile(file);
      }

      const payload = {
        title: formData.get("title") as string,
        reason: formData.get("reason") as string,
        platform: formData.get("platform") as string,
        cover_image_url,
      };

      if (editingId) await updateWishlist(editingId, payload);
      else await saveWishlist(payload);

      setIsEditing(false);
      setEditingId(null);
      window.location.reload();
    } catch (err) {
      alert("처리 중 오류가 발생했습니다.");
    } finally {
      setLoading(false);
    }
  }

  const currentItem = editingId ? initialWishlist.find(i => i.id === editingId) : null;

  return (
    <div className="pb-20">
      <div className="flex justify-between items-end mb-12 border-b border-gray-100 pb-6">
        <h1 className="text-4xl font-black text-black">Wishlist</h1>
        {isLoggedIn && (
          <button onClick={() => { setIsEditing(!isEditing); setEditingId(null); }} className="bg-black text-white px-6 py-3 rounded-full font-bold shadow-lg hover:bg-gray-800 transition">
            {isEditing ? "닫기" : "+ 작품 추가"}
          </button>
        )}
      </div>

      {isEditing && (
        <form onSubmit={handleSubmit} className="bg-white p-8 rounded-3xl border border-gray-200 shadow-xl mb-16 space-y-6">
          <h2 className="text-xl font-black mb-4">{editingId ? "위시리스트 수정" : "새 작품 추가"}</h2>
          <input type="hidden" name="existing_cover_image" defaultValue={currentItem?.cover_image_url || ""} />
          
          <div className="grid md:grid-cols-2 gap-6">
            <input type="text" name="title" defaultValue={currentItem?.title || ""} placeholder="보고 싶은 작품명" required className="w-full border border-gray-200 bg-gray-50 p-4 rounded-xl font-bold outline-none focus:border-black" />
            <input type="text" name="platform" defaultValue={currentItem?.platform || ""} placeholder="시청 가능 플랫폼 (예: 넷플릭스, 왓챠)" className="w-full border border-gray-200 bg-gray-50 p-4 rounded-xl outline-none focus:border-black font-medium" />
          </div>
          <textarea name="reason" defaultValue={currentItem?.reason || ""} placeholder="이유나 기대평" rows={3} className="w-full border border-gray-200 bg-gray-50 p-4 rounded-xl outline-none focus:border-black font-medium"></textarea>
          
          <div className="bg-gray-50 p-6 rounded-2xl border border-gray-200 dashed">
            <label className="block text-sm font-bold text-gray-900 mb-3">대표 이미지 (포스터 등)</label>
            <input type="file" name="cover_image" accept="image/*" className="w-full text-sm font-medium" />
          </div>

          <button type="submit" disabled={loading} className="w-full bg-black text-white font-black py-4 rounded-xl hover:bg-gray-800 transition disabled:opacity-50">
            {loading ? "처리 중..." : "저장하기"}
          </button>
        </form>
      )}

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
        {initialWishlist.map(item => (
          <div key={item.id} className="bg-white border border-gray-200 rounded-2xl overflow-hidden hover:shadow-xl transition-all duration-300 flex flex-col group">
            <div className="aspect-[3/4] bg-gray-50 relative overflow-hidden">
              {item.cover_image_url ? (
                <img src={item.cover_image_url} alt={item.title} className="w-full h-full object-cover group-hover:scale-105 transition duration-700" />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-gray-300 font-bold text-sm">No Poster</div>
              )}
            </div>
            <div className="p-5 flex flex-col flex-grow">
              <h3 className="text-xl font-black text-black mb-1">{item.title}</h3>
              {item.platform && <p className="text-xs font-bold text-blue-600 mb-3 bg-blue-50 w-fit px-2 py-1 rounded">{item.platform}</p>}
              <p className="text-sm text-gray-500 font-medium mb-4 line-clamp-3">{item.reason}</p>
              
              {isLoggedIn && (
                <div className="mt-auto pt-4 border-t border-gray-50 flex justify-between">
                  <button onClick={() => startEditing(item)} className="text-blue-500 text-xs font-bold hover:underline">수정</button>
                  <button onClick={async () => { if(confirm("삭제하시겠습니까?")) await deleteWishlist(item.id); window.location.reload(); }} className="text-gray-400 text-xs font-bold hover:text-red-500">삭제</button>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}