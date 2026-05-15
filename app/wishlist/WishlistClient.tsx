"use client";

import { useState } from "react";

interface Wishlist {
  id: string;
  title: string;
  reason: string;
  is_watched: boolean;
}

export default function WishlistClient({
  initialWishlist, deleteWishlist, saveWishlist, isLoggedIn
}: {
  initialWishlist: Wishlist[]; deleteWishlist: (id: string) => Promise<void>; saveWishlist: (data: any) => Promise<void>; isLoggedIn: boolean;
}) {
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    try {
      const formData = new FormData(e.currentTarget);
      await saveWishlist({ title: formData.get("title") as string, reason: formData.get("reason") as string });
      setIsEditing(false);
      window.location.reload();
    } catch (err) {
      alert("등록 중 오류가 발생했습니다.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="pb-20">
      <div className="flex justify-between items-end mb-12 border-b border-gray-100 pb-6">
        <h1 className="text-4xl font-black text-black">Wishlist</h1>
        {isLoggedIn && (
          <button onClick={() => setIsEditing(!isEditing)} className="bg-black text-white px-6 py-3 rounded-full font-bold shadow-lg hover:bg-gray-800 transition">
            {isEditing ? "닫기" : "+ 작품 추가"}
          </button>
        )}
      </div>

      {isEditing && (
        <form onSubmit={handleSubmit} className="bg-white p-8 rounded-3xl border border-gray-200 shadow-xl mb-16 space-y-4">
          <input type="text" name="title" placeholder="보고 싶은 작품명" required className="w-full border border-gray-200 bg-gray-50 p-4 rounded-xl font-bold outline-none focus:border-black" />
          <textarea name="reason" placeholder="이유나 기대평" rows={3} className="w-full border border-gray-200 bg-gray-50 p-4 rounded-xl outline-none focus:border-black"></textarea>
          <button type="submit" disabled={loading} className="w-full bg-black text-white font-black py-4 rounded-xl mt-2 disabled:opacity-50">저장하기</button>
        </form>
      )}

      <div className="grid md:grid-cols-2 gap-6">
        {initialWishlist.map(item => (
          <div key={item.id} className="p-6 bg-white border border-gray-200 rounded-2xl shadow-sm hover:shadow-md transition flex justify-between items-start">
            <div>
              <h3 className="text-xl font-bold text-black mb-2">{item.title}</h3>
              <p className="text-sm text-gray-500">{item.reason}</p>
            </div>
            {isLoggedIn && (
              <button onClick={async () => { if(confirm("삭제하시겠습니까?")) await deleteWishlist(item.id); window.location.reload(); }} className="text-gray-400 text-xs font-bold hover:text-red-500">삭제</button>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}