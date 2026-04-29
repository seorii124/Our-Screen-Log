"use client";

import { useState, useTransition } from "react";

type Actor = {
  id: string;
  name: string;
  profile_image_url: string;
  description: string;
};

type Props = {
  initialActors: Actor[];
  deleteActor: (id: string) => Promise<void>;
  saveActor: (formData: FormData, id?: string) => Promise<void>;
  isLoggedIn: boolean; // [수정된 부분] 로그인 상태 프롭스 추가
};

export default function ActorsClient({ initialActors, deleteActor, saveActor, isLoggedIn }: Props) {
  const [isPending, startTransition] = useTransition();
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingActor, setEditingActor] = useState<Actor | null>(null);

  const handleDelete = (id: string) => {
    if (!confirm("정말 삭제하시겠습니까?")) return;
    setDeletingId(id);
    startTransition(async () => {
      await deleteActor(id);
      setDeletingId(null);
    });
  };

  const openModal = (actor?: Actor) => {
    setEditingActor(actor || null);
    setIsModalOpen(true);
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    startTransition(async () => {
      await saveActor(formData, editingActor?.id);
      setIsModalOpen(false);
    });
  };

  return (
    <>
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-black italic">Actors</h1>
        {/* [수정된 부분] 로그인한 사용자에게만 등록 버튼 노출 */}
        {isLoggedIn && (
          <button 
            onClick={() => openModal()} 
            className="bg-white text-black px-4 py-2 rounded-full font-bold hover:bg-neutral-200 transition text-sm md:text-base"
          >
            + NEW ACTOR
          </button>
        )}
      </div>

      {initialActors.length === 0 ? (
        <p className="text-neutral-500">등록된 배우가 없습니다.</p>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
          {initialActors.map((actor) => (
            <div 
              key={actor.id} 
              className={`relative group bg-neutral-800 rounded-xl overflow-hidden transition ${deletingId === actor.id ? 'opacity-50 pointer-events-none' : ''}`}
            >
              <div className="h-56 md:h-72 bg-neutral-900 relative">
                {actor.profile_image_url ? (
                  <img src={actor.profile_image_url} alt={actor.name} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-neutral-700 font-bold">NO IMAGE</div>
                )}
                
                {/* [수정된 부분] 로그인한 사용자에게만 수정/삭제 오버레이 노출 */}
                {isLoggedIn && (
                  <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3 backdrop-blur-sm">
                    <button 
                      onClick={() => openModal(actor)}
                      className="bg-white/20 hover:bg-white/40 text-white px-4 py-2 rounded-full font-bold transition text-sm"
                    >
                      수정
                    </button>
                    <button 
                      onClick={() => handleDelete(actor.id)}
                      className="bg-rose-500/50 hover:bg-rose-500 text-white px-4 py-2 rounded-full font-bold transition text-sm"
                    >
                      {deletingId === actor.id ? '삭제중...' : '삭제'}
                    </button>
                  </div>
                )}
              </div>
              
              <div className="p-4">
                <h3 className="font-bold text-lg text-white">{actor.name}</h3>
                {actor.description && <p className="text-xs text-neutral-400 mt-1 line-clamp-2">{actor.description}</p>}
              </div>
            </div>
          ))}
        </div>
      )}

      {isModalOpen && isLoggedIn && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
          <div className="bg-neutral-900 border border-neutral-800 p-6 rounded-xl w-full max-w-md relative">
            <h2 className="text-xl font-black mb-6 italic">{editingActor ? "EDIT ACTOR" : "NEW ACTOR"}</h2>
            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
              <input 
                type="text" 
                name="name" 
                defaultValue={editingActor?.name} 
                placeholder="배우 이름 (필수)" 
                required 
                className="bg-neutral-950 border border-neutral-800 rounded p-3 text-white outline-none focus:border-neutral-500 transition"
              />
              <input 
                type="url" 
                name="profile_image_url" 
                defaultValue={editingActor?.profile_image_url} 
                placeholder="프로필 이미지 URL (선택)" 
                className="bg-neutral-950 border border-neutral-800 rounded p-3 text-white outline-none focus:border-neutral-500 transition"
              />
              <textarea 
                name="description" 
                defaultValue={editingActor?.description} 
                placeholder="배우 설명 (선택)" 
                className="bg-neutral-950 border border-neutral-800 rounded p-3 text-white outline-none focus:border-neutral-500 transition h-24 resize-none"
              />
              <div className="flex justify-end gap-3 mt-2">
                <button 
                  type="button" 
                  onClick={() => setIsModalOpen(false)} 
                  className="px-4 py-2 font-bold text-neutral-500 hover:text-white transition"
                >
                  취소
                </button>
                <button 
                  type="submit" 
                  disabled={isPending}
                  className="bg-white text-black px-6 py-2 rounded font-black hover:bg-neutral-200 transition disabled:opacity-50"
                >
                  {isPending ? "저장 중..." : "저장"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}