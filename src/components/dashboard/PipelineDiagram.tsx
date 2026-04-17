import { ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { StatusDot, type StatusKind } from "@/components/ui/status-dot";
import type { Environment } from "@/lib/types";

export interface PipelineStep {
  envId: string;
  envName: string;
  status: StatusKind;
  version?: string;
  when?: string;
}

export function PipelineDiagram({
  environments,
  latestByEnv,
  className,
}: {
  environments: Environment[];
  latestByEnv: Record<string, { status: StatusKind; version: string; when: string }>;
  className?: string;
}) {
  const envs = [...environments].sort((a, b) => a.order - b.order);
  return (
    <ol className={cn("flex items-center gap-2 overflow-x-auto pb-2", className)}>
      {envs.map((env, i) => {
        const latest = latestByEnv[env.id];
        return (
          <li key={env.id} className="flex items-center gap-2">
            <div className="flex min-w-40 flex-col gap-1 rounded-md border border-border bg-card px-3 py-2">
              <div className="flex items-center justify-between text-xs font-medium uppercase tracking-wide text-muted-foreground">
                <span>{env.name}</span>
                <StatusDot status={latest?.status ?? "muted"} size="sm" />
              </div>
              <div className="font-mono text-sm font-medium tabular-nums">
                {latest?.version ?? "—"}
              </div>
              <div className="text-xs text-muted-foreground">{latest?.when ?? "žádný deploy"}</div>
            </div>
            {i < envs.length - 1 ? <ChevronRight className="h-4 w-4 text-muted-foreground" /> : null}
          </li>
        );
      })}
    </ol>
  );
}
