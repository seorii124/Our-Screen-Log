// ... (생략: useState, useRouter, supabase import)

export default function AdminPage() {
  const [formData, setFormData] = useState({
    title: '', category: '영화', viewing_period: '',
    m1_review: '', m1_rating: 0, m1_date: '',
    m2_review: '', m2_rating: 0, m2_date: '',
    m3_review: '', m3_rating: 0, m3_date: ''
  });
  const [file, setFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsUploading(true);
    let finalImageUrl = '';

    // 사진 업로드 자동화
    if (file) {
      const fileName = `${Date.now()}_${Math.random().toString(36).substring(7)}`;
      const { data: uploadData } = await supabase.storage.from('posters').upload(fileName, file);
      if (uploadData) {
        const { data } = supabase.storage.from('posters').getPublicUrl(fileName);
        finalImageUrl = data.publicUrl;
      }
    }

    // 14개 이상의 모든 데이터를 한 번에 DB로!
    const { error } = await supabase.from('works').insert([{
      ...formData,
      poster_url: finalImageUrl,
      average_rating: (Number(formData.m1_rating) + Number(formData.m2_rating) + Number(formData.m3_rating)) / 3
    }]);

    if (!error) { alert('등록 성공! 🍿'); router.push('/'); }
    setIsUploading(false);
  };

  return (
    // ... (생략: 14개 필드를 입력받는 input들 - 관리자님 기존 UI 유지 가능)
  );
}