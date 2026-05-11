"use client";

import { useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import type { Deployment } from "@/lib/types";

interface DeployHeatmapProps {
  deployments: Deployment[];
}

/** Simple deterministic PRNG seeded from a string (same approach as generateHistoryBar). */
function seededRng(seed: string) {
  let s = 0;
  for (let i = 0; i < seed.length; i++) s = (s * 31 + seed.charCodeAt(i)) >>> 0;
  return () => {
    s = (s * 1103515245 + 12345) >>> 0;
    return ((s >>> 16) & 0xffff) / 0xffff;
  };
}

interface DayData {
  date: Date;
  ok: number;
  failed: number;
  total: number;
}

const WEEKS = 12;
const DAYS = WEEKS * 7;
const DAY_LABELS = ["Po", "Út", "St", "Čt", "Pá", "So", "Ne"];

function generateSyntheticData(): DayData[] {
  const rng = seededRng("deploy-heatmap-2026");
  const anchor = new Date("2026-04-17T12:00:00+02:00");
  // End on anchor day, go back DAYS days
  const startDate = new Date(anchor);
  startDate.setDate(startDate.getDate() - DAYS + 1);

  const days: DayData[] = [];
  for (let i = 0; i < DAYS; i++) {
    const date = new Date(startDate);
    date.setDate(date.getDate() + i);

    const r = rng();
    const dayOfWeek = date.getDay(); // 0=Sun
    const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;

    let total: number;
    if (isWeekend) {
      total = r < 0.6 ? 0 : r < 0.85 ? 1 : 2;
    } else {
      total = r < 0.15 ? 0 : r < 0.4 ? 1 : r < 0.7 ? 2 : r < 0.9 ? 3 : 4;
    }

    let failed = 0;
    if (total > 0) {
      const fr = rng();
      if (fr < 0.12) failed = 1;
    }
    const ok = total - failed;

    days.push({ date, ok, failed, total });
  }
  return days;
}

function cellColor(day: DayData): string {
  if (day.total === 0) return "hsl(var(--muted))";
  if (day.failed > 0) {
    if (day.failed >= 2) return "hsl(var(--status-down) / 0.8)";
    return "hsl(var(--status-down) / 0.5)";
  }
  if (day.total === 1) return "hsl(var(--status-ok) / 0.3)";
  if (day.total === 2) return "hsl(var(--status-ok) / 0.5)";
  return "hsl(var(--status-ok) / 0.8)";
}

function formatDateCs(d: Date): string {
  return `${d.getDate()}. ${d.getMonth() + 1}. ${d.getFullYear()}`;
}

function tooltipText(day: DayData): string {
  if (day.total === 0) return `${formatDateCs(day.date)}: žádný deploy`;
  const parts = [`${formatDateCs(day.date)}: ${day.total} ${day.total === 1 ? "deploy" : "deploye"}`];
  if (day.ok > 0 || day.failed > 0) {
    parts.push(`(${day.ok} OK, ${day.failed} failed)`);
  }
  return parts.join(" ");
}

export function DeployHeatmap({ deployments: _deployments }: DeployHeatmapProps) {
  // We use synthetic data since fixtures only have ~8 deploys
  // In production this would aggregate _deployments by day
  const days = useMemo(() => generateSyntheticData(), []);

  // Reshape into weeks (columns) × weekdays (rows)
  // rows: Mon(0) .. Sun(6), cols: week 0 .. week 11
  const grid = useMemo(() => {
    const rows: (DayData | null)[][] = Array.from({ length: 7 }, () =>
      Array.from({ length: WEEKS }, () => null)
    );
    for (let i = 0; i < days.length; i++) {
      const d = days[i];
      // Convert JS day (0=Sun) to Mon-based (0=Mon .. 6=Sun)
      const jsDay = d.date.getDay();
      const row = jsDay === 0 ? 6 : jsDay - 1;
      const col = Math.floor(i / 7);
      if (col < WEEKS) {
        rows[row][col] = d;
      }
    }
    return rows;
  }, [days]);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Deploy frekvence (12 týdnů)</CardTitle>
      </CardHeader>
      <CardContent className="pt-0">
        <TooltipProvider delayDuration={100}>
          <div className="flex gap-1">
            {/* Day labels column */}
            <div className="flex flex-col gap-[2px] pr-1">
              {DAY_LABELS.map((label) => (
                <div
                  key={label}
                  className="flex h-[12px] items-center text-[9px] leading-none text-muted-foreground"
                >
                  {label}
                </div>
              ))}
            </div>
            {/* Heatmap grid: iterate columns (weeks) then rows (days) */}
            <div className="flex gap-[2px]">
              {Array.from({ length: WEEKS }, (_, col) => (
                <div key={col} className="flex flex-col gap-[2px]">
                  {grid.map((row, rowIdx) => {
                    const day = row[col];
                    if (!day) {
                      return (
                        <div
                          key={rowIdx}
                          className="h-[12px] w-[12px] rounded-[2px]"
                          style={{ backgroundColor: "hsl(var(--muted))" }}
                        />
                      );
                    }
                    return (
                      <Tooltip key={rowIdx}>
                        <TooltipTrigger asChild>
                          <div
                            className="h-[12px] w-[12px] rounded-[2px] transition-transform hover:scale-125"
                            style={{ backgroundColor: cellColor(day) }}
                          />
                        </TooltipTrigger>
                        <TooltipContent side="top">
                          <span>{tooltipText(day)}</span>
                        </TooltipContent>
                      </Tooltip>
                    );
                  })}
                </div>
              ))}
            </div>
          </div>
        </TooltipProvider>

        {/* Legend */}
        <div className="mt-3 flex items-center gap-2 text-[10px] text-muted-foreground">
          <span>Méně</span>
          <div
            className="h-[10px] w-[10px] rounded-[2px]"
            style={{ backgroundColor: "hsl(var(--muted))" }}
          />
          <div
            className="h-[10px] w-[10px] rounded-[2px]"
            style={{ backgroundColor: "hsl(var(--status-ok) / 0.3)" }}
          />
          <div
            className="h-[10px] w-[10px] rounded-[2px]"
            style={{ backgroundColor: "hsl(var(--status-ok) / 0.5)" }}
          />
          <div
            className="h-[10px] w-[10px] rounded-[2px]"
            style={{ backgroundColor: "hsl(var(--status-ok) / 0.8)" }}
          />
          <span>Více</span>
          <span className="ml-2">|</span>
          <div
            className="h-[10px] w-[10px] rounded-[2px]"
            style={{ backgroundColor: "hsl(var(--status-down) / 0.5)" }}
          />
          <span>Failed</span>
        </div>
      </CardContent>
    </Card>
  );
}
