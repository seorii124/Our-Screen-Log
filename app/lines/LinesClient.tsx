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
      <div className="flex flex-col md:flex-row md:justify-between md:items-end mb-10 border-b border-gray-100 pb-6 gap-4">
        <div>
          <h1 className="text-3xl font-black text-black mb-1 uppercase tracking-tight">Lines</h1>
          <p className="text-sm font-bold text-gray-400">Our Screen Log</p>
        </div>
        {isLoggedIn && (
          <button 
            onClick={() => { setIsEditing(!isEditing); setEditingId(null); setFormData({ work_id: '', work_title: '', content: '', source: '' }); }} 
            className="bg-black text-white px-5 py-2.5 rounded-full text-sm font-bold shadow-md hover:bg-gray-800 transition"
          >
            {isEditing ? "닫기" : "+ 대사 등록"}
          </button>
        )}
      </div>

      {isEditing && (
        <form onSubmit={handleSubmit} className="bg-white p-8 rounded-2xl border border-gray-200 shadow-lg mb-12 space-y-6">
          <h2 className="text-lg font-black">{editingId ? "수정하기" : "새 대사 등록"}</h2>
          <div className="grid md:grid-cols-2 gap-6">
            <div className="bg-gray-50 p-4 rounded-xl border border-gray-200">
              <label className="block text-xs font-bold text-gray-500 mb-2 uppercase">작품 선택</label>
              <select required value={formData.work_id} onChange={handleWorkSelect} className="w-full bg-transparent text-black font-bold outline-none text-sm">
                <option value="">작품을 선택하세요</option>
                {works.map(w => <option key={w.id} value={w.id}>{w.title}</option>)}
              </select>
            </div>
            <div className="bg-gray-50 p-4 rounded-xl border border-gray-200">
              <label className="block text-xs font-bold text-gray-500 mb-2 uppercase">출처 / 시간</label>
              <input type="text" placeholder="예: 1화 32분, ep.3" value={formData.source} onChange={e => setFormData(prev => ({ ...prev, source: e.target.value }))} className="w-full bg-transparent text-black outline-none font-bold text-sm" />
            </div>
          </div>
          <textarea required placeholder="기억에 남는 대사를 입력하세요" value={formData.content} onChange={e => setFormData(prev => ({ ...prev, content: e.target.value }))} rows={4} className="w-full border border-gray-200 bg-gray-50 p-5 rounded-xl outline-none focus:border-black font-medium text-base leading-relaxed"></textarea>
          <button type="submit" disabled={loading} className="w-full bg-black text-white font-bold py-3.5 rounded-xl hover:bg-gray-800 transition shadow-sm disabled:opacity-50">
            {loading ? "저장 중..." : "아카이브에 저장"}
          </button>
        </form>
      )}

      {/* 🚨 노션(Notion) 인용구 스타일 적용 (칸 사이즈 축소, 가독성 강화) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {initialLines.map(line => (
          <div key={line.id} className="bg-white rounded-2xl p-6 border border-gray-200 hover:shadow-md transition-all group flex flex-col justify-between">
            <div>
              <div className="flex justify-between items-center mb-4">
                <span className="bg-gray-100 text-gray-800 text-xs font-bold px-3 py-1.5 rounded-md uppercase tracking-wider">
                  {line.work_title}
                </span>
                
                {isLoggedIn && (
                  <div className="flex gap-3 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button onClick={() => startEditing(line)} className="text-blue-500 text-xs font-bold hover:underline">수정</button>
                    <button onClick={async () => { if(confirm("삭제하시겠습니까?")) await deleteLine(line.id); window.location.reload(); }} className="text-gray-400 text-xs font-bold hover:text-red-500">삭제</button>
                  </div>
                )}
              </div>

              {/* 노션식 인용선(왼쪽 테두리) 및 정갈한 텍스트 렌더링 */}
              <div className="border-l-4 border-gray-300 pl-4 py-1 my-2">
                <p className="text-lg font-medium text-gray-900 leading-relaxed break-keep">
                  {line.content}
                </p>
              </div>
            </div>

            {line.source && (
              <p className="text-xs font-bold text-gray-400 mt-5 text-right">
                — {line.source}
              </p>
            )}
          </div>
        ))}
      </div>
      
      {initialLines.length === 0 && !isEditing && (
        <div className="text-center text-gray-400 py-20 font-bold text-sm">등록된 명대사가 없습니다.</div>
      )}
    </div>
  );
}