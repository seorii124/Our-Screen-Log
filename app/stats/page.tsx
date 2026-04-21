'use client'

export default function StatsPage() {
  return (
    <div className="max-w-5xl mx-auto p-10">
      <h1 className="text-3xl font-black mb-10 italic">Data Insights 📊</h1>
      <div className="bg-white p-10 rounded-[3rem] border border-gray-100 shadow-xl text-center">
        <div className="w-20 h-20 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center mx-auto mb-6 text-3xl">
          📈
        </div>
        <h2 className="text-xl font-bold mb-2">차트 분석 준비 중</h2>
        <p className="text-gray-400 text-sm">기록된 데이터들을 바탕으로 멋진 그래프를 그려드릴게요!</p>
      </div>
    </div>
  )
}