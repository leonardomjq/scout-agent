export default function DashboardLoading() {
  return (
    <div>
      {/* Heading */}
      <div className="mb-6">
        <div className="h-8 w-40 bg-surface-elevated rounded animate-pulse" />
        <div className="h-4 w-72 bg-surface-elevated rounded animate-pulse mt-2" />
      </div>

      {/* Filter pills */}
      <div className="flex flex-wrap gap-4 mb-6">
        <div className="flex gap-2">
          {Array.from({ length: 5 }).map((_, i) => (
            <div
              key={i}
              className="h-7 w-20 bg-surface-elevated rounded animate-pulse"
            />
          ))}
        </div>
        <div className="flex gap-2">
          {Array.from({ length: 4 }).map((_, i) => (
            <div
              key={i}
              className="h-7 w-16 bg-surface-elevated rounded animate-pulse"
            />
          ))}
        </div>
      </div>

      {/* 6-card grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5 lg:gap-6">
        {Array.from({ length: 4 }).map((_, i) => (
          <div
            key={i}
            className="bg-surface border border-border rounded-lg p-5 space-y-3"
          >
            <div className="flex justify-between">
              <div className="h-3 w-24 bg-surface-elevated rounded animate-pulse" />
              <div className="h-5 w-14 bg-surface-elevated rounded-full animate-pulse" />
            </div>
            <div className="h-5 w-3/4 bg-surface-elevated rounded animate-pulse" />
            <div className="h-4 w-full bg-surface-elevated rounded animate-pulse" />
            <div className="flex gap-1.5">
              {Array.from({ length: 3 }).map((_, j) => (
                <div
                  key={j}
                  className="h-5 w-16 bg-surface-elevated rounded animate-pulse"
                />
              ))}
            </div>
            <div className="flex justify-between">
              <div className="h-3 w-16 bg-surface-elevated rounded animate-pulse" />
              <div className="h-3 w-20 bg-surface-elevated rounded animate-pulse" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
