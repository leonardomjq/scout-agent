import { Suspense } from "react";
import { redirect } from "next/navigation";
import { getLoggedInUser } from "@/lib/appwrite/server";
import { createAdminClient } from "@/lib/appwrite/admin";
import { getUserTier } from "@/lib/appwrite/helpers";
import { DashboardShell } from "@/components/dashboard-shell";
import { UpgradeSuccessToast } from "@/components/upgrade-success-toast";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getLoggedInUser();
  if (!user) redirect("/login");

  let tier: "free" | "pro" = "free";
  try {
    const { databases } = createAdminClient();
    tier = await getUserTier(user.$id, databases);
  } catch {
    // Fall back to free if tier fetch fails
  }

  const userInfo = { email: user.email, name: user.name || undefined };

  return (
    <DashboardShell tier={tier} user={userInfo}>
      <Suspense>
        <UpgradeSuccessToast />
      </Suspense>
      {children}
    </DashboardShell>
  );
}
