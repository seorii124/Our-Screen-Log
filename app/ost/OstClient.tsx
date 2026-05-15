"use client";

import { useState } from "react";

interface Ost {
  id: string;
  title: string;
  artist: string;
  media_title?: string;
  movie_title?: string;
  cover_image_url?: string;
  youtube_url?: string;
  description?: string;
}

export default function OstClient({
  initialOsts,
  deleteOst,
  saveOst,
  updateOst,
  isLoggedIn,
}: {
  initialOsts: any[];
  deleteOst: (id: string) => Promise<void>;
  saveOst: (data: any) => Promise<void>;
  updateOst: (id: string, data: any) => Promise<void>;
  isLoggedIn: boolean;
}) {
  const [isEditing, setIsEditing] = useState(false);
  const [editingOstId, setEditingOstId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  // 수정 버튼 클릭 시 폼 세팅
  const startEditing = (ost: Ost) => {
    setEditingOstId(ost.id);
    setIsEditing(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    try {
      const formData = new FormData(e.currentTarget);
      
      const payload = {
        title: formData.get("title") as string,
        artist: formData.get("artist") as string,
        media_title: formData.get("media_title") as string,
        cover_image_url: formData.get("cover_image_url") as string,
        youtube_url: formData.get("youtube_url") as string,
        description: formData.get("description") as string,
      };

      if (editingOstId) {
        await updateOst(editingOstId, payload);
      } else {
        await saveOst(payload);
      }

      setIsEditing(false);
      setEditingOstId(null);
      window.location.reload(); 
    } catch (err) {
      alert("저장 중 오류가 발생했습니다.");
    } finally {
      setLoading(false);
    }
  }

  const currentOst = editingOstId ? initialOsts.find(o => o.id === editingOstId) : null;

  return (
    <div className="pb-20">
      <div className="flex flex-col md:flex-row md:justify-between md:items-end mb-12 gap-6 border-b border-gray-100 pb-6">
        <div>
          <h1 className="text-4xl font-black text-black mb-2">OST</h1>
          <p className="text-sm font-bold text-gray-400">Our Screen Log Music Archive</p>
        </div>
        {isLoggedIn && (
          <button
            onClick={() => { setIsEditing(!isEditing); setEditingOstId(null); }}
            className="bg-black text-white px-6 py-3 rounded-full font-bold shadow-lg hover:bg-gray-800 transition transform hover:-translate-y-0.5"
          >
            {isEditing ? "닫기" : "+ 새 OST 등록"}
          </button>
        )}
      </div>

      {isEditing && (
        <form onSubmit={handleSubmit} className="bg-white p-8 rounded-3xl border border-gray-200 shadow-xl mb-16 space-y-6">
          <h2 className="text-xl font-black">{editingOstId ? "OST 정보 수정" : "새 OST 등록"}</h2>
          
          <div className="grid md:grid-cols-3 gap-6">
            <input type="text" name="title" defaultValue={currentOst?.title || ""} placeholder="곡명 (필수)" required className="w-full border border-gray-200 bg-gray-50 p-4 rounded-xl text-sm outline-none focus:border-black transition font-bold" />
            <input type="text" name="artist" defaultValue={currentOst?.artist || ""} placeholder="가수 (필수)" required className="w-full border border-gray-200 bg-gray-50 p-4 rounded-xl text-sm outline-none focus:border-black transition" />
            <input type="text" name="media_title" defaultValue={currentOst?.media_title || currentOst?.movie_title || ""} placeholder="미디어 제목 (영화/드라마)" required className="w-full border border-gray-200 bg-gray-50 p-4 rounded-xl text-sm outline-none focus:border-black transition" />
          </div>
          
          <textarea name="description" defaultValue={currentOst?.description || ""} placeholder="이 음악에 대한 코멘트 (선택)" rows={3} className="w-full border border-gray-200 bg-gray-50 p-4 rounded-xl text-sm outline-none focus:border-black transition"></textarea>
          
          <div className="grid md:grid-cols-2 gap-6">
            <input type="text" name="youtube_url" defaultValue={currentOst?.youtube_url || ""} placeholder="유튜브 링크 URL (선택)" className="w-full border border-gray-200 bg-gray-50 p-4 rounded-xl text-sm outline-none focus:border-black transition" />
            <input type="text" name="cover_image_url" defaultValue={currentOst?.cover_image_url || ""} placeholder="커버 이미지 URL (선택)" className="w-full border border-gray-200 bg-gray-50 p-4 rounded-xl text-sm outline-none focus:border-black transition" />
          </div>
          
          <button type="submit" disabled={loading} className="w-full bg-black text-white font-black py-4 rounded-xl hover:bg-gray-800 transition text-lg shadow-md disabled:opacity-50 mt-4">
            {loading ? "처리 중..." : editingOstId ? "정보 수정 완료" : "DB에 저장하기"}
          </button>
        </form>
      )}

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
        {initialOsts.map((ost: Ost) => (
          <div key={ost.id} className="group rounded-2xl border border-gray-200 overflow-hidden hover:shadow-2xl transition-all duration-300 bg-white flex flex-col h-full transform hover:-translate-y-1">
            <div className="aspect-square bg-gray-50 relative overflow-hidden">
              {ost.cover_image_url ? (
                <img src={ost.cover_image_url} alt={ost.title} className="w-full h-full object-cover group-hover:scale-105 transition duration-700" />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-gray-300 font-bold text-4xl">OST</div>
              )}
            </div>
            
            <div className="p-5 flex flex-col flex-grow">
              <div className="text-[10px] text-gray-400 font-black mb-2 tracking-widest uppercase">
                {ost.media_title || ost.movie_title || "Untitled"}
              </div>
              <h3 className="text-xl font-black text-black mb-1 truncate">{ost.title}</h3>
              <div className="text-sm text-gray-500 font-bold mb-4">{ost.artist}</div>
              
              {ost.description && (
                <p className="text-sm text-gray-600 mb-6 bg-gray-50 p-4 rounded-xl flex-grow font-medium border border-gray-100">
                  {ost.description}
                </p>
              )}
              
              <div className="flex justify-between items-center pt-4 border-t border-gray-50 mt-auto">
                {ost.youtube_url ? (
                  <a href={ost.youtube_url} target="_blank" rel="noreferrer" className="text-red-500 text-xs font-black flex items-center gap-1.5 bg-red-50 px-4 py-2 rounded-full hover:bg-red-500 hover:text-white transition">
                    ▶ YouTube
                  </a>
                ) : <div />}
                
                {isLoggedIn && (
                  <div className="flex gap-3">
                    <button onClick={() => startEditing(ost)} className="text-blue-500 text-xs font-bold hover:underline">수정</button>
                    <button
                      onClick={async () => {
                        if (confirm("삭제하시겠습니까?")) {
                          await deleteOst(ost.id);
                          window.location.reload();
                        }
                      }}
                      className="text-gray-400 text-xs font-bold hover:text-red-500 transition"
                    >
                      삭제
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
        
        {initialOsts.length === 0 && !isEditing && (
          <div className="col-span-full py-32 text-center">
            <p className="text-gray-400 font-black tracking-widest text-sm uppercase">등록된 OST가 없습니다.</p>
          </div>
        )}
      </div>
    </div>
  );
}