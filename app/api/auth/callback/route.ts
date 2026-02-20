import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/appwrite/admin";
import { ensureUserProfile } from "@/lib/appwrite/helpers";
import { checkRateLimitAsync } from "@/lib/rate-limit";
import { serializeSessionCookie } from "@/lib/auth/cookie";

export async function GET(request: NextRequest) {
  const ip = request.headers.get("x-forwarded-for")?.split(",")[0].trim()
    ?? request.headers.get("x-real-ip")
    ?? "unknown";
  const { allowed } = await checkRateLimitAsync(`oauth-callback:${ip}`, 10, 5 * 60 * 1000);
  if (!allowed) {
    return NextResponse.redirect(
      new URL("/login?error=oauth_failed", request.url)
    );
  }

  const userId = request.nextUrl.searchParams.get("userId");
  const secret = request.nextUrl.searchParams.get("secret");

  if (!userId || !secret) {
    return NextResponse.redirect(
      new URL("/login?error=missing_params", request.url)
    );
  }

  try {
    const { account, databases } = createAdminClient();

    // Exchange OAuth token for a session
    const session = await account.createSession(userId, secret);

    // Ensure user_profiles document exists (OAuth users bypass email signup)
    await ensureUserProfile(databases, userId);

    // Redirect with cookie set via raw header
    const redirectUrl = new URL("/feed", request.url);
    return new Response(null, {
      status: 307,
      headers: {
        Location: redirectUrl.toString(),
        "Set-Cookie": serializeSessionCookie(session.secret),
      },
    });
  } catch (err) {
    console.error("OAuth callback error:", err);
    return NextResponse.redirect(
      new URL("/login?error=oauth_failed", request.url)
    );
  }
}
