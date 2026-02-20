"use server";

import { Client, Account, ID, OAuthProvider } from "node-appwrite";
import { cookies, headers } from "next/headers";
import { redirect } from "next/navigation";
import { SESSION_COOKIE, DATABASE_ID, COLLECTIONS, setSessionCookie } from "./collections";
import { createAdminClient } from "./admin";
import { checkRateLimitAsync } from "@/lib/rate-limit";

interface AuthResult {
  error?: string;
}

async function getClientIp(): Promise<string> {
  const h = await headers();
  const forwarded = h.get("x-forwarded-for");
  if (forwarded) return forwarded.split(",")[0].trim();
  return h.get("x-real-ip") ?? "unknown";
}

export async function signInWithEmail(
  email: string,
  password: string
): Promise<AuthResult> {
  const { allowed } = await checkRateLimitAsync(`signin:${email}`, 5, 15 * 60 * 1000);
  if (!allowed) {
    return { error: "Too many attempts. Try again later." };
  }

  try {
    const client = new Client()
      .setEndpoint(process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT!)
      .setProject(process.env.NEXT_PUBLIC_APPWRITE_PROJECT!);

    const account = new Account(client);
    const session = await account.createEmailPasswordSession(email, password);

    await setSessionCookie(session.secret);

    return {};
  } catch (err) {
    const message = err instanceof Error ? err.message : "Sign in failed";
    return { error: message };
  }
}

export async function signUpWithEmail(
  email: string,
  password: string
): Promise<AuthResult> {
  const ip = await getClientIp();
  const { allowed } = await checkRateLimitAsync(`signup:${ip}`, 3, 60 * 60 * 1000);
  if (!allowed) {
    return { error: "Too many attempts. Try again later." };
  }

  try {
    const { users, databases } = createAdminClient();

    // Create user via admin SDK
    const user = await users.create(ID.unique(), email, undefined, password);

    // Create user_profiles doc (replaces handle_new_user DB trigger)
    await databases.createDocument(
      DATABASE_ID,
      COLLECTIONS.USER_PROFILES,
      user.$id,
      {
        tier: "free",
        stripe_customer_id: null,
      }
    );

    // Create session so user is immediately logged in
    const client = new Client()
      .setEndpoint(process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT!)
      .setProject(process.env.NEXT_PUBLIC_APPWRITE_PROJECT!);

    const account = new Account(client);
    const session = await account.createEmailPasswordSession(email, password);

    await setSessionCookie(session.secret);

    return {};
  } catch (err) {
    const message = err instanceof Error ? err.message : "Sign up failed";
    return { error: message };
  }
}

export async function requestPasswordReset(
  email: string
): Promise<AuthResult> {
  const { allowed } = await checkRateLimitAsync(`reset:${email}`, 3, 60 * 60 * 1000);
  if (!allowed) {
    // Silent — don't leak account existence
    return {};
  }

  try {
    const { account } = createAdminClient();
    const resetUrl = `${process.env.NEXT_PUBLIC_APP_URL}/reset-password`;
    await account.createRecovery(email, resetUrl);
    return {};
  } catch {
    // Don't reveal whether account exists
    return {};
  }
}

export async function signInWithOAuth(
  provider: "google" | "github"
): Promise<never> {
  // Clean client — no API key, no session.
  // createOAuth2Token is a public Appwrite operation.
  const client = new Client()
    .setEndpoint(process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT!)
    .setProject(process.env.NEXT_PUBLIC_APPWRITE_PROJECT!);

  const account = new Account(client);
  const redirectUrl = await account.createOAuth2Token(
    provider === "google" ? OAuthProvider.Google : OAuthProvider.Github,
    `${process.env.NEXT_PUBLIC_APP_URL}/api/auth/callback`,
    `${process.env.NEXT_PUBLIC_APP_URL}/login?error=oauth_failed`
  );

  // redirect() throws NEXT_REDIRECT internally — do NOT wrap in try/catch
  redirect(redirectUrl);
}

export async function confirmPasswordReset(
  userId: string,
  secret: string,
  password: string
): Promise<AuthResult> {
  const { allowed } = await checkRateLimitAsync(`confirm-reset:${userId}`, 5, 30 * 60 * 1000);
  if (!allowed) {
    return { error: "Too many attempts. Request a new reset link." };
  }

  try {
    const { account } = createAdminClient();
    await account.updateRecovery(userId, secret, password);
    return {};
  } catch (err) {
    const message =
      err instanceof Error ? err.message : "Password reset failed";
    return { error: message };
  }
}

export async function changePassword(
  currentPassword: string,
  newPassword: string
): Promise<AuthResult> {
  try {
    const cookieStore = await cookies();
    const session = cookieStore.get(SESSION_COOKIE)?.value;

    if (!session) {
      return { error: "Not authenticated" };
    }

    const client = new Client()
      .setEndpoint(process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT!)
      .setProject(process.env.NEXT_PUBLIC_APPWRITE_PROJECT!);
    client.setSession(session);

    const account = new Account(client);
    await account.updatePassword(newPassword, currentPassword);

    // Invalidate all other sessions (stolen sessions stay active otherwise)
    try {
      const currentSession = await account.getSession("current");
      const sessions = await account.listSessions();
      for (const s of sessions.sessions) {
        if (s.$id !== currentSession.$id) {
          await account.deleteSession(s.$id);
        }
      }
    } catch {
      // Best-effort — don't fail the password change if session cleanup errors
    }

    return {};
  } catch (err) {
    const message =
      err instanceof Error ? err.message : "Password change failed";
    return { error: message };
  }
}

export async function signOut(): Promise<void> {
  try {
    const client = new Client()
      .setEndpoint(process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT!)
      .setProject(process.env.NEXT_PUBLIC_APPWRITE_PROJECT!);

    const cookieStore = await cookies();
    const session = cookieStore.get(SESSION_COOKIE)?.value;

    if (session) {
      client.setSession(session);
      const account = new Account(client);
      await account.deleteSession("current");
    }
  } catch {
    // Session may already be expired
  } finally {
    const cookieStore = await cookies();
    cookieStore.delete(SESSION_COOKIE);
  }
}
