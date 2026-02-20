"use server";

import { Client, Account, OAuthProvider } from "node-appwrite";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { SESSION_COOKIE } from "./collections";
import { createAdminClient } from "./admin";
import { checkRateLimitAsync } from "@/lib/rate-limit";

export interface AuthResult {
  error?: string;
  success?: boolean;
}

function createPlainClient(): Client {
  return new Client()
    .setEndpoint(process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT!)
    .setProject(process.env.NEXT_PUBLIC_APPWRITE_PROJECT!);
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
  const account = new Account(createPlainClient());
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

    const client = createPlainClient();
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
