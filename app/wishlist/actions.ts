"use server";

import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { revalidatePath } from "next/cache";

export async function deleteWishlistItem(id: string) {
  const cookieStore = await cookies();
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { cookies: { get(name: string) { return cookieStore.get(name)?.value; } } }
  );

  const { error } = await supabase.from("wishlist").delete().eq("id", id);
  
  if (error) throw new Error("위시리스트 삭제 실패");
  
  // 삭제 후 즉시 화면 새로고침
  revalidatePath("/wishlist");
}