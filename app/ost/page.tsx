import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { revalidatePath } from "next/cache";
import OstClient from "./OstClient";

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

  // 🚨 [핀셋 보수] media_title을 명시적으로 선택하여 가져옵니다.
  const { data: osts, error } = await supabase
    .from("ost")
    .select("id, title, artist, media_title, cover_image_url, youtube_url, description")
    .order("created_at", { ascending: false });

  if (error) {
    console.error("OST Fetch Error:", error);
  }

  // 서버에서 클라이언트로 데이터를 넘길 때 안전하게 빈 배열을 보장합니다.
  const safeOsts = osts || [];

  async function deleteOst(id: string) {
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

  async function saveOst(formData: FormData) {
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

    const payload = {
      title: formData.get("title") as string,
      artist: formData.get("artist") as string,
      media_title: formData.get("media_title") as string,
      cover_image_url: formData.get("cover_image_url") as string,
      youtube_url: formData.get("youtube_url") as string,
      description: formData.get("description") as string,
    };

    const { error: insertError } = await actionSupabase.from("ost").insert([payload]);
    if (insertError) throw insertError;
    
    revalidatePath("/ost");
  }

  return (
    <div className="max-w-7xl mx-auto p-4 md:p-10">
      <OstClient initialOsts={safeOsts} deleteOst={deleteOst} saveOst={saveOst} isLoggedIn={isLoggedIn} />
    </div>
  );
}