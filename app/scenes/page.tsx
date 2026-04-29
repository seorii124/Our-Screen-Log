'use client'

import { useState, useEffect } from 'react'
import { createClient } from '../../src/lib/supabase/client'
import Link from 'next/link'

interface Scene {
  id: string
  work_id: number
  work_title: string
  content: string
  image_url: string | null
  created_by: string
  created_at: string
}

export default function ScenesPage() {
  const [scenes, setScenes] = useState<Scene[]>([])
  const [loading, setLoading] = useState(true)
  const [isAdmin, setIsAdmin] = useState(false)
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [showForm, setShowForm] = useState(false)
  const [works, setWorks] = useState<{ id: number; title: string }[]>([])
  const [formData, setFormData] = useState({ work_id: '', work_title: '', content: '' })
  const [file, setFile] = useState<File | null>(null)
  const [isUploading, setIsUploading] = useState(false)

  const supabase = createClient()

  useEffect(() => {
    checkUser()
    fetchScenes()
    fetchWorks()
  }, [])

  async function checkUser() {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return
    setIsLoggedIn(true)
    setIsAdmin(user.user_metadata?.role === 'admin')
  }

  async function fetchScenes() {
    const { data } = await supabase
      .from('scenes')
      .select('*')
      .order('created_at', { ascending: false })
    if (data) setScenes(data as Scene[])
    setLoading(false)
  }

  async function fetchWorks() {
    const { data } = await supabase.from('works').select('id, title').order('title')
    if (data) setWorks(data)
  }

  const handleWorkSelect = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selected = works.find(w => w.id === Number(e.target.value))
    if (selected) setFormData(prev => ({ ...prev, work_id: String(selected.id), work_title: selected.title }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!isLoggedIn) return
    setIsUploading(true)

    let imageUrl = null
    if (file) {
      const fileName = `${Date.now()}_${Math.random().toString(36).substring(7)}`
      const { data: uploadData } = await supabase.storage.from('posters').upload(`scenes/${fileName}`, file)
      if (uploadData) {
        const { data } = supabase.storage.from('posters').getPublicUrl(`scenes/${fileName}`)
        imageUrl = data.publicUrl
      }
    }

    const { data: { user } } = await supabase.auth.getUser()
    const { error } = await supabase.from('scenes').insert([{
      work_id: Number(formData.work_id),
      work_title: formData.work_title,
      content: formData.content,
      image_url: imageUrl,
      created_by: user?.id
    }])

    setIsUploading(false)
    if (!error) {
      alert('등록 성공!')
      setShowForm(false)
      setFormData({ work_id: '', work_title: '', content: '' })
      setFile(null)
      fetchScenes()
    } else {
      alert('에러: ' + error.message)
    }
  }

  const handleDelete = async (e: React.MouseEvent, id: string) => {
    e.preventDefault() // Link 클릭 방지
    e.stopPropagation()
    if (!isAdmin) return
    if (!confirm('삭제하시겠습니까?')) return
    const { error } = await supabase.from('scenes').delete().eq('id', id)
    if (!error) fetchScenes()
  }

  if (loading) return <div className="p-12 text-center text-neutral-400 font-bold">불러오는 중...</div>

  return (
    <div className="max-w-7xl mx-auto p-10 min-h-screen pb-32">
      <header className="mb-14 flex flex-col sm:flex-row sm:justify-between sm:items-end gap-6">
        <div>
          <h1 className="text-5xl font-black text-neutral-900 tracking-tighter mb-3 italic">Memorable Lines</h1>
          <p className="text-neutral-500 font-bold tracking-[0.3em] text-[10px] uppercase">Curated by Team INFP Collector</p>
        </div>
        {isLoggedIn && (
          <button
            onClick={() => setShowForm(!showForm)}
            className="inline-block bg-black text-white px-8 py-4 rounded-full text-xs font-black uppercase tracking-widest hover:bg-blue-600 transition-all shadow-xl"
          >
            {showForm ? '✕ 닫기' : '+ New Scene'}
          </button>
        )}
      </header>

      {/* 등록 폼 */}
      {showForm && isLoggedIn && (
        <form onSubmit={handleSubmit} className="mb-14 bg-white rounded-[2.5rem] p-8 shadow-xl border border-gray-100 text-black max-w-2xl">
          <h2 className="text-lg font-black mb-6">명장면 등록</h2>
          <div className="space-y-4">
            <select onChange={handleWorkSelect} required className="w-full bg-gray-50 p-4 rounded-2xl font-bold text-black">
              <option value="">작품 선택</option>
              {works.map(w => <option key={w.id} value={w.id}>{w.title}</option>)}
            </select>
            <textarea
              placeholder="장면 설명 (선택)"
              value={formData.content}
              onChange={e => setFormData(prev => ({ ...prev, content: e.target.value }))}
              className="w-full bg-gray-50 p-4 rounded-2xl h-24 outline-none"
            />
            <input
              type="file" accept="image/*,video/*"
              onChange={e => e.target.files && setFile(e.target.files[0])}
              className="w-full text-xs text-gray-400"
            />
          </div>
          <button type="submit" disabled={isUploading}
            className="mt-6 w-full py-4 bg-black text-white rounded-[2rem] font-black hover:bg-blue-600 transition-all">
            {isUploading ? 'UPLOADING...' : 'ADD SCENE'}
          </button>
        </form>
      )}

      {/* 목록 */}
      {scenes.length === 0 ? (
        <div className="text-center text-neutral-500 py-32 font-bold">아직 등록된 명장면이 없습니다.</div>
      ) : (
        <div className="columns-2 sm:columns-3 md:columns-4 gap-6 space-y-6">
          {scenes.map(scene => (
            <Link
              key={scene.id}
              href={`/scenes/${scene.id}`}
              className="break-inside-avoid group relative bg-white rounded-2xl overflow-hidden shadow-lg border border-neutral-100 hover:border-blue-400 transition-all block"
            >
              {scene.image_url && (
                <img
                  src={scene.image_url}
                  alt={scene.work_title}
                  className="w-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
              )}
              <div className="p-4">
                <p className="text-xs font-black text-blue-600 uppercase tracking-widest mb-1">{scene.work_title}</p>
                {scene.content && <p className="text-sm text-gray-600 line-clamp-2">{scene.content}</p>}
              </div>
              {isAdmin && (
                <button
                  onClick={(e) => handleDelete(e, scene.id)}
                  className="absolute top-3 right-3 bg-red-500 text-white text-[10px] font-black px-2 py-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  DEL
                </button>
              )}
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}