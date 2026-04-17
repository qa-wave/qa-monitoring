import { Badge } from "@/components/ui/badge";
import { StatusDot } from "@/components/ui/status-dot";
import { formatRelativeTime } from "@/lib/utils";
import type { Environment, FeatureFlag } from "@/lib/types";

export function FlagListItem({
  flag,
  environments,
}: {
  flag: FeatureFlag;
  environments: Environment[];
}) {
  const envs = [...environments].sort((a, b) => a.order - b.order);
  return (
    <div className="flex flex-col gap-2 rounded-md border border-transparent px-2 py-2 hover:border-border hover:bg-accent/40">
      <div className="flex items-center justify-between">
        <div>
          <div className="font-mono text-sm font-medium">{flag.key}</div>
          <div className="text-xs text-muted-foreground">{flag.name}</div>
        </div>
        <span className="text-xs text-muted-foreground">
          Naposledy {formatRelativeTime(flag.updatedAt)} · {flag.updatedBy}
        </span>
      </div>
      <div className="flex flex-wrap items-center gap-2">
        {envs.map((env) => {
          const state = flag.envStates.find((s) => s.envId === env.id);
          if (!state) return null;
          return (
            <Badge key={env.id} variant={state.on ? "info" : "outline"} className="gap-1">
              <StatusDot status={state.on ? "info" : "muted"} size="xs" />
              <span className="font-mono text-[11px]">{env.name}</span>
              <span>{state.on ? `${state.rolloutPct} %` : "off"}</span>
            </Badge>
          );
        })}
      </div>
    </div>
  );
}
