import Link from "next/link";
import { ExternalLink, Plus } from "lucide-react";
import { PageHeader } from "@/components/dashboard/PageHeader";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { StatusDot } from "@/components/ui/status-dot";
import { formatRelativeTime } from "@/lib/utils";
import { listProviderDefinitions } from "@/lib/integrations/registry";
import { listIntegrations } from "@/lib/integrations/store";
import { providerKindLabel } from "@/lib/integrations/types";
import { DeleteIntegrationButton } from "./DeleteIntegrationButton";
import { TestIntegrationButton } from "./TestIntegrationButton";

export const dynamic = "force-dynamic";

export default async function IntegrationsPage() {
  const defs = listProviderDefinitions();
  const configs = await listIntegrations();
  const defByKey = new Map(defs.map((d) => [d.key, d]));

  return (
    <div className="space-y-6">
      <PageHeader
        title="Integrace"
        description="Napoj externí služby (GitHub, Sentry, Vercel, …) a jejich data se zobrazí napříč celou aplikací."
        actions={
          <Button asChild>
            <Link href="/admin/integrations/new">
              <Plus className="h-4 w-4" />
              Připojit integraci
            </Link>
          </Button>
        }
      />

      <Card>
        <CardHeader>
          <CardTitle>Aktivní integrace ({configs.length})</CardTitle>
        </CardHeader>
        <CardContent className="pt-0">
          {configs.length === 0 ? (
            <div className="rounded-md border border-dashed border-border bg-card/40 p-6 text-center text-sm text-muted-foreground">
              Zatím žádná integrace. Klikni na{" "}
              <Link href="/admin/integrations/new" className="underline hover:text-foreground">
                Připojit integraci
              </Link>
              .
            </div>
          ) : (
            <ul className="divide-y divide-border/60">
              {configs.map((c) => {
                const def = defByKey.get(c.providerKey);
                return (
                  <li key={c.id} className="flex flex-wrap items-center gap-3 py-3 text-sm">
                    <StatusDot
                      status={
                        c.lastTestResult === "ok"
                          ? "ok"
                          : c.lastTestResult === "error"
                          ? "down"
                          : "muted"
                      }
                    />
                    <div className="flex-1 min-w-0">
                      <div className="font-medium">{c.displayName}</div>
                      <div className="text-xs text-muted-foreground">
                        {def?.labelCs ?? c.providerKey} ·{" "}
                        {def?.isReal ? "reálný adapter" : "mock adapter"}
                      </div>
                      {c.lastTestMessage ? (
                        <div className="text-xs text-muted-foreground">{c.lastTestMessage}</div>
                      ) : null}
                    </div>
                    <Badge variant={c.enabled ? "success" : "outline"}>
                      {c.enabled ? "Aktivní" : "Vypnuto"}
                    </Badge>
                    <span className="text-xs text-muted-foreground">
                      {c.lastTestedAt ? `test ${formatRelativeTime(c.lastTestedAt)}` : "netestováno"}
                    </span>
                    <TestIntegrationButton id={c.id} />
                    <DeleteIntegrationButton id={c.id} name={c.displayName} />
                  </li>
                );
              })}
            </ul>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Dostupní poskytovatelé</CardTitle>
          <p className="text-xs text-muted-foreground">
            Vyber typ, který chceš napojit. MVP umí reálně GitHub; ostatní slouží jako mock adaptery vůči
            fixturám a ilustrují, jak bude UI vypadat po rozšíření.
          </p>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-3">
            {defs.map((def) => (
              <div
                key={def.key}
                className="group flex flex-col gap-1 rounded-md border border-border p-4 transition-colors hover:border-accent hover:bg-accent/40"
              >
                <div className="flex items-center justify-between">
                  <Link
                    href={`/admin/integrations/new?provider=${def.key}`}
                    className="font-medium hover:underline"
                  >
                    {def.labelCs}
                  </Link>
                  {def.isReal ? (
                    <Badge variant="info">reálný</Badge>
                  ) : (
                    <Badge variant="outline">ukázka</Badge>
                  )}
                </div>
                <div className="text-xs text-muted-foreground">{providerKindLabel[def.kind]}</div>
                <p className="text-sm text-muted-foreground">{def.description}</p>
                <div className="mt-1 flex items-center gap-3 text-xs">
                  <Link
                    href={`/admin/integrations/new?provider=${def.key}`}
                    className="font-medium hover:text-foreground"
                  >
                    Připojit →
                  </Link>
                  <a
                    href={def.docsUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1 text-muted-foreground hover:text-foreground"
                  >
                    Dokumentace
                    <ExternalLink className="h-3 w-3" />
                  </a>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
