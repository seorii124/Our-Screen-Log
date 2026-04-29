import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { revalidatePath } from "next/cache";
import WishlistClient from "./WishlistClient";

export default async function WishlistPage() {
  const cookieStore = await cookies();
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { cookies: { get(name: string) { return cookieStore.get(name)?.value; } } }
  );

  // [보안] 로그인 상태 확인
  const { data: { user } } = await supabase.auth.getUser();
  const isLoggedIn = !!user;

  // 데이터 패칭
  const { data: wishlist } = await supabase
    .from("wishlist")
    .select("*")
    .order("created_at", { ascending: false });

  // 서버 액션: 등록/수정
  async function saveWishlist(formData: FormData, id?: string) {
    "use server";
    const actionCookieStore = await cookies();
    const actionSupabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      { cookies: { get(name: string) { return actionCookieStore.get(name)?.value; } } }
    );

    const payload = {
      title: formData.get("title") as string,
      poster_url: formData.get("poster_url") as string,
      expectation: formData.get("expectation") as string,
    };

    if (id) {
      await actionSupabase.from("wishlist").update(payload).eq("id", id);
    } else {
      await actionSupabase.from("wishlist").insert([payload]);
    }
    revalidatePath("/wishlist");
  }

  // 서버 액션: 삭제
  async function deleteWishlist(id: string) {
    "use server";
    const actionCookieStore = await cookies();
    const actionSupabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      { cookies: { get(name: string) { return actionCookieStore.get(name)?.value; } } }
    );
    await actionSupabase.from("wishlist").delete().eq("id", id);
    revalidatePath("/wishlist");
  }

  return (
    <div className="max-w-7xl mx-auto p-4 md:p-10">
      <WishlistClient 
        initialData={wishlist || []} 
        isLoggedIn={isLoggedIn} 
        saveWishlist={saveWishlist} 
        deleteWishlist={deleteWishlist} 
      />
    </div>
  );
}