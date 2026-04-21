"use client"

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '../../src/lib/supabase/client'

export default function AdminPage() {
  const [title, setTitle] = useState('')
  // 1. 카테고리 대신 '영화/드라마' 선택 상태 추가 (기본값: 영화)
  const [mediaType, setMediaType] = useState('영화') 
  // 2. 이미지 주소 대신 '실제 파일'을 담을 공간 추가
  const [file, setFile] = useState<File | null>(null)
  const [isUploading, setIsUploading] = useState(false)
  
  const router = useRouter()
  const supabase = createClient()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!title) {
      alert('제목을 입력해주세요!')
      return
    }

    setIsUploading(true)
    let finalImageUrl = ''

    // 3. 파일이 선택되었다면 Supabase Storage에 먼저 업로드!
    if (file) {
      // 파일 이름이 겹치지 않게 랜덤 숫자 붙이기
      const fileExt = file.name.split('.').pop()
      const fileName = `${Math.random()}.${fileExt}`

      const { error: uploadError } = await supabase.storage
        .from('posters') // 아까 만든 스토리지 방 이름
        .upload(fileName, file)

      if (uploadError) {
        alert('이미지 업로드 실패: ' + uploadError.message)
        setIsUploading(false)
        return
      }

      // 업로드 성공 후, 그 이미지의 인터넷 주소(URL)를 가져오기
      const { data } = supabase.storage
        .from('posters')
        .getPublicUrl(fileName)

      finalImageUrl = data.publicUrl
    }

    // 4. 제목, 분류(영화/드라마), 이미지 주소를 DB 창고에 저장
    const { error } = await supabase
      .from('works')
      .insert([
        {
          title: title,
          category: mediaType, // 기존 카테고리 칸에 '영화' 또는 '드라마' 글자 저장
          poster_url: finalImageUrl
        }
      ])

    setIsUploading(false)

    if (error) {
      alert('등록 중 에러가 났습니다: ' + error.message)
    } else {
      alert('성공적으로 등록되었습니다! 🍿')
      router.push('/')
      router.refresh()
    }
  }

  return (
    <div className="max-w-2xl mx-auto py-12">
      <h1 className="text-3xl font-bold mb-8 text-gray-800">새 작품 등록하기</h1>

      <form onSubmit={handleSubmit} className="flex flex-col gap-6 bg-white p-8 rounded-2xl shadow-sm border border-gray-100">
        
        {/* 제목 입력 */}
        <div>
          <label className="block text-sm font-bold text-gray-700 mb-2">작품 제목</label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full border border-gray-300 p-3 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
            placeholder="예: 인터스텔라"
          />
        </div>

        {/* 영화 / 드라마 선택 버튼 */}
        <div>
          <label className="block text-sm font-bold text-gray-700 mb-2">분류</label>
          <div className="flex gap-4">
            <button
              type="button"
              onClick={() => setMediaType('영화')}
              className={`flex-1 py-3 rounded-lg font-bold border transition-colors ${
                mediaType === '영화' ? 'bg-blue-600 text-white border-blue-600' : 'bg-white text-gray-500 border-gray-300'
              }`}
            >
              🎬 영화
            </button>
            <button
              type="button"
              onClick={() => setMediaType('드라마')}
              className={`flex-1 py-3 rounded-lg font-bold border transition-colors ${
                mediaType === '드라마' ? 'bg-blue-600 text-white border-blue-600' : 'bg-white text-gray-500 border-gray-300'
              }`}
            >
              📺 드라마
            </button>
          </div>
        </div>

        {/* 파일 업로드 */}
        <div>
          <label className="block text-sm font-bold text-gray-700 mb-2">포스터 이미지 파일</label>
          <input
            type="file"
            accept="image/*"
            onChange={(e) => {
              if (e.target.files && e.target.files[0]) {
                setFile(e.target.files[0])
              }
            }}
            className="w-full border border-gray-300 p-2 rounded-lg cursor-pointer file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
          />
        </div>

        <button
          type="submit"
          disabled={isUploading}
          className="bg-gray-900 text-white font-bold py-4 rounded-lg mt-4 hover:bg-black transition-colors disabled:bg-gray-400"
        >
          {isUploading ? '업로드 중...' : '창고에 저장하기'}
        </button>
      </form>
    </div>
  )
}