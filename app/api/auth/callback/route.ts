import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/appwrite/admin";
import { DATABASE_ID, COLLECTIONS, setSessionCookie } from "@/lib/appwrite/collections";
import { checkRateLimitAsync } from "@/lib/rate-limit";

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

    // Ensure user_profiles document exists (OAuth users bypass signUpWithEmail)
    try {
      await databases.getDocument(DATABASE_ID, COLLECTIONS.USER_PROFILES, userId);
    } catch (getErr: unknown) {
      const e = getErr as { code?: number };
      if (e.code === 404) {
        try {
          await databases.createDocument(
            DATABASE_ID,
            COLLECTIONS.USER_PROFILES,
            userId,
            { tier: "free", stripe_customer_id: null }
          );
        } catch (createErr: unknown) {
          const ce = createErr as { code?: number };
          // 409 = race condition, another request already created it — safe to ignore
          if (ce.code !== 409) throw createErr;
        }
      } else {
        throw getErr;
      }
    }

    // Set session cookie (same config as email auth)
    await setSessionCookie(session.secret);

    return NextResponse.redirect(new URL("/feed", request.url));
  } catch (err) {
    console.error("OAuth callback error:", err);
    return NextResponse.redirect(
      new URL("/login?error=oauth_failed", request.url)
    );
  }
}
