import * as React from "react";
import Link from "next/link";
import { ArrowDownRight, ArrowUpRight, Minus } from "lucide-react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";
import { Card, CardContent } from "@/components/ui/card";
import { StatusDot, type StatusKind } from "@/components/ui/status-dot";

const kpiVariants = cva("transition-colors", {
  variants: {
    status: {
      ok: "border-[hsl(var(--status-ok)/0.35)]",
      warn: "border-[hsl(var(--status-warn)/0.45)]",
      down: "border-[hsl(var(--status-down)/0.45)]",
      info: "border-[hsl(var(--status-info)/0.35)]",
      muted: "",
    },
  },
  defaultVariants: { status: "muted" },
});

interface KpiCardProps extends VariantProps<typeof kpiVariants> {
  label: string;
  value: string;
  unit?: string;
  delta?: {
    value: string;
    direction: "up" | "down" | "flat";
    positive?: boolean;
  };
  hint?: string;
  icon?: React.ElementType;
  href?: string;
  className?: string;
}

export function KpiCard({ label, value, unit, delta, hint, icon: Icon, status, href, className }: KpiCardProps) {
  const effectiveStatus: StatusKind = (status as StatusKind | null | undefined) ?? "muted";

  const card = (
      <Card
        className={cn(
          kpiVariants({ status }),
          "relative overflow-hidden transition-shadow",
          href && "group-hover:shadow-md group-hover:ring-1 group-hover:ring-border",
          className,
        )}
        style={effectiveStatus !== "muted" ? {
          borderTopWidth: 2,
          borderTopColor: "transparent",
          borderImage: `linear-gradient(90deg, hsl(var(--status-${effectiveStatus})), transparent) 1`,
        } : undefined}
      >
        {href && (
          <ArrowUpRight className="absolute top-3 right-3 h-4 w-4 text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100" />
        )}
        <CardContent className="p-5">
          <div className="flex items-center justify-between gap-2 text-xs font-medium uppercase tracking-wide text-muted-foreground">
            <span className="inline-flex items-center gap-2">
              {Icon ? <Icon className="h-3.5 w-3.5" /> : null}
              {label}
            </span>
            <StatusDot status={effectiveStatus} size="sm" />
          </div>
          <div className="mt-3 flex items-baseline gap-1">
            <span className="font-mono text-3xl font-semibold tracking-tight tabular-nums">{value}</span>
            {unit ? <span className="text-sm text-muted-foreground">{unit}</span> : null}
          </div>
          <div className="mt-2 flex items-center gap-2 text-xs">
            {delta ? (
              <span
                className={cn(
                  "inline-flex items-center gap-0.5 rounded-full px-2 py-0.5 font-medium",
                  delta.direction === "flat" && "bg-muted text-muted-foreground",
                  delta.direction === "up" && (delta.positive
                    ? "bg-[hsl(var(--status-ok))]/10 text-[hsl(var(--status-ok))]"
                    : "bg-[hsl(var(--status-down))]/10 text-[hsl(var(--status-down))]"),
                  delta.direction === "down" && (delta.positive
                    ? "bg-[hsl(var(--status-ok))]/10 text-[hsl(var(--status-ok))]"
                    : "bg-[hsl(var(--status-down))]/10 text-[hsl(var(--status-down))]")
                )}
              >
                {delta.direction === "up" ? (
                  <ArrowUpRight className="h-3.5 w-3.5" />
                ) : delta.direction === "down" ? (
                  <ArrowDownRight className="h-3.5 w-3.5" />
                ) : (
                  <Minus className="h-3.5 w-3.5" />
                )}
                {delta.value}
              </span>
            ) : null}
            {hint ? <span className="text-muted-foreground">{hint}</span> : null}
          </div>
        </CardContent>
      </Card>
  );

  if (href) {
    return <Link href={href} className="block group">{card}</Link>;
  }
  return card;
}
