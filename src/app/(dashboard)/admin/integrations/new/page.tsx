import Link from "next/link";
import { notFound } from "next/navigation";
import { PageHeader } from "@/components/dashboard/PageHeader";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { listProviderDefinitions, getProviderDefinition } from "@/lib/integrations/registry";
import { providerKindLabel } from "@/lib/integrations/types";
import { NewIntegrationForm } from "./NewIntegrationForm";

export const dynamic = "force-dynamic";

export default async function NewIntegrationPage({
  searchParams,
}: {
  searchParams: Promise<{ provider?: string }>;
}) {
  const sp = await searchParams;
  const providerKey = sp.provider;
  if (!providerKey) {
    const defs = listProviderDefinitions();
    return (
      <div className="space-y-6">
        <PageHeader
          backHref="/admin/integrations"
          title="Nová integrace"
          description="Vyber typ integrace, kterou chceš přidat."
        />
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          {defs.map((d) => (
            <Link
              key={d.key}
              href={`/admin/integrations/new?provider=${d.key}`}
              className="rounded-md border border-border p-4 transition-colors hover:border-accent hover:bg-accent/40"
            >
              <div className="flex items-center justify-between">
                <div className="font-medium">{d.labelCs}</div>
                <Badge variant={d.isReal ? "info" : "outline"}>{d.isReal ? "reálný" : "ukázka"}</Badge>
              </div>
              <div className="text-xs text-muted-foreground">{providerKindLabel[d.kind]}</div>
              <p className="mt-1 text-sm text-muted-foreground">{d.description}</p>
            </Link>
          ))}
        </div>
      </div>
    );
  }

  const def = getProviderDefinition(providerKey);
  if (!def) notFound();

  return (
    <div className="space-y-6">
      <PageHeader
        backHref="/admin/integrations"
        title={<span>Připojit: {def.labelCs}</span>}
        description={def.description}
        actions={
          <Button variant="outline" size="sm" asChild>
            <a href={def.docsUrl} target="_blank" rel="noreferrer">
              Dokumentace ↗
            </a>
          </Button>
        }
      />
      <Card>
        <CardHeader>
          <CardTitle>Konfigurace</CardTitle>
          <p className="text-xs text-muted-foreground">
            Podporované funkce: {def.capabilities.join(", ")}.
          </p>
        </CardHeader>
        <CardContent>
          <NewIntegrationForm providerKey={def.key} providerKind={def.kind} isReal={def.isReal} />
        </CardContent>
      </Card>
    </div>
  );
}
