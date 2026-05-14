import { Skeleton } from "@/components/ui/skeleton";

export default function ReleasesLoading() {
  return (
    <div className="space-y-6">
      {/* PageHeader skeleton */}
      <div className="space-y-2">
        <Skeleton className="h-8 w-36" />
        <Skeleton className="h-4 w-64" />
      </div>

      {/* 3 KPI cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="rounded-lg border border-border bg-card p-5 space-y-3">
            <Skeleton className="h-3 w-24" />
            <Skeleton className="h-8 w-16" />
            <Skeleton className="h-3 w-12" />
          </div>
        ))}
      </div>

      {/* Release list */}
      <div className="rounded-lg border border-border bg-card p-2">
        {Array.from({ length: 8 }).map((_, i) => (
          <div
            key={i}
            className="border-b border-border/60 px-2 py-3 last:border-b-0 space-y-2"
          >
            <div className="flex items-center gap-3">
              <Skeleton className="h-5 w-5 rounded-full" />
              <Skeleton className="h-4 w-48" />
              <Skeleton className="h-5 w-16 rounded-full" />
              <div className="flex-1" />
              <Skeleton className="h-3 w-24" />
            </div>
            {/* PR badges placeholder (shown on ~half the rows) */}
            {i % 2 === 0 && (
              <div className="flex gap-1.5 px-2">
                {Array.from({ length: 2 + (i % 3) }).map((_, j) => (
                  <Skeleton key={j} className="h-5 w-16 rounded-full" />
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
