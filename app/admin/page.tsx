'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '../../src/lib/supabase/client'

export default function AdminPage() {
  const [formData, setFormData] = useState({
    title: '', category: '영화', viewing_period: '',
    m1_review: '', m1_rating: 0, m1_date: '',
    m2_review: '', m2_rating: 0, m2_date: '',
    m3_review: '', m3_rating: 0, m3_date: ''
  });
  const [file, setFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const router = useRouter()
  const supabase = createClient()

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'number' ? Number(value) : value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title) { alert('제목은 필수입니다!'); return; }
    setIsUploading(true);

    let finalImageUrl = '';
    if (file) {
      const fileName = `${Date.now()}_${Math.random().toString(36).substring(7)}`;
      const { data: uploadData } = await supabase.storage.from('posters').upload(fileName, file);
      if (uploadData) {
        const { data } = supabase.storage.from('posters').getPublicUrl(fileName);
        finalImageUrl = data.publicUrl;
      }
    }

    const { error } = await supabase.from('works').insert([{
      ...formData,
      m1_rating: Number(formData.m1_rating),
      m2_rating: Number(formData.m2_rating),
      m3_rating: Number(formData.m3_rating),
      poster_url: finalImageUrl,
      average_rating: (Number(formData.m1_rating) + Number(formData.m2_rating) + Number(formData.m3_rating)) / 3
    }]);

    setIsUploading(false);
    if (!error) { alert('등록 성공!'); router.push('/'); }
    else { alert('에러: ' + error.message); }
  };

  return (
    <div className="max-w-2xl mx-auto py-12 px-4">
      <h1 className="text-3xl font-black mb-8 italic">New Record 🎬</h1>
      <form onSubmit={handleSubmit} className="space-y-6 bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-xl text-black">
        <div>
          <label className="block text-[10px] font-black uppercase mb-2 ml-1 text-gray-400">Title</label>
          <input name="title" type="text" required value={formData.title} onChange={handleChange} className="w-full bg-gray-50 p-4 rounded-2xl outline-none" />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <select name="category" value={formData.category} onChange={handleChange} className="bg-gray-50 p-4 rounded-2xl font-bold">
            <option value="영화">🎬 영화</option>
            <option value="드라마">📺 드라마</option>
          </select>
          <input name="viewing_period" type="text" value={formData.viewing_period} onChange={handleChange} className="bg-gray-50 p-4 rounded-2xl font-bold" placeholder="YYYY-MM" />
        </div>
        <input type="file" accept="image/*" onChange={(e) => e.target.files && setFile(e.target.files[0])} className="w-full text-xs text-gray-400" />

        {[1, 2, 3].map((n) => (
          <div key={n} className="pt-6 border-t border-gray-50">
            <h3 className="font-black text-sm mb-4">Member {n}</h3>
            <textarea name={`m${n}_review`} value={(formData as any)[`m${n}_review`]} onChange={handleChange} className="w-full bg-gray-50 p-4 rounded-2xl h-24 mb-3 outline-none" placeholder="감상평" />
            <div className="grid grid-cols-2 gap-4">
              <input name={`m${n}_rating`} type="number" step="0.5" value={(formData as any)[`m${n}_rating`]} onChange={handleChange} className="bg-gray-50 p-4 rounded-2xl font-black" placeholder="평점" />
              <input name={`m${n}_date`} type="text" value={(formData as any)[`m${n}_date`]} onChange={handleChange} className="bg-gray-50 p-4 rounded-2xl" placeholder="날짜" />
            </div>
          </div>
        ))}
        <button type="submit" disabled={isUploading} className="w-full py-5 bg-black text-white rounded-[2rem] font-black shadow-2xl hover:bg-blue-600 transition-all">
          {isUploading ? 'SAVING...' : 'SAVE RECORD'}
        </button>
      </form>
    </div>
  );
}