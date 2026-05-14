import { Clock } from "lucide-react";
import { EmptyState } from "@/components/dashboard/EmptyState";
import { formatDateTime, formatRelativeTime } from "@/lib/utils";

interface TimelineUpdate {
  at: string;
  author: string;
  message: string;
}

interface IncidentTimelineProps {
  updates: TimelineUpdate[];
  startedAt: string;
  resolvedAt: string | null;
}

export function IncidentTimeline({
  updates,
  startedAt: _startedAt,
  resolvedAt,
}: IncidentTimelineProps) {
  if (updates.length === 0) {
    return (
      <EmptyState title="Žádné aktualizace" description="Zatím nebyly zaznamenány žádné aktualizace." icon={Clock} className="py-8" />
    );
  }

  return (
    <ol className="relative ml-3 space-y-0">
      {/* Vertical line */}
      <span
        className="absolute left-0 top-2 bottom-2 w-0.5 bg-border"
        aria-hidden="true"
      />

      {updates.map((u, i) => {
        const isFirst = i === 0;
        const isLast = i === updates.length - 1;

        // Dot color: first=red (started), last+resolved=green, otherwise yellow
        let dotColor: string;
        if (isFirst) {
          dotColor = "bg-[hsl(var(--status-down))]"; // red
        } else if (isLast && resolvedAt) {
          dotColor = "bg-[hsl(var(--status-ok))]"; // green
        } else {
          dotColor = "bg-[hsl(var(--status-warn))]"; // yellow
        }

        return (
          <li key={i} className="relative pl-7 pb-6 last:pb-0">
            {/* Dot */}
            <span
              className={`absolute left-0 top-2 -translate-x-1/2 h-3 w-3 rounded-full ring-2 ring-background ${dotColor}`}
              aria-hidden="true"
            />

            {/* Content card */}
            <div className="rounded-md border border-border bg-card p-3">
              <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                <span className="font-medium text-foreground">{u.author}</span>
                <span>&middot;</span>
                <time dateTime={u.at}>{formatDateTime(u.at)}</time>
                <span>&middot;</span>
                <span>{formatRelativeTime(u.at)}</span>
                {isFirst && (
                  <span className="ml-auto rounded bg-[hsl(var(--status-down))/0.15] px-1.5 py-0.5 text-[10px] font-medium uppercase tracking-wider text-[hsl(var(--status-down))]">
                    Začátek
                  </span>
                )}
                {isLast && resolvedAt && (
                  <span className="ml-auto rounded bg-[hsl(var(--status-ok))/0.15] px-1.5 py-0.5 text-[10px] font-medium uppercase tracking-wider text-[hsl(var(--status-ok))]">
                    Vyřešeno
                  </span>
                )}
              </div>
              <p className="mt-1 text-sm">{u.message}</p>
            </div>
          </li>
        );
      })}
    </ol>
  );
}
