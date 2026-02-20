import { NextRequest, NextResponse } from "next/server";
import { Client, Account } from "node-appwrite";
import { SESSION_COOKIE } from "@/lib/appwrite/collections";
import { verifyCsrf } from "@/lib/auth/csrf";
import { clearSessionCookie } from "@/lib/auth/cookie";

export async function POST(request: NextRequest) {
  const csrfError = verifyCsrf(request);
  if (csrfError) return csrfError;

  const sessionValue = request.cookies.get(SESSION_COOKIE)?.value;

  // Best-effort: delete the Appwrite session
  if (sessionValue) {
    try {
      const client = new Client()
        .setEndpoint(process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT!)
        .setProject(process.env.NEXT_PUBLIC_APPWRITE_PROJECT!)
        .setSession(sessionValue);

      const account = new Account(client);
      await account.deleteSession("current");
    } catch {
      // Session may already be expired — ignore
    }
  }

  return new Response(JSON.stringify({ success: true }), {
    status: 200,
    headers: {
      "Content-Type": "application/json",
      "Set-Cookie": clearSessionCookie(),
    },
  });
}
