"use client";

import * as React from "react";
import { useSearchParams, useRouter, usePathname } from "next/navigation";
import { Calendar, Server } from "lucide-react";
import { cn } from "@/lib/utils";

const TIME_RANGES = [
  { key: "1h", label: "1h" },
  { key: "6h", label: "6h" },
  { key: "24h", label: "24h" },
  { key: "7d", label: "7d" },
  { key: "30d", label: "30d" },
] as const;

interface DashboardFilterBarProps {
  environments: string[];
}

export function DashboardFilterBar({ environments }: DashboardFilterBarProps) {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();

  const activeRange = searchParams.get("range") ?? "24h";
  const activeEnv = searchParams.get("env") ?? "all";

  function setParam(key: string, value: string) {
    const params = new URLSearchParams(searchParams.toString());
    if (
      (key === "range" && value === "24h") ||
      (key === "env" && value === "all")
    ) {
      params.delete(key);
    } else {
      params.set(key, value);
    }
    router.push(`${pathname}?${params.toString()}`, { scroll: false });
  }

  const pillBase =
    "inline-flex items-center gap-1 rounded-full px-3 py-1.5 text-xs font-medium transition-colors cursor-pointer select-none";
  const pillActive = "bg-[hsl(var(--brand-primary))] text-white";
  const pillInactive =
    "bg-muted/60 text-muted-foreground hover:bg-muted hover:text-foreground";

  return (
    <div className="flex flex-wrap items-center gap-4">
      <div className="flex items-center gap-1.5">
        <Calendar className="h-3.5 w-3.5 text-muted-foreground" />
        <div className="flex gap-1">
          {TIME_RANGES.map(({ key, label }) => (
            <button
              key={key}
              type="button"
              onClick={() => setParam("range", key)}
              className={cn(
                pillBase,
                activeRange === key ? pillActive : pillInactive,
              )}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      <div className="h-4 w-px bg-border" />

      <div className="flex items-center gap-1.5">
        <Server className="h-3.5 w-3.5 text-muted-foreground" />
        <div className="flex gap-1">
          <button
            type="button"
            onClick={() => setParam("env", "all")}
            className={cn(
              pillBase,
              activeEnv === "all" ? pillActive : pillInactive,
            )}
          >
            Vše
          </button>
          {environments.map((env) => (
            <button
              key={env}
              type="button"
              onClick={() => setParam("env", env)}
              className={cn(
                pillBase,
                activeEnv === env ? pillActive : pillInactive,
              )}
            >
              {env}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
