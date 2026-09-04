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

const MEMBERS = ["❄️", "🍇", "🍦"];

export default function ActorsClient({
  initialActors,
  deleteActor,
  saveActor,
  updateActor,
  isLoggedIn,
}: {
  initialActors: Actor[];
  deleteActor: (id: string) => Promise<void>;
  saveActor: (data: any) => Promise<void>;
  updateActor: (id: string, data: any) => Promise<void>;
  isLoggedIn: boolean;
}) {
  const [isEditing, setIsEditing] = useState(false);
  const [editingActorId, setEditingActorId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [selectedFilter, setSelectedFilter] = useState("전체");
  const [selectedActor, setSelectedActor] = useState<Actor | null>(null);
  const [selectedFormMembers, setSelectedFormMembers] = useState<string[]>([]);

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

  // 수정 버튼 클릭 시 폼 세팅
  const startEditing = (actor: Actor) => {
    setEditingActorId(actor.id);
    setSelectedFormMembers(actor.liked_by || []);
    setIsEditing(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    try {
      const formData = new FormData(e.currentTarget);
      
      const mainPhotoFile = formData.get("main_photo") as File;
      const subPhotoFiles = formData.getAll("sub_photos") as File[];
      
      let main_photo_url = formData.get("existing_main_photo") as string;
      if (mainPhotoFile && mainPhotoFile.size > 0) {
        main_photo_url = await uploadFile(mainPhotoFile);
      }

      let sub_photos_urls: string[] = JSON.parse(formData.get("existing_sub_photos") as string || "[]");
      for (const file of subPhotoFiles) {
        if (file.size > 0) {
          const url = await uploadFile(file);
          sub_photos_urls.push(url);
        }
      }

      const payload = {
        name: formData.get("name") as string,
        birth_date: formData.get("birth_date") as string,
        nationality: formData.get("nationality") as string,
        rep_works: formData.get("rep_works") as string,
        comment: formData.get("comment") as string,
        is_pinned: formData.get("is_pinned") === "true",
        liked_by: selectedFormMembers,
        main_photo_url,
        sub_photos_urls,
      };

      if (editingActorId) {
        await updateActor(editingActorId, payload);
      } else {
        await saveActor(payload);
      }

      setIsEditing(false);
      setEditingActorId(null);
      window.location.reload();
    } catch (err) {
      console.error(err);
      alert("처리 중 오류가 발생했습니다.");
    } finally {
      setLoading(false);
    }
  }

  // 현재 수정 중인 배우 데이터 찾기
  const currentActor = editingActorId ? initialActors.find(a => a.id === editingActorId) : null;

  return (
    <div className="pb-20">
      <div className="flex flex-col md:flex-row md:justify-between md:items-end mb-12 gap-6 border-b border-gray-100 pb-6">
        <div>
          <h1 className="text-4xl font-black text-black mb-6 tracking-tight">Actors</h1>
          <div className="flex flex-wrap gap-2">
            <button onClick={() => setSelectedFilter("전체")} className={`px-4 py-2 text-sm font-bold rounded-full transition shadow-sm ${selectedFilter === "전체" ? "bg-black text-white" : "bg-white border border-gray-200 text-gray-600 hover:bg-gray-50"}`}>전체 보기</button>
            {MEMBERS.map(member => (
              <button key={member} onClick={() => setSelectedFilter(member)} className={`px-4 py-2 text-sm font-bold rounded-full transition shadow-sm ${selectedFilter === member ? "bg-black text-white" : "bg-white border border-gray-200 text-gray-600 hover:bg-gray-50"}`}>{member} Pick</button>
            ))}
          </div>
        </div>
        {isLoggedIn && (
          <button onClick={() => { setIsEditing(!isEditing); setEditingActorId(null); setSelectedFormMembers([]); }} className="bg-black text-white px-6 py-3 rounded-full font-bold shadow-lg hover:bg-gray-800 transition transform hover:-translate-y-0.5">
            {isEditing ? "닫기" : "+ 새 배우 등록"}
          </button>
        )}
      </div>

      {isEditing && (
        <form onSubmit={handleSubmit} className="bg-white p-8 rounded-3xl border border-gray-200 shadow-xl mb-16 space-y-6">
          <h2 className="text-xl font-black">{editingActorId ? "배우 정보 수정" : "새 배우 등록"}</h2>
          <input type="hidden" name="existing_main_photo" defaultValue={currentActor?.main_photo_url || ""} />
          <input type="hidden" name="existing_sub_photos" defaultValue={JSON.stringify(currentActor?.sub_photos_urls || [])} />
          
          <div className="grid md:grid-cols-2 gap-6">
            <input type="text" name="name" defaultValue={currentActor?.name || ""} placeholder="배우 이름" required className="w-full border border-gray-200 bg-gray-50 p-4 rounded-xl text-sm outline-none focus:border-black transition font-bold" />
            <div className="flex items-center gap-4 bg-gray-50 p-4 rounded-xl border border-gray-200">
              <label className="text-sm font-bold text-gray-700 flex-shrink-0">상단 고정 (핀):</label>
              <select name="is_pinned" defaultValue={String(currentActor?.is_pinned || false)} className="bg-transparent text-sm outline-none w-full font-bold">
                <option value="false">일반</option>
                <option value="true">상단 고정 📌</option>
              </select>
            </div>
            <input type="text" name="birth_date" defaultValue={currentActor?.birth_date || ""} placeholder="생년월일 (1997.11.21)" className="w-full border border-gray-200 bg-gray-50 p-4 rounded-xl text-sm outline-none focus:border-black transition" />
            <input type="text" name="nationality" defaultValue={currentActor?.nationality || ""} placeholder="국적" className="w-full border border-gray-200 bg-gray-50 p-4 rounded-xl text-sm outline-none focus:border-black transition" />
          </div>
          <input type="text" name="rep_works" defaultValue={currentActor?.rep_works || ""} placeholder="대표작" className="w-full border border-gray-200 bg-gray-50 p-4 rounded-xl text-sm outline-none focus:border-black transition" />
          
          <div className="w-full border border-gray-200 bg-gray-50 p-4 rounded-xl">
            <label className="block text-sm font-bold text-gray-700 mb-3">선호하는 멤버</label>
            <div className="flex gap-3">
              {MEMBERS.map(m => (
                <button key={m} type="button" onClick={() => setSelectedFormMembers(prev => prev.includes(m) ? prev.filter(x => x !== m) : [...prev, m])} className={`px-5 py-2.5 rounded-full text-base transition border shadow-sm ${selectedFormMembers.includes(m) ? 'bg-black text-white border-black' : 'bg-white border-gray-300 text-gray-400'}`}>
                  {m}
                </button>
              ))}
            </div>
          </div>
          
          <textarea name="comment" defaultValue={currentActor?.comment || ""} placeholder="코멘트" rows={4} className="w-full border border-gray-200 bg-gray-50 p-4 rounded-xl text-sm outline-none focus:border-black transition"></textarea>
          
          <div className="grid md:grid-cols-2 gap-6 pt-6">
            <div className="bg-gray-50 p-6 rounded-2xl border border-gray-200 dashed">
              <label className="block text-sm font-bold text-gray-900 mb-3">대표 사진 {editingActorId && "(변경 시 선택)"}</label>
              <input type="file" name="main_photo" accept="image/*" className="w-full text-sm" />
            </div>
            <div className="bg-gray-50 p-6 rounded-2xl border border-gray-200 dashed">
              <label className="block text-sm font-bold text-gray-900 mb-3">추가 사진들</label>
              <input type="file" name="sub_photos" accept="image/*" multiple className="w-full text-sm" />
            </div>
          </div>

          <button type="submit" disabled={loading} className="w-full bg-black text-white font-black py-4 rounded-xl hover:bg-gray-800 transition text-lg shadow-md disabled:opacity-50">
            {loading ? "처리 중..." : editingActorId ? "정보 수정 완료" : "배우 등록 완료"}
          </button>
        </form>
      )}

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
        {filteredActors.map((actor) => (
          <div key={actor.id} className="group cursor-pointer rounded-2xl border border-gray-200 overflow-hidden hover:shadow-2xl transition-all duration-300 bg-white flex flex-col h-full transform hover:-translate-y-1">
            <div className="aspect-[3/4] bg-gray-50 relative overflow-hidden" onClick={() => setSelectedActor(actor)}>
              {actor.main_photo_url ? (
                <img src={actor.main_photo_url} alt={actor.name} className="w-full h-full object-cover group-hover:scale-105 transition duration-700" />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-gray-300 font-bold text-lg">No Photo</div>
              )}
              {actor.is_pinned && <div className="absolute top-3 right-3 bg-white/95 px-3 py-1.5 rounded-full text-xs font-black shadow-sm">📌</div>}
            </div>
            <div className="p-5 flex flex-col flex-grow">
              <div onClick={() => setSelectedActor(actor)}>
                <h3 className="text-xl font-black text-black mb-1">{actor.name}</h3>
                <p className="text-sm text-gray-500 font-medium mb-4 truncate">{actor.rep_works}</p>
                <div className="flex flex-wrap gap-1.5 mt-auto">
                  {actor.liked_by?.map(member => (
                    <span key={member} className="bg-gray-50 border border-gray-200 text-gray-900 text-sm font-bold px-3 py-1.5 rounded-full shadow-sm">{member}</span>
                  ))}
                </div>
              </div>
              
              {/* 🚨 [수정 버튼] 로그인 시에만 노출 */}
              {isLoggedIn && (
                <div className="mt-4 pt-4 border-t border-gray-50 flex justify-between">
                  <button onClick={() => startEditing(actor)} className="text-blue-500 text-xs font-bold hover:underline">수정</button>
                  <button onClick={async () => { if(confirm("삭제하시겠습니까?")) await deleteActor(actor.id); window.location.reload(); }} className="text-gray-400 text-xs font-bold hover:text-red-500">삭제</button>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* 모달 창 (기존과 동일) */}
      {selectedActor && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-md z-50 flex items-start md:items-center justify-center p-4 overflow-y-auto animate-in fade-in duration-200" onClick={() => setSelectedActor(null)}>
          <div className="bg-white rounded-3xl w-full max-w-4xl my-8 overflow-hidden shadow-2xl relative animate-in zoom-in-95 duration-200" onClick={e => e.stopPropagation()}>
            <button onClick={() => setSelectedActor(null)} className="absolute top-6 right-6 w-10 h-10 flex items-center justify-center bg-gray-100 rounded-full text-gray-600 font-bold hover:bg-gray-200 hover:scale-110 transition z-10">✕</button>
            <div className="max-h-[calc(100dvh-6rem)] overflow-y-auto overscroll-contain md:max-h-none md:overflow-visible md:overscroll-auto">
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
                    <span key={member} className="bg-gray-100 border border-gray-200 text-black text-sm font-bold px-4 py-2 rounded-full">{member} Pick</span>
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
              </div>
            </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
