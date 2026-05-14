import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { revalidatePath } from "next/cache";
import OstClient from "./OstClient";

export default async function OstPage() {
  const cookieStore = await cookies();
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { cookies: { get(name: string) { return cookieStore.get(name)?.value; } } }
  );

  // 에러 발생 시 앱이 죽지 않도록 catch 예외 처리
  const { data: { user } } = await supabase.auth.getUser().catch(() => ({ data: { user: null } }));
  const isLoggedIn = !!user;

  // 1. 데이터 패칭
  const { data: ostList } = await supabase
    .from("ost")
    .select("*")
    .order("created_at", { ascending: false });

  // 2. 서버 액션: 삭제
  async function deleteOst(id: string) {
    "use server";
    const actionCookieStore = await cookies();
    const actionSupabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      { cookies: { get(name: string) { return actionCookieStore.get(name)?.value; } } }
    );
    await actionSupabase.from("ost").delete().eq("id", id);
    revalidatePath("/ost");
  }

  // 3. 서버 액션: 등록 및 수정 (Upsert)
  async function saveOst(formData: FormData, id?: string) {
    "use server";
    const actionCookieStore = await cookies();
    const actionSupabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      { cookies: { get(name: string) { return actionCookieStore.get(name)?.value; } } }
    );

    const payload = {
      title: formData.get("title") as string,
      embed_url: formData.get("embed_url") as string,
      description: formData.get("description") as string,
    };

    if (id) {
      await actionSupabase.from("ost").update(payload).eq("id", id);
    } else {
      await actionSupabase.from("ost").insert([payload]);
    }
    revalidatePath("/ost");
  }

  return (
    <div className="max-w-7xl mx-auto p-4 md:p-10">
      <OstClient 
        initialOst={ostList || []} 
        deleteOst={deleteOst} 
        saveOst={saveOst} 
        isLoggedIn={isLoggedIn} 
      />
    </div>
  );
}