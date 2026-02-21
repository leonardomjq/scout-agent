import { Suspense } from "react";
import { redirect } from "next/navigation";
import { getLoggedInUser, createSessionClient } from "@/lib/appwrite/server";
import { getUserTier } from "@/lib/appwrite/helpers";
import { PulseDashboard } from "@/components/pulse-dashboard";
import { PulseTeaser } from "@/components/pulse-teaser";

export default async function PulsePage() {
  const user = await getLoggedInUser();
  if (!user) redirect("/login");

  const { databases } = await createSessionClient();
  const tier = await getUserTier(user.$id, databases);

  return (
    <div>
      <div className="mb-6">
        <h1 className="font-[family-name:var(--font-display)] text-2xl font-bold">Pulse</h1>
        <p className="font-[family-name:var(--font-serif)] text-text-muted text-sm mt-1">
          What&apos;s heating up across all opportunities
        </p>
      </div>
      <Suspense>
        {tier === "pro" ? <PulseDashboard /> : <PulseTeaser />}
      </Suspense>
    </div>
  );
}
