import { NextRequest, NextResponse } from "next/server";
import { ID } from "node-appwrite";
import { createAdminClient } from "@/lib/appwrite/admin";
import { ensureUserProfile } from "@/lib/appwrite/helpers";
import { verifyCsrf } from "@/lib/auth/csrf";
import { checkRateLimitAsync } from "@/lib/rate-limit";
import { serializeSessionCookie } from "@/lib/auth/cookie";

export async function POST(request: NextRequest) {
  const csrfError = verifyCsrf(request);
  if (csrfError) return csrfError;

  let body: { email?: string; password?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const { email, password } = body;
  if (!email || !password) {
    return NextResponse.json({ error: "Email and password are required" }, { status: 400 });
  }

  if (password.length < 8) {
    return NextResponse.json({ error: "Password must be at least 8 characters" }, { status: 400 });
  }

  const ip =
    request.headers.get("x-forwarded-for")?.split(",")[0].trim() ??
    request.headers.get("x-real-ip") ??
    "unknown";

  const { allowed } = await checkRateLimitAsync(`signup:${ip}`, 3, 60 * 60 * 1000);
  if (!allowed) {
    return NextResponse.json({ error: "Too many attempts. Try again later." }, { status: 429 });
  }

  try {
    const { users, databases, account } = createAdminClient();
    const user = await users.create(ID.unique(), email, undefined, password);

    const [, session] = await Promise.all([
      ensureUserProfile(databases, user.$id),
      account.createEmailPasswordSession(email, password),
    ]);

    return new Response(JSON.stringify({ success: true }), {
      status: 201,
      headers: {
        "Content-Type": "application/json",
        "Set-Cookie": serializeSessionCookie(session.secret),
      },
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Sign up failed";
    const status = message.includes("already") ? 409 : 400;
    return NextResponse.json({ error: message }, { status });
  }
}
