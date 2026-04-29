'use client'

import { useState, useEffect } from 'react'
import { createClient } from '../../../src/lib/supabase/client'
import { useParams, useRouter } from 'next/navigation'

interface Scene {
  id: string
  work_title: string
  content: string
  image_url: string | null
  created_at: string
}

interface Comment {
  id: string
  scene_id: string
  content: string
  created_by: string
  created_at: string
  member_num: number | null
}

const MEMBER_EMOJI: Record<number, string> = { 1: '❄️', 2: '🍇', 3: '🍦' }

export default function SceneDetailPage() {
  const [scene, setScene] = useState<Scene | null>(null)
  const [comments, setComments] = useState<Comment[]>([])
  const [newComment, setNewComment] = useState('')
  const [loading, setLoading] = useState(true)
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [isAdmin, setIsAdmin] = useState(false)
  const [memberNum, setMemberNum] = useState(0)
  const [userId, setUserId] = useState('')

  const supabase = createClient()
  const params = useParams()
  const router = useRouter()
  const sceneId = params.id as string

  useEffect(() => {
    checkUser()
    fetchScene()
    fetchComments()
  }, [sceneId])

  async function checkUser() {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return
    setIsLoggedIn(true)
    setIsAdmin(user.user_metadata?.role === 'admin')
    setMemberNum(Number(user.user_metadata?.member) || 0)
    setUserId(user.id)
  }

  async function fetchScene() {
    const { data, error } = await supabase
      .from('scenes')
      .select('*')
      .eq('id', sceneId)
      .single()
    if (data && !error) setScene(data as Scene)
    setLoading(false)
  }

  async function fetchComments() {
    const { data } = await supabase
      .from('comments')
      .select('*')
      .eq('scene_id', sceneId)
      .order('created_at', { ascending: true })
    if (data) setComments(data as Comment[])
  }

  const handleAddComment = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!isLoggedIn || !newComment.trim()) return

    const { error } = await supabase.from('comments').insert([{
      scene_id: sceneId,
      reference_type: 'scene',
      reference_id: sceneId,
      content: newComment.trim(),
      created_by: userId,
      member_num: memberNum
    }])

    if (!error) {
      setNewComment('')
      fetchComments()
    } else {
      alert('에러: ' + error.message)
    }
  }

  const handleDeleteComment = async (id: string) => {
    if (!isAdmin) return
    if (!confirm('댓글을 삭제하시겠습니까?')) return
    const { error } = await supabase.from('comments').delete().eq('id', id)
    if (!error) fetchComments()
  }

  if (loading) return <div className="p-12 text-center text-neutral-400 font-bold">불러오는 중...</div>
  if (!scene) return <div className="p-12 text-center text-neutral-400">장면을 찾을 수 없습니다.</div>

  return (
    <div className="max-w-3xl mx-auto py-12 px-6 pb-32">
      <button
        onClick={() => router.push('/scenes')}
        className="text-neutral-400 hover:text-blue-500 text-sm font-bold mb-8 block transition-colors"
      >
        ← 명장면 목록
      </button>

      {/* 장면 */}
      <div className="bg-white rounded-[2.5rem] overflow-hidden shadow-xl border border-neutral-100 mb-10">
        {scene.image_url && (
          <img src={scene.image_url} alt={scene.work_title} className="w-full object-cover max-h-[500px]" />
        )}
        <div className="p-8">
          <p className="text-xs font-black text-blue-600 uppercase tracking-widest mb-2">{scene.work_title}</p>
          {scene.content && <p className="text-gray-700 text-base leading-relaxed">{scene.content}</p>}
        </div>
      </div>

      {/* 댓글 */}
      <section>
        <h2 className="text-sm font-black uppercase tracking-widest text-neutral-400 mb-6">
          Comments ({comments.length})
        </h2>

        <div className="space-y-4 mb-8">
          {comments.length === 0 && (
            <p className="text-neutral-300 text-sm font-bold text-center py-8">첫 댓글을 남겨보세요</p>
          )}
          {comments.map(comment => (
            <div key={comment.id} className="group bg-white rounded-2xl p-5 border border-neutral-100 shadow-sm flex justify-between items-start gap-4">
              <div className="flex gap-3 items-start">
                <span className="text-xl">{MEMBER_EMOJI[comment.member_num ?? 0] ?? '👤'}</span>
                <p className="text-sm text-gray-700 leading-relaxed">{comment.content}</p>
              </div>
              {isAdmin && (
                <button
                  onClick={() => handleDeleteComment(comment.id)}
                  className="shrink-0 text-[10px] font-black text-red-400 hover:text-red-600 opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  DEL
                </button>
              )}
            </div>
          ))}
        </div>

        {isLoggedIn ? (
          <form onSubmit={handleAddComment} className="flex gap-3">
            <span className="text-xl pt-3">{MEMBER_EMOJI[memberNum] ?? '👤'}</span>
            <input
              type="text"
              value={newComment}
              onChange={e => setNewComment(e.target.value)}
              placeholder="댓글 입력..."
              required
              className="flex-1 bg-white border border-neutral-200 rounded-2xl px-5 py-3 text-sm text-black outline-none focus:border-blue-400 transition-colors"
            />
            <button type="submit"
              className="bg-black text-white px-6 py-3 rounded-2xl text-xs font-black hover:bg-blue-600 transition-all">
              POST
            </button>
          </form>
        ) : (
          <p className="text-center text-xs text-neutral-400 font-bold">댓글은 멤버만 작성할 수 있습니다.</p>
        )}
      </section>
    </div>
  )
}