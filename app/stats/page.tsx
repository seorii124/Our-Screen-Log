"use client";

import { useEffect, useState } from "react";
import { createBrowserClient } from "@supabase/ssr";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";

type StatData = {
  month: string;
  avgRating: number;
  moviesCount: number;
  dramasCount: number;
};

export default function StatsPage() {
  const [data, setData] = useState<StatData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      const supabase = createBrowserClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
      );

      // 관리자님의 원본 테이블인 'works' 사용
      const { data: works, error } = await supabase
        .from("works")
        .select("*")
        .order("created_at", { ascending: true });

      if (error) {
        console.error(error);
        setLoading(false);
        return;
      }

      // 생성일(created_at) 기준으로 월별 그룹화 처리
      const grouped = works.reduce((acc: any, curr) => {
        const month = curr.created_at.substring(0, 7);
        if (!acc[month]) {
          acc[month] = { month, ratings: [], movies: 0, dramas: 0 };
        }
        
        acc[month].ratings.push(curr.average_rating);
        if (curr.category.toLowerCase().includes('movie') || curr.category === '영화') {
          acc[month].movies++;
        } else {
          acc[month].dramas++;
        }
        return acc;
      }, {});

      const chartData: StatData[] = Object.values(grouped).map((item: any) => ({
        month: item.month,
        avgRating: Number((item.ratings.reduce((a: number, b: number) => a + b, 0) / item.ratings.length).toFixed(1)),
        moviesCount: item.movies,
        dramasCount: item.dramas,
      }));

      setData(chartData);
      setLoading(false);
    };

    fetchData();
  }, []);

  if (loading) return <div className="text-center py-20 text-neutral-500 font-bold">데이터를 불러오는 중입니다...</div>;

  return (
    <div className="max-w-6xl mx-auto space-y-12 py-8">
      <h2 className="text-3xl font-black tracking-tight italic text-white">Archive Statistics</h2>
      
      <div className="bg-neutral-900 border border-neutral-800 rounded-[2rem] p-8 shadow-sm">
        <h3 className="text-xl font-bold mb-8 text-neutral-300">월별 평균 평점 추이</h3>
        <div className="overflow-x-auto pb-4">
          <div style={{ minWidth: "800px", height: "400px" }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#333" vertical={false} />
                <XAxis dataKey="month" stroke="#888" tick={{ fill: '#888', fontSize: 12, fontWeight: 'bold' }} />
                <YAxis stroke="#888" tick={{ fill: '#888' }} domain={[0, 5]} />
                <Tooltip cursor={{ fill: '#2a2a2a' }} contentStyle={{ backgroundColor: '#171717', border: 'none', borderRadius: '12px', color: '#fff', fontWeight: 'bold' }} />
                <Legend wrapperStyle={{ paddingTop: '20px', fontWeight: 'bold' }} />
                <Bar dataKey="avgRating" name="월별 평균 평점" fill="#3b82f6" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
}