import { AlphaFeed } from "@/components/alpha-feed";

export default function DashboardPage() {
  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Alpha Feed</h1>
        <p className="text-text-muted text-sm mt-1">
          What developers are building that&apos;s getting traction right now
        </p>
      </div>
      <AlphaFeed />
    </div>
  );
}
