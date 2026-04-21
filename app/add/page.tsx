'use client'

import { useState } from 'react'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { useRouter } from 'next/navigation'

export default function AddWorkPage() {
  const [title, setTitle] = useState('')
  const [category, setCategory] = useState('영화')
  const [poster, setPoster] = useState<File | null>(null)
  const [bestScene, setBestScene] = useState<File | null>(null)
  const [video, setVideo] = useState<File | null>(null)
  const [loading, setLoading] = useState(false)
  
  const supabase = createClientComponentClient()
  const router = useRouter()

  // 파일 업로드 자동화 함수
  const handleUpload = async (file: File, bucket: string) => {
    // 파일 이름이 겹치지 않게 무작위 숫자 부여
    const fileExt = file.name.split('.').pop()
    const fileName = `${Math.random()}.${fileExt}`
    
    // 지정된 버킷(창고)에 파일 올리기
    const { error } = await supabase.storage.from(bucket).upload(fileName, file)
    if (error) throw error
    
    // 올라간 파일의 인터넷 주소 가져오기
    const { data } = supabase.storage.from(bucket).getPublicUrl(fileName)
    return data.publicUrl
  }

  // [등록] 버튼 눌렀을 때 실행될 명령어
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      let posterUrl = null
      let bestSceneUrl = null
      let videoUrl = null

      // 파일이 선택되었다면 각각의 창고에 올리고 주소 받아오기
      if (poster) posterUrl = await handleUpload(poster, 'posters')
      if (bestScene) bestSceneUrl = await handleUpload(bestScene, 'best-scenes')
      if (video) videoUrl = await handleUpload(video, 'videos')

      // 장부(works 테이블)에 새로운 데이터 한 줄 추가하기
      const { error } = await supabase.from('works').insert({
        title,
        category,
        poster_url: posterUrl,
        best_scene_url: bestSceneUrl,
        video_url: videoUrl
      })

      if (error) throw error

      alert('성공적으로 등록되었습니다!')
      router.push('/') // 완료 후 메인 화면으로 자동 이동
      router.refresh() // 화면 새로고침해서 방금 넣은 거 띄우기

    } catch (error) {
      alert('오류가 발생했습니다. 창고(Bucket) 이름이나 설정을 확인해주세요.')
      console.error(error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-xl mx-auto mt-10 p-6 bg-white rounded-lg shadow-md">
      <h1 className="text-2xl font-bold mb-6">새 작품 등록하기</h1>
      
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* 제목 입력 */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">작품 제목</label>
          <input 
            type="text" 
            required 
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full border border-gray-300 rounded p-2"
          />
        </div>

        {/* 카테고리 선택 */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">구분</label>
          <select 
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="w-full border border-gray-300 rounded p-2"
          >
            <option value="영화">영화</option>
            <option value="드라마">드라마</option>
          </select>
        </div>

        {/* 포스터 사진 첨부 */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">포스터 사진</label>
          <input 
            type="file" 
            accept="image/*"
            onChange={(e) => setPoster(e.target.files?.[0] || null)}
            className="w-full"
          />
        </div>

        {/* 명장면 사진 첨부 */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">명장면 사진</label>
          <input 
            type="file" 
            accept="image/*"
            onChange={(e) => setBestScene(e.target.files?.[0] || null)}
            className="w-full"
          />
        </div>

        {/* 동영상 첨부 */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">동영상 파일</label>
          <input 
            type="file" 
            accept="video/*"
            onChange={(e) => setVideo(e.target.files?.[0] || null)}
            className="w-full"
          />
        </div>

        {/* 등록 버튼 */}
        <button 
          type="submit" 
          disabled={loading}
          className="w-full bg-blue-600 text-white font-bold rounded py-3 mt-4 hover:bg-blue-700 disabled:bg-gray-400"
        >
          {loading ? '업로드 중입니다...' : '작품 등록하기'}
        </button>
      </form>
    </div>
  )
}