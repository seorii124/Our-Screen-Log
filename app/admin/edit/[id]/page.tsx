'use client'

import { useEffect, useState, use } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '../../../../src/lib/supabase/client'

export default function EditPage({ params }: { params: Promise<{ id: string }> }) {
  const unwrappedParams = use(params)
  const id = unwrappedParams.id
  
  const [formData, setFormData] = useState<any>(null)
  const [file, setFile] = useState<File | null>(null)
  const [isUploading, setIsUploading] = useState(false)
  const [loading, setLoading] = useState(true)

  const router = useRouter()
  const supabase = createClient()

  // 1. 기존 데이터 불러오기
  useEffect(() => {
    async function fetchWork() {
      const { data, error } = await supabase
        .from('works')
        .select('*')
        .eq('id', id)
        .single()

      if (data) setFormData(data)
      setLoading(false)
    }
    fetchWork()
  }, [id])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsUploading(true)

    let finalImageUrl = formData.poster_url // 기본값은 기존 이미지 주소

    // 2. 새 파일이 선택된 경우에만 업로드 진행
    if (file) {
      const fileExt = file.name.split('.').pop()
      const fileName = `${Date.now()}_${Math.floor(Math.random() * 1000)}.${fileExt}`
      const { error: uploadError } = await supabase.storage
        .from('posters')
        .upload(fileName, file)

      if (!uploadError) {
        const { data } = supabase.storage.from('posters').getPublicUrl(fileName)
        finalImageUrl = data.publicUrl
      }
    }

    // 3. 14개 필드 전체 업데이트 (수정 시에도 평균 별점 재계산)
    const avgRating = (Number(formData.m1_rating) + Number(formData.m2_rating) + Number(formData.m3_rating)) / 3

    const { error } = await supabase
      .from('works')
      .update({
        ...formData,
        poster_url: finalImageUrl,
        average_rating: Number(avgRating.toFixed(1))
      })
      .eq('id', id)

    setIsUploading(false)

    if (error) {
      alert('수정 실패: ' + error.message)
    } else {
      alert('수정되었습니다! ✨')
      router.push(`/works/${id}`)
      router.refresh()
    }
  }

  if (loading) return <div className="p-10 text-center">기존 데이터를 가져오는 중...</div>

  return (
    <div className="max-w-2xl mx-auto py-12 px-4">
      <h1 className="text-3xl font-bold mb-8">기록 수정하기</h1>

      <form onSubmit={handleSubmit} className="space-y-6 bg-white p-8 rounded-3xl border border-gray-100 shadow-sm">
        {/* 제목 */}
        <div>
          <label className="block text-sm font-bold mb-2">작품 제목</label>
          <input
            type="text"
            value={formData.title}
            onChange={(e) => setFormData({...formData, title: e.target.value})}
            className="w-full border p-3 rounded-xl outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* 시청 시기 */}
        <div>
          <label className="block text-sm font-bold mb-2 text-blue-600">시청 시기 (예: 2024-02)</label>
          <input
            type="text"
            value={formData.viewing_period || ''}
            onChange={(e) => setFormData({...formData, viewing_period: e.target.value})}
            className="w-full border p-3 rounded-xl outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="그래프 집계를 위해 YYYY-MM 형식을 추천합니다"
          />
        </div>

        {/* 포스터 사진 (변경할 때만 선택) */}
        <div>
          <label className="block text-sm font-bold mb-2">포스터 이미지 (변경하려면 선택)</label>
          {formData.poster_url && <img src={formData.poster_url} className="w-20 h-28 object-cover mb-2 rounded-lg opacity-50" alt="기존 포스터" />}
          <input
            type="file"
            accept="image/*"
            onChange={(e) => e.target.files && setFile(e.target.files[0])}
            className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:bg-blue-50 file:text-blue-700"
          />
        </div>

        {/* 멤버별 섹션 (간소화 예시, 실제로는 m1, m2, m3 반복) */}
        <div className="border-t pt-6">
          <h3 className="font-bold mb-4">❄️ 멤버 1 후기 수정</h3>
          <textarea
            value={formData.m1_review || ''}
            onChange={(e) => setFormData({...formData, m1_review: e.target.value})}
            className="w-full border p-3 rounded-xl h-24 mb-3"
          />
          <div className="flex gap-4">
            <input 
              type="number" step="0.5" 
              value={formData.m1_rating} 
              onChange={(e) => setFormData({...formData, m1_rating: e.target.value})}
              className="border p-2 rounded-lg w-24" placeholder="평점" 
            />
            <input 
              type="text" 
              value={formData.m1_date || ''} 
              onChange={(e) => setFormData({...formData, m1_date: e.target.value})}
              className="border p-2 rounded-lg flex-1" placeholder="날짜" 
            />
          </div>
        </div>

        {/* 나머지 m2, m3 필드들도 formData와 연결해서 추가하시면 됩니다! */}

        <div className="flex gap-3 pt-6">
          <button
            type="button"
            onClick={() => router.back()}
            className="flex-1 py-4 bg-gray-100 rounded-xl font-bold text-gray-500"
          >
            취소
          </button>
          <button
            type="submit"
            disabled={isUploading}
            className="flex-[2] py-4 bg-blue-600 text-white rounded-xl font-bold shadow-lg hover:bg-blue-700 disabled:bg-gray-300"
          >
            {isUploading ? '수정 중...' : '수정 완료하기'}
          </button>
        </div>
      </form>
    </div>
  )
}