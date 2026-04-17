import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { StatusDot } from "@/components/ui/status-dot";
import { formatDuration, formatRelativeTime } from "@/lib/utils";
import type { TestRun } from "@/lib/types";

const suiteLabel: Record<TestRun["suite"], string> = {
  unit: "Unit",
  integration: "Integrace",
  e2e: "E2E",
  smoke: "Smoke",
  load: "Zátěž",
};

export function TestRunRow({ run, appName }: { run: TestRun; appName?: string }) {
  const total = run.passed + run.failed;
  const pass = total === 0 ? 100 : Math.round((run.passed / total) * 100);
  return (
    <Link
      href={run.reportUrl}
      target="_blank"
      rel="noreferrer"
      className="flex items-center gap-3 rounded-md border border-transparent px-2 py-2 text-sm hover:border-border hover:bg-accent/40"
    >
      <StatusDot status={run.status} />
      <span className="w-20 font-medium">{suiteLabel[run.suite]}</span>
      {appName ? <span className="w-24 truncate text-muted-foreground">{appName}</span> : null}
      <span className="font-mono text-xs tabular-nums">
        {run.passed}/{total}
      </span>
      {run.flaky > 0 ? <Badge variant="warning">{run.flaky} flaky</Badge> : null}
      {run.coveragePct != null ? (
        <Badge variant="outline">{run.coveragePct}% coverage</Badge>
      ) : null}
      <span className="ml-auto text-xs text-muted-foreground">
        {formatDuration(run.durationSec)} · {formatRelativeTime(run.runAt)}
      </span>
      <span className="hidden text-xs text-muted-foreground sm:inline">·</span>
      <span className="hidden font-medium text-xs sm:inline">{pass} %</span>
    </Link>
  );
}
