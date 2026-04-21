'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function LoginPage() {
  const [password, setPassword] = useState('')
  const router = useRouter()

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault()
    if (password === '1234') router.push('/admin')
    else alert('틀렸습니다.')
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <form onSubmit={handleLogin} className="bg-white p-10 rounded-[2.5rem] shadow-xl w-full max-w-sm">
        <h1 className="text-2xl font-black mb-8 text-center uppercase">Admin Access</h1>
        <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Password" className="w-full bg-gray-50 p-4 rounded-2xl mb-4 outline-none font-bold" />
        <button type="submit" className="w-full py-4 bg-black text-white rounded-2xl font-black">ENTER</button>
      </form>
    </div>
  )
}