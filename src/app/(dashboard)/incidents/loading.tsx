import { Skeleton } from "@/components/ui/skeleton";

export default function IncidentsLoading() {
  return (
    <div className="space-y-6">
      {/* PageHeader skeleton */}
      <div className="flex items-center justify-between">
        <div className="space-y-2">
          <Skeleton className="h-8 w-36" />
          <Skeleton className="h-4 w-72" />
        </div>
        <Skeleton className="h-9 w-28 rounded-md" />
      </div>

      {/* Controls: tabs + severity + sort + search */}
      <div className="space-y-4">
        <div className="flex flex-wrap items-center gap-3">
          {/* Tab group skeleton */}
          <div className="flex rounded-md border border-border">
            {Array.from({ length: 3 }).map((_, i) => (
              <Skeleton key={i} className="h-8 w-24 first:rounded-l-md last:rounded-r-md" />
            ))}
          </div>

          {/* Severity pills */}
          <div className="flex gap-1">
            {Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} className="h-7 w-14 rounded-full" />
            ))}
          </div>

          {/* Sort dropdown */}
          <Skeleton className="h-9 w-32 rounded-md" />

          {/* Search input */}
          <Skeleton className="h-9 w-48 rounded-md" />
        </div>
      </div>

      {/* Incident list rows */}
      <div className="rounded-lg border border-border bg-card">
        {Array.from({ length: 6 }).map((_, i) => (
          <div
            key={i}
            className="flex items-start gap-3 border-b border-border/60 p-4 last:border-b-0"
          >
            <Skeleton className="mt-1 h-3 w-3 shrink-0 rounded-full" />
            <div className="flex-1 space-y-2">
              <div className="flex items-center gap-2">
                <Skeleton className="h-5 w-12 rounded-full" />
                <Skeleton className="h-4 w-64" />
              </div>
              <Skeleton className="h-3 w-48" />
            </div>
            <Skeleton className="h-5 w-20 rounded-full" />
          </div>
        ))}
      </div>
    </div>
  );
}
