import { PageHeader } from "@/components/dashboard/PageHeader";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { applications } from "@/data/applications";

export default function AdminAppsPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Aplikace"
        description="Správa seznamu aplikací (v MVP jen pro čtení — zdrojem je src/data/applications.ts)."
      />
      <Card>
        <CardHeader>
          <CardTitle>Registrované aplikace</CardTitle>
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
