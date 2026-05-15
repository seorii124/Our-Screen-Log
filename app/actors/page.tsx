import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { revalidatePath } from "next/cache";
import ActorsClient from "./ActorsClient";

export async function deleteActor(id: string) {
  "use server";
  const actionCookieStore = await cookies();
  const actionSupabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() { return actionCookieStore.getAll(); },
        setAll(cookiesToSet) {
          try { cookiesToSet.forEach(({ name, value, options }) => actionCookieStore.set(name, value, options)); } catch {}
        }
      }
    }
  );
  await actionSupabase.from("actors").delete().eq("id", id);
  revalidatePath("/actors");
}

export async function saveActor(data: any) {
  "use server";
  const actionCookieStore = await cookies();
  const actionSupabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() { return actionCookieStore.getAll(); },
        setAll(cookiesToSet) {
          try { cookiesToSet.forEach(({ name, value, options }) => actionCookieStore.set(name, value, options)); } catch {}
        }
      }
    }
  );

  const { error } = await actionSupabase.from("actors").insert([data]);
  if (error) throw error;
  revalidatePath("/actors");
}

export default async function ActorsPage() {
  const cookieStore = await cookies();
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() { return cookieStore.getAll(); },
        setAll(cookiesToSet) {
          try { cookiesToSet.forEach(({ name, value, options }) => cookieStore.set(name, value, options)); } catch {}
        }
      }
    }
  );

  const { data: { user } } = await supabase.auth.getUser().catch(() => ({ data: { user: null } }));
  const isLoggedIn = !!user;

  // 핀 고정된 항목을 먼저, 그 다음 최신순으로 정렬하여 가져옵니다.
  const { data: actors } = await supabase
    .from("actors")
    .select("*")
    .order("is_pinned", { ascending: false })
    .order("created_at", { ascending: false });

  return (
    <div className="max-w-6xl mx-auto p-6 md:p-12">
      <ActorsClient initialActors={actors || []} deleteActor={deleteActor} saveActor={saveActor} isLoggedIn={isLoggedIn} />
    </div>
  );
}