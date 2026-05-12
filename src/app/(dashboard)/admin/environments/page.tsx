import { Info } from "lucide-react";
import { PageHeader } from "@/components/dashboard/PageHeader";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { environments } from "@/data/environments";
import { getT } from "@/lib/i18n/server";
import { requirePermission } from "@/lib/auth";

export default async function AdminEnvsPage() {
  await requirePermission("integrations:view");
  const { t } = await getT();
  return (
    <div className="space-y-6">
      <PageHeader
        title={t.pages.adminEnvs.title}
        description={t.pages.adminEnvs.description}
      />
      <div className="flex items-center gap-2 rounded-md border border-border bg-muted/50 px-4 py-3 text-sm text-muted-foreground">
        <Info className="h-4 w-4 shrink-0" />
        Jen pro čtení — v MVP se spravují přímo v kódu. CRUD bude dostupný po napojení databáze.
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Registrovaná prostředí ({environments.length})</CardTitle>
        </CardHeader>
        <CardContent className="divide-y divide-border/60 pt-0 text-sm">
          {environments.map((env) => (
            <div key={env.id} className="flex items-center gap-3 py-2">
              <span className="w-24 font-medium">{env.name}</span>
              {env.isProduction ? <Badge variant="info">prod</Badge> : <Badge variant="outline">non-prod</Badge>}
              <span className="flex-1 text-xs text-muted-foreground">{env.url}</span>
              <span className="text-xs text-muted-foreground">{env.region}</span>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
