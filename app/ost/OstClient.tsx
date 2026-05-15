"use client";

import { useState } from "react";
import { createBrowserClient } from "@supabase/ssr";

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
  initialOsts, deleteOst, saveOst, updateOst, isLoggedIn,
}: {
  initialOsts: any[]; deleteOst: (id: string) => Promise<void>; saveOst: (data: any) => Promise<void>; updateOst: (id: string, data: any) => Promise<void>; isLoggedIn: boolean;
}) {
  const [isEditing, setIsEditing] = useState(false);
  const [editingOstId, setEditingOstId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [playingId, setPlayingId] = useState<string | null>(null);

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  const getYoutubeId = (url: string) => {
    if (!url) return null;
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
    const match = url.match(regExp);
    return (match && match[2].length === 11) ? match[2] : null;
  };

  const uploadFile = async (file: File) => {
    const fileExt = file.name.split('.').pop();
    const fileName = `${Math.random()}.${fileExt}`;
    const { error } = await supabase.storage.from("ost").upload(fileName, file);
    if (error) throw error;
    const { data } = supabase.storage.from("ost").getPublicUrl(fileName);
    return data.publicUrl;
  };

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
      const file = formData.get("cover_image") as File;
      
      let cover_image_url = formData.get("existing_cover_image") as string;
      if (file && file.size > 0) {
        cover_image_url = await uploadFile(file);
      }

      const payload = {
        title: formData.get("title") as string,
        artist: formData.get("artist") as string,
        media_title: formData.get("media_title") as string,
        youtube_url: formData.get("youtube_url") as string,
        description: formData.get("description") as string,
        cover_image_url,
      };

      if (editingOstId) await updateOst(editingOstId, payload);
      else await saveOst(payload);

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
      <div className="flex justify-between items-end mb-12 border-b border-gray-100 pb-6">
        <h1 className="text-4xl font-black text-black">OST</h1>
        {isLoggedIn && (
          <button onClick={() => { setIsEditing(!isEditing); setEditingOstId(null); }} className="bg-black text-white px-6 py-3 rounded-full font-bold shadow-lg hover:bg-gray-800 transition">
            {isEditing ? "닫기" : "+ 새 OST 등록"}
          </button>
        )}
      </div>

      {isEditing && (
        <form onSubmit={handleSubmit} className="bg-white p-8 rounded-3xl border border-gray-200 shadow-xl mb-16 space-y-6">
          <h2 className="text-xl font-black">{editingOstId ? "OST 정보 수정" : "새 OST 등록"}</h2>
          <input type="hidden" name="existing_cover_image" defaultValue={currentOst?.cover_image_url || ""} />

          <div className="grid md:grid-cols-3 gap-6">
            <input type="text" name="title" defaultValue={currentOst?.title || ""} placeholder="곡명 (필수)" required className="w-full border border-gray-200 bg-gray-50 p-4 rounded-xl text-sm outline-none focus:border-black font-bold" />
            <input type="text" name="artist" defaultValue={currentOst?.artist || ""} placeholder="가수 (필수)" required className="w-full border border-gray-200 bg-gray-50 p-4 rounded-xl text-sm outline-none focus:border-black" />
            <input type="text" name="media_title" defaultValue={currentOst?.media_title || currentOst?.movie_title || ""} placeholder="미디어 제목" required className="w-full border border-gray-200 bg-gray-50 p-4 rounded-xl text-sm outline-none focus:border-black" />
          </div>
          
          <textarea name="description" defaultValue={currentOst?.description || ""} placeholder="음악 코멘트" rows={3} className="w-full border border-gray-200 bg-gray-50 p-4 rounded-xl text-sm outline-none focus:border-black"></textarea>
          
          <div className="grid md:grid-cols-2 gap-6 pt-2">
            <div className="bg-gray-50 p-6 rounded-2xl border border-gray-200">
              <label className="block text-sm font-bold text-gray-900 mb-2">유튜브 링크 URL (재생용)</label>
              <input type="text" name="youtube_url" defaultValue={currentOst?.youtube_url || ""} placeholder="https://youtube.com/..." className="w-full border border-gray-300 p-3 rounded-lg text-sm outline-none focus:border-black" />
            </div>
            <div className="bg-gray-50 p-6 rounded-2xl border border-gray-200 dashed">
              <label className="block text-sm font-bold text-gray-900 mb-2">앨범 커버 이미지 첨부</label>
              <input type="file" name="cover_image" accept="image/*" className="w-full text-sm font-medium" />
            </div>
          </div>
          
          <button type="submit" disabled={loading} className="w-full bg-black text-white font-black py-4 rounded-xl hover:bg-gray-800 transition shadow-md disabled:opacity-50">
            {loading ? "처리 중..." : "저장하기"}
          </button>
        </form>
      )}

      {/* 뮤직 플레이어 뷰 (이전 코드와 동일, 유튜브 iframe 포함) */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
        {initialOsts.map((ost: Ost) => {
          const ytId = getYoutubeId(ost.youtube_url || "");
          const isPlaying = playingId === ost.id;
          return (
            <div key={ost.id} className="bg-white rounded-[40px] p-8 border border-gray-100 shadow-[0_8px_30px_rgb(0,0,0,0.04)] flex flex-col items-center hover:shadow-[0_8px_30px_rgb(0,0,0,0.08)] transition-all">
              <div className="w-48 h-48 mb-6 rounded-3xl overflow-hidden shadow-md relative group">
                {ost.cover_image_url ? (
                  <img src={ost.cover_image_url} alt={ost.title} className={`w-full h-full object-cover transition duration-700 ${isPlaying ? 'scale-110' : ''}`} />
                ) : (
                  <div className="w-full h-full bg-gray-100 flex items-center justify-center text-gray-300 font-black text-2xl">OST</div>
                )}
              </div>
              
              <h3 className="text-xl font-black text-black mb-1 text-center w-full truncate">{ost.title}</h3>
              <p className="text-sm font-bold text-gray-400 mb-6 text-center">{ost.artist}</p>

              <div className="w-full flex items-center gap-3 mb-6">
                <span className="text-[10px] font-bold text-gray-400">0:00</span>
                <div className="flex-1 h-1.5 bg-gray-100 rounded-full overflow-hidden relative">
                  <div className={`absolute left-0 top-0 h-full bg-black rounded-full transition-all duration-1000 ${isPlaying ? 'w-full animate-pulse' : 'w-0'}`}></div>
                </div>
                <span className="text-[10px] font-bold text-gray-400">3:59</span>
              </div>

              <div className="flex items-center justify-center gap-6 mb-6">
                <button className="text-gray-300 hover:text-black transition">⏮</button>
                <button onClick={() => setPlayingId(isPlaying ? null : ost.id)} className="w-14 h-14 bg-black text-white rounded-full flex items-center justify-center shadow-lg hover:scale-105 transition transform text-xl pl-1">
                  {isPlaying ? "⏸" : "▶"}
                </button>
                <button className="text-gray-300 hover:text-black transition">⏭</button>
              </div>

              {isPlaying && ytId && (
                <iframe width="0" height="0" src={`https://www.youtube.com/embed/${ytId}?autoplay=1`} allow="autoplay" className="hidden"></iframe>
              )}

              <div className="w-full mt-auto pt-4 border-t border-gray-50 flex flex-col gap-3">
                <div className="text-[10px] text-gray-400 font-black tracking-widest uppercase text-center">{ost.media_title}</div>
                {isLoggedIn && (
                  <div className="flex justify-center gap-4">
                    <button onClick={() => startEditing(ost)} className="text-blue-500 text-xs font-bold hover:underline">수정</button>
                    <button onClick={async () => { if (confirm("삭제하시겠습니까?")) { await deleteOst(ost.id); window.location.reload(); } }} className="text-gray-400 text-xs font-bold hover:text-red-500">삭제</button>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}