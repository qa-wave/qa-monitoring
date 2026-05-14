import Link from "next/link";
import {
  Activity,
  CheckCircle2,
  Code2,
  ExternalLink,
  Eye,
  Hammer,
  ListTodo,
  MessageSquare,
  Plus,
  Rocket,
  ShieldCheck,
  TestTube2,
  XCircle,
} from "lucide-react";
import { PageHeader } from "@/components/dashboard/PageHeader";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { StatusDot } from "@/components/ui/status-dot";
import { formatRelativeTime } from "@/lib/utils";
import { listProviderDefinitions } from "@/lib/integrations/registry";
import { listIntegrations } from "@/lib/integrations/store";
import {
  providerKindLabel,
  sdlcStageDescription,
  sdlcStageLabel,
  sdlcStageOrder,
  type SdlcStage,
} from "@/lib/integrations/types";
import { DeleteIntegrationButton } from "./DeleteIntegrationButton";
import { TestIntegrationButton } from "./TestIntegrationButton";
import { getT } from "@/lib/i18n/server";
import { requirePermission } from "@/lib/auth";

export const dynamic = "force-dynamic";

const stageIcon: Record<SdlcStage, React.ElementType> = {
  plan: ListTodo,
  code: Code2,
  build: Hammer,
  test: TestTube2,
  release: Rocket,
  operate: Activity,
  observe: Eye,
  feedback: MessageSquare,
  security: ShieldCheck,
};

export default async function IntegrationsPage() {
  await requirePermission("integrations:view");
  const { t } = await getT();
  const defs = listProviderDefinitions();
  const configs = await listIntegrations();
  const defByKey = new Map(defs.map((d) => [d.key, d]));

  const defsByStage = new Map<SdlcStage, typeof defs>();
  for (const stage of sdlcStageOrder) defsByStage.set(stage, []);
  for (const def of defs) {
    defsByStage.get(def.sdlcStage)?.push(def);
  }

  const activeStages = new Set<SdlcStage>();
  for (const c of configs) {
    if (!c.enabled) continue;
    const def = defByKey.get(c.providerKey);
    if (def) activeStages.add(def.sdlcStage);
  }
  const coverageCount = activeStages.size;
  const coverageTotal = sdlcStageOrder.length;
  const coveragePct = Math.round((coverageCount / coverageTotal) * 100);

  return (
    <div className="space-y-6">
      <PageHeader
        title={t.pages.integrations.title}
        description={t.pages.integrations.description}
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
                    <Badge variant={c.enabled ? "success" : "outline"} className="gap-1">
                      {c.enabled ? <CheckCircle2 className="h-3 w-3" /> : <XCircle className="h-3 w-3" />}
                      {c.enabled ? "Připojeno" : "Vypnuto"}
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
          <CardTitle>Pokrytí SDLC</CardTitle>
          <p className="text-xs text-muted-foreground">
            Kolik fází životního cyklu má napojenou alespoň jednu aktivní integraci.
          </p>
        </CardHeader>
        <CardContent className="space-y-3 pt-0">
          <div className="flex items-center gap-3">
            <div className="h-2 flex-1 overflow-hidden rounded-full bg-muted">
              <div
                className="h-full rounded-full bg-[hsl(var(--status-ok))] transition-all"
                style={{ width: `${coveragePct}%` }}
                aria-hidden
              />
            </div>
            <span className="font-mono text-xs tabular-nums text-muted-foreground">
              {coverageCount}/{coverageTotal} fází · {coveragePct} %
            </span>
          </div>
          <div className="grid grid-cols-3 gap-2 sm:grid-cols-9">
            {sdlcStageOrder.map((stage) => {
              const Icon = stageIcon[stage];
              const isActive = activeStages.has(stage);
              return (
                <a
                  key={stage}
                  href={`#stage-${stage}`}
                  className={
                    "flex flex-col items-center gap-1 rounded-md border px-2 py-2 text-center text-[11px] transition-colors " +
                    (isActive
                      ? "border-[hsl(var(--status-ok))]/40 bg-[hsl(var(--status-ok))]/10 text-foreground"
                      : "border-border text-muted-foreground hover:border-accent hover:bg-accent/40")
                  }
                  title={sdlcStageDescription[stage]}
                >
                  <Icon className="h-4 w-4" />
                  <span className="truncate font-medium">{sdlcStageLabel[stage]}</span>
                </a>
              );
            })}
          </div>
        </CardContent>
      </Card>

      <div className="space-y-4">
        <div>
          <h2 className="text-lg font-semibold tracking-tight">Poskytovatelé podle fáze SDLC</h2>
          <p className="text-xs text-muted-foreground">
            Vyber typ, který chceš napojit. MVP umí reálně GitHub; ostatní slouží jako mock adaptery vůči
            fixturám a ilustrují, jak bude UI vypadat po rozšíření.
          </p>
        </div>

        {sdlcStageOrder.map((stage) => {
          const stageDefs = defsByStage.get(stage) ?? [];
          if (stageDefs.length === 0) return null;
          const Icon = stageIcon[stage];
          const stageActiveCount = configs.filter((c) => {
            const def = defByKey.get(c.providerKey);
            return c.enabled && def?.sdlcStage === stage;
          }).length;

          return (
            <Card key={stage} id={`stage-${stage}`} className="scroll-mt-24">
              <CardHeader className="flex-row items-start justify-between gap-3 space-y-0">
                <div className="flex items-start gap-3">
                  <div className="rounded-md border border-border bg-muted/40 p-2">
                    <Icon className="h-4 w-4" />
                  </div>
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      {sdlcStageLabel[stage]}
                      {stageActiveCount > 0 ? (
                        <Badge variant="success">{stageActiveCount} aktivní</Badge>
                      ) : (
                        <Badge variant="outline">žádný aktivní</Badge>
                      )}
                    </CardTitle>
                    <p className="mt-1 text-xs text-muted-foreground">
                      {sdlcStageDescription[stage]}
                    </p>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-3">
                  {stageDefs.map((def) => (
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
                        {configs.some(c => c.enabled && c.providerKey === def.key) && (
                          <Badge variant="success" className="gap-1">
                            <CheckCircle2 className="h-3 w-3" />
                            Připojeno
                          </Badge>
                        )}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {providerKindLabel[def.kind]}
                      </div>
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
          );
        })}
      </div>
    </div>
  );
}
