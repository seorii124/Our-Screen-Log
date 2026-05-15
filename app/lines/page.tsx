import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { revalidatePath } from "next/cache";
import LinesClient from "./LinesClient";

// 🚨 [서버 액션] 컴포넌트 외부에 독립적으로 선언
export async function deleteLine(id: string) {
  "use server";
  const actionCookieStore = await cookies();
  const actionSupabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() { return actionCookieStore.getAll(); },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              actionCookieStore.set(name, value, options)
            );
          } catch {}
        },
      },
    }
  );
  await actionSupabase.from("lines").delete().eq("id", id);
  revalidatePath("/lines");
}

export async function saveLine(data: any) {
  "use server";
  const actionCookieStore = await cookies();
  const actionSupabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() { return actionCookieStore.getAll(); },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              actionCookieStore.set(name, value, options)
            );
          } catch {}
        },
      },
    }
  );
  const { error } = await actionSupabase.from("lines").insert([data]);
  if (error) throw error;
  revalidatePath("/lines");
}

export async function updateLine(id: string, data: any) {
  "use server";
  const actionCookieStore = await cookies();
  const actionSupabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() { return actionCookieStore.getAll(); },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              actionCookieStore.set(name, value, options)
            );
          } catch {}
        },
      },
    }
  );
  const { error } = await actionSupabase.from("lines").update(data).eq("id", id);
  if (error) throw error;
  revalidatePath("/lines");
}

export default async function LinesPage() {
  const cookieStore = await cookies();
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() { return cookieStore.getAll(); },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            );
          } catch {}
        },
      },
    }
  );

  const { data: { user } } = await supabase.auth.getUser().catch(() => ({ data: { user: null } }));
  const isLoggedIn = !!user;

  const { data: lines } = await supabase.from("lines").select("*").order("created_at", { ascending: false });
  const { data: works } = await supabase.from("works").select("id, title").order("title");

  return (
    <div className="max-w-5xl mx-auto p-6 md:p-12">
      <LinesClient 
        initialLines={lines || []} 
        works={works || []} 
        deleteLine={deleteLine} 
        saveLine={saveLine} 
        updateLine={updateLine} 
        isLoggedIn={isLoggedIn} 
      />
    </div>
  );
}