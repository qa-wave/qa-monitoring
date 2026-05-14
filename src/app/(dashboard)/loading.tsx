import { Skeleton } from "@/components/ui/skeleton";

export default function DashboardLoading() {
  return (
    <div className="space-y-6">
      {/* PageHeader skeleton */}
      <div className="space-y-2">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-4 w-96" />
      </div>

      {/* Filter bar skeleton */}
      <div className="flex gap-4">
        <div className="flex gap-1">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-8 w-12 rounded-full" />
          ))}
        </div>
        <Skeleton className="h-4 w-px" />
        <div className="flex gap-1">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-8 w-16 rounded-full" />
          ))}
        </div>
      </div>

      {/* KPI cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="rounded-lg border border-border bg-card p-5 space-y-3">
            <Skeleton className="h-3 w-20" />
            <Skeleton className="h-8 w-24" />
            <Skeleton className="h-3 w-16" />
          </div>
        ))}
      </div>

      {/* Content cards */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        {Array.from({ length: 2 }).map((_, i) => (
          <div key={i} className="rounded-lg border border-border bg-card p-6 space-y-4">
            <Skeleton className="h-5 w-32" />
            {Array.from({ length: 4 }).map((_, j) => (
              <div key={j} className="flex items-center gap-3">
                <Skeleton className="h-3 w-3 rounded-full" />
                <Skeleton className="h-4 flex-1" />
                <Skeleton className="h-4 w-16" />
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}
