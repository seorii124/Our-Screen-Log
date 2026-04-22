'use client'

import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { createClient } from '../../../../src/lib/supabase/client'

export default function EditPage() {
  const [formData, setFormData] = useState({
    title: '', category: '영화', viewing_period: '',
    m1_review: '', m1_rating: 0, m1_date: '',
    m2_review: '', m2_rating: 0, m2_date: '',
    m3_review: '', m3_rating: 0, m3_date: '',
    poster_url: '' 
  });
  const [file, setFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  
  const [isAdmin, setIsAdmin] = useState(false);
  const [myMemberNum, setMyMemberNum] = useState<number>(0);

  const router = useRouter()
  const params = useParams()
  const editId = params.id as string
  const supabase = createClient()

  useEffect(() => {
    if (editId) fetchOriginalData(editId);
    checkUser();
  }, [editId]);

  async function checkUser() {
    const { data: { user } } = await supabase.auth.getUser();
    if (user && user.email) {
      if (user.email === 'seorii40@gmail.com') { 
        setMyMemberNum(1); 
        setIsAdmin(true); 
      }
      else if (user.email === 'onlyziyu76@gmail.com') { 
        setMyMemberNum(2); 
      }
      else if (user.email === 'mooddnnaa@gmail.com') { 
        setMyMemberNum(3); 
      }
    }
  }

  async function fetchOriginalData(id: string) {
    const { data, error } = await supabase.from('works').select('*').eq('id', id).single();
    if (data && !error) {
      setFormData({
        title: data.title || '', category: data.category || '영화', viewing_period: data.viewing_period || '',
        m1_review: data.m1_review || '', m1_rating: data.m1_rating || 0, m1_date: data.m1_date || '',
        m2_review: data.m2_review || '', m2_rating: data.m2_rating || 0, m2_date: data.m2_date || '',
        m3_review: data.m3_review || '', m3_rating: data.m3_rating || 0, m3_date: data.m3_date || '',
        poster_url: data.poster_url || ''
      });
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    setFormData(prev => ({ ...prev, [name]: type === 'number' ? Number(value) : value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editId) return;
    setIsUploading(true);

    let finalImageUrl = formData.poster_url;
    if (file) {
      const fileName = `${Date.now()}_${Math.random().toString(36).substring(7)}`;
      const { data: uploadData } = await supabase.storage.from('posters').upload(fileName, file);
      if (uploadData) {
        const { data } = supabase.storage.from('posters').getPublicUrl(fileName);
        finalImageUrl = data.publicUrl;
      }
    }

    const { error } = await supabase.from('works').update({
      ...formData,
      m1_rating: Number(formData.m1_rating), m2_rating: Number(formData.m2_rating), m3_rating: Number(formData.m3_rating),
      poster_url: finalImageUrl,
      average_rating: (Number(formData.m1_rating) + Number(formData.m2_rating) + Number(formData.m3_rating)) / 3
    }).eq('id', editId); 

    setIsUploading(false);
    if (!error) { 
      alert('수정 성공!'); 
      router.push(`/works/${editId}`); 
      router.refresh();
    } else { alert('에러: ' + error.message); }
  };

  return (
    <div className="max-w-2xl mx-auto py-12 px-4 min-h-screen">
      <h1 className="text-3xl font-black mb-8 italic text-white">Edit Record ✍️</h1>
      <form onSubmit={handleSubmit} className="space-y-6 bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-xl text-black">
        
        <div>
          <label className="block text-[10px] font-black uppercase mb-2 ml-1 text-gray-400">Title</label>
          <input name="title" type="text" required value={formData.title} onChange={handleChange} disabled={!isAdmin} className="w-full bg-gray-50 p-4 rounded-2xl outline-none disabled:opacity-50" />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <select name="category" value={formData.category} onChange={handleChange} disabled={!isAdmin} className="bg-gray-50 p-4 rounded-2xl font-bold disabled:opacity-50">
            <option value="영화">🎬 영화</option>
            <option value="드라마">📺 드라마</option>
          </select>
          <input name="viewing_period" type="text" value={formData.viewing_period} onChange={handleChange} disabled={!isAdmin} className="bg-gray-50 p-4 rounded-2xl font-bold disabled:opacity-50" placeholder="YYYY-MM (선정 월)" />
        </div>
        {isAdmin && <input type="file" accept="image/*" onChange={(e) => e.target.files && setFile(e.target.files[0])} className="w-full text-xs text-gray-400" />}

        {[1, 2, 3].map((n) => {
          const isMeOrAdmin = isAdmin || myMemberNum === n;
          return (
            <div key={n} className={`pt-6 border-t border-gray-50 ${isMeOrAdmin ? '' : 'opacity-40 pointer-events-none'}`}>
              <h3 className="font-black text-sm mb-4">Member {n} {isMeOrAdmin && !isAdmin && <span className="text-blue-500">(내 작성칸)</span>}</h3>
              <textarea name={`m${n}_review`} value={(formData as any)[`m${n}_review`]} onChange={handleChange} disabled={!isMeOrAdmin} className="w-full bg-gray-50 p-4 rounded-2xl h-24 mb-3 outline-none disabled:bg-gray-100" placeholder="감상평" />
              <div className="grid grid-cols-2 gap-4">
                <input name={`m${n}_rating`} type="number" step="0.5" value={(formData as any)[`m${n}_rating`]} onChange={handleChange} disabled={!isMeOrAdmin} className="bg-gray-50 p-4 rounded-2xl font-black disabled:bg-gray-100" placeholder="평점" />
                {/* ★ 완료일 형식 힌트 적용 ★ */}
                <input name={`m${n}_date`} type="text" value={(formData as any)[`m${n}_date`]} onChange={handleChange} disabled={!isMeOrAdmin} className="bg-gray-50 p-4 rounded-2xl disabled:bg-gray-100" placeholder="YYYY_MM_DD (완료일)" />
              </div>
            </div>
          );
        })}
        <button type="submit" disabled={isUploading} className="w-full py-5 bg-blue-600 text-white rounded-[2rem] font-black shadow-2xl hover:bg-blue-700 transition-all">
          {isUploading ? 'UPDATING...' : 'UPDATE RECORD'}
        </button>
      </form>
    </div>
  );
}