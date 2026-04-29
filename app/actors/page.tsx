import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { revalidatePath } from "next/cache";
import ActorsClient from "./ActorsClient";

export default async function ActorsPage() {
  const cookieStore = await cookies();
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { cookies: { get(name: string) { return cookieStore.get(name)?.value; } } }
  );

  // 1. 데이터 패칭
  const { data: actors } = await supabase
    .from("actors")
    .select("*")
    .order("created_at", { ascending: false });

  // 2. 서버 액션: 삭제
  async function deleteActor(id: string) {
    "use server";
    const actionCookieStore = await cookies();
    const actionSupabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      { cookies: { get(name: string) { return actionCookieStore.get(name)?.value; } } }
    );
    await actionSupabase.from("actors").delete().eq("id", id);
    revalidatePath("/actors");
  }

  // 3. 서버 액션: 등록 및 수정 (Upsert)
  async function saveActor(formData: FormData, id?: string) {
    "use server";
    const actionCookieStore = await cookies();
    const actionSupabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      { cookies: { get(name: string) { return actionCookieStore.get(name)?.value; } } }
    );

    const payload = {
      name: formData.get("name") as string,
      profile_image_url: formData.get("profile_image_url") as string,
      description: formData.get("description") as string,
    };

    if (id) {
      await actionSupabase.from("actors").update(payload).eq("id", id);
    } else {
      await actionSupabase.from("actors").insert([payload]);
    }
    revalidatePath("/actors");
  }

  return (
    <div className="max-w-7xl mx-auto p-4 md:p-10">
      <ActorsClient 
        initialActors={actors || []} 
        deleteActor={deleteActor} 
        saveActor={saveActor} 
      />
    </div>
  );
}