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

    // 숫자로 확실히 변환해서 저장
    const { error } = await supabase.from('works').insert([{
      ...formData,
      m1_rating: Number(formData.m1_rating),
      m2_rating: Number(formData.m2_rating),
      m3_rating: Number(formData.m3_rating),
      poster_url: finalImageUrl,
      average_rating: (Number(formData.m1_rating) + Number(formData.m2_rating) + Number(formData.m3_rating)) / 3
    }])

    setIsUploading(false)
    if (error) { alert('에러: ' + error.message) } 
    else { alert('등록 성공! 🍿'); router.push('/'); router.refresh(); }
  }

  return (
    <div className="max-w-2xl mx-auto py-12 px-4">
      <h1 className="text-3xl font-bold mb-8">새 작품 등록</h1>
      <form onSubmit={handleSubmit} className="space-y-6 bg-white p-8 rounded-3xl border border-gray-100 shadow-sm">
        {/* ... (제목, 분류 등 생략) */}

        {/* 별점 입력 부분 수정 예시 */}
        {[1, 2, 3].map((num) => (
          <div key={num} className="border-t pt-6">
            <h3 className="font-bold mb-3">멤버 {num} 후기</h3>
            <textarea 
              value={(formData as any)[`m${num}_review`]} 
              onChange={(e) => setFormData({...formData, [`m${num}_review`]: e.target.value})} 
              className="w-full border p-3 rounded-xl h-24 mb-2" 
            />
            <div className="flex gap-4">
              <input 
                type="number" step="0.5" placeholder="평점" 
                value={(formData as any)[`m${num}_rating`]} 
                onChange={(e) => setFormData({...formData, [`m${num}_rating`]: Number(e.target.value)})} // 핵심 수정!
                className="border p-2 rounded-lg w-20" 
              />
              <input type="text" placeholder="날짜" value={(formData as any)[`m${num}_date`]} onChange={(e) => setFormData({...formData, [`m${num}_date`]: e.target.value})} className="border p-2 rounded-lg flex-1" />
            </div>
          </div>
        ))}

        <button type="submit" disabled={isUploading} className="w-full py-4 bg-black text-white rounded-2xl font-bold hover:bg-gray-800 transition-colors">
          {isUploading ? '기록 창고에 넣는 중...' : '기록 저장하기'}
        </button>
      </form>
    </div>
  )
}