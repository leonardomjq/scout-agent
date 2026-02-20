import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/appwrite/admin";
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

  const { allowed } = await checkRateLimitAsync(`signin:${email}`, 5, 15 * 60 * 1000);
  if (!allowed) {
    return NextResponse.json({ error: "Too many attempts. Try again later." }, { status: 429 });
  }

  try {
    const { account } = createAdminClient();
    const session = await account.createEmailPasswordSession(email, password);

    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        "Set-Cookie": serializeSessionCookie(session.secret),
      },
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Sign in failed";
    return NextResponse.json({ error: message }, { status: 401 });
  }
}
