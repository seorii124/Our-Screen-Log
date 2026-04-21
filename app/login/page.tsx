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

    // 숫자로 확실하게 변환 (이게 안 되면 빌드 에러 납니다)
    const r1 = Number(formData.m1_rating);
    const r2 = Number(formData.m2_rating);
    const r3 = Number(formData.m3_rating);
    const avgRating = (r1 + r2 + r3) / 3;

    const { error } = await supabase.from('works').insert([{
      ...formData,
      m1_rating: r1,
      m2_rating: r2,
      m3_rating: r3,
      poster_url: finalImageUrl,
      average_rating: Number(avgRating.toFixed(1))
    }])

    setIsUploading(false)
    if (error) { 
      alert('DB 저장 에러: ' + error.message) 
    } else { 
      alert('등록 성공! 🍿')
      router.push('/')
      router.refresh()
    }
  }

  // 입력값 변경 함수 (숫자 필드는 숫자로 변환 처리)
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'number' ? Number(value) : value
    }));
  };

  return (
    <div className="max-w-2xl mx-auto py-12 px-4">
      <h1 className="text-3xl font-bold mb-8">새 작품 등록</h1>
      <form onSubmit={handleSubmit} className="space-y-6 bg-white p-8 rounded-3xl border border-gray-100 shadow-sm">
        <div>
          <label className="block text-sm font-bold mb-2">작품 제목</label>
          <input name="title" type="text" required value={formData.title} onChange={handleChange} className="w-full border p-3 rounded-xl outline-none focus:ring-2 focus:ring-blue-500" />
        </div>
        
        <div>
          <label className="block text-sm font-bold mb-2">분류</label>
          <select name="category" value={formData.category} onChange={handleChange} className="w-full border p-3 rounded-xl">
            <option value="영화">🎬 영화</option>
            <option value="드라마">📺 드라마</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-bold mb-2 text-blue-600">시청 시기 (예: 2024-02)</label>
          <input name="viewing_period" type="text" value={formData.viewing_period} onChange={handleChange} className="w-full border p-3 rounded-xl" placeholder="YYYY-MM 형식 추천" />
        </div>

        <div>
          <label className="block text-sm font-bold mb-2">포스터 파일</label>
          <input type="file" accept="image/*" onChange={(e) => e.target.files && setFile(e.target.files[0])} className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:bg-blue-50 file:text-blue-700" />
        </div>

        {/* 멤버 1, 2, 3 섹션 자동 생성 */}
        {[
          { id: 1, icon: '❄️' },
          { id: 2, icon: '🍇' },
          { id: 3, icon: '🍦' }
        ].map((member) => (
          <div key={member.id} className="border-t pt-6">
            <h3 className="font-bold mb-3">{member.icon} 멤버 {member.id} 후기</h3>
            <textarea 
              name={`m${member.id}_review`}
              value={(formData as any)[`m${member.id}_review`]} 
              onChange={handleChange} 
              className="w-full border p-3 rounded-xl h-24 mb-2" 
            />
            <div className="flex gap-4">
              <input 
                name={`m${member.id}_rating`}
                type="number" step="0.5" placeholder="평점" 
                value={(formData as any)[`m${member.id}_rating`]} 
                onChange={handleChange} 
                className="border p-2 rounded-lg w-20" 
              />
              <input 
                name={`m${member.id}_date`}
                type="text" placeholder="날짜" 
                value={(formData as any)[`m${member.id}_date`]} 
                onChange={handleChange} 
                className="border p-2 rounded-lg flex-1" 
              />
            </div>
          </div>
        ))}

        <button type="submit" disabled={isUploading} className="w-full py-4 bg-black text-white rounded-2xl font-bold shadow-lg hover:bg-gray-800 disabled:bg-gray-400">
          {isUploading ? '기록 창고에 넣는 중...' : '기록 저장하기'}
        </button>
      </form>
    </div>
  )
}