import { NextResponse } from "next/server";
import { healthChecks, computeOverallUptime, computeAverageLatency } from "@/data/health-checks";
import { testRuns } from "@/data/test-runs";
import { deployments } from "@/data/deployments";
import { errorSummaries } from "@/data/errors";
import { defaultAlertRules } from "@/data/alert-rules";
import { processAlerts } from "@/lib/alerts-engine";
import type { MetricValues } from "@/lib/alerts-engine";
import { logger } from "@/lib/logger";
import { withTiming } from "@/lib/request-timing";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  return withTiming("cron.health_check", async () => {
    try {
      const authHeader = req.headers.get("authorization");
      const cronSecret = process.env.CRON_SECRET;
      if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
      }

      const ok = healthChecks.filter((h) => h.status === "ok").length;
      const warn = healthChecks.filter((h) => h.status === "warn").length;
      const down = healthChecks.filter((h) => h.status === "down").length;
      const summary = { ok, warn, down, total: healthChecks.length, checkedAt: new Date().toISOString() };

      // Compute metrics for alert evaluation
      const totalDeploys = deployments.length;
      const failedDeploys = deployments.filter((d) => d.status === "failed").length;
      const flakyTests = testRuns.reduce((a, r) => a + r.flaky, 0);
      const totalErrors = errorSummaries.reduce((a, e) => a + e.count24h, 0);
      const totalChecks = healthChecks.length;

      const metrics: MetricValues = {
        latency: computeAverageLatency(),
        errorRate: totalChecks > 0 ? (totalErrors / totalChecks) : 0,
        uptime: computeOverallUptime(),
        deployFailRate: totalDeploys > 0 ? (failedDeploys / totalDeploys) * 100 : 0,
        flakyTests,
      };

      await processAlerts(defaultAlertRules, metrics);

      logger.info("cron.health_check", summary);
      return NextResponse.json(summary);
    } catch (err) {
      logger.error("cron.health_check.error", { error: String(err) });
      return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
  });
}
