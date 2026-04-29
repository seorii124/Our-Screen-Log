'use client'

import { useState, useEffect } from 'react'
import { createClient } from '../../src/lib/supabase/client'

interface Line {
  id: string
  work_id: number
  work_title: string
  content: string
  source: string | null
  created_by: string
  created_at: string
}

export default function LinesPage() {
  const [lines, setLines] = useState<Line[]>([])
  const [loading, setLoading] = useState(true)
  const [isAdmin, setIsAdmin] = useState(false)
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [showForm, setShowForm] = useState(false)
  const [works, setWorks] = useState<{ id: number; title: string }[]>([])
  const [formData, setFormData] = useState({ work_id: '', work_title: '', content: '', source: '' })
  const [isSubmitting, setIsSubmitting] = useState(false)

  const supabase = createClient()

  useEffect(() => {
    checkUser()
    fetchLines()
    fetchWorks()
  }, [])

  async function checkUser() {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return
    setIsLoggedIn(true)
    setIsAdmin(user.user_metadata?.role === 'admin')
  }

  async function fetchLines() {
    const { data } = await supabase
      .from('lines')
      .select('*')
      .order('created_at', { ascending: false })
    if (data) setLines(data as Line[])
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
    setIsSubmitting(true)

    const { data: { user } } = await supabase.auth.getUser()
    const { error } = await supabase.from('lines').insert([{
      work_id: Number(formData.work_id),
      work_title: formData.work_title,
      content: formData.content,
      source: formData.source || null,
      created_by: user?.id
    }])

    setIsSubmitting(false)
    if (!error) {
      alert('등록 성공!')
      setShowForm(false)
      setFormData({ work_id: '', work_title: '', content: '', source: '' })
      fetchLines()
    } else {
      alert('에러: ' + error.message)
    }
  }

  const handleDelete = async (id: string) => {
    if (!isAdmin) return
    if (!confirm('삭제하시겠습니까?')) return
    const { error } = await supabase.from('lines').delete().eq('id', id)
    if (!error) fetchLines()
  }

  if (loading) return <div className="p-12 text-center text-neutral-400 font-bold">불러오는 중...</div>

  return (
    <div className="max-w-4xl mx-auto p-10 min-h-screen pb-32">
      <header className="mb-14 flex flex-col sm:flex-row sm:justify-between sm:items-end gap-6">
        <div>
          <h1 className="text-5xl font-black text-neutral-900 tracking-tighter mb-3 italic">memorable lines</h1>
          <p className="text-neutral-500 font-bold tracking-[0.3em] text-[10px] uppercase">Curated by Team INFP Collector</p>
        </div>
        {isLoggedIn && (
          <button
            onClick={() => setShowForm(!showForm)}
            className="inline-block bg-black text-white px-8 py-4 rounded-full text-xs font-black uppercase tracking-widest hover:bg-blue-600 transition-all shadow-xl"
          >
            {showForm ? '✕ 닫기' : '+ New Line'}
          </button>
        )}
      </header>

      {/* 등록 폼 */}
      {showForm && isLoggedIn && (
        <form onSubmit={handleSubmit} className="mb-14 bg-white rounded-[2.5rem] p-8 shadow-xl border border-gray-100 text-black">
          <h2 className="text-lg font-black mb-6">명대사 등록</h2>
          <div className="space-y-4">
            <select onChange={handleWorkSelect} required className="w-full bg-gray-50 p-4 rounded-2xl font-bold text-black">
              <option value="">작품 선택</option>
              {works.map(w => <option key={w.id} value={w.id}>{w.title}</option>)}
            </select>
            <textarea
              placeholder="대사 내용 *"
              required
              value={formData.content}
              onChange={e => setFormData(prev => ({ ...prev, content: e.target.value }))}
              className="w-full bg-gray-50 p-4 rounded-2xl h-28 outline-none"
            />
            <input
              type="text"
              placeholder="출처 (예: 1화 32분, ep.3)"
              value={formData.source}
              onChange={e => setFormData(prev => ({ ...prev, source: e.target.value }))}
              className="w-full bg-gray-50 p-4 rounded-2xl outline-none"
            />
          </div>
          <button type="submit" disabled={isSubmitting}
            className="mt-6 w-full py-4 bg-black text-white rounded-[2rem] font-black hover:bg-blue-600 transition-all">
            {isSubmitting ? 'SAVING...' : 'ADD LINE'}
          </button>
        </form>
      )}

      {/* 목록 */}
      {lines.length === 0 ? (
        <div className="text-center text-neutral-500 py-32 font-bold">아직 등록된 명대사가 없습니다.</div>
      ) : (
        <div className="space-y-6">
          {lines.map(line => (
            <div key={line.id} className="group relative bg-white rounded-3xl p-8 shadow-sm border border-neutral-100 hover:border-blue-200 transition-all">
              <div className="flex justify-between items-start gap-4">
                <div className="flex-1">
                  <p className="text-xs font-black text-blue-600 uppercase tracking-widest mb-3">{line.work_title}</p>
                  <p className="text-xl font-bold text-gray-900 leading-relaxed italic">"{line.content}"</p>
                  {line.source && (
                    <p className="mt-3 text-xs text-gray-400 font-bold">— {line.source}</p>
                  )}
                </div>
                {isAdmin && (
                  <button onClick={() => handleDelete(line.id)}
                    className="shrink-0 bg-red-500 text-white text-[10px] font-black px-3 py-1.5 rounded-full opacity-0 group-hover:opacity-100 transition-opacity">
                    DEL
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}