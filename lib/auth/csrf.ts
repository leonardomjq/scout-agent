import { NextRequest, NextResponse } from "next/server";

/**
 * Verify the request Origin header matches our app URL.
 * Returns a 403 NextResponse on mismatch, or null if the check passes.
 */
export function verifyCsrf(request: NextRequest): NextResponse | null {
  const origin = request.headers.get("origin");
  const appUrl = process.env.NEXT_PUBLIC_APP_URL;

  if (!appUrl) return null; // skip in dev if not set

  if (origin && new URL(origin).origin !== new URL(appUrl).origin) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  return null;
}
