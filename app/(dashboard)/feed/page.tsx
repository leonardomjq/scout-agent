import { Suspense } from "react";
import { AlphaFeed } from "@/components/alpha-feed";

export default function DashboardPage() {
  return (
    <div>
      <div className="mb-6">
        <h1 className="font-[family-name:var(--font-display)] text-2xl font-bold">Alpha Feed</h1>
        <p className="font-[family-name:var(--font-serif)] text-text-muted text-sm mt-1">
          Opportunities detected in the last 72 hours
        </p>
      </div>
      <Suspense>
        <AlphaFeed />
      </Suspense>
    </div>
  );
}
