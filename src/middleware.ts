import { NextResponse, type NextRequest } from "next/server";

const SESSION_COOKIE = "qa_session";

const PUBLIC_PREFIXES = [
  "/login",
  "/status",
  "/api/auth",
  "/api/status",
  "/api/health",
  "/_next",
  "/favicon",
];

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  if (PUBLIC_PREFIXES.some((p) => pathname === p || pathname.startsWith(`${p}/`))) {
    return NextResponse.next();
  }

  const hasSession = req.cookies.has(SESSION_COOKIE);
  if (!hasSession) {
    const url = req.nextUrl.clone();
    url.pathname = "/login";
    url.searchParams.set("from", pathname);
    return NextResponse.redirect(url);
  }

  // Pro /admin a /api/admin potřebujeme pouze přítomnost cookie.
  // Roli (admin) kontroluje samotná stránka/server action přes requireAdmin().
  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|.*\\..*).*)"],
};
