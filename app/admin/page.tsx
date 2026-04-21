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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.title) { alert('제목은 필수입니다!'); return; }
    setIsUploading(true)

    let finalImageUrl = ''
    if (file) {
      const fileName = `${Date.now()}_${Math.random().toString(36).substring(7)}`
      const { data: uploadData, error: uploadError } = await supabase.storage.from('posters').upload(fileName, file)
      if (!uploadError) {
        const { data } = supabase.storage.from('posters').getPublicUrl(fileName)
        finalImageUrl = data.publicUrl
      }
    }

    const avgRating = (Number(formData.m1_rating) + Number(formData.m2_rating) + Number(formData.m3_rating)) / 3

    const { error } = await supabase.from('works').insert([{
      ...formData,
      poster_url: finalImageUrl,
      average_rating: Number(avgRating.toFixed(1))
    }])

    setIsUploading(false)
    if (error) { alert('에러: ' + error.message) } 
    else { alert('등록 성공! 🍿'); router.push('/'); router.refresh(); }
  }

  return (
    <div className="max-w-2xl mx-auto py-12 px-4">
      <h1 className="text-3xl font-bold mb-8">새 작품 등록</h1>
      <form onSubmit={handleSubmit} className="space-y-6 bg-white p-8 rounded-3xl border border-gray-100 shadow-sm">
        <div>
          <label className="block text-sm font-bold mb-2">작품 제목</label>
          <input type="text" required value={formData.title} onChange={(e) => setFormData({...formData, title: e.target.value})} className="w-full border p-3 rounded-xl outline-none" />
        </div>
        
        <div>
          <label className="block text-sm font-bold mb-2">분류</label>
          <select value={formData.category} onChange={(e) => setFormData({...formData, category: e.target.value})} className="w-full border p-3 rounded-xl">
            <option value="영화">🎬 영화</option>
            <option value="드라마">📺 드라마</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-bold mb-2 text-blue-600">시청 시기 (예: 2024-02)</label>
          <input type="text" value={formData.viewing_period} onChange={(e) => setFormData({...formData, viewing_period: e.target.value})} className="w-full border p-3 rounded-xl" placeholder="YYYY-MM 형식" />
        </div>

        <div>
          <label className="block text-sm font-bold mb-2">포스터 파일</label>
          <input type="file" accept="image/*" onChange={(e) => e.target.files && setFile(e.target.files[0])} className="w-full text-sm text-gray-500" />
        </div>

        {/* 멤버별 입력창 (데이터 유실 방지) */}
        {[1, 2, 3].map((num) => (
          <div key={num} className="border-t pt-6">
            <h3 className="font-bold mb-3">멤버 {num} 후기</h3>
            <textarea 
              value={(formData as any)[`m${num}_review`]} 
              onChange={(e) => setFormData({...formData, [`m${num}_review`]: e.target.value})} 
              className="w-full border p-3 rounded-xl h-24 mb-2" 
            />
            <div className="flex gap-4">
              <input type="number" step="0.5" placeholder="평점" value={(formData as any)[`m${num}_rating`]} onChange={(e) => setFormData({...formData, [`m${num}_rating`]: e.target.value})} className="border p-2 rounded-lg w-20" />
              <input type="text" placeholder="날짜" value={(formData as any)[`m${num}_date`]} onChange={(e) => setFormData({...formData, [`m${num}_date`]: e.target.value})} className="border p-2 rounded-lg flex-1" />
            </div>
          </div>
        ))}

        <button type="submit" disabled={isUploading} className="w-full py-4 bg-black text-white rounded-2xl font-bold">
          {isUploading ? '저장 중...' : '기록 저장하기'}
        </button>
      </form>
    </div>
  )
}