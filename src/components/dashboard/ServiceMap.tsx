"use client";

import { useState, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
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
  ok: "hsl(var(--status-ok))",
  warn: "hsl(var(--status-warn))",
  down: "hsl(var(--status-down))",
  info: "hsl(var(--status-info))",
  muted: "hsl(var(--muted-foreground))",
  pending: "hsl(var(--muted-foreground))",
};

const STATUS_LABELS: Record<StatusKind, string> = {
  ok: "V pořádku",
  warn: "Varování",
  down: "Nedostupné",
  info: "Info",
  muted: "Neznámé",
  pending: "Čeká se",
};

function getAppTier(tags: string[]): string {
  if (tags.includes("critical")) return "critical";
  if (tags.includes("high")) return "high";
  return "normal";
}

const TIER_STYLES: Record<string, string> = {
  critical: "bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-400",
  high: "bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-400",
  normal: "bg-zinc-100 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400",
};

export function ServiceMap() {
  const cx = 300;
  const cy = 220;
  const radius = 160;
  const nodeR = 42;
  const centerR = 48;
  const count = applications.length;

  const [hoveredId, setHoveredId] = useState<string | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  const getNodePosition = useCallback(
    (index: number) => {
      const angle = (2 * Math.PI * index) / count - Math.PI / 2;
      return {
        x: cx + radius * Math.cos(angle),
        y: cy + radius * Math.sin(angle),
      };
    },
    [count],
  );

  // Convert SVG coords to container-relative pixel coords for tooltip
  const svgToPixel = useCallback(
    (svgX: number, svgY: number) => {
      const container = containerRef.current;
      if (!container) return { px: 0, py: 0 };
      const svg = container.querySelector("svg");
      if (!svg) return { px: 0, py: 0 };
      const rect = svg.getBoundingClientRect();
      const viewBoxW = 600;
      const viewBoxH = 440;
      const scaleX = rect.width / viewBoxW;
      const scaleY = rect.height / viewBoxH;
      return {
        px: svgX * scaleX,
        py: svgY * scaleY,
      };
    },
    [],
  );

  const hoveredApp = hoveredId
    ? applications.find((a) => a.id === hoveredId)
    : null;

  // Track tooltip pixel position via mouse events (avoids ref access during render)
  const [tooltipPixel, setTooltipPixel] = useState<{ px: number; py: number } | null>(null);

  const handleNodeHover = useCallback((appId: string, index: number) => {
    setHoveredId(appId);
    const pos = getNodePosition(index);
    setTooltipPixel(svgToPixel(pos.x, pos.y));
  }, [getNodePosition, svgToPixel]);

  const handleNodeLeave = useCallback(() => {
    setHoveredId(null);
    setTooltipPixel(null);
  }, []);

  return (
    <div className="flex flex-col gap-2">
      <h3 className="text-sm font-semibold">Service map</h3>
      <div
        ref={containerRef}
        className="relative overflow-x-auto rounded-lg border border-border bg-card p-2"
      >
        <svg
          viewBox="0 0 600 440"
          className="mx-auto h-auto w-full max-w-[600px]"
          role="img"
          aria-label="Service dependency map"
        >
          {/* Glow filter for hovered nodes */}
          <defs>
            <filter id="glow" x="-50%" y="-50%" width="200%" height="200%">
              <feGaussianBlur stdDeviation="4" result="blur" />
              <feMerge>
                <feMergeNode in="blur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>

          {/* Lines from center to each node */}
          {applications.map((app, i) => {
            const { x, y } = getNodePosition(i);
            const isHovered = hoveredId === app.id;
            return (
              <line
                key={`line-${app.id}`}
                x1={cx}
                y1={cy}
                x2={x}
                y2={y}
                stroke={
                  isHovered
                    ? STATUS_COLORS[getAppWorstStatus(app.id)]
                    : "hsl(var(--border))"
                }
                strokeWidth={isHovered ? 2.5 : 1.5}
                strokeDasharray={isHovered ? undefined : "4 3"}
                opacity={isHovered ? 1 : hoveredId ? 0.4 : 1}
                className="transition-all duration-200"
              />
            );
          })}

          {/* Outer nodes */}
          {applications.map((app, i) => {
            const { x, y } = getNodePosition(i);
            const status = getAppWorstStatus(app.id);
            const isHovered = hoveredId === app.id;
            return (
              <g
                key={app.id}
                onMouseEnter={() => handleNodeHover(app.id, i)}
                onMouseLeave={handleNodeLeave}
                onClick={() => router.push(`/applications/${app.id}`)}
                className="cursor-pointer"
                filter={isHovered ? "url(#glow)" : undefined}
                opacity={hoveredId && !isHovered ? 0.5 : 1}
                style={{ transition: "opacity 200ms" }}
              >
                <circle
                  cx={x}
                  cy={y}
                  r={nodeR}
                  fill="hsl(var(--card))"
                  stroke={STATUS_COLORS[status]}
                  strokeWidth={isHovered ? 3.5 : 2.5}
                  className="transition-all duration-200"
                />
                <text
                  x={x}
                  y={y - 6}
                  textAnchor="middle"
                  className="pointer-events-none fill-foreground text-[11px] font-medium"
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
            Zorník
          </text>
        </svg>

        {/* HTML tooltip overlay */}
        {hoveredApp && tooltipPixel && (
          <div
            className="pointer-events-none absolute z-10 rounded-lg border border-border bg-popover px-3 py-2 shadow-lg"
            style={{
              left: tooltipPixel.px,
              top: tooltipPixel.py,
              transform: "translate(-50%, -120%)",
            }}
          >
            <p className="text-sm font-semibold text-foreground">
              {hoveredApp.name}
            </p>
            <div className="mt-1 flex items-center gap-2">
              <span
                className="inline-block h-2 w-2 rounded-full"
                style={{
                  backgroundColor:
                    STATUS_DOT[getAppWorstStatus(hoveredApp.id)],
                }}
              />
              <span className="text-xs text-muted-foreground">
                {STATUS_LABELS[getAppWorstStatus(hoveredApp.id)]}
              </span>
            </div>
            <div className="mt-1">
              <span
                className={`inline-block rounded px-1.5 py-0.5 text-[10px] font-medium ${TIER_STYLES[getAppTier(hoveredApp.tags)]}`}
              >
                {getAppTier(hoveredApp.tags)}
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Legend */}
      <div className="flex items-center justify-center gap-4 text-xs text-muted-foreground">
        <span className="flex items-center gap-1.5">
          <span className="h-2 w-2 rounded-full bg-[hsl(var(--status-ok))]" /> V pořádku
        </span>
        <span className="flex items-center gap-1.5">
          <span className="h-2 w-2 rounded-full bg-[hsl(var(--status-warn))]" /> Varování
        </span>
        <span className="flex items-center gap-1.5">
          <span className="h-2 w-2 rounded-full bg-[hsl(var(--status-down))]" /> Nedostupné
        </span>
      </div>
    </div>
  );
}
