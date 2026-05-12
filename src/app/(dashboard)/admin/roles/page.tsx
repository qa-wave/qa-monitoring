import React from "react";
import { PageHeader } from "@/components/dashboard/PageHeader";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { SYSTEM_ROLES, type Permission } from "@/lib/rbac";
import { Check, X } from "lucide-react";

const permissionGroups: { label: string; permissions: Permission[] }[] = [
  { label: "Dashboard", permissions: ["dashboard:view"] },
  {
    label: "Data",
    permissions: [
      "environments:view",
      "applications:view",
      "releases:view",
      "tests:view",
      "quality:view",
      "product:view",
    ],
  },
  {
    label: "Incidenty",
    permissions: ["incidents:view", "incidents:manage"],
  },
  { label: "Status", permissions: ["status:view"] },
  {
    label: "Admin",
    permissions: [
      "integrations:view",
      "integrations:manage",
      "branding:manage",
      "users:view",
      "users:manage",
      "audit:view",
    ],
  },
];

export default async function RolesPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Role a opr\u00e1vn\u011bn\u00ed"
        description="Syst\u00e9mov\u00e9 role a matice opr\u00e1vn\u011bn\u00ed. Custom role budou dostupn\u00e9 po napojen\u00ed datab\u00e1ze."
      />
      <Card>
        <CardHeader>
          <CardTitle>Matice opr\u00e1vn\u011bn\u00ed</CardTitle>
        </CardHeader>
        <CardContent className="overflow-x-auto pt-0">
          <table className="w-full min-w-[600px] text-sm">
            <thead>
              <tr className="text-left text-xs uppercase tracking-wide text-muted-foreground">
                <th className="pb-2 pr-4 font-medium">Opr\u00e1vn\u011bn\u00ed</th>
                {SYSTEM_ROLES.map((role) => (
                  <th
                    key={role.id}
                    className="pb-2 px-3 font-medium text-center"
                  >
                    {role.name}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {permissionGroups.map((group) => (
                <React.Fragment key={group.label}>
                  <tr>
                    <td
                      colSpan={SYSTEM_ROLES.length + 1}
                      className="pt-4 pb-1 text-xs font-semibold uppercase tracking-wide text-muted-foreground"
                    >
                      {group.label}
                    </td>
                  </tr>
                  {group.permissions.map((perm) => (
                    <tr key={perm} className="border-t border-border/40">
                      <td className="py-2 pr-4 font-mono text-xs">{perm}</td>
                      {SYSTEM_ROLES.map((role) => (
                        <td key={role.id} className="py-2 px-3 text-center">
                          {role.permissions.includes(perm) ? (
                            <Check className="h-4 w-4 text-[hsl(var(--status-ok))] mx-auto" />
                          ) : (
                            <X className="h-4 w-4 text-muted-foreground/30 mx-auto" />
                          )}
                        </td>
                      ))}
                    </tr>
                  ))}
                </React.Fragment>
              ))}
            </tbody>
          </table>
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle>
            Syst\u00e9mov\u00e9 role ({SYSTEM_ROLES.length})
          </CardTitle>
        </CardHeader>
        <CardContent className="divide-y divide-border/60 pt-0 text-sm">
          {SYSTEM_ROLES.map((role) => (
            <div key={role.id} className="flex items-center gap-3 py-3">
              <Badge
                variant={
                  role.id === "admin"
                    ? "info"
                    : role.id === "operator"
                      ? "warning"
                      : "outline"
                }
              >
                {role.name}
              </Badge>
              <span className="flex-1 text-xs text-muted-foreground">
                {role.description}
              </span>
              <span className="text-xs text-muted-foreground">
                {role.permissions.length} opr\u00e1vn\u011bn\u00ed
              </span>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
