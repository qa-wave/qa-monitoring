import { Skeleton } from "@/components/ui/skeleton";

export default function TestsLoading() {
  return (
    <div className="space-y-6">
      {/* PageHeader skeleton */}
      <div className="flex items-center justify-between">
        <div className="space-y-2">
          <Skeleton className="h-8 w-32" />
          <Skeleton className="h-4 w-80" />
        </div>
        <Skeleton className="h-9 w-28 rounded-md" />
      </div>

      {/* Filter bar skeleton */}
      <div className="flex flex-wrap items-center gap-3">
        <Skeleton className="h-9 w-36 rounded-md" />
        <Skeleton className="h-9 w-32 rounded-md" />
        <Skeleton className="h-9 w-40 rounded-md" />
      </div>

      {/* Table skeleton */}
      <div className="rounded-lg border border-border bg-card">
        {/* Table header */}
        <div className="flex items-center gap-4 border-b border-border px-4 py-3">
          <Skeleton className="h-4 w-32" />
          <Skeleton className="h-4 w-24" />
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-4 w-16" />
          ))}
        </div>
        {/* Table rows */}
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i} className="flex items-center gap-4 border-b border-border/60 px-4 py-3 last:border-b-0">
            <Skeleton className="h-4 w-32" />
            <Skeleton className="h-4 w-24" />
            {Array.from({ length: 4 }).map((_, j) => (
              <div key={j} className="flex items-center gap-1.5">
                <Skeleton className="h-3 w-3 rounded-full" />
                <Skeleton className="h-3 w-12" />
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}
