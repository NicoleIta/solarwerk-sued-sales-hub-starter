import { createServerClient } from "@supabase/ssr";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export async function middleware(request: NextRequest) {
  const response = NextResponse.next();
  const { pathname } = request.nextUrl;

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll: () => request.cookies.getAll(),
        setAll: (cookiesToSet) => {
          cookiesToSet.forEach(({ name, value, options }) => {
            response.cookies.set(name, value, options);
          });
        },
      },
    }
  );

  const { data: { session } } = await supabase.auth.getSession();

  // Eingeloggter Nutzer versucht /login → weiter zum Dashboard
  if (session && pathname === "/login") {
    return NextResponse.redirect(new URL("/", request.url));
  }

  // Nicht eingeloggter Nutzer versucht geschützte Seite → weiter zu /login
  if (!session && pathname !== "/login") {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  // Eingeloggter Nutzer: prüfe ob Passwortänderung erforderlich
  if (session && pathname !== "/passwort-aendern") {
    const { data: profile } = await supabase
      .from("profiles")
      .select("muss_passwort_aendern")
      .eq("id", session.user.id)
      .single();

    if (profile?.muss_passwort_aendern) {
      return NextResponse.redirect(new URL("/passwort-aendern", request.url));
    }
  }

  return response;
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|api/).*)",
  ],
};
