"use client";

import { applications } from "@/data/applications";
import { healthChecks } from "@/data/health-checks";
import type { StatusKind } from "@/lib/types";

function getAppWorstStatus(appId: string): StatusKind {
  const checks = healthChecks.filter((h) => h.appId === appId);
  if (checks.some((h) => h.status === "down")) return "down";
  if (checks.some((h) => h.status === "warn")) return "warn";
  if (checks.length === 0) return "muted";
  return "ok";
}

const STATUS_COLORS: Record<StatusKind, string> = {
  ok: "hsl(var(--status-ok))",
  warn: "hsl(var(--status-warn))",
  down: "hsl(var(--status-down))",
  info: "hsl(var(--status-info))",
  muted: "hsl(var(--muted-foreground))",
  pending: "hsl(var(--muted-foreground))",
};

const STATUS_DOT: Record<StatusKind, string> = {
  ok: "#16a34a",
  warn: "#f59e0b",
  down: "#dc2626",
  info: "#3b82f6",
  muted: "#6b7280",
  pending: "#6b7280",
};

export function ServiceMap() {
  const cx = 300;
  const cy = 220;
  const radius = 160;
  const nodeR = 42;
  const centerR = 48;
  const count = applications.length;

  return (
    <div className="flex flex-col gap-2">
      <h3 className="text-sm font-semibold">Service map</h3>
      <div className="overflow-x-auto rounded-lg border border-border bg-card p-2">
        <svg
          viewBox="0 0 600 440"
          className="mx-auto h-auto w-full max-w-[600px]"
          role="img"
          aria-label="Service dependency map"
        >
          {/* Lines from center to each node */}
          {applications.map((app, i) => {
            const angle = (2 * Math.PI * i) / count - Math.PI / 2;
            const x = cx + radius * Math.cos(angle);
            const y = cy + radius * Math.sin(angle);
            return (
              <line
                key={`line-${app.id}`}
                x1={cx}
                y1={cy}
                x2={x}
                y2={y}
                stroke="hsl(var(--border))"
                strokeWidth={1.5}
                strokeDasharray="4 3"
              />
            );
          })}

          {/* Outer nodes */}
          {applications.map((app, i) => {
            const angle = (2 * Math.PI * i) / count - Math.PI / 2;
            const x = cx + radius * Math.cos(angle);
            const y = cy + radius * Math.sin(angle);
            const status = getAppWorstStatus(app.id);
            return (
              <g key={app.id}>
                <circle
                  cx={x}
                  cy={y}
                  r={nodeR}
                  fill="hsl(var(--card))"
                  stroke={STATUS_COLORS[status]}
                  strokeWidth={2.5}
                />
                <text
                  x={x}
                  y={y - 6}
                  textAnchor="middle"
                  className="fill-foreground text-[11px] font-medium"
                >
                  {app.name}
                </text>
                {/* Status dot */}
                <circle cx={x} cy={y + 12} r={5} fill={STATUS_DOT[status]} />
              </g>
            );
          })}

          {/* Center node */}
          <circle
            cx={cx}
            cy={cy}
            r={centerR}
            fill="hsl(var(--brand-primary, var(--primary)))"
            opacity={0.15}
          />
          <circle
            cx={cx}
            cy={cy}
            r={centerR}
            fill="none"
            stroke="hsl(var(--brand-primary, var(--primary)))"
            strokeWidth={2.5}
          />
          <text
            x={cx}
            y={cy + 5}
            textAnchor="middle"
            className="fill-foreground text-[13px] font-bold"
          >
            Zorn&#237;k
          </text>
        </svg>
      </div>
    </div>
  );
}
