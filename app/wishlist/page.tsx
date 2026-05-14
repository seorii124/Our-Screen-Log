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

  // [보안] 로그인 상태 확인 (직원 여부 판별)
  const { data: { user } } = await supabase.auth.getUser();
  const isLoggedIn = !!user;

  // 데이터 패칭 (손님을 위한 쇼윈도 전시 - 누구나 조회 가능)
  const { data: wishlist } = await supabase
    .from("wishlist")
    .select("*")
    .order("created_at", { ascending: false });

  // 서버 액션: 등록/수정 (직원 전용)
  async function saveWishlist(formData: FormData, id?: string) {
    "use server";
    const actionCookieStore = await cookies();
    const actionSupabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      { cookies: { get(name: string) { return actionCookieStore.get(name)?.value; } } }
    );

    // 🚨 [핵심 수정] 서버 액션 호출 시에도 직원(로그인)인지 2차 검증 (보안 강화)
    const { data: { user } } = await actionSupabase.auth.getUser();
    if (!user) throw new Error("권한이 없습니다.");

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

  // 서버 액션: 삭제 (직원 전용)
  async function deleteWishlist(id: string) {
    "use server";
    const actionCookieStore = await cookies();
    const actionSupabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      { cookies: { get(name: string) { return actionCookieStore.get(name)?.value; } } }
    );

    // 🚨 [핵심 수정] 삭제 권한 2차 검증
    const { data: { user } } = await actionSupabase.auth.getUser();
    if (!user) throw new Error("권한이 없습니다.");

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