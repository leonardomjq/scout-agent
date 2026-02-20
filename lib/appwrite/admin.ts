import { Account, Client, Databases, Users } from "node-appwrite";

let adminClient: Client | null = null;

function getAdminClient(): Client {
  if (!adminClient) {
    adminClient = new Client()
      .setEndpoint(process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT!)
      .setProject(process.env.NEXT_PUBLIC_APPWRITE_PROJECT!)
      .setKey(process.env.APPWRITE_API_KEY!);
  }
  return adminClient;
}

export function createAdminClient() {
  const client = getAdminClient();
  return {
    account: new Account(client),
    databases: new Databases(client),
    users: new Users(client),
  };
}
