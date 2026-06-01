import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

// Server-seitiger Supabase-Client für API Routes und Server Components.
// Liest die Session aus den Cookies — dadurch kennt Supabase auth.uid()
// und die RLS-Policies greifen korrekt.
export async function createSupabaseServerClient() {
  const cookieStore = await cookies();
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) =>
            cookieStore.set(name, value, options)
          );
        },
      },
    }
  );
}
