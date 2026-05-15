"use client";

import { useState } from "react";
import { createBrowserClient } from "@supabase/ssr";

interface Ost {
  id: string;
  title: string;
  artist: string;
  media_title: string;
  cover_image_url: string;
  youtube_url: string;
  description: string;
}

export default function OstClient({
  initialOsts, deleteOst, saveOst, updateOst, isLoggedIn
}: {
  initialOsts: any[]; deleteOst: (id: string) => Promise<void>; saveOst: (data: any) => Promise<void>; updateOst: (id: string, data: any) => Promise<void>; isLoggedIn: boolean;
}) {
  const [isEditing, setIsEditing] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [playingId, setPlayingId] = useState<string | null>(null);

  const supabase = createBrowserClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!);

  const uploadFile = async (file: File) => {
    const fileExt = file.name.split('.').pop();
    const fileName = `${Math.random()}.${fileExt}`;
    const { error } = await supabase.storage.from("ost").upload(fileName, file);
    if (error) throw error;
    const { data } = supabase.storage.from("ost").getPublicUrl(fileName);
    return data.publicUrl;
  };

  const getYoutubeId = (url: string) => {
    if (!url) return null;
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
    const match = url.match(regExp);
    return (match && match[2].length === 11) ? match[2] : null;
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

      if (editingId) await updateOst(editingId, payload);
      else await saveOst(payload);

      setIsEditing(false);
      setEditingId(null);
      window.location.reload();
    } catch (err) {
      alert("처리 중 오류가 발생했습니다.");
    } finally {
      setLoading(false);
    }
  }

  const currentOst = editingId ? initialOsts.find(o => o.id === editingId) : null;

  return (
    <div className="pb-20">
      <div className="flex justify-between items-end mb-12 border-b border-gray-100 pb-6">
        <div>
          <h1 className="text-3xl font-black text-black tracking-tight">OST</h1>
          <p className="text-sm font-bold text-gray-400">Our Music Collection</p>
        </div>
        {isLoggedIn && (
          <button onClick={() => { setIsEditing(!isEditing); setEditingId(null); }} className="bg-black text-white px-5 py-2.5 rounded-full text-sm font-bold shadow-md hover:bg-gray-800 transition">
            {isEditing ? "닫기" : "+ 곡 등록"}
          </button>
        )}
      </div>

      {isEditing && (
        <form onSubmit={handleSubmit} className="bg-white p-8 rounded-3xl border border-gray-200 shadow-xl mb-16 space-y-5">
          <h2 className="text-xl font-black">{editingId ? "정보 수정" : "새 음악 등록"}</h2>
          <input type="hidden" name="existing_cover_image" defaultValue={currentOst?.cover_image_url || ""} />
          
          <div className="grid md:grid-cols-3 gap-5">
            <input type="text" name="title" defaultValue={currentOst?.title || ""} placeholder="곡명" required className="w-full border border-gray-200 bg-gray-50 p-4 rounded-xl font-bold outline-none focus:border-black" />
            <input type="text" name="artist" defaultValue={currentOst?.artist || ""} placeholder="가수" required className="w-full border border-gray-200 bg-gray-50 p-4 rounded-xl outline-none focus:border-black" />
            <input type="text" name="media_title" defaultValue={currentOst?.media_title || ""} placeholder="미디어 제목" required className="w-full border border-gray-200 bg-gray-50 p-4 rounded-xl outline-none focus:border-black" />
          </div>
          
          <textarea name="description" defaultValue={currentOst?.description || ""} placeholder="감상평" rows={2} className="w-full border border-gray-200 bg-gray-50 p-4 rounded-xl outline-none focus:border-black"></textarea>
          
          <div className="grid md:grid-cols-2 gap-5">
            <input type="text" name="youtube_url" defaultValue={currentOst?.youtube_url || ""} placeholder="유튜브 링크 URL" className="w-full border border-gray-200 bg-gray-50 p-4 rounded-xl outline-none focus:border-black" />
            <div className="bg-gray-50 p-4 rounded-xl border border-gray-200 dashed">
              <label className="block text-xs font-bold text-gray-500 mb-2">커버 이미지 첨부</label>
              <input type="file" name="cover_image" accept="image/*" className="w-full text-xs" />
            </div>
          </div>

          <button type="submit" disabled={loading} className="w-full bg-black text-white font-black py-4 rounded-xl hover:bg-gray-800 transition disabled:opacity-50">
            {loading ? "처리 중..." : "저장하기"}
          </button>
        </form>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
        {initialOsts.map(ost => {
          const ytId = getYoutubeId(ost.youtube_url);
          const isPlaying = playingId === ost.id;
          return (
            <div key={ost.id} className="bg-white rounded-[40px] p-8 border border-gray-100 shadow-sm flex flex-col items-center hover:shadow-md transition-all group">
              <div className="w-44 h-44 mb-6 rounded-2xl overflow-hidden shadow-sm relative">
                {ost.cover_image_url ? (
                  <img src={ost.cover_image_url} alt={ost.title} className={`w-full h-full object-cover transition-transform duration-700 ${isPlaying ? 'scale-110' : ''}`} />
                ) : (
                  <div className="w-full h-full bg-gray-100 flex items-center justify-center text-gray-300 font-black">OST</div>
                )}
              </div>
              <h3 className="text-lg font-black text-black text-center truncate w-full">{ost.title}</h3>
              <p className="text-sm font-bold text-gray-400 mb-6">{ost.artist}</p>

              <div className="flex items-center justify-center gap-6 mb-8">
                <button onClick={() => setPlayingId(isPlaying ? null : ost.id)} className="w-12 h-12 bg-black text-white rounded-full flex items-center justify-center shadow-md hover:scale-105 transition transform pl-1">
                  {isPlaying ? "⏸" : "▶"}
                </button>
              </div>

              {isPlaying && ytId && (
                <iframe width="0" height="0" src={`https://www.youtube.com/embed/${ytId}?autoplay=1`} allow="autoplay" className="hidden"></iframe>
              )}

              <div className="w-full mt-auto pt-4 border-t border-gray-50 flex flex-col items-center gap-2">
                <div className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">{ost.media_title}</div>
                {isLoggedIn && (
                  <div className="flex gap-4">
                    <button onClick={() => { setEditingId(ost.id); setIsEditing(true); window.scrollTo({ top: 0, behavior: 'smooth' }); }} className="text-blue-500 text-xs font-bold hover:underline">수정</button>
                    <button onClick={async () => { if(confirm("삭제하시겠습니까?")) { await deleteOst(ost.id); window.location.reload(); } }} className="text-gray-300 text-xs font-bold hover:text-red-500">삭제</button>
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