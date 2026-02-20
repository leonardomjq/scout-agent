import { cache } from "react";
import { Client, Account, Databases } from "node-appwrite";
import { cookies } from "next/headers";
import { SESSION_COOKIE } from "./collections";

export const createSessionClient = cache(async () => {
  const cookieStore = await cookies();
  const session = cookieStore.get(SESSION_COOKIE)?.value;

  if (!session) {
    throw new Error("No session");
  }

  const client = new Client()
    .setEndpoint(process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT!)
    .setProject(process.env.NEXT_PUBLIC_APPWRITE_PROJECT!)
    .setSession(session);

  return {
    account: new Account(client),
    databases: new Databases(client),
  };
});

export const getLoggedInUser = cache(async () => {
  try {
    const { account } = await createSessionClient();
    return await account.get();
  } catch {
    // If session cookie exists but Appwrite rejects it, clean up the stale cookie
    // to prevent redirect loops between middleware and dashboard layout
    const cookieStore = await cookies();
    if (cookieStore.get(SESSION_COOKIE)?.value) {
      cookieStore.delete(SESSION_COOKIE);
    }
    return null;
  }
});
