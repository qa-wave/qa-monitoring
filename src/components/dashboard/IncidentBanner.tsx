import Link from "next/link";
import { AlertTriangle, ChevronRight } from "lucide-react";
import { formatRelativeTime } from "@/lib/utils";
import type { Incident } from "@/lib/types";

export function IncidentBanner({ incident }: { incident: Incident }) {
  if (!incident) return null;
  const tone = incident.severity === "sev1" ? "destructive" : "warning";
  return (
    <div
      className={
        tone === "destructive"
          ? "flex items-center gap-3 rounded-lg border border-[hsl(var(--status-down)/0.4)] bg-[hsl(var(--status-down)/0.1)] px-4 py-3 text-sm"
          : "flex items-center gap-3 rounded-lg border border-[hsl(var(--status-warn)/0.4)] bg-[hsl(var(--status-warn)/0.1)] px-4 py-3 text-sm"
      }
      role="alert"
      aria-live="polite"
    >
      <AlertTriangle
        className={
          tone === "destructive" ? "h-5 w-5 text-[hsl(var(--status-down))]" : "h-5 w-5 text-[hsl(var(--status-warn))]"
        }
      />
      <div className="flex-1">
        <p>
          <span className="font-semibold">
            {incident.severity.toUpperCase()} incident:
          </span>{" "}
          {incident.title}
        </p>
        <p className="text-xs text-muted-foreground">
          Začátek {formatRelativeTime(incident.startedAt)} · {incident.updates.length} update
        </p>
      </div>
      <Link
        href={`/incidents/${incident.id}`}
        className="inline-flex items-center gap-1 text-xs font-medium hover:underline"
      >
        Detail
        <ChevronRight className="h-3.5 w-3.5" />
      </Link>
    </div>
  );
}
