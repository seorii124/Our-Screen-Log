// ... (import LineChart, Line, XAxis, YAxis, ResponsiveContainer 등)

export default function Home() {
  const [works, setWorks] = useState<any[]>([]);
  const [sortType, setSortType] = useState('latest'); // 정렬: latest, high, low

  const fetchWorks = async () => {
    let query = supabase.from('works').select('*');
    
    // 정렬 로직
    if (sortType === 'latest') query = query.order('created_at', { ascending: false });
    else if (sortType === 'high') query = query.order('average_rating', { ascending: false });
    else if (sortType === 'low') query = query.order('average_rating', { ascending: true });

    const { data } = await query;
    if (data) setWorks(data);
  };

  // 그래프용 데이터 가공 (월별 평균 별점)
  const chartData = works.reduce((acc: any[], work) => {
    const month = work.viewing_period || 'Unknown'; // 시청 시기 기준
    const existing = acc.find(d => d.month === month);
    if (existing) {
      existing.avg = Number(((existing.avg + work.average_rating) / 2).toFixed(1));
    } else {
      acc.push({ month, avg: work.average_rating });
    }
    return acc;
  }, []).sort((a, b) => a.month.localeCompare(b.month)); // 월순 정렬

  return (
    <div className="space-y-10">
      {/* 📊 월간 별점 평균 그래프 */}
      <section className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm">
        <h2 className="text-xl font-bold mb-6 flex items-center gap-2">📈 월간 평점 흐름 <span className="text-sm font-normal text-gray-400">(전체 기간)</span></h2>
        <div className="h-64 w-full overflow-x-auto">
          <div style={{ minWidth: '600px', height: '100%' }}>
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                <XAxis dataKey="month" axisLine={false} tickLine={false} />
                <YAxis domain={[0, 5]} axisLine={false} tickLine={false} />
                <Tooltip contentStyle={{ borderRadius: '15px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)' }} />
                <Line type="monotone" dataKey="avg" stroke="#3b82f6" strokeWidth={4} dot={{ r: 6, fill: '#3b82f6' }} activeDot={{ r: 8 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </section>

      {/* 🔄 정렬 스위치 */}
      <div className="flex gap-2">
        {['latest', 'high', 'low'].map((type) => (
          <button 
            key={type}
            onClick={() => setSortType(type)}
            className={`px-4 py-2 rounded-full text-xs font-bold transition-all ${sortType === type ? 'bg-black text-white' : 'bg-gray-100 text-gray-400'}`}
          >
            {type === 'latest' ? '최신순' : type === 'high' ? '평점 높은순' : '평점 낮은순'}
          </button>
        ))}
      </div>

      {/* 🎬 작품 리스트 (기존 코드 유지) */}
    </div>
  );
}