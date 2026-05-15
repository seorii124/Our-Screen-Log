"use client";

import { useState } from "react";

interface Line {
  id: string;
  work_id: number;
  work_title: string;
  content: string;
  source: string | null;
  created_by: string;
}

interface Work {
  id: number;
  title: string;
}

export default function LinesClient({
  initialLines,
  works,
  deleteLine,
  saveLine,
  updateLine,
  isLoggedIn,
}: {
  initialLines: Line[];
  works: Work[];
  deleteLine: (id: string) => Promise<void>;
  saveLine: (data: any) => Promise<void>;
  updateLine: (id: string, data: any) => Promise<void>;
  isLoggedIn: boolean;
}) {
  const [isEditing, setIsEditing] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({ work_id: '', work_title: '', content: '', source: '' });

  const startEditing = (line: Line) => {
    setEditingId(line.id);
    setFormData({
      work_id: String(line.work_id),
      work_title: line.work_title,
      content: line.content,
      source: line.source || ''
    });
    setIsEditing(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleWorkSelect = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selected = works.find(w => w.id === Number(e.target.value));
    if (selected) {
      setFormData(prev => ({ ...prev, work_id: String(selected.id), work_title: selected.title }));
    } else {
      setFormData(prev => ({ ...prev, work_id: '', work_title: '' }));
    }
  };

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    try {
      const payload = {
        work_id: Number(formData.work_id),
        work_title: formData.work_title,
        content: formData.content,
        source: formData.source || null,
      };

      if (editingId) await updateLine(editingId, payload);
      else await saveLine(payload);

      setIsEditing(false);
      setEditingId(null);
      setFormData({ work_id: '', work_title: '', content: '', source: '' });
      window.location.reload();
    } catch (err) {
      alert("처리 중 오류가 발생했습니다.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="pb-20">
      <div className="flex flex-col md:flex-row md:justify-between md:items-end mb-12 border-b border-gray-100 pb-8 gap-6">
        <div>
          <h1 className="text-4xl font-black text-black mb-2 tracking-tight uppercase">Lines</h1>
          <p className="text-xs font-bold text-gray-400 tracking-widest uppercase">Memorable Movie & Drama Quotes</p>
        </div>
        {isLoggedIn && (
          <button 
            onClick={() => { setIsEditing(!isEditing); setEditingId(null); setFormData({ work_id: '', work_title: '', content: '', source: '' }); }} 
            className="bg-black text-white px-8 py-3.5 rounded-full font-bold shadow-lg hover:bg-gray-800 transition"
          >
            {isEditing ? "CLOSE" : "+ ADD LINE"}
          </button>
        )}
      </div>

      {isEditing && (
        <form onSubmit={handleSubmit} className="bg-white p-10 rounded-[32px] border border-gray-200 shadow-2xl mb-16 space-y-6">
          <h2 className="text-xl font-black">{editingId ? "수정하기" : "새 대사 등록"}</h2>
          <div className="grid md:grid-cols-2 gap-6">
            <div className="bg-gray-50 p-4 rounded-2xl border border-gray-200">
              <label className="block text-[10px] font-black text-gray-400 mb-2 uppercase">Work Title</label>
              <select required value={formData.work_id} onChange={handleWorkSelect} className="w-full bg-transparent text-black font-bold outline-none">
                <option value="">작품을 선택하세요</option>
                {works.map(w => <option key={w.id} value={w.id}>{w.title}</option>)}
              </select>
            </div>
            <div className="bg-gray-50 p-4 rounded-2xl border border-gray-200">
              <label className="block text-[10px] font-black text-gray-400 mb-2 uppercase">Source / Time</label>
              <input type="text" placeholder="예: 1화 32분, ep.3" value={formData.source} onChange={e => setFormData(prev => ({ ...prev, source: e.target.value }))} className="w-full bg-transparent text-black outline-none font-bold" />
            </div>
          </div>
          <textarea required placeholder="기억에 남는 대사를 입력하세요" value={formData.content} onChange={e => setFormData(prev => ({ ...prev, content: e.target.value }))} rows={4} className="w-full border border-gray-200 bg-gray-50 p-6 rounded-3xl outline-none focus:border-black font-bold text-xl leading-relaxed"></textarea>
          <button type="submit" disabled={loading} className="w-full bg-black text-white font-black py-4 rounded-2xl hover:bg-gray-800 transition shadow-md disabled:opacity-50">
            {loading ? "SAVING..." : "SAVE ARCHIVE"}
          </button>
        </form>
      )}

      <div className="space-y-10">
        {initialLines.map(line => (
          <div key={line.id} className="relative bg-white rounded-[40px] p-10 md:p-14 border border-gray-100 hover:border-gray-300 shadow-sm hover:shadow-xl transition-all duration-500 group overflow-hidden">
            {/* 시각적 요소: 배경 따옴표 */}
            <div className="absolute -top-4 left-6 text-[160px] font-serif text-gray-50 leading-none select-none -z-10 opacity-60">“</div>
            
            <div className="relative z-10">
              <div className="flex justify-between items-start mb-8">
                <span className="bg-black text-white text-[10px] font-black px-4 py-2 rounded-full uppercase tracking-widest">
                  {line.work_title}
                </span>
                {isLoggedIn && (
                  <div className="flex gap-4 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button onClick={() => startEditing(line)} className="text-blue-500 text-xs font-bold hover:underline">Edit</button>
                    <button onClick={async () => { if(confirm("삭제하시겠습니까?")) await deleteLine(line.id); window.location.reload(); }} className="text-gray-400 text-xs font-bold hover:text-red-500">Delete</button>
                  </div>
                )}
              </div>

              {/* 🚨 가독성 최적화: 기울임 제거, 굵은 정자체 */}
              <p className="text-2xl md:text-4xl font-black text-black leading-tight break-keep mb-8">
                {line.content}
              </p>

              {line.source && (
                <p className="text-sm text-gray-400 font-bold flex items-center gap-2">
                  <span className="w-6 h-[2px] bg-gray-200"></span>
                  {line.source}
                </p>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}