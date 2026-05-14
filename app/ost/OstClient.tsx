"use client";

import { useState, useTransition } from "react";

type Ost = {
  id: string;
  title: string;
  embed_url: string;
  description: string;
};

type Props = {
  initialOst: Ost[];
  deleteOst: (id: string) => Promise<void>;
  saveOst: (formData: FormData, id?: string) => Promise<void>;
  isLoggedIn: boolean;
};

export default function OstClient({ initialOst, deleteOst, saveOst, isLoggedIn }: Props) {
  const [isPending, startTransition] = useTransition();
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingOst, setEditingOst] = useState<Ost | null>(null);

  const handleDelete = (id: string) => {
    if (!confirm("정말 삭제하시겠습니까?")) return;
    setDeletingId(id);
    startTransition(async () => {
      await deleteOst(id);
      setDeletingId(null);
    });
  };

  const openModal = (ost?: Ost) => {
    setEditingOst(ost || null);
    setIsModalOpen(true);
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    startTransition(async () => {
      await saveOst(formData, editingOst?.id);
      setIsModalOpen(false);
    });
  };

  return (
    <>
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-black italic">OST</h1>
        {isLoggedIn && (
          <button 
            onClick={() => openModal()} 
            className="bg-white text-black px-4 py-2 rounded-full font-bold hover:bg-neutral-200 transition text-sm md:text-base shadow-md"
          >
            + NEW OST
          </button>
        )}
      </div>

      {initialOst.length === 0 ? (
        <p className="text-neutral-500">등록된 OST가 없습니다.</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {initialOst.map((ost) => (
            <div 
              key={ost.id} 
              className={`relative group bg-neutral-900 border border-neutral-800 rounded-xl overflow-hidden transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl hover:border-neutral-700 flex flex-col ${deletingId === ost.id ? 'opacity-50 pointer-events-none' : ''}`}
            >
              <div className="aspect-video w-full relative bg-black border-b border-neutral-800">
                {ost.embed_url ? (
                  <iframe 
                    src={ost.embed_url} 
                    title={ost.title}
                    className="w-full h-full border-0"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
                    allowFullScreen
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-neutral-800 font-bold text-sm tracking-widest">NO MEDIA</div>
                )}
                
                {isLoggedIn && (
                  <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3 backdrop-blur-sm z-10 pointer-events-none">
                    <button 
                      onClick={() => openModal(ost)}
                      className="bg-white/20 hover:bg-white/40 text-white px-4 py-2 rounded-full font-bold transition text-sm pointer-events-auto"
                    >
                      수정
                    </button>
                    <button 
                      onClick={() => handleDelete(ost.id)}
                      className="bg-rose-500/50 hover:bg-rose-500 text-white px-4 py-2 rounded-full font-bold transition text-sm pointer-events-auto"
                    >
                      {deletingId === ost.id ? '삭제중...' : '삭제'}
                    </button>
                  </div>
                )}
              </div>
              
              <div className="p-5 flex-grow bg-neutral-900">
                <h3 className="font-bold text-lg text-white truncate">{ost.title}</h3>
                {ost.description && <p className="text-sm text-neutral-400 mt-2 line-clamp-3 leading-relaxed">{ost.description}</p>}
              </div>
            </div>
          ))}
        </div>
      )}

      {isModalOpen && isLoggedIn && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
          <div className="bg-neutral-900 border border-neutral-800 p-6 rounded-xl w-full max-w-md relative shadow-2xl">
            <h2 className="text-xl font-black mb-6 italic">{editingOst ? "EDIT OST" : "NEW OST"}</h2>
            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
              <input 
                type="text" 
                name="title" 
                defaultValue={editingOst?.title} 
                placeholder="곡명 / 제목 (필수)" 
                required 
                className="bg-neutral-950 border border-neutral-800 rounded-lg p-3 text-white outline-none focus:border-neutral-500 transition"
              />
              <input 
                type="url" 
                name="embed_url" 
                defaultValue={editingOst?.embed_url} 
                placeholder="임베드 URL (YouTube 퍼가기 링크 등)" 
                className="bg-neutral-950 border border-neutral-800 rounded-lg p-3 text-white outline-none focus:border-neutral-500 transition"
              />
              <textarea 
                name="description" 
                defaultValue={editingOst?.description} 
                placeholder="음악에 대한 코멘트 (선택)" 
                className="bg-neutral-950 border border-neutral-800 rounded-lg p-3 text-white outline-none focus:border-neutral-500 transition h-24 resize-none"
              />
              <div className="flex justify-end gap-3 mt-4">
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
                  className="bg-white text-black px-6 py-2 rounded-lg font-black hover:bg-neutral-200 transition disabled:opacity-50"
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