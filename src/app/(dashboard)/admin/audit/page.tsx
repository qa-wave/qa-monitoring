import { PageHeader } from "@/components/dashboard/PageHeader";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { auditLog } from "@/data/audit-log";
import { formatRelativeTime, formatDateTime } from "@/lib/utils";

const actionLabels: Record<string, string> = {
  deploy: "Deploy",
  rollback: "Rollback",
  "flag.update": "Feature flag",
  "maintenance.schedule": "Plánovaná údržba",
};

const actionVariant: Record<string, "default" | "danger" | "warning" | "info" | "outline"> = {
  deploy: "default",
  rollback: "danger",
  "flag.update": "info",
  "maintenance.schedule": "warning",
};

export default function AuditLogPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Audit log"
        description="Přehled akcí provedených v systému."
      />

      <Card>
        <CardContent className="pt-6 overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b text-left text-xs font-medium text-muted-foreground">
                <th className="pb-2 pr-3">Čas</th>
                <th className="pb-2 pr-3">Aktér</th>
                <th className="pb-2 pr-3">Akce</th>
                <th className="pb-2 pr-3">Cíl</th>
                <th className="pb-2">Detaily</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/60">
              {auditLog.map((entry) => (
                <tr key={entry.id} className="hover:bg-accent/40">
                  <td
                    className="py-2 pr-3 text-xs text-muted-foreground whitespace-nowrap"
                    title={formatDateTime(entry.at)}
                  >
                    {formatRelativeTime(entry.at)}
                  </td>
                  <td className="py-2 pr-3 font-medium">{entry.actor}</td>
                  <td className="py-2 pr-3">
                    <Badge variant={actionVariant[entry.action] ?? "outline"}>
                      {actionLabels[entry.action] ?? entry.action}
                    </Badge>
                  </td>
                  <td className="py-2 pr-3">{entry.target}</td>
                  <td className="py-2 text-xs text-muted-foreground">
                    {entry.details ?? "\u2014"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </CardContent>
      </Card>
    </div>
  );
}
