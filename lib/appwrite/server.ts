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
  } catch (err) {
    const cookieStore = await cookies();
    const hasSession = !!cookieStore.get(SESSION_COOKIE)?.value;

    if (hasSession) {
      console.error(
        "[auth] getLoggedInUser: cookie present but Appwrite rejected it:",
        err instanceof Error ? err.message : err
      );
      cookieStore.delete(SESSION_COOKIE);
    }

    return null;
  }
});
