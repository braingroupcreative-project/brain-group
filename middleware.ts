import { NextResponse, type NextRequest } from "next/server";
import { jwtVerify } from "jose";

/** Barrière d'accès à /admin (la vérification fine des rôles est refaite côté serveur dans chaque page/action). */
export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  if (pathname === "/admin/login") return NextResponse.next();
  const token = req.cookies.get("bg_session")?.value;
  const secret =
    process.env.AUTH_SECRET ||
    (process.env.NODE_ENV !== "production" ? "dev-only-secret-change-me-dev-only-secret" : "");
  if (token && secret) {
    try {
      await jwtVerify(token, new TextEncoder().encode(secret));
      return NextResponse.next();
    } catch {}
  }
  if (pathname.startsWith("/api/")) return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
  const url = req.nextUrl.clone();
  url.pathname = "/admin/login";
  url.search = "";
  return NextResponse.redirect(url);
}

export const config = { matcher: ["/admin/:path*", "/api/admin/:path*"] };
