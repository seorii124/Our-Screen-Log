'use client'

import { useState, useEffect, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { createClient } from '../../src/lib/supabase/client'

function EditForm() {
  const [formData, setFormData] = useState({
    title: '', category: '영화', viewing_period: '', // 4번: 완료일 데이터 확실히 포함!
    m1_review: '', m1_rating: 0, m1_date: '',
    m2_review: '', m2_rating: 0, m2_date: '',
    m3_review: '', m3_rating: 0, m3_date: '',
    poster_url: '' 
  });
  const [file, setFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);

  // 2번: 권한 관리를 위한 상태
  const [isAdmin, setIsAdmin] = useState(false);
  const [myMemberNum, setMyMemberNum] = useState<number>(0);

  const router = useRouter()
  const searchParams = useSearchParams()
  const supabase = createClient()

  useEffect(() => {
    const id = searchParams.get('id');
    if (id) {
      setEditId(id);
      fetchOriginalData(id);
    }
    checkUser();
  }, [searchParams]);

  async function checkUser() {
    const { data: { user } } = await supabase.auth.getUser();
    if (user && user.email) {
      // 캡처에서 확인된 관리자님 이메일
      if (user.email === 'seorii40@gmail.com') {
        setIsAdmin(true);
      } else {
        // [중요] 멤버들이 가입한 실제 이메일로 바꿔주세요! (2번 완벽 해결)
        if (user.email === 'onlyziyu76@gmail.com') setMyMemberNum(1);
        else if (user.email === 'mooddnnaa@gmail.com') setMyMemberNum(2);
        else if (user.email === 'seorii40@gmail.com') setMyMemberNum(3);
      }
    }
  }

  async function fetchOriginalData(id: string) {
    const { data, error } = await supabase.from('works').select('*').eq('id', id).single();
    if (data && !error) {
      // 3 & 4번: 기존 데이터(완료일, 날짜, 평점 등)가 무조건 세팅되도록 덮어씌움
      setFormData({
        title: data.title || '',
        category: data.category || '영화',
        viewing_period: data.viewing_period || '', // 완료일 누락 해결
        m1_review: data.m1_review || '', m1_rating: data.m1_rating || 0, m1_date: data.m1_date || '',
        m2_review: data.m2_review || '', m2_rating: data.m2_rating || 0, m2_date: data.m2_date || '',
        m3_review: data.m3_review || '', m3_rating: data.m3_rating || 0, m3_date: data.m3_date || '',
        poster_url: data.poster_url || ''
      });
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'number' ? Number(value) : value
    }));
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

    // [핵심] insert가 아니라 update로 덮어쓰기!
    const { error } = await supabase.from('works').update({
      ...formData,
      m1_rating: Number(formData.m1_rating),
      m2_rating: Number(formData.m2_rating),
      m3_rating: Number(formData.m3_rating),
      poster_url: finalImageUrl,
      average_rating: (Number(formData.m1_rating) + Number(formData.m2_rating) + Number(formData.m3_rating)) / 3
    }).eq('id', editId); 

    setIsUploading(false);
    if (!error) { 
      alert('수정 성공!'); 
      router.push(`/works/${editId}`); // 상세 페이지로 돌아가기
      router.refresh();
    }
    else { alert('에러: ' + error.message); }
  };

  return (
    <div className="max-w-2xl mx-auto py-12 px-4">
      <h1 className="text-3xl font-black mb-8 italic">Edit Record ✍️</h1>
      <form onSubmit={handleSubmit} className="space-y-6 bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-xl text-black">
        
        {/* 관리자만 기본 정보(제목, 완료일 등) 수정 가능하게 제어 */}
        <div>
          <label className="block text-[10px] font-black uppercase mb-2 ml-1 text-gray-400">Title</label>
          <input name="title" type="text" required value={formData.title} onChange={handleChange} disabled={!isAdmin} className="w-full bg-gray-50 p-4 rounded-2xl outline-none disabled:opacity-50" />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <select name="category" value={formData.category} onChange={handleChange} disabled={!isAdmin} className="bg-gray-50 p-4 rounded-2xl font-bold disabled:opacity-50">
            <option value="영화">🎬 영화</option>
            <option value="드라마">📺 드라마</option>
          </select>
          {/* 완료일 데이터 유지 */}
          <input name="viewing_period" type="text" value={formData.viewing_period} onChange={handleChange} disabled={!isAdmin} className="bg-gray-50 p-4 rounded-2xl font-bold disabled:opacity-50" placeholder="YYYY-MM (완료일)" />
        </div>
        
        {isAdmin && (
          <input type="file" accept="image/*" onChange={(e) => e.target.files && setFile(e.target.files[0])} className="w-full text-xs text-gray-400" />
        )}

        {/* 2번: 멤버 1, 2, 3 영역 제어 */}
        {[1, 2, 3].map((n) => {
          // 관리자거나, 로그인한 내 번호랑 일치할 때만 활성화
          const isMeOrAdmin = isAdmin || myMemberNum === n;

          return (
            <div key={n} className={`pt-6 border-t border-gray-50 ${isMeOrAdmin ? '' : 'opacity-40 pointer-events-none'}`}>
              <h3 className="font-black text-sm mb-4">
                Member {n} {isMeOrAdmin && !isAdmin && <span className="text-blue-500">(내 작성칸)</span>}
              </h3>
              <textarea 
                name={`m${n}_review`} 
                value={(formData as any)[`m${n}_review`]} 
                onChange={handleChange} 
                disabled={!isMeOrAdmin}
                className="w-full bg-gray-50 p-4 rounded-2xl h-24 mb-3 outline-none disabled:bg-gray-100" 
                placeholder="감상평" 
              />
              <div className="grid grid-cols-2 gap-4">
                <input 
                  name={`m${n}_rating`} 
                  type="number" 
                  step="0.5" 
                  value={(formData as any)[`m${n}_rating`]} 
                  onChange={handleChange} 
                  disabled={!isMeOrAdmin}
                  className="bg-gray-50 p-4 rounded-2xl font-black disabled:bg-gray-100" 
                  placeholder="평점" 
                />
                <input 
                  name={`m${n}_date`} 
                  type="text" 
                  value={(formData as any)[`m${n}_date`]} 
                  onChange={handleChange} 
                  disabled={!isMeOrAdmin}
                  className="bg-gray-50 p-4 rounded-2xl disabled:bg-gray-100" 
                  placeholder="날짜" 
                />
              </div>
            </div>
          );
        })}
        <button type="submit" disabled={isUploading} className="w-full py-5 bg-black text-white rounded-[2rem] font-black shadow-2xl hover:bg-blue-600 transition-all">
          {isUploading ? 'UPDATING...' : 'UPDATE RECORD'}
        </button>
      </form>
    </div>
  );
}

// useSearchParams를 쓰려면 꼭 Suspense로 감싸야 합니다.
export default function EditPage() {
  return (
    <Suspense fallback={<div className="p-12 text-center font-bold">데이터를 불러오는 중...</div>}>
      <EditForm />
    </Suspense>
  );
}