import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { revalidatePath } from "next/cache";
import WishlistClient from "./WishlistClient";

export async function deleteWishlist(id: string) {
  "use server";
  const actionCookieStore = await cookies();
  const actionSupabase = createServerClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!, {
    cookies: { getAll() { return actionCookieStore.getAll(); }, setAll(cookiesToSet) { try { cookiesToSet.forEach(({ name, value, options }) => actionCookieStore.set(name, value, options)); } catch {} } }
  });
  await actionSupabase.from("wishlist").delete().eq("id", id);
  revalidatePath("/wishlist");
}

export async function saveWishlist(data: any) {
  "use server";
  const actionCookieStore = await cookies();
  const actionSupabase = createServerClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!, {
    cookies: { getAll() { return actionCookieStore.getAll(); }, setAll(cookiesToSet) { try { cookiesToSet.forEach(({ name, value, options }) => actionCookieStore.set(name, value, options)); } catch {} } }
  });
  const { error } = await actionSupabase.from("wishlist").insert([data]);
  if (error) throw error;
  revalidatePath("/wishlist");
}

export default async function WishlistPage() {
  const cookieStore = await cookies();
  const supabase = createServerClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!, {
    cookies: { getAll() { return cookieStore.getAll(); }, setAll(cookiesToSet) { try { cookiesToSet.forEach(({ name, value, options }) => cookieStore.set(name, value, options)); } catch {} } }
  });

  const { data: { user } } = await supabase.auth.getUser().catch(() => ({ data: { user: null } }));
  const isLoggedIn = !!user;

  const { data: wishlist } = await supabase.from("wishlist").select("*").order("created_at", { ascending: false });

  return (
    <div className="max-w-6xl mx-auto p-6 md:p-12">
      <WishlistClient initialWishlist={wishlist || []} deleteWishlist={deleteWishlist} saveWishlist={saveWishlist} isLoggedIn={isLoggedIn} />
    </div>
  );
}