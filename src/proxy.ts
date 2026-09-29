import { NextResponse, type NextRequest } from "next/server";
import { SESSION_COOKIE } from "@/lib/auth/constants";

const protectedPrefixes = ["/agenda", "/mis-mascotas", "/admin"];

// Filtro rápido: sin cookie de sesión, las rutas privadas redirigen a /login.
// La validez real de la sesión se comprueba contra SQLite en cada página (requireUser).
export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const isProtected = protectedPrefixes.some((p) => pathname.startsWith(p));

  if (isProtected && !request.cookies.has(SESSION_COOKIE)) {
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    url.search = "";
    url.searchParams.set("next", pathname);
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Aplica a todas las rutas excepto archivos estáticos e imágenes.
     */
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
