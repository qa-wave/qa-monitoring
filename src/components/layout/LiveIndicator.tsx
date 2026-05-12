"use client";

import { useHealthStream } from "@/lib/use-health-stream";

export function LiveIndicator() {
  const health = useHealthStream();

  return (
    <span
      className="relative inline-flex h-9 w-9 items-center justify-center"
      aria-label={health ? "Live data connected" : "Connecting to live data"}
      title={
        health
          ? `Live: ${health.ok} ok, ${health.warn} warn, ${health.down} down`
          : "Connecting..."
      }
    >
      <span className="text-[10px] font-bold uppercase tracking-wide text-muted-foreground">
        Live
      </span>
      <span
        className={`absolute right-1 top-1.5 h-2 w-2 rounded-full ${
          health ? "bg-[hsl(var(--status-ok))]" : "bg-muted-foreground"
        }`}
      >
        {health ? (
          <span className="absolute inset-0 animate-ping rounded-full bg-[hsl(var(--status-ok))] opacity-75" />
        ) : null}
      </span>
    </span>
  );
}
