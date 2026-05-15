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
  isLoggedIn,
}: {
  initialOsts: any[]; // 타입 충돌을 방지하기 위한 유연한 세팅
  deleteOst: (id: string) => Promise<void>;
  saveOst: (formData: FormData) => Promise<void>;
  isLoggedIn: boolean;
}) {
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    try {
      const formData = new FormData(e.currentTarget);
      await saveOst(formData);
      setIsEditing(false);
      window.location.reload(); 
    } catch (err) {
      alert("저장 중 오류가 발생했습니다.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-black text-white italic tracking-tighter uppercase">Ost Archive</h1>
        {isLoggedIn && (
          <button
            onClick={() => setIsEditing(!isEditing)}
            className="bg-white text-black px-6 py-2 rounded-full font-bold text-sm hover:bg-neutral-200 transition"
          >
            {isEditing ? "CLOSE" : "ADD NEW OST"}
          </button>
        )}
      </div>

      {isEditing && (
        <form onSubmit={handleSubmit} className="bg-neutral-900 p-6 rounded-2xl border border-neutral-800 mb-10 space-y-4">
          <div className="grid md:grid-cols-3 gap-4">
            <input type="text" name="title" placeholder="곡명 (필수)" required className="w-full bg-black border border-neutral-800 p-3 rounded-xl text-white outline-none" />
            <input type="text" name="artist" placeholder="가수 (필수)" required className="w-full bg-black border border-neutral-800 p-3 rounded-xl text-white outline-none" />
            <input type="text" name="media_title" placeholder="미디어 제목 (영화/드라마) (필수)" required className="w-full bg-black border border-neutral-800 p-3 rounded-xl text-white outline-none" />
          </div>
          <textarea name="description" placeholder="코멘트" rows={3} className="w-full bg-black border border-neutral-800 p-3 rounded-xl text-white outline-none"></textarea>
          <div className="grid md:grid-cols-2 gap-4">
            <input type="text" name="youtube_url" placeholder="유튜브 URL" className="w-full bg-black border border-neutral-800 p-3 rounded-xl text-white outline-none" />
            <input type="text" name="cover_image_url" placeholder="커버 이미지 URL" className="w-full bg-black border border-neutral-800 p-3 rounded-xl text-white outline-none" />
          </div>
          <button type="submit" disabled={loading} className="w-full bg-green-500 text-black font-black py-4 rounded-xl hover:bg-green-400 transition">
            {loading ? "SAVING..." : "SAVE TO ARCHIVE"}
          </button>
        </form>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {initialOsts.map((ost: Ost) => (
          <div key={ost.id} className="bg-neutral-900 rounded-2xl overflow-hidden border border-neutral-800 flex flex-col group">
            <div className="aspect-video bg-black overflow-hidden relative">
              {ost.cover_image_url ? (
                <img src={ost.cover_image_url} alt={ost.title} className="w-full h-full object-cover group-hover:scale-105 transition duration-500" />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-neutral-800 font-black text-5xl">OST</div>
              )}
            </div>
            
            <div className="p-6 flex flex-col flex-grow">
              <div className="text-[10px] text-neutral-500 font-black mb-2 tracking-widest uppercase">
                {ost.media_title || ost.movie_title || "Untitled Media"}
              </div>
              <h3 className="text-xl font-black text-white mb-1 truncate">{ost.title}</h3>
              <div className="text-sm text-neutral-400 font-bold mb-4">{ost.artist}</div>
              
              {ost.description && (
                <p className="text-sm text-neutral-300 mb-6 bg-black/40 p-4 rounded-xl flex-grow italic border border-neutral-800/50">
                  "{ost.description}"
                </p>
              )}
              
              <div className="flex justify-between items-center pt-4 border-t border-neutral-800 mt-auto">
                {ost.youtube_url ? (
                  <a href={ost.youtube_url} target="_blank" rel="noreferrer" className="text-red-500 text-xs font-black flex items-center gap-1.5 bg-red-500/10 px-3 py-1.5 rounded-full hover:bg-red-500 hover:text-white transition">
                    ▶ PLAY
                  </a>
                ) : <div />}
                
                {isLoggedIn && (
                  <button
                    onClick={async () => {
                      if (confirm("삭제하시겠습니까?")) {
                        await deleteOst(ost.id);
                        window.location.reload();
                      }
                    }}
                    className="text-neutral-600 text-[10px] font-bold hover:text-red-500 transition uppercase"
                  >
                    Remove
                  </button>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}