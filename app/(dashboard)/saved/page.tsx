import { Suspense } from "react";
import { SavedFeed } from "@/components/saved-feed";

export default function SavedPage() {
  return (
    <div>
      <div className="mb-6">
        <h1 className="font-[family-name:var(--font-display)] text-2xl font-bold">Saved</h1>
        <p className="font-[family-name:var(--font-serif)] text-text-muted text-sm mt-1">
          Opportunities you bookmarked for later
        </p>
      </div>
      <Suspense>
        <SavedFeed />
      </Suspense>
    </div>
  );
}
