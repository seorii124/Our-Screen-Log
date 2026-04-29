'use client'

import { useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'

// /works/[id]/edit → /admin?id=[id] 로 리다이렉트
// admin/page.tsx 에서 등록/수정 통합 처리
export default function EditRedirectPage() {
  const router = useRouter()
  const params = useParams()
  const id = params.id as string

  useEffect(() => {
    router.replace(`/admin?id=${id}`)
  }, [id])

  return (
    <div className="p-12 text-center text-neutral-400 font-bold">이동 중...</div>
  )
}