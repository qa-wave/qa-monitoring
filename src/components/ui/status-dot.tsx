import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

export type StatusKind = "ok" | "warn" | "down" | "info" | "muted" | "pending";

const statusDotVariants = cva("inline-block rounded-full", {
  variants: {
    status: {
      ok: "bg-[hsl(var(--status-ok))]",
      warn: "bg-[hsl(var(--status-warn))]",
      down: "bg-[hsl(var(--status-down))]",
      info: "bg-[hsl(var(--status-info))]",
      muted: "bg-[hsl(var(--status-muted))]",
      pending: "bg-[hsl(var(--status-muted))] animate-pulse",
    },
    size: {
      xs: "h-1.5 w-1.5",
      sm: "h-2 w-2",
      md: "h-2.5 w-2.5",
      lg: "h-3 w-3",
    },
    pulse: {
      true: "ring-2 ring-offset-2 ring-offset-background animate-[ping_2s_ease-in-out_infinite]",
      false: "",
    },
  },
  defaultVariants: {
    status: "muted",
    size: "md",
    pulse: false,
  },
});

export interface StatusDotProps
  extends React.HTMLAttributes<HTMLSpanElement>,
    VariantProps<typeof statusDotVariants> {
  label?: string;
}

const statusLabels: Record<StatusKind, string> = {
  ok: "v pořádku",
  warn: "varování",
  down: "nedostupné",
  info: "informace",
  muted: "neznámý",
  pending: "probíhá",
};

export function StatusDot({ status, size, pulse, className, label, ...props }: StatusDotProps) {
  const effective: StatusKind = (status ?? "muted") as StatusKind;
  return (
    <span
      role="img"
      aria-label={label ?? statusLabels[effective]}
      className={cn(statusDotVariants({ status, size, pulse }), className)}
      {...props}
    />
  );
}

export function statusToVariant(status: StatusKind): "success" | "warning" | "danger" | "info" | "outline" {
  switch (status) {
    case "ok":
      return "success";
    case "warn":
      return "warning";
    case "down":
      return "danger";
    case "info":
      return "info";
    default:
      return "outline";
  }
}
