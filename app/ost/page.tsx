import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { revalidatePath } from "next/cache";
import OstClient from "./OstClient";

export async function deleteOst(id: string) {
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
  await actionSupabase.from("ost").delete().eq("id", id);
  revalidatePath("/ost");
}

export async function saveOst(data: any) {
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
  const { error } = await actionSupabase.from("ost").insert([data]);
  if (error) throw error;
  revalidatePath("/ost");
}

// 🚨 [새 기능] 기존 OST 데이터 업데이트 액션
export async function updateOst(id: string, data: any) {
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
  const { error } = await actionSupabase.from("ost").update(data).eq("id", id);
  if (error) throw error;
  revalidatePath("/ost");
}

export default async function OstPage() {
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

  const { data: osts } = await supabase
    .from("ost")
    .select("*")
    .order("created_at", { ascending: false });

  // media_title과 구형 movie_title 호환 유지
  const safeOsts = (osts || []).map((item: any) => ({
    ...item,
    media_title: item.media_title || item.movie_title || "정보 없음"
  }));

  return (
    <div className="max-w-6xl mx-auto p-6 md:p-12">
      <OstClient 
        initialOsts={safeOsts} 
        deleteOst={deleteOst} 
        saveOst={saveOst} 
        updateOst={updateOst} 
        isLoggedIn={isLoggedIn} 
      />
    </div>
  );
}