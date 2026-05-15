"use client";

import { useState } from "react";
import { createBrowserClient } from "@supabase/ssr";

interface Actor {
  id: string;
  name: string;
  birth_date: string;
  nationality: string;
  rep_works: string;
  main_photo_url: string;
  sub_photos_urls: string[];
  comment: string;
  is_pinned: boolean;
  liked_by: string[];
}

export default function ActorsClient({
  initialActors,
  deleteActor,
  saveActor,
  isLoggedIn,
}: {
  initialActors: Actor[];
  deleteActor: (id: string) => Promise<void>;
  saveActor: (data: any) => Promise<void>;
  isLoggedIn: boolean;
}) {
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [selectedFilter, setSelectedFilter] = useState("전체");
  const [selectedActor, setSelectedActor] = useState<Actor | null>(null);

  const allMembers = Array.from(new Set(initialActors.flatMap(a => a.liked_by || [])));
  const filteredActors = selectedFilter === "전체" 
    ? initialActors 
    : initialActors.filter(a => a.liked_by?.includes(selectedFilter));

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  const uploadFile = async (file: File) => {
    const fileExt = file.name.split('.').pop();
    const fileName = `${Math.random()}.${fileExt}`;
    const { error } = await supabase.storage.from("actors").upload(fileName, file);
    if (error) throw error;
    const { data } = supabase.storage.from("actors").getPublicUrl(fileName);
    return data.publicUrl;
  };

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    try {
      const formData = new FormData(e.currentTarget);
      
      const mainPhotoFile = formData.get("main_photo") as File;
      const subPhotoFiles = formData.getAll("sub_photos") as File[];
      
      let main_photo_url = "";
      if (mainPhotoFile && mainPhotoFile.size > 0) {
        main_photo_url = await uploadFile(mainPhotoFile);
      }

      let sub_photos_urls: string[] = [];
      for (const file of subPhotoFiles) {
        if (file.size > 0) {
          const url = await uploadFile(file);
          sub_photos_urls.push(url);
        }
      }

      const likedByStr = formData.get("liked_by") as string;
      const liked_by = likedByStr ? likedByStr.split(",").map(s => s.trim()).filter(Boolean) : [];

      const payload = {
        name: formData.get("name") as string,
        birth_date: formData.get("birth_date") as string,
        nationality: formData.get("nationality") as string,
        rep_works: formData.get("rep_works") as string,
        comment: formData.get("comment") as string,
        is_pinned: formData.get("is_pinned") === "true",
        liked_by,
        main_photo_url,
        sub_photos_urls,
      };

      await saveActor(payload);
      setIsEditing(false);
      window.location.reload();
    } catch (err) {
      console.error(err);
      alert("등록 중 오류가 발생했습니다.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="pb-20">
      <div className="flex flex-col md:flex-row md:justify-between md:items-end mb-12 gap-6 border-b border-gray-100 pb-6">
        <div>
          {/* 🚨 쪼그라든 제목(tracking-tighter)을 삭제하고 시원하고 큰 폰트로 교체했습니다. */}
          <h1 className="text-4xl font-black text-black mb-6">Actors</h1>
          
          <div className="flex flex-wrap gap-2">
            <button 
              onClick={() => setSelectedFilter("전체")}
              className={`px-4 py-2 text-sm font-bold rounded-full transition shadow-sm ${selectedFilter === "전체" ? "bg-black text-white" : "bg-white border border-gray-200 text-gray-600 hover:bg-gray-50"}`}
            >
              전체 보기
            </button>
            {allMembers.map(member => (
              <button 
                key={member}
                onClick={() => setSelectedFilter(member)}
                className={`px-4 py-2 text-sm font-bold rounded-full transition shadow-sm ${selectedFilter === member ? "bg-black text-white" : "bg-white border border-gray-200 text-gray-600 hover:bg-gray-50"}`}
              >
                {member} Pick
              </button>
            ))}
          </div>
        </div>

        {isLoggedIn && (
          <button
            onClick={() => setIsEditing(!isEditing)}
            className="bg-black text-white px-6 py-3 rounded-full font-bold shadow-lg hover:bg-gray-800 transition transform hover:-translate-y-0.5"
          >
            {isEditing ? "닫기" : "+ 새 배우 등록"}
          </button>
        )}
      </div>

      {isEditing && (
        <form onSubmit={handleSubmit} className="bg-white p-8 rounded-3xl border border-gray-200 shadow-xl mb-16 space-y-6">
          <div className="grid md:grid-cols-2 gap-6">
            <input type="text" name="name" placeholder="배우 이름 (예: 비원진)" required className="w-full border border-gray-200 bg-gray-50 p-4 rounded-xl text-sm outline-none focus:border-black focus:bg-white transition" />
            <div className="flex items-center gap-4 bg-gray-50 p-4 rounded-xl border border-gray-200">
              <label className="text-sm font-bold text-gray-700 flex-shrink-0">상단 고정 (핀):</label>
              <select name="is_pinned" className="bg-transparent text-sm outline-none w-full font-bold">
                <option value="false">일반</option>
                <option value="true">상단 고정 📌</option>
              </select>
            </div>
            <input type="text" name="birth_date" placeholder="생년월일 (예: 1997.11.21)" className="w-full border border-gray-200 bg-gray-50 p-4 rounded-xl text-sm outline-none focus:border-black focus:bg-white transition" />
            <input type="text" name="nationality" placeholder="국적 (예: 중국)" className="w-full border border-gray-200 bg-gray-50 p-4 rounded-xl text-sm outline-none focus:border-black focus:bg-white transition" />
          </div>
          
          <input type="text" name="rep_works" placeholder="대표작 (예: 세계미진리, 심정안)" className="w-full border border-gray-200 bg-gray-50 p-4 rounded-xl text-sm outline-none focus:border-black focus:bg-white transition" />
          <input type="text" name="liked_by" placeholder="이 배우를 선호하는 멤버 (쉼표로 구분. 예: 멤버A, 멤버B)" className="w-full border border-gray-200 bg-gray-50 p-4 rounded-xl text-sm outline-none focus:border-black focus:bg-white transition" />
          
          <textarea name="comment" placeholder="추가적으로 쓰고 싶은 코멘트" rows={4} className="w-full border border-gray-200 bg-gray-50 p-4 rounded-xl text-sm outline-none focus:border-black focus:bg-white transition"></textarea>
          
          <div className="grid md:grid-cols-2 gap-6 border-t border-gray-100 pt-6">
            <div className="bg-gray-50 p-6 rounded-2xl border border-gray-200 dashed">
              <label className="block text-sm font-bold text-gray-900 mb-3">대표 사진 1장</label>
              <input type="file" name="main_photo" accept="image/*" className="w-full text-sm text-gray-600 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-bold file:bg-black file:text-white hover:file:bg-gray-800 transition cursor-pointer" />
            </div>
            <div className="bg-gray-50 p-6 rounded-2xl border border-gray-200 dashed">
              <label className="block text-sm font-bold text-gray-900 mb-3">추가 사진 (여러 장 선택 가능)</label>
              <input type="file" name="sub_photos" accept="image/*" multiple className="w-full text-sm text-gray-600 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-bold file:bg-gray-200 file:text-black hover:file:bg-gray-300 transition cursor-pointer" />
            </div>
          </div>

          <button type="submit" disabled={loading} className="w-full bg-black text-white font-black py-4 rounded-xl hover:bg-gray-800 transition text-lg mt-6 shadow-md disabled:opacity-50">
            {loading ? "업로드 중입니다..." : "배우 아카이브에 등록하기"}
          </button>
        </form>
      )}

      {/* 노션 스타일 갤러리 뷰 */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
        {filteredActors.map((actor) => (
          <div 
            key={actor.id} 
            onClick={() => setSelectedActor(actor)}
            className="group cursor-pointer rounded-2xl border border-gray-200 overflow-hidden hover:shadow-2xl hover:border-gray-300 transition-all duration-300 bg-white flex flex-col h-full transform hover:-translate-y-1"
          >
            <div className="aspect-[3/4] bg-gray-50 relative overflow-hidden">
              {actor.main_photo_url ? (
                <img src={actor.main_photo_url} alt={actor.name} className="w-full h-full object-cover group-hover:scale-105 transition duration-700" />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-gray-300 font-bold text-lg">No Photo</div>
              )}
              {actor.is_pinned && (
                <div className="absolute top-3 right-3 bg-white/95 backdrop-blur-sm px-3 py-1.5 rounded-full text-xs font-black shadow-sm">📌 고정됨</div>
              )}
            </div>
            <div className="p-5 flex flex-col flex-grow">
              <h3 className="text-xl font-black text-black mb-1">{actor.name}</h3>
              <p className="text-sm text-gray-500 font-medium mb-4 truncate">{actor.rep_works}</p>
              
              <div className="flex flex-wrap gap-1.5 mt-auto">
                {actor.liked_by?.map(member => (
                  <span key={member} className="bg-gray-100 border border-gray-200 text-gray-700 text-xs font-bold px-2.5 py-1 rounded-full">
                    {member}
                  </span>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* 모달 창 (상세 보기 - 영상의 줌인 애니메이션 느낌 추가) */}
      {selectedActor && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-md z-50 flex items-center justify-center p-4 overflow-y-auto animate-in fade-in duration-200" onClick={() => setSelectedActor(null)}>
          <div className="bg-white rounded-3xl w-full max-w-4xl my-8 overflow-hidden shadow-2xl relative animate-in zoom-in-95 duration-200" onClick={e => e.stopPropagation()}>
            <button onClick={() => setSelectedActor(null)} className="absolute top-6 right-6 w-10 h-10 flex items-center justify-center bg-gray-100 rounded-full text-gray-600 font-bold hover:bg-gray-200 hover:scale-110 transition z-10">✕</button>
            
            <div className="flex flex-col md:flex-row">
              {selectedActor.main_photo_url && (
                <div className="md:w-5/12 aspect-[3/4] md:aspect-auto md:min-h-[600px] bg-gray-50">
                  <img src={selectedActor.main_photo_url} alt={selectedActor.name} className="w-full h-full object-cover" />
                </div>
              )}
              
              <div className="p-10 md:w-7/12 flex flex-col">
                <div className="flex items-center gap-3 mb-4">
                  <h2 className="text-4xl font-black text-black">{selectedActor.name}</h2>
                  {selectedActor.is_pinned && <span className="text-xl">📌</span>}
                </div>
                
                <div className="flex flex-wrap gap-2 mb-8">
                  {selectedActor.liked_by?.map(member => (
                    <span key={member} className="bg-black text-white text-xs font-bold px-3 py-1.5 rounded-full">
                      {member} Pick
                    </span>
                  ))}
                </div>

                <div className="space-y-5 mb-8 text-sm bg-gray-50 p-6 rounded-2xl border border-gray-100">
                  <div className="grid grid-cols-[80px_1fr] gap-4 items-center">
                    <span className="text-gray-400 font-bold">생년월일</span>
                    <span className="text-black font-medium">{selectedActor.birth_date || "-"}</span>
                  </div>
                  <div className="grid grid-cols-[80px_1fr] gap-4 items-center">
                    <span className="text-gray-400 font-bold">국적</span>
                    <span className="text-black font-medium">{selectedActor.nationality || "-"}</span>
                  </div>
                  <div className="grid grid-cols-[80px_1fr] gap-4 items-center">
                    <span className="text-gray-400 font-bold">대표작</span>
                    <span className="text-black font-medium">{selectedActor.rep_works || "-"}</span>
                  </div>
                </div>

                {selectedActor.comment && (
                  <div className="mb-8">
                    <h4 className="text-xs font-black text-gray-400 mb-3 uppercase tracking-widest">Comment</h4>
                    <p className="text-base text-gray-700 whitespace-pre-wrap leading-relaxed font-medium">{selectedActor.comment}</p>
                  </div>
                )}

                {selectedActor.sub_photos_urls && selectedActor.sub_photos_urls.length > 0 && (
                  <div className="mt-auto pt-8 border-t border-gray-100">
                    <h4 className="text-xs font-black text-gray-400 mb-4 uppercase tracking-widest">Gallery</h4>
                    <div className="grid grid-cols-4 gap-3">
                      {selectedActor.sub_photos_urls.map((url, idx) => (
                        <div key={idx} className="aspect-square bg-gray-100 rounded-xl overflow-hidden border border-gray-200">
                          <img src={url} alt={`sub-${idx}`} className="w-full h-full object-cover hover:scale-110 transition duration-500 cursor-pointer" />
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {isLoggedIn && (
                  <div className="mt-8 pt-4 text-right">
                    <button
                      onClick={async () => {
                        if (confirm("정말 이 배우 데이터를 삭제하시겠습니까?")) {
                          await deleteActor(selectedActor.id);
                          window.location.reload();
                        }
                      }}
                      className="text-gray-400 text-xs font-bold hover:text-red-500 transition border-b border-transparent hover:border-red-500 pb-1"
                    >
                      데이터 삭제
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}