"use server";

import { Client, Account, ID } from "node-appwrite";
import { cookies } from "next/headers";
import { SESSION_COOKIE, DATABASE_ID, COLLECTIONS } from "./collections";
import { createAdminClient } from "./admin";

interface AuthResult {
  error?: string;
}

export async function signInWithEmail(
  email: string,
  password: string
): Promise<AuthResult> {
  try {
    const client = new Client()
      .setEndpoint(process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT!)
      .setProject(process.env.NEXT_PUBLIC_APPWRITE_PROJECT!);

    const account = new Account(client);
    const session = await account.createEmailPasswordSession(email, password);

    const cookieStore = await cookies();
    cookieStore.set(SESSION_COOKIE, session.secret, {
      path: "/",
      httpOnly: true,
      sameSite: "strict",
      secure: process.env.NODE_ENV === "production",
      maxAge: 60 * 60 * 24 * 30, // 30 days
    });

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

    const cookieStore = await cookies();
    cookieStore.set(SESSION_COOKIE, session.secret, {
      path: "/",
      httpOnly: true,
      sameSite: "strict",
      secure: process.env.NODE_ENV === "production",
      maxAge: 60 * 60 * 24 * 30,
    });

    return {};
  } catch (err) {
    const message = err instanceof Error ? err.message : "Sign up failed";
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
