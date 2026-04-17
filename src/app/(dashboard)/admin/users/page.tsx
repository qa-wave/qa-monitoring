import { PageHeader } from "@/components/dashboard/PageHeader";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { users } from "@/data/users";

export default function AdminUsersPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Uživatelé"
        description="Správa uživatelů a rolí (v MVP jen pro čtení)."
      />
      <Card>
        <CardHeader>
          <CardTitle>Registrovaní uživatelé ({users.length})</CardTitle>
        </CardHeader>
        <CardContent className="divide-y divide-border/60 pt-0 text-sm">
          {users.map((u) => (
            <div key={u.id} className="flex items-center gap-3 py-2">
              <span className="w-48 font-medium">{u.name}</span>
              <span className="flex-1 font-mono text-xs text-muted-foreground">{u.email}</span>
              <Badge variant={u.role === "admin" ? "info" : "outline"}>{u.role}</Badge>
              <Badge variant="outline">{u.personaPreference}</Badge>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
