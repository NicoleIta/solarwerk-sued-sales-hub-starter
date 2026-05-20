import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  const session = request.cookies.get("session");
  const { pathname } = request.nextUrl;

  // Eingeloggter User versucht /login aufzurufen → weiter zum Dashboard
  if (session && pathname === "/login") {
    return NextResponse.redirect(new URL("/", request.url));
  }

  // Nicht eingeloggter User versucht eine geschützte Seite aufzurufen → weiter zu /login
  if (!session && pathname !== "/login") {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  return NextResponse.next();
}

// Welche Routen soll die Middleware überwachen?
export const config = {
  matcher: [
    /*
     * Alle Routen außer:
     * - _next/static  (statische Dateien)
     * - _next/image   (Bilder)
     * - favicon.ico   (Browser-Icon)
     * - api/          (API-Routen)
     */
    "/((?!_next/static|_next/image|favicon.ico|api/).*)",
  ],
};
