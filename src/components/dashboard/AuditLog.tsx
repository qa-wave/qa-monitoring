import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatRelativeTime } from "@/lib/utils";
import type { AuditEntry } from "@/lib/types";

const actionLabel: Record<string, string> = {
  deploy: "deploy",
  rollback: "rollback",
  "flag.update": "flag",
  "maintenance.schedule": "údržba",
};

export function AuditLog({ entries }: { entries: AuditEntry[] }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Audit log</CardTitle>
      </CardHeader>
      <CardContent className="pt-0">
        {entries.length === 0 ? (
          <p className="text-sm text-muted-foreground">Žádné události.</p>
        ) : (
          <ul className="divide-y divide-border/60">
            {entries.map((e) => (
              <li key={e.id} className="flex items-start gap-3 py-2 text-sm">
                <span className="w-24 font-mono text-xs text-muted-foreground">
                  {formatRelativeTime(e.at)}
                </span>
                <span className="w-20 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                  {actionLabel[e.action] ?? e.action}
                </span>
                <div className="flex-1">
                  <span className="font-medium">{e.target}</span>
                  {e.details ? <span className="ml-2 text-xs text-muted-foreground">({e.details})</span> : null}
                </div>
                <span className="text-xs text-muted-foreground">{e.actor}</span>
              </li>
            ))}
          </ul>
        )}
      </CardContent>
    </Card>
  );
}
