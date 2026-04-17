import { PageHeader } from "@/components/dashboard/PageHeader";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { StatusDot } from "@/components/ui/status-dot";
import { Badge } from "@/components/ui/badge";
import { applications } from "@/data/applications";
import { environments } from "@/data/environments";
import { testRuns } from "@/data/test-runs";
import type { TestSuite } from "@/lib/types";

const suites: TestSuite[] = ["unit", "integration", "e2e", "smoke", "load"];
const suiteLabel: Record<TestSuite, string> = {
  unit: "Unit",
  integration: "Integrace",
  e2e: "E2E",
  smoke: "Smoke",
  load: "Zátěž",
};

export default function TestsPage() {
  const envs = [...environments].sort((a, b) => a.order - b.order);
  const testsByKey = new Map<string, (typeof testRuns)[number]>();
  for (const run of testRuns) {
    testsByKey.set(`${run.appId}:${run.envId}:${run.suite}`, run);
  }
  return (
    <div className="space-y-6">
      <PageHeader
        title="Testy"
        description="Matice pass/fail pro každou aplikaci, prostředí a test suite."
      />
      {envs.map((env) => (
        <Card key={env.id}>
          <CardHeader className="flex-row items-center justify-between">
            <CardTitle>
              Prostředí: <span className="font-mono">{env.name}</span>
            </CardTitle>
            {env.isProduction ? <Badge variant="info">prod</Badge> : null}
          </CardHeader>
          <CardContent className="overflow-x-auto pt-0">
            <table className="w-full min-w-[640px] text-sm">
              <thead>
                <tr className="text-left text-xs uppercase tracking-wide text-muted-foreground">
                  <th className="w-36 pb-2 font-medium">Aplikace</th>
                  {suites.map((s) => (
                    <th key={s} className="px-2 pb-2 font-medium">
                      {suiteLabel[s]}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {applications
                  .filter((a) => a.environmentIds.includes(env.id))
                  .map((app) => (
                    <tr key={app.id} className="border-t border-border/60">
                      <td className="py-3 pr-4 font-medium">{app.name}</td>
                      {suites.map((s) => {
                        const run = testsByKey.get(`${app.id}:${env.id}:${s}`);
                        return (
                          <td key={s} className="px-2 py-3">
                            {run ? (
                              <div className="flex items-center gap-2 text-xs">
                                <StatusDot status={run.status} />
                                <span className="font-mono tabular-nums">
                                  {run.passed}/{run.passed + run.failed}
                                </span>
                                {run.flaky > 0 ? (
                                  <Badge variant="warning" className="gap-1">
                                    {run.flaky} flaky
                                  </Badge>
                                ) : null}
                              </div>
                            ) : (
                              <span className="text-xs text-muted-foreground/60">—</span>
                            )}
                          </td>
                        );
                      })}
                    </tr>
                  ))}
              </tbody>
            </table>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
