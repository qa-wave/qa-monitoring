import { Info } from "lucide-react";
import { PageHeader } from "@/components/dashboard/PageHeader";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { applications } from "@/data/applications";
import { getT } from "@/lib/i18n/server";
import { requirePermission } from "@/lib/auth";

export default async function AdminAppsPage() {
  await requirePermission("integrations:view");
  const { t } = await getT();
  return (
    <div className="space-y-6">
      <PageHeader
        title={t.pages.adminApps.title}
        description={t.pages.adminApps.description}
      />
      <div className="flex items-center gap-2 rounded-md border border-border bg-muted/50 px-4 py-3 text-sm text-muted-foreground">
        <Info className="h-4 w-4 shrink-0" />
        Jen pro čtení — v MVP se spravují přímo v kódu. CRUD bude dostupný po napojení databáze.
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Registrované aplikace ({applications.length})</CardTitle>
        </CardHeader>
        <CardContent className="divide-y divide-border/60 pt-0 text-sm">
          {applications.map((app) => (
            <div key={app.id} className="flex items-center gap-3 py-2">
              <span className="w-40 font-medium">{app.name}</span>
              <Badge variant="outline">{app.language}</Badge>
              <span className="flex-1 text-xs text-muted-foreground">{app.description}</span>
              <span className="text-xs text-muted-foreground">{app.owners.join(", ")}</span>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
