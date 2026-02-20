import { NextRequest, NextResponse } from "next/server";

const SESSION_COOKIE = "scout_session";

const PUBLIC_PATHS = new Set([
  "/",
  "/login",
  "/signup",
  "/forgot-password",
  "/reset-password",
  "/terms",
  "/privacy",
]);
const PUBLIC_PREFIXES = ["/api/", "/preview/"];
const PROTECTED_PREFIXES = ["/feed", "/alpha/", "/settings"];

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const hasSession = request.cookies.has(SESSION_COOKIE);

  // Public paths — always accessible
  if (PUBLIC_PATHS.has(pathname)) {
    return NextResponse.next();
  }

  // Public prefixes — always accessible
  if (PUBLIC_PREFIXES.some((p) => pathname.startsWith(p))) {
    return NextResponse.next();
  }

  // Protected routes — redirect to /login if no session
  const isProtected = PROTECTED_PREFIXES.some((p) => pathname.startsWith(p));
  if (isProtected && !hasSession) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all paths except:
     * - _next/static (static files)
     * - _next/image (image optimization)
     * - favicon.ico
     */
    "/((?!_next/static|_next/image|favicon.ico).*)",
  ],
};
