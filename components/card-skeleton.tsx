import { Card } from "@/components/ui/card";

export function CardSkeleton() {
  return (
    <Card padding="spacious" className="h-full flex flex-col">
      <div className="flex justify-between mb-4">
        <div className="h-3 w-24 bg-surface-elevated rounded animate-pulse" />
        <div className="h-5 w-14 bg-surface-elevated rounded-full animate-pulse" />
      </div>
      <div className="h-6 w-3/4 bg-surface-elevated rounded animate-pulse mb-3" />
      <div className="flex gap-1.5 mb-4">
        <div className="h-5 w-16 bg-surface-elevated rounded animate-pulse" />
        <div className="h-5 w-20 bg-surface-elevated rounded animate-pulse" />
        <div className="h-5 w-14 bg-surface-elevated rounded animate-pulse" />
      </div>
      <div className="h-4 w-full bg-surface-elevated rounded animate-pulse" />
      <div className="flex-1" />
      <div className="flex justify-between pt-3 mt-4 border-t border-text-dim/20">
        <div className="h-3 w-16 bg-surface-elevated rounded animate-pulse" />
        <div className="h-3 w-20 bg-surface-elevated rounded animate-pulse" />
      </div>
    </Card>
  );
}
