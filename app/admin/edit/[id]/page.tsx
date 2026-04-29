'use client'

import { useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'

export default function AdminEditRedirect() {
  const router = useRouter()
  const params = useParams()
  const id = params.id as string

  useEffect(() => {
    router.replace(`/admin?id=${id}`)
  }, [id])

  return <div className="p-12 text-center text-neutral-400 font-bold">이동 중...</div>
}