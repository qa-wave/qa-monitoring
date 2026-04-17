import { PageHeader } from "@/components/dashboard/PageHeader";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { environments } from "@/data/environments";

export default function AdminEnvsPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Prostředí"
        description="Správa prostředí (v MVP jen pro čtení — zdrojem je src/data/environments.ts)."
      />
      <Card>
        <CardHeader>
          <CardTitle>Registrovaná prostředí</CardTitle>
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
