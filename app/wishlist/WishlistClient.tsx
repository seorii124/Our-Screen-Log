"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";

type WishlistItem = {
  id: string;
  title: string;
  poster_url: string;
  expectation: string;
};

type Props = {
  initialData: WishlistItem[];
  isLoggedIn: boolean;
  saveWishlist: (formData: FormData, id?: string) => Promise<void>;
  deleteWishlist: (id: string) => Promise<void>;
};

export default function WishlistClient({ initialData, isLoggedIn, saveWishlist, deleteWishlist }: Props) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [processingId, setProcessingId] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<WishlistItem | null>(null);

  // 모달 제어
  const openModal = (item?: WishlistItem) => {
    setEditingItem(item || null);
    setIsModalOpen(true);
  };

  // 등록/수정 제출
  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    startTransition(async () => {
      await saveWishlist(formData, editingItem?.id);
      setIsModalOpen(false);
    });
  };

  // 단순 삭제
  const handleDelete = (id: string) => {
    if (!confirm("위시리스트에서 삭제하시겠습니까?")) return;
    setProcessingId(id);
    startTransition(async () => {
      await deleteWishlist(id);
      setProcessingId(null);
    });
  };

  // 관람 완료 (위시리스트에서 삭제 후 아카이브 등록창으로 이동)
  const handleWatchComplete = (item: WishlistItem) => {
    setProcessingId(item.id);
    startTransition(async () => {
      await deleteWishlist(item.id);
      const params = new URLSearchParams();
      params.set("title", item.title);
      if (item.poster_url) params.set("poster_url", item.poster_url);
      router.push(`/works/new?${params.toString()}`);
    });
  };

  return (
    <>
      <div className="flex justify-between items-center mb-8 h-10">
        <h1 className="text-3xl font-black italic">Wishlist</h1>
        {isLoggedIn && (
          <button 
            onClick={() => openModal()} 
            className="bg-white text-black px-4 py-2 rounded-full font-bold hover:bg-neutral-200 transition text-sm"
          >
            + NEW WISHLIST
          </button>
        )}
      </div>

      {initialData.length === 0 ? (
        <p className="text-neutral-500">아직 보고싶은 작품이 없습니다.</p>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
          {initialData.map((item) => (
            <div 
              key={item.id} 
              className={`relative group bg-neutral-800 rounded-xl overflow-hidden transition flex flex-col h-full ${processingId === item.id ? 'opacity-50 pointer-events-none' : ''}`}
            >
              <div className="h-48 md:h-64 bg-neutral-900 relative shrink-0">
                {item.poster_url ? (
                  <img src={item.poster_url} alt={item.title} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-neutral-700 font-bold">NO POSTER</div>
                )}
                
                {isLoggedIn && (
                  <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3 backdrop-blur-sm">
                    <button onClick={() => openModal(item)} className="bg-white/20 hover:bg-white/40 text-white px-3 py-2 rounded-full font-bold transition text-xs">수정</button>
                    <button onClick={() => handleDelete(item.id)} className="bg-rose-500/50 hover:bg-rose-500 text-white px-3 py-2 rounded-full font-bold transition text-xs">삭제</button>
                  </div>
                )}
              </div>
              
              <div className="p-4 flex flex-col grow">
                <h3 className="font-bold text-lg text-white mb-1">{item.title}</h3>
                {item.expectation && <p className="text-xs text-neutral-400 line-clamp-2 grow">{item.expectation}</p>}
                
                {isLoggedIn && (
                  <button 
                    onClick={() => handleWatchComplete(item)}
                    className="mt-4 w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-2 rounded transition text-sm"
                  >
                    관람 완료 (아카이브로)
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {isModalOpen && isLoggedIn && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
          <div className="bg-neutral-900 border border-neutral-800 p-6 rounded-xl w-full max-w-md relative">
            <h2 className="text-xl font-black mb-6 italic">{editingItem ? "EDIT WISHLIST" : "NEW WISHLIST"}</h2>
            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
              <input type="text" name="title" defaultValue={editingItem?.title} placeholder="작품 제목 (필수)" required className="bg-neutral-950 border border-neutral-800 rounded p-3 text-white outline-none focus:border-blue-500 transition" />
              <input type="url" name="poster_url" defaultValue={editingItem?.poster_url} placeholder="포스터 이미지 URL (선택)" className="bg-neutral-950 border border-neutral-800 rounded p-3 text-white outline-none focus:border-blue-500 transition" />
              <textarea name="expectation" defaultValue={editingItem?.expectation} placeholder="기대평 (선택)" className="bg-neutral-950 border border-neutral-800 rounded p-3 text-white outline-none focus:border-blue-500 transition h-24 resize-none" />
              
              <div className="flex justify-end gap-3 mt-2">
                <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 font-bold text-neutral-500 hover:text-white transition">취소</button>
                <button type="submit" disabled={isPending} className="bg-white text-black px-6 py-2 rounded font-black hover:bg-neutral-200 transition disabled:opacity-50">
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